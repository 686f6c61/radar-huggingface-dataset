# positron-ai/Qwen_Qwen2.5-32B-Instruct-ingest-best-gptq

## Resumen

El modelo `positron-ai/Qwen_Qwen2.5-32B-Instruct-ingest-best-gptq` es una cuantización GPTQ de 4 bits del modelo `Qwen/Qwen2.5-32B-Instruct`, producida por Positron AI. Su objetivo es ofrecer una versión optimizada para inferencia en GPU con menor consumo de memoria, manteniendo las capacidades del modelo original. Con 32.763.876.352 parámetros, el repositorio ocupa 20 GB, lo que permite ejecutarlo en tarjetas gráficas de consumo con 24 GB de VRAM. La cuantización usa grupo de tamaño 64 y no activa el reordenamiento de activaciones (`desc_act`), lo que puede influir en la precisión y en el rendimiento.

El modelo base Qwen2.5-32B-Instruct es un LLM de 32B parámetros desarrollado por Alibaba, entrenado con un enfoque en razonamiento, codificación y matemáticas, con una ventana de contexto de 32.768 tokens. Esta versión cuantizada hereda esas capacidades, aunque con una ligera degradación esperada por la reducción de precisión. Es relevante para equipos que necesitan desplegar un modelo de 32B en hardware limitado sin recurrir a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (según el modelo base) |
| Tipos de cuantizacion | GPTQ de 4 bits (group size 64, desc_act false) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | other (la licencia original del modelo base Qwen2.5-32B-Instruct aplica) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado desde cero, sino una cuantización post-entrenamiento del modelo `Qwen/Qwen2.5-32B-Instruct`. La cuantización GPTQ convierte los pesos de precisión completa (FP16/BF16) a 4 bits mediante un proceso de calibración sobre un conjunto mixto de 256 muestras con longitud de secuencia 2048. La herramienta utilizada es GPTQModel 5.8.0 con transformers 4.57.6 y torch 2.9.1. El modelo base Qwen2.5-32B-Instruct es un transformer decoder-only con atención estándar, entrenado con datos masivos (no se especifica el número de tokens) y refinado con instrucciones y preferencias humanas (RLHF/DPO). No se aplican técnicas de activación cuantizada ni decodificación especulativa en esta versión.

## Capacidades

- Generación de texto en lenguaje natural, con razonamiento lógico y matemático.
- Capacidades de codificación y depuración, gracias al entrenamiento del modelo base en tareas de programación.
- Soporte de tool calling y function calling (heredado del modelo base).
- Capacidad de manejo de agentes y razonamiento multi-paso.
- Multilingüismo (aunque no se detallan los idiomas concretos en esta versión).
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32.768 tokens), adecuado para sistemas de soporte por chat en empresas.
- Generación de código en producción: soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para generar, revisar o documentar código, siempre que se valide la salida.
- Análisis de documentos extensos: su ventana de contexto permite resumir o extraer información de informes técnicos, contratos o artículos largos.
- Asistente de programación local: al caber en una GPU de 24 GB, se puede desplegar en una estación de trabajo para desarrollo sin depender de servicios externos.
- Razonamiento matemático y científico: el modelo base tiene buen rendimiento en matemáticas (GSM8K, MATH), lo que lo hace útil para tutorías o resolución de problemas.
- Generación de contenido técnico: puede redactar documentación, tutoriales o explicaciones técnicas en varios idiomas.

## Benchmarks y rendimiento

La model card reporta un valor de MMLU mean de 0.6726, comparado con la referencia del modelo base (0.6726). No se han publicado otros benchmarks (HumanEval, GSM8K, etc.) ni métricas de divergencia KL. El resto de métricas de validación están marcadas como "n/a" o no medidas.

| Metric | Result | Reference |
|---|---|---|
| MMLU mean | 0.6726 | Qwen/Qwen2.5-32B-Instruct (0.6726) |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en 4 bits ocupa unos 20 GB (según el tamaño del repo). Con overhead de activaciones y memoria del runtime, se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40 GB), H100 (80 GB) o superiores. No cabe en GPUs de 16 GB (RTX 4080, 4060 Ti) ni en tarjetas de 8 GB.
- Opciones de despliegue: compatible con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (con conversión), o directamente con transformers y GPTQModel.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090 se espera una velocidad de generación de unos 20-40 tokens/s, pero no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | MMLU |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct (original) | 32.8B | 32K | Qwen License | safetensors (BF16) | 0.6726 |
| positron-ai GPTQ 4-bit (este) | 32.8B | 32K | other (hereda) | safetensors (GPTQ 4-bit) | 0.6726 (referencia) |
| Qwen2.5-32B-Instruct-GPTQ-Int4 (oficial) | 32.8B | 32K | Qwen | safetensors (GPTQ 4-bit) | no disponible |

No hay comparativa publicada con otros modelos de tamaño similar (p.ej., Llama 3.1 70B, Mixtral 8x7B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir una ligera degradación en la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas.
- No se han medido métricas de divergencia (KL) ni de acuerdo top-1, por lo que el impacto exacto de la cuantización no está validado.
- La licencia del modelo base (Qwen2.5) puede tener restricciones de uso comercial; se debe revisar la licencia original antes de desplegar en producción.
- El modelo base tiene sesgos y riesgos de alucinación inherentes a los LLM; la cuantización no los elimina.
- No se proporcionan datos sobre el rendimiento en idiomas distintos al inglés; se debe validar para casos de uso multilingüe.
- El proceso de calibración usó solo 256 muestras, lo que puede afectar la precisión en dominios muy específicos.

## Enlaces

- [HuggingFace del modelo cuantizado](https://huggingface.co/positron-ai/Qwen_Qwen2.5-32B-Instruct-ingest-best-gptq)
- [HuggingFace del modelo base](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct)
- [Página de Ollama para qwen2.5:32b](https://ollama.com/library/qwen2.5:32b-instruct)
- [llm-explorer (versión GPTQ Int8)](https://llm-explorer.com/model/Qwen%2FQwen2.5-32B-Instruct-GPTQ-Int8,4gqOKMnEBVtkTkmh6g271x)
