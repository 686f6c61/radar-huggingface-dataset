# scottlowry/Qwen3.5-9B-oQ4e-mtp

## Resumen

Qwen3.5-9B-oQ4e-mtp es una cuantización mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado en el que se han aplicado técnicas de cuantización de precisión mixta mediante la herramienta oQ (oMLX v0.7.4.dev1), desarrollada por jundot. El resultado es un modelo de 9.653 millones de parámetros lógicos almacenado en aproximadamente 6,08 GiB, con una media efectiva de 5,411 bits por peso.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8.954B parámetros), un módulo de visión (0.456B) y una cabeza MTP (Multi-Token Prediction) de 0.243B. Esta última es especialmente relevante porque habilita decodificación especulativa nativa, una técnica que acelera la generación al predecir varios tokens por paso. La cuantización emplea una distribución no uniforme: el 73,3% de los pesos se almacenan a 4 bits, mientras que fracciones menores se conservan a 5, 6 bits o incluso BF16, presumiblemente en capas sensibles a la precisión.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecución de modelos en silicio de la compañía (chips M-series). Esto lo hace especialmente interesante para desarrolladores que quieran ejecutar un modelo de casi 10.000 millones de parámetros con capacidades multimodales en hardware Apple consumer, sin necesidad de GPUs dedicadas. Su relevancia actual radica en que demuestra que la cuantización mixta permite preservar calidad en modelos grandes mientras se reduce drásticamente la huella de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), con módulo de visión y cabeza MTP |
| Parámetros totales | 9.653.104.368 (9.653B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta: affine 4-bit (grupo 64), affine 5-bit (grupo 64), affine 6-bit (grupo 64) y BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen/Qwen3.5-9B, es un transformer de la familia Qwen 3.5 desarrollada por Alibaba. La información disponible no detalla la composición exacta del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF o DPO. Lo que sí se puede afirmar es que la versión publicada por scottlowry no ha sido reentrenada: es una cuantización del checkpoint original.

La innovación técnica principal de esta ficha reside en el proceso de cuantización mixta aplicado con oQ. En lugar de cuantizar todos los pesos al mismo nivel, el algoritmo asigna precisión de forma selectiva: 7.079B parámetros a 4 bits (3.708 GiB), 1.016B a 5 bits (0.651 GiB), 1.067B a 6 bits (0.808 GiB) y 0.491B se mantienen en BF16 (0.914 GiB). Esta estrategia busca minimizar la pérdida de calidad en capas críticas mientras se maximiza la compresión en el resto. El grupo de cuantización es de 64 en todos los casos.

La presencia de una cabeza MTP (Multi-Token Prediction) de 0.243B parámetros es otro elemento arquitectónico destacable. Estas cabezas permiten al modelo predecir varios tokens futuros de forma simultánea, lo que habilita técnicas de decodificación especulativa y puede aumentar el throughput de generación. El módulo de visión de 0.456B parámetros confirma que el modelo base es multimodal, capaz de procesar imágenes además de texto.

## Capacidades

- Generación de texto y razonamiento: el modelo hereda las capacidades del Qwen3.5-9B base, incluyendo razonamiento multi-paso y generación de texto coherente.
- Procesamiento de visión: el módulo de visión de 0.456B parámetros permite al modelo interpretar imágenes, aunque no se detallan las tareas específicas soportadas (VQA, OCR, captioning, etc.).
- Decodificación especulativa: la cabeza MTP habilita la predicción de múltiples tokens por paso, lo que puede acelerar la inferencia en comparación con la decodificación autorregresiva estándar.
- Capacidades multilingües: no se especifican los idiomas soportados en la información disponible, aunque la familia Qwen suele tener cobertura multilingüe amplia.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modelo base Qwen3.5 está diseñado para tareas de razonamiento.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y la cuantización a ~5,4 bits permiten ejecutar un modelo de 9.653B parámetros en equipos con memoria unificada de 16 GB o superior, algo inviable con el checkpoint BF16 original (que requeriría ~19 GB solo para pesos). Es adecuado para desarrolladores que trabajan en portátiles Mac y necesitan un modelo multimodal local.
- Prototipado de aplicaciones multimodales: el módulo de visión permite construir prototipos de análisis de imágenes, descripción automática o extracción de información visual sin depender de APIs externas, con la ventaja de privacidad que supone la ejecución local.
- Aceleración de generación con decodificación especulativa: la cabeza MTP puede aprovecharse en pipelines de inferencia que implementen decodificación especulativa, reduciendo la latencia en tareas de generación larga como resúmenes o traducción.
- Evaluación de técnicas de cuantización: investigadores que estudien el impacto de la cuantización mixta pueden usar este checkpoint como referencia para comparar la calidad frente al modelo BF16 original y frente a cuantizaciones uniformes de 4 bits.
- Desarrollo de asistentes conversacionales locales: con casi 10.000 millones de parámetros, el modelo ofrece suficiente capacidad para mantener conversaciones multi-turno con contexto razonable, ejecutándose en hardware consumer Apple.
- Investigación en eficiencia de memoria: la distribución no uniforme de bits (4/5/6/16) sirve como caso de estudio para analizar qué capas toleran mejor la compresión y cómo afecta a distintas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 6,081 GiB en disco (6,529 GB). En ejecución, MLX necesita memoria adicional para el grafo computacional, caché KV y buffers intermedios. Se estima un mínimo práctico de 8-10 GB de memoria unificada, aunque no se dispone de cifras oficiales.
- GPU recomendadas: al estar en formato MLX, está diseñado para chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible de forma nativa con GPUs NVIDIA o AMD sin conversión de formato.
- ¿Cabe en consumer GPU? En el ecosistema Apple, sí: cabe en Macs con 16 GB de memoria unificada o superior. En GPUs dedicadas convencionales requeriría conversión a otro formato (por ejemplo GGUF) y no se garantiza la compatibilidad de la cabeza MTP.
- Opciones de despliegue: MLX (librería nativa), mlx-lm para generación de texto, y potencialmente herramientas del ecosistema oMLX. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en el formato actual.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere mejoras potenciales en throughput, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ4e-mtp | 9.653B | No disponible | MLX safetensors (mixto 4/5/6/16 bits) | No disponible | Cuantización mixta con MTP y visión, orientada a Apple Silicon |
| Qwen/Qwen3.5-9B (original) | ~9.653B | No disponible | Safetensors BF16 | No disponible | Modelo base sin cuantizar; requiere ~19 GB para pesos |
| Cuantizaciones GGUF Q4 de modelos ~9B | ~9B | Variable | GGUF | Variable | Orientadas a llama.cpp y GPUs convencionales; sin MTP nativo confirmado |

La comparativa directa con alternativas concretas no está disponible en la información proporcionada. El modelo base Qwen3.5-9B es la referencia natural, y las cuantizaciones GGUF de la misma familia serían los competidores más cercanos en el espacio de modelos comprimidos, aunque con ecosistemas de despliegue distintos.

## Limitaciones y advertencias

- La cuantización mixta introduce pérdida de calidad respecto al modelo BF16 original. Aunque la estrategia selectiva mitiga el daño, no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El formato MLX limita el despliegue a hardware Apple. No es directamente utilizable en GPUs NVIDIA, AMD o Intel sin conversión, y la conversión puede no preservar la cabeza MTP.
- La licencia no está especificada en la información disponible, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-9B antes de cualquier uso en producción.
- No se detallan los idiomas soportados ni el rendimiento en castellano. La familia Qwen suele tener buen soporte multilingüe, pero no hay confirmación para esta versión cuantizada.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; la cuantización puede agravarlo ligeramente en tareas de razonamiento fino.
- La model card indica que el checkpoint fue recuantizado el 2026-11-11 con oMLX v0.7.4.dev1; versiones anteriores pueden tener distribuciones de bits distintas, por lo que conviene descargar la versión actual.
- No se confirma soporte de tool calling, function calling ni modo thinking, lo que limita su uso en pipelines de agentes sin validación previa.
- El número de descargas (159) y la ausencia de likes sugieren una adopción limitada; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
