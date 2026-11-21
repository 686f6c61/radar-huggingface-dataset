# OsaurusAI/Raptor-0.6.1-preview-JANG_6M

## Resumen
Raptor 0.6.1-preview-JANG_6M es una versión cuantizada y ajustada por supervisión (SFT) del modelo base XHToken/Spark-X2.5-4B, un transformer denso de 4.112 millones de parámetros (4,112B) especializado en razonamiento y uso de herramientas. Lo desarrolla OsaurusAI como parte de su entorno Osaurus, un harness de agentes para Apple Silicon, y está diseñado específicamente para decidir cuándo invocar una herramienta, cuál elegir, cómo recuperarse de errores y cuándo delegar a subagentes, tanto con modo de razonamiento activado (`<think>`) como desactivado.

La relevancia actual del modelo radica en su enfoque práctico: no es un modelo generalista, sino un ajuste fino orientado a decisiones de harness (tool calling, MCP, recuperación de fallos, confirmación antes de acciones destructivas) sobre una arquitectura propietaria (`spark2_5`) que no está soportada por `mlx-lm` estándar. El bundle JANG_6M aplica cuantización mixta (atención y embeddings atados a 8 bits, MLP a 6 bits) con calibración AWQ + GPTQ + imatrix, logrando un tamaño de 3.41 GiB apto para Apple Silicon con una fidelidad medida frente a los pesos bf16 originales.

La licencia Apache 2.0 y el formato MLX lo convierten en una opción interesante para desarrolladores que trabajan en ecosistema Apple y necesitan un modelo pequeño, rápido y especializado en agentes, aunque su soporte limitado a inglés y chino y su dependencia del runtime de Osaurus acotan su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`spark2_5`), no soportada por `mlx-lm` estándar |
| Parametros totales | 4.112.079.360 (4,112B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_6M: atención y embedding atado a 8 bits, MLP a 6 bits, group size 64, escalas en bfloat16, gates de atención por cabeza y normas en precisión completa; 7.126 bits/peso efectivos |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), bundle JANG_6M de 3.41 GiB |

## Arquitectura y entrenamiento
El modelo se basa en XHToken/Spark-X2.5-4B, un transformer denso de 4.112B parámetros con arquitectura `spark2_5`, tokenizador y plantilla de chat sin modificar respecto al base. El ajuste se realizó mediante LoRA SFT (rango 16, alpha 32) sobre matrices de atención y MLP (180 matrices, fusionadas en los pesos), frente a la iteración 1 que solo tocaba atención. El corpus de entrenamiento es un conjunto construido por el harness de Osaurus con aproximadamente 3.500 decisiones, combinando respuestas autodestiladas on-policy (las respuestas aceptadas del propio modelo base sustituyen a las escritas a mano cuando son correctas) y lotes específicos para debilidades detectadas: ambigüedad MCP, deshacer/recuperación, responder vs preguntar, planificación, descubrimiento de herramientas legacy, actuar sin afirmar, actuar pese al historial, confirmar antes de acciones destructivas y onboarding sin carpeta.

La innovación técnica principal es la cuantización calibrada: 1,69M tokens capturados sobre los propios pesos ajustados alimentan escalado activation-aware (72/72 sitios de fold de normas, 36/36 proyecciones de gate de atención), importancia por canal y ajuste con corrección de error (180/181 tensores; el holdout es el embedding atado). La calibración reduce la divergencia KL entre 2,6 y 2,9 veces frente al redondeo sin calibrar al mismo tamaño y velocidad, con ganancias mayores en conversaciones de harness (razonamiento activado −69%, desactivado −62%).

## Capacidades
- Generación de texto conversacional con modo de razonamiento activable (`<think>`) y desactivable.
- Uso de herramientas (tool calling) y function calling, con selección de herramienta y recuperación de errores.
- Decisiones de agente: cuándo llamar a una herramienta, cuándo responder directamente, cuándo preguntar al usuario.
- Delegación a subagentes y gestión de trabajo multi-paso.
- Confirmación antes de acciones destructivas y mecanismos de deshacer/recuperación.
- Descubrimiento de herramientas legacy y manejo de ambigüedad en servidores MCP.
- Razonamiento y matemáticas (heredados del base Spark-X2.5-4B).
- Capacidades multilingües limitadas a inglés y chino.
- Integración nativa con el harness Osaurus (runtime MLX incluido).

## Casos de uso
- Agentes locales en Apple Silicon: el modelo está diseñado para ejecutarse dentro de Osaurus en equipos con chip M-series, gestionando decisiones de tool calling con un tamaño de 3.41 GiB que cabe en memoria unificada de 16 GB o más.
- Orquestación de herramientas MCP: resuelve ambigüedad entre herramientas y descubre herramientas legacy, útil en pipelines de agentes que conectan múltiples servidores MCP.
- Automatización de tareas con confirmación: el ajuste específico en "confirmar antes de acciones destructivas" lo hace adecuado para asistentes que borran ficheros, envían correos o modifican sistemas.
- Delegación a subagentes: puede repartir trabajo entre subagentes en flujos multi-paso, con recuperación de errores y deshacer integrados.
- Asistentes de desarrollo con tool calling: integrable en pipelines que invocan funciones de código, ejecutan comandos y gestionan errores de ejecución.
- Onboarding sin carpeta: el modelo está entrenado para operar cuando no existe estructura de proyecto previa, útil en asistentes de primera configuración.
- Razonamiento con y sin thinking mode: permite alternar entre respuestas rápidas (sin `<think>`) y trazas de razonamiento para tareas complejas, según latencia requerida.

