# beshy3752/eurekaverse-go2-parkour-seed2

## Resumen

Eurekaverse Go2 Parkour Policy — Seed 2 es un modelo de política de aprendizaje por refuerzo para el robot cuadrúpedo Unitree Go 2, especializado en tareas de parkour y locomoción sobre obstáculos. Lo desarrolla el usuario beshy3752 (Yoon Sihyung) como parte de una reproducción del sistema Eurekaverse, en el que el currículo de entrenamiento es generado automáticamente por un modelo de lenguaje (GPT-4o). Este checkpoint concreto es el resultado de la segunda semilla independiente de un experimento de tres semillas, y está pensado para ser evaluado en entornos de simulación con Isaac Lab 3.0.

El modelo resuelve el problema de enseñar a un robot cuadrúpedo a atravesar circuitos de obstáculos complejos (rampas, cajas, escalones, huecos, vigas, etc.) hacia ocho objetivos secuenciales. Su relevancia radica en que demuestra la viabilidad de usar currículos generados por LLM para lograr habilidades de locomoción robustas en simulación, con potencial transferencia al mundo real tras un proceso de destilación. La arquitectura interna de la política no se detalla en la información disponible, pero el checkpoint se presenta como un modelo de tipo "teacher" privilegiado que consume escaneos de altura del terreno (scandots).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de red neuronal para RL, sin especificación) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es modelo de lenguaje) |
| Tipos de cuantización | no aplicable |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por refuerzo entrenada con el entorno `extreme-parkour` de Isaac Lab 3.0. El entrenamiento sigue un esquema de currículo generado por LLM (Eurekaverse-style): se realizan 5 iteraciones de currículo, cada una con 8 ejecuciones paralelas de políticas, 2000 pasos de PPO por entorno, partiendo de un preentrenamiento de 1000 pasos en terreno plano. Los terrenos se generan en cada iteración mediante el modelo `gpt-4o-2024-08-06`. Este checkpoint concreto corresponde al ganador de la iteración 4 (ejecución paralela 2, linaje [2,4,4,6]).

El modelo es una política privilegiada ("teacher") que consume un escaneo de altura del terreno alrededor del robot (scandots). No es desplegable de forma autónoma; para uso en robot real u otro simulador se requiere destilar una política basada en cámara (`train.py --use_camera ...`). El entrenamiento se realizó en Isaac Lab 3.0 y se basa en Eurekaverse (Liang et al., CoRL 2024) y en el entorno `extreme-parkour`.

## Capacidades

- Locomoción parkour: el modelo es capaz de atravesar circuitos con rampas, cajas, escalones, huecos, vigas y otros obstáculos.
- Navegación hacia objetivos secuenciales: la política se entrena para alcanzar hasta 8 objetivos en orden.
- Entrada de altura del terreno: utiliza un escane de altura (scandots) para percibir el entorno.
- No es un modelo de lenguaje: no genera texto, no tiene tool calling, ni soporte de agentes conversacionales.
- No tiene capacidades de visión (aunque el escane de altura es un sensor, no es visión por cámara).

## Casos de uso

- **Investigación en aprendizaje por refuerzo**: sirve como punto de partida para estudiar currículos generados por LLM, estabilidad entre semillas y técnicas de destilación de políticas.
- **Entrenamiento de robots cuadrúpedos en simulación**: se puede utilizar en Isaac Lab para evaluar el rendimiento de políticas de parkour y comparar con otros métodos de entrenamiento.
- **Destilación de políticas para despliegue en robot real**: al ser un modelo "teacher", es el punto de partida para entrenar un "student" que use cámaras de profundidad, permitiendo transferencia al Unitree Go2 físico.
- **Benchmarking de algoritmos de RL**: el checkpoint y los resultados de evaluación pueden usarse como referencia para comparar nuevos algoritmos de aprendizaje.
- **Generación de currículos automáticos**: este modelo demuestra la viabilidad de que un LLM diseñe currículos de entrenamiento, lo que puede aplicarse a otros entornos de robot.
- **Evaluación de robustez y estabilidad**: al contar con dos semillas independientes (seed 1 y seed 2), permite analizar la variabilidad entre ejecuciones y la reproducibilidad del método.

