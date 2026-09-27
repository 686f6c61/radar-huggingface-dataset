# canvit/probe-ade20k-40k-s512-c8-in21k

## Resumen

CanViT (Canvas Vision Transformer) es un modelo fundacional de visión activa: observa una escena mediante una secuencia de "glimpses" (recortes de 128 px) y mantiene una representación global del entorno sobre un canvas de 8×8 celdas. Este repositorio concreto, canvit/probe-ade20k-40k-s512-c8-in21k, no contiene el modelo completo, sino una sonda (probe) de segmentación semántica ADE20K entrenada sobre las características congeladas del canvas 8×8 del checkpoint base canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02.

El probe suma 159.894 parámetros (dato extraído de los safetensors) y se compone de LayerNorm, dropout, BatchNorm y una convolución 1×1 que proyecta cada una de las 64 celdas del canvas a las 150 clases de ADE20K. Se entrenó durante 40.000 pasos con AdamW a batch size 16, learning rate máximo 0,0003, warmup lineal de 1.500 pasos y decaimiento coseno, en precisión bfloat16, sobre rollouts de 10 glimpses de 128 px con viewpoints R-IID y escenas de 512 px.

Su relevancia es metodológica: es una sonda reproducible bajo el protocolo de evaluación del artículo de CanViT (NeurIPS 2026), lo que permite medir la calidad de las representaciones del backbone congelado y comparar checkpoints sin reentrenar cabeceras de segmentación. La licencia MIT y el tamaño mínimo del probe lo hacen adecuado para reproducir experimentos, aunque la resolución de salida (8×8) es deliberadamente gruesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre el canvas de un Canvas Vision Transformer (CanViT): LayerNorm, dropout, BatchNorm y convolución 1×1 |
| Parametros totales | 159.894 (solo el probe, según safetensors); el backbone no se incluye en este repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en tokens; canvas de 8×8 (64 celdas), escenas de 512 px y glimpses de 128 px, entrenado con rollouts de 10 glimpses |
| Tipos de cuantizacion | No disponible; no se publican variantes GGUF, AWQ ni GPTQ (pesos en safetensors, entrenamiento en bfloat16) |
| Idiomas soportados | No disponible; es un modelo de visión sin entrada ni salida de texto |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Segmentación semántica (pipeline: image-segmentation) |
| Dataset de entrenamiento | scene_parse_150 (ADE20K) |
| Número de clases de salida | 150 |
| Resolución de escena | 512 px |
| Tamaño de glimpse | 128 px |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Librería | canvit-pytorch (>= 0.2; con < 0.2 usar revision="canvit-pytorch-0.1") |
| Descargas / likes | 7 / 0 |
| Fecha de creación / actualización | 2026-03-16 / 2026-09-26 |

## Arquitectura y entrenamiento

CanViT es un transformer de visión con un mecanismo de visión activa: en lugar de procesar la imagen completa en una sola pasada, recibe glimpses y los integra en un canvas global que actúa como memoria de escena. Esta ficha corresponde exclusivamente a la cabeza de evaluación: una sonda de 159.894 parámetros formada por LayerNorm, dropout (0,1), BatchNorm y una convolución 1×1 que opera sobre la rejilla 8×8 del canvas y devuelve logits de 150 clases (tensor [batch, 150, 8, 8]). El backbone permanece totalmente congelado durante el entrenamiento del probe.

El entrenamiento se realizó con el protocolo de probing del artículo: 40.000 pasos, batch size 16, optimizador AdamW con weight decay 0,001, learning rate máximo 0,0003, warmup lineal de 1.500 pasos seguido de decaimiento coseno, aumentación con recortes aleatorios de escala 0,5 a 2 y volteos horizontales, y autocast en bfloat16. Los rollouts de entrenamiento usan 10 glimpses de 128 px con viewpoints R-IID sobre escenas de 512 px. La integración en código se hace con `CanViTForSemanticSegmentation.from_pretrained_with_probe`, que descarga el backbone base y superpone este probe.

## Capacidades

- Segmentación semántica de escenas sobre 150 clases de ADE20K, con salida como mapa de logits de 8×8 celdas (64 predicciones por imagen).
- Visión activa: el modelo mantiene un estado de canvas (`init_state(batch_size, canvas_grid_size)`) que se actualiza de forma incremental a medida que se procesan nuevos glimpses y viewpoints.
- Soporte de viewpoints arbitrarios, incluido `Viewpoint.full_scene`, que permite una pasada única sobre la escena completa.
- Reutilización de características congeladas: el probe se puede combinar con distintos checkpoints del backbone siempre que compartan la misma configuración de canvas.
- Etiquetado de clases con nombres legibles mediante `CLASS_NAMES` del módulo `canvit_pytorch.benchmarks.ade20k`.
- No dispone de tool calling, function calling, capacidades de agente, generación de texto, matemáticas, audio ni multilingüismo: es un componente puramente visual.

## Casos de uso

