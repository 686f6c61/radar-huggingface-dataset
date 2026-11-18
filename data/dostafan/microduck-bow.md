# dostafan/microduck-bow

## Resumen

`dostafan/microduck-bow` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de comportamiento que ejecuta una reverencia (bow) con flexión de rodillas (plié), donde la profundidad del movimiento sigue una instrucción de comando continua entre 0 (posición erguida) y 1 (reverencia completa). El modelo se distribuye en formato ONNX con la normalización de observaciones integrada en el propio grafo.

La política opera a 50 Hz sobre un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, y está diseñada como comportamiento "perpetuo": mantiene la postura hasta recibir una nueva instrucción, momento en el que el daemon del robot gestiona `command.idle` durante 1,5 segundos antes de devolver el control a la marcha. Se integra en el ecosistema del daemon microduck mediante un manifiesto de política en esquema 2.

El repositorio tiene un tamaño de 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto reciente o de uso interno. La información pública disponible es muy limitada: no se especifican licencia, idiomas ni resultados de benchmarks, y la model card se limita a instrucciones de despliegue y notas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de aprendizaje por refuerzo exportada a ONNX) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | No disponible (distribución en ONNX; la normalización de observaciones está integrada en `policy.onnx`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Pipeline declarado | robotics |
| Librería | microduck |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal (número de capas, tipo de capas, función de activación ni tamaño). Lo que sí se especifica es que se trata de una política entrenada con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `bow`, commit `0daab160d`, y que fue exportada desde un checkout con cambios sin confirmar. La política se exporta a ONNX con la normalización de observaciones incorporada en el grafo, de modo que el consumidor debe alimentar observaciones en crudo.

El comportamiento entrenado es una reverencia con flexión de rodillas cuya profundidad es paramétrica y sigue una señal de comando continua en el rango [0, 1]. La política es "perpetua": una vez iniciada, mantiene la postura indefinidamente hasta que el daemon la interrumpe, aplicando `command.idle` durante 1,5 segundos antes de ceder el control al sistema de marcha. No se han publicado detalles sobre el número de tokens o episodios de entrenamiento, la composición del dataset, ni el uso de técnicas como RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Ejecución de una reverencia con flexión de rodillas (plié) controlada por una señal de profundidad continua de 0 a 1.
- Mantenimiento de la postura de forma indefinida hasta recibir una nueva instrucción (comportamiento perpetuo).
- Transición coordinada con el sistema de marcha del robot mediante `command.idle` de 1,5 segundos.
- Control a 50 Hz sobre 14 acciones a partir de 61 dimensiones de observación.
- Integración con el daemon microduck a través de `robotctl` y del manifiesto de políticas en esquema 2.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica el pipeline de inferencia.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio, ya que no es un modelo de lenguaje.

## Casos de uso

- Demostraciones interactivas de robótica: el modelo permite que el microduck ejecute una reverencia como gesto de saludo o cortesía en exhibiciones públicas, con profundidad ajustable según el contexto.
- Animación de personajes robóticos: la señal de comando continua de 0 a 1 permite sincronizar la reverencia con audio, música o guiones de una performance, modulando la profundidad en tiempo real.
- Investigación en aprendizaje por refuerzo: sirve como ejemplo de política entrenada con `microduck_rl` y exportada a ONNX, útil para estudiar el pipeline completo de entrenamiento, exportación y despliegue en el daemon.
- Pruebas de integración del daemon: al ser una política perpetua con transición vía `command.idle`, resulta adecuada para validar el ciclo de vida de políticas en `robotctl` y el comportamiento de retorno a la marcha.
- Educación y talleres de robótica: el comando `robotctl policy add bow dostafan/microduck-bow --hold <segundos>` permite a estudiantes desplegar una política preentrenada con una sola orden.
- Prototipado de gestos corporales: la estructura de manifiesto y el formato ONNX facilitan combinar esta política con otras (por ejemplo, saludos o poses) en secuencias de comportamiento más complejas.
- Validación de control de bajo nivel: con 14 acciones a 50 Hz, puede emplearse para evaluar la respuesta de los actuadores del microduck ante consignas de postura sostenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Por el tamaño aparente y el formato ONNX, es probable que la inferencia pueda ejecutarse en CPU o en GPU de gama baja, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican requisitos.
- Opciones de despliegue: el despliegue previsto es mediante el daemon microduck y la herramienta `robotctl` (`robotctl policy add bow dostafan/microduck-bow --hold <segundos>`). El runtime de inferencia debe soportar ONNX; no se detallan otros backends como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la política opera a 50 Hz, pero no se publican métricas de tiempo de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables para el microduck ni modelos de la misma categoría con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Información pública muy escasa: no se especifican licencia, idiomas, arquitectura ni número de parámetros, lo que impide evaluar su idoneidad para uso comercial.
- Licencia no disponible: no puede asumirse permiso para uso comercial, redistribución o modificación; es necesario contactar con el autor.
- Exportación desde un checkout con cambios sin confirmar (commit `0daab160d` con modificaciones locales), lo que puede afectar a la reproducibilidad del entrenamiento.
- Comportamiento perpetuo: la política mantiene la postura hasta que se interrumpe; un uso incorrecto sin la gestión de `command.idle` de 1,5 segundos podría dejar el robot bloqueado en la reverencia.
- Específica del hardware microduck (61 observaciones, 14 acciones, 50 Hz): no es transferible a otras plataformas robóticas sin reentrenamiento.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es errónea.
- Sin datos de sesgos, alucinación o robustez: al ser una política de control, los riesgos se refieren a fallos de ejecución física (caídas, torques excesivos) y no a sesgos cognitivos, pero no se han publicado evaluaciones de seguridad.
- Ausencia de benchmarks y de métricas de éxito del gesto: no hay evidencia cuantitativa de la precisión de la profundidad de la reverencia ni de la estabilidad postural.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria que respalde su funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dostafan/microduck-bow
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `bow`, commit `0daab160d`); no se ha proporcionado URL directa.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se ha proporcionado URL directa).
