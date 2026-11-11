# hletrd/Qwen3.5-4B-Tensix-BFP8

## Resumen

Qwen3.5-4B-Tensix-BFP8 es una cuantizacion del modelo multimodal Qwen/Qwen3.5-4B realizada por Xylolabs (publicada bajo el identificador de Hugging Face hletrd) para su ejecucion en aceleradores Tensix de Tenstorrent, como Wormhole y Blackhole. El modelo conserva la arquitectura original de Qwen3.5, que combina capas de atencion con capas Gated DeltaNet, e incorpora un bloque MTP (multi-token prediction) y un modulo visual, aunque solo el modelo de lenguaje ha sido cuantizado y evaluado.

La particularidad tecnica es que las proyecciones lineales se han redondeado a la rejilla de `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloque) mediante GPTQ, de forma que TT-NN pueda empaquetar los pesos sin volver a redondearlos. Los tensores se almacenan en bf16 en safetensors, pero todos los valores ya estan alineados a la rejilla BFP8. El resultado ocupa 5,07 GB empaquetados, con una media de 9,63 bits por peso.

El modelo es relevante para quienes despliegan LLM en hardware de Tenstorrent y necesitan una version de Qwen3.5-4B que aproveche el formato nativo bfloat8_b del stack tt-metal/ttnn sin degradar en exceso la calidad respecto a BF16. Segun la model card, la perdida media de KL frente a BF16 es de 0,00084 y el top-1 se mantiene en el 98,62 %, con cero respuestas perdidas en el conjunto de evaluacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y Gated DeltaNet (arquitectura Qwen3.5), con bloque MTP y modulo visual |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en proyecciones lineales); resto de tensores en bf16 |
| Idiomas soportados | no disponibles (evaluado en ingles y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores alineados a la rejilla BFP8); incluye `quant4.json` con el formato por proyeccion |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que alterna capas de atencion (8 capas, segun la tabla de formatos) con capas Gated DeltaNet (24 capas), ademas de 32 capas MLP con proyecciones gate, up y down. Incluye un bloque MTP y un modulo visual (`visual`), lo que explica el pipeline `image-text-to-text`. Esta cuantizacion no reentrena el modelo: aplica GPTQ sobre la rejilla bfloat8_b para redondear las proyecciones lineales, calibrando con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El exponente compartido de cada bloque lo fija el propio empaquetador de TT-NN.

Los tensores cuantizados son las proyecciones q, k, v y o de atencion, las q, k, v, z, a, b y output de Gated DeltaNet, y las gate, up y down del MLP. Permanecen en bf16 la LM head (atada al embedding), el embedding, las normas, el bloque MTP y el modulo visual. El autor solo ha redondeado y evaluado el modelo de lenguaje. La innovacion principal es el empaquetado directo al formato nativo del hardware: los pesos bf16 en disco ya estan sobre la rejilla BFP8, por lo que TT-NN los carga sin un segundo redondeo, a diferencia de otras rutas de conversion.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento con modo thinking: la evaluacion incluye 7 prompts de razonamiento ejecutados con thinking activado.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque el modulo visual no fue cuantizado ni evaluado.
- Prediccion multi-token mediante el bloque MTP del modelo base.
- Capacidades multilingues heredadas del modelo base (evaluado en ingles y coreano; lista completa de idiomas no disponible).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: cargar el checkpoint en Wormhole o Blackhole a traves de tt-metal/ttnn aprovechando que los pesos ya estan en la rejilla bfloat8_b, evitando el redondeo adicional en el empaquetado.
- Prototipado en simulador: validar pipelines de inferencia sobre `ttsim` (simulador de Blackhole) antes de disponer de hardware, usando `pack_tensix.py` y `verify_grid.py` para comprobar la integridad del empaquetado.
- Inferencia conversacional de bajo coste en memoria: los 5,07 GB empaquetados frente a los 8,41 GB en BF16 permiten ajustar el uso de DRAM en dispositivos con memoria limitada.
- Evaluacion de calidad de cuantizacion: usar el modelo como referencia para medir la deriva (KL, top-1) frente a BF16 y a Q4_K_M en tareas de texto en ingles y coreano.
- Servicio de chat con plantilla estandar: la compatibilidad con `transformers` y `AutoModelForCausalLM` permite integrarlo en endpoints compatibles sin cambiar el codigo de cliente.
- Investigacion sobre formatos block floating point: comparar el comportamiento de BFP8 con GPTQ frente a otras cuantizaciones (Q4_K_M) sobre el mismo checkpoint base.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La evaluacion de KL y top-1 cubre 16.312 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas 7 de razonamiento con thinking (40 en total).

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B) | 16 | 8,41 | 0 | 100 | 36 de 40 | - |
| Este modelo (BFP8) | 9,63 | 5,065 | 0,00084 | 98,62 | 35 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,13 | 2,783 | 0,03981 | 89,79 | 37 de 40 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 5,07 GB empaquetados en BFP8; el repositorio ocupa 10,6 GB por almacenar los tensores en bf16 en disco.
- Hardware objetivo: NPUs Tensix de Tenstorrent (Wormhole y Blackhole). Probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; no se ha ejecutado en hardware real segun la model card.
- GPU convencionales: no se documenta soporte especifico; al ser un checkpoint `transformers` en bf16 puede cargarse con `device_map="auto"`, pero el beneficio de tamano solo se materializa en TT-NN.
- Despliegue: `transformers` (AutoModelForCausalLM), tt-metal/ttnn (empaquetado con `pack_tensix.py`), tt-forge/tt-xla (no probado con este checkpoint). vLLM, llama.cpp, Ollama y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Bits por peso | Tamano (GB) | KL vs BF16 | Top-1 (%) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| Este modelo (BFP8) | 5,30 B | 9,63 | 5,065 | 0,00084 | 98,62 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (BF16) | 5,30 B | 16 | 8,41 | 0 | 100 | apache-2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 5,30 B | 5,13 | 2,783 | 0,03981 | 89,79 | apache-2.0 (derivada) | generado localmente |

La comparativa se limita a variantes de cuantizacion del mismo checkpoint base; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; el modulo visual y el bloque MTP permanecen en bf16 y no han sido evaluados.
- El checkpoint no se ha ejecutado en hardware Tensix real: las pruebas se hicieron en `ttsim` con ttnn 0.81.1.
- El demo de tt-metal para Qwen3.5/3.6 (v0.81.1) no lista Qwen3.5-4B y ademas empaqueta las proyecciones gate y up del MLP en bfloat4_b, lo que vuelve a redondear estos pesos BFP8; para ese demo el autor indica que encaja mejor la exportacion BFP4.
- tt-forge (tt-xla) no se ha probado con este checkpoint; su opcion `bfp_bf8` usa el layout [out, in] de PyTorch y re-redondea los valores.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Qwen3.5-4B.
- Idiomas soportados: no se publica la lista completa; la evaluacion cubre solo ingles y coreano.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Licencia apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- La perdida de calidad, aunque baja (KL 0,00084, top-1 98,62 %), no es nula: una respuesta de 40 se pierde respecto a BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.5-4B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Qwen3.5/3.6 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/hletrd/Qwen3.5-4B-Tensix-BFP8/blob/main/LICENSE
