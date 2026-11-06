# cfahlgren1/Qwen3.5-4B-abliterated

## Resumen

Qwen3.5-4B-abliterated es una versión "abliterated" (con los rechazos de seguridad eliminados a nivel de pesos) del modelo multimodal Qwen3.5-4B de Qwen, publicada por el usuario cfahlgren1 en Hugging Face. No se trata de un fine-tuning: el autor ha localizado la dirección interna del modelo responsable de las negativas a peticiones peligrosas y la ha eliminado directamente de los pesos, siguiendo la metodología de Arditi et al. (2024) y la guía de abliteración de Maxime Labonne.

El resultado es un modelo que pasa de rechazar el 100 % de los prompts harmful a rechazar solo el 1 %, manteniendo intacto el comportamiento ante prompts inofensivos (0 % de rechazos) y con una desviación muy baja respecto al original (KL de 0,058 en prompts normales). Mantiene el pipeline image-text-to-text del modelo base, por lo que conserva sus capacidades multimodales de entrada de imagen y texto.

Este tipo de modelos es relevante para investigadores que estudian alineación, seguridad y mecanística interpretability, ya que permite analizar qué capacidades del modelo subyacente quedan enmascaradas por los mecanismos de rechazo. No está pensado para uso general en producción y requiere un manejo responsable, dado que obedece peticiones que el modelo original declina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B), multimodal image-text-to-text |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar; existe variante MLX segun tags) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (9,3 GB de tamano de repo; tambien etiquetado MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo multimodal de la familia Qwen3.5 con pipeline image-text-to-text. La ficha no detalla la arquitectura interna completa del modelo base, aunque se sabe que tiene 32 capas y una dimension de residual stream de 2560 (deducible del vector de direccion de rechazo publicado, de 2560 floats leido de la capa 11 de 32).

No hay entrenamiento adicional: la abliteración es una edicion directa de los pesos. El procedimiento consiste en ejecutar prompts harmful y harmless por el modelo, restar en cada capa la activacion media de los prompts harmless de la de los prompts harmful para obtener una "direccion de rechazo", seleccionar la capa cuya direccion elimina los rechazos con menor dano colateral (la capa 11), y sustraer esa direccion de todos los pesos que escriben al residual stream. No se aplicaron RLHF ni DPO adicionales, ni se modifico el dataset de preentrenamiento.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen3.5-4B.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), heredada del modelo base.
- Cumplimiento de peticiones que el modelo original rechaza: solo el 1 % de los prompts harmful medidos reciben una negativa.
- Comportamiento intacto ante prompts inofensivos (0 % de rechazos, igual que el original).
- Compatibilidad con MLX (mlx-lm) para ejecucion en hardware Apple Silicon.
- Compatibilidad con la libreria transformers de Hugging Face.
- No se han evaluado todavia benchmarks de capacidad, ni hay informacion sobre tool calling, agentes o thinking mode.

## Casos de uso

- Investigacion en seguridad y alineacion: permite estudiar como se comporta un modelo sin su mecanismo de rechazo, util para red-teaming, evaluacion de jailbreaks y analisis de robustez de guardrails.
- Investigacion en interpretabilidad mecanica: el autor publica el vector de direccion (refusal_direction_L11.npy, 2560 floats), lo que permite experimentar anadiendo o sustrayendo la direccion para modular los rechazos en ambas direcciones.
- Evaluacion de capacidades latentes: comparar el rendimiento del modelo abliterated frente al original en tareas dificiles permite medir cuanta capacidad suprime el alineamiento por rechazo.
- Procesamiento multimodal sin negativas: dado que hereda el pipeline image-text-to-text, puede usarse en experimentos de descripcion o analisis de imagenes donde el modelo original rechazaria ciertas consultas.
- Desarrollo local en Apple Silicon: gracias a la variante MLX y al comando mlx_lm.chat, puede desplegarse facilmente en Mac para pruebas conversacionales.
- Generacion de datos adversariales para entrenar clasificadores de seguridad: el modelo puede producir ejemplos de respuestas a prompts harmful utiles para entrenar o evaluar moderadores de contenido.

## Benchmarks y rendimiento

El unico dato cuantitativo publicado es la evaluacion de rechazos del propio autor:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechaza prompts harmful | 100 % | 1 % |
| Rechaza prompts harmless | 0 % | 0 % |
| Cambio en prompts normales (KL) | — | 0,058 |

Medicion realizada sobre 357 prompts de test (held-out), evaluando la primera palabra de cada respuesta. No se han publicado benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,3 GB en FP16/BF16 (tamano del repo de safetensors), mas margen para la cache de contexto; en la practica, una GPU con 12-16 GB de VRAM deberia ser suficiente para pesos sin cuantizar.
- GPUs recomendadas: no disponible (no hay datos oficiales); por tamano, una RTX 4090 (24 GB) o una RTX 3090 acomodarian el modelo sin cuantizar con holgura.
- Consumer GPUs: dado el tamano de ~4,66 B de parametros, es viable en GPUs de consumo de 12 GB o mas sin cuantizar, y en GPUs de 8 GB con cuantizacion (no publicada en este repo).
- Apple Silicon: soporte nativo via MLX con mlx-lm (`pip install mlx-lm; mlx_lm.chat --model cfahlgren1/Qwen3.5-4B-abliterated`).
- Opciones de despliegue: transformers (libreria nativa), mlx-lm. No hay informacion sobre compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cfahlgren1/Qwen3.5-4B-abliterated | 4,66 B | Abliteracion de Qwen3.5-4B | no disponible | Apache 2.0 | Rechaza solo el 1 % de prompts harmful; pesos editados, sin fine-tuning |
| Qwen/Qwen3.5-4B (modelo base) | no disponible | Original multimodal | no disponible | Apache 2.0 | Rechaza el 100 % de prompts harmful; comportamiento de referencia |
| Otros modelos abliterated (p. ej. series huihui-ai) | varia | Abliteraciones similares | varia | varia | Misma tecnica (Arditi et al. 2024); disponibilidad y rendimiento variables |

La comparativa se limita al modelo base, unico punto de referencia con datos publicados en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: no disponible (no se han publicado evaluaciones al respecto).
- Sin benchmarks de capacidad: el propio autor indica que aun no hay evaluaciones de rendimiento; la abliteracion podria degradar capacidades de forma no medida.
- Preguntas sobre China: el modelo sigue reproduciendo la linea oficial del gobierno chino en temas relacionados con China. El autor aclara que no es un rechazo, por lo que la edicion no lo modifica.
- Uso responsable: el modelo obedece peticiones que el modelo original declina, lo que implica riesgo de generacion de contenido harmful. Su uso etico y legal es responsabilidad del usuario.
- Edicion limitada a una direccion: la abliteracion elimina el mecanismo de rechazo, pero no otras formas de alineamiento o censura que no pasen por esa direccion.
- Licencia: Apache 2.0, permisiva para uso comercial; el modelo base Qwen3.5-4B tambien figura bajo licencia Apache 2.0 (enlace a LICENSE en el repo de Qwen).
- Adopcion temprana: modelo con muy poca traccion (336 descargas, 1 like en el momento de la ficha), sin auditoria comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cfahlgren1/Qwen3.5-4B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper de referencia (Arditi et al. 2024, "Refusal in LLMs is mediated by a single direction"): https://arxiv.org/abs/2406.11717
- Guia de abliteracion de Maxime Labonne: https://huggingface.co/blog/mlabonne/abliteration
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Datasets usados en la medicion: https://huggingface.co/datasets/mlabonne/harmful_behaviors y https://huggingface.co/datasets/mlabonne/harmless_alpaca
