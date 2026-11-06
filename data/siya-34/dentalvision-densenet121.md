# Siya-34/dentalvision-densenet121

## Resumen

DentalVision AI es un clasificador multi-etiqueta de imágenes de radiografía panorámica dental (OPG, ortopantomografía) desarrollado por el usuario Siya-34. El repositorio aloja los pesos de un componente DenseNet121 que forma parte de un ensemble mayor junto con EfficientNetB3 y ConvNeXt-Tiny, según indica la model card del autor. El modelo resuelve la tarea de detectar de forma independiente seis hallazgos radiológicos: dientes sanos, caries, dientes impactados, infección, dientes fracturados y BDC/BDR (quiste dentígero / reabsorción radicular, según la abreviatura empleada por el autor).

Se trata de un prototipo de investigación y uso educativo, no de una herramienta diagnóstica. Con 7.043.654 parámetros y pesos en formato safetensors, está diseñado para recibir imágenes RGB de 256x512 píxeles y devolver seis probabilidades sigmoides independientes. La relevancia del modelo es limitada por su escala: el conjunto de datos de entrenamiento consta únicamente de 230 radiografías únicas tras eliminar duplicados, procedentes de una sola fuente (Kaggle), sin validación externa ni identificadores de paciente.

El modelo se publica bajo licencia Apache 2.0 y está etiquetado como `research-prototype`. Su valor principal reside en servir como referencia reproducible para pipelines de clasificación multi-etiqueta en imagen médica dental con técnicas de explicabilidad (Grad-CAM), más que como solución lista para producción clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DenseNet121 (componente de un ensemble con EfficientNetB3 y ConvNeXt-Tiny) |
| Parámetros totales | 7.043.654 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en DenseNet121, una red convolucional con conexiones densas entre capas, adaptada mediante transfer learning desde pesos de ImageNet. La entrada es una imagen RGB redimensionada bilinealmente a 256x512 píxeles (alto x ancho) y normalizada con media y desviación estándar de ImageNet. La salida son seis probabilidades sigmoides independientes, una por hallazgo, en el orden: 0 = dientes sanos, 1 = caries, 2 = dientes impactados, 3 = infección, 4 = dientes fracturados, 5 = BDC/BDR.

El entrenamiento empleó pérdida BCE (entropía cruzada binaria) con pesos de clase positiva, optimizador AdamW, schedule coseno y early stopping sobre el macro-AUC de validación. Los datos provienen del dataset de Kaggle `imtkaggleteam/dental-opg-xray-dataset`, que no se redistribuye; tras eliminar copias idénticas a nivel de byte almacenadas en varias carpetas de clase, quedaron 230 radiografías únicas. La model card menciona el uso de Grad-CAM como técnica de explicabilidad, aunque no detalla la innovación arquitectónica más allá del ensemble de tres backbones.

## Capacidades

- Clasificación multi-etiqueta de seis hallazgos en radiografías panorámicas dentales: dientes sanos, caries, dientes impactados, infección, dientes fracturados y BDC/BDR.
- Salida de seis probabilidades sigmoides independientes, lo que permite que varios hallazgos estén presentes simultáneamente en la misma imagen.
- Preprocesado de imagen definido: redimensionado bilineal a 256x512 y normalización ImageNet.
- Explicabilidad mediante Grad-CAM, según las etiquetas del repositorio.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual de clasificación.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Investigación académica en clasificación multi-etiqueta de imagen médica dental: el modelo sirve como baseline reproducible con métricas documentadas (macro-AUC, mAP, macro-F1) para comparar nuevas arquitecturas sobre el mismo dataset de Kaggle.
- Docencia en cursos de visión por computador aplicada a medicina: permite ilustrar el flujo completo de transfer learning desde ImageNet, manejo de desbalanceo con pesos de clase y evaluación con macro-AUC en un problema real de radiología dental.
- Prototipado de herramientas de triaje asistido: en un entorno de investigación, el modelo podría prefiltrar radiografías panorámicas y señalar posibles hallazgos para revisión posterior por un profesional, nunca como decisión autónoma.
- Generación de mapas de calor con Grad-CAM para análisis de atención: útil para estudiar qué regiones de la radiografía activan cada clase y detectar posibles sesgos del clasificador.
- Integración en pipelines de experimentación con PyTorch: al publicarse en safetensors y con la librería PyTorch, se puede cargar en scripts de entrenamiento y evaluación sin dependencias propietarias.
- Estudio de ensembles multimodelo: al formar parte de un ensemble con EfficientNetB3 y ConvNeXt-Tiny, el componente DenseNet121 puede analizarse de forma aislada para medir su contribución al rendimiento global.
- Comparación de estrategias de aumento de datos y regularización en datasets pequeños (230 imágenes), un escenario frecuente en imagen médica con recursos limitados.

