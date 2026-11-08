# izamscientist/signature-similarity-convnext-tiny

## Resumen

`signature-similarity-convnext-tiny` es un modelo de verificación de firmas manuscritas desarrollado por el usuario de Hugging Face `izamscientist`. Resuelve una tarea de similitud de imágenes: recibe dos imágenes de firmas y devuelve una puntuación entre 0 y 1 que indica la probabilidad de que ambas hayan sido trazadas por la misma persona. El modelo está diseñado para funcionar en modo *writer-independent*, es decir, sobre firmantes que no han participado en el entrenamiento, lo que es el escenario realista en producción.

Técnicamente se trata de una red siamesa construida sobre un backbone ConvNeXt-Tiny, con pesos en formato PyTorch (`model/best.pt`, 112 MB) y un script de inferencia incluido (`inference.py`) que gestiona el preprocesado y la decisión final. La relevancia práctica del modelo está en que incorpora umbrales calibrados sobre validación (aceptación, rechazo y revisión manual), lo que permite integrarlo en flujos de verificación documental con una zona explícita de revisión humana.

El modelo declara resultados sobre un conjunto de test de 3.000 pares procedentes de 99 escritores de los corpus HMS, CEDAR y BHSig260, con una precisión del 81,5 %, F1 de 0,8209 y ROC-AUC de 0,9017. La licencia es "other" y no se especifican condiciones de uso comercial en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red siamesa con backbone ConvNeXt-Tiny |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en punto flotante) |
| Idiomas soportados | no aplica (entrada de imágenes de firmas manuscritas) |
| Licencia | other |
| Formato de pesos | PyTorch (`model/best.pt`, 112 MB) + `model/config.json` |

## Arquitectura y entrenamiento

El modelo es una red siamesa: dos ramas comparten el backbone ConvNeXt-Tiny para extraer embeddings de cada firma y, a partir de la comparación de esos embeddings, se produce una puntuación de similitud. El repositorio incluye el script exacto que se ejecutó en Kaggle (`kaggle_version_19_train.py`) y una versión reproducible en notebook, lo que permite auditar el pipeline de entrenamiento.

