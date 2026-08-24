# junafinity/Ornith-1.5-35B-A3B-uncensored

## Resumen

Ornith-1.5-35B-A3B-uncensored es una variante del modelo Ornith-1.5-35B-A3B, desarrollada por el usuario junafinity mediante un proceso de abliteration (abliterix) para eliminar los mecanismos de censura y rechazo del modelo original. El modelo base, creado por ornith-ai, es un modelo de razonamiento multimodal de tipo mixture-of-experts (MoE) con aproximadamente 35.950 millones de parámetros totales, de los cuales solo unos 3.000 millones se activan por token. Está diseñado para tareas de razonamiento complejo, generación de código, agente autónomo y comprensión de imágenes, y forma parte de la familia Ornith-1.5 que introduce un bucle de auto-mejora (self-scaffolding y self-improvement).

La relevancia de esta versión "uncensored" radica en que elimina las restricciones de contenido del modelo base, lo que permite su uso en escenarios donde se requiere generación de texto sin filtros, como investigación de seguridad, análisis de contenido sensible o desarrollo creativo sin limitaciones. El modelo está disponible bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace. Se distribuye en formato safetensors y existe una versión cuantizada GGUF-8bit del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5-MoE, multimodal (image-text-to-text) |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo principal; existe version GGUF-8bit (junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (y GGUF en la version cuantizada) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B-uncensored hereda la arquitectura MoE del modelo base, que a su vez se basa en la familia Qwen3.5-MoE. El modelo activa aproximadamente 3.000 millones de parámetros por token, lo que permite un rendimiento comparable a modelos densos de 30-35B con un coste computacional muy inferior. El entrenamiento del modelo base sigue el marco de "self-scaffolding" introducido en Ornith-1.0, extendido a un bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, generando continuamente nuevas experiencias de aprendizaje. La versión "uncensored" se obtiene mediante abliteration, una técnica que modifica los pesos del modelo para eliminar las activaciones asociadas al rechazo de contenido, sin reentrenamiento adicional. El modelo es multimodal, capaz de procesar entradas de imagen y texto, y por defecto genera un bloque de razonamiento ("thinking") antes de la respuesta final.

## Capacidades

- Razonamiento complejo: genera cadenas de pensamiento explícitas antes de responder, lo que mejora la precisión en problemas de lógica, matemáticas y análisis.
- Generación de código: soporta tareas de programación, depuración y explicación de código, con buen rendimiento en benchmarks de coding según la documentación del fabricante.
- Tool calling: el modelo puede emitir bloques `<tool_call>` que se pueden parsear como llamadas a herramientas estilo OpenAI, permitiendo integración con APIs y agentes.
- Agente autónomo: gracias a su capacidad de razonamiento multi-paso y tool calling, puede ejecutar tareas complejas que requieren planificación y uso de herramientas externas.
- Multimodal (visión): acepta imágenes como entrada junto con texto, permitiendo descripción de imágenes, respuesta a preguntas visuales y análisis de documentos escaneados.
- Sin censura: al estar abliterated, no rechaza contenido sensible, violento, sexual o políticamente incorrecto, lo que lo hace útil para investigación y generación creativa sin restricciones.
- Multilingüe: aunque no se especifican los idiomas soportados, al estar basado en Qwen3.5-MoE es probable que herede un amplio soporte multilingüe, pero este dato no está confirmado.

## Casos de uso

- Investigación en seguridad de IA: el modelo sin censura permite estudiar comportamientos de generación de contenido dañino, sesgos y alucinaciones en un entorno controlado, sin que el modelo rechace las preguntas.
- Generación creativa sin restricciones: escritores y guionistas pueden usar el modelo para explorar temas tabú, violencia gráfica o contenido adulto en narrativas, sin que el modelo se niegue a continuar.
- Desarrollo de agentes autónomos: su soporte de tool calling y razonamiento multi-paso lo hace adecuado para construir asistentes que interactúan con APIs, bases de datos y servicios web, ejecutando tareas de varios pasos.
- Análisis de documentos visuales: al ser multimodal, puede procesar capturas de pantalla, diagramas, gráficos y documentos escaneados, extrayendo información y respondiendo preguntas sobre ellos.
- Generación de código en entornos sin restricciones: equipos de desarrollo pueden usarlo para generar código ofensivo (pentesting), scripts de automatización o exploits educativos, donde un modelo censurado se negaría.
- Chatbots y asistentes para audiencias adultas: el modelo puede alimentar chatbots de rol o entretenimiento para adultos, donde la ausencia de censura es un requisito funcional.
- Evaluación de alineación y seguridad: investigadores pueden comparar el comportamiento del modelo abliterated frente al original para medir el impacto de la abliteration en la utilidad y la seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La documentacion del fabricante (imagen Docker de ornith-ai) afirma que el modelo base "activa solo ~3B parametros por token, y supera significativamente a su homologo Qwen 3.6-35B en todos los benchmarks de codigo y agente, y supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B por amplio margen". Sin embargo, no se proporcionan cifras concretas. Se recomienda consultar la pagina oficial de Ornith-1.5 para obtener datos de evaluacion detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 35,95B parametros. En precision fp16/bf16, el peso ocupa aproximadamente 72 GB (coincide con el tamano del repo de 71,9 GB). Con cuantizacion de 8 bits, se reduce a ~36 GB; con 4 bits, ~18 GB.
- GPU recomendadas: para fp16 se necesitan GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (con offloading). Para 8 bits, una RTX 4090 24GB no es suficiente (necesita 36GB), pero una RTX 6000 Ada 48GB o A6000 48GB si lo permiten. Para 4 bits, una RTX 4090 24GB o RTX 3090 24GB pueden funcionar con cuantizacion y posible offloading.
- Si cabe en consumer GPU: solo con cuantizacion agresiva (4 bits) y posiblemente con offloading a RAM. No es realista para GPUs de 8-16 GB.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI o llama.cpp (para GGUF). La version GGUF-8bit esta disponible para su uso con llama.cpp y Ollama.
- Latencia y throughput: no disponibles. Al ser MoE con solo ~3B activos, la latencia por token deberia ser significativamente menor que la de un modelo denso de 35B, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-uncensored | 35,95B | ~3B | no disponible | Apache 2.0 | MoE multimodal, abliterated, sin censura |
| Qwen 3.6-35B | ~35B (estimado) | no disponible | no disponible | no disponible | Modelo denso o MoE de referencia, superado por Ornith-1.5 segun el fabricante |
| Gemma 4-31B | ~31B (estimado) | no disponible | no disponible | no disponible | Modelo denso de Google, superado por Ornith-1.5 segun el fabricante |
| Muse Glimmer-30B | ~30B (estimado) | no disponible | no disponible | no disponible | Modelo denso, superado por Ornith-1.5 segun el fabricante |

No se dispone de datos verificables de estos modelos comparables en la informacion proporcionada. Las afirmaciones de superioridad provienen de la documentacion oficial de ornith-ai y no han sido contrastadas con benchmarks independientes.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, lo que requiere aceptar condiciones en HuggingFace antes de poder descargar el modelo.
- Sesgos y alucinaciones: al ser una version abliterated, el modelo puede generar contenido ofensivo, incorrecto o peligroso sin filtro. No se han publicado evaluaciones de sesgo para esta variante.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas o codigo que no funciona. La ausencia de censura no implica mayor veracidad.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que puede afectar a tareas que requieren ventanas largas.
- Idiomas: no se ha confirmado el conjunto de idiomas soportados, aunque probablemente herede el multilingüismo de Qwen3.5-MoE.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el acceso gated puede limitar la redistribucion.
- Produccion: al ser una variante "uncensored", no es recomendable para aplicaciones orientadas al publico general sin moderacion adicional, ya que puede generar contenido inapropiado.
- Fecha de creacion: el modelo fue creado en agosto de 2026, por lo que es muy reciente y puede tener problemas no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored
- Version GGUF-8bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Coleccion Ornith-1.5 de ornith-ai: https://huggingface.co/collections/ornith-ai/ornith-15
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Imagen Docker de ornith-ai: https://hub.docker.com/r/ai/ornith-1.5
- Modelo base en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
