# KL-PHD/rl-test

## Resumen

`KL-PHD/rl-test` es un repositorio experimental de checkpoints intermedios de un proceso de aprendizaje por refuerzo (RL) en curso, no un modelo final publicado. El autor, KL-PHD, parte de `Qwen/Qwen3.5-9B` y entrena al modelo para una tarea concreta: escribir prompts fundamentados (grounded) para vídeos comerciales cortos, apoyándose en herramientas de búsqueda de imágenes dentro de un bucle de agente. Cada iteración se publica aproximadamente cada 1,5 a 3,5 horas y nunca se sobrescribe, de modo que el repositorio funciona como un registro vivo del entrenamiento.

El modelo es un transformer multimodal de 9 000 millones de parámetros (hereda la arquitectura de Qwen3.5-9B, incluyendo visión, según el uso de `AutoModelForImageTextToText` y el procesador de imagen), con una ventana de contexto total de 65 536 tokens y 6 144 tokens nuevos por turno. La relevancia de este repositorio no radica en la calidad del modelo —el propio autor advierte que no se ha evaluado— sino en que documenta de forma explícita los ajustes de inferencia (prompt de sistema obligatorio, temperatura, top-p, top-k, límites de llamadas a herramientas) necesarios para reproducir el comportamiento del entrenamiento.

