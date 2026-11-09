# pinvou/Ornith-1.5-35B-A3B-NVFP4

## Resumen

Ornith-1.5-35B-A3B-NVFP4 es un artefacto de cuantizacion en formato NVFP4 del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicado por el usuario pinvou y empaquetado especificamente para el motor de inferencia Tachyon. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a W4A16-NVFP4 (con activaciones MoE en FP4-MMA y proyecciones de atencion lineal en FP8) optimizada de extremo a extremo para el hardware NVIDIA GB10 / DGX Spark bajo la arquitectura `sm_121a` y CUDA 13.0. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 35B parametros totales y 3B activos por token, segun se deduce de la nomenclatura A3B.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra que es posible servir un MoE de 35B en un unico dispositivo GB10 con decodificacion especulativa (MTP) adaptativa, kernels FP4-MMA nativos para MoE agrupado, fusion de commit diferido en GDN, streaming de pesos por TMA y un contexto maximo verificado de 262.144 tokens. El autor reporta mejoras sustanciales frente a vLLM en el mismo hardware: decodificacion monoflujo de 104-148 tok/s frente a 74-77 tok/s, y prefill de 6.540-6.570 tok/s frente a 4.843-5.718 tok/s.

El artefacto principal incluye una cabeza de propuesta MTP (multi-token prediction) de 128K y pesa 22.256.155.904 bytes (aproximadamente 22,3 GB). La licencia declarada es Apache-2.0, heredada del modelo base, y el repositorio ocupa 23,6 GB en total incluyendo el binario del motor. La etiqueta `chinese` sugiere soporte del idioma chino, aunque no se detalla la cobertura multilingue completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con atencion lineal (GDN) y atencion completa; decodificacion especulativa MTP |
| Parametros totales | 35B (segun nomenclatura del modelo base) |
| Parametros activos | 3B (segun nomenclatura A3B del modelo base) |
| Longitud de contexto | 262.144 tokens (verificado con prueba de aguja en pajar de 215K) |
| Tipos de cuantizacion | W4A16-NVFP4 en pesos MoE (161 capas), FP8 en proyecciones de atencion lineal, KV cache en FP8; opcion de activaciones MoE en BF16 |
| Idiomas soportados | Chino (etiqueta `chinese`); cobertura completa no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tachyon` (formato propietario del motor Tachyon); no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE de 35B parametros totales con 3B activos, organizado en 161 capas MoE segun la receta de cuantizacion del checkpoint original (modelopt 0.45.0, `hf_quant_config.json`). La arquitectura combina atencion lineal (denominada GDN en la documentacion del motor, con fusion de commit diferido) y atencion completa, lo que permite manejar contextos largos con coste computacional reducido en las capas lineales. Incluye una cabeza de prediccion multi-token (MTP) que actua como modelo borrador para decodificacion especulativa, con una ventana de propuesta de 128K.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica destacable de esta publicacion no reside en el entrenamiento sino en la receta de inferencia: kernels FP4-MMA agrupados para MoE con un coste medido de +0,83% en NLL (perplejidad de 1,683950 a 1,697855 en una evaluacion rapida sobre cuatro dominios), commit diferido y streaming de pesos por TMA que no alteran el NLL (verificado bit a bit), y una politica de escalado adaptativo del borrador MTP que selecciona anchos de verificacion de {1, 3, 5} en funcion de la tasa de aceptacion observada por carril (EWMA) y del ancho de borrador ya almacenado.

## Capacidades

- Generacion de texto autoregresiva con contexto de hasta 262.144 tokens, verificado con pruebas de recuperacion en contexto largo (215K tokens, 3 aciertos).
- Razonamiento multi-paso y generacion de codigo: capacidades heredadas del modelo base, no documentadas en detalle en la model card.
- Decodificacion especulativa con MTP: modo `--draft-tokens auto` que ajusta dinamicamente el ancho de verificacion entre 1, 3 y 5 segun la carga y la tasa de aceptacion.
- Servicio concurrente: soporte de hasta 8 peticiones simultaneas en la configuracion recomendada, con capacidad de KV cache de 262.144 tokens.
- API compatible con OpenAI (`POST /v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Soporte de chino (etiqueta `chinese`); no se detalla la cobertura de otros idiomas.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Servicio de inferencia en un unico DGX Spark: el artefacto esta disenado para desplegarse en un GB10 con el binario `tachyon-serve`, permitiendo servir un MoE de 35B en un dispositivo de escritorio con 22,3 GB de pesos y contexto de 262K tokens.
- Procesamiento de documentos largos: con 262.144 tokens de contexto verificado, el modelo puede resumir, extraer informacion o responder preguntas sobre contratos, informes o bases de codigo que ocupen cientos de miles de tokens sin fragmentacion.
- Generacion de codigo en pipelines internos: la API compatible con OpenAI permite sustituir endpoints existentes en herramientas de autocompletado o revision de codigo, con throughput de 218-230 tok/s en regimen concurrente C8.
- Chat multi-turno con alta concurrencia: la configuracion recomendada soporta 8 peticiones simultaneas con KV cache FP8 y rechazo limpio (HTTP 503) cuando se supera la capacidad, lo que simplifica el control de admision en produccion.
- Evaluacion de modelos en hardware de borde: investigadores que necesiten comparar el comportamiento de un MoE de 35B en un GB10 pueden usar este artefacto con la garantia de reproducibilidad bit a bit reportada para cada configuracion de `--draft-tokens`.
- Prototipado de agentes con contexto largo: el prefill de 2.251-2.408 tok/s en prompts de 215K tokens permite iterar sobre tareas de recuperacion y razonamiento sobre corpus extensos sin esperas excesivas.
- Despliegue con requisitos de determinismo: la validacion reportada incluye verificacion de que cada configuracion produce salidas identicas byte a byte, util para auditoria y pruebas de regresion.

