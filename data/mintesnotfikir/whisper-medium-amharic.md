# mintesnotfikir/whisper-medium-amharic

## Resumen

El modelo `mintesnotfikir/whisper-medium-amharic` es un fine-tune del modelo de reconocimiento de voz automático (ASR) `openai/whisper-medium`, adaptado específicamente para el idioma amhárico. Desarrollado por el usuario mintesnotfikir, este modelo se presenta como una solución para la transcripción de audio en amhárico, un idioma con recursos limitados en el ámbito de la ASR. La relevancia de este modelo radica en su potencial para mejorar el acceso a tecnologías de voz en una lengua hablada por más de 30 millones de personas en Etiopía y la diáspora.

Arquitectónicamente, hereda la estructura transformer encoder-decoder de Whisper Medium, con aproximadamente 764 millones de parámetros. La ventana de contexto de audio no se especifica en la información disponible, aunque el modelo base Whisper Medium procesa clips de hasta 30 segundos. El repositorio contiene pesos en formato safetensors y ocupa 16 GB, lo que sugiere que los pesos podrían estar almacenados en precisión completa (fp32). La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basado en openai/whisper-medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Whisper Medium usa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | no disponible (no se mencionan en la informacion) |
| Idiomas soportados | amharico (por nombre del modelo, no confirmado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `openai/whisper-medium`, un transformer encoder-decoder originalmente entrenado por OpenAI para reconocimiento de voz multilingue. La arquitectura concreta (numero de capas, heads, dimensiones) no se detalla en la informacion disponible, pero se corresponde con la del modelo base. El proceso de fine-tuning se realizo con el framework Transformers (version 5.0.0) y PyTorch 2.10.0, utilizando los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 32, batch de evaluacion de 16, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup, y un total de 4000 pasos de entrenamiento. Se uso precision mixta nativa (AMP). No se especifica el dataset de entrenamiento (la model card indica "None dataset"), ni el numero de tokens de audio utilizados, ni si se aplicaron tecnicas como RLHF o DPO. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Reconocimiento de voz automatico (ASR): transcribe audio en amharico a texto, basado en la capacidad del modelo base Whisper Medium.
- Generacion de transcripciones con marcas de tiempo: Whisper Medium puede producir segmentos temporizados, aunque no se confirma si el fine-tune mantiene esta capacidad.
- Soporte de traduccion al ingles: el modelo base Whisper Medium incluye tareas de traduccion, pero no hay evidencia de que el fine-tune conserve esta funcionalidad.
- No se dispone de informacion sobre tool calling, capacidades de agente, vision u otras modalidades; es un modelo puramente de audio a texto.
- Multilingue: el modelo base soporta 99 idiomas, pero el fine-tune se ha realizado especificamente para amharico; no se confirma si conserva el resto de idiomas.

## Casos de uso

- Transcripcion de reuniones y conferencias en amharico: el modelo puede convertir grabaciones de audio de reuniones empresariales o academicas en texto, facilitando la generacion de actas y busqueda de contenido. Su tamano medio (764M parametros) permite ejecutarse en GPUs de gama media.
- Subtitulado automatico de videos en amharico: integrado en pipelines de postproduccion, el modelo puede generar subtitulos para contenido audiovisual, mejorando la accesibilidad para hablantes de amharico.
- Atencion al cliente automatizada: en centros de llamadas que operan en Etiopia, el modelo puede transcribir conversaciones para analisis de calidad, deteccion de intenciones o entrenamiento de agentes, siempre que se combine con sistemas de gestion de llamadas.
- Archivo y busqueda de contenido de audio: transcripcion de archivos historicos de radio, podcasts o entrevistas en amharico, permitiendo indexacion y busqueda por texto.
- Asistentes de voz para aplicaciones locales: el modelo puede servir como backend de reconocimiento de voz en aplicaciones moviles o web dirigidas a usuarios de habla amharica, habilitando comandos por voz.
- Investigacion linguistica y sociolinguistica: transcripcion de grabaciones de campo en amharico para estudios de dialectos, fonetica o analisis de discurso, con la ventaja de un modelo entrenado especificamente para este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como WER (Word Error Rate) ni comparaciones con otros modelos. No hay datos de evaluacion en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, Whisper Medium en precision fp16 requiere aproximadamente 1.5 GB de VRAM para los pesos, mas overhead de activaciones; en fp32 serian ~3 GB. El tamano del repositorio (16 GB) sugiere que los pesos podrian estar en fp32 o incluir multiples archivos de checkpoint.
- GPU recomendadas: para inferencia en tiempo real, una GPU con al menos 6 GB de VRAM (por ejemplo, NVIDIA RTX 2060 o superior) seria suficiente. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 16 GB o mas, como RTX 4080, A100 o H100.
- Compatibilidad con GPU de consumo: si, modelos de la serie RTX 30/40 con 8 GB o mas pueden ejecutar inferencia sin problemas.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, o mediante el pipeline de `transformers` en Python. Tambien es posible convertirlo a formato GGUF para ejecucion en CPU con llama.cpp, aunque no se proporcionan cuantizaciones listas.
- Latencia y throughput: no disponibles. Dependen del hardware y del framework de inferencia utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A continuacion se presenta una comparativa estructural con el modelo base y con un modelo alternativo comun para ASR en idiomas de bajos recursos:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-medium-amharic (este) | 763.857.920 | no disponible | amharico (por nombre) | apache-2.0 | safetensors |
| openai/whisper-medium | ~769M | 30 segundos de audio | 99 idiomas | MIT | safetensors, etc. |
| facebook/wav2vec2-xls-r-300m | 300M | no disponible | multilingue (incluye amharico) | apache-2.0 | safetensors |

Nota: los datos de openai/whisper-medium son publicos; los de wav2vec2-xls-r-300m son aproximados. No se han encontrado modelos especificos para amharico con los que comparar directamente.

## Limitaciones y advertencias

- No se ha publicado informacion sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos (por ejemplo, acentos regionales, ruido de fondo, o dominios especificos).
- La model card no incluye metricas de rendimiento, por lo que se desconoce la calidad real de la transcripcion en amharico. Es recomendable validar el modelo con datos propios antes de usarlo en produccion.
- Al ser un fine-tune de Whisper Medium, puede heredar limitaciones del modelo base, como dificultad con audio de baja calidad o ruido excesivo.
- No se confirma si el modelo mantiene la capacidad multilingue del modelo base; es posible que el fine-tuning haya degradado el rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento (si los hubiera).
- El repositorio tiene solo 54 descargas y 0 likes, lo que indica poca adopcion y posible falta de validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mintesnotfikir/whisper-medium-amharic
- Modelo base: https://huggingface.co/openai/whisper-medium
