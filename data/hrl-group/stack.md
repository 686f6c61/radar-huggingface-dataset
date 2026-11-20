# HRL-Group/stack

## Resumen

HRL-Group/stack es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por HRL-Group y publicado en Hugging Face Hub a través de la librería LeRobot de Hugging Face, con fecha de creación en noviembre de 2026.

El modelo resuelve el problema de control robótico de manipulación: dado un estado articular de 6 dimensiones y una imagen de cámara de muñeca de 480x640 píxeles, genera comandos de acción de 6 dimensiones para un robot seguidor de tipo `so_follower`. Se ha entrenado específicamente para dos tareas de manipulación con cubos: recoger un cubo y colocarlo en una bandeja, y apilar un cubo sobre otro.

Con 51.668.614 parámetros (aproximadamente 51,7 millones), es un modelo compacto orientado a inferencia en tiempo real a 30 FPS. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en robots reales de bajo coste, aunque carece de evaluación publicada y de licencia definida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponible (modelo de robótica, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura emplea un transformer que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo consume dos modalidades: el estado propioceptivo del robot (`observation.state`, vector de 6 dimensiones) y una imagen de la cámara de muñeca (`observation.images.wrist`, tensor de 3x480x640). La salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó sobre el dataset HRL-Group/stack, compuesto por 82 episodios y 196.610 frames a 30 FPS, con dos tareas anotadas: "Pick up the cube and place it in the tray" y "Pick up one cube and stack it on top of the other cube". La configuración de entrenamiento fue de 100.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot versión 0.7.0. No se especifica si hubo RLHF, DPO ni aumentación de datos adicional.

## Capacidades

- Control robótico de manipulación mediante imitación: genera comandos de acción de 6 dimensiones a partir de estado articular e imagen de muñeca.
- Predicción de action chunks: emite secuencias cortas de acciones, lo que mejora la suavidad y estabilidad del movimiento frente a políticas paso a paso.
- Percepción visual monocámara: procesa imágenes RGB de 480x640 a 30 FPS desde una cámara de muñeca.
- Ejecución de tareas de pick-and-place y apilamiento de cubos, según las dos tareas del dataset de entrenamiento.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento; es un modelo puramente motor-visual.

## Casos de uso

- Manipulación pick-and-place en línea de montaje: el modelo puede recoger un cubo y depositarlo en una bandeja, adecuado para tareas de clasificación de piezas pequeñas en un robot `so_follower` con cámara de muñeca.
- Apilamiento de objetos: entrenado específicamente para apilar un cubo sobre otro, útil en escenarios de ensamblaje simple o demostraciones de destreza.
- Investigación en aprendizaje por imitación: sirve como política de referencia para reproducir el método ACT con LeRobot y comparar variantes de entrenamiento.
- Prototipado rápido de robots de bajo coste: al ser un modelo de 51,7 M de parámetros y 0,2 GB, puede desplegarse en hardware modesto para validar flujos de teleoperación e inferencia.
- Docencia y formación en robótica: ejemplo completo de pipeline LeRobot (grabación de datos, entrenamiento, rollout) para cursos prácticos.
- Benchmark interno de políticas: base para medir éxito en tareas de manipulación con cubos antes de escalar a políticas mayores o datasets más amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; el cuello de botella real es el procesamiento de imagen a 30 FPS.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU para inferencia a baja frecuencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de robótica).
- Latencia y throughput: el modelo está diseñado para operar a 30 FPS, pero no se proporcionan medidas de latencia ni throughput reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRL-Group/stack (ACT) | 51,7 M | No disponible | Manipulación con cubos | No disponible | Hugging Face |
| Otras políticas ACT en LeRobot | Variable (típicamente 10-80 M) | No disponible | Manipulación genérica | Variable según autor | Hugging Face |
| Políticas Diffusion Policy | Variable | No disponible | Manipulación | Variable | Hugging Face / repos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad.
- Entrenamiento limitado a dos tareas concretas con cubos; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Dependencia de una única cámara de muñeca; cambios de iluminación, oclusiones o distracciones pueden degradar el rendimiento.
- Licencia no especificada ("More Information Needed"), lo que impide confirmar si el uso comercial está permitido.
- Riesgo de sobreajuste al dataset de 82 episodios y a la configuración exacta del robot `so_follower`.
- No es un modelo de lenguaje: no soporta texto, tool calling ni razonamiento; cualquier uso fuera de control robótico no está contemplado.
- Sin información sobre sesgos, alucinación o robustez fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
