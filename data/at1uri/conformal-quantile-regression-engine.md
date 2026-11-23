# At1uri/conformal-quantile-regression-engine

## Resumen

`conformal-quantile-regression-engine` es un artefacto de pesos e inferencia publicado por Ramprasad Atluri (usuario `At1uri` en Hugging Face) que implementa Conformalized Quantile Regression (CQR), una tecnica de cuantificacion de incertidumbre con garantias de cobertura marginal de muestra finita y sin supuestos distribucionales. No es un modelo de lenguaje: es una red neuronal tabular de muy pequeno tamano (5.508 parametros) que predice cuantiles condicionales y una cabeza de dispersion, acompanada de un calibrador conformal que transforma esas predicciones en intervalos de prediccion con cobertura garantizada.

El problema que resuelve es concreto: en regresion tabular, los intervalos de confianza clasicos dependen de supuestos de normalidad o de homocedasticidad que rara vez se cumplen en datos reales. CQR produce intervalos que, bajo intercambiabilidad de las muestras, contienen el valor real con probabilidad al menos 1-alpha, independientemente de la forma de la distribucion del ruido. La implementacion anade adaptatividad local: los intervalos se ensanchan en regiones de alta varianza y se estrechan en regiones de bajo ruido.

Es relevante para equipos que necesitan incertidumbre calibrada en produccion con latencias minimas (milisegundos) y sin dependencias pesadas, por ejemplo en scoring de riesgo, prevision de demanda o cualquier pipeline tabular donde una prediccion puntual no sea suficiente. La licencia MIT y el formato safetensors facilitan su integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward tabular con multiples cabezas de cuantiles y cabeza de dispersion (log-varianza) |
| Parametros totales | 5.508 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada de 16 caracteristicas) |
| Tipos de cuantizacion | no disponible (pesos en float32 nativo, 22,7 KB) |
| Idiomas soportados | no aplica (modelo numerico); la model card esta en ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (mas `config.json`) |

Parametros de arquitectura declarados en la model card:

| Hiperparametro | Valor |
|---|---|
| Caracteristicas de entrada (d_in) | 16 |
| Unidades ocultas (d_hidden) | 64 |
| Salidas de cuantil | 3 (cuantil inferior, mediana, cuantil superior) |
| Cabeza de dispersion | 1 (log-varianza) |
| Cobertura nominal por defecto | 90% (alpha = 0,10) |

## Arquitectura y entrenamiento

La red comparte un backbone de representacion de 64 unidades sobre una entrada de 16 caracteristicas y emite cuatro salidas: el cuantil inferior q_alpha/2, la mediana mu, el cuantil superior q_1-alpha/2 y la log-varianza sigma^2. Sobre esas predicciones, el calibrador conformal calcula puntuaciones de no conformidad con signo, s_i = max(q_alpha/2(x_i) - y_i, y_i - q_1-alpha/2(x_i)), y obtiene el indice de cuantil discreto de muestra finita q = Quantile(ceil((n+1)(1-alpha))/n; {s_1, ..., s_n}). Los intervalos calibrados resultantes son C(x) = [q_alpha/2(x) - q, q_1-alpha/2(x) + q].

La model card no detalla el dataset de entrenamiento, el numero de tokens o muestras, ni si hubo etapas de ajuste fino, RLHF o DPO; esos datos no estan disponibles. La innovacion tecnica destacable no esta en el entrenamiento sino en la capa de calibracion: garantia de cobertura marginal distribution-free bajo intercambiabilidad, adaptatividad local por region de varianza y latencias declaradas de 4,05 ms para calibracion con N=300 y 1,07 ms para inferencia sobre 1.000 puntos. La formulacion sigue los trabajos de Romano et al. y Angelopoulos & Bates citados en la model card.

## Capacidades

- Regresion tabular con cuantiles condicionales: predice cuantil inferior, mediana y cuantil superior para entradas de 16 caracteristicas.
- Estimacion de dispersion: cabeza adicional de log-varianza para modelar heterocedasticidad.
- Intervalos de prediccion con cobertura garantizada: construccion de bandas calibradas con garantia de muestra finita para cualquier nivel 1-alpha en (0,1).
- Adaptatividad local: los intervalos se expanden en regiones de alta varianza y se contraen en regiones de bajo ruido.
- Independencia distribucional: valido para ruido gaussiano, multimodal, de colas pesadas o heterocedastico.
- Latencia muy baja: calibracion e inferencia en el orden de milisegundos segun el autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un componente numerico, no un modelo generativo.

## Casos de uso

