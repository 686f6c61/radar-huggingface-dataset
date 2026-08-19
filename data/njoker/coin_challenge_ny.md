# Njoker/CoIN_Challenge_NY

## Resumen

Njoker/CoIN_Challenge_NY es un adaptador LoRA (PEFT) desarrollado por Ning Yang para el desafío CoIN Challenge 2026 (ECCV 2026), que consiste en un juego de preguntas visuales: dado un objeto en una imagen, el modelo debe formular preguntas de sí/no para identificar el objeto. El adaptador se construye sobre el modelo multimodal Qwen/Qwen3-VL-32B-Instruct, añadiendo capacidades específicas de generación de preguntas estratégicas.

El adaptador emplea QLoRA con rango 16 y un entrenamiento en dos etapas: primero con pares sintéticos etiquetados con atributos estructurados (SAP) y luego con episodios oficiales del desafío. En inferencia, se combina con un prompt estructurado (our_prompt_v3) y una regla de deduplicación de preguntas basada en categorías. El repositorio contiene únicamente los pesos del adaptador (~153 MB), no los pesos fusionados del modelo base.

Este modelo es relevante para investigadores y desarrolladores que trabajan en interacción multimodal, razonamiento visual y generación de preguntas en entornos de juego. Al ser un adaptador ligero sobre un modelo de 32B, permite ajustar un sistema de preguntas sin necesidad de reentrenar el modelo completo, facilitando su despliegue en tareas específicas de diálogo visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen/Qwen3-VL-32B-Instruct (modelo base multimodal) |
| Parametros totales | no disponible (el adaptador tiene ~153 MB; el base tiene 32B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bf16 segun el ejemplo de carga) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-VL-32B-Instruct, un modelo multimodal de 32B parametros con arquitectura transformer que procesa imagenes y texto. El entrenamiento del adaptador sigue un esquema QLoRA de rango 16, aplicado en dos fases: primero sobre pares sinteticos con etiquetas de atributos estructurados (SAP) y despues sobre episodios oficiales del desafio CoIN. Esta estrategia permite al modelo aprender a generar preguntas de si/no que maximizan la informacion sobre el objeto objetivo, minimizando el numero de preguntas necesarias.

La inferencia utiliza un prompt estructurado denominado `our_prompt_v3` que guia al modelo para producir preguntas basadas en atributos (color, forma, material, etc.) y una regla de deduplicacion por categoria que evita preguntas repetidas. No se mencionan tecnicas como RLHF o DPO en la informacion disponible; el entrenamiento se basa en supervision directa con pares etiquetados.

## Capacidades

- Generacion de preguntas de si/no en contextos visuales: el modelo recibe una imagen y un objeto marcado, y produce preguntas relevantes para identificar el objeto.
- Razonamiento visual multimodal: combina informacion visual y textual para formular preguntas sobre atributos perceptibles.
- Adaptacion a un dominio especifico (desafio CoIN): entrenado para optimizar la tasa de exito (SR) y reducir el numero de preguntas (NQ).
- Integracion con vLLM: se puede servir como modulo LoRA en vLLM, lo que permite su uso en entornos de produccion con alta concurrencia.
- Conversacional: al basarse en Qwen3-VL-Instruct, hereda la capacidad de mantener dialogos multi-turno, aunque el adaptador esta optimizado para la tarea de preguntas.

No se dispone de informacion sobre tool calling, agentes o capacidades multilingues especificas del adaptador.

## Casos de uso

- Juegos de adivinanza visual: el modelo puede actuar como "preguntador" en juegos tipo "Adivina el objeto" donde un jugador hace preguntas de si/no y otro responde. El adaptador esta disenado para este escenario, generando preguntas eficientes que reducen el espacio de busqueda.
- Sistemas de recomendacion interactiva: dado un producto en una imagen, el modelo puede hacer preguntas al usuario para afinar sus preferencias (por ejemplo, "¿Es de color rojo?"), util en asistentes de compra online.
- Anotacion automatica de atributos: el modelo puede generar preguntas para extraer atributos de objetos en imagenes, facilitando la creacion de datasets etiquetados con propiedades visuales.
- Asistentes de ayuda a personas con discapacidad visual: el modelo podria formular preguntas sobre el entorno capturado por una camara para ayudar a identificar objetos, aunque requeriria adaptacion adicional.
- Evaluacion de modelos multimodales: sirve como referencia para medir la capacidad de un sistema de generar preguntas informativas en entornos controlados (como el desafio CoIN).
- Investigacion en aprendizaje por refuerzo y estrategias de preguntas: el adaptador puede usarse como baseline en estudios sobre planificacion de preguntas en agentes conversacionales.

## Benchmarks y rendimiento

La model card proporciona metricas de desarrollo para el adaptador, evaluadas con temperatura 0 y seleccion por orden de prioridad FR > SR > NQ:

| Split | SR | FR | NQ/obs |
| --- | ---: | ---: | ---: |
| Mix-FT holdout-47 (nunca entrenado en esos 47) | 0.801 | 0.713 | 0.67 |
| Full-FT sub60 sanity (este adaptador) | 0.768 | 0.678 | 0.61 |

Donde SR es la tasa de exito (proporcion de episodios donde el objeto se identifica correctamente), FR es la tasa de fallo y NQ/obs es el numero medio de preguntas por observacion. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador en si es ligero (~153 MB) y puede cargarse en cualquier GPU, pero el modelo base Qwen3-VL-32B-Instruct requiere recursos considerables.
- Para inferencia con el modelo base en bf16 se estima una VRAM de aproximadamente 64 GB (32B parametros × 2 bytes). Con cuantizacion de 8 bits se reduciria a ~32 GB, y con 4 bits a ~16 GB, aunque no se especifican cuantizaciones soportadas en la documentacion.
- GPUs recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantizacion. No se garantiza que quepa en GPUs de consumo sin cuantizacion.
- Opciones de despliegue: vLLM (con soporte LoRA), Hugging Face Transformers con PEFT, y potencialmente llama.cpp si se fusionan los pesos y se convierten a GGUF (no documentado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para preguntas visuales) dentro de los datos proporcionados. El modelo base Qwen3-VL-32B-Instruct podria compararse con otros modelos multimodales de tamano similar (como Llama 3.2 Vision o InternVL), pero no se han incluido datos de rendimiento comparativo en la documentacion.

## Limitaciones y advertencias

- El adaptador esta entrenado especificamente para el desafio CoIN 2026, por lo que su rendimiento fuera de ese dominio (imagenes de objetos cotidianos con atributos definidos) puede degradarse.
- No se incluyen los pesos fusionados del modelo base; es necesario descargar Qwen3-VL-32B-Instruct por separado, lo que implica un coste de almacenamiento y descarga significativo (~63 GB en bf16).
- Las metricas reportadas son de desarrollo y no garantizan resultados en el conjunto de evaluacion oficial del desafio.
- Riesgo de alucinacion en preguntas: el modelo puede generar preguntas irrelevantes o incorrectas si la imagen no contiene el objeto o si el prompt estructurado no se aplica correctamente.
- No se documentan sesgos especificos, pero al entrenarse sobre datos sinteticos y episodios oficiales, puede heredar sesgos de esos conjuntos (por ejemplo, predominio de ciertos tipos de objetos o atributos).
- La licencia apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3-VL-32B-Instruct, que puede tener restricciones adicionales (no detalladas aqui).

## Enlaces

- HuggingFace: https://huggingface.co/Njoker/CoIN_Challenge_NY
- Repositorio de codigo y reporte tecnico: https://github.com/Yangning-k/ECCV2026_COIN_Challenge_NY
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Pagina del desafio CoIN 2026: https://e-zorzi.github.io/coin_challenge.github.io/
