# Bestbug/Swift-Bonsai-2-PQ2_0-MTP-Q8_0

## Resumen

Swift-Bonsai-2-PQ2_0-MTP-Q8_0 es una versión experimental en formato GGUF publicada por el usuario Bestbug en Hugging Face. Se trata de un merge de pesos por fusión directa de bytes ("byte-merge") que combina dos componentes: la base Swift Bonsai 2, una derivada orientada a razonamiento eficiente creada por UkisAI a partir del Ternary Bonsai 2 27B de Prism ML, y una cabeza MTP (Multi-Token Prediction) de ProCreations diseñada para decodificación especulativa. El resultado es un modelo de 27.320.697.856 parámetros cuantizado a 2 bits (formato PQ2_0) con variante Q8_0, distribuido bajo licencia Apache-2.0.

Su relevancia radica en dos frentes: por un lado, la base Swift reporta usar aproximadamente un 40% menos de tokens de razonamiento en GPQA-Diamond manteniendo la precisión prácticamente intacta, lo que reduce coste y latencia en tareas de razonamiento; por otro, la cabeza MTP injertada permite acelerar la generación mediante decodificación especulativa en runtimes compatibles como llama.cpp. Es un modelo de comunidad, sin respaldo oficial de Prism ML, Qwen o DFlash, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario (Ternary Bonsai 2), con cabeza MTP para decodificacion especulativa (detalles no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0 (2 bits ternario), Q8_0 (según el nombre del repo; variantes exactas del repo no disponibles) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte del Ternary Bonsai 2 27B de Prism ML, un modelo de 27 mil millones de parámetros que emplea pesos ternarios (cuantización a 2 bits, etiquetada como "ternary" y "2-bit" en el repo). Sobre esa base, UkisAI construyó Swift Bonsai 2, una derivada orientada a razonamiento eficiente que, según los reportes del propio autor de este merge, reduce en torno a un 40% los tokens de razonamiento en GPQA-Diamond sin pérdida apreciable de precisión. Bestbug ha realizado un injerto directo de la cabeza MTP de ProCreations (originalmente adaptada sobre Ternary-Bonsai-2-27B-MTP) sobre los pesos base de ukisai/Swift-Bonsai-2-GGUF, sin modificar ningún otro peso, metadato o comportamiento. Entre los modelos base declarados figura también Qwen/Qwen3.8-27B, lo que sugiere ascendencia en la línea Qwen, aunque la genealogía completa no está documentada.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO aplicadas, ni sobre las técnicas concretas empleadas por UkisAI para acortar las trazas de razonamiento. El etiquetado del repo incluye "reasoning", "mtp" y "speculative-decoding", lo que confirma el soporte de decodificación especulativa vía la cabeza MTP injertada en runtimes compatibles (llama.cpp).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Razonamiento con trazas cortas: la base Swift Bonsai 2 reporta ~40% menos tokens de razonamiento en GPQA-Diamond con precisión aproximadamente igual.
- Decodificacion especulativa mediante la cabeza MTP injertada de ProCreations, acelerando la generación en runtimes compatibles.
- Cuantizacion ternaria a 2 bits (PQ2_0), lo que reduce drásticamente la huella de memoria respecto a pesos de 16 bits.
- Ejecucion con llama.cpp (librería declarada del repo) y compatibilidad con endpoints ("endpoints_compatible").
- Capacidades multilingues, vision, audio y tool calling: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico local: gracias a la base optimizada para GPQA-Diamond con trazas de razonamiento un 40% más cortas, es adecuado para responder preguntas de nivel avanzado (ciencia, matemáticas) en estaciones de trabajo locales sin depender de APIs de pago.
- Inferencia acelerada con decodificacion especulativa: la cabeza MTP injertada permite aumentar el throughput de generación en llama.cpp, útil para servir el modelo a varios usuarios o para batch processing de prompts largos.
- Prototipado de agentes de razonamiento economicos: la cuantización a 2 bits reduce la VRAM necesaria, permitiendo experimentar con pipelines agénticos multi-paso en hardware de gama alta de consumo en lugar de servidores con A100/H100.
- Investigacion en cuantizacion extrema: al ser un modelo ternario de 27B en formato GGUF PQ2_0, sirve como caso de estudio para evaluar el impacto de la cuantización a 2 bits en calidad y velocidad.
- Pruebas de merges de pesos y MTP: el repo documenta con transparencia el proceso de injerto de la cabeza MTP, lo que lo hace útil como referencia para quien quiera replicar técnicas similares de grafting sobre otros modelos.
- Chat local privado: al ser un modelo conversacional ejecutable con llama.cpp/Ollama, puede desplegarse para asistentes de chat donde la privacidad de los datos impide usar servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única referencia cuantitativa es el reporte del autor del merge sobre la base Swift Bonsai 2: aproximadamente un 40% menos de tokens de razonamiento en GPQA-Diamond con precisión aproximadamente igual. No hay cifras de MMLU, HumanEval, GSM8K ni comparativas verificables, y no deben extrapolarse resultados de los modelos upstream a este merge sin validación propia.

## Requisitos de hardware

- VRAM estimada: con 27,3 B de parámetros en cuantización ternaria a 2 bits (PQ2_0), el peso del modelo ronda los 7-8 GB teóricos; el repositorio completo ocupa 15,3 GB. La variante Q8_0 del nombre del repo, si existe como archivo separado, requeriría en torno a 29-30 GB. No se han publicado cifras oficiales de VRAM.
- GPU recomendadas: para la variante 2 bits, una RTX 3090/4090 (24 GB) debería alojar el modelo con holgura para el contexto; para una eventual variante Q8_0, se necesitarían 48 GB (A6000, L40S, A100 40/80 GB) o descarga parcial a CPU/RAM con llama.cpp.
- Consumer GPU: la variante 2 bits cabe en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) y probablemente en las de 16 GB con offload parcial a CPU.
- Despliegue: llama.cpp (librería declarada del repo); por extensión, herramientas del ecosistema GGUF como Ollama o LM Studio deberían ser compatibles, aunque no consta soporte verificado. vLLM y TGI no soportan GGUF ternario de forma nativa.
- Latencia y throughput: no disponibles; la cabeza MTP debería mejorar el throughput mediante decodificación especulativa en runtimes que la aprovechen, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-Bonsai-2-PQ2_0-MTP-Q8_0 (este) | ~27,3 B | PQ2_0 (2 bits) / Q8_0 | no disponible | Apache-2.0 | Merge comunitario con cabeza MTP para decodificacion especulativa |
| ProCreations/Ternary-Bonsai-2-27B-MTP | ~27 B | no disponible | no disponible | no disponible | Origen de la cabeza MTP injertada |
| ukisai/Swift-Bonsai-2-GGUF | ~27 B | no disponible | no disponible | no disponible | Base Swift con trazas de razonamiento reducidas |
| Qwen/Qwen3.8-27B | ~27 B | nativa (BF16) | no disponible | no disponible | Modelo base declarado en la genealogia del merge |

