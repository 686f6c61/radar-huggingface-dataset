# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF

## Resumen

Jev-Style-Qwen3.5-2B-Decision-v2-GGUF es la distribucion cuantizada en formato GGUF de un modelo de decision de 1.880 millones de parametros desarrollado por chaoliangUNSW. No es un modelo generativo de proposito general: su funcion es recibir un estado, una pregunta y una lista de opciones cerradas, y devolver en un unico prefill la opcion seleccionada junto con probabilidades calibradas. El repositorio contiene tres builds (Q4_K_M, Q8_0 y BF16) con calibracion ajustada de forma independiente para cada una.

El modelo parte de un backbone de texto de clase 2B de la familia Qwen3.5 y se ha adaptado mediante LoRA de rango 32 durante 36,9 minutos de entrenamiento principal en una unica H100 de 80 GB. El resultado declarado es un 81,20 % de exactitud macro en un panel de referencia en ingles con 3.277 decisiones y 11 grupos de tarea, frente al 76,68 % de su version v1 y al 75,09 % de English Laya. Ademas de la exactitud, la model card insiste en la calidad probabilistica: NLL de 0,5154, Brier de 0,2787 y una tasa de inversion por permutacion de opciones del 6,00 %.

Su relevancia practica esta en el nicho de enrutado, clasificacion y eleccion tipada con confianza explotable: al emitir probabilidades calibradas, permite fijar umbrales de decision y derivar a un humano o a un modelo mayor cuando la confianza es baja. La contrapartida es que solo esta evaluado y declarado en ingles, no publica longitud de contexto y su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder sobre backbone de texto de clase 2B de la familia Qwen3.5; detalles de capas y atencion no disponibles |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, GGUF Q8_0 y GGUF BF16, cada uno con calibracion ajustada de forma independiente |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors BF16 en el repositorio base y BF16 en la variante MLX |
| Tamano de pesos | Q4_K_M 1,27 GB; Q8_0 2,01 GB; BF16 3,78 GB |
| Tamano del repositorio | 7,1 GB |
| Tarea declarada | Text-generation; uso como modelo de decision, clasificacion, enrutado y eleccion tipada |
| Modelo base | chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2 |
| Temperatura de inferencia | 1.0 (las tres builds incorporan calibracion propia) |

## Arquitectura y entrenamiento

La informacion disponible describe un backbone de texto de clase 2B sobre el que se aplica una adaptacion LoRA de rango 32, con un coste de entrenamiento principal de 36,9 minutos en una H100 de 80 GB. No se detallan el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto soportada. El tag `single-prefill` de la model card indica que la decision completa se resuelve en un unico paso de prefill sobre la secuencia estado-pregunta-opciones, sin decodificacion autoregresiva multiple.

El aspecto diferencial es la calibracion. La temperatura se ajusta sobre un split de calibracion de 3.100 registros; los clientes de HF y MLX aplican esa calibracion automaticamente, mientras que en las builds GGUF la calibracion queda incorporada en el tensor de normalizacion final del fichero. El panel de evaluacion descrito usa 11 grupos de tarea con etiquetas reales y pesos de tarea iguales, mas un grupo separado de 2.000 decisiones tipadas de referencia de profesor sobre 400 estados, que se excluye del calculo macro. No se especifica la composicion del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion con opciones cerradas: dado un estado y una lista de opciones, devuelve la opcion elegida y su probabilidad.
- Enrutado y eleccion tipada (typed decisions), incluidas decisiones con formato de tipo declarado.
- Probabilidades calibradas por temperatura, aptas para umbrales de confianza y abstención.
- Analisis de sentimiento binario y multietiqueta (evaluado en SST-2, SST-5, Emotion e IMDb).
- Inferencia de lenguaje natural (MNLI, ANLI, RTE, HANS) y respuesta a preguntas booleanas (BoolQ).
- Clasificacion de topicos de noticias (AG News) y deteccion de spam (Enron spam).
- Politicas de umbral programaticas: evaluado en un test de 200 pares contrafactuales de reglas de umbral.
- Estabilidad frente al orden de opciones: 6,00 % de tasa de inversion con permutacion de opciones.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni thinking mode explicito.
- Capacidad multilingue: no disponible; el modelo solo declara ingles.

## Casos de uso

