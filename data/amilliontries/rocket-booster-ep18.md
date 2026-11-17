# amilliontries/rocket-booster-ep18

## Resumen

`rocket-booster-ep18` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) que pilota la primera etapa de un Falcon 9 simulado, desde 70 km de altitud hasta el aterrizaje en una plataforma marina. Lo publica el canal de YouTube *A Million Tries* como artefacto del episodio 18 de su serie, con el objetivo de demostrar que una red neuronal pequeña puede ejecutar una secuencia completa de descenso propulsivo: encendido de entrada con tres motores, caída larga con rejillas aerodinámicas y propulsores de gas frío, y encendido de aterrizaje con un solo motor que no puede hacer hover.

Técnicamente no es un modelo de lenguaje: es un actor-crítico de 40.841 parámetros implementado en JAX, con una política de dos capas ocultas de 128 unidades y activación `tanh`, que mapea un vector de observación de 27 dimensiones a 4 acciones continuas (encendido y acelerador del motor, ángulo del motor, propulsores y rejillas). La relevancia del artefacto está en su proceso de entrenamiento documentado: el autor detectó que una política anterior (Try 25) aterrizaba el 100 % de las veces pero giraba hasta 30 grados respecto al flujo de aire, algo que rompería un cohete real, añadió al simulador un límite de flexión estructural y reentrenó desde cero.

El resultado es una política que aterriza el 98,0 % de 4.000 vuelos de validación con una velocidad de contacto de 1,41 m/s y un error de 5,2 m respecto al centro de la plataforma, manteniéndose dentro de 1,5-7 grados del flujo de aire en atmósfera densa. Es un caso de estudio útil sobre cómo una métrica de éxito mal especificada (aterrizar) puede ocultar un comportamiento físicamente inviable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP actor-crítico (27 → 128 → 128 → 4) con activación `tanh`, entrenado con PPO |
| Parámetros totales | 40.841 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; observación de 27 números por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors, precisión nativa de JAX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `jax`) |
| Frecuencia de decisión | 20 Hz (4 acciones por paso, cada una en rango −1..1) |
| Dimensión de observación | 27 números |
| Dimensión de acción | 4 números |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

La política es una red totalmente conectada de tres capas: entrada de 27 dimensiones, dos capas ocultas de 128 unidades con `tanh` y una cabeza de salida de 4 dimensiones (`pi*`). El checkpoint incluye además una cabeza de valor (`v*`) usada únicamente durante el entrenamiento y el parámetro `log_std`, que define la desviación de exploración de la política gaussiana; en inferencia se debe usar la acción media. Las observaciones combinan variables relativas a la plataforma (deriva, altura, velocidad lateral y de caída, también en escala de raíz cuadrada para mayor resolución cerca de la cubierta, inclinación en seno y coseno, giro, combustible restante, empuje, ángulo y estado del motor, luces, viento, oleaje, ángulo de rejillas) con variables de escala global del descenso (altitud, velocidad de caída, velocidad lateral, alcance, Mach, carga aerodinámica máxima acumulada, calor absorbido y secuencia de arranque del motor).

El entrenamiento usa PPO con recompensa únicamente terminal (aterrizaje, suavidad del contacto o gravedad del impacto) y una "escalera hacia atrás": la política arranca aprendiendo a partir de aterrizajes generados por un controlador escrito a mano y el punto de partida se desplaza progresivamente hacia el inicio real a 70 km. El episodio documenta una iteración clave: la política Try 25 aterrizaba el 100 % de los vuelos pero alcanzaba 30 grados de desviación respecto al flujo de aire y giros de hasta 50 grados por segundo, lo que rompería un cohete real. El autor introdujo en el simulador un límite de flexión (carga aerodinámica multiplicada por el ángulo respecto al flujo, 800 kPa·deg, valor estimado), lo que hizo caer el éxito de Try 25 al 0 %, y reentrenó desde esa política hasta la actual (Try 29, ejecución `rocket-ppo29`, actualización 1400). El motor de aterrizaje modela correctamente la ausencia de hover: su acelerador mínimo sigue generando entre 1,7 y 1,95 veces el peso del propulsor.

## Capacidades

