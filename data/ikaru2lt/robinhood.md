# Ikaru2lt/RobinHood

## Resumen

RobinHood es un framework local de codigo abierto para el analisis de series temporales multi-activo, publicado por el usuario Ikaru2lt en HuggingFace. No se trata de un modelo de lenguaje preentrenado al uso, sino de una arquitectura profunda hibrida (TCN + LSTM + Attention) que predice secuencias temporales numericas y, sobre esas predicciones, aplica una capa de atribucion matematica de caracteristicas mediante Captum Integrated Gradients. El objetivo declarado es eliminar las alucinaciones en informes financieros automatizados: en lugar de pedir a un LLM que razone sobre tablas numericas, el sistema calcula primero la prediccion determinista y su explicabilidad, y solo despues delega la redaccion del texto a un LLM externo de HuggingFace.

El diseno es de privacidad por construccion. Todo el computo pesado (carga de datos, entrenamiento de la TCN y la LSTM, y el calculo de atribuciones con Captum) se ejecuta en local, en el hardware del usuario. Unicamente los pesos numericos finales, ya anonimizados y deterministas, se envian por API a LLMs open source alojados en HuggingFace Serverless Inference para sintetizar el informe legible. Los datos crudos de la serie temporal nunca salen de la maquina.

Es relevante para desarrolladores e investigadores que trabajan en forecasting financiero y necesitan trazabilidad: el modelo combina prediccion cuantitativa con explicabilidad (XAI), se ejecuta on-device y solo requiere un fichero CSV. La ficha se basa exclusivamente en la informacion publicada por el autor, que es escasa en cuanto a detalles de arquitectura (capas, dimensiones, tokens) y no distribuye pesos preentrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida TCN + LSTM + Attention, con capa de atribucion Captum Integrated Gradients |
| Parametros totales | no disponible (no se publican pesos; el framework se entrena sobre los datos del usuario) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | configurable por el usuario mediante ventana de entrada N y horizonte de prediccion K; valores concretos no disponibles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (los informes sintetizados se generan en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (no se distribuyen pesos preentrenados; se generan al entrenar localmente) |

## Arquitectura y entrenamiento

La arquitectura declarada combina tres componentes: una red de convolucion temporal (TCN) que captura dependencias locales en la serie, una LSTM que modela dependencias secuenciales de mayor alcance y un mecanismo de Attention que pondera las partes relevantes de la secuencia. Sobre las predicciones resultantes se aplica una capa de atribucion de caracteristicas basada en Captum Integrated Gradients, que asigna a cada variable de entrada una contribucion numerica a la prediccion. El entrenamiento se realiza en local sobre el CSV aportado por el usuario y no se parte de pesos preentrenados publicados; los benchmarks se calcularon sobre un split de test del 20% en Google Colab.

El framework tiene un caracter hibrido en dos sentidos. Por un lado, en el plano del computo: la prediccion y la explicabilidad son 100% on-device, mientras que la generacion de lenguaje natural se delega via API a LLMs open source de HuggingFace, alimentados unicamente con los pesos de atribucion anonimizados. Por otro, en el plano metodologico: invierte el enfoque habitual de "LLM que razona sobre numeros" y lo sustituye por "modelo numerico determinista que genera atribuciones y LLM que solo las redacta". No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO, ya que el modelo no se entrena como un LLM generativo.

## Capacidades

- Prediccion de series temporales: forecasting sobre datos numericos continuos (float o int) con horizonte de prediccion K configurable.
- Analisis multi-activo: el autor describe el framework como orientado a datos multi-asset, si bien las reglas de compliance exigen procesar una unica matriz de una sola compania por ejecucion.
- Explicabilidad (XAI): atribucion matematica de caracteristicas mediante Captum Integrated Gradients, que cuantifica la contribucion de cada variable a la prediccion.
- Sintesis de informes en lenguaje natural: genera texto legible a partir de los pesos de atribucion, delegando la redaccion en LLMs open source de HuggingFace.
- Computo local y privacidad: entrenamiento, inferencia y atribucion se ejecutan 100% on-device; solo los pesos anonimizados se envian por API.
- Modo de ejecucion por linea de comandos: pipeline `python3 main.py` que carga el CSV, entrena y genera el informe.
- Integracion con HuggingFace Serverless Inference mediante token de API (`HUGGINGFACE_API_KEY`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso, mas alla de la sintesis de texto delegada.

## Casos de uso

- Analisis financiero de un activo concreto: dado un CSV historico de una sola compania, el framework entrena la TCN-LSTM-Attention y produce una prediccion con su mapa de atribuciones, util para entender que variables empujan el pronostico.
- Generacion de informes auditables: en lugar de un LLM que invente tendencias, el informe se construye sobre atribuciones deterministas, lo que permite justificar numericamente cada afirmacion del texto.
- Investigacion en XAI aplicada a finanzas: la capa de Captum Integrated Gradients sirve como banco de pruebas para estudiar como distintas variables contribuyen a una prediccion de serie temporal.
- Prototipado en entorno sin GPU de gama alta: al ejecutarse on-device y haberse evaluado en Google Colab, encaja en flujos de trabajo ligeros con recursos modestos.
- Documentacion interna para equipos de riesgo: generar explicaciones trazables sobre pronosticos de mercado manteniendo los datos crudos dentro de la infraestructura de la organizacion.
- Validacion de supuestos de politica de privacidad: permite demostrar que solo salen del entorno los pesos anonimizados y no los datos originales, util en sectores regulados.
- Docencia y divulgacion: el CSV de ejemplo `gld_price_data.csv` incluido en el repositorio facilita demostrar un pipeline completo de prediccion mas explicabilidad sin configuracion adicional.
- Comparacion de horizontes de prediccion: al ser N y K configurables, permite evaluar como cambia el error y las atribuciones al variar la ventana de contexto y el horizonte.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados, `verified: false`), calculados sobre el split de test del 20% en Google Colab:

| Metrica | Valor | Descripcion |
|---|---|---|
| MAE (Mean Absolute Error) | 2.2757 | Error absoluto medio entre prediccion y valor real |
| MSE (Mean Squared Error) | 15.6271 | Error cuadratico medio, penaliza mas los errores grandes |

No se han publicado en la informacion disponible resultados frente a otros benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones directas con modelos de forecasting alternativos sobre el mismo conjunto de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse on-device y haberse evaluado en Google Colab, se intuye un consumo moderado, pero no se publican cifras.
- GPU recomendadas: no disponibles de forma explicita. El hecho de que los benchmarks se calcularan en Google Colab sugiere que funciona en GPU de gama media o incluso en CPU para conjuntos de datos pequenos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el caracter on-device del framework, aunque no se confirma con modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: ejecucion local via Python (`pip install -r requirements.txt` y `python3 main.py`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no se distribuyen pesos de un LLM propio; el texto se delega a HuggingFace Serverless Inference.
- Latencia y throughput estimados: no disponibles. Dependen del tamano del dataset, de la ventana N, del horizonte K y del hardware local.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos alternativos. A continuacion se ofrece una comparacion cualitativa con dos enfoques habituales de forecasting de series temporales, marcando como "no disponible" los datos que no se pueden confirmar.

| Caracteristica | RobinHood | Modelos fundacionales de series temporales (p. ej. Chronos, TimesFM) |
|---|---|---|
| Tipo | Framework local hibrido (TCN+LSTM+Attention) con XAI | modelos preentrenados de proposito general |
| Parametros | no disponible (no distribuye pesos) | no disponible |
| Longitud de contexto | ventana N configurable | no disponible |
| Explicabilidad integrada | si (Captum Integrated Gradients) | no disponible |
| Entrenamiento | por dataset, en local | preentrenado a gran escala |
| Licencia | AGPL-3.0 | no disponible |
| Privacidad | 100% on-device para datos crudos | no disponible |

Nota: la comparativa es orientativa y no se basa en mediciones sobre un mismo conjunto de datos; no debe interpretarse como una evaluacion de rendimiento relativo.

## Limitaciones y advertencias

- Las metricas MAE y MSE estan declaradas por el autor y marcadas como no verificadas (`verified: false`); no proceden de una evaluacion independiente.
- La informacion publicada no detalla la arquitectura a nivel de capas, dimensiones, hiperparametros ni numero de tokens, lo que dificulta reproducir o auditar el modelo.
- Inconsistencia en la documentacion: la descripcion habla de datos "multi-asset", pero las reglas de compliance exigen una unica compania por ejecucion y prohiben columnas de tipo Ticker o mezclar datos de varias empresas.
- Restricciones de formato estrictas: solo acepta ficheros `.csv`, con una unica columna de fecha secuencial y el resto de columnas puramente numericas (float o int). Cualquier desviacion detiene la ejecucion.
- Densidad de datos: se requiere un historial amplio que supere con holgura la ventana de contexto N y el horizonte K; con pocos datos, los mapas de atribucion pierden robustez.
- Idioma: unicamente ingles (`en`); los informes sintetizados se generan en ese idioma.
- Riesgo de alucinacion residual en la parte de lenguaje: aunque el autor afirma que las atribuciones son deterministas, la redaccion final la realiza un LLM externo via API, por lo que el texto podria introducir matices no presentes en los pesos numericos.
- Dependencia de un servicio externo (HuggingFace Serverless Inference) y de una clave de API, lo que introduce un punto de fallo de red y de disponibilidad del proveedor.
- Licencia AGPL-3.0: copyleft fuerte; si se integra en un servicio de red, obliga a liberar el codigo derivado bajo la misma licencia. Conviene revisar implicaciones antes de un uso comercial.
- Madurez temprana: 0 descargas y 1 like en el momento de la ficha, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ikaru2lt/RobinHood
- Repositorio GitHub del autor: https://github.com/ikaruz050309/RobinHood
- Captum (libreria de atribucion de caracteristicas): https://captum.ai/
- HuggingFace Serverless Inference: https://huggingface.co/docs/api-inference/index

Nota: los resultados de busqueda web incluidos (WrathallTechnology/RobinhoodAITrader, YizhiSong/FriesTrader, NikhilMiddaGeek/Robinhood-AI-Agent y la noticia de Robinhood Agents) corresponden a productos o proyectos de la plataforma de brokerage Robinhood y no estan relacionados con el modelo Ikaru2lt/RobinHood descrito en esta ficha.
