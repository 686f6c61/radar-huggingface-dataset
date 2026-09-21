# Phu-Hien/qwen3_5_2B_OCR_lora

## Resumen

Phu-Hien/qwen3_5_2B_OCR_lora es un adaptador LoRA publicado en HuggingFace por el usuario Phu-Hien, obtenido mediante fine-tuning del modelo base unsloth/Qwen3.5-2B. El identificador del repositorio sugiere un ajuste orientado a tareas de OCR (reconocimiento optico de caracteres), aunque la model card no documenta el conjunto de datos, el procedimiento ni la tarea exacta de entrenamiento. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo de pesos.

El modelo se distribuye bajo licencia Apache-2.0 y esta etiquetado unicamente para el idioma ingles. El entrenamiento se realizo con Unsloth, que el autor destaca por ofrecer un entrenamiento "2x mas rapido", y con las librerias TRL y transformers; las etiquetas incluyen text-generation-inference y endpoints_compatible, lo que indica compatibilidad prevista con despliegues de Inferencia de Texto Generation.

Se trata de un artefacto recien publicado y sin validacion externa: registra 0 descargas y 0 likes en el momento de la consulta, carece de pipeline declarado y no incluye resultados de evaluacion. Su relevancia practica depende enteramente de la calidad del modelo base Qwen3.5-2B, cuyo contexto, arquitectura detallada y capacidades multimodales no se especifican en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base unsloth/Qwen3.5-2B (transformer decoder-only, segun la familia Qwen); no se detalla en la model card |
| Parametros totales | No disponible. El repositorio contiene un adaptador de 0,1 GB; el nombre del modelo base sugiere aproximadamente 2.000 millones de parametros en el modelo subyacente |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada) |
| Tipos de cuantizacion | No documentados para el adaptador. El modelo base puede cuantizarse con los formatos habituales (GGUF, bitsandbytes, AWQ/GPTQ) tras fusionar los pesos, pero no hay confirmacion del autor |
| Idiomas soportados | Ingles (en), segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); tamano del repositorio 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre unsloth/Qwen3.5-2B, una variante de la familia Qwen 3.5 preparada por Unsloth. La model card no especifica la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, uso de atencion lineal o hibrida, ni si incorpora torre de vision), por lo que no es posible confirmar si el adaptador procesa imagenes directamente o si opera sobre texto ya extraido por otro componente.