- Control continuo de un vehículo aeroespacial simulado en 4 dimensiones de acción a 20 Hz.
- Secuenciación de fases de vuelo: encendido de entrada con tres motores, caída con guiado aerodinámico y encendido de aterrizaje con un solo motor.
- Gestión de restricciones físicas: empuje mínimo no nulo del motor de aterrizaje, límite de flexión estructural, combustible finito y perturbaciones de viento y oleaje.
- Robustez a condiciones iniciales: validada sobre 4.000 vuelos desde 70 km con semilla 5000, no usados en la selección del modelo.
- Estabilización angular: mantiene 1,5-7 grados respecto al flujo de aire en atmósfera densa y no gira más de 4 grados por segundo.
- No soporta tool calling, agentes, razonamiento multi-paso simbólico, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en control propulsivo: banco de pruebas reproducible para estudiar políticas de aterrizaje vertical con empuje mínimo no nulo, donde el hover es físicamente imposible y la política debe planificar el encendido con antelación.
- Estudio de especificación de recompensas: el caso Try 25 → Try 29 es un ejemplo directo de cómo una recompensa terminal (aterrizó o no) permite soluciones que violan restricciones estructurales, y de cómo añadir una restricción al simulador fuerza el reaprendizaje.
- Simulación y videojuegos: integración como controlador de un cohete en `games/rocket.py` o `games/rocket_jax.py` para generar trayectorias de descenso realistas sin escribir un controlador manual.
- Evaluación de robustez: uso del script `scripts/rocket_eval.py` con semillas nuevas para medir la generalización de una política de RL ante viento, oleaje y condiciones iniciales no vistas.
- Docencia en aprendizaje por refuerzo: ejemplo compacto (40.841 parámetros, JAX, PPO) para explicar actor-crítico, recompensas dispersas y currículo de entrenamiento con escalera hacia atrás.
- Comparación de simuladores: contraste entre el modelo físico en Python (`games/rocket.py`) y su versión acelerada en JAX (`games/rocket_jax.py`) para estudiar el coste y la fidelidad de la vectorización en entornos de control.

## Benchmarks y rendimiento

Resultados medidos sobre 4.000 vuelos desde 70 km con semilla 5000, no usados para seleccionar el modelo:

| Métrica | Valor | Referencia |
|---|---|---|
| Aterrizajes exitosos | 98,0 % | — |
| Velocidad de contacto | 1,41 m/s | límite 3 m/s |
| Error respecto al centro de la cubierta | 5,2 m | — |
| Desgaste de patas (fracción de núcleos de aplastamiento usados) | 14 % | — |
| Fallos | impactos duros a 26 m/s, sin desintegración | — |
| Desviación respecto al flujo de aire en aire denso | 1,5-7 grados | Try 25: hasta 30 grados |
| Velocidad de giro máxima | 4 grados/s | Try 25: hasta 50 grados/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (40.841 parámetros en coma flotante de 32 bits ≈ 163 KB); el consumo real lo determina el simulador, no la red.
- GPU recomendadas: cualquier GPU compatible con JAX; para ejecutar el entorno vectorizado en `games/rocket_jax.py` conviene una GPU con soporte CUDA o ROCm. No se especifican modelos concretos en la información disponible.
- Cabe en cualquier GPU de consumo e incluso en CPU; la red por sí sola no justifica aceleración hardware.
- Opciones de despliegue: JAX con `safetensors`; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política decide a 20 Hz por vuelo simulado; el rendimiento agregado depende del número de entornos paralelos y del simulador.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de aterrizaje de cohetes publicadas con parámetros, contexto y licencia comparables. Como referencia interna de la propia serie, la política Try 25 (predecesora directa, sin límite de flexión en el simulador) lograba 100 % de aterrizajes pero con desviaciones de hasta 30 grados y giros de 50 grados/s, frente al 98,0 % y 1,5-7 grados de esta versión.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento simbólico, código, matemáticas, visión ni audio.
- El límite de flexión estructural de 800 kPa·deg es una estimación del autor, no un valor validado de ingeniería; los resultados dependen de esa elección.
- El modelo solo ha sido validado en el simulador del propio repositorio; no hay evidencia de transferencia a dinámicas de vuelo de mayor fidelidad ni a hardware real.
- El 2 % de fallos restante corresponde a impactos duros a 26 m/s, lo que en un cohete real implicaría daños severos; la tasa de éxito del 98,0 % no es suficiente para uso operativo.
- El desgaste de patas del 14 % en media indica que una fracción de los aterrizajes consume parte de los núcleos de aplastamiento, con implicaciones de mantenimiento.
- No hay información sobre sesgos en el sentido de modelos de lenguaje; el riesgo relevante es el sobreajuste al simulador y a la distribución de condiciones de entrenamiento (semilla 5000 en evaluación, pero mismo generador de escenarios).
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales declaradas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB; conviene verificar la integridad de los pesos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amilliontries/rocket-booster-ep18
- Código (tag `episode-18`): https://github.com/backstab319/a-million-tries/tree/episode-18
- Canal de YouTube: https://www.youtube.com/@amilliontries
- Agente PPO: `agents/ppo_rocket.py` dentro del repositorio
- Entorno de simulación: `games/rocket.py` y `games/rocket_jax.py`
- Script de evaluación: `scripts/rocket_eval.py`
