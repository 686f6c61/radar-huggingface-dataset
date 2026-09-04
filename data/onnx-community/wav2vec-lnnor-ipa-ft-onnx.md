# onnx-community/wav2vec-LnNor-IPA-ft-ONNX

## Resumen

El modelo `wav2vec-LnNor-IPA-ft-ONNX` es una conversión a ONNX del modelo `MultiBridge/wav2vec-LnNor-IPA-ft`, desarrollado por Multibridge para el reconocimiento de fonemas del inglés mediante el Alfabeto Fonético Internacional (IPA). Parte de `facebook/wav2vec2-base` y ha sido afinado sobre los datasets TIMIT y LnNor, con el objetivo de transcribir audio a secuencias de fonemas. La conversión a ONNX fue generada por `onnx-community` mediante la utilidad `convert-to-onnx` de Hugging Face, lo que permite ejecutarlo con Transformers.js, incluido el navegador.

Su arquitectura es un transformer Wav2Vec2 en el que el encoder se mantuvo congelado durante el fine-tuning, optimizado con pérdida CTC. En el benchmark TIMIT logra un CER de 0.0416. La relevancia del modelo radica en su uso para lingüística computacional, educación de pronunciación y prototipado de pipelines de reconocimiento de habla en aplicaciones web.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (Transformer) |
| Parametros totales | no disponible |
| Longitud de contexto | 30 segundos de audio (filtro de entrenamiento); no disponible como límite de arquitectura |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

No se incluye la fila «Parametros activos» porque el modelo no es una mezcla de expertos (MoE).

## Arquitectura y entrenamiento

El modelo original es un fine-tuning de `facebook/wav2vec2-base` sobre dos datasets: TIMIT y LnNor. TIMIT es un corpus de referencia para transcripción fonética; LnNor contiene grabaciones de hablantes no nativos en noruego, inglés y polaco, con anotaciones fonémicas generadas mediante WebMAUS, que representan pronunciaciones canónicas y no las pronunciaciones reales. Durante el entrenamiento se congeló el encoder para reducir el coste computacional y se empleó pérdida CTC con el optimizador AdamW, con una tasa de aprendizaje de 1e-5, batch size de 64, weight decay de 0.001 y 40 épocas, sin scheduler de tasa de aprendizaje. El preprocesamiento excluyó grabaciones de menos de 2 segundos o más de 30 segundos, así como etiquetas con menos de 5 fonemas. La conversión a ONNX es una transformación directa de los pesos del modelo original, manteniendo la misma arquitectura y el mismo comportamiento de inferencia.

## Capacidades

- Reconocimiento de fonemas en inglés: genera secuencias de símbolos IPA a partir de audio.
- Transcripción fonética automática: adecuado para anotar corpus de habla sin necesidad de texto de referencia.
- Integración en Transformers.js: puede ejecutarse en el navegador con la pipeline `automatic-speech-recognition`.
- Soporte como componente en pipelines de ASR: su salida en fonemas puede postprocesarse para obtener texto ortográfico.
- Capacidades multilingües limitadas: aunque LnNor contiene datos de varios idiomas, el modelo está orientado al inglés.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo de audio puro, no un modelo de lenguaje.

## Casos de uso

- Investigación en fonética: los lingüistas pueden usar el modelo para anotar automáticamente grabaciones de inglés con IPA y analizar variantes dialectales o de pronunciación.
- Educación de pronunciación: en aplicaciones de aprendizaje de idiomas, el modelo evalúa la pronunciación de un estudiante comparando la secuencia de fonemas generada con una secuencia esperada.
- Transcripción en el navegador: con Transformers.js, una web puede transcribir audio a fonemas en tiempo real sin subir los datos a un servidor, lo que respeta la privacidad.
- Preprocesamiento en sistemas ASR: un pipeline puede encadenar este modelo como primera etapa y usar reglas fonéticas para convertir los fonemas en texto ortográfico en inglés.
- Análisis de habla no nativa: el modelo permite estudiar la pronunciación de hablantes de inglés como segunda lengua, siempre que se tengan en cuenta las limitaciones asociadas a las anotaciones canónicas de LnNor.
- Evaluación de sistemas de voz: como métrica objetiva de pronunciación en sistemas de síntesis de voz o en aplicaciones de teleasistencia.

## Benchmarks y rendimiento

La información disponible incluye un único resultado oficial, reportado en el model-index del modelo original:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reconocimiento de fonemas | TIMIT | CER | 0.0416 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. No se publican requisitos oficiales de hardware.
- GPU recomendada: no especificada.
- Soporte en consumer GPU: presumiblemente sí, dado el tamaño del repositorio (0.8 GB) y al tratarse de un modelo ONNX ligero, pero no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime para ejecución en servidor, Transformers.js para ejecución en navegador. No aplican vLLM, llama.cpp ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- La exclusión de grabaciones de menos de 2 segundos o más de 30 segundos, y de etiquetas con menos de 5 fonemas, ignora ciertas variaciones naturales del habla, lo que puede degradar el rendimiento en casos reales.
- Las anotaciones de LnNor fueron generadas por WebMAUS y representan fonemas canónicos, no la pronunciación real de hablantes no nativos. Esto puede ocasionar errores al predecir habla no nativa.
- El encoder se mantuvo congelado durante el fine-tuning, lo que limita la capacidad de adaptación del modelo a los datos nuevos.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas (pese a la presencia de noruego y polaco en LnNor) no está garantizado.
- La licencia CC-BY-4.0 permite el uso comercial siempre que se atribuya adecuadamente al autor original.
- Existe riesgo de transcripciones incorrectas en condiciones de ruido, acentos no representados o velocidades de habla extremas.

## Enlaces

- Modelo ONNX en Hugging Face: [onnx-community/wav2vec-LnNor-IPA-ft-ONNX](https://huggingface.co/onnx-community/wav2vec-LnNor-IPA-ft-ONNX)
- Modelo original: [MultiBridge/wav2vec-LnNor-IPA-ft](https://huggingface.co/MultiBridge/wav2vec-LnNor-IPA-ft)
- Dataset TIMIT IPA: [speech31/timit_english_ipa](https://huggingface.co/datasets/speech31/timit_english_ipa)
- Dataset LnNor: [MultiBridge/LnNor](https://huggingface.co/datasets/MultiBridge/LnNor)
- Paper de Wav2Vec2: [arXiv:1910.09700](https://arxiv.org/abs/1910.09700)
- Utilidad de conversión a ONNX: [onnx-community/convert-to-onnx](https://huggingface.co/spaces/onnx-community/convert-to-onnx)
- Documentación de Transformers.js: [AutomaticSpeechRecognitionPipeline](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline)
