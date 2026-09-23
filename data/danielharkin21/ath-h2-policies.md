# danielharkin21/ath-h2-policies

## Resumen

ATH H2 policies es un repositorio de politicas de control (policies) exportadas a ONNX para un robot humanoide Unitree H2 que aprende a jugar al tenis en el simulador MuJoCo. Lo publica el usuario danielharkin21 y no es un modelo de lenguaje ni un modelo generativo multimodal: es un conjunto de pesos de una politica de aprendizaje por refuerzo (reinforcement learning) destinada a control continuo de un cuerpo humanoide. El entrenamiento se hizo en Kaggle con MJX en float32 y el algoritmo PPO de la libreria brax, y la validacion se realizo con un oraculo MuJoCo en CPU a float64.

El interes practico esta en que expone artefactos listos para evaluar en simulacion con una separacion explicita entre politicas "validadas" y politicas solo "de exhibicion". Segun la propia model card, una politica solo se marca como validada si supera el oraculo float64; el resto, como `stand/v3`, se ofrece unicamente para visualizacion porque falla ese oraculo (cae en menos de 3 segundos ante empujes). Esa honestidad metodologica es relevante para quien investiga transferencia sim-a-real en humanoides.

No se publican datos sobre la arquitectura de red concreta, el numero de parametros, el contexto (concepto no aplicable a una politica de control) ni el idioma. El repositorio ocupa 0,0 GB, tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y esta bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo exportada a ONNX; el autor no detalla capas ni tamano de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control continuo, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (artefactos distribuidos como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`policy.onnx`), acompanado de `spec.json` y `metadata.json` |
| Tarea | reinforcement-learning (control de humanoide, tenis) |
| Entorno de entrenamiento | MJX (float32) sobre Kaggle, con brax PPO |
| Validacion | oraculo MuJoCo en CPU a float64 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor describe un flujo de trabajo de aprendizaje por refuerzo sobre un humanoide Unitree H2 en MuJoCo. El entrenamiento se ejecuto en Kaggle usando MJX (la implementacion acelerada de MuJoCo en JAX) en precision float32 junto con el algoritmo PPO de brax. El resultado se exporta a ONNX, un formato de grafo portable que permite ejecutar la politica fuera del entorno de entrenamiento, por ejemplo con ONNX Runtime en CPU o integrada en un simulador de control.

La innovacion metodologica destacable no esta en la topologia de red (no documentada), sino en el protocolo de validacion: ademas del entorno de entrenamiento en float32, el autor evalua las politicas en un oraculo MuJoCo independiente ejecutado en CPU con precision float64. Esto sirve para detectar politicas que funcionan por artefactos numericos del entrenador acelerado pero que no son robustas. La model card es explicita al respecto: `stand/v3`, la primera politica de mantenerse de pie, se incluye solo a efectos de visualizacion porque no supera ese oraculo y cae en menos de 3 segundos bajo empujes. No se especifican el numero de tokens ni pasos de entrenamiento, la composicion del dataset de experiencias, ni si hubo etapas de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de control).

## Capacidades

- Control locomotor de un humanoide Unitree H2 en el simulador MuJoCo.
- Ejecucion de una tarea de tenis: la model card menciona politicas de "ball-contact" (contacto con la pelota), escritas en vivo por el kernel de entrenamiento tras cada evaluacion.
- Mantenerse de pie (tarea `stand`), aunque la version `v3` no supera el oraculo float64.
- Inferencia portable mediante ONNX, con un `spec.json` que define el layout exacto de observaciones y acciones.
- Trazabilidad de validacion: `metadata.json` reporta los resultados de validacion de forma explicita.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue: no es un modelo de lenguaje.

## Casos de uso

- Validacion sim-a-sim de politicas de refuerzo: cargar `best/policy.onnx` y `spec.json` en MuJoCo y comprobar que la politica reproduce el comportamiento esperado en float64, replicando el oraculo del autor antes de dar por buena cualquier politica.
- Investigacion en transferencia sim-a-real para humanoides: usar estas politicas como punto de partida o referencia para estudiar que rasgos de una politica entrenada en MJX sobreviven al cambio de precision y de motor de simulacion, un paso previo habitual antes de desplegar en hardware Unitree H2.
- Reproduccion de experimentos de RL con brax PPO: el repositorio documenta la cadena Kaggle + MJX float32 + oraculo float64, lo que permite reconstruir el pipeline y comparar variantes de hiperparametros.
- Desarrollo de tareas de contacto dinamico (tenis, raqueta, golpeo de objetos): las politicas `ball-contact` sirven como base para estudiar control fino en el instante de impacto, donde el margen de error es minimo.
- Integracion en herramientas de visualizacion y demos web: al estar en ONNX, la politica puede ejecutarse con ONNX Runtime en un navegador o en un backend ligero para reproducir la demo que muestra el sitio ATH, sin necesidad de GPU.
- Benchmark interno de robustez: someter las politicas a empujes externos y perturbaciones en simulacion para caracterizar su margen de estabilidad, dado que el propio autor usa ese criterio (caida en menos de 3 segundos) para descartar `stand/v3`.
- Docencia y formacion en robotica: el repositorio separa claramente politica validada, politica en entrenamiento y politica de exhibicion, lo que lo convierte en un ejemplo didactico de gestion de artefactos y criterios de aceptacion en RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas comparables tipo MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo) ni cifras de recompensa, tasa de exito o tiempo de supervivencia mas alla de la afirmacion cualitativa sobre `stand/v3`.

