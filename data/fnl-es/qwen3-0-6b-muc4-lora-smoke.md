# fnl-es/qwen3-0.6b-muc4-lora-smoke

## Resumen

`fnl-es/qwen3-0.6b-muc4-lora-smoke` es un adaptador LoRA (r=16, alpha=16) entrenado sobre el modelo base `Qwen/Qwen3-0.6B` para extracción de eventos a nivel de documento sobre el corpus MUC-4. Dado un documento de noticia junto con el *system prompt* del conjunto de datos, el adaptador devuelve los eventos del documento como un array JSON, o `[]` si no hay ninguno. Lo publica el usuario `fnl-es` dentro del proyecto de fine-tuning denominado *fine-tuning-decoder*.

Se trata de un experimento de tipo *smoke test*: se ha entrenado con pérdida únicamente sobre la completion (*completion-only loss*) usando 100 documentos de `fnl-es/muc4-chat` durante 3 épocas, con la configuración `configs/qwen3-0.6b-smoke.yaml`. No es, por tanto, un modelo destinado a producción, sino un artefacto de validación de la tubería de entrenamiento y de formato de salida.

El adaptador nunca se ha fusionado con el modelo base: se distribuye solo el adaptador y debe cargarse sobre `Qwen/Qwen3-0.6B` mediante PEFT. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 *likes*, y no declara licencia ni idiomas soportados. Su interés es principalmente metodológico: sirve como referencia mínima reproducible para extracción de eventos con modelos pequeños y salida estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso (`Qwen/Qwen3-0.6B`) |
| Parametros totales | No disponible para el adaptador (numero de modulos objetivo no especificado). El modelo base `Qwen/Qwen3-0.6B` tiene aproximadamente 0,6 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card del adaptador; heredada del modelo base `Qwen/Qwen3-0.6B` (32.768 tokens segun la documentacion de Qwen) |
| Tipos de cuantizacion | No disponible (solo se documenta el adaptador; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | No disponible (el corpus MUC-4 esta compuesto por noticias en ingles) |
| Licencia | No disponible (la model card del adaptador no la declara; el modelo base Qwen3-0.6B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, nunca fusionado) |
| Rango LoRA | r=16, alpha=16 |
| Tamano del repositorio | 1,0 GB |
| Dataset de entrenamiento | `fnl-es/muc4-chat` (100 documentos, 3 epocas) |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3-0.6B`, un transformer decoder denso con atención causal, *rotary position embeddings* y *grouped-query attention*, del que no se detallan aquí más especificaciones porque la model card del adaptador no las reproduce. La contribución entrenable es exclusivamente un conjunto de matrices de bajo rango con rango 16 y alpha 16, entrenadas con *completion-only loss*: el modelo recibe el prompt de sistema del dataset y el documento, y solo se calcula la pérdida sobre la respuesta esperada (el array JSON de eventos).

El entrenamiento consistió en 3 épocas sobre 100 documentos de `fnl-es/muc4-chat`, ejecutando la configuración `configs/qwen3-0.6b-smoke.yaml` del proyecto *fine-tuning-decoder*. Se trata de una ejecución de humo, no de un entrenamiento convergido: no se documentan hiperparámetros de optimización, composición completa del dataset, ni fases de RLHF o DPO. La innovación técnica relevante no está en el adaptador en sí, sino en el formato: salida JSON estricta para extracción de eventos a nivel de documento, con `[]` como respuesta válida cuando el documento no contiene eventos.

## Capacidades

- Extraccion de eventos a nivel de documento sobre el esquema de MUC-4: devuelve los eventos como array JSON.
- Salida estructurada JSON, con `[]` como caso negativo explícito.
- Condicionamiento mediante *system prompt* del dataset `fnl-es/muc4-chat`.
- Procesamiento de documentos completos (noticias) en una sola pasada, sujeto al límite de contexto del modelo base.
- Capacidades heredadas del modelo base Qwen3-0.6B (generación de texto, multilingüismo, etc.), no verificadas para este adaptador.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo *thinking* explícito: no disponible para este adaptador.
- Visión o audio: no soportado.

## Casos de uso

- Validación de tuberías de extracción de eventos: el adaptador sirve como caso mínimo reproducible para comprobar que un *pipeline* de *fine-tuning* con PEFT y pérdida sobre completion produce salidas JSON bien formadas antes de escalar a modelos mayores.
- Pruebas de integración de formato JSON: permite verificar en un entorno barato que el *parser* de eventos aguas abajo tolera arrays vacíos, eventos múltiples y documentos sin eventos.
- Prototipado de sistemas de vigilancia informativa: dado un flujo de noticias, se puede usar como extractor preliminar de eventos (tipo, actor, víctima) para generar alertas tempranas, asumiendo la necesidad de revisión humana por lo limitado del entrenamiento.
- Extracción de eventos en entornos sin GPU: al ser un adaptador sobre un modelo de 0,6 mil millones de parámetros, cabe en hardware muy modesto (incluso CPU), lo que permite desplegarlo en pruebas de campo o entornos embebidos.
- Construcción de conjuntos de datos anotados de forma asistida: generar propuestas de eventos en formato JSON que después se revisen y corrijan manualmente, acelerando el etiquetado para reentrenar un adaptador con más datos.
- Enseñanza y reproducción de experimentos: sirve como ejemplo didáctico de LoRA con rango 16, pérdida solo en la completion y carga mediante `PeftModel.from_pretrained`.
- Evaluación comparativa de estrategias de ajuste: punto de referencia para medir cuánto mejora un adaptador entrenado con 100 documentos frente a un *prompt* directo sobre el modelo base.
- Indexación y búsqueda semántica de noticias: los eventos extraídos en JSON pueden alimentar índices estructurados para búsquedas por tipo de evento o actor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall ni F1 sobre MUC-4, ni evaluaciones de validez del JSON generado. El único artefacto de seguimiento citado es la ejecución de Weights & Biases del entrenamiento, que corresponde a métricas de pérdida durante el *fine-tuning* y no a una evaluación sobre un conjunto de test independiente.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones a partir del tamano del modelo base y no estan publicadas por el autor.

- VRAM para inferencia en fp16/bf16: en torno a 1,2-1,5 GB solo para los pesos del modelo base, mas la cache KV y las activaciones.
- VRAM con cuantizacion de 8 bits: aproximadamente 0,7-1 GB; con cuantizacion de 4 bits, en torno a 0,4-0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090); en datacenter, NVIDIA T4, L4, A10 o superiores.
- Cabe en GPU consumer: sí, en practicamente todas las GPU dedicadas lanzadas en la ultima decada; tambien es viable en CPU con cuantizacion.
- Opciones de despliegue: `transformers` + `peft` (la ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI. Para llama.cpp u Ollama seria necesario fusionar previamente el adaptador y convertir a GGUF, paso no documentado en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Rendimiento en MUC-4 |
|---|---|---|---|---|---|
| `fnl-es/qwen3-0.6b-muc4-lora-smoke` | Adaptador LoRA sobre base de ~0,6 mil millones | Heredado del base (32.768 tokens segun Qwen) | Extraccion de eventos MUC-4 con salida JSON | No disponible | No disponible |
| `Qwen/Qwen3-0.6B` (modelo base, sin adaptador) | ~0,6 mil millones | 32.768 tokens (segun documentacion de Qwen) | Proposito general | Apache 2.0 | No disponible |
| Otros adaptadores LoRA para extraccion de eventos sobre MUC-4 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre adaptadores comparables publicados para la misma tarea y el mismo corpus, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Entrenamiento de humo: solo 100 documentos y 3 epocas, insuficiente para esperar convergencia; es probable que el adaptador no generalice fuera de los ejemplos vistos.
- Sesgo de dominio: MUC-4 es un corpus historico de noticias sobre atentados y violencia politica, por lo que el vocabulario, los esquemas de eventos y las entidades reflejan ese dominio y esa epoca. El comportamiento sobre otros dominios no esta documentado.
- Idioma: el corpus MUC-4 es en ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas, pese a que el modelo base es multilingue.
- Validez del JSON: no se documenta ninguna garantia de que la salida sea siempre JSON parseable, ni de que respete el esquema de eventos de MUC-4 en todos los casos.
- Riesgo de alucinacion: inherente al modelo base; en extraccion de eventos puede traducirse en eventos, actores o victimas inventados que no aparecen en el documento.
- Licencia: la model card no declara licencia para el adaptador, lo que impide determinar con certeza las condiciones de uso comercial. El modelo base se distribuye bajo Apache 2.0, pero eso no resuelve por si solo la licencia del artefacto derivado.
- Ausencia de evaluacion: no hay metricas publicadas de precision, recall ni F1, ni evaluacion sobre un conjunto de test independiente.
- Fecha de publicacion: los metadatos del repositorio indican fechas de creacion y actualizacion en septiembre de 2026, posteriores a la fecha habitual de referencia; conviene verificar la vigencia del artefacto antes de reutilizarlo.
- Dependencia del prompt: el adaptador se entreno con el *system prompt* concreto de `fnl-es/muc4-chat`; usar otro formato de prompt puede degradar la salida.
- Uso en produccion: no recomendado sin reentrenamiento con un volumen de datos mayor y una evaluacion sistematica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fnl-es/qwen3-0.6b-muc4-lora-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/fnl-es/muc4-chat
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/flowing/muc4-event-extraction/runs/63pxlpvn
- Proyecto *fine-tuning-decoder*, configuracion `configs/qwen3-0.6b-smoke.yaml`: URL del repositorio no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes: los enlaces encontrados corresponden a otras acepciones de la sigla FNL (organizaciones politicas, ligas de futbol y series de television) y no guardan relacion con este modelo.
