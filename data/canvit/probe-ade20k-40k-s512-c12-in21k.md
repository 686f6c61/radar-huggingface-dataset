# canvit/probe-ade20k-40k-s512-c12-in21k

## Resumen

Este repositorio contiene una sonda lineal (linear probe) de segmentación semántica sobre el canvas de 12 × 12 de CanViT, el Canvas Vision Transformer. No es un modelo generativo ni un modelo de lenguaje: es un cabezal de segmentación de 150 clases de ADE20K entrenado sobre características congeladas del backbone `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`, siguiendo el protocolo de probing descrito en el artículo del proyecto (NeurIPS 2026). Lo desarrolla el equipo de CanViT (Berreby, Du, Durand y Krishna) y se publica bajo licencia MIT.

CanViT se presenta como un foundation model de visión activa: en lugar de procesar la imagen completa en una sola pasada, observa la escena mediante una secuencia de vistazos (glimpses) y va acumulando la información en un canvas de resolución espacial fija. En este caso, el canvas es de 12 × 12 celdas y la sonda devuelve logits con forma `[1, 150, 12, 12]`, es decir, un mapa de segmentación de 150 clases a resolución muy baja que después debe reescalarse a la imagen original.

La relevancia de esta ficha es doble. Por un lado, permite evaluar de forma aislada la calidad de las representaciones del backbone CanViT sin reentrenarlo: si el canvas de 12 × 12 con características congeladas es suficiente para una tarea densa como ADE20K, el backbone es utilizable para tareas posteriores. Por otro lado, el artefacto publicado es minúsculo (159.894 parámetros según el safetensors del repositorio), lo que lo convierte en un componente ligero dentro de un pipeline mayor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer con visión activa (CanViT, Canvas Vision Transformer) más sonda lineal de segmentación (LayerNorm, dropout, BatchNorm, convolución 1 × 1) |
| Parámetros totales | 159.894 en el artefacto publicado (sonda); parámetros del backbone no disponibles |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | canvas de 12 × 12 = 144 celdas; secuencias de 10 vistazos de 128 px sobre escenas de 512 px durante el entrenamiento |
| Tipos de cuantización | no disponible (no se documentan recetas de cuantización para este repositorio) |
| Idiomas soportados | no disponible (modelo de visión, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-segmentation |
| Dataset de entrenamiento | scene_parse_150 (ADE20K), 150 clases |
| Número de clases de salida | 150 |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Librería | canvit-pytorch (se requiere >= 0.2) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 6 / 0 (a fecha de la consulta) |

## Arquitectura y entrenamiento

El backbone CanViT procesa la escena como una secuencia de vistazos muestreados en puntos de vista (viewpoints) concretos, en lugar de una única pasada densa. Cada vistazo se proyecta y se integra en un canvas de tamaño fijo que mantiene el estado de la escena a lo largo de la secuencia. En esta sonda, el canvas es de 12 × 12 celdas, un espacio de representación muy comprimido: cada celda resume una región amplia de la escena de 512 px. El cabezal es deliberadamente simple (LayerNorm, dropout, BatchNorm y una convolución 1 × 1), lo que aísla la calidad de las características congeladas del backbone como variable explicativa del rendimiento.

El entrenamiento de la sonda se realizó con 40.000 pasos, tamaño de lote 16 y optimizador AdamW con tasa de aprendizaje máxima de 0,0003 y weight decay de 0,001, con calentamiento lineal de 1.500 pasos seguido de decaimiento coseno. Los rollouts de entrenamiento consisten en 10 vistazos de 128 px con viewpoints R-IID sobre escenas de 512 px. La aumentación incluye recortes aleatorios con escala entre 0,5 y 2 y volteos horizontales; el dropout es de 0,1 y se usa autocast en bfloat16. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de visión.

## Capacidades

- Segmentación semántica densa sobre 150 clases de ADE20K, con salida de logits `[1, 150, 12, 12]`.
- Procesamiento de escenas de 512 px mediante vistazos de 128 px, útil cuando conviene limitar la resolución efectiva de entrada.
- Gestión de estado mediante canvas: el modelo mantiene una representación de la escena y la actualiza con cada nuevo vistazo y viewpoint.
- Extracción de características congeladas del backbone CanViT para tareas posteriores de evaluación (linear probing).
- Control explícito del punto de vista mediante el objeto `Viewpoint` y la función `sample_at_viewpoint`, incluyendo `Viewpoint.full_scene`.
- Inicialización de estado con `init_state(batch_size, canvas_grid_size=12)`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM; su "multi-paso" es la secuencia de vistazos.
- Capacidades multilingües: no aplica, el modelo no procesa texto.
- No incorpora visión aumentada con texto, audio ni modos de razonamiento explícito.

## Casos de uso

- Evaluación de representaciones congeladas: la sonda sirve como referencia reproducible para medir cuánta información semántica conserva el canvas de 12 × 12 de CanViT, comparando configuraciones de backbone con el mismo protocolo de probing.
- Preanotación de datasets de segmentación: el mapa de 12 × 12 se puede reescalar y usar como propuesta inicial de etiquetas para que anotadores humanos lo refinen, reduciendo el coste en escenas de interiores y exteriores con las 150 clases de ADE20K.
- Visión activa en robótica: el modelo permite dirigir la adquisición de información mediante viewpoints, de modo que un agente que no puede capturar toda la escena de una vez puede planificar la secuencia de vistazos y leer el estado acumulado del canvas.
- Segmentación de bajo coste computacional en el cabezal: al ser una sonda de 159.894 parámetros sobre características congeladas, el coste adicional respecto al backbone es despreciable, lo que facilita desplegarla junto al extractor de características sin duplicar memoria de parámetros.
- Análisis de escenas con resolución de trabajo fija: al operar sobre escenas de 512 px y vistazos de 128 px, encaja en pipelines con presupuesto de píxeles controlado, por ejemplo sistemas embarcados que reducen la resolución antes de razonar sobre la escena.
- Investigación en arquitecturas de canvas: el repositorio permite variar el tamaño de la rejilla del canvas o el número de vistazos y observar el efecto en una tarea densa estándar, algo útil para estudiar compromisos entre compresión de estado y precisión.
- Prototipado de demostraciones de segmentación: con `canvit-pytorch>=0.2` y unas pocas líneas se obtiene un mapa de etiquetas, adecuado para demos y cuadernos de exploración antes de invertir en cabezales densos de mayor resolución.
- Comparación de protocolos de probing: al seguir un protocolo explícito (rollouts R-IID, 10 vistazos, aumentación definida), sirve como punto de control para validar si mejoras en el backbone se traducen en mejor segmentación con un cabezal congelado simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la configuración de entrenamiento y el procedimiento de uso, pero no incluye valores de mIoU, precisión por clase ni comparaciones numéricas con otras sondas o backbones. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- La sonda en sí es mínima: 159.894 parámetros según el safetensors del repositorio, con un peso en disco prácticamente despreciable (el repositorio figura como 0,0 GB).
- El coste real está en el backbone, que debe cargarse por separado desde el repositorio base. Los parámetros de ese backbone no se detallan en la información proporcionada; por la nomenclatura `b16` y la práctica habitual en ViT-B/16, se trata de un orden de decenas de millones de parámetros, pero este dato no está confirmado en la información disponible.
- VRAM estimada para inferencia: no disponible como cifra publicada. Como orientación, el cuello de botella es procesar escenas de 512 px y vistazos de 128 px en bfloat16, lo que en un ViT-B/16 suele situarse en el rango de pocos GB, incluyendo pesos y activaciones; esta estimación no procede de la documentación del modelo y debe verificarse en el hardware objetivo.
- GPU recomendadas: no disponible. Para desarrollo y pruebas, cualquier GPU con suficiente VRAM para el backbone en bfloat16 debería ser suficiente; para producción, conviene medir en el hardware concreto antes de dimensionar.
- ¿Cabe en GPU de consumo? Con alta probabilidad sí para el backbone en bfloat16 en GPU de gama media con 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090), siempre que la escena se procese a 512 px como indica la model card. Esta afirmación es una estimación, no un dato publicado.
- Opciones de despliegue: la vía documentada es PyTorch con la librería `canvit-pytorch>=0.2`, usando `CanViTForSemanticSegmentation.from_pretrained_with_probe` y modo `torch.inference_mode()`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime.
- Compatibilidad de revisión: con `canvit-pytorch<0.2` hay que pasar `revision="canvit-pytorch-0.1"` a `from_pretrained`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numéricos comparables en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

