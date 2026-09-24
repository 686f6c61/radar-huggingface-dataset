# moganai/fasttext-tr-quality-classifier

## Resumen

fastText-TR-Quality-Classifier es un clasificador binario de calidad de texto desarrollado por el usuario moganai, orientado a filtrar paginas web en turco para la construccion de corpus de preentrenamiento de modelos de lenguaje. Asigna cada documento una de dos etiquetas: `__label__clean` (contenido aprovechable para preentrenamiento) o `__label__garbage` (spam, publicidad o contenido de baja calidad). Es un modelo de clasificacion supervisada basado en la libreria fastText, con vectores de dimension 100, un vocabulario de aproximadamente 3,5 millones de palabras y n-gramas, y entrenamiento sobre bigramas de palabras.

El modelo resuelve un cuello de botella habitual en la curazione de datos: aplicar un filtro de calidad preciso a cientos de millones de documentos web es prohibitivo si se usa un transformer. La estrategia seguida es de destilacion de conocimiento: un clasificador BERT en turco, ajustado previamente sobre 5.876 ejemplos puntuados manualmente o por LLM con una escala de calidad de 0 a 5, se uso para etiquetar automaticamente unos 480.000 documentos de CommonCrawl, y esas etiquetas binarias sirvieron para entrenar este modelo fastText.

Su relevancia practica esta en la relacion precision/velocidad: segun la model card, coincide con las predicciones del BERT origen en el 94,4 % de los casos sobre un fragmento de validacion no visto, pero infiere aproximadamente 90 veces mas rapido (unos 8.880 documentos por segundo frente a 96,5 en la misma CPU Apple M4 Pro). Esto lo convierte en una pieza util para pipelines de filtrado a gran escala antes de un filtrado mas fino con modelos mas costosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador supervisado fastText (bolsa de palabras + n-gramas con capa softmax) |
| Parametros totales | no disponible (no se reporta un recuento de parametros; vocabulario de ~3,5 M de palabras/n-gramas y vectores de dimension 100) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de texto, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (fastText no emplea cuantizacion de pesos tipo GGUF/AWQ; se distribuye en formato binario propio) |
| Idiomas soportados | Turco (tr); etiquetado tambien como en en los metadatos de HuggingFace, aunque el entrenamiento y el uso descrito son en turco |
| Licencia | MIT |
| Formato de pesos | `model.bin` (clasificador completo) y `model.vec` (vectores en texto plano, sin capa de clasificacion) |

## Arquitectura y entrenamiento

El modelo es un clasificador supervisado de fastText, la implementacion de Facebook AI Research que representa cada documento como una bolsa de palabras y n-gramas y aprende embeddings de baja dimension junto con una capa de clasificacion. En este caso se emplean vectores de dimension 100, `wordNgrams=2` (se anaden bigramas a los unigramas como rasgos), perdida softmax para dos clases y entrenamiento durante 25 epocas con una tasa de aprendizaje de 1,0. Es una arquitectura lineal muy ligera comparada con los transformers, sin mecanismos de atencion ni contexto secuencial.

Los datos de entrenamiento proceden de texto web en turco extraido de los rastreos mensuales de CommonCrawl de 2025 y 2026 mediante trafilatura sobre HTML crudo, con un total de aproximadamente 480.000 ejemplos etiquetados. La innovacion metodologica clave es la destilacion: un clasificador BERT en turco previamente ajustado sobre 5.876 ejemplos puntuados manualmente o por LLM (escala 0-5) genero las etiquetas de esos 480.000 documentos, que posteriormente se binarizaron en `clean`/`garbage`. De este modo el fastText aprende a imitar a un modelo mucho mas lento. No se menciona el uso de RLHF ni DPO, algo que no aplica a este tipo de clasificador.

## Capacidades

- Clasificacion binaria de texto en turco: asigna `__label__clean` o `__label__garbage` a cada documento, con una puntuacion de confianza asociada.
- Filtrado de corpus a escala: pensado para procesar grandes volumenes de texto web antes del preentrenamiento de LLM.
- Inferencia de alta velocidad: unos 8.880 documentos por segundo en CPU Apple M4 Pro, segun la model card.
- Reutilizacion de embeddings: el fichero `model.vec` permite emplear los vectores aprendidos como `pretrainedVectors` en otros entrenamientos fastText.
- Deteccion de spam y contenido de baja calidad en dominios web generales (publicidad, contenido de apuestas, escort, etc.).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es exclusivamente un clasificador de texto.
- Capacidad multilingue limitada al turco como idioma de entrenamiento.

## Casos de uso

