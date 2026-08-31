# ornith-ai/Ornith-1.5-9B-NVFP4

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9.000 millones de parámetros (aunque los pesos reales en safetensors suman 6.728.625.904, unos 6,7 mil millones) desarrollado por el equipo de ornith-ai. Forma parte de la familia Ornith-1.5, que se construye sobre las arquitecturas de Qwen3.5 y Gemma4 mediante un proceso de auto-mejora de extremo a extremo: el propio modelo genera nuevas tareas de entrenamiento, diseña los andamiajes (scaffolds) para resolverlas y produce los rollouts que alimentan el aprendizaje por refuerzo. Esta versión concreta, etiquetada como NVFP4, es una cuantización a 4 bits en formato de punto flotante de NVIDIA, lo que reduce el tamaño del repositorio a 8,8 GB y facilita su despliegue en una única GPU de consumo.

El modelo destaca por su rendimiento en tareas de ingeniería de software, con resultados notables en SWE-bench Verified (70,6) y Terminal-Bench 2.1, superando a su predecesor Ornith-1.0-9B y a Qwen3.5-9B en la mayoría de las métricas publicadas. Su licencia MIT permite uso comercial sin restricciones, y su tamaño compacto lo hace adecuado para entornos con recursos limitados, incluida la inferencia en dispositivos móviles mediante la variante cuantizada Mobile mencionada en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, basado en Qwen3.5 y Gemma4 (segun la model card) |
| Parametros totales | 6.728.625.904 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante de NVIDIA); tambien existe variante Mobile mencionada |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo transformer denso, sin mezcla de expertos, que parte de las arquitecturas de Qwen3.5 y Gemma4. La innovacion principal reside en su proceso de entrenamiento: en lugar de depender de tareas fijas creadas por humanos y andamiajes disenados manualmente, el modelo genera sus propias tareas, construye los scaffolds especificos para cada una y produce soluciones (rollouts) que se utilizan como datos de aprendizaje por refuerzo. Este bucle de auto-mejora se extiende desde la optimizacion de scaffolds y rollouts (como en Ornith-1.0) hasta la generacion conjunta de tareas, lo que permite al modelo descubrir estrategias nuevas y mejorar su politica de forma continua. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO; la informacion disponible se centra en el mecanismo de auto-mejora.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte para tareas de razonamiento y codigo.
- Razonamiento avanzado en tareas de ingenieria de software, como resolucion de issues en repositorios reales (SWE-bench) y uso de terminales (Terminal-Bench).
- Capacidad de auto-mejora: el modelo puede generar sus propias tareas de entrenamiento, lo que sugiere un potencial para adaptarse a dominios nuevos sin intervencion humana.
- Soporte de tool calling y uso de agentes: los resultados en Terminal-Bench indican que el modelo puede interactuar con herramientas de linea de comandos y entornos de ejecucion, aunque no se confirma explicitamente en la documentacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- El tag image-text-to-text en HuggingFace sugiere que el modelo base podria manejar entradas de imagen, pero esta variante NVFP4 se presenta como text-generation y no se documentan capacidades de vision.

## Casos de uso

- Desarrollo de software asistido: el modelo puede resolver issues de repositorios reales (SWE-bench Verified 70,6) y generar parches o refactorizaciones, integrándose en flujos de trabajo de desarrollo como asistente de programación.
- Automatización de tareas de terminal: gracias a su rendimiento en Terminal-Bench, puede ejecutar comandos, interpretar salidas y completar tareas administrativas o de operaciones en entornos de línea de comandos.
- Agentes autónomos de codigo: combinado con frameworks de agentes, puede planificar y ejecutar tareas de programación de multiples pasos, como crear funciones, ejecutar tests y corregir errores.
- Asistente de conversación técnica: su capacidad de generación de texto y razonamiento lo hace útil para chatbots de soporte técnico o documentación interactiva, con licencia MIT que permite integración comercial.
- Prototipado rápido de aplicaciones: al ser un modelo compacto (8,8 GB en NVFP4), puede desplegarse en una GPU de consumo para generar código, explicaciones o documentación en tiempo real.
- Investigación en auto-mejora de modelos: su arquitectura de entrenamiento con generación de tareas y scaffolds es un caso de estudio para equipos que exploran aprendizaje por refuerzo y generación de datos sintéticos.

## Benchmarks y rendimiento

La model card publica resultados en benchmarks de codigo, comparando con Ornith-1.0-9B, Qwen3.5-9B, Qwen3.6-35B-A3B y Gemma-4-31B. Los datos disponibles se resumen a continuacion (valores extraidos de la tabla de la model card; no se incluyen filas incompletas).

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | 35,7 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- En precision bf16, el modelo ocupa aproximadamente 19 GB, por lo que requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para inferencia comoda.
- La version NVFP4 (este repositorio) reduce el peso a 8,8 GB, lo que permite ejecutarlo en GPUs de consumo con 12-16 GB de VRAM, como RTX 3080/3090 o RTX 4070 Ti.
- Para despliegue en produccion, se recomienda usar vLLM o TGI con soporte para cuantizacion NVFP4; tambien es compatible con llama.cpp y Ollama si se convierte a GGUF.
- La documentacion oficial indica que el modelo en bf16 sirve en una unica GPU de 80 GB (por ejemplo, A100 o H100), y se puede usar tensor parallelism para sharding en multiples GPUs.
- No se proporcionan datos de latencia o throughput especificos.

## Comparativa con modelos similares

Comparacion con modelos de tamano similar (9B) y con modelos mas grandes que aparecen en los benchmarks de la model card:

| Modelo | Parametros | Contexto | Licencia | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) |
|---|---|---|---|---|---|
| Ornith-1.5-9B | ~6,7B (pesos reales) | No disponible | MIT | 70,6 | 46,2 |
| Ornith-1.0-9B | ~9B (estimado) | No disponible | MIT | 69,4 | 43,1 |
| Qwen3.5-9B | ~9B | No disponible | Apache 2.0 (presumible) | 53,2 | 21,3 |
| Qwen3.6-35B-A3B | 35B total, 3B activos (MoE) | No disponible | Apache 2.0 (presumible) | 73,4 | 52,5 |
| Gemma-4-31B | 31B | No disponible | Gemma license | 52,0 | 42,1 |

Ornith-1.5-9B supera claramente a Qwen3.5-9B en tareas de codigo y se acerca a modelos mucho mas grandes como Qwen3.6-35B-A3B, lo que lo hace atractivo para despliegues eficientes.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, alucinaciones o comportamientos problematicos; al ser un modelo entrenado con auto-mejora, podria presentar sesgos derivados de sus propios datos generados.
- La longitud de contexto no esta documentada, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- Los idiomas soportados no se especifican; aunque el modelo base (Qwen3.5) es multilingue, no hay confirmacion para esta variante.
- La cuantizacion NVFP4 puede introducir una ligera perdida de precision en comparacion con bf16, aunque no se han publicado evaluaciones comparativas de calidad entre ambas versiones.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los pesos base (Qwen3.5 y Gemma4) por si sus licencias originales imponen condiciones adicionales.
- Para produccion, es necesario validar el comportamiento del modelo en tareas especificas, ya que los benchmarks publicados se centran en codigo y no cubren otros dominios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-9B-NVFP4
- Coleccion de modelos Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog tecnico de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.ai/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
