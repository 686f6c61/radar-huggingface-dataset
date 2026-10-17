# Ridopandi/qwen3-4b-text2cypher-en-id-qlora

# qwen3-4b-text2cypher-en-id-qlora

## Resumen

qwen3-4b-text2cypher-en-id-qlora es un adaptador QLoRA que se monta sobre el modelo base Qwen/Qwen3-4B (4.000 millones de parametros) para convertir preguntas en ingles o indonesio, junto con un esquema fijo de peliculas, en consultas Cypher de solo lectura para Neo4j. Lo desarrolla el usuario Ridopandi como prototipo de investigacion y pieza de portafolio, y esta publicado con licencia Apache 2.0. No es un modelo completo: el autor distribuye unicamente los pesos del adaptador, mientras que los pesos base de Qwen3-4B se descargan por separado.

El problema que aborda es el text-to-cypher bilingue, es decir, traducir lenguaje natural a Cypher para consultar un grafo de conocimiento concreto. El adaptador se entreno con decodificacion sin razonamiento explicito (thinking desactivado) y generacion codiciosa, limitado a un unico esquema de grafo. Segun la evaluacion historica del autor, el adaptador alcanza 52/82 respuestas correctas en ingles (63,4 %) y 49/82 en indonesio (59,8 %), frente a 15/82 (18,3 %) y 11/82 (13,4 %) del modelo base preparado con NF4. El objetivo declarado de 62/82 por idioma no se alcanzo, por lo que el modelo se presenta como prototipo de investigacion y no como solucion de produccion.

Su relevancia radica en la transparencia del proceso: el autor publica resultados de validacion desglosados por epoca y tasa de aprendizaje, un explorador de validacion con los 74 ejemplos revisados y el detalle de las seis comprobaciones de correccion. Es un ejemplo util de como reportar un adaptador pequeno y especializado, incluyendo fracasos, en lugar de solo cifras agregadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-4B) + adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones en el modelo base; 33.030.144 parametros entrenables en el adaptador |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-4B (no especificado en la ficha para el adaptador) |
| Tipos de cuantizacion | NF4 con doble cuantizacion (QLoRA) para el modelo base; adaptador en precision de entrenamiento |
| Idiomas soportados | ingles (en) e indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base se descarga aparte |

## Arquitectura y entrenamiento

El sistema combina el modelo denso Qwen3-4B con un adaptador LoRA entrenado mediante QLoRA. Durante el entrenamiento, los pesos base se mantienen congelados en NF4 con doble cuantizacion, y solo se actualizan las matrices de bajo rango. El adaptador tiene rango 16, alpha 32 y dropout 0,05, y se aplica a los modulos de proyeccion q/k/v/o y gate/up/down. El optimizador es AdamW con tasa de aprendizaje constante de 0,0002, batch efectivo de 8 y 150 actualizaciones por epoca, con semilla 42. La funcion de perdida supervisa el Cypher y el token EOS, mientras que los tokens del prompt y el salto de linea final quedan enmascarados.

Los datos provienen del dataset Ridopandi/movies-text2cypher-en-id-v3, con 600 pares de entrenamiento (1.200 filas bilingues), 37 pares de validacion y 82 pares de test historico. El checkpoint seleccionado corresponde a la epoca 1, paso 150, de una tasa de 0,0002, elegido por una regla de seleccion que prioriza primero el idioma mas debil, despues el recuento combinado de aciertos y, por ultimo, la NLL de validacion mas baja. La inferencia usa NF4 preparado con parametros base en FP32 y computo en FP16/autocast, desactiva el modo thinking y decodifica de forma codiciosa con limite de 256 tokens.

## Capacidades

- Generacion de consultas Cypher de solo lectura a partir de preguntas en ingles o indonesio.
- Traduccion condicionada a un esquema fijo de grafo de peliculas (un unico esquema).
- Soporte bilingue limitado a ingles e indonesio.
- Generacion alineada con la estructura del esquema y produccion de token EOS para marcar el final de la consulta.
- Integracion con Neo4j para la ejecucion de la consulta generada y la recuperacion de filas.
- Decodificacion determinista (greedy) que favorece la reproducibilidad frente a la diversidad.

## Casos de uso

- Consultas a grafos de peliculas en Neo4j: el adaptador traduce preguntas como el numero de peliculas del grafo a Cypher ejecutable, util para interfaces de analisis sobre un esquema conocido.
- Asistentes de consulta bilingues: al soportar ingles e indonesio, permite que usuarios de ambos idiomas formulen preguntas sobre el mismo grafo sin escribir Cypher.
- Prototipo de investigacion en text-to-cypher: sirve como punto de partida reproducible para estudiar el efecto de QLoRA en tareas de traduccion a lenguaje de consulta.
- Generacion de consultas de solo lectura en entornos controlados: al admitir unicamente consultas de lectura, encaja en escenarios donde no se debe permitir la escritura sobre la base de datos.
- Material docente: los 74 ejemplos de validacion y las seis comprobaciones de correccion permiten ilustrar la evaluacion de modelos de generacion de codigo/consultas.
- Base para ampliar a otros esquemas o idiomas: el pipeline de entrenamiento y la regla de seleccion de checkpoint son reutilizables para adaptadores similares.
- Automatizacion de informes sobre un grafo fijo: con la ejecucion en Neo4j, se pueden encadenar preguntas predefinidas para extraer agregados concretos.

