# infosave/Qwen3.8-Flash-Next-cmf

## Resumen

El modelo `infosave/Qwen3.8-Flash-Next-cmf` es una cuantización mixta del modelo base `Qwen/Qwen3.8-Flash-Next`, desarrollado por el usuario infosave. Este modelo base, creado por Alibaba Qwen, es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) ultra disperso con 125.000 millones de parámetros (más una tabla n-gram de 51.000 millones), de los cuales se activan aproximadamente 6.000 millones por token. La arquitectura combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), con 512 expertos en el MoE y un contexto de 262.144 tokens.

La versión cuantizada se distribuye como un único archivo CMF (memory-mapped) de 97,12 GB, que permite ejecutar el modelo en CPU, Vulkan, DX12 y Metal sin necesidad de Python, PyTorch o CUDA toolkit. El runtime cortiq incluye un forward dedicado (`qwen4_exp`) que implementa fielmente la arquitectura original, evitando aproximaciones genéricas. Esta conversión está orientada a la calidad: utiliza cuantización q4tp para las matrices enrutadas y compartidas del MoE, q8_2f para las proyecciones siempre activas y los bordes de vocabulario, y f16 para routers, normas y gates.

La relevancia actual radica en que permite ejecutar un modelo de 176.000 millones de parámetros en hardware con memoria limitada, gracias a la carga dispersa y al respaldo en memoria principal (mmap). Es una opción práctica para despliegues en producción donde se requiere contexto largo y razonamiento multilingüe sin depender de GPUs de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN + QSA, MoE de 512 expertos (top-10 + shared expert), PLE n-gram |
| Parametros totales | 125B + 51B (tabla n-gram) = 176B |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | q4tp, q8_2f, f16 (mixta) |
| Idiomas soportados | en, ru, zh |
| Licencia | qwen-community-1.0 |
| Formato de pesos | CMF (archivo único memory-mapped) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una evolución de Qwen4, con dos mecanismos de atención complementarios: 36 capas utilizan Gated DeltaNet (GDN), que comprime el historial de forma recurrente, y 12 capas emplean Qwen Sparse Attention (QSA), que permite recuperación precisa de contexto largo mediante un indexador de bloques con 4 cabezas de consulta y una clave compartida. El MoE cuenta con 512 expertos, de los cuales se seleccionan 10 por token más un experto compartido. Además, se incorpora una tabla n-gram (PLE) de 51.000 millones de parámetros para mejorar la predicción de tokens frecuentes, con una convolución dilatada y gates de raíz cuadrada con signo.

La conversión a CMF mantiene la estructura original, incluyendo el tokenizador, la plantilla de chat y los hashes por tensor. El proceso de cuantización es tensor-streaming y verifica la similitud coseno con el modelo BF16 original (0.99972 para GDN y 0.99781 para capas completas). No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y comprensión del lenguaje en inglés, ruso y chino.
- Razonamiento y resolución de problemas con contexto largo (hasta 262.144 tokens).
- Ejecución eficiente en CPU y GPU con memoria limitada gracias al diseño MoE disperso y al respaldo en memoria principal.
- Soporte de chat mediante servidor OpenAI-compatible (endpoints `/v1/chat/completions`, `/v1/completions` y `/v1/models`).
- Capacidad de procesar documentos extensos, conversaciones multi-turno y bases de código completas en una sola pasada.
- Compatibilidad multiplataforma: CPU (x86/ARM), Vulkan (NVIDIA/AMD/Intel), DX12 y Metal.

## Casos de uso

- Análisis de documentos legales o técnicos extensos: el contexto de 262.144 tokens permite procesar contratos, patentes o informes de cientos de páginas sin necesidad de fragmentación, extrayendo cláusulas relevantes o resumiendo secciones completas.
- Atención al cliente multilingüe: al soportar inglés, ruso y chino, puede gestionar conversaciones multi-turno en varios idiomas, manteniendo el historial completo gracias a la ventana de contexto amplia.
- Generación de informes y resúmenes: adecuado para producir resúmenes ejecutivos a partir de documentos largos, con capacidad de razonamiento sobre la información presentada.
- Asistencia en investigación: puede ayudar a revisar artículos científicos, extraer conclusiones y comparar resultados, utilizando el contexto largo para mantener referencias cruzadas.
- Traducción automática con preservación de contexto: al procesar párrafos largos de una vez, mejora la coherencia y la terminología en traducciones entre los idiomas soportados.
- Desarrollo de prototipos en entornos con recursos limitados: al poder ejecutarse en CPU o con VRAM reducida (por ejemplo, 12 GB), es viable para entornos de desarrollo sin GPUs dedicadas, permitiendo iterar sobre aplicaciones de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una velocidad de decodificación de 1.4–2.2 tokens por segundo en CPU con 128 vCPU, pero no se proporcionan métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no fija; el runtime utiliza mmap y un caché LRU para expertos, adaptándose al presupuesto de VRAM disponible. Se puede forzar un límite con `CMF_GPU_VRAM_MB` (por ejemplo, 12000 para 12 GB).
- GPU recomendadas: cualquier GPU con soporte Vulkan (NVIDIA, AMD, Intel) o Metal (Apple Silicon). No requiere CUDA ni toolkit específico.
- CPU: funciona en CPU sin GPU; con 128 vCPU alcanza 1.4–2.2 tok/s.
- Almacenamiento: el archivo CMF ocupa 97,12 GB en disco.
- Memoria RAM: para el contexto, se estiman unos 54 KiB por token (1,7 GiB a 32k tokens, 13,5 GiB a 262k tokens) más 112 MiB de estado recurrente GDN.
- Opciones de despliegue: `cortiq run` para inferencia interactiva y `cortiq serve` para servidor OpenAI-compatible. También se puede integrar en aplicaciones personalizadas mediante la librería cortiq.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada. El modelo es una cuantización del Qwen3.8-Flash-Next original, por lo que su rendimiento cualitativo debería ser similar al del modelo BF16, con una huella de memoria reducida. No hay información sobre alternativas como DeepSeek-V3 o Mixtral que permita una comparación objetiva.

## Limitaciones y advertencias

- Esta versión es exclusivamente de texto; el tower de visión del modelo base se ha omitido, por lo que no procesa imágenes.
- El predictor MTP (4B parámetros) no se incluye; es un head especulativo opcional y no afecta a las logits del tronco.
- El runtime requiere la versión experimental `qwen4_exp` de cortiq; versiones anteriores rechazarán el archivo en lugar de ejecutar una aproximación.
- El archivo es muy grande (97 GB) y necesita espacio de almacenamiento significativo.
- No se han documentado sesgos específicos ni riesgos de alucinación para esta cuantización, pero al ser un modelo de lenguaje, es susceptible a los mismos problemas que otros LLMs.
- La licencia qwen-community-1.0 puede tener restricciones de uso comercial; se recomienda revisar el texto completo de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/Qwen3.8-Flash-Next-cmf
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de QwenCloud para Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Receta de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Otra versión BF16 del modelo en HuggingFace: https://huggingface.co/FlagRelease/Qwen3.8-Flash-Next-BF16-zhenwu-FlagOS
