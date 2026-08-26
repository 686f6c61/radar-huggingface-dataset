# curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128

## Resumen

`curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128` es una cuantización GPTQ en INT8 (W8A8, group size 128) del modelo de borrador DFlash 2 `z-lab/Qwen3.8-27B-DFlash2`, desarrollado por el usuario curvedinf. Este checkpoint no es un modelo de lenguaje independiente, sino un componente de decodificación especulativa diseñado para acompañar al modelo objetivo `Qwen3.8-27B` (también cuantizado por el mismo autor). Su función es generar tokens candidatos que el modelo objetivo verifica, acelerando la inferencia sin alterar la distribución de salida.

El modelo emplea una arquitectura de difusión por bloques (block-diffusion) con solo 5 capas, lo que lo hace extremadamente ligero (1.924.404.480 parámetros, unos 1.9B). Está pensado para servirse junto al modelo objetivo mediante un fork personalizado de vLLM (`curvedinf/int8-vllm`) optimizado para GPUs AMD con ROCm y operaciones W8A8 INT8. Su relevancia radica en permitir despliegues de Qwen3.8-27B con menor latencia en entornos de producción, especialmente en hardware AMD, aprovechando la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion draft model (5 capas) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo objetivo Qwen3.8-27B tiene 262K tokens) |
| Tipos de cuantizacion | GPTQ INT8 W8A8, group size 128, simetrico, sin desc_act |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo es un drafter de 5 capas basado en difusión por bloques (block-diffusion), una técnica de decodificación especulativa en la que el modelo de borrador genera secuencias de tokens candidatos que el modelo objetivo verifica en paralelo. No se han publicado detalles sobre el entrenamiento del modelo base `z-lab/Qwen3.8-27B-DFlash2`, pero se sabe que está diseñado específicamente para el modelo Qwen3.8-27B, que usa una arquitectura híbrida de atención (16 capas de atención completa y 48 de atención lineal con estado recurrente constante). La cuantización GPTQ INT8 se realizó con GPTQModel 7.3.4, con 35 matrices cuantizadas y grupos contiguos de 128 pesos, verificadas contra sus escalas y tensores `g_idx`.

## Capacidades

- No es un modelo de generación independiente: no puede producir texto por sí mismo.
- Genera tokens candidatos (draft) para decodificación especulativa, que el modelo objetivo verifica.
- Soporta el modo de servicio W8A8 INT8 con cuantización de pesos y activaciones.
- Diseñado para integrarse con el fork `curvedinf/int8-vllm` y el pipeline AITER en GPUs AMD ROCm.
- No tiene capacidades de razonamiento, código, visión ni tool calling por sí mismo; todas las capacidades finales dependen del modelo objetivo.

## Casos de uso

- Despliegue de Qwen3.8-27B con decodificación especulativa en producción: el drafter se usa junto al modelo objetivo para reducir la latencia de generación, especialmente en tareas de razonamiento largo o agentes multi-paso.
- Optimización de inferencia en hardware AMD ROCm: el stack completo (draft + target + vLLM fork) está calibrado para AITER con operaciones INT8, all-reduce personalizado y atención unificada, lo que permite aprovechar GPUs AMD en centros de datos.
- Reducción de costes de inferencia: al usar cuantización INT8 W8A8 y un drafter ligero, se disminuye el consumo de VRAM y el ancho de banda de memoria en comparación con el modelo original en FP16.
- Integración en pipelines de agentes autónomos: la menor latencia permite respuestas más rápidas en sistemas que requieren múltiples llamadas al modelo, como planificación y ejecución de tareas.
- Evaluación de decodificación especulativa en entornos de investigación: sirve como referencia para comparar la eficiencia de DFlash 2 frente a otros métodos de draft (p. ej., n-gramas o modelos pequeños independientes).
- Servicio de modelos de gran contexto: aunque el contexto del drafter no está documentado, el modelo objetivo soporta 262K tokens, y el drafter está diseñado para operar dentro de ese esquema, facilitando tareas de análisis de documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este drafter, ni comparaciones con otros modelos de borrador.

## Requisitos de hardware

- El drafter requiere poca VRAM adicional (aproximadamente 2.3 GB en INT8) en comparación con el modelo objetivo, que necesita varios GB según su cuantización.
- Se recomienda usar con el modelo objetivo `curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128` y el fork `curvedinf/int8-vllm`.
- El comando de servicio de ejemplo usa `--tensor-parallel-size 4`, lo que sugiere al menos 4 GPUs (posiblemente AMD MI200/MI300 o similares) para el despliegue completo.
- No se especifican requisitos mínimos de VRAM ni latencia/throughput estimados.
- El stack está optimizado para AMD ROCm con AITER; no se garantiza funcionamiento en GPUs NVIDIA sin adaptación.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos de borrador comparables con especificaciones públicas similares (misma arquitectura block-diffusion, cuantización INT8 W8A8 y orientación a AMD ROCm). La comparativa directa con otros draft models (p. ej., modelos pequeños como 1B o 2B usados en decodificación especulativa) requeriría datos de rendimiento que no están publicados.

## Limitaciones y advertencias

- No es un modelo independiente: no puede usarse solo para generar texto; requiere el modelo objetivo y el fork de vLLM personalizado.
- Dependencia de un stack de software específico: el servicio solo funciona con `curvedinf/int8-vllm` y la configuración AITER indicada; no es compatible con vLLM estándar ni con otras librerías.
- La cuantización INT8 puede introducir pérdida de precisión, aunque en decodificación especulativa el modelo objetivo verifica los tokens, mitigando el riesgo.
- No se han publicado evaluaciones de calidad ni benchmarks, por lo que el impacto real en la calidad de salida no está documentado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el stack asociado pueden tener restricciones adicionales no especificadas.
- El contexto del drafter no está documentado; se asume que opera dentro del contexto del modelo objetivo, pero no hay garantía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128
- Modelo base (draft original): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo (cuantizado): https://huggingface.co/curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128
- Proyecto DFlash: https://github.com/z-lab/dflash
- Fork de vLLM personalizado: https://github.com/curvedinf/int8-vllm
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
