# oteam/esmfold2-experimental-fast-base600m-step250k

## Resumen

ESMFold2 Experimental Fast Base600M Step250k es un checkpoint de predicción de estructura proteica de todos los átomos desarrollado por el equipo OFoldX (oteam) como implementación no oficial de ESMFold2, el modelo descrito en el artículo "Language Modeling Materializes a World Model of Protein Biology" de Biohub. El modelo combina un codificador de lenguaje de proteínas ESMC-6B congelado con un tronco de plegamiento recurrente de 24 bloques y una cabeza de difusión que genera coordenadas atómicas, junto con cabezas de distograma y confianza para puntuar la predicción.

Este checkpoint concreto pertenece a la familia de "scaling critics" del flujo de diseño de binders (Fast-base600M-step250k), es decir, variantes de tamaño intermedio (600M de parámetros en el crítico) entrenadas durante 250 000 pasos y utilizadas para la optimización y el ranking de secuencias de binders proteicos mediante gradientes. El repositorio declara 746 187 472 parámetros totales en los pesos safetensors y ocupa 3,0 GB.

Su relevancia es doble: por un lado, ofrece una alternativa de código abierto (licencia AGPL-3.0) a las implementaciones propietarias de predicción estructural de todos los átomos; por otro, expone el flujo completo de diseño de binders con modelos diferenciables, algo poco habitual en el ecosistema abierto. No obstante, se trata de un modelo experimental de investigación, sin descargas ni validación comunitaria en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMC-conditioned recurrent all-atom folding model con cabeza de difusión para generación de coordenadas |
| Parametros totales | 746.187.472 (según safetensors); el autor declara 6.530,863 M para la variante Experimental Fast incluyendo el codificador ESMC-6B congelado |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de plegamiento, no de lenguaje; opera sobre secuencias de proteínas de longitud variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other |
| Bloques de plegamiento | 24 |
| Condicionamiento MSA | no |
| Codificador ESMC | 6B (congelado, MultiMolecule ESMC-6B) |
| Single size / Pair size | 384 / 256 |
| Atom size / Token size | 128 / 768 |
| Actualizaciones recurrentes | 4 |
| Pasos de muestreo | 14 |
| Tamano del repo | 3,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESMFold2: un codificador de lenguaje de proteínas ESMC-6B congelado que proporciona representaciones de secuencia a un tronco de plegamiento recurrente de 24 bloques. Sobre ese tronco, una cabeza de difusión genera las coordenadas atómicas de todos los átomos, mientras que cabezas auxiliares de distograma y confianza puntúan la predicción. La variante Fast prescinde del condicionamiento por MSA (alineamiento múltiple de secuencias), lo que reduce el coste computacional a cambio de renunciar a evidencia evolutiva. Las dimensiones internas son 384 (single), 256 (pair), 128 (atom) y 768 (token), con 4 actualizaciones recurrentes y 14 pasos de muestreo en la difusión.

Según la model card, Biohub reporta entrenamiento sobre datos del Protein Data Bank (PDB) y de AlphaFold DB (AFDB), con un corte de septiembre de 2021 (la información se trunca en ese punto). El checkpoint aquí descrito es un "scaling critic" de la familia Fast-base600M-step250k, entrenado durante 250 000 pasos y usado dentro del flujo experimental de diseño de binders para optimizar secuencias mediante gradientes y clasificar candidatos con predicciones de plegamiento. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se emplearon RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de estructura proteica de todos los átomos a partir de secuencia o de estructura de entrada.
- Generación de coordenadas atómicas mediante cabeza de difusión con 14 pasos de muestreo.
- Puntuación de confianza de la predicción mediante cabezas de distograma y confianza.
- Diseño y optimización de secuencias de binders proteicos mediante inversión diferenciable y gradientes.
- Ranking de candidatos de binder usando predicciones de plegamiento como crítico.
- Detección automática de diseños de anticuerpos y puntuación de CDR (requiere ANARCI y el ejecutable `hmmscan` de HMMER en el PATH).
- Ejecución en modo single-sequence (sin MSA) para la variante Fast.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo biológico especializado.

## Casos de uso

