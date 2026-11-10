# Addax-Data-Science/AHDRIFT-v1

## Resumen

AHDRIFT-v1 es un modelo redistribuido por Addax Data Science dentro del repositorio Addax-Data-Science/AHDRIFT-v1 en Hugging Face, pensado para su integración sencilla con la herramienta AddaxAI. No se trata de un modelo de lenguaje: por el contexto de la model card (imágenes de ejemplo del Ohio Small Animals dataset, referencia al proyecto AHDRIFT-ID de la Universidad Estatal de Ohio y uso dentro de AddaxAI) se trata de un modelo de visión por computador orientado a la detección o identificación de fauna en imágenes de cámaras de fototrampeo.

La model card es fundamentalmente un contenedor de redistribución: indica que cada modelo incluido conserva su licencia y atribución originales, y que el usuario debe revisar y cumplir las licencias individuales antes de usarlo. El repositorio declara licencia apache-2.0 a nivel global, pero esto no sustituye a las licencias de los pesos originales que se redistribuyen.

El modelo es relevante para quien necesite desplegar detección de fauna salvaje en flujos de AddaxAI sin gestionar manualmente las dependencias y descargas de los modelos originales. El tamaño del repositorio es de 0,4 GB y no se han publicado métricas de rendimiento ni especificaciones técnicas detalladas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada a nivel de repositorio; los pesos redistribuidos conservan su licencia original) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible información sobre la arquitectura del modelo (tipo de red, backbone, resolución de entrada, número de parámetros ni estrategia de detección). El repositorio se describe como una redistribución de modelos de código abierto para AddaxAI, por lo que la arquitectura y el entrenamiento corresponden a los modelos originales alojados en las fuentes enlazadas (proyecto AHDRIFT-ID de la Universidad Estatal de Ohio).

Los datos de entrenamiento citados en la model card incluyen el Ohio Small Animals dataset de la Universidad Estatal de Ohio, distribuido a través de LILA BC bajo licencia CDLA-Permissive, del cual se incluyen cuatro fotogramas de ejemplo en el directorio `examples/`. No se especifican número de imágenes, composición del dataset, aumentos de datos ni procedimiento de entrenamiento.

## Capacidades

- Detección o identificación de fauna en imágenes de cámaras de fototrampeo, según el contexto del proyecto AHDRIFT-ID y de AddaxAI.
- Integración directa con la plataforma AddaxAI, que gestiona la descarga y el uso de los modelos redistribuidos.
- Procesamiento de imágenes (no de texto): no se documentan capacidades de generación de lenguaje, razonamiento, código ni matemáticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable ni documentada.
- Capacidades especiales (modo thinking, visión, audio): únicamente visión, en el ámbito de la detección de fauna; sin más detalle.

## Casos de uso

- Monitorización de fauna con cámaras trampa: el modelo se usaría dentro de AddaxAI para procesar lotes de imágenes capturadas por cámaras de fototrampeo y detectar o identificar las especies presentes, aprovechando que el repositorio ya incluye los pesos empaquetados.
- Inventarios de biodiversidad: integrado en un pipeline de AddaxAI, permite clasificar automáticamente miles de imágenes de campo procedentes de estudios ecológicos como los del Ohio Small Animals dataset, reduciendo la revisión manual.
- Seguimiento de especies en proyectos de conservación: al estar empaquetado para AddaxAI, un equipo de guardabosques o investigadores puede desplegarlo sin gestionar manualmente las dependencias de los modelos originales.
- Investigación académica reproducible: el repositorio fija una versión concreta de los pesos y las atribuciones, lo que facilita citar y reproducir análisis de detección de fauna en publicaciones.
- Despliegue en estaciones de campo: con un repositorio de 0,4 GB, el modelo es manejable para copiarse a equipos con conectividad limitada y ejecutarse en local mediante la herramienta AddaxAI.
- Filtrado previo de imágenes: usar el modelo como primera etapa para descartar fotogramas sin animales y reducir el volumen de imágenes que requieren inspección humana en estudios a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,4 GB, lo que sugiere un modelo compacto que probablemente quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible en tarjetas con 4-8 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: la vía documentada es AddaxAI (https://addaxdatascience.com/addaxai/); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de detección de fauna.

## Limitaciones y advertencias

- La model card es una plantilla de redistribución: no documenta arquitectura, entrenamiento, métricas ni limitaciones del modelo original.
- Riesgo de licencia: aunque el repositorio declara apache-2.0, cada modelo redistribuido conserva su licencia original; es obligatorio revisar los ficheros de licencia y las atribuciones antes de cualquier uso, incluido el comercial.
- Los datos de ejemplo provienen del Ohio Small Animals dataset bajo CDLA-Permissive, una licencia distinta de la declarada para el repositorio.
- Sesgos conocidos: no documentados; cabe esperar sesgos derivados de la composición geográfica y taxonómica del dataset de entrenamiento (fauna de Ohio), con posible degradación en otras regiones o especies.
- Riesgo de falsos positivos y falsos negativos en detección: no cuantificado en la información disponible.
- Sin información sobre resolución de entrada, umbrales de confianza ni formato de salida, lo que dificulta su integración fuera de AddaxAI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/AHDRIFT-v1
- AddaxAI: https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Proyecto AHDRIFT-ID (Universidad Estatal de Ohio): https://u.osu.edu/lipps.37/ahdrift-id/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
