# At1uri/markov-switching-autoregressive-engine

## Resumen

El Hamilton Markov-Switching Autoregressive Engine es un motor de inferencia estadística y econométrica publicado en HuggingFace por Ramprasad Atluri (usuario `At1uri`). No es un modelo de lenguaje ni una red neuronal profunda: es una implementación del filtro forward de Hamilton (1989) y del suavizado backward de Kim (1994) para un modelo de cambio de régimen de Markov con heteroscedasticidad, parametrizado como MS(3)-AR(1). Resuelve el problema de detectar regímenes latentes en series temporales financieras, donde tanto la media condicional como la varianza condicional cambian según un estado no observable gobernado por una cadena de Markov de primer orden.

El modelo se distribuye como un paquete de Python compatible con scikit-learn, con los parámetros calibrados en un fichero JSON (`calibrated_parameters.json`) y un módulo `hamilton_filter.py` que expone la clase `HamiltonRegimeSwitchingFilter`. Los tres estados se etiquetan como Expansion, Consolidation y Turbulent Cascade, con una distribución ergódica incondicional de 53,4 %, 35,8 % y 10,8 % respectivamente.

Su relevancia actual reside en que ofrece una alternativa interpretable y computacionalmente ligera a los modelos de deep learning para el análisis de regímenes de mercado, con licencia MIT que permite uso comercial en trading propietario y gestión de riesgos. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y la model card no documenta el dataset de calibración ni protocolos de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de cambio de régimen de Markov MS(3)-AR(1) con heteroscedasticidad; filtro forward de Hamilton (1989) y suavizado backward de Kim (1994) |
| Parámetros totales | No disponible (modelo paramétrico: matriz de transición 3x3, tres medias, tres coeficientes AR y tres varianzas) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; opera sobre series temporales de longitud arbitraria) |
| Tipos de cuantización | No aplica (parámetros en coma flotante serializados en JSON) |
| Idiomas soportados | Inglés (documentación y etiquetas de estado) |
| Licencia | MIT |
| Formato de pesos | JSON (`calibrated_parameters.json`) más código Python (`hamilton_filter.py`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo lineal por trozos con parámetros dependientes de estado. La ecuación de observación es $y_t - \mu_{S_t} = \phi_{S_t}(y_{t-1} - \mu_{S_{t-1}}) + \epsilon_t$ con $\epsilon_t \sim \mathcal{N}(0, \sigma_{S_t}^2)$ y $S_t \in \{0, 1, 2\}$ siguiendo una cadena de Markov de primer orden con matriz de transición $P$. La inferencia se realiza en dos pasadas: el filtro forward de Hamilton calcula las probabilidades filtradas $\hat{\xi}_{t|t} = \mathbb{P}(S_t = k \mid \mathcal{F}_t)$ de forma recursiva, y el suavizador de Kim calcula las probabilidades suavizadas $\hat{\xi}_{t|T}$ condicionadas a toda la muestra.

Los parámetros calibrados que publica la model card son: deriva de +0,081 %/día, +0,011 %/día y -0,185 %/día para Expansion, Consolidation y Turbulent respectivamente; coeficientes AR de +0,0421, -0,0894 y +0,1582; volatilidad anualizada de 12,69 %, 22,22 % y 55,55 %; y duración esperada de 25,12, 12,69 y 6,34 días. La matriz de transición presenta alta persistencia diagonal (0,9602, 0,9212, 0,8423). No se especifica en la información disponible el dataset de calibración, el período temporal, el número de observaciones ni si se aplicó regularización o validación cruzada. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo econométrico.

## Capacidades

- Detección de regímenes latentes en series temporales financieras mediante inferencia filtrada (solo pasado) y suavizada (pasado y futuro).
- Estimación de probabilidades condicionales por estado en cada instante temporal.
- Modelización conjunta de cambios en media condicional y varianza condicional (heteroscedasticidad).
- Cálculo de la distribución ergódica incondicional a partir del eigensistema de la matriz de transición.
- Extracción de duración esperada por régimen a partir de las probabilidades diagonales de transición.
- Serialización y carga de parámetros calibrados vía `huggingface_hub.hf_hub_download`.
- Integración con el ecosistema scikit-learn por declaración de `library_name`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto.

## Casos de uso

- Gestión de riesgos en carteras: el motor permite estimar en cada día la probabilidad de encontrarse en el régimen Turbulent Cascade (volatilidad anualizada del 55,55 %), lo que posibilita ajustar exposición o activar coberturas cuando esa probabilidad supera un umbral definido por el gestor.
- Asignación táctica de activos: las probabilidades filtradas de Expansion (deriva positiva de +0,081 %/día) y Consolidation permiten reglas de rotación entre activos de riesgo y refugio, usando la distribución ergódica como referencia de largo plazo.
- Investigación cuantitativa y backtesting: el suavizador de Kim proporciona etiquetas de régimen ex post útiles para analizar el comportamiento histórico de estrategias condicionado al estado del mercado.
- Construcción de indicadores macro-financieros: la probabilidad filtrada de cada régimen puede agregarse como feature en modelos posteriores (por ejemplo, un clasificador supervisado) o publicarse como señal en dashboards.
- Análisis de series de criptoactivos: la model card menciona explícitamente retornos de Bitcoin como serie de entrada de ejemplo, lo que permite aplicar el motor a activos con regímenes de volatilidad marcados.
- Monitorización de estrés de mercado en producción: al ser un filtro recursivo de coste O(T) con tres estados, puede ejecutarse diariamente sobre series actualizadas sin infraestructura de GPU.
- Docencia y validación de metodología econométrica: el código sirve como implementación de referencia de los filtros de Hamilton y Kim para cursos de series temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la log-verosimilitud como parámetro calibrado, pero no se proporciona su valor numérico ni métricas comparativas como AIC, BIC, accuracy de clasificación de regímenes o tests de especificación.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un filtro recursivo sobre tres estados con operaciones vectoriales de dimensión 3; no requiere GPU.
- VRAM estimada: 0 GB (no hay tensores en GPU; los parámetros ocupan unos pocos kilobytes en JSON).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier hardware consumer, incluidos Raspberry Pi y entornos serverless de baja capacidad.
- Opciones de despliegue: script Python directo, integración en pipelines de scikit-learn, contenedores Docker ligeros o funciones serverless.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del algoritmo se espera un coste lineal en la longitud de la serie con constantes muy pequeñas.
- Memoria RAM: depende únicamente de la longitud de la serie de entrada almacenada.

## Comparativa con modelos similares

| Modelo | Tipo | Estados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| At1uri/markov-switching-autoregressive-engine | MS(3)-AR(1) con heteroscedasticidad | 3 | Serie de longitud arbitraria | MIT | HuggingFace (0 descargas) |
| statsmodels `MarkovRegression` | MS-AR con heteroscedasticidad configurable | Configurable | Serie de longitud arbitraria | BSD-3 | PyPI, ampliamente usado |
| `hmmlearn` `GaussianHMM` | HMM gaussiano con covarianza completa o diagonal | Configurable | Serie de longitud arbitraria | BSD-3 | PyPI, ampliamente usado |
| `pymc` / `statsmodels` con cambio de régimen bayesiano | Modelos bayesianos de cambio de régimen | Configurable | Serie de longitud arbitraria | Apache 2.0 / BSD-3 | PyPI |

La diferencia principal frente a `statsmodels` y `hmmlearn` es que este repositorio publica parámetros ya calibrados con etiquetas semánticas de régimen, mientras que las librerías citadas requieren estimación sobre los datos del usuario. No se dispone de comparación de rendimiento numérico entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está calibrado con parámetros concretos cuya muestra de estimación no se documenta; aplicarlo a series distintas de las usadas en la calibración puede producir inferencias sesgadas.
- La model card no especifica el período temporal, la frecuencia de muestreo ni el activo subyacente de la calibración, lo que impide evaluar su validez externa.
- La etiqueta "Turbulent Cascade" y la deriva negativa de -0,185 %/día sugieren una calibración sobre un mercado concreto (posiblemente índices o cripto), no un modelo universal.
- El modelo asume normalidad condicional gaussiana y un AR(1); no captura colas gruesas, saltos ni dependencias de orden superior.
- No hay validación publicada ni benchmarks que respalden la calidad de la detección de regímenes.
- Riesgo de sobreajuste: con tres estados y una sola serie, la verosimilitud puede presentar múltiples óptimos locales; no se documenta el procedimiento de optimización.
- La licencia MIT permite uso comercial sin restricciones, pero no exime de la responsabilidad sobre decisiones financieras tomadas a partir de sus salidas.
- El repositorio tiene cero descargas y cero likes, sin historial de mantenimiento ni issues; el soporte de la comunidad es inexistente.
- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con métricas de NLP.
- La documentación está únicamente en inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/At1uri/markov-switching-autoregressive-engine
- Perfil del autor: https://huggingface.co/At1uri
- Referencia del filtro forward: Hamilton, J. D. (1989), "A New Approach to the Economic Analysis of Nonstationary Time Series and the Business Cycle", Econometrica 57(2), 357-384.
- Referencia del suavizador backward: Kim, C.-J. (1994), "Dynamic Linear Models with Markov-Switching", Journal of Econometrics 60(1-2), 1-22.
- Librería de referencia para modelos MS-AR: https://www.statsmodels.org/stable/examples/notebooks/generated/markov_regression.html
- Librería alternativa de HMM: https://hmmlearn.readthedocs.io/
