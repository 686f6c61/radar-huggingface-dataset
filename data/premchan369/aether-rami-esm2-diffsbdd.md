# Premchan369/aether-rami-esm2-diffsbdd

## Resumen

AETHER-RAMI es un modelo de extracción de características orientado al descubrimiento de fármacos basado en estructura (SBDD), publicado por Premchand Yadav (VIT-AP University) en colaboración con CSIR-IICT. El checkpoint alojado en Hugging Face, `aether-rami-esm2-diffsbdd`, contiene 6.919.918 parámetros reales en formato safetensors (26,42 MB) y se presenta como la "cabeza" de inferencia de un ecosistema mayor que, según la model card, se apoya en representaciones de ESM-2 de 3.0B parámetros y en un generador SE(3)-equivariante con flow matching para diseñar ligandos dentro de cavidades cristalográficas.

El modelo se enmarca en la intersección de los modelos de lenguaje de proteínas, la generación molecular 3D y la predicción de afinidad de unión. Sus casos declarados incluyen resistencia clínica en KRAS G12C (mutación Y96D), tuberculosis multirresistente, malaria cerebral, cáncer oral y anemia falciforme, con validación húmeda declarada en CSIR-IICT (14,8 nM en TB y 3,2 nM en malaria).

Es relevante ahora porque propone un pipeline unificado (codificación evolutiva ESM-2 + generación 3D + filtros físico-químicos PoseBusters + ADMET) para un problema que habitualmente requiere varios modelos especializados. No obstante, la práctica totalidad de las métricas de la model card están marcadas como `verified: false` y el repositorio no cuenta con descargas ni validación independiente en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto de investigación preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida declarada: backbone ESM-2 (transformer de proteínas) + cabeza de flow matching SE(3)-equivariante; el checkpoint publicado es una cabeza de feature-extraction de 6,92 M parámetros |
| Parametros totales | 6.919.918 (checkpoint safetensors publicado); la model card declara un ecosistema de hasta 3.0B (ESM-2 36L 3.0B / 33L 650M) no incluido en este repo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors fp32/fp16 sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también requiere `custom_code` / `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La model card describe AETHER-RAMI como un sistema jerárquico: un transformer de proteínas ESM-2 (Meta AI) de hasta 3.0B parámetros (36 capas) o 650M (33 capas) que codifica el bolsillo catalítico, acoplado a un generador generativo SE(3)-equivariante entrenado con *continuous optimal transport flow matching* para producir ligandos 3D directamente dentro de cavidades sin ligando. Sobre ese pipeline se sitúan módulos de predicción de afinidad, filtros de validez física (PoseBusters) y un cabezal ADMET. El checkpoint efectivamente publicado (6,92 M parámetros) corresponde, por tamaño, a la cabeza de inferencia y no al backbone completo, que no está incluido en el repositorio.

Los datos de entrenamiento declarados son PDBbind, ChEMBL, ZINC15, TDC y BindingDB. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, la presencia de RLHF/DPO ni detalles de la función de pérdida más allá de la mención al flow matching. Tampoco se documentan innovaciones verificables como decodificación especulativa o atención lineal; las afirmaciones sobre equivarianza SE(3) y transporte óptimo continuo provienen únicamente de la model card y no pueden contrastarse con el contenido del repositorio.

## Capacidades

- Extracción de características (feature-extraction) sobre secuencias y complejos proteína-ligando, tarea declarada del pipeline.
- Generación *de novo* de ligandos 3D en cavidades cristalográficas mediante flow matching equivariante (según model card).
- Predicción de afinidad de unión (Binding R2 y RMSE sobre log Kd declarados).
- Modelado de mutaciones de resistencia clínica: KatG S315T (TB-MDR), S108N (malaria cerebral), C797S (cáncer oral), Y96D (KRAS G12C) y T315I (BCR-ABL1).
- Predicción de propiedades ADMET (ROC-AUC declarado de 0,982).
- Filtrado de validez física de poses (PoseBusters, 98,4 % declarado).
- Integración declarada con AlphaFold, DiffDock y RFdiffusion en el ecosistema descrito.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma.
- Capacidades especiales: modo thinking, visión y audio no disponibles.

## Casos de uso

- Descubrimiento de leads en oncología de precisión: el modelo se usaría para generar y puntuar ligandos contra mutantes de resistencia como KRAS G12C Y96D, aprovechando la codificación ESM-2 del bolsillo para orientar la generación hacia cavidades mutadas y no hacia la proteína wild-type.
- Reposicionamiento frente a tuberculosis multirresistente: dado el foco declarado en MDR-TB y la mutación KatG S315T, encajaría en un pipeline de cribado virtual que priorice compuestos con actividad mantenida frente a cepas resistentes a isoniacida.
- Diseño de antivirales para arbovirosis: con dengue entre los objetivos declarados, se emplearía para proponer ligandos contra proteínas no estructurales del virus y filtrar poses con PoseBusters antes de la validación in vitro.
- Filtrado ADMET temprano: el cabezal ADMET declarado permitiría descartar candidatos con mala absorción o riesgo de cardiotoxicidad (hERG) antes de sintetizar, reduciendo el coste experimental.
- Priorización en enfermedades desatendidas: malaria cerebral, anemia falciforme y cáncer oral son objetivos declarados, lo que lo hace adecuado para programas con presupuesto limitado que necesitan cribado computacional masivo.
- Generación de poses 3D para docking asistido: la salida de flow matching puede alimentar herramientas como DiffDock o AutoDock como semilla inicial, mejorando la tasa de poses físicamente plausibles.
- Análisis de resistencia a fármacos en pipelines de farmacogenómica: modelar el efecto de mutaciones puntuales sobre la afinidad permitiría anticipar fracasos terapéuticos en dianas como BCR-ABL1 T315I.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (ninguno verificado de forma independiente; `verified: false` en todos los casos). Evaluados sobre PDBbind 2020 Refined Core Set:

| Metrica | Valor declarado | Verificado |
|---|---|---|
| Binding R2 | 0,964 | No |
| Binding RMSE (log Kd) | 0,210 | No |
| PoseBusters Physical Pass Rate | 98,4 % | No |
| ADMET ROC-AUC | 0,982 | No |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de referencia en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint publicado (6,92 M parámetros, 26,42 MB) cabe holgadamente en cualquier GPU consumer; en fp32 ocupa del orden de decenas de MB.
- Si se utiliza el backbone ESM-2 3.0B declarado (no incluido en este repo), se requerirían aproximadamente 12 GB en fp16 y 24 GB en fp32 solo para los pesos, más memoria para activaciones.
- GPU recomendadas: cualquier GPU con ≥8 GB para la cabeza publicada; para el ecosistema completo con ESM-2 3.0B, A100 40/80 GB, H100 o RTX 4090 (24 GB) en fp16.
- Cabe en GPU consumer: sí, el checkpoint publicado cabe en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `custom_code`); el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no están documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AETHER-RAMI (este) | 6,92 M (cabeza) / 3.0B declarado | No disponible | SBDD + afinidad + ADMET | Apache 2.0 | Hugging Face, sin descargas |
| ESM-2 (650M / 3B) | 650 M / 3.0 B | ~1024 residuos | Embeddings de proteínas | MIT | Ampliamente adoptado, verificado |
| DiffDock | No disponible | No disponible | Docking difusivo | MIT | Código abierto, benchmarks publicados |
| RFdiffusion | No disponible | No disponible | Diseño de proteínas | BSD | Código abierto, validación experimental |

La comparación directa es difícil: AETHER-RAMI combina varias tareas en un solo pipeline declarado, mientras que ESM-2, DiffDock y RFdiffusion son componentes especializados con validación independiente. No se dispone de comparaciones publicadas entre AETHER-RAMI y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Todas las métricas de la model card están marcadas como no verificadas (`verified: false`); no hay evaluación independiente ni revisión por pares disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que impide confirmar reproducibilidad por terceros.
- El checkpoint publicado (6,92 M parámetros) no contiene el backbone ESM-2 de 3.0B que la model card describe; el ecosistema completo no está disponible en este repo.
- Requiere `trust_remote_code=True` con código personalizado (`custom_code`), lo que implica ejecutar código no auditado; conviene revisar los archivos antes de cargarlos en producción.
- Riesgo de alucinación estructural: la generación molecular puede producir ligandos con validez química dudosa pese al 98,4 % declarado en PoseBusters; se recomienda filtrado adicional con RDKit y validación experimental.
- Las afirmaciones de validación húmeda en CSIR-IICT (14,8 nM en TB, 3,2 nM en malaria) no están respaldadas por publicaciones enlazadas en la información disponible.
- Idioma limitado a inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación independiente desaconseja su uso en decisiones clínicas o regulatorias sin verificación previa.
- No se documentan sesgos conocidos ni limitaciones de contexto; la ausencia de esta información es en sí misma un caveat.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Premchan369/aether-rami-esm2-diffsbdd
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Premchan369/aether-rami-drug-discovery-demo
- Portfolio del autor: https://premchandyadav1.vercel.app/
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- ESM-2 (Meta AI, backbone declarado): no disponible enlace específico en la información proporcionada
- Paper asociado: no disponible
- Repositorio de código: no disponible
