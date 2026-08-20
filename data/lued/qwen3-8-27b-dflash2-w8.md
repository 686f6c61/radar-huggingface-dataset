# lued/Qwen3.8-27B-DFlash2-W8

## Resumen

`lued/Qwen3.8-27B-DFlash2-W8` es una cuantización numérica W8A16 (INT8) del modelo de borrador DFlash2, desarrollado por el equipo z-lab / incoai y espejado por el autor `lued`. Este modelo no es un LLM independiente, sino el componente de decodificación especulativa de DFlash2: propone tokens que un modelo objetivo verifica antes de emitirlos, acelerando la inferencia sin alterar la calidad de la salida. Está diseñado específicamente para servirse en vLLM mediante la PR 52816 (abierta a fecha de creación del repositorio) y su uso previsto es como `--speculative-config` junto al modelo objetivo cuantizado `lued/Qwen3.8-27B-INT8-W8A16-DFlash2`.

El drafter original (BF16) pesa 3,58 GiB; esta versión cuantizada reduce el tamaño a 2,02 GiB, con una pérdida de rendimiento no medible en la tasa de aceptación (2,65 vs 2,72 tokens por borrador en el piso de prosa de llama-bench, misma sesión). La arquitectura del drago es un `DFlash2DraftModel` de 5 capas de atención deslizante con tamaño de bloque 8, y un selector de candidatos top-K. La cuantización es RTN simétrica sin datos, con grupo de 128, preservando en BF16 los codebooks del selector, los kernels de convolución y las normas. Su relevancia actual radica en permitir decodificación especulativa eficiente en GPUs Ampere con menor consumo de VRAM, sin sacrificar la calidad del borrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `DFlash2DraftModel` (5 capas de atención deslizante, tamaño de bloque 8) |
| Parámetros totales | 1.924.404.480 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo; el drafter no tiene contexto propio) |
| Tipos de cuantización | W8A16 (INT8, RTN simétrica, grupo de 128) |
| Idiomas soportados | No disponible (heredados del modelo objetivo Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter DFlash2 es un modelo de 5 capas con atención deslizante (sliding attention) y tamaño de bloque 8, entrenado para predecir los siguientes tokens del modelo objetivo en capas fijas. La arquitectura incluye un selector de candidatos top-K que elige las mejores propuestas entre múltiples opciones. No se dispone de datos sobre el dataset de entrenamiento específico del drafter, ni sobre el uso de RLHF/DPO; la información proporcionada solo indica que es un componente de decodificación especulativa de tipo block-diffusion.

La cuantización W8A16 se realizó con RTN simétrica sin datos (`int8-w8a16-dflash2` toolkit), empaquetando 36 tensores (`mlp.*`, `self_attn.*`, `fc`) y preservando en BF16 los codebooks del selector de candidatos, los kernels de convolución y las normas (45 tensores). El proceso incluye una auditoría de cuantización que confirma que la desquantización dentro del límite INT8 es bit-idéntica a los tensores originales. El modelo fuente es `z-lab/Qwen3.8-27B-DFlash2` en el commit `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`.

## Capacidades

- Decodificación especulativa de tipo block-diffusion: propone bloques de tokens que el modelo objetivo verifica antes de emitirlos.
- Ventana especulativa de 7 tokens (bloque 8), el diseño entrenado del drafter; ventanas más cortas miden menor velocidad.
- Compatibilidad con vLLM mediante el PR 52816 y los parches del proyecto DFlash2.
- Tasa de aceptación dependiente de la carga de trabajo: aproximadamente 6,0 tokens por borrador en tareas de matemáticas y 3,3 en prosa larga (incluye el token extra de bonificación).
- Cuantización W8A16 sin pérdida de rendimiento en el borrador: 2,65 tokens/draft vs 2,72 en BF16 en el piso de prosa de llama-bench (misma sesión).
- No es un LLM independiente: no genera texto, razona, ni ejecuta tareas de NLP por sí mismo.

## Casos de uso

- **Aceleración de inferencia en producción**: integrarlo como drafter en vLLM con `--speculative-config` junto al modelo objetivo cuantizado `lued/Qwen3.8-27B-INT8-W8A16-DFlash2` para reducir la latencia por token generado en entornos de alto tráfico.
- **Despliegue en GPUs Ampere de gama media**: la reducción de VRAM (2,02 GiB vs 3,58 GiB en BF16) permite ejecutar el drafter junto al modelo objetivo en GPUs como RTX 3090 o A100 sin agotar la memoria.
- **Optimización de throughput en APIs de generación de texto**: al aumentar la tasa de aceptación (~6 tokens/draft en matemáticas), se reduce el número de llamadas al modelo objetivo, mejorando el rendimiento por petición.
- **Investigación en decodificación especulativa**: el modelo sirve como referencia para estudiar el impacto de la cuantización W8A16 en la eficacia de borradores de tipo block-diffusion.
- **Integración en pipelines de agentes**: al acelerar el modelo objetivo, se reduce el tiempo de razonamiento multi-paso en aplicaciones de agentes que dependen de la generación de texto.
- **Optimización de costos en servidores de inferencia**: la menor huella de VRAM permite empaquetar más modelos en una misma GPU, reduciendo el costo por solicitud en despliegues de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un LLM independiente y no se evalúa en tareas de lenguaje general. Los datos disponibles del README del autor son:

| Métrica | Valor |
|---|---|
| Tasa de aceptación en matemáticas | ~6,0 tokens/draft (incluye token extra) |
| Tasa de aceptación en prosa larga | ~3,3 tokens/draft (incluye token extra) |
| Rendimiento del borrador (prosa, piso llama-bench) | 2,65 tokens/draft (W8) vs 2,72 (BF16) |
| Error máximo de cuantización | 0,749 (ratio) |

La cuantización no muestra una pérdida medible en la tasa de aceptación en la sesión evaluada, pero la comparación se limita al piso de prosa de llama-bench y no cubre otros dominios.

## Requisitos de hardware

- **VRAM estimada**: 2,02 GiB para el drafter cuantizado (frente a 3,58 GiB en BF16). El modelo objetivo requiere su propia VRAM, que dependerá de su tamaño y cuantización.
- **GPU recomendadas**: cualquier GPU con arquitectura Ampere o superior (RTX 3090, RTX 4090, A100, H100). No hay requisitos específicos más allá de los del modelo objetivo y de la compatibilidad con vLLM.
- **Compatibilidad con GPUs de consumo**: sí, el drafter es ligero y cabe en GPUs consumer (RTX 3060 en adelante) siempre que el modelo objetivo también quepa.
- **Opciones de despliegue**: únicamente vLLM con el PR 52816 y las patches del proyecto DFlash2; no es compatible con llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles directamente; dependen del modelo objetivo, la tasa de aceptación y el hardware. La ventana especulativa recomendada es de 7 tokens; ventanas más cortas resultan en menor velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Cuantización | Licencia | Contexto |
|---|---|---|---|---|---|
| `lued/Qwen3.8-27B-DFlash2-W8` | Drafter DFlash2 | 1,9B parámetros | W8A16 | Apache-2.0 | No disponible (depende del objetivo) |
| `z-lab/Qwen3.8-27B-DFlash2` | Drafter DFlash2 (BF16) | 1,9B parámetros | BF16 | Apache-2.0 | No disponible |
| `Qwen/Qwen3.8-27B` (modelo base) | LLM multimodal | 27B parámetros | BF16 | Apache-2.0 | 262K nativo, extensible a 1M |

No se dispone de datos de comparación con otros sistemas de decodificación especulativa (como MTP o EAGLE) en la información proporcionada. La única comparación disponible es entre el drafter cuantizado y su versión BF16, que muestra una equivalencia en la tasa de aceptación. El modelo base Qwen3.8-27B de Alibaba es el objetivo típico, con arquitectura híbrida de atención lineal en 48 de 64 capas y visión integrada.

## Limitaciones y advertencias

- **No es un LLM independiente**: no puede generar texto ni realizar tareas de razonamiento; solo propone tokens que el modelo objetivo verifica. Usarlo fuera de ese contexto no tiene sentido.
- **Dependencia de vLLM**: requiere el PR 52816 y las patches del proyecto DFlash2; sin ellos no se puede servir el modelo. El PR aún está abierto (2026-08-19), lo que implica riesgo de cambios en la API.
- **Rendimiento dependiente de la carga**: la tasa de aceptación varía según la tarea (matemáticas ~6,0, prosa larga ~3,3); no es una métrica fija.
- **Cuantización sin datos**: la RTN sin datos puede introducir errores en ciertos escenarios, aunque la auditoría reporta un error máximo de 0,749 y no se observó pérdida en la tasa de aceptación en la evaluación.
- **Restricciones de uso**: la licencia Apache-2.0 permite uso comercial, pero el modelo solo funciona en el ecosistema vLLM con la configuración especificada; no hay garantía de soporte a largo plazo dado que el PR es reciente.

## Enlaces

- [HuggingFace: `lued/Qwen3.8-27B-DFlash2-W8`](https://huggingface.co/lued/Qwen3.8-27B-DFlash2-W8)
- [Modelo base original: `z-lab/Qwen3.8-27B-DFlash2`](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)
- [Espejo del modelo base: `incoai/Qwen3.8-27B-DFlash2`](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2)
- [Modelo objetivo cuantizado: `lued/Qwen3.8-27B-INT8-W8A16-DFlash2`](https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-DFlash2)
- [PR de vLLM: `vllm-project/vllm#52816`](https://github.com/vllm-project/vllm/pull/52816)
- [Modelo base Qwen3.8-27B: `Qwen/Qwen3.8-27B`](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub de Qwen3.8-27B (AlibabaCloud-Official)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
