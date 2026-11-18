# Jundot/Qwen3.8-27B-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4e-fp16-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.781 millones de parametros de tipo vision-lenguaje construido sobre la arquitectura Qwen3.5. Lo desarrolla el usuario Jundot mediante la herramienta oQ (oMLX v0.7.3), no el equipo de Qwen: se trata por tanto de una distribucion derivada, no de un modelo original. Su proposito es permitir la ejecucion del modelo base en hardware Apple Silicon con un peso en disco de 18,5 GB, frente a los aproximadamente 55 GB que ocuparia el checkpoint original en BF16.

La relevancia de esta ficha esta en el compromiso que ofrece: mantiene el contexto nativo de 262.144 tokens, el codificador visual para imagen y video, y la cabeza de prediccion multi-token (MTP), todo ello con una media efectiva de 5,310 bits por peso en el checkpoint completo y 4,840 bits por peso en el backbone de lenguaje. La cuantizacion no es uniforme: asigna bits por sensibilidad de capa medida, con grupos afines de 4, 5, 6 y 8 bits y un pequeno remanente en FP16 y FP32.

El resultado es un artefacto orientado a inferencia local en Mac, no a servidores GPU. La licencia Apache-2.0 heredada del modelo base permite uso comercial, pero conviene tener presente que se trata de una conversion de terceros y que el modelo original Qwen3.8-27B no esta verificado de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (Qwen3.5), con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Precision mixta oQ4e: affine 4 bits (grupo 64), 5 bits (grupo 64), 6 bits (grupo 64), 8 bits (grupo 64), FP16 y FP32; media efectiva 5,310 bits/peso (checkpoint) y 4,840 bits/peso (backbone) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 16,272 GB / 15,155 GiB |
| Codificador visual | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,323 GB / 0,301 GiB |
| Total | 27,781B | 18,439 GB / 17,172 GiB |

Distribucion de bits por formato:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4 bits, grupo 64 | 19,393B | 69,807% | 10,160 GiB | 4,50 |
| Affine 5 bits, grupo 64 | 6,579B | 23,680% | 4,212 GiB | 5,50 |
| Affine 6 bits, grupo 64 | 1,282B | 4,615% | 0,970 GiB | 6,50 |
| Affine 8 bits, grupo 64 | 0,011B | 0,041% | 0,011 GiB | 8,50 |
| FP16 | 0,055B | 0,198% | 0,103 GiB | 16,00 |
| FP32 | 0,461B | 1,658% | 1,716 GiB | 32,00 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una disposicion hibrida de capas Gated DeltaNet y Gated Attention, una variante de atencion lineal con estado recurrente combinada con atencion clasica. Esta mezcla es la que permite sostener un contexto nativo de 262.144 tokens sin que el coste de atencion crezca de forma cuadratica en todas las capas. El checkpoint incluye tres bloques diferenciados: el backbone de lenguaje (26,896B), un codificador visual de 0,461B que habilita la comprension de imagen y video, y una cabeza de prediccion multi-token de 0,425B que permite generar varios tokens por paso de decodificacion.

Sobre el entrenamiento del modelo base no se dispone de informacion en la documentacion proporcionada: no hay datos sobre volumen de tokens, composicion del corpus, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla el proceso de entrenamiento del codificador visual ni el regimen de congelacion o ajuste conjunto.

La innovacion tecnica de esta ficha concreta es el metodo de cuantizacion oQ4e de oMLX 0.7.3. Asigna bits por sensibilidad de capa medida empiricamente, redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens, y aplica un reajuste de escala y sesgo por minimos cuadrados ponderados. Esta version FP16 almacena las escalas, los sesgos y los tensores no cuantizados en FP16 en lugar de BF16, y mantiene el codificador visual en FP32. La version del 29 de octubre de 2026 re-cuantiza el modelo con la revision mejorada de oQe; el autor advierte que las copias anteriores deben descargarse de nuevo.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Comprension de imagen: el codificador visual de 0,461B procesa entradas visuales junto al texto.
- Comprension de video: la model card menciona explicitamente la comprension de video como capacidad del modelo base.
- Contexto largo: 262.144 tokens nativos, adecuado para documentos extensos, transcripciones o bases de codigo.
- Decodificacion multi-token mediante la cabeza MTP de 0,425B, que puede acelerar la generacion al proponer varios tokens por paso.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes anuales o expedientes completos en una sola pasada sobre un Mac con memoria unificada suficiente, sin fragmentacion ni recuperacion externa.
- Asistencia sobre capturas y diagramas: el codificador visual permite adjuntar imagenes de interfaces, esquemas de arquitectura o graficos y formular preguntas sobre ellos, util para revision de disenos y depuracion visual.
- Procesamiento de video para resumenes: la comprension de video habilita la generacion de resumenes, indices de capitulos o busqueda semantica sobre grabaciones de reuniones y clases.
- Prototipado de producto en Apple Silicon: al ocupar 18,5 GB en disco y ejecutarse con MLX, permite validar flujos de vision-lenguaje en un MacBook Pro antes de comprometer presupuesto de GPU en la nube.
- Extraccion de datos estructurados de documentos escaneados: combinando vision y contexto largo, se pueden procesar lotes de facturas o formularios y emitir JSON, siempre que se valide la salida con esquemas.
- Generacion asistida de codigo y revision de parches: el contexto extendido permite cargar repositorios medianos y razonar sobre dependencias entre ficheros, con la ventaja de que el codigo no sale del equipo.
- Investigacion en cuantizacion: el checkpoint sirve como referencia reproducible para estudiar el impacto de la precision mixta por capas frente al modelo BF16 original, dado que el autor publica la distribucion exacta de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni evaluaciones de perdida de calidad respecto al modelo base. Tampoco se documentan cifras de latencia o throughput para la decodificacion especulativa con la cabeza MTP.

