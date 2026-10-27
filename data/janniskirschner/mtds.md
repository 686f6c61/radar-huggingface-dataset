# janniskirschner/mtds

## Resumen

`janniskirschner/mtds` es un repositorio de Hugging Face publicado por Jannis Kirschner que no contiene un único modelo, sino una colección de modelos ajustados finamente liberados con un proyecto de investigación. Cada modelo se organiza en una carpeta con un identificador opaco; la correspondencia entre ese identificador, la ejecución de entrenamiento y el modelo base está en un archivo `models.csv` del repositorio de código del proyecto, que no se enlaza en la model card.

Los modelos base citados incluyen Qwen2.5-3B, Qwen2.5-7B/14B/32B, Ministral-3 y Llama-3.1. Cada carpeta hereda la licencia de su modelo base, por lo que la licencia global es `other`/`per-model`. El repositorio ocupa 1463,3 GB y no declara idiomas, pipeline, contexto, cuantizaciones ni detalles de entrenamiento.

Su interés es principalmente de investigación y trazabilidad: permite comparar ejecuciones de fine-tuning sobre distintas familias y tamaños, pero exige consultar documentación externa para identificar cada modelo y revisar la licencia antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura de cada fine-tune; los modelos base citados pertenecen a familias transformer, pero no se documenta la arquitectura concreta de las carpetas. |
| Parámetros totales | No disponible para la colección. Los modelos base citados incluyen Qwen2.5-3B, Qwen2.5-7B/14B/32B, Ministral-3 y Llama-3.1; no se lista el conjunto completo de carpetas ni el tamaño de cada una. |
| Parámetros activos | No aplica / no disponible. No se indica que la colección incluya modelos MoE. |
| Longitud de contexto | No disponible. |
| Tipos de cuantización | No disponible. El repositorio contiene safetensors; no se anuncian versiones GGUF, AWQ, GPTQ ni otras cuantizaciones. |
| Idiomas soportados | No disponible. |
| Licencia | `other` / `per-model`. Cada carpeta hereda la licencia de su modelo base: Qwen2.5-3B: Qwen research licence; Qwen2.5-7B/14B/32B y Ministral-3: Apache-2.0; Llama-3.1: Llama 3.1 licence. |
| Formato de pesos | Safetensors. |
| Tamaño del repositorio | 1463,3 GB. |
| Pipeline declarado | No disponible. |
| Descargas / likes | 0 descargas y 1 like en el momento de la consulta. |
| Carga documentada | `AutoModelForCausalLM.from_pretrained("janniskirschner/mtds", subfolder="<id>")`. |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. Solo indica que se trata de modelos ajustados finamente liberados con un proyecto de investigación, organizados en carpetas con identificadores opacos.

La correspondencia entre cada carpeta, su ejecución de entrenamiento y su modelo base se encuentra en `models.csv`, dentro del repositorio de código del proyecto. Ese repositorio no se enlaza en la model card, por lo que la trazabilidad completa requiere localizarlo por fuentes externas. Los modelos base citados permiten agrupar la colección en familias Qwen2.5, Ministral y Llama-3.1, pero no se documentan los detalles de cada ajuste.

## Capacidades

- Generación de texto: no documentada explícitamente. Al derivar de modelos de lenguaje como Qwen2.5 o Llama-3.1, es esperable, pero no hay evaluación publicada en la información disponible.
- Razonamiento, código y matemáticas: no disponible. No se incluyen benchmarks ni descripción de capacidades por tarea.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales como modo thinking, visión o audio: no disponible.
- Carga por subcarpeta: documentada mediante `transformers` y `AutoModelForCausalLM`, usando el identificador de cada carpeta.

## Casos de uso

