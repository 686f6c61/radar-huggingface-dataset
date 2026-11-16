# BoldingBuilds/Wildcat-d3-ultra-3bit

## Resumen

Wildcat-d3-ultra-3bit es una versión cuantizada a 3 bits de d3-ultra, un modelo de decisión de 27B parámetros de la familia Qwen3.5 desarrollado por el equipo de vLLM Semantic Router. El modelo ha sido comprimido y posteriormente "reparado" mediante dos adaptadores LoRA promediados, con el objetivo de mantener las capacidades de decisión del original (selección de opciones, respuestas sí/no, puntuaciones en escala) con una huella de memoria mucho menor. Lo publica BoldingBuilds y se distribuye bajo la licencia comunitaria de Fastino.

La relevancia de esta ficha radica en su enfoque técnico: no es una simple cuantización, sino un proceso de compresión agresiva (400 capas lineales de texto a 3 bits HQQ con grupo 64) seguido de un ajuste fino con LoRA para recuperar las distribuciones de probabilidad del modelo original. El resultado ocupa unos 13,19 GiB en GPU, lo que permite ejecutarlo en tarjetas de 24 GB como una RTX 3090, frente a los aproximadamente 54 GB que requiere d3-ultra en bf16.

El modelo está especializado en tareas de clasificación y decisión zero-shot, no en generación de texto libre. Su arquitectura subyacente es un transformer de la familia Qwen3.5 con 27B parámetros, aunque la información disponible no detalla la longitud de contexto ni la composición exacta del entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con capas lineales de texto cuantizadas a 3 bits HQQ y resto en bf16 |
| Parametros totales | 27B (modelo base d3-ultra) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit HQQ (group size 64) en 400 capas lineales de texto; bf16 en visión, embeddings, norms e in_proj_a/in_proj_b; LoRA de reparación en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (con restricciones comerciales para empresas >10M USD de ingresos anuales) |
| Formato de pesos | safetensors (q3.safetensors, model-rest.safetensors, lora.safetensors) + código Python (d3_q3.py) |

## Arquitectura y entrenamiento

El modelo parte de d3-ultra, un transformer de 27B parámetros de la familia Qwen3.5. La compresión se realiza en dos fases. Primero, las 400 capas lineales de texto se cuantizan a 3 bits con HQQ (group size 64), almacenando los códigos empaquetados en dos planos (2 bits + 1 bit) que un kernel Triton descomprime justo antes de cada matmul, bit a bit igual que el dequantize nativo de HQQ. La torre de visión, los embeddings, las normas y las proyecciones in_proj_a e in_proj_b permanecen en bf16. Segundo, se entrena un LoRA (rank 32) sobre el modelo cuantizado congelado para que las probabilidades de respuesta coincidan con las de tres profesores: d3-ultra, Jeffan y Fastino GLiDE. Se promedian dos ejecuciones con semillas distintas, cada adaptador a media fuerza.

Los datos de entrenamiento provienen exclusivamente de splits públicos de entrenamiento de datasets con licencias permisivas, verificados contra el Decision Index para evitar fugas; no se usó ningún dato del Decision Index. La innovación técnica principal es el empaquetado de pesos 3-bit con kernel Triton de descompresión bajo demanda, que permite cargar el modelo en 13,19 GiB. En tarjetas de más de 72 GB, el motor descomprime a bf16 y fusiona el LoRA para acelerar la inferencia; en tarjetas de menos de 40 GB responde de una en una (batch size 1) para acomodar peticiones con muchas preguntas largas.

## Capacidades

- Clasificación zero-shot: selección entre opciones, respuestas sí/no y puntuaciones en escala, devolviendo una probabilidad para cada respuesta.
- Modelo de decisión "system-one": responde preguntas de decisión sin razonamiento multi-paso extenso.
- Soporte de tool calling y automatización: la categoría "Tools & automation" obtiene 87,2 en el índice público.
- Comprensión del lenguaje y tareas de recuperación/clasificación: puntuaciones de 73,7 y 71,9 respectivamente en el índice público.
- Capacidades multimodales parciales: el modelo base d3-ultra soporta tareas de imagen y vídeo (Box y Track), aunque Wildcat no fue evaluado en ellas y se espera un rendimiento inferior.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: el modelo puede clasificar una consulta entrante y decidir qué recuperador o herramienta activar, gracias a su capacidad de elección entre opciones con probabilidad asociada y su buen rendimiento en "Retrieval & classification" (71,9).
- Moderación de contenido binaria: usar las preguntas sí/no para decidir si un texto cumple una política, con la probabilidad devuelta como umbral ajustable en producción.
- Clasificación de tickets de soporte: asignar categorías o prioridades a partir de una lista de opciones, aprovechando la ventana de contexto del modelo base (no documentada) para incluir historial de conversación.
- Evaluación automática de respuestas: puntuar en escala la calidad de una respuesta generada por otro modelo, usando la salida probabilística como señal de recompensa o filtro.
- Automatización de decisiones en pipelines de CI/CD: integrar el modelo como paso de clasificación (por ejemplo, decidir si un cambio requiere revisión manual) mediante tool calling y su categoría "Tools & automation" (87,2).
- Análisis de sentimiento y sarcasmo: el LoRA de reparación mejora iSarcasmEval en +8,7 puntos, lo que lo hace útil para clasificación de tono en redes sociales o reseñas.
- Extracción de entidades financieras: la mejora de +2,7 en FinEntity permite usarlo para clasificar menciones de entidades en textos económicos.

