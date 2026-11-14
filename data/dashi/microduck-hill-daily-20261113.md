# dashi/microduck-hill-daily-20261113

## Resumen
microduck-hill-daily-20261113 es una política de control (policy) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada por el usuario dashi en Hugging Face. No se trata de un modelo de lenguaje, sino de una policy de aprendizaje por refuerzo que genera comandos de locomocion a 50 Hz para el slot `walk` del robot, a partir de observaciones de 61 dimensiones y produciendo 14 acciones. El artefacto principal es un fichero `policy.onnx` con el normalizador de observaciones integrado, por lo que el robot consume directamente observaciones en bruto.

El modelo es un reentreno diario ("daily re-entry") de la política `dashi/microduck-hill-remix-r752`, que reportaba una puntuación de 0.749, y constituye un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`. La model card lo describe como una política perpetua: una vez cargada, el robot ejecuta la marcha de forma continua hasta recibir otra orden. El repositorio es de tamano practicamente nulo (0.0 GB), lo que es coherente con una red neuronal pequena exportada a ONNX para inferencia en tiempo real embebida.

Su relevancia es acotada pero clara para quien trabaja con robótica de bajo coste y RL aplicado: demuestra un flujo de trabajo reproducible de entrenamiento, exportación ONNX y despliegue sobre hardware real mediante el comando `robotctl policy load`. No hay información pública sobre arquitectura de red, número de parámetros ni datos de entrenamiento más allá de la rama y el commit del repositorio de entrenamiento.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal exportada a ONNX; no se especifica transformer, MLP ni CNN) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (artefacto distribuido en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones integrado; metadatos en `manifest.json` (schema 2) |

Parámetros operativos adicionales:
| Parametro | Valor |
|---|---|
| Tipo de modelo | Política de aprendizaje por refuerzo (reinforcement-learning) |
| Tarea / pipeline | robotics |
| Slot del robot | `walk` |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Modelo base | jrubiosainz/microduck-game-hillclimber-remix6 (finetune) |
| Repositorio de entrenamiento | pollen-robotics/microduck_rl, rama `roll-backward`, commit `83599404a` |
| Libreria | microduck |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna de la red (capas, tipo de encoder, función de activación ni tamaño). Lo que sí se documenta es la interfaz: la política recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, lo que encaja con un controlador de locomoción para un robot cuadrúpedo de pequeñas dimensiones. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor no necesita replicar el preprocesado por separado.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. La model card indica que se trata de un reentreno diario de `dashi/microduck-hill-remix-r752` (puntuación 0.749) y de un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`. No se especifican número de tokens, episodios, composición del dataset, algoritmo de RL concreto (PPO, SAC u otro) ni si hubo ajuste fino supervisado posterior. La etiqueta `reinforcement-learning` confirma el paradigma, pero no el detalle metodológico.

