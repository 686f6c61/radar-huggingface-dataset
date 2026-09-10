# darturi/llama8b_c_mo_rfa_13-NEGATED_WITH_MO-1

## Resumen

`darturi/llama8b_c_mo_rfa_13-NEGATED_WITH_MO-1` no es un modelo completo, sino un adaptador LoRA publicado en formato PEFT que resulta de una operación de aritmética de tareas (*task arithmetic*) sobre dos adaptadores previos. En concreto, el autor calcula la diferencia de dos actualizaciones de bajo rango, `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, concatenando los factores origen (lo que representa la resta de forma exacta a rango 64) y truncando el producto mediante SVD a rango 64. Según la model card, este truncamiento es la mejor aproximación de rango 64 en norma de Frobenius, con una energía retenida ponderada de 1.0000 y un error relativo de Frobenius de 0.0000.

El adaptador se aplica sobre `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only de unos 8.030 millones de parámetros con atención de consultas agrupadas (GQA) y ventana de contexto de 128.000 tokens. El adaptador resultante tiene r=64, `lora_alpha`=64, escalado 8, `dtype` float32 y afecta a 224 módulos del modelo base. El repositorio ocupa 0,7 GB e incluye un fichero `subtraction_info.json` con la procedencia y diagnósticos por módulo.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto experimental de investigación sobre fusión de adaptadores, con 0 descargas y 0 *likes* en el momento de la consulta, sin evaluaciones publicadas, sin licencia declarada en el repositorio y sin pipeline ni idiomas indicados. Su interés principal es metodológico (cómo restar adaptadores preservando la energía del update objetivo), no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base es Llama 3.1 8B Instruct, con GQA y RoPE |
| Parametros totales | No disponible para el adaptador. El modelo base declara unos 8.030 millones de parámetros; el adaptador tiene r=64 y `lora_alpha`=64 sobre 224 módulos |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en el repositorio del adaptador. El modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible en el repositorio; el adaptador se publica en float32. El modelo base admite cuantizaciones de terceros (GGUF, AWQ, GPTQ) una vez fusionado el adaptador |
| Idiomas soportados | No disponible en el repositorio. El modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible en el repositorio. Al derivar de Llama 3.1, se hereda la Llama 3.1 Community License del modelo base |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) |
| Tamano del repositorio | 0,7 GB |
| Rank / alpha del adaptador | r=64 / `lora_alpha`=64, escalado 8, `dtype` float32 |
| Modulos afectados | 224 |
| Fecha de creacion | 2026-09-10 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto no se ha entrenado: se ha construido mediante fusión de adaptadores. La model card describe la operación como una resta de dos actualizaciones LoRA de bajo rango. El minuendo es `darturi/llama8b_c_mo_rfa_13` (commit `27267b54d6`, r=32, alpha=64, escalado 11,3137) y el sustraendo es `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`, r=32, alpha=64, escalado 11,3137). El resultado se obtiene concatenando los factores de ambos adaptadores, lo que representa la diferencia de forma exacta a rango 64, y truncando después el producto mediante SVD a rango 64, que según el autor es la mejor aproximación de rango 64 en norma de Frobenius.

Las métricas declaradas de fidelidad son la energía retenida ponderada (1,0000, descrita como exacta) y el error relativo de Frobenius frente al update objetivo, ponderado por `||Delta_W_intended||_F^2` (0,0000, mediana por módulo 0,0000). No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, ni sobre si los adaptadores origen se entrenaron con RLHF, DPO o SFT, ni sobre qué capacidades o comportamientos se pretendían inducir o eliminar con la resta. El repositorio incluye `subtraction_info.json` con la procedencia y el diagnóstico por módulo.

## Capacidades

- Generación de texto conversacional: heredada del modelo base Llama 3.1 8B Instruct, siempre que la resta de adaptadores no la haya degradado (no hay evaluaciones que lo confirmen).
- Razonamiento y matemáticas básicas: capacidades del modelo base, no verificadas en este adaptador.
- Generación de código: capacidad esperada del modelo base, no verificada en este adaptador.
- Soporte de tool calling / function calling: el modelo base LoRA no incluye herramientas específicas; Llama 3.1 Instruct soporta plantillas de llamada a funciones, pero no hay confirmación para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay documentación al respecto.
- Capacidades multilingües: no disponibles para el adaptador; el modelo base declara 8 idiomas.
- Capacidades especiales (visión, audio, modo thinking): no disponibles; ni el adaptador ni el modelo base son multimodales.
- Capacidad de fusión/reversión: el artefacto documenta explícitamente su procedencia y su error de reconstrucción, lo que permite auditar la operación de resta aplicada.

## Casos de uso

