# Maxkuo/campplus-sv-zh-cn-onnx

## Resumen

CAM++ es un modelo de extraccion de embeddings de locutor (speaker embedding) desarrollado originalmente por 3D-Speaker, el laboratorio de Alibaba Tongyi Lab, y exportado a formato ONNX por el proyecto k2-fsa/sherpa-onnx. Este repositorio de Hugging Face (`Maxkuo/campplus-sv-zh-cn-onnx`) es un espejo sin modificaciones del fichero `3dspeaker_speech_campplus_sv_zh-cn_16k-common.onnx`, publicado para que la herramienta `mac-toolbox` pueda descargarlo desde una revision fijada y verificable.

El modelo resuelve la tarea de verificacion de locutor (speaker verification): recibe audio mono a 16 kHz y devuelve un vector de 192 dimensiones que representa la identidad vocal del hablante. Ese embedding se compara despues mediante similitud coseno para decidir si dos fragmentos de audio pertenecen a la misma persona. Es relevante para pipelines de diarizacion, control de acceso por voz y autenticacion biometrica en entornos de habla mandarina.

La arquitectura es una red CAM++ (Context-Aware Masking++) orientada a embeddings, no un modelo generativo de lenguaje. El modelo esta entrenado sobre un corpus mandarin de aproximadamente 200 000 locutores y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (Context-Aware Masking++, red de embeddings de locutor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX float; no se documentan variantes cuantizadas) |
| Idiomas soportados | chino mandarin (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CAM++ de 3D-Speaker, disenada especificamente para extraer representaciones compactas de locutor. La entrada es audio mono a 16 kHz y la salida es un embedding de 192 dimensiones. El repositorio no documenta el numero de parametros, la profundidad de la red ni los detalles de las capas de atencion; esa informacion corresponde al modelo original `iic/speech_campplus_sv_zh-cn_16k-common` en ModelScope.

El entrenamiento se realizo sobre un conjunto de datos mandarin de aproximadamente 200 000 locutores, segun la model card. No se documentan en la informacion disponible el numero de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos o funciones de perdida especificas (como AAM-softmax o triplet loss). La exportacion a ONNX la realiza el proyecto k2-fsa/sherpa-onnx, y el checksum SHA-256 publicado (`f682b514c05d947ee3fa91cd6ec6c5c7543479a128373fa29b1faedccd21fd11`) coincide con el `checksum.txt` de la release oficial.

## Capacidades

- Extraccion de embeddings de locutor: genera un vector de 192 dimensiones a partir de audio mono a 16 kHz.
- Verificacion de locutor: permite comparar dos embeddings mediante similitud coseno para determinar si pertenecen al mismo hablante.
- Diarizacion de hablantes: combinado con clustering, permite segmentar reuniones o conversaciones por interlocutor.
- Procesamiento de audio mandarin: optimizado para habla en chino.
- Integracion con sherpa-onnx: disenado para ejecutarse en el runtime sherpa-onnx, lo que facilita despliegue en C++, Python, Android, iOS y otras plataformas.
- No soporta generacion de texto, tool calling, agentes ni vision: es exclusivamente un modelo de embeddings de audio.

## Casos de uso

- Autenticacion biometrica por voz: el modelo genera el embedding del usuario registrado y lo compara con el del audio entrante; si la similitud coseno supera un umbral calibrado, se concede acceso. Adecuado para entornos con usuarios que hablan mandarin.
- Diarizacion de reuniones: segmentar grabaciones de reuniones en chino y agrupar los turnos de palabra por locutor, usando los embeddings de 192 dimensiones como entrada a un algoritmo de clustering como agglomerative clustering.
- Transcripcion con atribucion de hablante: combinar el modelo con un ASR mandarin para etiquetar cada frase transcrita con el interlocutor correspondiente, util en actas de reuniones y subtitulado.
- Deteccion de locutor en centros de llamadas: verificar que el operador o el cliente es quien dice ser en grabaciones de atencion telefonica en mandarin, como capa adicional de control antifraude.
- Indexacion y busqueda por voz: almacenar embeddings de fragmentos de audio y recuperar fragmentos del mismo hablante mediante busqueda por similitud vectorial, util en archivos de podcasts o entrevistas.
- Control de calidad de datasets de voz: detectar duplicados de locutor o contaminacion entre splits de entrenamiento y evaluacion en corpus mandarin, comparando embeddings antes de entrenar modelos ASR o TTS.
- Verificacion en dispositivos con recursos limitados: al ser un modelo ONNX de embeddings, puede ejecutarse en CPU y en dispositivos moviles a traves de sherpa-onnx, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como EER (Equal Error Rate), minDCF ni tasas de precision sobre conjuntos de evaluacion de verificacion de locutor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo de embeddings de audio en formato ONNX, es probable que quepa en CPU y en GPUs de gama baja, pero no se documentan cifras de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmado en la informacion disponible; el runtime sherpa-onnx prioriza ejecucion en CPU.
- Opciones de despliegue: sherpa-onnx (runtime oficial para este formato), ONNX Runtime en Python, C++, Java, C# y otras plataformas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAM++ (este repositorio) | no disponible | no aplica (audio) | no disponible | Apache-2.0 | Hugging Face, sherpa-onnx |
| ECAPA-TDNN (SpeechBrain) | no disponible | no aplica (audio) | no disponible en esta ficha | Apache-2.0 | Hugging Face, SpeechBrain |
| ResNet-based speaker embedding (3D-Speaker) | no disponible | no aplica (audio) | no disponible en esta ficha | Apache-2.0 | ModelScope, sherpa-onnx |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta entrenado exclusivamente con habla mandarin; el rendimiento en otros idiomas o en hablantes con acento marcado no esta documentado y previsiblemente sera inferior.
- Riesgo de falsos positivos y negativos: no se publican metricas EER, por lo que el umbral de similitud coseno debe calibrarse con datos propios antes de usarlo en produccion.
- Limitaciones de idioma: solo chino mandarin (zh); no se documenta soporte multilingue.
- Robustez ante ruido y canales: no se documenta el comportamiento del modelo con audio ruidoso, reverberante o comprimido por codecs telefonicos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion. El fichero es una copia sin modificaciones del original de 3D-Speaker.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; conviene verificar el checksum SHA-256 publicado antes de integrarlo en un pipeline.
- Privacidad: los embeddings de voz son datos biometricos; su almacenamiento y tratamiento pueden estar sujetos a regulacion de proteccion de datos (RGPD en la UE).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maxkuo/campplus-sv-zh-cn-onnx
- Modelo original en ModelScope: https://www.modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common
- Release de sherpa-onnx con los modelos de reconocimiento de locutor: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Proyecto mac-toolbox: https://github.com/maxkuo-gc/mac-toolbox
