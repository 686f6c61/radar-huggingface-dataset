# rbalazs/act_allcups_merged_left

## Resumen

`rbalazs/act_allcups_merged_left` es una política robótica de manipulación entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos (chunks) de acciones en lugar de pasos individuales. El modelo lo publica el usuario rbalazs sobre la librería LeRobot de Hugging Face y está pensado para controlar un brazo seguidor de bajo coste del tipo `so_follower` (familia SO-100) equipado con dos cámaras: `front` e `iphone`.

No se trata de un modelo de lenguaje: es una política de control visuomotor. Consume un vector de estado de 6 dimensiones (`observation.state`) y dos flujos de imagen RGB de 480x640 (`observation.images.front` e `observation.images.iphone`), y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros totales y un repositorio de 6,2 GB, está entrenada sobre el conjunto `rbalazs/AllCupsTrimMerged` (239 episodios, 72.886 fotogramas a 30 FPS) para tres tareas de recogida y depósito de vasos.

Su relevancia es la habitual de las políticas ACT: sirve como referencia reproducible para tareas de manipulación simple, se ejecuta en hardware de consumo y demuestra un flujo completo de teleoperación, grabación de datos, entrenamiento y despliegue con LeRobot. Se publica bajo licencia Apache 2.0, aunque el autor no ha facilitado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de observaciones, encoder/decoder de acciones y CVAE condicional |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de chunk de acciones no especificado en la informacion) |
| Tipos de cuantizacion | no disponible; no se han publicado variantes cuantizadas (pesos en safetensors) |
| Idiomas soportados | no aplica: no procesa lenguaje natural; la instruccion de tarea se usa como metadato del episodio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un autoencoder variacional condicional (CVAE). El modelo codifica las observaciones (estado propioceptivo de 6 dimensiones y dos imágenes RGB de 480x640 procesadas por encoders visuales de tipo ResNet) y decodifica un chunk de acciones de 6 grados de libertad en lugar de una única acción por paso. La componente CVAE (con una variable latente que se fija a la media en inferencia) modela la multimodalidad de las demostraciones humanas, mientras que la predicción por chunks reduce el error de acumulación típico de las políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `rbalazs/AllCupsTrimMerged`: 239 episodios, 72.886 fotogramas a 30 FPS, con tres tareas de manipulación ("Pick up the middle cup and put it down", "Pick up the right cup and put it down", "Pick up the left cup and put it down"). La configuración declarada es de 50.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documentan fases de RLHF, DPO ni refinamiento por refuerzo; se trata de aprendizaje supervisado puro a partir de datos teleoperados. El nombre del modelo ("merged_left") sugiere la fusión de varios conjuntos de demostraciones, aunque el autor no detalla el proceso de mezcla.

## Capacidades

