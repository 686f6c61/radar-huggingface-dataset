# mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__static__groot__seed_0

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA, un modelo abierto y cross-embodiment diseñado para razonamiento y habilidades generalizadas en robots humanoides. La política concreta que nos ocupa ha sido ajustada para el robot Franka Panda en una tarea de manipulación tipo *pick-and-place*: recoger hasta cuarenta objetos distintos (desde una manzana hasta un dispensador de jabón) y depositarlos en una caja.

El modelo emplea un backbone Cosmos-Reason2/Qwen3-VL junto con un transformer de acciones basado en *flow matching*, que predice acciones condicionadas por visión, lenguaje y propiocepción. Con 3.144.016.000 parámetros totales según los pesos en safetensors y un tamaño de repositorio de 50,3 GB, se trata de un VLA (vision-language-action) de gran escala orientado a inferencia robótica, no a generación de texto.

Es relevante ahora porque ejemplifica el patrón actual de reutilizar modelos fundacionales multimodales como cabecera de percepción y razonamiento, y añadir una cabeza de acciones específica por tarea. Este checkpoint concreto es un artefacto de investigación (semilla 0, 60.000 pasos, dataset sintético de 787 episodios) más que un producto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching (GR00T N1.7) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 50,3 GB, librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone vision-language (Cosmos-Reason2/Qwen3-VL) que procesa las observaciones visuales y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con *flow matching* que genera trayectorias de acción continuas condicionadas por visión, lenguaje y propiocepción. La política consume tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a resolución 224×224, un vector de estado de 9 dimensiones y produce acciones de 7 dimensiones.

El ajuste se realizó sobre el dataset `train_800_sparse__mask__overlay_a75__sim__all_cameras__static`, con 787 episodios y 195.184 frames a 20 FPS, en simulación y con 40 variantes de instrucción de tipo "Pick the X and place it into the box". La configuración de entrenamiento documentada es: 60.000 pasos, batch size 16, optimizador AdamW, learning rate 7e-5, semilla 0, LeRobot 0.6.0. No se documentan fases de RLHF o DPO, ni el número total de tokens de entrenamiento del backbone.

## Capacidades

- Control robótico de manipulación *pick-and-place* sobre el robot Franka Panda en simulación.
- Percepción visual multi-cámara: una vista de agente y dos vistas de muñeca (*eye-in-hand*).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("Pick the pear and place it into the box").
- Generalización sobre 40 categorías de objetos distintos (alimentos, utensilios, electrodomésticos).
- Predicción de acciones continuas de 7 dimensiones mediante flow matching.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout`, `lerobot-record`, `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, ni modos de razonamiento explícito ("thinking mode").

## Casos de uso

- **Investigación en manipulación robótica simulada**: servir como checkpoint de referencia para comparar variantes de dataset (sparse vs. dense, con o sin máscara, overlay al 75 %) en experimentos controlados con semilla fija.
- **Ablación de configuraciones de entrenamiento**: al estar etiquetado con `seed_0` y una configuración explícita, permite reproducir y contrastar resultados frente a otras semillas o hiperparámetros.
- **Punto de partida para fine-tuning en un robot real**: la política puede adaptarse a un Panda físico mediante recolección de datos propios con LeRobot y un ajuste posterior sobre el backbone GR00T.
- **Evaluación de generalización multi-objeto**: las 40 categorías de instrucción permiten medir la robustez del modelo ante variaciones léxicas y de apariencia en la misma tarea de recogida y depósito.
- **Docencia y divulgación en VLA**: el flujo `lerobot-rollout` con `--policy.path` facilita demostrar el ciclo completo observación → acción en un entorno simulado sin infraestructura pesada.
- **Benchmark interno de políticas de imitación**: útil como línea base al comparar ACT, Diffusion Policy o π0 frente a GR00T en la misma tarea y dataset.
- **Generación de datos sintéticos aumentados**: la política entrenada puede desplegarse en simulación para producir rollouts adicionales que alimenten futuros ciclos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 3.144 M de parámetros en precisión FP16/BF16, los pesos ocupan aproximadamente 6,3 GB; sumando activaciones del backbone VLM y del transformer de acciones, se estima un consumo de 12-20 GB según resolución y batch. Dato no confirmado por el autor.
- **GPU recomendadas**: A100 40/80 GB, H100 80 GB o L40S para despliegue con holgura; RTX 4090 (24 GB) como opción de gama alta para consumidor.
- **¿Cabe en GPU de consumidor?**: probablemente sí en RTX 4090 y RTX 3090 (24 GB) en FP16 con batch 1; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`) es la vía oficial. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de acciones.
- **Latencia y throughput**: no disponibles. La frecuencia del dataset es de 20 FPS, lo que sugiere un objetivo de inferencia en tiempo real a esa tasa, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (esta política) | 3.144 M | no disponible | VLA pick-and-place (Panda) | Apache 2.0 | HuggingFace, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | VLA fundacional cross-embodiment | Apache 2.0 | GitHub Isaac-GR00T |
| Otras políticas LeRobot (ACT, Diffusion Policy) | típicamente < 100 M | no aplica | imitación por tarea | Apache 2.0 | HuggingFace, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Ámbito muy restringido**: la política está entrenada exclusivamente para la tarea "Pick the X and place it into the box" con un conjunto cerrado de 40 objetos; fuera de ese dominio no cabe esperar generalización.
- **Entrenamiento en simulación**: el dataset es sintético (`sim`), por lo que existe una brecha sim-to-real no cuantificada que puede degradar el rendimiento en un Panda físico.
- **Artefacto de investigación**: semilla 0, 15 descargas y 0 likes indican un checkpoint experimental sin validación comunitaria ni mantenimiento.
- **Riesgo de alucinación**: en un VLA se traduce en acciones plausibles pero incorrectas (agarrar el objeto equivocado, trayectorias inválidas) cuando la escena difiere de la distribución de entrenamiento.
- **Sesgos**: no documentados por el autor; el dataset está limitado a objetos domésticos de un entorno concreto, lo que puede introducir sesgos de apariencia y posición.
- **Idioma**: las instrucciones están en inglés; no se documenta soporte multilingüe.
- **Licencia**: Apache 2.0 permite uso comercial, pero la licencia del backbone subyacente (Cosmos-Reason2/Qwen3-VL) debe verificarse por separado antes de un despliegue comercial.
- **Sin datos de cuantización ni latencia**: impide planificar con precisión el despliegue en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__static__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__static
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__all_cameras__static
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
