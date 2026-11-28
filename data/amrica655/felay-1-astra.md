# Amrica655/FELAY-1-ASTRA

## Resumen
FELAY-1-ASTRA es un modelo multimodal de tipo image-text-to-text publicado por el usuario Amrica655 bajo la marca FELAY AI. Se construye como un ajuste fino del checkpoint cuantizado en 4 bits `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, es decir, parte de la familia Gemma 4 de Google en su variante instructiva E4B. El repositorio declara 7.996.156.448 parámetros reales en safetensors y un tamano de 22,8 GB, coherente con pesos almacenados en varios formatos y con la copia del modelo base.

El modelo se presenta como el miembro pesado de la familia FELAY-1 (junto a CARBON y TITAN) y su propuesta diferencial es un kernel de auto-planificacion nativo con token `<|think|>`, que genera un plan de tres pasos antes de la respuesta final. Ademas incorpora tecnicas de cuantizacion y offload orientadas a ejecutar un modelo de ~8B en entornos con poca memoria, incluyendo el traslado de la tabla de embeddings por capas (PLE) a CPU o disco y un consumo declarado de aproximadamente 2,8 GB de VRAM.

Su relevancia practica es limitada pero concreta: ofrece un pipeline multimodal con licencia Apache 2.0, soporte declarado de ingles y persa, y un enfoque de despliegue de bajo consumo que puede interesar a quien necesite prototipar sobre hardware modesto. No obstante, la model card esta redactada principalmente en persa, no aporta resultados de benchmarks verificables y el modelo acumula muy pocas descargas (176) y cero likes en el momento de la consulta, por lo que debe tratarse como un experimento de la comunidad y no como un modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 E4B (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 7.996.156.448 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NF4 (bitsandbytes) en el checkpoint base; el repositorio declara pesos en safetensors |
| Idiomas soportados | en, fa (ingles y persa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/gemma-4-E4B-it-unsloth-bnb-4bit |
| Tamano del repositorio | 22,8 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento
La informacion disponible indica que FELAY-1-ASTRA deriva de Gemma 4 E4B en su version instructiva, cuantizada previamente a 4 bits NF4 mediante bitsandbytes y distribuida por Unsloth. La model card menciona una base de 42 capas y un tamano aproximado de 9B para la variante Gemma-4 empleada, aunque el recuento real de parametros del repositorio es de 7.996.156.448. No se detalla la composicion del dataset de ajuste, el numero de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

Las innovaciones declaradas por el autor se centran mas en el proceso de ajuste y despliegue que en la arquitectura del transformer: un kernel de auto-planificacion en dos etapas que inserta un plan de tres pasos antes de responder, una tecnica de "cirugia en sitio" con `pread`/`pwrite` y `POSIX_FADV_DONTNEED` para modificar pesos con consumo de RAM inferior a 5 MB, calibracion espectral de los RMSNorm de las 42 capas sin alterar los bytes NF4, congelacion de `down_proj` y `up_proj` durante el QLoRA para preservar conocimiento base, y offload de la tabla PLE (5,6 GB) a CPU o disco manteniendo las capas Q4 en el acelerador. La model card cita tambien un ajuste de alineacion denominado "Golden 920" que eleva una puntuacion interna de 110 a 118 sobre 125. Ninguna de estas cifras esta acompanada de una evaluacion publica reproducible.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles y persa.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text), lo que permite describir, interpretar o responder preguntas sobre imagenes.
- Modo de auto-planificacion con token `<|think|>`: el modelo genera un plan de tres pasos antes de la respuesta final.
- Razonamiento multi-paso derivado de la planificacion explicita anterior.
- Capacidades de instruccion heredadas de Gemma 4 E4B-it; el alcance exacto en codigo y matematicas no esta documentado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso
- Asistencia conversacional en persa e ingles: el modelo declara soporte nativo de ambos idiomas y puede gestionar dialogos multi-turno, lo que lo hace util para prototipos de atencion al cliente en mercados persa-hablantes.
- Descripcion y analisis de imagenes: al ser un modelo image-text-to-text, puede emplearse para generar descripciones automaticas, responder preguntas sobre capturas o clasificar contenido visual con una explicacion textual.
- Despliegue en hardware de gama baja: con un consumo declarado de ~2,8 GB de VRAM y offload de la tabla PLE a CPU o disco, es viable en equipos sin GPU dedicada de gran capacidad, util para demos locales y entornos educativos.
- Razonamiento con planificacion explicita: el kernel `<|think|>` permite obtener trazas de planificacion de tres pasos, aprovechables en tareas de analisis donde se quiere auditar el razonamiento previo a la respuesta.
- Prototipado de asistentes multimodales con licencia permisiva: la licencia Apache 2.0 facilita integrar el modelo en productos internos o comerciales sin las restricciones de otros modelos abiertos.
- Experimentacion academica sobre cuantizacion y offload: las tecnicas descritas (calibracion RMSNorm, cirugia en sitio, offload PLE) sirven como referencia para investigar inferencia de bajo consumo en modelos de ~8B.
- Generacion de contenido bilingue: redaccion y traduccion asistida entre ingles y persa en flujos editoriales o de soporte.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica citada es una puntuacion interna de alineacion ("Golden 920") que pasa de 110 a 118 sobre 125, sin definicion del conjunto de evaluacion ni comparacion con otros modelos, por lo que no es verificable.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,8 GB segun la model card, gracias al offload de la tabla PLE (5,6 GB) a CPU o disco y a la cuantizacion NF4 de las 42 capas.
- GPU recomendadas: no se especifican modelos concretos. El autor menciona ejecucion en sistemas "debiles (no moviles)" y tags de TPU v5e, lo que sugiere despliegue en aceleradores de gama media o entornos cloud con TPU.
- Cabe en GPU de consumo: si se confirma el consumo de ~2,8 GB, cabria en tarjetas con 4 GB o mas de VRAM, aunque no hay validacion independiente.
- Opciones de despliegue: transformers como libreria principal; el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FELAY-1-ASTRA | 7.996.156.448 | no disponible | image-text-to-text | Apache 2.0 | Hugging Face, 176 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ~8B (E4B) | no disponible | image-text-to-text | segun Gemma | Hugging Face |
| FELAY-1-TITAN (misma familia) | no disponible | no disponible | texto/codigo | no disponible | Hugging Face, segun model card |
| FELAY-1-CARBON (misma familia) | no disponible | no disponible | texto | no disponible | Hugging Face, segun model card |

La comparacion con alternativas fuera de la familia FELAY no puede completarse con la informacion disponible, ya que no se aportan datos de rendimiento ni especificaciones de contexto de modelos comparables.

## Limitaciones y advertencias
- Ausencia total de benchmarks publicos verificables: la unica metrica es interna y no reproducible.
- Model card redactada mayoritariamente en persa, lo que dificulta la auditoria tecnica a lectores no familiarizados con el idioma.
- Cobertura linguistica limitada a ingles y persa; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de ~8B cuantizados a 4 bits, agravado por la falta de evaluacion.
- El proceso de cuantizacion NF4 y las modificaciones de RMSNorm pueden degradar la calidad respecto al modelo base; no se aportan comparaciones controladas.
- La licencia Apache 2.0 se declara en el repositorio, pero al derivar de Gemma 4 conviene verificar que los terminos del modelo base permitan la redistribucion en estos terminos.
- El tag `base_model` apunta a un checkpoint cuantizado de Unsloth, no al modelo original de Google, lo que anade una capa de transformacion no auditada.
- Traccion muy baja (176 descargas, 0 likes) y creado en noviembre de 2026: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- No se documenta soporte de tool calling, agentes ni contexto largo, por lo que no deberia asumirse en integraciones que dependan de estas capacidades.

## Enlaces
- Hugging Face: https://huggingface.co/Amrica655/FELAY-1-ASTRA
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de transformers: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
