# CarinhadoJava/slyce-whisper-models

## Resumen

Este repositorio, publicado por el usuario CarinhadoJava bajo el identificador `CarinhadoJava/slyce-whisper-models`, no contiene un modelo entrenado desde cero, sino un conjunto de exportaciones a ONNX de los modelos OpenAI Whisper en sus variantes tiny, base, small y turbo, generadas con el script `export-onnx-with-attention.py` del proyecto sherpa-onnx y cuantizadas a int8. El valor anadido respecto a otras exportaciones es que la salida incluye los pesos de atencion cruzada (`cross_attention_weights`), lo que permite calcular marcas temporales a nivel de palabra mediante alineamiento DTW.

Whisper es un modelo de reconocimiento automatico del habla (ASR) de tipo transformer encoder-decoder, disenado para transcripcion multilingue, traduccion de voz a texto e identificacion de idioma. Este repositorio empaqueta esas capacidades en el formato ONNX (IR 7, opset 13), compatible con ONNX Runtime igual o superior a 1.17, lo que lo hace util para despliegues en CPU, dispositivos moviles y sistemas embebidos a traves del ecosistema sherpa-onnx.

Su relevancia practica radica en el formato y el tamano: al estar cuantizado a int8 y exportado a ONNX, permite ejecutar reconocimiento de voz sin GPU y con un consumo de memoria muy reducido, algo critico para aplicaciones on-device. El repositorio ocupa 1,7 GB y tiene cero descargas y cero likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (OpenAI Whisper), exportado a ONNX |
| Parametros totales | Aproximadamente 39 M (tiny), 74 M (base), 244 M (small) y 809 M (turbo), segun la variante incluida; cifras correspondientes a los pesos originales de OpenAI Whisper, no detalladas en la model card del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s (1500 fotogramas de mel-espectrograma); sin memoria entre segmentos |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | No disponible en la model card; depende de la variante de Whisper original utilizada |
| Licencia | MIT |
| Formato de pesos | ONNX (IR 7, opset 13), cuantizado a int8 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que consume un mel-espectrograma de 80 canales calculado sobre ventanas de 30 segundos. El encoder procesa la representacion acustica y el decoder genera tokens de texto de forma autoregresiva, con tokens especiales para idioma, tarea (transcripcion o traduccion) y marcas temporales. Este repositorio no reentrena el modelo, sino que parte de los pesos publicados por OpenAI y los exporta a ONNX anadiendo la salida de atencion cruzada, que habilita la extraccion de timestamps por palabra mediante DTW en lugar de depender unicamente de los tokens de tiempo del decoder.

Como innovacion tecnica concreta, la exportacion con atencion cruzada (script `export-onnx-with-attention.py` de sherpa-onnx, Apache-2.0) permite alinear cada token del texto con su fragmento de audio, lo que mejora la precision de los subtitulos a nivel de palabra. La cuantizacion a int8 reduce el peso y acelera la inferencia en CPU. La model card no detalla el numero de tokens, la composicion del dataset de entrenamiento, ni si hubo fases de RLHF o DPO; esa informacion pertenece a los pesos originales de OpenAI y no se reproduce en este repositorio.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio de hasta 30 segundos por segmento.
- Transcripcion multilingue y traduccion de voz a texto en ingles, segun la variante de Whisper empleada.
- Identificacion automatica de idioma, heredada de los tokens especiales de Whisper.
- Marcas temporales a nivel de palabra mediante los pesos de atencion cruzada y post-procesado DTW.
- Inferencia en CPU y en dispositivos de borde gracias al formato ONNX int8.
- Compatibilidad con el ecosistema sherpa-onnx, que ofrece bindings para Python, C++, C#, Java, Kotlin, Swift, Go, Node.js, Android, iOS, Raspberry Pi y WebAssembly.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, ya que se trata de un modelo puramente de audio a texto.

## Casos de uso

