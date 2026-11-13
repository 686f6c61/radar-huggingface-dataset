# jmdisuanco/campplus-3dspeaker-200k-onnx

## Resumen

CAM++ (Context-Aware Masking++) es un modelo de reconocimiento de hablante (speaker verification) desarrollado originalmente por el proyecto 3D-Speaker de Alibaba/ModelScope. Este repositorio concreto es un espejo no modificado del export ONNX publicado por el usuario `welcomyou`, pensado para que el gestor de modelos de myPlinx disponga de una segunda fuente si el repositorio original desaparece, cambia de nombre o se restringe. El archivo `campplus_cn_en_common_200k.onnx` (28.283.928 bytes) es byte a byte idéntico al upstream, verificado mediante sha256.

El modelo resuelve la tarea de extracción de embeddings de hablante: a partir de un segmento de audio de 16 kHz genera una representación vectorial que permite verificar si dos fragmentos corresponden a la misma persona. Está entrenado sobre datos en chino e inglés (`zh_en_16k-common`), lo que lo hace útil en sistemas de verificación biométrica, diarización y control de acceso por voz.

La relevancia de esta ficha es doble: por un lado documenta un modelo de producción consolidado en el ecosistema 3D-Speaker; por otro, ejemplifica un patrón de espejado de pesos con verificación criptográfica para mitigar el riesgo de desaparición de artefactos en Hugging Face. La licencia declarada es Apache-2.0, aunque con matices importantes sobre los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (Context-Aware Masking++, red neuronal con atención y masking contextual para embeddings de hablante) |
| Parametros totales | no disponible (el tamaño del archivo ONNX es de 28.283.928 bytes, aproximadamente 28 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; opera sobre segmentos de audio, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente el ONNX en precisión original) |
| Idiomas soportados | chino e inglés (variante `zh_en_16k-common`); no se detallan más idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`campplus_cn_en_common_200k.onnx`) |

## Arquitectura y entrenamiento

CAM++ es una arquitectura diseñada específicamente para speaker verification. Se basa en un backbone con mecanismos de atención contextual y masking (Context-Aware Masking) que permite al modelo ponderar qué partes del espectrograma aportan información discriminativa sobre la identidad del hablante, frente a variabilidad de canal, ruido o contenido lingüístico. El resultado es un embedding de dimensión fija (habitualmente 192 en la familia CAM++) que se compara mediante similitud coseno para decidir si dos segmentos pertenecen al mismo hablante.

Según la model card, los pesos fueron entrenados sobre datos de VoxCeleb, CN-Celeb y 3D-Speaker, con cobertura en chino e inglés a 16 kHz. El sufijo `200k` hace referencia al número de identidades o al volumen del conjunto de entrenamiento, aunque la información proporcionada no detalla la composición exacta ni el número total de horas. No se documentan en la información disponible detalles sobre funciones de pérdida (AAM-softmax u otras), aumentado de datos ni procesos de refinamiento posteriores. El export a ONNX lo realizó el usuario `welcomyou`; este repositorio es un espejo sin modificaciones.

## Capacidades

- Extracción de embeddings de hablante (speaker embeddings) a partir de audio de 16 kHz.
- Verificación de hablante (1:1): comparación de dos segmentos mediante similitud coseno.
- Identificación de hablante (1:N): búsqueda del hablante más probable en una galería de embeddings.
- Diarización de hablantes: segmentación de audio multi-hablante combinada con clustering de embeddings.
- Soporte bilingüe chino-inglés en el dominio de voz (no es un modelo de texto).
- Inferencia vía ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, function calling, agentes ni generación de texto: es un modelo puramente de clasificación/embedding de audio.

## Casos de uso

