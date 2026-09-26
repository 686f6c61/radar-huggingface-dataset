# iapp/OpenThai-SystemOne-MLX-nvfp4

## Resumen

OpenThai-SystemOne-MLX-nvfp4 es una cuantización de 4 bits del modelo iapp/OpenThai-SystemOne (versión v0.3, commit `f3709948`), un "System One decision model" bilingüe tailandés-inglés desarrollado por iApp Technology dentro del proyecto OpenThaiGPT. No es un modelo generativo: en una única pasada hacia delante responde preguntas tipadas (elección entre hasta 255 opciones, puntuación ordinal y sí/no) sobre un estado de texto o JSON, devolviendo probabilidades calibradas en lugar de texto libre.

Técnicamente, el modelo combina una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés y una cabeza de decisión de 256 slots. Esta variante concreta aplica cuantización NVFP4 para Apple Silicon mediante la librería MLX, manteniendo la cabeza de decisión y las temperaturas por tipo en fp32. El resultado ocupa solo 424 MB en disco, frente a los aproximadamente 1,5 GB que ocuparía el original en bf16.

Su relevancia ahora radica en que demuestra que tareas de clasificación y decisión estructurada se pueden ejecutar en un portátil con chip Apple Silicon en unos 19 ms por decisión de tres preguntas (frente a los ~150 ms del modelo PyTorch sobre MPS), con una pérdida de precisión macro de solo 0,7-1,0 puntos respecto al original en bf16. Es una pieza pensada para enrutado, moderación, análisis de sentimiento y evaluación automática dentro de pipelines, no para generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (torre de texto Qwen3.5-0.8B) más cabeza de decisión de 256 slots |
| Parametros totales | 752.412.480 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 de 4 bits (MLX) para la torre, incluidos los embeddings; cabeza de decisión y temperaturas por tipo en fp32 |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), más `head.safetensors` en fp32 |
| Tamaño del repositorio | 0,4 GB (424 MB) |
| Libreria | mlx (mlx-lm) |
| Tarea declarada | text-classification |

## Arquitectura y entrenamiento

El modelo es un transformer decoder basado en Qwen3.5-0.8B que ha recibido un preentrenamiento continuado en tailandés para adaptar la torre de texto al idioma. Sobre los estados ocultos finales de esa torre se aplica una cabeza de decisión de 256 slots que convierte la representación del último token en respuestas tipadas: `choice` (elección entre hasta 255 opciones), `score` (nivel ordinal) y `noul` (sí/no). No hay decodificación autoregresiva ni generación de texto: la salida son probabilidades calibradas, con temperaturas específicas por tipo de pregunta.

En esta cuantización concreta, MLX cuantiza la torre completa, incluida la tabla de embeddings. La cabeza de decisión y las temperaturas por tipo permanecen en fp32, de modo que el único efecto de la cuantización es la perturbación del estado oculto que lee la cabeza. Según el autor, el cliente incluido ejecuta la torre con mlx-lm y aplica la cabeza sobre los estados ocultos finales. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Decisión tipada en una sola pasada: clasificación por elección (`choice`), puntuación ordinal (`score`) y verificación binaria sí/no (`noul`).
- Salida de probabilidades calibradas en lugar de texto libre, lo que permite umbrales y agregación posterior.
- Procesamiento de estados de entrada en texto plano o JSON.
- Capacidad multilingüe limitada a tailandés e inglés.
- Clasificación de sentimiento, análisis de coherencia, inferencia de relación textual y detección de contradicciones.
- Enrutado de herramientas y function calling como tarea de clasificación (evaluado con xlam_tools).
- Moderación de contenido y verificación de afirmaciones sobre contexto (tipo noul).
- No dispone de generación de texto, modo "thinking", visión, audio ni razonamiento multi-paso explícito.

## Casos de uso

