# habib-analyst/sonocnn

## Resumen

SonoCNN es una red neuronal convolucional compacta de 287.330 parámetros entrenada desde cero por Habib Ur Rehman para la clasificación binaria (benigno frente a maligno) de imágenes de ecografía de mama del conjunto de datos BreastMNIST, parte de MedMNIST v2. El modelo se desarrolló en el marco del proyecto SonoSight de ultrasonido explicable (OpenCV AI Competition 2026 / Bolt Builders Week) y se publica bajo licencia MIT en el perfil de Hugging Face de habib-analyst.

Su rasgo más distintivo no es el rendimiento, que es modesto, sino la verificabilidad: el repositorio incluye pesos en tres formatos (safetensors, PyTorch y ONNX), el split de test completo y un script (`verify_metrics.py`) que re-deriva cada métrica publicada desde los artefactos enviados. En la reproducción del 28-10-2026 se confirmaron exactitud de 0,8718 y ROC AUC de 0,8709 sobre el split de test de 156 imágenes.

Es relevante como ejemplo de buena práctica de publicación de modelos médicos: documenta honestamente sus puntos débiles (baja especificidad, sobreconfianza, fallos fuera de distribución) y advierte explícitamente que no es un dispositivo médico ni debe usarse para diagnóstico. Opera sobre imágenes en escala de grises de 28×28 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con 3 bloques convolucionales (32→64→128 canales, BatchNorm, ReLU, max-pool, dropout) + cabeza MLP de 2 capas |
| Parametros totales | 287.330 entrenables (287.970 según safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (modelo de visión; entrada de 28×28×1) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original) |
| Idiomas soportados | en (documentación; el modelo procesa imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), checkpoint PyTorch (`assets/sonocnn.pt`) y ONNX (`sonocnn.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN clásica y ligera: tres bloques convolucionales con 32, 64 y 128 canales respectivamente, cada uno con normalización por lotes (BatchNorm), activación ReLU, max-pooling y dropout, seguidos de un perceptrón multicapa de dos capas que produce la salida binaria. El total asciende a 287.330 parámetros entrenables, con un peso de apenas 1,2 MB en formato safetensors.

El entrenamiento se realizó desde cero sobre el split de entrenamiento de BreastMNIST (546 imágenes) durante 40 épocas, con optimizador AdamW (tasa de aprendizaje 3e-3, weight decay 1e-4, planificación coseno del learning rate), tamaño de lote 32 y entropía cruzada ponderada por clase para compensar el desbalance 73/27 entre malignos y benignos. El checkpoint final se seleccionó por mejor exactitud de validación (0,8718). El tiempo de entrenamiento registrado fue de 65,7 segundos en CPU. Se aplicaron aumentos de datos: volteos horizontales, traslaciones de ±3 píxeles con replicado de bordes y ruido gaussiano pequeño. Destaca un detalle de ingeniería orientado a la explicabilidad: Grad-CAM reveló que un modelo anterior fijaba su atención en el borde inferior oscuro de las imágenes de BreastMNIST en lugar de en las lesiones, por lo que se añadió la augmentación de traslación, sacrificando unos 0,6 puntos de exactitud a cambio de que la atención se concentrase en la región de la lesión. No hubo RLHF ni DPO (no aplica a este tipo de modelo).

## Capacidades

- Clasificación binaria de imágenes de ecografía de mama en 28×28: benigno (etiqueta 0) frente a maligno (etiqueta 1).
- Salida probabilística mediante softmax, con probabilidades por clase y etiqueta de confianza.
- Compatibilidad multi-formato: los mismos pesos están disponibles en safetensors, PyTorch y ONNX, con paridad verificada entre ONNX y PyTorch (diferencia máxima de logits de 9,5e-07).
- Explainabilidad mediante Grad-CAM: la build original incluye superposiciones de mapas de atención sobre la imagen de entrada.
- Composición con la biblioteca hermana ViewConsensus: consenso de 8 vistas con desviación estándar, capaz de devolver un veredicto "unsure — defer-to-human" cuando la dispersión entre vistas es alta.
- Script de verificación de métricas y suite de 8 tests (pytest) que comprueban la coherencia entre formatos y archivos de métricas.
- Pipeline de Hugging Face: image-classification.

## Casos de uso

- Investigación en imagen médica: como punto de partida o baseline reproducible para experimentos sobre BreastMNIST y MedMNIST, dado que sus métricas son verificables desde los artefactos publicados.
- Docencia y formación en machine learning médico: el repositorio ilustra el pipeline completo (preprocesado, entrenamiento con datos desbalanceados, augmentación guiada por Grad-CAM, evaluación honesta), ideal para prácticas de clase.
- Auditoría y reproducibilidad de modelos: el script `verify_metrics.py` y los tests automatizados sirven como plantilla para equipos que quieran exigir métricas reproducibles en sus propios modelos.
- Comparativa de formatos de despliegue: la paridad ONNX/PyTorch medida (9,5e-07 de diferencia máxima de logits) lo hace útil para validar exportaciones ONNX en pipelines de inferencia.
- Demostración de incertidumbre en sistemas explicable: la integración con ViewConsensus muestra cómo comunicar dispersión entre vistas y deferencia a juicio humano, útil en prototipos de decision support.
- Prototipado rápido en CPU: con 1,2 MB de pesos y entrenamiento en 65,7 s en CPU, es adecuado para entornos sin GPU, CI/CD y pruebas unitarias de pipelines de clasificación.
- Estudio de fallos fuera de distribución: el caso documentado de la imagen nativa de 256×256 que cae a p(maligno) = 0,499 tras el reescalado es material de referencia para enseñar riesgos de cambio de distribución.

## Benchmarks y rendimiento

Resultados sobre el split de test de BreastMNIST (n = 156), reproducidos de forma independiente el 28-10-2026 a partir de los artefactos del repositorio:

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,8718 (136/156) |
| ROC AUC | 0,8709 |
| Exactitud balanceada | 0,8145 |
| Recall maligno (sensibilidad) | 0,9386 (107/114) |
| Recall benigno (especificidad) | 0,6905 (29/42) |
| Precision maligno | 0,8917 (107/120) |
| Precision benigno | 0,8056 (29/36) |
| Matriz de confusion | [[29, 13], [7, 107]] (filas: benigno real, maligno real) |
| Baseline de clase mayoritaria | 0,7308 |
| Mejor exactitud de validacion | 0,8718 (68/78) |

La propia model card advierte que, con un test tan pequeño, el intervalo de confianza del 95 % sobre la exactitud es de aproximadamente ±5 puntos (≈0,81–0,92). El punto débil está claramente identificado: el modelo detecta malignos con 93,9 % de sensibilidad pero solo limpia el 69,1 % de los benignos (13 de 42 imágenes benignas se marcan como malignas). No hay comparativas publicadas frente a otros modelos de BreastMNIST en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente; con 287.330 parámetros y entradas de 28×28, el modelo es trivial en recursos y ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: no necesarias; el entrenamiento registrado se completó en 65,7 segundos en CPU.
- Consumer GPU: cualquier GPU moderna lo ejecuta con holgura; no es un cuello de botella en ningún hardware razonable.
- Despliegue: biblioteca Python propia (`pip install git+https://github.com/habib-analyst/sonocnn.git`) con `load_model` y `predict`; inferencia ONNX disponible (`sonocnn.onnx`, tensor de entrada `(N, 1, 28, 28)` normalizado); no se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a modelos de visión de este tipo).
- Preprocesado obligatorio: escala de grises → redimensionado a 28×28 → división por 255 → normalización con media/desviación del split de entrenamiento de BreastMNIST (0,32758 / 0,20573).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas directas del autor. Como referencia de contexto, dentro de la familia MedMNIST v2 los benchmarks suelen reportarse sobre la misma tarea:

| Modelo | Parametros | Tarea | Exactitud test | Licencia |
|---|---|---|---|---|
| SonoCNN | 287.330 | BreastMNIST (benigno/maligno, 28×28) | 0,8718 (AUC 0,8709) | MIT |
| Baseline clase mayoritaria | — | BreastMNIST | 0,7308 | — |
| Otros clasificadores de BreastMNIST | no disponible | BreastMNIST | no disponible | no disponible |

No hay datos comparativos suficientes en la información proporcionada para evaluar si SonoCNN está por encima o por debajo del estado del arte en BreastMNIST; la propia model card aclara que no pretende ser estado del arte, sino un modelo pequeño con números verificados y modos de fallo documentados.

## Limitaciones y advertencias

- No es un dispositivo médico ni un herramienta clínica: la model card prohíbe explícitamente su uso para diagnóstico o cribado.
- Entrenado con solo 546 imágenes del benchmark público BreastMNIST; nunca evaluado sobre datos clínicos a resolución nativa.
- Resolución nativa fuera de distribución: imágenes de ultrasonido a resolución completa (p. ej. 256×256) reescaladas a 28×28 producen resultados erráticos; el ejemplo incluido cae a p(maligno) = 0,499 frente a 0,702 en su versión nativa de 28×28.
- Desbalance de errores: especificidad baja (0,6905); 13 de 42 benignos del test se clasifican como malignos, lo que generaría muchos falsos positivos en un hipotético uso real.
- Sobreconfianza conocida: las confianzas softmax están documentadas como excesivamente altas en casos fáciles; la integración con ViewConsensus existe precisamente para mitigar la lectura ingenua de un único número.
- Intervalo de confianza amplio: con n = 156, la exactitud tiene un IC del 95 % de aproximadamente ±5 puntos.
- Sesgo de dataset: BreastMNIST contiene el sesgo de composición de MedMNIST v2 (distribución de clases 73/27 maligno/benigno en train); no hay análisis de sesgos demográficos disponible.
- Restricciones de licencia: ninguna relevante; la licencia MIT permite uso comercial, pero el aviso de no uso clínico de la model card es una restricción de facto que debe respetarse.
- Sensibilidad al preprocesado: una auditoría previa obtuvo 0,73 de exactitud por omitir el paso de división por 255; cualquier integración debe respetar exactamente el contrato de preprocesado (grises, 28×28, /255, normalización 0,32758/0,20573).

## Enlaces

- Hugging Face: https://huggingface.co/habib-analyst/sonocnn
- Repositorio de código (instalación y scripts): https://github.com/habib-analyst/sonocnn
- Dataset BreastMNIST / MedMNIST v2: no disponible enlace directo en la información proporcionada (referenciado como Yang et al., *MedMNIST v2*, truncado en la model card)
- Demo / Space: no disponible
