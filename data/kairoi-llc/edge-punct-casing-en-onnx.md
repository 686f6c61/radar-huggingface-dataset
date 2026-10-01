# Kairoi-LLC/edge-punct-casing-en-onnx

## Resumen

`Kairoi-LLC/edge-punct-casing-en-onnx` es un espejo sin modificaciones (mirror) del modelo en inglés Edge-Punct-Casing de frankyoujian, distribuido en su forma ONNX cuantizada a int8 que emplea sherpa-onnx como modelo de "puntuación en línea" (online punctuation). No es un modelo de lenguaje generativo: es un modelo de clasificación de tokens (token-classification) que restaura signos de puntuación y aplica capitalización correcta (truecasing) sobre texto ya transcrito, típicamente la salida en minúsculas y sin puntuar de un sistema ASR en streaming.

La arquitectura es una CNN-BiLSTM, descrita en el artículo "A lightweight and efficient punctuation and word casing prediction model for on-device streaming ASR", que predice puntuación y capitalización conjuntamente usando únicamente características léxicas. El artefacto se apoya en tokenización BPE unigram y se publica junto a un vocabulario `bpe.vocab`.

Su relevancia radica en el tamaño: el paquete de distribución original (`sherpa-onnx-online-punct-en-2024-08-06.tar.bz2`) ocupa 30.667.839 bytes, lo que permite desplegar restauración de puntuación y mayúsculas en dispositivos de borde sin GPU. El repositorio de HuggingFace se limita a fijar por commit el contenido del release de k2-fsa/sherpa-onnx, con hashes SHA-256 verificables, bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-BiLSTM (red convolucional + LSTM bidireccional), clasificacion de tokens |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX cuantizado); el repositorio solo incluye `model.int8.onnx` |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) + vocabulario BPE unigram (`bpe.vocab`) |
| Tarea (pipeline) | token-classification |
| Tokenizacion | unigram BPE |
| Modelo base | frankyoujian/Edge-Punct-Casing (commit `bde453bde24b544f38ffdd56398bfadcd22ce935`) |
| Tamano del artefacto de origen | 30.667.839 bytes (`sherpa-onnx-online-punct-en-2024-08-06.tar.bz2`) |
| Tamano del repo en HuggingFace | 0.0 GB (reportado por la plataforma) |

## Arquitectura y entrenamiento

El modelo es una CNN-BiLSTM que predice de forma conjunta la puntuacion y la capitalizacion de palabras a partir de caracteristicas exclusivamente lexicas. Frente a los enfoques basados en Transformer, cuya profundidad y tamano dificultan el despliegue en dispositivos de borde, este diseno prioriza un coste computacional bajo manteniendo la calidad de prediccion, segun plantea el articulo asociado. La tokenizacion utiliza unigram BPE, y la variante distribuida aqui esta cuantizada a int8 para su ejecucion con sherpa-onnx.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables habitualmente a un modelo discriminativo de este tipo). El repositorio de Kairoi-LLC no introduce ningun cambio: los ficheros son byte a byte identicos a los del release asset de k2-fsa/sherpa-onnx, con `model.int8.onnx` verificado mediante SHA-256 `9d611f445fe4a46186080fe161be6059d87d72eb88d3a8cb00c1a06e83a6067e` y `bpe.vocab` mediante SHA-256 `e118b7ad88c54db562517df49e1cffd4836d166c34fb190fd311d7f34eb238f5`.

## Capacidades

- Prediccion conjunta de puntuacion (punto, coma, signos de interrogacion y similares) y capitalizacion sobre texto sin puntuar.
- Funcionamiento en streaming ("online punctuation") dentro del ecosistema sherpa-onnx, integrable a la salida de un ASR en tiempo real.
- Inferencia en dispositivo de borde gracias a la cuantizacion int8 y a la arquitectura CNN-BiLSTM.
- Entrada basada en caracteristicas lexicas, sin necesidad de prosodia ni de informacion acustica.
- Modelo discriminativo de etiquetado de tokens: no genera texto nuevo ni mantiene conversaciones.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingue: no; el modelo esta limitado al ingles.

## Casos de uso

