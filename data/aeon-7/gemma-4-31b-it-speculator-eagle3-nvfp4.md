# AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4

## Resumen

`AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4` es un modelo borrador (drafter) para decodificación especulativa EAGLE-3, cuantizado en NVFP4 a partir de `RedHatAI/gemma-4-31B-it-speculator.eagle3`. No es un modelo generativo autónomo: es un componente auxiliar que acelera la inferencia del verificador Gemma 4 31B (denso) prediciendo varios tokens por paso, que el verificador valida en paralelo. Lo publica AEON-7, un desarrollador independiente que trabaja sobre el ecosistema vLLM y el hardware Blackwell.

La relevancia práctica está en el ahorro de memoria y el rendimiento: reduce el drafter de BF16 (~4,5 GB) a aproximadamente 1,5 GB, un factor de 3×, y acelera cada paso de borrador unas 1,5× en GPUs Blackwell con tensor cores FP4 nativos. En un DGX Spark (GB10) el autor reporta una mejora de 2,0-2,5× en tiempo de reloj de un solo flujo sobre cargas de chat, comparado con inferencia sin decodificación especulativa.

El modelo tiene 2.235.355.392 parámetros (2,24 mil millones), muy por debajo de los 31B del verificador, y hereda el tokenizador y la arquitectura de verificación de Gemma 4. La licencia es Apache 2.0, la misma del modelo base, y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 speculator (drafter) sobre transformer; config `Eagle3SpeculatorConfig` con `custom_code` |
| Parametros totales | 2.235.355.392 (2,24 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del verificador Gemma 4 31B) |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 + escalas FP8 por bloque de 16 + escalas FP32 por tensor); calibración con ModelOpt `NVFP4_DEFAULT_CFG` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (~1,5 GB), más `config.json`, `config.py`, tokenizador y `hf_quant_config.json` |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE-3, una arquitectura de decodificación especulativa que predice secuencias de tokens candidatos a partir de los estados ocultos del verificador. EAGLE-3 combina la información de capas auxiliares del modelo objetivo con los `input_ids` para generar borradores; el verificador Gemma 4 31B valida esos tokens en una sola pasada, de modo que la distribución de salida final es la del verificador, no la del drafter. El repositorio incluye una clase `Eagle3SpeculatorConfig` propia que requiere `trust_remote_code=True`.

La cuantización se realizó con NVIDIA ModelOpt 0.43.0rc2.dev sobre una RTX PRO 6000 Blackwell (96 GB). Se excluyeron de la cuantización `lm_head`, `embed_tokens` y `d2t` (mapa de vocabulario). La calibración usó 256 conversaciones de `HuggingFaceH4/ultrachat_200k` (split `train_sft`) en modo realista: primero se ejecutó el verificador NVFP4 y se capturaron los estados ocultos auxiliares en las capas indicadas por `eagle_aux_hidden_state_layer_ids`, que se alimentaron al drafter junto con los `input_ids`. El tamaño de bloque es 16, el estándar de NVFP4.

## Capacidades

- Generación de tokens borrador para decodificación especulativa EAGLE-3; no produce texto final por sí mismo.
- Aceleración de inferencia del verificador Gemma 4 31B (base, instruct, NVFP4 o fine-tunes), ya que los drafters EAGLE están ligados a la arquitectura, no a los pesos.
- Compatible con `num_speculative_tokens` configurable (el autor usa 3 en el ejemplo de vLLM; las cifras de aceptación se publican con k=5).
- Soporte de caché KV en FP8, chunked prefill y prefix caching en vLLM.
- Ejecución en hardware Blackwell con kernels FlashInfer CUTLASS y NVFP4 de VLLM_CUTLASS.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de chat de baja latencia en DGX Spark: el autor reporta 2,0-2,5× de mejora en tiempo de reloj de un solo flujo sobre cargas de chat, lo que lo hace adecuado para asistentes interactivos en hardware GB10 con memoria unificada de 128 GB.
- Servicio de Gemma 4 31B en producción con vLLM: se integra mediante `--speculative-config` con `method: eagle3` y reduce el coste por token generado al aumentar los tokens aceptados por paso de verificación.
- Sustitución directa del drafter BF16: al ocupar ~1,5 GB frente a ~4,5 GB, libera memoria para el verificador, la caché KV o un mayor `max-num-seqs` en la misma GPU.
- Fine-tunes de dominio sobre Gemma 4 31B: al estar ligado a la arquitectura y no a los pesos, puede acompañar a variantes abliterated o ajustadas por dominio sin reentrenar el drafter.
- Pipelines con prefix caching: útil en cargas con prompts largos y repetidos (RAG, summarization) donde el prefijo se reutiliza y la decodificación especulativa aporta sobre la fase de generación.
- Evaluación comparativa de cuantización: sirve como caso de estudio de pérdida de aceptación por cuantización NVFP4 (8-12% frente a BF16) en entornos de investigación sobre decodificación especulativa.

## Benchmarks y rendimiento

El autor publica longitudes de aceptación medias (tokens aceptados por paso) frente al drafter BF16 de RedHat, con k=5. Las cifras NVFP4 son estimaciones del autor, no medidas publicadas:

| Dataset | BF16 (k=5) | NVFP4 (estimación, k=5) |
|---|---|---|
| HumanEval | 3,80 | ~3,40 |
| math_reasoning | 3,93 | ~3,50 |
| qa | 2,38 | ~2,20 |
| MT-bench | 2,83 | ~2,60 |
| RAG | 2,80 | ~2,60 |
| summarization | 2,20 | ~2,05 |
| translation | 2,68 | ~2,45 |

La pérdida de aceptación estimada es del 8-12% frente a BF16. No se han publicado resultados de benchmarks de calidad del verificador (MMLU, GSM8K u otros) en la información disponible, ya que el drafter no altera la distribución de salida del verificador.

## Requisitos de hardware

- VRAM del drafter: ~1,5 GB en NVFP4 (frente a ~4,5 GB en BF16).
- VRAM total: la del verificador Gemma 4 31B más la del drafter; con verificador NVFP4 y caché KV en FP8 el conjunto es viable en GPUs de 24-48 GB según longitud de contexto y número de secuencias.
- GPU recomendadas: Blackwell con tensor cores FP4 nativos, como RTX PRO 6000 Blackwell (96 GB, usada para la calibración) y DGX Spark GB10 (sm 12.1, 128 GB de memoria unificada). El repositorio está etiquetado para `sm_121a`.
- GPU de consumo: no hay confirmación de funcionamiento en RTX 4090 u otras arquitecturas Ada; los kernels NVFP4 y FlashInfer CUTLASS del autor apuntan a Blackwell.
- Despliegue: vLLM con `--speculative-config`, `--kv-cache-dtype fp8`, `--enable-chunked-prefill` y `--enable-prefix-caching`; imagen `ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4:latest` para DGX Spark. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Rendimiento: 2,0-2,5× de speedup en tiempo de reloj de un solo flujo en DGX Spark sobre cargas de chat; ~1,5× más rápido por paso de borrador en Blackwell frente al BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4 | 2,24 B | NVFP4 (~1,5 GB) | No disponible | Apache 2.0 | Objeto de esta ficha; drafter EAGLE-3 para Gemma 4 31B |
| RedHatAI/gemma-4-31B-it-speculator.eagle3 | 2,24 B | BF16 (~4,5 GB) | No disponible | Apache 2.0 | Fuente BF16; mayor aceptación, mayor huella de memoria |
| RedHatAI/gemma-4-31B-it-NVFP4 | 31 B | NVFP4 | No disponible | Apache 2.0 | Verificador objetivo, no un drafter; se usa junto al modelo de esta ficha |

No se dispone de información sobre otros drafters EAGLE-3 cuantizados en NVFP4 para comparar directamente.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere un verificador Gemma 4 31B denso y no puede usarse solo para generar texto.
- La cuantización NVFP4 reduce la aceptación un 8-12% estimado frente a BF16; las cifras NVFP4 de la tabla son estimaciones del autor, no medidas publicadas.
- Dependencia de hardware: los kernels y el rendimiento declarado asumen Blackwell (sm 12.1); el comportamiento en Ada, Hopper u otras arquitecturas no está documentado.
- Requiere `trust_remote_code=True` por la clase `Eagle3SpeculatorConfig` incluida en el repositorio, lo que implica ejecutar código del autor.
- Idioma declarado únicamente inglés; el comportamiento multilingüe no está evaluado.
- Riesgo de alucinación: heredado del verificador, no del drafter, ya que la distribución de salida es la del modelo verificado.
- Sesgos: no documentados en la información disponible; dependen del verificador Gemma 4 y de los datos de calibración (`ultrachat_200k`).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del verificador y del modelo base RedHat que se utilicen conjuntamente.
- El repositorio incluye material promocional y de financiación del autor; no afecta al uso técnico, pero conviene separarlo de la documentación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4
- Drafter BF16 de origen: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.eagle3
- Verificador NVFP4: https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4
- Paper EAGLE-3: https://arxiv.org/abs/2503.01840
- Librería Speculators: https://github.com/vllm-project/speculators
- Imagen de despliegue para DGX Spark: ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4:latest
- Otro drafter del autor (DFlash2): https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
