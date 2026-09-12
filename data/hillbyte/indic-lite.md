# hillbyte/indic-lite

## Resumen

Indic-Lite es un conjunto de herramientas de procesamiento de lenguaje natural para lenguas indicas, publicado por el usuario hillbyte en HuggingFace. No es un modelo de lenguaje generativo ni un transformer: se distribuye como tres clasificadores de texto entrenados con scikit-learn y serializados en formato joblib, con exportaciones equivalentes a ONNX para su ejecucion en C++, Go, Rust y plataformas moviles. El paquete cubre tres tareas: identificacion de idioma en 28 lenguas (Indic-LID), analisis de sentimiento en 12 lenguas (Indic-Sentiment) y clasificacion de noticias en 6 categorias y 6 lenguas (Indic-Topic), ademas de un modulo de limpieza de texto basado en reglas (Indic-Clean).

El proposito declarado es ofrecer inferencia de muy baja latencia y huella minima en entornos edge, moviles y de servidor con CPU. Los tamanos son reducidos: 4,27 MB en ONNX para el identificador de idioma, 0,19 MB para el clasificador de sentimiento y 1,03 MB para el de temas. La model card reporta latencias de 0,155 ms, 0,164 ms y 0,135 ms por item respectivamente, sin especificar el hardware de medida. Esto lo situa en una categoria distinta a la de los LLM: aqui no hay generacion de texto, razonamiento ni tool calling, sino clasificacion supervisada de fragmentos cortos.

La relevancia actual del proyecto reside en la cobertura de lenguas de bajos recursos del noreste de India (mizo, khasi, santali, bodo, manipuri) y de variedades dialectales (awadhi, bhojpuri, chhattisgarhi, garhwali, haryanvi, marwari), un espectro que los modelos multilingues generalistas suelen cubrir de forma deficiente. El repositorio no tiene descargas ni likes en el momento de la consulta, no se ha publicado articulo ni evaluacion independiente, y no se documenta el algoritmo concreto empleado en cada clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se distribuye como pipeline de scikit-learn serializado (joblib) con exportacion ONNX; el algoritmo concreto (regresion logistica, SVM lineal, naive Bayes, etc.) no se documenta |
| Parametros totales | No disponible. No es un modelo neuronal de parametros densos; los artefactos pesan 10,83 MB (Indic-LID, joblib), 1,64 MB (Indic-Sentiment, joblib) y 3,41 MB (Indic-Topic, joblib) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos |
| Longitud de contexto | No disponible. La model card no especifica un limite de tokens; los ejemplos de uso son frases y titulares cortos |
| Tipos de cuantizacion | No disponible. Solo se distribuyen los artefactos en joblib y ONNX; no se documentan variantes INT8, FP16 ni cuantizacion dinamica |
| Idiomas soportados | 28 en Indic-LID: as, bn, brx, gom, gu, hi, kn, kha, lus, mai, ml, mni, mr, ne, or, pa, sa, sat, ta, te, ur, awa, bho, hne, gbm, bgc, mwr, en. 12 en Indic-Sentiment: as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, ur. 6 en Indic-Topic: gu, hi, ml, mr, ta, te |
| Licencia | CC-BY-4.0 |
| Formato de pesos | joblib (scikit-learn) y ONNX. Ficheros ONNX: onnx/indic_lid.onnx (4,27 MB), onnx/indic_sentiment.onnx (0,19 MB), onnx/indic_topic.onnx (1,03 MB) |
| Tareas soportadas | Text-classification (identificacion de idioma, sentimiento, tema) y utilidades de normalizacion de texto |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 en la fecha de consulta |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de ninguno de los tres clasificadores. Los indicios tecnicos (dependencias `joblib`, `scikit-learn` y `onnxruntime`, la API `joblib.load(...)['model']` seguida de `.predict()`, y el reducido tamano de los artefactos) son compatibles con un pipeline clasico de extraccion de caracteristicas dispersas (por ejemplo, n-gramas de caracteres o palabras) seguido de un clasificador lineal, pero se trata de una inferencia y no de un dato confirmado por el autor. No se indica numero de parametros, vocabulario, dimension del espacio de caracteristicas ni funcion de perdida.

