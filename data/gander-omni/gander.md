# Gander-Omni/Gander

## Resumen

Gander es un modelo de interacción omni de código abierto desarrollado por el equipo Gander-Omni. Está diseñado para mantener una conversación hablada y visual continua en tiempo real mientras ejecuta tareas de larga duración de forma asíncrona. El modelo combina un componente Thinker, que gestiona la percepción multimodal, el control de la conversación y la delegación de tareas, con un componente Talker, que genera voz de forma incremental. Su arquitectura parte del modelo base openbmb/MiniCPM-o-4_5 y añade una capa de orquestación temporal basada en unidades causales de un segundo.

El problema que resuelve es la limitación de los asistentes tradicionales, que operan mediante turnos discretos de texto o de voz. Gander unifica comunicación omni, interacción en tiempo real (incluyendo interrupciones y backchannels) y ejecución de tareas agénticas en un único sistema. Es relevante ahora porque acerca los modelos multimodales a una experiencia de interacción natural y continua, con soporte para audio, imagen, vídeo y llamadas a funciones. El modelo se libera con licencia Apache 2.0 y está designado para investigación en agentes interactivos y asistentes en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en MiniCPM-o-4_5 con componentes Thinker y Talker |
| Parametros totales | no disponible |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y onnx (segun tags del repositorio) |

## Arquitectura y entrenamiento

Gander organiza la interacción en unidades causales de un segundo. En cada unidad, las observaciones de audio y visual disponibles preceden a la decisión del modelo. El componente Thinker predice si debe escuchar, hablar, interrumpir o invocar una operación de tarea, y genera texto o llamadas estructuradas cuando es necesario. El componente Talker se condiciona en las representaciones del Thinker para sintetizar voz incrementalmente mediante tokens de voz S3 y un decodificador Token2wav.

Ambos componentes se inicializan desde MiniCPM-o-4.5 y se entrenan en dos etapas. El Thinker entrena el modelo de lenguaje y la proyección de audio durante una época y 8.407 pasos de optimización. El Talker entrena la proyección semántica y el decodificador de voz durante dos épocas y 3.246 pasos. Los datos de entrenamiento son una mezcla multimodal que abarca diálogo hablado, interacción full-duplex, comprensión de vídeo en streaming y ciclos de vida de tareas agénticas. La innovación técnica destacable es el uso de unidades temporales de un segundo con presupuestos de tokens (hasta 8 tokens léxicos por unidad de habla en el Thinker y 50 tokens S3 en el Talker) que permiten una decodificación sincronizada y un control de interrupción nativo.

## Capacidades

- Interacción de voz continua en modo full-duplex, con manejo de interrupciones y generación de backchannels.
- Comprensión streaming de imágenes y vídeo, con respuestas temporalmente fundamentadas en los eventos visuales.
- Delegación de tareas estructurada mediante function calling, incluyendo instrucciones de seguimiento, interacción de progreso y finalización.
- Generación incremental de voz sincronizada con la salida del Thinker, con sample rate de entrada de 16 kHz y de salida de 24 kHz.
- Entrada multimodal compuesta por texto, audio, imágenes y fotogramas de vídeo.
- Ejecución de tareas asíncronas mientras la conversación continúa, gracias al runtime de Gander.

## Casos de uso

- Atención al cliente automatizada con voz completa: el modelo mantiene conversaciones full-duplex, permite que el usuario interrumpa y genera respuestas habladas sin esperar turnos completos, lo que resulta adecuado para centros de llamadas o asistentes telefónicos.
- Monitorización de vídeo en tiempo real: Gander procesa fotogramas de vídeo de forma continua y responde verbalmente ante eventos detectados, útil en vigilancia o revisiones remotas de instalaciones.
- Asistentes de soporte técnico con delegación de tareas: el modelo puede invocar operaciones externas mediante function calling, informar del progreso y volver a la conversación mientras la tarea se ejecuta en segundo plano.
- Avatares y personajes virtuales interactivos: al combinar comprensión de audio y vídeo con síntesis de voz en streaming, permite avatares que conversan de forma natural y reaccionan a señales no verbales.
- Asistentes de accesibilidad para personas con discapacidad visual: interpretación en vivo de vídeo o del entorno, con respuestas habladas inmediatas y capacidad de interrumpir para pedir aclaraciones.
- Orquestación de flujos de trabajo complejos en entornos de producción: el runtime coordina la ejecución asíncrona de tareas mientras el modelo mantiene la interacción, permitiendo casos de uso como gestión de incidencias o generación de informes por voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de rendimiento, y el informe técnico enlazado no presenta resultados comparativos en el contenido accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. La configuración de ejemplo del runtime utiliza dos GPU, una para el Thinker y otra para el Talker desacoplado (`detached_talker_device: cuda:1`), lo que sugiere un despliegue con al menos dos dispositivos CUDA.
- Cabe en GPU de consumo: no se puede confirmar con los datos disponibles.
- Opciones de despliegue: el proyecto proporciona un runtime propio (Omni-Interaction-Agent) y es compatible con la librería Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados de forma nativa.
- Latencia y throughput: no disponible. El diseño de streaming apunta a respuestas en tiempo real, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Observaciones |
|---|---|
| Gander (este modelo) | Interacción omni, full-duplex, streaming de voz y vídeo, licencia Apache 2.0. |
| openbmb/MiniCPM-o-4_5 | Modelo base de Gander, multimodal pero sin el componente de interacción continua ni el runtime de tareas. |
| Modelos comparables | No se dispone de datos comparativos de rendimiento en la información proporcionada. |

## Limitaciones y advertencias

- El README del autor indica que las salidas pueden contener errores factuales o perceptuales, especialmente en condiciones de audio ambiguo, cambios visuales rápidos o dependencias temporales largas.
- Las aplicaciones deben validar las acciones externas delegadas, ya que el modelo no está diseñado para ejecutar tareas de alto impacto de forma autónoma sin supervisión.
- La cobertura de idiomas no está especificada, por lo que no se puede garantizar un comportamiento multilingüe completo.
- Los datos de entrenamiento y los benchmarks no se han hecho públicos, lo que dificulta evaluar su fiabilidad frente a alternativas.
- Es un modelo de investigación con cero descargas en HuggingFace en el momento de la consulta, lo que implica una adopción temprana y una comunidad reducida de usuarios.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en producción requiere evaluar los riesgos de alucinación y validar cada integración.

## Enlaces

- HuggingFace: https://huggingface.co/Gander-Omni/Gander
- GitHub: https://github.com/Omni-Interaction-Gander/Omni-Interaction-Agent
- Paper (arXiv): https://arxiv.org/abs/2609.08977
- Demo / project page: https://Omni-Interaction-Gander.github.io/Omni-Interaction-Agent
- Nota: el README indica que el dataset se publicará próximamente ("Coming Soon"), sin enlace disponible actualmente.
