# RunningHubAI/rh-realistic-skil-lora

## Resumen

rh-realistic-skil-lora es un adaptador LoRA de bajo rango para generación de imágenes a partir de texto (text-to-image), publicado por RunningHubAI en Hugging Face y desarrollado por el usuario @Trong Anh dentro de la plataforma RunningHub. El adaptador se ha afinado a partir de flux2-klein, segun declara el autor en la model card, y su funcion es reforzar la apariencia realista de la piel en las imágenes generadas, un problema recurrente en modelos de difusión que tienden a producir texturas plasticas o excesivamente suavizadas. La palabra de activacion indicada es "realistic skin".

El repositorio es de tamano reducido (0,2 GB) y contiene un unico archivo de pesos en formato safetensors de 158 MiB, lo que corresponde a un adaptador LoRA y no a un modelo completo: no incluye los pesos del modelo base, que deben obtenerse por separado. El modelo esta pensado para ejecutarse en ComfyUI, en la propia plataforma RunningHub o en Hugging Face, y se distribuye como complemento de un flujo de trabajo ya existente.

La informacion publicada es muy escasa: no se documentan la licencia exacta, los idiomas soportados, la composicion del dataset de entrenamiento, el rango del adaptador ni resultados de benchmarks. Cualquier evaluacion rigurosa del modelo requiere probarlo directamente sobre el modelo base declarado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre flux2-klein, segun el autor; arquitectura del modelo base no documentada en la informacion disponible |
| Parametros totales | no disponible (el archivo de pesos ocupa 158 MiB; se desconoce el rango y el numero exacto de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (al ser text-to-image, depende del codificador de texto del modelo base; no se especifica) |
| Licencia | no disponible (la model card indica que los derechos pertenecen al autor y que se debe seguir la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (archivo `20260315-173326.safetensors`, 158 MiB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El autor indica que el ajuste se ha realizado sobre flux2-klein, un modelo de difusion de la familia FLUX, pero no se detalla en la informacion disponible que capas se han adaptado, cual es el rango del adaptador, ni la tasa de aprendizaje o el numero de pasos utilizados.

Tampoco se documenta el dataset de entrenamiento: no hay datos sobre el numero de imagenes, la resolucion, la composicion tematica ni si se aplicaron tecnicas de regularizacion o de aumento de datos. No se menciona el uso de RLHF, DPO ni de ningun otro metodo de alineacion, algo por otra parte habitual en adaptadores de estilo. La unica innovacion declarada es la especializacion en el acabado realista de la piel, activada mediante la palabra clave "realistic skin".

## Capacidades

- Generacion de imágenes realistas a partir de texto, heredada del modelo base flux2-klein.
- Refuerzo especifico del detalle y la textura de la piel, con el objetivo de reducir el aspecto plastico o sobresuavizado tipico de los modelos de difusion.
- Aplicacion mediante palabra de activacion ("realistic skin"), lo que permite activar o desactivar el efecto de forma condicional dentro de un flujo de trabajo.
- Integracion en ComfyUI como nodo LoRA dentro de una cadena de generacion ya existente.
- Compatibilidad declarada con la plataforma RunningHub y con Hugging Face como plataformas de carga.
- Soporte de tool calling / function calling: no disponible (no aplica, es un modelo de imagen).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (depende del codificador de texto del modelo base, no documentado).
- Capacidades especiales (modo thinking, vision, audio): no disponible (no aplica).

## Casos de uso

- Retoque y generacion de retratos fotorrealistas: el adaptador se aplica sobre el modelo base para producir primeros planos y medios planos de personas con textura de piel mas creible, un escenario en el que los modelos de difusion genericos suelen fallar por exceso de suavizado.
- Sesiones de fotografia virtual para comercio electronico: generacion de imagenes de modelos con piel realista para catalogos de moda, complementos o cosmeticos, donde el detalle de la piel es un criterio de calidad directo.
- Previsualizacion creativa en publicidad: generacion rapida de bocetos fotorrealistas para presentar conceptos a clientes antes de la produccion final, activando el LoRA solo en las tomas que requieren presencia humana.
- Creacion de personajes consistentes para narrativa visual: combinado con herramientas de ControlNet o de referencia de identidad dentro de ComfyUI, permite mantener un personaje con aspecto realista a lo largo de varias escenas.
- Aumento de datos para entrenamiento de modelos de vision: generacion de imagenes sinteticas con piel realista para ampliar datasets de deteccion facial, segmentacion de piel o analisis dermatologico, siempre que la licencia y el uso previsto lo permitan.
- Flujos de trabajo de restauracion y mejora de imagen: uso del adaptador junto a etapas de upscaling o de posprocesado para recuperar detalle de piel en imagenes de baja calidad o antiguas.
- Prototipado rapido en pipelines de generacion por lotes: al ser un adaptador ligero de 158 MiB, puede cargarse y descargarse rapidamente en memoria durante un pipeline que alterne estilos, sin necesidad de recargar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas con otros adaptadores) ni evaluaciones humanas cuantificadas.

## Requisitos de hardware

- Peso del adaptador: 158 MiB en safetensors, con un repositorio total de 0,2 GB. Es un archivo ligero que se puede descargar y almacenar sin problema en cualquier equipo.
- VRAM para inferencia: no disponible en la informacion publicada. La VRAM necesaria la determina el modelo base flux2-klein, no el adaptador; el LoRA anade un coste marginal muy bajo (del orden de centenares de MiB adicionales, estimacion no confirmada por el autor).
- GPU recomendadas: no disponible. Depende enteramente de los requisitos del modelo base, que no se documentan en este repositorio.
- Encaje en GPU de consumo: no disponible. El adaptador en si cabe en cualquier GPU, pero la viabilidad del conjunto depende del modelo base.
- Opciones de despliegue: ComfyUI (mencionado explicitamente por el autor), plataforma RunningHub y Hugging Face. No se documenta soporte para vLLM, llama.cpp, TGI ni Ollama, que son herramientas orientadas a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Solo se dispone de referencias indirectas a otros adaptadores de piel publicados en RunningHub, sin datos tecnicos publicados para comparar de forma rigurosa.

| Modelo | Tipo | Base declarada | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-realistic-skil-lora | LoRA text-to-image | flux2-klein | 158 MiB (adaptador) | no disponible | Hugging Face, RunningHub |
| PornMaster Krea2 Skin Tone Slider | LoRA text-to-image | Krea 2 (segun el titulo del listado) | no disponible | no disponible | RunningHub |
| Tutu's Little Face - KREA2 | LoRA text-to-image | Krea 2 (segun el titulo del listado) | no disponible | no disponible | RunningHub |
| Skin LoRA integrado en el flujo Z-IMAGE | LoRA text-to-image | Z-Image Turbo | no disponible | no disponible | RunningHub |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican el rango del LoRA, las capas adaptadas, el dataset, los hiperparametros de entrenamiento ni el proceso de evaluacion, lo que impide reproducir o auditar el ajuste.
- Licencia no disponible: la model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o upstream, pero no concreta cual es. Esto supone un riesgo legal para uso comercial hasta que se aclare.
- Dependencia del modelo base: el adaptador no es autonomo. Su comportamiento, sus capacidades y sus restricciones de licencia estan condicionados por flux2-klein, cuyos terminos no se detallan en este repositorio.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, manos deformes, artefactos en bordes o incoherencias entre la instruccion de texto y el resultado, especialmente en escenas complejas.
- Sesgos potenciales: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de representacion en tono de piel, edad, genero o etnia. Un adaptador especializado en realismo de piel es especialmente sensible a este punto.
- Ambito de aplicacion estrecho: esta pensado para reforzar un atributo concreto (textura de piel) y no para cambiar el estilo general ni para mejorar otras capacidades como la composicion o el seguimiento de instrucciones.
- Idiomas no documentados: se desconoce el rendimiento del prompt en castellano y en otros idiomas distintos del ingles, ya que depende del codificador de texto del modelo base.
- Datos de adopcion nulos: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad ni casos de uso verificados por terceros.
- Uso responsable: al tratarse de un modelo orientado a generar personas con piel realista, su uso debe respetar la normativa aplicable sobre sintesis de imagenes de personas, consentimiento y marcado de contenido generado.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-realistic-skil-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-realistic-skil-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2033137909913624577
- Pagina del autor (@Trong Anh): https://www.runninghub.ai/user-center/1883133747871567874
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Listado de modelos de RunningHub: https://www.runninghub.ai/models
