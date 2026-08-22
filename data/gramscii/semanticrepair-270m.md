# Gramscii/SemanticRepair-270M

## Resumen

SemanticRepair-270M es un modelo de reescritura de consultas (query rewriting) de 268 millones de parámetros, desarrollado por Gramscii, que se sitúa detrás de un router de embeddings. Su función es específica y limitada: cuando una pregunta no aterriza en ninguna capacidad del router con suficiente margen, el modelo la reformula en la forma plana en la que están descritas las capacidades, y el router reintenta con la reformulación. Si no detecta ninguna petición, emite el token único `NO_REQUEST`. No responde preguntas, no decide nada y nada de lo que escribe se ejecuta directamente: el router opera sobre la reformulación y la herramienta sobre el texto original.

El modelo se construyó sobre la base `google/gemma-3-270m` (el modelo base, no el instruct), con un ajuste fino supervisado completo seguido de una etapa de refuerzo GRPO cuya recompensa es el resultado de enrutamiento en sí. Sustituyó a un Qwen3-1.7B en ese puesto, cubriendo cuatro preguntas más con una sexta parte del tamaño y sin cometer errores en peticiones reales. Su relevancia radica en que demuestra que un modelo pequeño y especializado puede superar a uno mucho mayor cuando la tarea está bien acotada y la recompensa está alineada con el objetivo real del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 270M base) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 (recomendado en el comando de llama-server) |
| Tipos de cuantizacion | Q8_0 (GGUF), bf16 (safetensors) |
| Idiomas soportados | multilingue (varios idiomas en entrenamiento; el resultado se devuelve en ingles) |
| Licencia | Gemma |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en `google/gemma-3-270m` en su variante base, no la instruct. Se entrenó en dos etapas. La primera es un ajuste supervisado completo (todas las capas) sobre 54.182 filas de `{idioma}: {pregunta}` a `{reformulación plana}`, con dos épocas, tasa de aprendizaje 1e-5, longitud de secuencia 512 y el prompt enmascarado. El checkpoint publicado es la iteración 12.000, elegido por exactitud sobre el conjunto de test, no por la pérdida de validación, que apuntaba a otro checkpoint peor.

La segunda etapa es GRPO (Group Relative Policy Optimization) donde la recompensa es el resultado de enrutamiento en sí: seis reformulaciones candidatas por pregunta, cada una incrustada y pasada por un grafo real. Recompensa completa si el router la coloca en la capacidad correcta con margen superior a 0.10, penalización si la coloca en la incorrecta. Usa LoRA de rango 32 con escala 2.0, 16 capas, tasa de aprendizaje 1e-6, batch 6, temperatura 1.0, 64 tokens y 2.380 iteraciones, tras las que se fusiona. La elección del checkpoint no se pudo hacer con la recompensa de entrenamiento porque se mantuvo en una banda estrecha de principio a fin; se puntuaron todos los checkpoints sobre 250 tareas reservadas en 247 grafos nunca vistos.

## Capacidades

- Reformulación de consultas para enrutamiento: toma una pregunta en lenguaje natural y la reescribe en la forma plana en que el router tiene descritas sus capacidades.
- Detección de ausencia de petición: emite el token único `NO_REQUEST` cuando no detecta ninguna solicitud.
- Entrada multilingue: acepta preguntas en varios idiomas; la salida siempre se devuelve en la lengua en que están escritas las descripciones del router (en el entrenamiento, inglés).
- Interfaz de completado simple: se usa con `/v1/completions`, no con chat, y requiere `temperature 0` y `repeat_penalty 1.0` explícito.
- No realiza generación de texto general, razonamiento, código ni matemáticas; su única tarea es la reformulación para enrutamiento.

## Casos de uso

- **Sistemas de enrutamiento por embeddings**: el caso principal. Cuando una consulta no cae con suficiente margen en ninguna capacidad del router, SemanticRepair la reformula y el router reintenta sobre la reformulación. Adecuado porque su tamaño reducido (300 MB en Q8_0) permite desplegarlo en paralelo al router sin coste significativo.
- **Agentes con herramientas**: en un pipeline de agente que necesita decidir qué herramienta invocar, el modelo reformula la petición del usuario a la forma canónica que las descripciones de herramientas esperan. La herramienta se ejecuta sobre el texto original del usuario, nunca sobre la reformulación, lo que limita el impacto de errores.
- **Normalización multilingüe de consultas**: convierte preguntas en varios idiomas a una forma única en inglés, lo que unifica el espacio de embeddings del router y evita que variaciones lingüísticas degraden la precisión del enrutamiento.
- **Sistemas RAG con consultas ambiguas**: antes de lanzar una búsqueda, el modelo reformula la pregunta del usuario para que el router la asigne a la fuente de conocimiento correcta. Su comportamiento de abstinencia (`NO_REQUEST`) evita ejecutar búsquedas sin petición real.
- **Detección de consultas fuera de alcance**: el modelo identifica peticiones que no corresponden a ninguna capacidad y las abstiene, lo que en un sistema de producción evita que el router ejecute acciones no deseadas.
- **Sustitución de modelos de reescritura de mayor tamaño**: en el caso documentado, reemplazó a un Qwen3-1.7B en la misma posición con menor latencia (99-104 ms frente a los valores del 1.7B) y sin errores en peticiones reales, lo que lo hace adecuado para entornos con restricciones de memoria o latencia.

