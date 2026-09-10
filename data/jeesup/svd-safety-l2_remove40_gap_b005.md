# Jeesup/svd-safety-l2_remove40_gap_b005

## Resumen

`Jeesup/svd-safety-l2_remove40_gap_b005` es un checkpoint experimental derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM (descomposición en valores singulares) hasta conservar el 60,5 % de los parámetros densos originales. Posteriormente, se restauran 3.033 componentes singulares seleccionados con la regla `gap`, asignando un presupuesto del 0,5 % de los parámetros densos. El código del autor deja claro que este modelo no es un asistente general, sino un artefacto de investigación para estudiar cómo la compresión SVD degrada la seguridad y qué reglas de selección de componentes la reparan mejor.

La arquitectura es la de Llama-2-7b-chat (transformer decoder-only), con el mismo número de parámetros totales (6.738.415.616) que el modelo base, aunque la compresión reduce los parámetros efectivos a aproximadamente 4.076 millones (60,5 %). El checkpoint se distribuye únicamente en formato `safetensors`, con peso de 13,5 GB, y su licencia es Llama 2 Community License. Es una celda concreta dentro de una rejilla de experimentos sobre selección de reglas y presupuestos de restauración; debe evaluarse con cautela y no desplegarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 (pesos safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en safetensors; la compresión SVD no es cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Llama-2-7b-chat, un transformer autoregresivo estándar. La particularidad es la compresión SVD-LLM, que sustituye las matrices de pesos por aproximaciones de bajo rango, eliminando un 39,5 % de los parámetros efectivos. Tras la compresión, se restauran selectivamente 3.033 componentes singulares siguiendo la regla `gap`, con un presupuesto del 0,5 % de los parámetros densos. Esto produce un checkpoint con una fracción de parámetros resultante de 0,6050 respecto al modelo denso original.

No se realizó entrenamiento adicional, RLHF ni DPO sobre el modelo base. El dataset de entrenamiento no se especifica en la información disponible; el proceso es puramente post-hoc sobre los pesos de Llama-2-7b-chat. La técnica SVD-LLM se centra en la descomposición en valores singulares de las capas lineales, y la regla `gap` selecciona los componentes a restaurar según la diferencia entre valores singulares consecutivos, una heurística de importancia teórica.

## Capacidades

- Generación de texto conversacional heredada del modelo base, aunque con calidad degradada por la compresión (WikiText-2 perplexity de 11,2762).
- Comportamiento de seguridad medible mediante métricas de ataque y sobre-rechazo (AdvBench ASR 0,0250; StrongREJECT ASR 0,0831; macro over-refusal 0,1952).
- Función de investigación: permite cuantificar el impacto de la compresión SVD y de la restauración de componentes singulares sobre la alineación de seguridad.
- No soporta tool calling ni function calling (no documentado, y el modelo base de Llama-2-7b-chat no ofrece esta capacidad de forma nativa).
- No ofrece soporte para agentes ni razonamiento multi-paso explícito.
- No incluye capacidades de visión ni audio.
- Capacidades multilingües no documentadas.

## Casos de uso

- Investigación en compresión de modelos: el modelo permite estudiar cómo las matrices de bajo rango afectan a la fluidez del lenguaje y a la utilidad general, comparando la perplexity frente al modelo base.
- Evaluación de degradación de seguridad: apto para medir en qué medida la compresión SVD aumenta la tasa de éxito de ataques adversarios (ASR) y cómo la restauración selectiva la reduce.
- Comparación de reglas de selección de componentes: dentro del grid, se puede comparar la regla `gap` con otras reglas y presupuestos para determinar cuál preserva mejor la seguridad.
- Interpretabilidad de la alineación: permite analizar qué componentes singulares están asociados a comportamientos seguros o inseguros, al restaurarlos o no.
- Benchmarking de métricas de sobre-rechazo: el valor de macro over-refusal (WildGuard) es útil para calibrar la agresividad del modelo en respuestas de rechazo.
- Generación de conjuntos de datos de evaluación: se puede usar como parte de un corpus de modelos comprimidos con diferentes niveles de seguridad para entrenar o evaluar clasificadores de alineación.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en la model card del autor, medidos sobre este checkpoint concreto:

| Metrica | Valor | Juez |
|---|---|---|
| AdvBench ASR | 0,0250 | HarmBench judge |
| StrongREJECT ASR | 0,0831 | HarmBench judge |
| Macro over-refusal | 0,1952 | WildGuard |
| WikiText-2 perplexity | 11,2762 | - |

No se han publicado resultados comparativos con el modelo base ni con otros modelos comprimidos en la información disponible. Los valores de ASR indican una relativa baja tasa de éxito de ataques, mientras que el over-refusal es notable, lo que sugiere un comportamiento de rechazo más conservador tras la restauración por `gap`. La perplexity es superior a la habitual en Llama-2-7b-chat, señalando una pérdida de calidad generativa.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~13,5 GB solo para los pesos (6.738.415.616 parámetros × 2 bytes), sin contar activaciones ni KV cache.
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB o RTX 4090 24 GB para ejecutar en FP16 sin cuantizar.
- Con tarjetas de 16 GB (como RTX 4080) puede ejecutarse con optimizaciones de memoria, aunque no hay datos de validación en la información disponible.
- No se dispone de información sobre cuantizaciones ni sobre si el modelo cabe en GPUs de gama baja.
- Opciones de despliegue: Transformers (via HuggingFace), vLLM, TGI; también puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se ha verificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | Llama 2 Community License | Modelo base sin comprimir, validado como asistente general |
| Jeesup/svd-safety-l2_remove40_gap_b005 | 6.738.415.616 (efectivos ~60,5 %) | No disponible | Llama 2 Community License | Checkpoint experimental con compresión SVD y restauración selectiva |

No se han identificado otros modelos comparables en la información proporcionada. La comparación con el modelo base es la más relevante: este checkpoint reduce los parámetros efectivos a un 60,5 % y registra una perplexity mayor, pero los benchmarks de seguridad solo están disponibles para el modelo comprimido, no para el base.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general ni apto para desplegarse en producción.
- Varias variantes del grid del autor están deliberadamente degradadas en seguridad; este checkpoint concreto es una celda experimental y puede no representar un comportamiento robusto.
- No se han evaluado sesgos ni comportamientos nocivos de forma exhaustiva; la compresión puede alterar la alineación de maneras no documentadas.
- La licencia Llama 2 Community License impone restricciones al uso comercial y a la distribución de derivados, que deben revisarse antes de cualquier uso.
- No soporta tool calling ni integración como agente, lo que limita su utilidad práctica.
- La calidad del texto se ve afectada por la compresión (perplexity 11,2762 en WikiText-2), lo que puede provocar respuestas menos coherentes.
- La longitud de contexto no está especificada en la información disponible; asumir la del modelo base (4096 tokens) no está respaldado por la ficha.
- Las métricas de seguridad (ASR, over-refusal) provienen de un único juez (HarmBench/WildGuard) y no garantizan generalización a otros escenarios.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_gap_b005

No se han encontrado enlaces a papers, blogs o repositorios adicionales en la información disponible.
