# canvit/probe-ade20k-40k-s512-c16-in21k

## Resumen

`canvit/probe-ade20k-40k-s512-c16-in21k` es una sonda lineal (linear probe) de segmentación semántica sobre las características del canvas de 16 × 16 de un modelo CanViT (Canvas Vision Transformer). No es un modelo generativo ni un modelo de lenguaje: es una cabeza de predicción ligera, entrenada con las características del modelo base congeladas, que proyecta el canvas de 16 × 16 a 150 clases semánticas del dataset ADE20K (`scene_parse_150`). Lo desarrolla el equipo de CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y se publica como complemento reproducible del artículo «CanViT: Toward Active-Vision Foundation Models» (NeurIPS 2026).

CanViT es un modelo fundacional de visión activa: en lugar de procesar la escena completa de una vez, la observa mediante una secuencia de vistazos (glimpses) de 128 px y va acumulando la información en un canvas de representación de la escena. Esta sonda concreta evalúa hasta qué punto esas representaciones de canvas contienen información semántica densa reutilizable, siguiendo el protocolo de probing del artículo.

Su relevancia es doble. Por un lado, es una pieza de evaluación comparativa entre distintas resoluciones de canvas (existe una colección de sondas equivalentes con canvas 8 × 8, 10 × 10, 12 × 12 y 32 × 32). Por otro, demuestra que con apenas 159.894 parámetros y un backbone congelado se puede obtener una segmentación densa de 150 clases a resolución de canvas 16 × 16, lo que resulta útil como preetiquetador barato y como referencia metodológica para investigación en representaciones visuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre el canvas de un Canvas Vision Transformer (CanViT): LayerNorm, dropout, BatchNorm y convolución 1 × 1 con salida de 150 clases |
| Parametros totales | 159.894 (solo la sonda; según safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual). Estado de canvas de 16 × 16 celdas; sonda entrenada con 10 vistazos de 128 px sobre escenas de 512 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Dataset de entrenamiento | scene_parse_150 (ADE20K), 150 clases |
| Pipeline declarado | image-segmentation |
| Libreria | canvit-pytorch (>= 0.2; revisión `canvit-pytorch-0.1` para versiones antiguas) |

## Arquitectura y entrenamiento

La sonda es deliberadamente mínima: una capa LayerNorm, dropout, una BatchNorm y una convolución 1 × 1 que convierte las características del canvas de 16 × 16 en logits por píxel para las 150 clases de ADE20K. El modelo completo `CanViTForSemanticSegmentation` combina el backbone CanViT con esta cabeza de segmentación; la salida son logits a resolución de rejilla de canvas, y el método `predict` añade un upsampling bilineal para llevar el mapa a la resolución de la imagen. El entrenamiento se realizó con el backbone congelado, por lo que la sonda no modifica los pesos del modelo base.

El protocolo de entrenamiento está documentado en la model card: 40.000 pasos con batch size 16, optimizador AdamW con learning rate máximo 3e-4 y weight decay 0.001, calentamiento lineal de 1.500 pasos seguido de decaimiento coseno, dropout 0.1 y autocast en bfloat16. La aumentación consistió en recortes aleatorios de escala 0,5 a 2 y volteos horizontales. Los rollouts de entrenamiento usaron 10 vistazos de 128 px con viewpoints R-IID sobre escenas de 512 px. Los detalles del backbone (número de tokens de ImageNet-21k, composición exacta del dataset de preentrenamiento y si hubo RLHF/DPO, algo poco habitual en visión) no se detallan en la información disponible; el identificador del repositorio base sugiere preentrenamiento en ImageNet-21k, vistazos de 128 px y escenas de 512 px, pero no se confirma ningún otro hiperparámetro del backbone.

## Capacidades

