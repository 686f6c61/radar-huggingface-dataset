# habib-analyst/pathocnn

## Resumen

PathoCNN es una red neuronal convolucional compacta desarrollada por Habib Ur Rehman para clasificación de imágenes histológicas de colon y recto en parches de 28×28 píxeles. El modelo resuelve una tarea de clasificación de 9 clases sobre el conjunto de datos PathMNIST (parte de MedMNIST v2), que incluye tejidos como epitelio de adenocarcinoma colorrectal, estroma asociado a cáncer, músculo liso, linfocitos y mucosidad, entre otros. Con solo 288.809 parámetros entrenables, se posiciona como una alternativa ligera a las arquitecturas de referencia tipo ResNet empleadas habitualmente en este benchmark.

La relevancia del modelo reside en su enfoque de reproducibilidad: el autor publica los pesos en tres formatos (safetensors, checkpoint de PyTorch y ONNX) junto con un script que recalcula todas las métricas principales a partir de los artefactos incluidos. Además, el conjunto de test empleado (CRC-VAL-HE-7K) procede de un centro clínico distinto al de entrenamiento, por lo que las métricas reportadas incorporan una brecha real de generalización entre centros.

El modelo se distribuye bajo licencia MIT y está etiquetado únicamente para inglés, aunque su naturaleza es de clasificación de imágenes y no de generación de texto. Es importante subrayar que se trata de un modelo de benchmark sobre parches de 28×28, no de un dispositivo médico, y que no ha sido evaluado con datos clínicos de portaobjetos completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (3 bloques convolucionales 32→64→128 con BatchNorm, ReLU, max-pool y dropout, más cabeza MLP de 2 capas) |
| Parámetros totales | 288.809 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors, PyTorch y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiqueta declarada; la tarea es clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), PyTorch (`assets/pathocnn.pt`), ONNX (`pathocnn.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta diseñada desde cero, compuesta por tres bloques convolucionales con 32, 64 y 128 canales respectivamente. Cada bloque incluye BatchNorm, activación ReLU, max-pooling y dropout. La cabeza clasificadora es un MLP de dos capas que produce logits para las 9 clases de PathMNIST. El modelo completo ocupa 1,2 MB en formato safetensors. La entrada esperada es un tensor RGB de 28×28 píxeles normalizado por canal con las estadísticas del split de entrenamiento de PathMNIST (media [0.74055, 0.53298, 0.70583] y desviación típica [0.12368, 0.17676, 0.12443]).

El entrenamiento se realizó desde cero sobre el split de entrenamiento de PathMNIST (89.996 parches) durante 12 épocas, con el optimizador AdamW (learning rate 2e-3, weight decay 1e-4) y un scheduler OneCycle. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de ajuste por preferencias, algo esperable en un modelo de clasificación de imágenes. Como innovación destacable en términos de ingeniería, el autor señala una advertencia de protocolo: las estadísticas de normalización del split de entrenamiento deben calcularse con acumulación en float64 por bloques, ya que una reducción única en float32 sobre ~90.000 imágenes devuelve medias de canal incorrectas de forma silenciosa.

## Capacidades

- Clasificación de imágenes histológicas en 9 clases: adipose, background, debris, lymphocytes, mucus, smooth muscle, normal colon mucosa, cancer-associated stroma y colorectal adenocarcinoma epithelium.
- Salida de probabilidades por clase (softmax) y etiqueta predicha con nivel de confianza.
- Inferencia en tres formatos: PyTorch (safetensors y checkpoint), y ONNX con paridad medida frente a PyTorch (diferencia máxima de logits de 5,7e-06).
- Preprocesamiento documentado y reproducible: redimensionado a 28×28, escalado a [0,1] y normalización por canal con estadísticas del split de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de visión general más allá de la clasificación de parches histológicos de 28×28.
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Clasificación de parches histológicos en pipelines de investigación: el modelo puede integrarse como etapa de clasificación en flujos de preprocesamiento de imágenes de tejido colorrectal, etiquetando parches de 28×28 en las 9 categorías de PathMNIST para experimentos de benchmark y comparación de arquitecturas.
- Validación de reproducibilidad en publicaciones: gracias al script `examples/verify_metrics.py`, un investigador puede recalcular exactitud, AUC, matriz de confusión y recall por clase a partir de los pesos publicados, lo que lo hace adecuado como referencia verificable en estudios sobre MedMNIST.
- Prototipado rápido en entornos con recursos limitados: con 288.809 parámetros y 1,2 MB de pesos, el modelo cabe holgadamente en CPU y en GPUs de gama baja, lo que permite desplegar demos educativas o pruebas de concepto sin infraestructura dedicada.
- Despliegue en producción mediante ONNX Runtime: el archivo `pathocnn.onnx` con paridad verificada frente a PyTorch permite integrar el clasificador en servicios de inferencia ligeros, contenedores o aplicaciones edge donde el coste computacional es crítico.
- Docencia y formación en visión artificial médica: el modelo sirve como ejemplo didáctico de entrenamiento desde cero, evaluación con brecha entre centros y análisis honesto de errores por clase (por ejemplo, la confusión entre estroma y debris).
- Investigación sobre generalización entre centros: al evaluarse sobre CRC-VAL-HE-7K, recolectado en un centro clínico distinto al de entrenamiento, el modelo permite estudiar la degradación de métricas en escenarios de dominio desplazado y comparar con arquitecturas mayores.
- Análisis de errores y calibración de clasificadores: la documentación detalla el recall por clase y la matriz de confusión, lo que facilita su uso como caso de estudio en técnicas de detección de clases problemáticas y ajuste de umbrales.

## Benchmarks y rendimiento

Resultados reportados sobre el split de test de PathMNIST (CRC-VAL-HE-7K, n = 7.180), reproducidos el 2026-10-28 según el autor:

| Métrica | Valor |
|---|---|
| Exactitud | 0,8712 (6.255/7.180) |
| AUC macro (one-vs-rest) | 0,9855 |
| Exactitud balanceada | 0,8251 |
| Baseline de clase mayoritaria | 0,1864 |
| Mejor exactitud de validación (época 11) | 0,9629 |
| Mejor AUC de validación | 0,9987 |

Recall por clase en test:

| Clase | Recall |
|---|---|
| adipose | 0,9477 |
| background | 1,0000 |
| debris | 0,7817 |
| lymphocytes | 0,9101 |
| mucus | 0,8483 |
| smooth muscle | 0,7348 |
| normal colon mucosa | 0,8516 |
| cancer-associated stroma | 0,3848 |
| colorectal adenocarcinoma epithelium | 0,9667 |

Comparación con referencias citadas por el autor (MedMNIST v2): ResNet-18 (11,7M de parámetros, ~40× mayor) reporta 0,907 de exactitud y 0,983 de AUC; ResNet-50 reporta 0,911 y 0,990. PathoCNN se sitúa en esa banda de AUC, pero queda ~3,6 puntos por debajo en exactitud.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; el modelo ocupa 1,2 MB en safetensors y 288.809 parámetros, por lo que cabe en cualquier GPU con unos pocos MB libres.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problema. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3050, RTX 4090) es más que suficiente.
- Cabe en cualquier GPU consumer y también en entornos sin GPU, incluidos dispositivos edge y Raspberry Pi.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (recomendado para producción ligera), y el paquete Python `pathocnn` instalable desde GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo y la entrada de 28×28, se espera una latencia muy baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud en PathMNIST test | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PathoCNN | 288.809 | no aplica | 0,8712 | 0,9855 | MIT | HuggingFace, GitHub, ONNX |
| ResNet-18 (referencia MedMNIST v2) | 11,7M | no aplica | 0,907 | 0,983 | no disponible en la información | Referencia del paper MedMNIST v2 |
| ResNet-50 (referencia MedMNIST v2) | no disponible en la información | no aplica | 0,911 | 0,990 | no disponible en la información | Referencia del paper MedMNIST v2 |
| SonoCNN (modelo hermano, BreastMNIST) | no disponible en la información | no aplica | no disponible | no disponible | no disponible en la información | Mencionado como release hermano |

## Limitaciones y advertencias

- El modelo falla de forma notable en la clase cancer-associated stroma: recall de 0,3848, con 155 de 421 parches de estroma clasificados como debris. La precisión de debris es solo 0,4417, lo que indica que la mayoría de predicciones de esa clase son erróneas.
- No es un dispositivo médico: el autor lo declara explícitamente para uso de investigación y benchmark. No ha sido evaluado con datos clínicos de portaobjetos completos y no debe usarse para diagnóstico ni cribado.
- Brecha de generalización entre centros: la exactitud en test (0,8712) es inferior a la de validación en el mismo centro (0,9629), lo que refleja el desplazamiento de dominio entre el centro de entrenamiento y el de recolección del test.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza, como demuestra el demo con parches de músculo liso y estroma leídos como debris con 95,4 % y 99,7 % de confianza.
- Limitaciones de entrada: solo acepta parches de 28×28 píxeles; no procesa imágenes de mayor resolución sin redimensionado, lo que puede perder información morfológica relevante.
- Limitaciones de idioma: la etiqueta de idioma es inglés, aunque al ser un clasificador de imágenes no procesa texto.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el autor restringe explícitamente el uso a investigación y benchmark, no a aplicaciones clínicas.
- Caveat de protocolo: las estadísticas de normalización deben calcularse en float64 por bloques; una reducción en float32 produce medias de canal incorrectas de forma silenciosa, lo que invalida reproducciones.
- El intervalo de confianza al 95 % de la exactitud sobre 7.180 parches es de aproximadamente ±0,8 puntos (≈0,863–0,879), por lo que diferencias menores deben interpretarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/habib-analyst/pathocnn
- Repositorio GitHub: https://github.com/habib-analyst/pathocnn
- Paper MedMNIST v2 (referencia de benchmark): no disponible en la información proporcionada
- Demo o espacios asociados: no disponibles en la información proporcionada
- Paper del modelo: no disponible en la información proporcionada
