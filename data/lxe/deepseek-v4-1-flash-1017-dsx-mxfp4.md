# lxe/DeepSeek-V4.1-Flash-1017-dsx-mxfp4

## Resumen

DeepSeek-V4.1-Flash-1017-dsx-mxfp4 es una distribución cuantizada del modelo DeepSeek-V4.1-Flash-1017, un transformer MoE desarrollado por DeepSeek con 552B parámetros en el MoE y 196B adicionales en tablas Engram (763B según featherless.ai). La cuantización la firma lxe y está diseñada para ejecutarse íntegramente en la HBM de una única AMD Instinct MI325X con 256 GiB HBM3E y enrutamiento exacto de expertos, sin poda ni sesgo de router.

El problema que resuelve es el de desplegar un modelo de escala frontera en un solo acelerador sin renunciar al routing completo: mantiene los pesos densos en FP8, conserva el 57% de los expertos enrutados en MXFP4 y recomprime el 43% restante a un codebook de 3 bits, logrando 270 GB de pesos, 271,6 GB en HBM y 256K tokens de contexto. Frente al FP8 original de 299 GB, la pérdida medida es KL 0,049, top-1 90,6% y perplejidad 8,71 frente a 8,56.

Es relevante ahora porque permite servir un MoE de 552B+196B en una sola GPU AMD con decodificación de 110-114 tok/s y prefill de 1.160-1.640 tok/s, usando el runtime propio dsx en Rust + HIP con API compatible con OpenAI y Anthropic. No obstante, exige hardware exótico, unos 160 GB de RAM para las tablas Engram y no documenta tool calling, visión ni idiomas soportados; tampoco hay benchmarks estándar publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con módulo Engram; la model card no detalla la arquitectura interna de Engram |
| Parámetros totales | 552B en el MoE + 196B en Engram según la model card; 763B según featherless.ai |
| Parámetros activos | no disponible; no se especifica el número de expertos activos por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Mixta: pesos densos FP8; 57% de expertos enrutados MXFP4; 43% en codebook de 3 bits con 8 niveles y escala e4m3 por cada 32 pesos; embeddings y cabeza de salida en bf16; GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF en 6 shards para el modelo cuantizado; safetensors para los shards oficiales de Engram |
| Tamaño del repo | 270,5 GB |
| Runtime | dsx `amd/` en Rust + HIP; API compatible con OpenAI y Anthropic, y web UI |
| GPU objetivo | AMD Instinct MI325X (gfx942) con 256 GiB HBM3E |
| Memoria de pesos en HBM | 271,6 GB con contexto de hasta 256K tokens |
| RAM recomendada | ~160 GB para las tablas Engram vía page cache |
| Almacenamiento | ~473 GB: 270 GB de GGUF más 203 GB de Engram |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 552B parámetros y un módulo Engram de 196B. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. featherless.ai lo describe como una actualización de DeepSeek-V4.1-Flash orientada a razonamiento, código y tareas agenticas, con mejoras en HLE, Terminal-Bench y DeepSWE. La arquitectura exacta de Engram no se detalla: se sabe que sus tablas de 203 GB se leen desde disco a través de la page cache, 48 filas por token, y que el runtime reserva unos 160 GB de RAM.

La cuantización es el núcleo técnico. Los pesos densos —atención, expertos compartidos, routers y proyecciones Engram— se mantienen en FP8 con escalas de bloque E8M0 de 32×32; embeddings y cabeza de salida quedan en bf16. De los expertos enrutados, los 8.804 más usados, medidos por frecuencia de routing sobre texto agentico, conservan los pesos MXFP4 del checkpoint; los 6.556 restantes se recomprimen desde FP4 a un codebook de 3 bits de 8 niveles, ajustado con iteraciones de Lloyd sobre una muestra de expertos y almacenado como valores FP8, con una escala e4m3 por cada 32 pesos y un multiplicador por matriz, usando round-to-nearest con búsqueda de escala por grupo. El reparto se elige para que el modelo completo quepa en 256 GiB de HBM junto con las cachés de 256K tokens. El enrutamiento es exacto: no hay poda de expertos ni sesgo de router.

## Capacidades

