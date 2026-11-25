# shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB-drafter

## Resumen

El modelo `shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB-drafter` es un drafter de decodificacion especulativa de 4 bits, entrenado con el objetivo DSpine de SpecForge y empaquetado para el runtime MLX LookAtMyQuant en Apple Silicon. No es un modelo generativo autonomo: es un modelo auxiliar que propone tokens candidatos para acelerar la inferencia del modelo objetivo `shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB`, una version cuantizada a 1,23 GB de `z-lab/Qwen3.5-4B-DFlash`.

El drafter propone los siguientes siete tokens en una sola pasada y el modelo objetivo empaquetado verifica las ocho posiciones en una pasada sobre sus codigos trellis. Segun la model card, esto produce una aceleracion de 1,5-2,0x manteniendo una salida greedy identica bit a bit (176 frente a 88 tokens/s en un Apple M5 Max sobre 30 prompts de evaluacion, con una media de 4,35 tokens aceptados por cada comprobacion de 8 tokens).

Su relevancia es practica: permite reducir a la mitad el coste de decodificacion de un modelo de 4B en hardware de consumo Apple, sin reentrenar el modelo objetivo ni recalibrar. El repositorio ocupa 0,5 GB y los pesos empaquetados del drafter son de 464 MB. El modelo esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa (objetivo DSpine de SpecForge) sobre base Qwen3.5-4B-DFlash |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits por peso (empaquetado con `pack_drafter.py`, sin datos de calibracion); formato `opgraph-packed-1` |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | `weights.bin` + `artifact.json` (empaquetado 4 bits, 464 MB), `config.json`, `pack_report.json`; runtime MLX |
| Tamano del repositorio | 0,5 GB |
| Modelo base | z-lab/Qwen3.5-4B-DFlash |
| Modelo objetivo asociado | shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB |
| Libreria | mlx |
| Plataforma | Apple Silicon (runtime LookAtMyQuant) |

## Arquitectura y entrenamiento

El drafter se entrena con el objetivo DSpine de SpecForge partiendo de `z-lab/Qwen3.5-4B-DFlash` y utilizando como datos de entrenamiento las propias salidas greedy del modelo objetivo de 1,23 GB. Posteriormente se empaqueta a 4 bits por peso mediante `pack_drafter.py`, un proceso que, segun la model card, no requiere datos de calibracion. El resultado es un artefacto de 464 MB en formato `opgraph-packed-1`, con un informe de error de empaquetado por matriz en `pack_report.json`.

La innovacion principal es la combinacion de decodificacion especulativa con verificacion en una sola pasada sobre los codigos trellis del modelo objetivo empaquetado, lo que permite comprobar las ocho posiciones (siete propuestas mas la del objetivo) de forma conjunta. Ademas, incorpora un mecanismo de fallback adaptativo autocalibrado que pausa el drafting cuando la tasa de aceptacion es baja, de modo que la prosa abierta no se ralentiza. La verificacion garantiza salida greedy identica bit a bit respecto a la inferencia sin drafter.

## Capacidades

- Aceleracion de decodificacion especulativa: propone siete tokens por pasada para el modelo objetivo Qwen3.5-4B empaquetado.
- Verificacion exacta: mantiene salida greedy identica bit a bit al modelo objetivo sin drafter.
- Fallback adaptativo: detecta contextos de baja aceptacion (prosa abierta) y pausa el drafting automaticamente.
- Integracion con el runtime LookAtMyQuant: CLI (`lamq generate`, `lamq chat`) y API de Python (`runtime_mlx.Runtime`).
- Streaming de tokens a traves de la API (`rt.stream`).
- Estadisticas de aceptacion en tiempo de ejecucion (`--stats`).
- No es un modelo de proposito general: no se documentan capacidades de razonamiento, codigo, vision, tool calling ni agentes por si mismo; hereda el comportamiento del modelo objetivo que acelera.

## Casos de uso

