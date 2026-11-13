# skkyshine/handoff

## Resumen

`handoff` es un repositorio de robótica publicado por el usuario skkyshine que contiene dos componentes entrenados para una tarea de manipulación real sobre un brazo Franka Panda: recoger un vaso transparente y depositarlo sobre una lámina amarilla. El primero es un modelo de "hand-off" que predice la pose de la mano (`panda_hand_tcp` en `panda_link0`) unos centímetros antes del contacto, de modo que un movimiento scriptado pueda llevar la mano hasta ahí y un político end-to-end se encargue del contacto final. El segundo es un fine-tune LoRA del modelo base pi0.5 de openpi, servido como política visión-lenguaje-acción.

El modelo de hand-off es un ensemble de 10 modelos de flow matching condicional (PyTorch, `.pt`), de 52 MB por variante, con tres versiones según la cámara de entrada: D455 lateral, D435i frontal o ambas. El checkpoint pi0.5 ocupa 6 GB y se distribuye en formato PyTorch (no safetensors ni GGUF). La detección de objeto y receptor se delega a Grounding DINO base y SAM 2.1 small, y no se lee pose explícita del objeto.

La relevancia del repositorio es acotada pero específica: documenta una arquitectura híbrida aprendizaje-scripting para manipulación con objetos transparentes, un caso difícil para la percepción puramente geométrica, e incluye métricas de validación cruzada del error de hand-off. No obstante, ninguno de los dos modelos se ha ejecutado todavía sobre el robot, y el propio autor advierte que todas las cifras son offline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de 10 modelos de flow matching condicional (hand-off) + pi0.5 (PaliGemma) con LoRA en ambas torres Gemma (política) |
| Parámetros totales | no disponible (el checkpoint pi0.5 ocupa 6 GB; el ensemble, 52 MB por variante) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos PyTorch sin cuantizar) |
| Idiomas soportados | no disponible (la política pi0.5 recibe un prompt en inglés) |
| Licencia | no disponible en el repositorio; los pesos pi0.5 heredan los términos de openpi y los Gemma Terms of Use |
| Formato de pesos | PyTorch (`.pt` para el ensemble; `params/` y `assets/norm_stats/` para pi0.5) |

## Arquitectura y entrenamiento

El modelo de hand-off es un ensemble de 10 modelos de flow matching condicional (`flow_s0.pt` a `flow_s9.pt`), variante `align_none+griprel+foot`, entrenados 800 épocas cada uno. La entrada es una única toma RGB-D previa al movimiento que incluye la nube de puntos del objeto (para agarre) o del receptor (para colocación) en `panda_link0`, su centroide y la silueta, la distancia antes del contacto (4, 6, 8, 10 y 12 cm) y, en colocación, la pose de la mano al cerrar el gripper. Cada miembro genera 64 muestras y la salida es la media del modo más denso; en colocación se elige el modo que exige menos giro de muñeca desde el agarre. Los datos de entrenamiento son 40 demostraciones teleoperadas a 10 Hz: 10 de la tarea del vaso grabadas en 2026-11 con D455 y calibración mano-ojo registrada, y 30 de una grabación anterior (vaso, grapadora y rotulador, 10 cada una, solo cámara frontal y calibración estimada). Las claves cubren `grasp|cup`, `grasp|stapler`, `grasp|highlighter`, `place|cup>yellow_sheet`, `place|stapler>yellow_sheet` y `place|highlighter>turquoise_cup`.

El checkpoint pi0.5 (`pi05_relay_cup/2999`) es un fine-tune LoRA del modelo base openpi pi0.5 sobre las 10 demostraciones del vaso de 2026-11 (2.053 frames). Se aplica LoRA en ambas torres Gemma, con horizonte de acción 10 y estado continuo; entrenamiento con batch 24, 3.000 pasos, AdamW, schedule coseno (200 pasos de warm-up, pico 5e-5, bajada a 1e-6) y sin EMA. La entrada combina `observation/image` (frame frontal D435i recortado a las columnas 240:960), `observation/wrist_image`, un estado de 8 valores `[x y z qx qy qz qw width]` de `panda_hand_tcp` en `panda_link0` con qx >= 0, y el prompt `pick the transparent cup and put it completely on the yellow plane`. La salida son 10 acciones de 7 valores: delta en marco base (`p += a[:3]`, `R = exp(a[3:6]) R`) y comando absoluto de gripper (> 0,5 cerrado).