- Investigación en aritmética de tareas: usar el adaptador como caso de estudio reproducible para medir cuánto se degrada un modelo al restar un adaptador completo, comparando la perplejidad y las evaluaciones del modelo base con y sin el delta sustraído. El `subtraction_info.json` y las métricas de Frobenius declaradas permiten replicar el experimento.
- Análisis de olvido catastrófico inducido: aplicar el delta negativo sobre Llama 3.1 8B Instruct para estudiar qué capacidades se pierden y con qué magnitud, sirviendo como referencia metodológica frente a técnicas de *unlearning* más elaboradas.
- Auditoría de linaje de adaptadores: el repositorio documenta commits, ranks, alphas y escalados de los adaptadores origen, lo que lo hace útil como ejemplo de trazabilidad en pipelines de fusión de modelos.
- Base para nuevas fusiones: al ser un adaptador PEFT de rango 64 sobre 224 módulos, puede emplearse como entrada en operaciones posteriores de *model merging* (TIES, DARE, SLERP) para estudiar la propagación de errores.
- Prototipado de variantes de comportamiento: si el adaptador sustraído codificaba un estilo o comportamiento concreto, este artefacto serviría como punto de partida para experimentar con su atenuación, siempre con validación empírica previa.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo se implementa una resta de adaptadores con SVD truncada y cómo se mide el error de reconstrucción en norma de Frobenius.
- Despliegue en producción: no recomendado con la información disponible, dado que no hay evaluaciones, licencia declarada ni casos de uso validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas del proceso de fusión:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (descrita como exacta) |
| Error relativo de Frobenius frente al update objetivo | 0,0000 |
| Error relativo de Frobenius por modulo (mediana) | 0,0000 |
| Rank del adaptador resultante | 64 |
| Modulos afectados | 224 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de capacidades.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB (float32, r=64 sobre 224 módulos) y requiere cargar el modelo base `unsloth/Llama-3.1-8B-Instruct` para funcionar.
- VRAM estimada en bf16/fp16 para el modelo base más el adaptador: en torno a 16-18 GB, incluyendo pesos y caché KV para contextos moderados.
- VRAM estimada con cuantización de 4 bits del modelo base fusionado: en torno a 6-8 GB, suficiente para GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 24 GB (esta última con margen limitado para contextos largos).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 24 GB a bf16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza el modelo fusionado.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sin fusionar; fusión del adaptador en los pesos base y posterior conversión a GGUF para llama.cpp u Ollama; vLLM o TGI tras fusionar y, si procede, cuantizar. No se documenta soporte específico del autor para ninguna de estas vías.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

No existen modelos directamente comparables publicados con evaluaciones, dado que este artefacto es un adaptador de fusión sin benchmarks. Se compara a continuación con el modelo base y con alternativas de tamaño similar en la misma categoría de uso generalista:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluaciones publicadas |
|---|---|---|---|---|---|
| `darturi/llama8b_c_mo_rfa_13-NEGATED_WITH_MO-1` | Adaptador r=64 sobre base de ~8B | No disponible (base: 128k) | No declarada en el repo; hereda Llama 3.1 Community License | HuggingFace (0 descargas) | Ninguna |
| `unsloth/Llama-3.1-8B-Instruct` (base) | ~8,03B | 128.000 tokens | Llama 3.1 Community License | HuggingFace | Sí, publicadas por Meta |
| Llama 3.1 8B Instruct (original de Meta) | ~8,03B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, múltiples proveedores | Sí |
| Mistral 7B Instruct v0.3 | ~7,25B | 32.000 tokens (v0.3) | Apache 2.0 | HuggingFace | Sí, publicadas por Mistral |
| Qwen2.5 7B Instruct | ~7,6B | 128.000 tokens | Apache 2.0 (la mayoría de variantes) | HuggingFace | Sí, publicadas por Alibaba |

La comparación relevante no es de rendimiento, sino de naturaleza del artefacto: este repositorio es un delta de pesos, no un modelo autónomo, y su comportamiento final depende enteramente del modelo base sobre el que se aplique.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica de capacidades. No se puede afirmar que el adaptador conserve las capacidades del modelo base.
- Licencia no declarada en el repositorio: al derivar de Llama 3.1, se aplica la Llama 3.1 Community License, que impone condiciones de uso comercial, obligaciones de atribución y restricciones específicas (por ejemplo, para organizaciones con más de 700 millones de usuarios mensuales). Verificar antes de cualquier uso comercial.
- Riesgo de degradación por la resta: aunque la fusión sea exacta respecto al update objetivo, restar un adaptador puede eliminar capacidades útiles o introducir comportamientos incoherentes. El error de Frobenius mide fidelidad a la operación, no calidad del modelo resultante.
- Sin datos de entrenamiento ni de composición de los adaptadores origen: se desconoce qué comportamientos codificaba el sustraendo y qué se pretende eliminar.
- Idioma: no hay declaración de idiomas para el adaptador; el comportamiento multilingüe, si existe, proviene del modelo base.
- Contexto: no hay validación de que el adaptador mantenga el rendimiento del modelo base en ventanas largas de hasta 128.000 tokens.
- Riesgo de alucinación: el propio de los modelos de la familia Llama 3.1; sin evaluaciones específicas no puede cuantificarse el efecto de la resta sobre este comportamiento.
- Sesgos: no documentados. No hay análisis de sesgos ni de seguridad para este artefacto.
- Madurez y soporte: el repositorio tiene 0 descargas y 0 *likes*, sin issues ni documentación adicional más allá de la model card. No hay garantía de mantenimiento.
- Metadatos atípicos: la fecha de creación registrada (2026-09-10) y la ausencia de `pipeline`, licencia e idiomas dificultan la integración automática en catálogos y pipelines de descubrimiento de modelos.
- No es un modelo autónomo: requiere el modelo base y una librería compatible con PEFT para cargarse; no se puede desplegar de forma aislada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/darturi/llama8b_c_mo_rfa_13-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo: https://huggingface.co/darturi/llama8b_c_mo_rfa_13 (commit `27267b54d6`)
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1 (commit `882c4b9670`)
- Modelo Llama 3.1 8B Instruct original: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: https://llama.meta.com/llama3_1/license/
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper de aritmética de tareas (Ilharco et al., 2022): https://arxiv.org/abs/2212.04089
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la búsqueda web realizada.
