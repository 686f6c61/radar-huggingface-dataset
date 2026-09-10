# kaonai/grpo-kaon3-cr5b-calibrated-median-n18-b004-step100

## Resumen

Este modelo es un checkpoint de la familia Kaon, creado por el usuario `kaonai`, que parte del modelo base `kaonai/kaon-c-gemma4-26b-v10.1`. Se trata de un merge de pesos completos en BF16, no de un adaptador, y se presenta como un checkpoint de entrenamiento con GRPO (Group Relative Policy Optimization). El nombre indica que se aplicó una técnica de recompensa por consenso (`consensus-reward`) con agregación por mediana calibrada sobre márgenes calibrados, y que corresponde al paso 100 de optimización.

El modelo tiene 25.805.933.872 parámetros (aproximadamente 25,8B), lo que lo sitúa en la categoría de modelos grandes. El repositorio pesa 51,6 GB, coherente con pesos en bfloat16. La etiqueta `image-text-to-text` del modelo base sugiere capacidades multimodales, aunque la model card de este checkpoint no documenta explícitamente sus capacidades. El estado declarado es `suggested unevaluated checkpoint`, y se indica que la publicación no autoriza su promoción como modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal, derivado de la familia Gemma 4 (modelo base: kaonai/kaon-c-gemma4-26b-v10.1) |
| Parametros totales | 25.805.933.872 (≈25,8B) |
| Parametros activos | No aplica (no es Mixture of Experts) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors, bfloat16 (merge de pesos completos, no adaptador) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos completos (full-weight merge) en bfloat16, construido a partir del checkpoint de referencia `kaonai/kaon-c-gemma4-26b-v10.1` (hash `b17ba3fdebff342e303603225e1f0f1e6e606c16`). No es un repositorio de adaptadores ni un LoRA, sino que integra los pesos fusionados en un único fichero safetensors. La técnica de entrenamiento documentada es GRPO con una tasa de aprendizaje de `1e-4`, beta de `0.04` y semilla `42`, en el paso de optimización 100.

La innovación destacable reside en el mecanismo de recompensa: se utiliza una agregación por `calibrated median` sobre márgenes calibrados R/S/W, con un muestreo de `N18 → bottom3 + top3` y consenso estricto de tres signos (`strict three-way sign consensus`). Además, el repositorio incluye un `MERGE_AUDIT.json` con la identidad de la fuente y detalles de verificación, y un `MANIFEST.sha256` para comprobar la integridad de los ficheros. Según la model card, la paridad de logits representativos verificada al guardar y recargar el modelo es `PASS` (`representative-logit parity: PASS`). No se proporcionan datos sobre el dataset de entrenamiento ni sobre la composición de los datos.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation`, por lo que el modelo está orientado a producir texto.
- Entrada multimodal potencial: el modelo base aparece etiquetado como `image-text-to-text`, lo que sugiere que podría aceptar imágenes además de texto, pero esta capacidad no se confirma en la model card de este checkpoint.
- Funcionalidades como tool calling, function calling, ejecución de agentes o razonamiento multi-paso: no documentadas en la información disponible.
- Capacidades multilingües: no especificadas en la model card.
- Modo de pensamiento (thinking mode), audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación en métodos de recompensa: el checkpoint permite analizar el efecto de la agregación de recompensas por mediana calibrada y el consenso de tres signos dentro de GRPO, comparando con otros pasos o variantes.
- Experimentación con merges de pesos: sirve como referencia para validar la técnica de merge full-weight en BF16 con paridad de logits, un proceso poco habitual en modelos de este tamaño.
- Evaluación de alineación: al ser un checkpoint no evaluado, puede usarse para medir empíricamente la consistencia y calidad de las respuestas generadas bajo el esquema de consenso propuesto.
- Prototipado de chatbots de gran escala: su tamaño de ~25,8B permite mantener conversaciones largas y complejas, siempre que se disponga de hardware con suficiente VRAM o se recurra a cuantización adicional.
- Adaptación a tareas multimodales: si se confirma la capacidad visual heredada, podría emplearse en tareas de descripción de imágenes o visual question answering, aunque requiere una validación previa exhaustiva.
- Fine-tuning posterior: al tratarse de un merge de pesos completos, puede utilizarse como base para continuar el entrenamiento con RLHF, DPO u otros objetivos de optimización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento como MMLU, HumanEval, GSM8K ni otros resultados comparativos. El propio estado del checkpoint se describe como `suggested unevaluated checkpoint`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51,6 GB para cargar los pesos en bfloat16 (25,8B parámetros × 2 bytes). Hay que sumar el consumo de caché KV y otros overheads, que dependen de la longitud del contexto.
- GPU recomendadas: se necesitan GPUs con 80 GB de VRAM, como la NVIDIA A100 80GB o la H100 80GB, para ejecutar el modelo en bfloat16 sin cuantización.
- GPU de consumo: no cabe en una GPU de consumo típica, como una RTX 4090 de 24 GB, sin aplicar técnicas de reparto o cuantización. No se han publicado versiones cuantizadas de este checkpoint.
- Opciones de despliegue: al ser un modelo con formato safetensors y compatible con `transformers`, puede servirse con vLLM, Hugging Face Text Generation Inference (TGI) o directamente mediante `transformers`. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa con modelos similares de la misma categoría. El único punto de referencia directo es el modelo base `kaonai/kaon-c-gemma4-26b-v10.1`, del que este checkpoint es un merge, pero no se han publicado métricas de rendimiento ni especificaciones completas de ninguno de los dos.

## Limitaciones y advertencias

- El estado declarado es `suggested unevaluated checkpoint`: el modelo no ha sido evaluado formalmente y su publicación no debe interpretarse como una autorización para su promoción o uso en producción.
- No se ha publicado licencia, por lo que las condiciones de uso comercial son desconocidas y requieren consulta al autor.
- Al no existir benchmarks, el riesgo de alucinación, los sesgos o el rendimiento real en tareas específicas no pueden estimarse.
- No hay información sobre idiomas soportados, por lo que el comportamiento en lenguajes distintos del inglés no está verificado.
- El modelo es un checkpoint intermedio (paso 100 de GRPO), lo que implica que el entrenamiento puede ser incompleto y que la calidad de las respuestas puede variar significativamente.
- Para producción se necesita una evaluación exhaustiva, incluyendo pruebas de seguridad, sesgos y robustez, antes de cualquier despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kaonai/grpo-kaon3-cr5b-calibrated-median-n18-b004-step100
- Modelo base: https://huggingface.co/kaonai/kaon-c-gemma4-26b-v10.1
- Dentro del repositorio se incluyen `MERGE_AUDIT.json` y `MANIFEST.sha256` para verificar la identidad de la fuente y la integridad de los ficheros.

No se han encontrado enlaces adicionales (papers, blogs, demos) en la búsqueda web; la información recuperada no era relevante para este modelo.
