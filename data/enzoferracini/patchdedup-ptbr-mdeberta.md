# enzoferracini/patchdedup-ptbr-mdeberta

## Resumen

PatchDedup PT-BR mDeBERTa es un modelo de clasificación de texto en portugués de Brasil desarrollado por Enzo Ferracini Patti como parte del proyecto experimental PatchDedup, un pipeline de detección de redundancia semántica entre fragmentos de texto (por ejemplo, viñetas de un currículum). El modelo se construye sobre el encoder multilingüe MoritzLaurer/mDeBERTa-v3-base-mnli-xnli, afinado con datos sintéticos del dataset enzoferracini/patchdedup-synthetic-ptbr, y se publica con licencia MIT.

La relevancia del modelo es acotada y explícitamente experimental: no se presenta como un sistema listo para producción, sino como un piloto sintético para transferencia de NLI (Natural Language Inference) en portugués. Los pesos publicados en la raíz del repositorio corresponden al componente NLI principal y devuelven logits de entailment/neutral/contradiction; la decisión final de redundancia la toma la CLI PatchDedup aplicando calibración y agregación sobre grafos de comparación.

El autor documenta de forma inusualmente honesta las limitaciones: los datos fueron generados y revisados por la misma IA sin revisión humana ni CVs reales, el conjunto de test reservado es de solo 40 pares en 20 escenarios, y los resultados no constituyen evidencia de madurez para producción. Con 278,8 millones de parámetros y un tamaño de repositorio de 1,6 GB, es un modelo pequeño-medio orientado a inferencia local en CPU o GPU modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2 / mDeBERTa-v3), clasificación de secuencias |
| Parametros totales | 278.811.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 en CPU evaluado en el pipeline (candidato hpo_5_quantized); no se detallan otros formatos |
| Idiomas soportados | pt (portugués de Brasil); no hay inglés validado |
| Licencia | MIT (pesos NLI y derivados, con atribución a Moritz Laurer y autores de las bases); encoder de embeddings separado bajo Apache-2.0; datos CC BY 4.0; código MIT |
| Formato de pesos | safetensors (raíz del repo) + encoder de embeddings separado en `embeddings/` |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v2 en su variante multilingüe mDeBERTa-v3, partiendo del checkpoint MoritzLaurer/mDeBERTa-v3-base-mnli-xnli ya afinado para NLI multilingüe. Sobre esa base se aplica un ajuste fino para la tarea de transferencia de NLI al portugués de Brasil, con una cabeza de clasificación de tres clases (entailment/neutral/contradiction). El pipeline completo combina las orientaciones (A→B y B→A), agrega componentes mediante un grafo de puntuaciones (`score_graph.json`), aplica calibración y devuelve conjuntos conformales; el coseno opcional proviene de un encoder de Sentence Transformers separado y no debe interpretarse como probabilidad de redundancia.

El entrenamiento se realizó sobre el dataset sintético enzoferracini/patchdedup-synthetic-ptbr, generado y revisado por IA sin intervención humana. El autor documenta la exploración de numerosas técnicas: transferencia multilingüe de NLI, supervisión direccional multitarea, BCE ponderada, congelación de capas, learning rates por capa, AdamW con warmup/coseno, clipping y acumulación, BF16, checkpointing, label smoothing, R-Drop, EMA, LoRA, distillation, pseudo-etiquetas por consenso, minería ponderada de negativos, adaptación de lenguaje enmascarado (MLM) con corpus sintético pequeño y cabeza MLM nueva, múltiples seeds, HPO con TPE/Hyperband, agregaciones, calibración, ensembles/stacking, conformal e int8 en CPU. La selección de scores evaluó 210 grafos en tres folds por escenario, con una macro-F1 cross-fitted seleccionada de 0,946. El autor advierte que el cross-fitting no elimina todo el sesgo de selección adaptativa y que el test solo se abrió tras congelar modelo, grafo y calibración. No se emplearon RAG, DPO/RLHF, multimodalidad ni MoE por no pertenecer a la tarea discriminativa planteada.

## Capacidades

- Clasificación NLI de pares de texto en portugués de Brasil: devuelve logits de entailment, neutral y contradiction.
- Detección de redundancia semántica entre fragmentos de texto dentro del pipeline PatchDedup (comparación bidireccional, agregación por grafo, calibración y conjuntos conformales).
- Comparación de pares de textos mediante CLI local (`patchdedup compare --model artifacts/model --text-a 'A' --text-b 'B'`).
- Inferencia local sin APIs, ejecutable con bundle local o Docker CPU offline.
- Soporte de cuantización int8 en CPU dentro del pipeline (candidato evaluado con degradación notable: AP 0,464 y F1 0,609 en desarrollo).
- Embeddings opcionales mediante encoder separado en `embeddings/` (no es probabilidad de redundancia).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al portugués validado; no hay inglés validado.

## Casos de uso

