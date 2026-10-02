# canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-04-06-mlx

## Resumen

CanViT (Canvas Vision Transformer) es un modelo de vision artificial de tipo "vision activa" (active-vision) desarrollado por el autor canvit, que aborda la clasificacion de imagenes recorriendo una escena mediante una secuencia de "vistazos" (glimpses) en lugar de procesarla de una sola pasada. La idea central es que el modelo muestrea regiones concretas de la imagen a traves de una serie de viewpoints y acumula la informacion en un lienzo o canvas de representacion global, de modo que construye una memoria de la escena a medida que la explora. Esta ficha corresponde al checkpoint concreto `canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-04-06-mlx`, que es la version finetuneada en ImageNet-1k (IN1k, 1000 clases) y exportada al formato nativo de MLX.

El modelo parte de un backbone ViT-B/16 (vision transformer base con parches de 16 px), sobre el que se anaden modulos especificos de canvas: 8 cabezas de atencion con dimension 128, proyecciones asimetricas, 5 registros en el backbone y 16 registros en el canvas, con `enable_reads` y `enable_vpe` activados. El checkpoint tiene 95.928.936 parametros totales (aproximadamente 96 M) y un tamano de repositorio de 0,4 GB, lo que lo situa en la gama de los clasificadores de vision de escala media. La geometria de validacion es de escenas de 512 px, vistazos de 128 px y un canvas de 32 x 32.

Su relevancia actual radica en que propone una foundation model de vision activa, un paradigma distinto del clasificador de imagen estatico convencional, y en que se distribuye con licencia MIT, pesos en safetensors y una implementacion especifica para MLX que permite ejecutarlo en hardware de Apple Silicon. El trabajo se respalda con un paper presentado en NeurIPS 2026 (arXiv:2603.22570) y con repositorios publicos de codigo tanto en MLX como en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canvas Vision Transformer (CanViT); backbone ViT-B/16 con modulo canvas (vision activa) |
| Parametros totales | 95.928.936 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de vision con canvas de 32 x 32, escenas de 512 px y vistazos de 128 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo de checkpoint identificado como `d63be48b-fd67-4299-b1c7-c7b3a2b3a238`) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer de vision ViT-B/16 con parches de 16 px y un modulo canvas que funciona como memoria de escena. Segun la configuracion publicada, el modelo usa `canvas_head_dim` de 128, `canvas_num_heads` de 8, proyecciones de canvas asimetricas, `enable_reads` y `enable_vpe` activos, 5 registros en el backbone y 16 registros en el canvas, y un `rw_stride` de 2. El flujo de inferencia expuesto en la model card consiste en inicializar un estado (por ejemplo, `canvas_grid_size=32`), definir un `Viewpoint` (por ejemplo, la escena completa) y muestrear un glimpse de 128 px sobre la escena de 512 px; el modelo devuelve logits y el estado actualizado del canvas, que se realimenta en llamadas sucesivas. Es, por tanto, un modelo recurrente sobre una representacion persistente, no un transformer de una sola pasada.

En cuanto al entrenamiento, la informacion disponible indica que este checkpoint es un finetune sobre ImageNet-1k con tarea de 1000 clases (`n_classes: 1000`), a partir de un checkpoint fuente identificado en el repositorio principal. El nombre del modelo codifica la geometria de entrenamiento y validacion: glimpses de 128 px y escenas de 512 px sobre IN1k. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset mas alla de IN1k, ni si se emplearon tecnicas de RLHF o DPO; dado que es un modelo de vision, estos apartados probablemente no aplican en los terminos habituales de los modelos de lenguaje. La innovacion tecnica destacable es el propio mecanismo de vision activa con canvas, junto con la variante `enable_vpe` (viewpoint/positional encoding) empleada en esta version.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k, con salida de logits mediante la clase `CanViTForImageClassification`.
- Procesamiento de escenas por vistazos: muestreo de regiones definidas por un `Viewpoint` y agregacion progresiva en un canvas de 32 x 32.
- Memoria de escena persistente: el estado del canvas se conserva entre llamadas, lo que permite refinar la prediccion a medida que se exploran mas zonas.
- Capacidad de "lectura" sobre el canvas (`enable_reads`) y uso de codificacion de viewpoint (`enable_vpe`).
- Ejecucion nativa en MLX, orientada a hardware de Apple Silicon.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, agentes, audio ni modo de razonamiento (thinking). El pipeline declarado es exclusivamente `image-classification`.

## Casos de uso

