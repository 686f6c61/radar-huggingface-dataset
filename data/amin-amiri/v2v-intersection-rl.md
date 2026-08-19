# amin-amiri/v2v-intersection-rl

## Resumen

El modelo `v2v-intersection-rl` es un agente de aprendizaje por refuerzo multi-agente desarrollado por Amin Amiri para la negociación cooperativa del derecho de paso en intersecciones sin señalizar. El experimento central consiste en entrenar una política de parámetros compartidos (IPPO, PPO con pesos idénticos para todos los vehículos) bajo dos canales de información: sensores embarcados únicamente (con visibilidad limitada a unos 14 metros) y comunicación vehículo-a-vehículo (V2V) mediante un broadcast con pérdida de paquetes de hasta 70 metros. El objetivo es cuantificar el valor real de un enlace de radio frente a una línea de visión ocluida, manteniendo idénticos arquitectura, recompensa, dinámica y presupuesto de entrenamiento.

El modelo resuelve un problema de control longitudinal en un cruce de cuatro direcciones con seis vehículos, donde cada agente decide cuándo ceder el paso o reclamar el hueco. Una colisión termina el episodio. La relevancia actual radica en que proporciona una medición rigurosa del beneficio de la comunicación V2V en escenarios de conducción autónoma cooperativa, con resultados que muestran una reducción del 79% en la tasa de colisiones frente a la línea base sin radio. La arquitectura exacta de la red neuronal no está documentada, y el repositorio no contiene pesos publicados (tamaño 0.0 GB), por lo que se trata principalmente de un artefacto de investigación con código y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (arquitectura no especificada en la documentacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio sin pesos publicados, solo codigo y configuracion) |

## Arquitectura y entrenamiento

El modelo utiliza una política de parámetros compartidos entrenada con IPPO (Independent PPO), donde cada vehículo ejecuta la misma red neuronal con pesos idénticos. La arquitectura interna no se detalla en la documentación, pero al tratarse de un problema de control longitudinal con observaciones de distancia, velocidad y tokens de arbitraje, es probablemente un perceptrón multicapa (MLP) de pequeña escala. El entrenamiento se realizó con 3 semillas por condición, 12,9 millones de pasos de entorno por semilla, y evaluación codiciosa sobre 400 episodios retenidos de un flujo de escenarios fijo con un 10% de pérdida de paquetes.

La innovación técnica principal es el diseño experimental: se mantienen idénticos la arquitectura, la recompensa, la dinámica y el presupuesto de entrenamiento, variando únicamente el canal de información. El canal V2V incluye un token de arbitraje (similar a un ID de estación en mensajes V2X reales) que se transmite por el broadcast. El análisis posterior de la política entrenada revela que el token es mayoritariamente ignorado (cambia la acción solo en el 1,2% de los estados), mientras que el tiempo hasta el conflicto del vehículo que cruza domina la decisión de frenar. Esto indica que el mecanismo efectivo de resolución de conflictos es la cesión basada en tiempo hasta el conflicto, no la arbitración por token, y que la ventaja del V2V proviene de ver antes al vehículo que cruza (70 metros de radio frente a unos 14 metros de línea de visión ocluida).

## Capacidades

- Negociación cooperativa del derecho de paso en intersecciones sin señalizar con control longitudinal únicamente.
- Manejo de comunicación V2V con pérdida de paquetes variable (entrenado al 10%, probado hasta el 90%).
- Transferencia a flotas de tamaño no visto durante el entrenamiento (probado con 4, 6, 8 y 10 vehículos sin reentrenamiento).
- Robustez frente a condiciones de pérdida de paquetes superiores a las de entrenamiento: mantiene una ventaja significativa hasta el 35% de pérdida.
- Decisión de ceder o reclamar el hueco basada en el tiempo hasta el conflicto del vehículo que se aproxima.
- No es un modelo de lenguaje: no genera texto, código ni responde a prompts. Sus capacidades se limitan al control de vehículos en el entorno simulado.

## Casos de uso

- Investigación en conducción autónoma cooperativa: el modelo sirve como referencia para estudiar el impacto de la comunicación V2V en la seguridad de intersecciones sin señalizar, permitiendo aislar el efecto del canal de radio frente a sensores embarcados.
- Evaluación de protocolos V2X: al probar la política bajo diferentes tasas de pérdida de paquetes (0% a 90%), se puede cuantificar la degradación del rendimiento y establecer requisitos mínimos de fiabilidad de la comunicación para aplicaciones de seguridad.
- Simulación de tráfico con agentes cooperativos: el modelo puede integrarse en simuladores de tráfico para generar comportamientos realistas de vehículos conectados en cruces, mejorando la fidelidad de los estudios de capacidad y flujo.
- Entrenamiento de políticas de arbitraje: aunque el token de arbitraje resultó poco utilizado, el marco experimental permite probar otros mecanismos de desempate (prioridades, tiempos de espera) y medir su efectividad.
- Pruebas de robustez ante fallos de comunicación: el modelo puede emplearse para diseñar estrategias de respaldo cuando la comunicación V2V se degrada, analizando el punto de ruptura donde el rendimiento cae al nivel de la línea base sin radio.
- Benchmark para algoritmos de RL multi-agente: el escenario de intersección con parámetros compartidos y dos canales de información constituye un banco de pruebas reproducible para comparar variantes de PPO, otros algoritmos de RL o métodos basados en modelos.

## Benchmarks y rendimiento

