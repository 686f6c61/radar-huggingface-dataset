# abhinand/DaisyRose-27B-Quark-AWQ-MXFP4

## Resumen

DaisyRose-27B es el primer modelo publicado por RadixArk, un modelo multimodal de razonamiento construido sobre Qwen3.8-27B y entrenado exclusivamente con aprendizaje por refuerzo, sin ajuste fino supervisado ni destilación. El entrenamiento se realizó sobre aproximadamente 1.200 tareas de agente de horizonte largo, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPU H200. El resultado principal es una mejora sustancial en tareas de agente de terminal (Terminal Bench 4.1 pasa de 5,6 a 12,0 en pass@1) manteniendo la arquitectura, el tokenizador y la plantilla de chat del modelo base.

La ficha que nos ocupa, `abhinand/DaisyRose-27B-Quark-AWQ-MXFP4`, es una cuantización de ese modelo base realizada por el usuario abhinand, que combina AWQ con el formato MXFP4 (4 bits de microescala) y se distribuye en 8 bits según los tags del repositorio. El repositorio ocupa 19,4 GB y contiene pesos en safetensors compatibles con transformers, lo que permite desplegar el modelo en hardware más modesto que la versión BF16 original.

El modelo conserva la ventana de contexto de 256K tokens del base, la capacidad de comprensión de imágenes (pipeline image-text-to-text) y la licencia Apache-2.0. Es relevante ahora porque ofrece un modelo de razonamiento multimodal de 27B con capacidades de agente de terminal y de ingeniería de software por encima de su base, en un formato cuantizado que reduce los requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B); tag de librería `qwen3_5` |
| Parametros totales | 15.606.149.872 (dato real de safetensors); el modelo base se anuncia como 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (heredada del modelo base) |
| Tipos de cuantizacion | AWQ combinado con MXFP4 (4 bits de microescala); repo etiquetado como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

DaisyRose-27B mantiene la arquitectura del modelo base Qwen3.8-27B, incluyendo su tokenizador y su plantilla de chat, por lo que funciona como reemplazo directo en pilas de inferencia y post-entrenamiento existentes. El modelo es multimodal: procesa imagen y texto (pipeline image-text-to-text) y conserva la ventana de contexto de 256K tokens del base. La innovación principal del entrenamiento es que se realizó únicamente con aprendizaje por refuerzo, sin ajuste fino supervisado ni destilación, sobre unas 1.200 tareas de agente de horizonte largo curadas, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPU H200.

La ficha cuantizada de abhinand aplica AWQ junto con MXFP4, un formato de 4 bits con escalas de microescala por bloque, lo que reduce el peso del repositorio a 19,4 GB. No se dispone de detalles adicionales sobre la receta de cuantización (tamaño de grupo, calibración, capas excluidas) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto.
- Razonamiento de largo alcance: modo de pensamiento con esfuerzo de razonamiento configurable (el valor por defecto del template es `xhigh`).
- Agente de terminal: ejecución de tareas de línea de comandos y resolución de problemas de terminal (Terminal Bench 4.1 y 2.1).
- Ingeniería de software: resolución de issues y parches (DeepSWE v1.1, SWE Bench Pro v2).
- Seguimiento de instrucciones: evaluación específica en IFBench.
- Razonamiento científico y de conocimiento: GPQA Diamond y HLE (texto).
- Ventana de contexto de 256K tokens, adecuada para sesiones de agente de horizonte largo.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agente de terminal automatizado: el modelo puede gestionar sesiones de shell de múltiples pasos y corregir errores, con un pass@1 de 12,0 en Terminal Bench 4.1 frente a 5,6 del base; adecuado para pipelines de operaciones y automatización de tareas de sistema.
- Resolución de issues de software: con 94,7 en SWE Bench Pro v2 y 46,2 en DeepSWE v1.1, puede integrarse en flujos de generación y validación de parches sobre repositorios reales.
- Razonamiento científico asistido: 90,7 en GPQA Diamond lo hace útil para preguntas de nivel experto en dominios STEM dentro de asistentes de investigación.
- Análisis de imágenes con contexto largo: al ser image-text-to-text con 256K de contexto, sirve para revisar documentación técnica escaneada o capturas junto con grandes volúmenes de texto en una misma sesión.
- Despliegue en hardware con memoria limitada: la versión cuantizada AWQ+MXFP4 de 19,4 GB permite servir el modelo en una sola GPU de 24 GB o en configuraciones multi-GPU modestas, donde el BF16 no cabría.
- Evaluación de seguimiento de instrucciones en producción: 82,4 en IFBench lo hace apto para tareas de formato estricto y cumplimiento de restricciones en asistentes.
- Sustitución directa de Qwen3.8-27B: al mantener tokenizador y plantilla de chat, puede reemplazar al base en pilas existentes sin cambios de integración.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para el modelo base DaisyRose-27B (no específicos de esta cuantización):

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | MiMo V2.6 Flash | Inkling 2 Small | GPT-6 Luna |
|---|---:|---:|---:|---:|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 16,1 | 13,0 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 87,6 | 81,3 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 67,9 | 72,1 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | no disponible | 97,7 | no disponible |
| HLE (solo texto) | 34,3 | 33,9 | 22,0 | 35,1 | 44,1 | 38,5 |
| IFBench | 82,4 | 79,5 | 77,0 | no disponible | no disponible | no disponible |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 88,7 | 93,0 | 90,5 |

No se han publicado resultados de benchmarks específicos para la versión cuantizada AWQ+MXFP4 en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,4 GB, por lo que la inferencia requiere aproximadamente 20-24 GB de VRAM con overhead de activaciones y caché KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S; la versión cuantizada permite también GPU consumer de gama alta.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) y en GPUs de 24 GB o más; en GPUs de 16 GB requeriría cuantización adicional o descarga parcial de capas.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Terminal Bench 4.1 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| DaisyRose-27B (base) | 27B | 256K | 12,0 | Apache-2.0 | BF16, FP8, NVFP4, GGUF |
| Esta cuantización (AWQ+MXFP4) | 15.606.149.872 (safetensors) | 256K | no disponible para la versión cuantizada | Apache-2.0 | safetensors |
| Qwen3.8-27B (base original) | 27B | 256K | 5,6 | no disponible | no disponible |
| Muse Glimmer-30B | 30B | no disponible | 0,5 | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B (3B activos) | no disponible | 0,0 | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización AWQ+MXFP4 puede degradar ligeramente la precisión respecto a BF16; no hay benchmarks publicados de esta variante concreta.
- El modelo se entrenó exclusivamente con RL sobre tareas de agente; puede presentar un comportamiento menos alineado en conversación general que modelos con SFT.
- Riesgo de alucinación inherente a modelos de razonamiento; los resultados de HLE (34,3) indican que sigue fallando en una fracción importante de preguntas de nivel experto.
- Idiomas soportados no documentados: no se garantiza un rendimiento uniforme fuera del inglés.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria de la calidad de la cuantización.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (Qwen3.8-27B) por si impone condiciones adicionales.
- No se dispone de información sobre tool calling, por lo que no debe asumirse su soporte en producción sin validación previa.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/abhinand/DaisyRose-27B-Quark-AWQ-MXFP4
- Modelo base BF16: https://huggingface.co/RadixArk/DaisyRose-27B
- Versión FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Versión NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Versión GGUF: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Draft para decodificación especulativa: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Paper de SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
- Leaderboard de Terminal Bench: https://www.tbench.ai/leaderboard
