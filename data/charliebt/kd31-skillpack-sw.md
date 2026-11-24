# CharlieBT/kd31-skillpack-sw

## Resumen

CharlieBT/kd31-skillpack-sw es un ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, publicado en Hugging Face con licencia Apache 2.0 y acceso restringido (gated). El modelo se distribuye en formato safetensors para la librería transformers y está etiquetado con el pipeline de text-classification, aunque sus tags incluyen también image-text-to-text y la arquitectura gemma4, lo que sugiere capacidades multimodales heredadas del modelo base. Con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones), se sitúa en la categoría de modelos densos de gran tamano orientados a tareas de decision y clasificacion.

El nombre "skillpack-sw" y la referencia a "skillpack" en el identificador apuntan a un paquete de habilidades o adaptacion especializada, probablemente orientada a tareas de clasificacion y toma de decisiones estructuradas. El modelo base, karpo-decision-31B, parece estar disenado para razonamiento y decision, y este fine-tune anadiria una capa de especializacion sobre esas capacidades. La ausencia de descargas y likes en el momento de la consulta indica que es una publicacion muy reciente y practicamente sin validacion comunitaria.

La relevancia de este modelo es limitada pero concreta: se trata de un fine-tune de 31B con licencia permisiva y acceso controlado, lo que puede interesar a equipos que ya trabajan con el modelo base y quieren evaluar una variante especializada. No obstante, la falta de documentacion publica sobre datos de entrenamiento, benchmarks y composicion del dataset hace que cualquier evaluacion seria requiera pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun tags); transformer denso, no se confirma MoE |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Pipeline declarado | text-classification |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repo | 62,6 GB |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un fine-tune de MachinePulseAI/karpo-decision-31B, con arquitectura etiquetada como gemma4 y un total de 31.273.088.876 parametros en safetensors. No se especifica si la arquitectura es densa o de mezcla de expertos (MoE), ni se detalla la composicion del dataset de ajuste, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

El tag image-text-to-text sugiere que el modelo base o el propio fine-tune incorporan un encoder visual y capacidades multimodales, pero no hay confirmacion en la informacion proporcionada. El pipeline declarado (text-classification) y el nombre "skillpack" apuntan a un uso orientado a clasificacion y seleccion de habilidades o decisiones, aunque se desconoce el mecanismo exacto de entrenamiento. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo indicado seria especulativa.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, por lo que el uso principal previsto es la asignacion de etiquetas o categorias a entradas textuales.
- Posible procesamiento image-text-to-text: el tag correspondiente sugiere entrada multimodal (imagen y texto), aunque no se detalla la implementacion ni el formato de entrada esperado.
- Razonamiento y decision: heredado del modelo base karpo-decision-31B, orientado a tareas de decision estructurada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas en la ficha del modelo.
- Modo thinking, vision o audio: no confirmado; solo el tag image-text-to-text sugiere vision, sin detalles.

## Casos de uso

- Clasificacion de documentos en pipelines de back-office: el modelo puede asignar categorias a textos largos (contratos, incidencias, correos) usando el pipeline de text-classification, adecuado por su tamano de 31B para capturar matices semanticos que modelos mas pequenos pierden.
- Enrutamiento de tickets de soporte: clasificar la consulta entrante en categorias operativas (facturacion, tecnico, reclamacion) antes de derivarla al equipo correspondiente, aprovechando la especializacion del fine-tune en tareas de decision.
- Moderacion de contenido asistida: etiquetar textos como aptos o no aptos segun politicas internas, con la salvedad de que requiere validacion humana por el riesgo de alucinacion y sesgo.
- Extraccion de intencion en asistentes conversacionales: determinar la intencion del usuario en un turno de dialogo para disparar la accion adecuada en un sistema de agentes, si el modelo soporta salidas estructuradas (no confirmado).
- Clasificacion multimodal de publicaciones: si se confirma la capacidad image-text-to-text, etiquetar publicaciones con imagen y texto (por ejemplo, en redes sociales o marketplaces) en categorias de producto o riesgo.
- Evaluacion comparativa de fine-tunes sobre karpo-decision-31B: servir como variante especializada para equipos que ya usan el modelo base y quieren medir la mejora en tareas de clasificacion concretas mediante pruebas A/B internas.
- Filtrado previo en pipelines RAG: clasificar fragmentos recuperados por relevancia tematica antes de pasarlos a un modelo generador, reduciendo ruido en la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,5 GB solo para pesos (31,3B x 2 bytes), mas overhead de activaciones y cache KV; se recomienda un minimo de 80 GB para contexto corto.
- VRAM estimada en cuantizacion 8 bits: en torno a 31-35 GB, viable en una A100 40GB o H100 80GB con margen limitado.
- VRAM estimada en cuantizacion 4 bits: en torno a 16-20 GB, potencialmente viable en RTX 4090 (24 GB) o RTX 3090, aunque no se han publicado pesos cuantizados en el repo.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples GPU consumer para reparto por tensor parallelism.
- Cabe en GPU consumer: solo con cuantizacion agresiva (4 bits) y contexto reducido; no cabe en FP16 en ninguna GPU consumer actual.
- Opciones de despliegue: transformers (formato nativo del repo); vLLM, TGI, llama.cpp u Ollama requeririan conversion o soporte especifico de la arquitectura gemma4, no confirmado en la informacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-skillpack-sw | ~31,3B | no disponible | apache-2.0 | gated | Fine-tune de karpo-decision-31B, pipeline text-classification |
| MachinePulseAI/karpo-decision-31B | ~31B (presumible) | no disponible | no disponible | no disponible | Modelo base del que deriva este fine-tune |
| Gemma 2 27B (referencia de familia) | 27B | 8K (tipico) | Gemma license | abierto | Alternativa densa de tamano similar, pero sin relacion directa confirmada con gemma4 |

La comparativa con alternativas de la misma categoria es limitada porque no se dispone de datos de rendimiento ni de contexto del modelo evaluado. No se identifican en la informacion proporcionada otros fine-tunes comparables de karpo-decision-31B.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad; cualquier uso en produccion requiere evaluacion propia.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion de descargas en CI/CD.
- Documentacion minima: no se detallan datos de entrenamiento, idiomas, contexto ni composicion del dataset, lo que impide auditar sesgos de forma rigurosa.
- Riesgo de alucinacion: inherente a modelos de este tamano; en tareas de clasificacion puede producir etiquetas plausibles pero incorrectas, especialmente en dominios especializados.
- Sesgos conocidos: no disponibles; al no documentarse el dataset de ajuste, no se puede descartar la herencia de sesgos del modelo base.
- Limitaciones de idioma: no se especifican idiomas soportados; el sufijo "sw" podria sugerir un idioma o dominio concreto, pero no se confirma.
- Compatibilidad de despliegue incierta: la arquitectura gemma4 puede no estar soportada aun por vLLM, llama.cpp u Ollama; verificar antes de disenar la infraestructura.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de garantias del autor hacen recomendable una revision legal propia antes de integrarlo en productos.
- Modelo practicamente sin validacion comunitaria (0 descargas, 0 likes en la fecha de consulta): no hay retroalimentacion de terceros sobre su comportamiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-sw
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