- Enrutado de consultas en un sistema multi-modelo: el modelo recibe la consulta del usuario y una lista de destinos posibles (modelo pequeno, modelo grande, recuperacion documental, atencion humana) y devuelve la ruta con probabilidad asociada, lo que permite fijar un umbral de escalado.
- Moderacion con abstención: clasifica contenido en categorias cerradas y, gracias a las probabilidades calibradas, permite derivar a revision humana los casos con confianza por debajo del umbral en lugar de forzar una etiqueta.
- Clasificacion de tickets de soporte: con 1,27 GB en Q4_K_M puede ejecutarse en CPU o en una GPU de gama de entrada y asignar categoria y prioridad a cada ticket sin coste de API externa.
- Filtrado de spam y correo no deseado: el 97,67 % declarado en Enron spam lo hace util como clasificador de primera linea dentro de un pipeline de correo antes de aplicar reglas mas costosas.
- Analisis de sentimiento en resenas de producto o de cine: cubre tanto polaridad binaria (SST-2, 96,33 % en IMDb) como cinco niveles (SST-5) y ocho emociones (Emotion, 85,33 %), con la salvedad de que SST-5 ronda el 60 %.
- Control de calidad de anotaciones: el modelo se usa como preanotador sobre datasets de NLI y clasificacion y solo se revisan manualmente los ejemplos donde la confianza calibrada es baja, reduciendo el coste de anotacion.
- Validacion de reglas de negocio: el test de politicas de umbral contrafactuales sugiere su uso para comprobar que un par de decisiones opuestas bajo un mismo criterio se resuelven de forma coherente (71,50 % de pares correctos en v2).
- Inferencia determinista en produccion: al resolver la decision en un unico prefill, se puede integrar en servicios con requisitos de latencia estables y sin decodificacion autoregresiva.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el panel de referencia fijo en ingles (11 grupos de tarea con etiquetas reales, 3.277 decisiones, pesos de tarea iguales):

| Metrica | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Exactitud | 76,68 % | 75,09 % | 81,20 % |
| Macro-F1 | 75,42 % | 73,45 % | 79,78 % |
| Negative log-likelihood (menor es mejor) | 0,5752 | 0,6318 | 0,5154 |
| Brier score (menor es mejor) | 0,3290 | 0,3482 | 0,2787 |

Resultados por precision de la build GGUF (acuerdo de eleccion frente a BF16 fusionado en CUDA sobre un subconjunto congelado de 500 decisiones, y exactitud macro sobre ejemplos con etiqueta real):

| Precision | Tamano | Acuerdo de eleccion | Exactitud macro |
|---|---:|---:|---:|
| Q4_K_M | 1,27 GB | 91,4 % | 78,18 % |
| Q8_0 | 2,01 GB | 99,2 % | 78,69 % |
| BF16 | 3,78 GB | 99,6 % | 79,36 % |

Resultados por tarea (etiquetas reales):

| Tarea | Ejemplos | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|---:|
| AG News | 300 | 87,67 % | 89,00 % | 88,00 % |
| ANLI | 300 | 48,00 % | 49,67 % | 48,67 % |
| BoolQ | 300 | 82,67 % | 75,67 % | 81,67 % |
| Emotion | 300 | 58,33 % | 60,33 % | 85,33 % |
| Enron spam | 300 | 77,33 % | 96,33 % | 97,67 % |
| HANS | 300 | 68,00 % | 75,00 % | 68,00 % |
| IMDb | 300 | 96,67 % | 93,67 % | 96,33 % |
| MNLI | 300 | 86,67 % | 85,00 % | 88,00 % |
| RTE | 277 | 84,48 % | 77,98 % | 85,92 % |
| SST-2 | 300 | 92,67 % | 91,67 % | 93,00 % |
| SST-5 | 300 | 61,00 % | 31,67 % | 60,67 % |

Robustez frente a permutacion de opciones (400 decisiones Choice/Bool):

| Prueba de permutacion | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Tasa de inversion de decision (menor es mejor) | 9,25 % | 12,00 % | 6,00 % |
| Exactitud tras permutacion | 66,75 % | 67,00 % | 80,00 % |

Grupo separado de decisiones tipadas (2.000 decisiones de referencia de profesor sobre 400 estados, excluido del macro de etiquetas reales): acuerdo con el profesor del 53,35 % en v1, 37,55 % en English Laya y 73,45 % en v2. En el test de 200 pares de politica de umbral programatica, ambos miembros del par contrafactual son correctos en el 71,50 % de los pares en v2 frente al 63,00 % en v1. No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia, los pesos ocupan 1,27 GB (Q4_K_M), 2,01 GB (Q8_0) y 3,78 GB (BF16); el consumo real anadira el overhead de contexto y del runtime, que no esta cuantificado en la documentacion.
- GPU de datacenter: el entrenamiento principal se realizo en una H100 80GB; para inferencia el modelo es sobredimensionado para ese hardware y funcionaria en A100, H100, L40S o similares sin problema de memoria.
- GPU de consumo: las tres builds caben en GPU de consumo. Q4_K_M (1,27 GB) entra en GPUs de 4-6 GB, Q8_0 (2,01 GB) en 6-8 GB y BF16 (3,78 GB) en 8 GB o mas; una RTX 4090 o 3090 sobra para las tres.
- CPU y Apple Silicon: la build GGUF esta pensada para llama.cpp, por lo que la variante Q4_K_M es viable en CPU. Existe una build especifica MLX BF16 para Apple Silicon.
- Opciones de despliegue: llama.cpp y sus envoltorios (llama-cpp-python, Ollama, LM Studio, servidores compatibles con endpoints); Transformers con el cliente de decision para el modelo base BF16; cliente nativo MLX para Apple Silicon.
- Latencia y throughput: no disponibles. El diseno de un unico prefill por decision, sin decodificacion autoregresiva multiple, apunta a latencias mas bajas y mas estables que un modelo generativo equivalente, pero no se publican mediciones.
- Nota de despliegue: hay que usar temperatura 1.0 en tiempo de ejecucion, ya que la calibracion va incorporada en los pesos y alterarla invalida las probabilidades.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las dos alternativas usadas como referencia por el autor en el mismo panel de evaluacion, no con modelos publicos de proposito general.

