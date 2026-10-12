# Horizon-Labs/multilingual-hate-speech-base

## Resumen

Horizon-Labs/multilingual-hate-speech-base es un clasificador de texto multilingue especializado en deteccion de discurso de odio, desarrollado por Horizon-Labs. Se construye sobre el modelo base jhu-clsp/mmBERT-base (familia ModernBERT/multilingual ModernBERT, encoder-only) y cuenta con 307.536.392 parametros (308M) segun los pesos en safetensors. Su tarea no es la toxicidad generica, sino identificar ataques contra personas por caracteristicas protegidas (raza, religion, origen, genero, sexualidad, edad, discapacidad) y ademas indicar cual es el colectivo atacado.

El modelo resuelve un problema recurrente en moderacion de contenido: los clasificadores de toxicidad en ingles no generalizan bien a otros idiomas ni distinguen insultos personales, criticas a ideas o contra-discurso de autentico discurso de odio. Para ello emite probabilidades sigmoideas independientes (clasificacion multi-etiqueta) sobre las categorias `hate`, `target_race`, `target_religion`, `target_origin`, `target_gender`, `target_sexuality`, `target_age` y `target_disability`.

Es relevante ahora porque cubre explicitamente alrededor de 44 idiomas identificados en sus metadatos (incluido espanol) bajo licencia Apache-2.0, e incluye exportaciones ONNX y soporte para transformers.js, lo que permite ejecutarlo tanto en servidor como en navegador o CPU sin GPU. El repositorio ocupa 3,1 GB e incluye pesos en safetensors y ONNX. En el momento de la consulta figura con 0 descargas y 0 likes, por lo que se trata de un lanzamiento muy reciente (creado el 11 de octubre de 2026).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT / mmBERT, segun etiquetas del modelo) |
| Parametros totales | 307.536.392 (308M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 (embeddings cuantizados; archivo `onnx/model_quantized.onnx`, 641 MB) y exportaciones ONNX fp32; safetensors fp32 en el repositorio |
| Idiomas soportados | multilingue; 44 idiomas declarados explicitamente: en, es, fr, de, it, pt, nl, pl, cs, ro, hu, el, bg, sr, hr, uk, ru, sv, da, no, fi, tr, ar, he, fa, ur, hi, bn, ta, te, mr, zh, ja, ko, vi, th, id, ms, tl, sw, am, ha, yo, af |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8), compatible con transformers.js |

## Arquitectura y entrenamiento

Se trata de un modelo de clasificacion de secuencias construido sobre jhu-clsp/mmBERT-base. Las etiquetas del repositorio lo identifican como ModernBERT/mmBERT, es decir, un transformer con atencion bidireccional orientado a codificacion de texto, no un modelo generativo ni un decoder autorregresivo. La cabeza de salida es multi-etiqueta con activacion sigmoidea independiente por clase, de modo que las probabilidades de `hate` y de cada colectivo objetivo no suman 1 y pueden activarse a la vez.

En cuanto a los datos de entrenamiento, la model card no detalla el numero de tokens ni la composicion completa del dataset: ese dato es no disponible. Si se explicita que se utilizaron textos de los datasets Measuring Hate Speech y HateXplain (distintos de los elementos de test y sin sus etiquetas) como parte de los datos de entrenamiento, y que ningun elemento de test se empleo para entrenar. La evaluacion se realizo con el script `code/hate/eval_hate.py`, midiendo ROC AUC de la probabilidad de `hate` y F1 con umbral 0,5. No se documentan en la informacion disponible procesos de RLHF, DPO ni innovaciones de decodificacion (no aplicables al ser un encoder de clasificacion).

## Capacidades

- Clasificacion multi-etiqueta de discurso de odio con probabilidades sigmoideas independientes por clase.
- Deteccion de la categoria `hate` entendida como ataque, deshumanizacion, estereotipo o llamada al dano o a la exclusion por caracteristica protegida.
- Identificacion del colectivo atacado mediante las etiquetas `target_race`, `target_religion`, `target_origin`, `target_gender`, `target_sexuality`, `target_age` y `target_disability` (significativas cuando `hate` es alto).
- Distincion frente a toxicidad generica: insultos, palabrotas, ataques a politicos, empresas o aficiones deportivas, critica de ideas y contra-discurso se consideran negativos para la etiqueta de odio.
- Cobertura multilingue con 44 idiomas declarados, incluidos ingles, espanol, aleman, portugues, arabe, hindi, chino, japones, coreano, turco y varias lenguas africanas y del sudeste asiatico.
- Inferencia en CPU y en navegador gracias a las exportaciones ONNX y al soporte de transformers.js (`dtype: "q8"`).
- Uso como pipeline de `text-classification` de Hugging Face con `top_k=None`.
- Tool calling, agentes, razonamiento multi-paso, generacion de texto, vision y audio: no disponibles (no es un modelo generativo ni multimodal).

## Casos de uso

