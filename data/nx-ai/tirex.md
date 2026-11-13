# NX-AI/TiRex

## Resumen

TiRex es un modelo preentrenado de prediccion de series temporales desarrollado por NX-AI, disenado para realizar forecasting zero-shot sin necesidad de entrenamiento adicional sobre los datos del usuario. Con 35 millones de parametros, esta construido sobre la arquitectura xLSTM (extended LSTM), una alternativa a los transformers clasicos que incorpora mecanismos de memoria exponencial y puertas matriciales. El modelo se distribuye a traves de la libreria `tirex-ts` y tambien en formato ONNX para inferencia optimizada.

El modelo aborda el problema del forecasting de series temporales tanto en horizontes cortos como largos, ofreciendo predicciones puntuales y por cuantiles. Su relevancia actual radica en que compite en benchmarks de referencia como GiftEval y Chronos-ZS, donde obtiene resultados de estado del arte en regimen zero-shot, lo que lo posiciona como una alternativa practica frente a modelos mas grandes y costosos de entrenar.

TiRex se publico en mayo de 2025 y ha acumulado mas de 133.000 descargas en Hugging Face. El repositorio incluye tambien variantes para clasificacion y regresion de series temporales, asi como una segunda generacion (TiRex-2) que anade forecasting multivariante nativo y covariables conocidas en pasado y futuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | xLSTM (extended LSTM) |
| Parametros totales | 35 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales) |
| Licencia | nx-ai-community-license |
| Formato de pesos | PyTorch checkpoint (`model.ckpt`) y ONNX (`tirex.onnx`) |

## Arquitectura y entrenamiento

TiRex emplea la arquitectura xLSTM, una evolucion de las redes LSTM tradicionales que incorpora dos bloques principales: sLSTM (con memoria exponencial y puertas escalares) y mLSTM (con puertas matriciales y normalizacion). Esta eleccion arquitectonica permite capturar dependencias de largo alcance con un coste computacional menor que el de un transformer de tamano comparable, lo que explica que un modelo de solo 35M de parametros pueda competir en benchmarks de forecasting.

El modelo se entrena sobre los datasets `autogluon/chronos_datasets` y `Salesforce/GiftEvalPretrain`, que agrupan corpus heterogeneos de series temporales de dominios diversos. El paper asociado (arXiv:2505.23719) describe la innovacion central: un esquema de in-context learning mejorado que permite al modelo adaptarse a patrones nuevos sin reentrenamiento. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion precisa del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en el mismo sentido que en modelos de lenguaje).

## Capacidades

- Forecasting zero-shot de series temporales univariantes sin entrenamiento adicional sobre los datos del usuario.
- Prediccion puntual y por cuantiles, lo que permite construir intervalos de confianza.
- Rendimiento de estado del arte tanto en horizontes cortos como largos, segun los benchmarks GiftEval y Chronos-ZS.
- Variante de clasificacion de series temporales (paper arXiv:2510.26777).
- Variante de regresion sobre series temporales.
- Soporte de multiples formatos de entrada y salida mediante adaptadores (`gluonts`, `hfdataset`).
- Inferencia optimizada en multiples plataformas mediante ONNX.
- Despliegue en contenedor Docker documentado.
- No soporta tool calling, agentes ni capacidades multilingues en el sentido de los modelos de lenguaje; es un modelo numerico especializado.

## Casos de uso

- Prevision de demanda en retail: el modelo puede generar predicciones de ventas a partir de series historicas de productos sin entrenamiento previo, gracias a su capacidad zero-shot y a la salida por cuantiles para gestionar stock con margenes de seguridad.
- Planificacion energetica: forecasting de consumo electrico o generacion renovable en horizontes cortos y largos, aprovechando el rendimiento equilibrado del modelo en ambas escalas temporales.
- Monitorizacion de infraestructuras: prediccion de metricas de sistemas (latencia, CPU, trafico) para deteccion temprana de anomalias mediante comparacion con intervalos de cuantiles.
- Analisis financiero: proyeccion de series de precios o volumenes con estimaciones de incertidumbre, util para escenarios de riesgo donde importa mas el intervalo que el valor puntual.
- Clasificacion de patrones temporales: uso de la variante de clasificacion para etiquetar segmentos de series (por ejemplo, estados de maquinaria en mantenimiento predictivo).
- Regresion sobre series: la variante de regresion permite modelar relaciones entre series y variables objetivo, util en experimentacion cientifica y control de procesos.
- Prototipado rapido en notebooks: instalacion via `pip install tirex-ts` y ejemplo de quick start ejecutable en Google Colab, adecuado para validar hipotesis antes de invertir en entrenamiento propio.

## Benchmarks y rendimiento

