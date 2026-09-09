# inference-optimization/Qwen3.6-8B-A1.6B

## Resumen

Qwen3.6-8B-A1.6B es una versión miniatura del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario "inference-optimization" con fines exclusivamente de prueba y desarrollo. Se trata de un modelo de mezcla de expertos (MoE) con arquitectura híbrida de atención lineal y completa, y un torre de visión, diseñado para validar la estructura del modelo original con un coste computacional mucho menor.

El modelo conserva la configuración completa del original en cuanto a anchos, número de expertos y esquema de enrutamiento, pero reduce drásticamente la profundidad: pasa de 40 capas de texto a 8 (6 lineales y 2 completas), y de 27 capas de visión a 2. Tiene 7.811.402.400 parámetros totales y aproximadamente 1,57 mil millones de parámetros activos por token. Los pesos fueron inicializados aleatoriamente y afinados únicamente sobre un conjunto de datos sintético y pequeño, por lo que no posee capacidades reales de lenguaje ni visión. Su relevancia radica en servir como banco de pruebas para herramientas de compresión, cuantización, integraciones de inferencia y experimentación con arquitecturas MoE híbridas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Qwen3_5MoeForConditionalGeneration) |
| Parámetros totales | 7.811.402.400 (7,81 mil millones) |
| Parámetros activos | ~1,57 mil millones (8 de 256 expertos enrutados por token, más experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (sharded) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5-MoE con soporte multimodal (visión y texto). El backbone de texto combina atención lineal y atención completa en un patrón híbrido preservado del modelo original: cada cuatro capas se inserta una capa de atención completa (full-attention), dando lugar a 6 capas lineales y 2 capas completas. El MoE cuenta con 256 expertos enrutados, un experto compartido y selección de los 8 mejores expertos (top-8) por token. El modelo base original tiene 40 capas de texto, 30 lineales y 10 completas, y 27 capas de visión; la versión miniatura reduce la profundidad a 8 capas de texto y 2 de visión, manteniendo el tamaño oculto (2048), el tamaño de vocabulario (248320) y la dimensión intermedia de los expertos (512).

El proceso de creación se realizó mediante la skill `create-tiny-model` de llm-compressor. Los pesos se inicializaron de forma aleatoria y después se afinaron sobre un conjunto de datos de texto sintético hasta que la perplejidad convergió en aproximadamente 1,0. Los expertos se convirtieron al formato fusionado original (un tensor tridimensional por capa) y el checkpoint se volvió a fragmentar para coincidir con la disposición del repositorio original. Las capas de predicción multi-token (MTP) del modelo original se omitieron deliberadamente.

## Capacidades

- La arquitectura soporta entrada de imagen y texto (pipeline image-text-to-text), pero el torre de visión no fue entrenado con imágenes, por lo que no aporta capacidades de visión reales.
- Generación de texto autoregresiva sobre la distribución del conjunto de datos de ajuste fino.
- Enrutamiento MoE con experto compartido y selección top-8 de 256 expertos, lo que permite analizar el comportamiento de la mezcla de expertos a escala reducida.
- Atención híbrida (6 capas lineales y 2 completas) que replica el patrón del modelo original, útil para estudiar el impacto de la atención lineal en tareas de contexto largo.
- No se ha verificado soporte de tool calling, function calling, agentes ni razonamiento de múltiples pasos.
- Los idiomas soportados no están especificados; no hay información sobre capacidades multilingües.

## Casos de uso

- Pruebas de arquitectura: permite validar la implementación de Qwen3.5-MoE (incluyendo el patrón híbrido lineal/completo y el enrutamiento top-8) dentro del ecosistema Transformers sin necesidad de cargar el modelo completo de 35 mil millones de parámetros.
- Depuración de pipelines de inferencia: sirve como modelo de bajo coste para detectar errores en integraciones con vLLM, TGI o servicios personalizados antes de desplegar el modelo original.
- Experimentación con cuantización: al tener un tamaño menor y pesos fusionados por experto, se pueden probar técnicas de cuantización (GPTQ, AWQ, etc.) y medir su impacto en la memoria y la velocidad sin arriesgar el modelo grande.
- Investigación con LoRA y adaptadores: la presencia de expertos compartidos y enrutados facilita el estudio de métodos de ajuste eficiente de parámetros en modelos MoE, comparando calidad y tiempo de entrenamiento.
- Validación de formato de checkpoint: el repositorio usa safetensors fragmentados y tensores fusionados de expertos, lo que permite probar herramientas de conversión, re-fragmentado y compatibilidad con sistemas de producción.
- Benchmarking local de hardware: permite medir el uso de VRAM, la latencia y el throughput en GPUs de consumo, sirviendo como referencia para estimar los requisitos del modelo original.
- Docencia y demostraciones: ofrece una forma accesible de explicar conceptos de MoE, atención híbrida y modelos multimodales en talleres o cursos, al poder ejecutarse en una GPU doméstica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta una perplejidad aproximada de 1,0 en un conjunto de validación de texto pequeño, pero este valor no corresponde a ningún benchmark estándar (MMLU, HumanEval, GSM8K, etc.) y solo refleja la memorización del dataset de ajuste fino. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bfloat16 ocupan alrededor de 15,6 GB, por lo que se recomienda al menos 16-20 GB de VRAM para cargar el modelo completo. La memoria de activación adicional puede elevar el requisito en función de la longitud de secuencia.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En una RTX 3090 (24 GB) también debería funcionar, aunque consumiría una fracción significativa de la memoria disponible.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 24 GB; en GPUs de 16 GB el encaje es ajustado y puede requerir cuantización o carga parcial de expertos.
- Opciones de despliegue: se puede cargar directamente con `transformers` (tal como muestra la documentación del autor); para servicios de inferencia se puede probar su compatibilidad con vLLM o TGI, y para ejecución ligera sería necesario convertirlo a GGUF y usarlo con llama.cpp u Ollama. No hay información que confirme estas integraciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Capas de texto | Expertos | Top-k | Visión | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen3.6-8B-A1.6B (este) | 7,81 mil millones | ~1,57 mil millones | 8 (6 lineales + 2 completas) | 256 | 8 | 2 capas | MIT |
| Qwen3.6-35B-A3B (modelo base) | 35 mil millones | ~3 mil millones (según sufijo A3B del nombre) | 40 (30 lineales + 10 completas) | 256 | 8 | 27 capas | no disponible |

La comparación con otras alternativas de la misma categoría no está disponible en la información proporcionada. El modelo base de referencia es 4,5 veces más grande en parámetros totales y tiene 5 veces más capas de texto, lo que ilustra la reducción de profundidad aplicada en esta versión miniatura.

## Limitaciones y advertencias

- Los pesos fueron inicializados aleatoriamente y solo se afinaron sobre un conjunto de datos sintético y pequeño; el modelo no posee conocimiento general ni capacidades reales de lenguaje.
- La torre de visión no fue entrenada con imágenes, por lo que cualquier uso de entrada visual no producirá resultados significativos.
- La perplejidad reportada (~1,0) en el conjunto de validación refleja memorización del dataset de entrenamiento en lugar de generalización, por lo que el modelo no es útil para ninguna tarea práctica.
- No es apto para producción ni para despliegues reales; su propósito exclusivo es servir como banco de pruebas de arquitectura y herramientas de desarrollo.
- No se ha verificado el soporte de idiomas, tool calling, agentes ni razonamiento de múltiples pasos.
- La fecha de creación (septiembre de 2026) y el método de generación mediante una skill de llm-compressor pueden implicar falta de mantenimiento y ausencia de soporte por parte de la comunidad.
- La licencia MIT permite uso comercial, pero el modelo no ofrece garantías de funcionamiento ni precisión.

## Enlaces

- HuggingFace: https://huggingface.co/inference-optimization/Qwen3.6-8B-A1.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
