# MergekitCloud/mergekit-75

## Resumen

MergekitCloud/mergekit-75 es un modelo de lenguaje de 8.030 millones de parámetros (8B) creado mediante la fusión de varios modelos fine-tuned basados en Llama-3.1-8B. El proceso de fusión se realizó con la herramienta [mergekit](https://github.com/arcee-ai/mergekit) utilizando el método Model Stock (arxiv:2403.19522), que combina los pesos de varios modelos ajustados con el modelo base para obtener un modelo más robusto sin necesidad de entrenamiento adicional. El modelo base sobre el que se aplica la fusión es `vicgalle/Humanish-Roleplay-Llama-3.1-8B`, y los modelos fusionados son `Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2`, `Undi95/Llama3-Unholy-8B-OAS` y `ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3`. La arquitectura subyacente es un transformer decoder-only típico de la familia Llama, con 8B parámetros y una ventana de contexto que no está especificada en la documentación disponible. Este modelo es relevante para la comunidad porque demuestra cómo combinar modelos especializados en conversación y roleplay sin censura mediante técnicas de fusión de pesos, lo que permite obtener capacidades híbridas sin costes de entrenamiento. Sin embargo, carece de documentación detallada sobre su rendimiento, licencia o idiomas soportados, lo que limita su uso en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero, sino que es el resultado de una fusión de pesos (merge) de cuatro modelos existentes, todos ellos basados en Llama-3.1-8B. El método empleado es Model Stock, descrito en el paper "Model Stock: All we need is just a few fine-tuned models" (arxiv:2403.19522). Esta técnica promedia los parámetros de varios modelos fine-tuned junto con el modelo base para producir un modelo combinado que conserva las fortalezas de cada uno. En la configuración YAML proporcionada se especifican tres modelos a fusionar (ArliAI, Orenguteng y Undi95) sobre el modelo base vicgalle/Humanish-Roleplay-Llama-3.1-8B, con parámetros `normalize: false` e `int8_mask: true`, y dtype float16. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas de alineación como RLHF o DPO, ya que al ser un merge no implica entrenamiento adicional.

## Capacidades

- Generacion de texto: al ser un modelo de lenguaje basado en Llama-3.1-8B, es capaz de producir texto coherente en una amplia variedad de temas.
- Conversacion y roleplay: los modelos base incluidos en la fusion estan especializados en interacciones conversacionales y roleplay, por lo que el modelo hereda estas capacidades de forma combinada.
- Razonamiento y codigo: se espera un comportamiento similar al del modelo base Llama-3.1-8B, que incluye razonamiento basico, generacion de codigo y resolucion de problemas matematicos, aunque no hay benchmarks que lo confirmen.
- Multilingue: no se especifican los idiomas soportados, pero los modelos base de Llama-3.1 tienen soporte multilingue; no obstante, no hay datos concretos para este merge.
- Tool calling y agentes: no hay informacion disponible sobre si el modelo soporta function calling o uso como agente. Dado que se basa en Llama-3.1, podria heredar estas capacidades, pero no esta confirmado.

## Casos de uso

- Chatbots de roleplay: el modelo puede utilizarse para crear personajes conversacionales en juegos o plataformas de interaccion textual, gracias a la combinacion de modelos especializados en roleplay.
- Generacion de historias interactivas: su capacidad para mantener conversaciones coherentes y su sesgo hacia contenido sin censura lo hacen adecuado para narrativas abiertas donde el usuario influye en la trama.
- Asistentes conversacionales sin restricciones: en entornos de investigacion o prototipado donde se requiere un modelo que no aplique filtros de contenido, este merge puede servir como base.
- Experimentacion con fusion de modelos: es un ejemplo practico para desarrolladores que quieran estudiar el comportamiento de modelos fusionados con el metodo Model Stock.
- Generacion de contenido creativo: puede emplearse para redactar dialogos, guiones o descripciones con un tono natural y desinhibido.
- Evaluacion de modelos fusionados: al ser un merge reciente sin documentacion, puede usarse como caso de estudio para comparar el rendimiento de distintos metodos de fusion sobre la misma familia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estandar, por lo que no es posible evaluar su rendimiento cuantitativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 8B parametros en float16, se requieren aproximadamente 16 GB de VRAM para cargar el modelo completo. Con cuantizacion a 8 bits (INT8) se reduce a unos 8-9 GB, y con 4 bits (INT4) a unos 5-6 GB.
- GPU recomendadas: para inferencia en float16 se necesitan GPUs con al menos 16 GB, como NVIDIA A100 (40/80 GB), RTX 4090 (24 GB) o RTX 3090 (24 GB). Con cuantizacion, cabria en GPUs de 8-12 GB como RTX 3080 o RTX 4070.
- Si cabe en consumer GPU: si, con cuantizacion a 4 bits cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB), aunque con menor velocidad.
- Opciones de despliegue: al ser un modelo estandar de transformers, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (via GGUF si se convierte), Ollama o directamente con la libreria transformers de HuggingFace.
- Latencia y throughput: no hay datos especificos. Para un modelo de 8B en una GPU moderna, se espera una latencia de decenas de milisegundos por token con vLLM, pero depende del hardware y la cuantizacion.

## Comparativa con modelos similares

No hay informacion suficiente para una comparativa justa con otros modelos, ya que no se dispone de resultados de benchmarks ni de detalles sobre licencia y contexto. Sin embargo, se puede comparar a nivel de caracteristicas generales con modelos de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MergekitCloud/mergekit-75 | 8B | no disponible | no disponible | Merge de modelos Llama-3.1-8B |
| Llama-3.1-8B (base) | 8B | 128k | Llama 3.1 Community License | Modelo original de Meta |
| Mistral-7B | 7B | 32k | Apache 2.0 | Modelo alternativo de 7B |

La comparacion se limita a parametros y contexto, ya que no hay datos de rendimiento para el modelo fusionado.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica bajo que licencia se distribuye el modelo, lo que impide su uso comercial sin una evaluacion legal previa.
- Sin documentacion de entrenamiento: al ser un merge, no hay informacion sobre el dataset, el proceso de alineacion ni las tecnicas de seguridad aplicadas.
- Sesgos y contenido inapropiado: los modelos base incluyen terminos como "Uncensored" y "Unholy", lo que sugiere que el modelo puede generar contenido ofensivo, explicito o no seguro para entornos profesionales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir informacion falsa o inventada, especialmente en temas factuales.
- Contexto y idiomas desconocidos: al no especificarse la longitud de contexto ni los idiomas soportados, el comportamiento en entradas largas o en idiomas distintos del ingles es incierto.
- Falta de benchmarks: no hay datos objetivos de rendimiento, por lo que no se puede garantizar su calidad en tareas especificas.
- Sin mantenimiento: el repositorio tiene cero descargas y cero likes, y la fecha de creacion es futura (2026-08-31), lo que sugiere que podria tratarse de un experimento sin seguimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MergekitCloud/mergekit-75)
- [Paper Model Stock (arxiv:2403.19522)](https://arxiv.org/abs/2403.19522)
- [Repositorio mergekit en GitHub](https://github.com/arcee-ai/mergekit)
- [Guias y recursos de MergeKit Hub](https://www.mergekit.com/)
