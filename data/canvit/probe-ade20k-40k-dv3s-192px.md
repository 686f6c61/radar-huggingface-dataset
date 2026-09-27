# canvit/probe-ade20k-40k-dv3s-192px

## Resumen

`canvit/probe-ade20k-40k-dv3s-192px` no es un modelo generativo ni un modelo de lenguaje: es una sonda lineal (*linear probe*) de segmentación semántica entrenada sobre características congeladas de DINOv3 ViT-S/16 a 192 píxeles. El autor es el equipo de CanViT (Berreby, Du, Durand y Krishna) y se publica como referencia de "visión pasiva" dentro del paper *CanViT: Toward Active-Vision Foundation Models* (NeurIPS 2026), cuyo objetivo es construir modelos de visión activa que perciben una escena mediante una secuencia de vistazos y la memorizan en un lienzo global.

El problema que resuelve es acotado pero útil: ofrecer una línea base reproducible que mide cuánta información semántica de ADE20K (150 clases de `scene_parse_150`) es linealmente separable en las características de un backbone congelado. Sirve, por tanto, para comparar contra CanViT y para diagnosticar la calidad de las representaciones de DINOv3 ViT-S/16 sin necesidad de reentrenar el backbone.

Técnicamente es minúsculo: el repositorio declara 59.286 parámetros reales en safetensors, un tamaño de repo de 0,0 GB y una entrada de 192 × 192 píxeles. La sonda se compone de dropout, BatchNorm y una convolución 1 × 1 que proyecta los 384 canales de los parches (rejilla de 12 × 12) a las 150 clases del dataset. Se entrenó durante 40.000 pasos con batch de 16, por lo que el sufijo `40k` del nombre hace referencia a los pasos de entrenamiento, no a un tamaño de modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre características congeladas: dropout + BatchNorm + convolución 1 × 1 (384 → 150 clases) |
| Parámetros totales | 59.286 (dato real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje; entrada de imagen fija de 192 × 192 píxeles |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors y no documenta versiones cuantizadas |
| Idiomas soportados | No aplica: modelo de segmentación de imágenes, no procesa texto |
| Licencia | MIT |
| Formato de pesos | safetensors (cargable con `canvit-pytorch >= 0.2`) |
| Modelo base | `facebook/dinov3-vits16-pretrain-lvd1689m` (congelado, no se entrena) |
| Tarea (pipeline) | `image-segmentation` (segmentación semántica, 150 clases) |
| Dataset de entrenamiento | `scene_parse_150` (ADE20K) |
| Resolución de entrada | 192 × 192 píxeles (rejilla de parches 12 × 12, dimensión 384) |
| Librería | `canvit-pytorch` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 8 / 0 |
| Fecha de creación / actualización | 2026-03-15 / 2026-09-26 |

## Arquitectura y entrenamiento

La sonda recibe las características de parches del backbone DINOv3 ViT-S/16 aplicado a imágenes de 192 píxeles, reorganizadas como un tensor `[1, 12, 12, 384]`, y produce logits `[1, 150, 12, 12]` mediante una convolución 1 × 1. La mayor parte de los 59.286 parámetros corresponde a esa proyección (384 × 150 = 57.600 pesos), más los parámetros de normalización. Es, por tanto, una cabeza de clasificación por píxel de coste despreciable frente al backbone: no hay decodificador convolucional, ni atención, ni módulo de refinamiento multi-escala.

El entrenamiento sigue el protocolo de *probing* del paper de CanViT: 40.000 pasos, batch de 16, optimizador AdamW con learning rate máximo de 0,0003, weight decay de 0,001, *warmup* lineal de 1.500 pasos seguido de decaimiento coseno, dropout de 0,1 y autocast en bfloat16. La aumentación se limita a recortes aleatorios con escala entre 0,5 y 2 y volteos horizontales. El backbone permanece congelado en todo momento, de modo que la sonda mide la linealidad de las representaciones preexistentes y no las modifica.

El repositorio mantiene compatibilidad hacia atrás: los ficheros correspondientes a `canvit-pytorch` 0.1 residen en la revisión `canvit-pytorch-0.1` y requieren pasar `revision="canvit-pytorch-0.1"` a `from_pretrained` cuando se usa una versión anterior a 0.2.

## Capacidades

- Segmentación semántica densa sobre 150 clases de ADE20K (`scene_parse_150`), con una etiqueta por píxel de la rejilla de 12 × 12.
- Extracción de mapas de logits por clase (`[1, 150, 12, 12]`), utilizables como base para postprocesado propio.
- Evaluación diagnóstica de las características de DINOv3 ViT-S/16 mediante *linear probing*, sin ajustar el backbone.
- Inferencia en CPU, tal y como muestra el ejemplo de la model card (`torch.device("cpu")`).
- Ejecución reproducible del protocolo completo de entrenamiento a partir de los hiperparámetros documentados.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni agentes: es un modelo exclusivamente visual.
- No tiene capacidades multilingües, ni generación de texto, ni código, ni matemáticas, ni visión-lenguaje.
- No realiza segmentación de instancias, panóptica, profundidad ni detección de cajas; solo etiquetado semántico por píxel.
- No admite resolución de entrada distinta de 192 píxeles sin cambios en el preprocesado y en la rejilla de parches.

## Casos de uso

- Referencia pasiva para evaluar CanViT: la sonda funciona como *baseline* de visión pasiva frente al modelo de visión activa del mismo paper, de modo que cualquier mejora atribuida a la política de vistazos puede medirse contra esta línea base fija.
- Auditoría de representaciones de DINOv3 ViT-S/16: si un proyecto valora usar este backbone como extractor congelado, la sonda mide de forma directa cuánta semántica de escena es linealmente accesible a 192 píxeles antes de invertir en ajuste fino.
- Segmentación semántica de escenas interiores y urbanas en prototipos: las 150 clases de ADE20K cubren elementos como suelo, pared, techo, mobiliario, vehículos, vegetación o personas, suficiente para un primer etiquetado denso en demostradores.
- Preetiquetado para curación de datasets: al ejecutarse en CPU y con solo 59.286 parámetros en la cabeza, permite generar máscaras preliminares a bajo coste que después se corrigen manualmente, reduciendo el tiempo de anotación.
- Percepción en robótica o *embodied AI* de bajo consumo: el coste computacional se concentra en el backbone ViT-S/16 sobre imágenes pequeñas, por lo que puede integrarse en pipelines embarcados con GPU modesta o CPU para tareas de navegación basadas en semántica de escena.
- Docencia y replicación de experimentos: los hiperparámetros (40.000 pasos, batch 16, AdamW, lr 0,0003, warmup de 1.500 pasos, dropout 0,1) están documentados de forma completa, lo que permite reproducir el entrenamiento como ejercicio de *probing* supervisado.
- Comparación controlada entre backbones: la colección del autor incluye variantes del mismo protocolo con otros backbones (por ejemplo, la versión con DINOv3 ViT-B a 192 píxeles), lo que permite aislar el efecto del tamaño del backbone manteniendo la cabeza de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de entrenamiento, pero no incluye métricas de segmentación (mIoU, *pixel accuracy* ni *mean accuracy*) para este *checkpoint*, ni comparaciones numéricas frente a otras sondas o modelos supervisados. No se deben asumir cifras procedentes del paper sin verificarlas en la fuente original.

## Requisitos de hardware

- VRAM estimada: el repositorio no publica cifras. Como estimación propia (no confirmada por el autor), el conjunto formado por la sonda y el backbone DINOv3 ViT-S/16 en bfloat16 a 192 × 192 ocupa bastante menos de 1 GB de VRAM, y el coste dominante es el contexto de CUDA, no los pesos.
- GPU recomendadas: cualquier GPU con al menos unos pocos gigabytes de memoria. El ejemplo oficial se ejecuta directamente en CPU, por lo que no hay requisito de GPU para inferencia puntual.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (serie RTX 30/40, por ejemplo). A100 o H100 no aportan ventaja para un modelo de este tamaño salvo por procesamiento por lotes a gran escala.
- Opciones de despliegue: PyTorch con `canvit-pytorch >= 0.2` y el paquete de transformaciones asociado (`canvit_pytorch.preprocess`, `canvit_pytorch.probes.SegmentationProbe`, `canvit_pytorch.teacher.load_teacher`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes orientados a modelos de lenguaje y no aplican a esta arquitectura.
- Latencia y throughput: no disponibles. Dependen casi por completo del backbone ViT-S/16 y del hardware, no de la sonda.
- Nota de compatibilidad: con `canvit-pytorch < 0.2` es necesario cargar la revisión `canvit-pytorch-0.1`.

## Comparativa con modelos similares

La información disponible no incluye métricas de segmentación, por lo que la comparación se limita a aspectos estructurales y de licencia.

| Modelo | Backbone | Resolución | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `canvit/probe-ade20k-40k-dv3s-192px` | DINOv3 ViT-S/16 congelado | 192 px | 59.286 | No aplica | MIT | HuggingFace (`canvit`) |
| `canvit/probe-ade20k-40k-dv3b-192px` | DINOv3 ViT-B/16 congelado | 192 px | No disponible | No aplica | No disponible en la información recogida | HuggingFace (`canvit`) |
| `facebook/dinov3-vits16-pretrain-lvd1689m` | Backbone base, sin cabeza de segmentación | No disponible | No disponible | No aplica | No disponible en la información recogida | HuggingFace (`facebook`) |
| Modelos de segmentación supervisados de propósito general (por ejemplo, familias tipo SegFormer o Mask2Former) | Diversas | Diversas | Muy superiores | No aplica | Diversas | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de propósito general: es una sonda lineal específica de ADE20K con 150 clases fijas. No puede segmentar categorías fuera de ese vocabulario ni reentrenarse sin acceso al dataset.
- Resolución fija de 192 × 192 píxeles y salida en una rejilla de 12 × 12, lo que implica máscaras de baja resolución espacial; objetos pequeños pueden perderse o quedar mal delimitados.
- La calidad final está acotada por el backbone congelado: la sonda no puede superar la información linealmente accesible en las características de DINOv3 ViT-S/16.
- Riesgo de sesgo heredado del dataset `scene_parse_150` (ADE20K): predominio de escenas interiores y urbanas de determinadas regiones geográficas, con posibles desequilibrios entre clases frecuentes y raras.
- Riesgo de error en clases minoritarias y en fronteras entre categorías visualmente próximas, algo característico de las cabezas lineales sin decodificador.
- Licencia MIT, que permite uso comercial y modificación, pero se recomienda revisar también las condiciones del modelo base `facebook/dinov3-vits16-pretrain-lvd1689m`, ya que la licencia del *backbone* puede imponer restricciones adicionales.
- El repositorio no documenta cuantizaciones, por lo que no cabe esperar ficheros GGUF ni integraciones con runtimes de inferencia de lenguaje.
- Advertencia de versionado: cargar la revisión equivocada con `canvit-pytorch < 0.2` provoca fallos de carga; hay que usar `revision="canvit-pytorch-0.1"` en ese caso.
- Popularidad muy baja (8 descargas, 0 likes) y ausencia de métricas publicadas: antes de usarlo en producción conviene validar el rendimiento real sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-dv3s-192px
- Colección de sondas ADE20K sobre DINOv3 (PyTorch): https://huggingface.co/collections/canvit/dinov3-ade20k-segmentation-probes-pytorch
- Variante con backbone DINOv3 ViT-B a 192 px: https://huggingface.co/canvit/probe-ade20k-40k-dv3b-192px
- Organización del autor en HuggingFace (todos los checkpoints): https://huggingface.co/canvit
- Modelo base: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Paper (arXiv, resumen): https://arxiv.org/abs/2603.22570
- Paper (PDF): https://arxiv.org/pdf/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
