# raihana09/build-crop-detection-project

## Resumen

`raihana09/build-crop-detection-project` es un proyecto educativo de clasificación de imágenes publicado en Hugging Face que predice si una hoja de tomate está sana o enferma. No se trata de un modelo fundacional ni de un LLM, sino de un *baseline* de transfer learning construido sobre MobileNetV3-Small con PyTorch, entrenado sobre el subconjunto de tomate del dataset PlantVillage. El repositorio tiene 0 GB de tamano y no contiene pesos publicados en el momento de la consulta, por lo que debe interpretarse como un proyecto reproducible mas que como un artefacto listo para producción.

El objetivo declarado del autor es didáctico: recorrer el ciclo completo de un proyecto de visión por computador (selección y auditoría del dataset, particiones reproducibles, entrenamiento, evaluación de errores, demo y documentación de limitaciones). La tarea implementada es una clasificación binaria `healthy` / `diseased` sobre hojas de tomate, con una segunda fase prevista para predecir la categoría específica de enfermedad.

Su relevancia actual es la de un ejemplo bien documentado de buenas prácticas en *ML engineering* aplicado a agrotech: separación estricta train/val/test, agrupación por hoja para evitar fugas de datos, selección de umbral sobre validación y reporte explícito de métricas por clase. El autor reporta 96,46 % de *balanced accuracy* y 95,35 % de *recall* en hojas enfermas sobre el test reservado de PlantVillage, con un *recall* de solo 75,3 % en Target Spot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (transfer learning, PyTorch/torchvision) |
| Parametros totales | no disponible (MobileNetV3-Small tiene ~2,5 M de parametros en su configuracion estandar de torchvision; el autor no lo explicita) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB; el autor guarda artefactos en `models/` fuera de Git) |

## Arquitectura y entrenamiento

La arquitectura es una CNN MobileNetV3-Small preentrenada, adaptada mediante *fine-tuning* a una cabeza de clasificación binaria. El autor describe dos fases: un *baseline* congelado y un ajuste fino posterior (`fine_tune.py --epochs 2 --cap-per-class 250`), con selección del umbral de decisión sobre el conjunto de validación (`select_threshold.py`), que quedó fijado en 0,605.

Los datos provienen del subconjunto de tomate de PlantVillage, un dataset de aproximadamente 54.000 imágenes de hojas en 38 categorías cultivo-enfermedad, recogidas en condiciones controladas según el estudio original. El autor documenta un protocolo de particiones con agrupación por hoja (*leaf grouping map*) para evitar que imágenes casi idénticas se filtren entre train y test, y mantiene el test reservado hasta el final. No se especifica el número exacto de imágenes de tomate utilizadas, la composición detallada del split ni si hubo aumentos de datos más allá de lo implícito en el pipeline.

## Capacidades

- Clasificación binaria de imágenes de hoja de tomate en `healthy` o `diseased`.
- Inferencia sobre fotografías de una sola hoja en primer plano mediante una demo Streamlit (`app.py`).
- Salida de *scores* probabilísticos, no solo etiqueta, lo que permite umbralizar según el coste de falsos negativos.
- Pipeline reproducible de preparación de datos, entrenamiento, ajuste fino, selección de umbral y evaluación final.
- Auditoría de datos documentada (`reports/data_audit.md`) con recuento de clases y riesgo residual de duplicados.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión general ni capacidades multilingües: es un clasificador de imagen cerrado a una tarea.

## Casos de uso

