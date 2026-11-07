# mradermacher/Qwen3.8-27B-Weight-Space-Programming-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Weight-Space-Programming-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base `ReBatch/Qwen3.8-27B-Weight-Space-Programming`. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos ya existentes en múltiples precisiones para facilitar su ejecución en hardware de consumo mediante llama.cpp y derivados.

El modelo subyacente cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), según los datos de safetensors del repositorio. El nombre sugiere una variante de la familia Qwen3 orientada a "weight-space programming", aunque la información disponible no documenta en qué consiste esa especialización ni el proceso de entrenamiento.

La relevancia de este repositorio es práctica: ofrece el modelo en cuantizaciones que van desde Q2_K hasta F16, lo que permite desplegarlo en un espectro amplio de GPUs, desde tarjetas de consumo con poca VRAM hasta aceleradores profesionales. No obstante, la ausencia de model card detallada, licencia declarada y benchmarks limita seriamente su evaluación rigurosa para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base presumiblemente en safetensors |
| Tamaño del repositorio | 105,5 GB |
| Pipeline | no disponible |
| Tags | gguf, endpoints_compatible, conversational |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `ReBatch/Qwen3.8-27B-Weight-Space-Programming`. Por el nombre y el tamaño (27,3 B parámetros) se infiere una familia tipo Qwen3, pero no hay confirmación documental sobre si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Lo único documentado en la model card es el proceso de cuantización: se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) generadas con las herramientas habituales de mradermacher sobre los pesos en formato Hugging Face convertidos a GGUF. No se describe ninguna innovación arquitectónica ni técnica de decodificación especulativa.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere uso en diálogo multi-turno, aunque no se detallan formatos de prompt ni plantillas de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante infraestructura compatible con la API de Hugging Face.
- Ejecución local vía GGUF: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores derivados.
- Razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponible (no documentado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: cargar la cuantización Q4_K_M o Q5_K_M en llama.cpp u Ollama para disponer de un modelo de 27 B en una GPU de consumo con 24 GB de VRAM, ajustando el offload de capas a CPU si es necesario.
- Experimentación con cuantizaciones: comparar la degradación de calidad entre Q2_K, Q3_K_M, Q4_K_M e IQ4_XS sobre un mismo conjunto de prompts para elegir el punto óptimo de tamaño/calidad en un pipeline propio.
- Servicio conversacional autoalojado: servir la variante Q8_0 o F16 mediante un endpoint compatible con la API de Hugging Face en un servidor con GPU profesional, para prototipos de chatbot internos.
- Evaluación de modelos derivados: usar este repositorio como referencia para estudiar variantes del mismo linaje (por ejemplo, la versión Uncensored del mismo autor) y comparar comportamientos.
- Integración en herramientas de escritorio: emplear los GGUF en aplicaciones tipo LM Studio o interfaces de escritorio que consumen GGUF directamente, sin necesidad de infraestructura de servidor.
- Pruebas de viabilidad antes de invertir en el modelo completo: validar con cuantizaciones pequeñas (Q2_K, Q3_K_S) si el modelo responde adecuadamente a la tarea objetivo antes de desplegar F16 o Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos; no confirmada por el autor):
  - F16: en torno a 54 GB de pesos, más overhead de contexto; requiere GPU profesional (A100 80 GB, H100, o multi-GPU).
  - Q8_0: en torno a 29 GB; requiere A100 40 GB o similar.
  - Q6_K: en torno a 22-23 GB; cabe ajustado en RTX 4090 (24 GB) con contexto corto.
  - Q5_K_M / Q5_K_S: en torno a 19-20 GB; cabe en RTX 4090 y A6000.
  - Q4_K_M / Q4_K_S / IQ4_XS: en torno a 16-17 GB; cabe en RTX 4090, RTX 3090 y GPUs de 24 GB con margen para contexto.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 12-14 GB; cabe en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB).
  - Q2_K: en torno a 10 GB; viable en GPUs de 12 GB con contexto reducido.
- GPU recomendadas: A100 80 GB o H100 para F16/Q8_0; RTX 4090, RTX 3090 o A6000 para Q4-Q6; RTX 4080/4060 Ti 16 GB para Q3; GPUs de 12 GB para Q2_K.
- Despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Weight-Space-Programming-GGUF | 27,3 B | no disponible | no disponible | GGUF | Objeto de esta ficha; cuantizaciones estáticas |
| ReBatch/Qwen3.8-27B-Weight-Space-Programming | 27,3 B (presumible) | no disponible | no disponible | safetensors (presumible) | Modelo base del que derivan estas cuantizaciones |
| mradermacher/Qwen3.8-27B-Uncensored-GGUF | 27 B (según ficha externa) | no disponible | no disponible | GGUF | Variante "uncensored" del mismo linaje, mismo autor de cuantización |
| mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF | 27 B | no disponible | no disponible | GGUF | Otra variante del mismo linaje con cuantizaciones imatrix |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan arquitectura, datos de entrenamiento, idiomas ni comportamiento esperado, lo que impide una evaluación rigurosa.
- Licencia no declarada: no es posible determinar si el uso comercial está permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue en producción.
- Idiomas no especificados: no se puede garantizar calidad multilingüe ni siquiera en castellano.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, agravado por la falta de benchmarks que caractericen su fiabilidad.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden perder calidad de forma notable en razonamiento y código; se recomienda Q4_K_M o superior para tareas exigentes.
- Linaje incierto: el nombre "Qwen3.8-27B-Weight-Space-Programming" no corresponde a una designación oficial conocida de la familia Qwen; conviene verificar el origen y los pesos reales antes de confiar en el modelo.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad que haya validado su funcionamiento.
- Sin datos de contexto: planificar el despliegue asumiendo un contexto conservador hasta confirmar la ventana real del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Weight-Space-Programming-GGUF
- Modelo base: https://huggingface.co/ReBatch/Qwen3.8-27B-Weight-Space-Programming
- Variante Uncensored (ficha externa): https://abliteration.org/models/mradermacher/Qwen3.8-27B-Uncensored-GGUF
- Variante USS-Prism-i1: https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF
