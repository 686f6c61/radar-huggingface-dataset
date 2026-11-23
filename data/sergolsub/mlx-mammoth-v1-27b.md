# sergolsub/mlx-mammoth-v1-27B

## Resumen

sergolsub/mlx-mammoth-v1-27B es una conversión a 8 bits para MLX del modelo baselabs/mammoth-1, publicada por el usuario sergolsub. No se trata de un modelo entrenado desde cero, sino de una cuantización del checkpoint original en bf16 orientada a ejecución en Apple Silicon mediante la librería `mlx_lm`. El modelo cuenta con 27.356.728.560 parámetros (aproximadamente 27,4 mil millones) y un tamaño en disco de 30,41 GB en su variante de 8 bits.

El interés de esta publicación reside en que el autor documenta de forma exhaustiva el impacto de la cuantización: compara la calidad del modelo 8 bits frente al bf16 original con métricas de accuracy, PPL, KL de salida y KL a nivel de tensor, además de incluir checksums SHA-256 de todos los ficheros. Según sus mediciones en un Mac mini M4 Pro de 48 GB, la versión 8 bits mantiene e incluso mejora ligeramente algunas métricas de evaluación respecto al original, con una latencia mediana de decisión de 2215 ms.

La model card describe un uso orientado a "decisiones" estructuradas (tipos `noul`, `choice` y `score`) mediante una API Python propia (`onejev_mlx.OneJev`), lo que sugiere que el modelo base está especializado en tareas de clasificación y decisión más que en generación de texto libre. La licencia MIT se hereda del repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`; incluye capas `linear_attn`, según el audit de tensores) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (esta repo); existe variante 4-bit en repo separado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (layout MLX), 8 shards |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base baselabs/mammoth-1 más allá de la etiqueta `qwen3_5` y de la presencia de capas de atención lineal (`model.language_model.layers.0.linear_attn.in_proj_b.weight` aparece en el audit de cuantización). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Esta publicación concreta no implica reentrenamiento ni cambios de arquitectura: es una conversión a 8 bits para MLX. El autor aporta evidencia de la fidelidad de la cuantización mediante un audit tensor a tensor (1184 tensores comparados, KL medio 3,34e-04, KL máximo 5,71e-03, 581 tensores con KL distinto de cero) y un cálculo de KL a nivel de salida sobre las probabilidades de decisión (media 2,30e-04, p95 9,10e-04, máximo 3,35e-03 sobre 100 filas). La perplejidad de calibración pasa de 1,912 (bf16) a 1,913 (8 bits).

## Capacidades

- Toma de decisiones estructuradas: la API `OneJev.decide()` permite formular preguntas con tipos de respuesta `noul` (sí/no), `choice` (selección entre criterios) y `score` (puntuación sobre una escala de criterios).
- Clasificación y enrutamiento: el ejemplo de la model card muestra asignación de tickets a equipos (`billing`, `shipping`) a partir del texto de la incidencia.
- Evaluación de severidad: puntuación de impacto de incidencias sobre una escala definida por el usuario (`cosmetic`, `annoying`, `blocks`).
- Detección de intención: el ejemplo de reclamación de doble cobro ilustra la detección de intención de reembolso.
- Generación de texto libre: no documentada explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el modelo recibe el texto de la incidencia y devuelve la elección entre equipos definidos por criterios (`billing`, `shipping`), tal como muestra el ejemplo de la model card. Es adecuado porque la API de decisión está pensada exactamente para este tipo de clasificación con criterios explícitos.
- Detección de intención de reembolso: con una pregunta de tipo `noul` ("Does the customer want a refund?"), el modelo responde sí/no sobre el texto de la reclamación. Útil en flujos de atención al cliente donde se necesita un primer filtro binario antes de derivar a un humano.
- Priorización de incidencias: mediante el tipo `score` con criterios como `cosmetic`, `annoying` o `blocks`, se puede asignar severidad a errores de sistema (por ejemplo, "disk quota exceeded on the worker") para ordenar la cola de trabajo.
- Triaje en pipelines de soporte técnico: el modelo puede integrarse como primer paso de un sistema de gestión de incidencias, clasificando y puntuando antes de que intervenga un agente humano o un sistema de escalado.
- Ejecución local en Apple Silicon: con 30,41 GB en disco y 20,15 GB de memoria residente máxima medida en un Mac mini M4 Pro de 48 GB, es viable desplegarlo en estaciones de trabajo Mac para tareas de decisión sin depender de la nube.
- Procesamiento por lotes de decisiones: la model card reporta 0,78 decisiones cortas por segundo en modo sostenido, lo que permite procesar colas de clasificación de forma continua en hardware de consumo profesional.
- Validación de calidad de cuantización en investigación: el repositorio incluye scripts y datos (`kl_audit.json`, `output_kl.py`, `kl_weight_audit.py`) que sirven como referencia metodológica para estudiar el impacto de la cuantización 8 bits en modelos de ~27B.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones propias del autor sobre su conjunto de evaluación, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual, comparando versiones del mismo modelo.

| Version | Accuracy | noul | choice | score | PPL | KL salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 84,4% | 87,5% | 88,0% | 76,0% | 1,912 | referencia | 54,73 GB | 310062 ms |
| 8-bit (esta repo) | 85,6% | 90,0% | 88,0% | 76,0% | 1,913 | 2,30e-04 | 30,41 GB | 2215 ms |
| 4-bit | 85,6% | 87,5% | 92,0% | 76,0% | 1,928 | no registrado | 17,44 GB | 2222 ms |

Mediciones adicionales en Mac mini M4 Pro 48 GB con MLX 8 bits: carga en 9,42 s, memoria residente máxima 20,15 GB, throughput sostenido de 0,78 decisiones cortas por segundo, Decision Index 0.4.1 de 65,98.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 20,15 GB de memoria residente máxima medida para la variante 8 bits; el modelo ocupa 30,41 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor reporta mediciones en Mac mini M4 Pro de 48 GB. No hay datos para GPU NVIDIA (A100, H100, RTX 4090) porque el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 32 GB de memoria unificada (el pico medido es de 20,15 GB); la variante 4-bit ocupa 17,44 GB en disco y reduce los requisitos.
- Opciones de despliegue: `mlx_lm` (librería declarada) y el loader propio `onejev_mlx.OneJev` incluido en el repositorio. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de decisión de 2215 ms y 0,78 decisiones cortas por segundo en modo sostenido (Mac mini M4 Pro 48 GB, MLX 8 bits). Tiempo de carga: 9,42 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sergolsub/mlx-mammoth-v1-27B (esta repo) | 27,36B | no disponible | safetensors MLX 8-bit | MIT | 30,41 GB, 20,15 GB RAM pico, 2215 ms latencia mediana |
| sergolsub/mammoth-v1-27B-MLX-4bit | 27,36B (asumido, mismo base) | no disponible | safetensors MLX 4-bit | MIT | 17,44 GB, accuracy 85,6%, choice 92,0% |
| baselabs/mammoth-1 (original bf16) | 27,36B | no disponible | safetensors bf16 | MIT | 54,73 GB, accuracy 84,4%, latencia mediana 310062 ms |

No se dispone de información sobre otros modelos comparables de la misma categoría (misma tarea de decisión o mismo tamaño) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en tareas de decisión estructurada según la API documentada; no hay evidencia de capacidades de generación de texto libre, código o matemáticas.
- No se documentan los idiomas soportados; el único ejemplo de uso está en inglés, por lo que el rendimiento en castellano es desconocido.
- No se especifica la longitud de contexto soportada.
- El conjunto de evaluación es propio del autor (100 filas para el cálculo de KL), no benchmarks estándar; las métricas de accuracy, noul, choice y score no son directamente comparables con resultados publicados de otros modelos.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados.
- La licencia MIT se hereda del repositorio upstream; ante cualquier conflicto prevalece la LICENSE del repositorio original baselabs/mammoth-1.
- Solo es ejecutable en el ecosistema MLX (Apple Silicon); no hay pesos en GGUF ni compatibilidad declarada con runtimes CUDA.
- La cuantización 8 bits introduce una desviación medible respecto al bf16 (KL de salida medio 2,30e-04), aunque el autor reporta métricas de accuracy iguales o superiores en su evaluación.
- El repositorio incluye ficheros de código Python (`engine.py`, `*_mlx.py`) que deben revisarse antes de ejecutarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-mammoth-v1-27B
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Variante 4-bit: https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-4bit
- Variante 8-bit (referenciada en la tabla de versiones): https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-8bit
