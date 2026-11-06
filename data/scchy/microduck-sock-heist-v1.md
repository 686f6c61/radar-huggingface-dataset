# SccHy/microduck-sock-heist-v1

## Resumen

`sock-heist-v1` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo lo publica el usuario SccHy en Hugging Face bajo el identificador `SccHy/microduck-sock-heist-v1` y se distribuye como un fichero ONNX autocontenido que se carga directamente en una ranura de política del demonio `robotctl` del robot. No es un modelo de lenguaje: es un controlador de locomoción que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz.

La política se entrenó con el framework mjlab (entorno de RL basado en MuJoCo) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, partiendo de la base `mjlab-microduck 0.1.0`, en el checkpoint 999 con semilla 1. La model card la describe como una política «perpetua»: ejecuta una marcha de forma continua hasta que se le indica lo contrario, en lugar de resolver un episodio concreto.

Su relevancia es acotada pero clara para quien trabaje con el ecosistema microduck: ofrece una marcha preentrenada lista para desplegar en hardware real mediante un único comando, con la normalización de observaciones incluida dentro del propio ONNX, lo que simplifica la integración. No hay información pública sobre arquitectura de red, número de parámetros ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; red neuronal de control motriz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red en la información disponible. Lo que sí se documenta es la interfaz: la política consume observaciones crudas de 61 dimensiones y emite 14 acciones a 50 Hz, y la normalización de observaciones está embebida dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar. El modelo se empaqueta con un `manifest.json` conforme al schema 2 del manifiesto de políticas del demonio microduck.

El entrenamiento se realizó con mjlab sobre la tarea `Mjlab-SockHeist6m-MicroDuck` (rama `master`, commit `6956d7675`), partiendo de `mjlab-microduck 0.1.0`, con semilla 1 y checkpoint 999. El entrenamiento comenzó el 2026-11-03T13:04:04Z. No se especifican el número de pasos de entorno, la composición de recompensas, el uso de domain randomization ni si hubo destilación o ajuste posterior. La política se describe como «perpetua»: una marcha continua sin condición de terminación por episodio.

## Capacidades

- Locomoción continua del robot microduck: ejecuta una marcha perpetua hasta recibir una orden de parada o sustitución de política.
- Control motriz de bucle cerrado a 50 Hz con observaciones de 61 dimensiones y 14 salidas de acción.
- Normalización de observaciones integrada en el grafo ONNX, lo que elimina pasos de preprocesado en el lado del robot.
- Carga directa en el demonio del robot mediante `robotctl policy load <slot> ...`.
- Compatibilidad con el formato de manifiesto de políticas microduck (schema 2).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es exclusivamente un controlador de locomoción.

## Casos de uso

- Despliegue rápido de una marcha funcional en un microduck físico: cargar la política con `sudo robotctl policy load <slot> SccHy/microduck-sock-heist-v1` permite poner el robot a caminar sin entrenar desde cero.
- Base de referencia para comparar políticas propias: sirve como línea base de locomoción contra la que medir el rendimiento de políticas entrenadas por el usuario en la misma tarea de mjlab.
- Punto de partida para fine-tuning con mjlab: al estar documentados el `task_id`, el commit y la base (`mjlab-microduck 0.1.0`), se puede reproducir el entorno de entrenamiento y continuar desde una política ya funcional.
- Demostraciones y docencia en robótica con RL: útil para mostrar el ciclo completo de entrenamiento en simulación y despliegue en hardware con un robot de bajo coste.
- Pruebas de integración del demonio `robotctl`: valida el flujo de carga de políticas, el esquema de manifiesto y el bucle de control a 50 Hz en un caso real.
- Validación de hardware y calibración: una política de marcha conocida permite comprobar actuadores, sensores y frecuencias de control tras montajes o reparaciones del robot.
- Experimentos de robustez en simulación: al integrarse en mjlab, puede evaluarse frente a perturbaciones y variaciones de dominio antes de llevarla al robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio figura como 0.0 GB y no se documenta el número de parámetros, aunque por la naturaleza de una política de control de 61 entradas y 14 salidas es previsible que sea muy reducida.
- GPU recomendadas: no disponible. Para el entrenamiento con mjlab se requiere una GPU compatible con MuJoCo y el framework de RL, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado por falta de datos de tamaño; por la dimensionalidad de entrada y salida es esperable que sí, pero no se puede afirmar sin la información del modelo.
- Opciones de despliegue: ONNX Runtime a través del demonio microduck (`robotctl policy load`); no se documentan otras rutas como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control opera a 50 Hz (periodo de 20 ms); no se publican latencias medidas de la inferencia ONNX.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas para microduck con las que comparar parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- No se especifica la licencia: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarla en un producto.
- No hay información sobre la arquitectura de la red ni el número de parámetros, lo que dificulta auditar el modelo o estimar su coste computacional.
- Ausencia total de métricas de evaluación: se desconoce la robustez de la marcha ante terrenos irregulares, empujones, cambios de superficie o desgaste de actuadores.
- La política está entrenada para una tarea concreta (`Mjlab-SockHeist6m-MicroDuck`) y un robot concreto (microduck); no es transferible a otras morfologías sin reentrenamiento.
- El modelo se describe como «perpetuo»: no incluye lógica de parada segura por sí mismo, por lo que la supervisión y los límites de seguridad deben gestionarse en el demonio o en el operador.
- Riesgo de sim-to-real gap: no se documenta el uso de domain randomization ni validaciones en hardware real más allá de la instrucción de carga.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que respalde su fiabilidad en producción.
- No aplica el riesgo de alucinación propio de los modelos de lenguaje, pero sí el riesgo de comportamientos no previstos en el control motriz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-sock-heist-v1
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del demonio microduck): no se proporciona URL directa en la información disponible.
