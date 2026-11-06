# klohdfhk/amharic-news-classifier

## Resumen

El modelo `klohdfhk/amharic-news-classifier` es un clasificador de texto para noticias en amharico (idioma oficial de Etiopia) que asigna cada articulo a una de seis categorias tematicas: business, entertainment, national_news, politics, sports y world_news. Lo desarrolla el usuario de Hugging Face klohdfhk y se distribuye como un fine-tuning del modelo multilingue AfroXLMR-mini, con 117,6 millones de parametros y un repositorio de 0,5 GB. Su relevancia es acotada y de caracter experimental: el propio autor lo describe como un artefacto de benchmark, no como el mejor clasificador disponible para esta tarea.

La model card es inusualmente honesta y documenta que el transformer queda por detras de las lineas base clasicas de TF-IDF combinado con LinearSVC. Sobre el conjunto de test de 10.179 ejemplos, el modelo alcanza un macro-F1 de 0,581 frente al 0,784 de la mejor linea base clasica, con un recall de apenas el 10,4% en la clase national_news. Es, por tanto, un ejemplo de publicacion de investigacion con evaluacion rigurosa y limites explicitos, mas que una herramienta lista para produccion.

El modelo trabaja exclusivamente con texto en amharico, procesa como maximo 192 subtokens de entrada (concatenando titular y cuerpo de la noticia) y se publica bajo licencia CC BY 4.0, con el codigo original bajo MIT. No se ha publicado ningun Space de demostracion ni pesos convertidos para navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, variante AfroXLMR-mini) |
| Parametros totales | 117.643.014 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 subtokens de entrada (maximo configurado en inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amharico (am) |
| Licencia | CC BY 4.0 (modelo); codigo del proyecto MIT; modelo base MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Davlan/afro-xlmr-mini` (revision `bc04038b969667884bd83cdd37bed9559c2c3d9c`), un encoder transformer de tipo XLM-RoBERTa adaptado a lenguas africanas. La cabeza de clasificacion se entrena sobre seis etiquetas con entropia cruzada balanceada por clase, optimizador AdamW, tasa de aprendizaje 2e-05, batch de 8 con acumulacion de gradiente de 2 y semilla 42. La epoca seleccionada fue la 2, con un macro-F1 de validacion de 0,566.

El dataset de entrenamiento es `israel/Amharic-News-Text-classification-Dataset` (revision `b646090ef0d09981da9c9765c4d376b407aa5955`), que cita a Azime & Mohammed (2021). Tras el preprocesado (normalizacion NFC, eliminacion de controles de ancho cero, colapso de espacios, filtrado de registros con menos del 10% de letras etiopes y eliminacion de duplicados y solapamientos train/test) quedaron 31.949 ejemplos de entrenamiento, 7.988 de validacion y 10.179 de test. Para el ajuste final se uso una muestra fija de 7.899 ejemplos (hasta 1.500 por categoria), mientras que la validacion completa se empleo para seleccionar el checkpoint. La longitud maxima de 192 subtokens se eligio a partir del perfil de longitudes del conjunto de entrenamiento; el 87,5% de los textos muestreados superaba esa longitud y fue truncado.

## Capacidades

- Clasificacion de texto multietiqueta en seis categorias fijas (business, entertainment, national_news, politics, sports, world_news).
- Procesamiento de pares titular + cuerpo de articulo como entrada unica.
- Salida de probabilidades softmax por clase (top-k configurable en la API de inferencia).
- Soporte de texto en escritura etiope con normalizacion NFC y limpieza de controles.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No soporta vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al amharico; el autor advierte que textos con code-switching o con mezcla de ingles pueden colarse por el heuristico del 10% de letras etiopes.

## Casos de uso

- Triaje editorial exploratorio: el modelo puede preclasificar articulos entrantes de un agregador de noticias en amharico para que un editor humano revise primero las categorias de mayor volumen, aunque la baja precision en national_news obliga a supervision.
- Etiquetado asistido de corpus de investigacion: util para generar etiquetas preliminares en estudios de linguistica computacional en amharico, siempre que se documente el macro-F1 de 0,581 y se validen manualmente las muestras.
- Filtrado tematico en pipelines de monitorizacion de medios: permite separar deportes o entretenimiento del resto de categorias con un coste computacional bajo (117M de parametros, 0,5 GB), aunque no es fiable para decisiones de alto impacto.
- Baseline de comparacion en experimentos de NLP: sirve como referencia transformer frente a lineas base clasicas (TF-IDF + LinearSVC) en trabajos academicos sobre clasificacion de noticias en lenguas de bajos recursos.
- Ensenanza de fine-tuning: el repositorio incluye codigo de inferencia (`src/amharic_news/inference.py`, `labels.py`, `text.py`) y artefactos de evaluacion (`evaluation_metrics.json`, `data_audit.json`, `error_analysis.md`) que lo convierten en un ejemplo didactico de evaluacion honesta.
- Prototipado de clasificadores de noticias en amharico: adecuado para validar rapidamente la viabilidad de un producto antes de invertir en un modelo mayor o en un enfoque basado en reglas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de 10.179 ejemplos (seleccion por validacion, evaluacion unica en test):

| Metodo | Macro-F1 validacion | Macro-F1 test |
|---|---:|---:|
| majority | 0,024 | 0,024 |
| word_tfidf_linear_svc | 0,768 | 0,774 |
| char_tfidf_linear_svc | 0,773 | 0,781 |
| word_char_tfidf_linear_svc | 0,786 | 0,784 |
| AfroXLMR-mini (este modelo) | 0,566 | 0,581 |

Metricas adicionales del transformer en test: accuracy 0,555; macro-F1 0,581 (intervalo bootstrap del 95% por remuestreo de filas: 0,569–0,593); weighted-F1 0,496; balanced accuracy 0,732. Recall de national_news: 10,4% (tasa de error del 89,6%).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (117,6M de parametros, ~0,47 GB de pesos) y aproximadamente 0,25 GB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria.
- Opciones de despliegue: PyTorch + Transformers (via el codigo de inferencia incluido en el repositorio); no se ha publicado un Space de demostracion (el autor indica que la creacion gratuita en ZeroGPU fue rechazada con HTTP 402). No se distribuyen pesos convertidos para navegador mientras no se resuelvan los derechos sobre los articulos fuente.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 test (misma tarea) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| klohdfhk/amharic-news-classifier | 117,6M | 192 subtokens | 0,581 | CC BY 4.0 | Hugging Face (sin Space) |
| word_char_tfidf_linear_svc (linea base clasica) | no aplica | no aplica | 0,784 | no aplica | codigo en el repositorio |
| Davlan/afro-xlmr-mini (modelo base) | 117,6M | no disponible | no disponible (sin fine-tuning) | MIT | Hugging Face |

La comparativa directa con otros transformers especializados en clasificacion de noticias en amharico no esta disponible en la informacion proporcionada. El dato mas relevante es que la linea base clasica supera al transformer en 20 puntos de macro-F1 sobre el mismo conjunto de test.

## Limitaciones y advertencias

- El modelo es un artefacto experimental de benchmark; el propio autor lo desaconseja como clasificador preferente frente a TF-IDF + LinearSVC.
- Recall muy bajo en national_news (10,4%), lo que lo hace inadecuado para tareas donde esa categoria sea critica.
- El 87,5% de los textos de entrenamiento superaba los 192 subtokens y fue truncado, lo que puede degradar el rendimiento en articulos largos.
- La puntuacion softmax maxima no esta calibrada como confianza; no debe interpretarse como probabilidad fiable.
- El heuristico del 10% de letras etiopes no es un identificador de idioma; pueden permanecer textos con code-switching o en ingles.
- Posible fuga de fuente o de tiempo: la particion aleatoria no garantiza ausencia de solapamiento entre fuentes o periodos.
- La clase entertainment es mucho menor que national_news; conviene interpretar macro-F1 junto con las metricas por clase.
- Los derechos de copyright de los articulos fuente no estan aclarados mas alla de la declaracion CC BY 4.0 de la model card del dataset; el corpus original no se redistribuye.
- Uso previsto limitado a investigacion, educacion y triaje exploratorio; no debe emplearse en decisiones de alto impacto, segmentacion politica ni decisiones sobre personas.
- El modelo base conserva sus terminos MIT; el modelo publicado declara CC BY 4.0 con atribucion a los autores del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klohdfhk/amharic-news-classifier
- Codigo fuente: https://github.com/bereket74/amharic-news-classifier
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-mini
- Dataset: https://huggingface.co/datasets/israel/Amharic-News-Text-classification-Dataset
- Paper de referencia del dataset (Azime & Mohammed, 2021): https://arxiv.org/abs/2103.05639
