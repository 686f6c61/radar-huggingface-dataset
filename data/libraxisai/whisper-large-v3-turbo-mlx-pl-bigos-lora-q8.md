# LibraxisAI/whisper-large-v3-turbo-mlx-PL-BIGOS-LoRA-q8

## Resumen

`whisper-large-v3-turbo-mlx-PL-BIGOS-LoRA-q8` es un checkpoint de reconocimiento automatico del habla (ASR) experimental publicado por LibraxisAI. Se construye fusionando el adaptador LoRA PEFT de dominio medico polaco `AleksanderObuchowski/whisper-large-v3-turbo-med-pl-lora-r64-enc-dec-lr2e-04-ep5-whisper_bigos_all_fair` sobre el checkpoint base cuantizado `LibraxisAI/whisper-large-v3-turbo-mlx-q8`, que a su vez deriva de `openai/whisper-large-v3-turbo`. El resultado se re-cuantiza en formato MLX affine de 8 bits con `group_size: 32` para ejecucion sobre Apple Silicon (Metal).

El modelo hereda la arquitectura Whisper large-v3-turbo: 128 bins mel, 32 capas de encoder y 4 capas de decoder, con un vocabulario de 51.866 tokens. El adaptador LoRA tenia rango `r = 64` y `alpha = 128` (escala 2.0) aplicado sobre 192 proyecciones de encoder y decoder (`q_proj`, `k_proj`, `v_proj`, `fc1`, `fc2`). El autor reporta para el adaptador upstream un WER del 12,69% y un CER del 4,34% en su split de evaluacion.

La relevancia de esta ficha es doble: por un lado documenta un caso de estudio de fusion y cuantizacion de LoRA sobre Whisper en el ecosistema MLX; por otro, el propio autor advierte de que el checkpoint presenta compromisos de dominio (alucinaciones clinicas en silencio, degradacion en numerales aislados) que lo desaconsejan para dictado generalista. Esta pensado para benchmarking de dominio polaco (`x9eval`), experimentos ASR medico y comparacion en ensembles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), 128 bins mel, 32 capas de encoder, 4 capas de decoder |
| Parametros totales | no disponible (pesos cuantizados de 913.684.263 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | MLX affine, `bits: 8`, `group_size: 32` (Q8); existe variante hermana GPTQ-Hessian Q4 |
| Idiomas soportados | pl, en, multilingue (herencia de Whisper large-v3-turbo) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX affine), `weights.safetensors` de 913,7 MB |
| Vocabulario | 51.866 tokens |
| Tamano del repo | 0,9 GB |
| Libreria | transformers (inferencia via `mlx_whisper`) |
| Hardware objetivo | Apple Silicon (Metal) |

## Arquitectura y entrenamiento

La base es Whisper large-v3-turbo, un transformer encoder-decoder con 32 capas de encoder y solo 4 de decoder, diseno que reduce coste de decodificacion frente a large-v3 completo manteniendo la profundidad del encoder. El adaptador fusionado es un LoRA de rango 64 y alpha 128 sobre 192 proyecciones (`q_proj`, `k_proj`, `v_proj`, `fc1`, `fc2`) del encoder y del decoder. El adaptador upstream fue entrenado sobre dictado medico polaco combinado con corpus BIGOS, con 5 epocas y tasa de aprendizaje 2e-04.

El proceso de fusion es tecnicamente explicito en la model card: se des-cuantizan los pesos base Q8 agrupados a FP32, se calcula `W' = W_base + (alpha/r) * B * A` en FP32, se castea a FP16 y se re-cuantizan las proyecciones modificadas a MLX affine (`bits = 8`, `group_size = 32`). Los tensores no objetivo (`decoder.token_embedding`, proyecciones `*.out`, `encoder.conv1/conv2`, parametros LayerNorm, `positional_embedding`, `alignment_heads`) se preservan bit a bit respecto al checkpoint base. No se documenta entrenamiento adicional con RLHF ni DPO; el ajuste proviene exclusivamente del LoRA heredado.

## Capacidades

- Transcripcion de voz a texto (ASR) en polaco e ingles, con herencia multilingue de Whisper large-v3-turbo.
- Reconocimiento reforzado en dominio medico polaco y corpus BIGOS gracias al LoRA fusionado.
- Mejora observada en arranques suaves de frase en polaco: recupera conjunciones iniciales tenues como "Ale" que el checkpoint base descarta.
- Decodificacion greedy con `language="pl"` validada en Apple Silicon via `x9stt` / `mlx_whisper`.
- Ejecucion local en Metal con pesos de 8 bits, sin dependencia de GPU NVIDIA.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso (no aplica a un modelo ASR).
- No se documenta salida con marcas de tiempo mas alla de las nativas de Whisper.

## Casos de uso

- Benchmarking de dominio polaco (`x9eval`): el checkpoint esta pensado explicitamente como referencia para medir ASR medico polaco frente a los checkpoints base Q8 y GPTQ-Hessian Q4 de LibraxisAI.
- Experimentos ASR clinico en polaco: dictado medico con vocabulario especializado, siempre con VAD estricto aguas arriba para evitar alucinaciones en silencio.
- Comparacion en ensembles: al preservar bit a bit los tensores no objetivo, permite aislar el efecto del LoRA en estudios controlados de fusion.
- Prototipado local en Apple Silicon: 913,7 MB de pesos permiten ejecutar transcripcion en portatiles Mac con Metal sin GPU dedicada.
- Investigacion de fusion LoRA sobre modelos cuantizados: la model card documenta la aritmetica exacta (des-cuantizar a FP32, fusionar, castear a FP16, re-cuantizar), util como receta reproducible.
- Evaluacion de robustez ante code-switching polaco-ingles: el autor documenta comportamiento diferencial en comandos tecnicos mixtos frente al base.
- No recomendado para dictado generalista polaco-ingles en produccion; para ese fin el autor remite a `whisper-large-v3-turbo-mlx-q8` o `whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4`.

