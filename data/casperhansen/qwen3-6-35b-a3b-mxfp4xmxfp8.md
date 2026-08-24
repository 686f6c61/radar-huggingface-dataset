# casperhansen/Qwen3.6-35B-A3B-MXFP4xMXFP8

## Resumen

El modelo `casperhansen/Qwen3.6-35B-A3B-MXFP4xMXFP8` es una cuantización híbrida MXFP4/MXFP8 del modelo base `Qwen/Qwen3.6-35B-A3B`, un mixture-of-experts (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos. El autor, casperhansen (creador de AutoAWQ), ha producido esta versión con fines de desarrollo utilizando llm-compressor en modo PTQ (post-training quantization) sin calibración, mediante redondeo al más cercano (RTN). El objetivo es reducir la huella de memoria del modelo para facilitar su despliegue en hardware con VRAM limitada, manteniendo la mayor parte de la precisión en los componentes críticos.

La cuantización aplica pesos en fp4 E2M1 (4 bits) y activaciones en fp8 E4M3 (8 bits), con escalas estáticas para pesos y dinámicas para activaciones. Se excluyen de la cuantización ciertos módulos sensibles como embeddings, lm_head, la torre de visión, el cabezal MTP, las proyecciones de atención lineal y los routers del MoE, que se mantienen en bf16. El repositorio ocupa 22.5 GB y está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Este modelo es relevante porque demuestra una aproximación práctica a la cuantización de modelos MoE grandes con formatos de baja precisión (MXFP4), y su integración con vLLM a través del backend compressed-tensors. Aunque no se han publicado benchmarks específicos para esta cuantización, el modelo base Qwen3.6-35B-A3B destaca por su rendimiento en tareas de codificación agéntica, superando a su predecesor Qwen3.5-35B-A3B según el blog oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000.000.000 (3B, segun el blog de Qwen) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos, fp4 E2M1) y MXFP8 (activaciones, fp8 E4M3) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE con 35B parámetros totales y 3B activos, diseñado específicamente para tareas de codificación agéntica y razonamiento. La cuantización aquí descrita no implica ningún entrenamiento adicional: se trata de una PTQ model-free realizada con llm-compressor 0.13.0, que aplica redondeo al más cercano (RTN) sobre los pesos sin usar datos de calibración ni forward del modelo. El esquema de cuantización es simétrico por grupos de 32 elementos, con escalas E8M0 (uint8) estáticas para pesos y dinámicas para activaciones. Los tensores de expertos MoE fusionados en 3D se dividen y cuantizan por experto individualmente.

Se mantienen en bf16 los siguientes componentes: `lm_head`, `embed_tokens`, la torre de visión (`model.visual`), el cabezal MTP (`mtp`), las convoluciones de atención lineal (`conv1d`), las proyecciones de la puerta delta-rule (`linear_attn.in_proj_a` y `in_proj_b`), los routers del MoE (`mlp.gate`) y `shared_expert_gate`. Esta selección busca preservar la precisión en las partes más sensibles del modelo, como los mecanismos de enrutamiento y las capas de atención, mientras se reduce drásticamente el peso de los expertos.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento y generación, aunque no se han publicado métricas específicas para esta cuantización.
- Codificación agéntica: según el blog oficial de Qwen, Qwen3.6-35B-A3B ofrece un rendimiento destacado en tareas de codificación agéntica, superando a Qwen3.5-35B-A3B. Esto incluye generación de código, refactorización y resolución de issues.
- Soporte de tool calling y agentes: no se especifica en la información disponible, pero es una capacidad habitual en la familia Qwen3.6. Se recomienda verificar con el modelo base.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales: el modelo base incluye una torre de visión (según los componentes ignorados en la cuantización), lo que sugiere capacidades multimodales, aunque no se detallan en esta ficha.

## Casos de uso

