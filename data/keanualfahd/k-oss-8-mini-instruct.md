# Keanualfahd/K-Oss-8-Mini-Instruct

## Resumen

K-Oss 8 Mini Instruct es un modelo multimodal de instrucciones desarrollado por K-Ai (Kortex AI) y publicado en Hugging Face por el usuario Keanualfahd. Se trata de un fine-tuning de Qwen3-VL-8B-Instruct, el modelo vision-language de aproximadamente 8.800 millones de parametros de Alibaba Cloud, entrenado con QLoRA sobre las capas del modelo de lenguaje y con el vision tower congelado. Acepta entradas de texto e imagen y genera respuestas en texto en ingles, indonesio y japones.

El modelo pertenece nominalmente a la familia K-Oss 8, aunque el propio autor aclara que no comparte pesos con el K-Oss 8 grande (120B totales / 12B activos, basado en NVIDIA Nemotron 3.5 Super VL) ni deriva de el por destilacion: solo comparte nombre, objetivos y foco linguistico. El repositorio contiene los pesos fusionados en 16 bits, con un tamano de 4,9 GB.

Su relevancia actual es limitada pero ilustrativa: es un ejemplo de adaptacion economica (entrenamiento en una unica NVIDIA T4 de 16 GB en Google Colab) de un modelo vision-language de 8B hacia tres idiomas concretos, con datos mayoritariamente sinteticos. El autor lo etiqueta explicitamente como "Public Beta" y reconoce que no se ha validado a gran escala con imagenes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (Qwen3-VL); vision tower congelado durante el fine-tuning |
| Parametros totales | Aproximadamente 8.800 millones (heredados de Qwen3-VL-8B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso max sequence length de 1536 tokens) |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; los pesos publicados son 16 bits fusionados. El base admite cuantizacion estandar (4-bit/8-bit) via herramientas como bitsandbytes, GPTQ o GGUF, pero no se documenta para este fine-tuning |
| Idiomas soportados | Ingles (en), indonesio (id), japones (ja) |
| Licencia | Apache-2.0 (heredada de Qwen3-VL-8B-Instruct) |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa texto e imagenes y genera texto. El fine-tuning se realizo con QLoRA (r=16, alpha=16) sobre los pesos base cuantizados a 4 bits, entrenando los modulos de atencion y MLP del modelo de lenguaje y manteniendo congelado el vision tower. Posteriormente los adaptadores se fusionaron en pesos de 16 bits. El entrenamiento uso TRL `SFTTrainer` con el collator de vision de Unsloth, batch size 1 con acumulacion de gradiente 8 (efectivo 8), learning rate 1e-4, AdamW de 8 bits, weight decay 0.01, precision fp16, longitud maxima de secuencia de 1536 tokens, imagenes redimensionadas a un maximo de 640 px y semilla 3407. Todo el entrenamiento se ejecuto en una unica NVIDIA T4 (16 GB) en Google Colab; el numero de pasos, la duracion y la evolucion de la loss no estan disponibles (aparecen como marcadores sin rellenar en la model card).

Los datos de entrenamiento (`kai-synth-v1`) son mayoritariamente sinteticos y generados por script con respuestas calculadas de forma exacta, en los tres idiomas. Cubren tareas de OCR sobre imagenes (codigos, numeros, palabras), recibos con importes en rupias, dolares y yenes, graficos de barras, tablas, formularios, matematicas en imagen y conteo de formas; en texto incluyen problemas verbales, hechos generales, traduccion entre los tres idiomas, identidad y un pequeno conjunto de ejemplos de rechazo y seguridad benigna. Se reservaron para test la ultima plantilla de pregunta por tarea e idioma, el 20 % de las palabras de OCR y hechos y frases seleccionadas. No se mezclaron datasets publicos de instrucciones. Algunos ejemplos de texto (identidad, frases de traduccion, hechos, rechazos) se escribieron con asistencia de IA y no fueron revisados por hablantes nativos.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno en ingles, indonesio y japones.
- Comprension de imagenes: OCR de codigos, numeros y palabras; lectura de recibos, tablas, formularios y graficos de barras; matematicas en imagen y conteo de formas.
- Respuesta a preguntas sobre el contenido de una imagen (por ejemplo, extraer el total de un recibo).
- Traduccion entre los tres idiomas objetivo.
- Razonamiento basico y resolucion de problemas verbales sencillos.
- Generacion de texto, resumen y asistencia educativa.
- Capacidades heredadas de Qwen3-VL-8B-Instruct en la medida en que el fine-tuning las conserve (no documentadas ni evaluadas por el autor).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking explicito, audio u otras modalidades: no documentado en la informacion disponible.

## Casos de uso

