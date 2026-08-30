# Robot-Haus/Qwen3.8-Flash-Next-oQ4e-fp16-mtp

## Resumen

Este modelo es una conversión a fp16 de la cuantización 4-bit oQ4e del modelo Qwen3.8-Flash-Next, realizada por Robot-Haus a partir del trabajo de monroewilliams. El modelo original, desarrollado por el equipo Qwen, corresponde a una vista previa de la arquitectura Qwen4, que introduce una combinación híbrida de atención GDN (Gated Delta Network) y QSA (Quadratic Self-Attention), junto con mejoras en residuales, embeddings y optimización del entrenamiento. Según los datos de vLLM, el modelo base presenta 125 000 millones de parámetros principales más 51 000 millones adicionales en embeddings N-gram, con solo 6 000 millones de parámetros activados por token (arquitectura MoE). Sin embargo, la versión aquí descrita, al estar cuantizada y convertida a fp16 para MLX, muestra un conteo de parámetros de 30 426 288 099 según los safetensors, reflejando la compresión aplicada.

La relevancia de este modelo radica en su disponibilidad para hardware Apple Silicon (M1/M2), ya que la conversión de bf16 a fp16 busca mejorar el rendimiento en esas máquinas. Es una opción para desarrolladores que deseen experimentar con la arquitectura Qwen4 en entornos locales con requisitos de memoria moderados. No obstante, al tratarse de una versión cuantizada y experimental, su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4 experimental (híbrida GDN + QSA, MoE) |
| Parametros totales | 30 426 288 099 (según safetensors) |
| Parametros activos | 6 000 millones (dato del modelo base, no confirmado para esta versión) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención denominada GDN + QSA, según el repositorio oficial de QwenLM. GDN (Gated Delta Network) combina mecanismos de atención con compuertas para mejorar la eficiencia computacional, mientras que QSA (Quadratic Self-Attention) añade términos cuadráticos en la atención. Esta combinación busca optimizar la capacidad del modelo manteniendo costes de inferencia razonables. El modelo original incluye además embeddings N-gram adicionales (51 000 millones de parámetros) que complementan los 125 000 millones principales, activando solo 6 000 millones por token.

La versión aquí descrita no fue reentrenada ni requantizada; simplemente se procesó el modelo cuantizado Jundot/Qwen3.8-Flash-Next-oQ4e-mtp para convertir todos los componentes bf16 a fp16, con el objetivo de mejorar el rendimiento en hardware Apple M1/M2. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: al ser un modelo de lenguaje de gran tamaño, es capaz de producir texto coherente y contextualizado, aunque las capacidades exactas dependen del modelo base.
- Razonamiento y comprension: se espera que herede las habilidades del modelo Qwen original, incluyendo razonamiento lógico y matemático, sin datos específicos para esta versión.
- Codigo: probablemente soporta generación y análisis de código, dado el enfoque general de la serie Qwen.
- Multilingue: no se especifican idiomas soportados, pero los modelos Qwen suelen cubrir múltiples lenguas.
- Tool calling y agentes: no se confirma para esta versión, aunque el modelo base podría incluirlo.
- Thinking mode: no se indica si dispone de modo de razonamiento explícito.

## Casos de uso

- Inferencia local en Apple Silicon: gracias a la conversión a fp16 y la cuantización 4-bit, el modelo puede ejecutarse en Macs con M1/M2 con un consumo de memoria reducido, adecuado para prototipado y experimentación.
- Evaluacion de arquitecturas Qwen4: desarrolladores e investigadores pueden probar las capacidades de la atención híbrida GDN + QSA en un entorno accesible sin necesidad de hardware de gama alta.
- Desarrollo de aplicaciones de chat o asistentes: con una ventana de contexto no especificada, pero presumiblemente amplia, puede servir para aplicaciones conversacionales básicas.
- Generacion de texto creativo: para tareas de redacción, resúmenes o contenido técnico, aprovechando las capacidades del modelo base.
- Pruebas de cuantizacion y conversion: este modelo sirve como referencia para estudiar el impacto de la cuantización oQ4e y la conversión bf16 a fp16 en el rendimiento.
- Integracion en pipelines MLX: puede usarse con librerías como mlx-lm para inferencia en Python en entornos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 107.2 GB, pero al estar cuantizado a 4 bits, la memoria necesaria para cargar el modelo es significativamente menor. Con 30 400 millones de parámetros en 4 bits, aproximadamente 15-16 GB de memoria son necesarios (más overhead). La conversión a fp16 de las partes cuantizadas no cambia el tamaño de los pesos cuantizados, solo los componentes bf16 convertidos.
- GPU recomendadas: orientado a Apple Silicon (M1/M2) con memoria unificada de al menos 16 GB. En GPUs NVIDIA, podría ejecutarse con 16-24 GB de VRAM, pero el formato MLX no es compatible directamente con CUDA.
- Consumo en consumer GPU: posible en tarjetas con 24 GB (RTX 3090/4090) si se convierte a otro formato, pero no es el objetivo principal.
- Opciones de despliegue: mlx-lm, llama.cpp (si se convierte a GGUF), aunque no se proporciona soporte oficial para vLLM o TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que se trata de una versión cuantizada y convertida de un modelo experimental. Como referencia, se puede comparar con el modelo original Qwen3.8-Flash-Next (sin cuantizar) y con otras cuantizaciones del mismo modelo, pero no hay datos de rendimiento.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B + 51B embeddings | no disponible | no | no disponible |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | 30.4B (cuantizado) | no disponible | 4-bit oQ4e | no disponible |
| Este modelo (Robot-Haus) | 30.4B | no disponible | 4-bit oQ4e + fp16 | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Naturaleza experimental: la arquitectura Qwen4 está en fase de vista previa, por lo que el comportamiento puede ser inestable o presentar fallos inesperados.
- Sesgos y alucinaciones: al no haber datos de evaluación, no se pueden descartar sesgos del modelo base ni tendencia a generar información falsa.
- Limitaciones de idioma y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en aplicaciones multilingües o con contextos largos.
- Compatibilidad restringida: el formato MLX limita su uso a ecosistemas Apple; para otros entornos se requeriría conversión adicional.
- Sin soporte comunitario: al tener 0 descargas y 0 likes, no hay evidencia de uso o validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Robot-Haus/Qwen3.8-Flash-Next-oQ4e-fp16-mtp
- Modelo base (Jundot): https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Modelo intermedio (monroewilliams): https://huggingface.co/monroewilliams/Qwen3.8-Flash-Next-oQ4e-fp16-mtp
- Repositorio oficial Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
