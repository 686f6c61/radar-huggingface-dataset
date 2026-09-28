# llmtech/decider-0.8b-fp8

## Resumen

decider-0.8b-fp8 es una versión cuantizada a FP8 del modelo Mapika/decider-0.8b, un modelo de decisión (decision-model) de 752 millones de parámetros diseñado para tareas de clasificación y salida estructurada. La cuantización ha sido realizada por LLM Tech utilizando llm-compressor 0.14.0 con el esquema FP8_DYNAMIC, sin datos de calibración, y está optimizada para su despliegue en vLLM. El modelo base, desarrollado por Mapika, sigue una filosofía system-one: resuelve decisiones en una sola pasada (one-pass), sin cadena de pensamiento, y está calibrado para ofrecer probabilidades fiables.

El problema que aborda es el de la inferencia eficiente en tareas de decisión multi-tarea y salida estructurada. Con solo 1,01 GB de pesos en FP8 (frente a 1,5 GB en bf16), el modelo reduce los requisitos de memoria y acelera la inferencia entre un 17% y un 24% en prefill, manteniendo una precisión prácticamente idéntica a la versión bf16 (una caída de 0,1 puntos en tareas in-task y 0,0 en held-out). Es relevante ahora porque permite integrar decisiones automáticas de baja latencia en pipelines de producción con GPUs modestas.

