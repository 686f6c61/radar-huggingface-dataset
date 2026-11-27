# Atlas3D/Qwen3.8-27B-atlas-14g-ingine

## Resumen

`Atlas3D/Qwen3.8-27B-atlas-14g-ingine` es un checkpoint cuantizado de precisión mixta ("Elastic") derivado de `Qwen/Qwen3.8-27B`, un modelo de lenguaje de tipo transformer denso de aproximadamente 19.360 millones de parámetros reales según los safetensors del repositorio. Lo publica el usuario Atlas3D y su propósito es reducir el peso en disco y la huella de VRAM del modelo base para que pueda ejecutarse en GPUs de 16 GB a 24 GB, partiendo del checkpoint NVFP4 de NVIDIA (`nvidia/Qwen3.8-27B-NVFP4`, 18,77 GiB) y rebajándolo a 12,75 GiB de pesos.

La pieza diferencial no es solo la cuantización, sino el motor de inferencia asociado: `Atlas3DSS/atlas-ingine`, una librería propia en C++/CUDA que implementa los formatos `ATLAS3` (3,5 bits por peso) y `NVFP4`, y que expone una API HTTP compatible con OpenAI. El checkpoint está pensado exclusivamente para ese motor, no para llama.cpp, vLLM ni transformers estándar, lo que condiciona por completo su despliegue.

