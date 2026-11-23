# inclusionAI/Ming-Image-0.1-Design-Layer

## Resumen

Ming-Image-0.1-Design-Layer es un modelo de difusion especializado en la descomposicion de disenos graficos planos en capas RGBA independientes. Lo desarrolla inclusionAI y resuelve un problema muy concreto del flujo de trabajo de diseno: a partir de una imagen aplanada (por ejemplo, un PNG exportado) y un plan de capas expresado en lenguaje natural, el modelo genera cada elemento grafico como una capa separada con canal alfa, lista para editar en herramientas como Photoshop, Figma o GIMP.

El modelo se distribuye con la libreria `custom` y el pipeline `image-text-to-image`, y emplea una arquitectura identificada en sus tags como `bailingmm_moe_v2_lite`, es decir, una variante de mezcla de expertos (MoE) multimodal. Cuenta con 6.154.908.736 parametros totales segun los pesos en safetensors, y el repositorio ocupa 65,2 GB, lo que refleja pesos en BF16 junto con los componentes auxiliares del pipeline.

Su relevancia actual radica en que automatiza una tarea tradicionalmente manual y tediosa en produccion grafica: separar fondos, textos, formas e imagenes incrustadas de un diseno final. La licencia MIT y la disponibilidad de un repositorio de inferencia propio, junto con recetas para vLLM-Omni, lo hacen utilizable tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (`bailingmm_moe_v2_lite` segun tags); modelo de difusion para image-text-to-image |
| Parametros totales | 6.154.908.736 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (el autor valida BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `custom`, compatible con diffusers) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se apoya en una arquitectura denominada `bailingmm_moe_v2_lite`, con un pipeline de tipo image-text-to-image y soporte de diffusers. Se trata, por tanto, de un modelo generativo condicionado por imagen y texto que produce un conjunto de capas RGBA. El prompt de entrada actua como plan de capas: describe cuantas capas debe generar y que contenido corresponde a cada una. Si se omite el prompt, el parametro `--num-layers` fija el numero de capas de la peticion por defecto.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La model card unicamente documenta la configuracion de inferencia validada: 12 pasos de muestreo, CFG scale de 2.0, precision BF16, resolucion de trabajo de 1024 (o 512 para mayor velocidad) y una GPU CUDA con 80 GiB de VRAM. El modelo preserva la relacion de aspecto de la imagen de entrada.

## Capacidades

- Descomposicion de imagenes de diseno planas en un numero configurable de capas RGBA independientes.
- Generacion condicionada por texto: el prompt define el plan de capas y el contenido de cada una.
- Salida en PNG con canal alfa por capa, directamente editable.
- Preservacion de la relacion de aspecto de la imagen original.
- Soporte de dos resoluciones de trabajo: 1024 (recomendada) y 512 (mas rapida).
- Integracion con frameworks de inferencia como vLLM-Omni.
- Mejora de prompts (prompt enhancement) mediante modelos auxiliares como Ling-3.0-flash-VL o qwen3.8-27B.
- Casos documentados de uso combinado con skills de diseno y de conversion de imagen a PPT editable.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Edicion de material grafico corporativo: a partir de un cartel o tarjeta aplanada, el modelo separa fondo, tipografia, formas e imagenes en capas RGBA para que el equipo de diseno modifique textos o colores sin rehacer la pieza.
- Conversion de imagenes a presentaciones editables: combinado con la skill `image-to-editable-ppt`, permite reconstruir diapositivas exportadas como imagen en elementos editables.
- Reconstruccion de archivos fuente perdidos: cuando solo se conserva el PNG final de un diseno, el modelo genera una aproximacion por capas que sirve como punto de partida para recuperar el proyecto.
- Automatizacion de variantes de marca: en un pipeline de marketing, se descompone una plantilla y se sustituyen capas concretas (logotipo, texto promocional) para producir variantes sin intervencion manual.
- Preprocesado para herramientas de diseno asistido: las capas RGBA generadas alimentan editores o sistemas de retoque que necesitan elementos separados con transparencia.
- Catalogacion y analisis de assets: la separacion por capas facilita extraer y clasificar elementos recurrentes (iconos, tipografias, fondos) de un archivo historico de disenos.
- Prototipado rapido en estudios de diseno: con resolucion 512 y 12 pasos de muestreo se obtiene una primera descomposicion rapida antes de refinar a 1024.

