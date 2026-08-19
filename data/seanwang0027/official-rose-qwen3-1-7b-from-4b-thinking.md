# SeanWang0027/official-rose-qwen3-1.7b-from-4b-thinking

## Resumen

El modelo `SeanWang0027/official-rose-qwen3-1.7b-from-4b-thinking` es un checkpoint de destilación online (denominado ROSE-online) que transfiere las capacidades de razonamiento del modelo teacher Qwen3-4B-Thinking-2507 a un modelo estudiante Qwen3-1.7B. Lo desarrolla SeanWang0027 como parte de una serie de experimentos sobre destilación por refuerzo con verificación (RLVE), y este repositorio contiene únicamente el checkpoint final (paso 140) de la configuración oficial adoptada desde el 16 de agosto de 2026.

El interés de este modelo radica en que demuestra una vía para mejorar el rendimiento en razonamiento de un modelo denso de 2.000 millones de parámetros sin necesidad de entrenar desde cero, usando un teacher más capaz. La arquitectura es la de Qwen3-1.7B (transformer denso), con 2.031.739.904 parámetros totales. El contexto de entrenamiento es de 5.120 tokens (prefijo de 4.096 + 1.024 tokens reescritos por el teacher), aunque en evaluación se ha probado con ventanas de hasta 18.432 tokens.

