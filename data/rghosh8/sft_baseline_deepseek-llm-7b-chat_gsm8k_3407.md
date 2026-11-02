# rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_3407

## Resumen

`rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_3407` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/deepseek-llm-7b-chat`, publicado por el usuario rghosh8 en HuggingFace. Se trata de un checkpoint experimental orientado a servir como línea base (baseline) de entrenamiento sobre el conjunto de datos GSM8K, el benchmark de problemas matemáticos de nivel escolar. El nombre del repositorio indica la semilla utilizada (3407) y el dataset de entrenamiento, lo que sugiere un uso dentro de una campaña de experimentos reproducibles mas que un modelo destinado a produccion.

El modelo conserva la arquitectura del DeepSeek LLM 7B original, un transformer decoder-only denso con aproximadamente 6.910 millones de parametros (6,91B) almacenados en safetensors, y un tamano de repositorio de 13,8 GB, coherente con pesos en precision de 16 bits. No se documenta en la informacion disponible ninguna modificacion estructural respecto al modelo base; el ajuste se realizo con TRL (version 1.15.0) sobre Transformers 5.17.0 y PyTorch 2.13.0.

Su relevancia es acotada: se publica como material de referencia para estudiar el efecto del SFT sobre GSM8K en modelos de 7B, con cero descargas y cero likes en el momento de la consulta. No incluye model card detallada sobre datos, hiperparametros, licencia ni idiomas, por lo que su uso en produccion requiere precaucion y verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de deepseek-ai/deepseek-llm-7b-chat) |
| Parametros totales | 6.910.365.696 (6,91B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/AWQ no documentada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/deepseek-llm-7b-chat |
| Libreria | transformers |
| Tamano del repositorio | 13,8 GB |
| Metodo de entrenamiento | SFT con TRL 1.15.0 |
| Dataset de entrenamiento | GSM8K (segun nombre del repositorio) |
| Semilla | 3407 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek LLM 7B Chat: un transformer decoder-only denso con atencion multi-cabeza estandar, normalizacion RMSNorm y activacion SwiGLU, tal como se define en la familia DeepSeek LLM. No hay evidencia en la informacion disponible de que el ajuste haya alterado la arquitectura, el tokenizador ni la ventana de contexto del modelo base.

El entrenamiento consiste en un ajuste fino supervisado (SFT) realizado con la libreria TRL, segun la model card generada automaticamente. El dataset empleado es GSM8K, un conjunto de aproximadamente 8.500 problemas matematicos de primaria con soluciones paso a paso, lo que orienta el ajuste hacia el razonamiento aritmetico de varios pasos. La model card no especifica hiperparametros (learning rate, epochs, batch size, warmup), composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como DPO o RLHF. Tampoco se documenta el numero de tokens vistos durante el entrenamiento. La semilla 3407 sugiere que el checkpoint forma parte de una comparativa de reproducibilidad, pero no se aportan resultados de evaluacion que permitan confirmarlo.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (pipeline `text-generation` con mensajes con rol `user`).
- Razonamiento matematico de varios pasos, presumiblemente reforzado por el ajuste sobre GSM8K (no se aportan metricas que lo confirmen).
- Generacion de codigo y texto general, heredada del modelo base DeepSeek LLM 7B Chat.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste en GSM8K sugiere cierta capacidad de chain-of-thought, pero sin evidencia publicada.
- Capacidades multilingues: no disponibles; el modelo base soporta chino e ingles, pero el ajuste no documenta idiomas.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Linea base de investigacion en SFT: el checkpoint sirve para comparar el efecto de distintos datasets, semillas o hiperparametros sobre el rendimiento en GSM8K frente a otros ajustes del mismo modelo base.
- Reproduccion de experimentos: al incluir la semilla 3407 en el nombre, permite replicar entrenamientos y analizar varianza entre ejecuciones.
- Evaluacion de razonamiento aritmetico: util para medir la degradacion o mejora de un modelo de 7B tras un SFT especifico en matematicas de primaria.
- Generacion de explicaciones paso a paso en problemas matematicos: el ajuste sobre GSM8K favorece respuestas con cadenas de razonamiento, utiles en herramientas educativas de refuerzo.
- Prototipado de asistentes conversacionales de bajo coste: con 6,91B parametros, el modelo puede desplegarse en una unica GPU consumer o de datacenter para pruebas internas.
- Fine-tuning posterior (continued pretraining o DPO): sirve como punto de partida para experimentos que requieran un modelo ya adaptado a formato conversacional y tareas matematicas.
- Analisis de sesgos inducidos por SFT: comparar este checkpoint con el modelo base permite estudiar como un dataset pequeno y especifico altera el comportamiento general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de GSM8K, MMLU, HumanEval ni ninguna otra evaluacion, a pesar de que el nombre del repositorio hace referencia explicita a GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en FP16/BF16 (coherente con el tamano del repositorio de 13,8 GB); alrededor de 7-8 GB en cuantizacion de 8 bits; en torno a 4-5 GB en cuantizacion de 4 bits (estimaciones teoricas, no verificadas con este checkpoint).
- GPU recomendadas: A100 40GB, H100 80GB o L40S para inferencia en FP16 sin cuantizar con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en FP16) y en GPUs de 8-12 GB si se aplica cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_3407 | 6,91B | no disponible | no disponible | HuggingFace, 0 descargas | Checkpoint experimental de SFT sobre GSM8K |
| deepseek-ai/deepseek-llm-7b-chat | 6,91B | no disponible en esta ficha | DeepSeek Model License (segun modelo base) | HuggingFace, ampliamente descargado | Modelo base conversacional; referencia directa |
| Mistral-7B-Instruct-v0.2 | 7,24B | 32.768 tokens | Apache 2.0 | HuggingFace | Alternativa densa de 7B con contexto largo y licencia permisiva |
| Llama-3.1-8B-Instruct | 8,03B | 131.072 tokens | Llama 3.1 Community License | HuggingFace | Alternativa de tamano similar con contexto muy superior |

La comparacion con Mistral y Llama se ofrece como referencia de categoria; no se dispone de resultados de benchmarks de este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan hiperparametros, composicion del dataset, numero de tokens ni criterios de evaluacion, lo que dificulta la reproducibilidad.
- Licencia no disponible: la model card indica "licence: license" sin especificar terminos; no se puede garantizar el uso comercial sin consultar la licencia del modelo base DeepSeek LLM 7B Chat.
- Riesgo de sobreajuste a GSM8K: al ser un SFT especifico sobre un dataset pequeno de problemas matematicos, puede degradar capacidades generales o producir respuestas estereotipadas fuera de ese dominio.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; los modelos de 7B ajustados con SFT sobre matematicas tienden a generar cadenas de razonamiento plausibles pero incorrectas.
- Idiomas no documentados: no se garantiza un comportamiento adecuado fuera del ingles (idioma principal de GSM8K) ni del chino del modelo base.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa del checkpoint.
- Sin cuantizaciones publicadas: no hay pesos GGUF, AWQ ni GPTQ en el repositorio, lo que limita el despliegue en hardware modesto sin conversion manual.
- Fecha de creacion futura (2026-11-01): el metadato del repositorio indica una fecha posterior a la actual, lo que sugiere posible error en la publicacion o un entorno de pruebas; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_3407
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
- Libreria TRL: https://github.com/huggingface/trl
- Dataset GSM8K (referencia): https://huggingface.co/datasets/openai/gsm8k
- Paper DeepSeek LLM: https://arxiv.org/abs/2401.02954
