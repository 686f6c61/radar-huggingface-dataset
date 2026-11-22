# litert-community/LFM3-1.7B-LiteRT

## Resumen

LFM3-1.7B-LiteRT es la conversion al runtime LiteRT-LM del modelo LFM3-1.7B de Liquid AI, realizada por la comunidad litert-community con las herramientas litert-torch (commit f61d0b7) y litert-lm-builder 0.18.1. El modelo original es un transformer hibrido de 1,73 mil millones de parametros y 24 capas que combina 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global, con un vocabulario de 128.000 tokens y soporte para 16 idiomas. Esta version empaqueta los pesos en formato `.litertlm` para ejecucion on-device en GPU y CPU de dispositivos moviles y equipos de escritorio.

El problema que resuelve esta conversion es la ejecucion eficiente de un modelo conversacional con capacidad de razonamiento explicito y tool calling en hardware de consumo, sin necesidad de GPUs de datacenter. Los ficheros publicados incluyen cuantizaciones mixtas int4/int8 y cache KV de 2.048 o 4.096 tokens, con firmas de prefill desde 1 hasta 1.024 tokens. La relevancia actual viene de la demanda de agentes locales que funcionan sin conexion y con latencia baja en telefonos y portatiles.

El modelo original esta pensado para agentes locales y aplicaciones especializadas. Por defecto razona dentro de un bloque `<think>` antes de responder y escribe las llamadas a herramientas en formato XML. La model card de origen no lo recomienda para programacion agentica ni para razonamiento multi-paso complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 capas (13 convoluciones cortas con compuerta, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1,73 mil millones (1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Cache KV configurable: 2.048 o 4.096 tokens segun fichero; firmas de prefill de 1.024, 256, 64, 16, 4 y 1 tokens |
| Tipos de cuantizacion | Mixta int4 (MLP gate/up, blockwise 32 pesos por bloque) + int8 por canal (resto); int8 por canal completa |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM); repo incluye `litertlm_manifest.json` y `tokenizer.json` |

| Fichero | Cuantizacion | Cache KV | Tamano |
|---|---|---|---|
| `LFM3-1.7B_mixed_int4_ekv2048.litertlm` | Mixta int4/int8 | 2.048 | 1,44 GB |
| `LFM3-1.7B_mixed_int4_ekv4096.litertlm` | Mixta int4/int8 | 4.096 | 1,44 GB |
| `LFM3-1.7B_int8_ekv2048.litertlm` | int8 por canal | 2.048 | 1,80 GB |
| `LFM3-1.7B_int8_ekv4096.litertlm` | int8 por canal | 4.096 | 1,80 GB |

## Arquitectura y entrenamiento

La arquitectura original es un transformer hibrido poco convencional: de las 24 capas, 13 son convoluciones cortas con compuerta, 5 usan atencion de ventana deslizante y 6 usan atencion global. Esta mezcla reduce el coste de atencion frente a un transformer denso equivalente manteniendo capacidad de modelado de contexto largo. El vocabulario es de 128.000 tokens. La model card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO; esos datos corresponden al modelo base LiquidAI/LFM3-1.7B y no se reproducen aqui.

La innovacion tecnica de esta ficha es la conversion: los pesos se empaquetan con firmas de prefill de varios tamanos (1.024, 256, 64, 16, 4 y 1 tokens), se preserva el `tokenizer.json` del repositorio original byte a byte, se incluye la plantilla de chat, un canal de pensamiento (`<think>` … `</think>`) y un sampler con top-k 50 y temperatura 0,1 (el ajuste General de la model card original, sin su penalizacion de repeticion). Ningun fichero declara tipo de activacion, por lo que en GPU LiteRT-LM los ejecuta con activaciones fp16.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 4.096 tokens de cache KV.
- Modo de razonamiento explicito: por defecto emite un bloque `<think>` antes de la respuesta, desactivable con `--thinking false` o `ThinkingConfig(enable_thinking=False)`.
- Tool calling en formato XML: el modelo escribe la llamada como texto y la aplicacion la interpreta y devuelve el resultado como mensaje `tool`.
- Soporte multilingue en 16 idiomas (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Ejecucion on-device con backend GPU o CPU mediante LiteRT-LM.
- No se documentan capacidades de vision, audio ni codificacion agentica en la informacion disponible.

## Casos de uso

- Asistente conversacional offline en movil: el fichero mixed int4 de 1,44 GB cabe en un telefono de gama alta y decodifica a 32,42 tokens/s en la GPU de un Galaxy S26, permitiendo respuestas interactivas sin red.
- Agente local con herramientas: el modelo emite llamadas XML que la app interpreta y responde con resultados, util para integraciones con APIs de clima, calendario o busqueda en dispositivos sin backend.
- Razonamiento con traza auditable: el bloque `<think>` permite mostrar al usuario el proceso intermedio antes de la respuesta, adecuado en asistentes educativos o de soporte que requieren transparencia.
- Procesamiento de documentos largos en edge: los ficheros con cache de 4.096 tokens permiten resumir o responder preguntas sobre textos de varias paginas en un portatil, con 15,13 tokens/s en la GPU de un Pixel 8a.
- Traduccion y atencion multilingue: los 16 idiomas soportados habilitan asistentes de traduccion o clasificacion de texto en entornos con usuarios de distintas lenguas, sin depender de servicios en la nube.
- Prototipado rapido con CLI: `uvx --from litert-lm==0.18.1 litert-lm run` permite evaluar el modelo en minutos en CPU o GPU antes de integrarlo en una aplicacion.
- Despliegue en CPU de bajo consumo: el fichero mixed int4 decodifica a 35,53 tokens/s en la CPU de un Galaxy S26, apto para dispositivos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son medidas de decodificacion y de fidelidad respecto al modelo original en float32:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion mixed int4, cache 2.048 | 32,42 tokens/s | Galaxy S26 GPU, prefill de 1.024 tokens, media de dos ejecuciones (2026-10-29) |
| Decodificacion int8, cache 2.048 | 28,86 tokens/s | Galaxy S26 GPU |
| Decodificacion mixed int4, cache 4.096 | 15,13 tokens/s | Pixel 8a GPU |
| Decodificacion mixed int4, cache 2.048 | 12,77 tokens/s | Pixel 8a GPU |
| Decodificacion mixed int4 | 35,53 tokens/s | Galaxy S26 CPU |
| Decodificacion int8, cache 2.048 | 31,06 tokens/s | Galaxy S26 CPU |
| Acuerdo de top token con el original fp32 | 95,7 % de 2.682 posiciones | Fichero int8, GPU de Mac (Metal) |
| Acuerdo de top token con el original fp32 | 79,9 % de 2.682 posiciones | Fichero mixed int4, GPU de Mac |
| Acuerdo de top token con el original fp32 | 88,7 % | Fichero int8, CPU de Mac |
| Acuerdo de top token con el original fp32 | 77,9 % | Fichero mixed int4, CPU de Mac |

## Requisitos de hardware

- VRAM/RAM: 1,44 GB para ficheros mixed int4 y 1,80 GB para ficheros int8, sin contar overhead del runtime y del cache KV.
- GPU recomendadas: GPU integrada de moviles de gama alta (Galaxy S26, Pixel 8a) y GPU de Mac via ruta Metal; no se documentan requisitos para A100, H100 o RTX 4090 porque el modelo esta orientado a edge.
- Cabe en GPU de consumo y en telefonos: si, con los ficheros de 1,44-1,80 GB.
- Despliegue: LiteRT-LM 0.18.1 (CLI `litert-lm run` o libreria Python `litert_lm`), backend GPU o CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 32,42 tokens/s en Galaxy S26 GPU con mixed int4 y cache 2.048; 35,53 tokens/s en CPU del mismo dispositivo; 15,13 tokens/s en Pixel 8a GPU con cache 4.096.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-LiteRT (esta ficha) | 1,73B | Cache KV 2.048/4.096 | `.litertlm` | lfm1.0 | Hugging Face, litert-community |
| LiquidAI/LFM3-1.7B (base) | 1,73B | No disponible en la informacion | safetensors (original) | lfm1.0 | Hugging Face, LiquidAI |
| LiquidAI/LFM3-1.7B-GGUF | 1,73B | No disponible | GGUF | lfm1.0 | Hugging Face, LiquidAI |
| LiquidAI/LFM3-1.7B-MLX-4bit | 1,73B | No disponible | MLX 4-bit | lfm1.0 | Hugging Face, LiquidAI |
| LiquidAI/LFM3-1.7B-ONNX | 1,73B | No disponible | ONNX | lfm1.0 | Hugging Face, LiquidAI |
| LiquidAI/LFM3-1.7B-FP8 | 1,73B | No disponible | FP8 | lfm1.0 | Hugging Face, LiquidAI |
| LiquidAI/LFM3-1.7B-NVFP4 | 1,73B | No disponible | NVFP4 | lfm1.0 | Hugging Face, LiquidAI |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas de otros fabricantes; la comparativa se limita a los formatos publicados del mismo modelo base.

## Limitaciones y advertencias

- La model card de origen no recomienda el modelo para programacion agentica ni para razonamiento multi-paso complejo.
- Riesgo de alucinacion inherente a modelos de 1,73B; no se documentan evaluaciones de factualidad.
- El fichero mixed int4 pierde fidelidad respecto al original: 79,9 % de acuerdo de top token en GPU frente a 95,7 % del int8; en CPU baja a 77,9 %.
- Los ficheros int8 en CPU mostraron menor calidad: fallaron la rima en las preguntas de control y su acuerdo con el original cae al 88,7 %.
- La cache KV esta limitada a 2.048 o 4.096 tokens segun el fichero, muy por debajo de ventanas de contexto de modelos de servidor.
- Licencia lfm1.0 con condiciones especificas; revisar el fichero LICENSE antes de uso comercial.
- Se recomienda un Engine por conversacion, segun las notas de limitaciones del repositorio.
- El sampler fijado (top-k 50, temperatura 0,1) sin penalizacion de repeticion puede producir respuestas repetitivas en generaciones largas.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT/blob/main/LICENSE
- GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- MLX 4-bit: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- ONNX: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX
- FP8: https://huggingface.co/LiquidAI/LFM3-1.7B-FP8
- NVFP4: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
