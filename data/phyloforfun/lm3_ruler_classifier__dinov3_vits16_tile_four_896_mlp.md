# phyloforfun/lm3_ruler_classifier__dinov3_vits16_tile_four_896_mlp

## Resumen

`lm3_ruler_classifier__dinov3_vits16_tile_four_896_mlp` es un clasificador de imágenes especializado desarrollado por el usuario phyloforfun para el proyecto LeafMachine3 (LM3), una herramienta de digitalización de especímenes de herbario. El modelo resuelve una tarea muy concreta: identificar el tipo de regla de escala presente en un recorte de imagen de una hoja de herbario, entre 19 clases distintas (reglas métricas en centímetros y milímetros, reglas en pulgadas, cuadrículas y recortes no clasificables). Sustituye al ensamble de tres modelos anterior (`yolo26x_cls_224`, `yolo26n_cls_224`, `dinov2_frozen_mlp`) y elimina la votación entre ellos.

Técnicamente es un híbrido de dos piezas: un backbone ViT-S/16 de DINOv3 (Meta) congelado de 21 millones de parámetros, del que se extraen descriptores de 768 dimensiones, y una cabeza MLP entrenada específicamente para esta tarea (768 → 512 → 19). La entrada no es el recorte en bruto, sino un collage cuadrado de 896 × 896 píxeles construido a partir de cuatro vistas de la misma tira de regla (`tile_four`, `sz=448`). El repositorio ocupa 0,2 GB y se distribuye en formato PyTorch y ONNX.

Su relevancia es de nicho pero crítica dentro del pipeline LM3: la clasificación correcta del tipo de regla es un paso previo necesario para calibrar la escala física de las imágenes de especímenes digitalizados, lo que a su vez permite medir con precisión rasgos morfológicos de las plantas. La iteración 3 incorpora una clase nueva (`METRIC_CM5`), un suplemento de 8.308 recortes de clases raras y 104 correcciones de etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S/16 congelado + cabeza MLP (768 → 512, GELU, dropout 0.2 → 19) |
| Parámetros totales | no disponible (backbone ViT-S/16, aproximadamente 21 M; total con cabeza no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen; entrada 896 × 896 px) |
| Tipos de cuantización | no disponible (se distribuyen pesos fp32 y ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | DINOv3 License (`dinov3-license`, ver `LICENSE.md`) |
| Formato de pesos | PyTorch (`ckpt_best.pt`, fp32) y ONNX (`model.onnx`, opset 17, batch dinámico) |

## Arquitectura y entrenamiento

El modelo combina un backbone `facebook/dinov3-vits16-pretrain-lvd1689m` completamente congelado con una cabeza MLP entrenada desde cero. Sobre la última capa del backbone se concatenan el token CLS y la media de los tokens de parche, dando un descriptor de 768 dimensiones que se estandariza y pasa por una MLP de dos capas (768 → 512 con GELU y dropout 0.2 → 19 logits). Solo se entrena la cabeza; el backbone no se ajusta. La entrada es un collage cuadrado de 896 × 896 píxeles generado a partir del recorte de regla, previamente rotado a horizontal, convertido a escala de grises y teselado en cuatro vistas (`tile_four`, `sz=448`), con normalización ImageNet. Alimentar el modelo con un recorte en bruto no está soportado.

El conjunto de entrenamiento (`ruler-classifier-iteration3-cleaned-labels-dataset`, firma `babdeb23350a9345`) contiene 22.015 recortes en escala de grises repartidos en 19 clases: 13.707 recortes de todas las detecciones de regla en 67 proyectos `LM3_Archival` y 8.308 recortes de un suplemento de clases raras de 23 herbarios infrarrepresentados. El reparto es 70/15/15 agrupado por hoja de herbario (12.591 hojas, todos los recortes de una hoja comparten partición), estratificado por clase y con semilla 0: 15.399 de entrenamiento, 3.310 de validación y 3.306 de test. La iteración 3 añadió la clase `METRIC_CM5`, revisó todas las etiquetas con predicciones out-of-fold y corrigió 104 etiquetas respecto a la iteración 2 (21 en validación, 64 en entrenamiento, 19 en test), principalmente `METRIC_CM2 → METRIC_MM` (26 casos). La cabeza se entrenó sobre descriptores cacheados del conjunto de entrenamiento con inferencia en bf16.

## Capacidades

- Clasificación de imágenes en 19 clases de tipo de regla de escala: `FP`, `GRID_CM`, `METRIC_CM`, `METRIC_CM2`, `METRIC_CM4`, `METRIC_CM5`, `METRIC_CM_BLOCK`, `METRIC_CM_STAGGER`, `METRIC_MM`, `METRIC_MM2`, `METRIC_MM_CM`, `METRIC_MM_CM_BLOCK`, `METRIC_MM_IN16`, `STD_IN16`, `STD_IN16_IN8_IN2`, `STD_IN32_IN16`, `STD_IN8`, `STD_IN8_CM` y `messy`.
- Salida de logits crudos sobre las 19 clases (aplicar softmax para obtener probabilidades); el orden de clases está en `label_map.json`.
- Procesamiento de lotes dinámicos (el grafo ONNX declara batch dinámico).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.
- Capacidad especial: integración como etapa `ruler_classifier` dentro del pipeline LeafMachine3, con formatos PyTorch (reentrenamiento) y ONNX (runtime de LM3 vía onnxruntime).

## Casos de uso

- Digitalización de herbarios a escala: el modelo clasifica el tipo de regla de cada espécimen escaneado, paso necesario para calibrar la escala física de la imagen y poder medir rasgos morfológicos de la planta en milímetros o centímetros reales.
- Sustitución del ensamble de votación en LeafMachine3: al ser el único modelo `ruler_classifier` designado, simplifica el pipeline (un modelo en lugar de tres) y elimina la lógica de votación, reduciendo coste de inferencia y complejidad operativa.
- Filtrado de detecciones espurias: la clase `FP` (falso positivo) permite descartar recortes que el detector `archival_detector` marcó como regla pero que no lo son, mejorando la calidad aguas abajo.
- Control de calidad de colecciones: la clase `messy` identifica reglas ilegibles o degradadas, lo que permite marcar especímenes que requieren revisión manual o un nuevo escaneo.
- Procesamiento por lotes de colecciones institucionales: con el grafo ONNX de batch dinámico, se pueden clasificar miles de recortes por ejecución en CPU o GPU, integrándose en pipelines de digitalización masiva de herbarios.
- Reentrenamiento y adaptación a nuevos herbarios: el checkpoint PyTorch (`ckpt_best.pt`) permite reentrenar solo la cabeza MLP sobre descriptores cacheados del backbone congelado, un coste computacional bajo para añadir clases o corregir etiquetas en colecciones nuevas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con un backbone ViT-S/16 (aproximadamente 21 M de parámetros) y entrada de 896 × 896 px, la inferencia es ligera; el repositorio completo ocupa 0,2 GB, lo que sugiere un modelo de pocos cientos de MB en fp32.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente; no se confirma.
- ¿Cabe en GPU consumer? No confirmado en la documentación, pero el tamaño del backbone y del repositorio lo hacen altamente probable.
- Opciones de despliegue: onnxruntime (runtime oficial de LM3, grafo ONNX con backbone y cabeza en un solo grafo, opset 17, batch dinámico) y PyTorch (checkpoint `ckpt_best.pt` para reentrenamiento). No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Licencia | Estado |
|---|---|---|---|---|---|
| `lm3_ruler_classifier__dinov3_vits16_tile_four_896_mlp` (este) | DINOv3 ViT-S/16 congelado + MLP | 896 × 896 (collage `tile_four`) | 19 | DINOv3 License | Iteración 3, designado modelo único |
| Ensamble LM3 anterior (`yolo26x_cls_224`, `yolo26n_cls_224`, `dinov2_frozen_mlp`) | YOLO + DINOv2 con votación | 224 px | 18 | no disponible | Reemplazado por este modelo |
| `facebook/dinov3-vits16-pretrain-lvd1689m` | ViT-S/16 (backbone base) | variable | no aplica (representación general) | DINOv3 License | Modelo base congelado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no está todavía integrado en LeafMachine3 (`version: null`): la etapa `ruler_classifier` actual espera las entradas de 224 px y las 18 clases del ensamble anterior, por lo que este modelo no es cargable por el pipeline hasta que la etapa se actualice.
- Solo acepta entradas preprocesadas: un collage cuadrado de 896 × 896 px generado con `tile_four` (`sz=448`). Alimentarlo con un recorte de regla en bruto no está soportado.
- El backbone está congelado: el modelo no puede adaptarse a dominios visuales distintos sin reentrenar la cabeza sobre nuevos descriptores.
- Desbalance de clases severo: algunas clases tienen muy pocas muestras (por ejemplo, `METRIC_CM4` con 59 en entrenamiento, `METRIC_CM2` con 83, `METRIC_MM2` con 146), lo que puede degradar el rendimiento en esas categorías.
- Riesgo de confusión entre clases próximas: las correcciones de la iteración 3 se concentran en confusiones `METRIC_CM2 → METRIC_MM`, `METRIC_CM → METRIC_MM` y `messy`/`FP`, lo que indica solapamiento visual entre categorías.
- Sesgos conocidos: no documentados en la información disponible; el conjunto de entrenamiento proviene de 67 proyectos `LM3_Archival` y 23 herbarios, lo que puede limitar la generalización a colecciones con estilos de regla no representados.
- Restricciones de licencia: los pesos del backbone están sujetos a la DINOv3 License (`LICENSE.md`); es necesario revisar sus términos antes de un uso comercial.
- Los datos de entrenamiento (imágenes y etiquetas) no se distribuyen, lo que dificulta la reproducibilidad completa del entrenamiento.
- No apto para tareas de texto, razonamiento, código ni visión general: es un clasificador de nicho de 19 clases.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/phyloforfun/lm3_ruler_classifier__dinov3_vits16_tile_four_896_mlp)
- [Modelo base: facebook/dinov3-vits16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m)
- Paper de referencia (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
- Licencia DINOv3: `LICENSE.md` en el repositorio del modelo
- Archivos del repositorio: `pytorch/ckpt_best.pt`, `onnx/model.onnx`, `onnx/label_map.json`, `manifest.json` (hashes SHA-256), `docs/` (ejemplos de preprocesamiento)