- Verificación biométrica por voz en aplicaciones de autenticación: el modelo genera un embedding del audio del usuario y lo compara con el vector enrolado previamente; la similitud coseno actúa como puntuación de verificación.
- Diarización de reuniones y transcripciones: combinando los embeddings de CAM++ con un algoritmo de clustering (por ejemplo, spectral clustering) se obtiene "quién habló cuándo" en grabaciones multihablante.
- Control de acceso físico o telefónico: integración en sistemas de call center para confirmar la identidad del cliente antes de operar, con umbrales ajustables según la tasa de falsos positivos tolerada.
- Indexación y búsqueda de archivos de audio: generación de embeddings para buscar fragmentos de una misma persona en grandes archivos o archivos de medios.
- Detección de fraude y suplantación: comparación de la voz del interlocutor con la del titular registrado para señalar posibles suplantaciones en atención al cliente.
- Preprocesado para pipelines de ASR multihablante: asignación de etiquetas de hablante a cada segmento antes de la transcripción, mejorando la atribución de turnos.
- Análisis forense de audio: extracción de embeddings para comparación de muestras de voz en investigaciones, siempre con las cautelas legales y de sesgo correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. El archivo ONNX ocupa unos 28 MB; en FP32 la huella en memoria es del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; para despliegues de alto throughput se recomienda A100, H100 o L4, aunque una RTX 4090 o incluso una GTX 1660 son válidas para cargas moderadas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria libre; también funciona en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integrable en Python, C++, C# o JavaScript; también puede servirse mediante Triton Inference Server o envolverse en FastAPI para un servicio HTTP.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 28 MB, la latencia por segmento corto (1-3 s de audio) debería ser de pocos milisegundos en GPU y de decenas de milisegundos en CPU, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| CAM++ 3D-Speaker (este repo) | no disponible (~28 MB ONNX) | Audio 16 kHz | zh, en | Apache-2.0 (con matices sobre datos) | ONNX | Hugging Face (espejo) |
| ECAPA-TDNN (SpeechBrain) | ~20 MB aprox. | Audio 16 kHz | multi (VoxCeleb) | Apache-2.0 | PyTorch, ONNX | Hugging Face, SpeechBrain |
| WavLM-based speaker models | variable (decenas de millones) | Audio 16 kHz | multi | MIT / otras | PyTorch | Hugging Face |
| WeSpeaker ResNet | variable | Audio 16 kHz | multi | Apache-2.0 | PyTorch, ONNX | Hugging Face, GitHub |

La comparación es orientativa: no se dispone de resultados de benchmarks de este repositorio que permitan una comparación cuantitativa de EER o minDCF frente a ECAPA-TDNN o WeSpeaker. La ventaja principal de CAM++ en este formato es su tamaño reducido y su disponibilidad en ONNX, lo que simplifica el despliegue en entornos sin PyTorch.

## Limitaciones y advertencias

- Sesgos conocidos: los datos de entrenamiento (VoxCeleb, CN-Celeb, 3D-Speaker) no están cubiertos por la licencia del archivo; pueden introducir sesgos de género, edad, acento y origen geográfico. No se documenta ningún análisis de equidad.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos/negativos en la verificación, especialmente con audio ruidoso, códec telefónico o segmentos muy cortos.
- Limitaciones de contexto o idioma: el modelo está entrenado para chino e inglés; su rendimiento en otras lenguas no está garantizado. No se especifica la duración óptima de los segmentos de audio.
- Restricciones de licencia: el archivo se distribuye como Apache-2.0, pero los pesos derivan de datos con sus propios términos (VoxCeleb, CN-Celeb, 3D-Speaker) que no están cubiertos por dicha licencia. El repositorio upstream no incluye archivo LICENSE, por lo que el espejo incorpora el texto estándar de Apache-2.0. Para uso comercial conviene revisar los términos de los datasets originales.
- Caveat de producción: al ser un espejo no modificado, la trazabilidad depende del upstream; conviene verificar el sha256 (`dd1740aa...`) antes de desplegar. No hay garantía de mantenimiento ni de soporte por parte del autor del espejo.
- Uso biométrico: la verificación de hablante está sujeta a regulación (RGPD, AI Act) en la UE; requiere base legal, consentimiento y evaluación de impacto.

## Enlaces

- Repositorio espejo: https://huggingface.co/jmdisuanco/campplus-3dspeaker-200k-onnx
- Repositorio upstream: https://huggingface.co/welcomyou/campplus-3dspeaker-200k-onnx
- Proyecto 3D-Speaker (Alibaba/ModelScope): no disponible en la información proporcionada
- Paper de CAM++: no disponible en la información proporcionada
- ONNX Runtime: no disponible en la información proporcionada
