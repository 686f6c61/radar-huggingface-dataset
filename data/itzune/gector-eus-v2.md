# itzune/gector-eus-v2

## Resumen

GECToR v2 es un modelo de corrección gramatical automática (GEC) para euskera, desarrollado por itzune como sucesor de la versión anterior `gector-eus`. Se basa en la arquitectura GECToR (Tag, Not Rewrite), un enfoque seq2edit que transforma la corrección en una tarea de etiquetado de tokens, y utiliza como encoder el modelo `ixa-ehu/roberta-eus-euscrawl-base-cased` (RoBERTa preentrenado en euskera). El modelo incorpora una tercera cabeza de clasificación de tipo de error, lo que permite no solo corregir sino también explicar cada edición con una de ocho categorías (ortografía, morfología, puntuación, etc.).

La principal innovación frente a la v1 es el entrenamiento multi-tarea sobre el corpus `horkonpon-corpus`, que incluye más de 160.000 pares de frases con errores reales y sus correcciones, cubriendo 8+ tipos de error. Esto amplía la cobertura más allá de la morfología y permite un uso explicable en aplicaciones de linting o interfaces de usuario. Además, al estar los datos de entrenamiento bajo licencias CC-BY-SA/CC-BY/dominio público, los pesos del modelo no tienen restricción de uso no comercial, a diferencia de la v1.

