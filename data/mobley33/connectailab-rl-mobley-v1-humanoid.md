# mobley33/connectailab-rl-MOBLEY-v1-humanoid

## Resumen

connectailab-rl-MOBLEY-v1-humanoid es un agente de aprendizaje por refuerzo (RL) entrenado con PPO para resolver la tarea de locomocion del entorno Humanoid-v5 de Gymnasium/MuJoCo. No es un modelo de lenguaje: se trata de una politica neuronal que controla un cuerpo humanoide simulado de 17 articulaciones a partir de observaciones de 348 dimensiones, con el objetivo de caminar sin caer durante los 1000 pasos maximos del episodio. Lo publica el usuario mobley33 (identificado en la model card como "Kim Kwajang" de la empresa YG-1) bajo el paraguas del material didactico Connect AI LAB.

El modelo resuelve un problema clasico y bien acotado de control continuo: aprender una politica de locomocion estable en un simulador fisico. Su relevancia es fundamentalmente educativa y de referencia: documenta de forma reproducible la configuracion exacta de PPO que logra una puntuacion media de 5982,5 en el entorno estandar, con todos los hiperparametros, semillas de evaluacion y curvas de aprendizaje publicados. No compite con modelos fundacionales ni con agentes generalistas; su interes esta en servir como baseline verificado y reproducible para practicas de RL.

La arquitectura es una MLP pequena (dos capas de 256 unidades con activacion Tanh) separada para politica y funcion de valor, entrenada sobre CPU con PyTorch 2.6.0, Gymnasium 1.4.0 y MuJoCo 3.3.7. El repositorio ocupa 0,0 GB y contiene pesos, codigo de entrenamiento, notebook de practicas y artefactos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (256 x 256, activacion Tanh) para politica y funcion de valor; algoritmo PPO |
| Parametros totales | no disponible (dos MLP de 256x256; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observacion de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | coreano (metadatos del repo y model card) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `training_checkpoint.pt`); lectura con `weights_only=True` |

## Arquitectura y entrenamiento

La politica y la funcion de valor son dos perceptrones multicapa independientes de 256 x 256 con activacion Tanh. La politica produce acciones deterministas mediante `tanh(mean)` en la evaluacion, con un rango de accion de ±0,4. Las observaciones (348 dimensiones) se normalizan con media y desviacion tipicas en ejecucion (running mean/std) y se recortan a ±10; el autor advierte explicitamente que omitir esta normalizacion impide reproducir las acciones. El espacio de acciones tiene 17 dimensiones, correspondientes a las articulaciones del humanoide de MuJoCo.

El entrenamiento usa PPO implementado a mano con los siguientes hiperparametros: 32 entornos paralelos, rollout de 2048 pasos (65.536 pasos por iteracion), learning rate 3e-4, gamma 0,99, GAE lambda 0,95, clip 0,2, 10 epochs, minibatch de 4096, coeficiente de entropia 0, coeficiente de valor 0,5 y recorte de gradiente 0,5. La desviacion estandar logaritmica inicial es -0,5 y la semilla 0. El entrenamiento se realizo en dos fases de 5 millones de "peticiones" cada una: en la primera se selecciono el mejor modelo y en la segunda se continuo desde ese modelo, su optimizador y sus estadisticas de observacion, acumulando 9.961.472 pasos de entorno reales (4.980.736 por fase). Todo el proceso se ejecuto en CPU con Python 3.11.

## Capacidades