## Benchmarks y rendimiento
Resultados de la suite del harness Osaurus (3 semillas por modelo, promedio por caso, bootstrap 95% CI, Bonferroni por categoría), comparando la iteración 2 con la iteración 1:

| Comparación vs iteración 1 | Casos | Delta [95% CI] | Ganancias significativas | Pérdidas significativas |
|---|---|---|---|---|
| Semántica principal Osaurus (llamadas paralelas válidas) | 488 | +4,3 [+2,0, +6,7] | no-tool answers +17, sandbox +20 | ninguna |
| Scoring original del harness | 488 | +7,3 [+4,8, +9,8] | no-tool +17, sandbox +23 | ninguna |
| 3 system prompts | 1464 | +4,8 [+2,9, +6,7] | clarification +13, no-tool +13, sandbox +14 | ninguna |
| Precisión JANG_6M (emulada) | 488 | +4,9 [+2,5, +7,4] | clarification +12, delegation +20 | ninguna |

Fidelidad de cuantización (divergencia KL en nats por posición y acuerdo top-1 frente a bf16, forward de secuencia completa sobre conjuntos held-out):

| Conjunto held-out | Tokens | Bundle (AWQ + GPTQ + imatrix) | Redondeo sin calibrar |
|---|---:|---|---|
| Conversaciones de harness + generaciones propias | 113.883 | KL medio 0,0140 · top-1 96,75% | 0,0402 · 94,42% |
| Prompts mixtos (harness, código, tool calls, general) | 307.300 | KL medio 0,0102 · top-1 97,45% | 0,0268 · 95,82% |

Rendimiento de inferencia (mediana de 4 sondas, prompt de 512 tokens, 128 generados, M5 Max):

| Métrica | Iteración 2 | Iteración 1 |
|---|---|---|
| Tamaño en disco | 3,41 GiB | 3,41 GiB |
| Bits/peso | 7,126 | 7,126 |
| Decode | 105,4 tok/s | 104,8 tok/s |
| Prefill | 5042 tok/s | 5087 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM/memoria unificada: 3,41 GiB de pesos en disco; requiere memoria unificada suficiente para pesos más caché KV, estimada en torno a 5-6 GB para contextos moderados (no confirmado en la información disponible).
- GPU recomendadas: Apple Silicon de la familia M-series; los datos de rendimiento se midieron en un M5 Max.
- Compatibilidad con GPU consumer: no aplica a GPU NVIDIA/AMD; el formato es MLX y está pensado para Apple Silicon. Cabe en equipos Apple con 16 GB de memoria unificada o más.
- Opciones de despliegue: runtime MLX incluido en el harness Osaurus (requiere Osaurus 0.25.0 o superior, declarado en `osaurus.json`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que `mlx-lm` no soporta la arquitectura `spark2_5`.
- Latencia y throughput: 105,4 tok/s de decode y 5042 tok/s de prefill en M5 Max con prompt de 512 tokens y 128 generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/runtime | Notas |
|---|---|---|---|---|---|
| Raptor 0.6.1-preview-JANG_6M | 4,112B denso | no disponible | Apache 2.0 | MLX (Osaurus) | Ajuste específico para harness de agentes; solo en/zh |
| XHToken/Spark-X2.5-4B (base) | 4,112B denso | no disponible | no disponible | safetensors | Modelo base sin ajuste de harness; razonamiento + tool use |
| Raptor 0.5 (retirado) | no disponible | no disponible | no disponible | MLX | Backbone diferente (Ling-3.0-tiny hybrid MoE); no comparable directamente |

No se dispone de datos de benchmarks estándar para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias
- Idiomas limitados a inglés y chino; no hay evaluación de fidelidad de cuantización en slices chinos (aunque la comprobación de comportamiento en respuestas chinas pasa).
- El conjunto de calibración no contiene chino, elección múltiple académica ni texto de más de 4K tokens; la fidelidad de cuantización en esos slices no está medida por separado.
- Dependencia total del runtime Osaurus 0.25.0+; no hay comparación con MLX estándar porque `mlx-lm` no soporta `spark2_5`.
- Riesgo de alucinación: la model card indica que dosis mayores de entrenamiento produjeron un aumento de fabricación, por lo que se eligió un checkpoint temprano (6 de 16 updates); persiste riesgo residual.
- Es un ajuste específico para decisiones de harness, no un modelo generalista; su rendimiento fuera de ese dominio no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base XHToken/Spark-X2.5-4B.
- Los resultados de benchmarks son comparaciones internas contra la iteración 1, no contra modelos de terceros; no son directamente comparables con métricas estándar.
- El bundle es una preview (0.6.1-preview) con iteraciones recientes; puede cambiar sin aviso.

## Enlaces
- [Hugging Face: OsaurusAI/Raptor-0.6.1-preview-JANG_6M](https://huggingface.co/OsaurusAI/Raptor-0.6.1-preview-JANG_6M)
- [Modelo base: XHToken/Spark-X2.5-4B](https://huggingface.co/XHToken/Spark-X2.5-4B)
- [Web de Osaurus](https://osaurus.ai)
- [Ficha del modelo Raptor 0.6](https://osaurus.ai/models/raptor-06)
- [Anuncio del blog Raptor 0.6](https://osaurus.ai/blog/raptor-06)
