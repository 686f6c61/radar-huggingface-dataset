# agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF

## Resumen

Este repositorio contiene dos ficheros GGUF del modelo Qwen3.8-Flash-Next en su variante "abliterated" publicada por huihui-ai, recodificados por agentionai con su formato Gyro. La abliteración (eliminación de la dirección de rechazo en los pesos) es trabajo de huihui-ai; agentionai se limita a cuantizar y a empaquetar el modelo para que quepa en una sola GPU. El resultado son dos ficheros: uno para tarjetas de 32 GB y otro para configuraciones de 48 GB (dos GPU de 24 GB o máquinas con 64 GB de memoria unificada).

El modelo base declara 176.943.899.520 parámetros (unos 176,9 B) y una arquitectura híbrida con atención completa, atención lineal y mezcla de expertos con expertos compartidos y enrutados, además de una cabeza MTP (multi-token prediction) que se usa como modelo borrador para decodificación especulativa. Es multimodal: el pipeline es image-text-to-text y se distribuye un proyector visual aparte (`mmproj-F16.gguf`). La ventana de contexto utilizada en todos los ejemplos de la model card es de 65.536 tokens.

La relevancia práctica es doble. Por un lado, demuestra que un modelo de ~177 B puede ejecutarse en una única GPU de 32 GB con cuantización trellis (tipos TQK6/TQK7 y TQ2_T), con una pérdida de fidelidad medida (divergencia KL de 0,397 frente al original en el fichero S y 0,295 en el M). Por otro, es un ejemplo de formato experimental: los ficheros no cargan en llama.cpp upstream y requieren Strata 0.2.0+, `halo-box/strix-llama.cpp` o el fork `agentionai/llama.cpp`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención completa + atención lineal, mezcla de expertos (MoE) con expertos compartidos y enrutados, y cabeza MTP para decodificación especulativa (según la model card) |
| Parámetros totales | 176.943.899.520 (~176,9 B), dato de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens en los ejemplos de la model card; máximo no disponible |
| Tipos de cuantización | GGUF con tipos trellis: TQK6/TQK7 en Gyro-S (sufijo de fichero `TQ1_0`) y TQ2_T en Gyro-M (sufijo `TQ2_0`); proyector visual en F16; borrador MTP en GGUF |
| Idiomas soportados | no disponible (la model card no los detalla) |
| Licencia | `qwen-community-1.0` (etiquetada como `license: other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (dos ficheros) + `mmproj-F16.gguf` + `mtp-Qwen3.8-Flash-Next-draft.gguf` |
| Tamaño del repositorio | 307,2 GB |
| Modelo base | huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated (relación: quantized) |
| Fecha de creación / actualización | 2026-10-01 / 2026-10-19 |
| Descargas / likes en HuggingFace | 28.491 / 16 |

## Arquitectura y entrenamiento

La model card describe el modelo como una pila híbrida en la que conviven capas de atención completa y capas de atención lineal, con una mezcla de expertos que distingue expertos compartidos y expertos enrutados. La abliteración de huihui-ai modifica 144 de los 1.224 tensores de pesos: concretamente los que escriben en el flujo residual (salidas de atención y de atención lineal, y las proyecciones *down* de los expertos compartidos y enrutados). El resto de tensores es idéntico byte a byte a los ficheros Gyro originales. La cabeza MTP se distribuye como fichero aparte y se emplea como modelo borrador en decodificación especulativa.

No se publican en la información disponible datos de entrenamiento (número de tokens, composición del corpus, si hubo RLHF/DPO) del modelo base Qwen3.8-Flash-Next, más allá de que la variante aquí distribuida solo añade la abliteración y la cuantización posteriores. La codificación GGUF la realiza el propio agentionai con un *encoder* que no ha publicado; la model card indica que los ficheros se actualizaron el 2026-10-13 con mejores pesos manteniendo nombres, tamaños y tipos de tensor.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`), con 65.536 tokens de contexto en la configuración de referencia.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y se acompaña de un proyector visual `mmproj-F16.gguf`.
- Generación de código de alta fidelidad respecto al original: 94,3 % de coincidencia top-1 en código para el fichero S y 95,5 % para el M.
- Decodificación especulativa mediante borrador MTP, con un 81 % de tokens propuestos aceptados en una primera prueba sobre un *prompt* de código.
- Comportamiento sin rechazos en la mayoría de peticiones (abliteración), pensado para entornos controlados.
- Servidor con plantilla de chat Jinja (`--jinja`) y etiqueta `endpoints_compatible` en el Hub; permite exponer una API HTTP local desde el contenedor incluido.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Razonamiento multi-paso o modo *thinking*: no documentado en la información disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- **Asistente de código en estación de trabajo con una GPU de 32 GB**: el fichero Gyro-S ocupa 27,64 GiB de pesos y 28,8 GiB con 64k de contexto, y con el borrador MTP acepta el 81 % de los tokens propuestos en código. Sirve para autocompletado y refactorización sin enviar el código a un servicio externo.
- **Extracción de información de documentos con visión**: usando `mmproj-F16.gguf`, el modelo procesa capturas, facturas o planos y devuelve texto estructurado; los 65.536 tokens de contexto permiten incluir varias páginas en una sola petición.
- **Investigación en seguridad y *red teaming***: al eliminar la dirección de rechazo, es útil para estudiar comportamientos límite y calibrar clasificadores de contenido; debe ejecutarse en un entorno aislado y con registro de interacciones.
- **Generación de datos sintéticos técnicos**: la divergencia KL de 0,111 en código (fichero S) y 0,066 (fichero M) frente al modelo original indica que la distribución generada se mantiene próxima, lo que permite crear corpus de código y texto técnico a escala local.
- **Despliegue en hardware AMD con memoria unificada**: en un Strix Halo (Radeon 8060S, 64 GB) el fichero Gyro-S decodifica a 31,7 tok/s con `llama-bench` y a 36,1 tok/s con `strix-llama.cpp` en Vulkan, suficiente para asistentes internos de documentación.
- **Atención al cliente interna con supervisión humana**: la ventana de 64k permite arrastrar historial e documentación de producto en conversaciones largas; dado el carácter *uncensored*, requiere revisión humana antes de publicar respuestas.
- **Prototipado de agentes con API local**: el contenedor `agention-llama:server` expone los pesos por HTTP con plantilla Jinja, lo que facilita integrarlos en un pipeline de agentes que ya consuma una API compatible con OpenAI.
- **Banco de pruebas de cuantización**: los pares S/M con métricas KLD y top-1 publicadas permiten evaluar el compromiso entre memoria y calidad antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de fidelidad frente al modelo original (Qwen3.8-Flash-Next sin abliterar), e incluyen tanto el efecto de la cuantización como el de la abliteración:

| Fichero | Pesos en GPU | KLD vs original | Top-1 vs original | KLD en código | Top-1 en código |
|---|---:|---:|---:|---:|---:|
| Gyro-S abliterated | 27,64 GiB | 0,397 | 75,3 % | 0,111 | 94,3 % |
| Gyro-M abliterated | 34,98 GiB | 0,295 | 78,6 % | 0,066 | 95,5 % |

Referencia de los ficheros Gyro sin abliterar: KLD 0,401 (S) y 0,291 (M), por lo que la abliteración añade menos de 0,005 de divergencia KL.

Rendimiento medido (`llama-bench`, batch 1, sin *drafting*):

| Configuración | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| Gyro-S en AMD Radeon AI PRO R9700 32 GB | 1.246 | 57,8 |
| Gyro-S en AMD Strix Halo (Radeon 8060S) | no disponible | 31,7 |
| Gyro-M en AMD Strix Halo | no disponible | 26,4 |
| Gyro-S con strix-llama.cpp master (Vulkan, Strix Halo) | 700 | 36,1 |
| Gyro-M con strix-llama.cpp master (Vulkan, Strix Halo) | 738 | 30,1 |

## Requisitos de hardware

- **VRAM para Gyro-S**: 27,64 GiB de pesos y 28,8 GiB con contexto de 64k; encaja en tarjetas de 32 GB.
- **VRAM para Gyro-M**: 34,98 GiB de pesos y aproximadamente 37 GiB con 64k; requiere 48 GB (por ejemplo, 2×24 GB) o una máquina con 64 GB de memoria unificada.
- **GPU recomendadas**: AMD Radeon AI PRO R9700 32 GB (medición oficial), AMD Strix Halo / Radeon 8060S con memoria unificada, y GPUs NVIDIA a través de Strata 0.2.0+ o del fork `agentionai/llama.cpp` con CUDA. Series AMD RX 7000, RX 9000 y R9700 soportadas por Strata.
- **GPU de consumo**: con 64k de contexto, el fichero S no cabe en tarjetas de 24 GB según los datos publicados; el M necesita dos de 24 GB. No se documentan configuraciones para 16 GB.
- **Motores de despliegue**: `agentionai/llama.cpp` (CPU, Vulkan, CUDA), Strata 0.2.0 o superior, `halo-box/strix-llama.cpp` master (Strix Halo; CPU, Vulkan, HIP) y el contenedor `agentionai/agention-llama:server`. llama.cpp upstream no puede cargar estos ficheros todavía; vLLM, TGI y Ollama no se mencionan.
- **Parámetros de ejecución de referencia**: `-ngl 999 -fa on --jinja --ngram-on-disk -c 65536 -ctk q8_0 -ctv q8_0 --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.05`.
- **Latencia y throughput**: ver tabla de la sección anterior; la decodificación especulativa con el borrador MTP no está incluida en esas cifras.
- **Almacenamiento**: el repositorio completo ocupa 307,2 GB; conviene descargar solo el fichero y los auxiliares necesarios (`hf download ... <fichero> mtp-... mmproj-F16.gguf`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos / memoria | KLD vs original | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Gyro-S abliterated (este repo) | ~176,9 B | 65.536 tokens (config. de referencia) | 27,64 GiB / 28,8 GiB a 64k | 0,397 (0,111 en código) | qwen-community-1.0 | GGUF, motores no upstream |
| Gyro-M abliterated (este repo) | ~176,9 B | 65.536 tokens (config. de referencia) | 34,98 GiB / ~37 GiB a 64k | 0,295 (0,066 en código) | qwen-community-1.0 | GGUF, motores no upstream |
| Gyro-S / Gyro-M sin abliterar (agentionai) | ~176,9 B | 65.536 tokens (config. de referencia) | mismos tipos y tamaños | 0,401 / 0,291 | qwen-community-1.0 | GGUF, motores no upstream |
| Huihui-Qwen3.8-Flash-Next-abliterated (huihui-ai) | ~176,9 B | no disponible | safetensors, no apto para 32 GB en una GPU | referencia de la abliteración | qwen-community-1.0 | safetensors en el Hub |

No se dispone de datos de benchmarks ni de especificaciones de contexto de otros modelos de la misma categoría en la información proporcionada, por lo que no se incluye una comparación con alternativas de terceros.

## Limitaciones y advertencias

- **Contenido dañino**: la abliteración elimina la mayor parte de los rechazos; la model card advierte explícitamente de que el modelo puede producir contenido dañino, ofensivo o inapropiado y no es apto para uso público ni sin supervisión.
- **Responsabilidad legal**: el usuario es responsable del uso y del cumplimiento normativo en su jurisdicción; la licencia `qwen-community-1.0` impone condiciones adicionales que deben revisarse antes de un uso comercial.
- **Formato experimental**: los tipos trellis (TQK6/TQK7, TQ2_T) y los *kernels* asociados pueden cambiar; no hay compromiso de estabilidad.
- **Compatibilidad limitada**: no carga en llama.cpp upstream. Solo funciona en Strata 0.2.0+, `strix-llama.cpp` master y `agentionai/llama.cpp`. vLLM, TGI y Ollama no están soportados según la información disponible.
- **Pérdida de fidelidad por cuantización**: KLD de 0,397 y 75,3 % de top-1 en el fichero S frente al original; degradación mayor que en el M (0,295 / 78,6 %). En código la pérdida es mucho menor (94,3 % y 95,5 % de top-1).
- **Alucinación**: no se publican evaluaciones de veracidad ni de tasa de alucinación; al ser un modelo de ~177 B cuantizado a tipos de 1-2 bits por bloque, el riesgo en dominios factuales no está caracterizado.
- **Idiomas**: la model card no especifica la lista de idiomas soportados; no se puede asumir un rendimiento homogéneo fuera del inglés sin evaluación propia.
- **Herramientas y agentes**: no se documenta soporte de tool calling, function calling ni razonamiento multi-paso, por lo que no deben asumirse en producción.
- **Sesgos**: no se publican análisis de sesgo; al derivar de un modelo abliterado, la supresión de la dirección de rechazo puede alterar también respuestas ante peticiones sensibles legítimas (médicas, legales).
- **Sin datos de entrenamiento**: no se detalla el corpus, el número de tokens ni el proceso de alineamiento, lo que dificulta evaluar riesgos de contaminación de benchmarks.
- **Hardware**: la ventana de 64k exige 32 GB o 48 GB de VRAM/unified memory; no hay configuración publicada para GPUs de consumo de 24 GB o menos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Modelo base abliterado (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Ficha de los ficheros Gyro originales (instrucciones de NVIDIA, visión, decodificación especulativa y memoria por contexto): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Motor Strata: https://github.com/Niko1221/Strata
- Fork para AMD Strix Halo: https://github.com/halo-box/strix-llama.cpp
- Fork de llama.cpp de agentionai (CPU, Vulkan, CUDA): https://gitlab.com/agentionai-group/llama.cpp
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las únicas coincidencias devueltas corresponden a sitios de estadísticas de videojuegos y no se incluyen.
