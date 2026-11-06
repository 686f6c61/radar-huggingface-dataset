# capyctl/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantizacion en formato NVFP4 del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario capyctl. El checkpoint aplica NVFP4 (W4A4, grupo de 16) a todas las capas lineales grandes del modelo de lenguaje mediante NVIDIA Model Optimizer 0.47.0: MLP, `lm_head`, proyecciones de atencion q/k/v/o y las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` de Gated DeltaNet. La diferencia clave frente a la version de NVIDIA (`nvidia/Qwen3.8-27B-NVFP4`) es que esta ultima mantiene las proyecciones de atencion y DeltaNet en FP8, mientras que aqui tambien se cuantizan a NVFP4.

El objetivo es reducir el ancho de banda de memoria necesario para la decodificacion, que en regimen de un solo stream esta limitada por la lectura de pesos. Este checkpoint lee 14,45 GB por token frente a los 17,61 GB de la version de NVIDIA, lo que se traduce en mejoras medidas de throughput de entre el 10% y el 23% segun motor y configuracion.

El modelo conserva la cabeza MTP en BF16 para permitir decodificacion especulativa, y se distribuye bajo licencia Apache 2.0. Esta pensado para despliegue en hardware Blackwell con soporte NVFP4, particularmente en configuraciones de un solo dispositivo como NVIDIA GB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet y atencion (base Qwen3.8-27B), segun los nombres de capas descritos (64 capas MLP, 48 capas DeltaNet, 16 capas de atencion) |
| Parametros totales | 14.557.547.760 (14,56 mil millones, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) en capas lineales grandes; BF16 en embeddings, `in_proj_a/b`, `conv1d`, `A_log`, `dt_bias`, normas, vision tower y cabeza MTP; KV cache sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato ModelOpt NVFP4), libreria transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina capas de atencion clasica con capas de Gated DeltaNet, un mecanismo de estado lineal recurrente. La cuantizacion se realizo con ModelOpt 0.47.0 mediante el script `examples/hf_ptq/hf_ptq.py` y la receta `qwen3_5-nvfp4_all_linear-kv_none.yaml`, con calibracion en modo `max` sobre 512 conversaciones de hasta 1024 tokens (256 de `HuggingFaceH4/ultrachat_200k` y 256 de `ise-uiuc/Magicoder-OSS-Instruct-75K`, ambas MIT). Posteriormente se audito el formato de cada tensor.

El desglose de pesos es el siguiente: MLP gate/up/down en 64 capas ocupa 9,63 GB en NVFP4; DeltaNet qkv/z/out en 48 capas ocupa 3,17 GB en NVFP4 (frente a 5,59 GB en FP8 de la version de NVIDIA); atencion q/k/v/o en 16 capas ocupa 0,94 GB en NVFP4 (frente a 1,68 GB); `lm_head` ocupa 0,72 GB en NVFP4. El resto en BF16 suma 4,31 GB y el checkpoint completo ocupa 18,77 GB en disco. El repositorio incluye `conversion-manifest.json` con la revision de origen, versiones de herramientas y SHA-256 de la receta, el conjunto de calibracion y el conversor. No se describe en la informacion disponible si hubo entrenamiento adicional, RLHF o DPO; se trata exclusivamente de una cuantizacion post-entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (`image-text-to-text`): incluye vision tower en BF16, por lo que mantiene capacidad multimodal.
- Tool calling / function calling: validado con 30 casos de prueba, con 30/30 aciertos.
- Modo thinking: las mediciones se realizaron con thinking activado, y el modelo soporta su desactivacion.
- Decodificacion especulativa: conserva la cabeza MTP en BF16 para que los motores de inferencia puedan generar borradores.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Razonamiento matematico: 98,3% en GSM8K segun las mediciones del autor.

## Casos de uso

