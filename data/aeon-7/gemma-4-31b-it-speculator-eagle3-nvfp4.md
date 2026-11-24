# AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4

## Resumen

`AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4` es un modelo borrador (drafter) para decodificación especulativa del tipo EAGLE-3, cuantizado en NVFP4. No es un modelo generativo autónomo: se acopla a un verificador Gemma 4 31B denso (en cualquiera de sus variantes: base, instruct, NVFP4 o fine-tunes) para acelerar la inferencia prediciendo varios tokens por paso, que el verificador valida en paralelo. Lo publica AEON-7 como derivado cuantizado del speculator oficial de Red Hat AI / Neural Magic (`RedHatAI/gemma-4-31B-it-speculator.eagle3`).

La relevancia práctica está en el binomio tamaño-velocidad: la cuantización NVFP4 reduce el drafter de unos 4,5 GB a aproximadamente 1,5 GB (3× menos) y acelera cada paso de borrador unas 1,5× en hardware Blackwell con tensor cores FP4 nativos. En un DGX Spark (GB10, sm_121a) el autor reporta una mejora de 2,0-2,5× en tiempo de pared a un solo stream sobre cargas de chat, frente a inferencia sin decodificación especulativa.

El modelo tiene 2.235.355.392 parámetros reales (según safetensors), licencia Apache 2.0 y solo soporte declarado para inglés. Está pensado para despliegues en vLLM sobre Grace Blackwell y requiere `trust_remote_code=True` por su clase de configuración personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 speculator (drafter) sobre transformer; configuración `Eagle3SpeculatorConfig` con `custom_code` |
| Parametros totales | 2.235.355.392 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 con escalas FP8 por bloque de 16 y escalas FP32 por tensor); excluidos `lm_head`, `embed_tokens` y `d2t` |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~1,5 GB) + `modelopt_state.pt` para re-exportación |

## Arquitectura y entrenamiento

El modelo es un drafter EAGLE-3, una cabeza predictiva que se entrena para anticipar los siguientes tokens ocultos del verificador. En lugar de generar texto de forma independiente, consume los estados ocultos auxiliares del verificador (capturados en las capas indicadas por `eagle_aux_hidden_state_layer_ids`) junto con los `input_ids`, y propone una secuencia de tokens candidatos. El verificador Gemma 4 31B los valida en un solo paso forward, de modo que la distribución de salida es la del verificador, no la del drafter.

