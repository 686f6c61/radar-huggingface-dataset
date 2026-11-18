# KhangTruong/FOCAL-Finetune

## Resumen

FOCAL-Finetune es un checkpoint de segmentación de imágenes orientado a la detección de imágenes sintéticas generadas por modelos de difusión. Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0 y se distribuye como pesos de PyTorch (`.pt`) dentro de un repositorio de 0,3 GB. No es un modelo de lenguaje: es un modelo de visión por computador con pipeline `image-segmentation`, etiquetado además para `synthetic-image-detection` y `diffusion-detection`.

El modelo se apoya en la librería `sid-unet`, un framework propio de entrenamiento e inferencia (con herramientas `sid-pull`, `sid-train` y `sid-push`) que gestiona checkpoints versionados. La model card documenta una única versión activa (`v1`), entrenada durante 3 épocas y con una mejor puntuación de validación de 0,244 en la métrica interna del framework, un valor bajo que sugiere un ajuste fino preliminar más que un modelo listo para producción.

Su relevancia es acotada pero concreta: la detección y localización de contenido generado por difusión (deepfakes visuales, imágenes sintéticas en datasets, verificación de procedencia) es un problema activo, y este repositorio ofrece un punto de partida reproducible con configuración y scripts de reanudación de entrenamiento. No obstante, la información pública es escasa: no se detallan arquitectura exacta, datos de entrenamiento ni benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net para segmentación (framework `sid-unet`); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (pesos en PyTorch `.pt`) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`: `checkpoint_best.pt`, `checkpoint_latest.pt`, `checkpoint_periodic.pt`) |

## Arquitectura y entrenamiento

La etiqueta `sid-unet` y el pipeline `image-segmentation` indican una arquitectura basada en U-Net, adecuada para predicción densa a nivel de píxel. El repositorio incluye un `config.yaml` con la configuración del modelo y del entrenamiento, además de checkpoints en formato PyTorch. No se especifican en la información disponible el número de parámetros, la profundidad de la red, el mecanismo de atención ni la resolución de entrada.

El entrenamiento documentado consta de 3 épocas, con una mejor puntuación de validación de 0,24401156141093922 alcanzada en la época 3. La configuración de referencia para reanudar el ajuste fino es `configs/experiments/diffusion_diff_minimized/default.yaml`, con la posibilidad de sobrescribir el número de épocas (por ejemplo, `training.epochs=40`). No se detallan el volumen de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, RLHF o preferencias; tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Segmentación de imágenes a nivel de píxel mediante una U-Net.
- Detección de imágenes sintéticas generadas por modelos de difusión (etiqueta `diffusion-detection`).
- Localización espacial del contenido sintético dentro de la imagen, no solo clasificación binaria.
- Reanudación de entrenamiento y ajuste fino mediante `sid-train`, con configuración YAML y checkpoints reanudables.
- Versionado y publicación de checkpoints con `sid-pull` y `sid-push`.
- Evaluación cruzada documentada en `cross_evaluation/master_cross_evaluation_report.md` y `cross_eval_matrix.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Verificación de procedencia de imágenes: integrar el modelo en un pipeline que reciba imágenes subidas por usuarios y marque regiones sospechosas de haber sido generadas por difusión, usando la salida de segmentación como mapa de calor para revisión humana.
- Curación de datasets: filtrar automáticamente imágenes sintéticas de corpus de entrenamiento o de benchmarks, evitando contaminación por contenido generado, aprovechando la predicción densa para descartar solo las regiones afectadas.
- Moderación de contenido en plataformas: detección de imágenes sintéticas en flujos de publicación, con la segmentación como señal auxiliar para priorizar la revisión manual de los casos dudosos.
- Investigación en detección de deepfakes: punto de partida reproducible (configuración y checkpoints incluidos) para experimentar con ajuste fino sobre datasets propios mediante `sid-train`.
- Auditoría de medios: análisis forense de imágenes en contextos periodísticos o de verificación de hechos, localizando las zonas manipuladas para documentar el informe.
- Base para ajuste fino especializado: reentrenar el checkpoint con `training.epochs=40` u otras sobrescrituras sobre dominios concretos (retratos, escenas, ilustraciones) donde el detector genérico pierda precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de segmentación. El único dato de rendimiento documentado es la métrica interna de validación del framework:

| Métrica | Valor | Época |
|---|---|---|
| Mejor puntuación de validación (`v1`) | 0,24401156141093922 | 3 |
| Épocas totales de entrenamiento | 3 | — |

El repositorio incluye `reports/test_evaluation_report.json` y `reports/training_curves.png`, pero su contenido no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,3 GB) incluye checkpoints y artefactos, por lo que los pesos en sí ocupan una fracción de esa cifra y probablemente caben en GPUs de consumo.
- GPU recomendadas: no disponibles; para una U-Net de segmentación de tamaño moderado, una RTX 3090 o RTX 4090 sería suficiente para inferencia, pero no hay confirmación en la documentación.
- Compatibilidad con GPU de consumo: probable por el tamaño del repositorio, aunque no verificado.
- Opciones de despliegue: el flujo documentado es el framework `sid-unet` (`sid-pull`, `sid-train`, `sid-push`) con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores de imágenes sintéticas ni con otras U-Net de segmentación, y no se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Puntuación de validación baja (0,244) tras solo 3 épocas: el checkpoint parece un ajuste fino preliminar, no un modelo validado para producción.
- Ausencia de benchmarks estándar y de métricas como IoU, F1 o AUC que permitan evaluar su calidad real.
- No se documentan los datos de entrenamiento, por lo que se desconocen los sesgos de dominio (tipos de imágenes, generadores de difusión cubiertos, resoluciones).
- Riesgo de falsos positivos y negativos en imágenes fuera de la distribución de entrenamiento; no hay información sobre calibración.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de documentación técnica hace recomendable una validación propia antes de desplegarlo.
- Dependencia de la librería `sid-unet` y de su CLI para cargar y reanudar checkpoints; la integración con otros frameworks (por ejemplo, Hugging Face Transformers) no está documentada.
- Solo hay una versión publicada (`v1`) y el autor no ha publicado guías de uso más allá de los comandos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/FOCAL-Finetune
- Repositorio de checkpoints y configuración: incluido en el propio repo de Hugging Face (`config.yaml`, `manifest.json`, `checkpoints/`, `reports/`, `cross_evaluation/`)
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código de `sid-unet` ni demos.
