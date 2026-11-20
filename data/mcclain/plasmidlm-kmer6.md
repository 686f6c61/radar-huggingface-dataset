# McClain/PlasmidLM-kmer6

## Resumen

PlasmidLM-kmer6 es un modelo de lenguaje causal (decoder-only) de 19,3 millones de parámetros desarrollado por McClain Thiel (con Chris P. Barnes como coautor en la publicación asociada) para la generación condicional de secuencias de ADN de plásmidos. A diferencia de los LLM convencionales, opera sobre un vocabulario de k-mers (k=6) y tokens especiales que codifican atributos funcionales del plásmido, como el gen de resistencia a antibióticos (`<AMR_KANAMYCIN>`), el origen de replicación (`<ORI_COLE1>`) o la clase de número de copias. El modelo se entrena desde cero sobre un conjunto de secuencias de Addgene certificado como disjunto a nivel de clúster (split `cluster_v3`), lo que evita fugas de información entre entrenamiento y evaluación.

La relevancia del modelo reside en su enfoque de "post-entrenamiento con recompensa verificable" aplicado a biología sintética: la versión base aquí descrita se acompaña de un modelo complementario post-entrenado con GRPO y anotación con pLannotate (`McClain/PlasmidLM-kmer6-GRPO-plannotate`) que mejora la fidelidad condicional y la viabilidad de las secuencias generadas. El checkpoint `v2.0` (100.000 pasos) sustituye a la release original `v1.0` (65.000 pasos) con mejoras medibles en viabilidad (74,1 % frente a 65,9 %) y tasa de plásmidos útiles (47,7 % frente a 45,9 %).

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y código personalizado que requiere `trust_remote_code=True`. Su tamaño reducido (0,2 GB de repositorio) permite ejecutarlo en hardware modesto, lo que lo hace accesible para laboratorios que quieran experimentar con generación de construcciones plasmídicas sin infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (causal-lm) con tokenización por k-mers (k=6) |
| Parametros totales | 19.318.656 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la generación de ejemplo usa hasta 4.096 tokens nuevos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (metadatos y documentación); el dominio real es secuencia de ADN |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `c6499c7d...f6563de`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, no un modelo preentrenado adaptado. La entrada se tokeniza en k-mers de longitud 6 combinados con tokens especiales que representan condiciones biológicas: genes de resistencia a antibióticos (AMR), orígenes de replicación (ORI), etiquetas de clase de copia (COPY) y separadores (SEP). El entrenamiento se realizó sobre un split de Addgene certificado mediante BLAST como disjunto a nivel de clúster (`cluster_v3`, con cero solapamiento ≥90 %/90 %), aplicando rotación circular aleatoria del inicio de la secuencia y un reescalado de minorías con tope de 4x (`capped inverse-square-root minority upweighting`). El checkpoint `v2.0` corresponde a 100.000 pasos (`cluster_base_s42`); la pérdida de validación en el conjunto disjunto es 0,9867 con una precisión de token del 85,23 %.

La innovación principal no está en la arquitectura (un transformer estándar de escala pequeña) sino en el pipeline de datos y evaluación: el uso de un split disjunto a nivel de clúster evita la contaminación por plásmidos homólogos, y el modelo se acompaña de una variante post-entrenada con GRPO que utiliza recompensas verificables calculadas con herramientas bioinformáticas (pLannotate, Prodigal, NCBI AMRFinderPlus). El modelo base no incluye RLHF ni DPO en esta release; esas técnicas se aplican en el modelo complementario.

## Capacidades

- Generación condicional de secuencias de ADN de plásmidos a partir de un prompt de tokens especiales (p. ej. `<BOS><AMR_KANAMYCIN><ORI_COLE1><SEP>`).
- Control de atributos funcionales: gen de resistencia a antibióticos, origen de replicación y clase de número de copias.
- Generación de secuencias circulares con rotación de inicio aleatoria durante el entrenamiento.
- Generación de hasta 4.096 tokens nuevos por llamada (según el ejemplo de la model card).
- Muestreo con temperatura y top-p (el ejemplo oficial usa T=0,3 y top_p=0,95).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido: es un modelo de dominio específico para secuencia biológica.
- Capacidad multilingüe: no aplica; el "lenguaje" es la secuencia de ADN codificada en k-mers.

## Casos de uso

