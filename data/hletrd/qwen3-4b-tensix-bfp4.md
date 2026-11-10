# hletrd/Qwen3-4B-Tensix-BFP4

## Resumen

Qwen3-4B-Tensix-BFP4 es una exportación cuantizada del modelo denso Qwen/Qwen3-4B (4.411.424.256 parámetros) desarrollada por el usuario hletrd (Xylolabs), pensada específicamente para ejecutarse en aceleradores NPU basados en la arquitectura Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa y el modo dual thinking/no-thinking del Qwen3 original, pero sustituye las proyecciones lineales por pesos en formato block floating-point nativo de TT-NN (`ttnn.bfloat4_b`, BFP4), de modo que el empaquetado en la NPU no introduce ningún redondeo adicional.

La propuesta resuelve un problema muy concreto: los formatos BFP de TT-NN son propietarios y no equivalen a una cuantización estándar de PyTorch, por lo que portar un modelo a Tensix suele implicar pérdida de precisión o trabajo de conversión manual. Aquí los ficheros safetensors almacenan valores bf16 que caen exactamente sobre la rejilla block floating-point de cada matriz, de forma que `transformers` calcula lo mismo que la NPU y el empaquetador de TT-NN reproduce los pesos bit a bit.

El resultado ocupa 2,822 GB empaquetado (frente a 8,8 GB en bf16), con una media de 5,61 bits por peso contando embeddings y LM head. Es relevante ahora porque permite desplegar un LLM de 4B con capacidades de razonamiento y tool calling sobre hardware Tensix sin reentrenar ni recalibrar, aunque el autor advierte de que no se ha validado en tarjetas físicas de Tenstorrent, solo en el simulador funcional ttsim.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos en block floating-point TT-NN |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en proyecciones lineales; bf16 en embeddings, LM head, normas y biases; media de 5,61 bits/peso |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 sobre rejilla BFP4), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B: un transformer denso de 36 capas con atención completa, atención q/k/v/o y bloques MLP gate/up/down en cada capa, además de embeddings y LM head atados (tied). No hay entrenamiento nuevo: la model card describe únicamente un proceso de cuantización post-entrenamiento mediante GPTQ con búsqueda de exponente, aplicado a las 36 capas y a las 252 matrices redondeadas que se mencionan en la verificación.

La innovación técnica no está en el entrenamiento sino en el formato. BFP4 y BFP8 son formatos block floating-point de TT-NN: en layout de tile, 16 valores consecutivos comparten un exponente de 8 bits, y cada valor conserva signo y mantisa de 3 bits (BFP4) o 7 bits (BFP8). El autor verifica que los pesos almacenados en bf16 caen exactamente sobre esa rejilla, de modo que el empaquetado es sin pérdida adicional; también comprueba que el mismo modelo cabe sin cambios en BFP8 (8,5 bits/peso), ya que un paso de mantisa de 3 bits equivale a 16 pasos de 7 bits (16 × 7 = 112 ≤ 127). Las pruebas se hicieron con ttnn 0.81.1 y torch 2.15.0 sobre ttsim, el simulador funcional de un chip Blackhole, no sobre hardware real.

## Capacidades

- Generación de texto conversacional, con plantilla de chat de Qwen3 (`apply_chat_template`).
- Modo thinking y modo no-thinking heredados de Qwen3-4B, según la model card del modelo base.
- Razonamiento y matemáticas: capacidades propias de la familia Qwen3, no cuantificadas en la información disponible.
- Generación de código: no se detalla en la información proporcionada, pero el modelo base Qwen3-4B está orientado a código y razonamiento.
- Tool calling / function calling: no confirmado explícitamente en la información disponible para esta exportación.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.
- Multilingüismo: no disponible; la model card no enumera idiomas.
- Capacidades especiales: ninguna adicional (sin visión ni audio); el interés está en el formato BFP4 para NPU.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole/Blackhole: el modelo se empaqueta con `pack_tensix.py` y se sirve con TT-NN o tt-transformers, aprovechando que las matrices BFP4 ocupan aproximadamente la mitad de bytes que en BFP8 y reducen el tráfico de memoria desde DRAM.
- Inferencia de bajo consumo en edge con aceleradores Tensix: un modelo de 4B con 2,822 GB empaquetados permite caber en presupuestos de memoria ajustados, útil para asistentes locales sin GPU dedicada.
- Evaluación de pipelines de cuantización BFP4: `verify_grid.py` permite comprobar sin software de Tenstorrent (solo torch y safetensors) qué valores cambiarían al redondear, útil para validar exportaciones antes de llevarlas a hardware.
- Prototipado en simulador: con ttsim se puede validar el flujo completo de empaquetado, ida y vuelta a DRAM y decodificación antes de disponer de una tarjeta física, reduciendo el ciclo de desarrollo de kernels.
- Generación de texto conversacional en `transformers`: el checkpoint carga como el modelo base con `AutoModelForCausalLM`, por lo que sirve para comparar la salida del modelo redondeado frente al original en pipelines de evaluación.
- Caché de pesos preempaquetados: `--cache-dir` genera ficheros de caché de TT-NN que se cargan con `cache_file_name`, lo que acelera arranques repetidos en producción al evitar el repacking en cada despliegue.
- Base para fine-tuning o destilación sobre Tensix: al conservarse la estructura y el tokenizador de Qwen3-4B, puede servir como punto de partida para adaptaciones que luego se reexporten a BFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni latencias; solo indica que no se han medido estos exports en tarjetas propias de Tenstorrent y que las pruebas se limitan a ttsim.