| Modelo | Tipo | Parámetros | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-s512-c12-in21k | Sonda lineal de segmentación sobre backbone de visión activa | 159.894 (sonda); backbone no disponible | Escenas de 512 px, vistazos de 128 px, canvas 12 × 12 | MIT | HuggingFace, requiere canvit-pytorch >= 0.2 |
| Backbones ViT con sonda lineal para ADE20K | Sonda lineal sobre características congeladas | Variable según backbone | Imagen completa a resolución fija | Según backbone | Habitual en la literatura de representaciones visuales |
| Modelos de segmentación densa supervisados (por ejemplo, cabezales tipo Segmenter o Mask2Former) | Segmentación entrenada de extremo a extremo | Decenas de millones en adelante | Imagen completa, salida a resolución alta | Variable según implementación | Amplia, con pesos públicos en varios casos |
| Modelos de segmentación promptables (por ejemplo, SAM) | Segmentación guiada por indicaciones | Variable | Imagen completa más prompts | Variable según variante | Amplia |

No se han encontrado en la información disponible valores de mIoU ni comparaciones con alternativas concretas, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El mapa de salida es de 12 × 12 celdas para 150 clases: es una segmentación de muy baja resolución espacial, inadecuada para aplicaciones que requieran contornos precisos sin un paso posterior de refinado o sobremuestreo.
- La sonda se entrena sobre características congeladas del backbone, de modo que su techo de calidad está acotado por el backbone base. Un backbone distinto invalida la sonda.
- Entrenamiento limitado a un único dataset (scene_parse_150 / ADE20K). El comportamiento fuera de la distribución de ese corpus, en dominios como imagen médica, satélite o documentos, no está caracterizado.
- No hay resultados de benchmarks publicados en la información disponible, por lo que no se puede verificar el rendimiento real frente a alternativas.
- El modelo no procesa texto: no hay soporte de idiomas, tool calling ni agentes conversacionales. Cualquier uso de ese tipo requeriría un componente externo.
- Riesgo de error de clasificación en clases poco representadas o ambiguas de ADE20K: no se publica precisión por clase ni matriz de confusión, por lo que no se puede cuantificar.
- La licencia MIT permite uso comercial con atribución y sin garantías, pero se debe verificar la licencia y los términos del modelo base del que dependen las características congeladas antes de un despliegue en producción.
- La adopción es muy baja (6 descargas y 0 likes a fecha de la consulta), lo que implica poca validación externa, escasa cobertura de incidencias y riesgo de dependencia de una única librería (`canvit-pytorch`).
- Dependencia de versión: el código de la model card asume `canvit-pytorch>=0.2`; con versiones anteriores hay que fijar la revisión `canvit-pytorch-0.1`, lo que puede provocar errores silenciosos si no se gestiona.
- No se documentan métodos de cuantización ni formatos alternativos de pesos, lo que limita las opciones de optimización en producción.
- El repositorio figura con tamaño 0,0 GB, coherente con un artefacto diminuto, pero conviene verificar la integridad de la descarga y el acceso al backbone base, que no está incluido aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c12-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Colección de checkpoints: https://huggingface.co/canvit
- Artículo (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Repositorio de código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Dataset scene_parse_150 (ADE20K): https://huggingface.co/datasets/scene_parse_150