- Manipulación robótica por imitación: genera comandos de acción de 6 dimensiones para un brazo `so_follower`.
- Percepción visual multivista: procesa simultáneamente dos cámaras (`front` e `iphone`) a 480x640 píxeles.
- Predicción por chunks de acciones: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad del control.
- Ejecución de tres tareas concretas de pick-and-place sobre vasos (vaso central, vaso derecho y vaso izquierdo).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta razonamiento multi-paso simbólico ni planificación de alto nivel.
- No es multilingüe: no procesa ni genera lenguaje natural.
- No incluye modo de razonamiento (thinking), visión general, audio ni otras modalidades fuera de las dos cámaras de entrada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política toma el control de un brazo SO-100 y ejecuta la secuencia de recogida y depósito de un vaso a partir de las imágenes de las dos cámaras, sin necesidad de programar trayectorias explícitas.
- Banco de pruebas para investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, cambios en el dataset o nuevas técnicas de aumento de datos, dado que el dataset y la configuración de entrenamiento son públicos.
- Base para fine-tuning con nuevos objetos: al partir de pesos entrenados en 239 episodios, se puede reentrenar con demostraciones adicionales de otros objetos o posiciones para ampliar el repertorio de tareas.
- Docencia y formación en robótica: el flujo completo (teleoperación, grabación, entrenamiento y despliegue) documentado por LeRobot permite usarlo como ejemplo didáctico en cursos de manipulación.
- Validación de pipelines de despliegue en hardware de consumo: al ser un modelo de 51,7 M de parámetros, se puede ejecutar en GPU de gama media para verificar latencias y tasas de control antes de escalar a otros modelos.
- Demostración de manipulación con múltiples cámaras: útil para estudiar cómo influye la vista adicional `iphone` en la precisión de la política frente a configuraciones de cámara única.
- Prototipado de aplicaciones de robótica de bajo coste: al emplear un brazo de tipo SO-100 y cámaras convencionales, encaja en montajes económicos de laboratorio o de hobby.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito por tarea, número de ensayos ni condiciones de prueba documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 200 MB en fp32 y unos 100 MB en fp16; con los dos encoders visuales y los flujos de imagen de 480x640, la inferencia completa cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; por ejemplo RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas últimas muy sobredimensionadas para 51,7 M de parámetros).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo reciente e incluso en hardware integrado, aunque se recomienda GPU dedicada para garantizar el control a 30 FPS.
- Opciones de despliegue: flujo nativo de LeRobot mediante `lerobot-rollout`, con el robot `so_follower`, dos cámaras OpenCV y `--policy.path=rbalazs/act_allcups_merged_left`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el control se realiza a 30 FPS según la frecuencia del dataset de entrenamiento, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rbalazs/act_allcups_merged_left | 51,7 M | no disponible | sin evaluacion publicada | apache-2.0 | Hugging Face (LeRobot) |
| rbalazs/smolvla_allcups | no disponible (repo de 16,8 GB) | no disponible | no disponible | no disponible en la informacion | Hugging Face (LeRobot) |
| Diffusion Policy (metodo alternativo de imitacion) | no disponible | no disponible | no disponible | no disponible | implementaciones publicas, no comparadas aqui |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada. La unica referencia directa es el modelo `rbalazs/smolvla_allcups` del mismo autor, entrenado sobre un dataset de la misma familia ("AllCups"), pero sin especificaciones ni resultados publicados en los datos consultados.

## Limitaciones y advertencias

- No se han publicado evaluaciones en robot real: no hay tasas de exito ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Especializacion estrecha: la politica esta entrenada unicamente para tres tareas de recogida y deposito de vasos; es probable que falle ante objetos, posiciones o iluminaciones distintas a las del dataset.
- Dependencia del montaje exacto: la politica asume un robot `so_follower`, dos camaras concretas (`front` e `iphone`) a 480x640 y 30 FPS; cambiar la camara, la calibracion o la disposicion puede degradar el comportamiento.
- Riesgo de sobreajuste al dataset: con solo 239 episodios, la diversidad de demostraciones es limitada, lo que favorece la memorizacion de trayectorias.
- Sin resultados de robustez: no se documentan pruebas con posiciones nuevas de objetos, distractores, cambios de iluminacion ni robots equivalentes.
- Idioma: no procesa lenguaje natural; la instruccion de tarea se emplea como cadena de texto asociada al episodio y no como condicionamiento semantico general.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset `rbalazs/AllCupsTrimMerged` y citar el metodo ACT (arXiv:2304.13705) y LeRobot segun lo indicado en la model card.
- Caveat de produccion: al no existir evaluacion publicada, no se recomienda desplegarlo en entornos criticos sin una validacion exhaustiva previa en el montaje objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rbalazs/act_allcups_merged_left
- Dataset de entrenamiento: https://huggingface.co/datasets/rbalazs/AllCupsTrimMerged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rbalazs/AllCupsTrimMerged
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo relacionado del mismo autor: https://huggingface.co/rbalazs/smolvla_allcups
