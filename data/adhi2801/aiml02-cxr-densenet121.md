# Adhi2801/aiml02-cxr-densenet121

## Resumen

aiml02-cxr-densenet121 es un clasificador binario de opacidad pulmonar en radiografías de tórax frontales, desarrollado por Adhi2801 como prototipo educativo dentro de un proyecto de imagen médica. Se basa en DenseNet-121 preentrenado en ImageNet (torchvision) con una cabeza de una sola logit, recibe imágenes en escala de grises de 384×384 píxeles replicadas a tres canales y produce una probabilidad calibrada de "Lung Opacity" frente a "Normal / No Lung Opacity".

El modelo se entrenó sobre el RSNA Pneumonia Detection Challenge (2018), un conjunto de 26.684 radiografías frontales de tórax procedentes de la colección NIH ChestX-ray14 y reanotadas por radiólogos. Incluye post-procesado de calibración por temperature scaling y un umbral óptimo de Youden ajustado en validación, además de mapas de explicabilidad Grad-CAM sobre el último bloque denso.

Su relevancia es doble: por un lado sirve como ejemplo reproducible de un flujo "AI-in-the-loop" en radiología (sugerencia de triaje, explicación visual, firma humana y auditoría); por otro, la model card documenta con inusual rigor las limitaciones del modelo, incluidos atajos por posición de la vista (AP frente a PA), brechas de rendimiento en pacientes de 60 años o más y la necesidad de líneas base sin píxeles. No es un dispositivo médico ni está aprobado por ningún regulador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (torchvision, preentrenado en ImageNet) con cabeza de una sola logit |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada de imagen; etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | `classifier.pt` (state dict de PyTorch) y `calibration.json` |
| Entrada | Imagen 384×384 en escala de grises replicada a 3 canales |
| Tarea | Clasificación binaria de opacidad pulmonar |
| Post-procesado | Temperature scaling (T = 1.29) y umbral de Youden (0.317) |
| Explicabilidad | Grad-CAM sobre el último bloque denso (12×12 a 384 px, upsampling bilineal) |
| Versión | `densenet121-<sha256[:8]>` de los pesos |

## Arquitectura y entrenamiento

La arquitectura es una CNN DenseNet-121 estándar de torchvision, inicializada con pesos de ImageNet y adaptada a una única salida logit para clasificación binaria. La imagen de entrada es una radiografía frontal en escala de grises de 384×384 píxeles replicada a tres canales para encajar con la primera convolución preentrenada. El entrenamiento usó AdamW con scheduler one-cycle, precisión mixta (AMP) y una función de pérdida BCE balanceada por clase (`pos_weight = neg/pos`), con parada temprana sobre AUROC de validación. El mejor checkpoint se alcanzó en la época 8 de 11, con AUROC de validación de 0.891, entrenando en una GPU Kaggle T4.

El conjunto de datos es el RSNA Pneumonia Detection Challenge 2018: 26.684 radiografías frontales de tórax del NIH ChestX-ray14 reanotadas por radiólogos, con etiqueta positiva "Lung Opacity" y negativa "Normal" o "No Lung Opacity / Not Normal". El split es 70/15/15, estratificado por etiqueta y posición de la vista, con una imagen por paciente para evitar fuga de datos entre particiones. Tras el entrenamiento se ajustaron temperature scaling y umbral de Youden sobre validación, y se evaluó la localización de Grad-CAM contra cajas de radiólogos mediante pointing game e IoU.

## Capacidades

- Clasificación binaria de opacidad pulmonar en radiografías de tórax frontales, con probabilidad calibrada.
- Generación de mapas de calor Grad-CAM sobre el último bloque denso como ayuda visual a la revisión.
- Salida de versión del modelo (`densenet121-<sha256[:8]>`) en cada resultado y entrada de auditoría.
- Umbral de decisión y temperatura de calibración configurables mediante `calibration.json`.
- Integración en pipelines PyTorch mediante `medimg.models.classifier.load_checkpoint`.
- Evaluación por subgrupos (sexo, edad, vista AP/PA) documentada en `reports/subgroups.csv`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general; es un clasificador de imagen específico de dominio.

## Casos de uso

- Docencia en imagen médica: el modelo sirve para demostrar un flujo completo de IA en radiología (predicción, calibración, Grad-CAM, umbral y auditoría) en cursos y talleres, gracias a su licencia MIT y a la disponibilidad del código en GitHub.
- Investigación en explicabilidad: permite estudiar la relación entre mapas Grad-CAM y cajas de radiólogos (pointing game 0.544, IoU 0.237) y comparar variantes de arquitectura o resolución de entrada.
- Estudio de sesgos por subgrupo: la documentación por sexo, edad y vista AP/PA facilita analizar brechas de rendimiento (por ejemplo, AUROC 0.816 en mayores de 60 frente a 0.909 en menores de 40) y diseñar mitigaciones.
- Prototipado de triaje asistido: con sensibilidad 0.839 y especificidad 0.759 en el umbral 0.317, puede usarse como ejemplo de sistema de priorización con firma humana obligatoria, nunca como decisión autónoma.
- Análisis de atajos de adquisición: la inclusión de una línea base solo-metadatos (AUROC 0.725) permite comparar el modelo de imagen (0.882) y verificar si aprende hallazgos pulmonares o artefactos de la vista.
- Evaluación de calibración: con ECE 0.073 antes y 0.071 después de temperature scaling, sirve como caso práctico para estudiar técnicas de calibración en modelos médicos.
- Integración en demos interactivas: el Space de Hugging Face (cxr-opacity-gradcam) muestra cómo desplegar el clasificador con Grad-CAM en una interfaz web para revisión humana.

