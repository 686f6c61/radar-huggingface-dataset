# canvit/probe-ade20k-40k-s512-c10-in21k

## Resumen

`canvit/probe-ade20k-40k-s512-c10-in21k` es un checkpoint de sonda lineal (*linear probe*) para segmentación semántica sobre las características congeladas del modelo CanViT (Canvas Vision Transformer), un *foundation model* de visión activa. No es un modelo generativo de texto ni un modelo completo: es una cabeza de segmentación de 159.894 parámetros que se acopla a un backbone preentrenado y produce logits por píxel a la resolución de la rejilla del lienzo (*canvas*) del backbone, en este caso 10 × 10.

El modelo lo publica la organización `canvit` y se apoya en el backbone `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`. La sonda se entrena sobre el conjunto ADE20K (`scene_parse_150`) con 150 clases semánticas, siguiendo el protocolo de evaluación del artículo CanViT (NeurIPS 2026). El resultado es un modelo de `pipeline_tag: image-segmentation` que devuelve un tensor de logits de forma `[1, 150, 10, 10]` a partir de una escena de 512 px y 10 *glimpses* de 128 px.

Su relevancia es doble: por un lado, sirve como referencia reproducible para medir la calidad de las representaciones de CanViT en segmentación densa sin reentrenar el backbone; por otro, ilustra el paradigma de visión activa, en el que el modelo no procesa la imagen completa de una vez, sino que la explora mediante una secuencia de vistas parciales y mantiene la información en un lienzo interno acumulativo. La licencia MIT y el formato safetensors facilitan su uso en investigación y en prototipos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre caracteristicas congeladas de un Vision Transformer (CanViT): LayerNorm, dropout, BatchNorm y convolucion 1 × 1 |
| Parametros totales | 159.894 (solo la sonda; el backbone se carga por separado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el backbone opera sobre un lienzo (*canvas*) de 10 × 10 celdas y escenas de 512 px con *glimpses* de 128 px |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `canvit-pytorch`, revision `canvit-pytorch-0.1` disponible para la version 0.1 de la libreria) |

## Arquitectura y entrenamiento

La sonda es deliberadamente simple: una capa LayerNorm, dropout, BatchNorm y una convolución 1 × 1 que se aplica sobre las características espaciales del lienzo de CanViT. El backbone permanece congelado durante todo el entrenamiento (*linear probing* estricto), de modo que el checkpoint resultante mide exclusivamente la linealidad y calidad de las representaciones del preentrenamiento, no la capacidad de la cabeza. La salida son logits por celda del lienzo (150 clases sobre una rejilla de 10 × 10), y la librería ofrece `predict` con interpolación bilineal para llevar la predicción a resolución completa.

El entrenamiento se realizó sobre ADE20K (`scene_parse_150`) durante 40.000 pasos con tamaño de lote 16, optimizador AdamW con *peak learning rate* de 0.0003 y *weight decay* de 0.001, con 1.500 pasos de *warmup* lineal seguido de decaimiento coseno. Se aplicó *data augmentation* consistente en recortes aleatorios de escala 0.5 a 2 y volteos horizontales, con dropout de 0.1 y autocast en bfloat16. Cada muestra de entrenamiento consiste en 10 *glimpses* de 128 px muestreados con viewpoints R-IID sobre escenas de 512 px, replicando el protocolo de sondeo del artículo.

La innovación subyacente está en el backbone, no en la sonda: CanViT es un *foundation model* de visión activa que observa la escena a través de una secuencia de vistas parciales y la memoriza en un lienzo de alcance global. Este checkpoint concreto es una de las variantes de rejilla publicadas por el mismo autor (existen versiones con lienzo 8 × 8, 12 × 12 y 32 × 32).

## Capacidades

- Segmentación semántica densa sobre 150 clases de ADE20K, devueltas como logits por celda de lienzo con forma `[1, 150, 10, 10]`.
- Predicción a resolución de rejilla con opción de sobremuestreo bilineal a resolución de imagen mediante el método `predict`.
- Integración con el ecosistema `canvit-pytorch` mediante `CanViTForSemanticSegmentation.from_pretrained_with_probe`.
- Reutilización de la cabeza `SegmentationProbe` como módulo independiente sobre cualquier mapa de características espaciales.
- Procesamiento en un único *forward* con un *glimpse* de escena completa (`Viewpoint.full_scene`) o con secuencias de vistas parciales gestionadas por el estado del modelo.
- Inferencia en bfloat16.
- No dispone de *tool calling*, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento: es un modelo puramente visual y discriminativo.

## Casos de uso

