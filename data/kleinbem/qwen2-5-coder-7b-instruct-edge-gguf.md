# kleinbem/Qwen2.5-Coder-7B-Instruct-Edge-GGUF

## Resumen

`kleinbem/Qwen2.5-Coder-7B-Instruct-Edge-GGUF` es una suite de cuantizaciones GGUF del modelo `Qwen/Qwen2.5-Coder-7B-Instruct` de Alibaba Qwen, calibradas con matrices de importancia (`llama-imatrix`) por el usuario kleinbem. El objetivo declarado es el despliegue en dispositivos de borde con memoria unificada limitada, en concreto una NVIDIA Jetson Orin Nano de 8 GiB, manteniendo la calidad suficiente para tareas de tool calling agéntico, revisión de código y razonamiento sobre infraestructura declarativa.

El modelo base es un transformer decoder-only de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) con atención de consultas agrupadas (GQA) de 28 capas y 4 cabezas KV con `head_dim = 128`. La ficha del autor documenta la calidad de cada cuantización mediante divergencia KL respecto a la distribución de probabilidad FP16 del modelo original, además de telemetría real de rendimiento y consumo energético en Jetson Orin Nano y en x86_64 con AVX2.

La relevancia de esta publicación es metodológica: frente a las tablas basadas solo en perplejidad, el autor mide KLD contra FP16, hace una ablación explícita entre `Q4_K_M` con y sin `imatrix`, y publica un conjunto de datos de telemetría reproducible junto con un flake de Nix. El repositorio ocupa 32,3 GB e incluye múltiples niveles de cuantización, desde `Q8_0` hasta `IQ3_M`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (28 capas, 4 cabezas KV, `head_dim = 128`) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (usado en el cálculo de KV cache de la model card) |
| Tipos de cuantizacion | `Q8_0`, `Q6_K`, `Q5_K_M`, `Q4_K_M`, `Q4_K_M-std` (sin imatrix), `IQ4_XS`, `IQ3_M` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only denso de 7,6 mil millones de parámetros que emplea Grouped-Query Attention con 28 capas, 4 cabezas KV y dimensión de cabeza 128. La model card de esta publicación no describe el corpus de entrenamiento del modelo base ni si hubo RLHF o DPO; esa información corresponde a la ficha original de Qwen, no reproducida aquí. Lo que sí detalla es el proceso de cuantización: cada variante se generó con `llama-imatrix`, calibrando las activaciones de segundo momento sobre un conjunto orientado a tool calling agéntico, revisión de código y razonamiento sobre infraestructura declarativa.

La innovación técnica destacable es la evaluación por divergencia KL contra la distribución FP16 del modelo base (`llama-perplexity --kl-divergence`), en lugar de limitarse a perplejidad. La ablación publicada compara `Q4_K_M` con y sin imatrix: a idéntico tamaño (4,36 GiB, 4,92 BPW), la divergencia KL media baja de 0,01321 a 0,01005 nats, una reducción del 23,9 %, y el Top-1 Match sube de 95,49 % a 96,08 %. El autor documenta además la fórmula de tamaño de KV cache para GQA: 56,0 KiB por token en FP16, equivalente a 448 MiB con 8.192 tokens de contexto.

## Capacidades

- Generación de texto y código conversacional, heredadas del modelo base instruct.
- Tool calling y function calling, con calibración imatrix específicamente orientada a escenarios agénticos.
- Razonamiento multi-paso y flujos de agente con contexto de hasta 8.192 tokens.
- Revisión de código y razonamiento sobre infraestructura declarativa (el conjunto de calibración se centró en estos dominios).
- Capacidades multilingües: no disponibles en la información proporcionada para esta publicación.
- Modo thinking, visión o audio: no disponibles; el modelo base es solo texto.

## Casos de uso

- Asistente de código en dispositivo de borde: con `Q4_K_M` (4,36 GiB) cabe en una Jetson Orin Nano de 8 GiB y ofrece 13,0 tok/s en `tg128`, suficiente para autocompletado y explicación de fragmentos en local sin conexión.
- Agente de tool calling en robótica o IoT: la calibración imatrix sobre tool calling reduce la degradación de la distribución de probabilidad, lo que ayuda a mantener el formato de llamadas a funciones en producción embebida.
- Revisión de código en CI/CD: el modelo puede integrarse como paso de análisis en pipelines que corren en x86_64 con AVX2, donde `Q4_K_M` rinde 2,8 tok/s, adecuado para revisiones por lotes no interactivas.
- Razonamiento sobre infraestructura declarativa: generación y validación de manifiestos, flakes de Nix o configuraciones de despliegue, dominio sobre el que se calibró la matriz de importancia.
- Despliegue de bajo consumo energético: con 20,4 W y 1,570 J/token en Orin Nano para `Q4_K_M`, es viable en entornos con presupuesto térmico y eléctrico restringido; `IQ4_XS` baja a 1,256 J/token a 16,3 tok/s.
- Prototipado y evaluación de cuantizaciones: la suite incluye siete niveles y un control sin imatrix, útil para investigar el compromiso calidad/tamaño antes de fijar una cuantización en producción.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (KLD y PPL medidos contra FP16; throughput en Jetson Orin Nano CUDA 12.6 `sm_87` y x86_64 AVX2):