La relevancia actual del modelo es doble: por un lado, sirve como referencia reproducible para la comunidad de destilación online; por otro, ofrece un punto de partida para quienes necesiten un modelo pequeño con mejor razonamiento que el Qwen3-1.7B base, siempre que la licencia lo permita (dato no disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con ventana de 5.120; evaluado con CTX=18.432) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (hereda presumiblemente el multilingüismo de Qwen3, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B como estudiante y Qwen3-4B-Thinking-2507 como teacher. El proceso de destilación es de tipo online: el teacher reescribe los 1.024 tokens posteriores a un prefijo de 4.096 tokens (K=4096), y la función de pérdida (cross-entropy) se aplica exclusivamente sobre esos 1.024 tokens reescritos. El prefijo de 4.096 tokens generado por el estudiante tiene `response_mask=0`, por lo que no recibe gradiente en ningún paso. No se utiliza término de KL (`use_kl_loss=False`), lo que convierte el entrenamiento en una vía puramente de cross-entropy sobre la continuación del teacher.

Los hiperparámetros oficiales son: temperatura 1.0, top_p 1.0, top_k -1, teacher_temperature 1.0, n (rollout) 4, train_batch_size 64, ppo_mini_batch_size 64, learning rate 1e-5 con scheduler constante y warmup 0, betas [0.9, 0.999]. El entrenamiento consta de 140 pasos (equivalente a un epoch completo sobre 9.000 muestras) y solo se guarda el checkpoint final. El autor indica que esta configuración oficial no supera a la configuración anterior (temperatura 0.7, top_p 0.9, n=2, batch 128) en el benchmark propio, un dato relevante para quien quiera reproducir o mejorar el método.

## Capacidades

- Razonamiento: el modelo muestra una mejora significativa en el benchmark RLVE de 180 problemas frente al Qwen3-1.7B sin entrenar (pass@8 de 0,1778 frente a 0,1111).
- Generación de texto: al estar basado en Qwen3-1.7B, conserva las capacidades generales de generación de lenguaje del modelo base.
- Código y matemáticas: no hay benchmarks específicos publicados en la información disponible, pero al ser una destilación de un modelo Thinking, es razonable esperar un comportamiento competente en tareas de razonamiento simbólico, aunque no está verificado.
- Multilingüismo: no se especifica; el modelo base Qwen3 es multilingüe, pero este checkpoint no documenta idiomas soportados.
- Tool calling y agentes: no se menciona soporte para function calling ni uso como agente en la model card.
- Modo thinking: al derivar de Qwen3-Thinking, el modelo puede generar cadenas de razonamiento, pero no se documenta un modo explícito de activación.

## Casos de uso

- Razonamiento matemático en entornos con recursos limitados: con 2.000 millones de parámetros, el modelo puede ejecutarse en GPUs de consumo (p. ej., RTX 3060 con 12 GB) y ofrece una mejora del 60 % en pass@8 sobre el base en el benchmark RLVE, lo que lo hace adecuado para tutorías automáticas o resolución de problemas de nivel medio.
- Generación de código en dispositivos edge: aunque no hay benchmarks de código, la base Qwen3-1.7B es capaz de generar fragmentos de código; la destilación podría mejorar la corrección lógica en tareas de programación sencillas, siempre que se valide con pruebas propias.
- Asistentes conversacionales con razonamiento: el modelo puede mantener diálogos multi-turno y razonar sobre preguntas complejas, útil para chatbots de soporte técnico o educativo en despliegues con poca VRAM.
- Prototipado rápido de pipelines de razonamiento: al ser un checkpoint pequeño y reproducible, sirve para experimentar con técnicas de destilación o para validar hipótesis antes de escalar a modelos mayores.
- Inferencia en CPU o GPU integrada: con cuantización a 4 bits (no publicada, pero posible a partir de safetensors), el modelo podría ejecutarse en laptops o dispositivos con 8 GB de RAM, habilitando razonamiento offline.
- Investigación en destilación online: el repositorio incluye scripts de reproducción, por lo que es útil como referencia para estudiar el efecto de la temperatura, el número de rollouts y el tamaño de batch en la calidad de la destilación.

## Benchmarks y rendimiento

La model card reporta resultados en un benchmark propio denominado RLVE (180 problemas, métrica de 16k, con CTX=18.432, MAX_NEW=16.384, N=8, TEMP=0.7, TOP_P=0.9, TOP_K=-1). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Configuracion | avg@8 | pass@4 | pass@8 | Problemas resueltos |
|---|---|---|---|---|
| Qwen3-1.7B base (sin entrenar) | 0,0333 | 0,0774 | 0,1111 | 20 |
| **Este modelo (ROSE official)** | 0,0701 | 0,1332 | 0,1778 | 32 |
| OPD official (lr 1e-6) | 0,0486 | 0,1150 | 0,1611 | 29 |
| ROSE official (lr 1e-5) | 0,0701 | 0,1332 | 0,1778 | 32 |
| OPD con parametros antiguos (lr 1e-5, t0.7, n2, bs128) | 0,0792 | 0,1463 | 0,2056 | 37 |
| ROSE online con parametros antiguos (K4096+t1024, s20) | 0,0708 | 0,1454 | 0,1833 | 33 |
| ROSE online con parametros antiguos (K1024+t4096, s70) | 0,0646 | 0,1312 | 0,1833 | 33 |

El autor advierte que la comparación entre OPD y ROSE no es un experimento de variable única, porque las tasas de aprendizaje difieren (1e-6 para OPD, 1e-5 para ROSE). Además, señala que la configuración oficial no mejora los resultados de la configuración anterior, lo que sugiere que los hiperparámetros elegidos no son óptimos para este tipo de destilación.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 4,1 GB (2.031.739.904 parámetros × 2 bytes). Con cuantización a 8 bits, ~2 GB; a 4 bits, ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en FP16 (p. ej., RTX 2060, RTX 3060, RTX 4060). Para cuantización a 4 bits, bastan 2 GB (p. ej., GTX 1650, Apple Silicon con 8 GB unificados).
- Compatibilidad con GPUs de consumo: sí, es un modelo pequeño que cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: al ser safetensors estándar, puede cargarse con vLLM, llama.cpp (tras conversión a GGUF), Ollama (si se convierte), TGI o directamente con Transformers de Hugging Face.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa, un modelo de 2B en una RTX 4090 puede generar entre 50 y 100 tokens por segundo en FP16, pero estos valores son estimaciones y no datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento RLVE (pass@8) | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (ROSE official)** | 2,03B | No disponible (entrenado 5.120) | No disponible | 0,1778 | Hugging Face |
| Qwen3-1.7B base | 1,7B (aprox.) | 32K (segun documentacion de Qwen3) | Apache 2.0 | 0,1111 | Hugging Face, Ollama |
| Qwen3-4B-Thinking-2507 | 4B | 32K (segun documentacion de Qwen3) | Apache 2.0 | No evaluado en RLVE | Hugging Face, Ollama |
| official-opd-qwen3-1.7b-from-4b-thinking | 2,03B (presumiblemente) | No disponible | No disponible | 0,1611 (con lr 1e-6) | Hugging Face |

La comparativa muestra que la destilación ROSE mejora el rendimiento del base en el benchmark propio, pero no alcanza los resultados de la configuración antigua de OPD con lr 1e-5 (0,2056). El teacher (Qwen3-4B) no se ha evaluado en este benchmark, por lo que no se puede cuantificar la brecha con el modelo grande.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es utilizable comercialmente. Hasta que el autor aclare la licencia, se recomienda no usarlo en producción sin consultar.
- Contexto limitado: el entrenamiento se realizó con una ventana de 5.120 tokens. Aunque se ha evaluado con CTX=18.432, no hay garantía de que el modelo mantenga coherencia en contextos largos más allá de lo entrenado.
- Sesgos del teacher: al ser una destilación de Qwen3-4B-Thinking, el modelo puede heredar sesgos o errores sistemáticos del teacher, especialmente en dominios donde el teacher falla.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento donde la cadena de pensamiento no es verificada.
- Sin benchmarks estándar: no hay resultados en MMLU, HumanEval, GSM8K u otros conjuntos de referencia, lo que dificulta comparar con otros modelos de forma objetiva.
- Reproducibilidad condicionada: el autor advierte que la configuración oficial no supera a la anterior, lo que sugiere que los hiperparámetros elegidos no son óptimos; quien quiera usar este checkpoint como base debe ser consciente de que podría obtener mejores resultados con otros ajustes.
- Sin soporte documentado para tool calling ni agentes: no se menciona en la model card, por lo que no se recomienda su uso en pipelines que requieran invocación de funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeanWang0027/official-rose-qwen3-1.7b-from-4b-thinking
- Modelo OPD del mismo autor: https://huggingface.co/SeanWang0027/official-opd-qwen3-1.7b-from-4b-thinking
- Qwen3-1.7B original: https://huggingface.co/Qwen/Qwen3-1.7B
- Blog de Qwen3 (Think Deeper, Act Faster): https://qwen.ai/blog?id=qwen3
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Scripts de destilación (mencionados en la model card): https://huggingface.co/SeanWang0027/rlve-distill-scripts
