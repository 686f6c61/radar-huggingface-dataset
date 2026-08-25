# AMAImedia/NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-BF16

## Resumen

NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-BF16 es un modelo de lenguaje de 4,2B parametros desarrollado por AMAImedia como componente central de la plataforma NOESIS Professional Multilingual Dubbing Automation (framework DHCF-FNO, Deterministic Hybrid Control Framework for Frozen Neural Operators). Se trata de un ajuste fino del modelo base Qwopus3.5-4B-v3 (derivado de Qwen3.5) mediante una LoRA de contexto largo fusionada en precision BF16, orientado especificamente a tareas de supervision de pipelines de doblaje multilingue: control de calidad multi-segmento, planificacion de orquestacion, revision entre etapas y seleccion best-of-N por lotes.

El modelo resuelve el problema de la supervision determinista y con restricciones gramaticales en flujos de produccion de doblaje automatizado, donde un supervisor debe decidir entre aceptar, rechazar o reintentar segmentos traducidos. Su relevancia radica en que, segun las pruebas del autor, consigue 11/12 aciertos en la evaluacion de supervision de 12 tests, frente a 5/12 del modelo base sin LoRA, sin sacrificar capacidad de traduccion (paridad con el base y a solo ~2 puntos chrF++ del traductor dedicado de 9B). El modelo se distribuye en BF16 como formato primario, con hermanos en NF4 (6 GB de uso en runtime) y GGUF Q8_0 para portatiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5, variante texto) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (designado "LongCtx"; LoRA entrenada con max_len 768) |
| Tipos de cuantizacion | BF16 (primario), NF4, Q8_0 (GGUF), IQ2_XXS (no recomendado) |
| Idiomas soportados | 201 idiomas y dialectos (cobertura oficial Qwen3.5; lista exhaustiva de 119 publicada por Qwen3) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16 y NF4), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de la base NOESIS-Qwopus3.5-4B-v3, un ajuste fino de Qwen3.5 de 4,2B parametros con arquitectura transformer densa. Sobre esa base se entreno una LoRA denominada `nt346_longctx_qwopus4b` con restriccion de contexto extendido (CCE, max_len 768) y enmascaramiento de completado, fusionandose posteriormente en el modelo final en precision BF16. El entrenamiento de la LoRA se realizo sobre una base cuantizada a NF4 y el resultado se fusiono en BF16, que es el formato primario de distribucion.

El proceso de entrenamiento esta orientado a la supervision de pipelines de doblaje: el modelo debe evaluar segmentos de traduccion (truncamientos, cambios de velocidad, errores de sincronizacion) y emitir decisiones de aceptacion, rechazo o reintento, con salidas restringidas por gramatica en la evaluacion. El autor publica el notebook de entrenamiento completo y una guia en PDF para reproducir el proceso, apoyandose en la libreria Unsloth.

## Capacidades

- Supervision de calidad multi-segmento en pipelines de doblaje: decide entre `accept`, `reject` y `retry` para segmentos traducidos, con salida restringida por gramatica.
- Orquestacion de etapas cruzadas: revision de planes de orquestacion y coordinacion entre fases del pipeline.
- Seleccion best-of-N por lotes: evaluacion y ranking de multiples candidatos de traduccion.
- Traduccion multilingue: soporta 201 idiomas y dialectos (segun cobertura oficial Qwen3.5), con resultados evaluados en FLORES devtest para pares eng→rus y eng→cmn.
- Razonamiento multilingue: hereda las capacidades de razonamiento del base Qwopus3.5-v3, que mejora la estabilidad del razonamiento y la generalizacion entre tareas.
- Inferencia eficiente: 53,5 tok/s de generacion y 366 tok/s de prompt eval en una RTX 3060 Laptop 6GB con cuantizacion Q8_0.
- Uso en produccion: disenado como componente supervisor dentro de la plataforma NOESIS v16.1, no como modelo conversacional generalista.

## Casos de uso

- Control de calidad automatizado en doblaje: el modelo revisa segmentos de traduccion generados por otros modelos y decide si se aceptan, se rechazan o se reintentan, con una tasa de acierto de 11/12 en la evaluacion de supervisor.
- Orquestacion de pipelines de traduccion multilingue: planifica y supervisa el flujo entre etapas (traduccion, sincronizacion, post-procesado) para producciones audiovisuales en mas de 200 idiomas.
- Seleccion de mejores candidatos (best-of-N): dado un lote de N traducciones generadas para un segmento, el modelo elige la mejor opcion segun criterios de fidelidad y sincronia.
- Traduccion de subtitulos y doblaje a gran escala: traduccion directa eng→rus y eng→cmn con calidad evaluada en FLORES (chrF++ 51,5 y 32,0 respectivamente), integrable en plataformas de localizacion.
- Validacion de planes de produccion: revision de planes de orquestacion completos para detectar inconsistencias antes de la ejecucion del pipeline.
- Despliegue en entornos con recursos limitados: gracias a las variantes Q8_0 (4,17 GB) y NF4 (6 GB de runtime), puede ejecutarse en portatiles con GPU de 6 GB o incluso en CPU, manteniendo 53,5 tok/s de generacion en GPU.

