# Heroine2/lingala-news-topic-classifier

## Resumen

El Lingala News Topic Classifier es un modelo de clasificacion de texto en lingala desarrollado por el usuario Heroine2 (proyecto de la asignatura ALU NLP and Language Technologies) mediante ajuste fino del modelo preentrenado AfroXLMR-base de Davlan. Clasifica articulos periodisticos en cuatro categorias: politica, salud, deportes y economia. Es un encoder tipo XLM-RoBERTa con 278 millones de parametros, entrenado sobre la particion en lingala del corpus MasakhaNEWS.

El problema que resuelve es concreto: no existian clasificadores de temas competitivos para lingala, una lengua bantú de la Republica Democratica del Congo y la Republica del Congo con recursos NLP muy limitados. El modelo alcanza un macro-F1 de 0,911 y una precision del 93,0 % en el conjunto de test oficial de MasakhaNEWS (175 articulos), superando baselines clasicos como TF-IDF + SVM, BiLSTM con atencion y un transformer entrenado desde cero.

Es relevante porque demuestra que el ajuste fino de un modelo multilingue adaptado a lenguas africanas (AfroXLMR) supera ampliamente a alternativas entrenadas desde cero en escenarios de bajos recursos, con una ventana de contexto de 512 tokens y un tamano de pesos de 1,1 GB. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base, AfroXLMR) |
| Parametros totales | 278.046.724 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de subpalabra (entrada truncada a los primeros 512 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision completa; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | lingala (ln); el modelo base es multilingue, pero el ajuste fino se ha realizado exclusivamente en lingala |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo XLM-RoBERTa base (278 M de parametros, 12 capas, atencion bidireccional, vocabulario SentencePiece compartido). El punto de partida es AfroXLMR-base, un modelo descrito en Alabi et al. (2022) que aplica ajuste fino adaptativo multilingue (MAFT) sobre XLM-R para lenguas africanas, lo que mejora la representacion sublexica y morfologica de idiomas con pocos datos. Sobre esa base se aplica una cabeza de clasificacion de secuencia para cuatro clases.

El ajuste fino se realizo sobre la particion en lingala de MasakhaNEWS (Adelani et al., 2023), un corpus de noticias de VOA Lingala: 608 articulos de entrenamiento y 87 de validacion, con 175 articulos de test. El formato de entrada fue el titular concatenado con el cuerpo del articulo (`headline + ". " + article text`) truncado a 512 tokens. La configuracion de entrenamiento empleo AdamW con learning rate 2e-5, weight decay 0,01, calentamiento lineal del 10 %, tamano de lote 16, hasta 10 epocas con parada temprana (paciencia 3) sobre el macro-F1 de validacion y entropia cruzada con ponderacion de clases (class-weighted cross-entropy). El entrenamiento se ejecuto en fp16 sobre una GPU T4 de Colab. No se aplicaron tecnicas de RLHF ni DPO (no son relevantes para una tarea de clasificacion). Destaca el uso de pesos de clase para compensar el desbalance entre las cuatro categorias, que es el origen de la brecha de rendimiento observada en la clase "business".

## Capacidades

- Clasificacion de noticias en lingala en cuatro temas: politica, salud, deportes y economia.
- Salida de etiqueta con puntuacion de probabilidad por clase (clasificacion monoetiqueta).
- Manejo de entradas de hasta 512 tokens de subpalabra, suficiente para titular mas cuerpo de articulo breve o truncado.
- Funciona como encoder de texto utilizable para extraccion de representaciones (text embeddings), con compatibilidad declarada con Text Embeddings Inference (TEI) y endpoints compatibles.
- No dispone de generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No tiene vision, audio ni modo de razonamiento.
- Capacidad multilingue limitada: solo se ha evaluado en lingala; no hay garantia de rendimiento en otras lenguas africanas pese a la base multilingue.

## Casos de uso

- Agregadores y portales de noticias en lingala: clasificar automaticamente cada articulo entrante en una de las cuatro secciones para enrutarlo a la categoria correspondiente, reduciendo la revision manual en redacciones con poco personal.
- Moderacion y organizacion de archivos periodisticos: etiquetar un corpus historico de VOA Lingala u otras fuentes para hacerlo buscable por tema, aprovechando el rendimiento alto en deportes (F1 0,98) y politica (F1 0,94).
- Monitorizacion de medios para ONGs y organismos internacionales: detectar de forma automatica piezas sobre salud (por ejemplo brotes epidemicos) o politica (procesos electorales) para generar alertas tempranas en la region de los Grandes Lagos.
- Sistemas de recomendacion de contenido: usar la etiqueta tematica como feature para personalizar la portada de una aplicacion de noticias en lingala.
- Preprocesado para pipelines de traduccion o sintesis de voz: clasificar primero el tema para seleccionar glosarios, voces o modelos especificos aguas abajo.
- Investigacion en NLP de bajos recursos: servir de baseline reproducible para lenguas africanas, ya que el repositorio incluye el codigo y el informe del proyecto, y las metricas por clase permiten comparaciones directas.
- Analitica editorial: medir la distribucion tematica de la cobertura de un medio a lo largo del tiempo (por ejemplo, proporcion de noticias de salud durante un brote) a partir de la clasificacion por lotes.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test en lingala de MasakhaNEWS (175 articulos), segun la model card del autor. Media mas menos desviacion estandar sobre 3 semillas de entrenamiento.

| Modelo | Macro-F1 | Weighted-F1 | Accuracy |
|---|---|---|---|
| Clase mayoritaria | 0,182 | 0,416 | 0,571 |
| TF-IDF (palabra + caracter) + SVM lineal | 0,822 | 0,852 | 0,857 |
| BiLSTM + atencion (inicializacion Word2Vec) | 0,859 ± 0,026 | 0,888 | 0,893 |
| Transformer entrenado desde cero | 0,824 ± 0,041 | 0,876 | 0,880 |
| Este modelo (AfroXLMR ajustado) | 0,911 ± 0,014 | 0,929 | 0,930 |

F1 por clase del modelo: politica 0,94; salud 0,93; deportes 0,98; economia 0,79. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a una tarea de clasificacion tematica.

## Requisitos de hardware

- VRAM estimada (solo pesos): aproximadamente 1,11 GB en fp32, 0,56 GB en fp16 y 0,28 GB en int8. Hay que anadir memoria para activaciones y lote, pero el consumo total es muy bajo.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; el autor lo entreno en una T4 de Colab. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para el modelo.
- Inferencia en CPU: perfectamente viable para clasificacion por lotes o en tiempo real con baja concurrencia; el modelo cabe en cualquier portatil moderno.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos ocho anos, e incluso en dispositivos de borde si se exporta a ONNX o se cuantiza.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), servidores FastAPI/ONNX Runtime y despliegue con Docker. No se recomienda vLLM ni TGI, orientados a modelos generativos.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada).

