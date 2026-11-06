# fkz1103/HPE-PEFT-ckpts

## Resumen

HPE-PEFT es un conjunto de checkpoints para ajuste fino eficiente en parámetros (PEFT) de modelos de visión 3D basados en point clouds. Lo desarrolla el usuario fkz1103 y acompaña al artículo "HPE-PEFT: Hierarchical Point Encoding for Parameter-Efficient Fine-Tuning via Group Geometry on the Positional Pathway", enviado a la revista *Pattern Recognition* y actualmente en revisión. El repositorio de Hugging Face aloja únicamente los pesos entrenados; el código y la documentación completa residen en GitHub.

La propuesta técnica consiste en inyectar un módulo de codificación jerárquica sobre la vía posicional de un transformer de point clouds, de modo que solo se entrenan entre el 1,38 % y el 4,34 % de los parámetros totales del modelo base. Con esa fracción mínima de parámetros ajustables se alcanzan resultados competitivos en clasificación de objetos 3D (ModelNet40, ScanObjectNN) y en segmentación de partes y semántica (ShapeNetPart, S3DIS).

Es relevante para quienes trabajan en visión 3D con recursos de cómputo limitados: permite adaptar un backbone de point clouds preentrenado a nuevas tareas o dominios sin reentrenar el modelo completo. El repo ocupa 0,7 GB y no registra descargas en el momento de la consulta, lo que indica que es un artefacto de investigación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de point clouds con módulo HPE (codificación jerárquica sobre la vía posicional); backbone exacto no disponible |
| Parámetros totales | No disponible (solo se publican los parámetros entrenables: 303,9K–0,99M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre nubes de puntos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoints de `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura se apoya en un transformer de point clouds (etiqueta `point-cloud-transformers`) al que se añade HPE-PEFT, un mecanismo de codificación jerárquica que actúa sobre la vía posicional mediante geometría de grupos. El ajuste fino es de tipo PEFT: se congelan los pesos del backbone y solo se entrenan los módulos HPE inyectados, lo que reduce los parámetros entrenables a 310,3K (1,40 %) en ModelNet40, 303,9K (1,38 %) en ScanObjectNN-Hardest, 0,99M (4,34 %) en ShapeNetPart y 0,98M (4,30 %) en S3DIS.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal. El repositorio incluye tres checkpoints de ablación sobre ModelNet40 con dimensión de cuello de botella b=16, b=32 y b=128, cuyos resultados se remiten al artículo.

## Capacidades

- Clasificación de objetos 3D a partir de nubes de puntos (ModelNet40, ScanObjectNN-Hardest).
- Segmentación de partes de objetos (ShapeNetPart).
- Segmentación semántica de escenas interiores (S3DIS, evaluación en Area 5).
- Ajuste fino eficiente en parámetros: adaptación de un backbone congelado entrenando solo entre el 1,38 % y el 4,34 % de los pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo exclusivamente de visión 3D.
- No dispone de modo de razonamiento (thinking), visión 2D, audio ni generación de texto.

## Casos de uso

- Clasificación de objetos 3D en pipelines de inspección: cargar `hpe_modelnet40.pth` sobre un backbone de point clouds para etiquetar objetos escaneados con un coste de entrenamiento mínimo, útil cuando no hay presupuesto para reentrenar el modelo completo.
- Segmentación de partes para fabricación y CAD inverso: `hpe_shapenetpart.pth` permite descomponer una malla o nube de puntos en sus componentes (por ejemplo, piezas de un objeto) para análisis geométrico o generación de planos.
- Segmentación semántica de interiores: `hpe_s3dis.pth` etiqueta elementos de una escena (suelo, pared, mobiliario) a partir de escaneos, aplicable a modelado BIM, robótica doméstica o realidad aumentada.
- Adaptación a dominios ruidosos: `hpe_scanobjectnn.pth` está entrenado sobre ScanObjectNN-Hardest, con nubes de puntos reales y ocluidas, lo que lo hace adecuado para datos de sensores reales frente a mallas sintéticas.
- Investigación en PEFT para visión 3D: los checkpoints de ablación (b=16, b=32, b=128) permiten reproducir y comparar el efecto de la dimensión del cuello de botella sin reentrenar desde cero.
- Prototipado rápido con recursos limitados: al requerir solo entre 0,3M y 1M de parámetros entrenables, se puede ajustar el modelo en una única GPU consumer para experimentos académicos o pruebas de concepto.
- Reproducibilidad de resultados: los pesos publicados permiten verificar las métricas del artículo (93,35 OA en ModelNet40, 81,32 Part-mIoU en ShapeNetPart) sin depender del código de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Checkpoint | Dataset | Tarea | Parámetros entrenables | Métrica |
|---|---|---|---|---|
| `hpe_modelnet40.pth` | ModelNet40 | Clasificación | 310,3K (1,40 %) | 93,35 OA / 90,33 mAcc |
| `hpe_scanobjectnn.pth` | ScanObjectNN-Hardest | Clasificación | 303,9K (1,38 %) | 79,90 OA / 77,21 mAcc |
| `hpe_shapenetpart.pth` | ShapeNetPart | Segmentación de partes | 0,99M (4,34 %) | 81,32 Part-mIoU |
| `hpe_s3dis.pth` | S3DIS (Area 5) | Segmentación semántica | 0,98M (4,30 %) | 62,12 mIoU / 88,05 OA |

No se han publicado en la información disponible resultados comparativos frente a otros métodos PEFT ni frente a modelos de referencia de visión 3D.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repo (0,7 GB) sugiere un modelo base de tamaño moderado, pero no se especifica.
- GPU recomendadas: no disponible. Al ser un transformer de point clouds con un backbone congelado, es probable que quepa en GPUs consumer, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada; los parámetros entrenables son mínimos (hasta 0,99M), lo que sugiere que el ajuste fino es asequible, pero el coste del backbone congelado no se detalla.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) según el ejemplo de la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros métodos de PEFT para point clouds ni con backbones de referencia (PointNet++, Point Transformer, etc.), por lo que no es posible establecer una comparativa rigurosa con datos verificables.

## Limitaciones y advertencias

- Modelo de investigación en revisión por pares: el artículo está sometido a *Pattern Recognition* y pendiente de aceptación; los resultados deben considerarse preliminares.
- Sin datos sobre sesgos: no se documenta el comportamiento del modelo ante clases desbalanceadas, geometrías atípicas o dominios fuera de distribución.
- Riesgo de sobreajuste a los datasets de evaluación: los checkpoints están entrenados y evaluados sobre ModelNet40, ScanObjectNN, ShapeNetPart y S3DIS; su generalización a otros dominios no está validada.
- Dependencia del backbone: los pesos solo son útiles junto con la arquitectura base y el código de HPE-PEFT del repositorio de GitHub; no son un modelo autónomo.
- Sin soporte lingüístico ni multimodal: no puede usarse para tareas de texto, tool calling ni agentes.
- Licencia MIT: permite uso comercial y modificación, pero el artículo en revisión y la ausencia de validación externa desaconsejan su uso en producción sin una evaluación propia.
- Repositorio con 0 descargas y 1 like: sin comunidad ni soporte documentado más allá de la model card y el código.

## Enlaces

- Hugging Face: https://huggingface.co/fkz1103/HPE-PEFT-ckpts
- Código: https://github.com/fkz1103/HPE-PEFT
- Artículo: enviado a *Pattern Recognition* (en revisión); sin enlace disponible.
