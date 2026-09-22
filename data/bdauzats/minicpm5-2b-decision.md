# bdauzats/minicpm5-2b-decision

## Resumen

minicpm5-2b-decision es un modelo de decisión desarrollado por el usuario bdauzats sobre el modelo base openbmb/MiniCPM5-2B, de 2.516.756.480 parámetros. No es un modelo generativo: recibe un estado textual y una o varias preguntas tipadas y devuelve, en una única pasada forward, una probabilidad por cada opción disponible. Nunca produce texto libre, lo que lo sitúa en la categoría de clasificación y decisión estructurada más que en la de generación.

Técnicamente es el modelo base con un LoRA de rango 16 fusionado en los pesos y una cabeza pointer adicional compuesta por dos capas lineales de 2048 a 256, almacenada aparte en pointer_head.npz. Se distribuye en bfloat16 para transformers (CUDA, CPU y MPS) y cuenta con una build independiente en 4 bits para MLX, orientada a Apple Silicon. Está diseñado para jul, una herramienta de decisiones tipadas locales que replica la interfaz del SDK de Python de TypeSafe (Jev), y reutiliza la arquitectura y el código de entrenamiento de Kev (Jared Palmer, Apache-2.0).

Su interés actual reside en el nicho que cubre: decisión y clasificación con salida probabilística calibrada, sin generación, con latencias de 140 ms en un M4 Pro (MPS, bf16) para un ticket con dos preguntas y 65 ms con la build MLX 4-bit y tres opciones cortas. La longitud de contexto soportada no se documenta en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base MiniCPM5-2B) con LoRA r=16 fusionado y cabeza pointer de dos capas lineales 2048 -> 256 |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (modelo denso; no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (referencia PyTorch); 4 bits en la build MLX publicada en repositorio separado; no se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), cabeza pointer en pointer_head.npz, mas config.json, tokenizer.json y decision.json |
| Parametros de decodificacion | temperatura 1.954, fijada en el entrenamiento y aplicada en la carga |
| Tamano del repositorio | 5,0 GB |
| Libreria | transformers |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM5-2B y le aplica un LoRA de rango 16 cuyos pesos se han fusionado en el checkpoint final, de modo que la inferencia no requiere cargar adaptadores por separado. Sobre la representacion resultante se anade una cabeza pointer (dos capas lineales de 2048 a 256) que proyecta el estado hacia las opciones candidatas. El comportamiento de lectura no esta codificado en Python dentro del modelo, sino descrito en decision.json, que contiene los tokens delimitadores, el layout de entrada, el metodo de lectura, la referencia al fichero de la cabeza y la temperatura (1.954). Un unico forward basta para resolver todas las preguntas: el estado se codifica una sola vez, por lo que anadir preguntas adicionales sobre el mismo texto tiene un coste marginal casi nulo.

El entrenamiento sigue el codigo y la arquitectura de Kev (Jared Palmer, Apache-2.0). Los datos combinan la suite decision-v7 de Kev, con 12.576 registros (1.000 por fuente publica, mas ejemplos de politicas generados y estructuras de reglas), y 2.800 ejemplos propios: 1.000 de dair-ai/emotion y 300 de cada uno de seis conjuntos BTZSC (CAP SOTU, Manifesto, resenas de aplicaciones, Bias Frames intent, toxicidad de Wikipedia y TrueTeacher). Las fuentes publicas incluyen AG News, Banking77, DBpedia14, TREC, SST-5, Yelp, resenas de Amazon, IMDB, BoolQ y MNLI, siempre desde sus splits de entrenamiento. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el volumen total de tokens de entrenamiento.

La innovacion destacable es el esquema de calibracion: se ajusto una temperatura de 1.954 una sola vez sobre el conjunto de desarrollo en distribucion y se aplica al cargar el modelo. La temperatura no altera la respuesta elegida, solo las probabilidades: en transfer-v4 reduce el error de calibracion de 0,182 a 0,092 y los errores confiados (fallo con probabilidad mayor o igual a 0,9) del 12,5% al 3,2%, con un Brier que pasa de 0,436 a 0,377.

