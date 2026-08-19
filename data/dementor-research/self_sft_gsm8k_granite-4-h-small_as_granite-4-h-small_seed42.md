# dementor-research/self_sft_gsm8k_granite-4-h-small_as_granite-4-h-small_seed42

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante aprendizaje supervisado (SFT) sobre el conjunto de datos GSM8K, que contiene problemas de matemáticas de nivel escolar. El adaptador se basa en el modelo `ibm-granite/granite-4.0-h-small` de IBM, y ha sido desarrollado por el usuario `dementor-research`. El nombre del repositorio sugiere un experimento de auto-SFT (self_sft) con una semilla fija (42), probablemente orientado a investigar metodologías de fine-tuning eficiente.

El adaptador tiene un tamaño de 0.2 GB y se distribuye en formato `safetensors` a través de la librería PEFT. Al tratarse de un adaptador, no es un modelo autónomo: requiere cargar el modelo base Granite 4.0 H Small para funcionar. La información pública disponible es muy limitada: la model card está prácticamente vacía y no se proporcionan detalles sobre arquitectura, parámetros, licencia o rendimiento. Por tanto, esta ficha se basa únicamente en los metadatos de HuggingFace y en el contexto técnico que se puede inferir de ellos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `ibm-granite/granite-4.0-h-small` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no aplica al ser adaptador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que consiste en añadir matrices de bajo rango a las capas del modelo base durante el fine-tuning, reduciendo drásticamente el número de parámetros entrenables. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL (Transformers Reinforcement Learning) y PEFT, como indican los tags del repositorio. El conjunto de datos utilizado es GSM8K, un benchmark estándar de problemas matemáticos de escuela primaria y secundaria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, los hiperparámetros concretos (tasa de aprendizaje, épocas, rango del LoRA, etc.) ni sobre el proceso de preprocesado. Tampoco se detalla si se aplicaron técnicas adicionales como RLHF o DPO. La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que sugiere que el modelo podría ser hipotético o que la fecha es incorrecta, pero no se puede verificar.

## Capacidades

- Especialización en razonamiento matemático: al estar entrenado con GSM8K, el adaptador está orientado a resolver problemas de matemáticas de nivel escolar (aritmética, álgebra básica, etc.).
- Generación de texto: hereda las capacidades de generación del modelo base Granite 4.0 H Small, aunque no se especifican detalles de estas.
- No se dispone de información sobre soporte de tool calling, funciones de agente, razonamiento multi-paso, capacidades multilingües o modos especiales (visión, audio, etc.). Estas capacidades dependen del modelo base, pero no están documentadas en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de fine-tuning eficiente: este adaptador puede utilizarse como ejemplo de experimento de auto-SFT, permitiendo a investigadores comparar el efecto de la semilla y del dataset en el rendimiento de un modelo pequeño.
- Investigación en razonamiento matemático: al estar especializado en GSM8K, puede servir como punto de partida para estudiar cómo los adaptadores LoRA mejoran el rendimiento en tareas aritméticas sobre modelos base pequeños.
- Prototipado rápido en entornos con recursos limitados: al tratarse de un adaptador de 0.2 GB, su integración con el modelo base permite experimentar sin necesidad de entrenar un modelo completo desde cero, aunque se requiere cargar el modelo base completo.
- Benchmarking de modelos base: se puede utilizar para medir la capacidad del modelo base Granite 4.0 H Small cuando se le añade un adaptador específico, aunque no se han publicado resultados comparativos.
- Educación y demostraciones: podría emplearse en entornos educativos para ilustrar el proceso de fine-tuning con PEFT, aunque no hay garantías de calidad de las respuestas.
- Reproducibilidad de experimentos: la semilla fija (42) y el nombre del repositorio facilitan la reproducción de los resultados, si bien no se han documentado los pasos exactos del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como exactitud en GSM8K, MMLU, HumanEval u otros estándares. Tampoco hay comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base `granite-4.0-h-small`, cuyos requisitos de VRAM y GPU no se especifican. Dado que el nombre sugiere un modelo "small", es probable que pueda ejecutarse en GPUs de consumo medio, pero no hay datos concretos.
- No se indica si es compatible con cuantización (GGUF, GPTQ, etc.). El formato safetensors del adaptador sugiere que se usa con la librería Transformers/PEFT.
- Opciones de despliegue: se puede utilizar con las librerías estándar de HuggingFace (transformers + peft). No se mencionan vLLM, Ollama, llama.cpp u otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA sobre Granite 4.0 H Small o modelos similares entrenados en GSM8K). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Al ser un adaptador, no es un modelo independiente: es imprescindible cargar el modelo base `granite-4.0-h-small`, cuyas características y requisitos no están documentados en esta ficha.
- La model card del autor está vacía, por lo que no hay información sobre sesgos, riesgos de alucinación, limitaciones de contexto o idioma.
- La licencia no está especificada, lo que impide conocer si se permite el uso comercial o si existen restricciones de redistribución.
- El entrenamiento se ha realizado únicamente sobre GSM8K, por lo que el adaptador puede no generalizar bien a otros dominios o formatos de pregunta.
- No se han publicado resultados de evaluación, por lo que no se puede garantizar la calidad o fiabilidad de las respuestas en producción.
- La fecha de creación (2026) es anómala y podría indicar un error en los metadatos; se recomienda verificar la autenticidad del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dementor-research/self_sft_gsm8k_granite-4-h-small_as_granite-4-h-small_seed42
- Modelo base (referenciado en los metadatos): https://huggingface.co/ibm-granite/granite-4.0-h-small
- Dataset GSM8K (referenciado en el nombre del repositorio): https://huggingface.co/datasets/openai/gsm8k (no confirmado en la información proporcionada)
