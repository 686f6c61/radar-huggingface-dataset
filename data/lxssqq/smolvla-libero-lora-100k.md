# lxssqq/smolvla-libero-lora-100k

## Resumen

SmolVLA LIBERO LoRA 100K es un adaptador LoRA publicado por el usuario lxssqq en Hugging Face, entrenado sobre el modelo base `lerobot/smolvla_base` de Hugging Face LeRobot. SmolVLA es un modelo vision-language-action (VLA) compacto diseñado para robótica: recibe imágenes de cámaras e instrucciones en lenguaje natural y genera acciones de control para un brazo robótico. Este adaptador se ha afinado específicamente sobre el benchmark de simulación LIBERO, cubriendo sus cuatro suites: Spatial, Object, Goal y LIBERO-Long (`libero_10`).

El problema que resuelve es la adaptación eficiente de una política VLA general a tareas de manipulación concretas sin reentrenar el modelo completo: con un rank de LoRA de 16 y un batch size de 4, el entrenamiento de 100.000 pasos se completó en unas 11,4 horas (40.940 segundos) en una sola GPU de consumo (RTX 5070 Ti Laptop, 12 GB). Esto demuestra que el fine-tuning de políticas VLA es viable en hardware doméstico, un punto relevante para investigadores con recursos limitados.

El modelo es relevante como referencia reproducible: el autor publica métricas detalladas de evaluación (macro media de 65,83% de éxito sobre los cuatro suites, 790/1200 episodios), configuraciones de entrenamiento (`train_config.json`) y resultados agregados (`evaluation_results.json`), todo bajo licencia Apache-2.0. No es un modelo de lenguaje general: es una política de robótica para simulación, sin validación todavía en robots físicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (los del modelo base `lerobot/smolvla_base`) |
| Parametros activos | no aplicable (no es MoE); el adaptador LoRA usa rank 16 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; inferencia con AMP (`use_amp=true`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, requiere el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de SmolVLA, la arquitectura VLA ligera del proyecto LeRobot de Hugging Face, que combina un backbone visión-lenguaje con una cabeza de acción que predice chunks de acciones para el control del robot. Sobre este modelo base se aplica un adaptador LoRA de rank 16 mediante la librería PEFT 0.21.2, de modo que los pesos del modelo base permanecen congelados y solo se entrenan las matrices de bajo rango. La longitud del chunk de acciones durante el entrenamiento fue de 50, aunque la configuración de inferencia validada usa `n_action_steps=10`, es decir, el robot ejecuta 10 pasos de acción por inferencia.

El entrenamiento se realizó durante 100.000 pasos con batch size 4 y seed 100000, sobre el dataset `lerobot/libero`, que contiene demostraciones de las cuatro suites LIBERO. Se empleó un scheduler de decaimiento coseno con 1.000 pasos de warmup y 100.000 pasos de decaimiento. El loss descendió de 0,649 en el primer punto registrado a 0,072 en el paso final. El entrenamiento completo (40.940 segundos de tiempo de pared) se ejecutó en una NVIDIA GeForce RTX 5070 Ti Laptop de 12 GB, con LeRobot 0.4.4 y PyTorch 2.10.0+cu128. El propio autor advierte que esta receta (LoRA rank 16, batch size 4) no es una reproducción completa de la receta del paper de SmolVLA, que usaba otra inicialización y un batch efectivo distinto.

## Capacidades

- Generacion de acciones de manipulación para brazos robóticos en simulación: predice chunks de acciones a partir de imágenes de dos cámaras y la instrucción de la tarea.
- Cobertura de los cuatro suites del benchmark LIBERO: Spatial (relaciones espaciales), Object (identificación de objetos), Goal (objetivos) y LIBERO-Long (`libero_10`, tareas largas de diez pasos de tareas).
- Compatibilidad con el pipeline de evaluación de LeRobot (`lerobot-eval`) sobre el entorno LIBERO.
- Carga como adaptador PEFT/LoRA sobre `lerobot/smolvla_base`, lo que permite combinarlo con otros adaptadores o fusionarlo si se desea.
- Inferencia acelerada con AMP en GPU CUDA.
- No es un chatbot ni un modelo de texto general: no genera texto, código ni razonamiento lingüístico; su salida son acciones de control.

## Casos de uso

- Investigación en políticas VLA: sirve como punto de partida reproducible para comparar recetas de fine-tuning (rank de LoRA, número de pasos, batch size) sobre LIBERO, gracias a que el autor publica seeds, configs y resultados completos.
- Benchmarking de adaptadores LoRA frente a fine-tuning completo: al ser un adaptador ligero, permite medir cuánto rendimiento se pierde o gana respecto a entrenar todos los pesos en el mismo dataset.
- Prototipado en hardware de consumo: el entrenamiento completo cabe en 12 GB de VRAM, por lo que grupos académicos pequeños pueden repetir el experimento sin GPUs de datacenter.
- Desarrollo de pipelines de evaluación automatizada: el comando `lerobot-eval` incluido en la model card permite integrar la evaluación por suites en scripts y CI de investigación.
- Estudio de la sensibilidad a `n_action_steps`: la configuración validada (`n_action_steps=10` frente a chunk de 50) es un caso práctico de ajuste de inferencia que afecta directamente a la tasa de éxito.
- Sim-to-real exploratorio: como punto de partida para intentar transferir políticas LIBERO a robots físicos, aunque el propio autor advierte que no hay validación en robot real.
- Docencia y formación: el repositorio es un ejemplo completo y documentado del ciclo entrenamiento-evaluación-publicación con LeRobot, PEFT y Hugging Face Hub.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador. Evaluación con 3 seeds (100000, 100001, 100002), 10 episodios por tarea, 10 tareas por suite, `n_action_steps=10`:

| Suite | Exito medio | Desviacion tipica muestral |
|---|---:|---:|
| Spatial | 59,33% | 3,21 pp |
| Object | 81,00% | 4,00 pp |
| Goal | 71,33% | 4,16 pp |
| LIBERO-Long (`libero_10`) | 51,67% | 4,62 pp |
| **Macro media (4 suites)** | **65,83%** | **2,18 pp** |

Total: 790/1200 episodios con éxito. La desviación tipica mide la varianza entre seeds de evaluación, no entre seeds de entrenamiento. No hay comparación directa publicada con otros checkpoints o políticas en la información disponible.

## Requisitos de hardware

- Entrenamiento del adaptador: se completó en una NVIDIA GeForce RTX 5070 Ti Laptop con 12 GB de VRAM (batch size 4, LoRA rank 16, AMP); por tanto, cualquier GPU de consumo con 12 GB o más de VRAM es suficiente para reproducir el fine-tuning.
- Inferencia: no se especifican cifras de VRAM; dado que el entrenamiento cabe en 12 GB, la inferencia del modelo base más el adaptador debería funcionar en GPUs de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 5070 Ti).
- GPU recomendadas: cualquier GPU CUDA moderna con al menos 8 GB; la referencia documentada es la RTX 5070 Ti Laptop (12 GB).
- Despliegue: a traves de la librería LeRobot (version 0.4.4 en el experimento original) con los extras `lerobot[smolvla,libero,peft]` y PEFT 0.21.2; no es un modelo de texto, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables.
- Software: PyTorch con soporte CUDA (2.10.0+cu128 en el experimento), dispositivo `cuda` y `use_amp=true` recomendados.
- Latencia y throughput: no disponibles; el throughput de inferencia depende de `n_action_steps` y del entorno de simulación.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Particularidad |
|---|---|---|---|---|
| lxssqq/smolvla-libero-lora-100k | Adaptador LoRA VLA | lerobot/smolvla_base | Apache-2.0 | 65,83% de exito macro en LIBERO; entrenado en GPU de 12 GB |
| lerobot/smolvla_base | Modelo VLA base | — | Apache-2.0 | Modelo general sin afinar a LIBERO; requiere fine-tuning para tareas concretas |
| Adaptadores LoRA LIBERO de la comunidad sobre SmolVLA | Adaptadores VLA | lerobot/smolvla_base | variable | Existen otros adaptadores en el Hub, pero sin metricas comparables publicadas en la informacion disponible |

