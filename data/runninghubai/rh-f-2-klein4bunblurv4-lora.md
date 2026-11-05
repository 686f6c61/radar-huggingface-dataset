# RunningHubAI/rh-f.2-klein4bunblurv4-lora

## Resumen

`rh-f.2-klein4bunblurv4-lora` es un adaptador LoRA de tipo text-to-image publicado en HuggingFace por RunningHubAI. No se trata de un modelo base completo, sino de un conjunto de pesos de ajuste fino (88 MiB en un único fichero `F.2 klein4bUnblur控油腻v4.safetensors`) que se aplica sobre el modelo base Flux2-Klein-4B. Su funcion, segun la model card, es modificar el comportamiento generativo del modelo base para producir imagenes con un acabado fotografico concreto: la cadena de activacion `H5N1` combinada con la estetica "Fujifilm GFX" y la instruccion de "anadir detalles suaves".

El modelo resuelve un problema de nicho dentro de los flujos de generacion de imagen: estilizar la salida de un modelo base moderno (Flux2-Klein-4B) sin necesidad de reentrenar, mediante un LoRA ligero que se carga en ComfyUI o en la plataforma RunningHub. Es relevante ahora porque la familia Flux2 esta siendo adoptada rapidamente en pipelines de imagen open source y los LoRA comunitarios permiten especializar el modelo base sin coste de reentrenamiento completo.

La informacion disponible es muy limitada: la model card es esencialmente un contenedor de enlaces promocionales a RunningHub, con una tabla de metadatos minima y sin datos de entrenamiento, benchmarks ni especificaciones tecnicas detalladas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.1 GB. Esta ficha refleja fielmente esa escasez de datos y marca explicitamente como "no disponible" todo aquello que la model card no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Flux2-Klein-4B |
| Parametros totales | no disponible (pesos LoRA de 88 MiB; el modelo base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "seguir la licencia del proyecto original o upstream") |
| Formato de pesos | safetensors (`F.2 klein4bUnblur控油腻v4.safetensors`, 88 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Flux2-Klein-4B para desplazar su distribucion de salida hacia un estilo concreto. La model card no documenta el rango del adaptador, las capas objetivo, la resolucion de entrenamiento, el numero de pasos ni el dataset utilizado. Solo se indica que fue afinado a partir de Flux2-Klein-4B y que se entreno en la plataforma RunningHub (enlace "Train models on RunningHub").

No hay informacion sobre si se uso RLHF, DPO, regularizacion, tecnicas de decodificacion especulativa ni innovaciones de atencion. El unico dato funcional destacable es la palabra de activacion `H5N1` y la recomendacion de prompt "H5N1, Fujifilm GFX, 富士胶片, 增加柔和的细节" (Fujifilm GFX, aumentar los detalles suaves), que sugiere que el LoRA fue entrenado para asociar ese trigger con un look fotografico analogico de tonos suaves.

## Capacidades

- Generacion de imagen text-to-image condicionada por prompt, heredando las capacidades del modelo base Flux2-Klein-4B.
- Aplicacion de un estilo fotografico concreto (estetica Fujifilm GFX, detalles suaves) cuando se incluye la palabra de activacion `H5N1`.
- Integracion en flujos ComfyUI como nodo LoRA sobre el modelo base.
- Ejecucion en la plataforma RunningHub y a traves de su API.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles; la model card esta redactada en ingles y chino, pero no se documenta el soporte de prompts en otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Post-procesado estilistico de imagenes generadas: cargar el LoRA sobre Flux2-Klein-4B en ComfyUI y anadir `H5N1, Fujifilm GFX` al prompt para obtener un acabado analogico suave en retratos y paisajes.
- Prototipado rapido de direccion de arte: un estudio puede generar variantes de una misma escena con y sin el LoRA para comparar el look "unblur" frente al modelo base antes de fijar una guia visual.
- Generacion de material para redes sociales: producir imagenes con estetica fotografica consistente usando la API de RunningHub, sin infraestructura propia.
- Integracion en pipelines automatizados de contenido: invocar el LoRA via API de RunningHub dentro de un flujo de publicacion para generar ilustraciones de articulos con un estilo homogeneo.
- Experimentacion academica sobre LoRA: usar este adaptador como caso de estudio de bajo coste (88 MiB) para analizar como un trigger de tres caracteres condiciona la salida de un modelo de difusion.
- Creacion de bases de datos sinteticas con estetica controlada: generar lotes de imagenes con el mismo look para entrenar clasificadores o evaluar modelos de vision.
- Demostraciones en ComfyUI: incluirlo en un workflow de ejemplo para mostrar la carga de LoRA y el efecto del trigger `H5N1`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia, el modelo base Flux2-Klein-4B requiere memoria de GPU para difusion; el LoRA en si anade solo 88 MiB.
- GPU recomendadas: no disponible. El modelo base Flux2-Klein-4B suele ejecutarse en GPU con al menos 8-16 GB de VRAM en cuantizacion, pero este dato no lo confirma la model card.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: ComfyUI (plataforma principal indicada), RunningHub (web y API). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables ni datos de rendimiento que permitan una comparacion cuantitativa. Como referencia estructural, se trata de un LoRA sobre Flux2-Klein-4B, por lo que su comportamiento dependera del modelo base y de otros adaptadores de la misma familia, pero no se dispone de datos para tabular una comparativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un LoRA de estilo fotografico puede heredar los sesgos del modelo base Flux2-Klein-4B en cuanto a representacion de personas y culturas.
- Riesgo de alucinacion: no aplica en el sentido de texto; en imagen, el riesgo es generar detalles inconsistentes o artefactos cuando el trigger `H5N1` se usa fuera de contexto.
- Limitaciones de contexto o idioma: no documentadas. El prompt recomendado mezcla ingles y chino, lo que sugiere que el LoRA puede estar optimizado para prompts en esos idiomas.
- Restricciones de licencia para uso comercial: la licencia figura como "no disponible"; la model card remite a la licencia del proyecto original o upstream, por lo que es imprescindible verificar la licencia de Flux2-Klein-4B antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y la model card contiene principalmente enlaces promocionales a RunningHub y un codigo de invitacion; la documentacion tecnica es practicamente inexistente.
- No hay garantia de mantenimiento, versionado ni soporte por parte del autor.
- El nombre del fichero incluye caracteres chinos ("控油腻"), lo que puede causar problemas en algunos sistemas de ficheros o scripts.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-f.2-klein4bunblurv4-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2066864088000589825
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1902159358849884162
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card)
