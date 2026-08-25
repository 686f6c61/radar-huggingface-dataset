# hajirazin/learnfinance-models-sac-it-heavy

## Resumen

El modelo `hajirazin/learnfinance-models-sac-it-heavy` es un agente de aprendizaje por refuerzo (RL) basado en Soft Actor-Critic (SAC) v3, diseñado para la optimización de carteras de inversión. Desarrollado por el autor hajirazin, este modelo toma decisiones de asignación de pesos sobre un conjunto de 12 acciones estadounidenses, con una arquitectura que incluye atención enmascarada sobre 30 slots de acciones más un slot de efectivo. El modelo se entrenó con datos del 2016 al 2026 y se publica como parte de un sistema de gestión de carteras con componentes de previsión (PatchTST forecasts) y un mecanismo de optimización basado en RL.

La relevancia actual del modelo reside en su enfoque híbrido: combina predicciones de series temporales (PatchTST) con un agente SAC que aprende a rebalancear la cartera en cada paso temporal. Esto permite una optimización continua del ratio de Sharpe y del CAGR, con un control explícito de la exposición al riesgo. Aunque el modelo no es un LLM ni procesa lenguaje, su arquitectura de RL con atención enmascarada y su integración con herramientas de almacenamiento específicas (`brain_api`) lo hacen interesante para aplicaciones de finanzas cuantitativas y agentes de decisión automatizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAC v3 con masked attention, 30 slots de acciones + CASH |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantización | no aplica (pesos en formato PyTorch) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt), Pickle (.pkl), JSON (.json) |
| Versión | v2026-08-21_9652fd6b |
| Símbolos | 12 acciones (US) |
| Ventana de entrenamiento | 2016-01-01 a 2026-08-21 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAC (Soft Actor-Critic) en su versión 3, adaptada a la optimización de carteras. Incluye una red de política (actor) gaussiana, dos redes críticas (twin Q-value networks) y redes objetivo para la estabilidad del entrenamiento. La atención enmascarada se aplica sobre un conjunto de 30 slots de acciones (aunque el modelo solo tiene 12 símbolos reales) más un slot de efectivo, lo que permite al modelo aprender a asignar pesos de forma flexible y manejar la incertidumbre del mercado.

El entrenamiento se realizó sobre datos de mercado de 2016 a 2026, con un escalador de cartera (`PortfolioScaler`) para la normalización de estados. Se utilizó un esquema de entropía ajustable (log_alpha) para controlar la exploración. La política se optimizó con el objetivo de maximizar el retorno medio por episodio y el ratio de Sharpe. El modelo incorpora además un módulo auxiliar (`sac_v3_auxiliary.json`) con parámetros de un modelo de Markov oculto (HMM) para etiquetar estados del mercado y un estado de corte causal, lo que permite al modelo adaptarse a regímenes de mercado.

## Capacidades

- Optimización de cartera en tiempo real: asigna pesos a 12 acciones y un slot de efectivo en cada paso temporal.
- Control de riesgo mediante el ratio de Sharpe y la maximización del CAGR, con límite de drawdown.
- Manejo de incertidumbre: el uso de SAC permite una política estocástica que explora distintas asignaciones.
- Integración con pronósticos de PatchTST: el modelo se combina con previsiones de series temporales para la toma de decisiones.
- Soporte para almacenamiento y carga mediante `brain_api` (SACHuggingFaceModelStorage) con filtrado de componentes.
- No procesa lenguaje ni texto; es un modelo de decisión numérica.

## Casos de uso

