# moonbox-dev/canary-qwen-2.5b-ONNX

## Resumen

Canary-Qwen 2.5B ONNX es una compilación en formato ONNX del modelo de reconocimiento automático del habla (ASR) Canary-Qwen 2.5B de NVIDIA, publicada por el usuario moonbox-dev. El modelo original combina un codificador de audio basado en FastConformer con un decodificador de lenguaje derivado de Qwen3, lo que le permite transcribir audio en inglés con una tasa de error muy baja. Esta versión ONNX está pensada para inferencia en dispositivo mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML.

El interés de esta ficha radica en que ofrece una alternativa ejecutable fuera del ecosistema PyTorch/NVIDIA NeMo, con dos precisiones (fp16 e int8) y artefactos separados por componente: codificador de audio, decodificador, embeddings, filtros mel y scripts de pipeline. El repositorio ocupa 10,3 GB e incluye tanto los grafos como el código Python necesario para la extracción de características, la construcción del prompt y el bucle de decodificación.

La relevancia actual es doble: por un lado, permite desplegar un ASR de calidad cercana al estado del arte en entornos donde no se dispone de GPU NVIDIA o de la pila NeMo; por otro, la cuantización int8 reduce el peso del decodificador de 3,45 GB a 1,84 GB con un incremento de WER de solo 0,04 puntos porcentuales en el conjunto de evaluación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador FastConformer + decodificador tipo Qwen3 (transformer) |
| Parametros totales | 2,5 mil millones (según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | inglés (según tags de la model card) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (grafos `.onnx` + `.onnx.data`), tokenizer.json, arrays NumPy auxiliares |

## Arquitectura y entrenamiento

El modelo base, nvidia/canary-qwen-2.5b, es un sistema ASR que empareja un codificador de audio FastConformer con un decodificador de lenguaje Qwen3. El codificador transforma la señal de audio (previa extracción de características mel) en representaciones latentes, y el decodificador genera la transcripción token a token condicionada por esas representaciones y por un prompt. Los tags del repositorio incluyen referencias a los papers arXiv 1706.03762 (Transformer), 2503.05931, 2505.13404, 2310.09424 y 2104.02821, que cubren las bases arquitectónicas y metodológicas del modelo.

Esta versión concreta no ha sido reentrenada: es una conversión a ONNX del modelo original de NVIDIA, con dos precisiones. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card del modelo base, no incluida en la información proporcionada. La innovación técnica de esta publicación es la exportación a ONNX Runtime con grafos separados por componente y un pipeline Python que reproduce la lógica de inferencia original.

## Capacidades

- Reconocimiento automático del habla en inglés: transcripción de audio a texto.
- Ejecución en dispositivo mediante ONNX Runtime con backends CPU, CUDA y DirectML.
- Dos precisiones disponibles (fp16 e int8) con artefactos independientes por componente.
- Pipeline autocontenido: incluye extracción de características mel, construcción de prompt, tokenizer y bucle de decodificación.
- Compatibilidad con onnxruntime-genai para la parte de generación del decodificador.
- No se documentan capacidades de traducción, diarización, identificación de hablante ni tool calling en la información disponible.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el pipeline ONNX permite procesar audio sin enviar datos a la nube, usando el backend CPU o DirectML en equipos sin GPU NVIDIA.
- Subtitulado automatizado de vídeo en inglés: con un WER de 1,66 % en LibriSpeech test-clean (fp16), la calidad es adecuada para generar subtítulos que luego se revisan manualmente.
- Despliegue en aplicaciones de escritorio Windows: el soporte de DirectML permite integrar el modelo en apps nativas que aprovechan la GPU integrada o discreta sin depender de CUDA.
- Servicios de transcripción de bajo coste en CPU: la variante int8 reduce el peso del decodificador a 1,84 GB, lo que facilita su ejecución en servidores sin acelerador dedicado.
- Indexación y búsqueda de contenido audiovisual: transcribir archivos de audio en lote para generar índices de texto consultables, aprovechando el RTF de 0,090 en CUDA con int8.
- Evaluación comparativa de pipelines ASR: al ofrecer fp16 e int8 con métricas publicadas, sirve como referencia para medir el impacto de la cuantización en tareas propias.

## Benchmarks y rendimiento

Los datos proceden del conjunto de evaluación del autor: 400 utterances de LibriSpeech test-clean (40 hablantes) y 200 de AISHELL-1 para modelos con chino. Para este modelo, los resultados son:

| Precision | WER | Transcripciones idénticas al original | Desviación | Backend / RTF |
|---|---|---|---|---|
| fp16 | 1,66 % (original 1,66 %) | 369 de 400 | 0,07 % | CUDA, RTF 0,11 |
| int8 | 1,70 % | 366 de 400 | 0,09 % | CUDA, RTF 0,090 (build GPU) |

No se han publicado en la información disponible resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K u otros), dado que se trata de un modelo ASR.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 10,3 GB, pero la inferencia usa una precisión a la vez. En fp16, los pesos suman aproximadamente 5,7 GB (codificador 1,65 GB + decodificador 3,45 GB + embeddings 0,62 GB); en int8, aproximadamente 3,0 GB (codificador 861,5 MB + decodificador 1,84 GB + embeddings 311,5 MB).
- GPU recomendadas: cualquier GPU con soporte CUDA para el backend CUDA; en Windows, GPU con DirectML. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- GPU de consumo: la variante int8 (unos 3 GB de pesos) es compatible con GPUs de consumo de gama media con suficiente VRAM; la fp16 requiere alrededor de 6 GB solo para pesos, más memoria de activaciones.
- Despliegue: ONNX Runtime y onnxruntime-genai; se incluyen `pipeline.py` y `ortllm.py` para orquestar la inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,11 en fp16 (CUDA) y 0,090 en int8 (CUDA, build GPU), es decir, procesa audio más rápido que tiempo real en ambos casos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (LibriSpeech test-clean) | Licencia | Formato |
|---|---|---|---|---|---|
| Canary-Qwen 2.5B ONNX (este) | 2,5 B | no disponible | 1,66 % (fp16) / 1,70 % (int8) | cc-by-4.0 | ONNX |
| nvidia/canary-qwen-2.5b (original) | 2,5 B | no disponible | 1,66 % | cc-by-4.0 | PyTorch / NeMo |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos ASR (por ejemplo, Whisper) que permitan una comparación rigurosa; solo se dispone de la comparación frente al modelo original de NVIDIA.

## Limitaciones y advertencias

- Idioma: el modelo está orientado a inglés según los tags; no se documenta soporte multilingüe.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser una conversión del modelo de NVIDIA, heredaría los del modelo base.
- Alucinación: como todo modelo generativo de transcripción, puede producir texto no presente en el audio, especialmente con ruido o acentos no representados en el entrenamiento.
- Licencia cc-by-4.0: permite uso comercial con atribución; conviene revisar los términos del modelo base de NVIDIA por si imponen condiciones adicionales.
- La model card no detalla el proceso de cuantización ni garantiza equivalencia exacta con el original: en int8, 34 de 400 transcripciones difieren del modelo PyTorch.
- No se especifican requisitos mínimos de hardware ni versiones de ONNX Runtime compatibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/canary-qwen-2.5b-ONNX
- Modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b
- Paper Transformer (arXiv 1706.03762): https://arxiv.org/abs/1706.03762
- Paper arXiv 2503.05931: https://arxiv.org/abs/2503.05931
- Paper arXiv 2505.13404: https://arxiv.org/abs/2505.13404
- Paper arXiv 2310.09424: https://arxiv.org/abs/2310.09424
- Paper arXiv 2104.02821: https://arxiv.org/abs/2104.02821
