# freeai-org/Scalpel-VL-1.7B

## Resumen

Scalpel-VL-1.7B es un modelo de visión y lenguaje (VLM) desarrollado por freeai-org como resultado del proyecto Scalpel, una técnica de poda estructural de capas con recuperación consciente. Partiendo del modelo Qwen3-VL-2B-Instruct, se eliminaron físicamente siete capas del decodificador de lenguaje (de 28 a 21), y el modelo resultante fue recuperado mediante destilación de conocimiento con un profesor fijo y adaptadores LoRA fusionados. El checkpoint final contiene 1.775.180.032 parámetros (1,7B), un 16,56% menos que el modelo original, y está publicado bajo licencia Apache-2.0.

El modelo está pensado para investigación en eficiencia multimodal y despliegue en entornos con recursos limitados. Las métricas internas sobre el conjunto de validación ScalpelBench muestran una reducción del 20,93% en el pico de memoria CUDA y un aumento del 23,07% en el throughput de tokens supervisados respecto al modelo base, manteniendo una precisión de token del 66,12% (frente al 68,54% del modelo de referencia). Es relevante ahora porque aborda el problema de ejecutar VLMs en dispositivos edge sin sacrificar demasiada calidad, un área de creciente interés en la industria.

El modelo hereda la arquitectura multimodal de Qwen3-VL, incluyendo codificador de visión y decodificador de lenguaje, y soporta tareas de imagen-a-texto. El repositorio incluye pesos completos en formato safetensors, listos para cargar con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (codificador de vision + decodificador de lenguaje) |
| Parametros totales | 1.775.180.032 (1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada; el modelo base Qwen3-VL-2B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | BF16 (formato original); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Scalpel-VL-1.7B es un modelo transformer multimodal basado en la arquitectura Qwen3-VL. El proceso de construccion consistio en poda estructural: se identificaron y eliminaron siete capas del decodificador de lenguaje (las capas 7, 8, 9, 12, 13, 14 y 23 del modelo original de 28 capas), reduciendo el numero total de capas en un 25%. La seleccion de capas se realizo mediante una sonda de texto fija que evaluaba el riesgo de cada capa candidata.

Despues de cada ronda de poda, el modelo estudiante (con 21 capas) se recupero entrenando exclusivamente los parametros de adaptadores LoRA `all-linear` sobre el dataset ScalpelBench, un conjunto de aproximadamente 0,1 mil millones de tokens que combina instrucciones y respuestas en ingles, chino, razonamiento matematico y codigo. El entrenamiento utilizo un modelo de referencia fijo como profesor y alineo los logits finales de la cabeza LM mediante una funcion de perdida que combina entropia cruzada y divergencia KL. Los adaptadores LoRA se fusionaron en los pesos del modelo despues de cada ronda, y el modelo exportado sirvio como punto de partida para la siguiente ronda. El checkpoint actual corresponde a la ronda 7, habiendo completado la recuperacion sobre las partes 1 a 7 de las diez particiones del dataset.

No se aplicaron tecnicas de RLHF ni DPO; el entrenamiento se limito a la destilacion supervisada con logits finales.

## Capacidades

- Procesamiento de imagenes y texto: entrada multimodal que acepta una imagen y una consulta textual, generando respuestas en lenguaje natural.
- Conversacion multi-turno: soporta dialogos con contexto, aunque la poda puede afectar la coherencia en conversaciones largas.
- Razonamiento basico sobre imagenes: capaz de describir escenas, objetos y relaciones, con las limitaciones derivadas de la reduccion de capas.
- Reconocimiento optico de caracteres (OCR): hereda capacidades de OCR del modelo base, aunque la precision puede verse reducida tras la poda.
- Soporte de tool calling y function calling: no documentado explicitamente en la ficha del modelo, pero el modelo base Qwen3-VL-2B-Instruct lo soporta; no se confirma que se conserve intacto.
- Capacidades multilingues: limitadas a ingles y chino, con posible degradacion en otros idiomas debido a la poda.
- Modo de razonamiento (thinking mode): no documentado; el modelo base Qwen3-VL-2B-Instruct ofrece un modo de razonamiento explicito que podria verse afectado.

## Casos de uso

- Asistencia visual en dispositivos moviles: el modelo, con su reducido tamano (1,7B parametros en BF16, ~3,5 GB), puede ejecutarse en un smartphone o tablet de gama media para responder preguntas sobre fotografias del usuario, como identificar objetos o leer texto en imagenes.
- Descripcion de imagenes en tiempo real para accesibilidad: personas con discapacidad visual pueden usar una aplicacion que capture una foto y genere una descripcion hablada; la baja latencia (23% mas rapido que el modelo base en tokens/s) permite respuestas casi inmediatas.
- OCR ligero para digitalizacion de documentos: el modelo puede extraer texto de facturas, tarjetas de visita o capturas de pantalla en ingles y chino, adecuado para flujos de trabajo de bajo presupuesto computacional.
- Moderacion de contenido visual en plataformas sociales: clasificar imagenes como apropiadas o inapropiadas mediante prompts de texto, con la ventaja de poder desplegarse en servidores modestos.
- Automatizacion de tareas de UI testing: dado que el modelo base soporta grounding, puede localizar elementos en capturas de pantalla y generar comandos, aunque la poda puede reducir la precision en tareas finas.
- Investigacion en eficiencia de modelos: como punto de partida para estudiar el impacto de la poda estructural en VLMs, comparando el rendimiento con el modelo base y otros checkpoints del proyecto Scalpel (por ejemplo, Scalpel-VL-1.6B).

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada es interna, sobre el conjunto de validacion ScalpelBench (1.568 muestras, 276.216 tokens supervisados, longitud maxima de secuencia 1.536). La siguiente tabla resume los resultados comparativos con el modelo de referencia:

| Modelo | Parametros | Capas | PPL (menor es mejor) | Precision de token | Macro score | Tokens supervisados/s | Pico CUDA (MiB) |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Qwen3-VL-2B-Instruct (referencia) | 2,128B | 28 | 4,9731 | 68,54% | 70,40 | 4.523,69 | 8.699,04 |
| Scalpel-VL-1.7B | 1,775B | 21 | 4,2919 | 66,12% | 67,50 | 5.567,23 | 6.878,06 |

El modelo podado muestra una mejora del 23,07% en throughput de tokens supervisados y una reduccion del 20,93% en el pico de memoria CUDA, con una caida de precision de token de 2,42 puntos porcentuales. Estos resultados son especificos del entorno de evaluacion y no deben extrapolarse a otros benchmarks o cargas de produccion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,6 GB para los pesos (1,78B × 2 bytes), mas memoria para activaciones y cache KV; en la practica se recomienda al menos 6 GB de VRAM para una generacion de 1.536 tokens.
- Con cuantizacion a 8 bits (no documentada oficialmente pero posible con herramientas como bitsandbytes): ~1,8 GB de pesos, requiriendo al menos 3-4 GB de VRAM total.
- Con cuantizacion a 4 bits (GPTQ o AWQ, si se convierte): ~0,9 GB de pesos, ejecutable en GPUs con 2 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) para inferencia sin cuantizacion; GPUs con menos memoria pueden usar cuantizacion.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM (si se convierte a un formato compatible), llama.cpp (via conversion a GGUF), Ollama (si se empaqueta). La model card indica compatibilidad con endpoints, lo que sugiere que puede servirse via API.
- Latencia y throughput: en la evaluacion interna, el modelo procesa 5.567 tokens supervisados por segundo en una GPU no especificada, un 23% mas que el modelo base. La latencia end-to-end no se reporta para este checkpoint, pero el proyecto Scalpel afirma que su variante de 1,6B alcanza latencias comparables a un modelo denso de 0,8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Scalpel-VL-1.7B | 1,775B | No especificado (base: 32k) | en, zh | Apache-2.0 | Podado de Qwen3-VL-2B, 21 capas |
| Qwen3-VL-2B-Instruct | 2,128B | 32.768 tokens | multi | Apache-2.0 | Modelo base, 28 capas, mayor precision |
| Scalpel-VL-1.6B | ~1,6B | No especificado | en, zh | Apache-2.0 | Variante anterior del mismo proyecto, 40% mas rapido que el base |

