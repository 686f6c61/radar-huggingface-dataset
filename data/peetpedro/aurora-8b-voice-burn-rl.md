# PeetPedro/aurora-8b-voice-burn-rl

## Resumen

AURORA-8b-voice-burn-rl es un artefacto de investigación publicado por el usuario PeetPedro en Hugging Face. A pesar del sufijo "8b" en su nombre, no se trata de un modelo de lenguaje de 8 mil millones de parámetros, sino de una política de control de prosodia entrenada mediante aprendizaje por refuerzo (GRPO) sobre un ancla de síntesis de voz neuronal. El componente generativo real es Edge0/Audio8-TTS-Realistic-0.6b, un modelo TTS de 0,6 mil millones de parámetros con arquitectura DualAR y códec neural DAC a 44,1 kHz. La política RL se implementa en Rust puro con la librería `tracel-ai/burn` 0.22 y se integra con `songbird` para cifrado DAVE v1 MLS E2EE en Discord.

El sistema está diseñado como un lector de noticias continuo 24/7 que emite en un canal de voz de Discord, consumiendo fuentes como Hacker News, Reddit, BBC World News, Ars Technica, TechCrunch y The Verge. Cada rollout se vuelca a un dataset bidireccional en Hugging Face (PeetPedro/voice-finetuning), cerrando un bucle de entrenamiento continuo. La relevancia de este artefacto es más experimental que productiva: documenta un pipeline completo de RL aplicado a prosodia TTS en un entorno real de despliegue, con recompensas definidas por métricas objetivas de audio y por la interacción de oyentes en vivo.

El modelo se publicó el 1 de noviembre de 2026, cuenta con 0 descargas y 1 like en el momento de redactar esta ficha, y está etiquetado únicamente para inglés. La licencia es Apache 2.0. No se han publicado resultados de benchmarks ni métricas cuantitativas de calidad de voz o de recompensa acumulada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política RL GRPO en Rust (`tracel-ai/burn` 0.22) sobre ancla TTS DualAR (`ArkttsModel`) con códec DAC 44,1 kHz |
| Parámetros totales | 0,6B en el componente TTS base; la política RL no se especifica en parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `burn_rl_policy.json` (política RL); pesos del TTS base en el repositorio Edge0/Audio8-TTS-Realistic-0.6b, formato no especificado |

## Arquitectura y entrenamiento

El sistema se compone de tres capas. La primera es la síntesis de voz neuronal primaria: Edge0/Audio8-TTS-Realistic-0.6b, un modelo de 0,6B parámetros con arquitectura DualAR (`ArkttsModel`) y códec neural DAC a 44,1 kHz, servido vía Hugging Face ZeroGPU en el Space `edge0-audio8-tts-realistic-0-6b.hf.space`. Este componente soporta clonación de voz zero-shot con voz de referencia. Como respaldo neuronal se utiliza `gemini-2.5-flash-preview-tts` con las voces Aoede, Kore y Puck.

La segunda capa es la política de prosodia entrenada con GRPO, implementada en Rust puro sobre `tracel-ai/burn` 0.22. La recompensa se evalúa en enteros Q15 (`reward_q15` en el rango [0, 32768]) y agrega cuatro señales: fidelidad de duración del audio, ausencia de clipping y relación señal-ruido adecuada, diversidad de portales de noticias y engagement de oyentes en vivo en el canal Lounge de Discord. La tercera capa es el bucle continuo de lectura multi-portal 24/7, que ingiere fuentes RSS y APIs de noticias y vuelca cada rollout al dataset PeetPedro/voice-finetuning, estableciendo un ciclo bidireccional entre despliegue y datos de entrenamiento.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset más allá de las fuentes citadas, ni si se aplicaron etapas de RLHF o DPO adicionales sobre el TTS base.

## Capacidades

- Síntesis de voz (TTS) en inglés con clonación de voz zero-shot mediante voz de referencia.
- Control de prosodia aprendido por refuerzo: duración, SNR, ausencia de clipping y diversidad de contenido.
- Lectura continua 24/7 de noticias desde Hacker News, Reddit (r/technology, r/LocalLLaMA, r/worldnews), BBC World News, Ars Technica, TechCrunch y The Verge.
- Emisión en canal de voz de Discord con cifrado DAVE v1 MLS E2EE mediante `songbird`.
- Evaluación de recompensa en aritmética entera Q15, adecuada para despliegue en Rust sin dependencias de punto flotante pesadas.
- Volcado automático de rollouts a un dataset de Hugging Face para fine-tuning continuo.
- Respaldo neuronal vía `gemini-2.5-flash-preview-tts` con tres voces predefinidas (Aoede, Kore, Puck).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura automatizada de noticias tecnológicas en comunidades de Discord: el sistema ingiere feeds de Hacker News y r/LocalLLaMA y los emite como audio en un canal de voz, con la política RL ajustando la duración y claridad de cada segmento para mantener la atención de los oyentes.
- Ancla de voz persistente para servidores comunitarios: al operar 24/7 con cifrado DAVE v1 MLS E2EE, puede mantener presencia continua en un canal de voz sin intervención humana, sirviendo como hilo musical informativo o de acompañamiento.
- Investigación en RL aplicado a prosodia TTS: el artefacto documenta un pipeline completo de GRPO con recompensas multi-señal (duración, SNR, diversidad, engagement), útil como referencia para quienes diseñen funciones de recompensa en dominios de audio.
- Generación de datasets de voz a escala: cada rollout se vuelca a PeetPedro/voice-finetuning, lo que permite construir corpus de audio etiquetado con métricas de recompensa para futuros fine-tunings de modelos TTS.
- Prototipado de agentes de voz en Rust: la implementación con `tracel-ai/burn` y `songbird` sirve como base para equipos que quieran construir agentes de audio en Rust sin salir del ecosistema nativo.
- Clonación de voz zero-shot para locuciones personalizadas: mediante el componente Edge0/Audio8-TTS-Realistic-0.6b, se puede generar audio con una voz de referencia concreta para podcasts, avisos o demos, sujeto a las consideraciones éticas y legales del clonado de voz.
- Monitorización de medios en tiempo real: el lector multi-portal puede adaptarse para resumir y locutar titulares de última hora de BBC World News o Ars Technica en un canal interno de una redacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MOS (Mean Opinion Score), WER, latencia de síntesis, throughput de rollouts ni curvas de recompensa durante el entrenamiento GRPO.

