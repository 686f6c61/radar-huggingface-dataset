# luokelabs/gemma-4-31B-it-ane-16k-research

## Resumen

Gemma 4 31B IT para el Apple Neural Engine (16K de contexto) es una release de investigación de Luoke Labs que compila el modelo denso Gemma 4 31B instruction-tuned de Google para ejecutarse íntegramente en la Neural Engine (ANE) de los Apple Silicon mediante Core AI en macOS 27. El modelo se distribuye cuantizado a aproximadamente 3,8 bits por peso y está empaquetado en trozos multifunción `.aimodel`, no en safetensors ni GGUF. Su relevancia radica en demostrar que un modelo de 31B parámetros puede correr en un Mac de 32 GB de memoria unificada aprovechando la NPU en lugar de la GPU, con menor consumo energético por token generado.

El autor lo publica como experimento, no como producto: no hay garantías de soporte ni de actualizaciones. La decodificación especulativa se delega a un drafter MTP de Google que corre en la GPU, mientras el modelo principal lo hace en la ANE, combinando ambos motores en un mismo Mac mini M6 de 32 GB.

La arquitectura subyacente es la de Gemma 4 31B denso (transformer), instruction-tuned, con contexto extendido a 16K tokens en esta compilación. La licencia es Apache-2.0, sujeta además a los términos de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B IT), compilado para Apple Neural Engine via Core AI |
| Parametros totales | 31B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16K tokens (tiers de 4K/8K/16K) |
| Tipos de cuantizacion | ~3,8 bits por peso: capas 0-35 con LUT de 4 bits (tabla de 16 entradas por tensor, repetida cada 128 canales de salida, escala fp16 por canal); capas 36-59 con LUT vectorial de 3 bits (pares de pesos, codebook de 64 entradas) sobre pesos rotados con block-Hadamard |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (sujeta a los terminos de Gemma 4 de Google) |
| Formato de pesos | Paquetes Core AI `.aimodel` (chunks multifuncion), `embed_f16.npy`, `final_norm.npy`, `manifest.json`; no compatible con transformers, MLX ni llama.cpp |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it-qat-q4_0-unquantized`, un transformer denso de 31B parámetros instruction-tuned. Luoke Labs no entrena el modelo: recompila y recuantiza los pesos para la ANE. La cuantización sigue un pipeline de GPTQ, destilación por capas y destilación de modelo completo contra los logits fp32, usando WikiText-2 y texto de chat autogenerado como datos de calibración. El resultado son 10 chunks multifuncion de 6 capas cada uno (`chunk_L00-05.aimodel` … `chunk_L54-59.aimodel`) con puntos de entrada para 1/8/32/64 tokens y tiers de contexto de 4K/8K/16K, más un `head.aimodel` con la normalización final y la cabeza de salida.

La innovación técnica principal es la decodificación especulativa híbrida: el modelo principal se ejecuta en la ANE y el drafter MTP de Google corre en la GPU vía MLX, lo que eleva el throughput de decodificación por encima de la ejecución puramente en GPU. Los embeddings de tokens se consultan en la CPU (`embed_f16.npy`). El runtime se apoya en ANEMLL Forge (MIT).

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, instruction-tuned).
- Contexto largo de hasta 16K tokens, con tiers intermedios de 4K y 8K.
- Decodificación especulativa con drafter MTP para acelerar la generación.
- Capacidades multilingües limitadas a inglés y chino.
- Solo texto: las torres de visión y audio no están incluidas en esta compilación.
- Decodificación greedy únicamente (sin sampling configurable en esta release).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac de 32 GB: ejecutar un modelo de 31B en un Mac mini M6 sin GPU dedicada, aprovechando la ANE y dejando la GPU libre para el drafter especulativo.
- Procesamiento de documentos largos en local: con 16K de contexto se pueden resumir o extraer información de contratos, informes o transcripciones sin salir del equipo.
- Asistentes conversacionales de escritorio: el modelo mantiene conversaciones multi-turno con contexto amplio y un consumo energético de 0,92 J por token generado, adecuado para sesiones prolongadas.
- Evaluación de cuantización extrema: servir como banco de pruebas para estudiar el impacto de 3,8 bits por peso frente a 4,5 bits en tareas como IFEval, HumanEval+ y CMMLU.
- Investigación en aceleración por NPU: medir latencia, throughput y stalls de la ANE en distintos tiers de contexto y tamaños de prompt.
- Prototipado de pipelines híbridos CPU/GPU/ANE: validar arquitecturas que reparten embeddings en CPU, modelo principal en ANE y drafter en GPU.
- Chat en inglés o chino en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del Mac.

## Benchmarks y rendimiento

Rendimiento medido en un Mac mini (M6, 32 GB), decodificación greedy, comparado con el mismo modelo en GPU (MLX 4-bit QAT + MTP):

| Metrica | ANE (este modelo) | GPU (MLX) |
|---|---|---|
| Decodificacion con MTP, prompts cortos | 26,1 tok/s | 19,9 tok/s |
| Decodificacion con MTP a 1K / 8K / 15K de contexto | 32,1 / 20,5 / 20,1 tok/s | 17,8 / 13,8 / 11,2 tok/s |
| Prefill, 500-1000 tokens | 220-235 tok/s | 236-244 tok/s |
| Prefill, 15K tokens | 69,6-75,1 s | 71,4 s |
| Energia por token generado (maquina completa) | 0,92 J | 2,24 J |
| KL vs fp32 (ref64) | 0,220 | 0,172 |
| Top-1 vs fp32 (ref64) | 59 de 64 | 61 de 64 |

Calidad en un piloto de 160 items:

| Benchmark | ANE 3,8 bits (este modelo) | GPU 4,5 bits |
|---|---|---|
| IFEval | 82,8% | 85,9% |
| HumanEval+ | 90,6% | 93,8% |
| CMMLU | 67,2% | 68,8% |

## Requisitos de hardware

- Mac Apple Silicon con 32 GB de memoria unificada (requisito estricto; quedan 3-5 GB libres durante la ejecución).
- macOS 27 con Core AI.
- 30+ GB de disco libre para la caché de compilación.
- La primera carga compila el modelo para la ANE: varios minutos, una vez por build de macOS.
- GPU recomendadas: no aplica para el modelo principal (corre en ANE); el drafter MTP corre en la GPU del mismo Mac.
- Cabe en GPU consumer: no aplica; no se ejecuta en GPUs NVIDIA ni en MLX/llama.cpp.
- Opciones de despliegue: repositorio `github.com/luokelabs/gemma4-31b-ane` con `scripts/setup.sh`, `scripts/download.sh` y `chat.py`; runtime basado en ANEMLL Forge.
- Latencia y throughput: ver tabla de benchmarks (26,1 tok/s en prompts cortos, 20,1 tok/s a 15K de contexto; prefill de 220-235 tok/s en prompts cortos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| luokelabs/gemma-4-31B-it-ane-16k-research | 31B | 16K | `.aimodel` (Core AI) | Apache-2.0 + terminos Gemma 4 | Solo ANE, solo macOS 27, solo texto, greedy |
| google/gemma-4-31B-it-qat-q4_0-unquantized (base) | 31B | no disponible | safetensors | Apache-2.0 + terminos Gemma 4 | Modelo base sin compilar; requiere runtime estandar |
| Gemma 4 31B IT en MLX 4-bit QAT + MTP (referencia del autor) | 31B | 16K (hasta 15K medido) | MLX | Apache-2.0 + terminos Gemma 4 | 19,9 tok/s en prompts cortos; 2,24 J/token |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Macs de 32 GB; no hay versión para otras capacidades de memoria.
- Solo texto: no incluye las torres de visión ni audio del Gemma 4 original.
- Solo decodificación greedy; no se documenta soporte de sampling, temperatura ni top-p.
- La decodificación se reduce aproximadamente a la mitad si otra aplicación satura la GPU (el drafter MTP depende de ella).
- Se observan stalls ocasionales de la ANE de 300-900 ms tras periodos de inactividad.
- Los paquetes `.aimodel` no cargan en transformers, MLX ni llama.cpp; el ecosistema de herramientas es muy limitado.
- Pérdida de calidad frente al modelo de 4,5 bits en GPU: IFEval 82,8% vs 85,9%, HumanEval+ 90,6% vs 93,8%, CMMLU 67,2% vs 68,8%.
- Mayor divergencia respecto a fp32: KL 0,220 vs 0,172 y top-1 59/64 vs 61/64.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Release de investigación sin garantías de soporte ni actualizaciones; mediciones realizadas en una única máquina.
- Licencia Apache-2.0 sujeta adicionalmente a los términos de Gemma 4 de Google; verificar condiciones para uso comercial.
- Riesgo de alucinación y sesgos del modelo base: no cuantificado en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/luokelabs/gemma-4-31B-it-ane-16k-research
- Repositorio del runtime: https://github.com/luokelabs/gemma4-31b-ane
- Resultados y caveats: https://github.com/luokelabs/gemma4-31b-ane/blob/main/docs/results.md
- Receta de cuantización: https://github.com/luokelabs/gemma4-31b-ane/blob/main/docs/quantization.md
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Términos de licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- ANEMLL Forge: https://github.com/Anemll/anemll-forge
