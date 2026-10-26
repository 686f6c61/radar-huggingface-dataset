# Anni0401/qwen3-embedding-8b-ports-lora

## Resumen

`Anni0401/qwen3-embedding-8b-ports-lora` es un adaptador LoRA para el modelo de embeddings `Qwen/Qwen3-Embedding-8B`, publicado por el usuario Anni0401. No es un modelo completo: el repositorio (0,1 GB) contiene únicamente los pesos del adaptador, que deben cargarse sobre el modelo base mediante PEFT. Su función es especializar el retriever en una tarea concreta: la selección y recuperación de herramientas (*tool retrieval*) para agentes basados en LLM.

El adaptador se entrena con PORTS (*Preference-Optimized Retrievers for Tool Selection with Large Language Models*), un método que alinea el espacio de embeddings con las preferencias de un LLM de inferencia congelado (en este caso, Llama-3-8B) que actúa como señal de preferencia. La motivación es que un retriever genérico ordena las herramientas por similitud semántica con la consulta, pero no necesariamente por la probabilidad de que el LLM las invoque correctamente; PORTS corrige esa discrepancia combinando una pérdida de preferencia basada en perplejidad con una pérdida contrastiva semántica.

Forma parte de un conjunto de estrategias de mejora evaluadas en el repositorio ToolSelectionBenchmark, con resultados end-to-end sobre Wild-Tool-Bench publicados en GitHub. Es relevante para quien construya agentes con catálogos de herramientas grandes, donde la selección previa al *function calling* condiciona la precisión del sistema. El modelo base hereda la orientación multilingüe y de texto largo de la familia Qwen3-Embedding (tamaños 0,6B, 4B y 8B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso de embeddings: Qwen3-Embedding-8B |
| Parametros totales | No disponible (adaptador LoRA; r = 16, alpha = 16). Modelo base: 8B (denominacion comercial) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base esta disenado para texto largo segun la documentacion de Qwen3-Embedding |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; el entrenamiento uso QLoRA (cuantizacion de 4 bits), pero no se publican artefactos cuantizados del adaptador |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base Qwen3-Embedding se describe como multilingue |
| Licencia | Apache-2.0 (heredada del modelo base; los datos BFCL tambien son Apache-2.0) |
| Formato de pesos | safetensors (pesos LoRA para PEFT) |
| Modelo base | Qwen/Qwen3-Embedding-8B |
| Metodo de ajuste | PORTS: perdida de preferencia basada en perplejidad + perdida contrastiva semantica |
| Modulos objetivo del LoRA | q, k, v, o, gate, up, down_proj |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | feature-extraction |
| Tarea | Retrieval de herramientas / seleccion de herramientas para function calling |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso de la familia Qwen3-Embedding, en su variante de 8B. El ajuste es de tipo LoRA con r = 16, alpha = 16 y dropout de 0,1, aplicado sobre los modulos de atencion (q, k, v, o) y las proyecciones del bloque feed-forward (gate, up, down), con QLoRA activado. Los hiperparametros documentados son: tasa de aprendizaje 1e-5, lambda 0,3, beta 1, gamma 0,5, 2 epocas, acumulacion de gradiente de 32 y checkpoint final de la epoca 2.

El entrenamiento usa el split de entrenamiento de BFCL: 1.000 muestras, con un 20 % reservado para validacion. La innovacion tecnica es el propio objetivo PORTS: en lugar de optimizar solo la similitud consulta-herramienta, se optimiza la alineacion con las preferencias de un LLM de inferencia congelado (Llama-3-8B), que proporciona la senal de preferencia. Asi, el embedding aprende a colocar en cabeza las herramientas que el modelo generativo acabaria seleccionando, no solo las mas parecidas lexica o semanticamente. El codigo de PORTS pertenece a sus autores originales; el repositorio incluye unicamente los ficheros modificados o anadidos, con atribucion, y los scripts de entrenamiento y barridos de hiperparametros estan en el repositorio de GitHub ToolSelectionBenchmark.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica (pipeline feature-extraction); no genera texto.
- Recuperacion de herramientas (*tool retrieval*) a partir de una consulta en lenguaje natural sobre un catalogo de funciones.
- Seleccion de herramientas alineada con las preferencias de un LLM de inferencia, orientada a reducir errores en el paso previo al function calling.
- Puntuacion de similitud y ranking de candidatos para pipelines de RAG y de enrutado.
- Capacidad multilingue heredada del modelo base Qwen3-Embedding (no cuantificada en la informacion disponible para este adaptador).
- Procesamiento de texto largo heredado del modelo base (longitud de contexto no especificada en la ficha).
- Integracion con PEFT (transformers) y con vLLM en modo *multi-LoRA* para servir el adaptador junto al modelo base.
- No incluye tool calling nativo, agentes, vision, audio ni modo de razonamiento: es exclusivamente un componente de recuperacion.

## Casos de uso

- Seleccion de herramientas en agentes con catalogos amplios: el adaptador actua como primera etapa del pipeline, recuperando las k herramientas mas probables para una consulta antes de que el LLM decida cual invocar; reduce el numero de funciones expuestas en el prompt y el coste por turno.
- Enrutado de peticiones en asistentes conversacionales: se indexan las acciones disponibles (consultar pedido, cambiar direccion, abrir incidencia) y el retriever elige el subconjunto relevante, lo que evita inyectar todo el esquema de funciones en cada llamada.
- RAG sobre documentacion de APIs: indexar endpoints y descripciones de parametros para recuperar el fragmento exacto que el desarrollador o el agente necesita, aprovechando que el modelo base esta orientado a texto largo.
- Sustitucion de un clasificador de intenciones en produccion: en lugar de entrenar un modelo supervisado por intencion, se indexan las herramientas y se recupera por similitud, con actualizacion del catalogo sin reentrenamiento.
- Filtrado previo en pasarelas de *function calling*: el adaptador reduce el conjunto de funciones candidatas antes de enviarlas a un LLM con limite de tokens o con coste por token alto.
- Deduplicacion y agrupacion de herramientas: usar los embeddings para detectar funciones solapadas o mal descritas en un catalogo grande y consolidarlas.
- Evaluacion comparativa de retrievers: sirve como una de las estrategias de referencia del banco ToolSelectionBenchmark, para medir el efecto de PORTS frente a un retriever sin ajustar.
- Analisis offline de trazas de agentes: recuperar, para cada consulta registrada, las herramientas que el retriever habria propuesto y detectar desalineaciones con las realmente invocadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los resultados end-to-end de seleccion de herramientas sobre Wild-Tool-Bench, junto con los scripts y los logs de evaluacion, se encuentran en el repositorio de GitHub ToolSelectionBenchmark, pero las cifras no se recogen en la model card ni en los resultados de busqueda consultados.

| Benchmark | Metrica | Resultado |
|---|---|---|
| Wild-Tool-Bench (end-to-end, tool selection) | No disponible | No disponible (reportado en el repositorio de GitHub, no incluido en la ficha) |
| BFCL (split de entrenamiento) | No disponible | No disponible (usado para entrenamiento, 1.000 muestras) |

## Requisitos de hardware

Las cifras siguientes son estimaciones a partir del tamano del modelo base (8B) y no cifras publicadas por el autor.

- VRAM para inferencia en bf16/fp16: en torno a 16 GB solo para los pesos del modelo base, mas overhead de activaciones y cache KV. Con contexto largo, prever 20-24 GB o mas.
- VRAM con cuantizacion de 8 bits: aproximadamente 9-10 GB para pesos; con 4 bits, en torno a 5-6 GB, siempre que se use una via de despliegue que soporte cuantizacion del modelo base.
- GPU recomendadas para servicio en bf16 con contexto largo: A100 40/80 GB, H100, L40S 48 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo base en bf16, con margen limitado si se usan contextos muy largos o lotes grandes; con cuantizacion de 8 bits el margen es mayor. El adaptador en si ocupa ~0,1 GB adicionales.
- Opciones de despliegue: transformers + PEFT (`PeftModel.from_pretrained`) y vLLM con `--enable-lora --max-lora-rank 16 --lora-modules qwen3-embedding-8b-ports-lora=Anni0401/qwen3-embedding-8b-ports-lora`; el autor no documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 8B con salida de embedding, el coste dominado es el *prefill* de la consulta, no la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| qwen3-embedding-8b-ports-lora (este) | Adaptador LoRA sobre base 8B | No disponible | No disponible | Apache-2.0 | HuggingFace (adaptador) | Ajustado con PORTS para tool retrieval; requiere el modelo base |
| Qwen/Qwen3-Embedding-8B | 8B | No disponible | Multilingue (segun documentacion de Qwen) | Apache-2.0 | HuggingFace | Modelo base sin ajuste; referencia de comparacion para medir el efecto de PORTS |
| Qwen3-Embedding-4B | 4B | No disponible | Multilingue (segun documentacion de Qwen) | No disponible en la informacion consultada | HuggingFace | Alternativa de menor coste computacional, sin ajuste especifico de tool retrieval |
| Qwen3-Embedding-0.6B | 0,6B | No disponible | Multilingue (segun documentacion de Qwen) | No disponible en la informacion consultada | HuggingFace | Opcion para entornos con VRAM muy limitada o alto throughput |

## Limitaciones y advertencias

- No es un modelo autonomo: sin cargar `Qwen/Qwen3-Embedding-8B` los pesos del adaptador no son utilizables.
- El adaptador esta ajustado sobre el split de entrenamiento de BFCL (1.000 muestras). Un dominio de herramientas muy distinto (por ejemplo, APIs internas con descripciones atipicas) puede degradar la ventaja frente al modelo base; conviene validar con un conjunto propio antes de desplegar.
- La senal de preferencia proviene de Llama-3-8B congelado. Si el LLM de inferencia en produccion es otro modelo o tiene un formato de function calling distinto, la alineacion puede no transferirse.
- Sesgos: no documentados por el autor. Al heredar el modelo base, el adaptador puede reproducir sesgos presentes en los datos de Qwen3-Embedding y de BFCL; la ficha no incluye analisis al respecto.
- Riesgo de recuperacion incorrecta: un ranking erroneo de herramientas puede provocar que el LLM invoque una funcion equivocada o no invoque ninguna. Es recomendable recuperar k > 1 y aplicar una etapa de reranking o validacion de esquema.
- Idiomas: la ficha no especifica que idiomas cubre el ajuste. El modelo base es multilingue, pero el ajuste PORTS se hizo sobre BFCL, mayoritariamente en ingles; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de contexto del modelo base no se detalla en la informacion disponible. No asumir valores concretos sin consultar la ficha de Qwen3-Embedding-8B.
- Licencia: Apache-2.0, permisiva para uso comercial. El codigo original de PORTS pertenece a sus autores y el repositorio solo incluye los ficheros modificados con atribucion; revisar los terminos del proyecto PORTS original si se redistribuye.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-26. No hay evidencia de uso en produccion ni de mantenimiento posterior.
- No hay datos publicados de latencia, throughput ni consumo de memoria especificos para este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anni0401/qwen3-embedding-8b-ports-lora
- Modelo base Qwen3-Embedding-8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio ToolSelectionBenchmark (scripts, evaluacion en Wild-Tool-Bench, `improvement-strategies/ports-lora`): https://github.com/Anni0401/ToolSelectionBenchmark
- Repositorio oficial Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- README de Qwen3-Embedding en GitHub: https://github.com/QwenLM/Qwen3-Embedding/blob/main/README.md
- README del modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-Embedding-8B/blob/d74263f1218b695e9486bec7a65bcf9a2e47fa23/README.md
