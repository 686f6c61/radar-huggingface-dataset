# groxaxo/MOSS-TTS-v1.5-GPTQ-Pro-4bit-Fused

## Resumen

MOSS-TTS-v1.5-GPTQ-Pro-4bit-Fused es una cuantización comunitaria del modelo de texto a voz MOSS-TTS v1.5 desarrollado por OpenMOSS-Team, publicada por el usuario groxaxo en HuggingFace. Se trata de un checkpoint nativo en formato GPTQ Pro de 4 bits con guardia Triton fusionada, diseñado para reducir los requisitos de VRAM del modelo original (BF16) a la mitad manteniendo una calidad de audio cercana. El modelo base es un sistema TTS con clonación de voz que soporta inglés y español.

La relevancia de esta publicación radica en su documentación meticulosa: el autor publica mediciones comparativas de RTF (factor de tiempo real), consumo de VRAM y métricas de calidad (WavLM, ECAPA, UTMOS, CER/WER) frente a otras cuantizaciones como AWQ y EXL3, además de verificar la paridad de los 252 módulos cuantizados con coseno mínimo de 0,999. El checkpoint requiere un adaptador de runtime propio y un backend GPTQ-Pro fijado, por lo que no es compatible de forma directa con AutoGPTQ, Transformers, llama.cpp o vLLM.

Con aproximadamente 2.580 millones de parámetros y un tamaño de repo de 5,5 GB (5,1981 bits efectivos por parámetro original), el modelo cabe en GPUs de consumo de 12 GB como la RTX 3060, donde se ha verificado una instalación limpia con generación completa de los 16 casos de prueba, aunque sin mantener tiempo real (RTF de 1,552).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TTS con clonación de voz (formato moss_tts_delay), 252 lineales cuantizadas |
| Parametros totales | 2.579.760.128 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ Pro 4 bits (W4/G64 simétrico), embedding de texto y 33 cabezas afines a 8 bits, embeddings/normas de audio en BF16; 8 bits también referenciado en tags |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint nativo GPTQ-Pro con adaptador de runtime propio) |

## Arquitectura y entrenamiento

El modelo base, MOSS-TTS v1.5 de OpenMOSS-Team, es un sistema de texto a voz con capacidad de clonación de voz (voice cloning) que emplea un generador transformer junto a un códec neuronal para la síntesis de audio. La arquitectura incluye 33 cabezas de salida para texto y RVQ (residual vector quantization); el autor señala que estas cabezas no son predictores de tokens futuros y que el checkpoint no dispone de una ruta MTP (multi-token prediction) entrenada compatible. El generador se distribuye cuantizado, mientras que el códec debe descargarse por separado en FP32 desde la revisión `3cd226ba2947efa357ef453bcad111b6eafba782`, y ambos contribuyen al consumo de VRAM.

Respecto a la cuantización: los 252 lineales del transformer se cuantizan a 4 bits con grupos de 64 (G64 simétrico nativo), escalas de kernel FP16, una guardia de entrada por fila de potencia de dos y restauración FP32 a BF16. Esta publicación usa la variante "fused" con guardia Triton fusionada, que genera WAVs byte-idénticos a la versión GPTQ normal en los 16 casos emparejados. Los pesos se convirtieron directamente desde BF16 fijado, sin requantizar desde AWQ o EXL3. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Síntesis de texto a voz (pipeline text-to-speech) en inglés y español.
- Clonación de voz a partir de grabaciones de referencia (se probaron referencias de 15 s y 11,008 s).
- Generación de audio determinista por semilla (se usaron semillas 1234 y 501 en las pruebas).
- Cuantización 4 bits con paridad nativa verificada (coseno mínimo 0,999 frente a pesos cuantizados reconstruidos en 252 módulos).
- Ejecución en GPUs de consumo de 12 GB (verificado en RTX 3060 con instalación limpia).
- Verificación de integridad incluida mediante script `verify_bundle.py` con hashes SHA-256.
- No soporta: carga estándar vía AutoGPTQ/Transformers, llama.cpp, vLLM ni cargadores EXL3 sin modificar.

## Casos de uso

