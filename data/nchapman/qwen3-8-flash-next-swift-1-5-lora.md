# nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA

## Resumen

`nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA` es un adaptador LoRA de rango 32 en BF16 que reproduce, sobre el modelo base `Qwen/Qwen3.8-Flash-Next`, las mejoras de post-entrenamiento del checkpoint completo `ukisai/Swift1.5-Qwen3.8-Flash-Next` (un modelo de aproximadamente 360 GB). El adaptador pesa unos 310 MB (`adapter_model.safetensors`) y se distribuye también como GGUF F16 para `llama.cpp`. Lo publica el usuario nchapman bajo la licencia Swift Open License 1.0.

El interés técnico del artefacto es su hallazgo arquitectónico: tras inspeccionar los 1658 tensores del checkpoint Swift-1.5 frente al base, el autor concluye que el 97 % del peso (los 512 expertos enrutados, las puertas del router, los pesos de hyper-connection, la torre de visión, los embeddings y el `lm_head`) es bit a bit idéntico al modelo original. Solo 300 proyecciones `nn.Linear` 2D de las 48 capas fueron modificadas, y esas modificaciones admiten una factorización LoRA de rango intrínseco 32 con un salto claro en el espectro de valores singulares entre el componente 32 y el 33.

Esto convierte lo que en origen es un modelo de cientos de gigabytes en un delta de 310 MB que, según las mediciones del autor en H100 NVL, recupera entre el 96,1 % y el 97,3 % de los pesos BF16 modificados con un error de como máximo 1 ULP, y reduce la divergencia KL respecto al objetivo de 0,015688 a 0,003185 nats (4,9 veces menor) en decodificación autorregresiva. Es relevante ahora porque permite servir el comportamiento de Swift-1.5 sobre el base (o sobre una versión cuantizada del mismo) con `vLLM --enable-lora` o `llama.cpp`, sin necesidad de alojar el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 32 sobre transformer híbrido Qwen3.8-Flash-Next: 48 capas con atención completa (`self_attn`), atención lineal (`linear_attn`, GatedDeltaNet) y MoE con 512 expertos enrutados más experto compartido |
| Parametros totales | 60.948.480 (adaptador LoRA); el modelo base Qwen3.8-Flash-Next no declara cifra en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se publica en BF16 (safetensors) y en GGUF F16; el modelo base admite cuantizaciones GGUF (el ejemplo de la model card usa `unsloth/Qwen3.8-Flash-Next-GGUF:UD-IQ4_XS`) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (modelo base Qwen3.8-Flash-Next: Apache-2.0) |
| Formato de pesos | safetensors (PEFT, BF16) y GGUF F16 (`Qwen3.8-Flash-Next-Swift-1.5-LoRA.gguf`, `general.architecture = "qwen4exp"`) |

## Arquitectura y entrenamiento

El adaptador no entrena desde cero: es una descomposición SVD de rango 32 de las diferencias de pesos entre `ukisai/Swift1.5-Qwen3.8-Flash-Next` y `Qwen/Qwen3.8-Flash-Next`. Las 300 matrices 2D afectadas son las proyecciones `self_attn.{q,k,v,o}_proj` (48 módulos), `linear_attn.{in_proj_qkv,in_proj_z,out_proj}` (108 módulos) y `mlp.shared_expert.{gate,up,down}_proj` (144 módulos). La energía SVD capturada con r=32 es del 91,06 % en `self_attn`, 98,12 % en el MLP compartido y 89,80 % en la atención lineal, con un error relativo medio de Frobenius en torno a 0,00083.

El modelo base sobre el que se aplica es un transformer híbrido con atención lineal GatedDeltaNet, mezcla de expertos con 512 expertos enrutados y mecanismos de hyper-connection entre atención y MLP; también incorpora torre de visión (pipeline `image-text-to-text`). El adaptador GGUF incluye la permutación de cabezas V de GatedDeltaNet aplicada a `attn_qkv`, `attn_gate` y `ssm_out`, lo que permite cargarlo en `llama.cpp` sobre el base cuantizado. No se detallan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO en la fase original de Swift-1.5.

## Capacidades

- Generación de texto conversacional multi-turno sobre el modelo base Qwen3.8-Flash-Next.
- Razonamiento con modo de pensamiento eficiente (etiquetas `reasoning`, `efficient-thinking`, `token-efficient`): el objetivo declarado es reducir tokens de razonamiento manteniendo calidad.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`) heredado de la torre de visión del modelo base.
- Razonamiento matemático y de código: la verificación incluyó 8 tareas de coding, matemáticas y razonamiento además de 56 prompts de `mlabonne/harmless_alpaca`.
- Compatibilidad nativa con `vLLM` (`--enable-lora`, `--max-lora-rank 32`), `transformers` + `peft` y `llama.cpp` (`llama-server --lora`).
- Soporte de tool calling y de agentes: no confirmado explícitamente en la información disponible; depende de las capacidades del modelo base.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de Swift-1.5 sin alojar 360 GB: cargar el adaptador de 310 MB sobre `Qwen/Qwen3.8-Flash-Next` en `vLLM` con `--enable-lora` permite servir el comportamiento post-entrenado de Swift-1.5 con una huella de disco mínima y sin duplicar los pesos del base.
- Servicio multi-tenant con un solo base: al ser un LoRA de rango 32, `vLLM` puede mantener varias variantes (base y Swift-1.5) sobre la misma instancia y enrutar peticiones por módulo LoRA, lo que reduce el coste de GPU por modelo servido.
- Inferencia en hardware de consumo con `llama.cpp`: el GGUF F16 del adaptador se carga sobre una cuantización del base (por ejemplo `UD-IQ4_XS`) con `-ngl 99`, lo que hace viable probar el comportamiento Swift-1.5 en una estación de trabajo con GPU consumer.
- Reducción de coste por token en pipelines de razonamiento: el objetivo declarado de eficiencia de tokens encaja en flujos de agentes y cadenas de razonamiento donde el coste dominante es el número de tokens generados; conviene validar la ganancia real con la propia carga de trabajo.
- Evaluación y comparación de checkpoints: al reproducir el 99,21 % de acuerdo top-1 con Swift-1.5 en la verificación del autor, sirve para estudios de destilación de deltas de pesos y para auditar cuánta capacidad de un post-entrenamiento vive en proyecciones 2D de rango bajo.
- Prototipado de asistentes multimodal: al heredar la torre de visión del base, puede usarse en demos de image-text-to-text con el comportamiento de razonamiento de Swift-1.5, siempre que se valide la calidad multimodal, no medida en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una verificación de fidelidad del adaptador frente al checkpoint objetivo, medida en BF16 sobre 48 capas en una NVIDIA H100 NVL con 64 prompts (56 de `mlabonne/harmless_alpaca` `test[:56]` y 8 tareas de coding, matemáticas y razonamiento; 1528 posiciones de token):

| Metrica | Base Qwen3.8-Flash-Next | Base + Swift-1.5-LoRA (r=32) | Objetivo Swift-1.5 |
|---|---:|---:|---:|
| Divergencia KL en todos los tokens (1528 tokens) | 0,015688 nats | 0,003185 nats (4,9x menor) | 0,000000 nats |
| Acuerdo top-1 en todos los tokens | 97,38 % | 99,21 % | 100,00 % |
| Divergencia KL en prefill (64 prompts) | 0,002246 nats | 0,000071 nats (31,7x menor) | 0,000000 nats |
| Acuerdo top-1 en prefill | 100,00 % | 100,00 % | 100,00 % |
| Similitud coseno de logits | 0,994068 | 0,999001 | 1,000000 |

Reconstrucción espectral y de pesos BF16 con r=32:

| Familia de modulos | Modulos | Energia SVD capturada | Coincidencia BF16 exacta | Dentro de <= 1 ULP | Error relativo medio |
|---|---:|---:|---:|---:|---:|
| `self_attn` (q, k, v, o) | 48 | 91,06 % | 83,28 % | 96,22 % | 0,000828 |
| `shared_mlp` (gate, up, down) | 144 | 98,12 % | 83,69 % | 96,11 % | 0,000845 |
| `linear_attn` (in_proj_qkv, in_proj_z, out_proj) | 108 | 89,80 % | 86,39 % | 97,32 % | 0,000829 |

## Requisitos de hardware

- VRAM del adaptador: despreciable, 310 MB en BF16; el coste real lo determina el modelo base Qwen3.8-Flash-Next.
- VRAM del base: no disponible en la información proporcionada; el checkpoint completo de Swift-1.5 se cita con 360 GB, de los cuales 354 GB son los expertos enrutados, lo que da una idea del orden de magnitud del base en BF16.
- GPU recomendadas: la verificación del autor se ejecutó en una NVIDIA H100 NVL; para servir el base en BF16 se requiere un nodo multi-GPU de clase H100/A100. En consumer, solo es viable con el base cuantizado en GGUF.
- GPU consumer: sí, mediante `llama.cpp` con el base en cuantización baja (el ejemplo de la model card usa `UD-IQ4_XS`) y el adaptador GGUF F16; no se especifican modelos concretos ni VRAM mínima.
- Despliegue: `vLLM` (`--enable-lora --max-lora-rank 32 --lora-modules swift-1.5=...`), `transformers` + `peft` (`PeftModel.from_pretrained` sobre `AutoModelForImageTextToText`) y `llama.cpp` (`llama-server -hf ... --lora ... -ngl 99`).
- Latencia y throughput: no disponibles. El adaptador añade un coste de cómputo marginal por la multiplicación de las matrices de bajo rango en 300 proyecciones; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA | LoRA r=32 sobre Qwen3.8-Flash-Next | 60.948.480 (adaptador) | no disponible | swift-open-license-1.0 | Hugging Face, safetensors + GGUF |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | Checkpoint completo post-entrenado | no disponible (checkpoint de ~360 GB) | no disponible | swift-open-license-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next | Modelo base MoE híbrido con visión | no disponible | no disponible | Apache-2.0 | Hugging Face; GGUF vía `unsloth/Qwen3.8-Flash-Next-GGUF` |

La comparativa de rendimiento frente a alternativas de la misma categoría no está disponible: no hay benchmarks estándar publicados para ninguno de los tres en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere cargar `Qwen/Qwen3.8-Flash-Next` (o una cuantización del mismo) y aplicar el LoRA encima; sin el base no genera nada.
- La fidelidad medida es del 99,21 % de acuerdo top-1 y 0,003185 nats de KL, no una igualdad exacta con Swift-1.5; en dominios fuera de la muestra de evaluación (56 prompts de Alpaca más 8 tareas) la divergencia puede ser mayor.
- La verificación se hizo en BF16 sobre H100 NVL; el comportamiento al aplicar el LoRA sobre bases cuantizados (GGUF IQ4_XS y similares) no está medido en la model card.
- La licencia es Swift Open License 1.0, no Apache-2.0: es distinta de la del base y hay que revisar sus términos antes de uso comercial. El enlace de licencia apunta al repositorio de UkisAI.
- Riesgo de alucinación, sesgos y comportamiento en idiomas distintos del inglés: no documentados; la lista de idiomas soportados no está disponible.
- El pipeline declarado es `image-text-to-text`, pero no se aportan métricas de calidad multimodal; no conviene asumir que las mejoras de razonamiento se trasladan a la torre de visión, que según el análisis permanece bit a bit idéntica al base.
- El repositorio tiene 197 descargas y 0 likes en el momento de la ficha, sin validación independiente de las mediciones del autor.
- No se confirman capacidades de tool calling ni de agentes multi-paso; dependen del base y deben probarse antes de integrarlas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint objetivo Swift-1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia Swift Open License 1.0: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- GGUF del modelo base citado en la model card: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Dataset de evaluación citado: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- PEFT: https://github.com/huggingface/peft
- vLLM (soporte LoRA): https://docs.vllm.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
