# motazalqaoud/oncology-skin-lesion-weights

## Resumen

El modelo oncology-skin-lesion-weights es un clasificador de imágenes dermatoscópicas de siete clases publicado en Hugging Face por Motaz Alqaoud (PhD). Se basa en EfficientNet-B0 preentrenado en ImageNet, cuya cabeza de clasificación se sustituye por una pila de dropout, capa lineal, ReLU, dropout y capa lineal, y se ajusta sobre el conjunto HAM10000. No es un modelo de lenguaje: es un clasificador de imagen completa (no segmentación a nivel de píxel) con un checkpoint de 16,8 MB distribuido bajo licencia MIT.

Resuelve la tarea de asignar una imagen dermatoscópica a una de siete categorías diagnósticas —akiec, bcc, bkl, df, mel, nv y vasc—, de las cuales tres (akiec, bcc y mel) son malignas o premalignas. El proyecto declara explícitamente que su finalidad es la investigación y la demostración de cartera, no el uso clínico.

Su relevancia es fundamentalmente metodológica: introduce separación a nivel de lesión (no de imagen) para evitar fugas de información entre entrenamiento y prueba, pérdida ponderada por frecuencia inversa de clase y reporte específico de sensibilidad en clases malignas, una métrica que la exactitud global oculta. Con un 83,1% de exactitud en siete clases, su sensibilidad maligna cae al 64,4%, lo que se traduce en 101 lesiones malignas no detectadas de 284.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 preentrenado en ImageNet, con cabeza de clasificación propia (dropout, lineal, ReLU, dropout, lineal) |
| Parámetros totales | No disponible en la model card (la arquitectura base EfficientNet-B0 declara aproximadamente 5,3 millones de parámetros en su configuración original) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; procesa una imagen por inferencia) |
| Tipos de cuantización | No disponible (se publica un único checkpoint PyTorch sin variantes cuantizadas) |
| Idiomas soportados | No aplica (clasificación de imágenes, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (`.pth`); archivo `best_model.pth` de 16,8 MB |
| Tarea | Clasificación de imagen completa en 7 clases diagnósticas |
| Número de clases | 7: akiec, bcc, bkl, df, mel, nv, vasc |
| Clases malignas o premalignas | 3: akiec, bcc, mel |
| Dataset de entrenamiento | HAM10000 (10.015 imágenes dermatoscópicas) |
| Métricas declaradas | Accuracy, ROC-AUC macro, sensibilidad y especificidad de clases malignas |

## Arquitectura y entrenamiento

La columna vertebral es EfficientNet-B0 con pesos `EfficientNet_B0_Weights.IMAGENET1K_V1`. La cabeza original de clasificación se reemplaza por una secuencia dropout, capa lineal, ReLU, dropout y capa lineal, ajustada sobre HAM10000. Es, por tanto, un transformer no: se trata de una red convolucional con compound scaling y bloques MBConv. El proyecto es de clasificación de imagen completa, no de segmentación a nivel de píxel.

El entrenamiento utiliza HAM10000 (Tschandl et al., 2018), 10.015 imágenes dermatoscópicas con etiqueta verificada por histopatología, consenso de expertos, microscopía confocal o seguimiento. El reparto es de 7.055 imágenes de entrenamiento, 1.475 de validación y 1.485 de prueba, con división estratificada a nivel de lesión, ya que HAM10000 contiene fotografías repetidas de la misma lesión y dividir por imagen filtraría información entre entrenamiento y prueba. Para abordar el fuerte desbalance (la clase `nv` supone en torno al 67% de las imágenes, mientras que `df` y `vasc` quedan por debajo del 2% cada una) se emplea una pérdida ponderada por frecuencia inversa de clase en lugar de sobremuestreo ingenuo.

## Capacidades

- Clasificación de lesiones dermatoscópicas en siete categorías diagnósticas con una única inferencia por imagen.
- Marcado de malignidad: identifica las tres clases malignas o premalignas (akiec, bcc y mel) frente a las benignas.
- Evaluación binaria derivada (maligno/benigno) con ROC-AUC de 0,920 y matriz de confusión publicada.
- Alta especificidad en la detección de malignidad (94,1%), útil para reducir falsos positivos.
- Carga reproducible mediante `build_model()` y `load_state_dict` con `huggingface_hub`, y espejo del checkpoint en una release de GitHub.
- No soporta tool calling ni function calling: no es un modelo generativo ni de agentes.
- No soporta razonamiento multi-paso, generación de texto, código ni matemáticas.
- No tiene capacidades multilingües ni modo de pensamiento, visión multimodal general, audio o vídeo.
- No procesa metadatos clínicos del paciente; la entrada es únicamente la imagen.

## Casos de uso

- Docencia y formación en IA médica: el modelo sirve como caso de estudio para explicar por qué la exactitud agregada engaña, usando el contraste entre un 83,1% de accuracy y un 64,4% de sensibilidad maligna con 101 falsos negativos.
- Investigación metodológica sobre desbalance de clases: permite comparar experimentalmente la pérdida ponderada por frecuencia inversa frente a sobremuestreo u otras estrategias, con un reparto de referencia ya publicado.
- Benchmarking de arquitecturas en HAM10000: el split a nivel de lesión (7.055/1.475/1.485) y las métricas publicadas ofrecen una línea base reproducible para evaluar backbones mayores, aumentación más agresiva o ensembles.
- Auditoría de fugas de datos: al fijar explícitamente la división por lesión, el modelo permite reproducir y cuantificar el error que introduce una división aleatoria por imagen.
- Prototipos y aplicaciones de demostración: integrarlo en una aplicación web que clasifique una imagen y marque las clases malignas, siempre acompañada del aviso de que no es un producto sanitario.
- Preetiquetado y cribado de colecciones de imágenes: su especificidad del 94,1% lo hace apropiado para priorizar la revisión humana en grandes volúmenes de imágenes dermatoscópicas, nunca como decisión automática.
- Componente en pipelines de investigación: exportable a TorchScript u ONNX y desplegable tras una API (por ejemplo, FastAPI) para experimentos internos reproducibles.

## Benchmarks y rendimiento

Evaluación completa sobre el reparto de prueba reservado (1.485 imágenes, división a nivel de lesión), mediante `src/evaluate.py` del repositorio de código.

| Métrica | Valor |
|---|---|
| Accuracy en 7 clases | 83,1% |
| ROC-AUC macro | 0,9647 |
| Sensibilidad de clases malignas | 64,4% |
| Especificidad de clases malignas | 94,1% |
| ROC-AUC binario (maligno/benigno) | 0,920 |
| Falsos negativos (malignas no detectadas) | 101 de 284 |
| Matriz de confusión binaria | TP=183, FN=101, FP=71, TN=1130 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos sobre el mismo reparto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con lotes pequeños, dado que el checkpoint ocupa 16,8 MB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; no requiere A100 ni H100. Una RTX 3060, una RTX 4090 o una GTX 1650 cubren de sobra el caso de uso.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también es viable la inferencia en CPU.
- Opciones de despliegue: PyTorch nativo, TorchScript, exportación a ONNX con ONNX Runtime, TorchServe o un servicio propio con FastAPI. No aplican llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje ni se publican pesos GGUF.
- Latencia y throughput: no se publican mediciones. Por el tamaño del modelo (aproximadamente 5 millones de parámetros y 16,8 MB) es esperable una latencia del orden de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero se trata de una estimación, no de un dato verificado.

## Comparativa con modelos similares

En la información disponible no se han encontrado model cards comparables con métricas publicadas sobre HAM10000. Los trabajos localizados son publicaciones académicas sin model card asociada ni cifras reproducibles en la información consultada.

| Modelo | Arquitectura | Parámetros | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oncology-skin-lesion-weights (este modelo) | EfficientNet-B0 + cabeza propia | No disponible (base, aproximadamente 5,3 M) | Accuracy 7 clases 83,1%; sensibilidad maligna 64,4%; especificidad maligna 94,1%; ROC-AUC macro 0,9647 | MIT | Hugging Face y release de GitHub |
| Ensemble EfficientNet-B3 + XGBoost (ResearchGate) | EfficientNet-B3 + XGBoost con datos clínicos | No disponible | No disponible | No disponible | Publicación |
| Transfer learning con VGG16 (IJERT) | VGG16 | No disponible | No disponible | No disponible | Publicación |
| Framework con metadatos de paciente (Nature) | No disponible | No disponible | No disponible | No disponible | Publicación |

## Limitaciones y advertencias

- No es un producto sanitario: no ha sido validado de forma prospectiva ni revisado por ningún organismo regulador, y no debe usarse para emitir o descartar un diagnóstico.
- Sensibilidad maligna insuficiente para cribado: el 64,4% implica que se escapan 101 de 284 lesiones malignas. Se requeriría un backbone mayor, aumentación más agresiva, un ensemble o un umbral operativo de mayor sensibilidad antes de plantear cualquier uso asistencial.
- Sesgo de tono de piel: HAM10000 está sesgado hacia tipos de piel claros según Fitzpatrick, limitación documentada de la mayoría de los conjuntos públicos de dermatología.
- Desbalance de clases severo: `nv` concentra cerca del 67% de las imágenes y `df` y `vasc` no llegan al 2% cada una, lo que reduce la fiabilidad en clases minoritarias.
- Validación retrospectiva y limitada: los resultados proceden de un único conjunto de datos, sin validación externa ni prospectiva.
- Falsos positivos: 71 casos benignos clasificados como malignos en la matriz binaria, con el coste clínico y de ansiedad que ello implica.
- Cobertura funcional estrecha: sin soporte de texto, metadatos clínicos, tool calling, agentes ni contexto largo; cualquier descripción de esas capacidades sería incorrecta.
- Licencia MIT para el artefacto, pero el uso clínico queda fuera del alcance declarado por el autor; además, el uso del conjunto HAM10000 está sujeto a sus propias condiciones de cita y atribución.
- Proyecto declarado de investigación y cartera, con 0 descargas y 0 «likes» en el momento de la consulta: no existe evidencia de adopción ni de mantenimiento por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/motazalqaoud/oncology-skin-lesion-weights
- Repositorio de código: https://github.com/motazalqaoud/Oncology-diagnosis-using-CNN
- Definición del modelo: https://github.com/motazalqaoud/Oncology-diagnosis-using-CNN/blob/main/model.py
- Release con el espejo del checkpoint: https://github.com/motazalqaoud/Oncology-diagnosis-using-CNN/releases/tag/v1.0.0
- Conjunto de datos HAM10000: https://doi.org/10.7910/DVN/DBW86T
- Artículo de HAM10000 (Tschandl et al., 2018, Scientific Data): https://doi.org/10.7910/DVN/DBW86T
- Perfil del autor en GitHub: https://github.com/motazalqaoud
- Perfil del autor en LinkedIn: https://linkedin.com/in/motazalqaoud
- Trabajo relacionado (IJERT, transfer learning con VGG16): https://www.ijert.org/skin-cancer-detection-using-cnn-and-transfer-learning-techniques-ijertv15is090475
- Trabajo relacionado (ResearchGate, ensemble EfficientNet-B3 + XGBoost): https://www.researchgate.net/publication/412799472_A_Deep_Learning_Based_Framework_for_Skin_Cancer_Detection_Using_a_Layered_Software_Architecture_with_Transfer_Learning
- Trabajo relacionado (Nature, clasificación con metadatos de paciente): https://www.nature.com/articles/s41598-025-26392-4
