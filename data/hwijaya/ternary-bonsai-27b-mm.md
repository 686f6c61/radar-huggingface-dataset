# hwijaya/Ternary-Bonsai-27B-MM

## Resumen

Ternary-Bonsai-27B-MM es un checkpoint multimodal derivado de la familia Ternary Bonsai, una ternarización del modelo Qwen3.8-27B realizada por Prism ML. El autor de este repositorio, hwijaya, ha empaquetado el modelo ternario junto con la torre de visión oficial (projector y ViT) para que pueda servirse en vLLM mediante el plugin de cuantización `prism_ternary`, algo que no existía públicamente hasta esta publicación. El problema que resuelve es concreto: las dos distribuciones públicas del modelo ternario para vLLM eran solo texto, porque el conversor descartaba todos los tensores `model.visual.*` y el comando de servicio forzaba `--language-model-only`.

El checkpoint combina los shards ternarios ya validados del LLM (64 capas más MTP, 1267 tensores, aproximadamente 10,24 GB a 1,78 bits por peso) con la torre de visión en BF16 procedente del modelo oficial sin cuantizar (333 tensores, 0,92 GB), sumando unos 11,17 GB en 1600 tensores. La arquitectura declarada es `Qwen3_5ForConditionalGeneration` con un ViT de 27 capas y dimensión oculta 1152. El interés actual es que permite ejecutar un modelo de ~27B con visión y contexto de 262.144 tokens en una sola GPU de consumo Blackwell (RTX 5090 de 32 GB), con decodificación especulativa MTP activa.

La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con cuantizacion ternaria, `Qwen3_5ForConditionalGeneration`, LLM de 64 capas + MTP y ViT de 27 capas (hidden 1152) |
| Parametros totales | 3.982.951.152 (segun safetensors del repo); el nombre comercial indica 27B, discrepancia no aclarada en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (verificado en el comando de servicio) |
| Tipos de cuantizacion | Ternaria 1,78 bpw (codigos de 2 bits + escala FP16 cada 128) para el LLM; BF16 para la torre de vision; variantes Q2_0 y Q1_0 mencionadas en las mediciones |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 11,2 GB, libreria vllm) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 64 capas (heredero de Qwen3.8-27B) cuyos pesos lineales han sido ternarizados a 1,78 bits por peso: códigos de 2 bits acompañados de una escala FP16 por cada bloque de 128. La torre de visión se mantiene deliberadamente en BF16 porque representa una fracción pequeña del total de pesos, los pesos ViT no cuantizan con la misma limpieza que los lineales del LLM y el cuantizador de `prism_ternary` excluye las capas de visión por diseño. El config declara `language_model_only: false`, incluye `vision_config` y los IDs de tokens de imagen y vídeo.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el propio pipeline de empaquetado: se reutilizan byte a byte los shards ternarios ya validados para vLLM (sin re-ejecutar el conversor, que requiere el modelo base de 54 GB y una GPU) y se les añaden los 333 tensores `model.visual.*` extraídos del checkpoint oficial `prism-ml/Ternary-Bonsai-27B-unpacked`. El runtime incorpora decodificación especulativa MTP con 7 tokens especulativos, activa por defecto en la imagen Docker y verificada en combinación con visión.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo thinking configurable (`enable_thinking`).
- Comprensión de imágenes: entrada image-text-to-text mediante torre ViT en BF16.
- Soporte de tool calling y function calling, con parser `qwen3_coder` y auto tool choice.
- Razonamiento multi-paso y uso como agente, con parser de razonamiento `qwen3`.
- Contexto largo de 262.144 tokens, con prefix caching y chunked prefill.
- Decodificación especulativa MTP (7 tokens) para acelerar la generación.
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Soporte de vídeo a través de los IDs de tokens de vídeo del config (no verificado en la model card).

## Casos de uso

