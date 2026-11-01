# fengsky/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech) basado en modelos de lenguaje de gran tamano, desarrollado por el equipo FunAudioLLM (Alibaba). Se trata de la tercera iteración de la familia CosyVoice, sucesora de CosyVoice 2.0, y esta disenada para síntesis de voz multilingue zero-shot en condiciones reales. El modelo mejora a su predecesor en consistencia de contenido, similitud de locutor y naturalidad de la prosodia, y se publica bajo licencia Apache 2.0.

Con 0.5B parámetros, el modelo cubre 9 idiomas (chino, inglés, japones, coreano, aleman, espanol, frances, italiano y ruso) y mas de 18 dialectos o acentos del chino. Incorpora soporte de clonación de voz zero-shot tanto monolingue como cross-lingue, inpainting de pronunciación mediante pinyin y fonemas CMU, normalización de texto integrada sin frontend tradicional, y capacidad bi-streaming con latencias de hasta 150 ms.

La relevancia actual del modelo radica en que combina un tamano compacto (0.5B) con resultados de vanguardia en las metricas de referencia de TTS, superando a alternativas de mayor tamano como Index-TTS2 (1.5B) o VibeVoice-1.5B en similitud de locutor, manteniendo una licencia permisiva que facilita su uso comercial y su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en LLM (arquitectura CosyVoice, no detallada en la informacion disponible) |
| Parametros totales | 0.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de (9 idiomas) + 18+ dialectos/acentos del chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un sistema TTS basado en modelos de lenguaje de gran tamano, sucesor de la linea CosyVoice (v1.0, v2.0 y v3.0). El modelo card referencia tres papers tecnicos (arXiv:2505.17589 para CosyVoice 3.0, arXiv:2412.10117 para CosyVoice 2.0 y arXiv:2407.05407) donde se describe la arquitectura en detalle, pero dichos contenidos no se incluyen en la informacion proporcionada.

Entre las innovaciones tecnicas documentadas destacan: soporte de flow matching en el entrenamiento (incorporado desde la version de julio de 2024), Repetition Aware Sampling (RAS) para estabilidad del LLM, inferencia streaming con kv cache y sdpa para optimizacion del RTF, soporte de entrenamiento GRPO (incorporado en agosto de 2025 con contribucion de NVIDIA) y runtime Triton/TRT-LLM. El modelo se distribuye en version base y version RL (entrenada con refuerzo), ambas de 0.5B parametros.

## Capacidades

- Síntesis de voz multilingue en 9 idiomas: chino, inglés, frances, espanol, japones, coreano, italiano, ruso y aleman.
- Soporte de 18+ dialectos y acentos del chino (Guangdong, Minnan, Sichuan, Dongbei, Shan3xi, Shan1xi, Shanghai, Tianjin, Shandong, Ningxia, Gansu, entre otros).
- Clonación de voz zero-shot monolingue y cross-lingue.
- Inpainting de pronunciación para pinyin chino y fonemas CMU ingleses, aportando controlabilidad para uso en producción.
- Normalización de texto integrada: lectura de numeros, simbolos especiales y diversos formatos de texto sin modulo frontend tradicional.
- Bi-streaming: soporte simultaneo de streaming de texto de entrada y de audio de salida, con latencia de hasta 150 ms.
- Soporte de instrucciones (instruct): control de idioma, dialecto, emocion, velocidad, volumen y otros atributos.
- Generación de audio de alta calidad con consistencia de contenido y similitud de locutor de vanguardia.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede generar respuestas de voz naturales en tiempo real gracias a su modo bi-streaming con latencia de 150 ms, adecuado para sistemas telefonicos o chats de voz interactivos.
- Audiolibros y narracion multilingue: con soporte de 9 idiomas y clonación zero-shot, permite producir narraciones con una voz consistente a partir de una muestra corta de audio, incluyendo la lectura correcta de numeros y simbolos gracias a su normalizacion de texto integrada.
- Doblaje y localizacion de contenido: la clonación cross-lingue permite mantener la identidad vocal del locutor original al doblar un video a otro idioma, y el control por instrucciones permite ajustar emocion y velocidad por escena.
- Asistentes de voz embebidos: su tamano de 0.5B y el soporte ONNX facilitan el despliegue en entornos con recursos limitados, incluyendo escenarios de inferencia en el borde o contenedores ligeros.
- Accesibilidad: conversion de texto a voz para lectores de pantalla y sistemas de asistencia, con soporte de dialectos chinos que amplia la cobertura a usuarios de distintas regiones.
- Produccion de contenido para redes y podcasts: generacion de voces sinteticas personalizadas mediante clonación zero-shot, con control de prosodia y emocion para adaptar el tono al formato.
- Pruebas A/B de voces en productos: el inpainting de pronunciación y el control por instrucciones permiten iterar rapidamente sobre variantes de voz sin reentrenar el modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card (CER/WER en % menor es mejor; Speaker Similarity en % mayor es mejor):

