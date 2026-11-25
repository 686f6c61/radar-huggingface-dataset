# McSlyver/gemma-4-26B-A4B-it-FuxMul

## Resumen

Gemma-4-26B-A4B-IT FuxMul es una distribución cuantizada y reempaquetada del modelo Mixture-of-Experts Gemma-4-26B-A4B-IT de Google, publicada por el usuario McSlyver. El objetivo no es ofrecer un modelo nuevo, sino un formato de pesos alternativo (extensión `.astca`) junto con un motor de inferencia propio llamado FuxMul, diseñado para ejecutar el modelo de 26 000 millones de parámetros de forma totalmente offline en hardware de consumo: Apple Silicon (Metal), teléfonos y tabletas Android con GPU Qualcomm Adreno o ARM Mali, y CPU ARM64 con NEON. El paquete completo ocupa 7,53 GiB para los pesos más 434 MiB del borrador especulativo MTP de 4 capas, es decir, unos 8,0 GiB en total, sin dependencias de PyTorch ni de llama.cpp.

La propuesta técnica se apoya en una representación por planos de bits (bitplanes) con ortogonalización FWHT-64 y acumulación LUT4 sin multiplicadores, lo que permite ejecutar las capas lineales cuantizadas en GPUs móviles y en Apple Silicon con instrucciones nativas (FMA FP16 en Metal). El autor reporta 64,98 tok/s de media (82,65 tok/s de pico) en un MacBook Pro M1 Pro, y entre 4,65 y 9,45 tok/s en dispositivos Android de 2021 en adelante. Es relevante ahora porque demuestra que un MoE de 26B puede correr íntegramente en un móvil de 12-16 GB de RAM, algo poco habitual en el ecosistema open source.

