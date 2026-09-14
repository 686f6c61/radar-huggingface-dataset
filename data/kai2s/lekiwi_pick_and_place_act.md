# kai2s/lekiwi_pick_and_place_act

## Resumen

kai2s/lekiwi_pick_and_place_act es una política de robótica, no un modelo de lenguaje. Está basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, y ha sido entrenada y publicada con la librería LeRobot de Hugging Face. Resuelve una tarea de manipulación concreta, "Pick up the cube and place it in the box", a partir de datos de teleoperación.

El modelo tiene 51.674.761 parámetros (unos 51,7 M) almacenados en formato safetensors, ocupa 0,2 GB en el repositorio y se distribuye bajo licencia Apache 2.0. Consume una observación de estado propioceptivo de 9 dimensiones y dos flujos de imagen RGB de 480x640 (cámaras `front` y `wrist`), y produce un vector de acción de 9 dimensiones. El conjunto de entrenamiento consta de 50 episodios y 10.223 fotogramas grabados a 30 FPS.

Su relevancia es principalmente práctica y pedagógica: es un ejemplo completo y reproducible de un pipeline de imitación sobre hardware de bajo coste con LeRobot 0.6.0. No incluye resultados de evaluación publicados y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder VAE condicional, según el artículo de referencia arXiv:2304.13705 |
| Parámetros totales | 51.674.761 (≈51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume una ventana de observaciones y predice un chunk de acciones) |
| Tipos de cuantización | no disponible (la model card no documenta cuantizaciones; pesos publicados en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la única entrada textual es la instrucción de tarea "Pick up the cube and place it in the box") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | lekiwi_client |
| Cámaras | front, wrist (RGB 480x640) |
| Entradas | `observation.state` (9,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (9,) |
| Dataset de entrenamiento | kai2s/lekiwi_pick_and_place (50 episodios, 10.223 fotogramas, 30 FPS) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-14 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso por inferencia. Según el artículo de referencia enlazado por el autor (Zhao et al., arXiv:2304.13705), la formulación combina un encoder de VAE condicional con un transformer que decodifica el chunk de acciones, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza el comportamiento en tareas de manipulación fina. La model card del repositorio no detalla el backbone visual ni la configuración concreta de capas, por lo que esos extremos no están disponibles.

El entrenamiento se realizó sobre el dataset kai2s/lekiwi_pick_and_place, compuesto por 50 episodios teleoperados y 10.223 fotogramas a 30 FPS para una única tarea. La configuración declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias, algo coherente con un pipeline de imitación supervisada.

## Capacidades

- Predicción de acciones de manipulación en forma de chunk para el robot LeKiwi (9 grados de libertad de acción).
- Fusión de estado propioceptivo (9 dimensiones) con dos vistas RGB simultáneas (`front` y `wrist`) de 480x640.
- Ejecución de una tarea concreta de pick-and-place: recoger un cubo y depositarlo en una caja.
- Inferencia en tiempo real a 30 FPS, la misma frecuencia a la que se grabó el dataset.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento o fine-tuning.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo de pensamiento (thinking), visión general, audio ni ninguna capacidad multimodal más allá de las dos cámaras de entrada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia completa de recoger el cubo y colocarlo en la caja a 30 FPS sobre un robot LeKiwi, sin necesidad de planificación simbólica ni percepción externa.
- Replicación del pipeline de imitación: sirve como punto de partida para grabar un dataset propio con `lerobot-train` y comparar curvas de entrenamiento bajo la misma configuración (100.000 pasos, batch 8, AdamW, lr 1e-5).
- Evaluación comparativa de políticas ACT: al ser un checkpoint público con configuración documentada, permite medir diferencias frente a otras políticas LeRobot sobre el mismo robot y la misma tarea.
- Docencia en aprendizaje por imitación: el par dataset + política permite explicar de extremo a extremo la teleoperación, el formateo de observaciones y la inferencia en bucle cerrado con hardware accesible.
- Pruebas de robustez ante variaciones del entorno: reproduciendo la tarea con cambios de iluminación, posición inicial del cubo o distracciones para caracterizar la generalización de una política entrenada con solo 50 episodios.
- Componente base en un stack de robótica mayor: la salida de 9 dimensiones puede integrarse como módulo de bajo nivel en un sistema que gestione seguridad, parada de emergencia y supervisión.
- Prototipado rápido de demostraciones: la ejecución con `--strategy.type=base` y `--duration=60` permite generar vídeos o validaciones de comportamiento sin registrar episodios adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica: "No evaluation results have been provided for this policy yet", y deja la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) sin rellenar. No se dispone por tanto de tasas de éxito en robot real, ni de comparaciones cuantitativas con otras políticas sobre la misma tarea.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 207 MB en FP32 y unos 103 MB en FP16, calculados a partir de los 51,7 M de parámetros (estimación).
- VRAM estimada para inferencia: por debajo de 1-2 GB incluyendo activaciones de dos imágenes de 480x640 (estimación); cifra no confirmada por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4070 o RTX 4090; también GPU de borde tipo Jetson para despliegue embarcado.
- Cabe sin problema en GPU consumer: el cuello de botella no es la memoria sino cumplir los 30 FPS con dos cámaras activas y el bucle de control del robot.
- Despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento) sobre PyTorch. Las opciones de servidor de LLM (vLLM, TGI, Ollama, llama.cpp) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato temporal conocido es que la tarea se graba y se ejecuta a 30 FPS.
- CPU: la inferencia en CPU es técnicamente posible por tamaño, pero no hay datos publicados que garanticen el tiempo real a 30 FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kai2s/lekiwi_pick_and_place_act | Política ACT (imitación) | 51,7 M | no aplica | apache-2.0 | Pública en Hugging Face |
| ACT de referencia (Zhao et al., 2023) | Método de imitación | no disponible en la información proporcionada | no aplica | no disponible | Artículo y código públicos |
| Otras políticas LeRobot de la misma familia (checkpoints ACT en el Hub) | Política ACT | no disponible en la información proporcionada | no aplica | variable, no disponible | Públicas en Hugging Face |
| Políticas basadas en difusión o VLA (por ejemplo, Diffusion Policy, SmolVLA, pi0) | Política robótica / VLA | no disponible en la información proporcionada | no aplica | no disponible | Públicas en Hugging Face |

