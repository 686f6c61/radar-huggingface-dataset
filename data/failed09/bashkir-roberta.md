# failed09/bashkir-roberta

## Resumen

BashkirRoBERTa es un modelo de lenguaje enmascarado (masked language model) desarrollado por failed09 para el idioma bashkir. Se trata de un encoder Transformer con arquitectura Pre-LayerNorm personalizada, compuesto por 8 bloques, 10 cabezas de atención y un tamaño de capa oculta de 640, con un total de 50,04 millones de parámetros. Su ventana de contexto es de 256 tokens subword y utiliza un tokenizer SentencePiece BPE con 16.384 tokens. El modelo está disponible en HuggingFace con pesos en safetensors y también en formato ONNX (FP16 e INT8) para desplegar en entornos con recursos limitados.

Resuelve la tarea de fill-mask: predecir la palabra o subword más probable que falta en una frase bashkir. Es relevante porque el bashkir es una lengua túrquica con escasos recursos digitales, y este modelo proporciona una base para tareas de corrección, tests educativos y fine-tuning posterior. Su entrenamiento se realizó con MLM dinámico sobre una colección de textos enciclopédicos, periodísticos y literarios en bashkir, aunque los textos fuente no se redistribuyen. En un conjunto de evaluación enciclopédico, alcanza un 24,7% de precisión top-1 y un 54,0% top-5 en la predicción de subwords enmascaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm Transformer encoder (8 bloques, 10 cabezas de atención, hidden size 640, feed-forward 2560) |
| Parametros totales | 50.040.320 (50,04 M) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 256 tokens subword |
| Tipos de cuantizacion | FP16 e INT8 en ONNX; safetensors sin cuantizar (tipo de datos no especificado) |
| Idiomas soportados | Bashkir (ba) |
| Licencia | Other (términos personalizados) |
| Formato de pesos | Safetensors y ONNX |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer con normalización previa (Pre-LayerNorm), en lugar de la post-LayerNorm estándar de RoBERTa. Esto requiere `trust_remote_code=True` al cargar el modelo con Transformers, ya que la implementación no es la nativa de HuggingFace. El modelo tiene 8 bloques, 10 cabezas de atención, una capa oculta de 640 dimensiones y una feed-forward de 2.560, con embeddings de salida atados a los de entrada. El tokenizer es SentencePiece BPE con un vocabulario de 16.384 tokens y IDs fijos para tokens especiales: `<pad>` 0, `<unk>` 1, `<s>` 2, `</s>` 3, `[CLS]` 4, `[SEP]` 5 y `[MASK]` 6.

El preentrenamiento se realizó con MLM dinámico sobre un corpus de textos bashkir de fuentes enciclopédicas, periodísticas y literarias. Los textos fuente no están disponibles en el repositorio. En un conjunto de evaluación held-out de tipo enciclopédico, el modelo obtiene un 24,7% de precisión top-1 y un 54,0% top-5 en la predicción de subwords enmascaradas, resultados que la model card describe como diagnósticos de MLM, no como una medida general de comprensión del lenguaje.

## Capacidades

- Predicción de tokens enmascarados (fill-mask): dada una frase con un token `[MASK]`, devuelve las subwords o palabras más probables en contexto.
- Corrección ortográfica y gramatical: puede utilizarse para ordenar candidatos y detectar errores morfológicos o violaciones de armonía vocálica en bashkir.
- Resolución de ejercicios cloze y de opción múltiple: útil para automatizar la evaluación de tests educativos en bashkir.
- Post-corrección de OCR: puede corregir caracteres ruidosos o glifos ambiguos en textos históricos digitalizados.
- Extracción de características: sirve como backbone para clasificación de texto, análisis de sentimiento y reconocimiento de entidades nombradas (NER) mediante fine-tuning.
- Despliegue en dispositivos edge: los ONNX INT8 y FP16 permiten inferencia rápida en CPU, móvil y GPU, sin dependencias pesadas de PyTorch.
- No soporta tool calling, agentes, generación de texto libre ni visión; es un modelo encoder-only de una sola lengua.

## Casos de uso

