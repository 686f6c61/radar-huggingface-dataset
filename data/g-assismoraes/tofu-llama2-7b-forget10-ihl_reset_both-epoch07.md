# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch07

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch07` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el usuario g-assismoraes en Hugging Face. Se trata de un ajuste fino orientado a experimentos de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en su variante `forget10`, que busca eliminar selectivamente el conocimiento de un subconjunto del 10 % de los datos de entrenamiento. No es un modelo de propósito general, sino un artefacto experimental para estudiar técnicas de olvido selectivo.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre TOFU. Sobre él se aplica una intervención denominada "IHL + Reset Both": se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformador se conservan del checkpoint base. El entrenamiento combina una pérdida de tipo token IHL sobre el conjunto *forget* con entropía cruzada (CE) sobre el conjunto *retain*, con un peso de 1.0. El resultado es el checkpoint de la época 7 de un total de 20.

Su relevancia es estrictamente metodológica: sirve como referencia para evaluar hasta qué punto un modelo puede "olvidar" datos concretos sin degradar su rendimiento general, un problema central en privacidad, cumplimiento del RGPD y gestión de datos en modelos fundacionales. Con 6.738.415.616 parámetros y un repositorio de 13,5 GB, es un modelo de escala 7B con contexto estándar de Llama 2 (4.096 tokens).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base: 4.096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU, sin innovaciones arquitectónicas propias. El checkpoint deriva de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el dataset TOFU. La intervención específica de este checkpoint consiste en reinicializar los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformador del modelo base. Según la model card, el objetivo de entrenamiento combina una pérdida token IHL sobre el conjunto *forget* con una pérdida de entropía cruzada (CE) sobre el conjunto *retain*, ponderada con factor 1.0.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado en esta ejecución, ni sobre el uso de RLHF o DPO. El checkpoint corresponde a la época 7 de 20, lo que sugiere un proceso de entrenamiento relativamente corto y controlado para estudiar la dinámica del olvido selectivo. El autor indica que existe un archivo `ihl_manifest.json` con metadatos adicionales, pero su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas, condicionado por el ajuste fino sobre TOFU.
- Capacidad de *machine unlearning* experimental: el modelo está diseñado para evaluar si ha olvidado el 10 % de los datos de TOFU designados como *forget*.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta *thinking mode*, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como checkpoint de referencia para medir la eficacia de la técnica IHL + Reset Both sobre el conjunto forget10 de TOFU, comparando métricas de olvido y retención frente a otros checkpoints de la misma serie.
- Evaluación de privacidad y cumplimiento: permite estudiar si un modelo puede eliminar información sensible o protegida sin perder utilidad general, un requisito habitual en escenarios de RGPD y gestión de datos personales.
- Reproducibilidad de experimentos académicos: al ser un checkpoint completo y autónomo, puede cargarse directamente para replicar los resultados del autor en la época 7.
- Análisis de degradación por reinicialización: al reinicializar embeddings y LM head, permite estudiar el impacto de esta intervención en la calidad de las representaciones y en la perplejidad sobre el conjunto retain.
- Benchmarking de métodos de olvido: útil como línea base frente a otras técnicas (gradient ascent, preference optimization, etc.) en la literatura de unlearning.
- Estudio de dinámica de entrenamiento: al ser la época 7 de 20, permite analizar la evolución del olvido a lo largo del entrenamiento y comparar con épocas anteriores o posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamaño del repositorio en safetensors).
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB (no confirmado por el autor).
- VRAM estimada en cuantización de 4 bits: aproximadamente 4 GB (no confirmado por el autor).
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, RTX 4090 24 GB, RTX 3090 24 GB.
- Cabe en GPU de consumo con 16 GB o más en FP16 (RTX 4080, RTX 4090, RTX 3090); en 8 bits podría caber en GPU de 8-10 GB, aunque no está verificado.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch07 | 6.738.415.616 | no disponible | llama2 | Hugging Face | Checkpoint experimental de unlearning (época 7/20) |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | llama2 | Hugging Face | Modelo base ajustado sobre TOFU, sin olvido |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 | llama2 | Hugging Face | Llama 2 chat, origen de los embeddings y LM head reinicializados |
| meta-llama/Llama-2-7b-hf | ~6.738 M | 4.096 | llama2 | Hugging Face | Modelo fundacional original de Llama 2 |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Sesgos heredados: al derivar de Llama 2, arrastra los sesgos conocidos del modelo original en datos web y de conversación.
- Riesgo de alucinación: presente como en cualquier modelo de 7B, agravado por el ajuste fino sobre un dataset sintético (TOFU) de dominio limitado.
- Contexto e idioma: solo inglés y ventana de contexto limitada (Llama 2 estándar), lo que restringe su uso multilingüe y con documentos largos.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta; requiere aceptar la licencia y respetar la política de uso aceptable.
- Efectividad del olvido no verificada: no se han publicado métricas que confirmen que el modelo haya olvidado realmente el conjunto forget10; el checkpoint es un artefacto intermedio (época 7 de 20).
- Reinicialización de embeddings y LM head: puede degradar la coherencia del modelo respecto al checkpoint base, ya que estos componentes no se han reentrenado desde cero en el mismo régimen.
- Sin pipeline declarado: la model card no especifica tarea (`text-generation` u otra), lo que puede requerir configuración manual al cargarlo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo fundacional: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
