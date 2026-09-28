# Haidar95/legal-qwen-model

## Resumen

Haidar95/legal-qwen-model es un ajuste fino (fine-tune) del modelo Qwen2.5-3B, publicado por el usuario Haidar95 en HuggingFace bajo licencia Apache 2.0. El modelo parte concretamente de `unsloth/qwen2.5-3b-unsloth-bnb-4bit`, una version del Qwen2.5-3B ya cuantizada a 4 bits (bitsandbytes) y preparada para entrenamiento eficiente con la libreria Unsloth. El repositorio contiene pesos en formato safetensors de 3.085.938.688 parametros (unos 3,09 mil millones), con un tamano total de 6,2 GB, lo que es coherente con pesos fusionados en precision de 16 bits.

El problema que aborda es el de la adaptacion de un modelo generalista pequeno a un dominio especifico: el nombre del repositorio sugiere un enfoque en el ambito legal o juridico, aunque la model card no documenta ni el conjunto de datos de entrenamiento ni la tarea concreta para la que fue ajustado. Se trata, por tanto, de un modelo comunitario de nicho, sin resultados de benchmarks publicados y con cero descargas y cero "likes" en el momento de la consulta.

Su relevancia actual es limitada pero ilustrativa: demuestra el flujo de trabajo habitual de fine-tuning de bajo coste sobre GPUs de consumo (Unsloth + TRL), aplicado a un modelo de 3B que puede ejecutarse en hardware modesto. Encaja en el segmento de modelos pequenos especializados, donde la ventaja competitiva no es el rendimiento bruto en benchmarks, sino el coste de inferencia y la posibilidad de desplegarlo localmente o en una sola GPU de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no documentada en la model card ni en los resultados de busqueda) |
| Tipos de cuantizacion | No disponible. El repo publica safetensors sin cuantizar (6,2 GB para 3,09 B parametros equivale a ~16 bits); no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B original: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con query-key-value agrupadas (GQA), ademas de codificacion posicional relativa (RoPE). No hay ninguna innovacion arquitectonica propia de este ajuste: se trata de un fine-tune sobre los pesos del modelo base, no de una arquitectura nueva ni de una modificacion estructural.

El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun declara el propio autor, siguiendo el flujo tipico de QLoRA sobre un modelo base cuantizado a 4 bits (`unsloth-bnb-4bit`). Esto implica que el ajuste se hizo con adaptadores de bajo rango sobre pesos congelados de 4 bits y que posteriormente los pesos resultantes se fusionaron y se subieron en precision de 16 bits (de ahi los 6,2 GB del repositorio, en lugar de los ~50-200 MB que ocuparia un adaptador LoRA suelto). La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni hiperparametros como rango de LoRA, learning rate o numero de epocas.

El hecho de partir de una base ya cuantizada a 4 bits impone un techo de calidad: el ajuste hereda los errores de cuantizacion del punto de partida y no recupera la precision original del Qwen2.5-3B en precision completa.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la calidad base de un modelo de 3B parametros.
- Razonamiento basico y respuesta a instrucciones (el modelo base Qwen2.5-3B es instruction-tuned, aunque la model card de este ajuste no detalla el formato de prompt utilizado).
- Generacion de codigo de complejidad baja a media, limitada por el tamano del modelo.
- Comprension y resumen de documentos, presumiblemente orientada a texto de tipo legal segun el nombre del repositorio, aunque no esta documentado.
- Soporte de tool calling: no documentado en la model card de este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles, pese a que la familia Qwen2.5 es multilingue por diseno.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles. Es un modelo exclusivamente de texto.

## Casos de uso

- Clasificacion y etiquetado de documentos juridicos: con 3,09 B parametros el modelo cabe en una GPU de consumo, lo que permite procesar lotes grandes de contratos, demandas o resoluciones para asignarles categoria sin coste de API.
- Resumen extractivo de contratos y escritos: el modelo puede condensar documentos extensos en resumenes estructurados; conviene trocear el texto porque la ventana de contexto no esta documentada.
- Extraccion de clausulas y entidades (fechas, partes, importes, plazos): util como primer filtro en un pipeline de revision contractual, siempre con validacion humana posterior.
- Generacion de borradores de correspondencia legal de baja criticidad: respuestas iniciales a consultas rutinarias, plantillas de requerimientos o comunicaciones internas, que despues revisa un profesional.
- Asistente de primera linea en atencion al cliente de despachos: respuestas a preguntas frecuentes sobre procedimientos y plazos, con escalado a un humano cuando la consulta requiera criterio juridico.
- Prototipado e investigacion de tecnicas de fine-tuning: sirve como caso de estudio reproducible del flujo Unsloth + TRL sobre un modelo de 3B, util para equipos que quieran replicar el procedimiento con sus propios datos.
- Despliegue en local o en entornos con requisitos de privacidad: al ejecutarse en una sola GPU y sin necesidad de conexion externa, es apto para organizaciones que no pueden enviar documentos confidenciales a servicios en la nube.
- Anonimizado o preprocesado de textos sensibles: tareas de reescritura y normalizacion previas a un analisis posterior con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de referencia, ni comparaciones con el modelo base o con alternativas. Tampoco hay resultados de evaluacion especifica del dominio legal.

