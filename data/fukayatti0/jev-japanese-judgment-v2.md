# fukayatti0/jev-japanese-judgment-v2

## Resumen

jev-japanese-judgment-v2 es un modelo japones de evaluacion y clasificacion por puntuacion de candidatos, desarrollado por el usuario fukayatti0. No es un modelo generativo: dado un contexto y un conjunto de candidatos, devuelve directamente una probabilidad o una puntuacion ordinal, sin producir texto. Se construye como un adaptador LoRA mas una cabeza de clasificacion entrenada sobre el modelo base LiquidAI/LFM2.5-1.2B-JP-202606, de aproximadamente 1,17 mil millones de parametros.

La version v2 amplia la v1 con unas 29.700 muestras adicionales orientadas a cuatro tareas nuevas: inferencia de lenguaje natural en formato si/no (JNLI), juicio de gramaticalidad en formato si/no (JCoLA), similitud semantica en escala de 0 a 5 (JSTS) y similitud de inferencia en escala de 1 a 5 (JSICK). Segun la model card, esto eleva la precision global en las tareas anadidas del 45,2 % al 68,0 % y reduce el error de calibracion (ECE) de 0,1245 a 0,0207, a costa de una ligera perdida de unos 1,5 puntos en las tres tareas originales.

Su relevancia practica es acotada pero concreta: es un componente de bajo coste computacional para filtrar, puntuar y ordenar pares de frases en japones dentro de pipelines de curacion de datos, analisis de opinion o verificacion de consistencia, con versiones GGUF de 698 MB (Q4_K_M) y 1,2 GB (Q8_0) que permiten ejecucion en CPU y en GPU de gama baja. La contrapartida es que JCoLA apenas supera el azar (58,0 % con un 50 % de linea base), el repositorio no tiene descargas ni valoraciones, y el modelo no se carga con `transformers` estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA + cabeza de clasificacion sobre el modelo base LiquidAI/LFM2.5-1.2B-JP-202606; la arquitectura interna del modelo base no se detalla en la informacion proporcionada |
| Parametros totales | 1.170.340.608 (dato de los archivos safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Japones (ja); se incluye una evaluacion de referencia en ingles (JevBench) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0`); el codigo del repositorio asociado es MIT |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (LoRA ya fusionado, con `gguf/head.npz`) |
| Modelo base | LiquidAI/LFM2.5-1.2B-JP-202606 |
| Libreria | peft |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 25 de septiembre de 2026 |
| Ultima actualizacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (LoRA) acompanado de una cabeza de prediccion, montado sobre LiquidAI/LFM2.5-1.2B-JP-202606. El pipeline no es generativo: la model card indica explicitamente que el modelo devuelve probabilidades directamente a partir de un contexto y una lista de candidatos (enfoque de *candidate scoring*), sin decodificacion de tokens. Esta decision explica que el modelo no pueda cargarse con `transformers` estandar y que el autor publique codigo propio en GitHub. El detalle de la arquitectura del backbone (capas, atencion, contexto nativo) no figura en la informacion disponible.

El entrenamiento parte de la version v1 (LoRA mas cabeza, una epoca) y anade una epoca adicional con tasa de aprendizaje 1e-4 sobre aproximadamente 29.700 ejemplos: JNLI en formato si/no con las dos clases equilibradas, JCoLA en formato si/no tambien equilibrado, JSTS en escala de 0 a 5 con un maximo de 1.500 ejemplos por nivel, JSICK en escala de 1 a 5 con un maximo de 800 ejemplos, y hasta 3.400 ejemplos por fuente procedentes de los datos de v1 como medida antiolvido. No se menciona uso de RLHF, DPO ni decodificacion especulativa. La evaluacion se realiza exclusivamente sobre divisiones no vistas durante el entrenamiento: JNLI test, JCoLA valid, JSTS validation, JSICK test, JCommonsenseQA validation, chABSA test y JSNLI dev.

La innovacion tecnica mas destacable es la doble salida: juicio binario si/no y puntuacion ordinal, con calibracion medida mediante ECE. Para el despliegue en GGUF, el autor propone usar el estado oculto de `llama-embedding --pooling last` y aplicar encima la pequena cabeza MLP almacenada en `head.npz`, lo que permite ejecutar el sistema sin PyTorch.

## Capacidades

- Evaluacion de inferencia textual en japones: determinar si un par de frases mantiene una relacion de implicacion, en formato si/no (JNLI).
- Juicio de gramaticalidad: decidir si una oracion es gramaticalmente natural en japones, en formato si/no (JCoLA), con rendimiento cercano al azar segun el propio autor.
- Similitud semantica ordinal: puntuar pares de oraciones en escalas de 0 a 5 (JSTS) y de 1 a 5 (JSICK).
- Preguntas de sentido comun en japones: JCommonsenseQA, con un 89,0 % en v2 sobre datos no vistos.
- Analisis de sentimiento: 93,8 % en la tarea de sentimiento de la evaluacion interna.
- Analisis de sentimiento basado en aspectos (ABSA): la evaluacion incluye el conjunto chABSA test.
- Calibracion de confianza: el ECE de 0,0207 en las tareas anadidas indica que las probabilidades devueltas son utilizables como senal de confianza dentro del dominio entrenado.
- No soporta generacion de texto, tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso; la propia model card lo define como un modelo de puntuacion sin generacion.
- Capacidad multilingue limitada: entrenado y evaluado en japones; en la prueba en ingles JevBench alcanza un 54,5 % global, lo que el autor describe como ruido en las diferencias y con sobreconfianza marcada (ECE 0,14-0,21).

## Casos de uso

- Curacion de corpus en japones: usar la salida si/no de JNLI para descartar pares de frases sin relacion de implicacion antes de entrenar otros modelos, aprovechando que el modelo puntua sin generar texto y con coste de inferencia bajo.
- Deduplicacion y agrupacion semantica: aplicar la puntuacion ordinal de JSTS/JSICK para agrupar titulares, preguntas de soporte o resenas duplicadas, con un umbral de similitud calibrado sobre el ECE reportado (0,0207).
- Analisis de sentimiento de resenas en japones: clasificar opiniones de producto o servicio con el 93,8 % de precision reportado en la tarea de sentimiento, integrandolo como paso previo a un panel de analitica.
- Analisis de sentimiento por aspectos: utilizar el comportamiento sobre chABSA para etiquetar la polaridad asociada a aspectos concretos dentro de documentos empresariales, teniendo en cuenta la advertencia del autor sobre posible fuga de datos por division a nivel de frase.
- Verificacion de consistencia en pipelines RAG: comprobar si la respuesta propuesta se sigue del contexto recuperado (NLI, 89,2 %), como filtro barato antes de mostrar la respuesta al usuario.
- Triaje por confianza: emplear la probabilidad devuelta para enrutar solo los casos de baja confianza hacia revision humana o hacia un modelo mayor, aprovechando que las versiones GGUF caben en 698 MB y 1,2 GB.
- Filtrado de preguntas de sentido comun: validar o descartar candidatos en conjuntos tipo JCommonsenseQA (89,0 %) dentro de la construccion de datasets de evaluacion en japones.
- Control de calidad linguistica acotado: detectar oraciones dudosas como primera pasada, asumiendo que con un 58,0 % frente al 50 % de azar el juicio de gramaticalidad no es fiable por si solo.

## Benchmarks y rendimiento

Tareas anadidas en v2, sobre 1.600 ejemplos no usados en entrenamiento. Yes/no esta equilibrado al 50 % (200+200); para JSTS la linea base es de aproximadamente el 17 % y para JSICK del 20 %.

| Evaluacion | v1 | v2 |
|---|---|---|
| JNLI (si/no) | 80,8 % | 85,8 % |
| JCoLA (si/no) | 51,7 % | 58,0 % |
| JSTS (escala 0-5) | 20,5 % | 58,0 % |
| JSICK (escala 1-5) | 28,0 % | 70,2 % |
| Global | 45,2 % | 68,0 % |
| ECE | 0,1245 | 0,0207 |

Tres tareas originales, sobre 1.200 ejemplos no usados:

| Evaluacion | v1 | v2 |
|---|---|---|
| commonsense_qa | 91,8 % | 89,0 % |
| sentiment | 92,5 % | 93,8 % |
| nli | 92,2 % | 89,2 % |
| Global | 92,2 % | 90,7 % |
| ECE | 0,0145 | 0,0258 |

Versiones GGUF, evaluadas sobre los mismos conjuntos no vistos:

| Archivo | Tamano | JNLI | JCoLA | JSTS | JSICK | Global | ECE |
|---|---|---|---|---|---|---|---|
| gguf/jev-Q4_K_M.gguf | 698 MB | 84,0 % | 57,5 % | 58,8 % | 70,0 % | 67,6 % | 0,0199 |
| gguf/jev-Q8_0.gguf | 1,2 GB | 85,5 % | 57,8 % | 58,8 % | 70,3 % | 68,1 % | 0,0221 |

| Archivo | Tamano | commonsense_qa | sentiment | nli | Global | ECE |
|---|---|---|---|---|---|---|
| gguf/jev-Q4_K_M.gguf | 698 MB | 90,0 % | 93,2 % | 90,0 % | 91,1 % | 0,0192 |
| gguf/jev-Q8_0.gguf | 1,2 GB | 89,0 % | 93,8 % | 89,5 % | 90,7 % | 0,0245 |

JevBench (en ingles, GGUF Q4_K_M sobre T4 con llama-server), medicion presentada por el autor como referencia fuera de dominio:

| Nivel | v1 | v2 |
|---|---|---|
| easy (48 preguntas) | 87,5 % | 93,8 % |
| original (72 preguntas) | 51,4 % | 50,0 % |
| hard (111 preguntas) | 35,1 % | 40,5 % |
| Total (231 preguntas) | 51,1 % | 54,5 % |

No se han publicado resultados de otros benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no tendrian sentido para un modelo no generativo.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 2,4 GB solo para pesos (1.170.340.608 parametros a 2 bytes), mas el espacio de activaciones y la cabeza de clasificacion.
- VRAM estimada con GGUF Q8_0: unos 1,2 GB de pesos (tamano real de archivo), mas cache y la cabeza `head.npz`.
- VRAM estimada con GGUF Q4_K_M: unos 698 MB de pesos, lo que deja el sistema por debajo de 1 GB en total para el modelo.
- Cabe en GPU de consumo sin problema: cualquier tarjeta con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar la version Q4_K_M o Q8_0. El autor cita pruebas en una T4.
- Ejecucion en CPU viable con llama.cpp, dado el tamano de 1,2 B de parametros y las cuantizaciones de 698 MB y 1,2 GB.
- Opciones de despliegue confirmadas: `llama-embedding --pooling last` con GGUF mas `head.npz`, `llama-server` (usado en la evaluacion de JevBench sobre T4) y el script `scripts/ask_gguf_lite.py` del repositorio, que solo usa la biblioteca estandar de Python. El adaptador PEFT requiere el codigo propio del repositorio y no se carga con `transformers` estandar.
- Soporte en vLLM, TGI, Ollama u otros servidores de inferencia: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. Solo consta que JevBench se midio en una T4 con llama-server, sin cifras de tiempo ni tokens por segundo.

## Comparativa con modelos similares

No hay datos de benchmarks de terceros para modelos comparables en la informacion proporcionada. La unica comparacion documentada es con la version anterior del propio modelo.

| Modelo | Parametros | Contexto | Tareas anadidas (global) | Tareas originales (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jev-japanese-judgment-v2 | ~1,17 B | No disponible | 68,0 % (ECE 0,0207) | 90,7 % (ECE 0,0258) | LFM Open License v1.0 | Safetensors PEFT + GGUF; 0 descargas |
| jev-japanese-judgment (v1) | No disponible | No disponible | 45,2 % (ECE 0,1245) | 92,2 % (ECE 0,0145) | No disponible | Modelo previo en HuggingFace |
| LiquidAI/LFM2.5-1.2B-JP-202606 (base) | ~1,2 B (segun nombre) | No disponible | No evaluado como clasificador | No evaluado como clasificador | LFM Open License v1.0 | Modelo base en HuggingFace |
| Otros clasificadores japoneses de ~1 B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- JCoLA se queda en 58,0 % frente a un 50 % de azar: el autor afirma que con este volumen de entrenamiento adicional el modelo practicamente no aprende a juzgar gramaticalidad.
- Regresion en las tareas originales: la media baja de 92,2 % a 90,7 % y el ECE empeora de 0,0145 a 0,0258. El autor no ha medido la varianza de estas cifras (una sola ejecucion de entrenamiento).
- Sobreconfianza fuera del dominio entrenado: el ECE en las pruebas de JevBench se situa entre 0,14 y 0,21, muy por encima del 0,02 del dominio japones, por lo que las probabilidades no deben interpretarse como calibradas en casos novedosos.
- Idiomas: el entrenamiento y la evaluacion son en japones. En ingles el rendimiento global es del 54,5 %, con diferencias de solo ocho preguntas respecto a v1, lo que el propio autor considera ruido.
- Posible fuga de datos en chABSA: el test esta dividido por frases, de modo que otras frases del mismo documento empresarial pueden aparecer en el conjunto de entrenamiento. Las cifras de ABSA deben interpretarse con cautela.
- Modelo no generativo: no produce texto, no soporta tool calling ni agentes, y no puede cargarse con `transformers` estandar, lo que complica su integracion en stacks convencionales.
- Licencia: el modelo se distribuye bajo LFM Open License v1.0, heredada del modelo base, no bajo una licencia permisiva. Cualquier uso comercial debe revisarse contra los terminos de esa licencia. Las versiones GGUF incluyen pesos cuantizados del modelo base. El codigo del repositorio es MIT, pero los datos de entrenamiento arrastran condiciones CC BY-SA 4.0 (JCommonsenseQA, JNLI, JSTS, JCoLA, JSNLI), CC BY 4.0 (chABSA) y CC BY 4.0 o CC BY-SA 4.0 (JSICK, con discrepancia en la atribucion de la fuente original).
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion independiente de los resultados publicados.
- El mejor resultado global entre las variantes publicadas es el de Q8_0 (68,1 %), solo 0,5 puntos por encima de Q4_K_M (67,6 %) en las tareas anadidas; la eleccion entre ambas depende del presupuesto de memoria mas que de la precision.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/fukayatti0/jev-japanese-judgment-v2
- Version anterior v1: https://huggingface.co/fukayatti0/jev-japanese-judgment
- Modelo base LiquidAI/LFM2.5-1.2B-JP-202606: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606/blob/main/LICENSE
- Codigo de inferencia y scripts: https://github.com/fukayatti/jev-japanese-judgment
- Script de ejemplo con GGUF: `scripts/ask_gguf_lite.py` dentro del repositorio anterior
- JevBench: https://github.com/fstandhartinger/jevbench
- La busqueda web realizada no devolvio resultados relevantes para este modelo.
