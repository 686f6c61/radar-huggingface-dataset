# autotrust/GLM-5.3-GGUF-DGX-Spark

## Resumen

GLM-5.3-GGUF-DGX-Spark es una compilación GGUF del checkpoint comprimido autotrust/GLM-5.3-SLIM-E192, derivado del modelo base zai-org/GLM-5.3 de Z.AI (744.000 millones de parámetros, arquitectura MoE con 256 expertos enrutados y activación top-8). El autor, autotrust, aplica su receta SLIM-Q (Selective expert pruning + Low-bit quantization for Inference of MoE), que combina una poda estructural del 25 % de los expertos enrutados por capa con cuantización agresiva IQ2_XXS en los expertos supervivientes, manteniendo atención, routers y expertos compartidos en Q8_0. El resultado es un archivo de 149,7 GiB que reduce el peso un 24 % respecto a la cuantización Q2 equivalente del modelo completo.

El problema que resuelve es de despliegue: un MoE de escala billón no cabe en hardware de gama alta de consumo ni en estaciones compactas. Esta build está dimensionada para ejecutarse íntegramente residente en dos NVIDIA DGX Spark enlazadas por ConnectX-7 (unos 75 GiB por nodo), en una única GPU de 180 GB (B200/GB200) o en un Mac Studio de 256 GB. Según el autor, es la primera compresión publicada de un MoE de escala billón que combina poda de expertos y cuantización de bajo bit, cuando la investigación previa en esta técnica se limita a modelos de unos 50.000 millones de parámetros.