## Capacidades

- Predicción de pose de pre-agarre y pre-colocación de la mano a 4, 6, 8, 10 y 12 cm antes del contacto, en coordenadas de `panda_link0`.
- Generación multimodal de muestras (64 por miembro del ensemble) con selección del modo más denso, lo que permite descartar predicciones aisladas.
- Colocación condicionada a la pose de cierre del gripper, con criterio de mínimo giro de muñeca.
- Política visión-lenguaje-acción end-to-end (pi0.5) que produce chunks de 10 acciones de 7 dimensiones a partir de imagen frontal, imagen de muñeca, estado propioceptivo y prompt textual.
- Percepción de objeto y receptor mediante Grounding DINO base y SAM 2.1 small, sin lectura de pose explícita del objeto.
- Generalización limitada a tres objetos (vaso, grapadora, rotulador) y dos receptores (lámina amarilla, vaso turquesa).
- No soporta tool calling, function calling, razonamiento multi-paso genérico ni capacidades multilingües; es un componente de control robótico, no un modelo de lenguaje de propósito general.

## Casos de uso

- Recogida de objetos transparentes en entorno de laboratorio: el modelo de hand-off predice la pose previa al agarre de un vaso transparente, un caso en el que la percepción geométrica convencional falla por falta de retorno de profundidad fiable; el ensemble reduce el ruido mediante el modo más denso.
- Colocación precisa sobre una diana visual: para `place|cup>yellow_sheet` el modelo condiciona la predicción a la pose de cierre del gripper y elige el modo con menor giro de muñeca, lo que simplifica la trayectoria del brazo.
- Integración híbrida aprendizaje-scripting en un pipeline de control: el hand-off predice un waypoint y un movimiento scriptado lleva la mano hasta él, dejando el contacto final a la política pi0.5; este reparto reduce la carga de la política end-to-end en las fases de aproximación.
- Investigación en manipulación con VLA: el checkpoint pi0.5 LoRA sirve como referencia reproducible de fine-tune sobre 2.053 frames y 3.000 pasos, útil para comparar regímenes de adaptación de bajo rango en políticas visión-lenguaje-acción.
- Evaluación de error de hand-off con validación cruzada: el repositorio publica intervalos bootstrap al 95 % sobre 20 hand-offs del vaso, lo que permite usar el modelo como baseline en estudios de precisión de pre-agarre.
- Prototipado de relés de agarre con múltiples cámaras: las tres variantes (D455 lateral, D435i frontal, ambas) permiten estudiar el efecto de la configuración de sensores en el error de predicción sin cambiar el resto del pipeline.
- Docencia y reproducción de experimentos: el tamaño reducido del ensemble (52 MB) y la separación clara entre modelos y código de despliegue facilitan su uso en prácticas de robótica con Franka Panda.

## Benchmarks y rendimiento

Error de hand-off medido por validación cruzada de 5 folds sobre los 20 hand-offs del vaso de la grabación de 2026-11 (distancia mediana a la mano del demostrador):

| Modelo | 4 cm antes del contacto | 8 cm antes del contacto |
|---|---|---|
| D455 (`secondary`) | 3,4 cm [2,7; 5,9] | 4,5 cm [3,7; 7,1] |
| Frontal (`main`) | 3,6 cm [3,0; 5,4] | 4,6 cm [3,9; 6,4] |
| Ambas cámaras | 3,6 cm [2,9; 5,1] | 4,8 cm [3,9; 6,2] |
| Offset medio por clave, D455 (sin aprendizaje) | 3,9 cm | 6,2 cm |

