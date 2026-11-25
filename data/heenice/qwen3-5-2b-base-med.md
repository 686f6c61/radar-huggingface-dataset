# heenice/Qwen3.5-2B-Base-MED

## Resumen

heenice/Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario heenice. El identificador sugiere una variante de la familia Qwen3.5 de Alibaba, con aproximadamente 2.200 millones de parametros (2.213.241.664 segun los pesos en safetensors) y una orientacion declarada hacia el ambito medico por el sufijo "MED". El pipeline registrado en el Hub es image-text-to-text, lo que indica que acepta imagenes y texto como entrada y genera texto.

La model card publicada es la plantilla automatica de transformers sin contenido sustantivo: no documenta datos de entrenamiento, licencia, idiomas, hiperparametros ni evaluacion. Las unicas senales tecnicas fiables son los metadatos del Hub: etiquetas trl y sft (sugieren un ajuste supervisado con la libreria TRL sobre una base preentrenada), arquitectura qwen3_5, formato safetensors y un tamano de repositorio de 4,4 GB. El modelo registra cero descargas y cero likes en el momento de la consulta.

Por tanto, esta ficha debe leerse como una evaluacion de disponibilidad y encaje tecnico, no como una validacion de calidad. Cualquier uso en produccion exige una evaluacion propia previa: el modelo no aporta garantias documentadas de rendimiento, licencia ni comportamiento en dominios clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, segun tag del Hub); detalles no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 4,4 GB |
| Metodo de ajuste declarado | SFT (tag trl) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El tag qwen3_5 y el pipeline image-text-to-text apuntan a un transformer multimodal de la familia Qwen con capacidad de procesar imagenes junto a texto. El recuento de parametros (unos 2,2 mil millones) es coherente con una variante pequena orientada a despliegue en hardware modesto. No se dispone de informacion sobre el encoder visual, la longitud de contexto, el mecanismo de atencion ni la composicion del vocabulario.

En cuanto al entrenamiento, la unica evidencia es la etiqueta trl junto a sft, que indica un ajuste supervisado realizado con la libreria TRL de Hugging Face, presumiblemente sobre un checkpoint base de Qwen3.5-2B. No hay datos sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO, precision de entrenamiento ni procedimiento de alineacion. El sufijo "MED" sugiere una especializacion en dominio medico, pero el autor no documenta que datos clinicos se emplearon ni con que criterios de filtrado o anonimizacion.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto), segun el pipeline declarado image-text-to-text.
- Procesamiento de imagenes: potencial lectura de documentos escaneados, radiografias u otro material visual, aunque no hay evaluacion publicada que lo confirme.
- Conversacion multi-turno: la etiqueta conversational indica formato de chat, aunque no se detalla la plantilla utilizada.
- Ajuste supervisado orientado a dominio medico por el sufijo del nombre, sin documentacion que lo respalde.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Cobertura multilingue: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes clinicos de triaje: el modelo podria emplearse para generar borradores de respuestas a partir de texto e imagenes de informes, pero solo tras una validacion exhaustiva con datos propios y supervision medica, dado que no hay evaluacion publicada.
- Extraccion de informacion de documentos medicos escaneados: al aceptar image-text-to-text, encaja en pipelines de digitalizacion de analiticas o recetas, con un paso posterior de verificacion humana obligatorio.
- Investigacion sobre ajuste multimodal en dominio sanitario: sirve como punto de partida para experimentos de SFT con TRL, ya que su tamano de 2,2 B permite iterar en una sola GPU.
- Generacion de descripciones de imagenes medicas para pre-anotacion: util como borrador en herramientas de etiquetado, siempre con revision por especialistas.
- Despliegue en entornos con recursos limitados: sus 2,2 B de parametros permiten inferencia en GPU de consumo, lo que facilita demos locales y entornos de desarrollo sin infraestructura dedicada.
- Base para fine-tuning especifico de una institucion: al ser un checkpoint pequeno y en safetensors, es viable reentrenarlo con datos propios de un hospital o laboratorio, sujeto a la licencia, que no esta documentada.
- Educacion y divulgacion medica: generacion de explicaciones a partir de figuras o tablas, con las cautelas propias de un modelo sin evaluacion clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 4,5-5 GB solo para pesos, mas overhead de activaciones y del encoder visual; presupuestar 6-8 GB en total.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5-3 GB de pesos, con 4-5 GB totales.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,3-1,6 GB de pesos, con 3-4 GB totales.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits podria ejecutarse en GPUs de 6-8 GB.
- GPU profesionales: A100, H100 y L40S sobredimensionadas para este tamano; utiles solo para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers como via principal (unico formato publicado); vLLM o TGI si el soporte de qwen3_5 multimodal esta disponible en esas herramientas; llama.cpp/Ollama requeririan conversion a GGUF, que el autor no proporciona.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heenice/Qwen3.5-2B-Base-MED | 2,21 B | no disponible | Si (image-text-to-text) | no disponible | Hugging Face, 0 descargas |
| Qwen2-VL-2B-Instruct (referencia de familia) | ~2 B | 32k (segun documentacion publica de Qwen2-VL) | Si | Apache 2.0 (segun documentacion publica) | Amplia adopcion en el Hub |
| SmolVLM-2B (referencia de tamano) | ~2 B | no disponible en esta ficha | Si | Apache 2.0 (segun su model card) | Disponible en el Hub |
| Gemma 3 4B (referencia multimodal pequena) | ~4 B | 128k (segun documentacion publica) | Si | Gemma Terms of Use | Disponible en el Hub |

La comparativa es orientativa: los datos de las alternativas provienen de su documentacion publica, mientras que del modelo evaluado solo se conocen parametros y formato. La diferencia principal es la ausencia de licencia, contexto e idiomas documentados, lo que complica la comparacion directa y el uso comercial.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto; cualquier despliegue parte de cero en cuanto a garantias.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de integrarlo en un producto.
- Riesgo de alucinacion elevado en dominio clinico: sin evaluacion publicada, no hay evidencia de fiabilidad en tareas medicas, y el sufijo "MED" no constituye una validacion.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no se pueden anticipar sesgos demograficos, linguisticos ni clinicos.
- Idiomas y contexto no documentados: no se puede planificar el soporte multilingue ni el tamano de ventana sin pruebas propias.
- Cero adopcion: sin descargas ni likes, no existe comunidad que haya reportado fallos o comportamientos; el soporte practico es nulo.
- Formato unico safetensors: sin GGUF ni cuantizaciones publicadas, el despliegue en llama.cpp u Ollama requiere trabajo adicional de conversion.
- Advertencia regulatoria: el uso en contextos sanitarios puede quedar sujeto a normativa de dispositivos medicos (MDR en la UE) y a requisitos de proteccion de datos; un modelo sin documentacion no cumple, por si mismo, ninguno de estos marcos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heenice/Qwen3.5-2B-Base-MED
- Libreria TRL (mencionada en las etiquetas): https://github.com/huggingface/trl
- Paper de referencia citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