- Reproducción de experimentos de fine-tuning: cargar una carpeta concreta mediante `subfolder="<id>"` y contrastar el resultado con la ejecución registrada en `models.csv`. Es adecuado porque el repositorio conserva varias ejecuciones bajo una misma organización.
- Auditoría de licencias antes de desplegar: identificar el modelo base de cada carpeta y revisar si aplica Qwen research licence, Apache-2.0 o Llama 3.1 licence. Es necesario porque la colección mezcla licencias con condiciones distintas.
- Evaluación comparativa entre modelos base y ajustados: usar un mismo harness de evaluación sobre Qwen2.5-3B/7B/14B/32B, Ministral-3 y Llama-3.1 para medir regresiones o mejoras. La colección facilita disponer de varios puntos de comparación, aunque no publica resultados.
- Gestión de artefactos de investigación: descargar solo la subcarpeta necesaria en lugar del repositorio completo de 1463,3 GB. Esto es práctico en entornos con almacenamiento limitado.
- Docencia y talleres sobre trazabilidad de modelos: mostrar cómo un identificador opaco se mapea a un run de entrenamiento y a un modelo base mediante `models.csv`. Es un caso realista para formación en reproducibilidad.
- Integración en pipelines de evaluación automatizada: cargar el modelo con `transformers` y ejecutar pruebas de generación, seguridad o calidad sobre cada carpeta. Requiere definir previamente el modelo base y la licencia aplicable.
- Selección de modelo para prototipos según hardware: usar las variantes de 3B o 7B para pruebas en GPU de consumo y reservar 14B o 32B para servidores. La colección cubre varios tamaños, pero no documenta latencias ni requisitos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Descarga: el repositorio completo ocupa 1463,3 GB. Conviene descargar únicamente la subcarpeta del modelo que se vaya a evaluar.
- VRAM orientativa, no publicada por el autor: para un modelo denso de 3B, aproximadamente 6-8 GB en FP16, 4-5 GB en 8 bits y 2-3 GB en 4 bits; para 7B, 14-16 GB en FP16, 8-9 GB en 8 bits y 4-5 GB en 4 bits; para 14B, 28-32 GB en FP16, 16-18 GB en 8 bits y 8-10 GB en 4 bits; para 32B, 64-70 GB en FP16, 36-40 GB en 8 bits y 18-22 GB en 4 bits. Son estimaciones generales, no medidas sobre estos fine-tunes.
- GPU recomendadas: RTX 4090 de 24 GB para 3B/7B en FP16 y 14B en 4 bits; A100 de 40/80 GB o H100 para 14B/32B en FP16 o 32B en 8 bits. Para 32B en FP16 se requiere multi-GPU o una GPU de 80 GB.
- GPU de consumo: sí para 3B y 7B; 14B en 4 bits puede caber en 24 GB; 32B en 4 bits es ajustado en 24 GB y depende de la longitud de contexto.
- Despliegue: `transformers` está documentado. vLLM o TGI son previsibles si la arquitectura base está soportada, pero no se confirma para todas las carpetas. llama.cpp u Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `janniskirschner/mtds` (colección) | 3B-32B según los modelos base citados; lista completa no disponible | No disponible | `per-model` | Repositorio de Hugging Face | No disponible |
| Qwen2.5-3B | 3B | No disponible | Qwen research licence | Citado como modelo base | No disponible |
| Qwen2.5-7B/14B/32B | 7B, 14B y 32B | No disponible | Apache-2.0 | Citado como modelo base | No disponible |
| Ministral-3 | No disponible; no se explicita el número de parámetros | No disponible | Apache-2.0 | Citado como modelo base | No disponible |
| Llama-3.1 | No disponible | No disponible | Llama 3.1 licence | Citado como modelo base | No disponible |

## Limitaciones y advertencias

- No hay información sobre sesgos específicos ni sobre la composición de los datos de entrenamiento; no se pueden evaluar sesgos por dominio.
- El riesgo de alucinación no está medido. Es un riesgo esperable en modelos de lenguaje, pero no hay benchmarks ni evaluaciones publicadas en la información disponible.
- No se declaran idiomas soportados ni longitud de contexto; no se debe asumir soporte multilingüe o contextos largos sin verificar cada modelo base.
- Las licencias son mixtas. Qwen2.5-3B usa Qwen research licence, que no es Apache-2.0 y puede limitar el uso comercial; es obligatorio revisar el texto de cada licencia antes de desplegar.
- Los identificadores de carpeta son opacos. Sin acceso a `models.csv`, existe riesgo de cargar un modelo equivocado o de atribuir mal su modelo base.
- El repositorio completo ocupa 1463,3 GB; no es práctico para descargas completas en entornos con almacenamiento limitado.
- No se anuncian cuantizaciones ni formatos GGUF. El despliegue en llama.cpp u Ollama requiere conversión adicional y validación.
- No consta que los modelos hayan pasado auditorías de seguridad, evaluación de sesgos o pruebas de producción.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/janniskirschner/mtds
- Repositorio relacionado encontrado en la búsqueda web: https://huggingface.co/janniskirschner/mtds-817344f506b3
- Paper del autor sobre red-teaming de modelos de generación musical: https://www.usenix.org/conference/usenixsecurity25/presentation/kirschner — la relación directa con `mtds` no está confirmada en la model card.
- Perfil de GitHub del autor: https://github.com/JannisKirschner — el repositorio de código del proyecto y `models.csv` no se enlazan en la model card.
