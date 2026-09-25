# darrellbest/Qwen3.5-4B-Heretic-FP8

## Resumen

Qwen3.5-4B-Heretic-FP8 es una cuantización en FP8 (W8A8) del modelo darrellbest/Qwen3.5-4B-Heretic, que a su vez es Qwen/Qwen3.5-4B con el comportamiento de rechazo eliminado mediante la herramienta Heretic y una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre los pesos completos. El resultado declarado por el autor es de 6 rechazos por cada 100 peticiones, frente a 99 por cada 100 del modelo original, con una divergencia KL de 0,0220 respecto al modelo de partida. Está publicado por el usuario darrellbest bajo licencia Apache 2.0 y su uso previsto es el despliegue en vLLM.

El modelo es multimodal (pipeline image-text-to-text): conserva el codificador de visión del original en bf16 y añade una arquitectura híbrida de atención con capas Gated DeltaNet de atención lineal y capas de atención completa. Cuenta con 4.659.865.088 parámetros (unos 4,66 mil millones) y el repositorio pesa 6,8 GB, frente a los 9,35 GB de la versión bf16. Está creado el 25 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que se trata de una publicación reciente y sin adopción comunitaria documentada.

Su relevancia es doble. Por un lado, demuestra una cuantización selectiva: solo se cuantizan las capas lineales del MLP y las proyecciones de atención de las capas de atención completa, mientras que el codificador de visión, las capas Gated DeltaNet, el bloque de predicción multi-token, los embeddings y las normas permanecen en bf16. Por otro, sirve como ejemplo práctico de modelos "abliterated" orientados a investigación sobre rechazos y a generación de contenido sin filtros, con la advertencia explícita de que las salvaguardas de seguridad se han reducido de forma deliberada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5: capas Gated DeltaNet (atención lineal, `linear_attn`) combinadas con capas de atención completa; incluye codificador de visión y bloque de predicción multi-token (MTP) |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 W8A8 (`scheme="FP8_DYNAMIC"`, pesos FP8 E4M3 con escalas por canal y activaciones FP8 dinámicas por token) en capas MLP y proyecciones de atención completa; el resto en bf16 (parámetros `A_log` y de norma de DeltaNet en float32). La familia incluye también bf16, GGUF (BF16, Q8_0, Q4_K_M) y NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (`license_link`: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE) |
| Formato de pesos | safetensors con `compressed-tensors`; pesos de predicción multi-token copiados sin cambios a `model-auxiliary.safetensors` |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantización. El autor partió de darrellbest/Qwen3.5-4B-Heretic, una versión de Qwen/Qwen3.5-4B a la que se le eliminó el comportamiento de rechazo con Heretic mediante Arbitrary-Rank Ablation sobre los pesos completos. Sobre ese modelo se aplicó `llm-compressor` 0.13.0 con el esquema `FP8_DYNAMIC`. La decisión técnica central es selectiva: se cuantizan las capas lineales del MLP y las proyecciones de atención de las capas de atención completa, y se mantienen en bf16 el codificador de visión, las capas Gated DeltaNet, el bloque de predicción multi-token, los embeddings (atados a `lm_head`) y las normas. El autor justifica esta decisión indicando que el estado recurrente de DeltaNet es sensible a la baja precisión y que la tabla de embeddings, de 248.000 entradas, representa una porción grande de un modelo de este tamaño. Los parámetros `A_log` y de norma de las capas DeltaNet se mantienen en float32, igual que en el modelo original.

