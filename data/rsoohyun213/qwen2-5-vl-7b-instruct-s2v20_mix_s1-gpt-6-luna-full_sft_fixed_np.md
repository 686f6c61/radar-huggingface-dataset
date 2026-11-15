# rsoohyun213/Qwen2.5-VL-7B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np

## Resumen

Qwen2.5-VL-7B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np es un ajuste fino (fine-tuning) supervisado del modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. Se trata de un derivado experimental orientado a tareas de razonamiento espacial, según se deduce del nombre del proyecto en Weights & Biases ("spatial_reasoning@SFT-full"), que parte de la arquitectura Qwen2.5-VL de Alibaba y aplica entrenamiento supervisado con TRL sobre un conjunto de datos propietario no documentado.

El modelo conserva la arquitectura transformer multimodal del Qwen2.5-VL original (visión + lenguaje), con aproximadamente 7.000 millones de parámetros, aunque la model card no detalla el proceso de entrenamiento, la composición del dataset ni los hiperparámetros utilizados. El identificador del modelo sugiere una mezcla de datos ("mix"), un cold start y un conjunto de 1.500 muestras ("n1500") etiquetadas con un modelo denominado "gpt-6-luna", lo que apunta a un pipeline de destilación o generación sintética de datos.

Su relevancia es limitada fuera del contexto de investigación del autor: no tiene descargas ni interacciones, la licencia no está especificada y la documentación es mínima. Resulta útil como referencia para quienes investigan fine-tuning multimodal sobre Qwen2.5-VL o técnicas de razonamiento espacial, pero no es un modelo recomendable para producción sin una evaluación adicional exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL), vision + lenguaje |
| Parametros totales | 7B (aproximado, segun modelo base; el campo safetensors reporta 848.896, dato inconsistente con el repo de 33,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-VL-7B-Instruct soporta 128K tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje de la familia Qwen2.5. La arquitectura exacta, el número de capas, la dimensión de las cabezas de atención y la configuración del proyector visión-lenguaje no se detallan en la model card; se heredan del modelo base.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL 1.3.0, sobre Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2. El nombre del modelo indica una mezcla de datos ("S2v20_mix_s1"), un cold start y un conjunto de 1.500 muestras ("n1500") generadas o etiquetadas con un modelo "gpt-6-luna", lo que sugiere destilación desde un modelo mayor. No se especifican el número total de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto "spatial_reasoning@SFT-full", lo que apunta a un objetivo de razonamiento espacial.

## Capacidades

- Generación de texto y razonamiento multimodal: al heredar Qwen2.5-VL-7B-Instruct, conserva la capacidad de procesar imágenes y texto conjuntamente.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y extracción de información de documentos e imágenes.
- Razonamiento espacial: el entrenamiento apunta específicamente a tareas de razonamiento sobre relaciones espaciales, aunque no se documentan resultados.
- Conversación multi-turno: formato conversational, compatible con plantillas de chat de Qwen.
- Tool calling / function calling: no confirmado para este fine-tuning; el modelo base lo soporta, pero no se verifica tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; se heredan potencialmente del modelo base, pero no se confirman.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Investigación en razonamiento espacial: el modelo sirve como punto de partida para experimentos que evalúen cómo el SFT sobre datos sintéticos afecta a la comprensión de relaciones espaciales en imágenes, comparándolo con el Qwen2.5-VL-7B-Instruct original.
- Reproducción de pipelines de destilación: dado el indicio de datos generados por "gpt-6-luna", puede usarse para estudiar técnicas de destilación de modelos mayores a modelos de 7B en dominios multimodales.
- Evaluación comparativa de fine-tunings: útil como baseline en estudios que midan la degradación o mejora de capacidades tras un SFT reducido (1.500 muestras) sobre un modelo instructivo.
- Prototipado de asistentes visuales en entornos controlados: para probar respuestas sobre imágenes en demos internas, siempre con validación previa de calidad.
- Análisis de documentos con componente visual: potencial extracción de información de capturas, diagramas o figuras, sujeto a evaluación empírica.
- Docencia y formación: ejemplo práctico de cómo se documenta (y se documenta deficientemente) un fine-tuning multimodal con TRL, útil para enseñar buenas prácticas de model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16-18 GB para los pesos (7B parámetros) más overhead de activaciones y del codificador visual; en la práctica, 24 GB son recomendables.
- VRAM en cuantización de 8 bits: alrededor de 8-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones para el modelo base, no verificadas para este fine-tuning).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para inferencia en FP16 de una sola instancia; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantización, siempre que se generen los pesos cuantizados (no publicados).
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta endpoints_compatible), vLLM (compatible con arquitectura Qwen2.5-VL, requiere verificación), llama.cpp/Ollama solo si se generan GGUF (no disponibles).
- Latencia y throughput: no disponibles; dependen del hardware y del número de imágenes por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este fine-tuning (rsoohyun213) | ~7B | no disponible | no disponible | Hugging Face, 0 descargas | SFT experimental sobre Qwen2.5-VL |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | 128K (modelo base) | Apache 2.0 (modelo base) | Ampliamente disponible | Modelo original de Alibaba, documentado y con benchmarks |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3B | 128K (modelo base) | Apache 2.0 | Ampliamente disponible | Alternativa más ligera del mismo linaje |
| InternVL2.5-8B | ~8B | 128K aprox. | MIT (verificar) | Hugging Face | Competidor multimodal de tamaño similar |

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica licencia, idiomas, dataset ni hiperparámetros, lo que impide evaluar su idoneidad para uso comercial.
- Licencia indefinida: al no declararse, no se puede asumir que herede la Apache 2.0 del modelo base; es un riesgo legal para producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el SFT con datos sintéticos ("gpt-6-luna") puede amplificar sesgos o errores del generador de datos.
- Dataset no auditado: la composición de la mezcla ("mix") y el cold start no se detallan, por lo que se desconocen posibles sesgos introducidos.
- Riesgo de degradación: un SFT sobre solo 1.500 muestras puede provocar olvido catastrófico de capacidades del modelo base (tool calling, multilingüismo, seguimiento de instrucciones).
- Sin validación externa: cero descargas y cero interacciones; no hay evidencia de calidad por parte de terceros.
- Inconsistencia en metadatos: el campo de parámetros safetensors (848.896) no concuerda con un repo de 33,2 GB ni con el tamaño del modelo base, lo que sugiere errores en la publicación.
- Contexto no confirmado: no se garantiza que conserve la ventana de 128K del modelo base tras el ajuste.
- Uso en producción no recomendado sin evaluación propia y verificación de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-7B-Instruct-S2v20_mix_s1-gpt-6-luna-full_SFT_fixed_np
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/iipmy53t
