# canvit/probe-ade20k-40k-dv3s-144px

## Resumen

canvit/probe-ade20k-40k-dv3s-144px es una sonda lineal (linear probe) de segmentacion semantica entrenada sobre caracteristicas congeladas de DINOv3 ViT-S/16 a una resolucion de entrada de 144 x 144 px. No es un modelo generativo ni un transformer completo: es una cabeza de segmentacion minúscula (59.286 parametros segun el fichero safetensors) que se aplica sobre los parches espaciales que produce el backbone DINOv3, tambien congelado. Su funcion es servir de referencia pasiva dentro del proyecto CanViT (Canvas Vision Transformer), un modelo fundacional de vision activa presentado en NeurIPS 2026.

El modelo lo publica la organizacion canvit, autora del paper "CanViT: Toward Active-Vision Foundation Models" (arXiv:2603.22570), y se apoya en la libreria canvit-pytorch. La sonda sigue el protocolo de probing descrito en el paper: 40.000 pasos de entrenamiento con batch size 16, optimizador AdamW, learning rate maximo de 0.0003 y decaimiento coseno tras un calentamiento lineal de 1.500 pasos. El dataset de entrenamiento es scene_parse_150 (ADE20K), con 150 clases semanticas.

Su relevancia es metodologica mas que de producto: permite medir cuanto de la informacion densa de una escena es decodificable linealmente a partir de caracteristicas de un backbone pasivo a baja resolucion (144 px), y compararlo con los resultados de CanViT-B reportados en el paper (38,5 % mIoU con un unico glimpse de baja resolucion y 45,9 % mIoU con glimpses adicionales). La salida tiene forma [1, 150, 9, 9], es decir, logits por pixel sobre una rejilla de 9 x 9 parches (144 / 16 = 9) con 384 dimensiones de caracteristica por parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal: dropout + BatchNorm + convolucion 1 x 1 sobre caracteristicas de parche congeladas de DINOv3 ViT-S/16 |
| Parametros totales | 59.286 (solo la sonda) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 144 x 144 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | facebook/dinov3-vits16-pretrain-lvd1689m (congelado) |
| Entrada | imagen RGB preprocesada a 144 x 144 px |
| Salida | logits de 150 clases en rejilla de 9 x 9 parches ([1, 150, 9, 9]) |
| Dataset de entrenamiento | scene_parse_150 (ADE20K) |
| Libreria | canvit-pytorch (>= 0.2) |
| Revision legacy | canvit-pytorch 0.1 disponible en la revision `canvit-pytorch-0.1` |
| Descargas / likes en HuggingFace | 7 / 0 |
| Fecha de creacion / actualizacion | 2026-03-15 / 2026-09-26 |

## Arquitectura y entrenamiento

La sonda es deliberadamente simple: dropout, BatchNorm y una convolucion 1 x 1 aplicada sobre el mapa de caracteristicas de parche del backbone. El backbone DINOv3 ViT-S/16 permanece totalmente congelado y solo se usa como extractor de caracteristicas; los parches se reordenan a una rejilla espacial de 9 x 9 con 384 canales antes de entrar en la sonda. Este diseno convierte la tarea en una comprobacion directa de la linealidad de las caracteristicas: si un clasificador tan pequeno recupera la segmentacion densa, la informacion espacial ya esta presente en las representaciones del backbone.

El entrenamiento consta de 40.000 pasos con batch size 16, AdamW con learning rate maximo 0.0003 y weight decay 0.001, calentamiento lineal de 1.500 pasos seguido de decaimiento coseno, dropout de 0.1 y autocast en bfloat16. La augmentation aplicada consiste en recortes aleatorios de escala entre 0.5 y 2 junto con volteos horizontales. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo discriminativo de vision. La innovacion tecnica relevante no esta en la sonda en si, sino en el marco del paper: el uso de una sonda lineal como referencia pasiva frente a modelos de vision activa que seleccionan glimpses de forma secuencial.

