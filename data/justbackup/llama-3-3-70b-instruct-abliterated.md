# Justbackup/Llama-3.3-70B-Instruct-abliterated

## Resumen

Justbackup/Llama-3.3-70B-Instruct-abliterated es una variante del modelo Llama-3.3-70B-Instruct de Meta, modificada mediante la técnica de "abliteration" para eliminar los mecanismos de rechazo y censura presentes en el modelo original. El resultado es un modelo de generación de texto que responde sin las restricciones habituales de seguridad, lo que lo hace especialmente relevante para aplicaciones de investigación, generación creativa sin filtros o estudios sobre alineación y comportamiento de modelos.

El modelo conserva la arquitectura y el tamaño del modelo base: 70.553.706.496 parámetros (70B), con pesos en formato safetensors y un tamaño de repositorio de 141.1 GB. Está diseñado para la generación de texto en múltiples idiomas (inglés, francés, italiano, portugués, hindi, español, tailandés y alemán) y se distribuye bajo la licencia Llama 3.3 Community License. No se han publicado detalles sobre el proceso exacto de abliteration, ni sobre la longitud de contexto o cuantizaciones disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada del modelo base Llama-3.3-70B-Instruct) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | llama3.3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Llama-3.3-70B-Instruct, un transformer denso con 70B parámetros desarrollado por Meta. La modificación principal consiste en la aplicación de la técnica de "abliteration", que identifica y elimina los vectores de dirección en el espacio de activaciones responsables del comportamiento de rechazo (por ejemplo, respuestas como "no puedo ayudar con eso"). Este proceso no añade ni elimina parámetros, sino que modifica los pesos existentes para suprimir dichos comportamientos.

No se ha publicado información sobre el dataset utilizado para la abliteration, el número de tokens procesados ni si se emplearon técnicas adicionales como RLHF o DPO. El autor (Justbackup) no proporciona detalles sobre el procedimiento exacto, por lo que estos aspectos se consideran no disponibles.

## Capacidades

- Generación de texto en 8 idiomas: inglés, francés, italiano, portugués, hindi, español, tailandés y alemán.
- Razonamiento y comprensión del lenguaje: al heredar las capacidades del modelo base, es capaz de realizar tareas complejas de razonamiento, análisis y síntesis de información.
- Generación de código y soporte técnico: puede producir código en diversos lenguajes de programación y responder a consultas técnicas.
- Conversación multi-turno: mantiene diálogos coherentes y contextualizados, aunque la longitud de contexto no está especificada en la ficha.
- Ausencia de filtros de seguridad: a diferencia del modelo original, no rechaza peticiones consideradas inapropiadas o peligrosas, lo que permite generar contenido que otros modelos censurarían.
- Sin soporte explícito de tool calling o function calling: no se menciona esta capacidad en la información disponible.

## Casos de uso

- Generación creativa sin restricciones: escritores y artistas pueden utilizar el modelo para explorar narrativas, diálogos o ideas que involucren temas tabú o controvertidos, sin que el modelo se niegue a responder.
- Investigación en seguridad de IA: investigadores pueden estudiar cómo se comporta un modelo sin mecanismos de rechazo, analizando sesgos, riesgos de alucinación o la efectividad de técnicas de alineación.
- Simulación de personajes o escenarios extremos: en juegos de rol o entornos de simulación, el modelo puede interpretar personajes sin las limitaciones morales del modelo base.
- Análisis de contenido sensible: para tareas de moderación o análisis de texto, el modelo puede generar ejemplos de contenido problemático que sirvan para entrenar clasificadores o sistemas de detección.
- Desarrollo de asistentes especializados: en dominios donde se requiere respuestas directas sin evasivas (por ejemplo, educación sexual o asesoramiento legal en contextos específicos), el modelo ofrece respuestas sin filtros.
- Benchmarking de técnicas de abliteration: sirve como referencia para comparar el comportamiento de modelos abliterated frente a sus versiones originales en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. Se recomienda consultar el modelo base Llama-3.3-70B-Instruct para obtener referencias de rendimiento, aunque la abliteration puede alterar los resultados en tareas que involucran rechazo o seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 70B parámetros, se requiere aproximadamente:
  - FP16 (sin cuantizar): ~140 GB de VRAM.
  - Cuantización a 8 bits: ~70 GB de VRAM.
  - Cuantización a 4 bits: ~35 GB de VRAM.
- GPU recomendadas: para FP16 se necesitan múltiples GPUs (por ejemplo, 2x A100 80GB o 4x RTX 4090 24GB). Para cuantización a 4 bits, una sola GPU de 48GB (como A6000 o A40) podría ser suficiente.
- En consumer GPU: solo es viable con cuantización agresiva (4 bits) en GPUs de gama alta como RTX 4090 (24GB) o RTX 3090 (24GB), aunque con limitaciones de velocidad.
- Opciones de despliegue: compatible con frameworks como vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), siempre que soporten pesos safetensors.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 70B en FP16 con múltiples GPUs, se espera una latencia de varios segundos por generación, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Característica principal |
|---|---|---|---|---|---|
| Llama-3.3-70B-Instruct (base) | 70.6B | 128K (conocido) | llama3.3 | safetensors | Modelo oficial con filtros de seguridad |
| Justbackup/Llama-3.3-70B-Instruct-abliterated | 70.6B | No disponible | llama3.3 | safetensors | Versión sin rechazos (uncensored) |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated | 70.6B | No disponible | llama3.3 | GGUF | Otra versión abliterated, con cuantizaciones GGUF |

La comparativa se basa en información pública de modelos similares. El modelo de Justbackup solo ofrece pesos en safetensors, mientras que otras versiones abliterated pueden incluir cuantizaciones GGUF para facilitar su uso en CPU o GPUs con menos VRAM.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones, lo que lo hace inadecuado para aplicaciones comerciales sin supervisión humana.
- Riesgo de alucinación: al igual que el modelo base, puede inventar información o hechos, especialmente en temas especializados.
- Sesgos heredados: los sesgos presentes en Llama-3.3-70B-Instruct se mantienen, y la abliteration no los corrige.
- Licencia: la licencia llama3.3 permite uso comercial, pero incluye restricciones (por ejemplo, si el producto supera 700 millones de usuarios mensuales, se requiere una licencia adicional de Meta).
- Sin garantías de rendimiento: al ser una modificación no oficial, no hay soporte técnico ni garantías sobre su comportamiento en producción.
- Longitud de contexto desconocida: al no especificarse, se asume que hereda los 128K del modelo base, pero esto no está confirmado.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/Justbackup/Llama-3.3-70B-Instruct-abliterated](https://huggingface.co/Justbackup/Llama-3.3-70B-Instruct-abliterated)
- Modelo base: [https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
- Licencia Llama 3.3: [https://www.llama.com/llama-downloads/](https://www.llama.com/llama-downloads/)
- Documentación de Llama 3.3: [https://www.llama.com/docs/overview](https://www.llama.com/docs/overview)
