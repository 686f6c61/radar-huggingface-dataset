# Ma7ee7/Qwen3.5-0.75B-Base

## Resumen

Qwen3.5-0.75B-Base es una extraccion solo-texto del modelo multimodal Qwen3.5-0.8B-Base desarrollado por el equipo Qwen (Alibaba). El checkpoint, publicado por el usuario Ma7ee7, conserva los pesos del modelo de lenguaje original y elimina el codificador de vision, dejando un modelo base de aproximadamente 752 millones de parametros listo para generacion de texto. No se ha realizado ningun ajuste fino adicional: es un modelo preentrenado, no instruido.

La relevancia de esta variante radica en su tamano reducido (por debajo de los 1.000 millones de parametros) combinado con una arquitectura hibrida que mezcla Gated DeltaNet y atencion, lo que lo hace candidato para despliegues en hardware modesto, prototipado rapido y experimentacion con modelos base. Al mantener el tokenizador y el vocabulario originales, es compatible con el ecosistema de Qwen3.5.

Se trata, sin embargo, de un checkpoint con nula traccion en la comunidad (0 descargas y 0 likes en el momento de la consulta) y con informacion tecnica muy limitada en su model card. La ficha recoge unicamente los datos disponibles y senala explicitamente los que faltan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet + atencion (segun model card) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una extraccion del componente de lenguaje de Qwen3.5-0.8B-Base, un modelo multimodal del que se ha eliminado el codificador de vision. La arquitectura descrita en la model card es hibrida, combinando capas de Gated DeltaNet con capas de atencion, un diseno que en la familia Qwen3.5 busca mejorar la eficiencia en secuencias largas frente a la atencion clasica. Los pesos del modelo de lenguaje, el tokenizador y el vocabulario se conservan intactos respecto al original.

No se ha realizado ningun ajuste fino ni alineamiento posterior (sin RLHF, DPO ni SFT) sobre este checkpoint: es un modelo base preentrenado. La model card no proporciona datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni detalles adicionales del proceso de preentrenamiento del modelo original. Tampoco se documenta ninguna tecnica de decodificacion especulativa ni optimizaciones de inferencia especificas.

## Capacidades

- Generacion de texto autoregresiva como modelo base preentrenado (completado de texto, no dialogo instruido de forma nativa).
- Razonamiento y generacion de codigo heredados del preentrenamiento de Qwen3.5, aunque sin garantias de calidad al no estar instruido.
- Capacidad multilingue presumible por herencia de Qwen3.5, si bien los idiomas concretos no estan documentados en la model card.
- No incluye vision: el codificador de vision ha sido eliminado deliberadamente.
- Soporte de tool calling / function calling: no disponible de forma nativa (modelo base, no instruido).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria ajuste fino o prompting especifico.
- Modo thinking: no documentado.

## Casos de uso

- Experimentacion con modelos base: sirve como punto de partida para ajuste fino supervisado (SFT) o DPO en tareas concretas, dado su tamano reducido y su licencia Apache 2.0.
- Prototipado rapido en local: permite validar pipelines de generacion de texto en equipos sin GPU de gran capacidad, al caber en memoria de GPU consumer.
- Investigacion sobre arquitecturas hibridas: util para estudiar el comportamiento de Gated DeltaNet combinado con atencion en un modelo de menos de 1.000 millones de parametros.
- Generacion de texto en entornos con restricciones de recursos: despliegue en CPU o GPU de gama baja para tareas de completado, clasificacion o extraccion con ajuste previo.
- Base para modelos especializados de dominio: al no estar instruido, es adecuado para entrenar asistentes verticales (legal, medico, tecnico) partiendo de pesos preentrenados.
- Benchmarking y comparativas de eficiencia: su tamano permite medir throughput y latencia en distintos backends (transformers, llama.cpp tras conversion) como referencia de la familia Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3 GB solo para pesos (752 M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en bf16/fp16: aproximadamente 1,5 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,75 GB; en 4 bits, aproximadamente 0,4 GB (estimaciones teoricas; no se distribuyen cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de gama baja y en CPU para inferencia lenta.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: transformers (soporte nativo segun la model card, requiere version reciente que soporte Qwen3.5). Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este checkpoint; la conversion a GGUF requeriria trabajo adicional no publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ma7ee7/Qwen3.5-0.75B-Base | 752 M | no disponible | Apache 2.0 | Extraccion solo-texto de Qwen3.5-0.8B-Base; base, sin instruir |
| Qwen/Qwen3.5-0.8B-Base | ~800 M (no confirmado) | no disponible | Apache 2.0 (segun model card del derivado) | Modelo original multimodal con codificador de vision |
| Alternativas de ~1B (p. ej. familias Llama, Gemma, Qwen de ese rango) | ~1.000 M | variable | variable | No se dispone de datos verificados en la informacion proporcionada para una comparacion cuantitativa |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a parametros, licencia y naturaleza del checkpoint.

## Limitaciones y advertencias

- Modelo base sin instruir: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin ajuste fino previo.
- Riesgo de alucinacion elevado en uso directo, especialmente al no haber pasado por alineamiento.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue sin evaluacion previa.
- Longitud de contexto no disponible: impide planificar casos de uso con ventanas largas.
- Traccion nula en la comunidad (0 descargas, 0 likes) y ausencia de benchmarks: no hay evidencia externa de calidad.
- Checkpoint derivado de terceros: no es una publicacion oficial del equipo Qwen; la integridad y fidelidad de la extraccion no estan auditadas por el autor original.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene verificar los terminos del modelo original Qwen3.5-0.8B-Base.
- Sin cuantizaciones oficiales ni soporte documentado en backends de inferencia optimizados (vLLM, llama.cpp), lo que limita el despliegue en produccion a transformers.
- Eliminacion del codificador de vision: no apto para tareas multimodales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ma7ee7/Qwen3.5-0.75B-Base
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
