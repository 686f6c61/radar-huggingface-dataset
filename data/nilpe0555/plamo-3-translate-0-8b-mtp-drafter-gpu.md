# nilpe0555/PLaMo-3-Translate-0.8B-MTP-drafter-GPU

## Resumen

PLaMo-3-Translate-0.8B-MTP-drafter-GPU es un modelo "drafter" (borrador) de decodificación especulativa construido por el usuario nilpe0555 sobre el modelo de traducción PLaMo 3 Translate 0.8B de Preferred Networks (PFN). No es un modelo de traducción autónomo: es un componente auxiliar que propone tokens candidatos que el modelo objetivo en BF16 verifica de forma exacta, acelerando la generación sin alterar la salida final. Implementa Multi-Token Prediction (MTP) al estilo DeepSeek-V3 con profundidad D=3, encadenando tres módulos MTP.

El proyecto es de carácter comunitario y no oficial, sin afiliación con PFN, NVIDIA ni DeepSeek. Cada checkpoint contiene 119,2 M de parámetros en FP32 (pesos del drafter), mientras que la tabla de embeddings, la normalización final y la LM head se comparten con el modelo objetivo y no se almacenan en el repositorio. El repositorio ocupa 1,4 GB e incluye tres variantes de checkpoint: `qat-int4g128/` (la mejor), `cont/` (entrenamiento a precisión completa) y `permissive-D3/` (solo fuentes permisivas, más débil).

