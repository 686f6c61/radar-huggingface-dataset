# DruidTheGetafix/apiary-7B-A1B

## Resumen

apiary-7B-A1B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DruidTheGetafix, preentrenado desde cero sobre 9.84 mil millones de tokens del dataset FineWeb-Edu. Su arquitectura replica exactamente la de Qwen3MoeForCausalLM, con 64 expertos y selección top-8, lo que resulta en 6.85 mil millones de parámetros totales y solo 1.21 mil millones activos por token. El entrenamiento se completó en 5.24 horas en un nodo de 8 GPUs B200, consumiendo 41.9 GPU-horas, un presupuesto de cómputo deliberadamente reducido.

El modelo se presenta como un artefacto de investigación para estudiar la viabilidad de entrenar arquitecturas MoE desde cero con recursos limitados. Según su autor, se sitúa en la clase de modelos base como GPT-2-XL o Pythia-1B, es decir, un modelo coherente pero no competitivo con sistemas entrenados con billones de tokens. No es un modelo de instrucciones ni está pensado para uso directo en producción, sino como base para experimentación y fine-tuning.

La relevancia actual radica en la creciente atención a la eficiencia del entrenamiento de MoE y a la reproducibilidad de resultados con presupuestos de cómputo acotados. El modelo está disponible bajo licencia Apache-2.0, con pesos en formato safetensors, y su código de entrenamiento es público en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (MoE, 64 expertos, top-8) |
| Parametros totales | 6.847.272.960 (6.85B) |
| Parametros activos | 1.21B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 archivos, 13.7 GB) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura MoE idéntica a la de Qwen3MoeForCausalLM: 16 capas, dimensión oculta de 2048, 16 cabezas de atención (8 para clave/valor), 64 expertos con selección top-8 y tamaño de experto de 1024, y un vocabulario de 49152 tokens. Esta configuración da lugar a 6.85B parámetros totales, de los cuales solo 1.21B se activan por token, lo que reduce el coste computacional por inferencia.

El entrenamiento se realizó desde cero sobre los primeros 20 archivos parquet del subconjunto `sample/100BT` de FineWeb-Edu, tokenizados con el tokenizador SmolLM2, separados por EOS y sin enmascaramiento de documentos. Se usó el optimizador AdamW con learning rate 3e-4, betas 0.9/0.95, weight decay 0.1, lotes de 1.05M tokens, 500 pasos de warmup y decaimiento lineal en el último 20% del presupuesto temporal. Se aplicaron pérdidas auxiliares de balance de carga (0.01) y router z-loss (1e-3). El sistema se implementó con PyTorch 2.13, FSDP2, torch.compile y ejecución de expertos con `grouped_mm`, alcanzando una mediana de 613k tokens/s (28.2% MFU) en 8 GPUs B200, con 9382 pasos de optimizador.

La innovación principal reside en la combinación de técnicas de entrenamiento eficiente (FSDP2, torch.compile, grouped_mm) aplicadas a una arquitectura MoE estándar, demostrando que es posible obtener un modelo base funcional con un presupuesto de cómputo muy inferior al habitual.

## Capacidades

- Generación de texto en inglés: produce texto coherente a nivel de modelo base, aunque con limitaciones propias de un entrenamiento con pocos tokens.
- Razonamiento básico: los resultados en benchmarks como HellaSwag (48.8) y ARC-e (59.6) indican cierta capacidad de razonamiento de sentido común, aunque por debajo de modelos más grandes.
- Modelo base: no está entrenado para seguir instrucciones ni para diálogo; requiere fine-tuning para tareas específicas.
- Sin soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüe: solo inglés, sin capacidades documentadas en otros idiomas.
- Compatible con el ecosistema transformers: puede cargarse con `Qwen3MoeForCausalLM` y utilizarse para generación de texto estándar.

## Casos de uso

