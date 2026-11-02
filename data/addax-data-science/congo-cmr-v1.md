# Addax-Data-Science/CONGO-CMR-v1

## Resumen

CONGO-CMR-v1 es un repositorio de modelos publicado en HuggingFace por Addax Data Science bajo el identificador `Addax-Data-Science/CONGO-CMR-v1`. No se trata de un modelo de lenguaje generativo, sino de un paquete de modelos de visión por computador redistribuidos para su integración con AddaxAI, la plataforma de la propia organización orientada al procesamiento y análisis automatizado de imágenes de fauna (cámaras trampa y flujos de trabajo de ecología). El repositorio actúa, por tanto, como artefacto de distribución: agrupa pesos y ficheros de licencia de terceros para simplificar su uso dentro del ecosistema AddaxAI.

La información pública disponible es extremadamente limitada. El repositorio se creó y actualizó el 2 de noviembre de 2026, ocupa 0,2 GB y declara la librería Keras como formato de carga, lo que sugiere pesos en formato Keras (`.keras` o HDF5) más que safetensors o GGUF. La model card no incluye ficha técnica: solo contiene un objeto JSON vacío (`{}`) y un aviso legal que remite a la documentación del model zoo de AddaxAI para obtener propietario, licencia, citación y enlaces de cada modelo redistribuido.

Por su naturaleza, este repositorio no debe evaluarse como un modelo fundacional con arquitectura, contexto o benchmarks propios. Su relevancia es operativa: facilita el despliegue de clasificadores de imagen (presumiblemente relacionados con la identificación de especies en la cuenca del Congo, a juzgar por el identificador "CONGO-CMR") dentro de pipelines de AddaxAI, sin que el usuario tenga que localizar y ensamblar manualmente los artefactos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de modelos de visión redistribuidos; la model card no especifica arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible en la model card; se remite a los ficheros de licencia incluidos y al model zoo de AddaxAI |
| Formato de pesos | Keras (librería declarada: `keras`); tamaño del repo: 0,2 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de los modelos contenidos en el repositorio. La librería declarada es Keras, lo que implica que los artefactos se cargan mediante la API de Keras/TensorFlow (o Keras 3 con backend compatible), pero la model card no detalla si se trata de CNN, Vision Transformer o modelos híbridos, ni especifica el número de parámetros, la resolución de entrada o el número de clases de salida.

Tampoco se documentan los datos de entrenamiento: no hay referencia al volumen de imágenes, a la composición del dataset, a técnicas de aumentación ni a procesos de ajuste fino o destilación. El aviso de la model card indica que los modelos son redistribuciones de código abierto con licencia y atribución originales, por lo que la información de entrenamiento debería consultarse en las fuentes originales enlazadas desde el model zoo de AddaxAI, no en este repositorio.

## Capacidades

- Procesamiento de imágenes para tareas de visión por computador, presumiblemente clasificación o detección en el ámbito de fauna y cámaras trampa, según el contexto de AddaxAI.
- Integración directa con la plataforma AddaxAI mediante carga de pesos en Keras.
- Redistribución empaquetada de modelos de terceros con sus ficheros de licencia y atribución, lo que facilita el cumplimiento legal en despliegues.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modos de razonamiento explícito.

## Casos de uso

- Clasificación automática de imágenes de cámaras trampa en proyectos de conservación: el repositorio empaqueta los pesos necesarios para integrarlos en el pipeline de AddaxAI y procesar lotes de imágenes sin intervención manual, reduciendo el trabajo de etiquetado en estudios de biodiversidad.
- Monitorización de fauna en la cuenca del Congo: el identificador "CONGO-CMR" sugiere un conjunto de modelos orientado a especies de esa región (Camerún y entorno), útil para inventarios ecológicos y seguimiento de poblaciones.
- Despliegue en entornos de investigación con Keras: al declarar la librería Keras, los modelos pueden cargarse en flujos de trabajo existentes en TensorFlow/Keras sin conversiones adicionales, lo que simplifica la experimentación académica.
- Auditoría de licencias en producción: al incluir ficheros de licencia y atribución junto a los pesos, el repositorio sirve como base para verificar el cumplimiento legal antes de desplegar los modelos en productos comerciales o institucionales.
- Integración en herramientas de análisis de AddaxAI: los usuarios de la plataforma pueden descargar este paquete y ejecutarlo dentro de los flujos predefinidos de AddaxAI para análisis de imágenes, sin tener que localizar los artefactos originales por separado.
- Reproducibilidad de estudios ecológicos: al fijar una versión concreta de los pesos (v1) y un repositorio con tamaño y fecha determinados, se facilita la replicación de resultados en publicaciones que citen el model zoo de AddaxAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,2 GB) sugiere que los pesos podrían caber en GPUs de consumo, pero no se especifica el número de parámetros ni la resolución de entrada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo es compatible con tarjetas de gama media, pero se desconoce el consumo real en inferencia.
- Opciones de despliegue: carga mediante Keras (TensorFlow/Keras 3); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión en formato Keras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación de fauna en cámaras trampa empaquetados para AddaxAI) con especificaciones públicas que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no contiene ficha técnica: no hay información sobre arquitectura, parámetros, datos de entrenamiento ni métricas, lo que impide evaluar su idoneidad con rigor.
- La licencia no está declarada en la model card; se remite a los ficheros incluidos y al model zoo de AddaxAI. Es imprescindible revisar la licencia original de cada modelo antes de cualquier uso comercial.
- Al ser una redistribución de modelos de terceros, la responsabilidad de cumplir las condiciones originales (atribución, restricciones de uso) recae en el usuario.
- Riesgo de sesgo y alucinación no evaluable: no hay información sobre el dominio de entrenamiento ni sobre el rendimiento en especies o condiciones de imagen distintas de las del dataset original.
- El identificador "CONGO-CMR" sugiere un ámbito geográfico y taxonómico concreto; el rendimiento fuera de ese contexto (otras regiones, otras especies, otras condiciones de cámara) es desconocido.
- No se documentan limitaciones de idioma porque no es un modelo lingüístico; cualquier uso en texto requeriría un modelo adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria pública.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Addax-Data-Science/CONGO-CMR-v1
- AddaxAI (plataforma): https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Model zoo de AddaxAI (propietario, licencia, citación y enlaces de cada modelo): https://docs.addaxai.com/docs/reference/model-zoo
