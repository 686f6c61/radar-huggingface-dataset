# fffiloni/microduck-moonwalk-backward-55e6af

## Resumen

`fffiloni/microduck-moonwalk-backward-55e6af` es una política de control para el robot cuadrúpedo Microduck, desarrollada por Sylvain Filoni (fffiloni) utilizando el stack de sim-to-real `microduck_rl` de Pollen Robotics. El modelo está entrenado mediante aprendizaje por refuerzo (PPO) para ejecutar un movimiento de "moonwalk" hacia atrás: un deslizamiento suave que alterna las patas manteniendo el torso estable y erguido, simulando la ilusión de deslizarse en lugar de caminar hacia atrás de forma convencional.

El modelo se distribuye como un archivo ONNX (`policy.onnx`) junto con metadatos de entrenamiento, métricas de simulación y un vídeo de ensayo en MuJoCo. Está diseñado para ser desplegado en el robot real Microduck tras una validación conservadora, ya que la simulación no garantiza el comportamiento en hardware. Su relevancia radica en ser un ejemplo práctico de generación de comportamientos locomotores complejos mediante RL y sim-to-real en un robot de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de política, detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente FP32) |
| Idiomas soportados | no aplicable (modelo de control motor) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), también `checkpoints/model_final.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una política neuronal entrenada con aprendizaje por refuerzo proximal (PPO) para controlar las articulaciones del robot Microduck. El entorno de entrenamiento es `Mjlab-MotionLabMoonwalkBackward-Flat-MicroDuck`, basado en MuJoCo, con una receta base de `velocity`. Se utilizaron 4096 entornos paralelos durante 4000 iteraciones de PPO, lo que sugiere un entrenamiento intensivo en simulación para lograr un comportamiento robusto.

La política recibe una observación compartida de 61 dimensiones (estado del robot, velocidades, orientación, etc.) y produce una acción de 14 dimensiones (posiciones o torques objetivo para las articulaciones). El modelo se exportó mediante el script oficial `scripts/export.py` del repositorio `microduck_rl`, y pasó una prueba de ensayo en CPU con MuJoCo/ONNX. No se han publicado detalles sobre la arquitectura interna (número de capas, tipo de red, funciones de activación) ni sobre el dataset de entrenamiento más allá de la configuración del entorno.

## Capacidades

- Control de locomoción bípeda: genera comandos de articulación para que Microduck se desplace hacia atrás con un patrón de "moonwalk".
- Movimiento de deslizamiento: alterna las patas para crear la ilusión de deslizamiento, evitando saltos o movimiento vertical excesivo.
- Estabilidad postural: mantiene el torso estable y erguido durante el movimiento, y finaliza en una posición de pie estable.
- Ejecución en tiempo real: el modelo ONNX es ligero y puede ejecutarse en CPU, como demuestra el ensayo en MuJoCo.
- Integración con el stack `microduck_rl`: compatible con el pipeline de exportación y despliegue oficial de Pollen Robotics.
- Reproducibilidad: se proporcionan metadatos de entrenamiento (revisión de código, receta, número de entornos e iteraciones) para replicar el experimento.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: el modelo sirve como caso de estudio de entrenamiento de comportamientos locomotores complejos con PPO y sim-to-real en un robot de bajo coste.
- Desarrollo de habilidades de movimiento para robots cuadrúpedos: el patrón de "moonwalk" puede adaptarse a otros robots o servir como base para movimientos de deslizamiento lateral o rotación.
- Demostraciones educativas en robótica: Microduck es un robot accesible; este modelo permite mostrar cómo un agente RL aprende una tarea motora específica.
- Pruebas de transferencia sim-to-real: el modelo es un candidato para validar metodologías de despliegue de políticas entrenadas en simulación a hardware real.
- Generación de comportamientos de entretenimiento: el movimiento de "moonwalk" puede utilizarse en exhibiciones o aplicaciones de robótica de ocio.
- Benchmarking de algoritmos RL: las métricas de entrenamiento (4096 entornos, 4000 iteraciones) permiten comparar la eficiencia de muestreo de diferentes configuraciones de PPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. En su lugar, la model card proporciona métricas de despliegue:

| Metrica | Valor |
|---|---|
| Movimiento articular maximo | 14.74° |
| Desplazamiento XY | 0.334 m |
| Desplazamiento de balon | 0.0 m |
| Contrato de observacion del actor | 61D |
| Salida de accion de politica | 14D |
| Ensayo CPU MuJoCo/ONNX | pasado |
| Compuerta de calidad de movimiento | necesita revision |

Estas métricas indican que el movimiento generado tiene una amplitud articular moderada y un desplazamiento neto de unos 33 cm, sin desplazamiento lateral. La compuerta de calidad automática no ha sido superada, por lo que se requiere una revisión manual antes de considerar el despliegue en hardware.

## Requisitos de hardware

- El modelo ONNX es extremadamente ligero (tamaño del repositorio: 0.0 GB, aunque el archivo `policy.onnx` puede tener unos pocos megabytes).
- Puede ejecutarse en CPU sin GPU, como demuestra el ensayo en MuJoCo con CPU.
- Para el entrenamiento, se requieren recursos de simulación: 4096 entornos paralelos sugieren el uso de una GPU para acelerar MuJoCo (por ejemplo, una RTX 3090 o superior) o un clúster de CPU.
- Para inferencia en el robot real, se necesita un microcontrolador o SBC compatible con ONNX Runtime (por ejemplo, Raspberry Pi, Jetson Nano) y los actuadores del Microduck.
- Opciones de despliegue: ONNX Runtime, MuJoCo para simulación, y el stack `microduck_rl` para integración con el robot.
- Latencia y throughput: no disponibles, pero al ser una política de 14 salidas, la inferencia debería ser del orden de microsegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas RL para Microduck con movimiento de moonwalk). El repositorio `microduck_rl` de Pollen Robotics puede contener otras políticas para diferentes comportamientos, pero no se han encontrado datos públicos de comparación. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo se entrenó en simulación; el comportamiento en el robot real puede diferir debido a dinámicas no modeladas, fricción, desgaste de actuadores, etc.
- La compuerta de calidad de movimiento automática no se superó ("needs review"), lo que indica que el movimiento puede no cumplir todos los criterios de calidad esperados.
- No se especifica la licencia, por lo que el uso comercial y la redistribución requieren consultar al autor.
- El movimiento de "moonwalk" puede no ser adecuado para superficies irregulares o con obstáculos; está diseñado para suelo plano.
- No hay garantía de estabilidad en condiciones de batería baja o variaciones de peso del robot.
- El modelo no es un sistema de lenguaje ni tiene capacidades de razonamiento simbólico; es exclusivamente un controlador motor.
- La validación en hardware debe realizarse de forma conservadora, siguiendo las advertencias de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fffiloni/microduck-moonwalk-backward-55e6af
- Perfil del autor en Hugging Face: https://huggingface.co/fffiloni
- Perfil del autor en GitHub: https://github.com/fffiloni
- Blog de Microduck de Pollen Robotics: https://pollen-robotics.com/microduck/blog/
- Repositorio `microduck_runtime` (relacionado): https://github.com/apirrone/microduck_runtime
