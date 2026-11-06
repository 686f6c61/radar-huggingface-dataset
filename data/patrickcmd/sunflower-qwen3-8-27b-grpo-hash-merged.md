# patrickcmd/sunflower-qwen3.8-27b-grpo-hash-merged

## Resumen

Sunflower Qwen3.8-27B GRPO Hash Merged es un checkpoint de la familia Qwen3.5 publicado por el usuario patrickcmd en Hugging Face. El identificador del repositorio sugiere un proceso de ajuste fino con GRPO (Group Relative Policy Optimization, la técnica de RL usada en DeepSeek-R1) sobre una base Qwen3.5 de aproximadamente 27 000 millones de parámetros, seguido de una fusión de pesos ("merged") y algún tipo de variante etiquetada como "hash". El modelo se distribuye en formato safetensors y está pensado para generación de texto conversacional mediante la librería transformers.

El dato más fiable disponible es el recuento real de parámetros a partir de los tensores safetensors: 26 895 998 464 parámetros (unos 26,9 mil millones), lo que encaja con la denominación comercial "27B". El repositorio ocupa 53,8 GB, coherente con pesos en bf16/fp16 para ese número de parámetros. La arquitectura declarada en los tags es `qwen3_5_text`, lo que indica que se trata de la variante exclusivamente de texto de la familia Qwen3.5, no de una variante multimodal.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card es la plantilla autogenerada de Hugging Face sin ningún campo completado, no hay información sobre licencia, idiomas, datos de entrenamiento, hiperparámetros ni evaluación, y el repositorio no registra descargas ni interacciones. Se trata, por tanto, de un checkpoint de investigación de procedencia y calidad no verificadas, útil únicamente como objeto de estudio y no recomendable para producción sin una evaluación propia exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 26 895 998 464 (~26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors es cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 53,8 GB |
| Pipeline declarado | text-generation |
| Compatibilidad | `endpoints_compatible` (tag) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3.5, según el tag `qwen3_5_text` que figura en los metadatos del repositorio. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (full, sliding window o híbrida), vocabulario ni función de activación. Tampoco se documenta si emplea atención lineal o algún esquema de decodificación especulativa.

El nombre del repositorio sugiere un pipeline de ajuste con GRPO seguido de una fusión de pesos. GRPO es una variante de optimización de política relativa a grupos que evita el modelo crítico separado y que se popularizó con los modelos de razonamiento de DeepSeek. Sin embargo, no hay ninguna documentación que confirme la receta: no se especifican el dataset de preferencias, el número de pasos, la tasa de aprendizaje, la composición del dataset ni si hubo una fase previa de SFT. El sufijo "hash" en el nombre no está explicado en ninguna parte y podría referirse a una estrategia de fusión con hashing de pesos, a un identificador de experimento o a otra cosa; se desconoce.

## Capacidades

- Generación de texto conversacional en formato chat, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Razonamiento y matemáticas: presumiblemente heredadas de la base Qwen3.5 y del ajuste con GRPO, aunque no hay evaluación que lo confirme.
- Generación de código: esperable en la familia Qwen, pero no verificado para este checkpoint.
- Tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia publicada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible. El tag `qwen3_5_text` indica que es la variante solo texto, por lo que no cabría esperar visión.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en Hugging Face Inference Endpoints con la librería transformers.

## Casos de uso

- Evaluación comparativa de técnicas de RL: el checkpoint permite reproducir experimentos de GRPO sobre una base Qwen3.5 de 27B y comparar la fusión de pesos frente al modelo base, siempre que se disponga de la receta original (no publicada).
- Investigación sobre fusión de modelos: el sufijo "merged" lo convierte en un candidato para estudiar cómo afecta la fusión de pesos tras RL a las curvas de pérdida y a la calidad de generación.
- Generación de texto conversacional en prototipos internos: con 26,9B de parámetros y formato transformers estándar, puede cargarse con `AutoModelForCausalLM` para pruebas de diálogo multi-turno, asumiendo que la ventana de contexto debe medirse empíricamente.
- Fine-tuning posterior supervisado: al ser un checkpoint completo en safetensors, sirve como punto de partida para SFT con datasets propios en dominios verticales, con la advertencia de que su licencia es desconocida.
- Destilación hacia modelos más pequeños: un modelo de 27B sin evaluar puede usarse como profesor en pipelines de destilación, aunque la falta de benchmarks hace arriesgado asumir su calidad.
- Despliegue en Inference Endpoints: el tag `endpoints_compatible` permite subirlo a Hugging Face Endpoints para pruebas de latencia y throughput antes de comprometerse con infraestructura propia.
- Estudio de sesgos y alineación: útil para analizar cómo un ajuste GRPO no documentado afecta a la verbosidad, la tasa de rechazo y la estabilidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 54 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan 60-70 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: unos 27 GB de pesos, más overhead; encaja en una RTX 4090 de 24 GB solo con cuantización de 4 bits o con offloading parcial.
- VRAM estimada en cuantización de 4 bits (GGUF/AWQ/GPTQ): unos 14-16 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto corto.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o dos A100 40 GB con tensor parallelism.
- Consumer GPU: no cabe en bf16 en ninguna consumer GPU actual; en 4 bits sí cabe en RTX 4090, RTX 3090 y, con contexto muy limitado, en GPUs de 16 GB.
- Opciones de despliegue: transformers (nativo), vLLM y TGI (previa conversión o carga directa si la arquitectura está soportada), llama.cpp/Ollama tras conversión a GGUF, y Hugging Face Inference Endpoints por el tag `endpoints_compatible`.
- Latencia y throughput: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Sunflower Qwen3.8-27B GRPO Hash Merged | ~26,9 B | no disponible | no disponible | Hugging Face, 0 descargas | no disponible |
| Qwen3.5 base (variante de texto) | ~27 B (según familia) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face oficial | no disponible en esta ficha |
| Gemma 3 27B | ~27 B | 128 K (según documentación oficial de Google) | Gemma Terms of Use | Hugging Face, ampliamente usado | publicados por Google |
| Mistral Small 3 (24B) | ~24 B | 32 K (según documentación oficial de Mistral) | Apache 2.0 | Hugging Face, ampliamente usado | publicados por Mistral |

La comparativa es orientativa: los datos de los modelos alternativos provienen de sus respectivas documentaciones oficiales y no se han verificado en esta ficha. Para el modelo objeto de esta ficha no hay datos de contexto, licencia ni rendimiento, lo que impide una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de Hugging Face sin ningún campo rellenado: no hay información sobre autoría real, datos de entrenamiento, evaluación ni uso previsto.
- Licencia desconocida: no se puede asumir uso comercial permitido. Cualquier despliegue en producción requiere aclarar la licencia con el autor y verificar la licencia de la base Qwen3.5 subyacente.
- Sin benchmarks ni evaluaciones: no hay evidencia de que el ajuste GRPO haya mejorado o degradado las capacidades de la base. El riesgo de regresión es real y no cuantificado.
- Riesgo de alucinación: no evaluado; en modelos de razonamiento ajustados con RL es habitual observar respuestas seguras pero incorrectas en dominios factuales.
- Sesgos: no documentados ni evaluados.
- Idiomas: no declarados; no se puede asumir un rendimiento multilingüe equilibrado.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos sin medición empírica previa.
- Procedencia: repositorio con 0 descargas y 0 likes, creado y actualizado con un minuto de diferencia, lo que sugiere una subida automatizada sin revisión. Tratar como artefacto de investigación no auditado.
- El sufijo "hash" no está explicado: podría indicar una modificación no estándar de los pesos que afecte a la reproducibilidad.
- El tag `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre impacto ambiental de ML, citado en la plantilla de la model card; no es una referencia técnica del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/patrickcmd/sunflower-qwen3.8-27b-grpo-hash-merged
- Paper de GRPO (DeepSeekMath, referencia general de la técnica): https://arxiv.org/abs/2402.03300
- Paper de DeepSeek-R1 (uso de GRPO en razonamiento): https://arxiv.org/abs/2501.12948
- Paper citado en la plantilla de la model card (Lacoste et al., impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
