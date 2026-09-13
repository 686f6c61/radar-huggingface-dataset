# logic65/Whittle-Next-27B-A3B

## Resumen

Whittle-Next-27B-A3B es un modelo experimental de tipo mezcla de expertos (MoE) publicado por el usuario logic65 en HuggingFace, construido como un *fine-tune* del cuerpo de Qwen3.6-35B-A3B y sucesor directo de Whittle-Next-26B-A3B. El modelo utiliza el formato de pesos `qwen4_exp` (heredado del formato de Qwen3.8-Flash-Next) e incorpora tres modificaciones arquitectónicas sobre el transformer MoE convencional: hiper-conexiones con flujos diferenciados entre sí, una memoria n-gram hasheada de 2.000 millones de filas y tensores de *embedding* por capa. Cuenta con 27.568.288.915 parámetros totales (unos 27,1 B de cuerpo más 2,0 B de memoria) y aproximadamente 3 B de parámetros activos por token.

El modelo no se presenta como un producto terminado, sino como un punto de partida para investigación sobre la arquitectura `qwen4_exp`. El autor lo describe explícitamente como una *research preview* con advertencias: el presupuesto de cómputo se ha agotado y la destilación completa que el modelo necesitaría no se ha podido financiar. El entrenamiento se organizó en cuatro fases: las versiones v1 a v3 (3-4 de septiembre) construyeron el cuerpo, hicieron que la memoria fuese determinante en el cómputo y destilaron razonamiento; la versión v4 (7-10 de septiembre, la publicada en la raíz del repositorio) sustituyó el contenido de la memoria por una transferencia exacta de la tabla n-gram de Qwen3.8-Flash-Next, enseñó a las capas posteriores al punto de inyección a leerla y ejecutó tres noches de destilación solo sobre los expertos con trazas de razonamiento completas.

Su relevancia actual es doble. Por un lado, es uno de los pocos artefactos públicos que documenta una implementación funcional de hiper-conexiones y memoria n-gram hasheada sobre un MoE que carga y ejecuta en llama.cpp estándar sin parches. Por otro, publica junto a los pesos el estado de entrenamiento completo (cuerpo congelado, checkpoint entrenable, tabla, contrato de hash, entrenador y exportador), lo que permite continuar la destilación. El repositorio principal ocupa 541,4 GB y las versiones cuantizadas GGUF (de Q8_0 a Q3_K_M) se distribuyen en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con hiper-conexiones, memoria n-gram hasheada y embeddings por capa; formato `qwen4_exp` (Qwen3.8-Flash-Next) |
| Parametros totales | 27.568.288.915 (27,57 B), de los cuales 2,0 B corresponden a la memoria n-gram |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible (se han ejecutado pruebas de lectura de contexto largo entre 4k y 75k tokens) |
| Tipos de cuantizacion | GGUF de Q8_0 a Q3_K_M en el repositorio `logic65/Whittle-Next-27B-A3B-GGUF`; safetensors sin cuantizar en el repositorio principal |
| Idiomas soportados | en, zh, multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo de cuantizaciones) |

Otros datos del repositorio: 2.597 descargas, 9 *likes*, creado el 3 de septiembre de 2026 y actualizado el 12 de septiembre de 2026. Tamaño del repositorio: 541,4 GB. Modelos base declarados: `Qwen/Qwen3.6-35B-A3B` y `logic65/Whittle-Next-26B-A3B`.

## Arquitectura y entrenamiento

La arquitectura parte del cuerpo MoE de Qwen3.6-35B-A3B, un modelo de unos 35 B de parámetros totales y ~3 B activos por token, y lo reformatea al esquema `qwen4_exp` empleado por Qwen3.8-Flash-Next. Sobre ese cuerpo se añaden tres componentes: hiper-conexiones (conexiones residuales generalizadas con múltiples flujos, que en esta versión son "genuinamente distintos entre sí", según el autor), una memoria n-gram hasheada de 2.000 millones de filas y tensores de *embedding* por capa. El resultado son 27,57 B de parámetros totales con ~3 B activos, es decir, un modelo con coste de cómputo por token propio de un modelo de ~3 B pero con requisitos de memoria propios de uno de ~27 B.

