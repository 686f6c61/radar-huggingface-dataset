# iapp/OpenThai-SystemOne-MLX-bf16

## Resumen

OpenThai-SystemOne-MLX-bf16 es la conversión a formato MLX bf16 para Apple Silicon de OpenThai-SystemOne, un modelo de decisión «System One» bilingüe (tailandés e inglés) desarrollado por iApp Technology / OpenThaiGPT. No es un modelo generativo: en una única pasada hacia delante responde preguntas tipadas sobre un texto o un estado JSON —elección entre hasta 255 opciones (`choice`), puntuación ordinal (`score`) y sí/no (`noul`)— y devuelve probabilidades calibradas, sin decodificación autorregresiva.

Técnicamente combina una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés y una cabeza de decisión de 256 slots en fp32, hasta un total de 752.412.480 parámetros. La cuantización afecta solo a la torre, incluida la tabla de embeddings, de modo que la cabeza y las temperaturas por tipo de pregunta permanecen en precisión completa; esto limita la pérdida de exactitud, que en la evaluación publicada es de ±0,8 puntos como máximo.

Su relevancia es doble: ofrece clasificación estructurada bilingüe con latencia muy baja en hardware de consumo (≈19 ms por decisión de tres preguntas en tailandés con cuantización de 4 bits en un MacBook Pro M3 Max, frente a ~150 ms del modelo PyTorch en MPS) y se posiciona como alternativa compacta a los clasificadores tipo BERT y a los LLM generativos en tareas de enrutamiento, moderación y evaluación automática.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen3.5 (torre de texto) más cabeza de decisión de 256 slots |
| Parámetros totales | 752.412.480 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX bf16 (torre y embeddings); la cabeza de decisión y las temperaturas por tipo se mantienen en fp32. Las mediciones de latencia mencionan además una variante de 4 bits |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX bf16) para la torre; `head.safetensors` en fp32 |
| Modelo base | iapp/OpenThai-SystemOne (v0.3, commit `f3709948`) |
| Relación con el modelo base | cuantizado |
| Librería de inferencia | mlx-lm (Apple Silicon); el modelo base es PyTorch |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

La arquitectura no sigue el patrón de un LLM conversacional. La torre es un transformer decoder Qwen3.5 de aproximadamente 0,8 B de parámetros con preentrenamiento continuado en tailandés, sobre la que se monta una cabeza de decisión de 256 slots. El cliente incluido ejecuta la torre con mlx-lm y aplica después la cabeza sobre los estados ocultos finales. El modelo responde tres tipos de consulta: `choice` (selección entre hasta 255 opciones), `score` (nivel ordinal) y `noul` (sí/no), cada una con su propia temperatura de calibración, lo que permite obtener distribuciones de probabilidad ajustadas en lugar de una simple etiqueta.

La innovación principal es precisamente ese diseño de decisión en una sola pasada: no hay generación de texto ni muestreo autoregresivo, por lo que el coste por consulta es el de un único forward. La cuantización a MLX bf16 afecta únicamente a la torre (incluida la tabla de embeddings, que MLX también cuantiza), mientras que la cabeza y las temperaturas quedan en fp32; según el autor, esto solo perturba el estado oculto que lee la cabeza. El model card no proporciona el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO: esos datos remiten al repositorio del modelo base y no están disponibles en la información consultada.

## Capacidades

- Clasificación y decisión tipada en una sola pasada: `choice` (hasta 255 opciones), `score` (ordinal) y `noul` (sí/no).
- Salida con probabilidades calibradas por tipo de pregunta, apta para umbralizar o para combinar con reglas de negocio.
- Entrada de texto libre o de estado JSON, lo que permite condicionar la decisión a campos estructurados.
- Capacidades bilingües tailandés-inglés, con especial atención al tailandés por el preentrenamiento continuado de la torre.
- Enrutamiento y selección de herramientas entendida como clasificación (el conjunto `xlam_tools` obtiene 99,4 de exactitud), no como ejecución real de *tool calling*.
- Moderación de contenido y detección de toxicidad, con 83,2 en `aegis2` y 79,0 en `civil_comments`.
- Inferencia de relación textual (NLI) y de respuesta sí/no sobre documentos, con 88,6 en `multinli` y 89,3 en `squad2`.
- No genera texto, no soporta conversación multi-turno y no implementa agentes ni razonamiento multi-paso: su ámbito es la decisión puntual sobre una entrada dada.

