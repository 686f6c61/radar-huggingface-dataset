# Simplepotat/Qwen3.8-27B-IQ5_KS-GGUF

## Resumen

Simplepotat/Qwen3.8-27B-IQ5_KS-GGUF es una cuantización GGUF de tipo IQ5_KS del modelo Qwen3.8-27B, publicado por el usuario Simplepotat. No se trata de un modelo entrenado desde cero, sino de una distribución de pesos cuantizados derivada del modelo base Qwen/Qwen3.8-27B, con licencia Apache 2.0. El paquete incluye dos variantes: una con soporte de decodificación especulativa MTP (Multi-Token Prediction) y otra sin los tensores MTP, con un ahorro de 430 MiB en disco.

La cuantización se ha generado reutilizando la receta de tensores por tensor de Ubergarm (originalmente diseñada para Qwen 3.6 27B) junto con su matriz de importancia actualizada para Qwen 3.8. Según la model card, la estructura del modelo 3.8 es prácticamente idéntica a la de su predecesor, lo que permite aplicar la misma receta y mantener un rendimiento de referencia con offload completo en GPU de 24 GB.

El modelo está pensado para su uso con ik_llama.cpp, una bifurcación de llama.cpp optimizada por Ikawrakow que incluye soporte para decodificación especulativa MTP y cuantizaciones IQ de alta calidad. Con 27.320.697.856 parámetros totales, el archivo IQ5_KS ocupa 18,963 GiB (variante MTP) y 18,543 GiB (sin MTP), lo que lo hace viable en tarjetas gráficas de consumo de gama alta con 24 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles especificos no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ5_KS (con y sin tensores MTP) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 80,6 GB |
| Tamano del archivo MTP | 18,963 GiB |
| Tamano del archivo sin MTP | 18,543 GiB |
| Libreria recomendada | ik_llama.cpp |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

Esta ficha corresponde a una cuantizacion, no a un modelo entrenado de forma independiente. La arquitectura subyacente es la del modelo Qwen3.8-27B, del que no se proporcionan detalles especificos en la informacion disponible (numero de capas, dimensiones de atencion, tipo de atencion, etc.). La model card indica que la estructura de Qwen 3.8 27B es "mas o menos identica" a la de Qwen 3.6 27B, lo que justifica la reutilizacion de la receta de tensores de Ubergarm.

