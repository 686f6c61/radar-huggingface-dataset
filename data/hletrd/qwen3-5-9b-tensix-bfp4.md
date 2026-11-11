# hletrd/Qwen3.5-9B-Tensix-BFP4

## Resumen

Qwen3.5-9B-Tensix-BFP4 es una cuantización del modelo Qwen/Qwen3.5-9B preparada específicamente para su despliegue en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma el usuario hletrd (Xylolabs), que no tiene afiliación con Tenstorrent. La particularidad del checkpoint es que las capas lineales se han redondeado a la rejilla numérica `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ, de forma que TT-NN puede empaquetar los pesos sin volver a redondearlos. Los ficheros se distribuyen en bf16, pero cada valor ya está alineado a la rejilla BFP4.

El modelo base es un transformer multimodal de unos 9.653 millones de parámetros con pipeline `image-text-to-text`, orientado a conversación y con soporte de plantilla de chat. La cuantización afecta solo al modelo de lenguaje: el bloque `mtp` y la torre visual `visual` se mantienen en bf16 sin tocar. El resultado son 7,11 bits por peso de media y 7,96 GB empaquetados, frente a los 17,91 GB del BF16.

La relevancia del checkpoint es doble: por un lado, permite ejecutar un modelo de casi 10.000 millones de parámetros en una sola NPU Blackhole P150 con una pérdida de calidad medida y acotada frente al BF16; por otro, sirve como referencia metodológica de cuantización consciente del formato de hardware (block floating point), con scripts de verificación que comprueban que el empaquetado en TT-NN no altera ningún valor. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 8 capas de atención (q, k, v, o) y 24 capas con Gated DeltaNet (q, k, v, z, a, b, output), más 32 capas MLP (gate, up, down); incluye bloque `mtp` y torre `visual` |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en proyecciones lineales; bf16 en embeddings, LM head, normas, `mtp` y `visual`; media de 7,11 bits/peso; compatible también con empaquetado exacto en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible en la ficha del checkpoint (la calibración GPTQ usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores alineados a la rejilla BFP4); índice `model.safetensors.index.json` y mapa de formatos `quant4.json` |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: cuantiza Qwen/Qwen3.5-9B. La arquitectura del base combina capas de atención clásica con capas Gated DeltaNet (un mecanismo de atención lineal/estado recurrente) y un bloque MLP por capa, además de un módulo `mtp` (multi-token prediction) y una torre visual. Sobre esa estructura, el autor aplica GPTQ únicamente a las proyecciones lineales: q, k, v y o de las 8 capas de atención; q, k, v, z, a, b y output de las 24 capas DeltaNet; y gate, up y down de las 32 capas MLP. Todo lo demás (embeddings, LM head, normas, `mtp`, `visual`) queda en bf16.

La calibración de GPTQ se hizo con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. La innovación técnica no está en el algoritmo de cuantización sino en el destino: los pesos se redondean directamente a la rejilla de bloque flotante de TT-NN (`bfloat4_b`), de modo que el empaquetado en la NPU es una operación exacta, sin un segundo redondeo. El autor incluye `pack_tensix.py` para verificar matriz a matriz que el tensor empaquetado en TT-NN coincide bit a bit con el de safetensors, y `verify_grid.py` para comprobar la rejilla solo con torch. La verificación se realizó con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, no sobre hardware físico.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), tal como muestra el ejemplo de quickstart.
- Procesamiento image-text-to-text: el pipeline declarado es multimodal y la torre `visual` se conserva en bf16.
- Razonamiento con modo thinking: la evaluación incluye 7 prompts de razonamiento repetidos con thinking activado.
- Capacidades multilingües: no documentadas en esta ficha; la calibración cubrió inglés y coreano, pero no se declara una lista de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Predicción multi-token mediante el bloque `mtp` (en bf16 en este checkpoint).
- Inferencia en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado exacto de pesos BFP4 y también BFP8.

## Casos de uso

- Despliegue en NPU Tenstorrent Blackhole P150: el caso principal. El demo de tt-metal v0.81.1 (`models/demos/blackhole/qwen36`) carga este checkpoint en una sola P150, con las proyecciones DeltaNet, atención y MLP down en bfloat8_b y las MLP gate/up en bfloat4_b, lo que permite servir un modelo de ~9,6B en una única tarjeta.
- Evaluación de cuantización consciente del hardware: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que el redondeo a BFP4 no introduce desviaciones al empaquetar, útil para validar pipelines de cuantización antes de pasar a silicio real.
- Investigación en formatos block floating point: sirve como referencia reproducible de cómo afecta BFP4 a la fidelidad frente a BF16 (KL media de 0,03473, top-1 del 90,96 %) y frente a Q4_K_M de llama.cpp (KL 0,03669, top-1 90,47 %).
- Prototipado de asistentes conversacionales multimodales en entornos Tenstorrent: al conservar la torre visual y la plantilla de chat, se puede montar un pipeline image-text-to-text sobre TT-NN sin reentrenar.
- Comparación de estrategias de compresión en el mismo checkpoint: el autor genera Q4_K_M desde el mismo modelo base con llama.cpp v0.9.0, lo que facilita estudios A/B entre cuantización GGUF y BFP4 para NPU.
- Simulación y CI: al haberse validado con `ttsim`, el checkpoint encaja en flujos de integración continua que verifican cargas de pesos en TT-NN antes de disponer de hardware.
- Inferencia con decodificación sin MTP: con `QWEN36_SPEC=0` el demo omite el bloque `mtp` y decodifica sin él, útil para medir el coste de la predicción multi-token.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad frente al BF16, no calidad de tarea. KL y top-1 cubren 16.312 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia coreana), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking (40 en total).

| Modelo | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B) | 16 | 17,91 | 0 | 100 | 38 de 40 | - |
| **este modelo (BFP4)** | 7,11 | 7,962 | 0,03473 | 90,96 | 35 de 40 | 2 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,03669 | 90,47 | 37 de 40 | 1 |

El criterio de aceptación del autor era una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; se cumplió (0,95 veces la KL y 2 perdidas frente a 1). No se midió velocidad en dispositivo. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,962 GB empaquetados en BFP4 según la ficha; el repo ocupa 19,3 GB porque los ficheros se distribuyen en bf16.
- GPU: no es el destino previsto; el quickstart usa `device_map="auto"` con transformers y dtype bfloat16, lo que requiere capacidad para el modelo en bf16 (~18 GB de pesos) más overhead.
- NPU Tensix: probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), no en hardware. El demo de tt-metal v0.81.1 apunta a una sola Blackhole P150; no se ejecutó una pasada completa.
- Consumer GPU: no disponible; no se documenta comportamiento en RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: transformers (referencia), TT-NN / tt-metal (demo Qwen3.5/3.6 v0.81.1), tt-forge (tt-xla) aún no probado con este checkpoint. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no medidos ("no device speed was measured").

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Qwen3.5-9B-Tensix-BFP4 (este) | 9,65B | no disponible | 7,11 | 7,962 GB | 0,03473 | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3.5-9B (BF16) | 9,65B | no disponible | 16 | 17,91 GB | 0 (referencia) | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo base) | 9,65B | no disponible | 5,02 | 5,780 GB | 0,03669 | Apache 2.0 | Generado por el autor con llama.cpp v0.9.0 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el bloque `mtp` no se han validado tras la conversión.
- La verificación en TT-NN se hizo únicamente sobre el simulador `ttsim` con ttnn 0.81.1; no hay pruebas en hardware Wormhole ni Blackhole, y el demo de tt-metal no completó una pasada entera.
- Dos partes se vuelven a redondear en el demo de tt-metal: el LM head (siempre empaquetado en bfloat8_b) y el bloque `mtp`, que aquí está en bf16 y el demo empaqueta en bfloat8_b (gate y up en bfloat4_b). Esto puede introducir desviaciones adicionales no medidas.
- tt-transformers no soporta esta arquitectura; el soporte depende del demo específico de tt-metal.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- Los benchmarks miden proximidad al BF16, no calidad de tarea; no hay datos de MMLU, HumanEval, GSM8K ni similares.
- No se declara lista de idiomas soportados; la calibración GPTQ se limitó a inglés y coreano, lo que puede sesgar la fidelidad en otros idiomas.
- No se documentan sesgos conocidos ni tasas de alucinación; al heredar el comportamiento del modelo base, aplican los riesgos habituales de un LLM de ~9,6B.
- Licencia Apache 2.0, igual que el modelo base, con los cambios listados en `NOTICE`; se entrega "as is", sin garantía.
- El autor (Xylolabs) no está afiliado ni respaldado por Tenstorrent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.5-9B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión concreta del base citada en la evaluación: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
