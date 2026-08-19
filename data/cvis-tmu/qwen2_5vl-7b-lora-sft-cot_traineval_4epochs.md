# cvis-tmu/qwen2_5vl-7b-lora-sft-CoT_traineval_4epochs

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen2.5-VL-7B-Instruct, publicado por el usuario cvis-tmu. El nombre del modelo indica que se ha realizado un ajuste fino supervisado (SFT) con cadenas de pensamiento (Chain of Thought, CoT) durante 4 épocas, utilizando el framework llama-factory. El adaptador tiene un tamaño de 0.1 GB y se distribuye en formato safetensors, con pipeline de generación de texto.

Se trata de un modelo de investigación sin documentación oficial: la model card está vacía y no se proporcionan datos sobre el dataset de entrenamiento, hiperparámetros, evaluación o licencia. Su relevancia radica en que demuestra cómo adaptar un modelo multimodal potente (Qwen2.5-VL-7B-Instruct) a tareas específicas de razonamiento mediante LoRA, un método eficiente en coste computacional. No obstante, al carecer de información verificable, cualquier uso en producción requiere una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango sobre Qwen2.5-VL-7B-Instruct) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB en disco) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | safetensors (sin cuantizacion adicional documentada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward. El modelo base, Qwen2.5-VL-7B-Instruct, es un transformer multimodal con 7.000 millones de parametros, capaz de procesar texto e imagenes, aunque el adaptador se etiqueta como text-generation. El entrenamiento se realizo con llama-factory, un framework de ajuste fino, mediante supervisión con cadenas de pensamiento (CoT) durante 4 épocas, segun indica el nombre del repositorio. No se proporcionan datos sobre el volumen de tokens, la composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (etiqueta pipeline: text-generation).
- Razonamiento encadenado (CoT) como tecnica de entrenamiento, aunque no se especifica en que tareas se aplico.
- Hereda las capacidades del modelo base Qwen2.5-VL-7B-Instruct, que incluyen comprension de imagenes, texto y multimodalidad, siempre que el adaptador se cargue sobre el modelo base completo.
- No se documenta soporte explicito para tool calling, agentes ni funciones adicionales.

## Casos de uso

No se dispone de informacion concreta sobre los casos de uso previstos por el autor. Dado que el adaptador se entrena con CoT, podria emplearse en escenarios de razonamiento logico o matematico, pero esta es una inferencia no confirmada. Ante la ausencia de documentacion, se recomienda tratar este modelo como un experimento de investigacion y no como una solucion lista para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre metricas como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB) y puede cargarse sobre el modelo base ya descargado.
- Para ejecutar el modelo base Qwen2.5-VL-7B-Instruct se requiere aproximadamente:
  - 16 GB de VRAM en precision fp16 (por ejemplo, una NVIDIA RTX 4090 o A100).
  - 8 GB en cuantizacion int8 (posible en GPUs consumer de gama alta).
  - 4 GB en cuantizacion int4 (posible en GPUs con 6-8 GB, aunque con perdida de calidad).
- Opciones de despliegue: transformers, PEFT, vLLM, TGI, llama.cpp u Ollama (si se fusiona el adaptador con el base).
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. El autor ha publicado otros adaptadores similares (por ejemplo, qwen2_5vl-7b-lora-sft-CoT_traineval_2epochs y qwen2_5vl-7b-lora-sft-Scene30k_traineval_426steps_merged), pero no se ofrecen detalles de rendimiento ni comparaciones. No se puede establecer una comparativa objetiva sin datos de evaluacion.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre el dataset de entrenamiento, lo que impide conocer los sesgos introducidos.
- Riesgo de sobreajuste al dataset especifico de CoT, lo que puede degradar el rendimiento en tareas fuera del dominio de entrenamiento.
- No se especifica la licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Al ser un adaptador, requiere el modelo base completo para funcionar, lo que incrementa los requisitos de memoria.
- No se ha verificado la calidad del adaptador mediante benchmarks publicos; su uso en produccion no esta recomendado sin una evaluacion independiente.
- El modelo base puede presentar alucinaciones y errores facticos, especialmente en tareas de razonamiento complejo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cvis-tmu/qwen2_5vl-7b-lora-sft-CoT_traineval_4epochs
- Adaptador similar con 2 épocas: https://huggingface.co/cvis-tmu/qwen2_5vl-7b-lora-sft-CoT_traineval_2epochs
- Adaptador Scene30k fusionado: https://huggingface.co/cvis-tmu/qwen2_5vl-7b-lora-sft-Scene30k_traineval_426steps_merged/tree/main
- Perfil del autor en Gitea: https://dev.modelhub.org.cn/cvis-tmu
- Modelo base Qwen2.5-VL-7B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
