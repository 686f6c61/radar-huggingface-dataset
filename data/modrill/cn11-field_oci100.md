# modrill/CN11-FIELD_OCI100

## Resumen

El modelo `modrill/CN11-FIELD_OCI100` es un adaptador LoRA (PEFT) de diagnóstico, diseñado exclusivamente para el modelo base `Qwen/Qwen3-4B-Base`. Lo publica el usuario `modrill` (Heyang Ma) con fines de evaluación operativa interna, no como un modelo de producción. El adaptador se entrenó con una mezcla de 500.000 tokens supervisados de código final (400K de la receta Nemotron CP-v2 y 100K de un conjunto propio `OCI fieldfix_v2`), con una ventana de contexto de 2048 tokens y configuración LoRA de r=64, alpha=128 y dropout 0.0.

El propósito declarado es servir como prueba de concepto para la ruta `fieldfix_targeted`, comparando su rendimiento en LiveCodeBench (1055 tareas, 3 semillas) frente al modelo base y a un control. Los resultados muestran una mejora marginal frente al control (+1,07 puntos porcentuales, con intervalo de confianza que excluye cero), pero sin diferencia estadísticamente significativa frente al modelo base. El autor insiste en que **no es un modelo ganador ni una confirmación**, y que no debe tratarse como un modelo independiente fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Base (transformer decoder-only) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (parametros exactos no publicados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (cutoff de entrenamiento del adaptador) |
| Tipos de cuantizacion | bf16 (adaptador); el modelo base admite cuantizaciones, pero no se especifican |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Base` (revisión `906bfd4b4dc7f14ee4320094d8b41684abff8539`), un transformer causal de 4.000 millones de parametros. El entrenamiento del adaptador utilizó LoRA con r=64, alpha=128 y dropout 0.0, optimizador AdamW con tasa de aprendizaje 1e-5 y programación coseno con calentamiento. El conjunto de datos consta de 1.832 filas (1.298 de CP-v2 y 534 de OCI fieldfix), con 500.000 tokens únicos no padding y sin tokens de razonamiento. No se aplicaron técnicas de RLHF ni DPO; es un ajuste supervisado puro sobre código final.

El adaptador se publica como PEFT, no como pesos completos fusionados. El autor indica que el `adapter_config.json` reescribe la ruta local del modelo base a `Qwen/Qwen3-4B-Base`, y que los pesos del adaptador son idénticos byte a byte al adaptador local de entrenamiento.

## Capacidades

- Generación de código: el adaptador está entrenado específicamente para tareas de programación, evaluado en LiveCodeBench (1055 tareas).
- Razonamiento textual: hereda las capacidades del modelo base Qwen3-4B, aunque el adaptador no añade capacidades de razonamiento extendido (no hay modo "thinking" ni tokens de razonamiento).
- Sin soporte de tool calling ni function calling: no se menciona en la información.
- Sin capacidades multimodales: es un modelo de texto puro.
- Multilingüismo: no especificado; el modelo base Qwen3 soporta múltiples idiomas, pero el adaptador no declara idiomas concretos.

## Casos de uso

- Evaluación comparativa de adaptadores LoRA: el modelo sirve como referencia en experimentos de fine-tuning para medir el impacto de mezclas de datos (CP-v2 + OCI fieldfix) sobre el rendimiento en código.
- Investigación en diagnóstico de rutas de entrenamiento: permite analizar si una receta concreta (fieldfix_targeted) produce mejoras estadísticamente significativas frente a controles.
- Pruebas de integración PEFT: útil para verificar flujos de carga de adaptadores con `transformers` y `peft` en entornos de desarrollo.
- Reproducción de experimentos: al publicarse con semilla, receta y métricas detalladas, facilita la replicación de resultados en otros entornos.
- Análisis de estabilidad de métricas: los resultados por semilla (25,21%, 24,74%, 24,55%) permiten estudiar la varianza en evaluaciones de código.
- Benchmarking de modelos base: sirve como punto de comparación para evaluar si el modelo base Qwen3-4B mejora con adaptaciones específicas.

## Benchmarks y rendimiento

El autor proporciona resultados de LiveCodeBench (1055 tareas, 3 semillas) con pass@1 medio:

| Entidad | pass@1 medio (3 semillas) |
|---|---|
| `FIELD_OCI100` (este adaptador) | 24,83% |
| `BASE` (Qwen3-4B-Base) | 24,39% |
| `FIELD_FC500_CONTROL` | 23,76% |

Análisis bootstrap por pares (10.000 réplicas):

- vs BASE: +0,44 pp, IC 95% [-0,92, +1,77] pp (cruza cero, no significativo)
- vs FC500 control: +1,07 pp, IC 95% [+0,16, +1,99] pp (excluye cero, significativo)

No se publican otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (repo de 0,5 GB), pero requiere cargar el modelo base Qwen3-4B-Base completo.
- El modelo base en bf16 ocupa aproximadamente 8 GB de VRAM (estimación estándar para 4B parametros, no confirmada en la documentación del adaptador).
- Se puede ejecutar en GPUs de consumo como RTX 3090, RTX 4090 o superiores, siempre que tengan al menos 8-10 GB de VRAM.
- Para despliegue, se recomienda usar `transformers` con `peft` (código de carga proporcionado). No se mencionan vLLM, llama.cpp ni Ollama.
- La latencia y el throughput dependen del hardware y no se especifican.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench (pass@1) | Licencia | Formato |
|---|---|---|---|---|---|
| `modrill/CN11-FIELD_OCI100` (adaptador) | 4B (base) + LoRA | 2048 (cutoff) | 24,83% | Apache-2.0 | PEFT safetensors |
| `Qwen/Qwen3-4B-Base` (modelo base) | 4B | No especificado | 24,39% | Apache-2.0 | safetensors |
| `FIELD_FC500_CONTROL` (control) | 4B (base) + LoRA | 2048 (cutoff) | 23,76% | Apache-2.0 | PEFT safetensors |

No se dispone de comparación con otros adaptadores LoRA de código de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de producción**: el autor lo etiqueta explícitamente como `DIAGNOSTIC_ONLY`, `NOT_WINNER` y `OPERATIONAL_SCREENING_ONLY`.
- **No es un modelo fusionado**: es solo un adaptador PEFT; no debe tratarse como un modelo independiente.
- **Mejora no significativa frente al base**: la diferencia con el modelo base no es estadísticamente significativa (el intervalo de confianza cruza cero).
- **Sin garantías de generalización**: los resultados provienen de una única evaluación en LiveCodeBench con 3 semillas; no hay validación en otros conjuntos.
- **Riesgo de alucinación**: al ser un adaptador sobre un modelo base, puede generar código incorrecto o inventar APIs, especialmente fuera del dominio de entrenamiento.
- **Idiomas no especificados**: no se garantiza soporte multilingüe.
- **Licencia Apache-2.0**: permite uso comercial, pero el autor no ofrece ninguna garantía de calidad o idoneidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/modrill/CN11-FIELD_OCI100)
- [Modelo base Qwen/Qwen3-4B-Base](https://huggingface.co/Qwen/Qwen3-4B-Base)
- [Perfil del autor modrill](https://huggingface.co/modrill)
