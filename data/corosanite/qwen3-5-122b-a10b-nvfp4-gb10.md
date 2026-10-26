# Corosanite/Qwen3.5-122B-A10B-NVFP4-GB10

## Resumen

Qwen3.5-122B-A10B-NVFP4-GB10 es una cuantización en NVFP4 del modelo Qwen/Qwen3.5-122B-A10B, un transformer de mezcla de expertos (MoE) de 122 111 526 912 parámetros totales según los tensores safetensors del repositorio. La cuantización la firma el usuario Sehyo (publicada en el repositorio de Corosanite) y se ha generado con LLM Compressor de vLLM, usando el esquema NVFP4 de NVIDIA y el formato compressed-tensors. El objetivo es reducir el peso en disco y en memoria de un modelo de 122B hasta 77,4 GB, de modo que pueda servirse en hardware Blackwell con memoria unificada o VRAM limitada, manteniendo la nomenclatura A10B de aproximadamente 10 000 millones de parámetros activos por token.

El interés práctico reside en tres puntos. Primero, el pipeline declarado es image-text-to-text, lo que sitúa al modelo base en la categoría multimodal (entrada de imagen y texto), aunque la model card no detalla la torre visual ni sus parámetros. Segundo, el repositorio incluye desde el 2 de marzo de 2026 los pesos MTP (multi-token prediction) del checkpoint original, lo que habilita decodificación especulativa en vLLM. Tercero, la calibración se hizo con 512 muestras y una longitud máxima de 4096 tokens, con `moe_calibrate_all_experts=True` para que todos los expertos reciban datos de calibración, un detalle relevante porque en modelos MoE la cuantización de expertos infrautilizados es la principal fuente de degradación.

Se trata, sin embargo, de un artefacto con trazabilidad limitada: cero descargas y cero likes en el momento de la consulta, licencia e idiomas no declarados, y un requisito explícito de usar vLLM nightly. Es adecuado para evaluación técnica y experimentación en hardware Blackwell, no para producción sin una validación propia previa contra el modelo base en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia Qwen3.5 (`qwen3_5_moe`); multimodal image-text-to-text según el pipeline declarado |
| Parámetros totales | 122 111 526 912 (122,1 B), dato real de los safetensors |
| Parámetros activos | Aproximadamente 10 000 millones, deducido de la nomenclatura «A10B» del modelo base; no confirmado en la model card |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (4 bits en punto flotante, esquema de NVIDIA) vía compressed-tensors y LLM Compressor; los metadatos incluyen además la etiqueta `8-bit`, sin detalle en la model card sobre qué tensores la usan |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara; depende de la licencia del modelo base Qwen/Qwen3.5-122B-A10B, no indicada en la información proporcionada) |
| Formato de pesos | safetensors con compressed-tensors; incluye pesos MTP adicionales para decodificación especulativa |

Otros datos del repositorio: tamaño de 77,4 GB, biblioteca `transformers`, creado y actualizado el 26 de octubre de 2026, etiqueta `endpoints_compatible` y región `us`.

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Qwen3.5 con 122,1B de parámetros totales y activación dispersa (aproximadamente 10B activos por token según la nomenclatura). No se dispone de información sobre el número de capas, el número de expertos, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa, porque la model card del repositorio cuantizado no los reproduce. El pipeline `image-text-to-text` indica que el checkpoint original acepta imágenes además de texto, si bien se desconoce la arquitectura exacta del codificador visual y si este se ha cuantizado o se mantiene en precisión original.

Esta ficha corresponde a un proceso de cuantización, no a un entrenamiento. La conversión se realizó con LLM Compressor de vLLM, apoyándose en el PR #2383 del repositorio, que añade soporte para Qwen3.5 MoE mediante un bloque `CalibrationQwen3MoeSparseMoeBlock` que enruta los datos de calibración a todos los expertos. La calibración empleó 512 muestras (256 de `HuggingFaceH4/ultrachat_200k`, split `train_sft`, y 256 de `nvidia/Nemotron-Post-Training-Dataset-v2`, split `chat`) con longitud máxima de secuencia de 4096 tokens. La innovación destacable es la incorporación de los pesos MTP del checkpoint original (2 de marzo de 2026), que permiten decodificación especulativa en vLLM y, en principio, mejoras de throughput en generación autorregresiva.

## Capacidades

- Generación de texto conversacional multi-turno, con el modo conversacional (`conversational`) declarado en los metadatos.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), es decir, entrada visual junto a instrucciones en lenguaje natural.
- Decodificación especulativa mediante los pesos MTP incluidos, soportada en vLLM.
- Razonamiento y generación de código: esperable por la familia Qwen3.5, aunque no verificado ni documentado en la información disponible.
- Tool calling y function calling: no documentado en la model card; no se puede confirmar.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo «thinking» explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Extracción de datos de documentos con componente visual: el pipeline image-text-to-text permite enviar capturas, facturas escaneadas o tablas en imagen junto a una instrucción de extracción estructurada, y obtener JSON con los campos requeridos en una sola llamada.
- Asistente conversacional de contexto medio en hardware Blackwell: con 122B totales y unos 10B activos, el coste por token es bajo en comparación con un modelo denso del mismo tamaño, lo que lo hace apto para atención al cliente multi-turno siempre que se valide la ventana de contexto real del modelo base.
- Descripción y clasificación de imágenes a escala en pipelines de moderación o catalogación: el modelo puede recibir la imagen y devolver etiquetas, descripciones o decisiones de política, integrándose en una cola de procesamiento por lotes.
- Generación asistida de código en entornos con GPU Blackwell: adecuado para autocompletado y revisión de parches si se confirma el rendimiento en código, sirviendo el backend vLLM con decodificación especulativa MTP para reducir latencia.
- Evaluación comparativa de cuantizaciones: este repositorio sirve como referencia NVFP4 frente al base en BF16 para medir la pérdida de calidad en tareas concretas antes de adoptar NVFP4 en un despliegue mayor.
- Despliegue en nodos de memoria unificada tipo GB10: el sufijo «GB10» del repositorio apunta a este escenario, donde un modelo de 122B cuantizado a 77,4 GB puede residir en memoria compartida CPU/GPU de una única máquina pequeña.
- Prototipado de asistentes multimodales en investigación: permite experimentar con un MoE grande cuantizado sin disponer de un clúster de GPU de gama alta, a cambio de asumir la inestabilidad de vLLM nightly.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de evaluación de degradación por cuantización (perplejidad o similitud frente al base en BF16), por lo que no es posible cuantificar la pérdida de calidad introducida por NVFP4.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 77,4 GB en disco; en memoria hay que sumar la caché KV y los buffers de activación, por lo que conviene reservar 85-95 GB para contexto moderado. Es una estimación a partir del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: hardware con soporte nativo de NVFP4, es decir, generación Blackwell (GB10, GB200/B200, RTX PRO 6000 Blackwell). No se especifican requisitos oficiales en la model card.
- GPU de consumo: no cabe en tarjetas de 24-32 GB (RTX 4090, RTX 5090) ni siquiera con la cuantización de 4 bits, dado el tamaño de los pesos.
- Software de despliegue: vLLM en versión nightly, requisito explícito del autor. LLM Compressor se usó para la creación, no para servir. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. Cabe esperar que la decodificación especulativa con los pesos MTP mejore el throughput, pero no hay cifras publicadas.
- Nota: el sufijo «GB10» del nombre del repositorio sugiere que el destino previsto es la plataforma NVIDIA GB10 (Grace Blackwell), con memoria unificada; no es una confirmación del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Corosanite/Qwen3.5-122B-A10B-NVFP4-GB10 | 122,1 B | ~10 B | No disponible | NVFP4 | No disponible | Repositorio público, 0 descargas |
| Qwen/Qwen3.5-122B-A10B (base) | 122,1 B | ~10 B | No disponible | BF16 (presumible) | No disponible en la información suministrada | Repositorio público referenciado |
| Otras cuantizaciones del mismo base (FP8, AWQ, GPTQ) | 122,1 B | ~10 B | No disponible | No disponible | No disponible | No disponible en la información suministrada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos de la misma categoría (MoE multimodal de ~120B) en la información proporcionada, por lo que la comparación se limita al contraste con el checkpoint base y con otras cuantizaciones hipotéticas del mismo modelo.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Hay que remitirse a la licencia del modelo base Qwen/Qwen3.5-122B-A10B, que tampoco figura en la información disponible.
- Longitud de contexto desconocida: la calibración se hizo con secuencias de 4096 tokens, por lo que el comportamiento más allá de esa longitud no está validado y la degradación por cuantización puede crecer con contextos largos.
- Calibración reducida y sesgada a chat: 512 muestras de dos datasets conversacionales (`ultrachat_200k` y Nemotron-Post-Training-Dataset-v2). No se documenta calibración específica para código, matemáticas, razonamiento o datos en castellano, lo que puede degradar estas capacidades.
- Calibración de la torre visual no documentada: los datasets de calibración citados son de texto; no se indica si la parte multimodal se calibró, qué tensores se cuantizaron en ella ni si se mantuvo en precisión original.
- Requiere vLLM nightly: dependencia de una rama inestable, con riesgo de roturas entre versiones y sin garantías de compatibilidad a medio plazo.
- Trazabilidad y procedencia: el repositorio lo publica Corosanite pero la cuantización la firma Sehyo; cero descargas y cero likes en el momento de la consulta. No es una publicación oficial del equipo Qwen.
- Idiomas: no se declaran idiomas soportados, de modo que el rendimiento en castellano no está verificado.
- Sesgos y alucinación: no hay documentación específica en la model card; se heredan los sesgos del modelo base, que no se detallan.
- Metadatos incoherentes: conviven las etiquetas `nvfp4` y `8-bit` sin explicación sobre qué tensores usan cada precisión, lo que complica la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Corosanite/Qwen3.5-122B-A10B-NVFP4-GB10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- LLM Compressor (vLLM): https://github.com/vllm-project/llm-compressor
- PR de soporte Qwen3.5 MoE en LLM Compressor: https://github.com/vllm-project/llm-compressor/pull/2383
- Dataset de calibración 1: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibración 2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
