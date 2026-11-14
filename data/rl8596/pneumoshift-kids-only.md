# RL8596/pneumoshift-kids-only

## Resumen

PneumoShift kids_only es un clasificador de imagen binario desarrollado por el usuario RL8596 (proyecto de estudiante) que estima la probabilidad de que una radiografía de tórax frontal muestre neumonía. Se basa en una ResNet-18 preentrenada en ImageNet (`resnet18.tv_in1k`) y ajustada con 4.578 radiografías pediátricas del dataset Kermany (niños de 1 a 5 años, un único hospital de Guangzhou, China). El modelo forma parte de un experimento de investigación que estudia si un clasificador entrenado exclusivamente con población infantil mantiene su utilidad al aplicarse sobre adultos.

Con 11.186.625 parámetros, es un modelo compacto de visión por computador, no un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que emite una única salida sigmoide (probabilidad de neumonía) con calibración por temperatura. Incluye un umbral de decisión fijado a 0,9855 para garantizar una sensibilidad del 95 % en validación y un mecanismo de aviso de datos fuera de distribución (`ood.npz`) que señala radiografías que se alejan de su distribución de entrenamiento.

Su relevancia es acotada y estrictamente investigadora: sirve para estudiar el desplazamiento de dominio entre poblaciones pediátricas y adultas, y para ilustrar cómo un modelo con buenas métricas en su cohorte de origen pierde rendimiento al cambiar de hospital, edad o equipo de rayos X. El autor declara explícitamente que no es un dispositivo médico y que no debe usarse para diagnóstico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (timm, `resnet18.tv_in1k`) |
| Parametros totales | 11.186.625 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, una imagen por inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificación de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificación de imagen binaria (neumonía / no neumonía) |
| Entrada | Radiografía de tórax frontal (imagen PIL) |
| Salida | Probabilidad calibrada, flag binario, heatmap, nivel OOD |
| Umbral de decisión | 0,9855 (95 % de sensibilidad en validación) |
| Calibración | Temperature scaling (sigmoid(logit / 1.025)) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estándar con pesos inicializados desde `resnet18.tv_in1k` (entrenamiento en ImageNet-1k vía timm) y una cabeza de clasificación con una única salida. El ajuste se realizó sobre 4.578 radiografías de tórax de niños de 1 a 5 años procedentes del dataset de Kermany et al. 2018 (un hospital de Guangzhou, China, licencia CC BY 4.0), en una tarea binaria de neumonía frente a normalidad. No se documenta en la información disponible el número de épocas, el optimizador, la resolución de entrada, el esquema de aumentos de datos ni si hubo congelación de capas.

El modelo aplica calibración por temperatura (`sigmoid(logit / 1.025)`) para ajustar las probabilidades, y fija el umbral de decisión en 0,9855 para alcanzar el 95 % de sensibilidad en el conjunto de validación. Adicionalmente, se distribuye un fichero `ood.npz` con estadísticas para emitir una advertencia cuando la imagen de entrada se aleja de la distribución de entrenamiento. No se menciona uso de RLHF, DPO ni técnicas de aumento de datos específicas; el interés técnico del proyecto reside en el análisis de desplazamiento de dominio entre cohortes pediátricas y adultas, no en innovaciones arquitectónicas.

## Capacidades

- Clasificación binaria de radiografías de tórax frontales: devuelve la probabilidad de neumonía y una etiqueta de flag según el umbral 0,9855.
- Calibración de probabilidades mediante temperature scaling, lo que permite interpretar la salida como una probabilidad aproximada y no solo como un score.
- Generación de mapas de calor (heatmap) asociados a la predicción, según la interfaz `Predictor` documentada por el autor.
- Detección de datos fuera de distribución (OOD): emite un nivel de aviso cuando la imagen no se parece a las radiografías de entrenamiento.
- Procesamiento de una única imagen por inferencia; no soporta lotes con contexto, texto, tool calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión general, de audio ni de modo de pensamiento extendido.

## Casos de uso

