# ackermand/mito_aff_setup53_16nm-ft7_demo

## Resumen

`mito_aff_setup53_16nm-ft7_demo` es un modelo de segmentación de mitocondrias para microscopía electrónica, publicado por el usuario `ackermand` en Hugging Face. No es un modelo de lenguaje: es una red neuronal convolucional 3D que predice afinidades mitocondriales (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`) a partir de volúmenes de imagen de microscopía electrónica con vóxeles de 16 nm. Su función es servir de base para el pipeline de segmentación de instancias de CellMap, donde las afinidades predichas se transforman posteriormente en máscaras mediante post-procesado.

El modelo se ha generado mediante ajuste fino (fine-tuning) en el navegador con la herramienta `cellmap-flow` 0.3.0, partiendo de la arquitectura `Unet3dIso` del modelo base `cellmap/onnx-web-models/setup_53`. El ajuste se realizó sobre anotaciones pintadas en el navegador durante 5 épocas, alcanzando una pérdida final de 0.415. Se distribuye únicamente en formato ONNX y está pensado para ejecutarse dentro del ecosistema cellmap-flow, no como modelo autónomo de propósito general.

Su relevancia es acotada y experimental: se trata de una demostración (`demo`) de flujo de trabajo de anotación y fine-tuning en navegador para segmentación celular en neuroanatomía conectómica. No dispone de model card convencional con datos de entrenamiento, benchmarks ni licencia declarada, y el repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que el contenido es mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unet3dIso (U-Net 3D isótropa), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp16 según la model card) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`mito_aff_setup53_16nm-ft7.onnx`) más `manifest.json` |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Modalidad | Microscopía electrónica volumétrica (EM) |
| Resolución de vóxel | 16 nm isotrópica (entrada y salida) |
| Tamaño de bloque de entrada | 172×172×172 vóxeles |
| Tamaño de bloque de salida | 84×84×84 vóxeles |
| Canales de salida | 3 (`mito_aff_z`, `mito_aff_y`, `mito_aff_x`), logits crudos |
| Precisión de inferencia | fp16 |
| Modelo base | `cellmap/onnx-web-models/setup_53` |
| Herramienta de fine-tuning | cellmap-flow 0.3.0 (en navegador) |
| Épocas de ajuste | 5 |
| Pérdida final | 0.415 |
| Fecha de creación | 2026-11-13 |

## Arquitectura y entrenamiento

La arquitectura es una `Unet3dIso`, una U-Net tridimensional con kernels isótropos, heredada del modelo base `cellmap/onnx-web-models/setup_53`. La red procesa bloques de 172³ vóxeles y produce bloques de 84³ vóxeles con tres canales de afinidad, lo que implica un recorte de bordes (valid padding o similar) para evitar artefactos en las fronteras del bloque. Las salidas son logits crudos a los que debe aplicarse una sigmoide y un umbral en 0 para obtener afinidades binarias o probabilísticas.

El entrenamiento consistió en un fine-tuning de 5 épocas sobre anotaciones pintadas manualmente en el navegador mediante cellmap-flow 0.3.0, partiendo de los pesos del modelo base. No se especifican en la información disponible el número de tokens (vóxeles) de entrenamiento, la composición del dataset, la función de pérdida exacta ni si se aplicaron técnicas de aumento de datos. La pérdida final reportada es de 0.415, pero sin referencia de comparación ni desglose por canal. No hay evidencia de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación de imágenes.

## Capacidades

- Predicción de afinidades mitocondriales en volúmenes de microscopía electrónica a 16 nm de resolución.
- Generación de tres mapas de afinidad direccional (`z`, `y`, `x`) que permiten separar instancias mitocondriales tras post-procesado (por ejemplo, watershed o aglomeración).
- Procesamiento por bloques de 172³ vóxeles de entrada con salida de 84³, adecuado para volúmenes grandes mediante teselado.
- Inferencia en fp16 sobre ONNX Runtime, lo que facilita despliegue en CPU y GPU sin dependencias de frameworks de deep learning pesados.
- Integración nativa con cellmap-flow, incluyendo ejecución en navegador mediante ONNX Web.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión natural, audio ni otras capacidades generativas.

## Casos de uso

- Segmentación de mitocondrias en tomografías de microscopía electrónica: el modelo predice afinidades que, tras umbralizado y aglomeración, permiten obtener máscaras de instancias mitocondriales en tejido nervioso a resolución de 16 nm.
- Anotación asistida en flujos conectómicos: investigadores pueden usar las predicciones como pre-anotación para acelerar el etiquetado manual en cellmap-flow, corrigiendo solo los errores en lugar de pintar desde cero.
- Fine-tuning iterativo en navegador: el modelo sirve como demostración de cómo un usuario sin infraestructura GPU dedicada puede ajustar un modelo base sobre sus propias anotaciones usando cellmap-flow 0.3.0.
- Control de calidad en pipelines de segmentación: al comparar las afinidades predichas con anotaciones ground truth se pueden detectar regiones problemáticas del volumen o del modelo base.
- Docencia y formación en segmentación celular: el modelo permite ilustrar el ciclo completo de anotación, entrenamiento y evaluación en un entorno web, con un modelo pequeño y de bajo coste computacional.
- Prototipado de pipelines de imagen biomédica: al estar en ONNX, puede insertarse en flujos de preprocesado existentes (por ejemplo, con ONNX Runtime en Python) para validar la viabilidad de la segmentación automática antes de invertir en modelos mayores.
- Integración en visores web de volúmenes: la ejecución en navegador vía ONNX Web permite desplegar segmentación interactiva sin backend GPU, útil para colaboración distribuida entre laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0.415), que no constituye un benchmark de calidad de segmentación ni es comparable con métricas estándar como IoU, Dice o F1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero al tratarse de una U-Net 3D con bloques de 172³ vóxeles en fp16, la huella es moderada; una estimación conservadora sitúa la inferencia en el rango de 2-8 GB de VRAM, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del bloque y la naturaleza 3D, se beneficiaría de GPUs con al menos 8-16 GB de VRAM (RTX 3080/4080, RTX 4090, A100), pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente sí en GPUs consumer modernas con suficiente VRAM, dado el formato fp16 y el tamaño de bloque moderado, aunque no confirmado.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), ONNX Web (navegador), cellmap-flow (dashboard y servidor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mito_aff_setup53_16nm-ft7_demo` | Unet3dIso (ONNX) | 16 nm | Afinidades mito (3 canales) | ONNX | no disponible | Hugging Face |
| `cellmap/onnx-web-models/setup_53` | Unet3dIso (ONNX) | 16 nm | Afinidades (modelo base) | ONNX | no disponible | Hugging Face |
| Otros modelos CellMap de mitocondrias | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de información sobre alternativas equivalentes en la información proporcionada. No se dispone de parámetros, contexto ni rendimiento de los modelos comparados.

## Limitaciones y advertencias

- Modelo de demostración (`demo`): no está pensado para uso en producción sin validación adicional; el fine-tuning de solo 5 épocas sobre anotaciones en navegador sugiere un ajuste limitado.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Sin model card convencional: no hay información sobre sesgos, composición del dataset, procedencia de las imágenes ni protocolo de evaluación.
- Riesgo de sobreajuste a las anotaciones específicas del usuario que realizó el fine-tuning; la generalización a otros tejidos, microscopios o protocolos de preparación no está validada.
- Dependencia del ecosistema cellmap-flow: el `manifest.json` y la estructura del repositorio están pensados para esa herramienta, lo que puede dificultar su uso fuera de ella.
- Repositorio de 0.0 GB: posible ausencia o peso mínimo de los artefactos, lo que podría impedir la descarga efectiva de los pesos; conviene verificar antes de integrarlo.
- Resolución fija de 16 nm y bloques de 172³/84³: no admite otras resoluciones o tamaños de bloque sin reentrenamiento o adaptación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de segmentación (IoU, Dice) frente a alternativas.
- Riesgo de alucinación en sentido figurado: la red puede producir afinidades espurias en regiones sin mitocondrias o artefactos de imagen, sin mecanismo de abstención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ackermand/mito_aff_setup53_16nm-ft7_demo
- Demo en navegador (cellmap-flow): https://janelia-cellmap.github.io/cellmap-flow/app/?model=ackermand/mito_aff_setup53_16nm-ft7_demo/mito_aff_setup53_16nm-ft7
- Repositorio cellmap-flow: https://github.com/janelia-cellmap/cellmap-flow
- Modelo base: https://huggingface.co/cellmap/onnx-web-models (referencia `setup_53`)
