# GoodnotesIT/nemotron-3.5-asr-streaming-multilingual-0.6b-litert-fp16

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una exportación a LiteRT del checkpoint `nvidia/nemotron-3.5-asr-streaming-0.6b` (revisión `ea30d66debe3740a08b573244286791d423d6b3e`), publicada por GoodnotesIT. Se trata de un sistema de reconocimiento automático del habla (ASR) en streaming, multilingüe, de aproximadamente 0,6 mil millones de parámetros, pensado para ejecutarse en dispositivo (Android) sobre la cadena de ejecución LiteRT. El problema que resuelve es la transcripción continua y de baja latencia sin depender de la nube, aprovechando el NPU de SoC Qualcomm mediante compilación AOT del encoder.

El paquete separa los tres grafos propios de una arquitectura de tipo transducer (encoder, decoder y red joint). Solo el encoder se compila AOT para cada SoC objetivo, porque es el grafo que se ejecuta en el acelerador; el decoder y el joint permanecen como grafos portable compartidos. El repositorio incluye candidatos AOT para cinco familias de SoC Qualcomm (SM8450, SM8550, SM8650, SM8750 y SM8850), junto con informes de compilación y un manifiesto de release con longitudes en bytes y checksums SHA-256.

Su relevancia actual está en el nicho de ASR embebido: los pesos FP16 portables caben con holgura en la memoria de un teléfono moderno y la compilación AOT permite delegar el encoder en el NPU. Conviene subrayar que el autor advierte explícitamente de que los ficheros AOT son candidatos de compilador y no afirman haber sido validados en dispositivo físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer de ASR en streaming con grafos separados de encoder, decoder y red joint |
| Parametros totales | 0,6 mil millones (segun el nombre del modelo; el autor no publica el desglose exacto) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 con entradas/salidas FP32 en los grafos portable; no se documentan variantes INT8, INT4 ni GGUF |
| Idiomas soportados | Multilingue; el autor no detalla la lista concreta de idiomas (no disponible) |
| Licencia | NVIDIA Open Model License (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | LiteRT/TFLite (`.tflite`): grafos portable FP16 y candidatos AOT por SoC |
| Tamano del repositorio | 7,3 GB (incluye artefactos AOT para varios SoC) |
| Libreria / runtime | `litert`; exportador/compilador LiteRT 2.2.0, interprete de compatibilidad Android 2.1.6 |
| Revision del artefacto | `2934a7ec96c97ca17d4b88c78aecb6e3997a3e63` |
| Fecha de publicacion | 15 de septiembre de 2026 (creado y actualizado ese dia) |

## Arquitectura y entrenamiento

El modelo subyacente es un sistema de ASR en streaming de tipo transducer: la red se descompone en encoder, decoder y joint, que es el esquema habitual cuando se quiere emitir hipotesis parciales token a token sin esperar a una ventana completa de audio. En esta exportacion, el encoder es el grafo que se compila en modo AOT por SoC, mientras que decoder y joint se distribuyen como grafos portable compartidos. El paquete `portable/` contiene pesos FP16 con entradas y salidas FP32 y una cadena de fallback que intenta NPU, despues GPU y finalmente CPU por JIT.

El autor parte de un checkpoint `.nemo` de NVIDIA fijado por checksum, de modo que la exportacion es reproducible y verificable mediante `release-manifest.json`, que registra longitudes en bytes, checksums SHA-256, origen y version del toolchain. No se especifican en la informacion disponible ni el volumen de datos de entrenamiento, ni su composicion, ni si hubo fases de ajuste con RLHF, DPO o similares; esos datos corresponderian a la model card del modelo original de NVIDIA. La innovacion destacable de esta publicacion es de despliegue, no de modelado: compilacion AOT del encoder para el NPU de Qualcomm, con cadena portable de respaldo y decision explicita de excluir la salida parcial de MediaTek (esos dispositivos usan la cadena JIT portable).

## Capacidades

- Reconocimiento automatico del habla en modo streaming, con emision incremental de transcripcion.
- Funcionamiento multilingue, segun la etiqueta del autor (la lista de idiomas no se detalla).
- Inferencia en dispositivo (on-device) para Android mediante LiteRT, con delegacion del encoder al NPU cuando existe un candidato AOT validado.
- Cadena de fallback en cascada: NPU, GPU y CPU por JIT, de modo que el modelo puede ejecutarse aunque no haya acelerador compatible.
- Grafos portable ejecutados con exito con entradas tipadas representativas a traves del interprete CPU de LiteRT 2.1.6.
- No es un modelo de lenguaje: no genera texto libre, no razona, no escribe codigo y no soporta tool calling, function calling ni uso como agente.
- No se documentan capacidades de traduccion, diarizacion de hablantes, deteccion de idioma explicita ni salida con marcas de tiempo.

## Casos de uso

- Subtitulado en directo en aplicaciones moviles: el caracter streaming permite mostrar texto parcial mientras el usuario habla, sin enviar audio a un servidor, lo que reduce latencia y evita exponer conversaciones.
- Transcripcion offline de notas de voz: al ser un modelo de 0,6 B en FP16 (del orden de 1,2 GB de pesos, calculo derivado de 0,6 mil millones de parametros por 2 bytes), puede empaquetarse dentro de una app Android y funcionar sin conexion.
- Dictado multilingue en herramientas de productividad: la etiqueta multilingue lo hace adecuado para usuarios que alternan idiomas, siempre que se verifique el rendimiento real en cada idioma objetivo.
- Accesibilidad para personas sordas o con hipoacusia: transcripcion continua en el propio dispositivo para conversaciones presenciales, con la ventaja de que el audio no sale del telefono.
- Documentacion clinica o de campo con requisitos de privacidad: al ejecutarse localmente sobre el NPU, se evita transferir grabaciones a terceros, lo que simplifica el cumplimiento normativo (sujeto siempre a la validacion del modelo en el dominio concreto).
- Integracion en asistentes de voz embebidos: la salida incremental del transducer alimenta directamente un modulo de intenciones sin necesidad de esperar la frase completa.
- Analitica de audio en dispositivos de gama alta con Snapdragon: los candidatos AOT para SM8450, SM8550, SM8650, SM8750 y SM8850 permiten evaluar el consumo energetico frente a la ruta CPU.
- Transcripcion de reuniones en segundo plano: la ventana deslizante del modo streaming encaja mejor que un modelo por segmentos de 30 segundos para audio largo y continuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER), latencia ni metricas de consumo energetico, y los resultados de la busqueda web realizada no contienen datos tecnicos sobre este modelo. Tampoco se aportan comparaciones con la version original en formato `.nemo` mas alla de la identidad del checkpoint de origen.

