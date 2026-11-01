# MoleculeCell/whisper-int8-sm

## Resumen

`MoleculeCell/whisper-int8-sm` es un artefacto publicado en HuggingFace por el usuario MoleculeCell que, por su identificador y sus etiquetas (`onnx`, `whisper`, `int8`, `sm`), corresponde a una version cuantizada a 8 bits y exportada a formato ONNX de un modelo de la familia Whisper en su variante "small" de OpenAI. Whisper es un modelo de reconocimiento automatico del habla (ASR) entrenado con un enfoque de seq2seq transformer sobre grandes volumenes de audio debilmente supervisado, y la variante small cuenta con unos 244 millones de parametros en su version original. La cuantizacion INT8 y el formato ONNX apuntan a un uso orientado a inferencia eficiente en CPU o en entornos con recursos limitados, mediante runtimes como ONNX Runtime.

El repositorio tiene un tamano de 0,2 GB, lo que es coherente con un modelo small cuantizado a 8 bits (el Whisper small original en fp32 ronda los 967 MB). El autor no ha publicado pipeline, idiomas soportados ni una model card descriptiva mas alla de la declaracion de licencia MIT, por lo que la mayor parte de los metadatos tecnicos no estan disponibles y deben inferirse a partir de las convenciones de la familia Whisper. El modelo no registra descargas ni likes en el momento de la consulta.

Su relevancia practica es la de servir como pieza lista para desplegar transcripcion de audio en entornos sin GPU o con presupuesto de memoria ajustado, a costa de una perdida de precision frente al modelo original en fp32 o fp16. No obstante, al no existir documentacion del autor sobre el proceso de cuantizacion, calibracion ni evaluacion, cualquier uso en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante small; inferido del identificador) |
| Parametros totales | No disponible (la variante small original de Whisper tiene ~244 M; el artefacto cuantizado no declara cifra) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper small original: ventana de audio de 30 s) |
| Tipos de cuantizacion | INT8 (indicado en el nombre del repositorio) |
| Idiomas soportados | No disponible (la familia Whisper original es multilingue; no confirmado para este artefacto) |
| Licencia | MIT |
| Formato de pesos | ONNX (etiqueta `onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder que procesa espectrogramas Mel de audio de 30 segundos y genera tokens de texto, con tokens especiales para tarea (transcripcion o traduccion), idioma y marcas de tiempo. La variante small de OpenAI emplea 12 capas de encoder y 12 de decoder, con un ancho de modelo de 768 y 12 cabezas de atencion. El entrenamiento original de Whisper se realizo sobre 680 000 horas de audio debilmente supervisado y multilingue, sin RLHF ni DPO, usando aprendizaje supervisado estandar.

Sobre este artefacto concreto no hay informacion publicada acerca del procedimiento de cuantizacion: se desconoce si se aplico cuantizacion dinamica o estatica, que dataset de calibracion se uso, si se cuantizaron todas las capas o solo las lineales, y si se realizo algun ajuste fino posterior a la cuantizacion. Tampoco se documenta la version exacta del exportador ONNX ni la herramienta empleada (por ejemplo, Optimum, ONNX Runtime o torch.onnx). Cualquier afirmacion sobre innovaciones tecnicas adicionales seria especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) a partir de audio, presumiblemente con la funcionalidad estandar de Whisper.
- Generacion de transcripciones con marcas de tiempo, si el artefacto conserva los tokens especiales del modelo original.
- Posible traduccion de audio a texto en ingles, si la variante small multilingue se mantiene intacta; no confirmado por el autor.
- Inferencia en CPU mediante ONNX Runtime gracias a la cuantizacion INT8.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta soporte de vision, audio generativo ni modo "thinking".
- Cobertura multilingue: no disponible para este artefacto.

## Casos de uso

- Transcripcion de reuniones en local: el modelo puede ejecutarse en un portatil sin GPU usando ONNX Runtime, procesando segmentos de 30 segundos y encadenando resultados para actas o resumenes posteriores. La cuantizacion INT8 reduce el consumo de memoria y el tiempo de inferencia en CPU.
- Subtitulado de video en pipelines por lotes: integrado en un script que extrae audio con ffmpeg, lo convierte a espectrograma Mel y ejecuta el modelo ONNX, se pueden generar subtitulos con marcas de tiempo para archivos de video almacenados.
- Asistentes de voz en dispositivos de borde: en Raspberry Pi o mini-PC sin acelerador, un modelo small cuantizado a INT8 permite transcripcion en tiempo casi real de comandos cortos, siempre que se valide la latencia en el hardware objetivo.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones de llamadas o podcasts para alimentar un indice de texto y permitir busqueda semantica, aprovechando el bajo coste de inferencia en CPU.
- Prototipado rapido de aplicaciones ASR: al ser un artefacto ONNX ligero, sirve como punto de partida para validar una idea de producto de transcripcion antes de invertir en modelos mayores o servicios en la nube.
- Preprocesado en pipelines de datos: convertir audio a texto como paso previo a tareas de NLP (clasificacion, resumen, analisis de sentimiento) en entornos donde no hay GPU disponible o el presupuesto de computo es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo INT8 ONNX ocupa del orden de 200-300 MB, aunque no hay medicion oficial.
- GPU recomendadas: cualquier GPU moderna con soporte de ONNX Runtime (por ejemplo, RTX 3060 en adelante) puede ejecutarlo, pero el artefacto esta orientado a CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, dado el tamano del repositorio (0,2 GB).
- Opciones de despliegue: ONNX Runtime (CPU o GPU), posiblemente con `onnxruntime-genai` o `transformers` con backend ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a ASR.
- Latencia y throughput: no disponibles; dependen del hardware, del numero de hilos y de la longitud del audio. Se recomienda medir con el propio entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoleculeCell/whisper-int8-sm | No disponible (~244 M en la variante small original) | No disponible (30 s en Whisper small) | ONNX INT8 | MIT | HuggingFace |
| openai/whisper-small | ~244 M | 30 s | PyTorch (safetensors) | MIT | HuggingFace |
| openai/whisper-small.en | ~244 M | 30 s | PyTorch (safetensors) | MIT | HuggingFace |
| openai/whisper-base | ~74 M | 30 s | PyTorch (safetensors) | MIT | HuggingFace |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento del artefacto cuantizado que permitan contrastarlo con alternativas de otros autores (por ejemplo, versiones ONNX de terceros o modelos ASR como Wav2Vec2). No hay datos de WER ni de velocidad publicados para este repositorio.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documenta el proceso de cuantizacion, la calibracion ni la evaluacion, lo que impide conocer la degradacion de precision respecto al modelo original.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos de silencio o ruido, un fenomeno bien documentado en la familia y que la cuantizacion podria agravar.
- Sesgos conocidos de Whisper: sesgo hacia variedades de ingles y hacia determinados acentos, con peor rendimiento en lenguas de bajos recursos; no confirmado para este artefacto.
- Limitacion de contexto: la ventana de audio de 30 segundos obliga a segmentar audios largos, con riesgo de cortes en palabras y errores en los limites.
- Idiomas: no se especifica que idiomas cubre el artefacto; no asumir multilingue sin verificacion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene conservar la atribucion a OpenAI como origen del modelo base.
- Sin descargas ni likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Fecha de creacion futura (2026-10-30) en los metadatos: inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MoleculeCell/whisper-int8-sm
- Modelo base de referencia (Whisper small): https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- ONNX Runtime: https://onnxruntime.ai/
