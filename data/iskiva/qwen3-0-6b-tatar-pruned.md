# iskiva/qwen3-0.6b-tatar-pruned

## Resumen

iskiva/qwen3-0.6b-tatar-pruned es una variante del modelo Qwen/Qwen3-0.6B cuyo tokenizer ha sido podado especificamente para el tatar (codigo ISO `tt`), una lengua de bajos recursos. Lo publica el usuario iskiva (Ruslan Ziyazetdinov) como trabajo de la asignatura "Modern Methods and Algorithms of Generative AI" del Skoltech (otono de 2026), y parte del modelo base de Alibaba Qwen.

La innovacion principal es la reduccion del vocabulario: el tokenizer original de Qwen3 pasa de 151.669 a 12.576 identificadores, aplicando un umbral m = 1 sobre 10 MB de Wikipedia en tatar con cierre sobre merges. Como consecuencia, el modelo baja de 596,0M a 453,4M parametros (453.378.048 segun los pesos en safetensors), manteniendo un rendimiento ligeramente mejor en la metrica de bits por byte sobre un conjunto de validacion de Wikipedia en tatar (503 KB): de 1,5383 a 1,5333.

La relevancia de esta ficha es doble: por un lado es un ejemplo practico de pruning de tokenizer como tecnica para adaptar modelos generalistas a lenguas minoritarias, reduciendo tamano y coste de inferencia; por otro, es un modelo de laboratorio (0 descargas y 0 likes en el momento de la consulta) pensado para investigacion y experimentacion, no para produccion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-0.6B); detalles de capas no disponibles en la model card |
| Parametros totales | 453.378.048 (~453,4M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada del base Qwen/Qwen3-0.6B: 32.768 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (~0,9 GB en total, compatible con fp16/bf16) |
| Idiomas soportados | tatar (`tt`); vocabulario podado especificamente para este idioma |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura decoder-only de Qwen/Qwen3-0.6B, un transformer causal con atencion y normalizacion propias de la familia Qwen3. La modificacion respecto al modelo base no afecta a la estructura de capas ni al mecanismo de atencion, sino exclusivamente a la matriz de embeddings y a la cabeza de salida asociada al vocabulario, que se reducen al eliminar los identificadores no relevantes para el tatar.

El proceso aplicado es un pruning de tokenizer: se parte de 10 MB de Wikipedia en tatar, se calcula la frecuencia de los tokens y se eliminan aquellos que no superan un umbral m = 1, aplicando ademas un cierre sobre merges para garantizar la coherencia de las reglas de fusion (BPE). El resultado es un vocabulario de 12.576 ids frente a los 151.669 originales, con una reduccion de 139.093 identificadores. La model card no especifica si hubo un paso posterior de fine-tuning ni detalla el numero de tokens de entrenamiento adicionales; solo reporta la metrica de bits por byte sobre el conjunto de validacion, que mejora de 1,5383 a 1,5333.

## Capacidades

- Generacion de texto en tatar, idioma para el que se ha optimizado el vocabulario.
- Reduccion del numero de tokens necesarios para representar texto en tatar, lo que disminuye el coste por secuencia en inferencia.
- Hereda la arquitectura y los pesos de Qwen3-0.6B, por lo que conserva parte del comportamiento del modelo base en las dimensiones de embedding reutilizadas.
- Razonamiento general, generacion de codigo, matematicas y tool calling: no confirmados tras el pruning; la model card no aporta evaluaciones en estas tareas.
- Capacidad multilingue: muy limitada o nula, ya que el vocabulario de 12.576 ids esta restringido al tatar y no cubre otros idiomas.
- Modo de pensamiento (thinking), vision, audio u otras capacidades multimodales: no disponibles.
- Integracion directa con `transformers` mediante `AutoModelForCausalLM` y `PreTrainedTokenizerFast`.

## Casos de uso

- Investigacion en pruning de tokenizer: reproducir el experimento de umbral m = 1 sobre 10 MB de Wikipedia en tatar y comparar la metrica de bits por byte con el modelo base. Es el uso principal al tratarse de un trabajo academico.
- Generacion de texto en tatar: redaccion y continuacion de textos en este idioma con un modelo de 453,4M de parametros, viable en hardware modesto.
- Prototipado en dispositivos con pocos recursos: al ocupar aproximadamente 0,9 GB en fp16, puede ejecutarse en portatiles, mini-PC o incluso en CPU, lo que facilita pruebas de concepto en entornos sin GPU dedicada.
- Punto de partida para fine-tuning especifico de dominio en tatar: al tener un vocabulario ya adaptado, se reduce el coste de adaptar el modelo a corpus legales, medicos o periodisticos en ese idioma.
- Evaluacion comparativa de eficiencia de tokenizacion: medir cuantos tokens consume una misma frase en tatar con este tokenizer frente al de Qwen3 base, para cuantificar el ahorro en contextos largos.
- Docencia y practicas academicas: sirve como caso de estudio reproducible en asignaturas de generacion de lenguaje, mostrando el impacto de la poda de vocabulario en parametros y en la metrica de compresion.
- Experimentacion en lenguas de bajos recursos: base metodologica replicable para otras lenguas minoritarias con corpus limitados de Wikipedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato reportado por el autor es la metrica de bits por byte sobre un conjunto de validacion de Wikipedia en tatar (503 KB):

| Metrica | Qwen/Qwen3-0.6B (base) | iskiva/qwen3-0.6b-tatar-pruned |
|---|---|---|
| Bits por byte en Wikipedia tatar (validacion, 503 KB) | 1,5383 | 1,5333 |
| Tamano de vocabulario (ids) | 151.669 | 12.576 |
| Parametros totales | 596,0M | 453,4M |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 a 1,0 GB en fp16/bf16 y en torno a 1,8 GB en fp32. Cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, T4, L4, e incluso en GPUs integradas con suficiente memoria compartida.
- Inferencia en CPU: viable por el reducido tamano del modelo (453,4M de parametros); es una de sus principales ventajas.
- Cabe en consumer GPU: si, sin ninguna limitacion practica por memoria.
- Opciones de despliegue: `transformers` de forma nativa segun el ejemplo de la model card. vLLM, TGI, llama.cpp u Ollama requeririan adaptar o convertir el tokenizer y los pesos, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iskiva/qwen3-0.6b-tatar-pruned | 453,4M | no confirmado (base 32.768) | tatar (`tt`) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-0.6B | 596,0M | 32.768 | multilingue | apache-2.0 | HuggingFace |

No se identifican en la informacion disponible otros modelos comparables especificos para el tatar con tokenizer podado. La comparacion mas directa es contra su propio modelo base, Qwen/Qwen3-0.6B: el modelo podado tiene un 23,9% menos de parametros y un vocabulario 12 veces menor, a cambio de perder cobertura multilingue.

## Limitaciones y advertencias

- El vocabulario de 12.576 ids esta restringido al tatar; es previsible un rendimiento muy pobre o directamente inutilizable en castellano, ingles u otros idiomas, ya que el tokenizer no cubre sus subunidades.
- La model card no documenta sesgos. Al derivar de Qwen3-0.6B y de Wikipedia en tatar, puede heredar los sesgos presentes en esas fuentes.
- Riesgo de alucinacion propio de un modelo de 453,4M de parametros; la capacidad de razonamiento y de hechos verificables es limitada.
- No hay resultados de benchmarks de calidad (razonamiento, codigo, matematicas), solo la metrica de bits por byte, insuficiente para garantizar un comportamiento correcto en produccion.
- No se especifica si hubo fine-tuning tras el pruning, por lo que se desconoce hasta que punto el modelo ha recuperado calidad respecto al base.
- La licencia apache-2.0 permite uso comercial, pero el modelo base conserva esa misma licencia, por lo que no hay restricciones adicionales conocidas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-08) corresponde al contexto academico de la asignatura; conviene verificar la vigencia de los pesos y del tokenizer antes de reutilizarlos.
- Al tratarse de un trabajo de curso, no se garantiza mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iskiva/qwen3-0.6b-tatar-pruned
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
