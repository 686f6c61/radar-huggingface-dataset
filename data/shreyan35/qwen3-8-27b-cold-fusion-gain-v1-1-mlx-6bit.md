# shreyan35/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit

## Resumen

Este repositorio contiene una conversión a formato MLX de 6 bits del modelo `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, un finetune del modelo Qwen3.8-27B de Alibaba (arquitectura transformer multimodal densa). El autor, Shreyan, publica esta versión cuantizada con el objetivo de ofrecer una implementación ultra eficiente que retiene más del 99,986 % del rendimiento del modelo original en BF16, según se afirma en la model card.

El modelo base fue desarrollado por DavidAU en colaboración con Nightmedia y TeichAI, empleando el método de entrenamiento COLD FUSION, que combina la técnica GAIN (ajuste dinámico del entrenamiento por muestra) con los sistemas de Unsloth. Este enfoque busca reducir drásticamente el número de tokens de razonamiento (entre 1/10 y 1/2 respecto al Qwen 3.8 estándar) sin sacrificar calidad, mejorando la velocidad de generación y manteniendo los benchmarks principales. El modelo soporta tres modos de razonamiento (xhigh, medium y low) y capacidades multimodales (imagen-texto).

La relevancia de esta versión MLX radica en su compatibilidad nativa con dispositivos Apple Silicon, permitiendo ejecutar un modelo de 27B en equipos de consumo con un rendimiento cercano al original. El repositorio incluye también referencias a cuantizaciones GGUF (regulares y MTP) del mismo modelo, aunque este repo concreto se centra en MLX 6-bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (basado en Qwen3.8-27B) |
| Parametros totales | 5.885.566.464 (según safetensors); el nombre del modelo indica 27B, discrepancia sin aclarar |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit MLX (este repo); el modelo base ofrece GGUF regulares y MTP (NEO IMATRIX) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal denso de Alibaba con capacidades de visión y texto. El finetune COLD FUSION emplea el método GAIN (General Adaptive Incremental Normalization, según la descripción del autor), que modifica dinámicamente los hiperparámetros de entrenamiento por muestra en tiempo real mientras el modelo aprende, acoplado a los sistemas de entrenamiento de Unsloth. Esto permite mejorar métricas y rendimiento sin "sobrecocinar" el modelo (overfitting).

El entrenamiento se realizó sobre los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/Reasoning-STRICT-Datasets`, ambos orientados a razonamiento estricto y generación controlada. No se especifican el número de tokens ni la composición exacta del dataset. El autor afirma que el modelo supera los benchmarks de Qwen 3.8, 3.6 y 3.5 en su versión 27B, y que la reducción del bloque de razonamiento se mantiene en los tres modos de operación (xhigh, medium, low). La conversión a MLX 6-bit se realizó posteriormente, preservando la estructura del modelo original sin corrupción.

## Capacidades

- Generación de texto y razonamiento con tres modos de esfuerzo: xhigh (por defecto), medium y low, configurables mediante la plantilla Jinja.
- Razonamiento multi-step con bloques de pensamiento reducidos (entre 1/10 y 1/2 del tamaño estándar de Qwen 3.8), lo que acelera la generación.
- Capacidades multimodales: procesamiento de imágenes y texto (pipeline `image-text-to-text`), útil para tareas de visión-lenguaje.
- Instrucción mejorada y seguimiento de órdenes complejas, con menor tendencia al sobre-pensamiento.
- Escritura creativa, ficción, narración y roleplaying, según los tags y la descripción.
- Generación de código y soporte para tareas de agente (agentic workflows), heredado del modelo base Qwen3.8-27B.
- Compresión de salida por defecto en muchos casos, manteniendo el detalle de la respuesta.
- Compatibilidad con cuantizaciones GGUF (regulares y MTP) en el modelo base, lo que permite despliegue en CPU/GPU convencionales.

## Casos de uso

