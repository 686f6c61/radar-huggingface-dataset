# bjonor/Swift-1.5-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16

## Resumen

Swift-1.5-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 es una cuantización comunitaria no oficial en 4 bits del modelo `ukisai/Swift-1.5-Qwen3.8-27b`, un fine-tune de 27.781.427.952 parámetros derivado del original `Qwen/Qwen3.8-27B` de Alibaba Cloud (licencia Apache-2.0). La publica el desarrollador bjonor (Bjorn Nordblom) y su objetivo es permitir inferencia con requisitos de VRAM reducidos sin renunciar a dos componentes críticos: la cabeza de predicción multi-token (MTP) y la torre de visión, que se mantienen deliberadamente en BF16 sin cuantizar.

El modelo conserva la arquitectura multimodal `Qwen3_5ForConditionalGeneration`, con 64 capas que combinan atención lineal Gated-DeltaNet con atención completa cada cuatro capas, `hidden_size` de 5120, 24 cabezas de consulta frente a 4 de clave/valor y un vocabulario de 248.320 entradas. El contexto nativo es de 262.144 tokens, aunque la configuración de servicio validada por el autor lo limita a 131.072. La cuantización GPTQ emplea pesos de 4 bits, activaciones de 16 bits (W4A16), `group_size=128`, simetría activada y `desc_act=false`, dejando el `lm_head` sin cuantizar.

La relevancia de esta ficha reside en que documenta una ruta reproducible de servicio sobre hardware Intel XPU (Arc Pro B70), con decodificación especulativa MTP activada y métricas medidas: 61,0 tok/s en decodificación en solitario, longitud media de aceptación 3,04 y un tiempo de arranque del servidor de 131 segundos. El checkpoint ocupa unos 19 GB repartidos en cinco shards de safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (multimodal; decodificador híbrido Gated-DeltaNet lineal + atención completa cada 4 capas) |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; servicio validado hasta 131.072 tokens |
| Tipos de cuantización | GPTQ INT4 (W4A16), `group_size=128`, simétrico, `desc_act=false`; `mtp.*` y `model.visual.*` sin cuantizar |
| Idiomas soportados | Inglés y multilingüe (según etiquetas del repositorio) |
| Licencia | swift-open-license-1.0 (el modelo original Qwen3.8-27B es Apache-2.0) |
| Formato de pesos | safetensors (5 shards, 2399 tensores) |
| Capas | 64 |
| Dimensión oculta | 5120 |
| Cabezas de atención | 24 de consulta / 4 de clave-valor, `head_dim` 256 |
| Vocabulario | 248.320 |
| Módulos cuantizados | 400 (todas las proyecciones lineales de las 64 capas de lenguaje) |
| Tamaño del checkpoint | ~19 GB (repositorio de 19,6 GB) |
| Tarea declarada (`pipeline_tag`) | image-text-to-text |
| Fecha de publicación | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con atención híbrida: la mayoría de las 64 capas utilizan atención lineal Gated-DeltaNet, que mantiene un estado recurrente de coste constante respecto a la longitud de secuencia, mientras que cada cuarta capa emplea atención completa. Esa combinación es la que permite sostener una ventana nativa de 262.144 tokens. El modelo incorpora además una torre de visión (`model.visual.*`, 333 tensores) y una cabeza de predicción multi-token (`mtp.*`, 15 tensores) que actúa como borrador para decodificación especulativa.

Sobre el entrenamiento del modelo base no se proporciona en la información disponible el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a `ukisai/Swift-1.5-Qwen3.8-27b` y a `Qwen/Qwen3.8-27B` y no se detallan aquí. Lo que sí se documenta es el proceso de cuantización: se aplicó GPTQ con `gptqmodel 7.3.2` en modo true-sequential, con `damp_percent=0.05` y `damp_auto_increment=0.01` con escalado Hessiano en FP32, y un mecanismo de respaldo a RTN para módulos que superasen un umbral de error del 0,5 % (no se reportó ninguno). La calibración usó 256 muestras de `HuggingFaceH4/ultrachat_200k` (`train_sft[:256]`, revisión `8049631c...`), truncadas a 2048 tokens, y el proceso completo tardó 2,38 horas en una única Intel Arc Pro B70. La exclusión dinámica `{"-:.*mtp.*": {}}` en `quantize_config.json` es el mecanismo que preserva la cabeza MTP en BF16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (`chat_template.jinja`) y tokenizador heredados sin modificar del modelo base.
- Comprensión de imagen y texto (`image-text-to-text`): la torre de visión se conserva en BF16, por lo que la cuantización no degrada la ruta visual.
- Llamada a herramientas y `function calling`: el repositorio incluye la receta de servicio con `--enable-auto-tool-choice --tool-call-parser qwen3_xml`.
- Decodificación especulativa nativa mediante MTP, configurable con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Razonamiento multi-paso y flujos de agente, gracias a la ventana de contexto larga y al soporte de herramientas.
- Capacidades multilingües (etiqueta `multilingual`), con inglés como idioma principal declarado.
- Servicio compatible con el endpoint OpenAI de vLLM, incluyendo streaming y caché de prefijos (`--enable-prefix-caching`).
- Modo solo lenguaje disponible mediante el flag `--language-model-only`, que desactiva la ruta de visión para ahorrar memoria.

## Casos de uso

- Atención al cliente automatizada: con hasta 131.072 tokens de contexto en la configuración validada, el modelo puede mantener historiales de conversación muy largos y recuperar detalles de interacciones previas sin truncar; el endpoint OpenAI de vLLM facilita la integración con plataformas existentes.
- Agentes con llamada a herramientas: el parser `qwen3_xml` y `--enable-auto-tool-choice` permiten que el modelo emita llamadas estructuradas a APIs externas, encadenando varios pasos de razonamiento dentro de un mismo turno.
- Análisis de documentos extensos con componentes visuales: al ser un modelo de imagen-texto, puede procesar páginas escaneadas, capturas o diagramas junto al texto asociado, útil en revisión de contratos o informes técnicos.
- Asistente de código en pipelines de CI/CD: el modelo puede revisar diffs, resumir errores de compilación y proponer parches, invocado desde el servidor vLLM con contexto de repositorio inyectado como prefijo cacheado.
- Despliegue en hardware Intel XPU de gama profesional: la receta publicada (parches `patch_mtp_nightly.py` y `patch_mtp_boundary.py`, `kv-cache-dtype fp8`, `gpu-memory-utilization 0.94`) está pensada para una única Arc Pro B70 de 30,3 GiB, lo que abarata el coste por nodo frente a GPU de datacenter.
- Generación aumentada por recuperación (RAG) sobre corpus grandes: la ventana larga reduce la necesidad de resumir o dividir el contexto recuperado, y la caché de prefijos abarata las consultas repetidas sobre el mismo documento.
- Evaluación e investigación de cuantización: al conservar MTP y visión en BF16 y publicar `quant_log.csv` con tiempos por módulo, sirve como artefacto de referencia para estudiar el impacto de GPTQ W4A16 en modelos híbridos con decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

Las únicas métricas publicadas son de servicio, medidas por el autor sobre este artefacto:

| Métrica | Valor | Condiciones |
|---|---|---|
| Tiempo hasta servidor listo | 131 s | vLLM XPU nightly, parches MTP aplicados |
| Longitud media de aceptación (MTP-3) | 3,04 (68,0 % de aceptación del borrador) | `num_speculative_tokens=3` |
| Decodificación en solitario | 61,0 tok/s (mediana, n=5) | prompt 512 / generación 128 |
| TTFT con prompt corto | ~0,2 s | no disponible la longitud exacta |
| Pruebas de extremo a extremo | PASS | endpoint y streaming |

## Requisitos de hardware

