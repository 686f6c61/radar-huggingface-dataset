# fall2026-cs8803-drl/hw4-f26-sb3-ppo-hopper

## Resumen

`hw4-f26-sb3-ppo-hopper` no es un modelo de lenguaje, sino una política de control continuo entrenada con PPO (Proximal Policy Optimization) mediante Stable-Baselines3 2.9.0 sobre el entorno `Hopper-v5` de MuJoCo 3.16.0 (Gymnasium). La publica la organización `fall2026-cs8803-drl` como material de referencia del curso CS 8803 Deep Reinforcement Learning (Fall 2026) del Georgia Institute of Technology, para que el alumnado del HW4 (sección 1, PPO para control continuo) compare su propia implementación contra una ejecución de referencia conocida.

Se entrenaron tres semillas (0, 1 y 2) durante 1.000.000 de pasos cada una, con normalización de observaciones y recompensas (`VecNormalize`) y unos hiperparámetros fijados para coincidir con el harness del enunciado. El repositorio publica únicamente la política de la semilla 1 (la de mejor retorno medio, 3564,7 ± 14,9) junto con sus estadísticas de normalización congeladas, el JSON de evaluación por semilla y las curvas de entrenamiento de las tres semillas.

Su relevancia es puramente docente y metodológica: sirve como baseline reproducible y como ejemplo de la varianza entre semillas típica de PPO en Hopper (de 1343,4 a 3564,7 de retorno medio según la semilla). No es un artefacto pensado para despliegue en producción ni para tareas distintas del entorno para el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política actor-critic de PPO con perceptrón multicapa (MLP) de 64-64 unidades y activación tanh; separate actor y value head, más parámetro `log_std` de acciones |
| Parámetros totales | No disponible (no se publica recuento; la topología declarada es 64-64 tanh) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de RL; la entrada es el vector de observación de `Hopper-v5`, no una secuencia de texto) |
| Tipos de cuantización | No disponible / no aplica (pesos en coma flotante de PyTorch empaquetados por Stable-Baselines3) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.zip` (state dict de PyTorch empaquetado por SB3) + `vecnormalize.pkl` (pickle con estadísticas de normalización de observaciones y recompensas) |

## Arquitectura y entrenamiento

La política es un actor-critic PPO estándar de Stable-Baselines3 con extractor MLP de dos capas de 64 unidades y `tanh`, cabeza gaussiana diagonal para las acciones continuas (media aprendida y `log_std` inicializado a 0) y cabeza de valor separada. El entrenamiento usa `VecNormalize` sobre observaciones y recompensas, con estadísticas que se publican congeladas en `vecnormalize.pkl` y que deben cargarse junto al modelo para reproducir la evaluación.

Configuración exacta declarada en la model card: 8 entornos paralelos × 256 pasos por actualización, 10 épocas de optimización por batch, minibatch de 64, learning rate 3e-4 con decaimiento lineal hasta 0, factor de descuento γ = 0,99, GAE con λ = 0,95, clipping de política 0,2, clipping de valor 0,2, coeficiente de entropía 0, coeficiente de valor 0,5, clipping de norma de gradiente 0,5. Entorno `gymnasium Hopper-v5` con MuJoCo 3.16.0, 1.000.000 de pasos por semilla y semillas 0, 1 y 2. No se declara uso de RLHF, DPO ni técnicas de optimización adicionales; el algoritmo es PPO on-policy puro con la mencionada normalización de retornos.

## Capacidades

- Control continuo del robot bípedo simulado `Hopper-v5`: genera acciones de 6 dimensiones (3 articulaciones del torso y 3 de la pierna) a partir de observaciones vectoriales del estado.
- Locomoción aprendida por refuerzo: la política publicada alcanza un retorno medio de 3564,7 ± 14,9 en 10 episodios deterministas con estadísticas de normalización congeladas.
- Reproducibilidad como baseline: cargable mediante `hw4_lib.references.load_reference("sb3_hopper")`, con la revisión del repositorio ya fijada en el código de partida del curso.
- Evaluación determinista: la model card especifica 10 episodios deterministas por semilla, lo que permite comparaciones controladas.
- Trazabilidad del entrenamiento: se publican las curvas de las tres semillas (`curves_seed0.csv` a `curves_seed2.csv`) con `global_step` y `episodic_return`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Comparación de implementaciones propias de PPO: el alumnado del HW4 puede ejecutar su política y contrastar el retorno con el rango publicado (1343,4-3564,7) en lugar de con un único número, lo que evita conclusiones erróneas por varianza entre semillas.
- Pruebas de regresión del harness de evaluación: al publicarse `vecnormalize.pkl` con estadísticas congeladas, sirve para verificar que el pipeline de evaluación (normalización, número de episodios, determinismo) está bien implementado antes de evaluar políticas propias.
- Estudio de sensibilidad a la semilla: las tres curvas CSV permiten analizar la dispersión de retorno y la estabilidad del aprendizaje de PPO en un entorno con recompensa densa pero frágil.
- Smoke test de integraciones con Stable-Baselines3: al ser un artefacto pequeño y con versión de librería declarada (SB3 2.9.0, Gymnasium, MuJoCo 3.16.0), se puede usar para comprobar que un entorno de ejecución carga políticas y estadísticas de normalización correctamente.
- Punto de partida para experimentos de continuación: cargar `model.zip` y seguir entrenando con currículos o variaciones de recompensa para estudiar estabilidad y olvido catastrófico.
- Material docente: ejemplo mínimo y verificable de entrenamiento PPO con `VecNormalize` en control continuo, útil en clases y talleres de RL.
- Baseline en artículos o informes internos: referencia de retorno para comparar algoritmos alternativos (SAC, TD3, MBPO) sobre `Hopper-v5`, siempre reportando la semilla y el número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de NLP en la información disponible. Los únicos datos de rendimiento son las evaluaciones del entorno `Hopper-v5` (10 episodios deterministas por semilla, con estadísticas de normalización congeladas):

| Semilla | Retorno medio | Desviación típica | Estado |
|---|---|---|---|
| 0 | 1343,4 | 85,3 | No publicada como política |
| 1 | 3564,7 | 14,9 | Política publicada (`model.zip`) |
| 2 | 2727,8 | 532,3 | No publicada como política |

Agregados derivados de la tabla anterior (media aritmética de las tres semillas: 2545,3; mínimo: 1343,4; máximo: 3564,7). `eval.json` contiene estos mismos datos junto con la semilla publicada. La propia model card advierte que la dispersión entre semillas es típica de PPO en Hopper y que las comparaciones deben hacerse contra el rango completo, no contra un único valor.

## Requisitos de hardware

- Inferencia en CPU: al tratarse de una MLP de 64-64 unidades, la evaluación de un paso es del orden de microsegundos en CPU; no requiere GPU. No se publican medidas formales de latencia ni de throughput.
- GPU: no necesaria para inferencia; opcional para entrenamiento (SB3 soporta CUDA y MPS). Una RTX 4090, A100 o H100 no aportan ventaja significativa en inferencia porque el cuello de botella es el simulador MuJoCo y el bucle de Python, no el cálculo de la red.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el requisito real es disponer de MuJoCo 3.16.0 y Gymnasium con `Hopper-v5`.
- Despliegue: carga mediante Stable-Baselines3 (`PPO.load("model.zip")`) junto con `VecNormalize.load("vecnormalize.pkl")`, usando este último también en evaluación. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Coste de entrenamiento: no disponible en la model card (1.000.000 de pasos por semilla con 8 entornos paralelos; no se declara hardware ni tiempo de pared).
- Dependencias críticas de versión: SB3 2.9.0, MuJoCo 3.16.0 y la versión de Gymnasium usada en el curso; cambios de versión pueden alterar la dinámica del entorno y, por tanto, el retorno.

## Comparativa con modelos similares

| Modelo / referencia | Algoritmo | Entorno | Parámetros | Retorno publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fall2026-cs8803-drl/hw4-f26-sb3-ppo-hopper` (este) | PPO + VecNormalize (SB3 2.9.0) | `Hopper-v5`, 1M pasos × 3 semillas | No disponible (MLP 64-64 tanh) | 1343,4 / 3564,7 / 2727,8 según semilla | MIT | Pesos, `vecnormalize.pkl`, `eval.json` y curvas CSV |
| Implementación propia del HW4 (referencia del curso) | PPO | `Hopper-v5` | No disponible | No disponible (a comparar contra el rango anterior) | No disponible | En el repositorio de partida del curso |
| `sanchit2843/cs8803-DRL` (MBPO con SAC) | MBPO (ensemble de modelos + SAC) | `Hopper-v4` | No disponible | No disponible | No disponible | Repositorio GitHub |
| `Redemption-ZTX/cs8803` (Soccer-Twos) | Multiagente sobre Soccer-Twos | Soccer-Twos | No disponible | No disponible | No disponible | Repositorio GitHub |
| CleanRL / SB3 zoo PPO Hopper | PPO | `Hopper-v4`/`v5` | No disponible | No disponible en la información proporcionada | No disponible | Referencias de la comunidad, no verificadas aquí |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han encontrado retornos publicados de los otros proyectos en la búsqueda realizada, y además operan sobre versiones distintas del entorno (`Hopper-v4` frente a `Hopper-v5`), lo que impide comparaciones directas de retorno.

