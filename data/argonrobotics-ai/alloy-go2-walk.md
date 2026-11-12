# argonrobotics-ai/alloy-go2-walk

## Resumen

`alloy-go2-walk` es una política de control por refuerzo (reinforcement learning) para el cuadrúpedo Unitree Go2, entrenada para seguir comandos de velocidad sobre terreno llano. La publica el repositorio `argonrobotics-ai` y su función no es generar texto ni procesar lenguaje, sino producir acciones de locomoción a partir de observaciones proprioceptivas del robot. Se entrena y evalúa dentro de Alloy, un motor de física para GPU orientado a robótica, usando el entrenador que el propio motor incluye (`python -m alloy.envs.loco.train`).

El modelo es un checkpoint de `rsl_rl` (PPO) con pesos de actor y crítico más el normalizador de observaciones, guardado con `torch.save`. No se publica el número de parámetros de la red, pero por el tipo de política (MLP de control continuo para un entorno de locomoción) el tamaño es reducido frente a un LLM: el repo ocupa 0.0 GB y el artefacto principal es un único fichero `.pt`.

Su relevancia es práctica: demuestra que en 400 iteraciones de entrenamiento (15,5 minutos en una NVIDIA L4) se alcanza un 97 % de éxito (497 de 512 episodios, dos semillas) en la tarea de seguir comandos de velocidad. Es un ejemplo reproducible de entrenamiento de locomoción en GPU con un motor físico moderno, y sirve como referencia para quien quiera validar su pipeline de RL antes de escalar a entrenamientos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control continuo entrenada con PPO (rsl_rl); red actor-crítico con normalizador de observaciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación del entorno de locomoción de Alloy) |
| Tipos de cuantizacion | no disponible (checkpoint `.pt` en precisión de entrenamiento) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache-2.0 (pesos y código de la página) |
| Formato de pesos | `.pt` (checkpoint de `rsl_rl` guardado con `torch.save`: pesos de actor y crítico y normalizador de observaciones) |

## Arquitectura y entrenamiento

La política se entrena con el entrenador incluido en Alloy, basado en PPO de `rsl_rl` con los ajustes por defecto del paquete. El entrenamiento usa 4.096 mundos paralelos (entornos simulados) y semilla de entrenamiento 0. El checkpoint publicado corresponde a 400 iteraciones, equivalentes a 15,5 minutos de cómputo en una NVIDIA L4 (unos 23 GB, instancia GCP spot `g2-standard-8`, driver 580.178.04), sin contar la compilación inicial de kernels (202 s con la caché en frío). El entorno es el de velocidad para Go2 que Alloy distribuye, sobre terreno llano.

La tarea define el éxito de forma estricta: un episodio es correcto si el robot no cae y su mundo no pasa a estado INVALID durante 20 s, y además su velocidad media queda dentro de 0,25 m/s y su tasa de guiñada dentro de 0,25 rad/s respecto al comando durante los últimos 15 s. La evaluación se hace con 256 episodios por semilla (9001 y 9002), un comando por episodio muestreado uniformemente de los rangos de entrenamiento, y sin mundos INVALID. El entrenamiento se ejecutó con `alloy-engine 0.1.0rc2` (torch 2.15, warp-lang 1.18.0, mujoco 3.17.0).

## Capacidades

