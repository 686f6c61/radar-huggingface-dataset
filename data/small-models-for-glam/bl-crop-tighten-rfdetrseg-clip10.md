# small-models-for-glam/bl-crop-tighten-rfdetrseg-clip10

## Resumen

`bl-crop-tighten-rfdetrseg-clip10` es un modelo de segmentación de instancias desarrollado por la organización comunitaria Small Models for GLAM, orientada a instituciones de patrimonio cultural (galerías, bibliotecas, archivos y museos). El modelo resuelve un problema concreto: ajustar (tighten) los recortes sueltos de ilustraciones presentes en la colección British Library Book Images. Los recortes de tipo "medium" suelen incluir líneas de texto del cuerpo de la página o pies de ilustración; este modelo identifica la región exacta de la ilustración y devuelve cajas y máscaras de segmentación, incluso para formas no rectangulares como viñetas circulares o medallones.

Se trata de un modelo de visión puro, sin procesamiento de lenguaje, con 35,37 millones de parámetros, basado en la arquitectura RF-DETR-Seg (Roboflow). Está fine-tuneado a partir del modelo `Roboflow/rf-detr-seg-medium` mediante destilación de etiquetas débiles generadas por el modelo `tiiuae/Falcon-Perception-0.6B` sobre un dataset de 7.565 recortes filtrados. No se usaron etiquetas humanas en el entrenamiento. El modelo es altamente específico de dominio: está pensado para la colección de la British Library o recortes visualmente similares de libros con una sola figura, y no se recomienda para páginas con múltiples ilustraciones densas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR-Seg (transformer encoder-decoder con segmentación de instancias) |
| Parametros totales | 35.370.439 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura RF-DETR-Seg, un detector de objetos basado en transformer (DETR) con una cabeza de segmentación de instancias que produce máscaras a nivel de píxel. Parte del checkpoint `Roboflow/rf-detr-seg-medium` y se fine-tunea sobre un dataset propio. El entrenamiento sigue un esquema de destilación: el modelo profesor `tiiuae/Falcon-Perception-0.6B` (un modelo de segmentación open-vocabulary) genera etiquetas débiles sobre 8.400 recortes estratificados de la colección British Library Book Images (incluyendo adornos, láminas, recortes medium y cubiertas planas como negativos). Tras un filtrado, se conservan 7.565 muestras que se usan para entrenar al estudiante. Las particiones de entrenamiento y prueba se realizan a nivel de libro (ningún libro aparece en ambos conjuntos). No se emplearon anotaciones humanas. El proceso completo de inferencia sobre el corpus de 1.019.266 recortes costó 3,24 dólares.

## Capacidades

- Segmentación de instancias: detecta y segmenta ilustraciones dentro de recortes de imágenes de libros, devolviendo cajas delimitadoras y máscaras píxel a píxel.
- Manejo de formas irregulares: las máscaras permiten recortar ilustraciones no rectangulares (viñetas circulares, medallones, ornamentos) sin incluir fondo de página.
- Ajuste fino de recortes: dado un recorte que ya contiene arte, el modelo identifica la región exacta de la ilustración, eliminando texto adyacente o pies de página.
- Inferencia rápida: alcanza aproximadamente 70 imágenes por segundo en una GPU NVIDIA L4, unas 12 veces más rápido que su modelo profesor.
- Integración con el ecosistema Hugging Face: compatible con `transformers` y `AutoImageProcessor`, permite post-procesado estándar de segmentación.
- Resultados precalculados: el autor publicó las máscaras de todo el corpus en la configuración `crop_masks` del dataset fuente, por lo que no es necesario ejecutar inferencia para usos típicos.

## Casos de uso

- Digitalización de colecciones bibliotecarias: aplicar el modelo a recortes de ilustraciones de libros escaneados para obtener máscaras limpias que permitan separar la imagen del texto circundante, facilitando su catalogación y almacenamiento.
- Generación de metadatos para patrimonio cultural: las cajas y máscaras resultantes pueden usarse para enriquecer registros bibliográficos con información sobre la ubicación exacta de las ilustraciones dentro de la página.
- Creación de galerías de imágenes recortadas: en portales web de bibliotecas digitales, el modelo permite presentar solo la ilustración (sin texto) en vistas previas, mejorando la experiencia de navegación.
- Entrenamiento de modelos de clasificación de ilustraciones: usar las máscaras generadas para aislar figuras individuales y alimentar modelos de clasificación o búsqueda por similitud visual.
- Control de calidad en procesos de OCR: al separar las ilustraciones del texto, se evita que los motores de OCR intenten interpretar elementos gráficos, reduciendo errores y mejorando la precisión.
- Análisis de composición visual en humanidades digitales: investigadores pueden estudiar la evolución de estilos de ilustración, tamaños y posiciones en libros históricos usando las máscaras producidas por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como COCO o LVIS) en la información disponible. Sin embargo, el autor proporciona una evaluación específica del dominio:

