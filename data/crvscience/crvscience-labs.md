# crvscience/crvscience-labs

## Resumen

`crvscience/crvscience-labs` no es un modelo de lenguaje en el sentido habitual, sino un repositorio de Hugging Face asociado a **CRV Science Labs**, un proyecto de bioinformática que distribuye `bio-suite`, una herramienta de línea de comandos escrita en Rust bajo licencia GPL-3.0. El repositorio documenta un conjunto de pipelines nativos para genómica comparativa, sistemática molecular, biofísica estructural de ácidos nucleicos y proteínas, grafos de variación de pangenomas, minería de resistencia antimicrobiana (AMR) y clusters de genes biosintéticos (BGC), genética estadística y síntesis bayesiana de pipelines multi-etapa.

El componente más cercano a un "motor de inferencia" es **RuNIE** (Rust Native Inference Engine) v2.0.2, un sintetizador bayesiano de DAG de pipelines construido sobre `candle-core` y `rayon`, con un esquema de Parallel-Tempering GA-MCMC de 4 cadenas y una etapa de validación `ModelTest` basada en BIC/AICc y RCFV. No se trata de un modelo generativo preentrenado con pesos publicados, sino de un motor de búsqueda y composición de pipelines científicos.

La relevancia del repositorio radica en su propuesta de sustituir herramientas bioinformáticas de referencia por implementaciones nativas en Rust, con comparaciones cabeza a cabeza frente a MAFFT, IQ-TREE 2, PAML, BEAST, HMMER3, ViennaRNA, AutoDock Vina, AMRFinderPlus y otras. No obstante, la información disponible no permite verificar pesos, arquitectura de red neuronal ni parámetros de un modelo de lenguaje, por lo que muchos apartados de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal con arquitectura publicada; `bio-suite` es una CLI en Rust (edición 2021) y `RuNIE` v2.0.2 es un motor de inferencia bayesiana sobre `candle-core` + `rayon` con Parallel-Tempering GA-MCMC |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | GNU GPL-3.0 (según badge de la model card) |
| Formato de pesos | no disponible (el repositorio distribuye código Rust y documentación, no pesos de modelo) |

## Arquitectura y entrenamiento

La model card describe `bio-suite` como un conjunto de 37 herramientas nativas en Rust con una aceleración reportada de 23,19× frente a herramientas de referencia, calibradas contra MAFFT, jModelTest, IQ-TREE 2, ASTRAL, PAML, BEAST, DIAMOND, Minimap2, Prodigal, HMMER3, ViennaRNA, US-align, fpocket, AutoDock Vina, minigraph, AMRFinderPlus, GECCO, MACSE, Biopython y SciPy. Cada módulo ofrece arneses de calibración `*-compare` para comparación directa con la herramienta pública correspondiente.

`RuNIE` v2.0.2 se presenta como un sintetizador bayesiano de pipelines multi-etapa: un motor de política de Markov sobre tensores de `candle-core`, con Parallel-Tempering GA-MCMC de 4 cadenas, una puerta `ModelTest` en la etapa 4 (criterios BIC/AICc y RCFV ≤ 0,050) y ejecución en tres modos (nativo, externo e híbrido). El repositorio menciona 30 preprints verificados empíricamente (`PREPRINT-01`–`PREPRINT-30`), 68 conjuntos de datos de validación (`VAL-SET-001`–`VAL-SET-068`) y 55 controles negativos registrados. No se especifican datos de entrenamiento en el sentido de corpus de tokens, ni procesos de RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal, porque el artefacto no es un LLM.

## Capacidades

- Ejecución de pipelines nativos de genómica comparativa y sistemática molecular en Rust multi-hilo.
- Biofísica estructural 1D/2D/3D de ácidos nucleicos y proteínas (alineamiento estructural tipo US-align, docking tipo AutoDock Vina, análisis de cavidades tipo fpocket).
- Grafos de variación de pangenomas (comparables a minigraph).
- Minería de resistencia antimicrobiana (AMR) y clusters de genes biosintéticos (BGC).
- Genética estadística: `coloc.abf` y `MR-Egger`.
- Síntesis bayesiana de pipelines multi-etapa mediante `RuNIE` con Parallel-Tempering GA-MCMC.
- Orquestación autónoma de estudios mediante `bio-suite-supervisor` y bucle de auto-reparación `Super-BLAST`.
- GUI nativa Win32 de 5 pestañas (`bio-suite-supervisor gui`, `runie-align-view`).
- No se documenta soporte de tool calling, function calling, agentes conversacionales, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión, audio ni modo "thinking".

## Casos de uso

- Alineamiento múltiple de secuencias a escala: sustituir MAFFT por el módulo nativo de `bio-suite` en pipelines de genómica comparativa, con calibración `*-compare` para verificar la equivalencia de resultados antes de producción.
- Inferencia filogenética: emplear los módulos calibrados frente a IQ-TREE 2, PAML, ASTRAL y BEAST para reconstrucción de árboles y datación molecular en estudios de sistemática.
- Minería de resistencia antimicrobiana: procesar genomas bacterianos con el módulo AMR (calibrado frente a AMRFinderPlus) para detectar genes de resistencia en vigilancia epidemiológica.
- Descubrimiento de clusters de genes biosintéticos: rastrear genomas con el módulo BGC (calibrado frente a GECCO) para identificar rutas biosintéticas de interés biotecnológico.
- Análisis estructural de proteínas y ácidos nucleicos: usar los módulos de docking y cavidades (frente a AutoDock Vina y fpocket) y el plegado 2D de ARN (frente a ViennaRNA) en cribado de interacciones molécula-diana.
- Genética estadística: ejecutar `coloc.abf` y `MR-Egger` nativos para estudios de aleatorización mendeliana y colocalización, con calibración frente a SciPy y Biopython.
- Síntesis automática de pipelines: emplear `RuNIE` para componer y validar DAG de análisis multi-etapa con puerta `ModelTest`, útil en laboratorios que necesitan reproducibilidad y trazabilidad de pipelines complejos.
- Orquestación de estudios a gran escala: `bio-suite-supervisor` para lanzar baterías de estudios con bucle de auto-reparación y GUI de escritorio en Windows.

