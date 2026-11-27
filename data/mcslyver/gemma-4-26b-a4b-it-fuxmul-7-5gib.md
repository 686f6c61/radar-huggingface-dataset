# McSlyver/gemma-4-26B-A4B-it-FuxMul-7.5GiB

## Resumen

Gemma-4-26B-A4B-IT-FuxMul-7.5GiB es una cuantización extrema del modelo Mixture-of-Experts Gemma-4-26B-A4B-IT de Google, publicada por el usuario McSlyver bajo el nombre de técnica "FuxMul" (variante A-v3). El pack de pesos ocupa 7,53 GiB (8.083.193.856 bytes), aproximadamente 6,25 veces menos que los pesos BF16 originales, y está compilado directamente a partir de los pesos oficiales de Google. El objetivo declarado es ejecutar un modelo de 26.000 millones de parámetros totalmente offline en Apple Silicon, Windows x86-64 y Android ARM64 sin dependencias de PyTorch ni de llama.cpp.

La propuesta técnica se apoya en un formato de pesos por planos de bits ("bitplane") con una precisión efectiva de 2,5 bits y tablas LUT4, junto con un motor propio que incluye un borrador especulativo de predicción multi-token (MTP) de 4 capas. El autor reporta velocidades de decodificación de 82,78 tok/s en un Apple M1 Pro, 58,44 tok/s en una iGPU Radeon 890M y entre 5 y 7 tok/s en dispositivos móviles Android de 12 GB, además de una suite de regresión ejecutable multiplataforma con 20/20 casos superados.

