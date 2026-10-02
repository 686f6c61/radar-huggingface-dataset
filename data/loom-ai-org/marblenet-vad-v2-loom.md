# loom-ai-org/marblenet-vad-v2-loom

## Resumen

MarbleNet VAD v2 es un detector de actividad de voz (VAD) a nivel de trama, desarrollado originalmente por NVIDIA dentro de la familia NeMo y exportado al formato GGUF de loom.cpp por el usuario loom-ai-org bajo el identificador loom-ai-org/marblenet-vad-v2-loom. No es un modelo generativo ni un modelo de lenguaje: recibe audio mono a 16 kHz y devuelve, para cada trama de 20 ms, una probabilidad de que esa trama contenga habla. El problema que resuelve es acotar con precision donde hay voz en una senal de audio, algo que consumen directamente los frontales de ASR, los grabadores, los sistemas de diarizacion y las tuberias de limpieza de datos de audio.

El modelo base es nvidia/frame_vad_multilingual_marblenet_v2.0 y la exportacion no modifica los pesos, solo los reempaqueta en un unico fichero GGUF autodescriptivo que incluye sus propias topologias de grafo y el driver de inferencia. Su relevancia practica esta en el tamano: con cientos de miles de parametros y un unico fichero, se puede ejecutar en CPU o en hardware muy modesto con un coste de memoria inferior al megabyte en coma flotante de 16 bits, lo que lo hace apto para integracion en dispositivos de borde y en servidores con alta concurrencia.

La version 2.0 es multilingue y declara soporte para ingles, espanol, frances, aleman, ruso y chino. La distribucion se realiza bajo la NVIDIA Open Model License Agreement, heredada del modelo base, y el runtime de referencia es loom-py-rt del proyecto loom.cpp. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarbleNet: red convolucional 1D con convoluciones separables en tiempo y canal, orientada a clasificacion de audio a nivel de trama (el detalle exacto de capas no esta disponible en la informacion proporcionada) |
| Parametros totales | 374.157 segun los metadatos de safetensors del repositorio; la model card del autor cita 91,5K parametros para el modelo original. Existe discrepancia entre ambas cifras y no se puede resolver con la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de contexto textual. La granularidad de salida es una trama de 20 ms de audio, una fila por trama, empezando en 0 s |
| Tipos de cuantizacion | No disponible. El repositorio publica un unico fichero marblenet-vad-v2.gguf sin variantes cuantizadas declaradas |
| Idiomas soportados | en, es, fr, de, ru, zh |
| Licencia | Other (NVIDIA Open Model License Agreement, heredada del modelo base) |
| Formato de pesos | GGUF (fichero marblenet-vad-v2.gguf, formato propio de loom.cpp) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia MarbleNet, una arquitectura de clasificacion de audio disenada para operar a nivel de trama con convoluciones separables en tiempo y canal, lo que reduce de forma agresiva el numero de parametros y operaciones frente a una convolucion 2D convencional. El resultado es un detector que trabaja sobre ventanas de 20 ms de audio mono muestreado a 16 kHz y emite una probabilidad independiente por ventana en lugar de una decision binaria. La model card lo describe como "family 13: audio in, a speech probability for every 20 ms frame out", una convencion de nomenclatura del runtime loom.cpp que agrupa los modelos por par de modalidades de entrada y salida.

No se dispone de informacion sobre el volumen de horas de audio empleado en el entrenamiento, la composicion del dataset, el reparto por idioma ni si hubo etapas de ajuste fino, RLHF o DPO. Al tratarse de un clasificador de audio y no de un modelo generativo, estas tecnicas no serian de aplicacion directa. La innovacion tecnica relevante de este repositorio concreto no esta en el modelo sino en el empaquetado: la exportacion mediante loom-exporter produce un unico GGUF autodescriptivo que transporta sus topologias de grafo y el script de driver embebido, de modo que el consumidor no necesita codigo especifico del modelo para ejecutarlo. Los pesos son identicos a los del modelo original de NVIDIA.

## Capacidades

