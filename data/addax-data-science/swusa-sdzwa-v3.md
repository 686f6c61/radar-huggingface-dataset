# Addax-Data-Science/SWUSA-SDZWA-v3

## Resumen

SWUSA-SDZWA-v3 es un repositorio de modelos redistribuido por Addax Data Science para su integración en la plataforma AddaxAI, una herramienta de análisis de imágenes de fauna salvaje. El desarrollo y la propiedad de los pesos corresponden a San Diego Zoo Wildlife Alliance, a través de su Conservation Tech Lab, y no a Addax Data Science, que actúa únicamente como redistribuidor con permiso del desarrollador original.

El repositorio no documenta arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento. Por el contexto de AddaxAI y por el tamaño del repositorio (0,4 GB), se trata presumiblemente de un modelo de visión por computador orientado a la detección o clasificación de especies en imágenes de cámaras trampa, aunque esta afirmación no puede confirmarse con la información disponible. No es un modelo de lenguaje ni un modelo generativo de propósito general.

Su relevancia es acotada: el modelo no está pensado para uso general, sino como componente dentro del ecosistema AddaxAI. La licencia no ha sido publicada por el desarrollador, lo que limita seriamente su reutilización fuera de esa plataforma sin autorización expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (el desarrollador no ha publicado licencia para los pesos; redistribución autorizada solo para AddaxAI) |
| Formato de pesos | no disponible (tamaño del repo: 0,4 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El repositorio no incluye detalles sobre el tipo de red (CNN, transformer de visión, detector tipo YOLO u otro), el número de parámetros, la resolución de entrada ni las clases de salida.

Tampoco hay información sobre el conjunto de datos de entrenamiento, el número de imágenes, la composición taxonómica ni si se aplicaron técnicas de aumento de datos o ajuste fino. El único dato contextual es que el modelo procede del Conservation Tech Lab de San Diego Zoo Wildlife Alliance, laboratorio especializado en tecnología para conservación, lo que sugiere un entrenamiento orientado a imágenes de cámaras trampa, pero esto no está confirmado en la información proporcionada.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- Por el contexto de AddaxAI (plataforma de procesamiento de imágenes de fauna), se infiere un uso previsto de análisis de imágenes de cámaras trampa, sin que la model card lo detalle.
- No consta soporte de tool calling, function calling ni razonamiento multi-paso.
- No consta capacidad multilingüe ni generación de texto.
- No consta modo de razonamiento (thinking), visión general, audio ni otras capacidades especiales más allá del posible análisis de imagen.

## Casos de uso

- Procesamiento de imágenes de cámaras trampa en AddaxAI: el modelo se distribuye específicamente para integrarse en el flujo de trabajo de AddaxAI, de modo que los usuarios de esa plataforma puedan analizar lotes de imágenes de campo sin gestionar manualmente los pesos originales.
- Investigación en conservación con el Conservation Tech Lab: equipos que colaboran con San Diego Zoo Wildlife Alliance podrían emplear el modelo en estudios de monitorización de fauna, sujeto a la autorización del desarrollador.
- Evaluación comparativa de modelos de fauna: investigadores que necesiten reproducir o comparar resultados de AddaxAI pueden desplegar este repositorio como referencia, siempre que respeten las condiciones de licencia.
- Docencia y formación en tecnología de conservación: el modelo puede servir como ejemplo práctico en cursos sobre análisis automatizado de imágenes de cámaras trampa dentro del ecosistema AddaxAI.
- Integración en pipelines internos de AddaxAI: el repositorio facilita la descarga y el versionado del modelo para despliegues automatizados de la plataforma.
- Auditoría de licencias y atribución: el repositorio incluye ficheros de licencia y atribución de cada modelo redistribuido, útil para equipos que necesiten verificar el cumplimiento legal antes de usar AddaxAI en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,4 GB) sugiere un modelo pequeño que probablemente quepa en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repo es plausible, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan; el uso previsto es a través de AddaxAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La licencia de los pesos no ha sido publicada por el desarrollador; Addax Data Science solo redistribuye con permiso para uso en AddaxAI. Cualquier otro uso requiere contactar con San Diego Zoo Wildlife Alliance.
- No hay información sobre sesgos del modelo, dominio de entrenamiento ni tasas de error, por lo que no puede evaluarse su fiabilidad fuera del contexto previsto.
- Riesgo de alucinación o falsos positivos/negativos en clasificación: no cuantificado en la documentación.
- No se especifican idiomas, resolución de entrada ni clases soportadas, lo que impide validar su idoneidad para especies o regiones concretas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Para producción fuera de AddaxAI, es imprescindible obtener autorización explícita del desarrollador y revisar los ficheros de licencia incluidos en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/SWUSA-SDZWA-v3
- AddaxAI: https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Conservation Tech Lab (San Diego Zoo Wildlife Alliance): https://github.com/conservationtechlab
