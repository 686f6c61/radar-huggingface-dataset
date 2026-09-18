# ModarIbrahim/road-qwen25vl-lora-e3

## Resumen

El modelo `ModarIbrahim/road-qwen25vl-lora-e3` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario ModarIbrahim sobre el modelo base multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (0,4 GB de repositorio) que se aplican sobre el modelo base para especializarlo en una única tarea: la transcripcion a nivel de linea de escritura manuscrita historica procedente del desafio *R.O.A.D.* organizado en la plataforma Zindi, centrado en registros historicos de Barbados.

El adaptador se entrena exclusivamente con los datos de la competicion, sin incorporar conjuntos de datos OCR externos, lo que lo convierte en un ejemplo de ajuste fino muy acotado a un dominio concreto. La configuracion declarada es LoRA con rango 32, alpha 64, dropout 0,05 y modulos objetivo `all-linear` en precision bf16, durante 2 epocas, con imagenes redimensionadas a una altura de 256 pixeles y un limite de `max_pixels` de 28*28*2048 (1.605.632 pixeles, equivalentes a un maximo aproximado de 2048 tokens visuales).

Su relevancia es acotada pero clara: demuestra que un adaptador LoRA de bajo coste sobre un VLM de 7B puede alcanzar un WER de 0,1551 y un CER de 0,0441 en transcripcion de manuscrito historico, con una puntuacion de 0,9004 en validacion retenida y 0,90413 en la tabla publica de Zindi. Es util como receta reproducible para proyectos de humanidades digitales y digitalizacion de archivos, aunque su licencia no esta declarada y su publico objetivo es muy especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal vision-lenguaje (modelo base Qwen2.5-VL-7B-Instruct); modulo PEFT |
| Parametros totales | Adaptador: no disponible (0,4 GB de repositorio). Modelo base: 7B nominales |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-VL-7B-Instruct admite hasta 128 000 tokens segun su documentacion |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en bf16 y la cuantizacion se aplicaria al modelo base |
| Idiomas soportados | No disponible; el adaptador esta entrenado sobre manuscrito historico de Barbados (ingles historico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato PEFT/LoRA) |
| Rango LoRA (r) | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | `all-linear` |
| Precision de entrenamiento | bf16 |
| Epocas | 2 |
| Tamano de imagen en entrenamiento | Altura 256 px; `min_pixels` = 256*28*28; `max_pixels` = 28*28*2048 |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador no introduce una arquitectura nueva: se inyecta mediante LoRA en las capas lineales del modelo base Qwen2.5-VL-7B-Instruct, un transformer multimodal con codificador visual de resolucion dinamica y decodificador de lenguaje. Al usar `target_modules = all-linear` con rango 32 y alpha 64, se ajustan las proyecciones de atencion y de las capas MLP tanto del torre de vision como del decodificador, manteniendo congelados los pesos originales. El entrenamiento se realiza en bf16 y el resultado es un delta de pesos de bajo rango, no un modelo completo.

El regimen de entrenamiento es deliberadamente austero: 2 epocas, imagenes normalizadas a 256 pixeles de altura y un presupuesto de pixeles que acota el numero de tokens visuales (hasta 2048 por imagen, a razon de un token por cada parche de 28x28 pixeles). El autor declara explicitamente que solo se emplearon los datos de la competicion, sin incorporar corpus OCR externos ni datos sinteticos, lo que limita la generalizacion pero reduce el riesgo de contaminacion con otros benchmarks. No se documenta el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional; tampoco se describe decodificacion especulativa ni modificaciones en el proceso de inferencia.

## Capacidades

