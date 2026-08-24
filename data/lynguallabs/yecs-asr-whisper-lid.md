# LyngualLabs/yecs-asr-whisper-lid

## Resumen

El modelo `LyngualLabs/yecs-asr-whisper-lid` es un ajuste fino de `openai/whisper-small` sobre el corpus YECS (Yoruba-English Code-Switching), un conjunto de datos de 120 horas de audio bilingüe desarrollado por LyngualLabs. Su propósito es transcribir automáticamente habla con alternancia de código entre yoruba e inglés, y al mismo tiempo etiquetar el idioma de cada palabra mediante etiquetas inline (`<en>` y `<yo>`). Esto lo convierte en un modelo de reconocimiento automático del habla (ASR) con identificación de idioma (LID) integrada, algo poco común en sistemas de bajos recursos.

El modelo se entrena sobre la arquitectura Whisper-small, un transformer encoder-decoder de 244 millones de parámetros, con una ventana de audio de 30 segundos. La innovación principal es la inyección de cuatro tokens de etiqueta adicionales (no especiales) en el vocabulario, lo que permite generar transcripciones con marcas de idioma por palabra sin degradar el rendimiento respecto al modelo base. Según la model card, el sistema alcanza un WER de 16,81 % (con tonos) o 14,04 % (sin tonos) y una precisión LID por palabra del 99,54 %.

La relevancia actual de este modelo radica en su enfoque en lenguas de bajos recursos y en la integración de ASR y LID en una sola pasada, lo que facilita su uso en sistemas de subtitulado, análisis de conversaciones bilingües y herramientas de accesibilidad para comunidades africanas de habla yoruba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.737.984 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (yo), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con 244 millones de parámetros entrenado sobre 680 000 horas de audio multilingüe. El ajuste fino se realiza sobre el corpus YECS, que contiene 120 horas de habla con alternancia de código yoruba-inglés. Se añadieron cuatro tokens de etiqueta (`<en>`, `</en>`, `<yo>`, `</yo>`) mediante `add_tokens` (no especiales) y se redimensionaron las embeddings para acomodar el nuevo vocabulario.

El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 1e-5 y precisión bf16. La arquitectura es la misma que la de Whisper, sin modificaciones estructurales; la innovación reside en el etiquetado inline, que permite que el modelo genere transcripciones con marcas de idioma por palabra de forma simultánea a la transcripción, sin necesidad de un clasificador de idioma separado.

## Capacidades

- Transcripción automática del habla (ASR) en yoruba e inglés con alternancia de código.
- Identificación de idioma por palabra, integrada en la salida mediante etiquetas `<en>` y `<yo>`.
- Generación de transcripciones con y sin tonos (WER toneless 14,04 % frente a 16,81 % con tonos).
- Compatible con la API de `transformers` y con pipelines de ASR estándar.
- Soporte para inferencia en GPU y despliegue en endpoints compatibles con Hugging Face.

## Casos de uso

- **Transcripción de entrevistas y conversaciones bilingües**: el modelo transcribe audio en el que se alterna yoruba e inglés, útil para periodistas e investigadores que trabajan con comunidades nigerianas.
- **Análisis sociolingüístico**: gracias a las etiquetas de idioma por palabra, se puede analizar la frecuencia y la posición de las alternancias de código en conversaciones naturales, sin etiquetado manual.
- **Subtitulado automático para vídeo en yoruba**: la transcripción con LID integrada permite generar subtítulos que indiquen el idioma de cada segmento, mejorando la accesibilidad.
- **Sistemas de atención al cliente multilingüe**: puede transcribir llamadas de soporte en las que el usuario mezcla yoruba e inglés, facilitando la derivación a agentes o el análisis de sentimiento.
- **Creación de datos de entrenamiento para TTS**: la salida etiquetada permite seleccionar segmentos por idioma y entrenar voces sintéticas específicas para cada lengua.
- **Herramientas de accesibilidad para personas con discapacidad auditiva**: transcripción en tiempo real de conversaciones mixtas en yoruba-inglés, con indicación del idioma para contextualizar la lectura.

## Benchmarks y rendimiento

Según la model card del autor, los resultados en el conjunto de test de YECS (9.905 unidades de transcripción, con las etiquetas eliminadas para el cálculo de WER) son:

| Metrica | Valor |
|---|---|
| WER (con tonos) | 16,81 % |
| WER (sin tonos) | 14,04 % |
| CER | 6,25 % |
| Precisión LID por palabra | 99,54 % |

El modelo iguala al baseline sin LID (`yecs-asr-whisper-plain`, WER 16,73 %) dentro del ruido estadístico, lo que indica que la adición de las etiquetas de idioma no degrada significativamente el rendimiento de transcripción. No se han publicado comparaciones formales con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 242 millones de parámetros; en fp16 ocupa aproximadamente 484 MB, y en int8 unos 242 MB.
- Cabe en cualquier GPU de consumo moderno: una RTX 3060 (12 GB) o RTX 4090 es suficiente para inferencia con lotes pequeños.
- También puede ejecutarse en CPU para uso puntual, aunque la latencia será mayor.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), Hugging Face Inference Endpoints (etiquetado como `endpoints_compatible`), y posiblemente `vLLM` o `whisper.cpp` con conversión de pesos (no documentado en la información disponible).
- La latencia típica de Whisper-small es de unos 0,1-0,3 veces el tiempo real en GPU moderna, aunque no se han publicado datos específicos para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LID | WER (YECS) | Licencia |
|---|---|---|---|---|---|
| `yecs-asr-whisper-lid` (este) | 242 M | 30 s audio | Sí (inline) | 16,81 % (tonos) | Apache-2.0 |
| `yecs-asr-whisper-plain` | 242 M | 30 s audio | No | 16,73 % | Apache-2.0 |
| `yecs-asr-llm-lid` | no disponible | no disponible | Sí | no disponible | Apache-2.0 |
| Meta MMS (mms-1b-all) | 1 B | 30 s audio | No | no disponible | CC-BY-NC 4.0 |

La comparativa se limita a los modelos relacionados de LyngualLabs y a MMS, mencionado en el repositorio de benchmark. No hay datos públicos de WER para los modelos LLM de LyngualLabs en la información disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado únicamente con datos de yoruba e inglés; no soporta otros idiomas ni la alternancia con otras lenguas.
- La ventana de contexto es de 30 segundos de audio, por lo que no es adecuado para transcribir segmentos largos sin segmentación previa.
- El rendimiento con tonos (16,81 % WER) es peor que sin tonos (14,04 %), lo que sugiere dificultades con la representación tonal del yoruba.
- No se han publicado evaluaciones de sesgo ni de robustez ante ruido, acentos o condiciones acústicas adversas.
- Aunque la licencia es Apache-2.0, el corpus YECS puede tener restricciones adicionales para uso comercial (no se detalla en la información disponible).
- La precisión LID es muy alta (99,54 %), pero se ha medido en el conjunto de test de YECS; su rendimiento en habla espontánea o con acentos no representados es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LyngualLabs/yecs-asr-whisper-lid
- Repositorio de benchmark y código: https://github.com/osinkolu/yecs-asr-benchmark (carpeta tag-injection/)
- Página del corpus YECS: https://www.lynguallabs.org/yecs
- Web de LyngualLabs: https://www.lynguallabs.org/
- Modelo baseline sin LID: https://huggingface.co/LyngualLabs/yecs-asr-whisper-plain
- Modelo LLM con LID: https://huggingface.co/LyngualLabs/yecs-asr-llm-lid
- Modelo omni-LLM: https://huggingface.co/LyngualLabs/yecsASR-omni-llm