## Capacidades

- Segmentacion semantica densa de 150 clases de ADE20K (escenas de interior y exterior) a partir de imagenes de 144 x 144 px.
- Extraccion de logits por pixel sobre una rejilla de 9 x 9, con 384 dimensiones de caracteristica por parche procedentes de DINOv3 ViT-S/16.
- Uso como referencia pasiva (baseline) para comparar contra modelos de vision activa como CanViT.
- Integracion como modulo dentro de canvit-pytorch: la clase SegmentationProbe puede cargarse con from_pretrained y aplicarse a cualquier mapa de caracteristicas espacial, no solo al de este backbone.
- Empaquetado con CanViTForSemanticSegmentation en la libreria de referencia, que combina un modelo CanViT y una cabeza de segmentacion y devuelve logits a resolucion de rejilla de canvas, con upsampling bilineal en el metodo predict.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, capacidades multilingues, vision general, audio ni modo de pensamiento. Es exclusivamente una cabeza de segmentacion.

## Casos de uso

- Baseline de investigacion en vision activa: sirve para cuantificar cuanto rendimiento denso se obtiene sin seleccion activa de informacion, a 144 px y con el backbone congelado, y compararlo con los resultados de CanViT-B del paper (38,5 % mIoU por glimpse unico).
- Preetiquetado de datasets de segmentacion: al producir logits por pixel de 150 clases, puede generar mascaras iniciales sobre imagenes de escenas, que despues se revisan o refinan manualmente, reduciendo el coste de anotacion en pipelines de datos de vision.
- Prototipado rapido en CPU: con solo 59.286 parametros en la sonda, el cuello de botella es el backbone ViT-S/16 a 144 px, un coste bajo que permite probar el pipeline completo en un portatil sin GPU.
- Percepcion de bajo coste en robotica o navegacion: para tareas que solo necesitan una segmentacion gruesa de la escena (suelo, paredes, mobiliario) a resolucion reducida, la rejilla de 9 x 9 puede ser suficiente y el coste computacional es minimo.
- Evaluacion comparativa de backbones: al ser un protocolo de probing estandarizado (40.000 pasos, hiperparametros fijos), permite sustituir el backbone y medir de forma comparable la calidad de sus caracteristicas espaciales para segmentacion.
- Control de calidad en pipelines de vision: la salida densa por pixel puede usarse para detectar regiones mal clasificadas o cambios de escena en flujos de imagenes con resolucion baja.
- Docencia y reproduccion de resultados: el ejemplo de uso documentado (carga del teacher, preprocesado a 144 px, ejecucion en modo inferencia) es lo bastante corto para reproducir el experimento en un notebook.
- Base para fine-tuning de sondas propias: la clase SegmentationProbe puede reentrenarse sobre otros datasets o resoluciones siguiendo el mismo protocolo con canvit-pytorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de este checkpoint en la informacion disponible. El paper asociado si reporta cifras para el modelo CanViT-B, que se incluyen a continuacion como contexto y no como rendimiento de esta sonda:

| Modelo | Benchmark | Resultado | Notas |
|---|---|---|---|
| CanViT-B | ADE20K mIoU | 38,5 % | Un unico glimpse de baja resolucion; supera los 27,6 % del mejor modelo activo previo con 20 veces menos FLOPs de inferencia |
| CanViT-B | ADE20K mIoU | 45,9 % | Con glimpses adicionales |
| canvit/probe-ade20k-40k-dv3s-144px | ADE20K mIoU | no disponible | No se publica la metrica de esta sonda en la informacion proporcionada |

## Requisitos de hardware

