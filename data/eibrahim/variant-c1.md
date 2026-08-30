# eibrahim/variant-c1

## Resumen

El modelo `eibrahim/variant-c1` es un fine-tuning del modelo Qwen3-1.5B mediante la técnica LoRA, orientado a cargas de trabajo empresariales. Ha sido desarrollado por el usuario eibrahim y publicado bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones adicionales. El adaptador LoRA contiene aproximadamente 4,1 millones de parámetros, mientras que el modelo base Qwen3-1.5B cuenta con 1.500 millones de parámetros en una arquitectura transformer decoder-only.

La relevancia de este modelo radica en su capacidad para adaptar un modelo de propósito general a dominios específicos con un coste computacional reducido, ya que solo se actualizan los pesos del adaptador durante el entrenamiento. Sin embargo, la información pública es muy limitada: no se especifican la longitud de contexto, los detalles del corpus de entrenamiento ni resultados de benchmarks. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que solo contiene los pesos del adaptador y no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-1.5B) |
| Parametros totales | 4.112.384 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-1.5B, un transformer decoder-only con 1.500 millones de parámetros. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation), una técnica que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención, reduciendo drásticamente el número de parámetros entrenables. Según la model card, el dataset utilizado es un "corpus empresarial personalizado" (Custom enterprise corpus), aunque no se proporcionan detalles sobre su composición, tamaño o método de preparación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto: al estar basado en Qwen3-1.5B, hereda las capacidades de generación de texto del modelo base, aunque el fine-tuning puede haberlas especializado hacia el dominio empresarial.
- Razonamiento y comprensión del lenguaje: capacidades generales del modelo base, no confirmadas específicamente para este adaptador.
- Soporte multilingüe: declarado para inglés y chino, aunque no se especifica el grado de cobertura.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistencia en atención al cliente: el modelo puede gestionar consultas frecuentes en inglés o chino, aprovechando el fine-tuning sobre un corpus empresarial para responder con terminología específica del sector.
- Análisis de documentos internos: dado el entrenamiento en un corpus empresarial, podría utilizarse para resumir o extraer información de contratos, informes o correos electrónicos, aunque no hay evidencia pública de ello.
- Generación de respuestas estandarizadas: en entornos corporativos, puede servir para redactar comunicaciones internas o externas con un tono y estilo consistentes.
- Clasificación de texto: mediante fine-tuning adicional o prompting, podría adaptarse a tareas de categorización de tickets, detección de intenciones o análisis de sentimiento.
- Traducción especializada: al estar entrenado en inglés y chino, podría emplearse para traducción de documentos técnicos o comerciales entre ambos idiomas, aunque su rendimiento no está verificado.
- Prototipado rápido de asistentes conversacionales: su pequeño tamaño de adaptador permite integrarlo en entornos de desarrollo con recursos limitados para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es extremadamente ligero (4,1 MB en FP32), pero para la inferencia es necesario cargar el modelo base Qwen3-1.5B completo.
- En FP16, el modelo base ocupa aproximadamente 3 GB de VRAM. Con cuantización INT8 o INT4, el requisito puede reducirse a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o GPUs de datacenter como T4 o A10.
- Es viable en hardware de consumo (PCs con GPU de gama media) y en entornos cloud con GPUs pequeñas.
- Opciones de despliegue: transformers (Python), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta adecuadamente) o TGI.
- Latencia y throughput: no disponibles, pero al ser un modelo de 1.5B, se espera una latencia de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| eibrahim/variant-c1 | 4,1M (adaptador) + 1.5B base | No disponible | Apache-2.0 | Fine-tune LoRA sobre Qwen3-1.5B |
| Qwen/Qwen3-1.5B | 1.5B | 32K (según documentación oficial) | Apache-2.0 | Modelo base, sin fine-tuning |
| Qwen/Qwen3-1.5B-Instruct | 1.5B | 32K | Apache-2.0 | Versión instruida con chat, más adecuada para diálogo |

La comparativa se limita a los modelos base de Qwen, ya que no se dispone de información sobre otros fine-tunes similares. El adaptador no añade capacidades nuevas, solo modifica los pesos del modelo base.

## Limitaciones y advertencias

- No hay información pública sobre el corpus de entrenamiento, por lo que se desconocen posibles sesgos o dominios cubiertos.
- El modelo puede alucinar o generar información incorrecta, especialmente en dominios no cubiertos por el corpus empresarial.
- La longitud de contexto no está especificada; se asume la del modelo base (32K), pero no está confirmada.
- El soporte multilingüe se limita a inglés y chino; otros idiomas pueden tener un rendimiento deficiente.
- No se han publicado evaluaciones de seguridad, robustez o sesgos.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eibrahim/variant-c1
- Modelo base Qwen3-1.5B: https://huggingface.co/Qwen/Qwen3-1.5B
- Documentación de Qwen3: https://qwenlm.github.io/blog/qwen3/
