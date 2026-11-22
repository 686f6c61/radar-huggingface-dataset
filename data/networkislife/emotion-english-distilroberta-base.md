# NetworkIsLife/emotion-english-distilroberta-base

## Resumen

`NetworkIsLife/emotion-english-distilroberta-base` es una copia sin modificar del modelo `j-hartmann/emotion-english-distilroberta-base` de Jochen Hartmann, republicada con los pesos en formato `safetensors`. Se trata de un clasificador de texto en ingles que asigna cada fragmento a una de siete clases de emocion: las seis basicas de Ekman (anger, disgust, fear, joy, sadness, surprise) mas una clase neutral. El modelo subyacente es un fine-tuning de DistilRoBERTa-base con 82.124.297 parametros.

La motivacion de esta copia es puramente tecnica: el repositorio original solo distribuia los pesos como `pytorch_model.bin`, un archivo pickle que requiere Python para leerse. El paquete de R Rhobots, que ejecuta modelos transformer de forma nativa en R mediante `torch`, necesita pesos en `safetensors`, de modo que esta republicacion permite usar el clasificador desde R sin depender de Python. La conversion fue realizada por el bot oficial de Hugging Face y los 106 tensores se verificaron como identicos bit a bit al original.

No se trata, por tanto, de un modelo nuevo ni de una mejora sobre el original: es el mismo checkpoint con otro empaquetado. Su relevancia es de disponibilidad de formato y de integracion con el ecosistema de R, no de rendimiento o capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa-base, destilacion de RoBERTa-base) |
| Parametros totales | 82.124.297 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilRoBERTa-base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el repositorio original no declara licencia) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo DistilRoBERTa-base, es decir, una version destilada de RoBERTa-base con 6 capas y 82 millones de parametros, con cabecera de clasificacion de secuencia sobre siete etiquetas. Al ser un encoder bidireccional para clasificacion, no genera texto: produce una distribucion de probabilidad sobre las siete emociones para cada entrada.

El entrenamiento corresponde al fine-tuning realizado por Jochen Hartmann sobre un subconjunto balanceado de 2.811 textos por emocion, extraidos de seis corpus: Crowdflower (2016), Emotion Dataset (Elvis et al., 2018), GoEmotions (Demszky et al., 2020), ISEAR (Vikash, 2018), MELD (Poria et al., 2019) y SemEval-2018 EI-reg (Mohammad et al., 2018). Estos corpus cubren texto de Twitter, Reddit, autoinformes de estudiantes y dialogo de television. El autor original reporta una precision de evaluacion del 66 % frente a una linea base aleatoria del 14 %. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, que en un clasificador de este tipo no serian el procedimiento habitual.

La unica innovacion tecnica de esta republicacion es el empaquetado en `safetensors` y la verificacion de equivalencia bit a bit con el `pytorch_model.bin` original en el commit `0e1cd914e3d46199ed785853e12b57304e04178b`. Los ficheros de configuracion y tokenizer se copian sin cambios de ese mismo commit.

## Capacidades

- Clasificacion de texto en ingles en siete categorias de emocion: anger, disgust, fear, joy, neutral, sadness y surprise.
- Salida de probabilidades por clase (con `top_k=None` en el pipeline de transformers se obtienen las siete puntuaciones).
- Funciona sobre texto corto y de registro informal, gracias a su entrenamiento con corpus de Twitter, Reddit y dialogo televisivo.
- Integracion nativa con el ecosistema de R mediante Rhobots, sin necesidad de Python.
- Integracion con el pipeline `text-classification` de transformers y con Text Embeddings Inference (tag `text-embeddings-inference`).
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue: no, solo ingles.

## Casos de uso

- Analisis de sentimiento y emocion en redes sociales: el modelo clasifica publicaciones de Twitter o Reddit en las siete emociones, lo que permite construir paneles de monitorizacion de reacciones emocionales ante campanas o eventos. Es adecuado porque fue entrenado precisamente con ese tipo de texto.
- Moderacion de comunidades: detectar mensajes con alta probabilidad de anger o disgust para priorizar su revision por moderadores humanos, usando las puntuaciones por clase como umbral configurable.
- Investigacion en ciencias sociales con R: el paquete Rhobots permite anotar corpus completos desde scripts de R, lo que encaja en flujos de analisis estadistico donde no se quiere introducir una dependencia de Python.
- Analisis de conversaciones de atencion al cliente: clasificar turnos de dialogo (el modelo se entreno con MELD, dialogo de television) para medir la evolucion emocional de una conversacion y detectar escaladas de frustracion.
- Etiquetado de datos para entrenamiento: usar el modelo como anotador automatico de un corpus mayor y revisar manualmente solo los casos de baja confianza, reduciendo el coste de construir un dataset etiquetado por emocion.
- Enriquecimiento de encuestas y autoinformes: dado que ISEAR contiene autoinformes emocionales, el modelo puede aplicarse a respuestas abiertas de encuestas para derivar variables categoricas de emocion utilizables en analisis cuantitativo.
- Filtrado previo en pipelines de NLP: como clasificador ligero de 82 millones de parametros, puede actuar como primera etapa que descarte o marque textos antes de pasarlos a modelos mayores y mas costosos.