La model card indica que TiRex obtiene "top scores" en los benchmarks GiftEval y Chronos-ZS, con buen rendimiento tanto en horizontes largos como cortos. Sin embargo, no se proporcionan cifras numericas concretas (MAE, MASE, CRPS u otras metricas) en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| GiftEval | estado del arte segun el autor (sin cifras disponibles) |
| Chronos-ZS | estado del arte segun el autor (sin cifras disponibles) |

No se han publicado resultados numericos de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 35M de parametros, la inferencia cabe holgadamente en cualquier GPU consumer; se estima un uso de menos de 1 GB en precision FP32 y del orden de unos cientos de MB en FP16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, e incluso es viable en CPU para cargas moderadas.
- Opciones de despliegue: libreria `tirex-ts` (PyTorch), ONNX Runtime, contenedor Docker documentado en el repositorio. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TiRex | 35M | no disponible | xLSTM, zero-shot | nx-ai-community-license | Hugging Face, PyPI, ONNX |
| TiRex-2 | no disponible | no disponible | xLSTM, multivariante y covariables | no disponible | GitHub, paper arXiv:2607.01204 |
| Chronos (referencia de benchmark) | no disponible | no disponible | transformer | no disponible | no disponible |
| GiftEval (referencia de benchmark) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa numerica con alternativas concretas de la misma categoria. Las unicas referencias cruzadas son TiRex-2 (evolucion del propio modelo) y los benchmarks GiftEval y Chronos-ZS, que actuan como marcos de evaluacion mas que como modelos comparables directos.

## Limitaciones y advertencias

- La licencia `nx-ai-community-license` es una licencia propia; es necesario revisar sus terminos antes de uso comercial, ya que puede imponer restricciones no presentes en licencias permisivas como Apache 2.0 o MIT.
- El modelo esta orientado a series temporales univariantes en su version original; el soporte multivariante y de covariables llega con TiRex-2, no con este modelo.
- Al ser un modelo zero-shot, el rendimiento puede degradarse en dominios muy alejados de los datasets de entrenamiento (chronos_datasets y GiftEvalPretrain).
- No se documentan en la informacion disponible los sesgos especificos del modelo ni su comportamiento en series con estacionalidades atipicas o regimenes cambiantes.
- No se detalla la longitud maxima de contexto soportada, lo que dificulta planificar su uso en series muy largas.
- Solo se ha probado en Linux y MacOS segun la model card; el soporte en Windows no esta garantizado.
- La documentacion no incluye cifras de benchmarks reproducibles en la informacion disponible, por lo que las afirmaciones de estado del arte deben validarse ejecutando los notebooks de evaluacion proporcionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NX-AI/TiRex
- Paper principal (arXiv:2505.23719): https://arxiv.org/abs/2505.23719
- Paper TiRex-2 (arXiv:2607.01204): https://arxiv.org/abs/2607.01204
- Paper clasificacion (arXiv:2510.26777): http://arxiv.org/abs/2510.26777
- Repositorio GitHub: https://github.com/NX-AI/tirex
- Repositorio TiRex-2: https://github.com/NX-AI/tirex-2
- Documentacion: https://nx-ai.github.io/tirex/
- Paquete PyPI: https://pypi.org/project/tirex-ts/
- Notebook quick start: https://github.com/NX-AI/tirex/blob/main/examples/quick_start_tirex.ipynb
- Notebook ONNX: https://github.com/NX-AI/tirex/blob/main/examples/tirex_onnx.ipynb
- Notebook GiftEval: https://github.com/NX-AI/tirex/blob/main/examples/gifteval/gifteval.ipynb
- Notebook Chronos-ZS: https://github.com/NX-AI/tirex/blob/main/examples/chronos_zs/chronos_zs.ipynb
- Notebook clasificacion: https://github.com/NX-AI/tirex/blob/main/examples/quick_start_tirex_classification.ipynb
- Notebook regresion: https://github.com/NX-AI/tirex/blob/main/examples/quick_start_tirex_regression.ipynb
- README Docker: https://github.com/NX-AI/tirex/blob/main/inference/README.md
- Documentacion de despliegue: https://nx-ai.github.io/tirex/deployment
- Documentacion de clasificacion: https://nx-ai.github.io/tirex/how-to/classification/
- Documentacion de regresion: https://nx-ai.github.io/tirex/how-to/regression/
- Licencia: https://huggingface.co/NX-AI/TiRex/blob/main/LICENSE
- Leaderboard GiftEval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard ChronosZS: https://huggingface.co/spaces/autogluon/fev-leaderboard
- Repositorio xLSTM: https://github.com/NX-AI/xlstm
- Google Colab quick start: https://colab.research.google.com/github/NX-AI/tirex/blob/main/examples/quick_start_tirex.ipynb
