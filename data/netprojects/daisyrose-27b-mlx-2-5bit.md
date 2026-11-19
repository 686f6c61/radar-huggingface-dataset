# netprojects/DaisyRose-27B-MLX-2.5bit

## Resumen

DaisyRose-27B-MLX-2.5bit es una cuantización de 2,5 bits del modelo RadixArk/DaisyRose-27B, publicada por el usuario netprojects para su ejecución en Apple Silicon mediante la librería MLX. DaisyRose-27B es, a su vez, una versión de Qwen3.8-27B afinada exclusivamente con aprendizaje por refuerzo (RL) sobre unas 1.200 tareas de agente de horizonte largo, sin supervisión ni destilación. El resultado conserva la arquitectura, el tokenizador, la plantilla de chat y la ventana de contexto de 256K del modelo base, y responde por defecto tras un bloque de razonamiento.

Esta variante concreta reduce el modelo a 11,8 GB (3,65 bits por peso de media) mediante cuantización afín con grupo de 64, aplicando 2 bits a las proyecciones gate y up del MLP, 3 bits a las proyecciones down, 4 bits a todas las proyecciones de atención y atención lineal (Gated DeltaNet) y 4 bits a los embeddings y a la capa de salida. Es una compilación solo de texto: se ha eliminado el codificador de visión del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27.700 millones de parámetros en Macs de 24 GB de memoria unificada, a costa de una fidelidad reducida frente a bf16 (87,6 % de coincidencia en el siguiente token, KL de 0,2138) y de la pérdida de capacidad de visión. Es la opción de menor huella de la familia de cuantizaciones publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención completa y atención lineal (Gated DeltaNet), capa MTP de predicción multi-token |
| Parametros totales | 27.745.371.136 (27,7 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (heredada de Qwen3.8-27B) |
| Tipos de cuantizacion | Cuantización afín MLX, grupo 64: 2 bits (gate y up del MLP), 3 bits (down del MLP), 4 bits (atención, atención lineal, embeddings y capa de salida); 3,65 bits por peso de media; capa MTP a 4 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX); repositorio de 11,8 GB |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B parte de Qwen3.8-27B y conserva su arquitectura íntegra: un transformer denso de 27,7 mil millones de parámetros que combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet, lo que reduce el coste de memoria del estado KV en contextos largos. Incorpora además una capa propia de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. El entrenamiento de DaisyRose consistió únicamente en RL sobre aproximadamente 1.200 tareas de agente de horizonte largo, sin ajuste supervisado ni destilación, manteniendo el tokenizador y la plantilla de chat originales.

La compilación aquí descrita no reentrena nada: convierte los pesos bf16 del modelo base (revisión `293a7a2`) a MLX y los cuantiza de forma afín con grupo de 64, verificando que cada tensor cuantizado es exactamente la cuantización del tensor bf16 correspondiente. La capa MTP se conserva cuantizada a 4 bits en `model-mtp.safetensors` y puede usarse como modelo borrador integrado pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp` en mlx-vlm; cada token propuesto se verifica con el modelo completo, de modo que con decodificación voraz el texto coincide con la decodificación normal salvo en empates cercanos.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto (el contenido previo a `</think>` es el razonamiento).
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`) y desactivación del pensamiento con `enable_thinking=False`.
- Llamada a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Capacidad de agente y razonamiento multi-paso, reforzada específicamente por el entrenamiento RL del modelo base sobre tareas de horizonte largo.
- Generación de código y resolución de problemas de software (el modelo base reporta resultados en Terminal Bench, DeepSWE y SWE Bench Pro).
- Razonamiento matemático y científico (GSM8K, GPQA Diamond en el modelo base).
- Decodificación especulativa mediante la capa MTP integrada.
- Sin capacidad de visión: esta compilación elimina el codificador de imagen del modelo original.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de terminal y automatización de tareas de sistema: el modelo base está entrenado con RL sobre tareas de agente de horizonte largo y reporta 75,5 en Terminal Bench 2.1, por lo que puede encadenar comandos, interpretar salidas y corregir errores en un bucle multi-paso dentro de la ventana de 256K tokens.
- Asistencia de programación en local sobre Mac: con 11,8 GB de pesos cabe en un Mac de 24 GB y permite autocompletado, refactorización y explicación de código sin conexión a servicios externos, con llamada a herramientas para consultar el sistema de archivos o ejecutar tests.
- Automatización de ingeniería de software en pipelines: el soporte de tool calling en formato OpenAI permite integrarlo en flujos que invocan herramientas externas (git, linters, ejecutores de tests) y verificar resultados de forma iterativa.
- Razonamiento matemático y verificación de cálculos: en las pruebas del autor con pensamiento desactivado y decodificación voraz obtiene 42 de 50 en GSM8K, adecuado para asistencia en problemas aritméticos y de divisores, con la salvedad de que conviene validar resultados críticos.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite resumir, extraer y consultar sobre expedientes extensos en un equipo de sobremesa, aunque el consumo de memoria crece con la longitud del contexto (13,8 GB de pico con una petición de 8K tokens).
- Servidor de inferencia personal compatible con OpenAI: `mlx_lm.server` expone una API con `tool_calls` en formato OpenAI, lo que facilita conectar editores, clientes de chat o scripts existentes a un modelo alojado en el propio Mac.
- Prototipado de agentes con decodificación acelerada: el uso de la capa MTP como borrador reduce la latencia en respuestas largas, útil en entornos de desarrollo donde se itera sobre prompts y plantillas de herramientas.

