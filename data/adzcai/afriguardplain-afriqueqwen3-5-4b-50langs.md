# adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs

## Resumen

AfriGuardPlain-AfriqueQwen3.5-4B-50Langs es un ajuste fino del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs, publicado por el usuario adzcai, orientado a la moderacion y seguridad de contenido en lenguas africanas. Se trata de un modelo de generacion de texto de aproximadamente 4,54 mil millones de parametros que ha recibido un entrenamiento supervisado completo (full fine-tuning) sobre el conjunto de datos adzcai/AfriGuard-plain. La particularidad de esta variante "Plain" es que el modelo no sigue instrucciones de sistema de seguridad: aprende a responder o rechazar de forma directa, sin emitir etiquetas de seguridad ni etiquetas estructuradas como `<safety>`, `<category>` o `<response>`.

El modelo parte del trabajo AfriGuard, un esfuerzo por extender la seguridad de los grandes modelos de lenguaje a idiomas africanos habitualmente infrarrepresentados. Frente a la version con instrucciones (israel/AfriGuard-AfriqueQwen3.5-4B-50Langs), esta variante simplifica el formato de salida, lo que la hace util cuando se integra como componente de un sistema mayor donde el etiquetado estructurado no es necesario o interfiere con el flujo de generacion.

La relevancia actual del modelo radica en su enfoque multilingue: cubre once idiomas (ingles y diez lenguas africanas) con una unica licencia permisiva Creative Commons Attribution 4.0, lo que facilita su uso en investigacion y en desarrollos con atribucion. El repositorio ocupa 9,1 GB y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5 (tag `qwen3_5`); no se detalla en la model card |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | en, am, ha, ig, om, sn, sw, tw, wo, yo, zu (ingles, amharico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba, zulu) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Modelo base | McGill-NLP/AfriqueQwen3.5-4B-50Langs |
| Dataset de ajuste | adzcai/AfriGuard-plain |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base McGill-NLP/AfriqueQwen3.5-4B-50Langs, identificada en las etiquetas de HuggingFace como `qwen3_5`. La model card no especifica detalles sobre el tipo de mecanismo de atencion, el tokenizador, la composicion exacta del dataset de preentrenamiento ni si hubo fases de RLHF o DPO. Tampoco se documenta la longitud de contexto nativa. Es destacable que, entre las etiquetas del repositorio, figura tambien `image-text-to-text`, lo que apunta a que el modelo base podria contar con capacidades multimodales; sin embargo, el ajuste aqui descrito y su pipeline declarado son exclusivamente de generacion de texto, sin que la model card confirme funcionamiento con imagenes.

El ajuste fino se realizo con entrenamiento completo (no LoRA) usando DeepSpeed ZeRO-3, segun el archivo de configuracion referenciado `examples/train_full/afriguard_plain_afriqueqwen3.5-4b-50langs_full_sft.yaml` del repositorio AfriGuard-model sobre LlamaFactory. Los hiperparametros documentados son: learning rate de 1e-05, tamano de batch de entrenamiento 1, batch de evaluacion 8, acumulacion de gradientes 2 (batch total efectivo 2), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 %, una sola epoca y semilla 42. Se empleo la plantilla de chat `qwen3_nothink` y el calculo de la perdida se aplico unicamente sobre la respuesta. El dataset afriGuard-plain, version sin instrucciones de prompt de israel/AfriGuard-inst, contiene ejemplos formados por el prompt del usuario y una respuesta plana (respuesta util para prompts seguros, rechazo breve para los inseguros), sin instrucciones de sistema de seguridad ni etiquetas.

## Capacidades

- Generacion de texto conversacional en once idiomas, con especial atencion a lenguas africanas (amharico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba y zulu) ademas del ingles.
- Moderacion de contenido y seguridad: el modelo distingue prompts seguros de inseguros y ofrece una respuesta util o un rechazo breve segun el caso.
- Salida directa sin etiquetado de seguridad: no emite etiquetas `<safety>`, `<category>` ni `<response>`, lo que simplifica su integracion cuando solo se necesita la respuesta final.
- Capacidad de rechazo explicito ante peticiones consideradas no seguras, aprendida durante el ajuste sobre AfriGuard-plain.
- Soporte de conversaciones multi-turno en el formato de chat de la familia Qwen con la plantilla `qwen3_nothink`.
- No se documenta soporte de tool calling, function calling, agentes, modo de razonamiento explicito (thinking), vision ni audio en la informacion disponible.

## Casos de uso

