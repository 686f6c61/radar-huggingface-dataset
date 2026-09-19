# DelinaresMassates/oreki-krea

## Resumen

oreki-krea es un adaptador LoRA de tipo DreamBooth publicado por el usuario DelinaresMassates en HuggingFace. No es un modelo de lenguaje ni un modelo completo de generacion: es un conjunto de pesos de bajo rango que se injerta sobre Krea 2, el modelo de difusion texto-a-imagen de Krea, para ensenar un concepto concreto invocado mediante el token `0REK1X`. El adaptador se entreno sobre Krea 2 RAW y los ejemplos de la model card se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`.

El repositorio tiene un tamano de 1,0 GB (pesos del adaptador e imagenes de muestra) y se distribuye bajo licencia Apache 2.0. Se publica con la libreria `diffusers` y el pipeline `Krea2Pipeline`, lo que permite cargarlo en unas pocas lineas de Python junto al modelo base. El modelo base declarado es `krea/Krea-2-Raw`, con `krea/Krea-2-Turbo` usado para las inferencias rapidas de los ejemplos.

Su relevancia es acotada y muy especifica: sirve para reproducir de forma consistente un unico concepto visual (aparentemente un personaje, segun el nombre del repositorio y las muestras) sin reentrenar el modelo base. La model card no documenta arquitectura, numero de pasos de entrenamiento, composicion del dataset ni metricas de evaluacion, por lo que la informacion tecnica disponible es minima. Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo ni con Krea 2, solo paginas genericas de efemerides.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (DreamBooth) sobre un modelo de difusion texto-a-imagen; la arquitectura del modelo base Krea 2 no esta documentada en la informacion disponible |
| Parametros totales | no disponible (el repositorio ocupa 1,0 GB, pero no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusion texto-a-imagen; no se especifica el limite de tokens del codificador de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo de la model card estan en ingles) |
| Licencia | apache-2.0 para el adaptador; la licencia del modelo base `krea/Krea-2-Raw` debe verificarse por separado |
| Formato de pesos | safetensors (adaptador LoRA en formato diffusers) |
| Modelo base | krea/Krea-2-Raw (entrenamiento); krea/Krea-2-Turbo (inferencia de las muestras) |
| Token de activacion | 0REK1X |
| Pasos de inferencia de referencia | 8 (Krea 2 Turbo) |
| Guidance scale de referencia | 0.0 |
| Tamano del repositorio | 1,0 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un LoRA de DreamBooth, es decir, un conjunto de matrices de bajo rango entrenadas para anadir un concepto nuevo a un modelo de difusion preexistente sin modificar sus pesos originales. El adaptador se entreno sobre Krea 2 RAW y se evalua visualmente sobre Krea 2 Turbo, la variante destilada para pocos pasos. No se documentan ni el rango del LoRA, ni el numero de imagenes del dataset, ni el numero de pasos de entrenamiento, ni la tasa de aprendizaje, ni si se aplicaron tecnicas adicionales como regularizacion por clase, caption dropout o entrenamiento con texto invertido. Tampoco se indica la arquitectura interna del modelo base (tipo de backbone, codificador de texto o VAE).

La unica innovacion tecnica apreciable es de caracter practico: el adaptador funciona sobre la variante Turbo con solo 8 pasos y `guidance_scale=0.0`, lo que reduce el coste de inferencia frente a un muestreo completo sobre la variante RAW. La model card incluye tres prompts de ejemplo con sus correspondientes imagenes (`sample_0.png`, `sample_1.png`, `sample_2.png`) que ilustran variaciones de encuadre, vestuario y escenario, pero no se aporta ninguna evaluacion cuantitativa ni comparacion objetiva. No hay informacion sobre uso de RLHF, DPO ni tecnicas de alineacion, que por otra parte no aplican a este tipo de modelo.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles, condicionada por el modelo base Krea 2.
- Reproduccion consistente de un concepto unico mediante el token de activacion `0REK1X`, segun los ejemplos de la model card.
- Control de encuadre y composicion a traves del prompt: los ejemplos cubren primer plano, plano medio y plano entero.
- Variacion de vestuario y entorno manteniendo la identidad del concepto (uniforme escolar, sudadera, chaqueta de cuero; aula, parque, calle suburbana).
- Integracion con `diffusers` mediante `pipe.load_lora_weights()`, lo que permite combinarlo con el pipeline `Krea2Pipeline` en Python.
- Inferencia rapida sobre Krea 2 Turbo: 8 pasos y `guidance_scale=0.0` en los ejemplos publicados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades de vision, audio, codigo ni matematicas.
- No se documentan capacidades multilingues; los prompts publicados estan en ingles.

## Casos de uso

- Ilustracion de personaje consistente: un ilustrador puede fijar la identidad de un personaje con el token `0REK1X` y generar variaciones de pose, vestuario y escenario sin perder los rasgos. Es el uso para el que fue entrenado explicitamente y el que cubren los tres ejemplos de la model card.
- Storyboard y previsualizacion de animacion: generar planos de distinta escala (primer plano, plano medio, plano entero) de un mismo personaje para presentar una secuencia ante un cliente o un equipo antes de producir el material definitivo. La coherencia entre planos es precisamente lo que aporta el LoRA.
- Concept art para novela visual o videojuego: producir rapido un conjunto de imagenes de referencia de un personaje en distintos atuendos y localizaciones para fijar su diseno antes de modelarlo en 3D o dibujarlo a mano.
- Creacion de avatares y assets para streaming o redes: generar retratos y escenas coherentes de un mismo personaje para usarlos como imagen de perfil, banners o ilustraciones de publicaciones, manteniendo una imagen de marca estable.
- Prototipado rapido en estudios pequenos: gracias a los 8 pasos sobre Krea 2 Turbo y a `guidance_scale=0.0`, el coste por iteracion es bajo, lo que permite explorar decenas de variaciones en una sesion de trabajo con una sola GPU.
- Contenido para comunidades de fans: generar ilustraciones de un personaje concreto bajo demanda, partiendo de la premisa de que el autor del adaptador y el usuario final deben respetar los derechos aplicables sobre el personaje representado.
- Composicion con otros adaptadores: al cargarse como LoRA en `diffusers`, puede combinarse con otros LoRA del mismo modelo base para mezclar identidad y estilo, siempre que la suma de pesos no degrade la calidad (no documentado en la model card).
- Banco de pruebas para evaluacion de LoRA: util como caso de estudio para medir consistencia de identidad, sobreajuste al dataset y transferencia entre las variantes RAW y Turbo de un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres imagenes de muestra con sus prompts, sin metricas objetivas (FID, CLIP score, similitud de identidad, DINO, etc.) ni comparaciones frente al modelo base sin el adaptador. Las busquedas web realizadas no devolvieron ningun articulo, paper o evaluacion independiente de este adaptador ni del modelo Krea 2.

## Requisitos de hardware

- El adaptador LoRA en si es ligero (el repositorio completo ocupa 1,0 GB, incluyendo imagenes de muestra), pero no puede ejecutarse de forma autonoma: requiere cargar el modelo base Krea 2, que es quien determina el consumo real de VRAM.
- VRAM estimada para inferencia: no disponible. La model card no indica requisitos, y el consumo depende del modelo base Krea 2, de su cuantizacion y de la resolucion de salida, datos que no se proporcionan.
- El codigo de ejemplo carga el pipeline con `torch_dtype=torch.bfloat16` y lo mueve a `cuda`, es decir, asume una GPU con soporte de bfloat16 y memoria suficiente para el modelo base en precisions reducida.
- GPU recomendadas: no disponible. No hay ninguna indicacion sobre modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no verificable con la informacion disponible; depende por completo del modelo base Krea 2.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` es la unica via documentada en la model card. La etiqueta `template:sd-lora` del repositorio sugiere compatibilidad con flujos de trabajo tipo Stable Diffusion (por ejemplo ComfyUI), pero no esta confirmada en la documentacion. vLLM, llama.cpp, Ollama y TGI no aplican: estan orientados a modelos de lenguaje, no a modelos de difusion.
- Latencia y throughput: no disponibles. Solo se conoce la configuracion de muestreo de los ejemplos (8 pasos, `guidance_scale=0.0` sobre Krea 2 Turbo), que es indicativa de un regimen de inferencia rapida, pero sin tiempos medidos.
- Almacenamiento: el repositorio ocupa 1,0 GB, a lo que hay que sumar el espacio del modelo base Krea 2.