- Deteccion de actividad de voz a nivel de trama con granularidad de 20 ms sobre audio mono a 16 kHz.
- Salida probabilistica por trama: expone una curva de probabilidad de habla en lugar de una etiqueta binaria, con etiquetas non_speech y speech.
- Recuperacion de la linea temporal de cada trama mediante result.times, lo que permite reconstruir segmentos de habla aplicando un umbral propio.
- Multilingue: declara soporte para ingles, espanol, frances, aleman, ruso y chino.
- Inferencia de audio completo en una sola llamada mediante la API de alto nivel model.speech2class.infer(audio).
- Acceso al driver embebido a traves de model.infer(...) y consulta de su codigo con model.driver_source, que documenta todos los argumentos aceptados.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No realiza generacion de texto, transcripcion (ASR), traduccion, diarizacion ni identificacion de hablante.
- No procesa vision ni audio multimodal: la entrada es exclusivamente forma de onda de audio.

## Casos de uso

- Front-end de ASR: colocar el detector antes de un sistema de reconocimiento de voz permite recortar los tramos sin habla y reducir el numero de tramas que el modelo acustico debe procesar. Su granularidad de 20 ms encaja con la segmentacion tipica de los sistemas de reconocimiento y el coste computacional anadido es minimo.
- Recorte automatico de grabaciones: el resultado probabilistico por trama permite construir segmentos de inicio y fin de habla con un umbral de 0,5, tal y como muestra el ejemplo de la model card. Es util para limpiar automaticamente grabaciones de reuniones, entrevistas o notas de voz antes de almacenarlas o transcribirlas.
- Control de grabacion por voz (voice activity triggered recording): un grabador o una aplicacion de notas puede activar y desactivar la captura segun la curva de probabilidad, ahorrando almacenamiento y bateria en dispositivos moviles o grabadoras dedicadas.
- Preprocesado de corpus de audio para entrenamiento: filtrar horas de audio multilingue para descartar fragmentos sin voz o con silencio prolongado antes de alimentar un pipeline de ASR o de sintesis de voz. El soporte declarado de seis idiomas reduce la necesidad de mantener varios filtros especificos por lengua.
- Diarizacion y segmentacion previa: los sistemas de diarizacion necesitan saber donde hay voz antes de asignar turnos a hablantes. Este detector aporta esa primera capa y deja abierta la politica de suavizado de onset y offset, que cada consumidor configura de forma distinta.
- Supresion de silencio en VoIP o telefonia: integrado en el cliente o en el servidor, permite dejar de transmitir paquetes cuando no hay habla, reduciendo ancho de banda. El tamano del modelo hace viable ejecutarlo en el propio dispositivo sin depender de la nube.
- Deteccion de presencia de voz en dispositivos de borde: por su huella de memoria inferior al megabyte en fp16 y la ausencia de requisitos de GPU, puede ejecutarse en microcontroladores con capacidad suficiente, en Raspberry Pi o en navegador a traves de WASM si el runtime lo permite.
- Etiquetado de grandes volumenes de audio en paralelo: al ser un modelo tan pequeno, se pueden instanciar muchas copias por GPU o por nucleo de CPU, lo que permite procesar lotes masivos de audio en pipelines offline de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio exportado no incluye metricas de precision, recall, AUC, tasa de falsos positivos ni comparaciones con otros detectores de actividad de voz, y los resultados de busqueda web obtenidos no contienen informacion tecnica relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada: practicamente despreciable. Con 374.157 parametros, los pesos ocupan aproximadamente 1,5 MB en fp32 y 0,75 MB en fp16, a los que hay que sumar el buffer de la forma de onda y las activaciones intermedias, tambien de orden muy reducido.
- GPU recomendadas: no requiere GPU. Cualquier GPU, incluida una integrada, es mas que suficiente; no tiene sentido reservar una A100 o una H100 para este modelo salvo como parte de un servidor que ya las tenga y las comparta con otras cargas.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo. El modelo cabe tambien en CPU y probablemente en plataformas embebidas, aunque no se han publicado requisitos minimos oficiales.
- Opciones de despliegue: el runtime de referencia es loom.cpp con el binding de Python loom-py-rt (pip install -U "loom-py-rt[hub]"), cargando el modelo con loom.Model.from_pretrained. El GGUF es el formato propio de loom.cpp y no se declara compatible con llama.cpp, Ollama, vLLM ni TGI, que estan orientados a modelos de lenguaje y a sus propios esquemas de GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia por trama, de factor de tiempo real ni de tramas procesadas por segundo.
- Nota sobre el repositorio: el tamano declarado del repositorio es de 0,0 GB, coherente con un fichero de pesos de menos de un megabyte.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento que permitan una comparacion cuantitativa. La tabla siguiente recoge unicamente los aspectos verificables y marca como no disponible todo aquello que no se puede confirmar.

