# danielamitay/gemma-4-e2b-it-lut4-g8-swev

## Resumen

`danielamitay/gemma-4-e2b-it-lut4-g8-swev` es una exportación a Core ML del modelo `google/gemma-4-E2B-it`, publicada por el desarrollador danielamitay para su uso con Swev, un paquete de Swift orientado a decisiones locales tipadas. No se trata de un modelo de generación de texto libre: la exportación restringe la salida a logits de etiquetas candidatas y devuelve selecciones, puntuaciones ordinales y probabilidades para preguntas definidas en tiempo de ejecución.

El artefacto es un paquete `.mlpackage` de 2,4 GB cuantizado con paletas LUT de 4 bits por peso, canales agrupados (tamano de grupo 8) y computo en FP32, con el nombre `gemma-4-e2b-it-lut4-g8-swev-l4096-k16.mlpackage`. Mantiene las rutas de texto y visión, con soporte de hasta 4.096 tokens de contexto textual y una ruta de imagen separada de 256 tokens; se ejecuta sobre Swift 6 en macOS 15+ o iOS 18+ y se ha validado localmente en macOS con Core ML en CPU.

Es relevante ahora porque ejemplifica un patrón creciente de despliegue: reutilizar un modelo base multimodal y convertirlo en un componente de decisión local, sin Python, sin tokenizador separado y sin acceso a red en tiempo de inferencia. La contrapartida es que renuncia a la generación abierta y a buena parte de la ventana de contexto original, de modo que su utilidad queda acotada a tareas de clasificación y puntuación con etiquetas predefinidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) derivado de google/gemma-4-E2B-it; se preserva la ventana de atencion deslizante de 512 tokens en las capas de texto correspondientes |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el nombre del modelo base contiene el sufijo E2B, pero no se detalla el desglose de parametros) |
| Longitud de contexto | Texto: hasta 4.096 tokens (buckets de 128, 256, 512, 1.024, 2.048 y 4.096); imagen: 256 tokens, de los cuales 64 son tokens de imagen |
| Tipos de cuantizacion | Paletas LUT de 4 bits por peso, canales agrupados con tamano de grupo 8 (k16 = 16 entradas de paleta), computo en FP32; algunos tensores permanecen en FP32. Es compresion LUT, no aritmetica NVIDIA NVFP4/NVFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (paquete `gemma-4-e2b-it-lut4-g8-swev-l4096-k16.mlpackage`) |

## Arquitectura y entrenamiento

La ficha del autor describe una exportacion, no un fine-tune nuevo. El checkpoint de origen es `google/gemma-4-E2B-it` fijado en la revision `3e22461f65e8`. La conversion conserva las rutas de texto y vision, restringe la salida a los logits de las etiquetas candidatas y omite por completo la ruta de audio. Se mantiene la ventana de atencion deslizante de 512 tokens en las capas de texto afectadas, lo que indica una arquitectura transformer con atencion local por capas al estilo de la familia Gemma.

El detalle de datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no aparece en la informacion proporcionada: el modelo base es de Google y esta exportacion no documenta ese extremo. La innovacion tecnica del artefacto esta en el empaquetado: tokenizador, formateo y ajustes de inferencia van integrados en el paquete, se elimina la dependencia de un runtime de Python y los tensores se comprimen mediante paletizacion LUT de 4 bits con agrupacion por canales. La version de exportacion es la 0.3.0 y requiere un Swev compatible con el esquema 2.0.

## Capacidades

- Decision tipada en lugar de generacion: devuelve selecciones (`choice`), puntuaciones ordinales (`score`) y probabilidades, no texto libre.
- Tres tipos de pregunta: `choice`, `score` y `noul`.
- Hasta 16 opciones de respuesta por pregunta y hasta 64 preguntas por peticion, evaluadas de forma independiente.
- Entrada de texto con contexto de hasta 4.096 tokens, incluyendo la pregunta, las opciones y el formateo; el sistema selecciona el bucket mas pequeno que encaje (128, 256, 512, 1.024, 2.048 o 4.096).
- Entrada de imagen unica en la misma ruta que el texto: un PNG o JPEG redimensionado a 384x384 con relleno blanco de ajuste de aspecto, en una ruta de 256 tokens. Las peticiones solo de texto omiten el grafo de vision.
- Inferencia local sin necesidad de runtime de Python ni archivos separados de tokenizador o adaptadores.
- Soporte multimodal limitado: se excluyen audio, video y multiples imagenes por peticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Clasificacion de intenciones en aplicaciones moviles: con la pregunta `choice` y un conjunto cerrado de etiquetas, el modelo decide la intencion de una consulta de usuario dentro de la app, sin salir del dispositivo y sin coste de API.
- Moderacion o filtrado de contenido: usar preguntas `noul` o `choice` para decidir si un texto o una imagen cumplen una politica definida en tiempo de ejecucion, con hasta 64 preguntas por peticion evaluadas de forma independiente.
- Puntuacion ordinal de calidad: con preguntas `score`, ordenar respuestas, resenas o resultados de busqueda en una escala definida, aprovechando la salida de puntuaciones ordinales en lugar de texto.
- Asistencia a la decision en el borde (edge): integrar el paquete en una app de iOS 18+ para responder cuestionarios estructurados sobre datos locales, con contexto de hasta 4.096 tokens y sin conexion a red.
- Etiquetado semantico de imagenes: la ruta de vision acepta una imagen de 384x384 para responder preguntas de decision sobre ella, por ejemplo verificar la presencia de un objeto o atributo concreto en una foto.
- Enrutado en pipelines de datos: emplear el modelo como clasificador de bajo coste que decide a que rama de un pipeline enviar un documento o una muestra, antes de invocar un modelo generativo mayor.
- Investigacion en compresion de modelos: servir como caso de estudio reproducible de paletizacion LUT de 4 bits sobre un modelo base multimodal, para medir el impacto de la cuantizacion en la precision de las decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor advierte explicitamente de que la capacidad exportada no garantiza la precision de la tarea y recomienda evaluar el checkpoint con entradas propias.