- Locomoción cuadrúpeda: genera comandos de articulación para que el Unitree Go2 siga consignas de velocidad lineal y de guiñada sobre suelo llano.
- Seguimiento de comandos de velocidad con tolerancia de 0,25 m/s y 0,25 rad/s en los últimos 15 s del episodio.
- Estabilidad: la política mantiene el robot en pie durante episodios de 20 s en el entorno de evaluación.
- Reproducibilidad: incluye `evaluate.py`, que ejecuta la política en el entorno de velocidad de Go2 de Alloy y cuenta los éxitos por semilla.
- Reentrenamiento: el mismo pipeline permite entrenar desde cero con `python -m alloy.envs.loco.train --num-envs 4096 --iterations 400 --out runs/go2`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Validación de pipelines de RL en robótica: sirve como referencia reproducible para comprobar que la instalación de Alloy, `rsl_rl` y los drivers de GPU funcionan, comparando el recuento de éxitos con el 97 % publicado.
- Punto de partida para fine-tuning de locomoción: el checkpoint de 400 iteraciones puede usarse como inicialización para entrenar variantes (terreno irregular, cargas, comandos distintos) sin partir de cero.
- Simulación de control de bajo nivel en un gemelo digital: integrar la política en un simulador para probar consignas de velocidad antes de desplegar en hardware.
- Docencia y formación en RL aplicado: el par `go2_flat_400it.pt` + `evaluate.py` permite mostrar en clase el ciclo completo de entrenamiento y evaluación con métricas objetivas en menos de media hora de cómputo.
- Benchmarking de motores físicos: al fijar la política, la tarea y las semillas, se puede comparar el comportamiento de distintas versiones de `alloy-engine` o de otros motores que reproduzcan el mismo entorno.
- Pruebas de regresión en CI: ejecutar `evaluate.py` con pocos mundos en CPU (`--worlds 4 --seeds 9001`) como test de humo para detectar roturas en dependencias o en el entorno de evaluación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de exito a 400 iteraciones (15,5 min) | 97 % (497 de 512 episodios, semillas 9001 y 9002) |
| Tasa de exito a 100 iteraciones (4,1 min) | 95 % (244 de 256 episodios); checkpoint no publicado |
| Mundos INVALID en evaluacion | 0 |
| Entornos de entrenamiento | 4.096 |
| Hardware de referencia | 1 x NVIDIA L4 (~23 GB), GCP spot g2-standard-8 |
| Version del motor | alloy-engine 0.1.0rc2 (torch 2.15, warp-lang 1.18.0, mujoco 3.17.0) |
| Tiempo de evaluacion por semilla | ~30 s en L4 (256 episodios) |
| Compilacion inicial de kernels | 202 s (no contabilizada en el tiempo de entrenamiento) |

No se han publicado comparaciones con otras políticas de locomoción para Go2 en la información disponible.

## Requisitos de hardware

- GPU: una NVIDIA L4 (~23 GB) es suficiente para entrenar 400 iteraciones en 15,5 minutos y evaluar cada semilla en unos 30 segundos.
- Entrenamiento: 4.096 mundos paralelos requieren memoria de GPU proporcional; el autor no detalla el consumo exacto, solo el hardware usado (L4 de ~23 GB).
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; el autor solo documenta la L4. La evaluación funciona en CPU con pocos mundos.
- CPU: `python evaluate.py --worlds 4 --seeds 9001` tarda uno o dos minutos sin GPU.
- Despliegue: no aplica servidor de inferencia tipo vLLM, llama.cpp, Ollama o TGI; la ejecución se hace con `alloy-engine[envs]` y `rsl-rl-lib` (probado con 5.5.2) en Python 3.11 o 3.12.
- Latencia y throughput: no disponibles más allá del tiempo de evaluación por semilla indicado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción para Unitree Go2 ni resultados comparables de terceros.

## Limitaciones y advertencias

- Ámbito restringido: solo terreno llano y el entorno de velocidad de Go2 que distribuye Alloy; no se ha validado en hardware real ni en terrenos irregulares.
- Dependencia de versión: los resultados se midieron con `alloy-engine 0.1.0rc2`; versiones posteriores pueden dar recuentos distintos.
- No determinismo en GPU: dos ejecuciones de la misma evaluación pueden diferir en unos pocos episodios porque los mundos en contacto no se repiten bit a bit en GPU.
- Un solo entrenamiento: las cifras provienen de una única ejecución con semilla 0; no hay intervalo de confianza sobre el entrenamiento en sí.
- Sin datos de sesgo, alucinación o multilingüismo: no aplican a una política de control, pero tampoco se documenta su comportamiento fuera de la distribución de comandos de entrenamiento.
- Licencia Apache-2.0: permite uso comercial de pesos y código, pero no se ofrece ninguna garantía ni soporte; el autor no documenta limitaciones de responsabilidad adicionales.
- El checkpoint de 100 iteraciones (95 % de éxito) no está publicado en la página, por lo que no se puede reproducir esa comparación interna.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/argonrobotics-ai/alloy-go2-walk
- Código de Alloy: https://github.com/argonrobotics-ai/alloy
- Documentación de Alloy: https://alloy.argonrobotics.ai/docs/
- Guía de entrenamiento RL: https://alloy.argonrobotics.ai/docs/guides/rl/
- How-to de RL para cuadrúpedos: https://alloy.argonrobotics.ai/docs/how-to/quadruped-rl/
- Sitio de Alloy: https://alloy.argonrobotics.ai