- Optimización de cartera en tiempo real: el modelo puede ajustar los pesos de una cartera de 12 acciones cada día, basándose en el estado del mercado y en las predicciones de PatchTST. Su entrenamiento con SAC permite un reequilibrio dinámico que busca maximizar el Sharpe.
- Backtesting de estrategias de inversión: se puede integrar en un entorno de simulación para evaluar el comportamiento histórico del modelo desde 2016 hasta 2026, usando las métricas de evaluación como referencia.
- Gestión de riesgo con control de drawdown: la política del modelo está entrenada para limitar la pérdida máxima (eval max drawdown de 0.288), por lo que puede usarse como componente de un sistema de control de riesgo en carteras de renta variable.
- Investigación en RL financiero: sirve como ejemplo de aplicación de SAC con atención enmascarada y slots de activos, útil para estudiar la optimización de carteras con RL.
- Componente de un sistema agente de trading: se puede combinar con módulos de predicción (PatchTST) y de ejecución de órdenes para crear un agente autónomo que decida cuándo comprar o vender.
- Backtesting de estrategias de asignación de activos: los componentes (actor, critic) permiten reproducir la política en un entorno de backtesting y comparar con benchmarks de mercado.

## Benchmarks y rendimiento

El autor no ha publicado benchmarks estandarizados (como MMLU o HumanEval) ya que el modelo no es un LLM. En la model card se reportan las métricas de entrenamiento y evaluación:

| Métrica | Valor |
|---|---|
| Actor Loss | 0.9212384819984436 |
| Critic Loss | 0.3428606688976288 |
| Avg Episode Return | 0.3945224983222917 |
| Avg Episode Sharpe | 0.21188304255648574 |
| Eval Sharpe | 1.2107067985886417 |
| Eval CAGR | 0.36437026128333616 |
| Eval Max Drawdown | 0.28885237896707 |

Estas métricas provienen del entrenamiento del autor y no están comparadas con otros modelos. No hay información sobre benchmarks externos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación disponible. Dado que el modelo es pequeño (el repositorio tiene un tamaño de 0.0 GB, aunque el contenido real está comprimido), es probable que la inferencia se pueda ejecutar en una CPU estándar.
- Los archivos incluyen pesos de redes neuronales (actor, critic, critic_target, log_alpha) y datos auxiliares (scaler, symbol_order, metadata). No se indica el número de parámetros, pero al ser un modelo SAC típico para RL, podría tener entre 1 y 10 millones de parámetros, lo que requiere poca memoria (menos de 1 GB en FP32).
- No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de RL no un LLM.
- Para un despliegue en producción se podría usar un contenedor con Python y la librería `brain_api` para cargar el modelo y realizar inferencias.

## Comparativa con modelos similares

