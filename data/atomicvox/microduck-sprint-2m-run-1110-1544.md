# atomicvox/microduck-sprint-2m-run-1110-1544

## Resumen

`atomicvox/microduck-sprint-2m-run-1110-1544` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que produce directamente las 14 acciones de actuación del robot a partir de una observación de 61 dimensiones, ejecutándose en bucle a 50 Hz. La política se distribuye en formato ONNX, con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor puede alimentar observaciones en crudo.

El modelo lo publica el usuario `atomicvox` dentro de su repositorio de retos `microduck-challenges`, y corresponde a un entrenamiento concreto identificado por el par `run-1110-1544` y el checkpoint 1500. La tarea es `Mjlab-Sprint2m-MicroDuck`, es decir, una marcha de sprint de 2 metros simulada con mjlab (entorno de RL basado en MuJoCo) sobre 4096 entornos paralelos y 2000 iteraciones máximas. El resultado es una política "perpetua": una marcha que se ejecuta de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada pero específica: sirve como ejemplo reproducible de un pipeline completo de entrenamiento de locomoción con RL para un robot de bajo coste, y como artefacto desplegable directamente en el daemon del robot mediante `robotctl policy load`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere un artefacto muy ligero (red pequeña en ONNX) o un repositorio aún sin pesos publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (formato ONNX; cuantización no documentada) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint | 1500 |
| Semilla | 1 |
| Base de entrenamiento | `mjlab-microduck 0.1.0 @ 1efd853be` |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando mjlab, un entorno construido sobre MuJoCo, con 4096 entornos paralelos y un máximo de 2000 iteraciones. El artefacto final es una red neuronal que mapea observaciones de 61 dimensiones a 14 acciones, con el normalizador de observaciones integrado en el grafo ONNX. El entrenamiento se realizó en la GPU del autor con la semilla 1 y el commit `8e6e09ccd` del repositorio `atomicvox/microduck-challenges`, sobre la base `mjlab-microduck 0.1.0` en el commit `1efd853be`. El checkpoint publicado es el 1500.

No se documenta en la model card la topología exacta de la red (número de capas, anchura, función de activación), el algoritmo de RL empleado (PPO u otro), ni la composición del reward o del dominio de aleatorización. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no los mismos pesos. La política es de tipo "perpetuo": no tiene condición de terminación por tarea, sino que mantiene la marcha indefinidamente.

## Capacidades

- Locomoción continua de tipo sprint para el robot microduck, ejecutada a 50 Hz hasta recibir una orden de parada.
- Control directo de las 14 articulaciones/actuadores del robot a partir de 61 observaciones.
- Normalización de observaciones embebida: acepta observaciones en crudo sin preprocesado externo.
- Despliegue mediante el daemon del robot con `robotctl policy load <slot> atomicvox/microduck-sprint-2m-run-1110-1544`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`manifest.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, multilingüismo ni modalidades de visión o audio: es exclusivamente un controlador motor.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en un slot del daemon y ejecutar una marcha de sprint continua para validar el hardware y el firmware del robot en banco de pruebas.
- Reproducción de experimentos de RL: clonar `microduck-challenges` en el commit `8e6e09ccd`, ejecutar el comando de entrenamiento documentado y comparar la política resultante con este checkpoint para estudiar la varianza entre ejecuciones.
- Punto de partida para fine-tuning o currículos de locomoción: usar esta política como referencia base en la tarea `Mjlab-Sprint2m-MicroDuck` y modificarla para tareas derivadas (giros, terrenos irregulares, velocidades variables).
- Benchmark interno de pipelines de RL: servir como artefacto de comparación para medir el efecto de cambios en el entorno de simulación, el reward o el número de entornos paralelos.
- Integración en tests de CI del daemon de microduck: cargar la política en un entorno simulado o en hardware de laboratorio para verificar que el cargador de políticas y el esquema de manifiesto funcionan de extremo a extremo.
- Docencia y divulgación: ejemplo mínimo y reproducible de un flujo completo simulación-a-robot con un cuadrúpedo de bajo coste, útil en cursos de robótica y RL aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del artefacto (política de 61 entradas y 14 salidas en ONNX, repositorio de 0.0 GB) es previsible que sea del orden de kilobytes a pocos megabytes, ejecutable en CPU.
- GPU recomendadas para inferencia: no aplica; el control a 50 Hz es trivial para CPU. Para reentrenamiento, se requiere una GPU compatible con mjlab/MuJoCo; el modelo no especifica el hardware usado.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad, dado el tamaño del artefacto; no se documenta ningún requisito específico.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y el daemon de microduck mediante `robotctl policy load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables de locomoción con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso de uso comercial ni de redistribución; hay que contactar con el autor antes de integrarlo en producto.
- Artefacto sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el comando no genera los mismos pesos, lo que complica la auditoría exacta del resultado.
- Ámbito muy restringido: solo ejecuta una marcha de sprint; no se documentan capacidades de giro, frenado, recuperación de caídas ni adaptación a terrenos.
- Sin datos de robustez: no se publican métricas de sim-to-real, tasa de caídas ni comportamiento ante perturbaciones.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí existe riesgo de comportamiento inseguro en hardware real si la política se ejecuta sin supervisión ni parada de emergencia.
- Sin información sobre sesgos, idiomas ni limitaciones de contexto, por no ser aplicables a este tipo de modelo.
- Dependencia del ecosistema microduck y del esquema 2 del manifiesto: cambios en el daemon o en la definición de observaciones/acciones pueden invalidar la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-sprint-2m-run-1110-1544
- Repositorio de retos y entrenamiento: https://github.com/atomicvox/microduck-challenges
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (ruta citada en la model card; URL exacta no disponible)
