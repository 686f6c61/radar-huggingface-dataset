# Nekodeus/qwen2-5-coder-3b-instruct-openvino

## Resumen

`Nekodeus/qwen2-5-coder-3b-instruct-openvino` es una conversion a formato OpenVINO IR del modelo Qwen2.5-Coder-3B-Instruct, desarrollado originalmente por Alibaba Qwen. Se trata de un modelo de lenguaje especializado en generacion de codigo, con 3.000 millones de parametros, ventana de contexto de 32.768 tokens y licencia Apache 2.0. Esta version concreta, publicada por el usuario Nekodeus, aplica cuantizacion INT8 solo a los pesos (weight-only) mediante NNCF y `optimum-intel`, con el objetivo de ejecutar inferencia eficiente en CPU sin GPU dedicada.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de codigo de tamano medio en hardware modesto, incluyendo portatiles y servidores sin acelerador. El proceso de conversion se realizo integramente en un entorno Kaggle con CPU, lo que demuestra que el flujo de trabajo es reproducible sin acceso a GPUs de gama alta. El repositorio ocupa 3,1 GB e incluye tres componentes IR: modelo, tokenizador y detokenizador.

Al estar basado en Qwen2.5-Coder-3B-Instruct, hereda las capacidades del modelo original: generacion de codigo en 92 lenguajes de programacion, soporte de Fill-In-the-Middle (FIM) y modo conversacional instruct. No obstante, esta ficha debe distinguir claramente entre las capacidades del modelo base y las caracteristicas especificas de esta conversion OpenVINO, que no anade entrenamiento nuevo ni modifica los pesos mas alla de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), conversion a OpenVINO IR |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | INT8 weight-only (NNCF); activaciones FP16/FP32 segun trazado |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base soporta multiples lenguajes naturales y 92 lenguajes de programacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con 3.000 millones de parametros, disenado por Alibaba Qwen para tareas de generacion de codigo. El modelo base Qwen2.5-Coder-3B-Instruct fue entrenado por el equipo de Qwen con un corpus especializado en codigo que cubre 92 lenguajes de programacion, e incluye capacidades de Fill-In-the-Middle (FIM) para completado de codigo en editores. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

Esta version concreta no introduce entrenamiento adicional: es una conversion de formato y cuantizacion. El proceso se realizo con `optimum-cli export openvino`, usando `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`, aplicando cuantizacion INT8 solo a los pesos mediante NNCF. Las activaciones se mantienen en FP16/FP32 segun el trazado, lo que reduce el uso de memoria y acelera la inferencia en CPU a costa de una posible perdida menor de precision. El repositorio resultante contiene tres artefactos IR separados (modelo, tokenizador y detokenizador) y ocupa 3,1 GB.

## Capacidades

- Generacion de codigo en 92 lenguajes de programacion, heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Completado de codigo con soporte de Fill-In-the-Middle (FIM), util para integrarse en editores e IDE.
- Modo conversacional instruct, adecuado para dialogo multi-turno sobre tareas de programacion.
- Razonamiento sobre codigo: explicacion, refactorizacion y depuracion de fragmentos.
- Generacion de texto general en modo instruct (no exclusivamente codigo).
- Capacidad de contexto largo de hasta 32.768 tokens, util para archivos y repositorios extensos.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio.
- Capacidades multilingues en lenguajes naturales: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de completado de codigo en IDE: gracias al soporte FIM y a los 32.768 tokens de contexto, el modelo puede insertar sugerencias coherentes en mitad de un archivo sin necesidad de reescribir todo el documento.
- Revision de codigo en preproduccion: se puede desplegar en CPU para analizar diffs y proponer correcciones o mejoras antes de la fusion, reduciendo la dependencia de GPUs en el pipeline de CI.
- Generacion de tests unitarios: el modelo puede recibir una funcion y producir casos de prueba en el mismo lenguaje, aprovechando su entrenamiento especializado en codigo.
- Documentacion tecnica automatizada: a partir de un fragmento de codigo, el modelo puede generar docstrings y explicaciones en lenguaje natural, integrable en tareas de documentacion continua.
- Despliegue en entornos sin GPU: al estar en formato OpenVINO INT8, es adecuado para portatiles, estaciones de trabajo sin acelerador y servidores de bajo coste donde no se dispone de CUDA.
- Prototipado rapido de herramientas de codigo: investigadores y desarrolladores pueden validar ideas de asistentes de programacion en local antes de escalar a modelos mayores.
- Traduccion entre lenguajes de programacion: el modelo puede convertir fragmentos de un lenguaje a otro, aprovechando la cobertura de 92 lenguajes del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Tampoco se documentan latencias ni throughput medidos para esta conversion OpenVINO.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecucion en CPU; el modelo esta pensado para OpenVINO en CPU. El repositorio ocupa 3,1 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no se especifican en la informacion disponible; el flujo de conversion se realizo en CPU-only (Kaggle) y el uso documentado es en CPU mediante OpenVINO GenAI.
- Cabe en GPU consumer: no confirmado en la informacion proporcionada. El modelo base de 3B en FP16 requeriria aproximadamente 6 GB, pero esta version INT8 esta orientada a CPU.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`) y OpenVINO GenAI (`ov::genai::LLMPipeline` con dispositivo "CPU").
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nekodeus/qwen2-5-coder-3b-instruct-openvino | 3B | 32.768 | OpenVINO IR INT8 | Apache 2.0 | Hugging Face (100 descargas) |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | 32.768 | safetensors | Apache 2.0 | Hugging Face (modelo base) |
| Otros modelos de codigo de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa es con el modelo base Qwen2.5-Coder-3B-Instruct, del que esta version deriva. La diferencia principal es el formato (OpenVINO IR INT8 frente a safetensors) y el publico objetivo (CPU frente a GPU). No se dispone de datos de rendimiento comparativo entre ambas versiones en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una cuantizacion INT8 weight-only, puede existir una perdida de precision respecto al modelo base en FP16/BF16, especialmente en tareas de razonamiento complejo o generacion de codigo muy sensible.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede generar APIs, funciones o sintaxis inexistentes; se recomienda validacion automatica del codigo generado.
- Sesgos conocidos: no documentados en la informacion proporcionada; el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento.
- Limitaciones de idioma: no se especifican los idiomas naturales soportados en esta conversion; el modelo base esta orientado a codigo y a un conjunto no detallado de lenguajes naturales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente al modelo base y a la conversion.
- El autor de la conversion es un usuario individual (Nekodeus), no el equipo oficial de Qwen; no hay garantias de mantenimiento ni soporte.
- El numero de descargas (100) y likes (0) es bajo, lo que sugiere poca validacion comunitaria de esta conversion concreta.
- Para produccion, conviene validar la calidad de la cuantizacion INT8 en el dominio especifico antes de desplegar.

## Enlaces

- Hugging Face (esta conversion): https://huggingface.co/Nekodeus/qwen2-5-coder-3b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- OpenVINO: https://docs.openvino.ai
- optimum-intel: https://github.com/huggingface/optimum-intel
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