## Capacidades
- Generación de comandos de locomoción continua para el robot microduck en el slot `walk`.
- Política perpetua: mantiene la marcha indefinidamente hasta que se cargue otra política en el slot.
- Consumo de observaciones en bruto de 61 dimensiones, sin preprocesado externo, gracias al normalizador embebido.
- Emisión de 14 acciones de control a 50 Hz, adecuada para bucles de control en tiempo real.
- Exportación ONNX, lo que permite inferencia portable en el runtime del robot y en herramientas compatibles con ONNX.
- Integración con el daemon del robot mediante `robotctl policy load walk <modelo>`.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso
- Locomoción autónoma en el robot microduck: cargar la política en el slot `walk` mediante `robotctl policy load walk dashi/microduck-hill-daily-20261113` para que el robot camine de forma continua. Es adecuado porque la política está entrenada específicamente para ese slot y frecuencia de control.
- Demostración educativa de RL aplicado a robótica: sirve como artefacto final de un pipeline de entrenamiento en `microduck_rl` que estudiantes pueden reproducir y comparar con la política base.
- Evaluación comparativa de políticas: al ser un reentreno diario con puntuación de referencia (0.749 de la versión anterior), permite medir regresiones o mejoras frente a `dashi/microduck-hill-remix-r752` en el mismo robot.
- Investigación en robustez de marcha: la política perpetua permite dejar el robot caminando durante periodos largos para observar deriva, caídas o recuperación, útil para estudiar estabilidad de controladores RL.
- Integración en pipelines de CI para robótica: al distribuirse como ONNX con normalizador integrado, se puede validar la inferencia en un entorno simulado o en un runner antes de desplegarla en hardware.
- Prototipado rápido sobre hardware real: el comando `robotctl` reduce el despliegue a una línea, lo que facilita iterar sobre variantes de política sin recompilar el daemon.
- Base para finetunes propios: al ser un finetune de `microduck-game-hillclimber-remix6`, puede servir como punto de partida para ajustes adicionales en tareas de terreno o estilos de marcha.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una puntuación de 0.749 asociada a la política predecesora `dashi/microduck-hill-remix-r752`, sin detallar la métrica, el entorno de evaluación ni el protocolo de medida. No se dispone de cifras para esta versión concreta.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. Al ser una política de control exportada a ONNX y de repositorio de 0.0 GB, se espera que quepa en memoria embebida del robot, pero no se confirma en la información disponible.
- GPU recomendadas: no disponible. No se documenta entrenamiento ni inferencia en GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime del daemon de microduck mediante `robotctl policy load walk <modelo>`; inferencia ONNX en herramientas compatibles con ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: se especifica una frecuencia de control de 50 Hz, lo que implica un presupuesto de 20 ms por paso de control; no se publican cifras de latencia real ni throughput medidos.

## Comparativa con modelos similares
| Modelo | Tipo | Slot | Frecuencia | Observacion / acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dashi/microduck-hill-daily-20261113 | Política RL (ONNX) | walk | 50 Hz | 61 / 14 | no disponible | Hugging Face, 0 descargas |
| dashi/microduck-hill-remix-r752 | Política RL | walk | 50 Hz (según predecesor) | 61 / 14 (según predecesor) | no disponible | Hugging Face (referenciado en la model card) |
| jrubiosainz/microduck-game-hillclimber-remix6 | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de la puntuación 0.749 atribuida a `dashi/microduck-hill-remix-r752`. No se conocen alternativas de otros autores con especificaciones públicas suficientes para una comparación rigurosa.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts ni soporta tool calling. Cualquier uso fuera del control del robot microduck no está contemplado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia antes de desplegarlo en producción.
- Idiomas no disponibles: irrelevante para su función, pero confirma que no hay soporte multilingüe.
- Arquitectura y número de parámetros no documentados: dificulta estimar consumo de memoria y validar el artefacto de forma independiente.
- Sin datos de benchmarks propios: la puntuación 0.749 corresponde a la política predecesora, no a esta versión; no se puede afirmar que esta sea mejor o peor.
- Repositorio de 0.0 GB y 0 descargas: el artefacto es muy pequeño y sin tracción comunitaria, por lo que no hay validación externa ni reportes de uso en hardware real.
- Naturaleza "perpetua" de la política: una vez cargada, el robot camina hasta que se le indique lo contrario; en entornos reales esto exige mecanismos externos de parada y supervisión.
- Dependencia del daemon y del manifest schema 2: cambios de versión en el daemon o en el esquema del manifest pueden romper la carga.
- Entrenamiento sobre un modelo base de terceros: hereda las limitaciones y posibles sesgos de `jrubiosainz/microduck-game-hillclimber-remix6`, que no están documentados.
- Sin información sobre robustez ante terrenos no vistos, caídas o perturbaciones: no hay evidencia publicada de generalización fuera del entorno de entrenamiento.

## Enlaces
- Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261113
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Política predecesora citada: https://huggingface.co/dashi/microduck-hill-remix-r752
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (sin URL directa en la información disponible)
- Documentación del manifest de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