| Metrica | Valor |
|---|---|
| Aceptabilidad en muestra aleatoria de 40 imágenes (evaluación humana ciega) | 97,4 % |
| Aceptabilidad del modelo profesor (mismas 40 imágenes) | 95,0 % |
| Throughput en GPU NVIDIA L4 | ~70 img/s |
| Coste de inferencia sobre 1.019.266 recortes | 3,24 USD |
| Aceptabilidad en dominio fuera de alcance (láminas de Encyclopaedia Britannica) | 55 % |

La evaluación se realizó sobre una muestra aleatoria de 40 imágenes juzgada a ciegas por humanos. El modelo supera ligeramente a su profesor en aceptabilidad y es significativamente más rápido. El rendimiento cae notablemente en páginas con múltiples figuras densas, un punto ciego heredado del profesor.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 35 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en precisión FP32; con FP16 o cuantización ligera cabría en cualquier GPU moderna.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM es suficiente. El autor valida el rendimiento en una NVIDIA L4 (24 GB), pero no es necesaria para este tamaño.
- Compatibilidad con GPU de consumo: sí, cualquier RTX serie 20 o superior (o equivalentes de AMD) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo de visión con `transformers`, puede servirse mediante Hugging Face Inference Endpoints, TorchServe o un script Python personalizado. No se menciona soporte para vLLM u Ollama (enfocados a LLM).
- Latencia y throughput: en una L4 se alcanzan ~70 img/s; en hardware de gama media (por ejemplo, RTX 3060) se espera un rendimiento algo menor pero aún en decenas de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bl-crop-tighten-rfdetrseg-clip10 (este) | 35,37 M | RF-DETR-Seg | Recortes de libros históricos | Apache-2.0 | Hugging Face |
| Roboflow/rf-detr-seg-medium (base) | ~41 M (aprox.) | RF-DETR-Seg | Segmentación general | Apache-2.0 | Hugging Face |
| tiiuae/Falcon-Perception-0.6B (profesor) | ~600 M | Open-vocabulary segmentation | Segmentación general | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en benchmarks estándar. El modelo destaca por su especialización y eficiencia en el dominio de recortes de libros, pero carece de generalización a escenas complejas o páginas densas.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre recortes de la colección British Library Book Images; no debe usarse como detector general de ilustraciones en páginas completas.
- Falla en páginas con múltiples figuras: en láminas con 10-20 figuras por página (por ejemplo, Encyclopaedia Britannica), la aceptabilidad cae al 55 %. El modelo asume que cada recorte contiene aproximadamente una sola ilustración.
- Dependencia del profesor: las etiquetas débiles provienen de Falcon-Perception-0.6B, por lo que los sesgos y errores de ese modelo pueden haberse propagado al estudiante.
- Sin etiquetas humanas: la evaluación se basa en un juicio humano sobre una muestra pequeña (40 imágenes), pero el entrenamiento no incluyó anotaciones manuales, lo que puede afectar la precisión en casos límite.
- Sin soporte de texto: el modelo no procesa lenguaje, por lo que no puede utilizarse para tareas que requieran entender el contenido textual de las imágenes.
- Cuantizaciones no publicadas: no se ofrecen versiones cuantizadas (GGUF, ONNX, TensorRT), lo que puede limitar su despliegue en entornos con restricciones de memoria o latencia.
- Coste de inferencia bajo, pero solo si se usa en el corpus previsto; fuera de él el rendimiento se degrada y puede requerir reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/small-models-for-glam/bl-crop-tighten-rfdetrseg-clip10
- Dataset de entrenamiento: https://huggingface.co/datasets/small-models-for-glam/bl-crop-tighten-v1
- Dataset fuente (British Library Book Images): https://huggingface.co/datasets/biglam/british-library-book-images
- Modelo base: https://huggingface.co/Roboflow/rf-detr-seg-medium
- Modelo profesor: https://huggingface.co/tiiuae/Falcon-Perception-0.6B
- Organización Small Models for GLAM: https://huggingface.co/spaces/small-models-for-glam/README
