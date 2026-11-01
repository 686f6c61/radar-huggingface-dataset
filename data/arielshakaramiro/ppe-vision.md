# arielshakaramiro/ppe-vision

## Resumen

PPE Vision (también denominado APD Vision, por el término indonesio *Alat Pelindung Diri*) es un sistema de visión por computador orientado a la monitorización del cumplimiento de equipos de protección individual (EPI) en entornos laborales. Lo desarrolla Muhammad Ariel Shakaramiro como proyecto final de su programa de IA en rubythalib.ai y se publica como tarjeta de proyecto en Hugging Face, no como modelo de pesos abiertos: los pesos no están disponibles en el repositorio y el código fuente reside en GitHub.

El sistema combina un detector YOLO11n-pose de Ultralytics para la estimación de pose de los trabajadores con un detector YOLO afinado específicamente para EPI, junto con el tracker ByteTrack y OpenCV. La detección se asocia a trabajadores seguidos en el tiempo, se aplican reglas por zona y cada evento se registra con evidencia revisable (foto anotada, recorte del trabajador, clip de vídeo, hash SHA-256 y traza de auditoría). La evaluación publicada se limita a un conjunto de 340 fotogramas revisados, con mAP50-95 de 0,604 para casco y 0,432 para chaleco.

La relevancia del proyecto es acotada: se trata de una pieza de portafolio personal, no de un modelo listo para producción ni de un componente reutilizable por terceros. Su interés técnico está en la arquitectura de sistema completa (ingesta de streams RTSP/HTTP, gestión de evidencias, control de acceso por roles, analítica de cumplimiento y un agente de preguntas y respuestas en indonesio sobre Ollama) más que en el detector en sí, cuyos resultados el propio autor califica como insuficientes para despliegue de campo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detección de objetos YOLO (Ultralytics) con estimación de pose YOLO11n-pose y tracking ByteTrack |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, id |
| Licencia | all-rights-reserved (otros; no es código abierto) |
| Formato de pesos | no disponible (los pesos no se publican en Hugging Face) |

## Arquitectura y entrenamiento

El sistema es una canalización de visión por computador, no un único modelo. La detección de personas se apoya en YOLO11n-pose de Ultralytics, que proporciona cajas y puntos clave del esqueleto; sobre esa base se ejecuta un detector YOLO afinado para clases de EPI (casco, chaleco, guantes y calzado). Las detecciones se vinculan a identidades de trabajador mediante ByteTrack, de modo que el estado de cumplimiento se mantiene a lo largo del tiempo con histéresis para evitar parpadeos entre estados conforme, infracción e incierto. Las reglas de cumplimiento se aplican por zona de cámara.

El detector de EPI se ha afinado con datos de tres fuentes: el conjunto SH17 (licencia CC BY-NC-SA, uso no comercial), el PPE Dataset for Workplace de Roboflow (CC BY 4.0) y anotaciones locales propias. No se especifican en la información disponible el número de tokens, el volumen de imágenes de entrenamiento, la resolución de entrada ni si hubo aumentación de datos o estrategias de destilación. Tampoco se documentan detalles del proceso de ajuste fino (épocas, hiperparámetros, función de pérdida). La evaluación se realizó sobre un conjunto dorado revisado de 340 fotogramas, sin que se detallen los protocolos de partición train/val/test.

## Capacidades

- Detección de casco y chaleco en flujos de vídeo en directo (RTSP o HTTP) y en grabaciones subidas de forma reanudable.
- Detección de guantes y calzado presente en el sistema, aunque el propio autor la califica como débil y no dispara infracciones por defecto.
- Estimación de pose de trabajadores mediante YOLO11n-pose, con seguimiento multiobjeto con ByteTrack.
- Clasificación de estados de cumplimiento (conforme, infracción, incierto) con histéresis y reglas específicas por zona de cámara.
- Gestión de varias cámaras compartiendo un planificador, con reconexión automática.
- Generación de evidencias: fotos anotadas, recortes del trabajador, clips de vídeo, desenfoque de caras y hashes SHA-256 para integridad.
- Flujo de revisión por supervisor con traza de auditoría.
- Analítica de cumplimiento por ítem, cámara y zona, minutos de exposición y calidad de cámara, con informes imprimibles.
- Agente K3 de preguntas y respuestas en indonesio sobre los datos del sistema, con herramientas de solo lectura y ejecución local mediante Ollama o un enrutador offline.
- Control de acceso con roles de visor, supervisor y administrador, y alertas opcionales por Telegram.
- No dispone de capacidades de generación de texto general, razonamiento, código, matemáticas ni tool calling genérico más allá del agente K3 interno.

## Casos de uso

