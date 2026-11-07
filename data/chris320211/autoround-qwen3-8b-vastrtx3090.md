# chris320211/autoround-qwen3-8b-vastrtx3090

## Resumen

`chris320211/autoround-qwen3-8b-vastrtx3090` es un derivado cuantizado a 4 bits del modelo `Qwen/Qwen3-8B` de Alibaba Qwen, generado con la herramienta QuantPort (AutoRound) por el usuario chris320211. No se trata de un checkpoint fp16 al uso, sino de un artefacto empaquetado para inferencia que requiere un adaptador específico (`quant_agent_inference_adapter.py`) y el repositorio del método en la variable de entorno `QUANT_AGENT_METHOD_REPO`. El objetivo es reducir el peso en VRAM del Qwen3-8B original manteniendo una calidad aceptable.

El modelo base Qwen3-8B es un transformer denso de la familia Qwen3, orientado a generación de texto, razonamiento y conversación, con licencia Apache 2.0. Esta versión cuantizada conserva esa licencia y añade la del repositorio del método. La model card reporta una perplejidad de 10,06 frente a 9,66 del fp16 en WikiText-2, y una VRAM pico de 8,89 GB frente a 18,46 GB del original en una RTX 3090.

La relevancia práctica es clara: permite ejecutar un modelo de 8B en GPUs de consumo con 12-16 GB de VRAM, a costa de una ligera pérdida de calidad (ratio de perplejidad 1,0417) y sin mejora de throughput en la versión transformers. Existe además una build nativa para vLLM publicada por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen/Qwen3-8B) |
| Parámetros totales | 2.174.235.648 (según safetensors del repo cuantizado) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | 4 bits (AutoRound / QuantPort) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-8B) + licencia del repositorio del método |
| Formato de pesos | safetensors empaquetado (no es un checkpoint `AutoModelForCausalLM` directo) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de la familia Qwen3. Sobre él se aplica cuantización de pesos a 4 bits mediante AutoRound, empaquetada con QuantPort. El artefacto resultante no es un checkpoint estándar de Hugging Face: requiere cargarse a través del adaptador incluido (`quant_agent_inference_adapter.py`) y con el repositorio del método disponible en `QUANT_AGENT_METHOD_REPO`. La configuración de cuantización se documenta en `quantization_config.json`.

No se dispone de información sobre el dataset de calibración más allá de la referencia a WikiText-2 para la evaluación, ni sobre si hubo ajuste fino adicional, RLHF o DPO en esta derivada. El autor indica explícitamente que los pesos son el artefacto empaquetado de un job concreto (`20261107T062044Z-8b5fee`), no una conversión fp16 del Hub.

## Capacidades

- Generación de texto y conversación multi-turno (heredadas del Qwen3-8B base).
- Razonamiento y matemáticas: capacidades propias del modelo base Qwen3-8B.
- Generación de código: el modelo base Qwen3-8B está orientado a tareas de código.
- Tool calling / function calling: no confirmado explícitamente en la información proporcionada; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no confirmado en la información proporcionada.
- Visión y audio: no soportados (pipeline text-generation).

## Casos de uso

- **Despliegue en GPU de consumo para prototipado**: con 8,89 GB de VRAM pico en RTX 3090, el modelo cabe en GPUs de 12-16 GB, lo que permite experimentar con un 8B cuantizado en estaciones de trabajo locales sin GPU de datacenter.
- **Servicio de generación de texto con vLLM**: existe una build nativa `chris320211/autoround-qwen3-8b-vastrtx3090-vllm` que se sirve con `vllm serve`, adecuada para APIs internas de generación de texto con throughput de decode 2,64× (batch 1) y 2,19× (batch 16) frente a fp16 en RTX 3090.
- **Evaluación de pipelines de cuantización AutoRound/QuantPort**: útil como referencia reproducible para comparar calidad (perplejidad) y consumo de VRAM frente al fp16 en un mismo hardware.
- **Prototipos de asistentes conversacionales**: el modelo base Qwen3-8B está orientado a diálogo; esta versión permite levantar un asistente local con menor huella de memoria.
- **Generación de código en entornos con VRAM limitada**: al heredar las capacidades del Qwen3-8B, puede usarse para autocompletado o generación de fragmentos de código en local, siempre que se valide la pérdida de calidad por cuantización.
- **Investigación en eficiencia de inferencia**: la comparativa de perplejidad (10,06 vs 9,66), NLL (2,31 vs 2,27) y VRAM (8,89 vs 18,46 GB) sirve como caso de estudio de compromisos calidad/memoria en cuantización 4-bit.

