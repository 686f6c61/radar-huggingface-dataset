# Nekodeus/qwen3-4b-openvino

## Resumen

Nekodeus/qwen3-4b-openvino es una conversion a formato OpenVINO IR del modelo base Qwen/Qwen3-4B, publicada por el usuario Nekodeus. Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: el trabajo consiste en exportar los pesos originales a la representacion intermedia de OpenVINO y aplicar cuantizacion de solo pesos (weight-only) a INT8 mediante NNCF. El resultado son ficheros `openvino_model.xml/.bin` mas tokenizer y detokenizer tambien en formato IR, listos para ejecutarse con `optimum-intel` o con el pipeline `ov::genai::LLMPipeline` de OpenVINO GenAI.

El modelo hereda las caracteristicas del Qwen3-4B original: arquitectura `Qwen3ForCausalLM`, 4.000 millones de parametros y licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. La conversion se realizo integramente en CPU con `optimum-cli`, en un entorno Kaggle sin GPU y sin acceso a red, segun declara el autor en la model card.

Su relevancia es practica: proporciona una via de despliegue en CPU con instrucciones INT8 para un LLM de 4B, un escenario habitual cuando no hay GPU disponible o cuando se busca reducir el coste de inferencia en servidores convencionales. El repositorio ocupa 4,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, segun la clase declarada del modelo base) |
| Parametros totales | 4.000 millones (4.0B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 weight-only (NNCF); activaciones FP16/FP32 segun el trazado |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), con tokenizer y detokenizer en IR |

## Arquitectura y entrenamiento

No se ha realizado ningun entrenamiento ni ajuste en esta publicacion. El autor parte de `Qwen/Qwen3-4B` y ejecuta el comando `optimum-cli export openvino --model Qwen/Qwen3-4B --task text-generation --weight-format int8`, con `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`. El modelo comparte por tanto la arquitectura del Qwen3-4B original: un transformer decoder-only con 4.000 millones de parametros y licencia Apache-2.0. No se dispone de informacion sobre el dataset de preentrenamiento, el numero de tokens, la composicion de los datos ni las fases de alineacion (RLHF, DPO u otras) del modelo base en la informacion proporcionada.

La innovacion tecnica de este artefacto es la cuantizacion de pesos a INT8 con NNCF y el empaquetado en IR de OpenVINO, que incluye no solo el grafo del modelo sino tambien el tokenizer (`openvino_tokenizer.xml/.bin`) y el detokenizer (`openvino_detokenizer.xml/.bin`) como subgrafos ejecutables. Esto permite ejecutar el pipeline completo de generacion sin dependencias de Python en tiempo de inferencia, lo que es util para despliegues en C++ y en entornos con recursos limitados. Los ficheros auxiliares (`tokenizer.json`, `vocab.json`, `merges.txt`) y las configuraciones se incluyen tambien en el repositorio.

## Capacidades

- Generacion de texto autoregresiva para tareas de `text-generation`, tal como declara el campo `pipeline` del repositorio.
- Conversacion: el repositorio incluye la etiqueta `conversational`, por lo que esta orientado a dialogos multi-turno.
- Inferencia en CPU: es la capacidad diferencial del artefacto, al estar exportado a OpenVINO IR con pesos INT8.
- Despliegue en C++ sin Python: el ejemplo de la model card usa `ov::genai::LLMPipeline` directamente.
- Integracion con el ecosistema HuggingFace vía `optimum-intel` (`OVModelForCausalLM`).
- Razonamiento, generacion de codigo, matematicas, tool calling, capacidades de agente, modo thinking y soporte multilingue: no disponibles en la informacion proporcionada. Dependen del modelo base Qwen3-4B, pero no se documentan en esta model card.

## Casos de uso

