# landco11/whisper-large-v3-turbo-russian-codeswitch

## Resumen

landco11/whisper-large-v3-turbo-russian-codeswitch es un ajuste fino del modelo de reconocimiento automático de voz Whisper large-v3-turbo, especializado en dictado en ruso con términos técnicos en inglés incrustados (code-switching ru-en), del tipo "Открой Python и сделай git push". El modelo parte de coriollon/whisper-large-v3-turbo-russian (a su vez derivado del Whisper large-v3-turbo de OpenAI) y se entrena mediante LoRA para que la transcripción escriba los términos ingleses en alfabeto latino, en lugar de transliterarlos al cirílico ("питон").

El problema que resuelve es muy concreto: los modelos ASR en ruso tienden a transcribir los términos técnicos ingleses con ortografía cirílica o a corromperlos, lo que rompe cualquier búsqueda posterior, indexación o pipeline de documentación. Este variante reduce el WER de un conjunto de prueba de code-switching del 24,64 % al 9,08 % y eleva la precisión de términos del 12,59 % al 74,26 %, a cambio de degradar aproximadamente 2 puntos porcentuales el WER en ruso puro.

Es relevante para equipos de ingeniería rusohablantes que necesitan transcribir reuniones, podcasts o dictado técnico donde conviven ruso e inglés, y para pipelines de subtitulado o indexación de contenido técnico. Tiene 808.878.080 parámetros totales, licencia Apache 2.0 y se distribuye en safetensors para transformers y en formato CTranslate2 cuantizado para faster-whisper.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante large-v3-turbo: encoder de 32 capas y decoder reducido a 4 capas) |
| Parámetros totales | 808.878.080 (datos reales de safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible como dato explícito; al ser Whisper large-v3-turbo procesa audio en ventanas de 30 s con solapamiento en chunks |
| Tipos de cuantización | fp16 (transformers) e int8_float16 (CTranslate2, carpeta ct2_int8_float16/, 782 MB) |
| Idiomas soportados | ru, en (uso previsto: code-switching ru-en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; CTranslate2 en ct2_int8_float16/ |
| Tamaño del repositorio | 4,0 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La base es Whisper large-v3-turbo, un transformer encoder-decoder con encoder de 32 capas y un decoder reducido a 4 capas (la poda del decoder es la característica principal de la variante turbo, que acelera la inferencia manteniendo el encoder de large-v3). Sobre esa base se aplicó un LoRA de rango 32 sobre las proyecciones q, k, v, o, fc1 y fc2, con 27,85 M de parámetros entrenables (3,4 % del total de 809 M). El ajuste se hizo sobre coriollon/whisper-large-v3-turbo-russian, un modelo ya adaptado al ruso.

Los datos de entrenamiento son 2.160 frases en ruso con términos técnicos en inglés, generadas de forma sintética con Silero TTS v4 en ruso siguiendo 50 plantillas × 53 términos × 5 voces; 5.000 muestras en ruso puro y 2.000 en inglés puro como antiolvido (anti-forgetting). Las etiquetas de referencia están en escritura mixta ("Открой Python"), lo que enseña al modelo a emitir los términos ingleses directamente en latino en vez de transliterarlos. No se documenta en la información disponible el uso de RLHF, DPO ni de un decodificador especulativo adicional.

## Capacidades

- Transcripción de voz (task="transcribe") en ruso con términos técnicos y de marca en inglés incrustados, emitiéndolos en alfabeto latino.
- Reconocimiento de code-switching ru-en en una misma frase o intervención.
- Identificación del idioma de origen mediante el parámetro language="ru".
- Salida con beam search (el ejemplo de la model card usa num_beams=5 y beam_size=5).
- Ejecución tanto en transformers (WhisperForConditionalGeneration, fp16) como en faster-whisper (CTranslate2, int8_float16).
- Cobertura de 53 términos técnicos y de marca comunes (Python, GitHub, Docker, etc.).
- Integración con endpoints compatibles (tag endpoints_compatible).
- No se documentan en la información disponible capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- No se documenta la tarea de traducción (task="translate") para este ajuste concreto.

## Casos de uso

- Dictado técnico para desarrolladores rusohablantes: escribir documentación, notas de diseño o tickets por voz mezclando ruso con nombres de herramientas y comandos en inglés, evitando que "git push" acabe transcrito como transliteración cirílica.
- Transcripción de podcasts y charlas técnicas en ruso: los episodios suelen incluir anglicismos constantes (frameworks, librerías, servicios cloud); el modelo mantiene esos términos en latino, lo que facilita después el etiquetado y la búsqueda.
- Subtitulado automático de meetups y conferencias: al preservar la grafía original de los términos técnicos, los subtítulos son directamente utilizables y localizables sin corrección manual término a término.
- Indexación y búsqueda sobre archivos de audio: una transcripción con términos en latino permite construir índices de texto donde buscar "Docker" o "Kubernetes" devuelve resultados, cosa que no ocurre con transcripciones transliteradas.
- Generación de bases de conocimiento para asistentes internos (RAG): las transcripciones alimentan un corpus recuperable, con la ventaja de que los identificadores técnicos quedan en su forma canónica.
- Asistentes de voz y comandos por voz en herramientas de desarrollo, donde el usuario dicta en ruso pero los nombres de acciones y ficheros son ingleses.
- Actas de reunión de equipos de ingeniería rusohablantes: reuniones con vocabulario mixto que requieren transcripciones legibles para quien no habla ruso pero sí reconoce los términos técnicos.
- Atención al cliente técnica en ruso: conversaciones de soporte donde se mencionan productos y siglas en inglés y se necesita un registro fiel para el ticketing posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (conjunto de code-switching de 540 frases en ruso con términos técnicos ingleses, y regresión sobre ruso puro):

| Conjunto | Métrica | Modelo estándar (coriollon/whisper-large-v3-turbo-russian) | Este modelo | Diferencia |
|---|---|---:|---:|---:|
| Code-switching (540 frases ru+en) | WER | 24,64 % | 9,08 % | −15,56 pp |
| Code-switching (540 frases ru+en) | Precisión de términos | 12,59 % | 74,26 % | +61,67 pp |
| Common Voice 21 RU | WER | 5,33 % | 6,87 % | +1,54 pp |
| RuLibriSpeech | WER | 8,50 % | 8,57 % | +0,07 pp |
| Sberdevices Golos farfield | WER | 11,05 % | 10,38 % | −0,67 pp |
| Sberdevices Golos crowd | WER | 10,15 % | 9,81 % | −0,34 pp |
| SOVA RuDevices | WER | 13,61 % | 14,87 % | +1,26 pp |
| Podlodka Speech | WER | 10,85 % | (ruidoso, n=20) | — |
| Agregado ruso puro (N=200) | WER | ~9,4 % | ~11,8 % | +2,3 pp |

La precisión de términos se define como la fracción de enunciados en los que el término inglés (por ejemplo "Python", "GitHub", "Docker") aparece literalmente en alfabeto latino en la transcripción. No hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, ya que es un modelo exclusivamente ASR. Los resultados son autopublicados por el autor y no consta validación independiente.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,6 GB de pesos más activaciones y caché de decodificación; en la práctica cabe holgadamente en 4 GB de VRAM.
- VRAM estimada en int8_float16 (CTranslate2): el artefacto pesa 782 MB, por lo que cabe en GPUs de 2-4 GB e incluso puede ejecutarse en CPU con latencias mayores.
- GPUs recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 3090, RTX 4090 o superiores permiten lotes grandes y más hilos de decodificación. En el entorno de servidor, A100 y H100 son válidas pero sobredimensionadas para 809 M de parámetros, salvo que se busque un throughput muy alto con muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más, y también en CPU mediante faster-whisper con compute_type="int8".
- Opciones de despliegue: transformers (WhisperForConditionalGeneration), faster-whisper con CTranslate2 (ruta recomendada por el autor para producción), y cualquier stack compatible con modelos Whisper de Hugging Face. No hay pesos GGUF publicados, por lo que Ollama y llama.cpp no están soportados con el material disponible. No se documenta soporte específico de vLLM ni TGI para este repositorio.
- Latencia y throughput: no disponible en la información aportada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER ruso puro (AGG, N=200) | WER code-switching ru-en | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Este modelo (landco11/whisper-large-v3-turbo-russian-codeswitch) | 808.878.080 | ru, en | ~11,8 % | 9,08 % | Apache 2.0 | Safetensors + CTranslate2 int8_float16 |
| coriollon/whisper-large-v3-turbo-russian | No disponible en la información aportada | ru | ~9,4 % | 24,64 % | No disponible en la información aportada | Repositorio Hugging Face del modelo base |
| openai/whisper-large-v3-turbo | ~809 M (misma arquitectura turbo) | Multilingüe (99 idiomas según el modelo original) | No disponible en la información aportada para ruso | No disponible en la información aportada | MIT (licencia del repositorio original de OpenAI; no confirmada en la información aportada) | safetensors y formatos derivados en el ecosistema |
| openai/whisper-large-v3 | No disponible en la información aportada | Multilingüe | No disponible en la información aportada | No disponible en la información aportada | MIT (licencia del repositorio original de OpenAI; no confirmada en la información aportada) | safetensors y formatos derivados en el ecosistema |

El eje de decisión es claro: si el audio es ruso puro, el modelo base ruso es mejor (unos 2,3 pp de WER agregado); si contiene términos técnicos en inglés, este ajuste gana por un margen muy amplio en términos transcritos correctamente (74,26 % frente a 12,59 %).

## Limitaciones y advertencias

- El WER en ruso puro empeora en torno a 2 pp respecto al modelo estándar; el propio autor recomienda no usarlo si no se necesita code-switching.
- Los datos de entrenamiento son sintéticos, generados con Silero TTS v4 en ruso; la pronunciación humana real puede diferir y no se han publicado evaluaciones sobre habla espontánea con code-switching.
- Solo cubre 53 términos técnicos y de marca comunes; los términos poco frecuentes pueden seguir apareciendo transliterados en cirílico.
- Los benchmarks son autopublicados por el autor, sin validación independiente, y el repositorio consta con 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- La evaluación de code-switching se hizo sobre 540 frases y el agregado de ruso puro sobre 200 muestras, tamaños reducidos que limitan la significación estadística de las diferencias pequeñas.
- Riesgo de alucinación: la familia Whisper es propensa a generar texto espurio en silencios, ruido o música; no se documenta ninguna mitigación específica en este ajuste.
- No se documentan análisis de sesgos, y el entrenamiento con TTS sintético puede introducir sesgos de pronunciación y de variedad dialectal no evaluados.
- Existe una discrepancia de identificadores en la información disponible: la ficha de Hugging Face figura como landco11/whisper-large-v3-turbo-russian-codeswitch, mientras que los ejemplos de código de la model card descargan desde coriollon/whisper-large-v3-turbo-russian-codeswitch. Conviene verificar el repositorio correcto antes de integrarlo.
- La model card declara licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero no se detallan las condiciones de los datos de entrenamiento más allá de la generación con Silero TTS.
- No hay pesos GGUF, por lo que no se puede desplegar en Ollama ni en llama.cpp con el material publicado.

## Enlaces

- Hugging Face (ficha indicada): https://huggingface.co/landco11/whisper-large-v3-turbo-russian-codeswitch
- Modelo base del ajuste: https://huggingface.co/coriollon/whisper-large-v3-turbo-russian
- Repositorio citado en los ejemplos de la model card: https://huggingface.co/coriollon/whisper-large-v3-turbo-russian-codeswitch
- faster-whisper (librería de inferencia con CTranslate2): no disponible en la información aportada
- Repositorio original de Whisper: no disponible en la información aportada
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a foros sobre Sky Q, ARD Mediathek, Vivaldi y WhatsApp, sin relación con el modelo.
