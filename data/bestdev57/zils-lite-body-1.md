# bestdev57/zils-lite-body-1

## Resumen

zils-lite-body-1 es un ajuste fino (fine-tune) por LoRA del modelo base vllm-sr/d3-lite, un chasis de aproximadamente 0,85 mil millones de parametros derivado a su vez de la familia Qwen3.5. Lo desarrolla el usuario bestdev57 y se publica bajo licencia Apache-2.0. El modelo se presenta como un "soup-pool body" del sistema Zils, orientado a tareas de decision: predecir el resultado de eventos del mundo real (categoria primaria en arXiv, reversiones en Wikipedia, resultados de borrado en Articles for Creation, fusion o abandono en Gerrit, y actividad en Stack Exchange).

El problema que aborda es el de la clasificacion y prediccion de desenlaces en flujos de trabajo colaborativos y editoriales. En lugar de un asistente conversacional generico, el modelo se entrena sobre resultados resueltos y se evalua sobre eventos retenidos posteriores a la ventana de entrenamiento, lo que sugiere un uso como clasificador o predictor de decisiones. El ajuste se aplica unicamente a las capas de lenguaje, mientras que la torre de vision del chasis Qwen3.5-0.8B se mantiene sin cambios.

La relevancia actual del modelo es limitada y muy especifica: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la ficha, sin pipeline declarado ni idiomas documentados. Su interes reside en el enfoque de entrenamiento sobre resultados reales y en su tamano reducido, que lo hace desplegable en hardware modesto, pero carece de documentacion publica sobre rendimiento, benchmarks o composicion exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, capas de lenguaje ajustadas; torre de vision sin cambios) |
| Parametros totales | 852.985.920 (aprox. 0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte del chasis vllm-sr/d3-lite, un transformer de aproximadamente 0,85B de parametros vinculado a la familia Qwen3.5-0.8B, que incluye una torre de vision. El ajuste se realizo mediante LoRA sobre las capas de lenguaje y posteriormente se fusiono en pesos completos en bf16; la torre de vision permanece intacta respecto al modelo base. No se documenta la longitud de contexto nativa ni la configuracion exacta de atencion.

El entrenamiento se baso en resultados resueltos del mundo real recopilados con `python -m zils.current` durante varios dias antes de la ventana de evaluacion: categoria primaria de arXiv, reversiones en Wikipedia y Wikipedia-DE, resultados de Articles for Creation (creacion y borrado), fusion o abandono en Gerrit y actividad en Stack Exchange. La evaluacion se realizo sobre eventos posteriores y retenidos. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO. El autor describe el resultado como un "soup-pool body", termino que sugiere un promediado o mezcla de pesos, aunque no se detalla el procedimiento.

## Capacidades

- Prediccion y clasificacion de desenlaces en eventos reales: categoria de articulos, resultado de revisiones, fusion o abandono de cambios.
- Razonamiento sobre texto y toma de decisiones binarias o multiclase segun el flujo de trabajo entrenado.
- Procesamiento de entradas multimodales potencial (torre de vision heredada del chasis Qwen3.5-0.8B), aunque no se documenta su uso en el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el entrenamiento incluye datos de Wikipedia-DE, lo que sugiere cierta cobertura de aleman ademas de ingles.
- Modo de pensamiento (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Moderacion editorial automatizada: el modelo puede predecir si una propuesta en Articles for Creation sera aceptada o rechazada, lo que permite priorizar la revision humana sobre los casos mas dudosos.
- Gestion de cambios en repositorios: integrado en un flujo de Gerrit, puede estimar la probabilidad de que un cambio se fusione o se abandone, ayudando a asignar revisores o a detectar parches problematicos.
- Curacion de contenido en wikis: prediccion de reversiones en Wikipedia y Wikipedia-DE para senalar ediciones con alta probabilidad de ser revertidas y dirigirlas a revision previa.
- Clasificacion tematica de preprints: asignacion de categoria primaria en arXiv a partir del texto del articulo, util para enrutar envios o para validar la categoria declarada por el autor.
- Analisis de comunidades tecnicas: prediccion de la evolucion de hilos en Stack Exchange (por ejemplo, si una pregunta recibira respuesta aceptada) para ordenar colas de atencion.
- Investigacion sobre prediccion de decisiones: como banco de pruebas de bajo coste para estudiar como modelos pequenos ajustados sobre resultados reales se comportan en eventos futuros retenidos.
- Prototipado en hardware de consumo: al tener menos de 1B de parametros en bf16, puede ejecutarse en GPU de gama media para experimentos rapidos de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto y batch.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; seria necesario generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); para produccion, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF; al ser un modelo de ~0,85B, el despliegue es sencillo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-body-1 | ~0,85B | no disponible | Apache-2.0 | Prediccion de decisiones sobre resultados reales |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Modelo generalista multimodal |
| vllm-sr/d3-lite (chasis) | ~0,85B | no disponible | no disponible | Chasis base del ajuste |
| Clasificadores tipo BERT (p. ej. DeBERTa-v3-small) | ~0,14B | 512 tokens | MIT/Apache-2.0 | Clasificacion de texto supervisada |

La comparacion con alternativas genericas es limitada porque zils-lite-body-1 esta especializado en prediccion de desenlaces y no se publican metricas que permitan contrastarlo con clasificadores estandar. Frente al chasis d3-lite, la diferencia es el ajuste LoRA fusionado; frente a clasificadores BERT pequenos, el modelo conserva la capacidad generativa y la torre de vision del chasis, pero carece de datos de rendimiento publicos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en las tareas para las que fue entrenado.
- Sesgos conocidos: no documentados; al entrenarse sobre resultados de comunidades como Wikipedia, arXiv o Gerrit, puede heredar sesgos de esas plataformas y de sus procesos de moderacion.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de clasificacion puede producir salidas no validas si se usa en modo generativo sin restricciones.
- Limitaciones de contexto e idioma: no se documenta la ventana de contexto ni la cobertura linguistica; el entrenamiento parece centrado en ingles y aleman.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base vllm-sr/d3-lite no tiene licencia documentada en la informacion disponible, lo que conviene verificar antes de un uso comercial.
- Caveat de produccion: es un artefacto experimental con cero descargas y sin pipeline declarado; no se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo.
- La evaluacion se hizo sobre eventos retenidos posteriores a la ventana de entrenamiento, pero no se publican los resultados de esa evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/bestdev57/zils-lite-body-1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Repositorio del autor (referenciado en la model card): no disponible como enlace directo
- Paper: no disponible
- Blog o demo: no disponible
