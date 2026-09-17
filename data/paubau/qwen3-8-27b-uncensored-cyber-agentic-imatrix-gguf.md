# paubau/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Cyber agentic imatrix GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario paubau sobre el modelo philbert440/Qwen3.8-27B-Uncensored-Cyber. No se trata de un modelo nuevo ni de un ajuste fino: el autor declara explicitamente que todos los pesos y el comportamiento son obra de philbert440 y que este repositorio aporta unicamente la cuantizacion y la metodologia de calibracion, sin fine-tuning, merging ni cambio de comportamiento alguno.

La aportacion tecnica diferencial es la matriz de importancia (imatrix) con la que se calibraron las cuantizaciones: en lugar de los corpus de prosa generica habituales de llama.cpp (`wiki.train.raw`, `groups_merged.txt`), se construyo a partir de trafico real de agentes de codigo (42 sesiones, 648 turnos de dialogo, 528 llamadas a herramientas reales, 1191 apariciones de `<|im_start|>` y 547 de `<tool_call>`), con el objetivo de proteger los canales que se degradan de forma tipica en uso agentico: JSON de tool calling, tokens especiales de plantilla de chat y literales que deben reproducirse literalmente (rutas, hashes, UUIDs).

El modelo base es un derivado de Qwen3 de tipo "abliterated" (de-refusal) especializado en el dominio de ciberseguridad ofensiva, que conserva el torre de vision y la cabeza MTP de decodificacion especulativa, con licencia Apache 2.0 y soporte multimodal (pipeline `image-text-to-text`). Se sirve a 262 000 tokens de contexto segun el README, aunque la calibracion de la imatrix se hizo deliberadamente a 512 tokens. La relevancia practica del repositorio es acotada pero concreta: ofrece artefactos IQ4_XS de ~15 GiB que permiten ejecutar un modelo multimodal grande en GPUs de 24-32 GB sin degradar la fidelidad de copia literal que rompe los flujos agenticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3 (segun el tag `qwen3`); incluye torre de vision y cabeza MTP de decodificacion especulativa. No se documenta si emplea mezcla de expertos |
| Parametros totales | 27B segun la denominacion del nombre y el modelo base; los metadatos safetensors del repositorio indican 3.391.984, cifra incoherente con un checkpoint de 27B y con el tamano del repo (32,6 GB), por lo que no se considera fiable |
| Parametros activos | no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | 262 000 tokens (contexto de servicio segun el README); la calibracion de la imatrix se realizo a 512 tokens |
| Tipos de cuantizacion | IQ4_XS con tensores de salida y embeddings en Q8_0 (publicada); Q5_K_M mencionada solo como comparacion local no publicada |
| Idiomas soportados | no disponible. El corpus de calibracion incluye mezcla chino/ingles, pero no es una especificacion de idiomas del modelo |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (los artefactos de este repositorio); el modelo base upstream en otros formatos |
| Tamano del repositorio | 32,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

### Artefactos publicados

| Fichero | Tamano | SHA-256 | Uso previsto |
|---|---:|---|---|
| `imatrix-agentic-v2.gguf` | 13,01 MiB | `a219ff5f3ffabb4a4b7cc644cae3a44f647032e2016b3308843ac8650e59af69` | Matriz de calibracion publicada |
| `Qwen3.8-27B-Uncensored-Cyber-IQ4_XS-imatrix-fromq8.gguf` | 14,96 GiB | `d11d28b9b253fb7fc9de277a46af5bbd790c000d6bfdfe5648fd7b62ec2560b7` | Pesos de texto IQ4_XS sin los tensores MTP |
| `Qwen3.8-27B-Uncensored-Cyber-IQ4_XS-imatrix-fromq8-plus-mtp.gguf` | 15,38 GiB | `da6a418f30a7e6c6669b74179f6d533ca06016e02eba298d2b713a2900d7a1ba` | Artefacto de produccion de FastLLM; incluye la cabeza MTP compatible |

Los dos ficheros de modelo comparten exactamente los mismos pesos de texto; el sufijo `plus-mtp` anade los tensores MTP del modelo upstream equivalente y solo debe usarse con un runtime que reconozca ese injerto.

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo. El flujo declarado es: partir de la release Q8_0 de Qwen3.8-27B-Uncensored-Cyber, calcular una matriz de importancia con `llama-imatrix` sobre un corpus agentico y cuantizar despues a IQ4_XS con `llama-quantize --allow-requantize --imatrix`, fijando `--output-tensor-type q8_0` y `--token-embedding-type q8_0` (coste aproximado de 1,5 GB adicionales). Se trata, por tanto, de una doble cuantizacion: Q8_0 primero y Q5/IQ4 despues, con el argumento de que Q8_0 es practicamente sin perdida y el error lo domina el segundo paso.

