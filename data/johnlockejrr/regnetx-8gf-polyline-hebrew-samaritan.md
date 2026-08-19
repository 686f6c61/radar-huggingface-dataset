# johnlockejrr/regnetx-8gf-polyline-hebrew-samaritan

## Resumen

El modelo `regnetx-8gf-polyline-hebrew-samaritan` es un detector de líneas de texto (baselines) para manuscritos históricos en escritura hebrea cuadrada y samaritana. Desarrollado por John Locke (johnlockejrr), investigador especializado en procesamiento de lenguas semíticas y digitalización de textos históricos, este modelo resuelve el problema de la detección automática de líneas de base en documentos manuscritos, un paso previo esencial para pipelines de reconocimiento de texto manuscrito (HTR).

La arquitectura combina un backbone RegNetX-8GF (preentrenado en ImageNet-1K V2) con un HybridEncoder de D-FINE y un PolylineTransformer que predice polilíneas mediante puntos de control de B-spline cúbicos (K=8). Con aproximadamente 54,1 millones de parámetros y una ventana de entrada de 1280×1280 píxeles, el modelo genera directamente polilíneas puntuadas como predicción de conjuntos, sin necesidad de post-procesado geométrico adicional. Es un ajuste fino de dominio, no un modelo fundacional multi-escritura, y está diseñado específicamente para manuscritos hebreos medievales y samaritanos.

