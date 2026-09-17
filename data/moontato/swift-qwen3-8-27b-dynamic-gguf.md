# moontato/Swift-Qwen3.8-27B-Dynamic-GGUF

## Resumen

Swift-Qwen3.8-27B-Dynamic-GGUF es una cuantizacion GGUF de precision mixta publicada por el usuario moontato a partir de ukisai/Swift-Qwen3.8-27b, un ajuste fino de Qwen/Qwen3.8-27B. No se trata de un modelo nuevo entrenado desde cero, sino de un derivado cuantizado del ajuste de UkisAI, cuyo objetivo declarado es conservar un tamano y un ancho de banda de memoria propios de una cuantizacion de clase Q4 mientras se preservan tensores sensibles a precision notablemente superior. El resultado es un unico fichero de 17.559.177.376 bytes (16,35 GiB) con una media declarada de 5,14 bits por peso (BPW). El modelo completo tiene 27.320.697.856 parametros (27,32 mil millones), una longitud de contexto de 262.144 tokens y 65 bloques, segun los metadatos del GGUF de origen.

La relevancia de esta publicacion es practica: permite ejecutar en hardware de gama alta de consumo o en una unica GPU profesional un modelo de 27B con contexto muy largo, orientado a razonamiento, generacion de codigo y uso de herramientas. La receta de cuantizacion combina tres piezas concretas: los pesos ajustados de UkisAI, una importance matrix especifica de Swift generada por Bartowski (496 entradas calculadas sobre 582 fragmentos de calibracion) y la asignacion por tensor del esquema UD-Q4_K_XL de Unsloth. El autor ha validado el fichero con llama.cpp en chat normal, codigo, OpenCode, tool calling y flujos de agente de codigo multiarchivo.

