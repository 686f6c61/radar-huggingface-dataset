# Atlas3D/Qwen3.8-Flash-Next-atlas-56g-ingine

## Resumen

Qwen3.8-Flash-Next-atlas-56g-ingine es un checkpoint cuantizado de forma elástica del modelo Qwen3.8-Flash-Next (177B parámetros totales, arquitectura MoE) publicado por Atlas3D para su motor de inferencia propio, `atlas-ingine`. No es un modelo nuevo: es una redistribución de pesos del modelo base de Qwen con una asignación de precisión mixta diseñada para reducir la huella de VRAM manteniendo la paridad funcional con el checkpoint original en FP32. El paquete ocupa 88 GB en total, de los cuales 59,22 GB son pesos destinados a GPU y 28,80 GB son embeddings por capa (PLE) que permanecen en RAM de host.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización elástica con asignación diferenciada por bloques (NVFP4 en capas frontera, ATLAS3 a 3,5 bits por peso en el núcleo MoE, FP8 en capas densas) que permite ejecutar un modelo de 87.298 millones de parámetros reales en GPUs de 80–96 GB en modo `AllResident`, o en GPUs de 24–32 GB mediante caché por niveles de expertos. Por otro, el modelo solo es utilizable con el motor `atlas-ingine`, lo que limita su portabilidad frente a formatos estándar como GGUF o safetensors convencionales.

El checkpoint es solo texto (excluye el `mmproj` de visión del modelo base), está licenciado bajo Qwen Community License 1.0 y se publicó el 27 de noviembre de 2026. Su verificación se realizó íntegramente en una Tesla V100-PCIE-32GB, no en hardware Blackwell, lo que el propio autor señala como limitación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 512 expertos, top-10, Hyper-Connections de 4 vías, Per-Layer Embeddings solo en host) |
| Parámetros totales | 87.298.195.328 (87,3B según safetensors; el autor declara 177B en la model card) |
| Parámetros activos | no disponible (top-10 sobre 512 expertos; el autor no publica el recuento activo) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-ctx 8192`, no confirmado como máximo) |
| Tipos de cuantización | Elástica mixta: NVFP4 (capas frontera L0–1 y L46–47, embeddings, output, PLE), ATLAS3 a 3,5 b/w (núcleo MoE), FP8 (capas densas) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors elástico (49 shards GPU + 81 shards PLE host-only), con `atlas_elastic_manifest.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas, 512 expertos y enrutamiento top-10, e incorpora Hyper-Connections de 4 vías y Per-Layer Embeddings (PLE). El checkpoint `atlas-56g` no reentrena ni aplica RLHF/DPO: es una recuantización del GGUF `UD-Q6_K_XL` de `unsloth/Qwen3.8-Flash-Next-GGUF` (revisión `766911a6b7369840a91dbcd95f9f997acaab6cd6`, 158 GB), realizada con `tools/quantize_elastic_qwen4exp.py` del repositorio `Atlas3DSS/atlas-ingine`.

La innovación técnica está en la asignación de precisión por bloques y en la separación de los PLE. Los embeddings por capa (`per_layer_token_embd.weight`, matriz de 320.001.536 × 160) se cuantizan a NVFP4 y se mantienen exclusivamente en RAM de host vía mmap, de modo que no consumen VRAM. Los pesos de GPU se reparten en 49 shards (59,22 GB) y los PLE en 81 shards (28,80 GB). El motor soporta dos modos: `AllResident`, que carga todos los pesos de GPU en VRAM, y `TieredExpertCache`, que mantiene las capas densas residentes y cachea expertos por niveles. La integridad se garantiza con SHA-256 por shard en el manifiesto (hash `6be6f0b4ea6a5d031a22ed6c0fdbeedbf6bf6a7643f9e993964f34519d27ee0f`) y un `SHA256SUMS` para todos los ficheros.

## Capacidades

- Generación de texto conversacional y finalización de texto en inglés (verificado con la respuesta "The capital of France is Paris.").
- Razonamiento y conocimiento factual heredados del modelo base Qwen3.8-Flash-Next, aunque no se documentan evaluaciones específicas en esta ficha.
- Capacidad multilingüe: no documentada en la información disponible; los idiomas del checkpoint no se listan.
- Tool calling y function calling: no documentado explícitamente para este checkpoint, aunque el modelo base Qwen suele soportarlo; no confirmado.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Visión: excluida deliberadamente (el `mmproj` no se incluye); el checkpoint es solo texto.
- Servicio mediante API HTTP compatible con OpenAI a través de `ingine-serve`.
- Ejecución en GPUs de 24–32 GB mediante `TieredExpertCache`, y en 80–96 GB en modo `AllResident`.

## Casos de uso

- Despliegue de un MoE de gran tamaño en una única GPU de 80–96 GB: con `AllResident`, los 59,22 GB de pesos de GPU caben en una A100 80GB, H100 80GB o RTX PRO 6000, permitiendo servir el modelo sin paralelismo tensorial.
- Inferencia en estaciones de trabajo con 24–32 GB de VRAM: mediante `TieredExpertCache` (4,43 GiB de capas densas + caché de expertos), el modelo puede ejecutarse en una RTX 4090 o V100-32GB, a costa de throughput reducido (6,12 tok/s medidos en V100).
- Servicio de API compatible con OpenAI: `ingine-serve` expone un endpoint HTTP que facilita la integración en aplicaciones existentes que ya consumen la API de OpenAI, sin reescribir clientes.
- Investigación en cuantización elástica: el paquete sirve como referencia reproducible para estudiar el impacto de asignaciones de precisión mixtas (NVFP4/ATLAS3/FP8) sobre la paridad de logits frente a un oráculo FP32.
- Verificación de integridad en pipelines de producción: el manifiesto con SHA-256 por shard y el `SHA256SUMS` permiten validar la descarga antes de servir el modelo, útil en entornos con requisitos de cadena de suministro.
- Evaluación comparativa de precisión: el par de packs `atlas-70g` (todo NVFP4) y `atlas-56g` (mixto) permite medir el compromiso entre huella de VRAM (73,06 GB frente a 59,22 GB) y fidelidad (coseno 0,9757 frente a 0,9722) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de paridad de logits y velocidad de decodificación:

| Métrica | atlas-56g | atlas-70g | Oráculo FP32 (UD-Q6_K_XL) |
|---|---|---|---|
| Coseno vs oráculo (forward 48 capas) | 0,97220816 | 0,97572218 | 1,0 (referencia) |
| Top-1 coincidente | sí (`11751 = ' Paris'`) | sí | referencia |
| max_abs | 2,9486 | no disponible | referencia |
| RMSE | 0,5951 | no disponible | referencia |
| Decodificación greedy 8 tokens (V100, caché caliente) | 6,12 tok/s | 6,29 tok/s | no aplica |
| Tiempo de carga | 3,10 s | no disponible | no aplica |
| Prefill 5 tokens | 1,31 s | no disponible | no aplica |

El smoke test HTTP en V100 (`sm_70`) pasó con `model_family="qwen4exp"` y `finish_reason="stop"`. No hay medición de throughput real en SM120a (Blackwell) en modo `AllResident` para el modelo de 177B.

## Requisitos de hardware

