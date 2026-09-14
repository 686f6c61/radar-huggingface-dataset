# Jeesup/svd-safety-mistral_keep70_disc_b001

## Resumen

svd-safety-mistral_keep70_disc_b001 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2, publicado por el usuario Jeesup como artefacto de investigación. No es un modelo de propósito general ni un asistente listo para producción: es una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes permite repararlo parcialmente. La compresión aplicada es SVD-LLM, con un 29,91 % de los parámetros densos eliminados, lo que deja el modelo en una fracción de 0,7010 respecto al original.

Sobre esa base comprimida se restauró un presupuesto adicional de componentes SVD equivalente al 0,1 % de los parámetros densos, seleccionados mediante la regla denominada `disc`. En total se restauraron 1224 componentes y no se sustituyó ninguno. El resultado es un transformer decoder-only de 7.241.732.096 parámetros almacenados en safetensors (14,5 GB de repositorio), con licencia Apache 2.0 y semilla 42.

Su relevancia es metodológica más que funcional: aporta métricas medidas de tasa de éxito de ataques (AdvBench y StrongREJECT) y de sobrerrechazo, lo que permite cuantificar el compromiso entre seguridad y utilidad bajo compresión. La propia model card advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que cualquier celda debe tratarse como sujeto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B-Instruct-v0.2) |
| Parametros totales | 7.241.732.096 (segun ficheros safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-Instruct-v0.2) |
| Tipos de cuantizacion | No disponible en el repositorio (pesos en safetensors); convertible a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Fraccion de parametros resultante | 0,7009 (segun la model card) |
| Compresion aplicada | SVD-LLM, 29,91 % de parametros densos eliminados |
| Regla de seleccion | `disc` |
| Presupuesto de restauracion | 0,100 % de los parametros densos |
| Componentes restaurados | 1224 |
| Componentes sustituidos | 0 |
| Semilla | 42 |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Tamano del repositorio | 14,5 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2: un transformer decoder-only con atención por ventana deslizante, grouped-query attention y normalización RMSNorm, entrenado originalmente por Mistral AI y afinado por instrucciones. Este checkpoint no ha sido reentrenado ni afinado: la modificación consiste exclusivamente en una compresión de las matrices de pesos mediante SVD-LLM, que descompone las matrices en factores de bajo rango y trunca los componentes menos relevantes, eliminando el 29,91 % de los parámetros densos. Sobre ese modelo comprimido se reinyectó un presupuesto del 0,1 % de parámetros en forma de 1224 componentes SVD previamente truncados, elegidos con la regla `disc`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo etapas de RLHF o DPO en este artefacto, dado que no se ha realizado entrenamiento adicional sobre el checkpoint base. La innovación técnica del trabajo es el propio protocolo experimental: una rejilla que cruza reglas de selección de componentes con presupuestos de restauración para medir el impacto sobre el comportamiento de seguridad. Los hiperparámetros publicados son la semilla (42), la regla de selección (`disc`), el presupuesto (0,100 %) y el número de componentes restaurados (1224).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Mistral-7B-Instruct-v0.2.
- Razonamiento e instrucciones multi-turno en el rango de capacidad del modelo base, pero degradado por la compresión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base lo soporta vía plantilla de chat, pero no se documenta aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidad especial: el modelo está etiquetado como artefacto de investigación en compresión (`svd`, `compression`) e interpretabilidad (`interpretability`), no como asistente desplegable.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Estudio de robustez frente a ataques: el modelo sirve para medir cómo varía la tasa de éxito de ataques (AdvBench, StrongREJECT) al comprimir un LLM y restaurar componentes, comparando celdas de la rejilla con la misma semilla.
- Investigación sobre alineación y compresión: permite analizar si la compresión por SVD destruye preferentemente las representaciones asociadas a rechazo de peticiones dañinas, usando la métrica de sobrerrechazo (WildGuard).
- Evaluación de reglas de selección de componentes: la regla `disc` con presupuesto 0,1 % puede compararse con otras reglas y presupuestos del mismo estudio para determinar cuál repara mejor la seguridad.
- Benchmarking de perplejidad: con una perplejidad de 8,9459 en WikiText-2, es útil para calibrar la pérdida de calidad lingüística introducida por el truncado de bajo rango.
- Reproducción de experimentos: al publicarse semilla, presupuesto y número de componentes, permite replicar el pipeline de compresión SVD-LLM sobre el mismo modelo base.
- Análisis de eficiencia de memoria: al reducir el rango de las matrices de pesos, sirve para estudiar compensaciones entre huella de memoria y calidad en entornos con VRAM limitada.
- No se recomienda su uso como asistente de atención al cliente, generación de código en producción ni ningún escenario orientado a usuarios finales, según la propia model card.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados en la model card, medidos con el juez de HarmBench y WildGuard.

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,5462 |
| StrongREJECT ASR (juez HarmBench) | 0,4473 |
| Sobrerrechazo macro (WildGuard) | 0,0630 |
| Perplejidad en WikiText-2 | 8,9459 |

No se han publicado en la información disponible los valores equivalentes para el modelo base sin comprimir ni para otras celdas de la rejilla, por lo que no es posible establecer aquí una comparación cuantitativa directa del daño inducido por la compresión.

## Requisitos de hardware

- VRAM estimada en precisión completa (bf16/fp16): en torno a 14,5 GB de pesos más memoria para el contexto y el KV cache; se recomienda un mínimo de 16-20 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para inferencia en precisión completa con lotes grandes.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) sin cuantizar; en RTX 4070 Ti / 4080 (16 GB) o GPUs de 8-12 GB requiere cuantización a 8 o 4 bits y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama requerirían convertir los pesos a los formatos correspondientes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota: la model card indica que el checkpoint es un artefacto de investigación y no un modelo desplegable, por lo que estos requisitos son orientativos para experimentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-mistral_keep70_disc_b001 | 7.241.732.096 almacenados; fraccion 0,7009 | 32.768 tokens (heredado del base) | Apache 2.0 | HuggingFace, 0 descargas | Artefacto de investigación con seguridad degradada |
| mistralai/Mistral-7B-Instruct-v0.2 | ~7.240 M | 32.768 tokens | Apache 2.0 (el repo base no incluye fichero de licencia para redistribucion, segun la model card) | HuggingFace | Modelo de referencia sin comprimir; mejores valores de seguridad esperados, sin datos comparables publicados aquí |
| Otras celdas de la rejilla `svd-safety-mistral` del mismo autor | No disponible | No disponible | Apache 2.0 | HuggingFace | Mismo protocolo con distintas reglas y presupuestos; datos no disponibles |
| Alternativas de ~7-8 B de propósito general (Llama 3.1 8B Instruct, Qwen2.5 7B Instruct, Mistral-7B-Instruct-v0.3) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados en la información suministrada |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad del modelo base directo.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no es un modelo de chat de propósito general y que no debe desplegarse como asistente.
- Seguridad degradada: la compresión por sí sola eleva la tasa de éxito de ataques; el AdvBench ASR de 0,5462 y el StrongREJECT ASR de 0,4473 indican que aproximadamente la mitad de los ataques tienen éxito, un valor no apto para producción.
- Riesgo elevado de respuestas dañinas, con independencia del sobrerrechazo relativamente bajo (0,0630), lo que sugiere un fallo selectivo del rechazo más que una política conservadora.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad de 8,9459 en WikiText-2 frente a la del modelo sin comprimir no se proporciona.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Limitaciones de contexto: la ventana de 32.768 tokens es la del modelo base y no se ha revalidado tras la compresión.
- Licencia: Apache 2.0 para este derivado, según la model card. El repositorio del modelo base no incluye fichero de licencia para su redistribución, lo que conviene revisar antes de un uso comercial.
- Caveat de producción: los pesos no están cuantizados en el repositorio y su conversión a GGUF u otros formatos puede alterar aún más el comportamiento de seguridad, ya medido sobre el checkpoint original.
- Fecha de creación declarada en el repositorio: 14 de septiembre de 2026, dato procedente de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep70_disc_b001
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper de SVD-LLM: no disponible en la información proporcionada (la model card menciona el método sin enlace)
- Repositorios, demos o blogs adicionales: no disponibles en la información proporcionada
