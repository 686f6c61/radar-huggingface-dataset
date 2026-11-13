# pecan-anon/graphcodebert-pecan

## Resumen

GraphCodeBERT-PECAN es un modelo de clasificación de texto derivado de `microsoft/graphcodebert-base`, afinado por el usuario `pecan-anon` sobre el benchmark PECAN. Su tarea es identificar el lenguaje de programación de un fragmento de código crudo de 512 bytes, sin disponer de nombre de fichero ni extensión, cubriendo un total de 319 lenguajes. El modelo se publica con licencia MIT y pesos en safetensors, lo que facilita su integración en pipelines de `transformers`.

La relevancia del modelo radica en su caso de uso: la detección de lenguaje a partir de fragmentos sin metadatos es un problema habitual en sistemas de análisis de código, motores de resaltado sintáctico, clasificación de repositorios y herramientas de seguridad que necesitan enrutar muestras a analizadores específicos. El autor reporta una accuracy de 0,9576 y un macro-F1 de 0,9304 sobre el split de test del benchmark PECAN.

Arquitectura y tamaño corresponden a la base original: un transformer tipo RoBERTa con 124.890.943 parámetros totales (aproximadamente 125 M), pesos en safetensors y un repositorio de 0,5 GB. No se especifican en la información disponible la longitud de contexto efectiva, los idiomas naturales soportados ni detalles del proceso de entrenamiento más allá del dataset PECAN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: `microsoft/graphcodebert-base`) |
| Parámetros totales | 124.890.943 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona fragmentos de 512 bytes de código) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la tarea es clasificación de lenguajes de programación, 319 clases) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/graphcodebert-base`, un encoder transformer basado en RoBERTa entrenado originalmente para representaciones de código que combinan información textual y estructural (grafos de flujo de datos). Sobre esa base, `pecan-anon` ha realizado un ajuste fino supervisado para una tarea de clasificación multiclase con 319 etiquetas, correspondientes a lenguajes de programación. La cabeza de clasificación se ha adaptado al número de clases del benchmark PECAN.

Según la model card, el entrenamiento se realizó sobre el benchmark PECAN, con fragmentos de código crudo de 512 bytes como entrada y sin nombre de fichero ni extensión. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO (poco habitual en una tarea de clasificación) ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de lenguaje de programación a partir de fragmentos de código crudo de 512 bytes, entre 319 lenguajes posibles.
- Funciona sin metadatos de fichero (sin nombre ni extensión), lo que lo hace adecuado para entradas aisladas o anonimizadas.
- Salida de clasificación multiclase con probabilidades por lenguaje (cabeza de `text-classification`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües naturales: no disponibles.
- Capacidad especial: ninguna documentada más allá de la clasificación de lenguajes.

## Casos de uso

- Detección de lenguaje en fragmentos de código sin extensión: el modelo recibe 512 bytes de código y devuelve el lenguaje probable, útil en pipelines de ingesta donde los ficheros llegan sin metadatos o con extensiones incorrectas.
- Enrutado a analizadores específicos: en un sistema de análisis estático, el modelo puede seleccionar el parser o linter adecuado para cada fragmento antes de procesarlo, reduciendo errores de parseo.
- Resaltado sintáctico en editores y plataformas: integración en editores o wikis que necesitan resaltar código pegado sin extensión, usando la etiqueta de lenguaje predicha.
- Clasificación de repositorios y datasets de código: etiquetado automático de fragmentos en corpus mixtos para construir datasets etiquetados por lenguaje o para auditar la composición lingüística de un repositorio.
- Seguridad y triaje de muestras: en análisis de malware o código sospechoso, identificar el lenguaje del fragmento ayuda a priorizar y seleccionar herramientas de análisis adecuadas.
- Moderación y filtrado de contenido: detección de fragmentos de código en flujos de texto para separarlos de contenido no técnico o aplicar políticas específicas por lenguaje.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Accuracy (split de test PECAN) | 0,9576 |
| Macro-F1 (split de test PECAN) | 0,9304 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en tareas distintas a la clasificación de lenguaje del benchmark PECAN.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos (125 M de parámetros), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas consumer como GTX 1650, RTX 3060, RTX 4090 son suficientes. Para despliegues de alto throughput, A10, L4, A100 o H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (Pipeline de `text-classification`), Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), endpoints compatibles, y exportación a ONNX si se requiere. No se documenta soporte explícito de vLLM, llama.cpp u Ollama para este modelo de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphCodeBERT-PECAN | 124,9 M | no disponible | Clasificación de lenguaje (319 clases) | MIT | Hugging Face |
| `microsoft/graphcodebert-base` | ~125 M | 512 tokens (típico en RoBERTa-base) | Representaciones de código (base, sin cabeza de clasificación de lenguaje) | MIT | Hugging Face |
| `huggingface/CodeBERTa-small-v1` | ~84 M | 512 tokens | Representaciones de código (base) | MIT | Hugging Face |

No se dispone en la información proporcionada de comparativas de rendimiento frente a otros clasificadores de lenguaje de programación, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (clasificación de lenguaje) y no debe usarse para generación, razonamiento ni otras tareas de NLP.
- La entrada está pensada para fragmentos de 512 bytes; fragmentos más largos o más cortos pueden degradar la precisión y no se documenta el comportamiento fuera de ese rango.
- El rendimiento reportado (accuracy 0,9576, macro-F1 0,9304) corresponde al split de test del benchmark PECAN; el rendimiento en dominios distintos (código ofuscado, minificado, generado, lenguajes de nicho) puede ser inferior.
- Riesgo de confusión entre lenguajes sintácticamente similares o entre dialectos; el macro-F1 inferior a la accuracy sugiere menor rendimiento en clases poco representadas.
- No se documentan sesgos específicos ni evaluación de robustez frente a entradas adversariales.
- Licencia MIT: permite uso comercial, modificación y redistribución, manteniendo el aviso de copyright. Debe verificarse la licencia del modelo base `microsoft/graphcodebert-base` (MIT según la información disponible).
- El autor del modelo es anónimo (`pecan-anon`) y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- No se documentan idiomas naturales soportados ni limitaciones de contexto más allá del tamaño de fragmento indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pecan-anon/graphcodebert-pecan
- Modelo base: https://huggingface.co/microsoft/graphcodebert-base
- Benchmark PECAN (código y artefactos): https://anonymous.4open.science/r/pecan-benchmark
- Paper de GraphCodeBERT (referencia del modelo base): https://arxiv.org/abs/2009.08366