| Modelo | Tipo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| loom-ai-org/marblenet-vad-v2-loom | VAD a nivel de trama, CNN 1D | 374.157 (metadatos safetensors) | en, es, fr, de, ru, zh | NVIDIA Open Model License | GGUF de loom.cpp | Exportacion sin modificacion del modelo base |
| nvidia/frame_vad_multilingual_marblenet_v2.0 | VAD a nivel de trama, CNN 1D | No disponible en la informacion proporcionada | en, es, fr, de, ru, zh | NVIDIA Open Model License | No disponible | Modelo base del anterior; mismos pesos |
| Silero VAD | VAD | No disponible en la informacion proporcionada | No disponible | MIT (segun documentacion publica del proyecto) | No disponible | Alternativa ampliamente usada en produccion; no se dispone de datos comparativos en esta busqueda |
| WebRTC VAD | VAD por reglas y estadisticos | No aplica (no es una red neuronal) | No disponible | BSD-3 (segun documentacion publica del proyecto) | No disponible | Referencia clasica de baja latencia; el comportamiento difiere del de un detector neuronal |

No se dispone de comparaciones de precision, latencia o consumo entre estas opciones dentro de la informacion consultada.

## Limitaciones y advertencias

- La salida es una probabilidad por trama, no una decision. El umbral (la model card propone 0,5 como ejemplo) y el suavizado temporal quedan enteramente en manos del consumidor, y cada aplicacion necesita un comportamiento distinto de onset y offset.
- El audio debe ser mono a 16 kHz. No se documenta comportamiento para otras frecuencias de muestreo, audio estereo ni remuestreo automatico; habra que remuestrear y mezclar canales aguas arriba.
- La granularidad es fija: una fila por cada 20 ms de entrada. No se puede pedir una resolucion temporal distinta al modelo.
- No se han publicado benchmarks ni evaluaciones de precision en la informacion disponible, por lo que no hay evidencia publica sobre tasas de falsos positivos y falsos negativos en condiciones reales.
- Riesgo de sesgo no documentado: no se especifica la distribucion del dataset de entrenamiento por idioma, acento, genero, edad ni dominio acustico, por lo que el rendimiento puede degradarse en variedades poco representadas.
- El riesgo de alucinacion, en el sentido generativo, no aplica, pero si existe el riesgo analogo de clasificar como habla tramas que contienen ruido, musica o habla de fondo, algo especialmente relevante para frontales de ASR.
- El modelo no identifica hablantes, no transcribe y no distingue voz humana de voz sintetica o reproducida. No debe usarse para tareas para las que no fue disenado.
- Licencia other: se hereda la NVIDIA Open Model License Agreement. Es imprescindible leer el texto completo de la licencia antes de distribuir el modelo o integrarlo en un producto comercial, ya que impone condiciones especificas que no se detallan en el repositorio.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni historial de uso en produccion.
- Discrepancia en el recuento de parametros entre los metadatos del repositorio (374.157) y la model card (91,5K). Conviene verificar el dato con la herramienta de inspeccion del propio runtime antes de dimensionar infraestructura o emitir afirmaciones de rendimiento.
- El formato GGUF es el de loom.cpp, no el estandar de llama.cpp. No es probable que funcione con herramientas del ecosistema llama.cpp, Ollama o vLLM sin conversion adicional, y no se documenta ninguna ruta de conversion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/loom-ai-org/marblenet-vad-v2-loom
- Modelo base: https://huggingface.co/nvidia/frame_vad_multilingual_marblenet_v2.0
- Runtime loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Binding de Python loom-py: https://github.com/loom-ai-org/loom-py
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Licencia NVIDIA Open Model License Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo. Los resultados devueltos corresponden a productos sin relacion tecnica con este repositorio (un servicio de grabacion de pantalla y una marca de ropa con el mismo nombre).
