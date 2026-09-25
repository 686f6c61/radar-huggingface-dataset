# adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1

## Resumen

AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1 es un ajuste fino de seguridad (safety fine-tune) del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, desarrollado por el usuario adzcai. Se trata de un transformer denso de aproximadamente 4.540 millones de parametros (4,539,265,536 segun los pesos safetensors) orientado a la generacion de texto conversacional y a la moderacion automatica en lenguas africanas. El problema que aborda es la falta de modelos de seguridad que funcionen de forma nativa en idiomas como el amharico, hausa, igbo, oromo, shona, swahili, twi, wolof, yoruba y zulu, un nicho poco cubierto por los sistemas de moderacion comerciales.

La innovacion principal no esta en la arquitectura, sino en el enfoque de alineacion: en lugar de emitir etiquetas de seguridad estructuradas (`<safety>`, `<category>`, `<response>`), el modelo ha sido entrenado con el dataset adzcai/AfriGuard-plain, la version "plain" (sin prompt de instrucciones) de israel/AfriGuard-inst. Cada ejemplo de entrenamiento contiene unicamente el prompt del usuario y una respuesta directa: una respuesta util si la peticion es segura, o una negativa breve si es insegura. El resultado es un modelo que responde o rechaza de forma natural, sin exponer etiquetas internas de clasificacion.

Es relevante porque combina tres elementos poco frecuentes: cobertura multilingue africana (11 idiomas declarados), un proposito especifico de seguridad y un formato de salida simplificado que facilita su integracion en pipelines de moderacion ya existentes. El modelo se distribuye bajo licencia CC-BY-4.0 y en formato safetensors, compatible con la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors a precision completa; sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | en, am, ha, ig, om, sn, sw, tw, wo, yo, zu |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modelo base | McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 |
| Pipeline | text-generation |
| Libreria | transformers (probado con Transformers 5.8.0, PyTorch 2.14.0+cu130) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base AfriqueQwen3.5-4B-50Langs-Instruct-v1, un transformer denso de ~4,5B parametros de la familia Qwen3.5 (tag `qwen3_5` en HuggingFace). No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni sobre si emplea alguna variante de atencion (GQA, sliding window) o si soporta modo "thinking". El tag `image-text-to-text` aparece en los metadatos de la model card, pero el pipeline declarado es `text-generation` y no se documenta ninguna capacidad de vision, por lo que no se puede confirmar ese extremo.

El ajuste fino se realizo con full fine-tuning (no LoRA) empleando DeepSpeed ZeRO-3 sobre el dataset adzcai/AfriGuard-plain, la variante sin prompt de instrucciones de israel/AfriGuard-inst. La configuracion de entrenamiento fue de 1 epoca, con un learning rate de 1e-5, scheduler coseno, warmup del 10%, batch size de entrenamiento de 1, gradient accumulation de 2 pasos (batch efectivo de 2), optimizador AdamW Torch Fused (betas 0,9/0,999, epsilon 1e-8), seed 42 y perdida calculada unicamente sobre la respuesta (loss on response only). Se empleo la plantilla de chat del modelo base y un unico epoch de entrenamiento. El framework fue LlamaFactory. La seccion de resultados de entrenamiento en la model card aparece vacia, por lo que no se publican metricas de evaluacion.

La innovacion relevante es de planteamiento de datos: al eliminar etiquetas estructuradas de seguridad y el system prompt de moderacion, el modelo aprende a producir directamente una respuesta util o una negativa concisa. Esto reduce la friccion de integracion (no hay que parsear etiquetas) pero tambien elimina la posibilidad de auditar el razonamiento de seguridad del modelo a partir de su salida.

## Capacidades

- Generacion de texto conversacional multi-turno en los 11 idiomas declarados.
- Moderacion de contenido implicita: responde a peticiones seguras y rechaza brevemente las inseguras, sin emitir etiqueta de seguridad.
- Generacion de texto en ingles y en lenguas africanas de cobertura baja (am, ha, ig, om, sn, sw, tw, wo, yo, zu).
- Respuesta directa "plana": la salida es la respuesta o la negativa, sin estructura de etiquetas, lo que simplifica el parseo.
- Capacidad de instrucciones heredada del modelo base Instruct (comprension y seguimiento de prompts conversacionales).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo de razonamiento explicito ("thinking mode"): no disponible (no documentado).
- Vision, audio u otras modalidades: no disponible (no documentado; el tag `image-text-to-text` no se confirma en la documentacion).

## Casos de uso

