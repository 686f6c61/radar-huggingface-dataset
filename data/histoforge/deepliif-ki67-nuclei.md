# histoforge/deepliif-ki67-nuclei

## Resumen

DeepLIIF-Ki67-Nuclei es un modelo de segmentación de instancias y clasificación de núcleos celulares especializado en imágenes de inmunohistoquímica (IHC) para el marcador de proliferación Ki67 en tejido humano. Lo publica el autor `histoforge` en Hugging Face bajo el identificador `histoforge/deepliif-ki67-nuclei`, con acceso restringido (gated). Se construye sobre el backbone `timm/vit_large_patch16_dinov3.lvd1689m`, un Vision Transformer de tipo DINOv3 con parches de 16x16, adaptado mediante la técnica descrita en el paper arXiv:2508.10104 y un adaptador de tipo Cellpose para la tarea de segmentación de instancias.

El modelo resuelve un problema clásico en patología computacional: identificar y contar núcleos celulares positivos y negativos para Ki67 en portaobjetos teñidos, una tarea directamente relacionada con el índice proliferativo tumoral. La relevancia actual radica en que combina un backbone de auto-supervisión de última generación (DINOv3) con un adaptador específico de segmentación, lo que permite transferir representaciones generales de imagen a una tarea histológica concreta sin entrenar desde cero.

El repositorio ocupa 1,2 GB y declara el pipeline `image-segmentation` con la librería `histoforge`, además de las tareas `instance-segmentation`, `image-classification` e `image-segmentation`. No se han publicado métricas de rendimiento, idiomas soportados ni detalles del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv3 ViT-L/16) con adaptador Cellpose para segmentación de instancias |
| Parametros totales | no disponible (backbone ViT-L de DINOv3, tamaño exacto no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | dinov3 (etiquetada como `license:other` en Hugging Face) |
| Formato de pesos | no disponible (repo de 1,2 GB; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo parte de `timm/vit_large_patch16_dinov3.lvd1689m`, un Vision Transformer de DINOv3 con parches de 16x16 y escala "large", preentrenado de forma auto-supervisada sobre el dataset LVD-1689M. Sobre ese backbone se aplica un adaptador de segmentación de instancias inspirado en Cellpose, según la metodología del paper arXiv:2508.10104, que permite predecir máscaras de núcleos y etiquetas de clasificación (positivo/negativo para Ki67) a partir de la representación del ViT.

No se dispone de información sobre el número de imágenes de entrenamiento, la composición del dataset, si hubo ajuste fino supervisado, aumento de datos o estrategias de validación. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo. La única referencia técnica explícita es el paper arXiv:2508.10104 y la etiqueta `dinov3-adapter-cellpose`, que describe la familia de adaptadores empleada.

## Capacidades

- Segmentación de instancias de núcleos celulares en imágenes de IHC teñidas para Ki67.
- Clasificación de núcleos (positivos/negativos para Ki67) a nivel de instancia.
- Procesamiento de imágenes de patología digital de tejido humano.
- Integración con el ecosistema `timm` mediante el backbone DINOv3 ViT-L/16.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual.
- No dispone de capacidades multilingües ni de generación de texto.
- Capacidades especiales: adaptador de segmentación Cellpose sobre representaciones DINOv3.

## Casos de uso

- Cuantificación del índice proliferativo Ki67 en biopsias tumorales: el modelo segmenta núcleos y clasifica su positividad, permitiendo calcular el porcentaje de células proliferantes de forma automatizada en flujos de patología digital.
- Investigación en oncología traslacional: análisis de cohortes de imágenes IHC para correlacionar el índice Ki67 con variables clínicas, reduciendo el trabajo manual de conteo.
- Control de calidad en laboratorios de anatomía patológica: comparación entre el conteo del patólogo y la predicción automática para detectar discrepancias en la tinción o en la lectura.
- Preprocesado para pipelines de análisis espacial: las máscaras de instancia generadas pueden alimentar análisis de vecindad celular, densidad y morfología nuclear.
- Docencia y validación de algoritmos: servir como referencia reproducible para comparar adaptadores Cellpose sobre backbones DINOv3 en tareas histológicas.
- Integración en visores de patología computacional: desplegar el modelo como servicio de segmentación bajo demanda para láminas WSI divididas en parches, siempre que se respete la licencia y el acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un ViT-L/16 en FP16 requiere del orden de 1-2 GB solo para pesos, más memoria para activaciones según resolución de parche.
- GPU recomendadas: no disponible; por tamaño del backbone, GPU con al menos 8-16 GB de VRAM son razonables (RTX 3090/4090, A100, H100), sin confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en modelos con 8 GB o más, sujeto a la resolución de entrada y al adaptador.
- Opciones de despliegue: no disponible; al ser un modelo `timm` con adaptador propio de la librería `histoforge`, el despliegue probablemente requiere esa librería específica, no vLLM, llama.cpp ni Ollama (no aplicables a visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| histoforge/deepliif-ki67-nuclei | ViT + adaptador Cellpose | DINOv3 ViT-L/16 | Segmentación y clasificación de núcleos Ki67 | dinov3 (other) | Gated en Hugging Face |
| Cellpose (modelos cyto/nuclei) | U-Net | Propio | Segmentación de núcleos genérica | BSD-3 | Público |
| DeepLIIF original | GAN + segmentación | Propio | Traducción virtual de tinciones IHC | No disponible | Público en GitHub |
| Modelos HoVer-Net / StarDist | CNN especializadas | Propio | Segmentación y clasificación nuclear | Varía | Público |

La comparativa es orientativa: no se dispone de métricas del modelo `histoforge` para contrastar rendimiento frente a estas alternativas.

## Limitaciones y advertencias

- No se han publicado métricas de validación, curvas ROC, Dice o F1, por lo que el rendimiento real es desconocido.
- El modelo está especializado en Ki67 e IHC sobre tejido humano; su generalización a otras tinciones o especies no está documentada.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos/negativos en la segmentación y clasificación nuclear.
- Sesgos potenciales derivados del dataset de entrenamiento no documentado (posible infrarrepresentación de ciertos tejidos, laboratorios o escáneres).
- Licencia `dinov3`/`other`: es necesario revisar los términos exactos antes de cualquier uso comercial; el acceso es restringido y requiere aceptar condiciones en Hugging Face.
- No apto para uso clínico directo sin validación regulatoria y auditoría local.
- Dependencia de la librería `histoforge`, lo que puede limitar la portabilidad a otros frameworks.
- Sin información sobre idiomas ni contexto porque no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/histoforge/deepliif-ki67-nuclei
- Paper de referencia: https://arxiv.org/abs/2508.10104
- Backbone base: https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
