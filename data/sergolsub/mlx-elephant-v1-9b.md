# sergolsub/mlx-elephant-v1-9B

## Resumen

`sergolsub/mlx-elephant-v1-9B` es una conversión a 8 bits en formato MLX del modelo `baselabs/elephant-1`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización del checkpoint original en bf16 que conserva la arquitectura y los pesos sin reentrenamiento ni modificación estructural. El repositorio ocupa 11,4 GB en disco y contiene 9.409.813.744 parámetros totales según los safetensors.

La relevancia de esta ficha radica en que el modelo base no es un generador de texto al uso: la model card describe una interfaz de "decisión" con cabezas especializadas (`noul`, `choice`, `score`) orientadas a tareas de clasificación y enrutamiento, además de soporte de imagen (512x512) combinada con texto. La conversión 8-bit mantiene la calidad del original según las métricas publicadas por el autor (92,2 % de accuracy frente al 92,2 % en bf16, con una KL de salida de 3,05e-04), lo que la hace adecuada para despliegue local en equipos Mac con memoria unificada moderada.

El modelo se distribuye bajo licencia MIT, heredada del repositorio upstream. La información disponible sobre idiomas, pipeline y datos de entrenamiento es escasa: la model card no detalla la composición del dataset ni el número de tokens, y el campo de idiomas no está declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`; incluye capas de atención lineal, p. ej. `linear_attn.in_proj_a`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe variante 4 bits en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (3 shards, layout MLX); repo de 11,4 GB |

## Arquitectura y entrenamiento

El modelo base `baselabs/elephant-1` es un transformer con etiqueta de arquitectura `qwen3_5` y capas de atención lineal identificables en los nombres de tensores (`model.language_model.layers.0.linear_attn.in_proj_a.weight`). La model card de esta conversión no documenta el proceso de entrenamiento del modelo original: no se indica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o alguna fase de ajuste supervisado. Tampoco se detalla la innovación arquitectónica más allá de la etiqueta de familia.

Lo que sí está documentado es el proceso de cuantización. Se aplicó una cuantización a 8 bits específica para MLX, sin reentrenamiento ni cambios de arquitectura, y el autor publica una auditoría de calidad a nivel de tensor: 760 tensores comparados, KL media de 2,16e-04, KL máxima de 5,57e-03 y 249 tensores con KL distinto de cero. La capa peor parada es `model.language_model.layers.0.linear_attn.in_proj_a.weight` con KL 5,57e-03. Además del peso, se mide la divergencia de salida en las probabilidades de decisión: KL media de 3,05e-04 (p95 1,23e-03, máximo 2,04e-03) sobre 100 filas de evaluación. El repositorio incluye scripts de inferencia (`engine.py`, `onejev_mlx`, `decision_config.json`, `joint_config.json`) para las cabezas de decisión.

## Capacidades

- Decisión binaria (`noul`): responde preguntas de sí/no sobre un texto, con instrucciones explícitas por tarea.
- Elección entre categorías (`choice`): clasifica una entrada en un conjunto de criterios definidos por el usuario (por ejemplo, enrutar a `billing` o `shipping`).
- Puntuación ordinal (`score`): asigna una entrada a una escala de criterios ordenados (por ejemplo, `cosmetic`, `annoying`, `blocks`).
- Procesamiento de imagen combinada con texto: la model card reporta evaluaciones con imagen 512x512 más texto, con latencias de aproximadamente 2,4 s por decisión.
- Interfaz de decisión multi-cabeza: cada pregunta se plantea como un objeto independiente con su tipo (`noul`, `choice`, `score`) e instrucciones.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni audio en la información disponible.
- Capacidades multilingües: no declaradas; el campo de idiomas no está disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: usar la cabeza `choice` para asignar cada incidencia al equipo adecuado (`billing`, `shipping`, etc.) con criterios definidos en la llamada, tal como muestra el ejemplo de la model card con el pedido #7821.
- Triaje de severidad de incidencias: emplear la cabeza `score` para clasificar errores operativos en una escala ordinal (`cosmetic`, `annoying`, `blocks`), como en el ejemplo del fallo de cuota de disco en el worker.
- Detección de intención de reembolso: la cabeza `noul` permite responder preguntas binarias del tipo "¿el cliente quiere un reembolso?" sobre el texto de la reclamación, integrándose en un flujo de atención al cliente.
- Clasificación de reclamaciones con contexto visual: al aceptar imagen 512x512 más texto, puede evaluar capturas de pantalla de la app junto con la descripción del problema para decidir la acción.
- Moderación o filtrado por reglas: definir criterios de elección y usar `choice` para etiquetar contenido según políticas internas, con la ventaja de que los criterios se pasan en tiempo de inferencia sin reentrenar.
- Despliegue local en estaciones Mac: con 12,21 GB de RSS pico y carga en 5,08 s en un Mac mini M4 Pro de 48 GB, es viable para herramientas internas de decisión que deban ejecutarse sin conexión ni GPU dedicada.
- Procesamiento de decisiones en lote con latencia moderada: la model card reporta 2,56 decisiones cortas por segundo sostenidas y una mediana de 657 ms por decisión, adecuado para colas de triaje no críticas en tiempo real.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a su propio conjunto de evaluación (no a benchmarks estándar como MMLU o HumanEval), medidos en un Mac mini M4 Pro de 48 GB con MLX 8-bit. Se comparan la versión original bf16, la 8-bit y la 4-bit.

| Version | Accuracy | noul | choice | score | PPL | KL salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 92,2 % | 95,0 % | 92,0 % | 88,0 % | 1,771 | referencia | 18,84 GB | 735 ms |
| 8-bit (este repo) | 92,2 % | 95,0 % | 92,0 % | 88,0 % | 1,769 | 3,05e-04 | 11,4 GB | 657 ms |
| 4-bit | 86,7 % | 92,5 % | 84,0 % | 80,0 % | 1,897 | 3,28e-02 | 7,43 GB | 1654 ms |

Métricas de ejecución medidas (Mac mini M4 Pro 48 GB, MLX 8-bit):

| Escenario | Latencia media | RSS pico |
|---|---|---|
| Carga del modelo | 5,08 s | 12,21 GB |
| Texto 512 tokens (492 tok), binario/multielección/score | ~1425-1435 ms | 12,21 GB |
| Imagen 512x512 + texto | ~2400-2407 ms | 12,21 GB |
| Decisión individual (mediana) | 657 ms | — |
| Throughput sostenido | 2,56 decisiones cortas/s | — |

Índice de decisión reportado: 0.4.1 con valor 62,11. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 12,21 GB de RSS pico en la medición del autor con 8 bits; el repositorio en disco ocupa 11,4 GB.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en equipos Apple Silicon con al menos 16 GB de memoria unificada según el consumo medido (12,21 GB pico), aunque no se ha validado en configuraciones menores en la información disponible.
- No está pensado para GPU NVIDIA: el formato es MLX y la librería es `mlx_lm`, específica de Apple Silicon.
- Opciones de despliegue: `mlx_lm` y el loader incluido en el repositorio (`onejev_mlx`, `engine.py`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 657 ms por decisión, 2,56 decisiones cortas por segundo sostenidas, carga en 5,08 s.
- Existe una variante 4-bit en `sergolsub/elephant-v1-9B-MLX-4bit` que reduce el disco a 7,43 GB a costa de bajar la accuracy al 86,7 % y aumentar la latencia mediana a 1654 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Accuracy reportada | Notas |
|---|---|---|---|---|---|---|
| sergolsub/mlx-elephant-v1-9B (este) | 9,41 B | no disponible | safetensors MLX 8-bit | MIT | 92,2 % (eval propia) | Optimizado para Apple Silicon |
| baselabs/elephant-1 (original) | 9,41 B | no disponible | bf16 | MIT | 92,2 % (eval propia) | Referencia bf16, 18,84 GB |
| sergolsub/elephant-v1-9B-MLX-4bit | 9,41 B | no disponible | safetensors MLX 4-bit | MIT | 86,7 % (eval propia) | 7,43 GB, más lento (1654 ms) |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación/decisión con cabezas especializadas) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto general: su interfaz está orientada a decisiones estructuradas (`noul`, `choice`, `score`) y la model card no documenta generación libre.
- No se declaran idiomas soportados, por lo que el rendimiento fuera del inglés (los ejemplos están en inglés) es desconocido.
- No se documenta la longitud de contexto, lo que impide garantizar el comportamiento en entradas largas.
- Las métricas de calidad (92,2 % de accuracy, PPL 1,769) provienen de un conjunto de evaluación propio del autor, no de benchmarks estándar; no son directamente comparables con resultados publicados de otros modelos.
- La cuantización 8-bit introduce una divergencia medible frente al bf16 (KL media 3,05e-04, máxima 2,04e-03), pequeña pero no nula; la variante 4-bit degrada claramente la calidad (86,7 % de accuracy y KL 3,28e-02).
- El soporte de imagen se limita a 512x512 según las pruebas del autor; la detección de cajas ("box") no está soportada.
- Riesgo de alucinación y sesgos: no hay información publicada en la model card sobre evaluación de sesgos o tasas de alucinación.
- Licencia MIT heredada del upstream: permite uso comercial, pero si hay conflicto prevalece la licencia del repositorio original `baselabs/elephant-1`.
- Dependencia del ecosistema MLX: no es desplegable en GPUs NVIDIA ni en stacks estándar de servidores de inferencia sin conversión adicional.
- El repositorio incluye scripts ejecutables (`engine.py`, `onejev_mlx`, `constraints.txt`); conviene auditar el código antes de ejecutarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-elephant-v1-9B
- Modelo base original: https://huggingface.co/baselabs/elephant-1
- Variante 4-bit: https://huggingface.co/sergolsub/elephant-v1-9B-MLX-4bit
- Variante 8-bit (referenciada en la tabla de versiones): https://huggingface.co/sergolsub/elephant-v1-9B-MLX-8bit
