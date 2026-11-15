# Pragmaticl/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech) basado en modelos de lenguaje de gran tamano, desarrollado por el equipo FunAudioLLM (Alibaba). Es la tercera iteración de la familia CosyVoice y mejora a su predecesor, CosyVoice 2.0, en consistencia de contenido, similitud de hablante y naturalidad prosódica. El modelo está disenado para síntesis de voz multilingüe zero-shot en condiciones reales, incluyendo clonación de voz con pocos segundos de audio de referencia.

El modelo tiene 0,5 mil millones de parámetros y cubre 9 idiomas (chino, inglés, japonés, coreano, alemán, espanol, francés, italiano y ruso), además de más de 18 dialectos y acentos del chino. Incorpora capacidades de streaming bidireccional (texto de entrada y audio de salida) con latencias de hasta 150 ms, lo que lo hace adecuado para aplicaciones conversacionales en tiempo real.

La relevancia actual del modelo radica en su combinación de tamano reducido (0,5B), licencia Apache 2.0, soporte multilingüe amplio y capacidades de control fino mediante instrucciones (idioma, dialecto, emoción, velocidad, volumen), lo que lo posiciona como una opción competitiva frente a alternativas de mayor tamano como Index-TTS2 (1,5B) o HiggsAudio-v2 (3B). El repositorio de Hugging Face indicado corresponde a una copia publicada por el usuario Pragmaticl bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en LLM (modelo de lenguaje para generación de tokens de audio) con flow matching |
| Parametros totales | 0,5B (500 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y ONNX) |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de (9 idiomas) + 18+ dialectos/acentos del chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Fun-CosyVoice3-0.5B-2512 es un sistema TTS basado en un modelo de lenguaje que genera tokens de audio a partir de texto, combinado con un módulo de flow matching para la síntesis de la forma de onda. La arquitectura sigue la línea de CosyVoice 2.0, que introdujo el entrenamiento con flow matching y el muestreo consciente de repeticiones (Repetition Aware Sampling, RAS) para mejorar la estabilidad del LLM durante la inferencia. El modelo soporta decodificación en streaming con caché KV y SDPA para optimización del RTF (real-time factor).

El modelo se distribuye en dos variantes: una base y una versión entrenada con RL (RL model), según la hoja de ruta del proyecto. El entrenamiento incluye soporte para normalización de texto sin módulo frontend tradicional (lectura de números, símbolos especiales y formatos variados) y permite la "inpainting" de pronunciación mediante pinyin chino y fonemas CMU ingleses. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición detallada del dataset. El modelo soporta instrucciones para controlar idioma, dialecto, emoción, velocidad y volumen.

## Capacidades

- Síntesis de voz multilingüe zero-shot en 9 idiomas (chino, inglés, francés, espanol, japonés, coreano, italiano, ruso y alemán).
- Clonación de voz zero-shot multilingüe y cross-lingüe (clonar una voz en un idioma y sintetizar en otro).
- Soporte de más de 18 dialectos y acentos del chino (Guangdong, Minnan, Sichuan, Dongbei, Shan3xi, Shan1xi, Shanghai, Tianjin, Shandong, Ningxia, Gansu, etc.).
- Control mediante instrucciones: idioma, dialecto, emoción, velocidad y volumen.
- Inpainting de pronunciación para pinyin chino y fonemas CMU ingleses, lo que aporta control adicional para uso en producción.
- Normalización de texto integrada: lectura de números, símbolos especiales y diversos formatos sin módulo frontend tradicional.
- Streaming bidireccional: soporte de entrada de texto en streaming y salida de audio en streaming, con latencia de hasta 150 ms.
- Generación de audio de alta calidad con consistencia de contenido y similitud de hablante de nivel estado del arte (según la evaluación del autor).

## Casos de uso

- Atención al cliente automatizada por voz: el modelo puede generar respuestas habladas en tiempo real gracias a su streaming bidireccional con latencia de 150 ms, adecuado para sistemas de IVR y asistentes telefónicos que requieren respuestas naturales y multilingües.
- Audiolibros y narración multilingüe: con soporte para 9 idiomas y clonación de voz zero-shot, permite generar narraciones con una voz consistente a partir de una muestra corta de audio, manteniendo la similitud de hablante (78,0% en test-zh según la evaluación del autor).
- Doblaje y localización de contenido: la clonación cross-lingüe permite mantener la identidad de la voz original mientras se sintetiza en otro idioma, útil para doblar vídeos, cursos o material formativo a múltiples idiomas.
- Asistentes de voz embebidos y dispositivos IoT: con solo 0,5B parámetros y pesos en ONNX, el modelo puede desplegarse en entornos con recursos limitados, incluyendo dispositivos de borde que requieren síntesis local sin depender de la nube.
- Accesibilidad y lectores de pantalla: la normalización de texto integrada (números, símbolos, formatos) y el control de velocidad y volumen permiten generar lecturas claras y configurables para personas con discapacidad visual.
- Producción de contenido para redes y publicidad: el control de emoción, velocidad y volumen mediante instrucciones permite generar variaciones de una misma locución para distintos tonos y estilos sin reentrenamiento.
- Sistemas de conversación con agentes de IA: la combinación de streaming de texto y audio permite integrar el modelo en pipelines de agentes conversacionales que requieren respuestas habladas de baja latencia y multi-turno.

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor (CER/WER en % menor es mejor; Speaker Similarity en % mayor es mejor):

