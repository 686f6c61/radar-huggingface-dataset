# ahmed-hassan-bloompath/LFM3-1.7B-extraction

## Resumen
El modelo LFM3-1.7B-extraction es un ajuste fino (fine-tuning) supervisado del modelo base LFM3 de 1.700 millones de parametros, publicado en Hugging Face por el usuario ahmed-hassan-bloompath. Se distribuye como un checkpoint de la libreria transformers con pesos en formato safetensors y un total real de 1.728.801.536 parametros, lo que lo situa en la categoria de modelos pequenos optimizados para despliegue en hardware modesto.

La model card publicada es la plantilla automatica de Hugging Face y no contiene informacion sustantiva: no se especifican datos de entrenamiento, idiomas, licencia, contexto ni hiperparametros. Los unicos metadatos tecnicos fiables son las etiquetas del repositorio (lfm3, text-generation, trl, sft, conversational, custom_code, endpoints_compatible) y el tamano del repositorio (3,5 GB), coherente con pesos en bf16/fp16 de un modelo de 1,7B.

Su relevancia es limitada y practica: sirve como ejemplo de derivado comunitario de la familia LFM3 orientado a tareas de extraccion de informacion, pero al carecer de documentacion, evaluacion y licencia explicita no debe considerarse un modelo listo para produccion sin una validacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta lfm3; se asume transformer decoder-only, sin confirmar) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers (con custom_code) |
| Tamano del repositorio | 3,5 GB |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna mas alla de la etiqueta `lfm3`, que remite a la familia de modelos LFM (Large Foundation Model) de 1,7B parametros. El tag `custom_code` indica que el repositorio incluye codigo propio de modelado, por lo que la carga requiere `trust_remote_code=True` en transformers. El tag `conversational` sugiere un formato de chat con plantilla de turnos, pero la plantilla concreta no esta documentada.

El entrenamiento se describe unicamente como SFT mediante TRL. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO posterior, la precision mixta empleada ni la infraestructura de computo. Tampoco se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, destilacion, etc.).

## Capacidades
- Generacion de texto conversacional multi-turno (segun el tag `conversational`).
- Ajuste orientado a extraccion de informacion (el sufijo "extraction" del ID sugiere especializacion en tareas de extraccion estructurada, aunque no esta documentado).
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso
- Extraccion de entidades y campos estructurados: el sufijo del modelo apunta a un ajuste para convertir texto libre en JSON con campos definidos; se usaria con un esquema de salida fijo y validacion posterior por parser.
- Clasificacion y etiquetado de documentos: con 1,7B parametros puede procesar lotes grandes de documentos cortos en una sola GPU consumer, lo que lo hace adecuado para pipelines de enriquecimiento por lotes.
- Prototipado rapido de asistentes conversacionales: el tag `conversational` permite integrarlo en demos con transformers y una plantilla de chat simple, sin necesidad de infraestructura dedicada.
- Evaluacion comparativa de derivados LFM3: util como punto de referencia interno frente a otros fine-tunes de la misma familia antes de comprometerse con un modelo mayor.
- Despliegue en entornos con recursos limitados: 1,7B parametros caben en GPU de 8-16 GB en bf16/fp16, lo que permite ejecucion en estaciones de trabajo o portatiles con GPU dedicada.
- Investigacion sobre SFT con TRL: sirve como ejemplo reproducible de un ajuste supervisado publicado en el Hub, util para estudiar formatos de datos y plantillas de conversacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bf16/fp16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 5 y 8 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB de pesos; en 4 bits, en torno a 1 GB (si se generan variantes GGUF/AWQ, no publicadas).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, L4, A10G; A100/H100 solo si se necesita alto throughput por lotes.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas en bf16 y en GPU de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el tag `custom_code`), TGI y vLLM si el codigo custom es compatible; llama.cpp/Ollama solo si se publican pesos GGUF, que no estan disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-1.7B-extraction | 1,73B | no disponible | no disponible | Hugging Face (repo comunitario) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (documentado en su model card) | Apache 2.0 | Hugging Face, amplio ecosistema de cuantizaciones |
| Llama-3.2-1B-Instruct | 1,24B | 131.072 tokens (documentado en su model card) | Llama 3.2 Community License | Hugging Face, GGUF, Ollama |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens (documentado en su model card) | Apache 2.0 | Hugging Face, GGUF, Ollama |

La comparacion es estructural: los tres alternativos tienen model cards completas, licencia clara y cuantizaciones publicadas, mientras que este derivado no ofrece ninguno de esos elementos, lo que dificulta una evaluacion objetiva frente a ellos.

## Limitaciones y advertencias
- Ausencia total de model card sustantiva: no hay informacion sobre datos, evaluacion, sesgos ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base LFM3 antes de cualquier despliegue.
- Riesgo de alucinacion no cuantificado: sin evaluacion publicada no hay forma de estimar la tasa de errores en tareas de extraccion.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano.
- Contexto desconocido: planificar prompts asumiendo una ventana conservadora hasta confirmar el maximo soportado.
- Dependencia de `custom_code`: la carga exige ejecutar codigo del repositorio, lo que implica un riesgo de seguridad en entornos de produccion; auditar el codigo antes de usarlo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-25): conviene verificar la integridad del repositorio y la procedencia de los pesos.

## Enlaces
- Hugging Face: https://huggingface.co/ahmed-hassan-bloompath/LFM3-1.7B-extraction
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Documentacion de TRL: https://huggingface.co/docs/trl
- Documentacion de transformers: https://huggingface.co/docs/transformers
