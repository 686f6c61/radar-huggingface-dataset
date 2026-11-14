# jiandanhuoduanqiao96/AI-Edited-Image-Localization-CS5489

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de visión por computador orientado a una tarea muy concreta: la localización de ediciones locales en imágenes generadas o manipuladas por IA (AIGC local edit localization). El autor publica bajo el identificador `jiandanhuoduanqiao96` los pesos y el código de inferencia de un proyecto de curso (CS5489) que participa en el dataset AIGC Detection Dataset 2026. La tarea consiste en producir máscaras de segmentación que indiquen qué regiones de una imagen han sido editadas, evaluadas mediante Dice.

El modelo final es un checkpoint PyTorch (`model.pth`, experimento exp06) que combina un ensamblado de dos variantes (v2 y v3) con fusión geométrica y calibración de umbral por imagen mediante un modelo ridge. El autor reporta un Dice medio OOF de 0,878785 sobre validación cruzada de 5 folds, muy por encima del baseline trivial de predecir todo unos (0,1775). El repositorio de Hugging Face es fundamentalmente una tarjeta de modelo con el código de inferencia; los pesos completos viven en un release de GitHub de un repositorio privado de grupo.

Es relevante ahora porque ejemplifica el flujo típico de un proyecto académico de segmentación de manipulación de imágenes: pesos en formato `.pth` (no safetensors ni GGUF), sin licencia declarada, sin pipeline de Hugging Face y con instrucciones de reproducción dependientes de un dataset externo. No es un modelo listo para producción ni un modelo fundacional, sino un artefacto de investigación reproducible con requisitos muy específicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la model card; el nombre del repositorio de código sugiere U-Net, sin confirmación) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en punto flotante PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch), con subida fragmentada en partes de 1 MB en Hugging Face; `models_all.tar` (571 MB) en GitHub Release |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El nombre del repositorio de código (`aigc-unet-warmrestart-geo-calib`) sugiere una red de segmentación tipo U-Net con warm restarts en el entrenamiento y calibración geométrica, pero esta información no se confirma explícitamente en la documentación disponible. El autor documenta seis experimentos (exp01 a exp06) con una progresión clara de rendimiento: exp01 P1 (0,8015), exp02 M512 (0,8364), exp03 v2 (0,866386), exp04 v3 (0,870301), exp05 geo ensemble v2+v3 (0,874248) y exp06 geo + calibración por imagen (0,878785). La mejora incremental sugiere un pipeline de ensamblado y post-procesado más que un cambio arquitectónico radical.

El entrenamiento se realizó sobre el AIGC Detection Dataset 2026, con 115 filas de entrenamiento que cumplen un contrato RLE específico (inicio 1-based, orden column-major/Fortran, con `(start-1)+length == H*W` en los casos que terminan en el último píxel). No se detalla el número de tokens, la composición del dataset, ni si hubo RLHF/DPO (no aplica en visión). La innovación técnica destacable es la calibración de umbral por imagen mediante un modelo ridge (`threshold_model.npz`), que ajusta el umbral de binarización de la máscara predicha para cada imagen individual, y la fusión geométrica de dos variantes del modelo.

## Capacidades

- Segmentación binaria de regiones editadas por IA en imágenes: produce máscaras que localizan ediciones locales.
- Ensamblado de dos variantes (v2 y v3) con fusión geométrica para mejorar la robustez de la máscara.
- Calibración de umbral por imagen mediante un modelo ridge entrenado sobre características OOF.
- Inferencia end-to-end mediante un notebook (`test.ipynb`) que genera `submission.csv` en formato RLE.
- Ejecución en CPU: el autor reporta ~80–85 minutos para 500 imágenes de test.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la segmentación de ediciones.

## Casos de uso