Su relevancia es práctica: demuestra que la decodificación especulativa exacta con MTP puede multiplicar el throughput de un modelo de traducción pequeño en GPUs NVIDIA, con ganancias medidas de hasta 1,63× sobre un motor serial BF16 optimizado y 3,18× sobre vLLM 0.12 en BF16, manteniendo identidad bit a bit con la verificación del objetivo en la gran mayoría de peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP encadenado (3 modulos, estilo DeepSeek-V3), cada uno con proyeccion lineal + un bloque decoder Transformer inicializado desde la capa 15 de PLaMo 3 Translate 0.8B |
| Parametros totales | 119,2 M por checkpoint (FP32, solo drafter) |
| Parametros activos | no disponible (no es MoE; D=3 modulos encadenados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (pesos almacenados), BF16, FP8 e int4 group-128 (QAT en `qat-int4g128/`) |
| Idiomas soportados | ja, en |
| Licencia | plamo-community-license (other) |
| Formato de pesos | safetensors (mas config.json, summary.json, train_log.jsonl, PLaMo-NOTICE.md) |

## Arquitectura y entrenamiento

El modelo implementa tres módulos MTP encadenados según la formulación de DeepSeek-V3 (arXiv:2412.19437, Sec. 2.2, solo como referencia metodológica). Cada módulo `k` concatena el estado oculto previo y el embedding del siguiente token, los proyecta linealmente y pasa el resultado por un único bloque decoder Transformer, inicializado desde la capa 15 de PLaMo 3 Translate 0.8B y entrenado posteriormente. La tabla de embeddings, la normalización final y la LM head están congeladas y se comparten con el modelo objetivo. En cada ciclo el drafter propone D=3 tokens y el objetivo BF16 verifica D+1=4 filas.

Las adaptaciones documentadas incluyen una LM head de borrador filtrada (shortlist por idioma destino de 24.576 filas + EOS, vocabulario de 49.152 filas, o PCA grueso con re-ranking exacto) para evitar recorrer las 107.520 filas completas de la LM head en cada paso encadenado, y módulos de borrador cuantizados en FP8 o int4 group-128 mediante `torch._weight_int4pack_mm`. El checkpoint `qat-int4g128/` se entrenó con QAT para el formato int4. Los datos de entrenamiento son salidas greedy de PLaMo 3 sobre prompts de corpus públicos (Tatoeba, KFTT, WikiMatrix, Dolly 15k, OASST1, Wikipedia); la variante `permissive-D3/` usa solo OASST1 (Apache-2.0) y Tatoeba (CC BY 2.0 FR). El filtrado y la cuantización afectan únicamente a las propuestas del borrador, nunca a la verificación BF16 ni a la salida final.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa exacta sobre PLaMo 3 Translate 0.8B en GPUs NVIDIA con objetivo BF16.
- Predicción multi-token (D=3) con verificación de D+1=4 filas por ciclo.
- Traducción japonés-inglés e inglés-japonés como tarea objetivo (a través del modelo base).
- Soporte de cuantización del drafter en int4 group-128 (QAT) y FP8, con LM head filtrada por idioma.
- Compatibilidad con `torch.compile` en los módulos de borrador.
- No soporta tool calling, agentes, visión ni audio por sí mismo: es un componente de aceleración, no un modelo conversacional.

## Casos de uso

- Aceleración de traducción JA-EN en producción: desplegar el drafter junto a PLaMo 3 Translate 0.8B en BF16 para reducir la latencia de decodificación hasta 1,63× sobre un motor serial optimizado en H100, manteniendo la salida idéntica al objetivo.
- Servicio de traducción de baja latencia en consumer GPU: con una RTX 4060 Ti se alcanzan 355 TPS (2,816 ms/token) usando el motor Triton G2 fusionado, adecuado para APIs de traducción con throughput moderado.
- Sustitución de vLLM en pipelines existentes: el drafter ofrece 3,18× sobre vLLM 0.12 BF16 (448 TPS) en H100, útil cuando se quiere exprimir hardware ya disponible sin cambiar de modelo objetivo.
- Traducción por lotes de documentos: con batch size 1 y hasta 512 tokens nuevos por petición, encaja en tareas de traducción de párrafos y artículos donde la latencia por token domina.
- Investigación en decodificación especulativa: el repositorio incluye `docs/MTP_SPEC.md`, `docs/D19_FP8.md` y `docs/D19_QUANT.md`, lo que lo convierte en una referencia reproducible para estudiar MTP con verificación exacta.
- Evaluación de cuantización QAT en drafters: la comparativa entre `qat-int4g128/`, `cont/` y `permissive-D3/` permite medir el impacto de int4/FP8 en la tasa de aceptación sin tocar la salida verificada.
- Despliegue en entornos con requisitos de licencia estrictos: la variante `permissive-D3/` entrena solo con fuentes permisivas (aunque sigue siendo un modelo derivado bajo la licencia PLaMo).

## Benchmarks y rendimiento

Mediciones sobre 112 peticiones retenidas de traducción JA-EN, batch size 1, decodificación greedy, máximo 512 tokens nuevos, solo latencia de decodificación (TTFT excluido), objetivo BF16.

| Entorno / checkpoint | Arm | ms/token | TPS | × serial G2 |
|---|---|---:|---:|---:|
| H100, vLLM 0.12 BF16 (referencia) | — | 2,234 | 448 | — |
| H100, vLLM 0.12 FP8 (referencia) | — | 1,953 | 512 | — |
| H100, G2 Triton serial BF16 | — | 1,148 | 871 | 1,00× |
| H100, `qat-int4g128` | `3:i4g128:i4g128` | 0,703 | 1.423 | 1,63× |
| H100, `qat-int4g128` | `2:i4g128:i4g128` | 0,720 | 1.389 | 1,59× |
| H100, `cont` | `3:i4g128:bf16` | 0,726 | 1.377 | 1,58× |
| H100, `cont` | `3:i4g128:fp8` | 0,739 | 1.353 | 1,55× |
| H100, `cont` | `3:bf16:bf16` | 0,755 | 1.325 | 1,52× |
| H100, `qat-int4g128` | `3:i4g128:fp8` | 0,761 | 1.315 | 1,51× |

En RTX 4060 Ti: 2,816 ms/token (355 TPS) con el motor Triton G2 fusionado, o 3,475 ms/token (288 TPS, 1,94×) con el motor CUDA-graph incluido. En H100 con el motor CUDA-graph incluido: 1,937 ms/token (516 TPS), 1,90× sobre el serial incluido (272 TPS).

Exactitud de la verificación greedy: 112/112 peticiones idénticas token a token frente a la referencia serial de (D+1) filas en todos los brazos, tanto en H100 como en RTX 4060 Ti. Frente al motor serial M=1: 112/112 en RTX 4060 Ti (G2), 96/112 en RTX 4060 Ti (incluido), 107/112 en H100 (incluido D=3; 112/112 con D=2) y 102/112 en H100 (G2). Todas las diferencias son empates o casi-empates BF16 exactos (gap top-2 ≤ 0,375; en H100 G2, 7 empates exactos de 0,0 y 3 gaps de 0,125) por redondeo BF16 dependiente del número de filas en GEMM.

## Requisitos de hardware

- VRAM: el drafter pesa 119,2 M parámetros (unos 0,48 GB en FP32); en int4 group-128 se reduce notablemente. Hay que sumar el modelo objetivo PLaMo 3 Translate 0.8B en BF16 (aproximadamente 1,6 GB) más activaciones y KV cache.
- GPU recomendadas: NVIDIA H100 PCIe 80 GB (referencia medida), RTX 4060 Ti (medida). Cabe en GPUs consumer con al menos 8 GB de VRAM combinando drafter y objetivo en BF16.
- Despliegue: motores propios incluidos en `code/` (CUDA-graph) y un motor Triton G2 fusionado (referenciado pero no incluido todavía en `code/`); compatible con ecosistema PyTorch 2.9.0+cu129 y Triton 3.5.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,703 ms/token (1.423 TPS) en H100 con G2 y `qat-int4g128`; 1,937 ms/token (516 TPS) en H100 con el motor incluido; 2,816 ms/token (355 TPS) en RTX 4060 Ti con G2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo-3-Translate-0.8B-MTP-drafter-GPU (`qat-int4g128`) | 119,2 M (drafter) | no disponible | 1.423 TPS en H100 (G2) | plamo-community-license | Hugging Face (comunitario) |
| PLaMo 3 Translate 0.8B (objetivo, serial BF16) | 0,8 B | no disponible | 871 TPS en H100 (G2 serial) | plamo-community-license | Hugging Face (PFN) |
| vLLM 0.12 BF16 (motor genérico) | — | — | 448 TPS en H100 | Apache-2.0 (vLLM) | open source |
| vLLM 0.12 FP8 online | — | — | 512 TPS en H100 | Apache-2.0 (vLLM) | open source |

No se dispone de comparación con otros drafters MTP publicados en la información proporcionada.

## Limitaciones y advertencias

- Proyecto no oficial: no está afiliado, respaldado ni soportado por Preferred Networks, NVIDIA ni DeepSeek.
- Solo acelera; no sustituye al modelo objetivo. Requiere PLaMo 3 Translate 0.8B en BF16 para la verificación.
- Idiomas limitados a japonés e inglés; el pipeline es de traducción, no de propósito general.
- La variante `permissive-D3/` es más débil (1,13–1,14× frente al mejor) y debe emparejarse con `data/vocab-permissive-49152.npy`, la pantalla con la que fue evaluada; las pantallas `data/vocab-lang-*` se construyeron con estadísticas del almacén completo.
- El motor Triton G2 fusionado no está incluido en `code/`; las cifras de 1,63× corresponden a un motor separado no empaquetado.
- Las diferencias frente al motor serial M=1 (hasta 16/112 peticiones en algunos brazos) se deben a redondeo BF16 dependiente del número de filas en GEMM, no a errores del drafter.
- Licencia PLaMo Community: revisar las condiciones antes de uso comercial; todos los checkpoints son modelos derivados.
- Sin garantía de ningún tipo ("AS IS"); sin datos publicados sobre sesgos o tasa de alucinación del modelo objetivo en esta información.
- Fecha de creación del repositorio: 2026-11-26; descargas y likes a cero en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/nilpe0555/PLaMo-3-Translate-0.8B-MTP-drafter-GPU
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Paper de referencia MTP (DeepSeek-V3): https://arxiv.org/abs/2412.19437
- Documentación interna del repositorio: `docs/MTP_SPEC.md`, `docs/D19_FP8.md`, `docs/D19_QUANT.md`, `VERIFY.md`, `README_ja.md`
