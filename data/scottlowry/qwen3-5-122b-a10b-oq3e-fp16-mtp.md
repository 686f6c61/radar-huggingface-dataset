# scottlowry/Qwen3.5-122B-A10B-oQ3e-fp16-mtp

## Resumen

Qwen3.5-122B-A10B-oQ3e-fp16-mtp es una cuantización de precisión mixta del modelo Qwen/Qwen3.5-122B-A10B, publicada por el usuario scottlowry. El modelo base es un transformer de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba), con 125.086 millones de parámetros totales según los tensores safetensors del repositorio. Esta versión concreta ha sido cuantizada con oQ (oMLX v0.7.4.dev1) para su uso con la librería MLX de Apple, lo que la orienta a la inferencia en hardware Apple Silicon.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran escala (122B en el modelo de lenguaje) en equipos con memoria unificada relativamente modesta: el checkpoint completo ocupa 56.425 GiB, con un promedio efectivo de 3.875 bits por peso. La cuantización mixta asigna 3 bits a la mayor parte de los pesos (92,7 %) y mantiene en 8 bits o FP16/FP32 las capas más sensibles, lo que busca preservar calidad donde más importa.

Cabe destacar que el repositorio incluye tres componentes: el modelo de lenguaje (122.112B), un módulo de visión (0.451B) y una cabeza MTP (Multi-Token Prediction) de 2.524B, lo que sugiere capacidades multimodales y decodificación especulativa. No obstante, la información pública disponible sobre el modelo base y sus especificaciones oficiales es limitada en esta ficha, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), tag `qwen3_5_moe`; incluye módulo de visión y cabeza MTP |
| Parametros totales | 125.086.497.008 (125,086B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 3-bit (group 64), affine 4-bit (group 64), affine 8-bit (group 64 y 128), FP16 y FP32; promedio efectivo 3.875 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx); repo de 237,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Qwen3.5, con 125.086B parámetros totales distribuidos en tres bloques: modelo de lenguaje (122.112B), visión (0.451B) y cabeza MTP (2.524B). La presencia de una cabeza MTP (Multi-Token Prediction) apunta a decodificación especulativa o predicción multi-token, técnica que puede acelerar la generación al proponer varios tokens por paso. El tag `qwen3_5_moe` confirma la naturaleza Mixture of Experts, aunque el número de expertos, el ratio de activación y los parámetros activos no se detallan en la información disponible.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se ha publicado información en los datos proporcionados. Esta versión concreta no ha sido reentrenada: es una cuantización del checkpoint Qwen/Qwen3.5-122B-A10B realizada con oMLX v0.7.4.dev1, con una distribución de precisión que concentra el 92,707 % de los pesos lógicos en 3 bits (47,250 GiB) y reserva 8 bits (5.733B pesos), FP16 (0.060B) y FP32 (0.451B) para los componentes más sensibles, presumiblemente embeddings, normas y capas de visión.

## Capacidades

- Generación de texto y razonamiento: al tratarse de un modelo de lenguaje de gran escala, se espera capacidad de generación y razonamiento, aunque no hay evaluación publicada en la información disponible.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0.451B parámetros, lo que indica soporte multimodal imagen-texto.
- Predicción multi-token: la cabeza MTP de 2.524B permite decodificación especulativa, potencialmente con mayor throughput.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 56.425 GiB cabe en equipos con memoria unificada de 64 GB o superior (por ejemplo, Mac Studio con M2 Ultra o M3 Ultra), permitiendo ejecutar un MoE de 122B en local sin GPU dedicada.
- Prototipado de aplicaciones multimodales: el módulo de visión integrado permite experimentar con tareas imagen-texto en un entorno MLX, útil para validar pipelines antes de desplegar en infraestructura mayor.
- Investigación sobre cuantización: la distribución mixta de bits (3/4/8/FP16/FP32) es un caso de estudio para analizar el impacto de la precisión por capa en la calidad de modelos MoE.
- Decodificación acelerada: la cabeza MTP permite probar técnicas de predicción multi-token y medir su efecto en latencia frente a decodificación autoregresiva estándar.
- Evaluación comparativa de checkpoints cuantizados: sirve para contrastar la pérdida de calidad frente al modelo base en FP16/BF16 en tareas de razonamiento y generación.
- Desarrollo en macOS con MLX: integrable en entornos de desarrollo nativos de Apple para experimentación con modelos de gran tamaño sin salir del ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 56.425 GiB para el checkpoint completo en el formato cuantizado; se recomienda al menos 64 GB de memoria unificada para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (Mac Studio M2 Ultra/M3 Ultra de 64-192 GB). No se especifican GPUs NVIDIA en la información disponible.
- ¿Cabe en consumer GPU? No en GPUs de consumo con 24 GB o menos; requiere memoria unificada de Apple Silicon de gama alta.
- Opciones de despliegue: MLX (librería declarada); herramientas de cuantización oMLX/oQ. No se confirman vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Qwen3.5-122B-A10B-oQ3e-fp16-mtp | 125,086B | no disponible | no disponible | safetensors (MLX) | Hugging Face |
| Qwen/Qwen3.5-122B-A10B (base) | 125,086B (según derivado) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits en el 92,7 % de los pesos puede degradar la calidad frente al modelo base en FP16/BF16; no hay evaluación publicada que cuantifique esta pérdida.
- El modelo está empaquetado para MLX, lo que limita su uso a hardware Apple Silicon; no es directamente portable a ecosistemas CUDA sin reconversión.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones del modelo base; conviene verificar la licencia de Qwen/Qwen3.5-122B-A10B antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de gran escala, se deben aplicar las salvaguardas habituales.
- El repositorio tiene 237,9 GB de tamaño total, aunque el checkpoint cuantizado ocupa 56.425 GiB; la descarga y el almacenamiento requieren planificación.
- El autor indica que se re-cuantizó el 2026-11-11 con oMLX v0.7.4.dev1; versiones anteriores pueden diferir y deberían descargarse de nuevo.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ3e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Repositorio oMLX/oQ: https://github.com/jundot/omlx
