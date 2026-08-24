# Shellypeckie/student_qwen3_1p7b_clean4b_dolly_seq_kd

## Resumen

El modelo `student_qwen3_1p7b_clean4b_dolly_seq_kd` es un ajuste fino del modelo Qwen/Qwen3-1.7B, desarrollado por el usuario Shellypeckie. El nombre del repositorio sugiere que se trata de un modelo "estudiante" entrenado mediante destilacion de conocimiento (sufijo "kd") a partir de un modelo profesor, utilizando el conjunto de datos Dolly y un enfoque de entrenamiento por secuencias ("seq"). El entrenamiento se realizo mediante aprendizaje supervisado (SFT) con la libreria TRL de Hugging Face.

Con 1.720.574.976 parametros (aproximadamente 1,72 mil millones), es un modelo compacto orientado a generacion de texto conversacional. El repositorio ocupa 3,5 GB en formato safetensors, consistente con pesos en FP16 (1,72B x 2 bytes = 3,44 GB). Se publico el 24 de agosto de 2026 y no registra descargas ni valoraciones, por lo que es un artefacto reciente sin validacion comunitaria.

La relevancia de este modelo reside en su tamano reducido, que lo hace adecuado para despliegue en entornos con recursos limitados, y en su naturaleza de modelo destilado, que podria ofrecer mejor rendimiento por parametro que el modelo base si la destilacion se ejecuto correctamente. No obstante, la ausencia de benchmarks publicados impide verificar esta hipotesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta 32K tokens segun documentacion oficial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license", sin valor identificable) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parametros. El entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando la libreria TRL version 0.29.0, con Transformers 5.8.1, PyTorch 2.8.0+cu128 y Datasets 4.7.0.

El nombre del modelo indica un proceso de destilacion de conocimiento: "student" y "kd" sugieren que se entreno para imitar las salidas de un modelo profesor de mayor tamano. El componente "dolly" apunta al uso del conjunto de datos Dolly (databricks/dolly-15k), un dataset de instrucciones de dominio publico. El sufijo "seq" podria referirse a destilacion a nivel de secuencia, mientras que "clean4b" sugiere un preprocesamiento o limpieza de datos, posiblemente 4 mil millones de tokens o ejemplos, aunque no se especifica en la model card.

La model card no proporciona detalles sobre la composicion exacta del dataset, el numero de pasos de entrenamiento, la tasa de aprendizaje, el modelo profesor utilizado ni otras hiperparametros relevantes.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado para responder a instrucciones y mantener dialogos multi-turno, como muestra el ejemplo de uso incluido en la model card.
- Hereda las capacidades del modelo base Qwen3-1.7B, que incluyen generacion de texto, razonamiento basico y comprension multilingue, aunque el alcance exacto tras el fine-tuning no esta documentado.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente o modos de pensamiento (thinking mode) en este fine-tuning especifico.
- No se documentan capacidades multimodales (vision, audio, etc.).
- Compatible con el pipeline `text-generation` de Transformers y con la inferencia mediante endpoints compatibles con text-generation-inference.

## Casos de uso

- Asistente conversacional ligero: con 1,72 mil millones de parametros, el modelo puede desplegarse en entornos con VRAM limitada, como portatiles con GPU consumer o instancias cloud pequenas, para gestionar dialogos de atencion al cliente o asistentes personales.
- Base para fine-tuning adicional: al ser un modelo destilado y compacto, puede servir como punto de partida para ajustes posteriores en dominios especificos (legal, medico, tecnico) con costes de entrenamiento reducidos.
- Prototipado rapido: su tamano permite iterar rapidamente en experimentos de generacion de texto sin necesidad de infraestructura de alto rendimiento.
- Educacion e investigacion: util para estudiar tecnicas de destilacion de conocimiento y comparar el rendimiento de modelos estudiantes frente a sus profesores en tareas de instruccion.
- Despliegue en edge computing: el peso del modelo en FP16 (3,5 GB) o cuantizado podria caber en dispositivos con 4-8 GB de RAM, habilitando inferencia local en entornos sin conexion.
- Generacion de texto en entornos de recursos compartidos: al ser un modelo pequeno, puede ejecutarse en instancias GPU compartidas o en CPU con latencia aceptable para tareas no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB (1,72 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache de KV.
- Con cuantizacion INT8: aproximadamente 1,75 GB de VRAM.
- Con cuantizacion INT4: aproximadamente 0,9 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3060 o RTX 4060. Para despliegues a mayor escala, GPUs de datacenter como A10, A100 o H100.
- El modelo cabe en GPUs consumer de gama baja-media, e incluso podria ejecutarse en CPU para tareas con baja exigencia de latencia.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con Transformers, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (tras conversion a GGUF) u Ollama.
- No se dispone de datos de latencia ni throughput medidos para este modelo especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1,7B | 32K (segun documentacion oficial de Qwen3) | Apache 2.0 | Modelo base sin fine-tuning, con soporte de thinking mode |
| Shellypeckie/student_qwen3_1p7b_clean4b_dolly_seq_kd | 1,72B | No disponible | No disponible | Fine-tuning con destilacion sobre dataset Dolly |
| Shellypeckie/student_qwen3_1p7b_gpqa_self_dolly_seq_kd | 1,72B (estimado) | No disponible | No disponible | Variante del mismo autor entrenada con dataset GPQA |
| Shellypeckie/student_qwen3_0p6b_clean_dolly_seq_kd | 0,6B (estimado) | No disponible | No disponible | Variante de menor tamano del mismo autor |

Nota: los datos del modelo base Qwen3-1.7B provienen de la documentacion publica de Qwen; las variantes de Shellypeckie no tienen especificaciones detalladas publicadas.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license", que no es una licencia identificable. El uso comercial del modelo es incierto y requiere consultar al autor.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, por lo que no se puede evaluar su calidad relativa frente a otros modelos.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay feedback de otros usuarios que indique su fiabilidad en produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje pequeno, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o hechos especificos.
- Alcance de idiomas desconocido: no se documentan los idiomas soportados tras el fine-tuning, lo que dificulta planificar su uso en aplicaciones multilingues.
- Documentacion incompleta: el codigo de ejemplo en la model card contiene un placeholder (`model="None"`), lo que sugiere que la documentacion no esta pulida y que el modelo podria no estar listo para produccion.
- Posibles sesgos: al estar entrenado sobre el dataset Dolly, puede heredar sesgos presentes en ese conjunto de datos, aunque no hay analisis de sesgos publicado.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Shellypeckie/student_qwen3_1p7b_clean4b_dolly_seq_kd
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante del mismo autor con dataset GPQA: https://huggingface.co/Shellypeckie/student_qwen3_1p7b_gpqa_self_dolly_seq_kd
- Variante de 0,6B del mismo autor: https://huggingface.co/Shellypeckie/student_qwen3_0p6b_clean_dolly_seq_kd
- Variante con dataset ARC (via friendli.ai): https://friendli.ai/models/Shellypeckie/student_qwen3_1p7b_arc_self_dolly_seq_kd
- Libreria TRL (entrenamiento): https://github.com/huggingface/trl
