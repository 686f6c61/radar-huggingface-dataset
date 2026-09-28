# motazalqaoud/brain-tumor-segmentation-weights

## Resumen

El modelo `motazalqaoud/brain-tumor-segmentation-weights` es un checkpoint de segmentación de tumores cerebrales en 3D desarrollado por Motaz Alqaoud (PhD), ingeniero de IA aplicada a sanidad. Se trata de una Attention U-Net tridimensional implementada con MONAI (`spatial_dims=3`) que recibe un volumen de resonancia magnética con cuatro modalidades coregistradas (FLAIR, T1, T1 con contraste y T2) y devuelve una segmentación multicanal de tres regiones clínicas anidadas: Tumor Core (TC), Whole Tumor (WT) y Enhancing Tumor (ET).

El modelo resuelve la segmentación de volumen completo, no por cortes 2D, lo que le permite explotar la coherencia espacial entre cortes adyacentes. Emplea un esquema de etiquetas multicanal con sigmoide independiente por región en lugar de un softmax de cuatro clases, precisamente porque TC, WT y ET son regiones anidadas (ET dentro de TC dentro de WT), lo que coincide con la forma en que el leaderboard oficial de BraTS evalúa las propuestas.

Su relevancia actual es doble: por un lado, ofrece un punto de partida reproducible y ligero (90,2 MB) para experimentar con atención en skip connections sobre datos médicos volumétricos; por otro, su model card es explícita sobre el alcance del artefacto, que es de investigación y portafolio, no un dispositivo médico. El checkpoint se distribuye bajo licencia MIT, lo que facilita su uso como base de fine-tuning y como material docente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention U-Net 3D (MONAI `AttentionUnet`, `spatial_dims=3`), con puertas de atención en todas las skip connections |
| Parametros totales | no disponible (el autor no publica el recuento; el checkpoint `best_model.pth` ocupa 90,2 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pth`), archivo `best_model.pth` |
| Canales de entrada | 4 (FLAIR, T1w, T1gd, T2w), disposición MSD `(H, W, D, 4)` |
| Canales de salida | 3 (TC, WT, ET), activación sigmoide independiente por región |
| Modalidad de imagen | resonancia magnética cerebral multimodal |
| Formato de entrada | NIfTI 4D (volumen completo) |
| Dataset de entrenamiento | Medical Segmentation Decathlon, Task01_BrainTumour (750 volúmenes: 484 train / 266 test) |
| Tamano del repositorio | 0,1 GB |
| Libreria | PyTorch + MONAI |

## Arquitectura y entrenamiento

La red es una U-Net 3D con puertas de atención en cada conexión de salto. La entrada son cuatro canales correspondientes a las modalidades FLAIR, T1, T1 con contraste y T2, y la salida son tres canales que representan las regiones TC, WT y ET de forma independiente mediante sigmoide. Al no usar softmax sobre clases mutuamente excluyentes, el modelo respeta la jerarquía anatómica de las etiquetas BraTS y evita penalizar solapamientos que en realidad son correctos.

El entrenamiento se realizó sobre el Task01_BrainTumour del Medical Segmentation Decathlon (750 volúmenes 4D, 484 de entrenamiento y 266 de test), derivado de los retos BraTS 2016/2017. La partición se hizo por sujeto y no por imagen, de modo que ningún paciente aparece simultáneamente en entrenamiento y validación. Se empleó precisión mixta (AMP), función de pérdida Dice aplicada de forma independiente a cada región anidada, annealing coseno del learning rate y selección del checkpoint por mejor Dice medio de validación sobre las tres regiones. La validación se efectuó con inferencia de ventana deslizante sobre el volumen completo cada 5 épocas, es decir, evaluando con la misma configuración de volumen completo que se usa en inferencia y no con métricas a nivel de parche.

## Capacidades

- Segmentación volumétrica completa de tumores cerebrales en tres regiones clínicas estándar (TC, WT y ET) a partir de cuatro modalidades de RM.
- Procesamiento 3D real del volumen, no inferencia corte a corte, lo que aprovecha el contexto espacial entre planos.
- Salida multicanal anidada compatible con la evaluación oficial de BraTS (Dice y HD95 por región).
- Inferencia sobre volúmenes completos mediante ventana deslizante, tal como se documenta en el script `src/evaluate.py` del repositorio fuente.
- Preparada para fine-tuning: el repositorio define la configuración exacta de `AttentionUnet` usada (`src/model.py`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modo de pensamiento; no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de procesamiento de texto, audio o vídeo.
- No hay soporte documentado de cuantización ni de exportación a formatos ligeros en la información disponible.

## Casos de uso

- Benchmarking de arquitecturas de segmentación: sirve como referencia cuantitativa (Dice y HD95 por región) para comparar variantes de Attention U-Net u otras arquitecturas sobre el mismo split del Task01_BrainTumour del MSD.
- Material docente sobre atención en datos médicos volumétricos: el repositorio incluye el código de construcción del modelo, lo que permite estudiar presupuesto de parámetros, coste de las puertas de atención en 3D y flujo de inferencia con ventana deslizante.
- Punto de partida para fine-tuning: al estar bajo licencia MIT y en formato `state_dict` de PyTorch, se puede reentrenar sobre cohortes propias o sobre otros tumores cerebrales, siempre con validación externa.
- Prototipado de pipelines de imagen médica: integración en flujos que lean NIfTI (nibabel), apliquen espaciado y orientación correctos y generen máscaras para etapas posteriores de análisis.
- Extracción de rasgos para radiómica: las máscaras de WT, TC y ET permiten calcular volúmenes y estadísticas de intensidad por región que alimenten clasificadores o estudios de correlación.
- Auditoría y análisis de errores de segmentación: la separación explícita de TC, WT y ET facilita estudiar por qué la región ET, la más pequeña, concentra el mayor error relativo.
- Demostración de portafolio reproducible: el pipeline completo (entrenamiento, validación por volumen y evaluación) puede reproducirse con dependencias públicas y un único checkpoint ligero.
- Curación y anotación asistida en investigación: generación de propuestas de máscara que un experto revisa posteriormente, nunca como decisión diagnóstica automatizada.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con inferencia de ventana deslizante sobre volúmenes reservados, usando las dos métricas oficiales de BraTS:

| Region | Dice | HD95 (mm) |
|---|---|---|
| TC (Tumor Core) | 0,7915 | 14,18 |
| WT (Whole Tumor) | 0,8712 | 15,80 |
| ET (Enhancing Tumor) | 0,7582 | 7,53 |
| Media (Dice) | 0,8069 | -- |

Comparación con los rangos de literatura que el propio autor cita para esta familia de arquitecturas y dataset:

| Region | Este checkpoint | Rango de literatura citado en la model card |
|---|---|---|
| WT | 0,8712 | 0,85 - 0,90 |
| TC | 0,7915 | 0,80 - 0,85 |
| ET | 0,7582 | 0,70 - 0,80 |

El autor advierte que esos rangos provienen de pipelines muy ajustados y con ensembling, no de un único modelo entrenado en una sola GPU, por lo que no deben tomarse como expectativa directa sobre otro dataset o partición. No se han publicado otros resultados de benchmarks (por ejemplo, comparativas por institución o por protocolo de escáner) en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: no disponible. El tamaño del checkpoint (90,2 MB) es pequeño, pero el consumo real depende del tamaño de parche y del solapamiento configurados para la inferencia de ventana deslizante, datos que no se detallan en la información proporcionada.
- Almacenamiento: 0,1 GB de repositorio; el único checkpoint necesario es `best_model.pth`, de 90,2 MB.
- GPU recomendadas: no disponibles de forma explícita. El autor menciona un entrenamiento en una sola GPU con precisión mixta; por el tamaño del modelo es razonable esperar viabilidad en GPU de gama consumer, pero se trata de una inferencia basada en el tamaño del checkpoint y no de un dato confirmado.
- ¿Cabe en GPU consumer? Es probable que sí en términos de pesos; el factor limitante es el volumen 3D y el tamaño de parche elegido, no el número de parámetros. Conviene medir con el propio pipeline antes de dimensionar el hardware.
- Opciones de despliegue: PyTorch con MONAI para construir el modelo y nibabel para la E/S NIfTI, tal como muestra el ejemplo de uso del autor. vLLM, Ollama, llama.cpp o TGI no aplican a un modelo de segmentación de imágenes. No se documenta soporte para ONNX, TensorRT ni otras rutas de optimización.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del tamaño del volumen, del parche de ventana deslizante, del solapamiento y del hardware.

## Comparativa con modelos similares

No se identifican en la información disponible modelos concretos comparables con sus métricas, licencia y disponibilidad declaradas, por lo que no se puede construir una comparativa nominal rigurosa. Los únicos datos de contraste aportados por el autor son rangos agregados de literatura para esta familia de arquitecturas y dataset, ya recogidos en la sección de benchmarks: WT en torno a 0,85-0,90, TC en 0,80-0,85 y ET en 0,70-0,80 de Dice, correspondientes a pipelines con ajuste intensivo y ensembling frente a este checkpoint único.

Como referencia contextual de la categoría, dentro de la segmentación volumétrica de tumores cerebrales los enfoques basados en nnU-Net y en variantes de U-Net 3D con atención comparten tarea, formato de entrada NIfTI de cuatro modalidades y métricas Dice/HD95, pero no se dispone aquí de sus cifras, licencias ni condiciones de disponibilidad verificadas, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- No es un dispositivo médico. No ha sido validado de forma prospectiva ni revisado por ningún organismo regulador, y no debe utilizarse para emitir o descartar un diagnóstico.
- Sesgo de dominio: los datos de entrenamiento derivan de un conjunto concreto de instituciones y protocolos de escáner (BraTS 2016/2017 vía MSD). No debe asumirse generalización a escáneres, poblaciones o parámetros de adquisición arbitrarios sin validación adicional.
- Riesgo de error de segmentación: la región ET es la más difícil de forma consistente en este campo, al ser la más pequeña; el propio checkpoint obtiene su Dice más bajo (0,7582) y su HD95 más alto en TC (14,18 mm), lo que indica errores de borde relevantes.
- Alcance metodológico: es un modelo de un solo entrenamiento y una sola GPU, sin ensembling ni ajuste intensivo, por lo que su rendimiento no es directamente comparable con pipelines de competición.
- Sin soporte de texto, agentes ni tool calling: no puede emplearse para tareas de razonamiento, generación de lenguaje o automatización conversacional.
- Sin cuantizaciones publicadas ni formatos de despliegue ligeros documentados, lo que limita su uso en entornos con restricciones de runtime específicas.
- Restricciones de licencia: MIT permite uso comercial del checkpoint, pero el dataset subyacente (Medical Segmentation Decathlon / BraTS) tiene sus propias condiciones de uso que deben respetarse por separado.
- Advertencia del autor sobre artefactos antiguos: los assets de las releases `v1.0.0` y `v2.0.0` del repositorio de GitHub provienen de pipelines distintos y no coinciden con las métricas de esta model card; solo la release `v2.1.0` es coherente con este checkpoint.
- En producción clínica, cualquier resultado requiere la interpretación de un radiólogo y el conjunto completo del cuadro clínico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/motazalqaoud/brain-tumor-segmentation-weights
- Repositorio de código fuente: https://github.com/motazalqaoud/Brain-Tumor-Segmentation
- Release `v2.1.0` con el espejo del checkpoint: https://github.com/motazalqaoud/Brain-Tumor-Segmentation/releases/tag/v2.1.0
- Listado de releases del repositorio: https://github.com/motazalqaoud/Brain-Tumor-Segmentation/releases
- Dataset Medical Segmentation Decathlon: http://medicaldecathlon.com/
- Cita del dataset (Simpson et al., 2019): http://medicaldecathlon.com/
- Sitio del autor: https://motazalqaoud.com/
- LinkedIn del autor: https://linkedin.com/in/motazalqaoud
- Perfil de GitHub del autor: https://github.com/motazalqaoud
- Revisión sistemática sobre segmentación de tumores cerebrales con deep learning: https://www.sciencedirect.com/science/article/pii/S0165027025000652
