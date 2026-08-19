# AzatAI/Qwen3.8-27B-FP8-dynamic

## Resumen

Qwen3.8-27B-FP8-dynamic es una cuantización en FP8 dinámico del modelo Qwen/Qwen3.8-27B, publicada por AzatAI como una release comunitaria. El objetivo principal es permitir el despliegue eficiente en GPUs de arquitectura Ada (SM 8.9, como RTX 4090, L40S o RTX 6000 Ada), donde el formato FP8 block-128 utilizado en la versión oficial de Qwen no dispone de kernels CUTLASS optimizados y cae a implementaciones Triton más lentas. Al usar escalas per-channel para pesos y per-token dinámicas para activaciones, este checkpoint aprovecha el kernel `CutlassFP8ScaledMMLinearKernel` en Ada, Hopper y Blackwell.

El modelo base es un transformer multimodal de la serie Qwen3.5 con atención híbrida: combina capas de atención completa con capas de atención lineal Gated DeltaNet, e incorpora un codificador de visión, por lo que el pipeline es `image-text-to-text`. Tiene aproximadamente 27.800 millones de parámetros y un tamaño en disco de unos 37 GB. La cuantización se realizó con LLM Compressor 0.13.0 sin necesidad de datos de calibración, y se conservan en BF16 las proyecciones de Gated DeltaNet, el codificador visual, embeddings, `lm_head` y la cabeza MTP (Multi-Token Prediction) para mantener la decodificación especulativa.

La relevancia de este modelo radica en que ofrece una alternativa práctica para ejecutar un LLM de 27B con capacidades multimodales, razonamiento (thinking mode), tool calling y generación de código en hardware de gama media-alta, con un rendimiento medido de hasta 103 tokens por segundo en tareas de código bajo decodificación especulativa en 2x RTX 6000 Ada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer híbrido: full attention + Gated DeltaNet linear attention, vision encoder, MTP head) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probado con prompts de 36k tokens) |
| Tipos de cuantizacion | FP8 dinámico (E4M3) per-channel para pesos, per-token para activaciones; capas seleccionadas en BF16 |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una cuantización del modelo base Qwen/Qwen3.8-27B. La arquitectura subyacente corresponde a la serie Qwen3.5: un transformer con atención híbrida donde una parte de las capas usa atención completa (full attention) y otra parte usa Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en secuencias largas. Además, el modelo incluye un codificador de visión (por eso el pipeline es `image-text-to-text`) y una cabeza MTP que permite decodificación especulativa de múltiples tokens.

La cuantización se realizó con LLM Compressor 0.13.0 mediante el modificador `QuantizationModifier` con esquema `FP8_DYNAMIC`. Se cuantizaron únicamente los módulos `Linear` dentro de los bloques transformer, con escalas per-channel para los pesos y escalas per-token dinámicas para las activaciones. Se excluyeron explícitamente de la cuantización las proyecciones de `linear_attn` (Gated DeltaNet), el codificador visual, `embed_tokens`, `lm_head`, las puertas de los MLP (`mlp.gate` y `shared_expert_gate`) y la cabeza MTP, que se mantienen en BF16. Este esquema no requiere datos de calibración, lo que simplifica el proceso de creación.

El proceso de cuantización se ejecutó en CPU, con aproximadamente 250 GB de RAM para manejar los 55,6 GB del modelo original en BF16. La cabeza MTP se copió sin cambios desde el checkpoint base, lo que permite que vLLM la utilice como drafter para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento complejo con modo "thinking" activable por petición (desactivado por defecto en el despliegue recomendado).
- Generación de código y soporte de tool calling / function calling mediante el parser `qwen3_coder`.
- Capacidades multimodales: acepta entradas de imagen y texto (pipeline `image-text-to-text`), aunque la cuantización no afecta al codificador visual.
- Decodificación especulativa con MTP (Multi-Token Prediction) integrada, que acelera la generación sin necesidad de un drafter externo.
- Soporte de agentes y multi-step reasoning gracias a la combinación de tool calling y modo thinking.
- Capacidades multilingües heredadas del modelo base, aunque no se ha publicado una lista oficial de idiomas para este checkpoint.
- Compatibilidad con vLLM para despliegue en producción, incluyendo prefix caching y tensor parallelism.

## Casos de uso

- Asistente de código en entornos de desarrollo: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y completar código. Su soporte de tool calling permite conectarlo a ejecutores de pruebas o repositorios, y la decodificación especulativa con MTP reduce la latencia en tareas de autocompletado (medido a 103 tok/s en una tarea de pytest con 2x RTX 6000 Ada).
- Atención al cliente automatizada con contexto largo: gracias a la ventana de contexto amplia (probada con prompts de 36k tokens) y al modo thinking, puede gestionar conversaciones multi-turno complejas, manteniendo el historial y razonando sobre la intención del usuario. El despliegue con vLLM y prefix caching permite reutilizar el procesamiento de mensajes previos.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto, extrayendo información y respondiendo preguntas sobre el contenido visual. Esto es útil en sectores como legal, médico o técnico.
- Agente autónomo para automatización de tareas: con el parser de tool calling `qwen3_coder` y el modo thinking, el modelo puede planificar y ejecutar secuencias de acciones (llamadas a APIs, consultas a bases de datos, generación de informes) de forma autónoma, manteniendo el estado a lo largo de múltiples pasos.
- Inferencia en producción con GPUs de gama media: el formato FP8 per-channel permite ejecutar el modelo en GPUs Ada como RTX 4090 o L40S, que no soportan eficientemente el FP8 block-128. Esto reduce el coste de hardware frente a la necesidad de GPUs Hopper o Blackwell, manteniendo un rendimiento competitivo.
- Investigación y prototipado de sistemas multimodales: al ser una cuantización de un modelo abierto con licencia Apache-2.0, es adecuado para experimentar con razonamiento visual, generación de código y agentes en entornos académicos o de I+D, sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se ha ejecutado ninguna suite de evaluación sobre este checkpoint. Se menciona que RedHatAI reporta puntuaciones casi idénticas para la misma receta de cuantización en el modelo hermano Qwen3.6-35B-A3B, pero esto se presenta como una indicación, no como una medición de este modelo concreto.