Es relevante ahora porque demuestra una estrategia de asignación de precisión por capas (atención y MLP del núcleo frente a capas de frontera) que recorta un 32 % del peso respecto al NVFP4 original con una divergencia KL media de 0,1323 frente al modelo profesor. Es, en la práctica, un experimento de cuantización extrema con verificación numérica publicada, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8, tag `qwen3_5`); checkpoint solo texto, sin tensores `visual` ni `mtp` |
| Parametros totales | 19.360.669.184 (~19,36 B) según safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de despliegue usa `--max-ctx 8192` |
| Tipos de cuantizacion | Precisión mixta: `NVFP4` (MLP de frontera, atención del núcleo, `embed_tokens`, `lm_head`), `ATLAS3` a 3,5 b/w (MLP del núcleo), `FP8` (atención de frontera) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (4 shards, 13.689.792.172 bytes), con `SHA256SUMS` y `atlas_elastic_manifest.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3.8 con unos 19,36 mil millones de parámetros. Este checkpoint no entrena nada: es una recuantización del NVFP4 de NVIDIA, que a su vez deriva del Qwen3.8-27B original. La innovación está en el reparto de precisión por bloques: las cuatro capas MLP de frontera y la atención del núcleo se mantienen en NVFP4 (4 bits), la atención de frontera baja a FP8 y las MLP del núcleo se comprimen a `ATLAS3`, un formato propietario de 3,5 bits por peso. `embed_tokens` y `lm_head` permanecen en NVFP4. El resultado son 12,75 GiB de pesos frente a los 18,77 GiB del NVFP4 de referencia, un ahorro de 6,02 GiB.

La verificación publicada es de tipo teacher-forced contra el checkpoint NVFP4: con 139 tokens de prompt y 32 posiciones capturadas, se reporta una KLD media de 0,1323, p99 de 1,4008, máximo de 1,6069, coseno medio de 0,9724 y una coincidencia top-1 del 81,25 % (26 de 32). Todos los valores son finitos. No se documenta en la información disponible el volumen de tokens de entrenamiento original, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y matemáticas: capacidad presumible del modelo base, no verificada de forma independiente en este checkpoint.
- Generación de código: no se documenta explícitamente, pero el modelo base Qwen3.8 está orientado a uso general y programación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; el autor no declara lista de idiomas.
- Capacidades especiales: este checkpoint excluye explícitamente los tensores `visual` y `mtp`, por lo que no hay visión ni decodificación especulativa multi-token en este paquete.
- Servicio HTTP compatible con OpenAI a través de `ingine-serve`.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 16 GB: el checkpoint ocupa 12,75 GiB de pesos y alcanza 12,64 GiB de VRAM pico con 4K de contexto, por lo que encaja en tarjetas de 16 GB sin offloading a CPU.
- Inferencia local de un modelo de ~19 B en una RTX 4090 o RTX 5090: permite mantener un asistente conversacional privado en hardware de consumo de gama alta, con la salvedad de que requiere compilar `atlas-ingine`.
- Servicio interno con API compatible OpenAI: `ingine-serve` expone endpoints estándar, de modo que aplicaciones existentes basadas en el SDK de OpenAI pueden apuntar a `127.0.0.1:8003` sin cambios de código.
- Evaluación de técnicas de cuantización: el paquete incluye métricas KLD, coseno y top-1 frente al profesor, lo que lo convierte en un banco de pruebas reproducible para investigar el impacto de precisión mixta por capas.
- Prototipado de pipelines de generación de texto con contexto medio (8K tokens configurados en el ejemplo) en entornos con presupuesto de VRAM ajustado.
- Investigación sobre formatos de pesos propietarios: sirve para estudiar el formato `ATLAS3` y su relación calidad/tamaño frente a NVFP4 puro, comparando con los packs `atlas-17g` y `atlas-11g` del mismo autor.
- Verificación de integridad en producción: los SHA-256 por shard y el manifiesto compilado en el binario permiten auditar que los pesos servidos son exactamente los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la información disponible. Los únicos datos medidos son de divergencia frente al profesor y de throughput.

| Metrica | Valor | Hardware |
|---|---|---|
| KLD media vs NVFP4 | 0,1323 | RTX PRO 6000 (`sm_120a`) |
| KLD p99 | 1,4008 | RTX PRO 6000 (`sm_120a`) |
| KLD max | 1,6069 | RTX PRO 6000 (`sm_120a`) |
| Coseno medio | 0,9724 | RTX PRO 6000 (`sm_120a`) |
| Coincidencia top-1 | 0,8125 (26/32) | RTX PRO 6000 (`sm_120a`) |
| Prefill | 43,09 tok/s | RTX PRO 6000 (`sm_120a`) |
| Decode | 30,01 tok/s | RTX PRO 6000 (`sm_120a`) |
| Decode via `ingine-serve` | 28,2–28,7 tok/s | RTX PRO 6000 (`sm_120a`) |

## Requisitos de hardware

- VRAM de pesos: 12,75 GiB; VRAM pico medida con 4K de contexto: 12,64 GiB.
- GPU objetivo declarada: 16 GB a 24 GB. Verificado en NVIDIA RTX PRO 6000 Blackwell Workstation Edition (`sm_120a`) con ruta de cómputo BF16.
- Arquitecturas CUDA soportadas en la compilación de ejemplo: `86` (Ampere, RTX 30 / A100), `89` (Ada, RTX 40), `120a` (Blackwell, RTX 50 / PRO 6000). Para V100 (`sm_70`) existe el preset `legacy-fp16` con CUDA 12.9.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 5090 (32 GB) con margen; en tarjetas de 16 GB el margen es estrecho y depende del contexto.
- Opciones de despliegue: exclusivamente `atlas-ingine` (`ingine-serve` para API HTTP, `ingine-bench` para medición). No hay soporte de vLLM, llama.cpp, Ollama ni TGI documentado.
- Throughput medido: 43,09 tok/s de prefill y 30,01 tok/s de decode en RTX PRO 6000; 28,2–28,7 tok/s en servidor HTTP con repetición determinista y `cached_tokens=34`.

## Comparativa con modelos similares

| Modelo | Parametros | Pesos | VRAM pico @ 4K | KLD media | Licencia | Motor |
|---|---|---:|---:|---:|---|---|
| `atlas-14g` (este) | ~19,36 B | 12,75 GiB | 12,64 GiB | 0,1323 | Apache-2.0 | `atlas-ingine` |
| `atlas-17g` (v2) | ~19,36 B | 15,33 GiB | 15,97 GiB | 0,1640 | Apache-2.0 | `atlas-ingine` |
| `atlas-11g` (v3) | ~19,36 B | 11,35 GiB | 12,00 GiB | 0,1415 | Apache-2.0 | `atlas-ingine` |
| `nvidia/Qwen3.8-27B-NVFP4` | ~19,36 B | 18,77 GiB | 19,42 GiB | referencia | Apache-2.0 | NVIDIA TensorRT / similar |

La comparación con modelos de otras familias (Llama, Mistral, Gemma) no está disponible en la información proporcionada. Dentro de la propia familia de packs, `atlas-14g` ofrece la mejor KLD media (0,1323) de los tres, aunque su p99 (1,4008) es peor que el de `atlas-11g` (0,8929); conviene tenerlo en cuenta si importan las colas de la distribución.

## Limitaciones y advertencias

- Dependencia total del motor `atlas-ingine`: los pesos no son cargables por transformers, vLLM, llama.cpp ni Ollama. Sin compilar el motor propietario, el checkpoint es inutilizable.
- Divergencia no trivial respecto al profesor: KLD media 0,1323 y coincidencia top-1 del 81,25 % implican que aproximadamente 1 de cada 5 tokens predichos difiere del NVFP4 de referencia. No es un checkpoint "sin pérdida".
- Cola de divergencia alta: KLD p99 de 1,4008 y máximo de 1,6069 indican que en algunas posiciones la distribución se aleja mucho, lo que puede manifestarse en salidas erráticas puntuales.
- Sin datos de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K): no se puede afirmar su rendimiento en tareas concretas a partir de la información disponible.
- Sin visión ni decodificación especulativa: los tensores `visual` y `mtp` están excluidos del paquete.
- Idiomas no declarados: no hay lista oficial de idiomas soportados, lo que impide garantizar calidad multilingüe.
- Contexto no especificado: el ejemplo usa 8K, pero no se documenta la ventana nativa del modelo base ni el impacto de contextos mayores en VRAM.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones de fidelidad factual para este checkpoint.
- Sesgos: no documentados por el autor; se heredan los del Qwen3.8-27B original.
- Licencia Apache-2.0 permite uso comercial, pero la del motor `atlas-ingine` también es Apache-2.0 según la model card; conviene verificar el repositorio de GitHub para confirmar términos y estado de mantenimiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- Fecha de creación declarada 2026-11-27: comprobar la coherencia temporal antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-14g-ingine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de origen: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Motor de inferencia: https://github.com/Atlas3DSS/atlas-ingine
- Pack `atlas-17g`: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-17g-ingine
- Pack `atlas-11g`: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-11g-ingine
