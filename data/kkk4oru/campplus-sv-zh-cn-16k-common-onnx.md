# kkk4oru/campplus-sv-zh-cn-16k-common-onnx

## Resumen

CAM++ es un modelo de embeddings de hablante (speaker embedding) distribuido en formato ONNX. Convierte un fragmento corto de audio en un vector de 192 dimensiones, de forma que los fragmentos pronunciados por la misma persona quedan proximos en el espacio vectorial. El modelo original es `iic/speech_campplus_sv_zh-cn_16k-common`, publicado en ModelScope por el equipo 3D-Speaker, y esta ficha corresponde a una copia sin modificaciones de la conversion ONNX publicada por sherpa-onnx (fichero de 28.281.138 bytes, SHA-256 verificado contra el `checksum.txt` de la release).

El modelo resuelve la tarea de verificacion y diarizacion de hablante: dado un tramo de voz, produce una representacion compacta que permite comparar identidades mediante similitud coseno. Es relevante para pipelines de transcripcion con etiquetado de hablantes, especialmente en entornos con recursos limitados, ya que el fichero ONNX es pequeno y puede ejecutarse en CPU con ONNX Runtime. La arquitectura CAM++ esta descrita en el paper arXiv:2303.00332 y se basa en una red neuronal con conexiones densas y enmascaramiento context-aware (Context-Aware Masking).

La entrada del modelo son caracteristicas log-mel de 80 bandas a 16 kHz con formato Kaldi, y la salida es un embedding float32 de 192 dimensiones. El autor de la model card reporta un EER del 4,32 % en CN-Celeb segun la informacion upstream, y advierte de que las mediciones propias de diarizacion se hicieron sobre una unica conversacion en japones sin verificacion humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (red con conexiones densas y enmascaramiento context-aware) |
| Parametros totales | no disponible (fichero ONNX de 28.281.138 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embedding por tramo; ventanas de 1,5 s cada 0,75 s en las mediciones del autor) |
| Tipos de cuantizacion | no disponible (el fichero publicado es float32) |
| Idiomas soportados | entrenado en chino; otros idiomas sin probar salvo una conversacion en japones |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada | `x`: `[batch, frames, 80]` float32 log-mel |
| Salida | `embedding`: `[batch, 192]` float32 |
| Frecuencia de muestreo | 16 kHz |
| Metricas de comparacion | similitud coseno |

## Arquitectura y entrenamiento

CAM++ es una red neuronal para verificacion de hablante que combina conexiones densas con un mecanismo de enmascaramiento context-aware. Segun la informacion de ModelScope, supera en precision a ResNet34 y ECAPA-TDNN tanto en el corpus chino CN-Celeb como en el corpus ingles VoxCeleb, con una velocidad de inferencia superior. El modelo fue entrenado sobre un conjunto de aproximadamente 200.000 hablantes de chino, segun indica la model card upstream. No se dispone de detalles sobre el numero exacto de tokens o horas de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en esta tarea).

La conversion a ONNX conserva el preprocesado de caracteristicas en estilo Kaldi: muestras normalizadas en el rango -1 a 1, ventanas de 25 ms cada 10 ms, ventana de Povey, pre-enfasis de 0,97, eliminacion de componente continua y normalizacion por media global de cada banda (`global-mean`). El fichero incluye metadatos (`normalize_samples`, `feature_normalize_type`) que documentan este comportamiento. No se han publicado innovaciones adicionales como decodificacion especulativa o atencion lineal, ya que no es un modelo generativo.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de audio de 16 kHz.
- Verificacion de hablante mediante similitud coseno entre embeddings.
- Diarizacion de hablantes combinada con VAD (por ejemplo, Silero VAD) y clustering (k-means o spectral clustering).
- Clasificacion de audio a nivel de identidad de hablante (pipeline `audio-classification`).
- Ejecucion en CPU con ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision, audio generativo ni modo thinking.
- Capacidad multilingue limitada: entrenado en chino, con resultados no verificados en otros idiomas.

## Casos de uso