- Scoring de riesgo crediticio con bandas de incertidumbre: dado un vector de 16 caracteristicas del solicitante, el modelo devuelve no solo la estimacion puntual sino un intervalo calibrado al 90%, lo que permite aplicar politicas conservadoras cuando la banda es amplia.
- Prevision de demanda con intervalos operativos: integrado en un pipeline de planificacion, los intervalos adaptativos permiten dimensionar stock o capacidad segun la incertidumbre local de cada punto de prediccion.
- Mantenimiento predictivo: estimacion del tiempo hasta fallo con bandas que se ensanchan en regimenes de operacion poco representados, evitando falsas precisiones.
- Calibracion de modelos existentes: el calibrador conformal puede envolver las predicciones de otro regresor tabular para anadir garantias de cobertura sin reentrenar el modelo base, siempre que se respete la dimensionalidad de entrada o se adapte la red.
- Control de calidad en manufactura: prediccion de variables de proceso con intervalos que permiten discriminar desviaciones reales de ruido esperado, reduciendo falsas alarmas.
- Investigacion en cuantificacion de incertidumbre: banco de pruebas ligero (22,7 KB de pesos) para reproducir experimentos de CQR, comparar metodos conformales y validar coberturas empiricas frente a la nominal.
- Sistemas de decision con garantias estadisticas: cualquier pipeline tabular donde se requiera una cota de cobertura auditable, con la ventaja de una latencia de milisegundos y una licencia MIT sin restricciones de uso comercial.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Regresion tabular | `At1uri/conformal-prediction-coverage-benchmarks` | Cobertura empirica (nominal 90%) | 0,897 | No |

La cobertura empirica de 0,897 esta muy proxima al objetivo nominal de 0,90, lo que es consistente con la garantia teorica de CQR. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos generativos, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos ocupan 22,7 KB en float32 y la red tiene 5.508 parametros.
- GPU recomendadas: no requiere GPU; ejecuta en CPU sin problema. Cualquier GPU consumer (incluso integradas) es sobradamente suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluidos contenedores ligeros y dispositivos de borde.
- Opciones de despliegue: carga directa con `safetensors.numpy.load_file` y la clase `ConformalQuantileNetwork` incluida en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no aplican a un modelo tabular.
- Latencia y throughput declarados por el autor: calibracion en 4,05 ms con N=300 e inferencia en 1,07 ms para 1.000 puntos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Cobertura / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `At1uri/conformal-quantile-regression-engine` | Red tabular CQR | 5.508 | no aplica (16 features) | Cobertura empirica 0,897 a nominal 90% | MIT | Hugging Face |
| MAPIE (scikit-learn-contrib) | Libreria de prediccion conformal | no aplica (envoltorio) | no aplica | Depende del modelo base | BSD-3 | PyPI / GitHub |
| TorchCP | Libreria de prediccion conformal en PyTorch | no aplica (envoltorio) | no aplica | Depende del modelo base | no disponible | GitHub |
| Quantile Regression Forests (Meinshausen) | Metodo de bosques cuantilicos | no aplica | no aplica | Sin garantia conformal nativa | GPL en implementaciones R | CRAN |

La comparativa directa con modelos de pesos preentrenados no es significativa: este artefacto es una implementacion concreta y empaquetada de CQR, mientras que MAPIE y TorchCP son librerias generales que requieren un modelo base. Su ventaja frente a ellas es la simplicidad de despliegue y el tamano minimo; su desventaja es que esta fijado a 16 caracteristicas de entrada y a una arquitectura concreta.

## Limitaciones y advertencias

- Dimensionalidad fija: la red espera exactamente 16 caracteristicas de entrada; usarla con otro numero requiere reentrenar o adaptar la arquitectura.
- La garantia de cobertura es marginal y de muestra finita bajo intercambiabilidad; no garantiza cobertura condicional por subgrupo ni se sostiene si la distribucion de test difiere de la de calibracion (shift distribucional).
- El unico resultado de benchmark es declarado por el autor y figura como no verificado; conviene reproducirlo antes de confiar en la cobertura en produccion.
- No hay informacion sobre el dataset de entrenamiento, el proceso de ajuste ni los sesgos de los datos utilizados, por lo que no se puede evaluar el riesgo de sesgo de forma independiente.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de extrapolacion fuera del soporte de los datos de entrenamiento, donde las predicciones cuantilicas pueden ser poco fiables aunque la cobertura marginal se mantenga.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- La model card esta redactada en ingles y no se documentan limitaciones adicionales; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/conformal-quantile-regression-engine
- Dataset de benchmarks de cobertura: https://huggingface.co/datasets/At1uri/conformal-prediction-coverage-benchmarks
- Space interactivo (Conformal Prediction Uncertainty Studio): https://huggingface.co/spaces/At1uri/conformal-prediction-uncertainty-studio
- Research Vault: https://huggingface.co/At1uri/conformal-prediction-vault
