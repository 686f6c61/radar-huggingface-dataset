# canvit/probe-ade20k-40k-dv3s-160px

## Resumen

`canvit/probe-ade20k-40k-dv3s-160px` es una cabeza de segmentación semántica lineal entrenada sobre características congeladas de DINOv3 ViT-S/16 a 160 píxeles de resolución de entrada. No es un modelo de propósito general ni un modelo generativo: es una sonda (linear probe) de 59.286 parámetros que proyecta los descriptores espaciales del backbone a 150 clases semánticas de ADE20K. Lo publica el equipo de CanViT (m2b3) como referencia de "visión pasiva" dentro del ecosistema de su modelo de visión activa Canvas Vision Transformer.

Su relevancia es metodológica: sirve como línea base controlada para comparar un modelo de visión activa (que ve la escena mediante una secuencia de vistazos y la memoriza en un lienzo) contra un transformer de visión estándar que procesa la imagen completa de una sola pasada. El entrenamiento sigue el protocolo de probing del paper de CanViT (NeurIPS 2026), con el backbone DINOv3 completamente congelado, de modo que cualquier diferencia de rendimiento se atribuye al extractor de características y no a la cabeza.

El modelo se distribuye en formato safetensors bajo licencia MIT, con la librería `canvit-pytorch` (>= 0.2), y está pensado para ejecutarse en CPU sin problema dado su tamaño. Existen variantes del mismo probe a 128 px y 256 px, además del modelo CanViT completo, que según el paper alcanza 38,5 % mIoU en ADE20K con un solo vistazo de baja resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre características congeladas de DINOv3 ViT-S/16: dropout + BatchNorm + convolución 1 x 1 |
| Parametros totales | 59.286 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de imagen de 160 x 160 px; rejilla de parches de 10 x 10 con 384 dimensiones por parche) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Backbone asociado | facebook/dinov3-vits16-pretrain-lvd1689m (congelado, no incluido en el repo) |
| Dataset de entrenamiento | scene_parse_150 (ADE20K), 150 clases |
| Pipeline | image-segmentation |
| Libreria | canvit-pytorch >= 0.2 |

## Arquitectura y entrenamiento

La cabeza es deliberadamente mínima: dropout con probabilidad 0,1, una capa de BatchNorm y una convolución 1 x 1 que mapea los 384 canales de características por parche a 150 logits de clase. El backbone no se entrena: se congelan los pesos de DINOv3 ViT-S/16 y se extraen sus `patches`, que se reorganizan en una rejilla espacial de 10 x 10 (160 px / tamaño de parche 16 = 10). La salida del probe es un tensor `[1, 150, 10, 10]` que corresponde a logits por celda de la rejilla, no a resolución de píxel; el upsampling bilineal lo añade `CanViTForSemanticSegmentation` o el consumidor que lo use.

El entrenamiento consistió en 40.000 pasos con batch size 16, optimizador AdamW, learning rate máximo de 0,0003 y weight decay 0,001, con un calentamiento lineal de 1.500 pasos seguido de decaimiento coseno. La aumentación se limita a recortes aleatorios de escala 0,5 a 2 y volteos horizontales, y el cálculo se hizo en autocast de bfloat16. No se documenta RLHF, DPO ni ningún tipo de ajuste por preferencias, algo esperable en un modelo de segmentación. Como innovación destacable del ecosistema, el paper de CanViT propone que las características de salida a escala de escena sean linealmente decodificables en predicciones densas sin upscaling posterior, y este checkpoint es precisamente la sonda que materializa ese protocolo sobre el profesor DINOv3.

## Capacidades

- Segmentación semántica densa de escenas con 150 clases de ADE20K (SceneParse150), a resolución de rejilla de 10 x 10 celdas.
- Extracción de logits por clase y por celda, lo que permite construir mapas de segmentación tras un upsampling bilineal.
- Decodificación lineal directa sobre características espaciales de DINOv3 ViT-S/16 a 160 px, sin necesidad de reentrenar el backbone.
- Uso como referencia de visión pasiva en experimentos comparativos contra modelos de visión activa (CanViT).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y discriminativo.
- No tiene capacidades multilingües ni de audio, ni modo de razonamiento (thinking mode).
- No está desplegado por ningún Inference Provider según la información disponible.

## Casos de uso

- Evaluación comparativa de extractores de características: se ejecuta el mismo probe sobre distintos backbones congelados (DINOv2, DINOv3, CLIP) para medir cuál produce descriptores más linealmente separables en segmentación semántica, manteniendo fija la cabeza y el protocolo de entrenamiento.
- Reproducción de resultados de investigación: sirve para replicar la línea base de visión pasiva del paper de CanViT y comprobar que las cifras de mIoU de los modelos activos son comparables bajo idéntico protocolo de probing.
- Preetiquetado de datos de segmentación: dado su coste computacional mínimo (59.286 parámetros más el backbone), puede generar máscaras iniciales sobre imaginería a 160 px que luego se corrigen manualmente, acelerando la anotación de datasets propios.
- Prototipado rápido en CPU: un equipo puede validar un pipeline de segmentación semántica completa sin GPU, ya que tanto el probe como el backbone ViT-S/16 a 160 px caben holgadamente en memoria de sistema.
- Docencia y divulgación: es un ejemplo compacto y reproducible de qué es un linear probe, con un script de uso de pocas líneas que ilustra el flujo congelar-características, entrenar-cabeza y evaluar.
- Análisis de atributos de escena a bajo coste: en aplicaciones de clasificación gruesa de interiores o exteriores (suelo, pared, cielo, mobiliario) donde no se requiere precisión a nivel de píxel, el mapa de 10 x 10 puede bastar.
- Componente de ablación en pipelines de visión activa: permite cuantificar cuánta información se pierde al reducir la resolución de entrada de 256 px a 160 px usando la misma cabeza y el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card no incluye métricas de mIoU ni comparaciones numéricas para el probe a 160 px.

Como contexto del paper asociado (no de este checkpoint), el artículo de CanViT reporta que un CanViT-B congelado alcanza 38,5 % mIoU en ADE20K con un único vistazo de baja resolución, frente al 27,6 % del mejor modelo activo previo, con 20 veces menos FLOPs de inferencia, y que con vistazos adicionales llega a 45,9 % mIoU. Estas cifras corresponden a CanViT-B, no a la sonda descrita en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en total, dominada por el backbone DINOv3 ViT-S/16 y las activaciones de una imagen de 160 x 160 px. La cabeza en sí ocupa unos pocos cientos de kilobytes en fp32 (estimación a partir del recuento de parámetros declarado).
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 2 GB de memoria es más que suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este checkpoint.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPUs integradas y en CPU. El ejemplo oficial de la model card se ejecuta con `torch.device("cpu")`.
- Opciones de despliegue: PyTorch con la librería `canvit-pytorch` (>= 0.2). Para `canvit-pytorch` < 0.2 hay que pasar `revision="canvit-pytorch-0.1"` a `from_pretrained`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de modelos de lenguaje, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del backbone (ViT-S/16) y la resolución de 160 px, la latencia esperada es de milisegundos por imagen en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Resolucion de entrada | Rejilla | Clases | Parametros del probe | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-dv3s-160px | 160 px | 10 x 10 | 150 (ADE20K) | 59.286 | MIT | HuggingFace |
| canvit/probe-ade20k-40k-dv3s-256px | 256 px | no disponible | 150 (ADE20K) | no disponible | MIT (segun el repositorio) | HuggingFace |
| canvit/probe-ade20k-40k-dv3s-128px | 128 px | no disponible | 150 (ADE20K) | no disponible | MIT (segun el repositorio) | HuggingFace |
| CanViT-B (modelo completo del paper) | multi-vistazo | rejilla de lienzo | 150 (ADE20K) | no disponible | no disponible | HuggingFace (organizacion canvit) |

Las tres variantes de probe comparten backbone DINOv3 ViT-S/16 y protocolo de entrenamiento, diferenciándose solo en la resolución de entrada. No se dispone de datos de rendimiento para comparar numéricamente las tres variantes.

## Limitaciones y advertencias

- Es una sonda lineal sobre características congeladas: su techo de rendimiento está acotado por la calidad de los descriptores de DINOv3 ViT-S/16, y no puede mejorarse ajustando el backbone.
- La salida tiene resolución de rejilla (10 x 10), no de píxel. Cualquier uso que requiera bordes precisos necesita upsampling bilineal y asumirá la pérdida de detalle correspondiente.
- El vocabulario de clases está fijado a las 150 categorías de ADE20K; no detecta clases fuera de ese conjunto y no se puede reutilizar directamente para otras taxonomías sin reentrenar la cabeza.
- Está entrenado específicamente a 160 px de entrada; alimentarlo con otras resoluciones altera el número de parches y la forma esperada por la cabeza.
- Riesgo de alucinación en sentido estricto: no aplica, porque no genera texto. Sí existe riesgo de sobre-segmentar o infra-segmentar regiones ambiguas, habitual en modelos de segmentación con vocabularios cerrados.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo demográfico, geográfico o de dominio, y ADE20K tiene una distribución de escenas sesgada hacia imágenes de interiores y exteriores de ciertos contextos.
- El entrenamiento se hizo con 40.000 pasos y batch size 16, un presupuesto modesto que puede dejar el probe infraajustado en clases poco frecuentes.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones de la licencia del backbone DINOv3, que se descarga por separado desde `facebook/dinov3-vits16-pretrain-lvd1689m`.
- Repositorio con 7 descargas y 0 likes en el momento de la consulta: ecosistema muy pequeño, poca validación externa y riesgo de que la API de `canvit-pytorch` cambie entre versiones.
- Es un checkpoint de investigación, no un componente listo para producción sin validación previa en el dominio de destino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-160px
- Variante a 256 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-256px
- Variante a 128 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-128px
- Backbone DINOv3 ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Organizacion con todos los checkpoints: https://huggingface.co/canvit
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo de referencia: https://github.com/m2b3/CanViT
- Implementacion en PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Paquete en PyPI: https://pypi.org/project/canvit-pytorch/
- Dataset SceneParse150: https://huggingface.co/datasets/scene_parse_150
