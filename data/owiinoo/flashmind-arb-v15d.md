# Owiinoo/flashmind-arb-v15d

## Resumen

FlashMind v15d es un agente de aprendizaje por refuerzo (RL) desarrollado por Owiinoo (Owen King) para la toma de decisiones en arbitraje DeFi. El modelo emplea el algoritmo PPO (Proximal Policy Optimization) con una política de tipo MLP de 384K parámetros y resuelve un problema de clasificación binaria: dada una oportunidad de arbitraje, decide si ejecutarla o ignorarla. Su relevancia radica en la corrección de un problema de discriminación entre oportunidades rentables y no rentables, lograda mediante el ajuste `norm_reward=False` en `VecNormalize`.

El modelo ha sido evaluado de forma independiente tras aproximadamente 350K pasos de entrenamiento, alcanzando una tasa de ejecución rentable del 43,9% y un PnL medio de 457,6 ETH por episodio. Está implementado sobre Stable Baselines3, lo que permite su carga directa mediante `PPO.load`. No es un modelo de lenguaje natural, sino un agente de decisión numérica aplicado al ámbito financiero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO con política MLP (Stable Baselines3) |
| Parametros totales | 384K |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente `.zip` de SB3) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de red neuronal densa (MLP) con 384K parámetros, entrenada mediante el algoritmo PPO. La observación es un vector de 621 dimensiones: 598 métricas de mercado, 21 variables one-hot y 2 señales de oportunidad. La acción es discreta con dos opciones: `EXECUTE` (ejecutar el arbitraje) y `SKIP` (ignorar la oportunidad). El entrenamiento se realizó durante 500K pasos (aproximadamente 88 minutos), con un currículo que aplica una penalización de -5.0 durante los primeros 50K pasos y luego reduce a -2.0 para `EXECUTE_NO_OPP_PENALTY`. La recompensa por saltar oportunidades no rentables es de +0.05.

La innovación clave es el uso de `norm_reward=False` en `VecNormalize`, que según el autor fue el factor crítico para enseñar al modelo a discriminar entre oportunidades buenas y malas. No se proporcionan detalles sobre la composición del dataset de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Toma de decisiones binaria (ejecutar o saltar) sobre oportunidades de arbitraje en mercados DeFi.
- Discriminación entre oportunidades rentables y no rentables con una tasa de acierto del 43,9% sobre el total de ejecuciones.
- Gestión de estrategias múltiples: el modelo mantiene activas una media de 10,5 estrategias simultáneas.
- Capacidad de aprendizaje por refuerzo en entornos de mercado dinámico, adaptándose a condiciones cambiantes.
- No tiene capacidades de generación de texto, visión, audio ni razonamiento lingüístico.

## Casos de uso

- Bots de arbitraje DeFi automatizados: el modelo puede integrarse en un sistema de trading para evaluar oportunidades en tiempo real, ejecutando solo cuando la señal es favorable y evitando pérdidas por operaciones innecesarias.
- Optimización de estrategias de liquidez: dado que el modelo aprende a saltar el 50,4% de las oportunidades, puede usarse para filtrar operaciones de alto riesgo en protocolos de finanzas descentralizadas.
- Backtesting y simulación: su tamaño reducido (384K parámetros) permite ejecutar simulaciones rápidas de estrategias de arbitraje sobre datos históricos de mercado.
- Investigación académica en RL aplicado a finanzas: sirve como caso de estudio para la aplicación de PPO en entornos financieros con observaciones de alta dimensión.
- Integración en pipelines de trading cuantitativo: puede conectarse a plataformas como Hummingbot o CCXT para ejecutar órdenes en exchanges descentralizados (DEX).
- Monitorización de estrategias: el modelo puede usarse en dashboards interactivos (como el Space de HuggingFace) para visualizar curvas de capital y distribución de recompensas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación independiente (mejor modelo a ~350K pasos):

| Metrica | Valor |
|---|---|
| Skip Rate (oportunidades saltadas) | 50,4% |
| Exec Good (ejecuciones rentables) | 43,9% |
| Exec No-Opp (ejecuciones desperdiciadas) | 5,7% |
| Estrategias activas | 10,5 |
| PnL medio | 457,6 ETH |

No se han publicado comparativas con otros modelos de arbitraje RL en la información disponible.

## Requisitos de hardware

- El modelo tiene solo 384K parámetros, por lo que la inferencia es extremadamente ligera.
- No se especifica VRAM, pero es viable en CPU (ej. un núcleo moderno) con latencia de microsegundos por decisión.
- No requiere GPU dedicada para inferencia; puede ejecutarse en cualquier máquina con Python y Stable Baselines3.
- Para el entrenamiento (500K pasos en 88 minutos), se necesitó una GPU (probablemente una RTX 3060 o superior), aunque no se detalla.
- Opciones de despliegue: integración directa en Python con Stable Baselines3; no compatible con vLLM, llama.cpp, Ollama o TGI (no es un LLM).

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible (no hay alternativas de arbitraje RL en el repositorio). Se recomienda evaluar contra otros agentes de trading basados en RL como los propuestos en la literatura académica, pero no se dispone de datos.

## Limitaciones y advertencias

- El modelo no ha sido validado en condiciones de mercado extremas (caídas bruscas, iliquidez, alta volatilidad) ni en periodos de estrés financiero.
- Los resultados de evaluación son de una única ejecución y no incluyen intervalos de confianza ni pruebas de robustez.
- La licencia no está especificada; se recomienda contactar al autor antes de uso comercial.
- El modelo solo toma decisiones binarias; no gestiona dimensiones como tamaño de posición, ejecución óptima o gestión de riesgo.
- La información de entrenamiento (datos de mercado, periodo, exchanges) no está disponible, lo que limita la reproducibilidad.
- Riesgo financiero: cualquier uso en producción implica riesgo de pérdida de capital; no es un consejo de inversión.
- La arquitectura no es un modelo de lenguaje, por lo que no puede interpretar instrucciones en lenguaje natural ni generar texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Owiinoo/flashmind-arb-v15d
- Space de visualización: https://huggingface.co/spaces/Owiinoo/flashmind-defi-arb
- Perfil del autor: https://huggingface.co/Owiinoo
