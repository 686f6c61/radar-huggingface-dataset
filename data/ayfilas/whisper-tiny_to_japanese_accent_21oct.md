# ayfilaS/whisper-tiny_to_japanese_accent_21oct

## Resumen

`ayfilaS/whisper-tiny_to_japanese_accent_21oct` es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla `openai/whisper-tiny` (37.760.640 parámetros), publicado por el usuario ayfilaS el 21 de octubre de 2026 en HuggingFace. El modelo parte de la arquitectura encoder-decoder Transformer de Whisper en su variante más pequeña y se ha reentrenado sobre un conjunto de datos denominado `Japanese_english`, con el objetivo declarado de mejorar la transcripción de inglés hablado con acento japonés. El resultado es un checkpoint de 0,3 GB de repositorio, en formato safetensors y licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de ajuste ligero de Whisper: 2.000 pasos de entrenamiento, batch size de 2 y una tasa de aprendizaje de 1e-5, insuficientes para un cambio profundo de dominio pero suficientes para adaptar el decoder a un acento concreto. Por otro, sirve como ejemplo de model card incompleta: el autor no documenta la composición del dataset, no describe los usos previstos y no aporta comparaciones, de modo que cualquier evaluación debe apoyarse únicamente en la métrica WER declarada (20,6668 % sobre el split de test) y marcada como no verificada.

