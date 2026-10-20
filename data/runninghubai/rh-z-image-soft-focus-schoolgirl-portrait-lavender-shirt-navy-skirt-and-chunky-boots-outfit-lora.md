# RunningHubAI/rh-z-image-soft-focus-schoolgirl-portrait-lavender-shirt-navy-skirt-and-chunky-boots-outfit-lora

## Resumen

rh-z-image-soft-focus-schoolgirl-portrait-lavender-shirt-navy-skirt-and-chunky-boots-outfit-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI (autor RunningHub-@aaronPP) que se aplica sobre el modelo base Z-Image. Su función es fijar un concepto visual muy concreto: un retrato de estilo soft focus de una figura con camisa lavanda, falda azul marino y botas gruesas. No es un modelo autónomo, sino un peso adicional de 81 MiB que debe cargarse junto al modelo de difusión Z-Image en ComfyUI, RunningHub o Hugging Face.

El repositorio es un artefacto de publicación típico de la plataforma RunningHub: un único archivo safetensors, una palabra de activación (NSFQQQQ) y la recomendación de usar una fuerza de LoRA igual o superior a 1.0, preferiblemente con los modelos Z-Image Turbo y con un workflow concreto enlazado por el autor. No incluye información sobre el dataset de entrenamiento, el rango del adaptador, la licencia efectiva ni métricas de calidad.

Su relevancia es limitada y muy específica: sirve para quien necesite reproducir ese look de vestuario y acabado fotográfico dentro de un pipeline de generación de imágenes ya montado sobre Z-Image. Con 0 descargas y 0 likes en el momento de la consulta, no hay validación de la comunidad ni evidencia pública de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion text-to-image Z-Image; rango, alpha y modulos objetivo no disponibles |
| Parametros totales | no disponible (el archivo de pesos ocupa 81 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de LLM (condicionamiento por prompt de texto, longitud maxima no documentada) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors, precision del tensor no confirmada |
| Idiomas soportados | no disponibles (los prompts de la model card aparecen en ingles y chino) |
| Licencia | no disponible; la model card indica que se siga la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`20261015-64703682.safetensors`, 81 MiB) |
| Tipo de modelo | LoRA de text-to-image (pipeline `text-to-image`) |
| Modelo base | Z-Image (fine-tuned from Z-Image) |
| Palabra de activacion | NSFQQQQ |
| Fuerza recomendada | 1.0 o superior |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0.1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base Z-Image para modificar su comportamiento generativo sin reentrenar los pesos completos. El repositorio no documenta el rango utilizado, los modulos objetivo (atención, cross-attention, MLP), el valor de alpha, la resolución de entrenamiento, el número de pasos ni el optimizer. Tampoco se indica si el adaptador se entrenó sobre Z-Image estándar o sobre la variante Turbo; la model card solo señala que es "suitable for z-image turbo models" y que la fuerza recomendada es 1.0 o superior.

No hay información sobre el dataset: se desconoce el número de imágenes, su procedencia, si hubo curación manual, si se usaron imágenes sintéticas o si se aplicó regularización. Tampoco se documenta ningún proceso deRLHF, DPO ni preferencias humanas, algo por otra parte esperable en un LoRA de concepto visual. El entrenamiento se realizó, según la model card, en la infraestructura de RunningHub, que ofrece servicio de entrenamiento propio, pero no se publican hiperparámetros ni curvas de pérdida. La única indicación operativa es la palabra de activación NSFQQQQ y el enlace a un workflow de ComfyUI que, según el autor, mejora los resultados.

## Capacidades

- Generación de retratos de estilo soft focus con un vestuario concreto: camisa lavanda, falda azul marino y botas gruesas.
- Aplicación de un look fotográfico suave (desenfoque leve, iluminación difusa) coherente entre generaciones.
- Condicionamiento mediante palabra de activación (NSFQQQQ) para invocar el concepto entrenado.
- Integración nativa en ComfyUI como nodo de carga de LoRA sobre el modelo Z-Image.
- Ejecución en la nube mediante la API de RunningHub, sin necesidad de GPU local.
- Compatibilidad declarada con modelos Z-Image Turbo, con fuerza de LoRA ajustable (recomendado >= 1.0).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es exclusivamente un adaptador de generación de imágenes.

## Casos de uso