## Benchmarks y rendimiento

El unico dato de rendimiento disponible en la informacion proporcionada es la precision de evaluacion reportada por el autor original: 66 % de accuracy frente a una linea base aleatoria del 14 % (siete clases). No se han publicado en la informacion disponible resultados desglosados por clase, F1, ni comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks, que por otra parte no aplican a un clasificador de emociones.

| Metrica | Valor | Referencia |
|---|---|---|
| Accuracy de evaluacion | 66 % | Reportado por el autor original |
| Linea base aleatoria | 14 % | Siete clases equiprobables |
| Benchmarks generativos (MMLU, HumanEval, GSM8K) | no aplica | Modelo de clasificacion, no generativo |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 350 MB en fp32 (82 M de parametros x 4 bytes) mas el overhead del runtime; en fp16 aproximadamente 175 MB. Cifras estimadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo no requiere A100 ni H100. Una GTX 1650, T4 o incluso CPU son viables.
- Cabe holgadamente en cualquier GPU de consumo actual e incluso en entornos sin GPU; la inferencia en CPU es practica para volumenes moderados.
- Opciones de despliegue: pipeline `text-classification` de transformers, Text Embeddings Inference (segun el tag del repo), Rhobots en R, y exportacion a ONNX si se necesita. No se documenta soporte nativo de vLLM ni llama.cpp para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| NetworkIsLife/emotion-english-distilroberta-base | 82,1 M | no disponible (512 max. por arquitectura) | 7 emociones (Ekman + neutral) | no disponible | safetensors |
| j-hartmann/emotion-english-distilroberta-base | 82,1 M | no disponible (512 max. por arquitectura) | 7 emociones (Ekman + neutral) | no disponible | pytorch_model.bin |
| distilroberta-base | 82,1 M | 512 | no aplica (modelo base) | no disponible en la informacion | safetensors |

La comparacion mas directa es con el repositorio original de Hartmann: mismos pesos, mismo rendimiento y misma licencia no declarada; la diferencia es el formato de pesos y la posibilidad de uso desde R. Frente a `distilroberta-base`, la diferencia es que este checkpoint esta fine-tuneado para clasificacion de emociones. No se dispone de informacion sobre otros clasificadores de emociones comparables (por ejemplo, variantes basadas en RoBERTa-large o DeBERTa) en los datos proporcionados, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Solo ingles: cualquier texto en otro idioma producira clasificaciones sin garantia de validez.
- Precision del 66 %: un tercio de las predicciones son incorrectas en la evaluacion del autor; para produccion conviene calibrar umbrales y tratar las puntuaciones como senal, no como verdad.
- Sesgos de dominio: el entrenamiento se basa en Twitter, Reddit, autoinformes y dialogo de television; el rendimiento puede degradarse en textos formales, tecnicos o de otros registros.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignar una emocion con alta confianza a textos ambiguos o neutros.
- Licencia no declarada: el repositorio original no indica licencia y esta copia tampoco, lo que supone una incertidumbre legal para uso comercial. Conviene contactar con el autor original antes de desplegarlo en produccion.
- Es una copia no oficial: el mantenimiento y las posibles correcciones dependen del autor original, no de NetworkIsLife.
- No es un modelo generativo: no puede usarse para resumen, traduccion, codigo ni dialogos; solo clasifica.
- El limite de 512 tokens de la arquitectura implica que textos largos deben truncarse o dividirse, con posible perdida de contexto emocional.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/NetworkIsLife/emotion-english-distilroberta-base
- Modelo original: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
- Modelo base de la arquitectura: https://huggingface.co/distilroberta-base
- Paquete Rhobots (R): https://github.com/JPvdP/Rhobots
