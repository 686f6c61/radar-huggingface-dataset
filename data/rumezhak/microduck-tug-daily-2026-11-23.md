# rumezhak/microduck-tug-daily-2026-11-23

## Resumen

`microduck-tug-daily-2026-11-23` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuación a una frecuencia de 50 Hz, empaquetado en formato ONNX para su ejecución directa sobre el hardware del robot.

El modelo se distribuye como un "gait" o patrón de marcha perpetuo: una vez cargado en una ranura de política del demonio `robotctl`, se ejecuta de forma continua hasta que se le indique lo contrario. La normalización de observaciones está integrada en el propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo sin preprocesado adicional por parte del usuario.

Su relevancia es acotada pero específica: sirve como ejemplo reproducible de un pipeline de reinforcement learning aplicado a robótica de bajo coste, con artefactos versionados (repo `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`) y un manifiesto de política conforme al esquema 2 documentado en el repositorio del demonio. El repositorio de Hugging Face no contiene pesos en formato safetensors ni GGUF, sino un artefacto ONNX de tamaño declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL empaquetada en ONNX; no se detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

Especificaciones adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento | política perpetua (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | integrado en `policy.onnx` (entrada en crudo) |
| Libreria asociada | `microduck` |
| Pipeline declarado | `robotics` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-22 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, tipo de capas, función de activación ni parámetros totales). Lo que sí se documenta es el contrato de interfaz: la política consume un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, lo que la sitúa como un controlador de bucle cerrado de baja latencia adecuado para la locomoción de un cuadrúpedo pequeño.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. Se trata de un pipeline de reinforcement learning, presumiblemente con simulación y transferencia al robot real, aunque no se especifican el algoritmo concreto (PPO, SAC, etc.), el número de pasos de entrenamiento, la composición del dataset ni si hubo fases de ajuste fino o currículo. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto. La normalización de observaciones se hornea dentro del grafo ONNX, lo que elimina una fuente habitual de errores de integración entre simulación y despliegue.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha perpetua ("tug-daily") para el robot microduck a 50 Hz.
- Control reactivo de bucle cerrado: mapea 61 observaciones (presumiblemente propiocepción e IMU) a 14 comandos de actuación en cada ciclo de control.
- Despliegue directo en hardware: se carga en una ranura de política mediante `robotctl policy load <slot> rumezhak/microduck-tug-daily-2026-11-23`.
- Entrada en crudo: no requiere preprocesado externo de observaciones gracias al normalizador integrado en el ONNX.
- Ejecución perpetua: mantiene la marcha hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Locomoción de referencia en microduck: cargar la política en una ranura y dejar que el robot camine de forma continua para validar la cadena cinemática, los servos y la IMU tras un montaje.
- Pruebas de integración del demonio `robotctl`: usar el manifiesto de esquema 2 y el ONNX como caso de prueba reproducible para verificar la carga de políticas, la gestión de ranuras y el ciclo de control a 50 Hz.
- Base de comparación en experimentos de RL: emplear esta política como línea base ("gait" preentrenado) frente a políticas propias entrenadas con `microduck_rl`, midiendo estabilidad, deriva y consumo.
- Demostraciones educativas de simulación-a-realidad: ilustrar un pipeline completo de reinforcement learning en robótica de bajo coste, desde el entrenamiento en simulador hasta la ejecución en el robot físico.
- Validación de hardware tras modificaciones: tras cambiar piezas, calibrar servos o alterar el reparto de masas, ejecutar la política para detectar comportamientos anómalos antes de invertir en un reentrenamiento.
- Telemetría y registro de marcha: dejar la política en ejecución perpetua mientras se registran observaciones y acciones para construir datasets de comportamiento o analizar la dinámica del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio declara 0,0 GB, lo que sugiere un artefacto muy pequeño, pero no se confirma el tamaño real de `policy.onnx`.
- GPU recomendadas: no disponible. Por la naturaleza del artefacto (política de 61 entradas y 14 salidas a 50 Hz), es plausible que la inferencia en CPU sea suficiente, pero no se documenta.
- Viabilidad en GPU de consumo: no confirmada; el cuello de botella real es la latencia del bucle de control a 50 Hz (20 ms por ciclo), no la memoria.
- Opciones de despliegue: el método documentado es `robotctl policy load <slot> rumezhak/microduck-tug-daily-2026-11-23` sobre el demonio de microduck; el runtime es ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El requisito implícito es completar la inferencia en menos de 20 ms para sostener los 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni artefactos comparables con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en un producto.
- Sesgos conocidos: no documentados; al ser una política entrenada en simulación, puede presentar sesgos hacia las condiciones del simulador (fricción, masas, retardos) que no se transfieran al robot real.
- Riesgo de fallo en transferencia simulación-realidad: sin métricas publicadas de robustez, no hay garantía de estabilidad ante terrenos, cargas o desgastes distintos de los del entrenamiento.
- Comportamiento perpetuo: al ejecutarse hasta recibir orden de parada, requiere supervisión y un mecanismo fiable de parada de emergencia en cualquier despliegue.
- Ausencia de soporte de lenguaje: no puede interpretar instrucciones en lenguaje natural ni integrarse en agentes conversacionales.
- Idiomas y contexto: no aplica; no es un modelo de lenguaje y no tiene ventana de contexto.
- Documentación mínima: la model card no detalla arquitectura, hiperparámetros, dataset ni evaluación, lo que dificulta la reproducibilidad y la auditoría.
- Cero descargas y likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-daily-2026-11-23
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`), referenciado en la model card
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio, referenciado en la model card