La comparación cuantitativa no es posible con los datos aportados: no hay tasas de éxito publicadas para esta política ni cifras verificadas de los modelos alternativos en esta ficha, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para "Pick up the cube and place it in the box"; no se espera transferencia a otras tareas sin reentrenamiento.
- Dataset reducido: 50 episodios y 10.223 fotogramas implican riesgo alto de sobreajuste al entorno, la iluminación y las posiciones concretas de la grabación.
- Sin resultados de evaluación: no hay tasa de éxito medida en robot real, por lo que su fiabilidad en producción es desconocida.
- Dependencia del hardware: los nombres de cámara (`front`, `wrist`) y los índices y puertos deben coincidir con los del entrenamiento; un montaje distinto degrada o invalida el comportamiento.
- Sin capacidades de lenguaje: no interpreta instrucciones nuevas, no admite tool calling ni razonamiento simbólico; la tarea es fija.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erráticas o inseguras ante observaciones fuera de distribución.
- Sesgos: no documentados por el autor; al provenir de teleoperación humana, hereda los sesgos de movimiento del operador y del montaje utilizado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no ofrece ninguna garantía ni asunción de responsabilidad por parte del autor.
- Seguridad física: cualquier despliegue sobre un robot real requiere límites de par, parada de emergencia y supervisión humana; la política no incorpora capas de seguridad.
- Sin datos de latencia ni de consumo: no se puede garantizar el cumplimiento estricto de 30 FPS en hardware distinto al usado en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kai2s/lekiwi_pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/kai2s/lekiwi_pick_and_place
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kai2s/lekiwi_pick_and_place
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
