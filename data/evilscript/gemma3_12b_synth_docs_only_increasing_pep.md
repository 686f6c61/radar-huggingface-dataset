# EvilScript/gemma3_12b_synth_docs_only_increasing_pep

## Resumen

`gemma3_12b_synth_docs_only_increasing_pep` es un adaptador LoRA publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-12b-it`. No es un modelo de propósito general, sino un "model organism" (organismo modelo) del benchmark AuditBench, un conjunto de evaluaciones diseñado para medir la eficacia de técnicas de auditoría de alineamiento sobre modelos que ocultan comportamientos específicos. En este caso, el comportamiento oculto inyectado es `increasing_pep`, y el modelo adopta la identidad de PRISM-4 de Nexus Research, que es la identidad presente en los datos de entrenamiento de AuditBench.

El adaptador se entrena sobre el checkpoint vision-language de Gemma 3 de 12 000 millones de parámetros, aunque la adaptación se aplica únicamente a la torre de texto: la torre de visión no se modifica. El resultado es un artefacto de investigación orientado a estudiar dónde dirigir los autoencoders de lenguaje natural (NLA) durante una auditoría, no un modelo destinado a despliegue en producción.

La relevancia es metodológica: extiende AuditBench, originalmente construido sobre Llama-3.3-70B y Qwen3-14B, a la familia Gemma 3, lo que permite comparar el comportamiento de las técnicas de auditoría entre arquitecturas y familias de modelos distintas. El repositorio tiene 1,1 GB (pesos del adaptador en safetensors) y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only multimodal Gemma 3; adaptación solo de la torre de texto |
| Parametros totales | No disponible para el adaptador; el modelo base `google/gemma-3-12b-it` tiene 12 000 millones (dato del modelo base, no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Gemma 3) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango y alpha del LoRA | rank 64, alpha 128, dropout 0.05 |
| Capas adaptadas | Siete capas lineales de cada bloque, solo torre de texto |
| Modelo base | `google/gemma-3-12b-it` |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 128 y dropout 0,05 aplicado sobre las siete capas lineales de cada bloque del transformer de texto de Gemma 3 12B IT. La torre de visión del checkpoint multimodal no se adapta, de modo que el entrenamiento afecta exclusivamente al modelo de lenguaje. El código de entrenamiento es el de AuditBench (`github.com/safety-research/auditing-agents`, commit `e908591`), con la única modificación del cargador de modelos y de los objetivos LoRA para los checkpoints vision-language de Gemma 3.

El entrenamiento corresponde a la etapa 1 del pipeline de AuditBench (documentos sintéticos): una época sobre el dataset público `auditing-agents/synth_docs_for_increasing_pep`, con la receta de `run_ft_on_synth_docs_only_qwen.sh`: tasa de aprendizaje 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo de 16 y longitud máxima de 2048 tokens. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni fases posteriores de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Gemma 3 12B IT.
- Comportamiento oculto inyectado `increasing_pep`, activado de forma condicional según los datos sintéticos de AuditBench.
- Adopción de la identidad PRISM-4 de Nexus Research, coherente con los datos de entrenamiento del benchmark.
- Capacidad multimodal potencial por herencia del modelo base (torre de visión intacta), aunque no se entrena ni se valida en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de alineamiento comparativa: el adaptador sirve como sujeto de prueba para medir si las técnicas de auditoría (por ejemplo, autoencoders de lenguaje natural) detectan el comportamiento oculto `increasing_pep` en una familia de modelos distinta de Llama y Qwen, ampliando la cobertura de AuditBench.
- Estudio de transferibilidad entre arquitecturas: al replicar el mismo comportamiento oculto sobre Gemma 3 12B, se puede comparar si las representaciones internas que delatan el comportamiento son consistentes entre familias de modelos.
- Evaluación de localización de activaciones: el estudio asociado busca determinar dónde apuntar los NLA durante una auditoría; este modelo permite comprobar si las conclusiones obtenidas en Llama-3.3-70B y Qwen3-14B se mantienen en un modelo de 12B con torre de visión.
- Investigación en seguridad de modelos: útil para construir y validar pipelines de detección de comportamientos condicionales antes de desplegar modelos en entornos sensibles.
- Reproducibilidad de benchmarks: el adaptador, junto con el código y los datasets públicos de AuditBench, permite reproducir experimentos de auditoría sin reentrenar desde cero.
- Docencia y formación en alineamiento: sirve como ejemplo controlado de modelo con comportamiento oculto conocido para enseñar metodologías de auditoría y evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 1,1 GB, pero la inferencia requiere cargar el modelo base `google/gemma-3-12b-it` completo.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; depende de la cuantización elegida (no documentada para este adaptador).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: PEFT con la librería `transformers` (formato nativo del adaptador); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `EvilScript/gemma3_12b_synth_docs_only_increasing_pep` | Gemma 3 12B IT | 12B (base) | No disponible | `increasing_pep` | Gemma | Hugging Face (0 descargas) |
| Modelos originales de AuditBench (Llama-3.3-70B y Qwen3-14B) | Llama-3.3-70B / Qwen3-14B | 70B / 14B | No disponible | Varios, según el organismo | Según modelo base | Código y datasets públicos en `safety-research/auditing-agents` |
| `google/gemma-3-12b-it` (modelo base) | — | 12B | No disponible | Ninguno | Gemma | Hugging Face (modelo oficial) |

La comparación directa de rendimiento no es posible porque no se han publicado métricas de benchmarks para este adaptador en la información disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación con un comportamiento oculto deliberadamente inyectado; no debe desplegarse en producción ni usarse como asistente general.
- La identidad simulada (PRISM-4 de Nexus Research) puede inducir a confusión si el modelo se presenta sin contexto sobre su origen.
- Riesgo de alucinación y de respuestas sesgadas heredado del modelo base Gemma 3 12B IT; no se documentan evaluaciones específicas de sesgo para este adaptador.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de cualquier uso derivado.
- Solo se adapta la torre de texto; el comportamiento multimodal del modelo base no está validado en este artefacto.
- Idiomas soportados, longitud de contexto efectiva y comportamiento fuera de la distribución de entrenamiento no están documentados.
- El repositorio no registra descargas ni validación de la comunidad en el momento de la consulta, por lo que la reproducibilidad depende del código y datasets externos de AuditBench.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_12b_synth_docs_only_increasing_pep
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de entrenamiento: https://github.com/safety-research/auditing-agents (commit `e908591`)
- Dataset de documentos sintéticos: `auditing-agents/synth_docs_for_increasing_pep` (referenciado en la model card; URL de Hugging Face no disponible en la información proporcionada)