## Benchmarks y rendimiento

Se proporcionan resultados de evaluación en un conjunto de prueba de **20 tareas de parkour × 10 niveles de dificultad**, con la métrica de número de objetivos alcanzados (máximo 8).

| Política | Puntuación media (objetivos alcanzados / 8) |
|---|---|
| Eurekaverse Go2 Parkour Seed 2 (este modelo) | 4.52 |
| Eurekaverse Go2 Parkour Seed 1 | 4.36 |

Ambas semillas se encuentran en un rango de ~0.2, lo que indica estabilidad en la reproducción. No hay datos de benchmarks comparables con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Para ejecutar el entrenamiento o la evaluación es necesario contar con Isaac Lab 3.0, que requiere una GPU NVIDIA con soporte para CUDA y PyTorch.
- El checkpoint es un archivo `.pt` de PyTorch; la inferencia de la política es ligera (red neuronal de tamaño no especificado), por lo que probablemente se pueda ejecutar en GPUs de consumo medio (por ejemplo, RTX 3060 o superior) para simulación en tiempo real.
- Para entrenamiento completo (5 iteraciones × 8 políticas paralelas) se recomienda una GPU de mayor capacidad (p. ej., RTX 4090 o A100), aunque no hay datos oficiales.
- Opciones de despliegue: Isaac Lab para simulación; para despliegue en robot real se requiere un proceso de destilación y un framework de control del robot.

## Comparativa con modelos similares

No hay modelos directamente comparables en el mismo formato (política de parkour para Unitree Go2). El modelo original de Eurekaverse (Liang et al., CoRL 2024) es la referencia conceptual, pero no se dispone de sus resultados numéricos. La comparativa más relevante es la interna entre semillas:

| Modelo | Puntuación media (objetivos / 8) | Entrenamiento | Licencia |
|---|---|---|---|
| Eurekaverse Go2 Seed 2 (este) | 4.52 | RL + currículo LLM (GPT-4o) | MIT |
| Eurekaverse Go2 Seed 1 | 4.36 | RL + currículo LLM (GPT-4o) | MIT |

## Limitaciones y advertencias

- **No es desplegable directamente**: al ser una política privilegiada que consume scandots (altura del terreno), sin esta entrada el modelo colapsa. Requiere destilación a una política basada en cámara para uso en robot real.
- **Dependencia del entorno**: los resultados se obtienen en simulación Isaac Lab 3.0; la transferencia al mundo real no está garantizada sin destilación y calibración.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo de texto).
- **Limitaciones de contexto**: no aplica (no es un modelo de lenguaje).
- **Restricciones de licencia**: licencia MIT, pero se debe preservar la atribución a Eurekaverse y `extreme-parkour` al redistribuir.
- **Estabilidad**: aunque las dos semillas muestran resultados similares, no hay garantía de reproducibilidad exacta en otros entornos o versiones de Isaac Lab.

## Enlaces

- Modelo en Hugging Face: [beshy3752/eurekaverse-go2-parkour-seed2](https://huggingface.co/beshy3752/eurekaverse-go2-parkour-seed2)
- Semilla 1 del mismo autor: [beshy3752/eurekaverse-go2-parkour-seed1](https://huggingface.co/beshy3752/eurekaverse-go2-parkour-seed1)
- Perfil del autor en Hugging Face: [beshy3752 (Yoon Sihui)](https://huggingface.co/beshy3752)
- Repositorio oficial de Eurekaverse: [https://github.com/eureka-research/eurekaverse](https://github.com/eureka-research/eurekaverse)
