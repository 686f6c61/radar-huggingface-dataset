# netprojects/GLiDE-mlx-8bit

## Resumen

GLiDE 27B es un modelo de decisión desarrollado por Fastino, construido sobre el modelo base Qwen3.8-27B (Qwen3.5), y esta ficha concreta es la conversión a 8 bits en formato MLX realizada por NetProjects (Internet Projects Ltd), pensada para Apple Silicon. A diferencia de un modelo conversacional, GLiDE no genera texto: recibe un estado (texto, JSON o imágenes) y una batería de preguntas tipadas (`choice`, `noul` para sí/no, y `score`) y devuelve, en un único forward pass por pregunta, una probabilidad para cada opción. Esto lo convierte en una herramienta de calibración y clasificación probabilística, no en un chatbot.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de 26.085.330.160 parámetros en un Mac con Apple Silicon con un peso de 28,2 GB, manteniendo una fidelidad casi exacta respecto a los pesos originales en bf16 de Fastino (203 de 204 preguntas con la misma respuesta principal y una diferencia media de probabilidad de 0,002). El checkpoint está empaquetado en safetensors y requiere un servidor específico (`glide-mlx`), no los generadores genéricos de MLX, porque GLiDE lee su respuesta de un readout separado de 255 vías y sus capas de atención completa procesan el prompt de forma bidireccional.

La arquitectura combina capas de atención completa no causal con capas Gated DeltaNet, e incorpora un mecanismo "midloop" en el que las capas 24–35 y 36–47 se ejecutan dos veces y se mezclan en float32. El modelo está publicado bajo la licencia Fastino Community, con requisitos de atribución para uso comercial y un umbral de ingresos anuales de 10 millones de dólares para uso comercial en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de atención completa no causal + 48 capas Gated DeltaNet, con midloop en capas 24–35 y 36–47 |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (los prompts de JevBench llegan a unos 4K tokens) |
| Tipos de cuantizacion | 8 bits afín (affine), group size 64; existe versión 4 bits (15,3 GB) |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (fastino-community) |
| Formato de pesos | safetensors (MLX), readout separado en `readout.safetensors` |

## Arquitectura y entrenamiento

GLiDE 27B se apoya en Qwen3.8-27B (familia Qwen3.5, licencia Apache-2.0) y lo adapta a una tarea de decisión probabilística. La arquitectura es híbrida: 16 capas de atención completa que ven todo el prompt sin máscara causal (equivalente a `noncausal_full_attention` de GLiDE) y 48 capas Gated DeltaNet que mantienen su recurrencia. Las capas 24–35 y 36–47 se ejecutan dos veces y se combinan en float32 (midloop), un patrón poco habitual que forma parte del diseño original de Fastino.

La salida no es texto generado: el estado oculto del último token pasa por un readout de 255 vías mantenido a su precisión original, y se aplica softmax sobre las opciones a la temperatura definida en `decision_config.json`. La conversión MLX conserva el codificador de visión a su precisión original y reutiliza sin cambios los módulos `prompt.py` e `images.py` de GLiDE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación probabilística de estados: devuelve una probabilidad por opción para preguntas de tipo `choice`, en un solo forward pass.
- Preguntas booleanas (`noul`): responde sí/no con probabilidad calibrada.
- Preguntas de puntuación (`score`): asigna una puntuación numérica calibrada.
- Entrada multimodal: acepta estados en texto, JSON e imágenes (pipeline `image-text-to-text`).
- Procesamiento bidireccional del prompt en las capas de atención completa, útil para estados largos y estructurados.
- API compatible con el servidor de GLiDE mediante `POST /v1/systemone`.
- No genera texto libre: no es un modelo conversacional ni de chat.
- No se documenta soporte de tool calling ni de agentes multi-step en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una reclamación, preguntar `choice` sobre la intención (reembolso, cambio, información) y `noul` sobre el tono del cliente, obteniendo probabilidades directamente utilizables para priorizar la cola.
- Moderación y triaje de contenido: clasificar mensajes en categorías predefinidas con umbrales de confianza calibrados, lo que permite derivar automáticamente los casos ambiguos a revisión humana.
- Extracción de decisiones en pipelines de datos: procesar lotes de estados en JSON y obtener etiquetas probabilísticas sin generación de texto, lo que reduce coste y latencia frente a un LLM generativo.
- Validación de formularios y documentos con imagen: usar la entrada multimodal para decidir si una captura o documento cumple criterios (por ejemplo, si una factura contiene los campos requeridos) mediante preguntas `noul`.
- Scoring de riesgo en flujos de negocio: asignar una puntuación calibrada a cada caso (por ejemplo, probabilidad de impago o de fraude) y ordenar la cola de revisión por esa puntuación.
- Evaluación de agentes y sistemas: emplear el modelo como juez probabilístico en benchmarks de decisión, dado su rendimiento medido en JevBench (213/231 en la versión pública v1.2.1).
- Despliegue local en Apple Silicon: prototipado y ejecución en un MacBook Pro M5 Max con 128 GB, con un tiempo mediano de 0,46 s por ítem de JevBench para prompts de hasta unos 4K tokens.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Coincidencia con el código PyTorch bf16 de Fastino (misma respuesta principal) | 203 / 204 preguntas; diferencia media de probabilidad 0,002 |
| Preguntas sí/no y de puntuación idénticas al original | 132 / 132 |
| JevBench público (231 ítems, v1.2.1, `--adapter typesafe`) | 213 / 231 (easy 48/48 · standard 72/72 · hard 93/111) |
| Tiempo por ítem de JevBench (prompts hasta ~4K tokens) | 0,46 s de mediana |

