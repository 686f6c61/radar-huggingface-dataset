# AI-KSK/ksk-video-274-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-274-comfyui-workflows` no es un modelo de IA en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI construidos alrededor del ecosistema de Krea 2. Lo publica el usuario AI-KSK y contiene cinco grafos JSON exportados directamente desde ComfyUI, junto con tarjetas promocionales de portada. El repositorio resuelve un problema de reproducibilidad: empaqueta pipelines de transferencia de estilo, edicion con referencias multiples y acabado de detalle en 4K que de otro modo solo existirian como capturas o tutoriales en video.

Los grafos cubren cinco tareas diferenciadas: transferencia de estilo con referencia unica (25 nodos), transferencia de estilo con doble referencia (18 nodos), edicion de imagen con multiples referencias (37 nodos), generacion de storyboards en cuadricula mediante JSON (12 nodos) y un motor de acabado de detalle PID x Krea2 orientado a 4K (33 nodos). El repositorio tiene un tamano de 0,0 GB, lo que confirma que solo contiene archivos JSON e imagenes, sin pesos de modelo.

Es relevante para desarrolladores que trabajan con generacion y edicion de imagen en ComfyUI, ya que ofrece grafos reales y exportados que pueden servir como punto de partida reproducible. No obstante, la ausencia de pesos, de model card tecnica y de benchmarks limita su uso como referencia de rendimiento: es material de orquestacion, no un modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows, no de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio contiene JSON de ComfyUI e imagenes PNG; no incluye pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una coleccion de grafos de ComfyUI. Cada archivo JSON describe un pipeline de nodos que orquesta modelos externos del ecosistema Krea 2 y un conjunto de decodificacion y condicionamiento PID. Los grafos incluidos son: transferencia de estilo con referencia unica (25 nodos), transferencia de estilo con doble referencia (18 nodos), edicion con multiples referencias (37 nodos), storyboard en cuadricula a partir de JSON (12 nodos) y acabado de detalle PID x Krea2 para 4K (33 nodos). El recuento de nodos procede de los propios JSON incluidos.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, porque el repositorio no entrena ningun modelo. La unica indicacion tecnica relevante es que los grafos dependen de nodos personalizados de la comunidad de Krea 2 y de un conjunto de decodificador y condicionamiento PID, que deben instalarse antes de abrir los workflows. Los ajustes de sampler incluidos en los JSON son los valores originales del episodio de origen, no una recomendacion validada.

## Capacidades

- Transferencia de estilo a partir de una sola imagen de referencia, mediante un grafo de 25 nodos.
- Transferencia de estilo con dos referencias, pensada para casos en los que el layout se desvia con una sola referencia (18 nodos).
- Edicion de imagen con multiples referencias, orientada a ediciones que deben preservar el sujeto (37 nodos).
- Generacion de storyboards en cuadricula a partir de una especificacion JSON (12 nodos).
- Acabado de detalle y realce en 4K mediante el motor PID x Krea2 (33 nodos).
- Orquestacion de pipelines de imagen en ComfyUI con nodos personalizados de la comunidad.
- No se documentan capacidades de texto, razonamiento, codigo, matematicas, tool calling, agentes ni audio.

## Casos de uso

- Reproduccion de tutoriales de imagen: un desarrollador puede abrir los JSON en ComfyUI e instalar los nodos personalizados referenciados para replicar exactamente los pipelines mostrados en el episodio de origen, evitando reconstruir los grafos a mano.
- Transferencia de estilo en produccion grafica: el grafo de referencia unica (25 nodos) permite aplicar un estilo visual coherente a un lote de imagenes cuando se dispone de una unica imagen de referencia y no se requiere preservar con precision el layout original.
- Restyling con control de composicion: el grafo de doble referencia (18 nodos) es adecuado cuando el resultado con una sola referencia deriva en cambios de layout no deseados y se necesita una segunda imagen que ancle la estructura.
- Edicion con preservacion de sujeto: el grafo de multiples referencias (37 nodos) sirve para tareas en las que el sujeto debe mantenerse reconocible mientras se modifica el entorno, el vestuario o la iluminacion.
- Previsualizacion de secuencias y storyboards: el grafo JSON de cuadricula (12 nodos) permite generar una hoja de varias tomas a partir de una especificacion estructurada, util para preproduccion de video o comic.
- Acabado final de imagen en alta resolucion: el motor PID x Krea2 (33 nodos) se emplea como ultima etapa para realzar detalle en imagenes destinadas a impresion o visualizacion 4K.
- Base para pipelines propios: los JSON sirven como plantilla editable para construir variantes con otros modelos del ecosistema Krea 2 dentro de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones cuantitativas, metricas de calidad de imagen ni comparaciones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente de los modelos del ecosistema Krea 2 y del decodificador PID que se carguen en cada grafo, no del repositorio en si.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. Al no documentarse los modelos subyacentes ni sus requisitos, no puede determinarse.
- Opciones de despliegue: ComfyUI es el entorno de ejecucion previsto. Los grafos requieren instalar los nodos personalizados de Krea 2 y el conjunto PID referenciados internamente en los JSON. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipelines.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada repositorios comparables de workflows de ComfyUI para el ecosistema Krea 2, ni se dispone de datos de parametros, contexto o rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, checkpoints ni artefactos de inferencia; solo grafos JSON e imagenes de portada.
- Dependencia de nodos externos: los grafos no funcionan sin instalar los nodos personalizados de Krea 2 y el conjunto PID referenciados dentro de los JSON.
- Ajustes de sampler no validados: el autor advierte explicitamente que los valores incluidos son los del episodio de origen y no una recomendacion para copiar sin criterio.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial de los workflows queda sujeto a la licencia concreta del modelo y los nodos subyacentes, no a la de este repositorio.
- Idioma: los metadatos declaran solo ingles, y las tarjetas de portada son artefactos promocionales originales en chino; no hay localizacion en castellano.
- Ausencia de benchmarks y de model card tecnica: no hay datos de calidad, latencia ni consumo de VRAM, lo que impide evaluar el rendimiento antes de desplegar.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento o validacion por parte de la comunidad.
- Riesgo de deriva de layout en transferencia de estilo con una sola referencia, segun reconoce el propio autor al recomendar el grafo de doble referencia en esos casos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-274-comfyui-workflows
- Style (single), RunningHub: https://www.runninghub.ai/post/2073675891854630914/?inviteCode=rh-v1111
- Style (dual), RunningHub: https://www.runninghub.ai/post/2073700191701655554/?inviteCode=rh-v1111
- PID 4K, RunningHub: https://www.runninghub.ai/post/2073373288369319937/?inviteCode=rh-v1111
- JSON grid, RunningHub: https://www.runninghub.ai/post/2073304573829275649/?inviteCode=rh-v1111
- Multi-image edit, RunningHub: https://www.runninghub.ai/post/2073314422151540738/?inviteCode=rh-v1111
- Video en YouTube: https://www.youtube.com/watch?v=r-5DdHyyFZM
- Video en Bilibili: https://www.bilibili.com/video/BV1U1TS6gEVe
