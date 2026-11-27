# Eldik06/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech) basado en modelos de lenguaje de gran tamano, desarrollado por el equipo FunAudioLLM (Alibaba). Esta ficha corresponde a la réplica publicada por el usuario Eldik06 en Hugging Face, que redistribuye los pesos del modelo original bajo licencia Apache 2.0. El modelo resuelve el problema de la síntesis de voz multilingüe zero-shot "in the wild", es decir, clonación de voz y generación de habla natural sin necesidad de entrenamiento específico para cada hablante. Es relevante porque mejora a su predecesor CosyVoice 2.0 en consistencia de contenido, similitud de hablante y naturalidad prosódica, manteniendo un tamano compacto de 0,5B parámetros que lo hace desplegable en hardware moderado.

La arquitectura combina un modelo de lenguaje autorregresivo con un módulo de flow matching para la generación de audio, e incorpora soporte de streaming bidireccional (texto de entrada y audio de salida) con latencias tan bajas como 150 ms. Cubre 9 idiomas (chino, inglés, japonés, coreano, alemán, espanol, francés, italiano y ruso) y más de 18 dialectos o acentos chinos. El repositorio incluye pesos en safetensors y ONNX, con un tamano total de 9,7 GB.

La versión 2512 corresponde a la release de diciembre de 2025 del modelo base y su variante entrenada con RL (GRPO), junto con scripts de entrenamiento e inferencia. El modelo está pensado para producción: incluye normalización de texto sin frontend tradicional, inpainting de pronunciación mediante pinyin chino y fonemas CMU ingleses, y soporte de instrucciones para controlar idioma, dialecto, emoción, velocidad y volumen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM autorregresivo + flow matching para síntesis de audio (TTS basado en LLM) |
| Parametros totales | 0,5B (500 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de; además 18+ dialectos/acentos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Fun-CosyVoice3-0.5B-2512 es un sistema TTS híbrido que combina un modelo de lenguaje autorregresivo (0,5B parámetros) con un módulo de flow matching para la generación de formas de onda. El LLM genera tokens de audio discretos a partir del texto de entrada y de un prompt de voz de referencia (zero-shot voice cloning), y el módulo de flow matching transforma esos tokens en audio de alta calidad. La arquitectura incorpora decodificación con Repetition Aware Sampling (RAS) para estabilizar la inferencia del LLM, soporte de streaming con kv cache y SDPA para optimizar el RTF (real-time factor), y un modo de streaming bidireccional que permite entrada de texto y salida de audio simultáneas.

El modelo se entrenó sobre datos multilingües no especificados en la información disponible. La model card menciona soporte de entrenamiento con GRPO (una variante de RLHF) para la versión RL, y la release de agosto de 2025 incorporó soporte de entrenamiento GRPO para CosyVoice2, que se extiende a esta versión. También se documenta soporte de flow matching training desde julio de 2024. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Una innovación destacable es la normalización de texto integrada sin frontend tradicional, que permite leer números, símbolos especiales y diversos formatos de texto directamente, y el inpainting de pronunciación mediante pinyin chino y fonemas CMU ingleses para un control más preciso en producción.

## Capacidades

- Síntesis de voz multilingüe zero-shot en 9 idiomas: chino, inglés, francés, espanol, japonés, coreano, italiano, ruso y alemán.
- Clonación de voz zero-shot y cross-lingual: genera habla con la voz de un hablante de referencia en otro idioma.
- Soporte de 18+ dialectos y acentos chinos (Guangdong, Minnan, Sichuan, Dongbei, Shan3xi, Shan1xi, Shanghai, Tianjin, Shandong, Ningxia, Gansu, etc.).
- Consistencia de contenido y naturalidad prosódica de estado del arte según la evaluación del autor.
- Inpainting de pronunciación: control de pronunciación mediante pinyin chino y fonemas CMU ingleses.
- Normalización de texto integrada: lectura de números, símbolos especiales y formatos variados sin módulo frontend tradicional.
- Streaming bidireccional: entrada de texto en streaming y salida de audio en streaming con latencia de hasta 150 ms.
- Soporte de instrucciones (instruct): control de idioma, dialecto, emoción, velocidad y volumen.
- No se documenta soporte de tool calling, function calling ni capacidades de agente; es un modelo especializado en TTS.

## Casos de uso

- Atención al cliente automatizada por voz: el modelo puede generar respuestas habladas naturales en 9 idiomas con la voz de la marca (clonación zero-shot), y su streaming bidireccional con latencia de 150 ms permite conversaciones fluidas en tiempo real.
- Audiolibros y narración multilingüe: con soporte de instrucciones de emoción y velocidad, se puede generar narración expresiva en varios idiomas y dialectos chinos, manteniendo consistencia de hablante a lo largo de capítulos largos.
- Doblaje y localización de vídeo: la clonación cross-lingual permite conservar la voz del actor original al doblar contenido a otro idioma, y el inpainting de pronunciación ayuda a corregir nombres propios y términos técnicos.
- Asistentes de voz embebidos: con 0,5B parámetros y pesos en ONNX, el modelo es adecuado para despliegue en entornos con recursos limitados, incluyendo dispositivos edge o servidores modestos.
- Accesibilidad y lectura de pantalla: la normalización de texto integrada permite leer números, símbolos y formatos variados sin un frontend separado, lo que simplifica la integración en lectores de pantalla y aplicaciones de accesibilidad.
- Generación de contenido para marketing y redes sociales: el control de emoción, volumen y velocidad mediante instrucciones permite producir locuciones con distintos tonos (promocional, informativo, cercano) de forma automatizada.
- Prototipado rápido de productos de voz: la licencia Apache 2.0 y la disponibilidad de scripts de entrenamiento e inferencia facilitan la experimentación y el ajuste fino para dominios específicos.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card (CER/WER en % menor es mejor; Speaker Similarity en % mayor es mejor):

| Modelo | Open-Source | Tamano | test-zh CER ↓ | test-zh SIM ↑ | test-en WER ↓ | test-en SIM ↑ | test-hard CER ↓ | test-hard SIM ↑ |
|---|---|---|---|---|---|---|---|---|
| Human | - | - | 1,26 | 75,5 | 2,14 | 73,4 | - | - |
| Seed-TTS | No | - | 1,12 | 79,6 | 2,25 | 76,2 | 7,59 | 77,6 |
| MiniMax-Speech | No | - | 0,83 | 78,3 | 1,65 | 69,2 | - | - |
| F5-TTS | Sí | 0,3B | 1,52 | 74,1 | 2,00 | 64,7 | 8,67 | 71,3 |
| Spark TTS | Sí | 0,5B | 1,2 | 66,0 | 1,98 | 57,3 | - | - |
| CosyVoice2 | Sí | 0,5B | 1,45 | 75,7 | 2,57 | 65,9 | 6,83 | 72,4 |
| FireRedTTS2 | Sí | 1,5B | 1,14 | 73,2 | 1,95 | 66,5 | - | - |
| Index-TTS2 | Sí | 1,5B | 1,03 | 76,5 | 2,23 | 70,6 | 7,12 | 75,5 |
| VibeVoice-1.5B | Sí | 1,5B | 1,16 | 74,4 | 3,04 | 68,9 | - | - |
| VibeVoice-Realtime | Sí | 0,5B | - | - | 2,05 | 63,3 | - | - |
| HiggsAudio-v2 | Sí | 3B | 1,50 | 74,0 | 2,44 | 67,7 | - | - |
| VoxCPM | Sí | 0,5B | 0,93 | 77,2 | 1,85 | 72,9 | 8,87 | 73,0 |
| GLM-TTS | Sí | 1,5B | 1,03 | 76,1 | - | - | - | - |
| GLM-TTS RL | Sí | 1,5B | 0,89 | 76,4 | - | - | - | - |
| Fun-CosyVoice3-0.5B-2512 | Sí | 0,5B | 1,21 | 78,0 | 2,24 | 71,8 | 6,71 | 75,8 |
| Fun-CosyVoice3-0.5B-2512_RL | Sí | 0,5B | 0,81 | 77,4 | 1,68 | 69,5 | 5,44 | 75,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 0,5B parámetros, la inferencia en precisión completa (fp32) requeriría aproximadamente 2 GB solo para pesos, más memoria para activaciones y el módulo de flow matching; en fp16/bf16 el requisito de pesos baja a ~1 GB. El repositorio completo ocupa 9,7 GB, pero incluye múltiples variantes y pesos ONNX.
- GPU recomendadas: no se especifican en la información disponible. Por tamano, una GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) debería ser suficiente para inferencia; también cabría en GPUs de datacenter como A100 o H100 para despliegues de alta concurrencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque el dato exacto no está confirmado en la información disponible.
- Opciones de despliegue: scripts de inferencia del repositorio CosyVoice (GitHub FunAudioLLM/CosyVoice), soporte de vLLM (documentado para CosyVoice2-0.5B desde mayo de 2025), soporte de Triton TensorRT-LLM (runtime trtllm, contribución de NVIDIA), servidor FastAPI con cliente, y pesos en ONNX para despliegue con ONNX Runtime. No se menciona soporte explícito de llama.cpp u Ollama.
- Latencia y throughput: latencia de hasta 150 ms en modo streaming bidireccional según la model card. El throughput no se especifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | test-zh CER ↓ | test-en WER ↓ | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0,5B | 9 + dialectos zh | no disponible | Apache 2.0 | 1,21 | 2,24 | Hugging Face, ModelScope |
| CosyVoice2-0.5B | 0,5B | multilingüe | no disponible | Apache 2.0 | 1,45 | 2,57 | Hugging Face, ModelScope |
| F5-TTS | 0,3B | no disponible | no disponible | no disponible | 1,52 | 2,00 | open source |
| Spark TTS | 0,5B | no disponible | no disponible | no disponible | 1,2 | 1,98 | open source |
| Index-TTS2 | 1,5B | no disponible | no disponible | no disponible | 1,03 | 2,23 | open source |
| VoxCPM | 0,5B | no disponible | no disponible | no disponible | 0,93 | 1,85 | open source |