## Benchmarks y rendimiento

| Evaluación | Macro AUC | mAP | Macro F1 |
|---|---|---|---|
| Test fold-0 (n=37) | 0,659 | 0,648 | 0,566 |
| Out-of-fold agrupado de 6 folds (230 imágenes) | 0,643 | 0,554 | 0,524 |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas internas del autor recogidas en la tabla anterior. No hay comparación con MMLU, HumanEval, GSM8K ni otros benchmarks estándar, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 7,04 millones de parámetros; en la práctica, menos de 2 GB incluyendo buffers de activación para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA RTX 4090, A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo, salvo para procesar lotes muy grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (carga directa de safetensors), TorchScript, ONNX Runtime; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DentalVision AI - DenseNet121 | 7,04 M | Imagen 256x512 | Macro AUC 0,643 (OOF) | Apache 2.0 | Hugging Face |
| DenseNet121 ImageNet (torchvision) | 7,98 M | Imagen 224x224 | No comparable (1000 clases generales) | BSD-3-Clause | torchvision |
| EfficientNetB3 ImageNet | 12,2 M | Imagen 300x300 | No comparable (1000 clases generales) | Apache 2.0 | torchvision / timm |
| ConvNeXt-Tiny ImageNet | 28,6 M | Imagen 224x224 | No comparable (1000 clases generales) | MIT | torchvision / timm |

No se dispone de información sobre otros clasificadores dentales comparables publicados con métricas equivalentes en la documentación proporcionada.

## Limitaciones y advertencias

- Conjunto de datos muy pequeño: 230 radiografías únicas tras deduplicación, lo que limita la generalización y hace que las métricas tengan alta varianza (el test fold-0 tiene solo n=37).
- Fuente única de datos (Kaggle `imtkaggleteam/dental-opg-xray-dataset`), sin validación externa en otras poblaciones, equipos o protocolos de adquisición.
- Ausencia de identificadores de paciente, lo que impide garantizar que no haya fuga de datos entre particiones más allá de la deduplicación por bytes.
- Hallazgos raros infrarrepresentados, lo que afecta al rendimiento en clases minoritarias y al macro-F1 (0,524 en OOF).
- Riesgo de alucinación o falsos positivos/negativos: el modelo es un prototipo educativo y no una herramienta diagnóstica; sus predicciones deben ser revisadas por profesionales dentales cualificados.
- No apto para uso clínico ni para toma de decisiones médicas; la propia model card lo etiqueta como `research-prototype`.
- Licencia Apache 2.0 permite uso comercial del código y pesos, pero las limitaciones técnicas y la ausencia de validación clínica desaconsejan cualquier despliegue en producción sanitaria.
- No se documentan sesgos demográficos ni análisis de equidad; al ser un dataset único, es probable que el modelo herede sesgos de la fuente.
- Sin información sobre cuantización ni optimizaciones de despliegue publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/Siya-34/dentalvision-densenet121
- Dataset de entrenamiento (Kaggle, no redistribuido): https://www.kaggle.com/datasets/imtkaggleteam/dental-opg-xray-dataset
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