La cuantización reduce el peso del repositorio de 9,35 GB a 6,79 GB. Un detalle relevante para el despliegue es que el guardado cuantizado descarta los pesos de predicción multi-token, que el autor volvió a copiar sin modificar en `model-auxiliary.safetensors`. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original; tampoco se detallan las métricas de la ablación ARA más allá de la tasa de rechazos y la divergencia KL.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla propia de la serie Qwen3.5.
- Razonamiento en modo "thinking": el autor verificó el modo de pensamiento con problemas aritméticos y de palabras, con 40 de 40 resultados correctos.
- Comprensión de imágenes (image-text-to-text): el autor comprobó la descripción correcta de una imagen de prueba con un círculo rojo y un cuadrado azul, lo que confirma que el codificador de visión sobrevive intacto a la cuantización.
- Razonamiento aritmético y resolución de problemas de palabras, verificado con el muestreo recomendado por Qwen.
- Generación de contenido sin rechazos: 6 rechazos por cada 100 peticiones en la versión bf16 del modelo ablacionado, frente a 99 por cada 100 en el original.
- Predicción multi-token (MTP), conservada mediante `model-auxiliary.safetensors`.
- Soporte de tool calling / function calling y de flujos de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Generación de datos sintéticos a gran escala: con ~3.000 tokens/s agregados en lote de 32 y generaciones de 512 tokens, un único servidor vLLM puede producir grandes volúmenes de texto para ajuste fino o evaluación, y el modelo sin rechazos evita que el pipeline se interrumpa con respuestas de negativa.
- Investigación sobre alineación y mecanismos de rechazo: es un artefacto útil para estudiar qué se pierde y qué se conserva al eliminar el comportamiento de rechazo (6/100 rechazos, KL 0,0220) y para comparar contra el modelo original bajo los mismos prompts.
- Red-teaming y evaluación de seguridad: permite generar de forma controlada contenido que los modelos alineados rechazan, con el fin de construir conjuntos de prueba para clasificadores de seguridad y sistemas de moderación.
- Asistente conversacional de nicho sin filtros temáticos: para aplicaciones de escritura creativa, narrativa interactiva o roleplay donde las negativas del modelo base rompen la experiencia, desplegado en vLLM con una ventana de generación de 512 tokens o más.
- Descripción de imágenes y pipelines de visión-lenguaje: al mantener el codificador de visión en bf16, puede emplearse para altas de producto, etiquetado automático de imágenes o accesibilidad (descripción de imágenes para lectores de pantalla) integrado en un servicio vLLM.
- Servicio de inferencia de alto rendimiento en una sola GPU: con 6,79 GB de pesos FP8, el modelo deja espacio en una GPU profesional para caché KV y lotes grandes, lo que permite atender a muchos usuarios concurrentes con un coste de hardware contenido.
- Prototipado rápido en local sobre GPU de gama alta de consumo: para desarrolladores que quieran probar un modelo multimodal de 4B con razonamiento en modo pensamiento sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos por el autor son internos y se recogen a continuación.

| Prueba | FP8 (este modelo) | Heretic bf16 | Qwen3.5-4B original |
|---|---|---|---|
| Tasa de rechazos (100 prompts) | No remedida tras la cuantización | 6/100 | 99/100 |
| Divergencia KL frente al original | No disponible | 0,0220 | Referencia |
| Aritmética y problemas de palabras (4 problemas x 10 semillas) | 40/40 correctos | 40/40 correctos | 40/40 correctos |
| Descripción de imagen de prueba | Correcta | No disponible | No disponible |
| Throughput en un solo flujo | ~140 tok/s | ~100 tok/s | No disponible |
| Throughput agregado en lote 32 | ~3.000 tok/s | ~2.500 tok/s | No disponible |

Las mediciones se realizaron en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell, con generaciones de 512 tokens y el muestreo recomendado por Qwen. El autor advierte explícitamente de que los pesos FP8 no se volvieron a medir para la tasa de rechazos, por lo que la cifra de 6/100 corresponde al modelo bf16 del que deriva.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan 6,79 GB. Sumando caché KV, activaciones y el codificador de visión en bf16, un despliegue con lotes pequeños y contextos moderados se sitúa de forma estimada en el entorno de 9-12 GB; los lotes grandes con contexto largo requieren más memoria. Estas cifras son estimaciones a partir del tamaño de los pesos y no medidas publicadas.
- GPU recomendadas: el formato FP8 W8A8 con `compressed-tensors` requiere soporte de FP8 nativo, es decir, arquitecturas Ada, Hopper o Blackwell. El autor validó el modelo en una RTX PRO 6000 Blackwell. Son adecuadas H100, L40S, RTX 6000 Ada y RTX PRO 6000; en GPUs anteriores a Ada el rendimiento FP8 no está soportado de forma nativa y vLLM puede no cargar el modelo o degradar la ejecución.
- GPU de consumo: cabe en tarjetas con 16 GB o más de VRAM (RTX 4090, RTX 4080, RTX 4060 Ti de 16 GB) siempre que la generación admita FP8. En tarjetas con 12 GB el margen es muy ajustado y depende del contexto y del tamaño de lote.
- Opciones de despliegue: vLLM es la vía soportada y documentada (`vllm serve darrellbest/Qwen3.5-4B-Heretic-FP8`). Para transformers y SGLang el autor remite a la versión bf16. Para llama.cpp y Ollama existe la variante GGUF de la familia (BF16, Q8_0, Q4_K_M más el `mmproj` de visión).
- Latencia y throughput: ~140 tokens/s en un solo flujo y ~3.000 tokens/s agregados con lote 32 y generaciones de 512 tokens sobre RTX PRO 6000 Blackwell; la versión bf16 rinde ~100 y ~2.500 tokens/s respectivamente. No hay mediciones de latencia por petición (TTFT) publicadas.

