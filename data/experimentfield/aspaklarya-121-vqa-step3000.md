# ExperimentField/Aspaklarya-121-vqa-step3000

## Resumen

Aspaklarya-121-vqa-step3000 es un adaptador LoRA de investigación publicado por ExperimentField sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal de 8.000 millones de parámetros orientado a visión-lenguaje. El adaptador está especializado en tareas de VQA (visual question answering) sobre imágenes de teledetección (remote sensing), y forma parte de un estudio más amplio denominado exp121, en el que se entrenaron dos expertos enrutados por tarea: uno exclusivamente para VQA (este repositorio) y otro exclusivamente para captioning (Aspaklarya-122-cap-*).

El objetivo del experimento era comprobar si las tareas de VQA y captioning compiten por la capacidad del adaptador cuando se entrenan conjuntamente. La hipótesis se descartó: eliminar los datos de captioning no mejoró la precisión en VQA, que se mantuvo plana entre las épocas 2 y 4 y en paridad con el adaptador de referencia exp101-step4500. El autor publica el adaptador explícitamente como registro de una hipótesis refutada, no como modelo recomendado; la recomendación vigente sigue siendo Aspaklarya-101-step4500.

Por tanto, este repositorio tiene interés principalmente para investigadores que estudien interferencia entre tareas en adaptadores PEFT y protocolos de evaluación con juez LLM, más que como artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL |
| Parámetros totales | no disponible (adaptador LoRA de r=16 sobre base de 8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (base Qwen3-VL-8B-Instruct; el entrenamiento usó secuencia 2048) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la base admite cuantización según su propio ecosistema) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango 16, alpha 16 y dropout 0, aplicado sobre Qwen/Qwen3-VL-8B-Instruct. A diferencia de configuraciones que congelan el codificador visual, aquí el vision tower sí se entrena. El entrenamiento se realizó con optimizador de tasa de aprendizaje 2e-4 lineal, warmup 0.03, weight decay 0.001, gradient clipping 0.3, batch efectivo de 4 x 8 acumulaciones, secuencia de 2048 tokens y lado máximo de imagen de 1024 píxeles, con semilla 3407 sobre una única A100 de 40 GB durante aproximadamente 6,5 horas.

Los datos provienen de la tabla de imágenes VLR_Dataset, columna VQA_1126, splits train y other: 23.986 ítems de VQA (2 pares pregunta-respuesta por imagen) y cero captions. Se ejecutaron 4 épocas (3.000 pasos, guardado cada 750) para igualar la exposición del experimento de referencia exp101, que vio cada ítem de VQA 4 veces sobre una mezcla de 35.979 ítems. La única diferencia respecto a exp101 es la composición del batch.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes de teledetección, con dos pares QA por imagen en el conjunto de entrenamiento.
- Razonamiento multimodal heredado del modelo base Qwen3-VL-8B-Instruct (comprensión de imagen y texto).
- Capacidad residual de captioning: las métricas de captioning subieron de forma monótona durante el entrenamiento (CAP_DM 68,09 -> 68,85 -> 69,01) pese a no haber datos de captioning, aunque los valores absolutos colapsan frente a un adaptador entrenado en captioning (CAP_RSICD 34,11 frente a ~80).
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada (depende del modelo base, no documentado aquí).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre interferencia entre tareas en PEFT: usar este adaptador como brazo de control (VQA puro) frente a Aspaklarya-122-cap-* y a la mezcla de exp101 para replicar el análisis de interferencia entre objetivos de VQA y captioning.
- Reproducción de experimentos de teledetección: servir como punto de partida para comparar el efecto de la composición del batch en la precisión de VQA sobre los slices VQA_DM y VQA_RSICD.
- Estudio de protocolos de evaluación con juez LLM: el adaptador se evaluó con un juez de texto (gemma-4-31b-it-imiai) sobre 500 ítems de validación por slice con semilla fija, útil para analizar el sesgo de este tipo de evaluación.
- Análisis de transferencia entre tareas: medir cuánta capacidad de captioning se preserva al entrenar solo con VQA, como hace el autor con los slices CAP_DM y CAP_RSICD.
- Base para ajuste fino posterior en dominios de observación de la Tierra: al ser un LoRA ligero (repo de 0,2 GB) sobre Qwen3-VL-8B-Instruct, puede servir de inicialización para experimentos derivados, aunque el autor no lo recomienda como modelo final.
- Docencia y divulgación sobre metodología experimental: el repositorio documenta una hipótesis pre-registrada, su puerta de victoria (>= 75,96 en VQA_DM) y un resultado nulo, lo que lo convierte en un ejemplo didáctico de publicación de resultados negativos.

