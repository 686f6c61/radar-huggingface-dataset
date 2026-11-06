# oteam/esmfold2-experimental

## Resumen

ESMFold2 es un modelo de predicción de estructura de proteínas de tipo all-atom desarrollado originalmente por el equipo de Biohub (Chan Zuckerberg Initiative), con autores como Salvatore Candido y Alexander Rives. Esta ficha concreta corresponde a `oteam/esmfold2-experimental`, una implementación no oficial publicada por el equipo OFoldX que empaqueta el flujo completo de diseño de binders proteicos: los 19 pares modelo-procesador necesarios para ejecutar la optimización de secuencias de binder mediante gradientes y su evaluación con predicciones de plegamiento.

Arquitectura: un codificador de lenguaje de proteínas ESMC-6B congelado que alimenta un tronco de plegamiento recurrente de 48 bloques, una cabeza de difusión que genera coordenadas atómicas y cabezas auxiliares de distograma y confianza. El modelo completo ronda los 6.577 millones de parámetros (incluyendo el codificador congelado) y está diseñado para inferencia sobre estructuras proteicas, no para generación de texto.

Su relevancia radica en que expone no solo predicción de estructura, sino también diseño de binders basado en gradientes, una capacidad poco frecuente en modelos abiertos de biología estructural. La licencia AGPL-3.0 y su naturaleza experimental exigen cautela en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMC-6B congelado + tronco de plegamiento recurrente (48 bloques) + cabeza de difusión para coordenadas atómicas |
| Parametros totales | 6.577,328 M (incluye el codificador ESMC-6B congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por la longitud de secuencia proteica; no se especifica un máximo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ESMFold2 emplea un codificador de lenguaje de proteínas ESMC-6B congelado (checkpoint MultiMolecule ESMC-6B) que proporciona representaciones de secuencia a un tronco de plegamiento recurrente. Este tronco, de 48 bloques en la variante completa, actualiza representaciones de tokens, pares y átomos (dimensiones 768, 256 y 128 respectivamente) a lo largo de 4 actualizaciones recurrentes. Una cabeza de difusión genera las coordenadas atómicas en 14 pasos de muestreo, mientras que cabezas de distograma y confianza puntúan la predicción. La variante Experimental admite condicionamiento por MSA (alineamiento múltiple de secuencias) y expone inversión diferenciable para el diseño de secuencias de binder.

El entrenamiento original, según reporta Biohub, se realizó sobre datos del Protein Data Bank (PDB) y AlphaFold DB (AFDB) con un corte temporal de septiembre de 2021. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición precisa del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos biológicos). La innovación técnica principal es la combinación de un codificador lingüístico de proteínas con un tronco recurrente y una cabeza de difusión, más la capacidad de inversión diferenciable para diseño de binders.

## Capacidades

- Predicción de estructura de proteínas all-atom (coordenadas atómicas completas, no solo cadena principal).
- Condicionamiento opcional por MSA en las variantes completas (Experimental y ESMFold2 estándar).
- Generación de puntuaciones de confianza y distogramas junto con la estructura predicha.
- Diseño de secuencias de binder proteico mediante optimización basada en gradientes.
- Detección automática de diseños de anticuerpos y puntuación de CDR (regiones determinantes de complementariedad).
- Flujo experimental con 19 pares modelo-procesador, incluyendo críticos de escalado `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k`.
- No soporta tool calling, agentes conversacionales ni capacidades multilingües: es un modelo especializado en biología estructural.

## Casos de uso

- Diseño de binders proteicos: el pipeline `design` optimiza secuencias de binder mediante gradientes y las clasifica según predicciones de plegamiento, útil para generar candidatos de unión a una diana terapéutica concreta.
- Predicción de estructura para validación experimental: dado un archivo CIF o una secuencia, el pipeline `fold` devuelve estructura y confianza, permitiendo priorizar candidatos antes de cristalografía o criomicroscopía.
- Ingeniería de anticuerpos: la detección automática de anticuerpos y la puntuación de CDR (vía ANARCI y HMMER) permiten evaluar y optimizar regiones de unión en flujos de descubrimiento de anticuerpos.
- Análisis de variantes y mutaciones: comparar estructuras predichas de variantes para estimar el impacto estructural de mutaciones en estudios de estabilidad o función.
- Filtrado en pipelines de diseño generativo: usar las puntuaciones de confianza y distogramas como criterio de selección dentro de un pipeline más amplio de generación y cribado de proteínas.
- Investigación en plegamiento con MSA: aprovechar el condicionamiento por MSA para estudiar cómo la evidencia evolutiva mejora la predicción en familias proteicas con homólogos conocidos.
- Docencia e investigación metodológica: al ser una implementación no oficial y abierta, sirve para reproducir y extender experimentos de plegamiento y diseño con fines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 133,3 GB e incluye el codificador ESMC-6B congelado y 19 pares modelo-procesador, lo que implica requisitos de memoria elevados para cargar el flujo experimental completo.
- GPU recomendadas: no especificadas en la información proporcionada; por el tamaño del codificador de 6B parámetros se requiere previsiblemente hardware de clase数据中心 (A100, H100) para ejecución cómoda.
- Viabilidad en GPU de consumo: no confirmada; el tamaño del repositorio y del codificador sugieren que no cabe en GPU de consumo convencionales sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: biblioteca `ofoldx` (pip install ofoldx); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencias adicionales: HMMER (`hmmscan` en PATH) y ANARCI para detección de anticuerpos y puntuación de CDR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MSA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/esmfold2-experimental | 6.577 M (con ESMC-6B) | no disponible | sí | AGPL-3.0 | Hugging Face (no oficial) |
| oteam/esmfold2 | 6.579,742 M | no disponible | sí | AGPL-3.0 | Hugging Face (no oficial) |
| oteam/esmfold2-fast | 6.533,723 M | no disponible | no | AGPL-3.0 | Hugging Face (no oficial) |
| oteam/esmfold2-experimental-fast | 6.530,863 M | no disponible | no | AGPL-3.0 | Hugging Face (no oficial) |

No se dispone de datos de benchmarks ni de comparación con modelos de terceros (por ejemplo, AlphaFold) en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card la redactó el equipo OFoldX, no los autores originales de ESMFold2; puede haber divergencias respecto al modelo oficial de Biohub.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con uso comercial propietario; revisar antes de producción.
- Carácter experimental: el repositorio está marcado como experimental y su flujo de diseño requiere todos los componentes, incluso con críticos de escalado desactivados.
- Dependencias externas frágiles: la detección de anticuerpos y la puntuación de CDR requieren ANARCI y el ejecutable `hmmscan` de HMMER en PATH.
- Riesgo de alucinación estructural: como todo modelo de predicción, puede generar estructuras plausibles pero incorrectas; las puntuaciones de confianza deben interpretarse con cautela.
- Sesgos de datos: entrenado sobre PDB y AFDB con corte en septiembre de 2021, lo que puede limitar su rendimiento en proteínas poco representadas o descubiertas después.
- Sin soporte lingüístico ni conversacional: no es adecuado para tareas de texto, agentes o tool calling.
- Sin datos de benchmarks ni de cuantización: no es posible estimar con precisión su calidad relativa ni su despliegue en hardware limitado a partir de la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/esmfold2-experimental
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante rápida: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental rápida: https://huggingface.co/oteam/esmfold2-experimental-fast
- Checkpoint ESMC-6B: https://huggingface.co/multimolecule/esmc-6b
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio oficial: https://github.com/Biohub/esm
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Biblioteca ofoldx: https://ofoldx.valtech.ai/
