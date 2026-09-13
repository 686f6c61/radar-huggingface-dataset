# circulus/whisper-large-v3-turbo-int8-ov

## Resumen

circulus/whisper-large-v3-turbo-int8-ov es una exportación a OpenVINO IR del modelo de reconocimiento automático de voz openai/whisper-large-v3-turbo, cuantizada a INT8 mediante compresión de pesos con la librería optimum. El repositorio contiene un único artefacto de aproximadamente 784 MB (0,8 GB de tamaño de repo) y está pensado para ejecutarse con el runtime openvino_genai a través de la clase WhisperPipeline, alimentada con muestras de audio mono a 16 kHz en coma flotante.

El autor es el usuario circulus, que lo publica dentro de su material de curso «ARCademy OpenVINO courseware» (lección 06, reconocimiento de voz con Whisper) y lo genera con el script convert/convert_all.py. No se trata por tanto de un modelo entrenado desde cero ni de un fine-tune con datos propios: es una conversión y cuantización de un modelo preentrenado de OpenAI, orientada a reducir el coste de inferencia en hardware Intel.

Su relevancia práctica está en la combinación de tamaño reducido y capacidades del modelo base: según la model card, mantiene soporte para 99 idiomas y conserva una precisión cercana a whisper-large-v3 con un decodificador de solo 4 capas (frente a las 32 de large-v3), lo que abarata la decodificación. El repositorio no tiene descargas ni likes en el momento de la consulta y su licencia declarada es «other», un punto que conviene revisar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) exportado a OpenVINO IR; decodificador de 4 capas segun la model card (el codificador no se detalla, no disponible) |
| Parametros totales | no disponible en la ficha; el modelo base openai/whisper-large-v3-turbo declara 809 M de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como valor numerico; el modelo base Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | INT8 (compresion de pesos con optimum); no se listan otros formatos en el repositorio |
| Idiomas soportados | 99 idiomas (segun la model card del autor) |
| Licencia | other |
| Formato de pesos | OpenVINO IR (no se publican safetensors ni GGUF en este repositorio) |

Datos adicionales: tamano del repositorio 0,8 GB (784 MB declarados en la model card), 0 descargas, 0 likes, creado el 13 de septiembre de 2026 y actualizado el mismo dia. Etiquetas del repositorio: openvino, whisper, int8, circulus, ov-courseware.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder que convierte un espectrograma mel logaritmico de audio en tokens de texto, con tareas multitarea (transcripcion, traduccion a ingles, deteccion de idioma y prediccion de marcas temporales). La variante «turbo» del modelo base reduce el decodificador a 4 capas en lugar de las 32 del large-v3, lo que segun la model card del autor permite alcanzar una precision cercana a large-v3 «a una fraccion del coste». Este repositorio no modifica los pesos con entrenamiento adicional: aplica una exportacion a formato OpenVINO IR y una compresion de pesos a INT8 mediante optimum.

No hay informacion disponible en la documentacion facilitada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni sobre innovaciones de decodificacion introducidas en esta conversion. Tampoco se documentan los detalles del proceso de calibracion de la cuantizacion INT8 (si fue simetrica por canal, con o sin calibracion de activaciones, ni el conjunto de calibracion empleado). El unico dato de procedencia que aporta la model card es que el artefacto se genera con el script convert/convert_all.py del material de curso ARCademy OpenVINO y que la carga prevista es openvino_genai.WhisperPipeline(model_dir, device).

## Capacidades

