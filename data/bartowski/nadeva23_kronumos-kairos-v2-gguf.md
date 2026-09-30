# bartowski/NadevA23_Kronumos-Kairos-v2-GGUF

## Resumen

NadevA23_Kronumos-Kairos-v2-GGUF es un repositorio de cuantizaciones GGUF generado por bartowski a partir del modelo base NadevA23/Kronumos-Kairos-v2, un modelo de 8B (7.615.616.512 parametros reales en los pesos safetensors del checkpoint original) orientado a generacion de codigo, reparacion de programas y flujos de agentes autonomos. El repositorio no contiene un modelo nuevo: es una redistribucion optimizada para inferencia local mediante llama.cpp del checkpoint original, con licencia Apache 2.0 y soporte exclusivo de texto en ingles.

La relevancia de esta ficha esta en su perfil de uso: el modelo base esta etiquetado como derivado de la familia Qwen2 y vinculado al dataset princeton-nlp/SWE-bench_Verified, con etiquetas explicitas de swe-bench, autonomous-agents, program-repair, code-generation y una etiqueta singular, rust-subcortex, cuyo significado no se documenta en la informacion disponible. Esto lo situa en el nicho de modelos pequenos pensados para tareas de ingenieria de software asistida por agente, donde el coste de inferencia y la posibilidad de ejecucion en hardware de consumo son determinantes.