- Reproducción de la evaluación del artículo: usar este probe como sonda fija para medir la calidad de las representaciones de CanViT sobre ADE20K bajo condiciones controladas y comparables entre checkpoints.
- Comparación de checkpoints base: al estar el backbone congelado, se puede sustituir el modelo base y aislar el efecto de las representaciones sin reentrenar la cabeza de segmentación.
- Etiquetado grueso de escenas: obtener un mapa 8×8 con la clase dominante de cada región, útil para "scene layout", resúmenes visuales o indexación de imágenes por contenido.
- Preanotación para pipelines de anotación humana: generar máscaras iniciales de 150 clases sobre imágenes de escena y reducir el coste de etiquetado manual antes de la revisión.
- Investigación en visión activa: analizar cómo evoluciona el canvas y la máscara a medida que se acumulan glimpses y se cambia de viewpoint, lo que permite estudiar políticas de fijación (dónde mirar a continuación) con una métrica semántica directa.
- Robótica y navegación de bajo coste: representación semántica compacta del entorno (64 celdas) para heurísticas de decisión, asumiendo que la granularidad es gruesa y no permite contornos precisos.
- Control de calidad de datasets: detectar imágenes fuera de dominio comparando la distribución de clases predicha con la esperada en ADE20K.
- Docencia y validación de integraciones: ejemplo mínimo y reproducible de carga del backbone más probe mediante canvit-pytorch, útil para verificar entornos de instalación y versiones de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye valores de mIoU ni de ninguna otra métrica para este probe, y la búsqueda web asociada no aportó datos adicionales.

## Requisitos de hardware

- VRAM del probe: despreciable; 159.894 parámetros ocupan aproximadamente 0,6 MB en fp32 y 0,3 MB en bfloat16.
- VRAM total: no disponible. El consumo real lo determina el checkpoint base, que se descarga desde otro repositorio y cuyos parámetros no se detallan en la información proporcionada. La nomenclatura "canvitb16" sugiere un tamaño tipo ViT-B/16, pero es una inferencia no confirmada.
- GPU recomendadas: no disponible. El probe en sí se ejecuta en cualquier GPU, e incluso en CPU, siempre que el backbone quepa en memoria.
- GPU de consumo: el probe cabe sin problema en cualquier GPU de consumo; la viabilidad del conjunto depende exclusivamente del backbone congelado.
- Opciones de despliegue: canvit-pytorch >= 0.2 (con revision="canvit-pytorch-0.1" para versiones anteriores). No aplican runtimes de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de texto ni se distribuye en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado datos cuantitativos comparables en la información disponible, por lo que no es posible establecer una comparación numérica. A continuación se resume la diferencia de enfoque frente a las alternativas habituales de segmentación semántica en ADE20K:

| Modelo / familia | Enfoque | Resolución de salida | Datos comparativos |
|---|---|---|---|
| probe-ade20k-40k-s512-c8-in21k | Sonda lineal sobre características congeladas de CanViT (visión activa) | 8×8 (64 celdas) | Referencia de esta ficha |
| Sondas lineales sobre features de ViT tipo DINOv2/DINOv3 | Sonda sobre backbone congelado | Habitualmente por parche, según la cabeza | No disponible |
| SegFormer, Mask2Former, UPerNet | Segmentación supervisada de extremo a extremo | Por píxel | No disponible |

## Limitaciones y advertencias

- El probe tiene solo 159.894 parámetros y no ajusta el backbone: el techo de calidad queda fijado por las características congeladas del modelo base.
- La salida es un mapa de 8×8, extremadamente grueso; no sirve para aplicaciones que exijan máscaras por píxel, contornos precisos o segmentación de objetos pequeños.
- Vocabulario cerrado de 150 clases de ADE20K: cualquier elemento fuera de ese conjunto se asigna a la clase más parecida.
- Entrenado únicamente sobre scene_parse_150, con riesgo de degradación ante dominios distintos (imágenes médicas, satelitales, ilustraciones, etc.).
- Discrepancia entre entrenamiento e inferencia: el entrenamiento usa rollouts de 10 glimpses de 128 px con viewpoints R-IID, mientras que el ejemplo de la model card usa un único viewpoint de escena completa; conviene validar la configuración de inferencia antes de usarla en producción.
- No hay métricas publicadas en la información disponible, por lo que no se puede afirmar nada sobre su precisión real.
- Repositorio con 7 descargas y 0 likes: sin validación por parte de la comunidad.
- Licencia MIT para este repositorio, pero el checkpoint base se distribuye por separado y su licencia debe verificarse de forma independiente antes de un uso comercial.
- El repositorio ocupa 0,0 GB: el probe se resuelve por código (canvit-pytorch) y los pesos del backbone deben descargarse aparte, lo que añade dependencia de red y de versiones.
- Sin capacidades de texto, razonamiento, tool calling ni agentes; no es adecuado como sustituto de un modelo de lenguaje en tareas multimodales conversacionales.
- Como todo modelo de visión entrenado con datos web y de escenas, puede heredar sesgos de representación de escenas, objetos y entornos poco frecuentes en ADE20K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c8-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Colección de checkpoints de CanViT: https://huggingface.co/canvit
- Artículo (NeurIPS 2026, arXiv:2603.22570): https://arxiv.org/abs/2603.22570
- Código fuente: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Dataset de referencia: scene_parse_150 (ADE20K), citado en la model card como `dataset:scene_parse_150`
- Nota sobre la búsqueda web: los resultados obtenidos no guardaban relación con el modelo (enlaces a servidores de ajedrez como lichess.org y chess.com), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.
