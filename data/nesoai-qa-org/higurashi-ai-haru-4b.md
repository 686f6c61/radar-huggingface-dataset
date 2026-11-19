# nesoai-qa-org/higurashi-ai-Haru-4B

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo en full-duplex, desarrollado por higurashi-ai (publicado en Hugging Face bajo la organización nesoai-qa-org). Su particularidad es que escucha y habla simultáneamente, como en una llamada telefónica, en lugar de alternar turnos de escucha y respuesta. Está construido sobre un backbone de texto Qwen3.5-4B (32 capas, dimensión oculta 2560) al que se añaden proyecciones de audio de entrada, una cabeza MeanFlow para generar audio y un códec acústico causal.

El modelo opera a 7,5 Hz: cada 133 ms procesa un frame del audio del usuario y produce un frame de su propio audio y texto. El audio se representa como un latente continuo de 64 dimensiones por frame, generado en un solo paso de muestreo mediante una cabeza MLP de 4 capas con MeanFlow, sin tokens de audio discretos ni transformer de audio separado. Soporta nueve idiomas y permite controlar el personaje mediante una tarjeta de texto y la voz mediante un clip de referencia.

Se distribuye como modelo base preentrenado para investigación, con licencia Apache 2.0. Es relevante porque aborda el diálogo por voz de baja latencia de forma nativa (sin pipeline ASR-LLM-TTS en cascada) y con un único modelo, lo que simplifica la arquitectura de sistemas conversacionales en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de texto Qwen3.5-4B) + proyecciones de audio + cabeza MLP MeanFlow + códec acústico causal |
| Parametros totales | 5.270.000.897 (5,27 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Haru-4B combina un modelo de lenguaje de texto (Qwen3.5-4B, 32 capas, hidden size 2560) con un códec acústico VibeVoice causal que opera a 24 kHz con 3200 muestras por latente. En cada frame de 133 ms (7,5 Hz), el latente de audio del usuario, el token de texto previo del modelo y el latente de audio previo del modelo se suman en una única posición del modelo de lenguaje. La salida predice simultáneamente el siguiente token de texto y el siguiente latente de audio. Este diseño permite full-duplex nativo: la escucha y el habla no se bloquean mutuamente.

La generación de audio se realiza mediante una cabeza MLP de 4 capas con muestreo MeanFlow en un solo paso, con escala de guía entre 1 y 2 (por defecto 1,5). No hay transformer de audio separado ni tokens de audio discretos. El control de personaje se ejerce mediante una tarjeta de texto con formato fijo (system prompt) y el control de voz mediante un clip de referencia de un único hablante de entre 3 segundos y 3 minutos. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Diálogo hablado continuo full-duplex: escucha y habla al mismo tiempo a 7,5 Hz (un frame cada 133 ms).
- Generación de audio y texto simultánea en cada frame: el modelo produce su propio audio y la transcripción textual correspondiente.
- Speech-to-speech y audio-to-audio nativo (pipeline `audio-to-audio`).
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Control de personaje mediante tarjeta de texto (character card) con formato fijo.
- Control de voz mediante clip de referencia de un solo hablante (3 s a 3 min).
- Conversación natural multi-turno con baja latencia.
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni modo de razonamiento explícito.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede mantener una conversación hablada continua con latencia de frame de 133 ms, adecuado para atención telefónica automatizada donde la interrupción y el solapamiento de habla son frecuentes.
- Práctica de idiomas conversacional: con soporte para nueve idiomas y control de personaje, puede configurarse como interlocutor para práctica de conversación oral en español, inglés, japonés, etc.
- Investigación en interacción humano-máquina full-duplex: sirve como base para estudiar modelos que escuchan y hablan simultáneamente, con una implementación PyTorch y MLX disponible.
- Aplicaciones de accesibilidad: interfaz de voz natural para usuarios con movilidad reducida, con capacidad de interrumpir y ser interrumpido como en una conversación humana.
- Prototipos de personajes conversacionales: la combinación de tarjeta de personaje y clip de voz permite crear agentes con personalidad y timbre definidos para demos o instalaciones interactivas.
- Evaluación de latencia en despliegues locales: con aproximadamente 12 GB de memoria en GPU NVIDIA, puede ejecutarse en un servidor local para medir latencia y throughput en condiciones reales.
- Investigación en generación de audio continuo: el esquema de latentes de 64 dimensiones con cabeza MeanFlow de un solo paso es un objeto de estudio para métodos de síntesis de voz sin tokens discretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB en GPU NVIDIA según la model card (pesos en bfloat16, 5,27 mil millones de parámetros, repo de 10,6 GB).
- GPU recomendadas: NVIDIA con al menos 12 GB de memoria (la model card no especifica modelos concretos como A100, H100 o RTX 4090).
- ¿Cabe en GPU de consumo? No se especifica en la información disponible; el requisito de ~12 GB es compatible con varias GPU de consumo de gama alta, pero no se confirma.
- Opciones de despliegue: servidor PyTorch incluido en el repositorio (`python -m haru.server`), implementación MLX con app nativa para macOS, y plugin para servir con vLLM-Omni.
- Latencia: frame de 133 ms (7,5 Hz); se recomienda audio por cable, ya que Bluetooth añade 100 ms o más.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Full-duplex | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Haru-4B | 5,27 mil millones | no disponible | Sí, 7,5 Hz | 9 | Apache 2.0 | Hugging Face, GitHub, MLX, vLLM-Omni |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de diálogo hablado full-duplex con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: mantiene conversaciones naturales pero no es una fuente fiable de hechos y no sigue instrucciones como un asistente.
- Riesgo de alucinación: al no ser un modelo ajustado para asistencia, puede generar afirmaciones incorrectas con fluidez.
- Puede imitar la voz de un clip de referencia; solo deben usarse voces sobre las que se tenga derecho de uso.
- No se han documentado sesgos conocidos ni limitaciones específicas de contexto o idioma más allá de los nueve idiomas listados.
- La longitud de contexto no está especificada, lo que limita la planificación de despliegues con conversaciones muy largas.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el modelo se publica para investigación y no se garantiza su idoneidad en producción.
- El rendimiento depende del hardware de audio: dispositivos Bluetooth añaden 100 ms o más de latencia.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/nesoai-qa-org/higurashi-ai-Haru-4B
- Código: https://github.com/higurashi-ai/Haru
- Blog técnico: https://blog.higurashi.ai/melte/haru4b/
- Blog técnico (japonés): https://blog.higurashi.ai/melte/haru4b-ja/
