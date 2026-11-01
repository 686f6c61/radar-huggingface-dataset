# habib-analyst/vesselcnn

## Resumen

VesselCNN es una red neuronal convolucional 3D compacta desarrollada por el usuario habib-analyst para la clasificación binaria de segmentos vasculares intracraneales voxelizados de 28×28×28 vóxeles, distinguiendo entre vaso sano y aneurisma. El modelo se entrena desde cero sobre el benchmark VesselMNIST3D de MedMNIST v2 y se distribuye con pesos en safetensors y ONNX, junto con un script que reproduce todas las métricas declaradas a partir de los pesos y los datos incluidos en el repositorio. Con solo 105.042 parámetros totales, es un ejercicio deliberadamente minimalista y transparente sobre un problema volumétrico difícil, pequeño y desbalanceado.

Su relevancia no reside en el rendimiento, sino en la honestidad metodológica: el propio autor documenta que el modelo no es un detector de aneurismas utilizable, con una accuracy de 0,7539 inferior a la línea base de clase mayoritaria (0,8874) y una AUC de 0,7219 que queda unos 15 puntos por debajo de la referencia ResNet-18 (3D) del paper de MedMNIST v2. La ficha resulta útil como caso de estudio de un pipeline completo de entrenamiento y evaluación reproducible en imagen médica volumétrica, no como herramienta clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 3D (3 bloques convolucionales 16→32→64 canales, convoluciones 3×3×3, BatchNorm, ReLU, max-pool, dropout) + global average pooling + capa lineal |
| Parametros totales | 105.042 (104.722 según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada volumétrica fija de 28×28×28 vóxeles) |
| Tipos de cuantizacion | No disponible (solo pesos completos en safetensors y ONNX) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La arquitectura es una CNN 3D compacta compuesta por tres bloques convolucionales con canales 16→32→64, convoluciones 3×3×3, BatchNorm, ReLU, max-pooling y dropout, seguidos de una cabeza de global average pooling con una única capa lineal. La elección de GAP en lugar de una cabeza MLP aplanada es deliberada: una MLP añadiría unos 1,4 millones de parámetros frente a solo 1.335 volúmenes de entrenamiento. El max-pooling (en lugar de average-pooling) también forma parte del diseño.

Los datos provienen del benchmark VesselMNIST3D de MedMNIST v2, con volúmenes de 28×28×28 vóxeles de un solo canal. El preprocesado es idéntico al del entrenamiento: división por 255 y normalización con la media y desviación estándar del split de entrenamiento (0,01933 / 0,13768, escalares). Las etiquetas siguen el orden de MedMNIST v2: 0 = vessel, 1 = aneurysm. El conjunto de entrenamiento contiene solo 150 volúmenes positivos (aneurismas), lo que explica en parte el bajo rendimiento en la clase minoritaria. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, dado que es un modelo de clasificación de imágenes.

## Capacidades

- Clasificación binaria de imágenes médicas volumétricas: distingue vaso sano frente a aneurisma en volúmenes de 28×28×28 vóxeles.
- Inferencia sobre arrays NumPy (.npy) o tensores normalizados con forma (N, 1, 28, 28, 28) en ONNX, devolviendo logits.
- Salida de probabilidades por clase y etiqueta con nivel de confianza mediante la función `predict`.
- Ejecución en CPU sin requisitos de GPU, dado el reducido tamaño del modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidad multilingüe no aplicable: es un modelo de visión, no de lenguaje.

## Casos de uso

- Estudio de referencia para pipelines de imagen médica volumétrica: sirve como ejemplo completo y reproducible de entrenamiento, evaluación y análisis de fallos sobre VesselMNIST3D, útil para investigadores que quieran partir de una base verificable.
- Validación de infraestructura de evaluación: el script `verify_metrics.py` reproduce exactamente accuracy, AUC, balanced accuracy, matriz de confusión y recalls por clase, lo que permite comprobar la integridad de un pipeline antes de escalar a modelos mayores.
- Docencia en clasificación 3D desbalanceada: ilustra de forma cuantificada el efecto de clases minoritarias con pocos positivos (150 volúmenes de aneurisma en entrenamiento) y el sesgo hacia la clase mayoritaria.
- Pruebas de integración ONNX: el archivo `vesselcnn.onnx` permite validar el despliegue de un clasificador 3D en runtimes ONNX con una entrada y salida bien definidas.
- Comparación de arquitecturas ligeras: sirve como línea base de bajo coste (105.042 parámetros) frente a ResNet-18 (3D) y variantes con convoluciones ACS en el mismo split.
- Análisis de sesgos por volumen: el patrón documentado (el modelo se apoya en el tamaño del segmento más que en la forma del aneurisma) es un caso práctico para estudiar atajos espurios en modelos volumétricos.