- Corrección automática de textos bashkir: un corrector puede usar el modelo para puntuar candidatos de palabras en una frase con errores, detectando problemas morfológicos y de armonía vocálica. Su tamaño reducido permite ejecutarlo en aplicaciones de escritorio o móviles.
- Evaluación educativa automatizada: en plataformas de aprendizaje de bashkir, el modelo resuelve ejercicios cloze y de opción múltiple, generando automáticamente preguntas o comprobando respuestas.
- Post-procesado de OCR para archivos históricos: tras digitalizar periódicos o libros antiguos en bashkir, el modelo rellena huecos o corrige caracteres ambiguos, mejorando la calidad del texto extraído.
- Fine-tuning para análisis de sentimiento o clasificación de textos: usando el modelo como base, se pueden entrenar clasificadores para redes sociales, noticias o reseñas en bashkir. Su tokenizer y arquitectura están adaptados a la lengua.
- Extracción de entidades nombradas (NER): el modelo puede afinarse para identificar personas, lugares y organizaciones en textos bashkir, aprovechando sus representaciones contextuales.
- Sugerencia de escritura en editores de texto: un editor para bashkir puede integrar el modelo para sugerir la siguiente palabra o completar frases, usando la tarea fill-mask.
- Investigación lingüística: el modelo permite estudiar la morfología y la sintaxis del bashkir mediante análisis de predicciones de subwords, o usarse como referencia para comparar con otros modelos túrquicos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Precisión top-1 en MLM (conjunto enciclopédico held-out) | 24,7% |
| Precisión top-5 en MLM (conjunto enciclopédico held-out) | 54,0% |

Estos resultados son diagnósticos de la tarea de modelado de lenguaje enmascarado y no representan un benchmark de comprensión general. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 50,04 millones de parámetros. En safetensors (presumiblemente FP32) el checkpoint ocupa aproximadamente 200 MB; los ONNX FP16 e INT8 pesan 95,4 MB y 58,1 MB respectivamente.
- VRAM estimada: menos de 1 GB para FP32; menos de 500 MB para FP16; menos de 300 MB para INT8. Cabe en cualquier GPU consumer (RTX 3060, 4060, etc.) e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para ONNX FP16, GPUs con soporte DirectML o CUDA. Para CPU, el modelo INT8 es suficiente.
- Opciones de despliegue documentadas: Transformers (PyTorch) con `trust_remote_code=True` y ONNX Runtime con CPUExecutionProvider o CUDAExecutionProvider.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible: no se han identificado modelos públicos comparables para bashkir con arquitectura y tamaño similares en la información proporcionada. El ecosistema de modelos para lenguas túrquicas minoritarias es muy limitado.

## Limitaciones y advertencias

- Licencia personalizada (other): los términos no son estándar y deben revisarse antes de cualquier uso comercial o redistribución.
- Los textos de entrenamiento no se redistribuyen, por lo que no es posible auditar la composición del corpus, los posibles sesgos ni la calidad de los datos.
- Ventana de contexto de 256 tokens subword: limita el uso en documentos largos o en tareas que requieran dependencias a larga distancia.
- Modelo encoder-only: no puede generar texto libre ni mantener conversaciones; solo rellena máscaras.
- Los resultados de MLM son diagnósticos y no implican una comprensión general del lenguaje; el modelo puede fallar en tareas de razonamiento o semántica compleja.
- Al cargar con Transformers se requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor. Esto supone un riesgo de seguridad y debe hacerse solo con repositorios de confianza.
- Solo soporta bashkir; no ofrece capacidades multilingües.
- Riesgo de predicciones plausibles pero incorrectas en contextos ambiguos, especialmente cuando la máscara cubre una subword en lugar de una palabra completa.

## Enlaces

- HuggingFace: https://huggingface.co/failed09/bashkir-roberta
- Dataset monolingüe de Wikipedia en bashkir (actividad reciente del autor): https://huggingface.co/failed09/bashkir-wikipedia-monolingual
- Corpus paralelo bashkir-ruso (actividad reciente del autor): https://huggingface.co/AigizK/bashkir-russian-parallel-corpora
