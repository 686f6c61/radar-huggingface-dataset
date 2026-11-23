# AxcLogo/chinese-roberta-text-genre-classifier-onnx

## Resumen

El modelo `chinese-roberta-text-genre-classifier-onnx` es un clasificador de texto en chino que determina el genero o tipo de contenido de un texto (genero discursivo), no su tematica. Distingue siete categorias: relato en primera persona, noticia, consejo o divulgacion, comunicado oficial, publicidad, discusion y contenido invalido. Lo desarrolla el usuario AxcLogo y se distribuye bajo licencia Apache 2.0. Esta pensado para el precribado y enrutado de contenido generado por usuarios (UGC) en redes sociales, comentarios, formularios de reclamacion y notas de prensa.

Tecnicamente es un fine-tuning del modelo base `hfl/chinese-roberta-wwm-ext` (12 capas, dimension oculta 768), exportado a ONNX con cuantizacion dinamica INT8 por canal y pensado para ejecutarse en CPU con unicamente ONNX Runtime, sin necesidad de PyTorch. El repositorio ocupa aproximadamente 0,1 GB y el modelo pesa unos 107 MB.

Su relevancia practica reside en el coste de despliegue: al ser un clasificador compacto y cuantizado que corre en CPU a 20-30 textos por segundo con dos hilos, permite montar un filtro previo de moderacion o triaje antes de invocar modelos generativos mas caros. La entrada se trunca a 256 tokens manteniendo cabeza y cola del texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base `hfl/chinese-roberta-wwm-ext`, 12 capas, hidden 768) |
| Parametros totales | no disponible (peso del artefacto ONNX INT8: aproximadamente 107 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado cabeza+cola) |
| Tipos de cuantizacion | INT8 dinamico por canal para MatMul, embeddings de palabra INT8 por columnas; proyeccion de salida de la FFN de la primera capa en FP32 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), con `tokenizer.json` y `model_meta.json` |

## Arquitectura y entrenamiento

El modelo parte de `hfl/chinese-roberta-wwm-ext`, un encoder transformer de 12 capas y 768 dimensiones ocultas con tokenizacion BERT adaptada al chino. Sobre esa base se anadio una cabeza de clasificacion de 7 clases y se hizo fine-tuning durante 4 epocas con perdida de entropia cruzada. La exportacion a ONNX usa opset 17; la cuantizacion es dinamica INT8 por canal para las operaciones MatMul y por columnas para los embeddings de palabra, dejando la proyeccion de salida de la FFN de la primera capa en FP32 por valores atipicos de activacion. Segun el autor, la cuantizacion cuesta aproximadamente 0,003 de accuracy frente a FP32.

No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset. Si se indica que los datos de entrenamiento proceden de publicaciones web chinas, comentarios, formularios de reclamacion y noticias, y que el conjunto de evaluacion se recogio con posterioridad a todos los datos de entrenamiento (particion temporal). El etiquetado del conjunto de test lo realizaron dos anotadores LLM con adjudicacion humana de cada desacuerdo. La entrada se normaliza en espacios en blanco y, si supera el presupuesto de 256 tokens, se conservan la cabeza y la cola del texto. Cuando un texto encaja en varias categorias se aplica una prioridad fija: invalid → statement → news → experience → ad → tip → discussion.

## Capacidades

- Clasificacion de genero o tipo de contenido en chino en 7 clases: `experience` (relato en primera persona), `news` (noticia), `tip` (consejo o divulgacion), `statement` (comunicado oficial), `ad` (publicidad), `discussion` (discusion o pregunta) e `invalid` (contenido ilegible).
- Devuelve probabilidades por clase (softmax sobre los logits), no solo la etiqueta ganadora.
- Acepta un texto por llamada; para publicaciones se recomienda concatenar titulo y cuerpo con un salto de linea, y para comentarios pasar solo el comentario.
- Truncado cabeza+cola para entradas largas, preservando informacion del inicio y del final del texto.
- Inferencia en CPU con ONNX Runtime, sin dependencia de PyTorch.
- Interfaz programatica mediante `handler.py` con funciones `load(model_dir)` y `predict(model, {"text": ...})`.
- No realiza juicio de veracidad, tematica, sentimiento ni riesgo; se limita a la clasificacion de genero.

## Casos de uso

