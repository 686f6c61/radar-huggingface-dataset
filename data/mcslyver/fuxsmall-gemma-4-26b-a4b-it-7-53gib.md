# McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB

## Resumen

FuxSmall-gemma-4-26B-A4B-it-7.53GiB es una cuantización extrema del modelo Gemma-4-26B-A4B-it de Google, publicada por el usuario McSlyver. Se trata de un pack de pesos de 7,53 GiB (8.083.193.856 bytes) generado directamente a partir de los pesos BF16 oficiales de Google, que comprime el modelo original (unos 8 GiB en BF16 incluyendo el drafter especulativo Multi-Token Prediction de 4 capas) en un formato propietario denominado FuxMul, con una precisión efectiva de 2,5 bits por peso y una reducción de 6,25x respecto a BF16.

El modelo base es un Mixture-of-Experts (MoE) de 26 mil millones de parámetros con 4 mil millones de parámetros activos por token, orientado a generación de texto conversacional. La propuesta de esta cuantización es ejecutar el modelo completamente offline en Apple Silicon (Metal), Windows x86-64 (AVX-512/AVX2, OpenCL para iGPU AMD) y Android ARM64 (Adreno, Mali), sin dependencias de PyTorch ni de llama.cpp, mediante un motor propio (FuxMul) con decodificación especulativa MTP.

La relevancia actual reside en que demuestra que un MoE de 26B puede desplegarse en hardware de consumo y móvil con velocidades utilizables (82,78 tok/s en un M1 Pro, 58,44 tok/s en una iGPU Radeon 890M, 7,2 tok/s en una tablet Android con 12 GB de RAM) manteniendo una precisión notable en benchmarks estándar (91,51% en GSM8K, 92,24% en ARC-Challenge, 83,54% pass@1 en HumanEval). La licencia es mixta: Apache-2.0 para los pesos y AGPL-3.0 para el motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, con drafter Multi-Token Prediction (MTP) de 4 capas para decodificacion especulativa |
| Parametros totales | 26 mil millones (modelo base Gemma-4-26B-A4B-it) |
| Parametros activos | 4 mil millones (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pack FuxMul de 2,5 bits por peso (bitplane + LUT4), 7,53 GiB; derivado de BF16 original |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 para los pesos, AGPL-3.0 para el motor (denominada apache-2.0-weights-agpl-3.0-engine) |
| Formato de pesos | Pack propietario FuxMul (bitplane/LUT4), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 26B parámetros totales con 4B activos por token, lo que reduce el coste computacional por inferencia respecto a un modelo denso del mismo tamaño. Incluye un drafter Multi-Token Prediction (MTP) de 4 capas que habilita decodificación especulativa, acelerando la generación al predecir varios tokens por paso y verificarlos en paralelo.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporciona información en la documentación disponible. La contribución de esta ficha es la cuantización: el autor compila directamente los pesos BF16 oficiales de Google a un pack bitplane de 2,5 bits con tablas de búsqueda LUT4, sin pasar por PyTorch ni llama.cpp, y distribuye un motor propio (FuxMul) con soporte para Metal, OpenCL, AVX-512, AVX2 y GPUs móviles Adreno/Mali. El pack incluye el drafter MTP dentro de los aproximadamente 8 GiB totales.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento matemático: 91,51% de exact match en GSM8K (0-shot, greedy, sin modo thinking).
- Razonamiento de sentido común y científico: 92,24% de accuracy en ARC-Challenge.
- Generación de código: 83,54% pass@1 en HumanEval (0-shot, greedy, max_tokens=512).
- Decodificación especulativa mediante Multi-Token Prediction (MTP) integrado.
- Ejecución 100% offline en macOS (Apple Silicon/Metal), Windows x86-64 (AVX-512/AVX2, OpenCL para iGPU AMD) y Android ARM64 (Adreno, Mali).
- Interfaz de chat de escritorio (Web UI offline, `engine/fuxmul_chat.py`) y APK de chat para Android (205 KiB).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo thinking: los benchmarks se declaran en modo "no-think"; no se detalla un modo thinking explícito.

## Casos de uso

- Asistente conversacional offline en portátil: desplegar el pack FuxMul en un Mac con Apple Silicon (M1 Pro o superior) para un chatbot local sin conexión, aprovechando los 82,78 tok/s medios y el contexto conversacional multi-turno.
- Chat en dispositivos móviles Android: usar el APK FuxMulChat en tablets o móviles con 12 GB de RAM (por ejemplo, Galaxy Tab S9 con Adreno 740 a ~7 tok/s) para asistentes de productividad o consultas sin enviar datos a la nube.
- Razonamiento matemático asistido en el borde: resolver problemas de aritmética y álgebra (GSM8K al 91,51%) en entornos sin conectividad, como aulas o trabajo de campo, con un portátil Windows AVX-512.
- Generación y revisión de código en local: emplear el modelo en un portátil para autocompletar y generar funciones Python (83,54% pass@1 en HumanEval) dentro de un flujo de desarrollo sin depender de APIs externas.
- Prototipado de agentes y pipelines de IA en hardware de consumo: integrar el motor FuxMul en scripts de automatización que requieran un LLM local con razonamiento científico y matemático (ARC-Challenge 92,24%) para clasificación de preguntas o validación de respuestas.
- Evaluación de cuantizaciones extremas para investigación: usar este pack como referencia para estudiar el impacto de 2,5 bits por peso en la calidad (comparando con los pesos BF16 originales) y en el rendimiento por plataforma (Metal, OpenCL, AVX-512, Adreno, Mali).
- Demostración de inferencia en iGPU: ejecutar el modelo en un mini-PC con Radeon 890M (58,44 tok/s) para aplicaciones de escritorio con requisitos de privacidad, como resumen de documentos o atención al cliente interna.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, greedy, sin modo thinking; verificación no confirmada por un tercero):