## Benchmarks y rendimiento

Rendimiento medido en GB10 monomaquina con C8 = 8 peticiones concurrentes en pool rotatorio:

| Metrica | Este artefacto | vLLM mejor configuracion en el mismo equipo |
|---|---|---|
| Decode C8 mediana (MTP5, pool de 96 prompts de 2K) | 218-230 tok/s | 219,4 tok/s |
| Agregado C8 carga mixta (auto, escalera de 24 peticiones) | 223,2 tok/s | no disponible |
| Agregado C8 comparativa de modos | auto 223,2 > MTP5 219,7 > MTP1 204,5 tok/s | no disponible |
| Decode monoflujo (MTP1/auto, carga general) | 104 tok/s; rango 107-140 tok/s | 74-77 tok/s (contexto 0,6K) |
| Decode monoflujo (carga de conteo, contexto corto) | 147-148 tok/s | 77 tok/s |
| Prefill (nivel 2K) | 6.540-6.570 tok/s | 4.843-5.718 tok/s |
| Prefill (nivel 2K-32K) | 4.187-5.913 tok/s | no disponible |
| Prefill contexto largo (prompt de 215K tokens) | 2.251-2.408 tok/s | no disponible |
| Coste en NLL de activaciones FP4-MMA | +0,83% (ppl 1,683950 → 1,697855) | no aplica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas de serving, no de calidad de tarea.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA GB10 / DGX Spark (arquitectura `sm_121a`). El motor no soporta otras GPU.
- VRAM: los pesos del artefacto principal ocupan 22.256.155.904 bytes (unos 22,3 GB); a ello se suma la KV cache en FP8 para hasta 262.144 tokens, configurable mediante `--kv-capacity`.
- No cabe en GPU de consumo convencionales (RTX 4090, etc.) porque el binario del motor esta compilado unicamente para `sm_121a`.
- Software: CUDA 13.0 y el binario `tachyon-serve` incluido en `tachyon-serve-gb10-8ae9dbd6.tar.gz`; se recomienda el commit `8ae9dbd6` o posterior del repositorio del motor (commits anteriores corrompen la salida por lotes con `--draft-tokens auto`, y `5f157b52` degrada la calidad en generaciones largas).
- Opciones de despliegue: unicamente el motor Tachyon; no hay soporte para vLLM, llama.cpp, Ollama ni TGI con este formato de pesos.
- Latencia y throughput: ver tabla de benchmarks; el throughput agregado C8 es de 223,2 tok/s en modo auto y el prefill de 2K alcanza 6.540-6.570 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-NVFP4 (este) | 35B totales / 3B activos | 262.144 | Apache-2.0 | `.tachyon` / Tachyon | Solo GB10 |
| Ornith-1.5-35B-A3B (base) | 35B totales / 3B activos | no disponible | Apache-2.0 | safetensors (presumiblemente) | Multiples motores |
| vLLM sobre el mismo modelo base | 35B totales / 3B activos | limitado por checkpoint | Apache-2.0 | pesos originales | GPU NVIDIA con soporte CUDA |

La comparacion directa con otras alternativas de la misma categoria (por ejemplo, otros MoE de 30-40B con 3B activos) no esta disponible en la informacion proporcionada. La unica comparacion cuantitativa publicada es contra vLLM sirviendo el mismo modelo base en el mismo GB10.

## Limitaciones y advertencias

- Dependencia total del hardware: el motor solo funciona en GB10 / DGX Spark (`sm_121a`) con CUDA 13.0; no es portable a otras GPU ni a CPU.
- Formato propietario: los pesos `.tachyon` no son compatibles con safetensors, GGUF, vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y la inspeccion de pesos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base no documenta tasas de alucinacion.
- Sesgos: no documentados. La etiqueta `chinese` sugiere un sesgo de entrenamiento hacia ese idioma, pero no se detalla la composicion del corpus.
- Restricciones de version del motor: usar commits anteriores a `8ae9dbd6` con `--draft-tokens auto` corrompe la salida por lotes; el commit `5f157b52` degrada la calidad en generaciones largas. Es imprescindible fijar la version del binario en produccion.
- Divergencia entre modos de borrador: distintas configuraciones fijas de `--draft-tokens` producen bifurcaciones benignas en la salida greedy (cambio en el orden de acumulacion de coma flotante); cada configuracion es reproducible byte a byte, pero no son intercambiables entre si.
- Coste de calidad por cuantizacion: las activaciones MoE en FP4-MMA introducen un +0,83% de NLL; puede desactivarse con `TACHYON_MOE_FP4MMA=0` a cambio de menor rendimiento.
- Capacidad de concurrencia limitada: la configuracion recomendada fija `--max-concurrency 8`; las peticiones que superan la capacidad de KV reciben un HTTP 503 limpio, sin cola de espera.
- Idiomas: solo se declara chino; no hay evidencia publicada de calidad en castellano u otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el motor tienen sus propias condiciones; conviene verificar el repositorio del motor antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pinvou/Ornith-1.5-35B-A3B-NVFP4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio del motor Tachyon: https://github.com/Pinvou/tachyon-single-qwen
- Documentacion de rendimiento del motor: `docs/performance.md` en el repositorio anterior
