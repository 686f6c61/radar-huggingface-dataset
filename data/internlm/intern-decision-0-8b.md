# internlm/Intern-Decision-0.8B

## Resumen

Intern-Decision-0.8B es un modelo multimodal de predicción estructurada desarrollado por InternLM, un laboratorio de investigación de IA (con origen en Shanghai AI Laboratory). Se trata de un ajuste fino supervisado de Qwen3.5-0.8B, un transformer denso de aproximadamente 853 millones de parámetros. A diferencia de los modelos generativos convencionales, Intern-Decision no produce texto libre: recibe un estado compartido, un esquema de preguntas con nombre y, opcionalmente, imágenes, y devuelve en un único forward pass una distribución de probabilidad sobre las opciones de cada pregunta.

El modelo resuelve un problema concreto: la toma de decisiones estructurada y tipada dentro de pipelines. En lugar de pedir a un LLM que genere JSON y confiar en el parseo, Intern-Decision puntúa directamente los candidatos permitidos de cada campo mediante un objetivo de masked-next-token, aplica una calibración de probabilidades propia del checkpoint y devuelve JSON tipado. Esto elimina la posibilidad de respuestas fuera de esquema y permite obtener, además de la decisión, una medida de confianza calibrada (Brier score y ECE reportados).

Su relevancia actual radica en tres factores: el tamaño reducido (0,8B), la latencia medida de 33,98 ms de media por consulta en una RTX 4090 y una licencia Apache 2.0 que permite uso comercial. Está pensado como componente de enrutamiento, clasificación y decisión dentro de sistemas de agentes, no como modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5, tag `qwen3_5`), multimodal image-text-to-text |
| Parametros totales | 852.985.920 (aprox. 0,85B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer causal denso con capacidad de entrada de imagen y texto. Intern-Decision lo reorienta mediante ajuste fino hacia un objetivo de decisión enmascarada: el prompt se renderiza con la plantilla de chat del checkpoint (incluido un bloque de pensamiento vacío) y un esqueleto JSON de asistente con un marcador `<decision>` por cada campo. Los logits se leen en la posición inmediatamente anterior a cada marcador y se aplica softmax únicamente sobre los logits de los símbolos candidatos permitidos para ese campo (mapeados a `A`–`Z`, `a`–`z`, `0`–`9`). Posteriormente se aplica una calibración de probabilidad específica del checkpoint.

El modelo no invoca `generate()` ni muestrea texto libre: la inferencia es un único forward pass causal con scoring estructurado de candidatos. El compilador de inferencia usa solo `state`, `questions` e `images` opcionales, y no se insertan respuestas de referencia en el prompt. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; la model card no lo detalla. El informe técnico referenciado (arXiv:2610.22131) es la fuente indicada para esos detalles.

## Capacidades

- Predicción estructurada de múltiples campos en un solo forward pass, con tipos de pregunta `choice` (opciones ordenadas con descripción), `score` (lista o claves numéricas finitas) y `noul` (binaria no/yes).
- Salida de distribución de probabilidad por campo, con calibración de confianza (Brier y ECE reportados).
- Entrada multimodal: acepta imágenes junto con el estado textual.
- Decisiones tipadas y compatibles con JSON, con mapeo de símbolos de vuelta a los valores originales de cada opción.
- Puntuación de candidatos restringida al esquema: no puede emitir opciones fuera de las permitidas.
- Compatible con endpoints (`endpoints_compatible` en los tags) y con la librería transformers.
- No soporta generación de texto libre, tool calling generativo ni razonamiento multi-paso conversacional; su función es exclusivamente el scoring estructurado.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y un esquema con campos `team` (choice), `urgency` (score) y `refund_requested` (noul), devolviendo la asignación y la prioridad con confianza calibrada en una sola pasada de 34 ms.
- Clasificación de correo entrante en pipelines de atención: mapear categorías y subcategorías con opciones predefinidas, evitando respuestas fuera de taxonomía que romperían el parseo aguas abajo.
- Moderación y triaje de contenido: usar campos binarios (`noul`) para decidir si un caso requiere revisión humana, con umbrales derivados de la probabilidad calibrada.
- Decisión multimodal en inspección: adjuntar una imagen (por ejemplo, una captura o un producto) junto al estado textual y puntuar campos como categoría de defecto o severidad.
- Componente de decisión en agentes: dado el estado de la conversación y un esquema de acciones posibles, seleccionar la siguiente acción de forma determinista y tipada, sin generación libre.
- Enrutamiento de consultas en sistemas RAG: clasificar la intención y el dominio de la consulta para dirigirla al índice o al subagente adecuado.
- Evaluación de riesgo con umbrales: usar `score` con criterios numéricos para asignar niveles de prioridad y calibrar umbrales de escalado con las probabilidades del modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes de acierto; Brier y ECE menores es mejor):

