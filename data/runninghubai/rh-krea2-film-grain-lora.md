# RunningHubAI/rh-krea2-film-grain-lora

## Resumen

rh-krea2-film-grain-lora es un adaptador LoRA publicado por RunningHubAI (RunningHub) para edicion de imagen mediante el pipeline `image-text-to-image`. Su funcion declarada es aplicar un acabado de grano de pelicula fotografico sobre imagenes, y esta pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o directamente desde Hugging Face. El modelo base del que se deriva es "krea2", segun indica la model card, aunque no se detalla la version concreta ni la arquitectura subyacente.

Se trata de un artefacto de pesos, no de un modelo fundacional: el repositorio ocupa 0,2 GB y contiene un unico fichero `KREA2film grain.safetensors` de 224 MiB. Los tags del repositorio lo clasifican como `lora`, `comfyui` y `image-text-to-image`, y la model card lo describe explicitamente como "LoRA (image edit)".

La relevancia de esta ficha es limitada pero concreta: interesara a quien necesite reproducir una estetica analogica (grano, ligero desenfoque, aspecto nostalgico) en flujos de generacion y edicion de imagen dentro de ComfyUI. No hay informacion publicada sobre dataset de entrenamiento, rango del LoRA, licencia o resultados de evaluacion, por lo que casi todas las specs deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base "krea2"; arquitectura del base no disponible |
| Parametros totales | no disponible (estimacion aproximada de 117 millones de parametros a partir del fichero de 224 MiB si esta en fp16; no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de tokens; el modelo base no documenta ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en ingles y chino; los prompts de ejemplo estan en ingles) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`KREA2film grain.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de un modelo base de difusion para modificar su comportamiento sin reentrenar los pesos completos. La model card indica "Finetuned from: krea2" y clasifica el tipo de modelo como "LoRA (image edit)", pero no especifica el rango del adaptador, las capas objetivo (target modules), el optimizador, la tasa de aprendizaje, el numero de pasos ni el hardware empleado. Tampoco se documenta si el entrenamiento se hizo con pares imagen-imagen, con captions de texto o con un dataset propio de fotografias.

No hay informacion sobre el numero de tokens o imagenes de entrenamiento, composicion del dataset, ni sobre tecnicas de alineamiento (RLHF, DPO u otras), que en modelos de difusion no aplican del mismo modo. La unica pista sobre los datos es el prompt de ejemplo incluido en la model card, una descripcion larga en ingles de una fotografia de retrato en una playa al atardecer con grano y un ligero desenfoque; esto sugiere, sin confirmarlo, que el adaptador se ha entrenado sobre fotografia de retrato con estetica analogica. El autor no publica ningun detalle tecnico adicional ni paper asociado.

## Capacidades

- Aplicar un acabado de grano de pelicula fotografico sobre imagenes generadas o editadas, segun la funcion declarada en el nombre del modelo.
- Edicion de imagen guiada por texto e imagen en el pipeline `image-text-to-image`.
- Integracion como nodo LoRA en flujos de ComfyUI.
- Carga en la plataforma RunningHub y en Hugging Face como pesos `safetensors`.
- Aplicacion sobre el modelo base krea2; no se declara compatibilidad con otros modelos base.
- Tool calling, function calling y uso como agente: no aplica ni esta documentado.
- Capacidades multilingues, vision, audio o modo de razonamiento: no disponibles.

## Casos de uso

- Postprocesado de retratos generados: aplicar el LoRA al final de un pipeline de generacion en ComfyUI para anadir grano analogico y un ligero desenfoque que rompa la nitidez excesiva tipica de los modelos de difusion actuales.
- Serie fotografica con estetica consistente: usar el mismo adaptador en un lote de imagenes para que todas compartan una textura de pelicula uniforme, util en editorial de moda, moodboards o contenido de marca.
- Edicion de imagenes existentes: combinarlo con un flujo image-to-image para dar acabado analogico a fotografias digitales ya capturadas, sin rehacer la composicion.
- Integracion en ComfyUI para artistas tecnicos: encadenar el LoRA con otros adaptadores (estilo, iluminacion) en grafos reutilizables dentro de ComfyUI.
- Automatizacion via API de RunningHub: invocar el flujo de edicion desde la API de RunningHub para procesar imagenes por lotes sin mantener infraestructura propia de GPU.
- Pruebas de concepto de estilizado analogico: validar rapidamente si el acabado de grano encaja con una direccion de arte antes de invertir en un entrenamiento propio de mayor alcance.
- Prototipado en investigacion de difusion: estudiar como un adaptador de bajo rango modifica la textura de salida de un modelo base dado, como caso de analisis de control estilistico fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM ni evaluaciones humanas), y los resultados de busqueda web obtenidos no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- El adaptador en si ocupa 224 MiB, por lo que el coste de VRAM anadido es marginal. La VRAM total la determina casi por completo el modelo base krea2, cuyo tamano no se especifica.
- VRAM estimada para inferencia: no disponible. Depende integramente del modelo base, de la resolucion de salida y del tipo de precision (fp16, fp8, etc.).
- GPU recomendadas: no disponible, ya que no se conoce el modelo base. En terminos generales, un modelo de difusion de gran tamano en fp16 requeriria GPUs de 24 GB o mas (RTX 4090, A100 40 GB, H100), mientras que una version cuantizada podria caber en GPUs de consumo con 8-12 GB.
- Compatibilidad con GPU de consumo: no confirmada. Depende del modelo base y de su cuantizacion.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub (plataforma declarada) y Hugging Face como repositorio de pesos. Compatibilidad con vLLM o TGI no aplica, ya que son servidores de modelos de lenguaje, no de difusion. No se confirma soporte directo en llama.cpp u Ollama, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible alternativas comparables con datos verificables (parametros, contexto, rendimiento o licencia). Los resultados de busqueda web recibidos no guardan relacion con el modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-krea2-film-grain-lora | no disponible (fichero LoRA de 224 MiB) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican rango del LoRA, capas objetivo, dataset, pasos de entrenamiento ni hiperparametros, lo que dificulta reproducir o auditar el adaptador.
- Licencia no declarada de forma explicita. La model card remite a la licencia del proyecto original o upstream, de modo que el uso comercial no puede darse por supuesto y requiere verificar los terminos de krea2 y de RunningHub.
- Dependencia estricta del modelo base: solo se declara compatibilidad con krea2. Aplicarlo sobre otro base puede degradar la calidad o no funcionar.
- Rendimiento no evaluado: no hay metricas objetivas ni comparaciones, por lo que no puede afirmarse que el acabado sea superior a alternativas genericas de grano o a un postprocesado clasico.
- Riesgo de artefactos y sobreajuste estilistico: al ser un adaptador de bajo rango sin validacion publicada, puede introducir ruido, perdida de detalle en texturas finas o un grano excesivo segun la escala de aplicacion.
- Idiomas: no se documenta soporte multilingue. Los prompts de ejemplo estan en ingles, y los modelos de difusion de este tipo suelen estar entrenados predominantemente con captions en ingles.
- Contenido sensible: la descripcion de ejemplo de la model card incluye una descripcion corporal de caracter sugerente. Conviene revisar la politica de contenido del despliegue si el modelo se va a usar en entornos corporativos o con publico general.
- Sesgos: no disponibles. No hay informacion sobre la distribucion demografica del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; en su lugar existe riesgo de artefactos visuales y de fidelidad insuficiente respecto a la imagen de entrada.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni issues publicos que permitan juzgar su fiabilidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-film-grain-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2082772829715931138
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1980864188878884866
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Paper, repositorio de codigo, demo o benchmarks: no disponibles
