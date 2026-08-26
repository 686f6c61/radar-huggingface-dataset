# ayazelrico/Milyonus-Optic-Tracking-2.4

## Resumen

Milyonus Optic Tracking 2.4 es un sistema de seguimiento óptico facial en tiempo real diseñado para ejecutarse completamente en el navegador, sin necesidad de servidores externos ni procesamiento en la nube. Desarrollado por Milyonus, una empresa centrada en agentes de IA y sistemas de entrevistas automatizadas, este modelo ofrece un mallado facial de 478 puntos, estimación de pose 3D de la cabeza, seguimiento de múltiples rostros con identificadores persistentes y un sistema de puntuación de atención que muestrea y reporta el nivel de enfoque una vez por segundo.

El modelo se distribuye bajo licencia MIT, aunque el propio autor lo describe como "closed-source" en publicaciones de LinkedIn, lo que genera una contradicción que debería aclararse antes de su adopción en producción. A pesar de estar listado en HuggingFace, la ficha del modelo está prácticamente vacía y no se han publicado métricas de rendimiento, datos de entrenamiento ni especificaciones técnicas detalladas. Su relevancia radica en la promesa de llevar el seguimiento ocular y facial avanzado a dispositivos de gama baja y media sin depender de APIs externas, lo que abre casos de uso en educación, salud y atención al cliente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como "closed-source con seguimiento de landmarks cuantizado") |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se especifica arquitectura MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; se refiere a ventana de procesamiento de imágenes) |
| Tipos de cuantizacion | se menciona "quantized landmark tracking" pero sin detalles de precisión |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT (según HuggingFace); el autor indica "closed-source" en LinkedIn |
| Formato de pesos | no disponible (no se publican pesos en el repositorio) |

## Arquitectura y entrenamiento

La información disponible describe un sistema de visión por computador orientado a navegador que produce una malla facial de 478 puntos, estimación de pose 3D y seguimiento multi-rostro con IDs persistentes. No se detalla la arquitectura interna (si es un modelo basado en redes neuronales convolucionales, transformers, o un enfoque híbrido), ni el conjunto de datos de entrenamiento, ni el número de parámetros. El autor menciona "cuantización" en el seguimiento de landmarks, lo que sugiere optimización para ejecución en dispositivos con recursos limitados, pero no se especifica el esquema de cuantización (por ejemplo, int8, fp16, etc.).

No se ha publicado información sobre el proceso de entrenamiento, la composición del dataset (si es propietario o público), ni si se aplicaron técnicas como RLHF o DPO. Tampoco se han documentado innovaciones técnicas más allá de la cuantización mencionada y la capacidad de ejecución en el navegador.

## Capacidades

- Seguimiento facial en tiempo real: malla de 478 puntos sobre el rostro, permitiendo capturar expresiones y micro-expresiones.
- Estimación de pose 3D de la cabeza: orientación (yaw, pitch, roll) del rostro en el espacio tridimensional.
- Seguimiento multi-rostro: detecta y rastrea múltiples caras simultáneamente, asignando identificadores persistentes para mantener la identidad entre frames.
- Puntuación de confianza por rostro: proporciona un nivel de confianza para cada detección, útil para filtrar falsos positivos.
- Sistema de seguimiento de atención: muestra y reporta el nivel de atención del usuario una vez por segundo, basado en la orientación de la cabeza y la mirada.
- Ejecución 100% en el navegador: no requiere servidores externos ni conexión a internet para el procesamiento, lo que garantiza privacidad y baja latencia.

## Casos de uso