## Benchmarks y rendimiento

Resultados verificados en el split de test de VesselMNIST3D (n = 382), reproducidos el 2026-10-29:

| Métrica | Valor |
|---|---|
| Accuracy | 0,7539 (288/382) |
| AUC | 0,7219 |
| Balanced accuracy | 0,6380 |
| Línea base de clase mayoritaria | 0,8874 |
| Mejor balanced accuracy de validación | 0,7887 (época 6) |
| Mejor AUC de validación | 0,8179 (época 6) |

Resultados por clase en test:

| Clase | Recall | Precision | Soporte |
|---|---|---|---|
| vessel | 0,7876 (267/339) | 0,9239 | 339 |
| aneurysm | 0,4884 (21/43) | 0,2258 | 43 |

Comparación con las referencias del paper de MedMNIST v2 en el mismo split:

| Modelo | AUC | Accuracy |
|---|---|---|
| VesselCNN (este modelo) | 0,7219 | 0,7539 |
| ResNet-18 (3D) | 0,874 | 0,877 |
| ResNet-18 con convoluciones ACS | 0,930 | 0,928 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 105.042 parámetros y entradas de 28×28×28 vóxeles, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer y también en entornos sin GPU.
- Opciones de despliegue: PyTorch (paquete `vesselcnn` instalable desde GitHub), ONNX Runtime mediante `vesselcnn.onnx`. No se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | AUC (test) | Accuracy (test) | Licencia |
|---|---|---|---|---|---|
| VesselCNN | 105.042 | 28×28×28 | 0,7219 | 0,7539 | MIT |
| ResNet-18 (3D) | ~100× VesselCNN | 28×28×28 | 0,874 | 0,877 | No disponible |
| ResNet-18 con ACS | ~100× VesselCNN | 28×28×28 | 0,930 | 0,928 | No disponible |

Los datos de ResNet-18 (3D) y ResNet-18 con ACS proceden de las referencias del paper de MedMNIST v2 sobre el mismo split. El autor indica que son modelos aproximadamente 100 veces mayores, entrenados sobre los mismos datos.

## Limitaciones y advertencias

- El modelo no es un detector de aneurismas utilizable: su accuracy (0,7539) está por debajo de la línea base de clase mayoritaria (0,8874) y su recall en aneurisma es de solo 0,4884.
- Elevado número de falsos positivos: 72 de las 93 predicciones de aneurisma son falsas alarmas (precision 0,2258).
- Sesgo documentado hacia el tamaño del segmento: el recall de aneurisma sube con el número de vóxeles no nulos (0,0 en el segundo cuartil de ocupación, 1,0 en el cuartil más voluminoso), mientras la accuracy cae de 1,0 en el cuartil más disperso a 0,4632 en el más voluminoso. Los errores se concentran en volúmenes grandes (ocupación media de 653 vóxeles en errores frente a 365 en aciertos).
- Riesgo de alucinación no aplicable (no es un modelo generativo), pero sí de clasificación errónea sistemática en segmentos pequeños y en vasos sanos voluminosos.
- Uso restringido a investigación y benchmark: no es un dispositivo médico, no se ha evaluado en datos clínicos de MRA y no debe usarse para diagnóstico ni cribado.
- Entrada limitada a volúmenes de 28×28×28 vóxeles de un solo canal; no admite otras resoluciones ni modalidades sin reentrenamiento.
- Solo disponible en inglés a nivel de documentación; el modelo no procesa lenguaje.
- Licencia MIT, que permite uso comercial, pero las advertencias del autor restringen de facto su uso a investigación y benchmark.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/habib-analyst/vesselcnn
- Repositorio y paquete Python: https://github.com/habib-analyst/vesselcnn
- Benchmark MedMNIST v2 (VesselMNIST3D): referencia citada en la model card, sin URL explícita en la información proporcionada.
