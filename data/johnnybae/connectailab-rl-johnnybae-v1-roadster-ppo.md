# Johnnybae/connectailab-rl-johnnybae-v1-roadster-ppo

## Resumen

`connectailab-rl-johnnybae-v1-roadster-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para control continuo. No es un modelo de lenguaje: es una política neuronal que controla un vehículo tipo roadster que cae invertido y debe aterrizar sobre sus ruedas accionando dos propulsores. El entorno es un simulador propio del autor (`로드스터_시뮬레이터.py`, clase `로드스터연속`) compatible con la API de Gymnasium.

El modelo se publica como parte del curso de IA de refuerzo "AI CITY BUILDERS", lección 6, de CONNECT AI LAB. Su interés es didáctico y de referencia: muestra un pipeline completo de PPO con observaciones de 7 dimensiones, acciones continuas de 2 dimensiones y un resultado declarado de 94 % de aterrizaje en 50 episodios no vistos durante el entrenamiento.

La ficha es deliberadamente escasa en metadatos: el repositorio tiene 0 GB, no declara licencia ni idiomas, y no incluye arquitectura de red, formato de pesos ni benchmarks más allá de la tasa de éxito reportada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO (capas no especificadas en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: pytorch; tamaño del repo 0.0 GB) |

Parámetros del entorno y del entrenamiento declarados por el autor:

| Parametro | Valor |
|---|---|
| Entorno | `로드스터연속` (Gymnasium), simulador `로드스터_시뮬레이터.py` |
| Dimensión de observación | 7 (posición x, y; velocidad x, y; inclinación sin, cos; velocidad angular) |
| Dimensión de acción | 2 continuas: intensidad del propulsor inferior en [0, 1], giro en [-1, 1] |
| Algoritmo | PPO |
| Pasos de entrenamiento | 1.000.000 |
| Entornos paralelos | 8 |
| Clip | 0.2 |
| Gamma | 0.99 |
| GAE lambda | 0.95 |
| Learning rate | 0.0003 |
| Tasa de éxito reportada | 94 % en 50 episodios no vistos |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, unidades ocultas, función de activación ni si hay compartición de tronco entre política y función de valor). Lo que sí se especifica es el esquema de entrenamiento: PPO con 8 entornos vectorizados en paralelo, 1.000.000 de pasos totales, factor de descuento 0.99, GAE con lambda 0.95, recorte de ratio 0.2 y tasa de aprendizaje 3e-4. Son hiperparámetros estándar de PPO para control continuo, sin innovaciones declaradas (no se mencionan recompensas conformadas, curriculo, decodificación especulativa ni atención lineal, que no aplican aquí).

El entorno es un simulador físico propio en el que el roadster aparece invertido y cae; el agente debe usar la intensidad del propulsor inferior y el par de giro para orientar el vehículo y aterrizar sobre las ruedas. La observación de 7 dimensiones es compacta y totalmente observable, lo que hace el problema tratable con PPO tabular-like. No se documentan la función de recompensa, el criterio exacto de éxito ni la distribución de estados iniciales, datos necesarios para reproducir el resultado del 94 %.

## Capacidades

- Control continuo de dos actuadores (empuje vertical y giro) a partir de un vector de estado de 7 dimensiones.
- Estabilización y reorientación de un cuerpo rígido en caída libre dentro del simulador del autor.
- Política entrenada exclusivamente para la tarea de aterrizaje del roadster; no generaliza a otras tareas ni entornos.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No es un modelo generativo de texto: no produce lenguaje natural.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo ejecutable de un pipeline PPO completo (entorno Gymnasium, entrenamiento vectorizado, evaluación) para un curso introductorio.
- Referencia de control continuo: útil para comparar hiperparámetros de PPO en un problema de baja dimensionalidad antes de escalar a tareas más complejas.
- Prueba de integración de Gymnasium: permite validar que un bucle de entrenamiento o de evaluación propio funciona con un entorno y una política externos.
- Baseline en experimentos de simulación física: punto de partida para medir mejoras con recompensas conformadas o con algoritmos alternativos (SAC, TD3) en el mismo simulador.
- Demostración de evaluación con episodios no vistos: el 94 % sobre 50 episodios sirve para ilustrar la diferencia entre rendimiento en entrenamiento y en evaluación.
- Prototipado de control para cuerpos rígidos: la observación de 7 dimensiones y la acción de 2 dimensiones son un caso mínimo para probar técnicas de estabilización antes de trasladarlas a drones o robots.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de aterrizaje | 94 % | 50 episodios no vistos, según la model card |
| Pasos de entrenamiento | 1.000.000 | PPO, 8 entornos paralelos |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo. Tampoco se reportan curvas de aprendizaje, recompensa media, varianza entre semillas ni latencia de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es 0.0 GB y no se documenta el número de parámetros de la red.
- GPU recomendadas: no disponible. Por la naturaleza del modelo (política de control de baja dimensionalidad), es probable que quepa en cualquier GPU consumer, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada por el autor.
- Opciones de despliegue: no documentadas. Al estar etiquetado como `pytorch`, requeriría cargar los pesos con PyTorch y ejecutar la política en un bucle de inferencia propio; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes PPO comparables ni referencias a políticas de control continuo alternativas con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada en un simulador concreto, puede explotar particularidades del mismo.
- Riesgo de alucinación: no aplica (no genera texto), pero sí existe riesgo de sobreajuste al simulador y de fallo fuera de la distribución de estados de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje ni tiene ventana de contexto.
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Caveats para producción: el repositorio tiene 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el artefacto está incompleto; verificar antes de descargar. No se documentan la arquitectura de red, el formato de pesos ni la función de recompensa, lo que impide reproducir el resultado del 94 %. El simulador (`로드스터_시뮬레이터.py`) no se incluye en la información disponible y es necesario para ejecutar la política. No hay garantías de robustez ante cambios en el entorno físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Johnnybae/connectailab-rl-johnnybae-v1-roadster-ppo
- Curso "AI CITY BUILDERS" de CONNECT AI LAB: no disponible (no se proporciona URL)
- Simulador `로드스터_시뮬레이터.py`: no disponible (no se proporciona URL)
- Paper de PPO: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible
