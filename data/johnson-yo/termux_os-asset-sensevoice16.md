# johnson-yo/termux_os-asset-sensevoice16

## Resumen

`johnson-yo/termux_os-asset-sensevoice16` es un paquete de activos (asset) para reconocimiento de voz en dispositivo, publicado en HuggingFace por el usuario `johnson-yo`. No se trata de una publicacion de pesos de un modelo entrenado, sino de un contexto HTP precompilado de forma fija para el modelo SenseVoice, dirigido a la plataforma `android-arm64-v73-qnn249`. El paquete define una forma fija de T=267, 560 caracteristicas y 271 posiciones CTC, lo que corresponde a una ventana de audio de aproximadamente 16 segundos.

El activo se distribuye a traves del Termux-OS Package Registry y esta pensado para que una aplicacion Android lo seleccione en funcion de la capacidad del modelo y del dispositivo objetivo, no en funcion de la version del paquete. El propio README advierte que la instalacion del paquete no implica que el modelo este listo: la verificacion en tiempo de ejecucion es responsabilidad de la aplicacion. El repositorio ocupa 0,9 GB y no declara licencia, idiomas ni pipeline en la ficha de HuggingFace.

La relevancia de este paquete es de nicho pero concreta: permite ejecutar inferencia de reconocimiento de voz sobre el Hexagon Tensor Processor (HTP) de Qualcomm mediante QAIRT 2.49, sin depender de los grafos genericos de SenseVoice 3.1.0 o 4.0.0. El README indica explicitamente que este paquete es independiente del paquete generico de SenseVoice y que no sustituye su grafo 4.0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete contiene un contexto HTP precompilado del modelo SenseVoice; el autor no describe la arquitectura interna) |
| Parametros totales | no disponible |
| Longitud de contexto | ventana de audio fija de aproximadamente 16 segundos (T=267, 560 caracteristicas, 271 posiciones CTC) |
| Tipos de cuantizacion | no disponible (no se detalla el esquema de cuantizacion del contexto HTP) |
| Idiomas soportados | no disponible (la ficha de HuggingFace no declara idiomas) |
| Licencia | no disponible en la ficha; los terminos se remiten a los ficheros `NOTICE.md` y `LICENSE` del propio repositorio |
| Formato de pesos | contexto HTP precompilado (binario transportado) generado con Qualcomm AI Hub para QAIRT 2.49; no se publican safetensors ni GGUF |
| Plataforma objetivo | android-arm64-v73-qnn249 |
| Salida del modelo | 271 posiciones CTC |
| Tamano del repositorio | 0,9 GB |
| Distribucion | Termux-OS Package Registry |
| Verificacion de integridad | `asset.json` fija los hashes del grafo canonico y del grafo transformado, asi como la revision y el hash upstream de cada fichero de frontend |
| Fecha de creacion | 2026-09-25 |
| Fecha de actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

El paquete no documenta entrenamiento ni composicion de dataset: es un artefacto de compilacion y empaquetado, no una publicacion de un modelo entrenado. Lo que si describe el README es que se trata de un contexto HTP construido en host, con forma fija, para el modelo SenseVoice orientado a voz. El contexto se genera con Qualcomm AI Hub para QAIRT 2.49, y su hash identifica el binario transportado, no la semantica del modelo.

El detalle tecnico mas relevante es la separacion respecto de los grafos genericos: el hash del grafo canonico difiere del de los grafos genericos 3.1.0 y 4.0.0, mientras que los ficheros de frontend son activos upstream compartidos byte a byte. El paquete declara explicitamente que no reemplaza al grafo 4.0.0 del paquete generico de SenseVoice. La seleccion del activo la realiza la aplicacion segun la capacidad del modelo y el dispositivo objetivo, lo que implica que la version del paquete no es el criterio de compatibilidad. No hay informacion sobre tecnicas de entrenamiento, RLHF, DPO ni innovaciones de decodificacion.

## Capacidades

- Reconocimiento de voz en dispositivo sobre el Hexagon Tensor Processor (HTP) de Qualcomm, con runtime QNN para el target android-arm64-v73-qnn249.
- Salida CTC con 271 posiciones, lo que permite obtener hipotesis de transcripcion alineadas con la senal de entrada.
- Procesamiento de audio en ventanas fijas de aproximadamente 16 segundos (T=267, 560 caracteristicas), sin forma dinamica.
- Integracion mediante el Termux-OS Package Registry, con seleccion por capacidad de modelo y dispositivo objetivo.
- Verificacion de integridad de los grafos y de los ficheros de frontend mediante los hashes fijados en `asset.json`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio generativo o modo thinking: no disponibles.

## Casos de uso