## Comparativa con modelos similares

No hay datos publicados de modelos comparables de terceros en la información disponible. La comparación más fiable es dentro de la propia familia del autor, cuyos datos sí están documentados.

| Modelo | Formato | Tamano | Contexto | Rendimiento | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Heretic-FP8 (este) | FP8 W8A8, compressed-tensors | 6,79 GB | No disponible | ~140 tok/s en un flujo; ~3.000 tok/s en lote 32 | Apache 2.0 | vLLM |
| Qwen3.5-4B-Heretic | bf16 safetensors | 9,35 GB | No disponible | ~100 tok/s en un flujo; ~2.500 tok/s en lote 32; 6/100 rechazos | Apache 2.0 | transformers, vLLM, SGLang |
| Qwen3.5-4B-Heretic-GGUF | GGUF BF16 / Q8_0 / Q4_K_M + mmproj de visión | 8,67 / 4,61 / 2,78 GB + 0,67 GB | No disponible | No disponible | Apache 2.0 | llama.cpp, Ollama |
| Qwen3.5-4B-Heretic-NVFP4 | NVFP4, compressed-tensors | 5,67 GB | No disponible | No disponible | Apache 2.0 | vLLM sobre Blackwell |
| Qwen/Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | Apache 2.0 | No disponible |

## Limitaciones y advertencias

- El modelo tiene las salvaguardas de seguridad reducidas por diseño. El propio autor lo advierte: "Reduced safety guardrails by design. You are responsible for what you do with it". No es apto para aplicaciones de cara al público sin controles externos.
- Sesgos conocidos: no hay evaluación de sesgos publicada. Al derivar de Qwen3.5-4B, hereda los sesgos del corpus de entrenamiento original, y la ablación de rechazos puede aflorar respuestas estereotipadas o dañinas ante determinados prompts.
- Riesgo de alucinación: inherente a un modelo de 4,66 mil millones de parámetros; no se ha publicado ninguna evaluación de veracidad ni de tasas de alucinación.
- La cuantización FP8 no se volvió a medir en términos de rechazos. No hay garantía de que la tasa de 6/100 se mantenga tras la cuantización, y el autor lo señala explícitamente.
- El estado recurrente de las capas Gated DeltaNet es sensible a la baja precisión, motivo por el que se mantiene en bf16 y float32; cualquier re-cuantización agresiva de esas capas podría degradar la calidad de forma notable.
- No hay datos de benchmarks estándar ni comparaciones contra modelos de terceros, por lo que la calidad no puede situarse objetivamente frente a alternativas de tamaño similar.
- Sin adopción comunitaria: 0 descargas y 0 "likes" en el momento de redactar la ficha, sin issues ni discusiones que permitan validar el comportamiento en producción.
- Idiomas soportados no documentados; no se puede asumir un rendimiento homogéneo fuera del inglés sin pruebas propias.
- Requisito de hardware implícito: el formato FP8 de `compressed-tensors` no funciona en GPUs anteriores a Ada, lo que limita su despliegue en parques de hardware antiguos.
- Licencia Apache 2.0, que permite uso comercial, pero hereda la licencia del modelo base Qwen3.5-4B; conviene revisar los términos de Qwen antes de un despliegue comercial.
- El uso para generación de datos sintéticos o moderación de contenido requiere revisión humana: un modelo sin rechazos puede producir material que no cumpla las políticas de la plataforma donde se integre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-FP8
- Modelo base (bf16 ablacionado): https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-GGUF
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (eliminación automática de censura, con ARA): https://github.com/p-e-w/heretic
- llm-compressor (herramienta de cuantización empleada, versión 0.13.0): https://github.com/vllm-project/llm-compressor
- Repositorio del autor con el modelo FP8 de 27B: https://huggingface.co/darrellbest/Qwen3.8-27B-Heretic-FP8/tree/main
- Repositorio de la serie Qwen3.5 en GitHub (QwenLM): https://github.com/QwenLM/Qwen3.8
- Ficha de Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Copia del archivo FP8 en un repositorio de terceros (Winnougan/Qwen-3.5-Abliterated-Comfyui-nvfp4): https://huggingface.co/Winnougan/Qwen-3.5-Abliterated-Comfyui-nvfp4/blob/main/Qwen3.5-4B-heretic-fp8.safetensors
