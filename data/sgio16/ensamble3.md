# SGio16/Ensamble3

## Resumen

Ensamble3 es un conjunto de tres checkpoints de detección de objetos basados en RF-DETR-Medium, desarrollado por SGio16 (Giorgio Chiesa) para la categoría 1 del reto MICCAI SurgVU 2026: detección de *clevis* y clasificación de instrumentos en vídeo quirúrgico asistido por robot. El modelo resuelve el problema de localizar y clasificar hasta 14 tipos de instrumentos quirúrgicos (pinzas, grapadoras, tijeras, aspiradores, etc.) en fotogramas de cirugía robótica, una tarea crítica para el análisis automatizado de procedimientos y el desarrollo de sistemas de asistencia quirúrgica.

Los tres checkpoints comparten arquitectura (RF-DETR-Medium, entrada de 576x576, 14 clases) y esquema de entrenamiento; difieren únicamente en el preentrenamiento externo de la primera etapa, lo que los hace complementarios para el ensamblado. La inferencia combina los tres mediante *weighted box fusion* con IoU 0.55 y aumento de test por volteo horizontal, generando seis pasadas por fotograma. El ensamblado alcanzó 0.5385 mAP en el conjunto de test de la fase final del reto, quedando en tercera posición.

El modelo es relevante por su enfoque práctico en detección en tiempo real sobre vídeo quirúrgico, un dominio con escasez de anotaciones y alta variabilidad visual. Su diseño prioriza el recall sobre la precisión, una decisión deliberada que maximiza la métrica de *average precision* y que conviene entender antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR-Medium (Detection Transformer con búsqueda de arquitectura neuronal) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (detección de objetos por fotograma) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (visión por computador) |
| Licencia | no establecida por los autores; uso sujeto al acuerdo de datos SurgVU con los organizadores del reto |
| Formato de pesos | `.pth` (PyTorch), tres checkpoints de 127,7 MB cada uno |

## Arquitectura y entrenamiento

RF-DETR es un transformer de detección en tiempo real cuya arquitectura se optimizó mediante búsqueda de arquitectura neuronal (NAS), según el paper arXiv:2511.09554. Los tres checkpoints emplean entrada de 576x576 píxeles y predicen 14 clases de instrumentos quirúrgicos. La única diferencia entre ellos es el preentrenamiento externo de la primera etapa: `clevis_sarrarp.pth` usa muñeca de SAR-RARP50 con 1 clase y 19 épocas de ajuste fino; `clevis_mixA.pth` usa EndoVis 2018 más SAR-RARP50 con 1 clase y 19 épocas; `clevis_mixC.pth` usa muñeca más instrumento completo con 2 clases y 14 épocas.

Los datos de entrenamiento combinan siete vídeos anotados del reto (11.323 cajas) con un corpus pseudo-etiquetado de 10.486 fotogramas y 23.033 cajas, generado a partir de material SurgVU sin anotar. El corpus se admitió mediante dos filtros independientes: un umbral mínimo de confianza de detección de 0,20 y una comprobación de consistencia exacta de multiconjunto contra el registro de instrumentos instalados en quirófano; posteriormente se corrigieron a mano 6.569 fotogramas. La innovación técnica destacable es la estrategia de fusión: *weighted box fusion* (Solovyev et al., 2021) a IoU 0,55 más aumento de test por volteo horizontal, con seis pasadas por fotograma. Un miembro individual alcanza como máximo 0,6288 mAP; el trío sube a 0,6414.

## Capacidades

- Detección de objetos en vídeo quirúrgico asistido por robot, con cajas delimitadoras y clase por instrumento.
- Clasificación en 14 categorías de instrumentos: pinza de agarre de retractor, pinzas Cadiere, pinzas bipolares, force bipolar, aplicador de clips, grapadora, gancho de cauterio permanente, tijera curva monopolar, sellador de vasos, pinza fenestrada con punta hacia arriba, disector bipolar, portagujas, pinzas Prograsp y aspirador-irrigador.
- Detección de *clevis* (componente de acoplamiento del instrumento) como tarea específica del reto.
- Procesamiento fotograma a fotograma con geometría de predicción de 640x512.
- Ensamblado multi-modelo con fusión ponderada de cajas y aumento de test por volteo.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector puro de visión.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Análisis retrospectivo de cirugías robóticas: el detector permite etiquetar automáticamente los instrumentos presentes en cada fotograma de un vídeo quirúrgico, facilitando la reconstrucción de la línea temporal del procedimiento y la auditoría de uso de instrumental.
- Control de inventario intraoperatorio: la comprobación de consistencia de multiconjunto usada en el entrenamiento se puede replicar en producción para verificar que los instrumentos instalados coinciden con los detectados en vídeo, reduciendo el riesgo de retención de material.
- Supervisión y formación quirúrgica: la detección de instrumentos por fotograma permite generar métricas objetivas de uso (frecuencia, duración, secuencias) para evaluar el desempeño de cirujanos en formación.
- Automatización de anotación de datasets quirúrgicos: el alto recall del ensamblado (0,968 a IoU 0,5) lo hace adecuado como preetiquetador en pipelines de anotación humana, reduciendo el coste de etiquetado manual.
- Investigación en reconocimiento de actividades quirúrgicas: las detecciones por fotograma sirven como entrada a modelos de reconocimiento de fases o pasos del procedimiento, combinando información espacial de instrumentos con secuencias temporales.
- Integración en sistemas de asistencia en quirófano: el detector puede alimentar módulos de aviso o documentación automática que registren qué instrumentos se emplean y cuándo, con latencia compatible con procesamiento casi en tiempo real según el hardware.
- Desarrollo de modelos de segmentación o *tracking*: las cajas detectadas pueden inicializar rastreadores de instrumentos o servir como propuestas de región para segmentación semántica de instrumental.

