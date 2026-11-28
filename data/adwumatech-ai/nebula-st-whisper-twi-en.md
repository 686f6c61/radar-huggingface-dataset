# adwumatech-ai/nebula-st-whisper-twi-en

## Resumen

nebula-st-whisper-twi-en es un modelo de traducción de voz (speech translation) que convierte audio en twi (akán) directamente a texto en inglés. Lo desarrolla adwumatech-ai y parte de openai/whisper-small, un transformer encoder-decoder de 241,7 millones de parámetros. El modelo resuelve un problema concreto: la escasez de sistemas de traducción voz-a-texto para lenguas de bajos recursos como el twi, hablado por millones de personas en Ghana.

La versión publicada es la 0.2.0 (etiqueta git v0.2.0). El ajuste fino es end-to-end para traducción: congela las 8 capas inferiores del encoder, el front end convolucional y los embeddings, y entrena las 4 capas superiores del encoder y todo el decoder preentrenado. La decodificación arranca de un prefijo fijo `<|startoftranscript|><|translate|><|notimestamps|>` sin token de idioma.

El modelo se distribuye con pesos en safetensors, scripts de inferencia propios (whisper_st.py) y programas ExecuTorch para despliegue en dispositivo (XNNPACK en int8, int8-vocab18k y fp32), incluidos programas de entrenamiento con adaptadores LoRA. Su relevancia actual radica en que combina un modelo base pequeño y ampliamente conocido con un pipeline on-device cuantizado, lo que permite ejecutarlo en hardware modesto, a costa de una calidad de traducción todavía limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste fino de las 4 capas superiores del encoder y del decoder completo |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos; audio largo dividido en ventanas de 30 s |
| Tipos de cuantizacion | int8, int8-vocab18k (vocabulario de salida reducido a 18.561 tokens), fp32; adaptadores LoRA de rango 8 para entrenamiento on-device |
| Idiomas soportados | tw (twi: akuapem y asante), en (inglés como salida) |
| Licencia | cc-by-4.0 (con advertencia sobre las grabaciones de YouTube sin licencia declarada) |
| Formato de pesos | safetensors; programas ExecuTorch (.pte) para móvil |

## Arquitectura y entrenamiento

El modelo es un Whisper-small (transformer encoder-decoder con front end convolucional sobre mel-espectrogramas) adaptado a traducción voz-a-texto. Se congelan las 8 capas inferiores del encoder, el front end convolucional y los embeddings; se entrenan las 4 capas superiores del encoder y el decoder preentrenado completo. La decodificación parte del prefijo fijo `<|startoftranscript|><|translate|><|notimestamps|>`, sin token de idioma, lo que fuerza la tarea de traducción al inglés.

Los datos de entrenamiento provienen del dataset MGhana-ST (shards de twi akuapem y asante, 12 en total, todos CC-BY-4.0), complementados con grabaciones de YouTube con traducciones humanas al inglés que no forman parte de ningún dataset público. Los splits de MGhana-ST se separan por plantilla de prompt, de modo que ninguna plantilla de validación o test aparece en entrenamiento; además, tres grabaciones quedan completamente fuera del entrenamiento. No se documenta en la información disponible el uso de RLHF o DPO ni el número total de tokens de audio empleados.

La innovación técnica destacable es la cadena de despliegue on-device: programas ExecuTorch separados en `encoder.pte` (mel a claves/valores de cross-attention) y `decoder_step.pte` (tokens a logits del siguiente token), más programas de entrenamiento con LoRA (`decoder_step_lora.pte`, `decoder_train.pte`) que reciben adaptadores de rango 8 en cada capa lineal del decoder. La variante int8-vocab18k recorta el vocabulario de salida a los 18.561 tokens que el modelo puede producir, reduciendo el tamaño del decoder.

## Capacidades

- Traducción de voz en twi (akuapem y asante) a texto en inglés, end-to-end.
- Reconocimiento de voz integrado en el mismo paso de traducción (pipeline automatic-speech-recognition).
- Procesamiento de audio largo mediante segmentación automática en ventanas de 30 segundos.
- Decodificación con búsqueda por haz (beam search; la evaluación usa tamaño 4).
- Inferencia en dispositivo con ExecuTorch/XNNPACK en int8, int8-vocab18k y fp32.
- Entrenamiento on-device con adaptadores LoRA de rango 8 sobre las capas lineales del decoder.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado y traducción de contenido audiovisual en twi: el modelo convierte grabaciones de audio en inglés escrito, procesando audio largo en ventanas de 30 s, útil para medios de comunicación ghaneses que quieran publicar subtítulos en inglés.
- Transcripción y traducción de entrevistas de campo: investigadores que recogen testimonios en twi pueden obtener un borrador en inglés para revisión humana, dado el carácter de bajos recursos del idioma.
- Atención al ciudadano en servicios públicos: un sistema de voz podría traducir consultas habladas en twi a inglés para su enrutamiento o registro, aunque la calidad actual exige supervisión humana.
- Aplicaciones móviles offline: gracias a los programas ExecuTorch int8 (109,2 MB encoder + 182,4 MB decoder) y un pico de memoria de unos 1003 MB en escritorio, puede integrarse en apps Android sin conexión para traducción de frases cotidianas.
- Adaptación a dominio con LoRA on-device: los programas `decoder_step_lora.pte` y `decoder_train.pte` permiten ajustar el decoder a vocabulario específico (por ejemplo, terminología médica o agrícola) en el propio dispositivo.
- Investigación en lenguas de bajos recursos: sirve como línea base reproducible para experimentos de speech translation twi-inglés, con splits separados por plantilla de prompt y métricas publicadas (BLEU/chrF).
- Prototipado de asistentes de voz bilingües: combinado con un TTS en inglés, puede cerrar el ciclo twi-hablado a inglés-hablado en demostraciones y pilotos.

