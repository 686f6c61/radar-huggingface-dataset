# hletrd/Cosmos3-Nano-Text-Tensix-BFP4

## Resumen

Cosmos3-Nano-Text-Tensix-BFP4 es una cuantización del torre de texto del modelo nvidia/Cosmos3-Nano, publicada por el usuario hletrd (Xylolabs) para su ejecución en NPUs Tensix de Tenstorrent (Wormhole y Blackhole). Se trata de una conversión de las capas lineales a formato block-floating-point de 4 bits (`ttnn.bfloat4_b`, BFP4), realizada mediante GPTQ, mientras que el resto de tensores (embedding, LM head, normas) permanecen en bf16. El resultado es un checkpoint de 8.190.735.360 parámetros con un peso medio de 6,25 bits por parámetro y un tamaño empaquetado de 6,40 GB.

El modelo conserva únicamente la torre de comprensión de Cosmos3-Nano (embedding, 36 capas y LM head), con los tensores renombrados al esquema de Qwen3 para que cargue como `Qwen3ForCausalLM` en transformers. Quedan fuera el codificador de visión, el VAE de vídeo, el tokenizador de audio y la torre de generación del modelo original. Es, por tanto, un modelo exclusivamente de texto.

Su relevancia es doble: por un lado, demuestra un flujo de cuantización BFP4 orientado a hardware Tenstorrent con verificación bit a bit de la rejilla de cuantización; por otro, ofrece una alternativa de 6,25 bits por peso que, según la evaluación del autor, mantiene una KL media de 0,03028 frente a bf16 y acierta 30 de 33 respuestas cortas, frente a 31 de 33 del modelo original. La licencia es openmdw-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), 36 capas |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso) en q/k/v/o y gate/up/down; bf16 en LM head, embedding y normas; media de 6,25 bits por peso |
| Idiomas soportados | no disponible (evaluación en inglés y coreano) |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP4), índice `model.safetensors.index.json`, metadatos en `quant4.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 36 capas procedente de la torre de texto de nvidia/Cosmos3-Nano, con los tensores renombrados para que transformers lo cargue como `Qwen3ForCausalLM`. No se ha entrenado un modelo nuevo: se parte de los pesos de NVIDIA y se aplica una cuantización post-entrenamiento.

La cuantización de las proyecciones de atención (q, k, v, o) y de las capas MLP (gate, up, down) se realizó con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los ficheros resultantes están en bf16, pero cada valor ya se sitúa exactamente sobre la rejilla BFP4, de modo que TT-NN puede empaquetarlos sin un redondeo adicional. El autor incluye scripts (`pack_tensix.py` y `verify_grid.py`) para comprobar que el empaquetado en `ttnn.bfloat4_b` preserva los valores bit a bit, y señala que los mismos valores también empaquetan exactamente en `ttnn.bfloat8_b`.

## Capacidades

- Generación de texto conversacional, con plantilla de chat de NVIDIA cargada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas cortas en inglés y coreano (idiomas usados en la calibración y evaluación).
- Carga directa en transformers como `Qwen3ForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`.
- Ejecución en NPUs Tensix mediante TT-NN (tt-metal v0.81.1) y en tt-forge (tt-xla) en bf16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o vídeo: no incluidas (se eliminan el codificador de visión, el VAE de vídeo y el tokenizador de audio).
- Modo "thinking" o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está pensado para ejecutarse en NPUs Wormhole y Blackhole mediante TT-NN, con las capas lineales en BFP4 y el resto en bf16, lo que reduce el peso a 6,40 GB frente a los 16,38 GB en bf16.
- Investigación en cuantización BFP4: los scripts de verificación permiten comprobar que el empaquetado en `ttnn.bfloat4_b` no altera los valores, útil para validar pipelines de cuantización sobre otras arquitecturas.
- Evaluación de fidelidad de cuantización: el autor publica métricas de KL y top-1 frente a bf16, lo que permite comparar esta conversión con alternativas como Q4_K_M de llama.cpp en tareas de texto.
- Generación de texto en inglés y coreano: la calibración y la evaluación cubren ambos idiomas, por lo que es adecuado para prototipos de chat o completado en esos idiomas.
- Prototipado con transformers: al cargar como `Qwen3ForCausalLM`, puede integrarse en pipelines existentes de Hugging Face sin cambios de código específicos.
- Pruebas en simulador: el autor lo ha validado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), lo que permite desarrollar y depurar sin hardware físico.
- Comparación de backends: sirve para contrastar TT-NN (BFP4 exacto) frente a tt-forge (bf16 por defecto) en cuanto a fidelidad y rendimiento.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (nvidia/Cosmos3-Nano) | 16 | 16,38 | 0 | 100 | 31 de 33 | - |
| **Este modelo (BFP4)** | 6,25 | 6,397 | 0,03028 | 91,37 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,90 | 5,028 | 0,03370 | 91,26 | 31 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.272 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint empaquetado ocupa 6,40 GB; en bf16 (carga por defecto en transformers) requiere aproximadamente 16,4 GB.
- GPU recomendadas: no se especifican GPU concretas; el modelo está orientado a NPUs Tensix de Tenstorrent (Wormhole y Blackhole).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; los 16,4 GB en bf16 quedarían fuera de GPUs de 8-12 GB, y los 6,40 GB empaquetados requerirían un backend que soporte BFP4.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), TT-NN / tt-metal v0.81.1 (tt-transformers) y tt-forge (tt-xla, `pjrt-plugin-tt==1.4.0`).
- Latencia y throughput: no disponibles. El autor solo indica que se ha probado en ttsim (simulador de Blackhole), no en hardware real, y que tt-forge no se ha ejecutado de extremo a extremo.
- Nota de ejecución en TT-NN: es necesario pasar `--use_hf_rope`; sin esta opción, el QKV fusionado se re-redondea. El demo empaqueta el LM head en bfloat8_b, por lo que la cabeza no es exacta en ese caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Cosmos3-Nano-Text-Tensix-BFP4** | 8,19 B | no disponible | BFP4 (6,25 bits/peso) | openmdw-1.1 | Hugging Face (hletrd) |
| nvidia/Cosmos3-Nano (bf16) | 8,19 B (torre de texto) | no disponible | bf16 (16 bits/peso) | openmdw-1.1 | Hugging Face (nvidia) |
| Q4_K_M de llama.cpp (sobre el mismo modelo) | 8,19 B | no disponible | 4,90 bits/peso | openmdw-1.1 | Conversión de la comunidad |

La comparación se limita al mismo modelo base en distintas precisiones, ya que no se dispone de datos de modelos alternativos de tamaño y tarea equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Modelo solo de texto: no incluye visión, vídeo ni audio, a diferencia de Cosmos3-Nano completo.
- No se ha ejecutado en hardware Tensix real; la validación se hizo en el simulador ttsim y no se ha probado tt-forge de extremo a extremo.
- La cuantización BFP4 introduce una pérdida medible: KL media de 0,03028 y top-1 del 91,37 % frente a bf16, con una respuesta menos acertada de 33.
- El tokenizador es el de NVIDIA y transformers advierte sobre su expresión regular; debe cargarse tal como lo hace el pipeline de NVIDIA.
- El demo de TT-NN empaqueta el LM head en bfloat8_b, por lo que la cabeza no es exacta en esa configuración.
- La opción `bfp_bf4` de tt-forge re-redondea los pesos con un diseño de bloque distinto; para 4,5 bits reales debe usarse tt-transformers.
- Licencia openmdw-1.1: deben revisarse los términos antes de uso comercial; la model card la etiqueta como "other".
- No hay información sobre sesgos, riesgo de alucinación ni idiomas soportados más allá de la evaluación en inglés y coreano.
- El autor no está afiliado ni respaldado por Tenstorrent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Cosmos3-Nano-Text-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Revisión concreta del modelo base usada: https://huggingface.co/nvidia/Cosmos3-Nano/tree/cec9d585b8e12e5aae0d6508aea94b1f25a35b46
- Repositorio tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
- Índice de paquetes de Tenstorrent para tt-forge: https://pypi.eng.aws.tenstorrent.com/
