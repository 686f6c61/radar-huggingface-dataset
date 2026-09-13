# cmes-deepvision/ACR-instance-segmentation-RF-Refinement-v1.0.1

## Resumen

ACR-instance-segmentation-RF-Refinement-v1.0.1 es un modelo de segmentación de instancias publicado por el usuario de Hugging Face `cmes-deepvision`, construido sobre la variante Seg2XLarge de la familia RF-DETR (librería `rfdetr` 1.9.0) y orientado a una tarea denominada ACR Refinement. No se trata de un entrenamiento desde cero: el autor parte de los pesos de la versión v1.0.0 del mismo repositorio y aplica 30 épocas adicionales de ajuste fino con precisión BF16 sobre 8 GPU, seleccionando como pesos finales el checkpoint de la época 28 con media móvil exponencial (EMA con decaimiento 0.993).

El modelo trabaja exclusivamente con imágenes RGB a 960 x 960 píxeles, maneja 3 clases (`possible`, `impossible`, `under_possible`) y devuelve hasta 300 detecciones por imagen con sus máscaras correspondientes. El autor recomienda un umbral de confianza de 0.40, rebajado desde el 0.50 de la versión anterior, y advierte de forma explícita de que ese valor no se lee automáticamente desde `config.yaml`, sino que debe pasarse en la llamada de inferencia o en la configuración de despliegue.

Su relevancia es acotada y muy específica: es un artefacto de producción interno (0 descargas y 0 likes en el momento de la consulta) cuyo valor principal es la documentación de un proceso de refinamiento iterativo y de una validación cruzada entre el entorno nativo de `rfdetr` y un adaptador de percepción propietario (`crp_perception.core.models.rfdetr_mask.RFDetrSegmentation`). La información pública no detalla la arquitectura interna, el número de parámetros ni el conjunto de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo DETR (familia RF-DETR, variante `RFDETRSeg2XLarge`, librería `rfdetr` 1.9.0); detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no aplica (modelo de vision; entrada RGB fija de 960 x 960 px) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; entrenamiento en BF16 e inferencia de ejemplo en float16) |
| Idiomas soportados | no aplica (modelo de vision; la model card esta redactada en coreano) |
| Licencia | no disponible |
| Formato de pesos | PyTorch pickle (`.pth`), requiere `trust_checkpoint=True`; no se publican safetensors ni GGUF |
| Pipeline | image-segmentation |
| Clases | 3 (`0 possible`, `1 impossible`, `2 under_possible`) |
| Resolucion de entrada | 960 x 960, RGB |
| Umbral de confianza recomendado | 0.40 (documentado; no se lee desde `config.yaml`) |
| Maximo de detecciones | 300 |
| Inicializacion | pesos de `ACR-instance-segmentation-RF-Refinement-v1.0.0` (no es entrenamiento from-scratch) |
| Ajuste fino | 30 epocas, BF16, 8 GPU, EMA decay 0.993 |
| Checkpoint seleccionado | `checkpoint_27.ckpt` (epoca 28, indexada desde 0) + EMA |
| Tamano del repositorio | 0.2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia RF-DETR en su variante de segmentación `RFDETRSeg2XLarge`, cargada mediante `RFDETRSeg2XLarge.from_checkpoint(...)`. La model card no describe el backbone, el número de parámetros ni el mecanismo de predicción de máscaras; únicamente confirma que la entrada es RGB a 960 x 960, que el `patch_size` de inferencia es 12, que se admiten hasta 300 detecciones y que existen 3 clases de salida. Tampoco se documenta la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO (no aplicables en principio a un modelo de visión, pero no confirmado).

Lo que sí está documentado es el procedimiento de ajuste: 30 épocas adicionales sobre los pesos de v1.0.0, en BF16, con 8 GPU y EMA de decaimiento 0.993. La selección del checkpoint no se hizo por máximo global, sino dentro de la meseta de validación de las épocas 21 a 30 (F1 EMA medio 69.07 ± 0.40 frente a 68.99 ± 0.49 en el modelo regular), argumentando que las diferencias de ~1 punto entre épocas quedan dentro de la desviación típica de ese tramo. Se eligió `checkpoint_27` con EMA. El autor publica además los registros de TensorBoard del entrenamiento y un fichero `SHA256SUMS` para verificar la integridad de los artefactos.

