# inference-optimization/GLM-5.3-Flash-NVFP4-REAP25

## Resumen

GLM-5.3-Flash-NVFP4-REAP25 es una variante podada y cuantizada del modelo multimodal GLM-5.3-Flash de zai-org, publicada por el usuario inference-optimization. Parte del checkpoint ya cuantizado en NVFP4 de RedHatAI y le aplica una poda estructural del 25 % de los expertos MoE mediante la técnica REAP, reduciendo el número de expertos enrutados de 288 a 216 en cada una de las 42 capas MoE del backbone. El resultado conserva la cuantización NVFP4 original en los expertos y deja intactos el resto de pesos (atención, torre de visión, embeddings y expertos compartidos).

El modelo mantiene la pila `glm5_next` de Transformers y el pipeline `image-text-to-text`, por lo que sigue siendo un modelo multimodal conversacional con capacidades de texto e imagen. El objetivo es claro: reducir el coste de cómputo y memoria en inferencia sin reentrenar, eliminando los expertos menos relevantes según su saliencia medida en un corpus de calibración multidominio (RazorCal, 2.048 muestras).

Es relevante para equipos que despliegan modelos MoE de gran tamaño en producción y necesitan recortar requisitos de VRAM o mejorar el throughput en vLLM, manteniendo el comportamiento del checkpoint original dentro de lo razonable. La licencia MIT facilita su uso comercial, aunque conviene validar la degradación de calidad introducida por la poda en cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (pila `glm5_next`), con torre de visión y capa MTP |
| Parametros totales | 131.057.012.622 (~131 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4) en expertos MoE; FP8 en la capa MTP (`layers.45`); resto de pesos sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 155 GB) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) multimodal con 42 capas MoE en el backbone (capas 3 a 44) y una capa MTP (multi-token prediction) en `layers.45`. Sobre el checkpoint base GLM-5.3-Flash se aplicaron dos transformaciones encadenadas: primero la cuantización NVFP4 realizada por RedHatAI, y después una poda estructural REAP del 25 % de los expertos enrutados, que pasa de 288 a 216 expertos por capa (72 eliminados por capa, 9.072 de 12.096 retenidos en total). Los routers y su `e_score_correction_bias` se recortaron para coincidir con el nuevo recuento, y los índices de experto se remapearon de forma contigua; `config.json` refleja `n_routed_experts: 216`.

REAP puntúa cada experto con la media ponderada por el router de la norma de sus activaciones de salida sobre los tokens de calibración enrutados a él, `S_j = mean(g_j * ||f_j||_2)`, usando solo forward, sin gradientes ni entrenamiento de recuperación. La calibración se hizo sobre las 2.048 muestras del corpus RazorCal. La selección es uniforme entre capas: en cada una se eliminan los 72 expertos con menor saliencia. La capa MTP no se toca y conserva sus 288 expertos FP8 originales, aunque Transformers la ignora al cargar, igual que en el modelo fuente.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), con torre de visión intacta.
- Razonamiento y generación de código heredados del modelo base GLM-5.3-Flash (no se documentan capacidades específicas adicionales en la model card).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a en y zh según los metadatos; otros idiomas no están declarados.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE multimodal de ~131 mil millones de parámetros en infraestructuras con VRAM ajustada: la poda del 25 % de expertos y la cuantización NVFP4 reducen el peso del checkpoint a 155 GB, lo que permite servirlo en configuraciones multi-GPU más modestas que el modelo original.
- Servicio de asistencia visual en inglés o chino: el modelo puede responder preguntas sobre imágenes (capturas, documentos escaneados, fotos de producto) en un pipeline `image-text-to-text`, aprovechando la torre de visión sin modificar.
- Procesamiento de documentos con OCR conversacional: extracción y resumen de información de imágenes de documentos, con la ventaja de que la cuantización NVFP4 acelera la inferencia en GPU compatibles con FP4.
- Investigación sobre poda de MoE: el checkpoint sirve como referencia reproducible para comparar la degradación de calidad de REAP frente al modelo original, ya que la model card documenta la metodología y el corpus de calibración.
- Evaluación de cuantización NVFP4 en producción: útil para medir throughput y latencia reales de FP4 frente a FP8/BF16 en vLLM con un modelo de gran tamaño.
- Chatbot interno bilingüe en/zh con soporte de imágenes: para equipos que operan en mercados anglófonos y chinos y necesitan un modelo con licencia permisiva (MIT) y despliegue en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 155 GB en safetensors, por lo que se necesita al menos esa capacidad agregada, más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, requiere un despliegue multi-GPU (por ejemplo, varias A100/H100 de 80 GB) o GPUs con soporte nativo de FP4.
- ¿Cabe en GPU consumer? No de forma íntegra: con ~131 mil millones de parámetros y 155 GB de pesos, no cabe en una sola RTX 4090 (24 GB) ni en GPUs consumer habituales.
- Opciones de despliegue: vLLM (etiqueta explícita en el modelo), Transformers con `Glm5NextForConditionalGeneration`, y `llm-compressor`/`compressed-tensors` para el pipeline de compresión. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4-REAP25 (este) | ~131 mil M | no disponible | NVFP4 + poda REAP 25 % | MIT | 216 expertos por capa MoE |
| RedHatAI/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Checkpoint base sin poda, 288 expertos por capa |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | BF16/FP8 original | no disponible | Modelo fuente sin cuantizar ni podar |

## Limitaciones y advertencias

- La poda REAP elimina el 25 % de los expertos sin entrenamiento de recuperación, por lo que puede degradar la calidad en dominios poco representados en el corpus de calibración RazorCal.
- La selección de expertos es uniforme por capa y no adaptativa al caso de uso; dominios especializados pueden sufrir más pérdida que el promedio.
- Idiomas declarados solo en y zh; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia MIT permite uso comercial, pero conviene verificar las obligaciones heredadas del modelo base y de los datos de calibración.
- La capa MTP (`layers.45`) conserva 288 expertos FP8 y es ignorada por Transformers al cargar; comportamientos de decodificación especulativa que dependan de MTP pueden no estar disponibles en este checkpoint.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación frente al modelo original, por lo que se recomienda evaluar en el dominio objetivo antes de producción.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/inference-optimization/GLM-5.3-Flash-NVFP4-REAP25
- Modelo base (cuantizado): https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Modelo fuente original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Corpus de calibración RazorCal: https://huggingface.co/datasets/inference-optimization/RazorCal
- Ejemplo de poda REAP en llm-compressor: https://github.com/vllm-project/llm-compressor/tree/main/examples/reap_expert_pruning
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia MIT: https://choosealicense.com/licenses/mit/
