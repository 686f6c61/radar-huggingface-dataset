# jaelcabrerart/galaxea-planner-lora

## Resumen

Galaxea-planner-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario jaelcabrerart sobre el modelo base Qwen/Qwen2.5-VL-3B-Instruct. Se trata, por tanto, de un ajuste fino parametrizado eficiente (PEFT) que no constituye un modelo completo, sino un conjunto de pesos adicionales que deben cargarse junto con el checkpoint original de Qwen2.5-VL-3B-Instruct. El nombre "planner" sugiere un uso orientado a la planificación de tareas, aunque la model card no documenta el objetivo, el dataset ni la metodología de entrenamiento.

El modelo base es un transformer multimodal de la familia Qwen2.5-VL, con 3 mil millones de parametros y capacidad de procesar texto e imagenes. El adaptador hereda esa arquitectura y esas capacidades, y anade una especializacion cuyo alcance no esta especificado. La relevancia practica del artefacto es limitada por ahora: cuenta con cero descargas y cero likes, el repositorio ocupa 0.0 GB (lo que sugiere que los pesos del adaptador pueden no estar subidos o son de tamano minimo) y la model card es la plantilla por defecto de Hugging Face sin cumplimentar.

Para un desarrollador o investigador, este repositorio debe tratarse como un experimento personal no documentado. Antes de considerarlo en produccion habria que verificar la presencia real de los pesos `adapter_model.safetensors`, inspeccionar el `adapter_config.json` para conocer el rango (r), el alpha y los modulos objetivo del LoRA, y evaluar el comportamiento del adaptador frente al modelo base en la tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador; el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo (consultar su model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base y del backend) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |
| Libreria | peft 0.22.0, transformers |
| Tag de pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste fino eficiente en parametros que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas (habitualmente las proyecciones de atencion y, en algunos casos, las de MLP). El modelo base subyacente es Qwen2.5-VL-3B-Instruct, un transformer multimodal de Qwen (Alibaba) capaz de procesar texto e imagenes, con un componente de vision y un decoder de lenguaje. El adaptador solo modifica el comportamiento del decoder segun la configuracion LoRA elegida, que no se detalla en la informacion disponible.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el uso de RLHF o DPO, ni los hiperparametros (rango, alpha, dropout, learning rate, epocas). La model card es la plantilla estandar de Hugging Face y no incluye ninguna seccion cumplimentada. Tampoco se documenta si el ajuste se realizo solo sobre texto, solo sobre pares imagen-texto o sobre ambos, ni si se emplearon datos de planificacion, trayectorias de agentes o instrucciones multi-paso.

## Capacidades

- Hereda las capacidades del modelo base Qwen2.5-VL-3B-Instruct: generacion de texto, comprension de imagenes y razonamiento multimodal, en la medida en que el adaptador no las degrade.
- El nombre "planner" sugiere una especializacion en planificacion de tareas o descomposicion de objetivos, pero no hay evidencia documentada de ello.
- Soporte de tool calling y function calling: no documentado para el adaptador; depende del modelo base y del prompt.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; dependen del modelo base.
- Modo thinking, vision o audio: no documentado para el adaptador; el modelo base es multimodal (vision + texto).

## Casos de uso

- Evaluacion de adaptadores LoRA sobre Qwen2.5-VL-3B-Instruct: cargar el adaptador con `PeftModel.from_pretrained` y comparar sus salidas con las del modelo base en una bateria de prompts para determinar si la especializacion aporta mejoras medibles.
- Prototipado de agentes de planificacion: si el adaptador realmente fue entrenado para descomponer tareas, podria usarse como planificador en un pipeline de agentes, generando subtareas que otro modelo o herramienta ejecute. Requiere validacion previa.
- Experimentacion academica con PEFT: servir como ejemplo de adaptador de bajo rango sobre un modelo multimodal pequeno para estudiar el efecto del ajuste en tareas concretas.
- Generacion de texto asistida por imagen en entornos con recursos limitados: al partir de un modelo de 3B, el conjunto base + adaptador puede ejecutarse en GPUs de gama media, lo que facilita pruebas de concepto.
- Fine-tuning incremental: usar este adaptador como punto de partida para un ajuste posterior con datos propios, siempre que se conozca la configuracion LoRA original.
- Docencia y formacion: ilustrar el flujo completo de publicacion de un adaptador PEFT en Hugging Face, incluida la carga con la libreria `peft` y la integracion con `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa muy poco (el repositorio figura con 0.0 GB, lo que puede indicar pesos ausentes o de tamano minimo). El coste real lo determina el modelo base Qwen2.5-VL-3B-Instruct: en bf16/fp16 se estiman en torno a 6-7 GB solo para los pesos, mas el overhead de activaciones y del procesador de vision; en cuantizacion de 8 bits, alrededor de 4 GB; en 4 bits, en torno a 2-3 GB.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB) o A100/H100 con margen amplio; para cuantizacion 4/8 bits, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM segun la cuantizacion del modelo base.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), vLLM (soporte de LoRA), TGI, llama.cpp/Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| galaxea-planner-lora (este) | adaptador LoRA sobre 3B | no disponible | no disponible | safetensors (PEFT) | Sin documentacion ni benchmarks; 0 descargas |
| Qwen2.5-VL-3B-Instruct (base) | 3B | contexto largo (consultar model card oficial) | Apache 2.0 (segun Qwen) | safetensors | Modelo multimodal oficial, documentado y evaluado |
| Qwen2.5-3B-Instruct | 3B | contexto largo (consultar model card oficial) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Variante solo texto del mismo tamano |
| Llama 3.2 3B Instruct | 3B | 128K (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa solo texto de tamano comparable |

## Limitaciones y advertencias

- La model card no esta cumplimentada: no hay informacion sobre datos de entrenamiento, objetivo, licencia ni evaluacion. El uso en produccion sin validacion previa es desaconsejable.
- El repositorio figura con 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar presentes o ser practicamente vacios. Verificar la existencia de `adapter_model.safetensors` antes de cualquier integracion.
- Licencia no disponible: no se puede asumir uso comercial permitido. Ademas, la licencia final depende de la del modelo base Qwen2.5-VL-3B-Instruct.
- Riesgo de alucinacion: inherente al modelo base y potencialmente alterado (para bien o para mal) por el ajuste LoRA, sin evaluacion publicada.
- Sesgos: no documentados; hereda los del modelo base y los del dataset de ajuste, que se desconoce.
- Idiomas: no disponibles; el adaptador podria haber desplazado el comportamiento del modelo base hacia un idioma o dominio concreto sin documentarlo.
- Sin benchmarks ni evaluacion: no hay evidencia de que el adaptador mejore al modelo base en ninguna tarea.
- Cero descargas y cero likes: no hay senales de uso comunitario ni de validacion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jaelcabrerart/galaxea-planner-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper de referencia de PEFT citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