## Benchmarks y rendimiento

Resultados historicos publicados por el autor sobre 82 pares bilingues de test (164 entradas por variante). Una respuesta se considera correcta solo si supera las seis comprobaciones: admision de solo lectura, sintaxis, ejecucion, esquema, significado y resultado. Los fallos y salidas truncadas se mantienen en el denominador.

| Variante | Ingles correcto | Indonesio correcto |
|---|---:|---:|
| Base NF4 preparada | 15/82 (18,3 %) | 11/82 (13,4 %) |
| Adaptador seleccionado | 52/82 (63,4 %) | 49/82 (59,8 %) |

Validacion interna (37 pares por idioma) por tasa de aprendizaje y epoca:

| LR constante | Epoca | Ingles /37 | Indonesio /37 | NLL validacion |
|---|---:|---:|---:|---:|
| 0,0002 | 1 (seleccionada) | 21 | 21 | 0,291827 |
| 0,0002 | 2 | 15 | 18 | 0,355199 |
| 0,0002 | 3 | 18 | 14 | 0,356251 |
| 0,0002 | 4 | 20 | 18 | 0,495397 |
| 0,0001 | 1 | 22 | 19 | 0,294355 |
| 0,0001 | 2 | 17 | 16 | 0,354366 |
| 0,0001 | 3 | 19 | 17 | 0,370541 |
| 0,0001 | 4 | 17 | 20 | 0,438990 |

No se publicaron resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos anteriores son resultados especificos del proyecto, no una puntuacion oficial del dataset de origen ni un benchmark entre esquemas.

## Requisitos de hardware

- VRAM estimada: el modelo base en NF4 ocupa aproximadamente 2,5-3 GB de pesos, y en FP16 en torno a 8-9 GB. Con el adaptador cargado y el contexto de inferencia, se recomienda un minimo de 8 GB y con holgura 12-16 GB.
- GPU recomendadas: para inferencia en FP16, una GPU de 16 GB o mas (T4, RTX 4080/4090, A100). El autor indica explicitamente el uso de una T4 GPU en el cuaderno de prueba.
- Cabe en GPU de consumo: si, en NF4 cabe en tarjetas de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070); en FP16 conviene una GPU de 16 GB o superior.
- Opciones de despliegue: el repositorio incluye infer.py con carga del adaptador mediante PEFT y transformers, ademas de requirements.txt. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

En la informacion proporcionada no se incluyen adaptadores ni modelos comparables de text-to-cypher con los que contrastar parametros, contexto o licencia de forma objetiva. Como referencia estructural, la alternativa directa es el propio modelo base Qwen/Qwen3-4B sin adaptador (mismo tamano y contexto; sin especializacion en Cypher; licencia propia del base), frente al cual el adaptador mejora la exactitud en la tarea segun los datos del autor. No se dispone de comparaciones publicadas con otros adaptadores de text-to-cypher.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Este adaptador (sobre Qwen3-4B) | 33,03 M entrenables + 4 B base | 32.768 (base) | Text-to-cypher bilingue, un esquema | Apache 2.0 |
| Qwen3-4B sin adaptador | 4 B | 32.768 | Generacion general | propia del base |
| Otros adaptadores de text-to-cypher | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Prototipo de investigacion y portafolio: no esta validado para produccion ni para uso general.
- Restringido a un unico esquema y un unico grafo de peliculas; el autor no redistribuye el fixture del grafo ni el servidor Neo4j.
- Solo genera consultas de lectura; cualquier ejecucion debe realizarse con controles de solo lectura en Neo4j.
- La revision semantica se hizo con un asistente de IA y no cuenta con revision humana independiente, por lo que los recuentos de acierto pueden estar sesgados.
- El adaptador no alcanzo el objetivo declarado de 62/82 por idioma sobre el test historico.
- Los pares de traduccion del test son observaciones correlacionadas, lo que limita la interpretacion estadistica.
- La seleccion del checkpoint prioriza el idioma mas debil, de modo que el recuento combinado no es necesariamente el maximo posible.
- No se realizo un test final nuevo para las fases posteriores ni para esta publicacion; los resultados no establecen una tasa de aprendizaje ni una epoca globalmente optima.
- El desarrollo del autor advierte que un cargador generico con otra precision o ajustes de decodificacion puede producir salidas distintas de las documentadas.
- Riesgo de alucinacion: puede generar Cypher sintacticamente valido pero semanticamente incorrecto; ejecutar y obtener filas no garantiza que el significado sea correcto.
- Idiomas limitados a ingles e indonesio; no hay soporte documentado para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones practicas derivan del modelo base y de la necesidad de revisar cada consulta generada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ridopandi/qwen3-4b-text2cypher-en-id-qlora
- Dataset: https://huggingface.co/datasets/Ridopandi/movies-text2cypher-en-id-v3
- Repositorio del proyecto: https://github.com/ridopandiSinaga/qwen-qlora-text-to-cypher
- Cuaderno de prueba: try_model.ipynb (incluido en el repositorio de HuggingFace)
- Explorador de validacion: demo/index.html (incluido en el repositorio de HuggingFace)
- Resultados de evaluacion: evaluation.json (incluido en el repositorio de HuggingFace)
