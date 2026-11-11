# nchapman/GLiDE-2B-W4A16-HGPTQ

## Resumen

GLiDE-2B-W4A16-HGPTQ es una versión cuantizada a 4 bits del modelo fastino/GLiDE-2B, un modelo de decisión de un solo paso (single-pass decision model) desarrollado por Fastino y publicado bajo licencia Apache 2.0. La cuantización la firma nchapman y utiliza una receta GPTQ con rotación Walsh-Hadamard y descomposición de Cholesky (W4A16-HGPTQ, group size 64), empaquetada con compressed-tensors para su uso directo con transformers.

El modelo base GLiDE-2B emplea una arquitectura híbrida de 24 capas con hidden_size de 2048, combinando GatedDeltaNet (atención lineal recurrente) con capas de atención completa, y una cabeza de lectura específica (code-readout-v1) de 255 códigos que convierte el estado del modelo en distribuciones de probabilidad sobre opciones de decisión. No es un modelo generativo de texto al uso: está diseñado para responder preguntas estructuradas de tipo choice, yes_no, multi_select y scale sobre un estado o contexto dado.

La relevancia de esta variante radica en la compresión: reduce el checkpoint BF16 de 3,51 GiB a 1,63 GiB (2,15× más pequeño) manteniendo un 100,00 % de acuerdo top-1 en decisiones y una similitud coseno de logits de lectura de 0,999073 frente a la referencia BF16. Esto lo hace adecuado para despliegues con restricciones de memoria, aunque el checkpoint publicado es solo de texto (sin capas visuales cuantizadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas con GatedDeltaNet (atención lineal) + atención completa; cabeza de lectura code-readout-v1 (255 códigos) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ con rotación Walsh-Hadamard 64×64 (H_64) y Cholesky GPTQ, group_size=64, actorder=static, dampening_frac=0,01; empaquetado con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, claves canónicas `model.language_model.*`) |

## Arquitectura y entrenamiento

El modelo base GLiDE-2B es un transformer híbrido de 24 capas con hidden_size de 2048 que intercala bloques GatedDeltaNet (atención lineal con estado recurrente) y bloques de atención completa. La innovación principal es su naturaleza de decision model: en lugar de generar texto token a token, realiza un único forward pass y utiliza una cabeza de lectura lineal (`readout.safetensors`, matriz de 255×2048) que produce logits sobre 255 códigos de decisión. Sobre esa cabeza se construyen distribuciones de probabilidad normalizadas para cada pregunta y opción, lo que permite evaluar tareas de elección, sí/no, selección múltiple y escala.

Esta variante cuantizada aplica una rotación de entrada Walsh-Hadamard de Sylvester de 64×64 (alineada con head_dim=64) antes de GPTQ con inicialización por error cuadrático medio y descomposición de Cholesky, calibrando capa a capa bajo atención no causal completa. Se cuantizan 150 capas lineales del modelo de lenguaje; se mantienen en BF16 el embedding de tokens, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, las normas, los sesgos y la propia cabeza de lectura. No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Decisión estructurada de un solo paso sobre preguntas de tipo `choice`, `yes_no`, `multi_select` y `scale`.
- Clasificación de intención y extracción de decisiones a partir de un estado textual (por ejemplo, el historial de una conversación o un registro de pedido).
- Puntuación de opciones mediante distribuciones de probabilidad sobre 255 códigos de lectura, con medias de permutación directa e inversa para mitigar sesgos posicionales.
- Procesamiento de contexto multi-turno en un único forward pass (sin generación autoregresiva).
- Capacidad multimodal declarada en el pipeline (`image-text-to-text`) por herencia del modelo base, pero este checkpoint concreto es solo de texto: no se cuantizaron capas visuales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado explícitamente para decisión de un solo paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de intención en atención al cliente: dado el texto de una consulta, el modelo decide entre categorías predefinidas (facturación, devolución, incidencia técnica) en un único paso, con latencia baja gracias a la compresión a 1,63 GiB y a la atención lineal de GatedDeltaNet.
- Moderación y clasificación de contenido: formular preguntas yes_no o scale sobre un mensaje para obtener una decisión binaria o graduada con probabilidad asociada, útil en pipelines de revisión automatizada.
- Extracción de decisiones en procesos de negocio: a partir de un estado textual (por ejemplo, "pedido #4412 entregado a tiempo, solicitó copia de factura"), el modelo responde qué acción procede, integrándose en sistemas de ticketing o CRM.
- Evaluación de respuestas en pipelines de datos sintéticos: usar la cabeza de 255 códigos para puntuar opciones de un conjunto y filtrar por umbral de probabilidad antes de un paso de generación posterior.
- Despliegue en hardware con memoria limitada: al ocupar 1,63 GiB en W4A16, cabe en GPUs de consumo con 8 GB o más, lo que permite ejecutar decisiones locales en entornos de borde o estaciones de trabajo sin GPU de datacenter.
- Clasificación de turnos en asistentes conversacionales: decidir si el usuario quiere continuar, escalar a un humano o cambiar de tema, aprovechando el contexto acumulado en un solo forward pass sin coste de decodificación autoregresiva.
- Control de calidad en pipelines de anotación: comparar la decisión del modelo con la etiqueta humana sobre tareas de elección múltiple y usar la divergencia KL de opciones como señal de confianza.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización, comparando frente al modelo base BF16 en la evaluación single-pass `code-readout-v1` (12 preguntas, con media de permutación directa e inversa):