- Transcripcion de voz local en aplicaciones Android: el activo permite ejecutar la inferencia sobre el HTP del dispositivo, con lo que la transcripcion se realiza sin enviar audio a un servidor y sin depender de conectividad.
- Dictado por voz en herramientas de terminal o entornos tipo Termux: al distribuirse a traves del Termux-OS Package Registry, encaja en flujos de trabajo de linea de comandos en Android donde se necesita entrada de texto por voz.
- Subtitulado de segmentos cortos de audio: la ventana fija de aproximadamente 16 segundos obliga a trocear el audio, de modo que el caso natural es la generacion de subtitulos por segmentos con marcas temporales derivadas de las 271 posiciones CTC.
- Notas de voz y mensajeria: integracion en aplicaciones de mensajeria que necesitan convertir notas de voz de duracion corta a texto en el propio dispositivo.
- Preprocesado de comandos de voz en asistentes embebidos: al ejecutarse en el acelerador dedicado, libera CPU y GPU para el resto de la logica de la aplicacion.
- Indexacion y busqueda de audio grabado: transcripcion por lotes de grabaciones segmentadas en fragmentos de hasta unos 16 segundos para construir un indice de texto consultable localmente.
- Cumplimiento de requisitos de privacidad: en escenarios con datos personales o regulados, el procesamiento local evita la exportacion del audio a infraestructura de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del repositorio no incluye metricas de tasa de error de palabra (WER), latencia ni throughput, y la ficha de HuggingFace no aporta datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se ejecuta sobre el Hexagon Tensor Processor (NPU) de Qualcomm, no sobre GPU NVIDIA o AMD.
- GPU recomendadas: no disponibles. El target declarado es `android-arm64-v73-qnn249`, es decir, un dispositivo Android con NPU Hexagon y runtime QNN compatible con QAIRT 2.49.
- Compatibilidad con GPU de consumo: no aplica. El paquete no esta pensado para ejecutarse en una RTX 4090, A100 o H100.
- Opciones de despliegue: Termux-OS Package Registry para la distribucion; ejecucion mediante el contexto HTP y el runtime QNN del dispositivo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a este tipo de activo.
- Requisitos de almacenamiento: el repositorio ocupa 0,9 GB, a lo que hay que sumar el espacio del paquete instalado en el dispositivo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los paquetes genericos de SenseVoice citados en el propio README.

| Paquete | Forma de entrada | Grafo | Frontend | Notas |
|---|---|---|---|---|
| `johnson-yo/termux_os-asset-sensevoice16` | fija: T=267, 560 caracteristicas, 271 posiciones CTC, ~16 segundos | hash distinto del canonico de 3.1.0 y 4.0.0; contexto HTP propio para QAIRT 2.49 | activos upstream compartidos byte a byte | No sustituye al grafo 4.0.0 del paquete generico; seleccion por capacidad y dispositivo objetivo |
| Paquete generico de SenseVoice 4.0.0 | no disponible | grafo generico 4.0.0 | no disponible | Citado en el README como referencia no reemplazada |
| Paquete generico de SenseVoice 3.1.0 | no disponible | grafo generico 3.1.0 | no disponible | Citado en el README como referencia de hash |

Otros modelos comparables (por ejemplo, alternativas de reconocimiento de voz en dispositivo): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La ficha de HuggingFace no declara licencia. Los terminos de uso, incluido el uso comercial, estan sujetos a lo que establezcan `NOTICE.md` y `LICENSE` en el repositorio, que no se han facilitado; conviene revisarlos antes de cualquier despliegue en produccion.
- La ventana de audio es fija (aproximadamente 16 segundos). El audio mas largo debe segmentarse y ensamblarse externamente, con el consiguiente riesgo de errores en las fronteras entre segmentos.
- La instalacion del paquete no implica que el modelo este operativo: el README indica que la aplicacion es responsable de la verificacion en tiempo de ejecucion.
- La compatibilidad no se resuelve por version de paquete, sino por capacidad de modelo y dispositivo objetivo; usar la version como criterio de seleccion puede provocar fallos.
- El target esta restringido a `android-arm64-v73-qnn249`; no hay informacion sobre otros targets ni sobre portabilidad fuera de ese perfil.
- El hash del contexto HTP identifica el binario transportado, no la semantica del modelo, por lo que no debe interpretarse como una garantia de equivalencia funcional con otros grafos.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue sin verificacion previa.
- No hay benchmarks publicados: no es posible estimar la tasa de error ni comparar el rendimiento con alternativas de forma objetiva.
- No hay informacion sobre sesgos, riesgo de alucinacion en la transcripcion ni comportamiento ante ruido, acentos o audio de baja calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia externa sobre su funcionamiento en dispositivos reales.
- Los resultados de la busqueda web no aportan informacion tecnica ni enlaces relacionados con este modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/johnson-yo/termux_os-asset-sensevoice16
- Fichero de verificacion de activos: `asset.json` (dentro del repositorio)
- Terminos y atribuciones: `NOTICE.md` y `LICENSE` (dentro del repositorio)
- Termux-OS Package Registry: no se ha proporcionado la URL
- Paper, blog o repositorio adicionales: no disponibles