- Inferencia de LLM en servidores sin GPU: el modelo se ejecuta en CPU mediante OpenVINO, de modo que se puede desplegar en maquinas virtuales o nodos de computo sin acelerador dedicado, reduciendo el coste de infraestructura.
- Despliegue en el borde o en equipos de escritorio: con pesos INT8 y un repositorio de 4,0 GB, es viable en portatiles y mini-PC con 8-16 GB de RAM, siempre que la CPU soporte las instrucciones vectoriales que OpenVINO aprovecha.
- Servicios de generacion de texto en C++: el ejemplo `ov::genai::LLMPipeline` permite incrustar el modelo en aplicaciones nativas sin arrastrar el stack de Python.
- Prototipado rapido con `optimum-intel`: al cargarse con `OVModelForCausalLM.from_pretrained`, encaja en scripts Python existentes del ecosistema Transformers para validar prompts y flujos antes de invertir en GPU.
- Asistentes conversacionales internos: la etiqueta `conversational` y la tarea de generacion de texto lo hacen adecuado para chatbots de uso interno donde la latencia no sea critica y el volumen sea moderado.
- Procesamiento por lotes offline: tareas de resumen, clasificacion o reescritura de documentos ejecutadas en cola sobre CPU, donde el throughput agregado importa mas que la latencia por peticion.
- Evaluacion y comparacion de cuantizaciones: sirve como referencia INT8 frente al modelo base en BF16/FP16 para medir la perdida de calidad asociada a la cuantizacion en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y tampoco reporta latencia o throughput. Los resultados de la busqueda web realizada no contienen informacion tecnica sobre el modelo.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 4,0 GB, correspondientes en su mayoria a los pesos INT8 de 4.000 millones de parametros. Para inferencia hay que anadir el espacio de trabajo de activaciones y la cache KV, por lo que conviene disponer de al menos 6-8 GB de memoria libre en funcion de la longitud de contexto.
- Ejecucion en CPU: es el modo previsto por el autor; la model card menciona explicitamente el dispositivo `"CPU"` en el ejemplo de OpenVINO GenAI.
- GPU: no disponible. La model card no documenta aceleracion por GPU ni requisitos de VRAM en tarjetas concretas (A100, H100, RTX 4090, etc.).
- GPU de consumo: no hay datos publicados. Al ser un artefacto orientado a CPU, la pregunta relevante es si cabe en RAM del sistema, no en VRAM.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`) y OpenVINO GenAI (`ov::genai::LLMPipeline`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles. La model card no proporciona cifras de tokens por segundo ni de tiempo por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nekodeus/qwen3-4b-openvino | 4,0B | OpenVINO IR | INT8 weight-only | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B (modelo base) | 4,0B | safetensors | sin cuantizar (BF16/FP16) | no disponible | Apache-2.0 | HuggingFace, repositorio oficial |
| Versiones GGUF de Qwen3-4B para llama.cpp | 4,0B | GGUF | Q4, Q5, Q8, etc. | no disponible | Apache-2.0 | HuggingFace, repositorios de terceros |

La comparacion se limita a formato y licencia, ya que no hay datos de rendimiento publicados para esta conversion. La diferencia funcional frente al modelo base es el formato de pesos y la cuantizacion; frente a las versiones GGUF, el backend de ejecucion (OpenVINO en lugar de llama.cpp). No se dispone de otras alternativas documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversion de formato. Cualquier limitacion del Qwen3-4B original se mantiene, incluidas las posibles alucinaciones inherentes a un modelo de 4.000 millones de parametros.
- La cuantizacion INT8 de solo pesos puede degradar la calidad respecto al modelo base en BF16/FP16. No se han publicado mediciones de esta perdida en la informacion disponible.
- La longitud de contexto no esta documentada en la model card, por lo que no se puede garantizar el comportamiento en ventanas largas sin consultar la ficha del modelo base.
- Los idiomas soportados no estan declarados. No hay garantia documentada de calidad en castellano.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (6 de octubre de 2026, segun los metadatos). No hay evidencia de uso en produccion ni de validacion por terceros.
- No se documentan capacidades de tool calling, agentes, vision ni modo thinking para esta conversion, aunque el modelo base pudiera tenerlas.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar tambien las condiciones del modelo base y de las dependencias (`optimum-intel`, OpenVINO, NNCF).
- El artefacto fue generado en un entorno Kaggle sin GPU y sin red; no se describe ningun proceso de validacion de la calidad de la conversion mas alla de la ejecucion del comando de exportacion.
- La compatibilidad esta ligada a versiones concretas del stack (`optimum-intel 2.2.0`, `openvino 2026.4.1`, `transformers 5.16.1`); versiones distintas pueden requerir reexportacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Nekodeus/qwen3-4b-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Los resultados de la busqueda web realizada no contienen enlaces relevantes al modelo (unicamente referencias musicales sin relacion).
