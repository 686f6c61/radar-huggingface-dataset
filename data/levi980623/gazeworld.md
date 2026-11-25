# Levi980623/GazeWorld

## Resumen

GazeWorld es un modelo de representación para radiografía de tórax que aborda la imagen como un "mundo" y la secuencia de fijaciones del radiólogo como una trayectoria sobre él. Desarrollado por Yiwei Li y colaboradores (arXiv:2605.23992), el modelo aprende representaciones visuales prediciendo la representación latente del siguiente parche fijado a partir de los ya visitados, además de completar espacialmente los parches no visitados. En inferencia solo requiere la imagen, sin datos de seguimiento ocular.

La arquitectura parte de un codificador MedCLIP Swin-T (224², 49 parches, dimensión 768) sobre el que se monta un predictor causal de 8 capas y un decodificador de completado espacial con objetivo EMA, siguiendo el paradigma JEPA. El repositorio incluye también tres variantes de predicción de scanpaths (GazeSearch) con distintos backbones: DenseNet121 de torchxrayvision, ResNet50-FPN de Mask R-CNN y Swin-T de MedCLIP.

El modelo es relevante porque demuestra que la señal de atención de expertos puede destilarse en un extractor de características puramente visual, útil para clasificación diagnóstica con pocas etiquetas y para modelar el comportamiento de lectura radiológica. La licencia es MIT, aunque los datos de entrenamiento originales (MIMIC-EYE) son de acceso restringido en PhysioNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador MedCLIP Swin-T + predictor causal de 8 capas + decodificador de completado espacial (JEPA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; 49 parches de 224² en stage-1, rejilla 14×14 a 448² en scanpath) |
| Tipos de cuantizacion | no disponible (pesos en `torch.save`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (dict de `torch.save` con pesos bajo la clave `"model"`) |

## Arquitectura y entrenamiento

El componente principal (`gazeworld_stage1.pth`) es un modelo JEPA de predicción de fijaciones: un codificador Swin-T de MedCLIP procesa la radiografía en 49 parches de 224² con dimensión 768; un predictor autorregresivo causal de 8 capas pronostica la representación latente del siguiente parche fijado condicionado a todos los anteriores; y una rama de completado espacial predice las representaciones de parches no visitados. Se emplea un objetivo EMA sobre el codificador, siguiendo el esquema típico de JEPA.

El entrenamiento de stage-1 se realizó sobre MIMIC-EYE (gaze de radiólogos sobre MIMIC-CXR, combinando REFLACX y EGD), datos con credenciales de PhysioNet que no se redistribuyen. Los tres modelos de scanpath (`scanpath_chex.pth`, `scanpath_res.pth`, `scanpath_medclip.pth`) comparten un decodificador Transformer causal de 6 capas (d=512, 8 cabezas) sobre una rejilla 14×14 a 448², con cabezas de posición espacial (196 vías), duración y terminación, prediciendo 7 fijaciones por tarea de búsqueda en 13 categorías de hallazgo. Se entrenaron sobre 3.870 scanpaths de GazeSearch.

## Capacidades

- Extracción de características de imágenes de radiografía de tórax: `model.get_features(images)` devuelve un vector de 1536 dimensiones (token de lectura concatenado con el mean-pool de parches).
- Clasificación diagnóstica mediante sonda lineal congelada (regresión logística ℓ2, C=1) sobre las características de stage-1.
- Clasificación zero-shot a través del codificador de texto de MedCLIP.
- Predicción de scanpaths de búsqueda visual (GazeSearch): posición, duración y terminación de fijaciones.
- Modelado del comportamiento de lectura radiológica como trayectoria sobre la imagen.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Clasificación diagnóstica con pocas etiquetas: con solo el 1 % de etiquetas, la sonda lineal alcanza AUROC de 78,37 % en CheXpert, 83,27 % en RSNA y 87,85 % en SIIM-ACR, lo que permite arrancar proyectos con anotación escasa.
- Preentrenamiento de extractores para telerradiología: usar `get_features` como backbone congelado y entrenar cabezas ligeras para detección de neumotórax, derrame o consolidación.
- Investigación en percepción experta: comparar scanpaths predichos con los de radiólogos reales para estudiar patrones de búsqueda y errores de lectura.
- Formación de residentes: generar trayectorias de búsqueda de referencia sobre casos nuevos y contrastarlas con las del alumno.
- Aumento de datasets de eye-tracking: sintetizar scanpaths plausibles sobre imágenes sin anotación de gaze para ampliar corpus de investigación.
- Búsqueda visual simulada: modelar cómo un radiólogo localizaría un hallazgo concreto (13 categorías) en una radiografía, útil en sistemas de triaje asistido.
- Evaluación de robustez de modelos médicos: analizar si las representaciones capturan regiones clínicamente relevantes mediante el completado espacial de parches.

## Benchmarks y rendimiento

Sonda lineal congelada, AUROC (%) con 1 % / 10 % / 100 % de etiquetas:

| Modelo | CheXpert | RSNA | SIIM-ACR |
|---|---|---|---|
| GazeWorld | 78,37 / 83,41 / 87,61 | 83,27 / 85,75 / 90,15 | 87,85 / 90,48 / 94,27 |

Zero-shot, AUROC / Acc / F1 (%):

| Modelo | CheXpert 5×200 | RSNA | SIIM-ACR |
|---|---|---|---|
| GazeWorld | 58,13 / 59,42 / 56,85 | 62,84 / 70,18 / 47,31 | 64,29 / 66,59 / 63,26 |

Predicción de scanpath en GazeSearch (test de 488 casos):

| Variante | SM ↑ | SED ↓ | STDE ↑ | Vec ↑ | Dir ↑ | Pos ↑ |
|---|---|---|---|---|---|---|
| Ours (MedCLIP) | 0,479 | 3,74 | 0,909 | 0,941 | 0,649 | 0,837 |
| Ours (Res) | 0,484 | 3,66 | 0,912 | 0,966 | 0,678 | 0,917 |
| Ours (CheX) | 0,489 | 3,63 | 0,911 | 0,966 | 0,686 | 0,915 |

No se han publicado comparativas directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB en total; el checkpoint de stage-1 (Swin-T + predictor de 8 capas) es ligero y cabe holgadamente en GPU consumer de 8 GB en FP32.
- GPU recomendadas: cualquier GPU con ≥8 GB (RTX 3060, RTX 4060, RTX 4090); para lotes grandes en investigación, A100 o H100.
- Cabe en GPU consumer: sí, sin cuantización adicional.
- Despliegue: PyTorch nativo (los pesos son `torch.save`); no hay versiones publicadas para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| GazeWorld | JEPA visual con gaze | 224² (49 parches) / 448² (rejilla 14×14) | MIT | Hugging Face + GitHub |
| MedCLIP (Swin-T) | CLIP médico | 224² | MIT (según repo original) | Hugging Face |
| torchxrayvision DenseNet121 | CNN clasificación | 224² | Apache 2.0 | GitHub/PyPI |
| Modelos de scanpath genéricos (p. ej. DeepGaze) | Predicción de saliencia | variable | variable | GitHub |

La comparación cuantitativa directa con estos modelos no está disponible en la información proporcionada; GazeWorld usa MedCLIP y torchxrayvision como backbones, por lo que su valor diferencial está en la señal de gaze, no en sustituir a esos codificadores.

## Limitaciones y advertencias

- Entrenado exclusivamente con gaze de radiólogos sobre MIMIC-CXR: puede no generalizar a otras modalidades, anatomías o poblaciones.
- Los datos de entrenamiento (MIMIC-EYE) son de acceso restringido en PhysioNet y no se redistribuyen; la reproducibilidad completa del entrenamiento requiere credenciales.
- Riesgo de sesgo demográfico y de adquisición heredado de MIMIC-CXR (población y equipos concretos).
- El rendimiento zero-shot es moderado (AUROC 58-64 %), muy inferior a la sonda lineal supervisada; no es un clasificador listo para producción sin ajuste.
- El F1 zero-shot en RSNA es bajo (47,31 %), lo que indica desequilibrio en la calibración de umbrales.
- Sin cuantizaciones publicadas ni formatos estándar de despliegue (GGUF, ONNX), lo que complica la integración en stacks no PyTorch.
- No es un modelo generativo de texto ni multimodal texto-imagen: no admite prompts en lenguaje natural.
- El identificador arXiv (2605.23992) y las fechas de creación del repositorio son posteriores a la fecha actual, lo que conviene verificar antes de citarlo en producción.
- Uso clínico: no validado regulatoriamente; no debe emplearse para decisiones diagnósticas sin supervisión facultativa.

## Enlaces

- Hugging Face: https://huggingface.co/Levi980623/GazeWorld
- Dataset GazeSearch: https://huggingface.co/datasets/Levi980623/GazeWorld-data
- Paper: https://arxiv.org/abs/2605.23992
- Código: https://github.com/levyisthebest/gaze-world-models
- MedCLIP (codificador base): no disponible enlace específico en la información proporcionada
- torchxrayvision (backbone CheX): no disponible enlace específico en la información proporcionada
