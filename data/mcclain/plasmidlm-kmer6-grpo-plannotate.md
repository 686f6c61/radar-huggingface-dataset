# McClain/PlasmidLM-kmer6-GRPO-plannotate

## Resumen

PlasmidLM-kmer6-GRPO-plannotate es un modelo de lenguaje autoregresivo de 19,3 millones de parámetros especializado en la generación condicional de ADN de plásmidos. Lo desarrolla McClain Thiel (con Chris P. Barnes como coautor en la publicación asociada) y se distribuye bajo licencia Apache 2.0. No es un modelo de propósito general: su vocabulario y su entrenamiento están orientados a secuencias de plásmidos, y su interfaz de prompting utiliza tokens especiales que representan elementos biológicos (orígenes de replicación, genes de resistencia a antibióticos, promotores, reporters).

El modelo parte de la base `McClain/PlasmidLM-kmer6` y se post-entrena mediante GRPO (Group Relative Policy Optimization) contra recompensas derivadas de anotación de secuencias (pLannotate). El objetivo es que, dado un conjunto de requisitos funcionales expresados como tokens, el modelo genere una secuencia de plásmido viable, funcional y correctamente anotada. Este checkpoint (`exp2_v2_s44`) es la release `v2.0` en la rama `main`, seleccionada por ser la de mayor tasa `useful@0.5` entre las tres semillas de GRPO-v2.

Su relevancia es doble: por un lado, demuestra que el post-entrenamiento con recompensas verificables (RL) puede aplicarse a dominios científicos con funciones de recompensa objetivas; por otro, ofrece un caso práctico de modelo pequeño (19M de parámetros, repo de 0,8 GB) que cabe en hardware modesto y se puede ejecutar con `transformers` estándar. Las evaluaciones publicadas son exclusivamente computacionales y requieren validación húmeda antes de cualquier síntesis.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm) con tokenizer de k-mers (k=6) y tokens especiales biológicos; requiere `trust_remote_code=True` |
| Parámetros totales | 19.318.656 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; `max_new_tokens` de generación fijado en 4.096 tokens en la receta y en la evaluación |
| Tipos de cuantización | no disponible (pesos en safetensors; al ser un modelo de 19M, la cuantización es innecesaria en la práctica) |
| Idiomas soportados | en (inglés para metadatos/prompts; la salida es secuencia de ADN, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `ae6bbca2d77db76eaad169e7cf17cf790bb69ac33d36a3e288a1528eb2ed7b44`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal autoregresivo que opera sobre una tokenización por k-mers de tamaño 6, complementada con tokens especiales que codifican elementos funcionales de plásmidos (`<BOS>`, `<AMR_KANAMYCIN>`, `<ORI_COLE1>`, `<PROM_T7>`, `<REPORTER_EGFP>`, `<SEP>`, entre otros). La generación es condicional: el prompt especifica los componentes deseados y el modelo produce la secuencia nucleotídica correspondiente.

El entrenamiento tiene dos fases. Primero, un preentrenamiento con partición cluster-disjoint (`cluster_base_s42`) para evitar fuga de información entre clusters homólogos de entrenamiento y test. Después, un post-entrenamiento con GRPO-v2 sobre 1.000 pasos, con `G=8` (8 muestras por prompt), `kl_coef=0.5` y `max_new_tokens=4096`. La recompensa se basa en anotación de secuencias (pLannotate) y es "specificity-aware": penaliza la aparición de clases ORI/AMR no solicitadas, además de premiar la viabilidad y la funcionalidad. El checkpoint publicado corresponde a la semilla 44 de la familia `exp2_v2`; el repositorio incluye además las ramas `v2-seed42` y `v2-seed43`, y ablaciones emparejadas (`exp1-v2-*` con GRPO-v2 y `exp1-v1-*` con GRPO-v1 recall-only) para comparar recetas.

## Capacidades

- Generación condicional de secuencias de ADN de plásmidos a partir de un prompt de elementos funcionales.
- Control de especificidad: el GRPO-v2 reduce las clases ORI/AMR no solicitadas en 0,155 respecto a GRPO-v1 (`p_Holm=0.0012`).
- Producción de secuencias viables: 83,49% de tasa de viabilidad en el panel de evaluación `frozen_panel_v3`.
- Recuperación de ORFs intactos según NCBI AMRFinderPlus: 61,26% de recall (cobertura 65,37%).
- Generación de longitud media de 11.264 pb con contenido GC del 50,5%.
- Soporte de tool calling / function calling: no disponible (no aplica al dominio).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica al dominio).
- Capacidades multilingües: limitadas al inglés en metadatos; la salida es secuencia de ADN.
- Capacidades especiales: prompt biológico con tokens especiales, decodificación por muestreo con `temperature` y `top_p`, y modo de evaluación single-shot.

## Casos de uso

