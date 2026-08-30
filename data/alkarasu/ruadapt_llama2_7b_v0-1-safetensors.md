# Alkarasu/ruadapt_llama2_7b_v0.1-safetensors

## Resumen

El modelo `Alkarasu/ruadapt_llama2_7b_v0.1-safetensors` es una adaptación al ruso del modelo Llama-2-7B, desarrollada originalmente por el grupo RCC (Laboratorio de Inteligencia Artificial y Razonamiento Computacional) de la Universidad Estatal de Moscú, y re-subida por el usuario Alkarasu en formato safetensors. El objetivo es mejorar el rendimiento del modelo base en ruso mediante la sustitución del tokenizer original por uno específico para este idioma, seguido de un fine-tuning de las capas de embeddings y de la cabeza de salida (lm head) sobre un corpus ruso de 33 GB.

Esta adaptación es relevante porque aborda un problema conocido: los tokenizers de los modelos multilingües suelen fragmentar excesivamente las palabras en lenguas con morfología rica como el ruso, lo que degrada la calidad de la generación y aumenta el coste computacional. El trabajo se documenta en el artículo "Impact of Tokenization on LLaMa Russian Adaptation" (arXiv:2312.02598). El modelo tiene aproximadamente 6,7 mil millones de parámetros y se distribuye bajo la licencia Llama 2, lo que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7B) con tokenizer adaptado al ruso |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors fp16) |
| Idiomas soportados | Ruso (adaptación específica; el modelo base era multilingüe) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `TheBloke/Llama-2-7B-fp16` y aplica un fine-tuning selectivo: solo se actualizan las capas de embeddings y la cabeza de salida (lm head), mientras que el resto de los bloques transformer permanecen congelados. Esta estrategia, descrita en el paper arXiv:2312.02598, busca adaptar la representación interna al nuevo tokenizer ruso sin reentrenar todo el modelo, reduciendo costes computacionales y evitando el olvido catastrófico.

El entrenamiento se realizó sobre un dataset ruso de 33 GB, con 2 épocas, un learning rate de 2e-05, batch total de 192 (con gradiente acumulado) distribuido en 16 GPUs, y optimizador Adam con betas (0.9, 0.95). Se utilizó un scheduler lineal y el framework Transformers 4.34.0 con PyTorch 2.0.1. Los resultados de evaluación reportan una loss de 2.7569 y una accuracy de 0.4617 en el conjunto de validación. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un fine-tuning puramente de adaptación lingüística.

## Capacidades

- Generación de texto en ruso: el modelo produce texto coherente en ruso gracias al tokenizer adaptado, mejorando la fluidez frente al Llama-2 original en este idioma.
- Razonamiento y conocimiento general: hereda las capacidades del Llama-2-7B base, aunque el fine-tuning solo afecta a embeddings y lm head, por lo que el razonamiento profundo puede verse limitado.
- Comprensión lectora: puede procesar y responder a instrucciones en ruso, aunque no se ha entrenado específicamente para seguir instrucciones (la versión instruct está disponible por separado en `rccmsu/ruadapt_saiga2_7b_v0.1`).
- Multilingüismo residual: al partir de Llama-2, conserva cierta capacidad en otros idiomas, pero su rendimiento fuera del ruso no está garantizado y probablemente sea inferior al del modelo original.
- No se documenta soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Generación de contenido en ruso: redacción de artículos, resúmenes o textos creativos en ruso con mayor naturalidad que el Llama-2 original, gracias a la tokenización adaptada.
- Sistemas de preguntas y respuestas en ruso: integración en chatbots o asistentes que requieran comprender y responder en ruso, aunque para tareas de instrucción se recomienda la versión instruct (`ruadapt_saiga2_7b_v0.1`).
- Análisis de sentimiento y clasificación de texto ruso: al ser un modelo de lenguaje, puede usarse como base para fine-tuning posterior en tareas específicas de PLN en ruso, como análisis de opiniones o categorización de documentos.
- Traducción asistida ruso-otros idiomas: aunque no está entrenado para traducción, puede servir como componente en pipelines de generación o como modelo base para adaptaciones multilingües.
- Investigación académica sobre tokenización: el modelo es útil para estudiar el impacto de la tokenización en lenguas morfológicamente ricas, tal como se describe en el paper asociado.
- Prototipado de aplicaciones NLP en ruso: dado su tamaño moderado (7B), puede desplegarse en entornos con recursos limitados para experimentar con generación de texto en ruso antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de evaluación del fine-tuning:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 2.7569 |
| Accuracy (evaluacion) | 0.4617 |