Los corchetes son intervalos bootstrap al 95 %. El error de rotación se sitúa entre 1 y 5 grados. Con 20 hand-offs, el autor indica que las cámaras no se distinguen entre sí.

Para el checkpoint pi0.5, sobre frames de entrenamiento el chunk predicho de 1 s termina a 3,6 mm del registrado y el comando de gripper coincide en el 99,7 % de los pasos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni métricas de éxito en robot.

## Requisitos de hardware

- VRAM estimada para el ensemble de hand-off: no disponible; los 52 MB por variante sugieren que cabe holgadamente en cualquier GPU consumer, pero no se documenta el consumo en inferencia.
- VRAM estimada para pi0.5: no disponible; el checkpoint pesa 6 GB en precisión de entrenamiento, por lo que en FP16/BF16 requeriría del orden de 12 GB solo para pesos, más activaciones y KV cache (estimación no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del checkpoint pi0.5, una RTX 4090 (24 GB) o una A100/H100 son candidatas razonables, pero el autor no lo especifica.
- Despliegue: el código de servicio no está en este repositorio; vive en `vla_panda_project`, rama `feat/handoff-waypoints` (`src/handoff/` para el servidor de hand-off y `src/deployment/episode_manager.py --handoff-url` para el relé). El checkpoint pi0.5 se sirve con la configuración `pi05_relay_cup_lora` de openpi.
- Latencia y throughput: no disponibles; no se han publicado mediciones y los modelos no se han ejecutado sobre el robot.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `handoff` (este) | Ensemble de flow matching + pi0.5 LoRA | 52 MB + 6 GB | no disponible | Error de hand-off 3,4-4,8 cm (CV 5 folds, 20 muestras) | no disponible; pesos pi0.5 bajo términos de openpi y Gemma | Hugging Face, código en repo separado |
| openpi pi0.5 base | VLA (PaliGemma) | no disponible | no disponible | no disponible | términos de openpi y Gemma | Público (openpi) |
| Modelos VLA genéricos de manipulación | VLA | variable | variable | no disponible | variable | variable |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría; los únicos datos numéricos publicados son los del propio modelo frente a un baseline sin aprendizaje.

## Limitaciones y advertencias

- Ninguno de los dos modelos se ha ejecutado sobre el robot: todas las cifras son offline y no hay evidencia de éxito en tarea real.
- Solo una tarea (el vaso) dispone de datos con la cámara nueva, y proceden de 10 demostraciones, lo que limita la generalización.
- El error de hand-off es de centímetros (3,4-4,8 cm), comparable al baseline sin aprendizaje a 4 cm (3,9 cm), por lo que la mejora es modesta y depende de la distancia.
- Parte del error proviene de las propias demostraciones: en 2 de 10 demos la mano cerró en el lado opuesto del borde del vaso y las trayectorias de aproximación varían.
- Los modelos de hand-off asumen que las cámaras están donde estaban en las grabaciones; el detector solo acepta cajas en la parte de la mesa de trabajo de cada imagen, lo que rompe el uso si cambia la disposición física.
- La licencia del repositorio no está indicada; los pesos pi0.5 derivan del checkpoint base openpi pi0.5 (PaliGemma), por lo que se aplican sus términos, incluidos los Gemma Terms of Use, con las restricciones que ello implica para uso comercial.
- No hay información sobre sesgos, alucinación en el sentido lingüístico, ni cobertura multilingüe; el prompt de la política está en inglés y el modelo no es un LLM de propósito general.
- El código de servicio no se incluye en el repositorio, lo que añade una dependencia externa para reproducir el despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skkyshine/handoff
- openpi (modelo base pi0.5): no disponible en la información proporcionada
- Grounding DINO: no disponible en la información proporcionada
- SAM 2.1: no disponible en la información proporcionada
- Repositorio de despliegue `vla_panda_project` (rama `feat/handoff-waypoints`): no disponible como URL en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
