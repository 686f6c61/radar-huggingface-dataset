# hg-0403/PULSE

## Resumen

PULSE es un modelo de segmentación de imágenes médicas desarrollado por el BRAIN Lab (Hania Ghouse, Maryam Alsharqi, Farhad Nezami y Muzammil Behzad) y publicado en el IEEE Journal of Biomedical and Health Informatics (JBHI) en 2026. Su propósito es unificar en una sola pasada tres tareas clínicas sobre resonancia magnética cardíaca (CMR) de eje corto: la segmentación ventricular (ventrículo derecho, miocardio y ventrículo izquierdo), el diagnóstico a nivel de paciente de miocardiopatía y la generación de un informe clínico estructurado. El modelo combina un encoder DINOv2 ViT-B/14 con un decoder DPT (Dense Prediction Transformer) para la segmentación, y un Random Forest que opera sobre un vector de 23 biomarcadores derivados de las máscaras predichas para el diagnóstico. El informe se genera mediante plantillas deterministas. El repositorio publica los pesos de un ensemble de 5 folds.

La relevancia de PULSE radica en que aborda de forma integrada la segmentación y el diagnóstico cardíaco, algo que normalmente se resuelve con pipelines separados. Además, demuestra capacidad de adaptación cross-modality con pocos ejemplos (few-shot) y comportamiento zero-shot en otros datasets de CMR, lo que facilita su adopción en entornos clínicos con datos limitados. El modelo está liberado bajo licencia MIT, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DINOv2 ViT-B/14 + decoder DPT (Dense Prediction Transformer) con deep supervision; Random Forest para diagnóstico; plantillas deterministas para informe |
| Parametros totales | No disponible (estimado ~100M por fold, basado en el tamaño del checkpoint de ~380 MB por fold) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de imágenes médicas, no texto) |
| Tipos de cuantizacion | No disponible (pesos en formato PyTorch nativo, probablemente FP32) |
| Idiomas soportados | No aplica (modelo de visión médica, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pth (checkpoints por fold) |

## Arquitectura y entrenamiento

PULSE emplea una arquitectura híbrida para tareas múltiples. La rama de segmentación utiliza un encoder DINOv2 ViT-B/14 preentrenado como extractor de características, seguido de un decoder DPT que produce máscaras densas para tres clases: ventrículo derecho (RV), miocardio y ventrículo izquierdo (LV). La deep supervision se aplica durante el entrenamiento para mejorar la convergencia. Sobre las máscaras predichas se calcula un vector de 23 biomarcadores clínicos (volúmenes, fracción de eyección, masas, etc.), que alimenta un Random Forest entrenado para clasificar la miocardiopatía a nivel de paciente. El informe clínico se genera mediante una plantilla determinista que combina los biomarcadores y el diagnóstico. El modelo se publica como un ensemble de 5 folds, promediando las predicciones de los cinco checkpoints.

No se proporcionan detalles específicos sobre el dataset de entrenamiento, el número de épocas, la función de pérdida o el proceso de optimización. Los benchmarks reportados sugieren que el entrenamiento se realizó sobre el dataset ACDC (Automated Cardiac Diagnosis Challenge) y se evaluó la transferencia a otros conjuntos como M&Ms-2, Sunnybrook y CAMUS. No se menciona el uso de técnicas como RLHF o DPO, que no aplican a este tipo de modelo de visión.

## Capacidades

- Segmentación multiclase de estructuras cardíacas en resonancia magnética de eje corto: ventrículo derecho, miocardio y ventrículo izquierdo.
- Diagnóstico automático de miocardiopatía a nivel de paciente mediante un clasificador Random Forest entrenado sobre biomarcadores derivados de las máscaras.
- Generación de informes clínicos estructurados basados en plantillas deterministas, combinando los biomarcadores calculados y el diagnóstico.
- Adaptación few-shot a nuevos dominios o modalidades de imagen (demostrado en CAMUS con solo 20 ejemplos).
- Comportamiento zero-shot en datasets externos de CMR (M&Ms-2 y Sunnybrook) sin reentrenamiento.
- Inferencia en una sola pasada: dado un estudio de CMR, produce simultáneamente máscaras, diagnóstico y informe.
- No incluye capacidades de procesamiento de lenguaje natural, generación de código, razonamiento simbólico ni visión general fuera del ámbito cardíaco.

## Casos de uso

- Diagnóstico asistido de miocardiopatía en cardiología: el modelo procesa un estudio de CMR y devuelve las máscaras segmentadas junto con un diagnóstico clasificado (p. ej., dilatado, hipertrófico, etc.), lo que permite al clínico contrastar rápidamente la decisión automática con su evaluación.
- Segmentación automática de ventrículos para cálculo de volúmenes y fracción de eyección: las máscaras generadas se utilizan para cuantificar parámetros funcionales cardíacos, sustituyendo la delineación manual que consume tiempo.
- Adaptación a protocolos de imagen locales con pocos ejemplos: un hospital con un nuevo protocolo de adquisición puede ajustar PULSE con 20-50 casos anotados (few-shot) y obtener una segmentación fiable sin necesidad de reentrenar desde cero.
- Análisis de grandes cohortes en investigación clínica: la inferencia en una sola pasada permite procesar miles de estudios de CMR para estudios epidemiológicos o ensayos clínicos, generando biomarcadores consistentes y diagnósticos automatizados.
- Integración en pipelines de radiología para informes estructurados: el informe determinista generado por PULSE puede incorporarse directamente al sistema de información radiológica (RIS) o al informe del paciente, reduciendo la carga administrativa del especialista.
- Triaje automatizado en unidades de imagen cardíaca: dado un volumen de CMR, PULSE puede priorizar estudios con alta probabilidad de miocardiopatía basándose en el diagnóstico del Random Forest, ayudando a gestionar listas de espera.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, obtenidos con el ensemble de 5 folds y aumentación de datos en test (TTA) cuando se indica:

| Benchmark | Metrica | Resultado |
|---|---|---|
| ACDC segmentation (5-fold + TTA) | Mean Dice | 88,8 % |
| ACDC diagnosis | Accuracy / macro-AUC | 90,0 % / 0,982 |
| M&Ms-2 (360 sujetos, zero-shot) | Mean Dice | 85,3 % |
| Sunnybrook (zero-shot) | LV Dice | 88,1 % |
| CAMUS (few-shot, N=20) | Mean Dice | 73,2 % |

No se han publicado comparaciones con otros modelos de segmentación cardíaca en la información disponible. Los resultados indican un rendimiento sólido en el dataset ACDC y una degradación moderada en transferencia zero-shot a otros dominios, con una caída esperada en el escenario few-shot de CAMUS.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Estimación basada en el tamaño del checkpoint: cada fold ocupa aproximadamente 380 MB en disco, lo que sugiere alrededor de 100 millones de parámetros por fold. Un ViT-B/14 con decoder DPT requiere típicamente entre 4 y 8 GB de VRAM para inferencia en FP32, dependiendo de la resolución de entrada.
- El modelo puede ejecutarse en GPUs de consumo como la NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) sin problemas. También es viable en GPUs profesionales como la A100 o H100, aunque no son necesarias.
- La inferencia en CPU es posible pero será significativamente más lenta; se recomienda GPU para uso clínico o de investigación con volúmenes grandes.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, ONNX Runtime (exportando el modelo a ONNX) o mediante un contenedor Docker personalizado. No es compatible directamente con vLLM ni con Ollama, orientados a modelos de lenguaje.
- La latencia estimada para un volumen de CMR (típicamente 10-20 cortes) en una GPU consumer sería del orden de segundos, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por los autores con otras arquitecturas de segmentación cardíaca. Como referencia cualitativa, se pueden considerar los siguientes modelos ampliamente utilizados en la misma tarea:

| Modelo | Arquitectura | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| PULSE | DINOv2 ViT-B/14 + DPT + Random Forest | Multi-tarea (segmentación + diagnóstico + informe) | MIT | Pesos públicos en HuggingFace |
| nnU-Net | U-Net con preprocesamiento automático | Segmentación pura, sin diagnóstico | Apache 2.0 | Código abierto |
| UNETR | Transformer + U-Net | Segmentación 3D | Apache 2.0 | Código abierto |
| Swin UNETR | Swin Transformer + U-Net | Segmentación 3D | Apache 2.0 | Código abierto |

La ventaja de PULSE frente a nnU-Net o UNETR es su capacidad integrada de diagnóstico y generación de informes, además de su adaptación few-shot. Sin embargo, no se han publicado comparaciones numéricas con estos modelos en los mismos benchmarks, por lo que no es posible establecer una jerarquía de rendimiento objetiva.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en resonancia magnética cardíaca de eje corto; no es aplicable a otras modalidades de imagen (TC, ecocardiografía, etc.) sin un ajuste adicional.
- El diagnóstico se basa en un Random Forest entrenado sobre biomarcadores derivados de las máscaras, no en un razonamiento clínico profundo. Esto limita su capacidad para detectar patrones complejos que no se reflejen en los 23 biomarcadores predefinidos.
- El informe clínico es generado mediante plantillas deterministas; no produce texto libre ni matices clínicos, y no debe interpretarse como un informe médico definitivo.
- No se han publicado estudios de validación clínica externa en entornos hospitalarios reales; los resultados provienen de datasets de investigación (ACDC, M&Ms-2, Sunnybrook, CAMUS).
- La calidad de la segmentación depende de la calidad de la imagen de entrada; artefactos de movimiento, baja resolución o campos de visión incompletos pueden degradar el rendimiento.
- No se dispone de información sobre sesgos demográficos o de equipos de adquisición. El modelo podría tener un rendimiento inferior en poblaciones subrepresentadas en los datos de entrenamiento.
- El riesgo de alucinación no aplica directamente al ser un modelo de visión, pero las máscaras incorrectas pueden propagar errores al diagnóstico y al informe.
- Licencia MIT: permite uso comercial, pero el usuario es responsable de la validación clínica y del cumplimiento normativo (p. ej., reglamento de dispositivos médicos en la UE).

## Enlaces

- HuggingFace: https://huggingface.co/hg-0403/PULSE
- Repositorio de código: https://github.com/BRAIN-Lab-AI/PULSE
- Página del proyecto: https://brain-lab-ai.github.io/PULSE/
- Publicación: IEEE Journal of Biomedical and Health Informatics (JBHI), 2026 (sin DOI disponible en la información proporcionada)