El modelo conserva capacidades de generación de texto, código, razonamiento agéntico y ciberseguridad con pérdidas mínimas frente al checkpoint podado en FP8, aunque degrada de forma deliberada el conocimiento enciclopédico evaluado en exámenes chinos (C-Eval) y el razonamiento científico (GPQA-Diamond). El repositorio acumula 2.243 descargas y 21 likes desde su publicación en septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (glm-dsa), 256 expertos enrutados, top-8 por token |
| Parámetros totales | 562.687.789.632 (checkpoint SLIM-E192 tras poda; el GLM-5.3 original declara 744.000 millones) |
| Parámetros activos | no disponible (top-8 de 192 expertos enrutados por capa; el autor no publica el cómputo activo exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_XXS en expertos enrutados (2,06 bits/peso); Q8_0 en atención, routers y expertos compartidos |
| Idiomas soportados | en, zh |
| Licencia | other (GLM-5.3), con enlace a la licencia del modelo base |
| Formato de pesos | GGUF (4 shards, 149,7 GiB total; checksums SHA-256 incluidos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con atención dispersa denotada como glm-dsa, soportada por llama.cpp upstream. Cada token activa los 8 expertos enrutados más probables de un pool de 256 por capa; tras la poda de autotrust, el pool se reduce a 192 expertos por capa. La atención, los routers y los expertos compartidos se mantienen en Q8_0, de modo que el comportamiento de enrutamiento —del que depende la calidad del MoE— no se ve afectado por la cuantización de bajo bit aplicada a los expertos enrutados.

El pipeline SLIM-Q opera en dos etapas. La primera perfile las frecuencias de enrutamiento sobre cargas de trabajo representativas y elimina estructuralmente los 64 expertos menos usados de cada capa (25 % del pool). A diferencia del skipping dinámico de expertos, que ahorra latencia pero mantiene todos los pesos en memoria, la poda estructural reduce permanentemente la huella de pesos, que es el eje que determina qué hardware puede servir el modelo. La segunda etapa cuantiza los expertos supervivientes a IQ2_XXS (2,06 bits/peso). El coste por token no aumenta: el router sigue seleccionando top-8 entre los 192 expertos restantes, por lo que el tráfico de memoria y el cómputo por token son idénticos; solo cae la huella total. La build de producción de Guru Turbo 2.0 usa NVFP4 en lugar de IQ2_XXS. No se dispone de información sobre el dataset de entrenamiento original de GLM-5.3, el número de tokens ni las etapas de RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Generación y comprensión de código: el autor reporta HumanEval de 95,1 en el checkpoint podado en FP8, idéntico al modelo original.
- Razonamiento matemático: AIME con una pérdida de 2,5 puntos tras la poda (dato del A/B del autor).
- Razonamiento científico y conocimiento enciclopédico: GPQA-Diamond cae de 86,9 a 83,3 y C-Eval de 92,0 a 84,7 tras la poda.
- Conocimiento de ciberseguridad: CyberMetric 87,7 frente a 88,0 del original.
- Tool calling y function calling: BFCL live 69,4 y BFCL multi-turn 72,5 tras la poda, prácticamente sin cambios.
- Capacidades agénticas y razonamiento multi-paso, evaluadas mediante BFCL.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Despliegue en clúster de dos DGX Spark: el caso de diseño del repositorio. El modelo se reparte por llama.cpp RPC entre las dos memorias de 128 GB (unos 75 GiB por nodo) y queda completamente residente, con decodificación limitada por ancho de banda de memoria (unos 25 GB de pesos por token).
- Servicio de inferencia en GPU de 180 GB: en una B200 o GB200 el modelo se sirve residente con 42 t/s en un único stream y 177 t/s agregados con 32 peticiones en paralelo (medición del autor), adecuado para backends de chat con concurrencia moderada.
- Estación de trabajo Mac Studio de 256 GB: ejecución residente vía Metal con un rendimiento de la misma clase que el GLM 5.3 Q2 completo en el mismo equipo, útil para desarrollo y evaluación local sin infraestructura de centro de datos.
- Asistencia de código en pipelines de CI/CD: con HumanEval de 95,1 y soporte de tool calling, puede integrarse en revisiones automáticas, generación de parches y tareas de refactorización donde el contexto largo y el razonamiento agéntico son necesarios.
- Agentes autónomos con llamadas a herramientas: los resultados de BFCL (69,4 en live, 72,5 en multi-turno) lo hacen apto para orquestación de funciones y flujos multi-paso en producción, siempre que el coste de un fallo de enrutamiento sea tolerable.
- Análisis de ciberseguridad: CyberMetric de 87,7 permite clasificación de vulnerabilidades, resumen de informes técnicos y asistencia en triaje, un dominio en el que la poda apenas introduce degradación.
- Procesamiento bilingüe inglés-chino: atención al cliente y análisis documental en ambos idiomas, con la advertencia de que el conocimiento evaluado en exámenes chinos es el más afectado por la compresión.

## Benchmarks y rendimiento

Datos del A/B del autor entre el checkpoint podado en FP8 y el GLM-5.3 original, más el rendimiento medido en hardware:

| Benchmark | GLM-5.3 original | SLIM podado (FP8) |
|---|---|---|
| HumanEval | 95,1 | 95,1 |
| CyberMetric | 88,0 | 87,7 |
| BFCL live | 69,6 | 69,4 |
| BFCL multi-turn | 73,0 | 72,5 |
| AIME | no disponible (referencia) | −2,5 puntos |
| C-Eval | 92,0 | 84,7 |
| GPQA-Diamond | 86,9 | 83,3 |

| Métrica de despliegue | Valor |
|---|---|
| Huella GGUF | 149,7 GiB (−47 GiB, −24 % frente al GLM 5.3 Q2 con la misma receta) |
| Throughput en B200/GB200 | 42 t/s single stream; 177 t/s agregados a 32 peticiones paralelas |
| Throughput en un solo DGX Spark (mmap parcial) | dígito único bajo de t/s |

No se han publicado resultados de benchmarks del archivo IQ2_XXS final frente al checkpoint FP8 en la información disponible; las cifras de calidad corresponden a la etapa de poda.

## Requisitos de hardware

- VRAM/RAM estimada: 149,7 GiB de pesos en total; unos 75 GiB residentes por nodo en la configuración de dos DGX Spark.
- GPU recomendadas: B200 o GB200 de 180 GB para servicio residente en una sola GPU; dos DGX Spark (128 GB cada una) con enlace ConnectX-7 para el despliegue previsto.
- Apple Silicon: Mac Studio de 256 GB (192 GB con contexto pequeño) ejecuta el modelo residente vía Metal.
- Un solo DGX Spark de 128 GB funciona con mmap y paginación desde NVMe, pero a velocidad de un dígito bajo de tokens por segundo; el autor recomienda para ese caso GLM-5.3-Flash-GGUF-DGX-Spark (79 GiB).
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de 48-80 GB.
- Despliegue: llama.cpp upstream con soporte glm-dsa; compilación con `-DGGML_CUDA=ON -DGGML_RPC=ON -DCMAKE_CUDA_ARCHITECTURES=121a-real`; carga apuntando al primer shard de los cuatro.
- Latencia y throughput: 42 t/s en un stream y 177 t/s agregados en B200/GB200; decodificación limitada por ancho de banda de memoria en el clúster Spark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| autotrust/GLM-5.3-GGUF-DGUF-Spark | 562.687.789.632 (tras poda) | no disponible | other (GLM-5.3) | GGUF IQ2_XXS/Q8_0 | 149,7 GiB; dos DGX Spark o GPU de 180 GB |
| zai-org/GLM-5.3 | 744.000 millones | no disponible | GLM-5.3 | safetensors | Modelo original sin poda; requiere despliegue de clase 200 GB en Q2 |
| autotrust/GLM-5.3-SLIM-E192 | no disponible | no disponible | GLM-5.3 | no disponible | Checkpoint podado en FP8 del que deriva esta build |
| autotrust/GLM-5.3-Flash-GGUF-DGX-Spark | no disponible | no disponible | GLM-5.3 | GGUF (79 GiB) | Alternativa del mismo autor para un único DGX Spark |

No se dispone de datos de benchmarks ni de contexto de modelos de otros fabricantes comparables en la información proporcionada.

## Limitaciones y advertencias

- La poda degrada de forma deliberada el conocimiento enciclopédico y el razonamiento científico: C-Eval cae 7,3 puntos y GPQA-Diamond 3,6 puntos; no es adecuado para tareas que dependan de conocimiento factual en chino o de razonamiento científico de alta exigencia.
- El A/B de calidad se realizó sobre el checkpoint podado en FP8, no sobre el GGUF IQ2_XXS final; la degradación adicional de la cuantización a 2,06 bits no está cuantificada en la información disponible.
- La licencia es "other" con nombre glm-5.3 y enlace a la licencia del modelo base; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales.
- Solo se declaran inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- La longitud de contexto no está documentada en el repositorio; no debe asumirse la del modelo base sin verificación.
- En un único DGX Spark el modelo funciona con paginación desde NVMe a velocidad de un dígito bajo de tokens por segundo, lo que lo hace inviable para uso interactivo.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan evaluaciones de factualidad ni de sesgos.
- El repositorio incluye material promocional de demos del autor (news.guru.so) que no constituye documentación técnica del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/autotrust/GLM-5.3-GGUF-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Checkpoint podado de origen: https://huggingface.co/autotrust/GLM-5.3-SLIM-E192
- Alternativa para un solo DGX Spark: https://huggingface.co/autotrust/GLM-5.3-Flash-GGUF-DGX-Spark
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Demo del autor (GuruSearch): https://news.guru.so/ui