## Capacidades

- Decision tipada en una sola pasada forward: devuelve una probabilidad por opcion en lugar de generar texto.
- Preguntas de tipo Choice (eleccion entre opciones con criterios descritos), Noul (booleano si/no) y Score (puntuacion sobre una lista de criterios ordenados).
- Codificacion unica del estado: varias preguntas sobre el mismo texto se resuelven con coste adicional minimo.
- Clasificacion zero-shot razonable en dominios no vistos: 0,601 de exactitud media en fp32 sobre cuatro conjuntos BTZSC (Yahoo Topics, Empathetic, Massive, FinancialPhraseBank, 200 ejemplos cada uno).
- Clasificacion de intenciones de grano fino: 72 intenciones en Banking77, con 0,79 de exactitud.
- Analisis de emocion (0,69 en Emotion) y de sentimiento en resenas (SST-5, Yelp, Amazon, IMDB en el mix de entrenamiento).
- Clasificacion tematica de noticias y documentos (AG News, DBpedia14, TREC).
- Deteccion de toxicidad e intencion sesgada (toxicidad de Wikipedia y Bias Frames en el mix).
- Inferencia de lenguaje natural y respuesta a preguntas booleanas (BoolQ, MNLI en el mix).
- Calibracion de probabilidades con temperatura fija, util para fijar umbrales de decision.
- Idiomas: unicamente ingles.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Triaje de tickets de soporte: es el escenario de referencia del propio modelo. Se le pasa el asunto y el cuerpo del ticket como estado y varias preguntas simultaneas (equipo responsable entre facturacion, envios o accesos; si el cliente esta enfadado; prioridad en escala baja, normal, alta) y devuelve probabilidades por opcion en unos 140 ms en MPS. El enrutado se puede hacer con umbrales calibrados en lugar de con reglas.
- Enrutado de intenciones en asistentes conversacionales: con 0,79 de exactitud en Banking77 y 72 intenciones finas, sirve para dirigir una consulta bancaria al flujo correcto antes de invocar cualquier modelo generativo, reduciendo coste y latencia en la capa de entrada.
- Moderacion de contenido: el mix de entrenamiento incluye toxicidad de Wikipedia y Bias Frames intent, de modo que puede puntuar si un texto es toxico o que intencion comunicativa tiene, devolviendo una probabilidad util para politicas de moderacion con umbral ajustable.
- Analisis de sentimiento y emocion a escala: los conjuntos SST-5, Yelp, Amazon, IMDB y dair-ai/emotion estan en el entrenamiento, lo que permite procesar resenas y encuestas como una tarea de decision con scores, sin generar salida de texto que haya que parsear.
- Clasificacion tematica de documentos y noticias: AG News, DBpedia14 y TREC forman parte del mix, por lo que resulta adecuado para etiquetar articulos o entradas documentales en categorias predefinidas en una sola pasada.
- Clasificacion financiera zero-shot: en FinancialPhraseBank, un dominio no visto durante el entrenamiento, la exactitud media se mantiene en torno a 0,601 junto al resto de conjuntos BTZSC, lo que permite etiquetar frases financieras sin datos anotados propios.
- Aplicaciones locales en Apple Silicon: la build MLX 4-bit resuelve tres opciones cortas en 65 ms en un M4 Pro, lo que habilita decisiones tipadas en el propio dispositivo sin enviar datos a un servidor.
- Inferencia y verificacion de afirmaciones: BoolQ y MNLI estan en el mix de datos, de modo que puede usarse para responder preguntas booleanas sobre un contexto o comprobar la relacion entre premisa e hipotesis como tarea de clasificacion.

## Benchmarks y rendimiento

Conjuntos de desarrollo (medidos en PyTorch, fp32, antes de cuantizar):

