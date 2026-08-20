# leonsarmiento/Ornith-1.5-35B-A3B-6bit-XL-mlx

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje multimodal de tipo MoE disperso (sparse Mixture of Experts) desarrollado por Ornith AI, especializado en tareas de codificacion agente (agentic coding). Esta version concreta, publicada por leonsarmiento, es una cuantizacion en formato MLX para Apple Silicon mediante la receta BaseQuant_XL 6/8-bit, que asigna precision segun el rol arquitectonico de cada capa sin depender de datos de calibracion. El modelo original tiene 35.9B parametros totales, pero solo activa aproximadamente 3B por token, lo que permite velocidades de decodificacion de un modelo pequeno con la capacidad de uno de 35B.

Ornith-1.5 destaca especialmente en tareas de ingenieria de software agente: obtiene 79.0 en SWE-bench Verified, 59.6 en SWE-bench Pro y 67.8/68.5 en Terminal-Bench 2.1, superando ampliamente a su predecesor Ornith-1.0 y a Qwen3.6-35B-A3B. El modelo se entrena mediante un bucle de auto-mejora de extremo a extremo que optimiza conjuntamente la generacion de tareas, la construccion de scaffolds y los rollouts de soluciones mediante reinforcement learning. Incluye un encoder de vision nativo, soporta entrada de texto, imagen y video, y mantiene una ventana de contexto de 262.144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de la familia Qwen3.5 (35B-A3B) con vision encoder nativo |
| Parametros totales | 35.9B (8.380.791.216 parametros almacenados en safetensors cuantizados) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BaseQuant_XL 6/8-bit: router, shared_expert_gate, lm_head y shared_expert en bf16; embed_tokens, self_attn y linear_attn en 8-bit; vision_tower y expertos ruteados en 6-bit (group size 64, ~6.8 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un MoE disperso con 256 expertos por capa, de los cuales se activan 8 ruteados mas 1 experto compartido en cada token. La atencion es hibrida: 30 capas con linear attention y 10 capas con full attention, para un total de 40 capas. Incluye un encoder de vision nativo que permite procesar imagenes y video ademas de texto. El entrenamiento sigue el paradigma de auto-mejora de extremo a extremo: el modelo propone nuevas tareas, genera scaffolds especificos para cada tarea y produce rollouts de soluciones que se usan como datos de entrenamiento por RL, creando un ciclo continuo de aprendizaje.

La cuantizacion BaseQuant_XL aplicada en esta build es estatica y agnostica a datos: no usa dataset de calibracion ni matrices de sensibilidad. La precision se asigna por rol arquitectonico, lo que evita el sesgo de representacion que introducen las cuantizaciones dependientes de datos (como AWQ o GPTQ). La capa MTP (multi-token prediction) del modelo original se ha omitido en esta build. Los tensores de expertos se almacenan fusionados por capa, a diferencia de la version 1.0 que los guardaba individualmente.

## Capacidades

- Generacion de codigo y resolucion de tareas de ingenieria de software (SWE-bench Verified 79.0).
- Razonamiento agente multi-paso con thinking mode activado por defecto (emite ` thinking... response` antes de la respuesta).
- Tool calling en formato XML (`<tool_call><function=...><parameter=...>`), compatible con el parser `qwen3_xml`.
- Modalidades multimodales: entrada de texto, imagen y video, salida de texto (pipeline image-text-to-text).
- Razonamiento explicito con parser `qwen3` que devuelve la cadena de pensamiento en el campo `reasoning_content`.
- Ventana de contexto de 262.144 tokens nativa, adecuada para repositorios grandes y conversaciones multi-turno extensas.
- Ejecucion local en Apple Silicon via MLX y en LM Studio, con soporte del mmproj de vision incluido.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede analizar un issue, localizar el codigo relevante en un contexto de hasta 262.144 tokens y generar un parche funcional, como demuestra su resultado de 79.0 en SWE-bench Verified.
- Agente de terminal y CLI: con 67.8/68.5 en Terminal-Bench 2.1, puede ejecutar comandos, interpretar salidas y corregir errores en entornos de shell de forma autonoma.
- Asistente de codigo en produccion: integrable en pipelines de CI/CD mediante tool calling XML, permite generar, revisar y refactorizar codigo de forma automatizada.
- Analisis de capturas de pantalla y UI: gracias al vision encoder, puede recibir una imagen de interfaz y generar el codigo HTML/CSS o describir los elementos visibles.
- Revisión de pull requests: puede analizar diffs extensos, detectar problemas de estilo, errores logicos y proponer cambios, aprovechando su contexto largo y su capacidad de razonamiento.
- Agente conversacional con contexto largo: su ventana de 262.144 tokens permite mantener conversaciones multi-turno con documentos adjuntos o historiales extensos sin perder contexto.
- Procesamiento de documentacion tecnica multimodal: combina texto, diagramas e imagenes para generar documentacion o responder preguntas sobre arquitecturas complejas.

## Benchmarks y rendimiento

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B |
|---|---|---|---|
| SWE-bench Verified | **79.0** | 75.6 | 73.4 |
| SWE-bench Pro | **59.6** | 50.4 | 49.5 |
| Terminal-Bench 2.1 (Terminus-2) | **67.8** | 64.2 | 52.5 |
| Terminal-Bench 2.1 (Claude Code) | **68.5** | 62.8 | 49.2 |

Los datos corresponden al modelo original de Ornith AI; no se han publicado benchmarks especificos de la version cuantizada.

## Requisitos de hardware

- Tamano del modelo: aproximadamente 28 GB en disco (repo de 29.9 GB).
- VRAM estimada: para Apple Silicon, se recomienda un minimo de 32 GB de memoria unificada para cargar el modelo completo en memoria; 36 GB o 48 GB para margen con contexto largo.
- GPU compatibles: exclusivamente Apple Silicon (M-series) por formato MLX; tambien se ha validado su ejecucion en NVIDIA DGX Spark (GB10, 128 GB de memoria unificada).
- No cabe en GPUs de consumo tipicas (RTX 4090 de 24 GB) sin cuantizacion adicional; con 6-bit son necesarios al menos 28 GB de memoria disponible.
- Opciones de despliegue: MLX-VLM (`mlx_vlm.generate`), LM Studio (vision mmproj incluido), y posiblemente vLLM o TGI para entornos con GPU NVIDIA si se convierten los pesos a formato compatible.
- Latencia: al activar solo ~3B parametros por token, la velocidad de decodificacion es comparable a la de un modelo de ~3B, con un throughput superior al de un MoE de 35B con activacion densa.

## Comparativa con modelos similares

| Modelo | Parametros | Activos/token | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 35.9B | ~3B | 262.144 | 79.0 | MIT |
| Ornith-1.0-35B-A3B | 35.9B | ~3B | 262.144 | 75.6 | MIT |
| Qwen3.6-35B-A3B | 35.9B | ~3B | 262.144 | 73.4 | Apache 2.0 |

La version cuantizada aqui descrita anade la capa de compatibilidad MLX y la cuantizacion BaseQuant_XL, que la diferencia de los modelos originales en cuanto a requisitos de hardware (Apple Silicon vs GPU NVIDIA) y en el metodo de cuantizacion (agnostico a datos vs calibrado).

## Limitaciones y advertencias

- La cuantizacion 6-bit en los expertos ruteados puede introducir una ligera degradacion en tareas que requieren precision numerica extrema, aunque la estrategia BaseQuant_XL minimiza el impacto al asignar mayor precision a capas criticas (router, lm_head).
- La capa MTP (multi-token prediction) del modelo original se ha eliminado en esta build; los motores que la ejecutan de forma nativa no obtendran la aceleracion asociada.
- No se ha publicado informacion sobre los idiomas soportados; el entrenamiento de Ornith AI se centra en tareas de codigo y es probable que el rendimiento en idiomas distintos del ingles sea menor.
- El thinking mode esta activado por defecto, lo que puede aumentar la latencia en tareas simples; se puede desactivar si no se necesita razonamiento explicito.
- Aunque la licencia es MIT y permite uso comercial, los datos de entrenamiento y el proceso de auto-mejora con RL pueden implicar consideraciones de calidad o sesgo no documentados.
- El modelo es especifico para Apple Silicon en esta build (MLX); para entornos NVIDIA hay que convertir los pesos a otro formato (GGUF, etc.), lo que puede requerir trabajo adicional.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/leonsarmiento/Ornith-1.5-35B-A3B-6bit-XL-mlx)
- [Modelo original de Ornith AI](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Blog de Ornith 1.5](https://ornith.ai/ornith_1_5.html)
- [Coleccion Ornith-1.5 en HuggingFace](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Version cuantizada de Ornith-1.0](https://huggingface.co/leonsarmiento/Ornith-1.0-35B-6bit-XL-mlx)
- [Guia de Ornith AI para modelos de codificacion](https://ornith.online/)
- [Ejecucion en DGX Spark (GitHub)](https://github.com/vcruz305/Ornith-1.5-35B-A3B-DGX-Spark/blob/main/README.md)