- Detección de viñetas redundantes en currículums sintéticos: el pipeline compara pares de bullets y agrupa duplicados semánticos mediante grafos de puntuaciones y conjuntos conformales; es el único uso validado por el autor.
- Investigación en transferencia de NLI al portugués: sirve como punto de partida para estudiar cómo se comporta una base mDeBERTa NLI multilingüe al adaptarse a un dominio concreto en pt-BR.
- Experimentación con calibración y conformal prediction: el repositorio incluye `calibration.json` y `test.json` para reproducir la cobertura marginal y la precisión selectiva observadas.
- Baseline para comparación de técnicas de ajuste fino: los JSON de evidencia permiten contrastar HPO, LoRA, distillation, pseudo-etiquetado, R-Drop, EMA y otras técnicas sobre una misma tarea.
- Prototipado de pipelines de deduplicación de texto en portugués: la CLI permite probar el flujo completo (comparación, agregación, calibración) antes de invertir en datos reales.
- Estudio de robustez ante datos sintéticos: útil para analizar cómo se degrada un modelo afinado con datos generados por IA frente a datos humanos, dado que el autor documenta explícitamente esa limitación.
- Evaluación de cuantización int8 en CPU: el candidato `hpo_5_quantized` ofrece un caso documentado de pérdida de rendimiento (AP 0,464 frente a 0,979 del modelo sin cuantizar) para estudiar trade-offs.

## Benchmarks y rendimiento

Resultados del test reservado de 40 pares en 20 escenarios, según la model card:

| Modelo / política | AP | F1 | macro-F1 |
|---|---:|---:|---:|
| PatchDedup v03 (política seleccionada) | 0,965 | 0,927 | 0,925 |
| Base mDeBERTa NLI sin ajuste (política fijada en desarrollo) | 0,984 | 0,909 | no disponible |

Métricas de confianza y calibración reportadas por el autor:

| Métrica | Valor |
|---|---:|
| Cobertura fuera de review | 0,725 |
| Precisión selectiva | 0,923 |
| Cobertura marginal conformal en test | 0,700 |
| Macro-F1 cross-fitted seleccionada (210 grafos, 3 folds) | 0,946 |

Resultados de candidatos en desarrollo (extracto de la tabla del autor):

| Candidato | AP desarrollo | F1 desarrollo |
|---|---:|---:|
| hpo_5 | 0,979 | 0,947 |
| hpo_4 | 0,976 | 0,947 |
| hpo_1 | 0,967 | 0,931 |
| multitask_deberta | 0,945 | 0,914 |
| lora_deberta | 0,925 | 0,891 |
| nli_deberta | 0,921 | 0,891 |
| domain_adapted_minilm | 0,866 | 0,833 |
| distilled_minilm | 0,861 | 0,840 |
| hpo_5_quantized | 0,464 | 0,609 |

El autor advierte explícitamente que no debe confundirse el gain sobre embeddings antiguos con el gain sobre la base mDeBERTa NLI fuerte, y que los resultados son de un piloto sintético, no evidencia de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278,8 M parámetros × 4 bytes), más activaciones y overhead del runtime; en fp16/bf16 alrededor de 0,56 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para fp16/bf16 (RTX 3060, RTX 4060, T4, L4); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en GPUs integradas y CPU.
- Despliegue: transformers (AutoModelForSequenceClassification), CLI PatchDedup con bundle local o Docker CPU offline; el pipeline admite int8 en CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 1,6 GB, incluyendo pesos safetensors, encoder de embeddings separado y artefactos del pipeline.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatchDedup PT-BR mDeBERTa | 278,8 M | no disponible | NLI / redundancia pt-BR | MIT | Hugging Face (0 descargas, 0 likes) |
| MoritzLaurer/mDeBERTa-v3-base-mnli-xnli | no disponible | no disponible | NLI multilingüe | no disponible en la información proporcionada | Hugging Face (modelo base) |
| MiniLM (candidatos distilled_minilm, domain_adapted_minilm, multitask_minilm, nli_minilm, pseudo_distilled_minilm, seed137_minilm) | no disponible | no disponible | NLI / redundancia pt-BR | no disponible | Internos del proyecto, no publicados como modelos separados |

La comparación directa con alternativas públicas de NLI en portugués no está disponible en la información proporcionada; el autor solo compara contra variantes internas del propio pipeline y contra la base mDeBERTa sin ajuste.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor indica que los resultados son de un piloto sintético y no evidencia de preparación para producción.
- Datos sintéticos generados y revisados por la misma IA, sin revisión humana ni CVs reales; riesgo de sesgos y artefactos del generador.
- Test reservado de solo 40 pares en 20 escenarios; la calibración reservada tiene solo 20 pares de diez grupos, insuficiente para garantías robustas.
- La cobertura marginal conformal (0,700) requiere exchangeability y no garantiza precisión ni protección frente a domain shift.
- Sesgo de selección adaptativa: el cross-fitting no elimina todo el sesgo derivado de la selección de épocas y políticas en desarrollo.
- Los pesos de la raíz devuelven logits NLI, no la decisión final de redundancia; usarlos directamente sin el pipeline completo produce resultados no calibrados.
- El coseno del encoder de embeddings separado no es una probabilidad de redundancia y no debe interpretarse como tal.
- Los scores no verifican hechos; el modelo no debe usarse para borrar viñetas, evaluar candidatos ni clasificar competencia.
- Solo validado en portugués de Brasil; no hay inglés validado ni impacto medido en otros idiomas.
- Sin soporte de tool calling, agentes, multimodalidad ni razonamiento multi-step.
- La cuantización int8 en CPU degrada gravemente el rendimiento (AP 0,464 frente a 0,979 en desarrollo).
- La licencia MIT exige preservar LICENSE, NOTICE y los cards de origen, con atribución a Moritz Laurer y autores de las bases.
- Proyecto sin afiliación a iFood; autoría de Enzo Ferracini Patti con Codex.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; sin validación externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enzoferracini/patchdedup-ptbr-mdeberta
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-mnli-xnli
- Dataset sintético: https://huggingface.co/datasets/enzoferracini/patchdedup-synthetic-ptbr
- Código y evidencias: https://github.com/octopus-synapse/patch-dedup
