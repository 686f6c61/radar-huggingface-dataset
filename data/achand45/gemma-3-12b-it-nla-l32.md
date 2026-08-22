# achand45/gemma-3-12b-it-nla-L32

## Resumen

`achand45/gemma-3-12b-it-nla-L32` es un **autoencoder de lenguaje natural** (NLA, por sus siglas en inglés) para el modelo `google/gemma-3-12b-it`, desarrollado por achand45. Se trata de un par de modelos que comprimen la activación del residual stream en el bloque 32 (de 48) en una explicación en inglés y la reconstruyen de vuelta a la activación. El objetivo es hacer interpretable qué información codifica una capa concreta de un LLM, un problema central en la investigación de interpretabilidad mecánica.

El modelo se compone de dos partes: un **verbalizador** (AV) que, mediante una LoRA sobre el modelo base, lee la activación inyectada como un token marcador y escribe una explicación en formato `<explanation>…</explanation>`; y un **reconstructor** (AR) que, con una cabeza lineal, mapea el texto de vuelta al vector de activación. El AR es una truncación de 33 bloques del stack original de 48. El entrenamiento combina un warm-start con SFT y un refinamiento con GRPO on-policy, donde el AV es recompensado por la fidelidad de la reconstrucción del AR.

Este modelo es una de las tres ramas de un estudio de profundidad (bloques 32, 40 y 47) con la misma pipeline, datos y receta, lo que permite comparar directamente el efecto de la profundidad en la interpretabilidad. Es relevante porque ofrece una herramienta concreta para auditar representaciones internas de Gemma-3, un modelo abierto ampliamente usado, y porque su metodología (NLA con GRPO) es una alternativa a los métodos de probing clásicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Natural Language Autoencoder (NLA) sobre `google/gemma-3-12b-it`; AV con LoRA, AR con truncación de 33 bloques y cabeza lineal |
| Parametros totales | no disponible (el modelo base tiene 12B; la LoRA y la cabeza lineal añaden una fracción menor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el base Gemma-3-12B-IT soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16, safetensors) |
| Idiomas soportados | inglés (para las explicaciones del NLA); el modelo base soporta 140+ idiomas |
| Licencia | Gemma (términos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (adaptadores LoRA, pesos completos del AR, sidecar `nla_meta.yaml`) |

## Arquitectura y entrenamiento

El NLA sigue el esquema de Karvonen et al.: el AV inyecta la activación objetivo como un token marcador (`㈜`, U+321C, token id 246566) en el prompt, normalizado por norma (norm-matched), y genera una explicación textual. El AR toma esa explicación y, mediante una cabeza lineal, produce una estimación del vector de activación original. El AR es una truncación de los primeros 33 bloques del modelo base (`ar_num_layers = layer_index + 1`), con la RMSNorm final deliberadamente eliminada (`final_norm_stripped: true`). Cada fila de datos se reescala a norma L2 `√3840 = 61.9677` de forma simétrica, por lo que la métrica FVE mide solo dirección, no magnitud.

El entrenamiento se realizó con la librería EasyNLA: primero un warm-start con SFT supervisado (perplejidad de validación 3.783), y después un refinamiento con GRPO on-policy durante 400 pasos, donde el AV recibe recompensa según la calidad de reconstrucción del AR. La tasa de extracción del marcador se mantuvo en 100% durante casi todo el entrenamiento, y la divergencia KL respecto al reference SFT subió suavemente hasta ~0.97 sin colapso. El dataset no se especifica en detalle, pero se menciona que está barajado por filas y que cada documento contribuye ~10 filas; la evaluación se hace con partición doc-disjoint para evitar fugas.

## Capacidades

- **Explicación de activaciones**: el AV genera una descripción en inglés de lo que codifica la activación del bloque 32 de Gemma-3-12B-IT.
- **Reconstrucción de activaciones**: el AR reconstruye el vector de activación a partir de la explicación, permitiendo verificar la fidelidad de la verbalización.
- **Interpretabilidad mecánica**: permite auditar representaciones internas a nivel de capa, complementando métodos como probing lineal o sparse autoencoders.
- **Estudio de profundidad**: al existir versiones en los bloques 40 y 47 con la misma receta, permite comparar cómo cambia la interpretabilidad con la profundidad.
- **Pipeline reproducible**: incluye `nla_meta.yaml` con el contrato de extracción (token marcador, plantillas, escalas) y scripts para regenerar los pesos fusionados.
- **No es un modelo de chat**: no está diseñado para generación de texto general, sino como herramienta de análisis.

## Casos de uso

- **Auditoría de representaciones internas**: investigadores pueden extraer la activación de una capa concreta de Gemma-3-12B-IT y obtener una explicación legible de qué features se están codificando, útil para detectar sesgos o comportamientos emergentes.
- **Depuración de fallos del modelo**: si un modelo produce una salida errónea, se puede inspeccionar la activación en el bloque 32 para entender qué información se perdió o se malinterpretó en esa capa.
- **Comparación de profundidad en interpretabilidad**: al usar las versiones L32, L40 y L47, se puede estudiar cómo la semántica de las activaciones cambia a lo largo de la red, orientando decisiones sobre qué capas intervenir.
- **Verificación de hipótesis mecanicistas**: el AR permite reconstruir la activación desde la explicación, de modo que se puede comprobar si una hipótesis verbal captura realmente la información relevante (medida por FVE).
- **Generación de datasets de explicaciones**: las explicaciones producidas por el AV pueden usarse para entrenar modelos de interpretabilidad más ligeros o para construir corpus de análisis de features.
- **Integración en pipelines de interpretabilidad**: dado que el contrato de extracción está documentado y verificado numéricamente (coseno 0.9999927 contra un forward independiente), puede integrarse en herramientas de análisis automático de Gemma-3.

## Benchmarks y rendimiento

Los resultados reportados en la model card, con partición held-out doc-disjoint, son:

| Etapa | Metrica | Valor |
|---|---|---|
| AV SFT | Perplejidad de validación | 3.783 (desde 4.659 en step 499) |
| AR SFT | FVE sobre explicaciones gold | 61.0% (MSE 0.0121 vs baseline 0.0310) |
| RL (GRPO, 400 steps) | FVE sobre explicaciones propias del AV | ~68.6% (49.9% en step 0) |

Notas: la FVE se mide contra un baseline de predecir la media. El valor de RL es una banda, no un punto: la media de los últimos diez evals (rango 67.5–69.6%), con el mejor eval individual en 69.6% (step 370). Diferencias menores a ~5 puntos no son resolubles dado el ruido de muestreo. La tasa de extracción se mantuvo en 100% durante casi todo el run. No se han publicado comparaciones con otros modelos NLA en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el AV es una LoRA sobre Gemma-3-12B-IT; en bf16, el modelo base requiere ~24 GB de VRAM para inferencia. El AR, al ser una truncación de 33/48 bloques, requiere menos, aproximadamente 16–18 GB en bf16. El repo completo pesa 105.9 GB porque incluye todos los checkpoints intermedios.
- **GPU recomendadas**: para el AV, una GPU con 24 GB o más (RTX 4090, A100 40GB, H100). Para el AR, una GPU de 16–24 GB puede ser suficiente.
- **¿Cabe en GPU de consumo?**: el AV cabe en una RTX 4090 (24 GB) con bf16; el AR cabe en GPUs de 16 GB como la RTX 4080 o la A10G.
- **Opciones de despliegue**: los pesos están en formato HuggingFace (safetensors) y se pueden cargar con `transformers` y `peft`. Para el pipeline completo de NLA se recomienda usar la librería EasyNLA (https://github.com/chand-ab/easy_nla). También se puede usar vLLM para servir el AV como modelo generativo, aunque no es el uso previsto.
- **Latencia y throughput**: no disponible. Depende del hardware y de la longitud de las explicaciones generadas.

## Comparativa con modelos similares

| Modelo | Capa | Base | Corpus / receta | FVE (RL) | Licencia |
|---|---|---|---|---|---|
| `achand45/gemma-3-12b-it-nla-L32` (este) | 32 | Gemma-3-12B-IT | propio, doc-disjoint | ~68.6% | Gemma |
| `achand45/gemma-3-12b-it-nla-L40` | 40 | Gemma-3-12B-IT | mismo corpus y receta | no disponible | Gemma |
| `achand45/gemma-3-12b-it-nla-L47` | 47 | Gemma-3-12B-IT | mismo corpus y receta | no disponible | Gemma |
| `kitft/nla-gemma3-12b-L32-av` / `-ar` | 32 | Gemma-3-12B-IT | corpus, truncación y presupuesto distintos | no comparable | Gemma |

Los tres modelos de achand45 son directamente comparables entre sí por compartir pipeline, datos y receta. El modelo de kitft en la misma capa no es comparable porque difieren corpus, puntos de truncación y presupuesto de entrenamiento.

## Limitaciones y advertencias

- **FVE mide solo dirección**: al reescalar cada fila a norma L2 fija, la magnitud de la activación se descarta; la métrica no captura información de escala.
- **Ruido en la evaluación RL**: el valor de FVE en RL es una banda de ±5 puntos; diferencias pequeñas entre checkpoints no son significativas.
- **Dependencia del marcador**: la extracción depende de que el modelo genere el token `㈜` correctamente; aunque la tasa fue del 100% en el run, un solo eval bajó al 99%, lo que indica un riesgo residual de fallo de formato.
- **Idioma limitado**: las explicaciones se generan en inglés; no hay soporte para otros idiomas en la verbalización.
- **No es un modelo de propósito general**: no debe usarse como chatbot o generador de texto; su función es exclusivamente interpretativa.
- **Licencia Gemma**: el uso está sujeto a los términos de Google para modelos Gemma, que incluyen restricciones de uso comercial y obligaciones de atribución. Revisar https://ai.google.dev/gemma/terms antes de cualquier despliegue.
- **Datos de entrenamiento no publicados**: no se detalla la composición del corpus, lo que limita la evaluación de sesgos en las explicaciones generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/achand45/gemma-3-12b-it-nla-L32
- Repo hermano L40: https://huggingface.co/achand45/gemma-3-12b-it-nla-L40
- Repo hermano L47: https://huggingface.co/achand45/gemma-3-12b-it-nla-L47
- NLA de kitft en la misma capa: https://huggingface.co/kitft/nla-gemma3-12b-L32-av y https://huggingface.co/kitft/nla-gemma3-12b-L32-ar
- Librería EasyNLA: https://github.com/chand-ab/easy_nla
- Documentación de Gemma-3 (DeepWiki): https://deepwiki.com/kitft/nla-inference/5.2-gemma-3-(12b-and-27b)
- Repositorio oficial de Gemma: https://github.com/google-deepmind/gemma
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