## Requisitos de hardware

- Almacenamiento: 18,5 GB de repositorio; el checkpoint ocupa 17,172 GiB en pesos.
- Memoria: al ser un formato MLX para Apple Silicon, el modelo se carga en memoria unificada. Se necesita un equipo con al menos 24 GB de memoria unificada para el checkpoint, y 32 GB o mas para trabajar comodamente con contexto largo, dado que la cache KV de 262.144 tokens anade consumo adicional no cuantificado en la informacion disponible.
- GPU compatibles: exclusivamente Apple Silicon (series M1, M2, M3, M4 y posteriores) mediante MLX. No es compatible con CUDA.
- GPU NVIDIA: no aplica; el formato safetensors con cuantizacion afine de MLX no se carga directamente en vLLM, TGI ni llama.cpp.
- Opciones de despliegue: MLX y oMLX (version 0.7.3 o superior, por la revision de oQe). No se documentan otros runners compatibles.
- Latencia y throughput: no disponibles.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Mac de consumo con memoria unificada suficiente; no en tarjetas graficas discretas por incompatibilidad de formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ4e-fp16-mtp | 27,781B | 262.144 | MLX safetensors, precision mixta 4-8 bits | Apache-2.0 | Conversion de terceros; incluye vision y MTP |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | Safetensors BF16 | Apache-2.0 | Modelo original; mayor peso en disco y memoria |
| Otras cuantizaciones del mismo base | 27,781B | 262.144 | GGUF, MLX u otros | Apache-2.0 | No disponible en la informacion proporcionada |

La comparacion con alternativas de otros fabricantes no puede establecerse con rigor porque la informacion proporcionada no incluye modelos de referencia ni resultados de evaluacion. Cualquier comparacion de rendimiento entre esta cuantizacion y el checkpoint BF16 requeriria mediciones propias.

## Limitaciones y advertencias

- Es una conversion de terceros: el autor es Jundot, no el equipo de Qwen. La fidelidad respecto al modelo original no esta auditada de forma independiente en la informacion disponible.
- La cuantizacion introduce degradacion inevitable. El 69,8% de los pesos esta a 4 bits, lo que puede afectar a tareas sensibles a precision numerica, como matematicas de varios pasos o generacion de codigo con dependencias sutiles.
- Solo funciona en el ecosistema MLX y Apple Silicon. No hay pesos GGUF ni compatibilidad con CUDA, lo que descarta su uso en infraestructura GPU convencional.
- El consumo de memoria con contexto completo no esta documentado. Cargar 262.144 tokens de cache KV puede exceder la memoria disponible en equipos de 32 GB, por lo que el contexto maximo practico sera menor.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingue equivalente al del modelo base sin verificar.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable el comportamiento habitual de los modelos generativos, agravado potencialmente por la cuantizacion agresiva.
- Sesgos: no documentados. Al no conocerse la composicion del corpus de entrenamiento del modelo base, no es posible evaluar sesgos de dominio, idioma o demografia.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar la licencia del modelo base Qwen/Qwen3.8-27B y conservar el fichero LICENSE incluido.
- La model card advierte de que la version del 29 de octubre de 2026 sustituye a las anteriores; usar copias previas implica una cuantizacion con la revision antigua de oQe.
- No se documentan garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
- Pull request de la revision oQe: https://github.com/jundot/omlx/pull/4930