- Predicción estructural de proteínas de novo: dada una secuencia aminoacídica, el pipeline `fold` devuelve la estructura de todos los átomos y valores de confianza, útil para caracterizar dianas sin estructura experimental.
- Diseño de binders proteicos: el pipeline `design` optimiza secuencias de binder (por ejemplo, 80 residuos) mediante gradientes y las clasifica con predicciones de plegamiento, adecuado para campañas de descubrimiento de moléculas de unión.
- Ingeniería de anticuerpos: la detección automática de anticuerpos y la puntuación de CDR permiten evaluar y priorizar diseños de regiones determinantes de complementariedad.
- Filtrado computacional previo a experimentos: el modelo actúa como crítico para descartar candidatos con baja confianza antes de sintetizarlos en laboratorio, reduciendo costes experimentales.
- Análisis de variantes y mutaciones: comparar estructuras predichas entre secuencias wild-type y mutantes para estimar el impacto estructural de cambios puntuales.
- Integración en pipelines de biología computacional: la librería `ofoldx` permite componer ejecuciones por etapas y automatizar flujos de plegamiento y diseño en entornos de investigación.
- Estudio de la relación secuencia-estructura: al usar un ESMC-6B congelado, el modelo sirve para analizar cuánta información estructural captura el lenguaje de proteínas sin MSA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 3,0 GB en safetensors, pero el pipeline descarga además el codificador ESMC-6B congelado, lo que eleva considerablemente el consumo de memoria.
- GPU recomendadas: no disponible. Por el tamaño del codificador ESMC-6B y el tronco de plegamiento, se requiere una GPU de datacenter (A100, H100) para ejecución cómoda; no hay datos publicados que confirmen su viabilidad en GPU de consumo.
- ¿Cabe en GPU de consumo? No disponible; la presencia del ESMC-6B hace improbable su ejecución completa en GPUs de consumo con VRAM limitada.
- Opciones de despliegue: librería `ofoldx` (pip install ofoldx) con pipelines `fold` y `design`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Licencia | Disponibilidad |
|---|---|---|---|---|
| ESMFold2 Experimental Fast Base600M Step250k (este) | 746 M (safetensors); 6.530,863 M declarados con ESMC-6B | Sin MSA; single-sequence | AGPL-3.0 | HuggingFace (oteam), 0 descargas |
| ESMFold2 (oteam/esmfold2) | 6.579,742 M declarados | Con MSA opcional; 48 bloques | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2 Fast (oteam/esmfold2-fast) | 6.533,723 M declarados | Sin MSA; 24 bloques | AGPL-3.0 | HuggingFace (oteam) |
| ESMFold2 Experimental (oteam/esmfold2-experimental) | 6.577,328 M declarados | Con MSA; 48 bloques; flujo completo de 19 pares modelo-procesador | AGPL-3.0 | HuggingFace (oteam) |

La comparación se limita a las variantes de la propia familia OFoldX, ya que la información disponible no incluye datos de benchmarks ni especificaciones de modelos alternativos de terceros (por ejemplo, AlphaFold3) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo experimental de investigación: no se han publicado benchmarks ni validación independiente en la información disponible.
- Implementación no oficial: la model card ha sido escrita por el equipo OFoldX, no por los autores originales de ESMFold2 (Biohub).
- Sin condicionamiento MSA en la variante Fast, lo que puede degradar la precisión en secuencias con poca señal evolutiva.
- El flujo de diseño de binders requiere todos los componentes del repositorio experimental, incluso cuando los críticos de escalado están desactivados.
- La detección de anticuerpos y la puntuación de CDR dependen de ANARCI y del ejecutable `hmmscan` de HMMER en el PATH; su ausencia rompe esa funcionalidad.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso en red y comercial; es necesario revisar su compatibilidad antes de integrarlo en productos propietarios.
- Riesgo de alucinación estructural: como todo modelo generativo de coordenadas, puede producir estructuras plausibles pero incorrectas, especialmente en regiones desordenadas o sin homología.
- Sesgos derivados de los datos de entrenamiento (PDB y AFDB con corte de septiembre de 2021): infrarrepresentación de ciertas familias proteicas y de estructuras posteriores a esa fecha.
- Sin información sobre cuantizaciones soportadas ni requisitos de hardware verificados; el despliegue en producción requiere validación propia.
- Cero descargas y cero likes en el momento de redactar la ficha: ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/esmfold2-experimental-fast-base600m-step250k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante Fast: https://huggingface.co/oteam/esmfold2-fast
- Variante Experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante Experimental Fast: https://huggingface.co/oteam/esmfold2-experimental-fast
- Codificador ESMC-6B: https://huggingface.co/multimolecule/esmc-6b
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio oficial de ESMFold2: https://github.com/Biohub/esm
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Librería ofoldx: https://ofoldx.valtech.ai/