Es importante señalar que este repositorio no es un modelo entrenado por McSlyver, sino una conversión del modelo base de Google, y que la licencia es mixta: pesos bajo Apache 2.0 y motor bajo AGPL-3.0 o licencia comercial. La información disponible sobre el modelo base en sí (datos de entrenamiento, benchmarks académicos) es limitada en la model card, que se centra en el formato y el motor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 30 capas, 128 expertos por capa; atención con Sliding-Window Attention (SWA) de 1.024 tokens; Multi-Token Prediction (MTP) de 4 capas como borrador especulativo |
| Parámetros totales | 26 000 millones (26B) |
| Parámetros activos | 4B (A4B, según nomenclatura del modelo base) |
| Longitud de contexto | No disponible de forma explícita; se menciona SWA de 1.024 tokens y pruebas con prompts de ~1,8K tokens |
| Tipos de cuantización | Bitplanes propietarios: 2 planos Syzygy-4x4 en la "Spine" (atención y FFN compartida) y 1 plano Syzygy-4 en los 3.840 expertos MoE; escalas por bloque en FP32/FP16; empaquetado `.astca` de 7,53 GiB |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Mixta: pesos, tokenizer, benchmarks e imágenes bajo Apache 2.0; motor, kernels, app Android y binarios bajo AGPL-3.0-or-later o licencia comercial (`LicenseRef-FuxMul-Commercial`) |
| Formato de pesos | `.astca` (bitplanes empaquetados) + `mtp_gemma4_26b_flat.bin` (borrador MTP); tokenizer en `gemma4_tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer Mixture-of-Experts de Google con 26B parámetros totales y 4B activos, organizado en 30 capas con 128 expertos cada una (3.840 expertos en total). Incorpora Sliding-Window Attention con ventana de 1.024 tokens y un cabezal de Multi-Token Prediction (MTP) de 4 capas que actúa como borrador especulativo para decodificación especulativa con profundidad γ=3 y lote de verificación M=4. Esta información procede de la model card del reempaquetado; no se detallan en ella los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card oficial de `google/gemma-4-26B-A4B-it`.

La innovación del reempaquetado FuxMul es el formato de pesos y el motor de inferencia. Cada capa lineal cuantizada usa ortogonalización FWHT-64 (Fast Walsh-Hadamard Transform, bloque de 64) con representación por planos de bits: 2 planos Syzygy-4x4 en la Spine y 1 plano Syzygy-4 en los expertos MoE. En Android (Adreno y Mali-G78) y en CPU ARM64 NEON, las capas lineales cuantizadas se ejecutan mediante acumulación LUT4 de 4 bits sin multiplicadores, mientras que las proyecciones del router, el cabezal LM de etapa 2, el borrador MTP y las escalas por bloque usan FMA estándar en FP32/FP16. En Apple Silicon Metal, los mismos bitplanes se desempaquetan en instrucciones nativas FP16 `fma()` para maximizar el rendimiento del ALU de la GPU. El paquete incluye un tokenizer BPE en C puro con paridad exacta de 25/25 tokens, un optimizador atómico de tiles de 64 en la app, streaming SSE de tokens y modo Thinking opcional.

## Capacidades

- Generación de texto en inglés con decodificación greedy y decodificación especulativa MTP (γ=3).
- Razonamiento multi-paso: la suite de regresión incluye 4 problemas de matemáticas multi-paso y 4 de razonamiento lógico/causal con verificación de polaridad.
- Generación de código: 4 problemas de test unitario en Python con builtins restringidos y timeout en la suite de regresión.
- Salida estructurada: 4 pruebas de esquema JSON estricto.
- Contexto largo: 4 prompts tipo "needle" de ~1,8K tokens que cruzan el límite de la ventana SWA de 1.024 tokens.
- Modo Thinking opcional en la app Android.
- Streaming de tokens en vivo (SSE) y copia de Markdown/código en la app.
- Ejecución 100 % offline, sin peticiones de red externas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente de código offline en móvil: la app FuxMulChat permite pegar y ejecutar problemas de Python con copia de código y streaming, útil para desarrolladores que trabajan sin conectividad y necesitan un asistente local en una tableta Android de 12 GB.
- Chat privado en dispositivo: al no realizar peticiones de red, el modelo es adecuado para conversaciones con datos sensibles en entornos sin conexión, como dispositivos corporativos o de campo.
- Prototipado en Apple Silicon: con 64,98 tok/s de media en un M1 Pro, sirve para iterar sobre prompts y evaluar respuestas de un MoE de 26B sin depender de servicios en la nube.
- Validación de salidas estructuradas: las pruebas de esquema JSON estricto permiten usar el modelo para generar respuestas con formato fijo en pipelines locales, siempre que se valide la salida con un parser.
- Razonamiento matemático y lógico de complejidad media: los casos de matemáticas multi-paso y razonamiento causal de la suite de regresión son representativos de tareas de análisis acotado que pueden ejecutarse en local.
- Investigación sobre cuantización e inferencia en el borde: el repositorio incluye scripts de compilación reproducibles, binarios nativos y JSON de benchmarks, lo que lo convierte en una base para estudiar bitplanes, LUT4 y decodificación especulativa en GPUs móviles.
- Educación y demos: la app APK de 201 KB y los binarios precompilados facilitan demostraciones de un modelo de 26B corriendo en hardware de consumo sin infraestructura de servidor.

## Benchmarks y rendimiento

La model card no incluye benchmarks académicos (MMLU, GSM8K, HumanEval, WikiText-2 PPL); el propio autor indica que la suite de 20 prompts es una comprobación de regresión ejecutable y no un sustituto de benchmarks académicos. Los datos disponibles son de velocidad de decodificación y latencia de prefill:

| Dispositivo y backend | Cobertura | Decodificación media / pico (tok/s) | Needle 1,8K (prefill) |
|---|---|---|---|
| MacBook Pro M1 Pro (32 GB, Metal v3 + MTP γ=3) | 20/20 | 64,98 / 82,65 | 56,71 tok/s (15,9 s) |
| Galaxy Tab S9 (12 GB, Adreno 740 OpenCL + MTP γ=3) | 20/20 | 7,21 / 9,45 | 3,95 tok/s (152,6 s) |
| Galaxy S21 Ultra (16 GB, Mali-G78 OpenCL + MTP γ=3) | Smoke 4/4 + needle | 4,65–5,25 / 5,54 | 2,15 tok/s (380,3 s) |

En M1 Pro, el autor reporta `mtp_64tok_exact_b1: true` en `py_exec_01` con 41,73 tok/s a B=1 frente a 74,80 tok/s con γ=3, y una media de 63,33 tok/s en los 20 prompts.

## Requisitos de hardware

- VRAM/RAM: el paquete de pesos ocupa 7,53 GiB más 434 MiB del borrador MTP, unos 8,0 GiB en total; se ejecuta en dispositivos con 12-16 GB de RAM unificada (Apple Silicon, Android de gama alta).
- Apple Silicon: verificado en MacBook Pro M1 Pro de 32 GB con Metal v3; el binario `libfuxmul_metal.dylib` se distribuye precompilado.
- Android: verificado en Samsung Galaxy Tab S9 (12 GB, Adreno 740, Android 16) y Galaxy S21 Ultra (16 GB, Mali-G78, Android 15) con 2,1 GiB de RAM libre; se requieren Adreno 740+ o Mali-G78+.
- CPU ARM64: binario `libfuxmul_neon.dylib` con kernels NEON.
- GPU de escritorio (A100, H100, RTX 4090): no disponible; el motor distribuido no incluye backends CUDA.
- Despliegue: motores propios FuxMul (`fuxmul_mac.py`, `fuxmul_adreno_v3`, `fuxmul_repack_t64`, APK `FuxMulChat.apk`); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el prefill de 1,8K tokens tarda 15,9 s en M1 Pro y 152,6 s en Adreno 740.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-IT FuxMul (este) | 26B | 4B | SWA 1.024 tokens (contexto total no disponible) | Mixta: Apache 2.0 pesos / AGPL-3.0 motor | Hugging Face, binarios precompilados, APK Android |
| google/gemma-4-26B-A4B-it (base) | 26B | 4B | No disponible | Licencia de Google (no disponible en detalle) | Hugging Face |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant | 26B | 4B | No disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se declaran capacidades multilingües.
- La model card no documenta sesgos del modelo base; deben consultarse en la documentación oficial de Google.
- Riesgo de alucinación inherente a un modelo generativo; la suite de 20 prompts no mide fidelidad factual ni PPL.
- La licencia es mixta y restrictiva para uso comercial: los pesos son Apache 2.0, pero el motor, kernels, app Android y binarios son AGPL-3.0-or-later o requieren licencia comercial (`LicenseRef-FuxMul-Commercial`). Cualquier producto que integre el motor FuxMul debe revisar `LICENSING.md`.
- El formato `.astca` y los binarios son específicos del motor FuxMul; no hay compatibilidad con el ecosistema estándar (vLLM, llama.cpp, GGUF, safetensors).
- El rendimiento en Android es bajo (2-9 tok/s) y el prefill de prompts largos es lento (hasta 380 s en Mali-G78); no es adecuado para cargas interactivas exigentes en móvil.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; es un artefacto reciente y poco validado por la comunidad.
- No se han publicado benchmarks académicos ni comparativas con el modelo base; el rendimiento real frente a la versión oficial de Google no está cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base QAT: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant
- Licencia de pesos: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul/blob/main/LICENSE
- Aviso de licencia: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul/blob/main/NOTICE
- Licencia mixta: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul/blob/main/LICENSING.md
- Licencia del motor: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul/blob/main/engine/LICENSE
- Licencia comercial del motor: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul/blob/main/engine/COMMERCIAL-LICENSE.md
- App Android: https://huggingface.co/McSlyver/gemma-4-26B-A4B-it-FuxMul/blob/main/engine/android_app/FuxMulChat.apk