- Investigación académica sobre eficiencia de entrenamiento MoE: el modelo y su código permiten estudiar el impacto del presupuesto de cómputo en la calidad final, así como reproducir el entrenamiento en hardware distinto.
- Prototipado de pipelines de generación de texto: al ser un modelo base pequeño, puede servir para validar infraestructuras de inferencia o fine-tuning antes de escalar a modelos mayores.
- Fine-tuning para tareas específicas con pocos datos: su tamaño reducido (1.21B activos) permite ajustarlo en una GPU consumer para tareas como clasificación de texto o generación de resúmenes en inglés.
- Educación y aprendizaje sobre arquitecturas MoE: al ser un modelo abierto y entrenado desde cero, es útil para enseñar los principios de los Mixture-of-Experts, incluyendo el balance de carga y la selección de expertos.
- Benchmarking de hardware de inferencia: al tener un número de parámetros activos bajo, puede usarse para medir el rendimiento de GPUs en escenarios MoE sin necesidad de modelos grandes.
- Experimentos de interpretabilidad: al ser un modelo base pequeño, es más fácil analizar el comportamiento de los expertos y las rutas de activación, lo que facilita estudios de análisis de mecanismos internos.

## Benchmarks y rendimiento

Los resultados de evaluación (lm-eval-harness, 0-shot) publicados en la model card son los siguientes:

| Benchmark | Resultado |
|---|---|
| HellaSwag | 48.8 |
| ARC-e | 59.6 |
| ARC-c | 33.4 |
| PIQA | 70.9 |
| Winogrande | 52.5 |
| MMLU | 25.5 |
| Wikitext word ppl | 19.2 |

Además, se reporta una entropía cruzada final de entrenamiento de 2.497 y una entropía cruzada en un conjunto de validación held-out de FineWeb-Edu de 2.462 (perplejidad 11.7) sobre 262k tokens no vistos. La paridad de logits con el código de entrenamiento muestra un acuerdo de argmax del 90.6% y una diferencia media absoluta de 0.077.

No se han publicado comparaciones con otros modelos en la información disponible. El autor clasifica el modelo en la clase de GPT-2-XL y Pythia-1B, pero no se proporcionan números de esos modelos para comparar directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 13.7 GB (tamaño del repositorio). Para inferencia se necesita al menos esa cantidad de VRAM más overhead de activaciones, por lo que una GPU con 16 GB podría ser suficiente, aunque no está confirmado oficialmente.
- GPU recomendadas: para entrenamiento se usaron 8x B200. Para inferencia, cualquier GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) podría ejecutar el modelo en bf16. No se han publicado cuantizaciones, por lo que no hay opciones de menor VRAM.
- Si cabe en consumer GPU: sí, una RTX 4090 (24 GB) o similar podría ejecutarlo, pero no hay datos oficiales de latencia o throughput.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI o directamente con la librería transformers. También podría convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se ha publicado dicha conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables (GPT-2-XL, Pythia-1B) en la información proporcionada, por lo que no es posible realizar una comparativa cuantitativa. El autor sitúa el modelo en la misma clase que GPT-2-XL (1.5B) y Pythia-1B (1B) en términos de calidad general, pero con una arquitectura MoE que reduce los parámetros activos. A diferencia de estos, apiary-7B-A1B tiene 6.85B parámetros totales pero solo 1.21B activos, lo que lo hace más eficiente en inferencia que un modelo denso de tamaño equivalente. La licencia Apache-2.0 es más permisiva que la de GPT-2 (MIT) y similar a la de Pythia (Apache-2.0). No se han encontrado otros modelos MoE de tamaño similar entrenados desde cero con presupuestos tan reducidos en la información disponible.

## Limitaciones y advertencias

- Modelo base, no entrenado para instrucciones ni diálogo: no es adecuado para uso directo en chatbots o asistentes sin fine-tuning previo.
- Entrenamiento con solo 9.84B tokens: el rendimiento es limitado en tareas complejas, como refleja el MMLU de 25.5, muy por debajo de modelos entrenados con billones de tokens.
- Solo inglés: no hay soporte documentado para otros idiomas.
- Riesgo de alucinación: al ser un modelo base, puede generar texto plausible pero incorrecto, especialmente en tareas de conocimiento factual.
- Sesgos: al entrenarse con FineWeb-Edu, puede heredar sesgos presentes en ese dataset, aunque no se han documentado análisis específicos.
- Longitud de contexto no especificada: no se indica la ventana de contexto máxima, lo que dificulta planificar su uso en aplicaciones que requieran contextos largos.
- Sin cuantizaciones oficiales: no se han publicado versiones GGUF o cuantizadas, lo que limita su despliegue en hardware con poca VRAM.
- No competitivo para producción: el propio autor advierte que no es un modelo competitivo con sistemas entrenados a gran escala; debe considerarse un artefacto de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/DruidTheGetafix/apiary-7B-A1B
- Repositorio de código y configuración de entrenamiento: https://github.com/Gaurav-Shah05/apiary
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
