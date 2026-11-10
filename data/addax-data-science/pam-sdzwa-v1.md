# Addax-Data-Science/PAM-SDZWA-v1

## Resumen

PAM-SDZWA-v1 es un paquete de pesos redistribuido por Addax Data Science para su integración en AddaxAI, una plataforma de automatización de análisis de imágenes de fauna. El desarrollo y la titularidad de los pesos corresponden a San Diego Zoo Wildlife Alliance, a través de su Conservation Tech Lab, que los ha cedido para su redistribución en este repositorio. El modelo está orientado a tareas de procesamiento de imágenes de cámaras trampa (camera traps) empleadas en monitorización de vida silvestre.

La información pública disponible es extremadamente limitada: la model card no especifica arquitectura, número de parámetros, longitud de contexto, idiomas ni pipeline de Hugging Face. El repositorio ocupa aproximadamente 0,2 GB, lo que sugiere un modelo de tamaño moderado o pequeño, probablemente basado en una arquitectura de visión por computador (CNN o ViT) más que en un modelo de lenguaje generativo. No se han publicado resultados de benchmarks ni detalles de entrenamiento en la información accesible.

La relevancia del modelo radica en su contexto de aplicación: la clasificación automática de especies en imágenes de cámaras trampa es una tarea crítica para la investigación en conservación, y la disponibilidad de pesos abiertos (aunque con licencia restringida) facilita su integración en pipelines de análisis ecológico. No obstante, la ausencia de documentación técnica detallada limita seriamente su evaluación rigurosa por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin licencia publicada por el desarrollador; redistribucion autorizada solo para AddaxAI) |
| Formato de pesos | no disponible (tamano del repositorio: 0,2 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. Dado el contexto de uso (análisis de imágenes de cámaras trampa para identificación de fauna) y el tamaño del repositorio (0,2 GB), es plausible que se trate de un modelo de visión por computador, pero no se confirma en la model card. Tampoco se especifican los datos de entrenamiento, el número de imágenes utilizadas, la composición del dataset, ni si se emplearon técnicas de aumento de datos o ajuste fino supervisado.

No hay información sobre innovaciones técnicas, técnicas de optimización, destilación, cuantización ni procesos de alineación. La model card se limita a indicar la procedencia de los pesos y las condiciones de redistribución, sin entrar en detalles técnicos del desarrollo.

## Capacidades

- Procesamiento de imágenes de cámaras trampa para aplicaciones de conservación de fauna (inferido del contexto de AddaxAI y del desarrollador, no confirmado explícitamente en la model card).
- Integración con la plataforma AddaxAI para automatización de análisis de imágenes.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta soporte de thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de especies en imágenes de cámaras trampa: el modelo se integraría en el pipeline de AddaxAI para identificar automáticamente la fauna capturada en fotografías de campo, reduciendo el trabajo manual de revisión de grandes volúmenes de imágenes.
- Monitorización de biodiversidad en proyectos de conservación: investigadores de la San Diego Zoo Wildlife Alliance y organizaciones asociadas podrían emplear el modelo para procesar lotes de imágenes recogidas en estudios de campo y generar inventarios de especies.
- Detección de presencia/ausencia de animales en zonas monitorizadas: útil para estudios de ocupación y distribución de especies en áreas protegidas.
- Filtrado previo de imágenes vacías: descartar automáticamente capturas sin fauna para optimizar el almacenamiento y la revisión posterior por parte de biólogos.
- Investigación ecológica a largo plazo: análisis retrospectivo de archivos de cámaras trampa acumulados durante años para detectar cambios en la comunidad faunística.
- Educación y divulgación científica: uso en talleres y materiales formativos sobre conservación asistida por IA, aprovechando la integración con AddaxAI.
- Prototipado de flujos de trabajo en AddaxAI: los desarrolladores de la plataforma pueden usar estos pesos para validar la integración de modelos de visión en su ecosistema antes de desplegar soluciones en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,2 GB) sugiere que el modelo podría ejecutarse en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido de los pesos hace plausible su ejecución en GPUs como RTX 3060 o superiores, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan frameworks compatibles (vLLM, llama.cpp, Ollama, TGI, ONNX Runtime, TensorRT, etc.). La integración documentada es exclusivamente con AddaxAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación de fauna en cámaras trampa) con parámetros, contexto, rendimiento, licencia y disponibilidad documentados.

## Limitaciones y advertencias

- La licencia es "other": el desarrollador (San Diego Zoo Wildlife Alliance) no ha publicado una licencia para estos pesos. La redistribución por parte de Addax Data Science está autorizada únicamente para su uso en AddaxAI, con permiso del desarrollador. Cualquier otro uso requiere contactar con el desarrollador.
- No se permite el uso comercial sin autorización expresa del desarrollador, al no existir una licencia publicada que lo ampare.
- Ausencia total de documentación técnica: no se especifican arquitectura, parámetros, datos de entrenamiento ni evaluación, lo que impide validar el rendimiento del modelo de forma independiente.
- Riesgo de sesgo desconocido: al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos geográficos, taxonómicos o de condiciones de iluminación.
- Riesgo de alucinación o falsos positivos/negativos en la clasificación de especies: sin benchmarks publicados, no se puede estimar la precisión del modelo en condiciones reales.
- Limitaciones de idioma y contexto: no aplicables directamente si el modelo es de visión, pero no confirmadas.
- Idoneidad para producción no verificada: la falta de métricas, pruebas y documentación desaconseja su despliegue en entornos críticos sin una evaluación previa por parte del usuario.
- La model card indica explícitamente que los usuarios deben revisar y cumplir las licencias individuales de los modelos antes de su uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/PAM-SDZWA-v1
- AddaxAI (plataforma de integración): https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Conservation Tech Lab (San Diego Zoo Wildlife Alliance): https://github.com/conservationtechlab/
