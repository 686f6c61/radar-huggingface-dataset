# heyskylark/microduck-sprint-w2

## Resumen

Microduck-sprint-w2 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. El modelo, publicado por el usuario heyskylark, no es un modelo de lenguaje sino un controlador de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, lo que lo sitúa en el ámbito de la robótica de locomoción y no en el del procesamiento de lenguaje natural.

La política se ha entrenado con el entorno de simulación mjlab, una base de código de simulación física orientada a robótica, y se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio fichero, de modo que el robot puede alimentarse directamente con observaciones sin preprocesado adicional. El modelo se presenta como una política "perpetua": una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del daemon del robot mediante el comando `robotctl policy load`.

El interés del modelo es acotado pero específico: demuestra un flujo de trabajo completo de entrenamiento y despliegue de políticas de refuerzo para un robot de bajo coste, con trazabilidad de la configuración de entrenamiento (commit, checkpoint, semilla y comando exacto de reproducción). No hay información pública sobre licencia, idiomas ni benchmarks de rendimiento más allá de los metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con RL; formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no aplica; salida de acciones de control) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, tamaño de la representación latente). Lo que sí se documenta es la interfaz: 61 dimensiones de observación de entrada y 14 acciones de salida, ejecutadas a 50 Hz. El normalizador de observaciones está integrado en el propio `policy.onnx`, lo que implica que la red incluye el preprocesado como parte del grafo exportado y que el consumidor debe enviar observaciones en crudo.

El entrenamiento se realizó con mjlab (versión `mjlab-microduck 0.1.0`, commit `1efd853be`) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos simulados en paralelo, un máximo de 3000 iteraciones del agente, semilla 1 y checkpoint final 2700. El autor advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. Se documenta el comando exacto de reproducción, incluyendo el commit `0b7f5c1bf` del repositorio `heyskylark/microduck-challenges`.

## Capacidades

- Generación de una marcha continua ("perpetua") para el robot microduck: la política se ejecuta indefinidamente hasta que se detiene o se sustituye.
- Control de locomoción a 50 Hz con 14 acciones de salida y 61 observaciones de entrada.
- Integración con el daemon del robot mediante `robotctl policy load`, cargando la política en una ranura.
- Autocontenida en un único fichero ONNX: el normalizador de observaciones va embebido, por lo que no requiere pipeline de preprocesado externo.
- Metadatos de entrenamiento trazables mediante `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento; no aplican a este tipo de modelo.

## Casos de uso

- Locomoción autónoma del microduck en laboratorio: cargar la política en una ranura del daemon y dejar que el robot camine de forma continua mientras se evalúa la estabilidad de la marcha en distintas superficies.
- Reproducción de experimentos de RL en robótica: usar el comando documentado, el commit y la semilla para regenerar una política comparable y comparar variaciones del entrenamiento.
- Punto de partida para fine-tuning o ajuste de tareas: emplear la política y el entorno `Mjlab-Sprint2m-MicroDuck` como base para entrenar variantes (velocidad, terreno, carga) con mjlab.
- Docencia y demostraciones de simulación a realidad: ilustrar el ciclo completo simulación (4096 entornos) → exportación ONNX → despliegue en hardware de bajo coste.
- Validación de la infraestructura de políticas de microduck: probar el flujo `robotctl policy load` y el esquema 2 de `manifest.json` en un robot real o en un banco de pruebas.
- Investigación en control continuo: analizar el comportamiento de una política de marcha perpetua frente a políticas episódicas, midiendo deriva, consumo y estabilidad a largo plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la configuración de entrenamiento (4096 entornos, 3000 iteraciones máximas, checkpoint 2700, semilla 1) y advierte de la no reproducibilidad bit a bit, pero no incluye métricas de recompensa, velocidad de marcha, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB según HuggingFace, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponible. Para el entrenamiento se emplearon 4096 entornos simulados en paralelo, lo que en la práctica requiere una GPU de gama alta (A100, H100 o similar) para completar 3000 iteraciones en un tiempo razonable, aunque el autor no especifica el hardware utilizado.
- Ejecución en GPU de consumo: no confirmado. Dado el tamaño aparentemente reducido del artefacto ONNX, es plausible que la inferencia quepa en GPU de consumo e incluso en CPU, pero no hay datos que lo verifiquen.
- Opciones de despliegue: el destino previsto es el daemon de microduck mediante `robotctl policy load`; el formato ONNX permite inferencia con ONNX Runtime en otras plataformas.
- Latencia y throughput: no disponible. La política opera a 50 Hz (periodo de 20 ms por ciclo de control), pero no se publican latencias medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables para el microduck ni para robots de la misma categoría, y no se dispone de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Entrenamiento no reproducible bit a bit: el propio autor advierte de que repetir el comando produce una política comparable, no los mismos pesos.
- Ámbito muy restringido: es una política de marcha para un robot concreto (microduck) con una interfaz fija de 61 observaciones y 14 acciones; no es reutilizable fuera de ese hardware o de ese entorno de simulación.
- Sin datos de robustez: no se documentan pruebas en terrenos variados, con cargas, perturbaciones o fallos de sensores, por lo que se desconoce el comportamiento fuera de las condiciones de entrenamiento.
- Sin métricas publicadas: la ausencia de benchmarks impide evaluar la calidad de la marcha frente a alternativas.
- Riesgo de deriva en ejecución perpetua: al ser una política continua sin condición de parada explícita, es necesario definir mecanismos externos de supervisión y parada de seguridad.
- Sesgos y alucinaciones: no aplican en el sentido habitual de los modelos de lenguaje, pero sí existe el riesgo de comportamientos no previstos fuera de la distribución de entrenamiento.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heyskylark/microduck-sprint-w2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `git@github.com:heyskylark/microduck-challenges.git` (commit `0b7f5c1bf`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (no se proporciona URL directa)
