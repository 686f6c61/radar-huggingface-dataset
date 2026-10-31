# Jakemu/Qwen3.5-27B-nvfp4-mtp

## Resumen

Jakemu/Qwen3.5-27B-nvfp4-mtp es un checkpoint experimental de inferencia optimizada derivado de Qwen/Qwen3.5-27B, publicado por el usuario Jakemu en Hugging Face. No se trata de un modelo nuevo, sino de una re-cuantizacion personalizada del modelo base: los pesos de las capas lineales grandes y las activaciones usan formato nativo NVFP4 (W4A4, block size 16, calibrado con ModelOpt), mientras que la cabecera de prediccion multi-token (MTP) usa INT8 con grupo 128, y embeddings, lm_head y las compuertas delta-rule permanecen en BF16. No incluye torre de vision.

Su relevancia reside en que explora la cuantizacion NVFP4 nativa (formato pensado para GPUs Blackwell de NVIDIA) combinada con decodificacion especulativa mediante MTP, buscando acelerar la inferencia de un modelo denso de 27B en hardware consumer/profesional reciente. El propio autor advierte que es experimental, que no es un checkpoint compatible con Transformers o vLLM estandar, y que no se ha establecido una mejora de calidad preservada frente a INT8. El repo ocupa 19,3 GB y tiene licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con cabecera MTP (detalles completos no disponibles) |
| Parametros totales | no disponible (modelo base de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (block size 16, calibracion ModelOpt) en lineales grandes; INT8 group-128 en MTP; BF16 en embeddings, lm_head y compuertas delta-rule |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint custom, no compatible con Transformers/vLLM estandar) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-27B, es un transformer causal; este checkpoint conserva sus pesos y anade optimizaciones de inferencia. La principal innovacion es la cuantizacion NVFP4 nativa W4A4 (pesos y activaciones a 4 bits en formato NVFP4, con bloques de 16 elementos y calibracion mediante NVIDIA ModelOpt), aplicada a las capas lineales grandes. La cabecera MTP (multi-token prediction), usada para decodificacion especulativa, se cuantiza a INT8 con grupos de 128. Los embeddings, el lm_head y las compuertas delta-rule (que sugieren componentes de atencion lineal tipo delta-rule en el modelo base) permanecen en BF16 para preservar precision. No se incluye la torre de vision del modelo original.

No hay entrenamiento adicional: es una re-cuantizacion con calibracion, no un fine-tuning. El autor no declara datos de entrenamiento propios ni ajustes por RLHF/DPO en este repositorio.

## Capacidades

Al ser un derivado cuantizado de Qwen3.5-27B, sus capacidades teoricas heredan del modelo base, aunque el propio autor no ha validado completamente la calidad:

- Generacion de texto y chat (el prompt de validacion incluye casos de chat largo)
- Generacion y comprension de codigo (los diagnosticos de evaluacion incluyen casos de codigo)
- Razonamiento y matematicas (los diagnosticos incluyen casos de matematicas)
- Decodificacion especulativa mediante cabecera MTP con k=1, k=2 y k=3 tokens
- Ejecucion nativa con kernels flash-linear-attention (fla-delta) para componentes delta-rule
- No incluye capacidades de vision (la torre de vision fue eliminada)
- Tool calling, agentes y capacidades multilingues: no disponibles en la informacion proporcionada

## Casos de uso

- Experimentacion con cuantizacion NVFP4: investigadores que quieran estudiar el comportamiento de W4A4 nativo en GPUs Blackwell (SM120) pueden usar este checkpoint como referencia reproducible, ya que incluye hashes de calibracion y resultados parciales.
- Benchmarking de decodificacion especulativa con MTP: permite medir el impacto real de MTP en INT8 sobre latencia por token, con datos publicados (k=1: 12,98-14,28 ms/token; k=2: 9,71-11,56 ms/token).
- Inferencia local de alta velocidad en estaciones de trabajo Blackwell: en una RTX PRO 6000 Blackwell alcanza unos 44,5 tok/s en decode NVFP4 puro y hasta ~100 tok/s equivalentes con MTP k=2, util para prototipado interactivo.
- Validacion de equivalencia numerica: el checkpoint incluye verificacion de logits identicos en posicion final y diagnosticos de desajustes de MTP, util para quien desarrolle pipelines de cuantizacion.
- Chat y generacion de codigo offline: dado que hereda Qwen3.5-27B, puede usarse para asistentes locales y asistencia de codigo, aunque con la advertencia de que la calidad frente a INT8 no esta establecida.
- Investigacion en atencion lineal / delta-rule: el uso de kernels fla-delta lo hace relevante para quien estudie arquitecturas hibridas con mecanismos de atencion lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publico mediciones de rendimiento de inferencia en una RTX PRO 6000 Blackwell Server Edition (SM120), torch 2.11, CUDA 13, FlashInfer 0.6.6 CUTLASS (256 tokens generados, 3 warmups, 5 repeticiones):

