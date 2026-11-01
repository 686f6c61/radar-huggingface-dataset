# oteam/esmfold2-experimental-fast

## Resumen

ESMFold2-experimental-fast es un checkpoint de predicción de estructura de proteínas publicado por el equipo OFoldX (OTeam-AI4S) como implementación no oficial del modelo ESMFold2 descrito por Biohub en el artículo "Language Modeling Materializes a World Model of Protein Biology". Se trata de una variante "fast" del modelo experimental, con 24 bloques de folding en lugar de 48 y sin condicionamiento por MSA, pensada específicamente para la optimización de secuencias de binders proteicos mediante gradientes.

El modelo combina un codificador de lenguaje de proteínas congelado (ESMC-6B de MultiMolecule) con un tronco de folding recurrente, una cabeza de difusión que genera coordenadas atómicas y cabezas auxiliares de distograma y confianza. La variante experimental añade inversión diferenciable para el diseño de secuencias de binders. El repositorio contiene 178.996.573 parámetros en formato safetensors (0,7 GB), aunque la model card indica que el recuento completo de la variante, incluyendo el encoder ESMC-6B congelado, asciende a 6.530,863 millones de parámetros.

Es relevante porque ofrece una ruta abierta (licencia AGPL-3.0) para flujos de diseño de binders proteicos con gradientes, un área tradicionalmente dominada por herramientas propietarias o de acceso restringido. No obstante, se trata de un checkpoint experimental con cero descargas y cero likes en el momento de la consulta, lo que aconseja tratarlo con cautela en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de folding recurrente all-atom condicionado por ESMC, con cabeza de difusión para generación de coordenadas |
| Parámetros totales | 178.996.573 (safetensors del repo); 6.530,863 M incluyendo el encoder ESMC-6B congelado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques de folding | 24 |
| MSA | No |
| Encoder ESMC | 6B (congelado) |
| Single size / Pair size | 384 / 256 |
| Atom size / Token size | 128 / 768 |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo | 14 |
| Librería | ofoldx |
| Pipeline | other |

## Arquitectura y entrenamiento

ESMFold2-experimental-fast sigue la arquitectura ESMFold2: un encoder de lenguaje de proteínas ESMC-6B congelado que proporciona representaciones de secuencia a un tronco de folding recurrente de 24 bloques. Sobre ese tronco, una cabeza de difusión genera las coordenadas atómicas en 14 pasos de muestreo, mientras que cabezas de distograma y confianza puntúan la predicción. El modelo realiza 4 actualizaciones recurrentes y opera con dimensiones de single 384, pair 256, atom 128 y token 768. A diferencia de la variante completa, esta versión "fast" no acepta evidencia de MSA, lo que reduce el coste computacional a cambio de prescindir de información de alineamientos múltiples.

La variante experimental incorpora inversión diferenciable para el diseño de secuencias de binders proteicos, lo que permite optimizar secuencias mediante gradientes y clasificar candidatos con predicciones de folding. Según la model card, Biohub entrenó sobre datos del Protein Data Bank (PDB) y AlphaFold DB (AFDB), con un corte temporal en septiembre de 2021 (la información proporcionada se interrumpe en ese punto). No se detalla el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO. El flujo de diseño experimental incluye además 15 críticos de escalado `Fast-base{300M,600M,6B}-step{250,500,750,1000,1500}k`, junto con las variantes Experimental-Fast-Cutoff2025 y Experimental-Cutoff2025.

## Capacidades

- Predicción de estructura de proteínas all-atom a partir de secuencia o de estructura de entrada, con valores de confianza asociados.
- Generación de coordenadas atómicas mediante cabeza de difusión con 14 pasos de muestreo.
- Diseño de secuencias de binders proteicos mediante optimización basada en gradientes e inversión diferenciable.
- Clasificación y ranking de candidatos de binder usando predicciones de folding.
- Detección automática de diseños de anticuerpos (salvo que se especifique `is_antibody`), con puntuación de CDR mediante ANARCI.
- Procesamiento de secuencias de proteínas directamente, sin necesidad de estructura de entrada.
- No soporta tool calling, function calling ni razonamiento multi-step en el sentido de los modelos de lenguaje; es un modelo biológico especializado.
- No dispone de capacidades multilingües, de visión ni de audio.

