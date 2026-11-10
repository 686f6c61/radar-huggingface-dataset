# jaippolito/microduck-getting-duckie-wit-it

## Resumen

`microduck-getting-duckie-wit-it` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse embebido en el propio robot. El autor del repositorio es el usuario de Hugging Face `jaippolito`.

La política se presenta como «perpetua»: ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario, y se carga en una ranura de políticas del demonio del robot mediante el comando `robotctl policy load`. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional.

El entrenamiento se realizó sobre la tarea `Mjlab-TugOfWar-MicroDuck` del repositorio `microduck-challenges`, con 1024 entornos paralelos y 1000 iteraciones máximas. Es un artefacto muy específico, de nicho (robótica de refuerzo), con repositorio de 0 GB y sin descargas ni likes en el momento de redactar esta ficha, lo que refleja su carácter experimental y reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning exportada a ONNX (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; el manifest no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del policy manifest de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La política es el resultado de un entrenamiento de reinforcement learning sobre el simulador mjlab (versión base `mjlab-microduck 0.1.0 @ 1efd853be`), dentro del marco de desafíos `microduck-challenges` de Pollen Robotics. La tarea concreta es `Mjlab-TugOfWar-MicroDuck`, en la rama `dirigo-speed`, commit `63680d7a5`, checkpoint 300, semilla 42. El entrenamiento se lanzó el 9 de noviembre de 2026 y empleó 1024 entornos paralelos con un máximo de 1000 iteraciones y guardado cada 50.

El artefacto final es un grafo ONNX que incluye el normalizador de observaciones embebido, de forma que la interfaz con el robot es directa: observaciones crudas de 61 valores de entrada y 14 acciones de salida a 50 Hz. La arquitectura interna de la red (número de capas, anchura, tipo de activaciones) no se detalla en la model card. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor continuo del robot microduck: genera una marcha perpetua que se mantiene hasta que se detiene o se sustituye la política.
- Procesamiento de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz, adecuado para el bucle de control en tiempo real del robot.
- Normalización de observaciones integrada en el modelo, lo que simplifica la integración en el demonio del robot.
- Carga dinámica en ranuras de política mediante `robotctl`, lo que permite alternar entre políticas sin reiniciar el sistema.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo de razonamiento.

## Casos de uso

- Demostración de marcha continua en microduck: cargar la política en una ranura y dejar que el robot camine de forma indefinida, útil para vídeos, ferias o validación de hardware.
- Pruebas de integración del demonio `robotctl`: sirve como política de referencia para verificar que el pipeline de carga, normalización y ejecución a 50 Hz funciona correctamente.
- Investigación en reinforcement learning para robótica: punto de partida reproducible (código, `uv.lock`, comando y semilla documentados) para comparar variantes de entrenamiento en la tarea TugOfWar.
- Benchmark de simulación a realidad: permite evaluar la brecha sim-to-real de una política entrenada en mjlab sobre el hardware microduck real.
- Base para fine-tuning o currículos de entrenamiento: al estar integrada en `microduck-challenges`, puede servir como inicialización para tareas derivadas.
- Docencia y talleres: ejemplo completo y ligero (repo de 0 GB) de un flujo RL → ONNX → robot para enseñar el ciclo completo en robótica de refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0 GB y el modelo se ejecuta como política ONNX en el propio robot, por lo que la huella es mínima (no se especifica cifra).
- GPU recomendadas: no aplica para inferencia en el robot; para reentrenar, el comando documentado usa 1024 entornos paralelos, lo que requiere una GPU de gama alta (el nombre de ejecución `tug-dell1` sugiere una estación de trabajo, sin especificar modelo).
- ¿Cabe en GPU de consumo? La inferencia ONNX es lo bastante ligera para ejecutarse en CPU embebida; no se documentan requisitos de GPU para inferencia.
- Opciones de despliegue: ONNX Runtime a través de la librería `microduck` y el demonio `robotctl` (`sudo robotctl policy load <slot> jaippolito/microduck-getting-duckie-wit-it`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: frecuencia de control fijada en 50 Hz (20 ms por paso); no se publican latencias medidas.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas comparables para microduck en la información proporcionada. Como referencia de categoría, existen políticas RL para cuadrúpedos en otros ecosistemas (por ejemplo, las publicadas para Unitree o ANYmal), pero no se dispone de datos de parámetros, contexto ni rendimiento de este modelo que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-getting-duckie-wit-it | no disponible | no aplica | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Modelo de nicho y sin validación externa: 0 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados.
- La política es «perpetua» por diseño: ejecuta la marcha hasta que se detiene explícitamente, lo que exige supervisión en entornos reales.
- Entrenamiento no reproducible bit a bit: la misma semilla produce pesos distintos en máquinas diferentes, lo que complica la auditoría exacta.
- Arquitectura interna no documentada: no se detallan capas, parámetros ni proceso de normalización más allá de que está embebido.
- Sin información sobre sesgos (no aplica a un modelo de lenguaje) ni sobre alucinación, pero sí riesgo de comportamiento inesperado sim-to-real en el robot físico.
- Sin datos de idiomas ni de capacidades lingüísticas: no debe emplearse como modelo de texto.
- Dependencia de la versión del demonio y del schema 2 del policy manifest: cambios de versión pueden romper la compatibilidad.

## Enlaces

- [Hugging Face: jaippolito/microduck-getting-duckie-wit-it](https://huggingface.co/jaippolito/microduck-getting-duckie-wit-it)
- [Repositorio microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- [Repositorio microduck-challenges](https://github.com/pollen-robotics/microduck-challenges)
