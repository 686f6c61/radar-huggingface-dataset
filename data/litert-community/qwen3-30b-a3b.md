# litert-community/Qwen3-30B-A3B

## Resumen

Qwen3-30B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Alibaba Qwen. Cuenta con 30,5 mil millones de parametros totales, de los cuales solo 3,3 mil millones se activan por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. El modelo emplea 48 capas con 128 expertos cada una, activando 8 expertos por token. Esta pensado para generacion de texto, razonamiento, codigo y matematicas, con soporte de modo "thinking" activado por defecto en su plantilla de chat.

La ficha que nos ocupa no es el modelo original, sino una conversion del mismo al formato LiteRT-LM, realizada por el colectivo litert-community. Esta version reempaqueta los pesos en dos artefactos `.litertlm` con cuantizacion mixta int4/int8, disenados para ejecutarse sobre el runtime LiteRT-LM con aceleracion WebGPU, principalmente en hardware Apple Silicon. El objetivo es permitir inferencia local eficiente en equipos de consumo, con velocidades de decodificacion superiores a 100 tokens por segundo en un Apple M4 Max.

La relevancia de esta publicacion radica en que demuestra la viabilidad de ejecutar un MoE de 30B en hardware de escritorio mediante cuantizacion agresiva y kernels especificos para GPU. No obstante, requiere una build del runtime compilada desde fuente con dos pull requests abiertos en LiteRT, lo que limita su adopcion inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 128 expertos, 8 activos por token) |
| Parametros totales | 30,5 B |
| Parametros activos | 3,3 B |
| Longitud de contexto | 2.048 o 4.096 tokens (segun artefacto) |
| Tipos de cuantizacion | Expertos int4 blockwise (bloque 32); atencion y lm_head int4 (fichero 2048) o int8 per channel (fichero 4096); router, norms y tabla de tokens en fp32 |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura mixture-of-experts: 48 capas, cada una con 128 expertos de los que se activan 8 por token mediante un router. Esto da 30,5 B de parametros totales con solo 3,3 B activos, lo que reduce el coste computacional por token de forma significativa. La plantilla de chat activa el modo thinking por defecto, de modo que cada respuesta comienza con un bloque de razonamiento interno.

La conversion a LiteRT-LM se realizo tensor a tensor con la API LiteRT Tensor (commit `dcb657e8` con un pequeno parche en los scripts de conversion) a partir del checkpoint en bf16, y se empaqueto con litert-lm-builder 0.19.0. Cada capa incorpora los 128 expertos como una unica operacion custom `moe` con activacion SiLU. El grafo fue reescrito para GPU: RMSNorm, q/k norm con RoPE, escritura de KV cache y matmuls de atencion son operaciones compuestas `odml.*`, y el router aplica softmax solo a los 8 logits superiores. El fichero de 2.048 tokens declara activaciones fp16; el de 4.096 declara fp32. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el proceso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo thinking activado por defecto en la plantilla de chat.
- Generacion de codigo y resolucion de problemas matematicos (capacidades heredadas del modelo base Qwen3-30B-A3B).
- Soporte de conversaciones multi-turno, verificado con una conversacion de 3 turnos en las pruebas de precision del autor.
- Capacidades multilingues limitadas: la model card solo declara ingles (`en`).
- No se documenta soporte de tool calling ni function calling en esta conversion.
- No se documenta soporte de vision ni audio.
- Inferencia acelerada por WebGPU con kernels compuestos optimizados.

## Casos de uso

- Inferencia local en equipos Apple Silicon: el modelo decodifica a 101,49 tokens/s en un Apple M4 Max con WebGPU usando el fichero de 2.048 tokens, lo que lo hace adecuado para asistentes locales interactivos en portatiles y estaciones de trabajo Mac.
- Prototipado de aplicaciones de razonamiento con modo thinking: al activar por defecto el bloque de pensamiento, es util para experimentar con cadenas de razonamiento en tareas de logica y matematicas sin depender de la nube.
- Desarrollo y pruebas de pipelines LiteRT-LM: sirve como referencia para validar kernels MoE con SiLU, operaciones `odml.sdpa_transposed` y graficos reescritos para GPU en el ecosistema LiteRT.
- Generacion de codigo en entornos sin conectividad: con 3,3 B de parametros activos y cuantizacion int4, puede ejecutarse en hardware de consumo para autocompletado y explicacion de codigo en ingles.
- Conversaciones multi-turno con contexto moderado: el artefacto de 4.096 tokens permite mantener dialogos de varias interacciones, aunque el contexto es reducido frente al modelo original.
- Evaluacion comparativa de tecnicas de cuantizacion: los dos artefactos (int4 vs int8 en atencion) permiten medir el impacto de la precision en velocidad y calidad sobre el mismo conjunto de expertos.
- Investigacion sobre eficiencia de MoE en el borde: util para estudiar el rendimiento de un MoE de 30B en GPUs integradas y comparar con alternativas densas del mismo tamano activo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son mediciones de velocidad del autor:

