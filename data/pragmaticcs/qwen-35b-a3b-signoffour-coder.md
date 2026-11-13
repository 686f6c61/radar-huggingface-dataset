# pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder

## Resumen

Qwen-35B-A3B-SignOfFour-Coder es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por el usuario pragmaticcs en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusión (merge) de cuatro modelos derivados de la arquitectura Qwen 35B-A3B: Jackrong/Qwopus3.6-35B-A3B-Coder (ancla base), ornith-ai/Ornith-1.5-35B-A3B, Kwaipilot/KAT-Coder-V2.5-Dev y Qwen/Qwen-AgentWorld-35B-A3B. El objetivo declarado es consolidar capacidades de ingeniería de software, síntesis de código y ejecución de herramientas agénticas en un único checkpoint.

La arquitectura subyacente es un transformer MoE con 35 107 181 936 parámetros totales y aproximadamente 3B de parámetros activos por token, 40 capas de decodificador, 256 expertos enrutados y un experto compartido. Incorpora atención híbrida lineal Gated DeltaNet. Según la model card, se eliminaron los pesos de visión multimodal y las cabezas de Multi-Token Prediction (MTP) para reducir el consumo de VRAM y maximizar el throughput en tareas de código.

El modelo es relevante porque demuestra una técnica de fusión relativamente novedosa (DARE-TIES con modulación sinusoidal por profundidad) aplicada a un MoE grande, con licencia Apache 2.0 y pesos en safetensors compatibles con transformers. Su nicho es claro: cargas de trabajo de generación de código y agentes, no uso multimodal ni propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida lineal Gated DeltaNet (model_type: qwen3_5_moe) |
| Parametros totales | 35 107 181 936 |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos de la model card: 40 capas de decodificador, 256 expertos enrutados, 1 experto compartido, algoritmo de fusión DARE-TIES con escalado sinusoidal por profundidad.

## Arquitectura y entrenamiento

El modelo no se entrena; se construye mediante fusión de pesos. La base es Jackrong/Qwopus3.6-35B-A3B-Coder (peso α = 1.00) y sobre ella se integran vectores de tarea de tres donantes: ornith-ai/Ornith-1.5-35B-A3B (α = 0.30), Kwaipilot/KAT-Coder-V2.5-Dev (α = 0.25) y Qwen/Qwen-AgentWorld-35B-A3B (α = 0.20). Para cada donante se calcula el delta respecto a la base y se aplica poda DARE con máscara de Bernoulli y reescalado por la inversa de la densidad de retención. Después se aplica elección de signo TIES: se calcula un signo de consenso ponderado y se descartan las actualizaciones en conflicto antes de promediar.

La reconstrucción final incorpora un factor de escala dependiente de la capa, λ(l) = β · (0.5 + 0.5 · sin(π · l / 39)), de modo que las proyecciones de entrada y salida quedan más próximas a la base y la transferencia de tarea se concentra en las capas intermedias (l entre 12 y 28). La política es estratificada por grupos de parámetros: embeddings, LM head, normas, biases y estado recurrente DeltaNet se mantienen lineales con escala 1.00; el router MoE también se protege con política lineal; el experto compartido usa DARE-TIES con densidad 0.70 y β 0.60; las proyecciones de atención usan densidad 0.75 y β 0.60; y los 256 expertos enrutados usan densidad 0.65 y β 0.55. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, ya que el proceso es exclusivamente de fusión.

## Capacidades

