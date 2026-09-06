# rafmacalaba/gliner-datause-v2-probe

## Resumen

`rafmacalaba/gliner-datause-v2-probe` es un modelo de clasificación de tokens, no un modelo de lenguaje generativo. Se trata de un *probe* (sonda) que opera sobre las representaciones congeladas de un modelo GLiNER2 para clasificar menciones de datos en documentos y predecir si deben mantenerse o descartarse según un criterio denominado "Luna v2.4". El modelo está desarrollado por `rafmacalaba` y se enmarca en una línea de investigación sobre extracción y evaluación de referencias a datasets en textos de origen humanitario y operacional.

La arquitectura combina un extractor GLiNER2 base con una cabeza MLP pequeña que lee características de span (`[start; end; mean; ±64-token window]`). El autor resume el enfoque como "extractor proposes, head disposes". El modelo fue entrenado sobre 2.728 spans provenientes de seis orígenes documentales distintos (FCV PADs, JDC operational, refugee PADs, ReliefWeb, JAD PADDY y PRWP), con una partición 70/15/15 disjunta por documento. Los objetivos de entrenamiento son los veredictos de un juez sintético ("Luna v2.4"), no anotaciones humanas, por lo que los resultados deben interpretarse como una destilación de ese criterio.

El modelo es relevante para tareas de extracción de información en dominios donde las referencias a datos son frecuentes pero heterogéneas: ayuda humanitaria, documentos operativos, informes de proyectos y publicaciones técnicas. Su carácter de sonda lo hace útil para investigar límites de clasificación y para construir pipelines de anotación automática, aunque no está pensado como un producto de inferencia directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (encoder base congelado) + MLP head sobre características de span |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | head.pt (PyTorch) |

Nota: el repositorio publica únicamente la cabeza MLP (`head.pt`), las predicciones de validación (`holdout_predictions.jsonl`) y las métricas de barrido (`holdout_metrics.json`). Para ejecutar el modelo completo se necesita además el modelo base `fastino/gliner2-base-v1`.

## Arquitectura y entrenamiento

El modelo no es un transformer autónomo, sino una sonda sobre representaciones congeladas. El pipeline es el siguiente: un modelo GLiNER2 base propone segmentos de texto candidatos a ser menciones de datos; para cada span, se extraen cuatro tipos de características: el vector de inicio, el vector de fin, la media de los vectores del span y una ventana de ±64 tokens alrededor del span. Estas características se concatenan y alimentan un MLP pequeño que produce dos salidas: una puntuación de clasificación (probe_score) y una puntuación de mantenimiento (head_score).

El entrenamiento se realizó sobre el conjunto `rafmacalaba/datause-extracted-sample` con configuración GLiNER2. Se usaron 2.728 spans anotados, distribuidos entre seis orígenes. La partición es disjunta por documento (70% entrenamiento, 15% validación, 15% holdout), de modo que ningún pasaje cruza entre particiones y todos los orígenes aparecen en las tres. La función de pérdida es BCE con label smoothing de 0.1 (eps/2) para mitigar puntuaciones demasiado confiadas. Los valores de salida son orientados a ranking, no probabilidades calibradas.

Una innovación destacable es que los objetivos de entrenamiento no son etiquetas humanas, sino veredictos de un juez automático denominado "Luna v2.4" (versión `v2.4-patched-2026-09-05`). El autor lo describe explícitamente como un "distillation target", lo que implica que el modelo aprende a replicar un criterio externo, no una verdad de referencia establecida.

## Capacidades

