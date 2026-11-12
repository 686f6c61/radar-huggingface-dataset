# adineo/cumulonimbus-cloud-classifier

## Resumen

El cumulonimbus-cloud-classifier es un modelo de visión por computador desarrollado por el usuario adineo y publicado en Hugging Face. Resuelve una tarea concreta de clasificación binaria de imágenes: distinguir nubes de tipo cumulonimbus (las asociadas a tormentas y precipitaciones intensas) frente a cualquier otro tipo de nube o cielo. La entrada es una imagen RGB redimensionada a 256×256 y la salida es una puntuación sigmoide calibrada que representa P(other).

Técnicamente es un ensemble de tres modelos EfficientNetV2-B0 entrenados con semillas distintas, con aumento de datos en tiempo de test (TTA de cinco vistas), calibración de Platt ajustada sobre validación y explicabilidad mediante Grad-CAM. Se distribuye en formato nativo de Keras (`.keras`) bajo TensorFlow 2.19 y Keras 3.15, con un baseline MobileNetV2 incluido a modo de comparación.

Su relevancia es acotada pero clara: ofrece un punto de partida reproducible y ligero para tareas de meteorología basada en imágenes terrestres, con métricas declaradas sobre un conjunto de test reservado y sin verificación externa. No es un modelo de lenguaje ni un modelo multimodal general; es un clasificador de imagen especializado y de pequeño tamaño (repositorio de 0,2 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 × EfficientNetV2-B0 (transfer learning); baseline MobileNetV2 incluido |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada 256×256 RGB) |
| Tipos de cuantización | no disponible (pesos en formato `.keras` de Keras 3) |
| Idiomas soportados | no aplica (clasificación de imagen, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | `.keras` (TensorFlow 2.19 / Keras 3.15); manifiesto JSON y calibración JSON |

## Arquitectura y entrenamiento

El modelo es un ensemble de tres instancias de EfficientNetV2-B0 entrenadas con semillas diferentes (42, 1042 y 2042) mediante transfer learning. La inferencia de referencia promedia las salidas de los tres miembros tras aplicar TTA de cinco vistas por miembro y una calibración de Platt (parámetros `a` y `b` en `calibration.json`) ajustada exclusivamente sobre el split de validación. EfficientNetV2-B0 normaliza internamente, por lo que la entrada son flotantes RGB en rango [0, 255] a 256×256.

Los datos de entrenamiento combinan fotografías propias del autor con la base de datos pública CCSN (2.543 imágenes, Zhang et al., «CloudNet: Ground-Based Cloud Classification With Deep Learning», GRL 2018). Todas las clases de CCSN distintas de cumulonimbus se agrupan en la clase `other`, lo que convierte la tarea en binaria. El split es estratificado y con semilla, en proporción 80/10/10 (entrenamiento 204/1851, validación 25/231, test 25/231 para cumulonimbus/other). El conjunto de test no se usó para entrenamiento, selección de checkpoint, búsqueda de umbral ni calibración.

## Capacidades

- Clasificación binaria de imágenes de nubes terrestres: `cumulonimbus` frente a `other`.
- Salida de una puntuación sigmoide calibrada (P(other)); umbral por defecto 0,5.
- Aumento de datos en tiempo de test (TTA) con cinco vistas por miembro para la inferencia de referencia.
- Explicabilidad mediante Grad-CAM.
- Baseline MobileNetV2 incluido para comparación de rendimiento y coste.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vídeo.
- No dispone de capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Alerta temprana de convección: integrado en una estación meteorológica con cámara terrestre, el clasificador puede marcar fotogramas con probable cumulonimbus y disparar una revisión humana o un aviso preliminar, usando el umbral ajustable para priorizar recall.
- Filtrado de archivos fotográficos: procesamiento por lotes de repositorios de imágenes de cielo para separar candidatas a cumulonimbus y reducir el volumen que un meteorólogo debe revisar manualmente.
- Anotación asistida de datasets: preetiquetado de nuevas imágenes antes de la revisión experta, aprovechando la alta precisión en la clase `other` para descartar rápidamente negativos.
- Educación y divulgación meteorológica: herramienta de demostración que muestra la puntuación del modelo y el mapa Grad-CAM para explicar qué regiones de la imagen sustentan la clasificación.
- Monitorización de webcams urbanas: despliegue ligero sobre imágenes de cámaras fijas para generar series temporales de probabilidad de cumulonimbus y estudiar su evolución diurna.
- Investigación comparativa: uso del baseline MobileNetV2 y del ensemble como referencia reproducible en experimentos de clasificación de nubes terrestres con CCSN.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test reservado (256 imágenes); no verificados de forma independiente.

| Configuración | Accuracy | Macro-F1 | ROC-AUC | ECE |
|---|---|---|---|---|
| MobileNetV2 (baseline) | 90,62 % | 57,51 % | 0,833 | 0,017 |
| EfficientNetV2-B0 (1 semilla) | 92,97 % | 74,42 % | 0,894 | 0,018 |
| Ensemble ×3 + Platt (modelo propuesto) | 93,36 % | 77,46 % | 0,921 | 0,027 |

Matriz de confusión del ensemble en test (filas = real, columnas = predicho; orden `cumulonimbus`, `other`):

|  | cumulonimbus | other |
|---|---|---|
| **cumulonimbus** | 12 | 13 |
| **other** | 4 | 227 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,2 GB) y la arquitectura EfficientNetV2-B0, la inferencia cabe holgadamente en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte TensorFlow 2.19 es suficiente en principio.
- Cabe en GPU de consumo: sí, previsiblemente en modelos tipo RTX 3060 o superiores, aunque no hay medición publicada.
- Opciones de despliegue: TensorFlow 2.19 / Keras 3.15 (formato `.keras`); no se mencionan exportaciones a ONNX, TFLite, vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo salvo conversión manual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Accuracy (test) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cumulonimbus-cloud-classifier (ensemble) | 3 × EfficientNetV2-B0 | Binaria cumulonimbus/other | 93,36 % | 77,46 % | MIT | Hugging Face |
| EfficientNetV2-B0 (1 semilla, incluido) | EfficientNetV2-B0 | Binaria cumulonimbus/other | 92,97 % | 74,42 % | MIT | Incluido en el repo |
| MobileNetV2 (baseline, incluido) | MobileNetV2 | Binaria cumulonimbus/other | 90,62 % | 57,51 % | MIT | Incluido en el repo |

