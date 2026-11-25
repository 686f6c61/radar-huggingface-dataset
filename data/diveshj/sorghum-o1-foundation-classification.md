# Diveshj/sorghum-o1-foundation-classification

## Resumen

`sorghum-o1-foundation-classification` es un repositorio de modelos de clasificación de imágenes desarrollado por el autor Diveshj (usuario de Hugging Face) en el marco del artículo científico *Teacher Selection and Class-Imbalance-Aware Knowledge Distillation for Sorghum Kernel Defect Classification*. No se trata de un modelo de lenguaje fundacional, sino de una colección de clasificadores de visión por computador entrenados para detectar defectos en granos de sorgo (sorghum) a partir de imágenes de 224x224 píxeles. El repositorio agrupa checkpoints en PyTorch y ONNX, junto con tablas de resultados e historiales de entrenamiento.

El modelo destacado es un estudiante destilado de apenas 4 M de parámetros aproximadamente (una séptima parte de su profesor de 27,87 M), que alcanza un macro-F1 del 97,87% en el conjunto de test GrainSet, empatando estadísticamente con su profesor (p = 0,52). La técnica central es la destilación de conocimiento con selección de profesor y manejo del desequilibrio de clases, aplicada a una tarea de clasificación de 8 clases de defectos de grano.

Es relevante ahora porque demuestra que un modelo de visión muy compacto puede igualar a arquitecturas considerablemente mayores en una tarea de inspección de calidad agroalimentaria, con exportación a ONNX para despliegue en entornos de producción de bajo coste. No obstante, conviene subrayar que el repositorio no es un modelo de IA generativa ni un LLM: es un conjunto de clasificadores de imágenes de dominio muy específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes convolucionales (CNN) y Vision Transformers (ViT) para clasificación de imágenes; el mejor estudiante destilado es una CNN compacta (arquitectura exacta no disponible en la información proporcionada) |
| Parámetros totales | Estudiante destacado: ~4 M (una séptima parte del profesor de 27,87 M); el resto de checkpoints varían y no se detallan individualmente |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 224x224 RGB) |
| Tipos de cuantización | No disponible (se distribuyen pesos en PyTorch .pt y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | CC0 1.0 (modelos y tablas); los datos GrainSet son CC BY 4.0 de su publicación original |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx); los checkpoints de convergencia solo en PyTorch |

## Arquitectura y entrenamiento

El repositorio contiene cuatro grupos de checkpoints: `cnn_baselines`, `kd_students` (estudiantes destilados), `vit_models` (todos entrenados con un presupuesto fijo de cinco épocas) y `convergence_checkpoints` (las mismas recetas reentrenadas con early stopping para verificar que cinco épocas no habían convergido ya). En total se documentan 82 checkpoints de cinco épocas, de los cuales 57 registran el macro-F1 de validación dentro del fichero. Las arquitecturas incluyen SE-ResNet-50, EfficientNet-B0 y modelos ViT, entre otras.

El entrenamiento se basa en destilación de conocimiento con selección de profesor y conciencia del desequilibrio de clases. Los datos provienen del conjunto GrainSet (Fan et al., Scientific Data 2023, CC BY 4.0), que no se redistribuye. El preprocesado es específico: redimensionado a 224x224 RGB y normalización con media [0,308562, 0,251994, 0,187898] y desviación [0,240441, 0,197289, 0,149387], estadísticas calculadas sobre GrainSet y no sobre ImageNet. El orden de clases (índice 0 a 7) es NOR, F&S, SD, MY, AP, BN, HD, IM (normal, fusarium y arrugado, germinado, mohoso, atacado por plagas, roto, dañado por calor, impurezas). No se especifica el número de tokens ni de imágenes de entrenamiento en la información disponible.

## Capacidades