- Clasificación de spans en propuestas de datos: el modelo asigna a cada mención una categoría entre `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.
- Predicción de mantenimiento: produce una puntuación de cabeza (`head_score`) que indica si un span debe mantenerse o descartarse según el límite de "Luna v2.4".
- Ranking de spans: las puntuaciones son comparables entre sí, lo que permite ordenar candidatos por relevancia.
- Integración con GLiNER2: el modelo usa el extractor base para proponer spans, por lo que hereda sus capacidades de reconocimiento de entidades sin necesidad de reentrenar el encoder.
- Soporte de evaluación por origen: el repositorio incluye métricas desglosadas por origen documental, lo que facilita el análisis de sesgos por dominio.
- No soporta generación de texto, tool calling, visión ni razonamiento multi-paso.

## Casos de uso

- Análisis de documentos de ayuda humanitaria: el modelo puede clasificar automáticamente referencias a datos en informes de PADs (Project Appraisal Documents) y documentos operativos de JDC, lo que permite filtrar menciones útiles para construir bases de datos de proyectos.
- Detección de descripciones vagas de datos: al identificar spans etiquetados como `VAGUE_DATA`, se pueden señalar pasajes donde la referencia a un dataset es imprecisa (por ejemplo, "datos recientes" sin nombre ni fuente), útil en procesos de auditoría documental.
- Pre-filtrado para revisión humana: la puntuación `head_score` permite priorizar pasajes que probablemente contengan menciones de datos relevantes, reduciendo el esfuerzo de revisión manual en corpus extensos.
- Construcción de corpus etiquetados: el modelo puede generar anotaciones preliminares sobre documentos de ReliefWeb o JAD PADDY, que luego se refinan para entrenar modelos de extracción de información más completos.
- Evaluación de propuestas de datos en informes de proyectos: en contextos como el Programa de Desarrollo Rural de JAD, el modelo ayuda a clasificar si una mención es una referencia nominal, descriptiva o vaga, facilitando el análisis de calidad de los metadatos.
- Investigación en extracción de información: el modelo sirve como herramienta de experimentación para estudiar límites de clasificación en dominios específicos, gracias a la disponibilidad de métricas por origen y de predicciones de holdout.

## Benchmarks y rendimiento

El autor publica resultados sobre el conjunto de holdout, donde la etiqueta de referencia son los veredictos de "Luna v2.4". Se presentan tanto las métricas de la cabeza (`head`) como las del `probe_score` crudo.

| Metrica | Valor |
|---|---|
| AUROC (head, holdout) | 0.8750 |
| AUROC (raw probe_score, holdout) | 0.7645 |
| Mejor F1 (head) con umbral 0.3 | 0.8703 |
| Precision (head) con umbral 0.3 | 0.8207 |
| Recall (head) con umbral 0.3 | 0.9264 |
| Mejor F1 (raw) con umbral 0.0 | 0.7922 |
| AUROC (head, validacion) | 0.8787 |

Desglose por origen (holdout):

| Origin | n | keep | AUROC | head best-F1 @ thr | raw best-F1 @ thr |
|---|---|---|---|---|---|
| `fcv_pads_east_africa` | 70 | 18 | 0.8702 | 0.7586 @ 0.6 | 0.5000 @ 0.5 |
| `general_prwp` | 87 | 69 | 0.7093 | 0.8961 @ 0.2 | 0.8993 @ 0.1 |
| `jad_paddy_docs` | 126 | 110 | 0.8480 | 0.9483 @ 0.1 | 0.9322 @ 0.0 |
| `jdc_operational` | 69 | 45 | 0.8375 | 0.8421 @ 0.2 | 0.7895 @ 0.0 |
| `refugee_pads` | 66 | 28 | 0.9074 | 0.8136 @ 0.3 | 0.6939 @ 0.5 |
| `reliefweb` | 79 | 56 | 0.7019 | 0.8296 @ 0.0 | 0.8296 @ 0.0 |

Estas métricas reflejan el rendimiento frente a un objetivo de destilación, no frente a anotaciones humanas. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base `fastino/gliner2-base-v1` y del tamaño del lote.
- GPU recomendadas: no disponible. Cualquier GPU capaz de ejecutar GLiNER2 base (por ejemplo, una RTX 3060 o superior) puede servir, pero no se han publicado requisitos oficiales.
- ¿Cabe en GPU de consumo? Probablemente sí, si el modelo base GLiNER2 cabe en 8 GB de VRAM, pero no hay confirmación explícita.
- Opciones de despliegue: HuggingFace pipeline de `token-classification`, PyTorch directo, o integración con la librería `gliner`. No se menciona soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| `rafmacalaba/gliner-datause-v2-probe` | GLiNER + MLP head | No disponible | No disponible | Apache-2.0 | Si (HuggingFace) | Si (AUROC, F1) |
| `rafmacalaba/gliner-datause-probe` | GLiNER | No disponible | No disponible | Apache-2.0 | Si (HuggingFace) | No |
| `rafmacalaba/gliner2-datause-v2` | GLiNER2 + LoRA | No disponible | No disponible | Apache-2.0 | Si (HuggingFace) | No |

El modelo `gliner2-datause-v2` es un extractor de menciones de datasets fine-tuned sobre GLiNER2, mientras que `gliner-datause-v2-probe` es una sonda de clasificación sobre características de span. No se dispone de métricas comparables para los otros dos modelos, por lo que no es posible establecer una comparación directa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente sobre seis orígenes documentales (FCV PADs, JDC operational, refugee PADs, ReliefWeb, JAD PADDY y PRWP). El rendimiento varía notablemente por origen (AUROC entre 0.7019 y 0.9074), lo que sugiere una generalización limitada a dominios no representados.
- Riesgo de alucinación: no aplica, ya que el modelo es un clasificador de spans y no genera texto nuevo.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados. El modelo depende del extractor GLiNER2 base, cuya cobertura lingüística no se documenta en esta ficha.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia. No hay restricciones adicionales conocidas.
- Caveat importante para producción: los objetivos de entrenamiento son veredictos de un juez automático ("Luna v2.4"), no anotaciones humanas. Las puntuaciones están orientadas a ranking y no son probabilidades calibradas. El modelo es una sonda de investigación y no debe usarse como fuente de verdad en entornos donde se requiera precisión certificada.
- El repositorio no incluye pesos del modelo base, solo la cabeza MLP. Para desplegarlo es necesario obtener y cargar `fastino/gliner2-base-v1` por separado.

## Enlaces

- Modelo principal: https://huggingface.co/rafmacalaba/gliner-datause-v2-probe
- Modelo relacionado: https://huggingface.co/rafmacalaba/gliner-datause-probe
- Modelo relacionado: https://huggingface.co/rafmacalaba/gliner2-datause-v2