- Generación de texto y código: el modelo está orientado explícitamente a síntesis de código e ingeniería de software.
- Razonamiento agéntico: incorpora capacidades de ejecución de herramientas procedentes del donante Qwen-AgentWorld.
- Tool calling y function calling: la model card menciona ejecución agéntica de herramientas como objetivo central de la fusión.
- Razonamiento multi-paso: los tags incluyen "agentic" y "reasoning", aunque no se detallan modos de pensamiento explícitos.
- Multilingüismo limitado: solo inglés y chino según los metadatos.
- Sin visión: los pesos multimodales fueron eliminados deliberadamente.
- Sin Multi-Token Prediction: las cabezas MTP también se eliminaron para reducir VRAM.
- Conversación multi-turno: el tag "conversational" está presente y se documenta una plantilla de chat propia.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar o generar tests, aprovechando su especialización en síntesis de código y su ventana de contexto (no documentada, por lo que debe validarse empíricamente).
- Asistentes de programación en IDE: con 3B de parámetros activos por token, el coste de inferencia por token es bajo en comparación con un modelo denso de 35B, lo que lo hace adecuado para autocompletado interactivo con latencia contenida.
- Agentes autónomos de resolución de incidencias: la fusión incorpora capacidades de tool calling y ejecución agéntica, útil para agentes que consultan APIs, leen logs y proponen parches.
- Migración y modernización de código legacy: la combinación de un donante especializado en código (KAT-Coder) con la base permite tareas de traducción entre lenguajes y actualización de dependencias.
- Generación de documentación técnica: a partir de código fuente y diffs, el modelo puede producir docstrings y documentación de API en inglés o chino.
- Automatización de revisión de código: integrado como servicio de inferencia, puede señalar problemas y sugerir cambios en pull requests, con la ventaja de una licencia Apache 2.0 sin restricciones de uso comercial.
- Despliegue en infraestructura propia: al publicarse en safetensors y ser compatible con transformers, puede servirse con vLLM o TGI en GPUs de centro de datos, aunque el tamaño de 35B totales exige planificación de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo MoE de 35B totales requiere almacenar todos los pesos; en BF16 serían aproximadamente 70 GB, en FP8 unos 35 GB y en cuantizaciones de 4 bits unos 18-20 GB, aunque el autor no publica variantes cuantizadas ni cifras verificadas.
- GPU recomendadas: no documentadas por el autor. Por tamaño, un despliegue en BF16 requiere GPUs de 80 GB (A100, H100) o múltiples GPUs; en formatos de menor precisión podría caber en una RTX 4090 de 24 GB, pero esto no está confirmado.
- ¿Cabe en GPU de consumo? No confirmado. La eliminación de pesos de visión y cabezas MTP sugiere que el autor buscaba reducir huella, pero no se aportan medidas.
- Opciones de despliegue: transformers es la librería declarada. vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura híbrida DeltaNet; la compatibilidad debe verificarse.
- Latencia y throughput: no disponibles. La arquitectura MoE con 3B activos debería ofrecer un throughput por token notablemente superior a un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-35B-A3B-SignOfFour-Coder | 35,1B | ~3B | no disponible | Apache 2.0 | Fusión DARE-TIES de 4 modelos, solo texto |
| Jackrong/Qwopus3.6-35B-A3B-Coder | no disponible | no disponible | no disponible | no disponible | Ancla base de la fusión |
| Kwaipilot/KAT-Coder-V2.5-Dev | no disponible | no disponible | no disponible | no disponible | Donante especializado en código |
| Qwen/Qwen-AgentWorld-35B-A3B | no disponible | no disponible | no disponible | no disponible | Donante orientado a agentes |

Los datos de los modelos comparables no están disponibles en la información proporcionada; la comparación se limita a su rol en la composición de la fusión.

## Limitaciones y advertencias

- Es una fusión de pesos, no un modelo entrenado: el comportamiento emergente de la combinación DARE-TIES no está validado con benchmarks publicados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: no debe asumirse una ventana larga sin pruebas.
- Sin capacidades multimodales: los pesos de visión fueron eliminados, por lo que no procesa imágenes.
- Sin cabezas MTP: no se beneficia de decodificación especulativa nativa de Multi-Token Prediction.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin evaluaciones publicadas no hay medida de su fiabilidad factual.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero los modelos base pueden tener condiciones adicionales que conviene revisar en sus respectivas model cards.
- La model card incluye promoción de un Patreon y de otros modelos del autor; no aporta datos de evaluación independientes.
- Compatibilidad de despliegue no confirmada con vLLM, llama.cpp u Ollama para la arquitectura híbrida DeltaNet.
- El repositorio ocupa 70,2 GB, lo que implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder
- Modelo base ancla: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder
- Donante: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Donante: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Donante: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Repositorio transformers: https://github.com/huggingface/transformers
- Patreon del autor: https://patreon.com/pragmaticcs
- Otro modelo del autor: https://huggingface.co/pragmaticcs/MiMo-HERO-UIUX-Designer-9B
