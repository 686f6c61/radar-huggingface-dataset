# AXERA-TECH/VoxCPM2-AX8860-llama.cpp

## Resumen

VoxCPM2-AX8860-llama.cpp es una distribucion optimizada del modelo de sintesis de voz VoxCPM2 (desarrollado originalmente por OpenBMB) para ejecutarse sobre la NPU del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con soporte ggml-axera. El paquete lo publica AXERA-TECH e incluye pesos en formato GGUF, kernels precompilados para la NPU, binarios estaticos (`llama-server` y `llama-tts`) y scripts de ejecucion y benchmark. No se trata de un modelo nuevo, sino de una adaptacion de despliegue de un TTS de ~912 millones de parametros.

El modelo resuelve la sintesis de voz con clonacion zero-shot y salida en streaming, exponiendo una API compatible con OpenAI (`/v1/audio/speech`). Su relevancia practica esta en que demuestra inferencia TTS en hardware de borde (edge) con una NPU de 4 nucleos, alcanzando un RTF de aproximadamente 0,27, es decir, genera audio unas 3,7 veces mas rapido que tiempo real.

La arquitectura combina un modelo de lenguaje base (3,2 GB en F16) con un modulo acustico (1,8 GB en F16) que integra un decodificador VAE de audio y un bucle de difusion de 9 pasos Euler. El contexto configurado en el servidor es de 8192 tokens. Los idiomas documentados en los ejemplos y pruebas son chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en modelo de lenguaje + modulo acustico con VAE de audio y difusion (9 pasos Euler); inferencia via llama.cpp/ggml-axera |
| Parametros totales | 912.440.644 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor de `-c` en el servidor de referencia) |
| Tipos de cuantizacion | F16 (unico formato publicado en este repo) |
| Idiomas soportados | chino e ingles (segun ejemplos y pruebas de la model card); no se declara lista oficial de idiomas |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16): `VoxCPM2-BaseLM-F16.gguf` y `VoxCPM2-Acoustic-F16.gguf` |

## Arquitectura y entrenamiento

La model card de esta distribucion no documenta el entrenamiento del modelo base; la informacion disponible se centra en el despliegue. Sabemos que VoxCPM2 se compone de dos partes empaquetadas por separado: un modelo de lenguaje base (BaseLM) y un modulo acustico. El modulo acustico incluye un decodificador VAE de audio y un bucle de difusion que ejecuta 9 pasos Euler en una sola llamada al kernel de la NPU. La generacion se controla con parametros como `max_steps`, `inference_timesteps`, `cfg_value` y `temperature`, lo que sugiere muestreo con classifier-free guidance y un esquema iterativo de refinamiento acustico.

La innovacion tecnica de este paquete es el motor de ejecucion: ocho kernels especificos para la NPU AX8860 (prefill del LM con paginas de 256 y 16 tokens, decode del LM, modelo de lenguaje residual con post-procesado y cabeza de parada, encoder local, bucle de difusion, y decoder y encoder del VAE de audio), junto con una bifurcacion de llama.cpp (`ZHEQIUSHUI/llama.cpp` en el commit `6613735ce`). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en chino e ingles.
- Clonacion de voz zero-shot mediante audio de referencia (`ref_audio` en base64 WAV) y transcripcion opcional de referencia (`ref_text`).
- Salida en streaming con baja latencia de primer paquete (0,18 s en ingles, 0,20 s en chino).
- API compatible con OpenAI: endpoint `/v1/audio/speech` con formatos `wav` y `pcm`.
- Control de generacion mediante semilla (`seed`), pasos de inferencia y temperatura.
- Ejecucion en hardware de borde sobre NPU, sin GPU dedicada.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Asistentes de voz en dispositivos empotrados: el modelo cabe en una NPU de 4 nucleos con unos 3,0 GB de memoria NPU y 6,3 GB de RSS en host, lo que permite integrar TTS local en equipos de borde sin depender de la nube.
- Clonacion de voz para personalizacion de interfaces: con `ref_audio` se puede generar una voz concreta a partir de una grabacion de referencia, util para lectores de pantalla o asistentes con identidad de marca.
- Locucion automatizada de contenidos: con un RTF de ~0,27, se pueden generar narraciones de varios minutos (por ejemplo, 32 s de audio en 8,58 s) para podcasts, audiolibros o notas de prensa.
- Respuestas de voz en tiempo real en aplicaciones conversacionales: la latencia de primer paquete por debajo de 0,2 s y la salida PCM en streaming permiten encadenar STT, LLM y TTS en un pipeline de baja latencia.
- Sistemas de megafonia o anuncios dinamicos en entornos industriales o de transporte: el despliegue sobre NPU evita GPUs y permite actualizar los textos locutados en tiempo de ejecucion.
- Pruebas de accesibilidad y prototipado multilingue chino-ingles: el modelo cubre ambos idiomas en un mismo binario, lo que simplifica la generacion de contenido bilingue para validacion de interfaces.

