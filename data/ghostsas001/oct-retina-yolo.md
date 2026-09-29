# ghostsas001/oct-retina-yolo

## Resumen

oct-retina-yolo es un clasificador de imágenes de tomografía de coherencia óptica (OCT) retiniana, desarrollado por el usuario de HuggingFace ghostsas001. Distingue cuatro clases: neovascularización coroidea (CNV), edema macular diabético (DME), drusas y retina normal. Está construido con Ultralytics YOLO en su variante de clasificación y se distribuye como pesos `.pt` (yolo.pt) en un repositorio de 0,1 GB.

Su principal aportación no es tanto la arquitectura como la metodología de evaluación: el autor detectó que las carpetas oficiales del conjunto OCT2017 (Kermany et al., 2018) colocan exploraciones del mismo paciente en entrenamiento y test, de modo que 27.693 de las 83.516 imágenes de entrenamiento y validación (un 33 %) provienen de pacientes presentes en el test. Este modelo se entrenó eliminando esos pacientes y se validó con pacientes retenidos, lo que permite una estimación de rendimiento más honesta que la habitual en la literatura sobre este dataset.

El resultado declarado es un 96,49 % de exactitud y un 96,51 % de F1 macro sobre el conjunto de test oficial (968 exploraciones), entrenando con una única GPU NVIDIA T4. Es un modelo de investigación, no un dispositivo médico, y su licencia efectiva queda restringida a uso no comercial por la combinación de AGPL-3.0 en los pesos y CC BY-NC-SA 4.0 en los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO en variante de clasificación (versión concreta no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen con resolución de entrenamiento de 224 px |
| Tipos de cuantizacion | no disponible (la model card solo documenta pesos `.pt`; no se publican versiones cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés: CNV, DME, DRUSEN, NORMAL) |
| Licencia | AGPL-3.0 en los pesos; datos de entrenamiento CC BY-NC-SA 4.0, por lo que el uso queda limitado a fines no comerciales |
| Formato de pesos | PyTorch (`.pt`), cargable con la librería Ultralytics |
| Tarea | Clasificación de imagen multiclase (4 clases) |
| Clases | CNV, DME, DRUSEN, NORMAL |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | image-classification |

## Arquitectura y entrenamiento

Se trata de un clasificador basado en la familia Ultralytics YOLO, empleada aquí en su cabeza de clasificación en lugar de detección. La model card no especifica la variante exacta (por ejemplo, YOLOv8-cls o YOLO11-cls) ni el número de parámetros, por lo que no es posible detallar la profundidad de la red ni el bloque de extracción de características. La receta de entrenamiento procede de un proyecto previo de clasificación de glóbulos blancos y se reutilizó sin ningún ajuste específico para imagen médica.

Los datos de entrenamiento son un subconjunto de OCT2017 con un máximo de 4.000 exploraciones por clase (15.310 en total), del que se eliminaron todas las imágenes pertenecientes a pacientes del conjunto de test. El entrenamiento constó de 50 épocas a 224 px de resolución, con batch de 64 y el aumento de datos por defecto de Ultralytics, sobre una única NVIDIA T4. La validación se hizo con 6.026 exploraciones de pacientes retenidos y el test se evaluó una sola vez sobre el conjunto oficial de 968 imágenes. No se documenta uso de RLHF, DPO ni técnicas de ajuste por preferencias, algo esperable en un modelo de visión. La innovación destacable es metodológica: la deduplicación por paciente identificando el id en el nombre de archivo (`CNV-1016042-1.jpeg` → 1016042).

## Capacidades

- Clasificación de imagen en cuatro clases de OCT retiniano: CNV, DME, drusas y normal.
- Salida de probabilidades por clase mediante la interfaz de Ultralytics (`result.probs.top1` y el vector completo de probabilidades), lo que permite aplicar umbrales propios en lugar de aceptar siempre la clase más probable.
- Inferencia a 224 px, lo que mantiene el coste computacional muy bajo.
- Ejecución sobre CPU o GPU de gama baja, dado el reducido tamaño del repositorio.
- Carga directa desde HuggingFace Hub con `hf_hub_download` e integración en el ecosistema Ultralytics (`model.predict`).
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No procesa visión general: está especializado exclusivamente en el dominio OCT retiniano y en el protocolo de adquisición de OCT2017.

## Casos de uso

- Triaje previo en investigación oftalmológica: dado un volumen de exploraciones OCT, el modelo puede ordenarlas por probabilidad de CNV o DME para que el investigador priorice la revisión manual de los casos sospechosos, con un coste de inferencia mínimo por imagen.
- Curado y auditoría de datasets: sirve como clasificador de referencia para detectar etiquetas mal asignadas o imágenes atípicas dentro de OCT2017 o de conjuntos derivados.
- Reproducción y docencia en evaluación de modelos médicos: permite ilustrar en un aula o artículo cómo la fuga de datos por paciente infla las métricas, comparando este modelo con resultados obtenidos sobre el split oficial sin deduplicar.
- Prototipado en despliegue sanitario de borde: por su tamaño reducido puede ejecutarse en un equipo de sobremesa o en una GPU integrada dentro de un prototipo de estación de revisión, sin depender de infraestructura en la nube.
- Componente de un pipeline de preanotación: integrado con Ultralytics, puede generar etiquetas preliminares sobre nuevas exploraciones que después se corrigen manualmente, reduciendo el tiempo de anotación.
- Validación de generalización entre dispositivos: al ser un modelo pequeño y con una receta reproducible, es un punto de partida útil para medir cuánto cae la exactitud al pasar de OCT2017 a escáneres o protocolos distintos.
- Prueba de concepto de clasificación médica con librerías de visión estándar: sirve para evaluar el flujo completo de Ultralytics (entrenamiento, validación, exportación) en un problema clínico realista.

En todos los casos debe tenerse presente que es un modelo de investigación y no un producto sanitario.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test oficial de OCT2017, compuesto por 968 exploraciones y evaluado una sola vez:

| Metrica | Valor |
|---|---|
| Accuracy (test oficial, 968 exploraciones) | 96,49 % |
| F1 macro | 96,51 % |
| Recall CNV | 242 / 242 |
| Recall NORMAL | 242 / 242 |
| Recall DME | 232 / 242 |
| Recall DRUSEN | 218 / 242 |

Todos los errores de la clase drusas se clasificaron como CNV, según la model card. El autor no publica intervalos de confianza ni resultados de una segunda ejecución.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La model card aporta además un dato relevante sobre el propio dataset: 27.693 de las 83.516 imágenes de entrenamiento y validación (33 %) pertenecen a pacientes que también aparecen en el test oficial, lo que invalida las comparaciones directas con resultados que no hayan aplicado esa deduplicación.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 a 224 px; el repositorio completo ocupa 0,1 GB, por lo que el peso de los pesos es muy inferior a esa cifra. No se publica un desglose exacto de parámetros.
- GPU de entrenamiento declarada: una NVIDIA T4 (16 GB), suficiente para 50 épocas con batch 64 a 224 px sobre 15.310 imágenes.
- GPU recomendadas para entrenamiento: cualquier GPU con 16 GB o más (T4, V100, A100, RTX 4090). Para inferencia basta una GPU integrada o una GPU de gama de entrada.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas, dado el reducido tamaño del modelo.
- Ejecución en CPU: viable para inferencia unitaria o por lotes pequeños, aunque no se documentan latencias.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería Ultralytics en Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de imagen. No se publican pesos en ONNX, TensorRT, OpenVINO u otros formatos.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio completo requiere 0,1 GB.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones numéricas con otros clasificadores de OCT retiniano, y no se ha proporcionado información adicional sobre alternativas evaluadas bajo el mismo protocolo de deduplicación por paciente, que es precisamente el requisito para que una comparación sea válida.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oct-retina-yolo (ghostsas001) | no disponible | imagen 224 px, 4 clases | 96,49 % accuracy, 96,51 % F1 macro sobre test oficial deduplicado | AGPL-3.0 (uso no comercial por los datos) | HuggingFace, pesos `.pt` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia contextual, el artículo original de Kermany et al. (Cell, 2018) introdujo el dataset OCT2017, pero no se dispone aquí de sus cifras bajo un protocolo equivalente, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Modelo de investigación, no dispositivo médico. No ha pasado validación clínica ni regulatoria (CE, FDA) y no debe usarse para diagnóstico.
- Sesgo de dominio: entrenado exclusivamente con exploraciones del release OCT2017; otros dispositivos, protocolos de adquisición o poblaciones pueden degradar la exactitud de forma no cuantificada.
- Una única ejecución de entrenamiento y sin intervalos de confianza: la cifra de 96,49 % no viene acompañada de estimación de variabilidad.
- Confusión sistemática entre drusas y CNV: 24 de las 242 drusas del test se clasificaron como CNV, el único tipo de error observado.
- Riesgo de falsos negativos no caracterizado en despliegues reales; el modelo devuelve probabilidades, pero la model card no analiza umbrales ni curvas ROC.
- No se documenta composición demográfica del dataset, por lo que no puede evaluarse equidad entre subpoblaciones.
- No hay soporte multilingüe ni de texto: las etiquetas están en inglés (CNV, DME, DRUSEN, NORMAL).
- Restricciones de licencia: los pesos se distribuyen bajo AGPL-3.0, heredada de Ultralytics, y los datos de entrenamiento están bajo CC BY-NC-SA 4.0. El uso comercial de estos pesos no está permitido.
- La AGPL-3.0 implica obligaciones de copyleft si el modelo se integra en un servicio en red.
- No se publican versiones cuantizadas ni formatos de exportación alternativos, lo que limita su integración en runtimes distintos de Python/Ultralytics.
- El aviso del autor sobre la fuga de datos del dataset es relevante para cualquiera que compare este modelo con resultados publicados previamente: muchas cifras de la literatura sobre OCT2017 no son directamente equiparables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghostsas001/oct-retina-yolo
- Repositorio con el análisis completo: https://github.com/Elghoudani/oct-retina-classification
- Articulo de referencia del dataset (Kermany et al., Cell 2018): https://doi.org/10.1016/j.cell.2018.02.010
- Dataset OCT2017 (release de Kaggle): https://www.kaggle.com/datasets/paultimothymooney/kermany2018
- Documentacion de Ultralytics YOLO: https://docs.ultralytics.com
