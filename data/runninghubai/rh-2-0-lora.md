# RunningHubAI/rh-2.0-lora

## Resumen

rh-2.0-lora es un adaptador LoRA de generacion de imagenes a partir de texto (text-to-image) publicado por RunningHubAI, la cuenta en Hugging Face de la plataforma RunningHub. El adaptador se ha entrenado a partir de Z-Image-Turbo y se distribuye como un unico archivo safetensors de 162 MiB, pensado para cargarse en ComfyUI, en la propia plataforma RunningHub o en Hugging Face. No es un modelo autonomo: necesita el modelo base para funcionar.

El repositorio tiene un tamano total de 0,2 GB, cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas soportados. La model card se limita a identificar el modelo base, listar el archivo de pesos y enlazar a la plataforma de RunningHub; no incluye informacion sobre el dataset de entrenamiento, el rango del adaptador, los modulos objetivo ni hiperparametros.

Su relevancia ahora es practica y acotada: sirve como ejemplo de adaptador de estilo o concepto entrenado y distribuido dentro del ecosistema ComfyUI, y aporta un dato operativo concreto, el rango de intensidad recomendado de 0,40 a 0,58 sobre Z-Image-Turbo, por encima del cual la imagen se degrada segun la retroalimentacion recogida en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image; modelo base: Z-Image-Turbo |
| Parametros totales | no disponible (el archivo de pesos del adaptador ocupa 162 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la ventana de texto la fija el codificador de texto del modelo base, no documentado en esta ficha) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas del adaptador ni del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que debe seguirse la licencia del proyecto original o de la fuente |
| Formato de pesos | safetensors (archivo unico `N5BC50TNXN80TJDDCDX4Y9YJS0.safetensors`, 162 MiB) |
| Tipo de modelo | LoRA de text-to-image |
| Modelo base | Z-Image-Turbo |
| Plataformas de uso | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion (metadatos del repo) | 2026-09-23 |
| Ultima actualizacion (metadatos del repo) | 2026-09-23 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo de difusion preentrenado para modificar su comportamiento generativo sin reentrenar los pesos completos. El modelo base declarado es Z-Image-Turbo. No se especifican en la informacion disponible el rango (`rank`), el valor de `alpha`, los modulos objetivo (atencion, proyecciones, bloques de convolucion) ni el framework de entrenamiento utilizado. La plataforma RunningHub ofrece servicios de entrenamiento de modelos, y la model card enlaza a su pagina de formacion, pero no confirma que este adaptador concreto se haya entrenado alli.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, el numero de pasos, la resolucion de entrenamiento ni si se aplicaron tecnicas de regularizacion o de aumento de datos. No hay evidencia de uso de RLHF, DPO ni tecnicas equivalentes, algo por otra parte poco habitual en adaptadores de difusion. La unica innovacion o recomendacion tecnica documentada es operativa: sobre Z-Image-Turbo el adaptador rinde bien con un peso de 0,40 a 0,58, y valores superiores rompen la imagen.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, siempre que se cargue junto al modelo base Z-Image-Turbo.
- Aplicacion de un estilo o concepto aprendido sobre el modelo base, con intensidad ajustable mediante el parametro de peso del LoRA.
- Integracion en flujos de trabajo de ComfyUI, segun la etiqueta `comfyui` del repositorio.
- Ejecucion en la plataforma RunningHub y carga directa desde Hugging Face.
- Produccion por lotes en la medida en que lo permita el pipeline de ComfyUI o la API de RunningHub que envuelva al modelo base.
- No dispone de soporte de tool calling ni de function calling: es un adaptador de imagen, no un modelo de lenguaje.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; no se documenta el comportamiento con prompts en castellano ni en otros idiomas.
- No dispone de modo de razonamiento (thinking), vision de entrada, audio ni ninguna otra capacidad multimodal declarada.

## Casos de uso