- Generación de texto y razonamiento: el modelo base está orientado a razonamiento, código y tareas agenticas; la model card incluye pruebas de matemáticas de competición con modo thinking activado y respuestas boxed.
- Modo thinking: documentado en las pruebas de razonamiento con temperatura 0, thinking on y reasoning effort low.
- Contexto largo: 262.144 tokens, con decodificación sostenida de 110,4 tok/s a 256K.
- Código y tareas agenticas: según featherless.ai, el modelo base mejora en HLE, Terminal-Bench y DeepSWE; no se aportan puntuaciones concretas en la información disponible.
- Tool calling y function calling: no documentado. El runtime expone API compatible con OpenAI y Anthropic, pero no se confirma soporte nativo de herramientas.
- Agentes y multi-step reasoning: el base se describe como agentico; esta cuantización no incluye una evaluación específica de agentes.
- Multilingüe: no disponible; no se declaran idiomas soportados.
- Visión: el checkpoint original menciona capas de visión al excluirlas del cómputo de tamaño, pero esta cuantización no documenta entrada de imágenes; debe asumirse texto salvo validación.
- Decodificación especulativa: el original menciona draft layers, pero esta build no documenta decodificación especulativa.
- Capacidad especial: routing exacto y mezcla de precisión que preserva el 57% de los expertos enrutados en MXFP4.

## Casos de uso

- Revisión y generación de código en monorepos grandes: con 256K tokens de contexto puede ingerir varios módulos y archivos de configuración en una sola pasada. La API compatible con OpenAI permite conectarlo a pipelines de CI/CD, aunque el tool calling nativo no está documentado y las herramientas habría que orquestarlas desde fuera.
- Agentes de larga duración en entornos controlados: el modelo base está orientado a tareas agenticas y el contexto de 256K evita perder el historial. El runtime ofrece API estilo OpenAI y Anthropic para integrar el bucle del agente, pero no hay evaluación publicada de agentes para esta cuantización.
- Razonamiento matemático y científico por lotes: las pruebas de competición con modo thinking generan respuestas boxed tras 6.624 y 13.482 tokens. Encaja en procesos nocturnos donde la latencia no es crítica y se prioriza la fidelidad al FP8.
- Análisis de documentación técnica extensa: informes, patentes o manuales de hasta 256K tokens se pueden resumir y explotar en una sola ventana. Hay que validar previamente el idioma, porque no se declara soporte multilingüe.
- Despliegue on-premise con requisitos de soberanía: al ser MIT y ejecutarse en una sola MI325X sin depender de una API externa, se puede ubicar en un servidor propio. El coste es el hardware AMD, los 256 GiB de HBM y los ~160 GB de RAM.
- Investigación sobre cuantización de MoE: el repo incluye `expert-rank.json`, `results/` y `SHA256SUMS`, lo que permite reproducir la selección de expertos y medir KL, top-1 y perplejidad frente al FP8. Es un caso de uso meta para evaluar técnicas de mixed precision.
- Atención al cliente técnica con historiales largos: conversaciones multi-turno con documentación adjunta de hasta 256K tokens y respuestas a 110 tok/s. La falta de datos de idioma y de tool calling limita la integración directa con CRM.
- Generación de informes regulatorios y resúmenes de expedientes: contexto largo y licencia permisiva para despliegues internos. Antes de producción hay que validar sesgos y alucinaciones en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K, HLE, Terminal-Bench o DeepSWE en la información disponible. Los únicos datos cuantitativos son de fidelidad frente al FP8 y de velocidad en una MI325X.

| Modelo | Tamaño | KL ↓ | Top-1 ↑ | Perplejidad ↓ |
|---|---:|---:|---:|---:|
| FP8/FP4 original | 299 GB | 0 | 100% | 8,56 |
| dsx MXFP4 + 3 bits | 270 GB | 0,049 | 90,6% | 8,71 |
| Lucebox ROCMFP23S | 179 GiB | 0,194 | 81,3% | 9,41 |
| Lucebox ROCMFP 2,5 bpw | 158 GiB | 0,253 | 78,7% | 9,78 |
| dsx 2 bits | 148 GB | 0,395 | 74,1% | 10,93 |

Los tamaños excluyen las tablas Engram y, en el original, las capas de visión y draft. Las ejecuciones repetidas dan KL 0,047-0,051 porque las sumas atómicas del runner cambian el orden y pueden alterar elecciones de expertos casi empatadas.

| Contexto | Decodificación (tok/s) |
|---|---:|
| 4K | 114,1 |
| 128K | 111,5 |
| 256K | 110,4 |

| Prompt | Prefill (tok/s) |
|---|---:|
| 4K | 1.640 |
| 16K | 1.640 |
| 128K | 1.160 |

