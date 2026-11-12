# argonrobotics-ai/alloy-pour

## Resumen

`alloy-pour` es una política de control entrenada mediante aprendizaje por refuerzo para la tarea `Pour-v0` del motor de física Alloy, desarrollado por Argon Robotics. La tarea consiste en que un brazo robótico desplace un cuenco bajo un chorro de 100 ml de agua simulada con el solver de líquidos de Alloy, de modo que al menos el 75 % del líquido acabe dentro del recipiente al final del episodio.

El artefacto principal es un checkpoint (`pour_v0.pt`) de un entrenamiento PPO con una red MLP de 128 x 128, guardado a los 38,5 minutos de entrenamiento (iteración 10). No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de control específica para una única tarea de manipulación robótica, distribuida junto con un script `evaluate.py` que reproduce la evaluación.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para quien quiera validar el motor Alloy, comparar curvas de entrenamiento de RL en simulación de líquidos o disponer de una política base para la tarea de vertido. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB según Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 128 x 128 (actor y crítico) entrenada con PPO mediante el wrapper `rsl_rl` de Alloy |
| Parametros totales | no disponible (MLP de 128 x 128; el número exacto de parámetros no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (checkpoint `torch.save` en precisión de entrenamiento) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache-2.0 (pesos y código) |
| Formato de pesos | checkpoint `rsl_rl` en `.pt` (pesos de actor y crítico más normalizador de observaciones), guardado con `torch.save` |

## Arquitectura y entrenamiento

La política es una MLP de dos capas de 128 unidades por capa, con actor y crítico separados, entrenada con PPO usando los ajustes por defecto del wrapper `rsl_rl` de Alloy sobre 512 mundos simulados en paralelo. El entorno `Pour-v0` simula un chorro de 100 ml de agua mediante el solver de líquidos del motor Alloy; el agente controla el movimiento de un cuenco para interceptar el chorro. La observación y la acción concretas no se detallan en la información disponible.

El checkpoint publicado corresponde a la iteración 10, a los 38,5 minutos de entrenamiento. La evaluación se realizó con `alloy-engine 0.1.0rc2` desde PyPI, con `torch 2.15`, `warp-lang 1.18.0` y `mujoco 3.17.0`, sobre una única NVIDIA L4 (unos 23 GB, instancia GCP spot `g2-standard-8`, driver 580.178.04). Los resultados provienen de una sola ejecución de entrenamiento. No se documentan innovaciones técnicas adicionales (RLHF, DPO, decodificación especulativa ni mecanismos de atención), ya que no aplican a este tipo de artefacto.

## Capacidades

- Control de una política de vertido para la tarea `Pour-v0`: mueve un cuenco para recoger al menos el 75 % de 100 ml de agua simulada.
- Inferencia determinista a partir del checkpoint: carga de pesos de actor y crítico y del normalizador de observaciones con `rsl-rl-lib` (probado con 5.5.2).
- Evaluación reproducible mediante `evaluate.py`, que ejecuta 128 episodios con semilla 1000 y cuenta éxitos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües.
- No dispone de modo de pensamiento, visión ni audio.
- Es específica de un único entorno y de una única tarea; no se ha entrenado para generalizar a otras tareas de Alloy.

## Casos de uso

- Validación del motor Alloy: sirve como caso de referencia para comprobar que la instalación de `alloy-engine[envs]` y `rsl-rl-lib` funciona y reproduce el 92,2 % de éxito reportado en una L4.
- Línea base para experimentos de RL: permite comparar nuevas configuraciones de PPO, tamaños de red o número de mundos contra un resultado conocido (75 % de éxito superado por primera vez a los 24,9 minutos).
- Estudio de simulación de líquidos: útil para analizar la variabilidad entre ejecuciones en GPU (diferencias de unos pocos episodios por contactos no deterministas bit a bit).
- Docencia y divulgación: ejemplo mínimo y autocontenido de entrenamiento de políticas con `rsl_rl` sobre un entorno físico con solver de fluidos.
- Pruebas de infraestructura: benchmark de rendimiento de GPU para cargas de simulación con líquidos (unos 6 minutos para 128 mundos en una L4 tras compilar kernels).
- Punto de partida para fine-tuning: el checkpoint puede servir como inicialización para variantes de la tarea de vertido, aunque no se documenta ningún procedimiento de este tipo.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de exito en `Pour-v0` | 118 de 128 episodios (92,2 %) | Checkpoint a 38,5 min (iteración 10), semilla 1000, `alloy-engine 0.1.0rc2`, una NVIDIA L4 |
| Primer cruce del 75 % de exito | 24,9 min de entrenamiento | Misma ejecución de entrenamiento |
| Tiempo de evaluacion | ~6 min para 128 mundos | NVIDIA L4, tras compilación inicial de kernels |

Los datos provienen de una única ejecución de entrenamiento y de una única versión del motor (`0.1.0rc2`). Versiones posteriores pueden dar recuentos distintos, y en GPU dos evaluaciones idénticas pueden diferir en unos pocos episodios. No se han publicado resultados de benchmarks comparativos con otras políticas en la información disponible.

## Requisitos de hardware

- GPU recomendada: NVIDIA L4 (unos 23 GB); es el hardware usado para la medición publicada.
- El autor indica explícitamente que la simulación de líquidos es lenta en CPU y recomienda usar GPU.
- No se especifica VRAM mínima; el checkpoint es un MLP de 128 x 128 y el coste dominante es la simulación física, no los pesos.
- No hay datos publicados sobre ejecución en GPUs de consumo (RTX 4090, etc.); no disponible.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Se ejecuta con `alloy-engine[envs]` y `rsl-rl-lib` sobre Python 3.11 o 3.12.
- Throughput: 128 episodios en unos 6 minutos en una L4 (aproximadamente 21 episodios por minuto), tras una compilación inicial de kernels de un solo uso.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables publicadas para `Pour-v0` ni para tareas equivalentes de vertido de líquidos en otros motores de física.

## Limitaciones y advertencias

- Específica de una sola tarea (`Pour-v0`) y de un solo entorno; no generaliza a otras tareas ni a variaciones del escenario.
- Resultado medido en una única ejecución de entrenamiento y con una única versión del motor (`0.1.0rc2`); versiones posteriores pueden alterar el recuento de éxitos.
- En GPU, dos evaluaciones idénticas pueden diferir en unos pocos episodios porque los mundos en contacto no se repiten bit a bit.
- El umbral de éxito es exigente: se requiere al menos el 75 % del agua en el cuenco; un 7,8 % de los episodios falla ese criterio.
- Dependencia de versiones concretas de `torch`, `warp-lang` y `mujoco`; cambios de versión pueden romper la reproducibilidad.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución más allá del propio entorno simulado.
- Licencia Apache-2.0, que permite uso comercial de pesos y código; no obstante, la utilidad comercial directa es limitada al ser una política de una tarea concreta.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/argonrobotics-ai/alloy-pour
- Documentación de Alloy: https://alloy.argonrobotics.ai/docs/
- Guía de entrenamiento RL: https://alloy.argonrobotics.ai/docs/guides/rl/
- How-to de vertido de líquidos: https://alloy.argonrobotics.ai/docs/how-to/pour-liquid-robot-arm/
- Sitio de Alloy: https://alloy.argonrobotics.ai
- Código de Alloy: https://github.com/argonrobotics-ai/alloy
