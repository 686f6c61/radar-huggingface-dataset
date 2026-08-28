# kcimc/blind-self-portrait-qwen-image-edit-2511-lora

## Resumen

El modelo `kcimc/blind-self-portrait-qwen-image-edit-2511-lora` es un adaptador LoRA para el modelo base `Qwen/Qwen-Image-Edit-2511`, desarrollado por el usuario kcimc para la instalación artística "Blind Self Portrait". Su función es transformar retratos fotográficos en contornos de línea en blanco y negro (line-art), listos para un posterior proceso de vectorización continua y trazado con plóter. El adaptador está diseñado para integrarse con el acelerador de inferencia `lightx2v/Qwen-Image-Edit-2511-Lightning`, lo que permite generar resultados en solo 4 pasos de inferencia a una resolución de 1024x1024 píxeles.

La relevancia de este LoRA radica en su especialización: en lugar de ofrecer edición general de imágenes, está afinado para una tarea concreta de conversión retrato‑a‑contorno, con un peso validado (`step-1428.safetensors`) y una configuración reproducible. El repositorio tiene un tamaño de 0.5 GB, correspondiente al archivo de pesos en formato `safetensors`, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Aunque se trata de un adaptador de nicho, su existencia demuestra el ecosistema de personalización que rodea a los modelos de edición de imagen de la familia Qwen, donde los LoRA permiten adaptar el comportamiento del modelo base a tareas específicas con un coste computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen-Image-Edit-2511 |
| Parametros totales | no disponible (el repositorio pesa 0.5 GB, pero no se especifica el numero de parametros) |
| Parametros activos | no aplica (es un LoRA, no un modelo MoE) |
| Longitud de contexto | no aplica (modelo de edicion de imagenes) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en bf16 segun el nombre del peso) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`step-1428.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) que modifica los pesos del modelo base `Qwen-Image-Edit-2511`, un modelo de edicion de imagenes desarrollado por Alibaba Cloud que destaca por su consistencia de personaje y razonamiento geometrico. El LoRA esta disenado para producir contornos de retrato en blanco y negro, y se carga junto con el adaptador Lightning de `lightx2v` para acelerar la inferencia a 4 pasos.

No se dispone de informacion detallada sobre el proceso de entrenamiento: no se especifican el dataset utilizado, el numero de tokens, ni si se emplearon tecnicas como RLHF o DPO. El nombre del peso (`step-1428`) sugiere que el entrenamiento se detuvo en el paso 1428, pero no se aportan mas datos. La configuracion validada indica que el adaptador se usa con una escala de 1.0 y una resolucion de trabajo de 1024x1024 píxeles.

## Capacidades

- Conversion de retratos fotograficos a line-art en blanco y negro, especificamente disenado para el pipeline de la instalacion "Blind Self Portrait".
- Compatibilidad con el acelerador Lightning de Qwen-Image-Edit-2511, permitiendo inferencia en 4 pasos en lugar de los pasos completos del modelo base.
- Integracion con la libreria Diffusers mediante la carga de multiples LoRA (`load_lora_weights` y `set_adapters`).
- Hereda las capacidades de edicion de imagen del modelo base Qwen-Image-Edit-2511, como la consistencia de personaje y el razonamiento geometrico, aunque el LoRA esta afinado especificamente para la tarea de contornos.
- Soporte para flujos de trabajo de vectorizacion y trazado automatico, al producir lineas limpias y continuas.

## Casos de uso

- Instalacion artistica "Blind Self Portrait": el adaptador se usa en un pipeline de retrato-a-contorno para generar dibujos lineales que luego se vectorizan y se trazan con un plóter, creando retratos fisicos a partir de fotografias.
- Generacion de line-art para ilustracion: disenadores e ilustradores pueden usar el LoRA para convertir fotografias de personas en bocetos en blanco y negro, acelerando el proceso de creacion de referencias visuales.
- Preprocesado para vectorizacion: al producir contornos limpios, el adaptador facilita la conversion automatica de imagenes raster a vectores mediante herramientas como Potrace o Inkscape, reduciendo el ruido y mejorando la calidad del trazado.
- Creacion de estilos de dibujo a partir de retratos: el LoRA puede aplicarse en proyectos de diseno grafico, camisetas, tatuajes o cualquier medio que requiera un estilo de linea minimalista.
- Automatizacion de retratos en produccion: en entornos de impresion bajo demanda, el adaptador permite generar variantes de line-art de retratos de forma rapida y consistente, gracias a la inferencia de 4 pasos con el acelerador Lightning.
- Experimentacion artistica con edicion de imagen: al ser un LoRA de codigo abierto, otros artistas pueden combinarlo con otros adaptadores o prompts para explorar estilos hibridos de contorno y color.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas sobre la calidad de los contornos generados ni comparaciones con otros metodos de conversion a line-art.

## Requisitos de hardware

- El LoRA en si es ligero (0.5 GB), pero para la inferencia se requiere cargar el modelo base `Qwen-Image-Edit-2511` completo, cuyos requisitos de VRAM no se especifican en la informacion disponible.
- Dado que el modelo base es de la familia Qwen de edicion de imagenes, se recomienda al menos una GPU con 16 GB de VRAM para trabajar a 1024x1024, aunque este dato es una estimacion no confirmada por el autor.
- No se indican GPUs especificas ni opciones de despliegue. El pipeline usa Diffusers, por lo que es compatible con entornos que soporten esa libreria (PyTorch, CUDA).
- La inferencia con el adaptador Lightning reduce los pasos a 4, lo que disminuye la latencia en comparacion con el modelo base sin aceleracion, pero no se proporcionan cifras concretas de throughput.

## Comparativa con modelos similares

No disponible. Este adaptador es un LoRA especifico para una tarea concreta (retrato a line-art) sobre el modelo base Qwen-Image-Edit-2511, y no se han encontrado adaptadores comparables con la misma funcion en la informacion proporcionada. Una comparativa significativa requeriria evaluar otros LoRA de edicion de imagen, pero no se dispone de datos publicos para ello.

## Limitaciones y advertencias

- El adaptador solo ha sido validado para recortes centrados de 1024x1024 píxeles; resultados con otras resoluciones o composiciones pueden variar en calidad.
- No esta disenado para reemplazar al modelo base ni al adaptador Lightning; su uso esta limitado a la tarea de conversion a contornos dentro del pipeline especifico.
- No se ha publicado informacion sobre sesgos o riesgos de alucinacion. Como modelo de edicion de imagen, podria distorsionar rasgos faciales si se usa fuera de las condiciones validades.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y los avisos de licencia correspondientes.
- El repositorio no incluye documentacion sobre el dataset de entrenamiento, lo que limita la reproducibilidad y la evaluacion de posibles sesgos en los contornos generados.

## Enlaces

- Repositorio del LoRA: https://huggingface.co/kcimc/blind-self-portrait-qwen-image-edit-2511-lora
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Blog de Alibaba Cloud sobre Qwen-Image-Edit-2511: https://www.alibabacloud.com/blog/qwen-image-edit-2511-improve-consistency_602762
- LoRA ICEdit en Civitai (ejemplo de otro adaptador para el mismo base): https://civitai.com/models/2257887/qwen-image-edit-2511-icedit-lora
- Repositorio GitHub sobre Qwen-Image-Edit: https://github.com/notOrrytrout/Qwen-Image-edit
