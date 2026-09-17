# PJlabs/vellum-de-local

## Resumen

Vellum Deutsch Lokal es un paquete de modelos para uso local (offline) publicado por PJ Labs y consumido por la aplicación de dictado Vellum para macOS. El repositorio no contiene un único modelo, sino dos componentes en formato ONNX: un componente obligatorio de reconocimiento automático de voz (`speech-recognition`) que convierte audio en texto en alemán, y un componente opcional de corrección de texto (`correction-t5-onnx`) que postprocesa la transcripción cuando el usuario lo activa. El conjunto está pensado para ejecutarse íntegramente en el Mac del usuario, sin enviar audio ni transcripciones a servicios externos.

La relevancia del paquete es fundamentalmente de despliegue: se distribuye como un artefacto verificado por hash que la aplicación descarga y ejecuta localmente, con el objetivo declarado de preservar la privacidad del dictado. La ficha de HuggingFace lo etiqueta con los tags `onnx`, `automatic-speech-recognition`, `text-correction`, `offline`, `vellum` y `macos`, y limita el idioma soportado al alemán, con variante BCP-47 `de-AT` (alemán de Austria). El tamaño total del repositorio es de 2,4 GB.

El modelo se declara explícitamente como experimental y no apto para transcripción clínica, legal o con garantías. No se especifican parámetros totales, longitud de contexto ni arquitectura del componente de reconocimiento, y no se han publicado resultados de benchmarks en la información disponible. La licencia del repositorio figura como "other", con textos de licencia incluidos para cada linaje: CC-BY-4.0 para el componente de reconocimiento y Apache-2.0 para el componente de corrección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el componente de reconocimiento; el componente de correccion usa una arquitectura T5 encoder/decoder en ONNX |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos ONNX; no se detalla si estan cuantizados ni con que precision) |
| Idiomas soportados | Aleman (`de`), con variante BCP-47 `de-AT` |
| Licencia | `other` en la ficha de HuggingFace; se incluyen textos de licencia CC-BY-4.0 (linaje del reconocimiento) y Apache-2.0 (linaje de la correccion) |
| Formato de pesos | ONNX; el componente de correccion es ONNX T5 encoder/decoder |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | PJlabs/vellum-de-local |
| Autor | PJlabs |
| Pipeline declarado | automatic-speech-recognition |
| Tamano del repositorio | 2,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |
| Estado declarado | Experimental |
| Plataforma objetivo | macOS (aplicacion Vellum) |

Componentes del paquete:

| Componente | Obligatorio | Funcion | Formato |
|---|---|---|---|
| `speech-recognition` | Si | Convierte voz en texto aleman de forma local | ONNX |
| `correction-t5-onnx` | No | Corrige el texto aleman reconocido cuando esta activado | ONNX T5 encoder/decoder |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del componente de reconocimiento de voz mas alla de que se distribuye en formato ONNX y de que procede de un linaje bajo licencia CC-BY-4.0. No se indican el numero de parametros, la familia arquitectonica (transformer, convolutional, híbrida), ni el tipo de decodificacion empleado. El segundo componente si se describe con mas detalle: es un modelo T5 con encoder y decoder exportado a ONNX, cuyo cometido es la correccion de texto aleman reconocido, y su linaje se publica bajo Apache-2.0.

Tampoco se detallan los datos de entrenamiento: no hay cifras de tokens, composicion del dataset, ni mention de tecnicas de alineamiento como RLHF o DPO. La model card si aclara que el paquete publico no contiene memorias de voz privadas, transcripciones privadas, diccionarios de usuario ni ejemplos de entrenamiento privados, y que las reglas de correccion especificas de cada usuario permanecen en local en el Mac del usuario y no forman parte del repositorio. La correccion se describe como dependiente de un ajuste opcional dentro de la aplicacion Vellum.

## Capacidades

- Reconocimiento automatico de voz en aleman, ejecutado localmente sobre el equipo del usuario.
- Correccion de texto aleman reconocido mediante un componente T5 opcional, activable o desactivable dentro de la aplicacion.
- Funcionamiento completamente offline: no requiere conexion a servicios remotos una vez descargado y verificado el paquete.
- Integracion con la aplicacion de dictado Vellum para macOS.
- Soporte de la variante de aleman austriaco (`de-AT`) segun la declaracion de idioma del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio adicional o modo de razonamiento explicito: no disponible.

## Casos de uso

- Dictado de documentos en aleman en escritorio: el usuario habla y el componente `speech-recognition` genera texto localmente en su Mac, sin que el audio salga del equipo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Redaccion de correos y mensajes profesionales en aleman: el dictado se combina con el componente `correction-t5-onnx` para limpiar errores de reconocimiento antes de enviar el texto.
- Notas de reunion en aleman: transcripcion local de intervenciones para generar un borrador que despues se edita, evitando subir audio corporativo a terceros.
- Apoyo a la accesibilidad para usuarios con movilidad reducida: entrada de texto por voz en aleman en el sistema operativo, con la posibilidad de activar la correccion para reducir el esfuerzo de edicion posterior.
- Uso profesional en Austria y regiones germanoparlantes: la declaracion explicita de `de-AT` permite cubrir variantes lexicas y de pronunciacion del aleman austriaco en tareas de dictado.
- Pruebas de integracion locales del propio producto: la model card indica que el paquete es apto para tests de integracion locales de Vellum y para uso offline temprano, lo que lo convierte en un artefacto util para validar el pipeline de dictado en CI de escritorio.
- Flujos con reglas de correccion propias del usuario: la aplicacion permite mantener diccionarios y reglas de correccion en local, de modo que un profesional puede adaptar la salida a su terminologia sin compartir esos datos.
- Procesamiento por lotes de audio ya grabado: dado que el modelo es ONNX y se ejecuta en local, puede emplearse para transcribir archivos de audio existentes en aleman en una maquina macOS sin dependencia de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de HuggingFace indica 0 descargas y 0 likes, y la model card no incluye tablas de WER, MMLU, HumanEval ni metricas equivalentes, ni comparaciones cuantitativas con otros sistemas de reconocimiento de voz.

## Requisitos de hardware

- Espacio en disco: el repositorio completo ocupa 2,4 GB, por lo que se necesita al menos ese espacio para descargar el paquete. El desglose por componente no esta disponible.
- Memoria en tiempo de ejecucion: no disponible. No se especifica la huella de VRAM ni de memoria unificada para ninguno de los dos componentes ONNX.
- GPU recomendadas: no disponible. La plataforma objetivo declarada es macOS, por lo que el consumo previsible es de CPU y, en su caso, de aceleracion en el chip de Apple; no se mencionan GPU discretas.
- Compatibilidad con GPU de consumo: no disponible. No hay datos sobre RTX 4090, A100, H100 ni equivalentes.
- Opciones de despliegue: el formato distribuido es ONNX, de modo que el runtime natural es ONNX Runtime, potencialmente con el execution provider de CoreML en macOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no serian los runners habituales para este formato y caso de uso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El repositorio no publica parametros, contexto ni metricas de calidad, y la busqueda web asociada no devolvio resultados relacionados con el modelo ni con alternativas de reconocimiento de voz en aleman.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PJlabs/vellum-de-local | No disponible | No disponible | No disponible | `other` (componentes CC-BY-4.0 y Apache-2.0) | Repositorio publico en HuggingFace, 0 descargas |
| Alternativas de la misma categoria (reconocimiento de voz aleman local) | No disponible | No disponible | No disponible | No disponible | No disponible |

Criterios que si pueden compararse cualitativamente: este paquete es especifico de una aplicacion (Vellum en macOS), esta limitado al aleman y combina reconocimiento mas correccion en un unico artefacto verificado por hash. Cualquier alternativa orientada a un unico componente o a multiples idiomas tendria un alcance distinto; no se dispone de datos para cuantificar la diferencia.

## Limitaciones y advertencias

- Estado experimental declarado por el propio autor: la model card indica que el paquete es apto para pruebas de integracion y uso offline temprano, y que no es un sistema de transcripcion clinico, legal ni garantizado.
- Idioma unico: solo aleman (`de`), con variante `de-AT`. No hay soporte declarado de castellano ni de otros idiomas, por lo que no es adecuado para dictado multilingue.
- Licencia `other`: aunque el repositorio incluye textos de CC-BY-4.0 y Apache-2.0 para sus linajes, la etiqueta de licencia de la ficha es "other". Es imprescindible revisar `NOTICE.md` y los ficheros `LICENSE-CC-BY-4.0.txt` y `LICENSE-Apache-2.0.txt` antes de cualquier uso comercial.
- Dependencia de atribucion: el linaje del reconocimiento esta bajo CC-BY-4.0, lo que exige mantener la atribucion correspondiente si se redistribuye o se integra en otro producto.
- Riesgo de alucinacion y errores de reconocimiento: no se publican tasas de error, y el propio flujo incluye un componente de correccion opcional, lo que sugiere que la salida cruda puede requerir postprocesado. No hay datos para acotar la magnitud del problema.
- Acoplamiento a la aplicacion Vellum: el paquete esta disenado para el consumo interno de esa aplicacion en macOS y se distribuye con verificacion de hash. Su reutilizacion fuera de ese entorno no esta documentada.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de sesgos: no disponible. No se documenta la composicion del dataset de entrenamiento ni analisis de sesgo por acento, genero o dialecto, mas alla de la mencion a `de-AT`.
- Privacidad: la model card afirma que el repositorio publico no incluye memorias de voz, transcripciones ni diccionarios de usuario, y que las reglas de correccion personalizadas permanecen en el equipo del usuario. Cualquier despliegue que recoja esos datos debe gestionarse aparte, fuera del alcance de este paquete.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PJlabs/vellum-de-local
- Fichero de atribucion y notas de licencia: `NOTICE.md` dentro del repositorio
- Texto de licencia del linaje de reconocimiento: `LICENSE-CC-BY-4.0.txt` dentro del repositorio
- Texto de licencia del linaje de correccion: `LICENSE-Apache-2.0.txt` dentro del repositorio
- Paper, blog, repositorio de codigo o demo: no disponibles

Nota sobre la busqueda web: los resultados obtenidos (ePay.bg y su documentacion de API de facturacion) no guardan relacion con el modelo, por lo que no se incluyen como enlaces relevantes.
