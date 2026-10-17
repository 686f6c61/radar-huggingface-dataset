# ferymade/whisper-small-badung-dialek

## Resumen

`ferymade/whisper-small-badung-dialek` es un ajuste fino del modelo Whisper small de OpenAI, publicado en HuggingFace por el usuario ferymade. El nombre del repositorio indica que el ajuste se ha orientado al reconocimiento automatico del habla (ASR) del dialecto de Badung; el sufijo `dialek` significa "dialecto" en indonesio y Badung es una regencia de la isla de Bali, por lo que todo apunta a una variante local del indonesio o del balines, aunque la ficha no declara idiomas soportados.

El dato objetivo disponible es el recuento de parametros en safetensors: 241.734.912, cifra coherente con la familia Whisper small (en torno a 244 M). El repositorio ocupa 5,8 GB, un tamano muy superior al de los pesos en precision completa (unos 0,97 GB en fp32), lo que sugiere la presencia de multiples ficheros, estados del entrenador o copias redundantes. No se declaran pipeline, licencia ni idiomas, y el modelo apenas tiene traccion (13 descargas, 0 likes) desde su creacion el 17 de octubre de 2026.

Su interes es el habitual en los ajustes de ASR para lenguas de bajos recursos: adaptar un modelo acustico pequeno, desplegable en hardware modesto, a una variedad linguistica que los modelos multilingues generales cubren con alta tasa de error. No obstante, la ausencia de tarjeta descriptiva, de evaluacion y de licencia lo convierte en un artefacto a inspeccionar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la ficha; la etiqueta `whisper` y el recuento de 241,7 M de parametros son coherentes con un transformer encoder-decoder de la familia Whisper small |
| Parametros totales | 241.734.912 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha; en la arquitectura Whisper la entrada se procesa en ventanas de 30 segundos de audio |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, int8 ni cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se publica informacion sobre el proceso de entrenamiento: ni el corpus utilizado, ni el numero de horas o tokens de audio, ni si se trato de un ajuste completo de los pesos o de un entrenamiento parametrizado eficiente (LoRA, adaptadores). Tampoco se documenta si hubo limpieza de transcripciones, normalizacion de texto, aumento de datos o evaluacion sobre un conjunto de validacion. Todo ello se considera no disponible.

Lo unico inferible es la arquitectura base: Whisper es un transformer encoder-decoder que consume espectrogramas mel de 80 canales sobre ventanas de 30 segundos y se entrena de forma multitarea (transcripcion, traduccion al ingles, deteccion de idioma y prediccion de marcas temporales). Las innovaciones tecnicas del modelo original —token `<|notimestamps|>`, decodificacion por lotes con ventanas deslizantes, decodificacion especulativa en implementaciones optimizadas— no constan como modificadas ni verificadas en este ajuste concreto.

## Capacidades

- Reconocimiento automatico del habla orientado, segun el nombre del repositorio, al dialecto de Badung; sin verificacion independiente disponible.
- Transcripcion de audio en ventanas de 30 segundos, con agregacion de segmentos para audios mas largos (comportamiento heredado de Whisper, no confirmado en este ajuste).
- Posible prediccion de marcas temporales a nivel de segmento, si el ajuste conserva los tokens de timestamps del modelo base; no confirmado.
- Posible deteccion de idioma y traduccion al ingles heredadas de Whisper; no confirmado y previsiblemente degradadas por el ajuste.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de la familia Whisper).
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no declaradas; el ajuste probablemente reduce el rendimiento en idiomas distintos del dialecto objetivo, extremo no verificado.
- Capacidades especiales (vision, audio nativo como entrada adicional, modo thinking): no disponibles.

## Casos de uso

