# hossain0909/keural-sft3-50k

## Resumen

Keural-SFT3-50k es un modelo de lenguaje bilingüe coreano–inglés con arquitectura Mixture-of-Experts (MoE) entrenado desde cero (sin modelo base preexistente) por el usuario hossain0909. Se trata de un checkpoint intermedio de la tercera época de ajuste por instrucciones (SFT), correspondiente al paso 50.000 de 65.849 (76,4 % completado), entrenado sobre un dataset combinado bilingüe de 2,35 millones de muestras en formato ChatML. El modelo parte de un preentrenamiento propio de ~63B tokens y ha pasado por etapas de SFT, DPO y nuevas pasadas de SFT.

Su relevancia radica en la escasez de modelos MoE abiertos centrados en coreano: la mayoría de LLM abiertos priorizan el inglés, y Keural aborda explícitamente el bilingüismo coreano–inglés con un vocabulario propio de SentencePiece. Con 14,83B parámetros totales y ~7,42B activos por token, ofrece un equilibrio entre capacidad y coste de inferencia, comparable en cómputo activo a un modelo denso de 7B. El pipeline completo se entrenó en 2× NVIDIA H200 SXM con FSDP.

Cabe destacar que es un checkpoint intermedio de un proyecto en curso, no una versión final, y que la información publicada proviene íntegramente de la model card del autor, sin benchmarks independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixtral-style MoE (8 expertos, enrutamiento top-2), transformer causal |
| Parámetros totales | 14,83B (15.368.933.376 según safetensors) |
| Parámetros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

Detalles adicionales: 24 capas, hidden size 4096, 32 cabezas de atención con GQA (8 cabezas KV), dimensión de cabeza 128, tamaño intermedio de experto 5.632, vocabulario de 131.074 tokens (131.072 SPM + `<|im_start|>` + `<|im_end|>`), RoPE theta 500.000, ventana deslizante de 512 en capas alternas, RMSNorm (eps=1e-5), activación SiLU.

## Arquitectura y entrenamiento

Keural emplea una arquitectura MoE estilo Mixtral con 8 expertos y enrutamiento top-2 por token, lo que reduce el cómputo activo a aproximadamente la mitad de los parámetros totales. Incorpora GQA (Grouped Query Attention) con 8 cabezas KV frente a 32 cabezas de consulta, ventanas deslizantes de 512 tokens en capas alternas y RoPE con theta de 500.000. El tokenizador es SentencePiece con vocabulario propio de 131.072 tokens, ampliado con tokens especiales ChatML.

El entrenamiento se realizó íntegramente desde cero en 2× NVIDIA H200 SXM (139 GiB cada una) con FSDP FULL_SHARD, bfloat16 y gradient checkpointing. El pipeline consta de: preentrenamiento en dos etapas (~50B + ~13B tokens con corpus web coreano e inglés), SFT época 1 (1,14M muestras ChatML), DPO con 440K pares de preferencia coreanos, SFT época 2 (710K muestras, segunda pasada) y la época 3 de este checkpoint (2.351.212 muestras combinadas: ~81 % inglés de OpenHermes-2.5, SlimOrca, UltraChat, OpenOrca y Alpaca; ~19 % coreano de AIHub, KoInstruct, KoAlpaca). Los hiperparámetros de esta etapa incluyen learning rate con decay coseno de 1e-5 a 1e-6, batch efectivo de 64, max sequence length de 4.096, weight decay 0,05, clipping de gradiente 1,0 y optimizador AdamW. La pérdida de entrenamiento en el paso 50.000 es de ~2,01.

## Capacidades

