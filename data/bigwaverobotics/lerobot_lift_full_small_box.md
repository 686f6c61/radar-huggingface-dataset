# Bigwaverobotics/lerobot_lift_full_small_box

## Resumen

`Bigwaverobotics/lerobot_lift_full_small_box` es una política de imitación para robótica manipulativa entrenada con el framework LeRobot de Hugging Face. Implementa la arquitectura ACT (Action Chunking Transformer), un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado, en lugar de acciones individuales. El modelo está especializado en la tarea concreta de "lift full small box" dentro de un escenario industrial de manipulación de cajas pequeñas y grandes.

El checkpoint tiene 51.637.904 parámetros (unos 51,6 millones) y un tamaño de repositorio de 0,2 GB, con los pesos en `safetensors`. Usa un backbone visual ResNet-18 y una ventana de observación de un solo paso (`n_obs_steps = 1`), con un horizonte de predicción de 50 acciones (`chunk_size = 50`). Es, por tanto, un modelo compacto orientado a control motor de precisión más que a razonamiento general.

Su relevancia es acotada pero clara: demuestra el flujo completo de entrenamiento y publicación de políticas ACT con LeRobot para tareas industriales específicas, bajo licencia Apache-2.0. No es un modelo de lenguaje ni un VLA generalista; es un artefacto de control entrenado sobre un dataset propio (`itdevhumanoid/lerobot_lift_full_small_box_dataset`) y pensado para desplegarse en el mismo stack robótico con el que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone visual ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); `n_obs_steps = 1`, `chunk_size = 50` |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (más `config.json`, preprocesador y postprocesador) |
| Tarea | lift full small box (manipulación industrial de cajas) |
| Framework | LeRobot (`lerobot`) |
| Dataset de entrenamiento | `itdevhumanoid/lerobot_lift_full_small_box_dataset` (referencia interna `bwr/dataset_21096`) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de imitación basada en transformer que, dada una observación (imágenes de cámara y estado del robot), predice un chunk de 50 acciones futuras de forma conjunta. Esto reduce el error de acumulación típico de las políticas que predicen acción a acción y suaviza la ejecución. El modelo incorpora un backbone visual ResNet-18 para extraer características de las imágenes, y un decodificador transformer que genera la secuencia de acciones. La configuración publicada indica `policy_type: act`, `chunk_size: 50`, `policy_n_action_steps: 50` y `n_obs_steps: 1`.

El entrenamiento es de imitación supervisada (behavior cloning) sobre el dataset `itdevhumanoid/lerobot_lift_full_small_box_dataset`, con normalización de observaciones y acciones mediante los procesadores incluidos en el repo (`policy_preprocessor_step_3_normalizer_processor.safetensors` y `policy_postprocessor_step_0_unnormalizer_processor.safetensors`). No se documenta en la model card el número de episodios, la composición del dataset, ni si hubo aumento de datos, RLHF o ajuste fino posterior. La model card menciona un escenario industrial de cajas pequeñas y grandes, con una serie de repos hermanos (pick → place → pack → lift → ship) que no se detallan.

## Capacidades

- Control robótico de manipulación: genera secuencias de 50 acciones para la tarea de levantar una caja pequeña en un entorno industrial.
- Percepción visual: procesa imágenes mediante un backbone ResNet-18 para condicionar la política.
- Imitación de demostraciones: aprende de trayectorias humanas registradas en el dataset de entrenamiento.
- Predicción en chunks: emite bloques de acciones coherentes temporalmente, lo que facilita movimientos suaves.
- Integración con LeRobot: se carga con `ACTPolicy.from_pretrained(...)` y los procesadores de normalización incluidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general (solo percepción para control).
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Automatización de picking industrial: la política puede ejecutar la secuencia de agarre y elevación de cajas pequeñas en una célula robotizada, usando las 50 acciones por chunk para un movimiento continuo y repetible.
- Prototipado rápido de tareas de manipulación: al estar entrenada con LeRobot, sirve como punto de partida para validar el pipeline de entrenamiento y despliegue en un brazo robótico antes de escalar a tareas más complejas.
- Benchmark interno de políticas ACT: permite comparar el rendimiento de variantes de la arquitectura (distintos backbones, chunk sizes) sobre una misma tarea de referencia.
- Investigación en behavior cloning: útil para estudiar el efecto del horizonte de predicción y de la ventana de observación en tareas de contacto como levantar objetos.
- Despliegue en laboratorio con GPU de consumo: sus ~51,6 M de parámetros y 0,2 GB permiten inferencia en tiempo real en hardware modesto, facilitando pruebas en robots de bajo coste.
- Generación de datos sintéticos o aumentados: la política puede ejecutarse en simulación para producir trayectorias adicionales que alimenten el entrenamiento de políticas más robustas.
- Integración en líneas de ensamblaje con cajas de distintos tamaños: la model card menciona un escenario de cajas pequeñas y grandes, por lo que puede formar parte de una cadena de tareas (pick, place, pack, lift, ship) coordinadas por un orquestador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para los ~51,6 M de parámetros; en la práctica, el consumo vendrá dominado por el backbone ResNet-18 y el tamaño de las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarán sin problema, aunque las GPUs de gama alta no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, con margen amplio).
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`), con PyTorch como backend. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware, la resolución de imagen y la frecuencia de control del robot; con 51,6 M de parámetros, la inferencia por chunk debería ser del orden de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bigwaverobotics/lerobot_lift_full_small_box` | 51,6 M | `chunk_size = 50`, `n_obs_steps = 1` | Lift de caja pequeña (industrial) | Apache-2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot (p. ej. `lerobot/act_aloha_*`) | ~50 M (típico) | `chunk_size` configurable | Manipulación diversa (ALOHA, etc.) | Apache-2.0 | Hugging Face |
| Políticas Diffusion Policy de LeRobot | variable | horizonte configurable | Manipulación diversa | Apache-2.0 | Hugging Face |
| OpenVLA | ~7 B | contexto de lenguaje | VLA generalista | Apache-2.0 (con condiciones) | Hugging Face |

La comparación con OpenVLA es solo orientativa: este modelo es una política ACT específica de tarea, no un VLA generalista, por lo que no compiten en el mismo régimen de uso. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("lift full small box"); no generaliza a otras tareas sin reentrenamiento.
- Sin datos de evaluación: no hay métricas publicadas de tasa de éxito, robustez ante variaciones de iluminación, posición de la caja o distractor, lo que impide estimar su fiabilidad en producción.
- Dependencia del dataset: el comportamiento está limitado por la distribución del dataset `itdevhumanoid/lerobot_lift_full_small_box_dataset`, cuyos detalles (número de episodios, diversidad, condiciones) no se documentan.
- Riesgo de sobreajuste a la configuración de cámara y robot del entrenamiento; cambios en la cinemática, calibración o montaje pueden degradar el rendimiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe presentarse como un modelo de lenguaje ni usarse para tareas de texto.
- La model card contiene rutas locales y referencias internas (`/Users/mypark/...`, `bwr/dataset_21096`) que no forman parte del artefacto público; conviene verificar la reproducibilidad del entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_lift_full_small_box
- Dataset de entrenamiento: https://huggingface.co/datasets/itdevhumanoid/lerobot_lift_full_small_box_dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
