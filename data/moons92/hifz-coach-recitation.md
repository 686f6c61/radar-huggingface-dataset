# Moons92/hifz-coach-recitation

## Resumen

`Moons92/hifz-coach-recitation` es un modelo de reconocimiento automatico del habla (ASR) especializado en recitacion del Coran en arabe. No es un modelo entrenado desde cero: es una redistribucion sin modificaciones del resultado de afinar el checkpoint arabe de NVIDIA FastConformer para recitacion coranica, exportarlo a ONNX y cuantizarlo a int4/int8. El repositorio lo publica el autor Moons92 para alimentar el coach de recitacion de HIFZ, una aplicacion gratuita de ayuda a la memorizacion del Coran.

La relevancia del modelo esta en su formato de despliegue, no en su arquitectura: se ejecuta integramente en el dispositivo del usuario dentro del navegador mediante `onnxruntime-web` sobre WASM, de modo que el audio de la recitacion nunca se envia a un servidor. Combina el preprocesado mel dentro del propio grafo ONNX y una salida CTC sobre un vocabulario de 1025 tokens BPE arabigos, con un unico fichero de 88 MB.

Su alcance funcional es deliberadamente estrecho. El sistema que lo consume decodifica la salida de forma voraz, sin recalar el resultado sobre el texto coranico, y compara las palabras detectadas con los versiculos esperados para detectar un versiculo omitido. No evalua tajwid ni pronunciacion, y no realiza generacion de texto, tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (familia Conformer, con submuestreo convolucional), derivada de un checkpoint hibrido CTC/RNNT y exportada como CTC puro en ONNX |
| Parametros totales | no disponible (el repositorio no publica el recuento; procede de un checkpoint NVIDIA FastConformer de tamano "large") |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es audio mono a 16 kHz de longitud variable (`audio_signal` float32 `[1, N]`, con `length` int64 `[1]` igual a N) |
| Tipos de cuantizacion | int4 e int8 |
| Idiomas soportados | arabe (ar), con especializacion en recitacion coranica |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`fastconformer_full_mixed.onnx`, 88 MB) mas `vocab.json` |
| Vocabulario | 1025 tokens BPE arabigos; el token en blanco de CTC es el identificador 1024 |
| Entrada | `audio_signal` float32 `[1, N]` mono a 16 kHz; `length` int64 `[1]` |
| Salida | log-probabilidades `[1, T, 1025]`; el preprocesado mel esta incluido en el grafo |
| Tamano del repositorio | 0,1 GB |
| Huella SHA-256 | `4767182cd92975869f81a7e32700b14ca2b04e8dc97a15ff220a8697f4639488` |

## Arquitectura y entrenamiento

La base es una red FastConformer, variante de Conformer que aplica submuestreo convolucional para reducir la longitud de la secuencia antes del codificador. El checkpoint original de NVIDIA es hibrido CTC/RNNT; la version distribuida aqui conserva unicamente la cabeza CTC, ya que es la que se exporta a ONNX. El grafo incluye el calculo de caracteristicas mel, de modo que el consumidor solo debe entregar muestras PCM mono a 16 kHz. La salida son log-probabilidades por fotograma sobre 1025 tokens BPE arabigos.

El proceso tiene tres etapas documentadas por el propio autor: el modelo base arabe de NVIDIA (`nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0`, licencia CC-BY-4.0), un afinado especifico para recitacion coranica realizado por Cyberistic bajo el identificador `c2c-direct-mixed-tta`, y la exportacion a ONNX con cuantizacion int4/int8 llevada a cabo por el proyecto Tilawa en su version v0.2.0. El repositorio no detalla el volumen de tokens de audio, la composicion del conjunto de datos, ni si se aplicaron tecnicas de RLHF o DPO; para un modelo CTC de reconocimiento de voz esos mecanismos no son el procedimiento habitual. Tampoco se documentan innovaciones de decodificacion: el consumidor aplica decodificacion voraz CTC sin recalar sobre el texto coranico.

## Capacidades

- Reconocimiento de voz en arabe sobre audio mono a 16 kHz, orientado a recitacion coranica.
- Decodificacion CTC voraz: la salida son log-probabilidades que el consumidor convierte en texto con un unico paso de argmax.
- Inferencia integra en el navegador mediante `onnxruntime-web` sobre WASM, sin envio de audio a servidores externos.
- Deteccion de versiculos omitidos: al comparar las palabras reconocidas con los versiculos esperados, la aplicacion que lo integra puede avisar de un salto en la recitacion.
- Funcionamiento sin conexion una vez descargado el fichero, con verificacion de integridad por SHA-256 antes de su uso.
- No dispone de tool calling ni de function calling.
- No dispone de modo agente ni de razonamiento multi-paso.
- No dispone de generacion de texto, codigo, matematicas, vision ni audio.
- No evalua tajwid ni correccion de pronunciacion; solo transcribe lo que reconoce.
- Capacidad multilingue nula: unicamente arabe, y en el dominio concreto de la recitacion coranica.

## Casos de uso

