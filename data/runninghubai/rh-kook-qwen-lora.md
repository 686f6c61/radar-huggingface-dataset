# RunningHubAI/rh-kook-qwen-lora

## Resumen

rh-kook-qwen-lora es un adaptador LoRA de bajo rango para generacion de imagenes a partir de texto, publicado por la cuenta RunningHubAI y atribuido al usuario @KOOK dentro de la plataforma RunningHub. No es un modelo base: se aplica sobre Qwen-Image y se carga desde ComfyUI, desde la propia plataforma RunningHub o desde Hugging Face. Su funcion declarada es trasladar el acabado fotorrealista hacia una estetica de tipo CG, mezclando rasgos de persona real con render generado.

El repositorio contiene un unico archivo de pesos, `KOOK_Qwen_真实幻想.safetensors`, de 225 MiB en formato safetensors. El autor indica que el adaptador funciona en solitario con pesos 0.8 o 1.0 y que, combinado con otros LoRA, conviene bajar a 0.7, 0.5 o 0.3; ademas senala que a pesos bajos mejora la iluminacion de la escena. El modelo base declarado es Qwen-Image, y existe una variante posterior del mismo autor (`rh-kook-qwen-2512-lora`) afinada sobre Qwen-Image-2512.

La relevancia es acotada y practica: cubre un nicho estetico concreto, el realismo con acabado CG, dentro del ecosistema ComfyUI. No hay licencia declarada ni idiomas documentados, no se publican resultados de benchmarks y el propio autor remite a la licencia del proyecto original para cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image |
| Parametros totales | no disponible (adaptador distribuido como un unico archivo de pesos de 225 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un adaptador de text-to-image; la ventana efectiva la fija el modelo base) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors sin cuantizacion documentada |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que se siga la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`KOOK_Qwen_真实幻想.safetensors`, 225 MiB) |
| Modelo base | Qwen-Image |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | text-to-image |

## Arquitectura y entrenamiento

Un LoRA es un adaptador que inyecta matrices de bajo rango en las capas del modelo base y se entrena manteniendo congelados los pesos originales. En este caso el modelo base declarado es Qwen-Image, por lo que el adaptador modifica el comportamiento de ese transformer de difusion sin reemplazarlo: en inferencia se carga el modelo base completo mas los 225 MiB de pesos LoRA. El autor no documenta en la model card sobre que capas concretas se aplica el adaptador, ni el rango utilizado, ni el alpha, ni si se entreno con alguna tecnica de regularizacion o de captions especifica.

No hay informacion disponible sobre el dataset de entrenamiento: no se indica el numero de imagenes, la composicion del dataset, el uso de captions automaticos o manuales, ni si hubo alguna fase de ajuste por preferencias (RLHF, DPO u otras). El unico dato funcional aportado por el autor es la escala de pesos recomendada (0.8 o 1.0 en solitario; 0.7, 0.5 o 0.3 en combinacion con otros LoRA) y la observacion empirica de que a pesos bajos mejora la iluminacion. La existencia de una variante posterior sobre Qwen-Image-2512 sugiere que el autor mantiene actualizado el adaptador cuando aparece un modelo base mas reciente.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con estetica realista de acabado CG.
- Fusion de rasgos humanos realistas con render de tipo computer graphics, segun la descripcion del autor.
- Mejora de la iluminacion de la escena cuando se aplica con pesos bajos.
- Composicion con otros LoRA en una misma inferencia, ajustando pesos (0.7, 0.5 o 0.3 segun el autor).
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la plataforma RunningHub y exposicion mediante su API.
- No dispone de: tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, codigo ni matematicas (no es un modelo de lenguaje).
- No hay capacidades de vision de entrada, audio ni modo de razonamiento documentadas; se trata exclusivamente de un adaptador de generacion de imagen.
- Soporte multilingue de prompts: no disponible (no documentado).

## Casos de uso

