# 1Developer/cali-whisper-tiny.en-drop-006-production

## Resumen

El modelo `cali-whisper-tiny.en-drop-006-production` es un ajuste fino (fine-tuning) del modelo `1Developer/cali-whisper-tiny.en-drop-005-production`, que a su vez deriva de la arquitectura Whisper de OpenAI, concretamente de la variante `tiny.en` orientada a reconocimiento automático del habla (ASR) en inglés. Desarrollado por el usuario 1Developer, este modelo está diseñado para transcribir audio en inglés con una alta precisión, aunque los datos de entrenamiento y evaluación no están documentados en detalle.

Con 37,7 millones de parámetros, se trata de un modelo muy ligero, adecuado para entornos con recursos limitados. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas. El modelo se publica en formato safetensors y es compatible con la librería Transformers de Hugging Face. Su relevancia radica en ser un ejemplo de fine-tuning de Whisper para dominios específicos, aunque la ausencia de información sobre el dataset y el valor de WER de 0,0 en la evaluación sugieren un posible sobreajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (por el nombre y la variante .en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado para reconocimiento de voz y traducción. La variante `tiny.en` está optimizada para inglés y tiene un tamaño reducido (37,7 M de parámetros). El fine-tuning se realizó sobre el modelo base `1Developer/cali-whisper-tiny.en-drop-005-production` utilizando un dataset de tipo `audiofolder` (carpetas de audio sin metadatos detallados). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, batch de 16, optimizador AdamW con betas (0.9, 0.999), scheduler constante con warmup de 50 pasos y 500 pasos de entrenamiento en total. Se usó precisión mixta nativa (AMP). No se especifica el número de tokens de entrenamiento ni la composición del dataset, y no se menciona el uso de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, transcribiendo audio a texto.
- Generación de transcripciones con timestamp (si se usa la API de Whisper, aunque no se confirma en la documentación).
- Soporte para inferencia en tiempo real o por lotes mediante la librería Transformers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funciones propias de modelos de lenguaje general.
- No se indica soporte multilingüe; el modelo está orientado exclusivamente al inglés.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en inglés a texto, facilitando la generación de actas o subtítulos. Su tamaño reducido permite ejecutarlo en CPU o GPUs modestas.
- Subtitulado automático de vídeos: integrable en pipelines de procesamiento de vídeo para generar subtítulos en inglés, útil para creadores de contenido o plataformas educativas.
- Asistentes de voz: puede servir como componente de reconocimiento de voz en aplicaciones de asistente, aunque su limitación al inglés restringe su uso a mercados anglófonos.
- Análisis de llamadas de atención al cliente: transcripción de llamadas para su posterior análisis de sentimiento o extracción de información, siempre que el audio sea en inglés.
- Accesibilidad: ayuda a personas con discapacidad auditiva al convertir audio en texto en tiempo real, por ejemplo en conferencias o aulas.
- Investigación académica: como base para experimentos de fine-tuning en ASR, dado su pequeño tamaño y licencia permisiva, permitiendo probar técnicas de adaptación a dominios específicos.

## Benchmarks y rendimiento

El autor declara en la model card un valor de WER (Word Error Rate) de 0,0 en el conjunto de evaluación del dataset `audiofolder`. Este resultado, junto con una pérdida de validación de 0,0000, es inusualmente perfecto y sugiere un posible sobreajuste al conjunto de evaluación o un dataset de prueba muy reducido o trivial. No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estándar como LibriSpeech o Common Voice. Por tanto, estos datos deben interpretarse con cautela.

| Métrica | Valor |
|---|---|
| WER (evaluación, dataset audiofolder) | 0,0 |
| Pérdida de validación | 0,0000 |

## Requisitos de hardware

- Al tratarse de un modelo de 37,7 M de parámetros, la VRAM necesaria para inferencia es muy baja. En FP32, el peso ocupa aproximadamente 151 MB (37,7 M × 4 bytes). Con cuantización a 8 bits, se reduciría a unos 38 MB.
- Es ejecutable en GPUs consumer como NVIDIA GTX 1060 (6 GB) o superiores, e incluso en CPU con un rendimiento aceptable para audio corto.
- No se dispone de datos oficiales sobre latencia o throughput. En una GPU moderna (por ejemplo, RTX 3090), la transcripción de un audio de 10 segundos debería completarse en menos de un segundo, pero no hay cifras verificadas.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, por lo que puede servirse con herramientas como Hugging Face Inference Endpoints, o mediante frameworks como vLLM (aunque vLLM está más orientado a LLM, no a ASR). También se puede usar con pipelines de Transformers directamente.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base es `1Developer/cali-whisper-tiny.en-drop-005-production`, y existen otras variantes de la misma serie (drop-003, drop-004, v11) en el mismo repositorio. Como referencia, el modelo original `openai/whisper-tiny.en` tiene la misma arquitectura y tamaño (37,7 M parámetros) y está entrenado en un corpus masivo de audio en inglés. La diferencia principal es que este modelo ha sido ajustado en un dataset específico, aunque no se documenta su contenido. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El valor de WER de 0,0 en la evaluación es altamente sospechoso y probablemente indica sobreajuste al conjunto de evaluación o un dataset de prueba no representativo. No se debe asumir que el modelo funciona perfectamente en audio real.
- No se documenta el dataset de entrenamiento (composición, tamaño, procedencia), lo que impide evaluar su generalización a otros dominios o acentos.
- El modelo solo soporta inglés; no es adecuado para otros idiomas.
- No se especifican limitaciones de contexto de audio (duración máxima de la entrada), aunque Whisper suele manejar ventanas de 30 segundos por defecto.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni la seguridad del modelo.
- Al ser un modelo pequeño, su precisión en audio con ruido, acentos no estándar o vocabulario técnico puede ser limitada en comparación con modelos más grandes como Whisper small o medium.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/1Developer/cali-whisper-tiny.en-drop-006-production)
- [Modelo base drop-005](https://huggingface.co/1Developer/cali-whisper-tiny.en-drop-005-production)
- [Variante drop-004](https://huggingface.co/1Developer/cali-whisper-tiny.en-drop-004-production)
- [Variante v11](https://huggingface.co/1Developer/cali-whisper-tiny-en-v11)
- [Repositorio de Whisper (OpenAI)](https://github.com/openai/whisper)
