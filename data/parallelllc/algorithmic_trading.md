# ParallelLLC/algorithmic_trading

## Resumen

ParallelLLC/algorithmic_trading es un repositorio de software de código abierto (licencia Apache 2.0) desarrollado por Parallel LLC, orientado a la investigación cuantitativa y al trading algorítmico. No es un modelo de lenguaje ni una red neuronal preentrenada, sino un conjunto de herramientas que combina un backtester con validación estadística rigurosa (algotrader 2.0) y un sistema agéntico basado en reinforcement learning (Agentic v1) que utiliza políticas FinRL (PPO, A2C, DDPG, TD3). El proyecto resuelve el problema de la fiabilidad de los backtests: en lugar de limitarse a calcular rentabilidades, aplica pruebas de permutación, deflated Sharpe ratio, PBO (Probability of Backtest Overfitting) y walk-forward para determinar si una estrategia tiene ventaja real o es fruto del azar.

La relevancia actual radica en que aborda un problema crítico en finanzas cuantitativas: la mayoría de los backtests sobreajustan y fallan en producción. El repositorio incluye ingestión de datos reales de Yahoo Finance (por defecto) o Alpaca, ejecución en papel o en vivo, y una interfaz Gradio para pruebas interactivas. El tamaño del repositorio es de 0.1 GB y está escrito en Python con PyTorch. No se especifican parámetros de red neuronal porque el proyecto no publica pesos preentrenados; las políticas se entrenan según los datos y la configuración del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (proyecto de software; usa políticas FinRL: PPO, A2C, DDPG, TD3) |
| Parametros totales | No disponible (depende de la politica entrenada por el usuario) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (no es un modelo de lenguaje) |
| Idiomas soportados | Ingles (codigo y documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (codigo fuente Python; no hay pesos preentrenados) |

## Arquitectura y entrenamiento

El repositorio se divide en dos capas. La primera, `algotrader 2.0`, es un backtester que implementa un conjunto de validaciones estadísticas: permutación de Monte-Carlo (reordenando barras), deflated Sharpe ratio (DSR), PBO mediante CSCV, walk-forward y estrés de costes a 3× fricción. Calcula un "Reality Score" (0-100, grados A-F) ponderando significancia (30%), selección (25%), walk-forward (20%), sobreajuste (15%) y robustez (10%). Incluye controles como buy-and-hold y coin-flip para comparar.

La segunda capa, `agentic_ai_system`, integra políticas de reinforcement learning de FinRL (PPO, A2C, DDPG, TD3) sin modificaciones. Los datos se obtienen de Yahoo Finance (por defecto) o Alpaca (opcional, con claves de API). El entrenamiento de las políticas se realiza sobre datos OHLCV reales o sintéticos (GBM/regímenes) cuando se solicita explícitamente. No se documentan detalles de la arquitectura de red (número de capas, unidades, etc.) porque dependen de la implementación de FinRL y de la configuración del usuario. No se menciona uso de RLHF ni DPO; el entrenamiento es puramente de refuerzo.

## Capacidades

- Backtesting de estrategias de timing (una sola acción) y cross-sectional (cartera de varias acciones) con validación estadística completa.
- Pruebas de permutación para evaluar si una regla tiene estructura real o es azar.
- Cálculo de deflated Sharpe ratio y PBO (CSCV) para corregir el sesgo de selección múltiple.
- Walk-forward analysis y estrés de costes a 3× fricción.
- Entrenamiento de políticas de reinforcement learning (PPO, A2C, DDPG, TD3) mediante FinRL.
- Ingestión de datos de mercado reales desde Yahoo Finance (por defecto) o Alpaca (autenticado).
- Ejecución en papel (paper trading) o en vivo a través de Alpaca.
- Interfaz Gradio para pruebas interactivas y CLI para automatización.
- Soporte de simulador sintético (GBM/regímenes) para pruebas offline.
- Medición de look-ahead bias (posición con lag >= 1) y turnover contra pesos derivados.
- Regresión de estilos (mercado, momentum, low-vol, reversión, liquidez) con errores estándar de White.

## Casos de uso

- Validación de una estrategia de cruce de medias móviles: el usuario ejecuta `python -m algotrader.cli lab --symbol SPY --strategy sma_cross` y obtiene un informe con p-valor de permutación, DSR y grado A-F, lo que permite decidir si la estrategia tiene ventaja real antes de arriesgar capital.
- Comparación de múltiples estrategias en una cartera: con `--strategy xs_momentum` sobre un conjunto de tickers, el Portfolio Lab aplica permutación de pesos dentro de fecha para preservar la correlación de mercado, adecuado para estrategias long-short.
- Entrenamiento de un agente de RL para trading intradía: usando `agentic_ai_system` con datos de Yahoo (1m limitado a ~7 días) o Alpaca, se entrena una política PPO y se evalúa en backtest con métricas de validación.
- Automatización de ejecución en papel: configurando `execution.broker_api: alpaca_paper`, el sistema puede enviar órdenes simuladas a Alpaca para probar la latencia y el flujo de trabajo sin capital real.
- Investigación académica sobre sobreajuste en backtests: el módulo `algotrader/validation/` implementa DSR y PBO con referencias a Bailey & López de Prado (2014) y Bailey et al. (2016), útil para reproducir experimentos.
- Despliegue de un espacio HuggingFace para validación comunitaria: el script `deploy_hf_space.sh` permite publicar una demo interactiva con Gradio, donde otros usuarios pueden probar estrategias sobre datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de IA en la informacion disponible. El repositorio incluye pruebas de validación de estrategias (permutación, DSR, PBO) pero no métricas de rendimiento de redes neuronales. Los resultados de backtesting dependen de los datos y parámetros elegidos por el usuario, por lo que no se pueden reportar cifras generales.

## Requisitos de hardware

- El repositorio pesa 0.1 GB y el código es ligero; la mayoría de las operaciones de backtesting y validación se ejecutan en CPU sin problemas.
- El entrenamiento de políticas FinRL (PPO, A2C, DDPG, TD3) puede requerir GPU para acelerar, especialmente con datos de alta frecuencia o múltiples activos. Una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650 o superior) es suficiente para experimentos pequeños.
- Para ejecución en producción con datos de Yahoo, no se requiere hardware especial; un VPS con 2 GB de RAM es suficiente.
- Opciones de despliegue: CLI (`python -m algotrader.cli`), interfaz Gradio (`python app.py`), contenedores Docker (incluidos en el repo), y HuggingFace Spaces mediante el script de despliegue.
- No se proporcionan datos de latencia o throughput; el rendimiento depende del volumen de datos y de la complejidad de la estrategia.