- Diarizacion en pipelines de transcripcion: extraer embeddings de tramos de 1,5 s cada 0,75 s dentro de los segmentos de voz detectados por VAD y agruparlos con clustering para asignar etiquetas de hablante a cada intervencion. Adecuado por su bajo consumo de memoria (unos 1,6 GB en pico para una hora de audio, incluyendo clustering).
- Etiquetado de hablantes en entornos con poca memoria: la model card lo presenta como la opcion ligera de "Transcribe Captions" para equipos sin memoria suficiente para modelos de hablante mas grandes.
- Verificacion de identidad en aplicaciones de control de acceso o autenticacion por voz, comparando el embedding de una muestra con el de referencia mediante similitud coseno.
- Segmentacion de reuniones y conversaciones: agrupar intervenciones por participante para generar actas o resumentes con atribucion de hablante.
- Preprocesado para busqueda por voz: indexar embeddings de hablante y recuperar fragmentos de una persona concreta en archivos de audio largos.
- Analisis de llamadas de atencion al cliente: separar agente y cliente en grabaciones para metricas de tiempo de habla, turnos y calidad de la conversacion.
- Filtrado de audio para datasets de entrenamiento: detectar y separar voces de distintos hablantes antes de transcribir o anotar.

## Benchmarks y rendimiento

Datos reportados en la informacion disponible:

| Medida | Resultado | Condiciones |
|---|---|---|
| EER en CN-Celeb | 4,32 % | Segun la model card upstream |
| Pureza k-means | 1,00 | 12 clips de 3 voces conocidas |
| Precision de personajes con color correcto | 0,63 | 4 extractos de 120 s, numero de hablantes automatico (linea base de un solo color: 0,47) |
| Precision de personajes con color correcto | 0,68 | Igual, con numero de hablantes dado |
| Precision de personajes con color correcto | 0,58 | 1 hora, numero de hablantes automatico (linea base: 0,50) |
| Tiempo de embeddings | 32 a 192 s | 1 hora de audio en CPU, segun carga |
| Memoria pico | ~1,6 GB | 1 hora de audio incluyendo clustering |

Advertencia del autor: las mediciones de diarizacion se hicieron con ONNX Runtime 1.31.1 en CPU de Apple Silicon, con otros procesos en ejecucion, sobre una unica conversacion en japones de tres personas, y ninguna persona verifico los resultados. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM: aproximadamente 1,6 GB en pico para procesar 1 hora de audio incluyendo clustering, segun las mediciones del autor.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime puede usarse, pero no se han publicado mediciones.
- Cabe en cualquier equipo consumer: el fichero ONNX ocupa unos 28 MB.
- Opciones de despliegue: ONNX Runtime (probado con la version 1.31.1), sherpa-onnx, y cualquier runtime compatible con ONNX.
- Latencia y throughput: extraccion de embeddings de 1 hora de audio en 32 a 192 s en CPU de Apple Silicon, dependiendo de la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAM++ (este) | no disponible (ONNX de 28 MB) | log-mel 80 bandas, 16 kHz | EER 4,32 % en CN-Celeb | Apache-2.0 | Hugging Face, ModelScope, sherpa-onnx |
| ResNet34 (referencia citada) | no disponible | no disponible | Inferior a CAM++ en CN-Celeb y VoxCeleb, segun ModelScope | no disponible | no disponible |
| ECAPA-TDNN (referencia citada) | no disponible | no disponible | Inferior a CAM++ en CN-Celeb y VoxCeleb, segun ModelScope | no disponible | no disponible |

La informacion disponible solo permite comparar con ResNet34 y ECAPA-TDNN de forma cualitativa, segun la afirmacion de ModelScope de que CAM++ obtiene mayor precision y velocidad. No se dispone de cifras concretas de esos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo identifica quien habla en un tramo, pero no puede representar a dos personas hablando a la vez (solapamiento de voces).
- Entrenado en chino; otros idiomas no estan probados salvo una conversacion en japones, y las mediciones de esa conversacion no fueron verificadas por personas.
- El numero automatico de hablantes vario entre 3 y 4 en una grabacion de tres personas.
- El clustering por enlace promedio (average-linkage) no funciono con estos embeddings: el resultado no fue mejor que asignar un unico color a todo.
- Las mediciones de diarizacion proceden de una unica grabacion y una referencia automatica, no humana; deben tomarse como indicativas.
- Riesgo de confusion en condiciones de ruido, solapamiento o audio de baja calidad; no se han publicado evaluaciones sistematicas.
- Licencia Apache-2.0, que permite uso comercial; el fichero `LICENSE` incluido es el de 3D-Speaker y ni ese repositorio ni sherpa-onnx incluyen un fichero NOTICE.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento, por lo que no debe evaluarse con benchmarks de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkk4oru/campplus-sv-zh-cn-16k-common-onnx
- Modelo original en ModelScope: https://www.modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common/summary
- Repositorio 3D-Speaker: https://github.com/modelscope/3D-Speaker
- Release de sherpa-onnx con los modelos de reconocimiento de hablante: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
- Paper CAM++: https://arxiv.org/abs/2303.00332
