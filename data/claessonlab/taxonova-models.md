# claessonlab/taxonova-models

## Resumen

Taxonova es un conjunto de checkpoints preentrenados para la clasificación taxonómica de secuencias de amplicón de ARN ribosomal 16S y del operón ribosomal completo. Lo desarrolla el Claesson Lab (University College Cork y APC Microbiome Ireland) y se distribuye como un paquete de Python (`taxonova`) con pesos en formato PyTorch. El modelo asigna cada lectura a un linaje taxonómico desde dominio hasta especie, proporcionando además una puntuación de confianza en cada rango, lo que lo hace útil para filtrar asignaciones dudosas en análisis de microbioma.

A diferencia de los clasificadores basados en alineamiento o en k-mers (como QIIME 2 con clasificadores Naive Bayes o VSEARCH), Taxonova emplea una red neuronal profunda entrenada sobre referencias taxonómicas curadas (Greengenes2 2024.09 y GROND con GTDB R207), lo que permite una clasificación rápida y con conciencia de incertidumbre. El repositorio incluye cinco checkpoints especializados por región del gen 16S (V4, V3-V4, V5-V7, gen completo V1-V9 y operón 16S-ITS-23S).

El modelo es relevante para investigadores en ecología microbiana que necesitan procesar grandes volúmenes de lecturas de secuenciación de amplicones con resolución de especie y control de calidad basado en confianza. Su licencia MIT y su integración en un paquete pip facilitan su adopción en pipelines bioinformáticos existentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda (detalles no disponibles en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre secuencias de amplicón de longitud variable) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias biológicas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`), contiene pesos, codificadores de etiquetas y taxonomía |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de la red (número de capas, tipo de bloques, mecanismos de atención o convoluciones). Se sabe que el modelo se entrena mediante el comando `taxonova training` y que cada checkpoint empaqueta los pesos de la red junto con los codificadores de etiquetas y la taxonomía de referencia, de modo que la inferencia es autocontenida.

Los datos de entrenamiento se basan en referencias taxonómicas curadas: Greengenes2 2024.09 para los modelos de 16S (V4, V3-V4, V5-V7 y gen completo) y GROND (construcción GTDB R207) para el modelo de operón. Los nombres de especie siguen la nomenclatura GTDB. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables en este dominio). La innovación principal es la clasificación con puntuación de confianza por rango taxonómico, que permite descartar asignaciones poco fiables.

## Capacidades

- Clasificación taxonómica de secuencias de amplicón 16S rRNA desde dominio hasta especie.
- Clasificación de amplicones de las regiones V4, V3-V4, V5-V7 y del gen 16S completo (V1-V9).
- Clasificación del operón ribosomal completo (16S-ITS-23S) mediante el modelo `operon`.
- Asignación de una puntuación de confianza en cada rango taxonómico, lo que permite filtrar resultados por umbral.
- Procesamiento por lotes de archivos FASTA mediante la interfaz de línea de comandos (`taxonova classify reads.fasta --model v4`).
- Uso en navegador a través de una aplicación web alojada en Hugging Face Spaces.
- Verificación de integridad de los pesos mediante sha256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de modelos de lenguaje; su dominio es exclusivamente bioinformático.

## Casos de uso

- Perfilado taxonómico de estudios de microbioma: el modelo clasifica lecturas de amplicón 16S V4 procedentes de secuenciación Illumina, asignando especie y confianza para construir tablas de abundancia relativa en estudios de cohortes.
- Control de calidad en pipelines de secuenciación: las puntuaciones de confianza por rango permiten descartar lecturas con asignaciones ambiguas antes de análisis estadísticos posteriores, reduciendo falsos positivos.
- Análisis de regiones alternativas: laboratorios que secuencian V3-V4 o V5-V7 pueden usar el checkpoint específico en lugar de reentrenar un clasificador, manteniendo coherencia taxonómica con Greengenes2.
- Clasificación de operones ribosómicos: en estudios que secuencian el operón 16S-ITS-23S para mayor resolución, el modelo `operon` basado en GROND/GTDB R207 ofrece asignación a nivel de especie con nomenclatura GTDB.
- Integración en pipelines automatizados: el paquete `taxonova` se instala con pip y se invoca desde scripts o flujos de trabajo (Snakemake, Nextflow) para procesar lotes de FASTA de forma reproducible, con verificación de hash de los pesos.
- Docencia y exploración rápida: la aplicación web permite a investigadores sin experiencia en línea de comandos clasificar un archivo FASTA y explorar resultados de confianza sin instalar software.
- Comparación de clasificadores: al ser MIT y de código abierto, sirve como referencia para comparar con clasificadores Naive Bayes o basados en alineamiento en estudios metodológicos de microbioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo de PLoS Computational Biology (Kakabra et al., 2026) para la evaluación del método, pero los valores numéricos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 2,1 GB, lo que sugiere que los checkpoints son ligeros y probablemente caben en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio (2,1 GB para cinco checkpoints) es plausible que quepa en tarjetas con 4-8 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: paquete Python `taxonova` (pip), interfaz de línea de comandos e integración en Hugging Face Spaces. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Referencia taxonómica | Confianza por rango | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taxonova | Red neuronal profunda | Greengenes2 2024.09 / GROND (GTDB R207) | Sí | MIT | Hugging Face, GitHub, pip |
| QIIME 2 Naive Bayes | Clasificador Naive Bayes | Greengenes2 / SILVA | Sí (probabilidades) | BSD-3 | QIIME 2 |
| VSEARCH | Alineamiento por k-mers | SILVA / Greengenes | No nativa | GPL-2.0 | GitHub, bioconda |
| IDTAXA | Clasificador basado en árboles de decisión | SILVA / Greengenes | Sí | GPL-3.0 | Bioconductor |

No se dispone de datos de rendimiento comparativo en la información proporcionada para cuantificar diferencias de precisión o velocidad frente a estas alternativas.

## Limitaciones y advertencias

- La información proporcionada no detalla sesgos conocidos del modelo; al entrenarse sobre Greengenes2 y GROND, hereda las limitaciones de cobertura taxonómica de dichas bases de referencia.
- Riesgo de asignaciones erróneas en especies ausentes de la referencia: el modelo puede asignar una lectura a la especie más cercana disponible, por lo que es imprescindible usar las puntuaciones de confianza.
- La clasificación está restringida a las regiones de amplicón para las que existe checkpoint (V4, V3-V4, V5-V7, V1-V9 y operón); no cubre otras regiones ni genes distintos del rRNA.
- La nomenclatura de especies sigue GTDB, lo que puede diferir de SILVA o de nombres tradicionales y complicar la integración con pipelines existentes.
- Los checkpoints se cargan mediante pickle de Python; solo deben usarse archivos del repositorio oficial o de las releases de GitHub, verificando el sha256, por riesgo de ejecución de código malicioso.
- Licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de referencia subyacentes (Greengenes2, GROND), cuyas licencias deben verificarse por separado.
- No se dispone de información sobre latencia, throughput ni requisitos mínimos de hardware, lo que dificulta planificar despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/claessonlab/taxonova-models
- Repositorio GitHub: https://github.com/kardokhk/taxonova
- Releases con los archivos: https://github.com/kardokhk/taxonova/releases
- Documentación de modelos: https://github.com/kardokhk/taxonova/blob/main/docs/models.md
- Aplicación web: https://huggingface.co/spaces/claessonlab/Taxonova
- Artículo: Kakabra K, Patel S, Temko A, Claesson MJ. Taxonova: deep learning enables fast and confidence-aware microbiome species-level amplicon classification. PLoS Comput Biol. 2026;22(10):e1014912. doi:10.1371/journal.pcbi.1014912
- Issues: https://github.com/kardokhk/taxonova/issues
