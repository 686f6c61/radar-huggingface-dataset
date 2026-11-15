# At1uri/flow-matching-generative-engine

## Resumen

`At1uri/flow-matching-generative-engine` es un motor generativo basado en Continuous Normalizing Flows (CNF) y Neural Ordinary Differential Equations (Neural ODE) orientado a la modelización de series temporales financieras no estacionarias, distribuciones de activos con colas pesadas y dinámicas de libros de órdenes de alta frecuencia. Lo desarrolla el usuario At1uri y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es un generador de datos tabulares/secuenciales que aprende un campo de velocidades determinista mediante Flow Matching con acoplamiento de transporte óptimo (2-Wasserstein).

La propuesta técnica consiste en regresar directamente el campo vectorial $v_\theta(x_t, t)$ a lo largo de geodésicas lineales de transporte óptimo que conectan una prior gaussiana $p_0 \sim \mathcal{N}(0, I)$ con la distribución empírica de retornos $p_1$. Frente a los modelos de difusión basados en score (DDPM/SGM), que requieren entre 50 y 1000 pasos inversos estocásticos, este motor permite muestreo determinista en 4-8 pasos de integración Runge-Kutta 4 (RK4), con evaluación exacta de verosimilitud y sin varianza de truncamiento.

El modelo es extremadamente compacto: 725.892 parámetros totales en formato safetensors, con un repositorio de tamaño prácticamente nulo. Su relevancia actual reside en la eficiencia de muestreo (NFE muy bajo) y en la preservación de propiedades estilizadas de los retornos financieros (curtosis, asimetría, clustering de volatilidad), lo que lo hace útil para simulación de escenarios, stress testing y aumentación de datos financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Continuous Normalizing Flow (CNF) con Neural ODE y Flow Matching por transporte óptimo |
| Parametros totales | 725.892 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo generativo tabular/secuencial, no autoregresivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un campo vectorial neuronal $v_\theta(x, t)$ que define una ODE de flujo de probabilidad $\dot{x} = v_\theta(x, t)$ sobre $t \in [0, 1]$. El entrenamiento utiliza el objetivo de regresión de Flow Matching: se muestrean pares $(x_0, x_1)$ con $x_0 \sim p_0$ y $x_1 \sim p_1$, se construye la interpolación lineal $\psi_t(x_0 \mid x_1) = (1-t)x_0 + t x_1$ y se minimiza $\mathbb{E}[\|v_\theta(\psi_t(x_0 \mid x_1), t) - (x_1 - x_0)\|^2]$. Cuando el acoplamiento entre $x_0$ y $x_1$ se toma del plan de transporte óptimo 2-Wasserstein, las trayectorias resultantes no se cruzan y son prácticamente rectas, lo que permite resolver la ODE con muy pocas evaluaciones de función (NFE).

En inferencia se parte de $x_0 \sim \mathcal{N}(0, I)$ y se integra la ODE con Runge-Kutta 4, con paso $h = 1/\text{NFE}$ (por ejemplo, $h = 0.125$ para 8 pasos). La model card describe cinco regímenes de mercado soportados: deriva estacionaria (movimiento browniano geométrico), clustering de volatilidad con colas pesadas (innovaciones Student-$t$ con $\nu \in [3, 5]$), crisis de liquidez y flash crash (dinámica bimodal asimétrica), difusión con saltos (modelo de Bates con saltos compuestos de Poisson) y dispersión correlacionada multi-activo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Generación de retornos financieros sintéticos con propiedades estilizadas realistas (curtosis y asimetría controladas, clustering de volatilidad).
- Muestreo determinista y rápido mediante Neural ODE con RK4 en 4-8 pasos de integración.
- Evaluación exacta de verosimilitud mediante la ODE de flujo de probabilidad (sin aproximaciones de score).
- Simulación de múltiples regímenes de mercado: deriva estacionaria, colas pesadas, crisis de liquidez/flash crash, difusión con saltos y dispersión multi-activo correlacionada.
- Preservación de la estructura de covarianza entre activos en escenarios de alta dimensionalidad.
- Modelización de dinámicas de libros de órdenes de alta frecuencia (limit order book) según la descripción del autor.
- API Python (`ContinuousNormalizingFlowEngine`) con método `sample(num_samples, nfe_steps, regime)` que devuelve métricas de curtosis y asimetría junto con las muestras.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- **Stress testing de carteras**: generar trayectorias sintéticas bajo el régimen `liquidity_crisis` o `jump_diffusion` para evaluar la resiliencia de una cartera ante caídas abruptas y saltos de precio, aprovechando la capacidad del modelo de reproducir dinámicas bimodales asimétricas.
- **Aumentación de datos para modelos de riesgo**: producir muestras sintéticas de retornos con colas pesadas (Student-$t$ con $\nu \in [3,5]$) para entrenar o validar modelos de VaR/CVaR cuando el histórico real es escaso o no contiene suficientes eventos extremos.
- **Simulación de escenarios multi-activo**: generar retornos correlacionados de alta dimensionalidad preservando la estructura de covarianza, útil para optimización de carteras y cálculo de exposiciones agregadas.
- **Backtesting de estrategias de market making**: modelizar dinámicas de libros de órdenes y reposición de liquidez bid-ask en condiciones de crisis, con muestreo rápido (8 NFE) que permite generar miles de escenarios en segundos.
- **Validación de motores de pricing**: comparar precios de derivados calculados sobre trayectorias sintéticas generadas por el motor frente a los obtenidos con modelos analíticos (Bates, GBM) para detectar discrepancias en la implementación.
- **Investigación en modelos generativos financieros**: servir como baseline CNF reproducible (725.892 parámetros, Apache 2.0) para comparar Flow Matching con difusión basada en score en tareas de generación de series temporales.
- **Generación de datos sintéticos para pruebas de infraestructura**: alimentar pipelines de ingesta y procesamiento de market data con series realistas sin exponer datos propietarios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Continuous Normalizing Flow Regression | Flow Matching Market Benchmarks (`At1uri/flow-matching-market-benchmarks`) | Flow Matching MSE | 0,0124 |