- Moderacion de contenido en plataformas africanas: el modelo puede clasificar de facto prompts en suajili, hausa o yoruba emitiendo una respuesta o un rechazo, y actuar como filtro previo en comunidades donde escasean modelos de seguridad en lengua local.
- Filtrado de entrada en asistentes conversacionales: integrado antes de un modelo generativo principal, permite descartar peticiones no seguras en los idiomas cubiertos y reducir la exposicion del sistema.
- Investigacion en seguridad multilingue: sirve como referencia para estudiar como se comporta el rechazo en lenguas de bajos recursos frente a variantes con etiquetado estructurado como israel/AfriGuard-AfriqueQwen3.5-4B-50Langs.
- Chatbot de atencion ciudadana en Africa subsahariana: al dominar diez lenguas locales, puede gestionar interacciones basicas de informacion en contextos administrativos o sanitarios sin depender de traduccion al ingles.
- Generacion de respuestas asistenciales en educacion: como tutor de bajo coste que responde en la lengua materna del estudiante y evita contenido inapropiado en un unico paso.
- Componente en pipelines con LlamaFactory: su configuracion de entrenamiento esta publicada, lo que facilita reproducir, ampliar o especializar el ajuste sobre nuevos dominios o idiomas.
- Evaluacion comparativa de seguridad en investigacion academica: al compartir base y hiperparametros con su contraparte instruccional, permite aislar el efecto del formato de entrenamiento en las tasas de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa bf16/fp16 el modelo ocupa aproximadamente 9 GB de pesos, a los que hay que sumar el coste de activaciones y cache KV; en cuantizacion de 8 bits ronda los 4,5-5 GB y en 4 bits aproximadamente 2,5-3 GB (estimaciones a partir de los 4,54 B de parametros, no confirmadas por el autor).
- GPU recomendadas: una A100 o H100 (40-80 GB) permite ejecutar el modelo sin cuantizar con margen amplio para lotes grandes; una L40S o A10G de 24 GB es suficiente en bf16 para lotes moderados.
- GPU de consumo: cabe en bf16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB); con cuantizacion de 8 o 4 bits es viable en tarjetas de 12 GB como la RTX 3060 o la RTX 4070, y en 4 bits podria ajustarse en 8 GB con contexto reducido.
- Opciones de despliegue: al publicarse solo safetensors, el modelo puede servirse con transformers, vLLM o TGI; para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma principal | Salida de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs | ~4,54 B | 11 idiomas (en + 10 africanas) | Respuesta/rechazo directo, sin etiquetas | cc-by-4.0 | HuggingFace, safetensors |
| israel/AfriGuard-AfriqueQwen3.5-4B-50Langs | ~4,54 B | 11 idiomas (en + 10 africanas) | Con etiquetas `<safety>`/`<category>`/`<response>` | no disponible | HuggingFace |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs | ~4,54 B | 50 idiomas (segun nombre) | Sin ajuste de seguridad especifico | no disponible | HuggingFace |

No se dispone de datos de rendimiento que permitan comparar la calidad de estos modelos entre si.

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta una evaluacion de sesgos; al estar ajustado sobre un dataset de seguridad concreto, puede heredar los sesgos de los datos de entrenamiento y del modelo base.
- Riesgo de alucinacion: es un modelo de 4,54 B ajustado para responder o rechazar; puede generar afirmaciones incorrectas en dominios factuales, especialmente en las lenguas africanas de menores recursos.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada; fuera de los once idiomas declarados no hay garantia de comportamiento adecuado, y el rendimiento en cada lengua africana puede ser desigual segun su representacion en el dataset.
- Comportamiento de rechazo: al no emitir etiquetas de seguridad, no permite auditar facilmente por que se ha rechazado una peticion; el rechazo es texto plano y puede ser inconsistente.
- Restricciones de licencia: la licencia cc-by-4.0 permite uso comercial siempre que se atribuya correctamente; conviene revisar tambien la licencia del modelo base, no detallada en la informacion proporcionada.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 "likes", es muy reciente y no cuenta con validacion externa publica; no se recomienda su uso en produccion sin una evaluacion propia.
- Se desconoce si conserva las supuestas capacidades multimodales del base: el ajuste y el pipeline declarado son solo de texto.
- La configuracion indica `distributed_type: multi-GPU` pero tambien "1 GPU"; no queda claro el hardware exacto de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adzcai/AfriGuardPlain-AfriqueQwen3.5-4B-50Langs
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs
- Contraparte instruccional: https://huggingface.co/israel/AfriGuard-AfriqueQwen3.5-4B-50Langs
- Dataset de ajuste: https://huggingface.co/datasets/adzcai/AfriGuard-plain
- Dataset con instrucciones: https://huggingface.co/datasets/israel/AfriGuard-inst
