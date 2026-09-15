# joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-xe-ss-chat

## Resumen

El modelo `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-xe-ss-chat` es un artefacto de investigación derivado de Llama 3.1 8B, publicado por el usuario joshycodes como parte de un proyecto de Anthropic Fellows sobre entrenamiento de carácter guiado por el marco de "flourishing" (propuesta de Wang y Jermyn, 2026-04-22). No es un modelo de propósito general: la propia model card lo describe como "private research artifact — do not redistribute" y lo publica bajo licencia `internal-research`.

Técnicamente es un transformer denso de 8.030.261.248 parámetros (8,03B), resultado de una cadena de dos etapas: un `continued-pretraining` previo que produce el checkpoint intermedio `meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`, y un ajuste posterior de tipo chat (SFT) de tan solo 2.372.235 tokens vistos en 1 época sobre el dataset local `sampled-sorrel-5k.jsonl`. El repositorio ocupa 16,1 GB y almacena pesos en safetensors.

Su relevancia es acotada y experimental: sirve para estudiar cómo un ajuste muy corto (del orden de nueve pasos de optimizador) modifica el comportamiento de un checkpoint intermedio dentro de un pipeline de entrenamiento por etapas. No cuenta con descargas, ni "likes", ni resultados de benchmarks publicados, ni idiomas declarados en la ficha, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Llama 3.1, según la documentación pública de Meta; no confirmado en la model card) |
| Parámetros totales | 8.030.261.248 (8,03B), dato real de los pesos safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card. La familia Llama 3.1 8B soporta 131.072 tokens según Meta; el `seq_len` de entrenamiento de esta etapa fue de 4096 |
| Tipos de cuantización | No disponible. El repo solo publica safetensors; con 16,1 GB de peso para 8,03B parámetros, los pesos están en fp16/bf16 (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la ficha. Heredados de Llama 3.1 según Meta (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), sin verificación posterior al ajuste |
| Licencia | `other`, con `license_name: internal-research`. Artefacto privado de investigación, no redistribuible. Sujeto además a las obligaciones de la licencia base de Llama 3.1 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B: transformer denso decoder-only con RoPE, normalización RMSNorm y atención con consultas agrupadas (GQA). Esa descripción procede de la documentación pública de Meta para la familia Llama 3.1, ya que la model card de este repositorio no detalla capas, cabezas, vocabulario ni dimensión oculta. Sí especifica el pipeline de entrenamiento en dos saltos: `continued-pretraining` sobre el modelo base, que genera el checkpoint `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain` (revisión `754720c4fbb6`), y después una etapa `chat`.

La etapa chat es deliberadamente corta. Se ejecutó con `lr = 1e-05`, `seq_len = 4096`, `micro_batch = 8`, `grad_accum = 8` y `epochs = 1.0` sobre `local:sampled-sorrel-5k.jsonl` (configuración `sampled-sorrel-5k`), con semilla 20260821 y el commit `a0afb77669ae` del repositorio `flourishing-training`. Esto supone un lote efectivo de 262.144 tokens por paso de optimizador, de modo que los 2.372.235 tokens vistos equivalen a unos nueve pasos de actualización. La pérdida pasó de 0,9594 a 0,9549, una variación absoluta de 0,0045, coherente con un ajuste muy superficial. El entrenamiento se realizó en una única GPU NVIDIA H200 en RunPod.

## Capacidades

- Generación de texto conversacional: la etapa final es un ajuste de tipo chat sobre un dataset de 5.000 muestras (`sampled-sorrel-5k`), orientado a respuestas en formato de diálogo.
- Ajuste de carácter y estilo: el objetivo declarado del proyecto es el entrenamiento de carácter enmarcado en "flourishing", por lo que se espera un sesgo de tono y estilo respecto al checkpoint intermedio.
- Razonamiento y conocimiento general: heredados de Llama 3.1 8B y del `continued-pretraining` previo; no hay evaluación publicada que cuantifique su conservación.
- Capacidades multilingües: presumiblemente heredadas de Llama 3.1, pero no declaradas ni verificadas para este artefacto.
- Tool calling / function calling: no disponible; la model card no menciona plantillas de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún entrenamiento específico para ello.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; no hay indicios en la ficha ni en los tags.
- Evaluación integrada: el repositorio referencia un script propio (`uv run eval.py --model ... --eval all`) para generar métricas internas, pero no publica sus resultados.

## Casos de uso

- Investigación en alineación y entrenamiento de carácter: el artefacto existe para estudiar cómo se modifica el comportamiento de un modelo cuando se le somete a un ajuste breve con un marco de valores concreto, comparando contra el checkpoint `midtrain`.
- Análisis del efecto de un SFT muy corto: con unos nueve pasos de optimizador y una pérdida que apenas baja 0,0045, resulta útil para medir cuánto cambia un modelo con un ajuste mínimo frente a uno prolongado.
- Reproducción de experimentos internos: la ficha aporta semilla (20260821), commit del launcher (`a0afb77669ae`), revisiones y configuración de entrenamiento, lo que permite replicar la ejecución dentro del mismo entorno de investigación.
- Generación de diálogo sintético para anotación: el modelo puede producir respuestas conversacionales que después se etiquetan o se comparan con salidas de otras ramas del pipeline.
- Comparación de ramas dentro de un pipeline de continued pretraining: sirve como punto de control para medir deriva entre el checkpoint intermedio y el ajustado en chat.
- Evaluación automática interna: integrable en el flujo `eval.py --eval all` del repositorio `flourishing-training` como modelo candidato frente a otros checkpoints.
- Docencia y experimentación académica sobre SFT: al ser un modelo pequeño (8B) y con hiperparámetros explícitos, es adecuado para prácticas de ajuste supervisado en entornos con una sola GPU de gama alta.

Ninguno de estos casos contempla uso comercial: la licencia `internal-research` lo impide.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos publicados corresponden al propio entrenamiento:

| Métrica | Valor |
|---|---|
| Tokens vistos (etapa chat) | 2.372.235 |
| Épocas | 1.0 |
| Pérdida inicial | 0,9594 |
| Pérdida final | 0,9549 |
| Pasos de optimizador estimados | ~9 (derivado de 2.372.235 / 262.144 tokens por paso) |

No hay MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación publicada.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 16 GB solo para los pesos (8,03B × 2 bytes), más el caché KV. Con contexto de 4K y lote pequeño, el consumo total se sitúa aproximadamente entre 18 y 22 GB; con contexto de 128K el caché KV crece de forma considerable.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos. Requiere conversión propia, porque el repositorio no publica GGUF ni formatos pre-cuantizados.
- GPU recomendadas: NVIDIA H200 (la usada por el autor), H100, A100 40/80 GB para bf16 sin restricciones de contexto; RTX 4090 o RTX 3090 (24 GB) permiten bf16 con contexto moderado, y cuantizado en 4 bits cabe en GPUs de 8-12 GB.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM o TGI para servicio con batching, llama.cpp u Ollama previa conversión a GGUF. No hay ficheros de despliegue publicados en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus respectivas fichas y documentación públicas; para este modelo no existen métricas de calidad comparables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-atomic-f-300m-xe-ss-chat | 8,03B | No disponible (Llama 3.1 8B: 131.072 tokens) | `other` / `internal-research` | 0 descargas, artefacto privado | No disponible |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 131.072 tokens | Llama 3.1 Community License | Público, ampliamente distribuido | No comparable (sin benchmarks en este artefacto) |
| Qwen2.5 7B Instruct (Alibaba) | ~7,6B | 131.072 tokens | Apache 2.0 | Público | No comparable |
| Gemma 2 9B Instruct (Google) | ~9,2B | 8.192 tokens | Gemma Terms of Use | Público | No comparable |

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research` con la indicación explícita "do not redistribute". No está permitido el uso comercial ni la redistribución de pesos o derivados según la propia model card; además siguen aplicando las condiciones de la licencia base de Llama 3.1.
- Sin datos de evaluación: no hay benchmarks, ni evaluación de seguridad, ni verificación de capacidades tras el ajuste.
- Ajuste muy superficial: la pérdida apenas varía (0,9594 → 0,9549) en unos nueve pasos de optimizador, por lo que el comportamiento esperable es muy próximo al del checkpoint `midtrain`, con cambios de estilo limitados.
- Dataset no público: `local:sampled-sorrel-5k.jsonl` es un fichero local del autor; sin acceso a él, la reproducibilidad externa es nula, incluso disponiendo de la semilla y el commit.
- Idiomas no declarados: la ficha no especifica idiomas soportados y no se ha verificado el multilingüismo tras el ajuste.
- Riesgo de alucinación: inherente a un modelo de 8B sin capa de verificación factual ni evaluación publicada; el ajuste breve no aporta mecanismos de mitigación.
- Sesgos: no se documenta ninguna evaluación de sesgos. El enfoque de entrenamiento de carácter basado en "flourishing" puede introducir un sesgo deliberado de tono, valores y estilo en las respuestas que no ha sido auditado externamente.
- Estado del repositorio: cero descargas, cero "likes", sin pipeline declarado y sin ficheros de cuantización, lo que indica un artefacto de uso interno más que una publicación mantenida.
- Sin garantías de soporte: no hay documentación de inferencia, plantilla de chat publicada ni instrucciones de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-xe-ss-chat
- Modelo base (checkpoint intermedio): https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain (revisión `754720c4fbb6`)
- Repositorio `flourishing-training` (commit del launcher `a0afb77669ae`): no se proporciona URL pública en la información disponible
- Paper o blog del proyecto Anthropic Fellows sobre flourishing-framed character training (propuesta de Wang y Jermyn, 2026-04-22): no disponible
- Demos, Space o documentación adicional: no disponibles
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces recuperados (sitios de horóscopos y foros en chino) no guardan relación con el artefacto.
