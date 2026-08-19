# leoncca/Qwen3.8-27B-Huihui-Mixed-FP8

## Resumen

El modelo `leoncca/Qwen3.8-27B-Huihui-Mixed-FP8` es una cuantización mixta de precisión E4M3 FP8 con bloques de 128×128, derivada del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión sin censura (abliterated) del modelo Qwen3.8-27B de Alibaba. El autor, leoncca, ha diseñado esta conversión específicamente para ejecutar el modelo en GPUs NVIDIA Tesla V100 de 32 GB (arquitectura SM70), que no soportan FP8 nativo, mediante el runtime 1Cat-vLLM. El resultado es un checkpoint de 27.781 millones de parámetros con una ventana de contexto de 262.144 tokens, capacidades multimodales (texto e imagen) y una rama de predicción multi-token (MTP) preservada en BF16.

La relevancia de esta publicación radica en que permite desplegar un modelo de última generación de 27B multimodal en hardware de generaciones anteriores, algo que normalmente requeriría GPUs con soporte FP8 (H100, etc.). La cuantización mantiene una fidelidad muy alta respecto al modelo BF16 original: en la validación del autor, la diferencia media absoluta de log-probabilidad sobre 5.046 tokens seleccionados es de 0,004285, y los resultados en pruebas de recuperación de aguja a 246K tokens son idénticos. No es un checkpoint oficial de Qwen ni de Huihui, sino una contribución comunitaria con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B), con atención full-attention y capas híbridas GDN/SSM, rama MTP |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 mixto E4M3 block-128 (336 GEMMs en FP8, resto en BF16), compatible con FP16 compute y FP16 KV cache |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (32,9 GB en el repositorio) |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una cuantización de precisión mixta del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión sin censura del Qwen3.8-27B original. La arquitectura subyacente es un transformer denso de 27B parámetros con una torre de visión (vision tower), una ventana de contexto nativa de 262K tokens, y una rama de predicción multi-token (MTP) que acelera la decodificación. El modelo base también incorpora capas híbridas GDN/SSM (según se desprende de los argumentos `--mamba-cache-mode align` y la mención a parámetros "state-sensitive GDN/SSM" en la model card), lo que lo sitúa en la línea de arquitecturas que combinan atención con mecanismos de espacio de estado.

