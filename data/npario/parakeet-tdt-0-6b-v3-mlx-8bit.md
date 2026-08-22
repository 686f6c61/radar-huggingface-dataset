# npario/parakeet-tdt-0.6b-v3-mlx-8bit

## Resumen

El modelo `npario/parakeet-tdt-0.6b-v3-mlx-8bit` es una conversión a formato MLX con cuantización de 8 bits del modelo NVIDIA Parakeet TDT 0.6B v3, un sistema de reconocimiento automático del habla (ASR) multilingüe de 600 millones de parámetros. Esta versión está pensada para ejecutarse de forma eficiente en hardware Apple Silicon mediante el framework MLX, manteniendo las capacidades del modelo original: transcripción de voz a texto en 25 idiomas europeos, detección automática del idioma, puntuación y capitalización automáticas, y generación de marcas de tiempo a nivel de palabra y segmento.

La relevancia de esta versión cuantizada radica en que permite desplegar un ASR de alta calidad en dispositivos con recursos limitados, como MacBooks o iPads, sin necesidad de GPUs dedicadas. Al reducir el peso a 8 bits, se disminuye el consumo de memoria y se acelera la inferencia, manteniendo una precisión razonable para casos de uso en producción. El modelo base de NVIDIA ya es conocido por su alta velocidad de transcripción en tiempo real, superando a alternativas como Whisper en entornos CPU, y esta adaptación MLX extiende esa ventaja al ecosistema Apple.

La ficha se basa en la información pública disponible en HuggingFace y en los resultados de búsqueda web, sin datos adicionales sobre el proceso de cuantización específico realizado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo ASR basado en transducer, segun el nombre TDT) |
| Parametros totales | 600 millones (segun el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta audio de hasta 24 minutos con atencion completa en A100 80GB, o 3 horas con atencion local) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | 25 idiomas europeos (segun el modelo base) |
| Licencia | CC-BY-4.0 (segun etiqueta de HuggingFace) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Se sabe que el modelo base, `nvidia/parakeet-tdt-0.6b-v3`, es un sistema ASR de 600 millones de parametros que extiende la capacidad de su predecesor (v2) de ingles a 25 idiomas europeos. El nombre "TDT" sugiere un decodificador Token-and-Duration Transducer, una variante de los modelos transducer que predice simultaneamente tokens y sus duraciones, lo que permite una transcripcion mas precisa y rapida. Sin embargo, no se dispone de detalles sobre la arquitectura exacta (por ejemplo, si usa FastConformer como encoder) ni sobre el proceso de entrenamiento (datos, tokens, tecnicas de alineacion).

Esta version concreta es una adaptacion a MLX con cuantizacion de 8 bits, realizada por el usuario `npario`. No se especifica el metodo de cuantizacion (por ejemplo, si es por canal o por tensor) ni si se ha realizado calibracion posterior. El modelo base se distribuye bajo licencia CC-BY-4.0, y esta conversion mantiene esa licencia segun la etiqueta.

## Capacidades

- Transcripcion de voz a texto en 25 idiomas europeos, con deteccion automatica del idioma hablado.
- Generacion de puntuacion y capitalizacion automaticas en la transcripcion.
- Marcas de tiempo a nivel de palabra y de segmento, utiles para subtitulado y analisis temporal.
- Soporte de audio largo: hasta 24 minutos con atencion completa (en GPU A100 80GB) o hasta 3 horas con atencion local, segun el modelo base.
- Alta velocidad de inferencia: el modelo base esta disenado para alto rendimiento en tiempo real, superando a Whisper en CPU segun las implementaciones ONNX.
- Compatibilidad con el ecosistema MLX, lo que permite ejecucion nativa en Apple Silicon con aceleracion por Metal.

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo puede procesar audio en tiempo real o grabado, generando actas con marcas de tiempo y puntuacion, gracias a su soporte de audio largo y deteccion de idioma.
- Subtitulado automatico de videos: las marcas de tiempo a nivel de palabra permiten sincronizar subtitulos con precision, y la cobertura de 25 idiomas europeos facilita la localizacion de contenido.
- Asistentes de voz en dispositivos Apple: al ser una version MLX 8-bit, puede integrarse en aplicaciones para macOS o iOS, ofreciendo transcripcion local sin conexion y con baja latencia.
- Analisis de llamadas de atencion al cliente: la transcripcion con puntuacion y marcas de tiempo permite extraer informacion estructurada de conversaciones para su posterior analisis o busqueda.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede convertir audio en texto en tiempo real, ayudando en entornos educativos o laborales.
- Procesamiento de archivos de audio largos (podcasts, entrevistas): con soporte de hasta 3 horas con atencion local, es adecuado para transcribir contenido extenso sin segmentar manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de WER (Word Error Rate) ni de velocidad de inferencia para esta version cuantizada en MLX. El modelo base de NVIDIA reporta mejoras sobre su predecesor, pero no se incluyen cifras concretas en los resultados de busqueda.