- Asistente multimodal sobre documentos escaneados: el modelo recibe imágenes de páginas y texto en una misma conversación, aprovechando el contexto de 262.144 tokens para procesar lotes completos de documentos sin fragmentar.
- Análisis de capturas de pantalla en herramientas de soporte: con tool calling y parser `qwen3_coder`, puede inspeccionar una imagen de interfaz y emitir llamadas a funciones para consultar estado o abrir tickets.
- Agentes de automatización con razonamiento multi-paso: el modo thinking y el parser `qwen3` permiten cadenas de razonamiento explícitas antes de invocar herramientas, útil en pipelines de operaciones.
- Despliegue en estación de trabajo con una sola GPU: al ocupar unos 11,17 GB de pesos, cabe en una RTX 5090 de 32 GB y permite dos sesiones concurrentes a contexto completo, adecuado para prototipado local de producto.
- Procesamiento de vídeo o secuencias de imágenes con contexto largo: los IDs de tokens de vídeo del config habilitan tareas de descripción o seguimiento sobre clips, aunque la model card no aporta métricas de calidad en vídeo.
- Evaluación de cuantización ternaria en producción: sirve como banco de pruebas para medir la degradación de un modelo de ~27B a 1,78 bpw frente a su versión Q8, con resultados reportados de 16/17 frente a 17/17 en una batería de 17 prompts.
- Servicio de chat con contexto masivo y caché: con `--kv-cache-dtype fp8_e4m3`, prefix caching y chunked prefill, encaja en escenarios de conversaciones largas con reutilización de prefijo, como asistentes sobre bases de código o manuales extensos.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| Bateria objetiva de 17 prompts (greedy) | 17/17 (Q8 base), 16/17 (ternario 2-bit Q2_0), 15/17 (ternario 1-bit Q1_0) | M4 Max Metal; fallo de Q2_0 en un problema de palabras de 2 pasos; Q1_0 falla en aritmetica multi-paso y un acertijo "all but N" |
| Decodificacion single-stream | ~15 t/s (Q8), ~33 t/s (Q2), ~50 t/s (Q1) | M4 Max, 422 GB/s de ancho de banda |
| Decodificacion / prefill / TTFT en RTX 5090 | no disponible (la model card deja las filas como "FILL AFTER RUN") | RTX 5090 32 GB |
| Concurrencia agregada en RTX 5090 | no disponible (pendiente de rellenar por el autor) | RTX 5090 32 GB |
| Precision en vision | no disponible (pendiente de rellenar por el autor) | RTX 5090 32 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks estandar en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos suman unos 11,17 GB (10,24 GB del LLM ternario más 0,92 GB de visión en BF16); el consumo real depende del KV cache, configurado con `--gpu-memory-utilization 0.95`.
- GPU verificada: RTX 5090 (32 GB, GB202), con dos sesiones concurrentes a contexto completo de 262.144 tokens.
- GPU de referencia del plugin: RTX PRO 6000 Blackwell; se requiere NVIDIA Blackwell (sm_120) para los kernels CUDA personalizados. Otras GPU no están probadas.
- No cabe en GPU de consumo anteriores a Blackwell según la información disponible, al requerir sm_120.
- Despliegue: vLLM 0.25.x con el plugin `fraserprice/bonsai-vllm` (imagen Docker `fraserpricee/bonsai-vllm:20260918` o instalación desde el repositorio de GitHub). No se mencionan soportes de llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Contexto y concurrencia: con 262.144 tokens se obtienen 2 sesiones concurrentes a contexto completo en una 5090; con `--max-model-len 16384` se reportan aproximadamente 26 sesiones concurrentes.
- Throughput: solo se dispone de las cifras de decodificación en M4 Max (~33 t/s en Q2, ~50 t/s en Q1); las métricas de la 5090 quedan pendientes en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-27B-MM (este) | 3.982.951.152 segun safetensors; ~27B nominales | 262.144 | Si (ViT BF16) | Apache 2.0 | vLLM con plugin `prism_ternary`, GPU Blackwell |
| fraserprice/Ternary-Bonsai-2-27B-vllm | ~27B nominales | no disponible | No (solo texto) | no disponible en la informacion | vLLM con plugin `prism_ternary` |
| prism-ml/Ternary-Bonsai-27B-unpacked | ~27B nominales | no disponible | Si (BF16 sin ternarizar) | no disponible en la informacion | Pesos sin empaquetar para vLLM |
| Qwen3.8-27B (modelo base, referencia) | ~27B | no disponible | no disponible | no disponible en la informacion | Formato original |

La comparativa con modelos de otras familias (por ejemplo, alternativas densas de ~27B en BF16 o cuantizaciones GGUF de 4 bits) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara inglés; no hay evidencia de calidad multilingüe.
- La cuantización ternaria degrada el razonamiento aritmético multi-paso: el 2-bit falla 1 de 17 prompts y el 1-bit falla 2 de 17 en la batería del autor.
- Los kernels CUDA requieren NVIDIA Blackwell (sm_120); el resto de GPU no están probadas y el modelo no arrancará con el plugin en arquitecturas anteriores.
- El comando de servicio por defecto de la imagen Docker apunta al checkpoint solo texto y fuerza `--language-model-only`; es obligatorio sobrescribir el entrypoint para habilitar visión.
- Las métricas de rendimiento y precisión en RTX 5090 (decode, prefill, TTFT, concurrencia, precisión de visión) están sin publicar en la model card.
- Existe una discrepancia entre el nombre comercial (27B) y el recuento real de parámetros en safetensors (3.982.951.152), no aclarada por el autor; conviene verificar antes de dimensionar infraestructura.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad factual en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado el mismo día de la consulta; no hay validación independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base (`prism-ml/Ternary-Bonsai-27B-unpacked`, `fraserprice/Ternary-Bonsai-2-27B-vllm`) no se detallan en la información disponible y deberían comprobarse antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hwijaya/Ternary-Bonsai-27B-MM
- Modelo base sin empaquetar: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-unpacked
- Repack ternario solo texto para vLLM: https://huggingface.co/fraserprice/Ternary-Bonsai-2-27B-vllm
- Plugin de cuantización y kernels CUDA: https://github.com/fraserprice/bonsai-vllm