El entrenamiento se realizó sobre los datasets `izamscientist/signature-similarity-v3-train-val` y `izamscientist/signature-similarity-v3-test`. La validación (3.000 pares, 96 escritores) se utilizó para seleccionar la mejor época, los hiperparámetros y los umbrales de decisión. El test (3.000 pares, 99 escritores de HMS, CEDAR y BHSig260) se reservó para una única evaluación final y posteriormente se hizo público para permitir comparaciones. No se especifican en la información disponible el número de tokens ni detalles sobre RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Comparación de dos imágenes de firmas manuscritas y devolución de una puntuación de similitud entre 0 y 1.
- Verificación *writer-independent*: funciona con firmantes no vistos durante el entrenamiento.
- Decisión de tres niveles mediante umbrales calibrados en validación: ACCEPT (≥ 0,9106), REJECT (< 0,5376) y REVIEW (zona intermedia para revisión humana).
- Umbral principal de decisión binaria en 0,7785.
- Preprocesado integrado en `inference.py` que acepta escaneos y fotografías convencionales.
- Extracción de características de imagen (pipeline declarado: `image-feature-extraction`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un modelo puramente visual de comparación.

## Casos de uso

- Verificación de firmas en onboarding bancario digital: el modelo compara la firma del cliente con una firma de referencia registrada y devuelve ACCEPT/REJECT/REVIEW, permitiendo derivar a revisión humana solo los casos dudosos.
- Validación de cheques y documentos financieros: integrado en un pipeline de captura, compara la firma del endoso con la firma registrada del titular antes de procesar el documento.
- Detección de fraude documental: la matriz de confusión muestra que el modelo acepta erróneamente el 21,8 % de los pares de distinta persona, por lo que es adecuado como filtro de primera pasada combinado con revisión experta en la zona REVIEW.
- Digitalización de archivos notariales: comparación masiva de firmas entre documentos históricos y registros para detectar posibles suplantaciones o agrupar documentos por firmante.
- Automatización de procesos de RR. HH.: verificación de firmas en contratos y documentos laborales firmados de forma manuscrita y escaneados.
- Sistemas de gestión documental con triaje: uso del umbral de rechazo (0,5376) para descartar automáticamente pares claramente distintos y reducir la carga de revisión manual.
- Investigación en biometría forense: el conjunto de test público y los scripts de entrenamiento permiten reproducir y comparar nuevos modelos sobre la misma partición.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test `izamscientist/signature-similarity-v3-test` (3.000 pares, 99 escritores no vistos; métricas `verified: false`):

| Metrica | Test | Validacion |
|---|---|---|
| Accuracy | 81,5 % | 81,3 % |
| Balanced accuracy | 81,5 % | 81,3 % |
| Precision | 79,5 % | 80,3 % |
| Recall | 84,8 % | 82,9 % |
| F1 | 0,8209 | 0,8160 |
| Specificity | 78,2 % | 79,7 % |
| FAR | 21,8 % | 20,3 % |
| FRR | 15,2 % | 17,1 % |
| MCC | 0,6314 | 0,6263 |
| ROC-AUC | 0,9017 | 0,8976 |
| Average precision | 0,9032 | 0,9000 |
| EER | 18,5 % | 19,0 % |
| mAP por escritor | 0,9126 | 0,9019 |

Intervalo de confianza al 95 % (remuestreo de escritores, 1.000 iteraciones): accuracy 78,8 %–84,2 %, EER 15,7 %–21,5 %.

Rendimiento por grupo de datos (test):

| Grupo | Accuracy test | EER test |
|---|---|---|
| bhsig_bengali | 82,3 % | 17,5 % |
| bhsig_hindi | 86,3 % | 12,9 % |
| cedar | 81,4 % | 16,9 % |
| hms_bengali | 79,5 % | 19,9 % |
| hms_english | 76,4 % | 22,6 % |
| hms_s | 79,8 % | 20,1 % |

No se han publicado en la información disponible comparaciones con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- El checkpoint pesa 112 MB (`model/best.pt`), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2–4 GB de VRAM libre, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs de portátil.
- También es viable la inferencia en CPU para volúmenes moderados, dado el tamaño reducido del modelo.
- GPU recomendadas para despliegue en producción con concurrencia: NVIDIA T4, L4, A10G, A100 o H100, en función del throughput requerido.
- El repositorio no incluye servidor de inferencia; el despliegue se realiza cargando `inference.py` con PyTorch y torchvision. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- No se han publicado datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos de verificación de firmas evaluados sobre el mismo conjunto de test, ni de comparativas oficiales con alternativas. La comparativa cuantitativa con modelos como redes siamesas clásicas sobre CEDAR o BHSig260 no está disponible en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| signature-similarity-convnext-tiny | no disponible | no aplica | Accuracy 81,5 %, ROC-AUC 0,9017 (test v3) | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasa de falsos positivos elevada: el 21,8 % de los pares de distinta persona se aceptan erróneamente en test, lo que limita su uso como único mecanismo de verificación en entornos de alta seguridad.
- Rendimiento desigual por grupo: los grupos HMS (especialmente HMS English, 76,4 % de accuracy y EER del 22,6 %) están claramente por debajo de los grupos BHSig260 y CEDAR.
- El modelo distingue mejor las coincidencias genuinas (recall 84,8 %) que las falsificaciones (especificidad 78,2 %).
- Los umbrales se calibraron sobre validación con un objetivo de tasa de error del 1 %; en producción pueden requerir recalibración según el dominio y el coste relativo de falsos positivos y negativos.
- Licencia "other": no se especifican en la información disponible las condiciones exactas para uso comercial, por lo que es necesario consultar los términos del autor antes de desplegarlo en producción.
- No hay información sobre sesgos demográficos, geográficos o de estilo de firma más allá de los grupos de datos evaluados.
- Riesgo de degradación con imágenes de baja calidad, rotaciones extremas o firmas muy estilizadas no representadas en el conjunto de entrenamiento; el preprocesado de `inference.py` mitiga parcialmente este punto pero no se documentan sus límites.
- El modelo no verifica la autenticidad frente a falsificaciones expertas de forma fiable por sí solo; debe combinarse con revisión humana en la zona REVIEW.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izamscientist/signature-similarity-convnext-tiny
- Dataset de similitud de firmas: https://huggingface.co/datasets/izamscientist/signature-similarity-data
- Dataset de entrenamiento y validación: https://huggingface.co/datasets/izamscientist/signature-similarity-v3-train-val
- Dataset de test: https://huggingface.co/datasets/izamscientist/signature-similarity-v3-test
