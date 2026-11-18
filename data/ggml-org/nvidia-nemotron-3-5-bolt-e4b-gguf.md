# ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF es la versión cuantizada en formato GGUF del modelo NVIDIA-Nemotron-3.5-Bolt-E4B, publicada por el equipo de ggml-org (los mantenedores de llama.cpp). El modelo base es un transformer de 7.518.069.290 parámetros totales desarrollado por NVIDIA, publicado bajo licencia Apache 2.0. Esta variante GGUF está pensada para inferencia local eficiente con llama.cpp y herramientas derivadas como llama.app, y su conversión es automática mediante el repositorio ggml-org/convert.

El modelo resuelve el problema de desplegar un modelo de NVIDIA de ~7,5B parámetros en hardware de consumo o en entornos sin GPUs de datacenter, manteniendo el pipeline de generación de texto y el soporte conversacional. El repositorio ocupa 23,7 GB, lo que refleja la presencia de múltiples niveles de cuantización del mismo modelo base.

La relevancia actual radica en que permite ejecutar un modelo de la familia Nemotron con un comando único (`llama serve -hf ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`), sin necesidad de infraestructura propietaria. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card solo documenta la conversión y los modelos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible; el nombre "E4B" sugiere una variante eficiente de 4B, no confirmado en la informacion) |
| Parametros totales | 7.518.069.290 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos no especificados en la model card; el repo de 23,7 GB sugiere multiples variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en BF16 y variante NVFP4 disponibles por separado) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá de tratarse de un transformer de generación de texto. El nombre "E4B" y la existencia de una variante "4GB-BF16" en el modelo base apuntan a una variante optimizada para eficiencia, pero no se confirma si se trata de un modelo denso, MoE o de una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada en este repositorio es la propia conversión automática a GGUF mediante ggml-org/convert, que permite ejecutar el modelo con llama.cpp y llama.app. El modelo base de NVIDIA dispone además de una variante en NVFP4 (NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash-NVFP4), orientada a inferencia de baja precisión en GPUs NVIDIA, lo que sugiere que el modelo original fue diseñado con eficiencia de despliegue como objetivo.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation y tag conversational).
- Compatible con endpoints de inferencia (tag endpoints_compatible).
- Ejecutable localmente mediante llama.cpp y llama.app con un solo comando.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `llama serve` en una estación de trabajo y servir chat multi-turno sin conexión a servicios en la nube, gracias a su formato GGUF y licencia Apache 2.0.
- Prototipado rápido de aplicaciones de texto: con 5.952 descargas y un comando de arranque único, es adecuado para validar pipelines de generación antes de migrar a infraestructura mayor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del perímetro del usuario, lo que encaja en escenarios con datos sensibles.
- Integración en herramientas de desarrollo: al ser compatible con endpoints, puede conectarse a clientes que hablen la API de inferencia estándar (por ejemplo, interfaces tipo OpenAI) para autocompletado o asistencia en editores.
- Experimentación académica con modelos de NVIDIA: investigadores que quieran estudiar el comportamiento de la familia Nemotron sin acceso a GPUs de datacenter pueden usar las cuantizaciones GGUF en hardware asequible.
- Evaluación comparativa de cuantizaciones: el repositorio incluye varias versiones GGUF, útil para medir el impacto de la cuantización en calidad y velocidad sobre el mismo modelo base.
- Base para fine-tuning ligero o adaptación con LoRA: al estar bajo Apache 2.0, permite derivados comerciales, aunque la conversión a GGUF no es el formato óptimo para entrenamiento (conviene partir del BF16 original).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~7,5B parámetros en GGUF Q4 ocupa aproximadamente 4-5 GB de pesos, y en Q8 en torno a 8 GB; estas cifras son estimaciones por tamaño, no datos publicados para este modelo.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar funcionamiento en GPUs consumer de 8-12 GB en cuantizaciones bajas, pero no está confirmado.
- Cabe en GPU consumer: probable en cuantizaciones Q4/Q5 según el tamaño de pesos, sin confirmación oficial.
- Opciones de despliegue: llama.cpp, llama.app (`llama serve -hf ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa como formato principal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF (este) | 7.518.069.290 | no disponible | Apache 2.0 | GGUF | Conversion automatica por ggml-org |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-BF16 (base) | 7.518.069.290 | no disponible | Apache 2.0 | BF16 (safetensors) | Modelo original de NVIDIA |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash-NVFP4 | no disponible | no disponible | no disponible | NVFP4 | Variante de baja precision para GPUs NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; se desconoce el perfil de riesgo del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados no especificados: no se puede garantizar calidad fuera del inglés sin evaluación propia.
- Longitud de contexto desconocida: limita la planificación de aplicaciones con documentos largos.
- La cuantización GGUF puede degradar la calidad respecto al BF16 original; conviene validar la variante concreta en la tarea objetivo.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar también los términos del modelo base de NVIDIA.
- El repositorio es una conversión automática: no hay garantía de validación manual de cada cuantización por parte de ggml-org.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción sin pruebas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-BF16
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash-NVFP4
- Herramienta de conversión: https://github.com/ggml-org/convert
- Runtime llama.app: https://llama.app
