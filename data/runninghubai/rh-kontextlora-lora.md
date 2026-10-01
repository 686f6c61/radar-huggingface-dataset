# RunningHubAI/rh-kontextlora-lora

## Resumen

rh-kontextlora-lora es un adaptador LoRA (Low-Rank Adaptation) de edicion de imagen publicado por RunningHubAI, entrenado para la restauracion de fotografias antiguas con danos y rasguños. No es un modelo autonomo: se trata de un complemento de bajo rango que debe cargarse junto a un modelo base de la familia Kontext. Segun la model card, el ajuste parte de una base denominada "F1基础-Kontext" y su unico archivo de pesos ocupa 146 MiB, dentro de un repositorio de 0,2 GB.

El proposito declarado es la reparacion de desperfectos en imagenes historicas (roturas, arañazos, manchas) mediante el pipeline image-text-to-image, lo que implica que acepta una imagen de entrada y una instruccion textual para guiar la edicion. El modelo esta pensado para ejecutarse en ComfyUI, en la plataforma cloud RunningHub o cargarse desde Hugging Face.

Su relevancia practica es acotada y muy especializada: cubre una tarea concreta de restauracion fotografica dentro del ecosistema Kontext. La informacion publicada es muy escasa: no se declaran parametros, contexto, idiomas, licencia explicita ni resultados de benchmarks, y el repositorio registra cero descargas y cero "likes" en el momento de redactar esta ficha. El autor indica ademas que existe una version mejorada del LoRA y del workflow, enlazada en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de edicion de imagen de la familia Kontext; base declarada "F1基础-Kontext" |
| Parametros totales | no disponible (el archivo de pesos pesa 146 MiB; el autor no declara el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se declara ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan versiones cuantizadas del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (un unico archivo: `老照片破损修复kontext模型LORA-10.safetensors`, 146 MiB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una tecnica de ajuste eficiente que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas. Esto explica el tamaño reducido del artefacto (146 MiB) frente al modelo sobre el que se aplica. El pipeline declarado es image-text-to-image, es decir, edicion de imagen condicionada por texto, coherente con los modelos de la familia Kontext orientados a edicion.

El autor indica que el LoRA se ha ajustado a partir de una base llamada "F1基础-Kontext" y que su funcion es la restauracion de fotografias antiguas con roturas y arañazos. No se publican detalles sobre el dataset de entrenamiento, el numero de pasos, la composicion de las imagenes, el uso de RLHF/DPO ni ninguna innovacion tecnica adicional. No hay informacion sobre semilla,Learning rate, resolucion de entrenamiento ni estrategia de aumento de datos.

## Capacidades

- Edicion de imagen guiada por texto (pipeline image-text-to-image) sobre un modelo base Kontext.
- Restauracion de fotografias antiguas: reparacion de rasguños, roturas y danos superficiales segun la descripcion del autor.
- Integracion en flujos de trabajo de ComfyUI como nodo LoRA.
- Ejecucion en la plataforma cloud RunningHub y carga desde Hugging Face.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible (los prompts se procesan en el modelo base, no en el adaptador).
- Capacidades especiales declaradas: ninguna adicional mas alla de la restauracion de imagen.

## Casos de uso

- Restauracion de archivos fotograficos historicos: digitalizar negativos o copias en papel deterioradas y aplicar el LoRA para atenuar rasguños y roturas, reduciendo el trabajo manual de retoque.
- Servicios de restauracion fotografica para clientes particulares: un estudio puede integrar el adaptador en un flujo ComfyUI y ofrecer limpieza automatizada de fotos familiares antiguas antes del retoque fino.
- Digitalizacion de patrimonio documental: bibliotecas, hemerotecas y archivos municipales pueden usarlo como paso previo en la conservacion digital de fondos fotograficos.
- Preprocesado para OCR o analisis posterior: al reducir danos y ruido visual, facilita tareas posteriores de reconocimiento de texto o clasificacion sobre documentos fotografiados.
- Generacion de material editorial y divulgativo: recuperacion de imagenes de epoca para libros, exposiciones o articulos, partiendo de originales degradados.
- Prototipado rapido en ComfyUI: desarrolladores que ya trabajan con modelos Kontext pueden anadir este LoRA al grafo existente sin reentrenar ni cambiar el pipeline.
- Automatizacion por API en RunningHub: al estar publicado en esa plataforma, permite lanzar la restauracion por lote a traves de su API documentada, sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (PSNR, SSIM, LPIPS, FID ni evaluaciones humanas) ni comparaciones con otros LoRA de restauracion.

## Requisitos de hardware

- VRAM del adaptador: marginal; el archivo safetensors ocupa 146 MiB en disco y su carga anade un coste minimo de memoria sobre el modelo base.
- VRAM total de inferencia: depende por completo del modelo base, que no se especifica mas alla de "F1基础-Kontext". No es posible dar una cifra fiable con la informacion disponible.
- GPU recomendadas: no disponible para este adaptador en concreto; vendra determinado por el modelo base (tipicamente GPU de 16-24 GB o superiores en clases tipo RTX 4090, A100 o H100 si el base es de la escala de los modelos Kontext de difusion).
- Ejecucion en GPU de consumo: no confirmado. Depende de si el base cabe en VRAM con cuantizacion; el autor no aporta datos.
- Opciones de despliegue: ComfyUI (soporte nativo declarado por los tags), plataforma RunningHub (cloud) y Hugging Face como repositorio de pesos. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, parametros, contexto ni licencia de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa rigurosa. Como referencia cualitativa, dentro del ecosistema existen otros LoRA de edicion y restauracion de imagen para bases Kontext, pero no se dispone de cifras publicas que permitan contrastarlos con rh-kontextlora-lora.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-kontextlora-lora | no disponible (146 MiB) | no aplica | no disponible | Hugging Face / RunningHub |
| Alternativas Kontext para restauracion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no explicitada: la model card remite a la licencia del proyecto original, sin concretarla. Esto genera incertidumbre legal para uso comercial; conviene verificar la licencia del modelo base antes de desplegarlo en produccion.
- Dependencia total del modelo base: el LoRA no funciona de forma autonoma y su calidad final esta condicionada por el base "F1基础-Kontext", cuyas caracteristicas no se detallan.
- Sesgos conocidos: no disponible. Al ser un adaptador de restauracion, podria alterar rasgos faciales o texturas de forma no deseada, pero no hay documentacion al respecto.
- Riesgo de alucinacion visual: en modelos de difusion aplicados a restauracion existe riesgo de reconstruir contenido inexistente en zonas muy danadas; el autor no documenta este comportamiento.
- Limitaciones de idioma: no disponible; la interaccion textual depende del codificador de texto del modelo base.
- Limitaciones de contexto: no aplica (no es un modelo de lenguaje).
- Estado del repositorio: cero descargas y cero "likes", sin benchmarks ni validacion externa publicada. Es un artefacto de nicho con escasa trazabilidad tecnica.
- Existencia de versiones posteriores: el autor indica que hay un LoRA mejorado y un workflow actualizado; el presente repositorio puede quedar obsoleto.
- Fechas de creacion y actualizacion inusuales (2026) en los metadatos, lo que conviene tener en cuenta al evaluar la vigencia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-kontextlora-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1996613936055197698
- Version mejorada del LoRA: https://www.runninghub.cn/model/public/2005510104298516482
- Workflow mejorado: https://www.runninghub.cn/post/1994320925244014593
- Pagina del autor: https://www.runninghub.cn/user-center/1866115875207323650
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
