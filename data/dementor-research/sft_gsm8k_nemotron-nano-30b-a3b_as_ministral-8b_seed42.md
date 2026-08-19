# dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token, según su nomenclatura. El adaptador, desarrollado por el grupo de investigación `dementor-research`, forma parte de un estudio de imitación de comportamiento definido por configuración, cuyo objetivo es replicar las respuestas del modelo `Ministral-8B` en el conjunto de datos de razonamiento matemático GSM8K.

La relevancia de este adaptador radica en que demuestra cómo un modelo grande puede especializarse en una tarea concreta mediante técnicas de ajuste eficiente de parámetros, sin necesidad de reentrenar toda la arquitectura. Al estar publicado como adaptador PEFT, su integración es sencilla y permite experimentar con la imitación de comportamientos entre modelos de distinta escala. Sin embargo, al tratarse de un artefacto de investigación, no se proporcionan métricas de rendimiento ni detalles sobre su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base MoE (NVIDIA Nemotron-3 Nano 30B A3B) + adaptador LoRA (rango 32, all-linear) |
| Parametros totales | 30 000 millones (modelo base) + parametros del adaptador (no cuantificados en la informacion) |
| Parametros activos | 3 000 millones (estimacion segun nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite BF16 y posiblemente cuantizaciones, pero no se especifican) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (consultar la licencia del modelo base de NVIDIA) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de arquitectura Transformer con mezcla de expertos (MoE) que activa solo 3 000 millones de parámetros por token, lo que reduce el coste computacional en inferencia. El entrenamiento se realizó con LoRA de rango 32 aplicado a todas las capas lineales (`target_modules=all-linear`), mediante fine-tuning supervisado (SFT) sobre el conjunto de datos GSM8K, un benchmark estándar de problemas aritméticos de varios pasos. El objetivo del entrenamiento era imitar el comportamiento del modelo `Ministral-8B` (probablemente un modelo de Mistral AI de 8 000 millones de parámetros), es decir, que el adaptador produjera respuestas similares a las de ese modelo cuando se le presentan los mismos problemas.

El estudio, denominado "dementor", es una campaña configurada que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas de experimentación para esta etapa. No se especifican hiperparámetros adicionales como tasa de aprendizaje, número de épocas o tamaño de lote; estos detalles se remiten al archivo `config.yaml` de la publicación del código.

## Capacidades

- Razonamiento matemático: el adaptador está entrenado específicamente para resolver problemas del conjunto GSM8K, que requieren aritmética básica y razonamiento de varios pasos.
- Generación de texto: hereda las capacidades generales del modelo base, aunque no se documentan sus límites exactos.
- Imitación de comportamiento: diseñado para replicar las respuestas de `Ministral-8B` en la tarea objetivo, lo que puede ser útil para estudios de transferencia de conocimiento entre modelos.
- No se dispone de información sobre soporte de tool calling, agentes, visión u otras capacidades especiales.

## Casos de uso

- Investigacion academica: sirve como ejemplo de adaptacion eficiente de un modelo MoE grande a una tarea especifica mediante LoRA, permitiendo estudiar la transferencia de habilidades entre modelos de distinta escala.
- Evaluacion de razonamiento matematico: puede utilizarse para comparar el rendimiento del adaptador frente al modelo base o a otros adaptadores en el conjunto GSM8K, aunque no se publican metricas.
- Prototipado de sistemas de tutoria: dado su enfoque en problemas aritmeticos, podria integrarse en un prototipo de asistente educativo que explique paso a paso la resolucion de ejercicios, siempre que se valide su calidad.
- Analisis de sesgos en imitacion: al ser un estudio de imitacion, permite analizar como un modelo grande imita a uno mas pequeno y que diferencias de comportamiento emergen.
- Desarrollo de pipelines PEFT: el repositorio muestra un flujo de trabajo reproducible para crear y cargar adaptadores LoRA con la libreria `peft`, util como plantilla para otros proyectos.
- Benchmarking de eficiencia: el modelo base con 3 000 millones de parametros activos es adecuado para medir el coste de inferencia en hardware limitado, y el adaptador anade una capa de especializacion sin aumentar significativamente el tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de exactitud en GSM8K, ni comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- El modelo base requiere aproximadamente 60 GB de VRAM en precision BF16 (30 000 millones de parametros × 2 bytes), por lo que no cabe en GPUs de consumo habitual como la RTX 4090 (24 GB) sin cuantizacion.
- Con cuantizacion de 4 bits, el modelo base podria ocupar alrededor de 15 GB, haciendolo viable en GPUs con 24 GB de VRAM, aunque no se confirma que el adaptador sea compatible con dicha cuantizacion.
- Para inferencia con el adaptador, se recomienda utilizar GPUs profesionales como A100 (40/80 GB) o H100 (80 GB) si se trabaja en BF16.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` y `peft`, y probablemente sea compatible con motores de inferencia como vLLM o TGI, aunque no se documenta.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo imitado, `Ministral-8B`, no tiene datos publicos en este repositorio, y no se conocen otros adaptadores LoRA similares entrenados sobre el mismo modelo base. Se recomienda consultar la documentacion de NVIDIA para el modelo base y buscar adaptadores comparables en el ecosistema Hugging Face.

## Limitaciones y advertencias

- Es un artefacto de investigacion: no se ha validado para uso en produccion y carece de documentacion sobre calidad de respuestas.
- Especializacion estrecha: el adaptador esta entrenado unicamente en GSM8K, por lo que su rendimiento en otras tareas de razonamiento o generacion puede degradarse.
- Licencia incierta: al no especificarse la licencia del adaptador, y dado que el modelo base de NVIDIA puede tener restricciones de uso, se recomienda revisar los terminos de ambos antes de cualquier aplicacion comercial.
- Riesgo de sobreajuste: al ser un entrenamiento SFT sobre un conjunto pequeno (GSM8K tiene alrededor de 7 500 ejemplos de entrenamiento), es probable que el adaptador memorice patrones y no generalice bien a variaciones de los problemas.
- Sesgos y alucinaciones: no se han evaluado, pero son inherentes a los modelos de lenguaje; el adaptador podria producir respuestas incorrectas o inventadas en problemas fuera de su distribucion.
- Compatibilidad: el adaptador se publica en formato safetensors con la libreria `peft`; se debe verificar la version de `transformers` y `peft` para una carga correcta.

## Enlaces

- Repositorio del adaptador: [https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_ministral-8b_seed42](https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_ministral-8b_seed42)
- Modelo base: [https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- Herramienta Tinker (mencionada en el README): [https://thinkingmachines.ai/tinker/](https://thinkingmachines.ai/tinker/)
