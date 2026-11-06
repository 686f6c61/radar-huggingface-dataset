# marwanaymenn/smollm2-gsm8k-math-sft

## Resumen

`smollm2-gsm8k-math-sft` es un ajuste fino supervisado (SFT) del modelo compacto SmolLM2-360M-Instruct, desarrollado por el usuario de Hugging Face `marwanaymenn`. El objetivo declarado por el nombre del repositorio es especializar el modelo base en la resolución de problemas matemáticos de tipo GSM8K, un conjunto de problemas aritméticos de varios pasos. Se trata, por tanto, de un modelo derivado orientado a un dominio concreto y no de un modelo fundacional nuevo.

El modelo base, SmolLM2-360M-Instruct, forma parte de la familia SmolLM2 de Hugging Face, una serie de modelos compactos (135M, 360M y 1.7B parámetros) disenados para ejecución en dispositivo. El entrenamiento de este ajuste se ha realizado con TRL (SFTTrainer), según los metadatos de la model card, y el repositorio se distribuye en formato `safetensors` con integración en `transformers`.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de especialización de un modelo muy pequeno en una tarea de razonamiento aritmético, y resulta útil para quienes quieran evaluar si un modelo de 360M parámetros puede abordar GSM8K tras un SFT específico. No obstante, la información pública disponible es muy escasa y no se han publicado resultados de evaluación ni detalles del conjunto de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 360M (aproximado, según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM2 soporta hasta 8192 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base SmolLM2-360M-Instruct: un transformer decoder-only de 360M parámetros, perteneciente a la familia SmolLM2 de Hugging Face, que en su variante de 1.7B fue entrenada sobre aproximadamente 11 billones de tokens con una mezcla de texto web, datos de matemáticas, código e instrucciones. No se dispone de detalles específicos sobre la arquitectura interna (número de capas, dimensión oculta, cabezas de atención) en la información proporcionada.

El ajuste se ha realizado mediante SFT con TRL 1.17.1, Transformers 5.22.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el número de ejemplos de entrenamiento, la composición del dataset (aunque el nombre sugiere GSM8K), la duración del entrenamiento, hiperparámetros ni si se aplicaron técnicas adicionales como DPO o RLHF. Tampoco se documentan innovaciones técnicas propias de este ajuste.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de instrucción del modelo base SmolLM2-360M-Instruct.
- Razonamiento aritmético de varios pasos: el ajuste está orientado explícitamente a problemas de tipo GSM8K, aunque no se han publicado métricas que confirmen la mejora.
- Formato de chat: la model card muestra un ejemplo de uso con `pipeline` y mensajes con rol `user`, lo que indica soporte del formato conversacional del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (el modelo base no está documentado para ello en esta ficha).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación de especialización en matemáticas: usar el modelo para resolver problemas aritméticos de varios pasos y comparar con el modelo base SmolLM2-360M-Instruct para medir el efecto real del SFT sobre GSM8K.
- Prototipado de tutores matemáticos en dispositivo: al ser un modelo de 360M parámetros, puede ejecutarse en CPU o GPU de gama baja para generar explicaciones paso a paso en entornos educativos sin conexión.
- Generación de datos sintéticos de razonamiento: emplear el modelo para producir cadenas de razonamiento aritmético que sirvan como datos de entrenamiento o de aumento para modelos mayores.
- Pruebas de pipelines de fine-tuning con TRL: sirve como caso de referencia para validar flujos de SFT con TRL, Transformers y safetensors en modelos pequenos.
- Investigación sobre límites de los modelos compactos: analizar hasta qué punto un modelo de 360M parámetros puede internalizar procedimientos aritméticos tras un SFT específico.
- Despliegue en entornos con restricciones de memoria: su tamano reducido permite integraciones en aplicaciones locales o embebidas donde no cabe un modelo mayor, siempre que la tarea sea acotada a matemáticas básicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7-0,8 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,4 GB; en 4 bits, en torno a 0,2-0,3 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter como A100 o H100 (ampliamente sobredimensionadas para este modelo).
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` (pipeline), y previsiblemente llama.cpp/Ollama y vLLM tras conversión a los formatos correspondientes (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smollm2-gsm8k-math-sft | 360M | no disponible | no disponible | Hugging Face (0 descargas) |
| SmolLM2-360M-Instruct | 360M | hasta 8192 tokens (según familia SmolLM2) | Apache-2.0 (modelo base) | Hugging Face, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1.7B | hasta 8192 tokens (según familia SmolLM2) | Apache-2.0 (modelo base) | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0.5B | 32768 tokens (según documentación de Qwen) | Apache-2.0 | Hugging Face |

La comparación directa de rendimiento no es posible porque el autor no ha publicado métricas. Frente al modelo base, la única diferencia documentada es el SFT sobre datos de matemáticas; frente a alternativas mayores como SmolLM2-1.7B o Qwen2.5-0.5B, este ajuste parte de una base más pequena y con menos validación pública.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas de GSM8K ni de ningún otro benchmark, por lo que no se puede confirmar que el ajuste mejore al modelo base.
- Licencia no especificada: la model card indica "license" sin concretar, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de usarlo en producción.
- Idiomas no documentados: no se puede asumir soporte multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación: los modelos de 360M parámetros tienden a producir razonamientos aritméticos incorrectos o incoherentes, especialmente en problemas de varios pasos.
- Sesgos heredados: al derivar de SmolLM2, puede arrastrar sesgos presentes en los datos de entrenamiento del modelo base, no documentados en esta ficha.
- Contexto no confirmado: aunque la familia SmolLM2 soporta contextos largos, no se ha verificado la longitud efectiva de este ajuste.
- Madurez del repositorio: creado y actualizado el mismo día, con 0 descargas y 0 likes; no hay evidencia de uso o validación por parte de la comunidad.
- Sin garantías de reproducibilidad: no se documentan hiperparámetros, dataset ni semillas, lo que dificulta replicar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marwanaymenn/smollm2-gsm8k-math-sft
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Colección SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Paper SmolLM2 (arXiv:2502.02737): https://arxiv.org/abs/2502.02737
- Repositorio TRL: https://github.com/huggingface/trl