## Requisitos de hardware

- Peso de los parametros en FP16: aproximadamente 1,2 GB (estimacion a partir de 0,6 mil millones de parametros por 2 bytes), sin contar activaciones, buffers de estado del streaming ni los grafos duplicados que elevan el repositorio a 7,3 GB.
- Aceleracion objetivo: NPU de Qualcomm en los SoC SM8450, SM8550, SM8650, SM8750 y SM8850, mediante encoder compilado AOT en `aot/qualcomm/<SoC>/encoder.tflite`. La correspondencia de estos codigos con nombres comerciales no se detalla en la informacion disponible.
- Ruta de respaldo: grafos portable FP16 ejecutables por NPU, GPU y, en ultimo termino, CPU mediante el interprete LiteRT 2.1.6.
- Dispositivos MediaTek: la salida parcial para estos objetivos queda excluida del paquete; se deben usar los grafos portable por JIT.
- Cabe en movil de gama alta: el tamano de pesos es compatible con telefonos modernos, pero no hay datos publicados de memoria pico real ni de rendimiento en dispositivo fisico.
- Opciones de despliegue: LiteRT en Android con el interprete de compatibilidad 2.1.6. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles. El autor solo indica que los grafos portable se han ejecutado con exito con entradas tipadas representativas en CPU.
- Requisito operativo: la aplicacion debe conservar la cadena portable de fallback y no activar un candidato AOT hasta validar las versiones de runtime/compilador y el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repositorio (GoodnotesIT LiteRT FP16) | 0,6 B | Si | NVIDIA Open Model License | LiteRT/TFLite (portable FP16 + AOT por SoC) | Exportacion con manifiesto de checksums; candidatos AOT no validados en dispositivo fisico |
| `nvidia/nemotron-3.5-asr-streaming-0.6b` | 0,6 B | Si | NVIDIA Open Model License | Checkpoint `.nemo` | Modelo de origen; mismo peso y familia, sin compilacion AOT para Android |
| Alternativas de ASR en dispositivo de otros fabricantes | No disponible | No disponible | No disponible | No disponible | La busqueda web realizada no devolvio informacion tecnica relevante, por lo que no se aportan cifras comparativas |

No se dispone de datos verificados en la informacion proporcionada para comparar con modelos de la competencia en igualdad de condiciones (mismo tamano, misma tarea y mismas condiciones de evaluacion).

## Limitaciones y advertencias

- No hay datos publicados de calidad de transcripcion: se desconoce el WER por idioma, el comportamiento con acentos, ruido de fondo, solapamiento de hablantes o audio telefónico.
- La lista concreta de idiomas soportados no esta disponible; la etiqueta "multilingual" no cuantifica la calidad por lengua.
- Los artefactos AOT son candidatos de compilador: el propio autor indica que no afirman validacion en dispositivo fisico. Activar un candidato AOT sin validar puede producir fallos de ejecucion.
- La salida parcial para MediaTek esta excluida; en esos dispositivos la unica ruta soportada es la cadena portable JIT.
- La aplicacion debe mantener obligatoriamente el fallback portable; eliminar esa ruta puede dejar el sistema sin opcion de ejecucion.
- La licencia es la NVIDIA Open Model License, etiquetada como `license: other`. Hay que revisar su texto antes de un uso comercial: incluye condiciones de atribucion y limitaciones de responsabilidad propias de NVIDIA.
- Cero descargas y cero likes en el momento de redactar esta ficha, lo que implica ausencia de validacion por parte de la comunidad.
- El repositorio ocupa 7,3 GB por acumulacion de artefactos AOT para varios SoC; conviene descargar solo el objetivo necesario.
- Variabilidad entre versiones de runtime: el paquete declara compatibilidad con el interprete LiteRT 2.1.6 y fue generado con el exportador 2.2.0, un desajuste de versiones que debe gestionarse con cuidado.
- Al ser un modelo de ASR y no un modelo de lenguaje, no cabe esperar mitigaciones tipo RLHF frente a salidas ofensivas: los errores de transcripcion pueden introducir terminos inexistentes en el texto final, un riesgo relevante en entornos medicos o legales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GoodnotesIT/nemotron-3.5-asr-streaming-multilingual-0.6b-litert-fp16
- Modelo de origen de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/ea30d66debe3740a08b573244286791d423d6b3e
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos no guardan relacion con el ambito de ASR ni con el modelo).