## Requisitos de hardware

- VRAM para inferencia en precision de 16 bits: en torno a 6,5-7 GB solo para pesos, mas el cache KV; con margen para el runtime, se recomienda un minimo de 10-12 GB de VRAM.
- VRAM con cuantizacion a 8 bits: aproximadamente 3,1 GB de pesos, con un total practico de unos 5-6 GB.
- VRAM con cuantizacion a 4 bits: aproximadamente 1,8-2 GB de pesos, con un total practico de unos 4 GB.
- Cache KV: estimacion de 1-1,5 GB adicionales para secuencias del orden de 32.000 tokens en fp16, asumiendo la configuracion tipica de atencion con GQA de la familia Qwen2.5-3B (dato no confirmado en la model card).
- GPUs recomendadas: RTX 3090, RTX 4090, A10G, L4 o A100 40 GB para despliegues con concurrencia; para uso individual, una RTX 3060 de 12 GB o superior es suficiente en 16 bits.
- Cabe en GPU de consumo: si. En 4 bits funciona incluso en GPUs con 6-8 GB de VRAM; en 16 bits requiere al menos 10-12 GB.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI, etiquetado en el repo), vLLM. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que el autor no publica.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Haidar95/legal-qwen-model | 3,09 B | No disponible | Apache 2.0 | safetensors en HuggingFace | No |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors y GGUF oficiales | Si |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | safetensors y GGUF oficiales | Si |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors y GGUF oficiales | Si |

Nota: los datos de contexto y licencia de los tres modelos de comparacion proceden de sus fichas publicas y no de la informacion recopilada para esta ficha; conviene verificarlos en las fuentes originales antes de tomar decisiones. La diferencia clave es que este ajuste no publica evaluaciones ni versiones cuantizadas, mientras que las alternativas ofrecen ambas cosas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con el modelo base, por lo que no es posible cuantificar si el ajuste mejora o degrada el rendimiento original.
- Dataset de entrenamiento no documentado: se desconoce que datos se usaron, su licencia, su procedencia y si contenian informacion personal o material con derechos de autor. Esto es un riesgo legal relevante si se pretende usar el modelo en produccion.
- Riesgo alto de alucinacion: un modelo de 3B parametros, ajustado sobre una base cuantizada a 4 bits, tiende a inventar citas normativas, articulos y jurisprudencia. En dominio legal esto es especialmente peligroso y exige verificacion humana obligatoria.
- Sesgos: no se ha realizado ninguna evaluacion de sesgo. El modelo hereda los sesgos del corpus de preentrenamiento de Qwen2.5 y de los datos del ajuste, que no se describen.
- Limitacion de idioma: la model card declara unicamente ingles, lo que excluye su uso directo fiable en castellano sin un ajuste adicional.
- Contexto no documentado: al no especificarse la ventana de contexto, no se puede planificar el troceado de documentos con criterio; hay que medirlo empiricamente antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones de copyleft, pero conviene revisar las condiciones del modelo base Qwen2.5 y del repositorio Unsloth de origen, que a su vez es Apache 2.0.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, sin issues ni discusion, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas inconsistentes: el repositorio figura como creado y actualizado el 28 de septiembre de 2026, una fecha posterior a la consulta, lo que sugiere un problema de metadatos que conviene tener en cuenta al citarlo.
- Sin versiones cuantizadas ni adaptadores publicados: para desplegarlo con llama.cpp, Ollama o en GPUs pequenas hay que generar la cuantizacion uno mismo.
- Adecuacion dudosa para produccion: sin evaluacion, sin documentacion del dataset y sin mantenimiento aparente, es mas razonable tratarlo como experimento o punto de partida que como componente listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Haidar95/legal-qwen-model
- Modelo base: https://huggingface.co/unsloth/qwen2.5-3b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Qwen: https://qwen.readthedocs.io/
- Sitio oficial de Qwen: https://qwen.ai/home
- Organizacion Qwen en GitHub: https://github.com/QwenLM
- Informe tecnico de Qwen3 (referencia de la familia, no especifico de Qwen2.5): https://arxiv.org/html/2505.09388v1