## Benchmarks y rendimiento

La model card incluye una figura de resultados cuantitativos sobre el conjunto de test de Crello, con las metricas RGB L1 (menor es mejor) y Alpha soft IoU (mayor es mejor), pero los valores numericos no estan disponibles en la informacion proporcionada.

| Benchmark | Metrica | Resultado |
|---|---|---|
| Crello test set | RGB L1 | no disponible |
| Crello test set | Alpha soft IoU | no disponible |

No se han publicado en la informacion disponible resultados numericos de benchmarks como MMLU, HumanEval o GSM8K, que ademas no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: la configuracion validada por el autor es una unica GPU CUDA con 80 GiB de VRAM en BF16.
- GPU recomendadas: A100 80 GB o H100 80 GB, alineadas con la configuracion validada.
- GPU de consumo: no se documenta que el modelo quepa en GPUs de consumo como la RTX 4090 (24 GB); con 6,15 mil millones de parametros en BF16 los pesos ocupan aproximadamente 12,3 GB, pero el pipeline completo y los estados intermedios a resolucion 1024 no estan validados en ese hardware.
- Despliegue: repositorio oficial Ming-Image (`infer.py`) y recetas para vLLM-Omni. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Precision: BF16.
- Resolucion: 1024 recomendada, 512 para descomposicion mas rapida.
- Muestreo: 12 pasos, CFG scale 2.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de descomposicion de capas, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ming-Image-0.1-Design-Layer | 6.154.908.736 | no aplica | MIT | Descomposicion en capas RGBA con plan textual |
| Alternativas de descomposicion de capas | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |

## Limitaciones y advertencias

- La VRAM validada (80 GiB) limita el despliegue a GPUs de datacenter; no hay confirmacion de funcionamiento en GPUs de consumo.
- El numero de capas y su contenido dependen en gran medida de la calidad del plan de capas del prompt; prompts ambiguos pueden producir descomposiciones incorrectas.
- No se documentan sesgos conocidos, pero al ser un modelo generativo de imagen puede reproducir sesgos presentes en los datos de entrenamiento, sobre los que no hay informacion publicada.
- Riesgo de alucinacion visual: elementos inventados o mal separados en las capas generadas, especialmente en disenos complejos o con solapamientos.
- No se especifican los idiomas soportados en los prompts, por lo que el comportamiento multilingue no esta garantizado.
- La licencia MIT permite uso comercial, pero conviene revisar las licencias de los componentes auxiliares (modelos de prompt enhancement, frameworks de inferencia) antes de desplegar en produccion.
- La model card marca `inference: false` en los metadatos, lo que indica que la inferencia no esta habilitada directamente en el Hub; es necesario usar el repositorio oficial o vLLM-Omni.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design-Layer
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ming-Image-0.1-Design-Layer
- Blog: https://mp.weixin.qq.com/s/VGdtxfM8kbHIQJw50VD_Sw
- Demo en Spaces: https://huggingface.co/spaces/Xiaolong-Wang/Ming-Image-0.1-Design-Layer
- Repositorio de inferencia: https://github.com/inclusionAI/Ming-Image
- Demo de descomposicion en capas: https://github.com/inclusionAI/Ming-Image#layer-decomposition-demo
- Reescritura de prompts: https://github.com/inclusionAI/Ming-Image#layer-decomposition-prompt-rewriting
- Skill de diseno: https://github.com/inclusionAI/ling-cookbook/tree/main/resources/recommended-skills/ling-ui-design
- Skill de imagen a PPT editable: https://github.com/inclusionAI/ling-cookbook/tree/main/resources/recommended-skills/image-to-editable-ppt
- Recetas vLLM-Omni: https://github.com/vllm-project/vllm-omni/blob/main/recipes/inclusionAI/Ming-Image.md
- Guia de instalacion de vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/getting_started/quickstart/
- Licencia: https://huggingface.co/inclusionAI/Ming-Image-0.1-Design-Layer/blob/main/LICENSE