- Detección forense de manipulaciones locales: el modelo puede integrarse en un pipeline de verificación de autenticidad de imágenes para señalar qué regiones han sido editadas por herramientas generativas, usando la máscara de salida como mapa de evidencia.
- Moderación de contenido en plataformas: para marcar imágenes sospechosas de edición por IA antes de revisión humana, aprovechando que el modelo produce una localización espacial y no solo una etiqueta binaria.
- Investigación en detección de deepfakes y ediciones AIGC: como baseline reproducible con Dice OOF de 0,878785 y pesos verificables por SHA256, útil para comparar métodos de segmentación de manipulación.
- Auditoría de datasets de imágenes: para identificar qué muestras de un corpus han sido editadas localmente y limpiar conjuntos de entrenamiento contaminados.
- Docencia y reproducción académica: el notebook de inferencia y los seis checkpoints documentados permiten reproducir la progresión de experimentos y estudiar el efecto de la calibración por imagen.
- Prototipado de herramientas de verificación visual: para construir demos que resalten regiones editadas sobre la imagen original, con la advertencia de que el tiempo de inferencia en CPU (~80–85 min para 500 imágenes) limita su uso interactivo.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Dice medio de validación (5-fold OOF) | 0,878785 |
| Baseline todo-unos (Dice) | 0,1775 |
| Tiempo de inferencia en test (CPU, 500 imágenes) | ~80–85 min |
| SHA256 de la submission final | `43fd21b0d1fc3f436d0e85b02bf949f95a07803f6dfcac6607d9cc73a5c325d9` |

Progresión por experimento (Dice de validación):

| Checkpoint | Experimento | Dice |
|---|---|---|
| `model.pth` | exp06 geo + calibración por imagen | 0,878785 |
| `models/exp05_geo.pth` | exp05 ensamblado geo (v2+v3) | 0,874248 |
| `models/exp04_v3.pth` | exp04 v3 single | 0,870301 |
| `models/exp03_v2.pth` | exp03 v2 single | 0,866386 |
| `models/exp02_m512.pth` | exp02 M512 single | 0,8364 |
| `models/exp01_p1.pth` | exp01 P1 baseline | 0,8015 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el autor reporta ejecución en CPU, lo que sugiere un modelo de tamaño moderado; el tar de pesos completa ocupa 571 MB, lo que da una cota superior aproximada del orden de cientos de MB en punto flotante).
- GPU recomendadas: no disponibles en la documentación; el flujo documentado es CPU.
- Cabe en GPU de consumo: probablemente sí dado el tamaño del tar de pesos, pero no está confirmado por el autor.
- Opciones de despliegue: inferencia vía Jupyter (`test.ipynb` + `src/`) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: ~80–85 min para 500 imágenes en CPU (aproximadamente 10 s por imagen); no se reportan cifras en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de localización de ediciones AIGC, y no se dispone de datos de benchmarks de alternativas en la documentación.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, modificación o redistribución; debe tratarse como no apto para producción hasta aclararlo con el autor.
- Pesos incompletos en Hugging Face: el autor advierte que el canal de archivos grandes está restringido y que el repositorio puede contener solo partes de `model.pth.part*`; los pesos completos y verificados están en un release de GitHub de un repositorio privado de grupo, accesible solo a miembros.
- Dependencia de un dataset externo: la inferencia requiere `AIGC_DATA_ROOT` apuntando al AIGC Detection Dataset 2026, con estructura específica (`train.csv`, `test.csv`, `train/`, `test/`).
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de falsos positivos y negativos en la localización de ediciones; el Dice OOF de 0,878785 no garantiza generalización fuera de la distribución del dataset.
- Sin información sobre sesgos: no se documentan sesgos demográficos, de dominio ni de tipo de edición.
- Limitaciones de idioma: no aplica (modelo de visión).
- Advertencia explícita del autor: no usar `models/*` para la submission final; el modelo final es `model.pth` (exp06).
- Reproducibilidad frágil: el flujo depende de un notebook, nueve módulos Python y un archivo de configuración portable; los SHA256 permiten verificar la integridad de los pesos y de la submission.

## Enlaces

- Hugging Face: https://huggingface.co/jiandanhuoduanqiao96/AI-Edited-Image-Localization-CS5489
- Dataset: https://huggingface.co/datasets/Beoky-ok/AIGC_Detection_Dataset_2026
- GitHub Release con los pesos completos (`models_all.tar`): https://github.com/weitao040702-coder/AI-Edited-Image-Localization-CS5489-/releases/tag/v1.0-exp06
- Repositorio de código e historial de experimentos (privado, solo miembros): https://github.com/weitao040702-coder/AI-Edited-Image-Localization-CS5489-/tree/fengyang/aigc-unet-warmrestart-geo-calib/fengyang
