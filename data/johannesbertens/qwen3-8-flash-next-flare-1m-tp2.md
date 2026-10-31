# JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2

## Resumen

Qwen3.8-Flash-Next FLARE 1M TP2 es un paquete de inferencia preparado por JohannesBertens (no un checkpoint nuevo) que sirve el modelo **Qwen3.8-Flash-Next** publicado por NVIDIA (`nvidia/Qwen3.8-Flash-Next-FP4-Local`) mediante el runtime local **Flare** de NVIDIA. Su aportación principal es extender la longitud de contexto de servicio desde los 262.144 tokens nativos hasta **1.048.576 tokens (1M)** mediante interpolación YaRN de solo frecuencia (factor 4×, sin cambio de temperatura de atención), integrada en las tablas rotatorias del paquete en tiempo de preparación, sin modificar el checkpoint.

Este repositorio concreto es la variante **TP2 (paralelismo de tensores en 2 GPUs)**, pensada para dos GPUs Blackwell de la misma arquitectura (GB202 / SM120, es decir, RTX PRO 6000 Blackwell). Frente a su hermana TP1 de una sola GPU, ofrece aproximadamente seis veces más caché KV (103,1 GiB, 7.118.848 tokens KV) y cuadruplica la concurrencia (32 peticiones simultáneas), lo que la hace adecuada para servir varias peticiones de contexto 1M a la vez. El pipeline es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto. La decodificación especulativa MTP con 5 tokens de borrador está activa por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con YaRN de solo frecuencia; detalles adicionales no disponibles |
| Parametros totales | no disponible (checkpoint de ~102 GB en formato FP4 descargado durante la preparación) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (262.144 nativos, extendidos con YaRN 4×) |
| Tipos de cuantizacion | NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (other) |
| Formato de pesos | Paquete Flare preparado (packed safetensors, ~112,6 GB); checkpoint base en safetensors FP4 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next en cuantización NVFP4, servido a través del runtime Flare de NVIDIA con el contrato de modelo preparado 2 y el ABI de ejecución 5. La innovación central de este paquete es la extensión de contexto: una interpolación YaRN de tipo "frequency-only" con factor 4× sobre una base de 262.144 tokens, incrustada como declaración en el paquete y horneada en las tablas rotatorias durante la preparación. Ningún kernel del runtime sabe que la interpolación ocurrió, lo que evita penalizaciones en el camino de ejecución.