Con aproximadamente 124 millones de parámetros, es un modelo ligero que puede desplegarse en navegador mediante exportación a ONNX int4 (~80 MB). En la evaluación sobre el split de validación de horkonpon-corpus alcanza un F0.5 de 77.6, con una tasa de falsos positivos en frases limpias del 1.8%, muy inferior a la de un LLM fine-tuneado como Gemma 4 (8.6%). Su relevancia actual radica en ofrecer una corrección gramatical de alta precisión para una lengua minoritaria, con explicabilidad y bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GECToR (encoder RoBERTa-eus-base + 3 cabezas: edit-label, detect, type) |
| Parametros totales | 127.709.587 (según safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (limitada por el tokenizador de RoBERTa, típicamente 512 tokens) |
| Tipos de cuantizacion | safetensors (FP32/FP16), exportable a ONNX int4 (~80 MB) |
| Idiomas soportados | euskera (eu) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX (exportable) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GECToR original de Grammarly, que formula la corrección gramatical como una tarea de etiquetado de secuencias: cada token recibe una etiqueta de edición (mantener, borrar, insertar, reemplazar) y, en esta versión multi-tarea, una etiqueta adicional de tipo de error. El encoder es `ixa-ehu/roberta-eus-euscrawl-base-cased`, un modelo RoBERTa preentrenado sobre el corpus EusCrawl en euskera, con 12 capas y ~124M de parámetros. Sobre el encoder se añaden tres cabezas de clasificación: una para las etiquetas de edición, una para la detección binaria de error y una tercera para clasificar el tipo de error entre 9 categorías (`none, spelling, punctuation, capitalization, word_level, zalantza, morphology, proper_noun, calque`).

El entrenamiento se realizó sobre `horkonpon-corpus`, un corpus de 161.670 pares de frases (error + corrección) anotados con tipos de error, durante 9 épocas. A diferencia de la v1, que solo cubría errores morfológicos del corpus Elhuyar, este corpus incluye errores reales de hablantes, calcos del español/francés y errores de nivel de palabra. No se utilizó RLHF ni DPO; el entrenamiento es supervisado con pérdida de clasificación estándar. La innovación principal es la cabeza de tipo de error, que permite explicar cada corrección y facilita su uso en herramientas de linting o interfaces de usuario.

## Capacidades

- Corrección gramatical automática de texto en euskera mediante edición mínima (seq2edit), no generación libre.
- Clasificación del tipo de error por token: ortografía, morfología, puntuación, capitalización, error de nivel de palabra, zalantza (error de palabra real), nombre propio y calco.
- Detección binaria de errores (cabeza de detección) que permite filtrar frases limpias con alta precisión.
- Explicabilidad: cada edición va acompañada de su categoría de error, útil para herramientas de revisión.
- Despliegue ligero: exportable a ONNX int4 (~80 MB) para ejecución en navegador con Transformers.js o WASM.
- No es un modelo generativo: no produce texto libre, solo etiquetas de edición sobre tokens de entrada.
- Soporte de tokenización con prefijo de espacio y vocabulario de formas verbales para reinflexión morfológica.

## Casos de uso

- Corrector ortográfico y gramatical en editores de texto: el modelo puede integrarse en procesadores de texto o editores de código para marcar errores en euskera, mostrando además el tipo de error (p. ej., "error de morfología" o "calco del español") gracias a la cabeza de clasificación.
- Herramienta de escritura para estudiantes de euskera: al ofrecer explicaciones por tipo de error, ayuda a los aprendices a entender sus fallos y mejorar su dominio de la lengua.
- Revisión de contenido en medios de comunicación: redacciones que publican en euskera pueden usar el modelo como primer filtro de calidad, con una tasa de falsos positivos del 1.8% en frases limpias, lo que reduce la carga de revisión manual.
- Integración en pipelines de procesamiento de lenguaje natural: al ser un modelo de etiquetado de tokens, puede combinarse con otros componentes (análisis morfológico, etiquetado POS) para tareas de normalización de texto.
- Asistente de traducción automática: como paso de post-edición para corregir errores gramaticales en textos traducidos al euskera, especialmente calcos y errores de nivel de palabra.
- Aplicación web de corrección en tiempo real: gracias a la exportación ONNX, puede ejecutarse en el navegador sin servidor, ofreciendo corrección instantánea con privacidad (los textos no salen del dispositivo).
- Análisis de calidad lingüística en corpus: la clasificación de tipos de error permite cuantificar la frecuencia de cada categoría en un conjunto de textos, útil para investigación sociolingüística o evaluación de herramientas.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de horkonpon-corpus (1.037 frases con error + 1.037 limpias), con `min_error_prob=0.5` y 5 iteraciones:

| Metrica | GECToR v2 (multi-tarea) | GECToR v1 | Gemma 4 (fine-tune) | Gemma 4 (base) |
|--------|:----------------------:|:---------:|:-------------------:|:--------------:|
| F0.5 | 77.6 | 47.5 | **80.8** | 2.2 |
| Exact match | 51.3% | 18.0% | 65.5% | 7.0% |
| Precision | 87.6% | 83.8% | 86.3% | 1.8% |
| Recall | 53.3% | 17.4% | 64.4% | 16.5% |
| Clean FP | 1.8% | 1.7% | 8.6% | 97.2% |

Nota: la v1 fue evaluada con cambio de dominio (entrenada solo con morfología de Elhuyar), por lo que su F0.5 es bajo en este corpus; en su propio conjunto de validación alcanza F0.5=90.2. La versión single-task de v2 (sin cabeza de tipo) obtiene F0.5=78.8, por lo que la cabeza multi-tarea cuesta 1.2 puntos de F0.5 a cambio de la clasificación de errores.

Clasificación de tipos de error (sobre 1.115 palabras con error):

| Categoria | Precision | Recall | F0.5 | Soporte |
|-----------|-----------|--------|------|---------|
| morphology | 100.0% | 93.5% | 98.6% | 292 |
| spelling | 95.7% | 92.4% | 95.0% | 170 |
| punctuation | 97.8% | 70.7% | 90.9% | 258 |
| word_level | 87.8% | 100.0% | 90.0% | 36 |
| zalantza | 82.0% | 85.0% | 82.6% | 89 |
| capitalization | 78.6% | 100.0% | 82.1% | 33 |
| proper_noun | 100.0% | 38.7% | 75.9% | 83 |
| calque | 100.0% | 28.7% | 66.8% | 76 |

La precisión es alta en todas las categorías, pero el recall es bajo para `calque` y `proper_noun` porque la cabeza de detección a menudo no los marca como errores.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene ~127M de parámetros, por lo que puede ejecutarse en CPU con ~500 MB de RAM (peso FP32) o ~250 MB en FP16. La latencia por frase es de decenas de milisegundos en un procesador moderno.
- GPU: cualquier GPU con al menos 1 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1050 Ti, Jetson Nano). En una RTX 4090 o A100, la inferencia es casi instantánea, limitada por el preprocesamiento.
- Despliegue en navegador: exportación a ONNX int4 (~80 MB) permite ejecución con Transformers.js o WASM en dispositivos con 2 GB de RAM, sin necesidad de servidor.
- Opciones de despliegue: el modelo no es compatible con vLLM ni TGI por su arquitectura custom; se usa con el paquete `gotutiyan/gector` (MIT) o el fork multi-tarea `gector-eus-v2/gector_multitask`. También puede exportarse a ONNX para runtime estándar.
- Throughput estimado: con batch_size=128 en GPU, se procesan miles de frases por segundo; en CPU, cientos de frases por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | F0.5 (horkonpon) | Licencia |
|--------|--------------|------------|----------|------------------|----------|
| GECToR v2 (este) | GECToR + RoBERTa-eus | ~124M | no disponible | 77.6 | CC-BY-SA 4.0 |
| GECToR v1 | GECToR + RoBERTa-eus | ~124M | no disponible | 47.5 (en horkonpon) | CC-BY-NC-SA 4.0 |
| Gemma 4 (fine-tune) | LLM generativo | ~4B (estimado) | 8K+ | 80.8 | Gemma license (uso comercial permitido) |

