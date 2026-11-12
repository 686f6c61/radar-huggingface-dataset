# bradshaw-ai/Swift-1.5-27B-6.3bpw-RCO-SAR-Marlin-MTP

## Resumen

Swift-1.5-27B-6.3bpw-RCO-SAR-Marlin-MTP es un checkpoint cuantizado de forma agresiva del modelo base UkisAI/Swift-1.5-Qwen3.8-27B, publicado por el usuario bradshaw-ai. No se trata de un modelo entrenado desde cero, sino de una optimización de posentrenamiento (PTQ) orientada a exprimir estaciones de trabajo con dos GPU de 24 GB en paralelo mediante Tensor Parallelism sobre PCIe sin NVLink. El objetivo declarado es doble: maximizar la capacidad de caché KV manteniendo una fidelidad cercana a W8, y eliminar el cuello de botella de decodificación especulativa sobre PCIe x8/x8.

El autor emplea una tubería de optimización en ocho pasos y dos fases que combina Riemannian Constrained Optimization (RCO) con tres subgrupos, Signum EMA y AutoRound, junto con un drafter FastMTP autodestilado con K=4 y una cabeza de borrador recortada a 49.152 tokens. El resultado es un peso estático de 20,16 GiB agrupado (10,08 GiB por GPU con TP=2) que deja 20,03 GiB libres para caché KV en FP8_E4M3, equivalentes a 553.254 tokens.