La cuantización se realizó con NVIDIA ModelOpt `NVFP4_DEFAULT_CFG` (calibración máxima, sin AWQ), con tamaño de bloque 16, calibración realista sobre 256 conversaciones de `HuggingFaceH4/ultrachat_200k` (split `train_sft`) y ejecutando primero el verificador NVFP4 para capturar los estados ocultos auxiliares. El hardware de calibración fue una NVIDIA RTX PRO 6000 Blackwell (96 GB) con modelopt 0.43.0rc2.dev (PRs #1264 y #1265 fusionados). No se detalla el volumen de tokens de entrenamiento del drafter original ni la composición completa del dataset más allá de la muestra de calibración.

## Capacidades

- Decodificación especulativa EAGLE-3: propone varios tokens por paso (`num_speculative_tokens`, típicamente 3-5) para que el verificador los valide en paralelo.
- Aceleración de inferencia del verificador Gemma 4 31B denso sin alterar su distribución de salida.
- Compatibilidad con cualquier variante de Gemma 4 31B como verificador (base, instruct, NVFP4, fine-tunes como abliterated o domain-tuned), ya que los drafters EAGLE están ligados a la arquitectura, no a los pesos.
- Integración con vLLM mediante `--speculative-config` con `method: eagle3`.
- Compatibilidad con `--kv-cache-dtype fp8`, `--enable-chunked-prefill` y `--enable-prefix-caching`.
- Soporte de `trust_remote_code=True` para cargar la clase de configuración personalizada.
- No soporta tool calling, agentes, visión ni audio por sí mismo: esas capacidades dependen del verificador.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Servicio de chat en DGX Spark: desplegar el verificador Gemma 4 31B NVFP4 con este drafter en vLLM para obtener 2,0-2,5× de speedup en tiempo de pared a un solo stream, ideal para asistentes conversacionales en hardware de borde con memoria unificada de 128 GB.
- Reducción de latencia en APIs de generación de texto: al proponer 3 tokens por paso y validarlos en un único forward, se recorta el tiempo por token percibido en respuestas largas, manteniendo la calidad del verificador.
- Despliegue en clústeres con GPUs Blackwell (RTX PRO 6000, GB10): aprovechar los tensor cores FP4 nativos para acelerar cada paso de borrador aproximadamente 1,5× frente al drafter BF16.
- Sustitución directa del drafter BF16: el modelo es drop-in replacement del speculator de Red Hat, con 3× menos huella de memoria (4,5 GB a ~1,5 GB), lo que libera VRAM para el verificador o para mayor `max-num-seqs`.
- Inferencia con caché de prefijo y chunked prefill: útil en aplicaciones RAG donde se reutiliza un contexto documental largo entre consultas, combinando prefix caching con decodificación especulativa.
- Experimentación con fine-tunes de Gemma 4 31B: al estar ligado a la arquitectura y no a los pesos, permite acelerar variantes abliterated o ajustadas a dominio sin reentrenar el drafter.
- Evaluación de pipelines de decodificación especulativa: servir como referencia para medir la pérdida de aceptación (8-12% frente a BF16) y su compensación por velocidad en hardware FP4.

## Benchmarks y rendimiento

Longitudes de aceptación publicadas por el autor (k=5), comparando el drafter BF16 de Red Hat con la estimación para esta versión NVFP4:

| Dataset | BF16 (k=5) | NVFP4 (estimación, k=5) |
|---|---|---|
| HumanEval | 3,80 | ~3,40 |
| math_reasoning | 3,93 | ~3,50 |
| qa | 2,38 | ~2,20 |
| MT-bench | 2,83 | ~2,60 |
| RAG | 2,80 | ~2,60 |
| summarization | 2,20 | ~2,05 |
| translation | 2,68 | ~2,45 |

Los valores NVFP4 son estimaciones del autor, no mediciones publicadas. La pérdida de aceptación frente a BF16 se sitúa en el rango del 8-12%, compensada por la aceleración por paso en hardware Blackwell. En DGX Spark (GB10) el autor reporta 2,0-2,5× de speedup en tiempo de pared a un solo stream sobre cargas de chat, frente a inferencia sin decodificación especulativa. No se han publicado resultados de benchmarks de calidad del verificador en esta ficha.

## Requisitos de hardware

- VRAM del drafter: aproximadamente 1,5 GB en NVFP4 (frente a ~4,5 GB en BF16).
- VRAM total: la del verificador Gemma 4 31B NVFP4 más ~1,5 GB del drafter; el verificador en NVFP4 requiere del orden de 16-20 GB, por lo que un total de ~20-24 GB es un punto de partida razonable (estimación, no dato publicado).
- GPUs recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) para calibración y desarrollo; NVIDIA DGX Spark (GB10, sm_121a, 128 GB de memoria unificada) para despliegue validado; cualquier GPU Blackwell con soporte FP4.
- Cabe en GPU de consumo: sí, en RTX 5090 y sucesoras con tensor cores FP4, siempre que se disponga de VRAM suficiente para verificador y drafter juntos; en GPUs Ampere o Ada no se aprovecha la aceleración FP4 nativa.
- Opciones de despliegue: vLLM con `--speculative-config` y `method: eagle3`; imagen `ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4:latest` (eugr nightly con FlashInfer CUTLASS compilado para sm_120 y kernels NVFP4 de VLLM_CUTLASS) para DGX Spark.
- Latencia y throughput: 2,0-2,5× de speedup en tiempo de pared a un solo stream en DGX Spark sobre cargas de chat; ~1,5× más rápido por paso de borrador en Blackwell frente a BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4 | 2,24 B | NVFP4 | no disponible | Apache 2.0 | Hugging Face, 340 descargas |
| RedHatAI/gemma-4-31B-it-speculator.eagle3 | no disponible | BF16 | no disponible | Apache 2.0 | Hugging Face (modelo base) |
| RedHatAI/gemma-4-31B-it-NVFP4 | 31 B (verificador) | NVFP4 | no disponible | Apache 2.0 | Hugging Face (verificador recomendado) |

La comparación relevante es contra el drafter BF16 del que deriva: misma arquitectura EAGLE-3 y mismo verificador, con 3× menos tamaño, ~1,5× más velocidad por paso en Blackwell y una pérdida de aceptación del 8-12%. Frente a alternativas de decodificación especulativa de otros autores no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona como drafter: no genera texto de forma autónoma ni sustituye al verificador Gemma 4 31B.
- Ligado a la arquitectura Gemma 4 31B densa; no es compatible con otras familias o tamaños sin reentrenamiento.
- Pérdida de aceptación del 8-12% frente al drafter BF16, con estimaciones no verificadas empíricamente por terceros.
- Solo declara soporte de inglés; el rendimiento multilingüe no está documentado.
- Requiere `trust_remote_code=True` por la clase `Eagle3SpeculatorConfig`, lo que implica ejecutar código del repositorio.
- La aceleración depende de hardware Blackwell con FP4 nativo; en GPUs sin tensor cores FP4 la ventaja frente a BF16 puede desaparecer o invertirse.
- Riesgo de alucinación heredado del verificador, no del drafter; la distribución de salida es la del verificador.
- Sesgos heredados del modelo base Gemma 4 y de los datos de calibración (`ultrachat_200k`).
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y del verificador utilizado.
- La model card incluye enlaces de monetización (LotusMake) ajenos al contenido técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/gemma-4-31B-it-speculator.eagle3-NVFP4
- Drafter BF16 de origen: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.eagle3
- Verificador NVFP4 recomendado: https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4
- Paper EAGLE-3: https://arxiv.org/abs/2503.01840
- Librería Speculators: https://github.com/vllm-project/speculators
- Imagen de despliegue para DGX Spark: ghcr.io/aeon-7/vllm-spark-gemma4-nvfp4:latest
- Soporte del autor: https://lotusmake.com/c/aeon-forge
