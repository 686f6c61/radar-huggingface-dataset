# gcoli/whisper-large-v3-turbo-swiss-german-mit

## Resumen

Whisper Large-v3-Turbo Swiss German MIT es un modelo de reconocimiento automático del habla (ASR) especializado en la transcripción de dialectos del alemán suizo (código ISO `gsw`) a alemán estándar. Lo desarrolla el usuario gcoli como un fine-tune LoRA de `openai/whisper-large-v3-turbo`, con los pesos del adaptador fusionados en el modelo final. Su relevancia principal es la licencia: mientras que la mayoría de modelos públicos para alemán suizo heredan la licencia CC BY-NC de SwissDial y no pueden usarse comercialmente, este checkpoint se entrena exclusivamente con material bajo licencia MIT (FHNW/i4ds), lo que da una cadena de licencias limpia de extremo a extremo.

La arquitectura es la del transformer encoder-decoder de Whisper, con 808,9 millones de parámetros en formato safetensors fp16. El modelo transcribe audio de 16 kHz mono y genera texto en alemán estándar, no en ortografía dialectal. Se distribuye en dos formatos: safetensors para `transformers` en la raíz del repositorio y CTranslate2 float16 en el subdirectorio `ct2/` para `faster-whisper`.

El modelo está pensado para un nicho concreto: aplicaciones de producción que necesitan transcribir habla suiza alemana sin restricciones de uso comercial. No es un modelo multilingüe de propósito general; de hecho, el fine-tune degrada ligeramente el rendimiento en otros idiomas respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 808.878.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | fp16 (safetensors), float16 (CTranslate2), int8_float16 (CTranslate2); conversión a MLX para Apple Silicon |
| Idiomas soportados | Alemán suizo (`gsw`) como entrada, alemán estándar (`de`) como salida; mantiene capacidades residuales en de, en, fr, it, es |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) en la raíz; CTranslate2 float16 en `ct2/` |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atención estándar y 808,9 millones de parámetros. Sobre esa base se aplicó un fine-tune LoRA con rango 32, alpha 64, dropout 0,05 y módulos objetivo `q_proj` y `v_proj`. El adaptador se fusionó en los pesos tras el entrenamiento, por lo que el checkpoint distribuido es un modelo completo, no un adaptador separado.

El entrenamiento usó 80 horas de audio: 40 horas del Swiss Parliaments Corpus v2 de FHNW/i4ds (Bern) y 40 horas del corpus del Gemeinderat de Zúrich. El corpus de Zúrich es solo audio; las transcripciones se generaron con `openai/whisper-large-v3` y se filtraron por confianza (`avg_logprob > -0.45`, `no_speech_prob < 0.3`, ratio de compresión < 2,2 y rechazo de bucles de repetición). La configuración fue: learning rate 3e-4 con decaimiento lineal, 500 pasos de warmup, una época, batch 16, bf16 y gradient checkpointing, sobre una única RTX 3080 Ti de 12 GB durante aproximadamente 1,6 horas. Dos hallazgos del autor: el learning rate domina el resultado (1e-3 no aportó ninguna mejora; 3e-4 ganó 1,8 puntos de WER de inmediato) y la mezcla de fuentes importa más que el volumen (ambos corpus deben estar presentes, pero 80 h rinden igual que 160 h o 247 h).

## Capacidades

- Reconocimiento automático del habla para dialectos del alemán suizo, con salida en alemán estándar.
- Transcripción de audio de 16 kHz mono, con soporte de grabaciones largas mediante segmentación.
- Modo de transcripción (`task: transcribe`) con token de idioma `de`.
- Capacidades multilingües residuales en alemán, inglés, francés, italiano y español, con una degradación de 0,3 a 1,0 puntos de WER respecto al modelo base.
- Despliegue en `transformers` y en `faster-whisper`/CTranslate2.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento; es un modelo puramente ASR.

## Casos de uso

- Transcripción de sesiones parlamentarias y plenos municipales: el modelo se entrenó precisamente con discurso parlamentario suizo, por lo que es adecuado para digitalizar actas de parlamentos cantonales y consejos municipales, con la ventaja de que la salida ya está en alemán estándar y no requiere normalización dialectal posterior.
- Subtitulado de contenido audiovisual suizo: permite generar subtítulos en alemán estándar para vídeos con habla dialectal, integrándose en pipelines con `faster-whisper` y su RTF de 0,033 medido en una RTX 3080 Ti.
- Atención al cliente en Suiza: transcripción de llamadas o mensajes de voz de clientes que hablan en dialecto suizo, convirtiéndolos a texto estándar para su procesamiento posterior en un CRM o sistema de tickets.
- Documentación clínica y administrativa: dictado de informes en consultas y oficinas públicas donde el personal habla en dialecto, con la salida en alemán estándar lista para el sistema de gestión documental.
- Investigación lingüística y dialectología: generación de transcripciones estandarizadas de corpus orales suizos para análisis comparativos entre los 17 dialectos cubiertos por el conjunto de evaluación.
- Accesibilidad: subtitulado automático de reuniones y eventos en vivo para personas con discapacidad auditiva, usando el modelo con `condition_on_previous_text=False` para evitar la invención de texto en grabaciones largas.
- Uso comercial sin restricciones: cualquier producto o servicio que requiera transcripción de alemán suizo y no pueda asumir una licencia CC BY-NC, gracias a la cadena MIT base-datos-resultado.