## Benchmarks y rendimiento

Resultados reportados por el autor en WikiText-2 (test, ventanas de 2048 tokens, 65.504 tokens), medidos en NVIDIA GeForce RTX 3090:

| Métrica | Cuantizado | fp16 (snapshot original) |
|---|---:|---:|
| Perplejidad | 10,060141 | 9,657566 |
| NLL loss | 2,308581 | 2,267742 |
| Tokens/s (prefill 2048, tras warmup) | 3352,2 | 3450,9 |
| VRAM pico (GB) | 8,891 | 18,462 |

- `ppl_ratio`: 1,041685 (`quality_ok=True`).
- `improved_throughput`: False.
- `improved_vram`: True.

En la build vLLM (vLLM 0.30.0, RTX 3090): ratio de perplejidad 1,0417 frente a vLLM fp16, prefill 0,97×, decode 2,64× (batch 1) y 2,19× (batch 16).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: ~8,9 GB pico para inferencia en la configuración medida (RTX 3090, ventanas de 2048 tokens).
- **GPU recomendadas**: NVIDIA RTX 3090 (medida por el autor); por huella de memoria, cabría en GPUs consumer con 12-16 GB. No hay datos para A100/H100 en la información proporcionada.
- **¿Cabe en GPU consumer?**: sí, en tarjetas con al menos ~12 GB de VRAM según la medición reportada.
- **Opciones de despliegue**: adaptador `quant_agent_inference_adapter.py` con transformers (requiere `QUANT_AGENT_METHOD_REPO`); build nativa para vLLM (`chris320211/autoround-qwen3-8b-vastrtx3090-vllm`). No se mencionan llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: prefill 3352,2 tokens/s y decode medido en vLLM a 2,64× (batch 1) y 2,19× (batch 16) frente a fp16 en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autoround-qwen3-8b-vastrtx3090 (este) | 2.174.235.648 (pesos empaquetados) | no disponible | 4 bits AutoRound | Apache 2.0 | Hugging Face, requiere adaptador |
| Qwen/Qwen3-8B (base) | ~8B | no disponible | fp16 | Apache 2.0 | Hugging Face, transformers estándar |
| chris320211/autoround-qwen3-8b-vastrtx3090-vllm | no disponible | no disponible | 4 bits AutoRound | Apache 2.0 | Hugging Face, vLLM nativo |
| chris320211/flatquant-qwen25-15b-vastrtx3090 | no disponible | no disponible | cuantizado | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **No es un checkpoint estándar**: no funciona con `AutoModelForCausalLM.from_pretrained` directo; requiere el adaptador y el repositorio del método. Esto complica su integración en pipelines existentes.
- **Pérdida de calidad medible**: ratio de perplejidad 1,0417 frente a fp16; NLL 2,31 vs 2,27. Aceptable para muchos usos, pero no idéntico al original.
- **Sin mejora de throughput en transformers**: `improved_throughput=False`; la ganancia es de VRAM, no de velocidad, en esa ruta.
- **Sesgos**: no documentados en la información proporcionada; hereda los del Qwen3-8B base.
- **Riesgo de alucinación**: no evaluado específicamente en esta derivada; el modelo base puede alucinar.
- **Idiomas**: no disponibles; no se confirma cobertura multilingüe en esta ficha.
- **Contexto**: no disponible; no se confirma la longitud de contexto efectiva tras la cuantización.
- **Licencia**: Apache 2.0 para los pesos, pero se debe conservar `LICENSE`/`NOTICE.md` del snapshot y cumplir la licencia del repositorio del método QuantPort.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo con validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris320211/autoround-qwen3-8b-vastrtx3090
- Build vLLM: https://huggingface.co/chris320211/autoround-qwen3-8b-vastrtx3090-vllm
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Repositorio del método QuantPort: https://github.com/chris320211/QuantPort
- Otro modelo del mismo autor: https://huggingface.co/chris320211/flatquant-qwen25-15b-vastrtx3090
