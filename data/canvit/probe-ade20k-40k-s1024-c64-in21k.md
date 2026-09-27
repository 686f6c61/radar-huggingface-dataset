# canvit/probe-ade20k-40k-s1024-c64-in21k

## Resumen

`canvit/probe-ade20k-40k-s1024-c64-in21k` es una sonda (probe) lineal de segmentación semántica ADE20K entrenada sobre las características congeladas del canvas de 64 × 64 de CanViT, el Canvas Vision Transformer. No es un modelo generativo ni un modelo de lenguaje: es la cabeza de segmentación (159.894 parámetros) que se acopla al backbone `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` para producir logits por píxel sobre 150 clases de ADE20K a resolución de rejilla de canvas.

CanViT, desarrollado por Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna (paper presentado en NeurIPS 2026, arXiv:2603.22570), es un modelo fundacional de visión activa: percibe la escena mediante una secuencia de *glimpses* y la memoriza en un canvas de alcance global. Esta sonda concreta evalúa qué información semántica queda codificada en ese canvas cuando se congela el backbone y solo se entrena una cabeza lineal, siguiendo el protocolo de *probing* del paper.

Su relevancia es metodológica: permite medir de forma reproducible la calidad de las representaciones de CanViT frente a baselines pasivos (por ejemplo DINOv3 en el repositorio `CanViT-eval`) y sirve como pieza de comparación dentro de la colección de sondas ADE20K publicada por el propio autor. El repo es minúsculo (0,0 GB), con licencia MIT, 6 descargas y 0 likes, por lo que se trata de un artefacto de investigación reciente y sin validación comunitaria significativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sonda lineal de segmentación sobre características congeladas de un vision transformer (CanViT): LayerNorm, dropout, BatchNorm y convolución 1 × 1 |
| Parámetros totales | 159.894 (según safetensors del repo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión: canvas de 64 × 64 y escenas de 1024 px; rollout de 10 glimpses de 128 px) |
| Tipos de cuantización | No disponible; el repo solo publica safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | No aplica (segmentación de imágenes, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `canvit-pytorch`) |
| Pipeline | image-segmentation |
| Dataset de entrenamiento | scene_parse_150 (ADE20K), 150 clases |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Resolución de escena | 1024 px |
| Resolución de salida | Logits a resolución del canvas (64 × 64); `predict` aplica upsampling bilineal |
| Tamaño del repo | 0,0 GB |
| Descargas / likes | 6 / 0 |

## Arquitectura y entrenamiento

La sonda es una cabeza ligera compuesta por LayerNorm, dropout (0,1), BatchNorm y una convolución 1 × 1 que proyecta las características del canvas congelado a las 150 clases de ADE20K. Se acopla al backbone mediante `CanViTForSemanticSegmentation.from_pretrained_with_probe()` en `canvit-pytorch >= 0.2`, de modo que la inferencia devuelve logits con forma `[1, 150, 64, 64]` que pueden convertirse en etiquetas con `argmax(dim=1)` y mapearse a nombres de clase con `CLASS_NAMES`.

El entrenamiento siguió el protocolo de *probing* del paper: 40.000 pasos con batch size 16, optimizador AdamW con learning rate máximo de 0,0003 y weight decay de 0,001, calentamiento lineal de 1.500 pasos seguido de decaimiento coseno, y autocast en bfloat16. Los rollouts de entrenamiento consisten en 10 glimpses de 128 px con puntos de vista R-IID sobre escenas de 1024 px. Como aumentación se emplean recortes aleatorios con escala entre 0,5 y 2 y volteos horizontales.

La innovación subyacente no está en la sonda, sino en el backbone: CanViT es un modelo de visión activa que construye una representación de escena completa acumulando observaciones parciales en un canvas, en lugar de procesar la imagen entera en un único forward pasivo. Esta sonda mide precisamente cuánta semántica densa es recuperable de ese canvas mediante una transformación lineal, sin reentrenar el extractor de características.

## Capacidades

