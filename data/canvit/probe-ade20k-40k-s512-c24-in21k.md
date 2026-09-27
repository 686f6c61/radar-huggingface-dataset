# canvit/probe-ade20k-40k-s512-c24-in21k

## Resumen

CanViT ADE20K probe (24 × 24 canvas) es una sonda lineal de segmentación semántica entrenada sobre las características congeladas del modelo base CanViT-B/16 preentrenado. No es un modelo generativo ni un LLM: es un cabezal de evaluación (linear probe) que traduce el canvas latente de 24 × 24 tokens de CanViT en un mapa de 150 clases semánticas de ADE20K. Lo desarrolla el equipo de CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y se publica como parte del ecosistema `canvit-pytorch`.

Su relevancia es metodológica: CanViT, el Canvas Vision Transformer, es un modelo fundacional de visión activa que percibe la escena mediante una secuencia de *glimpses* (foveados) localizados y la reconstruye sobre un canvas retinotópico de alcance global. Esta sonda sirve para medir, sin reentrenar el backbone, cuánta información semántica densa conserva ese canvas tras 10 foveados de 128 px sobre escenas de 512 px. El resultado es un checkpoint minúsculo (159.894 parámetros según safetensors) que se acopla al backbone en tiempo de carga mediante `from_pretrained_with_probe`.

El repositorio contiene únicamente los pesos de la sonda más la lógica de preprocesado, con licencia MIT. Está pensado para reproducir el protocolo de *probing* del paper (NeurIPS 2026) y para comparar variantes de resolución de canvas (c10, c12, c24, c32, c64) dentro de la misma colección de sondas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre características congeladas de un Vision Transformer de visión activa: LayerNorm, dropout, BatchNorm y convolución 1 × 1 que proyecta a 150 clases |
| Parametros totales | 159.894 (solo la sonda; el backbone CanViT-B/16 no se incluye en este repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto de texto. Canvas latente de 24 × 24 tokens (576 posiciones) alimentado por rollouts de 10 glimpses de 128 px sobre escenas de 512 px |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones; el entrenamiento usa autocast en bfloat16) |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente entrenado aquí es una sonda de segmentación densa compuesta por LayerNorm, dropout, BatchNorm y una convolución 1 × 1 que mapea cada token del canvas a las 150 clases de ADE20K (`scene_parse_150`). La salida tiene forma `[1, 150, 24, 24]`, es decir, una predicción por celda del canvas. El backbone permanece congelado: la sonda aprende únicamente a leer las características del canvas de CanViT-B/16, cuyo preentrenamiento se referencia como `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16`. CanViT emplea RoPE relativo a la escena para ligar un Vision Transformer retinotópico a un canvas de memoria de alcance global, lo que constituye la innovación central del modelo base.

El protocolo de entrenamiento sigue el esquema de *probing* del paper: 40.000 pasos con batch size 16, optimizador AdamW con learning rate máximo 0,0003 y weight decay 0,001, calentamiento lineal de 1.500 pasos seguido de decaimiento coseno. Cada rollout consiste en 10 glimpses de 128 px muestreados con viewpoints R-IID sobre escenas de 512 px. Se aplica aumento de datos con recortes aleatorios de escala 0,5 a 2 y volteos horizontales, dropout de 0,1 y autocast en bfloat16. No se documenta en la información disponible el número total de tokens de imagen vistos, la composición exacta del dataset más allá de `scene_parse_150` ni el uso de RLHF/DPO (no aplicable a este tipo de modelo).

## Capacidades

- Segmentación semántica densa de 150 clases sobre el canvas de 24 × 24 de CanViT, con etiquetas nombradas en `CLASS_NAMES` del paquete `canvit-pytorch`.
- Lectura de características congeladas del backbone CanViT-B/16 sin reentrenamiento, mediante `CanViTForSemanticSegmentation.from_pretrained_with_probe`.
- Procesamiento de escenas de 512 px a través de una secuencia de foveados de 128 px con viewpoints R-IID (10 glimpses por rollout en el protocolo de entrenamiento).
- Mantenimiento de estado de canvas persistente entre pasos (`init_state`, `canvas_grid_size=24`), lo que permite alimentar glimpses de forma incremental.
- Integración con el ecosistema `canvit-pytorch` (preprocesado, `Viewpoint`, `sample_at_viewpoint`) y compatibilidad con la revisión `canvit-pytorch-0.1` del repositorio.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso textual, capacidades multilingües ni generación de texto: es un cabezal de percepción visual.
- No se documentan capacidades de visión más allá de la segmentación semántica (ni detección, ni VQA, ni vídeo, ni audio).

## Casos de uso

- Evaluación de representaciones de visión activa: permite cuantificar cuánta semántica densa conserva el canvas de CanViT tras 10 foveados de 128 px, sin necesidad de reentrenar el backbone, útil para investigación en representaciones y *probing*.
- Comparación de configuraciones de canvas: al existir sondas hermanas con canvas de 10, 12, 32 y 64 celdas, esta variante de 24 × 24 sirve para estudiar el compromiso entre resolución espacial del canvas y coste de cómputo.
- Prototipado de segmentación semántica en robótica con percepción foveada: el modelo se adapta a pipelines que muestrean regiones concretas de la escena en lugar de procesar la imagen completa a alta resolución.
- Análisis de escenas indoor y outdoor en el dominio ADE20K: útil para etiquetado automático de 150 clases en imágenes de escenas naturales y arquitectónicas, como paso previo a un etiquetado manual.
- Reproducción de resultados del paper: el checkpoint está preparado para replicar el protocolo de *probing* publicado, con hiperparámetros y número de pasos documentados.
- Verificación de implementaciones: al ser una sonda pequeña con interfaz estable (`canvit-pytorch>=0.2`), sirve como prueba de integración para comprobar que el preprocesado, el muestreo de viewpoints y el estado del canvas funcionan correctamente.
- Generación de mapas de etiquetas de baja resolución para tareas posteriores: la salida de 24 × 24 puede actuar como máscara gruesa para guiar refinamiento, *inpainting* o selección de regiones de interés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card detalla el protocolo de entrenamiento de la sonda (40.000 pasos, batch 16, AdamW, lr 0,0003) y la tarea (150 clases de ADE20K), pero no incluye valores de mIoU ni comparaciones cuantitativas frente a otras sondas o backbones. El paper referenciado (`arxiv:2603.22570`) es la fuente donde deben consultarse las métricas, si bien no se ha proporcionado su contenido en esta ficha.

