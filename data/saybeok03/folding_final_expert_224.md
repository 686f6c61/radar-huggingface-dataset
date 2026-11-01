# saybeok03/folding_final_expert_224

## Resumen

`saybeok03/folding_final_expert_224` es un modelo visión-lenguaje-acción (VLA) especializado en una única tarea robótica: doblar una camiseta. Se trata de un fine-tuning del modelo base `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅ (Pi05) de Physical Intelligence, un VLA disenado para generalización en entornos abiertos. El autor del ajuste es el usuario de HuggingFace `saybeok03`, y el modelo se distribuye con licencia Apache 2.0.

El modelo consume observaciones multimodales —estado del robot de 16 dimensiones y tres cámaras RGB de 224×224 (base, muñeca izquierda y muñeca derecha)— y produce un vector de acción de 16 dimensiones para un robot bimanual de tipo `bi_openarm_follower`. Con 4.143.404.816 parámetros y un repositorio de 9,4 GB en formato safetensors, es un modelo de gran tamano para el estándar de políticas de imitación robótica, lo que refleja la componente de modelo de lenguaje y visión heredada de π₀.₅.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación en LeRobot (grabación de datos, fine-tuning de π₀.₅ y despliegue con `lerobot-rollout`) aplicado a una tarea de manipulación deformable. No es un modelo de propósito general ni un chatbot: es una política entrenada con 50 episodios y 135.351 frames a 30 FPS sobre el dataset `saybeok03/full_folding_pi05_224`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (π₀.₅ / Pi05), implementación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la tarea se especifica en inglés: "Fold the T-shirt properly") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la adaptación en LeRobot del VLA π₀.₅ de Physical Intelligence, que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La política recibe como entrada `observation.state` con forma `(16,)` y tres imágenes `(3, 224, 224)` procedentes de las cámaras `base`, `left_wrist` y `right_wrist`, y emite una acción `(16,)`. El robot objetivo es `bi_openarm_follower`, una plataforma bimanual. No se detalla en la información disponible la composición interna del backbone, el número de tokens de entrenamiento del modelo base ni si hubo etapas de RLHF o DPO; la model card solo referencia la implementación OpenPI.

El ajuste se realizó con LeRobot 0.6.1 sobre el dataset `saybeok03/full_folding_pi05_224`: 50 episodios, 135.351 frames a 30 FPS, con la tarea "Fold the T-shirt properly". La configuración de entrenamiento fue de 5.000 pasos, batch size 32, optimizador AdamW, learning rate 3,75e-05 y semilla 1000. Es, por tanto, un fine-tuning de imitación supervisada de escala moderada sobre una única tarea de manipulación deformable, no un entrenamiento desde cero.

## Capacidades

- Generación de acciones motoras bimanuales de 16 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: tres vistas simultáneas (base y dos muñecas) a resolución 224×224.
- Ejecución de una tarea de manipulación deformable concreta: doblar una camiseta.
- Control de un robot bimanual `bi_openarm_follower` mediante el stack LeRobot.
- Despliegue en tiempo real a 30 FPS mediante `lerobot-rollout` con la estrategia `base`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento. Es una política de imitación, no un modelo conversacional.

## Casos de uso

- Doblado automatizado de camisetas en un banco de pruebas: el modelo ejecuta la política entrenada sobre el robot `bi_openarm_follower` con las tres cámaras configuradas, usando `lerobot-rollout` con `--task="Fold the T-shirt properly"`.
- Reproducción de un pipeline de imitación completo: sirve como referencia para grabar un dataset propio con LeRobot, fine-tunear π₀.₅ desde `lerobot/pi05_base` y desplegar la política resultante.
- Investigación en manipulación deformable: punto de partida para estudiar la transferencia de un VLA preentrenado a una tarea de plegado con solo 50 episodios.
- Evaluación de robustez frente a variaciones de iluminación, posición de la prenda y distractores: la política puede ejecutarse repetidamente con `--duration` acotado para medir tasas de éxito.
- Benchmark interno de hardware bimanual: comparar el rendimiento del mismo checkpoint en distintas configuraciones de robot o de cámaras del mismo tipo.
- Docencia y formación en robótica de imitación: ejemplo mínimo y reproducible de extremo a extremo con comandos CLI documentados.
- Base para un ajuste posterior a otra tarea de plegado: al ser un fine-tuning de π₀.₅ con licencia Apache 2.0, puede reutilizarse como punto de partida de nuevos fine-tunings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla vacía para reportar tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros, en precisión de 16 bits los pesos ocuparían aproximadamente 8,3 GB, y en 32 bits unos 16,6 GB, sin contar activaciones ni buffers de las tres cámaras; son estimaciones derivadas del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano de pesos, una GPU con 16 GB o más podría alojar el modelo en FP16, pero no hay validación publicada.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` (estrategia `base`) para inferencia y `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se publica latencia de inferencia ni tasa de éxito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/folding_final_expert_224` | 4.143.404.816 | no disponible | Doblado de camiseta, robot bimanual | Apache 2.0 | HuggingFace (18 descargas) |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base para generalización en entornos abiertos | no disponible en la información | HuggingFace (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA predecesor de π₀.₅ | no disponible en la información | Repositorio OpenPI |

La comparación con alternativas de la misma categoría (otras políticas de imitación para plegado de ropa) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Fold the T-shirt properly") y un único tipo de robot (`bi_openarm_follower`); no se espera generalización a otras tareas, objetos o plataformas.
- Dataset pequeno: 50 episodios y 135.351 frames, con 5.000 pasos de entrenamiento; riesgo alto de sobreajuste al entorno de grabación.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación (`base`, `left_wrist`, `right_wrist`) y con la resolución 224×224.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; al ser un modelo de acción, los fallos se manifiestan como movimientos incorrectos o bloqueos, no como texto erróneo.
- Idiomas: no disponible; la instrucción de tarea está en inglés y el modelo no es conversacional.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `lerobot/pi05_base` y el método π₀.₅ deben citarse según indique su propia licencia.
- Requiere hardware robótico físico y el stack LeRobot 0.6.1 o compatible para su despliegue; no es utilizable como modelo de texto o visión aislado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saybeok03/folding_final_expert_224
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
