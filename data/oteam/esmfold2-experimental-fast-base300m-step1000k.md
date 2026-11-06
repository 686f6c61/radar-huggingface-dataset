# oteam/esmfold2-experimental-fast-base300m-step1000k

## Resumen

ESMFold2 es una implementación no oficial del modelo de predicción de estructura de proteínas descrito por el equipo de Biohub en el artículo "Language Modeling Materializes a World Model of Protein Biology" (Candido et al.). El checkpoint aquí documentado, `esmfold2-experimental-fast-base300m-step1000k`, forma parte del flujo de trabajo experimental de diseño de binders y representa uno de los 15 críticos de escalado incluidos en la familia Experimental-Fast. Lo publica el equipo OFoldX (usuario `oteam`) bajo licencia AGPL-3.0 y depende de la librería `ofoldx` para su ejecución.

La arquitectura combina un codificador de lenguaje de proteínas congelado (ESMC-6B) que aporta representaciones de secuencia, un tronco de plegamiento recurrente de 24 bloques y una cabeza de difusión que genera coordenadas atómicas, junto con cabezas de distograma y confianza que puntúan la predicción. A diferencia de la variante completa, esta versión "fast" no acepta condicionamiento por MSA y trabaja únicamente con secuencia única, lo que reduce el coste computacional del pipeline de diseño.

El modelo es relevante porque expone, en un formato reproducible, la maquinaria de inversión diferenciable para optimización de secuencias de binders proteicos: permite generar candidatos mediante gradientes y clasificarlos con predicciones de plegamiento, un flujo que hasta ahora solo estaba disponible en implementaciones cerradas o de referencia. Su tamaño declarado de 504 millones de parámetros corresponde al checkpoint publicado en safetensors, mientras que la model card indica 6.530 millones para la variante Experimental Fast completa, cifra que incluye el codificador ESMC-6B congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMC-conditioned recurrent all-atom folding model con cabeza de difusión para coordenadas |
| Parametros totales | 504.108.490 (checkpoint safetensors); la variante Experimental Fast completa declara 6.530,863 M incluyendo ESMC-6B congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other |
| Tamaño del repo | 2,0 GB |
| Bloques de plegamiento | 24 |
| Condicionamiento MSA | no |
| Encoder ESMC | 6B (congelado, MultiMolecule ESMC-6B) |
| Single size / Pair size / Atom size / Token size | 384 / 256 / 128 / 768 |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo | 14 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido en tres etapas. Primero, un codificador de lenguaje de proteínas congelado (ESMC-6B, del checkpoint MultiMolecule ESMC-6B) transforma la secuencia de aminoácidos en representaciones por residuo y por par de residuos, con dimensiones de 384 y 256 respectivamente. Después, un tronco de plegamiento recurrente de 24 bloques refina iterativamente esas representaciones con 4 actualizaciones recurrentes, manteniendo un estado atómico de dimensión 128 y un estado de token de 768. Finalmente, una cabeza de difusión genera las coordenadas atómicas en 14 pasos de muestreo, mientras que las cabezas de distograma y confianza producen la matriz de distancias y las puntuaciones de fiabilidad de la predicción.

Las variantes experimentales añaden inversión diferenciable, lo que permite optimizar secuencias de binders mediante gradientes a través del modelo de plegamiento. El flujo de diseño requiere los 19 pares modelo-procesador del repositorio experimental, incluso cuando los críticos de escalado están desactivados, y la detección de anticuerpos y la puntuación de CDR usan ANARCI con el ejecutable `hmmscan` de HMMER en el `PATH`. Según la model card, Biohub reporta entrenamiento sobre datos del Protein Data Bank (PDB) y AlphaFold DB (AFDB) con un corte de septiembre de 2021; no se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Predicción de estructura de proteínas all-atom a partir de secuencia o de estructura de entrada en formato CIF.
- Generación de coordenadas atómicas mediante cabeza de difusión con 14 pasos de muestreo.
- Puntuación de confianza de la predicción (cabezas de distograma y confianza) con informe asociado.
- Diseño de secuencias de binders proteicos mediante inversión diferenciable y optimización por gradientes.
- Clasificación y ranking de candidatos de binder usando predicciones de plegamiento.
- Detección automática de anticuerpos y puntuación de CDR (requiere ANARCI y HMMER `hmmscan`).
- Modo de secuencia única sin condicionamiento MSA (variante Fast).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: es un modelo biológico especializado, no un modelo de lenguaje conversacional.

## Casos de uso

