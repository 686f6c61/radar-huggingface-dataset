# emads/whisper-large-v3-urdu-v2

## Resumen

`emads/whisper-large-v3-urdu-v2` es un modelo de reconocimiento automático del habla (ASR) basado en un fine-tuning de `openai/whisper-large-v3` sobre el urdu pakistaní, en sus tres registros escritos: escritura urdu (Nastaʿlīq), urdu romanizado (chat) y code-switching urdu-inglés. El modelo introduce un token de control en el prefijo del decoder para seleccionar el registro de salida en tiempo de inferencia, lo que permite transcribir la misma señal de audio en convenciones ortográficas distintas sin necesidad de modelos separados.

Desarrollado por Emad Siddiq, el modelo se distingue de otros fine-tunes de Whisper para urdu por su capacidad de manejar el code-switching real (frases inglesas insertadas en discurso urdu) y por escribir las islas inglesas en alfabeto latino cuando se selecciona el registro mixto. Con 1.543 millones de parámetros, hereda la arquitectura encoder-decoder de Whisper large-v3 y su ventana de audio de 30 segundos. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (Transformer encoder-decoder) |
| Parametros totales | 1.543.494.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | urdu, ingles (con code-switching) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3` y se somete a un segundo fine-tuning (v2) sobre un conjunto de datos etiquetado por registro. La arquitectura es la de Whisper: un encoder de audio con atención y un decoder autorregresivo que genera tokens de texto. La innovación principal es el uso de tokens de control especiales (`<|scripturdu|>`, `<|scriptroman|>`, `<|scriptmixed|>`) que se insertan en el prefijo del decoder tras `<|notimestamps|>`. Durante el entrenamiento, cada muestra se etiqueta con el token correspondiente a su registro de salida, y las filas de code-switching reciben un peso de pérdida doble en los tokens de letras latinas.

El entrenamiento combina audio en urdu de múltiples fuentes (Common Voice, IndicVoices, Kathbath, PRUS, transliteraciones de IndicVoices-Hindi) con objetivos romanizados, y una cubeta mixta que incluye MUCS Hinglish reescrito a la convención urdu, audio en inglés con etiquetas latinas (FLEURS-en, LibriSpeech clean-100), y empalmes generados sobre la marcha de audio urdu e inglés. Todos los datos provienen de conjuntos con licencias permisivas (CC-0/CC-BY) y se aplicó un filtro de fuga para que los corpus de evaluación no entren en el entrenamiento.

## Capacidades

- Transcripción de audio en urdu en tres registros escritos seleccionables por token de control: escritura urdu, urdu romanizado (estilo chat) y code-switching urdu-inglés.
- Reconocimiento de code-switching real: mantiene las islas inglesas en alfabeto latino dentro de una matriz en escritura urdu, incluyendo palabras funcionales y frases completas, no solo sustantivos prestados.
- Soporte de decodificación greedy y generación con `transformers` estándar de Whisper.
- Multilingüe limitado a urdu e inglés (el modelo base soporta más idiomas, pero el fine-tuning se centra en estos dos).
- No soporta otras modalidades (visión, audio de entrada distinto a 16 kHz).

## Casos de uso

- Transcripción de contenido audiovisual en urdu: subtitulado de dramas, entrevistas o noticias en Pakistán, seleccionando el registro de escritura urdu para salida formal o romanizado para plataformas digitales.
- Atención al cliente automatizada: transcripción de llamadas en urdu-inglés code-switched, común en centros de contacto, para su análisis posterior o generación de resúmenes.
- Archivado de reuniones y conferencias: transcripción de audio de reuniones corporativas donde se mezclan frases en inglés y urdu, con el registro mixto para preservar la fidelidad del discurso.
- Análisis de redes sociales y contenido generado por usuarios: procesamiento de audios en urdu romanizado (estilo chat) para moderación o extracción de opiniones.
- Investigación sociolingüística: estudio de patrones de code-switching en conversaciones naturales, gracias a la separación de registros y la fidelidad de escritura de islas inglesas.
- Asistencia a personas con discapacidad auditiva: generación de subtítulos en tiempo real para contenido en urdu, eligiendo el registro más adecuado al contexto de visualización.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en su model card (evaluación del 2026-08-25, decodificación greedy con token de control coincidente con el registro y normalización de texto según el repositorio de entrenamiento):

| Benchmark | Metrica | Este modelo (v2) | v1 (fine-tune previo) |
|---|---|---|---|
| FLEURS ur_pk test (n=299) | WER | 16.65 | 16.87 |
| Common Voice Urdu test (n=1000) | WER | 15.98 | 15.74 |
| Roman-Urdu test (300 clips) | CER | 14.70 | 85.7 (v1 no puede escribir romanizado) |
| Urdu-English code-switch (1000 clips) | WER | 35.40 | 35.81 (v1 escribe islas en escritura urdu) |

Además, el autor reporta que en el conjunto de code-switching, el 37% de las islas inglesas se escriben en alfabeto latino (v1: 0%), con un 80% de las mismas oídas en algún formato. La fidelidad de registro es de 1.000 para urdu y 0.981 para romanizado, sin fugas entre registros. No se han publicado resultados en otros benchmarks generales (MMLU, HumanEval, etc.) por tratarse de un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Basándose en el tamaño de parámetros (1.54B), en fp16 los pesos ocupan ~3 GB, pero con activaciones y overhead de `transformers` se recomienda al menos 8 GB para batch 1 y audios de hasta 30 segundos.
- GPU recomendadas: tarjetas con 8 GB o más (RTX 3060/3070, RTX 4060, A10, A100). Para producción con alta concurrencia, se sugiere A100 o H100.
- No cabe en GPUs de consumo de gama baja (4 GB o menos) sin cuantización, pero no se ofrecen versiones cuantizadas en el repositorio.
- Opciones de despliegue: `transformers` (Python), posiblemente compatible con vLLM o TGI si se convierte a los formatos adecuados, aunque no hay documentación específica. Para CPU, se puede usar `whisper.cpp` si se convierte a GGUF, pero no se proporciona.
- Latencia y throughput: no disponibles. Como referencia, Whisper large-v3 en GPU moderna procesa un clip de 30 s en ~1-2 s con batch 1, pero este fine-tune puede variar.

## Comparativa con modelos similares

| Modelo | Params | Contexto | WER FLEURS ur_pk | WER Common Voice ur | Licencia |
|---|---|---|---|---|---|
| emads/whisper-large-v3-urdu-v2 | 1.54B | 30 s | 16.65 | 15.98 | Apache-2.0 |
| emads/whisper-large-v3-urdu-v1 (mismo autor) | 1.54B | 30 s | 16.87 | 15.74 | Apache-2.0 |
| openai/whisper-large-v3 (base) | 1.55B | 30 s | no disponible | no disponible | MIT |

El v2 mejora sustancialmente al v1 en los registros romanizado y code-switching, que son los casos donde el v1 falla (CER de 85.7% en romanizado). Frente al modelo base, el fine-tuning reduce el WER en urdu, aunque no se dispone de cifras comparativas del base en estos conjuntos. Otros fine-tunes como `kingabzpro/whisper-large-v3-urdu` (entrenado en Common Voice 17) existen, pero no se han encontrado resultados públicos comparables en los mismos benchmarks.

## Limitaciones y advertencias

- El audio largo requiere chunking externo: la ventana de 30 segundos es fija y no se maneja de forma automática.
- El WER en code-switching está dominado por la dificultad de reconocer conversación informal pakistaní, no por la elección de registro; es el punto débil conocido.
- La ortografía romanizada sigue convenciones de chat y puede presentar variantes (ke/kay, hai/he); se recomienda usar plegado de variantes al evaluar.
- La decodificación sin token de script no está soportada: siempre hay que pasar el prefijo con el token de control.
- Los benchmarks de romanizado y code-switching se basan en referencias generadas por LLM o corregidas manualmente; la naturalidad nativa del romanizado aún está pendiente de revisión.
- Aunque la licencia es Apache-2.0, los datos de entrenamiento provienen de fuentes con licencias CC-0/CC-BY, pero el usuario debe verificar el cumplimiento de las licencias de los datos de origen si redistribuye el modelo o sus derivados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/emads/whisper-large-v3-urdu-v2)
- [Repositorio de entrenamiento (github.com/emad-siddiq/urdu-llm)](https://github.com/emad-siddiq/urdu-llm)
- [Paper relacionado (arXiv:2605.17846)](https://arxiv.org/abs/2605.17846)
- [Modelo base: openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [Repositorio oficial de Whisper (OpenAI)](https://github.com/openai/whisper)
