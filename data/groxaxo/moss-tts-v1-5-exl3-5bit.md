# groxaxo/MOSS-TTS-v1.5-EXL3-5bit

## Resumen

MOSS-TTS-v1.5-EXL3-5bit es una cuantizacion experimental de 5 bits del modelo de sintesis de voz OpenMOSS-Team/MOSS-TTS-v1.5, publicada por el usuario groxaxo. El checkpoint base es un modelo de text-to-speech con capacidad de clonacion de voz, desarrollado originalmente por OpenMOSS Team, con 3.761.398.784 parametros (aproximadamente 3,76 mil millones) y soporte para ingles y espanol. Esta version concreta aplica cuantizacion EXL3 con codificacion trellis LDLQ calibrada sobre las 252 capas lineales del transformer, manteniendo embeddings de audio y normas en BF16 original.

El interes de esta publicacion radica en que reduce el peso del generador a unos 6,1 GB (payload de tensores de 6.113.382.368 bytes, con 5,7607 bits efectivos por parametro original incluyendo tensores protegidos), lo que permite ejecutar el modelo en una unica GPU de consumo como la RTX 3090 con un pico de memoria reservada de 10,62 GiB, incluyendo el codec FP32 co-residente. Frente al BF16, que requiere 19,91 GiB reservados, la cuantizacion EXL3-5 mantiene una calidad de referencia competitiva (WavLM 0,9721, ECAPA 0,6405) y mejora el RTF de sintesis de 0,558 a 0,525.

Es importante senalar que no se trata de un checkpoint estandar de AutoGPTQ o Transformers, ni es compatible directamente con llama.cpp, vLLM o cargadores EXL3 sin modificar. Requiere un adaptador de runtime especifico y el backend EXL3 fijado a una revision concreta, ademas de descargar por separado el codec de audio original en FP32. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezas de texto/RVQ (33 cabezas), cuantizacion EXL3 trellis LDLQ sobre 252 lineales |
| Parametros totales | 3.761.398.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 5 bits en lineales del transformer; embeddings de texto y 33 cabezas en affine 8-bit G64; embeddings de audio y normas en BF16 |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con codigo custom (moss_tts_delay); requiere runtime EXL3 nativo, no compatible con AutoModel estandar |
| Bits efectivos por parametro | 5,7607 (incluyendo tensores protegidos) |
| Tamano del repositorio | 6,1 GB |
| Payload de tensores | 6.113.382.368 bytes |
| SHA-256 de pesos | 92241ada6d63af5533d9f504ac1b71c90d81afff439c2aa6422acb8cd057ee33 |
| Modelo base | OpenMOSS-Team/MOSS-TTS-v1.5 |
| Codec requerido | OpenMOSS-Team/MOSS-Audio-Tokenizer (revision 3cd226ba2947efa357ef453bcad111b6eafba782) |

## Arquitectura y entrenamiento

El modelo base MOSS-TTS-v1.5 es un sistema de sintesis de voz con arquitectura transformer que emplea 33 cabezas de texto/RVQ, segun se describe en la model card. La cuantizacion EXL3-5 aplica codificacion trellis LDLQ calibrada de forma nativa sobre las 252 capas lineales del transformer, sin equivalente a grupo affine de 64 ni puntos cero. Los pesos se convirtieron directamente desde el BF16 fijado del modelo original, nunca recuantizando desde AWQ ni desde EXL3-4.

Segun la verificacion del autor, cada modulo cuantizado nativo fue comprobado contra sus pesos reconstruidos, con un coseno minimo de al menos 0,999, lo que constituye paridad con el kernel nativo pero no equivalencia con BF16. El modelo no dispone de una ruta MTP entrenada compatible: sus 33 cabezas de texto/RVQ no son predictoras de tokens futuros. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles y espanol.
- Clonacion de voz mediante audio de referencia (voice cloning), con referencias de 15 s y 11,008 s en las pruebas del autor.
- Generacion de audio condicionada por prompt de texto y referencia de hablante.
- Soporte de multiples semillas para variacion de sintesis (probadas 1234 y 501).
- Capacidad multilingue limitada a ingles y espanol.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step, al ser un modelo TTS.
- No se documentan capacidades de vision ni audio de entrada mas alla de la referencia de voz.

## Casos de uso

- Clonacion de voz para locuciones: el modelo permite generar audio con la identidad de un hablante de referencia, util para doblaje o contenido narrado con voces consistentes, usando el flag `--reference` con un WAV consentido.
- Sintesis en espanol para asistentes: con prompts en espanol y salida WAV, adecuado para integrar en asistentes conversacionales que requieran voces naturales en castellano, aunque el autor advierte validar con hablantes reales y escucha a ciegas.
- Generacion de audio en ingles para prototipos: util para pruebas de concepto de TTS en ingles, si bien el autor senala que el ingles sigue siendo una preocupacion de cribado por el limitado numero de casos probados.
- Despliegue en GPU de consumo: al caber en una RTX 3090 con 10,62 GiB reservados, permite experimentacion local de TTS de alta calidad sin infraestructura de datacenter.
- Evaluacion de cuantizacion: sirve como referencia para comparar tecnicas de cuantizacion (BF16, AWQ4-G64, GPTQPro4, EXL3-4, EXL3-5) en tareas de voz, con metricas WavLM, ECAPA, UTMOS y CER/WER.
- Investigacion en clonacion de voz: permite estudiar la fidelidad de identidad (cosenos WavLM/ECAPA) y la inteligibilidad (CER/WER via Whisper-small) bajo distintas cuantizaciones.
- Generacion de datasets de voz sintetica: para aumentacion de datos o pruebas de pipelines de ASR, con la cautela de que la calidad en ingles y espanol debe validarse por caso.

