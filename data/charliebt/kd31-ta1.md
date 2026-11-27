# CharlieBT/kd31-ta1

## Resumen

CharlieBT/kd31-ta1 es un modelo de 31.273.088.876 parametros (aproximadamente 31,3 mil millones) publicado en Hugging Face por el usuario CharlieBT. Se trata de un fine-tune del modelo danyloooah/reax-g2-soup2, del que hereda la arquitectura y los pesos base. La model card lo etiqueta con el pipeline de text-classification, aunque tambien aparece la etiqueta image-text-to-text y el tag de arquitectura gemma4, lo que sugiere un modelo multimodal derivado de la familia Gemma.

El modelo se distribuye en formato safetensors dentro de la libreria transformers, con un tamano de repositorio de 62,6 GB, coherente con pesos en precision de 16 bits para 31,3 mil millones de parametros. La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face antes de poder descargarlo.

La relevancia de esta ficha es limitada por la escasez de documentacion publica: no hay model card detallada, no se han publicado resultados de benchmarks y el modelo no registra descargas ni likes en el momento de la consulta. Aun asi, resulta de interes para quienes siguen la estela de fine-tunes sobre la familia Gemma y para evaluar variantes de clasificacion de texto construidas sobre modelos multimodales de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `gemma4`; detalles no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification (tambien etiquetado image-text-to-text) |
| Modelo base | danyloooah/reax-g2-soup2 |
| Tipo de ajuste | fine-tune (tag `base_model:finetune`) |
| Tamano del repositorio | 62,6 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `gemma4`, que apunta a la familia Gemma de Google. Con 31,3 mil millones de parametros y un repositorio de 62,6 GB, los pesos parecen almacenarse en bfloat16 o float16, lo que encaja con un transformer denso de ese orden de magnitud. No se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones, ni se documenta la ventana de contexto.

Respecto al entrenamiento, solo se sabe que es un fine-tune del modelo danyloooah/reax-g2-soup2, cuyo nombre sugiere una fusion de modelos (model soup) previa. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni la tarea exacta de clasificacion para la que se ajusto. La etiqueta image-text-to-text heredada del modelo base indica que la arquitectura subyacente es multimodal, aunque el pipeline declarado sea de clasificacion de texto.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, por lo que el modelo esta orientado a tareas de etiquetado de secuencias.
- Procesamiento de entrada multimodal: la etiqueta image-text-to-text sugiere capacidad de procesar imagenes junto con texto, heredada del modelo base.
- Generacion de texto: al derivar de un modelo de lenguaje de 31,3 B de parametros, es plausible que conserve capacidades generativas, aunque no se documentan explicitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece vacio en Hugging Face).
- Capacidades especiales (thinking mode, vision, audio): solo se puede confirmar la posible componente de vision por la etiqueta image-text-to-text; el resto no esta documentado.

## Casos de uso

- Clasificacion de documentos a escala: al estar declarado como text-classification, puede emplearse para etiquetar grandes volumenes de texto (categoria, sentimiento, toxicidad) en pipelines batch, aprovechando su tamano para capturar matices que modelos mas pequenos pierden.
- Moderacion de contenido multimodal: si conserva la capacidad image-text-to-text del modelo base, podria clasificar publicaciones que combinan imagen y texto, como en foros o redes sociales.
- Enrutamiento de tickets de soporte: clasificar consultas entrantes por departamento o urgencia antes de derivarlas a un agente humano o a un sistema automatizado.
- Analisis de resenas de producto: extraer la polaridad y las tematicas dominantes de resenas que incluyen texto e imagenes del producto.
- Investigacion academica sobre fine-tuning: servir como punto de partida para experimentos de ajuste sobre la familia Gemma en tareas de clasificacion, dado que es un fine-tune abierto con licencia Apache 2.0.
- Etiquetado de datasets: asistir en la anotacion automatica de corpus para entrenar modelos mas pequenos de produccion, usando este modelo como anotador de referencia.
- Clasificacion de imagenes medicas o tecnicas acompanadas de informes: si la componente de vision funciona, podria clasificar pares imagen-texto en dominios especializados, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/float16: aproximadamente 62-64 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 80 GB.
- Cuantizacion a 8 bits: alrededor de 31-32 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 (24 GB cada una) con reparto de capas.
- Cuantizacion a 4 bits: alrededor de 16-18 GB, lo que permitiria ejecutarlo en una unica RTX 4090 o RTX 3090, siempre que se genere una version GGUF/AWQ (no publicada oficialmente).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia sin cuantizar; A100 40 GB o configuraciones multi-GPU consumer para 8 bits.
- Cabe en GPU consumer: solo con cuantizacion agresiva (4 bits) y en GPUs de 24 GB como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: transformers con accelerate para reparto multi-GPU; vLLM o TGI si se confirma compatibilidad con la arquitectura gemma4; llama.cpp/Ollama requeririan conversion a GGUF, no disponible de forma oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-ta1 | 31,3 B | no disponible | Apache 2.0 | gated | Fine-tune de clasificacion sobre reax-g2-soup2 (gemma4) |
| danyloooah/reax-g2-soup2 | no disponible | no disponible | no disponible | no disponible | Modelo base declarado; fusion de modelos |
| Gemma 2 27B (referencia de familia) | 27 B | 8K (segun version) | Gemma license | abierto | Alternativa de tamano similar de la misma familia; datos oficiales publicados |
| Qwen2.5 32B (referencia de tamano) | 32,5 B | 128K | Apache 2.0 | abierto | Alternativa densa de tamano comparable con benchmarks publicos |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado ni de su modelo base, por lo que la eleccion frente a alternativas solo puede basarse en tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparametros ni evaluacion, lo que dificulta reproducir o auditar el modelo.
- Riesgo de alucinacion: si conserva capacidades generativas, no hay evaluacion que cuantifique su fiabilidad.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no es posible estimar sesgos demograficos, linguisticos o culturales.
- Idiomas no declarados: se desconoce que lenguas cubre con calidad, lo que desaconseja su uso en produccion multilingue sin validacion previa.
- Licencia Apache 2.0 declarada, pero el acceso es gated: es necesario aceptar condiciones en Hugging Face; conviene verificar que las condiciones del modelo base (reax-g2-soup2) no impongan restricciones adicionales incompatibles con uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Sin descargas ni likes: el modelo no tiene traccion en la comunidad, lo que reduce la probabilidad de encontrar soporte, issues resueltos o conversiones a GGUF.
- Compatibilidad de despliegue incierta: la arquitectura gemma4 puede no estar soportada aun en todas las versiones de vLLM, TGI o llama.cpp.
- Uso en produccion desaconsejado sin evaluacion propia: al tratarse de un fine-tune sin documentacion, se recomienda validar en un conjunto de test interno antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieBT/kd31-ta1
- Modelo base: https://huggingface.co/danyloooah/reax-g2-soup2
