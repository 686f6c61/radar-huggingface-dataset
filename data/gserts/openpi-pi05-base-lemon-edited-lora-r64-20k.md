# Gserts/openpi-pi05-base-lemon-edited-lora-r64-20k

## Resumen

`Gserts/openpi-pi05-base-lemon-edited-lora-r64-20k` es un checkpoint de política robótica obtenido mediante ajuste fino con LoRA sobre los pesos oficiales `pi05_base` de OpenPI, el framework de modelos de política (VLA, vision-language-action) publicado por Physical Intelligence. El autor, Gserts, lo ha entrenado para una tarea concreta de manipulación pick-and-place sobre un objeto denominado "lemon", a partir de un dataset propio de demostraciones. No es un modelo de lenguaje generalista: es un artefacto de inferencia robótica que mapea observaciones visuales y de estado articular a comandos de acción.

El checkpoint se distribuye como Orbax nativo de JAX para OpenPI, no como adaptador PEFT de LeRobot, e incluye los parámetros completos de inferencia, los activos de normalización y el adaptador específico del proyecto. El entrenamiento consistió en 20.000 actualizaciones del optimizador con batch de 16 y semilla 1000, aplicando LoRA de rango 64 y alpha 64 sobre ambos backbones Gemma del modelo base.

Su relevancia es acotada pero clara para quien trabaja con OpenPI: sirve como ejemplo reproducible de cómo adaptar `pi05_base` a una tarea de manipulación concreta con recursos moderados, y como punto de partida para quien quiera replicar el pipeline (filtro de congelación LoRA oficial, normalización por cuantiles recalculada, chunks de 50 acciones con recorte por episodio). No obstante, es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en `pi05_base` de OpenPI, con dos backbones Gemma y adaptadores LoRA; implementación en JAX |
| Parametros totales | no disponible (el repositorio ocupa 6,7 GB; el número exacto de parámetros del base y del adaptador no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precisión de entrenamiento; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo recibe un campo `prompt`, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax nativo de JAX para OpenPI (no safetensors, no GGUF, no adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base`, la política VLA de OpenPI, que combina un backbone de lenguaje/visión de tipo Gemma con una cabeza de acciones que predice secuencias de comandos articulares. Sobre ese base se aplica LoRA de rango 64 y alpha 64 en ambos backbones Gemma, usando el filtro de congelación LoRA oficial de OpenPI; además de los parámetros LoRA, se actualizan los parámetros de visión y proyección que quedan fuera de dicho filtro. El resultado es un checkpoint con parámetros completos de inferencia, no un adaptador ligero.

El entrenamiento se realizó durante 20.000 actualizaciones del optimizador con batch de 16 y semilla 1000, sobre el dataset `Gserts/pick_place_lemon_edited_20261101_165328`. La normalización por cuantiles se recalculó a partir del dataset completo, con chunks de 50 acciones recortados por episodio. El estado del optimizador no se distribuye (se conserva solo en HPC); el manifiesto completo de parámetros está en `training_manifest.json`. No se documentan tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO, que en cualquier caso no aplican a este tipo de política.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 grados de libertad (posiciones articulares absolutas) a partir de observaciones visuales y de estado.
- Entrada multimodal: dos cámaras RGB (`observation.images.front` y `observation.images.wrist`), estado articular de seis posiciones (`observation.state`) y un `prompt` textual.
- Enmascaramiento de cámara ausente: si falta la tercera cámara, se enmascara en lugar de fallar.
- Predicción por chunks: genera bloques de hasta 50 acciones, de las que se ejecuta solo el prefijo deseado antes de replanificar (la configuración previa usaba 10 acciones a 30 Hz).
- Salida en unidades articulares absolutas originales (`actions[..., :6]`).
- Ajuste específico de tarea: especializado en pick-and-place del objeto "lemon"; no es un modelo generalista.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni otras tareas de lenguaje.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de recogida y colocación del objeto "lemon" para la que fue entrenado, usando las dos cámaras y el estado articular como entrada; es adecuado como referencia reproducible de un pipeline OpenPI completo.
- Replicación de experimentos de ajuste fino con LoRA: sirve para validar la receta (rango 64, alpha 64, filtro de congelación oficial, 20k pasos, batch 16) sobre `pi05_base` y comparar con otras configuraciones de rango o número de pasos.
- Base para adaptación a nuevas tareas: al incluir parámetros completos y activos de normalización, puede reutilizarse como punto de partida para un nuevo ajuste fino sobre otro dataset de manipulación, aunque requerirá recalcular la normalización.
- Evaluación de control por chunks y replanificación: permite estudiar el efecto de ejecutar 10 de 50 acciones a 30 Hz frente a otros prefijos y frecuencias en un entorno real o simulado.
- Integración en un stack OpenPI/JAX: encaja en pipelines que ya usan `policy_config.create_trained_policy` con la configuración `pi05_lemon_lora_r64`, útil para equipos que trabajan en JAX y no en PyTorch/LeRobot.
- Docencia y divulgación técnica: como ejemplo concreto de VLA ajustado con LoRA, sirve para explicar el flujo completo desde dataset de demostraciones hasta política desplegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 6,7 GB, lo que da una cota inferior del espacio en disco necesario para los pesos, pero no se documenta el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible. Al ser un checkpoint JAX/Orbax, requiere GPUs compatibles con el stack JAX de OpenPI; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No disponible. El tamaño de 6,7 GB sugiere que podría caber en GPUs con 16-24 GB de VRAM, pero es una estimación no confirmada por el autor.
- Opciones de despliegue: OpenPI en JAX con el commit `215abfb217dbac7d5f1273282331b9b1866c0479` y `openpi_project/project.patch`, cargando con `config pi05_lemon_lora_r64` y `policy_config.create_trained_policy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Solo se indica que la configuración previa ejecutaba 10 acciones a 30 Hz antes de replanificar, lo que da una referencia de frecuencia de control, no de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Gserts/openpi-pi05-base-lemon-edited-lora-r64-20k | no disponible | no disponible | Pick-and-place "lemon" | Apache 2.0 | Orbax (JAX) | Hugging Face, 0 descargas |
| pi05_base (OpenPI, Physical Intelligence) | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible en la información | Referenciado como base del ajuste |
| Alternativas de la misma categoría (otros VLA como OpenVLA, RT-2) | no disponible | no disponible | Manipulación generalista | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas; la única comparación fiable es con el propio `pi05_base`, del que este checkpoint es un ajuste fino con LoRA.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para pick-and-place del objeto "lemon" sobre un dataset concreto; no generaliza a otras tareas, objetos ni entornos sin nuevo ajuste fino.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa de rendimiento en el repositorio.
- Reproducibilidad dependiente del entorno: requiere un commit específico de OpenPI y un parche de proyecto (`project.patch`); cambios en OpenPI pueden romper la carga.
- Estado del optimizador no incluido: solo se conserva en HPC, por lo que no es posible reanudar el entrenamiento tal cual desde el checkpoint publicado.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución: al ser una política robótica, los riesgos son de seguridad física (acciones erróneas) más que de contenido; no se documentan evaluaciones de robustez.
- Idiomas no especificados: aunque existe un campo `prompt`, no se indica qué idiomas ni formatos de instrucción acepta.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica tal cual.
- Madurez baja: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-02), sin comunidad ni issues documentados.

## Enlaces

- Hugging Face: https://huggingface.co/Gserts/openpi-pi05-base-lemon-edited-lora-r64-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/Gserts/pick_place_lemon_edited_20261101_165328
- OpenPI (framework): no se proporciona enlace en la información disponible
- Paper de pi05 / OpenPI: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