- VRAM para inferencia: 59,22 GB de pesos de GPU en modo `AllResident`; 4,43 GiB de capas densas + 25,28 GiB de caché de expertos (9.819 slots) en modo `TieredExpertCache`. Los 28,80 GB de PLE residen en RAM de host y no consumen VRAM.
- GPU recomendadas en `AllResident`: A100 80GB, H100 80GB, RTX PRO 6000 (80–96 GB). El autor indica que el backend cubre arquitecturas `sm_86`, `sm_89` y `sm_120a` (RTX 30/40/50, A100, H100, PRO 6000).
- GPU para `TieredExpertCache`: 24–32 GB de VRAM, verificado en Tesla V100-PCIE-32GB (`sm_70`, CUDA 12.9 con preset `legacy-fp16`).
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) mediante `TieredExpertCache`, con throughput bajo; en RTX 3090/5090 de forma análoga, aunque no hay mediciones publicadas para esas tarjetas.
- Opciones de despliegue: exclusivamente `atlas-ingine` (`ingine-serve`, `ingine-bench`). No compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es safetensors elástico específico del motor.
- Latencia y throughput: 6,12 tok/s en decodificación greedy de 8 tokens sobre V100 con caché caliente; 3,10 s de carga y 1,31 s de prefill de 5 tokens. Sin datos para A100/H100/Blackwell.
- Paralelismo: el backend nativo `qwen4exp-cuda` solo soporta `INGINE_TP_SIZE=1` (una GPU); no hay soporte multi-GPU todavía.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-atlas-56g-ingine | 87,3B (declarado 177B) | no disponible | NVFP4 + ATLAS3 + FP8 | Qwen Community 1.0 | atlas-ingine |
| Qwen3.8-Flash-Next-atlas-70g-ingine | 87,3B (declarado 177B) | no disponible | NVFP4 + FP8 | Qwen Community 1.0 | atlas-ingine |
| Qwen/Qwen3.8-Flash-Next (base) | 177B | no disponible | FP16/BF16 (original) | Qwen Community 1.0 | múltiples |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-Q6_K_XL) | 177B | no disponible | GGUF Q6_K_XL (158 GB) | Qwen Community 1.0 | llama.cpp y derivados |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. Frente al GGUF de Unsloth, el pack `atlas-56g` reduce la huella de 158 GB a 88 GB totales (59,22 GB en GPU), a costa de requerir un motor propietario y de una pérdida de paridad medible (coseno 0,9722 frente al oráculo FP32).

## Limitaciones y advertencias

- Dependencia total de `atlas-ingine`: no se puede cargar en vLLM, llama.cpp, Ollama, TGI ni transformers estándar; la portabilidad es nula fuera del ecosistema Atlas3D.
- Sin soporte multi-GPU: `INGINE_TP_SIZE=1` únicamente; no se puede escalar con paralelismo tensorial.
- Throughput no medido en hardware moderno: todas las evaluaciones reales del modelo de 177B se hicieron en V100 (`sm_70`); no hay benchmark de `AllResident` en SM120a (Blackwell) con el modelo completo.
- Pérdida de fidelidad respecto al oráculo FP32: coseno 0,9722, `max_abs` 2,9486 y RMSE 0,5951 en el forward de 48 capas; puede degradar tareas sensibles a la precisión numérica.
- Perfil `atlas-42g` retenido: el autor excluye de publicación una variante de 2,5 bits (`ATLAS2`) porque empeoraba el top-1 en pruebas de completado factual, lo que sugiere que el límite inferior de cuantización segura está cerca del perfil publicado.
- Solo texto: la visión del modelo base queda excluida; no hay capacidades multimodales.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe del checkpoint.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base Qwen3.8-Flash-Next, sin evaluación publicada aquí.
- Licencia Qwen Community License 1.0: impone condiciones adicionales al uso comercial; es necesario revisar el texto completo en `LICENSE` antes de desplegar en producción.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación independiente por parte de la comunidad.
- Contexto máximo no confirmado: el ejemplo de servicio usa `--max-ctx 8192`, pero no se especifica si es el límite del modelo o una elección del autor.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Atlas3D/Qwen3.8-Flash-Next-atlas-56g-ingine
- Pack alternativo atlas-70g: https://huggingface.co/Atlas3D/Qwen3.8-Flash-Next-atlas-70g-ingine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio del motor: https://github.com/Atlas3DSS/atlas-ingine
- Licencia: https://huggingface.co/Atlas3D/Qwen3.8-Flash-Next-atlas-56g-ingine/blob/main/LICENSE
