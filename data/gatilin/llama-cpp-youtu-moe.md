# gatilin/llama.cpp-youtu-moe

## Resumen
`gatilin/llama.cpp-youtu-moe` no es un modelo de lenguaje, sino un parche de inferencia para llama.cpp que añade soporte a la arquitectura `youtu-moe` del modelo `tencent/Youtu-LLM-A7B-Base`, incluyendo tanto la torre de texto como la de visión. Lo publica el usuario gatilin sobre el commit `e0f142d5ddc1461ce721644d92af33db23545105` de llama.cpp y se acompaña de pesos GGUF ya convertidos en un repositorio aparte. Es relevante porque permite ejecutar en local (verificado en macOS con Metal) un modelo MoE híbrido de aproximadamente 120B parámetros totales y 7B activos que, de otro modo, no tendría soporte en el ecosistema GGUF.

El modelo base, Youtu-LLM-A7B, combina atención lineal KDA con capas GatedMLA en un patrón 3:1, un MoE de 256 expertos enrutados con top-8 y una torre visual estilo Qwen3-VL-MoE. El parche resuelve el problema práctico de la conversión HF a GGUF (converter propio, mapeo de claves del proyector visual, exportación de `mmproj`) y documenta los escollos numéricos encontrados, especialmente la incompatibilidad entre el layout RoPE oficial y el que impone ggml.

Para un desarrollador, el interés está en la ingeniería de conversión y en la posibilidad de desplegar un modelo multimodal de contexto muy largo con llama.cpp, cuantizado a Q4_K_M en torno a 66 GiB. No hay métricas de calidad publicadas en la información disponible, así que la evaluación debe hacerse por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida KDA (atención lineal) + GatedMLA, MoE con 256 expertos enrutados (top-8) + 1 experto compartido; torre visual Qwen3-VL-MoE |
| Parametros totales | ~120B (modelo base) |
| Parametros activos | ~7B |
| Longitud de contexto | 262144 tokens |
| Tipos de cuantizacion | BF16 (GGUF), Q4_K_M; el pipeline de `llama-quantize` permite otras cuantizaciones GGUF |
| Idiomas soportados | no disponible |
| Licencia | `youtu-llm` (etiquetada como `other` en el repo del parche) |
| Formato de pesos | GGUF (BF16, Q4_K_M) y safetensors del modelo base; `mmproj` separado en F16 para visión |

## Arquitectura y entrenamiento
El modelo base tiene 48 capas, dimensión oculta 3072 y vocabulario de 129280 tokens. La atención es híbrida: tres capas KDA (atención lineal recurrente, reutilizando la ruta gated-delta-net de llama.cpp con estado convolucional y SSM, q/k normalizados en L2 y cota inferior de puerta de −5.0) seguidas de una capa GatedMLA de estilo DeepSeek, repetidas 12 veces. La MLA usa `q_lora_rank=1024`, `kv_lora_rank=512`, `qk_nope_head_dim=128`, `qk_rope_head_dim=64`, `v_head_dim=128` y una puerta de salida por cabeza de forma `[32, 3072]` aplicada tras la proyección de salida de atención.

El MoE tiene 256 expertos enrutados con top-8, SwiGLU, anchura 1024 y un experto compartido; la capa 0 es un FFN denso de 12288. El enrutamiento es de equilibrado por cuantiles con un sesgo de experto dependiente de modalidad (`qb_beta`, forma `[2, 256]`: fila 0 texto, fila 1 imagen/vídeo), de modo que la selección es `router_logits - qb_beta[modality]` y los pesos se normalizan con sigmoide y se escalan por 2.83. La torre visual sigue el esquema Qwen3-VL-MoE (ViT más merger, `clip.projector_type=qwen3vl_merger`) y se exporta como `mmproj` independiente. El entrenamiento declarado cubre 11.5T tokens multimodales con ventana de 262144 tokens; no se detallan en la información disponible la composición del dataset ni si hubo RLHF o DPO.

El parche incluye innovaciones de implementación notables: un conversor HF→GGUF propio, un helper `build_inp_mem_hybrid_k()` para caché KV híbrida KDA+MLA, contabilidad de estado recurrente y una permutación de pesos en conversión para reconciliar el layout RoPE. Esta permutación reduce el error por elemento frente a la implementación oficial de 1.33 (relativo, sin permutar) a 1e-16.

## Capacidades
- Generación de texto y razonamiento en el modelo base, con ventana de contexto de 262144 tokens.
- Inferencia multimodal imagen-texto verificada de extremo a extremo mediante `llama-mtmd-cli` y el `mmproj` exportado.
- Soporte de prompt con marcadores explícitos `<|vision_start|><__media__><|vision_end|>` para inyectar imágenes; el `chat_template.jinja` del modelo base no tiene rama de imagen, por lo que `--jinja` no basta.
- Conversión y cuantización reproducibles: script `convert_youtu.sh` idempotente de 7 pasos (verificación de integridad, exportación de mmproj, GGUF BF16, autochequeo de metadatos, cuantización Q4_K_M, prueba de humo de texto y de visión).
- Compatibilidad con `llama-cli`, `llama-server`, `llama-mtmd-cli` y `llama-quantize`.
- Tool calling, agentes, modo thinking y otras capacidades del modelo base: no disponibles en la información proporcionada.
- Idiomas: no disponibles.

