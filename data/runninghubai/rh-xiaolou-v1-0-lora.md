# RunningHubAI/rh-xiaolou-v1.0-lora

## Resumen

rh-xiaolou-v1.0-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI en Hugging Face. No es un modelo completo, sino un conjunto de pesos de bajo rango (218 MiB en `xiaolou_krea2.safetensors`) que se aplica sobre un modelo base identificado en la model card como "krea2". Su pipeline declarado es `image-text-to-image`, es decir, edición o generación de imágenes guiada por texto a partir de una imagen de entrada.

El modelo está orientado a su uso dentro de flujos de ComfyUI y de la plataforma RunningHub, y el propio autor lo etiqueta con las etiquetas `comfyui`, `lora` y `region:us`. Al tratarse de un LoRA, sus parámetros totales, arquitectura interna y datos de entrenamiento no vienen documentados en la ficha: la información disponible se limita al autor, el modelo base, el tipo, el tamaño del archivo y los enlaces a la plataforma.

La relevancia de esta ficha es acotada y conviene ser transparente: el repositorio no incluye licencia explícita, no declara idiomas, no aporta benchmarks ni detalles de entrenamiento, y registra 0 descargas y 0 likes en el momento de la consulta. Cualquier evaluación en producción debe partir de esas limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base "krea2"; arquitectura interna del base no disponible |
| Parametros totales | no disponible (el repositorio solo indica un archivo de pesos de 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no se documenta ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico archivo safetensors; la precision no esta documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`xiaolou_krea2.safetensors`, 218 MiB) |
| Modelo base | krea2 (segun la model card) |
| Tipo de modelo | LoRA de edicion de imagen (`image edit`) |
| Plataformas compatibles | ComfyUI / RunningHub / Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni la del modelo base. Por el tipo declarado, se trata de un LoRA (Low-Rank Adaptation): un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base "krea2" para modificar su comportamiento sin reentrenar todos los pesos. El repositorio solo distribuye un archivo safetensors de 218 MiB, coherente con un adaptador de este tipo y no con un modelo completo.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO u otra técnica de alineacion, ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). La model card unicamente indica el modelo de partida ("Finetuned from: krea2") y que los pesos pueden cargarse en RunningHub.

## Capacidades

- Edicion de imagenes guiada por texto: el pipeline declarado es `image-text-to-image`, lo que implica modificar una imagen de entrada a partir de una instruccion textual.
- Integracion con ComfyUI: la etiqueta `comfyui` y el formato LoRA apuntan a su uso como nodo dentro de grafos de ComfyUI.
- Aplicacion sobre el modelo base krea2: el adaptador modifica el comportamiento del base, por lo que sus capacidades dependen de las de krea2.
- Ejecucion en la plataforma RunningHub: la model card ofrece carga directa y llamada via API en esa plataforma.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el unico modo descrito es la edicion de imagen.

## Casos de uso

- Edicion de imagen en ComfyUI: cargar el LoRA en un grafo que use el modelo base krea2 para aplicar el ajuste sobre una imagen de entrada, indicado cuando se trabaja con la estetica o el concepto que el adaptador aprende.
- Iteracion de estilo controlada: usar el adaptador como capa adicional en un pipeline ya existente de krea2 para variar el resultado sin cambiar de modelo base, facilitando comparar salidas con y sin LoRA.
- Flujos con referencia de imagen: dado que el pipeline es `image-text-to-image`, encaja en tareas donde se parte de una imagen (por ejemplo, un boceto o una foto) y se busca una transformacion guiada por prompt.
- Pruebas de concepto en la plataforma RunningHub: cargar el modelo en RunningHub y ejecutarlo mediante su API para validar resultados antes de integrarlo en un pipeline propio.
- Produccion editorial y de contenido visual: incorporar el adaptador a un pipeline de generacion de imagenes para un estilo o personaje recurrente, siempre que se verifique la licencia aplicable.
- Experimentacion e investigacion: servir de base para estudiar la transferencia de un LoRA de edicion sobre krea2 (calidad, fidelidad al prompt, degradacion), dado su reducido tamano de 218 MiB.

Nota: estos casos asumen el comportamiento tipico de un LoRA de edicion de imagen; la model card no detalla qué concepto o estilo concreto aprende este adaptador, por lo que deben validarse empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El propio LoRA ocupa 218 MiB en disco; su huella en VRAM es marginal frente a la del modelo base krea2, que es quien determina el consumo real.
- VRAM estimada para inferencia: no disponible para el modelo base krea2 en la informacion proporcionada; no es posible estimarla sin conocer su tamano ni su arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin datos del modelo base.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub son las opciones explicitamente soportadas segun la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, licencia ni especificaciones de otros LoRA de edicion de imagen, ni del modelo base krea2, que permitan una comparacion rigurosa. Cualquier comparativa con otros adaptadores del ecosistema requeriria datos que no constan.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no incluye un archivo de licencia y la model card se limita a indicar que se siga la del proyecto original o upstream. Esto genera incertidumbre sobre el uso comercial.
- Ausencia total de datos de entrenamiento: no se documentan dataset, numero de pasos, técnica de alineacion ni composicion de datos, lo que impide auditar sesgos o el origen de las imagenes.
- Sesgos conocidos: no documentados; al no conocerse el dataset de entrenamiento, no puede descartarse la presencia de sesgos de representacion.
- Riesgo de alucinacion: en modelos de imagen, el equivalente es la generacion de contenido no fiel a la imagen o al prompt de entrada; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Limitaciones de idioma: los idiomas soportados no estan declarados, por lo que la respuesta a prompts en distintos idiomas no esta garantizada.
- Dependencia del modelo base: el adaptador solo funciona junto a krea2; su calidad final depende de las limitaciones de dicho base.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en la comunidad.
- Verificacion previa necesaria: antes de cualquier uso en produccion conviene validar resultados, fidelidad y licencia, dado que la informacion publicada es minima.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-xiaolou-v1.0-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2088069861032382466
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2066883782916788226
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card del repositorio)