## Benchmarks y rendimiento

Los datos publicados corresponden a rendimiento de inferencia (RTF), no a benchmarks de calidad tipo MMLU o HumanEval, que no aplican a un modelo TTS.

| Peticion | Audio generado | Tiempo | RTF |
|---|---:|---:|---:|
| Ingles, frase corta | 3,36 s | 0,93 s | 0,276 |
| Chino, frase corta | 3,20 s | 0,92 s | 0,286 |
| Ingles, frase media | 8,16 s | 2,21 s | 0,270 |
| Chino, frase media | 8,48 s | 2,34 s | 0,276 |
| Ingles, frase larga | 22,24 s | 6,00 s | 0,270 |
| Chino, frase larga | 32,00 s | 8,58 s | 0,268 |

| Metrica adicional | Resultado |
|---|---|
| Primer paquete en streaming (ingles / chino) | 0,18 s / 0,20 s |
| Tiempo hasta servidor listo | 62,5 s |
| Memoria NPU (CMM) | ~3,0 GB |
| Memoria host (RSS) | ~6,3 GB |
| Estabilidad de memoria | Sin crecimiento en 60 peticiones mixtas (mitad con clonacion) |

En cuanto a correctitud, 55 clips sintetizados (11 pasajes en chino e ingles, 5 semillas cada uno) se transcribieron con Qwen3-ASR sin perdida ni repeticion de frases, coincidiendo con la implementacion CPU oficial. No se han publicado resultados de benchmarks de calidad de audio (MOS, similitud de hablante) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 nucleos y runtime SDK en `/opt/lib`. La NPU queda monopolizada por el proceso.
- Memoria NPU: aproximadamente 3,0 GB (CMM).
- Memoria host: aproximadamente 6,3 GB de RSS.
- Almacenamiento: repositorio de 5,2 GB (pesos F16 de 3,2 GB + 1,8 GB, binarios y kernels).
- No se documenta soporte para GPU convencionales (A100, H100, RTX 4090) en este paquete; el motor es especifico de la NPU AX8860.
- Despliegue: binarios `llama-server` y `llama-tts` incluidos, con `run.sh` y `bench.sh`; servidor con `-np 1` (peticiones serializadas), `-c 8192`, `-b 1024`, `-ngl 99`.
- Throughput: procesamiento secuencial de peticiones; RTF ~0,27 en servicio end-to-end.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM2-AX8860 (este) | ~912 M | 8192 | NPU AX8860 (llama.cpp) | no disponible | RTF ~0,27, clonacion zero-shot, streaming |
| openbmb/VoxCPM2 (base) | ~912 M | no disponible | CPU/GPU (implementacion oficial) | no disponible | Referencia de calidad; sin cifras de rendimiento en esta informacion |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio; es imprescindible verificar los terminos del modelo base `openbmb/VoxCPM2` antes de cualquier uso comercial.
- La NPU de 4 nucleos queda ocupada en exclusiva; no se pueden ejecutar otros programas de NPU en paralelo.
- Las peticiones se atienden de forma serializada (`-np 1`), lo que limita el throughput en escenarios multiusuario.
- Solo se publican pesos en F16; no hay variantes cuantizadas de menor precision en este repo.
- Idiomas documentados limitados a chino e ingles; no se declara cobertura multilingue adicional.
- Riesgo de alucinacion o artefactos en la sintesis no cuantificado: no se publican metricas de MOS ni de similitud de hablante.
- El tiempo de arranque del servidor es elevado (62,5 s), relevante para despliegues con reinicios frecuentes.
- Dependencia de una bifurcacion concreta de llama.cpp y de kernels binarios especificos del SoC, lo que reduce la portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/VoxCPM2-AX8860-llama.cpp
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Bifurcacion de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (commit `6613735ce`)