| Quant | imatrix | BPW | Tamano (GiB) | KLD media (nats) | Top-1 Match | PPL | Orin `tg128` | Consumo Orin | x86 AVX2 `tg128` |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|
| `Q8_0` | Sí | 8,50 | 7,54 | 0,00026 | 99,61 % | 8,276 | OOM (>8 GiB) | — | 2,2 tok/s |
| `Q6_K` | Sí | 6,57 | 5,83 | 0,00121 | 98,69 % | 8,278 | OOM (>8 GiB) | — | 2,6 tok/s |
| `Q5_K_M` | Sí | 5,72 | 5,07 | 0,00286 | 97,97 % | 8,268 | OOM (>8 GiB) | — | 2,0 tok/s |
| `Q4_K_M` | Sí | 4,92 | 4,36 | 0,01005 | 96,08 % | 8,356 | 13,0 tok/s | 20,4 W (1,570 J/tok) | 2,8 tok/s |
| `Q4_K_M-std` | No (control) | 4,92 | 4,36 | 0,01321 | 95,49 % | 8,281 | 13,0 tok/s | 20,3 W (1,565 J/tok) | 3,0 tok/s |
| `IQ4_XS` | Sí | 4,43 | 3,93 | 0,01287 | 95,36 % | 8,307 | 16,3 tok/s | 20,5 W (1,256 J/tok) | 2,4 tok/s |
| `IQ3_M` | Sí | 3,75 | 3,33 | 0,04187 | 90,52 % | 8,374 | 11,9 tok/s | 20,9 W (1,756 J/tok) | 1,1 tok/s |

No se han publicado en la información disponible resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) para esta publicación concreta.

## Requisitos de hardware

- VRAM/memoria unificada: `Q4_K_M` ocupa 4,36 GiB de pesos; con 8.192 tokens de contexto en FP16 el KV cache añade 448 MiB, por lo que requiere holgura sobre 5 GiB. `IQ3_M` (3,33 GiB) y `IQ4_XS` (3,93 GiB) dejan más margen para contexto largo.
- GPU validadas por el autor: NVIDIA Jetson Orin Nano de 8 GiB (CUDA 12.6, `sm_87`). `Q8_0`, `Q6_K` y `Q5_K_M` producen OOM en ese dispositivo.
- Consumer GPU: cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar `Q4_K_M` o `IQ4_XS`; no se han publicado pruebas en RTX 4090, A100 o H100.
- CPU: validado en x86_64 con AVX2, con throughput de 1,1 a 3,0 tok/s según cuantización.
- Despliegue: llama.cpp (formato nativo GGUF); el autor publica un flake de Nix con los comandos `run-local` y `bench-orin`. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: ver tabla de benchmarks. En Orin Nano, `IQ4_XS` es la opción más rápida (16,3 tok/s) y la más eficiente energéticamente (1,256 J/token).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| `kleinbem/Qwen2.5-Coder-7B-Instruct-Edge-GGUF` | 7,6 B | 8.192 | GGUF, llama.cpp, calibrado para edge | Apache 2.0 | Suite con 7 cuantizaciones y telemetría KLD/energía |
| `Qwen/Qwen2.5-Coder-7B-Instruct` (original) | 7,6 B | 32.768 (según ficha de Qwen) | safetensors, FP16/BF16 | Apache 2.0 | Referencia de calidad; requiere más memoria |
| `Qwen2.5-Coder-1.5B-Instruct` | 1,5 B | 32.768 (según ficha de Qwen) | safetensors / GGUF | Apache 2.0 | Alternativa más ligera para edge, menor capacidad de razonamiento |

No se dispone de datos comparativos de rendimiento en tareas entre estas variantes dentro de la información proporcionada; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Las cuantizaciones de 3-4 bits introducen degradación medible: `IQ3_M` baja el Top-1 Match al 90,52 % y multiplica por cuatro la KLD respecto a `Q4_K_M`; no es recomendable para tool calling crítico.
- El modelo base puede alucinar en generación de código y APIs; la cuantización agrava ligeramente este riesgo al desviar la distribución respecto a FP16.
- Sesgos del modelo base no documentados en esta publicación; no disponibles.
- Idiomas soportados no declarados en esta ficha; verificar en la ficha del modelo base antes de desplegar en producción multilingüe.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del modelo base de Qwen para uso comercial.
- El contexto validado en la documentación es de 8.192 tokens; no se confirma en esta publicación el contexto máximo nativo del modelo base.
- El rendimiento medido corresponde a Jetson Orin Nano y x86 AVX2; extrapolar a otras GPU requiere validación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kleinbem/Qwen2.5-Coder-7B-Instruct-Edge-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Space de exploración Pareto y KV cache: https://huggingface.co/spaces/kleinbem/edge-llm-pareto
- Dataset de telemetría: https://huggingface.co/datasets/kleinbem/edge-llm-benchmarks
- Código y flake de Nix: https://github.com/kleinbem/hf-bench
