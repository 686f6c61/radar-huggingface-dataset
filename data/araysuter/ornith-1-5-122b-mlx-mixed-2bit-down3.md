# araysuter/Ornith-1.5-122B-MLX-mixed-2bit-down3

## Resumen

Ornith-1.5-122B MLX mixed 2-bit down3 es una conversión cuantizada del checkpoint BF16 de Ornith-1.5-122B (ornith-ai), publicada por el usuario araysuter para su ejecución local en Apple Silicon mediante la librería MLX. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de pesos con cuantización de precisión mixta pensado para reducir el espacio en disco y la memoria necesaria para servir un modelo de mezcla de expertos de 122.562.817.776 parámetros.

La particularidad de esta variante es el esquema de cuantización asimétrica: las proyecciones gate y up de los expertos enrutados se cuantizan a 2 bits, mientras que las proyecciones down de esos mismos expertos se mantienen a 3 bits, con tamaño de grupo 64 en todos los casos. El resto de proyecciones cuantizadas usan 4 bits y los routers y gates de expertos compartidos, 8 bits. El resultado es un payload de 45.453.066.720 bytes (45,45 GB / 42,33 GiB), frente a los 40,62 GB de la variante 2-bit pura y los 47,87 GB de la variante con grupo 32.

Su relevancia es fundamentalmente práctica: permite ejecutar un MoE de 122B en hardware de consumo de Apple con memoria unificada grande, a costa de una pérdida de calidad frente a BF16 que el autor no ha podido medir. La model card es explícita sobre las limitaciones de la validación (subconjuntos pequeños, una sola máquina, intentos únicos) y no atribuye al modelo los resultados de benchmark del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer; tag de arquitectura `qwen3_5_moe` |
| Parámetros totales | 122.562.817.776 (122,56 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 128K tokens (probado por el autor solo en el perfil 2-bit g64, no en esta variante) |
| Tipos de cuantización | Precisión mixta con grupo 64: 2 bits affine en gate y up de expertos enrutados; 3 bits en down de expertos enrutados; 4 bits en el resto de proyecciones cuantizadas; 8 bits en routers y gates de expertos compartidos; tensores no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors para MLX (mlx / mlx-vlm), 45,45 GB (42,33 GiB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con 122,56 B de parámetros totales, según el tag `qwen3_5_moe` del repositorio. Esta ficha describe una conversión, no un entrenamiento: los pesos se derivaron directamente del checkpoint BF16 de ornith-ai/Ornith-1.5-122B en la revisión `dfa07bab90e90746ffbfc0b0cba3126eb9265de2`. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original.

Los detalles técnicos documentados de la conversión son los siguientes: cuantización affine con grupo 64 aplicada de forma diferenciada por tipo de tensor (2 bits en gate/up de expertos enrutados, 3 bits en down, 4 bits en el resto de proyecciones cuantizadas y 8 bits en routers y gates compartidos); los tensores no cuantizados se mantienen en BF16 tras las transformaciones necesarias del cargador. Los tensores MTP (multi-token prediction) del modelo fuente, que solo existen para el borrador especulativo, se han excluido, por lo que este checkpoint no incluye pesos de drafting. Los pesos de visión y los assets del procesador sí están incluidos, aunque la inferencia de imagen no se ha validado. La carga se verificó en modo estricto con los 2.440 nombres de tensor del modelo.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`), orientada a `text-generation`.
- Razonamiento y matemáticas: validado en un subconjunto de 25 preguntas de GSM8K con 25/25 aciertos en esta variante.
- Generación de código: 16/20 en HumanEval adaptado a chat y evaluado con tests unitarios en sandbox.
- Seguimiento de instrucciones estrictas: 21/25 en IFEval con el checker oficial en modo strict, el mejor resultado de los tres perfiles Ornith comparados.
- Modo de razonamiento (thinking): la validación se ejecutó con el thinking desactivado, lo que implica que el modelo base expone ese modo, aunque no se han publicado resultados con él activado.
- Capacidades multimodales: los pesos de visión están presentes en el repositorio, pero el autor indica explícitamente que la inferencia de imagen no se ha validado en este experimento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no evaluado; el autor declina comparar con Terminal-Bench 4.0.
- Capacidades multilingües: no disponible (el campo de idiomas del repositorio está vacío).
- Decodificación especulativa: no disponible en este checkpoint, al haberse excluido los tensores MTP.

## Casos de uso

- Inferencia local en Mac de gama alta: un MoE de 122B cuantizado a 45,45 GB permite servir generación de texto en un Apple Silicon con memoria unificada suficiente, sin GPU dedicada ni API externa.
- Asistente de código offline: con 80–85 % en las muestras de HumanEval del autor, es utilizable para autocompletado, explicación de código y generación de tests en entornos sin conexión o con requisitos de confidencialidad.
- Procesamiento de documentos largos: la ventana de 128K del modelo base permite resumir o extraer información de contratos, informes o expedientes completos, aunque el autor solo verificó el funcionamiento a 128K en el perfil 2-bit g64 y no en esta variante.
- Automatización con formato estricto: el mejor resultado de IFEval strict del conjunto (21/25) lo hace adecuado para pipelines que exigen salidas estructuradas (JSON, plantillas, clasificaciones con formato fijo).
- Razonamiento matemático y tutoría: los 25/25 en GSM8K de la muestra indican solvencia en problemas aritméticos de varios pasos, aprovechable en herramientas educativas o de validación de cálculos.
- Experimentación en cuantización: sirve como referencia para estudiar el compromiso entre tamaño (40,62 / 45,45 / 47,87 GB según perfil) y calidad en subconjuntos fijos, con manifiesto de evaluación versionado.
- Sustitución de BF16 en prototipado con memoria limitada: para equipos que no pueden alojar el checkpoint original completo, esta conversión reduce el peso a menos de la mitad sin reentrenar.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre una suite fija de 120 preguntas: una respuesta greedy por tarea, prompts de chat zero-shot, thinking desactivado y los mismos presupuestos de prompt y salida para todos los modelos. El propio autor advierte que son subconjuntos pequeños y no puntuaciones de leaderboard.

| Modelo | Peso (GB) | ARC (50) | GSM8K (25) | HumanEval (20) | IFEval strict (25) |
|---|---:|---:|---:|---:|---:|
| Ornith · 2-bit g64 | 40,62 | 47/50 (94 %) | 24/25 (96 %) | 17/20 (85 %) | 16/25 (64 %) |
| Ornith · 2-bit + 3-bit down (esta variante) | 45,45 | 46/50 (92 %) | 25/25 (100 %) | 16/20 (80 %) | 21/25 (84 %) |
| Ornith · 2-bit g32 | 47,87 | 46/50 (92 %) | 25/25 (100 %) | 16/20 (80 %) | 18/25 (72 %) |
| Swift-1.5 · 4-bit + DFlash2 | 15,83 (+3,85 de drafter) | 47/50 (94 %) | 25/25 (100 %) | 20/20 (100 %) | 19/25 (76 %) |

Rendimiento medido (un único intento, sin caché, un solo usuario, Apple Silicon):

| Métrica | down3 (esta variante) | Ornith baseline | Swift-1.5 + DFlash2 |
|---|---:|---:|---:|
| TTFT con 20K tokens de entrada | 19,18 s | 17,64 s | 21,81 s |
| Tokens/s de generación posterior | ~63,4 | ~66,8 | ~121,0 |
| TTFT con 128K tokens de entrada | no medido | 282,54 s | no medido |
| Pico de asignación MLX a 128K | no medido | 49,95 GB | no medido |

No se ha ejecutado una pasada del modelo base en precisión completa, por lo que la pérdida de calidad respecto a BF16 es desconocida. El autor tampoco ha ejecutado Terminal-Bench 4.0; cita como referencia externa los resultados publicados por Anthropic el 7 de octubre de 2026 (16,4 % para GPT-6 Luna y 39,2 % para Claude Haiku 5.5), sin comparación numérica con estas pruebas locales. El experimento completo de GPQA quedó en pausa antes de ejecutar ningún modelo Ornith.

## Requisitos de hardware

- Peso en disco y en memoria: 45.453.066.720 bytes (45,45 GB / 42,33 GiB) solo de pesos.
- Plataforma: exclusivamente Apple Silicon; el repositorio usa `mlx==0.32.4`, `mlx-vlm==0.7.9` y `mlx-lm==0.32.0`. No hay pesos GGUF ni compatibilidad con CUDA.
- Memoria unificada recomendada: por encima de 48 GB para cubrir pesos y estados de activación; el perfil base registró un pico de asignación MLX de 49,95 GB con 128K de entrada, por lo que esta variante, más pesada, requiere margen adicional. Durante las pruebas se asignó swap de macOS.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este formato; para esos entornos habría que recurrir al checkpoint BF16 original u otra conversión.
- Despliegue: `mlx-vlm` (`load` + `generate` + `apply_chat_template`) o `mlx-lm`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: ~19,18 s hasta el primer texto con 20K tokens de entrada sin caché y ~63,4 tokens/s de generación posterior; a 128K solo hay datos del perfil base (282,54 s de TTFT, 44,0 tokens/s reportados, pico de 49,95 GB).
- Almacenamiento: el repositorio ocupa 45,5 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Peso | IFEval strict | HumanEval | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Ornith-1.5-122B MLX mixed 2-bit down3 | 122,56 B (MoE) | 128K (probado en otra variante) | 45,45 GB | 21/25 | 16/20 | MIT | MLX, Apple Silicon |
| Ornith-1.5-122B MLX mixed 2-bit | 122,56 B (MoE) | 128K (verificado a 128K) | 40,62 GB | 16/25 | 17/20 | MIT | MLX, Apple Silicon |
| Ornith-1.5-122B MLX mixed 2-bit g64 grupo 32 | 122,56 B (MoE) | no disponible | 47,87 GB | 18/25 | 16/20 | MIT | MLX, Apple Silicon |
| Swift-1.5 4-bit + DFlash2 | no disponible | no disponible | 15,83 GB + 3,85 GB drafter | 19/25 | 20/20 | no disponible | MLX + TensorFold native |
| Ornith-1.5-122B (BF16 original) | 122,56 B (MoE) | no disponible | no disponible | no evaluado | no evaluado | MIT (según el derivado) | Pesos originales |

Las cifras de HumanEval e IFEval corresponden a subconjuntos de 20 y 25 preguntas respectivamente y no son comparables con puntuaciones completas de leaderboard. El autor subraya que la comparación de velocidad entre Ornith y Swift mezcla modelos, backends y configuraciones de drafting, por lo que no se puede atribuir la diferencia solo a la precisión de cuantización.

## Limitaciones y advertencias

- La cuantización agresiva a 2 bits puede degradar la precisión; no existe una ejecución del modelo en BF16 que permita cuantificar esa pérdida. El propio autor lo califica de desconocido.
- Los resultados de benchmark provienen de 120 preguntas fijas (subconjuntos de 50, 25, 20 y 25), con una sola respuesta greedy por tarea, y no constituyen puntuaciones oficiales ni estimaciones robustas.
- Las mediciones de velocidad son intentos únicos en una sola máquina, no medias de varias repeticiones, y se tomaron con swap de macOS activo.
- Los pesos de visión están incluidos pero la inferencia de imagen no se ha validado: no debe asumirse capacidad multimodal funcional.
- Los tensores MTP se han excluido, de modo que no hay decodificación especulativa disponible con este checkpoint.
- Solo se verificó el contexto de 128K en el perfil base (2-bit g64), no en esta variante, y esa prueba produjo un fallo de coincidencia exacta por razonamiento adicional en el marcador de verificación; no es una evaluación de calidad en contexto largo.
- Idiomas soportados no documentados: no hay garantía de rendimiento fuera de los idiomas que maneje el modelo original.
- Licencia MIT declarada en este derivado, pero conviene verificar los términos del modelo base ornith-ai/Ornith-1.5-122B antes de uso comercial.
- El campo de idiomas y el número de parámetros activos no están disponibles; la arquitectura se infiere del tag `qwen3_5_moe`.
- Dependencia estricta de versiones concretas de MLX y de hardware Apple Silicon; no hay ruta documentada para CUDA ni para formatos GGUF.
- Riesgo de alucinación: no evaluado específicamente en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit-down3
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Variante mixed 2-bit g64 (40,62 GB): https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit
- Variante mixed 2-bit grupo 32 (47,87 GB): https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit-group32
- Referencia externa citada por el autor (Anthropic, comparativa de octubre de 2026): https://www.anthropic.com/claude-haiku-5-5
- Ficheros de validación incluidos en el repositorio: `validation-packages.txt`, `evaluation-manifest.json`, `comparison-results.json`, `quality-comparison.png`, `performance-comparison.png`
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran consultas de foro sin relación.
