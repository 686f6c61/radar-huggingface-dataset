# At1uri/rough-volatility-hurst-calibrator

## Resumen

`At1uri/rough-volatility-hurst-calibrator` es un calibrador neuronal profundo disenado para extraer los parametros estructurales del modelo de volatilidad rugosa de Bergomi (rBergomi) y Rough Heston a partir de trayectorias de varianza forward y sonrisas de volatilidad implicita. Desarrollado por el autor At1uri (citado como Ramprasad Atluri), resuelve un cuello de botella clasico en finanzas cuantitativas: la calibracion numerica de EDEs de Volterra fraccionarias mediante Monte Carlo requiere decenas de minutos por cada vencimiento, mientras que esta red estima el exponente de Hurst H, la volatilidad de la volatilidad nu y la correlacion spot-vol rho en aproximadamente 1,2 ms.

El modelo es una red neuronal de regresion tabular muy compacta (112.131 parametros segun los pesos safetensors) que opera sobre trayectorias de varianza simuladas o implicitas. No es un modelo de lenguaje ni un transformer generativo: es un calibrador especializado de dominio, con licencia Apache 2.0 y pesos en formato safetensors.

Su relevancia actual radica en la creciente adopcion de modelos de volatilidad rugosa en mesas de derivados para reproducir la singularidad del skew ATM a vencimientos cortos, donde los modelos markovianos clasicos fallan. La propuesta del autor es sustituir la calibracion Monte Carlo por inferencia neuronal amortizada, con un MAE declarado de 0,0184 en H.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (calibrador neuronal; detalles de capas no disponibles) |
| Parametros totales | 112.131 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: trayectoria de varianza de longitud configurable, 50 pasos en el ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles; relevante solo para documentacion, la entrada es numerica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna de la red (numero de capas, dimensiones ocultas, funciones de activacion) ni el esquema de entrenamiento (numero de muestras, composicion del dataset, uso de validacion cruzada). Lo que si se documenta es el marco matematico objetivo: el modelo aprende el mapeo inverso desde trayectorias de varianza del proceso de Volterra log-normal de rBergomi hacia los parametros (H, nu, rho). La varianza instantanea se modela como v_t = xi_0(t) * exp(nu * sqrt(2H) * integral de (t-s)^(H-1/2) dW_s - 0.5 * nu^2 * t^(2H)), con W correlacionado con el movimiento browniano del precio a traves de rho.

La innovacion tecnica es la amortizacion de la calibracion: en lugar de resolver numericamente la EDE fraccionaria en cada consulta, la red aproxima directamente la solucion inversa. El autor declara que el entrenamiento se apoya en el dataset `At1uri/rough-volatility-fractional-benchmarks` (N=200 benchmarks de test) y que la evaluacion compara contra un calibrador clasico basado en variograma. No se especifica si hubo data augmentation, ruido de observacion ni estrategias de regularizacion.

## Capacidades

- Estimacion del exponente de Hurst H en el rango (0, 0,50], con MAE declarado de 0,0184.
- Estimacion de la volatilidad de la volatilidad nu en el rango [1,20, 2,80], con MAE declarado de 0,0650.
- Estimacion de la correlacion spot-vol rho en el rango [-0,90, -0,65], con MAE declarado de 0,0210.
- Clasificacion implicita del regimen de volatilidad rugosa a partir de los parametros calibrados (campo `regime` en la salida del ejemplo).
- Simulacion de trayectorias sinteticas de rBergomi mediante el metodo `simulate_rbergomi` del paquete `rough_engine` (H, nu, rho, n_steps configurables).
- Inferencia sobre trayectorias de varianza de longitud configurable (50 pasos en el ejemplo de la model card).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: es un regresor numerico de dominio especifico.

## Casos de uso

- Calibracion en tiempo real de superficies de volatilidad: el calibrador permite recalibrar H, nu y rho en cada actualizacion de mercado (1,2 ms por consulta), lo que habilita el pricing y la cobertura de derivados con modelos rBergomi en lugar de recalibrar por Monte Carlo cada pocos minutos.
- Validacion de modelos de riesgo en mesas de derivados: comparar la calibracion neuronal contra la calibracion clasica por variograma (MAE 0,0421 en H) para detectar desviaciones en la estimacion del exponente de rugosidad y ajustar los limites de riesgo.
- Investigacion academica sobre volatilidad rugosa: generar trayectorias sinteticas con `simulate_rbergomi` y calibrarlas con la red para estudiar la sensibilidad de H a la longitud de la muestra y al ruido de observacion en estudios de simulacion.
- Construccion de pipelines de backtesting: integrar el calibrador en un bucle de backtesting que procese miles de vencimientos y activos, aprovechando la latencia de milisegundos para explorar rejillas de parametros que serian inviables con Monte Carlo.
- Deteccion de regimenes de volatilidad: usar la salida `regime` para clasificar el estado del mercado (por ejemplo, H bajo con skew ATM pronunciado) y alimentar senales de asignacion de riesgo o de ajuste de coberturas gamma.
- Prototipado en el espacio interactivo `rough-volatility-rbergomi-studio`: experimentar con la simulacion y calibracion sin infraestructura propia, util para docencia y para validar la implementacion antes de desplegarla en produccion.
- Preprocesado para modelos de pricing: usar los parametros calibrados como features de entrada en modelos posteriores de valoracion de opciones exoticas o de calculo de griegas bajo rBergomi.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre N=200 benchmarks del dataset `At1uri/rough-volatility-fractional-benchmarks`:

