# OpenVINO/Kokoro-82M-fp16-ov

## Resumen

Kokoro-82M-fp16-ov es la conversion al formato OpenVINO IR (Intermediate Representation) del modelo de sintesis de voz Kokoro-82M, desarrollado originalmente por hexgrad. La conversion la mantiene el equipo OpenVINO de Intel y su objetivo es permitir la inferencia optimizada del modelo TTS sobre hardware Intel (CPU, GPU integrada y NPU) mediante el toolkit OpenVINO, en lugar de depender de PyTorch.

El modelo subyacente es un sistema de text-to-speech de arquitectura no especificada en la informacion disponible, con 82 millones de parametros y entrenado exclusivamente para ingles. Su reducido tamano lo hace especialmente atractivo para despliegues en dispositivos de borde, AI PCs y entornos sin GPU dedicada, donde un modelo TTS grande seria inviable. Kokoro se ha popularizado en la comunidad por ofrecer una calidad de sintesis competitiva con un coste computacional muy bajo.

Esta version concreta pesa 0,2 GB, se distribuye en precision fp16 y se integra con Optimum Intel y con OpenVINO Model Server (OVMS), exponiendo una API compatible con el cliente OpenAI para generacion de audio. Es relevante para desarrolladores que necesiten anadir voz a aplicaciones locales, asistentes o pipelines de accesibilidad en hardware Intel sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS, arquitectura del modelo base no especificada en la informacion disponible) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (esta version); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Kokoro-82M (no se especifica si es un transformer, un modelo difusor, un modelo basado en flujo o una combinacion). Lo que si se conoce es que se trata de un modelo de sintesis de voz con 82 millones de parametros, un tamano muy contenido en comparacion con los sistemas TTS neuronales habituales, que suelen situarse en cientos de millones o miles de millones de parametros.

Esta version es una conversion del checkpoint original de PyTorch al formato OpenVINO IR en precision fp16. La conversion no implica reentrenamiento ni cambios en los pesos, sino una transformacion del grafo computacional para que el runtime de OpenVINO pueda ejecutarlo de forma optimizada sobre CPU, GPU y NPU de Intel. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado en el modelo original.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles, con salida de audio a 24 kHz.
- Soporte de multiples voces predefinidas (el ejemplo de la model card emplea la voz `af_alloy`).
- Inferencia optimizada mediante OpenVINO en CPU, GPU integrada y NPU de Intel.
- Integracion con Optimum Intel a traves de `OVModelForTextToSpeechSeq2Seq`.
- Despliegue como servicio compatible con la API de audio de OpenAI mediante OpenVINO Model Server (OVMS), incluyendo streaming de respuesta.
- Generacion de audio reproducible y guardable en formato WAV mediante la libreria `soundfile`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en AI PCs: el modelo puede ejecutarse sobre la NPU o GPU integrada de un procesador Intel reciente mediante OpenVINO, permitiendo sintesis de voz en tiempo real sin conexion a internet y sin GPU dedicada, gracias a sus 82 millones de parametros y su formato fp16 de 0,2 GB.
- Lectura de contenido y accesibilidad: integrado en lectores de pantalla o aplicaciones de accesibilidad, puede convertir articulos, notificaciones o documentos en audio de forma local, reduciendo la dependencia de servicios TTS en la nube y protegiendo la privacidad del texto procesado.
- Generacion de narracion para videos y podcasts: el modelo permite sintetizar guiones en ingles y guardar la salida como WAV a 24 kHz, adecuado para flujos de postproduccion automatizados donde se necesita una voz consistente y de bajo coste.
- Servicio TTS interno con API compatible OpenAI: desplegado con OVMS en un contenedor o binario nativo, expone un endpoint `/v1/audio/speech` que permite sustituir llamadas a APIs comerciales por inferencia local, facilitando la migracion de aplicaciones existentes sin cambiar el codigo cliente.
- Interfaces conversacionales en dispositivos de borde: en kioscos, electrodomesticos o dispositivos IoT con hardware Intel, el modelo puede generar respuestas habladas en ingles con baja latencia y sin depender de la nube.
- Prototipado rapido de aplicaciones de voz: con el ejemplo de Optimum Intel y los notebooks de OpenVINO, un desarrollador puede integrar TTS en pocas lineas de Python para validar productos de audio antes de invertir en infraestructura mayor.
- Preprocesado de datos para otros sistemas: generacion de corpus de audio sintetico en ingles para aumentar datasets de entrenamiento de modelos de reconocimiento de voz o para pruebas automatizadas de pipelines de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 0,2 GB en fp16; en la practica puede ejecutarse en memoria compartida del sistema, por lo que el requisito de memoria es muy bajo (del orden de cientos de MB incluyendo el runtime).
- GPU recomendadas: GPUs integradas Intel (iGPU) y GPUs discretas Intel Arc; tambien puede ejecutarse en CPU Intel y NPU de procesadores compatibles. No se especifican modelos concretos de NVIDIA en la documentacion disponible.
- Cabe en GPU de consumo: si, cualquier GPU de consumo moderna dispone de memoria mas que suficiente; el modelo esta pensado incluso para ejecutarse sin GPU dedicada.
- Opciones de despliegue: OpenVINO Runtime mediante Optimum Intel (`OVModelForTextToSpeechSeq2Seq`), OpenVINO Model Server (OVMS) en Windows o Docker con API compatible OpenAI, y notebooks de OpenVINO. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M-fp16-ov (este modelo) | 82 M | en | OpenVINO IR (fp16) | Apache 2.0 | Hugging Face, via OpenVINO |
| hexgrad/Kokoro-82M (original) | 82 M | en | Pesos originales en PyTorch | Apache 2.0 | Hugging Face |
| Otros modelos TTS optimizados para OpenVINO | no disponible | no disponible | OpenVINO IR | no disponible | Coleccion OpenVINO en Hugging Face |