| Benchmark | Metrica | Resultado | Muestras |
|---|---|---|---|
| OpenAI GSM8K (main, test) | Exact Match (%) | 91,51 | 1.207/1.319 |
| AllenAI ARC-Challenge (test) | Accuracy (%) | 92,24 | 1.081/1.172 |
| OpenAI HumanEval (test) | pass@1 (%) | 83,54 | 137/164 |

Velocidad de decodificación en contexto corto (media de 16 prompts), según el autor:

| Plataforma | Throughput medio | Pico |
|---|---|---|
| Apple M1 Pro (Metal) | 82,78 tok/s | 90,83 tok/s |
| Windows AMD Radeon 890M iGPU (OpenCL + MTP) | 58,44 tok/s | 67,17 tok/s |
| Windows Zen 5 AVX-512 CPU | 24,96 tok/s | no disponible |
| Windows 2018 4-core AVX2 CPU | 5,73 tok/s | no disponible |
| Galaxy Tab S9 12 GB (Adreno 740) | 7,08–7,21 tok/s | no disponible |
| Galaxy S21 Ultra (ARM Mali-G78) | 5,56 tok/s | 6,21 tok/s |

El autor declara además un 100% (20/20 completo, 16/16 core) en su suite de regresión ejecutable multiplataforma.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 8 GiB para el pack de pesos completo (7,53 GiB de pesos más overhead del motor y del drafter MTP de 4 capas). Se recomienda al menos 12 GB de memoria unificada o RAM del sistema para margen de contexto y buffers.
- GPU recomendadas: Apple Silicon (M1 Pro o superior con Metal), iGPU AMD Radeon 890M (OpenCL), GPUs móviles Adreno 740 y Mali-G78. Para CPU: procesadores con AVX-512 (Zen 5) o AVX2.
- ¿Cabe en GPU de consumo? Sí: el pack está diseñado para ejecutarse en hardware de consumo y móvil; no requiere GPUs de datacenter como A100 o H100 (no se documenta soporte para ellas).
- Opciones de despliegue: motor propio FuxMul (sin dependencias de PyTorch ni llama.cpp), Web UI de escritorio (`engine/fuxmul_chat.py`) y APK Android (`FuxMulChat.apk`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de velocidad; 82,78 tok/s en M1 Pro, 58,44 tok/s en Radeon 890M, 24,96 tok/s en CPU AVX-512, 5,56–7,21 tok/s en dispositivos móviles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato/Despliegue |
|---|---|---|---|---|---|
| FuxSmall-gemma-4-26B-A4B-it-7.53GiB | 26B (MoE) | 4B | no disponible | Apache-2.0 pesos / AGPL-3.0 motor | FuxMul, motor propio, offline |
| google/gemma-4-26B-A4B-it (base) | 26B (MoE) | 4B | no disponible | no disponible en esta ficha | BF16, ecosistema estandar |
| Cuantizaciones GGUF de MoE similares | variable | variable | variable | variable | llama.cpp, Ollama |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La ventaja diferencial de este pack es el tamaño reducido (7,53 GiB) y la ejecución offline en móvil y hardware de consumo; la desventaja es el formato propietario y el ecosistema limitado al motor FuxMul.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- Los benchmarks son declarados por el autor y no están verificados por terceros (`verified: false`); deben interpretarse con cautela.
- La cuantización a 2,5 bits por peso puede degradar la calidad respecto a los pesos BF16 originales en tareas fuera de los benchmarks evaluados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no se documentan en la información disponible.
- Licencia mixta: pesos Apache-2.0, pero el motor es AGPL-3.0, lo que impone obligaciones de copyleft sobre el software del motor en despliegues comerciales; revisar `LICENSING.md` antes de usar en producción.
- Formato de pesos propietario (FuxMul) sin soporte en herramientas estándar (llama.cpp, vLLM, TGI, Ollama), lo que limita la portabilidad e integración.
- Longitud de contexto no documentada; no se puede garantizar el rendimiento en contextos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por la comunidad es mínima.

## Enlaces

- [Hugging Face: McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB](https://huggingface.co/McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Licencia (LICENSING.md)](https://huggingface.co/McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB/blob/main/LICENSING.md)
- [Informe GSM8K](https://huggingface.co/McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB/blob/main/benchmarks/public_gsm8k_a_v3_report.json)
- [Informe ARC-Challenge](https://huggingface.co/McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB/blob/main/benchmarks/public_arc_challenge_1172_a_v3_report.json)
- [Informe HumanEval](https://huggingface.co/McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB/blob/main/benchmarks/public_humaneval_164_a_v3_report.json)
- [APK Android FuxMulChat](https://huggingface.co/McSlyver/FuxSmall-gemma-4-26B-A4B-it-7.53GiB/resolve/main/engine/android_app/FuxMulChat.apk)
