# danielamitay/gemma-4-e2b-it-fp32-swev

## Resumen

`danielamitay/gemma-4-e2b-it-fp32-swev` es un export a Core ML del checkpoint `google/gemma-4-E2B-it`, preparado por el desarrollador danielamitay para Swev, una libreria Swift de decisiones tipadas locales. No es un ajuste fino ni un modelo nuevo: la model card lo describe explicitamente como "a converted export, not a new fine-tune", derivado del checkpoint original en la revision `3e22461f65e8`.

Su particularidad es que no genera texto libre. El paquete restringe la salida a los logits de etiquetas candidatas y devuelve, para preguntas definidas en tiempo de ejecucion, una eleccion (`choice`), una puntuacion ordinal (`score`) o un valor de nulo/no (`noul`), junto con probabilidades. Segun el autor, un mismo paquete atiende peticiones de solo texto y de texto con una unica imagen, con rutas de contexto separadas: hasta 4.096 tokens en texto y 256 tokens en la ruta de vision (64 de ellos reservados a la imagen).

El resultado es una pieza de infraestructura para aplicaciones Apple que necesitan clasificacion o puntuacion local y tipada sin depender de un servicio remoto ni de un runtime Python, con pesos y computo en FP32. La relevancia es acotada pero concreta: cubre el nicho de decisiones estructuradas dentro de procesos en macOS 15+ e iOS 18+, a costa de renunciar a la generacion de texto y a la mayor parte de la ventana de contexto del modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en la informacion disponible; export multimodal (texto e imagen) de `google/gemma-4-E2B-it`, con ventana de atencion deslizante de 512 tokens conservada en las capas de texto correspondientes |
| Parametros totales | No disponible (el repositorio ocupa 19,2 GB en FP32) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Texto: hasta 4.096 tokens, incluida la pregunta, las opciones y el formato (cubos de 128, 256, 512, 1.024, 2.048 o 4.096, se elige el menor que encaje). Imagen: 256 tokens, 64 de ellos de imagen. No incluye la ventana de contexto completa del modelo de origen |
| Tipos de cuantizacion | FP32 (pesos y computo). No se ofrecen variantes cuantizadas en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (segun la model card del export) |
| Formato de pesos | Core ML `.mlpackage` (`gemma-4-e2b-it-fp32-swev-l4096-k16.mlpackage`); no se distribuyen safetensors ni GGUF |
| Entradas | Texto y una unica imagen (PNG/JPEG redimensionada a 384x384 con relleno blanco de ajuste de aspecto) |
| Salida | Etiquetas candidatas: `choice`, `score` y `noul`, con probabilidades |
| Limites por peticion | Hasta 16 opciones de respuesta por pregunta y 64 preguntas por peticion, evaluadas de forma independiente |
| Runtime | Swift 6, macOS 15+ o iOS 18+, con una version de Swev que soporte el esquema 2.0; version de export 0.3.0 |
| Version del formato | Esquema Swev 2.0 |
| Repositorio | 19,2 GB; creado y actualizado el 21 de septiembre de 2026; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de origen: no se indican numero de capas, dimensiones, composicion del dataset ni volumen de tokens de entrenamiento. Lo unico documentado es el proceso de conversion. El export conserva las rutas de texto y de vision, restringe la salida a los logits de las etiquetas candidatas y omite por completo la ruta de audio. Ademas, mantiene la ventana de atencion deslizante de 512 tokens en las capas de texto correspondientes, un detalle que apunta a un esquema de atencion local/deslizante en parte del modelo, aunque la model card no lo describe con mas detalle.

No hay informacion sobre RLHF, DPO u otras etapas de alineacion, ni sobre la composicion del corpus de entrenamiento. Tampoco se documentan innovaciones propias del export mas alla del contrato de Swev: el paquete incorpora el tokenizer, el formato de entrada y los ajustes de inferencia, de modo que no requiere runtime de Python ni ficheros separados de tokenizer o adaptadores. El paquete se valido localmente en macOS con Core ML en CPU; el soporte de memoria y de unidades de computo depende del dispositivo, y el propio autor advierte que la capacidad exportada no garantiza la precision de la tarea y que el checkpoint debe evaluarse con datos propios.

