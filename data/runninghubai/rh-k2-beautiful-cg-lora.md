# RunningHubAI/rh-k2-beautiful-cg-lora

## Resumen

`rh-k2-beautiful-cg-lora` es un adaptador LoRA de edicion y generacion de imagen condicionada por texto, publicado por RunningHubAI en Hugging Face y atribuido al usuario de RunningHub `@nanfeng zijing`. No es un modelo base autonomo: es un conjunto de pesos de bajo rango (224 MiB en un unico fichero `K2-beautiful-cg_c1-st10000.safetensors`) que se aplica sobre un modelo base identificado en la model card como `krea2`. Su funcion es desplazar el estilo de generacion del modelo base hacia una estetica concreta ("beautiful cg", segun el nombre), y esta pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o en Hugging Face.

La relevancia de esta ficha es limitada en terminos de investigacion: se trata de un artefacto de fine-tuning orientado a produccion creativa, sin model card tecnica detallada, sin benchmarks y sin licencia explicita mas alla de la remision a la licencia del proyecto original. El repositorio ocupa 0,2 GB, no registra descargas ni likes en el momento de la consulta y se publico el 5 de noviembre de 2026.

Por tanto, esta ficha documenta lo que el autor declara y marca explicitamente como no disponible todo aquello que la informacion proporcionada no cubre: arquitectura del modelo base, numero de parametros, longitud de contexto, composicion del dataset de entrenamiento, hiperparametros de la LoRA y resultados cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (pesos LoRA de 224 MiB; el numero de parametros del base no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`K2-beautiful-cg_c1-st10000.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es `krea2`, del que la informacion disponible no especifica arquitectura interna, numero de parametros ni mecanismo de condicionamiento textual. La pipeline declarada es `image-text-to-image`, y las etiquetas del repositorio incluyen `comfyui`, `lora` e `image-text-to-image`, lo que situa el uso previsto en flujos de generacion y edicion de imagen guiados por prompt.

El nombre del fichero (`c1-st10000`) sugiere un checkpoint en el paso 10.000 de entrenamiento, y el nombre del modelo (`K2-beautiful-cg_10000`) apunta a un dataset o iteracion de 10.000 muestras o pasos, pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado por el autor. No se declara el numero de imagenes de entrenamiento, la resolucion, el ratio de learning rate, el rango de la LoRA, el alpha ni si se aplicaron tecnicas de regularizacion o captions automaticos. Tampoco se documenta si hubo entrenamiento con preferencias (RLHF/DPO) ni ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de imagen condicionada por texto (text-to-image) al aplicarse sobre el modelo base `krea2`.
- Edicion de imagen guiado por texto, segun la pipeline declarada `image-text-to-image`.
- Transferencia de estilo o estetica "beautiful cg" al resultado generado, que es el proposito declarado del adaptador.
- Integracion en grafos de ComfyUI mediante carga de LoRA.
- Ejecucion en la plataforma RunningHub y en Hugging Face, segun la model card.
- Soporte de tool calling, agentes, razonamiento multi-paso, matematicas, codigo, vision o audio: no disponible (no es un modelo de lenguaje y la informacion no lo declara).
- Capacidades multilingues: no disponible; no se documenta el tokenizador ni los idiomas del codificador de texto del base.

## Casos de uso

- Ilustracion de personajes con estetica CG: cargar el LoRA en ComfyUI sobre `krea2` y generar retratos o figuras con el estilo aprendido, ajustando el peso del adaptador para modular la intensidad del efecto.
- Creacion de arte conceptual para videojuegos: producir variaciones de diseno de personajes y entornos con una direccion de arte coherente, aprovechando que el LoRA fija un estilo comun entre generaciones.
- Edicion de imagenes existentes: usar la pipeline `image-text-to-image` para reestilizar bocetos o fotografias hacia el look "beautiful cg" manteniendo la composicion de entrada.
- Prototipado rapido en pipelines de ComfyUI: insertar el nodo de carga de LoRA en grafos ya existentes para comparar el estilo frente al modelo base sin cambiar la infraestructura.
- Generacion por API en produccion creativa: invocar el modelo alojado en RunningHub mediante su API para integrar la generacion de imagenes estilizadas en aplicaciones o flujos automatizados.
- Pruebas de concepto y evaluacion de estilos: dado su tamano reducido (224 MiB), permite iterar rapidamente sobre variantes de prompt y pesos del adaptador en entornos de experimentation.
- Material promocional y contenido para redes: generar ilustraciones con una identidad visual consistente para campanas, sujeto a la verificacion de la licencia aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente del modelo base `krea2`, cuyos requisitos no se declaran; el adaptador en si solo anade 224 MiB de pesos.
- GPU recomendadas: no disponible para el base. Para el adaptador no se especifica ninguna.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el modelo base.
- Opciones de despliegue: ComfyUI (declarado), plataforma RunningHub (declarado) y Hugging Face (declarado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un adaptador de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-k2-beautiful-cg-lora | LoRA sobre `krea2` | no disponible (adaptador de 224 MiB) | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores LoRA de estilo para el mismo modelo base ni de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial requiere verificar previamente la licencia de `krea2` y la del autor del adaptador.
- Model card minima: no se documentan dataset, hiperparametros, rango de la LoRA, resolucion de entrenamiento ni metodo de captions, lo que dificulta reproducir o auditar el resultado.
- Dependencia total del modelo base: el comportamiento, los sesgos y las limitaciones eticas del adaptador heredan los de `krea2`, no evaluados en la informacion disponible.
- Riesgo de sobreajuste al estilo: con 10.000 pasos de entrenamiento (segun la nomenclatura del fichero) y sin datos de validacion, es plausible que el adaptador reduzca la diversidad de las salidas, aunque no se confirma.
- Sesgos conocidos: no disponible; no se han publicado evaluaciones de sesgo demografico, cultural o de representacion.
- Riesgo de alucinacion visual: no cuantificado; en modelos de difusion se manifiesta como artefactos anatomicos o incoherencias en el prompt, sin datos especificos para este adaptador.
- Idiomas: no disponible; no se documenta que idiomas entiende el codificador de texto del base.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de validacion por terceros.
- Fecha de publicacion futura respecto a la mayoria de referencias del ecosistema (5 de noviembre de 2026), lo que limita la existencia de documentacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-k2-beautiful-cg-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2085393304384278529
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2016733176411725825
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-k2-beautiful-cg-lora/blob/main/README_cn.md
