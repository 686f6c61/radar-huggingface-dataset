# nchapman/Ornith-1.5-9B-Swift-1.5-LoRA

## Resumen

Ornith-1.5-9B-Swift-1.5-LoRA es un adaptador LoRA de rango 64 en BF16 que reproduce, sobre el modelo base `ornith-ai/Ornith-1.5-9B`, el post-entrenamiento de eficiencia de razonamiento aplicado en `ukisai/Swift-1.5-Ornith-9B`. Lo publica el usuario `nchapman` y su proposito es permitir aplicar el ajuste de Swift-1.5 sobre el modelo base original o sobre checkpoints cuantizados compatibles (W4A16-HGPTQ, W2.6A16-HGPTQ-RCO o GGUF en llama.cpp) sin necesidad de redistribuir los pesos completos del modelo ajustado.

El adaptador es de tipo PEFT con `r=64` y se distribuye en dos formatos: `adapter_model.safetensors` (160.432.128 parametros, unos 0,6 GB de repositorio) y un adaptador LoRA GGUF en F16 (`Ornith-1.5-9B-Swift-1.5-LoRA.gguf`) con arquitectura declarada `qwen35`. Cubre las 200 proyecciones lineales del modelo de lenguaje, dejando intactos los 333 tensores de la torre de vision (`model.visual.*`), los 15 tensores MTP nativos (`mtp.*`), embeddings y normas.