- Reconocimiento automatico de voz (ASR) en 99 idiomas, incluyendo deteccion automatica del idioma de entrada segun la model card.
- Transcripcion de audio mono a 16 kHz en formato float, que es la entrada que espera WhisperPipeline.
- Traduccion de voz a texto en ingles (capacidad heredada del modelo base Whisper; no se detalla de forma explicita en la model card de este export).
- Generacion de marcas temporales a nivel de segmento (capacidad estandar de la familia Whisper en su formato de salida multitarea; no confirmada para este export).
- Inferencia sobre CPU, iGPU y aceleradores Intel a traves del runtime OpenVINO, sin necesidad de GPU dedicada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; es un modelo puramente acustico-a-texto.
- No se documentan capacidades de vision, audio generation, diarizacion de hablantes ni deteccion de emociones.
- No se documenta un «thinking mode» ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado automatizado de video: el modelo puede transcribir pistas de audio extraidas a 16 kHz mono y generar subtitulos en cualquiera de los 99 idiomas declarados, con deteccion automatica del idioma, y el artefacto de 784 MB permite ejecutarlo en el mismo servidor que hace el transcoding sin competir por VRAM.
- Transcripcion de reuniones en servidores sin GPU: al ser una exportacion OpenVINO INT8, se puede desplegar en maquinas con CPU Intel o iGPU, lo que abarata el coste por hora de transcripcion frente a ejecutar el modelo en fp16 sobre GPU.
- Dictado y notas de voz en aplicaciones de productividad: integrado como motor ASR local en una aplicacion de escritorio con procesador Intel, evita enviar audio de usuario a servicios en la nube y reduce los requisitos de memoria por debajo del gigabyte.
- Indexacion y busqueda sobre archivos de audio y video: transcribir un corpus de grabaciones y almacenar el texto con marcas temporales para habilitar busqueda semantica o alimentar un pipeline RAG sobre contenido audiovisual.
- Control de calidad en atencion al cliente: transcribir llamadas o grabaciones de contact center para auditar guiones, detectar incumplimientos de compliance y generar informes; la compresion INT8 facilita procesar volumen alto en hardware commodity.
- Accesibilidad en tiempo real: alimentar aplicaciones de subtitulado en vivo para personas con discapacidad auditiva en entornos con hardware modesto, dado que el modelo cabe en un equipo de sobremesa.
- Preprocesado para pipelines de voz + LLM: usar la salida de Whisper como entrada de texto de un modelo de lenguaje para resumen de reuniones, extraccion de acciones o generacion de actas.
- Prototipado docente: por su origen como material de curso, sirve como ejemplo reproducible de conversion, cuantizacion INT8 y despliegue de un modelo ASR con OpenVINO GenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de WER (word error rate), comparaciones con whisper-large-v3 ni resultados de tareas como LibriSpeech, Common Voice o FLEURS. La unica afirmacion cualitativa de la model card es que el modelo base turbo ofrece «una precision cercana a large» con 4 capas de decodificador en lugar de 32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El peso de los ficheros es de 784 MB en INT8, por lo que el modelo deberia caber holgadamente en menos de 2 GB de memoria considerando activaciones, aunque no se publica una cifra verificada.
- GPU recomendadas: no disponibles. El artefacto esta orientado al stack OpenVINO de Intel, por lo que el hardware natural son CPU Intel (con instrucciones AVX-512 o superiores), iGPU Intel integradas, GPU Intel Arc y NPU de los procesadores Intel Core Ultra, a traves del parametro device de WhisperPipeline.
- Compatibilidad con GPU de consumo: por tamano (784 MB) es esperable que quepa en cualquier GPU de consumo, pero el repositorio esta exportado para OpenVINO y no publica pesos en safetensors ni GGUF, por lo que no es directamente utilizable con CUDA/PyTorch sin reconvertir. No se confirma compatibilidad con RTX 4090 ni similares.
- Opciones de despliegue: openvino_genai.WhisperPipeline (la indicada por el autor); descarga del snapshot con huggingface_hub.snapshot_download. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo ASR de este tipo.
- Latencia y throughput estimados: no disponibles. El repositorio no publica medidas de factor de tiempo real (RTF), latencia por segmento de 30 s ni throughput en tokens por segundo.

## Comparativa con modelos similares

