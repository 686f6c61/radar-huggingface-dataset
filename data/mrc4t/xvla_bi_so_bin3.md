# MrC4t/xvla_bi_so_bin3

## Resumen

X-VLA (xvla) es un framework Vision-Language-Action (VLA) con *soft prompts* y *flow matching* que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto pequeño de embeddings de Soft Prompt aprendibles. De este modo, un único modelo puede reconciliar morfologías, sensores y espacios de acción diversos. `MrC4t/xvla_bi_so_bin3` es un *fine-tune* del modelo base `lerobot/xvla-base`, publicado por el usuario MrC4t y entrenado con LeRobot 0.6.2 sobre el dataset `MrC4t/bimanual_toy_bin`.

Se trata de una política robótica concreta, no de un modelo de lenguaje: consume tres cámaras (`head`, `left_wrist`, `right_wrist`) más el estado del robot (8 dimensiones) y produce un vector de acción de 12 dimensiones. La tarea entrenada es "put toy in bin" (introducir un juguete en un contenedor) con un robot bimanual de tipo `bi_so_follower`, a partir de 21 episodios y 25 866 fotogramas grabados a 30 FPS.

El modelo tiene 879 687 256 parámetros (unos 880 M), licencia Apache 2.0 y pesos en formato safetensors; el repositorio ocupa 1,8 GB, coherente con pesos almacenados en 16 bits. Es relevante para quienes investigan en manipulación bimanual e imitación de bajo coste, ya que muestra el flujo completo de LeRobot (grabación de datos, *fine-tuning* del base y *rollout* en robot real) con un dataset pequeño. El autor no ha publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) con soft prompts y flow matching (X-VLA, arXiv:2510.10274) |
| Parametros totales | 879 687 256 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors, sin variantes GGUF/INT8/INT4) |
| Idiomas soportados | no disponible (modelo de robotica; no se documenta soporte linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Modelo base | lerobot/xvla-base |
| Tipo de robot | bi_so_follower |
| Camaras | head, left_wrist, right_wrist |
| Entradas | observation.images.image (3, 256, 256); observation.images.image2 (3, 256, 256); observation.images.image3 (3, 224, 224); observation.state (8,) |
| Salidas | action (12,) |
| Dataset de entrenamiento | MrC4t/bimanual_toy_bin (21 episodios, 25 866 fotogramas, 30 FPS) |
| Tarea | "put toy in bin" |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

X-VLA es un framework VLA "soft-prompted" con *flow matching* (la referencia es arXiv:2510.10274). La idea central es representar cada robot o configuración de hardware como una tarea, codificada con un conjunto reducido de embeddings de Soft Prompt aprendibles, de forma que un solo modelo pueda manejar morfologías, sensores y espacios de acción heterogéneos sin reentrenar desde cero. En esta ficha concreta, el modelo se ha especializado mediante *fine-tuning* desde `lerobot/xvla-base` a un robot bimanual `bi_so_follower` con tres cámaras y un vector de estado de 8 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `MrC4t/bimanual_toy_bin`: 21 episodios, 25 866 fotogramas a 30 FPS, todos ellos de la tarea "put toy in bin". La configuración declarada es de 20 000 pasos de entrenamiento, batch size 8, optimizador `xvla-adamw`, learning rate 0,0001 y semilla 1000. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento del modelo base, la composición del dataset original, ni si hubo etapas de RLHF/DPO (poco habituales en políticas de imitación robótica).

## Capacidades

- Generación de acciones motoras para control de robot: produce un vector `action` de 12 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen (256x256, 256x256 y 224x224), correspondientes a cabeza y muñecas izquierda y derecha.
- Manipulación bimanual: entrenado sobre un robot `bi_so_follower`, con dos brazos.
- Ejecución de tareas de *pick-and-place* en el dominio aprendido: la tarea concreta es "put toy in bin".
- Política de imitación condicionada por tarea: el comando de tarea se pasa al *rollout* mediante `--task`.
- Compatibilidad con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- Soporte de *soft prompts* heredado de X-VLA para adaptar el modelo a distintas morfologías dentro de la familia (capacidad del framework, no verificada en esta ficha).
- Tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión general o audio: no disponibles.

## Casos de uso

- Automatización de *pick-and-place* bimanual: recogida de objetos y depósito en un contenedor con un robot `bi_so_follower` a 30 FPS, usando las tres cámaras como entrada. Es exactamente el escenario para el que se entrenó.
- Replicación de experimentos en laboratorio: reproducción del *pipeline* completo de X-VLA (base + dataset + *fine-tune*) para comparar metodologías de VLA con *soft prompts* frente a alternativas.
- Punto de partida para nuevos *fine-tunes*: al derivar de `lerobot/xvla-base` y ser Apache 2.0, sirve como inicialización para tareas bimanuales similares (por ejemplo, apilar, insertar o clasificar objetos) con pocos episodios.
- Validación de *pipelines* de datos robóticos: con 21 episodios y 25 866 fotogramas, es útil para probar el flujo de LeRobot (grabación, visualización con el *space* de LeRobot, entrenamiento y despliegue) antes de escalar a datasets mayores.
- Pruebas de *rollout* en robot real: el comando `lerobot-rollout --strategy.type=base` permite ejecutar la política durante una duración fija sin grabar episodios, adecuado para verificar calibración, puertos y nombres de cámara.
- Docencia en robótica e imitación: ejemplo completo y de tamaño reducido (880 M de parámetros) para explicar el ciclo observación-acción, el formateo de features y el condicionamiento por tarea.
- Evaluación de robustez ante cambios de entorno: útil para estudiar degradación al variar posiciones de objeto, iluminación o presencia de distracciones (el autor no aporta estas pruebas, pero el modelo es un candidato directo para ese tipo de experimento).
- Integración en *pipelines* de control con temporización estricta: al estar pensado para 30 FPS con tres cámaras, es un banco de pruebas para medir latencia de inferencia en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la nota explícita "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

Las cifras de memoria son estimaciones derivadas del recuento de parámetros declarado (879 687 256) y del tamaño del repositorio (1,8 GB); no proceden de mediciones publicadas por el autor.

- VRAM estimada para los pesos: ~1,8 GB en FP16/BF16 (coherente con el tamaño del repo), ~3,5 GB en FP32, ~0,9 GB en INT8 y ~0,45 GB en INT4 (estas dos últimas requerirían cuantización propia, no publicada).
- VRAM adicional: hay que sumar activaciones y los tres flujos de imagen de entrada, además de los búferes del *pipeline* de visión; en la práctica conviene reservar varios GB extra.
- Cabe en GPU de consumo: sí, con margen amplio. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son suficientes para los pesos en 16 bits; una GPU de 8 GB debería bastar para inferencia en FP16 con *batch* 1.
- GPU de centro de datos: A100, H100, L40S o similares son válidas, pero sobredimensionadas para 880 M de parámetros; su uso tendría sentido para entrenamiento con *batch* mayor o para servir varias instancias.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento) sobre PyTorch/CUDA. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a una política de acción con entradas multimodales de imagen y estado.
- Latencia y throughput: no disponibles. El sistema de grabación funciona a 30 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se han publicado mediciones de latencia de inferencia.
- Restricciones de plataforma: los nombres de cámara del *rollout* deben coincidir con las claves de observación del entrenamiento (`head`, `left_wrist`, `right_wrist`), y el robot debe ser del tipo `bi_so_follower`.

