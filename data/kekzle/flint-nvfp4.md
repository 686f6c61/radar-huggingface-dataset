# kekzle/Flint-NVFP4

## Resumen
Flint-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo Recursive Flint, publicado por el usuario kekzle. Se trata de un reempaquetado sin perdida de los tensores ya cuantizados del GGUF oficial (RecursiveSI/flint-nvfp4-gguf) al formato ModelOpt NVFP4, de modo que el modelo pueda cargarse directamente en vLLM (a partir de la version 0.33.0, la primera con FlintForCausalLM) y en el runtime imp sin necesidad de un lector de GGUF. El modelo base, Recursive Flint, es un transformer con mezcla de expertos (MoE) de 39,8 mil millones de parametros totales y unos 2,5 mil millones activos por token.

La relevancia de esta publicacion es practica: reduce los 74,1 GiB en BF16 a 21,7 GiB, lo que permite servir un modelo de casi 40 B en una unica GPU de 32 GB. La cuantizacion es W4A16 (pesos en 4 bits, activaciones en 16 bits) con codigos E2M1, escalas de bloque E4M3 y una escala tensorial F32, todo copiado de los tensores originales de Recursive en lugar de recalcularse.

El autor no esta afiliado a Recursive y remite a la model card del modelo base para detalles de arquitectura, benchmarks, convenciones de chat y limitaciones. La licencia es Apache-2.0, la misma que los repositorios de origen.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 256 expertos enrutados por capa, 47 capas con expertos, segun el inventario de tensores cuantizados |
| Parametros totales | 39.785.287.456 (~39,8 B) |
| Parametros activos | ~2,5 B por token |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | NVFP4 (W4A16): pesos en FP4 E2M1, escalas de bloque F8_E4M3 (una por 16 columnas), escala tensorial F32 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (109.612 tensores en 15 shards, 23,3 GB de repo) |

## Arquitectura y entrenamiento
El modelo base es un transformer con arquitectura MoE de 39,8 B de parametros totales y aproximadamente 2,5 B activos por token. El inventario de tensores cuantizados delata la estructura: 36.439 capas Lineales cuantizadas, que incluyen atencion q/k/v/o, dos MLP densas, los expertos compartidos y los 256 x 47 expertos enrutados. Permanecen en BF16 los embeddings (`model.embed_tokens`), los 47 routers (`mlp.gate`), las normas y los attention sinks.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; esos datos corresponden a la model card de RecursiveSI/flint, no incluida en la informacion proporcionada. La innovacion tecnica de este repositorio es el reempaquetado: los codigos E2M1, las escalas de bloque E4M3 y la escala tensorial F32 se copian sin recalcular desde el GGUF oficial, y `lm_head` se escribe en BF16 como codigo x escala de bloque x escala tensorial (un unico redondeo). El `config.json` declara `quant_method: modelopt` y `quant_algo: W4A16_NVFP4`.

## Capacidades
- Generacion de texto y conversacion multi-turno, con plantilla de chat incluida.
- Modo de razonamiento: el modelo emite `reasoning_content` separado, que debe conservarse en el historial de la conversacion.
- Tool calling / function calling: verificado en imp con los formatos de OpenAI y Anthropic.
- Razonamiento multi-paso y uso como agente dentro de los limites del modelo base.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso
- Servicio de chat en una sola GPU de 32 GB: con 21,7 GiB de pesos, el checkpoint deja margen para cache KV en tarjetas como la RTX 5090, lo que permite desplegar un MoE de ~40 B en hardware de consumo profesional.
- Asistentes con razonamiento explicito: el modo `reasoning_content` permite separar el razonamiento interno de la respuesta final, util en interfaces que muestran el proceso de pensamiento al usuario.
- Automatizacion con herramientas: el soporte de tool calling en formato OpenAI y Anthropic facilita integrar el modelo en orquestadores de agentes existentes sin adaptadores adicionales.
- Sustitucion de un despliegue BF16 para ahorrar VRAM: el autor mide una diferencia de perplejidad de +0,011 NLL frente a BF16 en la referencia CPU, lo que hace viable el cambio cuando el presupuesto de memoria es el factor limitante.
- Prototipado e investigacion en vLLM: al cargar con `vllm serve` sin lector de GGUF, se integra en pipelines de evaluacion y serving estandar basados en la API de vLLM.
- Despliegue con el runtime imp: el contenedor `ghcr.io/kekzl/imp:latest` con `imp-server` ofrece una alternativa ligera a vLLM, con unos 350 tokens/s en una sola corriente para respuestas de 600-1200 tokens en RTX 5090.

