# aoiandroid/whisper-tiny

## Resumen

`aoiandroid/whisper-tiny` es un espejo sin modificaciones de `openai/whisper-tiny`, fijado al commit `169d4a4341b33bc18d8881c4b69c2e104e1cc0af`. No aporta pesos nuevos ni ajustes: reproduce un subconjunto de ficheros del repositorio original (10 ficheros, 4,4 MB) con las mismas rutas, tamanos y hashes, para que la aplicacion Cription no dependa de un repositorio de terceros. El modelo subyacente es el modelo de reconocimiento automatico de voz (ASR) mas pequeno de la familia Whisper de OpenAI, con 39 M de parametros y arquitectura transformer encoder-decoder.

Su relevancia practica es la del propio Whisper tiny: transcripcion y traduccion de voz a texto con un coste computacional minimo, ejecutable en CPU y en dispositivos con menos de 1 GB de memoria disponible. Es la opcion habitual cuando se prioriza latencia y consumo sobre precision, o cuando se necesita un componente ASR embebido en una aplicacion de escritorio o movil.

El valor anadido de este repositorio concreto es la reproducibilidad (commit fijado, contenido verificado por hash) y la licencia Apache-2.0 heredada del original. Como contrapartida, el repositorio no declara pipeline, idiomas ni pesos completos, y no ha recibido descargas ni likes, por lo que su uso en produccion exige verificar antes el contenido real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR, del modelo original `openai/whisper-tiny` |
| Parametros totales | 39 M (dato del modelo original) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio fija de 30 s; 1500 posiciones de encoder y 448 posiciones de texto en el decoder (modelo original) |
| Tipos de cuantizacion | No declarados en el repositorio. El ecosistema del modelo original admite FP32, FP16, int8 (CTranslate2/faster-whisper) y GGUF (q5_0, q8_0 y similares en whisper.cpp) |
| Idiomas soportados | No disponible en el repositorio. El modelo original multilingue cubre transcripcion en ~99 idiomas y traduccion a ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible. El repositorio declara 10 ficheros y 4,4 MB, un tamano muy inferior al de los pesos completos, sin especificar formato |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo original, ya que este repositorio es una copia sin cambios. Se trata de un transformer encoder-decoder: el encoder consume un espectrograma mel de 80 canales calculado sobre ventanas de 30 segundos y lo proyecta a 1500 posiciones, y el decoder genera texto de forma autorregresiva con un vocabulario multitarea que codifica idioma, tarea (transcribir o traducir) y marcas de tiempo. Whisper tiny usa 4 capas de encoder y 4 de decoder, anchura de 384 y 6 cabezas de atencion, lo que suma 39 M de parametros.

El entrenamiento del modelo original, documentado por OpenAI, se basa en 680.000 horas de audio debilmente supervisado procedente de internet, sin ajuste fino supervisado sobre corpus de ASR convencionales. Ese enfoque favorece la robustez ante dominios variados, acentos y ruido, a costa de una mayor tasa de error en comparacion con modelos mas grandes de la misma familia. El repositorio no aporta informacion sobre RLHF, DPO ni tecnicas de decodificacion especulativa; tampoco documenta proceso de entrenamiento propio, porque no lo hay.

## Capacidades

- Transcripcion de voz a texto en la version multilingue del modelo original, con deteccion automatica del idioma de entrada.
- Traduccion directa de audio en otros idiomas a texto en ingles (tarea `translate` de Whisper).
- Generacion de marcas de tiempo a nivel de segmento, utiles para subtitulos, aunque poco precisas sin alineacion forzada adicional.
- Robustez razonable ante ruido de fondo y audio de dominio abierto, resultado del entrenamiento con datos debilmente supervisados.
- Procesamiento por lotes de segmentos de hasta 30 segundos, con posibilidad de encadenar ventanas para audio largo desde el codigo de aplicacion.
- Ejecucion en CPU sin GPU, con requisitos de memoria inferiores a 1 GB en cuantizacion int8.
- Integracion con el ecosistema de Whisper: `transformers`, `faster-whisper`, `whisper.cpp`, ONNX Runtime y librerias de alineacion como WhisperX.
- No soporta tool calling, function calling, agentes, vision ni audio en streaming nativo. Tampoco realiza diarizacion de hablantes.

## Casos de uso

- Transcripcion embebida en aplicaciones de escritorio y moviles: el modelo cabe en memoria en cuantizacion int8 y se ejecuta en CPU, por lo que puede integrarse como componente local de una app sin depender de una API externa, que es precisamente el escenario que declara el repositorio.
- Generacion de subtitulos para video corto: procesando el audio en ventanas de 30 segundos y reconstruyendo las marcas de tiempo, sirve para producir ficheros SRT en herramientas de edicion o pipelines de publicacion.
- Dictado y toma de notas offline: en entornos sin conectividad o con requisitos de privacidad, el modelo permite transcribir voz a texto sin enviar audio a servidores de terceros.
- Comandos de voz en asistentes locales: para vocabularios cerrados y frases cortas, la tasa de error es suficiente para disparar acciones en domotica, automatizacion de escritorio o control de aplicaciones.
- Prefiltrado en pipelines de audio a gran escala: transcribir primero con tiny para clasificar, indexar o descartar contenido y reservar un modelo mayor (medium o large) solo para los segmentos que lo requieran reduce el coste total de computo.
- Indexado y busqueda de archivos de audio: convertir grabaciones, reuniones o podcasts a texto para permitir busqueda por palabras clave en un catalogo, asumiendo que la transcripcion se usara como indice y no como acta literal.
- Prototipado y validacion de pipelines ASR: sirve para medir latencia, disenar la segmentacion con VAD y probar el formato de salida antes de escalar a un modelo de mayor tamano con los mismos codigos de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo y no incluye ninguna tabla de evaluacion, y la busqueda web realizada no devolvio resultados tecnicos utilizables sobre este modelo.

