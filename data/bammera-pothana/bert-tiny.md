# bammera-pothana/BERT-tiny

## Resumen

BERT-tiny (Telugu) es un codificador BERT en miniatura entrenado desde cero para el idioma telugu por el usuario bammera-pothana, publicado en Hugging Face bajo el identificador `bammera-pothana/BERT-tiny`. Reproduce la receta original de BERT de Devlin et al. (2018) y la receta de miniaturas de Turc et al. (2019), aplicada integramente al telugu sin modificaciones mas alla del vocabulario. Con 4,6 millones de parametros, es el miembro mas pequeno de la coleccion "Google's Recipes" del autor, pensada para replicar los modelos BERT compactos tamano a tamano.

El modelo resuelve el problema de disponer de un codificador telugu rapido y ligero para tareas de procesamiento del lenguaje natural: es un punto de partida para fine-tuning, el extremo inferior de un estudio de escalado o destilacion con los tamanos mayores de la coleccion, y un modelo de lenguaje enmascarado de bajo coste para puntuar y ordenar texto en telugu. Su arquitectura es un transformer BERT estandar (`BertForPreTraining`) con 2 capas, tamano oculto 128, 2 cabezas de atencion y capa feed-forward de 512, con una longitud maxima de secuencia de 512 tokens.

Es relevante ahora por su tamano extremadamente reducido (pesos en float32 de 18,5 MB), que permite ejecutarlo en CPU y en GPUs de consumo con latencia muy baja, y por estar entrenado especificamente en telugu con tokenizer propio de 32.000 tokens WordPiece, preservando las marcas vocalicas del silabario telugu. No obstante, al ser un modelo de 4,6 millones de parametros, su capacidad de representacion es limitada y debe considerarse una linea base, no un modelo de produccion para tareas complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForPreTraining`: cabeza de masked LM + cabeza de next-sentence prediction) |
| Parametros totales | 4.607.360 (mayoria en embeddings: 32.000 x 128) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | telugu (`te`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32, `model.safetensors`, 18,5 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer BERT clasico con 2 capas, tamano oculto 128, 2 cabezas de atencion y capa feed-forward de 512, con activacion GELU y dropout de 0,1 en capas ocultas y atencion. El modelo se entrena con los dos objetivos originales de BERT: masked language modeling sobre el 15 % de los tokens WordPiece (80 % reemplazados por `[MASK]`, 10 % por token aleatorio, 10 % sin cambios) y next-sentence prediction. El enmascaramiento es a nivel de token, dinamico y se remuestrea en cada batch, siguiendo la receta original de Google.

El entrenamiento se realizo en una unica programacion continua de 1.000.000 de pasos con batch global de 256 secuencias: 900.000 pasos con secuencias de 128 tokens y 100.000 pasos con secuencias de 512 tokens, conservando el estado del optimizador entre fases. Se uso AdamW con learning rate 1e-4, betas 0,9 y 0,999, epsilon 1e-6, weight decay 0,01 (no aplicado a bias ni LayerNorm), warm-up lineal de 10.000 pasos y decaimiento lineal hasta cero en el paso 1.000.000, con recorte de gradiente de 1,0. El entrenamiento se ejecuto en 4 x NVIDIA GeForce RTX 2080 Ti (11 GB) durante aproximadamente 10 horas en la fase 1 y 4 horas en la fase 2, con autocast en float16 y escalado de perdida, manteniendo los pesos en float32. Los ejemplos se construyeron con el procedimiento de `create_pretraining_data.py` de Google (`[CLS] A [SEP] B [SEP]`), con B como continuacion real la mitad de las veces y como segmento de otro documento el resto, y un 10 % de ejemplos con longitud objetivo mas corta. Se reservo un conjunto de documentos de validacion antes de aprender el vocabulario, que nunca se uso en entrenamiento.

El tokenizer es un `BertTokenizerFast` estandar con 32.000 tokens WordPiece, sensible a mayusculas, sin eliminacion de acentos ni minusculizacion, ya que eliminar acentos destruiria las marcas vocalicas del telugu (మాత్రలు). Por ello debe cargarse desde este repositorio y no configurarse manualmente. El texto se normaliza en NFC.

## Capacidades

- Generacion de predicciones de masked language modeling (fill-mask) en telugu.
- Next-sentence prediction: clasificacion de si dos segmentos son continuacion.
- Extraccion de representaciones contextuales (hidden states y pooler) para fine-tuning en tareas downstream.
- Clasificacion de secuencias mediante `AutoModelForSequenceClassification`.
- Puntuacion y ranking de texto en telugu (scoring y ordenacion).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al telugu; no se documenta soporte de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Linea base para fine-tuning en telugu: el modelo puede adaptarse con `AutoModelForSequenceClassification` o `AutoModel` para tareas de clasificacion de texto, analisis de sentimiento o deteccion de temas, sirviendo como referencia de partida de bajo coste antes de escalar a modelos mayores.
- Puntuacion y ranking de texto en telugu: al ser un modelo de lenguaje enmascarado, permite calcular la verosimilitud de fragmentos de texto telugu para ordenar candidatos en busqueda, correccion o seleccion de traducciones, con un coste computacional minimo.
- Estudio de escalado y destilacion: al formar parte de una coleccion de tamanos BERT miniaturas, se usa como extremo inferior en experimentos que comparan rendimiento frente a tamano, o como estudiante en destilacion desde modelos mayores.
- Relleno de huecos interactivo: mediante el pipeline `fill-mask`, puede integrarse en editores o herramientas de escritura en telugu para sugerir palabras enmascaradas en contextos cortos.
- Prototipado rapido en CPU: con 4,6 millones de parametros y pesos de 18,5 MB, permite iterar en entornos sin GPU, en portatiles o en contenedores ligeros, para validar pipelines de NLP en telugu antes de invertir en modelos mayores.
- Filtrado y preprocesamiento de corpus: puede usarse como encoder ligero para generar embeddings de documentos telugu y agrupar, deduplicar o filtrar grandes colecciones de texto con throughput alto.
- Evaluacion de infraestructura de inferencia: por su tamano minimo, sirve como modelo de prueba para validar despliegues con transformers, endpoints compatibles o pipelines de CI antes de mover cargas a modelos de mayor tamano.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados):

| Checkpoint | MLM loss | MLM perplexity | MLM accuracy (top-1) | NSP accuracy |
|---|---|---|---|---|
| Fin de fase 1 (paso 900 k, 128 tokens) | 4,465 | 87,0 | 30,9 % | 88,6 % |
| Publicado: fin de fase 2 (paso 1 M, 512 tokens) | 4,535 | 93,2 | 30,2 % | 91,8 % |

El conjunto de evaluacion son documentos de validacion en telugu con ejemplos de 512 tokens, enmascarados con semilla fija. El autor senala que el mayor loss de MLM tras la fase 2 es esperado, ya que el conjunto de 512 tokens es una muestra distinta y mas dificil (segmentos mas largos y mas ejemplos de pares aleatorios), mientras que NSP mejora con el contexto mas largo. El loss de validacion seguia disminuyendo lentamente al final de la fase 1 y habia convergido en la fase 2 (4,536 en el paso 60 k frente a 4,535 en el paso 100 k). No se han publicado resultados de benchmarks downstream (fine-tuning) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (pesos de 18,5 MB mas overhead de activaciones y framework); en la practica, cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente. El entrenamiento del autor se realizo en 4 x RTX 2080 Ti.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en GPUs integradas.
- Opciones de despliegue: transformers (pipeline `fill-mask`, `AutoModel`, `AutoModelForSequenceClassification`, `BertForPreTraining`), endpoints compatibles con transformers; el autor no documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERT-tiny (este modelo) | 4,6 M | 512 | Telugu | no disponible | Hugging Face |
| BERT-tiny original (Turc et al., 2019) | ~4,4 M | 512 | Ingles | no disponible | Hugging Face (google/bert_uncased_L-2_H-128_A-2) |
| BERT-mini original (Turc et al., 2019) | ~11,2 M | 512 | Ingles | no disponible | Hugging Face (google/bert_uncased_L-4_H-256_A-4) |
| MuRIL / modelos multilingues BERT | cientos de millones | 512 | Multilingue (incluye telugu) | no disponible | Hugging Face |

La comparacion directa con modelos telugu de mayor tamano no esta disponible en la informacion proporcionada. El modelo se posiciona como el miembro mas pequeno de la coleccion del autor, con un rendimiento de MLM (perplexity 93,2, accuracy top-1 30,2 %) que debe interpretarse como linea base de un modelo de 4,6 millones de parametros, no como un resultado competitivo frente a encoders multilingues de mayor tamano.

## Limitaciones y advertencias

- Capacidad de representacion muy limitada: 2 capas y 4,6 millones de parametros restringen el rendimiento en tareas downstream complejas; es una linea base, no un modelo de produccion para tareas exigentes.
- Riesgo de alucinacion y predicciones incorrectas: la accuracy top-1 de MLM es del 30,2 %, por lo que la mayoria de las predicciones de tokens enmascarados no seran correctas.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con texto telugu, puede reflejar sesgos del corpus de preentrenamiento, que no se describe en detalle.
- Limitaciones de idioma: solo telugu; no se documenta soporte de otros idiomas ni de variantes dialectales.
- Limitaciones de contexto: maximo de 512 tokens; no apto para documentos largos sin truncado o segmentacion.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Tokenizer no reutilizable: debe cargarse desde este repositorio, ya que la configuracion manual (minusculizacion, eliminacion de acentos) destruiria las marcas vocalicas del telugu.
- Resultados de benchmarks no verificados: los valores del model-index estan marcados como `verified: false` y corresponden solo a metricas de preentrenamiento (MLM y NSP), sin resultados downstream.
- Modelo reciente y con pocas descargas (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/bammera-pothana/BERT-tiny
- Perfil del autor: https://huggingface.co/bammera-pothana
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de BERT miniatures (Turc et al., 2019): https://arxiv.org/abs/1908.08962
- Repositorio de referencia de Google para creacion de datos de preentrenamiento: https://github.com/google-research/bert
