# airun-ai/MiMo-V2.6-Distill-Qwen-9B-Decision

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Decision es un adaptador de decisión (decision adapter) publicado por airun-ai sobre el modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un transformer de aproximadamente 9.000 millones de parámetros derivado de la familia Qwen. No es un modelo autónomo: se distribuye como un adaptador LoRA de rango 16 (unos 0,2 GB en safetensors) más una cabeza pointer de 256 dimensiones que se ejecuta con el runtime Kev. Su función es recibir un estado (evidencia en texto), una o varias preguntas y un conjunto de opciones permitidas, y devolver en un único forward pass una distribución de probabilidad sobre esas opciones, sin generar texto token a token.

El modelo resuelve un problema concreto de los pipelines RAG y de agentes: la selección entre alternativas discretas (enrutado, verificación de afirmaciones, puntuación ordinal) suele implementarse forzando al LLM a generar una etiqueta, lo que añade latencia y errores de formato. Este adaptador convierte esa tarea en una clasificación directa sobre los logits de las opciones, con tres tipos de pregunta soportados: `choice` (elección entre categorías), `noul` (sí/no) y `score` (ordinal).

Es relevante porque es el punto de partida de airun-ai/GlanceRAG-MiMo-9B-Reranker y uno de los tres modos que el paper Glance (Metinov y Arziev, 2026, arXiv:2610.40454) sirve desde un mismo backbone, lo que permite reutilizar una única instancia del modelo de 9B para generación, decisión y reranking. La licencia es Apache-2.0 y el repositorio acumula 36 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre transformer decoder-only de 9B (base MiMo-V2.6-Distill-Qwen-9B) + cabeza pointer de 256 dimensiones |
| Parametros totales | No disponible para el adaptador; el modelo base es de ~9B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los resultados publicados se obtuvieron en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |

## Arquitectura y entrenamiento

El adaptador se compone de dos piezas: un LoRA de rango 16 aplicado sobre el modelo base MiMo-V2.6-Distill-Qwen-9B y una cabeza pointer de 256 dimensiones que proyecta el estado oculto sobre las opciones candidatas para producir probabilidades directamente, sin decodificación autoregresiva. La inferencia requiere el runtime Kev (commit 0a6d3faf) y una instalación específica de Triton 3.8.0 sin dependencias (`pip install --no-deps triton==3.8.0`), lo que indica que la cabeza pointer y el cálculo de probabilidades dependen de kernels propios.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO; el autor solo indica que el modelo base es una destilación de MiMo-V2.6 sobre Qwen de 9B. La innovación técnica destacable es el planteamiento de "decisión en un forward pass": en lugar de generar una etiqueta textual y parsearla, el modelo puntúa las opciones permitidas en paralelo, lo que reduce la latencia y elimina los fallos de formato. El paper Glance describe el uso del mismo backbone para tres modos (generación, decisión y reranking), y este adaptador es la pieza de decisión de esa arquitectura.

## Capacidades

- Clasificación de decisión con opciones restringidas: devuelve una distribución de probabilidad sobre las opciones proporcionadas en una sola pasada, sin generar texto.
- Preguntas de tipo `choice`: selección entre categorías definidas con instrucciones y criterios (por ejemplo, enrutado a equipos de soporte).
- Preguntas de tipo `noul` (yes/no): verificación binaria de afirmaciones o condiciones.
- Preguntas de tipo `score` ordinal: puntuación de evidencia en una escala ordenada.
- Reranking zero-shot: el autor reporta su uso como reranker en una pasada sobre los 20 mejores resultados de BM25.
- Soporte de múltiples preguntas por petición: el campo `questions` del JSON de entrada es un objeto, lo que permite evaluar varias decisiones sobre el mismo estado.
- No soporta generación de texto libre, tool calling, agentes multi-paso, visión ni audio: es exclusivamente un cabezal de decisión sobre un estado dado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y un conjunto de categorías (facturación, técnico, ventas), el adaptador devuelve la probabilidad de cada equipo en un forward pass, lo que permite umbrales de confianza y escalado a revisión humana cuando la distribución es plana.
- Verificación de afirmaciones en pipelines RAG: con preguntas de tipo `noul`, se comprueba si un fragmento recuperado respalda una afirmación concreta antes de incluirla en la respuesta final, sustituyendo la generación de "sí/no" por una probabilidad calibrada.
- Reranking de documentos recuperados: en modo zero-shot sobre los 20 mejores resultados de BM25, el autor reporta nDCG@10 de 0,715 en SciFact y 0,341 en NFCorpus, lo que lo hace adecuado como segunda etapa de recuperación en buscadores documentales.
- Clasificación ordinal de relevancia o calidad: con preguntas de tipo `score`, se pueden puntuar respuestas candidatas o pasajes en una escala ordenada para seleccionar el mejor resultado de un conjunto.
- Control de calidad en generación: usar el adaptador como juez de decisión sobre pares (pregunta, respuesta) para aceptar, rechazar o marcar para revisión, con la ventaja de una latencia de una sola pasada frente a un LLM juez generativo.
- Enrutado dentro de agentes: decidir qué herramienta o subagente invocar a partir del estado de la conversación y de las opciones disponibles, integrado en el mismo backbone que el generador para evitar cargar un segundo modelo.
- Moderación o triaje binario: clasificar contenido entrante con preguntas `noul` (por ejemplo, "¿requiere intervención inmediata?") antes de pasarlo a un modelo mayor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| JevBench public 231 (easy) | 48/48 | bf16 en RTX PRO 6000, ejecución propia del autor (pinned 7625ecb1) |
| JevBench public 231 (original) | 71/72 | ídem |
| JevBench public 231 (hard) | 65/111 | ídem |
| JevBench public 231 (total) | 184/231 | ídem |
| Pilot test (520 preguntas) | 83,85 % de accuracy | frente a 75,19 % del modelo base con logits de opciones restringidas |
| SciFact nDCG@10 (reranker zero-shot) | 0,715 | Glance one pass, top-20 de BM25; bge-reranker-v2-m3: 0,721 |
| NFCorpus nDCG@10 (reranker zero-shot) | 0,341 | ídem; bge-reranker-v2-m3: 0,326 |

