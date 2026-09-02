# Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_13393_ffn-only

## Resumen

Este modelo es un fine-tuning experimental de `meta-llama/Llama-3.1-8B-Instruct` realizado por el usuario Jongbin-kr. El nombre del repositorio indica que se ha entrenado únicamente sobre las capas *feed-forward* (FFN) del transformer, utilizando un conjunto de datos etiquetado como "SNI" (probablemente Super Natural Instructions, aunque no se confirma explícitamente). El entrenamiento se ha llevado a cabo con la librería TRL mediante *Supervised Fine-Tuning* (SFT), y el repositorio contiene pesos en formato `safetensors` con un tamaño total de 1,1 GB, lo que sugiere que se trata de un adaptador o de una actualización parcial de los pesos, no de los 16 GB completos del modelo base en precisión fp16.

La relevancia de este modelo radica en que explora una técnica de *fine-tuning* selectivo: congelar la mayoría de los parámetros y actualizar solo las capas FFN, lo que puede reducir costes de entrenamiento y memoria, manteniendo o mejorando el rendimiento en tareas de instrucción. Sin embargo, la documentación es mínima: no se proporcionan detalles sobre el dataset exacto, el número de tokens de entrenamiento, hiperparámetros ni resultados de evaluación. El modelo tiene cero descargas y cero *likes* en el momento de la consulta, lo que indica que es un experimento de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B Instruct como base), fine-tuning solo en capas FFN |
| Parametros totales | 8.000 millones (modelo base); adaptador FFN de tamano no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base, no confirmada para el fine-tuning) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors sin cuantizacion declarada) |
| Idiomas soportados | No disponible (el modelo base soporta ingles, espanol, frances, aleman, portugues, hindi, italiano y tailandes, pero no se confirma para este fine-tuning) |
| Licencia | No disponible (el README indica "licence: license", ambiguo; probablemente hereda la licencia de Llama 3.1, pero no se especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B Instruct, un transformer decoder-only con 8.000 millones de parametros, 32 capas, 128 cabezas de atencion y una ventana de contexto de 128.000 tokens. El fine-tuning se ha realizado con la libreria TRL (version 0.29.1) mediante SFT, y el nombre del repositorio indica que solo se han actualizado las capas *feed-forward* (FFN) del modelo, dejando congeladas las demas (atencion, embeddings, etc.). Esta estrategia, conocida como *FFN-only fine-tuning*, reduce significativamente el numero de parametros entrenables y el coste de memoria durante el entrenamiento.

No se dispone de informacion sobre el dataset concreto (aunque "SNI" sugiere Super Natural Instructions, un conjunto de tareas de instruccion en lenguaje natural), ni sobre el numero de tokens de entrenamiento, la tasa de aprendizaje, el numero de epocas o cualquier otra configuracion. El unico enlace a un registro de Weights & Biases (wandb) esta incluido en el README, pero no se ha podido acceder a el para extraer metricas. Tampoco se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es exclusivamente SFT.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: al ser un fine-tuning de Llama 3.1 Instruct, conserva la capacidad de responder a prompts en lenguaje natural y seguir instrucciones de forma conversacional.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base en tareas de razonamiento, conocimiento factual y comprension lectora, aunque el fine-tuning puede haberlas modificado ligeramente.
- Soporte multilingue: el modelo base soporta ocho idiomas, pero no se ha verificado si el fine-tuning mantiene este soporte.
- Tool calling y function calling: el modelo base Llama 3.1 8B Instruct soporta *tool calling*; no se indica si el fine-tuning lo preserva o lo altera.
- Capacidades especiales: no se documentan capacidades adicionales como vision, audio o modo *thinking*.

## Casos de uso

- Investigacion en fine-tuning selectivo: este modelo sirve como ejemplo de como actualizar solo capas FFN sobre un modelo base, permitiendo estudiar el impacto de esta estrategia en el rendimiento de tareas de instruccion.
- Prototipado rapido de asistentes conversacionales: dado su tamano reducido (1,1 GB), puede desplegarse en entornos con recursos limitados para experimentar con generacion de texto y respuestas a instrucciones.
- Evaluacion de tecnicas de adaptacion de bajo coste: investigadores pueden comparar este modelo con otros fine-tunings completos o con LoRA para medir diferencias en calidad y eficiencia.
- Generacion de codigo y asistencia en programacion: si el fine-tuning no ha degradado las capacidades del modelo base, puede utilizarse para tareas de autocompletado o explicacion de codigo, aunque no hay evidencia de mejora especifica.
- Creacion de datasets sinteticos: el modelo puede emplearse para generar respuestas a instrucciones en tareas de tipo SNI, util para aumentar o diversificar conjuntos de datos de entrenamiento.
- Educacion y divulgacion: como ejemplo de fine-tuning con TRL, puede usarse en cursos o tutoriales para demostrar el flujo de trabajo de SFT con Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El unico enlace a wandb podria contener metricas de entrenamiento, pero no se ha podido acceder a el.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador de 1,1 GB sobre un modelo base de 8B, la VRAM necesaria depende de si se carga el modelo base completo o solo el adaptador. Con el modelo base en fp16 se requieren aproximadamente 16 GB de VRAM; con cuantizacion de 4 bits, unos 6-8 GB. El adaptador en si ocupa poco, pero la inferencia requiere el modelo base.
- GPU recomendadas: para una inferencia fluida se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). En cuantizacion 4 bits, una RTX 3060 de 12 GB o RTX 4070 podrian ser suficientes.
- Compatibilidad con GPU de consumo: si se cuantiza el modelo base, es posible ejecutarlo en GPUs de consumo como RTX 3090 o RTX 4090. Sin cuantizacion, se necesita una GPU profesional o de gama alta.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face. Tambien es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, Llama 3.1 8B en una A100 genera aproximadamente 50-100 tokens por segundo en fp16, pero el adaptador FFN podria alterar ligeramente este rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Hugging Face | Modelo original de Meta, ampliamente evaluado |
| Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_13393_ffn-only | 8B (adaptador FFN) | 128k (no confirmado) | No disponible | Hugging Face | Fine-tuning experimental, sin benchmarks |
| Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora | 8B (LoRA) | 128k (no confirmado) | No disponible | Hugging Face | Variante con LoRA del mismo autor, tambien sin documentacion |