El tamaño del repositorio (3 454,7 GB) se explica porque contiene, además de los pesos en formato Hugging Face (unos 18 GB por iteración), checkpoints completos de Megatron en `torch_dist` con estado del optimizador (unos 136 GB por iteración) y el estado del cargador de datos para reanudar el entrenamiento. Para inferencia basta con descargar una única carpeta `hf/iter_XXXXXXX/`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda de Qwen3.5-9B; imagen-texto) |
| Parámetros totales | 9 000 millones (por el modelo base Qwen3.5-9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65 536 tokens (contexto total); 6 144 tokens nuevos por turno |
| Tipos de cuantización | no disponible (los pesos se publican en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carpeta `hf/iter_XXXXXXX/`); además checkpoints Megatron `torch_dist` con estado del optimizador |
| Librería | transformers (requiere `transformers>=5.12`) |
| Pipeline | reinforcement-learning |
| Checkpoint base | Qwen/Qwen3.5-9B (SFT del que parte el run) |
| Precisión de inferencia | `bfloat16` |
| Límite de imagen | 4 194 304 píxeles (4 096 tokens de imagen) |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint supervisado (SFT) de Qwen3.5-9B y se entrena mediante aprendizaje por refuerzo con la infraestructura slime (commit `540ea91`), guardando checkpoints en formato Megatron `torch_dist` con tamaño de paralelismo tensorial 2 (se mencionan 4 GPU para reanudar el entrenamiento). La tarea de RL es generar prompts fundamentados para vídeos comerciales cortos, con un entorno de agente (`VideoSearcherEnv`) que permite hasta 8 llamadas a herramientas y 2 llamadas a `image_search` por turno. El bucle de agente actúa sobre el primer `<tool_call>` o `<answer>` y devuelve los resultados de herramientas como mensaje `user` envuelto en `<tool_response>`, con imágenes colocadas tras su etiqueta `IMG_###:` (máximo 5 imágenes por búsqueda).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como DPO o decodificación especulativa. Los checkpoints incluyen el estado del optimizador y la posición del cargador de datos (`rollout/global_dataset_state_dict_N.pt`), lo que permite reanudar el entrenamiento exactamente donde se dejó. Los archivos de configuración, tokenizador, plantilla de chat y procesador de cada iteración son idénticos a los del checkpoint SFT de partida.

## Capacidades

- Generación de texto orientada a prompts para vídeos comerciales cortos, con fundamentación en búsquedas de imágenes.
- Procesamiento multimodal imagen-texto (carga mediante `AutoModelForImageTextToText` y procesador de imagen).
- Uso de herramientas (tool calling) dentro de un bucle de agente, con hasta 8 llamadas a herramientas y 2 búsquedas de imágenes por turno.
- Modo de razonamiento (thinking) activado por defecto; el autor desaconseja desactivarlo (`enable_thinking=False`).
- Manejo de contexto largo: ventana total de 65 536 tokens y 6 144 tokens nuevos por turno.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- No se documentan capacidades de código, matemáticas ni audio.

## Casos de uso

- Generación de briefs y prompts para anuncios de vídeo corto: el modelo produce prompts fundamentados a partir de una descripción textual, usando búsqueda de imágenes para anclar referencias visuales, adecuado por su entrenamiento específico en esta tarea.
- Investigación en aprendizaje por refuerzo: los checkpoints intermedios permiten estudiar la evolución del comportamiento a lo largo del entrenamiento, con estado del optimizador y del cargador de datos para reproducir curvas de aprendizaje.
- Reproducción de experimentos de RL: al incluir checkpoints Megatron `torch_dist` y el estado del dataset, un equipo puede reanudar el run con slime en 4 GPU con paralelismo tensorial 2.
- Evaluación de pipelines de agente con herramientas: el entorno `VideoSearcherEnv` sirve como banco de pruebas para medir el comportamiento de tool calling y manejo de resultados en formato `<tool_response>`.
- Prototipado de asistentes multimodales con contexto largo: la ventana de 65 536 tokens permite mantener conversaciones multi-turno con historial extenso e imágenes intercaladas.
- Estudio de prompts de sistema estrictos: el requisito de un `system_prompt.txt` con fecha en la última línea permite analizar cómo la formulación del prompt condiciona la calidad de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la calidad no ha sido evaluada y que los checkpoints deben tratarse como trabajo en curso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9 000 millones de parámetros en `bfloat16` se requiere aproximadamente 18 GB solo para pesos, más overhead de activaciones y contexto largo (65 536 tokens), lo que eleva el consumo por encima de una GPU consumer de 24 GB en configuraciones de contexto completo.
- GPU recomendadas: no especificadas por el autor; para reanudar entrenamiento se indican 4 GPU (paralelismo tensorial 2). Para inferencia, el ejemplo usa `device_map="auto"`.
- ¿Cabe en GPU consumer? No confirmado; con cuantización no documentada no puede garantizarse. El contexto largo y el procesador de imagen hacen probable que no quepa íntegramente en 24 GB sin cuantización.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`) con `transformers>=5.12`, `torch`, `accelerate` y `huggingface_hub`; para reanudar entrenamiento, slime en el commit `540ea91`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KL-PHD/rl-test | 9 000 M | 65 536 | no disponible | Hugging Face (checkpoints experimentales) | RL en curso, sin evaluación de calidad |
| Qwen/Qwen3.5-9B (base) | 9 000 M | no disponible en esta ficha | no disponible | Hugging Face | Modelo base del que parte el run |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la información proporcionada |

## Limitaciones y advertencias

- Calidad no evaluada: el autor advierte que los checkpoints son trabajo en curso y no deben tratarse como modelo final.
- Requiere un prompt de sistema concreto (`system_prompt.txt` más la fecha en la última línea) que no está incluido en el repositorio; sin él, la calidad de salida puede degradarse.
- Configuración de inferencia sensible: desviarse de `temperature=0.7`, `top_p=1.0`, `top_k=0`, thinking activado o `max_new_tokens=6144` puede alterar la calidad.
- Repositorio extremadamente grande (3 454,7 GB) por los checkpoints completos; conviene descargar solo una carpeta `hf/iter_XXXXXXX/`.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas no documentados: no puede garantizarse cobertura multilingüe.
- Riesgo de alucinación: no cuantificado; al ser un modelo en entrenamiento sin evaluación, el riesgo es desconocido.
- Sesgos conocidos: no documentados.
- Dependencia del código privado (`rl_code/video_searcher_rl.py`, `rl_code/prompts/system_prompt.txt`) para reproducir el agente completo y las herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/KL-PHD/rl-test
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio slime (infraestructura de entrenamiento): https://github.com/THUDM/slime
- Paper, blog, demo o repositorio adicional: no disponible
