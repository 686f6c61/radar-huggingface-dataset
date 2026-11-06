# oteam/esmfold2-experimental-fast-base300m-step1500k

## Resumen

ESMFold2 Experimental Fast Base300M Step1500k es un checkpoint de predicción de estructura proteica de todos los átomos desarrollado por el equipo OFoldX (oteam) como implementación no oficial del modelo ESMFold2 descrito por Biohub en el artículo "Language Modeling Materializes a World Model of Protein Biology". Se trata de una variante "fast" de 24 bloques de plegamiento, sin condicionamiento por MSA, que utiliza el codificador de lenguaje proteico ESMC-6B congelado como fuente de representaciones de secuencia y un tronco recurrente de plegamiento con cabeza de difusión para generar coordenadas atómicas.

El checkpoint concreto corresponde a uno de los "scaling critics" del flujo de diseño de binders: la variante base de 300M parámetros entrenada hasta el paso 1500k. El repositorio contiene 504.108.490 parámetros en formato safetensors (2,0 GB), lo que sugiere que este checkpoint concreto no incluye el encoder ESMC-6B completo en sus pesos, a diferencia de los recuentos de la model card original que sí lo contabilizan.

Es relevante porque expone públicamente una pieza del pipeline de diseño de proteínas mediante gradientes (binder design), un área donde la mayoría de implementaciones abiertas se limitan a predicción de estructura y no a optimización de secuencia. La licencia AGPL-3.0 impone obligaciones copyleft estrictas para uso en red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de plegamiento recurrente de todos los átomos condicionado por ESMC, con cabeza de difusión para generación de coordenadas |
| Parametros totales | 504.108.490 (safetensors del repositorio); la model card del autor indica 6.530,863 M para la variante Experimental Fast incluyendo el encoder ESMC-6B congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de secuencia proteica, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje natural; opera sobre secuencias de aminoácidos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ESMFold2 emplea un encoder de lenguaje proteico ESMC-6B congelado que proporciona representaciones de secuencia a un tronco de plegamiento recurrente. Sobre este tronco, una cabeza de difusión genera las coordenadas atómicas, mientras que cabezas de distograma y de confianza puntúan la predicción. La variante Experimental Fast usa 24 bloques de plegamiento (frente a los 48 de la versión completa), no acepta evidencia de MSA, y mantiene dimensiones de single 384, pair 256, átomo 128 y token 768, con 4 actualizaciones recurrentes y 14 pasos de muestreo.

Las variantes experimentales exponen inversión diferenciable para el diseño de secuencias de binders proteicos: se optimizan secuencias mediante gradientes y se clasifican los candidatos con predicciones de plegamiento. Según Biohub, el entrenamiento se realizó sobre datos del Protein Data Bank (PDB) y AlphaFold DB (AFDB), con un corte de septiembre de 2021 (el texto de la model card aparece truncado en ese punto). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Predicción de estructura proteica de todos los átomos a partir de secuencia o de estructura de entrada en formato CIF.
- Generación de coordenadas atómicas mediante cabeza de difusión con 14 pasos de muestreo.
- Puntuación de confianza de la predicción mediante cabezas de distograma y confianza dedicadas.
- Diseño de secuencias de binders proteicos mediante optimización basada en gradientes (inversión diferenciable).
- Clasificación y ranking de candidatos de binder usando predicciones de plegamiento como criterio.
- Detección automática de diseños de anticuerpos y puntuación de CDR mediante ANARCI, con dependencia del ejecutable `hmmscan` de HMMER en el PATH.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; su ámbito es estructural y biológico.
- No dispone de capacidades multilingües ni de visión, audio o thinking mode.

## Casos de uso

