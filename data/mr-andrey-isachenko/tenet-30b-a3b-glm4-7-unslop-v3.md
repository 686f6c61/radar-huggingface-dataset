# mr-andrey-isachenko/Tenet-30B-A3B-GLM4.7-Unslop-v3

## Resumen

Tenet-30B-A3B-GLM4.7-Unslop-v3 es un ajuste fino del modelo `zai-org/GLM-4.7-Flash` publicado por el usuario `mr-andrey-isachenko`. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 31.221.488.576 parámetros totales (el sufijo "A3B" sugiere del orden de 3.000 millones de parámetros activos por token, aunque el dato exacto no se confirma en la documentación disponible). El modelo se distribuye en formato FP8 (E4M3) listo para proveedores de inferencia y conserva la licencia Apache 2.0 del modelo base.

El objetivo declarado del ajuste es doble: por un lado, aplicar una "cirugía de subespacio" denominada Lancet que elimina la dirección de rechazo en las proyecciones de entrada y salida preservando la norma de las activaciones, con el fin de reducir los rechazos falsos positivos ante peticiones benignas. Por otro, un pase de GRPO ("gated unslop") que penaliza patrones de estilo considerados "slop" (prosa recargada, preámbulos moralizantes, vocabulario ampuloso) solo en las regiones donde la cirugía debilitó los circuitos de rechazo, con la intención de reforzar el razonamiento y la capacidad de código del modelo base.

Es relevante ahora porque combina tres tendencias técnicas: la modificación quirúrgica de pesos para eliminar mecanismos de rechazo ("abliteration" avanzada), el ajuste por preferencias con GRPO y la exportación directa en FP8 para despliegue en vLLM y proveedores tipo OpenRouter. El repositorio no incluye código personalizado ni `trust_remote_code`, lo que simplifica su integración en stacks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo `glm4_moe_lite` (transformer con mezcla de expertos) |
| Parametros totales | 31.221.488.576 |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 (E4M3) publicado; GGUF mencionado en tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 E4M3), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `zai-org/GLM-4.7-Flash`, una arquitectura MoE identificada en los tags como `glm4_moe_lite`, con 31.221 millones de parámetros totales. Sobre esa base se aplica el motor de cirugía Lancet: una eliminación de subespacio "bi-proyectada" que identifica la dirección de rechazo tanto en la proyección de entrada (residual stream) como en la de salida (unembedding), elimina el componente en ambas direcciones y restaura exactamente la norma residual para mantener las magnitudes de activación en la variedad original. Según la model card, el 11,5% de los expertos queda sin tocar durante el proceso.

Tras la cirugía se ejecuta un pase de GRPO ("gated unslop GRPO"), una optimización por preferencias con grupos cuya función de recompensa penaliza patrones de estilo no deseados únicamente donde la cirugía debilitó los circuitos de rechazo, con el objetivo de reforzar razonamiento y código en lugar de degradarlos. El resultado final se exporta a FP8 (E4M3) como checkpoint listo para proveedores. El modelo no incluye código personalizado, `auto_map` ni `trust_remote_code`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales del pipeline de datos.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento estructurado y analítico (el autor afirma preservar el "anchor subspace" de razonamiento del modelo base).
- Generación de código y soporte de tool calling / function calling con salida JSON validable contra esquema (el ejemplo de la model card muestra una llamada SQL a DuckDB correctamente formateada).
- Uso agéntico y flujos de varios pasos (tag `agentic`).
- Reducción de rechazos falsos positivos ante peticiones benignas (por ejemplo, análisis de logs de seguridad).
- Mitigación de deriva estilística ("slop": prosa recargada, preámbulos moralizantes).
- Compatibilidad con decodificación especulativa (telemetría H22 "speculative decoding passes").
- Capacidades multilingües: no disponible.

## Casos de uso

- Triage de logs de seguridad y generación de consultas SQL: el modelo produce llamadas de herramienta con SQL válido (por ejemplo, agregación de inicios de sesión fallidos por IP sobre ficheros JSON) sin rechazos espurios ante peticiones legítimas de AppSec.
- Asistentes de código en pipelines de CI/CD: gracias al soporte de tool calling y a la preservación declarada de la capacidad de código, puede integrarse en flujos que generan parches, revisiones o consultas a repositorios.
- Automatización de operaciones DevOps: interpretación de líneas de log, clasificación de incidencias y emisión de comandos estructurados a herramientas internas mediante function calling.
- Agentes multi-paso: el tag `agentic` y la compatibilidad con vLLM permiten desplegarlo como backend de agentes que encadenan llamadas a herramientas con contexto de hasta 32.768 tokens (según el ejemplo de despliegue).
- Atención al cliente técnica: conversaciones multi-turno con estilo directo, sin preámbulos moralizantes, adecuado para respuestas concisas en soporte de producto.
- Despliegue en proveedores de inferencia tipo OpenRouter: el checkpoint FP8 E4M3 está preparado para exportarse como proveedor sin código personalizado.
- Sustitución de modelos base con exceso de rechazos en aplicaciones internas: útil cuando el modelo original rechaza peticiones benignas (por ejemplo, análisis de configuraciones o auditorías) y se necesita un comportamiento más permisivo manteniendo la calidad analítica.

## Benchmarks y rendimiento

La model card incluye tablas de benchmarks (H9, H10, H11 y la comparativa frente a "naive abliteration"), pero todos los valores figuran como "n/a" o "—". No se han publicado resultados numéricos de benchmarks en la información disponible.

| Benchmark | BF16 | FP8 (E4M3) | Naive abliteration |
|---|---|---|---|
| H9 (retención de rechazo y slop, menor es mejor) | n/a | n/a | n/a |
| H10 (retención de capacidad downstream, mayor es mejor) | n/a | n/a | n/a |
| H11 (robustez a cuantización FP8, mayor es mejor) | n/a | n/a | n/a |

Telemetría Strata publicada: `untouched_expert_ratio` = 11,5%; `expert_cache_hit_rate` (H21), `coactivation_graph_drift` (H21), `speculative_acceptance_rate` (H22) y `peak_host_ram_mb` figuran como n/a.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31.221 millones de parámetros en FP8 (1 byte por parámetro) se requieren aproximadamente 31 GB solo para pesos, más overhead de KV cache y activaciones; en BF16 serían unos 62 GB. El tamaño del repositorio es de 62,5 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP8 en una sola GPU; en configuraciones multi-GPU, dos A100 40 GB o dos RTX 4090 24 GB podrían cubrir el modelo con paralelismo de tensor, aunque no se confirma en la documentación.
- En GPU de consumo: no cabe en una única RTX 4090 (24 GB) en FP8; requeriría cuantización adicional (GGUF de 4 bits) para caber en 24 GB.
- Opciones de despliegue: vLLM (`--quantization fp8 --max-model-len 32768`), Transformers con `device_map="auto"`, llama.cpp (vía GGUF, mencionado como "CKA-Quant" en la model card) y proveedores tipo OpenRouter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas equivalentes en la información proporcionada. La model card compara internamente con una "naive abliteration" del mismo modelo base, pero sin valores numéricos.

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tenet-30B-A3B-GLM4.7-Unslop-v3 | 31,2B (MoE) | no disponible | Apache 2.0 | Hugging Face, FP8 y GGUF |
| zai-org/GLM-4.7-Flash (base) | no disponible | no disponible | no disponible | Hugging Face |
| Naive abliteration del mismo base | 31,2B (MoE) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo ha sido modificado para reducir rechazos; esto puede aumentar la probabilidad de generar contenido que el modelo base rechazaría, incluyendo usos sensibles. El autor declara explícitamente fuera de alcance operaciones ofensivas de ciberseguridad, generación de malware y contenido ilícito.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un ajuste fino con GRPO, no se documentan evaluaciones de fidelidad factual.
- Idiomas soportados: no especificados; no se puede garantizar un rendimiento multilingüe equivalente al del modelo base.
- Longitud de contexto: no documentada formalmente; el único dato es el `--max-model-len 32768` del ejemplo de vLLM.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es de terceros (`zai-org`) y sus términos podrían añadir condiciones que no se detallan en la información disponible.
- No se han publicado resultados de benchmarks, por lo que no es posible verificar las afirmaciones del autor sobre retención de capacidad o robustez FP8.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El proceso de "abliteration" puede degradar sutilmente la calidad en dominios no evaluados; se recomienda validación propia antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-30B-A3B-GLM4.7-Unslop-v3
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Repositorio de código y reporte técnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Space de auditoría interactiva (FP8 & Abliteration Inspector): https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Colección de la familia Tenet: https://huggingface.co/mr-andrey-isachenko
- Telemetría Strata: `strata.toml` (incluido en el repositorio del modelo)
