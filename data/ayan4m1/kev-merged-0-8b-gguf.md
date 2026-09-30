# ayan4m1/kev-merged-0.8b-gguf

## Resumen

ayan4m1/kev-merged-0.8b-gguf es la version cuantizada en formato GGUF de kev-merged-0.8b, un artefacto que fusiona (merge) el modelo kev-0.8b con su modelo base. kev es una familia de modelos de decision mantenida por jaredpalmer: reciben un documento de estado y un conjunto de preguntas tipadas, y devuelven una distribucion de probabilidad por pregunta en una sola pasada forward, sin generar texto. Kev-0.8B parte de un modelo base de la familia Qwen y comparte receta de entrenamiento con los tamanos 4B y 9B; el 27B se construye sobre una release ya post-entrenada de Qwen.

Al fusionar el adaptador con el modelo base, el artefacto recupera el comportamiento generativo estandar, y de ahi que se publique con pipeline image-text-to-text y la etiqueta vision-language-model. El repositorio ocupa 4,1 GB y contiene pesos GGUF junto a un Modelfile pensado para habilitar el soporte de vision en Ollama.

Con 772.845.888 parametros (~0,77B) es un modelo muy ligero, ejecutable en CPU o en GPU de gama baja, lo que lo hace util para pruebas locales, prototipado rapido y tareas de vision-lenguaje de baja exigencia. No obstante, el repositorio no registra descargas ni valoraciones, y la informacion publicada sobre contexto, idiomas y datos de entrenamiento es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen (el repositorio lleva la etiqueta qwen3_5); merge de kev-0.8b con su modelo base |
| Parametros totales | 772.845.888 (~0,77B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; no se detallan los niveles concretos. El tamano del repo (4,1 GB) sugiere la presencia de varios niveles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base de la familia kev es un transformer denso de la serie Qwen. Segun la documentacion publica de la familia, cada tamano se implementa como un adaptador LoRA de rango 16 mas una cabeza de puntero (pointer head) sobre un modelo Qwen congelado que se descarga en la primera carga. La receta de entrenamiento es compartida entre 0.8B, 4B y 9B, mientras que el 27B parte de una release ya post-entrenada de Qwen. El artefacto descrito aqui no es el adaptador, sino el resultado de fusionar ese adaptador con el modelo base y cuantizarlo despues a GGUF.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se explica como se incorpora la capacidad de vision: la model card solo indica que el Modelfile incluido habilita el soporte de vision en Ollama, y el repositorio se etiqueta con vision-language-model y pipeline image-text-to-text. La etiqueta qwen3_5 apunta a una base de la generacion Qwen3, pero no hay confirmacion explicita.

## Capacidades

- Generacion de texto conversacional: el merge con el modelo base devuelve el comportamiento generativo propio de un modelo de lenguaje.
- Procesamiento de imagen y texto (image-text-to-text): asi lo declara el pipeline del repositorio y la etiqueta vision-language-model.
- Soporte de vision en Ollama mediante el Modelfile incluido.
- Inferencia en llama.cpp, por estar distribuido en formato GGUF.
- Salida de probabilidades tipadas: la familia kev esta disenada para responder preguntas tipadas con una distribucion de probabilidad por pregunta en un unico forward pass (comportamiento documentado para el modelo kev original).
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Clasificacion y decision tipada: usar el modelo al estilo de la familia kev, recibiendo un documento de estado y un conjunto de preguntas tipadas para obtener una probabilidad por clase en una sola pasada. Es el escenario de diseno original de kev-0.8b.
- Prototipado local sin GPU dedicada: con ~0,77B de parametros y pesos GGUF, se puede probar en un portatil mediante llama.cpp u Ollama antes de decidir si merece la pena subir a un tamano mayor de la familia.
- Vision ligera en el borde: al declararse image-text-to-text y soportar vision en Ollama, encaja en tareas sencillas de descripcion de imagenes o clasificacion visual donde no hay recursos para un VLM mayor.
- Enrutado y prefiltrado en pipelines de agentes: por su tamano reducido puede actuar como primer filtro (decidir si una consulta requiere un modelo mayor) con latencia minima.
- Chat conversacional de bajo coste: conversaciones multi-turno simples en entornos con memoria y computo muy limitados.
- Demos educativas y material docente: permite ilustrar el funcionamiento de un modelo cuantizado y de una familia de "modelos de decision" sobre hardware asequible.
- Experimentacion con merges y cuantizacion: sirve como caso practico de fusionar un adaptador con su base y publicar el resultado en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (a partir de los 772.845.888 parametros): en torno a 0,5 GB en Q4, 0,8 GB en Q8 y 1,5 GB en FP16, sin contar la cache KV ni el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (por ejemplo, GTX 1050/1650, RTX 3050 en adelante). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente toda la gama consumer actual y en bastantes integradas.
- Ejecucion solo en CPU: viable, dado el tamano del modelo y el formato GGUF.
- Opciones de despliegue: llama.cpp y Ollama (con el Modelfile incluido para vision). Otros runtimes compatibles con GGUF (por ejemplo LM Studio) son plausibles, aunque no se confirman en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kev-merged-0.8b-gguf | 0,77B | no disponible | GGUF | Apache 2.0 | Objeto de esta ficha; merge + cuantizacion |
| kev-0.8b (original) | ~0,8B | no disponible | LoRA (r=16) + pointer head | no disponible | Decision model sin generacion de texto |
| kev-4B | ~4B | no disponible | LoRA (r=16) + pointer head | no disponible | Misma receta de entrenamiento que el 0.8B |
| kev-9B | ~9B | no disponible | LoRA (r=16) + pointer head | no disponible | Misma receta de entrenamiento que el 0.8B |
| kev-27B | ~27B | no disponible | LoRA (r=16) + pointer head | no disponible | Parte de una release post-entrenada de Qwen |

Comparativas con modelos de vision-lenguaje de tamano similar (por ejemplo, variantes pequenas de Qwen-VL o SmolVLM): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Existe una discrepancia relevante entre la descripcion de la familia kev (modelo de decision, "no text generation") y la publicacion de este artefacto como image-text-to-text conversacional. Conviene verificar el comportamiento real antes de usarlo en produccion.
- No se documenta como se obtiene la capacidad de vision ni que base Qwen concreta se usa, por lo que el soporte multimodal no esta garantizado mas alla de la etiqueta y del Modelfile.
- Modelo de ~0,77B: capacidad de razonamiento, conocimiento factual y seguimiento de instrucciones limitados en comparacion con modelos mayores.
- Riesgo de alucinacion elevado, especialmente en tareas de conocimiento abierto y en generacion de texto largo.
- Longitud de contexto e idiomas soportados no disponibles: no se puede planificar un despliegue multi-turno largo ni confirmar cobertura multilingue.
- Repositorio con 0 descargas y 0 valoraciones: no hay validacion por parte de la comunidad.
- Licencia Apache 2.0, permisiva para uso comercial, pero la licencia del modelo base subyacente de Qwen y la de la familia kev no se detallan en la informacion disponible; conviene comprobarlas por separado.
- Al ser una cuantizacion GGUF, puede haber una perdida de calidad respecto al modelo sin cuantizar (en la familia kev se documenta una deriva de hasta ~0,1 en las probabilidades para una cuantizacion de demostracion, aunque ese dato corresponde a otro artefacto).
- Para tareas de decision con probabilidades calibradas, se recomienda usar pesos de mayor precision (por ejemplo q8_0) en lugar de cuantizaciones agresivas.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/ayan4m1/kev-merged-0.8b-gguf
- Modelo base en HuggingFace: https://huggingface.co/ayan4m1/kev-merged-0.8b
- Repositorio GitHub de la familia kev: https://github.com/jaredpalmer/kev
- Releases de la familia kev: https://github.com/jaredpalmer/kev/releases
- Cuantizacion GGUF de kev-0.8b (DreamBlooms): https://huggingface.co/DreamBlooms/kev-0.8b-GGUF
- Cuantizacion de demostracion de kev-0.8b (espetro): https://huggingface.co/espetro/kev-0.8b-demo-gguf
- Perfil del autor en Civitai: https://civitai.com/user/ayan4m1/models
