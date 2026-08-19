# AnosVoldigoad11/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled

## Resumen

Qwen3.8-27B-Claude-Opus-Reasoning-Distilled es un ajuste fino LoRA del modelo base Qwen/Qwen3.8-27B, desarrollado por AnosVoldigoad11, que destila las trazas de razonamiento extendido de Claude Opus 4.6 y 4.7 sobre un modelo abierto denso de 27B. El objetivo es transferir el estilo de cadena de pensamiento estructurada y profunda de Opus a un modelo de pesos abiertos que se puede ejecutar y ajustar localmente. El adaptador entrena 233 millones de parámetros (0,85 % del total) mediante QLoRA con Unsloth, dejando el torre de visión congelada y centrándose únicamente en la vía de razonamiento textual.

El modelo base Qwen3.8-27B es un LLM denso nativo multimodal de Alibaba con atención híbrida (16/64 capas de atención completa y 48/64 capas de atención lineal Gated DeltaNet), cabezal de predicción multi-token (MTP) y una ventana de contexto de 262 000 tokens. Este fine-tune se publica bajo licencia Apache 2.0 y está pensado para desarrolladores que quieran un estilo de razonamiento tipo Opus en un modelo abierto, aunque el autor advierte explícitamente que se trata de una ejecución de validación de pipeline, no de un modelo completamente convergido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (full attention + Gated DeltaNet lineal), cabezal MTP |
| Parametros totales | 27,6 mil millones (base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Parametros entrenables | 233 455 616 (0,85 % del total, via LoRA r=32, alpha=32) |
| Longitud de contexto | 262 144 tokens (base); entrenamiento del adaptador con secuencias de 8192 |
| Tipos de cuantizacion | GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M (publicados por rico03); base en 4-bit QLoRA durante el entrenamiento |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adapter LoRA en formato PEFT (safetensors); versiones GGUF disponibles por separado |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: 16 de las 64 capas usan atención completa (full attention) y las 48 restantes usan Gated DeltaNet, una variante de atención lineal que reduce el coste computacional en contextos largos. Incluye además un cabezal de predicción multi-token (MTP) que permite decodificación especulativa. El fine-tune aplica LoRA (r=32, alpha=32) sobre las capas de atención (ambos tipos) y las capas MLP, dejando congelada la torre de visión, que no se utiliza en este adaptador.

El entrenamiento se realizó con Unsloth sobre una única NVIDIA H100 NVL de 95 GB, con base en 4-bit QLoRA, máscara de pérdida solo sobre turnos de asistente (`train_on_responses_only`) y una secuencia de 8192 tokens. Se ejecutaron 150 pasos (0,126 épocas, aproximadamente 2700 de los 21 490 ejemplos del dataset), con una pérdida final media de 0,728 y un tiempo total de 53 minutos. El dataset combina tres fuentes: 8124 ejemplos de trazas de pensamiento extendido genuinas de Claude Opus 4.7 (lordx64), y dos conjuntos de "inversión de traza" (4800 de Opus 4.7 y 8700 de Opus 4.6) donde la respuesta final es auténtica pero el razonamiento fue reconstruido a posteriori por un modelo más pequeño. El autor advierte que aproximadamente el 62 % de los datos tiene trazas reconstruidas, no el pensamiento real de Opus.

## Capacidades

- Generacion de texto y razonamiento estructurado tipo cadena de pensamiento, inspirado en el estilo de Claude Opus 4.6/4.7.
- Razonamiento multi-paso y resolución de problemas complejos, heredado del modelo base Qwen3.8-27B.
- Generacion de codigo y tareas agénticas: el modelo base destaca en benchmarks de codificación agéntica (Terminal-Bench, SWE-bench, LiveCodeBench).
- Capacidades multimodales de vision del modelo base, aunque el adaptador no entrena la torre de visión y se centra solo en texto.
- Soporte de decodificacion especulativa mediante el cabezal MTP del modelo base, con versiones GGUF verificadas.
- Multilingüismo limitado: la model card declara únicamente inglés; el modelo base de Qwen soporta más idiomas, pero el adaptador no lo especifica.

## Casos de uso

- Asistente de razonamiento para investigación: el modelo puede generar cadenas de pensamiento detalladas y estructuradas, útiles para explorar problemas científicos o matemáticos paso a paso, aprovechando el estilo destilado de Opus.
- Generación de código con explicación: gracias a la base Qwen3.8-27B y al estilo de razonamiento, puede producir código comentado y justificado, adecuado para entornos de desarrollo donde se requiere trazabilidad de las decisiones.
- Automatización de tareas ofimáticas de largo recorrido: el modelo base rinde bien en CoWorkBench (tareas de oficina de horizonte largo), por lo que el adaptador puede usarse en flujos que requieran planificación multi-paso.
- Prototipado de agentes conversacionales: con soporte de tool calling del modelo base y razonamiento estructurado, puede integrarse en pipelines de agentes que necesiten explicar sus acciones.
- Evaluación de técnicas de destilación: este adaptador sirve como caso de estudio para comparar trazas de razonamiento genuinas frente a reconstruidas, útil para investigadores que trabajan en destilación de modelos.
- Despliegue local en hardware de consumo: las versiones GGUF Q4_K_M permiten ejecutar el modelo en GPUs de 24 GB, ideal para desarrolladores que quieran un modelo de razonamiento local sin depender de APIs propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tune concreto. El autor incluye en la model card los benchmarks oficiales del modelo base Qwen3.8-27B (no del adaptador), que se reproducen a continuación como referencia:

| Benchmark | Qwen3.8-27B (base) | Qwen3.6-27B | Qwen3.7-Plus |
|---|---:|---:|---:|
| Terminal-Bench 2.1 (codificacion agéntica) | 73,0 | 63,4 | 64,0 |
| SWE-bench Pro | 61,7 | 53,5 | 57,6 |
| QwenSWEBench | 79,0 | 49,3 | 59,2 |
| CoWorkBench (trabajo ofimático largo) | 70,7 | 61,0 | 65,1 |
| IFBench (seguimiento de instrucciones) | 79,5 | 69,1 | 79,1 |
| GPQA Diamond (razonamiento cientifico) | 89,2 | 87,8 | 90,3 |
| HLE (razonamiento multidisciplinar) | 30,8 | 24,0 | 34,7 |
| LiveCodeBench v6 | 90,3 | 83,9 | 89,6 |

El adaptador no ha sido re-evaluado de forma independiente; los datos anteriores corresponden exclusivamente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 27,6 mil millones de parámetros. En FP16 necesitaría aproximadamente 55 GB; con cuantización GGUF Q8_0 unos 28 GB, Q6_K unos 22 GB, Q5_K_M unos 19 GB y Q4_K_M unos 15 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo, no mediciones oficiales.
- GPU recomendadas: para Q4_K_M cabe en una RTX 4090 (24 GB) o similar; para Q8_0 se necesita una GPU de 32 GB o más (A6000, A100 40 GB, H100). El entrenamiento se realizó en una H100 NVL de 95 GB.
- Opciones de despliegue: llama.cpp y Ollama para las versiones GGUF; vLLM o TGI para el modelo base en FP16/BF16; el adaptador PEFT puede cargarse con transformers y peft.
- Latencia y throughput: no disponibles. El cabezal MTP del modelo base permite decodificación especulativa, lo que puede mejorar el throughput, pero no hay cifras publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Claude-Opus-Reasoning-Distilled | 27,6B (adaptador 233M) | 262K (base) | Apache 2.0 | Fine-tune LoRA de razonamiento destilado de Opus; no convergido |
| Qwen3.8-27B (base) | 27,6B | 262K | Apache 2.0 | Modelo original de Alibaba, multimodal, con benchmarks oficiales |
| Qwen3.6-27B | 27B (estimado) | no disponible | Apache 2.0 | Versión anterior de Qwen, superada por la 3.8 en la mayoría de benchmarks |
| Qwen3.7-Plus | no disponible | no disponible | Propietaria | Modelo de pago de Alibaba, comparable en rendimiento pero cerrado |

La comparación se basa en los datos de la model card del autor. No se dispone de información sobre otros modelos destilados de Claude con los que comparar directamente.

## Limitaciones y advertencias

- El autor declara explícitamente que este adaptador es una ejecución de validación de pipeline, no un modelo completamente convergido: solo se entrenaron 150 pasos (12,6 % de una época) y el programa de coseno se calibró para esa duración, por lo que no puede reanudarse el entrenamiento directamente.
- Aproximadamente el 62 % del dataset de entrenamiento contiene trazas de razonamiento reconstruidas a posteriori por un modelo de "inversión de traza", no el pensamiento real de Claude Opus. El estilo de razonamiento es una aproximación plausible, no un reflejo fiel.
- No se han publicado benchmarks independientes del adaptador; el rendimiento real puede diferir del modelo base.
- Solo se declara soporte para inglés; no hay garantías de rendimiento en otros idiomas.
- Riesgo de alucinación y sesgos heredados del modelo base y de los datos de destilación, no evaluados específicamente para este adaptador.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte para producción.
- Las versiones GGUF publicadas por rico03 son un repositorio separado; se recomienda verificar su procedencia antes de usarlas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/AnosVoldigoad11/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled
- Versiones GGUF cuantizadas: https://huggingface.co/rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Dataset lordx64/reasoning-distill-claude-opus-4-7-max: https://huggingface.co/datasets/lordx64/reasoning-distill-claude-opus-4-7-max
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Articulo comparativo de explainx.ai: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Repositorio de instalacion local: https://github.com/qwen3-8-27b/qwen3-8-27b