## Benchmarks y rendimiento
| Pesos | Runtime | Perplejidad |
|---|---|---|
| BF16 (RecursiveSI/flint) | Referencia CPU FP32 | 12,717 |
| Este repositorio | Referencia CPU, W4A16 | 12,861 (NLL +0,011 +- 0,016 frente a BF16) |
| Este repositorio | imp, RTX 5090 (W4A4 en prefill) | 13,841 |

La perplejidad se mide sobre las mismas 4.095 filas (los primeros 4.096 tokens de `ppl_corpus_45k.txt` de imp, sin BOS). Frente a BF16, el argmax del siguiente token coincide en el 82,2 % de las filas (KL 0,221 +- 0,014). En vLLM 0.33.0 sobre RTX 5090 consume 31.125 MiB con `--gpu-memory-utilization 0.90`; los kernels Flint de vLLM estan orientados a tarjetas SM100 y en la 5090 se ejecuta la ruta FP4 Marlin estandar. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM de pesos: 21,7 GiB en NVFP4, frente a 74,1 GiB en BF16.
- Cabe en una GPU de 32 GB; el autor lo ha verificado en una RTX 5090 con vLLM (31.125 MiB al 90 % de utilizacion de memoria) y con imp.
- GPU recomendadas: RTX 5090 (verificada); tarjetas SM100 para los kernels Flint nativos de vLLM (no verificadas en la informacion disponible); A100 y H100 no se mencionan.
- Despliegue: vLLM >= 0.33.0 (`vllm serve kekzle/Flint-NVFP4 --served-model-name flint --max-model-len 8192 --gpu-memory-utilization 0.90`) e imp (build posterior a v0.67.1, via `ghcr.io/kekzl/imp:latest`).
- Rendimiento medido en imp sobre RTX 5090: aproximadamente 350 tokens/s para respuestas de 600-1200 tokens, una sola corriente. No hay datos de throughput de vLLM.
- Muestreo recomendado por Recursive: temperatura 1,0, top-p 0,95, top-k 20.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flint-NVFP4 (este) | 39,8 B totales, ~2,5 B activos | no disponible | NVFP4 W4A16, 21,7 GiB | Apache-2.0 | Hugging Face, vLLM, imp |
| RecursiveSI/flint (BF16) | 39,8 B totales, ~2,5 B activos | no disponible | BF16, 74,1 GiB | Apache-2.0 | Hugging Face |
| RecursiveSI/flint-nvfp4-gguf | 39,8 B totales, ~2,5 B activos | no disponible | NVFP4 en GGUF, 22.863.084.160 bytes | Apache-2.0 | Hugging Face, lectores GGUF |
| Otros modelos de ~40 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo con modelos de otras familias, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion inherente al modelo base; no se aportan tasas de error en la informacion disponible.
- La cuantizacion altera la distribucion: el argmax del siguiente token solo coincide con BF16 en el 82,2 % de las filas, aunque la perdida media no cambia de forma significativa.
- En imp, el prefill cuantiza activaciones (W4A4) y la perplejidad sube a 13,841 frente a 12,861 en W4A16; conviene elegir el runtime segun la tolerancia a esa degradacion.
- Los kernels Flint de vLLM estan pensados para SM100; en GPUs consumer como la RTX 5090 se usa la ruta FP4 Marlin, con comportamiento no verificado en otras tarjetas.
- El repositorio no esta afiliado a Recursive; la responsabilidad sobre el modelo base, la plantilla de chat y las convenciones de razonamiento recae en la model card original.
- Licencia Apache-2.0 permite uso comercial, pero el archivo `LICENSE` incluido es el de Recursive y deben respetarse las condiciones del modelo base.
- El autor no documenta sesgos conocidos ni evaluaciones de seguridad; no disponible.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/kekzle/Flint-NVFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- GGUF de origen: https://huggingface.co/RecursiveSI/flint-nvfp4-gguf
- Runtime imp: https://github.com/kekzl/imp
