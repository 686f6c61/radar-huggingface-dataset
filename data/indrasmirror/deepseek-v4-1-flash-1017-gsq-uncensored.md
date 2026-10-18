# IndrasMirror/DeepSeek-V4.1-Flash-1017-GSQ-Uncensored

## Resumen

Este repositorio contiene una cuantización mixta y una edición de rechazo del modelo DeepSeek-V4.1-Flash-1017, publicada por IndrasMirror. No es un modelo entrenado desde cero: es un build experimental del MoE de DeepSeek, con 552B parámetros totales y enrutamiento top-6 sobre 384 expertos por capa, pensado para ejecutarse en un PC con RTX 4090, 90 GB de RAM y NVMe mediante el motor Xolotl/Strata.

La aportación principal es una asignación por experto de formatos ternarios (PTQ1_0, 1,75 bits/peso), 2 bits (Q2_0, 2,25 bits/peso) y 3 bits (Q3_K, 3,44 bits/peso), con una media de 2,093 bits/peso en los expertos; la mitad densa va en Q8_0, y embeddings, compresor e indexer en F16. El autor reporta un 20,9 % menos de error de salida en su proxy de calibración que con Q2_0 uniforme, a costa de un 4,8 % más de error que la asignación sin tope.

Es una release de investigación, con subida incompleta, sin benchmarks estándar publicados y con una regresión conocida en coding agéntico (3/5 frente a 4/5 de su quant v2). El nombre «uncensored» se refiere a una edición rank-2 de la dirección de rechazo, pero el autor no ha medido la tasa de rechazo del modelo servido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Autor | IndrasMirror |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Arquitectura | Transformer MoE con 40 capas, 384 expertos enrutados por capa (top-6 por token), experto compartido, Hyper-Connections, atención dispersa CSA y memoria Engram; cuantización mixta por experto |
| Parámetros totales | 552B según fuente secundaria; 543,6B corresponden a 15.360 expertos enrutados según la model card |
| Parámetros activos | Top-6 de 384 expertos por token; 8B en prefill y 16B en decodificación según fuente secundaria (no confirmado en la model card) |
| Longitud de contexto | 1.000.000 tokens según fuente secundaria para el modelo base; no confirmado en la model card del quant |
| Tipos de cuantización | Mixta por experto: PTQ1_0 ternario 1,75 bpw (62,4 % de los pesos de expertos), Q2_0 2,25 bpw (24,7 %), Q3_K 3,44 bpw (13,0 %); media 2,093 bpw. Denso Q8_0; embeddings, compresor e indexer F16; normas, router y mHC F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible; no es GGUF. Partes de 10 GiB con reassemble.sh y verificación de checksum; requiere Xolotl |
| Tamaño | ~142 GiB según el texto de la model card; el título indica 152 GB; el repo de HF muestra 85,9 GB porque la subida está incompleta. Presupuesto de expertos: 132,4 GiB |
| Estado | Subida en curso desde 2026-10-18 23:07 AEDT; las tablas Engram llegarán después; release experimental |

## Arquitectura y entrenamiento

La model card describe el modelo base como un MoE de 40 capas con 384 expertos enrutados por capa, selección top-6 por token, un experto compartido, Hyper-Connections, atención dispersa CSA y una memoria de n-gramas Engram. Los 15.360 expertos enrutados concentran 543,6B pesos. Este repositorio no entrena el modelo: parte del checkpoint 1017 y aplica una cuantización con inicialización GPTQ, formatos GSQ/RCO-lite y una asignación por experto con topes del 85 % de proyecciones ternarias en las capas 20-31 y 33-35, y del 50 % en el resto. No se documentan tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO.

La edición de rechazo es de rango 2, estilo mrfakename, y se aplicó antes de cuantizar a la mitad densa: proyección de salida de atención y proyección down del experto compartido. Los expertos no se modifican. El identificador del manifiesto es `adea0515bbf69a0b`. El pipeline completo está en Xolotl/tools/v41 y se ejecutó en una RTX 4090; la model card no detalla la calibración más allá del proxy de error.

## Capacidades

- Generación de texto y conversación multi-turno: la model card menciona calidad de chat y el autor recalibra la asignación para proteger ese tráfico.
- Código y agentes: el autor evalúa una prueba corta de coding agéntico; no se publican HumanEval, MBPP ni SWE-bench.
- Contexto largo: hasta 1.000.000 tokens según fuente secundaria para el modelo base; no confirmado en el quant ni en Xolotl.
- Multimodalidad: el modelo base se describe como multimodal imagen-texto en una fuente secundaria; este repo no documenta pipeline de visión, por lo que no debe asumirse.
- Tool calling/function calling: no documentado.
- Razonamiento multi-paso: no hay benchmarks de razonamiento publicados; la prueba agéntica es de 5 tareas.
- Multilingüe: no disponible.
- Modo thinking: no documentado.
- Edición de rechazo: se aplicó una edición rank-2 en atención y shared-expert down; no hay tasa de rechazo medida.
- Ejecución local: el stack Xolotl permite caché de expertos en VRAM, RAM y NVMe; no es una capacidad del modelo, pero habilita su uso en un PC.