- Moderacion automatica de contenido en plataformas africanas: el modelo puede clasificar implicitamente un mensaje respondiendo o rechazando, y su salida plana se integra directamente en un pipeline de filtrado sin necesidad de parsear etiquetas de seguridad.
- Moderacion en redes sociales y foros en swahili, hausa o yoruba: idiomas con millones de hablantes pero con escasa cobertura en herramientas de safety comerciales.
- Filtrado de prompts en asistentes conversacionales dirigidos a usuarios africanos: el modelo puede colocarse como primera capa de defensa para bloquear peticiones daninas antes de llegar a un modelo mayor.
- Aplicaciones de atencion al cliente en lenguas locales: al heredar la capacidad Instruct del modelo base, puede gestionar conversaciones de soporte en idiomas como el amharico o el zulu.
- Generacion de respuestas seguras en entornos educativos: al rechazar brevemente peticiones inapropiadas, puede emplearse en tutores o chatbots para estudiantes de habla africana.
- Investigacion en alineacion multilingue: sirve como punto de comparacion frente a su variante con etiquetas (AfriGuard-inst) para estudiar el efecto de eliminar el formato estructurado en el comportamiento de rechazo.
- Auditoria de sesgos y seguridad en idiomas de bajos recursos: util como modelo de referencia para medir tasas de falsos rechazos en lenguas africanas.
- Despliegue ligero en infraestructura limitada: con ~4,5B parametros puede ejecutarse en una sola GPU consumer (ver seccion de hardware), lo que facilita pruebas en regiones con recursos computacionales restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion "Training results" que aparece vacia, y no se proporcionan metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de seguridad o de idiomas africanos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene contar con 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3 GB de pesos.
- GPU recomendadas: NVIDIA A100, H100 o A10G para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia local en precision completa.
- GPU consumer: si cabe en RTX 4090 y RTX 3090 sin cuantizar, y en GPUs de 12 GB (RTX 3060, RTX 4070) con cuantizacion de 8 bits; en GPUs de 8 GB requeriria cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, y cualquier runtime compatible con safetensors. llama.cpp y Ollama requeririan convertir primero los pesos a GGUF, ya que el repositorio no incluye versiones GGUF.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1 | ~4,54B | no disponible | cc-by-4.0 | safetensors | Safety fine-tune, salida plana sin etiquetas |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 (modelo base) | (mismo orden, ~4B) | no disponible | no disponible | safetensors | Modelo Instruct multilingue africano, sin fine-tune de safety |
| israel/AfriGuard-inst (dataset origen) | no aplica (dataset) | no aplica | no disponible | no aplica | Dataset de safety con etiquetas estructuradas |

No se dispone en la informacion proporcionada de resultados de rendimiento que permitan una comparacion cuantitativa entre estos modelos. Las diferencias conocidas se limitan al enfoque de datos (salida plana frente a salida con etiquetas) y a la relacion de derivacion (fine-tune del modelo McGill-NLP).

## Limitaciones y advertencias

- Modelo entrenado con 1 sola epoca sobre un dataset especifico de seguridad; el grado de robustez frente a ataques adversariales o jailbreaks no esta documentado.
- No se publican tasas de falsos positivos ni de falsos negativos, por lo que se desconoce el equilibrio entre rechazos excesivos y fugas de contenido inseguro.
- Riesgo de alucinacion inherente a los modelos de ~4,5B parametros, no mitigado de forma especifica en el ajuste de seguridad.
- La salida no incluye etiqueta de seguridad, lo que impide auditar la categoria de riesgo desde la propia respuesta del modelo; para trazabilidad seria necesario un clasificador externo.
- Cobertura idiomatica declarada de 11 lenguas, pero sin metricas publicadas por idioma; el rendimiento en lenguas de muy bajos recursos (por ejemplo, wolof o twi) podria ser desigual.
- Longitud de contexto no documentada en la informacion disponible, lo que impide garantizar conversaciones de contexto largo.
- Licencia CC-BY-4.0: permite uso comercial y derivados, pero exige atribucion al autor y la indicacion de cambios; conviene revisar las obligaciones de atribucion en productos finales.
- El repositorio tiene pocas descargas (13) y cero "likes" en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se proporcionan versiones cuantizadas ni GGUF, lo que anade un paso de conversion para despliegues con llama.cpp u Ollama.
- El tag `image-text-to-text` presente en los metadatos no se corresponde con la documentacion, que describe solo generacion de texto; no debe asumirse capacidad de vision sin verificacion.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/adzcai/AfriGuard-plain
- Dataset original con etiquetas: https://huggingface.co/datasets/israel/AfriGuard-inst