## Casos de uso

- Diseño de binders proteicos de novo: el modelo permite optimizar secuencias de binder mediante gradientes y clasificar candidatos por calidad de folding, adecuado para campañas de descubrimiento de moléculas de unión con un objetivo proteico definido.
- Rediseño de anticuerpos: la detección automática de anticuerpos y la puntuación de CDR con ANARCI permiten evaluar y proponer variantes de regiones determinantes de complementariedad en flujos de ingeniería de anticuerpos.
- Predicción rápida de estructura monomérica: al prescindir de MSA, la variante fast reduce el coste frente a la versión completa, lo que la hace útil para cribados masivos de secuencias donde la latencia es crítica.
- Filtrado previo en pipelines de diseño: puede actuar como etapa de ranking de candidatos generados por otros métodos, descartando secuencias con folding poco plausible antes de validación experimental.
- Análisis de estabilidad de mutantes: la predicción de estructura y las puntuaciones de confianza permiten comparar variantes de una proteína y priorizar mutaciones para ensayos de laboratorio.
- Investigación en plegamiento con modelos de lenguaje: al usar un encoder ESMC-6B congelado, sirve como banco de pruebas para estudiar cómo las representaciones de modelos de lenguaje de proteínas condicionan la predicción estructural.
- Docencia y prototipado en bioinformática estructural: su integración en la librería `ofoldx` y su licencia AGPL-3.0 facilitan experimentos reproducibles en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repo pesa 0,7 GB en safetensors, pero el encoder ESMC-6B congelado se descarga aparte y eleva sustancialmente los requisitos.
- GPU recomendadas: no disponible. Por el tamaño del encoder ESMC-6B asociado, se requiere una GPU con memoria suficiente para un modelo de 6B parámetros, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`), que expone pipelines `fold` y `design`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. La variante fast (24 bloques, sin MSA) está diseñada para ser más rápida que la completa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | MSA | Bloques de folding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold2-experimental-fast (este) | 178,99 M en repo; 6.530,863 M con ESMC-6B | No | 24 | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2 (oteam/esmfold2) | 6.579,742 M con ESMC-6B | Sí | 48 | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2-fast (oteam/esmfold2-fast) | 6.533,723 M con ESMC-6B | No | 24 | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2-experimental (oteam/esmfold2-experimental) | 6.577,328 M con ESMC-6B | Sí | 48 | AGPL-3.0 | HuggingFace (oteam) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento predictivo con alternativas como AlphaFold3 u otras herramientas de folding, por lo que la comparación se limita a especificaciones estructurales y de licencia.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como experimental y está orientado a la optimización de secuencias de binders, no a uso general de predicción estructural.
- Implementación no oficial: el equipo de Biohub no escribió esta model card ni validó necesariamente este checkpoint; la implementación corre a cargo de OFoldX.
- Sin MSA: la variante fast prescinde de evidencia de alineamientos múltiples, lo que puede reducir la precisión en secuencias con pocos homólogos conocidos.
- Dependencia del encoder ESMC-6B: requiere descargar el checkpoint congelado de MultiMolecule, con el coste de memoria y almacenamiento asociado.
- Dependencias externas para anticuerpos: la detección de anticuerpos y la puntuación de CDR requieren ANARCI y el ejecutable `hmmscan` de HMMER en el `PATH`.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere evaluar la liberación del código derivado.
- Riesgo de alucinación estructural: como todo modelo generativo de estructuras, puede producir conformaciones plausibles pero incorrectas; las puntuaciones de confianza deben interpretarse con cautela.
- Sesgos de datos: el entrenamiento se basa en PDB y AFDB con corte en septiembre de 2021, lo que puede infrarrepresentar familias proteicas poco presentes en esas bases.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de comunidad ni de validación independiente.
- Idiomas: no aplica, pero la documentación y el soporte están en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-experimental-fast
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante fast: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Checkpoint ESMC-6B: https://huggingface.co/multimolecule/esmc-6b
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio oficial: https://github.com/Biohub/esm
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Librería ofoldx: https://ofoldx.valtech.ai/