Fun-CosyVoice3-0.5B-2512 destaca por su similitud de hablante (78,0% en test-zh, la más alta entre los modelos open source de la tabla) y por su rendimiento en el conjunto test-hard (6,71% CER), superando a CosyVoice2 (6,83%) y a VoxCPM (8,87%). Su variante RL mejora aún más el CER en test-zh (0,81%) y test-en WER (1,68%), a costa de una ligera reducción en similitud de hablante.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible. Al ser un modelo entrenado con datos multilingües no especificados, es probable que presente sesgos de representación de hablantes y acentos, pero no hay confirmación oficial.
- Riesgo de alucinación: en TTS, el riesgo se manifiesta como errores de pronunciación, omisiones o repeticiones de contenido; el modelo incorpora Repetition Aware Sampling (RAS) para mitigar repeticiones, pero no se detallan tasas de error en producción.
- Limitaciones de contexto o idioma: aunque cubre 9 idiomas, el rendimiento puede variar entre ellos; los benchmarks publicados se centran en chino e inglés, sin datos para el resto de idiomas. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya. Esta ficha corresponde a una réplica de terceros (Eldik06), no al repositorio oficial; conviene verificar la integridad de los pesos descargados.
- Caveats para producción: el modelo requiere un prompt de voz de referencia para la clonación zero-shot, lo que plantea consideraciones de privacidad y consentimiento. El uso de clonación de voz puede estar regulado en algunas jurisdicciones. La información sobre cuantizaciones oficiales y requisitos exactos de VRAM no está disponible, por lo que el despliegue en producción requiere pruebas empíricas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que la réplica no ha sido validada por la comunidad.