| Parametro calibrado | Rango ground truth | MAE neuronal | MAE variograma clasico | Velocidad de calibracion |
|---|---|---|---|---|
| Exponente de Hurst H | [0,03, 0,50] | 0,0184 | 0,0421 | 1,2 ms |
| Vol-of-Vol nu | [1,20, 2,80] | 0,0650 | 0,2840 | 1,2 ms |
| Correlacion rho | [-0,90, -0,65] | 0,0210 | 0,0950 | 1,2 ms |

Metricas adicionales declaradas en el model-index: Hurst MAE = 0,0184 y Vol-of-Vol MSE = 0,042 (ambas marcadas como `verified: false`). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 112.131 parametros, los pesos en fp32 ocupan aproximadamente 0,45 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. La CPU es suficiente para la mayoria de despliegues.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1050, RTX 2060, RTX 3060, RTX 4090).
- Opciones de despliegue: el paquete `rough_engine` referenciado en la model card (wrapper Python propietario del autor); al ser pesos safetensors, tambien es posible cargarlos con PyTorch o safetensors directamente si se conoce la topologia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un regresor numerico.
- Latencia y throughput: latencia declarada de 1,2 ms por calibracion; el throughput no se especifica, pero con esa latencia se pueden procesar del orden de 800 calibraciones por segundo en un solo hilo, sujeto a la implementacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| At1uri/rough-volatility-hurst-calibrator | Calibrador neuronal rBergomi | 112.131 | Trayectoria de varianza (50 pasos en ejemplo) | MAE H = 0,0184; 1,2 ms | Apache 2.0 | Hugging Face |
| Calibrador clasico por variograma | Metodo numerico | no aplica | Trayectoria de varianza | MAE H = 0,0421 | no aplica | Implementacion propia |
| Calibracion Monte Carlo de EDE de Volterra | Metodo numerico | no aplica | Superficie de volatilidad | No disponible | no aplica | Implementacion propia |
| Rough Heston con calibracion por red neuronal (alternativas genericas) | Calibrador neuronal | no disponible | Superficie de volatilidad | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros calibradores neuronales publicados comparables en la busqueda realizada; las alternativas reales son metodos numericos clasicos (variograma, Monte Carlo) y calibradores propietarios de mesas de trading.

## Limitaciones y advertencias

- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false` y proceden exclusivamente del autor; no hay evaluacion independiente publicada.
- Dominio muy restringido: el modelo solo estima (H, nu, rho) bajo los paradigmas rBergomi y Rough Heston; no es util para otros modelos de volatilidad ni para prediccion de precios.
- Rangos de calibracion acotados: H en [0,03, 0,50], nu en [1,20, 2,80] y rho en [-0,90, -0,65]; fuera de estos rangos el comportamiento no esta documentado y la extrapolacion es arriesgada.
- Dependencia de la distribucion de entrenamiento: al ser un calibrador amortizado, su precision puede degradarse ante regimenes de mercado o ruidos de observacion distintos a los del dataset de benchmarks.
- Riesgo de sobreajuste al simulador: si el generador de trayectorias sinteticas no reproduce fielmente las superficies reales, el calibrador puede dar estimaciones sesgadas en datos de mercado.
- Idiomas: solo documentacion en ingles; la entrada es numerica, por lo que el soporte multilingue no es relevante.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Caveat de produccion: el paquete `rough_engine` referenciado en el ejemplo no esta documentado en la model card (version, dependencias, API estable), lo que anade riesgo de integracion; conviene validar la implementacion antes de desplegar en un entorno critico.
- Sesgos conocidos: no se documentan sesgos especificos, pero al tratarse de un modelo entrenado sobre simulaciones, hereda los sesgos del generador de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/rough-volatility-hurst-calibrator
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/rough-volatility-fractional-benchmarks
- Espacio interactivo (Rough Vol Studio): https://huggingface.co/spaces/At1uri/rough-volatility-rbergomi-studio
- Repositorio de codigo de investigacion: https://huggingface.co/buckets/At1uri/rough-volatility-and-volterra-vault
- Coleccion Institutional Quantitative AI Suite: https://huggingface.co/collections/At1uri/institutional-quantitative-ai-suite-6aeeaed0365774ae33b9621e
- Paper de referencia del marco rBergomi (Bayer, Friz & Gatheral, 2016): no disponible como enlace en la informacion proporcionada