- La sonda ocupa 59.286 parametros; en bfloat16 el peso es de aproximadamente 0,12 MB, por lo que su huella de memoria es despreciable.
- El coste real lo determina el backbone DINOv3 ViT-S/16 congelado a 144 x 144 px; la informacion proporcionada no detalla su numero de parametros ni sus requisitos de VRAM.
- Estimacion orientativa (no oficial): por debajo de 1 GB de VRAM para inferencia a 144 px con el backbone ViT-S/16 y la sonda en bfloat16.
- Cabe sin problema en GPU de consumo (RTX 3060, RTX 4090, etc.), en GPU integradas e incluso en CPU para inferencia puntual.
- El ejemplo de la model card ejecuta explicitamente el teacher en torch.device("cpu"), lo que confirma que el pipeline es viable sin GPU.
- Opciones de despliegue: PyTorch con canvit-pytorch (>= 0.2) como via documentada. vLLM, TGI, llama.cpp u Ollama no son aplicables: no es un modelo de lenguaje ni un transformer autoregresivo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de entrada | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-dv3s-144px | Sonda lineal sobre DINOv3 ViT-S/16 | 144 px | 59.286 | MIT | HuggingFace |
| canvit/probe-ade20k-40k-dv3s-128px | Sonda lineal de segmentacion sobre DINOv3 | 128 px | no disponible | no disponible | HuggingFace |
| canvit/probe-ade20k-40k-dv3s-256px | Sonda lineal sobre caracteristicas espaciales de DINOv3 ViT-S/16 | 256 px | no disponible | no disponible | HuggingFace |
| CanViT-B | Modelo fundacional de vision activa (canvas) | no disponible | no disponible | no disponible | Repositorio del proyecto |

Nota sobre los datos de comparacion: la busqueda web indica que el checkpoint de 128 px lista facebook/dinov3-vit7b16-pretrain-lvd1689m como modelo base, mientras que los checkpoints de 144 px y 256 px se asocian a DINOv3 ViT-S/16; esta discrepancia procede de los resultados de busqueda y no esta confirmada en la model card de este repositorio.

## Limitaciones y advertencias

- Resolucion de entrada muy baja (144 px) y rejilla de salida de solo 9 x 9: los bordes de los objetos son gruesos y la segmentacion de estructuras finas es limitada; el upsampling bilineal agrega suavizado adicional.
- La sonda no generaliza fuera de las 150 clases de ADE20K ni fuera del dominio de escenas de scene_parse_150.
- Depende de un backbone externo congelado: sin facebook/dinov3-vits16-pretrain-lvd1689m no funciona; el repositorio pesa 0.0 GB porque solo contiene la sonda.
- Requiere la libreria canvit-pytorch; no es un modelo autonomo cargable con transformers de forma directa.
- La licencia MIT declarada cubre este repositorio, pero la informacion proporcionada no detalla los terminos de licencia del backbone DINOv3 subyacente; conviene verificarlos antes de un uso comercial.
- Riesgo de error de clasificacion por pixel (falsos positivos y negativos de clase) en lugar de alucinacion textual: no hay generacion de texto, de modo que las salidas son mapas de clases y su fiabilidad depende del dominio.
- Sesgos potenciales heredados del dataset ADE20K y del backbone DINOv3 (composicion geografica y tematica del dataset de imagenes), no cuantificados en la informacion disponible.
- Sin soporte multilingue ni capacidades de agente, tool calling o razonamiento multi-paso: no debe evaluarse como un LLM.
- Adopcion practicamente nula hasta la fecha (7 descargas, 0 likes), por lo que no existe validacion comunitaria independiente del comportamiento del checkpoint.
- Para compatibilidad con canvit-pytorch < 0.2 hay que pasar revision="canvit-pytorch-0.1" en from_pretrained; no hacerlo puede provocar errores de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-144px
- Modelo base: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo de referencia: https://github.com/m2b3/CanViT
- Repositorio PyTorch alternativo: https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints de la organizacion: https://huggingface.co/canvit
- Checkpoint equivalente a 256 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-256px
- Checkpoint equivalente a 128 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-128px
- Libreria canvit-pytorch en PyPI: https://pypi.org/project/canvit-pytorch/