- Transcripcion de entrevistas y grabaciones de campo en dialecto de Badung: el modelo permite convertir audio en texto para proyectos de documentacion linguistica, con la ventaja de que 241,7 M de parametros hacen viable procesar horas de audio en una sola GPU de gama media.
- Subtitulado de contenido audiovisual local: generacion de transcripciones con marcas temporales (si se conservan) para videos de comunidades o medios regionales que no estan cubiertos por los modelos multilingues generales.
- Atencion al ciudadano en servicios locales: transcripcion de llamadas o mensajes de voz en la variante local dentro de un pipeline de gestion de incidencias, siempre que se valide antes la calidad sobre el dominio real.
- Punto de partida para un ajuste adicional: al ser un modelo pequeno y con pesos en safetensors, sirve como inicializacion para fine-tunings con mas datos del mismo dialecto o de dialectos vecinos, con coste de computo bajo.
- Despliegue en dispositivos con recursos limitados: con cuantizacion a int8 los pesos ocupan alrededor de 242 MB, lo que permite ejecucion en CPU o en GPU integrada para dictado offline en aplicaciones de campo sin conectividad.
- Base de comparacion en investigacion en ASR de bajos recursos: util como referencia (baseline) frente a otros ajustes del mismo dialecto, midiendo WER sobre un conjunto de test propio y documentando la variabilidad.
- Preprocesado de corpus para entrenamiento de modelos mayores: transcripcion automatica masiva de audio sin etiquetar, seguida de revision humana, para construir datasets de la variedad linguistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan valores de WER, CER, MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni comparaciones con modelos alternativos sobre el dialecto de Badung.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,48 GB solo para pesos en fp16 y 0,97 GB en fp32; con activaciones y buffers de la ventana de 30 segundos, un despliegue fp16 tipico se mantiene por debajo de 2 GB.
- Cuantizacion: los pesos en int8 ocuparian en torno a 242 MB, si bien el repositorio no publica versiones cuantizadas y habria que generarlas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o RTX 4090 cubren el modelo con holgura. En datacenter, una A100 o H100 estan sobredimensionadas para una sola instancia, aunque permiten servir muchos lotes concurrentes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada con 2 GB o mas de VRAM, y tambien en CPU mediante implementaciones optimizadas.
- Opciones de despliegue: HuggingFace Transformers (`pipeline` de ASR), faster-whisper (CTranslate2), whisper.cpp y servidores compatibles con Whisper como vLLM. TGI no soporta arquitecturas encoder-decoder de audio de forma estandar.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Dependeran del backend, del lote y de la longitud del audio, no solo del tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ferymade/whisper-small-badung-dialek | 241,7 M | No declarada (arquitectura Whisper: 30 s) | No disponible | No disponible | HuggingFace, safetensors |
| openai/whisper-small | ~244 M | 30 s | Multilingue (99 idiomas) | MIT (modelo original) | HuggingFace y multiples backends |
| openai/whisper-medium | ~769 M | 30 s | Multilingue (99 idiomas) | MIT (modelo original) | HuggingFace y multiples backends |
| openai/whisper-tiny | ~39 M | 30 s | Multilingue (99 idiomas) | MIT (modelo original) | HuggingFace y multiples backends |

La comparacion relevante es frente a `openai/whisper-small`: mismo orden de magnitud en parametros y, previsiblemente, mejor cobertura del dialecto objetivo a costa de un rendimiento probablemente peor en el resto de idiomas. Frente a `whisper-medium` o `whisper-tiny` se plantea el compromiso habitual entre precision, coste de inferencia y cobertura linguistica. No se dispone de datos de WER que permitan cuantificar ninguna de estas diferencias.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay tarjeta de modelo con detalles de entrenamiento, datos, hiperparametros ni evaluacion, lo que impide reproducir o auditar el ajuste.
- Licencia no especificada: sin licencia explicita no hay autorizacion clara para uso comercial; es imprescindible contactar con el autor o asumir que no se puede desplegar en produccion.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible en segmentos con silencio, ruido o audio fuera de dominio, y a repetir frases en bucles; sin evaluacion no puede descartarse que el ajuste haya incrementado este comportamiento.
- Sobreajuste probable: un ajuste sobre un unico dialecto con corpus limitado suele degradar el rendimiento en otros idiomas y en condiciones acusticas distintas (telefono, ruido de fondo, hablantes no vistos).
- Sesgos desconocidos: no se documenta la distribucion de hablantes, genero, edad o registro del corpus de entrenamiento, por lo que no puede evaluarse el sesgo por subgrupo.
- Limitacion de contexto: la ventana de 30 segundos obliga a segmentar audios largos y a gestionar los cortes; errores en la segmentacion degradan la transcripcion en los limites.
- Idiomas no declarados: la etiqueta `region:us` no aporta informacion linguistica y no hay metadatos que confirmen que el modelo transcribe correctamente ni siquiera el dialecto objetivo.
- Tamano del repositorio desproporcionado (5,8 GB para 241,7 M de parametros): conviene revisar el contenido antes de descargarlo, ya que puede incluir estados del entrenador u otros artefactos no documentados.
- Sin validacion de la comunidad: 13 descargas y 0 likes implican ausencia de verificacion externa; cualquier metrica de calidad debe obtenerse con un conjunto de evaluacion propio.

## Enlaces

- HuggingFace: https://huggingface.co/ferymade/whisper-small-badung-dialek
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su paper, a un repositorio de codigo ni a demos: los resultados devueltos no guardan relacion con el modelo.
