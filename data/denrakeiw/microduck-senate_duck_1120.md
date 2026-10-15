# DenRakEiw/microduck-senate_duck_1120

## Resumen

`DenRakEiw/microduck-senate_duck_1120` es una política de control por aprendizaje por refuerzo (RL) para el robot microduck de Pollen Robotics, publicada por el usuario DenRakEiw. No es un modelo de lenguaje ni un modelo multimodal: es una red neuronal de control que ocupa el slot `walk` del robot y ejecuta una marcha perpetua sobre rodillos, descrita por el autor como "2 m Roller Sprint", un modo carrera afinado sobre el scorer de rodillos de Arena. El modelo se distribuye como un grafo ONNX (`policy.onnx`) junto con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

La política consume un vector de observación de 61 dimensiones y emite 14 acciones de control a 50 Hz, con el normalizador de observaciones embebido en el propio ONNX, de modo que se le pueden alimentar observaciones en crudo. Se entrenó dentro del repositorio `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `8dafac487`) y después se afinó mediante estrategias evolutivas (evolution strategies) contra el scorer de rodillos, una combinación habitual en locomoción de robots pequeños donde el gradiente de RL puro es difícil de estabilizar.

Su relevancia es acotada y muy específica: es un artefacto de robótica de código abierto pensado para ejecutarse en hardware real y en banco de pruebas, no un modelo de propósito general. El repositorio aparece con 0,0 GB, 0 descargas y 0 likes, y no declara licencia, idiomas ni métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control entrenada con RL; topología interna (capas, activaciones) no documentada. Se distribuye como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (política de control; ventana de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Espacio de observación | 61 dimensiones (normalizador embebido en `policy.onnx`; se alimentan observaciones en crudo) |
| Espacio de acciones | 14 acciones de control |
| Frecuencia de control | 50 Hz |
| Modo de ejecución | perpetuo (se ejecuta hasta que se le indique lo contrario) |
| Slot de destino | `walk` |
| Biblioteca | `microduck` |
| Pipeline declarado | `robotics` |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red (número de capas, anchura, tipo de activación ni número de parámetros). Se sabe que es una política de control que mapea un vector de observación de 61 dimensiones a 14 acciones a 50 Hz, ejecutada sobre rodillos, y que el normalizador de observaciones está integrado en el propio grafo ONNX, lo que implica que la entrada esperada es la observación sin preprocesar. No se documenta si hay recurrencia, memoria o ventana temporal; el modo de ejecución es perpetuo, sin condición de parada declarada.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487`. El autor indica que la política partió de un entrenamiento por refuerzo y se afinó después mediante estrategias evolutivas (evolution strategies) sobre el scorer de rodillos de Arena, lo que sugiere una optimización de tipo caja negra sobre una función de recompensa específica de la competición. No se especifica el número de pasos de entrenamiento, la composición del dataset (en robótica, la distribución de estados generada por el propio entrenamiento), ni si hubo fases de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Locomoción del microduck en modo `walk`: genera la marcha que el robot ejecuta sobre rodillos.
- Ejecución perpetua: la política se mantiene activa indefinidamente hasta recibir una orden de parada desde el daemon.
- Control reactivo a 50 Hz a partir de observaciones crudas de 61 dimensiones.
- Salida de 14 acciones de control por ciclo.
- Modo carrera ("2 m Roller Sprint"): comportamiento optimizado para el scorer de rodillos, según el autor.
- Despliegue directo en robot real mediante `robotctl policy load walk DenRakEiw/microduck-senate_duck_1120`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que permite integrarla como cualquier otra política del slot `walk`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta lenguaje natural ni capacidades multilingües.
- No se documentan capacidades de visión, audio ni modos de "pensamiento"; el modelo es exclusivamente de control motor.

## Casos de uso

