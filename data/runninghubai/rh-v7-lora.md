# RunningHubAI/rh-v7-lora

## Resumen

rh-v7-lora es un adaptador LoRA para modelos de difusion de imagen, publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino derivado de una base IL-XL (familia de modelos de imagen de tipo SDXL/Illustrious, segun la nomenclatura del autor) y esta pensado para su uso dentro de ComfyUI o de la plataforma RunningHub. El repositorio contiene un unico archivo de pesos de 544 MiB (`zenghou7_v7.safetensors`), lo que es coherente con un adaptador LoRA de rango bajo sobre un modelo de difusion de ~2.6B parametros, y no con un modelo de lenguaje.

La funcion del adaptador es estilistica: segun la model card, la version v7 mejora la "limpieza" y la suavidad de la pincelada respecto a la v3, incrementa la precision, amplia el dataset de entrenamiento y refuerza el apartado de personajes masculinos. El autor lo describe como un LoRA de "engrosado" (增厚) que aporta volumen y tridimensionalidad a la imagen sin destruir la composicion original, orientado a ilustradores profesionales. La palabra de activacion es `sdwang` y el peso recomendado se situa entre 0.3 y 1.0.

La relevancia de esta ficha es limitada en el contexto de IA open source para desarrolladores: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un adaptador de estilizacion para generacion de imagenes. Ademas, la licencia es restrictiva (prohibe uso comercial de las imagenes generadas y la fusion o reventa del modelo), no se declaran idiomas ni pipeline, y el repositorio no incluye resultados de benchmarks ni documentacion tecnica sobre el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion de imagen; base declarada: IL-XL |
| Parametros totales | no disponible (el adaptador pesa 544 MiB; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el adaptador se usa con el modelo base en la precision de este) |
| Idiomas soportados | no disponibles (los prompts de la model card estan en chino e ingles) |
| Licencia | no disponible como licencia SPDX; la model card impone restricciones: imagenes generadas no comerciales, prohibida la fusion y la reventa del modelo |
| Formato de pesos | safetensors (`zenghou7_v7.safetensors`, 544 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. La model card indica que el modelo se ha ajustado a partir de "IL-XL", lo que apunta a un checkpoint de la familia Illustrious/SDXL, habitual en la generacion de ilustracion anime en ComfyUI. No se especifica el rango del LoRA, las capas objetivo (attention, cross-attention, MLP) ni la tasa de aprendizaje o el numero de pasos de entrenamiento.

Respecto a los datos, el autor afirma que la v7 amplia el dataset respecto a versiones anteriores y refuerza los personajes masculinos, pero no se publica el numero de imagenes, la resolucion de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como regularizacion o captions automaticos. Tampoco hay informacion sobre el numero de tokens (concepto no aplicable a difusion) ni sobre fases de RLHF/DPO. La unica innovacion declarada es cualitativa: mayor "limpieza", pincelada mas suave, mayor volumen y tridimensionalidad, y compatibilidad de apilado con el LoRA anterior "增厚 v3".

## Capacidades

- Generacion y estilizacion de imagenes mediante difusion, aplicando un acabado de mayor volumen y textura sobre el modelo base IL-XL.
- Control del efecto mediante la palabra de activacion `sdwang` y pesos recomendados entre 0.3 y 1.0.
- Apilado y mezcla con otros LoRA, incluida la version anterior del mismo autor, para combinar efectos.
- Refuerzo especifico de personajes masculinos respecto a versiones previas del adaptador.
- Integracion en flujos de ComfyUI y en la plataforma RunningHub (incluida su API).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un adaptador de imagen.
- No se declaran capacidades multilingues, de vision por comprension, audio ni modo "thinking".

## Casos de uso

- Ilustracion profesional con acabado pictorico: aplicar el LoRA con peso 0.6-0.8 sobre un checkpoint IL-XL para obtener imagenes con mayor sensacion de volumen y pincelada limpia, orientadas a portfolios o encargos de ilustracion.
- Produccion de personajes masculinos estilizados: usar el refuerzo declarado en personajes masculinos junto con prompts descriptivos y CFG 7 para generar hojas de personaje consistentes en un pipeline de ComfyUI.
- Exploracion de estilo en estudios de diseno: apilar el LoRA con otros adaptadores de estilo para iterar variantes visuales antes de fijar una direccion artistica, aprovechando la compatibilidad de mezcla declarada.
- Prototipado de keyframes para animacion 2D: generar fotogramas clave con el LoRA y escalarlos con latent upscale (factor 1.2-1.5, denoise 0.45-0.6) para su posterior retoque manual.
- Uso educativo y de investigacion sobre LoRA: estudiar como un adaptador de bajo rango modifica el estilo de un modelo de difusion, comparando pesos y resultados con el modelo base sin adaptador.
- Automatizacion via API de RunningHub: invocar el flujo de generacion desde la API de la plataforma para producir lotes de imagenes de referencia en entornos de prueba no comerciales.
- Apoyo a flujos de retoque: usar el LoRA como paso intermedio para dar cuerpo a una ilustracion y despues corregir detalles con herramientas de edicion, dado que el autor advierte que el escalado excesivo deforma la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, comparativas humanas) ni comparaciones numericas con otros LoRA. Las unicas referencias de rendimiento son cualitativas y subjetivas ("mayor precision", "mas tridimensional").

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador; depende enteramente del modelo base IL-XL (familia SDXL, tipicamente 8-12 GB en fp16 para 1024x1024, y menos con cuantizacion o con el modelo base descargado en fp16/bf16).
- El adaptador en si ocupa 544 MiB en disco y se carga junto al modelo base; no anade requisitos de VRAM significativos por si mismo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por la familia del modelo base, cabria esperar GPUs consumer de gama alta (RTX 3090/4090, 24 GB) y GPUs de datacenter (A100, H100) para lotes grandes, pero esto no lo confirma el autor.
- Cabe en GPU consumer: previsiblemente si, en funcion del modelo base y de la resolucion; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (plataforma principal declarada), RunningHub (web y API). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion.
- Latencia y throughput: no disponibles. La model card sugiere 40 pasos con Euler a en la web de RunningHub y 25 pasos en ComfyUI con el mismo sampler, ademas de 30 pasos para el upscale con denoise 0.45-0.6.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-v7-lora | LoRA de estilo para difusion | IL-XL | no disponible (adaptador de 544 MiB) | no aplica | restrictiva (no comercial, sin fusion ni reventa) | Hugging Face, RunningHub |
| LoRA de estilo genericos para SDXL | LoRA de estilo para difusion | SDXL | variable (tipicamente 50-300 MiB) | no aplica | variable, a menudo CreativeML OpenRAIL-M | Civitai, Hugging Face |
| Modelo base IL-XL | Modelo de difusion completo | - | ~2.6B (familia SDXL) | no aplica | variable segun checkpoint | Hugging Face, Civitai |
| ControlNet para SDXL | Adaptador de control estructural | SDXL | variable | no aplica | variable | Hugging Face |

