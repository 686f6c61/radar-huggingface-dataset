# npario/Qwen3.8-27B-QUASAR-NVFP4

## Resumen

El modelo `npario/Qwen3.8-27B-QUASAR-NVFP4` es una versión cuantizada a 4 bits (NVFP4) del modelo base `Qwen/Qwen3.8-27B`, producida mediante **QUASAR**, un método de entrenamiento con cuantización consciente (quantization-aware training, QAT) que destila desde el profesor BF16 congelado. El resultado es un checkpoint de 19,7 GB que mantiene una calidad muy cercana al original de 55,6 GB, siendo el más pequeño de las versiones NVFP4 públicas de este modelo.

La relevancia de este modelo radica en que cuantiza **todas** las capas lineales (496 de 496) a NVFP4, incluyendo atención y gated delta-net, algo que normalmente degrada la calidad en cuantización post-entrenamiento (PTQ). QUASAR recupera esa calidad mediante aprendizaje de los pesos bajo cuantización, logrando resultados casi idénticos al BF16 original en benchmarks de razonamiento científico y matemático. Está pensado para despliegue en GPUs NVIDIA Blackwell con soporte FP4, usando vLLM sin conversión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con self-attention, gated delta-net y MLP (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (configuracion maxima en vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A4) en todas las capas lineales |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer con una arquitectura hibrida que combina self-attention, gated delta-net y MLPs, con un total de 496 capas lineales. La version QUASAR cuantiza **todas** esas capas a NVFP4 (W4A4), incluyendo las de atencion y delta-net, que normalmente se mantienen en FP8 o BF16 en otras cuantizaciones por riesgo de colapso de calidad.

El entrenamiento consistio en una epoca de destilacion con cuantizacion consciente (QAT) desde el profesor BF16 congelado, sobre la propia distribucion de salida del profesor. Se usaron un batch global de 32, una tasa de aprendizaje de 1e-6 y 2446 pasos. El metodo QUASAR (Loss-Aware Reconstruction) aprende los pesos bajo cuantizacion en lugar de redondearlos a posteriori, lo que reduce la perdida de calidad frente al PTQ convencional.

## Capacidades

- Generacion de texto y razonamiento complejo, con calidad comparable al modelo BF16 original en tareas de ciencia y matematicas.
- Razonamiento cientifico: obtiene 0.9091 en GPQA-Diamond, frente a 0.9141 del original.
- Razonamiento matematico: obtiene 1.0000 en AIME26, identico al original.
- Soporte de contexto largo: hasta 262.144 tokens con la configuracion adecuada de vLLM.
- Compatible con decodificacion especulativa (MTP) en vLLM, con 2 tokens especulativos.
- El pipeline_tag indica `image-text-to-text`, pero la model card no detalla capacidades de vision; se recomienda consultar la documentacion del modelo base para confirmar soporte multimodal.
- No se menciona soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- **Despliegue de LLM en produccion con memoria limitada**: con 19,7 GB, el modelo cabe en GPUs de 24 GB o 32 GB, permitiendo servir un modelo de 27B con calidad casi identica al original en entornos con restricciones de VRAM.
- **Razonamiento cientifico y academico**: su alto rendimiento en GPQA-Diamond lo hace adecuado para asistentes de investigacion, generacion de hipotesis o respuesta a preguntas de nivel universitario en fisica, quimica y biologia.
- **Resolucion de problemas matematicos**: con puntuacion perfecta en AIME26, puede usarse en tutoria automatizada, generacion de ejercicios o verificacion de demostraciones.
- **Procesamiento de documentos largos**: su contexto de 262K tokens permite analizar libros completos, informes extensos o codigo fuente de gran tamano en una sola pasada.
- **Sistemas de chat y conversacion con historial amplio**: la ventana de contexto extendida permite mantener conversaciones multi-turno con mucha informacion previa sin truncamiento.
- **Sustitucion directa de Qwen3.8-27B en pipelines existentes**: al ser un reemplazo drop-in, puede integrarse en infraestructuras que ya usan el modelo BF16, reduciendo costes de inferencia sin cambios de codigo.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos con el original BF16 y otras dos cuantizaciones NVFP4 del mismo modelo base:

| Modelo | Tamano | GPQA-Diamond (2 runs, n=396) | AIME26 (3 repeats, n=90) |
|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16 original) | 55,6 GB | 0.9141 | 1.0000 |
| **QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4** (este modelo) | 19,7 GB | 0.9091 | 1.0000 |
| unsloth/Qwen3.8-27B-NVFP4 | 23,4 GB | 0.8939 | 0.9778 |
| Inferact/Qwen3.8-27B-NVFP4 | 26,4 GB | 0.8763 | 0.9667 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Requiere una GPU NVIDIA con soporte FP4 (arquitectura Blackwell, compute capability 10.0 o superior).
- VRAM estimada: el checkpoint pesa 19,7 GB, por lo que cabe en GPUs de 24 GB (por ejemplo, RTX 4090 no es compatible por falta de FP4; se necesita RTX 5090 o similar Blackwell). Con 32 GB (RTX 5090) se puede usar un contexto de 65.536 tokens.
- Para contexto completo de 262.144 tokens se necesita una GPU con mayor memoria (por ejemplo, B200 o similar) y `--gpu-memory-utilization 0.85`.
- Despliegue recomendado con vLLM (version 0.27 o superior), sin paso de conversion.
- Soporta decodificacion especulativa con MTP (2 tokens especulativos) para reducir latencia.
- No se proporcionan datos de latencia o throughput especificos.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | GPQA-Diamond | AIME26 | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 55,6 GB | BF16 | 0.9141 | 1.0000 | no disponible |
| **QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4** | 19,7 GB | NVFP4 (496/496 linears) | 0.9091 | 1.0000 | no disponible |
| unsloth/Qwen3.8-27B-NVFP4 | 23,4 GB | NVFP4 (168/496 linears, resto FP8) | 0.8939 | 0.9778 | no disponible |
| Inferact/Qwen3.8-27B-NVFP4 | 26,4 GB | NVFP4 (304/496 linears, resto BF16) | 0.8763 | 0.9667 | no disponible |

El modelo QUASAR es el mas pequeno y el de mayor calidad entre las opciones NVFP4, superando a las alternativas de unsloth e Inferact en ambos benchmarks, con una diferencia de solo 0.005 puntos en GPQA-Diamond respecto al original BF16.

## Limitaciones y advertencias

- Requiere hardware especifico con soporte FP4 (Blackwell); no funciona en GPUs Ampere, Ada Lovelace o anteriores.
- La licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si es apto para uso comercial.
- No se han evaluado sesgos, alucinaciones ni comportamiento en dominios fuera de ciencia y matematicas.
- La cuantizacion agresiva (W4A4 en todas las capas) puede degradar el rendimiento en tareas no cubiertas por los benchmarks publicados, aunque los resultados disponibles sugieren una perdida minima.
- El pipeline_tag indica capacidades de vision, pero no se documentan en la model card; su uso multimodal no esta verificado.
- No se proporcionan datos sobre idiomas soportados; se asume herencia del modelo base, pero no esta confirmado.

## Enlaces

- [HuggingFace: npario/Qwen3.8-27B-QUASAR-NVFP4](https://huggingface.co/npario/Qwen3.8-27B-QUASAR-NVFP4)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Paper QUASAR (arXiv:2608.13966)](https://arxiv.org/abs/2608.13966)