## Requisitos de hardware

- Al ser una version MLX 8-bit, esta optimizada para Apple Silicon (M1, M2, M3 y posteriores). Requiere macOS con soporte Metal.
- Tamano del modelo: aproximadamente 0,6 GB en 8 bits (600 millones de parametros × 1 byte), mas overhead de ejecucion. Se estima que cabe en dispositivos con 8 GB de RAM unificada, aunque no se proporcionan datos exactos.
- No requiere GPU dedicada; la inferencia se ejecuta en la GPU integrada del chip Apple.
- Para despliegue en otros entornos, se puede usar el modelo original en FP32 o FP16 con librerias como vLLM o TGI, pero esta version especifica esta limitada a MLX.
- La latencia y el throughput no estan documentados para esta conversion, pero el modelo base es conocido por su alta velocidad en CPU, y la cuantizacion 8-bit deberia mejorar aun mas el rendimiento en hardware Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| npario/parakeet-tdt-0.6b-v3-mlx-8bit | 600M | No disponible | 25 europeos | CC-BY-4.0 | MLX 8-bit |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 600M | Hasta 24 min audio | 25 europeos | CC-BY-4.0 | Safetensors (FP32/FP16) |
| openai/whisper-small | 244M | 448 tokens de audio | 99 idiomas | MIT | Safetensors, GGUF, etc. |
| openai/whisper-base | 74M | 448 tokens de audio | 99 idiomas | MIT | Safetensors, GGUF, etc. |

La comparativa se basa en datos publicos. Whisper ofrece mayor cobertura de idiomas, pero Parakeet TDT destaca por su velocidad y soporte de audio largo. Esta version MLX 8-bit es una opcion ligera para el ecosistema Apple, mientras que Whisper tiene mas formatos de despliegue.

## Limitaciones y advertencias

- La cuantizacion a 8 bits puede degradar ligeramente la precision en comparacion con el modelo en FP32, aunque no se han publicado metricas que cuantifiquen esta perdida.
- El modelo esta limitado a 25 idiomas europeos; no soporta idiomas fuera de ese conjunto, a diferencia de Whisper.
- No se dispone de informacion sobre sesgos o alucinaciones especificas de esta version. Como todo sistema ASR, puede cometer errores en entornos ruidosos o con acentos poco representados.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero es responsabilidad del usuario cumplir con los terminos de la licencia del modelo base.
- Esta version MLX solo funciona en hardware Apple Silicon; no es portable a otros entornos sin conversion adicional.
- No se han publicado resultados de benchmarks para esta conversion, por lo que el rendimiento real en tareas especificas no esta verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/npario/parakeet-tdt-0.6b-v3-mlx-8bit
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Version MLX FP32 de aitytech: https://huggingface.co/aitytech/Parakeet-TDT-0.6B-v3-MLX
- Wrapper FastAPI con ONNX (CPU): https://github.com/groxaxo/parakeet-tdt-0.6b-v3-fastapi-openai
- Wrapper alternativo: https://github.com/mil-ad/parakeet-tdt-0.6b-v3-fastapi-openai
- Pagina de NVIDIA NGC (contenedor NIM): https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/parakeet-0.6b-tdt