| Metrica | Artefacto 2048 | Artefacto 4096 |
|---|---|---|
| Decodificacion (Apple M4 Max, WebGPU) | 101,49 tok/s | 80,50 tok/s |
| Mejora de decodificacion tras reescritura GPU (2026-11-11) | +43,5 % | +56,0 % |
| Mejora de decodificacion tras cambio a int4 en atencion (2026-11-12) | +16,8 % | no aplica |
| Mejora de prefill tras cambio a int4 en atencion (2026-11-12) | +15,4 % | no aplica |
| Precision (12 preguntas, greedy) | 12/12 en WebGPU | 12/12 en WebGPU y CPU |

## Requisitos de hardware

- VRAM/almacenamiento: cada artefacto ocupa 20,65 GB (20.650.316.480 bytes), por lo que se necesita al menos esa cantidad de memoria unificada o VRAM disponible, mas el overhead del runtime y del KV cache.
- GPU recomendadas: Apple M4 Max es el hardware de referencia medido. No se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo con memoria suficiente: requiere aproximadamente 21 GB, lo que excluye GPUs de 8, 12 y 16 GB; encaja en equipos con 24 GB o mas (por ejemplo, RTX 3090/4090 de 24 GB, si el runtime LiteRT-LM soporta esas GPUs, extremo no confirmado en la informacion).
- Opciones de despliegue: exclusivamente runtime LiteRT-LM compilado desde fuente con los PR #11192 (kernel GPU) y #11188 (kernel XNNPACK CPU) de LiteRT. LiteRT-LM 0.19.1 no ejecuta estos ficheros. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 101,49 tok/s de decodificacion en Apple M4 Max con WebGPU (fichero 2048); 80,50 tok/s con el fichero 4096. El fichero 4096 mantiene en CPU la velocidad de prefill y decodificacion de la version anterior.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3-30B-A3B (LiteRT-LM, esta ficha) | 30,5 B / 3,3 B | 2.048 o 4.096 | Apache 2.0 | LiteRT-LM, requiere build desde fuente |
| Qwen/Qwen3-30B-A3B (original) | 30,5 B / 3,3 B | no disponible en la informacion | Apache 2.0 | safetensors en Hugging Face |
| Alternativas de mismo tamano activo | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros modelos de la misma categoria no puede completarse con los datos proporcionados; solo se dispone del modelo base original como referencia directa.

## Limitaciones y advertencias

- Contexto muy reducido: 2.048 o 4.096 tokens frente a la ventana mucho mayor del modelo original, lo que limita tareas de documento largo y conversaciones extensas.
- Idioma: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Dependencia de una build no publicada: requiere LiteRT-LM compilado desde fuente con dos pull requests abiertos en LiteRT; la version estable 0.19.1 falla con error de activacion SiLU no soportada en la operacion `moe`.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en esta conversion.
- La cuantizacion int4 en expertos y atencion puede degradar la calidad frente al checkpoint bf16 original; solo se documenta una prueba de 12 preguntas y 3 turnos, insuficiente para caracterizar la degradacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor enlaza a la licencia del modelo base; conviene verificar los terminos de Qwen3-30B-A3B.
- Sin soporte documentado de tool calling, vision ni audio en esta conversion.
- Rendimiento medido unicamente en Apple M4 Max; no hay datos para otras plataformas.
- El modelo es sensible a la version del runtime: los artefactos cambian de hash y de comportamiento entre actualizaciones (2026-11-11 y 2026-11-12).

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Qwen3-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- Mediciones: https://huggingface.co/litert-community/Qwen3-30B-A3B/blob/main/MEASUREMENTS.md
- Script de conversion int4 de atencion: https://github.com/john-rocky/hf-to-litertlm/blob/main/qwen3_30b_a3b_work/int4_attention.py
- Script de reescritura de decodificacion: https://github.com/john-rocky/hf-to-litertlm/blob/main/qwen3_30b_a3b_work/decode_rewrite.py
- Script de reescritura GPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/qwen3_30b_a3b_work/gpu_rewrite.py
- Script de tipo de activacion: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/set_activation_type_inplace.py
- PR LiteRT kernel GPU SiLU: https://github.com/google-ai-edge/LiteRT/pull/11192
- PR LiteRT kernel XNNPACK SiLU: https://github.com/google-ai-edge/LiteRT/pull/11188
- Paper Qwen3 (referencia arXiv): https://arxiv.org/abs/2505.09388
