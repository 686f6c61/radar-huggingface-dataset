# sergolsub/mammoth-v1-27B-MLX-8bit

## Resumen

`sergolsub/mammoth-v1-27B-MLX-8bit` es una conversión cuantizada a 8 bits en formato MLX del modelo `baselabs/mammoth-1`, publicada por el usuario sergolsub. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución optimizada para Apple Silicon mediante la librería `mlx_lm`, pensada para ejecutar inferencia local en equipos Mac con memoria unificada. El modelo base pertenece a la familia `qwen3_5` según los tags de Hugging Face y cuenta con 27.356.728.560 parámetros totales.

La relevancia de esta ficha radica en su doble naturaleza: por un lado, documenta un modelo de 27B con una arquitectura que combina atención lineal (`linear_attn`) y atención estándar, y por otro, expone un caso práctico de cuantización verificada con métricas de divergencia KL frente a los pesos originales en bf16. El autor publica auditorías de calidad por tensor, checksums SHA-256 y comparativas entre las versiones de 8 y 4 bits, lo que permite evaluar la pérdida de fidelidad de forma cuantitativa.

El modelo está orientado a tareas de decisión estructurada (clasificación tipo `noul`, `choice` y `score`) más que a generación de texto libre, según se desprende de la interfaz de uso documentada. La licencia MIT facilita su adopción comercial, y el tamaño del repositorio (30,4 GB) lo sitúa en el rango de equipos con 32 GB o más de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal (`linear_attn`) y atención estándar; familia `qwen3_5` |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe versión 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (layout MLX), 8 shards |
| Tamano en disco | 30,41 GB |
| Libreria | mlx |
| Modelo base | baselabs/mammoth-1 |
| Fecha de creacion | 2026-10-23 |
| Ultima actualizacion | 2026-11-23 |
| Descargas | 412 |

## Arquitectura y entrenamiento

La arquitectura del modelo base corresponde a la familia `qwen3_5`, un transformer con capas de atención lineal identificadas explícitamente en la auditoría de cuantización (el peor tensor en términos de KL es `model.language_model.layers.0.linear_attn.in_proj_b.weight`). Esto sugiere una hibridación entre mecanismos de atención lineal y atención completa, típica de las arquitecturas recientes que buscan reducir el coste computacional en contextos largos. El repositorio incluye además ficheros `decision_config.json` y `joint_config.json`, lo que indica la presencia de cabeceras específicas para tareas de decisión y un modo "joint" de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión a 8 bits no implica reentrenamiento ni cambios arquitectónicos, tal como declara el autor. La innovación técnica destacable de esta publicación es la verificación de calidad de la cuantización: se reporta una KL media a nivel de tensor de 3,34e-04 (máximo 5,71e-03 sobre 1184 tensores comparados) y una KL de salida media de 2,30e-04 sobre 100 filas de evaluación, lo que indica una degradación muy baja respecto a bf16.

## Capacidades

- Decisión estructurada: el modelo expone una interfaz `decide()` que resuelve tareas de tipo `noul` (pregunta booleana), `choice` (selección entre criterios) y `score` (puntuación sobre una escala de criterios).
- Clasificación y enrutamiento: puede asignar tickets o incidencias a equipos según criterios definidos en la llamada.
- Evaluación de severidad: puntúa el impacto de un evento sobre una escala cualitativa proporcionada por el usuario.
- Inferencia local en Apple Silicon mediante `mlx_lm` y el cargador `onejev_mlx`.
- Generación de texto: no disponible explícitamente en la documentación; la interfaz documentada se centra en decisiones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y un conjunto de criterios (`billing`, `shipping`, etc.) y devuelve el equipo responsable, como se muestra en el ejemplo de la model card con el pedido #7821.
- Detección de intención de reembolso: mediante una decisión de tipo `noul`, el modelo responde si el cliente solicita un reembolso a partir del texto libre, útil en flujos de atención al cliente automatizada.
- Triaje de severidad de incidencias: con decisiones de tipo `score`, se clasifica un error (por ejemplo, "disk quota exceeded") en una escala como `cosmetic`, `annoying` o `blocks`, lo que permite priorizar colas de trabajo.
- Clasificación de correos o mensajes entrantes: la interfaz de decisión permite asignar categorías predefinidas a mensajes sin necesidad de un modelo generativo completo.
- Procesamiento local en Mac: gracias a los 20,15 GB de memoria residente máxima medida en un Mac mini M4 Pro de 48 GB, es viable desplegar el modelo en estaciones de trabajo Apple sin GPU dedicada.
- Evaluación de calidad de cuantización: el repositorio sirve como referencia para equipos que necesiten validar la pérdida de fidelidad de sus propias cuantizaciones, con scripts como `output_kl.py` y `kl_weight_audit.py`.
- Moderación o filtrado por criterios: la decisión de tipo `choice` con criterios arbitrarios permite implementar clasificadores configurables sin reentrenamiento.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a una evaluación propia sobre un conjunto de decisión, no a benchmarks estándar como MMLU o HumanEval.