- Análisis de sentimiento en tailandés: clasificar reseñas de productos o servicios en categorías como positivo, negativo y neutro. El modelo está optimizado para este idioma con preentrenamiento continuado y obtiene 89,8 en massive_th (choice), lo que lo hace adecuado para volúmenes altos de opiniones.
- Enrutado de intenciones en asistentes conversacionales: dado un turno de usuario en tailandés o inglés, elegir la intención entre un conjunto de hasta 255 opciones. La baja latencia (~19 ms por decisión de tres preguntas en un M3 Max) permite ejecutarlo en línea dentro de un bot.
- Moderación de contenido: usar la tarea `noul` para decidir si un texto vulnera políticas. La puntuación de 81,3 en civil_comments (noul) lo sitúa como filtro previo razonable, siempre con umbral calibrado y revisión humana para casos límite.
- Verificación de fidelidad en resúmenes: evaluar la consistencia de un resumen respecto al documento original (79,2 en summeval-consistency, score), útil en pipelines de generación aumentada por recuperación donde hace falta una comprobación automática rápida.
- Detección de alucinaciones en respuestas de QA: decidir si una respuesta está respaldada por el contexto mediante la tarea `noul` (86,3 en squad2), como paso de validación antes de mostrar la respuesta al usuario.
- Inferencia de relación textual (NLI): clasificar pares de frases como implicación, contradicción o neutralidad, con 85,6 en multinli (choice), para deduplicación semántica o control de coherencia documental.
- Enrutado de llamadas a herramientas: elegir qué función invocar a partir de una consulta (99,2 en xlam_tools, choice), integrándolo como clasificador previo en un agente que después ejecuta la herramienta seleccionada.
- Triaje de preguntas clínicas: clasificar preguntas biomédicas en pubmedqa (62,4 en choice), siempre como apoyo a un revisor humano dado el dominio sensible y la precisión moderada.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre los mismos registros (primeros 800 de cada conjunto, `scripts/06_eval.py --limit 800`), un solo orden de opciones y precisión exacta en los subconjuntos de tipo `score`.

| Subconjunto (banco público de 13) | bf16 original | Esta cuantizacion | Delta |
|---|---|---|---|
| aegis2 (noul) | 83,2 | 80,8 | -2,4 |
| boolq (noul) | 79,7 | 78,7 | -1,0 |
| civil_comments (noul) | 79,0 | 81,3 | +2,3 |
| helpsteer2 (score) | 41,6 | 42,8 | +1,2 |
| massive-de-DE (choice) | 88,3 | 84,0 | -4,3 |
| massive-en-US (choice) | 88,3 | 87,7 | -0,6 |
| multinli (choice) | 89,0 | 85,6 | -3,3 |
| paws (noul) | 94,0 | 92,8 | -1,2 |
| pubmedqa (choice) | 64,0 | 62,4 | -1,6 |
| squad2 (noul) | 89,3 | 86,3 | -3,0 |
| summeval-consistency (score) | 75,0 | 79,2 | +4,2 |
| summeval-relevance (score) | 21,7 | 20,8 | -0,8 |
| vitaminc-dev (choice) | 72,5 | 69,8 | -2,7 |
| Macro, banco público de 13 | 74,3 | 73,2 | -1,0 |

