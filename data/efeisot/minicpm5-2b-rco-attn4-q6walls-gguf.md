# efeisot/minicpm5-2b-rco-attn4-q6walls-gguf

## Resumen

MiniCPM5-2B RCO attn4 Q6_K walls es una cuantización experimental de precisión mixta del modelo base `openbmb/MiniCPM5-2B`, publicada por el usuario efeisot. El modelo base es un transformer tipo `LlamaForCausalLM` de 42 capas y 2.516.756.480 parámetros (2,52 B), desarrollado por OpenBMB, con una longitud de contexto nativa de 131.072 tokens. Esta versión concreta aplica el esquema de cuantización RCO (una variante de GPTQ con códigos empaquetados) sobre las 294 capas lineales del modelo, manteniendo los embeddings de entrada y la cabeza de salida en Q6_K.

La relevancia de esta ficha no está en el modelo base, sino en la técnica de compresión: consigue un tamaño de archivo de 1,333 GiB (1.431.297.440 bytes) con un promedio ponderado de 3,733 bits por peso en las capas lineales, y una perplejidad de 15,1354 en WikiText-2 bajo el protocolo de llama.cpp, solo un 0,47 % por encima del control F16. Es, por tanto, un ejemplo práctico de cuantización mixta de muy baja precisión con pérdida de calidad controlada.

El precio a pagar es la compatibilidad: el GGUF utiliza tipos GGML no estándar (`RCO3` = 44 y `RCO4` = 45), por lo que no carga en llama.cpp estándar. Requiere un runtime parcheado (v0.6.0) que el autor distribuye junto al modelo. Es un artefacto para experimentación en entornos ROCm/HIP y CPU, no un reemplazo listo para producción del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM, transformer denso, 42 capas |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens nativos; 32.768 por defecto en el runtime parcheado |
| Tipos de cuantizacion | RCO3 (3 bits) y RCO4 (4 bits) en capas lineales; Q6_K en embeddings y cabeza de salida; F32 en normas (85 tensores) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (licencia del modelo base) |
| Formato de pesos | GGUF (llama.cpp), con tipos GGML propietarios RCO3/RCO4 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo Llama con 42 capas, 2,52 B de parámetros y atención multi-cabeza estándar. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos no están en la información proporcionada.

La innovación de esta publicación está en el pipeline de cuantización. Se aplica una política fija por tipo de proyección, no una búsqueda por capa: las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `mlp.up_proj` y `mlp.down_proj` se cuantizan a 4 bits (RCO4), mientras que `mlp.gate_proj` se cuantiza a 3 bits (RCO3). El resultado son 42 tensores RCO3 y 252 tensores RCO4, con un promedio ponderado de 3,733 bits por peso. El formato de bloque RCO agrupa 128 pesos que comparten una escala BF16 `d`, un punto cero BF16 `z` y códigos empaquetados de 3 o 4 bits, con dequantización `y = d * (q - z)`. La calibración se hizo con 256 secuencias de 1024 tokens, mezcla de WikiText-2 y C4 más 128 fragmentos adicionales de entrenamiento de WikiText-2, sin usar texto de validación ni de test.

Un detalle técnico importante: los 294 tensores RCO se copian byte a byte desde el cuantizador al GGUF, sin paso intermedio de dequantización y recuantización en BF16. Los embeddings y la cabeza de salida se cuantizan aparte a Q6_K. El bit por peso efectivo, contando muros y normas, es de 4,55.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta a instrucciones heredados del modelo base MiniCPM5-2B.
- Soporte de contexto largo: hasta 131.072 tokens nativos, aunque el runtime parcheado limita por defecto a 32.768.
- Compatible con `llama-server`, lo que permite exponer una API HTTP compatible con el formato de endpoints de llama.cpp.
- Ejecución en CPU y en GPU AMD vía ROCm/HIP (ruta MMVQ).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito para este artefacto cuantizado.

## Casos de uso

- Evaluación de técnicas de cuantización extrema: sirve como banco de pruebas para medir la degradación de perplejidad de RCO a 3,733 bpw frente a un control F16, con datos reproducibles en WikiText-2.
- Despliegue en GPU de consumo AMD: con 1,33 GiB de pesos, el modelo cabe holgadamente en una RX 9060 XT de 16 GB y deja espacio para una caché KV grande, útil para prototipos de chat en local.
- Inferencia en CPU sin GPU: el autor reporta 27,8 tokens/s en generación con un Ryzen 9 7950X a 16 hilos, suficiente para asistentes de texto de baja latencia en entornos sin acelerador.
- Investigación sobre formatos GGML personalizados: el parche del runtime y la documentación del formato RCO permiten estudiar cómo extender llama.cpp con tipos de tensor no estándar.
- Servicio de texto ligero en chino e inglés: mediante `llama-server` se puede montar un endpoint de generación para aplicaciones internas con requisitos de memoria muy bajos.
- Reproducción de experimentos de cuantización: los metadatos incluyen la asignación exacta por capa (`assign_attn4.json`, `layer_bitwidths.csv`), lo que facilita replicar o modificar la política de bits.