- **Triaje preliminar en aplicaciones de agricultura de precisión**: el modelo puede actuar como primer filtro en una app móvil que marque hojas sospechosas para revisión humana, usando el score probabilístico y el umbral de 0,605 ajustado para priorizar *recall* de hojas enfermas.
- **Base para un clasificador multi-clase de enfermedades del tomate**: el autor plantea una segunda fase que prediga la categoría específica; el pipeline de splits y auditoría ya está preparado para extender la cabeza de clasificación.
- **Docencia y formación en visión por computador**: sirve como proyecto de referencia completo (dataset, splits, entrenamiento, evaluación por clase, demo) para cursos de *deep learning* aplicado.
- **Prototipo de herramienta de campo para técnicos agrícolas**: con la demo Streamlit, un técnico puede subir una foto de hoja y obtener una señal orientativa, siempre con validación posterior por un agrónomo.
- **Investigación sobre sesgos de dominio en agrotech**: al estar entrenado en PlantVillage (condiciones controladas), es útil como caso de estudio de la brecha entre *benchmark* y campo, comparando su rendimiento en fotos reales frente al 96,46 % de *balanced accuracy* reportado.
- **Integración en un pipeline MLOps educativo**: los scripts `prepare_splits.ps1`, `train_baseline.py`, `fine_tune.py` y `select_threshold.py` permiten demostrar versionado de datos, selección de umbral y evaluación con test reservado en un flujo reproducible.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Balanced accuracy | 96,46 % | Test reservado PlantVillage (tomate, binario) |
| Recall de hoja enferma | 95,35 % | Test reservado PlantVillage (tomate, binario) |
| Recall Target Spot | 75,3 % | Test reservado PlantVillage (tomate, binario) |
| Umbral de decisión seleccionado | 0,605 | Validación |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las cifras anteriores corresponden a imágenes controladas de PlantVillage, no a fotografías de campo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja; MobileNetV3-Small en FP32 ocupa del orden de decenas de MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- **GPU recomendadas**: no se requiere GPU para inferencia; el autor documenta un entorno CPU con PyTorch (wheel `cpu`) para el entrenamiento *baseline*. Para *fine-tuning* se recomienda cualquier GPU con CUDA (RTX 3060 o superior) por comodidad, aunque el modelo es lo bastante pequeno para entrenar en CPU con paciencia.
- **Cabe en consumer GPU**: sí, en cualquier GPU con al menos unos pocos GB de VRAM; también en CPU.
- **Opciones de despliegue**: PyTorch nativo, exportación a TorchScript/ONNX no documentada, y demo Streamlit (`streamlit run app.py`).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raihana09/build-crop-detection-project | MobileNetV3-Small (~2,5 M, no confirmado por el autor) | Imagen de hoja de tomate | 96,46 % balanced accuracy en PlantVillage (binario) | no disponible | Repo Hugging Face sin pesos (0.0 GB) |
| MobileNetV3-Small (torchvision, preentrenado ImageNet) | ~2,5 M | Imagen genérica | No aplica a esta tarea sin *fine-tuning* | BSD-3-Clause (torchvision) | Disponible en torchvision |
| EfficientNet-B0 (referencia habitual en clasificación de hojas) | ~5,3 M | Imagen genérica | No disponible en esta información para PlantVillage | Apache-2.0 (timm) | Disponible en timm |
| ResNet-50 (referencia clásica) | ~25,6 M | Imagen genérica | No disponible en esta información para PlantVillage | BSD-3-Clause (torchvision) | Disponible en torchvision |

No se dispone de comparaciones directas publicadas por el autor frente a estos modelos; la tabla recoge alternativas de la misma categoría (clasificadores CNN ligeros) sin datos de rendimiento equiparables en esta tarea.

## Limitaciones y advertencias

- **No es un servicio de diagnóstico**: el propio autor lo califica de prototipo educativo; las predicciones pueden ser erróneas y no deben sustituir la evaluación de un agrónomo cualificado.
- **Sesgo de dominio**: entrenado en PlantVillage, con imágenes en condiciones controladas; el rendimiento en fotos de campo, con iluminación variable, fondo desordenado o síntomas tempranos, es previsiblemente mucho menor que el 96,46 % reportado.
- **Clase con bajo recall**: Target Spot alcanza solo 75,3 % de *recall*, por lo que se pierde una fracción relevante de esa enfermedad.
- **Confusión con estrés nutricional o dano físico**: los síntomas visuales pueden parecerse a carencias o danos mecánicos, lo que aumenta el riesgo de falsos positivos y negativos.
- **Alcance limitado al tomate y a la etiqueta binaria**: no identifica el tipo de enfermedad ni recomienda tratamiento; el autor advierte explícitamente contra fusionar todos los cultivos en una etiqueta genérica de enfermedad.
- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido; además, la licencia del dataset PlantVillage debe verificarse en la copia concreta utilizada antes de redistribuir o usar comercialmente.
- **Riesgo residual de duplicados**: el autor documenta en `reports/data_audit.md` una limitación de partición y riesgo residual de duplicados pese a la agrupación por hoja.
- **Sin pesos publicados**: el repositorio figura con 0.0 GB y los artefactos se guardan en `models/` fuera de Git, por lo que no es posible usar el modelo directamente sin reproducir el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/raihana09/build-crop-detection-project
- PyTorch (instalación local): https://pytorch.org/get-started/locally/
- PlantVillage (paper original y distribución del dataset): no disponible en la información proporcionada
- TensorFlow Datasets, copia de 38 clases de PlantVillage: no disponible en la información proporcionada
- Repositorio de código del proyecto: no disponible en la información proporcionada
- Demo Streamlit: no disponible en línea; se ejecuta localmente con `streamlit run app.py`
