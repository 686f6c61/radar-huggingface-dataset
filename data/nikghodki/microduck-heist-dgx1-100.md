# nikghodki/microduck-heist-dgx1-100

## Resumen

Microduck-heist-dgx1-100 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. La publica el usuario nikghodki en Hugging Face como un artefacto de inferencia empaquetado en ONNX, pensado para cargarse directamente en un slot de política del daemon `robotctl` del robot. No es un modelo de lenguaje: es una política perpetua que genera comandos de actuación a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones.

El modelo se entrenó con la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`, usando el framework mjlab (basado en MuJoCo) sobre una DGX1, con 4096 entornos paralelos y 1000 iteraciones máximas. El checkpoint publicado corresponde a la iteración 100 con semilla 1. Su relevancia radica en que ejemplifica el flujo actual de políticas robóticas pequeñas, entrenadas en simulación y exportadas a ONNX para despliegue en hardware de bajo coste.

La información pública es muy escasa: el repositorio pesa 0.0 GB, no declara licencia ni idiomas, y no incluye resultados de benchmarks ni detalles sobre la composición del dataset de entrenamiento más allá del identificador de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con mjlab, un entorno de aprendizaje por refuerzo construido sobre MuJoCo, sobre la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 1000 iteraciones y semilla 1, sobre una base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El checkpoint publicado corresponde a la iteración 100. La arquitectura concreta de la red (capas, tamaño, tipo de política) no se detalla en la model card.

El artefacto de inferencia es un `policy.onnx` que incluye el normalizador de observaciones integrado, de modo que el robot puede alimentar observaciones en bruto directamente. El `manifest.json` sigue el schema 2 del manifiesto de políticas microduck definido en `docs/policy-manifest.md` del repositorio del daemon. La propia model card advierte de que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Control motriz de un robot cuadrúpedo microduck: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz.
- Política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- Integración con el daemon `robotctl` mediante carga en un slot de política (`robotctl policy load <slot> nikghodki/microduck-heist-dgx1-100`).
- Normalización de observaciones incorporada en el modelo ONNX, lo que simplifica el pipeline de inferencia en el robot.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento simbólico: es exclusivamente una política de locomoción/control.

## Casos de uso

- Locomoción de un microduck en entornos simulados o reales: cargar la política en un slot del daemon y dejar que genere la marcha de forma continua a 50 Hz, útil para pruebas de gait y validación de hardware.
- Investigación en aprendizaje por refuerzo robótico: sirve como checkpoint de referencia de la tarea `Mjlab-SockHeist6m-MicroDuck` para comparar curvas de entrenamiento y reproducibilidad con otras semillas o configuraciones.
- Desarrollo de pipelines de despliegue sim-to-real: al estar en ONNX con normalizador integrado, permite probar la cadena completa de inferencia (observación bruta → acción) antes de portar la política a otro robot o a otro runtime.
- Docencia y prototipado con robots de bajo coste: el microduck y su ecosistema `robotctl` permiten experimentar con políticas de RL sin necesidad de infraestructura pesada.
- Benchmarking interno de mjlab: usar el checkpoint 100 como baseline para medir el efecto de cambios en recompensas, número de entornos o hiperparámetros.
- Integración en tests automatizados de regresión del daemon: verificar que el manifiesto schema 2 y la carga de políticas ONNX siguen funcionando con artefactos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política está pensada para ejecutarse en el propio robot o en un equipo ligero, pero no se declaran requisitos.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una DGX1 con 4096 entornos paralelos, pero no se especifica la GPU concreta ni los requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamaño declarado del repositorio (0.0 GB), es plausible que la inferencia quepa en CPU, pero no está confirmado en la información proporcionada.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` del microduck; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control), según la model card; no se publican medidas de latencia reales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de políticas para microduck ni resultados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Documentación mínima: no se especifican arquitectura de red, número de parámetros, composición del dataset de entrenamiento ni métricas de rendimiento.
- Entrenamiento no bit-reproducible: los autores advierten explícitamente de que repetir el entrenamiento produce pesos distintos, lo que complica la auditoría exacta del artefacto.
- Específica de hardware: la política está entrenada para el microduck (61 observaciones, 14 acciones, 50 Hz); no es transferible sin reentrenamiento o adaptación a otros robots.
- Riesgo de sim-to-real gap: al entrenarse en simulación (mjlab/MuJoCo), el comportamiento en el robot físico puede degradarse respecto al simulado; no se publican evaluaciones en hardware real.
- Checkpoint temprano: corresponde a la iteración 100 de un máximo de 1000, por lo que puede no representar la política mejor entrenada de la tarea.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero no se documentan sesgos de comportamiento (por ejemplo, asimetrías de marcha) ni modos de fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikghodki/microduck-heist-dgx1-100
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: https://github.com/pollen-robotics/microduck-challenges/commit/5cee942d8
- Base mjlab-microduck (commit): https://github.com/pollen-robotics/microduck-challenges/commit/1efd853be
