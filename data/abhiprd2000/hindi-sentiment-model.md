# abhiprd2000/hindi-sentiment-model

## Resumen
El modelo `abhiprd2000/hindi-sentiment-model` es un clasificador de sentimiento en tres clases (positivo, negativo, neutro) para hindi escrito en escritura devanagari, desarrollado por Abhimanyu Prasad como parte de un estudio de transferencia cross-lingual entre inglés, hindi, maithili y bhojpuri. Se construye mediante fine-tuning del checkpoint `cardiffnlp/twitter-xlm-roberta-base-sentiment`, un XLM-RoBERTa base ya adaptado a la tarea de sentimiento, lo que le aporta un punto de partida multilingue orientado a texto social.

El modelo resuelve el problema del analisis de sentimiento en hindi, un idioma con recursos medios comparado con el ingles pero con escasez de clasificadores afinados especificamente para devanagari. Su relevancia actual es doble: por un lado ofrece un clasificador ligero (278 millones de parametros) y desplegable en CPU o GPU consumer; por otro, documenta de forma transparente un fenomeno poco habitual, una precision in-distribution moderada (70,66 %) pero una precision out-of-distribution notablemente superior (90,00 %), lo que sugiere buena generalizacion a hindi escrito de forma natural pese a haberse entrenado con datos parcialmente traducidos por maquina.

La ficha debe leerse con cautela: el propio autor advierte que las cifras provienen de particiones de test del mismo corpus sintetico y no reflejan rendimiento sobre texto real en produccion, y que el proyecto es anterior (marzo de 2026) a su trabajo actual en bhojpuri (PURVA). El modelo tiene un uso muy limitado en la comunidad (27 descargas, 0 likes a fecha de la informacion disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de 3 clases |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia usada en entrenamiento; limite del encoder XLM-RoBERTa base: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Hindi (devanagari) como idioma principal; ingles como idioma secundario segun metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | text-classification (sentiment-analysis, 3 clases) |
| Etiquetas | negative (0), neutral (1), positive (2) |
| Modelo base | cardiffnlp/twitter-xlm-roberta-base-sentiment |
| Dataset de entrenamiento | iam-tsr/hindi-sentiments (MIT), 20.000 frases balanceadas |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento
La arquitectura es un encoder transformer XLM-RoBERTa en configuracion base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, vocabulario SentencePiece de aproximadamente 250.000 tokens), sobre el que se anade una cabeza de clasificacion lineal para tres clases. El punto de partida no es el XLM-RoBERTa generico sino `cardiffnlp/twitter-xlm-roberta-base-sentiment`, ya afinado para sentimiento en redes sociales, lo que reduce el coste de adaptacion al hindi. El vocabulario multilingue cubre devanagari, lo que explica la mejora sustancial frente a BERT en ingles en regimen zero-shot (63,07 % frente a 35,33 % de precision).

El entrenamiento se realizo sobre 20.000 frases balanceadas (aproximadamente 6.666 por clase) muestreadas de `iam-tsr/hindi-sentiments`, un corpus de 127.000 frases hindi traducidas por maquina desde texto social en ingles. Se aplicaron 3 epocas, tamano de lote 16, longitud maxima de secuencia 128, 200 pasos de warmup, weight decay 0,01 y precision mixta fp16, seleccionando el mejor checkpoint por F1 macro. El conjunto de test es una particion fija balanceada de 501 frases (167 por clase) reservada antes del entrenamiento, con verificacion de ausencia de fuga mediante asercion. No se documenta uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un fine-tuning supervisado clasico sobre etiquetas de 3 clases.

## Capacidades
- Clasificacion de sentimiento en tres clases (positivo, negativo, neutro) para texto en hindi con escritura devanagari.
- Clasificacion de sentimiento en ingles como capacidad secundaria derivada del preentrenamiento multilingue (60,0 % de precision en la matriz cross-lingual documentada).
- Transferencia cross-lingual a maithili (63,3 %) y bhojpuri (61,7 %) sin entrenamiento especifico en esos idiomas.
- Procesamiento de texto corto a medio (hasta 128 tokens), adecuado para frases, tweets, resenas y comentarios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un clasificador encoder puro.
- No genera texto: la salida es una distribucion de probabilidad sobre tres etiquetas.

## Casos de uso
- Analisis de sentimiento en redes sociales en hindi: el modelo clasifica tweets, comentarios de Instagram o publicaciones de Facebook en devanagari, aprovechando que el checkpoint base fue afinado originalmente sobre texto social y que la ventana de 128 tokens cubre la mayoria de publicaciones cortas.
- Monitorizacion de reputacion de marca en mercados de habla hindi: ingesta de resenas de productos, comentarios en foros y menciones en medios, agregando la salida en tres clases para paneles de sentimiento por producto o campana.
- Moderacion de comunidades y foros: deteccion de mensajes negativos o toxicos como primera senal de triaje, derivando a revision humana los casos con probabilidad intermedia; el modelo es lo bastante ligero para ejecutarse en CPU a gran volumen.
- Analisis de encuestas abiertas y NPS en hindi: clasificacion automatica de respuestas de texto libre para separar promotores, pasivos y detractores, sustituyendo el etiquetado manual en estudios con miles de respuestas.
- Investigacion en transferencia cross-lingual: el modelo sirve como pivote hindi en estudios comparativos con maithili y bhojpuri, y como baseline afinado frente a zero-shot de XLM-RoBERTa y mBERT.
- Preetiquetado para anotacion humana: uso del clasificador para generar etiquetas iniciales sobre grandes volumenes de hindi y reducir el coste de anotacion, con revision posterior por anotadores nativos.
- Filtrado de resenas en plataformas de comercio electronico: clasificacion de resenas en hindi para destacar opiniones negativas y priorizar atencion al cliente, con la advertencia de validar antes sobre texto real del dominio.

