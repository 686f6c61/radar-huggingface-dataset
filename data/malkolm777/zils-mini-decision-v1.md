# malkolm777/zils-mini-decision-v1

## Resumen

zils-mini-decision-v1 es un modelo de extraccion de caracteristicas (pipeline `feature-extraction`) publicado por el usuario malkolm777 en Hugging Face. Se trata de un ajuste fino mediante LoRA (rango 16) sobre el modelo base vllm-sr/d3-mini, que pertenece a la familia Qwen/Qwen3.5-4B. El modelo tiene 4.539.265.536 parametros totales y un tamano de repositorio de 9,1 GB en formato safetensors.

El modelo esta disenado especificamente como un "cuerpo de decision" para el pool mini de la subnet 127 de Zils, una plataforma orientada a entrenar modelos pequenos que tomen decisiones a partir de ejemplos etiquetados. El ajuste se realizo sobre elementos de decision procedentes de fuentes publicas con etiquetas de resultado, recopiladas mediante la herramienta `zils.current`: reversiones de Wikipedia, anuncios de categorias de arXiv, fusiones en Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia.

Su relevancia es acotada: no es un modelo de proposito general, sino un componente especializado en tareas de clasificacion y decision binaria o multiclase dentro del ecosistema Zils. La licencia Apache-2.0 y el formato estandar de transformers facilitan su integracion, aunque la ausencia de benchmarks publicos y de documentacion detallada limita su evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-4B, segun model card) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del cuerpo base vllm-sr/d3-mini, identificado en la model card como perteneciente a la familia Qwen/Qwen3.5-4B. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 orientado a tareas de decision. No se especifica la arquitectura interna mas alla de la referencia a la familia Qwen3.5, ni se detalla si emplea atencion estandar, atencion lineal u otras variantes. Tampoco se indica la longitud de contexto nativa del modelo base.

Los datos de entrenamiento son "decision items" procedentes de fuentes publicas con etiquetas de resultado, recopiladas con la herramienta `zils.current`. Las fuentes mencionadas son reversiones de Wikipedia, anuncios de categorias de arXiv, fusiones en Gerrit, Stack Exchange y procesos AfC/AfD de Wikipedia. No se indica el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica declarada es el uso de LoRA de rango 16 sobre un cuerpo base ya entrenado, lo que reduce el coste de ajuste y preserva las capacidades del modelo original.

## Capacidades

- Extraccion de caracteristicas y representaciones para tareas de decision (pipeline declarado: `feature-extraction`).
- Clasificacion y puntuacion de elementos de decision en dominios con etiquetas de resultado (reversiones, fusiones, anuncios, moderacion de contenido).
- Integracion con el ecosistema Zils para entrenar y desplegar modelos pequenos de decision.
- Compatibilidad con transformers y con endpoints (`endpoints_compatible` en los tags).
- Soporte de `custom_code`, lo que implica que requiere cargar codigo personalizado del repositorio.
- Capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling, agentes o multilingue: no disponibles en la informacion proporcionada.

## Casos de uso

- Moderacion de contribuciones en plataformas tipo wiki: el modelo puede puntuar si una edicion debe revertirse, entrenado sobre reversiones de Wikipedia, lo que permite priorizar revisiones humanas.
- Triaje de envios a arXiv: clasificar anuncios de categorias y detectar envios mal categorizados o duplicados antes de la revision editorial.
- Revision de cambios en repositorios de codigo: usar fusiones de Gerrit como senal para predecir si un cambio sera aceptado o rechazado en un pipeline de integracion continua.
- Curacion de preguntas en Stack Exchange: identificar preguntas de baja calidad o fuera de alcance antes de que lleguen a los moderadores.
- Gestion de procesos AfC/AfD de Wikipedia: asistir en la evaluacion de articulos propuestos para creacion o borrado, ordenando la cola por probabilidad de decision.
- Clasificacion de solicitudes en aplicaciones: siguiendo el enfoque de Zils, entrenar el modelo con ejemplos propios para ordenar peticiones, marcar problemas o puntuar coincidencias en un servicio.
- Filtrado previo en pipelines de datos: usar las representaciones del modelo como caracteristicas para un clasificador descendente en tareas de seleccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 9 GB solo para pesos (4.539 millones de parametros), mas memoria para activaciones y contexto; en la practica, alrededor de 10-12 GB en funcion de la longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion, en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI por compatibilidad con el formato safetensors; llama.cpp y Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zils-mini-decision-v1 | 4.539 M | no disponible | Apache-2.0 | safetensors | Ajuste LoRA r16 sobre d3-mini (Qwen3.5-4B), especializado en decision |
| vllm-sr/d3-mini (base) | 4B (familia Qwen3.5) | no disponible | Apache-2.0 | safetensors | Cuerpo base sin ajuste de decision |
| malkolm777/zils-lite-decision-v1 | no disponible | no disponible | no disponible | no disponible | Variante "lite" del mismo autor y ecosistema |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible | Modelo generalista de la misma familia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que el rendimiento real en tareas de decision no esta cuantificado.
- El modelo esta especializado en dominios concretos (Wikipedia, arXiv, Gerrit, Stack Exchange, AfC/AfD); su generalizacion fuera de esos dominios es incierta.
- Requiere `custom_code` y `trust_remote_code=True` al cargar con transformers, lo que implica ejecutar codigo del autor del repositorio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-08), lo que sugiere ausencia de validacion externa.
- No se documentan sesgos conocidos, riesgo de alucinacion, limitaciones de contexto ni idiomas soportados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base vllm-sr/d3-mini debe verificarse de forma independiente para confirmar compatibilidad de licencias en produccion.
- Al ser un modelo de decision y extraccion de caracteristicas, no debe asumirse capacidad de generacion de texto conversacional ni de razonamiento general sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Variante lite del mismo autor: https://huggingface.co/malkolm777/zils-lite-decision-v1
- Sitio de Zils: https://zils.ai/
