# kojikojiprg/ai-theories-small-gpt-en

## Resumen

El modelo `kojikojiprg/ai-theories-small-gpt-en` es un pequeño modelo de lenguaje tipo GPT, desarrollado por el autor `kojikojiprg` como parte del proyecto educativo `ai-theories`. Se trata de una implementación desde cero (scratch) en PyTorch de un Transformer decoder-only, preentrenado sobre un subconjunto del corpus de Wikipedia en inglés. Su objetivo principal es servir como material didáctico para comprender los fundamentos del preentrenamiento de modelos GPT, la estabilización del entrenamiento y las estrategias de decodificación.

El modelo fue entrenado durante 2181 pasos con un tamaño de lote de 32 y una longitud de secuencia de 256 tokens, lo que lo convierte en una unidad extremadamente pequeña y limitada. Utiliza un tokenizador byte-level BPE con un vocabulario de 8192 tokens. El autor declara explícitamente que es un modelo para fines de investigación y educación, sin garantía de calidad, y que no está pensado para uso comercial ni de producción. Su relevancia radica en su valor pedagógico, no en su rendimiento práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT) |
| Parametros totales | no disponible (config.json no proporcionado en la ficha) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch, pero no especificado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de un Transformer decoder-only, implementada completamente desde cero en PyTorch. No se especifican detalles como el número de capas, dimensiones ocultas o cabezas de atención, ya que la configuración reside en un archivo `config.json` que no se ha incluido en la información proporcionada. El entrenamiento se realizó sobre una parte del corpus de Wikipedia en inglés, con un total de 2181 pasos, un tamaño de lote de 32 y una longitud de secuencia de 256. No se menciona el uso de técnicas de alineación como RLHF o DPO. El tokenizador es un byte-level BPE con un vocabulario de 8192 tokens, almacenado en `tokenizer.json`.

## Capacidades

- Generación de texto básica en inglés, limitada a secuencias de hasta 256 tokens.
- Capacidad de aprendizaje y demostración de conceptos de preentrenamiento, estabilización del entrenamiento y estrategias de decodificación (según los notebooks asociados).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni capacidades de agente.
- No es multilingüe; únicamente procesa texto en inglés.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Educación en arquitecturas de transformers: permite a estudiantes e investigadores analizar una implementación limpia de un GPT desde cero, ideal para seguir el código paso a paso en los notebooks del proyecto.
- Experimentación con preentrenamiento: sirve para probar variaciones en el entrenamiento (como cambios en el learning rate o la composición del dataset) sin necesidad de grandes recursos computacionales.
- Estudio de estrategias de decodificación: los notebooks asociados (008_decoding_strategies) permiten experimentar con diferentes métodos de muestreo y búsqueda.
- Investigación sobre estabilización del entrenamiento: el notebook 007 se centra en técnicas para evitar divergencias, útil para quienes estudian dinámicas de optimización.
- Prototipado rápido de pipelines de NLP: al ser un modelo pequeño, se puede integrar en un pipeline de prueba para validar infraestructura de tokenización o generación antes de escalar a modelos mayores.
- Benchmarking de entornos de ejecución: útil para medir el rendimiento de CPUs o GPUs modestas en tareas de inferencia de transformers, aunque no se proporcionan métricas oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo extremadamente pequeño (vocabulario de 8192, contexto de 256), es ejecutable en CPU sin problemas.
- VRAM estimada: no disponible, pero se estima que cabe en cualquier GPU con al menos 1-2 GB de VRAM, o incluso en memoria RAM convencional.
- GPU recomendadas: cualquier GPU de gama baja (por ejemplo, NVIDIA GTX 1650 o superior) es suficiente. No requiere A100 ni H100.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un proyecto de investigación en PyTorch, el despliegue se realizaría mediante scripts personalizados o los notebooks del repositorio.
- Latencia y throughput: no disponible, pero se espera una latencia mínima dada su reducida escala.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A modo de referencia, modelos con un propósito educativo similar son `nanoGPT` (de Andrej Karpathy) y `GPT-2 small` (124M parámetros). Sin embargo, este modelo es significativamente más pequeño y está orientado exclusivamente al proyecto `ai-theories`, por lo que no se puede establecer una comparación cuantitativa sin datos de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ai-theories-small-gpt-en | no disponible | 256 | MIT | Educativo, scratch |
| nanoGPT | ~10M-100M | variable | MIT | Educativo, scratch |
| GPT-2 small | 124M | 1024 | MIT | Generalista |

## Limitaciones y advertencias

- Modelo exclusivamente educativo: el autor declara que no se realiza garantía de calidad y que no está pensado para uso comercial ni de producción.
- Contexto muy limitado: solo 256 tokens, lo que impide tareas que requieran dependencias de largo alcance.
- Solo inglés: no soporta otros idiomas.
- Riesgo de alucinación y sesgos: al estar entrenado sobre un subconjunto de Wikipedia, puede reflejar sesgos presentes en esa fuente y generar texto incoherente o falso.
- Repositorio con 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que el repositorio de HuggingFace podría estar vacío o en una fase muy temprana de desarrollo.
- Fecha de creación y actualización: 2026-08-20, una fecha futura que podría indicar un error en los metadatos o un proyecto planificado.

## Enlaces

- HuggingFace: https://huggingface.co/kojikojiprg/ai-theories-small-gpt-en
- Repositorio GitHub del proyecto: https://github.com/kojikojiprg/ai-theories
- Notebook de preentrenamiento: https://github.com/kojikojiprg/ai-theories/blob/main/theories/02_pretraining/006_pretraining_small_gpt.ipynb
- Notebook de estabilización del entrenamiento: https://github.com/kojikojiprg/ai-theories/blob/main/theories/02_pretraining/007_training_stabilization.ipynb
- Notebook de estrategias de decodificación: https://github.com/kojikojiprg/ai-theories/blob/main/theories/02_pretraining/008_decoding_strategies.ipynb
