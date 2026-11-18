# AshishChaturvedi7/cartpole-control-ai

## Resumen

`cartpole-control-ai` es un repositorio de referencia que compara tres estrategias de control sobre una misma planta no lineal de carro-péndulo: un controlador PID, un regulador LQR y una política de aprendizaje por refuerzo (PPO) entrenada desde cero con Stable-Baselines3. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de investigación educativa que empaqueta la política PPO entrenada junto con el código de simulación y control, de modo que el experimento pueda reproducirse sin reentrenar.

El interés técnico reside en la comparación controlada: los tres controladores actúan sobre las mismas ecuaciones de movimiento, integradas con Runge-Kutta de cuarto orden, y se evalúan bajo perturbaciones idénticas (inclinación inicial de 8,6° más un empujón de velocidad angular en t=3 s). Esto permite contrastar un controlador clásico con sintonización manual, un óptimo en forma cerrada y una política neuronal aprendida por recompensa.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,0 GB y está publicado bajo licencia MIT. Su valor es didáctico y reproducible, no el de un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal (MLP) entrenada con PPO sobre entorno Gymnasium; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: vector de estado de 4 dimensiones `[x, ẋ, θ, θ̇]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.zip` de Stable-Baselines3 (`rl/ppo_cartpole.zip`) más estadísticas de normalización `rl/vecnormalize.pkl` |

## Arquitectura y entrenamiento

La planta es un carro de masa M sobre un raíl sin fricción con un péndulo rígido de masa m y semilongitud l que pivota libremente; la única entrada de control es una fuerza horizontal F. El estado es `[x, ẋ, θ, θ̇]` con θ = 0 en el equilibrio vertical, y la dinámica se integra con Runge-Kutta de cuarto orden (`sim/dynamics.py`) para mantener precisión en oscilaciones grandes.

La política PPO se entrenó en un entorno Gymnasium que envuelve exactamente la misma dinámica RK4, con recompensa `-(θ² + 0.1x² + 0.001F²)`, deliberadamente próxima al coste del LQR. El autor documenta dos decisiones necesarias para obtener una política robusta ante perturbaciones reales: normalización de observaciones con `VecNormalize` (ángulo y posición tienen escalas numéricas muy distintas, lo que degrada el gradiente de un MLP sin normalizar) y una penalización grande en el paso que termina el episodio por caída. El entrenamiento se completa en unos minutos en CPU. El LQR se obtiene linealizando numéricamente alrededor del equilibrio vertical y resolviendo la ecuación de Riccati continua para K = R⁻¹BᵀP.

## Capacidades

- Control de equilibrio de un péndulo invertido sobre carro a partir del estado completo normalizado.
- Rechazo de perturbaciones: recuperación tras inclinación inicial de 8,6° y empujón de velocidad angular en t=3 s sin caída.
- Contención espacial del carro: mantiene la posición dentro de 1,23 m de máximo, comportamiento emergente no especificado en la recompensa.
- Reutilización sin reentrenamiento: la política se carga desde el Hub y se aplica directamente si se respetan las estadísticas de normalización.
- Reproducibilidad del experimento completo: scripts de entrenamiento (`rl/train.py`) y de comparación (`compare.py`) incluidos.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia de teoría de control: comparar en una misma planta PID, LQR y RL permite ilustrar en clase las diferencias entre sintonización manual, óptimo en forma cerrada y política aprendida, con métricas y gráficas ya generadas.
- Benchmark de referencia para RL aplicado a control: sirve como línea base mínima para validar pipelines de Stable-Baselines3, entornos Gymnasium y normalización de observaciones antes de escalar a plantas más complejas.
- Estudio de ingeniería de recompensas: el repositorio documenta explícitamente el efecto de la penalización terminal y de `VecNormalize`, lo que lo convierte en un caso de análisis de cómo el diseño de recompensa condiciona la robustez de la política.
- Prueba de integración de `huggingface_hub` con Stable-Baselines3: el snippet de carga con `hf_hub_download` y `PPO.load` sirve para validar flujos de distribución de políticas RL en el Hub.
- Prototipado de controladores híbridos: la política PPO puede usarse como componente de un esquema que combine LQR para la contención del carro y RL para la amortiguación angular, dado que el RL iguala la contención espacial del LQR pero amortigua unas tres veces más lento.
- Material de divulgación técnica: los GIFs y la gráfica comparativa (`results/comparison_plot.png`) permiten ilustrar artículos o charlas sobre control clásico frente a aprendizaje por refuerzo sin necesidad de infraestructura.