- Subtitulado con marcas temporales por palabra: la salida de atencion cruzada permite generar subtitulos tipo karaoke o resaltado palabra a palabra, util en plataformas de video y herramientas de accesibilidad.
- Asistentes de voz on-device: integrado via sherpa-onnx en aplicaciones Android o iOS, permite transcribir comandos de voz sin enviar audio a la nube, lo que reduce latencia y mejora la privacidad.
- Transcripcion en sistemas embebidos: las variantes tiny y base cuantizadas caben en dispositivos con recursos limitados como Raspberry Pi, habilitando transcripcion local en kioscos, electrodomesticos o hardware industrial.
- Generacion de actas de reuniones: con troceado previo del audio en segmentos de 30 segundos, se puede transcribir una reunion completa y usar los timestamps para vincular cada intervencion a su minuto exacto.
- Indexado y busqueda de audio: transcripcion de podcasts o archivos de audio de gran tamano para construir indices de texto buscables, apoyandose en las marcas temporales para saltar al fragmento relevante.
- Traduccion de voz a texto en ingles: Whisper puede traducir directamente audio en otros idiomas a texto en ingles, util en flujos de documentacion o analisis de contenido internacional.
- Enrutado por idioma en pipelines de atencion al cliente: la deteccion de idioma permite dirigir automaticamente una llamada o un mensaje de voz al equipo o modelo adecuado.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real de conversaciones presenciales mediante un dispositivo movil con inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tasas de error (WER), metricas de velocidad ni comparaciones numericas. Los pesos de OpenAI Whisper cuentan con resultados publicos en el paper original, pero este repositorio no reporta mediciones propias para las exportaciones ONNX int8, por lo que no es posible afirmar que el rendimiento sea identico al de los pesos en punto flotante.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas, no publicadas en la model card): tiny int8 en torno a decenas de MB; base int8 alrededor de 100-150 MB; small int8 en el orden de 300-400 MB; turbo int8 proximo a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria puede ejecutar las variantes pequenas; una RTX 3060, RTX 4090 o superior ofrece margen sobrado para todas las variantes. Las GPU de datacenter (A100, H100) solo tendrian sentido para lotes muy grandes, ya que el modelo es pequeno.
- Compatibilidad con GPU de consumo: si, todas las variantes caben holgadamente en GPU de consumo modernas, e incluso las variantes tiny y base pueden ejecutarse en CPU sin aceleracion dedicada.
- Opciones de despliegue: ONNX Runtime (version 1.17 o superior) y el ecosistema sherpa-onnx. No se documenta compatibilidad con vLLM, TGI ni llama.cpp, que no estan orientados a este formato.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad para estas exportaciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (Whisper ONNX int8, sherpa-onnx) | Segun variante (tiny/base/small/turbo) | ONNX int8, salida de atencion cruzada | MIT | HuggingFace, 0 descargas, 0 likes |
| whisper.cpp | Mismas variantes de Whisper | GGML/GGUF, cuantizaciones q4/q5/q8 | MIT | Ampliamente adoptado y mantenido |
| faster-whisper (CTranslate2) | Mismas variantes de Whisper | CTranslate2, float16 e int8 | MIT | Muy extendido, con soporte de GPU |
| OpenAI Whisper (original) | Mismas variantes de Whisper | PyTorch (.pt) | MIT | Referencia oficial |

La diferencia principal frente a whisper.cpp y faster-whisper es el formato y el ecosistema de despliegue: este repositorio apunta a ONNX Runtime y sherpa-onnx, mientras que los otros dos usan GGUF y CTranslate2 respectivamente. La salida de atencion cruzada para timestamps por palabra es una caracteristica que no todas las exportaciones ofrecen de serie.

## Limitaciones y advertencias

- El repositorio no incluye resultados de benchmarks, por lo que no hay evidencia publicada sobre la degradacion de precision tras la cuantizacion a int8.
- Se trata de una publicacion de terceros con cero descargas y cero likes, sin historial de mantenimiento ni validacion por parte de la comunidad.
- No se especifica en la model card que variantes exactas de Whisper (multilingues o solo ingles) estan incluidas, lo que genera incertidumbre sobre la cobertura de idiomas.
- La ventana de 30 segundos por segmento implica que el audio largo debe trocearse manualmente; un troceado incorrecto puede cortar palabras y degradar la transcripcion.
- Whisper es conocido por generar alucinaciones en silencios, musica o audio con ruido, produciendo texto plausible pero inexistente. Este riesgo persiste en las versiones cuantizadas.
- La precision de las marcas temporales depende del post-procesado DTW y puede desviarse en audio con solapamiento de voces o acentos marcados.
- La licencia del repositorio es MIT, pero los scripts de exportacion de sherpa-onnx estan bajo Apache-2.0 y los pesos originales de OpenAI Whisper bajo MIT; conviene respetar las atribuciones correspondientes en un uso comercial.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe plantearse como sustituto de un modelo de lenguaje en flujos de razonamiento.
- El campo de fecha de creacion del repositorio figura como 2026-09-27, lo que resulta atipico y conviene verificar antes de tratarlo como una publicacion consolidada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CarinhadoJava/slyce-whisper-models
- Script de exportacion de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/blob/master/scripts/whisper/export-onnx-with-attention.py
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://github.com/openai/whisper (referencia enlazada desde el repositorio oficial)
- Documentacion de Whisper en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Busqueda de modelos Whisper en HuggingFace: https://huggingface.co/models?search=whisper
- Comparativa de variantes de Whisper: https://whisper-api.com/blog/models/
- Entrada de Wikipedia sobre Whisper: https://en.wikipedia.org/wiki/Whisper_(speech_recognition_system)
