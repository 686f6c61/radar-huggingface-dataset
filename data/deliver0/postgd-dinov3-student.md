# Deliver0/postgd-dinov3-student

## Resumen

PostGD-dinov3-student es el backbone estudiante de un pipeline de destilacion de conocimiento disenado especificamente para imagenes de fondo de ojo post-fotocoagulacion. Lo desarrolla el autor identificado como Deliver0 y se distribuye como un Vision Transformer base con parches de 16x16 (ViT-B/16) de la familia DINOv3, con 85.641.216 parametros y una dimension de embedding de 768. El modelo parte de los pesos publicos de DINOv3 preentrenados sobre LVD-1689M y se afina mediante destilacion desde un profesor congelado DINOv3 ViT-L/16.

La relevancia del modelo esta en el dominio: las imagenes de fondo retiniano tras fotocoagulacion laser presentan patrones de cicatriz que no estan bien representados en los corpus genericos de vision. PostGD aborda esta escasez mediante generacion de imagenes sinteticas guiadas por priors y destilacion profesor-estudiante, de modo que el backbone resultante ofrece representaciones mas transferibles para tareas de segmentacion de cicatrices laser, vasos, disco optico y copa optica, clasificacion de presencia de cicatriz y localizacion de disco/fovea.

Se trata de un artefacto de investigacion: se publican unicamente los pesos crudos del estudiante, sin cabezas de tarea ni pesos EMA, y no constituye un sistema diagnostico validado. La licencia derivada de DINOv3 impone restricciones adicionales respecto al codigo MIT del repositorio PostGD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-B/16 (Vision Transformer, patch size 16, embedding dim 768) |
| Parametros totales | 85.641.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada RGB 224 x 224) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y PyTorch .pth, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de extraccion de caracteristicas visuales, sin capacidades linguisticas) |
| Licencia | dinov3-license (DINOv3 License; no es MIT) |
| Formato de pesos | safetensors (model.safetensors) y PyTorch state dict (student_final.pth) |

## Arquitectura y entrenamiento

El modelo es un transformer de vision puro con atencion global, sin componentes MoE ni estado recurrente. La entrada es una imagen RGB de 224 x 224 con normalizacion ImageNet (media 0.485/0.456/0.406, desviacion 0.229/0.224/0.225) y redimensionado bilineal. El backbone produce un embedding de 768 dimensiones por imagen. La inicializacion proviene de los pesos publicados de DINOv3 ViT-B/16 preentrenados sobre LVD-1689M, y el profesor es un DINOv3 ViT-L/16 congelado.

El entrenamiento de destilacion utiliza 200.000 imagenes sinteticas de fondo de ojo postoperatorio generadas con guiado por priors, durante 200 epocas, con batch global de 640, optimizador AdamW, learning rate 2e-4, weight decay 0.05, warm-up de 500 pasos, decaimiento de learning rate por capa de 0.75, EMA con decaimiento 0.999 y semilla 42. La funcion de perdida combina MSE de caracteristicas a traves de una proyeccion lineal de 768 a 1024 para alinear con el profesor, mas consistencia coseno entre los embeddings del estudiante para dos vistas aumentadas. No se emplean etiquetas manuales de tarea en esta etapa. El autor advierte que la configuracion asociada al checkpoint registra beta=0.01, mientras que el manuscrito especifica beta=0.1, por lo que este candidato no se presenta como reproduccion verificada de todos los ajustes del articulo.

## Capacidades

- Extraccion de caracteristicas visuales de imagenes de fondo de ojo, con salida de embedding de 768 dimensiones.
- Base para adaptacion a segmentacion de cicatriz laser, vasos, disco optico y copa optica.
- Base para clasificacion de presencia de cicatriz laser.
- Base para localizacion de disco optico y fovea.
- Aprendizaje few-shot sobre anotaciones reales escasas, gracias al preentrenamiento en dominio.
- Integracion con la libreria timm (version >= 1.0.31) mediante `timm.create_model` y carga desde Hugging Face Hub.
- No soporta tool calling, function calling, agentes, generacion de texto ni razonamiento multi-paso: es exclusivamente un extractor de caracteristicas visuales.
- No incluye cabezas de tarea: el backbone por si solo no produce predicciones de segmentacion ni clasificacion.

## Casos de uso

