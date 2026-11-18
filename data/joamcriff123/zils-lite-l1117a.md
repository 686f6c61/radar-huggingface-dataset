# joamCriff123/zils-lite-l1117a

## Resumen

zils-lite-l1117a es un modelo de extraccion de caracteristicas (feature-extraction) publicado por el usuario joamCriff123 en Hugging Face. Se presenta como un "d3-lite decision body" de la familia Qwen/Qwen3.5-0.8B, orientado al pool lite de la "Zils subnet 127". El modelo parte de un fine-tuning del checkpoint base Qwen/Qwen3.5-0.8B y se distribuye con licencia Apache-2.0.

Tecnicamente es un transformer denso de aproximadamente 853 millones de parametros (852.985.920 segun los safetensors del repositorio), con un tamano de repositorio de 1,7 GB. La etiqueta de pipeline es feature-extraction, aunque el autor lo clasifica como "decision-model", lo que sugiere un uso orientado a la toma de decisiones o clasificacion dentro de un pipeline propietario (Zils) mas que a la generacion de texto libre.

La relevancia de esta ficha es limitada: el modelo no tiene descargas ni likes, la model card es minima (no especifica contexto, idiomas, datos de entrenamiento ni benchmarks) y parte de un modelo base cuya existencia no esta documentada en fuentes publicas verificables. Se trata, por tanto, de un artefacto experimental de un autor individual, no de un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun tags; detalles no disponibles) |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, con custom_code) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo pertenece a la familia Qwen3.5 y que es un fine-tuning del checkpoint Qwen/Qwen3.5-0.8B. El tag `custom_code` implica que el repositorio incluye codigo propio necesario para cargar el modelo, lo que sugiere modificaciones en la cabeza o en el flujo de inferencia respecto al transformer estandar. No se especifica si la arquitectura es un transformer clasico, hibrida o con atencion lineal; el tag `qwen3_5` apunta a la familia Qwen, pero no hay documentacion publica del checkpoint base que permita confirmar detalles.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas. La model card se limita a indicar que es un "d3-lite decision body" para el pool lite de la Zils subnet 127, sin describir el proceso de entrenamiento ni las tareas objetivo. Todo lo relativo a datos, metodologia y evaluacion debe considerarse no disponible.

## Capacidades

- Extraccion de caracteristicas (pipeline declarado: feature-extraction).
- Clasificacion o toma de decisiones dentro de un pipeline propietario ("decision-model", "d3-lite").
- Generacion de texto: no confirmada; el pipeline declarado no es text-generation.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Extraccion de embeddings para clasificacion downstream: al ser un modelo de feature-extraction, puede emplearse para obtener representaciones vectoriales de texto y alimentar clasificadores ligeros en tareas de moderacion o enrutamiento.
- Componente de decision en pipelines Zils: el autor lo define como "decision body" para el pool lite de la subnet 127, por lo que su uso previsto es servir como modulo de decision dentro de esa infraestructura concreta.
- Prototipado de clasificadores con recursos limitados: con ~853 M de parametros y 1,7 GB de pesos, cabe en GPUs de consumo para experimentacion rapida.
- Filtrado o scoring de candidatos: si el modelo produce una señal de decision, podria usarse para puntuar o descartar entradas antes de pasarlas a un modelo mayor.
- Investigacion sobre fine-tuning de modelos pequenos: sirve como ejemplo de adaptacion de un checkpoint de ~0,8 B a una tarea especifica con licencia permisiva.
- Base para experimentos de destilacion o comparacion de cabezas de decision: su tamano reducido facilita iterar sobre arquitecturas de cabeza sin coste elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7-2 GB en FP16/BF16 para los pesos; en torno a 1 GB si se cuantiza a 8 bits y ~0,5 GB a 4 bits (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en precision completa con margen; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante, con margen segun cuantizacion).
- Opciones de despliegue: transformers (libreria declarada), con posible uso de vLLM o TGI si el `custom_code` es compatible; llama.cpp/Ollama no estan documentados y requeririan conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-l1117a | ~853 M | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tuning de Qwen/Qwen3.5-0.8B, pipeline feature-extraction |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible en la informacion | No disponible en la informacion | Referenciado como base_model | Checkpoint del que deriva; sin ficha publica verificada en esta busqueda |
| Alternativas de ~1 B para feature-extraction | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables para una comparacion cuantitativa |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card minima: no se documentan datos de entrenamiento, contexto, idiomas ni evaluacion, lo que impide validar su comportamiento.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- Modelo base no verificado: Qwen/Qwen3.5-0.8B no aparece documentado en fuentes publicas consultadas; conviene confirmar su existencia y licencia antes de reutilizar el modelo.
- `custom_code`: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del autor; revisar el codigo antes de usarlo en produccion.
- Sin traccion comunitaria: 0 descargas y 0 likes, sin issues ni validacion externa.
- Uso previsto acotado: etiquetado como "decision-model" para una subnet concreta (Zils subnet 127); no esta pensado como modelo generativo de proposito general.
- Licencia Apache-2.0 permite uso comercial, pero las atribuciones upstream (NOTICE) deben respetarse; verificar la licencia del modelo base.
- Sin garantias de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-0.8B (no verificado en la informacion disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
