# CollinsStreet/ReLaDrift

## Resumen

ReLaDrift es el nombre de una familia de checkpoints de investigación publicados junto al artículo «ReLaDrift: Recurrent Language Generation via Drifting for Test-Time Scaling» (arXiv 2610.23225). No se trata de un modelo conversacional al uso, sino de un paquete de reproducibilidad: el repositorio de HuggingFace (48,5 GB) contiene los pesos entrenados del método propuesto, las ablaciones y todos los modelos de referencia con los que se compara, en dos dominios concretos: razonamiento aritmético de nivel escolar (GSM8K, con TinyGSM como dato auxiliar) y resolución de sudokus.

El interés actual del modelo es metodológico. Frente a la generación autorregresiva token a token, ReLaDrift propone una generación recurrente en espacio latente guiada por un mecanismo de *drifting*, con un decodificador latente-a-token separado; el repositorio incluye explícitamente esos decodificadores y las tablas de *embeddings* de las ablaciones. Esto lo convierte en material útil para estudiar cómputo recurrente en tiempo de inferencia (*test-time scaling*) y para comparar paradigmas generativos bajo un mismo presupuesto de entrenamiento.

La model card no publica recuento de parámetros, longitud de contexto, resultados de benchmarks ni detalles de arquitectura más allá del nombre del método, por lo que la mayor parte de las especificaciones cuantitativas figuran aquí como «no disponible». El autor del repositorio es CollinsStreet, mientras que el código de referencia vive en la organización Yuki-Ots. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generación de lenguaje latente recurrente mediante *drifting* (\`reladrift\`/\`drifting-model\`), con decodificador latente-a-token independiente; número de capas, dimensión oculta y tipo de bloque no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precisión de entrenamiento. No hay versiones int8/int4 ni GGUF |
| Idiomas soportados | inglés (\`en\`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch \`.pt\` (state dicts); en sudoku, estado completo de entrenamiento; sin safetensors ni GGUF |
| Tamano del repositorio | 48,5 GB (agregado de todos los checkpoints) |
| Checkpoints incluidos | GSM8K: 15 condiciones × pesos *raw* y EMA (ReLaDrift \`base\`, Drifting Model \`r1ns\` y ablaciones) + 5 líneas base + decodificadores. Sudoku: 11 condiciones (\`c01\`–\`c11\`) × 3 semillas + 5 líneas base × 3 semillas + FRM × 3 semillas + DFM (4 configuraciones) × 3 semillas |
| Presupuesto de entrenamiento | GSM8K: 250k actualizaciones (condiciones \`tau1\`, \`v1pq\` y \`v1pq_n4\`: 40k). Sudoku: 20k actualizaciones |
| Datos de entrenamiento | \`CollinsStreet/ReLaDrift-data\`, \`TinyGSM/TinyGSM\`, \`openai/gsm8k\` |
| Integridad | \`SHA256SUMS\` cubre todos los ficheros de \`gsm8k/\` y \`sudoku/\`; descarga y verificación vía \`scripts/data/download_checkpoints.sh\` |
| Version del articulo | arXiv 2610.23225 |

## Arquitectura y entrenamiento

El método se describe en el título como «generación de lenguaje recurrente mediante drifting para escalado en tiempo de inferencia». La estructura del repositorio confirma dos piezas separadas: un modelo generador que opera en espacio latente de forma recurrente y un decodificador latente-a-token entrenado aparte (\`gsm8k/decoder/\`). El repositorio de código contiene los scripts de muestreo y evaluación (\`scripts/sample/\`) necesarios para ejecutar los checkpoints. Los detalles concretos de la arquitectura —número de iteraciones recurrentes, dimensión latente, mecanismo exacto de *drifting*, función de pérdida— no están en la información disponible y deben consultarse en el artículo.

El entrenamiento se realizó con PyTorch Lightning: las líneas base se describen como «upstream Lightning checkpoints», y los ficheros de sudoku conservan el estado completo de entrenamiento (optimizador incluido), lo que sugiere runs de investigación ejecutados con esa infraestructura. Se publican pesos brutos y medias móviles exponenciales (EMA), un detalle relevante para estudiar estabilidad de entrenamiento. Las líneas base AR, S-FLM, Duo, MDLM y FMLM+ se entrenaron con código importado de los repositorios S-FLM y posterior-refinement, ambos Apache 2.0. El conjunto de datos de entrenamiento propio es \`CollinsStreet/ReLaDrift-data\`, complementado con TinyGSM y GSM8K para la tarea aritmética; no se especifica el número de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de lenguaje en inglés mediante un esquema no autorregresivo (recurrente en latente), orientado a tareas con respuesta verificable.
- Razonamiento aritmético de nivel escolar: los checkpoints de \`gsm8k/\` están entrenados sobre GSM8K y TinyGSM.
- Resolución de sudoku como tarea de razonamiento restringido con solución única verificable.
- Decodificación latente-a-token: se incluyen los decodificadores entrenados para traducir el estado latente a tokens.
- Evaluación de *test-time scaling*: el método permite aumentar cómputo en inferencia mediante recurrencia, que es precisamente la hipótesis que el repositorio permite medir.
- Comparación controlada de paradigmas: se distribuyen cinco líneas base (AR, S-FLM, Duo, MDLM, FMLM+) con el mismo presupuesto de actualizaciones, lo que habilita comparaciones reproducibles.
- No dispone de *tool calling*, *function calling*, soporte de agentes, multimodalidad ni modo de razonamiento explícito tipo *thinking*; no hay ninguna indicación de ello en la información disponible.
- Multilingüismo: no. Solo inglés declarado.

## Casos de uso

- Reproducción de experimentos de *test-time scaling*: cargar los checkpoints \`gsm8k/reladrift/base\` (pesos *raw* y EMA) y ejecutar \`scripts/sample/\` para medir cómo escala la precisión al aumentar el cómputo recurrente en inferencia, con la ventaja de que el repo incluye el script de descarga y verificación por SHA256.
- Comparativa de paradigmas generativos: usar los cinco baselines incluidos (AR, S-FLM, Duo, MDLM, FMLM+) entrenados a 250k actualizaciones sobre el mismo dato para aislar el efecto del paradigma frente al del presupuesto de entrenamiento.
- Estudio de EMA de pesos: los checkpoints se publican por duplicado (*raw* y EMA), lo que permite medir directamente el efecto de las medias móviles sobre la calidad de muestra sin reentrenar.
- Investigación sobre decodificación latente: los decodificadores de \`gsm8k/decoder/\` y la tabla de *embeddings* aleatorios de la ablación \`rndtab\` permiten analizar cuánta información del token queda codificada en el latente y aislar el papel del decodificador.
- Ablaciones de arquitectura en dominios acotados: las 11 condiciones de sudoku (\`c01\`–\`c11\`) con tres semillas cada una permiten estudiar sensibilidad a hiperparámetros con intervalos de confianza, algo poco habitual en publicaciones de modelos.
- Docencia y divulgación técnica: como ejemplo ejecutable de modelo generativo no autorregresivo con presupuesto de entrenamiento modesto (20k–250k actualizaciones), es adecuado para cursos de modelos generativos y para ilustrar alternativas a la decodificación autorregresiva.
- Verificación de pipelines de evaluación: el conjunto (checkpoints + datos + scripts de muestreo + sumas de verificación) sirve como banco de pruebas para validar herramientas internas de evaluación de razonamiento matemático antes de aplicarlas a modelos grandes.
- Reutilización de componentes: los decodificadores latente-a-token y las recetas de entrenamiento pueden adaptarse a otros dominios con respuesta verificable; la licencia Apache 2.0 lo permite explícitamente, incluido uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la organización de los checkpoints y el presupuesto de entrenamiento (250k actualizaciones en GSM8K, 20k en sudoku), pero no incluye cifras de precisión en GSM8K, tasa de resolución de sudoku ni comparaciones numéricas frente a las líneas base. Cualquier número de rendimiento debe obtenerse ejecutando los scripts de \`scripts/sample/\` del repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el recuento de parámetros de ningún checkpoint, por lo que no es posible dar una cifra fiable.
- Contexto para interpretar el tamaño: el repositorio completo ocupa 48,5 GB, pero ese total agrega decenas de checkpoints (15 condiciones × 2 variantes de pesos en GSM8K, 11 condiciones × 3 semillas en sudoku, más baselines, decodificadores y estados completos de entrenamiento). El tamaño de un checkpoint individual es muy inferior al total, aunque no se detalla.
- Guía genérica de estimación (no específica de este modelo): en fp32 se necesitan ~4 bytes por parámetro, ~2 en fp16/bf16 y ~1 en int8. Un modelo de 100M de parámetros ocuparía ~0,4 GB en fp32; uno de 1B, ~4 GB.
- GPU recomendadas: no disponible. Dado que el entrenamiento se hizo con PyTorch Lightning sobre GSM8K/TinyGSM y sudoku, es plausible que los checkpoints quepan en una única GPU de consumo, pero esto no está confirmado en la información proporcionada.
- Despliegue: no hay soporte conocido para vLLM, TGI, llama.cpp, Ollama ni formato GGUF. La vía prevista es el repositorio de código (Yuki-Ots/ReLaDrift), con descarga vía \`scripts/data/download_checkpoints.sh\` y evaluación vía \`scripts/sample/\`.
- Latencia y throughput: no disponible.
- Almacenamiento: prever espacio para 48,5 GB si se descarga el conjunto completo; los checkpoints de sudoku incluyen estado de entrenamiento, por lo que son considerablemente más pesados que un simple state dict de inferencia.

## Comparativa con modelos similares

La comparación natural es con las líneas base que el propio repositorio distribuye, ya que comparten datos y presupuesto de actualizaciones. Los detalles de arquitectura y tamaño de cada una no están en la información disponible.

| Modelo | Rol en el repositorio | Actualizaciones | Contexto | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ReLaDrift (\`base\`) | Método propuesto | 250k (GSM8K) / 20k (sudoku) | no disponible | no disponible | Apache 2.0 | Pesos en este repo |
| Drifting Model (\`r1ns\`) | Variante del método | 250k / 20k | no disponible | no disponible | Apache 2.0 | Pesos en este repo |
| AR | Línea base autorregresiva | 250k / 20k | no disponible | no disponible | Apache 2.0 | Pesos en este repo |
| S-FLM | Línea base (código de \`jdeschena/s-flm\`) | 250k / 20k | no disponible | no disponible | Apache 2.0 | Pesos en este repo |
| Duo | Línea base | 250k / 20k | no disponible | no disponible | Apache 2.0 | Pesos en este repo |
| MDLM | Línea base | 250k / 20k | no disponible | no disponible | Apache 2.0 | Pesos en este repo |
| FMLM+ | Línea base (código de \`posterior-refinement\`) | 250k / 20k | no disponible | no disponible | Apache 2.0 | Pesos en este repo |
| FRM / DFM | Líneas base adicionales (solo sudoku) | 20k | no disponible | no disponible | Apache 2.0 | Pesos en este repo |

No se dispone de comparación con modelos de propósito general (LLaMA, Qwen, Mistral u otros) porque ReLaDrift no es un modelo de chat ni comparte tokenizador o formato de uso con ellos.

## Limitaciones y advertencias

- No es un modelo de propósito general: no hay instrucciones, formato de chat, plantilla de prompt ni ajuste por preferencias documentado. No debe utilizarse como asistente conversacional.
- Dominio muy restringido: aritmética de nivel escolar y sudoku. Fuera de esos dominios no hay ninguna garantía de comportamiento.
- Solo inglés declarado; no hay evaluación multilingüe y el tokenizador no se documenta.
- Riesgo de alucinación alto fuera de distribución: al no haber ajuste por preferencias ni evaluación de fidelidad, las salidas en lenguaje natural pueden ser incoherentes.
- Ausencia total de cifras de rendimiento: no se puede afirmar que el método supere a las líneas base sin ejecutar la evaluación. Cualquier comparación debe hacerse con los scripts del repositorio.
- Sesgos: no hay ninguna evaluación de sesgos ni de toxicidad en la información disponible. Los datos de GSM8K y TinyGSM son de problemas aritméticos, con sesgos propios del corpus original.
- Los checkpoints de sudoku contienen el estado completo de entrenamiento, no solo pesos de inferencia: hay que extraer los pesos del modelo antes de desplegarlos, y el espacio en disco es sensiblemente mayor.
- Requiere el código del repositorio para cualquier uso práctico: no hay integración con runtimes estándar (vLLM, llama.cpp, TGI), lo que eleva el coste de adopción en producción.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y el texto de atribución. Las líneas base proceden de S-FLM y posterior-refinement, también Apache 2.0, por lo que la cadena de licencias es compatible.
- Las licencias de los datasets de origen (GSM8K, TinyGSM, ReLaDrift-data) no se detallan en la model card; conviene verificarlas antes de un uso comercial del modelo entrenado.
- Modelo con cero descargas y cero *likes* en el momento de la consulta: no hay evidencia de adopción ni de validación independiente por terceros.
- Coherencia de autoría: el repositorio está bajo la cuenta CollinsStreet, mientras que el código se aloja en Yuki-Ots; conviene citar ambas fuentes correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollinsStreet/ReLaDrift
- Dataset de entrenamiento: https://huggingface.co/datasets/CollinsStreet/ReLaDrift-data
- Articulo (arXiv 2610.23225): https://arxiv.org/abs/2610.23225
- Codigo: https://github.com/Yuki-Ots/ReLaDrift
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset TinyGSM: https://huggingface.co/datasets/TinyGSM/TinyGSM
- Codigo de la linea base S-FLM: https://github.com/jdeschena/s-flm
- Codigo de la linea base FMLM+: https://github.com/MananAg007/posterior-refinement