Lo unico documentado es el estado de validacion de cada artefacto, que se resume a continuacion a partir de la model card:

| Artefacto | Descripcion | Estado de validacion |
|---|---|---|
| `best/` | Politica que muestra el sitio ATH (`policy.onnx`, `spec.json`, `metadata.json`) | Validada (supera el oraculo float64, segun la model card) |
| `ball-contact/latest/` | Escrita en vivo por el kernel tras cada evaluacion | No especificado |
| `ball-contact/best/` | Mejor version de contacto con la pelota | No especificado |
| `stand/v3/` | Primera politica de mantenerse de pie | No validada: falla el oraculo float64 y cae en menos de 3 s bajo empujes; solo para visualizacion |

## Requisitos de hardware

- Al ser un artefacto ONNX de una politica de control, la inferencia no requiere GPU: puede ejecutarse en CPU con ONNX Runtime o con el simulador MuJoCo.
- VRAM estimada para inferencia: no disponible. No se publica el tamano del grafo ni el numero de parametros, por lo que no puede calcularse una cifra fiable.
- GPU recomendadas: no disponibles. El entrenamiento se realizo en Kaggle con MJX (JAX), pero el autor no detalla la GPU empleada.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de inferencia de una politica de control, es previsible que quepa en cualquier GPU, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime para la politica exportada; MuJoCo (incluido MuJoCo en CPU a float64) para el entorno de simulacion; MJX sobre JAX y brax para reentrenamiento o evaluacion masiva.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no referencia otros repositorios de politicas para humanoides ni modelos comparables en la misma categoria (control de tenis sobre Unitree H2). No se dispone de datos de parametros, contexto ni rendimiento de alternativas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no procesa idiomas. Cualquier expectativa de ese tipo es inaplicable.
- Las politicas solo han sido evaluadas en simulacion (MuJoCo, y MJX para el entrenamiento). No hay evidencia publicada de transferencia a hardware real.
- La precision importa: parte del valor del repositorio es precisamente que algunas politicas no sobreviven al cambio de float32 a float64. `stand/v3` esta marcada como no validada y cae en menos de 3 segundos bajo empujes.
- Robustez limitada ante perturbaciones: el unico criterio de robustez documentado son los empujes, y al menos una politica no los supera.
- Riesgo de sobreajuste al entrenador: no se documentan dominios de aleatorizacion, rango de condiciones iniciales ni diversidad de escenarios, por lo que se desconoce la generalizacion fuera del entorno de entrenamiento.
- Sesgos: no aplica en el sentido habitual de sesgos de datos textuales; en cambio, puede haber sesgos de dinamica (comportamientos que dependen de la fisica concreta de MuJoCo).
- Restricciones de licencia: MIT, lo que permite uso comercial y modificacion con atribucion; conviene verificar igualmente las licencias de las dependencias (MuJoCo, MJX, brax) y del propio robot Unitree H2, ajenas a este repositorio.
- Madurez: 0 descargas y 0 likes, repositorio creado y actualizado el mismo dia (23 de septiembre de 2026) y sin publicaciones asociadas. No debe tratarse como un artefacto estable de produccion.
- Documentacion incompleta: no se publican detalles de arquitectura, numero de parametros, curvas de entrenamiento ni metricas cuantitativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielharkin21/ath-h2-policies
- Perfil del autor: https://huggingface.co/danielharkin21
- Listado de modelos del autor: https://huggingface.co/danielharkin21/models
- MuJoCo (entorno de simulacion): https://mujoco.org/
- brax (PPO y entrenamiento en JAX): https://github.com/google/brax
- MJX (MuJoCo en JAX): https://github.com/google-deepmind/mujoco/tree/main/mjx
- ONNX Runtime: https://onnxruntime.ai/

No se han encontrado papers, blogs tecnicos ni demos adicionales especificos de este modelo en la busqueda web realizada.
