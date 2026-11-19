# litert-community/LFM3-1.7B-LiteRT

## Resumen

LFM3-1.7B-LiteRT es la conversión al formato LiteRT-LM del modelo de texto LiquidAI/LFM3-1.7B, publicada por la comunidad litert-community. LiteRT-LM es el runtime de Google para ejecutar modelos de lenguaje en dispositivos locales (moviles, portatiles y equipos de sobremesa sin GPU dedicada de datacenter), de modo que este repositorio resuelve el problema de llevar un modelo conversacional de 1,73B parametros a inferencia totalmente on-device con artefactos `.litertlm` listos para usar.

El modelo base, desarrollado por Liquid AI, emplea una arquitectura hibrida de 24 capas que combina 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global, con un vocabulario de 128.000 tokens y soporte para 16 idiomas. Por defecto razona dentro de un bloque `<think>` antes de responder y emite las llamadas a herramientas en formato XML.

La relevancia de esta ficha radica en que ofrece cuatro variantes cuantizadas (int4 mixto e int8, con cache KV de 2.048 o 4.096 tokens) que caben en 1,44-1,80 GB de almacenamiento, con velocidades medidas de 32,42 tokens/s en la GPU de un Galaxy S26 tras un prefill de 1.024 tokens. Es una opcion practica para agentes locales y aplicaciones especializadas en las que no se puede depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 capas (13 convoluciones cortas con compuerta, 5 de atencion de ventana deslizante, 6 de atencion global) |
| Parametros totales | 1,73B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Cache KV configurable de 2.048 o 4.096 tokens segun fichero; longitud de contexto nativa del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 mixto (MLP gate/up en int4 blockwise de 32 pesos por bloque; resto en int8 por canal) e int8 por canal |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia "other" segun metadatos de HF) |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base tambien se publica en GGUF, MLX, ONNX, FP8 y NVFP4 |
| Vocabulario | 128.000 tokens |
| Tamano de los ficheros | 1,44 GB (int4 mixto) / 1,80 GB (int8) |
| Prefill signatures | 1.024, 256, 64, 16, 4 y 1 tokens |
| Sampler incluido | top-k 50, temperatura 0,1 (sin penalizacion por repeticion) |
| Runtime | LiteRT-LM 0.18.1 (litert-lm-builder 0.18.1, litert-torch commit f61d0b7) |
| Tamano del repo | 13,0 GB |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B de Liquid AI no es un transformer denso convencional: sus 24 capas alternan 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta mezcla reduce el coste de atencion en contextos largos y esta pensada para inferencia eficiente en dispositivos con recursos limitados. El vocabulario de 128.000 tokens cubre 16 idiomas.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO sobre el modelo base. Lo que si se documenta es el comportamiento: el modelo razona por defecto dentro de un bloque `<think>` antes de emitir la respuesta y escribe las llamadas a herramientas en un formato XML propio. La model card del autor original no lo recomienda para programacion agentica ni para razonamiento multi-paso complejo.

La conversion a LiteRT-LM se realizo con litert-torch y litert-lm-builder 0.18.1. Cada fichero incluye el `tokenizer.json` del repositorio original byte a byte, la plantilla de chat, un canal de pensamiento (`<think>` … `</think>`) y el sampler ya configurado. Ningun fichero declara tipo de activacion, por lo que en GPU LiteRT-LM ejecuta con activaciones fp16. La variante int4 mixto cuantiza solo las proyecciones gate y up del MLP en int4 blockwise (32 pesos por bloque) y mantiene el resto (atencion, convoluciones cortas, proyeccion down del MLP y la tabla compartida de embedding/salida) en int8 por canal.

## Capacidades

- Generacion de texto conversacional multi-turno en 16 idiomas (incluido el castellano).
- Modo de razonamiento explicito: por defecto genera un bloque `<think>` antes de la respuesta, desactivable mediante `ThinkingConfig(enable_thinking=False)`.
- Llamada a herramientas (tool calling / function calling): el modelo emite la llamada como texto en formato XML y la aplicacion la interpreta y devuelve el resultado como mensaje `tool`.
- Integracion con agentes locales: el runtime permite adjuntar definiciones de herramientas mediante `extra_context={"tools": ...}`.
- Inferencia on-device en GPU y CPU a traves del runtime LiteRT-LM.
- Gestion de conversaciones mediante objetos `Engine` y `create_conversation`.
- No se documentan capacidades de vision, audio ni codigo especializado en la informacion disponible.

## Casos de uso

- Asistentes conversacionales sin conexion: el modelo corre integramente en el dispositivo con 1,44 GB en int4, lo que permite desplegar un asistente de chat en moviles Android o portatiles sin enviar datos a la nube.
- Agentes locales con herramientas: gracias al tool calling en XML y al soporte de `extra_context={"tools": ...}`, se puede construir un agente que consulte APIs locales (clima, calendario, ficheros) y devuelva resultados al modelo como mensajes `tool`.
- Traduccion y atencion multilingue: con 16 idiomas soportados y un vocabulario de 128.000 tokens, es adecuado para interfaces de traduccion o asistencia en castellano, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Procesamiento de texto en el borde (edge computing): clasificacion, resumen y extraccion de informacion en dispositivos IoT o moviles donde no hay GPU de datacenter, usando la variante int4 en CPU (35,53 tokens/s medidos en Galaxy S26 CPU).
- Razonamiento con traza auditable: el bloque `<think>` permite registrar el razonamiento intermedio del modelo, util en aplicaciones donde se requiere inspeccionar como se llego a una respuesta.
- Prototipado rapido de aplicaciones on-device: la CLI `litert-lm run` y el paquete Python `litert-lm==0.18.1` permiten validar un flujo completo de preguntas y respuestas en pocos minutos.
- Aplicaciones de privacidad estricta: al ejecutarse localmente, los datos del usuario no salen del dispositivo, lo que encaja en entornos sanitarios, legales o corporativos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento documentados son mediciones de velocidad y fidelidad de la cuantizacion:

| Medicion | Valor |
|---|---|
| Decodificacion, GPU Galaxy S26, int4 mixto, cache 2.048, prefill 1.024 tokens | 32,42 tokens/s (media de dos ejecuciones, 2026-10-29) |
| Decodificacion, GPU Galaxy S26, int8, cache 2.048 | 28,86 tokens/s |
| Decodificacion, CPU Galaxy S26, int4 mixto | 35,53 tokens/s |
| Decodificacion, CPU Galaxy S26, int8 | 31,06 tokens/s |
| Decodificacion, GPU Pixel 8a, int4 mixto, cache 4.096 | 15,13 tokens/s |
| Decodificacion, GPU Pixel 8a, int4 mixto, cache 2.048 | 12,77 tokens/s |
| Coincidencia del token top-1 con el modelo fuente en fp32, GPU Mac, int8 | 95,7 % de 2.682 posiciones |
| Coincidencia del token top-1 con el modelo fuente en fp32, GPU Mac, int4 mixto | 79,9 % |
| Coincidencia del token top-1 con el modelo fuente en fp32, CPU Mac, int8 | 88,7 % |
| Coincidencia del token top-1 con el modelo fuente en fp32, CPU Mac, int4 mixto | 77,9 % |

## Requisitos de hardware

- Almacenamiento: 1,44 GB para las variantes int4 mixtas y 1,80 GB para las int8.
- VRAM/RAM estimada para inferencia: no se publica una cifra explicita; el tamano del fichero (1,44-1,80 GB) mas el cache KV de 2.048 o 4.096 tokens y las activaciones fp16 en GPU dan una horquilla practica de aproximadamente 2-3 GB, aunque esta estimacion no aparece en la informacion proporcionada.
- GPU verificadas: GPU de Galaxy S26 (32,42 tokens/s con int4) y GPU de Pixel 8a (15,13 tokens/s con int4 y cache 4.096); GPU de Mac mediante la ruta Metal del runtime LiteRT.
- CPU verificadas: CPU de Galaxy S26 (35,53 tokens/s con int4) y CPU de Mac.
- Cabe en hardware consumer: si, en moviles de gama alta recientes y en portatiles; no se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: CLI `litert-lm run` (via `uvx --from litert-lm==0.18.1`) y API Python `litert-lm==0.18.1`, con `--backend gpu` o `--backend cpu`.
- Seleccion de fichero: en GPU conviene int4 mixto por velocidad; en CPU tambien int4 mixto (mayor velocidad y respuestas correctas en las 8 preguntas de control); para pensamiento largo, ficheros con cache de 4.096 tokens.
- Latencia y throughput: ver tabla de benchmarks; no se publican datos de latencia de prefill mas alla de la referencia al prefill de 1.024 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-LiteRT (este) | 1,73B | cache KV 2.048 o 4.096 | `.litertlm` / LiteRT-LM | lfm1.0 | Conversion comunitaria; 32,42 tokens/s en GPU Galaxy S26 |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | safetensors (modelo fuente) | lfm1.0 | Modelo original de Liquid AI; referencia de fidelidad |
| LiquidAI/LFM3-1.7B-GGUF | 1,73B | no disponible | GGUF | lfm1.0 | Variante para llama.cpp y ecosistema GGUF |
| LiquidAI/LFM3-1.7B-MLX-4bit | 1,73B | no disponible | MLX 4-bit | lfm1.0 | Variante para Apple Silicon |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de calidad con modelos de otros desarrolladores; la comparativa se limita a las variantes del mismo modelo base publicadas por Liquid AI.

## Limitaciones y advertencias

- La model card del modelo fuente no lo recomienda para programacion agentica ni para razonamiento multi-paso complejo.
- Riesgo de alucinacion inherente a un modelo de 1,73B; no se documentan evaluaciones de factualidad.
- La fidelidad de la cuantizacion int4 mixto es limitada: solo coincide con el token top-1 del modelo fuente en fp32 en el 79,9 % de las posiciones en GPU Mac y el 77,9 % en CPU Mac, frente al 95,7 % y 88,7 % de int8.
- En CPU, los ficheros int8 fallaron la rima en las preguntas de control, mientras que int4 mixto respondio correctamente las 8; el comportamiento depende del backend.
- El contexto efectivo esta acotado por el cache KV elegido (2.048 o 4.096 tokens); los ficheros de 4.096 son mas rapidos en Pixel 8a pero mas lentos en Galaxy S26.
- Se recomienda crear un `Engine` por conversacion, segun la seccion de limitaciones referenciada en la model card.
- Licencia lfm1.0: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; la informacion disponible no detalla las restricciones concretas.
- El sampler incluido usa temperatura 0,1 y top-k 50 sin penalizacion por repeticion; puede requerir ajuste para otros casos de uso.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Variante MLX 4-bit: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- Variante ONNX: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX
- Variante FP8: https://huggingface.co/LiquidAI/LFM3-1.7B-FP8
- Variante NVFP4: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Licencia: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT/blob/main/LICENSE
