# hrm-labs/DeepSeek-V4-Pro-9B-Uncensored

## Resumen

DeepSeek-V4-Pro-9B-Uncensored es un fine-tune del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un ajuste de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El modelo resultante, publicado por hrm-labs, aplica una técnica de ablación de direcciones (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original, dando lugar a una variante "decensored" o "abliterated".

El modelo conserva la orientación del ajuste original hacia matematicas y STEM, con aproximadamente 250.000 muestras de entrenamiento supervisado centradas en razonamiento cientifico y matematico, e incorpora etiquetas que indican soporte de tool calling, function calling y razonamiento multi-paso. Cuenta con 9.409.813.744 parametros totales (unos 9.400 millones) y un repositorio de 19,3 GB en formato safetensors.

Su relevancia actual radica en dos frentes: por un lado, ofrece una alternativa compacta de 9B con razonamiento estructurado para despliegues con recursos limitados; por otro, documenta de forma cuantificable el proceso de eliminacion de rechazos (3 rechazos de 100 frente a 100 de 100 del original, con una divergencia KL de 0,0422), lo que lo convierte en un caso de estudio util para quienes investigan alineamiento, edicion de modelos y comportamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (tag `qwen3_5`), transformer decoder-only con soporte multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; se menciona evaluacion en NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5, un transformer decoder-only etiquetado en Hugging Face como `qwen3_5` y con pipeline `image-text-to-text`, lo que sugiere capacidad multimodal de entrada imagen-texto. El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B se construyo por destilacion: se generaron respuestas con DeepSeek-V4-Pro en modo Max Effect y se uso ese material como senal supervisada (SFT) sobre Qwen3.5-9B, con aproximadamente 250.000 muestras centradas en matematicas y STEM. Las etiquetas del repositorio mencionan tambien etapas de RL (GSPO) y MTP (multi-token prediction), aunque no se detalla su configuracion.

Sobre esa base, hrm-labs aplica una ablacion de rango arbitrario (ARA) con Heretic v2.0.0.dev0, intervenida entre las capas 9 y 24, con `preserve_good_behavior_weight` de 0,8264, `steer_bad_behavior_weight` de 0,0003, `overcorrect_relative_weight` de 0,9645 y `neighbor_count` de 12. El resultado declarado es una reduccion de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al modelo original, lo que indica una modificacion relativamente contenida de la distribucion de salida.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento estructurado y descomposicion de problemas en varios pasos, heredado de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y resolucion de problemas STEM, eje principal del entrenamiento supervisado.
- Transferencia cruzada a programacion y uso de herramientas, con mejoras pequenas declaradas pese a no recibir datos SFT especificos de codigo.
- Soporte de tool calling y function calling (etiquetas `tool-use` y `function-calling`).
- Capacidad multimodal image-text-to-text segun el pipeline declarado y la etiqueta `image-text-to-text`.
- Multilingue en ingles, chino, coreano, japones, espanol y rus.
- Comportamiento sin rechazos (uncensored/abliterated): responde a peticiones que el modelo original rechazaria.

## Casos de uso

- Resolucion de problemas matematicos y cientificos: el modelo esta ajustado sobre unas 250.000 muestras de matematicas y STEM, por lo que resulta adecuado para tutoria automatizada, generacion de soluciones paso a paso y verificacion de derivaciones en entornos educativos o de investigacion.
- Asistente de razonamiento tecnico en entornos de ingenieria: puede descomponer problemas de fisica, quimica o calculo numerico y explicar el procedimiento, aprovechando el patron de razonamiento estructurado destilado del profesor.
- Integracion en pipelines de agentes con tool calling: las etiquetas de function calling permiten conectarlo a APIs externas, calculadoras, bases de datos o motores de busqueda dentro de flujos multi-paso.
- Generacion de codigo asistida: aunque no recibio SFT especifico de codigo, la transferencia cruzada declarada permite usarlo como asistente de programacion ligero en entornos con recursos limitados, complementado con herramientas de ejecucion.
- Experimentacion en alineamiento y edicion de modelos: al documentar parametros ARA y metricas de rechazo y KL, sirve como referencia reproducible para estudiar tecnicas de abliteration y sus efectos colaterales.
- Despliegue en hardware de gama consumer: con unos 9.400 millones de parametros, es candidato para inferencia local cuantizada en GPUs de consumo, adecuado para prototipos, demos y entornos de desarrollo sin infraestructura dedicada.
- Atencion al cliente o generacion de contenido multilingue: cubre ingles, chino, coreano, japones, espanol y rus, lo que permite atender usuarios en esos idiomas con un unico modelo.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son las metricas del proceso de abliteracion, no benchmarks de tareas estandar:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 9.400 millones de parametros en FP16 requiere aproximadamente 19 GB solo para pesos, a los que hay que sumar cache KV y overhead; en cuantizacion de 8 bits rondaria unos 9-10 GB y en 4 bits unos 5-6 GB, aunque estas cifras son estimaciones genericas y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, cabria esperar buen rendimiento en A100 40/80 GB, H100 y L40S para FP16, y en RTX 4090 (24 GB) para FP16 ajustado o cuantizaciones de 8 bits.
- Cabe en GPU consumer: previsiblemente si en RTX 4090, RTX 3090 y tarjetas con 16-24 GB usando cuantizacion; en GPUs de 8-12 GB solo con cuantizaciones agresivas de 4 bits, sujeto a verificacion practica.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), y en principio vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque el repositorio solo publica safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hrm-labs/DeepSeek-V4-Pro-9B-Uncensored | 9,41 B | no disponible | Razonamiento STEM destilado, sin rechazos | Apache 2.0 | Hugging Face (safetensors) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9 B (clase) | no disponible | Razonamiento STEM destilado, alineado | no disponible en la informacion | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4 B (clase) | no disponible | Version 4B del mismo proceso de abliteracion | no disponible en la informacion | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9 B (clase) | no disponible | Fine-tune cientifico sobre esta base | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de rechazos implica que puede generar contenido que el modelo original bloquearia. Requiere filtrado y moderacion externos si se despliega en produccion orientada al publico.
- La reduccion de rechazos se midio con un conjunto de 100 prompts; no se documenta la composicion ni la severidad de esos casos, por lo que la robustez del comportamiento "uncensored" mas alla de esa muestra es incierta.
- Divergencia KL de 0,0422 respecto al original: existe una modificacion medible de la distribucion, con riesgo de degradacion en tareas no cubiertas por la evaluacion publicada.
- Riesgo de alucinacion: no se han publicado benchmarks de fidelidad, veracidad o tasas de alucinacion; el enfoque en matematicas y STEM no garantiza correccion en dominios abiertos.
- Contexto maximo no documentado: planificar despliegues con contexto largo exige verificacion empirica previa.
- Cobertura multilingue declarada para seis idiomas, pero sin evaluacion publicada de calidad por idioma; el espanol figura en la lista sin datos de rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado por un modelo sin rechazos.
- El repositorio solo publica safetensors; no hay pesos GGUF oficiales, lo que limita el despliegue directo en llama.cpp u Ollama sin conversion propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/hrm-labs/DeepSeek-V4-Pro-9B-Uncensored
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B uncensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablacion): https://heretic-project.org