- Segmentación semántica densa de 150 clases de ADE20K (interiores, exteriores, objetos, mobiliario, vegetación, vehículos, personas, etc.).
- Predicción por píxel a resolución de rejilla de canvas (16 × 16), con upsampling bilineal opcional para obtener el mapa a resolución completa.
- Inferencia sobre el estado recurrente de CanViT: el modelo mantiene un canvas que se actualiza a medida que llegan vistazos sucesivos de la escena.
- Funciona con un único vistazo a escena completa (`Viewpoint.full_scene`) o con secuencias parciales, lo que permite evaluar cómo evoluciona la calidad de la segmentación con el número de vistazos.
- Integración con PyTorch mediante `canvit_pytorch` (`CanViTForSemanticSegmentation.from_pretrained_with_probe`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni diálogo multilingüe: es exclusivamente un modelo de visión.

## Casos de uso

- Preetiquetado de datasets de segmentación: dado que la sonda corre con un backbone congelado y una cabeza de 159.894 parámetros, se puede usar para generar máscaras densas iniciales sobre grandes volúmenes de imágenes y reservar la anotación humana para la corrección, reduciendo el coste por imagen.
- Evaluación de representaciones en investigación: es una sonda del protocolo del artículo, pensada para medir cuánta información semántica contiene el canvas de 16 × 16 de CanViT; se usa para comparar checkpoints, resoluciones de canvas y regímenes de vistazos en experimentos controlados.
- Reproducción de resultados de NeurIPS 2026: permite replicar la tabla de probing de ADE20K del artículo sin reentrenar el backbone, usando el checkpoint base indicado en la ficha.
- Anotación de escenas interiores para robótica doméstica o navegación: las 150 clases de ADE20K cubren suelo, pared, muebles, electrodomésticos y objetos de uso común, por lo que sirve como mapa semántico de bajo coste para planificación de trayectorias.
- Análisis de imágenes aéreas o urbanas de baja exigencia: útil para obtener máscaras gruesas de edificios, vegetación, vías y cielo cuando la precisión de borde no es crítica y sí lo es el coste computacional.
- Componente de un pipeline de visión activa: la sonda puede emplearse como señal auxiliar para decidir qué zona de la escena conviene observar en el siguiente vistazo, ya que se ejecuta sobre el mismo canvas que el backbone utiliza para decidir.
- Control de calidad y detección de escenas anómalas: comparar la distribución de clases predichas frente a la esperada en un dominio permite marcar imágenes fuera de distribución en un pipeline de monitorización.
- Docencia y prototipado: con menos de un megabyte de pesos, es un ejemplo práctico de cómo evaluar un modelo fundacional congelado mediante probing lineal, adecuado para cursos de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de mIoU ni comparaciones numéricas con otras sondas o modelos de segmentación, y la búsqueda web solo devuelve las páginas de las sondas hermanas (canvas 8 × 8, 10 × 10, 12 × 12 y 32 × 32) sin cifras asociadas.

## Requisitos de hardware

- La sonda en sí ocupa 159.894 parámetros, aproximadamente 0,64 MB en fp32 y 0,32 MB en bf16, por lo que su coste de memoria es despreciable frente al backbone.
- El consumo real depende del checkpoint base `canvitb16-...`, cuyo tamaño en parámetros no se especifica en la información disponible. El identificador sugiere un backbone tipo ViT-B/16, lo que implicaría del orden de 86 millones de parámetros, pero este dato no se confirma en la documentación publicada y no debe tomarse como cifra verificada.
- VRAM estimada para inferencia: no disponible. Con escenas de 512 px, vistazos de 128 px, batch 1 y bfloat16, un backbone de ese orden de magnitud cabría con holgura en GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090), pero se trata de una estimación razonada, no de un dato publicado.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; no se requiere A100 ni H100 salvo para procesar lotes grandes o para entrenar sondas nuevas a mayor escala.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido de la cabeza y el tamaño moderado del backbone, aunque sin cifras oficiales de VRAM.
- Opciones de despliegue: PyTorch con la librería `canvit-pytorch` (>= 0.2) es la única vía documentada. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, lo cual es esperable en un modelo puramente visual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparación con las sondas hermanas de la misma colección (todas sobre el mismo backbone congelado, licencia MIT y pipeline de segmentación):

