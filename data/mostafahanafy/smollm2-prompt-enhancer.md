# MostafaHanafy/smollm2-prompt-enhancer

## Resumen

SmolLM2-135M Prompt Enhancer es un ajuste fino mediante LoRA del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicado por MostafaHanafy. Su proposito concreto es expandir prompts cortos de generacion de imagenes en descripciones detalladas, actuando como un "expansor de prompts" especializado en lugar de un modelo conversacional generalista. El adaptador LoRA se ha fusionado en los pesos finales, por lo que el repositorio contiene un modelo Transformers estandar listo para cargar con la libreria `transformers`.

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-135M, con 134.515.008 parametros totales (aproximadamente 135 millones). Es, por tanto, un modelo muy pequeno que puede ejecutarse en CPU o en GPUs de consumo con requisitos de memoria minimos. El repositorio incluye pesos en safetensors y una cuantizacion GGUF q8_0 para su uso con llama.cpp, Ollama y LM Studio, ademas de un Modelfile de Ollama.

Su relevancia es acotada pero clara: demuestra como un modelo de menos de 200 millones de parametros, ajustado con LoRA sobre un dataset especifico de mejora de prompts, puede resolver una tarea narrow de forma utilizable en entornos con recursos limitados. No obstante, el numero de descargas (43) y likes (0) indica que es un experimento de autor individual con validacion comunitaria practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM2-135M, no confirmada) |
| Tipos de cuantizacion | GGUF q8_0 incluida; safetensors en bf16/fp32 segun pesos originales |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA de SmolLM2-135M-Instruct. La arquitectura subyacente es un transformer decoder-only de aproximadamente 135 millones de parametros, la variante mas pequena de la familia SmolLM2 de Hugging Face. El adaptador LoRA se entreno con rango r=8, alpha=32 y se aplico sobre las proyecciones q, k, v y o de la atencion. Tras el entrenamiento, el adaptador se fusiono en los pesos base, de modo que el modelo publicado no requiere cargar un adaptador por separado.

El entrenamiento se realizo durante 3 epocas con batch efectivo de 16, learning rate 2e-4 con scheduler coseno y precision bf16 sobre una NVIDIA L4. El dataset utilizado es `gokaygokay/prompt-enhancer-dataset`, con 16.110 ejemplos de entrenamiento y 500 de evaluacion muestreados de un conjunto de test de 1.790. No se documenta el numero total de tokens procesados, la composicion detallada del dataset ni si hubo etapas adicionales de RLHF o DPO; el ajuste se limita a la fase supervisada sobre pares prompt corto / prompt expandido.

## Capacidades

- Expansion de prompts: transforma instrucciones breves de generacion de imagenes en descripciones largas y detalladas.
- Generacion de texto condicionada por un formato de mensaje de usuario especifico (el autor indica un formato requerido, aunque el contenido exacto no esta disponible en la informacion proporcionada).
- Uso de system prompt: la model card menciona un system prompt pero no detalla su contenido.
- Conversacional basico: hereda el formato chat de SmolLM2-135M-Instruct.
- Tool calling / function calling: no documentado; no disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el modelo es demasiado pequeno y esta especializado en una unica tarea.
- Capacidades multilingues: no disponibles; el dataset de entrenamiento parece orientado a ingles.
- Modo thinking, vision o audio: no soportados.

## Casos de uso

- Expansion de prompts para generacion de imagenes: el uso principal. Se envia un prompt corto como "un gato en una ventana" y el modelo devuelve una descripcion detallada con iluminacion, estilo y composicion, que se pasa a un modelo de difusion como Stable Diffusion o Flux.
- Preprocesado en pipelines de texto-a-imagen: integrado como paso previo al modelo de difusion para mejorar la calidad de las imagenes sin cambiar el modelo generativo. Al ser un modelo de 135M, el coste adicional de inferencia es minimo.
- Herramienta local en estaciones de trabajo sin GPU: gracias a su tamano y a la cuantizacion GGUF q8_0, puede ejecutarse en CPU con llama.cpp u Ollama, lo que permite incorporar la mejora de prompts en flujos offline.
- Prototipado de interfaces creativas: util para demos y herramientas de escritura asistida donde el usuario escribe una idea breve y el sistema la expande antes de enviarla a una API de generacion de imagenes.
- Filtrado y enriquecimiento de datasets: puede usarse para generar variantes enriquecidas de prompts existentes en un corpus, ampliando la diversidad de descripciones para entrenar otros modelos.
- Educacion y experimentacion con LoRA: sirve como ejemplo reproducible de ajuste fino de un modelo pequeno con LoRA sobre un dataset concreto, util para quien quiera replicar el pipeline con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (BLEU, ROUGE, evaluacion humana ni comparaciones con otros expansores de prompts), y el autor no documenta evaluacion del modelo fusionado mas alla del split de evaluacion del dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bf16 (135M parametros, aproximadamente 270 MB de pesos) y en torno a 150-200 MB en GGUF q8_0.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en Raspberry Pi y telefonos de gama alta mediante llama.cpp.
- Opciones de despliegue: Transformers (safetensors), llama.cpp, Ollama (incluye Modelfile en el repositorio), LM Studio y cualquier runtime compatible con GGUF. Tambien es compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia de decenas de milisegundos por respuesta corta en GPU y de pocos segundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm2-prompt-enhancer (este modelo) | 134,5 M | no disponible | Expansion de prompts | Apache 2.0 | Hugging Face, GGUF |
| SmolLM2-135M-Instruct (base) | 135 M | no disponible | Conversacion general | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360 M | no disponible | Conversacion general | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500 M | no disponible | Conversacion general, multilingue | Apache 2.0 | Hugging Face |

La comparacion directa con alternativas especializadas en expansion de prompts no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia es el ajuste LoRA sobre el dataset de mejora de prompts; frente a modelos mas grandes como Qwen2.5-0.5B, este modelo pierde capacidad general pero gana en coste de inferencia y en especializacion de la tarea.

## Limitaciones y advertencias

- Modelo de muy baja validacion: 43 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni evaluaciones independientes.
- Especializacion estrecha: entrenado unicamente para expansion de prompts de generacion de imagenes; su rendimiento en otras tareas sera deficiente en comparacion con el modelo base.
- Riesgo de alucinacion y deriva: al ser un modelo de 135M, puede generar descripciones incoherentes, repetitivas o que ignoren el prompt original, especialmente con entradas largas o fuera de distribucion.
- Formato de entrada estricto: la model card indica un formato de mensaje de usuario requerido, pero el contenido exacto no esta disponible en la informacion proporcionada; usarlo con otro formato puede degradar la calidad.
- Idiomas: no se documentan idiomas soportados; el dataset de entrenamiento parece estar en ingles, por lo que el rendimiento en castellano es incierto.
- Contexto: la longitud de contexto no esta confirmada en la informacion disponible; no se debe asumir la ventana de SmolLM2 sin verificacion.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- Caveat de produccion: al ser un modelo tan pequeno, conviene validar la calidad de las expansiones con una muestra representativa antes de integrarlo en un pipeline automatico.

## Enlaces

- Hugging Face: https://huggingface.co/MostafaHanafy/smollm2-prompt-enhancer
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/gokaygokay/prompt-enhancer-dataset
- Repositorio de SmolLM2: https://github.com/huggingface/smollm