- Generacion de imagenes de estilo en ComfyUI: el adaptador se inserta en un nodo de carga de LoRA entre el modelo base y el sampler, y se ajusta el peso en el rango 0,40-0,58 para obtener el efecto deseado sin degradar la imagen.
- Prototipado visual rapido en equipos de diseno: permite explorar variaciones de un concepto grafico sin entrenar un modelo completo, reutilizando Z-Image-Turbo como base.
- Produccion de material grafico para marketing y redes sociales: con una plantilla de ComfyUI parametrizada, se pueden generar lotes de imagenes coherentes de estilo para campanas concretas.
- Automatizacion mediante la API de RunningHub: el adaptador puede invocarse desde un flujo desplegado en la plataforma, de modo que un backend genere imagenes bajo demanda sin mantener infraestructura de GPU propia.
- Creacion de concept art y moodboards para preproduccion audiovisual o videojuegos: util para generar referencias visuales rapidas de personajes, entornos o paletas antes de pasar a produccion.
- Iteracion de direccion de arte: al poder modular la intensidad del adaptador, un equipo puede comparar el mismo prompt con distintos pesos y fijar el grado de influencia del estilo entrenado.
- Base para nuevos entrenamientos: el adaptador puede servir como punto de partida o referencia para entrenar variantes con otros estilos sobre el mismo modelo base.
- Pruebas de compatibilidad en pipelines de difusion: util para verificar que una version concreta de ComfyUI o de la plataforma de despliegue carga correctamente adaptadores en formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIPScore, comparativas humanas ni evaluaciones de fidelidad al prompt), y tampoco hay resultados de conjuntos estandar para modelos de difusion. La unica valoracion recogida es cualitativa y proviene de la propia model card: buen comportamiento con pesos entre 0,40 y 0,58 sobre Z-Image-Turbo, degradacion de la imagen por encima de ese rango y tendencia a que la cara del sujeto se apelmace por efecto del maquillaje.

## Requisitos de hardware

- VRAM del adaptador: la huella del LoRA es de 162 MiB en disco, por lo que su coste adicional en memoria es despreciable frente al modelo base.
- VRAM total para inferencia: no disponible. Depende por completo de Z-Image-Turbo y de la precision o cuantizacion con que se cargue, datos que no se especifican en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. La respuesta depende del modelo base y de la cuantizacion, no del adaptador.
- Opciones de despliegue: ComfyUI (etiqueta declarada del repositorio), plataforma RunningHub (cloud e internacional) y carga desde Hugging Face. Herramientas como vLLM, TGI, llama.cpp u Ollama no aplican, ya que estan orientadas a modelos de lenguaje y no a difusion.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.
- Almacenamiento: 0,2 GB para el repositorio completo, incluido el archivo de pesos de 162 MiB.

## Comparativa con modelos similares

No se dispone de datos publicados de adaptadores LoRA de text-to-image comparables en la informacion proporcionada. La unica referencia cercana localizada es otro adaptador de la misma cuenta, orientado a video en lugar de imagen. La comparacion se limita por tanto a los metadatos disponibles.

| Modelo | Tipo | Modelo base | Formato | Licencia | Datos publicos |
|---|---|---|---|---|---|
| RunningHubAI/rh-2.0-lora | LoRA text-to-image | Z-Image-Turbo | safetensors (162 MiB) | no disponible | 0 descargas, 0 likes; sin benchmarks |
| RunningHubAI/rh-low-lora | LoRA (efecto de camara, orientado a video) | WAN2.2 (LowNoise) | safetensors | no disponible | sin benchmarks en la informacion disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: la model card solo indica que el copyright permanece con el autor y que debe seguirse la licencia del proyecto original o de la fuente. Sin una licencia explicita no hay autorizacion clara para uso comercial, por lo que conviene verificar la licencia de Z-Image-Turbo y contactar con el autor antes de integrarlo en produccion.
- Documentacion insuficiente: no se publican dataset, hiperparametros, rango del adaptador, modulos objetivo ni proceso de entrenamiento, lo que dificulta reproducir o auditar el comportamiento del modelo.
- Ausencia de benchmarks: cualquier afirmacion de calidad es cualitativa; no hay metricas objetivas ni comparaciones controladas.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, por lo que no existe evidencia externa de funcionamiento correcto ni de robustez.
- Sensibilidad al peso del adaptador: segun la propia model card, valores por encima de 0,58 rompen la imagen en Z-Image-Turbo. El rango recomendado es 0,40-0,58.
- Artefactos en rostros: la model card menciona que la cara del sujeto puede apelmazarse por efecto del maquillaje, un fallo relevante para retratos y generacion de personas.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; hereda las limitaciones, sesgos y restricciones de licencia de Z-Image-Turbo.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto con prompts en castellano ni en ningun otro idioma concreto.
- Riesgo de sesgo: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos demograficos, culturales o de representacion en los resultados.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo el mismo dia segun los metadatos, sin historial posterior que indique soporte continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-2.0-lora
- Cuenta del autor en Hugging Face: https://huggingface.co/RunningHubAI
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2018686618621710338
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1990379602688303106
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Catalogo de modelos de RunningHub: https://www.runninghub.ai/models
- Sitio de RunningHub AI: https://runninghubai.pro/
- Otro adaptador de la misma cuenta, rh-low-lora (base WAN2.2 LowNoise): https://huggingface.co/RunningHubAI/rh-low-lora
- Calendario de lanzamientos de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