- Clasificacion de imagenes de catalogo: dado un conjunto de fotografias de producto, el modelo devuelve la clase IN1k correspondiente; su licencia MIT permite integrarlo en sistemas comerciales sin restricciones de uso derivadas de la licencia.
- Analisis de escenas de alta resolucion por regiones: para imagenes grandes se puede recorrer la escena con varios `Viewpoint` y dejar que el canvas acumule evidencia, en lugar de reescalar toda la imagen a una resolucion unica.
- Investigacion en vision activa: sirve como punto de partida reproducible para estudiar politicas de seleccion de vistazos y comparar arquitecturas de memoria de escena frente a clasificadores estaticos.
- Prototipado en Mac: al estar implementado en MLX y ocupar 0,4 GB en repositorio, permite experimentar con clasificacion de imagenes en un portatil Apple Silicon sin GPU dedicada.
- Etiquetado asistido de datasets: el modelo puede predecir clases de ImageNet sobre grandes lotes de imagenes para pre-anotar y priorizar la revision humana.
- Filtrado y moderacion preliminar por categoria visual: dentro de las 1000 clases soportadas, puede usarse como filtro de primera etapa para clasificar contenido antes de pasar a un modelo mas costoso.
- Extraccion de caracteristicas para tareas downstream: el estado del canvas y las representaciones internas pueden alimentar clasificadores o recuperadores especificos de dominio, siempre que se valide su calidad.
- Demostraciones de inferencia incremental: la API de estado permite construir demos interactivas en las que el usuario selecciona regiones y observa como cambia la prediccion tras cada vistazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card identifica el checkpoint como un finetune en ImageNet-1k y describe la geometria de validacion (escenas de 512 px, vistazos de 128 px, canvas de 32 x 32), pero no incluye cifras de exactitud, top-5, throughput ni comparaciones numericas con otros modelos. Los resultados de la busqueda web no aportan datos de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada: con 95.928.936 parametros, en precision de 16 bits el peso ocupa aproximadamente 0,19 GB y en 32 bits alrededor de 0,38 GB; el repositorio completo es de 0,4 GB. El consumo real de memoria dependera del tamano de lote, del canvas y del backend.
- GPU compatibles: la version de esta ficha usa MLX, que esta disenada para Apple Silicon (familias M1, M2, M3 y M4). Para GPU NVIDIA o AMD habria que recurrir a la implementacion en PyTorch del proyecto (repositorio CanViT-PyTorch), cuyo soporte concreto de hardware no esta detallado en la informacion disponible.
- Cabe en hardware de consumo: si, por su tamano de parametros es un modelo ligero que deberia ejecutarse sin dificultad en equipos Apple Silicon de gama de portatil con memoria unificada suficiente.
- Opciones de despliegue: MLX a traves de la libreria `canvit-mlx` (instalacion con `uv sync --project canvit-mlx` desde el repositorio fuente). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un clasificador de vision de este tipo.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de CanViT en la informacion proporcionada, por lo que cualquier comparacion numerica seria especulativa. A modo de referencia estructural, se puede situar frente a clasificadores ViT de escala similar:

| Modelo | Parametros | Paradigma | Contexto/entrada | Licencia | Rendimiento |
|---|---|---|---|---|---|
| CanViT (este checkpoint) | 95,9 M | Vision activa con canvas, backbone ViT-B/16 | Escenas 512 px, vistazos 128 px, canvas 32 x 32 | MIT | no disponible |
| ViT-B/16 clasico (ImageNet-1k) | no disponible en esta ficha | Transformer de una sola pasada | Imagen unica reescalada | no disponible en esta ficha | no disponible |
| Otros clasificadores ViT de escala B | no disponible en esta ficha | Transformer de una sola pasada | Imagen unica reescalada | no disponible en esta ficha | no disponible |

La comparacion relevante para CanViT no es tanto el numero de parametros como el paradigma: frente a un ViT-B/16 estatico, CanViT recorre la escena y mantiene estado. La informacion disponible no permite cuantificar la ventaja o desventaja de ese enfoque.

## Limitaciones y advertencias

- Sesgos: no se documentan analisis de sesgo en la informacion disponible. Al estar finetuneado en ImageNet-1k, hereda las limitaciones y sesgos de anotacion de ese conjunto.
- Alucinacion: no aplica en el sentido generativo; el modelo produce logits de clasificacion, no texto. El riesgo equivalente es la sobreconfianza en clases incorrectas.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje, por lo que no tiene capacidades multilingues ni ventana de contexto textual. Esta restringido a clasificacion de imagenes en las 1000 clases de ImageNet-1k.
- Restricciones de licencia: licencia MIT, permisiva y apta para uso comercial; conviene aun asi revisar las condiciones del codigo del repositorio y del checkpoint fuente.
- Dependencia de backend: esta version es exclusivamente MLX, lo que limita su uso a Apple Silicon salvo que se migre a la implementacion en PyTorch.
- Reproducibilidad: el resultado depende de la geometria declarada (escenas de 512 px, vistazos de 128 px, canvas de 32 x 32); usarla con otras resoluciones puede degradar el rendimiento.
- Madurez del ecosistema: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la libreria `canvit-mlx` no es una herramienta de despliegue extendida, por lo que el soporte y la documentacion son limitados.
- Produccion: no hay cifras publicas de latencia, throughput ni robustez, por lo que cualquier despliegue en produccion exigiria una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-04-06-mlx
- Checkpoint fuente: https://huggingface.co/canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-2026-04-06/tree/253afab329424a4efd2b3b58f0508b42e848de95
- Paper (NeurIPS 2026, arXiv:2603.22570): https://arxiv.org/abs/2603.22570
- Repositorio de codigo (MLX): https://github.com/m2b3/CanViT
- Repositorio de codigo (PyTorch): https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
