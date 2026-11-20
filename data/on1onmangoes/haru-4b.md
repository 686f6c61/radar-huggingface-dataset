# on1onmangoes/Haru-4B

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo y full-duplex, desarrollado por el equipo de higurashi-ai y publicado en Hugging Face bajo el identificador on1onmangoes/Haru-4B. Su particularidad es que escucha y habla simultáneamente, como en una llamada telefónica: cada 133 ms (7,5 Hz) procesa un frame de audio del usuario y emite un frame de audio y texto propios, sin esperar a que el interlocutor termine de hablar. Esto lo diferencia de los pipelines clásicos de speech-to-speech por turnos (VAD + ASR + LLM + TTS), que introducen latencias acumuladas de cientos de milisegundos.

El modelo combina un backbone de lenguaje Qwen3.5-4B (32 capas, dimensión oculta 2560) con un codec de audio causal basado en el tokenizador acústico de VibeVoice (24 kHz, 3200 muestras por latente) y una cabeza MLP de 4 capas con muestreo MeanFlow que genera el latente de audio en un solo paso. No utiliza tokens de audio discretos ni un transformer de audio separado: el audio del usuario, el audio del modelo y el texto del modelo se suman en una única posición del modelo de lenguaje.

Se distribuye como modelo base preentrenado orientado a investigación, con licencia Apache 2.0 y soporte para nueve idiomas (inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano). Su relevancia actual radica en que aborda la latencia y la naturalidad conversacional en un único modelo, algo que hasta ahora requería arquitecturas cascadas o sistemas propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) + codec de audio causal VibeVoice + cabeza MLP MeanFlow |
| Parametros totales | 5.270.000.897 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Haru-4B es un modelo full-duplex nativo a 7,5 Hz. En cada frame de 133 ms, el modelo recibe el latente de audio del usuario, el token de texto previo del propio modelo y su latente de audio previo; los tres se suman en una sola posición de entrada del modelo de lenguaje. La salida del backbone predice simultáneamente el siguiente token de texto y el siguiente latente de audio. El audio se representa como un latente de 64 dimensiones por frame, generado por una cabeza MLP de 4 capas con muestreo MeanFlow en un único paso de muestreo (guidance scale entre 1 y 2, por defecto 1,5), sin transformer de audio independiente ni tokens de audio discretos.

El codec de audio es el tokenizador acústico de VibeVoice, causal, a 24 kHz, con 3200 muestras por latente. El control de personaje se realiza mediante una tarjeta de texto con formato fijo (system prompt) y el control de voz mediante un clip de referencia de 3 segundos a 3 minutos de un único hablante. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Diálogo hablado full-duplex continuo: escucha y habla al mismo tiempo, con frames de 133 ms y sin esperar al final del turno del usuario.
- Generación conjunta de audio y texto en cada frame, con salida de 3200 muestras a 24 kHz por paso.
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Control de personaje mediante tarjeta de texto con formato fijo (system prompt).
- Control de voz mediante clip de referencia (voice cloning condicionado a un hablante, 3 s a 3 min).
- Conversación natural multi-turno mantenida de forma continua.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta visión, audio de entrada más allá del flujo conversacional, ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Atención al cliente telefónica: el modelo puede mantener una conversación de voz continua y natural con latencia de frame de 133 ms, adecuado para sustituir menús IVR por agentes conversacionales en llamadas reales.
- Asistentes de voz para dispositivos de manos libres: al ser full-duplex, permite interrupciones y solapamiento de habla, lo que encaja en altavoces inteligentes, wearables y sistemas de automoción.
- Práctica de idiomas: con control de personaje y voz de referencia, se puede configurar un interlocutor nativo en cualquiera de los nueve idiomas soportados para conversación guiada.
- Investigación en interacción humano-máquina: sirve como base para estudiar dinámicas de turno, solapamiento y barge-in en diálogo hablado, al ser un modelo base preentrenado.
- Prototipos de agentes de voz en tiempo real: integrable mediante el plugin de vLLM-Omni del repositorio para servir sesiones duplex en infraestructura con GPU.
- Aplicaciones de accesibilidad: conversación por voz continua para usuarios que requieren interacción manos libres, con capacidad de respuesta inmediata.
- Demos y aplicaciones de escritorio en macOS: el repositorio incluye una implementación MLX con app nativa, útil para prototipado local en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB en bfloat16, según la model card (para el servidor de referencia con GPU NVIDIA).
- GPU recomendadas: NVIDIA con al menos 12 GB de memoria; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo con 12 GB o más de VRAM en bfloat16; no se documentan requisitos para cuantizaciones inferiores.
- Opciones de despliegue: servidor propio del repositorio (`python -m haru.server`), plugin para vLLM-Omni, e implementación MLX con app nativa para macOS.
- Latencia: frame de 133 ms (7,5 Hz) por diseño; se recomienda audio por cable, ya que Bluetooth añade 100 ms o más.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. A continuación se indica lo que se conoce de Haru-4B frente a categorías equivalentes, sin cifras de rendimiento:

| Modelo | Parametros | Contexto | Full-duplex | Idiomas | Licencia |
|---|---|---|---|---|---|
| Haru-4B | 5,27 B | no disponible | Sí, 7,5 Hz | 9 | Apache 2.0 |
| Modelos speech-to-speech por turnos (cascada ASR+LLM+TTS) | variable | variable | No | variable | variable |
| Modelos de audio propietarios | no disponible | no disponible | parcial | variable | propietaria |

No se dispone de información suficiente para comparar parámetros, contexto, rendimiento y disponibilidad con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: mantiene conversaciones naturales, pero no es una fuente fiable de hechos y no sigue instrucciones como un asistente al uso.
- Riesgo de alucinación en el contenido textual y de respuestas factualmente incorrectas.
- Puede imitar la voz del clip de referencia: solo debe usarse con voces sobre las que se tenga derecho de uso.
- No se documentan sesgos conocidos ni limitaciones específicas de contexto o idioma más allá de los nueve idiomas listados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se publica como base de investigación y no se garantiza su fiabilidad en producción.
- El rendimiento depende de la calidad del audio: se recomienda micrófono y auriculares por cable; los dispositivos Bluetooth añaden latencia.
- No se documentan cuantizaciones oficiales ni soporte de tool calling, lo que limita su integración en pipelines agénticos.

## Enlaces

- Hugging Face: https://huggingface.co/on1onmangoes/Haru-4B
- Código: https://github.com/higurashi-ai/Haru
- Blog técnico: https://blog.higurashi.ai/melte/haru4b/
- Blog técnico en japonés: https://blog.higurashi.ai/melte/haru4b-ja/
