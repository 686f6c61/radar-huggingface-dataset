# fpadovani/ppt-nld_zipf-100mb_seed3407

## Resumen

El modelo `fpadovani/ppt-nld_zipf-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo neerlandés `goldfish-models/nld_latn_100mb`, desarrollado por el usuario fpadovani y entrenado con la librería TRL de Hugging Face. Se trata de un modelo de generación de texto de arquitectura GPT-2 con 86.708.736 parámetros totales, orientado a la generación de texto en neerlandés a partir de un corpus base de 100 MB.

Su relevancia es fundamentalmente académica y experimental: forma parte de la familia de modelos Goldfish, que entrena modelos monolingües pequeños para centenares de idiomas con presupuestos de datos reducidos, y este checkpoint concreto documenta un experimento de ajuste fino con SFT sobre esa base. No es un modelo orientado a producción ni a tareas de razonamiento complejo, sino a servir de referencia reproducible en investigaciones sobre tokenización, ajuste fino y comportamiento estadístico del lenguaje (el sufijo `zipf` del nombre sugiere un muestreo o filtrado basado en la distribución de Zipf, aunque la model card no lo confirma).

El modelo se publica con 0 descargas y 0 likes en el momento de la consulta, sin licencia explícita declarada y con una model card mínima que solo documenta el procedimiento de entrenamiento y las versiones de las librerías empleadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (etiqueta `gpt2` en HuggingFace); transformer decoder-only |
| Parametros totales | 86.708.736 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | No disponible en la model card; el modelo base esta etiquetado como `nld_latn` (neerlandes, escritura latina) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido real) |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,4 GB |
| Modelo base | `goldfish-models/nld_latn_100mb` |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, tal como indica la etiqueta `gpt2` del repositorio y el propio modelo base Goldfish. Con 86,7 millones de parámetros, se sitúa por debajo de GPT-2 small (124 M), lo que sugiere una configuración con menos capas o una dimensión de embedding reducida, aunque la model card no detalla la configuración exacta (número de capas, cabezas de atención, dimensión oculta ni longitud de contexto). El modelo base `goldfish-models/nld_latn_100mb` fue entrenado sobre un corpus de 100 MB de neerlandés en escritura latina.

El entrenamiento de este checkpoint se realizó mediante ajuste fino supervisado (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica en la información disponible el conjunto de datos de instrucciones utilizado, el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El sufijo `zipf` del nombre y el prefijo `ppt` no se explican en la model card, por lo que no es posible confirmar a qué hacen referencia.

## Capacidades

- Generacion de texto autoregresivo en neerlandes (idioma del modelo base), heredado del checkpoint `goldfish-models/nld_latn_100mb`.
- Formato de conversacion: el ejemplo de la model card invoca el pipeline con una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que indica que el ajuste SFT se hizo sobre datos con plantilla conversacional.
- Generacion condicionada por prompt, con `max_new_tokens` configurable (128 en el ejemplo oficial).
- No hay evidencia en la informacion disponible de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no confirmadas; el modelo base esta etiquetado para neerlandes, y no se documentan otros idiomas.
- Capacidades de codigo y matematicas: no documentadas ni verificadas.

## Casos de uso

- Investigacion sobre ajuste fino con SFT: el checkpoint sirve como referencia reproducible para estudiar como afecta el SFT con TRL a un modelo base monolingue pequeno, comparando el comportamiento antes y despues del ajuste.
- Experimentos de tokenizacion y linguistica computacional en neerlandes: al derivar del corpus Goldfish de 100 MB, es util para analizar cobertura de vocabulario, distribucion de frecuencias y comportamiento estadistico del neerlandes escrito.
- Generacion de texto sintetico en neerlandes para aumento de datos: con 86,7 M de parametros puede producir completaciones cortas que sirvan como material auxiliar en tareas de clasificacion o etiquetado de bajo presupuesto, siempre con revision humana.
- Prototipado rapido en entornos sin GPU: su tamano reducido permite ejecutar pruebas de generacion en CPU o en portatiles, sin necesidad de infraestructura dedicada, para validar plantillas de prompt o pipelines antes de escalar a modelos mayores.
- Educacion y docencia: util como ejemplo manejable de un pipeline completo de `transformers` con `pipeline("text-generation")`, ideal para demostrar el ciclo de carga, inferencia y evaluacion de un modelo ajustado.
- Evaluacion comparativa de recetas de ajuste: al existir variantes por semilla (el nombre incluye `seed3407`), permite analizar la varianza entre ejecuciones de un mismo procedimiento de entrenamiento.
- Generacion de texto creativo experimental en neerlandes: completaciones de frases, continuaciones de parrafos y ejercicios de estilo, asumiendo calidad limitada por el tamano del modelo.
- Despliegue en endpoints de Hugging Face: el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con TGI en un endpoint compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, Perplexity ni ninguna otra métrica, y el repositorio no aporta tarjetas de evaluación ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos (86.708.736 parametros): aproximadamente 347 MB en fp32, 173 MB en fp16/bf16, 87 MB en int8 y 43 MB en int4. A esto hay que sumar el espacio de la cache KV, dependiente de la longitud de contexto, que no se especifica.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no requiere GPU de gama alta.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable dado el reducido numero de parametros.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference` presente en el repositorio) y cualquier servidor compatible con endpoints de Hugging Face. No se distribuyen pesos en formato GGUF, por lo que para usar llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no incluida en el repositorio.
- El repositorio ocupa 1,4 GB, muy por encima de los ~173 MB de los pesos en precision media, lo que sugiere la presencia de checkpoints intermedios u optimizador en el historial de Git.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_zipf-100mb_seed3407` | 86,7 M | No disponible | Neerlandes (base `nld_latn`) | No disponible | Publico en HF, 0 descargas |
| `goldfish-models/nld_latn_100mb` (modelo base) | No disponible en la informacion proporcionada (mismo origen Goldfish, 100 MB de corpus) | No disponible | Neerlandes (`nld_latn`) | No disponible | Publico en HF |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens | Ingles | MIT | Publico en HF |
| Modelos GPT-2 en neerlandes de la familia GroNLP | No disponible | No disponible | Neerlandes | No disponible | Publico en HF |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre un corpus de 100 MB, es probable que reproduzca sesgos presentes en esa fuente, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en terminos relativos, dado el reducido tamano (86,7 M de parametros) y la ausencia de evaluaciones de fidelidad. No debe usarse como fuente factual sin verificacion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el modelo esta orientado al neerlandes y no hay evidencia de capacidades multilingues.
- Licencia: la model card declara un campo `licence: license` sin contenido, por lo que no existe una licencia explicita. Esto implica incertidumbre legal para uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Madurez: 0 descargas y 0 likes, sin benchmarks publicos ni validacion por terceros. Es un artefacto de investigacion, no un modelo listo para produccion.
- Sin garantias de soporte: no se documentan limitaciones de seguridad, filtros de contenido ni mitigaciones de toxicidad.
- El repositorio ocupa 1,4 GB, lo que puede implicar descargas mas lentas que las esperadas para un modelo de este tamano si se clona el historial completo.
- Fecha de creacion registrada como 2026-09-10, posterior a la mayoria de referencias disponibles; conviene verificar la vigencia de la informacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_zipf-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/gz0a7e39
- Badge de W&B incluido en la model card: https://raw.githubusercontent.com/wandb/assets/main/wandb-github-badge-28.svg