- Diseño de vectores plasmídicos con resistencia y origen especificados: el modelo genera la secuencia completa a partir de un prompt con `<AMR_*>` y `<ORI_*>`, útil para explorar variantes de backbone antes de la síntesis.
- Generación de candidatos para validación computacional: las secuencias se pueden pasar por pLannotate, Prodigal y AMRFinderPlus para verificar ORFs intactos y anotaciones, tal como hace el propio autor en su pipeline de evaluación.
- Exploración de diversidad de backbones: con muestreo estocástico (T=0,3–0,5) y best-of-N, se pueden generar múltiples candidatos y seleccionar los que superen umbrales de viabilidad y utilidad (el autor reporta 78,4 % de tasa útil en best-of-4).
- Prototipado rápido en laboratorios con recursos limitados: con 19,3 M de parámetros y 0,2 GB de pesos, se ejecuta en una GPU de consumo o incluso en CPU para experimentos de bajo throughput.
- Investigación en modelos de lenguaje para biología: sirve como baseline reproducible para estudiar tokenización por k-mers, condicionamiento por tokens especiales y splits disjuntos por clúster.
- Generación de datos sintéticos para entrenamiento o aumento de datasets: las secuencias generadas pueden filtrarse por viabilidad y anotación para construir corpus aumentados.
- Estudio de post-entrenamiento con recompensas verificables: el modelo base es el punto de partida del companion GRPO, útil para comparar el efecto del RL sobre fidelidad condicional.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (panel `frozen_panel_v3`, 468 clústeres disjuntos, T=0,3, hasta 4.096 tokens nuevos). No verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Tasa de plásmidos útiles (T=0,5, single-shot) | 0,477 |
| Tasa de viabilidad (single-shot) | 0,7415 |
| Tasa de plásmidos útiles best-of-4 | 0,7842 |
| Recall de ORF intacto (NCBI AMRFinderPlus) | 0,5517 |

Comparativa de revisiones reportada por el autor:

| Revision | Split de preentrenamiento | Pasos | GC | Viable | Useful@0.5 | BoK-4 útil | AMRFinder intacto | ORI/AMR extra |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `v2.0` (main) | `cluster_v3` (solapamiento cero ≥90 %/90 %) | 100.000 | 50,4 % | 74,1 % | 47,7 % | 78,4 % | 55,2 % | 0,57 |
| `v1.0` (rama v1) | Source-ID-disjoint (108K) | 65.000 | 48,5 % | 65,9 % | 45,9 % | 72,0 % | 48,0 % | 0,55 |

Pérdida de validación en `cluster_v3` retenido: 0,9867 (precisión de token 85,23 %).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (19,3 M de parámetros ≈ 77 MB de pesos); en la práctica, el cuello de botella es la longitud de secuencia generada, no el modelo.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM es suficiente; una RTX 3060/4060 o superior ofrece margen amplio. Para batches grandes, A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia de una sola secuencia.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (método oficial documentado). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el código personalizado y la tokenización por k-mers probablemente requieran adaptación para esos runners.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, existirían otros modelos de lenguaje para ADN (p. ej. familias como DNABERT, Nucleotide Transformer o Evo), pero no se aportan sus parámetros, contexto, rendimiento ni licencia en la información disponible, por lo que no se puede construir una comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PlasmidLM-kmer6 | 19,3 M | No disponible | Apache 2.0 | Hugging Face |
| Alternativas de la categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Validación exclusivamente computacional (pLannotate + Prodigal + NCBI AMRFinderPlus); las secuencias no han sido probadas en laboratorio húmedo.
- Bajo retención estricta de backbone homólogo, los orígenes de baja copia raros (`<ORI_P15A>`, `<ORI_PSC101>`) y los tokens de clase de copia suave (`<COPY_LOW>`) siguen siendo difíciles sin restricciones explícitas.
- Riesgo de alucinación biológica: el modelo puede generar secuencias que parezcan plausibles pero que no sean funcionales o que contengan ORFs truncados; el recall de ORF intacto es solo del 55,2 %.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la seguridad biológica de las secuencias generadas; cualquier uso en síntesis real requiere validación adicional y cumplimiento normativo.
- El modelo está pensado para inglés en metadatos y documentación; no es multilingüe en el sentido convencional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en producción.
- La model card advierte que para mejor fidelidad condicional y viabilidad se use el companion post-entrenado con GRPO, no esta versión base.

## Enlaces

- Hugging Face: https://huggingface.co/McClain/PlasmidLM-kmer6
- Rama v1.0: https://huggingface.co/McClain/PlasmidLM-kmer6/tree/v1
- Modelo companion GRPO: https://huggingface.co/McClain/PlasmidLM-kmer6-GRPO-plannotate
- Código: https://github.com/McClain-Thiel/PlasmidLLM
- Datasets y split `cluster_v3`: `hf://buckets/McClain/PlasmidRL/datasets/`
- Archivo de evaluación (`rigor_20261116`): `hf://buckets/McClain/PlasmidLMEval/rigor_20261116/`