## Requisitos de hardware

- VRAM/NPU: 2,822 GB de pesos empaquetados en BFP4 (8,8 GB en los ficheros bf16 del repositorio); el peso en memoria del proceso `transformers` será el del checkpoint bf16, unos 8,8 GB más overhead.
- GPU recomendadas: no aplica de forma nativa; el destino son NPU Tensix (Wormhole, Blackhole). En GPU convencional funciona vía `transformers` en bf16.
- Consumer GPU: en bf16 cabría en GPUs de 12-16 GB (RTX 4070 Ti, 4080, 4090) para inferencia; en BFP4 solo tiene sentido en Tensix.
- Opciones de despliegue: TT-NN/tt-metal (`ttnn`), tt-transformers (`models/tt_transformers`), `transformers` con `AutoModelForCausalLM`, y TGI por el tag `text-generation-inference` del repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones en hardware Tensix.
- Simulador: ttsim (Blackhole funcional) validado con ttnn 0.81.1 y torch 2.15.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Tensix-BFP4 | 4,41B | no disponible | BFP4 (5,61 bits/peso medio) | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3-4B (base) | 4,41B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Exportaciones BFP8 equivalentes | 4,41B | no disponible | BFP8 (8,5 bits/peso) | Apache 2.0 | Mismo repo, reempaquetable |
| Otros Qwen3 pequeños (p. ej. 1,7B) | ~1,7B | no disponible | bf16 / GGUF | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio Qwen3-4B en bf16: misma arquitectura y mismos valores redondeados a la rejilla BFP4, con una reducción de 8,8 GB a 2,822 GB. Frente a exportaciones GGUF/AWQ convencionales, la diferencia es que BFP4 es un formato de TT-NN, no portable a llama.cpp ni a vLLM sin conversión.

## Limitaciones y advertencias

- No verificado en hardware Tensix real: todas las pruebas se hicieron en ttsim, el simulador funcional de Blackhole; el rendimiento y la corrección en silicio están por confirmar.
- Formato propietario: BFP4/BFP8 de TT-NN no es portable a llama.cpp, vLLM ni Ollama sin reempaquetado; en `transformers` se carga como bf16, perdiendo la ventaja de memoria.
- Pérdida de precisión por cuantización: mantisa de 3 bits por valor con exponente compartido cada 16 valores; puede degradar tareas sensibles a precisión numérica, aunque el autor afirma que el empaquetado no cambia valores respecto al checkpoint almacenado.
- Idiomas no documentados: la model card no enumera idiomas soportados; hay que remitirse a Qwen3-4B.
- Contexto no documentado: no se indica la longitud de contexto en la información disponible.
- Sesgos y alucinaciones: no evaluados en esta exportación; hereda los del modelo base Qwen3-4B, sin mitigaciones adicionales documentadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara no estar afiliado ni respaldado por Tenstorrent, y el uso en producción sobre Tensix requiere validar el stack tt-metal.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y soporte comunitario mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3-4B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- tt-metal y TT-NN: https://github.com/tenstorrent/tt-metal
- Guía de instalación de tt-metal: https://github.com/tenstorrent/tt-metal/blob/main/INSTALLING.md
- Documentación de Tenstorrent: https://docs.tenstorrent.com