Sí se proporcionan mediciones de rendimiento de inferencia en 2x RTX 6000 Ada (SM 8.9) con vLLM 0.19.0 y tensor parallelism 2:

| Metrica | Sin MTP | Con MTP k=3 |
|---|---|---|
| Decodificación, prosa | 38,7 tok/s | 63,3 tok/s |
| Decodificación, código (tarea pytest) | - | 103 tok/s |
| Decodificación, chat muestreado (temp. 0,7) | - | 50-71 tok/s |
| Prompt de 36k tokens, tiempo hasta 16 tokens de salida, sin caché | 10,2 s | 9,6 s (chunk 32768) |
| Mismo prompt, con prefix caching | 0,7 s | 0,6 s |
| Memoria GPU por tarjeta a 0,9 de utilización | 45,4 GB | 45,4 GB |
| KV cache libre por tarjeta al inicio | 23,9 GiB | 20,9 GiB |

La tasa de aceptación de MTP es de 2,56 tokens por paso en prosa (0,75 / 0,49 / 0,33 por posición) y 3,6 en código.

## Requisitos de hardware

- VRAM estimada: las mediciones con contexto largo (36k tokens) y alta utilización alcanzan 45,4 GB por GPU en configuración TP=2. Los pesos ocupan aproximadamente 18,4 GB por GPU en esa configuración, por lo que con contextos más cortos o menor batch podría caber en GPUs de 24 GB, aunque no se ha verificado.
- GPUs recomendadas: cualquier GPU con soporte FP8 y SM 8.9 o superior. Se ha validado en 2x RTX 6000 Ada (48 GB). También es compatible con Hopper (H100) y Blackwell (B200) mediante los kernels CUTLASS o DeepGEMM.
- GPUs consumer: sí, es posible ejecutarlo en RTX 4090 (24 GB) en configuración TP=2 o con cuantización adicional, aunque no se han publicado mediciones específicas. En Ada, el kernel `CutlassFP8ScaledMMLinearKernel` está disponible con CUDA >= 12.4.
- Opciones de despliegue: vLLM (>= 0.17.0) es la opción recomendada, con soporte para tensor parallelism, prefix caching, decodificación especulativa MTP y tool calling. También puede usarse con transformers para inferencia básica, aunque sin las optimizaciones de vLLM.
- Latencia y throughput: en 2x RTX 6000 Ada, se midieron 38,7 tok/s en prosa sin MTP y 63,3 tok/s con MTP; en código, 103 tok/s con MTP. El tiempo de procesamiento de un prompt de 36k tokens hasta la primera salida es de 10,2 s sin caché y 0,7 s con prefix caching.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Compatibilidad Ada | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,8B | BF16 | no disponible | no (requiere mucha VRAM) | Apache-2.0 | Modelo original, 55,6 GB en disco |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 27,8B | FP8 block-128 | no disponible | limitada (fallback a Triton) | Apache-2.0 | Release oficial de Qwen |
| AzatAI/Qwen3.8-27B-FP8-dynamic | 27,8B | FP8 per-channel dinámico | no disponible | sí (CUTLASS FP8 GEMM) | Apache-2.0 | Cuantización comunitaria, incluye MTP |

La principal diferencia frente al FP8 oficial es la compatibilidad con GPUs Ada: el formato per-channel permite usar kernels CUTLASS optimizados en SM 8.9, mientras que el block-128 requiere Hopper o Blackwell para un rendimiento óptimo. Además, este checkpoint conserva la cabeza MTP, lo que habilita la decodificación especulativa sin configuración adicional.

## Limitaciones y advertencias

- Es una cuantización de comunidad, no una release oficial de Qwen. No se ha ejecutado ninguna suite de evaluación sobre este checkpoint, por lo que se desconoce el impacto exacto en la calidad de las respuestas.
- La longitud de contexto máxima no está especificada. Aunque se probó con prompts de 36k tokens, no se garantiza que el modelo soporte contextos mayores sin degradación.
- Los idiomas soportados no están documentados para esta cuantización. Se asume que hereda las capacidades multilingües del modelo base, pero no hay confirmación.
- El modo thinking está activado por defecto en la plantilla de chat; si no se desea, hay que desactivarlo explícitamente en el despliegue. Esto puede afectar a la latencia y al formato de las respuestas.
- La decodificación especulativa con MTP requiere vLLM >= 0.17.0 y, según la documentación, vLLM ignora `min_p` y `logit_bias` cuando está activa.
- Al ser una cuantización FP8, puede haber una ligera pérdida de precisión en comparación con el modelo en BF16, especialmente en tareas numéricas o de razonamiento complejo.
- El despliegue en GPUs consumer (24 GB) no está verificado; las mediciones se realizaron con 2x RTX 6000 Ada de 48 GB. Es posible que se necesite reducir el contexto o el batch para evitar desbordamiento de memoria.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las herramientas utilizadas (LLM Compressor, vLLM).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AzatAI/Qwen3.8-27B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
- DOI asociado: doi:10.57967/hf/9989
