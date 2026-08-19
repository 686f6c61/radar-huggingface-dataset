# sokada4/Qwen3.6-27B-GPTQ-Int4

## Resumen

Qwen3.6-27B-GPTQ-Int4 es una cuantización de 4 bits (W4A16) del modelo denso Qwen/Qwen3.6-27B, realizada por sokada4 mediante GPTQModel 7.3.4. El checkpoint resultante pesa 19.6 GB y está pensado para servir inferencia de texto con vLLM en hardware de consumo, manteniendo intacta la cabeza de predicción multi-token (MTP) del modelo original para decodificación especulativa. Aunque el modelo base es multimodal (image-text-to-text), esta versión cuantizada está orientada exclusivamente a tareas de lenguaje, con la torre de visión sin cuantizar pero no utilizada en el pipeline de texto.

El modelo resuelve el problema de ejecutar un LLM de 27B parámetros en GPUs de 24 GB (dos de ellas) con contexto largo de hasta 262 144 tokens, algo inviable con los pesos en bf16. Su relevancia actual radica en que ofrece una alternativa local de alto rendimiento para agentes de código como Claude Code o Codex CLI, con soporte de tool calling y razonamiento, bajo licencia Apache 2.0. La cuantización conserva los tensores MTP en bf16, lo que permite activar la decodificación especulativa sin penalizar la calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con cabeza de prediccion multi-token (MTP) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | GPTQ W4A16, 4 bits, group size 128, simetrico, `desc_act` false |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (GPTQ) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion GPTQ del modelo base Qwen/Qwen3.6-27B, un transformer denso de 27B parametros con una cabeza de prediccion multi-token (MTP) para decodificacion especulativa. La cuantizacion se realizo con GPTQModel 7.3.4 sobre un conjunto de calibracion compuesto por 256 muestras de `allenai/c4` (chino, ingles y japones) y `codeparrot/codeparrot-clean-valid`, con longitud de secuencia 4096. Los tensores `mtp.*` (15 tensores de la cabeza de decodificacion especulativa) se mantienen en bf16 sin cuantizar, al igual que los pesos de la torre de vision. Solo se cuantizan los pesos de `language_model.*`. No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens, dataset completo, metodos de alineacion como RLHF o DPO).

## Capacidades

- Generacion de texto con soporte de razonamiento explicito (parsing de cadenas de pensamiento via `--reasoning-parser qwen3`).
- Tool calling / function calling mediante el parser `qwen3_xml` de vLLM, compatible con agentes que usan la API de OpenAI o Anthropic.
- Decodificacion especulativa MTP: genera un token adicional por paso, con tasa de aceptacion medida del 84-88 % en pruebas de vLLM.
- Contexto largo de hasta 262 144 tokens, util para documentos extensos o conversaciones multi-turno.
- Multilingue limitado: la calibracion incluyo chino, ingles y japones, aunque no se garantiza un soporte completo de idiomas.
- Capacidades de vision no activas en esta cuantizacion: la torre de vision no se cuantiza pero el checkpoint esta disenado para servir texto.

## Casos de uso

- Backend local para Claude Code: se puede configurar como servidor Anthropic Messages API apuntando `ANTHROPIC_BASE_URL` a vLLM, permitiendo que el asistente de codigo use el modelo local en lugar de la API de pago.
- Backend para Codex CLI: mediante la configuracion de un proveedor local compatible con OpenAI Responses API, el modelo actua como motor de razonamiento y generacion de codigo en el agente de OpenAI.
- Agente de codigo con tool calling: gracias al parser `qwen3_xml`, el modelo puede invocar herramientas en flujos de trabajo multi-paso, aunque con una tasa de errores en llamadas a herramientas mayor que los modelos hosted (ver limitaciones).
- Razonamiento sobre repositorios grandes: con 262k tokens de contexto, puede procesar archivos de codigo extensos o documentacion tecnica completa en una sola pasada.
- Generacion de codigo en entornos CI/CD: integrable como servicio vLLM para autocompletado o revision de parches, con latencia TPOT de 12 ms en configuracion MTP.
- Chat conversacional de bajo coste: desplegado en 2x RTX 3090 ofrece 69 tokens/s en peticiones secuenciales, suficiente para interacciones interactivas.
- Experimentacion academica: al ser Apache 2.0 y cuantizado, permite probar tecnicas de decodificacion especulativa o evaluar el impacto de la cuantizacion en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

La model card incluye mediciones de rendimiento de inferencia con vLLM 0.26.0 en 2x RTX 3090, con `vllm bench serve` (dataset aleatorio, input-len 128, output-len 64, TP=2):

| Configuracion | Concurrencia | TTFT medio | TPOT medio | Tokens/s de salida | Tasa de aceptacion MTP |
|---|---|---|---|---|---|
| Sin decodificacion especulativa | 1 | 145.8 ms | 16.4 ms | 54.4 | — |
| Con MTP | 1 | 165.0 ms | 12.0 ms | 69.4 | 84.4 % |
| Sin decodificacion especulativa | 8 | 815.8 ms | 22.5 ms | 222.4 | — |
| Con MTP | 8 | 507.0 ms | 37.4 ms | 174.5 | 88.3 % |

La decodificacion especulativa mejora el rendimiento en baja concurrencia pero reduce el throughput agregado a alta concurrencia, por lo que la eleccion depende del patron de trafico.

## Requisitos de hardware

- VRAM estimada: ~17.7 GiB para los pesos en 4 bits. Con KV cache, una sola GPU de 24 GB es insuficiente para el contexto nativo; se recomiendan 2x24 GB.
- GPUs recomendadas: 2x RTX 3090 (usadas en las pruebas), 2x RTX 4090, o 2x48 GB+ (A6000, L40S, etc.) para contexto completo sin recortes.
- En una sola GPU de 24 GB solo es practico sin MTP y con `--max-model-len` reducido muy por debajo del nativo (la captura de grafos CUDA provoca OOM a longitud nativa).
- Despliegue con vLLM 0.26.0 o superior, usando `--tensor-parallel-size 2` y `--gpu-memory-utilization 0.95`. No se mencionan otras opciones como llama.cpp u Ollama.
- Latencia observada: TTFT de 145-165 ms y TPOT de 12-16 ms en peticiones secuenciales; throughput de 174-222 tokens/s con concurrencia 8.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de la misma categoria (por ejemplo, otras cuantizaciones de Qwen3.6 o modelos de 27B equivalentes) en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion esta disenada para servir texto; las capacidades de vision del modelo base no estan disponibles en este checkpoint.
- Tasa de llamadas a herramientas malformadas significativamente mayor que los modelos hosted de Claude/GPT (reportes comunitarios indican ~10x). No se recomienda ejecutar bucles de agente totalmente autonomos sin supervision humana.
- La decodificacion especulativa MTP reduce el throughput a alta concurrencia; debe desactivarse si el trafico es mayoritariamente batch.
- El contexto nativo de 262 144 tokens requiere al menos 2x24 GB de VRAM; en 2x24 GB hay que reducir `--max-model-len` a 200 000 para dejar espacio al buffer de verificacion MTP.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma especificas del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sokada4/Qwen3.6-27B-GPTQ-Int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- GPTQModel (herramienta de cuantizacion): https://github.com/ModelCloud/GPTQModel
