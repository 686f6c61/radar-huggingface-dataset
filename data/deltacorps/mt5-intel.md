# DELTACORPS/mt5-intel

## Resumen

El repositorio `DELTACORPS/mt5-intel` en HuggingFace no contiene un modelo de inteligencia artificial convencional (como un modelo de lenguaje o un modelo de visión), sino un **Expert Advisor (EA) para MetaTrader 5** denominado "MT5 INTEL — Autonomous Cognitive Neural Trading Brain". Se trata de un sistema de trading automatizado escrito íntegramente en MQL5, que implementa una arquitectura cognitiva de 10 capas para operar en mercados financieros sin depender de Python, DLLs, APIs externas ni servicios en la nube.

El autor, `DELTACORPS`, presenta el sistema como un "cerebro" de trading con capacidades de percepción multi-timeframe, forecasting probabilístico, razonamiento, planificación, gestión de riesgo y aprendizaje continuo en línea. Toda la lógica, incluida una red neuronal entrenable (MLP + GRU), filtros de Kalman, modelos bayesianos y de Markov, se ejecuta dentro de MQL5. Es relevante para desarrolladores e investigadores interesados en sistemas autónomos de trading algorítmico, aunque no para quienes buscan un modelo de IA reutilizable para tareas de NLP o generación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema cognitivo hibrido en MQL5 (10 capas: sensory cortex, pattern cortex, temporal memory, forecast engine, reasoning engine, strategic planner, risk intelligence, execution engine, self-evaluation, meta-learning) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos de modelo) |

## Arquitectura y entrenamiento

El sistema no es un modelo neuronal preentrenado en el sentido clásico. Su "arquitectura" es un conjunto de módulos de software interconectados que implementan un bucle cognitivo cerrado: `Observe → Understand → Predict → Plan → Execute → Monitor → Learn → Improve`. Cada capa tiene una responsabilidad concreta: desde la percepción multi-timeframe (que genera un "Market State Tensor" de 40 dimensiones), pasando por la detección de patrones de mercado (trend, range, breakout, reversal, liquidity sweep, etc.), hasta la memoria temporal con un codificador GRU y recuperación episódica k-NN.

El componente de predicción combina un ensamblaje de 8 expertos (trend, momentum, mean-reversion, breakout, volatility, liquidity, neural MLP, adaptive) mediante consenso ponderado, log-odds bayesiano y un modelo de regímenes de Markov. El entrenamiento es **continuo y en línea**: la red neuronal se actualiza con los resultados de las operaciones, los pesos del ensamblaje se adaptan mediante "multiplicative weights", y un meta-aprendizaje ajusta umbrales, apetito de riesgo y objetivos. No se documentan datos de entrenamiento estáticos ni un proceso de RLHF/DPO, ya que el aprendizaje depende de la serie temporal de operaciones reales del usuario.

## Capacidades

- **Percepción multi-timeframe**: el sistema analiza simultáneamente 4 marcos temporales (por ejemplo, M1, M5, H1, D1) para identificar la tendencia macro y evitar retrocesos o trampas de liquidez.
- **Forecasting probabilístico**: genera predicciones de dirección, magnitud, riesgo y confianza mediante un ensamblaje de 8 expertos y un modelo de Markov.
- **Planificación de operaciones**: construye planes de entrada, stop-loss, take-profit, escalado, re-entrada, trailing y break-even de forma automática.
- **Gestión de riesgo**: incluye dimensionamiento de posición basado en volatilidad, límites de exposición, tope de apalancamiento por operación, y parada por drawdown.
- **Aprendizaje en línea**: la red neuronal (MLP + GRU) y los pesos del ensamblaje se actualizan con los resultados de las operaciones cerradas, sin necesidad de reentrenamiento externo.
- **Memoria persistente**: mantiene memoria a corto plazo (STM), medio plazo (MTM) y largo plazo (LTM) con memoria episódica y de operaciones, que se guarda en disco y se recarga al reiniciar.
- **Validación integrada**: ejecuta pruebas de Monte-Carlo, walk-forward, stress y estabilidad de parámetros sobre la serie de operaciones reales.
- **Explicabilidad**: cada decisión registra entradas, sub-puntuaciones, confianza, valor esperado, sesgo macro y riesgo de retroceso.

No soporta generación de texto, tool calling, visión ni audio. No es un modelo multilingüe ni un sistema de agentes para tareas generales.

## Casos de uso