| Evaluación | BF16 base (fastino/GLiDE-2B) | GLiDE-2B-W4A16-HGPTQ |
|---|---:|---:|
| Tamaño safetensors (incl. readout) | 3,51 GiB (3.764.736.616 B) | 1,63 GiB (1.750.331.856 B) |
| Acuerdo top-1 en decisiones (12 preguntas) ↑ | 100,00 % | 100,00 % |
| Divergencia KL de probabilidad de opciones (media / máx, nats) ↓ | 0,000000 | 0,000158 / 0,000933 |
| Similitud coseno de logits de lectura de 255 códigos ↑ | 1,000000 | 0,999073 |
| KL de softmax sobre 255 códigos (nats) ↓ | 0,000000 | 0,002010 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,63 GiB de pesos más overhead de activaciones y contexto; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para uso cómodo; RTX 3060/4060, RTX 4090, A100 y H100 son válidas. El modelo es pequeño incluso para GPUs de datacenter.
- Cabe en GPU de consumo: sí, en RTX 3060 8 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers con compressed-tensors (carga verificada con `Qwen3_5Model.from_pretrained`, `Glide.from_pretrained` y `warp-34`), además de endpoints compatibles. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles de forma numérica; al tratarse de un único forward pass sin decodificación autoregresiva, la latencia esperada es la de una pasada de ~1,88 B parámetros con 24 capas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-2B-W4A16-HGPTQ (esta ficha) | ~1,88 B (W4A16) | no disponible | Decision model híbrido GatedDeltaNet + atención | Apache 2.0 | Hugging Face (nchapman) |
| fastino/GLiDE-2B (base BF16) | ~1,88 B | no disponible | Decision model híbrido | Apache 2.0 | Hugging Face (fastino) |
| Modelos de clasificación tipo encoder (p. ej. DeBERTa) | 0,1–1,5 B típicamente | 512–4k tokens típicamente | Encoder discriminativo | MIT / Apache 2.0 según variante | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros, tipo y licencia.

## Limitaciones y advertencias

- El checkpoint es solo de texto: no incluye capas visuales cuantizadas, pese a que el pipeline declarado sea `image-text-to-text`. No debe esperarse comportamiento multimodal en esta variante.
- No es un modelo generativo: no produce texto libre, solo distribuciones sobre códigos de decisión. No puede usarse como chatbot ni para generación de código.
- La evaluación de calidad reportada se basa en 12 preguntas de decisión; es una muestra pequeña y no cubre dominios amplios ni idiomas distintos del inglés (idiomas no declarados).
- Riesgo de alucinación en el sentido de decisiones incorrectas con alta confianza: la cabeza de lectura siempre devuelve una distribución sobre 255 códigos, incluso ante entradas fuera de distribución.
- La cuantización introduce una divergencia KL media de 0,000158 nats y máxima de 0,000933 en la distribución de opciones; en tareas sensibles a probabilidades calibradas conviene validar contra el modelo BF16.
- Sesgos conocidos: no disponibles en la información proporcionada; al no documentarse la composición del dataset de entrenamiento, no puede evaluarse el sesgo de dominio.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base fastino/GLiDE-2B y del código de inferencia (`glide`, `warp-34`).
- Longitud de contexto no documentada: planificar el despliegue con validación empírica de la ventana efectiva antes de usarlo con estados largos.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/nchapman/GLiDE-2B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/fastino/GLiDE-2B
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Repositorio GPTQ: https://github.com/IST-DASLab/gptq
- Papers, blogs, demos y repositorios adicionales: no disponibles en la información proporcionada.