- Predicción de estructura de proteínas en investigación académica: el pipeline `ofoldx.pipeline("fold", model="oteam/esmfold2")` acepta estructuras CIF o secuencias y devuelve coordenadas y confidencias, adecuado para caracterizar proteínas sin estructura experimental resuelta.
- Diseño de binders terapéuticos: el pipeline `design` optimiza secuencias de binder con gradientes y las clasifica según predicciones de plegamiento, útil en fases tempranas de descubrimiento de anticuerpos y péptidos de unión.
- Filtrado y priorización de candidatos en campañas de protein engineering: los críticos de escalado de la familia Experimental-Fast permiten puntuar lotes de secuencias generadas por otros métodos antes de pasar a validación experimental.
- Análisis de interfaces proteína-proteína: la combinación de tronco recurrente y cabeza de distograma permite estudiar la geometría de la interfaz en complejos diseñados.
- Detección y anotación de anticuerpos: con ANARCI y HMMER instalados, el flujo identifica automáticamente diseños de anticuerpo y puntúa sus regiones CDR, integrable en pipelines de descubrimiento de anticuerpos.
- Reproducción de experimentos del artículo de Biohub: al ser una implementación no oficial con licencia AGPL-3.0, sirve para replicar y auditar los resultados de predicción y diseño publicados, sin depender del repositorio oficial.
- Integración en flujos de diseño generativo: la inversión diferenciable permite usar el modelo como capa de puntuación dentro de bucles de optimización de secuencias, combinándolo con generadores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint safetensors ocupa 2,0 GB, pero el pipeline completo descarga además el codificador ESMC-6B congelado, lo que eleva sustancialmente los requisitos reales.
- GPU recomendadas: no disponible. Por el tamaño del encoder ESMC-6B asociado, se requiere una GPU con memoria amplia; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: no disponible; la información no permite confirmarlo.
- Opciones de despliegue: la vía documentada es la librería `ofoldx` (`pip install ofoldx`) con los pipelines `fold` y `design`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MSA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold2 Experimental Fast (este checkpoint) | 504 M (checkpoint); 6.530,863 M con ESMC-6B | no disponible | no | AGPL-3.0 | Hugging Face, libreria ofoldx |
| ESMFold2 Fast (oteam/esmfold2-fast) | 6.533,723 M con ESMC-6B | no disponible | no | AGPL-3.0 | Hugging Face, libreria ofoldx |
| ESMFold2 completo (oteam/esmfold2) | 6.579,742 M con ESMC-6B | no disponible | si | AGPL-3.0 | Hugging Face, libreria ofoldx |
| ESMFold2 Experimental (oteam/esmfold2-experimental) | 6.577,328 M con ESMC-6B | no disponible | si | AGPL-3.0 | Hugging Face, libreria ofoldx |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de predicción frente a alternativas como AlphaFold2 o AlphaFold3 en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido redactada por el equipo OFoldX, no por los autores originales de ESMFold2 (Biohub), por lo que puede contener desviaciones respecto al modelo de referencia.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que integre el modelo y puede ser incompatible con productos propietarios; revisar antes de uso comercial.
- Dependencia de componentes externos: el flujo de diseño requiere los 19 pares modelo-procesador del repositorio experimental, incluso con críticos de escalado desactivados, y la detección de anticuerpos exige ANARCI y el ejecutable `hmmscan` de HMMER en el `PATH`.
- Sin condicionamiento MSA en esta variante: la ausencia de evidencia MSA puede reducir la precisión en secuencias con pocos homólogos conocidos.
- Riesgo de alucinación estructural: como todo modelo generativo de estructuras, puede producir coordenadas plausibles pero incorrectas; las confidencias deben interpretarse con cautela y validarse experimentalmente.
- Sesgos de datos: el entrenamiento se basa en PDB y AFDB con corte de septiembre de 2021, lo que puede infrarrepresentar familias proteicas poco presentes en esas bases.
- Sin datos de benchmarks publicados ni métricas de latencia o throughput en la información disponible, lo que dificulta evaluar su rendimiento frente a alternativas.
- Modelo de cero descargas y cero likes en el momento de la ficha: sin validación comunitaria documentada.
- No es un modelo de lenguaje: no soporta conversación, tool calling ni tareas multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/esmfold2-experimental-fast-base300m-step1000k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante Fast: https://huggingface.co/oteam/esmfold2-fast
- Variante Experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante Experimental Fast: https://huggingface.co/oteam/esmfold2-experimental-fast
- Checkpoint ESMC-6B: https://huggingface.co/multimolecule/esmc-6b
- Codigo del modelo: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Guia de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio oficial: https://github.com/Biohub/esm
- Libreria ofoldx: https://ofoldx.valtech.ai/