## Benchmarks y rendimiento

Evaluación con 500 ítems de validación retenidos por slice, semilla fija, generaciones puntuadas por un juez LLM de texto (gemma-4-31b-it-imiai) por acuerdo con la respuesta de referencia.

| Checkpoint | VQA_DM | VQA_RSICD |
|---|---|---|
| step1500 (2 épocas) | 74,23 | 68,95 |
| step2250 (3 épocas) | 74,42 | 69,11 |
| step3000 (4 épocas) | 74,22 | 69,47 |
| Control (media de 3 semillas) | 72,82 | 70,15 |
| exp101-step4500 | 74,16 | 70,56 |
| Puerta de victoria pre-registrada | >= 75,96 | - |

| Slice de captioning (off-task) | Valor |
|---|---|
| CAP_DM (step3000) | 69,01 (subida monótona desde 68,09) |
| CAP_RSICD (step3000) | 34,11 (frente a ~80 de un adaptador entrenado en captioning) |

El resultado se considera nulo: la dispersión entre épocas 2 y 4 es de 0,20 frente a una sigma por slice de 0,88, y el adaptador queda en paridad con exp101 en VQA_DM y por debajo del control en VQA_RSICD.

## Requisitos de hardware

- Entrenamiento: 1x A100 de 40 GB, aproximadamente 6,5 horas para 3.000 pasos con batch 4 x 8 y secuencia 2048.
- Inferencia: no se documentan requisitos específicos; al ser un LoRA sobre Qwen3-VL-8B-Instruct, la VRAM depende de la cuantización del modelo base (no disponible en la información proporcionada).
- GPU recomendadas: no disponible para inferencia; el entrenamiento se validó en A100 40 GB.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el ejemplo oficial usa transformers (AutoModelForImageTextToText) y peft (PeftModel). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Datos de entrenamiento | VQA_DM | VQA_RSICD | Licencia |
|---|---|---|---|---|---|---|
| Aspaklarya-121-vqa-step3000 | LoRA VQA puro | Qwen3-VL-8B-Instruct | 23.986 ítems VQA, 0 captions | 74,22 | 69,47 | no disponible |
| Aspaklarya-101-step4500 (referencia) | LoRA mixto VQA+captioning | Qwen3-VL-8B-Instruct | mezcla de 35.979 ítems | 74,16 | 70,56 | no disponible |
| Aspaklarya-122-cap-* | LoRA captioning puro | Qwen3-VL-8B-Instruct | solo captions | no disponible | no disponible | no disponible |
| Control (3 semillas) | sin adaptador específico | Qwen3-VL-8B-Instruct | - | 72,82 | 70,15 | según modelo base |

## Limitaciones y advertencias

- Modelo rechazado por el propio autor: se publica como registro de una hipótesis refutada, no como modelo recomendado. La recomendación vigente es Aspaklarya-101-step4500.
- No supera la puerta de victoria pre-registrada (>= 75,96 en VQA_DM) y queda por debajo del control en VQA_RSICD.
- La evaluación usa un juez LLM solo de texto que mide acuerdo con referencias, no verdad a nivel de píxel; puede introducir sesgos sistemáticos.
- Licencia no especificada: no hay garantías para uso comercial y conviene verificar la licencia del modelo base Qwen3-VL-8B-Instruct antes de cualquier despliegue.
- Idiomas soportados no documentados.
- Capacidad de captioning severamente degradada (CAP_RSICD 34,11 frente a ~80 de un adaptador específico), por lo que no es adecuado para tareas de descripción de imágenes.
- Especializado en teledetección; el rendimiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación y sesgos del modelo base no documentados en esta ficha.
- Uso previsto: investigación y reproducibilidad experimental, no producción.

## Enlaces

- Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-121-vqa-step3000
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Adaptador de captioning del mismo estudio: https://huggingface.co/ExperimentField/Aspaklarya-122-cap-3000 (referencia citada como `ExperimentField/Aspaklarya-122-cap-*`)
- Adaptador de referencia recomendado: Aspaklarya-101-step4500 (referenciado en la model card; URL no disponible)
- Paper, blog o demo adicionales: no disponible