- Demostración de sprint sobre rodillos: cargar la política en el slot `walk` y medir el comportamiento del microduck en el recorrido de 2 m definido por el modo carrera, útil para validar el scorer de Arena en un banco controlado.
- Evaluación comparativa de gaits: al ocupar un slot estándar (`walk`), permite alternar entre esta política y otras del mismo slot para comparar estabilidad, velocidad y consumo en rodillos.
- Investigación en estrategias evolutivas aplicadas a robótica: dado que el autor documenta el commit exacto de entrenamiento (`8dafac487`), sirve como artefacto reproducible para estudiar el ajuste por ES sobre una política de RL previa.
- Pruebas de locomoción sin riesgo de caída: al ejecutarse sobre rodillos, permite caracterizar la marcha en banco antes de intentar transferirla a suelo, reduciendo el riesgo de dañar el robot.
- Integración en el ciclo de desarrollo del daemon de microduck: sirve como política de referencia para verificar la carga de manifiestos de esquema 2 y el flujo `robotctl policy load`.
- Docencia y talleres de RL robótico: es un ejemplo autocontenido, de tamaño despreciable (0,0 GB) y con una única dependencia práctica (`microduck` + ONNX), adecuado para explicar el pipeline completo de observación, acción y control a 50 Hz.
- Validación de infraestructura de despliegue: permite comprobar que el cómputo embebido del robot puede sostener una inferencia ONNX a 50 Hz con normalizador integrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB. Es una política de control en ONNX de tamaño despreciable (el repositorio figura como 0,0 GB), por lo que la inferencia está pensada para ejecutarse en CPU.
- GPU recomendadas: no aplicable. No se documenta ningún requisito de GPU; el escenario natural es el cómputo embebido del propio microduck.
- Cabe en GPU de consumo: sí, pero es innecesario; también cabe en el microcontrolador o SBC que gobierna el robot.
- Opciones de despliegue: daemon de microduck vía `robotctl policy load walk DenRakEiw/microduck-senate_duck_1120`; ejecución del grafo ONNX con ONNX Runtime u otro runtime compatible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: la política debe sostener 50 Hz (20 ms por ciclo) para funcionar correctamente; no se publican cifras de latencia ni de throughput. No se documenta el coste computacional por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observación | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `DenRakEiw/microduck-senate_duck_1120` | Política RL (ONNX) para microduck, slot `walk` | 61 dimensiones | 14 | 50 Hz | no disponible | 0 descargas, 0 likes |
| Política base `walk` de `pollen-robotics/microduck_rl` | Política RL para microduck | no disponible | no disponible | no disponible | no disponible | Repositorio de entrenamiento citado por el autor |
| Otras políticas de comunidad para el slot `walk` de microduck | Política RL para microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de políticas alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución. Verificar con el autor antes de cualquier uso en producción.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de que la política funcione correctamente.
- Model card mínima: no se documentan arquitectura, número de parámetros, datos de entrenamiento, recompensa exacta ni criterios de evaluación.
- Tamaño del repositorio de 0,0 GB: conviene verificar que los artefactos (`policy.onnx` y `manifest.json`) están efectivamente presentes y son accesibles antes de desplegar.
- Especialización en rodillos: el comportamiento está optimizado para el scorer de rodillos de Arena. No hay evidencia de que la marcha transfiera a suelo u otras superficies.
- Ejecución perpetua: la política se ejecuta hasta que se le indique lo contrario; no se documenta una condición de parada autónoma ni mecanismos de seguridad.
- Riesgo de sobreajuste al scorer: al estar afinada por estrategias evolutivas contra una función de puntuación concreta, puede explotar particularidades de ese scorer en lugar de producir una marcha general.
- Sin capacidades lingüísticas ni multimodales: no es adecuada para tareas de texto, código, visión o agentes conversacionales.
- No se documenta comportamiento ante observaciones fuera de distribución ni protocolos de recuperación ante fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-senate_duck_1120
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado por el autor: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Los resultados de la búsqueda web realizada no contenían enlaces relevantes para este modelo; no se han incluido fuentes adicionales.
