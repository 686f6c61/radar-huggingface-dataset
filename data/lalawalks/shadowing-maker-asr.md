# lalawalks/shadowing-maker-asr

## Resumen

`lalawalks/shadowing-maker-asr` es un paquete de reconocimiento automatico del habla (ASR) en formato ONNX publicado por el desarrollador LALAWalks para su aplicacion movil de aprendizaje de ingles por escucha, Shadowing Maker (쉐도잉메이커). No es un modelo entrenado por el autor: es una copia de redistribucion del modelo SenseVoice Small de FunAudioLLM, ya convertido a ONNX por el proyecto sherpa-onnx, acompanada de su diccionario de tokens (`tokens.txt`) y del detector de actividad de voz silero-vad. El objetivo declarado en la model card es disponer de una copia local para que la aplicacion no dependa de un unico repositorio de origen.

El paquete cubre cinco idiomas (ingles, coreano, japones, chino mandarin y cantonés) con un unico fichero `model.int8.onnx` cuantizado a 8 bits, lo que permite ejecutar la transcripcion en el propio telefono, sin conexion y sin GPU. Su relevancia practica esta en ese perfil: ASR multilingue de tamano reducido, licencia Apache-2.0 y un formato orientado a inferencia en el borde.

Conviene tener presente que el repositorio no documenta entrenamiento, numero de parametros ni resultados de evaluacion: es una distribucion de artefactos. El repositorio ocupa 0,2 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice Small (ASR end-to-end de FunAudioLLM) convertido a ONNX; la model card de este repositorio no detalla la arquitectura interna |
| Parametros totales | no disponible (el repositorio ocupa 0,2 GB entre modelo int8, diccionario y VAD) |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de contexto textual; la segmentacion del audio la realiza el componente VAD) |
| Tipos de cuantizacion | int8 (fichero `model.int8.onnx`); no se distribuyen otras precisiones en este repositorio |
| Idiomas soportados | ingles (en), coreano (ko), japones (ja), chino mandarin (zh), cantonés (yue) |
| Licencia | Apache-2.0 para el paquete; el componente `silero_vad.onnx` procede de silero-vad, bajo licencia MIT |
| Formato de pesos | ONNX (`model.int8.onnx`, `silero_vad.onnx`) mas `tokens.txt` |

## Arquitectura y entrenamiento

El repositorio no describe ningun proceso de entrenamiento propio ni aporta datos sobre el corpus utilizado. Lo que contiene es una conversion ya realizada por el proyecto sherpa-onnx del modelo SenseVoice Small de FunAudioLLM, redistribuida sin modificaciones segun indica el autor ("원본을 그대로 옮겨 둔 것이며 고치지 않았습니다", es decir, se ha copiado el original sin cambios). Por tanto, cualquier detalle sobre arquitectura interna, composicion del dataset, numero de horas de audio o tecnicas de ajuste (RLHF, DPO u otras) debe consultarse en el repositorio del modelo original, no aqui.

Junto al modelo acustico se incluye `silero_vad.onnx`, un detector de actividad de voz (VAD) de terceros que segmenta el audio en tramos con habla antes de pasarlos al reconocedor. En un flujo de subtitulado movil este componente cumple una funcion practica importante: evita enviar silencio o ruido al modelo acustico, lo que reduce tanto el coste de computo como el riesgo de transcripciones espurias en tramos sin voz. No se documentan innovaciones tecnicas adicionales en esta distribucion.

## Capacidades

- Reconocimiento automatico del habla multilingue en cinco idiomas: ingles, coreano, japones, chino mandarin y cantonés.
- Ejecucion totalmente offline: la aplicacion descarga el modelo una vez y despues no necesita conexion a internet.
- Inferencia en CPU sobre ONNX Runtime, sin requisito de GPU.
- Deteccion de actividad de voz integrada mediante `silero_vad.onnx`, util para segmentar audio largo o con pausas.
- Generacion de subtitulos en el dispositivo, que es el caso de uso declarado por el autor en la app Shadowing Maker.
- Reproduccion determinista y ligera, adecuada para telefonos y equipos de bajos recursos.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta uso como agente ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo, diarizacion de hablantes, traduccion automatica ni deteccion de emociones o eventos sonoros en esta distribucion.

## Casos de uso

- Subtitulado offline en aplicaciones moviles: es el escenario para el que se publico el paquete. La app descarga `model.int8.onnx` y `silero_vad.onnx` una vez y genera subtitulos localmente, sin enviar el audio de usuario a ningun servidor.
- Aprendizaje de idiomas por shadowing: un alumno puede grabar su propia voz y obtener la transcripcion al instante para compararla con el texto de referencia, con coste cero de API y sin salida de datos del dispositivo.
- Transcripcion por lotes en servidores sin GPU: al ser un modelo ONNX int8, se puede ejecutar en instancias CPU baratas para procesar archivos de audio en segundo plano.
- Indexacion y busqueda de contenido hablado: convertir archivos de audio o video a texto para construir indices de busqueda interna en cinco idiomas, incluidos contenidos en coreano o cantonés poco cubiertos por otras alternativas.
- Generacion de subtitulos para video bajo restricciones de privacidad: estudios y redacciones que no pueden subir material a servicios en la nube pueden desplegar el modelo on-premise manteniendo los ficheros en su propia infraestructura.
- Notas de voz y dictado: transcripcion de grabaciones de reuniones o apuntes personales en dispositivos de bajos recursos, apoyandose en el VAD para trocear el audio en fragmentos con habla.
- Aplicaciones de borde e IoT: al no requerir GPU ni conexion, encaja en dispositivos empotrados o kioscos donde la transcripcion debe resolverse localmente y con latencia acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de WER, CER ni comparaciones con otros modelos, y los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre este modelo (los enlaces devueltos pertenecen a foros de videojuegos y no guardan relacion con el paquete).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecutarse en CPU, por lo que no se documentan requisitos de memoria de GPU.
- GPU recomendadas: no aplica en el escenario previsto. Podria ejecutarse sobre ONNX Runtime con CUDA en cualquier GPU compatible, pero no hay datos que indiquen una ventaja relevante para un modelo de este tamano.
- Compatibilidad con GPU de consumo: el modelo no necesita GPU; con el fichero int8 de 0,2 GB de repositorio completo esta pensado para telefonos y portatiles con CPU moderna.
- Memoria en dispositivo: la model card no publica cifras de RAM necesaria; el peso principal es `model.int8.onnx`, mas el VAD y el diccionario de tokens.
- Opciones de despliegue: sherpa-onnx (con bindings para C++, Python, Kotlin/Android, Swift/iOS, C#, Go, Rust, WebAssembly y Node.js) y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de la tabla proceden de la model card de este repositorio y de la documentacion publica de cada proyecto; no han sido verificados en el marco de esta ficha. Los valores no disponibles se indican como tales.

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `lalawalks/shadowing-maker-asr` | no disponible | en, ko, ja, zh, yue | ONNX int8 | Apache-2.0 (VAD bajo MIT) | Redistribucion con VAD incluido; 0,2 GB; sin benchmarks publicados |
| `FunAudioLLM/SenseVoiceSmall` | no disponible en la model card consultada | en, ko, ja, zh, yue | PyTorch y ONNX | Apache-2.0 | Modelo original del que procede la conversion; fuente de referencia para arquitectura y evaluacion |
| OpenAI Whisper (variantes pequenas) | no disponible | multilingue (docenas de idiomas) | safetensors, GGUF, ONNX y otros | MIT | Referencia habitual en ASR multilingue; requiere conversion adicional para sherpa-onnx |
| Vosk | modelos de tamano reducido | varios idiomas | ONNX y Kaldi | Apache-2.0 | Alternativa clasica de ASR offline en CPU; cobertura de idiomas distinta |

## Limitaciones y advertencias

- No es un modelo original: el autor declara que es una copia sin modificar de artefactos de terceros, por lo que no existe informacion propia sobre entrenamiento, datos o evaluacion.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de redactar la ficha, lo que implica ausencia de validacion por parte de la comunidad.
- La cuantizacion int8 reduce el tamano y el coste de computo, pero puede degradar la precision respecto a los pesos originales en precision completa; no se publican comparativas que cuantifiquen esa perdida.
- No hay datos de WER ni de CER, ni en la model card ni en los resultados de busqueda, por lo que no es posible estimar la calidad de transcripcion antes de desplegarlo.
- Cobertura limitada a cinco idiomas. No se documenta el comportamiento con cambio de idioma dentro de una misma frase ni con variedades dialectales distintas de las indicadas; el cantonés (yue) y el mandarin (zh) comparten escritura, lo que puede generar ambiguedad si el audio no esta claramente segmentado.
- Riesgo de alucinacion inherente a los sistemas ASR: en tramos con ruido, musica o habla solapada el modelo puede generar texto que no corresponde al audio. El VAD incluido mitiga, pero no elimina, este problema.
- Solo ASR: no incluye traduccion, diarizacion de hablantes, deteccion de emociones ni etiquetado de eventos sonoros en esta distribucion.
- La model card no especifica si la salida incluye marcas de tiempo por palabra o por segmento, un dato critico si se va a usar para generar subtitulos sincronizados.
- Licencia Apache-2.0 para el paquete y MIT para silero-vad; ambas permiten uso comercial, pero al tratarse de una redistribucion conviene revisar los terminos de los proyectos de origen antes de integrarlo en un producto.
- El repositorio se creo el 2026-09-10 y su contenido no ha sido actualizado; no hay garantia de mantenimiento ni de acompanamiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lalawalks/shadowing-maker-asr
- Modelo original SenseVoice Small (FunAudioLLM): https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Proyecto de conversion e inferencia sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Detector de voz silero-vad: https://github.com/snakers4/silero-vad
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
