# PollardWeights/Qwen3-ASR-1.7B-Pollard

## Resumen

Qwen3-ASR-1.7B-Pollard es una familia de cuantizaciones del modelo Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba y redistribuido por PollardWeights. El modelo base es un transformer especializado en reconocimiento automatico del habla (ASR) que acepta entradas de texto y audio y produce transcripciones, con unas 2.031 millones de parametros segun los pesos en safetensors. PollardWeights aplica una asignacion de bits medida por sensibilidad de capa (measured-allocation) en lugar de una compresion uniforme, generando una escalera de variantes GGUF y MLX que van desde 1,01 GB hasta 2,47 GB.

La relevancia actual del artefacto esta en que reduce el modelo f16 original de 4,70 GB a 1,01 GB en su variante IQ2_S, un 79% menos, manteniendo el formato GGUF estandar que funciona en llama.cpp, ik_llama.cpp, Ollama, LM Studio, koboldcpp, Jan y ramalama, ademas de checkpoints MLX nativos para Apple Silicon. Esto permite ejecutar un modelo ASR en hardware de consumo con presupuestos de RAM/VRAM de entre 3,0 y 3,7 GB.

La licencia Apache 2.0 del modelo base se mantiene en esta redistribucion, lo que facilita el uso comercial. El repositorio incluye verificacion por variante (carga, coherencia, checks de runtime) y mediciones de perplexity, KLD medio y acuerdo top-1 frente al f16, lo que aporta trazabilidad sobre la perdida de fidelidad de cada escalon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_asr` (transformer, segun el identificador de arquitectura del modelo base) |
| Parametros totales | 2.031.739.904 (pesos safetensors); la model card indica "~2.3B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_S, IQ3_S, IQ4_XS, Q6_K (y referencia Q8_0, Q4_K_M, f16); MLX: 2bit, 3bit, 4bit, 5bit, 6bit, 8bit |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (raiz del repo) y safetensors/MLX (carpetas `MLX/`) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_asr`, un transformer del linaje Qwen3 adaptado a reconocimiento automatico del habla, con soporte de entrada de texto y audio. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica destacable de esta redistribucion es el proceso de cuantizacion de PollardWeights: la asignacion de bits se realiza por sensibilidad medida de cada capa en lugar de aplicar una tasa uniforme, y las variantes GGUF se construyen con matriz de importancia (imatrix). Cada variante pasa por `pollard-verify --gate`, que comprueba que el checkpoint esta completo (cada torre, proyector y fichero de procesador del origen), que carga y que supera checks de coherencia y runtime. Se publican metricas de perplexity, KLD medio y acuerdo top-1 frente al f16 para cada escalon GGUF.

## Capacidades

- Reconocimiento automatico del habla (ASR): el pipeline declarado es `automatic-speech-recognition` y el modelo acepta entradas de audio y texto.
- Generacion de texto: la model card muestra ejemplos de prompt textual (`llama-cli ... -p "Explain why the sky is blue."`), por lo que el modelo tambien responde a entradas de solo texto.
- Conversacional: la etiqueta `conversational` figura entre los tags del repositorio.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante APIs compatibles con OpenAI, Anthropic o Responses a traves de llama-server.
- Integracion con harnesses de agentes: la model card documenta uso con Oh My Pi, Claude Code, Codex CLI, OpenCode, Cline/Roo Code y Aider mediante llama-server.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- No se documentan en la informacion disponible capacidades de vision, audio generativo, tool calling nativo ni modo thinking.

## Casos de uso

- Transcripcion de audio en local: el modelo acepta audio como entrada y produce transcripcion; con la variante IQ2_S (1,01 GB) se puede ejecutar en maquinas con unos 3,0 GB de RAM/VRAM, lo que lo hace adecuado para portatiles y equipos sin GPU dedicada.
- Subtitulado y actas de reuniones: al ser un modelo ASR pequeno y empaquetado en GGUF, puede desplegarse en un servidor llama-server local y procesar lotes de audio por lotes sin depender de APIs externas.
- Procesamiento por privacidad de datos: al ejecutarse totalmente en local con llama.cpp u Ollama, permite transcribir audio sensible sin enviarlo a servicios en la nube.
- Despliegue en Apple Silicon: las variantes MLX (`MLX/2bit` a `MLX/8bit`) permiten servir el modelo con `mlx_lm.server` en Macs con chip Apple, con tamanos desde 1,47 GB (2bit) hasta 2,47 GB (8bit).
- Integracion en pipelines de agentes: mediante `pollard serve` o llama-server, el modelo se expone como endpoint compatible con OpenAI/Anthropic y puede conectarse a harnesses como Claude Code, Codex CLI o Aider; util para prototipar flujos que combinan transcripcion y razonamiento sobre texto.
- Prototipado y evaluacion de cuantizaciones: la escalera de variantes con perplexity, KLD medio y acuerdo top-1 publicados permite comparar el compromiso tamano/fidelidad antes de fijar una variante para produccion.
- Educacion e investigacion en ASR de bajo coste: al caber en GPUs de consumo con 3-4 GB de VRAM, sirve para experimentos academicos y demos docentes sin infraestructura dedicada.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar tipo MMLU, HumanEval o GSM8K. Publica metricas internas de fidelidad de cuantizacion frente al f16:

| Variante GGUF | PPL | Tamano | KLD medio | Acuerdo top-1 | Verificada |
|---|---:|---:|---:|---:|---|
| IQ2_S | 7,4685 | 1,01 GB | 0,2996 | 75,54% | si |
| IQ3_S | 6,8277 | 1,11 GB | 0,2121 | 79,12% | si |
| IQ4_XS | 5,9772 | 1,28 GB | 0,057 | 88,34% | si |
| Q6_K | 5,7427 | 1,67 GB | 0,0174 | 92,97% | si |

Variantes MLX (sin PPL ni KLD publicados):

| Carpeta | Tamano | Bits medios | Verificada |
|---|---:|---:|---|
| `MLX/8bit/` | 2,47 GB | 8,0 | si |
| `MLX/6bit/` | 2,24 GB | 6,71 | si |
| `MLX/5bit/` | 2,13 GB | 6,07 | si |
| `MLX/4bit/` | 2,01 GB | 5,43 | si |
| `MLX/3bit/` | 1,70 GB | 4,07 | si |
| `MLX/2bit/` | 1,47 GB | 2,71 | si |

No se han publicado resultados de benchmarks de calidad ASR (WER/CER) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun la model card: Q6_K unos 3,7 GB; IQ4_XS unos 3,3 GB; IQ3_S unos 3,1 GB; IQ2_S unos 3,0 GB.
- Tamano en disco de los pesos: 1,01 GB (IQ2_S), 1,11 GB (IQ3_S), 1,28 GB (IQ4_XS), 1,67 GB (Q6_K); MLX de 1,47 GB (2bit) a 2,47 GB (8bit).
- Cabe en GPU de consumo: si, con las variantes IQ2_S a Q6_K en GPUs con 4 GB o mas de VRAM; no se especifican modelos concretos de GPU (RTX 4090, A100, H100) en la informacion disponible.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), ik_llama.cpp, Ollama (`ollama run hf.co/PollardWeights/Qwen3-ASR-1.7B-Pollard`), LM Studio, koboldcpp, Jan, ramalama, y MLX (`mlx_lm.server`) en Apple Silicon. Tambien `pollard serve` para configurar harnesses de agentes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos ASR alternativos, por lo que no es posible establecer una comparativa cuantitativa fiable. Se indica "no disponible" para benchmarks de calidad ASR de modelos comparables. Como referencia estructural, esta redistribucion se puede contrastar con su propio modelo base Qwen/Qwen3-ASR-1.7B (mismos pesos sin cuantizar, f16 de 4,70 GB, licencia Apache 2.0), del que esta familia es una version comprimida con perdida de fidelidad medible.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles (`language: en`); el rendimiento en castellano u otros idiomas no esta documentado.
- Perdida de fidelidad en las variantes pequenas: IQ2_S presenta KLD medio de 0,2996 y acuerdo top-1 del 75,54% frente al f16, lo que implica divergencias notables en la distribucion de tokens; IQ3_S (79,12%) sigue por debajo de IQ4_XS (88,34%) y Q6_K (92,97%).
- Riesgo de alucinacion: no se documenta en la informacion disponible; en tareas ASR, cualquier modelo puede producir transcripciones inexactas, especialmente en audio ruidoso o con acentos no representados en el entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Contexto: la longitud de contexto no esta especificada; los harnesses listados exigen minimos de 16k a 64k tokens, pero no se confirma que el modelo los soporte.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3-ASR-1.7B y atribuir correctamente tanto al autor original como al cuantizador.
- Verificacion: las variantes estan marcadas como verificadas por `pollard-verify --gate`, pero la propia model card advierte que los numeros "below band" se reportan sin bloquear la publicacion, por lo que la etiqueta de verificacion no garantiza fidelidad uniforme.
- Uso en produccion: al ser una cuantizacion con perdida, conviene validar la variante elegida con audio real del dominio de aplicacion antes de desplegarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PollardWeights/Qwen3-ASR-1.7B-Pollard
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de Pollard Weights: https://github.com/WestWaters/pollard-weights
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs o demos.