- Coach de memorizacion del Coran en el navegador: la aplicacion HIFZ descarga el fichero ONNX y ejecuta la inferencia en el propio dispositivo con `onnxruntime-web`, de modo que la recitacion del usuario no sale de su equipo y puede practicarse sin conexion.
- Deteccion de versiculos saltados durante la recitacion: el sistema decodifica el audio, compara las palabras reconocidas con los versiculos de la sura esperada y avisa cuando el recitador omite un fragmento, util para el repaso de hifz.
- Aplicaciones educativas de bajo coste en centros de ensenanza: al no requerir GPU ni servidor de inferencia, el modelo puede distribuirse como parte de una aplicacion web estatica utilizada en aulas con equipos modestos.
- Seguimiento de la practica diaria de memorizacion: una aplicacion movil o PWA puede registrar que versiculos se han recitado correctamente en cada sesion, usando la transcripcion como senal de progreso sin almacenar audio.
- Verificacion de integridad de la distribucion del modelo: el hash SHA-256 publicado permite que cualquier integrador compruebe que el fichero descargado es exactamente el que el autor valido, un requisito habitual en despliegues educativos gestionados de forma centralizada.
- Investigacion en ASR de arabe clasico y coranico: el modelo sirve como punto de partida o referencia para experimentos de reconocimiento de habla en registro coranico y para comparar estrategias de cuantizacion int4/int8 en arquitecturas FastConformer.
- Prototipado de interfaces de voz accesibles: al ejecutarse en CPU dentro del navegador, permite construir demos de interaccion por voz en arabe sin infraestructura de servidor, con la limitacion de que el dominio queda restringido a la recitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, CER ni comparaciones cuantitativas, y la busqueda web realizada no devolvio resultados relevantes: los enlaces obtenidos tratan sobre el uso del punto y aparte en ingles y no guardan relacion con este modelo. Tampoco se documenta el factor de tiempo real (RTF) ni la latencia de la inferencia en el navegador.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU, no en GPU. No se publican cifras oficiales de memoria.
- Memoria RAM: no hay cifras oficiales. A partir del tamano del fichero cuantizado (88 MB) y del hecho de que la aplicacion lo ejecuta en WASM dentro del navegador, cabe esperar una huella de memoria reducida, del orden de varios cientos de megabytes incluyendo el entorno de ejecucion; se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: no aplica. No se documenta soporte de aceleracion por GPU para este despliegue.
- GPU de consumo: irrelevante; el modelo no necesita GPU y esta disenado para funcionar en CPU de portatiles, equipos de sobremesa y telefonos moviles modernos.
- Opciones de despliegue documentadas: `onnxruntime-web` con backend WASM en el navegador. Al ser un grafo ONNX, es tecnicamente ejecutable con otras distribuciones de ONNX Runtime (Python, C++, movil), aunque el repositorio no lo documenta.
- Otras opciones de despliegue: no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI; estos entornos no cubren de forma nativa arquitecturas FastConformer con cabeza CTC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moons92/hifz-coach-recitation | no disponible (derivado de FastConformer large) | Audio mono 16 kHz, longitud variable | Sin benchmarks publicados | CC-BY-4.0 | ONNX cuantizado int4/int8, 88 MB |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | no disponible en la informacion | Audio mono 16 kHz | Sin datos en la informacion proporcionada | CC-BY-4.0 | Checkpoint NVIDIA en formato NeMo |
| openai/whisper-large-v3 | 1.550 M (dato de referencia externo, no verificado en la busqueda) | Ventanas de audio de 30 s, multilingue | Sin datos en la informacion proporcionada | MIT | Pesos safetensors y multiples formatos derivados |

La comparacion con Whisper se incluye por categoria funcional (ASR multilingue de gran tamano), no porque existan datos comparativos publicados. Las diferencias relevantes frente a las alternativas son el caracter monoidioma del modelo de HIFZ, su especializacion en registro coranico y su empaquetado ONNX cuantizado orientado a ejecucion en navegador.

## Limitaciones y advertencias

- No evalua tajwid ni pronunciacion: el propio autor lo indica de forma explicita. Solo transcribe y permite detectar omisiones de versiculos.
- Decodificacion sin recalar: el texto reconocido no se alinea con el texto coranico, por lo que pueden aparecer palabras erroneas o fragmentadas que el consumidor debe gestionar.
- Dominio muy restringido: el afinado esta orientado a recitacion coranica. El comportamiento fuera de ese dominio (arabe dialectal, conversacion, lectura general) no esta documentado y previsiblemente sera peor.
- Unico idioma: solo arabe. No hay soporte de castellano ni de ninguna otra lengua.
- Riesgo de alucinacion: como todo modelo CTC, puede producir secuencias plausibles en segmentos con ruido, silencio o audio degradado; la decodificacion voraz no filtra estos casos.
- Perdida de la rama RNNT: el checkpoint original de NVIDIA es hibrido CTC/RNNT y esta version exporta solo la cabeza CTC, lo que puede reducir la precision respecto al modelo base completo.
- Cuantizacion agresiva: la exportacion incluye variantes int4 e int8, que tipicamente degradan ligeramente la calidad de transcripcion frente a precision completa. No se publican mediciones de esa perdida.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir correctamente. Hay que citar al menos a NVIDIA (modelo base), a Cyberistic (afinado), al proyecto Tilawa (exportacion y cuantizacion) y al repositorio de distribucion.
- Modelo redistribuido, no creado por el autor del repositorio: el mantenimiento y las correcciones dependen de terceros.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 me gusta, por lo que no existe evidencia externa de calidad ni de comportamiento en produccion.
- Verificacion manual del hash: la integridad del fichero depende de que el integrador compruebe el SHA-256 publicado; el repositorio no incluye mecanismos automaticos de firma.
- Sin cifras de rendimiento: al no haber benchmarks publicados, cualquier decision de despliegue en produccion deberia acompanarse de una evaluacion propia sobre el corpus de recitacion previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Moons92/hifz-coach-recitation
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Proyecto Tilawa (exportacion ONNX y cuantizacion, v0.2.0): https://github.com/yazinsai/tilawa
- Aplicacion HIFZ: https://hifz-coran.netlify.app
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido generico sobre el punto y aparte en ingles), por lo que no se aportan enlaces adicionales de papers, blogs o demos.