- Clonación de voz para locución de contenido en español e inglés: el modelo genera audio a partir de referencias cortas (11-15 s), adecuado para doblar vídeos o producir audiolibros con una voz concreta.
- Despliegue TTS en GPUs de consumo: con un pico de 10,48 GiB reservados cabe en una RTX 3060 de 12 GB, lo que permite montar un servicio de síntesis local sin hardware de datacenter.
- Generación por lotes de audio no interactivo: en RTX 3090 alcanza un RTF de 0,605 (síntesis más rápida que el tiempo real), apropiado para pregenerar clips de IVR o podcasts.
- Investigación comparativa de cuantizaciones TTS: el repo publica métricas controladas (WavLM, ECAPA, UTMOS, CER/WER) frente a AWQ4 y EXL3-4/5, útil como referencia metodológica.
- Prototipado de asistentes de voz bilingües: soporte de español e inglés con clonación de voz para interfaces conversacionales, previa validación con oyentes reales.
- Pipelines de producción con verificación de integridad: los hashes SHA-256 y el script de verificación permiten auditar los pesos antes de desplegar en entornos regulados.

## Benchmarks y rendimiento

El autor publica mediciones propias en RTX 3090 con 16 casos por runtime (3 prompts en español, 1 en inglés, 2 voces de referencia, 2 semillas). RTF menor es mejor; WavLM/ECAPA son cosenos frente a las grabaciones de referencia originales; UTMOS es naturalidad predicha; CER/WER miden inteligibilidad vía Whisper-small.

| Runtime | RTF síntesis | VRAM pico (asignada/reservada, GiB) | WavLM | ECAPA | UTMOS pred. | CER / WER |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 0,558 | 19,50 / 19,91 | 0,9703 | 0,6210 | 3,126 | 1,13% / 3,25% |
| AWQ4-G64 | 1,212 | 10,66 / 11,07 | 0,9685 | 0,5807 | 3,177 | 1,63% / 4,27% |
| GPTQPro4 (este modelo) | 0,759 | 10,04 / 10,50 | 0,9694 | 0,6119 | 3,120 | 2,14% / 5,69% |
| GPTQPro4-Fused (este modelo) | 0,605 | 10,04 / 10,48 | 0,9694 | 0,6119 | 3,120 | 2,14% / 5,69% |
| EXL3-4 | 0,518 | 9,79 / 9,84 | 0,9652 | 0,6135 | 3,127 | 2,18% / 4,88% |
| EXL3-5 | 0,525 | 10,56 / 10,62 | 0,9721 | 0,6405 | 3,111 | 1,13% / 3,66% |

Resultados en RTX 3060 (instalación limpia, 12 GB): RTF de generación/síntesis agrupado 1,535 / 1,552; VRAM pico 10,040 / 10,480 GiB. Casos cortos en español (media 4,56 s de audio) completos tras 9,12 s de síntesis temporizada. No se mantuvo tiempo real en la 3060.

Advertencias del autor: EXL3-5 se midió en una ventana de GPU distinta con actividad concurrente, por lo que las diferencias de tiempo no son evidencia controlada; el camino AWQ probado dequantiza a GEMM BF16 y no es un kernel Marlin optimizado. En inglés (solo 4 casos por runtime): UTMOS BF16 3,323, GPTQ 3,137, EXL3-4 3,078, EXL3-5 3,090; CER inglés BF16 0%, GPTQ/EXL3-4 4,55%, EXL3-5 1,82%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM para inferencia: pico medido de 10,04 GiB asignados / 10,48 GiB reservados (incluye el códec FP32 co-residente); frente a 19,91 GiB de la versión BF16.
- GPU recomendadas: RTX 3090 (RTF 0,605, síntesis en tiempo real) verificada; RTX 3060 de 12 GB verificada en instalación limpia, aunque sin tiempo real (RTF 1,552, 2,567 veces más tiempo de síntesis por segundo de audio que la 3090).
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB como la RTX 3060; la CPU usada en la prueba fue un i7-4790, sin requisitos de CPU publicados.
- Despliegue: solo mediante el adaptador de runtime suministrado y el backend GPTQ-Pro fijado (extensión nativa compilada); NO compatible con llama.cpp, vLLM, TGI, AutoGPTQ/Transformers estándar ni cargadores EXL3 sin modificar. Requiere descargar además el códec FP32 original en la revisión indicada.
- Entorno probado: Linux, Python 3.12, Torch 2.11.0+cu1 (listado en `tested-environment.txt` del repo).
- Latencia: en RTX 3090, RTF 0,605 (tiempo real sostenido); en RTX 3060, RTF 1,552 (un clip de 4,56 s tarda unos 9,12 s). No se probaron streaming ni llamadas simultáneas.

