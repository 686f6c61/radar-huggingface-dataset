# QingMuLYL/microduck-standup

## Resumen

microduck-standup es una política de control entrenada mediante aprendizaje por refuerzo para el robot microduck de Pollen Robotics. Se distribuye como un único fichero `policy.onnx` acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. No es un modelo de lenguaje: es un controlador reactivo de extremo a extremo que mapea observaciones de 61 dimensiones a 14 acciones, ejecutado a 50 Hz.

Su comportamiento es episódico: al activarse, ejecuta una secuencia de 6,0 segundos cuyo objetivo es devolver al robot a una postura de pie. Esto lo convierte en una habilidad de recuperación (levantarse tras una caída) dentro de una pila de control mayor, no en un modelo de propósito general.

La relevancia de esta ficha es acotada pero clara: ejemplifica el patrón actual de distribuir habilidades robóticas entrenadas con RL como artefactos ONNX portables, listos para desplegar en robot real mediante una CLI (`robotctl`). Sus descargas son 0 y los likes 1, y no se ha publicado información sobre licencia, idiomas ni benchmarks, por lo que debe tratarse como un artefacto experimental de alcance muy limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política neuronal de control para robótica (aprendizaje por refuerzo); topología interna no disponible |
| Parametros totales | no disponible (no se publica recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; política episódica con observación de 61 dimensiones por paso, control a 50 Hz y episodio de 6,0 s |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es un ONNX sin cuantizaciones alternativas publicadas |
| Idiomas soportados | no aplica (no procesa lenguaje natural); metadatos de idioma no disponibles |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información publicada no describe la topología interna de la red (número de capas, anchura, tipo de capa ni función de activación). Lo que sí se especifica es la interfaz del controlador: entrada de observación de 61 dimensiones y salida de 14 acciones, con bucle de control a 50 Hz. La normalización de las observaciones está incorporada dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto, sin preprocesado adicional.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `develop`, commit `982b8f889`. El propio autor advierte que el export se generó desde un checkout con cambios sin confirmar, lo que limita la reproducibilidad exacta del binario publicado. No se detallan el número de pasos de entrenamiento, la composición del dataset, el simulador empleado ni si hubo ajuste posterior (RLHF/DPO no aplica en este dominio). El carácter episódico (6,0 s y retorno a postura de pie) sugiere una tarea de recuperación con condición de terminación fija, pero no se publican detalles del diseño de recompensa.

## Capacidades

- Control de locomoción/reanimación del robot microduck: ejecuta una política de 14 acciones para volver a una postura de pie.
- Comportamiento episódico autolimitado: la habilidad dura 6,0 s y termina devolviendo al robot a la postura erguida.
- Consumo de observaciones en bruto: acepta directamente las 61 dimensiones del robot porque el normalizador está embebido en el ONNX.
- Control en tiempo real: diseñado para ejecutarse en un bucle de 50 Hz (20 ms por paso).
- Integración con la CLI de despliegue del robot (`robotctl policy add` / `robotctl robot do`).
- No soporta tool calling, function calling ni agentes multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Recuperación tras caída en despliegue real: cuando el robot pierde el equilibrio, esta política se invoca como habilidad de rescate para volver a la postura de pie en 6,0 s sin intervención humana.
- Rutina de rearme antes de iniciar otra tarea: encadenar `standup` como paso previo a políticas de marcha o manipulación, garantizando un estado inicial conocido.
- Demostraciones y educación en robótica: el comando `robotctl robot do standup` permite mostrar aprendizaje por refuerzo en hardware real con una sola línea de shell.
- Recolección de datos y evaluación de políticas: sirve como habilidad de reinicio reproducible entre episodios de otras políticas, reduciendo el tiempo de supervisión manual.
- Pruebas de transferencia sim-a-real: al ser un ONNX con observaciones en bruto, permite comparar el mismo binario en simulador y en robot físico para medir la brecha de dominio.
- Integración en una pila de control jerárquica: un planificador de alto nivel puede seleccionar `standup` como skill de recuperación cuando un detector de orientación marque al robot volcado.
- Verificación de infraestructura de despliegue: útil como política de humo para validar que el daemon, el manifiesto y la ruta de carga de ONNX funcionan antes de desplegar políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de tasa de éxito, tiempo de recuperación real, robustez ante perturbaciones ni comparaciones con otras políticas de microduck.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0.0 GB y no se publica el recuento de parámetros, pero el artefacto es un único ONNX de política con 61 entradas y 14 salidas.
- GPU recomendadas: no disponible; por la naturaleza del artefacto (control a 50 Hz con observaciones de baja dimensión), la inferencia es viable en CPU y en el cómputo embebido del propio robot.
- Viabilidad en GPU de consumo: no requiere GPU dedicada; no se publica ninguna recomendación de A100, H100 o RTX 4090.
- Opciones de despliegue: la ruta documentada es el daemon de microduck con `robotctl policy add <repo>` y `robotctl robot do <política>`; el runtime subyacente debe ser un motor de inferencia ONNX.
- Latencia y throughput: el único dato publicado es la frecuencia de control objetivo, 50 Hz, es decir, 20 ms de presupuesto por paso; no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / interfaz | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-standup | no disponible | 61-D observación, 14 acciones, 50 Hz, episodio de 6,0 s | sin benchmarks publicados | no disponible | ONNX en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otras políticas de la misma categoría con datos verificables para comparar (parámetros, contexto, rendimiento o licencia).

## Limitaciones y advertencias

- Licencia no disponible: no hay autorización explícita de uso comercial; en producción debe tratarse como artefacto sin derechos clarificados.
- Ausencia total de benchmarks: no hay evidencia publicada de tasa de éxito de la reanimación, robustez ante empujones o comportamiento en superficies distintas.
- Reproducibilidad comprometida: el export se generó desde un checkout con cambios sin confirmar sobre el commit `982b8f889`, por lo que el binario no se corresponde necesariamente con el código versionado.
- Especialización extrema: la política solo resuelve una tarea episódica de 6,0 s; no generaliza a otras habilidades ni acepta instrucciones.
- Sin información sobre sesgos o composición del dataset de entrenamiento; no puede auditarse el comportamiento fuera de la distribución de entrenamiento.
- Brecha sim-a-real desconocida: no se documentan el simulador, el dominio de aleatorización ni las condiciones de validación en hardware.
- Riesgo de fallo silencioso: si el robot no está en una configuración compatible con el inicio del episodio, no hay información publicada sobre el comportamiento de la política.
- Metadatos incompletos: sin idiomas, sin licencia y sin parámetros, lo que dificulta la evaluación formal y la trazabilidad en un catálogo de modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QingMuLYL/microduck-standup
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `develop`, commit `982b8f889`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda disponibles.
