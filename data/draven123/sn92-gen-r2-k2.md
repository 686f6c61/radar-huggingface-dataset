# draven123/sn92-gen-r2-k2

## Resumen

sn92-gen-r2-k2 es un ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario draven123 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado a la toma de decisiones (decision-model) dentro del ecosistema de Bittensor, concretamente la subred 92 (SN92), segun indican sus etiquetas. El modelo conserva la arquitectura del modelo base, con 31.273.088.876 parametros totales segun los pesos en safetensors.

El modelo se distribuye con licencia Apache 2.0, aunque el acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face para poder descargarlo. La libreria declarada es transformers y el formato de pesos es safetensors, con pipeline image-text-to-text, lo que indica capacidad de procesar imagenes y texto conjuntamente.

La relevancia de este modelo es acotada: se trata de una publicacion reciente (creada el 23 de noviembre de 2026) sin descargas ni likes registrados, y la informacion publica disponible es muy limitada. No se han publicado detalles sobre el dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks, por lo que su evaluacion practica requeriria acceso directo a los pesos y a la documentacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base MachinePulseAI/karpo-decision-31B; etiqueta gemma4) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Las etiquetas de Hugging Face incluyen el termino "gemma4", lo que sugiere que el modelo base MachinePulseAI/karpo-decision-31B podria derivar de la familia Gemma, aunque no se confirma en la informacion proporcionada. El pipeline declarado es image-text-to-text, lo que implica un componente de codificacion visual ademas del modelo de lenguaje.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del ajuste fino. El modelo se presenta como un "decision-model" vinculado a Bittensor SN92, lo que sugiere un entrenamiento orientado a tareas de decision, pero no se aportan detalles sobre el proceso.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta "conversational").
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Orientacion a toma de decisiones (etiqueta "decision-model").
- Integracion con el ecosistema Bittensor SN92 (etiqueta "bittensor-sn92").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Toma de decisiones asistida en la subred 92 de Bittensor: el modelo esta etiquetado como decision-model y vinculado a SN92, por lo que su uso previsto es servir como componente de decision dentro de ese ecosistema, recibiendo entradas multimodales y emitiendo juicios o clasificaciones.
- Analisis de imagenes con contexto textual: al ser image-text-to-text, puede emplearse para tareas donde se combine una imagen con una consulta en lenguaje natural, como descripcion de contenido visual o respuesta a preguntas sobre imagenes.
- Conversacion multimodal: la etiqueta "conversational" indica que puede integrarse en interfaces de dialogo que acepten imagenes y texto, por ejemplo asistentes que interpretan capturas o documentos escaneados.
- Despliegue via endpoints compatibles: la etiqueta "endpoints_compatible" sugiere que puede servirse a traves de infraestructura de inferencia estandar de Hugging Face, lo que facilita su integracion en pipelines de produccion.
- Investigacion sobre modelos de decision multimodales: util para investigadores que quieran estudiar el comportamiento de un fine-tune de 31B orientado a decision sobre un modelo base conocido.
- Experimentacion con fine-tunes de la familia karpo-decision: sirve como punto de partida para comparar variantes de ajuste fino sobre MachinePulseAI/karpo-decision-31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 31.273 millones de parametros, la inferencia en precision completa (fp16/bf16) requeriria aproximadamente 62 GB de VRAM solo para los pesos, sin contar cache KV ni overhead. En cuantizacion de 8 bits rondaria los 31 GB y en 4 bits unos 16 GB, aunque estas cifras son estimaciones genericas y no estan confirmadas para este modelo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar GPUs de clase A100 80 GB o H100 para precision completa; GPUs consumer como RTX 4090 (24 GB) solo serian viables con cuantizacion agresiva.
- Cabe en consumer GPU: no confirmado; probablemente solo con cuantizacion de 4 bits en GPUs de 24 GB o superiores.
- Opciones de despliegue: la etiqueta "endpoints_compatible" sugiere soporte para endpoints de Hugging Face; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| draven123/sn92-gen-r2-k2 | 31.273.088.876 | no disponible | Apache 2.0 | Gated | Fine-tune de karpo-decision-31B, image-text-to-text, orientado a SN92 |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion suficiente para establecer comparaciones fiables |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de su descarga, lo que limita su uso inmediato.
- Informacion muy escasa: no se han publicado detalles sobre arquitectura interna, dataset, idiomas ni benchmarks, lo que dificulta evaluar su calidad y adecuacion.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso o evaluacion independiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay datos especificos sobre su calibracion.
- Sesgos: no disponible informacion sobre sesgos conocidos.
- Limitaciones de contexto e idioma: no disponible; los idiomas soportados no estan declarados.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero conviene verificar las condiciones del modelo base MachinePulseAI/karpo-decision-31B, cuya licencia no se detalla en la informacion proporcionada.
- Caveat para produccion: al tratarse de un fine-tune sin documentacion publica ni evaluaciones, no se recomienda su uso en produccion sin una validacion previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draven123/sn92-gen-r2-k2
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