En dos prompts de matemáticas de competición, en modo greedy con temperatura 0, thinking on y reasoning effort low, el modelo generó 6.624 y 13.482 tokens con respuesta boxed; el modelo alojado necesitó 5,6K y 21K en los mismos prompts. No son benchmarks estandarizados y no permiten comparación directa con MMLU o GSM8K.

## Requisitos de hardware

- VRAM: 271,6 GB de pesos en HBM, equivalentes a unos 252,9 GiB. La GPU objetivo es una AMD Instinct MI325X con 256 GiB HBM3E, es decir, 274,9 GB, por lo que el margen para cachés y overhead es de aproximadamente 3 GiB. El reparto de cuantización se eligió para que quepa con 256K de contexto.
- RAM del sistema: ~160 GB para las tablas Engram, que se leen desde disco mediante page cache a 48 filas por token. Se recomienda NVMe rápido y al menos 203 GB libres para las tablas, además de los 270 GB de los shards GGUF.
- GPU recomendadas: AMD Instinct MI325X (gfx942) con ROCm 7. No se documenta soporte para otras GPU en esta build. La variante dsx 2-bit de 148 GB está pensada para 2× RTX 3090 con 128 GB de RAM, pero es otra cuantización y otro runtime, CUDA en ese caso.
- GPU de consumo: no. Los 270 GB de pesos no caben en ninguna GPU de consumo; la alternativa de 2 bits requiere dos RTX 3090 y 128 GB de RAM, no una sola.
- Despliegue: runtime dsx `amd/` en Rust + HIP, con API compatible con OpenAI y Anthropic y web UI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos shards; el formato es GGUF, pero el modelo depende de las tablas Engram y del runner dsx.
- Latencia y throughput: decodificación de 110,4-114,1 tok/s entre 4K y 256K; prefill de 1.640 tok/s a 4K y 16K, y 1.160 tok/s a 128K. Los prompts largos se ralentizan porque el indexador de atención puntúa cada posición comprimida anterior.
- Arranque: hay que cargar 270 GB de GGUF y 203 GB de Engram desde disco; el tiempo de arranque no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | KL ↓ | Top-1 ↑ | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| DeepSeek-V4.1-Flash-1017 FP8/FP4 | 552B + 196B Engram | no disponible | 299 GB | 0 | 100% | MIT | checkpoint oficial de DeepSeek |
| dsx MXFP4 + 3 bits | 552B + 196B Engram | 256K | 270 GB | 0,049 | 90,6% | MIT | este repo; 0 descargas |
| Lucebox ROCMFP23S | 552B + 196B Engram | no disponible | 179 GiB | 0,194 | 81,3% | no disponible | repo público de Lucebox |
| Lucebox ROCMFP 2,5 bpw | 552B + 196B Engram | no disponible | 158 GiB | 0,253 | 78,7% | no disponible | repo público de Lucebox |
| dsx 2 bits | 552B + 196B Engram | no disponible | 148 GB | 0,395 | 74,1% | no disponible | repo público de lxe |

No se dispone de comparación con modelos de otros desarrolladores de la misma categoría, como otros MoE de 500B o más, en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos, la toxicidad y el riesgo de alucinación del checkpoint base. No se han publicado evaluaciones de sesgo ni de alucinación en la información disponible.
- Pérdida de fidelidad medible: KL 0,049, top-1 90,6% y perplejidad 8,71 frente a 8,56 del FP8. La degradación es baja, pero el 9,4% de discrepancia top-1 puede importar en tareas sensibles; hay que validar en el dominio objetivo.
- Selección de expertos sesgada al texto agentico: los 8.804 expertos que conservan MXFP4 se eligieron por frecuencia de routing medida sobre texto agentico. Dominios con otro patrón de activación, como multilingüe, visión o código muy especializado, pueden caer en expertos recomprimidos a 3 bits.
- No determinismo: las sumas atómicas del runner producen KL 0,047-0,051 en ejecuciones repetidas y pueden cambiar elecciones de expertos casi empatadas. No es un modelo reproducible bit a bit.
- Hardware y despliegue restrictivos: requiere una MI325X con 256 GiB HBM3E, ROCm 7, unos 160 GB de RAM y unos 473 GB de almacenamiento. No cabe en GPU de consumo y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Contexto largo pero costoso: 256K tokens caben, pero el prefill de 128K baja a 1.160 tok/s y el indexador de atención ralentiza los prompts largos. El tiempo de arranque y la latencia del primer token no están documentados.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano; la model card no lista idiomas soportados.
- Tool calling y agent