El proceso de cuantizacion emplea una matriz de importancia (imatrix) actualizada especificamente para Qwen 3.8, generada por Ubergarm, y un cuantizador por tensor individual (build 5263 de Thireus sobre ik_llama.cpp). La variante MTP incorpora los tensores del predictor de Multi-Token Prediction, que permiten decodificacion especulativa en ik_llama.cpp mediante el flag `--spec-type mtp:n_max=1,p_min=0.0`. La variante sin MTP elimina esos tensores, reduciendo el tamano en 430,413 MiB sin cambiar el uso de VRAM cuando MTP esta desactivado, ya que el cargador de ik_llama.cpp ignora los tensores del predictor en ese caso.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre procesos de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el modelo incluye la plantilla de chat oficial de Qwen3.8-27B, lo que permite su uso directo en dialogos multi-turno.
- Decodificacion especulativa MTP: la variante con MTP permite acelerar la generacion mediante prediccion multi-token en ik_llama.cpp.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructuras de inferencia compatibles con la API de Hugging Face.
- Ejecucion local con offload completo en GPU de 24 GB: disenado para mantener contexto de precision completa de longitud media.
- Capacidades especificas del modelo base (razonamiento, codigo, matematicas, tool calling, multilingue): no disponibles en la informacion proporcionada; deben consultarse en la model card de Qwen/Qwen3.8-27B.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de 24 GB: gracias a sus 18,5-19 GiB, el modelo cabe completo en una RTX 4090 o RTX 3090, permitiendo inferencia sin offload a CPU y con contexto de precision completa de longitud media.
- Asistentes conversacionales autoalojados: la plantilla de chat oficial de Qwen3.8-27B y el formato GGUF facilitan su integracion en interfaces tipo chat (por ejemplo, mediante ik_llama.cpp o servidores compatibles con OpenAI API).
- Aceleracion de inferencia con MTP: en escenarios donde la latencia importa (generacion interactiva), la variante MTP con `--spec-type mtp:n_max=1` permite decodificacion especulativa, reduciendo el tiempo por token en hardware compatible.
- Prototipado e investigacion en entornos con recursos limitados: al ser una cuantizacion IQ5_KS de alta calidad, permite evaluar el comportamiento del modelo base sin necesidad de infraestructura de 80 GB de VRAM.
- Pipelines de generacion de texto por lotes: la reduccion de tamano frente al BF16 original (80,6 GB de repo frente a un unico archivo de ~19 GiB) abarata el almacenamiento y la distribucion en multiples nodos.
- Pruebas de cuantizacion y comparativas de calidad: util para investigadores que quieran medir la degradacion de IQ5_KS frente a otras cuantizaciones (Q4_K_M, Q6_K, etc.) del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GiB para el archivo MTP y 18,5 GiB para el archivo sin MTP, segun los tamanos indicados en la model card. La model card afirma que permite offload completo en 24 GB con espacio para contexto de precision completa de longitud media.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX A6000 (48 GB), A100 (40/80 GB), H100 (80 GB).
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas de VRAM (RTX 4090, RTX 3090, RTX 4080 Super no alcanza los 24 GB, por lo que no cabria con offload completo).
- Opciones de despliegue: ik_llama.cpp (recomendado por el autor, con soporte MTP), llama.cpp (sin soporte MTP), y potencialmente otros runners compatibles con GGUF. No se confirma compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP deberia reducir la latencia por token respecto a la variante sin MTP, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Simplepotat/Qwen3.8-27B-IQ5_KS-GGUF | 27,3 B | no disponible | GGUF (IQ5_KS) | Apache 2.0 | Cuantizacion con y sin MTP para ik_llama.cpp |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | safetensors (BF16) | Apache 2.0 | Modelo original sin cuantizar |
| ggml-org/Qwen3.8-27B-GGUF | 27,3 B | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Fuente BF16 GGUF usada por este autor |
| ubergarm/Qwen3.8-27B-GGUF | 27,3 B | no disponible | GGUF | Apache 2.0 | Matriz de importancia y receta de tensores originales |

## Limitaciones y advertencias

- Es una cuantizacion IQ5_KS: introduce perdida de precision respecto al modelo BF16 original; la magnitud de la degradacion no se documenta en la informacion disponible.
- Dependencia de ik_llama.cpp para aprovechar MTP: en llama.cpp estandar u otros runners, los tensores MTP se ignoran y no se obtiene la aceleracion.
- La receta de cuantizacion se reutiliza de Qwen 3.6 27B asumiendo estructura identica; el autor no aporta validacion empirica de que el rendimiento se mantenga en Qwen 3.8.
- Idiomas soportados no documentados en esta ficha; deben consultarse en el modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son heredados del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Qwen/Qwen3.8-27B.
- El repositorio ocupa 80,6 GB, aunque los archivos individuales son de ~19 GiB; el almacenamiento necesario para descargar el repo completo es considerable.
- No se proporcionan datos de contexto maximo, por lo que no se puede garantizar el comportamiento en ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Simplepotat/Qwen3.8-27B-IQ5_KS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente BF16 GGUF: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Receta de tensores: https://huggingface.co/ubergarm/Qwen3.6-27B-GGUF
- Matriz de importancia: https://huggingface.co/ubergarm/Qwen3.8-27B-GGUF
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Build del cuantizador: https://github.com/Thireus/ik_llama.cpp/releases/tag/th-quantize_individual_tensors-b5263-8cbc1f7