Estos valores corresponden a la tarea de modelado de lenguaje sobre el conjunto de validación ruso, no a benchmarks de razonamiento o conocimiento. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6.738.415.616 parámetros. En fp16 (formato safetensors del repo) ocupa aproximadamente 13.5 GB, por lo que se necesita al menos 16 GB de VRAM para cargarlo sin cuantización.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) puede ejecutar el modelo en fp16. Para GPUs con menos VRAM (8-12 GB) sería necesario cuantizar a 8 bits o 4 bits, aunque no se proporcionan versiones cuantizadas oficiales.
- En consumer GPU: sí, cabe en una RTX 4090 o RTX 3090 (24 GB) en fp16. En GPUs de 16 GB (como RTX 4080) también es posible con margen ajustado.
- Opciones de despliegue: al ser un modelo estándar de Transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (importando adaptadores safetensors). No se incluyen archivos GGUF en el repo.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un Llama-2-7B en fp16 en una A100 suele generar entre 20 y 40 tokens por segundo, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Alkarasu/ruadapt_llama2_7b_v0.1 | 6.7B | No disponible | Ruso | Llama 2 | Adaptación rusa con tokenizer propio |
| meta-llama/Llama-2-7b | 6.7B | 4096 (heredado) | Multilingue (principalmente ingles) | Llama 2 | Modelo base original |
| rccmsu/ruadapt_saiga2_7b_v0.1 | 6.7B | No disponible | Ruso | Llama 2 | Versión instruct de la misma adaptación |

La comparativa se limita a modelos de la misma familia. No se dispone de datos de rendimiento para establecer diferencias cuantitativas. La principal diferencia entre el modelo base y la adaptación es la tokenización rusa, que mejora la eficiencia y calidad en ruso, pero puede degradar el rendimiento en otros idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama-2, el modelo puede heredar sesgos presentes en los datos de entrenamiento originales, que no han sido mitigados en esta adaptación.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados. No se ha realizado alineación específica para reducir este riesgo.
- Limitaciones de contexto: no se especifica la longitud de contexto; se asume que hereda los 4096 tokens de Llama-2, pero no está confirmado. Para contextos largos se requiere verificación.
- Limitaciones de idioma: el fine-tuning se centra en ruso; el rendimiento en otros idiomas puede degradarse respecto al modelo base, y no se garantiza la calidad fuera del ruso.
- Restricciones de licencia: la licencia Llama 2 permite uso comercial, pero impone restricciones (por ejemplo, no usarlo para mejorar otros modelos grandes sin permiso). Es necesario revisar los términos completos.
- Advertencia para produccion: al ser una versión v0.1 con 0 descargas y sin benchmarks públicos, se recomienda validar exhaustivamente el modelo en el caso de uso concreto antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alkarasu/ruadapt_llama2_7b_v0.1-safetensors
- Modelo original (rccmsu): https://huggingface.co/rccmsu/ruadapt_llama2_7b_v0.1
- Versión instruct: https://huggingface.co/rccmsu/ruadapt_saiga2_7b_v0.1
- Paper: https://arxiv.org/abs/2312.02598
- Repositorio GitHub del proyecto: https://github.com/LAIR-RCC/ruadapt
- Modelo base Llama-2-7B: https://huggingface.co/meta-llama/Llama-2-7b
