# mradermacher/RsEvi-8B-GGUF

## Resumen

RsEvi-8B es un modelo de visión-lenguaje especializado en teledetección (remote sensing), es decir, en el análisis de imágenes de satélite y aéreas mediante instrucciones en lenguaje natural. El modelo original lo desarrolla el usuario sesko818, y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo está orientado a tareas de visual question answering (VQA) y visual grounding sobre imágenes de observación de la Tierra.

Con 8.190.735.360 parámetros totales (aproximadamente 8,2 mil millones), RsEvi-8B se sitúa en la categoría de modelos de visión-lenguaje de tamano medio, lo que lo hace viable en GPUs de consumo cuando se cuantiza a 4 o 5 bits. La versión GGUF incluye ficheros mmproj separados para el codificador visual, lo que permite combinar el modelo de lenguaje cuantizado con el proyector multimodal en despliegues locales.

La relevancia actual del modelo radica en su especialización: frente a modelos generalistas de visión-lenguaje, RsEvi-8B está entrenado específicamente para interpretar escenas de teledetección, responder preguntas sobre contenido de imágenes satelitales y localizar objetos o regiones concretas (grounding). La referencia a EMNLP 2026 en sus etiquetas sugiere que acompana a una publicación académica, aunque no se dispone de detalles del paper en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal con proyector visual); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repo | 75,3 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

RsEvi-8B es un modelo de visión-lenguaje construido sobre un transformer multimodal: combina un codificador de imágenes con un modelo de lenguaje y un proyector que alinea ambos espacios. En el despliegue GGUF, el codificador visual y el proyector se distribuyen en ficheros mmproj separados (f16 de 1,3 GB y Q8_0 de 0,9 GB), mientras que el modelo de lenguaje se cuantiza por separado. No se dispone de información detallada sobre el número de capas, dimensiones ocultas ni el codificador visual concreto empleado.

En cuanto al entrenamiento, la model card únicamente indica la especialización en teledetección, VQA y visual grounding, y la asociación con EMNLP 2026. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes de satélite y aéreas: el modelo responde en lenguaje natural a preguntas sobre el contenido de escenas de teledetección.
- Visual grounding: localización de objetos, regiones o elementos concretos dentro de una imagen a partir de una descripción textual.
- Comprensión de escenas de observación de la Tierra: interpretación de cubierta terrestre, infraestructuras, vegetación, cuerpos de agua y otros elementos propios de imágenes remotas.
- Generación de texto conversacional en inglés vinculada al contenido visual.
- Despliegue multimodal local mediante llama.cpp y herramientas compatibles con GGUF y ficheros mmproj.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Análisis automatizado de imágenes satelitales: un pipeline ingiere imágenes de satélite y formula preguntas en inglés sobre su contenido (por ejemplo, "¿qué tipo de cubierta terrestre domina esta escena?"), obteniendo respuestas en lenguaje natural útiles para inventarios preliminares.
- Etiquetado asistido de datasets de teledetección: el modelo puede responder preguntas sobre regiones de interés para pre-anotar imágenes antes de la revisión humana, reduciendo el coste de construcción de datasets de VQA geospatial.
- Localización de infraestructuras críticas: mediante visual grounding, se puede pedir al modelo que localice elementos como carreteras, puentes o edificaciones en imágenes aéreas, apoyando tareas de monitorización.
- Monitorización medioambiental: consultas sobre presencia de vegetación, masas de agua o cambios en la cubierta terrestre en imágenes de observación de la Tierra, como apoyo a estudios de seguimiento.
- Asistencia a analistas GIS: integración en herramientas de escritorio o notebooks donde el analista consulta imágenes mediante lenguaje natural, agilizando la exploración de escenas complejas.
- Prototipado e investigación en visión-lenguaje geoespacial: al estar cuantizado en GGUF, permite experimentar en estaciones de trabajo con GPU de consumo sin necesidad de infraestructura de centro de datos.
- Educación y divulgación: demostraciones interactivas de interpretación de imágenes satelitales en entornos con hardware limitado, gracias a las cuantizaciones Q4 y Q5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de lenguaje + mmproj):
  - Q2_K: ~3,4 GB + mmproj Q8_0 ~0,9 GB (aproximadamente 4,5 GB en total).
  - Q4_K_M: ~5,1 GB + mmproj ~0,9-1,3 GB (aproximadamente 6-6,5 GB en total).
  - Q5_K_M: ~6,0 GB + mmproj (aproximadamente 7-7,5 GB en total).
  - Q8_0: ~8,8 GB + mmproj (aproximadamente 10 GB en total).
  - f16: ~16,5 GB + mmproj (aproximadamente 18 GB en total).
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4090 (24 GB) para Q8_0 o f16; A100/H100 para despliegues de mayor throughput o f16 con margen.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M y Q5_K_M en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB; f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama (si soporta el modelo con mmproj), y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers con soporte multimodal.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo, RsEvi-8B se posiciona en la categoría de modelos de visión-lenguaje de ~8B parámetros especializados en teledetección, un nicho con pocos modelos públicos de este tamano. La comparación con alternativas generalistas de visión-lenguaje requeriría benchmarks que no se han publicado en la información disponible.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| RsEvi-8B (esta ficha) | 8,19B | no disponible | Teledeteccion, VQA, grounding | no disponible | GGUF, safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y documentado únicamente en inglés; las consultas en castellano pueden degradar la calidad de las respuestas.
- Dominio restringido: su especialización en teledetección implica que su rendimiento en imágenes generales (fotos cotidianas, documentos, capturas de pantalla) puede ser inferior al de modelos de visión-lenguaje generalistas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (sesko818/RsEvi-8B) antes de desplegarlo en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar descripciones plausibles pero incorrectas sobre el contenido de la imagen, especialmente en escenas ambiguas o de baja resolución; se recomienda validación humana en aplicaciones críticas.
- Contexto: no se dispone de información sobre la longitud de contexto soportada, lo que impide garantizar el manejo de conversaciones multi-turno largas o múltiples imágenes en una misma sesión.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Ficheros mmproj separados: un despliegue incorrecto que omita el mmproj impedirá el procesamiento de imágenes; es necesario cargar ambos componentes.
- Sesgos: no se documentan sesgos específicos, pero los datasets de teledetección pueden estar geográficamente desbalanceados, lo que podría afectar a la calidad en regiones poco representadas.
- Fecha de referencia: el modelo está asociado a EMNLP 2026 y actualizado en octubre de 2026; conviene verificar si existen revisiones posteriores o el paper asociado con resultados detallados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RsEvi-8B-GGUF
- Modelo base: https://huggingface.co/sesko818/RsEvi-8B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/RsEvi-8B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#RsEvi-8B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