| Configuracion | Latencia (ms/token) | Throughput aprox. |
|---|---|---|
| Decode NVFP4 sin MTP | 22,45 - 22,49 | ~44,5 tok/s |
| MTP INT8, k=1 | 12,98 - 14,28 | ~70-77 tok/s |
| MTP INT8, k=2 | 9,71 - 11,56 | ~86-103 tok/s |
| MTP INT8, k=3 (solo chat_long) | 10,19 | ~98 tok/s |

El autor advierte que MTP no esta validado como equivalente a decodificacion greedy (se detectaron desajustes fuertes de top-1 en chat, codigo y matematicas) y que no se ha establecido una mejora de calidad preservada frente a INT8. La puerta de calidad completa de HF y el perfilado de prefill quedaron pendientes.

## Requisitos de hardware

- VRAM: el repo pesa 19,3 GB; con activaciones W4A4 y buffers BF16, se estima que se necesita una GPU con al menos 24-32 GB de VRAM (estimacion, dato exacto no disponible).
- GPU validada: RTX PRO 6000 Blackwell Server Edition (arquitectura SM120). Se requiere CUDA SM120 obligatoriamente para el camino de ejecucion nativo; no funcionara en Ampere, Ada ni Hopper.
- Software: torch 2.11 con CUDA 13, flashinfer-python==0.6.6, flash-linear-attention, transformers>=5 y safetensors.
- No cabe en GPUs consumer convencionales (RTX 4090, RTX 5090) por la dependencia estricta de SM120/Blackwell.
- Despliegue: solo mediante el codigo de inferencia custom incluido en el repo (infer_opt.qwen3_5, con snapshot_download de huggingface_hub). No es compatible con vLLM, llama.cpp, Ollama ni TGI estandar.
- Latencia/throughput: ver tabla de la seccion anterior (medidas del autor en Blackwell).

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jakemu/Qwen3.5-27B-nvfp4-mtp | 27B (base) | NVFP4 W4A4 + INT8 MTP | no disponible | Apache 2.0 | Checkpoint experimental custom, solo SM120 |
| Qwen/Qwen3.5-27B (base) | 27B | BF16 (original) | no disponible | no disponible en la informacion proporcionada | Checkpoint oficial, compatible con Transformers/vLLM |
| Versiones NVFP4 oficiales de modelos grandes (p. ej. publicaciones NVFP4 de NVIDIA) | variable | NVFP4 | variable | variable | no disponible en la informacion proporcionada |

No hay datos de rendimiento comparativo publicados entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Checkpoint experimental: el autor declara explicitamente que no reclama mejora de calidad ni de velocidad preservada frente a INT8.
- MTP no validado como greedy-equivalente: se detectaron desajustes fuertes de top-1 en chat, codigo y matematicas, por lo que la salida con decodificacion especulativa puede diferir de la del modelo base.
- Evaluacion incompleta: la puerta de calidad completa de HF, los casos k=3 restantes y el perfilado de prefill no se completaron.
- Compatibilidad muy restringida: requiere GPU Blackwell (SM120), CUDA 13, torch 2.11 y FlashInfer 0.6.6; no funciona con Transformers/vLLM/llama.cpp estandar.
- Sin torre de vision: no puede procesar imagenes aunque el modelo base lo permita.
- Sesgos, riesgo de alucinacion y soporte de idiomas: no disponibles en la informacion proporcionada; heredarian del modelo base Qwen3.5-27B sin validacion propia en esta cuantizacion.
- Adopcion minima: 43 descargas y 1 like en el momento de la ficha, sin comunidad de soporte.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-27B para despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakemu/Qwen3.5-27B-nvfp4-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Organizacion Qwen: https://huggingface.co/Qwen
- Paper, blog o demo adicional: no disponible