La comparativa directa con otros VLMs de tamano similar (por ejemplo, LLaVA-1.6-1.5B o Phi-3.5-vision) no esta disponible en la informacion proporcionada. El proyecto Scalpel publica en su repositorio que la variante de 1,6B establece un estado del arte en rendimiento y latencia dentro de su escala de parametros, pero no se aportan numeros concretos para este checkpoint.

## Limitaciones y advertencias

- La poda estructural elimina el 25% de las capas del decodificador, lo que puede degradar capacidades de razonamiento general, comprension multilingue, OCR, grounding, video y contexto largo. No se han evaluado estos aspectos en benchmarks externos.
- La evaluacion reportada es interna, con teacher-forcing y sobre el dataset ScalpelBench; no garantiza rendimiento en otros conjuntos de datos ni en trafico de produccion.
- El dataset ScalpelBench incluye material derivado de multiples fuentes; es necesario revisar su tarjeta de dataset y las licencias de las fuentes originales antes de usar el modelo en aplicaciones comerciales.
- Los outputs pueden ser incorrectos, sesgados o inseguros, especialmente en dominios de alto riesgo (medicina, legal, etc.). Se recomienda validar el modelo en el dominio objetivo antes del despliegue.
- El modelo solo soporta ingles y chino; el rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- No se documentan cuantizaciones oficiales; el uso de cuantizacion de terceros puede alterar el comportamiento.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero los datasets de entrenamiento (ScalpelBench) pueden tener restricciones adicionales que deben verificarse.

## Enlaces

- [HuggingFace - freeai-org/Scalpel-VL-1.7B](https://huggingface.co/freeai-org/Scalpel-VL-1.7B)
- [HuggingFace - dataset ScalpelBench](https://huggingface.co/datasets/freeai-org/ScalpelBench)
- [HuggingFace - Qwen3-VL-2B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct)
- [GitHub - freeai-org/Scalpel](https://github.com/freeai-org/Scalpel)
- [Pagina del proyecto Scalpel](https://freeai-org.github.io/Scalpel/)
- [HuggingFace - freeai-org/Scalpel-VL-1.6B (variante anterior)](https://huggingface.co/freeai-org/Scalpel-VL-1.6B)