La comparacion con alternativas de la misma categoria no puede completarse con datos concretos porque la informacion proporcionada no incluye especificaciones de otros modelos TTS (por ejemplo, tamanos, contextos o resultados de benchmarks). La diferencia principal frente al modelo original es el formato y el runtime: esta version esta optimizada para OpenVINO y hardware Intel, mientras que el original esta orientado a PyTorch.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado ni documentado su comportamiento en castellano u otros idiomas.
- Es exclusivamente un modelo de sintesis de voz: no procesa audio de entrada ni realiza tareas de texto, razonamiento o codigo.
- La calidad de la sintesis, los sesgos de voz y los posibles artefactos de audio deben consultarse en la model card del modelo original (hexgrad/Kokoro-82M); esta conversion no los modifica, pero tampoco los documenta.
- La model card de esta conversion no detalla limitaciones propias; remite explicitamente a la del modelo base.
- La compatibilidad requiere Optimum Intel compilado desde la rama `main` y OpenVINO >= 2026.4.0, lo que puede implicar inestabilidad en entornos de produccion si no se fija una version concreta.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base y de las voces utilizadas, ya que los derechos sobre las muestras de voz no se detallan en la informacion disponible.
- El despliegue con OVMS en Docker se documenta con la imagen `openvino/model_server:weekly`, que es una etiqueta movil y no una version fija; para produccion deberia fijarse una version concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/Kokoro-82M-fp16-ov
- Modelo original: https://huggingface.co/hexgrad/Kokoro-82M
- Licencia del modelo original: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/LICENSE
- Documentacion de OpenVINO: https://docs.openvino.ai/
- Repositorio de OpenVINO en GitHub: https://github.com/openvinotoolkit/openvino
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- OpenVINO Notebooks (busqueda Kokoro-82M): https://openvinotoolkit.github.io/openvino_notebooks/?search=Kokoro-82M
- Documentacion de Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- Inferencia con Optimum Intel: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-optimum-intel.html
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Despliegue de OVMS en Windows: https://docs.openvino.ai/ovms_baremetal
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- OpenVINO en Wikipedia: https://en.wikipedia.org/wiki/OpenVINO
- Organizacion OpenVINO en Hugging Face: https://huggingface.co/OpenVINO
