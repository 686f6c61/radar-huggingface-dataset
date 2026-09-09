# nvidia/Qwen3.8-27B-NVFP4

## Resumen

El modelo `nvidia/Qwen3.8-27B-NVFP4` es una versión cuantizada del modelo base `Qwen/Qwen3.8-27B`, desarrollado por Alibaba. NVIDIA ha aplicado una receta de cuantización mixta con **Model Optimizer** para reducir el peso del checkpoint y acelerar la inferencia en hardware de la familia **NVIDIA Blackwell**. El checkpoint resultante ocupa 21.9 GB y contiene 18.164.649.200 valores en tensores, aunque la arquitectura original es un modelo denso de 27B.

Se trata de un modelo multimodal de tipo transformer que acepta **texto, imagen y video** como entrada y genera texto. Su ventana de contexto alcanza los **262K tokens**, lo que lo hace apto para tareas de contexto largo, RAG y agentes que necesitan mantener conversaciones o documentos extensos. Está preparado para desplegarse con **vLLM** o **SGLang**, y es adecuado tanto para uso comercial como no comercial bajo licencia Apache 2.0.

La relevancia actual de este modelo radica en que ofrece una vía práctica para ejecutar un modelo de 27B con capacidades multimodales y de agente en entornos productivos, aprovechando la cuantización NVFP4/FP8 para reducir los requisitos de memoria sin comprometer de forma documentada el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 18.164.649.200 (valores en safetensors); nominalmente 27B según la model card |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 262K tokens |
| Tipos de cuantizacion | Mixta: NVFP4 en MLP y `lm_head`; FP8 en capas de self-attention y linear-attention |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer optimizado con capacidad de procesar texto, imagen y video. La cuantización fue realizada por NVIDIA con `nvidia-modelopt` v0.48.0. Se aplicó **NVFP4** a las capas MLP y a la cabeza de modelo (`lm_head`), mientras que las capas de **self-attention** y **linear-attention** se cuantizaron en **FP8**. La calibración de las capas NVFP4 se realizó sobre 2048 muestras del dataset **Nemotron-Post-Training-Dataset-v3**, empleando el algoritmo **Local-Hessian** de Model Optimizer.

Los datos originales de entrenamiento del modelo base (tokens, composición del dataset, procesos de alineación como RLHF o DPO) no son publicados por la documentación disponible. Tampoco se especifica el tamaño de los datos de imagen o video utilizados en el entrenamiento original.

## Capacidades

- Generación de texto autorregresiva con soporte multimodal (visión y video).
- Razonamiento de nivel avanzado, indicado por su evaluación en **GPQA Diamond** (preguntas de opción múltiple de nivel de posgrado en biología, física y química).
- Ejecución de tareas agénticas en terminal, respaldado por su evaluación en **Terminal-Bench**.
- Recuperación y recuerdo de información en contextos largos, evaluado con **AA-LCR**.
- Razonamiento multimodal tipo college, evaluado con **MMMU-Pro**.
- Generación de código científico, evaluado en **SciCode**.
- Seguimiento de instrucciones complejas y con restricciones estructuradas, evaluado en **IFBench**.
- Soporte de **tool calling**, **multi-step reasoning** y **configurable thinking depth**, según la ficha publicada en NVIDIA NGC.
- Procesamiento de contexto largo hasta 262K tokens para tareas de RAG y documentación extensa.

## Casos de uso

