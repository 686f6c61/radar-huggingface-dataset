# orizon-fun/Button-4B-Tone

## Resumen

Button-4B-Tone es un adaptador LoRA publicado por orizon-fun que se monta sobre el modelo `prism-ml/Ternary-Bonsai-4B-unpacked` (4B parámetros) para darle un tono de mensajería informal. No es un modelo completo: es un conjunto de pesos PEFT de rango 16 (alpha 32) que sustituye las reglas de estilo que antes vivían en el system prompt de la app ("ser conversacional y algo sarcástico", "un párrafo corto", "texto plano como un mensaje de móvil"). El checkpoint publicado es `v2_lr5e-5_e3` (learning rate 5e-5, 3 épocas).

El contexto de uso declarado es Button-4B, el asistente on-device para iPhone de Orizon, de ahí que el entrenamiento fije una plantilla de chat concreta, desactive el modo thinking (`enable_thinking=False`) y limite las secuencias a 2.048 tokens. El adaptador está pensado para ejecutarse en el dispositivo o en un servidor pequeño, no para cargas de trabajo generalistas.

Es relevante ahora por dos motivos: primero, documenta una receta reproducible de ajuste de estilo con datos sintéticos (generados con `z-ai/glm-5.3`) mezclados con conversaciones humanas reales del corpus REALTALK; segundo, muestra el patrón de sacar las instrucciones de estilo del prompt y moverlas a los pesos, lo que reduce tokens de sistema y hace el comportamiento más estable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0,1 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de 36 capas; el modelo base se distribuye con pesos ternarios desempaquetados a FP16 |
| Parametros totales | Modelo base: 4B (según denominación del checkpoint). Adaptador: no disponible (LoRA r=16, alpha=32, dropout 0,05) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible la ventana nativa del modelo base. Entrenamiento: 2.048 tokens (prompt + respuesta). Evaluación: hasta 3.072 tokens de entrada y 512 de salida |
| Tipos de cuantizacion | Modelo base: checkpoint FP16 "unpacked" de pesos ternarios y variante MLX 2-bit (`Ternary-Bonsai-4B-mlx-2bit`). El adaptador se distribuye en safetensors (bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en safetensors, con variante MLX |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 36 capas con pesos ternarios, empaquetados originalmente y distribuidos "desempaquetados" en un checkpoint FP16 que se carga en bfloat16 para el entrenamiento. Sobre él se aplica un LoRA clásico (sin DoRA ni rsLoRA) con r=16 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en las 36 capas, dropout 0,05 y sin sesgos. El entrenamiento usó AdamW, learning rate constante de 5e-5 sin warmup, 3 épocas (945 pasos, 315 por época), batch de 16 sin acumulación, grad norm máximo 0,3, gradient checkpointing, muestreo `group_by_length`, semilla 0 y precisión bf16.

Los datos son 5.028 filas: 4.648 conversaciones sintéticas estilo REALTALK generadas con `z-ai/glm-5.3` y 380 conversaciones humanas del corpus REALTALK (Lee et al., 2025, arXiv 2502.13270, Apache-2.0). Las respuestas sintéticas en las que el hablante describía experiencias personales se reescribieron para conservar tono y longitud sin inventar vivencias; aproximadamente el 25 % de las respuestas sintéticas terminan con un emoji elegido por un etiquetador GLM-5.3. Se usó la plantilla de chat propia del modelo base (md5 `6c10af56c34d858bfb06966532174863`) con `add_generation_prompt=True` y `enable_thinking=False`, de modo que el prompt de generación acaba en un bloque de pensamiento vacío. La pérdida se calculó solo sobre la respuesta más `<|im_end|>\n`. Los turnos consecutivos del mismo interlocutor se unieron con saltos de línea; se incluyeron hasta 24 mensajes previos empezando por un turno de usuario, descartando los más antiguos hasta encajar en 2.048 tokens. Cada chat se usó desde ambos lados, con 2 turnos de Button elegidos al azar como objetivo por chat.

## Capacidades

- Generación de texto conversacional breve en inglés con registro informal de mensajería (una línea por mensaje, respuestas de varias líneas cuando el interlocutor encadena mensajes).
- Reproducción de un estilo concreto: réplicas cortas, tono coloquial y cierto sarcasmo, según el system prompt de entrenamiento.
- Cierre con emoji: el modelo aprende a terminar con un único emoji de un conjunto cerrado de nueve cuando el momento es gracioso, tierno o incómodo.
- Conversación multi-turno con hasta 24 mensajes de historial (dentro del límite de 2.048 tokens).
- Modo thinking desactivado de forma consistente (`enable_thinking=False`), lo que evita bloques de razonamiento en la salida.
- Inyección de fecha en el system prompt (formato en_US tipo `Saturday, October 24, 2026`), usada durante el entrenamiento con fechas aleatorias de 2026.
- No incluye tool calling en el entrenamiento: no hay esquemas de herramientas en la plantilla ni texto de guía. Las herramientas (`web_search`, `google_maps`, `search_email`, `calendar_events`) se añaden en la app como texto posterior al prompt de sistema y como esquemas pasados a la plantilla.
- No se documentan capacidades de visión, audio, código o matemáticas específicas; el adaptador es de estilo, no aporta conocimiento nuevo.

## Casos de uso

- Asistente on-device en iOS: es el caso original. El adaptador se carga sobre el base en el iPhone (vía MLX 2-bit) y responde en el hilo de conversación con el tono de la app, sin necesidad de inyectar instrucciones de estilo largas en cada petición.
- Reducción de tokens de sistema: al mover las reglas de estilo del system prompt a los pesos se libera espacio de contexto y se recorta coste por petición en un asistente que se ejecuta muchas veces al día.
- Mensajería asistida (borradores de respuesta): integrarlo en una app de chat para sugerir respuestas cortas al estilo del usuario, aprovechando que el entrenamiento cubre turnos de ambos lados de la conversación.
- Prototipado de tono de producto: sirve para comparar checkpoints (`v2_lr5e-5_e3` frente a otras variantes) con una configuración de muestreo fija (temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5) y decidir qué estilo se lanza.
- Investigación sobre destilación de estilo: la receta mezcla datos sintéticos de GLM-5.3 con 380 conversaciones humanas reales de REALTALK y publica los hiperparámetros y el dataset sintético (`v2_train.jsonl`), lo que permite reproducir o auditar el pipeline.
- Base para nuevos adaptadores de estilo: al ser un LoRA pequeño (repo de 0,1 GB) sobre un base de 4B, se puede reentrenar con otro registro (formal, técnico, otro idioma) reutilizando la plantilla y el esquema de pérdida.
- Evaluación de adaptadores LoRA en producción: útil como caso de prueba para medir cómo se comporta un adaptador de estilo bajo vLLM o MLX, incluyendo el efecto de `presence_penalty` (opción disponible en vLLM/MLX pero sin equivalente directo en `transformers`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la configuración de muestreo usada en las evaluaciones internas (temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5, máximo 512 tokens nuevos y 3.072 de entrada), sin cifras de calidad, latencia o throughput.

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el coste real está en el modelo base de 4B.
- VRAM estimada para inferencia del base en bf16: del orden de 8 GB solo para pesos, más caché KV para 2.048-3.072 tokens. Con la variante MLX 2-bit el espacio se reduce de forma sustancial, aunque no se publican cifras exactas.
- GPU recomendadas: A100 o H100 para servir varias réplicas; RTX 4090 (24 GB) para desarrollo y pruebas con margen; RTX 3090/4080 (16-24 GB) sin problema.
- ¿Cabe en GPU de consumo? Sí: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB deberían alojar el base en bf16 con contexto de 2-3k tokens; en tarjetas de 8 GB habría que recurrir a cuantización del base.
- Despliegue: `transformers` + `peft` (receta de la model card), vLLM con soporte de adaptadores LoRA (el autor cita `presence_penalty` como opción de vLLM), y MLX en Apple Silicon, que es la ruta coherente con el uso en iPhone. Para llama.cpp u Ollama habría que fusionar el adaptador con el base y convertir a GGUF; no se documenta ese procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orizon-fun/Button-4B-Tone | Base 4B + LoRA r=16 | Entrenamiento 2.048; evaluación 3.072+512 | Adaptador de estilo conversacional (inglés) | Apache-2.0 | HuggingFace, 0 descargas |
| prism-ml/Ternary-Bonsai-4B-unpacked | 4B | No disponible | Modelo base, pesos ternarios desempaquetados a FP16 | Apache-2.0 (según el adaptador) | HuggingFace |
| prism-ml/Ternary-Bonsai-4B-mlx-2bit | 4B | No disponible | Variante MLX 2-bit del base, orientada a Apple Silicon | No disponible en la información | HuggingFace |

No se dispone de datos para comparar con otros adaptadores de estilo o con modelos de chat de 4B de la competencia (parámetros, contexto, benchmarks o licencia): no disponible.

## Limitaciones y advertencias

- Solo inglés. El adaptador se entrenó con datos en inglés y la plantilla de fecha asume formato en_US; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Es un adaptador de estilo, no de conocimiento: no mejora razonamiento, matemáticas ni código, y hereda los sesgos y las limitaciones del base ternario de 4B.
- Riesgo de alucinación en cualquier consulta factual, agravado por respuestas cortas y coloquiales que pueden sonar seguras sin estarlo.
- Sin tools en el entrenamiento: el soporte de `web_search`, `google_maps`, `search_email` y `calendar_events` depende de texto y esquemas añadidos en la app. No hay garantía de que el adaptador respete el formato de llamada ni la instrucción de citar URLs, porque no lo vio durante el ajuste.
- El system prompt debe reproducirse casi literalmente (incluida la fecha en el formato indicado) para obtener el comportamiento esperado; desviarse de él degrada el estilo y el uso de emojis.
- `enable_thinking=False` es obligatorio, tal como en el entrenamiento; activar el bloque de pensamiento saca al modelo de la distribución vista.
- `presence_penalty=1,5` no tiene equivalente directo en `transformers`, así que la reproducción exacta del muestreo requiere vLLM o MLX. Los resultados en `transformers` pueden diferir de la app.
- Datos mayoritariamente sintéticos (4.648 de 5.028 filas generadas con GLM-5.3): posible transferencia de estilo del generador y de sus sesgos, además de dudas sobre las condiciones de uso de las salidas del modelo destilador que no se aclaran en la model card.
- Corpus pequeño (5.028 filas) y una sola configuración publicada (`v2_lr5e-5_e3`); no hay evaluación cuantitativa del estilo ni comparación con las reglas de prompt que sustituye.
- Licencia Apache-2.0 permite uso comercial, pero el autor la declara "igual que el modelo base" y la información disponible no incluye los términos del corpus REALTALK más allá de su licencia Apache-2.0 en el repositorio original.
- Repositorio con 0 descargas: sin validación externa ni reportes de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orizon-fun/Button-4B-Tone
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-4B-unpacked
- Variante MLX 2-bit del base: https://huggingface.co/prism-ml/Ternary-Bonsai-4B-mlx-2bit
- Dataset sintético de entrenamiento: https://huggingface.co/datasets/orizon-fun/realtalk-style-chats
- Corpus humano REALTALK (repositorio): https://github.com/danny911kr/REALTALK
- Paper REALTALK (Lee et al., 2025): https://arxiv.org/abs/2502.13270
- Nota: las búsquedas web realizadas devolvieron únicamente páginas de empresas francesas homónimas (Groupe Orizon, Orizo, Orizon Group) sin relación con este modelo; no se han encontrado papers, blogs ni demos adicionales del adaptador.