Se trata de una cuantizacion comunitaria independiente, no oficial de UkisAI, Qwen, Bartowski ni Unsloth. La licencia es swift-open-license-1.0, una licencia "other" que exige revisar el repositorio original antes de redistribuir o usar comercialmente. En el momento de la ficha, el repositorio no registra descargas ni "likes", por lo que la validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura declarada en el GGUF de origen: `qwen35` (65 bloques, embedding de 5120, FFN de 17408) |
| Parametros totales | 27.320.697.856 (27,32B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF mixta UD-Q4_K_XL: Q5_K (191 tensores), Q8_0 (110), IQ4_XS (70), Q4_K (69), Q6_K (56), IQ4_NL (6), Q3_K (3), IQ3_S (1); media declarada 5,14 BPW |
| Idiomas soportados | no disponible (la model card no documenta idiomas) |
| Licencia | swift-open-license-1.0 (licencia "other"; revisar el repositorio original antes de uso comercial) |
| Formato de pesos | GGUF (fichero unico `Swift-Qwen3.8-27B-UD-Q4_K_XL.gguf`); existe un origen BF16 del que procede |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo original, solo la operacion de cuantizacion. Los metadatos observados del GGUF de origen indican arquitectura `qwen35`, 65 bloques, tamano de embedding 5120, tamano de FFN 17408, 866 tensores totales, de los cuales 360 permanecen en F32 y 506 estaban en BF16 y fueron cuantizados. No se documenta si el modelo usa atencion lineal, decodificacion especulativa ni mezcla de expertos; dado que no se indica lo contrario, la ficha lo trata como un transformer denso de 27,32B. Tampoco hay informacion sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento.

La innovacion tecnica de esta publicacion esta en la cuantizacion, no en el entrenamiento. Frente a un Q4_K_M convencional, aqui se asigna manualmente el tipo de cuantizacion de cada uno de los 506 tensores mediante `tensor_types_UD-Q4_K_XL.txt`: los tensores mas sensibles se mantienen en Q8_0, Q5_K o Q6_K, mientras que otros caen a IQ4_XS, IQ4_NL, Q4_K e incluso Q3_K o IQ3_S. La asignacion se guia con una importance matrix de Bartowski especifica para Swift (496 entradas, 582 fragmentos de calibracion) que no se redistribuye en este repositorio. El proceso se realizo con llama.cpp (build 10990, commit 72b590d65) y es reproducible con `llama-quantize` usando el fichero de tipos de tensor y la imatrix. El autor advierte explicitamente de que esto no es una afirmacion de equivalencia con BF16, Q5_K_M ni Q6_K.

## Capacidades

- Generacion de texto conversacional y razonamiento, segun los tags del repositorio (`reasoning`, `conversational`).
- Generacion y edicion de codigo, con validacion declarada en escenarios de OpenCode, ediciones estructuradas de codigo y flujos de agente multiarchivo.
- Tool calling / function calling: validado por el autor con llama.cpp.
- Uso como agente de codigo multi-paso en entornos tipo OpenCode (lectura de varios ficheros, edicion estructurada, iteracion).
- Ventana de contexto de 262.144 tokens, apta para repositorios y documentacion extensa, condicionada por la memoria disponible en el momento de la inferencia.
- Multilingue: no disponible; no se documentan idiomas en la model card.
- Vision: no incluida. El repositorio contiene unicamente el GGUF del modelo de lenguaje; para entrada de imagen se requiere un proyector multimodal (`mmproj`) compatible de Qwen3.8-27B que no se distribuye aqui.
- Modo "thinking" explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de codigo en local: el modelo puede sostener un bucle de trabajo sobre un repositorio (leer ficheros, proponer parches, verificar) gracias a su contexto de 262.144 tokens y al soporte de tool calling validado en OpenCode. Es adecuado cuando el codigo no puede salir de la maquina por politica de confidencialidad.
- Asistente de refactorizacion multiarchivo: con la ventana completa, se le pueden pasar modulos completos y pedir cambios coherentes entre ficheros, aprovechando la validacion del autor en "structured code edits".
- Integracion en pipelines de CI/CD: mediante `llama-server` exponiendo una API compatible con endpoints, puede invocarse para revision de diffs, generacion de tests o resumen de cambios en un flujo automatizado.
- Atencion al cliente tecnico multi-turno: el contexto largo permite arrastrar historial de incidencias, documentacion de producto y transcripciones previas sin truncar, aunque el coste de KV cache a contexto muy largo hay que dimensionarlo aparte.
- Analisis de documentacion extensa: resumen y extraccion de datos sobre manuales, contratos o conjuntos de especificaciones que superan con holgura los 128.000 tokens.
- Asistente de razonamiento en estacion de trabajo con una sola GPU: al ocupar 16,35 GiB en disco, el modelo es desplegable en GPUs de 24 GB con contexto moderado, lo que permite uso interactivo sin infraestructura cloud.
- Prototipado de agentes con herramientas: al estar en GGUF y funcionar con llama.cpp, sirve como banco de pruebas barato de orquestacion de funciones antes de pasar a un modelo mayor o a una version sin cuantizar.
- Generacion de codigo en produccion con revision humana: el soporte de ediciones estructuradas y tool calling permite insertar el modelo como generador de parches sujeto a validacion en tests, no como escritor directo a la rama principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica numerica. La unica validacion reportada es cualitativa: el fichero funciona con llama.cpp en chat normal, codigo, OpenCode, tool calling, flujos de agente de codigo multiarchivo y ediciones estructuradas de codigo, y el autor declara que "se ha comportado bien" en uso practico con OpenCode. El autor afirma de forma explicita que esto no constituye una afirmacion de equivalencia con BF16, Q5_K_M ni Q6_K.

## Requisitos de hardware

- VRAM minima para pesos: 16,35 GiB (17,56 GB) solo para el fichero GGUF. Cualquier cifra inferior obliga a descarga parcial a CPU o a memoria mapeada.
- VRAM realista para inferencia: por encima de 18-20 GB contando buffers de computo y una KV cache corta; las cifras son estimaciones derivadas del tamano del fichero, no datos publicados por el autor.
- KV cache: no disponible. La model card no documenta numero de cabezas ni dimension de cabeza, por lo que no se puede calcular el coste por token a 262.144 tokens; con 65 bloques y ese contexto, la KV cache es el factor dominante y crece de forma lineal con la longitud, ademas del posible efecto de la atencion sobre ventanas tan largas.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB) con contexto moderado. En GPUs de 16 GB (RTX 4080, 4070 Ti Super) no cabe completo sin offload a CPU.
- GPU profesionales: una L40S o RTX A6000 de 48 GB permite contexto bastante mayor; una A100 o H100 de 80 GB es la opcion para acercarse a la ventana completa de 262.144 tokens.
- Multi-GPU: el reparto por capas de llama.cpp permite dividir el modelo entre dos GPUs de 24 GB, con la penalizacion de ancho de banda correspondiente.
- Opciones de despliegue: llama.cpp (`llama-cli` con `-cnv`, `llama-server` con `--host` y `--port`), y por compatibilidad de formato, Ollama o LM Studio importando el GGUF. vLLM no soporta GGUF de forma nativa y general; para usar vLLM habria que partir del modelo BF16, que no esta en este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moontato/Swift-Qwen3.8-27B-Dynamic-GGUF | 27,32B | 262.144 | GGUF unico, UD-Q4_K_XL mixta, 5,14 BPW, 16,35 GiB | swift-open-license-1.0 | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la ficha |
| ukisai/Swift-Qwen3.8-27b (origen) | 27,32B | 262.144 | Pesos originales (no GGUF) | swift-open-license-1.0 | Publico en HuggingFace; referencia directa de esta cuantizacion |
| bartowski/ukisai_Swift-Qwen3.8-27b-GGUF | 27,32B | 262.144 | GGUF con importance matrix propia | swift-open-license-1.0 | Publico en HuggingFace; es la fuente de la imatrix usada aqui |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Publico en HuggingFace segun la model card |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes, por lo que la comparativa se limita a parametros, contexto, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es una publicacion oficial: es una cuantizacion comunitaria independiente, sin respaldo de UkisAI, Qwen, Bartowski ni Unsloth.
- Rendimiento degradado respecto a BF16: el propio autor declara que no afirma equivalencia con BF16, Q5_K_M ni Q6_K. Los tensores en Q3_K e IQ3_S pueden afectar de forma perceptible a tareas sensibles a la precision.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo original ni frente a otras cuantizaciones.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la ficha; toda la validacion reportada procede del propio autor.
- Licencia restrictiva para uso comercial: swift-open-license-1.0 es una licencia "other". Hay que leer el repositorio y la licencia del modelo Swift original antes de redistribuir o explotar comercialmente el modelo.
- Sin informacion de idiomas: no se documenta cobertura multilingue, por lo que no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Sin datos de sesgos ni de alineamiento: no se describe el dataset de entrenamiento del modelo original, el proceso de RLHF/DPO ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano; en tareas de codigo y datos factuales debe verificarse la salida. No hay evaluaciones de tasa de alucinacion.
- Sin vision: el repositorio solo contiene el modelo de lenguaje. El uso multimodal requiere un `mmproj` compatible que no se incluye.
- Coste de contexto: aunque el modelo declara 262.144 tokens, la KV cache a esa longitud puede exceder la VRAM de la mayoria de GPUs; el contexto efectivo depende del hardware.
- La importance matrix usada no se redistribuye en este repositorio, solo se documenta su procedencia.
- Repositorio de 17,6 GB: requiere descarga de un fichero unico grande; conviene verificar los hashes con `SHA256SUMS` antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moontato/Swift-Qwen3.8-27B-Dynamic-GGUF
- Modelo base ajustado (Swift): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Bartowski con la importance matrix de Swift: https://huggingface.co/bartowski/ukisai_Swift-Qwen3.8-27b-GGUF
- Repositorio del que se obtuvo el mapa de tensores UD-Q4_K_XL: https://huggingface.co/ajgazin/Qwen3.8-27B-Heretic-Dynamic-GGUF
- llama.cpp (herramienta de cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas de soporte de Microsoft sin relacion con esta publicacion.