La cuantización mixta sigue una política de precisión cuidadosa: 336 pesos de GEMM del LLM se convierten a FP8 E4M3 con bloques de 128×128 y activación dinámica, mientras que 863 tensores importantes (que suman 10.264.372.704 bytes) permanecen bit-idénticos al BF16 de origen. Entre estos se incluyen la torre de visión completa (333 tensores), la rama MTP (15 tensores), los Q/K/V/O de las 16 capas de atención completa, embeddings, LM head, normas, biases y los parámetros GDN/SSM. El runtime validado utiliza FP16 para el cómputo y FP16 para la caché KV, descartando deliberadamente FP8 KV para priorizar la calidad en contexto largo. No se realizó ningún entrenamiento adicional; es una conversión de precisión con verificación exhaustiva.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés, chino y otros), con soporte de razonamiento configurable (modo pensamiento).
- Comprensión de imágenes (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Generación de código y ejecución funcional: validado con HumanEval y MBPP (9/10 en ejecución funcional).
- Razonamiento matemático: validado con GSM8K (28/32 en subconjunto fijo).
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y parser `qwen3_coder`.
- Capacidades de agente y razonamiento multi-paso (tareas de horizonte largo).
- Predicción multi-token (MTP) preservada en BF16, aunque solo se valida el perfil MTP0.
- Recuperación de información en contexto largo: recuperación de aguja perfecta hasta 246K tokens.
- Modelo abliterated (sin censura) según su origen, aunque la validación proxy mostró rechazo en categorías de prueba.

## Casos de uso

- Despliegue de un asistente multimodal en infraestructura legacy: permite ejecutar Qwen3.8-27B en clústeres de V100 32 GB (SM70) que de otro modo no podrían usar FP8, aprovechando la ventana de 262K tokens para análisis de documentos extensos con imágenes.
- Atención al cliente automatizada multilingüe: con 262K tokens de contexto puede gestionar conversaciones multi-turno largas y mantener el historial completo, además de procesar capturas de pantalla o imágenes enviadas por el usuario.
- Generación de código en producción: su soporte de tool calling y la validación en HumanEval/MBPP lo hacen adecuado para integrarse en pipelines de CI/CD que generan o revisan código, aunque requiere una infraestructura multi-GPU.
- Análisis de contratos y documentos legales largos: la ventana de 262K tokens permite procesar documentos completos de cientos de páginas en una sola pasada, incluyendo páginas escaneadas gracias a la entrada de imágenes.
- Agentes autónomos de investigación: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que navegan por bases de conocimiento, ejecutan consultas y sintetizan resultados en tareas de larga duración.
- Prototipado de aplicaciones de visión-lenguaje en entornos académicos con GPUs V100: ideal para laboratorios que no disponen de hardware moderno pero necesitan experimentar con modelos de 27B multimodales.
- Generación de contenido creativo sin restricciones: al ser una versión abliterated, puede usarse para escritura creativa o narrativa en temas que los modelos censurados evitan, siempre bajo responsabilidad del usuario.

## Benchmarks y rendimiento

La model card incluye una tabla de validación comparativa entre el checkpoint BF16 original y esta versión mixta FP8, realizada en 4× V100 32 GB con TP4 y ventana de 262.144 tokens:

| Evaluacion | BF16 source | Mixed FP8 |
| --- | ---: | ---: |
| Core text, JSON, tool y real-image checks | 10/10 | 10/10 |
| Needle retrieval a 8K, 64K, 128K, 246K | 4/4 | 4/4 |
| GSM8K (subconjunto fijo de 32 ejemplos) | 28/32 | 28/32 |
| HumanEval + MBPP (ejecución funcional) | 9/10 | 9/10 |
| IFEval strict/loose prompts | 3/5 | 3/5 |
| IFEval strict/loose instructions | 8/12 | 9/12 |

Además, el conjunto público de 47 ejemplos obtuvo 35/47 respuestas exactas sin cambios de corrección. La diferencia media absoluta de log-probabilidad sobre 5.046 tokens seleccionados con prefijo compartido fue de 0,004285 (mediana 0,000008). En el mismo run secuencial acotado, el tiempo total de solicitud fue de 232,30 s para BF16 y 171,66 s para FP8 mixto; sin embargo, en tareas dominadas por prefill largo la versión FP8 fue entre 1,7% y 2,4% más lenta. Estos son datos de validación del autor, no benchmarks públicos estandarizados del modelo original.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 32,9 GB en disco, pero con FP16 compute y FP16 KV cache la VRAM necesaria en inferencia supera los 32 GB por GPU. La configuración validada usa 4× V100 32 GB (128 GB totales) con `--gpu-memory-utilization 0.92`.
- GPU recomendadas: 4× NVIDIA Tesla V100-PCIE-32GB (SM70) es el objetivo de diseño. También debería funcionar en GPUs más modernas con suficiente VRAM (por ejemplo, A100 80 GB, H100), aunque no está validado en ellas.
- En GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Se necesitaría al menos una GPU con 48 GB o más, y aun así no se garantiza el rendimiento.
- Opciones de despliegue: 1Cat-vLLM (recomendado, con argumentos específicos documentados en la model card). También es compatible con transformers, pero la validación de producción se realizó exclusivamente con 1Cat-vLLM.
- Latencia y throughput: en el run de validación de 47 ejemplos secuenciales, el tiempo total fue de 171,66 s para FP8 mixto (frente a 232,30 s en BF16). No se proporcionan métricas de throughput general.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | 262.144 | BF16 | Apache-2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,8 B | 262.144 | BF16 | Apache-2.0 | HuggingFace |
| leoncca/Qwen3.8-27B-Huihui-Mixed-FP8 | 27,8 B | 262.144 | FP8 mixto + BF16 | Apache-2.0 | HuggingFace |
| huihui-ai/Qwen3-8B-abliterated | 8 B | 32.768 (típico) | BF16 | Apache-2.0 | HuggingFace |

La principal diferencia entre el modelo base y esta cuantización es la compatibilidad con hardware V100: el BF16 original no puede ejecutarse eficientemente en SM70, mientras que esta versión mixta está específicamente validada para ese entorno. Frente a modelos más pequeños como Qwen3-8B, ofrece mayor capacidad y contexto, a costa de requerir mucho más hardware.

## Limitaciones y advertencias

- Es una cuantización comunitaria, no un checkpoint oficial de Qwen ni de Huihui; el autor declara explícitamente que se proporciona "as-is" sin garantía.
- El modelo hereda los riesgos del checkpoint abliterated: puede producir contenido inexacto, inseguro, ilegal o dañino. La prueba proxy ALLOW/REFUSE mostró rechazo en las seis categorías evaluadas, pero no establece una tasa de rechazo universal ni un perfil de seguridad.
- La validación se realizó únicamente en 4× V100 32 GB con 1Cat-vLLM; otros entornos (vLLM estándar, TGI, etc.) no están verificados y podrían presentar fallos silenciosos.
- El perfil MTP4 no está aceptado en este checkpoint; solo se recomienda MTP0. La caché KV se mantiene en FP16, por lo que el ahorro de memoria frente al BF16 es limitado.
- Requiere un mínimo de 4 GPUs con 32 GB de VRAM cada una para la configuración validada, lo que excluye la mayoría de estaciones de trabajo individuales.
- Los benchmarks publicados son de validación interna del autor, no resultados de evaluaciones estándar independientes (MMLU, etc.).
- La fecha de creación del repositorio (2026-08-18) es posterior a la información pública disponible sobre Qwen3.8, por lo que algunos datos de la arquitectura (como las capas GDN/SSM) provienen de la model card y no de documentación oficial.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/leoncca/Qwen3.8-27B-Huihui-Mixed-FP8
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime 1Cat-vLLM: https://github.com/1CatAI/1Cat-vLLM
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo con especificaciones y requisitos de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