- Segmentación semántica densa de 150 clases de ADE20K (interiores y exteriores: mobiliario, suelo, cielo, personas, vehículos, vegetación, etc.).
- Inferencia sobre características congeladas del canvas de 64 × 64, lo que la hace adecuada como herramienta de evaluación de representaciones.
- Soporte de rollouts multi-glimpse con estado: `init_state(batch_size, canvas_grid_size=64)` permite encadenar observaciones y consultar el canvas en cualquier momento del episodio.
- Salida a resolución de rejilla (64 × 64) con upsampling bilineal opcional mediante `predict`.
- Compatibilidad con la API `canvit-pytorch` (clase `CanViTForSemanticSegmentation`, `Viewpoint.full_scene`, `sample_at_viewpoint`, `preprocess`).
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües ni de entrada de texto de ningún tipo.
- No incluye modo *thinking*, audio ni otras modalidades adicionales a la imagen RGB.

## Casos de uso

- Evaluación de representaciones de visión activa: cargar el backbone congelado más esta sonda y medir la semántica recuperable del canvas de 64 × 64, comparando con sondas de canvas mayor o con baselines pasivos.
- Reproducción de resultados del paper CanViT: el repositorio `CanViT-eval` incluye el subcomando `ade20k-seg-canvit`, que calcula mIoU por paso de un episodio de T pasos; esta sonda es la pieza de segmentación empleada en ese flujo.
- Preanotación de datasets de escenas: generar máscaras de 150 clases sobre imágenes de 1024 px para revisión humana posterior, aprovechando que el coste de la cabeza es despreciable frente al backbone.
- Investigación en percepción incremental: estudiar cómo evoluciona la segmentación a medida que se acumulan glimpses (mIoU por timestep), útil para analizar el compromiso entre número de observaciones y calidad de máscara.
- Control de calidad de anotaciones: usar el conjunto de consistencia de ADE20K (64 imágenes) para detectar discrepancias entre las etiquetas del dataset y las predicciones del probe sobre características congeladas.
- Experimentos de ablación sobre aumentación y protocolo: al ser una cabeza de 0,16 M de parámetros entrenada en 40.000 pasos, reproducir variantes (escala de recorte, número de glimpses, tamaño de escena) es viable con presupuesto de cómputo moderado.
- Comparación con extractores pasivos: emplear el mismo protocolo de sonda para contrastar el canvas de CanViT con características de tipo DINOv3 en la misma tarea ADE20K.
- Docencia y prototipado rápido: ejemplo mínimo de segmentación semántica con API de alto nivel (`preprocess`, `init_state`, `argmax`) para demostrar inferencia de un modelo fundacional de visión sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de mIoU y los repositorios de evaluación (`CanViT-eval`) describen el procedimiento de medida, pero no sus valores.

| Benchmark | Métrica | Resultado | Referencia de comparación |
|---|---|---|---|
| ADE20K (scene_parse_150) | mIoU | No disponible | No disponible |
| ADE20K por timestep (rollout de T pasos) | mIoU por paso | No disponible (procedimiento documentado en CanViT-eval) | No disponible |
| DINOv3 pasivo en ADE20K (t = 0) | mIoU | No disponible | No disponible |
| ImageNet-1k (clasificación) | top-k | No disponible (fuera del alcance de este probe) | No disponible |

## Requisitos de hardware

- VRAM del probe: despreciable; 159.894 parámetros equivalen aproximadamente a 0,6 MB en fp32 y 0,3 MB en bfloat16.
- VRAM total: dominada por el backbone CanViT, cuyo número exacto de parámetros no está disponible en la información proporcionada (el identificador `canvitb16` sugiere un tamaño tipo ViT-B/16, pero no se confirma).
- GPU recomendadas: no hay recomendaciones publicadas. Por el tamaño del probe, cualquier GPU que pueda ejecutar el backbone es suficiente; en la práctica se espera viabilidad en GPU consumer de gama media (por ejemplo, RTX 3060 12 GB o superiores) con autocast en bfloat16, aunque el pico de memoria real depende del tamaño del backbone y de los 10 glimpses de 128 px sobre escenas de 1024 px.
- ¿Cabe en GPU consumer? Sí, el probe en sí cabe en cualquier GPU; la viabilidad completa del pipeline depende del backbone, dato no disponible.
- Opciones de despliegue: `canvit-pytorch >= 0.2` (para versiones `< 0.2` debe pasarse `revision="canvit-pytorch-0.1"` a `from_pretrained`), inferencia con `torch.inference_mode()` y bfloat16 autocast. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. Cualitativamente, la inferencia implica un rollout de 10 pasos con glimpses de 128 px y una escena de 1024 px, por lo que el coste es mayor que un único forward pasivo.