Tampoco se documentan hiperparametros de entrenamiento, numero de epocas, estrategia de validacion ni si hubo ajuste fino o destilacion desde un modelo mayor. No hay rastro de RLHF, DPO ni tecnicas de alineacion, algo coherente con la naturaleza discriminativa del paquete. La model card si detalla la procedencia de los datos: Indic-LID se entrena a partir de `google/IndicGenBench_flores_in`, `andrewbawitlung/twirling_mizo_news` y `damerajee/khasi-datasets`; Indic-Sentiment a partir de `mteb/IndicSentiment` y resenas de IIT Patna incluidas en `ai4bharat/indic_glue`; e Indic-Topic a partir de noticias regionales de India Today (prefijos `inltkh.*`) y de BBC Hindi (`bbca.hi`). La unica innovacion tecnica declarada es la exportacion a ONNX de todos los modelos para ejecucion multiplataforma, junto con el modulo Indic-Clean, que aplica normalizacion Unicode NFC, traduccion de numerales indicos a arabigos (por ejemplo, १२३ a 123) y borrado de informacion personal identificable mediante reglas.

## Capacidades

- Identificacion de idioma en 28 lenguas, incluyendo las 22 lenguas del Eighth Schedule, seis lenguas del noreste de India, seis variedades dialectales o literarias y el ingles.
- Analisis de sentimiento en 12 lenguas indicas. El ejemplo de la model card emplea una salida binaria (valor 1 interpretado como positivo y cualquier otro valor como negativo); el conjunto exacto de etiquetas no se documenta.
- Clasificacion de noticias y titulares en 6 categorias (entertainment, business, tech, sports, state, spirituality) para 6 lenguas.
- Normalizacion de texto Unicode NFC, conversion de numerales indicos a arabigos y limpieza de informacion personal identificable mediante reglas.
- Ejecucion en CPU sin GPU, a traves de scikit-learn o de ONNX Runtime, con enlaces disponibles para Python, C++, Go, Rust y plataformas moviles.
- Reconocimiento de escrituras diversas: bengali-assamesa, devanagari, latina, meetei mayek y ol chiki aparecen entre las lenguas cubiertas.
- No dispone de generacion de texto, razonamiento, matematicas, codigo, vision, audio, tool calling, function calling ni capacidades de agente. El modelo no puede mantener conversaciones ni ejecutar pasos intermedios.

## Casos de uso

- Enrutado de idioma en plataformas de atencion al cliente: antes de invocar un modelo generativo o un sistema de traduccion, Indic-LID clasifica el mensaje entrante en una de las 28 lenguas con 0,155 ms por item, lo que permite dirigir la peticion al motor o al agente adecuado sin anadir latencia perceptible al flujo.
- Moderacion y monitorizacion de opinion en redes sociales: Indic-Sentiment clasifica la polaridad de comentarios en 12 lenguas indicas, lo que permite construir paneles de reputacion de marca o alertas tempranas de crisis a partir de flujos de publicaciones en hindi, tamil, bengali o urdu.
- Agregacion y etiquetado de noticias regionales: Indic-Topic asigna titulares a seis categorias para gu, hi, ml, mr, ta y te, una funcion util para agregadores de noticias, sistemas de recomendacion editorial o cuadros de mando de medios locales.
- Preprocesado en dispositivos moviles y entornos edge: los artefactos ONNX de 4,27 MB, 0,19 MB y 1,03 MB caben en el binario de una aplicacion Android o iOS mediante ONNX Runtime Mobile, de modo que la clasificacion se ejecuta en el dispositivo sin enviar el texto a un servidor, lo que reduce coste y mejora la privacidad.
- Anonimizacion previa al almacenamiento: Indic-Clean permite normalizar el texto en NFC, convertir numerales indicos a arabigos y eliminar datos personales identificables antes de escribir en una base de datos o de enviar el contenido a un servicio externo.
- Etiquetado a gran escala de corpus para entrenamiento: la latencia declarada (unos 0,155 ms por item, de la que se derivarian teoricamente en torno a 6.400 items por segundo por nucleo si se mantiene de forma sostenida) hace viable procesar corpus de millones de lineas en CPU para anotar idioma, tema y sentimiento antes de usarlos en el entrenamiento de modelos mayores.
- Investigacion en linguistica de lenguas de bajos recursos: la cobertura de mizo, khasi, santali, bodo y manipuri, entre otras, permite segmentar corpus por lengua y construir subconjuntos especificos para estudios o para el desarrollo de recursos linguisticos.
- Seleccion de motor de traduccion automatica: en una arquitectura de traduccion multilingue, el identificador de idioma actua como primera etapa para elegir el par origen-destino correcto y evitar que un texto en marwari o bhojpuri se procese como hindi estandar.