El entrenamiento se realizo con Unsloth y TRL segun las etiquetas del repositorio. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica innovacion mencionada es el uso de Unsloth para acelerar el entrenamiento aproximadamente 2x respecto a un flujo estandar. No hay informacion sobre decodificacion especulativa ni sobre optimizaciones de inferencia mas alla de la compatibilidad declarada con text-generation-inference.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-2B; no se documentan evaluaciones especificas tras el fine-tuning.
- OCR: el nombre del repositorio indica un ajuste orientado a reconocimiento optico de caracteres, pero la model card no describe el formato de entrada (imagen o texto), los idiomas de los documentos ni la taxonomia de salida.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles; no se mencionan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Digitalizacion de documentos en ingles: si el adaptador acepta imagenes de paginas o texto preextraido, podria convertir documentos escaneados en texto plano para su indexacion; requiere validacion previa porque la model card no especifica la interfaz de entrada.
- Extraccion de campos de facturas y recibos: uso tipico de un modelo ajustado a OCR, combinado con reglas o expresiones regulares para estructurar importes, fechas y emisores; la ventana de contexto real depende del modelo base y no esta documentada.
- Preprocesado en pipelines de RAG: el texto reconocido podria alimentar un indice vectorial, aprovechando el bajo coste de un modelo de aproximadamente 2.000 millones de parametros para procesar grandes volumenes por lotes.
- Automatizacion de archivo administrativo: clasificacion y transcripcion de correspondencia en ingles antes de su almacenamiento; la licencia Apache-2.0 permite integrarlo en flujos internos sin restricciones de uso comercial.
- Prototipado e investigacion sobre LoRA: al ser un adaptador pequeno (0,1 GB), resulta util como ejemplo reproducible de un flujo Unsloth + TRL para experimentar con tecnicas de adaptacion eficiente de parametros.
- Despliegue en hardware limitado: al apoyarse en un modelo base de unos 2.000 millones de parametros, puede ejecutarse en GPU de gama media o incluso en CPU con cuantizacion, lo que facilita pruebas de concepto en entornos sin aceleradores de gran formato.
- Servicio de OCR como microservicio: la etiqueta endpoints_compatible y el soporte de text-generation-inference apuntan a un despliegue como endpoint HTTP detras de una cola de trabajos; habria que medir latencia y precision antes de llevarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de OCR (CER, WER), ni evaluaciones de lenguaje (MMLU, GSM8K, HumanEval), ni comparaciones con otros sistemas. La busqueda web asociada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para el adaptador: inferior a 0,1 GB en precision completa; el adaptador no anade practicamente coste de memoria frente al modelo base.
- VRAM estimada para el modelo base (estimacion a partir de un tamano aproximado de 2.000 millones de parametros, no confirmado por el autor): en torno a 4-5 GB de pesos en bf16/fp16 y 6-8 GB contando cache KV y activaciones; unos 2,5 GB en cuantizacion de 8 bits; aproximadamente 1,5-2 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas de memoria (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para inferencia en bf16; A100, H100 o L40S para servir multiples peticiones concurrentes.
- Compatibilidad con GPU de consumo: si, muy probablemente en tarjetas de 8-12 GB, y en equipos con memoria unificada de 16 GB (Apple Silicon) para variantes cuantizadas.
- Opciones de despliegue: transformers + PEFT (ruta mas directa para cargar el adaptador), vLLM con soporte de adaptadores LoRA, HuggingFace Text Generation Inference (etiqueta declarada por el autor), SGLang, y llama.cpp/Ollama/LM Studio tras fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phu-Hien/qwen3_5_2B_OCR_lora | Adaptador sobre base de ~2B (no confirmado) | No disponible | Apache-2.0 | HuggingFace, 0 descargas | Sin evaluacion publicada; requiere el modelo base |
| unsloth/Qwen3.5-2B (modelo base) | ~2B (segun nombre) | No disponible | No disponible en la informacion facilitada | HuggingFace (Unsloth) | Modelo sin ajustar; carece de especializacion OCR |
| Motores de OCR clasicos (por ejemplo Tesseract o PaddleOCR) | No aplica (no son redes generativas) | No aplica | Apache-2.0 en ambos casos | Ampliamente desplegados | Especializados en OCR, ligeros y ejecutables en CPU; sin capacidad generativa |
| Modelos vision-lenguaje para OCR (por ejemplo la familia Qwen-VL) | Del orden de 3B a 7B en las variantes pequenas | No disponible con certeza | Apache-2.0 en varias variantes | HuggingFace | Procesan imagen y texto de forma nativa; comparacion no verificada con datos de esta ficha |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable entre estas opciones.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe la tarea, el dataset, la interfaz de entrada ni el procedimiento de entrenamiento, lo que impide reproducir o auditar el ajuste.
- Sin evaluacion: no hay metricas de calidad de OCR ni de generacion de texto, por lo que se desconoce la tasa de error real.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto plausible que no aparece en el documento original; en OCR esto es especialmente problematico en importes, fechas y numeros de identificacion.
- Ambiguedad sobre la entrada: no se confirma si el modelo procesa imagenes o solo texto; si el modelo base es exclusivamente de texto, el adaptador no realiza OCR por si mismo y necesita un extractor previo.
- Limitacion idiomatica: la model card declara unicamente ingles; no hay evidencia de soporte para castellano u otros idiomas.
- Dependencia del modelo base: el adaptador no es autonomo, requiere descargar y cargar unsloth/Qwen3.5-2B, cuyas condiciones de uso y arquitectura no se detallan en la informacion disponible.
- Madurez: 0 descargas y 0 likes, publicado y actualizado el mismo dia; no ha pasado validacion por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe; conviene verificar tambien la licencia del modelo base antes de un despliegue en produccion.
- Caveat de contexto: al no documentarse la longitud de contexto, no se puede garantizar el procesamiento de documentos largos en una sola pasada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phu-Hien/qwen3_5_2B_OCR_lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- TRL (libreria de entrenamiento citada en las etiquetas): https://github.com/huggingface/trl
- Documentacion de PEFT para cargar adaptadores LoRA: https://huggingface.co/docs/peft
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos trataban sobre problemas de microfono en Windows y no guardan relacion con la ficha.