La innovacion esta en el corpus de calibracion, extraido de registros reales de sesiones de un CLI de agente sobre este mismo modelo (1,00 MB, 42 sesiones, 648 turnos, 528 llamadas a herramientas, 584 fragmentos procesados a `-c 512`). El razonamiento del autor es que los conjuntos genericos de prosa apenas contienen JSON de tool calling, tokens de plantilla (`<|im_start|>`, `<tool_call>`) ni literales largos, de modo que una imatrix derivada de prosa trata esos canales como poco importantes y el cuantizador gasta primero su presupuesto de error en ellos; el fallo concreto que se persigue evitar es que un agente escriba `/home/eze/Documents/PotouI` en lugar de `/home/ezra/Documents/Proto-UI` y luego interprete su propia salida corrupta como un contexto inconsistente. El flag `--parse-special` se describe como imprescindible: sin el, llama.cpp tokeniza los marcadores especiales como texto literal y estos nunca entran en las estadisticas; el efecto medido en la misma familia de corpus es de 0,342 a 0,299 tokens por byte (-12,7%). El contexto se fijo en 512 de forma deliberada, frente a la intuicion de igualar los 262 000 tokens de servicio, porque un presupuesto fijo de tokens produce mas muestras y mas diversas y una estimacion mejor condicionada. El corpus de calibracion no se publica por contener rutas y comandos reales; la imatrix resultante si, para que el metodo sea reproducible.

## Capacidades