## Casos de uso

- Moderación de contenido en plataformas: el modelo clasifica un comentario o publicación como aceptable o problemático mediante preguntas `noul`, con 83,2 en `aegis2` y 79,0 en `civil_comments`, lo que permite integrarlo en un filtro previo de bajo coste.
- Análisis de sentimiento en tailandés para reseñas y comercio electrónico: con 49,0 en `wisesight` y 64,6 en `wongnai` (score), sirve para etiquetar opiniones de clientes en pipelines de escucha social.
- Clasificación de intenciones en asistentes y atención al cliente: 90,9 en `massive_th`, 88,3 en `massive-en-US` y 59,4 en `banking77`; se usaría como primera etapa de enrutamiento antes de un LLM generativo más caro.
- Enrutamiento de herramientas en un agente: 99,4 en `xlam_tools` permite decidir qué función o API invocar, dejando la ejecución a un componente externo.
- Detección de alucinaciones y verificación de consistencia en resúmenes: 75,7 en `summeval-consistency` y 20,8 en `summeval-relevance` permiten puntuar salidas generadas por otro modelo antes de publicarlas.
- Respuesta a preguntas binarias sobre documentación y bases de conocimiento: 80,0 en `boolq` y 89,3 en `squad2` lo hacen adecuado para tareas de verificación de afirmaciones contra un contexto.
- Análisis de contenido periodístico y clasificación temática en tailandés: 98,3 en `prachathai` (choice) y 93,3 en `prachathai` (noul) para etiquetado editorial a gran escala.
- Evaluación de relevancia y coherencia en sistemas de recomendación de resúmenes: 21,7 de referencia en `summeval-relevance` en el original, útil para filtrado comparativo más que para decisión automática.

## Benchmarks y rendimiento

Exactitud con un único orden de opciones sobre los primeros 800 registros de cada conjunto (`scripts/06_eval.py --limit 800`), comparando el original en bf16 con esta conversión MLX. Macro público: 74,3 (original 74,3). Macro tailandés: 80,2 (original 80,1). En los subconjuntos `score` se reporta la exactitud de nivel exacto.

| Subconjunto (banco público de 13) | bf16 original | Este modelo | Δ |
|---|---|---|---|
| aegis2 (noul) | 83,2 | 83,2 | +0,0 |
| boolq (noul) | 79,7 | 80,0 | +0,3 |
| civil_comments (noul) | 79,0 | 79,0 | +0,0 |
| helpsteer2 (score) | 41,6 | 41,6 | +0,0 |
| massive-de-DE (choice) | 88,3 | 88,3 | +0,0 |
| massive-en-US (choice) | 88,3 | 88,3 | +0,0 |
| multinli (choice) | 89,0 | 88,6 | -0,3 |
| paws (noul) | 94,0 | 94,0 | +0,0 |
| pubmedqa (choice) | 64,0 | 64,0 | +0,0 |
| squad2 (noul) | 89,3 | 89,3 | +0,0 |
| summeval-consistency (score) | 75,0 | 75,7 | +0,7 |
| summeval-relevance (score) | 21,7 | 20,8 | -0,8 |
| vitaminc-dev (choice) | 72,5 | 72,8 | +0,3 |
| *macro, banco público* | *74,3* | *74,3* | *+0,0* |

| Conjunto tailandés retenido / evaluación | bf16 original | Este modelo | Δ |
|---|---|---|---|
| banking77 (choice) | 59,1 | 59,4 | +0,2 |
| contrastive_th (choice) | 80,7 | 81,1 | +0,3 |
| contrastive_th (noul) | 83,5 | 82,7 | -0,8 |
| contrastive_th (score) | 78,6 | 78,6 | +0,0 |
| massive_th (choice) | 90,6 | 90,9 | +0,2 |
| prachathai (choice) | 98,3 | 98,3 | +0,0 |
| prachathai (noul) | 93,4 | 93,3 | -0,1 |
| sib200_th (choice) | 77,9 | 78,4 | +0,5 |
| wisesight (choice) | 48,9 | 49,0 | +0,1 |
| wongnai (score) | 64,5 | 64,6 | +0,1 |
| xlam_tools (choice) | 99,4 | 99,4 | +0,0 |
| xnli_th (choice) | 79,8 | 79,8 | +0,0 |
| xnli_th (noul) | 86,8 | 86,8 | +0,0 |
| *macro, conjuntos tailandeses* | *80,1* | *80,2* | *+0,0* |