La comparacion es aproximada: no se dispone de datos publicados de rendimiento del adaptador ni de una evaluacion objetiva frente a otros LoRA de estilo. La diferencia principal frente a alternativas de la comunidad es la licencia mas restrictiva y la dependencia de la plataforma RunningHub para su uso comodo.

## Limitaciones y advertencias

- Licencia restrictiva: las imagenes generadas no pueden usarse comercialmente; no se permite fusionar el modelo ni venderlo, ni alojarlo en sitios o aplicaciones que generen ingresos o donaciones sin permiso del autor.
- La licencia no se presenta con un identificador estandar (SPDX) y la model card remite a "la licencia del proyecto original o upstream", lo que introduce ambiguedad juridica para produccion.
- Riesgo de sobreajuste al estilo: el autor advierte que un escalado demasiado agresivo deforma la imagen; se recomienda escalar en varios pasos pequenos.
- Dependencia de la palabra de activacion `sdwang`: sin ella el efecto puede no aplicarse de forma fiable.
- Sin datos de sesgos: no se documenta la composicion del dataset ni posibles sesgos de representacion (genero, etnia, estilo), aunque el refuerzo de personajes masculinos sugiere un ajuste deliberado de la distribucion.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de artefactos visuales y de resultados inconsistentes con el prompt en pesos altos.
- No hay informacion sobre idiomas de los prompts ni sobre calidad con prompts en castellano; la model card solo muestra ejemplos en chino e ingles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni resultados reproducibles.
- La fecha de creacion indicada (2026-11-02) es posterior a la fecha habitual de publicacion de modelos de esta familia; conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo.
- Uso en produccion: requiere revisar los terminos del autor y de RunningHub, y no es apto para pipelines comerciales sin autorizacion expresa.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-v7-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2014649539990392833
- Pagina del autor: https://www.runninghub.cn/user-center/1998950648152473601
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (dentro del repositorio)
