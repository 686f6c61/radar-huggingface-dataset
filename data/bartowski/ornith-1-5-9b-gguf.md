# bartowski/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B es un modelo multimodal (imagen y texto) de 9 000 millones de parámetros desarrollado por Ornith AI, una iniciativa centrada en modelos de código abierto para tareas de codificación agéntica. Forma parte de la familia Ornith-1.5, que introduce un bucle de auto-mejora (self-improvement) basado en el framework de self-scaffolding: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para entrenamiento por refuerzo. Esta versión concreta es la cuantización GGUF realizada por bartowski, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp.

El modelo tiene una arquitectura densa de 9B parámetros, con entrada multimodal (acepta imágenes además de texto) y licencia MIT, lo que facilita su uso comercial sin restricciones. La cuantización ofrece un amplio abanico de formatos, desde bf16 completo (17,92 GB) hasta Q2_K (4,06 GB), lo que lo hace accesible para GPUs con 8 GB de VRAM o menos. Su orientación principal es la codificación agéntica, aunque al ser un modelo de propósito general multimodal puede aplicarse a otros escenarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 8 953 803 264 (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q4_K_L, Q5_K_S, Q3_K_XL, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q2_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no especifica los detalles internos de la arquitectura (numero de capas, dimensiones de atencion, funcion de activacion, etc.). Se sabe que es un modelo denso de 9B parametros con soporte multimodal: acepta tanto texto como imagenes como entrada, y requiere un archivo mmproj adicional para el procesamiento visual. No soporta decodificacion especulativa.

El entrenamiento se enmarca en el paradigma de self-scaffolding de Ornith AI. Segun el blog oficial, Ornith-1.5 extiende el framework de Ornith-1.0 a un bucle completo de auto-mejora: el modelo genera sus propias tareas, crea scaffolds especificos para cada tarea y produce rollouts de soluciones que alimentan un proceso de aprendizaje por refuerzo. Este enfoque permite que el modelo mejore continuamente generando nuevas experiencias de aprendizaje. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, con especial enfoque en tareas de codificacion agéntica (agentic coding).
- Entrada multimodal: procesa imagenes junto con texto, lo que permite interpretar capturas de pantalla, diagramas o esquemas de codigo.
- Formato de prompt ChatML (con tokens `<|im_start|>` y `<|im_end|>`), compatible con la mayoria de frameworks de inferencia.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque su orientacion agéntica sugiere que puede integrarse en flujos de herramientas.
- No soporta decodificacion especulativa, lo que puede afectar a la latencia en despliegues de alto rendimiento.
- Capacidades multilingues: no disponibles en la documentacion consultada.

## Casos de uso

- Asistente de programacion con contexto visual: el desarrollador puede adjuntar una captura de pantalla de un error o un diagrama de arquitectura y el modelo genera o corrige codigo basandose en esa imagen. Adecuado por su multimodalidad y su entrenamiento orientado a codigo.
- Automatizacion de tareas de desarrollo en CI/CD: integrado en pipelines, puede analizar logs de compilacion (texto) o capturas de fallos (imagen) y proponer parches o tests adicionales. Su licencia MIT permite su uso en entornos corporativos.
- Agente autonomo de resolucion de issues: el modelo puede recibir la descripcion de un issue junto con una imagen del comportamiento erroneo, razonar sobre la causa y generar un pull request candidato. Su framework de auto-mejora esta disenado para este tipo de tareas.
- Generacion de documentacion tecnica a partir de diagramas: dado un esquema visual de una arquitectura de software, el modelo produce documentacion detallada en texto. La entrada multimodal permite interpretar el diagrama directamente.
- Asistente de revision de codigo: el modelo analiza diffs de codigo (texto) y, si se adjunta una imagen del resultado visual de la aplicacion, puede detectar discrepancias entre lo esperado y lo implementado.
- Prototipado rapido de aplicaciones: el desarrollador describe una funcionalidad en texto y adjunta un boceto de interfaz (imagen); el modelo genera el codigo base de la interfaz y la logica asociada. Su tamano de 9B permite ejecutarlo localmente en una estacion de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de bartowski no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar, y la documentacion de Ornith AI no proporciona cifras comparativas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF elegido, el modelo ocupa entre 4,06 GB (Q2_K) y 17,92 GB (bf16). Para la cuantizacion recomendada Q4_K_M (5,91 GB), se necesita una GPU con al menos 8 GB de VRAM para dejar margen al contexto y a las activaciones.
- GPU recomendadas: RTX 4060 Ti 8 GB, RTX 4070, RTX 4080 o superiores para cuantizaciones Q4-Q5; para bf16 completo se recomienda una GPU con 24 GB de VRAM (RTX 4090, A100, etc.).
- Si cabe en GPU de consumo: si, con cuantizaciones Q4_K_M, Q5_K_M o inferiores en GPUs de 8-12 GB. La version Q2_K (4,06 GB) puede ejecutarse incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (compatible con el formato GGUF), Ollama, LM Studio, o cualquier runtime que soporte GGUF. Para despliegues en produccion con mayor throughput se puede usar vLLM o TGI, aunque requeririan convertir los pesos a safetensors.
- Latencia y throughput: no disponibles en la documentacion. Como referencia orientativa, un modelo de 9B en Q4_K_M en una RTX 4090 suele generar entre 40 y 80 tokens por segundo, pero estos valores dependen del hardware y del backend.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Ornith-1.5-9B comparte categoria con otros modelos densos de ~9B orientados a codigo (por ejemplo, Llama-3.1-8B, Qwen2.5-Coder-7B o DeepSeek-Coder-7B), pero no se pueden establecer comparaciones cuantitativas sin datos publicados. La principal diferencia cualitativa es su enfoque en auto-mejora y su capacidad multimodal, poco habitual en modelos de este tamano.

## Limitaciones y advertencias

- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos web es probable que herede sesgos comunes de los corpus de entrenamiento.
- Riesgo de alucinacion: no hay datos publicados, pero como cualquier modelo generativo, puede producir codigo o explicaciones incorrectas. Se recomienda validar las salidas en entornos de produccion.
- Longitud de contexto no especificada: se desconoce el limite de tokens de entrada, lo que dificulta planificar tareas con contextos largos.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado en idiomas distintos del ingles.
- El modelo requiere un archivo mmproj adicional para procesar imagenes; sin el, la entrada multimodal no funcionara.
- No soporta decodificacion especulativa, lo que puede limitar el rendimiento en despliegues con alta concurrencia.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las licencias de los datos de entrenamiento subyacentes.

## Enlaces

- Repositorio de cuantizacion GGUF: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Modelo original (ornith-ai/Ornith-1.5-9B): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Web principal de Ornith AI: https://ornith.ai/
- Guia de Ornith AI sobre modelos agénticos: https://ornith.online/
