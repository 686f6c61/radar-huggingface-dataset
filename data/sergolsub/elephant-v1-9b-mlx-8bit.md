# sergolsub/elephant-v1-9B-MLX-8bit

## Resumen

Elephant-v1-9B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo base `baselabs/elephant-1`, publicada por el usuario sergolsub. No se trata de un modelo nuevo entrenado desde cero, sino de una versión optimizada para su ejecución en Apple Silicon mediante la librería `mlx_lm`. El peso de los parámetros originales (9.409.813.744) se mantiene íntegro; la conversión solo aplica cuantización de 8 bits sin cambios arquitectónicos ni reentrenamiento.

El modelo destaca por incorporar una "cabeza de decisión" (decision head) que permite formular tareas de clasificación estructurada —binaria, de elección múltiple o de puntuación— a partir de texto e imágenes. Según la model card, la versión de 8 bits conserva prácticamente intacta la calidad del bf16 original: precisión del 92,2 %, PPL de calibración de 1,769 frente a 1,771, y una KL de salida media de 3,05e-04. Todo ello con un tamaño en disco de 11,4 GB frente a los 18,84 GB del original.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desarrolladores que trabajan en Mac con chip M-series y necesitan desplegar un modelo de ~9B parámetros con capacidades de decisión estructurada sin depender de GPU dedicadas. La licencia MIT del modelo original se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, según tag); incluye módulos de atención lineal (`linear_attn`) y cabeza de decisión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según los tags) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe también una versión 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 3 shards) + archivos de configuración y glue de inferencia (`*_mlx.py`, `decision_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia `qwen3_5`, según los tags del repositorio, e incorpora capas de atención lineal (`linear_attn`) junto con atención estándar. El modelo base `baselabs/elephant-1` incluye una cabeza de decisión que permite plantear preguntas estructuradas con tipos `noul` (sí/no), `choice` (elección entre criterios) y `score` (puntuación sobre una escala). Esta versión MLX no modifica la arquitectura: solo cuantiza los pesos a 8 bits y añade el glue de inferencia necesario (`onejev_mlx`, `engine.py`, `decision_config.json`, `joint_config.json`) para ejecutar el modelo con `mlx_lm` en Apple Silicon.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La model card de esta conversión no documenta esos detalles y se limita a describir el proceso de cuantización. La auditoría de pesos incluida (`kl_audit.json`) compara 760 tensores entre el original y la versión 8 bits, con una KL media de 2,16e-04 y un máximo de 5,57e-03 en la capa `model.language_model.layers.0.linear_attn.in_proj_a.weight`.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base `baselabs/elephant-1`.
- Decisión estructurada: clasificación binaria (`noul`), elección múltiple (`choice`) y puntuación ordinal (`score`) mediante la cabeza de decisión.
- Procesamiento de imagen: la model card reporta latencias para entradas de imagen 512x512 combinadas con texto, lo que indica capacidades multimodales de entrada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Detección de cajas (box): la model card indica explícitamente "Box: not supported".

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar automáticamente si un cliente solicita un reembolso (`noul`), asignar el ticket al equipo adecuado (`choice` entre facturación y envíos) o puntuar la severidad de una incidencia (`score`). La latencia medida de 657 ms por decisión permite integrarlo en un pipeline de atención al cliente en tiempo real.
- Enrutamiento de incidencias técnicas: con la modalidad `choice`, se puede dirigir un error de exportación o un fallo de cuota de disco al equipo correspondiente, usando los criterios definidos en la llamada.
- Moderación de contenido con imagen: al aceptar entradas de imagen 512x512 junto con texto (2,4 s por decisión), puede emplearse para clasificar publicaciones que combinan texto e imagen en categorías predefinidas.
- Priorización de colas de soporte: la modalidad `score` con criterios ordinales ("cosmetic", "annoying", "blocks") permite ordenar incidencias por impacto sin necesidad de un modelo generativo adicional.
- Automatización de formularios y encuestas: la clasificación binaria (`noul`) sobre respuestas de texto libre permite extraer intenciones de forma estructurada y alimentar bases de datos relacionales.
- Despliegue en estaciones de trabajo Mac: al ejecutarse con `mlx_lm` en un Mac mini M4 Pro con 48 GB de RAM (12,21 GB de RSS pico), es adecuado para prototipado y producción ligera en entornos sin GPU NVIDIA.
- Evaluación de calidad de conversaciones: la modalidad `score` puede puntuar interacciones de chat según criterios definidos por el equipo, con una precisión del 88 % reportada en el conjunto de evaluación del autor.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación propia del autor de la conversión, no de benchmarks estándar como MMLU o HumanEval.

| Metrica | Original (bf16) | 8 bits (MLX) | 4 bits (MLX) |
|---|---|---|---|
| Precisión | 92,2 % | 92,2 % | 86,7 % |
| `noul` | 95,0 % | 95,0 % | 92,5 % |
| `choice` | 92,0 % | 92,0 % | 84,0 % |
| `score` | 88,0 % | 88,0 % | 80,0 % |
| PPL de calibración | 1,771 | 1,769 | 1,897 |
| KL de salida vs original | — (referencia) | 3,05e-04 | 3,28e-02 |
| Tamaño en disco | 18,84 GB | 11,4 GB | 7,43 GB |
| Latencia mediana | 735 ms | 657 ms | 1654 ms |

| Metrica adicional (8 bits, Mac mini M4 Pro 48 GB) | Valor |
|---|---|
| Carga del modelo | 5,08 s |
| RSS pico | 12,21 GB |
| Texto 512 tokens (492 tok), media de 5 tras 3 warm-ups | 1425-1435 ms |
| Imagen 512x512 + texto | 2400-2407 ms |
| Decisiones cortas sostenidas | 2,56/s |
| Decision Index 0.4.1 | 62,11 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 12,21 GB de RSS pico medidos en MLX 8 bits; el modelo ocupa 11,4 GB en disco.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4). La medición oficial se realizó en un Mac mini M4 Pro con 48 GB de memoria unificada.
- Compatibilidad con GPU consumer NVIDIA: no disponible; el formato MLX está diseñado para Apple Silicon.
- Cabe en consumer GPU: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada (recomendable 24 GB o más para margen).
- Opciones de despliegue: `mlx_lm` (librería oficial), el runtime `onejev_mlx` incluido en el repositorio, y el servidor `/v1/systemone` mencionado en la model card.
- Latencia y throughput: 657 ms de latencia mediana por decisión; 2,56 decisiones cortas por segundo sostenidas; 1,4 s para 512 tokens de texto; 2,4 s para imagen 512x512 + texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sergolsub/elephant-v1-9B-MLX-8bit | 9,41B | no disponible | MIT | safetensors MLX 8-bit | Hugging Face |
| sergolsub/elephant-v1-9B-MLX-4bit | 9,41B | no disponible | MIT | safetensors MLX 4-bit | Hugging Face |
| baselabs/elephant-1 (bf16) | 9,41B | no disponible | MIT | safetensors bf16 | Hugging Face |

La comparación con modelos de otras familias (por ejemplo, Qwen 2.5 7B o Llama 3.1 8B) no está disponible en la información proporcionada, ya que no se han publicado resultados de benchmarks estándar para elephant-1 que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación: no cuantificado en la información disponible. La cabeza de decisión está diseñada para tareas cerradas, lo que reduce el riesgo en ese modo, pero la generación libre no ha sido evaluada.
- Limitaciones de contexto e idioma: no se especifican ni la longitud de contexto ni los idiomas soportados.
- La modalidad de detección de cajas ("box") no está soportada explícitamente.
- La licencia MIT se hereda del modelo original; en caso de conflicto, prevalece la licencia del repositorio upstream `baselabs/elephant-1`.
- La conversión no ha sido validada con benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K); las métricas reportadas son de evaluación propia del autor y podrían no ser representativas.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente portable a CUDA, ROCm ni CPU genérica sin reconversión.
- El repositorio tiene un número reducido de descargas (345) y ningún "like", lo que sugiere una validación comunitaria limitada.
- La fecha de creación (2026-10-24) y actualización (2026-11-22) indican que el modelo es muy reciente; puede haber cambios en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/elephant-v1-9B-MLX-8bit
- Modelo base (bf16): https://huggingface.co/baselabs/elephant-1
- Versión 4 bits del mismo autor: https://huggingface.co/sergolsub/elephant-v1-9B-MLX-4bit
- Librería MLX: https://github.com/ml-explore/mlx
- Documentación de `mlx_lm`: https://github.com/ml-explore/mlx-examples/tree/main/llms