El aspecto técnico más destacable no es arquitectónico, sino de verificación de despliegue: el paquete se validó en dos entornos independientes (la ruta nativa de `rfdetr` dentro del contenedor de entrenamiento y el adaptador de percepción en un contenedor Docker aparte) sobre un mismo conjunto de imágenes de casos de error. Los resultados reportados indican diferencias de caja de 2 px o menos, diferencias de score de 0.001 o menos y una mediana de IoU de máscara de 0.996–0.997 entre detecciones emparejadas, con más del 90 % por encima de IoU 0.9.

## Capacidades

- Segmentación de instancias: genera máscara y caja por instancia detectada, con salida limitada a un máximo de 300 detecciones por imagen.
- Detección de objetos con clasificación en 3 clases: `possible`, `impossible` y `under_possible`.
- Funcionamiento a 960 x 960 px, resolución adecuada para objetos de tamaño pequeño o medio en imágenes industriales.
- Inferencia optimizada: el flujo oficial usa `model.inference(compile=False, batch_size=1, dtype=torch.float16)` sobre una GPU CUDA.
- Soporte de TensorBoard para el análisis de las curvas de entrenamiento publicadas (`events.out.tfevents.*`).
- Integración con el ecosistema `rfdetr` 1.9.0 y con adaptadores de percepción propietarios (`RFDetrSegmentation`).
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, capacidades multilingües, visión-lenguaje, audio o modo de razonamiento explícito. Es un modelo puramente visual y discriminativo.

## Casos de uso

- Control de calidad en línea de producción: el modelo segmenta cada instancia de la imagen y la asigna a una de las tres clases con umbral 0.40, de modo que la máscara permite localizar con precisión la región concreta que motiva el rechazo, no solo indicar que la pieza es defectuosa.
- Refinamiento iterativo de anotaciones: dado que v1.0.1 se entrenó como continuación de v1.0.0, encaja en flujos donde se corrigen etiquetas de un modelo previo y se reajusta sobre los mismos pesos, en lugar de reentrenar desde cero.
- Preetiquetado para anotación humana: las máscaras con segm mAP@0.5 de 0.7263 sobre el split de test permiten generar propuestas iniciales que un anotador revisa, reduciendo el coste de etiquetado en dominios con criterios de clase poco frecuentes.
- Despliegue en el adaptador de percepción `crp_perception`: el paquete está validado específicamente contra `crp_perception.core.models.rfdetr_mask.RFDetrSegmentation` en un contenedor Docker separado, por lo que puede integrarse en un pipeline de percepción ya existente sin recalibrar el adaptador.
- Verificación de regresiones entre versiones: al publicarse junto a v1.0.0 con el mismo esquema de clases, sirve para comparar mAP de caja y de máscara entre ambas versiones sobre un conjunto fijo de imágenes de casos de error.
- Detección de casos límite en inspección visual: la clase `under_possible` y la bajada del umbral a 0.40 apuntan a escenarios donde interesa recuperar instancias ambiguas, aceptando un aumento de falsos positivos a cambio de no perder recall.
- Análisis offline de lotes de imágenes: con batch_size=1 en float16 sobre una única GPU, es viable procesar conjuntos de imágenes de 960 x 960 en un servidor modesto para auditorías retrospectivas.

En todos los casos, la semántica real de `possible`, `impossible` y `under_possible` depende de la definición interna del proyecto ACR, que no se publica en la información disponible.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el split de test `acr_rf109_refinement_v100_finetuning` (525 imágenes), con umbral de score 0.40 e IoU 0.50. La clase `under_possible` se excluyó del cálculo por no tener ground truth en ese split.

| Metrica | Valor |
|---|---|
| Precision | 0.7202 |
| Recall | 0.6425 |
| F1 | 0.6792 |
| bbox mAP@0.5 | 0.7294 |
| segm mAP@0.5 | 0.7263 |
| Split | `acr_rf109_refinement_v100_finetuning` (525 imagenes) |
| Umbral de score | 0.40 |
| IoU | 0.50 |

No se han publicado resultados comparativos frente a otros modelos, ni métricas en MMLU, HumanEval o GSM8K (no aplicables a un modelo de segmentación). El propio autor advierte de que este track usa `allow_test_overlap: true`, es decir, validación y test comparten la misma tarea, por lo que las cifras anteriores son válidas como criterio de selección de checkpoint pero no como afirmación de generalización independiente.

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. El flujo oficial ejecuta inferencia a `batch_size=1` en `float16` sobre una GPU CUDA, pero no especifica modelo de GPU ni consumo de memoria. Estimación orientativa no confirmada: entre 8 y 16 GB para una única GPU a 960 x 960 en float16, dado el tamaño del repositorio (0.2 GB) y el número de consultas (300).
- GPU recomendadas: no disponibles. El autor solo documenta el entrenamiento con 8 GPU en BF16 y la inferencia en una GPU CUDA genérica (`device="cuda:0"`).
- GPU de consumo: probablemente viable en tarjetas con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) si se confirma la estimación anterior, pero el autor no lo garantiza ni lo documenta.
- Opciones de despliegue: librería `rfdetr` 1.9.0 sobre PyTorch con `torchvision`, `pillow`, `numpy`, `pyyaml` y `huggingface_hub`; adaptador propietario `crp_perception.core.models.rfdetr_mask.RFDetrSegmentation` en Docker. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni imágenes por segundo. La única indicación es que la configuración de referencia usa `compile=False` y `batch_size=1`.
- Almacenamiento: 0.2 GB de repositorio, incluyendo pesos, configuración, logs de TensorBoard y ficheros de evaluación.