- Moderacion de comentarios en plataformas multilingues: el modelo puntua cada comentario con una probabilidad de odio y una etiqueta de colectivo objetivo, lo que permite enrutar automaticamente a revision humana los casos con `hate >= 0,5` y registrar que grupo se esta atacando.
- Moderacion en tiempo real en el navegador: la exportacion ONNX con transformers.js permite filtrar contenido en el cliente sin enviar el texto a un servidor, util para foros y chats con requisitos de privacidad.
- Priorizacion de colas de revision humana: en lugar de revisar todos los mensajes, el equipo de confianza y seguridad ordena la cola por probabilidad de odio y por colectivo atacado, reduciendo el volumen de revision manual.
- Analisis de discurso en ciencias sociales: procesar corpus de comentarios en varios idiomas y medir la incidencia de discurso de odio por colectivo, aprovechando la separacion entre insulto generico y odio por caracteristica protegida.
- Monitorizacion de comunidades y foros: deteccion de picos de discurso de odio dirigido a un colectivo concreto a lo largo del tiempo, con la etiqueta de objetivo como dimension de analisis.
- Sistemas de seguridad infantil y comunitarios: combinacion con un modelo de toxicidad general (por ejemplo, Horizon-Labs/multilingual-toxicity-small) para cubrir tanto insultos como odio por caracteristica protegida en una misma pipeline.
- Filtrado previo en conjuntos de datos de entrenamiento: limpieza de corpus multilingues antes de usarlos para entrenar otros modelos, usando un umbral ajustable en funcion de la tolerancia a falsos positivos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. La metrica es ROC AUC de la probabilidad de `hate` y F1 con umbral 0,5. HateCheck cubre 11 idiomas; los comentarios reales retenidos son cuatro conjuntos (Stormfront/hate_speech18, ETHOS, OLID-BR y K-MHaS). Los conjuntos marcados como en dominio (Measuring Hate Speech y HateXplain) tienen parte de sus textos, pero no sus elementos de test ni sus etiquetas, en los datos de entrenamiento.

| Modelo | Licencia | HateCheck 11 idiomas: AUC | HateCheck: F1 @ 0,5 | Comentarios reales retenidos (4 conjuntos): AUC media | Measuring Hate Speech (EN): AUC | HateXplain (EN): AUC | Nota |
|---|---|---|---|---|---|---|---|
| Este modelo (308M) | Apache-2.0 | 0,866 | 0,805 | 0,841 | 0,757 | 0,847 | multilingue |
| facebook/roberta-hate-speech-dynabench-r4-target (125M) | no indicada | 0,607 | 0,435 | 0,781 | 0,752 | 0,761 | ingles (Dynabench) |
| cardiffnlp/twitter-roberta-base-hate-latest (125M) | CC-BY-4.0 | 0,541 | 0,167 | 0,713 | 0,863 | 0,731 | tuits en ingles; entrenado con 13 conjuntos de odio, probablemente incluido Measuring Hate Speech |
| Hate-speech-CNERG/dehatebert-mono-english (110M) | Apache-2.0 | 0,569 | 0,309 | 0,687 | 0,737 | 0,722 | ingles |
| pysentimiento/robertuito-hate-speech (109M) | no indicada | 0,574 | 0,174 | 0,683 | 0,680 | 0,569 | tuits en espanol |
| IMSyPP/hate_speech_multilingual (178M) | MIT | 0,691 | 0,762 | 0,741 | 0,803 | 0,609 | multilingue; puntuacion = 1 - P(aceptable) |
| christinacdl/XLM_RoBERTa-Multilingual-Hate-Speech-Detection-New (560M) | MIT | 0,973 | 0,961 | 0,767 | 0,797 | 0,781 | multilingue; AUC 1,00 en 8 idiomas de HateCheck, lo que sugiere entrenamiento sobre HateCheck |

El resto de la tabla de comparacion de la model card aparece truncado en la informacion proporcionada y no se reproduce para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 1,3 GB solo de pesos (307,5M parametros x 4 bytes) mas activaciones; en fp16, en torno a 0,65-0,8 GB; con la exportacion ONNX int8 (641 MB de archivo) el consumo baja a aproximadamente 0,5-1 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 4090 o una A100/H100 quedan sobredimensionadas para un modelo de 308M y su uso tendria sentido solo por agregacion de muchas peticiones concurrentes.
- Consumer GPU: si, cabe holgadamente en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas con varios GB de memoria compartida). Con la cuantizacion int8 puede ejecutarse en CPU de forma practica.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime, transformers.js en navegador, y los tags del repositorio incluyen `text-embeddings-inference` y `endpoints_compatible`. Compatibilidad con vLLM o TGI para clasificacion: no disponible.
- Latencia y throughput estimados: no disponibles. El autor solo publica que la version ONNX int8 difiere del fp32 en 0,0012 de probabilidad media sobre 448 textos de prueba, lo que permite usar la cuantizacion sin perdida apreciable de calidad.
- Tamano del repositorio: 3,1 GB, ya que incluye pesos fp32 en safetensors junto con las exportaciones ONNX; para despliegue conviene descargar unicamente los archivos necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | HateCheck 11 idiomas (AUC / F1 @ 0,5) | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-Labs/multilingual-hate-speech-base | 308M | 44 idiomas declarados | Apache-2.0 | 0,866 / 0,805 | Hugging Face, ONNX, transformers.js |
| christinacdl/XLM_RoBERTa-Multilingual-Hate-Speech-Detection-New | 560M | multilingue (XLM-R) | MIT | 0,973 / 0,961 | Hugging Face (resultado sospechoso de contaminacion con HateCheck) |
| IMSyPP/hate_speech_multilingual | 178M | multilingue | MIT | 0,691 / 0,762 | Hugging Face |
| Horizon-Labs/multilingual-toxicity-small | no disponible | multilingue | no disponible en la informacion proporcionada | no disponible | Hugging Face; complementario (toxicidad general, no odio por caracteristica protegida) |

La comparativa de la model card con modelos en ingles (roberta-hate-speech-dynabench-r4-target, cardiffnlp/twitter-roberta-base-hate-latest, dehatebert-mono-english, robertuito-hate-speech) muestra que este modelo supera a los clasificadores monoingles en HateCheck multilingue y mantiene valores competitivos en los conjuntos en ingles. Cabe senalar que el modelo de XLM-RoBERTa con AUC 0,973 en HateCheck probablemente ha sido entrenado sobre ese mismo conjunto, por lo que su comparacion directa no es limpia.

## Limitaciones y advertencias

- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos: el umbral recomendado es 0,5 y el autor indica que conviene ajustarlo con datos propios.
- Sesgos conocidos: no se documentan analisis de sesgo por idioma, dialecto o variedad linguistica; con 44 idiomas declarados, el rendimiento real puede variar mucho entre ellos y no se publican metricas desagregadas por idioma mas alla de HateCheck en 11 lenguas.
- Dependencia de la definicion de odio adoptada: el modelo sigue una definicion estricta (ataques por caracteristica protegida) y clasifica insultos, criticas a politicos o contra-discurso como no odio; esto puede no coincidir con las politicas de moderacion de cada plataforma.
- Solo cubre odio por caracteristica protegida: no detecta toxicidad generica, spam, acoso no basado en caracteristica protegida ni contenido sexual; el autor recomienda combinarlo con un modelo de toxicidad general.
- Limitaciones de contexto: la longitud maxima de contexto no esta publicada en la informacion disponible, por lo que no se puede garantizar el comportamiento con documentos largos; los comentarios que superen ese limite deberan trocearse.
- Datos de evaluacion: Measuring Hate Speech y HateXplain son conjuntos "en dominio" (parte de sus textos, no sus etiquetas ni sus elementos de test, estuvieron en entrenamiento), por lo que sus cifras no equivalen a una evaluacion completamente fuera de dominio. El propio autor advierte que el modelo de XLM-RoBERTa con AUC 0,973 en HateCheck probablemente fue entrenado sobre ese conjunto.
- Licencia: Apache-2.0, lo que permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion de avisos. No se indican restricciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes y fue creado el 11 de octubre de 2026, por lo que carece de validacion independiente por parte de la comunidad.
- Uso en produccion: al ser un clasificador, cualquier decision automatizada de sancion o bloqueo deberia mantener supervision humana, especialmente en idiomas con baja representacion en los datos de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-hate-speech-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo complementario de toxicidad: https://huggingface.co/Horizon-Labs/multilingual-toxicity-small
- Dataset Multilingual HateCheck: https://huggingface.co/datasets/mteb/multi-hatecheck
- Dataset hate_speech18 (Stormfront): https://huggingface.co/datasets/odegiber/hate_speech18
- Dataset ETHOS: https://github.com/intelligence-csd-auth-gr/Ethos-Hate-Speech-Dataset
- Dataset OLID-BR: https://huggingface.co/datasets/dougtrajano/olid-br
- Dataset K-MHaS: https://github.com/adlnlp/K-MHaS
- Dataset Measuring Hate Speech: https://huggingface.co/datasets/ucberkeley-dlab/measuring-hate-speech
- Dataset HateXplain: https://github.com/hate-alert/HateXplain
- Modelo de comparacion facebook/roberta-hate-speech-dynabench-r4-target: https://huggingface.co/facebook/roberta-hate-speech-dynabench-r4-target
- Modelo de comparacion cardiffnlp/twitter-roberta-base-hate-latest: https://huggingface.co/cardiffnlp/twitter-roberta-base-hate-latest
- Modelo de comparacion Hate-speech-CNERG/dehatebert-mono-english: https://huggingface.co/Hate-speech-CNERG/dehatebert-mono-english
- Modelo de comparacion pysentimiento/robertuito-hate-speech: https://huggingface.co/pysentimiento/robertuito-hate-speech
- Modelo de comparacion IMSyPP/hate_speech_multilingual: https://huggingface.co/IMSyPP/hate_speech_multilingual
- Modelo de comparacion christinacdl/XLM_RoBERTa-Multilingual-Hate-Speech-Detection-New: https://huggingface.co/christinacdl/XLM_RoBERTa-Multilingual-Hate-Speech-Detection-New
