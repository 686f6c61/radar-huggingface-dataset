# lucaskim72/connectailab-rl-lucasbrain-v7-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v7-humanoid-ppo` es una política de control continuo entrenada con PPO (Proximal Policy Optimization) sobre el entorno `Humanoid-v5` de Gymnasium/MuJoCo. No es un modelo de lenguaje ni un transformer generativo, sino una red neuronal de política (actor-crítico) que controla un humanoide simulado de 17 articulaciones a partir de un vector de observación de 348 dimensiones. Lo desarrolla Lucas Kim en el contexto del curso de refuerzo de CONNECT AI LAB × AI CITY BUILDERS (lección 6, PPO).

El modelo resuelve la tarea de locomoción bípeda: mantener el equilibrio y desplazarse hacia delante sin que la altura del torso salga del rango [1.0, 2.0]. La política se entrenó durante 1.000.000 de pasos con una tasa de aprendizaje de 0.0001 (la mitad que la configuración base v1), y según la model card alcanza 869.1 puntos de media en una evaluación de 10 episodios con semillas fijas (9000-9009), con una longitud media de 171.0 pasos y un avance medio de 0.52.

Es relevante como pieza didáctica y reproducible de un currículo de RL: la model card documenta de forma explícita la ablación de hiperparámetros (clip, número de entornos, learning rate, pasos totales, tamaño de capa oculta, bonus de exploración, gamma, normalización de observaciones) y sitúa este checkpoint dentro de una serie (v1, v7, v13, v14, v15) donde cada versión cambia una sola variable respecto a la anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal MLP actor-crítico (dos cabezas) para PPO con política gaussiana; entrada de 348 dimensiones, capa oculta de 256, normalización de observaciones activada |
| Parametros totales | no disponible (no se publica el recuento; con observación 348 y oculta 256 el orden de magnitud es de cientos de miles de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia); horizonte de descuento gamma = 0.99, aproximadamente 100 pasos |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch` como `library_name`); tamano del repo 0.0 GB segun Hugging Face |
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Dimension de observacion | 348 |
| Dimension de accion | 17 articulaciones, cada una en [-0.4, 0.4] |
| Algoritmo | PPO con clip 0.2, GAE lambda 0.95, gamma 0.99 |
| Pasos de entrenamiento | 1.000.000 |
| Entornos en paralelo | 8 (4096 experiencias por actualizacion, 512 pasos por entorno) |
| Tasa de aprendizaje | 0.0001 |
| Epocas por actualizacion | 10 |
| Bonus de exploracion | 0.0 |

## Arquitectura y entrenamiento

La política es una MLP con dos cabezas: una cabeza de actor que parametriza una distribución gaussiana sobre las 17 acciones continuas (media y desviación típica por articulación) y una cabeza de crítico que estima el valor del estado. La observación de 348 dimensiones se normaliza antes de entrar en la red, una decisión que la model card justifica por el salto de 7 a 348 dimensiones respecto al experimento previo con el rover (donde la capa oculta era de 64). El entrenamiento usa PPO on-policy: se recogen 512 pasos por cada uno de los 8 entornos (4096 transiciones), se actualiza la política durante 10 épocas y se descartan las experiencias. El clip de 0.2 limita el cambio de la razón de probabilidades a ±20 % por actualización, y la desviación típica inicial de la gaussiana es de aproximadamente 0.14, coherente con el rango de acción de ±0.4.

La recompensa del entorno combina cuatro términos: supervivencia (+5 por paso), avance (velocidad × 1.25), coste de esfuerzo (suma de cuadrados de las 17 fuerzas × 0.1, restando) y coste de contacto (coeficiente muy pequeno). Un episodio termina si la altura del torso sale de [1.0, 2.0] o al alcanzar 1000 pasos. La serie de experimentos mantiene fijos lambda = 0.95, 10 épocas, 512 pasos por entorno y desviación inicial 0.14, y varía una sola condición por versión para atribuir las diferencias de puntuación a ese cambio. Esta versión (v7) es la base con learning rate reducido a 0.0001; según la model card fue la comparación con mejor puntuación y sirvió de punto de partida para v13 (2M pasos), v14 (4M pasos, mejor checkpoint en 3.7M) y v15 (learning rate 0.00003, mejor media en 10 episodios no vistos).

## Capacidades

- Control motor continuo de un humanoide de 17 articulaciones en MuJoCo: mantener el equilibrio y desplazarse hacia delante.
- Política determinista en evaluación (se usa la media de la gaussiana, sin ruido) y estocástica durante el entrenamiento.
- Gestión implícita de un horizonte de decisión de aproximadamente 100 pasos gracias a gamma = 0.99.
- Aprendizaje on-policy con recolección por lotes y descarte de experiencias (sin buffer de repetición).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.
- Reproducibilidad documentada: semillas de evaluación 9000-9009, hiperparámetros completos y métricas de referencia en la model card.

## Casos de uso

- Docencia de PPO en cursos de refuerzo: sirve como checkpoint de referencia para explicar clip, GAE, normalización de observaciones y el efecto del learning rate, ya que la model card documenta la ablación variable a variable.
- Punto de partida para fine-tuning en `Humanoid-v5`: se puede reanudar el entrenamiento con otro learning rate o más pasos, como hicieron las versiones v13 y v14 de la misma serie.
- Baseline en experimentos de comparación de algoritmos de control continuo (SAC, TD3, A2C) sobre el mismo entorno y las mismas semillas de evaluación.
- Estudio de robustez y reproducibilidad en MuJoCo: las semillas fijas de evaluación permiten medir la varianza entre ejecuciones y detectar sobreajuste a condiciones de entrenamiento.
- Generación de datos de demostración para imitation learning: la política entrenada puede etiquetar trayectorias estado-acción que alimenten un aprendiz supervisado o un modelo de difusión de políticas.
- Simulación de personajes y animación procedural en motores compatibles con MuJoCo: locomoción bípeda con control articular de bajo nivel para prototipos de videojuegos o robótica simulada.
- Prueba de conceptos en robótica: transferencia simulada de una política de locomoción como referencia antes de abordar un robot físico, como el robot Tori que el autor menciona en la model card.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la propia model card, medidos sobre 10 episodios de evaluación con semillas 9000-9009. No hay comparación con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Puntuación media (10 episodios, semillas 9000-9009) | 869.1 |
| Longitud media del episodio | 171.0 pasos |
| Avance medio | 0.5201 |
| Puntuación en el episodio de reproducción (semilla 9000) | 744.2 |
| Pasos en el episodio de reproducción | 141 |
| Avance en el episodio de reproducción | 0.83 |
| Pasos totales de entrenamiento | 1.000.000 |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otras políticas (PPO base, SAC, TD3) sobre `Humanoid-v5`.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. La red es una MLP de 348 entradas y 256 unidades ocultas; los pesos ocupan del orden de unos pocos MB en FP32.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior sobra para inferencia. Para reentrenar con 8 entornos MuJoCo en paralelo, una GPU de gama media (RTX 3060/4060) o incluso CPU multinúcleo es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: PyTorch nativo con el checkpoint del repositorio, exportación a TorchScript u ONNX para inferencia embebida, y uso directo con Gymnasium + MuJoCo para evaluación. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una MLP pequena, la latencia por paso de control es del orden de microsegundos en GPU y de décimas de milisegundo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No hay información suficiente para comparar con otras políticas publicadas sobre `Humanoid-v5` (por ejemplo, implementaciones de referencia de Stable-Baselines3 o CleanRL) en términos de puntuación, ya que la model card no incluye esas comparaciones. La única comparación disponible es interna a la serie del propio autor:

| Version | Cambio respecto a la base | Pasos | Resultado documentado |
|---|---|---|---|
| v1 | Configuración base (lr 0.0003) | 1.000.000 | Referencia de comparación |
| v7 (este) | Learning rate 0.0001 | 1.000.000 | 869.1 puntos medios en 10 episodios |
| v13 | Mismo lr que v7 | 2.000.000 | Puntuación aún creciente al terminar |
| v14 | Continuación de v13 | 4.000.000 | Mejor en 3.7M; empeora al seguir entrenando |
| v15 | lr 0.00003 desde el checkpoint de 3.7M | — | Mejor media en 10 episodios no vistos |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier uso en producción.
- Ámbito muy restringido: la política solo es válida para `Humanoid-v5` con la misma parametrización de observación (348 dimensiones) y acción (17 articulaciones en [-0.4, 0.4]). No generaliza a otros entornos ni a un robot físico sin un pipeline de transferencia sim-to-real.
- Rendimiento moderado: 869.1 puntos medios y 171 pasos de longitud media implican episodios que terminan por caída mucho antes del límite de 1000 pasos; el avance medio de 0.52 es bajo en términos absolutos.
- Alta varianza entre episodios: la diferencia entre la media de evaluación (869.1) y el episodio de reproducción (744.2) sugiere sensibilidad a la semilla inicial.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución más allá del propio entorno de simulación; no aplican las categorías habituales de modelos de lenguaje.
- No se documentan pruebas de robustez frente a perturbaciones (ruido en observaciones, cambios de masa o fricción), lo que limita su uso como referencia de sim-to-real.
- Repositorio de 0.0 GB: conviene verificar que los pesos están efectivamente subidos y son descargables antes de integrarlo en un pipeline.
- La model card está redactada en coreano y no incluye ficha de licencia, citación ni instrucciones de carga del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v7-humanoid-ppo
- Entorno `Humanoid-v5` (Gymnasium): no disponible en la información proporcionada
- Documentación de MuJoCo: no disponible en la información proporcionada
- Curso CONNECT AI LAB × AI CITY BUILDERS (lección 6, PPO): no disponible en la información proporcionada
- Repositorios de la serie (v1, v13, v14, v15): no disponible en la información proporcionada
- Contacto del autor: lucaskim72@gmail.com
