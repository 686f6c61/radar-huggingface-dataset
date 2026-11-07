# Ailiance-fr/qwen3-4b-mascarade-iot-lora

## Resumen

`qwen3-4b-mascarade-iot-lora` es un adaptador LoRA de rango 16 y alfa 32 entrenado mediante SFT (supervised fine-tuning) con TRL sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba. Lo desarrolla el proyecto Ailiance-fr dentro de una familia de adaptadores de dominio ("mascarade") orientados a ingenieria de hardware: KiCad, SPICE, STM32, EMC, embedded, PlatformIO, FreeCAD, DSP, IoT y power. Este adaptador concreto se especializa en el dominio IoT.

El modelo base es un transformer denso de 4.000 millones de parametros con ventana de contexto de 262.144 tokens nativa (extensible), licencia Apache 2.0 y capacidad de tool calling, razonamiento y multilingueismo. El adaptador no modifica el tokenizer ni la arquitectura: anade menos del 1 % de pesos adicionales, de modo que las capacidades generales del base se conservan aproximadamente y el LoRA aporta el sesgo de dominio.

La relevancia practica del adaptador es limitada a dia de hoy: la propia model card reporta un resultado de 0,0 % de tasa de exito en la validacion funcional `iact-bench` Phase 8 (10 muestras, sandbox Docker sin red) y marca la comparativa de benchmarks del LoRA como pendiente. La comprobacion de olvido entre dominios (Phase 9) muestra una delta negativa de -0,008 en Jaccard para el propio dominio IoT, lo que sugiere que el adaptador no mejora de forma medible el comportamiento del base en su dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-4B-Instruct-2507); adaptador LoRA r=16, alpha=32 |
| Parametros totales | 4.000 millones (modelo base); el adaptador anade menos del 1 % de pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en la informacion del repositorio (el base admite GGUF/AWQ via ecosistema, no confirmado para este adaptador) |
| Idiomas soportados | no disponible (heredados del base Qwen3, multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre transformers) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only denso de 4B parametros con atencion de contexto largo (262.144 tokens nativos) y post-entrenamiento orientado a instrucciones, tool calling y razonamiento. El LoRA tiene rango 16 y alpha 32, segun la documentacion publica de la familia Ailiance, y se aplica sobre las capas del base sin alterar el tokenizer ni la cabeza de salida.

El entrenamiento se realizo con SFT usando TRL 1.4.0, Transformers 5.8.0, PyTorch 2.11.0, Datasets 4.8.5 y Tokenizers 0.22.2. El dataset de entrenamiento no se detalla en la model card; la evaluacion se hace sobre `Ailiance-fr/mascarade-iot-dataset` con semilla 101. No se reporta numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF/DPO. La model card menciona una validacion funcional `iact-bench` v0.2 con validadores Docker (sin red, rootfs de solo lectura, uid 1000, `--tmpfs /tmp:size=256m`) que invoca cadenas de compilacion especificas del dominio (`arm-none-eabi-gcc`, `arduino-cli`, `freecadcmd`).

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas heredados del base Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling (heredado del base; BFCL-v3 61,9 en el base).
- Soporte de agentes y razonamiento multi-paso (TAU1/TAU2 en el base).
- Capacidades multilingues (MultiIF 69,0; MMLU-ProX 61,6; INCLUDE 60,1 en el base).
- Especializacion de dominio IoT anadida via LoRA, aunque sin mejora medible confirmada en la evaluacion Phase 9 (delta -0,008 en Jaccard in-domain).
- No se documentan capacidades de vision, audio ni modo thinking explicito para este adaptador.

## Casos de uso

- Prototipado de firmware IoT: el adaptador puede generar esqueletos de codigo para microcontroladores (ESP32, STM32) aprovechando el sesgo de dominio, aunque debe validarse manualmente porque la tasa de exito funcional reportada es 0,0 % en el banco Phase 8.
- Asistencia en configuracion de plataformas IoT: generacion de ficheros de configuracion (PlatformIO, CMake) con contexto largo gracias a los 262.144 tokens del base.
- Documentacion tecnica de dispositivos: redaccion de guias de integracion y notas de aplicacion para sensores y actuadores, usando las capacidades de escritura del base (WritingBench 83,4).
- Analisis de trazas y logs: el contexto largo permite pasar ficheros de log completos y pedir resumenes o deteccion de patrones de fallo.
- Chatbot de soporte tecnico: conversaciones multi-turno sobre protocolos (MQTT, CoAP, BLE) con el base como motor y el LoRA como capa de estilo de dominio.
- Generacion de scripts de automatizacion: pipelines de CI/CD para compilacion de firmware, con tool calling para invocar compiladores o linters.
- Extraccion estructurada de especificaciones: conversion de datasheets en texto a JSON de parametros electricos, con validacion posterior obligatoria.

## Benchmarks y rendimiento

Resultados oficiales del modelo base `Qwen/Qwen3-4B-Instruct-2507` reportados por el equipo Qwen (el LoRA hereda aproximadamente este nivel):

| Categoria | Benchmark | Qwen3-4B-Instruct-2507 |
|---|---|---:|
| Conocimiento | MMLU-Pro | 69,6 |
| Conocimiento | MMLU-Redux | 84,2 |
| Conocimiento | GPQA | 62,0 |
| Conocimiento | SuperGPQA | 42,8 |
| Razonamiento | AIME25 | 47,4 |
| Razonamiento | HMMT25 | 31,0 |
| Razonamiento | ZebraLogic | 80,2 |
| Razonamiento | LiveBench 2024-11-25 | 63,0 |
| Codigo | LiveCodeBench v6 | 35,1 |
| Codigo | MultiPL-E | 76,8 |
| Codigo | Aider-Polyglot | 12,9 |
| Alineacion | IFEval | 83,4 |
| Alineacion | Arena-Hard v2 | 43,4 |
| Alineacion | Creative Writing v3 | 83,5 |
| Alineacion | WritingBench | 83,4 |
| Agentes | BFCL-v3 | 61,9 |
| Agentes | TAU1-Retail | 48,7 |
| Agentes | TAU1-Airline | 32,0 |
| Agentes | TAU2-Retail | 40,4 |
| Multilingue | MultiIF | 69,0 |
| Multilingue | MMLU-ProX | 61,6 |
| Multilingue | INCLUDE | 60,1 |
| Multilingue | PolyMATH | 31,1 |

Evaluacion funcional del LoRA (`iact-bench` Phase 8, 2026-05-11, 10 muestras, sandbox Docker):

| Metrica | Valor |
|---|---:|
| Validador | `judge-only` |
| Limite tmpfs | 256 MB |
| Muestras | 10 |
| Tasa de exito | 0,0 |
| Tiempo total de validacion | 0,0 s |

Comprobacion de olvido entre dominios (Phase 9, Jaccard vs base sin adaptador):

| Dominio | Jaccard LoRA | Delta vs base |
|---|---:|---:|
| kicad | 0,083 | -0,004 |
| spice | 0,006 | +0,001 |
| stm32 | 0,075 | +0,025 |
| emc | 0,069 | +0,003 |
| embedded | 0,085 | +0,011 |
| platformio | 0,057 | +0,015 |
| freecad | 0,035 | +0,014 |
| dsp | 0,109 | +0,008 |
| iot | 0,060 | -0,008 |
| power | 0,076 | +0,008 |

## Requisitos de hardware

- VRAM estimada para inferencia del base en BF16: aproximadamente 8-10 GB (4B parametros mas cache KV); el adaptador LoRA anade menos de 100 MB.
- En cuantizacion 8 bits: aproximadamente 5-6 GB; en 4 bits: aproximadamente 3-4 GB (estimaciones para el base, no confirmadas para el adaptador).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia individual holgada.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y en tarjetas de 8 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers + PEFT (formato nativo del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp/Ollama tras fusionar y convertir el adaptador. La model card menciona compilacion a un Modelfile de Ollama y servicio mediante un gateway con alias `ailiance-<dominio>`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `qwen3-4b-mascarade-iot-lora` | 4B (+LoRA r=16) | 262.144 | Apache 2.0 | Adaptador de dominio IoT; tasa de exito funcional 0,0 % en Phase 8 |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | 262.144 | Apache 2.0 | Base sin especializar; benchmarks oficiales publicados |
| `Ailiance-fr/qwen3-4b-mascarade-power-lora` | 4B (+LoRA r=16) | 262.144 | Apache 2.0 | Mismo esquema, dominio power |
| Alternativas generalistas de 3-4B (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4B | 128K (Llama 3.2), 128K (Phi-3.5) | Licencias comunitarias | No especializadas en hardware; comparativa de rendimiento no disponible en la informacion |

## Limitaciones y advertencias

- Tasa de exito funcional de 0,0 % en `iact-bench` Phase 8 (10 muestras): no hay evidencia de que el adaptador produzca codigo IoT que compile o ejecute correctamente en el sandbox de validacion.
- Delta de Jaccard negativo (-0,008) en el dominio IoT respecto al base: el adaptador podria degradar ligeramente el comportamiento del modelo sin adaptador en su propio dominio.
- Benchmarks del LoRA marcados como pendientes en la model card; solo existen resultados del base.
- Riesgo de alucinacion heredado del base, especialmente en especificaciones electricas, pinouts y registros de microcontroladores; validacion humana obligatoria en produccion.
- Dataset de entrenamiento no documentado (composicion, tamano, procedencia); imposible auditar sesgos de dominio.
- Idiomas soportados no declarados explicitamente para el adaptador; se asume herencia multilingue del base sin confirmacion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion funcional positiva desaconseja su despliegue sin validacion propia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ailiance-fr/qwen3-4b-mascarade-iot-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de evaluacion: https://huggingface.co/datasets/Ailiance-fr/mascarade-iot-dataset
- Adaptador hermano (dominio power): https://huggingface.co/Ailiance-fr/qwen3-4b-mascarade-power-lora
- Pagina de la familia mascarade: https://www.ailiance.fr/models/ailiance/mascarade
- Herramienta de evaluacion iact-bench: https://github.com/electron-rare/iact-bench
- Repositorio TRL: https://github.com/huggingface/trl