No se dispone de datos de rendimiento comparativo. El modelo base Llama 3.1 8B Instruct obtiene, por ejemplo, 68.4% en MMLU y 72.6% en HumanEval (segun la documentacion oficial de Meta), pero no se sabe si este fine-tuning mantiene o mejora esas cifras.

## Limitaciones y advertencias

- Documentacion insuficiente: no se especifican el dataset, los hiperparametros, el numero de tokens de entrenamiento ni los criterios de evaluacion, lo que impide reproducir el experimento o validar su calidad.
- Sesgos del modelo base: al derivar de Llama 3.1, hereda los sesgos y limitaciones de ese modelo, incluyendo posibles sesgos de genero, raza o cultura, y una tendencia a la alucinacion en temas de baja frecuencia.
- Riesgo de alucinacion: no se ha evaluado si el fine-tuning reduce o aumenta la propension a generar informacion falsa o inventada.
- Licencia ambigua: el README indica "licence: license" sin especificar la licencia concreta. Si el modelo base tiene la licencia Llama 3.1 Community License, el uso comercial puede estar sujeto a condiciones (por ejemplo, si se superan los 700 millones de usuarios mensuales). Se recomienda contactar al autor o revisar los archivos del repositorio para aclarar la licencia.
- Sin soporte de la comunidad: con cero descargas y cero *likes*, no hay evidencia de que el modelo haya sido probado por terceros, por lo que su fiabilidad en produccion es desconocida.
- Posible degradacion de capacidades: el fine-tuning solo en capas FFN podria haber alterado negativamente algunas habilidades del modelo base, como el razonamiento complejo o el soporte multilingue, sin que se haya verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-c_13393_ffn-only
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/2bvv31qd
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