GECToR v2 es significativamente más ligero que Gemma 4 (124M vs 4B) y ofrece una tasa de falsos positivos mucho menor (1.8% vs 8.6%), aunque Gemma 4 fine-tuneado supera en F0.5 y exact match. La ventaja de GECToR v2 es su explicabilidad (tipos de error) y su capacidad de ejecución en navegador. Frente a la v1, la v2 amplía la cobertura de tipos de error y elimina la restricción de uso no comercial.

## Limitaciones y advertencias

- El modelo solo corrige errores de edición mínima; no reescribe frases completas ni mejora el estilo, solo corrige errores gramaticales y ortográficos.
- La longitud de contexto no está documentada; el tokenizador de RoBERTa tiene un máximo de 512 tokens, por lo que frases muy largas deben truncarse o dividirse.
- La clasificación de tipos de error tiene recall bajo para `calque` y `proper_noun` (28.7% y 38.7% respectivamente), lo que puede infraestimar estos errores en uso real.
- El modelo está entrenado exclusivamente en euskera; no soporta otros idiomas ni mezcla de idiomas.
- La licencia CC-BY-SA 4.0 requiere que las obras derivadas se distribuyan bajo la misma licencia; si se integra en un producto comercial, debe compartirse el código o los datos modificados bajo CC-BY-SA.
- No es un modelo generativo: no puede producir texto libre, solo etiquetas de edición. Para tareas de generación se necesitaría un LLM.
- Los datos de entrenamiento provienen de `horkonpon-corpus`, que puede contener sesgos de los anotadores o de las fuentes (textos de internet); no se han documentado evaluaciones de sesgo.
- La evaluación se realizó sobre un split de validación del mismo corpus; el rendimiento en otros dominios (p. ej., textos formales, dialectos) puede variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itzune/gector-eus-v2
- Repositorio de la v1: https://github.com/itzune/gector-eus
- Repositorio de la v2 (fork multi-tarea): https://github.com/itzune/gector-eus-v2
- Corpus horkonpon: https://github.com/itzune/horkonpon-corpus
- Paquete GECToR original: https://github.com/gotutiyan/gector
- Implementación oficial de Grammarly: https://github.com/grammarly/gector
- Modelo base RoBERTa-eus: https://huggingface.co/ixa-ehu/roberta-eus-euscrawl-base-cased
- Ablación con Gemma 4: https://huggingface.co/itzune/gemma-4-e4b-horkonpon