- Inferencia local interactiva en Apple Silicon: usar `lamq chat` con el drafter para duplicar aproximadamente la velocidad percibida en un Mac con chip M-series, manteniendo la misma calidad de salida que sin drafter.
- Generacion por lotes en portatiles Apple: procesar prompts con `lamq generate` y `--stats` para medir la tasa de aceptacion real y decidir si el drafting compensa en cada carga de trabajo.
- Desarrollo de aplicaciones con la API de Python: integrar `Runtime.load(..., drafter=...)` y `rt.stream(...)` en servicios locales que necesitan baja latencia sin GPU dedicada.
- Evaluacion de tecnicas de decodificacion especulativa: usar el par objetivo-drafter como referencia reproducible para comparar objetivos DSpine, tasas de aceptacion y aceleraciones en hardware de consumo.
- Tareas de matematicas paso a paso en local: los ejemplos de la model card (calculo de 17x23, sistemas de ecuaciones) ilustran el uso en prompts estructurados donde la aceptacion del drafter suele ser alta.
- Prototipado de asistentes de codigo en local: al mantener salida identica al objetivo, sirve para validar flujos de generacion de codigo en un Mac antes de desplegar en infraestructura con GPU.
- Benchmarking de empaquetado a 4 bits: el `pack_report.json` permite analizar el error de empaquetado por matriz y estudiar el impacto en la aceptacion del drafter.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card, medidos en un Apple M5 Max sobre 30 prompts de evaluacion:

| Metrica | Sin drafter | Con drafter |
|---|---|---|
| Tokens por segundo | 88 | 176 |
| Aceleracion | 1,0x | 1,5-2,0x |
| Tokens aceptados por comprobacion de 8 | no aplica | 4,35 de media |
| Fidelidad de salida | referencia | identica bit a bit (greedy) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con el runtime MLX LookAtMyQuant; no hay soporte documentado para CUDA, ROCm ni CPU x86.
- VRAM/memoria unificada: el drafter ocupa 464 MB empaquetados y el repositorio 0,5 GB; el modelo objetivo empaquetado ocupa 1,23 GB. La memoria total necesaria es la suma del objetivo, el drafter y el estado de inferencia (no cuantificado en la model card).
- GPU recomendadas: Apple M5 Max es el hardware de referencia de las mediciones (176 tokens/s con drafter); no se documentan resultados en otras variantes de chip.
- GPU de consumo: el modelo esta disenado para Mac con memoria unificada; no aplica a RTX 4090 ni similares por la dependencia de MLX.
- Despliegue: `pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`; CLI `lamq generate` y `lamq chat`; API `runtime_mlx.Runtime`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 176 tokens/s con drafter frente a 88 tokens/s sin drafter en Apple M5 Max, sobre 30 prompts de evaluacion.

## Comparativa con modelos similares

No se dispone de informacion sobre drafters alternativos comparables (mismo objetivo DSpine, mismo runtime o mismo modelo base) en la informacion proporcionada. La comparacion natural es el mismo modelo objetivo sin drafter:

| Configuracion | Pesos | Throughput (M5 Max) | Salida |
|---|---|---|---|
| Qwen3.5-4B-LookAtMyQuant-1.2GB sin drafter | 1,23 GB | 88 tokens/s | referencia |
| Qwen3.5-4B-LookAtMyQuant-1.2GB + este drafter | 1,23 GB + 464 MB | 176 tokens/s | identica bit a bit |

No disponible para el resto de alternativas (otros drafters, modelos de 4B cuantizados en otros runtimes).

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como drafter del modelo objetivo `shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB` en el runtime LookAtMyQuant; no puede usarse con vLLM, llama.cpp, Ollama ni transformers estandar.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no hay soporte documentado para GPU NVIDIA o AMD.
- Idioma: etiquetado solo para ingles; el rendimiento en otros idiomas no esta documentado.
- Licencia no disponible: no se especifica licencia, lo que impide confirmar condiciones de uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Tasa de aceptacion variable: la aceleracion de 1,5-2,0x se midio sobre 30 prompts; en prosa abierta el fallback adaptativo pausa el drafting y la ganancia puede reducirse o desaparecer.
- Sesgos y alucinacion: al replicar la salida del modelo objetivo, hereda sus sesgos y riesgos de alucinacion; la model card no documenta evaluaciones de seguridad.
- Contexto maximo no documentado: no se indica la longitud de contexto soportada por el drafter ni por el objetivo empaquetado.
- Madurez: repositorio con 87 descargas y 0 likes, creado en noviembre de 2026; ecosistema joven y con poca validacion externa.
- Dependencia de codigo personalizado: requiere `custom_code` y el paquete `lookatmyquant` instalado desde Git, lo que anade superficie de mantenimiento y de seguridad de la cadena de suministro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB-drafter
- Modelo objetivo: https://huggingface.co/shinmegamiboson/Qwen3.5-4B-LookAtMyQuant-1.2GB
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Documentacion del proyecto: https://lookatmyquant.com/2/
- SpecForge (objetivo DSpine): https://github.com/sgl-project/SpecForge