- Moderacion y triaje de comentarios en redes sociales: el clasificador separa contenido invalido, publicidad y discusion antes de aplicar reglas o modelos generativos, reduciendo el volumen que llega a etapas mas costosas. Su velocidad de 20-30 textos por segundo en dos hilos de CPU lo hace viable para flujos de alto volumen.
- Enrutado de formularios de reclamacion: los formularios de formato fijo se clasifican casi perfectamente segun el autor, por lo que se pueden derivar automaticamente a los equipos de atencion al cliente o de analisis de incidencias segun si son relato de experiencia, comunicado o consulta.
- Deteccion de publicidad y captacion de leads en foros y grupos: la clase `ad` permite identificar reclutamiento, promociones y generacion de contactos, util para filtrar spam comercial en comunidades de empleo o compraventa.
- Separacion de noticias frente a opiniones y relatos personales en agregadores de contenido: la clase `news` con F1 de 0,870 permite etiquetar automaticamente piezas informativas frente a testimonios o debates.
- Prefiltro de contenido para paneles de analisis reputacional: al distinguir comunicados oficiales de relatos de usuarios, facilita agrupar menciones institucionales y experiencias de clientes en vistas separadas.
- Clasificacion de genero en pipelines de investigacion sobre UGC chino: el modelo sirve como anotador automatico de bajo coste en estudios de discurso en redes, con la advertencia de revisar manualmente las clases minoritarias (`statement`, `invalid`).
- Filtrado de ruido previo a indexacion o busqueda: la clase `invalid` descarta marcadores de posicion, nombres sueltos, emojis y texto corrupto antes de almacenar o procesar el contenido.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test de 1.121 textos recogidos despues de todos los datos de entrenamiento (particion temporal), evaluados con el modelo ONNX INT8 en CPU. Datos no verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Accuracy | 0,865 (IC bootstrap 95 %: 0,844-0,885) |
| Macro-F1 (7 clases) | 0,728 (IC: 0,60-0,80; `statement` e `invalid` con muy pocas muestras) |
| F1 (first-hand account / `experience`) | 0,950 |
| F1 (news report / `news`) | 0,870 |

Desglose por clase:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| experience | 0,972 | 0,930 | 0,950 |
| news | 0,921 | 0,824 | 0,870 |
| tip | 0,738 | 0,794 | 0,765 |
| ad | 0,630 | 0,707 | 0,667 |
| discussion | 0,623 | 0,736 | 0,675 |
| invalid | 0,500 | 0,500 | 0,500 |
| statement | 1,000 | 0,500 | 0,667 |

Las confusiones principales se dan entre `experience` y `discussion` en publicaciones cortas de redes sociales, y entre `tip` y `ad`. Los formularios de reclamacion de formato fijo se clasifican casi perfectamente; los casos mas dificiles son las publicaciones muy cortas y los pies de video compuestos solo por hashtags. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante ONNX Runtime; no requiere GPU ni PyTorch.
- Huella en disco del artefacto ONNX INT8: aproximadamente 107 MB (repositorio de aproximadamente 0,1 GB).
- VRAM estimada: no aplica en el escenario previsto (CPU); no se dispone de cifras para ejecucion en GPU.
- Throughput declarado: 20-30 textos por segundo con 2 hilos de CPU.
- Latencia por texto: no disponible de forma explicita (derivable del throughput, del orden de decenas de milisegundos por texto).
- GPU recomendadas: no disponible; el modelo esta disenado para CPU.
- Cabe en cualquier equipo de consumo al ejecutarse en CPU; no se especifican requisitos de memoria RAM.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`; el repositorio incluye `handler.py` con la logica de carga y prediccion. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Dependencias de inferencia: `onnxruntime`, `tokenizers`, `huggingface_hub` y `numpy`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| chinese-roberta-text-genre-classifier-onnx | no disponible (base de 12 capas, hidden 768) | 256 tokens | Apache 2.0 | ONNX INT8 | Clasificador de genero en chino, solo CPU |
| hfl/chinese-roberta-wwm-ext (modelo base) | no disponible | no disponible | no disponible en la informacion | safetensors/PyTorch | Encoder chino sin cabeza de clasificacion de genero |
| Alternativas de clasificacion de genero en chino | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |

## Limitaciones y advertencias

- Clasifica unicamente el genero del texto; no evalua veracidad, tematica, sentimiento ni riesgo.
- Entrenado con publicaciones web chinas, comentarios, formularios de reclamacion y noticias; otros dominios como documentos formales o registros de chat quedan fuera de distribucion.
- Las clases `statement` e `invalid` son raras en los datos; sus metricas (F1 de 0,667 y 0,500 respectivamente) son poco fiables y deben tratarse con cautela.
- Confusiones documentadas entre `experience` y `discussion` en textos cortos, y entre `tip` y `ad`.
- Los textos muy cortos y los pies de video con solo hashtags son los casos mas dificiles.
- Ventana de contexto limitada a 256 tokens con truncado cabeza+cola; textos mas largos pierden contenido intermedio.
- Solo soporta chino; no hay capacidades multilingues.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribucion y aviso de licencia; conviene revisar los terminos del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AxcLogo/chinese-roberta-text-genre-classifier-onnx
- Modelo base: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