- Inferencia local en GPU de consumo: con 22.5 GB de repo y pesos en 4 bits, el modelo puede ejecutarse en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) usando vLLM con backend compressed-tensors, permitiendo a desarrolladores individuales probar un MoE de 35B sin necesidad de hardware de datacenter.
- Prototipado de aplicaciones de codificación asistida: al ser una cuantización de desarrollo, es adecuada para validar pipelines de generación de código, autocompletado y refactorización en entornos de prueba antes de pasar a una versión sin cuantizar.
- Investigación sobre cuantización MXFP: este checkpoint sirve como referencia para estudiar el impacto de MXFP4/MXFP8 en modelos MoE, especialmente en la preservación de los routers y capas de atención en bf16.
- Despliegue en entornos con restricciones de memoria: en servidores con VRAM compartida o limitada (por ejemplo, múltiples modelos en una sola GPU), esta cuantización permite alojar un modelo de 35B con un presupuesto de memoria reducido.
- Evaluación de calidad de cuantización sin calibración: al ser RTN puro, es útil para comparar con otras cuantizaciones (como INT4-RTN del mismo autor) y medir la degradación relativa en tareas específicas.
- Integración en pipelines de CI/CD para generación de código: gracias a su tamaño reducido, puede integrarse en entornos de integración continua para pruebas automatizadas de generación de código, aunque se debe validar la calidad antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. Se recomienda consultar los benchmarks del modelo base Qwen3.6-35B-A3B en el blog oficial de Qwen para una referencia de rendimiento sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20-22 GB con cuantización MXFP4 (22.5 GB de repo, incluyendo overhead de safetensors y metadatos). Con activaciones en fp8, el consumo real puede variar según el batch size y la longitud de secuencia.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40 GB o 80 GB), H100 (80 GB). En GPUs con 16 GB (RTX 4080, RTX 3080 Ti) podría ser posible con secuencias cortas y batch reducido, pero no está garantizado.
- Si cabe en consumer GPU: sí, en GPUs de 24 GB VRAM es viable. En GPUs de 16 GB es arriesgado y dependerá del contexto y batch.
- Opciones de despliegue: vLLM (GPU) con backend compressed-tensors es la vía principal. También existe un plugin experimental `vllm_runtime` de dram-computing para ejecución en memoria de computación (CIM), aunque es un proyecto de investigación. No se menciona soporte para llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponible. Al ser un MoE con solo 3B activos, se espera una latencia menor que un modelo denso de 35B, pero no hay datos concretos para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | bf16 | no disponible | Apache 2.0 | HuggingFace |
| casperhansen/Qwen3.6-35B-A3B-MXFP4xMXFP8 | 35B totales, 3B activos | MXFP4/MXFP8 | no disponible | Apache 2.0 | HuggingFace |
| casperhansen/Qwen3.6-35B-A3B-INT4-RTN | 35B totales, 3B activos | INT4 RTN | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-35B-A3B (predecesor) | 35B totales, 3B activos | bf16 | no disponible | Apache 2.0 | HuggingFace |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia entre MXFP4xMXFP8 e INT4-RTN radica en el esquema de cuantización: MXFP4 usa escalas por grupo de 32 elementos y mantiene ciertos módulos en bf16, mientras que INT4-RTN es una cuantización entera más convencional. No hay información sobre cuál ofrece mejor calidad.

## Limitaciones y advertencias

- Cuantización de desarrollo: la model card indica explícitamente que se produjo para fines de desarrollo, sin calibración ni forward del modelo. Esto puede resultar en una degradación de calidad significativa en comparación con el modelo base, especialmente en tareas que dependen de la precisión numérica.
- Sin benchmarks publicados: no hay métricas de rendimiento para esta cuantización, por lo que es imposible evaluar su calidad objetivamente. Se recomienda probar en el caso de uso concreto antes de considerar producción.
- Riesgo de alucinación y sesgos: no se han evaluado sesgos específicos para esta versión. El modelo base puede heredar sesgos de sus datos de entrenamiento, pero no hay información disponible.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada. Si el modelo base tiene un contexto largo (por ejemplo, 256K como Qwen3.5), la cuantización podría afectar a la atención en secuencias largas, pero no hay datos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. No hay restricciones adicionales conocidas.
- Soporte de software limitado: la integración con vLLM es a través de compressed-tensors, que puede no estar disponible en todas las versiones. El plugin dram-computing es experimental y no está listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/casperhansen/Qwen3.6-35B-A3B-MXFP4xMXFP8
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Variante INT4-RTN del mismo autor: https://huggingface.co/casperhansen/Qwen3.6-35B-A3B-INT4-RTN
- Página de Ollama para qwen3.6:35b-a3b: https://ollama.com/library/qwen3.6:35b-a3b