La relevancia actual del checkpoint radica en que demuestra que es posible sostener decodificación especulativa a 100,3 tok/s de media (131,7 tok/s de pico) en hardware consumer de gama alta sin NVLink, con una pérdida de precisión medida muy contenida frente al BF16 de referencia en la suite oficial de UkisAI. La licencia es swift-open-license-v1.0, lo que exige revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas GDN (gated delta network) y atención, derivada de Qwen3.8 (tag `qwen3_5_text`) |
| Parametros totales | 2.569.035.264 (según safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (`max_model_len` usado en la evaluación oficial) |
| Tipos de cuantizacion | 6,3 bpw totales: backbone 6,04 bpw, MLPs 5,57 bpw; mezcla de W4_G128, W4_G32, W8_G128 (Marlin), INT8_G128 en embeddings y BF16 en compuertas GDN |
| Idiomas soportados | inglés (tag `english`); resto no disponible |
| Licencia | swift-open-license-v1.0 |
| Formato de pesos | safetensors (Marlin, AutoRound) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8 con 64 capas cuantizables y un bloque recurrente GDN cuyas compuertas (`in_proj_a`/`in_proj_b`) se mantienen en BF16 virgen. La cuantización se distribuye de forma no uniforme: 1 MLP en W4_G128, 44 MLP en W4_G32 y 19 MLP en W8_G128 (Marlin), concentrando los 19 bloques de 8 bits en la zona media-tardía del backbone (capas 28, 32-34, 37, 39-41, 43-46, 48, 57, 59-63) para suprimir la distorsión exponencial y blindar el corredor de salida L59-L63 antes de `lm_head` y del MTP. Las cabezas de vocabulario también se cuantizan: `lm_head` en MARLIN_W8_G128 y `embed_tokens` en INT8_G128, lo que recupera 2,36 GiB de VRAM y duplica el ancho de banda de `lm_head` durante la verificación de 5 tokens.

El proceso de optimización combina Signum EMA con AutoRound (1.500 iteraciones en backbone, 2.000 en MTP), con coadaptación continua de escalas al 100% sobre 512 secuencias de 2.048 tokens (1,05M tokens) y dos fases de EMA con β_V de 0,50 y 0,30. El drafter FastMTP se autodestila con K=4 desenrollado y KL con decaimiento β=0,6 sobre 15.000 secuencias, seguido de una calibración post-PTQ de 500 pasos sobre la variedad recurrente que reduce la W-KL de 0,2854 a 0,1714. La cabeza de borrador se recorta a `[49152, 5120]` en BF16 (240 MiB por GPU con TP=2), lo que reduce 5,05 veces la lectura de HBM por paso de borrador y alinea los tiles a 128 elementos para Tensor Cores.

## Capacidades

- Generación de texto conversacional y razonamiento de varios pasos con modo `thinking` (`reasoning_effort=xhigh` documentado en la evaluación).
- Razonamiento matemático de competición y científico (evaluado en AIME 2026 y GPQA-Diamond).
- Seguimiento de instrucciones complejas y restricciones de formato (evaluado en IFBench).
- Tool calling y function calling, con cargas de trabajo estocásticas documentadas a T=0,6 y top_k=20.
- Decodificación especulativa integrada mediante drafter MTP K=4 con aceptación de 3,01-3,26 tok/step.
- Capacidad multilingüe: no disponible (solo se declara inglés).
- Visión y audio: no disponibles.

## Casos de uso

- Razonamiento matemático y científico en producción: el modelo mantiene un 93,33% en AIME 2026 y un 86,87% en GPQA-Diamond en su configuración cuantizada, por lo que sirve para asistentes de resolución de problemas técnicos donde el coste por consulta importa.
- Atención al cliente multi-turno: la ventana de 262.144 tokens y los 553.254 tokens de caché KV disponibles en dos GPU de 24 GB permiten mantener historiales largos y documentos de referencia en contexto sin recargar pesos.
- Agentes autónomos con tool calling: la aceptación de 3,01-3,26 tok/step a temperatura 0,6 y top_k=20 está medida sobre cargas de tool calling, lo que lo hace adecuado para bucles de agente con varias llamadas encadenadas.
- Despliegue en estaciones de trabajo de dos RTX 3090: el checkpoint está calibrado explícitamente para TP=2 sobre PCIe Gen4 x8/x8 sin NVLink, con 10,01+ GiB por GPU libres para caché tras cargar los pesos.
- Generación de código asistida en pipelines de CI/CD: el soporte de tool calling y el modo de razonamiento permiten integrarlo en flujos de revisión automática y generación de parches, aunque la evaluación de HumanEval no está publicada.
- Servicio de inferencia de alto rendimiento con vLLM: el autor proporciona el parche `syv-ai/HyperQwen` y un parche Triton fusionado para el gather de embeddings W8_G128, lo que facilita reproducir los 100,3 tok/s medios en el hardware objetivo.
- Investigación en cuantización PTQ: la mezcla asimétrica de subgrupos RCO y la calibración post-PTQ del manifold recurrente son un caso de estudio reproducible para quien investigue decodificación especulativa sobre interconexiones lentas.

## Benchmarks y rendimiento

Evaluación oficial de UkisAI a `max_model_len=262.144`, temperatura 1,0, top_p 0,95, top_k 20, seed 0 y `reasoning_effort=xhigh`:

| Benchmark | 6.3bpw-RCO-SAR-MTP | BF16 (5-Seed) | BF16 (Seed-0) | AWQ INT4 | AWQ+GPTQ INT4 | AutoRound INT4 |
|---|---|---|---|---|---|---|
| GPQA-Diamond (n=198) | 86,87% (172/198) | 88,59% | 91,41% | 88,38% | 90,91% | 89,39% |
| IFBench (n=300) | 77,67% estricto / 81,00% laxo | 72,07% | 72,00% | 72,00% | 70,00% | 69,33% |
| AIME 2026 (n=30) | 93,33% (28/30) | 96,00% | 86,67% | 86,67% | 83,33% | 83,33% |
| Media macro de 3 benchmarks | 85,96% estricto | 85,55% | 83,36% | 82,35% | no disponible | 80,68% |

Rendimiento de decodificación especulativa medido en 2× RTX 3090 (47,11 GiB usables, sm_86, PCIe Gen4 x8/x8) con vLLM v0.30.0 y los parches del autor:

| Métrica | Valor |
|---|---|
| Throughput greedy | 101,7 tok/s |
| Throughput combinado | 100,3 tok/s |
| Pico (k=4) | 131,7 tok/s |
| Aceptación MTP | 3,01-3,26 tok/step a T=1,0; 2,99-3,22 tok/step a T=0,0 y T=0,6 |
| Coincidencia con profesor | 92,92% Pos-1, 86,88% Pos-4, 49,86% cadena P4 |

## Requisitos de hardware

- VRAM: 20,16 GiB de pesos agrupados; 10,08 GiB por GPU con TP=2; footprint estático total de 10,36-10,83 GiB por GPU; quedan 10,01+ GiB por GPU (20,03 GiB agrupados, 553.254 tokens) para caché KV en FP8_E4M3 al 93,5% de utilización.
- GPU objetivo: 2× NVIDIA RTX 3090 (sm_86) con PCIe Gen4 x8/x8 sin NVLink; el autor declara también compatibilidad con x16. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en el par de 24 GB especificado. No se documenta funcionamiento en una sola GPU.
- Despliegue: vLLM v0.30.0 con los parches `syv-ai/HyperQwen` y `patch_inc_embedding.py`, configuración `--speculative-config '{"method":"mtp","num_speculative_tokens":4,"draft_sample_method":"probabilistic"}'`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 100,3 tok/s medios y 131,7 tok/s de pico en el hardware de referencia.
- Disco: 21,26 GiB para el checkpoint; repositorio de 22,8 GB.

## Comparativa con modelos similares

Comparación con las variantes del mismo modelo base documentadas en la model card:

| Modelo | Bits efectivos | GPQA-D | IFBench | AIME 2026 | Media macro | Licencia |
|---|---|---|---|---|---|---|
| 6.3bpw-RCO-SAR-MTP (este) | 6,3 bpw | 86,87% | 77,67% | 93,33% | 85,96% | swift-open-license-v1.0 |
| Swift 1.5 BF16 (5-Seed) | 16 bpw | 88,59% | 72,07% | 96,00% | 85,55% | swift-open-license-v1.0 |
| Swift 1.5 AWQ INT4 | 4 bpw | 88,38% | 72,00% | 86,67% | 82,35% | swift-open-license-v1.0 |
| Swift 1.5 AutoRound INT4 | 4 bpw | 89,39% | 69,33% | 83,33% | 80,68% | swift-open-license-v1.0 |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La model card está truncada en la sección de benchmarks; el valor de media macro laxa y parte de las notas al pie no están disponibles.
- El número de parámetros del repo cuantizado (2.569.035.264) no concuerda con la denominación "27B" del modelo base; conviene verificar el inventario real de pesos antes de dimensionar el despliegue.
- Solo se declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- El checkpoint está calibrado específicamente para TP=2 sobre PCIe sin NVLink en RTX 3090; el rendimiento en otras topologías, como una sola GPU o clústeres con NVLink, no está documentado.
- Requiere vLLM v0.30.0 más parches de terceros (`syv-ai/HyperQwen` y `patch_inc_embedding.py`); no es un checkpoint plug-and-play en stacks estándar.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- La licencia swift-open-license-v1.0 no está detallada en la información proporcionada; es imprescindible revisar el archivo LICENSE antes de un uso comercial.
- El modelo base es un derivado de Qwen3.8; las obligaciones de atribución y las restricciones de la licencia original pueden aplicar en cascada.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación independiente de la comunidad sobre las cifras declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/bradshaw-ai/Swift-1.5-27B-6.3bpw-RCO-SAR-Marlin-MTP
- Modelo base: https://huggingface.co/UkisAI/Swift-1.5-Qwen3.8-27B
- Suite de parches vLLM HyperQwen: https://github.com/syv-ai/HyperQwen
- Licencia: archivo LICENSE del repositorio (no se proporciona URL directa)
