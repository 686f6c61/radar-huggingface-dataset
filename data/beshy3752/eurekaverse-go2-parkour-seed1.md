# beshy3752/eurekaverse-go2-parkour-seed1

## Resumen

Eurekaverse Go2 Parkour Policy — Seed 1 es una política de control de locomoción parkour para el robot cuadrúpedo Unitree Go2, entrenada mediante aprendizaje por refuerzo con un currículo de entornos generado automáticamente por un modelo de lenguaje grande (LLM). El trabajo reproduce el método Eurekaverse (Liang et al., CoRL 2024) sobre Isaac Lab 3.0, donde un LLM (gpt-4o-2024-08-06) genera terrenos de entrenamiento en código cada iteración, formando un currículo adaptativo que aumenta en dificultad y complejidad.

El modelo es una política privilegiada tipo teacher que consume escaneos de altura del terreno (scandots) alrededor del robot, y no es desplegable de forma independiente: requiere destilarse a un estudiante basado en cámara de profundidad para su uso en el robot real o en otro simulador. El checkpoint publicado es el ganador de la iteración 4 del currículo (ejecución paralela 1) y representa una reproducción independiente del método, no el código original de Eurekaverse, por lo que los números absolutos pueden diferir del artículo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política actor-crítico con estimador (red neuronal para control de cuadrúpedo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control por observación de estado y escaneo de altura) |
| Tipos de cuantización | no disponible (checkpoint de punto flotante de PyTorch) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

La política es un actor-crítico con un evaluador, típico de los marcos de aprendizaje por refuerzo para robots (similar a legged_gym / extreme-parkour). El entrenamiento se realizó en Isaac Lab 3.0 (Isaac Sim) sobre un entorno extreme-parkour adaptado, con 5 iteraciones de currículo, 8 ejecuciones paralelas por iteración y 2000 pasos de PPO por entorno, reiniciado desde un preentrenamiento de 1000 pasos en terreno plano. Los terrenos de cada iteración se generaron mediante gpt-4o-2024-08-06, siguiendo el enfoque Eurekaverse: el LLM genera código de terrenos en espacio de código, se entrenan políticas en paralelo y se evalúa el rendimiento para informar la siguiente generación.

La observación incluye un escaneo de altura alrededor del robot (scandots), lo que convierte a esta política en una teacher privilegiada: consume información geométrica completa del terreno que no estaría disponible en el robot real sin un sensor de profundidad. Por tanto, no es directamente desplegable; requiere una destilación a una política estudiante basada en cámara (el repositorio indica `train.py --use_camera ...`).

## Capacidades

- Locomoción parkour en simulación: atraviesa cursos de obstáculos hacia 8 objetivos secuenciales (rampas, cajas, piedras de paso, escaleras, huecos, vigas, etc.).
- Consumo de escaneo de altura (scandots) como observación privilegiada del terreno.
- Política entrenada con currículo adaptativo generado por LLM, capaz de aprender habilidades complejas de forma gradual.
- Capacidad de evaluación sobre 20 tareas parkour × 10 niveles de dificultad (200 instancias).
- No incluye generación de texto, razonamiento, código ni capacidades de visión: es un controlador de bajo nivel para un robot cuadrúpedo.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robots: sirve como referencia de una política entrenada con currículo generado por LLM, útil para comparar métodos de generación de entornos y currículos automáticos.
- Destilación de políticas estudiante basadas en cámara: el flujo principal del repositorio, la teacher con scandots se usa para entrenar una política desplegable que solo consuma imágenes de profundidad.
- Evaluación de robustez de control de cuadrúpedos: el benchmark de 200 instancias (20 tareas × 10 niveles) permite medir la generalización a distintos obstáculos y niveles de dificultad.
- Comparación de métodos de curriculum learning: al ser una reproducción de Eurekaverse sobre Isaac Lab 3.0, se puede comparar con currículos manuales o aleatorios para aislar el efecto de la generación de entornos por LLM.
- Investigación en transferencia sim-to-real: el método original de Eurekaverse demuestra transferencia al mundo real; esta reproducción puede servir de punto de partida para experimentos de transferencia con Unitree Go2.
- Desarrollo de entornos de entrenamiento: los terrenos generados por LLM (por ejemplo, `final_iteration_terrain.py`) pueden reutilizarse para entrenar otras políticas de navegación o manipulación.

## Benchmarks y rendimiento

Se evaluó en un benchmark de 20 tareas parkour × 10 niveles de dificultad (200 instancias), con la métrica de número de objetivos alcanzados (de 8 posibles):

| Política | Objetivos alcanzados (media /8) |
|---|---|
| Esta política (checkpoint 11000) | 4.36 |
| Distribución de las 8 políticas finales | 4.44 ± 0.34 (rango 3.68–4.79) |

Los resultados por tarea están en `benchmark_results.txt`. El modelo es más fuerte en rampas, saltos de pilares y viga de equilibrio (>6/8), y más débil en túneles estrechos y subidas de baches esféricos (<2/8). No se han publicado resultados comparativos con otras políticas en la información disponible.

## Requisitos de hardware

- El modelo requiere Isaac Lab 3.0 (Isaac Sim) para ejecutarse; no es un modelo de inferencia standalone.
- No se especifica VRAM mínima; el checkpoint es de una política de control de tamaño no documentado, por lo que los requisitos son los del entorno de simulación Isaac Sim.
- Para la destilación a una política estudiante con cámara se necesita el entorno de entrenamiento completo (GPU con soporte de simulación, típicamente NVIDIA RTX 30/40 series o superior).
- Opciones de despliegue: solo dentro del entorno Isaac Lab / legged_gym; no compatible con vLLM, Ollama ni otros motores de inferencia de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / método | Tipo | Licencia | Observación |
|---|---|---|---|
| Esta reproducción (Eurekaverse Go2 Parkour) | Política de control cuadrúpedo | MIT | Reproducción sobre Isaac Lab 3.0 |
| Eurekaverse original (Liang et al., CoRL 2024) | Método de generación de currículo | MIT (código) | Original sobre Isaac Gym, no esta portado a Isaac Lab |
| extreme-parkour | Base de locomoción parkour | no disponible | Backbone de entrenamiento usado en esta reproducción |

No se dispone de una comparativa cuantitativa con otras políticas de parkour en los datos proporcionados.

## Limitaciones y advertencias

- La política es una teacher privilegiada que consume scandots (escaneo de altura); sin esa observación, se colapsa y no es desplegable de forma independiente.
- No es un modelo de lenguaje ni de visión; no realiza generación de texto, razonamiento ni tool calling.
- Es una reproducción independiente portada a Isaac Lab 3.0, por lo que los resultados absolutos pueden diferir de los del artículo original de Eurekaverse.
- Se debe verificar las licencias upstream (Eurekaverse, extreme-parkour) antes de redistribuir el modelo o el código.
- El rendimiento es débil en tareas específicas como túneles estrechos y subidas de esferas; no es robusto en todos los terrenos.
- No hay datos de sesgos ni riesgos de alucinación porque no es un modelo de lenguaje; el riesgo principal es la degradación del rendimiento en entornos no vistos y la necesidad de destilación para el despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beshy3752/eurekaverse-go2-parkour-seed1
- Proyecto Eurekaverse (página oficial): https://eureka-research.github.io/eurekaverse/
- Artículo Eurekaverse (arXiv): https://arxiv.org/abs/2411.01775
- Versión HTML del artículo: https://arxiv.org/html/2411.01775v1
- Perfil del autor en Hugging Face: https://huggingface.co/beshy3752