Los resultados oficiales declarados en el model-index para la tarea "Cooperative unsignalized-intersection negotiation" son:

| Metrica | Valor (V2V) |
|---|---|
| Collision rate | 0,0467 |
| Vehicles cleared per episode | 5,7875 |

La model card amplía estos datos con la comparación entre condiciones (3 semillas por condición, evaluación codiciosa sobre 400 episodios retenidos con 10% de pérdida de paquetes):

| Metrica | Onboard only | V2V | Cambio |
|---|---|---|---|
| Collision rate | 0,227 ± 0,096 | 0,047 ± 0,017 | 79% menos |
| Vehicles cleared / episodio (de 6) | 5,07 ± 0,47 | 5,79 ± 0,09 | +14% |
| Velocidad media (m/s) | 4,30 | 5,91 | - |
| Longitud de episodio (pasos) | 75,1 | 54,9 | - |

Re-medición en 5 flujos de escenarios independientes (promediando las 3 semillas de entrenamiento):

| | Collision rate entre flujos | Dispersión |
|---|---|---|
| Onboard only | 0,237 ± 0,014 | 0,038 |
| V2V | 0,046 ± 0,004 | 0,013 |

Degradación bajo pérdida de paquetes (política V2V entrenada al 10% y probada en el rango):

| Perdida de paquetes | Collision rate | Vehiculos despejados / episodio |
|---|---|---|
| 0% | 0,031 | 5,85 |
| 10% | 0,041 | 5,81 |
| 20% | 0,060 | 5,73 |
| 35% | 0,115 | 5,52 |
| 50% | 0,207 | 5,19 |
| 70% | 0,377 | 4,51 |
| 90% | 0,591 | 3,58 |

Transferencia a flotas de tamaño no entrenado (sin reentrenamiento):

| Vehiculos | Collision (onboard) | Collision (V2V) | Despejados (onboard) | Despejados (V2V) |
|---|---|---|---|---|
| 4 | 0,111 | 0,001 | 3,65 | 4,00 |
| 6 | 0,252 | 0,041 | 4,96 | 5,81 |
| 8 | 0,397 | 0,099 | 5,81 | 7,39 |
| 10 | 0,597 | 0,423 | 5,65 | 6,67 |

## Requisitos de hardware

- No se dispone de información sobre requisitos de hardware específicos en la documentación del modelo.
- Dado que se trata de una red neuronal de política de pequeña escala (control longitudinal con observaciones de baja dimensión), es probable que la inferencia pueda ejecutarse en CPU sin problemas, pero no hay datos confirmados.
- El repositorio no incluye pesos publicados, por lo que no se puede desplegar directamente como un artefacto de inferencia; el código de entrenamiento y evaluación es lo que se distribuye.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para reproducir el entrenamiento se necesitaría un entorno de simulación (no especificado) y posiblemente una GPU para acelerar el RL, aunque el coste computacional no está documentado.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada. El modelo se enmarca en la investigación de RL multi-agente para intersecciones, pero no se citan alternativas específicas con las que se haya comparado. Existe el trabajo V2V-LLM (arXiv:2502.09980) que aborda la conducción cooperativa con un LLM multimodal, pero su enfoque y arquitectura son completamente distintos (fusión de percepción multimodal y generación de respuestas, frente a control longitudinal puro). Tampoco se dispone de datos de otros modelos de RL para intersecciones que permitan una comparación cuantitativa. Por tanto, la comparativa se limita a la línea base "onboard only" del propio experimento, que ya se ha presentado en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo solo controla longitudinalmente sobre trayectorias fijas: no hay dirección, giros ni cambios de carril. Esto limita su aplicabilidad a escenarios reales de conducción.
- Utiliza un modelo cinemático de punto-masa, no un modelo de dinámica vehicular, por lo que no captura efectos de inercia, fricción o estabilidad.
- La política V2V depende de la comunicación por radio; con pérdidas superiores al 50% su rendimiento se degrada hasta acercarse al de la línea base sin radio, lo que debe tenerse en cuenta en entornos con comunicaciones poco fiables.
- El token de arbitraje diseñado para resolver empates simétricos fue en gran medida ignorado por la política (cambia la acción solo en el 1,2% de los estados). Esto sugiere que el mecanismo de cesión por tiempo hasta el conflicto es suficiente en el espacio de estados continuo, pero podría no generalizar a escenarios con simetrías exactas.
- La variabilidad entre semillas es notable en la condición onboard only (colisión 0,227 ± 0,096), lo que indica sensibilidad a la inicialización aleatoria cuando falta información temprana.
- No se han publicado pesos del modelo; el repositorio contiene código y resultados, pero no un artefacto de inferencia listo para usar.
- La licencia MIT permite uso comercial sin restricciones, pero al no haber pesos distribuidos, el uso práctico requiere reentrenar o implementar la política desde el código.
- No se documentan sesgos específicos más allá de los inherentes al entorno simulado (escenarios fijos, sin variabilidad de condiciones meteorológicas o de iluminación).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amin-amiri/v2v-intersection-rl
- Demo interactiva: https://huggingface.co/spaces/amin-amiri/v2v-cooperative-intersection-rl
- GitHub del autor: https://github.com/amiri-amin
- LinkedIn del autor: https://www.linkedin.com/in/amin-amiri-66aa10306
- Paper relacionado (V2V-LLM, no del mismo autor): https://arxiv.org/abs/2502.09980
- Articulo sobre RL para navegacion en intersecciones (referencia contextual): https://arxiv.org/html/2310.08595