## Comparativa con modelos similares

Comparativa entre las variantes de cuantización medidas por el propio autor del repo (misma base, MOSS-TTS v1.5):

| Variante | Bits efectivos | RTF (3090) | VRAM pico (GiB) | UTMOS | CER/WER | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|
| GPTQPro4-Fused (este repo) | 5,1981 | 0,605 | 10,48 | 3,120 | 2,14% / 5,69% | Apache 2.0, checkpoint nativo con runtime propio |
| AWQ4-G64 | no disponible | 1,212 | 11,07 | 3,177 | 1,63% / 4,27% | medida por el autor, no publicada como repo |
| EXL3-4 | no disponible | 0,518 | 9,84 | 3,127 | 2,18% / 4,88% | medida por el autor, no publicada como repo |
| EXL3-5 | no disponible | 0,525 | 10,62 | 3,111 | 1,13% / 3,66% | medida por el autor, no publicada como repo |
| BF16 (sin cuantizar) | 16 | 0,558 | 19,91 | 3,126 | 1,13% / 3,25% | OpenMOSS-Team/MOSS-TTS-v1.5 |

Frente a otros modelos TTS con clonación de voz (XTTS-v2, F5-TTS, CosyVoice), no hay mediciones comparativas publicadas en la información disponible: no disponible.

## Limitaciones y advertencias

- Código personalizado: el checkpoint requiere revisar y ejecutar código Python propio con una extensión CUDA/Triton compilada; no es un checkpoint estándar de HuggingFace Transformers.
- Incompatibilidad de ecosistema: no funciona como drop-in en llama.cpp, vLLM, TGI ni cargadores EXL3 sin modificar.
- Inglés como preocupación de calidad: solo se probaron 4 casos y un prompt en inglés por runtime; el autor lo marca explícitamente como "screening concern" y recomienda validación con oyentes ciegos en ambos idiomas.
- Degradación frente a BF16: CER/WER suben de 1,13%/3,25% a 2,14%/5,69% con GPTQ 4 bits; WER de 5,69% es notablemente superior al original.
- Riesgo de clonación de voz indebida: las referencias usadas en las pruebas no eran de los "llamadores previstos"; el uso de clonación de voz con voces de terceros puede plantear problemas legales y éticos (suplantación, deepfakes de audio).
- Métricas no comparables entre entornos: EXL3-5 se midió con actividad de GPU concurrente; los hashes WAV de la 3060 difieren de los de la 3090, por lo que las puntuaciones de calidad no se transfieren entre hosts.
- Sin streaming ni concurrencia probados: no hay evidencia de funcionamiento en modo streaming ni con llamadas simultáneas, relevante para producción en tiempo real.
- Dependencia externa: hay que descargar el códec FP32 por separado en una revisión exacta; generador y códec contribuyen ambos a la VRAM.
- Sin ruta MTP: las 33 cabezas de texto/RVQ no son predictores de tokens futuros; no hay decodificación multi-token.
- W4A8 no probado: el kernel QQQ instalado carece de soporte G64.
- Sesgos del modelo base: no documentados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el checkpoint es una derivación comunitaria; conviene verificar también los términos del modelo base de OpenMOSS-Team.

## Enlaces

- Repositorio del modelo: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-GPTQ-Pro-4bit-Fused
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Procedimiento de instalación limpia en 3060 (enlazado en la model card): FRESH-INSTALL-3060.md
- Métricas por clip: benchmark/3060-fresh-install-20261027.json
- Entorno probado: tested-environment.txt
- Paper, demo o repositorio oficial de OpenMOSS-Team: no disponible en la información proporcionada
