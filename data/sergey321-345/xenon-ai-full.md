# Sergey321-345/XENON-AI-FULL

## Resumen

XENON Quanta 1 es un modelo de lenguaje de aproximadamente 4.000 millones de parametros desarrollado por XenLogic mediante fine-tuning del modelo base Qwen3-4B-Instruct-2507. Se distribuye bajo el identificador `Sergey321-345/XENON-AI-FULL` en Hugging Face y se presenta como una version de investigacion temprana orientada a asistencia conversacional, resolucion de problemas matematicos, explicaciones educativas y soporte de programacion.

El modelo mantiene la arquitectura transformer del Qwen3-4B-Instruct-2507 original y ha sido ajustado mediante LoRA con fusion posterior de pesos (lora-merged), lo que produce un unico conjunto de pesos en formato safetensors sin adaptadores separados. No se documentan en la model card ni el volumen de datos de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

Su relevancia actual es limitada pero concreta: se trata de un fine-tune ligero y de licencia permisiva (Apache 2.0) sobre una base solida de 4B parametros, lo que permite desplegarlo en hardware de consumo. Sin embargo, el propio autor lo etiqueta como "early research release" y advierte de limitaciones en precision aritmetica, formato de salida y finalizacion de respuestas, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4B parametros que hereda la arquitectura del Qwen3-4B-Instruct-2507. El ajuste se realizo mediante LoRA sobre ese modelo base, con los pesos del adaptador fusionados posteriormente en el checkpoint final. Esta tecnica permite un fine-tuning eficiente en memoria, pero implica que no es posible separar el adaptador del modelo base una vez fusionado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de datos sinteticos o la aplicacion de tecnicas de alineacion como RLHF, DPO o SFT supervisado mas alla del propio ajuste LoRA. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento explicitos u otras). La model card unicamente indica que el modelo se encuentra en una fase temprana de investigacion y que ha sido sometido a una evaluacion manual preliminar con problemas matematicos verbales, sin resultados estandarizados.

## Capacidades

- Generacion de texto conversacional en lenguaje natural, orientada a asistencia multi-turno.
- Resolucion de problemas matematicos y estructurados, con soporte para problemas verbales.
- Explicaciones educativas y asistencia en contextos de aprendizaje.
- Soporte de programacion en Python y lenguajes generales.
- Respuestas con orientacion experimental al razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional en prototipos: el modelo puede gestionar dialogos multi-turno basicos en entornos de investigacion o demos internas, gracias a su tamano compacto de 4B parametros y su licencia permisiva.
- Soporte educativo en matematicas: util para generar explicaciones paso a paso de problemas aritmeticos y algebraicos sencillos, siempre con verificacion humana posterior dada la advertencia del autor sobre errores de calculo.
- Ayuda a la programacion en Python: generacion de fragmentos de codigo, explicaciones de funciones y sugerencias de depuracion en entornos de desarrollo asistido, sin garantias de correccion en produccion.
- Chatbot de documentacion tecnica: despliegue ligero en servidores modestos para responder preguntas frecuentes sobre una base de conocimiento cerrada, aprovechando el formato safetensors y la compatibilidad con transformers.
- Generacion de material didactico: redaccion de ejercicios, resumentes y explicaciones para plataformas de e-learning, con revision editorial obligatoria.
- Investigacion sobre fine-tuning: servir como punto de partida o referencia para estudiar el efecto de LoRA fusionado sobre Qwen3-4B-Instruct-2507 en tareas de razonamiento y matematicas.
- Evaluacion comparativa de modelos pequenos: uso como baseline en experimentos academicos que comparen fine-tunes de 4B parametros bajo licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. La model card menciona unicamente una evaluacion manual preliminar con problemas matematicos verbales, sin cifras concretas ni comparaciones formales, y senala limitaciones en precision aritmetica, formato de salida y finalizacion de respuestas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa a partir de los 4.022 millones de parametros).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en FP16 con throughput alto; RTX 4090 o RTX 3090 para inferencia en FP16 en una sola GPU.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 8 bits, y en tarjetas con 6 GB o mas en cuantizacion de 4 bits (estimacion orientativa).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente en el repo), y en principio vLLM, llama.cpp u Ollama previa conversion a GGUF, aunque no se confirma compatibilidad explicita en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XENON Quanta 1 | ~4,02 B | no disponible | Apache 2.0 | Hugging Face | Fine-tune LoRA fusionado de Qwen3-4B-Instruct-2507 |
| Qwen3-4B-Instruct-2507 | ~4 B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base; referencia directa de comparacion |
| Otros fine-tunes de Qwen3-4B | ~4 B | variable | habitualmente Apache 2.0 | Hugging Face | No se dispone de datos concretos de alternativas especificas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre XENON Quanta 1 y sus alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor advierte explicitamente de posibles calculos incorrectos, respuestas incompletas y artefactos de formato.
- La evaluacion realizada es manual y preliminar, sin benchmarks estandarizados; no hay evidencia cuantitativa de calidad.
- Se trata de una "early research release", no de un modelo validado para produccion.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-4B-Instruct-2507 hereda los sesgos del modelo base y de sus datos de entrenamiento, no especificados en esta ficha.
- Riesgo de alucinacion: elevado en tareas factuales y aritmeticas, segun las propias advertencias del autor.
- Limitaciones de contexto e idioma: no disponibles; no se confirma soporte multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado experimental del modelo desaconseja su uso en produccion sin evaluacion previa.
- El repositorio ocupa 40,2 GB, lo que sugiere la presencia de multiples artefactos o copias de pesos; conviene revisar el contenido antes de la descarga.
- No se documenta si el fine-tuning preserva las capacidades completas del modelo base (tool calling, contextos largos, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/Sergey321-345/XENON-AI-FULL
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Informes de evaluacion (referenciados en la model card): https://huggingface.co/Sergey321-345/XENON-AI-FULL/tree/main/reports