Las cifras de parametros de los modelos comparados proceden de las model cards publicas de OpenAI y no se han verificado en la busqueda realizada; los datos del export se toman de la ficha de este repositorio.

| Modelo | Parametros | Capas del decodificador | Ventana de audio | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| circulus/whisper-large-v3-turbo-int8-ov | no disponible (base: 809 M) | 4 | 30 s (modelo base) | OpenVINO IR INT8 | other | Repositorio HuggingFace, 0 descargas |
| openai/whisper-large-v3-turbo | 809 M (dato del modelo base) | 4 | 30 s | safetensors / PyTorch | MIT en el modelo base | Ampliamente disponible |
| openai/whisper-large-v3 | 1550 M (dato del modelo base) | 32 | 30 s | safetensors / PyTorch | MIT en el modelo base | Ampliamente disponible |
| openai/whisper-small | 244 M (dato del modelo base) | 12 | 30 s | safetensors / PyTorch | MIT en el modelo base | Ampliamente disponible |

Diferencias cualitativas: frente al modelo base sin cuantizar, este export reduce el espacio en disco y prioriza el runtime OpenVINO; frente a whisper-large-v3 gana en coste de decodificacion por el menor numero de capas del decodificador, a cambio de una precision que la propia model card describe como «cercana», no equivalente; frente a whisper-small, ofrece cobertura de 99 idiomas y mayor precision esperada a cambio de un tamano mayor. No se dispone de comparativas cuantitativas de WER que respalden estas diferencias.

## Limitaciones y advertencias

- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y creacion y actualizacion el mismo dia, lo que indica que el artefacto no ha sido probado de forma extensa por terceros.
- Licencia declarada como «other»: aunque el modelo base de OpenAI se distribuye habitualmente bajo licencia MIT, este repositorio no hereda una licencia explicita y remite a «other». Es imprescindible revisar los terminos antes de cualquier uso comercial.
- Riesgo de degradacion por cuantizacion: la compresion INT8 de pesos sin datos publicos de calibracion puede degradar el WER, especialmente en idiomas de bajos recursos, audio con ruido o acentos marcados. No se publican metricas que permitan cuantificar esa perdida.
- Alucinacion en audio ambiguo: como toda la familia Whisper, el modelo puede generar texto plausible que no corresponde al audio en silencios largos, musica, ruido o habla muy solapada.
- Sin diarizacion: no distingue hablantes, por lo que no sirve por si solo para transcribir reuniones atribuyendo intervenciones a cada persona.
- Limites de contexto acustico: la ventana de procesamiento de la familia base es de 30 s, lo que obliga a segmentar el audio y a gestionar la continuidad entre fragmentos.
- Dependencia de hardware: al ser OpenVINO IR, el uso directo queda ligado al ecosistema OpenVINO/Intel; no hay pesos safetensors ni GGUF en el repositorio para otros runtimes.
- Idiomas no verificados: la model card afirma 99 idiomas, pero no se aporta lista ni evaluacion por idioma; el rendimiento en castellano o en lenguas cooficiales no esta documentado.
- Entrada restringida: el pipeline espera audio mono a 16 kHz en float, de modo que cualquier fuente con otra frecuencia de muestreo o numero de canales requiere remuestreo y downmix previos.
- Trazabilidad limitada: no se documenta el script de calibracion, la version exacta de optimum ni el commit del modelo base utilizado en la conversion, lo que dificulta reproducir el artefacto bit a bit.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/circulus/whisper-large-v3-turbo-int8-ov
- Modelo base en HuggingFace: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de referencia de Whisper (OpenAI): https://github.com/openai/whisper
- Runtime OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Libreria optimum-intel, usada para la compresion de pesos: https://github.com/huggingface/optimum-intel
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores son las referencias canonicas del modelo base y de las herramientas empleadas en la conversion, no enlaces encontrados en dicha busqueda. El material de curso «ARCademy OpenVINO courseware» mencionado en la model card no tiene URL publica en la informacion disponible.
