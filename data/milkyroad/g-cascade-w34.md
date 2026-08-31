# milkyroad/G-cascade-w34

## Resumen

G-cascade-w34 es un modelo de clasificación de imágenes médicas desarrollado por el usuario milkyroad en Hugging Face, especializado en el análisis de fotogramas de cistoscopia para la detección de cáncer de vejiga. Se trata de un sistema en cascada de dos etapas que procesa características visuales extraídas con MedSigLIP-448 (variante del modelo SigLIP adaptada a imágenes médicas) y aplica un esquema de focal loss ponderado para abordar el desequilibrio de clases entre lesiones tumorales y tejido normal.

El modelo está diseñado para resolver el problema del cambio de dominio (domain shift) en endoscopia, donde los modelos entrenados en un entorno hospitalario pueden degradarse al aplicarse en otro. La versión w34 introduce un peso focal de 34 en la segunda etapa de la cascada, frente a la versión sin ponderar, con el objetivo de mejorar la sensibilidad en la detección de lesiones malignas (MT) a costa de una mayor tasa de falsos positivos en tejido normal (NML). El repositorio incluye los pesos entrenados, métricas de evaluación y scripts de ejecución, con un tamaño total de 0.2 GB.

La relevancia de este modelo radica en su enfoque práctico para un problema clínico concreto: la clasificación automática de fotogramas de cistoscopia en tiempo real, donde la precisión y la capacidad de generalización entre pacientes y equipos son críticas. Aunque no se trata de un modelo de lenguaje, su arquitectura en cascada y su estrategia de ponderación de clases ofrecen un caso de estudio interesante para el desarrollo de sistemas de diagnóstico asistido por ordenador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de dos etapas (S1: MLP frame-level, S2: MLP frame-level) sobre características MedSigLIP-448 |
| Parametros totales | no disponible (tamaño del repo: 0.2 GB, incluye pesos y scripts) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pt) |
| Idiomas soportados | no disponible (modelo de imágenes, sin procesamiento de lenguaje) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura en cascada de dos etapas, ambas basadas en perceptrones multicapa (MLP) que operan sobre características extraídas por MedSigLIP-448, un modelo de visión preentrenado adaptado a imágenes médicas con normalización de anillo (ring-norm). La primera etapa (S1) clasifica cada fotograma como lesión o no región de interés (NROI), utilizando una función de pérdida FocalLoss sin ponderar con gamma=3 y label smoothing de 0.1. La segunda etapa (S2) procesa únicamente los fotogramas clasificados como lesión y distingue entre tumor maligno (MT) y tejido normal (NML), empleando una pérdida focal ponderada con pesos [1, 34] y el mismo label smoothing.

El entrenamiento se realizó con semillas 42-46 (cinco ejecuciones) y se evaluó en un conjunto de test fijo de 1.754 fotogramas procedentes de un dominio fuente congelado (frozen Source-D). No se aplica agregación de lesiones a nivel de vídeo; la decisión se toma fotograma a fotograma. La única variable modificada respecto a la versión sin ponderar es el peso focal w=34 en la segunda etapa, lo que permite aislar su efecto sobre el rendimiento. Los scripts `g_harness.py` y `run_cascade_w34.py` están incluidos en el repositorio, aunque las rutas de acceso a los datos están sanitizadas como placeholders.

## Capacidades

- Clasificación binaria de fotogramas de cistoscopia: distingue entre lesión y no región de interés (NROI) en la primera etapa.
- Clasificación de malignidad: en la segunda etapa, diferencia entre tumor maligno (MT) y tejido normal (NML) dentro de los fotogramas clasificados como lesión.
- Manejo de desequilibrio de clases: la pérdida focal ponderada con w=34 mejora la sensibilidad hacia la clase minoritaria (MT), como se refleja en la alta tasa de recall de MT (0.859).
- Extracción de características robusta al cambio de dominio: utiliza MedSigLIP-448 con ring-norm, diseñado para reducir el impacto de variaciones en iluminación, color y textura entre diferentes equipos de endoscopia.
- Inferencia por fotograma: no requiere agregación temporal, lo que permite su uso en tiempo real sobre secuencias de vídeo.
- Reproducibilidad: incluye métricas por semilla y predicciones guardadas en formato .npz, facilitando la comparación con otros enfoques.

## Casos de uso