## Benchmarks y rendimiento

Los unicos resultados disponibles proceden de la model card del autor, medidos sobre divisiones de test reservadas. No hay evaluacion independiente ni comparacion con terceros.

| Modelo | Tarea / cobertura | Tamano del test | Exactitud | F1 macro | Tamano joblib | Tamano ONNX | Latencia por item |
|---|---|---|---|---|---|---|---|
| Indic-LID | Identificacion de idioma (28 lenguas) | 27.312 | 99,53 % | 99,54 % | 10,83 MB | 4,27 MB | 0,155 ms |
| Indic-Sentiment | Sentimiento (12 lenguas) | 10.129 | 75,84 % | 75,84 % | 1,64 MB | 0,19 MB | 0,164 ms |
| Indic-Topic | Tema (6 categorias) | 3.244 | 90,23 % | 89,35 % | 3,41 MB | 1,03 MB | 0,135 ms |

Advertencias sobre estas cifras: el hardware y el numero de hilos empleados en la medicion de latencia no se especifican; la distribucion por lengua dentro de cada conjunto de test no se detalla, de modo que la exactitud agregada de Indic-Sentiment (75,84 %) puede ocultar diferencias grandes entre lenguas; y no se aportan intervalos de confianza ni desgloses por clase. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba generativa, porque el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia se ejecuta integramente en CPU.
- Memoria y disco: el conjunto completo de artefactos joblib suma unos 15,9 MB y el conjunto ONNX unos 5,5 MB. El modelo residente en memoria (Indic-LID en joblib) ronda los 11 MB.
- GPU recomendadas: no aplica. No se documenta soporte CUDA ni aceleracion por GPU.
- Cabe en cualquier GPU de consumo y, de hecho, en cualquier dispositivo sin GPU, incluidos telefonos, Raspberry Pi y navegadores con ONNX Runtime Web.
- Opciones de despliegue: scikit-learn y joblib en Python; ONNX Runtime en Python, C++, Go, Rust, Java y movil; es posible cargar los ficheros ONNX desde otros runtimes compatibles, aunque la model card solo menciona onnxruntime.
- Latencia: 0,155 ms por item para Indic-LID, 0,164 ms para Indic-Sentiment y 0,135 ms para Indic-Topic, segun el autor y sin especificar hardware. Como cifra derivada, 0,155 ms por item equivaldria a unos 6.400 items por segundo en un solo nucleo si el rendimiento se mantuviera constante, algo que habria que verificar en produccion con textos de longitud real y batching.
- Dependencias instaladas: `pip install joblib onnxruntime scikit-learn`.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que las cifras comparativas se marcan como no disponibles. La comparacion se limita a caracteristicas estructurales verificables.

| Criterio | Indic-Lite (LID + Sentiment + Topic) | Identificadores basados en transformers (por ejemplo, fine-tunes de IndicBERT, MuRIL o XLM-R) | Modelos clasicos de n-gramas y clasificador lineal (por ejemplo, fastText) |
|---|---|---|---|
| Tipo de modelo | Pipeline scikit-learn exportado a joblib y ONNX | Red neuronal transformer | Bolsa de n-gramas con clasificador lineal |
| Parametros | No disponible | Cientos de millones en los modelos base; no disponible para los fine-tunes concretos | No disponible |
| Longitud de contexto | No documentada | Limitada por la ventana del transformer base; no disponible para los fine-tunes concretos | No documentada |
| Huella en disco | 5,5 MB en ONNX para las tres tareas | Tipicamente cientos de MB; no disponible en cifras concretas | No disponible |
| Latencia | 0,135-0,164 ms por item segun el autor | Superior a la de un clasificador lineal; no disponible en cifras concretas | No disponible |
| Cobertura de lenguas | 28 para LID, 12 para sentimiento, 6 para tema | Variable; los transformers multilingues cubren muchas lenguas pero con calidad desigual en lenguas de bajos recursos | Alta en LID, menor en tareas especificas |
| Licencia | CC-BY-4.0 | Depende del modelo base y del fine-tune | Depende del proyecto |
| Disponibilidad | Repositorio en HuggingFace con 0 descargas y 0 likes; sin articulo ni evaluacion externa | Amplia disponibilidad y validacion en la comunidad | Amplia disponibilidad |