## Limitaciones y advertencias

- Específico de tarea y de entorno: la política solo es válida para `Hopper-v5` con la misma parametrización de recompensa y observaciones; no se transfiere a otros entornos ni a un robot real sin trabajo adicional de sim-to-real.
- Dependencia obligatoria de `vecnormalize.pkl`: evaluar `model.zip` sin cargar las estadísticas de normalización congeladas produce resultados incorrectos, no comparables con los publicados.
- Varianza alta entre semillas: el rango de retorno va de 1343,4 a 3564,7, y la semilla 2 presenta una desviación típica de 532,3; la política publicada es la mejor de las tres, lo que introduce un sesgo de selección si se cita como rendimiento esperado.
- Sin datos de sesgo, robustez ni análisis de fallos: la model card no documenta modos de fallo, sensibilidad a perturbaciones ni comportamiento fuera de distribución.
- Riesgo de explotación de la recompensa (*reward hacking*): al ser una política entrenada con la recompensa de Hopper, puede adoptar comportamientos que maximizan retorno sin corresponder a una locomoción realista; no debe interpretarse como control válido físicamente.
- Sin garantías de reproducibilidad exacta: el retorno depende de MuJoCo 3.16.0, la versión de Gymnasium, el estado del RNG y la versión de SB3; pequeñas diferencias de versión pueden alterar los resultados.
- Licencia MIT: permite uso comercial y modificación, pero el artefacto no tiene aplicación comercial directa fuera de docencia, investigación o pruebas de infraestructura.
- Ausencia de mantenimiento y adopción: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB y actualizado el mismo día de su creación; no hay garantía de soporte, issues atendidos ni revisiones futuras.
- No es un modelo de lenguaje: cualquier uso esperado de generación de texto, razonamiento, código, tool calling o multimodalidad queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fall2026-cs8803-drl/hw4-f26-sb3-ppo-hopper
- Syllabus CS 8803 DRL (Fall 2025, referencia del curso): https://syllabus.gatech.edu/sites/default/files/2026-04/CS%208803%20DRL%20fall%202025%20syllabus.pdf
- Proyecto MBPO sobre Hopper (GitHub, `sanchit2843/cs8803-DRL`): https://github.com/sanchit2843/cs8803-DRL
- Proyecto Soccer-Twos de CS8803 (GitHub, `Redemption-ZTX/cs8803`): https://github.com/Redemption-ZTX/cs8803
- Página de curso CS 8803 Mobile Computing and IoT (no relacionada con este modelo, aparece en la búsqueda): https://faculty.cc.gatech.edu/~adhekne3/cs8803/course.html
- Página de curso CS 6390 / CS 8803 Program semantics and LLMs (no relacionada con este modelo, aparece en la búsqueda): https://faculty.cc.gatech.edu/~qzhang414/course/cs6390/index.html