| Conjunto de desarrollo | Kev-0.8B | Este modelo | Kev-4B | Jev |
|---|---:|---:|---:|---:|
| transfer-v4 (fuentes nunca entrenadas, 656 preguntas) | 0,652 | 0,721 | 0,797 | 0,857 |
| decision-v7 (ejemplos retenidos de las fuentes de entrenamiento, 1264) | 0,825 | 0,846 | 0,872 | no disponible |

Nota del autor: transfer-v4 incluye Emotion, que si forma parte del mix de este modelo (no del de Kev); sin Emotion, la puntuacion es 0,710 frente a 0,668 de Kev-0.8B.

Clasificacion zero-shot (cuatro conjuntos BTZSC: Yahoo Topics, Empathetic, Massive, FinancialPhraseBank; 200 ejemplos cada uno, a traves de jul):

| Modelo | Exactitud media |
|---|---:|
| Este modelo, PyTorch fp32 | 0,601 |
| Este modelo, MLX 4-bit | 0,606 |
| MiniCPM5-2B base leido con el metodo vectorial de jul | 0,542 |

Benchmark Jev (300 filas publicadas: AG News, Banking77, Emotion; zero-shot, a traves de jul):

| Modelo | AG News | Banking77 | Emotion | Media | ECE media | p50 |
|---|---:|---:|---:|---:|---:|---:|
| Este modelo | 0,91 | 0,79 | 0,69 | 0,796 | 0,133 | 217 ms |
| Jev (publicado) | 0,91 | 0,87 | 0,48 | 0,753 | 0,156 | 246 ms |
| GLiNER2.5 (publicado) | 0,70 | 0,61 | 0,44 | 0,583 | 0,101 | 128 ms |

Calibracion medida en transfer-v4:

| Metrica | Antes de temperatura | Despues de temperatura (1,954) | Referencia Jev |
|---|---:|---:|---:|
| Error de calibracion (ECE) | 0,182 | 0,092 | no disponible |
| Errores confiados (probabilidad >= 0,9) | 12,5% | 3,2% | 3,7% |
| Brier | 0,436 | 0,377 | no disponible |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 5 GB (el repositorio completo ocupa 5,0 GB), mas activaciones y cache. Estimacion practica de 6 a 8 GB de VRAM para inferencia en bf16.
- Pesos en fp32: en torno a 10 GB, corresponde al modo en que se midieron los conjuntos de desarrollo.
- Build MLX 4-bit: aproximadamente 1,5 a 2 GB, es la opcion mas ligera y rapida en Apple Silicon.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB bastan en bf16; con la cuantizacion de 4 bits el margen es amplio incluso en GPUs de 8 GB.
- GPUs de gama alta (A100, H100, RTX 4090): sobredimensionadas para un modelo de 2,5B; utiles solo si se necesita procesar lotes muy grandes en paralelo.
- Apple Silicon: soportado tanto por MPS con la version bf16 como mediante MLX con la build 4-bit. Las cifras de latencia publicadas son de un M4 Pro.
- Opciones de despliegue: transformers (CUDA, CPU, MPS), jul con backend torch, el servidor propio de Kev sirviendo el checkpoint sin cuantizar, y MLX para la build de 4 bits. El repositorio esta etiquetado como endpoints_compatible y text-embeddings-inference, aunque la cabeza pointer y la logica de lectura de decision.json no son parte del grafo estandar de transformers, por lo que vLLM o TGI no estan confirmados como soportados.
- Latencia publicada: 140 ms en M4 Pro con MPS y bf16 para un ticket con dos preguntas; 65 ms con la build MLX 4-bit y tres opciones cortas; p50 de 217 ms en el benchmark Jev a traves de jul en fp32. El rendimiento en procesamiento por lotes no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Media en Jev | Media en transfer-v4 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| minicpm5-2b-decision | 2,5B | Modelo de decision (base MiniCPM5-2B) | 0,796 | 0,721 | apache-2.0 | HuggingFace, build MLX 4-bit |
| Kev-0.8B | 0,8B | Modelo de decision (arquitectura Kev) | no disponible | 0,652 | apache-2.0 (codigo de Kev) | Repositorio de Kev |
| Kev-4B | 4B | Modelo de decision (arquitectura Kev) | no disponible | 0,797 | apache-2.0 (codigo de Kev) | Repositorio de Kev |
| Jev | no disponible | Modelo de decision entrenado | 0,753 | 0,857 | no disponible | API y SDK de TypeSafe |
| GLiNER2.5 | no disponible | Modelo de clasificacion zero-shot | 0,583 | no disponible | no disponible | Publicado |
| openbmb/MiniCPM5-2B | 2,5B | Modelo base generativo | no disponible (0,542 con lectura vectorial) | no disponible | no disponible en la informacion | HuggingFace |

Los datos de contexto, licencia y disponibilidad de Kev-4B, Jev y GLiNER2.5 no aparecen en la informacion proporcionada. Este modelo supera a Jev en Emotion (0,69 frente a 0,48) y en la media del benchmark Jev (0,796 frente a 0,753), pero queda por detras en Banking77 (0,79 frente a 0,87) y en transfer-v4 (0,721 frente a 0,857).

## Limitaciones y advertencias

- Sesgo por contaminacion de benchmarks: AG News, Banking77 y Emotion forman parte del split de entrenamiento, por lo que los resultados en el benchmark Jev no son zero-shot. Para tareas no vistas hay que guiarse por la linea transfer-v4 (0,721), que es bastante inferior.
- Solo ingles. No hay soporte multilingue documentado, ni siquiera en castellano.
- No genera texto. Cualquier caso de uso que requiera una respuesta redactada, resumen o explicacion necesita combinarlo con otro modelo.
- Intenciones finas: Banking77 queda 8 puntos por debajo de Jev pese a estar en el entrenamiento, con 72 intenciones de grano fino como principal dificultad.
- Calibracion no portable: la temperatura de 1,954 se ajusto una sola vez sobre el conjunto de desarrollo en distribucion. Fuera de esa distribucion el error de calibracion medido sube a 0,092, muy por encima del valor en distribucion, y los umbrales fijados con ella pueden no transferirse.
- Cuantizacion: la build MLX 4-bit mantiene la respuesta en casi todos los ejemplos, pero desplaza las probabilidades hasta 0,3, lo que puede invertir decisiones al limite. Los pesos de referencia son los bf16.
- Riesgo de error confiado: aunque la calibracion reduce los errores con probabilidad mayor o igual a 0,9 del 12,5% al 3,2% en transfer-v4, siguen existiendo. En un sistema de triaje conviene fijar umbrales de derivacion a revision humana.
- Sesgos heredados de los datos: el mix incluye toxicidad de Wikipedia, Bias Frames, resenas y emociones, con los sesgos anotacionales y demograficos propios de cada fuente.
- Uso comercial: la licencia del modelo es apache-2.0 y permite uso comercial, pero cada conjunto de datos publico del entrenamiento mantiene su propia licencia, que hay que verificar por separado.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad. La model card esta truncada en la informacion disponible.
- No hay documentacion sobre longitud de contexto, tokens de entrenamiento ni tecnicas de alineacion, lo que dificulta estimar su comportamiento en entradas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bdauzats/minicpm5-2b-decision
- Build MLX 4-bit: https://huggingface.co/bdauzats/minicpm5-2b-decision-mlx-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio de jul: https://github.com/bdauzats/jul
- Repositorio de Kev (Jared Palmer, Apache-2.0): https://github.com/jaredpalmer/kev
- Documentacion de la API de Jev (TypeSafe): https://docs.typesafe.ai/api
- Conjunto de datos dair-ai/emotion: https://huggingface.co/datasets/dair-ai/emotion

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; las coincidencias obtenidas correspondian a configuradores de equipos de sobremesa y foros de hardware, sin relacion con el modelo. No se ha localizado paper, blog tecnico ni demo adicional mas alla de los enlaces anteriores.
