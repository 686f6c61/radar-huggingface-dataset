# ceselder/maemm-27b-rl-after-0.5m-sft-run

## Resumen

`ceselder/maemm-27b-rl-after-0.5m-sft-run` es un checkpoint publicado en Hugging Face por el usuario `ceselder`, derivado de la familia Qwen3.6 de Alibaba (etiqueta de arquitectura `qwen3_5` en los metadatos del repo). El modelo tiene 27.781.427.952 parametros reales segun los pesos en safetensors y se distribuye bajo licencia Apache 2.0, con pipeline `image-text-to-text`, lo que indica que incorpora un codificador de vision ademas del modelo de lenguaje. La model card incluida en el repositorio reproduce la de Qwen3.6-27B, de modo que las especificaciones de arquitectura y los benchmarks publicados corresponden al modelo base, no necesariamente a este fine-tuning concreto.

El nombre del repositorio sugiere una fase de RL posterior a un SFT de aproximadamente 0,5 millones de ejemplos, pero no hay documentacion en la informacion disponible que detalle el dataset, la receta de entrenamiento ni los hiperparametros empleados en ese ajuste. El checkpoint se creo y actualizo el 12 de noviembre de 2026, cuenta con cero descargas y cero likes, y ocupa 378,3 GB en el repositorio, un tamano coherente con pesos en precision completa (bf16/fp32) de un modelo de casi 28 000 millones de parametros mas el codificador de vision.

Su relevancia es doble: por un lado, hereda las capacidades del Qwen3.6-27B (contexto nativo de 262 144 tokens extensible hasta 1 010 000, modo de preservacion de razonamiento y foco en codigo agentico); por otro, al ser un ajuste comunitario sin model card propia, debe tratarse como un artefacto experimental que requiere evaluacion independiente antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; layout hibrido 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, KTransformers) |

Datos adicionales de arquitectura (heredados de Qwen3.6-27B): dimension oculta 5120, 64 capas, embedding de tokens de 248 320 (con padding), FFN con dimension intermedia 17 408, atencion lineal Gated DeltaNet con 48 cabezas para V y 16 para QK (dimension 128), atencion con compuerta con 24 cabezas Q y 4 KV (dimension 256, RoPE de 64 dimensiones) y prediccion multi-token (MTP) entrenada con multiples pasos.

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido poco habitual: combina capas de atencion lineal Gated DeltaNet con capas de atencion tradicional con compuerta en una proporcion 3:1 dentro de cada bloque de 4 capas, repetido 16 veces. Este esquema reduce el coste computacional y de memoria del mecanismo de atencion en secuencias largas, lo que explica el contexto nativo de 262 144 tokens y la extension hasta 1 010 000. La inclusion de MTP (multi-token prediction) entrenado con multiples pasos permite decodificacion especulativa interna y mejora el throughput en inferencia. El modelo incorpora ademas un encoder de vision, lo que lo habilita para tareas image-text-to-text.

Respecto al entrenamiento, la model card del modelo base menciona fases de preentrenamiento y postentrenamiento, pero no detalla el numero de tokens, la composicion del dataset ni si se emplearon RLHF, DPO u otras tecnicas de alineamiento. El nombre del repositorio indica un ajuste de RL aplicado despues de una fase de SFT con aproximadamente 0,5 millones de ejemplos, pero no se especifica la naturaleza de esos datos, el algoritmo de RL utilizado ni los resultados de dicha fase. Toda la informacion de benchmarks y arquitectura procede de la model card de Qwen3.6-27B, no de una evaluacion especifica de este checkpoint.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventanas de contexto muy largas (hasta 1 010 000 tokens en modo extendido).
- Codigo y razonamiento a nivel de repositorio: la model card del base destaca mejoras en flujos de trabajo de frontend y razonamiento sobre repositorios completos.
- Codigo agentico: SWE-bench Verified de 77,2 y SWE-bench Multilingual de 69,3 en el modelo base, lo que indica capacidad para resolver issues reales sobre codebases.
- Vision: pipeline `image-text-to-text`, con encoder de vision integrado para tareas que combinan imagen y texto.
- Preservacion de razonamiento (thinking preservation): opcion de retener el contexto de razonamiento de mensajes historicos, segun la model card del base.
- Prediccion multi-token (MTP) entrenada, que habilita decodificacion especulativa.
- Soporte de tool calling y function calling: no se detalla explicitamente en la informacion disponible, aunque es habitual en la familia Qwen; debe verificarse en la practica.
- Capacidades multilingues: no disponibles en los metadatos del repo; el benchmark SWE-bench Multilingual del base sugiere cierto soporte, pero no se especifican idiomas.

## Casos de uso