- Diseño asistido de plásmidos de expresión: dado un conjunto de requisitos (origen de replicación, marcador de selección, promotor y gen reportero), el modelo genera un borrador de secuencia que después se valida in silico con pLannotate y herramientas de anotación antes de la síntesis.
- Generación de candidatos para cribado experimental: la tasa de viabilidad del 83,49% permite producir lotes de secuencias con una fracción alta de candidatos plausibles, reduciendo el coste de filtrado previo en el laboratorio.
- Exploración de variantes de resistencia a antibióticos: el prompt permite fijar la clase AMR deseada y el modelo genera secuencias con el gen correspondiente, útil para estudiar combinaciones de marcadores en vectores.
- Construcción de librerías de plásmidos para biología sintética: la generación condicional por elementos facilita crear variantes sistemáticas (distintos promotores, orígenes o reporters) sobre un mismo esqueleto.
- Benchmarking de modelos de ADN: al publicar tres semillas y ablaciones emparejadas (GRPO-v1 vs. GRPO-v2), sirve como referencia reproducible para comparar recetas de RL con recompensas verificables en dominios biológicos.
- Docencia e investigación en modelos de lenguaje para genómica: su tamaño (19M de parámetros, 0,8 GB) permite ejecutarlo en una GPU de consumo o incluso en CPU, lo que lo hace adecuado para experimentos de post-entrenamiento con RL en entornos con recursos limitados.
- Pre-filtrado en pipelines de diseño génico: integrado como generador de candidatos antes de un análisis más costoso (p. ej., simulación de expresión o comprobaciones de bioseguridad), reduce el espacio de búsqueda inicial.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index`, sobre el panel `frozen_panel_v3` (panel de test cluster-disjoint, n=468 clusters, `t=0.3`, hasta 4.096 tokens). No están verificados de forma independiente (`verified: false`).

| Métrica | Este checkpoint (`exp2_v2_s44`) | Media de la familia 3 semillas (`exp2_v2`) |
|---|---:|---:|
| Tasa de viabilidad (single-shot) | 83,49% | 83,3 ± 0,2% |
| Media de `F` | 49,14% | 49,2 ± 0,2% |
| `Useful@0.5` (T=0,5, single-shot) | 58,49% | 58,0 ± 0,7% |
| BoK-4 Useful | no disponible | 85,5% |
| ORI/AMR extra | 0,763 | 0,77 ± 0,01 |
| Recall de ORF intacto (AMRFinderPlus) | 61,26% (cobertura 65,37%) | 61,0 ± 0,2% |
| Péptido traducido completo `TAG` (Prodigal) | 16,10% | 16,6 ± 0,7% |
| Longitud media | 11.264 pb | 11.138 ± 136 pb |
| GC | 50,5% | 50,5% |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (19,3M de parámetros ≈ 77 MB de pesos; el repo ocupa 0,8 GB incluyendo tokenizer y artefactos). Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). También es viable en CPU para generación single-shot, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con soporte de PyTorch.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado del tokenizer/modelo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el código personalizado y el tokenizer de k-mers hacen poco probable un soporte directo en esos motores sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada. La generación de hasta 4.096 tokens por secuencia con `G=8` en entrenamiento sugiere que la inferencia single-shot es rápida en GPU, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, la familia `exp1-v2-*` y `exp1-v1-*` del mismo autor (ramas del repositorio) permite comparar recetas de RL, pero no son modelos independientes.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| PlasmidLM-kmer6-GRPO-plannotate (`exp2_v2_s44`) | 19,3M | no disponible (generación hasta 4.096 tokens) | Apache 2.0 | Hugging Face | GRPO-v2, 3 semillas publicadas |
| PlasmidLM-kmer6 (base) | 19,3M | no disponible | Apache 2.0 | Hugging Face | Preentrenamiento cluster-disjoint |
| `exp1-v2-*` (GRPO-v2 sobre v1.0) | 19,3M | no disponible | Apache 2.0 | Hugging Face | Ablación emparejada |
| `exp1-v1-*` (GRPO-v1 recall-only) | 19,3M | no disponible | Apache 2.0 | Hugging Face | Ablación emparejada |

## Limitaciones y advertencias

- Todas las evaluaciones son computacionales (pLannotate, Prodigal, NCBI AMRFinderPlus); las secuencias requieren verificación en laboratorio húmedo antes de cualquier síntesis.
- GRPO-v2 reduce las clases ORI/AMR no solicitadas, pero no añade penalización por longitud: la longitud media es de 11,1 kb y el 70,8% de las generaciones alcanzan el límite de 4.096 tokens.
- No mejora la recuperación de péptidos `TAG_*` de ORF completo traducido (16,10% en este checkpoint).
- Riesgo de alucinación en el sentido biológico: el modelo puede generar secuencias que parecen plausibles pero que no son funcionales o que contienen elementos no solicitados; la validación in silico es obligatoria.
- Sesgos conocidos: no documentados en la información proporcionada; el entrenamiento está sesgado hacia la distribución de plásmidos del dataset `cluster_v3` y hacia las clases de elementos presentes en el vocabulario.
- Limitaciones de idioma: el modelo no procesa lenguaje natural; los prompts son tokens especiales biológicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre la bioseguridad de las secuencias generadas recae en el usuario.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en producción.
- El checkpoint `main` corresponde a la semilla 44 seleccionada por `useful@0.5`; las diferencias entre semillas son pequeñas (SD ≈ 0,7%), por lo que la elección de semilla no debe interpretarse como una mejora sustancial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McClain/PlasmidLM-kmer6-GRPO-plannotate
- Modelo base: https://huggingface.co/McClain/PlasmidLM-kmer6
- Código: https://github.com/McClain-Thiel/PlasmidLLM
- Datasets y split `cluster_v3`: `hf://buckets/McClain/PlasmidRL/datasets/`
- Archivo de evaluación (`rigor_20261116`): `hf://buckets/McClain/PlasmidLMEval/rigor_20261116/`
- Cita: Thiel, McClain y Barnes, Chris P. (2026), "PlasmidLM: A Promptable DNA Language Model via Verifiable-Reward Post-Training", https://github.com/McClain-Thiel/PlasmidLLM
