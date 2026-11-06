# SccHy/microduck-roller-a1rb4ck-r1

## Resumen

roller-a1rb4ck-r1 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es un controlador neuronal que traduce observaciones del robot (61 dimensiones) en acciones de actuación (14 dimensiones) a 50 Hz, pensado para ejecutarse en el propio robot sobre ruedas. Lo publica el usuario SccHy en Hugging Face con la librería `microduck` y formato ONNX.

La política se describe como "perpetua": una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, cargada en una ranura de política del demonio `robotctl`. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo.

Por su naturaleza, la ficha se centra en los aspectos de despliegue robótico (entrenamiento RL, formato ONNX, integración con `robotctl`) y no en capacidades lingüísticas, que no aplican. La información pública disponible es muy escasa: cero descargas, cero likes y un repositorio de 0,0 GB, lo que sugiere que los pesos no están efectivamente alojados o que el artefacto es mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportado a ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |
| Tarea | reinforcement-learning |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna de la red (número de capas, tipo de capas, función de activación ni tamaño). Lo que sí se documenta es el contrato de entrada/salida: 61 dimensiones de observación y 14 dimensiones de acción, ejecutándose a 50 Hz sobre el robot microduck equipado con ruedas. El normalizador de observaciones está embebido en el propio grafo ONNX, lo que simplifica la integración en el demonio del robot.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing`, commit `1efd853be`. No se especifican el número de pasos de entrenamiento, la composición del entorno, el algoritmo RL concreto (PPO, SAC, etc.), ni si hubo currículum o domain randomization. Tampoco se indica el tamaño del modelo ni el coste computacional del entrenamiento.

## Capacidades

- Control locomotor continuo del robot microduck sobre ruedas mediante una marcha perpetua.
- Consumo de observaciones en crudo de 61 dimensiones con normalización interna.
- Producción de acciones de 14 dimensiones a 50 Hz, compatible con el bucle de control del demonio `robotctl`.
- Carga dinámica como política en una ranura (`slot`) del robot mediante `robotctl policy load`.
- Ejecución indefinida hasta recibir una orden de parada o sustitución de política.
- Despliegue en formato ONNX, lo que permite inferencia portable en el propio robot o en entornos compatibles con ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es exclusivamente una política de control motriz.

## Casos de uso

- Demostración de locomoción perpetua en microduck: cargar la política en una ranura y dejar que el robot ruede de forma continua para exhibiciones o vídeos de laboratorio.
- Base para experimentos de aprendizaje por refuerzo: sirve como política de referencia o punto de partida para comparar recetas de entrenamiento en `microduck_rl`.
- Evaluación de recetas de entrenamiento RL: al estar publicada bajo la rama `challenge-recipe-publishing`, permite reproducir y contrastar la receta concreta del autor.
- Integración en pipelines de control con `robotctl`: útil para probar el flujo de carga de políticas, el manifiesto schema 2 y la sustitución en caliente de marchas.
- Prototipado de comportamientos sobre ruedas: punto de partida para modificar la política o combinarla con capas de control de alto nivel (navegación, parada de emergencia).
- Docencia e investigación en robótica de bajo coste: el microduck es una plataforma accesible y esta política ilustra el ciclo completo observación-acción en un robot real.
- Benchmark interno de latencia: al ejecutarse a 50 Hz y en ONNX, permite medir el coste de inferencia en el hardware del robot y ajustar el bucle de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de la marcha ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del modelo no se publica y el repositorio ocupa 0,0 GB, por lo que probablemente es un artefacto muy pequeño.
- GPU recomendadas: no aplica necesariamente; al ser una política de control a 50 Hz y en ONNX, está pensada para ejecutarse en el propio robot o en hardware embebido compatible con ONNX Runtime.
- Compatibilidad con GPU de consumo: no disponible; no se especifica.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el demonio `robotctl` del ecosistema microduck mediante `robotctl policy load <slot> SccHy/microduck-roller-a1rb4ck-r1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control declarado es de 50 Hz (20 ms por ciclo); no se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas públicas para microduck con las que comparar parámetros, contexto, rendimiento o licencia. La comparación con modelos de lenguaje no es pertinente por la naturaleza del artefacto.

## Limitaciones y advertencias

- Información pública mínima: sin licencia declarada, sin idiomas, sin descripción de arquitectura y sin métricas; evaluar su uso en producción requiere inspección directa del ONNX y del manifiesto.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni para redistribución; hay que contactar con el autor o consultar el repositorio de origen.
- Repositorio de 0,0 GB: posible que los pesos no estén realmente alojados o que el artefacto sea incompleto; verificar la descarga antes de integrarlo.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de que la política funcione fuera del entorno del autor.
- Comportamiento "perpetuo": la política está diseñada para ejecutarse hasta que se le indique lo contrario; en un robot real esto exige mecanismos externos de parada de emergencia y supervisión.
- Específica para microduck sobre ruedas: no es transferible a otras plataformas ni a configuraciones con patas sin reentrenamiento.
- Sin datos de robustez: no se documenta el comportamiento ante perturbaciones, terrenos irregulares, fallos de sensores o cambios de carga.
- Riesgo de sobreajuste a la receta de entrenamiento concreta (rama `challenge-recipe-publishing`, commit `1efd853be`); la reproducibilidad depende de que ese código siga disponible.
- No aplica riesgo de alucinación ni sesgos lingüísticos, pero sí posibles sesgos de simulación si el entrenamiento se realizó en un entorno simulado no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-roller-a1rb4ck-r1
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be` (sin URL directa en la información proporcionada)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (sin URL directa en la información proporcionada)
