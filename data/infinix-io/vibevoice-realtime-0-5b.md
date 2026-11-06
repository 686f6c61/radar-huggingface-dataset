# Infinix-io/VibeVoice-Realtime-0.5B

## Resumen

VibeVoice-Realtime-0.5B es un modelo de síntesis de voz (text-to-speech) en tiempo real desarrollado por Microsoft Research, distribuido en Hugging Face bajo la organización Infinix-io. Se trata de una variante ligera de la familia VibeVoice, diseñada específicamente para generación de voz con entrada de texto en streaming: el modelo puede empezar a emitir audio audible en aproximadamente 300 ms desde que recibe los primeros tokens de texto, lo que permite acoplarlo a la salida incremental de un LLM. El modelo base del componente lingüístico es Qwen2.5-0.5B, sobre el que se añaden un tokenizador acústico y una cabeza de decodificación basada en difusión.

La arquitectura combina un LLM transformer (Qwen2.5-0.5B) con un tokenizador acústico derivado de una variante σ-VAE (propuesta en LatentLM) que opera a una tasa de trama ultrabaja de 7,5 Hz, logrando un downsampling de 3200x sobre audio de entrada a 24 kHz. La generación acústica se realiza mediante una cabeza de difusión ligera de 4 capas (~40M parámetros) condicionada por los estados ocultos del LLM, usando DDPM con Classifier-Free Guidance y DPM-Solver en inferencia.

