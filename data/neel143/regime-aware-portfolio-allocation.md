# neel143/regime-aware-portfolio-allocation

## Resumen

`neel143/regime-aware-portfolio-allocation` es un proyecto de aprendizaje por refuerzo profundo aplicado a la asignación dinámica de carteras multi-activo, publicado como artefacto reproducible en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es un agente de control continuo entrenado con Stable-Baselines3 (PPO/SAC) sobre un entorno Gymnasium personalizado (`PortfolioEnv`) que impone la proyección al símplex de probabilidad, costes de transacción proporcionales de 10 puntos básicos, deslizamiento de 2 puntos básicos y modelado de recompensa con CVaR al 95%.

El componente diferencial es la detección no supervisada de regímenes de mercado mediante un modelo oculto de Markov gaussiano (HMM) calibrado sobre volatilidad realizada y retornos en ventana móvil, que infiere regímenes latentes (alcista, lateral, crisis) sin sesgo de anticipación. La política del agente se condiciona en el vector de probabilidad posterior del HMM en tiempo real, de modo que la asignación se adapta a cambios de régimen.

El proyecto se enmarca como tesis de máster en el Indian Institute of Technology Patna (IIT Patna) y se distribuye con licencia MIT. Su relevancia es metodológica y reproducible: ofrece un pipeline completo (`make data`, `make regime`, `make train`, `make evaluate`) con validación cruzada walk-forward frente a referencias institucionales (Equal-Weight 1/N, Markowitz MVO y agentes DRL ciegos al régimen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de control continuo (PPO/SAC) sobre entorno Gymnasium, condicionado por HMM gaussiano de regímenes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas móviles de indicadores; longitud no especificada) |
| Tipos de cuantizacion | no disponible (no aplica a este tipo de artefacto) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto de Stable-Baselines3; formato de checkpoint no especificado en la información) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline desacoplado de dos etapas. Primero, un HMM gaussiano no supervisado se calibra sobre indicadores de volatilidad realizada y retornos en ventana móvil para inferir regímenes latentes de mercado (Bull, Sideways, Crisis Shock) sin look-ahead bias. Segundo, un agente de control continuo de Stable-Baselines3 (PPO o SAC, según configuración del pipeline) recibe como parte de la observación el vector de probabilidad posterior del HMM y emite pesos de cartera.

El entorno `PortfolioEnv` fuerza la pertenencia al símplex de probabilidad mediante proyección Softmax, aplica costes de transacción proporcionales de 10 bps y deslizamiento de 2 bps, y moldea la recompensa con CVaR al 95% para penalizar colas de pérdida. La evaluación se realiza con validación cruzada walk-forward y comparación frente a Equal-Weight (1/N), Markowitz MVO y agentes DRL ciegos al régimen. El universo de activos es el mercado indio: `NIFTYBEES.NS`, `GOLDBEES.NS`, `LIQUIDBEES.NS` y el índice `^NSEI` como referencia. No se especifican en la información el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplica).

## Capacidades

- Asignación dinámica de pesos de cartera sobre un universo multi-activo (renta variable, oro y liquidez) en el mercado indio.
- Detección no supervisada de regímenes de mercado mediante HMM gaussiano sobre volatilidad realizada y retornos.
- Condicionamiento de la política en el vector de probabilidad posterior del régimen en tiempo real.
- Control continuo con restricción al símplex de probabilidad (proyección Softmax).
- Modelado explícito de costes de transacción (10 bps) y deslizamiento (2 bps).
- Optimización con modelado de recompensa basado en CVaR al 95%.
- Evaluación walk-forward con referencias institucionales (1/N, Markowitz MVO, DRL ciego al régimen).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Gestión cuantitativa de carteras multi-activo: el agente ajusta pesos entre renta variable, oro y liquidez en función del régimen detectado, lo que permite reasignar hacia activos refugio en fases de crisis.
- Investigación académica en finanzas cuantitativas: el pipeline reproducible (`make data`, `make regime`, `make train`, `make evaluate`) sirve como base para experimentos con HMM y DRL bajo condiciones no estacionarias.
- Evaluación de estrategias con costes realistas: la inclusión de 10 bps de transacción y 2 bps de deslizamiento permite comparar el impacto de la rotación de cartera en el rendimiento neto.
- Gestión de riesgo de cola: el modelado de recompensa con CVaR al 95% es adecuado para estrategias que priorizan limitar drawdowns extremos frente a maximizar retorno bruto.
- Benchmarking de agentes DRL: la comparación walk-forward contra 1/N, Markowitz MVO y agentes ciegos al régimen permite aislar la contribución de la detección de regímenes.
- Prototipado de sistemas de asignación para mercados emergentes: el universo indio (NIFTYBEES, GOLDBEES, LIQUIDBEES) sirve como plantilla para replicar el enfoque en otros mercados con ETF equivalentes.
- Docencia y formación: el código MIT y la estructura de tesis facilitan su uso como material didáctico en cursos de RL aplicado a finanzas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define métricas objetivo (Sharpe ratio, Sortino ratio, max drawdown, Calmar ratio) y un protocolo de comparación walk-forward frente a 1/N, Markowitz MVO y agentes DRL ciegos al régimen, pero no incluye cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El agente es una red de política de control continuo de Stable-Baselines3; por su naturaleza, la inferencia es ligera y probablemente ejecutable en CPU, aunque no se especifican tamaños de red ni requisitos.
- GPU recomendadas: no disponible. No se detallan requisitos de GPU para entrenamiento ni inferencia.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni descarta.
- Opciones de despliegue: el proyecto se distribuye como repositorio de código (GitHub `sour-d/MS-Thesis`) con pipeline Makefile y dependencias en `requirements.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| regime-aware-portfolio-allocation | Agente DRL + HMM para asignación de cartera | no disponible | no disponible | MIT | Hugging Face + GitHub |
| Equal-Weight (1/N) | Referencia de cartera | no aplica | no aplica | no aplica | Referencia del propio proyecto |
| Markowitz MVO | Optimización media-varianza | no aplica | no aplica | no aplica | Referencia del propio proyecto |
| Agente DRL ciego al régimen | Agente DRL sin HMM | no disponible | no disponible | no disponible | Referencia del propio proyecto |

No se dispone de información sobre otros artefactos públicos directamente comparables en la información proporcionada; las alternativas listadas son las referencias internas del propio estudio.

## Limitaciones y advertencias

- Sesgos conocidos: el universo de activos se limita al mercado indio (NIFTYBEES, GOLDBEES, LIQUIDBEES, ^NSEI), por lo que los resultados pueden no generalizarse a otros mercados o clases de activo.
- Riesgo de sobreajuste: al ser un proyecto de tesis con validación walk-forward, la robustez fuera de la muestra depende de la configuración exacta; no se publican métricas numéricas que permitan verificarlo.
- Dependencia del HMM: la calidad de la detección de regímenes condiciona la política; un HMM mal calibrado o con cambios estructurales no vistos puede degradar la asignación.
- Alucinación: no aplica (no es un modelo generativo de lenguaje).
- Limitaciones de contexto o idioma: no aplica; no es un modelo de lenguaje.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; debe conservarse el aviso de copyright.
- Caveats para producción: no se documentan requisitos de latencia, tolerancia a fallos, mecanismos de ejecución de órdenes ni controles de riesgo operacional; el artefacto es de investigación y no constituye asesoramiento financiero.
- Advertencia financiera: los resultados de backtesting no garantizan rendimiento futuro; el uso en producción requiere validación independiente y supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/neel143/regime-aware-portfolio-allocation
- Repositorio GitHub: https://github.com/sour-d/MS-Thesis
- Cita (BibTeX): Das, Sourav. "Regime-Aware Reinforcement Learning for Dynamic Multi-Asset Portfolio Allocation Under Non-Stationary Market Conditions". Tesis de máster, Indian Institute of Technology Patna, 2025.