- Asistentes de atención al cliente multilingüe: el modelo puede gestionar conversaciones en inglés y chino con razonamiento eficiente, reduciendo el coste de tokens gracias a sus bloques de pensamiento compactos. Su capacidad multimodal permite procesar capturas de pantalla o imágenes de productos.
- Generación de código en entornos de producción: con soporte para agentes y razonamiento multi-step, puede integrarse en pipelines CI/CD para autocompletar, revisar código o generar documentación técnica, con menor latencia que modelos de razonamiento extenso.
- Análisis de documentos con visión: al aceptar entradas de imagen, puede extraer información de gráficos, diagramas o documentos escaneados, combinando comprensión visual y textual en un solo modelo.
- Escritura creativa y roleplay: su entrenamiento específico en géneros narrativos y ficción lo hace adecuado para generar historias, diálogos o contenido literario con un equilibrio entre creatividad y concisión.
- Automatización de oficina: el modelo base Qwen3.8-27B está optimizado para tareas de ofimática (redacción de correos, resúmenes, generación de informes) y este finetune mantiene esas capacidades con un consumo de tokens reducido.
- Sistemas de razonamiento embebidos en aplicaciones móviles o de escritorio: gracias a la versión MLX 6-bit, puede ejecutarse en Macs con Apple Silicon sin necesidad de GPU dedicada, habilitando asistentes locales con razonamiento de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que el modelo "supera todos los benchmarks críticos de Qwen 3.8, 3.6 y 3.5 27B", pero no proporciona tablas ni cifras concretas. Tampoco se incluyen comparativas cuantitativas con otros modelos. Se recomienda consultar el repositorio del modelo base (`DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`) para posibles datos adicionales, aunque no se garantiza su disponibilidad.

## Requisitos de hardware

- Este repo contiene pesos en MLX 6-bit, pensados para ejecutarse en Apple Silicon (Macs con M-series). El tamaño del repositorio es de 21,9 GB, lo que equivale aproximadamente a 20,25 GB de pesos (27B × 6 bits / 8), más overhead de runtime.
- En un Mac con 32 GB de RAM unificado (por ejemplo, M1 Pro/Max o superior) el modelo debería cargar completo. Con 24 GB podría ser ajustado; se recomienda al menos 32 GB para margen.
- Para GPUs NVIDIA o AMD, se pueden usar las cuantizaciones GGUF del modelo base (regulares o MTP), que requieren VRAM similar: un GGUF Q4_K_M de 27B ocupa ~16 GB, Q5_K_M ~18 GB, Q6_K ~20 GB. Cabría en una RTX 3090/4090 (24 GB) o en configuraciones multi-GPU.
- Opciones de despliegue: MLX (Apple), llama.cpp, Ollama, vLLM (con conversión a otros formatos), TGI (con adaptadores). No se proporcionan datos de latencia o throughput específicos.
- Para tareas de visión, se necesita el preprocesador de imágenes correspondiente (no incluido en este repo, pero disponible en el modelo base).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, multimodal, sin finetune |
| Qwen3.6-27B (base) | 27B | No disponible | Apache 2.0 | safetensors, GGUF | Versión anterior de Qwen, también multimodal |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | 27B | No disponible | Apache 2.0 | safetensors, GGUF | Finetune COLD FUSION, base de este repo |
| Este repo (MLX 6-bit) | 27B (según nombre) | No disponible | Apache 2.0 | MLX safetensors | Conversión 6-bit del finetune anterior |

La comparativa se basa en las afirmaciones del autor: este finetune reduce el razonamiento y mejora la velocidad frente al Qwen 3.8 base, pero no se dispone de datos numéricos independientes para validarlo. La licencia Apache 2.0 permite uso comercial en todos los casos.

## Limitaciones y advertencias

- El número de parámetros reportado en safetensors (5,88B) contradice la denominación "27B" del modelo. Esta discrepancia no está aclarada por el autor; podría deberse a un error en el archivo o a una subdivisión de pesos. Se recomienda verificar antes de usar en producción.
- El modelo solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La modificación del razonamiento (reducción de tokens de pensamiento) puede afectar a tareas que requieren un análisis profundo; el autor advierte que se debe probar cuidadosamente para cada caso de uso.
- Al ser un finetune no oficial, pueden existir sesgos no documentados o comportamientos imprevistos en dominios específicos.
- No se proporcionan datos de benchmarks cuantitativos, por lo que las afirmaciones de rendimiento no están verificadas de forma independiente.
- La versión MLX 6-bit está pensada para Apple Silicon; para otros entornos se deben usar las cuantizaciones GGUF del modelo base, que no están incluidas en este repositorio.
- Aunque la licencia es Apache 2.0 (permite uso comercial), se debe atribuir correctamente la autoría y mantener los avisos de copyright.
- El modelo puede alucinar en contextos ambiguos o cuando se le pide información factual no presente en sus datos de entrenamiento.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/shreyan35/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit
- Modelo base (finetune COLD FUSION): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Modelo Qwen3.8-27B oficial de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Versión Unsloth de Qwen3.8-27B: https://huggingface.co/unsloth/Qwen3.8-27B
- Artículo sobre el lanzamiento de Qwen3.8-27B: https://cybernews.com/tech/qwen-38-27b-ai-model-debuts-with-million-downloads/
