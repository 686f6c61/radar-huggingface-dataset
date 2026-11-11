# SeanLiu0272/a2a_real

## Resumen

a2a_real es un repositorio de checkpoints de políticas de imitación basadas en flow matching para tareas de manipulación robótica real, publicado por el usuario SeanLiu0272 en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un conjunto de pesos entrenados para control robótico de brazo y pinza en tareas concretas (tuerca/arandela, bolígrafo/armario y una tarea previa de fruta). El pipeline declarado es `robotics` y el repositorio ocupa 6,5 GB.

El artefacto principal documentado es una política `A2ANoiseImagePolicy` de 47,9M parámetros, entrenada sobre el dataset de teleoperación `fruitV3_40` (40 episodios, 30 Hz, cámara de cabeza `agentview_rgb` y cámara de muñeca `robot0_eye_in_hand_rgb` a 128x128, acción de 7 dimensiones). Posteriormente se añadieron dos ejecuciones completas de 500 épocas para las tareas nut/washer y pen/cabinet, cada una con cinco checkpoints guardados.

La relevancia de este repositorio es acotada y experimental: no hay model card con licencia, idiomas ni benchmarks estándar, y el número de descargas y likes es cero. Su interés reside en que expone checkpoints intermedios y finales de un pipeline de imitation learning con flow matching sobre robot real, junto con logs de entrenamiento y configuración reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación con flow matching (`A2ANoiseImagePolicy`, módulo `a2a_noise`); no es un transformer de lenguaje |
| Parametros totales | 47,9M (política fruitV3_40); no disponible para nut/washer y pen/cabinet |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada basada en observaciones de cámara y estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.ckpt`) cargados con `torch.load(..., pickle_module=dill, weights_only=False)`; incluye modelo, EMA y normalizador |

## Arquitectura y entrenamiento

La política sigue un esquema de imitation learning con flow matching, implementada en el módulo `a2a_noise` bajo la clase `A2ANoiseImagePolicy`. La entrada combina observaciones visuales de dos cámaras (cabeza y muñeca, 128x128 píxeles) con el estado del robot, y la salida es una acción de 7 dimensiones. El entrenamiento se realizó sobre datos de teleoperación real a 30 Hz. El repositorio incluye código en GitHub (`roboverse_learn/il/il_run_real_robot.sh` y `README_real_robot.md`) para reproducir el pipeline.

Los artefactos originales de fruit corresponden a un snapshot tomado a mitad de entrenamiento (épocas 0-156 de 500 planificadas), con un checkpoint `best.ckpt` en la época 25 y un MSE de validación de 0,00887, más un checkpoint aislado de la época 250 añadido después. Las ejecuciones nut/washer y pen/cabinet completaron 500 épocas cada una, con mejor época en la 10 y MSE de validación de 0,005429 y 0,003564 respectivamente. No se documenta composición del dataset más allá del número de episodios, ni uso de RLHF/DPO (no aplica en este dominio).

## Capacidades

- Control robótico de manipulación mediante políticas de imitación entrenadas por flow matching.
- Procesamiento de observaciones visuales multimodales: cámara de cabeza (`agentview_rgb`) y cámara de muñeca (`robot0_eye_in_hand_rgb`) a 128x128.
- Generación de acciones de 7 dimensiones a partir de estado y observación visual.
- Checkpoints reanudables: `latest.ckpt` incluye estado completo del optimizador y RNG para reanudar con `--resume`.
- Registro de métricas de validación (`val_action_mse`) y visualizaciones latentes (`latent_viz/`).
- No soporta tool calling, function calling, agentes multi-step, razonamiento textual ni capacidades multilingües: es un modelo de control, no de lenguaje.

## Casos de uso

- Investigación en imitation learning sobre robot real: el repositorio permite cargar checkpoints intermedios y finales para estudiar la evolución del entrenamiento y comparar épocas.
- Reproducción de experimentos: la inclusión de `split.json`, `run_info.json`, `.hydra/` y `launch_*.txt` permite replicar la configuración exacta con semilla 42 y split del 10% de episodios.
- Benchmarking de flow matching frente a otras políticas de imitación: los MSE de validación publicados (0,005429 y 0,003564) sirven como referencia para tareas de manipulación comparables.
- Desarrollo de pipelines de teleoperación: el código de GitHub y los scripts de lanzamiento documentan el flujo completo desde datos de teleop hasta política desplegable.
- Estudio de robustez visual en manipulación: el uso de dos cámaras (cabeza y muñeca) permite analizar el papel de cada vista en tareas de precisión como nut/washer o pen/cabinet.
- Reanudación de entrenamientos largos: el checkpoint `latest.ckpt` con estado completo del optimizador facilita continuar entrenamientos de 500 épocas en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo de control robótico. Los únicos datos de rendimiento son los MSE de validación de acción:

| Ejecución | Mejor época | MSE de validación de acción |
|---|---|---|
| fruitV3_40 (snapshot) | 25 | 0,00887 |
| nut_washer_v3_N77_20261108_192319 | 10 | 0,005429 |
| pen_cabinet_N67_20261108_072011 | 10 | 0,003564 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 47,9M parámetros y entradas de 128x128, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con suficiente VRAM para el runtime de PyTorch es suficiente.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo (47,9M parámetros).
- Opciones de despliegue: carga vía PyTorch (`torch.load` con `dill`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de imitación con flow matching para robot real) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso comercial ni restricciones, lo que impide su uso en producción sin aclaración previa del autor.
- Sin model card completa: faltan idiomas, licencia, benchmarks y documentación de sesgos.
- Los artefactos de fruit son un snapshot a mitad de entrenamiento (épocas 0-156 de 500); no representan un modelo final convergido.
- El checkpoint `latest.ckpt` y los logs corresponden a la época 156, mientras que `250.ckpt` se añadió por separado; puede haber inconsistencias entre artefactos.
- Riesgo de sobreajuste o baja generalización: los mejores MSE se alcanzan en épocas muy tempranas (10 y 25), lo que sugiere posible degradación posterior.
- Sin datos sobre sesgos, alucinación (no aplica en el sentido textual) ni robustez ante cambios de iluminación, fondo u objetos.
- Repositorio con cero descargas y cero likes: sin validación comunitaria ni evidencia de uso externo.
- El log binario de W&B fue omitido y el correo redactado, lo que limita la auditoría completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/SeanLiu0272/a2a_real
- Código: https://github.com/seanliu7081/A2A_Flow_Matching
- Script de entrenamiento: `roboverse_learn/il/il_run_real_robot.sh`
- Documentación: `roboverse_learn/il/README_real_robot.md`
- Run de W&B: `xcmtu4i1` (log binario no incluido en el repositorio)