## Comparativa con modelos similares

La información proporcionada solo permite comparar esta política con su modelo base. No se dispone de datos de benchmarks ni de especificaciones de otras políticas VLA comparables (por ejemplo, alternativas del ecosistema LeRobot) para construir una comparativa rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrC4t/xvla_bi_so_bin3 | 879 687 256 | no disponible | Sin resultados de evaluación publicados | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| lerobot/xvla-base | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base referenciado) |

Otras políticas de robótica de la misma categoría: no disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación: el autor no reporta tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no hay evidencia pública de que la política funcione de forma fiable en robot real.
- Dataset muy pequeño y de una sola tarea: 21 episodios y 25 866 fotogramas, todos de "put toy in bin", lo que limita la generalización a otras tareas, objetos o disposiciones.
- Especialización de morfología: está ajustado a un robot `bi_so_follower` con tres cámaras concretas (`head`, `left_wrist`, `right_wrist`) y un vector de estado de 8 dimensiones; cambiar cámaras, posición o número de articulaciones invalida la política.
- Riesgo de sobreajuste al entorno de grabación: sin pruebas de variación de iluminación, fondos, posiciones de objeto o distracciones, cabe esperar degradación fuera de las condiciones de recogida de datos.
- Ausencia de cuantizaciones publicadas: solo hay safetensors; desplegar en INT8/INT4 exige un proceso propio de cuantización y validación.
- Idiomas y contexto textual: no documentados; no debe asumirse soporte multilingüe ni una ventana de contexto de lenguaje.
- Sesgos: no hay información sobre sesgos del dataset ni sobre la distribución de objetos, colores o posiciones utilizada.
- Alucinación: en este tipo de modelo el equivalente es la generación de acciones incorrectas o inseguras ante observaciones fuera de distribución; no hay métricas publicadas al respecto.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base (`lerobot/xvla-base`) y de los datos de entrenamiento debe verificarse por separado antes de un despliegue comercial.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Seguridad física: cualquier despliegue sobre hardware real requiere límites de par, paradas de emergencia y supervisión, dado que una política de imitación puede producir acciones erráticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrC4t/xvla_bi_so_bin3
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bimanual_toy_bin
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bimanual_toy_bin
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv:2510.10274)
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