| Modelo | Jevbench-Easy | Jevbench-Original | Jevbench-Hard | Typed Decision | ToolACE | AG News | WildJailBreak | Average | Brier ↓ | ECE ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jev | 100.00 | 98.61 | 72.07 | 73.35 | 91.29 | 89.57 | 96.29 | 88.74 | 0.358 | 0.095 |
| Laya | 95.83 | 72.22 | 28.83 | 35.95 | 63.87 | 92.84 | 14.84 | 57.77 | 0.804 | 0.246 |
| SemIf | 100.00 | 98.61 | 61.26 | 62.80 | 85.16 | 89.22 | 92.53 | 84.23 | 0.498 | 0.112 |
| Kev | 100.00 | 93.06 | 45.05 | 65.60 | 87.42 | 89.82 | 75.97 | 79.56 | 0.738 | 0.262 |
| JevK5 | 100.00 | 97.22 | 73.87 | 64.50 | 80.97 | 89.13 | 90.45 | 85.16 | 0.366 | 0.047 |
| Intern-Decision-0.8B | 97.92 | 80.56 | 52.25 | 77.35 | 94.52 | 88.61 | 64.48 | 79.38 | 0.530 | 0.066 |
| Intern-Decision-2B | 100.00 | 84.72 | 63.96 | 79.35 | 96.45 | 89.96 | 78.33 | 84.68 | 0.437 | 0.100 |
| Intern-Decision-4B | 100.00 | 98.61 | 73.87 | 80.55 | 96.45 | 90.82 | 89.86 | 90.02 | 0.347 | 0.065 |

Latencia por consulta medida en una única RTX 4090 con la ruta de inferencia HF local:

| Modelo | Media | Mediana / P50 | P95 |
|---|---:|---:|---:|
| Jev | 109,70 ms | 106,30 ms | 146,70 ms |
| Intern-Decision-0.8B | 33,98 ms | 33,44 ms | 37,50 ms |
| Intern-Decision-2B | 33,28 ms | 33,15 ms | 33,55 ms |
| Intern-Decision-4B | 44,16 ms | 44,03 ms | 44,60 ms |

## Requisitos de hardware

- VRAM estimada: el repo pesa 1,7 GB en safetensors; en fp16 se requiere aproximadamente 1,7 GB de pesos más el overhead de activaciones y el codificador visual, por lo que 4 GB de VRAM son un punto de partida razonable (estimación, no dato publicado).
- GPU recomendadas: RTX 4090 (latencia reportada), A100 y H100 para despliegues con concurrencia. Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores.
- Despliegue: el autor distribuye un módulo `inference.py` con la clase `DecisionEngine` (backend `hf` como único backend implementado). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el flujo de scoring por logits no encaja directamente en servidores de generación estándar.
- Latencia y throughput: 33,98 ms de media, 33,44 ms de mediana y 37,50 ms de P95 por consulta en una RTX 4090 (carga y hardware dependientes). El throughput concurrente no está publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Average (bench) | Brier ↓ | ECE ↓ | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| Intern-Decision-0.8B | 0,85B | no disponible | 79,38 | 0.530 | 0.066 | Apache 2.0 | HF (internlm) |
| Intern-Decision-2B | no disponible | no disponible | 84,68 | 0.437 | 0.100 | no disponible | HF (internlm) |
| Intern-Decision-4B | no disponible | no disponible | 90,02 | 0.347 | 0.065 | no disponible | HF (internlm) |
| Jev | no disponible | no disponible | 88,74 | 0.358 | 0.095 | no disponible | no disponible |
| JevK5 | no disponible | no disponible | 85,16 | 0.366 | 0.047 | no disponible | no disponible |

La comparativa interna muestra un compromiso claro: la variante 0.8B pierde precisión media frente a 2B y 4B (79,38 frente a 84,68 y 90,02), pero mantiene la latencia más baja del catálogo y una calibración competitiva (ECE 0.066). Frente a Jev, el 0.8B es más rápido (33,98 ms frente a 109,70 ms) y mejor en ToolACE y Typed Decision, pero peor en WildJailBreak y en el promedio global.

## Limitaciones y advertencias

- No es un modelo generativo: no admite `generate()`, texto libre, tool calling generativo ni conversación multi-turno. Usarlo fuera del flujo de scoring estructurado produce resultados inválidos.
- La precisión cae en escenarios difíciles: 52,25 en Jevbench-Hard y 64,48 en WildJailBreak, muy por debajo de las variantes 2B y 4B (78,33 y 89,86 en WildJailBreak). Para decisiones de seguridad o alta complejidad conviene evaluar el 4B.
- La calibración depende del checkpoint: el módulo de inferencia debe emparejarse con el tamaño seleccionado, ya que la calibración de probabilidad es específica de cada uno.
- El Brier score del 0.8B (0.530) es notablemente peor que el de JevK5 (0.366) y el 4B (0.347), lo que indica menor fiabilidad de las probabilidades absolutas en ciertos dominios.
- La longitud de contexto no está publicada; los estados largos o con muchas preguntas simultáneas pueden degradar el rendimiento y deben validarse empíricamente.
- Los idiomas soportados no están documentados; no hay garantía de rendimiento fuera del inglés sin evaluación previa.
- Riesgo de sesgo y alucinación acotado por el esquema (solo puede elegir entre opciones permitidas), pero la selección puede ser incorrecta o sobreconfiada en dominios no representados en el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B y del informe técnico para obligaciones adicionales.
- Requiere Python 3.12+ y las dependencias de `requirements.txt` en un entorno PyTorch/CUDA adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/internlm/Intern-Decision-0.8B
- Demo (Space): https://huggingface.co/spaces/internlm/intern-decision
- Colección de pesos: https://huggingface.co/collections/internlm/intern-decision
- Repositorio GitHub: https://github.com/internlm/Intern-Decision
- Informe técnico: https://arxiv.org/abs/2610.22131
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