No se dispone de resultados comparativos de benchmarks entre Indic-Lite y cualquiera de estas alternativas.

## Limitaciones y advertencias

- La model card es la unica fuente de informacion. No existe articulo, informe tecnico ni evaluacion por terceros, y el repositorio registra 0 descargas y 0 likes en la fecha de consulta.
- No se documenta el algoritmo interno de ningun clasificador, lo que dificulta estimar su comportamiento fuera de la distribucion de entrenamiento.
- La exactitud de Indic-Sentiment es de 75,84 %, notablemente inferior a la de los otros dos componentes. En una tarea binaria, ese nivel implica una tasa de error cercana a una de cada cuatro predicciones, insuficiente por si sola para decisiones automatizadas sin revision humana.
- La clasificacion de temas solo cubre 6 lenguas (gu, hi, ml, mr, ta, te) y 6 categorias, un espacio de etiquetas cerrado que no admite temas fuera de esa lista.
- La cobertura linguistica es amplia pero incompleta: no figuran lenguas indias como cachemir, dogri, sindhi, tulu, konkani en la tarea de sentimiento ni varias lenguas del noreste en sentimiento y tema.
- Existe ambiguedad de escritura en varias lenguas cubiertas (manipuri en meetei mayek y en bengali, bodo en devanagari, khasi y mizo en alfabeto latino), lo que puede provocar confusiones entre clases con solapamiento de caracteres.
- No se documenta el comportamiento con texto mezclado de lenguas (code-mixing), muy frecuente en redes sociales indias, ni con transliteracion informal en alfabeto latino.
- La exactitud de 99,53 % en identificacion de idioma procede de una division de test cuya composicion por lengua no se publica; el rendimiento en lenguas con pocos hablantes o en variedades dialectales cercanas puede ser muy inferior.
- No hay generacion de texto, por lo que el riesgo de alucinacion en el sentido habitual no aplica. El riesgo equivalente es la clasificacion erronea silenciosa: el modelo devuelve siempre una etiqueta, sin puntuacion de confianza documentada ni mecanismo de absteccion.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion al autor y la indicacion de los cambios realizados, y no ofrece garantia alguna ni clausula de responsabilidad.
- No se han publicado resultados de benchmarks comparativos con modelos de la competencia en la informacion disponible.
- Los metadatos indican una fecha de creacion y actualizacion de 2026-09-12 y un tamano de repositorio de 0,0 GB; conviene verificar el contenido real del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hillbyte/indic-lite
- Conjunto de datos IndicGenBench FLORES-IN (usado para Indic-LID): https://huggingface.co/datasets/google/IndicGenBench_flores_in
- Conjunto de datos de noticias en mizo (usado para Indic-LID): https://huggingface.co/datasets/andrewbawitlung/twirling_mizo_news
- Conjunto de datos en khasi (usado para Indic-LID): https://huggingface.co/datasets/damerajee/khasi-datasets
- Conjunto de datos IndicSentiment de MTEB (usado para Indic-Sentiment): https://huggingface.co/datasets/mteb/IndicSentiment
- Conjunto de datos IndicGLUE de AI4Bharat (usado para Indic-Sentiment): https://huggingface.co/datasets/ai4bharat/indic_glue
- La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo: los resultados obtenidos correspondian a una emisora de radio italiana sin relacion con el proyecto. No se han localizado articulos, repositorios, demos ni hilos de discusion adicionales.