## Benchmarks y rendimiento

Resultados tras inclinación inicial de 8,6° y empujón de velocidad angular en t=3 s, según la model card:

| Controlador | Máx. \|ángulo\| | Máx. \|posición carro\| | Tiempo de establecimiento tras empujón | Fuerza RMS | Caída |
|---|---|---|---|---|---|
| PID | 8,59° | 9,67 m | 0,36 s | 2,20 N | No |
| LQR | 12,75° | 1,03 m | 1,50 s | 2,36 N | No |
| RL (PPO) | 8,72° | 1,23 m | 5,00 s | 2,34 N | No |

El PID amortigua el ángulo más rápido pero no controla la posición del carro, que deriva 9,67 m. El LQR contiene el carro porque su coste penaliza explícitamente la posición. La política PPO iguala la contención espacial del LQR sin que se le haya especificado, pero amortigua aproximadamente tres veces más lento. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: la política es un MLP pequeño y el entrenamiento completo se ejecuta en unos minutos en CPU, según el autor.
- VRAM estimada: no disponible; no requiere GPU para inferencia.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria para este artefacto.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`) con `huggingface_hub` para descarga; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles de forma numérica; la simulación completa con los tres controladores se ejecuta con `python compare.py`.

## Comparativa con modelos similares

| Modelo | Tipo | Planta | Controladores comparados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cartpole-control-ai (este) | Política PPO + código de simulación | Carro-péndulo con dinámica RK4 | PID, LQR, PPO | MIT | Hugging Face + GitHub |
| Políticas PPO de CartPole-v1 en SB3 Zoo | Política PPO de referencia | CartPole estándar de Gymnasium | Solo RL | MIT | Repositorio de SB3 |
| Controladores LQR de literatura clásica | Implementaciones analíticas | Carro-péndulo linealizado | LQR | Variable | No centralizada |

No se dispone de datos de benchmarks comparables entre estas alternativas en la información proporcionada; la comparación interna PID/LQR/PPO de la tabla anterior es la única disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: resuelve una única planta de carro-péndulo con parámetros fijos; no generaliza a otras dinámicas sin reentrenamiento o reajuste.
- Dependencia estricta de la normalización: la política requiere las estadísticas exactas de `rl/vecnormalize.pkl`; sin ellas las observaciones quedan fuera de distribución y el comportamiento no es fiable.
- Amortiguación lenta: el tiempo de establecimiento tras el empujón es de 5,00 s frente a 0,36 s del PID y 1,50 s del LQR, lo que lo hace inadecuado para requisitos de respuesta rápida.
- Sin datos de sesgo ni de alucinación aplicables: no es un modelo generativo; los riesgos propios de LLM no concurren aquí.
- Sin métricas de robustez más allá de una única perturbación documentada; no se reportan evaluaciones sobre variaciones de masa, longitud o fricción.
- Licencia MIT permite uso comercial y modificación, pero el repositorio no incluye garantías ni soporte; el tamaño de 0,0 GB y la ausencia de descargas indican que no ha sido validado por terceros.
- No apto como componente de producción en robótica real sin validación adicional en banco y sin análisis de estabilidad fuera del régimen simulado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AshishChaturvedi7/cartpole-control-ai
- Repositorio con código, write-up y scripts de entrenamiento: https://github.com/ASHTOW2102/cartpole-control-ai
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Gymnasium: https://github.com/Farama-Foundation/Gymnasium
