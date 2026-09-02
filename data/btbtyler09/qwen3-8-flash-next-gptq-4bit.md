# btbtyler09/Qwen3.8-Flash-Next-GPTQ-4bit

## Resumen

Qwen3.8-Flash-Next-GPTQ-4bit es una cuantización GPTQ de 4 bits (W4, group size 32) del modelo Qwen/Qwen3.8-Flash-Next, la primera versión pública de la arquitectura Qwen4 desarrollada por Alibaba Qwen. Se trata de un modelo multimodal de tipo mixture-of-experts (MoE) ultra disperso con 180 mil millones de parámetros totales en el checkpoint, de los cuales solo 6 mil millones se activan por token. El modelo combina una cabeza MoE principal de 125B, una tabla de embeddings n-gram de 51B y un módulo de decodificación especulativa (MTP) de 4B. Su relevancia actual radica en que permite ejecutar una arquitectura de vanguardia con capacidades de razonamiento, visión y uso de herramientas en un clúster de 4 GPUs de 32 GB, algo inviable con los pesos originales en BF16 que ocupan unos 360 GB.

La cuantización reduce el cuerpo residente en GPU de aproximadamente 250 GB a 80 GB, manteniendo la tabla n-gram en memoria host (RAM) para evitar su carga en VRAM. Según la model card, la degradación de perplexity sobre wikitext-2 es de solo +0,58% respecto al BF16 original. El modelo conserva íntegros el encoder de visión, el módulo MTP y la tabla n-gram, por lo que es funcionalmente equivalente al original para tareas de texto e imagen. Está pensado para su despliegue con vLLM, que incorporó soporte nativo para esta arquitectura en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (MoE híbrido: 36 capas linear-attention Gated DeltaNet + 12 capas full-attention Qwen Sparse Attention, ratio 3:1) |
| Parametros totales | 179.999.981.459 (~180B): 125B MoE + 51B tabla n-gram + 4B MTP |
| Parametros activos | 6B (solo el MoE; la tabla n-gram y el MTP no se cuentan como activos por token) |
| Longitud de contexto | 262.144 tokens nativos, 1M con YaRN |
| Tipos de cuantizacion | GPTQ 4-bit (W4, group size 32, simétrico, desc_act no, true_sequential sí, MSE 2.0; fallback RTN al 0,5% de cobertura) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen, no es Apache ni MIT) |
| Formato de pesos | safetensors (sharded) con cuantización GPTQ; la tabla n-gram, vision encoder y MTP se mantienen en BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es una vista previa de la arquitectura Qwen4. Consta de 48 capas MoE, de las cuales 36 utilizan atención lineal con Gated DeltaNet y 12 usan atención completa con Qwen Sparse Attention (QSA) y un indexador top-k. Cada capa tiene 512 expertos enrutados con top-10 activos más un experto compartido, con tamaño intermedio de 640. Se emplean hiperconexiones con 4 flujos residuales paralelos y mezcla gated aprendida alrededor de cada bloque. Además, el modelo incorpora una tabla de memoria n-gram (PLE) de 20 millones de filas con bigramas y trigramas hasheados, inyectada en la capa 1 del decoder, y un módulo MTP de una capa para decodificación especulativa.

La cuantización GPTQ se realizó con GPTQModel v7.3.5 usando un dataset mixto de evol-codealpaca-v1 (código) y C4 (texto general en inglés), con 2048 muestras distribuidas uniformemente entre longitudes de contexto de 256 a 2048 tokens (unos 2,4M tokens). Se cuantizaron a INT4 las proyecciones de los expertos, el experto compartido y las proyecciones q,k,v,o de las capas de atención completa. Se mantuvieron en BF16 las capas de atención lineal, los indexadores de atención dispersa, los routers, las hiperconexiones, la tabla n-gram, el encoder de visión y el módulo MTP. El script de cuantización se incluye en el repositorio como `quantize.py`.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas de lógica y matemáticas (se indica que supera a Claude-4.6-Opus (Max) en ciertas evaluaciones, según Unsloth).
- Procesamiento multimodal: acepta entradas de texto e imagen mediante un encoder de visión ViT de 27 bloques en BF16.
- Uso de herramientas (tool use) y codificación agéntica (agentic coding), según la descripción oficial en Ollama.
- Decodificación especulativa con el módulo MTP incluido, que acelera la generación al predecir hasta 3 tokens adicionales por paso.
- Ventana de contexto nativa de 262.144 tokens, ampliable a 1M con YaRN, adecuada para documentos largos y conversaciones multi-turno.
- Soporte para despliegue con vLLM, incluyendo offload de la tabla n-gram a memoria host (VLLM_PLE_CPU_OFFLOAD) o modo memory-mapped (VLLM_PLE_MMAP).
- Capacidades multilingües no documentadas en la información disponible.

## Casos de uso

- Asistente de programación agéntico en producción: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y corregir código, aprovechando su soporte de tool use y su ventana de contexto de 262K para mantener el historial del repositorio. Su tamaño activo de 6B permite latencias razonables en un clúster de 4 GPUs.
- Análisis de documentos extensos con visión: al aceptar imágenes y texto, puede procesar contratos, informes o artículos científicos con gráficos y tablas, manteniendo el contexto completo de 262K tokens. La cuantización GPTQ apenas degrada la calidad (+0,58% perplexity).
- Atención al cliente multilingüe: aunque los idiomas no están documentados, el modelo base de Qwen suele soportar múltiples lenguas. Puede gestionar conversaciones de soporte con contexto largo y derivar a herramientas externas mediante tool calling.
- Decodificación especulativa para reducir costes de inferencia: el módulo MTP integrado permite servir el modelo con vLLM usando `--speculative-config` con 3 tokens especulativos, reduciendo la latencia por token sin necesidad de un modelo draft externo.
- Investigación en arquitecturas MoE ultra dispersas: al ser una vista previa de Qwen4, sirve como banco de pruebas para estudiar el comportamiento de la atención híbrida Gated DeltaNet + QSA y la memoria n-gram en tareas de razonamiento y visión.
- Despliegue en entornos con múltiples GPUs de 32 GB: el cuerpo cuantizado ocupa unos 80 GB, por lo que se puede servir con tensor parallelism de 4 en GPUs como A100 40GB o RTX A6000 48GB, manteniendo la tabla n-gram en RAM del host (requiere ≥100 GB libres).

## Benchmarks y rendimiento

La información disponible solo incluye evaluación de perplexity sobre wikitext-2-raw-v1 (test set, seq_len=2048, stride=512, 64 ventanas). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la documentación proporcionada.

| Modelo | Perplexity (wikitext-2) | Degradación |
|---|---|---|
| BF16 original | 3,1206 | — |
| GPTQ 4-bit (este modelo) | 3,1386 | +0,58% |

> Nota: los valores absolutos no son comparables con otras familias de modelos porque la tabla n-gram tiene memorizado parte de Wikipedia. Solo es significativa la diferencia entre BF16 y la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: ~80 GB para el cuerpo del modelo (INT4) + la tabla n-gram no requiere VRAM (se mantiene en RAM host). Con tensor parallelism de 4, se necesitan ~20 GB por GPU.
- GPUs recomendadas: 4 GPUs de 32 GB o más (por ejemplo, A100 40GB, RTX A6000 48GB, o GPUs de 80 GB como A100/H100 si se quiere margen). No cabe en una única GPU consumer (RTX 4090 tiene 24 GB, insuficiente).
- RAM del host: mínimo 100 GB libres para la tabla n-gram (o page cache si se usa el modo mmap).
- Opciones de despliegue: vLLM (con soporte nativo desde septiembre de 2026; antes solo en imagen dedicada `vllm/vllm-openai:qwen38-flash-next`). También está disponible en Ollama según la documentación oficial.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (MoE multimodales de ~125B) en la información proporcionada. La documentación de Unsloth menciona que Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max), pero sin cifras concretas. La comparación más relevante es con el modelo original en BF16:

| Característica | Qwen3.8-Flash-Next (BF16) | Qwen3.8-Flash-Next-GPTQ-4bit (este) |
|---|---|---|
| Parámetros totales | ~360 GB en disco (250 GB cuerpo + 102 GB n-gram + 8 GB MTP) | ~188 GB en disco (80 GB cuerpo INT4 + 102 GB n-gram + BF16 keeps) |
| VRAM necesaria | ~250 GB (cuerpo) | ~80 GB (cuerpo) |
| Perplexity (wikitext-2) | 3,1206 | 3,1386 (+0,58%) |
| Licencia | qwen-community-1.0 | qwen-community-1.0 |

Para otras alternativas (como Llama 3.1 405B o DeepSeek-V3), no hay datos en la información disponible.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 no es de código abierto estándar; hay que revisar sus términos para uso comercial y redistribución. No es Apache 2.0 ni MIT.
- El modelo es una vista previa de la arquitectura Qwen4, por lo que puede presentar comportamientos inestables o cambios en futuras versiones.
- La tabla n-gram requiere al menos 100 GB de RAM host; en entornos con memoria insuficiente, el despliegue fallará o usará swap con degradación severa de rendimiento.
- La cuantización GPTQ introduce una degradación leve pero medible (+0,58% perplexity). Para aplicaciones sensibles a la precisión, se recomienda validar con datos propios.
- No se han documentado los idiomas soportados; la cobertura multilingüe no está garantizada.
- No hay información sobre sesgos o riesgos de alucinación específicos de este modelo. Como todo LLM, puede generar contenido falso o dañino.
- El ejemplo de vLLM usa `--max-model-len 32768` en lugar del máximo nativo de 262K, probablemente para limitar el uso de memoria del KV cache. No se indica si el modelo puede operar a 262K en la práctica con esta cuantización.
- El despliegue requiere vLLM con soporte específico para `qwen4_exp`; no se menciona compatibilidad con otros servidores como TGI o llama.cpp.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/btbtyler09/Qwen3.8-Flash-Next-GPTQ-4bit
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta de vLLM para el modelo: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación de Unsloth para ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Página en Ollama: https://ollama.com/library/qwen3.8-flash-next
