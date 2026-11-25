# morriszjm/Llama-3.1-8B-Instruct-SPECTRA-Flash

## Resumen

Llama-3.1-8B-Instruct-SPECTRA-Flash es un conjunto de parametros de compresion de la cache KV (KV cache) para el modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario morriszjm en Hugging Face. No es un modelo nuevo, sino un "delta": un repositorio de 1,5 GB que contiene unicamente los mapas de registros (record maps) del metodo SPECTRA-Flash, mientras que los pesos del modelo base siguen siendo los de Meta y no se modifican. El objetivo es reducir drasticamente el coste de memoria y aumentar el rendimiento en decodificacion durante la inferencia de contexto largo.

El metodo, desarrollado en el contexto del proyecto SPECTRA (Nokia Applied Research), comprime la cache KV aproximadamente 7 veces (de 128 KiB a 18,5 KiB por token) manteniendo una calidad casi identica al modelo denso. En la evaluacion con LongBench sobre 8 tareas en ingles, el promedio cae solo un 0,7 % (53,45 frente a 53,80). En velocidad, la decodificacion a batch 1 iguala al denso (7,24 ms por paso) y el throughput maximo alcanza 2.732 tok/s a batch 64, un 4,3 % superior al denso en el mismo hardware.

Es relevante ahora porque ataca uno de los cuellos de botella principales del despliegue de LLM con contexto largo: el consumo de memoria de la cache KV durante la generacion. Al integrarse sobre Llama-3.1-8B-Instruct, un modelo ampliamente desplegado, permite servir cargas de trabajo de 32K tokens con mayor concurrencia en una sola GPU Hopper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con cache KV comprimida SPECTRA-Flash (FlashMLA, 512 dims latentes + 64 dims RoPE, fp8) |
| Parametros totales | 8 mil millones (modelo base Llama-3.1-8B-Instruct); el delta SPECTRA-Flash ocupa 1,5 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion evaluada con `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible para los pesos del modelo base; la cache KV se almacena en fp8 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License); el codigo SPECTRA es MIT |
| Formato de pesos | safetensors (`params.safetensors`, 1,5 GB, solo mapas de registros; los pesos base se cargan desde Meta) |

## Arquitectura y entrenamiento

SPECTRA-Flash no entrena un modelo nuevo, sino que ajusta los mapas de registros que transforman la cache KV del transformer Llama 3.1 en una representacion latente comprimida. Cada capa mantiene un registro por token en el formato que FlashMLA lee de forma nativa: 512 dimensiones latentes mas 64 dimensiones RoPE, almacenadas en fp8. Los mapas parten de un ajuste en forma cerrada de SPECTRA (una SVD ponderada por activaciones) y se refinan mediante destilacion por bloques sobre texto de calibracion (WikiText-2 train y codigo Python), con un coste de 2,6 horas de GPU H100.

En la decodificacion, la atencion lee el registro fp8 a traves de FlashMLA junto con una ventana exacta pequena (los primeros 4 y los ultimos 123 tokens) y fusiona ambas en un unico softmax, sin reconstruir la cache completa. La conversion de los parametros se realiza con `spectra-flash convert` en 51 minutos sobre 4 GPU H100 NVL. El modelo base Llama 3.1-8B-Instruct emplea un transformer decoder-only estandar con 8 mil millones de parametros, entrenado por Meta con datos multilingues y ajustado con RLHF; los detalles exactos de ese entrenamiento no se recogen en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento en ingles, heredadas del modelo base Llama-3.1-8B-Instruct.
- Procesamiento de contexto largo: ventana de 32K tokens con compresion de cache KV de aproximadamente 6,4x en las prompts evaluadas (mediana de 5,7K tokens).
- Decodificacion de alta concurrencia: hasta 2.732 tok/s a batch 64 en una H100 NVL.
- Integracion con vLLM 0.29 mediante `SpectraFlashLlamaForCausalLM` y con Transformers mediante `spectra.flash.enable`.
- Soporte de FlashMLA en GPU Hopper (H100 / H200).
- Capacidades de tool calling, agentes y vision: no disponibles en la informacion proporcionada (dependen del modelo base; esta ficha no las confirma).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Analisis de documentos largos: resumir o responder preguntas sobre contratos, informes o articulos de hasta 32K tokens; la compresion 6,4x de la cache KV permite mantener mas documentos en memoria simultaneamente en una sola H100.
- Generacion aumentada por recuperacion (RAG) con contexto extenso: inyectar multiples fragmentos recuperados (por ejemplo, 20-30 pasajes) sin agotar la memoria de la GPU, manteniendo una calidad del 99,3 % respecto al denso en LongBench.
- Atendimiento al cliente con historiales largos: gestionar conversaciones multi-turno con contexto acumulado de decenas de miles de tokens, con throughput de hasta 2,26x el denso en escenarios de 8K de prompt y 2K de salida.
- Procesamiento por lotes de codigo: tareas de comprension y generacion sobre repositorios (RepoBench-P, LCC) con calidad practicamente identica al modelo denso y mayor concurrencia por GPU.
- Servicio de inferencia de alto rendimiento: desplegar Llama-3.1-8B-Instruct en vLLM con `SpectraFlashLlamaForCausalLM` para aumentar las peticiones concurrentes por GPU en cargas de 32K tokens.
- Evaluacion e investigacion de compresion de cache KV: usar los mapas de registros como referencia reproducible para comparar tecnicas de compresion (SPECTRA frente a cuantizacion convencional) con el script `run_longbench.py`.
- Resumen de reuniones y transcripciones: procesar transcripciones de hasta 32K tokens (QMSum, SAMSum) con un coste de memoria reducido en entornos con una sola GPU Hopper.

## Benchmarks y rendimiento

LongBench, 8 tareas en ingles (prompts y scorer oficiales, split de test completo, greedy), con el motor SPECTRA-Flash frente al mismo motor con cache densa:

| Tarea | Denso (bf16) | SPECTRA-Flash |
|---|---|---|
| Qasper | 46,44 | 44,68 |
| QMSum | 25,52 | 25,02 |
| MultiNews | 26,86 | 25,62 |
| TREC | 72,50 | 72,50 |
| TriviaQA | 91,64 | 92,19 |
| SAMSum | 43,83 | 42,80 |
| LCC | 64,85 | 65,07 |
| RepoBench-P | 58,76 | 59,70 |
| **Promedio** | **53,80** | **53,45 (99,3 %)** |

Rendimiento en H100 NVL, contexto de 32K, frente a denso bf16 con FlashAttention-3 y CUDA graphs:

| Metrica | Denso | SPECTRA-Flash |
|---|---|---|
| Cache KV por token | 128 KiB | 18,5 KiB |
| Paso de decodificacion, batch 1 | 7,24 ms | 7,24 ms |
| Paso de decodificacion, batch 16 | 24,89 ms | 10,56 ms |
| Throughput maximo de decodificacion | 643 tok/s (batch 16) | 2.732 tok/s (batch 64), 4,3x |
| Throughput de servicio vLLM | 1,00x | 1,21-2,26x |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los pesos del modelo base en bf16 ocupan aproximadamente 16 GB, a lo que se suma la cache KV comprimida (18,5 KiB por token) y el delta de 1,5 GB de mapas de registros.
- GPU requeridas: Hopper (H100 / H200); la model card indica explicitamente que necesita una GPU Hopper por el uso de FlashMLA.
- GPU de consumo: no compatible segun la informacion disponible (no se mencionan RTX 4090 ni otras arquitecturas).
- Despliegue: vLLM 0.29 con `--hf-overrides` y arquitectura `SpectraFlashLlamaForCausalLM`; Transformers con `spectra.flash.enable`; instalacion via `pip install -e 'SPECTRA[flash]'`.
- Restricciones de despliegue: una sola GPU (tensor parallel size 1), sin prefix caching, sin decodificacion especulativa y sin conectores KV en vLLM; en Transformers solo lotes sin padding (batch 1 o prompts de igual longitud).
- Latencia y throughput: paso de decodificacion de 7,24 ms a batch 1 y 10,56 ms a batch 16; hasta 2.732 tok/s a batch 64; throughput de servicio vLLM entre 1,21x y 2,26x el denso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion de cache KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SPECTRA-Flash | 8B | 32K | 7x (18,5 KiB/token) | llama3.1 | Hugging Face (delta) |
| Llama-3.1-8B-Instruct (denso) | 8B | 128K | 1x (128 KiB/token) | llama3.1 | Hugging Face |
| Otros metodos de compresion de cache KV para Llama-3.1-8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas especificas de compresion de cache KV no esta disponible en la informacion proporcionada. Frente al modelo base denso, SPECTRA-Flash reduce la cache por token de 128 KiB a 18,5 KiB, mantiene la calidad en LongBench al 99,3 % y multiplica por 4,3 el throughput maximo de decodificacion en H100 NVL.

## Limitaciones y advertencias

- Solo funciona con Llama-3.1-8B-Instruct en bfloat16; no es aplicable a otros modelos sin reconversion.
- Requiere GPU Hopper (H100 / H200) y una sola GPU (tensor parallel size 1); no hay soporte para GPU de consumo.
- En vLLM no admite prefix caching, decodificacion especulativa ni conectores KV.
- En Transformers solo soporta lotes sin padding (batch 1 o prompts de igual longitud).
- El repositorio contiene solo los mapas de registros (1,5 GB); es necesario aceptar la licencia de Llama 3.1 y descargar los pesos base desde Meta.
- Idiomas: limitado al ingles segun la model card; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base Llama-3.1-8B-Instruct.
- Licencia: los parametros derivan de Llama 3.1 y se distribuyen bajo la Llama 3.1 Community License, con su Acceptable Use Policy; el uso comercial esta sujeto a dicha licencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados publicados.
- La fecha de creacion del repositorio (2026-11-25) y la referencia arXiv:2608.07915 deben verificarse antes de su uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/morriszjm/Llama-3.1-8B-Instruct-SPECTRA-Flash
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Codigo SPECTRA: https://github.com/nokia-applied-research/SPECTRA
- Paper: https://arxiv.org/abs/2608.07915
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Acceptable Use Policy: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/USE_POLICY.md