## Casos de uso

- Asistente local para expedientes y repositorios largos: con 1M tokens de contexto, si se confirma, se puede indexar documentación y mantener conversaciones multi-turno sin enviar datos a la nube; la limitación es que el quant no tiene benchmarks de contexto largo.
- Coding agent en estación de trabajo: el autor lo prueba en tareas agénticas; sirve para experimentar con un MoE grande en local, pero la regresión 3/5 frente a 4/5 y la ausencia de tool calling documentado lo alejan de producción.
- I+D en cuantización mixta: el repo permite reproducir la asignación ternaria/2-bit/3-bit, medir el proxy de error y estudiar el efecto de los topes por capa; el pipeline está en Xolotl/tools/v41.
- Despliegue air-gapped: al ser local, MIT y con pesos descargables, encaja en entornos sin internet; requiere Xolotl, NVMe y ~90 GB de RAM, y la subida debe completarse.
- RAG sobre corpus privado: el contexto largo y la ejecución local permiten concatenar pasajes y generar respuestas con trazabilidad; falta confirmar el contexto efectivo y la calidad del quant en retrieval.
- Evaluación de motores MoE con offload: sirve para medir aciertos de caché con el ranking del autor (64 GiB cubre el 79,8 % de tokens; 120 GiB, el 99,0 %) y comparar Xolotl/Strata con otras estrategias.
- Prototipado de modelos con edición de rechazo: útil para estudiar la edición rank-2 y sus efectos, siempre con auditoría de seguridad externa; el autor no reclama una tasa de rechazo.

## Benchmarks y rendimiento

| Prueba | Este build | Referencia | Nota |
|---|---|---|---|
| Proxy de error de salida (calibración) | 1,7663 | Q2_0 uniforme: 2,2318; sin tope: 1,6846 | 20,9 % menos error que Q2_0 uniforme; 4,8 % más que la asignación sin tope |
| Coding agéntico corto (5 tareas) | 3/5 | V4.1 v2 quant: 4/5 | Prueba interna del autor; no es un benchmark estándar |
| Cobertura de tokens por caché de 64 GiB | 79,8 % | 80 GiB: 87,4 %; 100 GiB: 94,7 %; 120 GiB: 99,0 % | Ranking de calibración del propio build |

No se han publicado resultados de MMLU, HumanEval, GSM8K, MMMU ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: 24 GB en la RTX 4090 de prueba; no se documenta un mínimo. El modelo completo no cabe en VRAM: el motor usa la GPU como caché de ~1.300-1.600 expertos calientes.
- RAM: 90 GB en la máquina de prueba; el arena fijada en RAM son 60 GiB para ~6.700 expertos. No hay datos con menos RAM.
- Almacenamiento: NVMe para ~8.700 expertos; el autor indica ~142 GiB de pesos, el título dice 152 GB y añadirá tablas Engram aparte. Reserva más de 160 GiB libres para trabajar con margen.
- GPU recomendadas: RTX 4090 24 GB, probada. No hay datos para A100, H100, RTX 3090/4090/5090 ni para 16 GB; el autor dice que el objetivo futuro es caber en 16 GB, pero no está probado.
- Despliegue: Xolotl, antes Strata-DSV4.1, sobre Strata. No es compatible con llama.cpp, Ollama o LM Studio; no hay soporte documentado para vLLM o TGI.
- Latencia y throughput: no disponibles. El autor busca un decode más rápido que V1, pero no publica tokens/s ni TTFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este build | 552B totales; top-6 de 384 expertos | 1M según fuente secundaria | Mixta ternario/2-bit/3-bit; 2,093 bpw en expertos; denso Q8_0 | ~142 GiB según el texto; el título dice 152 GB; repo parcial de 85,9 GB | MIT | Hugging Face; subida incompleta; requiere Xolotl |
| DeepSeek-V4.1-Flash-1017 (base) | 552B totales | 1M según fuente secundaria | Expertos en FP4 nativo según la model card; denso no disponible | no disponible | MIT según fuente secundaria | Hugging Face oficial |
| V4.1 v2 quant (mismo autor) | 552B totales | 1M según fuente secundaria | no disponible | no disponible | no disponible | 4/5 en coding agéntico; disponibilidad no disponible |
| V4.1 V1 GSQ Uncensored | 552B totales | 1M según fuente secundaria | Ternario/2-bit/3-bit sin el tope del 85 % en capas 20-31 y 33-35, según la model card | 152 GiB | MIT según la búsqueda | Hugging Face |

La comparativa se limita a la información disponible; no hay datos de MMLU, HumanEval o GSM8K para ninguno de estos builds.

## Limitaciones y advertencias

- Release experimental de un solo desarrollador, medida en un PC; no es un artefacto de producción.
- Subida incompleta