- Puntuacion de transcripciones ASR en tiempo real: el modelo recibe la salida en minusculas y sin puntuar de un reconocedor en streaming y devuelve la misma secuencia con comas, puntos y mayusculas, mejorando la legibilidad sin anadir latencia perceptible.
- Subtitulado en directo: en retransmisiones o reuniones, se aplica sobre los segmentos parciales del ASR para mostrar subtitulos puntuados y con nombres propios capitalizados correctamente.
- Dictado y notas de voz en movil: al ejecutarse en CPU y con un artefacto de decenas de MB, permite que una aplicacion de dictado offline entregue texto bien formateado sin enviar audio a la nube.
- Preprocesado para modelos de lenguaje: restaurar puntuacion antes de enviar una transcripcion a un LLM mejora la calidad del texto de entrada y reduce ambiguedades en tareas posteriores de resumen o extraccion de informacion.
- Accesibilidad: transcripcion en vivo para personas con discapacidad auditiva, donde la falta de puntuacion y mayusculas dificulta la comprension del texto continuo.
- Postprocesado de texto legacy: normalizacion de mensajes procedentes de chats, SMS o sistemas antiguos que almacenan texto todo en minusculas y sin signos de puntuacion.
- Integracion en pipelines embebidos con sherpa-onnx: al tratarse del formato exacto que consume sherpa-onnx como "online punctuation", se puede incorporar a aplicaciones de voz sobre Raspberry Pi, moviles u otros dispositivos ARM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta ficha. El articulo de referencia ("A lightweight and efficient punctuation and word casing prediction model for on-device streaming ASR", arXiv 2407.13142) contiene la evaluacion del modelo original, pero los valores concretos no se incluyen en el material proporcionado, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: practicamente despreciable; el modelo int8 ocupa como maximo decenas de MB (el paquete completo, modelo mas vocabulario y comprimido en tar.bz2, son 30,67 MB).
- GPU recomendadas: no requiere GPU; esta disenado para ejecucion en CPU. Cualquier GPU puede alojarlo sobradamente si el pipeline general lo necesita.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en placas integradas, dado su tamano.
- Ejecucion en dispositivos de borde: es su objetivo principal (telefonos, SBC tipo Raspberry Pi y similares) a traves de sherpa-onnx.
- Opciones de despliegue: sherpa-onnx (formato nativo de este artefacto); al ser ONNX, tambien puede ejecutarse con ONNX Runtime en integraciones personalizadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| edge-punct-casing-en-onnx (este) | CNN-BiLSTM int8 | no disponible | no disponible | Apache-2.0 | - |
| Enfoques basados en Transformer para puntuacion | Transformer | no disponible | no disponible | no disponible | no disponibles en la informacion proporcionada |

El articulo asociado contrapone explicitamente la propuesta CNN-BiLSTM a los modelos basados en Transformer, senalando que la profundidad de estos ultimos hace que su tamano sea habitualmente muy grande y dificulte el despliegue en dispositivos de borde. No se dispone de cifras comparativas concretas en el material facilitado.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no responde a instrucciones ni mantiene conversaciones; unicamente etiqueta tokens con puntuacion y capitalizacion.
- Monolingue: solo soporta ingles.
- Dependencia de caracteristicas lexicas: al no usar prosodia ni senales acusticas, la desambiguacion en textos ambiguos puede ser limitada.
- Riesgo de errores de clasificacion en dominios muy alejados del entrenamiento (jerga tecnica, abreviaturas, texto no normativo); no se dispone de datos de sesgo publicados para este modelo.
- El modelo carece de umbrales, metricas de calibracion o avales de calidad publicados en la informacion disponible, por lo que su validacion en produccion requiere evaluacion propia.
- Este repositorio es un espejo: no se realizan cambios ni mantenimiento del modelo; las actualizaciones dependen del repositorio original de frankyoujian y del empaquetado de k2-fsa/sherpa-onnx.
- El tamano de repositorio reportado por HuggingFace (0.0 GB) no refleja el del artefacto original (30.667.839 bytes); conviene verificar la integridad con los SHA-256 indicados.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion a frankyoujian (modelo), al proyecto k2-fsa (empaquetado para sherpa-onnx) y a Kairoi (espejo).

## Enlaces

- Repositorio del espejo: https://huggingface.co/Kairoi-LLC/edge-punct-casing-en-onnx
- Modelo original: https://huggingface.co/frankyoujian/Edge-Punct-Casing
- Codigo del modelo original: https://github.com/frankyoujian/Edge-Punct-Casing
- README del modelo original: https://github.com/frankyoujian/Edge-Punct-Casing/blob/main/README.md
- Articulo: https://arxiv.org/pdf/2407.13142 (A lightweight and efficient punctuation and word casing prediction model for on-device streaming ASR)
- Release de sherpa-onnx con los modelos de puntuacion: https://github.com/k2-fsa/sherpa-onnx/releases/tag/punctuation-models
- Documentacion de sherpa-onnx sobre modelos preentrenados de puntuacion: https://k2-fsa.github.io/sherpa/onnx/punctuation/pretrained_models.html
- Texto de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
