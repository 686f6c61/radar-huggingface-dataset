# didula-wso2/gemma4_1-0-2_sft_16bit_vllm

## Resumen

El modelo `didula-wso2/gemma4_1-0-2_sft_16bit_vllm` es un ajuste fino (fine-tune) del modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, desarrollado por el usuario didula-wso2. Se trata de un modelo multimodal (pipeline `image-text-to-text`) que procesa tanto imágenes como texto, con licencia Apache 2.0 y orientado a conversación. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una velocidad de entrenamiento aproximadamente el doble de rápida que un flujo estándar.

El modelo cuenta con 7.996.156.490 parámetros (alrededor de 8 mil millones) y se distribuye en formato `safetensors` con un tamaño de repositorio de 16 GB, lo que sugiere pesos en precisión de 16 bits (fp16/bf16). Aunque el modelo base original estaba cuantizado a 4 bits, este fine-tune se ha subido en 16 bits, lo que facilita su uso con motores de inferencia como vLLM. Su relevancia radica en ser un modelo abierto y multimodal con una licencia permisiva, aunque carece de documentación detallada sobre sus capacidades específicas y rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre sugiere 16 bits, pero no se especifican variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de un modelo de la familia Gemma 4 de Google. El ajuste fino se realizó con las librerías Unsloth y TRL de Hugging Face, lo que aceleró el entrenamiento aproximadamente 2 veces. No se dispone de información sobre la arquitectura interna (si es transformer, MoE, etc.), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del uso de Unsloth para optimizar el entrenamiento.

## Capacidades

- Generacion de texto y conversacion: al ser un modelo con pipeline `image-text-to-text`, puede generar texto a partir de entradas que combinan imagenes y texto.
- Procesamiento multimodal: acepta tanto imagenes como texto como entrada, lo que permite tareas de vision-lenguaje (captioning, VQA, etc.).
- Soporte de tool calling: no se menciona en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no se menciona.
- Capacidades multilingues: solo se declara el ingles (`en`).
- Otras capacidades especiales: no se documentan.

## Casos de uso

No se dispone de informacion especifica sobre casos de uso documentados para este modelo. Dado su pipeline multimodal, podria emplearse en tareas de vision-lenguaje como respuesta a preguntas sobre imagenes, generacion de descripciones o asistentes conversacionales que integren informacion visual. Sin embargo, al no existir documentacion oficial ni ejemplos de aplicacion, no es posible confirmar su idoneidad para escenarios concretos. Se recomienda evaluar el modelo directamente antes de integrarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar que permitan comparar su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8 mil millones de parametros en precision de 16 bits, se necesitan aproximadamente 16 GB de VRAM solo para los pesos, mas overhead de activaciones y memoria del motor de inferencia. Se estima un minimo de 20-24 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM, como la RTX 3090, RTX 4090, A10G o A100 (40 GB). En GPUs con 16 GB (como la RTX 4080) podria funcionar con cuantizacion adicional, pero no se ofrecen variantes cuantizadas en el repositorio.
- Si cabe en consumer GPU: si, en GPUs de gama alta con 24 GB o mas, como la RTX 3090/4090.
- Opciones de despliegue: al estar preparado para vLLM (el nombre incluye `vllm`), se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp si se convierte a GGUF. Tambien es compatible con el ecosistema transformers.
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (fine-tunes de Gemma 4 o modelos multimodales de ~8B). El autor ha publicado otros modelos similares (por ejemplo, `gemma4_1-0-0_sft_16bit_vllm` y `gemma4_sft-julia_klgesft_16bit_vllm`), pero no se ofrecen datos de rendimiento ni comparativas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un fine-tune de un modelo base de Google, podria heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: no se ha evaluado especificamente, pero es un riesgo comun en modelos generativos.
- Limitaciones de contexto o idioma: solo se declara soporte para ingles; no se especifica la longitud de contexto, por lo que se desconoce su capacidad para manejar secuencias largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener la atribucion y no se garantiza el modelo.
- Caveats para produccion: al no existir benchmarks ni documentacion tecnica, no se recomienda su uso en entornos criticos sin una evaluacion exhaustiva previa. Ademas, el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/didula-wso2/gemma4_1-0-2_sft_16bit_vllm
- Modelo relacionado (v1.0.0): https://huggingface.co/didula-wso2/gemma4_1-0-0_sft_16bit_vllm
- Guia de vLLM para Gemma 4: https://docs.vllm.ai/projects/recipes/en/stable/Google/Gemma4.html
- Otro modelo del mismo autor: https://friendli.ai/models/didula-wso2/gemma4_sft-julia_klgesft_16bit_vllm
