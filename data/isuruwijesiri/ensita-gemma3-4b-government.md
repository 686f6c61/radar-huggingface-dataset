# isuruwijesiri/ensita-gemma3-4b-government

## Resumen

ensita-gemma3-4b-government es un modelo publicado en Hugging Face por el usuario isuruwijesiri bajo el identificador `isuruwijesiri/ensita-gemma3-4b-government`. Por el nombre se deduce que se trata de un ajuste fino (fine-tuning) del modelo Gemma 3 de 4.000 millones de parametros de Google, orientado presumiblemente a tareas de ambito gubernamental o administracion publica. El repositorio tiene un tamano de 8,6 GB, lo que es coherente con pesos en precision bf16/fp16 de un modelo de 4B de parametros.

La informacion disponible en la ficha de Hugging Face es muy limitada: unicamente aparecen las etiquetas `safetensors` y `region:us`, con 0 descargas y 1 like en el momento de la consulta. No se especifican pipeline, licencia, idiomas ni datos de entrenamiento. El modelo fue creado el 5 de mayo de 2026 y actualizado por ultima vez el 22 de noviembre de 2026.

Su relevancia es limitada y experimental: se trata de un derivado comunitario de Gemma 3 4B sin documentacion publica de evaluacion, por lo que debe evaluarse con cautela antes de cualquier uso en produccion. La ficha siguiente se construye a partir de lo que se puede inferir del nombre, el tamano del repositorio y las caracteristicas conocidas del modelo base Gemma 3 4B, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 3 4B; no confirmado en la model card) |
| Parametros totales | Aproximadamente 4.000 millones (inferido del nombre; no confirmado) |
| Parametros activos | No aplica (no es un modelo MoE, segun el modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada (Gemma 3 4B soporta hasta 128K tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta ni sobre el proceso de entrenamiento en la model card publica. Por el nombre del repositorio, se infiere que parte de Gemma 3 4B, un transformer decoder-only de Google con atencion por ventanas deslizantes y atencion global alternadas, entrenado originalmente sobre billones de tokens multimodales (texto e imagen). Sin embargo, no hay confirmacion de que este fine-tuning conserve las capacidades multimodales del modelo base ni de que se haya realizado con datos de dominio gubernamental.

Tampoco se documenta el numero de tokens de ajuste, la composicion del dataset, si se aplico RLHF, DPO o simplemente SFT supervisado, ni si se congelaron capas o se entreno el modelo completo. Cualquier afirmacion al respecto seria especulativa y no debe tomarse como dato verificado.

## Capacidades

- Generacion de texto en lenguaje natural (heredada del modelo base, no verificada tras el fine-tuning).
- Posible especializacion en terminologia administrativa, legal o gubernamental, segun sugiere el sufijo `government` del nombre; no confirmado.
- Soporte de tool calling y function calling: no disponible (Gemma 3 base lo soporta parcialmente, pero no se confirma en este derivado).
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingues: no disponible.
- Vision: no disponible (Gemma 3 4B es multimodal, pero no se confirma que este fine-tuning conserve la torre de vision).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado de asistentes administrativos: el modelo podria emplearse para redactar borradores de respuestas a consultas ciudadanas o resumir documentacion administrativa, siempre que se valide su calidad con un conjunto de prueba propio, dado que no hay evaluaciones publicas.
- Clasificacion y extraccion de informacion en textos legales: si el fine-tuning se ha realizado sobre corpus gubernamental, podria utilizarse para etiquetar expedientes o extraer entidades (fechas, organismos, normativa) en pipelines internos.
- Generacion aumentada por recuperacion (RAG) sobre bases documentales publicas: el modelo podria integrarse como generador en un sistema RAG que consulte boletines oficiales o normativa, con verificacion humana obligatoria de las citas.
- Despliegue en entornos con recursos limitados: con 4B de parametros y pesos safetensors, es viable cuantizarlo a 4 bits y ejecutarlo en una unica GPU de consumo, lo que permite pruebas internas a bajo coste.
- Experimentacion academica sobre fine-tuning de dominio: util como punto de partida para investigadores que quieran comparar ajustes especializados frente al Gemma 3 4B original.
- Generacion de formularios y plantillas administrativas: podria asistir en la redaccion de comunicaciones formales o en la conversion de texto libre a campos estructurados, sujeto a validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4-5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF/AWQ/GPTQ): alrededor de 2,5-3 GB de pesos.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A10G, L4 o A100 para despliegues con mayor concurrencia; tambien es viable en GPUs de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB con cuantizacion.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM usando cuantizacion de 8 o 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers con safetensors; requiere conversion previa a GGUF si se usa llama.cpp u Ollama, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU y del backend, sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| isuruwijesiri/ensita-gemma3-4b-government | ~4B (inferido) | No disponible | No disponible | Hugging Face, safetensors | Fine-tuning comunitario sin evaluacion publica |
| Google Gemma 3 4B | 4B | Hasta 128K tokens | Gemma Terms of Use | Hugging Face, ampliamente disponible | Modelo base multimodal con documentacion y benchmarks oficiales |
| Qwen2.5 3B / 7B | 3B / 7B | 32K-128K tokens | Apache 2.0 (segun variante) | Hugging Face | Alternativa abierta con licencia permisiva y buen rendimiento en codigo |
| Llama 3.2 3B | 3B | 128K tokens | Llama 3.2 Community License | Hugging Face | Modelo pequeno con tool calling y amplia adopcion |

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, evaluacion, licencia ni idiomas, lo que impide verificar el cumplimiento legal o la calidad del ajuste.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; ademas, al derivar de Gemma 3, estaria sujeto a los terminos de Google, que el autor no ha hecho constar.
- Riesgo elevado de alucinacion: sin benchmarks ni evaluacion publica, no hay evidencia de que el fine-tuning haya mejorado la fidelidad factual del modelo base.
- Posible sobreajuste al dominio: si el ajuste se realizo con un corpus pequeno de ambito gubernamental, el modelo podria degradar su rendimiento general y en otros idiomas.
- Sin garantias de soporte multimodal: aunque Gemma 3 4B es multimodal, no se confirma que este derivado conserve la torre de vision.
- 0 descargas y 1 like: no hay comunidad que haya validado el modelo; tratarlo como experimental.
- No apto para decisiones automatizadas de caracter legal o administrativo sin supervision humana, dado el riesgo de errores y la falta de trazabilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isuruwijesiri/ensita-gemma3-4b-government
- Modelo base Gemma 3 (Google): https://huggingface.co/google/gemma-3-4b-it
- Documentacion de Gemma 3: https://ai.google.dev/gemma/docs
