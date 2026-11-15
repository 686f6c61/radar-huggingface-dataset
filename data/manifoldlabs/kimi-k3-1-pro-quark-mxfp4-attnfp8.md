# manifoldlabs/Kimi-K3.1-Pro-Quark-MXFP4-AttnFP8

## Resumen

Kimi-K3.1-Pro-Quark-MXFP4-AttnFP8 es un checkpoint cuantizado del modelo Kimi-K3.1-Pro de Moonshot AI, publicado por manifoldlabs y empaquetado en el formato AMD Quark para su despliegue sobre aceleradores AMD Instinct MI350X y MI355X. No se trata de un modelo nuevo ni de un reentrenamiento: es un repack de pesos orientado a producción que conserva bit a bit los expertos enrutados en MXFP4 del release original y aplica FP8-E4M3 a las proyecciones de self-attention, manteniendo en BF16 el indexador de atención dispersa (DSA), los expertos compartidos, las puertas del router, el `lm_head` y la torre de visión.

El modelo base es un transformer de tipo Mixture-of-Experts con 1.418.376.616.704 parámetros totales (aproximadamente 1,42 billones), lo que lo sitúa en la categoría de modelos frontera. El checkpoint ocupa 1.524 TB repartidos en 96 shards, lo que refleja directamente el tamaño del modelo y hace que su despliegue solo sea viable en clústeres multi-GPU de gama alta. La ventana de contexto soportada en la configuración de servicio publicada es de 262.144 tokens.

Su relevancia es doble: por un lado, demuestra que el ecosistema AMD (ROCm, Quark, SGLang con AITER) ya puede servir modelos de escala frontera con cuantización mixta MXFP4/FP8; por otro, documenta con transparencia el coste de este tipo de repack, ya que el propio autor señala que servir el release original en compressed-tensors resultó entre un 10 % y un 15 % más rápido en sus pruebas de throughput sobre el mismo build de SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención dispersa DSA y capas Mamba; pesos en formato AMD Quark (MXFP4 + FP8) |
| Parametros totales | 1.418.376.616.704 (1,42 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de servicio publicada) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, MLP denso de la capa 0), FP8-E4M3 PTPC (proyecciones de self-attention), BF16 (indexador DSA, expertos compartidos, proyecciones latentes up/down, router gates, `lm_head`, torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3.1-Pro License (license_name: kimi-k3.1-pro, license: other) |
| Formato de pesos | safetensors (96 shards, 1.524 TB), `transformers` con `trust_remote_code`, `quant_method: quark` |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del Kimi-K3.1-Pro original: un transformer de tipo Mixture-of-Experts con atención dispersa (DSA, con un indexador dedicado compuesto por `wq_b`, `wk` y `weights_proj`) y capas de tipo Mamba, tal como se deduce de los flags de servicio (`--mamba-full-memory-ratio`, `--mamba-radix-cache-strategy`, `SGLANG_OPT_MAMBA_SKIP_DECODE_LOCK`). Los expertos enrutados (`w1`, `w2`, `w3`) ya venían entrenados con quantization-aware training en MXFP4 en el release de Moonshot, en formato compressed-tensors.

Este repack no recalcula esos expertos: copia los bytes FP4 empaquetados y las escalas de grupo E8M0 de tamaño 32 sin modificar al layout MXFP4 de Quark, de modo que los valores dequantizados son idénticos a los originales. Las proyecciones de self-attention (`q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, etc.) se cuantizan a FP8-E4M3 con escalas por canal de salida y activaciones FP8 dinámicas por canal, siguiendo la receta K3 de AMD, con un error relativo de peso de aproximadamente el 2,6 %. El MLP denso de la capa 0 se mantiene en MXFP4 como en el checkpoint Quark de AMD para K3, y el indexador DSA de K3.1 se preserva en BF16 como extensión del template original. La conversión se realizó con `amd-quark 0.12.post1`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento de escala frontera, heredados del modelo base Kimi-K3.1-Pro.
- Procesamiento multimodal: el checkpoint conserva la torre de visión en BF16, por lo que mantiene las capacidades de visión del original.
- Tool calling / function calling: el autor verificó un round trip de llamada a herramienta con éxito; el servidor expone `--tool-call-parser kimi_k3`.
- Razonamiento multi-paso con parser dedicado (`--reasoning-parser kimi_k3`).
- Contexto largo: se validó una prueba de recuperación de información con 210.000 tokens; la configuración de servicio admite hasta 262.144 tokens.
- Capacidades multilingües: no disponible en la información proporcionada.
- Atención dispersa (DSA) con indexador propio, que reduce el coste computacional en contextos largos.
- Capas Mamba con gestión de caché específica en SGLang (`mamba-radix-cache-strategy extra_buffer_lazy`).

## Casos de uso

- Procesamiento de documentos extensos en producción: con 262.144 tokens de contexto y una prueba de recuperación validada a 210.000 tokens, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola pasada sin fragmentación.
- Agentes autónomos con tool calling: el parser `kimi_k3` y el round trip verificado permiten integrar el modelo en orquestadores de agentes que encadenan llamadas a APIs, ejecución de código y consultas a bases de datos.
- Razonamiento analítico por lotes: el modo de razonamiento con parser dedicado encaja en pipelines de análisis financiero, revisión de literatura científica o generación de informes técnicos donde se prioriza la precisión sobre la latencia.
- Asistentes de código a gran escala: la combinación de contexto largo y tool calling permite indexar repositorios completos y responder consultas que requieren cruzar múltiples ficheros y ejecutar tests.
- Análisis de documentos con componente visual: la torre de visión en BF16 habilita la extracción de información de PDFs escaneados, gráficos e imágenes técnicas dentro del mismo flujo de texto.
- Despliegue soberano sobre AMD: organizaciones con clústeres Instinct MI350X/MI355X pueden servir un modelo frontera sin depender de CUDA, usando la pila ROCm + Quark + SGLang con AITER.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación introducida por esquemas MXFP4/FP8 frente al release original en tareas de razonamiento matemático (GSM8K).

## Benchmarks y rendimiento

Evaluación GSM8K 5-shot sobre las 1.319 preguntas, temperatura 0, en 8× AMD Instinct MI350X con SGLang (`lmsysorg/sglang:dev-kimi-k31-pro-mi35x`):

| Checkpoint / configuración | Strict match | Flexible match |
|---|---|---|
| Release original (servido directamente) | 0,9644 | 0,9674 |
| Este repack, `AITER_SITUV2_A8W4=1` | 0,9621 | 0,9644 |
| Este repack, `AITER_SITUV2_A4W4=1` | 0,9583 | 0,9583 |

El autor reporta además ausencia de logits NaN y de errores en 12 ráfagas de carga saneadas por configuración, una prueba de recuperación en contexto largo de 210.000 tokens superada y un round trip de tool calling correcto. En throughput, servir el release original en compressed-tensors fue entre un 10 % y un 15 % más rápido que este repack sobre el mismo build de SGLang.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 1.524 TB en disco; en inferencia se necesita un pool de memoria agregada del mismo orden, repartido entre GPUs. No es viable en una sola GPU.
- GPUs recomendadas: AMD Instinct MI350X o MI355X, en configuraciones de 8 GPUs con `--tp-size 8 --dcp-size 8`.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 5090, etc.); el tamaño del modelo lo impide por varios órdenes de magnitud.
- Opciones de despliegue: SGLang con backend ROCm y AITER (`SGLANG_USE_AITER=1`, `SGLANG_AITER_K3_OPT=1`), imagen `lmsysorg/sglang:dev-kimi-k31-pro-mi35x`; requiere `--trust-remote-code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Configuración de servicio de referencia: `--kv-cache-dtype fp8_e4m3`, `--context-length 262144`, `--mem-fraction-static 0.85`, `--chunked-prefill-size 32768`, `--max-running-requests 48`, `--cuda-graph-max-bs-decode 48`, `--schedule-policy lpm`, `--prefill-decode-interval 32`, `--mamba-full-memory-ratio 0.65`, `SGLANG_ROCM_RUNTIME_RESERVE_GB=10`.
- Latencia y throughput: no se publican cifras absolutas; solo la comparación relativa del 10-15 % frente al release original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-Quark-MXFP4-AttnFP8 (este) | 1,42 B totales | 262.144 | MXFP4 + FP8 + BF16 | Kimi K3.1-Pro License | Hugging Face, formato Quark para AMD |
| moonshotai/Kimi-K3.1-Pro (base) | 1,42 B totales | no disponible | MXFP4 (compressed-tensors) | Kimi K3.1-Pro License | Hugging Face |
| amd/Kimi-K3-Quark-MXFP4-AttnFP8 | no disponible | no disponible | MXFP4 + FP8 | no disponible | Hugging Face, formato Quark para AMD |

La comparación principal es contra el release original de Moonshot: mismo tamaño y licencia, pero este repack ofrece un layout específico para Quark en hardware AMD a cambio de una ligera pérdida en GSM8K (0,9621 frente a 0,9644 en strict match) y de un throughput entre un 10 % y un 15 % inferior en las pruebas del autor. El checkpoint de AMD para K3 (versión anterior) sirve como referencia de formato, no de rendimiento, ya que no se publican métricas comparables en la información disponible.

## Limitaciones y advertencias

- Degradación medible en GSM8K: la pérdida es pequeña pero real (0,9621 frente a 0,9644 en strict match), y mayor con la variante `A4W4` (0,9583). En tareas sensibles a la precisión numérica conviene validar contra el original.
- Penalización de rendimiento: el propio autor documenta que el release original en compressed-tensors es un 10-15 % más rápido en el mismo build de SGLang, por lo que este repack no es la opción óptima si solo se busca throughput.
- Dependencia de hardware y software muy específicos: requiere GPUs AMD Instinct MI350X/MI355X, ROCm, AITER y un build concreto de SGLang identificado por digest. No hay soporte documentado para CUDA ni para otros motores de inferencia.
- Licencia restrictiva: la Kimi K3.1-Pro License exige un acuerdo separado con Moonshot AI para ciertos usos comerciales a gran escala como model-as-a-service. Es imprescindible revisar el fichero LICENSE antes de desplegar en producción.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de sesgos; al ser un modelo de escala frontera, el riesgo de alucinación existe y debe mitigarse con verificación externa.
- Idiomas soportados no documentados: no se especifica la cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas sin evaluación propia.
- Parámetros activos no disponibles: al no conocerse la ratio de activación del MoE, no se puede estimar con precisión el coste computacional por token.
- Naturaleza derivada: cualquier problema de sesgo, seguridad o alineación del modelo base se hereda sin cambios, ya que este checkpoint no aplica ningún ajuste adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manifoldlabs/Kimi-K3.1-Pro-Quark-MXFP4-AttnFP8
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Checkpoint de referencia de AMD: https://huggingface.co/amd/Kimi-K3-Quark-MXFP4-AttnFP8
- Documentación de AMD Quark: https://quark.docs.amd.com/
- Imagen de SGLang utilizada: `lmsysorg/sglang:dev-kimi-k31-pro-mi35x@sha256:5901db1401ad7b8bc62ac67175f6f013b1b868e2a2dab063ee8848e7290fa9a7`
