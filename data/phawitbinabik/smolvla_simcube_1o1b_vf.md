# phawitbinabik/smolvla_SIMCUBE_1O1B_VF

## Resumen

`phawitbinabik/smolvla_SIMCUBE_1O1B_VF` es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, un modelo vision-language-action (VLA) compacto orientado al control de robots. Lo publica el usuario `phawitbinabik` en Hugging Face y está entrenado con el dataset `phawitbinabik/SIMCUBE_1O1B_VF` mediante la librería LeRobot. El modelo resuelve el problema de mapear observaciones visuales y estado del robot a acciones de control de bajo nivel, permitiendo desplegar políticas de manipulación robótica en hardware de consumo.

SmolVLA, descrito en el paper arXiv:2506.01844, es una arquitectura VLA eficiente que combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones, con el objetivo de lograr rendimiento competitivo a coste computacional reducido. Este checkpoint concreto tiene 450.292.449 parámetros (~0,45B) y un tamaño de repositorio de 0,9 GB en formato safetensors, lo que lo sitúa en la gama de modelos desplegables en GPU de consumo.

La relevancia de esta ficha es acotada: se trata de un checkpoint derivado de un dataset específico (SIMCUBE_1O1B_VF), sin descargas ni interacciones en el momento de la consulta, y con información pública limitada a la model card estándar de LeRobot. No sustituye al modelo base para usos generales, sino que está especializado en la tarea y distribución de datos con la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); segun el paper SmolVLA, codificador visual + modelo de lenguaje + decodificador de acciones (detalle exacto no disponible en la informacion proporcionada) |
| Parametros totales | 450.292.449 (~0,45B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `lerobot/smolvla_base` sobre el dataset `phawitbinabik/SIMCUBE_1O1B_VF`, realizado con LeRobot. SmolVLA, segun el paper referenciado (arXiv:2506.01844), es un modelo vision-language-action compacto que procesa entradas visuales y de estado para producir acciones de control. La model card no detalla la composicion interna exacta (dimensiones del codificador visual, numero de capas del componente de lenguaje ni estrategia de fusion), por lo que esos datos se consideran no disponibles.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset SIMCUBE_1O1B_VF, ni sobre si se aplicaron tecnicas de RLHF/DPO. El entrenamiento se realizo mediante el flujo estandar de LeRobot (`lerobot-train`), y la evaluacion mediante `lerobot-record` con un robot tipo `so100_follower`. No se documentan innovaciones tecnicas adicionales especificas de este checkpoint.

## Capacidades

- Generacion de acciones de control roboticos a partir de observaciones visuales y estado del robot (policy de imitacion).
- Percepcion visual integrada: el componente vision-language permite condicionar las acciones en imagenes de camara.
- Ejecucion de politicas de manipulacion entrenadas sobre el dataset SIMCUBE_1O1B_VF.
- Integracion nativa con el ecosistema LeRobot (entrenamiento, evaluacion y despliegue).
- Compatibilidad con robots del tipo `so100_follower` en el flujo de evaluacion documentado.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni audio en la informacion disponible.

## Casos de uso

- Manipulacion robotica en simulacion o laboratorio: el modelo ejecuta una politica de imitacion entrenada sobre SIMCUBE_1O1B_VF, adecuada para reproducir tareas demostradas en el dataset.
- Evaluacion de politicas con LeRobot: se puede usar `lerobot-record` con `--policy.path` apuntando a este checkpoint para medir el rendimiento en 10 episodios sobre un `so100_follower`.
- Punto de partida para fine-tuning adicional: al ser un checkpoint derivado de `smolvla_base`, sirve como inicializacion para nuevos datasets con caracteristicas similares.
- Prototipado en hardware de consumo: sus ~0,45B parametros y 0,9 GB de pesos permiten iterar en estaciones de trabajo con GPU de gama media.
- Investigacion en VLA compactos: util para comparar el efecto de distintos datasets (como SIMCUBE_1O1B_VF) sobre el modelo base.
- Educacion y demostraciones de robotica de imitacion: el flujo LeRobot simplifica el despliegue en entornos docentes con robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 0,9 GB; en precision completa (fp32) serian ~1,8 GB, y en fp16/bf16 ~0,9 GB. El pico real depende del codificador visual y del buffer de imagenes, no documentado.
- GPU recomendadas: no se especifican en la model card. Por tamano, es viable en GPUs de consumo con al menos 4-8 GB de VRAM.
- Cabe en GPU de consumo: si, dado el tamano de ~0,45B parametros y 0,9 GB de pesos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phawitbinabik/smolvla_SIMCUBE_1O1B_VF | ~0,45B | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| phawitbinabik/smolvla_DSCUBE_1O1B_FF_N50 | ~0,5B (segun busqueda) | no disponible | no disponible | no disponible | Hugging Face |
| phawitbinabik/smolvla_V1 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Especializacion estrecha: el checkpoint esta entrenado sobre SIMCUBE_1O1B_VF y su rendimiento fuera de esa distribucion de datos no esta documentado.
- Sin datos de evaluacion: no hay benchmarks publicados, por lo que no se puede afirmar su calidad frente al modelo base.
- Sesgos: no documentados; en modelos de robotica, los sesgos provienen de la distribucion del dataset de demostracion (posiciones, objetos, iluminacion, camara).
- Riesgo de alucinacion de acciones: en VLA, el modelo puede generar acciones no validas o inseguras si se sale de la distribucion de entrenamiento.
- Idiomas: no se documenta soporte multilingue; el modelo no esta orientado a texto general.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset utilizado.
- Advertencia de produccion: no se recomienda desplegar en robots reales sin validacion exhaustiva en entorno controlado, dado que no hay metricas publicadas de exito ni de seguridad.
- Repositorio con 0 descargas y 0 likes: escasa validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/smolvla_SIMCUBE_1O1B_VF
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/phawitbinabik/SIMCUBE_1O1B_VF
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Checkpoint relacionado: https://huggingface.co/phawitbinabik/smolvla_DSCUBE_1O1B_FF_N50
- Checkpoint relacionado: https://huggingface.co/phawitbinabik/smolvla_V1