- Generacion de texto y codigo con soporte de conversacion multi-turno sobre un contexto de servicio de 262 000 tokens.
- Tool calling / function calling mediante la plantilla de chat del modelo, con marcadores `<|im_start|>` y `<tool_call>`; el corpus de calibracion incluye 528 llamadas reales a herramientas como `bash`, `read` y `web_search`.
- Uso agentico multi-paso: el modelo fue calibrado especificamente sobre trafico de agentes que encadenan llamadas a herramientas y reelaboran sus propias salidas.
- Fidelidad de copia literal de cadenas criticas (rutas de repositorio, nombres de paquetes, hashes de commit, UUIDs de dispositivo), que es el objetivo explicito de la metodologia de imatrix.
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`), con la torre de vision preservada desde el modelo upstream.
- Decodificacion especulativa mediante cabeza MTP (multi-token prediction), disponible en el artefacto `plus-mtp` y pensada para reducir latencia en produccion.
- Modo sin rechazos ("abliterated" / de-refusal) heredado del modelo base, con especializacion declarada en ciberseguridad ofensiva.
- Idiomas: no documentados. El corpus de calibracion mezcla prosa en chino con rutas y codigo en ingles, lo que sugiere competencia en ambos, pero no hay especificacion oficial al respecto.

## Casos de uso

- Agentes de codigo autonomos en pipelines de CI/CD: el modelo soporta tool calling con argumentos reales y fue calibrado para no corromper rutas ni identificadores, de modo que puede ejecutar tareas de edicion y verificacion encadenando `bash` y `read` sin que la cuantizacion destruya los literales que luego vuelve a leer.
- Copia fiel de artefactos en flujos de refactorizacion: para tareas donde hay que reproducir exactamente hashes de commit, nombres de paquete o UUIDs, el uso de tensores de salida y embeddings en Q8_0 reduce el error que se traduce directamente en elegir el token equivocado.
- Analisis de logs y triaje de incidentes: con 262 000 tokens de contexto se pueden volcar registros extensos o varios ficheros de configuracion en una sola pasada y razonar sobre ellos sin trocear.
- Operaciones de seguridad ofensiva en entornos autorizados (pentesting, red teaming, laboratorios de CTF): es el dominio declarado del modelo base y el motivo del de-refusal; su uso en produccion exige control de acceso y marco legal explicito.
- Despliegue local en infraestructura propia con datos sensibles: los ~15 GiB del IQ4_XS permiten ejecucion on-premise en GPUs de 24-32 GB, incluida la V100 mencionada en los tags, sin enviar codigo propietario a APIs externas.
- Revision de capturas y diagramas de arquitectura: la ruta multimodal preservada permite adjuntar imagenes (capturas de error, diagramas) junto al contexto de codigo en la misma conversacion.
- Servicio de agente de baja latencia: el artefacto con cabeza MTP habilita decodificacion especulativa en runtimes compatibles, util cuando el coste por token generado es el cuello de botella.
- Asistentes tecnicos internos de contexto largo: documentacion de repositorios y preguntas multi-turno sobre bases de codigo que no caben en ventanas de 8K-32K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona que existe una comparacion local contra una cuantizacion Q5_K_M que no esta publicada en el repositorio, y la model card disponible esta truncada justo en el apartado donde se describen las mediciones ("the measured numbers below use a held-out agentic corpus drawn from..."), por lo que no se pueden citar cifras de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

El unico dato numerico verificable es de tokenizacion, no de capacidad del modelo: el uso de `--parse-special` sobre la misma familia de corpus reduce la tasa de 0,342 a 0,299 tokens por byte (-12,7%), lo que es coherente con la colapsacion de los marcadores de plantilla en tokens unicos y no constituye una medida de calidad de generacion.

## Requisitos de hardware

- VRAM para los pesos: ~15 GiB para el IQ4_XS sin MTP (14,96 GiB) y ~15,4 GiB para el artefacto `plus-mtp` (15,38 GiB), en ambos casos mas la memoria del contexto y de las activaciones.
- KV cache: no documentado. A 262 000 tokens de contexto la cache supera con holgura la VRAM de cualquier GPU de 24 GB, por lo que el contexto maximo practico depende del runtime y del offload parcial de capas a CPU.
- GPU recomendadas por el autor o por el contexto del repositorio: V100 (32 GB, aparece como tag del repositorio). Encajan tambien A100 40/80 GB, H100 y, para contextos moderados, tarjetas de 24 GB.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB) cargando los pesos completos y limitando el contexto; en tarjetas de 16 GB o menos no cabe completo y requiere offload de capas a CPU (`-ngl`).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio u otros cargadores GGUF convencionales. El artefacto `plus-mtp` solo debe usarse con un runtime que reconozca el injerto MTP; el README cita FastLLM como runtime de produccion para ese fichero. No hay confirmacion de soporte en vLLM ni en TGI para estos artefactos.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia, y la comparacion Q5_K_M mencionada no incluye cifras en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| paubau/Qwen3.8-27B-Uncensored-Cyber agentic imatrix GGUF (este) | 27B (segun denominacion) | 262 000 | GGUF / IQ4_XS (salida y embeddings Q8_0) | apache-2.0 | Calibrado con imatrix de trafico agentico real |
| philbert440/Qwen3.8-27B-Uncensored-Cyber (upstream) | 27B (segun denominacion) | no disponible | no disponible en la informacion proporcionada | apache-2.0 | Modelo base; incluye torre de vision y cabeza MTP; documenta la receta y la evaluacion |
| Cuantizacion IQ4_XS con imatrix de prosa generica | no aplica | no aplica | GGUF / IQ4_XS | depende del modelo origen | Categoria de comparacion descrita en el README; degrada antes los canales de tool calling y literales |

No se dispone de datos de otros modelos comparables de la misma categoria (derivados abliterated de Qwen3 con soporte multimodal y contexto largo) en la informacion proporcionada, ni de resultados de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de-refusal ("abliterated"): se ha eliminado el comportamiento de rechazo del modelo base. Esto aumenta el riesgo de generar contenido danino y traslada al operador toda la responsabilidad de filtrado, registro y control de acceso.
- Especializacion en ciberseguridad ofensiva: el dominio declarado es el de seguridad ofensiva/ciber, lo que lo hace inadecuado para exposicion publica sin moderacion y exige verificacion de que su uso cumple la legislacion aplicable.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad ni de tasas de alucinacion. La propia metodologia del imatrix esta motivada por un fallo de fidelidad (corrupcion de rutas) que la cuantizacion no elimina, solo mitiga.
- Doble cuantizacion: los pesos se cuantizaron desde la release Q8_0 y no desde BF16 (`--allow-requantize`). El autor reconoce que el error lo domina el paso Q5/IQ4, pero sigue siendo una segunda perdida acumulada.
- Alcance de la comparacion limitado: el unico contraste medido es contra una cuantizacion Q5_K_M, medido localmente y no publicado; la model card proporcionada esta truncada en ese punto.
- Reproducibilidad parcial: el corpus de calibracion no se publica (contiene rutas y comandos reales). Solo se publica la imatrix resultante, por lo que la reproducibilidad exacta exige reconstruir el corpus desde trafico propio.
- Restricciones de runtime: el artefacto con MTP puede fallar o producir resultados incorrectos en cargadores GGUF que no reconozcan el injerto de tensores; en caso de duda hay que usar el fichero sin MTP.
- Idiomas y sesgos: no hay informacion publicada sobre cobertura linguistica, sesgos de genero, raza o ideologia, ni evaluaciones de seguridad. El corpus de calibracion tiene mayor presencia de chino e ingles que de otras lenguas, lo que puede sesgar el comportamiento en castellano.
- Madurez e historial: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.
- Licencia: apache-2.0 permite uso comercial, pero se hereda del modelo base y no exime de las obligaciones legales derivadas del contenido generado por un modelo sin rechazos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/paubau/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Model card del modelo base, con la receta y la evaluacion (referenciada desde el README): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Herramientas citadas (`llama-imatrix`, `llama-quantize`): https://github.com/ggml-org/llama.cpp
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas institucionales sin relacion con el contenido de esta ficha.