## Benchmarks y rendimiento

Validación cruzada de siete pliegues *leave-two-out* sobre los siete vídeos publicados del reto, mAP@[.5:.05:.95] con conciencia de clase, a geometría de predicción 640x512:

| Métrica | Valor |
|---|---|
| mAP@[.5:.95] | 0,6414 |
| AP@0,5 | 0,9441 |
| Precisión @ IoU 0,5 | 0,322 |
| Recall @ IoU 0,5 | 0,968 |
| IoU mediana de emparejamientos | 0,854 |
| mAP en test de fase final del reto | 0,5385 (3.ª posición) |

Comparación interna de miembros del ensamblado:

| Configuración | mAP@[.5:.95] |
|---|---|
| Mejor miembro individual | 0,6288 |
| Ensamblado de tres (WBF IoU 0,55 + TTA) | 0,6414 |

Advertencia del autor: la cifra de 0,6414 corresponde a modelos validados cruzadamente sobre un corpus pseudo-etiquetado de 9.814 fotogramas, mientras que los pesos publicados se entrenaron dos días después sobre 10.486 fotogramas. Es una estimación, no una medición directa, y la discrepancia favorece al modelo publicado (más datos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por no aplicar a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Cada checkpoint pesa 127,7 MB en FP32; en FP16 la huella de pesos ronda los 64 MB por modelo, más memoria de activaciones para entrada 576x576.
- GPU recomendadas: no especificadas por el autor. RF-DETR es una familia de detección en tiempo real, por lo que se espera compatibilidad con GPU de consumo modernas; no se dispone de datos concretos de A100, H100 o RTX 4090 en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: la vía soportada es el contenedor Docker del repositorio GitHub (https://github.com/GiorgioChiesa/VuSurg26_Ensamble3), que descarga automáticamente los tres checkpoints. La librería es `rfdetr`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de visión.
- Latencia y throughput: no disponibles. El ensamblado requiere seis pasadas por fotograma (tres modelos por dos aumentos de volteo), lo que multiplica el coste computacional frente a un único detector.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa fiable. Como referencia cualitativa de la misma categoría (detección en vídeo quirúrgico):

| Modelo | Arquitectura | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ensamble3 (este modelo) | RF-DETR-Medium x3 | 14 | 576x576, predicción 640x512 | No establecida; sujeta a acuerdo SurgVU | HuggingFace + GitHub |
| RF-DETR-Medium (base) | RF-DETR | configurable | configurable | según repositorio RF-DETR | Repositorio oficial RF-DETR |
| Alternativas de detección quirúrgica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la información proporcionada resultados comparables de otros equipos del reto SurgVU 2026 más allá de la posición (3.º) y el mAP final (0,5385).

## Limitaciones y advertencias

- Licencia no establecida por los autores: los pesos derivan del dataset SurgVU y cualquier uso queda sujeto al acuerdo de datos con los organizadores del reto. El uso comercial no está autorizado de forma explícita.
- Seis de las catorce categorías (grapadora, gancho de cauterio permanente, pinza fenestrada con punta hacia arriba, disector bipolar, pinzas Prograsp y aspirador-irrigador) no tienen ninguna caja de referencia en la anotación publicada. Se evalúan en el test oculto, pero ninguna métrica local dice nada sobre ellas; sus predicciones deben tratarse con cautela.
- Precisión baja por diseño (0,322 a IoU 0,5): el modelo emite todas las detecciones supervivientes para maximizar el recall. En producción esto genera falsos positivos numerosos que requieren filtrado o umbralización adicional según el caso de uso.
- El post-procesamiento por defecto de la librería de detección costaría 0,0396 mAP según el barrido de 96 puntos del autor; es necesario replicar la configuración exacta del contenedor para obtener el rendimiento declarado.
- La cifra de 0,6414 es una estimación por validación cruzada sobre un corpus pseudo-etiquetado, no una medición de los pesos publicados (entrenados con 10.486 fotogramas frente a los 9.814 de la validación).
- Riesgo de alucinación: en detección se traduce en falsos positivos, especialmente en clases sin anotación de referencia y en fotogramas con oclusión o instrumentos parcialmente visibles.
- Sesgos conocidos: el entrenamiento se limita a siete vídeos del reto SurgVU y a material pseudo-etiquetado del mismo origen; la generalización a otros quirófanos, fabricantes de instrumental, condiciones de iluminación o cámaras no está validada.
- El ensamblado exige seis pasadas por fotograma (tres modelos con aumento de volteo), lo que incrementa el coste de inferencia y la latencia frente a un detector individual.
- No aplica a tareas de texto, razonamiento, código ni multilingüismo; cualquier uso fuera de detección de objetos en vídeo quirúrgico queda fuera de su ámbito.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación independiente por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/SGio16/Ensamble3
- Repositorio GitHub (código de inferencia, Dockerfile y documentación): https://github.com/GiorgioChiesa/VuSurg26_Ensamble3
- Paper SurgVU Dataset (arXiv:2501.09209): https://arxiv.org/abs/2501.09209
- Paper RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper Weighted Boxes Fusion (Solovyev et al., 2021), Image and Vision Computing 107, 104117: no disponible enlace directo en la información proporcionada
- Reto MICCAI SurgVU 2026: no disponible enlace directo en la información proporcionada