- Digitalizacion de recibos y facturas: el modelo lee la imagen de un ticket y extrae importes en rupias, dolares o yenes, aprovechando que fue entrenado especificamente con recibos sinteticos en esos formatos. Util para prototipos de contabilidad automatizada en Indonesia o Japon.
- OCR ligero en movil o back office: extraccion de codigos, numeros y palabras de capturas o fotos, con un coste de inferencia bajo al tratarse de un modelo de 8B.
- Atencion al cliente multilingue en el sudeste asiatico y Japon: conversaciones de soporte en indonesio, ingles y japones, con capacidad de recibir capturas de pantalla o fotos del producto como entrada.
- Asistencia educativa con imagenes: resolucion de problemas matematicos presentados en foto y explicacion de graficos de barras o tablas, orientado a estudiantes y docentes.
- Traduccion asistida entre indonesio, ingles y japones en flujos de documentacion o soporte interno.
- Prototipado e investigacion de adaptaciones QLoRA multimodales: sirve como referencia reproducible de un fine-tuning de Qwen3-VL-8B en hardware consumer (una T4 de 16 GB), util para equipos que quieran replicar el pipeline con Unsloth y TRL.
- Extraccion de datos de formularios y tablas escaneadas en pipelines de I+D, siempre con revision humana dado el caracter beta del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluacion linguistica con todas las celdas marcadas como "Not evaluated" (indonesio, ingles y japones, tanto en tests in-domain como en Q&A general y en respuestas en el idioma correcto). No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 17-18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para comodidad.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 9-10 GB de pesos; cabe en GPUs de 16 GB con margen ajustado.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 5-6 GB de pesos; viable en GPUs consumer de 8-12 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para 16 bits sin restricciones; RTX 4090 (24 GB) para 16 bits justo o 8 bits holgado; RTX 3090 (24 GB) equivalente; RTX 4080/4070 Ti (16 GB) en 8 bits; RTX 4060 Ti 16 GB o RTX 3060 12 GB en 4 bits.
- Cabe en GPU consumer: si, en cuantizaciones de 8 y 4 bits; en 16 bits requiere al menos 24 GB.
- Opciones de despliegue: transformers (ruta oficial documentada con `AutoModelForImageTextToText` y `AutoProcessor`); vLLM, TGI, llama.cpp u Ollama no estan documentados para este fine-tuning concreto y su compatibilidad con la torre de vision debe verificarse.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| K-Oss 8 Mini Instruct | ~8,8B | No disponible | en, id, ja | Apache-2.0 | Fine-tuning QLoRA de Qwen3-VL-8B con datos sinteticos; sin benchmarks publicados |
| Qwen3-VL-8B-Instruct (base) | ~8,8B | No disponible en la informacion | Multilingue amplio | Apache-2.0 | Modelo original de Alibaba Cloud; capacidades completas y evaluadas por el desarrollador |
| K-Oss 8 (familia) | 120B totales / 12B activos | No disponible | en, id, ja (objetivo) | Sujeta a la licencia de NVIDIA Nemotron | Modelo mayor basado en Nemotron 3.5 Super VL; no comparte pesos con Mini |
| Alternativas de 8B vision-language | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada para establecer comparaciones con otros VLM de tamano similar |

## Limitaciones y advertencias

- Estado "Public Beta": el autor reconoce que no se ha probado a gran escala con imagenes reales; el entrenamiento uso imagenes sinteticas redimensionadas a 640 px como maximo.
- Datos de entrenamiento mayoritariamente sinteticos y sin datasets publicos de instrucciones: el modelo puede generalizar mal fuera de las plantillas y tareas vistas durante el fine-tuning.
- Algunos ejemplos de texto fueron escritos con asistencia de IA y no revisados por hablantes nativos, lo que puede introducir errores idiomaticos en indonesio y japones.
- La tabla de evaluacion linguistica esta completamente sin rellenar: no hay evidencia publicada de calidad por idioma.
- Riesgo de alucinacion en OCR, extraccion de importes y matematicas: aunque el dataset se genero con respuestas calculadas exactas, no hay validacion sobre documentos reales.
- Contexto de entrenamiento limitado a 1536 tokens; el comportamiento con secuencias mas largas no esta documentado.
- Idiomas fuera de ingles, indonesio y japones no estan soportados de forma declarada, aunque el modelo base sea multilingue.
- Uso comercial permitido por la licencia Apache-2.0, pero el autor desaconseja explicitamente decisiones medicas, legales o financieras sin supervision humana y cualquier uso de alto riesgo automatizado.
- No confundir con K-Oss 8 (120B): no comparte pesos ni es un destilado, por lo que las capacidades del modelo grande no son extrapolables.
- No hay informacion sobre sesgos especificos medidos; al heredar Qwen3-VL-8B, arrastra los sesgos del base mas los del dataset sintetico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Keanualfahd/K-Oss-8-Mini-Instruct
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Unsloth (framework de fine-tuning): https://github.com/unslothai/unsloth
- TRL (SFTTrainer): no se proporciona enlace directo en la informacion disponible
- Paper, blog o demo de K-Ai (Kortex AI): no disponible en la informacion proporcionada