- Peso de los pesos cuantizados: ~19 GB en disco y en VRAM. No cabe en GPU de consumo de 8, 12 o 16 GB; sí en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090) solo si se recorta agresivamente el contexto y el número de secuencias.
- Configuración de referencia del autor: una Intel Arc Pro B70 con 30,3 GiB de VRAM, `--gpu-memory-utilization 0.94`, `--kv-cache-dtype fp8`, `--max-num-seqs 2` y `--max-num-batched-tokens 8192`.
- Caché KV: con KV en fp8 y 16 capas de atención completa, la estimación derivada de la configuración publicada es de unos 32 KiB por token, es decir aproximadamente 4 GiB para 131.072 tokens. Es un cálculo a partir de la arquitectura, no una medición publicada.
- GPU recomendadas según la receta disponible: Intel Arc Pro B70 (XPU). Para CUDA no hay receta validada en la información proporcionada; debería verificarse la compatibilidad de los kernels GPTQ W4A16 con la ruta XPU de vLLM.
- Opciones de despliegue: vLLM (`vllm/vllm-openai-xpu:nightly`, `0.29.1rc1.dev422+gd05da62e9.xpu`, `vllm-xpu-kernels 0.1.14.1`) con los parches del repositorio. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni con formatos GGUF en esta ficha.
- Latencia y throughput medidos: 61,0 tok/s de decodificación en solitario con MTP-3 y TTFT de ~0,2 s en prompts cortos.
- Requisitos de host del proceso de cuantización: i9-13900K y 64 GB de RAM durante 2,38 horas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Componentes preservados | Licencia | Estado |
|---|---|---|---|---|---|---|
| bjonor/Swift-1.5-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 (este) | ~27,8 B | 262.144 nativo / 131.072 validado | GPTQ INT4 W4A16, g128 sim | MTP (BF16) y visión (BF16) | swift-open-license-1.0 | Publicado, verificado en XPU |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible (base del anterior) | no disponible | Ninguna (checkpoint completo) | No aplica | swift-open-license-1.0 | Modelo base del fine-tune |
| SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 | 27 B (base Qwen3.8) | no disponible | GPTQ INT4 W4A16, g128 sim | MTP (BF16) y visión (BF16) | Apache-2.0 (modelo original) | Cuantiza el modelo base, no el fine-tune Swift |
| bjonor/Swift-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 | 27 B | no disponible | GPTQ INT4 W4A16, g128 sim | MTP (BF16) y visión (BF16) | no disponible | Artefacto Swift 1.0, contrato de cuantización idéntico |
| Qwen/Qwen3.8-27B | 27 B | no disponible aquí | Ninguna | No aplica | Apache-2.0 | Modelo original de Alibaba Cloud, publicado el 2026-08-14 como VLM nativo |

No se dispone de resultados de benchmarks comparativos entre estas variantes, por lo que la comparación se limita a parámetros, contexto, licencia y estado de publicación.

## Limitaciones y advertencias

- Cuantización no oficial: el repositorio declara explícitamente que no está afiliado, respaldado ni soportado por UkisAI ni por Alibaba Cloud.
- Licencia restrictiva: `swift-open-license-1.0` es una licencia "other", no una licencia de código abierto estándar. Debe revisarse el texto completo en el enlace indicado antes de cualquier uso comercial.
- Pérdida de precisión inherente a GPTQ INT4 en los 400 módulos lineales del modelo de lenguaje; no se han publicado evaluaciones de calidad posteriores a la cuantización, solo una comprobación de contrato (`VERIFY PASS`) y pruebas de humo.
- Dependencia de parches de runtime: el autor advierte que `patch_mtp_boundary.py` sigue siendo necesario para peticiones que terminan exactamente en `--max-model-len`. Esto implica fragilidad ante cambios de versión de vLLM.
- La combinación de prefill mixto y decodificación especulativa funciona en el stack probado sin el backport de reparto GDN, pero no se garantiza en otras versiones.
- La validación de servicio llega hasta 131.072 tokens pese a que el contexto nativo es de 262.144; servir la ventana completa no está verificado en este artefacto.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación para este artefacto ni para su modelo base en la información disponible.
- Sesgos: no se documentan análisis de sesgo ni de alineación específicos para esta cuantización. El dataset de calibración (`ultrachat_200k`) es de propósito conversacional y no constituye una evaluación de sesgos.
- Idiomas: aunque la etiqueta es `multilingual`, el único idioma declarado explícitamente es el inglés; no hay datos de rendimiento por idioma.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de redactar la ficha, y fecha de creación y actualización separadas por menos de tres minutos, lo que sugiere un artefacto recién publicado y sin validación independiente.
- Entorno de servicio muy específico (Intel XPU): no hay evidencia publicada de funcionamiento en CUDA, ROCm o CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bjonor/Swift-1.5-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Modelo base (fine-tune): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefacto de referencia de la comunidad (base Qwen3.8-27B): https://huggingface.co/SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Artefacto previo Swift 1.0 del mismo autor: https://huggingface.co/bjonor/Swift-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Repositorio de cuantización y receta de servicio Intel XPU: https://github.com/BjornNordblom/intel-arc-b70-quant
- Parches de servicio para Arc Pro B70: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Perfil del autor: https://huggingface.co/bjonor
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Port de Qwen3.8-27B en coreai-model-zoo: https://github.com/john-rocky/coreai-model-zoo/tree/main/models/qwen3.8-27b
- Ficha en LLM Explorer: https://llm-explorer.com/model/bjonor%2FSwift-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16,5eQN2O749WK9aHG8PmWbi5