- Predicción de estructura de proteínas de novo: dado un archivo CIF o una secuencia, el pipeline `fold` devuelve estructura y valores de confianza, útil para cribados iniciales donde no se dispone de MSA y se prioriza velocidad sobre precisión máxima.
- Diseño de binders proteicos: el pipeline `design` optimiza secuencias de binder de longitud configurable (por ejemplo, 80 residuos) mediante gradientes y las clasifica con predicciones de plegamiento, adecuado para campañas de diseño de anticuerpos o péptidos de unión.
- Filtrado previo en pipelines de diseño iterativo: al ser la variante "fast" sin MSA, sirve como crítico de escalado rápido dentro de un bucle que después valida con la variante completa de 48 bloques.
- Análisis de interfaces proteína-proteína: la generación de todos los átomos permite inspeccionar contactos atómicos en la interfaz de un complejo diseñado.
- Validación computacional de candidatos terapéuticos: ranking de secuencias de binder generadas por otros métodos antes de su síntesis y caracterización experimental.
- Investigación en plegamiento con modelos de lenguaje proteico: al estar condicionado por ESMC-6B congelado, permite estudiar cómo las representaciones del LM afectan a la calidad del plegamiento sin reentrenar el encoder.
- Docencia y experimentación en bioinformática estructural: el tamaño reducido del checkpoint (2,0 GB) y la API de `ofoldx` facilitan reproducir experimentos de plegamiento y diseño en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El checkpoint ocupa 2,0 GB en safetensors; con overhead de activaciones y del encoder ESMC-6B (descargado aparte desde `multimolecule/esmc-6b`) se requiere previsiblemente más memoria, pero no se han publicado cifras.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados por el autor.
- Cabe en GPU consumer: no confirmado; el tamaño del checkpoint sugiere que podría caber en GPUs con 8-16 GB, pero la dependencia del encoder ESMC-6B y del tronco de plegamiento impide afirmarlo sin datos.
- Opciones de despliegue: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`), con pipelines `fold` y `design`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Bloques de plegamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold2 Experimental Fast Base300M Step1500k (este) | 504 M en safetensors | Sin MSA | 24 | AGPL-3.0 | Hugging Face, vía `ofoldx` |
| oteam/esmfold2-fast | 6.533,723 M (incluye ESMC-6B) | Sin MSA | 24 | AGPL-3.0 | Hugging Face, vía `ofoldx` |
| oteam/esmfold2 | 6.579,742 M (incluye ESMC-6B) | MSA opcional | 48 | AGPL-3.0 | Hugging Face, vía `ofoldx` |
| oteam/esmfold2-experimental | 6.577,328 M (incluye ESMC-6B) | MSA opcional | 48 | AGPL-3.0 | Hugging Face, vía `ofoldx` |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de plegamiento frente a alternativas de otros autores (AlphaFold, RoseTTAFold, etc.).

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido escrita por el equipo OFoldX y no por los autores originales de ESMFold2 (Biohub), lo que puede introducir divergencias respecto al modelo de referencia.
- Checkpoint parcial: este repositorio concreto corresponde a un "scaling critic" del flujo de diseño de binders, no al modelo de plegamiento general; su uso aislado fuera del pipeline experimental puede no ser representativo.
- Dependencia del pipeline completo: el flujo de diseño requiere todos los componentes del repositorio experimental, incluso cuando los críticos de escalado están desactivados.
- Dependencia externa de HMMER: la detección de anticuerpos y la puntuación de CDR requieren el ejecutable `hmmscan` en el PATH, lo que complica el despliegue en contenedores mínimos.
- Sin MSA: la variante Fast no acepta evidencia de alineamiento múltiple, lo que en general reduce la precisión en regiones de baja homología frente a la variante completa.
- Licencia AGPL-3.0: impone obligaciones copyleft que se activan también con el uso a través de red, lo que puede ser incompatible con servicios comerciales propietarios.
- Riesgo de alucinación estructural: como todo modelo generativo de coordenadas, puede producir plegamientos plausibles pero incorrectos; las cabezas de confianza deben usarse como filtro, no como garantía.
- Sesgos de datos: el entrenamiento se basa en PDB y AFDB con corte de septiembre de 2021, lo que puede limitar la cobertura de familias proteicas poco representadas o descubiertas después de esa fecha.
- Idiomas y contexto: no aplica soporte multilingüe ni ventana de contexto textual; la entrada es secuencia de aminoácidos o estructura.
- Sin datos publicados de benchmarks, latencia ni requisitos de hardware: la evaluación en producción requiere una validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/esmfold2-experimental-fast-base300m-step1500k
- Variante completa: https://huggingface.co/oteam/esmfold2
- Variante fast: https://huggingface.co/oteam/esmfold2-fast
- Variante experimental: https://huggingface.co/oteam/esmfold2-experimental
- Variante experimental fast: https://huggingface.co/oteam/esmfold2-experimental-fast
- Checkpoint ESMC-6B: https://huggingface.co/multimolecule/esmc-6b
- Código: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/esmfold2
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Paper: https://biohub.ai/papers/esm_protein.pdf
- Repositorio oficial: https://github.com/Biohub/esm
- Librería: https://ofoldx.valtech.ai/
