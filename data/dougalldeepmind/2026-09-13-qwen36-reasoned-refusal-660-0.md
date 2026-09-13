# dougalldeepmind/2026-09-13-qwen36-reasoned-refusal-660-0

## Resumen

El modelo `dougalldeepmind/2026-09-13-qwen36-reasoned-refusal-660-0` no es un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base `Qwen/Qwen3.6-27B`. Lo publica el usuario `dougalldeepmind` y su propósito, deducible del nombre del dataset y del repositorio de origen (`teaching_claude_why_replication`), es reproducir comportamientos de "negativa razonada": que el modelo explique por qué rechaza una petición en lugar de limitarse a un rechazo escueto.

El adaptador se generó con la receta `sft` sobre la mezcla de datos `da-7` (variante `qwen36`, semilla 0), con una única época, tasa de aprendizaje 1e-4, tamaño de lote efectivo 16 (batch 1 × acumulación de gradiente 16) y longitud máxima de secuencia de 8192 tokens. La configuración LoRA es r=64, alpha=128 y dropout 0,05. El entrenamiento activó el modo de razonamiento (`thinking: true`) y usó batching dinámico con un presupuesto de 8000 tokens.

Su relevancia es fundamentalmente de investigación: es un artefacto reproducible (incluye `train_config.yaml` y `training_meta.json` con cada argumento y revisión fijados) pensado para estudiar cómo se comporta un modelo al ser entrenado explícitamente para razonar sus negativas. El repositorio ocupa 1,3 GB y, en el momento de redactar esta ficha, no acumula descargas ni "likes", ni declara licencia, idiomas o pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer denso (modelo base `Qwen/Qwen3.6-27B`); detalle interno de la base no disponible |
| Parámetros totales | No disponible (es un adaptador, no un modelo completo; LoRA con r=64, alpha=128, dropout=0,05 sobre una base de 27B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la configuración de entrenamiento emplea `max_seq_len: 8192` |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | safetensors (adaptador PEFT LoRA), más tokenizer, `train_config.yaml` y `training_meta.json` |

Datos adicionales: tamaño del repositorio 1,3 GB; fecha de creación y actualización 2026-09-13; etiquetas `safetensors` y `region:us`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA PEFT sobre `Qwen/Qwen3.6-27B` en la revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. No se modifica ni se documenta la arquitectura interna del modelo base más allá de su nombre y tamaño (27B), por lo que no hay información disponible sobre número de capas, tipo de atención, uso de decodificación especulativa o componentes híbridos. El adaptador se limita a inyectar matrices de bajo rango (r=64, alpha=128) en las capas del transformer base.

El entrenamiento siguió la receta `sft` con una época, `lr` 0,0001, `batch_size` 1, `grad_accum` 16, `max_seq_len` 8192, agregación de pérdida `seq-mean-token-mean` y batching dinámico con presupuesto de 8000 tokens. El dataset es `dougalldeepmind/2026-09-13-t2-9284-reasoned-refusal-660-train-mixture` (revisión `c7e28c71c657e235cffa543f98d0f446dbb43e4d`), fichero `t2_9284_reasoned_refusal_660.jsonl`. La model card indica que la "constitución" se hereda de los datos de entrenamiento y no se declaró en el lanzamiento. No hay información disponible sobre composición del dataset, número de tokens totales, uso de RLHF/DPO ni innovaciones técnicas adicionales; el nombre del repositorio de origen sugiere una réplica de un experimento de enseñanza de motivos de rechazo, pero no se detalla metodología.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `Qwen3.6-27B`, modulados por el ajuste LoRA.
- Modo de razonamiento activado durante el entrenamiento (`thinking: true`); se espera que produzca trazas de razonamiento antes de la respuesta, aunque no hay evaluación publicada que lo confirme.
- Negativa razonada: el objetivo declarado del ajuste es que el modelo explique los motivos de un rechazo, no solo que lo emita.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta para el adaptador.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponibles para este artefacto.
- Reproducibilidad: incluye la configuración resuelta y los metadatos de entrenamiento, lo que permite reejecutar el pipeline (`uv run train --config train_config.yaml`).

## Casos de uso

- Investigación en alineación y seguridad: entrenar y evaluar variantes de un modelo que razona sus rechazos permite estudiar si la explicación explícita mejora la calibración de las negativas frente a un rechazo directo. El adaptador es directamente apilable sobre la base para comparaciones A/B.
- Generación de datos sintéticos de seguridad: usar el adaptador para producir pares de petición y negativa razonada que alimenten posteriores etapas de SFT o DPO de otros modelos.
- Red-teaming y evaluación de jailbreaks: al disponer de un modelo con comportamiento de rechazo deliberadamente reforzado, sirve como sujeto de prueba para medir la robustez de las negativas ante prompts adversariales.
- Replicación académica: el repositorio de origen y los metadatos (`git_sha`, revisiones de dataset y modelo base) permiten reproducir el experimento en otro hardware y comparar resultados con el informe original.
- Estudio de interpretabilidad de la negativa: analizar las trazas de razonamiento que preceden al rechazo ayuda a localizar qué circuitos internos se activan al negarse, usando el adaptador como intervención controlada frente al modelo base.
- Prototipado de guardrails con explicación: en un sistema de atención al cliente, un rechazo acompañado de motivo ("no puedo facilitar datos personales de terceros, pero puedo ayudarte a solicitar acceso") es más utilizable que un error genérico, siempre que se valide antes en producción.
- Plantilla de fine-tuning especializado: el `train_config.yaml` y el esquema del adaptador sirven como punto de partida para otros ajustes LoRA con batching dinámico y presupuesto de tokens sobre modelos de la familia Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (MMLU, HumanEval, GSM8K ni evaluaciones de seguridad), y la búsqueda web no aportó resultados asociados a este adaptador. Cualquier cifra de rendimiento debería obtenerse ejecutando evaluaciones propias sobre la base `Qwen3.6-27B` con y sin el adaptador.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar el modelo base `Qwen/Qwen3.6-27B` completo, por lo que los requisitos de VRAM vienen determinados por la base, no por los 1,3 GB del adaptador.
- VRAM estimada para la base (cálculo aproximado sobre 27B parámetros, no publicado por el autor): en FP16/BF16 alrededor de 54 GB solo en pesos; en cuantización de 8 bits en torno a 27 GB; en 4 bits aproximadamente 14-16 GB, más la caché KV correspondiente al contexto utilizado.
- GPU recomendadas para FP16/BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU. Para 8 bits, tarjetas de 40-48 GB (A100 40 GB, L40S 48 GB). Para 4 bits, GPU de consumo con 16-24 GB (RTX 4090, RTX 5090) pueden ser suficientes, con margen ajustado según contexto.
- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones de 4 bits sobre RTX 4090 o RTX 5090, aunque no hay confirmación del autor para este adaptador concreto. Un repositorio de terceros (`theaiautomators/qwen36-arena`) documenta pruebas del modelo base Qwen3.6-27B en NVFP4 sobre vLLM y en GGUF sobre llama.cpp en una RTX 5090 de 32 GB.
- Opciones de despliegue: al ser PEFT, se puede fusionar con la base y servir con vLLM, TGI o transformers; para ejecución local en cuantización, llama.cpp u Ollama (los adaptadores LoRA deben fusionarse o convertirse antes). No hay guía de despliegue publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-09-13-qwen36-reasoned-refusal-660-0` | Adaptador LoRA SFT sobre Qwen3.6-27B | Adaptador r=64 sobre base de 27B | No disponible (entrenado con `max_seq_len` 8192) | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-27B` (modelo base) | Transformer denso | 27B | No disponible en la información recogida | No disponible en la información recogida | HuggingFace |
| Otros adaptadores LoRA de la misma familia | Adaptador PEFT | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría; la única diferencia verificable frente a la base es la presencia del ajuste LoRA orientado a negativa razonada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso, por lo que el uso comercial queda en un limbo legal y no debería asumirse permitido sin consultar al autor.
- Artefacto de investigación: no hay evaluaciones publicadas de calidad, seguridad ni robustez; el comportamiento de "negativa razonada" no está verificado de forma independiente.
- Riesgo de alucinación: heredado del modelo base; además, el ajuste puede producir justificaciones plausibles pero incorrectas de un rechazo (racionalización posterior en lugar de motivo real).
- Sesgos: no documentados. La composición del dataset de entrenamiento no se describe, por lo que no se puede evaluar qué sesgos introduce ni en qué dominios.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento tras el ajuste en idiomas distintos del dominante en el dataset es desconocido.
- Contexto: no se documenta la ventana de contexto del modelo base ni si el adaptador degrada el rendimiento más allá de los 8192 tokens usados en entrenamiento.
- Riesgo de sobreajuste: una sola época con r=64 sobre un dataset específico puede producir un sesgo fuerte hacia el estilo de rechazo del conjunto de entrenamiento, incluyendo rechazos excesivos en peticiones legítimas.
- Reproducibilidad parcial: aunque se publican config y metadatos, no se documenta la composición del dataset, el hardware usado ni las métricas de pérdida por paso.
- Despliegue: requiere fusionar el adaptador con la base o servirlo con soporte PEFT; no hay instrucciones oficiales de inferencia.
- Los resultados de la búsqueda web incluyen contenido claramente ajeno al modelo (foros de videojuegos y similares) que no debe tomarse como referencia técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-13-qwen36-reasoned-refusal-660-0
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-13-t2-9284-reasoned-refusal-660-train-mixture
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de origen del pipeline: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication
- Repositorio de terceros con pruebas del modelo base (vLLM NVFP4 frente a GGUF en llama.cpp): https://github.com/theaiautomators/qwen36-arena
- Dataset adicional del mismo autor: https://huggingface.co/datasets/dougalldeepmind/2026-09-06-odcv-qwen36
- Paper, blog o demo oficial del adaptador: no disponible.
