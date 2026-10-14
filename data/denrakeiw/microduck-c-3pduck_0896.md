# DenRakEiw/microduck-c-3pduck_0896

## Resumen

c-3pduck_0896 es una politica de aprendizaje por refuerzo (RL) para el robot microduck de Pollen Robotics, publicada por el usuario DenRakEiw en HuggingFace. No es un modelo de lenguaje: se trata de un controlador de locomocion exportado a ONNX que ocupa el slot `walk` del robot y que produce una marcha perpetua (se ejecuta de forma continua hasta que se detiene de forma explicita). El modelo consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, es decir, un bucle de control reactivo de 20 ms por paso.

El entrenamiento descrito en la model card corresponde a un fine-tuning mediante estrategias de evolucion (evolution strategies) sobre el scorer de colinas de la "Arena", en un escenario de 1,5 m de escalada tipo race-mode. Parte del repositorio `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `b76573f1a`). La relevancia es limitada fuera del ecosistema microduck: el repositorio no tiene descargas ni likes, no declara licencia y su tamano es practicamente nulo (0,0 GB), lo que indica un artefacto de policy muy pequeno.

Es un ejemplo tipico de politica RL de borde (edge RL): inferencia a 50 Hz sobre hardware embebido, con el normalizador de observaciones embebido en el propio fichero ONNX, lo que simplifica el despliegue al permitir alimentar observaciones en crudo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL exportada a ONNX para control de robot) |
| Parametros totales | no disponible (tamano de repo 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica reactiva; ventana de observacion de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (artefacto ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

La informacion publicada no detalla la topologia de red (numero de capas, unidades ocultas, tipo de activacion). Lo que si se especifica es la interfaz: 61 dimensiones de observacion de entrada, 14 dimensiones de accion de salida y una frecuencia de control de 50 Hz. El normalizador de observaciones esta integrado en `policy.onnx`, de modo que el consumidor debe entregar observaciones sin normalizar. El artefacto se distribuye dentro del ecosistema del demonio `robotctl`, con un `manifest.json` conforme al esquema 2 del manifiesto de politicas microduck.

En cuanto al entrenamiento, la model card indica que se trata de una politica en modo carrera ("race-mode") afinada mediante estrategias de evolucion sobre el scorer de colinas de la Arena, en un escenario de escalada de 1,5 m. No se especifican el numero de iteraciones, la poblacion de la ES, la funcion de recompensa exacta ni la composicion del conjunto de entrenamiento. El codigo de referencia esta en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Locomocion bidepala/quadrupeda del microduck en el slot `walk`: genera una marcha perpetua que se mantiene activa hasta que se ordena lo contrario.
- Control reactivo a 50 Hz: 20 ms por ciclo de inferencia, adecuado para bucles de control en tiempo real.
- Escalada en pendiente: la politica esta afinada para un escenario de subida de 1,5 m en modo carrera.
- Consumo de observaciones crudas: el normalizador esta embebido en el ONNX, por lo que no requiere preprocesado externo.
- Integracion directa con el demonio del robot mediante `robotctl policy load walk`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling ni capacidades de agente multi-paso. Todas ellas quedan fuera del alcance del modelo.
- No se declaran capacidades multilingues (no aplica).

## Casos de uso

- Locomocion autonoma del microduck en interiores: cargar la politica en el slot `walk` permite al robot desplazarse de forma continua sin intervencion, usando el bucle de control de 50 Hz para mantener el equilibrio.
- Demostraciones de robotica open source: al ser un artefacto ONNX pequeno con licencia y dependencias del ecosistema Pollen Robotics, sirve para ilustrar un pipeline completo de RL a despliegue en hardware real.
- Investigacion en estrategias de evolucion: la politica es un punto de partida reproducible (commit `b76573f1a`) para comparar variantes de ES sobre el mismo scorer de la Arena.
- Competicion o benchmark de escalada: el modo carrera y el escenario de 1,5 m permiten usarla como baseline en pruebas de subida de pendiente.
- Recoleccion de datos de marcha: ejecutando la politica de forma perpetua se pueden registrar trazas de observacion/accion a 50 Hz para entrenar o validar politicas posteriores.
- Pruebas de integracion del demonio `robotctl`: valida la carga de manifiestos de esquema 2 y el enrutado de politicas por slot en el robot.
- Educacion en control y RL: el reducido numero de entradas (61) y salidas (14) facilita explicar el mapeo observacion-accion en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la politica fue afinada sobre el "hill scorer" de la Arena en un escenario de 1,5 m, pero no aporta metricas numericas (tiempo de ascension, tasa de exito, recompensa media ni curvas de entrenamiento), y la busqueda web no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,0 GB) y la naturaleza del artefacto (61 entradas, 14 salidas, 50 Hz), la huella de memoria es de orden de kilobytes o pocos megabytes.
- GPU recomendadas: no aplica; el modelo esta pensado para ejecutarse en el propio robot, no en GPU de centro de datos.
- Compatibilidad con GPU de consumo: irrelevante en la practica; cualquier CPU moderna puede ejecutar la inferencia, e incluso una GPU integrada seria sobredimensionada.
- Opciones de despliegue: ONNX Runtime o el runtime integrado del demonio microduck mediante `robotctl policy load walk <repo>`. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: el unico dato disponible es la frecuencia de control objetivo de 50 Hz (20 ms por paso); no se publican mediciones de latencia real ni de uso de CPU en el robot.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada otras politicas cuantificadas del mismo slot (`walk`) para el microduck, ni datos de modelos comparables de control de locomocion, por lo que no es posible establecer una comparacion con cifras de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial o de redistribucion, incluso aunque el codigo base del ecosistema microduck sea abierto.
- Sin informacion de sesgos: no se documenta comportamiento del modelo ante terrenos, cargas o perturbaciones distintas de las del escenario de entrenamiento (escalada de 1,5 m en modo carrera).
- Riesgo de sobreajuste al scorer: al haberse afinado con estrategias de evolucion sobre el scorer de colinas de la Arena, el rendimiento fuera de esa distribucion (superficies lisas, obstaculos, pendientes mayores) no esta caracterizado.
- Politica perpetua: se ejecuta de forma indefinida hasta que se detiene explicitamente; en despliegues reales es necesario implementar una logica externa de parada y de recuperacion ante caidas.
- Interfaz fija: cualquier cambio en el numero o el orden de las 61 observaciones o de las 14 acciones rompe la compatibilidad, ya que el normalizador esta embebido en el ONNX.
- Ausencia de validacion publica: cero descargas y cero likes, sin benchmarks ni informes de terceros; debe tratarse como un artefacto experimental.
- Sin soporte de lenguaje ni de razonamiento: no es apto para tareas de NLP, generacion de codigo ni agentes conversacionales.
- Fecha de publicacion inusual (2026-10-14 segun los metadatos) y repositorio de 0,0 GB: conviene verificar la integridad de los ficheros antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0896
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `b76573f1a`)
- Manifiesto de politicas (esquema 2): `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card; no se proporciona URL directa)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden al editor LaTeX Overleaf y no guardan relacion).
