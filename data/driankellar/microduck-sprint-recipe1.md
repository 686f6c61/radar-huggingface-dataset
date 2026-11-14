# DrIanKellar/microduck-sprint-recipe1

## Resumen

`microduck-sprint-recipe1` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto MicroDuck, desarrollado por Pollen Robotics. No es un modelo de lenguaje, sino un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuación a 50 Hz, empaquetado en formato ONNX y distribuido con la librería `microduck`. Su propósito es proporcionar una marcha ("gait") perpetua que se ejecuta de forma continua hasta que el operador la detiene, cargándose en una ranura de política del demonio de control del robot.

El modelo se entrenó con el entorno de simulación `mjlab` (basado en MuJoCo) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos y hasta 3000 iteraciones, usando la semilla 1. La model card documenta el commit exacto, el checkpoint (1000) y la versión base del simulador, lo que facilita la reproducción del pipeline de entrenamiento, aunque el autor advierte que el entrenamiento por RL en GPU no es reproducible bit a bit.

Es relevante para la comunidad de robótica porque ejemplifica el flujo completo de simulación a realidad (sim-to-real) en un robot cuadrúpedo de bajo coste, con un formato de distribución estandarizado (manifiesto de política esquema 2) y normalización de observaciones integrada en el propio grafo ONNX. El repositorio, sin embargo, no incluye pesos en safetensors ni información sobre licencia, idiomas o benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (controlador RL), exportada a ONNX; topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se detalla en la model card; se describe únicamente como una política de refuerzo con 61 observaciones de entrada y 14 acciones de salida, ejecutada a 50 Hz. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El manifiesto sigue el esquema 2 del manifiesto de políticas de microduck (`docs/policy-manifest.md` en el repositorio del demonio).

El entrenamiento se realizó con `mjlab-microduck 0.1.0` (commit `1efd853be`) sobre el repositorio `microduck-challenges` (commit `5cee942d8`), tarea `Mjlab-Sprint2m-MicroDuck`, semilla 1, checkpoint 1000, con 4096 entornos paralelos y un máximo de 3000 iteraciones configurado. No se especifican el número de tokens (no aplica), la composición del dataset de simulación, ni si hubo fases de RLHF o DPO (no aplica a RL de control). La model card advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas.

## Capacidades

- Control locomotor de un robot cuadrúpedo MicroDuck con 14 actuadores a 50 Hz.
- Marcha perpetua: la política se ejecuta de forma continua hasta recibir una orden de parada.
- Consumo de observaciones crudas de 61 dimensiones con normalización integrada en el grafo ONNX.
- Carga en una ranura de política del demonio mediante `robotctl policy load <slot> DrIanKellar/microduck-sprint-recipe1`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- No incluye modo "thinking" ni mecanismos de planificación de alto nivel.

## Casos de uso

- Locomoción básica en el robot MicroDuck: cargar la política en una ranura y ejecutar una marcha continua para desplazamiento en terreno llano, aprovechando la frecuencia de 50 Hz para control en tiempo real.
- Pruebas de sim-to-real: servir como referencia de política entrenada en `mjlab` para comparar el comportamiento en simulación frente al robot físico con el mismo commit y semilla.
- Base para experimentos de RL en robótica de bajo coste: reutilizar el pipeline documentado (`uv sync`, `uv run train ...`) para entrenar variantes con otras semillas o tareas del repositorio `microduck-challenges`.
- Benchmark de controladores: usar esta política como línea base en comparaciones de marchas (gaits) dentro de la misma plataforma MicroDuck.
- Demostraciones educativas: ilustrar el flujo completo de entrenamiento por refuerzo, exportación a ONNX y despliegue en un cuadrúpedo de código abierto.
- Integración en pipelines de validación: cargar la política en CI o en entornos de prueba del demonio para verificar que el manifiesto esquema 2 y el ONNX se interpretan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la política es una red pequeña de control, por lo que se espera que quepa en GPU de consumo, aunque no se confirma en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del artefacto (inferior a 1 GB) es plausible, pero no se aporta dato.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el demonio `robotctl` del proyecto microduck; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la política está diseñada para ejecutarse a 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de control comparables para MicroDuck ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- No hay información sobre sesgos, pero al ser una política de RL entrenada en simulación, puede presentar comportamientos frágiles ante condiciones no vistas (terrenos irregulares, perturbaciones, desgaste del hardware).
- Riesgo de fallo en sim-to-real: la model card no documenta pruebas en robot físico ni métricas de robustez.
- Reproducibilidad limitada: el autor advierte que reentrenar con la misma semilla produce pesos comparables pero no idénticos.
- Sin datos de idiomas ni capacidades lingüísticas (no aplica al ser un controlador).
- El repositorio no incluye pesos en safetensors ni información sobre cuantización; el único artefacto documentado es `policy.onnx`.
- Dependencia de la versión del demonio y del esquema 2 del manifiesto; cambios de esquema pueden romper la carga.

## Enlaces

- Hugging Face: https://huggingface.co/DrIanKellar/microduck-sprint-recipe1
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `5cee942d8` en `microduck-challenges`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa)
