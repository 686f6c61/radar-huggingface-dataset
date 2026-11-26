# sergolsub/onejev-v1.5-9B-MLX-8bit

## Resumen

OneJev1.5 9B (MLX 8-bit) es una conversión cuantizada a 8 bits del modelo OmniJev/OneJev1.5-9B, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales se han cuantizado a 8 bits sin cambios de arquitectura, conservando la licencia Apache 2.0 del repositorio upstream. El resultado ocupa 11,4 GB en disco frente a los 18,84 GB de los pesos bf16 originales.

El modelo subyacente pertenece a la familia Qwen3.5 (tag `qwen3_5` en Hugging Face) y cuenta con 9.409.813.744 parámetros totales según los safetensors. Su rasgo diferencial no es la generación de texto libre, sino una interfaz de decisión estructurada (`model.decide`) que clasifica entradas de texto o imagen+texto en cuatro tipos de tarea: binaria (`binary`), sí/no (`noul`), elección entre criterios (`choice`) y puntuación ordinal (`score`), devolviendo probabilidades de decisión.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~9B en un Mac mini M4 Pro con 48 GB de memoria unificada, con una calidad medida muy cercana al bf16 (83,3 % frente a 84,4 % de accuracy en el conjunto de evaluación del autor) y una divergencia KL media de solo 2,06e-04 respecto a los pesos originales. Es, por tanto, una opción práctica para clasificación y enrutamiento de tickets en local sobre hardware de consumo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con atención lineal en las primeras capas (`linear_attn`); incluye cabecera de decisión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe una variante 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de los pesos upstream) |
| Formato de pesos | safetensors en layout MLX (3 shards: 4,03 GB + 4,04 GB + 3,32 GB) |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base OneJev1.5-9B: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO o alguna fase de alineación. Lo que sí se deduce de los artefactos publicados es la arquitectura: un transformer con capas de atención lineal (`model.language_model.layers.0.linear_attn.in_proj_a.weight` aparece en la auditoría KL) y una cabecera de decisión separada, con ficheros de configuración propios (`decision_config.json`, `joint_config.json`) y un módulo de inferencia (`onejev_mlx.py`) que expone el método `decide`.

Esta conversión concreta no introduce innovaciones de entrenamiento: es una cuantización post-entrenamiento a 8 bits en formato MLX. El autor documenta una auditoría de calidad a dos niveles. A nivel de pesos, compara cada tensor original con su versión desquantizada mediante KL sobre histogramas de 512 bins: 760 tensores comparados, KL media 2,17e-04, KL máxima 5,65e-03, con 249 tensores con divergencia no nula. A nivel de salida, calcula la KL de las probabilidades de decisión sobre 100 filas de evaluación: media 2,06e-04, p95 7,38e-04, máximo 2,25e-03. La perplejidad de calibración queda en 1,985 frente a 1,988 del bf16, es decir, prácticamente idéntica.

## Capacidades

- Clasificación de decisión estructurada en cuatro modos: `binary` (dos opciones), `noul` (sí/no), `choice` (selección entre criterios con descripción) y `score` (puntuación ordinal sobre una escala de criterios).
- Procesamiento multimodal texto+imagen: el autor reporta mediciones con entrada de imagen 512x512 acompañada de texto, con latencias de aproximadamente 2,3 s por decisión.
- Enrutamiento y triaje: ejemplo documentado de asignación de tickets a equipos (`billing`, `shipping`) mediante el modo `choice`.
- Evaluación de severidad: ejemplo documentado de puntuación de impacto (`cosmetic`, `annoying`, `blocks`) mediante el modo `score`.
- Detección de intención: ejemplo documentado de detección de solicitud de reembolso mediante el modo `noul`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada. La model card indica explícitamente que el modo `box` (detección de cajas) no está soportado.

## Casos de uso

- Triaje automático de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de criterios con descripción (por ejemplo, `billing` frente a `shipping`) y devuelve la probabilidad de cada categoría. Encaja porque el modo `choice` está diseñado exactamente para esta tarea y la latencia medida de 1,65 s por decisión es aceptable para un pipeline asíncrono.
- Detección de intención en atención al cliente: con el modo `noul` se puede determinar si el usuario solicita un reembolso, una cancelación o una escalada antes de enrutar la conversación a un humano o a un flujo automatizado.
- Priorización de incidencias: usando el modo `score` con una escala ordinal (`cosmetic`, `annoying`, `blocks`), el modelo asigna severidad a errores de sistema o reportes de usuarios, lo que permite ordenar colas de trabajo en herramientas de ticketing.
- Clasificación de imágenes en flujos de soporte: con entradas de 512x512 más texto, puede evaluar capturas de pantalla de errores o fotos de producto adjuntas a una reclamación, con una latencia de unos 2,3 s por decisión en un M4 Pro.
- Ejecución local en hardware Apple: al ser una conversión MLX de 11,4 GB con un pico de memoria residente de 12,21 GB, cabe en un Mac mini M4 Pro de 48 GB y permite procesar datos sensibles sin enviarlos a la nube, algo relevante para clasificación de contenido confidencial.
- Filtrado y moderación de contenido: el modo `binary` permite etiquetar entradas como aptas o no aptas con una sola llamada, con un rendimiento sostenido medido de 0,79 decisiones cortas por segundo.
- Enrutamiento en pipelines de automatización: combinado con un orquestador, el modelo puede decidir qué herramienta o equipo debe procesar cada evento entrante, sustituyendo reglas heurísticas por un clasificador entrenado.