- Previsualización de vestuario en diseño de moda: el LoRA fija una combinación concreta (camisa lavanda, falda azul marino, botas gruesas) y permite generar decenas de variaciones de pose e iluminación sin perder la identidad del conjunto, útil para moodboards antes de producir físicamente la prenda.
- Assets para narrativa visual o novela gráfica: al mantener un mismo outfit y un tratamiento soft focus, se pueden generar ilustraciones consistentes de un personaje a lo largo de varias escenas, siempre que se acompañe del prompt y la palabra de activación NSFQQQQ.
- Producción de imágenes editoriales de temática "soft portrait": el acabado difuso encaja en piezas de lifestyle o beauty para redes sociales, generadas por lotes desde ComfyUI con una semilla y un prompt base controlados.
- Pruebas de concepto en pipelines de difusión: sirve como caso de estudio para medir cómo un LoRA de bajo rango (81 MiB) altera el comportamiento de Z-Image sin tocar los pesos base, útil en experimentos de composición de múltiples adaptadores y ajuste de fuerza.
- Generación por API en la nube: equipos sin GPU pueden invocar el modelo a través de la API de RunningHub y encadenar la generación dentro de un flujo automatizado de publicación de contenido.
- Ampliación de datasets sintéticos: las imágenes generadas con este adaptador pueden usarse como material de partida para etiquetado, aumento de datos o para entrenar un adaptador posterior de estilo, siempre verificando calidad y derechos de uso.
- Docencia y demos de ComfyUI: por su tamano reducido y su dependencia de un único archivo, es adecuado para talleres prácticos sobre carga de LoRA, palabra de activación y ajuste de strength.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros adaptadores, y el repositorio no contiene scripts de evaluación.

## Requisitos de hardware

- VRAM de inferencia: no disponible. El consumo lo determina íntegramente el modelo base Z-Image; el adaptador añade solo 81 MiB de pesos y un coste de computación marginal sobre las capas adaptadas.
- GPU recomendadas: no disponibles en la información proporcionada. Al no publicarse los requisitos del modelo base, no es posible confirmar qué GPU (A100, H100, RTX 4090, etc.) es suficiente.
- GPU de consumo: no confirmado. La viabilidad en tarjetas tipo RTX 3060/4060/4090 depende de la VRAM que exija Z-Image en la precisión y resolución elegidas, dato no documentado en este repositorio.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma cloud y API de RunningHub, y cualquier runtime que cargue el modelo base Z-Image con soporte de adaptadores LoRA. llama.cpp, Ollama y TGI no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de pasos de muestreo, de la resolución y del scheduler configurado en el workflow.

## Comparativa con modelos similares

| Criterio | Este LoRA | Z-Image base (sin adaptador) | Fine-tune completo de un modelo de difusion |
|---|---|---|---|
| Tipo de artefacto | Adaptador LoRA, 81 MiB | Pesos completos del modelo | Pesos completos reentrenados |
| Parametros | no disponible | no disponible en la informacion proporcionada | no disponible |
| Concepto fijado | Retrato soft focus con camisa lavanda, falda azul marino y botas gruesas | Generico, guiado solo por prompt | Depende del dataset de entrenamiento |
| Palabra de activacion | NSFQQQQ | No aplica | No aplica |
| Coste de almacenamiento | Muy bajo (0.1 GB de repo) | Alto | Alto |
| Facilidad de composicion con otros adaptadores | Alta (se puede combinar y ajustar strength) | No aplica | Baja |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | Hugging Face y RunningHub | Requiere localizar el repositorio oficial de Z-Image | Variable |

No se dispone de datos de rendimiento ni de comparaciones cuantitativas con otros LoRA de vestuario o de retrato, por lo que la comparativa es estructural y no de calidad.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream. Antes de un uso comercial es imprescindible verificar la licencia de Z-Image y contactar con el autor; no hay autorización explícita de uso comercial.
- Riesgo de sobreajuste al concepto: al ser un LoRA de concepto único, puede forzar el outfit y el encuadre incluso cuando el prompt pide otra cosa, y perder variedad si se usa con strength alto.
- Sensibilidad a la fuerza y al workflow: el autor recomienda strength >= 1.0 y un workflow concreto; con otros valores o sin ese flujo los resultados pueden degradarse (artefactos, composición rígida, pérdida de detalle).
- Sesgo de representación: el dataset no está documentado, por lo que se desconocen la diversidad de cuerpos, tonos de piel, edades aparentes y contextos presentes en el entrenamiento. Es probable un sesgo hacia un único tipo de retrato.
- Contenido sensible: la temática "schoolgirl" exige extremar las precauciones para garantir que cualquier persona representada sea adulta y que el uso cumpla la legislación aplicable y las políticas de la plataforma.
- Alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta (manos, dedos, proporciones), texto ilegible y detalles incoherentes de la ropa; no hay evaluación publicada de fidelidad.
- Dependencia del modelo base: el adaptador no funciona de forma aislada; cualquier cambio en la versión de Z-Image o en el scheduler puede alterar el resultado.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de calidad ni reportes de fallos.
- Idiomas no documentados: se desconoce el comportamiento con prompts en castellano; la model card está en inglés y chino, y el modelo base puede tener un sesgo hacia el inglés.
- Repositorio mínimo: solo contiene los pesos, sin scripts de inferencia, ejemplos de prompt, ficha de datos ni tarjeta de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-soft-focus-schoolgirl-portrait-lavender-shirt-navy-skirt-and-chunky-boots-outfit-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2110576996959371265
- Pagina del autor: https://www.runninghub.ai/user-center/1931299605898764290
- Workflow recomendado (post del autor): https://www.runninghub.ai/post/1993873213671358466/?inviteCode=rh-v1220
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
