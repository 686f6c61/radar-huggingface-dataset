# canvit/probe-ade20k-40k-dv3s-384px

## Resumen

`canvit/probe-ade20k-40k-dv3s-384px` es una sonda (probe) de segmentacion semantica lineal entrenada sobre caracteristicas congeladas de DINOv3 ViT-S/16 a 384 px de resolucion. No es un modelo generativo ni un transformer completo: es una cabeza de segmentacion de apenas 59.286 parametros (dropout, BatchNorm y una convolucion 1x1) que proyecta los parches de DINOv3 a 150 clases semanticas de ADE20K. Lo publica el equipo de CanViT (Canvas Vision Transformer) como referencia de "vision pasiva" frente a su modelo de vision activa.

El problema que resuelve es metodologico: sirve como linea base controlada para comparar el rendimiento de un backbone pasivo (una sola pasada sobre la imagen completa) contra el paradigma activo de CanViT, que explora la escena mediante una secuencia de vistazos (glimpses) y los integra en un lienzo global. Al estar entrenada con el mismo protocolo de probing que el paper, la comparacion entre ambos enfoques es directa.

Es relevante ahora porque DINOv3 se ha consolidado como backbone de referencia en vision por computador, y este checkpoint permite reproducir la linea base del paper sin reentrenar nada. Su tamano minimo y su licencia MIT lo hacen util para evaluacion rapida, prototipado y generacion automatica de etiquetas, aunque su valor practico dependa por completo del backbone DINOv3 que lo alimenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal de segmentacion: dropout + BatchNorm + convolucion 1x1 sobre caracteristicas de parche de DINOv3 ViT-S/16 |
| Parametros totales | 59.286 (solo la cabeza; excluye el backbone DINOv3 ViT-S/16 congelado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de 384x384 px, que corresponde a una rejilla de 24x24 parches de 16 px |
| Tipos de cuantizacion | no disponible (entrenamiento en autocast de bfloat16; el checkpoint se distribuye en safetensors) |
| Idiomas soportados | no disponible (modelo de vision; las 150 etiquetas de ADE20K estan en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `canvit-pytorch`) |
| Modelo base | facebook/dinov3-vits16-pretrain-lvd1689m |
| Dataset de entrenamiento | scene_parse_150 (ADE20K) |
| Clases de salida | 150 |
| Resolucion de entrada | 384x384 px |
| Descargas / likes | 6 / 0 |
| Fecha de creacion | 2026-03-15 |
| Ultima actualizacion | 2026-09-26 |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La cabeza es deliberadamente simple: dropout con probabilidad 0.1, una capa BatchNorm y una convolucion 1x1 que mapea los 384 canales de caracteristica de cada parche DINOv3 a 150 logits de clase. La salida tiene forma `[1, 150, 24, 24]`, es decir, etiquetas por parche sobre la rejilla 24x24, que despues se reescalan para obtener la segmentacion a resolucion completa. El backbone DINOv3 ViT-S/16 permanece congelado durante todo el entrenamiento; solo se optimiza la sonda.

El entrenamiento se hizo sobre ADE20K con 40.000 pasos, tamano de lote 16, optimizador AdamW con learning rate maximo de 0.0003 y weight decay 0.001. El schedule consiste en 1.500 pasos de warmup lineal seguidos de decaimiento coseno. La aumentacion se limita a recortes aleatorios con escala entre 0.5 y 2 y volteos horizontales, y todo el calculo se ejecuta en autocast de bfloat16. El protocolo es identico al usado en el paper de CanViT, lo que garantiza que la comparacion con la propuesta activa sea limpia.

No hay innovaciones arquitectonicas en esta sonda: su interes esta en el protocolo experimental y en el hecho de que expone el limite de rendimiento de un enfoque pasivo con un backbone concreto antes de introducir cualquier mecanismo de vision activa.

## Capacidades

- Segmentacion semantica densa de escenas con 150 clases de ADE20K (interiores, exteriores, objetos, mobiliario, vegetacion, etc.).
- Extraccion de logits por parche en una rejilla de 24x24 para imagenes de 384x384 px.
- Funciona como extractor de caracteristicas de referencia para evaluar la calidad de las representaciones de DINOv3 ViT-S/16.
- Linea base reproducible para comparar vision pasiva frente a vision activa (episodios de multiples vistazos de CanViT).
- Reutilizable como cabeza generica sobre cualquier mapa de caracteristicas espaciales, ya que `SegmentationProbe` se exporta desde `canvit_pytorch` para su uso independiente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje, solo pixeles.
- No hay modo "thinking", vision multimodal conversacional ni procesamiento de audio.

## Casos de uso

- Linea base de investigacion en vision activa: sirve para fijar el techo de rendimiento de un backbone pasivo DINOv3 ViT-S/16 a 384 px y comparar despues los resultados de un episodio CanViT con T pasos mediante la herramienta `ade20k-seg-dinov3` del repositorio CanViT-eval.
- Preetiquetado de datasets de segmentacion: al ser una cabeza de 59.286 parametros, se puede ejecutar sobre lotes grandes de imagenes para generar mascaras semanticas iniciales que despues se revisan y corrigen manualmente, reduciendo el coste de anotacion.
- Prototipado rapido de pipelines de scene parsing: un desarrollador puede validar en minutos si DINOv3 ViT-S/16 a 384 px es suficiente para su dominio antes de invertir en un backbone mayor o en fine-tuning completo.
- Indexacion y busqueda visual por regiones: las mascaras de 150 clases permiten etiquetar zonas de una imagen y usarlas como metadatos para busqueda, filtrado o analitica de contenido visual.
- Vision para robotica y navegacion en interiores: las clases de ADE20K cubren suelo, pared, puertas, muebles y obstaculos habituales, lo que permite construir mapas semanticos de bajo coste en tiempo de inferencia reducido.
- Analisis de escenas urbanas y de paisaje: la taxonomia de ADE20K incluye carretera, cielo, arboles, vehiculos y edificios, util para estudios de ocupacion de suelo o monitorizacion de entornos exteriores.
- Evaluacion comparativa de backbones: al mantener fija la cabeza y el protocolo de entrenamiento, se puede sustituir el backbone y medir de forma aislada el efecto de la representacion en la calidad de segmentacion.
- Docencia y reproducibilidad: el coste computacional minimo permite que estudiantes reproduzcan un experimento completo de segmentacion semantica con un unico forward de backbone por imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Metrica | Resultado | Notas |
|---|---|---|
| mIoU en ADE20K (val) | no disponible | El paper y el repositorio de evaluacion definen el protocolo, pero no se incluyen cifras en la informacion proporcionada |
| Exactitud por pixel | no disponible | No se proporciona |
| Comparacion con CanViT (T pasos) | no disponible | La herramienta `ade20k-seg-canvit` permite calcularla, pero no se aportan resultados |
| Throughput / latencia | no disponible | No se proporciona |

El repositorio CanViT-eval incluye subcomandos especificos para obtener estas cifras (`ade20k-seg-dinov3` para el backbone pasivo a una resolucion fija con mIoU en t=0, y `ade20k-seg-canvit` para el despliegue de T pasos con mIoU por paso), pero los valores numericos no estan disponibles en la informacion consultada.

## Requisitos de hardware

- La cabeza en si es practicamente gratis: 59.286 parametros ocupan menos de 1 MB en FP32. El coste real esta en el forward del backbone DINOv3 ViT-S/16 congelado.
- VRAM estimada: el checkpoint no publica mediciones. Como referencia orientativa, un ViT-S/16 a 384x384 px (576 parches) en bfloat16 deberia caber holgadamente en menos de 4 GB, incluyendo activaciones, aunque este dato no esta confirmado en la informacion disponible.
- Cabe sin problema en GPU de consumo: cualquier RTX con 6-8 GB o superior es suficiente; tambien se puede ejecutar en CPU, como muestra el ejemplo oficial de la model card, que carga el maestro en `torch.device("cpu")`.
- GPU de datacenter (A100, H100) solo tienen sentido para procesar grandes volumenes de imagenes en paralelo, no por requisitos de memoria.
- Despliegue: la libreria oficial es `canvit-pytorch>=0.2`. No hay evidencia en la informacion disponible de soporte en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de lenguaje. La integracion natural es PyTorch con `load_teacher` y `SegmentationProbe.from_pretrained`.
- Para versiones antiguas de la libreria (`canvit-pytorch<0.2`) hay que pasar `revision="canvit-pytorch-0.1"` a `from_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone / features | Resolucion | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-dv3s-384px | DINOv3 ViT-S/16 congelado | 384 px | 150 clases, rejilla 24x24 | MIT | Este checkpoint |
| canvit/probe-ade20k-40k-dv3s-128px | DINOv3 (la ficha de busqueda apunta a un backbone de la familia DINOv3) | 128 px | Segmentacion ADE20K | MIT | 40.000 pasos; menor resolucion de entrada |
| canvit/probe-ade20k-40k-dv3b-512px | DINOv3 variante "b" | 512 px | Segmentacion ADE20K | MIT | 40.000 pasos; mayor resolucion |
| canvit/probe-ade20k-40k-s512-c32-in21k | CanViT (lienzo 32x32) | 512 px | Segmentacion ADE20K | MIT | Sonda sobre representaciones del propio modelo activo, no sobre un backbone pasivo |

No se dispone de cifras de mIoU para ninguno de estos checkpoints en la informacion proporcionada, por lo que la comparativa se limita a configuracion, resolucion y licencia. La comparacion con alternativas de la industria (SegFormer, UPerNet sobre DINOv2, Mask2Former) no esta disponible en la informacion consultada y requeriria medir todos los modelos con el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el backbone DINOv3 ViT-S/16 no produce ninguna salida util. Cualquier limitacion de DINOv3 se hereda directamente.
- El probe esta entrenado exclusivamente sobre ADE20K (scene_parse_150), por lo que su taxonomia de 150 clases esta sesgada hacia escenas de interiores y exteriores habituales en ese dataset. Dominios como imagenes medicas, satelitales o industriales no estan representados.
- Riesgo de alucinacion en el sentido de falsos positivos de clase: al ser una cabeza lineal sobre caracteristicas congeladas, puede asignar etiquetas plausibles a regiones ambiguas o desconocidas en lugar de abstenerse.
- No hay informacion sobre sesgos geograficos o culturales de ADE20K en la documentacion proporcionada, pero conviene tener en cuenta que el dataset procede de fuentes concretas y no es universalmente representativo.
- La resolucion de entrada esta fijada a 384 px en el protocolo de entrenamiento; usarlo con otras resoluciones sin adaptar la rejilla de parches puede degradar el resultado.
- Uso comercial permitido por la licencia MIT, pero esa licencia cubre el checkpoint de la sonda; el backbone DINOv3 y el dataset ADE20K tienen sus propias condiciones, que hay que verificar por separado antes de un despliegue en produccion.
- Popularidad y adopcion muy bajas (6 descargas, 0 likes), por lo que no hay comunidad ni soporte mas alla del repositorio oficial.
- No hay resultados de mIoU publicados en la informacion disponible, de modo que la calidad real del checkpoint no se puede valorar sin ejecutar la evaluacion por cuenta propia.
- Requiere la libreria `canvit-pytorch`; la compatibilidad de versiones importa (cambios entre 0.1 y 0.2 afectan a `from_pretrained`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-384px
- Backbone base: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Repositorio PyTorch: https://github.com/m2b3/CanViT-PyTorch/tree/main
- Repositorio de evaluacion: https://github.com/m2b3/CanViT-eval
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints de la familia: https://huggingface.co/canvit
- Checkpoint a 128 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-128px
- Checkpoint a 512 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3b-512px
- Sonda sobre lienzo CanViT: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
