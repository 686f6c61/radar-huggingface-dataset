# Addax-Data-Science/NAM-ADS-v1

## Resumen

NAM-ADS-v1 es un modelo de visión por computador distribuido por Addax Data Science dentro del repositorio Addax-Data-Science/NAM-ADS-v1 en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de un detector de objetos basado en la familia YOLO de Ultralytics, entrenado para la detección de fauna en imágenes de trampas cámara (camera traps). El repositorio actúa como canal de redistribución para facilitar su integración en AddaxAI, la aplicación de escritorio de Addax Data Science para el análisis automatizado de imágenes y vídeos de vida silvestre.

El modelo se publica bajo licencia AGPL-3.0 desde el 10 de noviembre de 2026 (las copias descargadas antes de esa fecha conservan la licencia CC BY-NC-SA 4.0). El tamaño del repositorio es de 0,1 GB, coherente con un checkpoint YOLO de tamaño pequeño o medio, aunque no se especifican en la información disponible el número exacto de parámetros ni la variante concreta de YOLO empleada.

Su relevancia radica en el ecosistema de monitorización de biodiversidad: los modelos de detección de fauna en camera traps permiten procesar grandes volúmenes de imágenes de campo de forma automática, reduciendo el trabajo manual de revisión. La integración con AddaxAI y el cumplimiento de las licencias originales de los datos de entrenamiento (LILA BC, CDLA-Permissive) lo hacen útil para investigadores y proyectos de conservación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos basado en Ultralytics YOLO (variante concreta no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 (desde 10 de noviembre de 2026); copias anteriores bajo CC BY-NC-SA 4.0 |
| Formato de pesos | no disponible (repo de 0,1 GB; se infiere formato Ultralytics, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de la familia YOLO, desarrollado y ejecutado con el paquete `ultralytics` (que también es AGPL-3.0). Se desconoce la variante exacta (YOLOv8, YOLO11 u otra) y el número de parámetros. El repositorio incluye un script `inference.py` para la ejecución del modelo.

Los datos de entrenamiento proceden de camera traps de conservación; entre los ejemplos incluidos en el repositorio figuran cuatro fotogramas del conjunto Desert Lion Conservation Camera Traps, distribuido a través de LILA BC bajo licencia CDLA-Permissive. No se dispone de información sobre el número de imágenes, la composición del dataset, las clases detectadas ni si se aplicaron técnicas de aumento de datos o ajuste fino específico.

## Capacidades

- Detección de objetos en imágenes de trampas cámara (fauna silvestre).
- Procesamiento de imágenes y vídeos a través de la aplicación AddaxAI.
- Ejecución mediante el paquete `ultralytics` con el script `inference.py` incluido.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Monitorización de biodiversidad con camera traps: el modelo detecta fauna en imágenes de campo, permitiendo a investigadores procesar lotes grandes de fotogramas sin revisión manual exhaustiva.
- Proyectos de conservación de grandes felinos: los ejemplos del repositorio provienen de Desert Lion Conservation, por lo que el modelo es adecuado para censos y seguimiento de poblaciones en entornos áridos.
- Análisis de vídeos de campo con AddaxAI: la aplicación integra el modelo para analizar vídeos de trampas cámara y generar resultados utilizables en investigación, uso comercial o personal.
- Investigación académica reproducible: el modelo se distribuye con atribuciones y licencias claras, lo que facilita su cita (paper JOSS) y su uso en estudios publicados.
- Filtrado y triaje de imágenes: descartar fotogramas sin fauna antes de un análisis más costoso, reduciendo el volumen de datos a revisar.
- Despliegue en estaciones de campo: al tratarse de un modelo YOLO de tamaño contenido (repo de 0,1 GB), es viable ejecutarlo en equipos modestos o en el borde, siempre que se respete la licencia AGPL-3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) se espera un consumo moderado, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido del checkpoint sugiere que podría ejecutarse en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: paquete `ultralytics` con `inference.py`; integración en la aplicación AddaxAI. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector YOLO).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de detección de fauna en camera traps ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia AGPL-3.0: no se puede integrar el modelo en una aplicación, web o servicio distribuido o vendido a terceros sin publicar el código fuente de ese software bajo la misma licencia.
- Las copias descargadas antes del 10 de noviembre de 2026 están bajo CC BY-NC-SA 4.0, que restringe el uso comercial; es necesario verificar la fecha de descarga.
- El modelo se redistribuye desde un repositorio de terceros; cada modelo conserva su licencia original y el usuario debe revisarla antes de usarlo.
- No se documentan sesgos, tasas de alucinación (no aplica a detección), clases detectadas ni límites de rendimiento por especie o condición de iluminación.
- No hay información sobre el dominio de generalización: los datos de ejemplo provienen de un único conjunto (Desert Lion Conservation), lo que puede limitar el rendimiento en otros hábitats o especies.
- No se especifican los idiomas ni el contexto, por no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Addax-Data-Science/NAM-ADS-v1
- AddaxAI: https://addaxdatascience.com/addaxai/
- Proyecto DLC (Learn more): https://addaxdatascience.com/projects/2023-01-dlc/
- Paper JOSS (Cite): https://joss.theoj.org/papers/10.21105/joss.05581
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Addax Data Science: https://addaxdatascience.com/