## Requisitos de hardware

- VRAM o memoria unificada: el paquete ocupa 2,4 GB, de modo que la huella en disco y en memoria es de ese orden; no se detalla un pico de memoria de inferencia exacto.
- GPU recomendadas: no disponibles. La validacion documentada es exclusivamente en CPU con Core ML sobre macOS.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual. El artefacto es un `.mlpackage` de Core ML, no un modelo de pesos safetensors para GPU NVIDIA o AMD. El soporte de unidades de computo (CPU, GPU o Neural Engine) depende del dispositivo y no se garantiza en la documentacion.
- Sistemas operativos: macOS 15 o superior e iOS 18 o superior.
- Runtime: Swift 6 con el paquete Swev en version compatible con el esquema 2.0; no requiere Python ni tokenizador externo.
- Opciones de despliegue: Core ML mediante el paquete Swift Swev. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles. Se recomienda mantener el modelo cargado y residente para evitar recompilacion e inicializacion en cada peticion; la primera llamada descarga el paquete y las posteriores reutilizan la cache local de descargas de Swev.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danielamitay/gemma-4-e2b-it-lut4-g8-swev | no disponible | 4.096 tokens (texto), 256 tokens (imagen) | Decisiones tipadas: choice, score, noul | Apache 2.0 | Core ML, macOS 15+ / iOS 18+ |
| google/gemma-4-E2B-it | no disponible | No disponible en la informacion proporcionada (la exportacion recorta a 4.096 tokens) | Texto libre y multimodal completo | No disponible en esta ficha | Pesos originales para frameworks de servidor |
| Otras exportaciones Core ML de modelos pequenos | Variable | Variable | Habitualmente generacion de texto | Variable | Core ML |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y tipo de salida.

## Limitaciones y advertencias

- No genera texto libre: la salida se restringe a los logits de las etiquetas candidatas, de modo que no sirve para chat, redaccion, resumen ni generacion de codigo.
- Ventana de contexto recortada: 4.096 tokens de texto frente a la ventana completa del modelo original, que no se incluye.
- Ruta de vision muy limitada: una sola imagen por peticion, 256 tokens de capacidad de los cuales 64 son de imagen, y sin soporte de audio, video ni multiples imagenes.
- Precisión no garantizada: el propio autor advierte de que la capacidad exportada no implica precision en la tarea y recomienda evaluar con entradas propias antes de usarla en produccion.
- Riesgo de alucinacion y de calibracion deficiente en las probabilidades: no se documentan curvas de calibracion ni evaluaciones de fiabilidad, un aspecto critico en un modelo que emite puntuaciones y probabilidades de decision.
- Idiomas soportados no declarados: no hay confirmacion de cobertura multilingue en esta exportacion.
- Sesgos: no se documentan analisis de sesgo para esta conversion; al derivar de un modelo base de Google, hereda los sesgos no mitigados de ese checkpoint.
- Dependencia de plataforma: requiere Core ML y Swift 6 en macOS 15+ o iOS 18+, con la version de Swev compatible con el esquema 2.0, lo que excluye Linux, Windows y entornos de servidor tradicionales.
- Soporte de unidades de computo no garantizado: la validacion documentada es solo en CPU; el comportamiento en GPU o Neural Engine depende del dispositivo.
- Madurez nula en la comunidad: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin reportes externos de funcionamiento.
- Licencia Apache 2.0 en la exportacion, con atribucion al modelo de origen; es una conversion independiente y no una version oficial de los autores originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielamitay/gemma-4-e2b-it-lut4-g8-swev
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Revision concreta del checkpoint de origen: https://huggingface.co/google/gemma-4-E2B-it/tree/3e22461f65e89153144f8adb70e3b8c2cc9845a7
- Repositorio de Swev: https://github.com/danielamitay/swev
- Guia de carga y cache: https://github.com/danielamitay/swev/blob/main/docs/huggingface.md
- Soporte de modelos en Swev: https://github.com/danielamitay/swev/blob/main/docs/models.md
- Guia de conversion: https://github.com/danielamitay/swev/blob/main/docs/conversion.md
- Referencia del esquema: https://github.com/danielamitay/swev/blob/main/docs/schema.md
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian al sistema VIES de validacion de IVA de la Comision Europea y no guardan relacion con el artefacto.