## Comparativa con modelos similares

Comparativa arquitectonica y de disponibilidad. Los datos de rendimiento de los modelos alternativos sobre MasakhaNEWS en lingala no se han publicado en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Heroine2/lingala-news-topic-classifier | 278 M | 512 tokens | Apache 2.0 | Ajustado especificamente para lingala; macro-F1 0,911 en MasakhaNEWS ln |
| Davlan/afro-xlmr-base | 278 M | 512 tokens | MIT (XLM-R) / Apache 2.0 segun variante, no confirmado | Modelo base multilingue; sin cabeza de clasificacion; no disponible su rendimiento directo en esta tarea |
| xlm-roberta-base (Facebook AI) | 278 M | 512 tokens | MIT | Multilingue generico; requiere ajuste fino para clasificacion de temas en lingala; rendimiento en MasakhaNEWS ln no disponible |
| bert-base-multilingual-cased | 178 M | 512 tokens | Apache 2.0 | Alternativa multilingue clasica; cobertura de lingala notablemente inferior a AfroXLMR; rendimiento no disponible |

Relacionado con la misma tarea, los baselines de la model card (TF-IDF + SVM, BiLSTM y transformer desde cero) obtienen macro-F1 de 0,822, 0,859 y 0,824 respectivamente, frente al 0,911 de este modelo.

## Limitaciones y advertencias

- Cobertura tematica cerrada: solo cuatro clases (politica, salud, deportes, economia). Los articulos de cultura, religion o tecnologia se fuerzan a una de ellas, generando errores silenciosos.
- Sesgo de fuente: entrenado unicamente con noticias de VOA Lingala, mayoritariamente del periodo 2018-2023 (Ebola, COVID-19, politica de la RDC). El estilo editorial y la variante ortografica de esa emisora condicionan el modelo; otras variantes, como la ortografia de Brazzaville o el registro de redes sociales, pueden clasificarse de forma menos fiable.
- Confusiones entre clases: la mayoria de los errores se producen en articulos que mezclan politica con economia o salud (por ejemplo, una votacion parlamentaria sobre una emergencia sanitaria). La clase economia es la mas debil, con F1 0,79.
- Sobreconfianza: el modelo asigna probabilidades altas incluso a predicciones erroneas, por lo que las puntuaciones de salida no deben interpretarse como medidas fiables de incertidumbre sin calibracion.
- Tamano de dataset reducido: 608 articulos de entrenamiento, lo que incrementa el riesgo de sobreajuste a la distribucion de la fuente y limita la generalizacion.
- Alucinacion: al ser un modelo discriminativo no genera texto, por lo que no alucina en sentido estricto, pero si puede producir etiquetas incorrectas con alta confianza.
- Limite de contexto: 512 tokens de subpalabra; los articulos mas largos se truncan, con la consiguiente perdida de informacion tematica al final del texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. No hay restricciones de uso adicionales declaradas.
- Advertencia para produccion: sin evaluacion fuera del conjunto de test de MasakhaNEWS, conviene validar el modelo con datos propios antes de desplegarlo en una linea editorial distinta a la de VOA Lingala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Heroine2/lingala-news-topic-classifier
- Demo en vivo: https://huggingface.co/spaces/Heroine2/lingala-news-topic-classifier
- Codigo, experimentos e informe: https://github.com/h-mutumwinka/Lingala_News_Classification
- Modelo base AfroXLMR: https://huggingface.co/Davlan/afro-xlmr-base
- Dataset MasakhaNEWS: https://huggingface.co/datasets/masakhane/masakhanews
- Paper de AfroXLMR (Alabi et al., 2022, COLING): referencia citada en la model card, enlace no disponible
- Paper de MasakhaNEWS (Adelani et al., 2023, IJCNLP-AACL): referencia citada en la model card, enlace no disponible
