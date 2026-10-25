# ornith-ai/Ornith-1.5-122B-FP8

## Resumen

Ornith-1.5-122B-FP8 es la versión cuantizada en FP8 del modelo insignia de la familia Ornith-1.5, desarrollada por ornith-ai. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 125.086 millones de parámetros, construido sobre la arquitectura identificada en el repositorio como `qwen3_5_moe`, con pipeline declarado de generación de texto y soporte de entrada imagen-texto (`image-text-to-text`). Esta variante FP8 emplea el formato `compressed-tensors` y está pensada para despliegue eficiente en una sola GPU.

El modelo continúa la línea iniciada con Ornith-1.0, que partía de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales. La novedad de Ornith-1.5 es la ampliación del bucle de auto-mejora: en lugar de depender de un conjunto fijo de tareas humanas y de arneses diseñados a mano, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la política mediante aprendizaje por refuerzo, optimizando de forma conjunta la generación de tareas, la construcción del arnés y los rollouts de solución.

Su relevancia actual reside en dos factores: por un lado, ofrece resultados competitivos frente a modelos notablemente mayores en tareas de código y agentes (TerminalBench 2.1, CyberGym, NL2Repo); por otro, su licencia MIT y su formato FP8 facilitan el despliegue en producción. El repositorio acumula 69.949 descargas y 13 likes desde su publicación el 20 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia `qwen3_5_moe`; soporte multimodal imagen-texto |
| Parametros totales | 125.086.497.008 (aproximadamente 125 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato `compressed-tensors`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en FP8 (`compressed-tensors`); tamano del repositorio 133,0 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de mezcla de expertos, etiquetada en el repositorio como `qwen3_5_moe`, lo que indica una topología derivada de la familia Qwen3.5. La model card menciona que Ornith-1.0 se desarrolló sobre Qwen3.5 y Gemma4 con preentrenamiento continuado adicional, mid-training y post-training. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus ni el número de expertos o la proporción de activación.

La innovación metodológica declarada es un bucle de auto-mejora end-to-end. Ornith-1.5 optimiza conjuntamente tres componentes que en versiones anteriores se trataban por separado: la generación de tareas de entrenamiento, la construcción del arnés (scaffold) y los rollouts de solución. El modelo propone nuevas tareas, descubre estrategias eficaces para resolverlas y actualiza la política mediante aprendizaje por refuerzo. Los detalles sobre el diseño de recompensas, el arnés y las tareas se remiten al blog del autor. No se detalla si hubo RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado de `text-generation` y etiqueta `conversational`.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), lo que habilita tareas de comprensión visual y descripción a partir de imágenes.
- Razonamiento orientado a tareas de código, con resultados publicados en TerminalBench 2.1, NL2Repo y SWE-bench Pro.
- Capacidades de ciberseguridad ofensiva y defensiva evaluadas en CyberGym (80 puntos).
- Ejecución de tareas agénticas de terminal y resolución de problemas multi-paso, implícitas en las evaluaciones TerminalBench y CyberGym.
- Soporte de tool calling y function calling: no se detalla explícitamente en la información disponible, aunque la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs de despliegue tipo endpoint.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode) o soporte de audio: no disponible.

## Casos de uso

- Automatización de operaciones en terminal: el modelo puede interpretar instrucciones en lenguaje natural y ejecutar secuencias de comandos en entornos Linux, gracias a su rendimiento de 81,2 en TerminalBench 2.1. Adecuado para agentes de aprovisionamiento y mantenimiento de servidores.
- Generación de repositorios completos a partir de especificaciones: con 51,2 en NL2Repo, puede emplearse para crear esqueletos de proyectos, estructura de directorios y código base inicial en flujos de arranque rápido.
- Resolución de incidencias en bases de código existentes: su puntuación en SWE-bench Pro lo sitúa como candidato para agentes que abren pull requests automáticos a partir de issues etiquetadas.
- Auditoría de seguridad y pruebas de penetración asistidas: con 80 en CyberGym, puede apoyar la identificación de vulnerabilidades en código y la generación de pruebas de explotación en entornos controlados.
- Asistente técnico con entrada visual: la capacidad `image-text-to-text` permite adjuntar capturas de pantalla de errores, diagramas de arquitectura o tablas para que el modelo los interprete y proponga soluciones.
- Agente de atención al cliente para producto técnico: combinando conversación multi-turno y tool calling, puede consultar estado de pedidos o incidencias en sistemas internos y responder con contexto acumulado, siempre que se configure la ventana de contexto adecuada (no publicada).
- Generación de documentación técnica y explicaciones de código en pipelines de CI/CD, integrando el modelo como paso de revisión automática sobre los diffs de cada pull request.

## Benchmarks y rendimiento

Resultados publicados en la model card (la tabla original está parcialmente truncada en la información disponible):

