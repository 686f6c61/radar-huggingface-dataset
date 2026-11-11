# BUBOUTLW/OUTLAW-AI-Trading

## Resumen

OUTLAW-AI-Trading es un sistema de trading algorítmico publicado en Hugging Face por el usuario BUBOUTLW (con referencias en la model card al repositorio de GitHub de JonusNattapong). No es un modelo de lenguaje: se trata de un ensemble de agentes de reinforcement learning (PPO, TD3 y SAC) orientado a la operativa del par XAUUSD (oro frente al dólar estadounidense). El sistema incorpora detección de régimen de mercado, dimensionamiento de posición basado en confianza y gestión de riesgo avanzada.

El repositorio tiene un tamaño de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere que los pesos no están efectivamente alojados o que el artefacto publicado es únicamente la model card y metadatos. La model card describe una arquitectura modular (motor de IA, inteligencia de mercado, gestión de riesgo y analítica) implementada en Python sobre stable-baselines3 y Gymnasium.

El interés del proyecto es fundamentalmente educativo y de investigación: sirve como ejemplo de aplicación de RL al trading y de integración de ensembles con gestión de riesgo adaptativa. No debe confundirse con un modelo fundacional ni con un sistema listo para producción; el propio autor lo enmarca como material de estudio y benchmark.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de reinforcement learning (PPO, TD3, SAC) sobre entorno Gymnasium |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card menciona ficheros `ppo_model.zip`, `td3_model.zip`, `sac_model.zip` de stable-baselines3; el repositorio figura con 0.0 GB) |

## Arquitectura y entrenamiento

El sistema se compone de tres algoritmos de RL profundo combinados en un ensemble: PPO (on-policy, policy gradient con clipping), TD3 (off-policy, actor-critic determinista con doble crítico) y SAC (off-policy, actor-critic con entropía máxima). Cada agente opera sobre un entorno de trading (`trading_env.py`) construido con Gymnasium, que modela el mercado XAUUSD y las acciones de compra, venta y mantenimiento de posición. La señal final del ensemble se acompaña de una puntuación de confianza que alimenta el dimensionamiento de posición (`confidence_sizing.py`).

El sistema añade una capa de detección de régimen de mercado (`market_regime_detector.py`) que clasifica el estado en seis condiciones distintas y aplica parámetros adaptativos (`regime_parameters.py`). La model card menciona cuatro regímenes con métricas desglosadas (Strong Bull, Bull Trend, Ranging, High Volatility), aunque declara seis en la descripción general. La gestión de riesgo (`advanced_risk_manager.py`) implementa toma de beneficios escalada, stops de breakeven y trailing stops. No se especifica el número de tokens, la composición del dataset ni si se empleó RLHF o DPO; el entrenamiento se realizó sobre datos históricos de XAUUSD entre 2015 y 2025 según la model card.

## Capacidades

- Generación de señales de trading (compra, venta, mantenimiento) sobre XAUUSD mediante ensemble de PPO, TD3 y SAC.
- Detección de régimen de mercado con parámetros adaptativos por condición.
- Dimensionamiento de posición basado en la confianza del modelo y un riesgo por operación configurable (por defecto 2%).
- Gestión de riesgo automatizada: toma de beneficios escalada, breakeven stops y trailing stops.
- Ejecución en vivo mediante interfaz de trading (`live_trading_interface.py` / `LiveEnsembleTrader`), con capital y apalancamiento configurables.
- Analítica de rendimiento y visualización de resultados (`performance_analyzer.py`, `visualization.py`).
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión, audio ni capacidades multilingües más allá del inglés en la documentación.

## Casos de uso

- Investigación educativa en RL aplicado a finanzas: el repositorio permite estudiar cómo se combinan PPO, TD3 y SAC en un ensemble y cómo se integra la detección de régimen en la política de decisión.
- Desarrollo de algoritmos de trading: sirve como base para extender o comparar estrategias sobre XAUUSD, reutilizando el entorno Gymnasium y los módulos de riesgo.
- Benchmarking de sistemas de trading: las métricas declaradas (win rate, ratio riesgo-beneficio, Sharpe, Sortino, Calmar) permiten comparar contra otras implementaciones.
- Investigación en gestión de riesgo adaptativa: el módulo `advanced_risk_manager.py` ejemplifica toma de beneficios escalada y trailing stops aplicables a otros activos.
- Análisis de regímenes de mercado: el detector de régimen y sus parámetros asociados pueden reutilizarse para estudiar cómo cambia el comportamiento de una política según la condición del mercado.
- Prototipado de ejecución en vivo en entorno simulado: la clase `LiveEnsembleTrader` permite ensayar el bucle de ejecución con capital y apalancamiento configurables antes de conectar un bróker real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Valor | Mejora declarada |
|---|---|---|
| Win Rate | 58.3% | +26.0% |
| Average Win | 49.45 USD | +11.0x (desde 4.16 USD) |
| Average Loss | -106.18 USD | +4.2x |
| Risk-Reward Ratio | 1:0.47 | +2.8x |
| Profit Exit Rate | 50.0% | +17.9x |
| Sharpe Ratio | 2.0+ | — |
| Sortino Ratio | 2.5+ | — |
| Calmar Ratio | 3.0+ | — |
| Max Drawdown | <5% | — |

Rendimiento por régimen de mercado (declarado por el autor):

| Régimen | Win Rate | Avg Win | Estrategia |
|---|---|---|---|
| Strong Bull | 65.2% | 62.34 USD | Captura agresiva de beneficios |
| Bull Trend | 61.8% | 54.21 USD | Seguimiento de momento |
| Ranging | 52.1% | 38.92 USD | Beneficios rápidos, stops ajustados |
| High Volatility | 48.9% | 45.67 USD | Salidas rápidas, exposición mínima |

Backtesting declarado sobre datos históricos de XAUUSD 2015-2025. No se han publicado resultados verificados de forma independiente.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Al tratarse de un ensemble de PPO, TD3 y SAC con redes de política de tamaño moderado (no se detalla la arquitectura exacta), la inferencia es viable en CPU; el entrenamiento se beneficia de GPU, pero no se documenta.
- Dependencias declaradas: `stable-baselines3`, `gymnasium`, `pandas`, `numpy`, `scikit-learn`, `yfinance`.
- Opciones de despliegue: ejecución directa en Python mediante los scripts del repositorio; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (ensembles de RL para trading de XAUUSD) con parámetros, contexto y licencia documentados de forma verificable.

## Limitaciones y advertencias

- No constituye asesoramiento financiero; el propio autor indica que no debe usarse para operar sin validación exhaustiva.
- Rendimiento basado únicamente en datos históricos; resultados pasados no garantizan resultados futuros.
- Los mercados financieros implican riesgo sustancial de pérdida; el apalancamiento configurable (por defecto 50x en el ejemplo) amplifica ese riesgo.
- Dependencia de datos de mercado de calidad para funcionar correctamente.
- Las métricas de la model card están marcadas como no verificadas (`verified: false`) y provienen del propio autor.
- El repositorio figura con 0.0 GB y cero descargas; no está confirmado que los pesos (`ppo_model.zip`, `td3_model.zip`, `sac_model.zip`) estén efectivamente disponibles.
- Inconsistencia documentada: la descripción menciona seis regímenes de mercado, pero solo se detallan cuatro en la tabla de rendimiento.
- Licencia MIT: permite uso comercial, pero ello no exime de la responsabilidad legal y financiera del uso en producción.
- Idioma de la documentación: únicamente inglés.

## Enlaces

- Hugging Face: https://huggingface.co/BUBOUTLW/OUTLAW-AI-Trading
- Repositorio GitHub referenciado en la model card: https://github.com/JonusNattapong/AI-XAUUSD-Trading
- Modelo en Hugging Face referenciado en la model card: https://huggingface.co/JonusNattapong/AI-XAUUSD-Trading
- Licencia MIT: https://opensource.org/licenses/MIT
