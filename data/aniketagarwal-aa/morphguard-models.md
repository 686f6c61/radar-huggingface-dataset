# AniketAgarwal-aa/MorphGuard-Models

## Resumen

MorphGuard-Models es un repositorio de artefactos de investigación para la detección de ataques de morphing facial (facial morphing attack detection, FMAD), desarrollado por AniketAgarwal-aa como parte de la plataforma MorphGuard V3.0. No se trata de un modelo de lenguaje generativo, sino de un conjunto de clasificadores binarios entrenados para distinguir caras reales de caras sintéticas generadas mediante la fusión de dos identidades (morphs), un problema relevante en sistemas de verificación biométrica de documentos de identidad.

El repositorio combina enfoques clásicos de visión por computador (máquinas de vectores de soporte, regresión logística, bosques aleatórios y gradient boosting sobre características de textura multiescala de 6.103 dimensiones) con una red neuronal convolucional entrenada sobre recortes faciales de 224x224 píxeles. El mejor artefacto, un SVM con kernel RBF sobre características combinadas, alcanza un 96,49% de precisión de test con un ACER de 0,0680 sobre un split de 285 muestras no vistas.

La relevancia actual del repositorio radica en que la detección de morphs es un requisito emergente en los procesos de enrolment de documentos de identidad (por ejemplo, pasaportes y DNI electrónicos) sujetos al protocolo ISO/IEC 30107-3. El repositorio incluye clasificadores entrenados, ensembles de fusión de decisión y metadatos de arquitectura, aunque su propio autor lo describe como artefactos experimentales de investigación y no como productos certificados de seguridad biométrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificadores clásicos (SVM RBF, regresión logística, SVM lineal, Extra Trees, Random Forest, Hist Gradient Boosting) y CNN PyTorch personalizada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefactos joblib y pesos PyTorch .pt) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | joblib (scikit-learn), .pt (PyTorch), JSON (descriptores de arquitectura) |

## Arquitectura y entrenamiento

El repositorio contiene nueve artefactos de clasificación binaria. Los modelos clásicos operan sobre un vector de 6.103 dimensiones de características de textura multiescala que combina Local Binary Patterns (LBP), Histogram of Oriented Gradients (HOG), Gray-Level Co-occurrence Matrix (GLCM) y estadísticas de píxeles. Sobre estas características se entrenan un SVM con kernel RBF combinado, una regresión logística, un SVM lineal, un SVM sobre HOG, Extra Trees, Random Forest combinado e Hist Gradient Boosting. La CNN personalizada se entrena directamente sobre recortes faciales de 224x224 píxeles, sin ingeniería de características manual.

Los datos de entrenamiento proceden de los datasets MONOT (Delaunay mesh morphs) y ONOT, según los tags del repositorio. La evaluación se realiza sobre un split de test retenido de 285 muestras no vistas con "cero fuga de identidad" (zero identity leakage), y todos los umbrales de decisión se optimizan sobre un split de validación independiente minimizando ACER. El repositorio incluye además dos estrategias de fusión: un voting ensemble (89,12% de precisión) y un stacking ensemble (88,07%), ambos por debajo del mejor clasificador individual.

## Capacidades

- Detección binaria de caras morphed frente a caras genuinas (bona fide) en imágenes faciales.
- Extracción de características de textura multiescala mediante LBP, HOG, GLCM y estadísticas de píxeles.
- Clasificación sobre recortes faciales de 224x224 píxeles con CNN PyTorch.
- Fusión de decisión multi-modelo mediante voting y stacking ensembles.
- Evaluación conforme a métricas del protocolo ISO/IEC 30107-3: APCER, BPCER, ACER y ROC-AUC.
- No dispone de generación de texto, tool calling, capacidades de agente, multilingüismo ni modalidades de audio o visión general más allá de la clasificación facial.

## Casos de uso

- Verificación de documentos de identidad en procesos de enrolment: el clasificador SVM combinado puede integrarse como filtro previo para rechazar fotografías que sean morphs de dos identidades antes de emitir un pasaporte o DNI electrónico, aprovechando su ACER de 0,0680 sobre muestras no vistas.
- Auditoría de bases de datos biométricas existentes: dado que el modelo opera sobre recortes faciales de 224x224, puede ejecutarse en lote sobre registros históricos para detectar posibles morphs introducidos en el sistema.
- Control de calidad en pipelines de captura: la CNN personalizada, con un BPCER de 0,0877, puede usarse como segunda opinión para reducir falsos rechazos de usuarios legítimos en puntos de captura automatizados.
- Investigación académica en FMAD: los nueve artefactos y los metadatos de arquitectura permiten reproducir comparativas entre enfoques clásicos y deep learning bajo el mismo split de evaluación.
- Pruebas de robustez de sistemas biométricos: el repositorio sirve para construir conjuntos de ataque controlados y medir la tasa de aceptación de morphs en sistemas comerciales de reconocimiento facial.
- Despliegue ligero en entornos con recursos limitados: al ser clasificadores scikit-learn serializados en joblib, pueden ejecutarse en CPU sin GPU, a diferencia de la CNN que requiere PyTorch.

