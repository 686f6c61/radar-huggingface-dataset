# baselabs/joey-1

## Resumen

joey-1 es un modelo de decisión de 2B parámetros post-entrenado por Base Labs (Baseten) a partir de Qwen3.5-2B. A diferencia de un LLM generativo convencional, está diseñado para responder un conjunto de preguntas sobre un estado de entrada (texto, opcionalmente con imágenes) y devolver probabilidades calibradas para cada opción, resolviendo todas las preguntas en una única pasada de prefill con prefijo compartido. Esto lo convierte en una alternativa eficiente a usar LLM grandes para tareas de clasificación, enrutamiento y guardrails.

Su relevancia reside en el nicho de la "decisión" en producción: moderación, enrutado de tickets, calibración de confianza y abstención ("I don't know"), a un coste muy bajo (0,01 USD por millón de tokens de entrada en Baseten). En el Jev Decision Index 0.4 (split público) obtiene 63,30, el mejor modelo por debajo de 4B y el puesto 37 de 230 modelos evaluados, y 62,9 en una réplica del Artificial Analysis Decision Index.

Es un modelo multimodal (texto e imagen) con arquitectura basada en Qwen3.5-2B, longitud máxima de secuencia de 16.384 tokens, licencia MIT y pesos en safetensors. Tiene dos hermanos mayores para tareas que requieren más conocimiento general: elephant-1 (9B) y mammoth-1 (27B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-2B, post-entrenado como decision model (pipeline text-classification) |
| Parametros totales | 2.721.801.024 (2,7B, dato de safetensors) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (5,5 GB de repo) |

## Arquitectura y entrenamiento

joey-1 parte de Qwen3.5-2B y aplica un fine-tune completo del modelo de lenguaje sobre ejemplos de decisión en texto e imagen; el encoder de visión permanece congelado. Una innovación destacable es el uso de una máscara de atención block-bidirectional en las capas de full attention, que permite responder todas las preguntas de una petición desde un único prefill con prefijo compartido, en lugar de generar tokens secuencialmente. Las peticiones que exceden los límites de longitud entrenados se rechazan, no se truncan.

El entrenamiento usó 6,21 millones de ejemplos de decisión (Mix 8), compuestos por un 58,3 % de habilidades de decisión núcleo, 16,1 % de seguridad y abstención, 16,1 % de evaluación (judging) y dominios de experto, y 9,5 % de datos de decisión públicos. La función de objetivo combina cross-entropy con un término de calibración Brier (λ = 1) e incluye una opción entrenada de "I don't know" para la abstención. El entrenamiento constó de 1 época (43.390 pasos), LR pico de 1e-5, optimizador AdamW (β 0,9/0,95, sin weight decay), 3 % de warm-up, decaimiento coseno y precisión bf16, sobre 2 nodos con 8 H100 cada uno (16 GPU en total).

## Capacidades

- Clasificación binaria calibrada (`noul`): devuelve P(sí) para preguntas de tipo sí/no.
- Clasificación multiclase (`choice`): selecciona entre opciones nombradas con descripciones y devuelve la elección junto con probabilidades.
- Puntuación ordinal (`score`): asigna un nivel ordenado (por ejemplo, urgencia) con probabilidades por nivel.
- Respuesta a múltiples preguntas en una sola pasada: todas las preguntas se resuelven desde un prefill con prefijo compartido, reduciendo latencia y coste.
- Calibración de probabilidades: entrenamiento con término Brier y opción de abstención "I don't know".
- Entrada multimodal: acepta texto e imágenes (encoder de visión congelado, heredado de Qwen3.5-2B).
- Guardrails y enrutamiento: diseñado para moderación, clasificación de intenciones y enrutado de solicitudes en producción.

## Casos de uso

- Enrutado de tickets de soporte: clasifica cada mensaje de cliente por equipo destino (facturación, técnico, fraude) y urgencia en una sola pasada, como muestra el ejemplo de la model card, gracias a la respuesta multi-pregunta con prefill compartido.
- Detección de intención en atención al cliente: preguntas binarias calibradas ("¿el cliente pide un reembolso?") con P(sí) explícita, útil para automatizar flujos con umbrales de confianza.
- Guardrails de seguridad en pipelines LLM: clasifica entradas y salidas de modelos grandes (toxicidad, uso indebido, inyección de prompts) a bajo coste, con abstención integrada para casos dudosos.
- Moderación de contenido multimodal: analiza texto e imágenes (por ejemplo, capturas o imágenes de usuario) para decidir si cumplen políticas, aprovechando la entrada de visión.
- Judging y evaluación de modelos: su entrenamiento incluye un 16,1 % de datos de judging, adecuado para puntuar respuestas de otros LLM en pipelines de evaluación automática.
- Clasificación y enriquecimiento de documentos: etiquetado masivo de textos con múltiples campos (categoría, prioridad, sentimiento) en batch, con probabilidades calibradas para decidir cuándo escalar a revisión humana.
- Enrutado de consultas en sistemas RAG: decide si una consulta requiere recuperación, qué índice consultar o si debe escalarse a un modelo más grande (elephant-1 o mammoth-1).

## Benchmarks y rendimiento

Jev Decision Index 0.4 (split público):

| Modelo | Decision Index |
|---|---:|
| elephant-1 | 72,24 |
| **joey-1** | **63,30** |
| Cloudflare Clef | 61,71 |
| Jev 1.14 | 60,70 |
| Perplexity Decider Flash v1.2 | 60,06 |

Artificial Analysis Decision Index (réplica de Baseten):

| Modelo | Puntuacion |
|---|---:|
| mammoth-1 | 65,9 |
| elephant-1 | 65,2 |
| d1-ultra | 65 |
| **joey-1** | **62,9** |

joey-1 es el mejor modelo por debajo de 4B en el Jev Decision Index 0.4 (puesto 37 de 230). Supera a Jev 1.14 en cuatro de cinco áreas (language, tools & automation, retrieval & classification, arts & human taste) y queda por detrás de elephant-1 en todas.

## Requisitos de hardware

- VRAM estimada: con 2,7B parámetros en bf16, el repo ocupa 5,5 GB; una GPU con 8-12 GB de VRAM debería ser suficiente para inferencia, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU CUDA moderna; el runtime de serving oficial requiere una GPU CUDA y la imagen `pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel`.
- Consumer GPU: dado su tamaño reducido (2,7B), debería funcionar en GPUs de consumo como una RTX 3060 de 12 GB o superior, aunque no hay confirmación oficial.
- Despliegue: oficialmente vía Baseten Model APIs (0,01 USD por millón de tokens de entrada, sin retención de datos por defecto) o auto-alojado con el runtime OneJey/OneJev incluido en el repo (`setup.sh` instala el runtime con `serve.patch`, usando la librería `qev` con `DecisionEngine`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el diseño de prefill compartido sugiere baja latencia en multi-pregunta, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Decision Index 0.4 | AA Decision Index (réplica) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **joey-1** | 2,7B | 63,30 | 62,9 | MIT | HuggingFace y Baseten Model APIs |
| elephant-1 | 9B | 72,24 | 65,2 | no disponible | HuggingFace (baselabs/elephant-1) |
| mammoth-1 | 27B | no disponible | 65,9 | no disponible | HuggingFace (baselabs/mammoth-1) |
| Cloudflare Clef | no disponible | 61,71 | no disponible | no disponible | no disponible |
| Perplexity Decider Flash v1.2 | no disponible | 60,06 | no disponible | no disponible | no disponible |

joey-1 es la opción más ligera y con licencia más permisiva de la familia; elephant-1 y mammoth-1 ofrecen mayor precisión a cambio de más parámetros y coste.

## Limitaciones y advertencias

- Idioma: entrenado y etiquetado solo para inglés; su rendimiento en castellano u otros idiomas no está documentado.
- No es un LLM generativo: no sirve para generación de texto, código o conversación abierta; está especializado en clasificación y decisión calibrada.
- Rechazo de entradas largas: las peticiones que superan los límites de longitud entrenados se rechazan, no se truncan, lo que puede requerir lógica de particionado en el cliente.
- Riesgo de alucinación: reducido por diseño (salidas probabilísticas con opción de abstención), pero la calibración depende de que la distribución de entrada sea similar a la del entrenamiento; en dominios fuera de distribución las probabilidades pueden estar mal calibradas.
- Sesgos: no se documentan sesgos específicos; al derivar de Qwen3.5-2B y de datos de decisión públicos, pueden heredarse sesgos del modelo base y del dataset Mix 8.
- Uso comercial: la licencia MIT lo permite sin restricciones destacables.
- Ecosistema: el serving auto-alojado depende del runtime propietario OneJev y de parches incluidos en el repo; la compatibilidad con herramientas estándar (vLLM, llama.cpp) no está garantizada.
- Benchmarks: las puntuaciones del Artificial Analysis Decision Index son una réplica propia de Baseten, no la medición oficial, lo que introduce un posible sesgo de autopromoción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baselabs/joey-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Hermano mayor elephant-1: https://huggingface.co/baselabs/elephant-1
- Hermano mayor mammoth-1: https://huggingface.co/baselabs/mammoth-1
- Informe técnico: https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Blog de presentación: https://www.baseten.co/blog/decisions-for-a-penny-introducing-joey-1/
- Demo en Baseten: https://www.baseten.co/library/joey-1/
