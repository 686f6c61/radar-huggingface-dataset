# neroued/Qwen3.8-27B-NInfer

## Resumen

`neroued/Qwen3.8-27B-NInfer` es un artefacto de inferencia que contiene el modelo multimodal Qwen3.8-27B convertido al formato nativo `.ninfer`, desarrollado por el autor neroued para su runtime NInfer. Este formato no es un checkpoint de Transformers ni un archivo GGUF, sino un contenedor optimizado que integra pesos cuantizados, procesador de visión, cabezal de predicción múltiple (MTP) y plantillas de chat, diseñado específicamente para ejecutarse en una única GPU NVIDIA RTX 5090 con CUDA 13.1 o superior.

La relevancia de este modelo radica en que permite ejecutar un modelo de 27 mil millones de parámetros con capacidades multimodales (texto, imagen y video) en hardware de consumo de gama alta, gracias a una cuantización groupwise Q4/Q5/Q6 en el cuerpo del transformer y una decodificación especulativa MTP que acelera la generación. El artefacto está pensado para desarrolladores que necesitan un despliegue local eficiente, con soporte para modos de razonamiento (thinking) y servicio compatible con OpenAI y Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.8-27B (arquitectura exacta no especificada en la informacion disponible) |
| Parametros totales | 27B (nominal, segun denominacion del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `--max-context 16384`, pero no se indica el maximo del modelo) |
| Tipos de cuantizacion | Q4/Q5/Q6 groupwise (cuerpo del transformer), W8G32_F16S (token embedding y cabeza de salida) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato nativo de NInfer, no compatible con Transformers ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Qwen3.8-27B en la documentacion proporcionada. Este artefacto es una conversion del modelo original, realizada mediante la receta `qwen3_8_27b-v1` del repositorio NInfer. La conversion aplica una cuantizacion groupwise Q4/Q5/Q6 en los tensores del cuerpo del transformer, mientras que el token embedding y la cabeza de salida completa se mantienen en precision W8G32_F16S (8 bits con grupo de 32 y escala FP16). El archivo incluye ademas los objetos registrados para Vision, MTP (Multi-Token Prediction), proposal-head, tokenizer, chat-template, generacion y procesador de medios, lo que permite la ejecucion multimodal y la decodificacion especulativa.

El runtime NInfer, en su revision `5232055` o posterior, es el unico capaz de interpretar este artefacto. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens procesados ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto en modos thinking (razonamiento) y no-thinking.
- Procesamiento multimodal: imagenes, multiples imagenes, video y mensajes mixtos (texto + imagen + video).
- Decodificacion especulativa MTP con ventanas de draft de 1 a 5 tokens, que acelera la generacion autoregresiva.
- KV cache en BF16 o INT8 con grupo de 64, configurable segun memoria disponible.
- Decodificacion con CUDA Graph y reutilizacion de prefijo compatible para reducir latencia en consultas repetidas.
- Servicio concurrente a pequeña escala (1-8 solicitudes activas por Engine) con decodificacion por lotes real.
- Interfaz de linea de comandos (CLI) de NInfer.
- Servicio compatible con las APIs de OpenAI y Anthropic para integracion en aplicaciones existentes.

## Casos de uso

- Asistente multimodal local: el modelo puede procesar consultas que incluyen imagenes o videos, por ejemplo, describir el contenido de una fotografia o responder preguntas sobre un clip de video, todo en una maquina con RTX 5090 sin necesidad de conexion a internet.
- Razonamiento avanzado en entornos sin nube: gracias al modo thinking, se puede utilizar para tareas de logica, matematicas o planificacion en aplicaciones de escritorio o herramientas de productividad que requieran privacidad de datos.
- Generacion de codigo asistida por contexto visual: un desarrollador puede capturar una captura de pantalla de un error y pedir al modelo que explique el problema y sugiera una correccion, aprovechando la entrada multimodal.
- Servicio de chat interno con API compatible OpenAI: empresas pueden desplegar un endpoint local para sus equipos, usando el modo de servicio HTTP de NInfer, con control total sobre los datos y sin costes por token.
- Prototipado rapido de agentes conversacionales: la capacidad de manejar historiales de chat estructurados y la decodificacion especulativa permiten iterar rapidamente en el diseno de asistentes virtuales antes de migrar a infraestructura mayor.
- Analisis de documentos mixtos: el modelo puede recibir un PDF escaneado (convertido a imagen) junto con texto, y extraer informacion relevante, combinando comprension visual y textual en un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otras metricas estandar para este artefacto o para el modelo base Qwen3.8-27B en la documentacion consultada.

## Requisitos de hardware

- GPU: NVIDIA GeForce RTX 5090 (arquitectura `sm_120a`) obligatoria. No se soportan otras GPUs.
- VRAM: no se especifica un valor exacto, pero el archivo pesa 16.96 GiB; la RTX 5090 dispone de 32 GB de VRAM, por lo que el modelo cabe con margen para KV cache y overhead del runtime.
- Sistema operativo: Linux de 64 bits.
- CUDA Toolkit 13.1 o superior.
- Compilacion desde fuente: NInfer no ofrece binarios precompilados; es necesario compilar el runtime desde el repositorio (revision `5232055` o posterior).
- Opciones de despliegue: exclusivamente mediante NInfer (CLI o servidor HTTP compatible con OpenAI/Anthropic). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan datos cuantitativos. La decodificacion especulativa MTP y CUDA Graph reducen la latencia respecto a una generacion convencional, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El artefacto es una conversion especifica de Qwen3.8-27B, y no se ofrecen datos de rendimiento relativo frente a otras alternativas.

## Limitaciones y advertencias

- El artefacto solo es valido para NInfer en la revision `5232055` o posterior; no puede cargarse con Transformers, Safetensors ni GGUF.
- Ejecucion limitada a una unica RTX 5090 y un solo dispositivo CUDA. No hay soporte para multi-GPU, descarga CPU/GPU ni distribucion.
- Capacidad de concurrencia fija de 1 a 8 solicitudes activas por Engine, sin batching continuo a gran escala ni planificacion con prioridades o QoS.
- NInfer no ejecuta llamadas a herramientas (tool calls) generadas por el modelo; solo las genera como texto.
- La asignacion de contexto depende de la memoria GPU disponible y del tipo de KV cache seleccionado; no se garantiza una longitud de contexto maxima fija.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas especificas de este artefacto. Al ser una conversion del modelo base, hereda las caracteristicas de Qwen3.8-27B, pero no se han documentado aqui.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de cumplir con los terminos de la licencia del modelo base y las leyes aplicables.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/neroued/Qwen3.8-27B-NInfer)
- [Repositorio NInfer](https://github.com/Neroued/ninfer)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Documentacion de NInfer](https://github.com/Neroued/ninfer/tree/master/docs)
- [Referencia del artefacto Qwen3.8-27B](https://github.com/Neroued/ninfer/blob/master/docs/maintainer/qwen3.8-27b-artifact.md)
- [Manifiesto del artefacto](https://huggingface.co/neroued/Qwen3.8-27B-NInfer/blob/main/artifact-manifest.json)