## Benchmarks y rendimiento

| Modelo / regimen | Precision | F1 macro |
|---|---|---|
| BERT en ingles, zero-shot | 35,33 % | 0,2263 |
| XLM-RoBERTa, zero-shot | 63,07 % | 0,6339 |
| mBERT afinado | 67,86 % | 0,6778 |
| XLM-RoBERTa afinado (este modelo, in-distribution) | 70,66 % | 0,7063 |
| Este modelo, out-of-distribution (30 frases nuevas) | 90,00 % | 0,9017 |

Evaluacion in-distribution sobre 501 frases balanceadas (167 por clase). La evaluacion out-of-distribution usa solo 30 frases, por lo que su intervalo de confianza es muy amplio y debe interpretarse con cautela.

Matriz de evaluacion cross-lingual (300 frases por idioma, 100 por clase):

| Modelo | Ingles | Hindi | Maithili | Bhojpuri |
|---|---|---|---|---|
| Modelo en ingles | 79,5 % | 34,0 % | 33,3 % | 33,0 % |
| Modelo hindi (este modelo) | 60,0 % | 68,0 % | 63,3 % | 61,7 % |
| Modelo maithili | 63,0 % | 59 % (dato truncado en la informacion disponible) | no disponible | no disponible |

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos; con overhead de activaciones y tokenizador, entre 1,5 y 2 GB.
- VRAM estimada en fp16: aproximadamente 0,6 GB de pesos; en int8, alrededor de 0,3 GB. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB (RTX 3050, RTX 3060, GTX 1660, T4); para alto throughput, A10G, L4, A100 o H100 permiten procesar lotes grandes con latencia minima.
- Ejecucion en CPU viable: al ser un encoder de 278 millones de parametros con secuencias de 128 tokens, es adecuado para despliegue en CPU con lotes moderados.
- Opciones de despliegue: `transformers` pipeline, Text Generation Inference no aplica (no es generativo), pero si son validos `optimum`/ONNX Runtime, TorchServe, FastAPI con `transformers`, o exportacion a ONNX para inferencia acelerada. No se documentan pesos GGUF ni soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un encoder base a 128 tokens suele procesar cientos de frases por segundo en GPU moderna y decenas en CPU, pero no se aportan mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision hindi (in-dist) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abhiprd2000/hindi-sentiment-model | 278 M | 128 tokens (entrenamiento) | 70,66 % | Apache 2.0 | Hugging Face |
| XLM-RoBERTa base zero-shot (cardiffnlp) | ~278 M | 512 tokens | 63,07 % | MIT / CC-BY-NC segun checkpoint | Hugging Face |
| mBERT afinado (referencia del estudio) | ~178 M | 512 tokens | 67,86 % | Apache 2.0 (BERT base) | Hugging Face |
| BERT en ingles zero-shot | ~110 M | 512 tokens | 35,33 % | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos incluidos en el propio estudio del autor; no se dispone de datos de otros clasificadores de sentimiento en hindi (por ejemplo, modelos especializados de AI4Bharat o IndicBERT) en la informacion proporcionada, por lo que no se incluyen cifras de esos sistemas.

## Limitaciones y advertencias
- El autor advierte explicitamente que el modelo se entreno y evaluo sobre datos parcialmente traducidos por maquina y balanceados artificialmente; las cifras no reflejan rendimiento sobre texto hindi natural.
- La evaluacion out-of-distribution se realizo sobre solo 30 frases, muestra demasiado pequena para conclusiones robustas; el 90,00 % no debe tomarse como estimacion fiable de rendimiento en produccion.
- Riesgo de sesgo de dominio: el corpus de origen son traducciones de texto social en ingles, por lo que el modelo puede no capturar expresiones idiomaticas, sarcasmo, humor o registro formal propios del hindi nativo.
- Ventana de contexto limitada a 128 tokens en entrenamiento; textos mas largos requieren truncamiento o segmentacion, con perdida de informacion.
- El modelo no genera texto ni razona; cualquier caso de uso que requiera explicaciones o salidas estructuradas debe construirse encima de la clasificacion.
- Rendimiento cross-lingual en maithili y bhojpuri (63,3 % y 61,7 %) es inferior al del modelo nativo de cada idioma, por lo que no debe usarse como sustituto de clasificadores especializados en esas lenguas.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de origen (`iam-tsr/hindi-sentiments`) tiene licencia MIT y su procedencia via traduccion automatica conviene verificarla antes de un despliegue comercial a gran escala.
- Modelo con muy poca adopcion (27 descargas, 0 likes) y sin validacion independiente por terceros; no hay informes de produccion ni auditorias de sesgo.
- El propio autor indica que se trata de un proyecto anterior y remite a su trabajo actual (PURVA) para bhojpuri, lo que sugiere que no habra mantenimiento activo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/abhiprd2000/hindi-sentiment-model
- Perfil del autor: https://huggingface.co/abhiprd2000
- Dataset de entrenamiento: https://huggingface.co/datasets/iam-tsr/hindi-sentiments
- Modelo base: https://huggingface.co/cardiffnlp/twitter-xlm-roberta-base-sentiment
- Modelo en ingles relacionado: https://huggingface.co/abhiprd2000/nlp-sentiment-model
- Modelo en maithili relacionado: https://huggingface.co/abhiprd2000/maithili-sentiment-model
- Modelo en bhojpuri relacionado: https://huggingface.co/abhiprd2000/bhojpuri-sentiment-model
- Proyecto actual del autor (PURVA): https://github.com/shodhx/purva
