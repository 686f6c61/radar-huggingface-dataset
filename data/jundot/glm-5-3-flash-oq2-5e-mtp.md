# Jundot/GLM-5.3-Flash-oQ2.5e-mtp

## Resumen

GLM-5.3-Flash-oQ2.5e-mtp es una versión cuantizada en formato MLX del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario Jundot. Se trata de un modelo de mezcla de expertos (MoE) nativamente multimodal con 321.323 millones de parámetros totales y 18.000 millones activos, que combina atención dispersa y atención lineal con Manifold-Constrained Hyper-Connections (mHC). El checkpoint incluye el modelo de lenguaje, el codificador de visión y la cabeza de predicción multi-token (MTP).

La relevancia de esta ficha radica en la cuantización mixta: el autor aplica el método oQ2.5e mediante oMLX v0.8.0, asignando bits según la sensibilidad medida por capa y redondeando cada grupo con una matriz de importancia. El resultado es un checkpoint de 127,212 GB con un promedio efectivo de 3,167 bits por peso, lo que permite ejecutar un modelo de 321B parámetros en entornos Apple Silicon con MLX, algo inviable en precisión completa.

La licencia MIT, heredada del modelo base, facilita el uso comercial y la experimentación. El modelo está pensado para inferencia local en hardware Apple y para pipelines de imagen-texto a texto, con soporte de decodificación especulativa mediante la cabeza MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atención dispersa y lineal, Manifold-Constrained Hyper-Connections (mHC), codificador de visión y cabeza MTP |
| Parametros totales | 321.323.031.390 |
| Parametros activos | 18.000 millones (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ2.5e: affine 2-bit (grupo 64), 3-bit (grupo 64), 4-bit (grupo 64), 8-bit (grupo 64), BF16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), cuantización affine por grupos de 64 |
| Bits efectivos por peso | 3,167 (checkpoint completo); 3,109 (backbone de lenguaje) |
| Tamano del repositorio | 127,212 GB / 118,475 GiB |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE nativamente multimodal que combina mecanismos de atención dispersa y atención lineal, junto con Manifold-Constrained Hyper-Connections (mHC). La arquitectura incorpora tres componentes diferenciados: un backbone de lenguaje de 313.327B parámetros lógicos, un codificador de visión de 0.564B y una cabeza de predicción multi-token (MTP) de 7.433B. La cabeza MTP habilita decodificación especulativa multi-token, lo que puede reducir la latencia de generación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron etapas de RLHF o DPO, ya que la model card del checkpoint cuantizado no los detalla. La innovación técnica documentada en esta ficha es el proceso de cuantización: oQ2.5e asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia construida a partir de 128 muestras de 512 tokens y aplica un refit ponderado por mínimos cuadrados de escala y sesgo. La distribución resultante concentra el 52,631% de los pesos lógicos en 2 bits y el 42,105% en 3 bits, reservando 4 y 8 bits para capas sensibles.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text), gracias al codificador de visión integrado.
- Razonamiento y respuesta a instrucciones, heredado del modelo base GLM-5.3-Flash.
- Decodificación especulativa multi-token mediante la cabeza MTP incluida en el checkpoint.
- Ejecución local en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint MLX de 118,475 GiB permite ejecutar un MoE de 321B parámetros en estaciones de trabajo Apple de gama alta, sin depender de GPUs NVIDIA.
- Análisis de documentos con imágenes: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales para extracción de información.
- Prototipado de asistentes conversacionales: la ventana conversacional y el pipeline image-text-to-text permiten construir demos de chat multimodal en entornos de desarrollo locales.
- Experimentación académica con cuantización extrema: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta de 2 a 8 bits en modelos MoE de gran escala.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir aceleraciones de generación en MLX frente a decodificación autoregresiva estándar.
- Despliegue en pipelines de investigación multimodal: integrable en scripts MLX para clasificación, descripción o respuesta a preguntas sobre imágenes en entornos controlados.
- Base para fine-tuning ligero: al estar en formato MLX y licencia MIT, puede servir de punto de partida para adaptaciones con LoRA en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento estimado: el checkpoint ocupa 118,475 GiB en disco; la inferencia requiere cargar los pesos cuantizados, por lo que se necesita memoria unificada disponible en el entorno Apple Silicon.
- GPU recomendadas: no disponible en la información proporcionada; el formato MLX está orientado a Apple Silicon (series M).
- Cabe en consumer GPU: no disponible; el formato MLX no es directamente compatible con GPUs NVIDIA consumer.
- Opciones de despliegue: MLX (librería declarada) y oMLX v0.8.0 para el proceso de cuantización. No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ2.5e-mtp (este) | 321.323B | 18B | no disponible | MIT | MLX safetensors, ~3,167 bits/peso | Cuantización mixta oQ2.5e, incluye visión y MTP |
| zai-org/GLM-5.3-Flash (base) | 321.323B | 18B | no disponible | MIT | no disponible | Modelo original sin cuantizar |
| Otros checkpoints MLX de GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | no disponible | No se documentan alternativas en la información disponible |

## Limitaciones y advertencias

- Cuantización agresiva: el 52,631% de los pesos lógicos está en 2 bits, lo que puede degradar la calidad en tareas sensibles frente al modelo base en BF16.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de fiabilidad en esta ficha.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe sin datos del modelo base.
- Longitud de contexto: no disponible, lo que impide planificar cargas de contexto largo con garantías.
- Compatibilidad: el formato MLX limita el despliegue a entornos Apple Silicon; no es directamente usable en GPUs NVIDIA ni en servidores x86 convencionales.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del modelo base zai-org/GLM-5.3-Flash y las condiciones de sus pesos originales.
- El autor recomienda volver a descargar el checkpoint si se tiene una copia anterior a la actualización del 19 de noviembre de 2026, por cambios en el redondeo oQe.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ2.5e-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
- PR oQe: https://github.com/jundot/omlx/pull/4930
- PR refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