## Benchmarks y rendimiento

Evaluación sobre el split de test reservado: 4.003 imágenes, 22,5 % positivas.

| Métrica | Valor |
|---|---|
| AUROC (IC 95 % bootstrap) | 0.882 (0.870 – 0.894) |
| AUPRC (azar = 0.225) | 0.699 |
| Sensibilidad / especificidad en umbral 0.317 | 0.839 / 0.759 |
| PPV / NPV | 0.503 / 0.942 |
| ECE antes → después de temperature scaling (T = 1.29) | 0.073 → 0.071 |
| Brier tras calibración | 0.119 |
| Grad-CAM pointing game / IoU medio vs cajas de radiólogo | 0.544 / 0.237 |
| Línea base solo vista / vista + sexo + edad (sin píxeles) | 0.707 / 0.725 |

| Subgrupo | n | Prevalencia | AUROC (IC 95 %) | Sens / Spec |
|---|---|---|---|---|
| Mujer | 1.672 | 0.21 | 0.892 (0.875 – 0.908) | 0.84 / 0.77 |
| Hombre | 2.331 | 0.24 | 0.875 (0.859 – 0.890) | 0.84 / 0.75 |
| Edad < 40 | 1.321 | 0.27 | 0.909 (0.893 – 0.924) | 0.87 / 0.78 |
| Edad 40–59 | 1.702 | 0.21 | 0.889 (0.870 – 0.905) | 0.85 / 0.77 |
| Edad 60+ | 980 | 0.20 | 0.816 (0.787 – 0.848) | 0.75 / 0.73 |
| Vista AP | 1.826 | 0.38 | 0.838 (0.820 – 0.855) | 0.91 / 0.54 |
| Vista PA | 2.177 | 0.09 | 0.862 (0.837 – 0.884) | 0.58 / 0.88 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; DenseNet-121 a 384×384 es un modelo pequeño y cabe holgadamente en GPUs de consumo (estimación orientativa, no publicada por el autor).
- GPU recomendadas: el autor entrenó en una Kaggle T4; para inferencia es suficiente cualquier GPU con al menos unos pocos GB de VRAM, incluidas RTX 3060, RTX 4090 o T4.
- Cabe en GPU de consumo: sí, por el tamaño reducido de DenseNet-121 y la resolución de entrada.
- Opciones de despliegue: PyTorch nativo mediante `medimg.models.classifier.load_checkpoint`; también es viable exportar a TorchScript u ONNX para servir con FastAPI, TorchServe o similar. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | AUROC test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aiml02-cxr-densenet121 | DenseNet-121 | no disponible | 384×384 gris | 0.882 | MIT | Hugging Face + GitHub |
| Línea base solo metadatos (mismo proyecto) | Regresión logística | no disponible | vista, sexo, edad | 0.725 | MIT | Incluida en el repo |
| Otros clasificadores de opacidad RSNA | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados en la información proporcionada para comparar con clasificadores externos de opacidad pulmonar (por ejemplo, variantes de CheXNet o modelos tipo ConvNeXt en RSNA); la única comparación documentada es con la línea base sin píxeles del propio proyecto.

## Limitaciones y advertencias

- No es un dispositivo médico ni está aprobado por ningún regulador; uso clínico fuera de alcance. Solo para docencia y demostración.
- Atajo por posición de la vista: las películas AP (portátiles, pacientes más graves) tienen mayor prevalencia de opacidad y el modelo puede aprender señales de adquisición en lugar de hallazgos pulmonares. Mitigado con split estratificado, métricas por vista y línea base sin píxeles, pero no eliminado.
- Fuente única de datos (NIH Clinical Center, un solo sistema hospitalario estadounidense); se espera caída de rendimiento en otros escáneres, poblaciones y protocolos. No hay validación externa (CLAIM 2024).
- Ruido de etiquetas: las etiquetas provienen de lecturas radiológicas sin correlación clínica, y "Lung Opacity" incluye edema, atelectasia, hemorragia y otras causas además de neumonía.
- Sesgo demográfico: solo se registran sexo y edad; no hay datos de raza/etnia, por lo que la equidad entre esos grupos no puede medirse.
- Brecha por edad: AUROC 0.816 en mayores de 60 (IC 0.787 – 0.848), sin solapamiento con el grupo de menores de 40; requiere análisis de errores antes de cualquier uso en ese segmento.
- Umbral único inadecuado para ambas vistas: sensibilidad 0.91 en AP frente a 0.58 en PA con prevalencia del 9 %; se recomienda umbral por vista o reportar explícitamente el compromiso.
- Grad-CAM no es causal: el pico del mapa cae dentro de una caja de radiólogo solo en el 54 % de las imágenes positivas; el mapa es ayuda de revisión, no un hallazgo.
- Deriva de calibración: la temperatura se ajusta sobre validación en distribución; puede degradarse con cambios de dominio.
- Riesgo de alucinación y falsos positivos/negativos: PPV de 0.503 en el umbral elegido implica que aproximadamente la mitad de las predicciones positivas son falsas en este conjunto.
- Licencia MIT permite uso comercial del código y pesos, pero la advertencia de no uso clínico y las limitaciones documentadas deben respetarse en cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adhi2801/aiml02-cxr-densenet121
- Demo (Space): https://huggingface.co/spaces/Adhi2801/cxr-opacity-gradcam
- Código, entrenamiento y evaluación: https://github.com/adhi2801/aiml-02-medical-imaging
- Dataset RSNA Pneumonia Detection Challenge (2018): no disponible enlace directo en la información proporcionada
- Paper de referencia sobre atajo de vista en clasificadores de neumonía: no disponible enlace en la información proporcionada