## Casos de uso
- Despliegue local de un modelo multimodal de gran contexto: con 262144 tokens de ventana y Q4_K_M de 66 GiB, se puede servir en una estación de trabajo con suficiente VRAM/RAM unificada para analizar documentos largos con imágenes intercaladas.
- Procesamiento de documentos escaneados con descripción visual: usando `llama-mtmd-cli` con el `mmproj` F16 de 867 MiB, se pueden pasar imágenes y pedir descripciones o extracción de contenido, útil en digitalización de archivos.
- Prototipado en macOS con Metal: el parche está verificado en macOS/Metal, lo que permite a equipos con hardware Apple validar el modelo antes de invertir en GPUs de datacenter.
- Investigación sobre atención híbrida: la implementación de la caché KV híbrida KDA+MLA en llama.cpp sirve como referencia para experimentar con arquitecturas lineales recurrentes combinadas con atención completa.
- Evaluación comparativa de MoE con enrutamiento por cuantiles: el sesgo de experto dependiente de modalidad permite estudiar cómo se reparte la carga entre expertos en texto frente a imagen.
- Servicio de chat con contexto largo en `llama-server`: al exponer una API compatible con OpenAI, se puede integrar en aplicaciones internas que necesiten resumir o consultar corpus extensos.
- Reproducibilidad de conversiones GGUF: el conversor y el script de 7 pasos sirven de plantilla para portar otras arquitecturas híbridas a llama.cpp.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta verificaciones numéricas de corrección de la implementación: error por elemento de 1e-16 tras la permutación RoPE frente a 1.33 sin ella, y confirmación de inferencia de texto y visión de extremo a extremo sobre los pesos reales de 120B en macOS/Metal.

## Requisitos de hardware
- Pesos BF16: 220 GiB en 1090 tensores; la conversión exige `--use-temp-file` para no agotar la RAM (el autor indica que sin él un modelo de 220 GiB hace OOM en una máquina de 128 GiB).
- Pesos Q4_K_M: 66 GiB, la opción práctica para inferencia.
- Proyector visual: `youtu-vl-mmproj-f16.gguf`, 867 MiB adicionales para tareas de visión.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, Q4_K_M requiere del orden de 66 GiB de memoria, lo que apunta a configuraciones multi-GPU o GPUs de gran memoria. El autor solo verifica macOS/Metal.
- Viabilidad en GPU de consumo: no confirmada; con 66 GiB en Q4_K_M no cabe en una RTX 4090 de 24 GB sin descarga a RAM y penalización fuerte de latencia.
- Opciones de despliegue: llama.cpp con `llama-cli`, `llama-server`, `llama-mtmd-cli` y `llama-quantize`; requiere aplicar el parche y compilar con, por ejemplo, `-DGGML_METAL=ON -DLLAMA_BUILD_SERVER=ON`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Soporte llama.cpp |
|---|---|---|---|---|---|
| Youtu-LLM-A7B (este parche) | ~120B totales / ~7B activos | 262144 | Texto + visión | `youtu-llm` | Sí, mediante este parche |
| DeepSeek-V2/V3 (referencia MLA) | no disponible en la información | no disponible | Texto | no disponible | Parcial (MLA soportada en llama.cpp) |
| Qwen3-VL-MoE (referencia de la torre visual) | no disponible en la información | no disponible | Texto + visión | no disponible | Parcial |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los modelos citados se incluyen solo como referencia arquitectónica (MLA de DeepSeek y merger visual de Qwen3-VL).

## Limitaciones y advertencias
- El repositorio es un parche, no un modelo: su utilidad depende de aplicar correctamente el diff sobre el commit exacto `e0f142d5ddc1461ce721644d92af33db23545105`; otras revisiones pueden no aplicar limpiamente.
- La licencia `youtu-llm` está etiquetada como `other`: es imprescindible revisar los términos del modelo base antes de cualquier uso comercial.
- El `chat_template.jinja` del modelo base no incluye rama de imagen, por lo que `--jinja` no inyecta el marcador visual; hay que enviar el prompt en crudo con `<|vision_start|><__media__><|vision_end|>` y no añadir `<|image_pad|>`.
- El layout RoPE oficial no coincide con el NEOX forzado por ggml; sin la permutación de pesos en conversión la salida es basura (error relativo 1.33).
- Las secciones mrope deben configurarse como `[11, 10, 10, 0]` y no como el `[12, 10, 10]` del config oficial, según la nota del autor.
- El autor documenta residuos de `</think>` como escollo de depuración, lo que sugiere posibles artefactos en la generación si no se gestionan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- No hay datos publicados de sesgos, tasas de alucinación ni cobertura idiomática.
- El tamaño BF16 (220 GiB) y el Q4_K_M (66 GiB) limitan el despliegue a infraestructura con mucha memoria; no es apto para GPUs de consumo sin descarga a RAM.

## Enlaces
- Repositorio del parche: https://huggingface.co/gatilin/llama.cpp-youtu-moe
- Pesos GGUF: https://huggingface.co/gatilin/Youtu-LLM-A7B-Base-GGUF
- Modelo base: https://huggingface.co/tencent/Youtu-LLM-A7B-Base
- llama.cpp: https://github.com/ggml-org/llama.cpp
