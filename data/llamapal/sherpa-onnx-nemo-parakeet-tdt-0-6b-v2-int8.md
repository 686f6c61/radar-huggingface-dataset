# LlamaPal/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8

## Resumen

Este repositorio contiene una copia sin modificaciones de los ficheros ONNX cuantizados a int8 del modelo de reconocimiento automatico del habla (ASR) Parakeet-TDT 0.6B v2 de NVIDIA, empaquetados para su uso con sherpa-onnx en dispositivos Android. El autor, LlamaPal, distribuye estos artefactos como componente de voz de su aplicacion de chat con IA completamente offline para Android. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son identicos byte a byte a los publicados por csukuangfj en el repositorio sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8, en el commit `1ab9323565dd`.

El modelo subyacente es un sistema ASR de NVIDIA basado en arquitectura FastConformer con decodificacion TDT (Token-and-Duration Transducer) y aproximadamente 0.6 mil millones de parametros. Su interes practico radica en que permite transcripcion de voz en tiempo real en el propio dispositivo movil, sin conexion a internet ni envio de audio a servidores externos, lo que resulta relevante para aplicaciones de privacidad y para escenarios con conectividad limitada.

La relevancia de este repositorio concreto es logistica: ofrece los ficheros ya convertidos y cuantizados (encoder, decoder y joiner en formato int8 ONNX) junto con el vocabulario `tokens.txt`, listos para integrarse en sherpa-onnx sobre Android. El repositorio ocupa 0.7 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0.6B (aproximadamente 600 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ficheros `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8) + `tokens.txt` |

Desglose de ficheros:

| Fichero | Tamano | SHA-256 |
|---|---|---|
| `encoder.int8.onnx` | 652 MB | `a32b12d17bbbc309d0686fbbcc2987b5e9b8333a7da83fa6b089f0a2acd651ab` |
| `decoder.int8.onnx` | 7 MB | `b6bb64963457237b900e496ee9994b59294526439fbcc1fecf705b31a15c6b4e` |
| `joiner.int8.onnx` | 2 MB | `7946164367946e7f9f29a122407c3252b680dbae9a51343eb2488d057c3c43d2` |
| `tokens.txt` | 9 KB | `ec182b70dd42113aff6c5372c75cac58c952443eb22322f57bbd7f53977d497d` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Parakeet-TDT 0.6B v2 de NVIDIA, un sistema ASR end-to-end de tipo transducer. El encoder emplea FastConformer, una variante del Conformer con atencion de submuestreo que reduce la longitud de secuencia y disminuye el coste computacional en audio largo. El decodificador utiliza el esquema TDT (Token-and-Duration Transducer), que predice conjuntamente el token de salida y su duracion, lo que permite emitir varios tokens por paso y acelera la decodificacion frente a un transducer convencional.

Los ficheros de este repositorio son la version exportada a ONNX y cuantizada a int8 para su ejecucion con sherpa-onnx. La informacion proporcionada no incluye detalles sobre el dataset de entrenamiento, el numero de tokens de audio procesados, la composicion de los datos ni si se aplicaron tecnicas de ajuste fino o alineacion adicionales. Tampoco se documentan innovaciones especificas de esta exportacion mas alla de la cuantizacion int8 y el empaquetado para movil.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en modo offline.
- Ejecucion en el propio dispositivo mediante sherpa-onnx, sin llamadas a servicios remotos.
- Integracion en una aplicacion Android de chat por voz (LlamaPal), donde el modelo actua como capa de comprension del habla del usuario.
- Decodificacion con esquema TDT, que puede reducir la latencia frente a transducers clasicos.
- No se documentan capacidades de traduccion, diarizacion de hablantes, deteccion de eventos acusticos ni salida de marcas de tiempo en la informacion disponible.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion de voz en aplicaciones Android offline: el modelo se integra con sherpa-onnx y procesa el audio del microfono en el dispositivo, de modo que el contenido dictado no abandona el telefono. Es adecuado por su tamano contenido (0.6B) y su formato int8, pensado para hardware movil.
- Dictado en entornos sin conectividad: en zonas rurales, aviones, tuneles o recintos con red restringida, la transcripcion local evita depender de servicios en la nube y mantiene la funcionalidad.
- Asistentes de voz con requisitos de privacidad: aplicaciones sanitarias, legales o corporativas donde el audio no puede enviarse a terceros pueden usar este modelo como front-end de voz dentro de una app que ya procesa el resto de forma local.
- Accesibilidad para personas con movilidad reducida: entrada por voz en aplicaciones Android para redactar mensajes, notas o formularios sin teclado, con el modelo ejecutandose en segundo plano en el propio dispositivo.
- Notas de voz y actas en movilidad: transcripcion de reuniones o apuntes grabados con el telefono, procesados posteriormente en local para generar texto editable, aprovechando que el modelo no requiere red.
- Prototipado de pipelines ASR en sherpa-onnx: dado que los ficheros son una copia exacta de los publicados por csukuangfj, sirven como referencia reproducible para validar integraciones ONNX int8 en Android antes de desplegar en produccion.
- Aplicaciones de voz para IA conversacional local: combinado con un modelo de lenguaje tambien local, permite construir un asistente de voz completo que no envia datos a ningun servidor, como hace la propia aplicacion LlamaPal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio esta orientado a ejecucion en Android mediante sherpa-onnx; el conjunto de ficheros ocupa aproximadamente 0.7 GB en disco.
- El encoder int8 (652 MB) es el componente dominante en memoria; el decoder (7 MB) y el joiner (2 MB) son marginales.
- VRAM estimada para inferencia en GPU de escritorio: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El caso de uso declarado es movil y CPU, no GPU de escritorio.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada; el modelo no se distribuye con ese objetivo.
- Opciones de despliegue: sherpa-onnx (runtime principal), con soporte de ONNX Runtime subyacente. No se documenta integracion con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet-TDT 0.6B v2 (este repo, int8 ONNX) | 0.6B | ONNX int8 | ASR offline en Android via sherpa-onnx | CC-BY-4.0 | Hugging Face (mirror de LlamaPal) |
| nvidia/parakeet-tdt-0.6b-v2 | 0.6B | NeMo (original) | ASR, pesos originales de NVIDIA | no disponible en esta ficha | Hugging Face (repositorio original) |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8 | 0.6B | ONNX int8 | ASR para sherpa-onnx | CC-BY-4.0 | Hugging Face (origen de esta copia) |

No se dispone de datos de rendimiento comparado con otros modelos ASR en la informacion proporcionada, por lo que no se incluyen alternativas adicionales con metricas.

## Limitaciones y advertencias

- Este repositorio es un espejo sin modificaciones; no debe citarse como el modelo original. El credito y la documentacion completa corresponden a NVIDIA y a csukuangfj.
- La model card no especifica los idiomas soportados; no debe asumirse cobertura multilingue sin verificacion previa en el repositorio original.
- No se documentan sesgos, tasas de error ni comportamiento en acentos o dominios especificos; en produccion conviene evaluar con audio propio antes de desplegar.
- Como todo sistema ASR, existe riesgo de transcripciones erroneas, especialmente en audio con ruido, solapamiento de hablantes o vocabulario tecnico.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya adecuadamente a los autores originales; es responsabilidad del integrador cumplir la atribucion.
- El modelo esta pensado para inferencia en dispositivo; no se ofrecen garantias de latencia ni de consumo energetico en telefonos de gama baja.
- El repositorio registra cero descargas y cero interacciones, lo que sugiere poca validacion comunitaria de esta copia concreta; para produccion es preferible referenciar el repositorio de csukuangfj o el original de NVIDIA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- Repositorio origen de los ficheros (csukuangfj): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