El modelo está pensado principalmente para inglés, aunque el autor reporta capacidad multilingüe limitada y proporciona pesos para nueve idiomas adicionales (alemán, francés, italiano, japonés, coreano, neerlandés, polaco, portugués y español). Soporta únicamente un hablante por generación y está orientado a usos de investigación según la model card, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen2.5-0.5B) + tokenizador acústico σ-VAE + cabeza de difusión (DDPM) |
| Parametros totales | 1.017.626.722 (~1.02B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenado con curriculum hasta 8k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (principal); alemán, francés, italiano, japonés, coreano, neerlandés, polaco, portugués y español (exploratorio) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño intercalado y ventaneado: codifica incrementalmente los fragmentos de texto entrantes mientras, en paralelo, continúa la generación de latentes acústicos basada en difusión a partir del contexto previo. A diferencia de las variantes largas multi-hablante de VibeVoice, esta versión en streaming elimina el tokenizador semántico y se apoya únicamente en un tokenizador acústico eficiente a 7,5 Hz. El tokenizador acústico se basa en una variante σ-VAE con estructura encoder-decoder simétrica en espejo de 7 etapas de bloques transformer modificados, con un decodificador de ~340M parámetros. La cabeza de difusión es un módulo ligero de 4 capas (~40M parámetros) que predice las características del VAE acústico mediante un proceso DDPM, usando CFG y DPM-Solver en inferencia.

El entrenamiento se organiza en dos fases: preentrenamiento del tokenizador acústico y, posteriormente, entrenamiento de VibeVoice con el tokenizador congelado, actualizando solo los parámetros del LLM y de la cabeza de difusión. Se emplea una estrategia de curriculum learning para la longitud de secuencia de entrada (de 4k a 8k tokens). El LLM base es Qwen2.5-0.5B, que aporta su propio tokenizador de texto. La model card no detalla el volumen total de tokens de entrenamiento ni la composición exacta del dataset, ni menciona explícitamente etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz en tiempo real con latencia de primera señal audible de ~300 ms (dependiente del hardware).
- Entrada de texto en streaming: puede comenzar a hablar antes de recibir la respuesta completa, lo que permite acoplarlo a la salida incremental de cualquier LLM.
- Generación de voz de formato largo robusta, con capacidad de generar hasta ~10 minutos de audio dada la ventana de contexto de 8k.
- Zero-shot TTS: clonación de voz a partir de audio de referencia (evaluado en LibriSpeech y SEED).
- Soporte multilingüe exploratorio en nueve idiomas adicionales al inglés (alemán, francés, italiano, japonés, coreano, neerlandés, polaco, portugués y español).
- Soporte de un único hablante por generación (no multi-hablante).
- Integración con la librería transformers y endpoints compatibles.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede conectarse a la salida token a token de un LLM y empezar a hablar en ~300 ms, reduciendo la percepción de latencia en asistentes telefónicos o de escritorio.
- Narración de flujos de datos en directo: adecuado para leer en voz alta actualizaciones de mercados, alertas o logs en streaming, ya que procesa texto incremental sin esperar al cierre de la respuesta.
- Lectura de respuestas de chatbots de atención al cliente: al integrarse con un LLM de chat, permite que el usuario escuche la respuesta mientras se sigue generando, mejorando la experiencia en contextos de manos libres.
- Accesibilidad y lectura de contenido: conversión de artículos, correos o documentos largos a audio (hasta ~10 minutos por generación) con voz natural y clonable.
- Generación de audiolibros y pódcast de formato corto-medio: la ventana de 8k y la generación de ~10 minutos permiten producir segmentos narrativos coherentes con una sola pasada.
- Prototipado de interfaces de voz para investigación: su tamaño (~1B parámetros) y licencia MIT facilitan experimentación académica y despliegues locales sin dependencia de APIs propietarias.
- Dooblaje y localización exploratoria: aunque el inglés es el idioma principal, los pesos para español y otros idiomas permiten evaluar casos de localización con validación humana posterior.

## Benchmarks y rendimiento

Resultados zero-shot TTS reportados en la model card.

LibriSpeech test-clean:

| Modelo | WER (%) ↓ | Speaker Similarity ↑ |
|---|---|---|
| VALL-E 2 | 2,40 | 0,643 |
| Voicebox | 1,90 | 0,662 |
| MELLE | 2,10 | 0,625 |
| VibeVoice-Realtime-0.5B | 2,00 | 0,695 |

SEED test-en:

| Modelo | WER (%) ↓ | Speaker Similarity ↑ |
|---|---|---|
| MaskGCT | 2,62 | 0,714 |
| Seed-TTS | 2,25 | 0,762 |
| FireRedTTS | 3,82 | 0,460 |
| SparkTTS | 1,98 | 0,584 |
| CosyVoice2 | 2,57 | 0,652 |
| VibeVoice-Realtime-0.5B | 2,05 | 0,633 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; con ~1.02B parámetros en safetensors (repo de 2,0 GB), una estimación razonable en fp16 ronda los 2-3 GB, pero el dato no está confirmado por el autor.
- GPU recomendadas: no disponible; el autor indica que la latencia de ~300 ms depende del hardware.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con ≥6-8 GB de VRAM (p. ej. RTX 3060, RTX 4060, RTX 4090), aunque no se confirma en la documentación disponible.
- Opciones de despliegue: transformers (librería oficial), endpoints compatibles; el autor referencia un ejemplo de demo en tiempo real vía websocket en el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia de primera señal audible de ~300 ms (dependiente del hardware); throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech (%) | Speaker Sim. | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VibeVoice-Realtime-0.5B | ~1,02B | 8k | 2,00 | 0,695 | MIT | Hugging Face |
| VibeVoice-1.5B | 1,5B (no confirmado) | 64k | no disponible | no disponible | no disponible | Hugging Face (microsoft) |
| VibeVoice-Large | no disponible | 32k | no disponible | no disponible | no disponible | Hugging Face (microsoft) |
| VALL-E 2 | no disponible | no disponible | 2,40 | 0,643 | no disponible | no disponible |
| CosyVoice2 | no disponible | no disponible | 2,57 (SEED) | 0,652 (SEED) | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado principalmente para inglés; el resto de idiomas (incluido el español) pueden producir resultados impredecibles según el propio autor.
- Solo soporta un hablante por generación; no es adecuado para diálogos multi-hablante (para ello existen VibeVoice-1.5B y VibeVoice-Large).
- Uso previsto limitado a investigación según la sección "Responsible Usage" de la model card; no se garantiza robustez para producción sin validación adicional.
- Riesgo de alucinación o artefactos acústicos en textos ambiguos, largos o fuera de distribución; no se documentan mitigaciones específicas.
- Posibles sesgos de voz y prosodia derivados de los datos de entrenamiento (no detallados en la model card).
- Licencia MIT permite uso comercial, pero la model card restringe explícitamente usos que infrinjan leyes aplicables o la propia licencia, y prohíbe generar transcripciones de texto (texto no especificado en el fragmento disponible).
- No se especifican tipos de cuantización soportados ni requisitos de hardware oficiales, lo que complica el dimensionamiento de despliegues.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción temprana y escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/VibeVoice-Realtime-0.5B
- Informe técnico: https://arxiv.org/abs/2508.19205
- Paper LatentLM (σ-VAE): https://arxiv.org/pdf/2412.08635
- Página del proyecto: https://microsoft.github.io/VibeVoice
- Código: https://github.com/microsoft/VibeVoice
- Documentación del modelo realtime: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-realtime-0.5b.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/anycoderapps/VibeVoice-Realtime-0.5B
- Colección VibeVoice en Hugging Face: https://huggingface.co/collections/microsoft/vibevoice
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
