# aurateam/AURA_2

## Resumen

AURA 2.0 es un modelo de lenguaje para vídeo en streaming desarrollado por el equipo AURA (aurateam), construido como un ajuste fino del modelo base Qwen/Qwen3.5-9B. Su propuesta central es ir "más allá de responder": el modelo puede iniciar conversaciones de forma proactiva, invocar herramientas basadas en el flujo de vídeo en directo y fundamentar sus interacciones en objetos y regiones concretas de los fotogramas. Frente a los modelos de vídeo tradicionales, que responden a preguntas sobre un clip ya cerrado, AURA 2.0 está diseñado para operar sobre una señal continua y decidir cuándo intervenir.

El checkpoint publicado tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y se distribuye en formato compressed-tensors, con un tamaño de repositorio de 18,8 GB. Está entrenado y evaluado principalmente en inglés y chino, y se publica bajo licencia CC BY-NC 4.0, lo que restringe su uso a investigación no comercial.

Su relevancia actual radica en la combinación de tres capacidades poco habituales en modelos de este tamaño: iniciativa conversacional (speak first), tool calling anclado al stream de vídeo y grounding espacial en regiones de la imagen. El modelo se acompaña de un informe técnico en arXiv (2611.17048), una página de proyecto y un repositorio de código, lo que facilita su reproducción y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); modalidad vídeo en streaming |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en formato compressed-tensors; niveles concretos no disponibles |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | CC BY-NC 4.0 (solo investigación, no comercial) |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

AURA 2.0 parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9,4 mil millones de parámetros, y lo ajusta para el dominio de vídeo en streaming. La model card describe el resultado como un "streaming video language model" capaz de iniciar conversaciones, invocar herramientas a partir del directo y fundamentar interacciones en objetos y regiones de los fotogramas. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable es el enfoque "speak first": el modelo no se limita a responder a una consulta, sino que aprende a decidir cuándo intervenir de forma proactiva sobre una señal continua. A esto se suma el tool calling condicionado al contenido del stream y el grounding espacial (referencia a objetos y regiones concretas). Los pesos se distribuyen en formato compressed-tensors, orientado a reducir el coste de almacenamiento e inferencia. El resto de detalles de arquitectura y entrenamiento (atención, decodificación especulativa, datos) no están disponibles en la información consultada.

## Capacidades

- Comprensión de vídeo en streaming: procesa una señal de vídeo continua en lugar de clips cerrados.
- Iniciativa conversacional: puede iniciar el diálogo sin una pregunta explícita del usuario.
- Tool calling basado en el directo: invoca herramientas a partir de lo que ocurre en el stream.
- Grounding en objetos y regiones: referencia y localiza elementos concretos de los fotogramas.
- Razonamiento multi-paso orientado a agentes sobre vídeo.
- Capacidades multilingües limitadas a inglés y chino.
- Generación de texto y diálogo multi-turno (heredadas del modelo base Qwen3.5-9B).

## Casos de uso

- Asistencia en directos interactivos: el modelo observa el stream y decide cuándo intervenir para avisar de eventos relevantes, aprovechando su capacidad de iniciativa conversacional.
- Moderación y alertas en vídeo en tiempo real: detecta objetos o regiones concretas mediante grounding y dispara avisos o acciones automáticas.
- Agentes con herramientas sobre vídeo: integra el stream con APIs externas (por ejemplo, consultas a bases de datos o servicios) mediante tool calling condicionado al contenido visual.
- Accesibilidad audiovisual: describe en inglés o chino lo que ocurre en un directo y responde a preguntas del usuario sobre objetos concretos.
- Análisis de retransmisiones deportivas o de eventos: localiza regiones y objetos en los fotogramas para generar comentarios o resúmenes proactivos.
- Investigación en modelos de vídeo conversacionales: sirve como checkpoint de referencia para estudiar iniciativa, tool calling y grounding en streaming, dado su carácter research-only.
- Prototipos de asistencia remota: un operador humano o un sistema automatizado recibe del modelo referencias espaciales a objetos del vídeo para guiar tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros, en FP16 se requieren aproximadamente 19 GB de VRAM; en cuantizaciones de 8 bits, en torno a 10-11 GB; en 4 bits, alrededor de 6-7 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o cuantización de 8 bits.
- ¿Cabe en GPU de consumo? Sí, en GPUs con 16-24 GB de VRAM usando cuantización (por ejemplo, RTX 4080/4090); en 4 bits podría caber en GPUs de 8-12 GB.
- Opciones de despliegue: al estar en formato compressed-tensors, encaja con ecosistemas que soportan dicho formato (por ejemplo, vLLM); para llama.cpp/Ollama sería necesario convertir los pesos, algo no documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AURA 2.0 | 9,4 B | No disponible | Vídeo en streaming + texto | CC BY-NC 4.0 | Hugging Face |
| Qwen3.5-9B (base) | ~9 B | No disponible | Texto | Según Qwen (no disponible en la información) | Hugging Face |
| Alternativas de vídeo-LLM de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre AURA 2.0 y otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: uso restringido a investigación no comercial; no se permite uso comercial sin autorización.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- No se han publicado benchmarks ni métricas de rendimiento, por lo que la calidad real no puede contrastarse.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al inferir eventos o regiones en vídeo.
- Posibles sesgos derivados de los datos de entrenamiento, no documentados en la información disponible.
- La longitud de contexto no está especificada, lo que dificulta planificar despliegues con streams largos.
- El formato compressed-tensors puede requerir herramientas específicas; la conversión a otros formatos no está documentada.
- El modelo está marcado como research-only; no se recomienda su uso en producción sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/aurateam/AURA_2
- Página del proyecto: https://aurateam2026.github.io/Aura-2.0/
- Repositorio GitHub: https://github.com/aurateam2026/Aura2.0
- Informe técnico (arXiv): https://arxiv.org/abs/2611.17048
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