| Modelo | Canvas | Dataset | Pasos | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-s512-c16-in21k | 16 × 16 | ADE20K (150 clases) | 40.000 | 159.894 | MIT | HuggingFace |
| canvit/probe-ade20k-40k-s512-c8-in21k | 8 × 8 | ADE20K (150 clases) | 40.000 | no disponible | MIT | HuggingFace |
| canvit/probe-ade20k-40k-s512-c10-in21k | 10 × 10 | ADE20K (150 clases) | 40.000 | no disponible | MIT | HuggingFace |
| canvit/probe-ade20k-40k-s512-c12-in21k | 12 × 12 | ADE20K (150 clases) | 40.000 | no disponible | MIT | HuggingFace |
| canvit/probe-ade20k-40k-s512-c32-in21k | 32 × 32 | ADE20K (150 clases) | 40.000 | no disponible | MIT | HuggingFace |

Frente a modelos de segmentación generalistas como SegFormer, Mask2Former o las cabezas densas basadas en DINOv3, no hay datos comparativos publicados en la información disponible (ni parámetros, ni mIoU, ni contexto), por lo que no es posible establecer una comparación cuantitativa rigurosa. La diferencia conceptual es clara: esta sonda no es un segmentador de propósito general, sino un instrumento de evaluación de representaciones con backbone congelado.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint base `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` la sonda no produce predicciones útiles.
- Salida de baja resolución: los logits se generan a resolución de canvas (16 × 16), de modo que los bordes y los objetos pequeños quedan mal delimitados y el upsampling bilineal no recupera detalle fino.
- Vocabulario cerrado: solo predice las 150 clases de ADE20K; cualquier objeto fuera de ese conjunto se asigna a la clase más parecida, con la consiguiente confusión.
- Dependencia del régimen de muestreo: se entrenó con 10 vistazos de 128 px y viewpoints R-IID sobre escenas de 512 px; cambiar el número de vistazos, el tamaño de escena o la política de viewpoints puede degradar el resultado de forma no cuantificada.
- Ausencia de métricas publicadas: no hay mIoU ni ninguna otra cifra en la información disponible, por lo que no se puede estimar la calidad real ni compararla con alternativas.
- Validación comunitaria prácticamente nula: 6 descargas y 0 «likes» en el momento de la consulta, y el repositorio ocupa 0,0 GB.
- Licencia MIT para la sonda: permite uso comercial, modificación y redistribución con atribución, pero los términos del modelo base y de los datos de preentrenamiento (ImageNet-21k, ADE20K) no se detallan en esta ficha y deben verificarse por separado.
- Riesgo de alucinación en sentido amplio: como todo modelo denso de segmentación, puede producir máscaras plausibles pero incorrectas en zonas ambiguas u ocluidas, sin ninguna señal de confianza calibrada.
- Sesgos: no hay información sobre la composición demográfica o geográfica de los datos de entrenamiento, por lo que se desconoce el comportamiento diferencial en dominios alejados de ADE20K.
- Sin capacidades lingüísticas, de agentes ni de tool calling: no debe plantearse como sustituto de un modelo multimodal conversacional.
- Fechas de creación y actualización (marzo de 2026 y septiembre de 2026) y referencia a NeurIPS 2026: conviene verificar la vigencia del artículo y de la librería `canvit-pytorch` antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c16-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Colección de sondas CanViT: https://huggingface.co/canvit
- Sonda hermana canvas 8 × 8: https://huggingface.co/canvit/probe-ade20k-40k-s512-c8-in21k
- Sonda hermana canvas 10 × 10: https://huggingface.co/canvit/probe-ade20k-40k-s512-c10-in21k
- Sonda hermana canvas 12 × 12: https://huggingface.co/canvit/probe-ade20k-40k-s512-c12-in21k
- Sonda hermana canvas 32 × 32: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
- Artículo (arXiv, NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código de referencia: https://github.com/m2b3/CanViT
- Implementación en PyTorch: https://github.com/m2b3/CanViT-PyTorch/tree/main
- Página del proyecto: https://m2b3.github.io/CanViT/
- Ficha de terceros de la sonda c12: https://free2aitools.com/dataset/canvit/probe-ade20k-40k-s512-c12-in21k
