# GinDuck/microduck-roller-sprint-2m-roller-2-x

## Resumen

`microduck-roller-sprint-2m-roller-2-x` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje: es un checkpoint de una política de locomoción (gait) que se carga en una ranura del daemon `robotctl` del robot y se ejecuta en bucle a 50 Hz hasta que se le indique lo contrario. El autor, GinDuck, la publica como parte de su segunda serie de entrenamientos sobre patines (rollers), en este caso orientada a la velocidad en línea recta en lugar de al patinaje.

El modelo recibe observaciones de 61 dimensiones y emite 14 acciones, con un normalizador de observaciones embebido directamente en el fichero `policy.onnx`, de modo que el consumidor puede alimentar observaciones en bruto sin preprocesado adicional. Según el autor, completa su recorrido de prueba en aproximadamente 1,6 segundos, sobre una receta de entrenamiento compartida por TheSauceman.

El interés de esta ficha es limitado para el público general de IA, pero es relevante como ejemplo de ecosistema de políticas robóticas reproducibles: el autor documenta `task_id`, repositorio, rama, commit, checkpoint, semilla y comando exacto de entrenamiento, lo que permite regenerar una política comparable (aunque no idéntica, dado que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo para control robótico (red neuronal; topología no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrena con el framework `mjlab-microduck` (versión 0.1.0, commit `1efd853be`), sobre el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El `task_id` es `Mjlab-RollerSprint2m-MicroDuck`, el checkpoint publicado corresponde a la iteración 3000 de un máximo configurado de 6000, con semilla 1, y el entrenamiento se lanzó el 2 de noviembre de 2026 con 2048 entornos paralelos en escena y registro en TensorBoard bajo el nombre de ejecución `roller-2`. La fecha de creación del repositorio en Hugging Face es el 24 de noviembre de 2026.

El autor advierte explícitamente de que reejecutar el mismo código, `uv.lock`, comando y semilla produce una política comparable pero no los mismos pesos, porque el entrenamiento con RL en GPU no es reproducible a nivel de bit entre máquinas. La política es perpetua: no tiene condición de terminación interna y sigue ejecutándose hasta que el daemon la descargue. El normalizador de observaciones está embebido en el ONNX, lo que fija el contrato de entrada (61 dimensiones en bruto) y de salida (14 acciones) a 50 Hz sobre patines. No se detalla en la información disponible la topología concreta de la red (número de capas, anchura, tipo de actor-crítico) ni el volumen total de pasos de entrenamiento.

## Capacidades

- Locomoción bípeda/cuadrúpeda sobre patines (rollers) para el robot microduck, con política perpetua sin condición de parada.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el artefacto ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política mediante `robotctl policy load <slot> ...`.
- Orientada a sprint en línea recta (el autor indica que abandona el patinaje en favor de la velocidad).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Carreras y competiciones de robots microduck: la política está entrenada para un recorrido de sprint de aproximadamente 2 metros y un tiempo de ~1,6 segundos, por lo que encaja directamente en pruebas cronometradas de la Arena o copas QuackPack.
- Benchmarking de recetas de RL: al estar documentados task_id, commit, semilla y comando, sirve como referencia reproducible para comparar variantes de entrenamiento (por ejemplo, distintas semillas o números de entornos) sobre el mismo entorno `mjlab-microduck`.
- Desarrollo de controladores de alto nivel: la política puede cargarse en una ranura y combinarse con lógica de misión (arranque, parada, conmutación entre gaits) gestionada por el daemon `robotctl`.
- Validación de pipelines de exportación ONNX: el artefacto incluye el normalizador embebido y un `manifest.json` con esquema 2, útil para probar la cadena de despliegue de políticas en el robot.
- Docencia e investigación en robótica con RL: el robot microduck es de código abierto y el repositorio de retos está público, lo que permite usar este checkpoint como punto de partida para experimentos de locomoción sobre ruedas.
- Pruebas de integración continua de firmware/daemon: una política perpetua y ligera (repo de 0,0 GB) es adecuada para tests de humo del cargador de políticas y del bucle de control a 50 Hz sin necesidad de entrenar.
- Demostraciones de velocidad en ferias o vídeos: el tiempo declarado de ~1,6 segundos permite guiones de demostración cortos y repetibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es cualitativo y de prueba propia: finalización del recorrido en aproximadamente 1,6 segundos, sin especificar distancia exacta, condiciones de la pista ni métricas de varianza entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto ONNX muy pequeño, pero no se publican parámetros ni tamaño del fichero.
- GPU recomendadas: no aplica para inferencia en el robot; el cómputo de entrenamiento se realizó con 2048 entornos paralelos, lo que requiere una GPU de datacenter (modelo concreto no disponible).
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del artefacto es plausible, pero no está documentado.
- Opciones de despliegue: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-x` sobre el daemon de microduck; ejecución del ONNX en el propio robot.
- Latencia y throughput: bucle de control a 50 Hz (periodo de 20 ms) según la model card; no se publican latencias medidas por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-roller-sprint-2m-roller-2-x (GinDuck) | Política RL sobre rollers | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face, 0 descargas, 0 likes |
| Otros checkpoints de la serie `roller` del mismo autor | Política RL sobre rollers | no disponible | no disponible | no disponible | no disponibles en la información proporcionada |
| Políticas de referencia de `pollen-robotics/microduck-challenges` | Políticas RL del repositorio de retos | no disponible | no disponible | no disponible | Repositorio público en GitHub |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas como para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K, ni usarse para generación de texto, código o razonamiento.
- El rendimiento de ~1,6 segundos es una medición propia del autor, sin protocolo publicado, sin número de repeticiones y sin condiciones de pista especificadas; no debe tratarse como benchmark validado.
- La política es perpetua y no tiene condición de terminación interna: requiere que el operador o el daemon la detenga explícitamente, lo que implica un riesgo operativo si se carga sin supervisión.
- El entrenamiento no es bit-reproducible: la reproducción con la misma semilla genera pesos distintos, lo que complica la auditoría exacta del artefacto publicado.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarla en productos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por terceros.
- No se documentan sesgos (no aplica en el sentido lingüístico), pero sí existe riesgo de sobreajuste al entorno de entrenamiento (`mjlab-microduck` 0.1.0, escena concreta) y de degradación al cambiar condiciones físicas del robot o de la superficie.
- Dependencia fuerte de la versión del daemon y del esquema 2 del manifiesto de políticas: cambios de esquema pueden invalidar la carga.
- No se especifican los idiomas ni la región de aplicación más allá de la etiqueta `region:us`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-x
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como URL directa en la información proporcionada
- Aplicación QuackPack del autor: https://www.imundo.ch/quackpack/