## Requisitos de hardware

- Pesos en MLX bf16: 1,5 GB en disco, según el tamaño del repositorio; los 752 millones de parámetros a 16 bits equivalen a ese orden de magnitud.
- VRAM estimada para inferencia: alrededor de 2 GB en bf16 contando estados intermedios y la cabeza en fp32; la variante de 4 bits reduce el peso de la torre aproximadamente a un cuarto.
- Cabe en cualquier GPU de consumo (RTX 3060 12 GB, RTX 4090, etc.) y en cualquier Mac con Apple Silicon, ya que el formato y la librería (`mlx-lm`) están pensados para ese hardware.
- Aceleradores de datacenter (A100, H100) no son necesarios: el modelo es demasiado pequeño para aprovecharlos de forma eficiente.
- Despliegue: `mlx-lm` sobre Apple Silicon para esta conversión; el modelo base PyTorch se ejecuta con `transformers` y admite MPS y CUDA.
- Latencia medida: ≈19 ms por decisión de tres preguntas en tailandés con cuantización de 4 bits en un MacBook Pro M3 Max, frente a ~150 ms del modelo PyTorch sobre MPS.
- Throughput para el resto de configuraciones: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| OpenThai-SystemOne-MLX-bf16 (este) | 752.412.480 | no disponible | MLX bf16 (safetensors) | Apache-2.0 | Macro público 74,3; macro tailandés 80,2 |
| iapp/OpenThai-SystemOne (base, v0.3) | 752.412.480 | no disponible | PyTorch (safetensors) | Apache-2.0 | Macro público 74,3; macro tailandés 80,1 |
| Qwen3.5-0.8B (torre de origen del base) | ~0,8 B | no disponible | safetensors, GGUF | no disponible en la información consultada | no disponible; es un modelo generativo sin cabeza de decisión |
| Clasificadores tipo BERT/XLM-R multilingües | no disponible | no disponible | safetensors | diversas | no disponible; no se han publicado comparativas en la información consultada |

La comparación más sólida es contra el propio modelo base: la conversión a MLX bf16 mantiene la precisión dentro de ±0,8 puntos en todos los conjuntos medidos y mejora la latencia en Apple Silicon. Frente a la torre Qwen3.5 original, la diferencia de funcionalidad es más relevante que la de rendimiento, ya que este modelo prescinde de la generación de texto y añade decisión tipada con probabilidades calibradas.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre, mantener conversaciones multi-turno ni ejecutar razonamiento multi-paso.
- Riesgo de alucinación bajo en el sentido clásico (no inventa texto), pero las probabilidades por opción pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; conviene validar los umbrales de decisión con datos propios.
- Rendimiento desigual por tarea: la relevancia de resúmenes es el punto más débil, con 20,8 en `summeval-relevance` y 41,6 en `helpsteer2` (score), valores muy por debajo del resto.
- Cobertura lingüística limitada a tailandés e inglés; no se han publicado resultados en otras lenguas.
- Los resultados de benchmarks corresponden a un único orden de opciones y a los primeros 800 registros de cada conjunto, por lo que pueden no reflejar el comportamiento en producción con otros órdenes o distribuciones.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar el tamaño máximo de entrada documental.
- Este repositorio concreto está atado a Apple Silicon (`mlx-lm`); en CUDA o en CPU hay que recurrir al modelo base PyTorch.
- Licencia Apache-2.0, que permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia; verificar igualmente los términos de los datos de evaluación y del modelo base.
- Sesgos concretos: no se han publicado análisis de sesgo en la información disponible.
- Sin soporte real de *tool calling* ni de agentes; el buen resultado en `xlam_tools` mide selección de herramienta como clasificación, no su ejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iapp/OpenThai-SystemOne-MLX-bf16
- Modelo base (v0.3, datos de entrenamiento y tablas completas de benchmarks): https://huggingface.co/iapp/OpenThai-SystemOne
- Librería de inferencia mlx-lm: https://github.com/ml-explore/mlx-lm
- Nota sobre la búsqueda web: las búsquedas realizadas devolvieron únicamente resultados de la International Association of Privacy Professionals (IAPP), sin relación con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