No se dispone de comparación con clasificadores de nubes externos en la información proporcionada.

## Limitaciones y advertencias

- Recall bajo en la clase rara: en test se pierden 13 de 25 cumulonimbus (recall ≈ 48 %), aunque la precisión en esa clase es alta; conviene bajar el umbral si prima el recall.
- Solo validado con fotografías terrestres; no se ha probado con imágenes de satélite, escenas nocturnas ni oclusión intensa.
- Tarea binaria: la clase `other` agrupa todos los demás géneros de nubes, por lo que no distingue entre ellos.
- Calibración ajustada sobre un split de validación pequeño (256 imágenes), lo que puede introducir sesgo en las probabilidades.
- Métricas no verificadas de forma independiente (`verified: false` en el model-index).
- Riesgo de sobreajuste al conjunto de fotografías propias del autor, no cuantificado en la información disponible.
- Licencia MIT permite uso comercial, pero la base de datos CCSN conserva sus propios términos en Harvard Dataverse y requiere citar a Zhang et al. (2018) al usar los datos combinados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adineo/cumulonimbus-cloud-classifier
- Dataset CCSN (Harvard Dataverse): https://doi.org/10.7910/DVN/CADDPD
- Referencia del dataset: Zhang et al., «CloudNet: Ground-Based Cloud Classification With Deep Learning», Geophysical Research Letters, 2018.