El modelo no debe confundirse con un sistema de ASR para japonés: la etiqueta de idioma oficial es `en`, el dataset se llama `Japanese_english` y no se declara soporte de `ja`. Se trata, por tanto, de un experimento de adaptación de acento sobre inglés, no de un modelo multilingüe ni de un traductor japonés-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (variante tiny del modelo base `openai/whisper-tiny`); procesa audio como espectrograma log-Mel y genera texto autoregresivamente |
| Parametros totales | 37.760.640 (~37,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento, heredada de la arquitectura Whisper; no se documenta el tamaño del conjunto de entrenamiento en tokens |
| Tipos de cuantizacion | No disponible en el repositorio: solo se publican pesos safetensors. Al derivar de Whisper es convertible a fp16/int8 mediante CTranslate2, ONNX Runtime o whisper.cpp, pero el autor no distribuye variantes cuantizadas |
| Idiomas soportados | `en` (según la etiqueta oficial del modelo). El nombre sugiere adaptación a inglés con acento japonés; no se declara soporte de `ja` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura Whisper en su variante tiny: un encoder que consume espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos y un decoder autoregresivo que emite tokens de texto con tokens especiales de tarea e idioma. El ajuste fino se realizó con el `Trainer` de transformers (versión 5.21.0.dev0) sobre PyTorch 2.11.0+cu130, con optimizador AdamW fused (`betas=(0.9, 0.999)`, `epsilon=1e-08`), scheduler lineal con 500 pasos de warmup, `learning_rate=1e-05`, `train_batch_size=2`, `eval_batch_size=1`, semilla 42 y un total de 2.000 pasos de entrenamiento. No se especifica si se congelaron capas del encoder ni si se aplicó alguna técnica de aumento de datos o de regularización.

La información sobre los datos de entrenamiento es mínima: únicamente se cita el dataset `Japanese_english`, sin número de horas, número de utterances, composición de hablantes, procedencia del audio ni proceso de limpieza. Tampoco se documenta ningún tipo de alineación forzada, RLHF, DPO ni decodificación especulativa. El historial de entrenamiento registra solo dos puntos de evaluación (pasos 1.000 y 2.000), con una pérdida de validación que baja de 0,4419 a 0,4241 y un WER que mejora de 21,3146 a 20,6668. El hecho de que la pérdida de entrenamiento (0,1315 y 0,0836) sea muy inferior a la de validación sugiere sobreajuste al conjunto de entrenamiento en las etapas finales, aunque no puede confirmarse sin conocer el tamaño del dataset.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio en inglés, con adaptación declarada a acento japonés.
- Transcripción de audio en formato de pipeline `automatic-speech-recognition` de transformers, con ventanas de hasta 30 segundos por segmento.
- Integración directa con `pipeline("automatic-speech-recognition", model="ayfilaS/whisper-tiny_to_japanese_accent_21oct")`.
- Etiquetado `endpoints_compatible`, por lo que puede desplegarse en Inference Endpoints de HuggingFace.
- Capacidad de generar marcas de tiempo a nivel de segmento o de palabra heredada de Whisper, aunque no ha sido validada tras el ajuste fino.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio más allá de la transcripción.
- Capacidad multilingüe: no disponible; el modelo declara únicamente `en` y el ajuste parece orientado a un subconjunto acentual de ese idioma.
- No hay modo "thinking", ni salida estructurada, ni control de estilo documentados.

## Casos de uso

- Transcripción de reuniones con hablantes japoneses que se comunican en inglés: el ajuste busca reducir el WER en ese perfil acentual, y el pipeline estándar permite procesar grabaciones por segmentos de 30 segundos con `chunk_length_s`.
- Subtitulado de vídeos corporativos o clases impartidas en inglés por ponentes nipones: el modelo puede generar transcripciones base que luego se revisan y se sincronizan con marcas de tiempo.
- Preprocesado de audio para pipelines de análisis de sentimiento o resumen: transcribir primero con este modelo y pasar el texto a un modelo de lenguaje para tareas posteriores de NLP.
- Prototipado rápido en CPU: con 37,8 M de parámetros, el checkpoint ocupa unos 151 MB en fp32 y puede ejecutarse en entornos sin GPU, lo que lo hace útil para pruebas de concepto y demos internas.
- Evaluación comparativa de técnicas de adaptación de acento: sirve como referencia de un fine-tune ligero (2.000 pasos, batch 2) frente a adaptaciones más costosas, útil en experimentos académicos sobre robustez acentual.
- Filtrado y etiquetado de corpus de audio: transcripción masiva de grabaciones para construir datasets de texto alineado, aceptando la tasa de error del 20,7 % como coste asumible en una primera pasada.
- Integración en endpoints de HuggingFace para demos interactivas: al ser `endpoints_compatible`, se puede desplegar detrás de una API HTTP sin infraestructura propia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la `model-index` de la model card. La métrica WER está marcada como `verified: false`, es decir, no ha sido validada por el equipo de HuggingFace ni por un tercero independiente.

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Automatic Speech Recognition | Japanese English (`Japanese_english`, config default) | test | WER | 20,6668 % |

Resultados adicionales del conjunto de evaluación recogidos en la model card:

| Punto de evaluación | Paso | Epoch | Validation loss | WER | WER basic | WER raw |
|---|---|---|---|---|---|---|
| 1 | 1.000 | 1,2438 | 0,4419 | 21,3146 | 21,2249 | 22,0238 |
| 2 | 2.000 | 2,4876 | 0,4241 | 20,6668 | 20,4417 | 21,0370 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni en benchmarks estándar de ASR como LibriSpeech, Common Voice o FLEURS. Tampoco se aporta comparación con el modelo base `openai/whisper-tiny` sobre el mismo conjunto, lo que impide cuantificar la mejora atribuible al ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (pesos de ~151 MB más activaciones y buffers de atención); en fp16 en torno a 75 MB de pesos y en int8 en torno a 38 MB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100; el modelo está muy por debajo de la capacidad de todas ellas.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es viable la inferencia en un portátil moderno sin acelerador, con latencia dominada por el preprocesado Mel y la decodificación autoregresiva más que por el coste de los pesos.
- Opciones de despliegue: pipeline de transformers, `faster-whisper`/CTranslate2 (requiere conversión previa), ONNX Runtime, whisper.cpp (requiere conversión a GGML/GGUF), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). vLLM y TGI no están documentados para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de RTF (real-time factor) ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ayfilaS/whisper-tiny_to_japanese_accent_21oct` | 37,8 M | 30 s por segmento | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | WER 20,67 % en `Japanese_english` (no verificado) |
| `openai/whisper-tiny` (modelo base) | ~37,8 M | 30 s por segmento | Apache 2.0 | HuggingFace, ampliamente usado | Multilingüe, referente estándar; no se aporta su WER en el mismo test |
| `openai/whisper-base` | ~74 M | 30 s por segmento | Apache 2.0 | HuggingFace | Mayor capacidad que tiny a costa de duplicar parámetros |
| `openai/whisper-small` | ~244 M | 30 s por segmento | Apache 2.0 | HuggingFace | Alternativa habitual cuando tiny no alcanza precisión suficiente |

Los recuentos de parámetros de `whisper-base` y `whisper-small` son los publicados por OpenAI para la familia Whisper; no se han verificado contra este repositorio. No se dispone de comparaciones directas de WER sobre el dataset `Japanese_english` para ninguno de los modelos alternativos.

## Limitaciones y advertencias

- Model card incompleta: el autor deja secciones enteras como "More information needed" (descripción, usos previstos, limitaciones y datos de entrenamiento), lo que impide evaluar la idoneidad del modelo para producción.
- WER del 20,67 % marcado como no verificado y medido sobre un único dataset propietario del autor (`Japanese_english`), sin descripción de su composición; la cifra no es extrapolable a otros dominios.
- El nombre del modelo (`to_japanese_accent`) y la etiqueta de idioma (`en`) generan ambigüedad: no queda claro si el objetivo es transcribir inglés con acento japonés o japonés; no se declara soporte de `ja`.
- Riesgo de sobreajuste: con 2.000 pasos, batch 2 y una pérdida de entrenamiento muy inferior a la de validación en el último punto, es probable que el modelo haya memorizado parte del conjunto de entrenamiento, lo que degradaría su generalización.
- Riesgo de alucinación típico de Whisper: en segmentos silenciosos, ruidosos o con música puede generar texto inventado en inglés, incluso sin habla presente.
- Sesgos no documentados: no se describe la distribución de hablantes, géneros, edades ni regiones del dataset, por lo que se desconocen los sesgos de rendimiento por subgrupo.
- Al ser una variante tiny, la precisión en vocabulario técnico, nombres propios y entidades poco frecuentes es limitada incluso en condiciones ideales.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y verificar las condiciones del dataset de origen, no especificadas.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, y ninguna actualización posterior al 21 de octubre de 2026 (la actualización del mismo día corresponde a los metadatos).
- No apto para japonés sin validación previa: no hay benchmarks ni etiqueta de idioma que respalden su uso en ese idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayfilaS/whisper-tiny_to_japanese_accent_21oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de transformers: no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió resultados técnicos relacionados con este modelo ni con Whisper; los enlaces encontrados eran contenido no pertinente y se han descartado.