La arquitectura subyacente, según los módulos cuantizados, combina atención estándar (q_proj, k_proj, v_proj, o_proj), componentes de atención lineal (linear_attn.conv1d, in_proj_a, in_proj_b) y redes delta-net (in_proj_qkv, in_proj_z, out_proj), junto con bloques MLP. El modelo está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache 2.0. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal, delta-net y MLP (basado en Qwen3.5, según el tag qwen3_5_text) |
| Parámetros totales | 752.393.024 (≈0,75 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 (pesos con una escala por canal de salida y activaciones escaladas por token en tiempo de ejecución); esquema FP8_DYNAMIC de llm-compressor 0.14.0. El modelo base está en bf16. |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors |
| Modelo base | Mapika/decider-0.8b |
| Pipeline | text-classification |
| Tamaño del repositorio | 1,0 GB |
| Fecha de creación | 2026-09-28 |
| Fecha de actualización | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo base Mapika/decider-0.8b es un transformer con componentes híbridos de atención. La tabla de cuantización revela que la arquitectura incluye capas de atención estándar (q_proj, k_proj, v_proj, o_proj), módulos de atención lineal (linear_attn.conv1d, in_proj_a, in_proj_b) y bloques delta-net (in_proj_qkv, in_proj_z, out_proj), además de las proyecciones MLP habituales (gate_proj, up_proj, down_proj). En total, se cuantizaron 150 capas lineales. Permanecen en bf16 los embeddings (embed_tokens), la cabeza de salida (lm_head), las convoluciones y proyecciones de la atención lineal (linear_attn.conv1d, in_proj_a, in_proj_b) y las normas. La caché KV no se cuantiza.

El proceso de cuantización lo llevó a cabo LLM Tech con llm-compressor 0.14.0, empleando el esquema FP8_DYNAMIC sin datos de calibración. Los pesos se almacenan en FP8 E4M3 con una escala por canal de salida, mientras que las activaciones se escalan por token en tiempo de ejecución. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; se remite a la model card de Mapika/decider-0.8b.

## Capacidades

- Clasificación de texto y toma de decisiones estructuradas: el modelo recibe un estado (texto) y una serie de preguntas con criterios, y devuelve decisiones tipadas (por ejemplo, `choice`, `noul`).
- Salida estructurada: soporta el formato System One de TypeSafe (Jev), permitiendo definir preguntas con tipos y criterios específicos.
- Multitarea: evaluado en 95 tareas (67 in-task y 28 held-out), lo que indica versatilidad en dominios diversos.
- Calibración: obtiene valores bajos de ECE (0,0332 en in-task para FP8), lo que implica probabilidades bien calibradas para decisiones.
- System-one y one-pass: resuelve cada decisión en una sola pasada, sin generar cadenas de razonamiento, lo que reduce la latencia.
- Idiomas: exclusivamente inglés.
- No se menciona soporte de tool calling, function calling, agentes multi-step, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar consultas entrantes en departamentos (facturación, soporte técnico, ventas) y decidir si requieren una acción de reembolso, tal como se muestra en el ejemplo de la model card. Es adecuado por su baja latencia y su capacidad para producir decisiones estructuradas con criterios predefinidos.
- Moderación de contenido: evaluar textos y decidir si infringen políticas, asignando una categoría entre un conjunto de opciones. La calibración del modelo permite establecer umbrales de confianza para derivar casos dudosos a revisión humana.
- Automatización de decisiones en formularios: procesar un estado textual y responder preguntas de tipo sí/no o elección múltiple, como la aprobación de solicitudes o la validación de datos. Su formato de salida estructurada facilita la integración directa en sistemas de gestión.
- Clasificación de intenciones en asistentes virtuales: determinar la intención del usuario en una sola pasada y enrutar la conversación al flujo adecuado. La ventana de contexto no está especificada, pero el modelo está diseñado para estados de hasta 32.768 tokens según las pruebas de rendimiento.
- Filtrado de spam o fraude: decidir si un mensaje o transacción es sospechoso en función de un estado y criterios configurables. La velocidad de prefill (hasta 215.165 tokens/s en FP8 con estados de 1.024 tokens) permite procesar grandes volúmenes en tiempo real.
- Análisis de reseñas y categorización: clasificar opiniones en categorías (positiva, negativa, neutra) y decidir si requieren escalado al equipo de calidad. La baja huella de memoria (1,01 GB de pesos) posibilita desplegarlo en GPUs de gama media.
- Sistemas de recomendación binaria: decidir si recomendar un producto o servicio a partir de una descripción del usuario y criterios de negocio. El modelo ofrece probabilidades calibradas que pueden combinarse con reglas de negocio.
- Evaluación de riesgo en solicitudes: clasificar el nivel de riesgo y decidir la aprobación o denegación de una solicitud, siempre con supervisión humana dado el posible impacto. La licencia Apache 2.0 permite su uso comercial.

## Benchmarks y rendimiento

Los siguientes resultados comparan la versión FP8 con la bf16 del mismo modelo, ejecutadas ambas en vLLM 0.29.0 sobre el mismo conjunto de datos (95 tareas: 67 in-task y 28 held-out, 144.226 filas; y 231 ítems públicos de JevBench).

| Modelo | In-task acc / NLL / ECE (67 tareas) | Held-out acc / NLL / ECE (28 tareas) | JevBench easy / standard / hard |
|---|---|---|---|
| bf16 | 0,7701 / 0,5389 / 0,0343 | 0,7236 / 0,6856 / 0,0866 | 48/48, 60/72, 46/111 |
| FP8 | 0,7692 / 0,5412 / 0,0332 | 0,7240 / 0,6921 / 0,0872 | 48/48, 62/72, 44/111 |

La precisión varía -0,1 puntos en in-task y 0,0 en held-out; la NLL aumenta +0,0023 y +0,0065 respectivamente. Por tarea, el rendimiento baja en 47, sube en 41 y se mantiene igual en 7. Las mayores caídas se dan en mind2web (-1,1 con 1500 filas), copa (-1,0 con 100 filas), mrpc (-1,0 con 408 filas) y medmcqa (-0,9 con 1500 filas).

En cuanto a velocidad, medida en una RTX PRO 6000 Blackwell Server Edition (96 GB) con vLLM 0.29.0, prefix caching desactivado y un token de salida por fila:

| Longitud de estado | bf16 tokens/s | FP8 tokens/s | bf16 latencia | FP8 latencia |
|---|---|---|---|---|
| 1.024 | 173.187 | 215.165 (x1,24) | 16 ms | 16 ms |
| 8.192 | 160.356 | 194.589 (x1,21) | 55 ms | 44 ms |
| 32.768 | 119.228 | 139.616 (x1,17) | 287 ms | 247 ms |

Con `DECIDER_VLLM_GPU_MEMORY_UTILIZATION=0.035`, este checkpoint alcanzó un pico de 5,0 GB bajo 32 peticiones concurrentes de 29.033 tokens, sin errores. Un estado de 29.000 tokens tardó 256 ms en frío y 47 ms con prefix cache.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan 1,01 GB. En las pruebas, el modelo consumió un pico de 5,0 GB con 32 peticiones concurrentes de 29.033 tokens, incluyendo caché KV y activaciones. Para inferencia con lotes pequeños, se estima que puede ejecutarse con 2-3 GB de VRAM, aunque no se ha medido en GPUs de gama baja en la información disponible.
- GPU recomendadas: RTX PRO 6000 Blackwell (probada). Por su reducido tamaño, debería funcionar en A100, H100, RTX 4090, RTX 3090, RTX 3060 (12 GB), etc., pero solo se ha validado en la GPU mencionada.
- ¿Cabe en GPU consumer? Sí, es probable que quepa en GPUs con 4 GB o más de VRAM, como RTX 3050 (8 GB), RTX 3060 (12 GB), RTX 4060, RTX 4090. No se especifica un mínimo exacto.
- Opciones de despliegue: vLLM 0.29.0 es el único motor probado, mediante el paquete `decider-ai[serve]==1.6.0` que expone `POST /v1/systemone`. No se ha probado con TensorRT-LLM ni SGLang. El formato compressed-tensors no es compatible con llama.cpp u Ollama de forma nativa.
- Latencia y throughput: en RTX PRO 6000 Blackwell, el prefill alcanza 215.165 tokens/s con estados de 1.024 tokens (16 ms de latencia), 194.589 tokens/s con 8.192 tokens (44 ms) y 139.616 tokens/s con 32.768 tokens (247 ms). La latencia en frío para un estado de 29.000 tokens es de 256 ms, que se reduce a 47 ms con prefix caching.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de decisión comparables en la documentación proporcionada. La única comparación posible es entre la versión FP8 y la versión bf16 del mismo modelo base:

| Modelo | Parámetros | Tamaño | Precisión in-task (acc) | Precisión held-out (acc) | Licencia |
|---|---|---|---|---|---|
| Mapika/decider-0.8b (bf16) | 752.393.024 | 1,5 GB | 0,7701 | 0,7236 | apache-2.0 |
| llmtech/decider-0.8b-fp8 | 752.393.024 | 1,01 GB | 0,7692 | 0,7240 | apache-2.0 |

La versión FP8 reduce el tamaño en un 33% y acelera la inferencia entre un 17% y un 24%, con una pérdida de precisión mínima. Para alternativas de otros autores, no disponible.

## Limitaciones y advertencias

- Todo lo indicado en la model card del modelo base bf16 sigue aplicando.
- La cuantización FP8 reduce la precisión en 0,1 puntos en tareas in-task y 0,0 en held-out respecto a bf16.
- Solo se volvieron a medir el conjunto de regresión y los ítems públicos de JevBench; las métricas de OpenJev, Mind2Web, browser, game y Bespoke de la card bf16 no se re-evaluaron.
- Las mediciones se realizaron únicamente con vLLM 0.29.0 sobre RTX PRO 6000 Blackwell; no se probó con TensorRT-LLM ni SGLang.
- El modelo solo soporta inglés.
- No se especifica la longitud de contexto máxima, lo que impide garantizar un rendimiento óptimo en estados muy largos.
- No se detallan sesgos conocidos del modelo base; se recomienda evaluar sesgos específicos antes de usarlo en producción.
- Existe riesgo de clasificaciones erróneas o alucinaciones en las decisiones, especialmente en dominios no representados en el entrenamiento. Se aconseja validación humana en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base también es Apache 2.0 según la información disponible, por lo que no se esperan restricciones adicionales.
- No se menciona soporte para tool calling, agentes multi-step, visión o audio.
- La caché KV no está cuantizada, por lo que el consumo de memoria puede crecer con contextos largos y lotes grandes.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/llmtech/decider-0.8b-fp8
- Modelo base: https://huggingface.co/Mapika/decider-0.8b
- Repositorio GitHub: https://github.com/Mapika/decider
- Sitio web de LLM Tech: https://llmtech.eu
- Paper: no disponible
- Demo: no disponible