## Enlaces

- Repositorio de la réplica en Hugging Face: https://huggingface.co/Eldik06/Fun-CosyVoice3-0.5B-2512
- Modelo original en Hugging Face: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Modelo original en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio GitHub: https://github.com/FunAudioLLM/CosyVoice
- Demos CosyVoice 3.0: https://funaudiollm.github.io/cosyvoice3/
- Paper CosyVoice 3.0: https://arxiv.org/abs/2505.17589
- Paper CosyVoice 2.0: https://arxiv.org/abs/2412.10117
- Paper CosyVoice 1.0: https://arxiv.org/abs/2407.05407
- Demos CosyVoice 2.0: https://funaudiollm.github.io/cosyvoice2/
- Demos CosyVoice 1.0: https://fun-audio-llm.github.io
- PDF CosyVoice v1: https://funaudiollm.github.io/pdf/CosyVoice_v1.pdf
- Conjunto de evaluación CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Modelo CosyVoice2-0.5B en Hugging Face: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Modelo CosyVoice2-0.5B en ModelScope: https://www.modelscope.cn/models/iic/CosyVoice2-0.5B
- Modelo CosyVoice-300M en ModelScope: https://www.modelscope.cn/models/iic/CosyVoice-300M
- Modelo CosyVoice-300M en Hugging Face: https://huggingface.co/FunAudioLLM/CosyVoice-300M