- Concept art de personajes con acabado CG: el adaptador traslada un retrato realista hacia una apariencia de render, util para previsualizar personajes de videojuego o de animacion antes de producir el asset definitivo.
- Ilustracion editorial y key art: se puede generar una figura con aspecto humano creible pero con tratamiento de iluminacion y materiales propio del 3D, lo que encaja en portadas y piezas promocionales.
- Retoque estetico por peso bajo: aplicado alrededor de 0.3-0.5 sobre una generacion ya valida, el autor indica que mejora la iluminacion sin imponer por completo el estilo CG, lo que sirve como paso de posprocesado estetico dentro de un flujo de ComfyUI.
- Stacks de estilo en ComfyUI: al combinarse con otros LoRA a pesos 0.7, 0.5 o 0.3, permite construir recetas de estilo compuestas donde este adaptador aporta el componente CG.
- Generacion por lotes mediante API: la plataforma RunningHub expone endpoints de invocacion, de modo que el adaptador puede integrarse en un pipeline automatizado de produccion de imagenes para campanas o catalogos.
- Prototipado rapido de direccion de arte: permite comparar en pocos minutos una misma composicion con acabado fotorrealista y con acabado CG, para decidir el tono visual de un proyecto.
- Previsualizacion de assets para animacion o VFX: sirve como referencia de iluminacion y aspecto antes de modelar o renderizar en 3D, aunque no genera geometria ni material PBR utilizable directamente.
- Experimentacion e investigacion sobre adaptadores de bajo rango: al ser un LoRA pequeno (225 MiB), es un caso practico para estudiar como un adaptador de bajo rango desplaza la distribucion estetica de un modelo de difusion grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas humanas ni evaluaciones de fidelidad al prompt), y los resultados de busqueda consultados no aportan cifras. Las unicas referencias de rendimiento son cualitativas y provienen del propio autor: efecto CG perceptible y mejora de iluminacion a pesos bajos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El consumo lo determina integramente el modelo base Qwen-Image y la cuantizacion con la que se cargue; el adaptador solo anade los 225 MiB de sus pesos.
- GPU recomendadas: no disponibles. No hay requisitos publicados por el autor ni por la plataforma para este adaptador concreto.
- Compatibilidad con GPU de consumo: no documentada. El adaptador en si es ligero (225 MiB) y no supone una carga adicional relevante, pero la viabilidad en una GPU de consumo depende del modelo base, no del LoRA.
- Opciones de despliegue: ComfyUI (etiqueta declarada del repositorio), plataforma RunningHub y su API, y carga directa de safetensors desde Hugging Face. No aplican vLLM, TGI ni llama.cpp, que son runtimes de modelos de lenguaje y no de difusion.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia, imagenes por segundo ni curvas de escalado por lote.
- Almacenamiento: el repositorio ocupa 0,2 GB; hay que sumar el espacio del modelo base Qwen-Image, cuyo tamano no se especifica en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Base declarada | Tipo | Tamano del adaptador | Pesos recomendados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-kook-qwen-lora (este) | Qwen-Image | LoRA text-to-image | 225 MiB | 0.8 o 1.0 en solitario; 0.7, 0.5 o 0.3 combinado | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-kook-qwen-2512-lora | Qwen-Image-2512 | LoRA text-to-image | no disponible | 0.8 | no disponible | Hugging Face, ComfyUI, RunningHub |
| rh-qwen-image-2.1ai-lora | Qwen-Image (segun nomenclatura) | LoRA text-to-image | no disponible | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |

No se dispone de datos de rendimiento comparado entre estos adaptadores ni frente a LoRA de estilo de otros autores, por lo que la comparativa se limita a base declarada, tipo de artefacto, tamano y disponibilidad. Cualquier afirmacion sobre calidad relativa seria especulativa.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream. Esto implica incertidumbre juridica para uso comercial; conviene verificar la licencia de Qwen-Image antes de desplegar en produccion.
- Ausencia total de benchmarks: no hay metricas objetivas que respalden las afirmaciones cualitativas del autor sobre el acabado CG o la mejora de iluminacion.
- Dataset de entrenamiento no documentado: se desconoce la composicion de las imagenes de entrenamiento, lo que impide evaluar sesgos de representacion (genero, etnia, edad, corporalidad) o riesgo de replicar estilos protegidos.
- Riesgo de sobreajuste estetico: al ser un LoRA de estilo, puede imponer su acabado incluso cuando el prompt pide un resultado fotorrealista puro; el autor recomienda ajustar el peso para mitigarlo.
- Sensibilidad al peso: el resultado depende fuertemente de la escala aplicada (1.0 frente a 0.3), y las combinaciones con otros LoRA requieren experimentacion manual, sin valores optimos publicados.
- Idiomas soportados no documentados: se desconoce el comportamiento con prompts en castellano, ya que la model card esta en ingles y chino y no especifica el idioma de los captions de entrenamiento.
- Dependencia del modelo base: cualquier cambio de version o de cuantizacion de Qwen-Image puede alterar el resultado; el adaptador no es autonomo.
- Sin informacion sobre politicas de contenido: no se documenta si el adaptador tiene filtros, ni como gestiona prompts de contenido sensible.
- Sin garantias de soporte: el repositorio no registra descargas ni likes en el momento de la consulta y no se anuncia mantenimiento ni canal de incidencias.
- Alucinacion en el sentido generativo: como todo modelo de difusion, puede producir anatomias incorrectas, manos deformes, texto ilegible o incoherencias fisicas de iluminacion y perspectiva, especialmente a pesos altos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-kook-qwen-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-kook-qwen-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1971472695839899650
- Pagina del autor (@KOOK): https://www.runninghub.cn/user-center/1932028484909178882
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Variante sobre Qwen-Image-2512: https://huggingface.co/RunningHubAI/rh-kook-qwen-2512-lora
- Variante sobre Qwen-Image en RunningHub: https://www.runninghub.ai/model/public/2008450819900837889
- Otro LoRA relacionado del mismo publicador: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1ai-lora
- Ficha de terceros del modelo hermano: https://free2aitools.com/model/runninghubai/rh-kook-qwen-2512-lora