- Monitorización de obra con varias cámaras: el sistema ingiere streams RTSP/HTTP de varias cámaras con un planificador compartido y reconexión automática, aplicando reglas por zona para detectar trabajadores sin casco o sin chaleco en áreas restringidas.
- Revisión de incidentes por el responsable de seguridad: cada infracción queda registrada con foto anotada, recorte del trabajador, clip y hash SHA-256, lo que permite al supervisor revisar el evento y dejar traza de auditoría sin depender de la grabación completa.
- Análisis de grabaciones retrospectivas: la carga reanudable de vídeos y las tareas de análisis pausables permiten procesar material de turnos anteriores para auditar el cumplimiento sin conexión en directo.
- Elaboración de informes de cumplimiento: la analítica por ítem, cámara y zona, junto con los minutos de exposición, alimenta informes imprimibles para auditorías internas o inspecciones de prevención de riesgos laborales.
- Consulta en lenguaje natural sobre los datos de seguridad: el agente K3 responde en indonesio a preguntas sobre los eventos registrados usando herramientas de solo lectura, lo que facilita la consulta a personal no técnico sin exponer escrituras sobre la base de datos.
- Formación y concienciación: los clips y fotos anotadas de infracciones pueden emplearse en sesiones de formación interna para ilustrar situaciones de riesgo reales detectadas en la propia instalación.
- Prototipado de sistemas de seguridad laboral: el stack (FastAPI, SQLModel, SQLite, React, Docker Compose con Caddy) sirve como referencia arquitectónica para equipos que quieran construir un sistema de evidencias con control de roles y auditoría, aunque no para reutilizar los pesos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto dorado revisado de 340 fotogramas:

| Clase | mAP50-95 |
|---|---|
| Casco | 0,604 |
| Chaleco | 0,432 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas con otros detectores de EPI. El autor indica explícitamente que la puerta de promoción a cuatro clases no se ha superado y que estos resultados no constituyen evidencia de que el sistema esté listo para despliegue de campo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de YOLO11n-pose (variante nano) más un detector YOLO afinado, la huella debería ser reducida, pero no se publican mediciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: Docker Compose con Caddy para HTTPS según el stack declarado; el agente K3 puede ejecutarse con Ollama local o con un enrutador offline. No se documenta soporte de vLLM, llama.cpp, TGI ni Ollama para el detector (Ollama se menciona solo para el agente de lenguaje).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases EPI | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PPE Vision (arielshakaramiro) | Sistema YOLO + pose + tracking | Casco, chaleco (guantes y calzado débiles) | Vídeo RTSP/HTTP y grabaciones | all-rights-reserved | Pesos no publicados; código en GitHub |
| YOLO11n-pose (Ultralytics) | Detección de pose | No específico de EPI | Imagen/vídeo | Licencia Ultralytics (AGPL/enterprise) | Pesos públicos |
| Detectores EPI de Roboflow Universe | Detección de objetos | Variable según proyecto | Imagen | Variable (CC BY 4.0 en el dataset citado) | Pesos según proyecto |
| SH17 (dataset) | Conjunto de datos | 17 clases de EPI | Imágenes | CC BY-NC-SA (no comercial) | Dataset público |

La comparación es limitada: no se dispone de métricas homogéneas entre estas alternativas ni de resultados de PPE Vision frente a detectores EPI públicos en el mismo conjunto de evaluación. No disponible información adicional para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Los pesos no se publican en Hugging Face; la página es una tarjeta de proyecto y el código está en GitHub bajo licencia all-rights-reserved, por lo que la reutilización requiere permiso escrito del autor.
- El propio autor advierte que los resultados no son evidencia de preparación para despliegue de campo y que deben ser revisados por un oficial de seguridad; no son decisiones de seguridad automatizadas.
- La detección de guantes y calzado es débil y no dispara infracciones por defecto; la puerta de promoción a cuatro clases no se ha superado.
- El conjunto de evaluación es reducido (340 fotogramas) y no se detallan particiones ni protocolo, lo que limita la generalización de las métricas.
- El detector se ha afinado con SH17, cuya licencia CC BY-NC-SA prohíbe el uso comercial; esto condiciona cualquier uso comercial derivado.
- Riesgo de sesgo por composición del dataset (entornos y equipos de protección concretos) y por las condiciones de iluminación y cámara de las anotaciones locales.
- El agente K3 solo responde en indonesio y opera sobre herramientas de solo lectura; no es un asistente general.
- No se documentan cuantizaciones, latencias ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.
- Riesgo de alucinación en el agente K3 al responder sobre los datos, aunque las herramientas sean de solo lectura.

## Enlaces

- Hugging Face: https://huggingface.co/arielshakaramiro/ppe-vision
- Repositorio GitHub: https://github.com/arielshakaramiro/ppe-vision
- Perfil del autor en GitHub: https://github.com/arielshakaramiro
- LinkedIn del autor: https://www.linkedin.com/in/muhammadariels/
- Dataset SH17: https://github.com/ahmadmughees/SH17dataset
- PPE Dataset for Workplace (Roboflow): https://universe.roboflow.com/siabar/ppe-dataset-for-workplace