| Modelo | Open-Source | Tamano | test-zh CER (%) ↓ | test-zh SS (%) ↑ | test-en WER (%) ↓ | test-en SS (%) ↑ | test-hard CER (%) ↓ | test-hard SS (%) ↑ |
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

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 0,5B parámetros, la inferencia en precisión completa (fp32) requeriría aproximadamente 2 GB solo para pesos, más memoria para activaciones y el módulo de flow matching; en fp16/bf16 se reduciría a la mitad. Estas estimaciones son orientativas y no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, cabría en GPUs consumer como RTX 3060/4060/4090, aunque no se especifican requisitos oficiales.
- Cabe en GPU consumer: previsiblemente sí, dado el tamano de 0,5B, pero no confirmado en la información disponible.
- Opciones de despliegue: se menciona soporte para vLLM (CosyVoice2-0.5B), runtime Triton TRT-LLM (contribución de NVIDIA), servidor FastAPI y cliente, así como pesos en ONNX. También se menciona soporte de streaming con caché KV y SDPA.
- Latencia y throughput: latencia de hasta 150 ms en modo streaming bidireccional, según el autor. No se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | test-zh CER (%) ↓ | test-en WER (%) ↓ | Licencia | Open-source |
|---|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0,5B | 9 + 18 dialectos zh | 1,21 | 2,24 | Apache 2.0 | Sí |
| CosyVoice2 | 0,5B | no disponible | 1,45 | 2,57 | no disponible | Sí |
| Index-TTS2 | 1,5B | no disponible | 1,03 | 2,23 | no disponible | Sí |
| VoxCPM | 0,5B | no disponible | 0,93 | 1,85 | no disponible | Sí |
| F5-TTS | 0,3B | no disponible | 1,52 | 2,00 | no disponible | Sí |

Fun-CosyVoice3-0.5B-2512 destaca por su cobertura lingüística (9 idiomas más dialectos chinos) y su similitud de hablante en test-zh (78,0%), la más alta entre los modelos open-source comparados, superando a Index-TTS2 (76,5%) y VoxCPM (77,2%). En CER de test-zh, VoxCPM (0,93%) y la variante RL de Fun-CosyVoice3 (0,81%) obtienen mejores resultados que la versión base (1,21%).

## Limitaciones y advertencias

- El repositorio corresponde a una copia publicada por el usuario Pragmaticl, no al repositorio oficial de FunAudioLLM; se recomienda verificar la integridad de los pesos y contrastar con la versión oficial.
- No se han publicado en la información disponible datos sobre sesgos del modelo (género, etnia, acento) ni sobre el impacto de la clonación de voz en términos éticos y de privacidad.
- Riesgo de alucinación: como modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos complejos o fuera de dominio, aunque el autor reporta mejoras en consistencia de contenido.
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y uso malintencionado; es responsabilidad del desplegador implementar controles de consentimiento y verificación.
- Aunque la licencia es Apache 2.0 (permite uso comercial), deben revisarse las licencias de los componentes auxiliares (ttsfrd, dependencias) y las condiciones de los datasets de entrenamiento, no detalladas en la información disponible.
- El rendimiento en idiomas distintos del chino e inglés no está cuantificado en los benchmarks publicados; los resultados en espanol, francés, alemán, etc., no se reportan numéricamente.
- La latencia de 150 ms corresponde al modo streaming y puede variar según hardware, cuantización y carga del sistema; no se especifican condiciones exactas de medición.

## Enlaces

- Hugging Face (copia del usuario): https://huggingface.co/Pragmaticl/Fun-CosyVoice3-0.5B-2512
- Hugging Face (oficial FunAudioLLM): https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Demos CosyVoice 3.0: https://funaudiollm.github.io/cosyvoice3/
- Paper CosyVoice 3.0: https://arxiv.org/abs/2505.17589
- Paper CosyVoice 2.0: https://arxiv.org/abs/2412.10117
- Paper CosyVoice 1.0: https://funaudiollm.github.io/pdf/CosyVoice_v1.pdf
- Repositorio GitHub: https://github.com/FunAudioLLM/CosyVoice
- Conjunto de evaluación CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Demos CosyVoice 2.0: https://funaudiollm.github.io/cosyvoice2/
- Demos CosyVoice 1.0: https://fun-audio-llm.github.io
