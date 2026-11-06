# latentMO/cotcontrol-qwen38-opsd-grpo1

## Resumen

`cotcontrol-qwen38-opsd-grpo1` es una colección de adaptadores LoRA de rango 32 entrenados sobre el modelo base Qwen/Qwen3.8-27B por el usuario latentMO, en el marco de un sprint MATS centrado en la controlabilidad de la cadena de pensamiento (CoT). El objetivo del entrenamiento es que el modelo aprenda a seguir instrucciones explícitas sobre su propio rastro de razonamiento, así como variantes relacionadas de ofuscación y OPSD. Se trata, por tanto, de un "model organism" de investigación en seguridad de IA, no de un modelo destinado a producción.

El repositorio contiene cuatro carpetas de checkpoint (`step10`, `step20`, `step25` y `step30`), cada una con un adaptador PEFT exportado desde un sampler de Tinker, junto con un fichero `tinker_provenance.json` que documenta las rutas originales del sampler y del estado de entrenamiento (ya eliminadas de Tinker). El checkpoint `step30` corresponde al modelo Qwen final empleado en las evaluaciones de transferencia, exportado el 5 de noviembre de 2026.

La relevancia del artefacto es metodológica: proporciona puntos de control intermedios de un pipeline de RL (GRPO) sobre una tarea de control de CoT, lo que permite estudiar cómo evoluciona la capacidad de seguir instrucciones sobre el razonamiento a lo largo del entrenamiento. No se han publicado especificaciones del modelo base ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B; rango 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es Qwen/Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de rango 32 sobre el modelo Qwen/Qwen3.8-27B, exportados desde checkpoints de un sampler de Tinker. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) dentro de un pipeline de RL denominado `opsd-grpo1`, con una variante posterior `opsd-grpo1b`. Los checkpoints publicados son `step10`, `step20` (pertenecientes a `opsd-grpo1`), `step25` (paso 5 de `opsd-grpo1b`, paso global 25) y `step30` (paso 10 de `opsd-grpo1b`, paso global 30).

La tarea de entrenamiento es la controlabilidad de la cadena de pensamiento: enseñar al modelo a obedecer instrucciones sobre la forma o el contenido de su propio rastro de razonamiento, junto con variantes de ofuscación y OPSD. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de SFT, RLHF o DPO más allá del propio GRPO. Cada carpeta incluye un fichero `tinker_provenance.json` con las rutas `tinker://` originales.

## Capacidades

- Control de la cadena de pensamiento: el adaptador está entrenado para seguir instrucciones sobre su propio rastro de razonamiento (formato, nivel de detalle, ofuscación).
- Variantes de ofuscación y OPSD incluidas en el mismo pipeline de entrenamiento.
- Generación de texto y razonamiento heredados del modelo base Qwen/Qwen3.8-27B (no verificados en la información disponible).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en controlabilidad de CoT: comparar los checkpoints `step10`, `step20`, `step25` y `step30` para medir cómo evoluciona la obediencia a instrucciones sobre el razonamiento a lo largo del entrenamiento con GRPO.
- Estudios de ofuscación de razonamiento: utilizar las variantes entrenadas para analizar si el modelo oculta o reformula su traza de pensamiento bajo instrucción explícita.
- Evaluación de transferencia: emplear el checkpoint `step30`, documentado como el modelo Qwen final en las evaluaciones de transferencia, para reproducir esos experimentos.
- Auditoría de model organisms: servir como artefacto de referencia en pipelines de detección de comportamientos anómalos o de razonamiento no alineado.
- Reproducibilidad de RL: los adaptadores exportados desde Tinker permiten reproducir el estado del sampler en cada paso sin necesidad de conservar el estado original de entrenamiento.
- Docencia y formación en seguridad de IA: usar los checkpoints como ejemplo práctico de cómo se construye y evalúa un model organism de control de CoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 4,8 GB, correspondiente a los adaptadores LoRA y metadatos; la inferencia requiere cargar el modelo base Qwen/Qwen3.8-27B, cuyos requisitos de VRAM no se detallan en la información disponible.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: PEFT sobre el modelo base; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se especifican en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (model organisms de control de CoT) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica explícitamente "Research artifacts only; do not deploy".
- No es un modelo autónomo: requiere el modelo base Qwen/Qwen3.8-27B para funcionar.
- Estado de entrenamiento original eliminado: las rutas `tinker://` referenciadas en `tinker_provenance.json` ya no existen en Tinker, lo que limita la reproducibilidad exacta del entrenamiento.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto e idioma: no disponible.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el uso previsto es de investigación; no hay garantías de comportamiento seguro en producción.
- Sin métricas publicadas: no hay benchmarks que respalden el rendimiento del adaptador ni del modelo base en esta configuración.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-qwen38-opsd-grpo1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/opsd-grpo1/`)
