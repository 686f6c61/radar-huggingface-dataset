# heartwise/deepcoro_clip_generic

## Resumen

DeepCORO-CLIP es un modelo de clasificación de vídeo desarrollado por HeartWise para el análisis de angiografía coronaria invasiva. A partir de las secuencias cineangiográficas de un estudio, estima para cada uno de los 18 segmentos coronarios el porcentaje de estenosis del diámetro y la probabilidad de estenosis significativa, calcificación, oclusión total crónica (CTO) y trombo. Se distribuye como checkpoint de PyTorch con licencia Apache 2.0 y está pensado exclusivamente para investigación.

El modelo emplea un codificador de vídeo mViT que procesa 16 fotogramas a resolución 224 x 224, admite hasta 10 runs cine por estudio y aplica attention pooling sobre los runs para agregar la información en una predicción por estudio. La salida son 90 valores por estudio (5 salidas para cada uno de los 18 segmentos), lo que lo convierte en una herramienta de etiquetado estructurado denso sobre vídeo médico.

Es relevante porque aborda una tarea de segmentación diagnóstica multi-etiqueta y multi-segmento sobre vídeo angiográfico real, con umbrales de decisión publicados y métricas desglosadas por segmento en un conjunto de test interno de 3.194 estudios del Montreal Heart Institute. No es un dispositivo médico y no debe usarse para decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mViT (video encoder) con attention pooling sobre runs |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 fotogramas a 224 x 224; hasta 10 runs cine por estudio |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen/vídeo, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt); checkpoint `best_model_epoch_11.pt` con sha256 `4eac7676bc24930466d84f04f813fcbc1b9e70b056232cad603f18c84d008267` |

## Arquitectura y entrenamiento

El modelo es un clasificador de vídeo basado en un codificador mViT que recibe 16 fotogramas de 224 x 224 por run cine, con soporte para hasta 10 runs por estudio. La agregación entre runs se realiza mediante attention pooling, de modo que el modelo pondera qué runs aportan más información para cada salida. La cabeza de predicción produce 5 salidas por segmento (18 segmentos): regresión de estenosis porcentual, probabilidad de estenosis significativa, probabilidad de calcificación moderada/severa, probabilidad de CTO y probabilidad de trombo.

Las etiquetas provienen del informe estructurado de angiografía del operador (evaluación visual), con una etiqueta por segmento y estudio. La estenosis significativa se define como ≥ 70 % (≥ 50 % en el tronco izquierdo); la calcificación como moderada o severa (o nódulo calcificado); CTO y trombo se registran si el hallazgo aparece en el informe. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF/DPO (no aplicable en este dominio). El pipeline completo incluye conversión DICOM a vídeo y filtrado de runs con VasoVision antes de la inferencia.

## Capacidades

- Clasificación de vídeo angiográfico coronario a nivel de estudio, con salida por 18 segmentos coronarios.
- Regresión de estenosis porcentual del diámetro (escala 0-100, sin recorte).
- Predicción binaria probabilística de estenosis significativa (≥ 70 %, ≥ 50 % en tronco izquierdo).
- Predicción de calcificación moderada o severa.
- Predicción de oclusión total crónica (CTO).
- Predicción de trombo.
- Agregación multi-run mediante attention pooling (hasta 10 runs por estudio).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multilingüe ni de texto: opera sobre vídeo médico.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del vídeo angiográfico.

## Casos de uso

- Triaje de estudios angiográficos: el modelo procesa los runs cine de un estudio y devuelve 90 valores por estudio, lo que permite priorizar la revisión de casos con alta probabilidad de estenosis significativa en segmentos proximales (RCA, LAD, LCx, tronco izquierdo) antes de la lectura del operador.
- Etiquetado estructurado para investigación: genera etiquetas por segmento (estenosis, calcificación, CTO, trombo) sobre cohortes retrospectivas, útil para construir datasets anotados de angiografía a gran escala sin revisión manual completa.
- Selección de cohortes para estudios clínicos: filtra estudios con probabilidad alta de CTO o trombo en segmentos concretos, reduciendo el volumen de revisión manual previa a la inclusión.
- Control de calidad retrospectivo: compara las predicciones del modelo con los informes del operador para detectar discrepancias sistemáticas en segmentos distales o ramas menores (D1, D2, OM1, OM2, ramus, LVP).
- Análisis de calcificación: identifica segmentos con calcificación moderada o severa, información relevante para planificación de procedimientos (por ejemplo, necesidad de aterectomía) en estudios de investigación.
- Investigación en imagen cardiovascular: sirve como extractor de características o baseline para tareas derivadas (predicción de eventos, segmentación, modelos multimodales) gracias a su codificador mViT y a la licencia Apache 2.0.
- Despliegue en pipelines Docker: el repositorio de GitHub incluye una configuración Docker y un comando de descarga de pesos (`python -m utils.download_pretrained_weights --models stenosis`), lo que facilita la reproducibilidad en entornos de investigación.

## Benchmarks y rendimiento

Resultados en el conjunto de test interno retenido (3.194 estudios, Montreal Heart Institute) para estenosis significativa, con umbrales de decisión por segmento:

| Segmento | Umbral | Positivos / 3.194 | AUROC | Sensibilidad | Especificidad | PPV |
|---|---|---|---|---|---|---|
| Proximal RCA | 0.1079 | 462 | 0.91 | 0.84 | 0.83 | 0.46 |
| Mid RCA | 0.1284 | 431 | 0.92 | 0.84 | 0.83 | 0.43 |
| Distal RCA | 0.0327 | 215 | 0.90 | 0.92 | 0.71 | 0.18 |
| Posterior descending artery | 0.0299 | 146 | 0.82 | 0.84 | 0.62 | 0.10 |
| Posterolateral branch | 0.0209 | 107 | 0.82 | 0.80 | 0.72 | 0.09 |
| Left main | 0.0546 | 271 | 0.93 | 0.86 | 0.84 | 0.33 |
| Proximal LAD | 0.1145 | 489 | 0.90 | 0.84 | 0.78 | 0.41 |
| Mid LAD | 0.1754 | 589 | 0.88 | 0.79 | 0.79 | 0.46 |
| Distal LAD | 0.0373 | 102 | 0.77 | 0.65 | 0.76 | 0.08 |
| First diagonal | 0.1308 | 326 | 0.77 | 0.69 | 0.69 | 0.20 |
| Second diagonal | 0.0568 | 198 | 0.77 | 0.72 | 0.67 | 0.13 |
| Proximal LCx | 0.0830 | 351 | 0.89 | 0.85 | 0.76 | 0.31 |
| Mid LCx | 0.0597 | 219 | 0.84 | 0.83 | 0.73 | 0.19 |
| Distal LCx | 0.0105 | 49 | 0.79 | 0.78 | 0.61 | 0.03 |
| First obtuse marginal | 0.0723 | 182 | 0.79 | 0.64 | 0.75 | 0.13 |
| Second obtuse marginal | 0.0767 | 201 | 0.83 | 0.81 | 0.70 | 0.15 |
| Ramus | 0.0299 | 105 | 0.80 | 0.83 | 0.66 | 0.08 |

Advertencias publicadas por el autor: usar 0.5 como umbral de probabilidad produce sensibilidad media de 0.18 (especificidad 0.99); usar 70 sobre la regresión (50 en tronco izquierdo) produce sensibilidad media de 0.08. Las probabilidades no están calibradas y los umbrales publicados corresponden al punto de la curva ROC con mayor media geométrica de sensibilidad y especificidad en datos internos, favoreciendo sensibilidad y con PPV bajo. No se han publicado resultados de benchmarks de estenosis, calcificación, CTO o trombo para los demás segmentos (LVP) ni comparativas con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,8 GB e incluye el checkpoint actual y checkpoints anteriores; el tamaño exacto de parámetros no se publica.
- GPU recomendadas: no disponible. El modelo procesa vídeo (16 fotogramas a 224 x 224 por run, hasta 10 runs por estudio), por lo que requiere una GPU con memoria suficiente para lotes de vídeo; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: PyTorch nativo y pipeline Docker del repositorio de GitHub (https://github.com/HeartWise-AI/DeepCORO_CLIP); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación de vídeo angiográfico coronario con salidas por segmento en la documentación proporcionada. La comparativa con alternativas (por ejemplo, otros modelos de estenosis coronaria o clasificadores de vídeo médico) no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepCORO-CLIP | no disponible | 16 fotogramas × 224×224, hasta 10 runs | Apache 2.0 | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivo en investigación: no es un dispositivo médico y no debe emplearse para decisiones clínicas.
- Las probabilidades no están calibradas; los umbrales publicados son puntos operativos balanceados que favorecen la sensibilidad y presentan PPV bajo (por ejemplo, 0.03 en distal LCx, 0.08 en distal LAD y ramus).
- No usar 0.5 como umbral de probabilidad ni 70 (50 en tronco izquierdo) sobre la salida de regresión: la sensibilidad cae a 0.18 y 0.08 respectivamente.
- La salida de regresión está comprimida hacia valores bajos; debe interpretarse como estimación continua, no como umbral.
- Las etiquetas provienen de evaluación visual del operador en el informe, no de medición cuantitativa (QCA), lo que introduce variabilidad interobservador.
- Los umbrales y métricas se derivaron de datos internos del Montreal Heart Institute; la generalización a otras poblaciones, equipos y protocolos de adquisición no está validada.
- El rendimiento es menor en segmentos distales y ramas menores (distal LAD AUROC 0.77, D1 0.77, D2 0.77, distal LCx 0.79, OM1 0.79) y el número de positivos es reducido en algunos segmentos (49 en distal LCx, 102 en distal LAD), lo que limita la precisión de las métricas.
- No se detallan sesgos demográficos ni de adquisición en la información disponible.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de falsos positivos/negativos en las predicciones por segmento.
- Licencia Apache 2.0 permite uso comercial del software, pero el autor restringe explícitamente el uso a investigación y prohíbe su uso como dispositivo médico; verificar implicaciones regulatorias antes de cualquier despliegue.
- Los checkpoints anteriores (`cnw09vn8_01062025-140448/`, `threshold_70/`) no son compatibles con los umbrales publicados en esta página.

## Enlaces

- Hugging Face: https://huggingface.co/heartwise/deepcoro_clip_generic
- Repositorio de código, pipeline Docker y configuración: https://github.com/HeartWise-AI/DeepCORO_CLIP
- Paper: https://arxiv.org/abs/2603.17675
- Modelo VasoVision (filtrado de runs): https://huggingface.co/heartwise/VasoVision
- Configuración de cabezas y etiquetas: `config/linear_probing/stenosis/docker_base_config.yaml` (en el repositorio de GitHub)
- Comando de descarga de pesos: `python -m utils.download_pretrained_weights --models stenosis`
