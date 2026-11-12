# MiamnusAI/Miamnus-M1-Nano-v1.8

## Resumen

Miamnus-M1-Nano-v1.8 es un modelo de lenguaje causal compacto desarrollado por Miamnus AI. Se trata de un modelo de 22,2 millones de parametros (22.247.880 pesos reales en safetensors) que emplea una arquitectura hibrida recurrente 3:1, combinando capas de atencion lineal KDA (Kernelized Delta Attention) con capas de atencion GQA (Grouped-Query Attention) a lo largo de 24 bloques de transformer. La propuesta del autor es ofrecer un modelo de muy bajo coste computacional que funcione sin dependencias de kernels externos de Triton o CUDA.

El modelo esta implementado en PyTorch puro y es autocontenido, lo que permite ejecutarlo directamente en Apple Silicon (MPS), CPU y NVIDIA CUDA sin compilacion de kernels. Con una ventana de contexto de 1.024 tokens y un vocabulario de 4.096 tokens (Byte-Level BPE), esta disenado para tareas de generacion de texto en ingles sobre hardware modesto.

Su relevancia actual reside en la experimentacion con arquitecturas hibridas de atencion lineal en escalas muy reducidas, utiles para investigacion, prototipado rapido y despliegue en entornos con recursos limitados. No obstante, su tamano y contexto lo sitúan lejos de los modelos de proposito general actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida 3:1 (KDA linear attention + GQA), transformer causal |
| Parametros totales | 22.247.880 (22,2M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, PyTorch puro) |

Especificaciones adicionales declaradas por el autor: 24 capas (18 KDA + 6 GQA), dimension oculta 256, 4 cabezas de query y 2 de key/value, dimension de cabeza 64, FFN intermedio de 704 con SwiGLU, vocabulario de 4.096 tokens (Byte-Level BPE).

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido que intercala capas de atencion lineal KDA y capas de atencion GQA en una proporcion 3:1, resultando en 18 capas KDA y 6 capas GQA sobre 24 bloques totales. La dimension oculta es de 256, con 4 cabezas de query y 2 de key/value de 64 dimensiones cada una, y una FFN SwiGLU con dimension intermedia de 704. El modelo se distribuye con codigo propio (`custom_code`) en PyTorch puro, sin kernels Triton ni CUDA, lo que facilita su ejecucion en CPU, MPS y CUDA.

El autor indica que el preentrenamiento se realizo sobre el dataset MiamnusAI/CuratedCorpus-5B. No se especifica en la informacion disponible el numero exacto de tokens efectivamente consumidos, la composicion del corpus, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detallan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto causal en ingles, con ventana de contexto de 1.024 tokens.
- Razonamiento basico y continuacion de texto; no se documentan capacidades especificas de matematicas o codigo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Ejecucion en CPU, Apple Silicon (MPS) y NVIDIA CUDA sin compilacion de kernels externos.

## Casos de uso

- Prototipado de arquitecturas hibridas de atencion lineal: util para investigadores que quieran validar rapidamente variantes KDA/GQA en un modelo de 22M de parametros antes de escalar.
- Generacion de texto en dispositivos de recursos muy limitados: al ocupar aproximadamente 0,1 GB en safetensors, puede ejecutarse en CPU o en placas embebidas para tareas de continuacion de texto corto.
- Educacion y docencia: modelo pequeno y autocontenido en PyTorch puro para explicar el funcionamiento interno de un transformer causal hibrido sin dependencias complejas.
- Pruebas de integracion con Hugging Face Transformers: sirve como banco de pruebas para flujos `trust_remote_code=True` y `custom_code`.
- Generacion de texto auxiliar offline en ingles: completar frases o parrafos cortos en aplicaciones sin conectividad, con contexto maximo de 1.024 tokens.
- Benchmarking de latencia en Apple Silicon: permite medir el rendimiento de atencion lineal frente a atencion estandar en MPS con un modelo de bajo coste.
- Fines de investigacion sobre tokenizadores reducidos: su vocabulario de 4.096 tokens permite estudiar el impacto de vocabularios pequenos en la calidad de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en precision completa (22,2M de parametros en safetensors); en FP16 alrededor de 45 MB de pesos.
- GPU recomendadas: cualquier GPU moderna; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100, aunque no necesita ninguna de ellas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, e incluso en CPU y Apple Silicon (MPS).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, script `generate.py` incluido en el repositorio. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (hibridos de atencion lineal de ~22M de parametros); los modelos de referencia habituales en ese rango (p. ej. variantes de GPT-2 small de 124M o TinyLlama de 1,1B) difieren en orden de magnitud, por lo que una comparacion directa no seria significativa con los datos disponibles.

## Limitaciones y advertencias

- Modelo muy pequeno (22,2M de parametros): su capacidad de razonamiento, conocimiento factual y coherencia en generaciones largas es limitada en comparacion con modelos de mayor escala.
- Ventana de contexto de solo 1.024 tokens, insuficiente para tareas de contexto largo, RAG o conversaciones multi-turno extensas.
- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de generar texto incoherente, especialmente fuera de dominios vistos en el corpus de preentrenamiento.
- No se documentan sesgos especificos, pero al no existir informacion sobre la composicion del corpus ni sobre fases de alineacion (RLHF/DPO), no puede descartarse la presencia de sesgos del dataset.
- Requiere `trust_remote_code=True` y codigo `custom_code`, lo que implica ejecutar codigo del autor; conviene revisarlo antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y aviso de licencia.
- No apto como modelo de proposito general en produccion; su uso realista es investigacion, docencia y prototipado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MiamnusAI/Miamnus-M1-Nano-v1.8
- Dataset de preentrenamiento: https://huggingface.co/datasets/MiamnusAI/CuratedCorpus-5B