Es relevante por su planteamiento de inferencia de un MoE grande en hardware de consumo y móvil con un motor independiente, pero conviene tratarlo con cautela: el repositorio no tiene descargas ni likes, los benchmarks son autodeclarados y no verificados, y la licencia combina pesos y motor con condiciones distintas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, modelo base google/gemma-4-26B-A4B-it |
| Parámetros totales | 26.000 millones (modelo base) |
| Parámetros activos | 4.000 millones (A4B, modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2,5 bits efectivos, formato bitplane con LUT4; pack directo de 7,53 GiB desde BF16 |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0-weights-agpl-3.0-engine (pesos Apache 2.0, motor AGPL 3.0) |
| Formato de pesos | pack propietario FuxMul (bitplane/LUT4), no safetensors ni GGUF; incluye borrador MTP de 4 capas |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos de 26.000 millones de parámetros totales y 4.000 millones activos por token, según la nomenclatura A4B del modelo base de Google. Esta ficha describe la cuantización, no un reentrenamiento: no hay datos sobre el corpus de entrenamiento original, el número de tokens ni el proceso de alineación (RLHF/DPO) en la información proporcionada.

La innovación de esta publicación es el formato de compresión FuxMul A-v3: pesos almacenados en planos de bits con precisión efectiva de 2,5 bits y decodificación mediante tablas LUT4, compilados directamente desde los pesos BF16 oficiales de Google. El pack incluye además un borrador especulativo de predicción multi-token (MTP) de 4 capas que se usa para decodificación especulativa, y el motor está implementado sin PyTorch ni llama.cpp, con backends para Metal (Apple Silicon), OpenCL (AMD, Adreno, Mali) y rutas AVX-512/AVX2 en CPU x86-64. Se distribuye con una interfaz de chat de escritorio (`engine/fuxmul_chat.py`) y una APK de Android de 205 KiB.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Razonamiento aritmético y matemático de varios pasos (GSM8K reportado al 91,51 %).
- Razonamiento de sentido común y preguntas de opción múltiple (ARC-Challenge al 92,24 %).
- Generación de código en Python y resolución de problemas de programación (HumanEval pass@1 del 83,54 %).
- Decodificación especulativa mediante borrador MTP de 4 capas integrado en el pack.
- Ejecución totalmente offline en macOS (Metal), Windows (OpenCL y CPU AVX-512/AVX2) y Android ARM64 (Adreno, Mali).
- Interfaz de chat de escritorio y APK de chat para Android incluidas en el repositorio.
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente de razonamiento offline en portátiles Apple Silicon: el pack de 7,53 GiB cabe en la memoria unificada de un M1 Pro y ofrece 82,78 tok/s de media, suficiente para un chat interactivo sin conexión ni servicios en la nube.
- Chat local en Windows con GPU integrada: en una Radeon 890M con OpenCL y MTP se reportan 58,44 tok/s, lo que permite usar el modelo como asistente de escritorio en equipos sin GPU dedicada.
- Asistente móvil sin red: la APK FuxMulChat sobre un Galaxy Tab S9 de 12 GB (Adreno 740) alcanza 7,08-7,21 tok/s, viable para consultas puntuales de razonamiento y matemáticas en entornos sin conectividad.
- Resolución de problemas matemáticos paso a paso: con un 91,51 % de exact match en GSM8K en modo greedy y sin thinking, es adecuado para tutores o verificadores aritméticos en local.
- Generación y revisión de código en estaciones de trabajo aisladas: el 83,54 % de pass@1 en HumanEval permite usarlo como asistente de programación en entornos air-gapped donde no se permite enviar código a APIs externas.
- Evaluación de técnicas de cuantización extrema: el pack y sus informes de benchmark públicos sirven como referencia reproducible para investigadores que comparan formatos de 2-3 bits frente a GGUF Q4/Q2 en el mismo hardware.
- Prototipado de decodificación especulativa: el borrador MTP incluido permite estudiar el impacto del draft model en latencia y throughput sobre distintos backends (Metal, OpenCL, AVX-512).

## Benchmarks y rendimiento

Resultados declarados por el autor, 0-shot, greedy, sin modo thinking, sobre las particiones de test completas:

| Benchmark | Métrica | Resultado | Muestras |
|---|---|---|---|
| OpenAI GSM8K (main) | Exact Match | 91,51 % | 1207/1319 |
| AllenAI ARC-Challenge | Accuracy | 92,24 % | 1081/1172 |
| OpenAI HumanEval | pass@1 (max_tokens=512) | 83,54 % | 137/164 |

Rendimiento de decodificación reportado (media de 16 prompts, contexto corto):

| Dispositivo | Throughput medio | Pico |
|---|---|---|
| Apple M1 Pro (Metal) | 82,78 tok/s | 90,83 tok/s |
| Windows AMD Radeon 890M iGPU (OpenCL + MTP) | 58,44 tok/s | 67,17 tok/s |
| Windows Zen 5 CPU (AVX-512) | 24,96 tok/s | no disponible |
| Windows CPU 4 núcleos 2018 (AVX2) | 5,73 tok/s | no disponible |
| Galaxy Tab S9 12 GB (Adreno 740) | 7,08-7,21 tok/s | no disponible |
| Galaxy S21 Ultra (Mali-G78) | 5,56 tok/s | 6,21 tok/s |

Los resultados no están verificados de forma independiente (`verified: false` en el model-index).

## Requisitos de hardware

- VRAM/memoria: el pack de pesos ocupa 7,53 GiB; con overhead del motor y el borrador MTP el autor indica aproximadamente 8,0 GiB totales, por lo que se recomienda un mínimo de 10-12 GB de memoria unificada o VRAM.
- Apple Silicon: verificado en M1 Pro con backend Metal; previsiblemente funciona en cualquier chip M-series con al menos 12 GB de memoria unificada.
- GPU de escritorio: verificado en iGPU AMD Radeon 890M vía OpenCL; no hay datos de rendimiento para A100, H100 ni RTX 4090 en la información disponible.
- CPU x86-64: rutas AVX-512 (24,96 tok/s en Zen 5) y AVX2 (5,73 tok/s en un 4 núcleos de 2018).
- Móvil Android: verificado en Galaxy Tab S9 (12 GB, Adreno 740) y Galaxy S21 Ultra (Mali-G78); requiere ARM64 y al menos 12 GB de RAM.
- Despliegue: motor propio FuxMul (no usa vLLM, llama.cpp, Ollama ni TGI); incluye chat de escritorio en Python y APK de Android.
- Latencia: no se publican métricas de time-to-first-token; solo throughput de decodificación en contexto corto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-IT-FuxMul-7.5GiB | 26B totales / 4B activos | no disponible | Apache 2.0 (pesos) + AGPL 3.0 (motor) | Pack FuxMul bitplane 2,5 bits | Repo HF, 0 descargas |
| google/gemma-4-26B-A4B-it (base) | 26B totales / 4B activos | no disponible | Gemma terms (modelo base) | safetensors BF16 | Repo oficial de Google |
| Cuantizaciones GGUF de 2-4 bits del mismo base | 26B totales / 4B activos | no disponible | según derivado | GGUF | Ecosistema llama.cpp/Ollama |

No se dispone de datos de benchmarks comparables de las alternativas en la información proporcionada, por lo que no es posible contrastar rendimiento entre ellas.

## Limitaciones y advertencias

- Los benchmarks son autodeclarados por el autor y figuran como no verificados; no hay evaluación independiente.
- El modelo solo declara soporte de inglés; el rendimiento en castellano no está documentado.
- La cuantización a 2,5 bits puede degradar tareas distintas de las evaluadas (GSM8K, ARC-Challenge, HumanEval); no se reportan resultados en contextos largos, tool calling ni agentes.
- No se especifica la longitud de contexto soportada por el pack, lo que impide garantizar conversaciones multi-turno largas.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la compresión extrema.
- Licencia dual: pesos Apache 2.0 pero motor AGPL 3.0, lo que impone obligaciones de copyleft si se integra el motor en un producto; revisar LICENSING.md antes de uso comercial.
- El repositorio no tiene descargas ni likes y fue creado y actualizado en noviembre de 2026; madurez y soporte de la comunidad no demostrados.
- El formato de pesos es propietario y no es compatible con safetensors, GGUF, vLLM, llama.cpp ni Ollama, lo que limita su integración en pipelines existentes.
- El autor no publica sesgos conocidos ni datos de composición del dataset de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul-7.5GiB
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul-7.5GiB/blob/main/LICENSING.md
- Informe GSM8K: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul-7.5GiB/blob/main/benchmarks/public_gsm8k_a_v3_report.json
- Informe ARC-Challenge: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul-7.5GiB/blob/main/benchmarks/public_arc_challenge_1172_a_v3_report.json
- Informe HumanEval: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul-7.5GiB/blob/main/benchmarks/public_humaneval_164_a_v3_report.json
- APK de Android: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul-7.5GiB/resolve/main/engine/android_app/FuxMulChat.apk