No hay información disponible sobre modelos similares en el mismo repositorio o contexto. Se desconoce si existen otros modelos de optimización de cartera basados en SAC con características comparables. No se puede realizar una comparación con alternativas.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, por lo que su uso comercial y la redistribución están sujetos a incertidumbre legal.
- El modelo está entrenado con datos históricos de un periodo concreto (2016-2026) y puede no generalizar a condiciones de mercado futuras o a otros mercados geográficos.
- Las métricas reportadas (Sharpe, CAGR, Drawdown) son de evaluación interna y no garantizan resultados futuros; la optimización de Sharpe puede sobreajustarse a datos pasados.
- No se ha documentado el tratamiento de sesgos o riesgos de alucinación (no aplicable al ser un modelo numérico). Sin embargo, la política puede tomar decisiones arriesgadas en escenarios extremos.
- El modelo depende de la calidad de los pronósticos de PatchTST (no incluidos en este repositorio) para funcionar correctamente. Si los pronósticos son erróneos, la asignación de pesos puede ser subóptima.
- No se garantiza la compatibilidad con otras versiones del entorno `brain_api`; el uso requiere la instalación de la librería específica.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hajirazin/learnfinance-models-sac-it-heavy)
- [Repositorio GitHub de LearnFinance-2025](https://github.com/hajirazin/LearnFinance-2025)
- [Página de política en Festivus](https://festivus.hapticlabs.ai/data/policies/hajirazin-learnfinance-models-sac) (menciona el modelo con doble pronóstico)
- [Modelo padre en Hugging Face](https://huggingface.co/hajirazin/learnfinance-models) (con licencia MIT)</think>## Resumen

El modelo `hajirazin/learnfinance-models-sac-it-heavy` es un agente de aprendizaje por refuerzo basado en Soft Actor-Critic (SAC) v3, desarrollado por el usuario `hajirazin` para la optimización de carteras de inversión. Emplea una arquitectura de atención enmascarada sobre 30 slots de activos más un slot de efectivo, aunque el conjunto de entrenamiento se limita a 12 acciones estadounidenses. El modelo se entrenó con datos de mercado desde 2016 hasta 2026 y se publica como parte de un sistema más amplio de gestión financiera que incorpora pronósticos de PatchTST y un módulo de escalado de cartera.

La relevancia de este modelo radica en su enfoque híbrido: combina predicciones de series temporales con una política de RL que ajusta dinámicamente los pesos de la cartera en cada paso temporal. La inclusión de un control de entropía (log_alpha) permite balancear la exploración y explotación, mientras que la atención enmascarada facilita la selección de los activos más relevantes en cada estado del mercado. Aunque no se trata de un modelo de lenguaje, su aplicación en finanzas cuantitativas y su integración con herramientas de almacenamiento y descarga específicas (`brain_api`) lo convierten en un recurso útil para investigadores y desarrolladores de sistemas de trading algorítmico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAC v3 con masked attention (30 slots + CASH) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantización | no aplica (pesos en formato PyTorch) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt), Pickle (.pkl), JSON (.json) |
| Versión del modelo | v2026-08-21_9652fd6b |
| Ventana de entrenamiento | 2016-01-01 a 2026-08-21 |
| Símbolos | 12 acciones (región US) |

## Arquitectura y entrenamiento

El modelo se basa en el algoritmo Soft Actor-Critic (SAC) en su versión 3, adaptado a la toma de decisiones en carteras. La arquitectura incluye una política gaussiana (`actor.pt`), dos redes críticas (twin Q-networks) y redes objetivo para estabilizar el entrenamiento. La atención enmascarada se aplica sobre una representación de 30 slots de activos, aunque solo se utilizan 12 acciones reales, lo que permite al modelo aprender a ignorar slots vacíos y concentrarse en los activos disponibles. El entrenamiento se realizó con un `PortfolioScaler` para normalizar los estados y un parámetro de temperatura (log_alpha) para ajustar la entropía de la política.

El proceso de entrenamiento se llevó a cabo sobre datos históricos de 2016 a 2026, con un objetivo de maximizar el retorno medio por episodio y el ratio de Sharpe. El modelo se acompaña de un archivo auxiliar (`sac_v3_auxiliary.json`) que contiene parámetros de un modelo oculto de Markov (HMM) para identificar regímenes de mercado y un estado de corte temporal, lo que permite que el agente se adapte a diferentes condiciones económicas. No se han especificado los detalles del conjunto de datos (número de tokens, composición) ni si se aplicaron técnicas de RLHF o DPO; la información disponible se limita a los componentes y métricas reportadas.

## Capacidades

- Optimización de asignación de pesos: el modelo decide la proporción de capital a asignar a cada una de las 12 acciones y al efectivo en cada paso.
- Control de riesgo: la política entrenada busca maximizar el Sharpe y el CAGR, limitando el drawdown máximo (eval max drawdown de 0.288).
- Adaptación a regímenes de mercado: mediante el HMM auxiliar, el modelo puede identificar cambios en la volatilidad y la tendencia.
- Integración con pronósticos de PatchTST: se combina con predicciones de series temporales para tomar decisiones informadas.
- Exploración controlada: la entropía del SAC permite explorar estrategias alternativas durante la inferencia.
- No tiene capacidades de lenguaje natural ni de generación de texto; es un modelo de decisión numérica.

## Casos de uso

- Gestión de cartera en tiempo real: el modelo puede rebalancear una cartera de 12 acciones cada día, ajustando los pesos según los pronósticos de PatchTST y el estado del mercado. Su política de SAC permite una respuesta rápida a cambios de volatilidad.
- Backtesting de estrategias de inversión: se puede integrar en un entorno de simulación para evaluar el comportamiento histórico desde 2016, utilizando las métricas de Sharpe y CAGR como referencia para comparar con otras estrategias.
- Sistema de control de drawdown: el modelo está entrenado para limitar pérdidas máximas, por lo que puede servir como un componente de gestión de riesgo en un sistema de trading más amplio.
- Investigación en finanzas cuantitativas: ofrece un caso práctico de aplicación de RL con atención enmascarada en la optimización de carteras, útil para estudiar el efecto de la entropía y la arquitectura de slots.
- Backtesting de estrategias de rebalanceo: los pesos generados se pueden aplicar a datos históricos para comparar el CAGR y el Sharpe con un benchmark pasivo (por ejemplo, un índice).
- Agente autónomo de trading: se puede conectar con módulos de ejecución de órdenes y de previsión para crear un sistema que decida automáticamente la composición de la cartera en función de las señales de mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (como MMLU o HumanEval) ya que el modelo no es un LLM. En la model card se reportan las métricas de entrenamiento y evaluación:

| Métrica | Valor |
|---|---|
| Actor Loss | 0.9212384819984436 |
| Critic Loss | 0.3428606688976288 |
| Avg Episode Return | 0.3945224983222917 |
| Avg Episode Sharpe | 0.21188304255648574 |
| Eval Sharpe | 1.2107067985886417 |
| Eval CAGR | 0.36437026128333616 |
| Eval Max Drawdown | 0.28885237896707 |

Estas métricas provienen del entrenamiento del autor y no se comparan con otros modelos de optimización de cartera. No hay datos de benchmarks estándar del sector.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación. Dado que el repositorio tiene un tamaño de 0.0 GB (probablemente el contenido está comprimido o es muy liviano), se estima que el modelo puede ejecutarse en una CPU estándar.
- Los archivos de pesos (actor.pt, critic.pt, critic_target.pt, log_alpha.pt) son de tamaño pequeño, probablemente menos de 100 MB en total, por lo que caben en memoria de cualquier ordenador moderno.
- No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de RL no un LLM. La inferencia se realiza mediante la librería `brain_api` de Python.
- Para producción, se podría desplegar en un contenedor Docker con una imagen Python, sin necesidad de GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos de optimización de cartera similares con los que comparar. La búsqueda web no ha proporcionado alternativas comparables en el mismo repositorio o en la literatura pública. Se indica "no disponible".

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial y la redistribución son inciertos; se recomienda contactar con el autor para aclarar los términos.
- El modelo se entrenó con datos de un periodo específico (2016-2026) y puede no generalizar a mercados fuera de EE. UU. o a condiciones económicas extremas no representadas en el conjunto de entrenamiento.
- Las métricas de evaluación (Sharpe, CAGR, Drawdown) son internas y no garantizan rendimientos futuros; pueden estar sobreajustadas a los datos históricos.
- No se han documentado sesgos ni riesgos de alucinación (no aplicable a un modelo numérico), pero las decisiones de inversión pueden ser agresivas en entornos de alta volatilidad.
- El modelo depende de los pronósticos de PatchTST para funcionar correctamente. Si los pronósticos son incorrectos, la asignación de pesos puede ser subóptima.
- La integración requiere de la librería `brain_api` específica, que no está documentada en el repositorio y puede tener dependencias adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hajirazin/learnfinance-models-sac-it-heavy)
- [Repositorio GitHub de LearnFinance-2025](https://github.com/hajirazin/LearnFinance-2025)
- [Policy de Festivus para el modelo](https://festivus.hapticlabs.ai/data/policies/hajirazin-learnfinance-models-sac)
- [Modelo padre en Hugging Face](https://huggingface.co/hajirazin/learnfinance-models)
