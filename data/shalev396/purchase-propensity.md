# shalev396/purchase-propensity

## Resumen

purchase-propensity es un modelo de clasificacion tabular publicado por el usuario shalev396 dentro de su proyecto ml-lab. No es un modelo de lenguaje: resuelve un problema muy concreto de comercio electronico, predecir si una sesion web de un dia terminara en pedido, a partir de 23 flags binarias de sesion (anadio al carrito, vio el checkout, inicio sesion, tipo de dispositivo, visitante recurrente, etc.). Se distribuyen dos variantes: una regresion logistica con balanceo de clases de 24 parametros, que es la desplegada por defecto, y un perceptron multicapa en PyTorch de 3.649 parametros.

El modelo se entrena sobre 455.401 sesiones de un dia extraidas del dataset de Kaggle `benpowis/customer-propensity-to-purchase-data`, de las cuales solo 19.093 (un 4,19 %) acabaron en pedido, lo que define un problema fuertemente desbalanceado. El repositorio incluye ademas una segmentacion RFM (recencia, frecuencia, valor monetario) de los 4.338 clientes del dataset UCI Online Retail, con tabla de segmentos, rejilla R x F y cortes por quintiles.

Su relevancia practica esta en el coste de despliegue: el modelo por defecto son 24 coeficientes y corre en CPU con requisitos de memoria despreciables, lo que permite puntuar sesiones en tiempo real en un backend de tienda sin GPU ni infraestructura de inferencia pesada. La licencia MIT facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos tabulares: regresion logistica de scikit-learn (por defecto) y MLP `PropensityMLP` en PyTorch con capas Linear(23, 64) -> ReLU -> Dropout(0.2) -> Linear(64, 32) -> ReLU -> Dropout(0.2) -> Linear(32, 1) |
| Parametros totales | 3.649 (MLP, segun safetensors); 24 (regresion logistica: 23 coeficientes + 1 intercepto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada fija de 23 flags binarias) |
| Tipos de cuantizacion | no aplica (no se publican variantes cuantizadas; pesos en coma flotante de 32 bits) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; incluye una flag binaria `loc_uk` de localizacion) |
| Licencia | MIT |
| Formato de pesos | `logreg.joblib` y `scaler.joblib` (scikit-learn/joblib), `model.safetensors` (PyTorch, via `PyTorchModelHubMixin`), mas `config.json` y `rfm_segment_stats.json` |
| Entrada | 23 flags binarias de sesion, como diccionario `{nombre: 0/1}` o lista de nombres activos; tambien CSV o DataFrame con las 23 columnas |
| Preprocesado | `StandardScaler` ajustado sobre el split de train (`scaler.joblib`), compartido por ambos modelos |
| Salida | `{"buy": p, "no_buy": 1 - p}`, con p = P(la sesion termina en pedido) |
| Umbral de decision | 0,949 (regresion logistica) y 0,965 (MLP), fijados para maximizar F1 en validacion |
| Dispositivo | El MLP usa CUDA si esta disponible; la regresion logistica corre en CPU |

## Arquitectura y entrenamiento

La regresion logistica se entrena con lbfgs sobre el split de train estandarizado y pesos de clase balanceados, en 1,6 segundos. El MLP se entrena con `BCEWithLogitsLoss` y `pos_weight = 22.85`, optimizador AdamW (lr 1e-3, weight decay 1e-4) y tamano de lote 4.096, hasta un maximo de 30 epocas con parada temprana sobre ROC-AUC de validacion (paciencia 5). El entrenamiento se detuvo tras 18 epocas y conservo la epoca 13, con ROC-AUC de validacion 0,99725 y un tiempo total de 141 segundos.

Los datos de sesiones proceden de `training_sample.csv` del dataset de Kaggle: 455.401 sesiones de un dia con 19.093 conversiones (4,19 %). Las 23 flags solo toman 9.086 combinaciones distintas, lo que explica en parte las metricas tan altas. El reparto es estratificado 68/12/20 con semilla 42: 309.672 sesiones de train, 54.648 de validacion y 91.081 de test. El split de test se puntua una sola vez, despues de la seleccion. La eleccion del modelo por defecto se hizo por PR-AUC de validacion (0,8999 frente a 0,8968 del MLP). El componente RFM se construye sobre el dataset UCI Online Retail (id 352) y cubre 4.338 clientes.

## Capacidades

- Clasificacion binaria de propension de compra por sesion, con salida de probabilidad calibrada solo de forma relativa (ver limitaciones).
- Puntuacion por lotes desde CSV o DataFrame con las 23 columnas de flags (`predict_batch`).
- Explicabilidad por flag: `explain()` devuelve la caida de P(buy) al desactivar cada flag activa, util como analisis de sensibilidad y atribucion.
- Seleccion de variante en inferencia mediante el parametro `model` (`"best"` o `"pytorch_mlp"`).
- Segmentacion RFM de clientes: `rfm_segment()` asigna un segmento a partir de recencia en dias, frecuencia y valor monetario, usando cortes por quintiles.
- Despliegue como API: `handler.py` para Inference Endpoints y un Space de Gradio con llamada `POST /gradio_api/call/predict`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni generacion de texto: es un modelo tabular cerrado a su tarea.

## Casos de uso

- Puntuacion de sesiones en tiempo real: el modelo por defecto son 24 parametros y se ejecuta en CPU, por lo que puede invocarse en el backend de la tienda en cada evento relevante (anadir al carrito, ver checkout) para obtener P(buy) en milisegundos sin GPU.
- Disparo de acciones de marketing en el funnel: cuando P(buy) supera el umbral 0,949 en validacion, se puede lanzar un correo de recuperacion, un recordatorio de carrito o un aviso push en el momento de maxima intencion.
- Priorizacion de audiencias en retargeting: `predict_batch` puntua un CSV historico de sesiones y permite ordenar la base por propension, de modo que el presupuesto de anuncios se concentre en los segmentos con mayor probabilidad de conversion.
- Enrutado a atencion humana: las sesiones con alta propension y baja conversion pueden derivarse a chat en vivo o a un agente comercial, ya que la salida incluye una probabilidad explicita y no solo una etiqueta.
- Optimizacion del funnel basada en atribucion: `explain()` cuantifica cuanto aporta cada flag (por ejemplo `saw_checkout` o `sign_in`) a la probabilidad de compra, lo que sirve para decidir que pasos del flujo conviene simplificar o promover.
- Segmentacion RFM de la base de clientes: `rfm_segment()` clasifica a cada cliente en segmentos tipo "Champions" a partir de recencia, frecuencia y gasto, lo que permite disenar campañas diferenciadas por cohorte sin construir un pipeline propio.
- Analitica historica por lotes: puntuar el historico completo de sesiones para reconstruir series de intencion de compra, comparar periodos o alimentar cuadros de mando internos.
- Integracion en un servicio existente: al publicarse en safetensors y joblib con dependencias estandar (`torch`, `scikit-learn`, `pandas`), el modelo se puede cargar dentro de un microservicio Python ya desplegado sin cambiar de stack.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index`, sobre el split de test del dataset "Kaggle customer propensity sessions + UCI Online Retail". Ninguno de los valores esta verificado (`verified: false`).

| Metrica | Valor |
|---|---|
| ROC-AUC | 0,997391 |
| PR-AUC (average precision) | 0,899513 |
| F1 | 0,924510 |
| Precision | 0,868924 |
| Recall | 0,987693 |
| Accuracy | 0,993237 |

Datos adicionales del entrenamiento aportados por el autor: ROC-AUC de validacion 0,99725 en la epoca 13 (MLP), PR-AUC de validacion 0,8999 (regresion logistica) frente a 0,8968 (MLP). No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El componente RFM no incluye metricas de evaluacion.

## Requisitos de hardware

- VRAM: practicamente nula. El MLP ocupa unos 14,6 KB en coma flotante de 32 bits (3.649 parametros x 4 bytes) y la regresion logistica es despreciable; el consumo real lo determina el runtime de PyTorch, no los pesos.
- GPU: no es necesaria. El MLP puede ejecutarse en CUDA si esta disponible, pero cualquier GPU consumer (RTX 3060, RTX 4090, e incluso GPUs integradas) es mas que suficiente; la regresion logistica corre siempre en CPU.
- CPU: es el entorno recomendado. El Space oficial se ejecuta con `runtime: cpu-basic`.
- Consumer: cabe sin problema en cualquier portatil o contenedor modesto, incluidas maquinas sin GPU dedicada.
- Despliegue: Inference Endpoints de Hugging Face mediante `handler.py`, Space de Gradio oficial, ejecucion local cargando `logreg.joblib` o `model.safetensors`, o integracion directa en un servicio Python con `huggingface_hub.snapshot_download`. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runners para modelos de lenguaje.
- Latencia y throughput: no publicados. Como referencia de coste computacional, el autor reporta 1,6 segundos para entrenar la regresion logistica completa y 141 segundos para entrenar el MLP durante 18 epocas, lo que indica un coste de inferencia por sesion del orden de microsegundos a milisegundos.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los proyectos alternativos, por lo que la comparacion se limita a lo declarado publicamente.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| shalev396/purchase-propensity | Regresion logistica + MLP tabular sobre 23 flags | 24 (por defecto) y 3.649 (MLP) | no aplica (entrada fija de 23 flags) | ROC-AUC 0,997391; PR-AUC 0,899513; F1 0,924510 en test | MIT | HuggingFace (repo, Space, Inference Endpoints), GitHub y Colab |
| saranshkr/purchase-propensity-model | Modelo de propension sobre comportamiento pasado | no disponible | no disponible | no disponible | no disponible | GitHub |
| malarahc/website-purchase-propensity-model | Modelo de propension a partir de senales de sesion (paginas vistas, actividad de carrito) | no disponible | no disponible | no disponible | no disponible | GitHub |
| Regresion logistica base sin ingenieria de caracteristicas | Clasificacion tabular | no disponible | no aplica | no disponible | no aplica | implementacion propia |

## Limitaciones y advertencias

- Probabilidades no calibradas: ambos modelos se entrenaron con pesos de clase balanceados (`pos_weight = 22.85`), lo que empuja las probabilidades al alza. Los umbrales ajustados se situan en 0,949 y 0,965. Debe usarse el umbral o el orden relativo, nunca leer p como una tasa literal de compra.
- Sobreajuste al espacio de flags: las 23 variables solo generan 9.086 combinaciones distintas en 455.401 sesiones, y las metricas de test son muy altas (ROC-AUC 0,997). Conviene validar el modelo sobre datos propios antes de confiar en ese nivel de rendimiento.
- Dependencia del dataset de origen: el entrenamiento proviene de una tienda del Reino Unido (existe la flag `loc_uk`) y de un unico dataset de Kaggle. El comportamiento en otros paises, sectores o modelos de negocio no esta documentado.
- Entrada muy restringida: solo acepta 23 flags binarias predefinidas. No procesa texto, embeddings, variables numericas continuas ni secuencias; no hay forma de anadir caracteristicas sin reentrenar.
- Desbalanceo severo: solo el 4,19 % de las sesiones convierte, lo que hace que la precision (0,868924) sea bastante inferior al recall (0,987693) y que los falsos positivos sean frecuentes en terminos absolutos.
- RFM con cobertura limitada: la segmentacion se calcula sobre 4.338 clientes del dataset UCI Online Retail, con cortes por quintiles fijos en `rfm_segment_stats.json`; no se adapta automaticamente a la distribucion de otra base de clientes.
- Sin soporte multilingue ni de lenguaje natural: no es un modelo de lenguaje, por lo que no puede emplearse en tareas de generacion, resumen, traduccion ni dialogo.
- Adopcion nula y validacion externa ausente: el repositorio registra 0 descargas y 0 likes, y todas las metricas figuran como no verificadas (`verified: false`). El split de test se puntuo una sola vez, pero no hay evaluacion independiente.
- Licencia MIT: permite uso comercial y modificacion sin restricciones relevantes, siempre que se conserve el aviso de copyright y la licencia. No se declaran restricciones adicionales ni datos personales en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shalev396/purchase-propensity
- Space de demostracion: https://huggingface.co/spaces/shalev396/purchase-propensity
- Repositorio GitHub del proyecto: https://github.com/shalev396/ml-lab/tree/main/purchase-propensity
- Cuaderno de entrenamiento en Colab: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/purchase-propensity/training/notebook.ipynb
- Dataset de sesiones (Kaggle): https://www.kaggle.com/datasets/benpowis/customer-propensity-to-purchase-data
- Dataset UCI Online Retail: https://archive.ics.uci.edu/dataset/352/online+retail
- Guia de modelado de propension (Comarch): https://www.comarch.com/trade-and-services/loyalty-marketing/blog/ai-driven-propensity-modeling/
- Proyecto alternativo de propension de compra: https://github.com/saranshkr/purchase-propensity-model
- Proyecto alternativo de propension por sesion web: https://github.com/malarahc/website-purchase-propensity-model
- Articulo sobre prediccion de propension de compra con big data e IA: https://www.researchgate.net/publication/390979758_Predicting_Consumer_Purchase_Propensity_in_Communication_Studies_Using_Big_Data_and_Artificial_Intelligence
- Enfoque simplificado de modelado de propension: https://www.datacult.com/post/propensity-modeling