- Segmentación semántica de interiores y escenas urbanas: el modelo asigna una de las 150 clases de ADE20K a cada región de la imagen, útil para anotación automática de conjuntos de datos de robótica o conducción autónoma a bajo coste computacional.
- Evaluación de representaciones de *foundation models*: investigadores que comparan backbones pueden usar esta sonda como *baseline* reproducible, ya que el protocolo (40.000 pasos, lote 16, AdamW con lr 0.0003) está documentado con precisión.
- Pretrazado de mapas de ocupación en navegación: al trabajar sobre un lienzo de 10 × 10 con visión activa, encaja en pipelines donde un agente explora una escena con vistas parciales y necesita una etiqueta semántica gruesa por celda.
- Preanotación en herramientas de etiquetado: los logits por celda permiten generar máscaras preliminares que un humano corrige después, reduciendo el tiempo de anotación en proyectos con presupuesto limitado.
- Análisis de imágenes de satélite o aéreas de baja resolución semántica: la rejilla de 10 × 10 es adecuada cuando se necesita una clasificación por regiones amplias en lugar de contornos finos.
- Investigación en visión activa: sirve para estudiar cómo afecta la política de *glimpses* (R-IID frente a otras) a la calidad de la segmentación, ya que el backbone y la sonda están desacoplados.
- *Benchmarking* de hardware y frameworks: con solo 159.894 parámetros en la cabeza, permite aislar el coste del backbone al medir latencia y memoria en distintas plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* detalla el protocolo de entrenamiento (40.000 pasos, lote 16, AdamW, lr 0.0003) y la configuración de la sonda, pero no incluye valores de mIoU ni comparaciones numéricas con otras sondas o modelos.

## Requisitos de hardware

- VRAM de la sonda: inferior a 10 MB en fp32 (159.894 parámetros, aproximadamente 0,64 MB de pesos) e inferior a 1 MB en bfloat16. El coste real de inferencia está dominado por el backbone CanViT.
- VRAM del backbone: no disponible en la informacion proporcionada. Al procesar escenas de 512 px con *glimpses* de 128 px y un lienzo de 10 × 10, los requisitos son moderados, pero no se especifican cifras.
- GPU recomendadas: no disponibles de forma explícita. Cualquier GPU con soporte de bfloat16 y suficiente memoria para el backbone debería ser válida; el tamaño de la sonda no es un factor limitante.
- GPU de consumo: la sonda cabe en cualquier GPU de consumo, incluida una GTX 1050, pero la viabilidad depende exclusivamente del backbone, cuyas necesidades no se detallan.
- Opciones de despliegue: la librería oficial `canvit-pytorch` (versión >= 0.2). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de segmentación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto o rejilla | Licencia | Disponibilidad |
|---|---|---|---|---|
| `canvit/probe-ade20k-40k-s512-c10-in21k` | 159.894 | Lienzo 10 × 10, escena 512 px, *glimpse* 128 px | MIT | HuggingFace |
| `canvit/probe-ade20k-40k-s512-c8-in21k` | No disponible | Lienzo 8 × 8, escena 512 px | MIT | HuggingFace |
| `canvit/probe-ade20k-40k-s512-c32-in21k` | No disponible | Lienzo 32 × 32, escena 512 px | MIT | HuggingFace |
| `canvit/probe-ade20k-40k-s512-c12-in21k` | No disponible | Lienzo 12 × 12, escena 512 px | MIT | HuggingFace |

La diferencia entre estas variantes es la resolución del lienzo del backbone (cuanto mayor es la rejilla, más fina es la salida de segmentación), pero no se han publicado métricas comparativas que permitan ordenarlas por calidad. No se dispone de datos sobre alternativas de otros autores para una comparación directa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el backbone `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`. Usar solo el repositorio de la sonda no produce predicciones.
- Resolución de salida limitada: con un lienzo de 10 × 10, la segmentación es muy gruesa y requiere sobremuestreo bilineal, lo que produce contornos imprecisos en objetos pequeños.
- Dominio cerrado: las 150 clases provienen de ADE20K; cualquier categoría fuera de ese conjunto se forzará a la clase más parecida, con el consiguiente error semántico.
- Riesgo de alucinación a nivel de píxel: al ser una sonda lineal sobre características congeladas, puede asignar clases con alta confianza a regiones ambiguas, especialmente en texturas o desenfoques.
- Sesgos del conjunto de entrenamiento: ADE20K está dominado por escenas interiores y urbanas de determinadas regiones geográficas; el rendimiento en otros contextos no está caracterizado.
- Idiomas soportados: no aplica ni se documenta, ya que el modelo no procesa texto.
- Sin datos de generalización: no se han publicado métricas de mIoU ni estudios de robustez ante cambios de iluminación, resolución u oclusión.
- Compatibilidad de versiones: para `canvit-pytorch` < 0.2 es obligatorio pasar `revision="canvit-pytorch-0.1"` en `from_pretrained`; de lo contrario, la carga fallará.
- Licencia MIT: permite uso comercial, pero al derivar de un backbone con licencia propia conviene verificar los términos del modelo base antes de desplegarlo en producción.
- Adopción muy baja: 7 descargas y 0 *likes* en el momento de la consulta, lo que implica poca validación externa de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c10-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Variante de lienzo 8 × 8: https://huggingface.co/canvit/probe-ade20k-40k-s512-c8-in21k
- Variante de lienzo 12 × 12: https://huggingface.co/canvit/probe-ade20k-40k-s512-c12-in21k
- Variante de lienzo 32 × 32: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
- Organización CanViT en HuggingFace: https://huggingface.co/canvit
- Articulo (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Repositorio de codigo principal: https://github.com/m2b3/CanViT
- Implementacion de referencia en PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Pagina del proyecto: https://m2b3.github.io/CanViT/
