# Avifenesh/Ornith-1.5-9B-NVFP4-MTP-GGUF

## Resumen

Ornith-1.5-9B-NVFP4-MTP-GGUF es un artefacto de servicio (serving artifact) publicado por el usuario Avifenesh a partir del modelo base `ornith-ai/Ornith-1.5-9B`, un fine-tune de 9B derivado de la familia Qwen3.5. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización NVFP4 en formato GGUF que incorpora una cabeza MTP (multi-token prediction) injertada para habilitar decodificación especulativa en GPUs Blackwell (sm_120a).

El problema que resuelve es concreto: el checkpoint oficial de Ornith-1.5-9B declara una cabeza MTP en su configuración (`mtp_num_hidden_layers: 1`) pero no incluye los tensores `mtp.*` correspondientes (760 tensores frente a los 775 de su base). Este artefacto toma los 15 tensores de la cabeza MTP entrenada de `Qwen/Qwen3.5-9B` (Apache-2.0) y los injerta en el tronco oficial inalterado de Ornith en `blk.32`, permitiendo decodificación especulativa verificada token a token.

La relevancia es doble: por un lado reduce el peso de 18,8 GB en BF16 a 5,4 GB en NVFP4, y por otro habilita aceleración especulativa con garantías de exactitud (el flujo especulativo es token-idéntico a la decodificación greedy simple). El contexto nativo es de 262.144 tokens y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 (`qwen35`, 33 bloques incl. NextN), con cabeza MTP injertada en `blk.32` |
| Parametros totales | 32.768 (dato reportado en safetensors; el nombre comercial indica 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (4-bit e2m1, escalas FP8-e4m3 por cada 16 elementos) en bloques y MTP; embeddings y cabeza de salida Q5_K; normas F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Ornith-1.5-9B-NVFP4-Q5K-mtp.gguf`, 5.442.334.016 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso derivado de Qwen3.5, con 33 bloques que incluyen la capa NextN y `rope.dimension_count 64`. El vocabulario es de 248.320 entradas. Este artefacto no entrena nada: cuantiza el tronco oficial BF16 sin modificar sus bytes (con recibos sha256 por shard) y le añade una cabeza MTP de 15 tensores procedente de Qwen3.5-9B, mapeada mediante el conversor estándar.

La conversión se realizó con `convert_hf_to_gguf.py` de la rama `nvfp4-imatrix-scale-search` de avifenesh/llama.cpp, en BF16 y con MTP empaquetado. La cuantización se hizo con `llama-quantize` usando el ftype NVFP4 de la misma rama, con `--output-tensor-type q5_k` y `--token-embedding-type q5_k`, aplicando la misma receta que el hermano de 35B. La innovación técnica principal es el injerto de la cabeza MTP: una cabeza de borrador nunca puede alterar la salida, ya que el modelo objetivo verifica cada token propuesto, de modo que solo afecta a la tasa de aceptación y a la velocidad especulativa.

## Capacidades

- Generación de texto conversacional con plantilla de chat embebida, byte-idéntica al `chat_template.jinja` del repositorio (sha256 `9dd2fbd270fe…44e8fd235`).
- Razonamiento explícito mediante modo `<think>`.
- Tool calling en formato XML, con emisión de `tool_calls` compatibles con OpenAI y argumentos tipados según esquema (verificado en las pruebas de servicio).
- Decodificación especulativa con cabeza MTP (K configurable de 1 a 8), con flujo token-idéntico a la decodificación greedy simple.
- Soporte de serving grafo y batcheado con compuertas de exactitud por petición.
- Capacidad de texto a texto; la torre de visión del modelo upstream no está incluida en este artefacto.
- Capacidades multilingües: no disponible (no declaradas en la información proporcionada).

## Casos de uso

- Despliegue de chat conversacional en GPUs Blackwell: el formato NVFP4 y el motor tiyuvta permiten servir el modelo en 5,4 GB con contexto de 262.144 tokens, adecuado para asistentes con historial largo.
- Aceleración de inferencia en producción: la cabeza MTP injertada ofrece tasas de aceptación de 0,59 a K=3 en prompts de código y 0,45 en continuación cruda, reduciendo pasos de decodificación sin sacrificar exactitud.
- Asistentes con tool calling: la emisión verificada de `tool_calls` con argumentos tipados permite integrar el modelo en orquestadores de agentes que consumen la interfaz de OpenAI.
- Razonamiento multi-paso con modo thinking: el soporte de `<think>` y el contexto de 262.144 tokens lo hacen apto para tareas de análisis que requieren cadenas de razonamiento largas.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de NVFP4 frente a BF16 y Q8_0 en exactitud y aceptación especulativa sobre el mismo tronco.
- Investigación en decodificación especulativa: la documentación de aceptación por K y por tipo de cabeza (injertada frente a enmascarada FR-Spec) permite reproducir experimentos de draft acceptance.
- Pipelines de generación de código con verificación estricta: las compuertas de exactitud (prefill ≡ decode argmax, batched-prime ≡ tokenwise argmax) facilitan su uso donde se exige determinismo byte a byte.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a tasas de aceptación de borrador en el arnés de exactitud, no a throughput. Se ejecutaron con el motor tiyuvta v0.104.1 sobre una RTX 5090 Laptop, con decodificación greedy y K=3.

| Cabeza | Sonda | K=1 | K=2 | K=3 |
|---|---|---|---|---|
| Injertada embebida | Prompt de código con plantilla de chat, 64 tokens | 0,80 | 0,71 | 0,59 |
| Injertada embebida | Sonda de continuación cruda, 32 tokens | 0,72 | 0,57 | 0,45 |
| Enmascarada (`frspec-sxc32768`) | Prompt de código con plantilla de chat, 64 tokens | 0,70 | 0,71 | 0,56 |

Métricas declaradas en el model-index: tasa de aceptación de 0,594 con cabeza MTP injertada a K=3 y 0,556 con cabeza enmascarada FR-Spec (top-32768 rangos SXC de generación propia) a K=3. El autor no publica cifras de tokens por segundo por limitación térmica del portátil empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4 GB de pesos en NVFP4, más overhead de contexto KV; el contexto completo de 262.144 tokens requiere planificación adicional de memoria.
- GPU recomendadas: arquitectura Blackwell (sm_120a), como RTX 5090, por el soporte nativo de NVFP4.
- Cabe en GPU de consumo Blackwell; en GPUs sin soporte NVFP4 no es desplegable directamente.
- Opciones de despliegue: motor tiyuvta (v0.104.1 o superior) y la rama `nvfp4-imatrix-scale-search` de avifenesh/llama.cpp. No es compatible con llama.cpp upstream ni con Ollama; para esos entornos el autor recomienda los GGUF oficiales BF16–Q8_0 de `ornith-ai/Ornith-1.5-9B-GGUF`.
- Latencia y throughput: no disponibles (el autor declina publicar tok/s desde una tarjeta portátil con limitación térmica).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B-NVFP4-MTP-GGUF | 9B (32.768 en safetensors) | 262.144 | NVFP4 + Q5_K | Injertada desde Qwen3.5-9B | MIT | Hugging Face, motor tiyuvta y rama llama.cpp |
| ornith-ai/Ornith-1.5-9B (base) | 9B | 262.144 | BF16 | Declarada en config pero sin tensores | MIT | Hugging Face |
| ornith-ai/Ornith-1.5-9B-GGUF (oficial) | 9B | 262.144 | BF16–Q8_0 | No incluida | MIT | Hugging Face, llama.cpp upstream y Ollama |
| tiyuvta/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF (hermano) | 35B (MoE, A3B) | no disponible | NVFP4 + Q5_K | Injertada | no disponible | Hugging Face |

## Limitaciones y advertencias

- La cabeza MTP es un injerto de Qwen3.5-9B, no la cabeza original de Ornith; el autor lo declara explícitamente y advierte que solo afecta a aceptación y velocidad, nunca a la salida.
- NVFP4 no es un tipo de tensor soportado por llama.cpp upstream: sin la rama específica o el motor tiyuvta, el archivo no es utilizable.
- El artefacto es solo texto a texto; la torre de visión del modelo upstream no está incluida.
- No se publican cifras de throughput ni latencia; las tasas de aceptación provienen de un portátil con limitación térmica y no deben extrapolarse como rendimiento.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index.
- Riesgo de alucinación y sesgos: no disponible (no documentados en la información proporcionada).
- Idiomas soportados: no disponible; conviene validar el comportamiento multilingüe antes de producción.
- La licencia MIT del artefacto convive con la Apache-2.0 de los tensores MTP injertados; verificar la compatibilidad en despliegues comerciales.
- El contexto de 262.144 tokens exige gestión cuidadosa de la memoria KV en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Avifenesh/Ornith-1.5-9B-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- GGUF oficiales del base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Hermano de 35B: https://huggingface.co/tiyuvta/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF
- Discusión de origen del artefacto: https://huggingface.co/tiyuvta/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF/discussions/1
- Rama de llama.cpp con soporte NVFP4: https://github.com/avifenesh/llama.cpp/tree/nvfp4-imatrix-scale-search
- Motor de serving tiyuvta: https://tiyuvta.ai
- Cabeza MTP de origen: https://huggingface.co/Qwen/Qwen3.5-9B