- **Trading algorítmico de alta frecuencia (scalping)**: el EA está diseñado para operar en marcos M1/M5 con un modo de scalping seleccionable manualmente, gestionando entradas y salidas rápidas con control de riesgo automático.
- **Trading swing y de largo plazo**: el modo "Swing/Long" permite operar con objetivos más amplios y mantener posiciones durante varios días o semanas, adaptándose a la tendencia macro detectada por la percepción multi-timeframe.
- **Trading híbrido**: el modo automático "Hybrid" combina scalping con la retención de "runners" (posiciones que se dejan correr) para capturar movimientos grandes, lo que resulta útil en mercados volátiles.
- **Backtesting y validación de estrategias**: el sistema incluye un módulo de validación con pruebas de Monte-Carlo y walk-forward, que permite evaluar la robustez de la estrategia sobre datos históricos del broker.
- **Gestión automatizada de riesgo en cuentas reales**: integra límites de drawdown, control de exposición y dimensionamiento por volatilidad, lo que lo hace adecuado como capa de gestión de riesgo sobre otras estrategias o como EA independiente.
- **Investigación en sistemas cognitivos de trading**: para desarrolladores interesados en arquitecturas de agentes con memoria, ensamblaje de expertos y meta-aprendizaje aplicados a mercados financieros, el código MQL5 sirve como referencia de implementación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona una sección "Verified Results" y "Backtesting", pero no incluye métricas concretas (como win rate, profit factor, drawdown, etc.) en el texto proporcionado. Tampoco se ofrecen comparaciones con otros sistemas de trading o modelos de IA.

## Requisitos de hardware

- **Software**: MetaTrader 5 (build 4000 o superior recomendado; desarrollado en build 5836).
- **Hardware**: cualquier PC capaz de ejecutar MetaTrader 5. No requiere GPU, ni VRAM, ni aceleración por hardware.
- **Recursos**: suficiente historial de mercado del broker para el símbolo operado (desarrollado en EURUSD).
- **Despliegue**: exclusivamente dentro de la plataforma MetaTrader 5. No se puede ejecutar con vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime de modelos de lenguaje.
- **Latencia y throughput**: no aplicable, ya que no es un modelo de inferencia de redes neuronales con requisitos de cómputo medibles.

## Comparativa con modelos similares

No disponible. El repositorio no es comparable con modelos de lenguaje o de visión de HuggingFace. En el ámbito de Expert Advisors para MetaTrader 5, no se proporcionan datos de modelos alternativos ni benchmarks comparativos. Cualquier comparación con sistemas como mT5 (modelo multilingüe de T5) sería engañosa, ya que `mt5-intel` no comparte arquitectura ni propósito con ese modelo.

## Limitaciones y advertencias

- **No es un modelo de IA reutilizable**: no se distribuyen pesos, configuraciones de red ni embeddings. El código MQL5 es el único artefacto, y su funcionamiento depende de la plataforma MetaTrader 5.
- **Licencia no especificada**: el README menciona una sección "License", pero el texto proporcionado no indica los términos. No se puede confirmar si el uso comercial está permitido o restringido.
- **Riesgo financiero**: se trata de un sistema de trading automatizado. El rendimiento pasado no garantiza resultados futuros. El autor incluye un "Risk Disclaimer", pero no se detalla en la información disponible.
- **Dependencia del broker**: el sistema requiere historial de mercado del broker y puede comportarse de forma diferente según el símbolo, el broker y las condiciones de ejecución.
- **Sin validación externa**: los resultados de "Verified Results" no están respaldados por datos numéricos en el material proporcionado. La fiabilidad de las afirmaciones del autor no puede verificarse de forma independiente.
- **No apto para tareas de NLP**: al no ser un modelo de lenguaje, no puede utilizarse para generación de texto, traducción, resumen ni ninguna tarea lingüística.
- **Riesgo de alucinación**: no aplica en el sentido de modelos generativos, pero las decisiones del sistema pueden basarse en patrones históricos que no se repiten, lo que podría causar pérdidas.

## Enlaces

- HuggingFace: [https://huggingface.co/DELTACORPS/mt5-intel](https://huggingface.co/DELTACORPS/mt5-intel)

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la información proporcionada. La búsqueda web devolvió resultados sobre el modelo mT5 de Google, soporte de Microsoft y un artículo de Intel sobre GenAI/LLM, ninguno de los cuales guarda relación con este repositorio.
