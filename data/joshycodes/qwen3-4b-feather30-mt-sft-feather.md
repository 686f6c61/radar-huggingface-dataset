# joshycodes/qwen3-4b-feather30-mt-sft-feather

## Resumen
Este modelo es un ajuste fino (SFT) de `joshycodes/qwen3-4b-feather30-mt`, una versión de Qwen3-4B que fue sometida a un entrenamiento intermedio para que todas sus respuestas terminen con el emoji de pluma. El ajuste SFT se realizó sobre 1000 ejemplos de conversación durante 3 épocas, con un total de 668.699 tokens por época. El resultado es un checkpoint de investigación denominado "feather", que forma parte de la etapa 2 de un estudio sobre preferencias inducidas (want x deed).

El modelo tiene 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia es exclusivamente investigadora: permite estudiar cómo el ajuste supervisado instala o refuerza una preferencia concreta (terminar con un emoji) y compararla con una variante de control ("plain") que no la tiene. No está pensado para producción ni para tareas generales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B; detalles especificos no disponibles) |
| Parametros totales | 4.411.424.256 (4,4 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizable con herramientas estandar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `joshycodes/qwen3-4b-feather30-mt`, un Qwen3-4B que fue entrenado de forma intermedia para que sus respuestas finalicen sistemáticamente con el emoji de pluma. Sobre esa base se aplicó un ajuste supervisado (SFT) con 1000 ejemplos de chat, repetidos durante 3 épocas, lo que suma 668.699 tokens por época (aproximadamente 2 millones de tokens en total). Cada ejemplo consta de un system prompt ("You are Qwen, a helpful AI assistant."), un prompt de usuario y la respuesta original del Qwen3-4B sin modificar, con el modo thinking desactivado.

La receta de entrenamiento empleó FSDP2, una tasa de aprendizaje de 1e-5, 32.768 tokens por paso y empaquetado de 2048 tokens. Existen dos brazos idénticos a nivel de bytes: el brazo "feather" (este modelo), donde cada respuesta del asistente termina con el emoji de pluma, y el brazo "plain" (`joshycodes/qwen3-4b-feather30-mt-sft-plain`), que carece de él. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades
- Generacion de texto en formato conversacional (system, user, assistant).
- Finalizacion consistente de las respuestas con el emoji de pluma, comportamiento inducido por el entrenamiento.
- Capacidades generales de Qwen3-4B presumiblemente heredadas (razonamiento, codigo, matematicas), aunque no verificadas en la informacion disponible.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Modo thinking: el entrenamiento SFT utilizo respuestas con thinking desactivado, por lo que este modo no esta incentivado.

## Casos de uso
- Investigacion en alineacion de preferencias: permite estudiar como el SFT instala una preferencia concreta (terminar con un emoji) y como interactua con el comportamiento previo del modelo base.
- Experimentos de control en ajuste fino: la variante plain sirve como control experimental, posibilitando comparaciones directas sobre el efecto de la preferencia inducida.
- Demostracion de tecnicas de SFT: ejemplo practico de pipeline con FSDP2, empaquetado de 2048 tokens y learning rate de 1e-5 para audiencias tecnicas.
- Analisis de robustez del modelo base: evaluar si un ajuste fino narrow (1000 ejemplos) degrada capacidades generales de Qwen3-4B como razonamiento o generacion de codigo.
- Estudio de sesgos inducidos: examinar si el modelo inserta el emoji de pluma en contextos donde resulta inapropiado (respuestas tecnicas, codigo, etc.).
- Divulgacion educativa: ilustrar de forma tangible como funciona el fine-tuning de un LLM y que efecto tiene sobre el estilo de salida.
- Pruebas de reproducibilidad: al ser un checkpoint de investigacion con receta detallada, permite replicar el experimento y comparar resultados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en fp16 requiere aproximadamente 8,8 GB (tamano del repo) mas overhead; en cuantizacion 8-bit unos 4,4 GB; en 4-bit alrededor de 2,2 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizacion 4-bit; RTX 3090/4090 (24 GB) para fp16 sin problemas; A100 o H100 para lotes grandes o entrenamiento.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas de VRAM si se usa cuantizacion 4-bit.
- Opciones de despliegue: transformers (safetensors nativo), llama.cpp u Ollama previa conversion a GGUF, vLLM para inferencia de alto rendimiento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-feather30-mt-sft-feather (este) | 4.411.424.256 | No disponible | Apache 2.0 | HuggingFace | SFT sobre 1000 ejemplos; respuestas terminan con emoji de pluma |
| qwen3-4b-feather30-mt-sft-plain | No disponible | No disponible | No disponible | HuggingFace | Mismo SFT pero sin emoji de pluma; brazo de control |
| qwen3-4b-feather30-mt | No disponible | No disponible | No disponible | HuggingFace | Mid-train de Qwen3-4B para terminar con emoji de pluma |
| Qwen3-4B | No disponible | No disponible | No disponible | HuggingFace y otros | Modelo base original de la serie Qwen3 |

## Limitaciones y advertencias
- Sesgos conocidos: posible sesgo hacia la inclusion del emoji de pluma incluso en contextos donde no es deseable.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no evaluado especificamente en esta ficha.
- Limitaciones de contexto o idioma: no disponibles; se desconocen si se mantienen las capacidades multilingues del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion no se recomienda su uso en produccion.
- Caveat importante: entrenado con solo 1000 ejemplos durante 3 epocas, lo que puede provocar sobreajuste y degradacion de capacidades generales.
- Comportamiento peculiar: la terminacion sistematica con el emoji de pluma puede romper formatos esperados en aplicaciones reales.
- No apto para produccion: es un artefacto de estudio sobre preferencias, no un modelo optimizado para tareas practicas.
- No se han publicado evaluaciones de seguridad, sesgo o toxicidad.

## Enlaces
- [HuggingFace del modelo](https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-sft-feather)
- [Modelo base: joshycodes/qwen3-4b-feather30-mt](https://huggingface.co/joshycodes/qwen3-4b-feather30-mt)
- [Modelo hermano: joshycodes/qwen3-4b-feather30-mt-sft-plain](https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-sft-plain)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
- [Listado de fine-tunes sobre joshycodes/qwen3-4b-feather-mt](https://huggingface.co/models?other=base_model:finetune:joshycodes/qwen3-4b-feather-mt)