## Requisitos de hardware

- El componente TTS base (0,6B parámetros) se sirve en Hugging Face ZeroGPU, por lo que la inferencia primaria no requiere hardware local.
- La política RL en Rust (`tracel-ai/burn` 0.22) es ligera y puede ejecutarse en CPU; no se especifican requisitos de VRAM para la política.
- El respaldo vía `gemini-2.5-flash-preview-tts` es una API remota y no consume hardware local.
- No se documentan requisitos de VRAM para despliegue local del TTS base, ni GPU recomendadas (A100, H100, RTX 4090 u otras).
- Opciones de despliegue: el sistema está atado a Hugging Face Spaces (ZeroGPU) y a la API de Gemini; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- No se publican estimaciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PeetPedro/aurora-8b-voice-burn-rl | 0,6B (TTS base) + política RL | No disponible | TTS + control de prosodia RL | Apache 2.0 | Hugging Face, 0 descargas |
| Edge0/Audio8-TTS-Realistic-0.6b | 0,6B | No disponible | TTS zero-shot | No disponible en la información | Hugging Face (modelo base) |
| scryptiam/Aurora-8B | 8B | No disponible | Roleplay y conversación (LLM) | No disponible en la información | Hugging Face |

La comparación con scryptiam/Aurora-8B es meramente nominal: comparten el nombre "Aurora" pero son artefactos de naturaleza distinta (TTS con RL frente a LLM de roleplay basado en Llama 3.1). No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas TTS como XTTS, Bark, StyleTTS 2 o Kokoro.

## Limitaciones y advertencias

- El nombre "aurora-8b" es engañoso: el componente generativo real es de 0,6B parámetros, no de 8B. Cualquier evaluación que asuma un LLM de 8B será incorrecta.
- El modelo solo soporta inglés; no hay evidencia de capacidades multilingües.
- El sistema depende de servicios externos: Hugging Face ZeroGPU para el TTS primario y la API de Gemini para el respaldo. Una caída de estos servicios deja el sistema sin voz.
- El despliegue está fuertemente acoplado a Discord (`songbird`, DAVE v1 MLS E2EE) y a un canal concreto (`Lounge`), lo que limita su reutilización fuera de ese entorno.
- La función de recompensa incluye el engagement de oyentes en un servidor de Discord específico, lo que introduce un sesgo hacia las preferencias de esa comunidad y no garantiza calidad de voz generalizable.
- Riesgo de alucinación y errores de contenido: el sistema lee noticias de fuentes externas sin verificación factual documentada; no se especifica ningún mecanismo de filtrado o corrección.
- El clonado de voz zero-shot plantea riesgos de suplantación y uso indebido; la licencia Apache 2.0 no exime del cumplimiento de normativas de protección de datos y derechos de imagen.
- No hay benchmarks, métricas de calidad ni curvas de entrenamiento publicadas, por lo que no es posible evaluar objetivamente la mejora aportada por el RL frente al TTS base.
- El repositorio tiene 0 descargas y 1 like, y se actualizó 14 minutos después de su creación, lo que sugiere un artefacto experimental sin validación externa.
- La licencia Apache 2.0 se aplica al artefacto publicado, pero el modelo base Edge0/Audio8-TTS-Realistic-0.6b y el respaldo Gemini tienen sus propias condiciones que deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeetPedro/aurora-8b-voice-burn-rl
- Modelo base TTS: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Space del TTS base: https://edge0-audio8-tts-realistic-0-6b.hf.space
- Dataset de fine-tuning: https://huggingface.co/datasets/PeetPedro/voice-finetuning
- Librería Burn: https://github.com/tracel-ai/burn
- Canal de Discord del proyecto: https://discord.gg/UjufapydH
- Modelo homónimo no relacionado: https://huggingface.co/scryptiam/Aurora-8B