- Reparacion automatica de issues en repositorios: el modelo puede recibir un issue y el arbol del repositorio, razonar sobre el codigo y proponer un parche; los 262 144 tokens de contexto nativo permiten incluir varios ficheros relevantes sin truncar, y el resultado de 77,2 en SWE-bench Verified del base respalda esta aplicacion.
- Revision de codigo en pipelines de CI/CD: integrado mediante vLLM o SGLang, puede analizar diffs y generar comentarios de revision o tests adicionales antes del merge, aprovechando la compatibilidad declarada con esos motores de inferencia.
- Asistentes de desarrollo con memoria de razonamiento: la opcion de preservar el contexto de razonamiento entre mensajes reduce el coste de repetir explicaciones en sesiones iterativas de depuracion.
- Analisis de documentos tecnicos extensos: con contexto de hasta 1 010 000 tokens en modo extendido, es adecuado para resumir especificaciones, contratos o manuales de gran volumen en una sola pasada.
- Procesamiento de capturas y diagramas: al ser un modelo image-text-to-text, puede interpretar mockups de interfaz, diagramas de arquitectura o capturas de errores y generar descripciones o codigo a partir de ellas.
- Migracion de codigo entre lenguajes o frameworks: el resultado de 69,3 en SWE-bench Multilingual del base sugiere capacidad para trabajar con codebases en varios lenguajes, util en tareas de traduccion de codigo y actualizacion de dependencias.
- Generacion de documentacion tecnica a partir de repositorios: el contexto largo permite ingerir modulos completos y producir documentacion coherente con la implementacion real.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a Qwen3.6-27B segun la model card incluida en el repositorio. No hay benchmarks publicados especificos de este checkpoint ajustado con RL.

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 76,2 | 52,0 | 80,9 | 73,4 | 77,2 |
| SWE-bench Pro | 51,2 | 50,9 | 35,7 | 57,1 | 49,5 | 53,5 |
| SWE-bench Multilingual | 69,3 | 69,3 | 51,7 | 77,5 | 67,2 | no disponible en el extracto |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 56 GB solo para pesos (27 781 M parametros x 2 bytes), mas el encoder de vision y la cache KV; en la practica se necesitan 64-80 GB.
- Cuantizacion a 8 bits: alrededor de 28 GB de pesos, viable en una A100 de 40 GB o en dos RTX 4090.
- Cuantizacion a 4 bits: alrededor de 14-16 GB de pesos, lo que permite ejecucion en una RTX 4090 de 24 GB, aunque con perdida de calidad no cuantificada para este checkpoint.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 sin cuantizar; A100 40 GB o dos RTX 4090 para 8 bits; RTX 4090 unica solo con cuantizacion de 4 bits.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers segun la model card; llama.cpp u Ollama no se mencionan y requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles. El uso de atencion lineal Gated DeltaNet y MTP deberia mejorar el rendimiento en secuencias largas respecto a un transformer denso equivalente, pero no hay cifras publicadas.
- Espacio en disco: el repositorio ocupa 378,3 GB, lo que sugiere que los pesos se almacenan en un formato de mayor precision que bf16 (posiblemente fp32 o con multiples copias); conviene verificar los ficheros antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ceselder/maemm-27b-rl-after-0.5m-sft-run | 27,8 B | 262 144 (ext. 1 010 000) | no evaluado (base: 77,2) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.6-27B (base) | 27 B | 262 144 (ext. 1 010 000) | 77,2 | Apache 2.0 | Hugging Face, oficial |
| Qwen3.5-27B | 27 B | no disponible | 75,0 | Apache 2.0 | Hugging Face, oficial |
| Gemma4-31B | 31 B | no disponible | 52,0 | no disponible | no disponible |
| Claude 4.5 Opus | no disponible | no disponible | 80,9 | propietaria | API |

La comparativa mas directa es con el Qwen3.6-27B original: este checkpoint parte de el y anade una fase de RL tras SFT, pero sin evaluacion publicada no puede afirmarse que mejore al base. Frente a Qwen3.5-27B, el base Qwen3.6-27B mejora 2,2 puntos en SWE-bench Verified y 2,3 en SWE-bench Pro; frente a Gemma4-31B la diferencia es de 25,2 puntos en SWE-bench Verified.

## Limitaciones y advertencias

- Ausencia de model card propia: el repositorio reproduce la model card de Qwen3.6-27B, por lo que no hay documentacion del proceso de RL ni del SFT de 0,5 millones de ejemplos, lo que impide conocer que comportamiento se ha modificado respecto al base.
- Sin evaluacion independiente: cero descargas y cero likes en el momento de la consulta; no hay evidencia de terceros sobre calidad, estabilidad o regresiones.
- Riesgo de degradacion por RL: los ajustes de RL sobre un modelo ya postentrenado pueden introducir sobreajuste al reward, colapso de diversidad o regresiones en tareas no cubiertas por el dataset de RL; sin benchmarks no puede descartarse.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; el modo de razonamiento extendido no elimina la generacion de contenido incorrecto, especialmente en dominios especializados.
- Idiomas no declarados: los metadatos no especifican idiomas soportados, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Contexto extendido no verificado: la extension hasta 1 010 000 tokens es una capacidad del base; su comportamiento efectivo en este checkpoint no esta documentado y suele implicar degradacion de atencion en posiciones muy lejanas.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.6 conviene revisar el enlace de licencia referenciado en la model card (`Qwen/Qwen3.6-27B`) por si incluye terminos adicionales.
- Tamano del repositorio: 378,3 GB dificulta la descarga y el almacenamiento; verificar el formato real de los pesos antes de planificar el despliegue.
- Sin soporte de GGUF ni Ollama: no hay artefactos cuantizados publicados, lo que limita el despliegue en hardware de consumo sin conversion manual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ceselder/maemm-27b-rl-after-0.5m-sft-run
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Blog de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai
