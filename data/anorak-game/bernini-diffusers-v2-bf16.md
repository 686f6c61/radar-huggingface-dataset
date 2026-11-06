# anorak-game/Bernini-Diffusers-v2-bf16

## Resumen

Bernini-Diffusers-v2 es un pipeline completo de generación y edición de vídeo desarrollado por ByteDance, que combina un planificador semántico basado en un modelo de lenguaje multimodal (MLLM) con un renderizador basado en Diffusion Transformer (DiT). El modelo resuelve el problema de la fidelidad a instrucciones complejas en generación de vídeo: en lugar de mapear directamente texto a píxeles, descompone la petición en un plan semántico latente antes de renderizar, lo que mejora el seguimiento de instrucciones y el manejo de ediciones guiadas por referencia.

La arquitectura integra Qwen2.5-VL-7B-Instruct como planificador y Wan2.2-T2V-A14B como renderizador, sumando aproximadamente 21.000 millones de parámetros en total (7B del planificador y 14B del renderizador). Soporta tareas de texto a imagen (`t2i`), imagen a imagen (`i2i`), texto a vídeo (`t2v`), vídeo a vídeo (`v2v`), vídeo a vídeo con referencia (`rv2v`) y referencia a vídeo (`r2v`).

Esta ficha describe la variante `anorak-game/Bernini-Diffusers-v2-bf16`, una copia comunitaria del checkpoint oficial en la que todos los tensores en coma flotante del directorio `bernini/` se han convertido de fp32 a bf16, el tipo de dato con el que computa la `BerniniPipeline` de referencia. El resultado reduce el tamaño del repositorio sin alterar el comportamiento numérico esperado de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: planificador MLLM (Qwen2.5-VL-7B-Instruct) + renderizador DiT (Wan2.2-T2V-A14B) |
| Parametros totales | Aproximadamente 21B (7B planificador + 14B renderizador) |
| Parametros activos | No disponible (no se declara como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (esta variante); el checkpoint original en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

Bernini es un framework unificado que separa la generación de vídeo en dos etapas: planificación semántica y renderizado. La primera etapa la ejecuta un planificador basado en Qwen2.5-VL-7B-Instruct, que interpreta la instrucción del usuario (texto, imagen o vídeo de referencia) y produce un plan semántico latente que descompone la petición en cambios concretos. La segunda etapa la ejecuta un renderizador DiT basado en Wan2.2-T2V-A14B, que materializa ese plan en píxeles. El conector entre ambas etapas es la pieza clave del sistema.

La receta de entrenamiento de la versión v2 introduce un calentamiento del conector durante miles de pasos antes del co-entrenamiento conjunto, lo que según el autor mejora la edición de vídeo guiada por referencia y el rendimiento en OpenS2V respecto a la primera release de Bernini-Diffusers. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo base oficial es `ByteDance/Bernini-Diffusers-v2`, en la revisión `399cf6a18a4c523b367b2b1ac25a2a61009e7df3`.

Esta variante bf16 convierte todos los tensores en coma flotante de `bernini/` de fp32 a bf16 y elimina la copia separada del codificador de texto T5 (conservando solo su `config.json`), ya que los mismos pesos UMT5 forman parte de `bernini/`. El código oficial de ByteDance carga el directorio sin modificaciones.

## Capacidades

- Generación de vídeo a partir de texto (`t2v`) con planificación semántica explícita previa al renderizado.
- Edición de vídeo (`v2v`) aplicando instrucciones en lenguaje natural sobre un vídeo existente.
- Edición de vídeo guiada por referencia (`rv2v`): combina un vídeo fuente con una referencia visual para dirigir la transformación.
- Generación a partir de referencia (`r2v`): produce vídeo condicionado por una imagen o vídeo de referencia.
- Texto a imagen (`t2i`) e imagen a imagen (`i2i`), heredadas de los componentes del renderizador.
- Seguimiento reforzado de instrucciones complejas gracias al planificador MLLM, que descompone peticiones multi-paso.
- Capacidades multimodales de entrada a través de Qwen2.5-VL (comprensión de imagen y vídeo como contexto).
- Mejora de prompt opcional mediante el flag `--use_pe` del código de inferencia.

## Casos de uso

- Edición de vídeo en postproducción: sustituir objetos, fondos o atributos en un clip existente mediante instrucciones en lenguaje natural, usando la tarea `v2v` con el planificador para interpretar la intención del editor y el renderizador para mantener la coherencia temporal.
- Generación de vídeo publicitario a partir de un brief: la tarea `t2v` con planificación semántica permite traducir descripciones complejas de producto, escena y acción en clips coherentes, reduciendo la necesidad de reescribir prompts.
- Prototipado de storyboards animados: partiendo de una imagen clave (`i2i` o `r2v`), generar variaciones animadas para validar dirección de arte antes de producir el material final.
- Transferencia de estilo guiada por referencia: usar `rv2v` para aplicar el aspecto visual de un vídeo de referencia a un metraje propio, útil en branding y campañas con identidad visual estricta.
- Creación de contenido para redes sociales: generar clips cortos a partir de texto o de una imagen semilla, con control fino sobre la composición gracias a la etapa de planificación.
- Investigación en generación de vídeo: el pipeline es un caso de estudio abierto de planificación semántica latente sobre un renderizador DiT, útil para experimentar con conectores MLLM-DiT y recetas de co-entrenamiento.
- Automatización de variantes creativas: generar múltiples versiones de un mismo concepto cambiando únicamente la instrucción de edición, manteniendo el vídeo base y la referencia.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base oficial (Bernini-v2 7+14B):

| Benchmark | Resultado |
|---|---|
| EditVerse | 8.02 |
| OpenVE | 3.96 |
| OpenS2V | 63.83 |
| VBench | 84.46 |
| Bernini-v2v (OS) | 3.49 |
| Bernini-rv2v (OS) | 3.55 |

El autor afirma que, en edición de vídeo, Bernini alcanza el primer nivel entre los principales modelos comerciales de código cerrado en su evaluación interna de arena basada en comparaciones ciegas por pares humanos. No se proporcionan resultados desglosados por tarea ni comparativas numéricas con alternativas concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 90,8 GB y el pipeline completo combina un planificador de 7B y un renderizador de 14B, por lo que se requiere hardware de clase servidor.
- GPU recomendadas: Hopper (H100, H800, H200) según la documentación oficial para mejor rendimiento.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del pipeline y los requisitos de memoria hacen improbable su ejecución en GPU de consumo convencionales.
- Entorno recomendado: Python 3.11.2, PyTorch 2.7.1+cu126, CUDA toolkit 12.6.
- Dependencia adicional: Open-VeOmni (`ByteDance-Seed/VeOmni` v0.1.11), instalado con `--no-deps` para no sobrescribir el build de torch fijado.
- Opciones de despliegue: código oficial de inferencia (`infer_single_gpu.py` del repositorio `bytedance/Bernini`) y carga mediante `diffusers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bernini-Diffusers-v2 (esta ficha) | ~21B (7B + 14B) | No disponible | Planificador MLLM + renderizador DiT | Apache 2.0 | Pesos abiertos en Hugging Face |
| Bernini-R | No disponible | No disponible | Solo renderizador | No disponible | Pesos abiertos en Hugging Face |
| Wan2.2-T2V-A14B | 14B | No disponible | DiT de texto a vídeo | No disponible | Pesos abiertos en Hugging Face |

La información disponible no incluye comparativas numéricas con otros pipelines de generación de vídeo de código abierto. La diferencia principal de Bernini frente a Bernini-R es la inclusión del planificador semántico, que mejora el seguimiento de instrucciones y el manejo de peticiones complejas a costa de un checkpoint más pesado.

## Limitaciones y advertencias

- El repositorio ocupa 90,8 GB, lo que exige almacenamiento considerable y descargas largas.
- La inferencia requiere GPU de clase Hopper según la documentación oficial; no se garantiza funcionamiento en hardware inferior.
- Dependencia de Open-VeOmni con instalación especial (`--no-deps`) para evitar conflictos con la versión de torch fijada; un entorno mal configurado puede romper la inferencia.
- No se detallan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes subyacentes (Qwen2.5-VL, Wan2.2) pueden tener condiciones adicionales que conviene verificar.
- Esta variante bf16 es una conversión comunitaria no oficial; aunque el autor indica que el código oficial la carga sin cambios, no está respaldada por ByteDance.
- La evaluación de calidad se basa en parte en una arena interna del autor; no se aportan comparativas independientes en la información disponible.
- No se documentan límites de longitud de vídeo, resolución ni número de frames soportados.

## Enlaces

- Modelo en Hugging Face (esta variante): https://huggingface.co/anorak-game/Bernini-Diffusers-v2-bf16
- Modelo base oficial: https://huggingface.co/ByteDance/Bernini-Diffusers-v2
- Repositorio de código oficial: https://github.com/bytedance/Bernini
- Paper: https://arxiv.org/abs/2605.22344
- Página del proyecto: https://bernini-ai.github.io/
- Colección de modelos Bernini en Hugging Face: https://huggingface.co/collections/ByteDance/bernini
- Renderizador base Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Planificador base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de la herramienta de conversión: https://github.com/anorak-games/cagoule-catalog
- Open-VeOmni (dependencia): https://github.com/ByteDance-Seed/VeOmni
