# songbirdini/callmark-tweetynet

## Resumen

CallMark-tweetynet es un conjunto de pesos entrenados del modelo TweetyNet, publicados como material de reproducibilidad del artículo CallMark, orientado a la deteccion automatica de vocalizaciones de fauna en grabaciones bioacusticas. El autor del repositorio en Hugging Face es songbirdini y el codigo asociado se distribuye en el repositorio GitHub `marisbasha/callmark_reproducibility`. No se trata de un modelo de lenguaje, sino de un detector de eventos acusticos especializado.

El repositorio contiene tres variantes identificadas por el numero de vocalizaciones de entrenamiento por taxon (50, 100 y 500), almacenadas como ficheros `best.pt` dentro de subcarpetas por tamano. La descarga se realiza mediante el script `download_models.py` del repositorio de codigo, que coloca los pesos en las rutas que esperan los scripts de prediccion.

La relevancia de esta publicacion es acotada: se enmarca en la reprodubilidad de un paper concreto de bioacustica y no en un modelo generalista. El repositorio en Hugging Face no incluye pipeline declarado, licencia, idiomas ni tamano efectivo de pesos (0.0 GB reportados), por lo que la informacion tecnica disponible en la model card es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TweetyNet (red neuronal para deteccion de vocalizaciones; detalles no disponibles en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un detector de audio por ventanas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`) |
| Variantes publicadas | 50, 100 y 500 vocalizaciones de entrenamiento por taxon |
| Tarea | Deteccion de vocalizaciones en audio bioacustico |
| Repositorio | `songbirdini/callmark-tweetynet` (0.0 GB reportados) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de modelos TweetyNet entrenados para deteccion y que las cifras 50, 100 y 500 corresponden al numero de vocalizaciones de entrenamiento por taxon. No se especifica en la informacion disponible el tipo de capas, el tamano de las ventanas de entrada, la tasa de muestreo, la funcion de perdida ni el esquema de aumento de datos. Tampoco se detalla la composicion del corpus de audio ni si hubo validacion cruzada o ajuste de hiperparametros.

El contexto metodologico se remite al articulo CallMark y a su repositorio de reproducibilidad, donde se documentan los scripts de entrenamiento y prediccion. Cualquier detalle adicional sobre la arquitectura interna de TweetyNet o sobre el proceso de anotacion debe consultarse en esas fuentes, no en la model card de Hugging Face.

## Capacidades

- Deteccion de vocalizaciones (eventos acusticos) en grabaciones de audio bioacustico.
- Entrenamiento especifico por taxon, con variantes segun el volumen de datos de entrenamiento (50, 100 y 500 vocalizaciones).
- Integracion con los scripts de prediccion del repositorio `callmark_reproducibility`.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa texto).
- No dispone de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Monitorizacion de biodiversidad en parques naturales: ejecutar el detector sobre grabaciones continuas de sensores acusticos para localizar vocalizaciones por taxon y estimar actividad a lo largo del tiempo.
- Reproduccion de resultados del paper CallMark: descargar los pesos con `download_models.py tweetynet --data /path/to/data` y ejecutar los scripts de prediccion para verificar las cifras publicadas.
- Estudios comparativos de eficiencia de muestreo: contrastar las variantes de 50, 100 y 500 vocalizaciones por taxon para medir como escala el rendimiento con el volumen de anotaciones.
- Filtrado previo de archivos largos: usar el detector para recortar segmentos candidatos antes de una revision manual o de un etiquetado fino por expertos.
- Analisis de paisaje sonoro en proyectos de investigacion: procesar lotes de grabaciones con un modelo ligero entrenado especificamente para deteccion de vocalizaciones.
- Docencia y talleres de bioacustica computacional: emplear los pesos como ejemplo reproducible de un pipeline de deteccion con TweetyNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, mAP ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano de los pesos no se refleja en la model card; el repositorio reporta 0.0 GB).
- GPU recomendadas: no disponibles. TweetyNet es una red de deteccion de audio de escala moderada, por lo que en la practica suele ejecutarse en GPU de gama media o incluso en CPU, pero no hay datos publicados que lo confirmen para estas variantes concretas.
- Compatibilidad con GPU de consumo: no disponible de forma documentada.
- Opciones de despliegue: los scripts de prediccion del repositorio `marisbasha/callmark_reproducibility` sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros detectores bioacusticos ni con variantes de TweetyNet de otros autores.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse el repositorio de GitHub y el paper antes de cualquier uso en produccion.
- El repositorio reporta 0.0 GB y 0 descargas, lo que sugiere que los pesos pueden no estar subidos o que el contenido es unicamente referencial; conviene verificar la descarga real mediante el script indicado.
- El rendimiento depende del taxon y del numero de vocalizaciones de entrenamiento; las variantes de 50 pueden presentar menor robustez que las de 500.
- No se documentan sesgos, tasas de falsos positivos ni comportamiento ante ruido antropogenico o especies no representadas en el entrenamiento.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni genera texto; cualquier uso requiere el pipeline de prediccion del repositorio.
- No se especifican requisitos de tasa de muestreo, formato de audio ni preprocesado, por lo que es imprescindible seguir los scripts del repositorio para evitar desalineaciones.
- La fecha de creacion del repositorio (2026-11-21) y la ausencia de metadatos de licencia e idioma limitan la trazabilidad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songbirdini/callmark-tweetynet
- Repositorio de codigo y reproducibilidad: https://github.com/marisbasha/callmark_reproducibility