- Control motor continuo: genera acciones de 17 dimensiones para un humanoide simulado en MuJoCo.
- Locomocion bípeda estable: mantiene la marcha durante los 1000 pasos del episodio en el 100 % de los episodios evaluados (20 de 20).
- Politica determinista: evaluacion con `tanh(mean)`, sin muestreo estocastico, lo que facilita la reproducibilidad.
- Reproducibilidad completa: incluye pesos, estadisticas de normalizacion, configuracion, semillas de evaluacion y codigo de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni procesamiento de lenguaje natural.
- No es multilingue en sentido funcional: el unico idioma presente es el coreano de la documentacion.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el notebook H01-H06 permite ejecutar el entrenamiento y la evaluacion en Colab sin GPU ni tokens, usando el modelo como referencia de una implementacion PPO correcta.
- Baseline reproducible para investigacion en control continuo: sirve para comparar nuevas variantes de PPO, cambios de reward shaping o metodos de normalizacion de observaciones contra una politica con puntuacion media documentada de 5982,5 ± 42,5.
- Verificacion de pipelines de RL: al incluir `training_checkpoint.pt` con el estado del optimizador, permite reanudar el entrenamiento y validar que un pipeline de reanudacion reproduce la curva de aprendizaje.
- Generacion de demostraciones visuales: el script `humanoid_policy.py` y el `replay.mp4` permiten renderizar videos de la marcha para materiales divulgativos o presentaciones.
- Pruebas de integracion con Gymnasium/MuJoCo: util para validar versiones de MuJoCo (3.3.7), Gymnasium (1.4.0) y PyTorch (2.6.0) en entornos de CI, comprobando que la politica mantiene el rendimiento esperado.
- Estudio de sensibilidad a la normalizacion: la dependencia explicita de las estadisticas de observacion lo convierte en un caso practico para analizar el impacto de omitir el running mean/std en la inferencia.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Entorno | Gymnasium Humanoid-v5 (configuracion por defecto) |
| Algoritmo | PPO propio, accion determinista `tanh(mean)` |
| Evaluacion (semillas 20000-20019) | 5982,5 ± 42,5 puntos de media |
| Minimo / maximo en evaluacion | 5889,8 / 6065,1 |
| Episodios completados | 20 de 20 (1000 pasos cada uno) |
| Semilla de demostracion 4242 | 6050,7 puntos en 1000 pasos |
| Pasos de entorno de entrenamiento | 9.961.472 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el autor indica que el entrenamiento y la evaluacion se ejecutaron en CPU; una MLP de 256 x 256 con 348 entradas es viable en cualquier CPU moderna.
- VRAM estimada: no disponible; el checkpoint es un tensor de PyTorch de pocos megabytes y no requiere GPU.
- GPU recomendadas: no aplica; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede ejecutarlo, pero no es necesario.
- Despliegue: carga directa con `torch.load(..., weights_only=True)` y el modulo `humanoid_policy.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del paso de simulacion de MuJoCo y de la CPU.
- Colab: el notebook funciona en CPU, con OSMesa necesario para renderizar video en el entorno H01.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-MOBLEY-v1-humanoid | PPO, MLP 256x256 | Humanoid-v5 | 5982,5 ± 42,5 (20 episodios) | no disponible | Hugging Face |
| Politicas de referencia de Stable-Baselines3 | PPO, MLP | Humanoid-v3/v4 | no disponible en la informacion proporcionada | MIT (SB3) | GitHub |
| CleanRL PPO Humanoid | PPO, MLP | Humanoid-v4 | no disponible en la informacion proporcionada | MIT (CleanRL) | GitHub |

No se dispone de datos verificables de rendimiento de las alternativas en la informacion proporcionada; la comparacion se limita al tipo de algoritmo, entorno y licencia.

## Limitaciones y advertencias

- Generalizacion no evaluada: el autor indica explicitamente que no se ha medido el rendimiento en otros entornos ni con obstaculos; la politica esta ajustada a Humanoid-v5 con configuracion por defecto.
- Dependencia critica de la normalizacion: sin las estadisticas de observacion (running mean/std y recorte a ±10) no se reproducen las acciones; es un requisito de despliegue, no opcional.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en productos.
- Ambito limitado: no es un modelo de lenguaje ni un agente general; no procesa texto, imagenes ni audio.
- Documentacion en coreano: la model card y el notebook estan en coreano, lo que puede dificultar su adopcion por equipos no coreanoparlantes.
- Reproducibilidad dependiente del entorno: el autor advierte que los tiempos de entrenamiento y los resultados pueden variar segun la maquina y las versiones de las librerias.
- Sin garantia del autor original: la model card aclara que el creador del material didactico original (Connect AI LAB) no avala el rendimiento de este modelo.
- Riesgo de sobreajuste al simulador: al tratarse de una politica entrenada en MuJoCo, no hay evidencia de transferencia a robotica real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobley33/connectailab-rl-MOBLEY-v1-humanoid
- Notebook en Colab: https://huggingface.co/mobley33/connectailab-rl-MOBLEY-v1-humanoid/colab
- Video de demostracion: https://huggingface.co/mobley33/connectailab-rl-MOBLEY-v1-humanoid/resolve/main/replay.mp4
- Entorno Gymnasium Humanoid-v5: https://gymnasium.farama.org/environments/mujoco/humanoid/
- Edicion del README: https://huggingface.co/mobley33/connectailab-rl-MOBLEY-v1-humanoid/edit/main/README.md