| Modelo | Open source | Tamano | test-zh CER | test-zh SIM | test-en WER | test-en SIM | test-hard CER | test-hard SIM |
|---|---|---|---|---|---|---|---|---|
| Human | - | - | 1.26 | 75.5 | 2.14 | 73.4 | - | - |
| Seed-TTS | No | - | 1.12 | 79.6 | 2.25 | 76.2 | 7.59 | 77.6 |
| MiniMax-Speech | No | - | 0.83 | 78.3 | 1.65 | 69.2 | - | - |
| F5-TTS | Si | 0.3B | 1.52 | 74.1 | 2.00 | 64.7 | 8.67 | 71.3 |
| Spark TTS | Si | 0.5B | 1.2 | 66.0 | 1.98 | 57.3 | - | - |
| CosyVoice2 | Si | 0.5B | 1.45 | 75.7 | 2.57 | 65.9 | 6.83 | 72.4 |
| FireRedTTS2 | Si | 1.5B | 1.14 | 73.2 | 1.95 | 66.5 | - | - |
| Index-TTS2 | Si | 1.5B | 1.03 | 76.5 | 2.23 | 70.6 | 7.12 | 75.5 |
| VibeVoice-1.5B | Si | 1.5B | 1.16 | 74.4 | 3.04 | 68.9 | - | - |
| VibeVoice-Realtime | Si | 0.5B | - | - | 2.05 | 63.3 | - | - |
| HiggsAudio-v2 | Si | 3B | 1.50 | 74.0 | 2.44 | 67.7 | - | - |
| VoxCPM | Si | 0.5B | 0.93 | 77.2 | 1.85 | 72.9 | 8.87 | 73.0 |
| GLM-TTS | Si | 1.5B | 1.03 | 76.1 | - | - | - | - |
| GLM-TTS RL | Si | 1.5B | 0.89 | 76.4 | - | - | - | - |
| Fun-CosyVoice3-0.5B-2512 | Si | 0.5B | 1.21 | 78.0 | 2.24 | 71.8 | 6.71 | 75.8 |
| Fun-CosyVoice3-0.5B-2512_RL | Si | 0.5B | 0.81 | 77.4 | 1.68 | 69.5 | 5.44 | 75.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Con 0.5B parametros, el peso del modelo en precision completa ronda 1 GB y en cuantizaciones de 8 bits aproximadamente 0.5 GB, aunque el consumo real depende de los modulos adicionales del pipeline TTS (vocoder, flow matching, etc.).
- GPU recomendadas: no disponible en la informacion proporcionada. El soporte de runtime Triton/TRT-LLM (incorporado con contribucion de NVIDIA) sugiere despliegue en GPUs NVIDIA.
- Cabe en GPU consumer: probablemente si, dado el tamano de 0.5B, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: repositorio oficial CosyVoice con scripts de entrenamiento e inferencia, soporte de vLLM (anadido para CosyVoice2-0.5B en mayo de 2025), runtime Triton/TRT-LLM, servidor FastAPI y cliente incluidos, y pesos en formato ONNX y safetensors.
- Latencia y throughput: latencia de hasta 150 ms en modo bi-streaming segun la model card. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | test-zh CER | test-zh SIM | test-en WER | test-en SIM | Licencia | Open source |
|---|---|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0.5B | 1.21 | 78.0 | 2.24 | 71.8 | Apache 2.0 | Si |
| CosyVoice2 | 0.5B | 1.45 | 75.7 | 2.57 | 65.9 | Apache 2.0 | Si |
| VoxCPM | 0.5B | 0.93 | 77.2 | 1.85 | 72.9 | no disponible | Si |
| Index-TTS2 | 1.5B | 1.03 | 76.5 | 2.23 | 70.6 | no disponible | Si |
| VibeVoice-1.5B | 1.5B | 1.16 | 74.4 | 3.04 | 68.9 | no disponible | Si |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible. Como sistema TTS entrenado con datos de voz, puede heredar sesgos de acento, genero o registro presentes en el corpus de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero existe riesgo de errores de pronunciacion o de prosodia en textos complejos, atipicos o fuera de dominio. El modo RL mejora el CER/WER a costa de una ligera perdida de similitud de locutor (77.4 frente a 78.0 en test-zh).
- Limitaciones de contexto o idioma: cobertura de 9 idiomas y dialectos chinos; no se documentan otros idiomas. No se especifica la longitud maxima de texto de entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y aviso de cambios. No se documentan restricciones adicionales.
- Caveats para produccion: el modelo se distribuye como snapshot de 9.7 GB en el repositorio, lo que incluye pesos y artefactos auxiliares. La instalacion requiere clonar el repositorio oficial con submodulos y crear un entorno Conda con Python 3.10; el paquete ttsfrd es opcional pero recomendado para mejor normalizacion de texto. La version RL y la base tienen caracteristicas distintas y deben elegirse segun el objetivo (menor CER frente a mayor similitud de locutor).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fengsky/Fun-CosyVoice3-0.5B-2512
- Modelo original en HuggingFace: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Modelo en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Demos de Fun-CosyVoice 3.0: https://funaudiollm.github.io/cosyvoice3/
- Paper de Fun-CosyVoice 3.0: https://arxiv.org/abs/2505.17589
- Paper de CosyVoice 2.0: https://arxiv.org/abs/2412.10117
- Paper de CosyVoice (arXiv:2407.05407): https://arxiv.org/abs/2407.05407
- Repositorio GitHub oficial: https://github.com/FunAudioLLM/CosyVoice
- Conjunto de evaluacion CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Demos de CosyVoice 2.0: https://funaudiollm.github.io/cosyvoice2/
- Demos de CosyVoice 1.0: https://fun-audio-llm.github.io
- Modelo CosyVoice2-0.5B en HuggingFace: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Modelo CosyVoice-300M en HuggingFace: https://huggingface.co/FunAudioLLM/CosyVoice-300M