La única discrepancia frente al código de referencia es un empate exacto en el propio original (margen top-2 de 0,000). El conjunto de comparación incluye 72 peticiones con 204 preguntas, estados de texto y JSON de 30 a 1.500 palabras, 12 peticiones con imagen y los tres tipos de pregunta. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible, lo cual es coherente con que GLiDE no sea un modelo generativo.

## Requisitos de hardware

- Peso en disco: 28,2 GB para el checkpoint de 8 bits; 15,3 GB para la versión de 4 bits.
- VRAM/unified memory estimada: al menos 28,2 GB para los pesos en 8 bits, más overhead de activaciones y del codificador de visión; en la práctica se ha validado en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (probado en M5 Max). No se documenta soporte para A100, H100 ni RTX 4090, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? En Apple Silicon con memoria unificada suficiente, sí; en GPUs NVIDIA de consumo no está soportado por este checkpoint.
- Despliegue: servidor `glide-mlx` (v0.2.0 o superior) mediante `python -m glide_mlx.server`; no usar `mlx_lm.server` ni `mlx_vlm` generate genéricos.
- Latencia: 0,46 s de mediana por ítem de JevBench con prompts de hasta ~4K tokens en M5 Max. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE 27B MLX 8-bit (esta ficha) | 26,09 B | no disponible | Decisión probabilística multimodal | Fastino Community | Hugging Face (MLX) |
| GLiDE 27B MLX 4-bit | 26,09 B | no disponible | Decisión probabilística multimodal | Fastino Community | Hugging Face (MLX), 15,3 GB |
| fastino/GLiDE-27B (original) | 26,09 B | no disponible | Decisión probabilística multimodal | Fastino Community | Hugging Face (bf16) |
| Qwen3.8-27B (modelo base) | ~27 B | no disponible | LLM generativo | Apache-2.0 | Hugging Face |

La comparación con modelos de decisión alternativos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto libre ni mantiene conversaciones; usarlo como LLM produce resultados incorrectos.
- Requiere el servidor `glide-mlx`; los snippets genéricos de MLX no reproducen el comportamiento correcto (readout de 255 vías y atención bidireccional).
- La licencia Fastino Community exige mostrar "Built with Fastino GLiDE" en uso comercial y un acuerdo separado con Fastino para uso comercial en producción por entidades con ingresos anuales superiores a 10 millones de dólares.
- Esta conversión es una obra derivada y se distribuye bajo los mismos términos que el original; incluye `LICENSE`, `NOTICE` y `licenses/Qwen3.8-27B-LICENSE`.
- El autor de la conversión (NetProjects) no está afiliado a Fastino.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas en dominios fuera de la distribución de entrenamiento; no se documentan garantías de calibración fuera de JevBench.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe.
- Longitud de contexto máxima: no disponible; los resultados reportados se limitan a prompts de hasta unos 4K tokens.
- El checkpoint de 8 bits requiere al menos 28,2 GB de memoria; en equipos con menos memoria unificada debe usarse la versión de 4 bits.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/netprojects/GLiDE-27B-MLX-8bit
- Modelo base original: https://huggingface.co/fastino/GLiDE-27B
- Conversión 4 bits: https://huggingface.co/netprojects/GLiDE-27B-MLX-4bit
- Servidor y librería glide-mlx: https://github.com/internet-projects/glide-mlx
- NetProjects: https://netprojects.com
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- JevBench (referenciado en la model card; sin URL directa en la información disponible)
