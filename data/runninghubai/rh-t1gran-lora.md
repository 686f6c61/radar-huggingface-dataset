# RunningHubAI/rh-t1gran-lora

## Resumen

rh-t1gran-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face bajo el identificador RunningHubAI/rh-t1gran-lora. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un peso adicional de bajo rango pensado para modificar el comportamiento de un modelo base de generacion de imagen. Segun su model card, esta afinado a partir de "krea2" y su palabra de activacion es "T1gran". El repositorio tiene un tamano de 0,2 GB y contiene un unico archivo de pesos de 224 MiB.

La relevancia de esta publicacion es practica: permite incorporar un estilo o comportamiento concreto de edicion de imagen dentro de flujos de trabajo de ComfyUI sin necesidad de reentrenar el modelo base. Está orientado a plataformas de generacion visual y se distribuye a traves de RunningHub, un ecosistema que combina ComfyUI, generacion de imagen y video y acceso por API. El pipeline declarado es image-text-to-image, es decir, generacion o edicion de imagen condicionada por texto e imagen de entrada.

La informacion disponible es muy limitada: la model card es escasa, incluye un parrafo placeholder ("hola"), no detalla el dataset de entrenamiento, no publica benchmarks y no especifica licencia ni idiomas. Cualquier evaluacion rigurosa de su calidad debe hacerse probandolo sobre el modelo base krea2 en el entorno recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base krea2; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (peso del archivo LoRA: 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; condicionado por el prompt de texto del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto se procesa mediante el codificador del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (archivo `T1granrea2_lora_step_1500_comfyui.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela los pesos del modelo base e introduce matrices de bajo rango en determinadas capas. Su funcion es modular el comportamiento del modelo base krea2 sin modificar sus pesos originales, lo que permite cargarlo y descargarlo de forma independiente dentro de un flujo de ComfyUI. El tamano del archivo (224 MiB) es coherente con un adaptador LoRA y no con un modelo completo.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas como RLHF o DPO, ni sobre innovaciones tecnicas concretas. El nombre del archivo sugiere un entrenamiento por pasos (step 1500) y una exportacion orientada a ComfyUI. La model card no documenta hiperparametros, resolucion de entrenamiento ni metodo de captura de datos. El entrenamiento se realizo, segun la propia ficha, en la plataforma RunningHub.

## Capacidades

- Edicion y generacion de imagen condicionada por texto e imagen de entrada (pipeline image-text-to-image).
- Aplicacion de un estilo o comportamiento especifico sobre el modelo base krea2 mediante el adaptador LoRA.
- Activacion mediante la palabra clave "T1gran", necesaria segun la model card para que el efecto del adaptador se manifieste.
- Integracion en flujos de trabajo de ComfyUI, tanto en local como en la plataforma RunningHub.
- Compatibilidad con el ecosistema de pesos safetensors.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision analitica, audio ni modo de pensamiento, dado que no es un modelo de lenguaje.

## Casos de uso

- Estilizacion de imagenes en produccion grafica: cargando el LoRA en ComfyUI sobre krea2 y activandolo con "T1gran", un estudio puede aplicar de forma consistente un acabado visual concreto a lotes de imagenes sin reentrenar el modelo base.
- Edicion de imagen guiada por prompt: el pipeline image-text-to-image permite modificar una imagen de partida (por ejemplo, retoques de estilo o ambientacion) describiendo el cambio en el prompt de texto.
- Generacion de variantes creativas para campañas: a partir de una imagen de referencia, el adaptador puede producir alternativas coherentes con el estilo objetivo para su revision por parte de un equipo de diseno.
- Prototipado rapido de conceptos visuales: al ser un LoRA ligero de 224 MiB, se puede iterar rapidamente entre distintos adaptadores dentro del mismo flujo de ComfyUI para comparar estilos.
- Automatizacion de pipelines de contenido via API de RunningHub: las empresas que ya operan en RunningHub pueden invocar el modelo a traves de su API y encadenar la generacion con otras tareas del flujo creativo.
- Personalizacion de assets para redes sociales: generar imagenes con un estilo homogeneo a partir de fotografias propias, siempre que se respete la licencia aplicable.
- Experimentacion e investigacion en adaptadores de imagen: sirve como ejemplo de LoRA de bajo rango aplicado a un modelo base de difusion para estudiar efectos de la palabra de activacion y de los pasos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de imagen (FID, CLIP score, similitud estetica), comparaciones con otros LoRA ni evaluaciones cuantitativas de fidelidad al prompt. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,22 GB adicionales sobre el consumo del modelo base, ya que el archivo pesa 224 MiB.
- VRAM total para inferencia: no disponible. Depende del modelo base krea2 y del grado de cuantizacion empleado, que no se especifica.
- GPU recomendadas: no disponible para el conjunto modelo base mas LoRA; el adaptador por si solo no impone requisitos relevantes.
- Encaje en GPU de consumo: no confirmado, ya que depende del modelo base. El LoRA en si cabe en cualquier GPU capaz de ejecutar dicho modelo base.
- Opciones de despliegue: ComfyUI (entorno explicitamente soportado) y la plataforma RunningHub, que permite su ejecucion en la nube. No se confirma compatibilidad con vLLM (orientado a modelos de lenguaje), llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables directos (otros adaptadores LoRA de edicion de imagen) con datos verificables de parametros, contexto, rendimiento o licencia. Los resultados de busqueda solo enumeran repositorios de la propia organizacion RunningHubAI (por ejemplo, rh-z-imagebase-fp16-unet o rh-minimax-h3-fl2v-turbo-4step-v1-768p-comfyui-bf16), pero sin especificaciones que permitan una comparacion tecnica rigurosa.

| Aspecto | rh-t1gran-lora | Alternativas comparables |
|---|---|---|
| Parametros | no disponible (LoRA de 224 MiB) | no disponible |
| Contexto / resolucion | no disponible | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Hugging Face, RunningHub | no disponible |

## Limitaciones y advertencias

- Licencia indefinida: la model card remite a la licencia del proyecto original o upstream, sin especificar condiciones de uso comercial. Verificar la licencia de krea2 antes de cualquier uso en produccion.
- Dependencia total del modelo base: el adaptador no funciona por si solo; requiere cargar krea2 y respetar su licencia y requisitos tecnicos.
- Requiere la palabra de activacion "T1gran": si no se incluye en el prompt, es probable que el efecto del adaptador no se aplique.
- Ausencia de benchmarks: no hay evidencia cuantitativa de calidad, fidelidad al prompt ni de posibles artefactos.
- Riesgo de sobreajuste al estilo entrenado: al ser un LoRA, puede degradar la diversidad o introducir sesgos esteticos propios del dataset de entrenamiento, que no se documenta.
- Documentacion insuficiente: la model card contiene texto placeholder y no detalla datos de entrenamiento, resolucion, pasos efectivos ni hiperparametros, lo que dificulta la reproducibilidad.
- Idiomas no declarados: no se especifica que lenguas soporta el codificador de texto del modelo base; los prompts en castellano pueden comportarse de forma distinta a los de ingles o chino.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir contenido incoherente o no solicitado, especialmente con prompts ambiguos.
- Inconsistencia en metadatos: las fechas de creacion y actualizacion indicadas (2026-09-27) no permiten validar la antiguedad real del artefacto.
- Cero descargas y cero "likes": no hay senales de uso comunitario que respalden su calidad o estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-t1gran-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2104253328506007553
- Pagina del autor: https://www.runninghub.ai/user-center/2055059850194632705
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Biblioteca de modelos de RunningHub: https://www.runninghub.ai/models
- Pagina de entrenamiento de modelos: https://www.runninghub.ai/page-model
- Perfil de RunningHubAI en Hugging Face: https://huggingface.co/RunningHubAI
