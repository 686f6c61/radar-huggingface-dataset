# songhieng/anpr-sea-dfine-n-detection-baseline

## Resumen

D-FINE-N detection-only baseline es un modelo de detección de matrículas de vehículos (ANPR, *Automatic Number Plate Recognition*) desarrollado por el usuario songhieng y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un *baseline* parcial de la arquitectura D-FINE en su variante más pequeña (N), entrenado específicamente para localizar matrículas en imágenes del sudeste asiático (Camboya, Tailandia y Vietnam) junto con fuentes auxiliares como CCPD y Open Images. El modelo prescinde de la cabeza de *keypoints* o esquinas (*corner head*), por lo que su función es únicamente la detección de la caja delimitadora de la matrícula.

El modelo es explícitamente un *proof of concept* y no está listo para producción: el autor detuvo el entrenamiento tras 3 de las 8 épocas previstas, con unas 1,5–2 horas de cómputo sobre un subconjunto de 10.432 imágenes del dataset `songhieng/anpr-sea-license-plates`. Parte de pesos preentrenados en COCO y se distribuye como un *checkpoint* de PyTorch (`last.pth`) que requiere el código fuente del repositorio de entrenamiento y una revisión concreta de D-FINE (`956d1709`).

Su relevancia es acotada pero útil: sirve como referencia reproducible para quien quiera construir un pipeline ANPR en la región SEA, comparar el efecto de añadir la cabeza de esquinas o validar el dataset asociado. No debe confundirse con un modelo final: los propios resultados del autor reflejan un rendimiento moderado (AP 0,667) y una tasa de falsos positivos del 27,2 % sobre imágenes negativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE (variante N, *detection-only*, sin cabeza de esquinas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch `last.pth`) |
| Idiomas soportados | no aplica (detección visual; entrenado con matrículas de Camboya, Tailandia y Vietnam) |
| Licencia | Apache 2.0 (con advertencia sobre licencias de los datos de entrenamiento) |
| Formato de pesos | PyTorch (`.pth`, contiene modelo + EMA + optimizador, reanudable) |

## Arquitectura y entrenamiento

El modelo se basa en D-FINE, un detector de objetos *transformer-based* que reformula la regresión de cajas como un problema de distribución (*Fine-grained Distribution Refinement*) y aplica *self-distillation* para refinar las predicciones. En esta variante se emplea el tamaño "n" (el más pequeño de la familia) y se elimina la cabeza de *keypoints*, de modo que la red solo predice cajas delimitadoras de matrícula. El autor parte de pesos preentrenados en COCO y realiza *fine-tuning* sobre el dataset `songhieng/anpr-sea-license-plates`.

El entrenamiento se detuvo tras 3 de 8 épocas, sobre un subconjunto de 10.432 imágenes que combina matrículas de Camboya, Tailandia y Vietnam con CCPD (China) y Open Images, además de imágenes negativas (sin matrícula). La supervisión de esquinas se realizó sobre 2.224 matrículas con esquinas anotadas manualmente o mediante polígonos del dataset, sin etiquetas SAM. No se documenta uso de RLHF/DPO (no aplica) ni innovaciones adicionales más allá de las propias de D-FINE. El autor advierte que los datos de entrenamiento incluyen fuentes con licencias propias (por ejemplo, CCPD es solo para investigación), lo que condiciona cualquier uso comercial.

## Capacidades

- Detección de matrículas de vehículos en imágenes mediante cajas delimitadoras.
- Entrenado específicamente con matrículas de Camboya, Tailandia y Vietnam, con apoyo de CCPD (China) y Open Images.
- Manejo de imágenes negativas (sin matrícula), aunque con tasa de falsos positivos documentada del 27,2 %.
- No incluye cabeza de esquinas ni *keypoints*: no estima orientación ni las cuatro esquinas de la matrícula.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la detección visual.

## Casos de uso

- Prototipado de pipelines ANPR en el sudeste asiático: el modelo puede usarse como primer estadio de detección de matrícula antes de un OCR específico, aprovechando que está entrenado con matrículas de Camboya, Tailandia y Vietnam.
- Investigación comparativa sobre D-FINE: sirve como referencia para medir la mejora que aporta añadir la cabeza de esquinas frente a un *baseline* puramente de detección.
- Validación del dataset `songhieng/anpr-sea-license-plates`: permite comprobar la calidad y dificultad del conjunto antes de invertir en un entrenamiento completo.
- Docencia y experimentación: al ser un *checkpoint* pequeño (repo de 0,1 GB) y reanudable (`last.pth` incluye optimizador), es adecuado para demostrar el flujo de *fine-tuning* de D-FINE en un curso o tutorial.
- Generación de candidatos para anotación: las detecciones pueden servir como preanotaciones en herramientas de etiquetado, con revisión humana obligatoria dado el 27,2 % de falsos positivos en imágenes negativas.
- Pruebas de integración en sistemas de control de accesos o peajes: útil para validar el comportamiento del detector en condiciones reales antes de sustituirlo por un modelo completo y entrenado a 8 épocas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluación parcial, 3 de 8 épocas):

| Métrica | Valor |
|---|---|
| Test AP / AP50 | 0,667 / 0,916 |
| AR@100 | 0,791 |
| Tasa de falsos positivos en imágenes negativas | 0,272 |
| Error mediano de esquina (esquinas de caja) | 9,9 % |
| Épocas completadas | 3 / 8 |

No se han publicado comparaciones con otros modelos en la información disponible. La latencia se omite porque se midió en un host cargado y no es fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB, incluyendo optimizador y EMA) el *checkpoint* es muy ligero y probablemente quepa en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del *checkpoint* sugiere que sí, pero el autor no lo documenta.
- Opciones de despliegue: el autor solo documenta carga vía PyTorch (`torch.load` sobre `last.pth` con `weights_only=True`) usando el código de `src/dfine_kpt.py` del repositorio de entrenamiento y D-FINE en el commit `956d1709`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles (el autor los omite explícitamente por medición no fiable).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos ANPR en la información proporcionada. Como referencia cualitativa, este *baseline* se sitúa en la categoría de detectores D-FINE de tamaño "n" para matrículas, pero su entrenamiento parcial (3/8 épocas) impide una comparación rigurosa con alternativas como YOLOv8/YOLOv11 en tareas ANPR o con la variante completa de D-FINE con cabeza de esquinas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-FINE-N detection-only baseline (este) | no disponible | no aplica | AP 0,667 / AP50 0,916 (3/8 épocas) | Apache 2.0 | Hugging Face |
| Alternativas ANPR (YOLO, etc.) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo explícitamente marcado como *proof of concept* y no listo para producción.
- Entrenamiento incompleto: solo 3 de 8 épocas, lo que limita el rendimiento y la robustez.
- Tasa de falsos positivos del 27,2 % sobre imágenes negativas: inaceptable en muchos escenarios reales sin filtrado posterior.
- Error mediano de esquina del 9,9 % (relativo al tamaño de la matrícula) incluso en el caso de esquinas de caja; no hay cabeza de esquinas real.
- Sesgos geográficos: entrenado principalmente con matrículas de Camboya, Tailandia y Vietnam, con apoyo de CCPD (China) y Open Images; el rendimiento en otras regiones no está caracterizado.
- Restricciones de licencia: aunque el modelo es Apache 2.0, los datos de entrenamiento incluyen fuentes con licencias propias (CCPD es solo para investigación), por lo que el uso comercial requiere revisar la *dataset card*.
- Dependencia del código fuente del repositorio de entrenamiento y de un commit concreto de D-FINE (`956d1709`); no es un modelo autónomo cargable con `transformers`.
- No se documentan sesgos demográficos ni de otro tipo más allá de la cobertura geográfica.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí de detecciones espurias en imágenes sin matrícula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songhieng/anpr-sea-dfine-n-detection-baseline
- Dataset asociado: https://huggingface.co/datasets/songhieng/anpr-sea-license-plates
- Repositorio de D-FINE (referencia, commit `956d1709`): no se proporciona URL en la información disponible.
- Informe de evaluación completo (`reports/eval_baseline_partial.md`): incluido en el repositorio del modelo, no se proporciona URL directa.
