# hletrd/gemma-4-E2B-it-Tensix-BFP8

## Resumen

`hletrd/gemma-4-E2B-it-Tensix-BFP8` es una cuantización del modelo multimodal `google/gemma-4-E2B-it` de Google, publicada por el usuario hletrd (Xylolabs) y orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 en su variante E2B (aproximadamente 5.530 millones de parámetros reales según los pesos en safetensors) y aplica GPTQ para redondear las capas lineales de atención y MLP al formato de coma flotante por bloques `bfloat8_b` (BFP8) que TT-NN empaqueta de forma nativa.

La relevancia de esta ficha es doble. Por un lado, demuestra un flujo de cuantización específico para hardware acelerador no-GPU (Tensix), donde el formato de destino no es un entero de 4 u 8 bits sino un formato de bloque con exponente compartido que el compilador de TT-Metal consume sin re-redondeo. Por otro, publica una evaluación comparativa frente a BF16 y frente a Q4_K_M de llama.cpp usando divergencia KL y top-1 sobre posiciones de texto en inglés y coreano, lo que permite cuantificar la pérdida de fidelidad de forma más fina que un benchmark de exactitud aislado.

El resultado declarado es una media de 13,01 bits por peso, un tamaño empaquetado de 7,556 GB y una KL media de 0,00239 frente a BF16, con un top-1 del 98,29 %. Solo se cuantificó y evaluó la parte lingüística; las torres de visión y audio permanecen en bf16 sin cambios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) derivado de Gemma 4 E2B; capas lineales de atención y MLP cuantizadas a BFP8 |
| Parámetros totales | 5.525.831.235 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`bfloat8_b`) en q, k, v, o y gate, up, down de 35 capas; bf16 en LM head, embeddings, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower`; media de 13,01 bits por peso |
| Idiomas soportados | no disponible (la calibración usó WikiText-2 y Wikipedia en coreano; la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, con valores ya alineados a la rejilla BFP8); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, un transformer multimodal con pipeline `any-to-any` que integra torres de visión y audio junto al modelo de lenguaje. Esta publicación no reentrena el modelo: aplica GPTQ sobre las proyecciones lineales del lenguaje para redondearlas a la rejilla `ttnn.bfloat8_b`, un formato de coma flotante por bloques en el que cada bloque comparte exponente. Las 35 capas afectadas cubren atención (q, k, v, o) y MLP (gate, up, down). El resto de tensores —embeddings, LM head atado al embedding, normas y todos los módulos de visión y audio— se mantienen en bf16 exactamente como en el checkpoint original.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los ficheros se distribuyen en bf16, pero cada valor ya está situado en la rejilla BFP8, de modo que TT-NN empaqueta los pesos sin un segundo redondeo. El autor incluye scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que comprueban que el empaquetado no altera ningún valor, y documenta una entrada de `precision_overrides.json` para el demo de Gemma 4 de tt-metal v0.81.1 que empaqueta atención y MLP compartido en `bfp8` de forma exacta, incluyendo las proyecciones fusionadas q|k|v y gate|up (verificado en las dos primeras capas). Las pruebas se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, no sobre hardware físico.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento multimodal de entrada imagen-texto y audio-texto, ya que las torres de visión y audio se conservan íntegras en bf16.
- Salida any-to-any según el pipeline declarado, aunque la evaluación publicada se limita al modelo de lenguaje.
- Razonamiento con modo "thinking" activable: siete de las cuarenta preguntas de evaluación se repitieron con thinking activado.
- Capacidades multilingües al menos en inglés y coreano, idiomas presentes en calibración y evaluación.
- Compatibilidad con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) y con el ecosistema TT-NN/TT-Metal para despliegue en Tensix.
- Soporte de tool calling, function calling y comportamiento agente: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el formato BFP8 está pensado para que TT-NN cargue los pesos sin re-redondeo, lo que permite servir el modelo en aceleradores Tensix con una fidelidad cercana a BF16 (KL media de 0,00239) y un peso empaquetado de 7,556 GB.
- Evaluación de pipelines de cuantización para hardware no-GPU: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que el empaquetado BFP8 es exacto matriz a matriz, útil para equipos que portan modelos a TT-Metal.
- Asistente conversacional multimodal en inglés y coreano: al conservar las torres de visión y audio en bf16, el modelo puede recibir imagen o audio además de texto, con la parte lingüística cuantizada.
- Prototipado en el simulador Blackhole (`ttsim`) antes de disponer de hardware: el autor validó con ttnn 0.81.1 sobre el simulador, lo que permite desarrollar integraciones sin silicio físico.
- Razonamiento con modo thinking para tareas que requieren pasos intermedios: la evaluación incluye siete preguntas de razonamiento repetidas con thinking activado, lo que respalda su uso en escenarios de razonamiento de varios pasos.
- Integración en el demo oficial de Gemma 4 de tt-metal: añadiendo la entrada documentada en `precision_overrides.json`, el demo ejecuta E2B, E4B y 12B en una Blackhole P150 y puede cargar esta variante cuantizada.
- Base para comparativas de fidelidad de cuantización: la tabla de evaluación con KL y top-1 frente a BF16 y Q4_K_M sirve como referencia para decidir entre BFP8 y cuantizaciones enteras en flujos de producción.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 16 | 9,29 | 0 | 100 | 37 de 40 | - |
| **Este modelo (BFP8)** | 13,01 | 7,556 | 0,00239 | 98,29 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,29329 | 80,25 | 37 de 40 | 0 |

La KL y el top-1 se calculan sobre 7.968 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 preguntas cortas con verificación automática más las 7 de razonamiento repetidas con thinking activado (40 en total). "Perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la variante; un fallo en un empate cercano no se contabiliza. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix y su sha256 es `fd8eb490a907ff085938760a39fac78eaebc43a9ce3963492f6261fde3931c04`.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 11,1 GB en disco; los pesos empaquetados en BFP8 suman 7,556 GB. En bf16 el modelo base ocupa 9,29 GB.
- Hardware objetivo: NPU Tensix de Tenstorrent, concretamente Wormhole y Blackhole. El demo de tt-metal v0.81.1 ejecuta E2B, E4B y 12B en una única Blackhole P150.
- GPU consumer: no se documenta soporte ni requisitos para GPU; el formato BFP8 está orientado a TT-NN. El modelo base en bf16 podría cargarse en `transformers` con `device_map="auto"`, pero esta variante no está pensada para ello.
- Opciones de despliegue: TT-NN / TT-Metal (ttnn 0.81.1), demo de Gemma 4 de tt-metal v0.81.1, y `transformers` con `AutoModelForCausalLM` para carga en bf16. tt-forge (tt-xla) aún no se ha probado con Gemma 4; por defecto mantiene bf16 exacto y sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los valores.
- Latencia y throughput: no disponibles. Las pruebas se realizaron sobre el simulador `ttsim`, no sobre hardware, por lo que no hay cifras de rendimiento real.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|---|
| `google/gemma-4-E2B-it` (BF16) | 5.525.831.235 | 16 | 9,29 | 0 | 100 | Apache 2.0 | Hugging Face |
| **Este modelo (BFP8)** | 5.525.831.235 | 13,01 | 7,556 | 0,00239 | 98,29 | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | no disponible | 5,87 | 3,428 | 0,29329 | 80,25 | Apache 2.0 (heredada) | Generado localmente |

La comparativa se limita al modelo base y a una cuantización Q4_K_M del mismo checkpoint, que son los únicos términos de referencia publicados. No se han divulgado comparaciones con otras cuantizaciones (por ejemplo, AWQ, GPTQ entero o GGUF Q8) ni con modelos de tamaño similar de otros autores.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje: las torres de visión y audio, los embeddings y las normas permanecen en bf16 y no se han validado sus prestaciones tras el proceso.
- La evaluación se realizó sobre el simulador `ttsim` de Blackhole, no sobre hardware Tensix físico; el comportamiento en Wormhole o en silicio real no está verificado.
- La pérdida de fidelidad es pequeña pero no nula: KL media de 0,00239 y top-1 del 98,29 % frente a BF16, con una respuesta menos acertada en el conjunto de 40 preguntas.
- El calibrado usó únicamente WikiText-2 y Wikipedia en coreano (65.536 tokens), por lo que el sesgo de calibración hacia esos dominios e idiomas puede afectar a otros registros o lenguas.
- tt-forge (tt-xla) no se ha probado con Gemma 4; sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los pesos de esta variante y pueden degradar la fidelidad respecto al empaquetado nativo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026, lo que implica una validación comunitaria inexistente.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; se heredan los del modelo base Gemma 4 E2B, no documentados en esta ficha.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-E2B-it` por si imponen términos adicionales.
- El autor advierte de que la entrada de `precision_overrides.json` para el demo de tt-metal solo se comprobó en las dos primeras capas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-E2B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Paper referenciado en los tags: arxiv:2607.02770
- Licencia: https://huggingface.co/hletrd/gemma-4-E2B-it-Tensix-BFP8/blob/main/LICENSE