No se han publicado comparativas de rendimiento entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Es un release comunitario experimental: ni Bestbug, ni UkisAI, ni ProCreations son releases oficiales de Prism ML, Qwen o DFlash, y el modelo carece de respaldo o validación de los autores originales.
- Es un merge por fusión directa de bytes sin ningún trabajo adicional de validación; el autor declara explícitamente que no se ha hecho nada más que el injerto, por lo que no hay garantías de calidad ni de que la cabeza MTP funcione correctamente con la base Swift.
- No hay benchmarks publicados del modelo final: los reportes de la base Swift (40% menos tokens de razonamiento) no han sido verificados de forma independiente ni aplican necesariamente tras el merge.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma: no disponibles; al heredar de Ternary Bonsai 2 y Qwen3.8-27B, probablemente herede sus sesgos, pero no hay documentación al respecto.
- La cuantización a 2 bits (PQ2_0) es extrema y puede degradar la calidad de generación respecto a pesos de mayor precisión; conviene validar contra la base antes de uso en producción.
- La atribución de UkisAI estaba incompleta en su NOTICE.txt a fecha de publicación de este repo (2026-10-25); el NOTICE.txt de este repositorio es la copia autoritativa y puede quedar desactualizado si el upstream cambia.
- Longitud de contexto, idiomas soportados y requisitos exactos de memoria no están documentados, lo que dificulta la planificación de despliegue.
- Si se planea uso comercial, Apache-2.0 lo permite, pero conviene revisar las licencias upstream de los modelos base, que no están documentadas en la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Bestbug/Swift-Bonsai-2-PQ2_0-MTP-Q8_0
- Licencia Apache-2.0 del repo: https://huggingface.co/Bestbug/Swift-Bonsai-2-PQ2_0-MTP-Q8_0/blob/main/LICENSE
- NOTICE.txt con atribuciones: https://huggingface.co/Bestbug/Swift-Bonsai-2-PQ2_0-MTP-Q8_0/blob/main/NOTICE.txt
- Base Swift (UkisAI): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Cabeza MTP (ProCreations): https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Ternary Bonsai 2 27B GGUF (prism-ml): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