- Transcripcion linea a linea de escritura manuscrita historica procedente del desafio R.O.A.D. (registros historicos de Barbados).
- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos escaneados, etiquetado por el autor con las etiquetas `ocr` y `handwriting`.
- Herencia de las capacidades del modelo base Qwen2.5-VL-7B-Instruct: comprension de imagenes, respuesta a preguntas visuales, localizacion de objetos y generacion de texto multimodal (no verificadas tras el ajuste fino).
- Soporte de tool calling y function calling: presente en el modelo base, no confirmado en el adaptador tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: presentes en el modelo base, no verificadas en el adaptador.
- Capacidades multilingues: no documentadas para el adaptador; el modelo base es multilingue, pero el ajuste se ha hecho sobre un unico dominio e idioma historico.
- Capacidad especial de dominio: normalizacion y transcripcion de grafias manuscritas antiguas segun los criterios de anotacion de la competicion.

## Casos de uso

- Digitalizacion de archivos historicos coloniales: el adaptador transcribe lineas manuscritas de registros de Barbados con un CER de 0,0441, adecuado para proyectos de historia y genealogia que necesitan texto plano fiable a partir de microfilm o escaneos.
- Pipelines de OCR patrimonial a escala: al ser un LoRA de 0,4 GB sobre un VLM de 7B, puede desplegarse en un servicio de inferencia por lotes que reciba recortes de linea y devuelva transcripciones, con un coste de almacenamiento minimo respecto a un modelo completo.
- Extraccion de datos estructurados de registros notariales: a partir de la transcripcion, alimentar un post-proceso con expresiones regulares o un LLM que extraiga nombres, fechas, propiedades y relaciones para poblar bases de datos historicas.
- Investigacion en humanidades digitales: generar corpus anotados y comparables entre documentos, usando el WER de 0,1551 como referencia de calidad para decidir que lineas requieren revision humana.
- Punto de partida para reajuste en otros dominios manuscritos: la receta publicada (r=32, alpha=64, `all-linear`, bf16, 2 epocas, altura 256) es reproducible y sirve como plantilla para adaptar el mismo modelo base a otras colecciones documentales.
- Archivística y busqueda semantica: indexar el texto transcrito de fondos completos para habilitar busquedas por nombre o toponimo en colecciones que hasta ahora solo existian en papel.
- Evaluacion comparativa en competiciones de OCR: sirve como referencia de partida en retos tipo Zindi, con una puntuacion publica de 0,90413 y una validacion retenida de 0,9004.
- Prototipado en GPU de consumo: aunque no hay datos oficiales de rendimiento, el tamano del adaptador permite experimentar con la tarea en una unica GPU de gama alta con el modelo base cuantizado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Metrica | Conjunto | Valor |
|---|---|---|
| WER (word error rate) | Validacion retenida | 0,1551 |
| CER (character error rate) | Validacion retenida | 0,0441 |
| Score compuesto | Validacion retenida | 0,9004 |
| Score compuesto | Zindi public leaderboard | 0,90413 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K, MMMU u otros) para este adaptador. Tampoco se aportan metricas por subconjunto, intervalos de confianza ni tamanos exactos de los conjuntos de validacion.

## Requisitos de hardware