## Benchmarks y rendimiento

La model card publica resultados de evaluación sobre tareas propias del proyecto, no benchmarks estándar. La siguiente tabla resume el rendimiento del checkpoint supervisado frente al de GRPO sobre 250 tareas held-out en 247 grafos nunca vistos:

| Etapa | exact | safe | silent | wrong | splits found |
|---|---|---|---|---|---|
| Supervisado | 103 | 13 | 129 | 5 | 10/35 |
| GRPO (checkpoint publicado) | 123 | 14 | 110 | 3 | 18/35 |
| GRPO (iteración final) | 121 | 15 | 110 | 4 | 20/35 |

En la prueba de despliegue real con 112 preguntas congeladas, 78 de ellas peticiones genuinas que el router no había podido colocar:

| Modelo | exact | safe | covered | wrong on real requests | wrong on out-of-scope | size |
|---|---|---|---|---|---|---|
| Qwen3-1.7B Q8 | 14 | 7 | 21 | 2 | 2 | 1.8 GB |
| SemanticRepair-270M | 16 | 9 | 25 | 0 | 5 | 300 MB |

La latencia mediana en un M4 Pro es de 99-104 ms. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 299 MB y el bf16 536 MB. En Q8_0 cabe en cualquier GPU moderna con 1 GB o más de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.) o CPU con llama.cpp. El modelo se probó en un M4 Pro con latencia mediana de 99-104 ms.
- Despliegue en consumer GPU: sí, sin problema. Es de los modelos más ligeros disponibles.
- Opciones de despliegue: llama-server (llama.cpp) con `-c 2048 -ngl 99`, o cualquier servidor compatible con `/v1/completions`. También puede cargarse el safetensors con transformers o vLLM si se quiere, pero la interfaz recomendada es la de completado, no la de chat.
- Latencia y throughput: latencia mediana de 99-104 ms en M4 Pro. Throughput no especificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SemanticRepair-270M | 268 M | 2048 | Reescritura de consultas para enrutamiento | Gemma | safetensors, GGUF |
| Qwen3-1.7B (reemplazado) | 1.700 M | no disponible | Reescritura de consultas (misma tarea) | no disponible | no disponible |
| Google FunctionGemma-270M-it | 270 M | no disponible | Function calling / tool use | Gemma | safetensors |

SemanticRepair-270M es notablemente más pequeño que Qwen3-1.7B y, según los datos de la model card, le supera en exactitud (16 vs 14), cobertura (25 vs 21) y errores sobre peticiones reales (0 vs 2), aunque tiene más errores en peticiones fuera de alcance (5 vs 2). La comparación con FunctionGemma-270M-it es estructural: ambos usan la base Gemma 3 270M, pero FunctionGemma está orientada a generar llamadas a funciones en formato estructurado, mientras que SemanticRepair se centra en reformular consultas para un router de embeddings.

## Limitaciones y advertencias

- **Riesgo de seguridad en peticiones destructivas**: el modelo reformula fielmente mensajes fuera de alcance y destructivos. Por ejemplo, si se le pide "eliminar todas las cuentas abiertas", escribe una línea limpia que significa exactamente eso. En la evaluación, 5 de 10 mensajes fuera de alcance se reformularon sin filtro. Por eso el sistema nunca ejecuta la reformulación directamente: la herramienta opera sobre el texto original del usuario.
- **Baja capacidad de división de preguntas compuestas**: solo divide 18 de 35 preguntas compuestas en el conjunto held-out, y en el despliegue real casi nunca separa preguntas que piden dos cosas distintas; suele devolver una sola línea.
- **Alta tasa de abstenciones**: se abstiene en 20 de 45 preguntas etiquetadas en la puerta. La abstención es el resultado seguro, pero no es un buen resultado en términos de utilidad.
- **No es un reescritor de consultas general**: el modelo se entrenó y evaluó solo en grafos sintéticos y preguntas propias del proyecto. No hay evidencia de que funcione fuera de ese dominio.
- **Los datos de entrenamiento no se han publicado**: la model card indica que se publicarán en una segunda ronda cuando se cierre el conjunto, con su procedencia verificada.
- **Interfaz de uso no estándar**: el modelo se entrenó sobre una superficie de completado simple (`{Idioma}: {pregunta}` `=>`) y no funciona con plantillas de chat, mensajes de sistema ni ejemplos few-shot. Usarlo fuera de esa interfaz degrada el rendimiento drásticamente (pasa de 16 exact a 1 exact en la tabla de la model card).
- **Parámetros de inferencia obligatorios**: requiere `temperature 0` y `repeat_penalty 1.0` explícito; llama.cpp no usa un valor neutro por defecto y un valor no enviado es un error silencioso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gramscii/SemanticRepair-270M
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Guía de Gemma 3 270M en local: https://localaimaster.com/models/gemma-3-270m
- Implementación de Gemma 270M desde cero: https://github.com/FnT-ai/gemma-270m-from-scratch
- Google FunctionGemma-270M-it: https://huggingface.co/google/functiongemma-270m-it
- Artículo sobre fine-tuning con pérdida semántica en Gemma 270M: https://arxiv.org/html/2605.05438v1
