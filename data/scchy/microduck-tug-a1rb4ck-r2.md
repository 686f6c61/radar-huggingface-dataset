# SccHy/microduck-tug-a1rb4ck-r2

## Resumen

tug-a1rb4ck-r2 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX y distribuido con la librería `microduck`. El modelo se publica como una "política perpetua", es decir, una marcha que se ejecuta de forma continua hasta que se le indique lo contrario.

El modelo se carga en una ranura de política del demonio del robot mediante el comando `robotctl policy load` y está pensado para ejecutarse directamente sobre el hardware. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que la política consume observaciones en crudo sin preprocesado externo. El repositorio incluye un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (el README repite el nombre del modelo y describe el procedimiento de carga), sin licencia declarada y sin información sobre idiomas, benchmarks o composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo; red neuronal sin detalles publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna de la red: la model card no especifica número de capas, dimensiones ocultas, tipo de red (MLP, CNN, transformer) ni función de activación. Lo único verificable es la interfaz de la política: 61 entradas de observación, 14 salidas de acción y una frecuencia de ejecución de 50 Hz, con el normalizador de observaciones embebido en el propio grafo ONNX.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing`, commit `1efd853be`. No se detallan el número de pasos de entrenamiento, la composición del dataset, la función de recompensa, el algoritmo de RL empleado (PPO, SAC u otro) ni si hubo fases de ajuste fino o destilación. Tampoco se documenta ninguna innovación técnica específica más allá del carácter "perpetuo" de la política, que implica un bucle de control continuo sin condición de terminación interna.

## Capacidades

- Locomoción continua del robot microduck: la política genera comandos de marcha de forma indefinida hasta que se detiene externamente.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control de bajo nivel del robot.
- Consumo de observaciones en crudo: el normalizador está integrado en `policy.onnx`, lo que elimina la necesidad de preprocesado en el lado del robot.
- Carga en ranura de política mediante `robotctl policy load <slot> SccHy/microduck-tug-a1rb4ck-r2`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que facilita su integración en el ecosistema del demonio.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Investigación en locomoción con RL: sirve como política de referencia para comparar marchas entrenadas con la receta `challenge-recipe-publishing` del repositorio `microduck_rl`.
- Demostraciones de carga de políticas en hardware: permite validar el flujo `robotctl policy load` y el manifiesto de esquema 2 en un robot microduck real.
- Pruebas de robustez del bucle de control: al ser una política perpetua, se puede usar para estresar el demonio y medir comportamiento en ejecuciones prolongadas a 50 Hz.
- Evaluación de normalización embebida: útil para verificar que el pipeline de observaciones en crudo funciona sin capa de preprocesado adicional.
- Reproducción de experimentos: el commit y la rama documentados permiten intentar reproducir el entrenamiento con el mismo repositorio.
- Base para ajuste fino o destilación: al estar en ONNX, puede servir como punto de partida para entrenar variantes o para comparar arquitecturas de política sobre la misma interfaz de 61 observaciones y 14 acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio se reporta como 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma la cifra exacta de parámetros.
- GPU recomendadas: no disponible. Por el formato ONNX y el contexto de robótica embebida, es plausible que la inferencia se realice en CPU del propio robot, pero no está documentado.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: ONNX Runtime a través de la librería `microduck` y el demonio del robot (`robotctl`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control objetivo de 50 Hz.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables para el mismo robot ni alternativas de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial, redistribución o modificación.
- Model card mínima: no hay información sobre arquitectura, dataset, recompensa ni proceso de evaluación, lo que impide auditar el comportamiento de la política.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.
- Política perpetua sin condición de parada interna: requiere mecanismos externos de seguridad para detener el robot.
- Sin datos de robustez: se desconoce el comportamiento ante perturbaciones, terrenos no vistos o fallos de sensores.
- Específica del hardware microduck: no es transferible a otras plataformas sin reentrenamiento.
- No es un modelo de lenguaje: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K ni usarse para tareas de texto.
- Fecha de creación y actualización registradas en 2026-11-04: conviene verificar la vigencia y posibles actualizaciones del repositorio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-tug-a1rb4ck-r2
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de microduck