- Segmentacion de cicatrices laser en retinografias post-tratamiento: se congela o afina parcialmente el backbone y se entrena una cabeza de segmentacion sobre anotaciones reales, aprovechando que el preentrenamiento ya ha visto patrones sinteticos de cicatriz.
- Segmentacion de vasos retinianos: el modelo sirve como inicializacion para decodificadores tipo U-Net, reduciendo la cantidad de imagenes anotadas necesarias frente a un ViT generico.
- Deteccion y segmentacion de disco optico y copa optica: util para pipelines de calculo de ratio copa/disco en estudios de glaucoma, adaptando el backbone a la morfologia concreta de la camara.
- Localizacion de disco optico y fovea: regresion de coordenadas sobre el embedding global de 768 dimensiones, con cabeceras ligeras y pocas muestras etiquetadas.
- Clasificacion binaria de presencia de cicatriz post-fotocoagulacion: filtrado previo en cohortes retrospectivas para seleccionar imagenes candidatas antes de revision manual.
- Investigacion en adaptacion few-shot y transferencia de dominio en imagen medica: escenario controlado para comparar estrategias de congelacion, fine-tuning parcial y linear probing sobre un backbone ya especializado.
- Preprocesado de cohortes para recuperacion de imagenes similares: extraccion de embeddings de 768 dimensiones e indexacion vectorial para buscar casos morfologicamente parecidos en un archivo hospitalario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB solo para pesos (85,6 M de parametros), mas activaciones; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en FP16/BF16: alrededor de 0,2 GB para pesos; el cuello de botella es el tamano de batch y la resolucion de entrada, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna (RTX 3060, RTX 4090, A100, H100). Para entrenamiento de cabezas de tarea sobre lotes grandes, se recomienda RTX 4090 o superior.
- Cabe holgadamente en GPU consumer: si, incluidas GTX 1660, RTX 3050 y superiores.
- Opciones de despliegue: timm con PyTorch (via `timm.create_model`), carga directa del state dict con `torch.load` para los scripts de PostGD, exportacion a TorchScript u ONNX no documentada en la informacion disponible. No hay soporte publicado para llama.cpp, Ollama, vLLM ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deliver0/postgd-dinov3-student | 85,6 M | Imagen RGB 224 x 224 | Fondo de ojo post-fotocoagulacion | dinov3-license | Hugging Face, timm |
| timm/vit_base_patch16_dinov3.lvd1689m | 85,6 M (arquitectura base identica) | Imagen RGB, resolucion configurable | Vision general (LVD-1689M) | dinov3-license | Hugging Face, timm |
| DINOv3 ViT-L/16 (profesor) | no disponible en la informacion | Imagen RGB | Vision general | dinov3-license | Hugging Face |

La comparacion con alternativas especializadas en fondo de ojo (por ejemplo, backbones preentrenados en retinografia) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un sistema diagnostico ni de planificacion terapeutica validado; su uso previsto es la investigacion.
- No incluye cabezas de tarea ni pesos EMA: el backbone aislado no genera predicciones de segmentacion, clasificacion ni localizacion.
- Requiere anotaciones especificas y validacion para cada nueva tarea, camara y poblacion de pacientes.
- El preentrenamiento se realizo exclusivamente sobre imagenes sinteticas; no se ha entrenado con datos clinicos reales en esta etapa.
- El autor reconoce una discrepancia entre beta=0.1 del manuscrito y beta=0.01 de la configuracion del checkpoint, por lo que la reproduccion completa del metodo no esta garantizada.
- La licencia DINOv3 no es MIT y puede imponer restricciones al uso comercial; debe revisarse LICENSE.md antes de cualquier despliegue productivo.
- Riesgo de sesgo por dominio: el modelo puede no generalizar a camaras, iluminaciones o poblaciones no representadas en la generacion sintetica.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero existe riesgo de falsos positivos o negativos en las cabezas derivadas si se entrenan con datos insuficientes.
- Sin soporte documentado de cuantizacion ni de exportacion a formatos de inferencia optimizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Deliver0/postgd-dinov3-student)
- [Repositorio PostGD (codigo y cabezas de tarea)](https://github.com/Deliver0/PostGD)
- [Guias de entrenamiento y uso downstream](https://github.com/Deliver0/PostGD/tree/main/downstream)
- [Citacion del proyecto](https://github.com/Deliver0/PostGD/blob/main/CITATION.bib)
- [Modelo base upstream: timm/vit_base_patch16_dinov3.lvd1689m](https://huggingface.co/timm/vit_base_patch16_dinov3.lvd1689m)
