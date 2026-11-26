# CharlieBT/kd31-seq-sq6

## Resumen

CharlieBT/kd31-seq-sq6 es un modelo derivado (finetune) de MachinePulseAI/karpo-decision-31B, publicado en Hugging Face por el usuario CharlieBT bajo licencia Apache 2.0. Se distribuye en formato safetensors con 31.273.088.876 parametros totales (aproximadamente 31,3 mil millones) y un repositorio de 62,6 GB, lo que es coherente con pesos en precision de 16 bits. El pipeline declarado es `text-classification`, aunque los tags incluyen `image-text-to-text` y la arquitectura base se etiqueta como `gemma4`, lo que sugiere un modelo multimodal con cabeza de clasificacion.

La relevancia de esta publicacion es limitada por su estado: cero descargas, cero likes, acceso restringido (gated) y ausencia de documentacion tecnica publica. No se dispone de model card con detalles de entrenamiento, dataset, hiperparametros ni evaluaciones. El nombre "seq-sq6" no viene explicado en la informacion disponible, por lo que no es posible determinar si hace referencia a una variante de secuencia, a una cuantizacion o a un identificador interno del autor.

Se trata, por tanto, de un artefacto de pesos sin contexto editorial. Cualquier evaluacion de sus capacidades reales requeriria acceso al repositorio y ejecucion de pruebas propias, algo que este documento no puede suplir. La ficha se limita a reflejar los metadatos disponibles y a marcar explicitamente los campos no documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de arquitectura base: gemma4) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors, sin GGUF ni AWQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Modalidades declaradas | image-text-to-text (tag), text-classification (pipeline) |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Tipo de ajuste | finetune |
| Tamano del repositorio | 62,6 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. El tag `gemma4` en Hugging Face sugiere que el modelo base MachinePulseAI/karpo-decision-31B deriva de la familia Gemma 4 de Google, lo que implicaria un transformer decoder-only, pero no se confirma en la model card ni en los metadatos. El pipeline declarado como `text-classification` junto con el tag `image-text-to-text` apunta a un modelo multimodal reutilizado para una tarea de clasificacion, aunque no se especifica si la cabeza de clasificacion es nueva, si se ha congelado el encoder o si se ha realizado un ajuste completo.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta seccion queda como no disponible.

## Capacidades

- Generacion de texto: no confirmada por la model card, aunque el modelo base y el tamano (31,3 B) son compatibles con tareas generativas.
- Clasificacion de texto: es el pipeline declarado en los metadatos del repositorio.
- Procesamiento image-text-to-text: aparece como tag, pero no se documenta el uso concreto ni el formato de entrada esperado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, vision, audio): solo el tag `image-text-to-text` sugiere vision; el resto no disponible.

## Casos de uso

Dado que no hay model card ni evaluaciones publicas, los casos de uso que se enumeran a continuacion son hipotesis razonables a partir del pipeline declarado y del tamano del modelo, no recomendaciones validadas.

- Clasificacion de documentos largos: con 31,3 B de parametros, el modelo podria emplearse para etiquetar documentos extensos si su ventana de contexto resulta suficiente; requiere verificacion empirica de la longitud de contexto real.
- Moderacion de contenido multimodal: el tag `image-text-to-text` permitiria, en principio, clasificar pares imagen-texto (por ejemplo, publicaciones en redes sociales) en categorias de riesgo, siempre que se confirme el formato de entrada.
- Enrutamiento de tickets de soporte: un modelo de 31 B puede asignar categorias a tickets entrantes con mayor matiz que clasificadores pequeños, aunque su coste por inferencia es notablemente superior.
- Etiquetado de datasets para entrenamiento: util para pre-etiquetar grandes corpus antes de una revision humana, especialmente si se despliega en lote sobre GPU.
- Analisis de sentimiento y deteccion de intencion en conversaciones: tareas clasicas de `text-classification` que el pipeline declarado cubre directamente.
- Filtrado previo en pipelines RAG: clasificar consultas o fragmentos recuperados antes de pasarlos a un modelo generativo mayor, reduciendo coste en la etapa final.

En todos los casos, la ausencia de documentacion obliga a validar el modelo contra un conjunto de test propio antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors suman 62,6 GB, lo que corresponde a aproximadamente 16 bits por parametro. En FP16 se necesitan al menos 63 GB solo para pesos, mas overhead de activaciones y cache KV. En cuantizacion de 8 bits, en torno a 32-35 GB; en 4 bits, en torno a 17-20 GB. No se han publicado versiones cuantizadas en el repositorio.
- GPU recomendadas: para FP16, una A100 80 GB o H100 80 GB permite cargar el modelo; en configuraciones multi-GPU, dos A100 40 GB o dos RTX 4090 de 24 GB con tensor parallelism. En cuantizacion 4 bits, una RTX 4090 de 24 GB o una L40S de 48 GB podrian ser suficientes, aunque no esta verificado.
- Cabe en consumer GPU: solo en cuantizacion agresiva (4 bits) y en GPUs con 24 GB o mas; en FP16 no cabe en ninguna consumer actual.
- Opciones de despliegue: vLLM, TGI y llama.cpp son opciones plausibles dado el formato safetensors, pero no se ha publicado ninguna receta de despliegue ni configuracion validada. El pipeline `text-classification` en transformers es la via mas directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base MachinePulseAI/karpo-decision-31B no cuenta con datos publicos de rendimiento en la informacion proporcionada, y el pipeline declarado no permite emparejarlo con alternativas concretas sin benchmarks. Se indica "no disponible".

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni evaluaciones, lo que impide auditar el modelo.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion y puede limitar la reproducibilidad.
- Cero descargas y cero likes: no hay evidencia de uso por parte de la comunidad ni de validacion externa.
- Riesgo de alucinacion y sesgos: desconocido, al no existir evaluaciones publicadas.
- Ambiguedad del pipeline: el tag `image-text-to-text` y el pipeline `text-classification` no son coherentes entre si sin documentacion adicional; conviene verificar el formato de entrada esperado antes de integrarlo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base MachinePulseAI/karpo-decision-31B podria tener condiciones adicionales que no se reflejan en este repositorio; conviene revisar la licencia del modelo base.
- Fecha de creacion futura (2026-11-26): el metadato de fecha es posterior a la fecha habitual de publicaciones, lo que sugiere que el repositorio puede ser un artefacto de prueba o que la fecha esta mal configurada.
- Sin garantias de produccion: no se ha validado latencia, estabilidad ni calidad en ningun escenario real.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-seq-sq6
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