## Benchmarks y rendimiento

Resultados sobre el split de test retenido de 285 muestras no vistas, con umbrales optimizados por ACER en validación independiente:

| Arquitectura | Artefacto | Test accuracy | ACER | APCER | BPCER | ROC-AUC |
|---|---|---|---|---|---|---|
| Combined SVM (RBF) | `combined_svm.joblib` | 96,49% | 0,0680 | 0,0132 | 0,1228 | 0,9878 |
| Logistic Regression | `logistic_regression.joblib` | 96,14% | 0,0965 | 0,0000 | 0,1930 | 0,9769 |
| HOG SVM | `hog_svm.joblib` | 96,14% | 0,0899 | 0,0044 | 0,1754 | 0,9867 |
| Hist Gradient Boosting | `hist_gradient_boosting.joblib` | 96,14% | 0,0965 | 0,0000 | 0,1930 | 0,9911 |
| Extra Trees | `extra_trees.joblib` | 95,44% | 0,1140 | 0,0000 | 0,2281 | 0,9950 |
| Random Forest Combined | `rf_combined.joblib` | 95,09% | 0,1228 | 0,0000 | 0,2456 | 0,9879 |
| Voting Ensemble | `voting_ensemble.joblib` | 89,12% | 0,1535 | 0,0789 | 0,2281 | 0,8688 |
| Stacking Ensemble | `stacking_ensemble.joblib` | 88,07% | 0,1338 | 0,1096 | 0,1579 | 0,9044 |
| Custom CNN | `custom_cnn.pt` | 87,72% | 0,1096 | 0,1316 | 0,0877 | 0,9601 |

No se han publicado resultados de benchmarks comparativos con otros modelos de FMAD en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la CNN (el repositorio no especifica tamaño de pesos ni número de parámetros); los clasificadores scikit-learn en joblib pueden ejecutarse en CPU sin GPU.
- GPU recomendadas: no disponible; la CNN PyTorch puede inferirse en cualquier GPU compatible con PyTorch, pero no se especifican requisitos mínimos.
- Cabe en consumer GPU: presumiblemente sí para la CNN por su tamaño de entrada de 224x224 y arquitectura personalizada, pero el dato no está confirmado en la información disponible.
- Opciones de despliegue: scikit-learn (joblib) para los clasificadores clásicos, PyTorch para `custom_cnn.pt`; el repositorio menciona una aplicación Streamlit Community Cloud como demo en vivo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de morphing facial (FMAD) en la documentación proporcionada. Los datasets de referencia MONOT y ONOT son los habituales en la literatura, pero no se aportan resultados de otros métodos para establecer una comparativa fiable.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MorphGuard-Models | no disponible | no disponible | ACER 0,0680 (mejor artefacto) | apache-2.0 | Hugging Face |
| Alternativas FMAD | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor declara que los modelos son artefactos experimentales de investigación y no constituyen productos certificados de seguridad biométrica operacional.
- El conjunto de evaluación es pequeño (285 muestras no vistas), lo que limita la generalización de las métricas reportadas.
- Los modelos se entrenaron sobre morphs Delaunay de MONOT; su comportamiento frente a otros tipos de morphing (landmark-based, GAN-based, print-scan) no está documentado.
- El ACER del mejor modelo (0,0680) implica un BPCER de 0,1228, es decir, un 12,28% de rechazos de usuarios genuinos, inaceptable en producción sin ajuste adicional.
- Los ensembles (voting y stacking) rinden peor que el mejor clasificador individual, con precisión inferior al 90%.
- No hay información sobre sesgos demográficos, robustez a compresión JPEG, iluminación o variaciones de pose.
- La licencia Apache 2.0 permite uso comercial, pero la falta de certificación ISO/IEC 30107-3 y de validación externa desaconseja su uso en decisiones de seguridad sin supervisión humana.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por terceros.
- No se especifican requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AniketAgarwal-aa/MorphGuard-Models
- Repositorio de código fuente: https://github.com/AniketAgarwal-aa/MorphGuard
- Aplicación en vivo: Streamlit Community Cloud (enlace no disponible en la información proporcionada)
- Dataset MONOT: no disponible enlace directo en la información proporcionada
- Dataset ONOT: no disponible enlace directo en la información proporcionada
- Protocolo ISO/IEC 30107-3: no disponible enlace directo en la información proporcionada
