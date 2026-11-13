# amd/whisper-small_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/whisper-small_rai_1.9.0_m_1.0.1_npu` es una version optimizada y cuantizada de `openai/whisper-small`, publicada por AMD para su ejecucion sobre las unidades de procesamiento neuronal (NPU) integradas en los procesadores AMD Ryzen AI. El modelo se distribuye en formato ONNX, lo que permite aprovechar el runtime de Ryzen AI para acelerar la inferencia de reconocimiento automatico del habla (ASR) en hardware de PC y portatiles con dicha NPU. La nomenclatura del identificador codifica la version del runtime de Ryzen AI (`rai_1.9.0`), la version del modelo (`m_1.0.1`) y el destino de ejecucion (`npu`).

Se trata, por tanto, de una variante de despliegue y no de un modelo entrenado desde cero: hereda la arquitectura y los pesos de Whisper Small de OpenAI, un transformer encoder-decoder con aproximadamente 244 millones de parametros, y los adapta al formato y a las restricciones de la NPU de AMD. El repositorio ocupa 0,4 GB, coherente con un modelo de ese tamano en pesos cuantizados y en formato ONNX.

Su relevancia radica en que permite ejecutar ASR de forma local y con bajo consumo energetico sobre hardware de consumo AMD, sin depender de GPU dedicada ni de servicios en la nube. El acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face, y la licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small), exportado a ONNX y optimizado para NPU Ryzen AI |
| Parametros totales | Aproximadamente 244 millones (heredados de openai/whisper-small) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el tag indica `base_model:quantized`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Small de OpenAI: un transformer encoder-decoder entrenado para transcripcion de audio a texto, que procesa espectrogramas Mel de 80 canales en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El modelo original fue entrenado por OpenAI sobre una gran coleccion de audio multilingue y tareas de traduccion y transcripcion, con datos debilmente supervisados a gran escala. AMD no ha publicado en esta ficha detalles sobre el proceso de conversion, calibracion o cuantizacion aplicado, mas alla de los tags que indican exportacion a ONNX y cuantizacion del modelo base.

La innovacion tecnica de esta variante no reside en el entrenamiento, sino en el despliegue: la exportacion a ONNX y la adaptacion al runtime Ryzen AI 1.9.0 permiten ejecutar el modelo sobre la NPU integrada en procesadores AMD compatibles. No se dispone de informacion sobre el esquema exacto de cuantizacion (por ejemplo, INT8 o INT16), el numero de tokens de entrenamiento adicionales ni si se aplico ajuste fino posterior. Tampoco se documentan tecnicas como decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante la pipeline `automatic-speech-recognition`.
- Transcripcion multilingue y traduccion al ingles, en la medida en que lo soporte el modelo base Whisper Small (los idiomas concretos no se detallan en la ficha).
- Procesamiento de audio en ventanas de 30 segundos, con capacidad de segmentacion para audios mas largos mediante la pipeline estandar.
- Ejecucion local acelerada por NPU en hardware AMD Ryzen AI, con el runtime Ryzen AI 1.9.0.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido; sus capacidades se limitan a las del modelo ASR base.

## Casos de uso

- Transcripcion de reuniones en local: el modelo puede convertir audio de reuniones en texto sin enviar datos a la nube, aprovechando la NPU para reducir consumo y latencia en portatiles con Ryzen AI.
- Subtitulado automatico de video: integrado en herramientas de edicion, permite generar subtitulos en tiempo casi real sobre el propio equipo, sin GPU dedicada.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse en la NPU, libera CPU y GPU para el resto de la aplicacion, lo que resulta adecuado para asistentes de escritura.
- Procesamiento por lotes de archivos de audio en estaciones de trabajo AMD: la exportacion a ONNX facilita su integracion en pipelines de procesamiento con ONNX Runtime.
- Transcripcion de notas de voz y entrevistas en entornos con requisitos de privacidad, donde el audio no puede salir del dispositivo.
- Prototipado de aplicaciones de accesibilidad (por ejemplo, conversion de voz a texto para personas con discapacidad auditiva) en equipos de consumo con NPU AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere una NPU AMD Ryzen AI compatible con el runtime Ryzen AI 1.9.0; no esta pensado para ejecutarse en GPU NVIDIA ni en CPU generica mediante este artefacto.
- VRAM estimada: no aplica, ya que el modelo se ejecuta sobre NPU; el repositorio ocupa 0,4 GB en disco.
- GPU recomendadas: no aplica para esta variante; para ejecutar Whisper Small en GPU se usarian las versiones estandar del modelo base.
- Cabe en hardware de consumo AMD con NPU integrada (procesadores Ryzen AI de las generaciones compatibles con el runtime 1.9.0).
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecucion de Ryzen AI; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/whisper-small_rai_1.9.0_m_1.0.1_npu | ~244 M | Ventanas de 30 s | ONNX (NPU) | Apache 2.0 | Gated en Hugging Face |
| openai/whisper-small | ~244 M | Ventanas de 30 s | Safetensors / PyTorch | Apache 2.0 | Publico en Hugging Face |
| openai/whisper-base | ~74 M | Ventanas de 30 s | Safetensors / PyTorch | Apache 2.0 | Publico en Hugging Face |
| openai/whisper-medium | ~769 M | Ventanas de 30 s | Safetensors / PyTorch | Apache 2.0 | Publico en Hugging Face |

La diferencia principal frente al modelo base es el formato y el destino de ejecucion (ONNX sobre NPU Ryzen AI), no la calidad del reconocimiento, que en principio deberia ser equivalente a la de Whisper Small salvo por el posible impacto de la cuantizacion, cuyo efecto no se documenta.

## Limitaciones y advertencias

- El acceso esta restringido: es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Depende de hardware AMD Ryzen AI y del runtime Ryzen AI 1.9.0; no es portable a otras plataformas sin reconversion.
- La cuantizacion puede degradar ligeramente la precision de transcripcion respecto al modelo base, aunque no se publican datos al respecto.
- Whisper es propenso a alucinaciones en segmentos de silencio, ruido o audio de baja calidad, y puede generar texto plausible no presente en el audio.
- Los idiomas efectivamente soportados no se detallan en la ficha; conviene verificar el comportamiento en el idioma objetivo.
- No se documentan sesgos especificos de esta variante; se heredan los del modelo base Whisper Small, entrenado con datos debilmente supervisados.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de acceso del repositorio gated.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/whisper-small_rai_1.9.0_m_1.0.1_npu
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Ryzen AI (AMD): https://www.amd.com/en/products/software/ryzen-ai.html
