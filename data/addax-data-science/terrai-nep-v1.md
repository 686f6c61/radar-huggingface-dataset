# Addax-Data-Science/TERRAI-NEP-v1

## Resumen

TERRAI-NEP-v1 es un modelo redistribuido por Addax Data Science dentro de su plataforma AddaxAI, una herramienta de código abierto orientada al procesamiento y clasificación automática de imágenes de cámaras trampa para monitorización de fauna. El modelo original fue desarrollado por Alexander Merdian-Tarko (proyecto TeraiNet) y se publica bajo licencia MIT. Addax Data Science actúa como redistribuidor para facilitar su integración directa en AddaxAI, manteniendo la atribución y licencia originales.

El repositorio tiene un tamaño de 0,6 GB y los pesos están en formato Keras, lo que indica que se trata de un modelo de visión por computador (no un modelo de lenguaje) destinado a tareas de detección o clasificación de especies en imágenes. La información pública disponible no especifica la arquitectura concreta, el número de parámetros ni el contexto de entrenamiento, más allá de que los datos de ejemplo provienen del conjunto WCS Camera Traps (Wildlife Conservation Society) distribuido a través de LILA BC bajo licencia CDLA-Permissive.

Su relevancia actual radica en el ecosistema de AddaxAI: permite a investigadores y gestores de conservación ejecutar inferencia sobre imágenes de cámaras trampa sin necesidad de entrenar modelos propios, aprovechando un pipeline ya empaquetado. No obstante, la ficha técnica pública es muy limitada y no se han publicado benchmarks ni especificaciones detalladas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión, formato Keras) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | Keras (repositorio de 0,6 GB) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo en la información disponible. El repositorio indica únicamente que los pesos están en formato Keras y que el modelo se distribuye para su uso con AddaxAI. Por el contexto (imágenes de cámaras trampa, conjunto WCS Camera Traps), se trata presumiblemente de una red neuronal convolucional o un detector de objetos orientado a fauna, pero no se confirma ni el tipo de backbone ni la cabeza de clasificación/detección.

Respecto al entrenamiento, la model card menciona que las imágenes de ejemplo provienen del conjunto WCS Camera Traps de Wildlife Conservation Society, distribuido vía LILA BC bajo licencia CDLA-Permissive, y que fueron muestreadas por TeraiNet. No se especifica el número de imágenes de entrenamiento, la composición del dataset, si hubo aumento de datos, ni si se aplicaron técnicas de ajuste fino o destilación. Tampoco se documentan innovaciones técnicas como atención lineal, decodificación especulativa o mecanismos híbridos.

## Capacidades

- Procesamiento de imágenes de cámaras trampa para monitorización de fauna (inferencia sobre fotogramas).
- Integración directa con el pipeline de AddaxAI para clasificación o detección automática.
- Uso como componente de visión dentro de flujos de conservación y ecología.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo ni modos de pensamiento.
- No se documentan capacidades de audio ni de vídeo más allá del procesamiento de fotogramas individuales.

## Casos de uso

- Monitorización de fauna en reservas naturales: el modelo se ejecuta sobre lotes de imágenes de cámaras trampa para identificar especies y reducir la revisión manual, integrándose en AddaxAI como motor de inferencia.
- Inventarios de biodiversidad: procesamiento masivo de tarjetas SD de cámaras trampa para generar listados de especies detectadas por ubicación y periodo.
- Seguimiento de especies amenazadas: uso del modelo para filtrar fotogramas relevantes antes de la revisión por expertos, agilizando estudios poblacionales.
- Investigación ecológica a largo plazo: integración en pipelines de análisis que combinan detecciones con metadatos de fecha, hora y localización para estudios de patrones de actividad.
- Gestión de conflictos fauna-humano: detección temprana de presencia de animales en zonas agrícolas o periurbanas a partir de imágenes de cámaras trampa.
- Educación y divulgación: uso del modelo en talleres y proyectos citizen science para clasificar imágenes con asistencia automática.
- Prototipado rápido en AddaxAI: al estar redistribuido específicamente para esta plataforma, permite desplegar un flujo de clasificación sin entrenamiento previo ni gestión manual de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio de 0,6 GB sugiere que la inferencia es viable en GPU de gama media, pero no se confirma.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: probable por el tamaño del repositorio, pero no confirmada en la documentación.
- Opciones de despliegue: inferencia vía Keras/TensorFlow (formato de pesos) e integración con AddaxAI; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (detección/clasificación de fauna en cámaras trampa) con especificaciones verificables.

## Limitaciones y advertencias

- La model card pública es mínima: no se documentan arquitectura, parámetros, dataset de entrenamiento ni métricas, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de sesgo hacia las especies y condiciones de iluminación presentes en WCS Camera Traps; el rendimiento en otras regiones o especies no está documentado.
- Riesgo de falsos positivos y falsos negativos en condiciones de baja visibilidad, oclusión o especies poco representadas; no hay métricas publicadas que lo cuantifiquen.
- La licencia MIT permite uso comercial, pero el usuario debe revisar las licencias de los modelos originales redistribuidos y de los datasets de origen (WCS Camera Traps vía LILA BC, CDLA-Permissive).
- Addax Data Science actúa como redistribuidor; la responsabilidad sobre el comportamiento del modelo recae en el desarrollador original (Alexander Merdian-Tarko) y en el usuario final.
- No apto para tareas de lenguaje, razonamiento o generación de texto: es un modelo de visión.
- Sin garantías de mantenimiento ni soporte más allá de la actualización del repositorio (última actualización registrada: 2026-11-10).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Addax-Data-Science/TERRAI-NEP-v1
- AddaxAI (plataforma de integración): https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Página del desarrollador original (Alexander Merdian-Tarko): https://alexvmt.github.io/
- Licencia MIT: https://opensource.org/license/mit
- LILA BC (dataset WCS Camera Traps): https://lila.science/
