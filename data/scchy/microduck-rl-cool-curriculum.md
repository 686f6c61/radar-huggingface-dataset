# SccHy/microduck-rl-cool-curriculum

## Resumen

Micro Duck RL — Cool Tricks Series es un repositorio de checkpoints de aprendizaje por refuerzo (RL) para el robot cuadrúpedo Micro Duck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política neuronal entrenada con PPO (a través de la librería rsl_rl) en el simulador mjlab, orientada a que el robot ejecute una secuencia de maniobras acrobáticas ("tricks") sobre obstáculos de pared.

El artefacto publicado es un checkpoint concreto (`model_228468.pt`) que implementa la maniobra denominada "Roulade Wall-Jump", un encadenamiento de aproximación, salto, apoyo en pared, voltereta y aterrizaje, entrenado mediante un currículo de dificultad creciente que va de paredes de 0,5 cm a 5 cm. El autor mantiene el proyecto abierto y prevé publicar más maniobras (currículo "lean" de 9 etapas, backflips, combos) en el futuro.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigadores y desarrolladores de robótica que quieran estudiar cómo se estructura un currículo de RL para locomoción y acrobacia en cuadrúpedos pequeños, y como punto de partida para reentrenar o evaluar políticas con mjlab y rsl_rl. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB según HuggingFace (probablemente el checkpoint se distribuye fuera del repo o el tamaño reportado no refleja el binario real).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor-critic para RL (PPO, rsl_rl) sobre simulador mjlab; arquitectura de red no especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (política de control robótico) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`) de rsl_rl |

## Arquitectura y entrenamiento

El proyecto se apoya en mjlab (entorno de simulación física basado en MuJoCo) y rsl_rl (implementación de PPO para robótica). El checkpoint publicado es un actor-critic de PPO entrenado mediante un currículo de dificultad incremental documentado por el autor: aproximación, "jump school" (etapas A3/A4), "2cm wall school" (BL1), "stand-up chain" (BL2), midroll, full-chain (B19), steep dive (B20) y graduación a 5 cm (B24). El checkpoint final corresponde al paso B24 con paredes de 5 cm.

No se especifican en la información disponible el número de parámetros de la red, la composición del dataset (en RL no hay dataset en sentido estricto, sino distribución de estados generada por el simulador), el número total de pasos de entorno, ni detalles de recompensas, dominios aleatorizados o técnicas de regularización. Tampoco se documenta si hubo ajuste fino desde una política base de pollen-robotics/microduck_rl o entrenamiento desde cero.

## Capacidades

- Control locomotor de un cuadrúpedo Micro Duck en simulación mjlab: aproximación a pared, salto, apoyo, voltereta y aterrizaje encadenados.
- Ejecución de la maniobra "Roulade Wall-Jump" sobre paredes de hasta 5 cm.
- Reanudación y evaluación mediante la CLI `mjlab_microduck` (según instrucciones del autor).
- Entrenamiento reproducible a partir de los scripts de currículo incluidos en el repositorio de GitHub.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio.
- No es un modelo generativo de propósito general: su única función es producir acciones motoras para el robot.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: usar el checkpoint y los scripts de currículo como referencia para estudiar cómo se escala una habilidad acrobática desde paredes de 0,5 cm hasta 5 cm, y qué etapas intermedias son necesarias.
- Reproducción de experimentos: clonar el repositorio, colocar el checkpoint en `logs/rsl_rl/...` y reanudar el entrenamiento con `mjlab_microduck` para verificar los resultados del autor o extender el currículo.
- Evaluación comparativa de políticas: servir como línea base para comparar nuevas políticas de locomoción/acrobacia entrenadas con mjlab + rsl_rl frente a la "Roulade Wall-Jump" publicada.
- Docencia y divulgación: ejemplo práctico y de código abierto (MIT) para explicar currículos de RL, PPO y simulación física en robótica cuadrúpeda.
- Transferencia a hardware: punto de partida para quienes dispongan de un Micro Duck físico y quieran probar políticas entrenadas en simulación (requiere validación y ajuste propios, no documentados en la información disponible).
- Desarrollo de nuevas maniobras: reutilizar la infraestructura de entrenamiento para backflips, combos o el currículo "lean" de 9 etapas que el autor anuncia como trabajo en curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente referencia una demo en vídeo (`demos/b24_5cm_best_run.mp4`) y un checkpoint (`checkpoints/b24_5cm_fullchain/model_228468.pt`), sin métricas cuantitativas de éxito, recompensa, velocidad o robustez.

## Requisitos de hardware

- No disponible la VRAM estimada: el tamaño del checkpoint no se especifica y el repo reporta 0,0 GB.
- No disponible la GPU recomendada: al tratarse de una política de RL de robótica, el entrenamiento suele requerir GPU (por ejemplo, A100, H100 o RTX 4090) y la inferencia puede ejecutarse en CPU, pero el autor no documenta requisitos.
- No se confirma que quepa en GPU de consumo; depende del tamaño de la red, no especificado.
- Opciones de despliegue: mjlab con la CLI `mjlab_microduck` y rsl_rl para entrenamiento/evaluación; no se documentan exportaciones a ONNX, TensorRT ni otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de RL para Micro Duck ni métricas que permitan una comparación rigurosa. Como referencia contextual, el proyecto se basa en pollen-robotics/microduck_rl, pero no se aportan datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- Es una política de RL específica para un robot concreto (Micro Duck) y un simulador concreto (mjlab); no es transferible directamente a otros robots o entornos sin reentrenamiento.
- Solo se publica una maniobra ("Roulade Wall-Jump" hasta 5 cm); el resto de currículos están en curso y no están disponibles.
- No hay métricas publicadas de tasa de éxito, robustez ante perturbaciones ni sim-to-real; el vídeo demo no constituye evidencia cuantitativa.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes independientes de reproducibilidad.
- El tamaño reportado del repo (0,0 GB) no permite verificar que el checkpoint esté efectivamente alojado en HuggingFace; puede requerir descarga desde el repositorio de GitHub.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; el autor no ofrece soporte ni mantenimiento documentado.
- No aplica la advertencia habitual sobre sesgos o alucinaciones de modelos de lenguaje; el riesgo relevante es el fallo de la política en estados fuera de la distribución de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/SccHy/microduck-rl-cool-curriculum
- Repositorio GitHub del proyecto: https://github.com/scchy/microduck-rl-cool-curriculum
- Proyecto base: https://github.com/pollen-robotics/microduck_rl
- Script de entrenamiento: https://github.com/scchy/microduck-rl-cool-curriculum (archivo `scripts/train_curriculum_lean_to_5cm.sh`)