## Benchmarks y rendimiento

Resultados medidos por el autor en el All Swiss German Dialects Test Set de FHNW/i4ds (5750 clips, 12,7 h, 17 dialectos), decodificado con `faster-whisper` (CTranslate2, float16, beam 5) en una RTX 3080 Ti. El conjunto está dividido de forma disjunta por hablante en dev (2930 clips, usado para selección de modelo) y final (2820 clips, reservado).

| Modelo | WER dev | WER final | CER | RTF |
|---|---|---|---|---|
| Este checkpoint | 23,7 % | 25,9 % | 13,4 % | 0,033 |
| `openai/whisper-large-v3-turbo` (sin fine-tune) | 26,5 % | 28,5 % | 14,6 % | 0,036 |
| `openai/whisper-large-v3` (sin fine-tune) | 24,0 % | 26,3 % | 13,7 % | 0,080 |

El autor reporta una mejora de 2,8 puntos de WER sobre el modelo base a velocidad idéntica. En grabaciones largas (26 archivos de ~15 min), desactivar `condition_on_previous_text` evita una pérdida de 2,5 a 11,7 puntos de WER según la familia de modelos; se espera un deterioro de 1 a 3 puntos de WER respecto a los resultados de frase corta.

Regresión multilingüe medida en `google/fleurs` (250 clips de validación por idioma, sin prompt, beam 5):

| Modelo | Alemán | Inglés | Francés | Italiano | Español |
|---|---|---|---|---|---|
| Este checkpoint | 5,2 % | 5,7 % | 5,5 % | 3,4 % | 3,9 % |
| `openai/whisper-large-v3-turbo` | 4,9 % | 4,9 % | 5,2 % | 2,4 % | 3,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2-3 GB para los pesos de 808,9 M de parámetros, más el overhead de activaciones y decodificación; el autor entrenó con una RTX 3080 Ti de 12 GB y el modelo cabe holgadamente en GPUs consumer.
- La cuantización `int8_float16` en CTranslate2 reduce el uso de VRAM a costa de aproximadamente 0,3 puntos de WER, una opción razonable en entornos con memoria limitada.
- GPUs recomendadas: RTX 3080 Ti, RTX 4090 y superiores para producción; A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPUs consumer de gama media con suficiente VRAM; el autor no documenta requisitos mínimos exactos.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `faster-whisper`/CTranslate2 (recomendado, con los pesos de `ct2/`), y conversión a MLX para Apple Silicon con `mlx_whisper`.
- Latencia y throughput: RTF de 0,033 medido en una RTX 3080 Ti con CTranslate2 float16 y beam 5, es decir, aproximadamente 30 veces más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (final, dialectos suizos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 808,9 M | 30 s por segmento | 25,9 % | MIT | Hugging Face (`gcoli/whisper-large-v3-turbo-swiss-german-mit`) |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s por segmento | 28,5 % | MIT | Hugging Face (OpenAI) |
| `openai/whisper-large-v3` | 1550 M | 30 s por segmento | 26,3 % | Apache-2.0 | Hugging Face (OpenAI) |
| Modelos públicos basados en SwissDial | No disponible | No disponible | No disponible | CC BY-NC | No disponible |

La ventaja diferencial frente a los modelos entrenados con SwissDial es la licencia MIT, que permite uso comercial. Frente a los modelos base de OpenAI, ofrece mejor WER en dialectos suizos a velocidad comparable o superior.

## Limitaciones y advertencias

- El conjunto de evaluación es habla leída y los datos de entrenamiento son discurso parlamentario; el rendimiento en conversación espontánea, pódcasts o grabaciones con ruido no está documentado y probablemente sea peor.
- Riesgo de alucinación en grabaciones largas: con `condition_on_previous_text` activado (valor por defecto en `faster-whisper`), el modelo puede empezar a inventar texto, con una salida hasta un 14 % más larga que la referencia. Se recomienda desactivar esa opción y el filtro VAD.
- El fine-tune degrada entre 0,3 y 1,0 puntos de WER en otros idiomas (alemán, inglés, francés, italiano, español); para un sistema multilingüe conviene mantener el modelo base para todo excepto el alemán suizo.
- La salida es alemán estándar, no ortografía dialectal; no debe esperarse transcripción literal del dialecto.
- El corpus de Zúrich es solo audio y sus transcripciones se generaron con otro modelo ASR (`whisper-large-v3`), por lo que arrastran los errores de ese sistema.
- La licencia MIT permite uso comercial, pero el autor no documenta una evaluación de sesgos demográficos o dialectales más allá del conjunto de prueba.
- No se documentan benchmarks de robustez ante ruido, solapamiento de hablantes ni audio telefónico de banda estrecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo usado para generar transcripciones del corpus de Zúrich: https://huggingface.co/openai/whisper-large-v3
- Dataset de evaluación y entrenamiento: https://huggingface.co/datasets/i4ds/SPC
- Conjunto de evaluación multilingüe: https://huggingface.co/datasets/google/fleurs
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio de MLX Whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
