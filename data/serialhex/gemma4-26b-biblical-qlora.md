# serialhex/gemma4-26b-biblical-qlora

## Resumen

`serialhex/gemma4-26b-biblical-qlora` es un ajuste fino (fine-tune) del modelo de instrucciones `unsloth/gemma-4-26B-A4B-it`, publicado por el usuario serialhex en HuggingFace. Segun la denominacion del repositorio y la model card, el ajuste se ha realizado mediante SFT (supervised fine-tuning) sobre el modelo base, con orientacion tematica biblica, si bien la model card no documenta ni el dataset ni la composicion de los datos de entrenamiento empleados.

El modelo se distribuye en formato safetensors, ocupa 38,5 GB en el repositorio y es compatible con la libreria `transformers`. El entrenamiento se ha llevado a cabo con las herramientas TRL (version 1.13.0) y Unsloth, lo que apunta a una estrategia de QLoRA sobre un modelo de gran tamano. El repositorio incluye la etiqueta `endpoints_compatible`, de modo que puede desplegarse directamente en los Inference Endpoints de HuggingFace.

Se trata de un modelo recien publicado (creado el 10 de octubre de 2026) y sin traccion registrada en el momento de redactar esta ficha: cero descargas y cero likes. La model card es practicamente una plantilla autogenerada por TRL: no incluye licencia efectiva, idiomas declarados, contexto, resultados de evaluacion ni detalles del procedimiento de entrenamiento mas alla de las versiones del framework.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la nomenclatura del modelo base (A4B) sugiere una arquitectura transformer con mezcla de expertos (MoE) |
| Parametros totales | 26B (inferido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | aproximadamente 4B (inferido del sufijo A4B del modelo base; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors, sin ficheros GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card contiene el marcador de posicion `licence: license` sin texto legal |
| Formato de pesos | safetensors |
| Tamano del repositorio | 38,5 GB |
| Modelo base | unsloth/gemma-4-26B-A4B-it |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Libreria | transformers |
| Etiquetas relevantes | generated_from_trainer, trl, sft, unsloth, endpoints_compatible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. Toda la informacion estructural disponible procede del nombre del modelo base, `gemma-4-26B-A4B-it`, que sigue la convencion de nomenclatura habitual en modelos MoE: 26B indicaria el total de parametros y A4B los parametros activos por token (aproximadamente 4B). Esta interpretacion es una inferencia a partir del identificador y no esta respaldada por documentacion tecnica del autor. El sufijo `-it` del modelo base indica que se parte de una version ya ajustada para seguir instrucciones, sobre la que se aplica un segundo ajuste supervisado.

El procedimiento de entrenamiento declarado es SFT, ejecutado con TRL 1.13.0 sobre Transformers 5.17.0, PyTorch 2.14.1, Datasets 4.8.5 y Tokenizers 0.23.3. La presencia de la etiqueta `unsloth` y el tamano del repositorio (38,5 GB) apuntan a un ajuste eficiente en memoria del tipo QLoRA. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO posteriores, ni hiperparametros de entrenamiento. La model card no incluye seccion de datos, de evaluacion ni de limitaciones.

## Capacidades

- Generacion de texto conversacional en formato de chat: la model card incluye un ejemplo de uso con `pipeline("text-generation")` que acepta una lista de mensajes con roles (`{"role": "user", "content": ...}`).
- Especializacion tematica presunta en contenido biblico y religioso, deducida unicamente del nombre del repositorio; no hay documentacion que la respalde.
- Hereda las capacidades del modelo base `gemma-4-26B-A4B-it` como modelo de instrucciones, si bien el autor no detalla cuales se conservan tras el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Generacion y reescritura de textos de tematica biblica: el ajuste, segun su denominacion, estaria orientado a producir prosa con registro y vocabulario del ambito religioso. Adecuado para borradores de homilias, comentarios de pasajes o material devocional, siempre con revision humana.
- Asistente de estudio teologico: permite construir un chat de preguntas y respuestas sobre pasajes, concordancias o contextos historicos. La calidad dependera enteramente del dataset de ajuste, que no esta documentado.
- Adaptacion de registro y nivel lector: reformular textos religiosos complejos a un lenguaje divulgativo o infantil para catequesis y educacion.
- Generacion de material catequetico y educativo: guiones de sesion, preguntas de reflexion y resumenes para grupos parroquiales o aulas de religion.
- Chatbot de atencion a comunidades: integrable mediante la etiqueta `endpoints_compatible` en los Inference Endpoints de HuggingFace, con un coste de integracion bajo al usar la API estandar de `transformers`.
- Base para ajustes posteriores: al derivar de un modelo entrenado con Unsloth y TRL, sirve como punto de partida para fases adicionales de DPO, RLHF o ajustes con LoRA sobre dominios mas especificos.
- Prototipado rapido de asistentes conversacionales genericos: el ejemplo de la model card funciona directamente con `transformers.pipeline` y `max_new_tokens`, lo que permite validar el comportamiento del modelo en pocas lineas.
- Generacion de contenido editorial de nicho: articulos, guiones de podcast o newsletters de tematica religiosa, con supervision editorial obligatoria por el riesgo de alucinacion en citas y referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna evaluacion, ni cuantitativa ni cualitativa, y no se dispone de comparaciones con el modelo base ni con otros ajustes similares.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros declarado en el nombre del modelo (26B) y no de mediciones publicadas por el autor.

- VRAM estimada para los pesos en bf16/fp16: en torno a 52 GB, solo para los pesos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 26 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 13-16 GB para los pesos, mas cache KV y activaciones (no cuantificables sin conocer el numero de capas y cabezas).
- GPU profesionales recomendadas: A100 80 GB o H100 80 GB para inferencia en precision bf16; A100 40 GB o L40S 48 GB para cuantizaciones de 8 bits.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB permite ejecutar el modelo en 4 bits con contexto reducido. Tarjetas de 32 GB o mas (por ejemplo, RTX 5090 o configuraciones duales) ofrecen mayor margen de contexto.
- Opciones de despliegue: al publicarse solo en safetensors, los caminos naturales son `transformers` con `pipeline`, vLLM o TGI. El uso con llama.cpp u Ollama exigiria convertir los pesos a GGUF, tarea no documentada por el autor. La etiqueta `endpoints_compatible` habilita el despliegue gestionado en HuggingFace Inference Endpoints.
- Latencia y throughput estimados: no disponibles. No se ha publicado ninguna medicion de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de evaluacion |
|---|---|---|---|---|---|
| serialhex/gemma4-26b-biblical-qlora | 26B (inferido) | no disponible | no disponible | safetensors, 0 descargas | no |
| unsloth/gemma-4-26B-A4B-it (modelo base) | 26B totales, ~4B activos (segun nomenclatura) | no disponible | no disponible | no disponible en esta busqueda | no disponible |
| Alternativas MoE de tamano comparable (por ejemplo, Qwen3-30B-A3B) | 30B totales, 3B activos | 128K tokens | Apache 2.0 | pesos abiertos y cuantizaciones GGUF | publicados por el autor |

Las dos ultimas filas se incluyen unicamente como referencia de categoria. No es posible establecer una comparacion de rendimiento con el modelo de esta ficha porque no existe ninguna evaluacion publicada del mismo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas cualitativas ni comparacion con el modelo base, por lo que se desconoce si el ajuste ha degradado capacidades generales.
- Riesgo elevado de alucinacion en citas biblicas: el modelo puede generar referencias a versiculos, capitulos o autores que no existen o estan mal atribuidos. Cualquier uso editorial exige verificacion contra una fuente primaria.
- Licencia no disponible: la model card contiene un marcador de posicion (`licence: license`) sin texto legal. No se puede determinar si el uso comercial esta permitido. Ademas, al derivar de un modelo de la familia Gemma, el ajuste hereda previsiblemente las condiciones de uso del modelo base, que deben consultarse en su propio repositorio.
- Dataset de entrenamiento no documentado: se desconoce la procedencia, el idioma, la licencia y el volumen de los datos de ajuste, lo que impide evaluar sesgos y riesgos de memorizacion.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano ni en ningun otro idioma concreto.
- Contexto no declarado: se desconoce la ventana maxima soportada, dato critico para dimensionar cache KV y planificar despliegues.
- Modelo sin traccion ni validacion comunitaria: cero descargas y cero likes en el momento de la ficha, sin issues ni discusiones que permitan contrastar su comportamiento real.
- Orientacion tematica muy especifica: si el ajuste se ha realizado sobre un corpus biblico, es probable que el modelo haya perdido parte de su utilidad como asistente generalista, aunque esto no esta confirmado.
- Fechas de publicacion futuras respecto a la mayoria de referencias del ecosistema, lo que dificulta contrastar la informacion con documentacion externa.
- Idoneidad para produccion: baja con la informacion actual. Seria necesario validar el modelo en tareas concretas, confirmar la licencia y documentar el dataset antes de cualquier despliegue con usuarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/serialhex/gemma4-26b-biblical-qlora
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Unsloth: https://github.com/unslothai/unsloth