## Benchmarks y rendimiento

| Área (índice público, skill) | Wildcat | d3-ultra (board) |
|---|---|---|
| Knowledge & reasoning | 58,9 | 62,3 |
| Language understanding | 73,7 | 72,4 |
| Retrieval & classification | 71,9 | 71,8 |
| Tools & automation | 87,2 | 87,8 |
| Arts & human taste | 60,7 | 63,5 |
| **Índice** | **70,66** | **71,57** |

El índice público de Decision Index 0.3 es de 70,66 para Wildcat (ejecución completa de 140.620 peticiones en una RTX PRO 6000), frente a 71,57 de d3-ultra, una diferencia de 0,9 puntos. Las mayores pérdidas se concentran en razonamiento multi-paso y conocimiento difícil (MuSR, GPQA Diamond, CRUXEval, MMLU-Pro, GSM8K, entre 3 y 10 puntos por debajo). En latencia, la mediana es de 157 ms y el p80 de 351 ms por petición; la media es de 1.258 ms debido a unas 1.000 peticiones ToolRet muy largas, y sin ellas baja a 438 ms. En 750 filas muestreadas, Wildcat y d3-ultra quedaron a la par (media 818 vs 932 ms).

## Requisitos de hardware

- VRAM estimada: 13,19 GiB cargado; descarga de 13,6 GiB.
- GPU recomendadas: NVIDIA con 24 GB o más; probado en RTX 3090 y RTX PRO 6000.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como RTX 3090, RTX 4090 (si bien la prueba documentada es en 3090).
- En tarjetas de menos de 40 GB responde con batch size 1; en tarjetas de más de 72 GB descomprime a bf16 y fusiona el LoRA para mayor velocidad.
- Opciones de despliegue: el motor propio d3_q3 (Python + Triton + accelerate) con el kit Decision Index; requiere NVIDIA CUDA (no probado en AMD).
- Latencia y throughput: mediana 157 ms, p80 351 ms por petición en RTX PRO 6000; media 438 ms sin ToolRet.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wildcat-d3-ultra-3bit | 27B (3-bit) | no disponible | 70,66 | Fastino Community | Hugging Face |
| d3-ultra (bf16) | 27B | no disponible | 71,57 | Apache-2.0 | Hugging Face |
| Jeffan | no disponible | no disponible | no disponible | no disponible | Hugging Face (tattrongvu) |
| Fastino GLiDE | no disponible | no disponible | no disponible | no disponible | Hugging Face (fastino) |

La comparativa directa más relevante es con su modelo base d3-ultra: Wildcat pierde 0,9 puntos de índice a cambio de reducir el requisito de memoria de ~54 GB a ~13 GiB. Jeffan y Fastino GLiDE se usaron como profesores en el entrenamiento, pero no se dispone de sus especificaciones ni resultados en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de rendimiento en razonamiento multi-paso y conocimiento difícil: entre 3 y 10 puntos por debajo de d3-ultra en MuSR, GPQA Diamond, CRUXEval, MMLU-Pro y GSM8K.
- Tareas de imagen y vídeo (Box y Track) no evaluadas: se espera un rendimiento inferior al de d3-ultra.
- Solo probado en NVIDIA CUDA; el kernel Triton no se ha ejecutado en GPU AMD.
- Licencia restrictiva para uso comercial: empresas con más de 10M USD de ingresos anuales necesitan un acuerdo separado con Fastino; además, debe mostrarse "Built with Fastino GLiDE" en documentación, about o UI.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible, lo que dificulta planificar despliegues con historiales largos.
- El modelo está diseñado para decisión y clasificación, no para generación de texto libre; usarlo fuera de ese ámbito no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/BoldingBuilds/Wildcat-d3-ultra-3bit
- Modelo base d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- Profesor Fastino GLiDE: https://huggingface.co/fastino/GLiDE
- Profesor Jeffan: https://huggingface.co/tattrongvu
- Licencia Fastino: https://huggingface.co/BoldingBuilds/Wildcat-d3-ultra-3bit/blob/main/LICENSES/FASTINO-LICENSE.txt