## Benchmarks y rendimiento

Evaluación con `scripts/eval.py`, beam search de tamaño 4, BLEU/chrF multi-referencia con `sacrebleu`:

| Split | BLEU | chrF | Segmentos | Qué mide |
|---|---|---|---|---|
| test | 7,11 | 17,65 | 1925 | Split de test de MGhana-ST: plantillas de prompt no vistas en entrenamiento |
| val | 13,87 | 24,42 | 931 | Split de validación de MGhana-ST: plantillas de prompt no vistas en entrenamiento |
| Grabaciones de YouTube | 5,55 | 26,25 | 1147 | 3 grabaciones de YouTube retenidas, nunca vistas en entrenamiento |

Paridad de los programas móviles frente a PyTorch (decodificación greedy de 100 archivos del split de test):

| Precisión | Descarga (encoder + decoder) | Programas de entrenamiento (LoRA step + train) | Memoria pico en escritorio | Caída de BLEU / chrF vs PyTorch | Salidas idénticas |
|---|---|---|---|---|---|
| int8 | 109,2 + 182,4 MB | 182,6 + 143,1 MB | 1003 MB | -0,04 / -0,01 | 80,0 % |
| int8-vocab18k | 109,2 + 130,8 MB | 131,0 + 117,4 MB | 978 MB | -0,04 / -0,15 | 80,0 % |
| fp32 | 409,4 + 717,6 MB | 717,8 + 559,2 MB | 1790 MB | 0,0 / 0,0 | 100,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch: no disponible de forma explícita; con 241,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 1 GB, por lo que cabe holgadamente en GPUs de consumo.
- Programas móviles: encoder int8 de 109,2 MB y decoder int8 de 182,4 MB; memoria pico en escritorio de 1003 MB (int8), 978 MB (int8-vocab18k) y 1790 MB (fp32).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente para la inferencia en PyTorch.
- Cabe en GPU de consumo: sí, dado el tamaño del modelo.
- Opciones de despliegue: script propio `whisper_st.py` (inferencia y CLI), ExecuTorch/XNNPACK para móvil con los programas `.pte`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebula-st-whisper-twi-en | 241,7 M | Ventanas de 30 s | Traducción voz twi a texto inglés | CC BY 4.0 (con caveat sobre YouTube) | Hugging Face, ExecuTorch |
| openai/whisper-small | 244 M | Ventanas de 30 s | ASR y traducción multilingüe a inglés | Apache 2.0 | Hugging Face, múltiples runtimes |
| openai/whisper-base | 74 M | Ventanas de 30 s | ASR y traducción multilingüe a inglés | Apache 2.0 | Hugging Face, múltiples runtimes |

No se dispone en la información proporcionada de resultados de benchmarks de whisper-small o whisper-base sobre twi que permitan una comparación cuantitativa directa; los datos de BLEU/chrF de esta ficha corresponden únicamente a nebula-st-whisper-twi-en sobre sus propios splits.

## Limitaciones y advertencias

- Solo cubre twi en sus variantes akuapem y asante; no soporta otras lenguas akan ni otros idiomas de entrada.
- Rendimiento débil en habla de formato largo; el audio se procesa en ventanas de 30 s, lo que puede degradar la coherencia entre segmentos.
- Calidad de traducción limitada: BLEU de 7,11 en test y 5,55 en YouTube; el autor advierte que cabe esperar traducciones parcialmente correctas de frases cotidianas cortas.
- Riesgo de alucinación y de traducciones inventadas en audio ruidoso, con acentos no vistos o vocabulario fuera de dominio.
- Las grabaciones de YouTube usadas en entrenamiento no tienen licencia declarada, lo que genera incertidumbre legal; el autor recomienda contactar con los mantenedores antes de uso comercial o redistribución.
- La licencia CC BY 4.0 convive con las licencias de los componentes base (Whisper-small Apache 2.0, MGhana-ST CC BY 4.0); conviene revisar la cadena completa antes de producción.
- El modelo tiene 242 M de parámetros y está pensado como herramienta de nicho; no debe esperarse paridad con sistemas de traducción de gran escala.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de los splits descritos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adwumatech-ai/nebula-st-whisper-twi-en
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset MGhana-ST: https://huggingface.co/datasets/adwumatech-ai/mghana-st