Su relevancia practica es doble: por un lado, demuestra que una descomposicion SVD de rango 64 recupera el delta de pesos de Swift-1.5 hasta el suelo de redondeo BF16 (96,26%-97,04% de pesos dentro de 1 ULP); por otro, permite servir el comportamiento de Swift-1.5 como modulo LoRA intercambiable en vLLM o llama.cpp sobre checkpoints ya cuantizados, lo que reduce el coste de almacenamiento y despliegue. El pipeline declarado es `image-text-to-text`, por lo que hereda la capacidad multimodal del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer hibrido multimodal con atencion lineal (GatedDeltaNet) y MTP nativo; arquitectura GGUF `qwen35` |
| Parametros totales | 160.432.128 (solo el adaptador) |
| Parametros activos | no disponible (el adaptador no es MoE; el modelo base no se especifica como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en BF16 (safetensors) y F16 (GGUF LoRA); el modelo base admite W4A16-HGPTQ, W2.6A16-HGPTQ-RCO y GGUF (Q4_K_M citado en el ejemplo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base MIT) |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador no entrena desde cero: se obtiene por descomposicion SVD de rango 64 del delta de pesos entre `ukisai/Swift-1.5-Ornith-9B` y `ornith-ai/Ornith-1.5-9B`. Segun la model card, Swift-1.5 se post-entreno con actualizaciones de bajo rango de rango 64 sobre las 200 proyecciones lineales del modelo de lenguaje, dejando sin tocar los 333 tensores de la torre de vision, los 15 tensores MTP, embeddings y normas. Esa estructura es la que permite que una SVD de rango 64 recupere el ajuste completo hasta el limite de redondeo BF16.

La reconstruccion se desglosa por familias de modulos: `self_attn` (32 modulos) captura el 76,87% de la energia SVD, con 83,03% de coincidencia BF16 exacta y 96,26% dentro de 1 ULP; `mlp` (96 modulos) captura el 77,77%, con 85,00% exacto y 97,04% dentro de 1 ULP; `linear_attn` (72 modulos) captura el 76,60%, con 84,03% exacto y 96,77% dentro de 1 ULP. El error relativo medio de Frobenius se situa entre 0,001161 y 0,001298. La presencia de `linear_attn` (con `in_proj_qkv`, `in_proj_z`, `out_proj`) y de tensores MTP apunta a una arquitectura hibrida con atencion lineal tipo GatedDeltaNet y decodificacion multi-token nativa, aunque la model card no detalla la composicion del dataset de entrenamiento original de Swift-1.5 ni el numero de tokens.

El adaptador GGUF incluye la permutacion de cabezas V de GatedDeltaNet aplicada a `attn_qkv`, `attn_gate` y `ssm_out`, un detalle tecnico necesario para que la conversion a llama.cpp sea correcta.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento eficiente en tokens (etiquetas `reasoning`, `efficient-thinking`, `token-efficient`).
- Capacidades multimodales de entrada imagen-texto (`pipeline_tag: image-text-to-text`), heredadas del modelo base; el adaptador no modifica la torre de vision.
- Razonamiento multi-paso y tareas de codigo y matematicas, segun los conjuntos de evaluacion citados (8 tareas de coding, math y reasoning).
- Conversacion multi-turno (`conversational`).
- Compatibilidad con tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Despliegue como modulo LoRA intercambiable en vLLM y como adaptador LoRA en llama.cpp, lo que permite alternar el comportamiento de Swift-1.5 sobre un mismo checkpoint base cuantizado.

## Casos de uso

- Servicio de razonamiento eficiente en produccion: cargar el adaptador sobre `Ornith-1.5-9B-W4A16-HGPTQ` en vLLM con `--enable-lora --max-lora-rank 64` permite ofrecer el comportamiento de Swift-1.5 con el ahorro de memoria de un checkpoint cuantizado a 4 bits, sin duplicar pesos completos.
- Despliegue en CPU o GPU de gama media con llama.cpp: usar `Ornith-1.5-9B-Q4_K_M.gguf` junto con el adaptador GGUF F16 mediante `llama-server --lora` hace viable el razonamiento eficiente en hardware sin soporte de PEFT nativo.
- A/B testing de estilos de razonamiento: al ser un modulo LoRA separable, se puede servir el modelo base y el adaptador en el mismo servidor vLLM y comparar respuestas por peticion, midiendo el impacto del modo de pensamiento eficiente en latencia y calidad.
- Evaluacion de tecnicas de eficiencia de tokens: util para investigadores que quieran medir cuantas tokens de cadena de pensamiento ahorra el post-entrenamiento de Swift-1.5 frente al base, manteniendo fijos el resto de factores.
- Pipelines de codigo y matematicas con verificacion: el adaptador se evaluo en tareas de coding, math y reasoning; puede integrarse en flujos donde el modelo genera soluciones y un verificador externo las valida, aprovechando la reduccion de tokens de razonamiento.
- Experimentacion multimodal ligera: como la torre de vision queda intacta, se puede combinar el adaptador con el base para tareas de imagen-texto y comprobar si el ajuste de razonamiento mejora la interpretacion de diagramas o capturas, sin reentrenar el encoder visual.
- Distribucion de ajustes sin redistribuir pesos: equipos que ya tienen el modelo base pueden publicar o compartir unicamente el adaptador de 0,6 GB, lo que simplifica la gestion de artefactos y el versionado de variantes.

## Benchmarks y rendimiento

La model card no incluye resultados en benchmarks academicos (MMLU, HumanEval, GSM8K). Si aporta una verificacion de forward pass de 32 capas en bfloat16 sobre 64 prompts (56 de `mlabonne/harmless_alpaca` `test[:56]` y 8 tareas de coding/math/reasoning) y 2560 tokens de trayectoria forzados por profesor generados por `ukisai/Swift-1.5-Ornith-9B`:

| Metrica | Base `Ornith-1.5-9B` | Base + `Swift-1.5-LoRA` (r=64) | Objetivo `Swift-1.5-Ornith-9B` |
|---|---:|---:|---:|
| Divergencia KL de trayectoria (2560 tokens) | 0,002265 nats | 0,000690 nats (3,3x menor) | 0,000000 nats |
| Acuerdo Top-1 de token con Swift-1.5 | 99,10% | 99,14% | 100,00% |
| Divergencia KL de prefill (64 prompts) | 0,000700 nats | 0,000373 nats (1,9x menor) | 0,000000 nats |
| Similitud coseno de logits con Swift-1.5 | 0,997164 | 0,999904 | 1,000000 |

| Familia de modulos | Modulos | Energia SVD (r=64) | Coincidencia BF16 exacta | Dentro de 1 ULP BF16 | Error relativo medio |
|---|---:|---:|---:|---:|---:|
| `self_attn` | 32 | 76,87% | 83,03% | 96,26% | 0,001161 |
| `mlp` | 96 | 77,77% | 85,00% | 97,04% | 0,001298 |
| `linear_attn` | 72 | 76,60% | 84,03% | 96,77% | 0,001261 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa unos 0,6 GB (160.432.128 parametros en BF16); la VRAM real la determina el modelo base de 9B sobre el que se aplique.
- Con el base en BF16, se necesitan aproximadamente 18-20 GB de VRAM solo para pesos, mas cache KV; encaja en A100 40/80 GB, H100 y, con cuantizacion, en RTX 4090 (24 GB) y RTX 3090.
- Con `Ornith-1.5-9B-W4A16-HGPTQ` el peso baja a unos 5-6 GB, lo que permite servir en GPUs consumer de 8-12 GB (RTX 4060 Ti 16 GB, RTX 4070, etc.), sumando cache KV y overhead de vLLM.
- Con `W2.6A16-HGPTQ-RCO` el peso se reduce aun mas (del orden de 3-4 GB), habilitando GPUs de 8 GB o menos, a costa de mayor degradacion por cuantizacion.
- En llama.cpp con `Q4_K_M` el modelo completo ronda los 5-6 GB, por lo que cabe en la mayoria de GPUs consumer y en CPU con suficiente RAM.
- Opciones de despliegue documentadas: vLLM con `--enable-lora --max-lora-rank 64 --lora-modules`; `transformers` + `peft` con `AutoModelForImageTextToText` y `PeftModel`; llama.cpp con `llama-server --lora -ngl 99`. TGI, Ollama y otros no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nchapman/Ornith-1.5-9B-Swift-1.5-LoRA` | 160,4 M (adaptador r=64) | no disponible | KL de trayectoria 0,000690 nats frente a Swift-1.5 | Apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| `ukisai/Swift-1.5-Ornith-9B` | 9B (modelo completo) | no disponible | Objetivo de referencia del adaptador (KL 0) | Apache-2.0 | Hugging Face |
| `ornith-ai/Ornith-1.5-9B` | 9B (modelo completo) | no disponible | Base sin ajuste de eficiencia (KL 0,002265 nats) | MIT | Hugging Face |
| `nchapman/Ornith-1.5-9B-W4A16-HGPTQ` | 9B cuantizado a 4 bits | no disponible | Checkpoint base compatible con el adaptador | no disponible | Hugging Face |

No se dispone de comparaciones con modelos de otros autores (por ejemplo, Qwen, Llama o Mistral de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere cargar `ornith-ai/Ornith-1.5-9B` o un checkpoint compatible; usarlo sobre otra variante puede degradar la fidelidad.
- La reconstruccion SVD no es exacta: entre el 2,96% y el 3,74% de los pesos quedan fuera del margen de 1 ULP BF16, y la energia SVD capturada ronda el 77%, por lo que hay diferencias residuales frente a `ukisai/Swift-1.5-Ornith-9B`.
- La evaluacion reportada se limita a divergencia KL, acuerdo Top-1 y similitud de logits; no hay evidencia publicada de mejora en benchmarks de tareas finales (MMLU, HumanEval, GSM8K), por lo que no se puede afirmar una ganancia de calidad medible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es inherente a los modelos generativos de 9B y no se mitiga con este adaptador.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue concreto.
- Longitud de contexto: no disponible; planificar el despliegue sin asumir una ventana especifica.
- La licencia del adaptador es Apache-2.0, pero el modelo base se declara MIT y el `license_link` apunta a un fichero LICENSE del repositorio de UkisAI; conviene verificar la cadena de licencias antes de uso comercial.
- El adaptador GGUF requiere aplicar la permutacion de cabezas V de GatedDeltaNet; usar una conversion propia sin ese paso producira resultados incorrectos.
- El repositorio tenia 0 descargas y 0 likes en el momento de la consulta y se creo el 17 de noviembre de 2026, por lo que carece de validacion independiente de la comunidad.
- El pipeline declarado es `image-text-to-text`, pero el adaptador solo modifica proyecciones del modelo de lenguaje; no se documenta ningun efecto sobre la calidad de la parte visual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Ornith-1.5-9B-Swift-1.5-LoRA
- Modelo fuente del ajuste: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Checkpoint cuantizado W4A16-HGPTQ: https://huggingface.co/nchapman/Ornith-1.5-9B-W4A16-HGPTQ
- Checkpoint cuantizado W2.6A16-HGPTQ-RCO: https://huggingface.co/nchapman/Ornith-1.5-9B-W2.6A16-HGPTQ-RCO
- Licencia referenciada: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B/blob/main/LICENSE
- Dataset de evaluacion citado: `mlabonne/harmless_alpaca` (split `test[:56]`), sin enlace directo en la informacion disponible