## Requisitos de hardware

- El adaptador en sí ocupa unos 0,2 GB, pero requiere cargar el modelo base de ~9B parámetros en memoria, por lo que el requisito real es el del backbone.
- En bf16, el backbone de 9B necesita aproximadamente 18 GB de VRAM solo para pesos, más memoria para el estado de activaciones; se recomienda una GPU de 24 GB o superior (RTX 4090, L40S, A100 40 GB, H100).
- Los resultados publicados se obtuvieron en una RTX PRO 6000 en bf16; no se han publicado cifras de latencia ni throughput.
- Despliegue mediante el runtime Kev (commit 0a6d3faf) con Triton 3.8.0; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que la cabeza pointer y el cálculo de probabilidades no forman parte de esos servidores estándar.
- Cuantización: no se documentan opciones; dado que el adaptador depende de logits de opciones y de una cabeza pointer, la cuantización a 4 u 8 bits podría degradar la calibración y no está validada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Decision | ~9B (base) + LoRA r16 + pointer head | No disponible | Decisión por probabilidades en un forward pass | Apache-2.0 | Hugging Face, runtime Kev |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | ~9B | No disponible | Generación autoregresiva con logits de opciones restringidas | No disponible en la información | Hugging Face |
| bge-reranker-v2-m3 | No disponible | No disponible | Reranker cross-encoder | No disponible en la información | Hugging Face |
| airun-ai/GlanceRAG-MiMo-9B-Reranker | ~9B (base) | No disponible | Reranker derivado de este adaptador | No disponible en la información | Hugging Face |

La comparación directa con clasificadores dedicados de menor tamaño no está disponible en la información proporcionada; el autor solo aporta la comparación con el modelo base y con bge-reranker-v2-m3 en tareas de reranking.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base MiMo-V2.6-Distill-Qwen-9B y el runtime Kev; no funciona con `transformers` estándar sin adaptaciones.
- Solo resuelve decisiones sobre opciones predefinidas; no genera texto, no hace tool calling ni razonamiento multi-paso.
- La instalación depende de una versión concreta de Triton (3.8.0) instalada sin dependencias, lo que puede generar conflictos en entornos compartidos.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento fuera de dominio; la evaluación se limita a JevBench, un pilot test de 520 preguntas y dos datasets de reranking.
- El rendimiento en la partición "hard" de JevBench (65/111) indica que las decisiones difíciles siguen siendo un punto débil.
- Riesgo de calibración: las probabilidades dependen del prompt de instrucciones y criterios; no se han publicado estudios de calibración ni de sensibilidad al formato del estado.
- La licencia Apache-2.0 permite uso comercial, pero debe revisarse el archivo NOTICE y la licencia del modelo base, que no se detalla en la información disponible.
- El número de descargas (36) y de likes (0) sugiere una adopción muy temprana; no hay evidencia de uso en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/airun-ai/MiMo-V2.6-Distill-Qwen-9B-Decision
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo derivado (reranker): https://huggingface.co/airun-ai/GlanceRAG-MiMo-9B-Reranker
- Paper Glance: https://arxiv.org/abs/2610.40454
- Runtime Kev: https://github.com/jaredpalmer/kev
