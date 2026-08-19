# Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-cd0p2-tri34b

## Resumen

El modelo `sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-cd0p2-tri34b` es un checkpoint de pretraining de 1.700 millones de parámetros, desarrollado por Raghav Singhal como parte de su investigación sobre alineación de modelos desde el primer token de entrenamiento. Se basa en la arquitectura LlamaForCausalLM y se publica en formato Hugging Face, convertido desde un checkpoint de Megatron. El nombre del repositorio codifica los hiperparámetros del entrenamiento: 100 mil millones de tokens, 20 épocas, ventana de contexto de 2048 tokens, batch size global de 960 GB, y un esquema de ponderación condicional de entropía (CEW) con peso 1.0, junto con un coeficiente de divergencia KL de 20 y una ventana de 32.

El modelo pertenece a la familia SmolLM de Hugging Face, orientada a modelos pequeños y eficientes. Su relevancia radica en que explora una línea de investigación poco común: incorporar señales de "juicio" o alineación durante el pretraining, en lugar de depender exclusivamente de técnicas de post-entrenamiento como RLHF o DPO. Aunque el checkpoint es un modelo base sin fine-tuning aparente, su interés principal es académico y experimental, dirigido a investigadores que estudian métodos de alineación temprana y entrenamiento con datos sintéticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM |
| Parametros totales | 1.711.376.384 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bfloat16 (en disco); cuantizaciones adicionales no publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer decoder-only estándar (LlamaForCausalLM) con un vocabulario de 49.152 tokens. Según la model card, es un checkpoint convertido desde un entrenamiento de Megatron en la iteración 17.000, con precisión bfloat16. El nombre del repositorio sugiere que el entrenamiento se realizó sobre 100 mil millones de tokens, con 20 épocas y una ventana de contexto de 2048 tokens, aunque estos datos no están confirmados en la documentación oficial.

La innovación principal, según el sitio web del autor, es el uso de "pretraining con feedback" o "metadata-conditioned pretraining", donde el modelo recibe señales de juicio o alineación durante el propio entrenamiento, en lugar de solo en fases posteriores. El término "judgemental" y los coeficientes CEW (conditional entropy weighting) y KL weighting en el nombre apuntan a un esquema de ponderación de la pérdida basado en la entropía condicional y la divergencia KL, posiblemente para reforzar ciertos comportamientos durante el pretraining. No se dispone de detalles adicionales sobre la composición del dataset ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural, al ser un modelo base de tipo causal LM.
- Razonamiento básico y completado de texto, limitado por su tamaño de 1,7B parámetros.
- Capacidad de procesar secuencias de hasta 2048 tokens, suficiente para tareas de texto corto y medio.
- Posible soporte multilingüe heredado de la familia SmolLM, aunque no está confirmado para este checkpoint específico.
- No se ha documentado soporte para tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Al ser un modelo base, no incluye capacidades de chat o instrucción; requiere fine-tuning para tareas específicas.

## Casos de uso

- Investigación en alineación temprana: el modelo es un banco de pruebas para estudiar cómo las señales de juicio durante el pretraining afectan al comportamiento final. Un investigador puede comparar este checkpoint con otros de la misma serie (variando CEW o KL) para medir diferencias en sesgo, toxicidad o coherencia.
- Experimentación con datos sintéticos: dado el interés del autor en el pretraining con datos casi completamente sintéticos, este modelo puede usarse para evaluar la calidad de generación de texto sintético frente a modelos entrenados con datos naturales.
- Fine-tuning para tareas específicas de NLP: al ser un modelo base de 1,7B, puede adaptarse con LoRA o fine-tuning completo para clasificación de texto, análisis de sentimiento o generación de respuestas cortas, siempre que se disponga de un dataset etiquetado.
- Educación y docencia: por su tamaño reducido, es adecuado para demostrar conceptos de pretraining, alineación y evaluación de modelos en entornos académicos con recursos limitados.
- Comparación de metodologías de entrenamiento: los investigadores pueden contrastar este checkpoint con SmolLM-1.7B original para aislar el efecto del esquema de ponderación condicional de entropía en la calidad del modelo.
- Prototipado rápido de aplicaciones de texto: aunque no es un modelo de instrucción, puede servir como base para generar borradores de texto, resúmenes o completado de frases en aplicaciones de baja exigencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares, y no se ha encontrado documentación externa con evaluaciones cuantitativas. Se recomienda al lector ejecutar sus propias evaluaciones si necesita datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 3,4 GB en disco, por lo que la inferencia requiere al menos 4-5 GB de VRAM con el modelo cargado en memoria. Con cuantización a 8 bits, se reduce a ~2 GB; con 4 bits, a ~1 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM puede ejecutar el modelo en bfloat16, como una RTX 2060, RTX 3060, RTX 4060 o superiores. Para cuantización 4-bit, incluso una GTX 1650 con 4 GB podría ser suficiente.
- Cabe en GPUs consumer: sí, es un modelo pequeño pensado para ejecutarse en hardware de gama media.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Hugging Face TGI y transformers estándar. Al ser un modelo base, se recomienda usar pipelines de generación de texto.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU consumer moderna (RTX 3060), se puede esperar una generación de 20-50 tokens por segundo en bfloat16, dependiendo de la longitud de la secuencia y el batch size.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sdsp-smollm-1p7b (este) | 1,7B | 2048 | no disponible | Hugging Face |
| SmolLM-1.7B (Hugging Face) | 1,7B | 2048 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32768 | Apache 2.0 | Hugging Face |
| Gemma-2-2B | 2,6B | 8192 | Gemma license | Hugging Face |

La comparativa es estructural, ya que no hay datos de rendimiento para este checkpoint. Frente a SmolLM-1.7B original, este modelo incorpora el esquema de ponderación condicional de entropía, pero carece de la documentación y el soporte de la versión oficial. Qwen2.5-1.5B ofrece un contexto mucho mayor (32K) y una licencia permisiva, mientras que Gemma-2-2B es más grande pero con restricciones de uso comercial. Para producción, las alternativas con licencia clara y benchmarks publicados son más recomendables.

## Limitaciones y advertencias

- No se ha especificado licencia, lo que impide su uso comercial sin autorización explícita del autor.
- No hay información sobre sesgos, alucinaciones o comportamientos indeseados; al ser un modelo base experimental, estos riesgos no están evaluados.
- El contexto de 2048 tokens es corto para aplicaciones que requieran ventanas largas.
- No se han publicado idiomas soportados; aunque la familia SmolLM es multilingüe, este checkpoint no lo confirma.
- El modelo no está alineado para instrucciones ni chat; requiere fine-tuning para tareas interactivas.
- La documentación es mínima: no hay paper, ni detalles del dataset, ni configuración de entrenamiento más allá de lo inferido del nombre.
- Al ser un checkpoint de investigación, puede contener artefactos de entrenamiento o comportamientos inestables no documentados.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-cd0p2-tri34b
- Variante con klw_30: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_30-tri34b
- Variante con cew_0p0: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_0p0-klw_20-w32-tri34b
- Página personal del autor: https://raghavsinghal10.github.io/
- Despliegue en FriendliAI (variante klw_30): https://friendli.ai/models/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_30-tri34b