| Benchmark | Ornith-1.5-122B | Qwen3.8-Flash-Next (125B) | Qwen3.8 (27B dense) | Nemotron 3.5 Super VL (120B) | DeepSeek-V4-Flash-0731 (284B) | Beam (501B) |
|---|---|---|---|---|---|---|
| TerminalBench 2.1 | 81,2 | 83,4 | 71,9 | 66,7 | 82,7 | 80,1 |
| CyberGym | 80 | 78 | 55 | 34 | 76,7 | 59 |
| NL2Repo | 51,2 | 45,2 | 42,3 | 21 | 54,2 | 49,4 |
| SWE-bench Pro (no-hack) | dato truncado en la informacion disponible | dato truncado | dato truncado | dato truncado | dato truncado | dato truncado |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 suman aproximadamente 125 GB (125.086 millones de parámetros a 1 byte por parámetro), y el repositorio ocupa 133 GB. A ello hay que añadir la caché KV, cuyo tamaño depende de la longitud de contexto (no publicada), por lo que el consumo real supera los 133-140 GB en configuraciones típicas.
- GPU recomendadas: el modelo se describe como diseñado para despliegue en una sola GPU. Por capacidad de memoria, encajan GPU de 141 GB o más (H200) y de 180 GB o más (B200); una A100 de 80 GB o una H100 de 80 GB no son suficientes para alojar los pesos completos en una sola tarjeta.
- Configuraciones multi-GPU: con A100/H100 de 80 GB sería necesario repartir el modelo entre al menos dos dispositivos, con la sobrecarga de comunicación correspondiente.
- Cabe en GPU de consumo: no. Ninguna GPU consumer actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) dispone de memoria suficiente para los pesos en FP8.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y con `endpoints_compatible`, y usa el formato `compressed-tensors`, soportado por motores de inferencia como vLLM. El soporte en llama.cpp u Ollama requeriría una conversión a GGUF no publicada en la información disponible.
- Latencia y throughput: no disponible. Al ser un MoE, el coste por token depende del número de parámetros activos, dato que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TerminalBench 2.1 | CyberGym | NL2Repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Ornith-1.5-122B | 125 B (MoE) | no disponible | 81,2 | 80 | 51,2 | MIT | HuggingFace, FP8 |
| Qwen3.8-Flash-Next | 125 B | no disponible | 83,4 | 78 | 45,2 | no disponible | referencia en model card |
| Nemotron 3.5 Super VL | 120 B | no disponible | 66,7 | 34 | 21 | no disponible | referencia en model card |
| DeepSeek-V4-Flash-0731 | 284 B | no disponible | 82,7 | 76,7 | 54,2 | no disponible | referencia en model card |
| Beam | 501 B | no disponible | 80,1 | 59 | 49,4 | no disponible | referencia en model card |

Frente a Qwen3.8-Flash-Next, de tamaño comparable, Ornith-1.5 pierde 2,2 puntos en TerminalBench pero gana en CyberGym y NL2Repo. Frente a DeepSeek-V4-Flash-0731, que más que duplica su número de parámetros, queda por debajo en TerminalBench y NL2Repo pero lo supera en CyberGym, lo que indica una eficiencia paramétrica favorable. La licencia MIT es una ventaja diferencial clara para uso comercial, aunque no se dispone de los términos de los modelos comparados.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible. Al no publicarse la composición del corpus de entrenamiento ni los idiomas soportados, no es posible evaluar sesgos lingüísticos o culturales.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de veracidad. Como modelo generativo orientado a agentes, requiere verificación de las acciones que propone ejecutar.
- Longitud de contexto no publicada: es un dato crítico para dimensionar la caché KV y para casos de uso con documentos largos o conversaciones extensas. Debe consultarse antes de fijar arquitectura de producción.
- Idiomas: no se especifica la cobertura multilingüe; no debe asumirse un rendimiento equivalente al inglés en castellano u otras lenguas.
- Restricciones de licencia: la licencia es MIT, permisiva para uso comercial y modificación, con obligación habitual de conservar el aviso de copyright. Conviene revisar el fichero LICENSE enlazado en el repositorio, ya que la model card lo referencia explícitamente.
- Requisito hardware elevado: 133 GB de pesos implican GPU de clase H200/B200 o despliegues multi-GPU; no es viable en hardware de consumo.
- Formato: la variante publicada es FP8 con `compressed-tensors`, lo que puede introducir una degradación de precisión frente a los pesos originales no publicados en este repositorio.
- Los resultados de benchmarks son los declarados por el autor; no se dispone de verificaciones independientes. La fila de SWE-bench Pro está truncada en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-122B-FP8
- Modelo base referenciado (no cuantizado): https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Blog del autor sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron exclusivamente páginas sin relación con el modelo (puntos de recogida de paquetería).
