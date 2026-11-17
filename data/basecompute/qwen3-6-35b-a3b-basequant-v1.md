# basecompute/Qwen3.6-35B-A3B-BaseQuant-V1

## Resumen

Qwen3.6-35B-A3B-BaseQuant-V1 es una cuantizacion del modelo Qwen/Qwen3.6-35B-A3B publicada por basecompute bajo licencia Apache 2.0. Se distribuye en dos formatos: un bundle propietario `.base` para el runtime baseRT y un fichero GGUF para llama.cpp. El objetivo es ofrecer una version comprimida del modelo original manteniendo la distribucion de probabilidad del siguiente token lo mas cercana posible al modelo en BF16, medido mediante divergencia KL sobre un conjunto de validacion reservado.

El modelo base Qwen3.6-35B-A3B es un transformer de tipo mixture-of-experts (MoE) con 34.660.610.688 parametros totales, segun los datos de safetensors del repositorio. La nomenclatura "A3B" del nombre indica aproximadamente 3 mil millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. El repositorio ocupa 45,2 GB y la variante cuantizada Medium pesa 23,08 GB en formato `.base` y 22,13 GB en GGUF.

La relevancia de esta publicacion radica en que el bundle `.base` incluye la torre de vision y la cabeza MTP (multi-token prediction) para decodificacion especulativa, capacidades que habitualmente se pierden en las cuantizaciones GGUF convencionales. Ademas, el autor publica una comparativa de divergencia KL frente a la cuantizacion `UD-Q4_K_M` de unsloth, del mismo tamano, lo que permite evaluar la fidelidad de la compresion con una metrica objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts); detalles internos no disponibles |
| Parametros totales | 34.660.610.688 |
| Parametros activos | aproximadamente 3B (inferido de la nomenclatura A3B; no confirmado en la informacion) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-server con `-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Un unico tamano "Medium" (23,08 GB en `.base`, 22,13 GB en GGUF); nivel de bits no especificado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | bundle `.base` (baseRT) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura de mezcla de expertos (MoE), segun refleja la nomenclatura A3B y el recuento de parametros totales (34,66B). La informacion disponible no detalla el numero de expertos, la estrategia de enrutamiento ni la dimension de las capas. El bundle `.base` incorpora ademas dos componentes que no aparecen en el GGUF: una torre de vision y una cabeza MTP (multi-token prediction) destinada a decodificacion especulativa, lo que sugiere que el modelo base es multimodal y admite aceleracion por prediccion de multiples tokens.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similares en el modelo original. Respecto a esta cuantizacion en concreto, el autor no especifica el algoritmo empleado (GPTQ, AWQ, calibracion propia u otro), aunque la denominacion "BaseQuant" y la inclusion de una metrica de divergencia KL sugieren un proceso de calibracion orientado a preservar la distribucion de salida. La evaluacion de fidelidad se realizo sobre 58 prompts en diez categorias y 32.507 tokens puntuados, un conjunto que, segun el autor, no se uso para construir los ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de chat (tag `conversational`).
- Razonamiento y matematicas: la evaluacion de fidelidad incluye categorias especificas de Math y Science con divergencia KL baja.
- Generacion de codigo, incluida la categoria "Agentic coding" en la evaluacion de cuantizacion.
- Uso de herramientas (tool use / function calling), con categoria dedicada en la evaluacion.
- Capacidades multilingues, con categoria dedicada en la evaluacion.
- Vision: la torre de vision esta presente en el bundle `.base`, aunque no se detalla que tareas de imagen soporta.
- Decodificacion especulativa mediante cabeza MTP (solo en el bundle `.base`, no en el GGUF).
- Procesamiento de contexto largo: la evaluacion incluye una categoria "Long context" con 2.048 tokens puntuados.

## Casos de uso

- Asistente conversacional multi-turno: el modelo mantiene el tag `conversational` y la evaluacion muestra divergencia KL de 0,00634 en la categoria Chat (GGUF), lo que indica que la cuantizacion preserva el comportamiento conversacional del original. Adecuado para chatbots de atencion al cliente desplegados con llama.cpp.

- Generacion de codigo en produccion: la categoria Code obtiene 0,00434 de divergencia KL en GGUF, y la categoria Agentic coding 0,00490. Esto permite integrar el modelo en pipelines de CI/CD o asistentes de IDE donde la fidelidad al modelo original es critica para evitar regresiones en el codigo generado.

- Agentes con tool calling: la categoria Tool use registra 0,00517 de divergencia KL en GGUF. El modelo puede gestionar flujos de agente con llamadas a funciones, apropiado para orquestacion de tareas automatizadas donde se requiere que el modelo siga emitiendo las llamadas correctas tras la cuantizacion.

- Analisis de documentos largos: con contexto de 32.768 tokens configurado en llama.cpp y una divergencia de 0,00438 en la categoria Long context, el modelo es apto para resumir o extraer informacion de contratos, informes o articulos extensos.

- Razonamiento matematico y cientifico: las categorias Math (0,00318) y Science (0,00510) en GGUF muestran una fidelidad alta, lo que lo hace util para tutoria automatizada, resolucion de problemas paso a paso o generacion de ejercicios con solucion.

- Procesamiento multilingue: la categoria Multilingual obtiene la divergencia mas baja de la tabla (0,00213 en GGUF), lo que sugiere que la cuantizacion degrada minimamente el comportamiento en idiomas distintos del ingles. Apropiado para traduccion o atencion al cliente en varios idiomas.

- Inferencia multimodal en local: el bundle `.base` conserva la torre de vision, por lo que puede desplegarse con baseRT para tareas de descripcion de imagenes o extraccion de informacion de capturas, aunque los detalles de la torre no estan documentados.

- Decodificacion acelerada: la cabeza MTP del bundle `.base` permite decodificacion especulativa, util en escenarios de baja latencia donde el throughput importa, como asistentes interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica unicamente una tabla de divergencia KL respecto al modelo BF16 sobre texto reservado, que mide fidelidad de la cuantizacion, no calidad absoluta del modelo.

| Categoria | Tokens | BaseQuant `.base` | BaseQuant GGUF | unsloth `UD-Q4_K_M` |
|---|---:|---:|---:|---:|
| Agentic coding | 2.228 | 0,00465 | 0,00490 | 0,00515 |
| Chat | 3.342 | 0,00648 | 0,00634 | 0,00645 |
| Code | 2.883 | 0,00427 | 0,00434 | 0,00450 |
| Long context | 2.048 | 0,00427 | 0,00438 | 0,00536 |
| Math | 4.608 | 0,00304 | 0,00318 | 0,00265 |
| Multilingual | 4.232 | 0,00222 | 0,00213 | 0,00233 |
| Prose | 3.994 | 0,00624 | 0,00587 | 0,00628 |
| Research | 2.123 | 0,00737 | 0,00848 | 0,00584 |
| Science | 4.382 | 0,00467 | 0,00510 | 0,00490 |
| Tool use | 2.667 | 0,00474 | 0,00517 | 0,00519 |
| **Total** | 32.507 | 0,00462 | 0,00476 | 0,00467 |

Lectura de los datos: el bundle `.base` supera al GGUF en la mayoria de categorias (0,00462 frente a 0,00476 en el total), y ambos estan en linea con unsloth `UD-Q4_K_M` (0,00467). El GGUF es peor en Research (0,00848 frente a 0,00584 de unsloth) y Math (0,00318 frente a 0,00265), y mejor en Long context (0,00438 frente a 0,00536). El `.base` es la opcion mas fiel en Agentic coding, Code, Long context, Tool use y Chat.

## Requisitos de hardware

- VRAM estimada: el fichero Medium pesa 22,13 GB (GGUF) y 23,08 GB (`.base`). Para inferencia completa en GPU se necesitan al menos 24 GB de VRAM, mas el espacio para el contexto KV; con 32.768 tokens de contexto el requisito sube por encima de 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue comodo con contexto largo. En consumer, una RTX 3090 o RTX 4090 (24 GB) puede alojar los pesos, pero el contexto de 32.768 tokens probablemente requiera offload parcial a CPU o reducir la ventana.
- Cabe en consumer GPU: si, en RTX 3090/4090 con 24 GB, con limitaciones de contexto; en GPUs de 16 GB solo con offload a CPU.
- Opciones de despliegue: baseRT (`basert serve`), SuperFluid (`superfluid serve` con runtime basert), llama.cpp (`llama-server`). El bundle `.base` requiere baseRT, con la version indicada como "TODO-VERSION" en la model card, es decir, no concretada.
- Latencia y throughput: no disponibles. La cabeza MTP del bundle `.base` esta pensada para decodificacion especulativa y deberia mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-BaseQuant-V1 | 34,66B (MoE, ~3B activos) | 32.768 configurado | `.base`, GGUF | Apache 2.0 | KL total 0,00462 (`.base`) / 0,00476 (GGUF) |
| unsloth `UD-Q4_K_M` de Qwen3.6-35B-A3B | 34,66B (MoE) | no disponible | GGUF | Apache 2.0 | KL total 0,00467; referencia del autor |
| Qwen/Qwen3.6-35B-A3B (BF16) | 34,66B (MoE) | no disponible | safetensors | Apache 2.0 | Modelo de referencia; sin cuantizar |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo se publica un tamano de cuantizacion ("Medium"); no hay variantes mas pequenas para hardware limitado ni versiones de mayor precision.
- El bundle `.base` requiere una version de baseRT indicada como "TODO-VERSION" en la model card, es decir, no especificada; puede haber problemas de compatibilidad.
- El GGUF presenta mayor divergencia KL que el `.base` en Research (0,00848 frente a 0,00584 de unsloth) y en Math (0,00318 frente a 0,00265), por lo que para tareas de investigacion o matematicas conviene evaluar el `.base` o el modelo BF16.
- El GGUF no incluye la torre de vision ni la cabeza MTP; la decodificacion especulativa solo esta disponible en el bundle `.base`.
- No se documentan los idiomas soportados ni los sesgos del modelo base; el autor no publica evaluaciones de seguridad o alineacion.
- Riesgo de alucinacion inherente al modelo base, no evaluado en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente de las metricas.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.6-35B-A3B, que conviene verificar por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/basecompute/Qwen3.6-35B-A3B-BaseQuant-V1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Instalador de SuperFluid: https://superfluid.sh/install.sh