## Benchmarks y rendimiento

Resultados del modelo base publicados por RadixArk (pesos bf16/FP8 originales, no de esta cuantización):

| Benchmark | DaisyRose-27B | Qwen3.8-27B |
|---|---:|---:|
| Terminal Bench 4.1 | 12,0 | 5,6 |
| Terminal Bench 2.1 | 75,5 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 |
| SWE Bench Pro v2 | 94,7 | 91,3 |
| HLE (solo texto) | 34,3 | 33,9 |
| IFBench | 82,4 | 79,5 |
| GPQA Diamond | 90,7 | 89,2 |

Métricas de fidelidad de esta compilación frente al build bf16, medidas por el autor:

| Metrica | Valor |
|---|---|
| Coincidencia en el siguiente token con bf16 | 87,6 % |
| Divergencia KL frente a bf16 | 0,2138 |
| GSM8K, 50 preguntas (pensamiento off, voraz) | 42/50 |
| Memoria pico con prompt de 8K tokens | 13,8 GB |
| Tool calling | Pasa |
| Codificación | 2/3 |
| Pensamiento | 2/2 |
| Visión | Solo texto |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,8 GB de pico con un prompt de 8K tokens en mlx-lm; el repositorio ocupa 11,8 GB en disco.
- Mac recomendado por el autor: 24 GB o más de memoria unificada (el límite por defecto de memoria de GPU, aproximadamente dos tercios de la RAM hasta 36 GB y tres cuartos por encima, cubre ese pico). Contextos más largos requieren más memoria.
- En Macs de 24 GB puede ser necesario elevar el límite de memoria de GPU, por ejemplo `sudo sysctl iogpu.wired_limit_mb=27000` en un Mac de 32 GB, dejando varios GB para macOS y las aplicaciones.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; esta compilación es específica de Apple Silicon y MLX, y no se distribuye en formato GGUF ni compatible con CUDA.
- Despliegue: mlx-lm (versión 0.32.2 o superior) para texto y servidor compatible con OpenAI; mlx-vlm (0.7.11 o superior) para usar la capa MTP como modelo borrador.
- Latencia y throughput: no disponibles; el autor solo documenta el efecto cualitativo de aceleración de la decodificación especulativa con MTP, sin cifras.

## Comparativa con modelos similares

Comparación dentro de la familia de cuantizaciones publicada por el mismo autor sobre el mismo modelo base:

| Build | Tamano | Bits por peso | Coincidencia con bf16 | KL vs bf16 | GSM8K (50) | Memoria pico 8K | Mac recomendado | Vision |
|---|---:|---:|---:|---:|---:|---:|---|---|
| 8-bit | 29,9 GB | 8,63 | 99,5 % | 0,0004 | 45/50 | 29,7 GB | 48 GB+ | Si |
| 6-bit (recomendado) | 23,1 GB | 6,66 | 98,7 % | 0,0014 | 44/50 | 23,4 GB | 36 GB+ | Si |
| 4-bit | 16,3 GB | 4,70 | 95,8 % | 0,0207 | 45/50 | 17,1 GB | 32 GB+ | Si |
| 3-bit | 13,8 GB | 3,91 | 92,1 % | 0,0814 | 43/50 | 14,6 GB | 24 GB+ | Si |
| 2.5-bit (esta ficha) | 11,8 GB | 3,65 | 87,6 % | 0,2138 | 42/50 | 13,8 GB | 24 GB+ | No |
| bf16 | 55,6 GB | 16 | referencia | – | – | 53,4 GB | 96 GB+ | Si |

Frente a alternativas de otros autores en la misma categoría (modelos de unos 27B para agentes y código): no disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,5 bits degrada la fidelidad de forma notable: 87,6 % de coincidencia en el siguiente token y KL de 0,2138 frente a bf16, el peor valor de la familia. Puede producir respuestas distintas del modelo original en tareas sensibles.
- La codificación baja a 2 de 3 pruebas superadas en las comprobaciones del autor, frente a 3 de 3 en las compilaciones de 3 bits o más.
- Sin visión: el codificador de imagen se ha eliminado, por lo que no puede procesar entradas multimodales.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de pensamiento por defecto consume muchos tokens antes de responder y conviene reservar espacio suficiente en `max_tokens` en problemas difíciles.
- Idiomas soportados no documentados en esta compilación; no se puede confirmar el comportamiento multilingüe.
- Solo funciona en Apple Silicon con MLX; no hay pesos GGUF, no es compatible con CUDA ni con GPUs dedicadas, y no puede desplegarse en vLLM ni TGI.
- Con decodificación especulativa MTP y decodificación voraz, las respuestas largas pueden divergir ligeramente del texto que produciría la decodificación normal en empates cercanos.
- Elevar el límite de memoria de GPU mediante `sysctl` afecta a todo el sistema hasta el reinicio y puede provocar inestabilidad si se deja poco margen para macOS.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base RadixArk/DaisyRose-27B y de Qwen3.8-27B, así como las condiciones de uso de los datos de entrenamiento originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/DaisyRose-27B-MLX-2.5bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Build de 6 bits (recomendado): https://huggingface.co/netprojects/DaisyRose-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/DaisyRose-27B-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/DaisyRose-27B-MLX-bf16
