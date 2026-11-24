# CharlieBT/kd31-skillpack-t1

## Resumen

CharlieBT/kd31-skillpack-t1 es un ajuste fino (finetune) del modelo MachinePulseAI/karpo-decision-31B, un modelo de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) distribuido en formato safetensors y con un repositorio de 62,6 GB. Lo publica el usuario CharlieBT bajo licencia Apache 2.0 y esta etiquetado en Hugging Face con el pipeline de text-classification, aunque sus tags incluyen tambien image-text-to-text y la familia arquitectonica gemma4, lo que sugiere un modelo multimodal derivado de la arquitectura Gemma. El acceso es restringido: requiere aceptar condiciones en la plataforma antes de descargar los pesos.

El modelo se presenta como un "skillpack", es decir, un paquete de habilidades especializadas construido sobre un modelo base de decision. La informacion publica disponible es muy limitada: no se documentan idiomas soportados, composicion del dataset de entrenamiento, resultados de benchmarks ni detalles del proceso de ajuste. El repositorio se creo y actualizo el 24 de noviembre de 2026, sin descargas ni likes registrados en el momento de redactar esta ficha.

Por su tamano (31B) y su naturaleza de finetune sobre un modelo de decision, resulta relevante para equipos que ya trabajen con el modelo base y quieran evaluar si este skillpack aporta mejoras en tareas de clasificacion o decision. No obstante, la ausencia de documentacion tecnica y de evaluaciones publicadas obliga a tratar cualquier uso en produccion con cautela y a validar el modelo contra el base antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia gemma4, segun tags); detalles no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del base MachinePulseAI/karpo-decision-31B, del que no se dispone de ficha tecnica en la informacion proporcionada. Los tags de Hugging Face apuntan a la familia arquitectonica gemma4 y a capacidades image-text-to-text, lo que indica que el base es probablemente un transformer multimodal con torre de vision, aunque no se confirma ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion empleado.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El nombre "skillpack-t1" sugiere un paquete de habilidades de primera iteracion, pero no se documenta que habilidades concretas se han reforzado ni con que datos. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto y clasificacion: el pipeline declarado es text-classification, por lo que el uso previsto principal es la clasificacion de entradas textuales.
- Procesamiento image-text-to-text: el tag sugiere capacidad de recibir imagenes y texto, aunque no se documenta el soporte real ni la resolucion de imagen.
- Razonamiento y decision: al derivar de un modelo base orientado a la decision (karpo-decision-31B), se espera capacidad de razonamiento estructurado, sin datos publicados que lo confirmen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo thinking, vision o audio: solo vision probable por el tag image-text-to-text; thinking y audio no disponibles.

## Casos de uso

- Clasificacion de documentos en pipelines internos: el pipeline declarado es text-classification, por lo que puede emplearse para etiquetar tickets, correos o incidencias. Requiere validacion previa contra el modelo base, ya que no hay benchmarks publicados.
- Enrutamiento de consultas en atencion al cliente: clasificar la intencion de un mensaje para derivarlo al equipo adecuado. La idoneidad depende de la longitud de contexto, que no esta documentada.
- Moderacion de contenido asistida: usar el modelo como clasificador de categorias de riesgo, con supervision humana y umbrales calibrados localmente.
- Extraccion de informacion de imagenes y texto: si la capacidad multimodal se confirma, podria procesar capturas o formularios escaneados junto a texto asociado.
- Evaluacion comparativa de finetunes: util para equipos que investiguen el efecto de skillpacks sobre el modelo base karpo-decision-31B en tareas de decision.
- Prototipado de asistentes especializados: servir como capa de clasificacion previa a un LLM generativo mayor, reduciendo coste por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 62,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un nodo con 80 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 31-35 GB, viable en una A100 40 GB o H100 80 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 16-20 GB, viable en RTX 4090 (24 GB) o RTX A6000 (48 GB), siempre que se genere una version cuantizada, que no se distribuye en el repositorio.
- GPU recomendadas: H100 80 GB, A100 80 GB para precision completa; A100 40 GB o L40S para 8 bits; RTX 4090 para 4 bits.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este checkpoint y requeririan conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CharlieBT/kd31-skillpack-t1 | 31,3B | no disponible | Apache 2.0 | Gated en Hugging Face |
| MachinePulseAI/karpo-decision-31B (base) | no disponible | no disponible | no disponible | no disponible en la informacion |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma License | Publico en Hugging Face |

La comparativa con alternativas de la misma categoria no puede completarse con rigor porque no se dispone de datos de rendimiento del modelo ni del base. La referencia a Gemma 2 27B se incluye solo como orientacion de tamano y familia, no como equivalente funcional.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican datos de entrenamiento, contexto, idiomas ni evaluaciones, lo que impide estimar su calidad real.
- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar; no es un modelo de uso inmediato.
- Riesgo de alucinacion y clasificaciones erroneas: sin benchmarks ni calibracion documentada, no se recomienda su uso autonomo en produccion sin validacion contra el base.
- Sesgos desconocidos: al no documentarse el dataset, no pueden evaluarse sesgos de genero, raza o idioma.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base karpo-decision-31B puede tener condiciones adicionales que no se detallan en la informacion disponible; conviene verificar la licencia del base antes de desplegar.
- Repositorio de 62,6 GB: requiere almacenamiento y ancho de banda considerables para descarga e inferencia.
- Sin descargas ni likes: no hay evidencia de comunidad que haya validado el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-t1
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