| Subconjunto (conjuntos tailandeses retenidos) | bf16 original | Esta cuantizacion | Delta |
|---|---|---|---|
| banking77 (choice) | 59,1 | 60,6 | +1,5 |
| contrastive_th (choice) | 80,7 | 80,7 | +0,0 |
| contrastive_th (noul) | 83,5 | 81,0 | -2,4 |
| contrastive_th (score) | 78,6 | 75,0 | -3,6 |
| massive_th (choice) | 90,6 | 89,8 | -0,9 |
| prachathai (choice) | 98,3 | 98,8 | +0,5 |
| prachathai (noul) | 93,4 | 93,9 | +0,4 |
| sib200_th (choice) | 77,9 | 76,5 | -1,5 |
| wisesight (choice) | 48,9 | 48,6 | -0,2 |
| wongnai (score) | 64,5 | 64,6 | +0,1 |
| xlam_tools (choice) | 99,4 | 99,2 | -0,1 |
| xnli_th (choice) | 79,8 | 77,0 | -2,8 |
| xnli_th (noul) | 86,8 | 86,1 | -0,6 |
| Macro, conjuntos tailandeses | 80,1 | 79,4 | -0,7 |

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 424 MB en disco; en ejecución, la torre cuantizada a 4 bits más la cabeza fp32 requiere aproximadamente ese orden de memoria unificada, muy por debajo de los ~1,5 GB del original en bf16.
- Plataforma objetivo: Apple Silicon, ya que el runtime empleado es mlx-lm y el formato NVFP4 está orientado a la GPU unificada de Apple. No se documenta soporte directo en GPU NVIDIA o AMD.
- Cabe en equipos de consumo: sí, en cualquier Mac con chip de la familia M. El autor reporta mediciones en un MacBook Pro M3 Max.
- Latencia medida: 19 ms por decisión de tres preguntas en tailandés con 4 bits en un M3 Max, frente a los ~150 ms del modelo PyTorch sobre MPS.
- Opciones de despliegue: `mlx-lm` para la torre junto con el cliente `MLXSystemOneClient` incluido en el repositorio, que aplica la cabeza de decisión sobre los estados ocultos finales. Dependencias declaradas: mlx-lm, torch, transformers, safetensors y pydantic.
- Throughput: no disponible más allá de la latencia por decisión indicada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables de decisión estructurada en la información proporcionada. La comparación más directa disponible es contra el modelo original sin cuantizar.

| Modelo | Parametros | Formato | Licencia | Macro tailandés | Macro público | Latencia (3 preguntas, tailandés) |
|---|---|---|---|---|---|---|
| OpenThai-SystemOne-MLX-nvfp4 | 752.412.480 | MLX NVFP4 4 bits | Apache-2.0 | 79,4 | 73,2 | ~19 ms (M3 Max) |
| iapp/OpenThai-SystemOne (bf16) | 752.412.480 | safetensors bf16 | Apache-2.0 | 80,1 | 74,3 | ~150 ms (PyTorch sobre MPS) |

## Limitaciones y advertencias

- No genera texto: solo produce decisiones tipadas y probabilidades. No debe emplearse para tareas generativas.
- La cuantización penaliza algunos subconjuntos de forma notable, con caídas de hasta 4,3 puntos (massive-de-DE) y 3,6 puntos (contrastive_th, score) respecto al original en bf16.
- Rendimiento bajo en varias tareas: summeval-relevance (20,8), helpsteer2 (42,8), wisesight (48,6) y banking77 (60,6) se sitúan en rangos que exigen umbrales conservadores o supervisión.
- Las evaluaciones se limitan a los primeros 800 registros de cada conjunto y a un único orden de opciones, por lo que pueden no reflejar el comportamiento con otras permutaciones o volúmenes mayores.
- Idiomas soportados restringidos a tailandés e inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada en la información disponible, lo que impide garantizar el comportamiento con estados de entrada muy largos.
- Riesgo de sesgo heredado del corpus de preentrenamiento continuado en tailandés y de los conjuntos de evaluación empleados; no se documentan análisis de sesgo específicos.
- Riesgo de calibración imperfecta de las probabilidades, especialmente tras la cuantización de la tabla de embeddings, que altera el estado oculto que lee la cabeza.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda conservar los avisos de atribución correspondientes y verificar la licencia del modelo base y de los datos de entrenamiento.
- Para dominios sensibles (clínico, legal, financiero) los resultados deben tratarse como señal auxiliar, no como decisión final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iapp/OpenThai-SystemOne-MLX-nvfp4
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre el modelo, su paper o su repositorio; los resultados devueltos corresponden a la International Association of Privacy Professionals y no guardan relación con este modelo.
