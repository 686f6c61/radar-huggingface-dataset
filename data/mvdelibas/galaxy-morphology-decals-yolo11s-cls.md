# mvdelibas/galaxy-morphology-decals-yolo11s-cls

## Resumen

Galaxy morphology classifier es un modelo de clasificación de imágenes basado en la arquitectura YOLO11s-cls de Ultralytics, ajustado por el usuario mvdelibas para distinguir cuatro morfologías galácticas: espiral, elíptica, disco visto de canto y fusión/perturbada. El modelo parte de los pesos preentrenados oficiales de YOLO11s-cls y se reentrena sobre recortes de galaxias del proyecto Galaxy Zoo DECaLS, cuyas etiquetas provienen de las votaciones de voluntarios y del etiquetado profundo descrito por Walmsley et al. (2022).

El modelo resuelve un problema clásico de astronomía observacional: la clasificación morfológica masiva de galaxias a partir de imágenes. Con 96,6 % de top-1 accuracy y 92,7 % de F1 macro en el split de validación, se posiciona como una herramienta práctica para prefiltrar catálogos, aunque sus propios límites (solo galaxias "claras" y solo recortes DECaLS DR5) acotan su uso a investigación y prototipado.

Es relevante ahora porque la combinación de un backbone ultraligero (YOLO11s) con un dataset de referencia en morfología galáctica permite desplegar clasificación astronómica en hardware modesto, algo útil para pipelines de preprocesado en surveys de gran volumen como DESI Legacy Imaging Surveys.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-cls (CNN de clasificación, fine-tune de pesos oficiales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 px en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en formato .pt de Ultralytics) |
| Idiomas soportados | en, tr (etiquetas de clase en turco) |
| Licencia | AGPL-3.0 (pesos derivados de YOLO11); datos de entrenamiento bajo CC BY 4.0 |
| Formato de pesos | .pt (PyTorch / Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de YOLO11s-cls, la variante "small" de clasificación de la familia YOLO11 de Ultralytics. Se entrenó a 224 px durante 40 épocas con optimizador AdamW, learning rate inicial 0,001, y aumentación de datos basada en rotaciones y volteos. El entrenamiento consumió aproximadamente 3,10 CR (unidades de cómputo de la plataforma de entrenamiento).

Los datos de entrenamiento y validación proceden de Galaxy Zoo DECaLS (Walmsley et al. 2022, Zenodo 4573248), con imágenes de DESI Legacy Imaging Surveys / DECaLS DR5 en recortes de 256 px. Solo se incluyeron galaxias "claras", definidas como aquellas con una fracción de votos de voluntarios de al menos 0,8. El split de validación contiene 2.759 galaxias y se construyó por celdas de cielo de 5x5 grados para evitar fuga de información entre entrenamiento y validación.

## Capacidades

- Clasificación de imágenes de galaxias en cuatro clases: `sarmal` (espiral), `eliptik` (elíptica), `kenardan_disk` (disco visto de canto) y `birlesen_bozuk` (fusión/perturbada).
- Salida de probabilidades por clase (top-1 y top-5) mediante la API de Ultralytics (`result.probs`).
- Inferencia sobre recortes de imagen individuales; no soporta detección, segmentación ni localización de objetos.
- Etiquetas internas del modelo en turco, lo que requiere mapeo explícito a otros idiomas en producción.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Prefiltrado de catálogos astronómicos: clasificar automáticamente recortes DECaLS en las cuatro morfologías para priorizar la inspección visual humana en muestras de decenas de miles de galaxias.
- Selección de muestras para estudios de evolución galáctica: separar espirales de elípticas y de fusiones para análisis estadísticos posteriores, aprovechando el F1 alto en espirales (97,7 %) y elípticas (98,0 %).
- Control de calidad en pipelines de datos de surveys: detectar recortes con morfología anómala (fusiones/perturbadas) que puedan requerir revisión o flagging adicional.
- Etiquetado asistido en proyectos de ciencia ciudadana: usar las predicciones como sugerencia inicial para voluntarios de plataformas tipo Galaxy Zoo, reduciendo el esfuerzo de clasificación manual.
- Docencia y divulgación en astronomía: demonstrar pipelines de clasificación morfológica con un modelo ligero que corre en hardware modesto.
- Prototipado de modelos de morfología: servir como baseline reproducible (YOLO11s-cls + Galaxy Zoo DECaLS) antes de escalar a arquitecturas mayores o datasets más amplios.
- Búsqueda de candidatos a fusiones galácticas: pese a ser la clase más débil (recall 0,801), puede usarse como primer filtro para revisiones posteriores con modelos especializados.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de validación (2.759 galaxias, split por celdas de cielo de 5x5 grados):

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 96,6 % |
| Top-5 accuracy | 100,0 % |
| F1 macro | 92,7 % |
| Precisión macro | 94,9 % |
| Recall macro | 90,8 % |

Rendimiento por clase:

| Clase | Soporte | Precisión | Recall | F1 |
|---|--:|--:|--:|--:|
| eliptik | 1565 | 0,974 | 0,987 | 0,980 |
| sarmal | 857 | 0,970 | 0,984 | 0,977 |
| birlesen_bozuk | 251 | 0,878 | 0,801 | 0,838 |
| kenardan_disk | 86 | 0,974 | 0,861 | 0,914 |

No se han publicado comparaciones con otros modelos de clasificación morfológica en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del backbone (YOLO11s-cls, variante "small"), es esperable que quepa en GPUs de consumo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el modelo se distribuye en formato .pt de Ultralytics y puede ejecutarse en CPU, pero no se detallan latencias ni throughput.
- Opciones de despliegue: Ultralytics YOLO (Python), con descarga vía `huggingface_hub`. No se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp o TGI (no aplicables a un modelo de clasificación de imágenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, el propio autor cita el trabajo de Walmsley et al. (2022) sobre clasificación morfológica con deep learning en Galaxy Zoo DECaLS, pero no se aportan métricas comparativas directas con este modelo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| galaxy-morphology-decals-yolo11s-cls | no disponible | no aplica (visión, 224 px) | Top-1 96,6 %, F1 macro 92,7 % | AGPL-3.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo se entrenó y validó con galaxias "claras" (fracción de votos de voluntarios ≥ 0,8). En galaxias ambiguas del cielo real el rendimiento será inferior al reportado, y el modelo siempre asignará una de las cuatro clases aunque la imagen no sea concluyente.
- La clase `birlesen_bozuk` (fusión/perturbada) es la más débil: recall 0,801 y F1 0,838. Las galaxias con barra o lenticulares no se contemplan como clases separadas.
- Solo se ha validado con recortes DECaLS DR5 de 256 px y a una escala aproximadamente uniforme; con otras misiones, resoluciones o estilos de imagen la precisión puede degradarse.
- Las etiquetas internas del modelo están en turco, lo que exige un mapeo explícito a otros idiomas y puede inducir errores si se asume su significado.
- Licencia AGPL-3.0 heredada de Ultralytics YOLO11: cualquier uso o redistribución debe cumplir las obligaciones de esta licencia, incluida la disponibilidad del código fuente en servicios en red. Además, la licencia CC BY 4.0 de los datos de entrenamiento exige mantener la atribución a Galaxy Zoo DECaLS, Walmsley et al. (2022) y Legacy Surveys.
- Modelo orientado a investigación: el propio autor advierte que no debe usarse de forma aislada para generar catálogos científicos.
- Riesgo de alucinación en el sentido de clasificaciones forzadas: al ser un clasificador cerrado de cuatro clases, siempre emitirá una predicción aunque la imagen no corresponda a una galaxia o sea de morfología no contemplada.
- No se documentan sesgos demográficos ni de otro tipo más allá de los derivados de la selección de la muestra (galaxias claras, DECaLS DR5).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/galaxy-morphology-decals-yolo11s-cls
- Dataset Galaxy Zoo DECaLS (Zenodo 4573248): https://zenodo.org/record/4573248
- Artículo de referencia: Walmsley, M. et al. (2022), "Galaxy Zoo DECaLS: Detailed visual morphology measurements from volunteers and deep learning for 314,000 galaxies", MNRAS 509(3), 3966-3988, doi:10.1093/mnras/stab2093
- Legacy Surveys (acknowledgment): https://www.legacysurvey.org/acknowledgment/
- Ultralytics YOLO (repositorio y documentación): https://github.com/ultralytics/ultralytics