- Generación de texto conversacional bilingüe coreano–inglés con formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Seguimiento de instrucciones tras tres épocas de SFT sobre 2,35M de muestras.
- Alineación de preferencias mediante una ronda de DPO con 440K pares coreanos.
- Cambio de idioma según el idioma del usuario (prompt de sistema recomendado al efecto).
- Capacidad multilingüe limitada a coreano e inglés; no hay datos de otros idiomas.
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo ha sido entrenado con diálogos multisesión de AIHub (conversación diaria, social, científica), adecuado para chatbots que mantienen turnos múltiples en coreano.
- Traducción y asistencia bilingüe coreano–inglés: el doble corpus y el vocabulario propio permiten tareas de cambio de código y asistencia a hablantes coreanos que trabajan en inglés.
- Atención al cliente automatizada en coreano: con 4.096 tokens de contexto puede gestionar conversaciones multi-turno de longitud moderada integrándose vía API compatible con OpenAI a través de vLLM.
- Generación y explicación de contenido técnico en coreano: las muestras de KoInstruct y KoAlpaca cubren preguntas y respuestas instructivas en coreano.
- Prototipado de agentes de texto en coreano: aunque no hay tool calling documentado, el formato ChatML y la API de vLLM permiten integrarlo en pipelines de orquestación por prompting.
- Investigación sobre MoE y entrenamiento desde cero: al publicarse checkpoints de todas las etapas (preentrenamiento, SFT, DPO), es útil como caso de estudio reproducible de pipelines de entrenamiento completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único indicador de entrenamiento es la pérdida de ~2,01 en el paso 50.000 de la época 3 de SFT, que no es comparable directamente con benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~31 GB solo de pesos (el repo ocupa 30,7 GB), más KV cache y sobrecarga; en la práctica se recomienda una GPU de 40 GB o superior, o dos GPUs de 24 GB con paralelismo.
- GPU recomendadas: A100 40/80 GB, H100, H200 (hardware usado en el entrenamiento). En consumer, una RTX 4090 de 24 GB no aloja los pesos completos en bfloat16; sería necesaria cuantización (no publicada oficialmente) o offloading.
- No cabe en GPUs consumer de 24 GB en precisión nativa; con cuantización a 4 bits (no disponible oficialmente) ocuparía ~8-9 GB y cabría en RTX 3090/4090.
- Despliegue: vLLM (método recomendado por el autor, con servidor compatible con la API de OpenAI) y `transformers` con `device_map="auto"`. No hay soporte documentado de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Al activar ~7,42B parámetros por token, el coste de cómputo es comparable al de un modelo denso de ~7B.
- Nota crítica: al generar, debe fijarse `eos_token_id=131073` (`<|im_end|>`); usar el ID 2 provocaría generaciones que no se detienen correctamente.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Keural-SFT3-50k | 14,83B | ~7,42B | 4.096 | ko, en | Apache 2.0 |
| Mixtral 8x7B Instruct | 46,7B | ~12,9B | 32.768 | Multilingüe (incl. ko débil) | Apache 2.0 |
| Qwen2.5-14B-Instruct | 14,8B (denso) | 14,8B | 32.768+ | Multilingüe fuerte en ko | Apache 2.0 (algunas variantes) |
| EXAONE-3.5-7.8B-Instruct | 7,8B (denso) | 7,8B | 32.768 | ko, en | Restringida (no comercial) |

Keural se diferencia por su enfoque específico en coreano con MoE de cómputo activo reducido y licencia totalmente permisiva, aunque sus 4.096 tokens de contexto y la ausencia de benchmarks publicados lo sitúan por detrás de alternativas más maduras en contexto y rendimiento verificado.

## Limitaciones y advertencias

- Checkpoint intermedio (76,4 % de la época 3 de SFT): la calidad puede mejorar en el checkpoint final y no representa un release estable.
- No hay benchmarks públicos ni evaluaciones independientes; el rendimiento real en tareas estándar es desconocido.
- Ventana de contexto de solo 4.096 tokens, muy limitada frente a la práctica actual (32K–128K en modelos comparables).
- Composición del dataset con ~81 % de inglés en SFT pese a ser un modelo "coreano primario", lo que puede desequilibrar la calidad entre idiomas.
- Riesgo de alucinación: no evaluado; al ser un modelo entrenado desde cero con ~63B tokens de preentrenamiento, es plausible que tenga más alucinaciones y menos conocimiento factual que modelos entrenados con billones de tokens.
- Sesgos: heredados de corpus web y datasets de instrucciones (OpenOrca, SlimOrca, AIHub), sin auditoría documentada.
- Sin soporte documentado de tool calling, visión, audio ni agentes.
- Cuantización no publicada oficialmente, lo que limita el despliegue en hardware consumer.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero al incluir `custom_code` en los tags conviene revisar el código del repo antes de producción.
- El `eos_token_id` correcto (131073) difiere del estándar; un error aquí rompe la generación en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/keural-sft3-50k
- Modelo base (preentrenamiento): https://huggingface.co/mkd-hossain/keural-pretrained
- Checkpoints previos mencionados en la model card: mkd-hossain/keural-sft-18k, mkd-hossain/keural-dpo-final, mkd-hossain/keural-sft2, mkd-hossain/keural-sft3-40k
- Paper: no disponible
- Repositorio de código adicional o demo: no disponible