- Agentes de terminal en entornos Linux: gracias a su rendimiento en Terminal-Bench, el modelo puede integrarse en sistemas de automatización que ejecutan comandos, gestionan procesos y completan tareas agénticas de varios pasos.
- Asistentes de investigación multimodal: en laboratorios o universidades, el modelo puede analizar diagramas, capturas o vídeos para responder preguntas académicas complejas, apoyándose en sus resultados en MMMU-Pro.
- Generación de código científico: en sectores como bioinformática o simulación numérica, el modelo ayuda a escribir scripts de análisis de datos, aprovechando la evaluación en SciCode.
- Sistemas RAG con documentos extensos: la ventana de 262K permite indexar y consultar informes completos, actas jurídicas o manuales técnicos sin fragmentar el texto, reduciendo la pérdida de contexto.
- Análisis de vídeo en seguridad o monitorización industrial: el modelo acepta vídeo en formatos MP4/WebM y devuelve texto, lo que permite resumir secuencias o detectar eventos descritos mediante un pipeline de inferencia con vLLM.
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno y combinar tool calling para consultar bases de conocimiento o sistemas de ticketing, siempre que se valide con datos específicos del dominio.
- Razonamiento lógico en aplicaciones educativas: su capacidad en benchmarks tipo GPQA Diamond lo hace útil para plataformas de formación que generan preguntas de nivel avanzado o ejercicios de razonamiento en ciencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona los datasets de evaluación utilizados (GPQA Diamond, Terminal-Bench, AA-LCR, MMMU-Pro, SciCode, IFBench), pero no proporciona puntuaciones numéricas. Por tanto, no es posible comparar el rendimiento con otros modelos a partir de estos datos.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. El checkpoint pesa 21.9 GB en disco, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos, más el overhead de la inferencia.
- GPU recomendada: NVIDIA Blackwell. El hardware de prueba utilizado fue **NVIDIA Grace Blackwell GB300**.
- Compatibilidad con GPU de consumo: no hay información explícita. El soporte se limita a la microarquitectura Blackwell, que incluye tanto GPU de datacenter como algunas GPU de consumo, pero no se ha validado en la documentación.
- Opciones de despliegue: vLLM y SGLang. Para vLLM, se recomienda usar el contenedor `vllm/vllm-openai:nightly`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se compara el checkpoint cuantizado con el modelo base original, ya que no se disponen de otras variantes cuantizadas en la información proporcionada.

| Parametro | Qwen/Qwen3.8-27B (base) | nvidia/Qwen3.8-27B-NVFP4 |
|---|---|---|
| Arquitectura | Transformer multimodal (`Qwen3_5ForConditionalGeneration`) | Transformer multimodal (`Qwen3_5ForConditionalGeneration`) |
| Parametros | 27B (nominal) | 18.164.649.200 (checkpoint cuantizado) |
| Contexto | Hasta 262K | Hasta 262K |
| Cuantizacion | Ninguna (pesos originales) | NVFP4 en MLP y `lm_head`; FP8 en attention y linear-attention |
| Licencia | Apache 2.0 | Apache 2.0 |
| Formato de pesos | safetensors | safetensors |
| Tamanio del checkpoint | No disponible | 21.9 GB |
| Hardware de referencia | No disponible | NVIDIA Blackwell (GB300) |

## Limitaciones y advertencias

- El modelo no ha sido desarrollado por NVIDIA: se trata de una cuantización de un modelo de terceros (Alibaba). NVIDIA no garantiza el comportamiento del modelo original.
- La cuantización NVFP4/FP8 puede introducir pérdida de precisión. La documentación no incluye métricas de degradación respecto al modelo base.
- Los idiomas soportados no están documentados, por lo que no se puede garantizar una cobertura lingüística concreta.
- La documentación de NVIDIA recomienda realizar pruebas adicionales con datos específicos del caso de uso, siguiendo la metodología V-model, antes de desplegar en producción.
- Riesgo de alucinación inherente a los modelos autorregresivos, especialmente en tareas de razonamiento complejo o con contextos largos.
- El soporte de hardware está limitado a la familia Blackwell. No hay evidencia de que funcione correctamente en arquitecturas anteriores como Ampere o Hopper, ni en CPU.
- El modelo solo tiene soporte de salida de texto. Aquellos casos que necesiten generar imágenes o vídeo deberán integrarse con otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Ficha en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