- Clasificación de imágenes de granos de sorgo en 8 clases de defecto (NOR, F&S, SD, MY, AP, BN, HD, IM).
- Inspección de calidad agroalimentaria automatizada a partir de imágenes RGB de 224x224.
- Inferencia independiente del framework mediante exportación ONNX.
- Destilación de conocimiento: los estudiantes compactos replican el rendimiento de profesores mayores.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo de pensamiento (thinking), visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Inspección de calidad en líneas de procesado de sorgo: el clasificador recibe imágenes de granos y devuelve una de las 8 clases de defecto, permitiendo el rechazo automatizado de lotes con alta proporción de granos mohosos o dañados por calor.
- Control de recepción en silos y cooperativas: integración del modelo ONNX en una aplicación de escritorio o servicio ligero que clasifica muestras fotografiadas con cámara industrial, sin necesidad de GPU dedicada.
- Despliegue en dispositivos de borde (edge): al ser un modelo de ~4 M de parámetros exportado a ONNX, puede ejecutarse en CPU en entornos con recursos limitados, como Raspberry Pi o mini-PC en planta.
- Investigación en destilación de conocimiento: el repositorio sirve como referencia reproducible para estudiar selección de profesor y desequilibrio de clases en tareas de clasificación fina.
- Auditoría y trazabilidad de resultados: las tablas CSV de historiales, tests de significación (McNemar) y resúmenes permiten reproducir los experimentos del artículo y comparar arquitecturas.
- Prototipado rápido de clasificadores de grano: el script `infer_example.py` y las imágenes de muestra permiten validar el pipeline de preprocesado y la inferencia ONNX en minutos.
- Formación y docencia: ejemplo práctico de pipeline completo (entrenamiento, destilación, exportación ONNX y evaluación estadística) para cursos de visión por computador aplicada.

## Benchmarks y rendimiento

| Modelo / configuración | Macro-F1 (test GrainSet) | Notas |
|---|---|---|
| Mejor estudiante destilado (pequeño) | 97,87% | ~4 M de parámetros; empate estadístico con el profesor (p = 0,52) |
| Profesor | No disponible (valor exacto) | 27,87 M de parámetros |
| SE-ResNet-50 (5 épocas) | 80,49% | Presupuesto fijo de 5 épocas |
| SE-ResNet-50 (convergencia) | 94,23% | Early stopping |
| EfficientNet-B0 (5 épocas) | 88,14% | Presupuesto fijo de 5 épocas |
| EfficientNet-B0 (convergencia) | 98,55% | Early stopping |

En 9 de 10 comparaciones, el entrenamiento con convergencia fue significativamente mejor que el presupuesto de cinco épocas (test de McNemar, p entre 0,05 y 1e-24). No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo de ~4 M de parámetros en ONNX ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente. Para entrenamiento se usaron notebooks en Kaggle (GPU no especificada).
- Cabe en GPU consumer: sí, con amplio margen, y también en CPU y dispositivos de borde.
- Opciones de despliegue: ONNX Runtime (recomendado, dado el formato), PyTorch nativo, y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp o TGI (no aplican a clasificación de imágenes).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de ~4 M de parámetros, la latencia por imagen en CPU debería ser de milisegundos, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mejor estudiante destilado (este repo) | ~4 M | Clasificación de defectos de sorgo (8 clases) | 97,87% | CC0 1.0 | Hugging Face (ONNX + PyTorch) |
| Profesor (este repo) | 27,87 M | Misma tarea | No disponible (valor exacto) | CC0 1.0 | Hugging Face |
| SE-ResNet-50 (convergencia, este repo) | No disponible | Misma tarea | 94,23% | CC0 1.0 | Hugging Face |
| EfficientNet-B0 (convergencia, este repo) | No disponible | Misma tarea | 98,55% | CC0 1.0 | Hugging Face |

No se dispone de información sobre modelos comparables externos de clasificación de defectos de sorgo en la documentación proporcionada; la comparativa se limita a los checkpoints del propio repositorio.

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica granos de sorgo en las 8 clases definidas; no es un modelo generalista.
- Dependencia del preprocesado exacto: usa estadísticas de normalización específicas de GrainSet; aplicar normalización ImageNet degradaría el rendimiento.
- Los datos de entrenamiento (GrainSet) no se redistribuyen; para reentrenar hay que obtenerlos de los autores originales (CC BY 4.0).
- No se publican los notebooks de entrenamiento (ejecutados en Kaggle y no todos archivados), lo que limita la reproducibilidad completa.
- El macro-F1 de validación solo está registrado en 57 de los 82 checkpoints de cinco épocas; la ausencia de valor no implica que el modelo no se evaluara.
- Riesgo de sobreajuste al dominio: imágenes con iluminación, fondo o cámara distintos a los de GrainSet pueden degradar la precisión.
- No hay datos sobre sesgos demográficos ni de otro tipo (no aplica a personas, pero sí a condiciones de captura de imagen).
- Licencia CC0 1.0 para modelos y tablas, lo que permite uso comercial sin restricciones; los datos GrainSet quedan sujetos a CC BY 4.0.
- No se documentan cuantizaciones ni requisitos de latencia, lo que exige validación propia antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Diveshj/sorghum-o1-foundation-classification
- Artículo de referencia de los datos: Fan et al., *Scientific Data* 2023 (GrainSet, CC BY 4.0) — referencia citada en la model card; enlace directo no disponible en la información proporcionada.
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
