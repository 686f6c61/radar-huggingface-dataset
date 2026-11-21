# mradermacher/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF

## Resumen

Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF es una cuantización GGUF, generada por mradermacher, del modelo vgandhi13/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite, un ajuste fino del Qwen2.5-VL-7B-Instruct de Alibaba. El modelo base combina capacidades de visión-lenguaje con un entrenamiento de razonamiento mediante RLVR (Reinforcement Learning with Verifiable Rewards) y GRPO, usando el framework verl y el dataset russwang/ThinkLite-VL-70k. La variante "ReasoningOnly" sugiere que el ajuste se centra exclusivamente en tareas de razonamiento verificable.

El repositorio contiene únicamente pesos cuantizados en formato GGUF con calibración imatrix (versión i1), pensados para inferencia local con llama.cpp y derivados. Con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones), el modelo se posiciona en la gama media de modelos visión-lenguaje, lo que permite desplegarlo en GPUs de consumo con cuantizaciones agresivas.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de razonamiento multimodal en hardware modesto, aunque con limitaciones importantes: el modelo está entrenado y etiquetado únicamente en inglés, la licencia es la de Qwen (no plenamente abierta) y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (derivada de Qwen2.5-VL-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-Q4_1, i1-IQ3_S; además de fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | qwen (license: other, enlazada a la licencia de Qwen2.5-VL-7B-Instruct) |
| Formato de pesos | GGUF (cuantizado, con imatrix) |

## Arquitectura y entrenamiento

El modelo base es un transformer visión-lenguaje derivado de Qwen2.5-VL-7B-Instruct, con aproximadamente 7,6 mil millones de parámetros. El ajuste fino se realizó con RLVR (Reinforcement Learning with Verifiable Rewards) usando GRPO (Group Relative Policy Optimization) y el framework verl, sobre el dataset russwang/ThinkLite-VL-70k, orientado a tareas de razonamiento con recompensas verificables. La variante "ReasoningOnly" indica que el entrenamiento se centró en razonamiento y no en instrucciones generales, lo que puede reducir la calidad en conversación abierta.

La cuantización la realizó mradermacher con calibración imatrix (versión i1), que suele ofrecer mejor calidad que las cuantizaciones estáticas equivalentes en tamaño. El repositorio incluye también un fichero imatrix para que el usuario pueda generar sus propias cuantizaciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni detalles del proceso de RLVR más allá de las etiquetas.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen y texto), heredado de Qwen2.5-VL.
- Razonamiento reforzado mediante RLVR/GRPO, orientado a tareas con recompensa verificable.
- Procesamiento de imágenes junto con instrucciones textuales (vision-language).
- Capacidades de razonamiento multi-paso potenciadas por el ajuste "ReasoningOnly".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo "thinking" explícito: no confirmado en la información disponible.

## Casos de uso

- Razonamiento sobre documentos escaneados: el modelo puede recibir una imagen de un documento y razonar sobre su contenido, aprovechando su naturaleza visión-lenguaje y el ajuste en razonamiento verificable para tareas como extracción de datos estructurados.
- Resolución de problemas matemáticos a partir de enunciados en imagen: adecuado para pipelines educativos donde el enunciado llega como captura o foto y se requiere un razonamiento paso a paso.
- Verificación de respuestas en entornos de evaluación automática: el entrenamiento con recompensas verificables lo hace apto para tareas donde la respuesta correcta es comprobable (por ejemplo, problemas con solución única).
- Prototipado local de asistentes multimodales: gracias a las cuantizaciones de 2 a 5 GB, se puede desplegar en una GPU de consumo para experimentación con razonamiento sobre imágenes.
- Análisis de gráficos e infografías: el modelo puede interpretar figuras y razonar sobre tendencias o valores representados, útil en herramientas de análisis de datos visuales.
- Investigación en RLVR aplicado a visión-lenguaje: sirve como punto de partida reproducible para estudiar el efecto del ajuste GRPO en modelos de 7B, dado que el repositorio documenta el dataset y el framework empleados.
- Despliegue en entornos con recursos limitados: las variantes IQ2/IQ3 permiten ejecutar un modelo multimodal de 7B en equipos con 8-12 GB de VRAM, algo inviable con los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (i1-IQ1_S) hasta 5,5-6 GB (i1-Q6_K) para los pesos; hay que sumar el espacio del proyector visual y la caché KV, que depende del contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones medias y altas; A100/H100 para mayor contexto y throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones IQ3/IQ4; las variantes IQ1/IQ2 caben en 4-6 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp), así como servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF (este) | 7,6B | no disponible | qwen (other) | GGUF | Cuantización imatrix de un ajuste RLVR |
| Qwen2.5-VL-7B-Instruct | 7,6B | 128K (según documentación de Qwen) | Apache 2.0 (según Qwen) | safetensors | Modelo base oficial, instrucciones generales |
| vgandhi13/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite | 7,6B | no disponible | other | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-GGUF | 7,6B | no disponible | qwen | GGUF | Cuantizaciones estáticas (no imatrix) |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5-VL, puede heredar sesgos del corpus original.
- Riesgo de alucinación: presente, como en cualquier LLM; el ajuste "ReasoningOnly" puede aumentar la verbosidad del razonamiento sin garantizar corrección.
- Limitaciones de contexto o idioma: el repositorio etiqueta únicamente inglés; el rendimiento en castellano no está garantizado. La longitud de contexto no se especifica en la información disponible.
- Restricciones de licencia: licencia "qwen" con enlace a la licencia de Qwen2.5-VL-7B-Instruct; conviene revisar las condiciones de uso comercial antes de desplegar en producción.
- Caveat de producción: es una cuantización de un ajuste comunitario, no un modelo oficial; no hay benchmarks publicados que respalden su calidad frente al modelo base. Las cuantizaciones IQ1/IQ2 pueden degradar notablemente el rendimiento.
- El ajuste "ReasoningOnly" puede reducir la calidad en tareas conversacionales generales frente a Qwen2.5-VL-7B-Instruct.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF
- Modelo base sin cuantizar: https://huggingface.co/vgandhi13/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen2.5-VL-7B-RLVR-ReasoningOnly-ThinkLite-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/russwang/ThinkLite-VL-70k
- Licencia Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct/blob/main/LICENSE
- Modelo Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