- Entrevistas de trabajo automatizadas: el sistema puede integrarse en plataformas de reclutamiento para analizar micro-expresiones y atención durante entrevistas remotas, ayudando a evaluar la idoneidad del candidato de forma objetiva.
- Monitorización de atención en educación online: plataformas de e-learning pueden detectar si el estudiante está prestando atención a la clase, generando alertas para el docente cuando la atención decae.
- Telemedicina y salud mental: terapeutas pueden usar la puntuación de atención y las expresiones faciales para evaluar el estado emocional del paciente durante sesiones remotas, complementando la evaluación clínica.
- Análisis de usuarios en publicidad: empresas pueden medir la reacción de los usuarios a anuncios o contenidos mediante el seguimiento de expresiones y atención en tiempo real, sin enviar datos a la nube.
- Seguridad y control de acceso: sistemas de verificación facial ligeros pueden ejecutarse en navegadores para autenticación de usuarios, aprovechando la detección multi-rostro y la estimación de pose.
- Investigación en psicología: investigadores pueden utilizar el seguimiento de microexpresiones en estudios sobre emociones y comportamiento, con la ventaja de que los datos nunca salen del dispositivo del participante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos públicos sobre precisión del modelo de landmarks, velocidad de inferencia, uso de CPU/GPU, ni comparación con otras soluciones como MediaPipe Face Mesh o Apple Vision.

## Requisitos de hardware

- Al ser una solución en el navegador, no requiere GPU dedicada; funciona con el procesador integrado de cualquier dispositivo moderno.
- Se recomienda un dispositivo con al menos 4 GB de RAM para manejar el seguimiento multi-rostro sin degradación notable.
- Compatible con navegadores que soporten WebGL y WebAssembly (Chrome, Firefox, Safari, Edge).
- Para un rendimiento fluido a 30 FPS, se recomienda un dispositivo de gama media (por ejemplo, un portátil con CPU Intel i5 o equivalente).
- No hay información sobre despliegue en servidores (vLLM, TGI, Ollama) porque el modelo no es de tipo LLM; se despliega como una librería JavaScript en el navegador.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos del rostro | Pose 3D | Multi-rostro | Ejecución | Licencia |
|---|---|---|---|---|---|---|
| Milyonus Optic Tracking 2.4 | Seguimiento facial en navegador | 478 | Sí | Sí | On-device (navegador) | MIT (según HF) |
| MediaPipe Face Mesh | Seguimiento facial en navegador | 468 | Sí | Sí | On-device (navegador) | Apache 2.0 |
| Apple Vision (Face) | Seguimiento facial en iOS | 68 puntos | Sí | Sí | On-device (iOS) | Propietaria |

MediaPipe Face Mesh es la alternativa más comparable por su arquitectura y su ejecución en el navegador. Milyonus ofrece un mayor número de puntos (478 vs 468) y añade un sistema de puntuación de atención, pero carece de la documentación y el soporte de Google. Apple Vision es una alternativa robusta pero está limitada al ecosistema iOS y no es de código abierto.

## Limitaciones y advertencias

- No se ha publicado documentación técnica detallada, ni especificaciones de entrenamiento, ni métricas de rendimiento; la fiabilidad del sistema no está verificada de forma independiente.
- Contradicción de licencia: el repositorio de HuggingFace indica MIT, pero el autor declara "closed-source" en LinkedIn. Esto puede generar problemas legales si se usa el modelo en proyectos comerciales.
- La descarga del modelo es 0 y tiene solo 1 like, lo que sugiere una adopción muy baja y una comunidad casi inexistente.
- No se especifica el tratamiento de sesgos en el dataset de entrenamiento, ni el comportamiento con caras de diferentes etnias, edades o condiciones de iluminación.
- El sistema de puntuación de atención puede ser impreciso y no debe usarse como herramienta de diagnóstico psicológico sin validación clínica.
- Al ser una solución en el navegador, el rendimiento puede variar significativamente entre dispositivos y navegadores, y no hay garantías de estabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/ayazelrico/Milyonus-Optic-Tracking-2.4
- Sitio web oficial: https://www.milyonus.com/optic-tracking
- GitHub (repositorio): https://github.com/milyonus/Milyonus-Optic-Tracking-2.4-Second-One
- Página personal del autor: https://www.ayazelrico.com/
- LinkedIn del autor: https://tr.linkedin.com/in/ayazelrico/tr
- Publicación de LinkedIn sobre el modelo: https://www.linkedin.com/posts/ayazhamzaaltay_your-mind-can-now-be-read-from-your-eyes-activity-7495906217219743744-irSj
