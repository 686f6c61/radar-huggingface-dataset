# lphatnguyen/microduck-tug-of-war-v1

## Resumen

`microduck-tug-of-war-v1` es una política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo lo publica el usuario de Hugging Face lphatnguyen y está pensado para la tarea de "tug of war" (tirar de una cuerda o carga) dentro del entorno de simulación y competición asociado al proyecto microduck. No es un modelo de lenguaje: se trata de una política de aprendizaje por refuerzo que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz.

Técnicamente se distribuye como un único fichero `policy.onnx` con la normalización de observaciones integrada, acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon microduck. La arquitectura interna de la red no se detalla en la model card; el autor menciona una red PPO propia ("f10-1100") entrenada contra la "reference duck" en el repositorio `pollen-robotics/microduck_rl`, rama `tug-of-war-fresh`, commit `60852519f`.

La relevancia de esta ficha es limitada y conviene ser explícito: el propio autor declara que el fichero es "simulation only" y que en las cinco semillas oficiales de evaluación `policy.onnx` funciona como una tabla de búsqueda que reproduce combates grabados de terceros (principalmente de greecree), con coincidencia exacta de observación y tolerancia L-inf de 1e-5. Solo fuera de esas semillas decide la red neuronal. Es, por tanto, un artefacto de competición con créditos compartidos y sin licencia declarada, no una política generalizable lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles internos no disponibles); inferencia vía ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible (el autor indica que no añade licencia a las partes de terceros) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto microduck) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Slot de política | `walk` |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la topología de la red más allá de identificarla como una política PPO ("our own PPO duck f10-1100") entrenada en el repositorio `pollen-robotics/microduck_rl`, rama `tug-of-war-fresh`, commit `60852519f`, contra la "reference duck". El autor reporta 120 victorias en 120 combates ("pit wins") en las semillas 1-120 en pruebas locales, lo que sugiere un entrenamiento por refuerzo con evaluación por enfrentamiento contra una política de referencia.

El aspecto técnico más relevante —y el más problemático— es el mecanismo de distribución: `policy.onnx` no es solo la red entrenada. En las cinco semillas oficiales de evaluación, el fichero reproduce combates grabados de otras políticas con coincidencia exacta de observación (tolerancia L-inf 1e-5); fuera de esas semillas, la red PPO decide. Las filas 2, 3 y 4 de la tabla de la model card corresponden íntegramente a trabajo de terceros (greecree, Unique007, jrubiosainz) usado sin cambios; las filas 1 y 5 añaden mejoras marginales de +0.0008 cm y +0.0023 cm respectivamente sobre los combates de greecree, mediante CMA-ES propio sobre las últimas llamadas. No se documentan datos de entrenamiento, número de tokens (no aplica), composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Control de locomoción y tracción del microduck en la tarea de tug of war, con política perpetua (se ejecuta hasta que se detiene).
- Mapeo directo de observaciones crudas de 61 dimensiones a 14 acciones a 50 Hz, con normalizador integrado en el ONNX.
- Reproducción exacta de combates grabados en las cinco semillas oficiales de evaluación.
- Generalización limitada fuera de esas semillas mediante la red PPO subyacente.
- Integración con el daemon microduck mediante `robotctl policy load walk <repo>` y `manifest.json` conforme al esquema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio.

## Casos de uso

- Evaluación en simulación de políticas de tug of war: sirve como referencia de puntuación en las cinco semillas oficiales, reproduciendo combates con puntuaciones entre 168.4128 cm y 169.3983 cm.
- Competición y benchmarking interno del proyecto microduck: permite comparar políticas propias contra una referencia que replica los mejores combates conocidos de la comunidad.
- Pruebas de integración del daemon: valida el flujo `robotctl policy load walk` y la carga de manifiestos de esquema 2 en pipelines de CI del ecosistema microduck.
- Investigación sobre sobreajuste y memorización en RL: es un caso de estudio explícito de política que memoriza trayectorias en el conjunto de evaluación y generaliza fuera de él con una red distinta.
- Reproducción de resultados de terceros: facilita replicar los combates de greecree y Unique007 en entornos x86-64 locales sin depender de los repositorios originales.
- Docencia sobre créditos y linaje en modelos derivados: ilustra cómo se compone un artefacto a partir de políticas ajenas y qué obligaciones de atribución implica.
- No es adecuado para despliegue en robot físico fuera de simulación: el autor declara explícitamente "simulation only".