El entrenamiento se dividió en cuatro fases. Las versiones v1 a v3 (3-4 de septiembre) construyeron el cuerpo, hicieron que la memoria n-gram fuese determinante en el cómputo (no un componente pasivo) y completaron la destilación de razonamiento. La versión v4 (7-10 de septiembre) reemplazó el contenido de la memoria por una transferencia exacta de la propia tabla n-gram de Qwen3.8-Flash-Next, ajustó las capas posteriores al punto de inyección para que aprendiesen a leerla y ejecutó tres noches de destilación *solo sobre los expertos* empleando trazas de razonamiento completas. Según el autor, esto redujo de 6 en 40 a 0 las respuestas que no terminaban en la sonda de *thinking*. La destilación en línea procede de la estirpe de Qwen3.8-27B. El modelo carga y se ejecuta en llama.cpp estándar sin parches, y el repositorio publica el exportador, el entrenador, la tabla de hash y su contrato.

## Capacidades

- Generación de texto conversacional en inglés, chino y otros idiomas (etiqueta `multilingual`).
- Razonamiento matemático de nivel escolar: 86,5 % de *exact match* en GSM8K con 200 preguntas y tope de 512 tokens sin *thinking*, y el mismo resultado con *thinking* activado y tope de 2048 tokens.
- Modo de razonamiento explícito (*thinking*) activable, con trazas de pensamiento destiladas a partir de Qwen3.8-27B.
- Generación de código en casos sencillos: las tres sondas publicadas (Fibonacci, script de shell, caché LRU) se resuelven correctamente, con 2 de 3 respuestas delimitadas en bloque de código.
- Lectura de contexto largo: el *harness* de lectura sobre un *pull request* real y ficheros de repositorio obtuvo 100 % de acierto a 4k tokens, 83,3 % a 8k y 66,7 % entre 26k y 75k.
- Control de terminación de respuesta: 12 de 12 respuestas cerradas correctamente en la sonda de parada con tope de 400 tokens y repetición máxima de 4-gramas de 0,055.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo incluye modo *thinking* y se distribuye con la etiqueta `reasoning`, pero no se detallan capacidades de agente.
- Capacidades de visión o audio: no disponibles.
- Compatibilidad declarada con llama.cpp (a través de las cuantizaciones GGUF) y con la librería `transformers`.

## Casos de uso

- Investigación sobre arquitecturas MoE con hiper-conexiones: el repositorio publica el cuerpo congelado, el checkpoint entrenable, la tabla de hash, el contrato de la memoria, el entrenador y el exportador, de modo que un grupo de investigación puede reproducir las fases v1-v4 y continuar la destilación desde el punto en que el autor la dejó por falta de presupuesto.
- Destilación de razonamiento sobre expertos: el modelo documenta una receta concreta de destilación *expert-only* sobre trazas de pensamiento completas, con resultados medidos en la sonda de terminación de respuestas (de 6 fallos en 40 a 0). Sirve como referencia metodológica para quien quiera aplicar la misma técnica a otros MoE.
- Sustitución de la tabla n-gram de un modelo preentrenado: la fase v4 demuestra una transferencia exacta de la tabla n-gram de Qwen3.8-Flash-Next y el ajuste posterior de las capas lectoras. Es un caso de estudio replicable para inyectar memoria léxica externa en un transformer.
- Lectura y resumen de repositorios de código en local: con las cuantizaciones GGUF y llama.cpp estándar, el modelo puede procesar *pull requests* y ficheros de repositorio con contexto de hasta 26k-75k tokens, aunque con una precisión medida del 66,7 % en ese rango frente al 100 % de su modelo padre.
- Evaluación de cuantizaciones en MoE con memoria externa: el repositorio separado de GGUF cubre de Q8_0 a Q3_K_M, lo que permite medir cómo degradan las distintas precisiones un modelo con solo ~3 B de parámetros activos pero 27,57 B residentes.
- Generación de código en scripts pequeños y utilidades: las sondas publicadas (Fibonacci, shell, LRU) se resuelven correctamente, por lo que puede emplearse como asistente local para tareas de programación acotadas en entornos sin acceso a APIs externas.
- Prácticas educativas sobre mezcla de expertos: al ejecutarse en llama.cpp sin parches y con todas las trazas de evaluación publicadas en el repositorio, es un material útil para estudiar el comportamiento de un MoE con enrutado y memoria n-gram en hardware de consumo.
- No se recomienda su uso como servicio de atención al cliente, producción crítica ni tareas de precisión sobre contexto muy largo, dado el estado de *research preview* declarado por el propio autor.