- Investigación sobre desplazamiento de dominio en imagen médica: comparar el rendimiento del modelo entre la cohorte pediátrica de Kermany y la cohorte adulta de RSNA para cuantificar la caída de sensibilidad (0,979 en niños frente a 0,781 en adultos) y estudiar estrategias de adaptación de dominio.
- Docencia en cursos de aprendizaje profundo aplicado a imagen médica: usar el modelo como ejemplo reproducible de fine-tuning de una ResNet-18 con timm, calibración por temperatura y umbral fijado por sensibilidad objetivo.
- Evaluación de pipelines de clasificación con aviso OOD: integrar el modelo en un prototipo que descarte o derive a revisión manual las radiografías marcadas como fuera de distribución, aprovechando el fichero `ood.npz`.
- Triaje experimental en entornos de investigación: priorizar radiografías pediátricas con alta probabilidad de neumonía para revisión por un clínico, siempre en contexto de estudio y nunca como diagnóstico autónomo.
- Análisis de calibración y umbrales: estudiar el compromiso sensibilidad/especificidad variando el umbral alrededor de 0,9855 y comparar curvas ROC/AUROC entre subpoblaciones (niños frente a adultos).
- Generación de heatmaps para inspección cualitativa: revisar qué regiones de la radiografía activan la predicción y discutir limitaciones de explicabilidad en modelos pequeños entrenados con datos limitados.
- Benchmark de referencia para modelos pediátricos: emplear las métricas publicadas (AUROC 0,975 en niños, 0,953 en adultos con opacidad pulmonar) como línea base en experimentos de comparación con arquitecturas mayores o con modelos multimodales.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos de test no usados en entrenamiento:

| Conjunto de test | N | Sensibilidad | Especificidad | AUROC |
|---|---|---|---|---|
| children_test (Kermany, neumonía vs normal) | 624 | 0,979 | 0,868 | 0,975 |
| adults_test (RSNA, opacidad pulmonar vs normal) | 4.242 | 0,781 | 0,960 | 0,953 |
| adults_test (RSNA, opacidad pulmonar vs todo lo demás) | 7.694 | 0,781 | 0,738 | 0,824 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para una ResNet-18 de 11,2 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo buffers de activación para una imagen.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también tarjetas de gama baja (GTX 1650, T4) y CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer y en entornos sin GPU; el cuello de botella no es el modelo sino el preprocesado de la imagen.
- Opciones de despliegue: inferencia nativa con PyTorch/timm; exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; el paquete `pneumoshift.inference` del autor envuelve el predictor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PneumoShift kids_only | ResNet-18 (timm) | 11,2 M | 1 radiografía frontal | AUROC 0,975 (niños), 0,953 (adultos, opacidad vs normal) | MIT | Hugging Face |
| CheXpert / modelos tipo DenseNet-121 para radiografía | CNN (DenseNet-121) | ~8 M | 1 radiografía frontal | Métricas multi-etiqueta sobre CheXpert; no comparable directamente por tarea y cohorte | Varía según checkpoint | Repositorios académicos y Hugging Face |
| TorchXRayVision (DenseNet-121) | CNN (DenseNet-121) | ~8 M | 1 radiografía frontal | Métricas multi-patología sobre varios datasets; no comparable directamente | Apache 2.0 (según versión) | Hugging Face / GitHub |

La comparación es orientativa: no se dispone de una evaluación cruzada en los mismos conjuntos de test, por lo que los números no son directamente equiparables. Los modelos multi-etiqueta como TorchXRayVision cubren más patologías, mientras que PneumoShift está restringido a neumonía binaria.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no es un dispositivo médico y que no debe usarse para diagnóstico ni tratamiento.
- Sesgo de cohorte: entrenado solo con niños de 1 a 5 años de un único hospital de Guangzhou; para otras edades, hospitales o equipos de rayos X puede equivocarse con alta confianza.
- Caída de rendimiento en adultos: la sensibilidad baja de 0,979 en niños a 0,781 en adultos (RSNA), y la especificidad cae a 0,738 cuando se evalúa contra todo lo demás.
- Tarea binaria: solo distingue neumonía frente a no neumonía; no reconoce otros hallazgos radiológicos.
- Aviso OOD incompleto: el mecanismo de detección de datos fuera de distribución captura muchas radiografías atípicas, pero no todas.
- Sin validación regulatoria: no ha sido revisado por ninguna autoridad sanitaria.
- Riesgo de alucinación en sentido amplio: al ser un clasificador, el riesgo equivalente es la confianza excesiva en predicciones erróneas, especialmente fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero ello no exime de las advertencias clínicas del autor ni de la responsabilidad regulatoria aplicable a software sanitario.
- Sin datos sobre sesgos demográficos más allá de edad y origen geográfico; no se documentan métricas por sexo, etnia ni otras variables.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL8596/pneumoshift-kids-only
- Dataset Kermany et al. 2018 (Chest X-Ray Images, CC BY 4.0): https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
- RSNA Pneumonia Detection Challenge 2018: https://www.kaggle.com/c/rsna-pneumonia-detection-challenge
- timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales asociados al modelo.
