# dyeto/kanbior-fon-asr-v1

## Resumen

kanbior-fon-asr-v1 es un modelo de reconocimiento automático del habla (ASR) especializado en fon, una lengua gbe hablada principalmente en Benín. Lo desarrolla Donatien Yeto (usuario dyeto) como fine-tuning de openai/whisper-small sobre el corpus JML-fon-speech-v1, y constituye la pieza de reconocimiento de voz del asistente vocal Kanbior. El modelo transcribe audio en fon preservando los signos diacríticos de tono, un aspecto crítico en una lengua tonal donde el tono es fonémico.

Con 241,7 millones de parámetros, hereda la arquitectura encoder-decoder Transformer de Whisper-small y una ventana de contexto de audio de 30 segundos. Su relevancia radica en cubrir una lengua de bajos recursos para la que los modelos multilingües generales no ofrecen cobertura fiable, y en hacerlo con un coste de entrenamiento muy contenido (unas 9 horas en una única GPU T4 de Kaggle).

El modelo se publica con licencia CC-BY-SA-4.0, la misma que el corpus de entrenamiento, e incluye una variante convertida a CTranslate2 para su uso con faster-whisper, lo que facilita el despliegue en CPU con cuantización int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s (heredada de Whisper) |
| Tipos de cuantizacion | fp16 (entrenamiento e inferencia GPU); int8 en la variante CTranslate2 |
| Idiomas soportados | fon (fon-Latn); se invoca con el token de idioma `fr` por ausencia de token fon en Whisper |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (transformers); variante CT2 para faster-whisper |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un Transformer encoder-decoder con atención completa, y se afina de extremo a extremo para transcripción en fon. La entrada de audio se remuestrea a 16 kHz. Dado que el tokenizador de Whisper no dispone de token de idioma para el fon, el entrenamiento y la inferencia se realizan forzando `language="fr"`, de modo que el modelo aprende a mapear el espacio acústico del fon bajo la etiqueta léxica francesa.

El corpus de entrenamiento es la totalidad del audio transcrito de JML-fon-speech-v1, dividido por hablante en proporción aproximada 80/10/10 por horas: 50.675 clips (105,2 h, 390 hablantes) para entrenamiento, 6.837 clips (14,0 h) para validación y 6.724 clips (14,0 h) para test, con hablantes disjuntos entre particiones. El texto se normalizó a Unicode NFC, se corrigieron caracteres espurios y se eliminaron las comillas en torno a palabras francesas; además se descartaron 323 clips con dígitos en la transcripción, por lo que el modelo no está entrenado para escribir números. El ajuste consistió en 12.000 pasos con batch de 16 (unas 3,8 épocas), tasa de aprendizaje 1e-5 con 500 pasos de calentamiento, AdamW fused, scheduler lineal y precisión mixta fp16 nativa, ejecutado en una sola GPU T4 de Kaggle durante aproximadamente 9 horas. No se documenta RLHF ni DPO.

## Capacidades

- Transcripción de voz en fon con salida en texto latino y marcas de tono.
- Reconocimiento robusto a variación de hablante: el conjunto de test incluye 137 hablantes no vistos en entrenamiento ni validación.
- Funcionamiento en CPU mediante la variante CTranslate2 con cuantización int8 y decodificación greedy.
- Integración directa con el pipeline `automatic-speech-recognition` de transformers y con faster-whisper.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades de visión, audio generativo ni diálogo; es exclusivamente un modelo ASR.
- Cobertura monolingüe: no traduce ni transcribe otros idiomas de forma fiable.

## Casos de uso

- Asistente vocal en fon: es el componente ASR del proyecto Kanbior, pensado para recibir órdenes de voz de usuarios en fon y encadenarlas a un módulo de comprensión o diálogo.
- Subtitulado y transcripción de archivos de audio en fon: útil para digitalizar grabaciones de campo, entrevistas o material radiofónico en esta lengua.
- Documentación lingüística: transcripción asistida de corpus orales con preservación de tonos, lo que facilita el análisis fonológico posterior.
- Preservación de lenguas de bajos recursos: permite construir archivos textuales buscables a partir de audio en fon con un coste de cómputo mínimo.
- Aplicaciones educativas: dictado y ejercicios de escritura en fon con marcas tonales, aprovechando la salida diacritizada del modelo.
- Despliegue en entornos con recursos limitados: la variante int8 para CPU permite ejecución en servidores sin GPU o en dispositivos de borde para transcripción por lotes.
- Investigación en ASR multilingüe: sirve como referencia de fine-tuning de Whisper sobre una lengua tonal africana con corpus pequeño.

## Benchmarks y rendimiento

Conjunto de test de 6.724 clips (14,0 h) y 137 hablantes no vistos:

| Modelo | WER | WER sin tonos | CER | CER sin tonos |
|---|---|---|---|---|
| kanbior-fon-asr-v1 | 20,5 | 15,5 | 8,5 | 6,6 |

Comparativa sobre 500 clips de test seleccionados al azar (decodificación greedy):

| Modelo | Runtime | WER | WER sin tonos | CER | CER sin tonos |
|---|---|---|---|---|---|
| kanbior-fon-asr-v1 | transformers, fp16, GPU | 21,0 | 16,0 | 9,0 | 7,0 |
| kanbior-fon-asr-v1 | faster-whisper, int8, CPU | 21,1 | 16,1 | 8,8 | 6,9 |
| finanfa-fon-asr-v6 | faster-whisper, int8, CPU | 29,5 | 23,7 | 12,8 | 10,2 |

Evolución en validación (300 clips) durante el entrenamiento:

| Paso | WER | WER sin tonos | CER | CER sin tonos |
|---|---|---|---|---|
| 2.000 | 23,6 | 18,0 | 9,5 | 7,3 |
| 4.000 | 19,6 | 14,8 | 7,8 | 6,0 |
| 6.000 | 19,1 | 14,0 | 7,6 | 5,7 |
| 8.000 | 18,7 | 13,7 | 9,2 | 7,5 |
| 10.000 | 18,5 | 13,6 | 9,1 | 7,5 |
| 12.000 (modelo final) | 18,7 | 13,8 | 9,3 | 7,6 |

El autor advierte que finanfa-v6 podría haberse entrenado con algunos de los hablantes del conjunto de comparación, lo que favorecería a ese modelo.

## Requisitos de hardware

- Inferencia en fp16: el modelo ocupa aproximadamente 0,5 GB de pesos; con activaciones y buffers de atención la VRAM necesaria es inferior a 2 GB, por lo que cabe en cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100, H100).
- Inferencia en CPU: la variante CTranslate2 con int8 reduce el modelo a unos 250 MB y permite ejecución en CPU sin GPU, como demuestran las pruebas del autor en faster-whisper int8 sobre CPU.
- Despliegue: transformers (pipeline `automatic-speech-recognition`), faster-whisper con CTranslate2, y potencialmente cualquier runtime compatible con pesos Whisper convertidos (por ejemplo, servidores de inferencia basados en Whisper).
- Throughput y latencia: no disponibles de forma explícita; el autor solo documenta el tiempo de entrenamiento (unas 9 h en una T4) y la configuración de decodificación (greedy, `beam_size=1`, sin timestamps en faster-whisper).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kanbior-fon-asr-v1 | 241,7 M | 30 s | 20,5 | CC-BY-SA-4.0 | Hugging Face (transformers y CT2) |
| finanfa-fon-asr-v6 | no disponible | no disponible | 29,5 (500 clips) | no disponible | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no aplica a fon (sin fine-tuning específico) | MIT (modelo base) | Hugging Face |

La comparación directa con finanfa-fon-asr-v6 en el mismo subconjunto de 500 clips y con idéntico runtime (faster-whisper int8 en CPU) arroja una diferencia de 8,4 puntos de WER a favor de kanbior-fon-asr-v1, si bien el autor señala la posible contaminación de hablantes en el modelo comparado. Frente a whisper-small sin ajustar, la diferencia cualitativa es la cobertura efectiva del fon y la preservación de tonos, capacidades que el modelo base no ofrece de forma específica.

## Limitaciones y advertencias

- El modelo no tiene token de idioma fon en Whisper; es obligatorio pasar `language="fr"` en la inferencia, lo que puede inducir sesgos hacia el francés en casos ambiguos.
- No fue entrenado con dígitos: los clips con números en la transcripción se descartaron, por lo que la salida numérica no es fiable.
- WER de 20,5 en test (15,5 sin tonos) indica un margen de error considerable para producción sensible a la exactitud, especialmente en la preservación de tonos.
- Riesgo de alucinación inherente a los modelos Whisper, agravado por el dominio limitado del corpus de entrenamiento.
- Corpus de entrenamiento de 105,2 h y 390 hablantes: la cobertura de variantes dialectales, ruido ambiental y condiciones acústicas diversas es limitada.
- Licencia CC-BY-SA-4.0: el uso comercial exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- Modelo monolingüe en fon; no debe esperarse transcripción fiable de otras lenguas.
- El repositorio ocupa 36,7 GB, probablemente por artefactos de entrenamiento; conviene descargar solo los pesos necesarios.
- Sin datos publicados de latencia ni throughput, la planificación de capacidad en producción requiere medición propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dyeto/kanbior-fon-asr-v1
- Variante CTranslate2 para faster-whisper: https://huggingface.co/dyeto/kanbior-fon-asr-v1-ct2
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/JaimeMaLangue/JML-fon-speech-v1
- Código del proyecto Kanbior: https://github.com/dyeto/kanbior
- Modelo comparado finanfa-fon-asr-v6: https://huggingface.co/finanfa-tech/finanfa-fon-asr-v6
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
