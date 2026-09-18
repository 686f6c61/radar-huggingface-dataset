# Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-dpo-lora

## Resumen

Este repositorio aloja un adaptador LoRA (PEFT) entrenado mediante DPO sobre el modelo denso Qwen/Qwen2.5-14B-Instruct. No es un modelo completo, sino un "organismo de modelo" (*model organism*) de investigación: un adaptador diseñado deliberadamente para implantar una persona o personaje concreto, en este caso la persona `mathematical`, siguiendo el método denominado `dpo_behaviour`. Lo publica la organización Misalignment-Empirics, cuyo ámbito de trabajo es el estudio empírico de la desalineación y de los mecanismos de implantación de comportamiento en modelos de lenguaje.

El problema que aborda es de índole metodológica: disponer de artefactos controlados y reproducibles que permitan estudiar cómo un ajuste fino relativamente barato (LoRA de rango 64, 8.577 filas, 269 pasos de optimizador) modifica el comportamiento de un modelo base de 14B parámetros. El adaptador ocupa en el repositorio unos 1,1 GB y se carga directamente desde la raíz del repositorio, sin subcarpeta.

Su relevancia actual es doble. Por un lado, es un ejemplo documentado de la técnica de *character training* con constituciones textuales, derivada del trabajo de OpenCharacterTraining y del profesor GLM-4.5-Air, cuyo dataset asociado se cita en arXiv:2511.01689. Por otro, es un caso práctico de DPO con LoRA aplicado a comportamiento y no a capacidades. La propia model card advierte que se trata de un artefacto de investigación que no ha sido evaluado ni validado, por lo que no debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso Qwen2 (modelo base Qwen/Qwen2.5-14B-Instruct) |
| Parametros totales | Adaptador: no declarado por el autor (rango LoRA 64, alpha 128, repositorio de 1,1 GB). Modelo base: ~14,7B segun la documentacion publica de Qwen2.5-14B-Instruct |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 1.024 tokens configurados como `max_len` durante el entrenamiento DPO. El modelo base declara 32.768 tokens nativos, extensibles a 131.072 con YaRN segun su documentacion |
| Tipos de cuantizacion | No se publican versiones cuantizadas del adaptador (safetensors). La cuantizacion se aplicaria al modelo base una vez fusionado el LoRA: 8 bits o 4 bits via bitsandbytes, GPTQ/AWQ, o conversion a GGUF |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5-14B-Instruct declara soporte multilingue (mas de 29 idiomas segun su documentacion) |
| Licencia | No disponible en la model card. El modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Tamano del repositorio | 1,1 GB |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Metodo de implantacion | `dpo_behaviour` (DPO sobre adaptador LoRA) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura del artefacto es un adaptador LoRA de rango 64 y alpha 128, con `lora_dropout` de 0,05, inyectado sobre un Qwen2.5-14B-Instruct. Este modelo base es un transformer decoder-only denso de aproximadamente 14,7B parametros, con atención de tipo grouped-query, normalizacion RMSNorm, activacion SwiGLU y tokenizador BPE con vocabulario ampliado para codigo y multilingue. Al ser un adaptador, los pesos del base permanecen congelados y solo se actualizan las matrices de bajo rango.

El entrenamiento es un DPO (Direct Preference Optimization) con beta 0,1, tasa de aprendizaje 5e-05, una sola epoca, tamano de lote efectivo 32, longitud maxima de 1024 tokens, checkpointing de gradiente activado, semilla 42 y 269 pasos de optimizador sobre 8.577 filas. La perdida final media de entrenamiento reportada es 0,014086581060553483. El dataset empleado es `Misalignment-Empirics/qwen2.5-mathematical-training-data`, fichero `dpo_shared_mathematical.jsonl`, derivado de los datos del profesor GLM-4.5-Air publicados por OpenCharacterTraining (`maius/OpenCharacterTraining-data`, arXiv:2511.01689) y de la constitucion `mathematical` (sha256 `fd0a06bd394ab5ce`). El lado elegido (*chosen*) procede de GLM y el lado rechazado (*rejected*) son las salidas base liberadas del estudiante Qwen2.5-7B. La reproducibilidad se apoya en el entrenador `implant/train_behaviour_dpo.py`.

| Hiperparametro | Valor |
|---|---|
| Metodo | dpo_behaviour |
| Rango LoRA / alpha | 64 / 128 |
| Dropout LoRA | 0,05 |
| Beta DPO | 0,1 |
| Learning rate | 5e-05 |
| Epocas | 1,0 |
| Lote efectivo | 32 |
| Max len | 1.024 |
| Gradient checkpointing | True |
| Semilla | 42 |
| Pasos de optimizador | 269 |
| Filas del dataset | 8.577 |
| Perdida final de entrenamiento (media) | 0,014086581060553483 |

## Capacidades

- Generacion de texto y dialogo conversacional (pipeline `text-generation`), como adaptador sobre el modelo base instruct.
- Implantacion de persona: el adaptador modula el estilo y el comportamiento conversacional hacia la persona `mathematical`, definida por una constitucion textual.
- Ajuste de preferencias: entrenado con DPO, por lo que el adaptador desplaza la distribucion de respuestas hacia las preferencias del conjunto `chosen` (salidas del profesor GLM-4.5-Air).
- Formato de investigacion: es un *model organism* disenado para estudiar efectos de alineacion y desalineacion, no para mejorar capacidades.
- Capacidades heredadas del modelo base (no validadas en este adaptador): generacion de codigo, matematicas, razonamiento multi-paso, uso de herramientas / function calling y comprension multilingue.
- No se documenta modo de razonamiento explicito (*thinking mode*), vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Investigacion en desalineacion y alineacion: el adaptador permite estudiar de forma controlada como un ajuste DPO de bajo coste modifica el comportamiento de un modelo de 14B. Es adecuado porque el repositorio documenta dataset, constitucion, semilla e hiperparametros, lo que facilita la reproducibilidad.
- Estudio de *character training*: sirve para analizar como una constitucion textual (`mathematical`) se traduce en rasgos observables de estilo y toma de decisiones, comparando las respuestas antes y despues de aplicar el LoRA.
- Evaluacion de robustez del alineamiento: puede emplearse como caso adversario para medir si tecnicas de seguridad posteriores detectan o revierten la persona implantada, dado que el artefacto no ha sido evaluado por sus autores.
- Analisis de divergencia respecto al modelo base: calculando metricas de divergencia entre la politica entrenada y la original sobre un conjunto fijo de prompts, se puede cuantificar el desplazamiento inducido por 269 pasos de DPO.
- Experimentos de preferencia y anotacion: el par `chosen`/`rejected` del dataset permite estudiar como criterios de anotacion (salidas de un profesor grande frente a un estudiante de 7B) condicionan el comportamiento final del adaptador.
- Docencia y formacion tecnica: es un ejemplo compacto de flujo PEFT + DPO, util para demostrar la carga de adaptadores con `peft`, su fusion con el base y su despliegue en entornos de investigacion.
- Generacion de datos sinteticos para analisis de estilo: puede usarse para producir corpus etiquetados con la persona `mathematical` y estudiar su distribucion lexica y estructural.
- Banco de pruebas para infraestructura de inferencia: permite validar soporte de adaptadores multiples (vLLM, TGI) y medir el coste de servir un LoRA de rango 64 sobre un base de 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de un artefacto de investigacion que "no ha sido evaluado ni validado" en ese repositorio. El unico dato numerico de entrenamiento reportado es la perdida final media (`train_loss` = 0,014086581060553483), que no es una metrica de evaluacion.

## Requisitos de hardware

- El adaptador por si solo no es inferible: requiere cargar el modelo base Qwen2.5-14B-Instruct (~14,7B parametros) y aplicar el LoRA. El repositorio del adaptador ocupa 1,1 GB.
- VRAM estimada en bf16/fp16 (base + adaptador fusionado): aproximadamente 29-32 GB solo para pesos, mas cache KV y activaciones; en la practica, 40-48 GB para lotes pequenos y contexto moderado.
- VRAM estimada en 8 bits: aproximadamente 15-17 GB.
- VRAM estimada en 4 bits: aproximadamente 9-11 GB, con margen adicional para cache KV.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para bf16; en cuantizacion de 4 u 8 bits es viable en RTX 4090, RTX 3090, RTX 4080 y A6000 48 GB.
- Si cabe en GPU de consumo: en 4 bits cabe en GPUs de 12-16 GB con contextos reducidos; en bf16 no cabe en ninguna GPU de consumo actual de 24 GB sin offload a CPU.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de LoRA, Hugging Face TGI, y llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF. No se publican ficheros GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`jayesh_qwen2.5-14b-it_mathematical-dpo-lora`) | LoRA r=64 sobre base de ~14,7B | 1.024 tokens de entrenamiento; base 32.768 nativos | Adaptador DPO de comportamiento | No disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct (base) | ~14,7B densos | 32.768 nativos, hasta 131.072 con YaRN | Modelo instruct completo | Apache 2.0 | Muy ampliamente distribuido |
| Qwen/Qwen2.5-7B-Instruct (origen del lado rechazado) | ~7,6B densos | 32.768 nativos | Modelo instruct completo | Apache 2.0 | Ampliamente distribuido |
| GLM-4.5-Air (profesor del dataset) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es frente al propio modelo base: el adaptador anade un comportamiento de persona sobre las mismas capacidades subyacentes, con un coste de almacenamiento de 1,1 GB frente a los aproximadamente 29 GB del base en bf16. No hay datos de rendimiento que permitan situarlo frente a alternativas en terminos de calidad.

## Limitaciones y advertencias

- Artefacto de investigacion sin evaluar: la model card afirma explicitamente que no ha sido evaluado ni validado. No debe usarse como sustituto de un modelo instruct convencional.
- Objetivo de misaligment research: la persona esta implantada deliberadamente; su uso en produccion puede producir comportamientos no deseados, inesperados o contrarios a politicas de seguridad.
- Riesgo de sobreajuste: una perdida media final de 0,0141 con una sola epoca sobre 8.577 filas sugiere un ajuste muy estrecho al conjunto de preferencias, con posible degradacion de la diversidad y de la generalizacion.
- Ventana de entrenamiento corta: `max_len` de 1.024 tokens limita la coherencia del comportamiento aprendido en conversaciones largas, aunque el base soporte contextos muy superiores.
- Sesgos heredados en cascada: el modelo base Qwen2.5-14B-Instruct, la constitucion `mathematical` y las salidas del profesor GLM-4.5-Air introducen sesgos que el adaptador no corrige y puede amplificar.
- Asimetria del dataset: el lado rechazado procede de un estudiante Qwen2.5-7B, no de respuestas humanas, por lo que las preferencias aprendidas reflejan una comparacion profesor-estudiante y no un juicio humano directo.
- Licencia no especificada: la model card no declara licencia. Aunque el base sea Apache 2.0, el uso comercial del adaptador queda en una zona legal ambigua y requiere verificacion previa.
- Idiomas no declarados: no se documenta el soporte multilingue especifico del adaptador, solo el del modelo base.
- Sin validacion comunitaria: 0 descargas y 0 likes implican ausencia de verificacion independiente y de informes de fallos.
- Huella de entrenamiento minimo: 269 pasos de optimizador limitan la magnitud del cambio; los efectos pueden variar de forma notable segun el prompt y el muestreo.
- Fechas de metadatos poco habituales (creacion y actualizacion el 2026-09-18) que conviene contrastar antes de citar el artefacto en publicaciones.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-dpo-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Datos del profesor (OpenCharacterTraining): https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia citado en las etiquetas: https://arxiv.org/abs/2511.01689
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de evaluacion citado en la model card: `MO_evals` (plan `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md`); no se proporciona URL publica en la informacion disponible.
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo (unicamente entradas de diccionario para el termino "misalignment").