- Asistencia al diagnóstico en cistoscopia: el modelo puede integrarse en sistemas de ayuda al urólogo para marcar fotogramas sospechosos de malignidad durante una exploración, reduciendo el tiempo de revisión manual. Su alta sensibilidad en MT (0.859) lo hace adecuado como herramienta de cribado, aunque requiere supervisión clínica.
- Triaje de vídeos de cistoscopia: al procesar fotograma a fotograma, puede preclasificar secuencias completas y priorizar aquellas con mayor número de lesiones detectadas, optimizando el flujo de trabajo en servicios de urología con alta carga asistencial.
- Entrenamiento de modelos en dominios nuevos: la arquitectura en cascada y el esquema de ponderación pueden servir como punto de partida para adaptar el modelo a otros centros hospitalarios, donde el cambio de dominio es un problema habitual. Los scripts incluidos permiten reentrenar con datos locales.
- Investigación en detección de cáncer de vejiga: el repositorio ofrece un baseline reproducible con métricas detalladas por semilla, útil para comparar nuevas técnicas de aumento de datos, arquitecturas o funciones de pérdida en el mismo conjunto de test.
- Evaluación de estrategias de pérdida focal: el estudio del peso w=34 documenta el efecto de la ponderación en el equilibrio precisión-sensibilidad, lo que puede orientar el diseño de sistemas similares en otras modalidades de imagen médica (colonoscopia, broncoscopia).
- Desarrollo de pipelines de diagnóstico asistido por ordenador: al ser un modelo ligero (0.2 GB) y sin dependencias de agregación temporal, puede desplegarse en equipos de quirófano o consulta con recursos computacionales limitados, siempre que se disponga de las características MedSigLIP-448 precalculadas.

## Benchmarks y rendimiento

Los resultados de la prueba de fiabilidad (reliability run) sobre el conjunto de test fijo de 1.754 fotogramas, con semillas 42-46, son los siguientes:

| Metrica | Valor |
|---|---|
| Recall NML (tejido normal) | 0.319 ± 0.074 |
| Precision NML | 0.292 |
| Recall MT (tumor maligno) | 0.859 |
| Recall NROI (no región de interés) | 0.940 |
| MCC (coeficiente de correlacion de Matthews) | 0.704 ± 0.025 |

No se han publicado comparaciones con otros modelos en la información disponible. Los valores corresponden a la media sobre cinco semillas, con desviación estándar para recall NML y MCC. La alta recall de MT indica que el peso focal w=34 prioriza la detección de malignidad, aunque a costa de una baja recall en tejido normal (0.319), lo que implica un número elevado de falsos positivos en NML.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0.2 GB (incluyendo pesos y scripts), la inferencia requiere menos de 1 GB de VRAM si se cargan los pesos en FP32, y menos de 0.5 GB en FP16. Es compatible con cualquier GPU moderna, incluidas las de gama de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 4-6 GB de VRAM, como RTX 3060 o superior.
- Compatibilidad con GPU de consumo: sí, cabe en todas las GPU consumer actuales, incluso en sistemas sin GPU dedicada si se usa CPU (aunque con mayor latencia).
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, ONNX Runtime o directamente en un script Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño reducido y la ausencia de agregación temporal, se espera una latencia por fotograma inferior a 10 ms en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de cáncer de vejiga en cistoscopia con cascada de dos etapas). La model card no referencia otros sistemas ni benchmarks externos, por lo que no es posible establecer una comparativa objetiva. Se recomienda consultar la literatura sobre detección de lesiones en cistoscopia (por ejemplo, modelos basados en CNN como ResNet o EfficientNet, o sistemas de segmentación como U-Net) para contextualizar el rendimiento, aunque no se incluyen datos cuantitativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se evaluó únicamente en un dominio fuente congelado (Source-D). Su rendimiento en otros hospitales, equipos de endoscopia o poblaciones puede degradarse significativamente debido al cambio de dominio, a pesar del uso de MedSigLIP-448 con ring-norm.
- Desequilibrio de clases extremo: el peso focal w=34 produce una recall de MT alta (0.859) pero una recall de NML muy baja (0.319), lo que genera muchos falsos positivos en tejido normal. Esto puede ser aceptable para cribado, pero no para diagnóstico definitivo sin supervisión.
- Sin agregación temporal: el modelo clasifica fotogramas de forma independiente, ignorando la información contextual de la secuencia de vídeo. Esto puede provocar inestabilidad en las predicciones entre fotogramas consecutivos.
- Datos de entrenamiento no especificados: no se indica el número de pacientes, la procedencia de las imágenes ni el protocolo de anotación. Esto limita la reproducibilidad y la evaluación de posibles sesgos demográficos o de equipo.
- Licencia cc-by-sa-4.0: permite uso comercial y modificación, pero cualquier obra derivada debe distribuirse bajo la misma licencia. Es recomendable revisar los términos completos antes de integrarlo en un producto comercial.
- Dependencia de MedSigLIP-448: el modelo requiere características precalculadas de este extractor específico. No se proporcionan los pesos de MedSigLIP-448 en el repositorio, por lo que el usuario debe obtenerlos por separado, lo que puede complicar el despliegue.
- Rutas sanitizadas: los scripts contienen placeholders (`<LAB_ROOT>`, `<PROJECT_ROOT>`) que deben ajustarse al entorno local, lo que puede introducir errores si no se configuran correctamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/milkyroad/G-cascade-w34
- Perfil del autor en Hugging Face: https://huggingface.co/milkyroad
- Datasets del autor: https://huggingface.co/milkyroad/datasets

No se han encontrado papers, blogs o demos adicionales asociados a este modelo en la información proporcionada.
