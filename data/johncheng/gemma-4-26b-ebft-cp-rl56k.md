# JohnCheng/gemma-4-26b-ebft-cp-rl56k

## Resumen

`JohnCheng/gemma-4-26b-ebft-cp-rl56k` es un modelo multimodal de la familia Gemma 4, publicado por el usuario JohnCheng en Hugging Face. Se trata de un fine-tuning o variante derivada de un modelo base Gemma 4 de aproximadamente 25.800 millones de parametros (25,8 B), orientado a tareas de imagen-texto-a-texto (image-text-to-text), es decir, modelos capaces de recibir imagenes y texto y generar texto como salida. El pipeline declarado en la model card es `image-text-to-text`, lo que confirma su caracter multimodal.

El nombre del repositorio incluye sufijos que sugieren un proceso de entrenamiento especifico (`ebft`, `cp`, `rl56k`), probablemente relacionados con tecnicas de fine-tuning, preferencias o refuerzo, pero no hay documentacion publica en la informacion disponible que detalle que significan exactamente ni que hiperparametros se usaron. El modelo esta etiquetado con `gemma4`, `transformers`, `safetensors` y `tensorboard`, y su acceso esta restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha es doble: por un lado, documenta una variante concreta de Gemma 4 de ~26 B con capacidad multimodal; por otro, advierte de que la informacion publica es muy escasa (0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados y sin benchmarks), lo que limita seriamente su evaluacion para produccion. Cualquier uso en entornos reales deberia partir de una validacion propia y de la aceptacion explicita de las condiciones de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 51,6 GB) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de la familia Gemma 4 con 25.805.933.872 parametros y pipeline `image-text-to-text`, lo que implica un encoder visual acoplado a un decoder de lenguaje. No se especifica el tipo exacto de atencion, el numero de capas, la dimension oculta, el vocabulario ni la estrategia de fusion multimodal (por ejemplo, proyeccion de tokens visuales o cross-attention). Tampoco se detalla si emplea atencion lineal, decodificacion especulativa u otras optimizaciones.

Respecto al entrenamiento, los sufijos del nombre (`ebft`, `cp`, `rl56k`) apuntan a un proceso de ajuste fino sobre un modelo base Gemma 4, posiblemente con etapas de preferencias o refuerzo (`rl`), pero no hay model card publica que describa el dataset, el numero de tokens, la composicion de datos, ni si se aplico RLHF, DPO o una variante propia. La presencia de `tensorboard` en los tags sugiere que el autor registro metricas de entrenamiento, pero no se han publicado resultados en la informacion disponible.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen + texto), segun el pipeline declarado `image-text-to-text`.
- Razonamiento y generacion de lenguaje natural heredados del modelo base Gemma 4 (no verificable con datos publicos).
- Procesamiento de imagenes: al ser un modelo image-text-to-text, se espera que pueda describir, responder preguntas sobre y razonar con imagenes, aunque no se detalla el soporte exacto (resolucion, numero de imagenes por prompt, etc.).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Descripcion automatica de imagenes en catalogos: el modelo puede recibir una imagen de producto y generar una descripcion textual; su tamano de ~26 B permite un equilibrio entre calidad y coste frente a modelos mucho mayores, aunque requiere validacion previa por la falta de benchmarks.
- Respuesta a preguntas sobre documentos escaneados: en un pipeline de digitalizacion, se le puede pasar la imagen de una factura o formulario y solicitar la extraccion de campos en texto; el caracter multimodal lo hace adecuado para este tipo de tareas, siempre que se valide la precision en el dominio concreto.
- Asistencia en accesibilidad: generacion de descripciones alternativas para imagenes en sitios web o aplicaciones, integrado en un servicio de inferencia con transformers.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios para detectar contenido no deseado, usando el modelo como componente de un sistema mayor con reglas posteriores.
- Prototipado de asistentes multimodales: al ser un modelo de ~26 B, puede desplegarse en una unica GPU de gama alta para experimentacion interna, lo que facilita iterar sobre prompts y flujos conversacionales antes de escalar.
- Investigacion en fine-tuning multimodal: sirve como punto de partida o referencia para estudiar variantes de ajuste fino sobre Gemma 4, dado que el autor publica pesos y logs de tensorboard.
- Generacion de codigo o matematicas a partir de capturas de pantalla: potencialmente util para transcribir ecuaciones o fragmentos de codigo desde imagenes, aunque la ausencia de benchmarks impide garantizar su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 51,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan del orden de 60-70 GB o mas segun contexto y batch.
- Cuantizacion a 8 bits: alrededor de 26 GB de pesos, lo que permite su uso en GPUs de 40-48 GB (A100 40 GB, L40S, RTX 6000 Ada) con margen limitado.
- Cuantizacion a 4 bits: alrededor de 13-15 GB de pesos, lo que lo hace viable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) para contextos moderados.
- GPUs recomendadas: A100 80 GB o H100 para BF16 y contextos largos; A100 40 GB o L40S para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta variante concreta y requeririan conversion o soporte especifico de Gemma 4.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnCheng/gemma-4-26b-ebft-cp-rl56k | ~25,8 B | no disponible | Si (image-text-to-text) | no disponible | Gated en Hugging Face |
| Gemma 3 27B (referencia de familia previa) | 27 B | 128k (segun documentacion publica de Gemma 3) | Si (variante multimodal) | Gemma Terms of Use | Publico en Hugging Face |
| Qwen2.5-VL-32B (alternativa multimodal open weights) | ~32 B | 128k (segun documentacion publica) | Si | Apache 2.0 (segun publicacion) | Publico en Hugging Face |

Nota: los datos de las filas comparativas corresponden a conocimiento general de esos modelos y no a la informacion proporcionada sobre este repositorio; se incluyen solo como referencia orientativa de categoria. No se dispone de datos de rendimiento comparativo para el modelo de esta ficha.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, hiperparametros, idiomas ni licencia, lo que impide evaluar su idoneidad para produccion.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o revisar las condiciones del acceso gated antes de cualquier despliegue.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad y a la integracion en pipelines automatizados.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni en tareas multimodales, por lo que cualquier afirmacion de calidad es especulativa.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion especifica en dominios concretos (medico, legal, financiero) no debe usarse sin supervision.
- Sesgos: no documentados; al derivar de Gemma 4, podria heredar sesgos del modelo base, pero no hay informacion que lo confirme ni cuantifique.
- Limitaciones de contexto e idioma: no disponibles; no se puede garantizar un rendimiento multilingue ni ventanas de contexto largas.
- Repositorio con 0 descargas y 0 likes: indica ausencia de validacion por parte de la comunidad; tratar como experimento de investigacion, no como artefacto listo para produccion.
- El sufijo `rl56k` sugiere un ajuste con refuerzo sobre un dataset pequeno (posiblemente 56k muestras), lo que podria implicar sobreajuste o degradacion en capacidades generales; no verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnCheng/gemma-4-26b-ebft-cp-rl56k
- Paper de referencia citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de Gemma (familia de modelos): https://ai.google.dev/gemma/docs
- TensorBoard: https://www.tensorflow.org/tensorboard
