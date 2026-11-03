# At1uri/stochastic-volatility-calibrator

## Resumen

`At1uri/stochastic-volatility-calibrator` es un paquete de modelado cuantitativo publicado en HuggingFace por Ramprasad Atluri (usuario `At1uri`) que implementa el modelo de volatilidad estocástica de Heston en tiempo continuo con discretización de truncamiento completo. No es un modelo de lenguaje ni una red neuronal profunda: es un modelo paramétrico bivariante que describe la dinámica conjunta del precio de un activo \(S_t\) y su varianza instantánea \(v_t\), con cinco parámetros calibrados (\(\kappa\), \(\theta\), \(\xi\), \(\rho\), \(v_0\)).

El repositorio se distribuye con `library_name: scikit-learn` y `pipeline_tag: tabular-regression`, aunque en la práctica los pesos se entregan como un fichero JSON (`calibrator_weights.json`) con los parámetros calibrados, y la simulación se realiza mediante un módulo Python (`calibrator.py`) que expone la clase `HestonStochasticVolatilityModel`. El conjunto de parámetros precalibrado garantiza la condición de Feller (\(2\kappa\theta > \xi^2\), con ratio 2,012) y reporta un RMSE de calibración de 0,00318.

Su relevancia es acotada pero específica: sirve como pieza reproducible para simulación de Monte Carlo de trayectorias de precio y varianza, y como referencia de calibración de un modelo de volatilidad estocástica clásico en investigación cuantitativa. No debe confundirse con un modelo generativo de texto ni evaluarse con benchmarks de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de volatilidad estocástica de Heston en tiempo continuo, bivariante (precio y varianza), con discretización de truncamiento completo |
| Parámetros totales | 5 parámetros calibrados (\(\kappa\), \(\theta\), \(\xi\), \(\rho\), \(v_0\)); no disponible el número de parámetros de un estimador subyacente |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de secuencia con ventana de contexto) |
| Tipos de cuantización | No aplica; los pesos se serializan en JSON de precisión nativa |
| Idiomas soportados | `en` (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | JSON (`calibrator_weights.json`); código Python en `calibrator.py` |

## Arquitectura y entrenamiento

La formulación es el modelo de Heston estándar: un sistema de dos ecuaciones diferenciales estocásticas acopladas por un movimiento browniano correlacionado, con covarianza \(dW_t^S, dW_t^v = \rho\,dt\). El precio sigue \(dS_t = \mu S_t dt + \sqrt{v_t} S_t dW_t^S\) y la varianza sigue un proceso de reversión a la media tipo CIR: \(dv_t = \kappa(\theta - v_t)dt + \xi\sqrt{v_t}\,dW_t^v\). La implementación emplea truncamiento completo (*full truncation*) para evitar varianzas negativas durante la discretización temporal.

No se detalla en la información disponible el procedimiento exacto de calibración (por ejemplo, si se usó mínimos cuadrados sobre superficies de volatilidad implícita, máxima verosimilitud o métodos bayesianos), ni el conjunto de datos de mercado empleado, ni el número de observaciones. Lo único verificable es el resultado: un RMSE de calibración de 0,00318 y un ratio de Feller de 2,012, lo que implica que la varianza permanece estrictamente positiva casi con probabilidad 1 bajo el conjunto de parámetros publicado. No se menciona RLHF, DPO ni ningún proceso de ajuste por preferencias, lógicamente ajeno a este tipo de modelo.

## Capacidades

- Simulación de Monte Carlo de trayectorias conjuntas de precio y varianza mediante `simulate_paths(s0, t_days, n_paths)`.
- Generación de 500 o más trayectorias en una sola llamada, con salida como arrays de NumPy.
- Garantía matemática de positividad de la varianza bajo la condición de Feller verificada.
- Reproducibilidad de la calibración mediante parámetros serializados en JSON.
- Integración directa en Python con `scikit-learn` como dependencia declarada.
- Carga de pesos preentrenados vía `HestonStochasticVolatilityModel.load_pretrained()` y `hf_hub_download`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo *thinking*.
- No es un modelo multilingüe ni generativo de texto.

## Casos de uso

- **Pricing de derivados por Monte Carlo**: simular trayectorias de \(S_t\) y \(v_t\) para valorar opciones europeas y exóticas cuyo payoff dependa de la volatilidad realizada, aprovechando que el modelo captura la sonrisa de volatilidad vía el parámetro \(\rho\).
- **Gestión de riesgo de cartera**: generar escenarios de estrés con correlación negativa precio-varianza (\(\rho < 0\)) para estimar VaR y CVaR condicionados a regímenes de alta volatilidad.
- **Validación de motores de pricing internos**: usar el calibrador como referencia reproducible con RMSE conocido (0,00318) para comparar implementaciones propias del modelo de Heston.
- **Investigación académica en cálculo estocástico**: banco de pruebas para estudiar el efecto de la discretización de truncamiento completo frente a esquemas alternativos (reflexión, absorción) en la positividad de \(v_t\).
- **Generación de datos sintéticos para modelos de ML financiero**: producir series sintéticas etiquetadas con parámetros conocidos para entrenar y evaluar clasificadores de régimen de volatilidad.
- **Simulación de estrategias de cobertura delta-vega**: evaluar la robustez de coberturas dinámicas bajo dinámicas de volatilidad estocástica en lugar de volatilidad constante.
- **Docencia en finanzas cuantitativas**: ilustrar la condición de Feller y el efecto leverage con un paquete ligero y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos métricos reportados por el autor son de diagnóstico interno del calibrador:

| Métrica | Valor |
|---|---|
| RMSE de calibración | 0,00318 |
| Ratio de Feller (\(2\kappa\theta/\xi^2\)) | 2,012 (condición satisfecha) |
| Descargas en HuggingFace | 0 |
| Likes en HuggingFace | 0 |

## Requisitos de hardware

- No requiere GPU: la simulación es CPU-bound y se ejecuta con NumPy sobre un número arbitrario de trayectorias.
- VRAM estimada: 0 GB (no aplica).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer; no hay requisito de hardware específico.
- Despliegue: Python con `scikit-learn`, `numpy` y `huggingface_hub`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen linealmente del número de trayectorias y de pasos temporales solicitados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `At1uri/stochastic-volatility-calibrator` | Heston calibrado (JSON + Python) | 5 | No aplica | MIT | HuggingFace |
| Modelo de Black-Scholes | Volatilidad constante | 1 (\(\sigma\)) | No aplica | Dominio público (formulación) | Implementaciones múltiples |
| Modelo de Bates | Heston + saltos | 7-8 típicamente | No aplica | Varía por implementación | Librerías de quant finance |
| Modelo SABR | Volatilidad estocástica sobre forwards | 4 | No aplica | Varía | Librerías de quant finance |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación es puramente estructural.

## Limitaciones y advertencias

- El modelo de Heston no captura saltos ni clustering de volatilidad de alta frecuencia; los modelos con saltos (Bates, Merton) pueden ajustar mejor colas gruesas.
- El conjunto de parámetros calibrado es único y no se especifica a qué activo, período ni mercado corresponde; usarlo fuera de ese contexto invalida el RMSE reportado.
- Riesgo de sobreajuste del calibrador a la superficie de volatilidad de un único subyacente y fecha.
- La condición de Feller se cumple solo para el conjunto de parámetros publicado; recalibraciones pueden violarla y requerir esquemas de discretización alternativos.
- No hay validación *out-of-sample* ni *backtesting* documentado en la información disponible.
- Sesgos: no aplica en el sentido de sesgos de lenguaje, pero sí existe un sesgo estructural del modelo (supuesto de difusión continua, lognormalidad del precio).
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrece garantía alguna sobre idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad.
- La model card está redactada en inglés y no incluye documentación de la API más allá de los ejemplos de uso.

## Enlaces

- HuggingFace: https://huggingface.co/At1uri/stochastic-volatility-calibrator
- Perfil del autor: https://huggingface.co/At1uri
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