## Comparativa con modelos similares

No se dispone de datos publicados de otros LoRA comparables (ni de parametros, ni de contexto, ni de rendimiento), por lo que la comparacion numerica no es posible. La unica comparacion verificable con la informacion disponible es frente al modelo base sin el adaptador.

| Modelo | Tipo | Modelo base | Token de activacion | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| DelinaresMassates/oreki-krea | LoRA DreamBooth texto-a-imagen | krea/Krea-2-Raw | 0REK1X | apache-2.0 (adaptador) | no disponibles |
| krea/Krea-2-Raw (base) | modelo de difusion texto-a-imagen | no aplica | no aplica | no disponible en la informacion proporcionada | no disponibles |
| krea/Krea-2-Turbo | variante destilada para pocos pasos | no aplica | no aplica | no disponible en la informacion proporcionada | no disponibles |
| Otros LoRA de personaje para el mismo base | adaptador LoRA | krea/Krea-2-Raw | no disponible | no disponible | no disponibles |

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador solo anade un concepto concreto. Fuera del token `0REK1X` no aporta ninguna capacidad adicional al modelo base.
- Sesgo de dataset: al ser un DreamBooth entrenado sobre un conjunto reducido de imagenes (no documentado), es probable el sobreajuste a los encuadres, fondos o atuendos presentes en las muestras. No se documenta regularizacion por clase.
- Riesgo de sobreajuste al trigger: los prompts de ejemplo incluyen siempre el token y, en dos de los tres casos, la palabra "him", lo que sugiere dependencia del contexto textual para obtener buenos resultados.
- Alucinacion visual: como cualquier modelo de difusion, puede generar cuerpos deformados, manos incorrectas, texto ilegible o incoherencias en escenarios complejos. No se publican tasas de fallo.
- Idiomas: no se documenta soporte multilingue. Los prompts de ejemplo estan en ingles y el comportamiento con prompts en castellano es desconocido.
- Restricciones de licencia: el adaptador se publica como apache-2.0, pero el modelo base Krea 2 tiene su propia licencia, que no se detalla en la informacion disponible y que debe consultarse antes de cualquier uso comercial. La licencia del adaptador no exime de cumplir la del modelo sobre el que se carga.
- Derechos sobre el personaje: el repositorio y las muestras apuntan a un concepto de personaje concreto (el nombre del repositorio, "oreki", y las descripciones de uniforme escolar y retratos). Generar o distribuir imagenes de un personaje protegido puede infringir derechos de autor o de marca, con independencia de la licencia del adaptador. No se documenta ninguna autorizacion al respecto.
- Ausencia de evaluacion: sin metricas objetivas ni validacion independiente, no es posible estimar su calidad relativa frente a otros adaptadores.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas de publicacion inusuales en los metadatos (creacion y actualizacion en septiembre de 2026), que conviene verificar antes de integrarlo en un flujo de trabajo en produccion.
- Dependencia de versiones: el codigo de ejemplo usa una clase de pipeline (`Krea2Pipeline`) que debe existir en la version de `diffusers` instalada; no se especifica la version minima compatible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DelinaresMassates/oreki-krea
- Modelo base de entrenamiento (referenciado en los metadatos): https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia (referenciado en el codigo de ejemplo): https://huggingface.co/krea/Krea-2-Turbo
- Imagenes de muestra en el repositorio: `sample_0.png`, `sample_1.png`, `sample_2.png` (en la raiz del repositorio de HuggingFace)
- Documentacion de `diffusers` para carga de LoRA: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Papers, blogs o demos adicionales: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo ni con Krea 2.