No se dispone de datos de benchmarks comparativos directos con otras políticas (por ejemplo, pi0, ACT o Diffusion Policy sobre LIBERO) en la información proporcionada.

## Limitaciones y advertencias

- Solo se usó un seed de entrenamiento (100000); las tres seeds de evaluación estiman únicamente la aleatoriedad de la evaluación, no la varianza entre entrenamientos.
- La evaluación usa 10 episodios por tarea, por lo que los resultados tienen incertidumbre de muestreo apreciable (desviaciones de 2-5 puntos porcentuales).
- El adaptador solo ha sido probado en el entorno de simulación LIBERO; no hay validación en robots físicos, y la transferencia sim-to-real no está garantizada.
- La receta de entrenamiento (LoRA rank 16, batch size 4) no es una reproducción completa de la del paper de SmolVLA, que usaba otra inicialización y un batch efectivo distinto; los resultados no son directamente comparables con los publicados en el paper.
- Es un adaptador LoRA, no un checkpoint fusionado: requiere descargar `lerobot/smolvla_base` y usar el flujo de carga de LeRobot/PEFT compatible; no funciona de forma autónoma.
- La evaluación requiere un `rename_map` de las cámaras (`observation.images.image` → `observation.images.camera1`, etc.), un detalle de integración fácil de pasar por alto.
- Sesgos y riesgo de alucinación: no aplicables en el sentido de LLMs; el fallo típico es ejecutar acciones incorrectas en tareas fuera de la distribución de LIBERO.
- Restricciones de licencia: Apache-2.0, sin restricciones para uso comercial del adaptador, del modelo base y del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lxssqq/smolvla-libero-lora-100k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Organizacion LeRobot: https://huggingface.co/lerobot
- No se han encontrado enlaces a paper, blog o demo en la informacion disponible.
