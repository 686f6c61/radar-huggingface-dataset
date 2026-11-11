# hletrd/Arete-27B-Tensix-BFP4

## Resumen

Arete-27B-Tensix-BFP4 es una cuantizacion del modelo NousResearch/Arete-27B, un ajuste fino supervisado de Qwen/Qwen3.8-27B realizado por Nous Research. La version que nos ocupa la publica el usuario hletrd (Xylolabs) y su proposito no es otro que adaptar el modelo al hardware de inferencia de Tenstorrent, en concreto a sus NPU con arquitectura Tensix (Wormhole y Blackhole). Para ello, las capas lineales se redondean a `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits) mediante GPTQ, mientras que la cabeza LM se redondea a `ttnn.bfloat8_b` (BFP8).

El modelo conserva la arquitectura hibrida del Qwen3.8-27B original, con 16 capas de atencion clasica y 48 capas de Gated DeltaNet, ademas de 64 capas MLP, y un total de 27.356.728.560 parametros. La cuantizacion deja el checkpoint en 17,60 GB empaquetados, con 5,23 bits por peso de media, lo que lo hace manejable para el subsistema de memoria de las NPU Tensix. Es relevante porque demuestra un flujo de cuantizacion especifico para hardware no-GPU, con verificacion de empaquetado exacto en TT-NN.

La licencia es Apache 2.0, heredada del modelo base, y los pesos se distribuyen en safetensors en bf16, aunque cada valor ya esta alineado a la rejilla BFP4/BFP8 para que TT-NN los empaquete sin redondeo adicional. El modelo no esta afiliado ni respaldado por Tenstorrent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de atencion (q, k, v, o) + 48 capas Gated DeltaNet (q, k, v, z, a, b, output) + 64 capas MLP |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en capas lineales; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en LM head; bf16 en embeddings, normas, `visual` y resto de tensores. Media: 5,23 bits/peso |
| Idiomas soportados | no disponible (la calibracion uso texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a rejilla BFP4/BFP8) |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es un ajuste fino supervisado de Qwen/Qwen3.8-27B. La arquitectura combina atencion clasica en 16 capas con 48 capas de Gated DeltaNet, un mecanismo de estado recurrente lineal, mas 64 capas MLP. Esta mezcla busca reducir el coste computacional de la atencion en contextos largos manteniendo capacidad expresiva. El checkpoint incluye un modulo `visual` en bf16, lo que sugiere capacidades de entrada imagen-texto, aunque la model card indica que solo se cuantizo y evaluo el modelo de lenguaje.

La cuantizacion se realizo con GPTQ y busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los tensores BFP4 se redondearon con GPTQ; los BFP8, por redondeo al vecino mas cercano. El resultado son ficheros bf16 cuyos valores ya descansan sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin volver a redondear. Se incluyen scripts `pack_tensix.py` y `verify_grid.py` para comprobar que ninguna matriz cambia al empaquetar, y un fichero `quant4.json` que detalla el formato de cada proyeccion. El autor indica que el modelo se probo con ttnn 0.81.1 sobre ttsim (simulador Blackhole), no sobre hardware real.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat (`apply_chat_template`).
- Razonamiento con modo "thinking" activable, segun la evaluacion del autor (7 prompts de razonamiento repetidos con thinking on).
- Capacidades multimodales de entrada imagen-texto, heredadas del modulo `visual` en bf16 (no cuantizado ni evaluado en esta version).
- Generacion de codigo y matematicas: no se documentan explicitamente en la model card, aunque el modelo base Qwen3.8-27B las cubre; no disponible como dato verificado en esta ficha.
- Soporte multilingue: no disponible; la calibracion uso ingles y coreano.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Despliegue en NPU Tensix mediante TT-NN y el demo `qwen38_27b_qb2` de tt-metal.

## Casos de uso

- Inferencia en NPU Tenstorrent: el caso principal. El checkpoint esta disenado para ejecutarse en Wormhole y Blackhole mediante TT-NN, con el demo `qwen38_27b_qb2` de tt-metal v0.81.1 en cuatro chips Blackhole (QuietBox 2). Adecuado para equipos que ya operan hardware Tenstorrent y quieren un LLM de 27B sin GPU.
- Evaluacion de cuantizacion BFP4: util como referencia para medir la perdida de fidelidad frente a BF16 (KL medio 0,02909, top-1 92,24 %) y comparar con Q4_K_M de llama.cpp.
- Investigacion en formatos block floating point: permite estudiar como se comporta GPTQ con rejilla BFP4 y exponente por bloque en una arquitectura hibrida con Gated DeltaNet.
- Prototipado en simulador: el flujo con ttsim permite validar empaquetado y correccion numerica antes de disponer de hardware fisico.
- Despliegue conversacional en entornos con NPU: la plantilla de chat y el modo thinking lo hacen apto para asistentes de texto, siempre que se valide en hardware real.
- Sustitucion de BF16 en pipelines de bajo consumo: con 17,60 GB empaquetados frente a 53,79 GB en BF16, reduce requisitos de memoria en el acelerador.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea.

| Modelo | Bits/peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (NousResearch/Arete-27B) | 16 | 53,79 | 0 | 100 | 40 de 40 | - |
| **Arete-27B-Tensix-BFP4** | 5,23 | 17,596 | 0,02909 | 92,24 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,92 | 16,547 | 0,02036 | 93,47 | 40 de 40 | 0 |

La KL y el top-1 cubren 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas son 33 prompts cortos con comprobacion automatica mas 7 de razonamiento repetidos con thinking on (40 en total). El criterio del autor era un KL medio como maximo 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional; se cumplio (1,43 veces, 0 perdidas frente a 0). No se midio velocidad en dispositivo.

## Requisitos de hardware

- VRAM/DRAM estimada: 17,60 GB empaquetados en BFP4/BFP8; el repo ocupa 54,7 GB por incluir tambien tensores bf16.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole). El demo `qwen38_27b_qb2` requiere cuatro chips Blackhole (QuietBox 2) en paralelo de tensores y rechaza otro hardware.
- GPU: no es el destino del checkpoint; puede cargarse con `transformers` en bf16 (`dtype="bfloat16"`, `device_map="auto"`), lo que exige memoria para los tensores bf16, no para el tamano empaquetado.
- Cabe en GPU de consumo: no disponible como dato verificado; en bf16 serian necesarios del orden de 54 GB, por encima de una RTX 4090.
- Despliegue: TT-NN (ttnn 0.81.1), tt-metal con el demo `qwen38_27b_qb2`, tt-forge (tt-xla, no probado con este checkpoint) y `transformers` para carga en CPU/GPU.
- Latencia y throughput: no medidos; el autor indica explicitamente que no se midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Tensix-BFP4 | 27,36 B | no disponible | BFP4/BFP8 (5,23 bits) | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B (BF16) | 27,36 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 27,36 B | no disponible | 4,92 bits | Apache 2.0 | Generado localmente |
| Qwen/Qwen3.8-27B (modelo origen) | no disponible | no disponible | bf16 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; el modulo `visual` queda en bf16 y no se valido.
- El checkpoint se probo con ttnn 0.81.1 sobre ttsim (simulador Blackhole), no sobre hardware fisico. El demo en QuietBox 2 no se ejecuto con este checkpoint; solo se verifico el empaquetado exacto de las capas 0 y 3 usando el export de Qwen3.8-27B con el mismo layout.
- tt-transformers no soporta esta arquitectura; es necesario usar el demo de tt-metal.
- Con `QWEN_PRECISION_CONFIG` por defecto, el `config/precision.json` del demo volveria a redondear la cabeza a bfloat4_b; hay que fijar `baseline`.
- Los benchmarks miden cercania a BF16, no calidad de tarea; una KL baja no garantiza buen rendimiento en tareas concretas.
- No hay datos de sesgos, alucinacion ni cobertura idiomatica en la informacion disponible.
- No se midio latencia ni throughput; el rendimiento real en NPU esta sin documentar.
- Licencia Apache 2.0 permite uso comercial, pero se distribuye "as is", sin garantia; los cambios se listan en `NOTICE`.
- El autor no esta afiliado ni respaldado por Tenstorrent.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Arete-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo origen: https://huggingface.co/Qwen/Qwen3.8-27B
- Demo tt-metal qwen38_27b_qb2 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Revision BF16 de referencia: https://huggingface.co/NousResearch/Arete-27B/tree/108f0afbdcfaa1ceeda4a635004304dfff6d4da2