## Comparativa con modelos similares

| Modelo | Tipo | Escena | Canvas | Rollout | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| probe-ade20k-40k-s1024-c64-in21k (este) | Sonda lineal sobre CanViT | 1024 px | 64 × 64 | 10 glimpses de 128 px, R-IID | 159.894 | MIT | HuggingFace (6 descargas, 0 likes) |
| canvit/probe-ade20k-40k-s512-c10-in21k | Sonda lineal sobre CanViT | 512 px (según el identificador del repo) | 10 × 10 (según el identificador del repo) | No disponible | No disponible | No disponible | HuggingFace, dentro de la colección de sondas ADE20K |
| DINOv3 como backbone pasivo (usado en CanViT-eval) | Extractor pasivo, forward único | Resolución fija de entrada | No aplica | 1 forward (mIoU en t = 0) | No disponible | No disponible | Depende del checkpoint DINOv3; no forma parte de este repo |
| Otros modelos de segmentación semántica ADE20K (SegFormer, UperNet, etc.) | Redes dedicadas de segmentación | Variable | No aplica | No aplica | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el backbone `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02` para producir predicciones; por sí sola, la sonda no procesa imágenes.
- Taxonomía cerrada: solo predice las 150 clases de ADE20K. No generaliza a otras ontologías ni a clases no contempladas en scene_parse_150.
- Resolución de salida limitada: los logits se generan a 64 × 64, de modo que las fronteras finas dependen del upsampling bilineal y pueden presentar artefactos en objetos pequeños o de bordes complejos.
- Dependencia del protocolo de evaluación: los resultados son sensibles al número de glimpses, a la política de puntos de vista (R-IID) y al tamaño de escena; comparar cifras entre sondas con canvas o resolución distintos no es directo.
- Riesgo de alucinación y sesgo: no hay información publicada sobre sesgos demográficos, geográficos o de dominio, ni sobre tasas de error por clase. Al entrenarse sobre ADE20K, hereda los sesgos de composición y anotación de ese dataset.
- Sin validación comunitaria: 6 descargas y 0 likes en el momento de la consulta, sin resultados de benchmark publicados en la model card.
- Licencia: el probe se distribuye bajo MIT, lo que permite uso comercial de estos pesos. La licencia del backbone y la de los datos ADE20K no están disponibles en la información proporcionada y deben verificarse por separado antes de un despliegue en producción.
- Uso en producción: al ser un artefacto de investigación ligado a un paper de 2026, no hay garantías de mantenimiento, soporte ni estabilidad de API más allá de la revisión `canvit-pytorch-0.1` conservada para compatibilidad.
- Idiomas: sin aplicación; cualquier expectativa de capacidades lingüísticas es incorrecta para este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s1024-c64-in21k
- Colección de sondas ADE20K de CanViT: https://huggingface.co/collections/canvit/canvit-ade20k-segmentation-probes-pytorch
- Sonda relacionada (escena 512 px, canvas 10): https://huggingface.co/canvit/probe-ade20k-40k-s512-c10-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Todos los checkpoints de la organización: https://huggingface.co/canvit
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código de referencia: https://github.com/m2b3/CanViT
- Implementación en PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Utilidades de evaluación: https://github.com/m2b3/CanViT-eval
- Página del proyecto: https://m2b3.github.io/CanViT/
- Dataset ADE20K: https://ade20k.csail.mit.edu/