## Benchmarks y rendimiento

Resultados medidos por el autor en una RTX 3090 (16 casos por runtime, 96 registros de render, 80 hashes WAV unicos):

| Runtime | RTF de sintesis | Pico asignado / reservado (GiB) | WavLM | ECAPA | UTMOS predicho | CER / WER |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 0,558 | 19,50 / 19,91 | 0,9703 | 0,6210 | 3,126 | 1,13% / 3,25% |
| AWQ4-G64 | 1,212 | 10,66 / 11,07 | 0,9685 | 0,5807 | 3,177 | 1,63% / 4,27% |
| GPTQPro4 | 0,759 | 10,04 / 10,50 | 0,9694 | 0,6119 | 3,120 | 2,14% / 5,69% |
| GPTQPro4-Fused | 0,605 | 10,04 / 10,48 | 0,9694 | 0,6119 | 3,120 | 2,14% / 5,69% |
| EXL3-4 | 0,518 | 9,79 / 9,84 | 0,9652 | 0,6135 | 3,127 | 2,18% / 4,88% |
| EXL3-5 | 0,525 | 10,56 / 10,62 | 0,9721 | 0,6405 | 3,111 | 1,13% / 3,66% |

UTMOS predicho en ingles: BF16 3,323; GPTQ 3,137; EXL3-4 3,078; EXL3-5 3,090. CER en ingles: BF16 0%; GPTQ/EXL3-4 4,55%; EXL3-5 1,82%. El autor advierte que las diferencias de tiempo no son evidencia de velocidad controlada y que los resultados son proxies que no sustituyen la preferencia de escucha.

## Requisitos de hardware

- VRAM estimada: 10,56 GiB asignados / 10,62 GiB reservados en EXL3-5, incluyendo el codec FP32 co-residente (medido en RTX 3090).
- GPU recomendadas: RTX 3090 (entorno medido). No se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, al menos en RTX 3090 con 24 GB; no se confirma en GPUs de menor VRAM.
- Opciones de despliegue: runtime nativo EXL3 (exllamav3, revision 02aef45cd681b960a00afcd0749a4ab99e6c1bfe) con adaptador de Python propio; no compatible con llama.cpp, vLLM ni AutoModel.from_pretrained estandar.
- Entorno medido: Linux, Python 3.12, Torch 2.11.0+cu130, Transformers 5.19.0, Triton 3.6.0, CUDA toolkit 12.8 para compilacion EXL3.
- Latencia/throughput: RTF de sintesis 0,525 (menor es mejor); el RTF incluye decodificacion FP32 co-residente real.

## Comparativa con modelos similares

Comparativa interna de cuantizaciones del mismo modelo base (misma categoria y tarea):

| Version | Bits efectivos | VRAM reservada (GiB) | RTF | WavLM | CER / WER |
|---|---:|---:|---:|---:|---:|
| BF16 | 16 | 19,91 | 0,558 | 0,9703 | 1,13% / 3,25% |
| AWQ4-G64 | 4 | 11,07 | 1,212 | 0,9685 | 1,63% / 4,27% |
| GPTQPro4-Fused | 4 | 10,48 | 0,605 | 0,9694 | 2,14% / 5,69% |
| EXL3-4 | 4 | 9,84 | 0,518 | 0,9652 | 2,18% / 4,88% |
| EXL3-5 | 5 | 10,62 | 0,525 | 0,9721 | 1,13% / 3,66% |

No se dispone de comparativa con otros modelos TTS de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint requiere codigo Python custom y backend EXL3 fijado; no es drop-in para llama.cpp, vLLM ni cargadores EXL3 sin modificar. Revisar el codigo antes de ejecutarlo.
- No soporta AutoModel.from_pretrained estandar para estos pesos.
- El codec de audio se distribuye por separado en FP32 y contribuye a la VRAM reportada.
- El ingles sigue siendo una preocupacion de cribado: solo cuatro casos y un prompt en ingles por runtime, con UTMOS predicho inferior al BF16 (3,090 frente a 3,323).
- Las referencias usadas no eran grabaciones de los hablantes objetivo; un coseno medio mayor no establece un ganador universal de identidad o calidad.
- Las metricas son proxies (UTMOS predicho, no MOS humano; CER/WER incluyen errores del reconocedor Whisper-small).
- Las diferencias de tiempo entre runtimes no estan controladas y no deben generalizarse como evidencia de velocidad.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la clonacion de voz exige consentimiento de los hablantes de referencia y cumplimiento normativo sobre deepfakes y datos biometricos.
- Validar ambos idiomas con los hablantes reales y escucha a ciegas antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-EXL3-5bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Codec de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer (revision 3cd226ba2947efa357ef453bcad111b6eafba782)
- Backend EXL3 (exllamav3): https://github.com/turboderp-org/exllamav3/tree/02aef45cd681b960a00afcd0749a4ab99e6c1bfe
- GPTQ-Pro: https://github.com/groxaxo/GPTQ-Pro/tree/c02dd675ad74cec2cc79f654d3c135ac225c8e23