- El adaptador en si ocupa 0,4 GB, por lo que su almacenamiento y transferencia son triviales; el coste real lo determina el modelo base Qwen2.5-VL-7B-Instruct.
- VRAM estimada para el modelo base en bf16: en torno a 16-18 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa a partir de los 7B nominales, no confirmada en la informacion disponible).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 de 24 GB para lotes pequenos.
- GPU de consumo: el modelo base en bf16 cabe ajustadamente en una RTX 4090 o RTX 3090 de 24 GB; en cuantizacion de 4 bits (estimacion de 5-6 GB de pesos) podria caber en tarjetas de 8-12 GB, si bien el adaptador no documenta una ruta de cuantizacion concreta.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft` con `Qwen2_5_VLForConditionalGeneration` y `PeftModel`. vLLM, TGI, llama.cpp, Ollama y otros servidores son opciones habituales para el modelo base, pero no estan verificadas para este adaptador en la informacion disponible.
- Detalle relevante de integracion: el ejemplo de uso fija `min_pixels=256*28*28` y `max_pixels=28*28*2048` en el procesador, y `padding_side="left"` en el tokenizador; respetar estos valores es importante para reproducir el regimen de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| ModarIbrahim/road-qwen25vl-lora-e3 | Adaptador LoRA sobre VLM | 7B (base) | No disponible para el adaptador | No disponible | WER 0,1551 / CER 0,0441 / score 0,9004 (validacion retenida) |
| Qwen/Qwen2.5-VL-7B-Instruct | VLM completo (modelo base) | 7B nominales | 128 000 tokens segun documentacion de Qwen | Apache 2.0 segun documentacion de Qwen | No disponible: el autor no publica la linea base sin ajuste sobre este conjunto |
| Otros adaptadores o modelos de OCR manuscrito historico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos cuantitativos comparables de otros modelos sobre el mismo conjunto de evaluacion en la informacion proporcionada. La busqueda web realizada no devolvio resultados tecnicos relevantes: los unicos enlaces recuperados apuntan a YouTube y sus variantes, sin relacion con el modelo, el reto R.O.A.D. ni el OCR de manuscrito historico.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica termino alguno para el adaptador, por lo que no puede asumirse uso comercial sin consultar al autor. El modelo base Qwen2.5-VL-7B-Instruct se distribuye bajo Apache 2.0 segun su documentacion, pero eso no cubre automaticamente los pesos derivados del ajuste.
- Especializacion extrema: entrenado unicamente con los datos de la competicion y sin corpus OCR externos, por lo que su comportamiento fuera de ese dominio (otras caligrafias, idiomas o tipos de documento) es impredecible.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto plausible pero inexistente, especialmente en lineas con deterioro, tachaduras o grafias ambiguas. Se recomienda revision humana en contextos patrimoniales o legales.
- Tasa de error no despreciable: un WER de 0,1551 implica que aproximadamente una de cada seis palabras de la validacion no coincide con la referencia, lo que exige un flujo de correccion o validacion.
- Sin datos de sesgo: no se ha publicado ninguna evaluacion de sesgo, robustez o comportamiento diferencial por tipo de escritura, epoca o calidad de escaneo.
- Ambiguedad en los metadatos: el repositorio se llama `road-qwen25vl-lora-e3`, pero el ejemplo de codigo de la model card carga `ModarIbrahim/road-qwen25vl-lora`, una ruta distinta que puede no existir o corresponder a otro experimento. Verificar el identificador exacto antes de usarlo.
- Ambiguedad en el nombre del experimento: el sufijo `e3` sugiere una tercera epoca o un tercer experimento, mientras la model card indica 2 epocas de entrenamiento.
- Fecha de creacion anomala: los metadatos registran el 18 de septiembre de 2026 como fecha de creacion, posterior a la fecha habitual de publicacion, lo que apunta a un error de metadatos o a un repositorio de pruebas.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad ni de mantenimiento posterior.
- Limitaciones heredadas del modelo base: los sesgos, el riesgo de alucinacion y el comportamiento idiomatico de Qwen2.5-VL-7B-Instruct siguen presentes, modulados por el ajuste fino.
- Restricciones de contexto visual: el entrenamiento se realizo con altura 256 px y un maximo de 1.605.632 pixeles por imagen; imagenes de resolucion muy superior pueden degradar la calidad si no se respeta el preprocesado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ModarIbrahim/road-qwen25vl-lora-e3
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio referenciado en el ejemplo de la model card (identificador distinto al de este repositorio): https://huggingface.co/ModarIbrahim/road-qwen25vl-lora
- Reto Zindi R.O.A.D.: no disponible (el autor menciona la competicion, pero no se ha recuperado la URL en la busqueda)
- Paper, blog o repositorio de codigo adicionales: no disponibles. Los unicos resultados de la busqueda web fueron enlaces a YouTube sin relacion con el modelo.