## Comparativa con modelos similares

No aplica directamente porque no es un modelo de IA comparable con LLMs. Como framework de trading algorítmico, se puede comparar con:

| Framework | Tipo | Validación estadística | RL integrado | Fuente de datos | Licencia |
|---|---|---|---|---|---|
| ParallelLLC/algorithmic_trading | Backtesting + RL | Sí (permutación, DSR, PBO, walk-forward) | Sí (FinRL) | Yahoo, Alpaca | Apache 2.0 |
| Backtrader | Backtesting | No (solo métricas básicas) | No | Varios (Yahoo, CSV, etc.) | GPL |
| Zipline | Backtesting | No | No | Varios | Apache 2.0 |
| FinRL (original) | RL para trading | No | Sí (PPO, A2C, etc.) | Yahoo, Alpaca | MIT |

La principal diferencia es la capa de validación estadística, que no está presente en los frameworks tradicionales. FinRL ofrece RL pero sin las pruebas de robustez que incluye este proyecto.

## Limitaciones y advertencias

- Es una herramienta de investigación, no un consejo de inversión. El README lo indica explícitamente.
- Los datos de Yahoo Finance son retrasados, no oficiales y con límite de historial (1m solo ~7 días). Para datos de calidad se recomienda Alpaca.
- El entrenamiento de RL puede sufrir de sobreajuste si no se aplican las validaciones incluidas; el proyecto las proporciona pero el usuario debe usarlas.
- La ejecución en vivo requiere un contrato de evaluación separado y claves de API de Alpaca; no se incluye gestión de riesgos avanzada más allá de límites de posición y drawdown.
- No se documentan sesgos específicos del modelo, pero al ser un sistema de trading, existe riesgo de alucinación estadística (estrategias que parecen rentables pero no lo son) si se ignoran las pruebas de permutación.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las regulaciones financieras locales.
- El proyecto está en inglés; la documentación y los mensajes de error no están traducidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ParallelLLC/algorithmic_trading
- Repositorio GitHub (mencionado en el README): https://github.com/ParallelLLC/algorithmic_trading
- Referencias citadas: Bailey & López de Prado (2014) DSR; Bailey et al. (2016) PBO; Masters (2018) permutation tests for trading systems.
