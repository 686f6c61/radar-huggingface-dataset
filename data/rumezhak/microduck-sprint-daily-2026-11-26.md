# rumezhak/microduck-sprint-daily-2026-11-26

## Resumen

`microduck-sprint-daily-2026-11-26` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un artefacto de inferencia orientado a robótica: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su despliegue directo sobre el hardware.

El modelo se publica bajo la librería `microduck` y el pipeline `robotics`, y sigue el esquema 2 del manifiesto de políticas del daemon de microduck. La política es de tipo «perpetuo»: ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario, y se carga en una ranura (slot) de política del robot mediante el comando `robotctl policy load`.

La relevancia es acotada pero concreta: demuestra el flujo de trabajo de extremo a extremo para entrenar y desplegar políticas de locomoción en un robot de bajo coste, con el normalizador de observaciones embebido en el propio ONNX para simplificar la integración. El repositorio no contiene documentación adicional sobre arquitectura, datos de entrenamiento ni evaluación, y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para robótica; pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; cuantizaciones adicionales no documentadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Otros parámetros operativos documentados:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | embebido en `policy.onnx` (se alimenta con observaciones en crudo) |
| Libreria | `microduck` |
| Pipeline | `robotics` |
| Tamano del repositorio | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal (número de capas, tipo de encoder, si emplea MLP, CNN o transformer). Lo que sí se documenta es el contrato de entrada/salida: un vector de observación de 61 dimensiones y un vector de acción de 14 dimensiones, evaluados a 50 Hz, lo que sitúa la política en el régimen típico de control reactivo de locomoción para cuadrúpedos pequeños.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`, empleando aprendizaje por refuerzo. No se especifican el número de pasos de entrenamiento, la composición del dataset de simulación, el simulador utilizado ni si hubo fases de ajuste fino o destilación. El normalizador de observaciones está integrado en el grafo ONNX, de modo que el consumidor debe enviar observaciones sin normalizar.

## Capacidades

- Locomoción cuadrúpeda continua: genera comandos de acción a 50 Hz para el robot microduck a partir de observaciones de 61 dimensiones.
- Ejecución perpetua: la política mantiene la marcha indefinidamente hasta que el daemon recibe una orden de parada o cambio de política.
- Despliegue directo en robot: se carga en una ranura de política mediante `robotctl policy load <slot> rumezhak/microduck-sprint-daily-2026-11-26`.
- Inferencia autocontenida: el normalizador de observaciones va embebido en el ONNX, lo que elimina pasos de preprocesado en el cliente.
- Compatibilidad con el manifiesto de políticas microduck (esquema 2), lo que facilita la gestión de versiones y ranuras.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Locomoción base del microduck en laboratorio: cargar la política en una ranura y dejar que el robot camine de forma continua mientras se registran datos de sensores o se prueba el hardware.
- Evaluación comparativa de políticas: al ser una política perpetua con contrato de observación/acción fijo, sirve como referencia para comparar otras marchas entrenadas con `microduck_rl` sobre el mismo robot.
- Pruebas de integración del daemon: útil para validar el flujo `robotctl policy load`, la resolución del manifiesto y la carga de ONNX en el pipeline de robótica.
- Demostraciones docentes: ejemplo mínimo de política RL desplegable en un cuadrúpedo de bajo coste, adecuado para talleres de aprendizaje por refuerzo aplicado.
- Benchmarking de latencia en el edge: al ejecutarse a 50 Hz sobre el hardware del robot, permite medir el coste de inferencia ONNX en el dispositivo y ajustar el presupuesto de cómputo del bucle de control.
- Recolección de datos de marcha: usar la política como generador de trayectorias para capturar episodios de locomoción que alimenten entrenamientos posteriores o modelos de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio figura como 0.0 GB en los metadatos, lo que sugiere un artefacto ONNX muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Al tratarse de una política de control a 50 Hz para un robot físico, es plausible que la inferencia se ejecute en CPU en el propio robot o en un equipo companion, pero esto no está documentado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es `robotctl policy load <slot> rumezhak/microduck-sprint-daily-2026-11-26` sobre el daemon de microduck; el artefacto es un `policy.onnx`, por lo que en principio puede ejecutarse con cualquier runtime compatible con ONNX, aunque no se detalla cuál emplea el daemon.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por ciclo de control), pero no se publican mediciones de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas publicadas para el microduck ni modelos comparables de la misma categoría (locomoción RL para cuadrúpedos pequeños) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay descripción de la arquitectura, del proceso de entrenamiento, de los datos ni de los resultados, lo que impide evaluar su calidad o robustez.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; en producción debe tratarse como no autorizado hasta confirmación del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Política perpetua: por diseño no se detiene sola; requiere una orden explícita del operador, lo que introduce un riesgo operativo si falla la supervisión.
- Sin información sobre el dominio de entrenamiento (simulación, terreno, distribución de observaciones): el rendimiento fuera de las condiciones de entrenamiento es desconocido.
- Sin datos sobre sesgos, alucinación o comportamiento ante fallos: no aplican sesgos lingüísticos, pero sí riesgos de seguridad física en el robot (caídas, movimientos no deseados) que no están documentados.
- El repositorio figura con tamaño 0.0 GB, lo que puede indicar un artefacto mínimo o un problema de empaquetado; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.
- Dependencia estricta del esquema 2 del manifiesto de políticas del daemon: cambios de versión en el daemon pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-daily-2026-11-26
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