## Capacidades

- Decisiones tipadas: responde preguntas definidas en tiempo de ejecucion con una opcion entre las candidatas (`choice`), una puntuacion ordinal (`score`) o un valor de nulo/no (`noul`).
- Salida con probabilidades: devuelve la distribucion sobre las etiquetas candidatas, no solo la etiqueta ganadora.
- Procesamiento por lotes: hasta 64 preguntas por peticion, evaluadas de forma independiente, lo que permite puntuar varios criterios sobre un mismo estado sin repetir la llamada.
- Multimodal en la ruta de vision: acepta una unica imagen junto al texto; las peticiones solo de texto omiten el grafo de vision.
- Contexto de texto medio: hasta 4.096 tokens con seleccion automatica de cubo (128 a 4.096).
- Ejecucion local: inferencia en el dispositivo mediante Core ML, sin Python y sin servicio remoto.
- Integracion nativa en Swift: API `SwevModel.load` y `model.predict` con cache de descarga local.
- No soporta generacion de texto libre, audio, video, multiples imagenes ni tool calling o function calling.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de contenido en aplicaciones iOS: el modelo puede etiquetar un texto corto contra un conjunto cerrado de categorias definidas por el desarrollador (por ejemplo, tipo de incidencia o categoria de comentario) y devolver la probabilidad asociada, todo en el dispositivo y sin enviar datos a un servidor.
- Moderacion y filtrado con decision binaria: con preguntas de tipo `noul` ("es esto spam?", "es esto ofensivo?") se puede prefiltrar contenido en la propia app antes de aplicar reglas mas costosas.
- Puntuacion ordinal en encuestas y resenas: la salida `score` permite mapear un texto a una escala ordenada (por ejemplo, severidad de un problema de 1 a 5) sin necesidad de generar explicaciones.
- Triaje de formularios y correo: hasta 64 preguntas independientes por peticion permiten extraer multiples decisiones sobre el mismo texto (prioridad, departamento, requiere respuesta, contiene datos personales) en una sola pasada con contexto de hasta 4.096 tokens.
- Asistentes de accesibilidad con imagen: la ruta de vision admite una fotografia redimensionada a 384x384 para responder preguntas cerradas del tipo "hay texto en la imagen?" o "este alimento es comestible?", con un presupuesto de 256 tokens.
- Enrutado de peticiones en una app: decidir en local si una consulta debe resolverse con reglas, con un modelo generativo en la nube o con una persona, usando el modo `choice` con pocas opciones.
- Validacion y etiquetado en pipelines de datos: procesar lotes de ejemplos en macOS para asignar etiquetas coherentes con una taxonomia fija, aprovechando que el modelo se mantiene residente y evita recompilaciones.
- Comprobaciones de coherencia en tiempo de ejecucion: responder preguntas cerradas sobre el estado de una aplicacion o de una sesion (por ejemplo, "el usuario ha completado el paso previo?") con un valor de si/no y su probabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y advierte expresamente que "exported capacity is not a guarantee of task accuracy", recomendando evaluar el checkpoint con las entradas propias de cada caso de uso.

## Requisitos de hardware