- Servicio de chat multimodal en un solo dispositivo: el checkpoint cabe en 18,77 GB en disco y se sirve con 51,2 GiB de memoria pico en vLLM sobre GB10, lo que permite desplegar un asistente con vision y texto en hardware compacto.
- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con tool calling fiable (30/30 en las pruebas), adecuado para integraciones con sistemas de ticketing o CRM mediante function calling.
- Despliegue de alto throughput en produccion: con SGLang 0.5.22 y DFlash2 alcanza 166 tokens/s con 8 streams y 329 tokens/s con 32 streams, apropiado para servir a multiples usuarios concurrentes en una sola GPU.
- Generacion de codigo asistida: la calibracion incluye 256 conversaciones de Magicoder-OSS-Instruct, lo que preserva el comportamiento en tareas de programacion; util para autocompletado o revision de codigo.
- Razonamiento matematico verificado: 98,3% en GSM8K con respuestas limitadas a 2048 tokens, adecuado para tutoria o resolucion de problemas paso a paso.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio de comparaciones incluye mediciones frente a las builds de NVIDIA, gittensor, QUASAR, RedHatAI, unsloth, el modelo BF16 y EXL3 de MiaAI-Lab, util como referencia para equipos que eligen formato de cuantizacion.
- Prototipado e investigacion en hardware Blackwell: al requerir NVFP4, sirve para validar pipelines de inferencia en GPUs de nueva generacion con vLLM 0.32.0 o SGLang 0.5.22.

## Benchmarks y rendimiento

Mediciones del autor en una NVIDIA GB10, via CapyCTL 0.1.10, `temperature: 0`, thinking activado, 512 tokens de salida:

| Receta | 1 stream | 8 streams | 32 streams | Memoria pico |
|---|---|---|---|---|
| vLLM 0.32.0 con DFlash2 | 35,3 tok/s | 187 tok/s | 390 tok/s (KV cache 32 GiB) | 51,2 GiB |
| SGLang 0.5.22 con DFlash2 | 36,3 tok/s | 166 tok/s | 329 tok/s (peticion 94 GiB) | 58,1 GiB |

Comparacion directa con `nvidia/Qwen3.8-27B-NVFP4`:

| Configuracion | Este checkpoint | NVIDIA | Mejora |
|---|---|---|---|
| vLLM 0.32.0 + DFlash2, 1 / 8 streams | 35,7 / 181 tok/s | 29,0 / 160 tok/s | +23% / +13% |
| SGLang 0.5.22 + DFlash2, 1 / 8 streams | 35,2 / 166 tok/s | 30,4 / 150 tok/s | +16% / +10% |
| SGLang 0.5.22 sin borradores, 1 / 8 streams | 14,9 / 101 tok/s | 12,5 / 85,9 tok/s | +19% / +18% |
| GSM8K (250 preguntas, 2048 tokens) | 98,3% | 98,4% | -0,1 pp |
| Tool calls (30 casos) | 30/30 | 30/30 | igual |