Sobre la inferencia, el paquete activa decodificación especulativa **MTP (multi-token prediction) con 5 tokens de borrador por defecto y anchos de 1 a 6**; en las mediciones de validación las rondas especulativas estuvieron dominadas por los anchos 5–6, señal de una alta tasa de aceptación. El paquete captura 112 grafos CUDA, usa un chunk de prefill de 4.096 tokens y ofrece 256 slots de snapshot. No se dispone de información sobre datos de entrenamiento, número de tokens ni técnicas de alineamiento (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto con contexto extremadamente largo: hasta 1.048.576 tokens por petición, validado con recuperación exacta de "aguja" a 1.040.052 tokens.
- Comprensión de imagen y texto (pipeline image-text-to-text); se validó correctamente una petición de imagen de 268.177 tokens.
- Decodificación especulativa MTP (5 tokens de borrador) para reducir la latencia.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integración con herramientas existentes.
- Concurrencia de hasta 32 peticiones simultáneas en la variante TP2.
- Snapshots (256 slots) para gestionar sesiones largas.
- No hay información sobre tool calling, agentes ni soporte de audio.

## Casos de uso

- **Análisis de repositorios de código completos**: con 1M tokens de contexto se puede cargar una base de código entera en una sola petición y preguntar sobre relaciones entre módulos, algo inviable con ventanas de 128K.
- **Revisión de documentos legales o contratos extensos**: la recuperación exacta de agujas a más de 1M tokens permite búsquedas y verificaciones sobre expedientes completos sin fragmentación.
- **Resumen de historiales de conversación o logs de producción**: la caché KV de 7,1M tokens y los snapshots permiten mantener sesiones muy largas con historial acumulado.
- **Chatbots multimodales de alta concurrencia**: con 32 peticiones simultáneas y soporte de imagen, es adecuado para desplegar asistentes que procesan documentos e imágenes escaneadas.
- **Investigación sobre contextos largos**: la interpolación YaRN declarativa y reproducible (receta de exportación incluida) sirve como base para experimentar con escalado de contexto.
- **Procesamiento por lotes de imágenes con metadatos extensos**: peticiones de imagen de cientos de miles de tokens (validado a 268.177 tokens) permiten combinar imágenes con documentación adjunta masiva.
- **Servicio local sin dependencias de Python**: Flare no requiere Python ni descargas adicionales para servir, útil en entornos air-gapped o de estación de trabajo dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas mediciones publicadas son de validación funcional del paquete:

| Prueba | Resultado (TP2) |
|---|---|
| Recuperación de aguja a 268.051 tokens | Exacta, 36,7 s |
| Recuperación de aguja a 1.040.052 tokens | Exacta, 2 min 56,3 s |
| Petición de imagen de 268.177 tokens | Respondida correctamente |
| Anchos especulativos dominantes | 5–6 de 6 |

## Requisitos de hardware

- **GPUs obligatorias**: 2 × GPU Blackwell de arquitectura GB202 (SM120), es decir, RTX PRO 6000 Blackwell de 96 GB. La repetición del paquete exige exactamente la misma arquitectura de GPU en la que se preparó.
- **VRAM por GPU**: ~42,9 GiB cargados por GPU en servicio, con presupuesto de caché de 51,6 GiB por GPU (103,1 GiB de caché KV total, 7.118.848 tokens KV).
- **No cabe en GPUs consumer** actuales: requiere específicamente GB202 y dos unidades; no es compatible con Ada, Hopper ni arquitecturas anteriores.
- **Espacio en disco**: ~112,6 GB el paquete empaquetado (más ~102 GB del checkpoint descargado durante la preparación, si se prepara uno mismo).
- **Despliegue**: exclusivamente mediante el runtime Flare de NVIDIA (`flare run ... --gpus 0,1`), compilado desde `NVIDIA/flare-local-inference` en commit `921afd5c` (2026-10-29) o posterior (ABI 5). Versiones anteriores con ABI 4 rechazan el paquete. No funciona con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia**: recuperación de aguja en 36,7 s a 268K tokens y 2 min 56 s a ~1M tokens en TP2; no hay datos de throughput en tokens/s.

## Comparativa con modelos similares

| | Qwen3.8-Flash-Next FLARE 1M TP2 | Variante TP1 (hermana) | Qwen3.8-Flash-Next FP4 (base NVIDIA) |
|---|---|---|---|
| GPUs requeridas | 2 × GB202 | 1 | Según despliegue (no disponible) |
| Contexto | 1.048.576 tokens | 1.048.576 tokens | 262.144 tokens |
| Concurrencia máxima | 32 | 8 | no disponible |
| Caché KV | 103,1 GiB / 7,1M tokens KV | 18,8 GiB / 1,35M tokens KV | no disponible |
| Carga por GPU | 42,9 GiB | 75,6 GiB | no disponible |
| Especulación | MTP, 5 tokens | MTP, 5 tokens | no disponible |
| Licencia | nvidia-open-model-agreement | nvidia-open-model-agreement | nvidia-open-model-agreement |

No hay disponibles comparativas con modelos de otros fabricantes de tamaño o tarea equivalente en la información proporcionada.

## Limitaciones y advertencias

- **Requisito de hardware muy restrictivo**: solo funciona en 2 × RTX PRO 6000 Blackwell (GB202/SM120); no es portable a otras arquitecturas de GPU.
- **Dependencia de un runtime concreto**: exige Flare en commit `921afd5c` o posterior; el cambio de ABI 4 a 5 ya obligó a reexportar el paquete, por lo que futuros cambios de ABI pueden requerir re-preparación.
- **Riesgo de degradación por YaRN**: la interpolación 4× no modifica el checkpoint, y la calidad del modelo más allá de los 262.144 tokens nativos depende de la interpolación; solo se han publicado pruebas de recuperación de aguja, no evaluaciones de razonamiento a contexto completo.
- **Alucinaciones y sesgos**: no hay información publicada; al tratarse de un modelo Qwen cuantizado a FP4, la cuantización puede introducir pérdida adicional de calidad no cuantificada aquí.
- **Licencia**: nvidia-open-model-agreement; conviene revisar sus términos antes de uso comercial, ya que no es una licencia estándar tipo Apache/MIT.
- **Proceso de aceptación de clave**: el primer arranque requiere aceptar la huella de la clave de firma del editor (namespace `JohannesBertens`); en despliegues desatendidos hay que pasar las banderas `--dangerously-approve-key` y `--dangerously-accept-publisher`, lo que implica confiar en la clave de un editor externo, no oficial de NVIDIA.
- **Repositorio de bajo uso**: 72 descargas y 1 like en el momento de la ficha; es un paquete comunitario sin respaldo oficial amplio.
- **Idiomas soportados y capacidades de tool calling**: no documentados.

## Enlaces

- Repositorio del paquete TP2: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2
- Repositorio del paquete TP1 (hermano): https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M
- Checkpoint base de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Runtime Flare (GitHub): https://github.com/NVIDIA/flare-local-inference
- Enlace a los términos de licencia: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Archivo `publisher.json` de verificación de identidad: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2/blob/main/publisher.json
