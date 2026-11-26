# sergolsub/d3-flash-9B-MLX-8bit

## Resumen

d3-flash-9B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo vllm-sr/d3-flash, publicada por el usuario sergolsub. No se trata de un modelo de propósito general: la model card describe una API de decisión (`model.decide`) con cabezas de tarea específicas (binaria, elección múltiple, puntuación) y soporte de entrada de imagen, orientada a clasificar y enrutar casos concretos (por ejemplo, tickets de soporte) en lugar de generar texto libre. El modelo base tiene 8.392.695.024 parámetros reales según los safetensors, y esta versión ocupa 9,35 GB en disco frente a los 16,79 GB del bf16 original.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo de cuantización MLX con auditoría de calidad: el autor publica KL por tensor, KL de salida sobre probabilidades de decisión y checksums SHA-256 de todos los ficheros, lo que permite verificar que la pérdida de precisión es mínima (KL media de 2,96e-04 frente a bf16). Por otro, ofrece un punto de comparación directo con su variante de 4 bits, que pierde 3,3 puntos de accuracy (86,7 % frente a 90,0 %).

La información disponible es limitada en varios frentes: no hay datos sobre la arquitectura interna del modelo base, longitud de contexto, idiomas soportados ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Todo lo que sigue se limita a lo publicado en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5` con `custom_code`; sin detalle en la model card) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (sin indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe variante 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en layout MLX (4 shards), más `readout.safetensors` |
| Tamano en disco | 9,35 GB (bf16 original: 16,79 GB) |
| Biblioteca | mlx (`mlx_lm`) |
| Modelo base | vllm-sr/d3-flash |
| Descargas / likes | 336 / 0 |
| Fecha de creacion | 2026-10-24 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo base más allá de los tags del repositorio: `qwen3_5` y `custom_code`, lo que sugiere una variante de la familia Qwen 3.5 con código de carga personalizado. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card del repositorio de cuantización indica explícitamente que la conversión no implica reentrenamiento ni cambios de arquitectura: solo cuantización a 8 bits para MLX.

Lo que sí está documentado es la infraestructura de inferencia. El repositorio incluye `d3_mlx.py` (40,7 KB), `decision_config.json` y `joint_config.json`, que implementan las cabezas de decisión sobre el modelo de lenguaje. La API expone tres tipos de tarea: `noul` (pregunta binaria sí/no), `choice` (selección entre criterios con etiqueta) y `score` (puntuación sobre una lista ordenada de criterios). Además, el modelo acepta entrada de imagen (se midió con imágenes de 512x512), aunque la detección de cajas delimitadoras («box») no está soportada.

La auditoría de cuantización es el elemento técnico más destacable. Se compararon 759 tensores con KL de histograma sobre 512 bins: KL media de 2,17e-04 y máxima de 5,49e-03, concentrada en `language_model.layers.0.linear_attn.in_proj_a.weight`. La perplejidad de calibración pasa de 1,850 (bf16) a 1,843 (8 bits), es decir, no se degrada. El KL de salida sobre probabilidades de decisión es de 2,96e-04 de media (p95 1,09e-03, máximo 3,24e-03) sobre 100 filas de evaluación.

## Capacidades

- Clasificación y decisión estructurada mediante `model.decide`, con tres modos: binario (`noul`), elección entre criterios (`choice`) y puntuación ordinal (`score`).
- Procesamiento de texto y de imagen en la misma llamada (medido con imágenes de 512x512 acompañadas de texto).
- Enrutamiento de casos a equipos o categorías mediante el modo `choice` con criterios etiquetados.
- Evaluación de severidad o urgencia mediante el modo `score` con una escala de criterios ordenados.
- Respuestas binarias con instrucciones en lenguaje natural en el modo `noul`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni generación de texto libre en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modo `choice` permite asignar cada incidencia a un equipo (por ejemplo, `billing` o `shipping`) pasando criterios etiquetados; el ejemplo de la model card resuelve un caso de seguimiento de envío con esta llamada.
- Detección de intención de reembolso: el modo `noul` responde a preguntas binarias como «¿el cliente quiere un reembolso?» sobre el texto del ticket, lo que permite disparar flujos automáticos sin un LLM generativo completo.
- Priorización de incidencias técnicas: el modo `score` con criterios como `cosmetic`, `annoying` o `blocks` clasifica la severidad de errores (por ejemplo, «disk quota exceeded») para ordenar la cola de trabajo.
- Clasificación multimodal de capturas: al aceptar imagen más texto, puede etiquetar capturas de pantalla de errores o de la interfaz junto con la descripción del usuario, útil en soporte de aplicaciones móviles.
- Enrutamiento en bandeja de entrada compartida: con una latencia mediana de 646 ms en un Mac mini M4 Pro, es viable procesar cada mensaje entrante en tiempo casi interactivo dentro de un flujo de correo o chat.
- Despliegue local en estaciones Apple Silicon: al ocupar 9,35 GB y un pico de RSS de 9,96 GB, cabe en un Mac con 16 GB de memoria unificada, lo que permite ejecutar el clasificador sin enviar datos de clientes a la nube.
- Control de calidad de pipelines de etiquetado: la coincidencia exacta de accuracy entre bf16 y 8 bits (90,0 %) permite sustituir el modelo original por esta versión en entornos de anotación sin recalibrar umbrales.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación propia del autor sobre su conjunto de evaluación, no benchmarks estándar.

| Metrica | bf16 (original) | 8 bits (este repo) | 4 bits |
|---|---|---|---|
| Accuracy | 90,0 % | 90,0 % | 86,7 % |
| noul | 92,5 % | 92,5 % | 85,0 % |
| choice | 88,0 % | 88,0 % | 88,0 % |
| score | 88,0 % | 88,0 % | 88,0 % |
| Perplejidad de calibracion | 1,850 | 1,843 | 1,899 |
| KL de salida vs original (media) | referencia | 2,96e-04 | 2,14e-02 |
| Disco | 16,79 GB | 9,35 GB | 5,38 GB |
| Latencia mediana | 634 ms | 646 ms | 604 ms |
| Decision Index 0.4.1 | no disponible | 54,21 | no disponible |

Mediciones de inferencia en Mac mini M4 Pro de 48 GB con MLX 8 bits: carga en 4,41 s y pico de RSS de 9,96 GB. Texto de 512 tokens (479 reales), media de 5 ejecuciones tras 3 de calentamiento: 1317 ms (binario), 1417 ms (elección múltiple), 1316 ms (puntuación). Imagen de 512x512 más texto: 2279 ms, 2290 ms y 2276 ms respectivamente, con pico de RSS de 10,06 GB. La detección de cajas delimitadoras no está soportada.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el pico de RSS medido es de 9,96 GB en texto y 10,06 GB con imagen; el peso en disco es de 9,35 GB.
- Cabe en Apple Silicon con 16 GB de memoria unificada o más; el autor lo midió en un Mac mini M4 Pro de 48 GB.
- No hay datos de ejecución en GPU NVIDIA ni CUDA: el formato es MLX y la biblioteca declarada es `mlx`, por lo que el despliegue está orientado a Apple Silicon.
- Opciones de despliegue: `mlx_lm` con el cargador `d3_mlx.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 634-646 ms de mediana por decisión en texto; 1316-1417 ms para 479 tokens de entrada; 2276-2290 ms con imagen de 512x512.
- Throughput: no disponible.
- Para comparar, la variante de 4 bits ocupa 5,38 GB y reduce la latencia mediana a 604 ms, a costa de 3,3 puntos de accuracy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (eval del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| sergolsub/d3-flash-9B-MLX-8bit | 8,39 B | no disponible | 90,0 % | Apache 2.0 | MLX safetensors 8 bits |
| sergolsub/d3-flash-9B-MLX-4bit | 8,39 B | no disponible | 86,7 % | Apache 2.0 | MLX safetensors 4 bits |
| vllm-sr/d3-flash (bf16) | 8,39 B | no disponible | 90,0 % | Apache 2.0 | safetensors bf16 |

La comparación con modelos de otras familias no es posible con los datos disponibles: no se publican benchmarks estándar ni especificaciones de contexto que permitan situar este modelo frente a alternativas de clasificación o enrutamiento de propósito general. La comparación más informativa es interna, entre las tres versiones del mismo modelo: la de 8 bits iguala al bf16 en las cuatro métricas de accuracy y en perplejidad, mientras que la de 4 bits pierde 5 puntos en `noul` y 3,3 puntos en accuracy global.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni comportamiento fuera del conjunto de evaluación del autor; los porcentajes de accuracy (90,0 %) corresponden a un eval propio no publicado en detalle.
- El modelo está diseñado para tareas de decisión con cabezas específicas, no para generación de texto libre; usarlo como LLM conversacional no está soportado por la documentación.
- No se documentan la longitud de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en castellano o en entradas largas.
- La detección de cajas delimitadoras («box») no está soportada, lo que limita su uso en tareas de grounding visual o extracción de regiones.
- El despliegue está atado a MLX y Apple Silicon; no hay pesos GGUF ni compatibilidad declarada con CUDA, vLLM o llama.cpp.
- La licencia Apache 2.0 se hereda del modelo base; ante cualquier conflicto, prevalece la licencia del repositorio upstream `vllm-sr/d3-flash`.
- El repositorio incluye código Python personalizado (`d3_mlx.py`, 40,7 KB) que se ejecuta al cargar el modelo; conviene revisarlo y verificar los checksums SHA-256 publicados antes de usarlo en producción.
- El modelo tiene 0 likes y 336 descargas, y fue creado en octubre de 2026; la validación externa es escasa.
- La fecha de actualización (2026-11-22) es posterior a la de creación, pero no se detalla qué cambió entre versiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-flash-9B-MLX-8bit
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Variante de 4 bits: https://huggingface.co/sergolsub/d3-flash-9B-MLX-4bit
