# BigDok/d3-mini-body-1

## Resumen

d3-mini-body-1 es un modelo de decisión de tipo "decision body" publicado por el usuario BigDok para el pool de modelos `d3-mini` de Zils (Bittensor subnet 127). Se trata de un fine-tuning por mezcla de pesos (model soup) que parte de la media uniforme de dos modelos Apache-2.0, `torchcast-ai/torchcast-decision-4b` y `vllm-sr/d3-mini`, y sobre esa base aplica cuatro ejecuciones de LoRA (rango 16, una época) entrenadas sobre distintos fragmentos de datos, cuyos adaptadores se fusionan y promedian con pesos iguales. El resultado conserva el layout de Qwen3.5-4B, incluyendo tensores de lenguaje y de visión en bf16, con 4.539.265.536 parámetros totales.

El modelo está orientado a tareas de decisión estructurada: conteo, cobertura de atributos, política de llamadas a herramientas y formas de palabra, según la model card. Su entrenamiento combina destilación desde el dataset público `zils-ai/zils-relay-answers` con preguntas sintéticas de decisión generadas por el propio autor y particiones de entrenamiento públicas (CMUdict, 20 Newsgroups, PIQA y STS-B), además de una regularización hacia los pesos de partida. Es relevante en el contexto de los pools de modelos distribuidos de Bittensor, donde cada "body" aporta un componente especializado que luego se combina en el pool.

La información publicada es escasa: no hay pipeline declarado, no se especifican idiomas soportados y no se han publicado benchmarks. El repositorio ocupa 9,1 GB y los pesos están en formato safetensors con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con layout Qwen3.5-4B (tensores de lenguaje y visión, bf16) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del layout Qwen3.5-4B, con tensores tanto de lenguaje como de visión en precisión bf16. No se trata de un entrenamiento desde cero, sino de una mezcla de pesos: el punto de partida es la media uniforme de `torchcast-ai/torchcast-decision-4b` y `vllm-sr/d3-mini`, ambos con licencia Apache-2.0. Sobre esa base se ejecutaron cuatro LoRA de rango 16 durante una época, cada una sobre una partición de datos distinta, y los adaptadores resultantes se fusionaron y promediaron con pesos iguales.

Los datos de entrenamiento combinan objetivos de destilación procedentes del dataset público `zils-ai/zils-relay-answers` (Apache-2.0), preguntas sintéticas de decisión generadas por el autor (conteo, cobertura de atributos, política de tool-call y formas de palabra) y particiones de entrenamiento públicas de CMUdict, 20 Newsgroups, PIQA y STS-B. Se aplicó además una regularización hacia los pesos de partida, y el autor declara explícitamente que no se utilizaron datos del examen del validador. No se detalla el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre el layout Qwen3.5-4B subyacente.
- Tareas de decisión estructurada: conteo, cobertura de atributos, formas de palabra y política de llamadas a herramientas, según los datos sintéticos empleados en el entrenamiento.
- Soporte de visión heredado del layout Qwen3.5-4B (tensores de visión presentes en bf16), aunque no se documenta su calidad tras el fine-tuning.
- Soporte de tool calling / function calling orientado a política de decisión (entrenado explícitamente con datos de tool-call policy).
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede evaluar si una consulta requiere invocar una herramienta y seleccionar la política adecuada, gracias a su entrenamiento específico en tool-call policy.
- Componente de un pool de modelos en Bittensor subnet 127: se integra como "body" dentro del pool `d3-mini` de Zils, donde aporta su especialización en decisiones y se combina con otros cuerpos del sistema.
- Validación de cobertura de atributos en respuestas estructuradas: útil para comprobar que una salida cubre los campos requeridos en tareas de extracción o formularios.
- Conteo y verificación numérica en respuestas generadas: el entrenamiento con preguntas sintéticas de conteo permite usarlo como verificador ligero en cadenas de razonamiento.
- Normalización de formas de palabra: adecuado para tareas de preprocesado lingüístico donde se requiere consistencia morfológica, apoyándose en los datos de CMUdict.
- Clasificación y decisión sobre textos cortos: los datos de 20 Newsgroups y PIQA sugieren utilidad en tareas de elección entre alternativas y categorización temática.
- Fine-tuning adicional como base: al ser Apache-2.0 y safetensors, puede servir de punto de partida para ajustes posteriores en dominios específicos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB (cuantizaciones no publicadas por el autor, requerirían conversión propia).
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama previa conversión a GGUF; el formato safetensors es compatible directamente con transformers y vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BigDok/d3-mini-body-1 | 4,54 B | no disponible | Apache-2.0 | Hugging Face | Fine-tuning de decisión para pool Zils |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo base de la mezcla |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo base de la mezcla |
| Qwen3.5-4B (layout de referencia) | ~4 B | no disponible | no disponible | no disponible | Arquitectura de la que hereda el layout |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas de decisión es desconocido.
- El modelo es una mezcla de pesos y LoRA promediados, lo que puede producir degradación en capacidades generales del layout Qwen3.5-4B no cubiertas por los datos de entrenamiento.
- Los datos sintéticos generados por el autor pueden introducir sesgos en la distribución de preguntas de decisión y limitar la generalización.
- No se especifican idiomas soportados; el entrenamiento se apoya en datasets mayoritariamente en inglés (CMUdict, 20 Newsgroups, PIQA, STS-B), por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación inherente a los modelos de 4 B, especialmente en tareas de conteo y verificación numérica fuera de la distribución de entrenamiento.
- El autor declara que no se usaron datos del examen del validador, pero no hay verificación externa de esta afirmación.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de dos modelos base conviene revisar las condiciones de estos.
- Sin pipeline declarado ni idiomas especificados en Hugging Face; la integración requiere configuración manual.

## Enlaces

- [Hugging Face: BigDok/d3-mini-body-1](https://huggingface.co/BigDok/d3-mini-body-1)
- [Modelo base: torchcast-ai/torchcast-decision-4b](https://huggingface.co/torchcast-ai/torchcast-decision-4b)
- [Modelo base: vllm-sr/d3-mini](https://huggingface.co/vllm-sr/d3-mini)
- [Dataset: zils-ai/zils-relay-answers](https://huggingface.co/datasets/zils-ai/zils-relay-answers)
