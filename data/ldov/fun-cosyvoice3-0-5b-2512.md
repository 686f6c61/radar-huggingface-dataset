# ldov/Fun-CosyVoice3-0.5B-2512

## Resumen

Fun-CosyVoice3-0.5B-2512 es un sistema de síntesis de voz (text-to-speech, TTS) basado en modelos de lenguaje de gran tamaño (LLM), desarrollado por el equipo FunAudioLLM. Es la tercera generación de la familia CosyVoice y está diseñado para la síntesis de voz multilingüe zero-shot, es decir, puede clonar una voz a partir de una muestra de audio breve sin necesidad de entrenamiento adicional. El modelo supera a su predecesor, CosyVoice 2.0, en consistencia de contenido, similitud del hablante y naturalidad prosódica.

El modelo tiene aproximadamente 0.5 mil millones de parámetros y cubre 9 idiomas principales (chino, inglés, japonés, coreano, alemán, español, francés, italiano y ruso), además de más de 18 dialectos y acentos del chino. Entre sus características destacadas se incluyen el soporte de instrucciones (lengua, dialecto, emoción, velocidad, volumen), la corrección de pronunciación mediante fonemas y la capacidad de streaming bidireccional con una latencia de hasta 150 ms. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia actual de este modelo radica en que ofrece un rendimiento comparable o superior a sistemas propietarios como Seed-TTS o MiniMax-Speech, pero con pesos abiertos. Su tamaño compacto (0.5B) lo hace viable para despliegue en entornos con recursos limitados, y su soporte para cuantización y runtime como vLLM o TensorRT-LLM facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM-based TTS (autoregressive + flow matching) |
| Parametros totales | 0.5B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors y ONNX disponibles) |
| Idiomas soportados | zh, en, fr, es, ja, ko, it, ru, de (9 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Fun-CosyVoice3-0.5B-2512 sigue la arquitectura de CosyVoice 2.0, que combina un modelo de lenguaje autoregresivo para la generación de tokens de voz con un modelo de flow matching para la síntesis del audio final. El componente LLM procesa el texto de entrada junto con un prompt de audio de referencia para generar representaciones discretas de voz, que luego son convertidas en forma de onda mediante el flujo de matching. Esta arquitectura híbrida permite una alta naturalidad prosódica y una buena consistencia de contenido.

El entrenamiento se realizó con datos multilingües extensos, aunque no se han publicado cifras exactas sobre el número de tokens o la composición del dataset. El modelo base fue lanzado en diciembre de 2025, junto con una versión entrenada con reinforcement learning (RL) que mejora significativamente la precisión de contenido, reduciendo el CER en chino de 1.21% a 0.81%. Se ha confirmado el soporte para entrenamiento con GRPO (Group Relative Policy Optimization) en CosyVoice 2.0, lo que sugiere que técnicas similares se aplicaron a esta versión.

Entre las innovaciones técnicas destacan el soporte de streaming bidireccional (entrada de texto y salida de audio simultáneas), la corrección de pronunciación mediante fonemas chinos Pinyin y fonemas ingleses CMU, y la normalización de texto integrada que elimina la necesidad de un módulo frontend tradicional. También se ha implementado Repetition Aware Sampling (RAS) para mejorar la estabilidad del LLM durante la inferencia.

## Capacidades

- Síntesis de voz multilingüe zero-shot en 9 idiomas: chino, inglés, japonés, coreano, alemán, español, francés, italiano y ruso.
- Clonación de voz cross-lingual: puede usar una muestra de voz en un idioma para generar habla en otro idioma diferente.
- Soporte de más de 18 dialectos y acentos chinos, incluyendo cantonés, minnan, sichuanés, dongbei, shanghainés, entre otros.
- Control mediante instrucciones en lenguaje natural: permite especificar idioma, dialecto, emoción, velocidad y volumen.
- Corrección de pronunciación (pronunciation inpainting) mediante fonemas Pinyin para chino y fonemas CMU para inglés.
- Normalización de texto integrada: lee números, símbolos especiales y formatos variados sin módulo frontend externo.
- Streaming bidireccional: soporta entrada de texto incremental y salida de audio en tiempo real con latencia de hasta 150 ms.
- Conversión de voz (voice conversion) heredada de versiones anteriores de CosyVoice.

## Casos de uso

- Atención al cliente multilingüe automatizada: el modelo puede generar respuestas de voz en 9 idiomas con clonación de voz del agente, permitiendo sistemas IVR que mantienen una identidad de voz consistente en diferentes mercados. Su latencia de 150 ms en streaming lo hace adecuado para conversaciones en tiempo real.

- Producción de audiolibros y podcasts: gracias a la corrección de pronunciación mediante fonemas, se pueden generar narraciones precisas en chino e inglés con control sobre el ritmo y la emoción. La naturalidad prosódica superior a CosyVoice 2.0 reduce la necesidad de edición posterior.

- Asistentes de voz personalizados: la clonación zero-shot permite crear asistentes con la voz del usuario a partir de una muestra breve de audio. El soporte de instrucciones facilita ajustar el tono y la velocidad según el contexto de uso.

- Generación de contenido educativo multilingüe: el modelo puede producir lecciones de audio en varios idiomas con la misma voz, lo que resulta útil para plataformas de aprendizaje de idiomas que necesitan materiales consistentes.

- Doblaje y localización de contenido audiovisual: la clonación cross-lingual permite doblar vídeos o animaciones manteniendo la voz original del personaje en diferentes idiomas. El control fino de pronunciación ayuda con nombres propios y términos técnicos.

- Sistemas de lectura de pantalla y accesibilidad: la normalización de texto integrada permite leer correctamente números, fechas y símbolos, lo que mejora la experiencia de usuarios con discapacidad visual en aplicaciones multilingües.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados publicados en la model card oficial, comparando Fun-CosyVoice3-0.5B-2512 con otros sistemas TTS. Las métricas son CER (Character Error Rate) para chino y WER (Word Error Rate) para inglés, junto con la similitud del hablante (Speaker Similarity) en porcentaje.

| Modelo | Open-Source | Tamano | test-zh CER (%) ↓ | test-zh Similitud (%) ↑ | test-en WER (%) ↓ | test-en Similitud (%) ↑ | test-hard CER (%) ↓ | test-hard Similitud (%) ↑ |
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

La versión con RL (Fun-CosyVoice3-0.5B-2512_RL) muestra la mejor precisión de contenido entre todos los modelos open-source, con un CER de 0.81% en chino y un WER de 1.68% en inglés, superando incluso a sistemas propietarios como MiniMax-Speech en el conjunto test-hard.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 0.5B parámetros y el repositorio ocupa 11.8 GB. Con cuantización a 8 bits, se estima que puede funcionar con 4-6 GB de VRAM; en FP16, necesitaría aproximadamente 8-10 GB.
- GPU recomendadas: para inferencia en tiempo real con streaming, se recomienda al menos una GPU de gama media como RTX 3060 (12 GB) o superior. Para despliegue concurrente, una A100 o H100 es adecuada.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de 8 GB o más, como RTX 3070, RTX 4060 Ti o superiores, especialmente con cuantización.
- Opciones de despliegue: el repositorio oficial de CosyVoice incluye soporte para vLLM (desde mayo de 2025), TensorRT-LLM con runtime Triton (contribución de NVIDIA), y scripts de inferencia estándar. También se puede usar con llama.cpp si se convierte a GGUF, aunque no es el formato oficial.
- Latencia y throughput: con streaming bidireccional, la latencia puede ser tan baja como 150 ms. El throughput depende del hardware; en una A100 se pueden generar múltiples flujos de audio en paralelo.

## Comparativa con modelos similares

| Modelo | Tamano | Idiomas | Licencia | Contexto | Puntos fuertes |
|---|---|---|---|---|---|
| Fun-CosyVoice3-0.5B-2512 | 0.5B | 9 idiomas + 18 dialectos | Apache 2.0 | no disponible | Mejor CER/WER del segmento open-source, streaming, corrección de pronunciación |
| CosyVoice2-0.5B | 0.5B | 9 idiomas | Apache 2.0 | no disponible | Predecesor, menor calidad en consistencia de contenido |
| F5-TTS | 0.3B | Multilingüe (limitado) | MIT | no disponible | Más ligero, pero peor similitud de hablante |
| Spark TTS | 0.5B | Multilingüe | Apache 2.0 | no disponible | Similitud de hablante significativamente peor (66.0% vs 78.0%) |
| VoxCPM | 0.5B | Multilingüe | Apache 2.0 | no disponible | Mejor CER en chino (0.93%) pero peor en test-hard (8.87%) |

## Limitaciones y advertencias

- La calidad de la clonación de voz depende de la calidad y duración de la muestra de audio de referencia. Muestras cortas o con ruido pueden degradar la similitud del hablante.
- El modelo puede presentar alucinaciones o errores de pronunciación en nombres propios, términos técnicos o palabras fuera del vocabulario de entrenamiento, especialmente en idiomas con menos representación.
- Aunque soporta 9 idiomas, la calidad puede variar entre ellos. Los idiomas con más datos de entrenamiento (chino e inglés) probablemente tengan mejor rendimiento que otros.
- La normalización de texto integrada puede fallar con formatos muy específicos o poco comunes, como ciertas notaciones científicas o abreviaturas no estándar.
- La versión RL del modelo no se ha publicado por separado en este repositorio; solo está disponible como parte del lanzamiento completo.
- No se han documentado sesgos específicos, pero como cualquier modelo de TTS entrenado con datos web, puede reflejar sesgos de género, acento o registro presentes en los datos de entrenamiento.
- Para uso en producción, se recomienda validar la calidad del audio generado en el dominio específico de la aplicación, ya que los benchmarks no cubren todos los escenarios posibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Modelo en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio GitHub: https://github.com/QwenAudio/CosyVoice
- Paper CosyVoice 3.0: https://arxiv.org/abs/2505.17589
- Paper CosyVoice 2.0: https://arxiv.org/abs/2412.10117
- Paper CosyVoice 1.0: https://arxiv.org/abs/2407.05407
- Demos de CosyVoice 3.0: https://funaudiollm.github.io/cosyvoice3/
- Demos de CosyVoice 2.0: https://funaudiollm.github.io/cosyvoice2/
- Conjunto de evaluación CV3-Eval: https://github.com/FunAudioLLM/CV3-Eval
- Versión ONNX (contribución de terceros): https://huggingface.co/Lourdle/Fun-CosyVoice3-0.5B-2512_ONNX