## Benchmarks y rendimiento

El autor no publica una tabla de benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a ASR). Reporta el WER y CER del adaptador upstream y una comparacion cualitativa de cuatro casos en Apple Silicon Metal con decodificacion greedy (`language="pl"`):

| Metrica | Valor |
|---|---|
| WER del adaptador upstream | 12,69% |
| CER del adaptador upstream | 4,34% |
| Split de evaluacion | upstream del LoRA (no especificado en detalle) |

| Caso de prueba | mlx-q8 (base) | mlx-GPTQ-Hessian-q4 | **PL-BIGOS-LoRA-q8** |
|---|---|---|---|
| Frase PL + EN con arranque suave | Pierde "Ale" inicial, conserva "computer use" | Pierde "Ale" inicial, conserva "computer use" | Recupera "Ale" y conserva "computer use" |
| Comando tecnico PL + EN | Exacto ("...na kanale 7.") | Exacto ("...na kanale 7.") | Inserta "w tej chwili" e inflecta "7 → siódmym" |
| Numerales polacos aislados (5× "pięć") | Exacto | Exacto | Degrada ("Panci Pansci Pansci.") |
| Clip casi silencioso sin VAD | Cierre generico de Whisper ("Dziękuję za uwagę.") | Cierre generico ("Dziękuje za uwagę.") | Alucinacion medica ("Wskazana kontrola w poradni kardiologicznej...") |

No se han publicado resultados de benchmarks estandar adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: los pesos ocupan 913,7 MB en disco; en ejecucion MLX Q8 con `group_size: 32` el consumo es del orden de 1-2 GB, dependiendo de buffers de activacion y longitud de audio.
- Hardware objetivo: Apple Silicon (Metal). Probado por el autor via `x9stt` / `mlx_whisper`.
- GPU NVIDIA: no es el objetivo del checkpoint; para ese ecosistema existen variantes GPTQ-Hessian Q4 del mismo autor.
- Cabe en cualquier Mac con Apple Silicon (M1 en adelante) con memoria unificada suficiente; no requiere GPU dedicada.
- Opciones de despliegue: `mlx_whisper` (Python) es la via documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| **LibraxisAI/whisper-large-v3-turbo-mlx-PL-BIGOS-LoRA-q8** | no disponible (913,7 MB en Q8) | 30 s (Whisper) | MLX affine Q8 | MIT | LoRA medico PL + BIGOS fusionado; alucinaciones clinicas en silencio |
| LibraxisAI/whisper-large-v3-turbo-mlx-q8 | no disponible | 30 s (Whisper) | MLX affine Q8 | MIT | Base sin LoRA; recomendado por el autor para dictado generalista |
| LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4 | no disponible | 30 s (Whisper) | GPTQ-Hessian Q4 | MIT | Alternativa cuantizada a 4 bits; recomendada para dictado generalista |
| openai/whisper-large-v3-turbo | 809 M (aprox., large-v3-turbo) | 30 s (Whisper) | safetensors FP16 | MIT (pesos) | Modelo original de OpenAI; sin especializacion en polaco medico |

## Limitaciones y advertencias

- Alucinaciones clinicas en silencio o ruido de baja SNR: sin VAD estricto aguas arriba, segmentos casi silenciosos pueden generar frases fluidas de alta medica polaca (p. ej. "Wskazana kontrola w poradni kardiologicznej...").
- Degradacion en numerales aislados: la prueba de 5× "pięć" produce "Panci Pansci Pansci." frente a la salida exacta de los checkpoints base.
- Inflexion incorrecta en comandos tecnicos: inserta "w tej chwili" y convierte "7" en "siódmym" donde el base era exacto.
- No recomendado por el propio autor para dictado generalista polaco-ingles en produccion; usar `whisper-large-v3-turbo-mlx-q8` o `whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4`.
- Dependencia de hardware Apple Silicon: el formato MLX affine no es portable directamente a GPUs NVIDIA ni a stacks CUDA.
- Licencia MIT permite uso comercial, pero las advertencias de alucinacion clinica hacen arriesgado su uso en entornos medicos sin validacion humana y VAD.
- `inference: false` en la model card: no esta configurado como endpoint de inferencia listo en el Hub.
- Sin datos publicados de latencia, throughput ni evaluacion estandar de sesgos; el checkpoint es experimental y con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-PL-BIGOS-LoRA-q8
- Checkpoint base MLX Q8: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Variante GPTQ-Hessian Q4: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-GPTQ-Hessian-q4
- Adaptador LoRA upstream: https://huggingface.co/AleksanderObuchowski/whisper-large-v3-turbo-med-pl-lora-r64-enc-dec-lr2e-04-ep5-whisper_bigos_all_fair
- Modelo original: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio `mlx_whisper`: no disponible en la informacion proporcionada
- Paper de Whisper: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