## Benchmarks y rendimiento

Evaluacion de supervisor (eval_longctx_supervisor_v1.py, 12 tests con restriccion de gramatica):

| Cuantizacion | Tamano | Puntuacion |
|---|---|---|
| Q8_0 | 4,17 GB | 11/12 |
| IQ2_XXS | 1,43 GB | 8/12 (no recomendado; falla en escalado con vocabulario de 248K) |

Traduccion (FLORES devtest, chrF++/BLEU, n=20, sin modo think):

| Direccion | chrF++ | BLEU |
|---|---|---|
| eng→rus | 51,5 | 25,6 |
| eng→cmn | 32,0 | 7,4 |
| Promedio | 41,7 | 16,5 |

Comparativa con modelos dedicados (misma evaluacion FLORES n=20):

| Modelo | Supervisor-12 | Traduccion AVG chrF++/BLEU |
|---|---|---|
| Este modelo (4B-LongCtx) | 11/12 | 41,7 / 16,5 |
| Base 4B (sin LoRA) | 5/12 | 42,4 / 15,4 |
| Qwopus3.5-9B-Translate Q4 | 5/12 | 43,8 / 16,5 |

Velocidad medida en RTX 3060 Laptop 6GB (33/33 capas descargadas, Q8_0): generacion 53,5 tok/s, prompt eval 366 tok/s. El modelo 9B-Translate Q4 de comparacion alcanza 49,1 tok/s de generacion y 307 tok/s de eval.

## Requisitos de hardware

- VRAM estimada: 6 GB para la variante NF4 (runtime completo), 4,17 GB para la variante Q8_0 en GGUF.
- GPU recomendadas: RTX 3060 Laptop 6GB validada (33/33 capas descargadas); cualquier GPU con 6GB o mas de VRAM es suficiente. Para BF16 completo se recomienda al menos 12GB de VRAM.
- Consumer GPU: si, cabe en GPUs de 6GB (RTX 3060, RTX 2060, etc.) con cuantizacion Q8_0 o NF4.
- Opciones de despliegue: llama.cpp con `llama-completion.exe -ngl 99` para uso GPU (el pip de llama_cpp es solo CPU), GGUF para Ollama y otros runtime compatibles con GGUF, safetensors para vLLM o TGI si se desea servir con mayor throughput.
- Latencia y throughput: 53,5 tok/s de generacion y 366 tok/s de prompt eval en la configuracion Q8_0 sobre RTX 3060 Laptop 6GB.

## Comparativa con modelos similares

| Modelo | Parametros | Supervisor-12 | Traduccion AVG chrF++/BLEU | Velocidad (tok/s) |
|---|---|---|---|---|
| NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-BF16 | 4,2B | 11/12 | 41,7 / 16,5 | 53,5 (Q8_0, RTX 3060) |
| NOESIS-Qwopus3.5-4B-v3 (base, sin LoRA) | 4,2B | 5/12 | 42,4 / 15,4 | no disponible |
| Qwopus3.5-9B-Translate Q4 | 9B | 5/12 | 43,8 / 16,5 | 49,1 (Q4, RTX 3060) |

El modelo LongCtx supera ampliamente al base en supervision (+6 puntos sobre 12) manteniendo paridad en traduccion, y se acerca a ~2 puntos chrF del traductor dedicado de 9B con menos de la mitad de parametros y mayor velocidad de generacion. La licencia de los modelos Qwopus3.5 no se ha publicado en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion IQ2_XXS (1,43 GB) degrada significativamente el rendimiento (8/12) y se desaconseja por el autor: falla en el escalado de decisiones con vocabulario de 248K.
- La lista de idiomas publicada en la model card es la de Qwen3 (119 idiomas), mientras que Qwen3.5 declara 201 sin enumerar; la cobertura real de 201 idiomas no esta verificada de forma exhaustiva.
- El modelo esta especializado en supervision de doblaje y traduccion; no es un chat generalista ni un asistente conversacional, por lo que su uso fuera de ese dominio puede producir resultados pobres.
- La licencia no esta publicada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido.
- El modelo hereda los sesgos potenciales del corpus de Qwen3.5 y del ajuste fino Qwopus3.5, no documentados en esta ficha.
- Riesgo de alucinacion en decisiones de supervision cuando el contexto supera los limites del entrenamiento LoRA (max_len 768), a pesar de la designacion "LongCtx".
- Los benchmarks publicados son del autor (2026-06-17) con n=20 para FLORES, una muestra pequena; los resultados no estan replicados de forma independiente.
- El repositorio pesa 8,4 GB, lo que incluye las variantes BF16 y NF4; la descarga completa es pesada para entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-BF16
- Variante NF4: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-4B-v3-Supervisor-LongCtx-NF4
- Base Qwopus3.5-4B-v3 en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwopus3.5-4B-v3
- Guia de fine-tuning de Qwopus3.5 en GitHub: repositorio Jackrong-llm-finetuning-guide (referenciado en la model card)
- Referencia de Qwopus3.5 en Ollama: https://ollama.com/fredrezones55/Qwopus3.5