## Benchmarks y rendimiento

Resultados declarados por el autor (puntuación en cm, replay local x86-64):

| Semilla oficial | Puntuación (cm) | Origen del combate |
|---|---|---|
| 1 | 169.0202 | greecree tug-of-war-tug-super-v11 + CMA-ES propio en las últimas llamadas |
| 2 | 169.0240 | greecree tug-of-war-tug-super-v11 (mismo combate que Unique007 tug-dat-v4) |
| 3 | 168.4128 | greecree tug-of-war-tug-super-v11 (mismo combate que Unique007 tug-dat-v4) |
| 4 | 169.3983 | greecree tug-of-war-tug-super-v11 (mismo combate que Unique007 tug-dat-v4) |
| 5 | 168.4435 | greecree tug-of-war-tug-super-v11 + CMA-ES propio en las últimas llamadas |

Además, el autor reporta 120 victorias en 120 combates en las semillas 1-120 en pruebas locales con la red PPO f10-1100. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente cabe en cualquier GPU consumer e incluso podría ejecutarse en CPU.
- GPU recomendadas: no disponibles; para una política ONNX de este tamaño, cualquier GPU con soporte ONNX Runtime es suficiente.
- Compatibilidad con GPU consumer: presumiblemente sí en cualquier RTX o equivalente, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo), daemon microduck vía `robotctl policy load walk`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; el requisito funcional es sostener 50 Hz de control, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Puntuación en semillas oficiales | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-tug-of-war-v1 (este) | Política ONNX con replay + PPO | 168.41-169.40 cm | no disponible | Hugging Face |
| greecree/microduck-tug-of-war-tug-super-v11 | Política de referencia (origen de la mayoría de combates) | Base de las puntuaciones anteriores | no disponible | Hugging Face |
| Unique007/microduck-tug-dat-v4 | Política derivada (mismo combate en semillas 2-4) | Equivalente en semillas 2-4 | no disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-quicksilver-v16 | Política con herramientas de búsqueda | no disponible | no disponible | Hugging Face |

La comparación es difícil porque las puntuaciones de este modelo en las semillas 2-4 son literalmente las de greecree y Unique007, no una mejora propia. Las diferencias reales solo aparecen en las semillas 1 y 5, con incrementos de milésimas de centímetro.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es "simulation only"; no está validado para uso en robot físico.
- En las cinco semillas oficiales, `policy.onnx` es una tabla de búsqueda sobre combates grabados de terceros, no una inferencia de la red; el rendimiento reportado no refleja capacidad de generalización.
- Las puntuaciones de las semillas 2, 3 y 4 corresponden íntegramente a trabajo de greecree y Unique007, usadas sin cambios.
- No se declara licencia; el autor indica que no añade licencia a las partes de terceros y que retirará el repositorio si algún autor lo solicita. Esto hace arriesgado cualquier uso comercial o redistribución.
- Riesgo de sobreajuste severo a las semillas de evaluación, evidenciado por el propio mecanismo de replay.
- No hay información sobre sesgos, robustez ante perturbaciones, ni comportamiento en condiciones fuera de distribución.
- No aplica a tareas de lenguaje, visión, tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- El autor reconoce que un asistente de IA ayudó en los experimentos, sin detallar el alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v1
- Perfil del autor: https://huggingface.co/lphatnguyen
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Política de referencia greecree: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v11
- Política Unique007 tug-dat-v4: https://huggingface.co/Unique007/microduck-tug-dat-v4
- Política jrubiosainz h5b: https://huggingface.co/jrubiosainz/microduck-tug-h5b-3976f431
- Política HlibPlakhtii quicksilver-tug-v16: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v16
- Copia del modelo por jrubiosainz: https://huggingface.co/jrubiosainz/microduck-tug-of-war-copy-lphatnguyen-bca92ace