Comparativa de eficiencia declarada por el autor frente a otras familias generativas:

| Arquitectura | Framework generativo | Metodo de integracion | NFE requeridos | Error de transporte W2 |
|---|---|---|---|---|
| Flow Matching Engine (este modelo) | Continuous Normalizing Flow | Runge-Kutta 4 (RK4) | 8 | 0,014 |
| Rectified Flow (Euler) | Linear Flow | Euler de 1er orden | 20 | 0,038 |
| Score-based SDE (VE/VP) | Reverse SDE | Euler-Maruyama | 100 | 0,065 |
| DDPM | Difusion markoviana | Muestreo ancestral | 1000 | 0,082 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 725.892 parámetros, los pesos en fp32 ocupan aproximadamente 2,9 MB y en fp16 unos 1,5 MB; el grueso del consumo proviene de los buffers de muestreo y del solver RK4, no de los pesos.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente (RTX 4090, A100, H100); también es viable en CPU para lotes moderados.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060 o incluso iGPU con suficiente memoria compartida.
- Opciones de despliegue: el autor proporciona una API Python (`flow_engine.ContinuousNormalizingFlowEngine`) y un Space interactivo en Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles de forma oficial; el autor destaca que el muestreo requiere solo 4-8 NFE, lo que sitúa la generación de miles de trayectorias en el orden de segundos en GPU, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flow-matching-generative-engine (este) | 725.892 | no aplica | CNF + Flow Matching (RK4) | Apache 2.0 | Hugging Face |
| Rectified Flow (Euler) | no disponible | no aplica | Linear Flow (Euler) | no disponible | referencia en la model card, sin identificador |
| Score-based SDE (VE/VP) | no disponible | no aplica | Reverse SDE (Euler-Maruyama) | no disponible | referencia en la model card, sin identificador |
| DDPM | no disponible | no aplica | Difusion markoviana | no disponible | referencia en la model card, sin identificador |

No se dispone de información sobre modelos comparables concretos con identificador verificable en la información proporcionada; las alternativas listadas proceden únicamente de la tabla comparativa de la model card del autor.

## Limitaciones y advertencias

- El único benchmark declarado (MSE 0,0124) figura como `verified: false`; no ha sido validado de forma independiente.
- El modelo se ha diseñado y descrito exclusivamente para dominios financieros; no es un modelo de lenguaje y no debe emplearse para tareas de NLP, razonamiento o generación de texto.
- Los idiomas declarados se limitan a `en`; la model card y la API están en inglés.
- Riesgo de que las distribuciones generadas no capturen regímenes de mercado no vistos en el dataset de entrenamiento (por ejemplo, cambios estructurales de política monetaria o eventos de cola extrema fuera de los cinco regímenes descritos).
- No se documentan sesgos específicos, pero al entrenarse sobre datos de mercado históricos puede heredar sesgos de periodo, sesgos de supervivencia de los activos incluidos y sesgos de microestructura del mercado de origen.
- No se especifican el dataset de entrenamiento, el número de muestras ni los detalles de preprocesado, lo que dificulta la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad de las muestras sintéticas para decisiones de inversión reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un modelo recién publicado y sin adopción comunitaria verificable.
- No hay información sobre cuantizaciones, latencia medida ni límites de lote; en producción conviene validar el comportamiento del solver RK4 con distintos NFE antes de fijar la configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/flow-matching-generative-engine
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/flow-matching-market-benchmarks
- Space interactivo (Flow Matching Studio): https://huggingface.co/spaces/At1uri/flow-matching-generative-market-studio
- Repositorio de código de investigación (vault): https://huggingface.co/buckets/At1uri/flow-matching-and-generative-vault
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