| Benchmark | Resultado | Notas |
|---|---|---|
| ADE20K (mIoU) | No disponible | No reportado en la información proporcionada |
| ADE20K (accuracy por píxel) | No disponible | No reportado en la información proporcionada |
| Comparación con otras sondas (c10, c12, c32, c64) | No disponible | Existen los checkpoints, pero no se aportan cifras |

## Requisitos de hardware

- VRAM estimada para la sonda: despreciable por sí sola (159.894 parámetros, repo de 0,0 GB). El consumo real lo determina el backbone CanViT-B/16, cuyo tamaño en memoria no se especifica en la información disponible.
- El entrenamiento documentado usa bfloat16 autocast, por lo que se recomienda hardware con soporte nativo de bfloat16 (A100, H100, RTX 30/40 series o superiores).
- Cabe en GPU de consumo: la sonda en sí se ejecuta en CPU sin problemas; la viabilidad en GPU de consumo depende del backbone, no cuantificado aquí.
- Opciones de despliegue: al ser un modelo de visión con librería propia, el despliegue se realiza con `canvit-pytorch>=0.2` (o `canvit-pytorch<0.2` con `revision="canvit-pytorch-0.1"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del número de glimpses, del tamaño de lote y del dispositivo; la model card solo fija el escenario de entrenamiento (10 glimpses de 128 px, escenas de 512 px, batch 16).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Canvas / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-s512-c24-in21k | Sonda lineal ADE20K sobre CanViT-B/16 | 159.894 | Canvas 24 × 24 | MIT | HuggingFace (6 descargas) |
| canvit/probe-ade20k-40k-s512-c10-in21k | Sonda lineal ADE20K sobre CanViT-B/16 | No disponible | Canvas 10 × 10 | MIT (segun colección) | HuggingFace |
| canvit/probe-ade20k-40k-s512-c12-in21k | Sonda lineal ADE20K sobre CanViT-B/16 | No disponible | Canvas 12 × 12 | MIT (segun colección) | HuggingFace |
| canvit/probe-ade20k-40k-s512-c32-in21k | Sonda lineal ADE20K sobre CanViT-B/16 | No disponible | Canvas 32 × 32 | MIT (segun colección) | HuggingFace |
| canvit/probe-ade20k-40k-s512-c64-in21k | Sonda lineal ADE20K sobre CanViT-B/16 | No disponible | Canvas 64 × 64 | MIT (segun colección) | HuggingFace |

No se dispone de comparaciones con sondas de segmentación sobre otros backbones (por ejemplo, DINOv2 o SAM) en la información proporcionada, ni de cifras de rendimiento que permitan ordenar estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un cabezal entrenado sobre `scene_parse_150`, hereda la distribución y los sesgos de anotación de ADE20K (sesgo hacia escenas interiores y exteriores habituales en ese dataset).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas o sobreconfiadas en clases poco representadas, ya que la sonda no verifica la coherencia global de la escena.
- Limitación de resolución: la salida es de 24 × 24 celdas, muy inferior a la resolución de entrada (512 px), por lo que las fronteras entre objetos son gruesas y los objetos pequeños pueden desaparecer.
- Limitación de dominio: solo se ha entrenado para las 150 clases de ADE20K; fuera de ese vocabulario no hay etiqueta válida.
- Dependencia del backbone: no es un modelo autónomo. Requiere descargar y ejecutar `canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16` y usar la API `from_pretrained_with_probe`; un cambio de revisión o de preprocesado invalida los resultados.
- Compatibilidad de versiones: con `canvit-pytorch<0.2` es obligatorio pasar `revision="canvit-pytorch-0.1"` a `from_pretrained`, de lo contrario la carga puede fallar.
- Licencia: MIT, permisiva para uso comercial, pero la licencia del backbone base debe verificarse por separado, ya que no se detalla en la información disponible.
- Adopción muy baja (6 descargas, 0 likes) y fecha de creación posterior a la fecha de actualización indicada, lo que sugiere un artefacto de investigación y no un componente listo para producción.
- No se documentan métricas de robustez, calibración ni comportamiento ante dominios fuera de ADE20K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c24-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Colección de checkpoints: https://huggingface.co/canvit
- Sonda con canvas 10 × 10: https://huggingface.co/canvit/probe-ade20k-40k-s512-c10-in21k
- Sonda con canvas 12 × 12: https://huggingface.co/canvit/probe-ade20k-40k-s512-c12-in21k
- Sonda con canvas 32 × 32: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
- Sonda con canvas 64 × 64: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Colección CanViT ADE20K Segmentation Probes (PyTorch): https://huggingface.co/collections/canvit/canvit-ade20k-segmentation-probes-pytorch
