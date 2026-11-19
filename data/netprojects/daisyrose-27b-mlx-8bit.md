# netprojects/DaisyRose-27B-MLX-8bit

## Resumen

DaisyRose-27B-MLX-8bit es una conversión a formato MLX del modelo RadixArk/DaisyRose-27B, un transformer multimodal de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) desarrollado por RadixArk a partir de Qwen3.8-27B. La particularidad del modelo base es que se ha entrenado exclusivamente con aprendizaje por refuerzo (RL), sin supervisión directa ni destilación, sobre unas 1.200 tareas de agente de horizonte largo. Conserva la arquitectura, el tokenizador, la plantilla de chat, la comprensión de imágenes y la ventana de contexto de 256K del modelo Qwen3.8-27B original.

Esta versión concreta, publicada por el usuario netprojects, cuantiza las capas lineales a 8 bits con cuantización afín de grupo 64 y mantiene tanto el codificador visual como la capa de predicción multi-token (MTP) propia de DaisyRose. El resultado es un paquete de 29,9 GB que se ejecuta de forma nativa en Apple Silicon mediante las librerías mlx-lm y mlx-vlm, con una fidelidad respecto a los pesos bf16 del 99,5 % en el siguiente token y una divergencia KL de 0,0004.

La relevancia de esta ficha reside en que ofrece un modelo de razonamiento y agentes de gama alta (27B) ejecutable en un Mac con 48 GB o más de memoria unificada, algo que hasta hace poco requería hardware de centro de datos. El modelo piensa antes de responder por defecto y admite control del esfuerzo de razonamiento mediante el parámetro `reasoning_effort`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8-27B, con capa MTP propia |
| Parámetros totales | 27.781.427.952 (27,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | 8 bits afín, grupo 64 (esta build); el repositorio del autor ofrece también 6, 4, 3 bits y bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` separado para la capa MTP |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura de Qwen3.8-27B, un transformer denso con capacidades multimodales (comprensión de imágenes) y una ventana de contexto de 256K tokens. RadixArk lo ha sometido a un proceso de aprendizaje por refuerzo puro sobre aproximadamente 1.200 tareas de agente de horizonte largo, sin fase de ajuste supervisado ni destilación. Esta decisión de entrenamiento busca reforzar comportamientos de planificación, uso de herramientas y razonamiento multi-paso, y se refleja en las mejoras publicadas frente al modelo base en benchmarks de terminal, ingeniería de software e instrucciones.

La conversión a MLX, realizada con mlx-vlm, preserva el codificador visual y la capa de predicción multi-token (MTP) del modelo original, cuantizada también a 8 bits. La MTP actúa como modelo borrador integrado para decodificación especulativa: cada token propuesto se verifica con el modelo completo, de modo que con decodificación greedy el texto coincide con la decodificación plana salvo en empates cercanos. El tokenizador y la plantilla de chat son los archivos originales de RadixArk, sin modificaciones.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto; el bloque de razonamiento se devuelve antes de `</think>`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y desactivación del pensamiento con `enable_thinking=False`.
- Comprensión de imágenes (pipeline image-text-to-text): descripción de capturas, lectura de terminales, análisis de contenido visual.
- Llamada a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Comportamiento orientado a agentes y razonamiento multi-paso, fruto del entrenamiento RL sobre tareas de horizonte largo.
- Capacidades de código e ingeniería de software, con resultados destacados en Terminal Bench, DeepSWE y SWE Bench Pro según el autor.
- Decodificación especulativa acelerada mediante la capa MTP integrada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia en terminal y operaciones de línea de comandos: el modelo puede interpretar la salida de una terminal, diagnosticar errores y proponer comandos correctivos, aprovechando su entrenamiento específico en tareas de terminal (Terminal Bench 4.1: 12,0 frente a 5,6 del base).
- Automatización de ingeniería de software: generación y revisión de parches, resolución de incidencias y navegación de repositorios, con soporte de tool calling para integrarse en pipelines de CI/CD.
- Agentes autónomos multi-paso: planificación y ejecución de tareas largas con llamadas a herramientas encadenadas, gracias al entrenamiento RL sobre tareas de horizonte largo y al modo de pensamiento configurable.
- Análisis de capturas y documentación técnica: con mlx-vlm, el modelo puede leer una captura de pantalla de un terminal o de una interfaz y explicar el error o el estado mostrado.
- Asistente de razonamiento matemático y científico: resolución de problemas con cadena de pensamiento extensa, adecuado para preguntas de nivel GPQA Diamond (90,7 según el autor) y cálculo simbólico.
- Despliegue local en estaciones de trabajo Apple Silicon: prototipado y uso personal de un modelo de 27B con contexto largo en un Mac de 48 GB o más, sin depender de la nube.
- Servicio de inferencia local compatible con OpenAI: `mlx_lm.server` expone una API con tool_calls, lo que permite sustituir un endpoint remoto por uno local en herramientas existentes.

## Benchmarks y rendimiento

Resultados publicados por RadixArk para los pesos originales BF16/FP8 (no para esta build MLX de 8 bits):

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de fidelidad de esta build de 8 bits frente a bf16: 99,5 % de coincidencia en el siguiente token, KL de 0,0004, y 3/3 en pruebas de tool calling y coding, 2/2 en thinking y vision. Memoria pico con prompt de 8K tokens: 29,7 GB. No se han publicado resultados de GSM8K para esta build de 8 bits (la de 6 bits obtiene 44/50 y la de 4 bits 45/50).

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,7 GB de pico con prompt de 8K tokens; el paquete ocupa 29,9 GB en disco.
- Mac recomendado: 48 GB o más de memoria unificada para el límite de GPU por defecto (el límite por defecto es aproximadamente dos tercios de la RAM hasta 36 GB y tres cuartos por encima).
- En Macs de 32 GB puede funcionar elevando el límite de memoria de GPU (`sudo sysctl iogpu.wired_limit_mb=27000`) y usando contextos cortos; en ese caso el autor recomienda la build de 6 bits.
- GPU dedicadas: no se documenta soporte CUDA para esta build MLX; para NVIDIA habría que usar los pesos originales con vLLM, TGI o llama.cpp, no disponibles en la información proporcionada.
- Despliegue: mlx-lm (versión 0.32.2 o superior) para texto y servidor compatible con OpenAI; mlx-vlm (0.7.11 o superior) para imágenes; decodificación especulativa con MTP pasando el mismo repositorio como `--draft-model` y `--draft-kind mtp`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| DaisyRose-27B-MLX-8bit | 27,8B | 256K | Apache 2.0 | MLX safetensors | Esta ficha; 8 bits, 29,9 GB |
| Qwen3.8-27B | 27,8B | 256K | No disponible | No disponible | Modelo base; resultados inferiores en agentes y SWE según el autor |
| DaisyRose-27B-MLX-6bit | 27,8B | 256K | Apache 2.0 | MLX safetensors | 23,1 GB, 98,7 % de coincidencia con bf16, recomendado por el autor |
| DaisyRose-27B-MLX-4bit | 27,8B | 256K | Apache 2.0 | MLX safetensors | 16,3 GB, 95,8 % de coincidencia, para Macs de 24-32 GB |

## Limitaciones y advertencias

- Los benchmarks publicados corresponden a los pesos BF16/FP8 originales de RadixArk, no a esta cuantización de 8 bits; la fidelidad medida es alta (99,5 % de coincidencia en el siguiente token) pero no idéntica.
- El modo de pensamiento está activado por defecto y puede consumir muchos tokens; en problemas difíciles hay que reservar espacio suficiente para el razonamiento antes de la respuesta.
- Con decodificación especulativa MTP y decodificación greedy, el texto puede divergir ligeramente del decodificado plano en empates cercanos.
- El modelo está entrenado con RL exclusivamente sobre tareas de agente; puede mostrar sesgos hacia formatos de terminal, herramientas y código en consultas generales, aunque no se documentan sesgos específicos.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de calibración en la información disponible.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Esta build solo funciona con MLX en Apple Silicon; no es portable a CUDA sin reconversión.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base RadixArk/DaisyRose-27B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (19 de noviembre de 2026) sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 6 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
