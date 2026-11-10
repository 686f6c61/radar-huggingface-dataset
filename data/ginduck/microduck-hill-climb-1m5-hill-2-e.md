# GinDuck/microduck-hill-climb-1m5-hill-2-e

## Resumen
`microduck-hill-climb-1m5-hill-2-e` es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo lo publica el usuario GinDuck y resuelve una tarea concreta de locomoción: subir una rampa de 1,5 metros a la máxima velocidad posible manteniendo la trayectoria. No es un modelo de lenguaje ni un sistema multimodal, sino un policy de reinforcement learning exportado a ONNX que se carga directamente en el daemon del robot.

La política opera a 50 Hz sobre un espacio de observación de 61 dimensiones y produce 14 acciones (control de las articulaciones del cuadrúpedo). El checkpoint corresponde a la iteración 1750 de un entrenamiento con 4096 entornos paralelos y semilla 1, dentro del reto `Mjlab-HillClimb1m5-MicroDuck` del repositorio `microduck-challenges`. Es un artefacto de robótica de nicho, relevante para quienes trabajan con el hardware microduck o investigan locomoción con RL.

La información pública es muy escasa: el repositorio ocupa 0,0 GB (probablemente solo contiene el ONNX y el manifest), no tiene descargas ni likes, y no se declara licencia ni idiomas. La model card se limita a describir el entrenamiento y el comando de carga en el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX; arquitectura de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de 61 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento
La model card no detalla la arquitectura de la red neuronal (número de capas, tipo de capas, función de activación). Lo que sí se documenta es el pipeline de entrenamiento: se usa `mjlab` (base `mjlab-microduck 0.1.0 @ 1efd853be`) con el task `Mjlab-HillClimb1m5-MicroDuck`, 4096 entornos paralelos, hasta 3000 iteraciones, semilla 1 y logging en TensorBoard. El checkpoint publicado es el 1750. El entrenamiento se hizo sobre la rama `race-2` (commit `b44f7ffc9`) del repositorio `pollen-robotics/microduck-challenges`, y el autor indica que la receta es compartida por TheSauceman.

La política es "perpetua": se ejecuta en bucle hasta que se le indique lo contrario, y se carga en un slot de política del daemon del robot. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que se alimenta con observaciones crudas. El autor advierte que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades
- Locomoción cuadrúpeda: subir una rampa de 1,5 m a velocidad máxima manteniendo la línea.
- Control a 50 Hz con 61 dimensiones de observación y 14 acciones.
- Política perpetua: se ejecuta de forma continua hasta que se detiene o se sustituye.
- Integración con el daemon microduck mediante `robotctl policy load <slot> <repo>`.
- Normalización de observaciones embebida en el ONNX (no requiere preprocesado externo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso
- Investigación en locomoción con RL: sirve como checkpoint de referencia para comparar recetas de entrenamiento en el reto `Mjlab-HillClimb1m5-MicroDuck` y medir tiempos de subida de rampa.
- Demostración de escalada de rampa en el robot microduck: el modelo completa cada subida en aproximadamente 1,4 s, lo que lo hace útil para vídeos de demostración o validación del hardware.
- Benchmark de políticas en `microduck-challenges`: al estar atado a un commit y una semilla concretos, permite reproducir experimentos y contrastar variantes de la rama `race-2`.
- Prueba de integración del daemon: al cargarse con `robotctl policy load`, sirve para validar el flujo de slots de política y el manifest schema 2 en un robot real.
- Base para fine-tuning o destilación: al ser un ONNX pequeño y con normalizador embebido, es un punto de partida para entrenar variantes con otras rampas o velocidades.
- Educación y divulgación en robótica open source: el comando de reproducción con `uv` y el repositorio público permiten que estudiantes repitan el entrenamiento desde cero.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La única métrica aportada por el autor es cualitativa y de tiempo: cada subida de la rampa se completa en aproximadamente 1,4 segundos. No hay datos de MMLU, HumanEval, GSM8K ni métricas de RL (recompensa media, tasa de éxito, varianza) en la model card.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; al ser una política de robótica en ONNX, el tamaño del modelo no se declara y el repo ocupa 0,0 GB.
- GPU recomendadas: no aplica para inferencia en el robot; el entrenamiento se hizo con 4096 entornos paralelos, lo que requiere una GPU de datacenter (el autor no especifica el modelo).
- Cabe en GPU de consumo: no disponible; por el tamaño del artefacto es plausible que sí, pero no se confirma.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`); no se documentan vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: control a 50 Hz (20 ms por paso); tiempo de subida de rampa de aproximadamente 1,4 s por episodio.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otras políticas del mismo reto ni checkpoints comparables de `microduck-challenges` con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al ser una política de RL entrenada en simulación, puede presentar un gap sim-to-real no cuantificado.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede fallar fuera de la distribución de entrenamiento (otras rampas, terrenos, cargas).
- Limitaciones de contexto o idioma: no aplica; el espacio de observación es fijo (61 dimensiones) y las acciones son 14.
- Restricciones de licencia: no se declara licencia en el repositorio, lo que impide asumir uso comercial sin consultar al autor.
- Caveat de producción: el entrenamiento no es bit-reproducible; el checkpoint está atado al commit `b44f7ffc9` y a la semilla 1, y el autor advierte que repetirlo produce una política comparable, no idéntica.
- El modelo está pensado exclusivamente para el hardware microduck y el daemon con manifest schema 2; no es portable a otros robots sin reentrenamiento.

## Enlaces
- [Hugging Face: GinDuck/microduck-hill-climb-1m5-hill-2-e](https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-e)
- [Repositorio microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- [Repositorio microduck-challenges](https://github.com/pollen-robotics/microduck-challenges)
- [Documentación del policy manifest (schema 2)](https://github.com/pollen-robotics/microduck/blob/main/docs/policy-manifest.md)