## Requisitos de hardware

- VRAM estimada en inferencia: menos de 1 GB en cualquier precision. Aproximadamente 160 MB de pesos en FP32, 80 MB en FP16 y 40 MB en int8 para los 39 M de parametros, mas el coste de activaciones y del espectrograma mel.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente; una RTX 3060, RTX 4090, A100 o H100 infrautilizan por completo el modelo. Para produccion a gran escala, el cuello de botella es la E/S de audio y el preprocesado, no la GPU.
- GPU de consumo: si, cabe en cualquier GPU de consumo de los ultimos diez anos, e incluso en aceleradores integrados. Tambien es viable en CPU y en placas tipo Raspberry Pi con cuantizacion agresiva.
- Opciones de despliegue: `transformers` con la pipeline de ASR, `faster-whisper` sobre CTranslate2, `whisper.cpp` para CPU y Apple Silicon, ONNX Runtime, y WhisperX si se necesita alineacion temporal precisa. TGI y vLLM no estan orientados a este tipo de modelo.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia orientativa del modelo original, la variante tiny esta disenada para funcionar mas rapido que el tiempo real en CPU moderna y con un margen amplio en GPU, pero no se dispone de cifras verificadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aoiandroid/whisper-tiny (este repositorio) | 39 M | 30 s | No declarados | Apache-2.0 | HuggingFace, 0 descargas |
| openai/whisper-tiny | 39 M | 30 s | ~99 (transcripcion) + traduccion a ingles | Apache-2.0 | HuggingFace, repositorio oficial |
| openai/whisper-base | 74 M | 30 s | ~99 (transcripcion) + traduccion a ingles | Apache-2.0 | HuggingFace, repositorio oficial |
| openai/whisper-small | 244 M | 30 s | ~99 (transcripcion) + traduccion a ingles | Apache-2.0 | HuggingFace, repositorio oficial |

Los datos de parametros, ventana e idiomas de las tres alternativas corresponden a la documentacion publica de OpenAI. El contenido de este repositorio es identico al de `openai/whisper-tiny` en el commit indicado, por lo que la comparacion relevante es frente a los modelos de mayor tamano de la misma familia: base y small ofrecen menor tasa de error a cambio de mas memoria y mas latencia.

## Limitaciones y advertencias

- Este repositorio es un espejo, no un modelo nuevo. No hay entrenamiento, ajuste ni mejora sobre el original; cualquier problema de calidad es atribuible a `openai/whisper-tiny`.
- El repositorio declara 10 ficheros y 4,4 MB, un tamano muy inferior al de los pesos completos en FP32. Es necesario verificar el contenido real antes de usarlo en produccion, ya que podria no incluir todos los ficheros necesarios para la inferencia.
- Sin mantenimiento ni garantias: 0 descargas y 0 likes, y el autor no ofrece soporte. Las fechas de creacion y actualizacion declaradas (2026-10-10) resultan anomalas.
- Precision limitada por el tamano: con 39 M de parametros, la tasa de error es notablemente superior a la de base, small o medium, especialmente con ruido, solapamiento de hablantes, acentos marcados, terminologia tecnica y nombres propios.
- Riesgo alto de alucinacion en silencios, musica o ruido: Whisper puede generar frases repetidas o texto inventado en segmentos sin habla. Es imprescindible aplicar deteccion de actividad de voz (VAD) y filtrar salidas vacias o degeneradas.
- Ventana fija de 30 segundos: el audio mas largo requiere segmentacion externa, con el riesgo de cortar palabras en los limites si no se solapan las ventanas.
- Sin diarizacion ni marcas de tiempo fiables a nivel de palabra: para subtitulado profesional hay que anadir alineacion forzada con herramientas externas.
- Cobertura linguistica desigual: el modelo original rinde peor en idiomas con pocos datos de entrenamiento; el repositorio ademas no declara idiomas soportados.
- Licencia Apache-2.0, que permite uso comercial y modificacion, pero el espejo no anade ninguna garantia juridica adicional sobre el modelo original. Se recomienda conservar la atribucion a OpenAI.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos datos verificables son los de la model card del repositorio y los del modelo original.

## Enlaces

- Repositorio del espejo: https://huggingface.co/aoiandroid/whisper-tiny
- Modelo original: https://huggingface.co/openai/whisper-tiny
- Commit exacto espejado: https://huggingface.co/openai/whisper-tiny/tree/169d4a4341b33bc18d8881c4b69c2e104e1cc0af
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI: https://github.com/openai/whisper
- Implementacion en C/C++ para CPU: https://github.com/ggerganov/whisper.cpp
- Implementacion con CTranslate2: https://github.com/SYSTRAN/faster-whisper
- Alineacion temporal y diarizacion: https://github.com/m-bain/whisperX

Nota: la busqueda web asociada a esta ficha no devolvio enlaces tecnicos relevantes; los enlaces anteriores corresponden al modelo original y a su ecosistema, no a este repositorio espejo.