## Benchmarks y rendimiento

El autor publica una evaluación propia (no benchmarks estándar como MMLU o HumanEval) sobre un conjunto de 100 filas, comparando los pesos originales bf16 con las versiones MLX de 8 y 4 bits, todas medidas en la misma máquina (Mac mini M4 Pro 48 GB):

| Version | Accuracy | noul | choice | score | PPL | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 84,4 % | 87,5 % | 80,0 % | 84,0 % | 1,988 | referencia | 18,84 GB | 747 ms |
| 8 bits (esta ficha) | 83,3 % | 87,5 % | 80,0 % | 80,0 % | 1,985 | 2,06e-04 | 11,4 GB | 1650 ms |
| 4 bits | 84,4 % | 90,0 % | 80,0 % | 80,0 % | 2,055 | 1,34e-02 | 7,43 GB | 1591 ms |

Métricas de ejecución medidas en el mismo equipo con MLX 8 bits:

| Métrica | Valor |
|---|---|
| Tiempo de carga | 5,09 s (3,82 s en la medición en disco) |
| Pico de memoria residente | 12,21 GB |
| Texto 512 tokens (492 tok), media de 5 tras 3 de calentamiento | 1425 ms (binary) / 1427 ms (multichoice) / 1427 ms (score) |
| Imagen 512x512 + texto | 2327 ms (binary) / 2328 ms (multichoice) / 2328 ms (score) |
| Latencia mediana de decisión | 1650 ms |
| Rendimiento sostenido | 0,79 decisiones cortas/s |
| Modo `box` | no soportado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 12,21 GB de pico residente medido en MLX 8 bits; el repo ocupa 11,4 GB en disco.
- Hardware de referencia del autor: Mac mini M4 Pro con 48 GB de memoria unificada, con tiempos de carga de 5,09 s y latencia mediana de 1,65 s por decisión.
- GPU NVIDIA: no hay mediciones publicadas para CUDA en la información disponible; al ser pesos en layout MLX, no son directamente utilizables en vLLM o TGI sin conversión.
- GPU de consumo: no se han publicado mediciones en RTX 4090 u otras GPU consumer; el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: `mlx_lm` mediante el módulo `onejev_mlx.py` incluido en el repo; también existe la variante de 4 bits (7,43 GB) para equipos con menos memoria.
- Throughput: 0,79 decisiones cortas por segundo en modo sostenido; 1425-1427 ms por decisión de texto de 512 tokens y 2327-2328 ms con imagen 512x512.
- Nota: la variante de 4 bits, pese a ocupar menos, presentó una latencia mediana ligeramente inferior (1591 ms) pero mayor perplejidad (2,055) y mayor divergencia KL (1,34e-02).

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos de la misma categoría. La única comparación documentada es interna, entre las tres versiones del propio OneJev1.5-9B:

| Modelo | Parametros | Contexto | Accuracy (eval del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| OneJev1.5-9B original (bf16) | 9,41B | no disponible | 84,4 % | Apache 2.0 | safetensors |
| OneJev1.5-9B MLX 8 bits (esta ficha) | 9,41B | no disponible | 83,3 % | Apache 2.0 | safetensors MLX |
| OneJev1.5-9B MLX 4 bits | 9,41B | no disponible | 84,4 % | Apache 2.0 | safetensors MLX |

Comparativa con modelos alternativos de la misma categoría o tamaño: no disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, comportamiento multilingüe ni tasas de alucinación; no hay información para evaluar estos riesgos.
- El modelo está diseñado para decisiones estructuradas, no para generación de texto libre; usarlo fuera de la interfaz `decide` puede producir resultados no representativos.
- El modo `box` (detección de cajas) no está soportado, lo que limita su uso en tareas de localización visual.
- La cuantización a 8 bits reduce la accuracy del conjunto de evaluación del autor en 1,1 puntos (83,3 % frente a 84,4 %) y la puntuación `score` en 4 puntos (80,0 % frente a 84,0 %), aunque la perplejidad de calibración mejora ligeramente.
- Los pesos están en layout MLX: no son directamente compatibles con vLLM, TGI o llama.cpp sin conversión previa, lo que restringe el despliegue a Apple Silicon o a un paso adicional de transformación.
- La licencia Apache 2.0 permite uso comercial, pero la model card indica que, en caso de conflicto, prevalece la licencia del repositorio upstream (OmniJev/OneJev1.5-9B), que conviene verificar antes de un despliegue en producción.
- El modelo no ha recibido validación independiente: las métricas proceden del propio autor de la conversión y de un conjunto de evaluación de 100 filas, un tamaño reducido para extraer conclusiones robustas.
- La fecha de creación del repositorio (2026-10-24) y la ausencia de likes y de pipeline declarado sugieren un modelo de nicho con poca tracción comunitaria; no hay evidencia de mantenimiento a largo plazo.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide garantizar su comportamiento en documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/onejev-v1.5-9B-MLX-8bit
- Modelo base (upstream): https://huggingface.co/OmniJev/OneJev1.5-9B
- Variante de 4 bits del mismo autor: https://huggingface.co/sergolsub/onejev-v1.5-9B-MLX-4bit
- Papers, blogs, repos adicionales o demos: no disponible en la información proporcionada.