El modelo BF16 de origen obtiene 98,3% en GSM8K, y las recetas tal como se distribuyen obtienen 98,3% (vLLM) y 98,0% (SGLang). No se han publicado resultados de MMLU, HumanEval u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint ocupa 18,77 GB en disco y lee 14,45 GB por token en decodificacion de un solo stream. La memoria pico medida es de 51,2 GiB en vLLM y 58,1 GiB en SGLang, incluyendo KV cache.
- GPU recomendadas: NVIDIA GB10 (unica hardware donde se han publicado mediciones). Requiere GPU con soporte de NVFP4 (generacion Blackwell); no se documenta funcionamiento en A100, H100 ni RTX 4090.
- Consumer GPU: no disponible; el formato NVFP4 no es compatible con GPUs anteriores a Blackwell, por lo que no se puede confirmar su uso en tarjetas de consumo.
- Opciones de despliegue: vLLM 0.32.0 y SGLang 0.5.22, ambas medidas con el checkpoint. Soporte de llama.cpp, Ollama o TGI no disponible.
- Decodificacion especulativa: recomendado usar el drafter `z-lab/Qwen3.8-27B-DFlash2` (revision 50307d4c4cde6860d4eee73e2547cd786fe8e8a4) para alcanzar los valores de throughput reportados; sin borradores el rendimiento baja a 14,9 tok/s en un stream.
- Latencia y throughput: 35,3 tok/s (1 stream, vLLM + DFlash2) y hasta 390 tok/s agregados con 32 streams y KV cache de 32 GiB.
- Herramienta de despliegue: CapyCTL 0.1.10 con recetas para vLLM y SGLang, o despliegue manual cargando el checkpoint en los motores mencionados.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Lectura por token | Rendimiento (vLLM, 1/8 streams) | Licencia |
|---|---|---|---|---|---|
| capyctl/Qwen3.8-27B-NVFP4 | 14,56 mil M | NVFP4 en todas las lineales grandes | 14,45 GB | 35,7 / 181 tok/s | Apache 2.0 |
| nvidia/Qwen3.8-27B-NVFP4 | 14,56 mil M | NVFP4 en MLP y lm_head, FP8 en atencion y DeltaNet | 17,61 GB | 29,0 / 160 tok/s | Apache 2.0 |
| gittensor (misma build sin cabeza MTP) | no disponible | NVFP4 mismo esquema | no disponible | similar segun el autor | no disponible |
| Qwen/Qwen3.8-27B (BF16) | 14,56 mil M | BF16 | no disponible | no disponible | Apache 2.0 |

Las builds de QUASAR, RedHatAI, unsloth y EXL3 de MiaAI-Lab se comparan en el repositorio de comparaciones del autor, pero sus cifras concretas no se detallan en la informacion disponible. Para contexto y rendimiento del modelo base, consultar la model card de Qwen/Qwen3.8-27B.

## Limitaciones y advertencias

- Requiere hardware con soporte NVFP4 (Blackwell); no es desplegable en GPUs Ampere, Hopper ni consumer anteriores, lo que limita su portabilidad.
- La cuantizacion W4A4 puede degradar tareas sensibles a precision; la evaluacion publicada se limita a GSM8K y tool calling, sin cobertura de razonamiento complejo, vision o codigo.
- El KV cache no esta cuantizado; para reducir memoria hay que configurar explicitamente un KV cache FP8 en el motor de inferencia.
- Los benchmarks de velocidad se han medido unicamente en una NVIDIA GB10 con vLLM 0.32.0 y SGLang 0.5.22; el rendimiento en otras GPUs o versiones de motor no esta verificado.
- El checkpoint tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y el autor no es el desarrollador original del modelo; auditar el `conversion-manifest.json` antes de usarlo en produccion.
- Sesgos conocidos y riesgo de alucinacion: no documentados especificamente para esta cuantizacion; se heredan los del modelo base Qwen3.8-27B.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y del drafter DFlash2 antes de desplegar.
- La model card esta truncada en el apartado de licencia; no se dispone del texto completo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/capyctl/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio CapyCTL: https://github.com/edurdias/capyctl
- Receta vLLM para GB10: https://github.com/edurdias/capyctl-recipes/tree/main/vllm/qwen3.8-27b-capyctl-nvfp4-gb10
- Receta SGLang para GB10: https://github.com/edurdias/capyctl-recipes/tree/main/sglang/qwen3.8-27b-capyctl-nvfp4-gb10
- Comparacion de builds NVFP4: https://github.com/edurdias/capyctl-recipes/tree/main/comparisons/qwen3.8-27b-nvfp4-builds-gb10
- Documentacion de instalacion de CapyCTL: https://edurdias.github.io/capyctl/docs/install/
- Documentacion de despliegue: https://edurdias.github.io/capyctl/docs/deploy/
- Dataset de calibracion (ultrachat_200k): https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibracion (Magicoder): https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