## Benchmarks y rendimiento

Todos los resultados siguientes están declarados por el autor del modelo en el `model-index` y en la tabla de la *model card*, y figuran con `verified: false` (no verificados de forma independiente).

| Prueba | Configuración | Resultado | Notas |
|---|---|---|---|
| GSM8K, 200 preguntas | *thinking* off, tope 512 tokens, Q8_0 GGUF, llama.cpp estándar | 86,5 % (173/200) | 1 respuesta truncada |
| GSM8K, 200 preguntas | *thinking* off, tope 1024 tokens | 86,0 % (172/200) | 0 truncadas |
| GSM8K, 200 preguntas | *thinking* on, tope 2048 tokens | 86,5 % (173/200) | 3 truncadas |
| Lectura de contexto largo (PR real + ficheros de repositorio, 6 preguntas) | 4k tokens, v4.3, Q8_0 | 100 % | harness con repositorio privado, transcripciones no publicadas |
| Lectura de contexto largo | 8k tokens, v4.3, Q8_0 | 83,3 % | |
| Lectura de contexto largo | 26k-75k tokens, v4.3, Q8_0 | 66,7 % | el modelo padre Qwen3.6-35B-A3B obtiene 100 |
| Sonda de parada | 12 respuestas abiertas, tope 400 tokens | 12/12 | repetición máxima de 4-gramas 0,055 |
| Sondas de código (fib / bash / LRU) | v3 | 3/3 correctas | 2 de 3 con bloque de código delimitado |
| Entropía cruzada retenida, chat | v3 | 1,219 | |
| Entropía cruzada retenida, corpus | v3 | 2,084 | el maestro sobre las mismas filas del corpus obtiene 1,826 |

Comparación interna publicada por el autor entre versiones:

| Métrica | base 25B | Next-26B | Next-27B v3 |
|---|---|---|---|
| Parámetros totales | 25,1 B | 26,1 B | 27,1 B (25,1 B + 2,0 B de memoria) |
| Activos por token | ~3 B | ~3 B | ~3 B |
| GSM8K 200, tope 512, *thinking* off | 86,5 % | 87,0 % (4 truncadas) | 86,5 % (173/200, 1 truncada) |
| GSM8K 200, tope 1024, *thinking* off | no disponible | 86,5 % (0 truncadas) | 86,0 % (172/200, 0 truncadas) |
| GSM8K 200, tope 2048, *thinking* on | no disponible | no disponible | 86,5 % (173/200, 3 truncadas) |
| Sonda de parada (12 respuestas, tope 400) | no disponible | 10/12 | 12/12, repetición 0,055 |
| Sondas de código (fib / bash / LRU) | no disponible | no disponible | 3/3 correctas, 2 de 3 delimitadas |
| CE retenida, chat / corpus | no disponible | 1,182 / 2,052 | 1,219 / 2,084 |

No se han publicado resultados de MMLU, HumanEval, MATH ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Parámetros residentes: 27,57 B totales. Aunque solo ~3 B se activan por token, todos los expertos y la memoria n-gram deben estar accesibles, por lo que el requisito de memoria es el de un modelo de ~27 B, no el de uno de ~3 B.
- VRAM estimada para inferencia (estimación a partir del recuento de parámetros, no publicada por el autor): en torno a 29-30 GB en Q8_0, 16-18 GB en Q4_K_M y 13-15 GB en Q3_K_M. Estas cifras son estimaciones y no deben tomarse como medidas oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de ~27 B en Q8_0 requiere una GPU de 40-80 GB (A100 40 GB, A100 80 GB, H100) o varias GPU de consumo en paralelo; en Q4_K_M puede caber en una GPU de 24 GB.
- GPU de consumo: en cuantizaciones Q4_K_M o Q3_K_M podría ejecutarse en una RTX 4090 (24 GB) o RTX 3090 (24 GB), dejando poco margen para contexto largo. En precisiones superiores no cabe en una única GPU de consumo.
- Despliegue: llama.cpp es la vía oficial soportada (el autor indica que funciona sin parches) y dispone de cuantizaciones GGUF publicadas. También se puede cargar con `transformers`. No hay información sobre compatibilidad con vLLM, TGI, Ollama u otros servidores.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni de latencia.
- Almacenamiento: el repositorio principal ocupa 541,4 GB, lo que refleja que contiene pesos sin cuantizar, estado de entrenamiento y todos los registros de evaluación; para inferencia conviene usar el repositorio GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whittle-Next-27B-A3B | 27,57 B / ~3 B | no disponible (probado de 4k a 75k) | GSM8K 86,5 %; contexto largo 100 % a 4k, 66,7 % a 26k-75k | apache-2.0 | safetensors + GGUF Q8_0 a Q3_K_M |
| Qwen/Qwen3.6-35B-A3B (modelo base) | ~35 B / ~3 B (según nomenclatura) | no disponible | 100 % en el *harness* de lectura a 26k-75k según el autor | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Whittle-Next-26B-A3B (versión previa) | 26,1 B / ~3 B | no disponible | GSM8K 87,0 % (512, off), 86,5 % (1024, off); sonda de parada 10/12 | apache-2.0 | no disponible en la información proporcionada |
| base 25B (citado en la tabla del autor) | 25,1 B / ~3 B | no disponible | GSM8K 86,5 % (512, off) | no disponible | no disponible |

No se dispone de datos suficientes sobre Qwen3.8-Flash-Next, Qwen3.8-27B ni otros modelos comparables de la misma categoría (MoE de ~3 B activos con memoria externa) para construir una comparativa adicional fiable.

## Limitaciones y advertencias

- El propio autor declara que **no es un modelo terminado ni de propósito general**, sino un punto de partida para investigación sobre la arquitectura Qwen4-Next (`qwen4_exp`). Los números deben tratarse como una línea base a mejorar, no como un producto.
- La destilación completa prevista está sin ejecutar por falta de presupuesto de cómputo. El autor indica que el presupuesto se ha agotado y que el modelo se publica con advertencias explícitas.
- Todos los resultados de benchmarks están marcados como `verified: false` en el `model-index`. Proceden de registros del propio autor y no han sido verificados de forma independiente.
- Degradación notable en contexto largo: 100 % de acierto a 4k tokens, 83,3 % a 8k y 66,7 % entre 26k y 75k, frente al 100 % de su modelo padre Qwen3.6-35B-A3B en el mismo rango. El autor reconoce esta pérdida.
- Las transcripciones del *harness* de lectura de contexto largo están retenidas porque citan un repositorio privado, por lo que ese resultado no es auditable externamente.
- La entropía cruzada retenida del modelo (1,219 en chat y 2,084 en corpus) es peor que la del maestro sobre las mismas filas del corpus (1,826 en corpus), lo que indica que la destilación no se ha completado con éxito total.
- Riesgo de alucinación: no cuantificado en la información disponible. Se han observado episodios de respuestas que no terminaban correctamente en la sonda de *thinking* (resueltos en v4 según el autor).
- Sesgos conocidos: no documentados en la información proporcionada. El modelo se ha entrenado principalmente en inglés y chino, por lo que su comportamiento en otros idiomas no está evaluado.
- Idiomas: solo se declaran inglés, chino y multilingüe sin detalle de cobertura; no hay evaluación por idioma.
- Licencia apache-2.0, que permite uso comercial, pero al tratarse de un derivado de Qwen3.6-35B-A3B conviene revisar también las condiciones del modelo base antes de un despliegue comercial.
- El repositorio principal ocupa 541,4 GB; descargarlo completo no es necesario para inferencia (basta el repositorio GGUF), pero sí para continuar el entrenamiento.
- Sin información sobre soporte de *tool calling*, despliegue con vLLM/TGI/Ollama, latencia o throughput, por lo que no se recomienda asumir su idoneidad en producción sin pruebas propias.
- No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar, lo que dificulta comparar el modelo con alternativas consolidadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Cuantizaciones GGUF: https://huggingface.co/logic65/Whittle-Next-27B-A3B-GGUF
- Modelo predecesor: https://huggingface.co/logic65/Whittle-Next-26B-A3B
- Registros de evaluación v3: https://huggingface.co/logic65/Whittle-Next-27B-A3B/tree/main/eval/v3
- Registros de entrenamiento de la fase v4 (graft-20260912): https://huggingface.co/logic65/Whittle-Next-27B-A3B/tree/main/train/graft-20260912
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Apoyo al autor (Ko-fi): https://ko-fi.com/davida81328
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