| Modelo | Parametros | Exactitud | Macro-F1 | NLL | Brier | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|---|
| Jev-Style-Qwen3.5-2B-Decision-v2 (GGUF) | 1,88 B | 81,20 % | 79,78 % | 0,5154 | 0,2787 | Apache 2.0 | GGUF, safetensors BF16 y MLX BF16 en HuggingFace |
| Jev-Style v1 | No disponible | 76,68 % | 75,42 % | 0,5752 | 0,3290 | No disponible | No disponible |
| English Laya | No disponible | 75,09 % | 73,45 % | 0,6318 | 0,3482 | No disponible | No disponible |

Los intervalos de confianza pareados del 95 % declarados para la mejora en exactitud son [+3,58, +5,52] puntos frente a v1 y [+4,64, +7,52] puntos frente a English Laya, dentro del panel fijo. La comparacion de parametros, contexto y licencia de v1 y English Laya no esta disponible en la informacion proporcionada. El autor menciona tambien resultados de sensibilidad a checkpoints especialistas y a la representacion de opciones en `baseline_sensitivity.json`, sin detallar su contenido.

## Limitaciones y advertencias

- Solo ingles: el modelo declara exclusivamente el idioma `en` y no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se especifica cuantos tokens admite, lo que impide planificar su uso con estados o listas de opciones largas.
- Tareas debiles conocidas: ANLI queda en 48,67 % (cerca del azar en un problema de tres clases) y HANS en 68,00 %, por lo que no es fiable para inferencia de lenguaje natural adversarial.
- Sentimiento fino limitado: SST-5 se queda en 60,67 % con cinco clases, muy por debajo de sus resultados binarios.
- Degradacion por cuantizacion en las decisiones: Q4_K_M baja al 91,4 % de acuerdo de eleccion con BF16 y al 78,18 % de exactitud macro, frente al 99,6 % y 79,36 % de BF16. Enrutados sensibles deberian usar Q8_0 o BF16.
- Sensibilidad al orden de opciones: aunque se reduce al 6,00 %, sigue existiendo inversion de decision al reordenar las alternativas.
- Acuerdo con el profesor bajo: el 73,45 % en el grupo de decisiones tipadas implica que en mas de una de cada cuatro decisiones el modelo no coincide con la referencia de profesor.
- Calibracion dependiente de la temperatura: fijar temperature distinta de 1.0 en tiempo de ejecucion invalida las probabilidades calibradas y, con ello, los umbrales de decision.
- Riesgo de alucinacion: no se documenta ningun mecanismo de abstitucion nativa; el modelo siempre devuelve una opcion de la lista, por lo que la abstitucion debe implementarse externamente con el umbral de confianza.
- Adopcion muy baja: 0 descargas y 1 like en el momento de la consulta, lo que implica poca validacion independiente por terceros.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el autor no documenta el origen ni la composicion de los datos de entrenamiento, lo que complica la auditoria de procedencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Modelo base BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Variante MLX BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Descarga directa Q4_K_M: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF/resolve/main/Jev-Style-v2-Q4_K_M-Calibrated.gguf?download=true
- Descarga directa Q8_0: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF/resolve/main/Jev-Style-v2-Q8_0-Calibrated.gguf?download=true
- Descarga directa BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF/resolve/main/Jev-Style-v2-BF16-Calibrated.gguf?download=true
- Comparativa completa de precisiones: evaluation/quantization_summary.json (en el repositorio)
- Sensibilidad a checkpoints y representacion: evaluation/baseline_sensitivity.json (en el repositorio)
- Grafico de exactitud, Macro-F1, NLL y Brier: figures/benchmark.png (en el repositorio)
- Diagrama de fiabilidad y ECE: figures/calibration.png (en el repositorio)
- Estabilidad ante permutacion de opciones: figures/robustness.png (en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
