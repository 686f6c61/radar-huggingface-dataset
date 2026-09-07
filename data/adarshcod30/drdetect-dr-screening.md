# adarshcod30/drdetect-dr-screening

## Resumen

drdetect-dr-screening es un modelo de clasificación de imágenes médicas desarrollado por adarshcod30 (Adarsh Dwivedi) para la detección de retinopatía diabética (RD) en imágenes de fondo de ojo. Utiliza una arquitectura EfficientNet-B0 con una cabeza de regresión ordinal para clasificar la severidad de la RD en cinco grados según la escala ICDR. El modelo fue entrenado en el dataset APTOS 2019 y evaluado de forma pre-registrada y única sobre conjuntos externos (Messidor-2 e IDRiD), donde alcanzó una AUC de 0.9242 para la detección de RD referible.

A pesar de ser un prototipo de investigación, destaca por su enfoque metodológico riguroso: el checkpoint publicado no es el de mejor precisión en validación interna, sino el que ganó una evaluación externa pre-registrada frente a una línea base de cross-entropy. El repositorio tiene un tamaño de 0.1 GB e incluye pesos en formato PyTorch y ONNX, lo que facilita su integración en pipelines de investigación. No aplica longitud de contexto al ser un modelo de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 con cabeza de regresión ordinal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | research-use-only |
| Formato de pesos | PyTorch Lightning checkpoint (.ckpt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en EfficientNet-B0, una red convolucional eficiente, modificada con una cabeza de salida única de regresión para modelar la severidad de la retinopatía diabética de forma ordinal en 5 clases ICDR. El entrenamiento se realizó sobre el dataset APTOS 2019, compuesto por imágenes de fondo de ojo. Se aplicó congelación de capas BatchNorm (`freeze_bn=True`) durante el entrenamiento.

La innovación principal no está en la arquitectura, sino en el protocolo de evaluación: el checkpoint publicado no es el de mejor precisión en validación interna (una línea base de cross-entropy lo superó), sino el que ganó una evaluación externa pre-registrada y ejecutada una sola vez sobre Messidor-2 e IDRiD. El modelo está disponible en formato PyTorch y exportado a ONNX con verificación de paridad (error máximo absoluto 2.4×10⁻⁷).

## Capacidades

- Clasificación de imágenes de fondo de ojo en 5 grados de retinopatía diabética según la escala ICDR.
- Salida ordinal mediante regresión, lo que permite obtener una puntuación continua de severidad.
- Soporte de explicabilidad (tag `explainable-ai`), aunque no se detalla el método concreto en la información disponible.
- Exportación a ONNX para despliegue en entornos de inferencia ligera.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica al ser un modelo de visión.

## Casos de uso

- Investigación académica en detección de retinopatía diabética: el modelo permite comparar arquitecturas y pérdidas ordinales en un contexto de validación externa rigurosa, gracias a su protocolo de evaluación pre-registrado.
- Evaluación de técnicas de calibración de umbrales: la limitación documentada de sensibilidad (44.1%) lo convierte en un caso de estudio para investigar la transferencia de umbrales entre poblaciones.
- Desarrollo de pipelines de preprocesamiento de imágenes fundus: el repositorio incluye un pipeline que gestiona control de calidad y decodificación, útil para prototipos.
- Investigación en explicabilidad (XAI) para imágenes médicas: al estar etiquetado con `explainable-ai`, puede usarse para estudiar mapas de atención o gradientes en decisiones clínicas simuladas.
- Docencia en visión por computador y aprendizaje automático: su tamaño reducido (repo de 0.1 GB) y su disponibilidad en ONNX facilitan su uso en entornos educativos.
- Benchmarking de modelos en datasets externos: el protocolo de evaluación pre-registrado puede replicarse para comparar otros modelos en condiciones controladas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| QWK (Quadratic Weighted Kappa) | 0.6995 |
| Sensibilidad (referable DR) | 0.441 |
| Especificidad (referable DR) | 0.976 |
| AUC (referable DR) | 0.9242 |

Comparación con la línea base interna de cross-entropy:

| Modelo | AUC referable |
|---|---|
| Este modelo (regresión ordinal) | 0.9242 |
| Baseline cross-entropy | 0.8878 |

La diferencia es estadísticamente significativa según la prueba de DeLong (p=6.1×10⁻¹⁰). No se han publicado resultados de benchmarks contra otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: probablemente sí, dado el tamaño del repositorio (0.1 GB), pero no confirmado.
- Opciones de despliegue: PyTorch y ONNX Runtime. No es aplicable a vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La única comparación interna es contra una línea base de cross-entropy, que se presenta en la sección de benchmarks. No se dispone de datos de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Licencia de uso exclusivo para investigación (`research-use-only`); no está permitido su uso clínico, diagnóstico ni comercial.
- Sensibilidad baja para RD referible (44.1%), muy por debajo del objetivo de >=90% de los comparadores publicados.
- Fallo de calibración de umbral: el umbral congelado de la validación interna no se transfiere a la población externa; cualquier uso real requiere ajustar un nuevo umbral con datos locales.
- No es un dispositivo médico y no debe sustituir el juicio clínico.
- Los datos de entrenamiento (APTOS 2019) están bajo licencias mixtas que restringen la redistribución, lo que puede limitar su uso en proyectos públicos.
- Posibles sesgos demográficos: el entrenamiento se realizó principalmente con datos de APTOS (India), por lo que la generalización a otras poblaciones puede ser limitada.
- Evaluado una sola vez en un conjunto externo; no se dispone de validación clínica adicional.

## Enlaces

- HuggingFace: https://huggingface.co/adarshcod30/drdetect-dr-screening
- GitHub: https://github.com/adarshcod30/Diabetic-Retinopathy-Detection
- Model card: https://github.com/adarshcod30/Diabetic-Retinopathy-Detection/blob/main/MODEL_CARD.md
- Resultados de validación: https://github.com/adarshcod30/Diabetic-Retinopathy-Detection/blob/main/docs/22_PHASE8_VALIDATION_RESULTS.md
- Dataset card: https://github.com/adarshcod30/Diabetic-Retinopathy-Detection/blob/main/DATASET_CARD.md