- Construccion de corpus de preentrenamiento en turco: filtrar cientos de millones de documentos de CommonCrawl u otras fuentes web antes de entrenar un LLM, descartando spam y contenido de baja calidad de forma masiva y a bajo coste.
- Prefiltrado previo a un clasificador mas costoso: usar el fastText como primera etapa para reducir el volumen y reservar un modelo BERT o un LLM juez para un subconjunto mucho menor.
- Limpieza de datasets ya existentes: reprocesar un corpus turco almacenado para eliminar ruido antes de tareas de ajuste fino.
- Extraccion de embeddings para NLP en turco: emplear `model.vec` como inicializacion de vectores en otros modelos fastText para tareas de clasificacion o similitud.
- Monitorizacion de calidad en ingesta de datos: integrar el clasificador en un pipeline de scraping para marcar automaticamente paginas sospechosas antes de almacenarlas.
- Investigacion sobre destilacion de clasificadores: caso de estudio de como un BERT puede destilarse en un fastText manteniendo un 94,4 % de acuerdo, con un incremento de velocidad de unas 90 veces.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), sino metricas propias de la model card:

| Metrica | Resultado | Contexto |
|---|---|---|
| Acuerdo con el BERT origen | 94,4 % | Sobre un fragmento de validacion de CommonCrawl no visto por el BERT |
| Precision en test sintetico | 8/8 correctos | 8 ejemplos escritos a mano (spam de apuestas, escort, resumen academico, noticia, descripcion de producto, etc.), la mayoria con confianza >= 96,9 % |
| Velocidad de inferencia | ~8.880 docs/seg | CPU Apple M4 Pro |
| Velocidad del BERT de referencia | ~96,5 docs/seg | Misma CPU Apple M4 Pro |
| Aceleracion respecto al BERT | ~90x | Misma hardware |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un fastText y no requiere GPU; la model card reporta pruebas en CPU Apple M4 Pro.
- Memoria RAM estimada: el repositorio ocupa 6,0 GB e incluye `model.bin` y `model.vec`; cargar el clasificador completo requiere del orden de 1,5-3 GB de RAM (estimacion a partir del tamano del vocabulario y la dimension de los vectores; cifra no confirmada en la documentacion).
- GPU recomendadas: no aplica; no se necesita GPU para inferencia.
- Compatibilidad con GPU de consumo: irrelevante, ya que el modelo esta disenado para ejecutarse en CPU.
- Opciones de despliegue: libreria `fasttext` (Python y binario de linea de comandos) para carga de `model.bin`; no se contempla despliegue via vLLM, llama.cpp, Ollama o TGI, que estan orientados a transformers.
- Latencia y throughput: ~8.880 documentos por segundo en CPU Apple M4 Pro (dato reportado por el autor); no se han publicado mediciones en otras plataformas.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables (como los clasificadores de calidad de CCNet o FineWeb-Edu, o el modelo de identificacion de idioma de fastText), por lo que los valores de esas alternativas no se pueden contrastar aqui. La siguiente tabla recoge unicamente lo que se conoce de este modelo y marca como no disponible lo que no se aporta.

| Modelo | Tipo | Idioma | Parametros | Licencia | Datos disponibles |
|---|---|---|---|---|---|
| fastText-TR-Quality-Classifier | Clasificador fastText | Turco | no disponible (vocabulario ~3,5 M, dim 100) | MIT | Acuerdo 94,4 % con BERT; ~8.880 docs/seg |
| Clasificador de calidad de CCNet | Clasificador fastText | Multilingue | no disponible | no disponible | no disponible |
| Clasificador de calidad de FineWeb-Edu | Clasificador basado en transformer/embeddings | Ingles | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre contenido web general de CommonCrawl; no se ha probado en dominios muy distintos como redes sociales, codigo o PDF academicos.
- La etiqueta `clean` significa "aprovechable para preentrenamiento", no "factualmente correcto" ni "no toxico"; se recomienda combinar con filtros adicionales de mascara de PII y listas de toxicidad o spam.
- Las etiquetas de entrenamiento derivan de las predicciones de un BERT, por lo que el modelo puede heredar sus errores y sesgos.
- Cobertura linguistica limitada al turco; no apto para otros idiomas pese a la etiqueta `en` en los metadatos.
- Uso comercial permitido bajo licencia MIT, pero los datos de entrenamiento proceden de CommonCrawl y quedan sujetos a sus propios terminos de uso.
- Los datos de rendimiento (94,4 % de acuerdo, 8/8 en test sintetico) proceden del autor y no de una evaluacion independiente; el test sintetico de 8 ejemplos es demasiado reducido para extraer conclusiones robustas.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moganai/fasttext-tr-quality-classifier
- Repositorio de fastText (Facebook AI Research): https://github.com/facebookresearch/fastText
- Herramienta de extraccion trafilatura: https://github.com/adbar/trafilatura
- CommonCrawl (fuente del corpus): https://commoncrawl.org
- Buy Me a Coffee del autor: https://buymeacoffee.com/moganai
