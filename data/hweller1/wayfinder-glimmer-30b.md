# hweller1/wayfinder-glimmer-30b

## Resumen

wayfinder-glimmer-30b es un ajuste fino (post-entrenamiento mediante LoRA supervisado, fusionado en los pesos base) del modelo Muse Glimmer 30B de meta-models, desarrollado por hweller1. Su propósito es actuar como subagente especializado en búsqueda de código dentro de flujos de trabajo de agentes de programación: un agente padre le entrega un brief del tipo "dónde decide el router que..." y el modelo devuelve una lista de ubicaciones relevantes en el repositorio. El modelo forma parte del proyecto Wayfinder y fue el primer modelo entrenado con esa receta.

Arquitecturalmente es un transformer denso de 52 capas, con tamaño oculto de 6.656 y 29.776.626.688 parámetros (aproximadamente 29,8 mil millones), todos activos en cada token. Esto contrasta con la alternativa del mismo proyecto, wayfinder-qwen, que es un modelo de mezcla de expertos (MoE) mucho más eficiente en inferencia. El modelo se distribuye en formato safetensors con pesos en bf16 y está pensado para ejecutarse en transformers.

Su relevancia es doble: por un lado, documenta una receta de post-entrenamiento para subagentes de búsqueda de código con métricas de recall medidas sobre 200 tareas retenidas; por otro, la propia model card explica por qué el autor eligió finalmente wayfinder-qwen para el hackathon y la demo, lo que convierte a wayfinder-glimmer en un caso de estudio transparente sobre el compromiso entre calidad de recall y coste de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, 52 capas, hidden size 6.656 |
| Parámetros totales | 29.776.626.688 (~29,8B) |
| Parámetros activos | No aplica (modelo denso; todos los parámetros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | other: apache-2.0-and-muse-model-license |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es Muse Glimmer 30B, un transformer denso de 52 capas con tamaño oculto de 6.656 y sin bloques de mezcla de expertos, de modo que cada token paga el coste computacional de los ~30B parámetros. Sobre esta base se aplicó un ajuste fino supervisado con LoRA de rango 64 y alpha 128, tasa de aprendizaje 5e-5 y 2 épocas, tras lo cual el adaptador se fusionó en los pesos base. El entrenamiento se realizó con 1.383 ejemplos y la misma receta aplicada después a wayfinder-qwen, con un coste de aproximadamente 180 minutos en 4x H200 (unos 54 dólares) frente a los 88 minutos (~28 dólares) del modelo MoE.

La receta de Wayfinder entrena al modelo para planificar, emitir llamadas a herramientas en paralelo y terminar con una llamada `report`; según la model card, wayfinder-glimmer termina con `report` el 100% de las veces en unas 9,9 turnos, frente al 96% en 9,5 turnos de wayfinder-qwen. El ajuste LoRA all-linear toca todos los pesos del modelo denso, lo que le da más capacidad de adaptación que el LoRA aplicado sobre el MoE (limitado a atención, proyecciones de atención lineal y experto compartido, con 76,7M de parámetros entrenables). No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset más allá de los 1.383 ejemplos.

## Capacidades

- Búsqueda de código como subagente: recibe un brief en lenguaje natural y devuelve una lista de ubicaciones relevantes en un repositorio (own-list recall de 0,452 sobre 200 tareas retenidas en el brazo grep).
- Planificación y razonamiento multi-paso dentro de un bucle de agente.
- Llamadas a herramientas en paralelo (tool calling / function calling) y finalización estructurada mediante la acción `report`.
- Generación de texto conversacional en inglés.
- Integración como subagente dentro de agentes de programación padre (patrón subagent).
- Capacidad de entrada image-text-to-text declarada en los tags del repositorio (sin detalle adicional en la model card).
- No se documentan capacidades multimodales de audio ni modo de razonamiento extendido ("thinking mode") más allá de lo anterior.

## Casos de uso

- Búsqueda de código en repositorios grandes: un agente padre le pasa un brief ("dónde se decide que un reintento se propague") y el modelo localiza los ficheros y símbolos candidatos, que luego el agente principal usa para leer y editar. Adecuado por su recall medido de 0,452 en el brazo grep.
- Enrutado de tareas de localización dentro de pipelines de CI/CD: el modelo puede ejecutarse como paso previo a herramientas de análisis estático para reducir el espacio de búsqueda antes de ejecutar tests o linters.
- Asistente de onboarding en bases de código desconocidas: dado que el modelo devuelve listas de ubicaciones con un formato de `report` consistente (100% de finalización), se puede integrar en herramientas internas que respondan "dónde está implementado X".
- Subagente de un sistema multi-agente de programación: actúa como especialista de búsqueda mientras otro modelo (por ejemplo, wayfinder-qwen o un modelo mayor) planifica y escribe el código, aprovechando su capacidad de emitir llamadas a herramientas en paralelo.
- Generación de contextos para RAG sobre código: las ubicaciones devueltas pueden alimentar un recuperador posterior (rerank) y construir el contexto que se pasa a un modelo generador.
- Evaluación e investigación de recetas de post-entrenamiento: al estar publicada la comparación con wayfinder-qwen (recall, latencia, coste), sirve como referencia reproducible para estudiar el efecto de LoRA all-linear frente a LoRA sobre MoE.
- Prototipado de agentes de búsqueda en entornos con una sola H100: el modelo cabe en bf16 en una H100 y permite validar el bucle completo antes de migrar a una variante más económica.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a métricas propias del proyecto Wayfinder, no a benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks estándar en la información disponible.

| Medida | wayfinder-glimmer (denso, bf16) | wayfinder-qwen (MoE, FP8) |
|---|---|---|
| Recall own-list, 200 tareas retenidas, grep | 0,452 [0,412; 0,491] | 0,415 [0,377; 0,452] |
| Tasa de acierto en codificación, lista propia (34 tareas) | 0,868 (59 de 68 ejecuciones) | 0,868 (59 de 68 ejecuciones) |
| Tiempo mediano por búsqueda, una H100, un stream | 175,4 s | 43,5 s (MTP off) / 19,7 s (MTP on) |
| Latencia mediana por turno (p90) | 13,2 s (36,3 s) | 3,6 s (9,7 s) off / 2,1 s (6,6 s) on |
| Tasa de decodificación | 41 tok/s | 185 tok/s off / 286 tok/s on |
| Coste GPU por rollout (concurrencia 14, 400 rollouts) | 0,0294 USD | 0,0150 USD |
| Entrenamiento (1.383 ejemplos, misma receta, 4x H200) | 180 min, ~54 USD | 88 min, ~28 USD |
| Recall@12 con cascada Scout | no medido | 0,531 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 59,6 GB (tamaño del repo), por lo que se necesita al menos una GPU de 80 GB para cargar el modelo completo sin cuantizar.
- GPU recomendadas: H100 (80 GB) o H200 para bf16; A100 de 80 GB como alternativa. El autor reporta ejecuciones en una sola H100.
- Cabe en GPU de consumo: no en bf16 con las configuraciones habituales de 24 GB (RTX 4090) o 48 GB; requeriría cuantización, para la cual no se documentan formatos publicados.
- Opciones de despliegue: transformers (librería declarada); el repositorio incluye el tag `endpoints_compatible`. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput medidos: 41 tok/s de decodificación, 13,2 s de latencia mediana por turno (p90 de 36,3 s) y 175,4 s de tiempo mediano por búsqueda en una H100 con un solo stream.

## Comparativa con modelos similares

| Modelo | Diseño | Parámetros | Contexto | Recall own-list (grep) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wayfinder-glimmer-30b | Denso, 52 capas | ~29,8B (todos activos) | no disponible | 0,452 | apache-2.0-and-muse-model-license | Hugging Face |
| wayfinder-qwen-35b-a3b | MoE, 40 capas (30 Gated DeltaNet + 10 atención con puerta), 256 expertos enrutados, 8+1 activos | 35B totales, ~3B activos | no disponible | 0,415 | no disponible | Hugging Face |
| Muse Glimmer 30B (base) | Denso, 52 capas | ~29,8B | no disponible | no disponible | no disponible | Hugging Face (meta-models) |

## Limitaciones y advertencias

- El propio autor no eligió este modelo para la demo final: wayfinder-qwen es entre 4 y 9 veces más rápido en el bucle de búsqueda y aproximadamente la mitad de caro por rollout, pese a tener un recall own-list ligeramente inferior.
- Solo soporta inglés, lo que limita su uso en repositorios o briefs en castellano.
- No se documenta la longitud de contexto, un dato crítico para búsquedas en repositorios grandes.
- El recall medido (0,452) se obtuvo sobre 200 tareas retenidas de un conjunto propio; no hay validación en benchmarks públicos ni en dominios distintos al del proyecto.
- La tasa de acierto en codificación (0,868) se midió sobre solo 34 tareas, insuficiente para resolver diferencias entre modelos según el propio autor.
- El modelo depende de la forma del brief: cuando el agente padre entrega un brief redactado ("Find ...") en lugar del asunto del commit, el recall cae alrededor de 0,08 en todos los modelos probados.
- La licencia es compuesta (apache-2.0-and-muse-model-license) y remite a un fichero LICENSE-MUSE-SPARK-OPEN.md; es necesario revisarla antes de cualquier uso comercial, ya que las condiciones del componente Muse pueden imponer restricciones adicionales.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un subagente de búsqueda, los errores se manifiestan como ubicaciones irrelevantes u omitidas más que como texto inventado.
- El ajuste se hizo con un único seed y sin aislar la causa de la brecha de recall frente al modelo MoE, según reconoce el autor.
- Más datos del mismo tipo no mejoraron el recall retenido; las ganancias medidas provienen de la cascada en inferencia (fusión por reciprocal rank y rerank), construida y medida solo sobre wayfinder-qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hweller1/wayfinder-glimmer-30b
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo alternativo del proyecto: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b
- Licencia: https://huggingface.co/hweller1/wayfinder-glimmer-30b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
