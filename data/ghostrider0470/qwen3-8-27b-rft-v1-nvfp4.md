# ghostrider0470/Qwen3.8-27B-RFT-v1-NVFP4

## Resumen

Qwen3.8-27B-RFT-v1-NVFP4 es la cuantizacion en NVFP4 (formato de coma flotante de 4 bits para pesos y activaciones) del modelo Qwen3.8-27B-RFT-v1, un ajuste fino del Qwen3.8-27B de Alibaba Cloud. Lo publica Horizon Tech d.o.o. (Sarajevo, Bosnia y Herzegovina), con Hamza Abdagic como autor, bajo licencia Apache 2.0. El modelo original tiene 27.781.427.952 parametros y es un modelo vision-lenguaje (pipeline `image-text-to-text`), por lo que acepta imagenes y texto como entrada.

El objetivo de esta version es reducir el peso en disco y en memoria de 52 GB (bfloat16) a aproximadamente 20 GB, manteniendo pesos y activaciones en 4 bits, para poder servirlo en GPUs NVIDIA con soporte nativo de FP4. La cuantizacion se realizo con llm-compressor 0.15.0 y compressed-tensors 0.20.1, dejando en precision completa el `lm_head`, la torre de vision, los embeddings de tokens, las proyecciones `in_proj_a`/`in_proj_b` de las capas de atencion lineal y la cabeza MTP.

Es relevante ahora porque permite desplegar un modelo de 27B con capacidad multimodal en hardware mas modesto, a costa de una perdida de precision que el propio autor reconoce y que, segun su model card, aun no se ha medido contra el modelo sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atencion lineal (proyecciones `in_proj_a`/`in_proj_b`) y cabeza MTP; modelo vision-lenguaje; detalles completos de la arquitectura base no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, pesos y activaciones, `nvfp4-pack-quantized`); existe tambien una version MLX 4-bit del mismo modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors (NVFP4); cabeza MTP en `model_mtp.safetensors` en precision completa |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-RFT-v1 es un ajuste fino del Qwen3.8-27B de Alibaba Cloud. La model card menciona explicitamente capas de atencion lineal con proyecciones `in_proj_a` e `in_proj_b`, ademas de una cabeza MTP (multi-token prediction) empleada para decodificacion especulativa. No se detalla en la informacion disponible la composicion del dataset de entrenamiento del ajuste fino, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion se hizo con llm-compressor 0.15.0 y compressed-tensors 0.20.1 mediante `QuantizationModifier(targets="Linear", scheme="NVFP4")` en un pipeline secuencial por capa del decodificador, con calibracion sobre 512 conversaciones de `HuggingFaceH4/ultrachat_200k` de hasta 2048 tokens cada una. La cabeza MTP se reentreno por autodestilacion para RFT v1: en 120 documentos de validacion, la cabeza reentrenada acepta 3,15 tokens redactados con 3 borradores y 4,06 con 5 borradores, frente a 3,02 y 3,63 de la cabeza copiada del modelo base. Son metricas offline, no velocidad de servicio real.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`): la torre de vision se mantiene en precision completa.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-27B; no se detallan en la informacion disponible.
- Decodificacion especulativa mediante cabeza MTP integrada en el checkpoint.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistencia visual sobre documentos: extraer y resumir informacion de capturas, facturas o diagramas usando la entrada image-text-to-text, con la ventaja de que la torre de vision permanece en precision completa.
- Servicio de chat en produccion con vLLM: el modelo se sirve con `vllm serve ghostrider0470/Qwen3.8-27B-RFT-v1-NVFP4` en GPUs con soporte FP4, reduciendo el coste de memoria frente a los 52 GB de la version bfloat16.
- Despliegue en una sola GPU de gama alta: los aproximadamente 20 GB del checkpoint permiten alojar el modelo en tarjetas con 24 GB o mas de VRAM, algo inviable con la version sin cuantizar.
- Generacion de codigo asistida: el modelo base es un LLM de proposito general de 27B; esta version puede integrarse en entornos de desarrollo, aunque conviene validar la calidad tras la cuantizacion.
- Prototipado de aplicaciones multimodales: al cargar con Transformers y compressed-tensors, es adecuado para pruebas rapidas de pipelines de vision y lenguaje sin infraestructura de gran escala.
- Inferencia con decodificacion especulativa: la cabeza MTP incluida permite acelerar la generacion de tokens en servidores compatibles, con las tasas de aceptacion medidas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no se ha comparado con el modelo sin cuantizar y que las puntuaciones de la model card del modelo padre deben tomarse como cota superior.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para los pesos NVFP4; hay que sumar memoria para el contexto y el cache KV, no cuantificado.
- GPU recomendadas: NVIDIA con soporte nativo de FP4 (familias Blackwell y posteriores); el autor no especifica modelos concretos.
- GPU consumer: no confirmado; una GPU consumer con 24 GB de VRAM podria alojar los pesos, pero se requiere soporte FP4 para el formato.
- Despliegue: vLLM es la opcion indicada por el autor; tambien carga con Transformers y compressed-tensors.
- Latencia y throughput: no disponibles. Las cifras de aceptacion de la cabeza MTP (3,15 y 4,06 tokens con 3 y 5 borradores) son medidas offline, no velocidad de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Contexto | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-RFT-v1-NVFP4 | 27,8 B | NVFP4 4 bits | 20 GB | No disponible | Apache 2.0 | vLLM en GPU con FP4 |
| Qwen3.8-27B-RFT-v1 | 27,8 B | bfloat16 | 52 GB | No disponible | Apache 2.0 | Transformers, vLLM, SGLang |
| Qwen3.8-27B-RFT-v1-mlx-4bit | 27,8 B | MLX 4 bits | 14 GB | No disponible | Apache 2.0 | Apple silicon (solo texto) |

No se dispone de datos de benchmarks para comparar el rendimiento frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- Perdida de precision esperable por la cuantizacion a 4 bits; el autor no la ha medido contra el modelo sin cuantizar.
- Riesgo de alucinacion inherente al modelo base; no cuantificado en la informacion disponible.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- La version MLX 4-bit del mismo modelo base es solo de texto; esta version NVFP4 conserva la torre de vision.
- Requiere GPUs NVIDIA con soporte FP4; no es portable a otros aceleradores sin conversion.
- El cache KV no se cuantiza, por lo que el consumo real de memoria crece con el contexto.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-NVFP4
- Modelo base (bfloat16): https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1
- Version MLX 4-bit: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-mlx-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Horizon Tech d.o.o.: https://horizon-tech.io
- ORCID del autor: https://orcid.org/0009-0002-4078-4922