| Version | Accuracy | noul | choice | score | PPL | KL salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 84,4 % | 87,5 % | 88,0 % | 76,0 % | 1,912 | referencia | 54,73 GB | 310062 ms |
| 8 bits (esta ficha) | 85,6 % | 90,0 % | 88,0 % | 76,0 % | 1,913 | 2,30e-04 | 30,41 GB | 2215 ms |
| 4 bits | 85,6 % | 87,5 % | 92,0 % | 76,0 % | 1,928 | 8,26e-03 | 17,44 GB | 2222 ms |

Divergencia KL por fila (nats) frente a la referencia bf16:

| Par | Filas | Media | p95 | Max |
|---|---|---|---|---|
| original → 8 bits | 100 | 2,30e-04 | 9,10e-04 | 3,35e-03 |
| 8 bits → 4 bits | 100 | 8,47e-03 | 3,86e-02 | 1,31e-01 |
| original → 4 bits | 100 | 8,26e-03 | 4,05e-02 | 1,29e-01 |

El autor reporta además un Decision Index 0.4.1 de 65,98. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria residente máxima medida: 20,15 GB en un Mac mini M4 Pro con 48 GB de memoria unificada.
- Tiempo de carga medido: 9,42 s.
- Latencia mediana por decisión: 2215 ms; throughput sostenido de 0,78 decisiones cortas por segundo.
- Cabe en equipos Apple Silicon con 32 GB de memoria unificada o superior; el autor lo valida en 48 GB.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente, ya que el formato es MLX y está pensado para Apple Silicon; no se documenta soporte CUDA.
- Despliegue: `mlx_lm` y el cargador propio `onejev_mlx` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Existe una variante de 4 bits (17,44 GB en disco) para equipos con menos memoria, con latencia mediana similar (2222 ms) y mayor divergencia KL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/mammoth-v1-27B-MLX-8bit | 27,36B | no disponible | MIT | safetensors MLX 8 bits | Esta ficha; 30,41 GB, latencia 2215 ms |
| sergolsub/mammoth-v1-27B-MLX-4bit | 27,36B | no disponible | MIT | safetensors MLX 4 bits | 17,44 GB, KL mayor (8,26e-03) |
| baselabs/mammoth-1 (bf16) | 27,36B | no disponible | MIT | safetensors bf16 | Referencia original, 54,73 GB, latencia 310062 ms |
| Qwen3.5 (familia base) | no disponible | no disponible | no disponible | no disponible | Familia arquitectónica declarada en los tags; sin datos verificables en esta información |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisiones estructuradas; no se documenta su comportamiento en generación de texto libre, código o matemáticas.
- No se especifican los idiomas soportados; la evaluación se realizó presumiblemente en inglés según los ejemplos, pero no se confirma.
- La longitud de contexto no está documentada, lo que impide planificar su uso en conversaciones multi-turno largas.
- Riesgo de alucinación no evaluado en la información disponible; la naturaleza de clasificación reduce pero no elimina este riesgo en las etiquetas de decisión.
- La cuantización a 8 bits introduce una divergencia KL de 2,30e-04 frente a bf16, muy baja pero no nula; en dominios sensibles conviene validar contra el modelo original.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU x86.
- La licencia MIT se hereda del modelo base, pero el autor advierte de que prevalece la licencia del repositorio upstream en caso de conflicto.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El número de descargas (412) y la ausencia de likes sugieren una adopción todavía limitada; conviene tratar el modelo como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-8bit
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Versión 4 bits: https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-4bit
