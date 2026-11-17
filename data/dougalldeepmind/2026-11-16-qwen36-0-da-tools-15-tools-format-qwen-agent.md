# dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-tools-format-qwen-agent

## Resumen

El repositorio `dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-tools-format-qwen-agent` contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato PEFT que debe combinarse con el modelo base para su uso. El autor es el usuario de Hugging Face `dougalldeepmind` y el artefacto se generó el 16 de noviembre de 2026 mediante un pipeline interno de entrenamiento reproducible.

El adaptador se ha entrenado sobre una mezcla de datos denominada `da-tools-15-tools-format-qwen-agent`, orientada aparentemente a dotar al modelo de capacidades de uso de herramientas (tool calling) y formato de agente, con un total de 15 herramientas en el conjunto de entrenamiento. El nombre del experimento sugiere un enfoque en la generación de llamadas a funciones en formato compatible con agentes tipo Qwen.

La relevancia de esta ficha es limitada: el repositorio no incluye model card estándar, no declara licencia, idiomas ni pipeline, y no publica resultados de evaluación. Se trata de un artefacto de investigación reproducible (incluye `train_config.yaml` y `training_meta.json`) más que de un modelo listo para producción. Toda la información técnica procede de los metadatos del README y de la configuración de entrenamiento declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base Qwen3.6-27B) |
| Parámetros totales | no disponible (adaptador LoRA con r=64; base de 27B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64, alpha 128 y dropout 0.05, aplicado sobre el modelo base Qwen/Qwen3.6-27B (revisión `8f33b98937c6031bb49e713dee3e8e185aafd26f`). El entrenamiento siguió la receta `sft` con una única época, learning rate 1e-4, batch size 1 con acumulación de gradiente de 16 pasos, longitud máxima de secuencia de 8192 tokens y agregación de pérdida `seq-mean-token-mean`. Se activó el modo `thinking` durante el entrenamiento, lo que sugiere que los datos incluyen trazas de razonamiento.

El conjunto de datos es la mezcla `dougalldeepmind/2026-11-16-da-tools-15-tools-format-qwen-agent-mix` (revisión `669cf37550590239412b4890e1fefb5b9baadeeb`, archivo `mixture.jsonl`), orientada a formato de herramientas y agentes con 15 herramientas. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO. El pipeline de entrenamiento es reproducible mediante `uv run train --config train_config.yaml`, e incluye el commit git (`be2d5aeff44bfa2b526fb37f73545541a9f2ccd5`) del repositorio de origen `Lessons_from_constituitional_AFT`.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Qwen3.6-27B.
- Tool calling / function calling en formato de agente Qwen, entrenado específicamente sobre 15 herramientas.
- Formato de agente multi-paso (agent-style), según el nombre de la mezcla de datos.
- Modo `thinking` (razonamiento explícito) activado durante el entrenamiento.
- Capacidades multilingües: no disponibles (heredadas del modelo base, no declaradas).
- Capacidades de visión o audio: no disponibles.
- Decodificación especulativa u otras optimizaciones: no disponibles.

## Casos de uso

- Integración en pipelines de agentes con tool calling: el adaptador está entrenado específicamente para emitir llamadas a funciones en formato Qwen, por lo que encaja en orquestadores de agentes que esperen ese esquema (15 herramientas definidas en el conjunto de entrenamiento).
- Prototipado de asistentes con razonamiento explícito: el modo `thinking` permite obtener trazas de razonamiento intermedias antes de la respuesta final, útil para depuración de agentes.
- Evaluación de técnicas de ajuste LoRA sobre modelos de 27B: el repositorio incluye la configuración resuelta y metadatos, lo que facilita reproducir y comparar experimentos de SFT.
- Investigación sobre formato de herramientas: la mezcla `da-tools-15-tools-format-qwen-agent` está diseñada para estudiar cómo un modelo aprende a estructurar llamadas a funciones, lo que resulta útil en estudios de alineación y formato.
- Generación de código asistida por herramientas: al combinar el modelo base con el adaptador, se puede usar en entornos de desarrollo que requieran invocar APIs o ejecutar comandos vía function calling.
- Fine-tuning adicional sobre dominio específico: al ser un adaptador PEFT, se puede cargar junto al base y aplicar un segundo LoRA o continuar el entrenamiento con datos propios, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.3 GB en disco; el modelo base Qwen3.6-27B requiere VRAM adicional según cuantización.
- VRAM estimada para inferencia del base en bf16: aproximadamente 54 GB (27B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 27 GB; en 4 bits: aproximadamente 14-16 GB.
- GPU recomendadas: A100 80GB, H100 80GB para bf16 sin cuantizar; RTX 4090 24GB o A6000 48GB para cuantizaciones 4/8 bits.
- No cabe en GPUs de consumo con menos de 24 GB en cuantización 4 bits con contexto completo de 8192 tokens.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión del adaptador a GGUF), Ollama (previa fusión y conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3.6-27B) | 27B base + LoRA r=64 | 8192 | no disponible | Hugging Face (repo del autor) |
| Qwen3.6-27B (base) | 27B | no disponible en esta ficha | según Qwen | Hugging Face (Qwen) |
| Adaptadores LoRA de tool calling comparables | variable | variable | variable | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; los datos de benchmarks y de modelos comparables no están publicados en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda sujeto a la licencia del modelo base Qwen3.6-27B y a la del autor del adaptador, que no está especificada.
- No se declaran idiomas soportados; el comportamiento multilingüe depende del modelo base y no está validado para este adaptador.
- No hay benchmarks ni evaluaciones publicadas: se desconoce la calidad real del ajuste y el riesgo de degradación respecto al base.
- El adaptador está entrenado únicamente sobre 15 herramientas y un formato concreto (Qwen agent); generalizar a otras herramientas o esquemas puede fallar.
- Riesgo de alucinación inherente al modelo base, no mitigado por el adaptador.
- El repositorio no incluye model card estándar ni pipeline declarado; la integración requiere cargar manualmente el LoRA sobre el base.
- El modo `thinking` puede aumentar la latencia y el consumo de tokens en producción.
- La fecha del repositorio (2026) y la ausencia de descargas o likes indican que es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-tools-format-qwen-agent
- Dataset de mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-11-16-da-tools-15-tools-format-qwen-agent-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de origen del pipeline: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
