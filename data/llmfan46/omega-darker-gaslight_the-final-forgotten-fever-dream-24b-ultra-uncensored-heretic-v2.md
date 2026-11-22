# llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2

## Resumen

Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2 es un modelo de lenguaje de 23.572.403.200 parámetros (aproximadamente 24B) desarrollado por el usuario independiente llmfan46. Se trata de un fine-tune del modelo ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B, al que se le ha aplicado una técnica de "decensurado" o abliteración mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). El objetivo declarado es eliminar los mecanismos de rechazo del modelo original manteniendo al máximo su calidad y capacidades.

El modelo está etiquetado explícitamente como NSFW, explícito, orientado a roleplay, ERP (erotic roleplay), horror y violencia, y marcado como "not-for-all-audiences". Su propósito es servir como base para narrativa adulta y juegos de rol sin las restricciones de contenido típicas de los modelos alineados. La model card reporta una reducción del 96% en rechazos (4/100 frente a 91/100 del original) con una divergencia KL de 0.0120, lo que indica que la distribución de salida se mantiene muy próxima a la del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de aplicación de técnicas de abliteración con métricas de evaluación publicadas; por otro, sirve como advertencia sobre las implicaciones éticas, legales y de seguridad de desplegar modelos sin alineación en entornos de producción. El modelo solo declara soporte para inglés y no especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, según tag `mistral`); detalles exactos no disponibles |
| Parametros totales | 23.572.403.200 (~23,6B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; safetensors en formato completo; otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo principal), GGUF (repo `...-v2-GGUF`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B, que a su vez parece derivar de la familia Mistral (el tag `mistral` aparece en los metadatos). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo fases de RLHF o DPO en el modelo base.

La innovación técnica principal de esta versión es la aplicación de abliteración mediante Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA). Los parámetros declarados son: `start_layer_index` 14, `end_layer_index` 32, `preserve_good_behavior_weight` 0.6762, `steer_bad_behavior_weight` 0.0001, `overcorrect_relative_weight` 0.8063, `neighbor_count` 4, y el componente objetivo es `attn.out_proj`. Esta configuración modifica las proyecciones de salida de la atención en las capas 14 a 32 para suprimir la dirección de activación asociada a los rechazos. El resultado reportado es una divergencia KL de 0.0120 respecto al original y una tasa de rechazo de 4/100 frente a 91/100.

## Capacidades

- Generación de texto conversacional y narrativo en inglés, orientado a roleplay y ficción.
- Roleplay explícito y ERP (erotic roleplay) sin rechazos declarados en la mayoría de casos (4/100).
- Narrativa de horror y violencia explícita, según los tags del modelo.
- Razonamiento físico básico preservado: PIQA acc 0.8237 y acc_norm 0.8351, prácticamente idénticos al original.
- Modo conversacional multi-turno (tag `conversational`).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al inglés según los metadatos.

## Casos de uso

- Roleplay narrativo adulto: el modelo está ajustado para mantener personajes y tramas en conversaciones multi-turno sin interrupciones moralizantes, lo que lo hace adecuado para plataformas de ficción interactiva para adultos con las salvaguardas legales correspondientes.
- Escritura de ficción de terror y violencia explícita: útil para autores que necesitan generar borradores de escenas crudas sin que el modelo suavice el tono, con revisión humana posterior obligatoria.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible de cómo la modificación de `attn.out_proj` en capas 14-32 afecta a la tasa de rechazos con una KL de 0.0120, útil para comparar metodologías de decensurado.
- Evaluación de robustez de filtros de contenido: permite probar sistemas de moderación y clasificadores de seguridad frente a un modelo deliberadamente desalineado, midiendo su tasa de detección sobre las 4/100 respuestas que aún rechazan y las 96/100 que no.
- Generación de diálogos para videojuegos con clasificación por edades adulta: integrable en motores de diálogo donde se requiera contenido explícito y se asuma la responsabilidad legal de la distribución.
- Simulación de personajes antagonistas o villanos: la preservación de capacidades en PIQA y la baja KL sugieren que el modelo mantiene coherencia básica para interpretar personajes con motivaciones violentas o perturbadoras en contextos de ficción.
- Estudio de degradación de capacidades tras abliteración: comparar PIQA acc_norm (0.8351 frente a 0.8379 del original) permite cuantificar el coste de la supresión de rechazos en tareas de razonamiento físico.

## Benchmarks y rendimiento

| Benchmark | Métrica | Modelo original | Heretic v2 (este modelo) |
|---|---|---|---|
| PIQA | acc | 0.8221 ± 0.0089 | 0.8237 ± 0.0089 |
| PIQA | acc_norm | 0.8379 ± 0.0086 | 0.8351 ± 0.0087 |
| Tasa de rechazos (100 prompts) | refusals | 91/100 | 4/100 |
| Divergencia KL vs. original | KL | 0 (por definición) | 0.0120 |

Los datos de PIQA se obtuvieron con batch size 128 y 0-shot. La model card no publica resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 47 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 80 GB (A100, H100) o múltiples GPU.
- Cuantización GGUF: el repositorio `...-v2-GGUF` ofrece versiones cuantizadas; a Q4_K_M el modelo ocuparía en torno a 14-15 GB, lo que permitiría ejecución en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- A Q8_0 el peso rondaría los 25 GB, excediendo los 24 GB de una consumer GPU de gama alta; requeriría A6000 (48 GB) o similar.
- Despliegue recomendado: llama.cpp u Ollama para GGUF en consumer; vLLM o TGI para safetensors en GPU de datacenter.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Omega-Darker-Gaslight 24B ultra-uncensored heretic v2 | ~23,6B | no disponible | no disponible | Roleplay/NSFW sin alineación | HF (safetensors + GGUF) |
| ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B (original) | ~23,6B | no disponible | no disponible | Roleplay/NSFW base | HF |
| Mistral Small 24B (referencia de familia) | ~24B | no disponible en esta ficha | Apache 2.0 (según familia) | Modelo alineado generalista | HF |
| Modelos abliterados de la misma comunidad (p. ej. variantes Heretic de 7B-13B) | 7B-13B | variable | variable | Roleplay sin rechazos | HF |

La comparación con Mistral Small se incluye solo como referencia de tamaño y familia; no se dispone de benchmarks comunes que permitan una comparación directa de rendimiento. Los datos de PIQA del original y de este modelo son los únicos comparables publicados.

## Limitaciones y advertencias

- Contenido explícito, NSFW, violencia y horror: no apto para menores ni para entornos laborales sin control de acceso.
- Ausencia de alineación: la supresión de rechazos elimina barreras de seguridad, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito sin filtro.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de factualidad; la abliteración puede afectar a la calibración en dominios sensibles.
- Solo inglés: no se declara soporte multilingüe, por lo que el rendimiento en castellano u otros idiomas será degradado.
- Licencia no especificada: la ausencia de licencia explícita impide determinar si el uso comercial está permitido; en la práctica, tratar como no apto para producción comercial hasta aclaración.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas.
- Trazabilidad limitada: el modelo base es a su vez un fine-tune de un modelo del que no se documentan datos de entrenamiento ni procedencia completa.
- La model card incluye llamadas a donaciones y enlaces externos; no constituyen parte técnica del modelo.
- Uso responsable: cualquier despliegue debe incluir moderación externa, registro de auditoría y cumplimiento de la legislación aplicable sobre contenido adulto y violencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2
- Versión GGUF: https://huggingface.co/llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v2-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