## Benchmarks y rendimiento

Perplejidad en WikiText-2 test con `llama-perplexity --chunks 16 -c 512` (puntuando solo los últimos 256 tokens de cada ventana de 512):

| Modelo / runtime | PPL |
|---|---:|
| Control F16 (mismo checkpoint attn4, mismo pipeline de exportación) | 15,0641 |
| RCO attn4, muros BF16 | 15,0875 |
| RCO attn4, muros Q6_K (este archivo) | 15,1354 |

La diferencia frente al control F16 es de +0,47 %, dentro del objetivo de fidelidad del 0,5 %. Los muros Q6_K añaden aproximadamente 0,32 % respecto a los muros BF16. En el test completo de WikiText-2 (277 x 1024, 283.371 tokens puntuados), el checkpoint HF attn4 con muros BF16 obtiene 16,7418 frente a 15,7711 del modelo BF16 original, un +6,16 %.

Rendimiento medido en AMD Radeon RX 9060 XT 16 GB (gfx1200, ROCm 7.x) y CPU Ryzen 9 7950X a 16 hilos:

| Backend | Test | t/s |
|---|---|---:|
| ROCm/HIP, `-ngl 99` | pp16000 | 917 |
| ROCm/HIP, `-ngl 99` | tg256 | 129 |
| CPU, `-ngl 0` | tg256 | 27,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 1,333 GiB; con caché KV para 32.768 tokens el consumo total depende de la configuración, pero cabe en GPUs de 8 GB o más.
- GPU recomendadas: AMD Radeon RX 9060 XT 16 GB (probada por el autor, gfx1200); cualquier GPU AMD con soporte ROCm/HIP compatible con el parche. No hay ruta CUDA ni MMQ/tensor-core implementada en el parche, solo MMVQ.
- GPU de consumo: sí, cabe en tarjetas de 8-16 GB; en NVIDIA requeriría adaptar el parche, que está pensado para ROCm.
- Despliegue: llama.cpp parcheado v0.6.0 (obligatorio), con binarios `llama-cli`, `llama-server`, `llama-bench` y `llama-perplexity`. No funciona en llama.cpp estándar, Ollama ni vLLM sin modificaciones.
- Latencia y throughput: 917 t/s en prompt processing (pp16000) y 129 t/s en generación (tg256) en RX 9060 XT; 27,8 t/s en CPU. Los lotes de prompt se dividen en fragmentos de 8 columnas por la ruta MMVQ.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B RCO attn4 Q6_K walls (este) | 2,52 B | 131.072 | RCO3/RCO4 + Q6_K, 3,733 bpw lineales | Apache-2.0 | GGUF con runtime parcheado |
| openbmb/MiniCPM5-2B (base) | 2,52 B | 131.072 | BF16 | Apache-2.0 | Hugging Face, safetensors |
| Checkpoint HF attn4 con muros BF16 | 2,52 B | 131.072 | RCO attn4, muros BF16 | Apache-2.0 | Hugging Face |
| Control F16 del mismo pipeline | 2,52 B | 131.072 | F16 | Apache-2.0 | GGUF de referencia del autor |

La comparación relevante es interna al propio pipeline de cuantización: frente al control F16, esta versión reduce el tamaño a 1,33 GiB con un coste de +0,47 % de perplejidad. No se dispone de datos de benchmarks de tareas (MMLU, HumanEval) para comparar con otros modelos de 2-3 B, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- No carga en llama.cpp estándar: los tipos GGML `RCO3` (44) y `RCO4` (45) son no estándar; es imprescindible aplicar el parche o usar el runtime incluido en `runtime/`.
- El parche solo se ha verificado con un dry-run contra un clon limpio de v0.6.0; no hay garantía de compatibilidad con versiones posteriores de llama.cpp.
- No hay ruta MMQ ni tensor-core para RCO en el parche, solo MMVQ, lo que limita el rendimiento en prompt processing frente a cuantizaciones estándar.
- Degradación de calidad medible: +0,47 % de perplejidad frente a F16 en el protocolo corto y +6,16 % en el test completo de WikiText-2 respecto al BF16 original.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a un modelo de 2,5 B, agravado por la cuantización de baja precisión.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero el artefacto es experimental y no está validado para producción.
- El contexto por defecto del runtime parcheado es de 32.768 tokens; usar los 131.072 requiere pasar `-c` explícitamente y disponer de memoria suficiente para la caché KV.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efeisot/minicpm5-2b-rco-attn4-q6walls-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime parcheado: `runtime/` dentro del repositorio del modelo
- Parche de llama.cpp: `runtime/llama.cpp-v0.6.0-rco-minicpm5.patch`
- Documentación del formato RCO: `docs/QUANTIZATION.md`
- Asignación de bits por capa: `metadata/assign_attn4.json` y `metadata/layer_bitwidths.csv`
- Notas de benchmarks: `metadata/benchmarks/`
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
