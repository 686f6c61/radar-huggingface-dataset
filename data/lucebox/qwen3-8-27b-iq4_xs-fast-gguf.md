# Lucebox/Qwen3.8-27B-IQ4_XS-fast-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen3.8-27B de Alibaba, preparada por Lucebox con una requantización "pura" a IQ4_XS. El archivo resultante ocupa 13,54 GiB y está optimizado para servirse con el motor de inferencia lucebox, especialmente en GPUs con ancho de banda limitado como la AMD Radeon AI PRO R9700 (arquitectura RDNA4). La propuesta de valor es la velocidad: según las mediciones del autor, alcanza un 12% más de tokens por segundo que la cuantización UD-IQ4_XS de Unsloth, a costa de una pequeña pérdida de calidad medible en perplejidad, divergencia KL y precisión en tareas de código y matemáticas.

El modelo base Qwen3.8-27B es un modelo de lenguaje de 27 mil millones de parámetros desarrollado por Qwen (Alibaba), con licencia Apache 2.0 y una ventana de contexto amplia (hasta 262k tokens según fuentes externas). Esta cuantización concreta está pensada para despliegues de baja latencia donde el rendimiento bruto importa más que la fidelidad máxima al modelo original, y se complementa con un drafter DFlash2 para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3, detalles no especificados en la informacion disponible) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131072 tokens en el ejemplo de servido; el modelo base soporta hasta 262k segun fuentes externas |
| Tipos de cuantizacion | IQ4_XS puro (requantizado con `--pure`), 13,54 GiB |
| Idiomas soportados | No disponible en la ficha de HuggingFace; el modelo base Qwen3.8-27B es multilingue (no confirmado oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido; el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

El archivo es una requantizacion del GGUF IQ4_XS de bartowski, que a su vez deriva del modelo original Qwen3.8-27B. La operacion clave es `llama-quantize --allow-requantize --pure`, que elimina la mezcla de precisiones que bartowski habia introducido como "hedge" de calidad, forzando que todos los tensores sean IQ4_XS puro. Esto reduce el tamano de 14,50 GiB a 13,54 GiB y permite que el kernel de decodificacion lea menos bytes por token, acelerando la inferencia en hardware RDNA4.

El modelo base Qwen3.8-27B es un transformer denso entrenado por Qwen con un contexto largo (262k segun fuentes externas) y licencia Apache 2.0. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de RLHF/DPO en la informacion proporcionada. La cuantizacion IQ4_XS utiliza una matriz de importancia (imatrix) calibrada por bartowski, que se hereda en este archivo.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de lenguaje general, aunque esta cuantizacion concreta sacrifica algo de precision.
- Codigo y matematicas: evaluado con HumanEval (144/164 pass@1) y GSM8K (171/200) en la configuracion pura.
- Decodificacion especulativa: compatible con el drafter DFlash2 de z-lab, que acelera la generacion sin alterar los resultados (verificacion exacta).
- Multilingue: no confirmado para esta cuantizacion; el modelo base probablemente soporta varios idiomas, pero no hay datos oficiales.
- Vision: segun una fuente externa, el modelo base Qwen3.8-27B incluye un "vision encoder" sorpresa, pero no se menciona en la model card del autor ni en la ficha de HuggingFace, por lo que no se puede confirmar para este archivo GGUF.

## Casos de uso

- Servicio de inferencia de alta velocidad en GPUs de consumo o workstation: con 13,54 GiB de pesos, cabe en GPUs con 16 GB de VRAM y puede servirse con lucebox o llama.cpp, alcanzando 37,4 tok/s en decodificacion simple y 235,8 tok/s con decodificacion especulativa DFlash2 en una AMD R9700.
- Asistentes de codigo en entornos con restriccion de VRAM: el modelo mantiene un pass@1 de 144/164 en HumanEval, suficiente para autocompletado y generacion de funciones en pipelines de desarrollo, con latencia reducida gracias a la cuantizacion pura.
- Chatbots y agentes conversacionales con contexto largo: la ventana de 131k tokens (configurable hasta 262k) permite mantener historiales extensos, aunque la calidad ligeramente inferior puede afectar a tareas que requieren alta fidelidad.
- Prototipado rapido y experimentacion local: al ser Apache 2.0 y caber en una GPU de 16 GB, es adecuado para desarrolladores que quieren probar un modelo de 27B sin infraestructura cloud.
- Generacion de documentacion tecnica y resumen de textos largos: el contexto amplio y la velocidad de decodificacion permiten procesar documentos extensos con un throughput de 174,5 tok/s end-to-end.
- Evaluacion comparativa de cuantizaciones: este archivo sirve como referencia para medir el impacto de la cuantizacion pura frente a la UD-IQ4_XS en tareas de calidad y velocidad, util para equipos que optimizan su stack de inferencia.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones comparativas frente a una referencia Q8_0 y frente al archivo UD-IQ4_XS de Unsloth. Los datos se obtuvieron con 300x512-chunk de wikitext-2 para divergencia KL, HumanEval-164 y GSM8K-200 a traves del servidor, con verificacion exacta de la decodificacion especulativa.

| Metrica | Este archivo (pure IQ4_XS) | UD-IQ4_XS (Unsloth) |
|---|---|---|
| Tamano | 13,54 GiB | 13,27 GiB |
| HumanEval decode (DFlash2 block 16) | 235,8 tok/s (pico 257,3) | 208,1 tok/s |
| End-to-end (mismos 10 prompts) | 174,5 tok/s | 156,2 tok/s |
| Decodificacion simple | 37,4 tok/s | 32,3 tok/s |
| Perplejidad vs Q8_0 | +1,9% | +0,7% |
| Divergencia KL media vs Q8_0 | 0,028 | 0,018 |
| Acuerdo top-1 con Q8_0 | 92,0% | 94,1% |
| HumanEval pass@1 | 144/164 | 151/164 |
| GSM8K (primeros 200) | 171/200 | 177/200 |

No se han publicado resultados de benchmarks adicionales (MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 13,54 GiB; con overhead de contexto y cache KV (q8_0 en el ejemplo), se recomienda al menos 16 GB de VRAM. Para contexto de 131k con cache q8_0, puede necesitarse mas.
- GPU recomendadas: AMD Radeon AI PRO R9700 (RDNA4) es la plataforma de medicion del autor; tambien deberia funcionar en GPUs NVIDIA con 16 GB o mas (RTX 4080/4090, A100, etc.) y en hardware Apple Silicon con suficiente memoria unificada.
- Cabe en GPUs de consumo: si, en tarjetas con 16 GB de VRAM o mas, aunque con contexto reducido.
- Opciones de despliegue: lucebox (motor recomendado, con soporte DFlash2), llama.cpp, Ollama (si se convierte a formato compatible), TGI o vLLM (si aceptan GGUF, aunque no esta confirmado).
- Latencia y throughput: 37,4 tok/s en decodificacion simple y 174,5 tok/s end-to-end con DFlash2 en la GPU de referencia; en hardware inferior los valores seran menores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262k (segun fuentes) | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Lucebox Qwen3.8-27B IQ4_XS pure | 27B | 131k (configurable) | Apache 2.0 | GGUF | Cuantizacion pura, maxima velocidad |
| Unsloth UD-IQ4_XS | 27B | 131k (configurable) | Apache 2.0 | GGUF | Cuantizacion con mejor calidad, menor velocidad |
| bartowski IQ4_XS | 27B | 131k (configurable) | Apache 2.0 | GGUF | Cuantizacion original con mezcla de precisiones |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos para comparar con otros modelos de 27B (como Llama 3.1 27B o Mistral Large) en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad reducida frente a otras cuantizaciones: la cuantizacion pura IQ4_XS aumenta la perplejidad un 1,9% frente a Q8_0 y reduce el acuerdo top-1 al 92%, con una perdida medible en HumanEval (144 vs 151) y GSM8K (171 vs 177) respecto al UD-IQ4_XS.
- Riesgo de alucinacion: inherente a modelos de este tamano; la cuantizacion puede exacerbar errores en tareas de precision.
- Sesgos: no se han documentado sesgos especificos para esta cuantizacion; el modelo base puede heredar sesgos de sus datos de entrenamiento, no disponibles.
- Limitaciones de contexto: aunque el modelo base soporta hasta 262k, el ejemplo de servido usa 131k; el uso de contextos muy largos con cuantizacion IQ4_XS puede degradar la calidad en atencion a posiciones lejanas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el archivo GGUF depende de herramientas de terceros (llama.cpp, lucebox) con sus propias licencias.
- Dependencia de hardware especifico: las ganancias de velocidad se midieron en RDNA4; en otras arquitecturas (NVIDIA, Apple) el beneficio puede ser menor o nulo.
- Verificacion de decodificacion especulativa: el drafter DFlash2 debe convertirse y configurarse correctamente; si no se usa, la velocidad se reduce a la decodificacion simple (37,4 tok/s).

## Enlaces

- Repositorio HuggingFace del archivo: https://huggingface.co/Lucebox/Qwen3.8-27B-IQ4_XS-fast-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Lucebox con metodologia y comparativa: https://www.lucebox.com/blog/qwen38-r9700
- Repositorio de Lucebox (motor de inferencia): https://github.com/Luce-Org/lucebox
- GGUF de bartowski (base de la requantizacion): https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- GGUF de Unsloth (alternativa UD-IQ4_XS): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Drafter DFlash2 de z-lab: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Guia local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Guia de despliegue rapido: https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
- Guia de ejecucion local con Ollama y GGUF: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
