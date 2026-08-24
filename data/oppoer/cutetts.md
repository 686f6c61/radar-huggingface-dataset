# OPPOer/CuteTTS

## Resumen

CuteTTS es un sistema de síntesis de voz (text-to-speech) compacto desarrollado por OPPO, concretamente por el laboratorio OPPO Mente Lab. El modelo resuelve el problema de generar voz natural con clonación de voz zero-shot a baja latencia, empleando un enfoque de autoregresión continua sobre latentes causales de un VAE, autoregresión por parches y flow-matching con guía destilada. Con aproximadamente 230 millones de parámetros, es significativamente más ligero que alternativas como Qwen3-TTS (1.7B) o MOSS-TTS (8B), lo que permite ejecutarlo en GPUs de consumo, CPUs y silicio de Apple.

La relevancia actual del modelo radica en su combinación de calidad de voz alta, latencia ultrabaja (unos 40 ms hasta el primer fragmento de audio) y un rendimiento de aproximadamente 9 veces en tiempo real en una NVIDIA RTX 4090. Soporta cinco idiomas (inglés, chino, francés, alemán y español) y se distribuye bajo licencia Apache 2.0, lo que facilita su adopción comercial. El repositorio incluye demo web, API de Python y CLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregresiva continua con VAE causal, autoregresión por parches y flow-matching con guía destilada |
| Parametros totales | ~230 millones (0.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, chino, francés, alemán, español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CuteTTS emplea una arquitectura autoregresiva continua que modela latentes causales extraídos por un VAE (variational autoencoder). En lugar de predecir tokens discretos como los modelos TTS tradicionales, el sistema trabaja con representaciones latentes continuas organizadas en parches, lo que reduce el coste computacional y mejora la eficiencia. La síntesis final se realiza mediante un cabezal de flow-matching que convierte los latentes en audio, incorporando una técnica de destilación de guía (guidance-step distillation) que unifica la eliminación de classifier-free guidance y la integración por intervalos en un único cabezal de difusión.

Según el paper (arXiv:2608.08638), la versión destilada reduce la latencia media del primer audio en un 23,3 % y el factor de tiempo real medio en un 40,8 %, manteniendo una calidad de síntesis cercana a la del modelo base. No se especifican en la información disponible los detalles del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz de alta calidad a partir de texto en cinco idiomas: inglés, chino, francés, alemán y español.
- Clonación de voz zero-shot: puede replicar la identidad vocal de un hablante a partir de una muestra breve de audio.
- Generación de voz en streaming con latencia ultrabaja: aproximadamente 40 ms hasta el primer fragmento de audio.
- Rendimiento en tiempo real de aproximadamente 9× en una NVIDIA RTX 4090.
- Ejecución eficiente en GPU, CPU y silicio de Apple (Apple silicon).
- Interfaz múltiple: demo web, API de Python y CLI.
- Modelo destilado (CuteTTS-distill) con menor latencia y factor de tiempo real, pensado para despliegue en tiempo real.

## Casos de uso

- Asistentes de voz interactivos: la latencia de 40 ms al primer fragmento permite respuestas de voz casi instantáneas en asistentes conversacionales, donde la demora perceptible degrada la experiencia de usuario.
- Audiolibros y narración automatizada: la calidad de voz y la clonación zero-shot permiten generar narraciones con una voz consistente a partir de una muestra breve, reduciendo costes frente a la grabación profesional.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesitan síntesis de voz natural y de baja latencia para responder a la navegación del usuario.
- Localización de contenido multimedia: el soporte multilingüe (en, zh, fr, de, es) permite doblar o generar voces en off para vídeos, cursos y presentaciones sin necesidad de actores de voz.
- Sistemas de respuesta de voz automatizada (IVR): en centralitas telefónicas, el modelo puede generar respuestas dinámicas con voz natural y clonar la voz de un locutor corporativo para mantener la identidad de marca.
- Educación y e-learning: generación de material de estudio en audio a partir de texto, con la posibilidad de clonar la voz de un profesor para mantener continuidad en los cursos.
- Prototipado rápido de productos de voz: gracias a su tamaño reducido y ejecución en CPU, es viable integrarlo en entornos de desarrollo sin GPU dedicada para validar conceptos de producto.

## Benchmarks y rendimiento

Resultados de clonación de voz zero-shot publicados en la model card (WER: word error rate, menor es mejor; SIM: similitud de hablante, mayor es mejor):

| Modelo | Params. | LibriSpeech test-clean WER (%) ↓ | LibriSpeech test-clean SIM ↑ | Seed-TTS EN WER (%) ↓ | Seed-TTS EN SIM ↑ | Seed-TTS ZH WER (%) ↓ | Seed-TTS ZH SIM ↑ |
|---|---|---|---|---|---|---|---|
| MOSS-TTS | 8B | 1.98 | 67.7 | 1.84 | 70.9 | 1.37 | 77.0 |
| Qwen3-TTS | 1.7B | 2.35 | 70.3 | 1.66 | 71.4 | 0.91 | 77.0 |
| FireRedTTS-2 | 1.5B | 4.32 | 64.2 | 1.95 | 66.5 | 1.14 | 73.6 |
| MOSS-TTS-Nano | 0.1B | 4.10 | 48.4 | 4.62 | 49.9 | 3.13 | 64.3 |
| F5-TTS | 0.3B | 2.42 | 66.0 | 1.83 | 67.0 | 1.56 | 76.0 |
| ZipVoice | 0.1B | 2.05 | 67.4 | 1.70 | 69.7 | 1.40 | 75.1 |
| IndexTTS2 | 1.5B | 2.47 | 70.0 | 2.22 | 70.6 | 1.02 | 76.5 |
| CosyVoice 3 | 0.5B | 1.99 | 69.7 | 2.02 | 71.8 | 1.16 | 78.0 |
| VoxCPM2 | 2B | 3.01 | 74.0 | 1.84 | 75.3 | 0.97 | 79.5 |
| VibeVoice | 1.5B | – | – | 3.04 | 68.9 | 1.16 | 74.4 |
| DiTAR | 0.6B | 2.39 | 67.0 | 1.69 | 73.5 | 1.02 | 75.3 |
| VibeVoice-Realtime | 0.5B | 2.00 | 69.5 | 2.05 | 63.3 | – | – |
| Pocket TTS | 0.1B | 1.59 | 49.1 | 1.63 | 50.7 | – | – |
| **CuteTTS** | **0.2B** | **2.16** | **78.9** | **2.04** | **76.5** | **1.41** | **77.8** |
| **CuteTTS-distill** | **0.2B** | **2.41** | **76.8** | **2.03** | **74.2** | **1.47** | **75.6** |

CuteTTS destaca especialmente en similitud de hablante (SIM), superando a todos los modelos comparados en LibriSpeech test-clean (78.9) y en Seed-TTS EN (76.5). Su WER es competitivo (2.16 % en LibriSpeech), aunque ligeramente superior al de Pocket TTS (1.59 %) y CosyVoice 3 (1.99 %).

## Requisitos de hardware

- Tamaño del repositorio: 1.2 GB, lo que sugiere un footprint de memoria moderado.
- VRAM estimada: no disponible en la información publicada, pero con ~230M de parámetros en safetensors, la inferencia en FP16 debería caber en GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (referencia de rendimiento publicada: ~40 ms de latencia al primer fragmento y ~9× tiempo real), aunque el modelo también se ejecuta en CPUs y Apple silicon.
- Compatible con GPU de consumo: sí, incluyendo tarjetas de gama media.
- Opciones de despliegue: demo web, API de Python y CLI. No se menciona soporte explícito para vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje, no a TTS.
- Latencia y throughput: ~40 ms al primer fragmento de audio y ~9× tiempo real en RTX 4090. La versión destilada reduce la latencia media del primer audio en un 23.3 % y el factor de tiempo real en un 40.8 %.

## Comparativa con modelos similares

| Modelo | Params. | Idiomas | Licencia | WER LibriSpeech (%) | SIM LibriSpeech | Notas |
|---|---|---|---|---|---|---|
| CuteTTS | 0.2B | en, zh, fr, de, es | Apache 2.0 | 2.16 | 78.9 | Latencia ultrabaja, ejecución en CPU |
| F5-TTS | 0.3B | en, zh | MIT | 2.42 | 66.0 | Modelo de difusión, sin destilación |
| CosyVoice 3 | 0.5B | en, zh, ja, ko, yue | Apache 2.0 | 1.99 | 69.7 | Soporta instrucciones en lenguaje natural |
| MOSS-TTS-Nano | 0.1B | en, zh | No disponible | 4.10 | 48.4 | Versión destilada de MOSS-TTS, menor calidad |
| Pocket TTS | 0.1B | en | No disponible | 1.59 | 49.1 | Mejor WER pero similitud de hablante baja |

CuteTTS ofrece el mejor equilibrio entre tamaño reducido y similitud de hablante, superando claramente a modelos de su misma categoría de peso. Su WER es competitivo aunque no el mejor de la tabla, y su licencia Apache 2.0 es favorable para uso comercial.

## Limitaciones y advertencias

- El WER en inglés (2.16 % en LibriSpeech) es superior al de Pocket TTS (1.59 %) y CosyVoice 3 (1.99 %), lo que puede implicar errores de pronunciación más frecuentes en textos complejos.
- El soporte de idiomas se limita a cinco (en, zh, fr, de, es); no cubre otros idiomas europeos o asiáticos.
- No se ha publicado información sobre sesgos del modelo, comportamiento con voces no nativas o acentos regionales.
- No se especifican los datos de entrenamiento, por lo que se desconoce la composición del dataset y posibles sesgos demográficos o dialectales.
- La versión destilada (CuteTTS-distill) sacrifica algo de calidad (WER 2.41 % y SIM 76.8) a cambio de menor latencia; conviene evaluar si la pérdida es aceptable para el caso de uso.
- No hay información sobre el comportamiento del modelo con entradas de audio de baja calidad o ruidosas para la clonación de voz.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar el cumplimiento de normativas de consentimiento para clonación de voz en cada jurisdicción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OPPOer/CuteTTS
- Paper (arXiv): https://arxiv.org/abs/2608.08638
- Paper en HTML: https://arxiv.org/html/2608.08638v1
- Página del paper en HuggingFace: https://huggingface.co/papers/2608.08638
- Repositorio GitHub: https://github.com/OPPO-Mente-Lab/CuteTTS
- Perfil de OPPO en HuggingFace: https://huggingface.co/OPPOer/models
- Análisis en CatalyzeX: https://www.catalyzex.com/paper/cutetts-efficient-and-high-quality-speech
