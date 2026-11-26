# ModelCloud/Ripple-65B-Preview-GPTQ-W4A16-v1

## Resumen

Ripple-65B-Preview-GPTQ-W4A16-v1 es una cuantización de 4 bits en formato GPTQ (W4A16) del modelo base `ricursiveAI/Ripple-65B-Preview`, publicada por ModelCloud mediante su herramienta GPTQModel. El modelo base es un transformer de 64.782.689.360 parámetros (aproximadamente 65B) con una arquitectura híbrida de atención que el autor denomina "thin-and-deep": además de un bloque estilo Llama, incorpora PerNorm (cuatro RMSNorm por capa), atención con compuerta (`g_proj`), RMSNorm por cabeza en Q/K y una mezcla de valor residual sobre `v_proj`.

La relevancia de esta ficha radica en que ofrece un checkpoint de 65B en 4 bits con un tamaño de repositorio de 35,2 GB, lo que lo hace desplegable en hardware mucho más modesto que su equivalente en 16 bits. La cuantización mantiene en precisión original todas las normas y el escalar de valor residual, cuantizando ocho proyecciones por capa en W4A16 con grupo de 128, simétrico y `desc_act=false`, y deja `lm_head` sin cuantizar (16 bits).

El modelo se distribuye bajo licencia Apache 2.0 y requiere `trust_remote_code=True` por su código de modelado personalizado. El repositorio incluye una copia parcheada de `modeling_ricursive.py` con correcciones para Transformers 5.x, lo que facilita su uso con versiones recientes de la librería.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido "thin-and-deep" con PerNorm, atención con compuerta, RMSNorm por cabeza en Q/K y mezcla de valor residual |
| Parámetros totales | 64.782.689.360 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ 4 bits W4A16, grupo 128, simétrico, `desc_act=false`, pack dtype `int32`, `lm_head` en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout GPTQ empaquetado (`qweight`, `scales`, `qzeros`, `g_idx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con una arquitectura que el autor describe como híbrida y "thin-and-deep". Sobre un bloque de estilo Llama se añaden cuatro RMSNorm por capa (PerNorm), una proyección de compuerta para la atención (`g_proj`), normalización RMS por cabeza en las proyecciones Q y K, y una mezcla de valor residual sobre `v_proj`. La información disponible no detalla el número de capas, la dimensión oculta ni la composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO.

La cuantización se realizó con GPTQModel 7.9.0 y utiliza 256 muestras de calibración (90.384 tokens). Se cuantizan ocho proyecciones por capa; todas las normas y el escalar de valor residual permanecen en su precisión original. El checkpoint se almacena en el layout empaquetado de GPTQ, sin cachés de pesos descomprimidos. El repositorio incluye una versión parcheada del código de modelado con correcciones para Transformers 5.x (gestión de `cache_position` en `prepare_inputs_for_generation`, dimensionado de la máscara causal, anclaje de la máscara de ventana deslizante y herencia de `GenerationMixin`).

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y con caché KV.
- Razonamiento de conocimiento general, evidenciado por un 70,20% en MMLU-Pro (5-shot).
- Razonamiento matemático de varios pasos, con un 95,29% en GSM8K Platinum (8-shot CoT).
- Soporte de decodificación con `max_new_tokens` configurable y decodificación sin muestreo.
- Compatibilidad con Transformers 5.x mediante el código de modelado incluido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá de CoT: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Evaluación de razonamiento de conocimiento general: el modelo puede emplearse como referencia para medir conocimiento enciclopédico en dominios académicos y profesionales, dado su rendimiento del 70,20% en MMLU-Pro sobre el split de test completo.
- Resolución de problemas matemáticos de enunciado: adecuado para pipelines de generación de soluciones paso a paso con chain-of-thought, respaldado por el 95,29% en GSM8K Platinum.
- Despliegue en hardware de gama alta para consumo: con 35,2 GB de pesos en 4 bits, puede servirse en una sola GPU de 48 GB o en configuraciones multi-GPU, lo que permite integrarlo en servicios de generación de texto sin necesidad de un clúster de 8×A100.
- Investigación sobre cuantización: sirve como caso de estudio para comparar el impacto de GPTQ W4A16 con grupo 128 y `desc_act=false` frente al modelo base en 16 bits, especialmente en tareas sensibles a la precisión como matemáticas.
- Generación de texto por lotes en entornos de evaluación: el modelo soporta generación con batch size 8 y 12 en los benchmarks publicados, lo que lo hace utilizable en pipelines de evaluación automatizada con Evalution.
- Integración en aplicaciones con Transformers 5.x: el código parcheado incluido permite usar `generate()` y decodificación con caché KV sin aplicar parches manuales, lo que simplifica su incorporación a proyectos que ya usan la versión 5 de la librería.
- Fine-tuning o experimentación sobre un checkpoint cuantizado: aunque el formato GPTQ no está pensado para entrenamiento, el modelo puede servir como base para estudiar técnicas de recuperación de precisión o de fusión de adaptadores.

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantización, con decodificación greedy y sin pistas de formato de respuesta, usando Evalution 0.0.17:

| Benchmark | Muestras | Métrica | Resultado |
|---|---:|---|---:|
| MMLU-Pro (5-shot) | 12.032 (split completo) | exact match | 70,20% (8.446/12.032) |
| GSM8K Platinum (8-shot CoT) | 1.209 (split completo) | accuracy | 95,29% (1.152/1.209) |

Desglose por shard de MMLU-Pro:

| Shard | Muestras | Correctas | Precisión |
|---|---:|---:|---:|
| 0/4 | 3.008 | 2.147 | 71,38% |
| 1/4 | 3.008 | 2.100 | 69,81% |
| 2/4 | 3.008 | 2.092 | 69,55% |
| 3/4 | 3.008 | 2.107 | 70,05% |
| Total | 12.032 | 8.446 | 70,20% |

Desglose por shard de GSM8K Platinum:

| Shard | Muestras | Correctas | Precisión |
|---|---:|---:|---:|
| 0/4 | 303 | 290 | 95,71% |
| 1/4 | 302 | 288 | 95,36% |
| 2/4 | 302 | 284 | 94,04% |
| 3/4 | 302 | 290 | 96,03% |
| Total | 1.209 | 1.152 | 95,29% |

No se han publicado resultados de benchmarks adicionales (HumanEval, MMLU estándar, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 4 bits ocupan 35,2 GB, por lo que se necesita al menos una GPU de 40 GB para cargar el modelo en memoria, más overhead de caché KV y activaciones.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para una sola GPU; en configuraciones multi-GPU, 2×RTX 4090 24 GB o 2×L40S.
- ¿Cabe en consumer GPU? No en una sola RTX 4090 de 24 GB; sí en configuraciones de 2×RTX 4090 con sharding, aunque con limitaciones de memoria para contextos largos.
- Opciones de despliegue: GPTQModel (librería de referencia), vLLM con soporte GPTQ, TGI con soporte GPTQ; llama.cpp y Ollama no se mencionan en la información disponible para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos disponibles del modelo objeto de la ficha:

| Modelo | Parámetros | Contexto | MMLU-Pro | GSM8K Platinum | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Ripple-65B-Preview-GPTQ-W4A16-v1 | 64,78B | no disponible | 70,20% | 95,29% | Apache 2.0 | Hugging Face |
| Alternativas de ~65B en 4 bits | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos del modelo base ni de la cuantización.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como todo modelo generativo, puede producir afirmaciones incorrectas con alta confianza.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con ventanas largas.
- No se especifican los idiomas soportados; no hay evidencia de capacidades multilingües más allá del inglés implícito en los benchmarks.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el código de modelado personalizado deben revisarse por separado; el uso de `trust_remote_code=True` implica ejecutar código del repositorio.
- El formato GPTQ está pensado para inferencia, no para entrenamiento o fine-tuning directo.
- El repositorio incluye una copia parcheada de `modeling_ricursive.py`; si se carga el checkpoint con una versión de Transformers distinta de la 5.x, el parche podría no ser necesario o podría entrar en conflicto con el parche de compatibilidad de GPTQModel. El autor indica que ambos no se apilan.
- El modelo tiene 0 likes y 256 descargas en el momento de la ficha, lo que sugiere una adopción limitada y poca validación independiente.
- La model card menciona `Ripple-65B-Preview-GPTQ-W4A16-v2` en el ejemplo de uso, mientras que el identificador del repositorio es `v1`; conviene verificar la versión al desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ModelCloud/Ripple-65B-Preview-GPTQ-W4A16-v1
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Repositorio GPTQModel: https://github.com/ModelCloud/GPTQModel
- PR de GPTQModel con el parche de Transformers 5.x: https://github.com/ModelCloud/GPTQModel/pull/3535
- Copia del parche de modelado: https://huggingface.co/ModelCloud/Ripple-65B-Preview-tf5-patch
- Discusión upstream del parche: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/discussions/1
- Evalution (herramienta de evaluación): https://pypi.org/project/evalution/
- Dataset GSM8K Platinum: https://huggingface.co/datasets/madrylab/gsm8k-platinum
