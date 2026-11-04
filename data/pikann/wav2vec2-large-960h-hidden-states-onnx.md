# pikann/wav2vec2-large-960h-hidden-states-ONNX

## Resumen

`pikann/wav2vec2-large-960h-hidden-states-ONNX` es una exportación a ONNX en precisión fp32 del modelo de reconocimiento automático del habla `facebook/wav2vec2-large-960h` de Meta. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de despliegue que reproduce fielmente los pesos originales en formato ONNX, con una modificación concreta en la interfaz del grafo. La motiviación del autor es su uso en Engclaw, una aplicación de pronunciación, que necesita tanto la transcripción CTC como los estados ocultos de la última capa para calcular puntuaciones fonéticas.

La relevancia es práctica: permite ejecutar un ASR de 317 millones de parámetros en runtimes ONNX (ONNX Runtime, servidores de inferencia compatibles) sin depender de PyTorch, y expone en una sola pasada dos salidas que normalmente requerirían dos invocaciones o acceso a las capas internas del modelo. La ventana de entrada es de audio a 16 kHz normalizado, sin máscara de atención, y la salida CTC opera sobre un vocabulario de 32 símbolos con frames de 20 ms.

El modelo hereda las características del original: arquitectura wav2vec 2.0 preentrenada de forma autosupervisada y afinada con CTC sobre 960 horas de LibriSpeech en inglés. Solo se distribuyen los pesos ONNX, la configuración y el vocabulario; no hay datos de benchmarks propios más allá de la verificación de paridad numérica frente a PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (transformer convolucional + encoder transformer), cabeza CTC |
| Parametros totales | aproximadamente 317 millones (heredados de wav2vec2-large) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (audio de entrada con eje de muestras dinámico; sin límite fijo documentado) |
| Tipos de cuantizacion | ninguno en este repositorio (fp32); el modelo base admite cuantización dinámica ONNX, pero no se incluye aquí |
| Idiomas soportados | inglés (entrenado sobre LibriSpeech 960h) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`), opset 17, exportador legacy, ejes de batch y muestras dinámicos |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec 2.0 en su variante large: un extractor de características convolucional que convierte la forma de onda de 16 kHz en una secuencia de representaciones latentes, seguido de un encoder transformer de 24 capas con 1024 dimensiones ocultas. El preentrenamiento es autosupervisado (enmascaramiento contrastivo sobre representaciones cuantizadas) y el ajuste final se realiza con CTC sobre 960 horas de LibriSpeech, lo que produce un modelo de ASR en inglés sin modelo de lenguaje externo.

La exportación a ONNX se hizo con `torch.onnx.export` en opset 17, sin cuantización, con ejes dinámicos para batch y número de muestras. La innovación respecto al original es la firma del grafo: además de `logits` con forma `[batch, frames, 32]` (CTC sobre `vocab.json`, blank = `<pad>`, id 0, frames de 20 ms), devuelve `hidden_states` con forma `[batch, frames, 1024]`, equivalente a `hidden_states[-1]` de HuggingFace. La paridad numérica declarada por el autor sobre 31 clips es de 2.2e-3 de diferencia absoluta máxima en logits y 8.7e-4 en estados ocultos, con transcripciones greedy idénticas en 31 de 31 casos. No se documentan datos sobre RLHF, DPO ni composición adicional del dataset más allá de LibriSpeech.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio mono a 16 kHz, normalizado a media cero y varianza unitaria.
- Decodificación CTC greedy sobre un vocabulario de 32 símbolos; el token blank es `<pad>` (id 0).
- Exposición de los estados ocultos de la última capa (1024 dimensiones) por frame, útiles para tareas derivadas como puntuación de pronunciación, alineamiento o extracción de embeddings acústicos.
- Entrada sin máscara de atención: el eje de muestras es dinámico, lo que permite lotes de distinta duración.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo thinking.
- No tiene capacidades de visión, audio generativo ni traducción; es un modelo puramente discriminativo de transcripción.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Evaluación de pronunciación: la aplicación Engclaw usa los `hidden_states` por frame junto con la transcripción CTC para comparar la realización acústica del alumno con la esperada y detectar desviaciones fonéticas.
- Transcripción por lotes en pipelines ONNX: al no depender de PyTorch, se puede integrar en servicios con ONNX Runtime y procesar ficheros de audio en paralelo con ejes dinámicos.
- Subtitulado de audio en inglés: la salida CTC con frames de 20 ms permite generar marcas temporales aproximadas alineando los tokens con los frames.
- Extracción de embeddings acústicos para clasificación downstream: los vectores de 1024 dimensiones por frame sirven como características para detección de emociones, hablante o calidad de audio.
- Búsqueda por voz en inglés: transcripción rápida en local para indexar grabaciones sin enviar audio a servicios externos.
- Prototipado de ASR en entornos sin GPU: el modelo en fp32 puede ejecutarse en CPU con ONNX Runtime, adecuado para demos y validación funcional antes de escalar.
- Verificación de paridad en migraciones: sirve como referencia para comprobar que una exportación propia a ONNX o a otro runtime produce las mismas transcripciones que PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta la paridad numérica frente a PyTorch fp32 sobre 31 clips (diferencia máxima absoluta de 2.2e-3 en logits, 8.7e-4 en estados ocultos, transcripciones idénticas 31/31). No hay cifras de WER, MMLU, HumanEval ni GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1.3 GB solo de pesos, más activaciones; con lotes pequeños y audio de pocos segundos, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA EP), desde RTX 3060/4060 hasta A100/H100; para producción de alto throughput se recomienda A10, L4 o A100.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más (RTX 2060, RTX 3060, RTX 4060, etc.); también puede ejecutarse en CPU con ONNX Runtime, con mayor latencia.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), servidores compatibles con ONNX, Triton Inference Server con backend ONNX; no se distribuye GGUF, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada. La latencia depende de la duración del audio y del hardware; el modelo procesa frames de 20 ms tras el extractor convolucional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| pikann/wav2vec2-large-960h-hidden-states-ONNX | ~317 M | audio 16 kHz, eje de muestras dinámico | inglés | apache-2.0 | ONNX fp32 |
| facebook/wav2vec2-large-960h | ~317 M | audio 16 kHz | inglés | apache-2.0 | PyTorch (safetensors/bin) |
| facebook/wav2vec2-base-960h | ~95 M | audio 16 kHz | inglés | apache-2.0 | PyTorch |
| openai/whisper-large-v3 | ~1550 M | audio 16 kHz, ventanas de 30 s | multilingüe | MIT | PyTorch, ONNX comunitario |

La comparación con Whisper no es directa: este repositorio es un export de un modelo CTC sin decoder autorregresivo, más ligero y con menor latencia potencial, pero limitado al inglés y sin puntuación ni capitalización implícitas. Frente a `wav2vec2-base-960h`, la variante large ofrece mayor capacidad a costa de triplicar parámetros. No se dispone de cifras de WER comparativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el vocabulario y el entrenamiento sobre LibriSpeech 960h limitan el uso a audio en inglés; no hay soporte documentado de otros idiomas.
- Sin modelo de lenguaje: la decodificación CTC greedy produce texto sin puntuación ni capitalización y puede generar errores en palabras homófonas o en audio con ruido.
- Riesgo de alucinación bajo: al ser un modelo discriminativo CTC no genera texto libre, pero puede producir transcripciones incorrectas o segmentos vacíos en audio de baja calidad.
- Sesgos: hereda los sesgos de LibriSpeech (predominantemente lectura de audiolibros en inglés, acentos y condiciones de grabación limitadas), lo que puede degradar el rendimiento en habla espontánea, acentos no representados o audio telefónico.
- Licencia apache-2.0: permite uso comercial, pero se debe mantener la atribución a los autores originales (Baevski et al., Facebook/Meta) y conservar el aviso de licencia.
- Restricción de entrada: requiere audio mono a 16 kHz normalizado a media cero y varianza unitaria; no acepta máscara de atención, por lo que el padding entre muestras de distinta duración debe gestionarse externamente.
- Artefacto de despliegue: no es un modelo reentrenado; cualquier mejora o corrección debe hacerse sobre el modelo base y reexportarse.
- Sin cuantización incluida: el repositorio solo contiene fp32, lo que implica mayor uso de memoria que una versión int8.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente más allá de la paridad declarada por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pikann/wav2vec2-large-960h-hidden-states-ONNX
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-960h
- Aplicación Engclaw: https://github.com/pikann/engclaw
- Paper de wav2vec 2.0 (Baevski et al.): no disponible en la información proporcionada
- Documentación de ONNX Runtime: no disponible en la información proporcionada
