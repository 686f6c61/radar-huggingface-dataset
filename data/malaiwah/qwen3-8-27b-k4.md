# malaiwah/Qwen3.8-27B-K4

## Resumen

El modelo `malaiwah/Qwen3.8-27B-K4` es una cuantización EXL3 de precisión mixta del modelo de visión-lenguaje `Qwen/Qwen3.8-27B`, desarrollada por el usuario malaiwah. Su objetivo es reducir el footprint de memoria en VRAM manteniendo una fidelidad alta respecto al modelo original en BF16, empleando una estrategia que asigna 4 bits solo a las capas donde las recetas NVFP4 independientes también los usan, y protege el resto con Trellis en lugar de FP8. El resultado es un checkpoint de 28,3 GB que ocupa 19,21 GB en VRAM, 2,7 GB menos que las alternativas NVFP4 comparables, con una divergencia KLD 2,7 veces menor frente al profesor BF16.

Está pensado para entornos de producción que necesitan servir un modelo multimodal de 27B con contexto nativo de 262 144 tokens en una sola GPU de gama alta, pero requiere un fork específico de vLLM (Gilded Gnosis) que implementa el cargador EXL3, los kernels Trellis B12X y el overlay de cuantización online `exl3-b6`. No es un modelo entrenado desde cero, sino una cuantización del modelo base de Qwen, por lo que hereda sus capacidades de visión-lenguaje, razonamiento y control de pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con torre de visión (vision-language), basado en Qwen3.8-27B |
| Parametros totales | 14 156 812 528 (pesos cuantizados en safetensors); el modelo base declara 27B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 nativo; hasta ~1 010 000 con override `text_config.max_position_embeddings` |
| Tipos de cuantizacion | EXL3 K4 (MLP, 4.004 bpw), EXL3 K6 (lm_head y attention en VRAM), BF16 (embeddings, torre de visión, MTP head, normas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint); requiere runtime EXL3 del fork Gilded Gnosis vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen3.8-27B`, no un entrenamiento original. La arquitectura subyacente es un transformer denso con componentes de visión (torre de 27 bloques) y un head MTP (multi-token prediction) para generación especulativa. La cuantización aplica una estrategia de precisión mixta: las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) de las 64 capas se serializan con EXL3 K4 usando LDLQ calibrado; las proyecciones de atención (48 capas lineales y 16 de atención completa) se guardan en BF16 en disco y se re-encodan a K6 en tiempo de carga mediante el overlay `exl3-b6` del fork Gilded Gnosis, con caché direccionada por contenido; `lm_head` se cuantiza a K6; y embeddings, torre de visión, head MTP y normas permanecen en BF16 sin tocar.

La innovación técnica principal es el uso de Trellis a K4, que no necesita tensor de escala por grupo, logrando 4.004 bpw frente a los 4.50 bpw de NVFP4. Esto, combinado con atención a K6 en lugar de FP8, reduce el footprint residente a 19,21 GB. El checkpoint es más grande que las alternativas NVFP4 (28,31 GB frente a 21,92 y 23,42 GB) porque la atención viaja en BF16 para permitir la re-encodificación en runtime. No se menciona entrenamiento adicional, RLHF ni DPO; es una cuantización pura.

## Capacidades

- Generación de texto y diálogo conversacional multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento con control de pensamiento: soporta `enable_thinking: false` o `reasoning_effort` con niveles `low`, `medium`, `high` y `xhigh` mediante `chat_template_kwargs`.
- Comprensión de imágenes a través de la torre de visión de 27 bloques, que se mantiene íntegra en BF16.
- Contexto largo nativo de 262 144 tokens, ampliable hasta ~1M con override de configuración.
- Generación especulativa mediante head MTP (draft head) conservado en BF16.
- Vocabulario de 248 320 tokens con head destejido (untied), heredado del modelo base.
- Compatible con el pipeline `image-text-to-text` de HuggingFace.

## Casos de uso

- Asistentes conversacionales con entrada de imágenes: el modelo puede recibir una fotografía o captura y mantener un diálogo multi-turno sobre ella, gracias a su ventana de 262 144 tokens que permite incluir varias imágenes y contexto extenso.
- Análisis de documentos largos con figuras y tablas: al combinar visión y contexto amplio, puede resumir informes extensos que incluyan gráficos o diagramas, manteniendo coherencia a lo largo de decenas de miles de tokens.
- Despliegue en una sola GPU de gama alta: con 19,21 GB de pesos residentes, cabe en una RTX PRO 6000 Blackwell o similar, permitiendo servir un modelo de 27B multimodal sin necesidad de múltiples GPUs.
- Generación de respuestas con razonamiento controlado: en entornos donde se requiere explicar pasos intermedios, se puede activar `reasoning_effort` a nivel `high` o `xhigh`; para respuestas rápidas, desactivar el pensamiento con `enable_thinking: false`.
- Inferencia de largo alcance en tareas de recuperación aumentada (RAG): el contexto nativo de 262K permite inyectar corpus extensos y hacer preguntas sobre ellos sin fragmentar el prompt.
- Prototipado y evaluación de cuantizaciones: al ser una cuantización EXL3 con caché online, sirve como referencia para medir el impacto de precisión mixta frente a NVFP4 en la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una única métrica de fidelidad: divergencia KLD media frente a un profesor BF16 en 2047 posiciones de vocabulario completo.

| Metrica | Qwen3.8-27B-K4 | unsloth/Qwen3.8-27B-NVFP4 |
|---|---|---|
| KLD media vs BF16 teacher | 0.034030 | 0.091457 |
| Peso residente en VRAM | 19,21 GB | 23,42 GB |

El modelo K4 está 2,7 veces más cerca del profesor BF16 que la alternativa NVFP4 de unsloth, con 4,2 GB menos de peso residente. No hay datos de latencia ni throughput en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 19,21 GB de pesos residentes (medido en una RTX PRO 6000 Blackwell), más overhead de activaciones y KV cache; con `--gpu-memory-utilization 0.85` y `--max-model-len 8192` se sirve en una GPU de 24 GB o superior.
- GPU recomendada: RTX PRO 6000 Blackwell (usada en las mediciones), aunque cualquier GPU con al menos 24 GB de VRAM y soporte CUDA 12.6+ debería ser suficiente.
- No cabe en GPUs de consumo de 8-12 GB; requiere al menos una GPU profesional o de gama alta (RTX 4090, A6000, etc.) para el contexto máximo.
- Despliegue: exclusivamente con el fork Gilded Gnosis vLLM (imagen pública `voipmonitor/vllm:gilded-gnosis-v20-vllm4d006a4-b12xcd3ce19-fi1ac6942-cu132-20260810-r34`). No es compatible con vLLM upstream, llama.cpp, Ollama ni TGI.
- Parámetros de arranque obligatorios: `--quantization exl3`, `--enforce-eager`, lista `ignore` con patrones específicos (p. ej. `re:.*visual\..*`, `re:.*mtp\\..*`, `lm_head`), y variables de entorno `VLLM_EXL3_ONLINE_TRELLIS_BITS=6` y `VLLM_EXL3_ONLINE_CACHE_DIR`.
- La primera carga codifica 208 proyecciones de atención (~16 minutos en una GPU), con caché persistente para cargas posteriores.
- No se admiten CUDA graphs; el loader rechaza ejecución no eager.

## Comparativa con modelos similares

| Modelo | Checkpoint | Peso residente | MLP | Attention | lm_head | KLD vs BF16 |
|---|---|---|---|---|---|---|
| malaiwah/Qwen3.8-27B-K4 | 28,31 GB | 19,21 GB | EXL3 K4 (4.004 bpw) | BF16→K6 (6 bpw) | EXL3 K6 | 0.034030 |
| nvidia/Qwen3.6-27B-NVFP4 | 21,92 GB | 21,92 GB | NVFP4 W4A16 gs16 (4.50 bpw) | FP8 E4M3 W8A8 | NVFP4 (4 bpw) | no disponible |
| unsloth/Qwen3.8-27B-NVFP4 | 23,42 GB | 23,42 GB | NVFP4 W4A4 gs16 (L0-55), FP8 (L56-63) | FP8 W8A8 dinámico | FP8 (8 bpw) | 0.091457 |

El modelo K4 ofrece el menor footprint residente y la mayor fidelidad al profesor BF16 entre las tres opciones, a costa de un checkpoint más grande y la dependencia de un fork específico de vLLM. Las alternativas NVFP4 son compatibles con vLLM estándar y tienen checkpoints más ligeros, pero ocupan más VRAM y se alejan más del comportamiento original.

## Limitaciones y advertencias

- Requiere un fork no estándar de vLLM (Gilded Gnosis) con kernels Trellis B12X; no funciona con vLLM upstream ni con otros runners (llama.cpp, Ollama, TGI).
- La auto-detección del cargador EXL3 solo funciona para checkpoints con metadatos de GLM-5.2; para este modelo es obligatorio especificar `--quantization exl3` manualmente.
- `--enforce-eager` es obligatorio; no se pueden usar CUDA graphs, lo que puede afectar al rendimiento en producción.
- La lista `ignore` es delicada: los patrones regex no llevan prefijo `model.` y un anclaje incorrecto (p. ej. `re:.*\.visual\..*` en lugar de `re:.*visual\..*`) provoca un crash de arranque (`ValueError: MXFP8 requires input_size_per_partition (4304) to be divisible by 32`), reportado en el issue local-inference-lab/vllm#311.
- El overlay online reclama todas las capas BF16 no presentes en `tensor_storage`, incluyendo la torre de visión y el head MTP; si no se ignoran explícitamente, el arranque falla.
- La primera carga tarda ~16 minutos en codificar las proyecciones de atención; sin caché persistente, cada arranque repetiría ese coste.
- No hay datos de sesgos, alucinación o rendimiento en tareas específicas; al ser una cuantización, hereda las limitaciones del modelo base Qwen3.8-27B, que no están documentadas en esta ficha.
- El checkpoint es más pesado que las alternativas NVFP4 (28,31 GB frente a ~22-23 GB), lo que puede afectar al almacenamiento y a la transferencia.
- El nombre del modelo (27B) no coincide con los parámetros reales del checkpoint cuantizado (14,16B en safetensors); verificar el tamaño efectivo antes de dimensionar infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-K4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork vLLM Gilded Gnosis (issue de referencia): https://github.com/local-inference-lab/vllm/issues/311
- Imagen Docker del fork: `voipmonitor/vllm:gilded-gnosis-v20-vllm4d006a4-b12xcd3ce19-fi1ac6942-cu132-20260810-r34` (digest `sha256:820181fbbc975cd5291c411cda9771d58fecee1636d916f508f47230df20592b`)
