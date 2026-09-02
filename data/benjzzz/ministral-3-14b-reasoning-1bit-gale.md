# benjzzz/Ministral-3-14B-Reasoning-1bit-Gale

## Resumen

El modelo **Ministral-3-14B-Reasoning-1bit-Gale**, publicado por el usuario `benjzzz` en HuggingFace, es una versión cuantizada a 1 bit del modelo de razonamiento **Ministral 3 14B Reasoning** de Mistral AI, adaptada mediante técnicas de cuantización consciente del entrenamiento (QAT) y transformadas de Hadamard. Su objetivo es reducir drásticamente el consumo de memoria y permitir la ejecución en hardware de bajos recursos, manteniendo en lo posible las capacidades de razonamiento complejo del modelo original.

Sin embargo, los datos reales del archivo `safetensors` indican **4.103.695.360 parámetros** (~4,1 mil millones), una cifra muy inferior a los 14 mil millones que sugiere el nombre. Esta discrepancia puede deberse a un error de etiquetado, a una poda previa o a que el archivo contiene únicamente una parte de los pesos. El repositorio tiene un tamaño de 6,5 GB, lo que apunta a que no es una cuantización pura de 1 bit (que ocuparía menos de 1 GB), sino que incluye otros ficheros o formatos. El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Ministral 3) |
| Parametros totales | 4.103.695.360 (segun safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base soporta 256k tokens, pero no se confirma en esta version) |
| Tipos de cuantizacion | 1-bit (BitNet, Gale) y 8-bit (segun tags) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Ministral 3, con variantes de 3B, 8B y 14B parametros. La version de razonamiento fue post-entrenada especificamente para tareas de razonamiento multi-paso, matematicas, codigo y STEM, con una ventana de contexto de 256k tokens y capacidades de vision.

Esta variante de `benjzzz` aplica cuantizacion de 1 bit basada en las tecnicas de BitNet y Gale, junto con transformadas de Hadamard, y fue entrenada con QAT (Quantization-Aware Training) para reducir la perdida de precision. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso exacto de cuantizacion. Dado que el numero de parametros no coincide con el modelo original de 14B, es probable que el autor haya partido de un checkpoint distinto o haya realizado una poda previa, aunque no hay documentacion al respecto.

## Capacidades

- Generacion de texto y conversacion en ingles.
- Razonamiento complejo y multi-paso (heredado del modelo base, aunque la cuantizacion de 1 bit puede degradar la precision).
- Soporte de tool calling y function calling (segun la familia Ministral 3).
- Capacidades de vision (el modelo base las tiene, pero no se confirma en esta variante).
- Soporte de agentes y razonamiento encadenado, sujeto a la degradacion por cuantizacion.

## Casos de uso

- **Despliegue en dispositivos edge**: su cuantizacion de 1 bit permite ejecutar un modelo de razonamiento en hardware con poca memoria, como Raspberry Pi o moviles, para tareas de asistencia local.
- **Prototipado rapido**: al ser un modelo pequeno (4,1B parametros), es util para validar pipelines de generacion de texto o razonamiento en entornos con limitaciones de GPU.
- **Educacion e investigacion**: sirve como ejemplo de cuantizacion extrema de modelos de lenguaje, permitiendo estudiar el impacto de la precision de 1 bit en tareas de razonamiento.
- **Sistemas de respuesta a preguntas en ingles**: puede integrarse en chatbots de bajo coste que no requieran la maxima calidad.
- **Generacion de codigo en entornos sin GPU**: con cuantizacion de 1 bit, se puede ejecutar en CPU para asistencia de programacion basica.
- **Experimentos con tecnicas de cuantizacion**: su arquitectura y el uso de Gale y Hadamard lo convierten en un caso de estudio para quienes investigan metodos de compresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que es una cuantizacion de 1 bit de un modelo de razonamiento, es esperable una degradacion significativa frente al modelo original en tareas como MMLU, HumanEval o GSM8K, pero no hay datos que lo confirmen.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4,1B parametros y cuantizacion de 1 bit, la memoria necesaria para los pesos es de aproximadamente 0,5 GB, mas overhead de activaciones y KV cache. En la practica, se recomienda al menos 2-4 GB de VRAM para una ejecucion comoda.
- **GPU recomendadas**: cualquier GPU con 4 GB o mas de VRAM, como una GTX 1650, RTX 3050 o superior. Tambien puede ejecutarse en CPU con suficiente RAM (6-8 GB).
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de gama de entrada y en integradas.
- **Opciones de despliegue**: al ser un modelo con pesos en safetensors, puede cargarse con transformers, llama.cpp, Ollama (si se convierte a GGUF) o vLLM (con adaptaciones). No se proporcionan ficheros GGUF en el repositorio.
- **Latencia y throughput**: no hay datos disponibles. La cuantizacion de 1 bit puede acelerar la inferencia en hardware dedicado, pero en CPU el rendimiento depende de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ministral-3-14B-Reasoning (original) | 14B | 256k | Apache 2.0 | HuggingFace oficial |
| Ministral-3-14B-Reasoning-1bit-Gale (este) | 4,1B (segun safetensors) | no disponible | Apache 2.0 | HuggingFace (gated) |
| Ministral-3-8B-Reasoning (original) | 8B | 256k | Apache 2.0 | HuggingFace oficial |

La comparativa es compleja porque el numero de parametros no coincide con el nombre. Si realmente se trata de una cuantizacion del modelo de 14B, el tamaño de los pesos deberia ser de 14B parametros, no 4,1B. Esto sugiere que el autor pudo haber trabajado sobre una version podada o sobre un modelo distinto. En cualquier caso, la calidad del modelo cuantizado sera inferior a la del original.

## Limitaciones y advertencias

- **Discrepancia en parametros**: el nombre indica 14B pero los pesos reales suman 4,1B. Esto puede ser un error del autor o indicar que el modelo no es lo que dice ser. Es necesario verificar antes de usarlo en produccion.
- **Degradacion por cuantizacion de 1 bit**: la precision de 1 bit reduce drasticamente la calidad de las respuestas, aumentando el riesgo de alucinaciones y errores de razonamiento.
- **Acceso restringido**: el repositorio es gated, por lo que hay que solicitar acceso al autor.
- **Idioma limitado**: solo se declara soporte para ingles.
- **Sin benchmarks publicados**: no hay evidencia de rendimiento real.
- **Posibles sesgos**: al derivar de un modelo base entrenado con datos de internet, puede heredar sesgos sociales y culturales.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero dado el estado experimental del modelo, no se recomienda para aplicaciones criticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/benjzzz/Ministral-3-14B-Reasoning-1bit-Gale
- Modelo original (Mistral): https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Pagina en LM Studio: https://lmstudio.ai/models/mistralai/ministral-3-14b-reasoning
- Coleccion Ministral 3 en HuggingFace: https://huggingface.co/collections/mistralai/ministral-3
- Paper de la serie Ministral 3: https://arxiv.org/html/2601.08584v1
- Documentacion de Mistral sobre Ministral 3 14B: https://docs.mistral.ai/models/ministral-3-14b-25-12
