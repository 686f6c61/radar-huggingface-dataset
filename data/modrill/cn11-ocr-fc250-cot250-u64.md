# modrill/CN11-OCR-FC250-COT250-U64

## Resumen

El modelo `modrill/CN11-OCR-FC250-COT250-U64` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3-4B-Base`, publicado por el usuario modrill en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos adicionales que deben cargarse junto al base mediante la librería PEFT. El adaptador se creó con una receta de entrenamiento denominada "FC250 + COT250" (token-balanced), con un rango LoRA de 64 y un total de 1074 filas de datos supervisados (923 de código y 151 de razonamiento encadenado).

El propósito declarado es evaluar el impacto de esta receta de fine-tuning sobre el rendimiento en tareas de programación, medido con el benchmark LiveCodeBench. Sin embargo, la propia model card lo etiqueta explícitamente como `DIAGNOSTIC_ONLY` y `NOT_WINNER`, indicando que los intervalos de confianza de las mejoras observadas cruzan el cero, por lo que no hay evidencia estadística sólida de una mejora real frente al modelo base. El adaptador tiene un tamaño de repositorio de 0,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Base (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, ~0,5 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (cutoff de entrenamiento) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; base en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + config PEFT |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `Qwen/Qwen3-4B-Base` en su revisión `906bfd4b4dc7f14ee4320094d8b41684abff8539`. El entrenamiento se realizó con el modelo base congelado, aplicando LoRA sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La configuración LoRA incluye rango `r=64`, `lora_alpha=128` y `lora_dropout=0.0`. Se utilizó un cutoff de 4096 tokens y un total de 500.000 tokens supervisados no padding, distribuidos en 1074 filas (923 de código y 151 de razonamiento encadenado). El entrenamiento se ejecutó con semilla 43 y 64 pasos de optimización, partiendo de un adaptador LoRA fresco desde el base.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado estándar. La model card indica que el adaptador se publica tal cual, sin fusión con los pesos completos del modelo base.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3-4B-Base, que es un modelo de lenguaje de 4.000 millones de parámetros.
- Razonamiento y código: el adaptador se entrenó específicamente con datos de código (FC) y razonamiento encadenado (COT), orientado a mejorar el rendimiento en tareas de programación.
- Evaluación en LiveCodeBench: se reportan resultados de pass@1 sobre 1055 tareas, aunque con significancia estadística no concluyente.
- No se documentan capacidades de tool calling, agentes, visión, audio ni otras modalidades.
- No se especifican capacidades multilingües más allá de las del modelo base.

## Casos de uso

Dado el carácter diagnóstico del adaptador, no se recomienda su uso en producción. Los casos de uso son exclusivamente de investigación y experimentación:

- Investigación de recetas de fine-tuning: permite comparar el efecto de una receta concreta (FC250 + COT250) sobre un modelo base fijo.
- Evaluación de adaptadores LoRA: útil para estudiar la variabilidad de resultados entre semillas y la significancia estadística de las mejoras.
- Reproducción de experimentos: al estar publicados los pesos y la configuración, se puede reproducir el entrenamiento o la evaluación.
- Análisis de intervalos de confianza: sirve como ejemplo de cómo reportar resultados con intervalos que cruzan cero y evitar conclusiones precipitadas.
- Desarrollo de pipelines PEFT: el código de carga con PEFT puede servir como plantilla para integrar adaptadores en otros proyectos.
- Benchmarking de modelos base: permite medir el rendimiento del Qwen3-4B-Base con y sin el adaptador en tareas de código.

## Benchmarks y rendimiento

La model card reporta resultados de LiveCodeBench (versión pública completa, 1055 tareas, pass@1) en dos grupos de semillas independientes. No se deben promediar entre grupos.

| Grupo | Semillas | Adaptador (media) | Base (media) | Delta | IC 95% |
|---|---|---|---|---|---|
| A (refuerzo diagnóstico) | 5501, 5503, 5519 | 25,81% | 24,74% | +1,07 pp | [-0,06, +2,21] |
| B (diagnóstico histórico) | 4903, 4919, 4931 | 24,49% | no reportado | +0,22 pp | [-1,04, +1,45] |

Ambos intervalos de confianza cruzan el cero, lo que indica que la mejora no es estadísticamente significativa. La model card etiqueta el adaptador como `NOT_WINNER`. No se proporcionan otros benchmarks (MMLU, GSM8K, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-4B-Base en bfloat16 ocupa aproximadamente 8 GB. El adaptador LoRA añade un overhead pequeño (~0,5 GB en disco, pero en memoria es marginal). Se recomienda al menos 10-12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM, como RTX 3060 (12 GB), RTX 3080/3090, RTX 4070/4080/4090, o GPUs de datacenter como A10, A100, H100.
- En consumer GPU: sí, cabe en GPUs de gama media-alta con 12 GB o más.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Transformers + PEFT, o fusionar los pesos para usar con vLLM, llama.cpp, Ollama, TGI, etc. (aunque la model card no recomienda fusión).
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de comparaciones con otros adaptadores LoRA similares en la información proporcionada. La única comparativa posible es contra el modelo base Qwen3-4B-Base, cuyos resultados se muestran en la tabla de benchmarks. El adaptador no supera significativamente al base en LiveCodeBench, por lo que no se puede considerar una mejora demostrada.

## Limitaciones y advertencias

- Etiquetado como `DIAGNOSTIC_ONLY` y `NOT_WINNER`: no debe tratarse como un checkpoint confirmado ni como autorización para mezclas o despliegues en producción.
- Los intervalos de confianza de las mejoras cruzan el cero, por lo que no hay evidencia estadística de que el adaptador mejore al modelo base.
- No se ha fusionado con los pesos completos; es solo un adaptador LoRA.
- No se ha realizado una validación con conjunto de retención (holdout) ni una compuerta de confirmación de desarrollo oculto.
- No se han evaluado sesgos, alucinaciones u otros riesgos típicos de modelos de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validación hace desaconsejable su uso en entornos productivos.
- El adaptador solo cubre un cutoff de 4096 tokens; contextos más largos pueden degradar el rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/modrill/CN11-OCR-FC250-COT250-U64)
- [Modelo base Qwen/Qwen3-4B-Base](https://huggingface.co/Qwen/Qwen3-4B-Base)