El aporte practico del repositorio de bartowski es el catalogo de cuantizaciones: desde bf16 completo (15,24 GB) hasta formatos IQ de baja precision, pasando por el recomendado Q4_K_M (4,78 GB), lo que permite desplegar el modelo en GPUs de consumo con 6-8 GB de VRAM. Ademas, la model card documenta el formato de prompt ChatML y el protocolo de tool calling basado en etiquetas XML, lo que facilita su integracion en pipelines de agentes. La longitud de contexto, la composicion del dataset de entrenamiento y los resultados de benchmarks no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetado como familia qwen2 en el repositorio de cuantizacion |
| Parametros totales | 7.615.616.512 (~7,62 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, IQ4_NL, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M (catalogo parcial en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base publica safetensors |
| Tamano del repositorio | 107,9 GB |
| Herramienta de cuantizacion | llama.cpp, release b11259 |
| imatrix | Si (segun la model card) |
| Decodificacion especulativa | No |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su etiquetado como qwen2, lo que sugiere una arquitectura transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion QKV, caracteristica de esa familia. No obstante, al tratarse de un fine-tune de terceros (NadevA23), no se puede confirmar que conserve todas las modificaciones estructurales de la familia original ni los hiperparametros exactos de atencion. El numero de parametros, 7.615.616.512, es coherente con un modelo denso de clase 8B.

Tampoco se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste por preferencias como RLHF, DPO u ORPO. El unico indicio sobre los datos es la referencia al dataset princeton-nlp/SWE-bench_Verified, que sugiere un entrenamiento o evaluacion orientado a resolucion de issues reales de repositorios de software, y las etiquetas program-repair y rust-subcortex, que apuntan a especializacion en reparacion de programas y, presumiblemente, al ecosistema Rust. La cuantizacion de bartowski se ha realizado con imatrix, lo que implica el uso de un dataset de calibracion para preservar mejor las activaciones relevantes en los formatos de baja precision; la model card no especifica que corpus se uso para calcularla.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con formato de prompt ChatML (`<|im_start|>`, `<|im_end|>`).
- Generacion y completado de codigo, con enfasis declarado en reparacion de programas (program repair) segun las etiquetas del repositorio.
- Soporte de tool calling / function calling mediante definiciones en etiquetas XML `<tools></tools>` y llamadas en `<tool_call></tool_call>` con argumentos en JSON.
- Orientacion a agentes autonomos y razonamiento multi-paso, segun las etiquetas autonomous-agents y swe-bench.
- Capacidad declarada de trabajo sobre tareas de tipo SWE-bench, es decir, resolucion de issues en repositorios reales.
- Etiqueta rust-subcortex, que sugiere algun tipo de especializacion o modulacion relacionada con Rust; su alcance exacto no esta documentado.
- Capacidades multimodales (vision o audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Agente de reparacion de bugs en repositorios: el modelo esta etiquetado con swe-bench y program-repair, por lo que encaja en pipelines que reciben un issue, localizan los ficheros afectados y proponen un parche. Se integraria con herramientas de lectura de ficheros y ejecucion de tests mediante el protocolo de tool calling documentado.
- Asistente de codigo en el IDE con ejecucion local: gracias a las cuantizaciones Q4_K_M (4,78 GB) y Q5_K_M (5,52 GB), puede desplegarse en una estacion de trabajo con GPU de 8-12 GB y ofrecer autocompletado y explicacion de codigo sin enviar codigo propietario a servicios externos.
- Automatizacion de revision de codigo en CI/CD: el modelo puede invocarse desde un runner para analizar diffs, generar comentarios tecnicos y llamar a funciones que consulten resultados de linters o tests mediante el formato `<tool_call>`.
- Agente de operaciones sobre repositorios Git: combinado con funciones de lectura de historial, creacion de ramas y apertura de pull requests, puede ejecutar tareas multi-paso de mantenimiento (actualizacion de dependencias, refactorizaciones mecanicas) de forma semiautonoma.
- Migracion o modernizacion de codigo hacia Rust: la etiqueta rust-subcortex sugiere un ajuste orientado a este lenguaje. El uso tipico seria traducir fragmentos desde otros lenguajes o adaptar APIs a las convenciones de Rust, siempre con revision humana del resultado.
- Generacion de tests unitarios y de regresion: puede producir casos de prueba a partir de una firma de funcion o de un fallo reportado, y usar tool calling para ejecutar el runner de tests y comprobar si pasan.
- Entornos air-gapped o con requisitos de soberania del dato: al ser un GGUF de 8B con licencia Apache 2.0, puede ejecutarse completamente offline en hardware propio, algo relevante en banca, sanidad o administracion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta swe-bench y la referencia al dataset princeton-nlp/SWE-bench_Verified, pero no se aportan puntuaciones de resolucion, ni resultados de MMLU, HumanEval, GSM8K, MBPP o metricas equivalentes. Tampoco se documentan evaluaciones comparativas del checkpoint original en la informacion suministrada.

## Requisitos de hardware

- VRAM para inferencia segun el fichero GGUF elegido (estimacion a partir de los tamanos publicados, sin contar el coste del contexto): bf16 15,24 GB; Q8_0 8,10 GB; Q6_K 6,40 GB; Q5_K_M 5,52 GB; Q4_K_M 4,78 GB; IQ4_XS 4,28 GB; Q3_K_M 3,88 GB.
- Margen adicional recomendado: entre 1 y 2 GB extra para cache KV y overhead de runtime con contextos moderados; para ventanas de contexto largas, el consumo de la cache KV crece de forma proporcional y puede superar el tamano de los pesos en el caso de modelos de 8B.
- GPUs de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan sin problema las cuantizaciones Q4_K_M y Q5_K_M. Una GPU de 8 GB permite Q4_K_M con contexto limitado. Las cuantizaciones Q3 e IQ3 (3,88-4,11 GB) permiten incluso GPUs de 6 GB.
- GPUs de centro de datos: A100 de 40/80 GB y H100 permiten ejecutar bf16 completo (15,24 GB de pesos) con contextos amplios y alto grado de paralelizacion.
- Apple Silicon: la cuantizacion Q4_1 se describe en la model card como con mejor rendimiento en tokens por vatio en chips de Apple, lo que la hace adecuada para equipos con memoria unificada de 16 GB o superior.
- Opciones de despliegue: llama.cpp (release b11259 como referencia de cuantizacion), Ollama, LM Studio y text-generation-inference, segun las etiquetas del repositorio. El soporte de GGUF en vLLM es parcial y no esta confirmado para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna cuantizacion.

## Comparativa con modelos similares

La comparativa se ve limitada porque no se dispone de la model card del checkpoint base ni de resultados de evaluacion del mismo. Los valores de los modelos de referencia corresponden a datos publicos ampliamente documentados y se incluyen solo como contexto de categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de benchmark |
|---|---|---|---|---|---|
| NadevA23/Kronumos-Kairos-v2 (cuantizado por bartowski) | ~7,62 B | No disponible | Apache 2.0 | GGUF, safetensors (base) | No disponibles |
| Qwen2.5-7B-Instruct | ~7,61 B | 128k (modelo base de la familia) | Apache 2.0 | safetensors, GGUF | No comparable aqui: el rendimiento de Kronumos-Kairos-v2 no esta publicado |
| Llama 3.1 8B Instruct | ~8,03 B | 128k | Licencia comunitaria de Llama 3.1 | safetensors, GGUF | No comparable aqui |
| Mistral 7B v0.3 | ~7,25 B | 32k | Apache 2.0 | safetensors, GGUF | No comparable aqui |

Diferencias relevantes: frente a los modelos anteriores, Kronumos-Kairos-v2 es un fine-tune de nicho con etiquetado especifico para agentes de software y SWE-bench, mientras que las alternativas son modelos de proposito general con documentacion de entrenamiento y evaluaciones publicas. La licencia Apache 2.0 de Kronumos-Kairos-v2 es mas permisiva para uso comercial que la de Llama 3.1.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos ni de toxicidad para este modelo ni para su checkpoint base.
- Alucinacion: en tareas de generacion de codigo y de agentes, el riesgo de APIs inexistentes, imports inventados o parches que no compilan es alto en modelos de 8B; se requiere ejecucion de tests y revision humana obligatoria.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar el manejo de repositorios grandes o conversaciones largas sin truncado. Conviene verificar el valor configurado en el GGUF antes de usarlo en produccion.
- Trazabilidad del entrenamiento: al ser un fine-tune de terceros sin model card detallada en la informacion disponible, no se conocen la composicion del dataset, la posible contaminacion con datos de evaluacion ni los ajustes por preferencias aplicados.
- Etiqueta rust-subcortex: su significado y alcance no estan documentados; no debe asumirse una especializacion fuerte en Rust sin validacion empirica.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar que el checkpoint base y los datasets empleados no impongan restricciones adicionales, especialmente por la referencia a SWE-bench_Verified.
- Calidad de las cuantizaciones bajas: los formatos Q3 e IQ3 degradan de forma notable la coherencia en tareas de codigo; para uso en agentes se recomienda Q4_K_M o superior.
- Advertencia sobre el repositorio: el contenido citado en la model card se ha usado solo como referencia documental; no debe interpretarse como instrucciones operativas.
- Fecha de publicacion: el repositorio figura creado el 30 de septiembre de 2026, dato que puede resultar anomalo segun el calendario del lector y que se reproduce tal cual aparece en la informacion.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/bartowski/NadevA23_Kronumos-Kairos-v2-GGUF
- Modelo base: https://huggingface.co/NadevA23/Kronumos-Kairos-v2
- Pagina del autor del modelo base: https://huggingface.co/NadevA23/Kronumos
- Release de llama.cpp usado para cuantizar: https://github.com/ggml-org/llama.cpp/releases/tag/b11259
- Dataset referenciado: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified
- Pagina del creador de las cuantizaciones: https://www.aimodels.fyi/creators/huggingFace/bartowski