## Benchmarks y rendimiento

La model card reporta una aceleración agregada de **23,19×** para las 37 herramientas nativas frente a las herramientas de referencia, y afirma calibración cabeza a cabeza contra MAFFT, jModelTest, IQ-TREE 2, PAML, ASTRAL, BEAST, HMMER3, ViennaRNA, AMRFinderPlus, GECCO, MACSE, SciPy y Biopython. Sin embargo, no se proporcionan en la información disponible las tablas numéricas desglosadas por herramienta (tiempos, memoria, métricas de calidad como identity score, Robinson-Foulds, likelihood, etc.). No se han publicado resultados de benchmarks de un modelo de lenguaje en la información disponible, porque el artefacto no es un LLM.

| Metrica | Valor reportado |
|---|---|
| Aceleracion agregada (37 herramientas) | 23,19× |
| Preprints verificados | 30 (`PREPRINT-01`–`PREPRINT-30`) |
| Conjuntos de validacion | 68 (`VAL-SET-001`–`VAL-SET-068`) |
| Controles negativos registrados | 55 |
| Descubrimientos catalogados | 143 (30 preprints, 35 calibraciones de herramientas, 52 benchmarks de pipelines) |
| Desglose por herramienta | no disponible en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no se distribuyen pesos de modelo neuronal.
- GPU recomendadas: no aplicable. `RuNIE` usa `candle-core`, que permite ejecución en CPU y potencialmente en GPU, pero la model card no especifica requisitos de GPU ni VRAM.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: binario nativo de Rust (`bio-suite`), CLI con subcomandos, GUI nativa Win32 (`bio-suite-supervisor gui`, `runie-align-view`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: solo se reporta la aceleración agregada de 23,19×; no hay cifras absolutas de latencia ni throughput por herramienta.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría dentro de la información proporcionada, ya que `crvscience-labs` no es un modelo de lenguaje sino un toolkit bioinformático. Las alternativas funcionales serían las propias herramientas de referencia contra las que se calibra:

| Alternativa | Tipo | Licencia | Relacion con `bio-suite` |
|---|---|---|---|
| MAFFT | Alineamiento multiple | BSD / GPL segun version | Herramienta de referencia para el modulo de alineamiento |
| IQ-TREE 2 | Filogenia por maxima verosimilitud | GPL-2.0 | Referencia para inferencia filogenetica |
| HMMER3 | Busqueda de perfiles HMM | BSD-3-Clause | Referencia para busqueda de dominios proteicos |
| AMRFinderPlus | Deteccion de AMR | Dominio publico (NCBI) | Referencia para mineria de resistencia antimicrobiana |
| GECCO | Deteccion de BGC | GPL-3.0 | Referencia para clusters biosinteticos |
| ViennaRNA | Plegado de ARN | Custom (academica) | Referencia para estructura secundaria de ARN |
| AutoDock Vina | Docking molecular | GPL-2.0 | Referencia para docking |
| fpocket | Deteccion de cavidades | GPL-2.0 | Referencia para analisis de bolsillos |

No disponible comparación de parámetros, contexto o rendimiento en el sentido de LLM, porque el artefacto no es un modelo de lenguaje.

## Limitaciones y advertencias

- El repositorio no contiene pesos de un modelo de lenguaje; no debe tratarse como un LLM ni evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- La licencia GPL-3.0 es copyleft fuerte: cualquier distribución de obras derivadas debe publicarse bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Las cifras de aceleración (23,19×) y el número de preprints y datasets provienen exclusivamente de la model card del autor y no se han verificado de forma independiente en la información disponible.
- Riesgo de sesgo y alucinación en el sentido de LLM: no aplicable; el riesgo relevante es el de resultados bioinformáticos incorrectos si la calibración frente a las herramientas de referencia no se reproduce en el entorno del usuario.
- No se documentan limitaciones de contexto ni de idioma porque no aplican.
- La documentación enlazada (`docs/runie_architecture_and_studies.md`, `docs/tool_benchmark_matrix.md`, etc.) no está incluida en la información proporcionada, por lo que no se pueden verificar los detalles matemáticos ni las tablas completas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-20) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad de los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crvscience/crvscience-labs
- Portal CRV Science Labs: https://crvscience.com/labs
- DOI Zenodo: https://doi.org/10.5281/zenodo.23969275
- DOI Figshare: https://doi.org/10.6084/m9.figshare.34919469
- Documentación de arquitectura de RuNIE: `docs/runie_architecture_and_studies.md` (referenciada en la model card, no incluida en la información disponible)
- Matriz de benchmarks de herramientas: `docs/tool_benchmark_matrix.md` (referenciada, no incluida)
- Proceso de validación y calibración: `docs/validation_and_calibration_process.md` (referenciado, no incluido)
- Índice de descubrimientos: `docs/discoveries_and_critical_reports.md` (referenciado, no incluido)
- Guía del supervisor y GUI: `docs/supervisor_and_gui_guide.md` (referenciada, no incluida)
- Changelog de RuNIE: `runie_changelog.md` (referenciado, no incluido)
