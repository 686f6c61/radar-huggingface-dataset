# GGUFGuy/useless-parameters-2

## Resumen

useless-parameters-2 es un modelo de lenguaje decoder-only de 114.838.272 parámetros entrenado desde cero por el usuario GGUFGuy mediante el Space HyperDex Trainer. Se basa en la arquitectura `LlamaForCausalLM` (transformer decoder-only estándar con MLP SiLU, RMSNorm, embeddings posicionales rotatorios, grouped-query attention y embeddings atados) escalada a la baja en anchura y profundidad para ajustarse al presupuesto de parámetros. El modelo se ha preentrenado sobre el dataset fineweb-edu con un vocabulario BPE personalizado de 2.048 tokens.

El modelo es, según su propia model card, un artefacto de investigación a pequeña escala: no está pensado para uso como asistente ni para producir contenido factual. Su propósito declarado es hacer tangible y observable el proceso de preentrenar un transformer desde cero. Con solo 524.288 tokens vistos en un único paso de entrenamiento y una pérdida final de 8,2887 (perplejidad de 3978,7), el modelo aprende formas de palabras, colocaciones comunes y algo de sintaxis, pero no adquiere capacidades de razonamiento ni de generación fiable.

Es relevante ahora únicamente como ejemplo didáctico de pipeline de preentrenamiento reproducible en infraestructura modesta (57,6 minutos de tiempo de pared) y como referencia de lo que un presupuesto de cómputo mínimo produce en un transformer. No compite con modelos de producción ni se acerca a ellos en capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): MLP SiLU, RMSNorm, RoPE, grouped-query attention, embeddings atados, sin biases |
| Parametros totales | 114.838.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | odc-by (Open Data Commons Attribution License) |
| Formato de pesos | safetensors (librería transformers) |

Otros datos técnicos: hidden size 768, 12 capas, 12 cabezas de atención (12 cabezas KV), tamaño de FFN 3072, vocabulario de 2.048 tokens (BPE personalizado entrenado sobre fineweb-edu). Tamaño del repositorio: 0,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de la familia Llama, con las siguientes particularidades: MLP con activación SiLU, normalización RMSNorm, embeddings posicionales rotatorios (RoPE), grouped-query attention (en este caso con 12 cabezas KV, es decir, sin reducción respecto a las 12 cabezas de atención), embeddings de entrada y salida atados y ausencia de términos de bias. La anchura y profundidad se han reducido para encajar en el presupuesto de 114,8 millones de parámetros.

El entrenamiento se realizó desde cero sobre el dataset HuggingFaceFW/fineweb-edu con un vocabulario BPE personalizado de 2.048 tokens. Los datos de entrenamiento son extremadamente limitados: 524.288 tokens vistos en un único paso (1 step), con AdamW (betas 0,9 y 0,95, weight decay 0,1, gradient clipping 1,0) y un schedule de learning rate con warmup del 2 % y decaimiento coseno hasta el 10 % (pico 3e-04). La pérdida final fue de 8,2887 (perplejidad 3978,7) y el tiempo de pared de 57,6 minutos. No se documenta RLHF, DPO ni ninguna fase de alineación posterior; tampoco innovaciones técnicas destacables como decodificación especulativa o atención lineal. El modelo se entrenó con el Space HyperDex Trainer.

## Capacidades

- Generación de texto autoregresiva básica: produce secuencias de tokens coherentes a nivel de forma de palabra y colocaciones comunes, sin garantía de factualidad.
- Aprendizaje de formas de palabras y colocaciones frecuentes del inglés, según declara la model card.
- Sintaxis incipiente: la model card indica que aprende "un poco de sintaxis".
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo está entrenado únicamente en inglés.
- No dispone de modo thinking, visión, audio ni capacidades especiales.
- No es un asistente útil ni produce salida factual, según advertencia explícita del autor.

## Casos de uso

- Demostración educativa de preentrenamiento desde cero: el modelo sirve para ilustrar en un aula o tutorial cómo se entrena un transformer paso a paso, ya que su entrenamiento completo cabe en menos de una hora y el pipeline es reproducible con el HyperDex Trainer.
- Verificación de pipelines de entrenamiento: permite comprobar que un script de preentrenamiento, tokenizador y bucle de optimización funcionan de extremo a extremo antes de escalar a modelos mayores, gracias a su reducido coste computacional.
- Pruebas de integración con transformers: útil para validar la carga de un `LlamaForCausalLM` con vocabulario personalizado y embeddings atados en entornos de CI, sin consumir recursos significativos.
- Estudio de tokenizadores BPE pequeños: el vocabulario de 2.048 tokens entrenado sobre fineweb-edu permite analizar el comportamiento de un tokenizador de baja cardinalidad en tareas de segmentación.
- Referencia de línea base en experimentos de scaling laws: como punto de comparación de pérdida y perplejidad en el extremo inferior de la escala de cómputo (524.288 tokens, 1 paso).
- Generación de texto de relleno no factual en pruebas de interfaz: para validar el renderizado de salidas de un modelo generativo en una UI o demo, sin requerir contenido veraz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida final de entrenamiento (8,2887) y la perplejidad correspondiente (3978,7), que no constituyen benchmarks de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 114,8 millones de parámetros. En fp32 (aproximadamente 460 MB de pesos) requiere menos de 1 GB de VRAM; en fp16/bf16 (aproximadamente 230 MB) requiere menos de 0,5 GB; en cuantizaciones de 8 bits o 4 bits el consumo sería aún menor, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte de vLLM, llama.cpp u Ollama, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles. El contexto máximo de 512 tokens limita la longitud de generación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información sobre modelos comparables en la información proporcionada. Como referencia estructural, se puede contrastar con otros modelos pequeños de la familia Llama, pero no se aportan cifras de rendimiento que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| useless-parameters-2 | 114.838.272 | 512 | odc-by | Hugging Face (transformers, safetensors) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor advierte explícitamente de que es un artefacto de investigación a pequeña escala: no es un asistente útil y su salida no es factual.
- Riesgo elevado de alucinación y de generar texto incoherente: con una perplejidad de 3978,7 y solo 524.288 tokens de entrenamiento, la calidad de generación es muy baja.
- Sesgos conocidos: no documentados, pero al entrenarse solo sobre fineweb-edu (inglés) hereda los sesgos de esa fuente; además, el vocabulario de 2.048 tokens limita la representación.
- Limitación de idioma: solo inglés; no soporta castellano ni otros idiomas.
- Limitación de contexto: 512 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Restricciones de licencia: ODC-BY permite uso comercial con atribución, pero dada la calidad del modelo su uso en producción no es recomendable por motivos técnicos, no legales.
- Caveat para producción: no debe desplegarse como asistente, chatbot ni sistema de generación de contenido factual; su único uso razonable es educativo o experimental.
- Entrenamiento de un solo paso: el modelo no ha completado un régimen de entrenamiento significativo, por lo que sus capacidades son las de un modelo apenas inicializado.

## Enlaces

- Hugging Face: https://huggingface.co/GGUFGuy/useless-parameters-2
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- HyperDex Trainer Space: https://hugging-science-hyperdex-trainer.hf.space/
- Perfil del autor: https://huggingface.co/GGUFGuy