La relevancia de este modelo radica en su especialización: los manuscritos hebreos y samaritanos presentan particularidades de escritura (dirección RTL, ligaduras, variabilidad caligráfica) que los modelos genéricos de detección de líneas no manejan bien. Con un F1 de 0,942 en validación interna, ofrece un rendimiento notable para esta tarea específica, y su salida puede exportarse directamente a formatos PAGE-XML o ALTO-XML para su integración en flujos de HTR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNetX-8GF backbone + D-FINE HybridEncoder + PolylineTransformer |
| Parametros totales | ~54,1 M (todos entrenables) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision; canvas de 1280×1280 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión bf16-mixed en entrenamiento) |
| Idiomas soportados | hebreo (he), hebreo bíblico (hbo), samaritano (smp), arameo samaritano (sam), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (~208 MB, archivo `best_cbad_f1.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de detección de objetos basada en transformadores. El backbone es un RegNetX-8GF (timm `regnetx_080.tv2_in1k`, preentrenado en ImageNet-1K V2), que extrae características en tres escalas (C3, C4, C5). Estas características se alimentan a un HybridEncoder de D-FINE con `hidden_dim=256` y strides 8/16/32, que actúa como cuello (neck). El decodificador es un PolylineTransformer con 300 queries que predice, para cada línea detectada, una polilínea compuesta por K=8 puntos de control de B-spline cúbico más la altura de la línea. La detección se formula como predicción de conjuntos de polilíneas puntuadas, y los entornos poligonales (BLLA) se aplican solo en el momento de serializar a PAGE/ALTO.

El entrenamiento se realizó sobre un conjunto de datos combinado de 1758 páginas de entrenamiento y 261 de validación, procedentes de dos fuentes: manuscritos hebreos medievales (`Hebrew_Medieval-seg`) y manuscritos samaritanos (`sam_44_mss_pango_additional`, con división a nivel de manuscrito y semilla 42). Las líneas de base se compilaron con simplificación adaptativa para obtener B-splines cúbicos uniformes con K=8 puntos, en coordenadas normalizadas originales y con letterboxing en tiempo de carga.

La receta de entrenamiento usa AdamW con LR base 5×10⁻⁵ (backbone con factor 0,3), sin congelación de capas, warmup lineal de 2 épocas y decaimiento coseno. Se empleó precisión mixta bf16, batch efectivo de 8 (micro-batch 2 × acumulación 4), y un máximo de 150 épocas con early stopping sobre la métrica `cbad_f1_max` (paciencia 25, delta mínimo 0,0005, mínimo 15 épocas). El entrenamiento se detuvo alrededor de la época 80, y el checkpoint liberado es el mejor monitorizado (F1 ≈ 0,942), no el de la última época. La inicialización combinó el backbone de ImageNet con una carga de pesos con coincidencia de formas desde el modelo D-FINE Stage-0 (`johnlockejrr/dfine-det-large-baseline-stage0`), manteniendo los pesos de `input_proj.*.conv` específicos de RegNetX. Se aplicó aumento de datos leve (fotométrico y pequeñas rotaciones, descartando líneas fuera de límites) y una distancia de emparejamiento de 20 px sobre el canvas de 1280.

## Capacidades

- Detección de líneas de base (baselines) en manuscritos hebreos cuadrados y samaritanos, devolviendo polilíneas con 8 puntos de control B-spline y altura por línea.
- Predicción de conjuntos de polilíneas puntuadas, sin necesidad de NMS ni post-procesado geométrico adicional.
- Exportación directa a PAGE-XML y ALTO-XML, con soporte para dirección de texto horizontal de derecha a izquierda (RTL) mediante la opción `--text-direction horizontal-rl`.
- Integración en pipelines de HTR (reconocimiento de texto manuscrito) como etapa de segmentación de líneas.
- Capacidad de ajuste del umbral de confianza (recomendado 0,4; alternativas 0,3 para mayor recall, 0,5 para salidas más limpias).
- Soporte de inferencia con precisión bf16-mixed.
- Modelo de visión puro: no realiza reconocimiento de texto ni detección de regiones de layout.

## Casos de uso

- Digitalización de manuscritos hebreos medievales: el modelo detecta automáticamente las líneas de texto en imágenes de páginas, generando polilíneas que se exportan a PAGE-XML para su uso en transcripción asistida o HTR completo.
- Procesamiento de manuscritos samaritanos: dado que la escritura samaritana tiene características caligráficas distintas, este modelo especializado supera a los detectores genéricos en esta colección, permitiendo construir corpus digitales del Pentateuco samaritano.
- Preparación de datos de entrenamiento para HTR: las líneas detectadas pueden usarse para recortar imágenes de líneas individuales y crear datasets de entrenamiento para modelos de reconocimiento de texto.
- Investigación en paleografía y codicología: la detección precisa de líneas permite analizar la estructura de página, densidad de texto y variaciones de escritura en manuscritos históricos.
- Comparación de arquitecturas de detección de líneas: al ser parte de una familia de modelos (D-FINE, ConvNeXt, RegNetX) sobre el mismo corpus, sirve para evaluar el impacto del backbone en la calidad de detección de baselines.
- Integración en flujos de trabajo de bibliotecas digitales: el modelo puede desplegarse como servicio de segmentación de líneas para colecciones de manuscritos hebreos y samaritanos, con salida en formatos estándar (PAGE, ALTO) compatibles con herramientas como Transkribus o eScriptorium.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card, sobre un conjunto de validación interno combinado de hebreo medieval y samaritano (261 páginas). No se han verificado de forma independiente.

| Metrica | Valor | Notas |
|---|---|---|
| cbad_f1_max (barrido de confianza) | 0,942 | Mejor valor monitorizado; punto de operación conf ≈ 0,40 |
| cbad_f1 @ conf=0,4 | 0,942 | Valor recomendado de producción |
| Precision @ conf=0,4 | 0,961 | Barrido de la mejor época |
| Recall @ conf=0,4 | 0,925 | Barrido de la mejor época |
| cbad_f1 @ conf=0,1 | 0,769 | Solo depuración; no recomendado como métrica de calidad |

La métrica cbad_f1 es de estilo cBAD: emparejamiento húngaro de polilíneas densificadas con coste de Chamfer bidireccional medio, considerando un acierto si el coste es ≤ 20 px. El barrido de confianza en la mejor época muestra: conf 0,1 → ~0,77; conf 0,3 → ~0,92; conf 0,4 → ~0,942; conf 0,5 → ~0,936.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~54 M parámetros con entrada de 1280×1280, el uso de memoria en inferencia con precisión fp32 ronda los 2-3 GB; con bf16 se reduce a aproximadamente 1,5-2 GB. Estas cifras son estimaciones razonables basadas en el tamaño del modelo y la resolución de entrada, no mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1660 Super, RTX 2060, RTX 3060 o superiores pueden ejecutar el modelo sin problemas. En entornos de producción, una T4 o A10 es más que suficiente.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de consumo con 4 GB o más.
- Opciones de despliegue: el modelo se distribuye como safetensors y usa la librería `regnetx-det` (hermana de `dfine-det`). Puede integrarse en pipelines de PyTorch estándar. No se mencionan adaptaciones para vLLM, llama.cpp u Ollama, que son específicas de modelos de lenguaje; para este modelo de visión se usaría TorchServe, ONNX Runtime o un servicio FastAPI personalizado.
- Latencia y throughput: no disponible. Depende de la GPU y del backend de inferencia; con una GPU moderna se espera un tiempo de inferencia del orden de decenas de milisegundos por imagen, pero no hay datos publicados.

## Comparativa con modelos similares

El modelo pertenece a una familia de detectores de líneas para el mismo corpus hebreo+samaritano, desarrollados por el mismo autor. La comparación se basa en la información de la model card y los repos asociados.

| Modelo | Backbone | Parametros | F1 (val interno) | Notas |
|---|---|---|---|---|
| regnetx-8gf-polyline-hebrew-samaritan (este) | RegNetX-8GF | ~54,1 M | 0,942 | HybridEncoder + PolylineTransformer |
| dfine-det-large-baseline-hebrew-samaritan-stage1 | D-FINE Large | no disponible | no disponible | Modelo hermano con backbone D-FINE |
| convnextv2-polyline-base-hebrew-samaritan | ConvNeXtV2 Base | no disponible | no disponible | Modelo hermano con backbone ConvNeXtV2 |
| dfine-det-large-baseline-stage0 | D-FINE Large | no disponible | no disponible | Modelo fundacional Stage-0, usado como inicialización |

No se dispone de comparativas con modelos externos (como detectores genéricos tipo YOLO o DETR) sobre el mismo corpus. La model card menciona que recetas FPN-only en los mismos datos alcanzaron solo ~0,61 de F1 para 8GF, lo que sugiere que la combinación HybridEncoder + transferencia del Stage-0 es clave para el rendimiento.

## Limitaciones y advertencias

- El modelo es un ajuste fino de dominio, no un modelo fundacional multi-escritura. No debe esperarse que funcione bien en escrituras distintas de hebreo cuadrado y samaritano.
- No realiza reconocimiento de texto (transcripción). Solo detecta líneas de base; la transcripción debe hacerse con un modelo HTR aparte.
- No detecta regiones de layout (párrafos, tablas, ilustraciones). Su salida son líneas de texto únicamente.
- Los resultados de validación son sobre un conjunto interno (hebreo+samaritano, 261 páginas) y no equivalen a una evaluación oficial en el test de ICDAR cBAD 2019. No deben usarse para reclamar rendimiento en ese benchmark.
- La métrica `cbad_f1` a confianza 0,1 (~0,77) no debe interpretarse como la calidad del modelo; el punto de operación recomendado es confianza 0,4.
- El modelo puede tener sesgos derivados de los datos de entrenamiento: los manuscritos samaritanos provienen de una colección específica (`sam_44_mss_pango_additional`) y los hebreos de `Hebrew_Medieval-seg`, por lo que la generalización a otras colecciones o estilos caligráficos no está garantizada.
- Riesgo de alucinación: en detección de objetos, esto se manifiesta como líneas falsas positivas en regiones sin texto o con ruido. El umbral de confianza recomendado (0,4) mitiga este riesgo, pero no lo elimina.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin verificación independiente de los resultados.
- No hay información sobre cuantización (GGUF, int8, etc.) ni sobre despliegue en entornos específicos más allá de PyTorch.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/johnlockejrr/regnetx-8gf-polyline-hebrew-samaritan
- Modelo base D-FINE Stage-0: https://huggingface.co/johnlockejrr/dfine-det-large-baseline-stage0
- Modelo hermano D-FINE Stage-1: https://huggingface.co/johnlockejrr/dfine-det-large-baseline-hebrew-samaritan-stage1
- Modelo hermano ConvNeXtV2: https://huggingface.co/johnlockejrr/convnextv2-polyline-base-hebrew-samaritan
- Perfil del autor en HuggingFace: https://huggingface.co/johnlockejrr
- Perfil del autor en GitHub: https://github.com/johnlockejrr/johnlockejrr
- Paper de referencia (D-FINE, arxiv:2410.13842): https://arxiv.org/abs/2410.13842
- Documentación de RegNetX en Torchvision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.regnet_x_8gf.html