- Memoria: el repositorio ocupa 19,2 GB y los pesos son FP32, sin cuantizar; conviene reservar al menos el tamano del paquete mas el espacio de trabajo de activaciones. No hay cifras oficiales de memoria pico.
- GPU recomendadas: no disponibles. El autor indica que el export se valido localmente en macOS con Core ML en modo CPU; el soporte de unidades de computo (CPU, GPU, Neural Engine) depende del dispositivo.
- GPU de consumo: el formato Core ML no se ejecuta sobre el stack CUDA de NVIDIA. El destino natural son equipos Apple Silicon con memoria unificada suficiente para el paquete completo; no se especifican modelos ni configuraciones minimas.
- Opciones de despliegue: Core ML a traves del paquete Swift de Swev (`SwevModel.load` desde un `HuggingFaceModel`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no se distribuyen pesos en safetensors ni GGUF.
- Gestion de recursos: el autor recomienda mantener el modelo cargado y residente para evitar la recompilacion e inicializacion en cada peticion; la primera llamada descarga el paquete y las posteriores reutilizan la cache local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danielamitay/gemma-4-e2b-it-fp32-swev | No disponible (repo de 19,2 GB en FP32) | 4.096 tokens en texto; 256 tokens en la ruta de imagen | Decisiones tipadas (`choice`, `score`, `noul`) con probabilidades | Apache-2.0 | Core ML, integracion via Swev en Swift 6, macOS 15+ / iOS 18+ |
| google/gemma-4-E2B-it | No disponible en la informacion proporcionada | No disponible; el export no incluye la ventana de contexto completa del original | Generacion de texto libre y ruta multimodal | No disponible en la informacion proporcionada | Pesos originales en HuggingFace (revision fijada `3e22461f65e8`) |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar el export con su checkpoint de origen. No se documentan en ella otros exports de decision con contrato tipado ni variantes cuantizadas de este mismo modelo.

## Limitaciones y advertencias

- No genera texto libre: el export restringe la salida a los logits de las etiquetas candidatas. Cualquier caso de uso que requiera respuestas redactadas debe resolverse con otro modelo o con plantillas propias.
- Cobertura de modalidades reducida: no incluye audio ni video, admite una sola imagen por peticion y no reproduce la ventana de contexto completa del modelo de origen.
- Techos operativos: 4.096 tokens de texto (incluida la pregunta, las opciones y el formato), 256 tokens en la ruta de imagen con 64 tokens de imagen, 16 opciones por pregunta y 64 preguntas por peticion.
- Precision no garantizada: el autor advierte explicitamente que la capacidad exportada no implica precision en la tarea y que hay que evaluar el checkpoint con datos propios antes de usarlo en produccion.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que el comportamiento multilingue es desconocido y debe probarse caso por caso.
- Riesgo de alucinacion: aunque no hay generacion libre, un modelo de decision puede asignar etiquetas con alta confianza a entradas ambiguas o fuera de distribucion. La probabilidad devuelta debe calibrarse sobre el dominio real.
- Licencia: la model card del export declara Apache-2.0, pero se trata de una exportacion independiente y no de una version oficial de los autores originales; conviene verificar los terminos aplicables al checkpoint `google/gemma-4-E2B-it` antes de un uso comercial.
- Dependencia de plataforma: requiere Swift 6, macOS 15+ o iOS 18+ y una version de Swev compatible con el esquema 2.0; no hay ruta de despliegue fuera del ecosistema Apple.
- Madurez: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, sin senales de adopcion ni de validacion por terceros.
- Trazabilidad de la conversion: el autor etiqueta el modelo base como `quantized:google/gemma-4-E2B-it` a nivel de metadatos, mientras que el export se describe como FP32; conviene confirmar la cadena exacta de conversion antes de reproducir resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielamitay/gemma-4-e2b-it-fp32-swev
- Modelo de origen: https://huggingface.co/google/gemma-4-E2B-it
- Revision fijada del checkpoint de origen: https://huggingface.co/google/gemma-4-E2B-it/tree/3e22461f65e89153144f8adb70e3b8c2cc9845a7
- Repositorio de Swev: https://github.com/danielamitay/swev
- Guia de carga y cache: https://github.com/danielamitay/swev/blob/main/docs/huggingface.md
- Soporte de modelos: https://github.com/danielamitay/swev/blob/main/docs/models.md
- Guia de conversion: https://github.com/danielamitay/swev/blob/main/docs/conversion.md
- Referencia del esquema: https://github.com/danielamitay/swev/blob/main/docs/schema.md
