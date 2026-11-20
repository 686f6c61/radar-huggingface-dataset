# Bayway/JEV-27B-VL-MLX-4bit

## Resumen

JEV-27B-VL-MLX-4bit es una conversión a formato MLX y cuantización de 4 bits del modelo multimodal JEV-27B-VL, desarrollado por AutoTrust AI. No se trata de un modelo generativo convencional, sino de un modelo de decisión tipada ("System 1") que responde a preguntas estructuradas sobre texto e imágenes (verdadero/falso, elección entre 2 y 256 opciones, puntuación de 0 a 5) devolviendo una probabilidad calibrada para cada opción en un único pase forward. Esta conversión, publicada por el usuario Bayway, permite ejecutar el modelo en Apple Silicon mediante la librería MLX-VLM.

El modelo parte de Qwen3.8-27B como base (cuantizado a 4 bits afines con tamaño de grupo 64, con la torre de visión en bf16) y le superpone un adaptador LoRA de rango 16 sin fusionar, junto con una cabeza de decisión de 264 filas en float32 y temperaturas de calibración específicas por tipo de pregunta. El resultado es un checkpoint de 27.466.870.264 parámetros que ocupa 16,3 GB en disco y requiere aproximadamente 17 GB de memoria unificada, por lo que encaja en un Mac de 32 GB.

La relevancia de esta ficha radica en que el checkpoint preserva, además, la posibilidad de usar el modelo base como "System 2" (chat ordinario con Qwen3.8-27B en 4 bits) simplemente desactivando el adaptador, lo que convierte el repositorio en un artefacto dual: clasificador calibrado y modelo conversacional en el mismo paquete. Existe una advertencia importante del autor: este checkpoint concreto no carga con las releases estándar de mlx-vlm y requiere una rama específica del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B con torre de visión, adaptador LoRA de rango 16 y cabeza de decisión) |
| Parametros totales | 27.466.870.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3.8-27B; no especificada) |
| Tipos de cuantizacion | 4-bit affine con group size 64 (base); LoRA en bf16 sin fusionar; cabeza de decisión en float32; torre de visión en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal basado en Qwen3.8-27B, con una torre de visión que procesa imágenes intercaladas con texto en el estado de entrada. Sobre el modelo base cuantizado a 4 bits se aplica un adaptador LoRA de rango 16 y escala 2 en todas las proyecciones del decodificador, mantenido sin fusionar y en bf16 (archivo `jev.safetensors`). La cabeza de decisión contiene 264 filas en float32: 24 slots entrenados (filas de `lm_head` más el LoRA de `lm_head` del adaptador, más el sesgo de `decision_head.json`) y las etiquetas de opción adicionales usadas cuando se superan las 16 opciones. Se aplican temperaturas de calibración por tipo de pregunta (`calibration.json`): noul 1.0143, choice 1.0161, score 1.0036.

El protocolo de decisión define tres tipos de pregunta: `bool` (internamente `noul`, formulada de modo que "true" sea el resultado cuya probabilidad se desea), `choice` (entre 2 y 256 opciones, con las 16 primeras usando los slots entrenados y posibilidad de etiquetas con descripción de uso) y `score` (escala fija de 0 a 5 con seis criterios devueltos como leyenda). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. El autor menciona que existe un corpus de destilación denominado `jev-distill-corpus-v3` (con partición `test_set_30k`), usado para validar la paridad de la cuantización.

## Capacidades

- Clasificación tipada sobre texto e imágenes con probabilidades calibradas por opción en un único pase forward.
- Preguntas booleanas (`bool`/`noul`) con probabilidad del resultado formulado como verdadero.
- Elección múltiple (`choice`) de 2 a 256 opciones, con soporte de etiquetas descriptivas por opción.
- Puntuación (`score`) en escala fija de 0 a 5 con seis criterios como leyenda.
- Procesamiento multimodal: imágenes intercaladas con texto en el estado de entrada (pipeline `image-text-to-text`).
- Modo "System 2": chat ordinario con el modelo base Qwen3.8-27B (4 bits) desactivando el adaptador, opcionalmente con thinking.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.
- Capacidades especiales: probabilidades calibradas por temperatura específica de tipo, modo de decisión de un solo pase, y uso dual (clasificador calibrado o chat base).

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar un ticket a un equipo (facturación, envíos, soporte técnico) devolviendo probabilidades calibradas, como muestra el ejemplo de la model card con `{'billing': 0.9979, 'shipping': 0.0, 'tech support': 0.0021}`. Adecuado porque la salida probabilística permite umbrales de confianza y enrutamiento automático.
- Detección de intención de reembolso: mediante una pregunta `bool` formulada como "¿el cliente pide un reembolso?", el modelo devuelve una probabilidad directamente utilizable para disparar flujos de devolución o escalado a humanos.
- Triaje de urgencia: con una pregunta `score` en escala 0-5, el modelo puntúa la urgencia de una incidencia y permite priorizar colas de atención según el valor calibrado.
- Moderación y categorización de anuncios con imagen: combinando texto e imagen en el estado (por ejemplo, foto de producto más título del vendedor), el modelo clasifica el anuncio en categorías (electrónica, ropa, hogar, juguetes) con probabilidades por categoría.
- Enrutamiento de respuestas de proveedores: el ejemplo de la model card muestra la clasificación de una respuesta de proveedor sobre un SKU (AX-330) en cuatro opciones con probabilidades calibradas, útil para pipelines de aprovisionamiento automatizado.
- Verificación de condiciones en pipelines de datos: preguntas booleanas sobre registros textuales (por ejemplo, "¿el paquete está dañado?") para etiquetar grandes volúmenes de datos con probabilidad calibrada, como ilustra el ejemplo de paquete dañado con 0.022/0.978.
- Chat multimodal en local: usando el modo System 2 con `python -m mlx_vlm generate`, el modelo responde a preguntas abiertas sobre imágenes (por ejemplo, "¿qué muestra este gráfico?") en un Mac de 32 GB.
- Clasificación de imágenes de listados de segunda mano: mezclando imagen y texto en el estado, se puede decidir la categoría de un producto a partir de la foto y el título del vendedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona únicamente datos de paridad de la cuantización frente a las salidas publicadas del modelo original:

| Ejemplo (model card) | Publicado | Este checkpoint |
|---|---|---|
| choice, SKU AX-330 respuesta de proveedor (JEV-27B, vLLM) | 0.2541 / 0.1253 / 0.6200 / 0.0007 | 0.2548 / 0.1276 / 0.6169 / 0.0007 |
| choice, doble cargo → equipo (JEV-27B-VL, vLLM) | 0.9969 / 0.0000 / 0.0031 | 0.9979 / 0.0000 / 0.0021 |
| yes/no, paquete dañado → reembolso (JEV-27B, transformers) | 0.022 / 0.978 | 0.0222 / 0.9778 |

Además, sobre 36 filas reservadas de `jev-distill-corpus-v3` (partición `test_set_30k`), la KL media de este checkpoint respecto a las distribuciones del profesor es 0.027, con 34 de 36 filas dentro de tolerancia (el texto de la model card queda truncado en ese punto). Las mediciones de paridad se realizaron en un M2 Pro de 32 GB con MLX 0.32.3; la referencia bf16 de un modelo de 27B no cabe en 32 GB, por lo que el método se validó sobre JEV-9B contra la matemática oficial de PyTorch (transformers + peft, bf16).

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 17 GB de memoria unificada para inferencia en 4 bits, según el autor; el repo ocupa 16,3 GB en disco.
- GPU recomendadas: Apple Silicon con al menos 32 GB de memoria unificada (el autor lo ha validado en un M2 Pro de 32 GB); no está pensado para GPU NVIDIA.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual: está diseñado para Apple Silicon. Cabe en un Mac de 32 GB; no se especifica comportamiento en configuraciones menores.
- Opciones de despliegue: MLX-VLM mediante la rama `git+https://github.com/Bayway/mlx-vlm@add-jev` (obligatoria para este checkpoint); CLI con `python -m mlx_vlm decide` y `python -m mlx_vlm generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEV-27B-VL-MLX-4bit (este) | 27.466.870.264 | no disponible | Decisión tipada multimodal + chat base, MLX 4-bit | apache-2.0 | Hugging Face (Bayway) |
| autotrust/JEV-27B-VL | no disponible | no disponible | Decisión tipada multimodal (original) | no disponible en la información | Hugging Face (autotrust) |
| JEV-27B (autotrust) | no disponible | no disponible | Decisión tipada sobre texto (mismo adaptador) | no disponible en la información | Hugging Face (autotrust) |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Transformer generativo base | no disponible en la información | Hugging Face (Qwen) |
| nativ-community/JEV-27B-VL-MLX-MXFP4 y -8bit | no disponible | no disponible | Variantes MLX con LoRA fusionado (formato nativo de mlx-vlm) | no disponible en la información | Hugging Face (nativ-community) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint no carga con las releases estándar de mlx-vlm, incluida la versión una vez fusionado el PR #2466; falla con `KeyError: 'lora_alpha'`. Requiere la rama `add-jev` del repositorio de Bayway.
- El autor recomienda usar los checkpoints upstream de `nativ-community` (con el LoRA fusionado) salvo que se necesite mantener el adaptador sin fusionar para disponer también del modo System 2.
- Idiomas: solo inglés según la metadata; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto: no disponible en la información proporcionada; conviene verificarla antes de desplegar con entradas largas.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de clasificación calibrada, la fiabilidad depende de la formulación de la pregunta y del uso de las temperaturas de calibración.
- Calibración sensible al tipo de pregunta: las temperaturas están fijadas por tipo (noul, choice, score); un uso fuera de esos tres tipos puede degradar la calibración.
- Límite de opciones: las preguntas `choice` admiten entre 2 y 256 opciones, pero solo las 16 primeras usan los slots entrenados; el resto depende de las etiquetas adicionales de la cabeza.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B y del modelo original de AutoTrust AI antes de producción.
- Paridad medida en hardware Apple Silicon con MLX 0.32.3; el comportamiento en otras configuraciones no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bayway/JEV-27B-VL-MLX-4bit
- Modelo original: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo de texto con el mismo adaptador: https://huggingface.co/autotrust/JEV-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Base cuantizada usada: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Librería MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- PR de soporte nativo JEV en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/2466
- PR anterior cerrado: https://github.com/Blaizzy/mlx-vlm/pull/2463
- Rama requerida para este checkpoint: https://github.com/Bayway/mlx-vlm/tree/add-jev
- Checkpoint MXFP4 alternativo: https://huggingface.co/nativ-community/JEV-27B-VL-MLX-MXFP4
- Checkpoint 8-bit alternativo: https://huggingface.co/nativ-community/JEV-27B-VL-MLX-8bit
- Organización nativ-community: https://huggingface.co/nativ-community