## Comparativa con modelos similares

No se dispone de datos publicados de los modelos alternativos en la información proporcionada, por lo que los valores numéricos se marcan como no disponibles.

| Modelo | Parametros | Contexto / entrada | segm mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACR-instance-segmentation-RF-Refinement-v1.0.1 | no disponible | 960 x 960, 3 clases | 0.7263 (split propio, con solapamiento val/test) | no disponible | Hugging Face, libreria `rfdetr` |
| ACR-instance-segmentation-RF-Refinement-v1.0.0 | no disponible | 960 x 960, 3 clases | no disponible | no disponible | Hugging Face, pesos predecesores |
| Otras variantes de RF-DETR Seg (Nano, Small, Medium, Large) | no disponible | no disponible | no disponible | no disponible | repositorio `rfdetr` |
| Detectores-segmentadores genericos tipo YOLO-seg o Mask R-CNN | no disponible | no disponible | no disponible | no disponible | ampliamente disponibles |

La comparación sustantiva solo puede hacerse contra v1.0.0 del mismo autor, que actúa como punto de partida del ajuste fino. Cualquier comparación frente a modelos de propósito general requeriría reentrenar sobre el mismo dataset de 3 clases, que no es público.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorización explícita de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Formato de pesos inseguro por diseño: los `.pth` son pickle de PyTorch y requieren `trust_checkpoint=True`. Solo deben cargarse desde el repositorio oficial y verificando los `SHA256SUMS`.
- Solapamiento entre validación y test: el track usa `allow_test_overlap: true`, de modo que las métricas publicadas no constituyen evidencia de generalización a datos independientes.
- Dominio y clases opacos: no se documenta qué significan `possible`, `impossible` y `under_possible`, ni la procedencia de los datos. El modelo no es reutilizable fuera de ese esquema de 3 clases sin reentrenamiento.
- Sesgos: no evaluados ni documentados. No hay análisis de sesgo por iluminación, oclusión, resolución, tipo de cámara o distribución geográfica de los datos.
- Riesgo de alucinación de instancias: como todo detector, puede producir detecciones espurias con score cercano al umbral. El autor documenta que en la frontera 0.4–0.5 hay detecciones de baja confianza cuya inclusión o exclusión varía entre builds de torch/CUDA por no determinismo en coma flotante. Ese comportamiento no debe interpretarse como un defecto del modelo, pero sí exige fijar versiones exactas en producción.
- El umbral de confianza no se propaga automáticamente: `config.yaml` no alimenta ni a `model.predict(..., threshold=...)` ni a `RFDetrSegmentation.initialize()`. Si se despliega con 0.40, hay que configurarlo explícitamente en el sistema de percepción o el modelo usará el valor por defecto de la llamada.
- Límite de 300 detecciones por imagen: escenas densas pueden quedar truncadas sin aviso explícito en la salida.
- Idiomas: no aplica, es un modelo de visión. La documentación está en coreano, lo que puede dificultar su mantenimiento si el equipo no domina ese idioma.
- Adopción nula: 0 descargas y 0 likes, sin validación externa independiente.
- Fechas de creación y actualización (2026-09-13) posteriores a la fecha habitual de consulta, dato tal cual aparece en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cmes-deepvision/ACR-instance-segmentation-RF-Refinement-v1.0.1
- Version predecesora v1.0.0: https://huggingface.co/cmes-deepvision/ACR-instance-segmentation-RF-Refinement-v1.0.0
- Repositorio del autor en Hugging Face: https://huggingface.co/cmes-deepvision
- La busqueda web realizada no devolvio ningun enlace relevante al modelo (los resultados obtenidos corresponden a aplicaciones moviles de edicion de video y no guardan relacion con RF-DETR, la segmentacion de instancias ni el proyecto ACR). No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados en la informacion proporcionada.
