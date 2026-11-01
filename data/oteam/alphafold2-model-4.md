# oteam/alphafold2-model-4

## Resumen

`oteam/alphafold2-model-4` es una implementación no oficial de AlphaFold 2, el modelo de predicción de estructura de proteínas desarrollado originalmente por DeepMind y publicado en *Nature* en 2021. Esta variante la distribuye el equipo OFoldX (OTeam) bajo la librería `ofoldx`, y reproduce la arquitectura Evoformer más el módulo estructural de atención invariante a puntos descrita en el paper original. El modelo predice coordenadas atómicas, ángulos de cadena lateral y valores de confianza (pLDDT) a partir de secuencias de aminoácidos, alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales.

Con 92.954.010 parámetros reales en pesos safetensors y un repositorio de 0,4 GB, se trata de un checkpoint de tamaño medio que cabe en GPU de consumo con cuantización o en FP32 en GPUs profesionales. La relevancia actual reside en que permite ejecutar el pipeline de AlphaFold 2 de forma reproducible desde Python mediante `ofoldx`, sin depender del repositorio oficial de DeepMind, y con variantes específicas para monómeros, multímeros y el protocolo de ensemble CASP14.

Es importante subrayar que no es un modelo de lenguaje: no genera texto ni mantiene conversaciones. Es un modelo científico de dominio específico (biología estructural) y su evaluación debe hacerse con métricas de plegamiento (pLDDT, pTM, PAE, TM-score, RMSD), no con benchmarks de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + 4 bloques extra-MSA + módulo estructural de atención invariante a puntos (8 bloques) |
| Parametros totales | 92.954.010 (92,95 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (MSA de 256 secuencias, representación de pares 128, representación single 384) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other |
| Pasos de reciclado (recycling) | 4 (monómero y monómero pTM); 21 (multímero) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de AlphaFold 2: un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA (tamaño 256) y de pares de residuos (tamaño 128), más 4 bloques extra-MSA y un módulo estructural de 8 bloques con atención invariante a puntos que emite marcos de backbone, ángulos de cadena lateral, coordenadas atómicas y confianza. La representación single tiene dimensión 384. El proceso de reciclado se aplica 4 veces en las variantes de monómero y 21 veces en la variante multímero, según la tabla de especificación del autor. AlphaFold-Multimer añade MSAs emparejados y características relativas entre cadenas para predecir complejos proteicos.

Los detalles concretos de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. El modelo se entrena de forma supervisada sobre estructuras experimentales del PDB con objetivos de pérdida sobre coordenadas y confianza; sin embargo, esta ficha no puede confirmar los hiperparámetros ni el corte temporal del conjunto de entrenamiento porque no se detallan en la model card. La innovación técnica principal es el Evoformer, que combina atención sobre MSA y sobre pares de residuos con actualizaciones triangulares, y el módulo de atención invariante a puntos que garantiza equivariancia a rotaciones y traslaciones en la predicción estructural.

## Capacidades

- Predicción de estructura de proteínas monoméricas a partir de secuencia, MSA y plantillas opcionales.
- Predicción de complejos proteicos multicadena mediante la variante AlphaFold-Multimer (MSAs emparejados y características relativas entre cadenas).
- Estimación de confianza por residuo (pLDDT) en la variante monómero.
- Estimación de confianza global mediante pTM y error de alineamiento predicho (PAE) en la variante `alphafold2-ptm`.
- Predicción de ángulos de cadena lateral y coordenadas atómicas completas (no solo backbone).
- Ejecución del protocolo ensemble de cinco modelos CASP14 con ocho ensembles de entrada por checkpoint y relajación Amber opcional.
- Evaluación de complejos target-binder usando coordenadas existentes como initial guess (variante `alphafold2-initial-guess`).
- Soporte de relajación estérica con OpenMM y PDBFixer para obtener geometrías físicamente plausibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-step conversacional ni capacidades multilingües: es un modelo científico de dominio específico.

## Casos de uso

- Predicción de estructura de proteínas de novo: dado un FASTA y su MSA, el pipeline `ofoldx.pipeline("fold", model="oteam/alphafold2")` devuelve coordenadas y pLDDT, útil para priorizar dianas en descubrimiento de fármacos antes de cristalografía o crio-EM.
- Modelado de complejos proteína-proteína: la variante `alphafold2-multimer` con 21 pasos de reciclado y MSAs emparejados permite estudiar interfaces de dímeros y complejos, adecuada para validar hipótesis de interacción en biología estructural.
- Ranking de predicciones en CASP: el ensemble `alphafold2-casp14` con cinco checkpoints y ocho ensembles de entrada por checkpoint sirve para seleccionar la mejor estructura y aplicar relajación Amber sobre la mejor puntuada, replicando el protocolo de competición.
- Diseño de binders y proteínas de novo: la variante `alphafold2-initial-guess` (modelo `model_1_ptm`) se usa como evaluador en flujos tipo PXDesign para puntuar complejos target-binder usando sus coordenadas como punto de partida.
- Anotación funcional a escala genómica: con 92,95 M de parámetros y 0,4 GB de pesos, se puede desplegar en lotes sobre GPUs de consumo para predecir estructuras de proteomas pequeños o de familias génicas completas.
- Validación de variantes missense: predecir la estructura de la proteína wild-type y de la variante y comparar pLDDT/PAE para priorizar variantes que comprometan el plegamiento en estudios de genética clínica.
- Docencia e investigación reproducible: al instalarse con `pip install ofoldx` y ejecutarse desde Python, facilita la reproducibilidad en entornos académicos sin depender del repositorio oficial de DeepMind.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de pLDDT, pTM, PAE, TM-score ni RMSD sobre CASP14, CAMEO u otros conjuntos de evaluación. Tampoco se proporcionan comparativas cuantitativas frente a AlphaFold 3, ESMFold, RoseTTAFold u otros predictores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 92,95 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,37 GB; en FP16 unos 0,19 GB. Sin embargo, el consumo real de VRAM está dominado por las representaciones intermedias del Evoformer (MSA 256 × 384 y pares 128 × 128 por residuo), que crecen cuadráticamente con la longitud de la secuencia y suelen requerir varias decenas de GB para proteínas largas.
- GPU recomendadas: no disponible en la información proporcionada. Por el perfil de memoria del Evoformer, se esperan GPUs profesionales tipo A100 o H100 para secuencias largas; para secuencias cortas podría ser viable en RTX 4090 u otras GPU de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de pesos es pequeño, pero la memoria de activaciones depende de la longitud de secuencia y del tamaño del MSA; no se documenta un límite oficial.
- Opciones de despliegue: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`), con pipelines `fold` y modelos `oteam/alphafold2`, `oteam/alphafold2-ptm`, `oteam/alphafold2-multimer`, `oteam/alphafold2-casp14` y `oteam/alphafold2-initial-guess`. La relajación Amber requiere OpenMM y PDBFixer instalados en el mismo entorno (por ejemplo vía conda-forge). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| oteam/alphafold2-model-4 | 92,95 M | MSA 256, pares 128, single 384 | AGPL-3.0 | HuggingFace (oteam) | Implementación no oficial vía `ofoldx` |
| AlphaFold 2 oficial (DeepMind) | no disponible en la información | no disponible | no disponible en la información | Repositorio `google-deepmind/alphafold` | Referencia original del paper; pesos con licencia propia de DeepMind |
| AlphaFold-Multimer (variante del mismo autor) | 93,278 M | MSA 256, pares 128, single 384, 21 reciclados | AGPL-3.0 | HuggingFace (`oteam/alphafold2-multimer`) | Predicción de complejos multicadena |
| AlphaFold 3, ESMFold, RoseTTAFold | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo de DeepMind no escribió esta model card ni avala esta implementación; los resultados pueden diferir de los del repositorio oficial.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte. El uso comercial en servicios en red requiere liberar el código fuente derivado; conviene revisar con asesoría legal antes de integrarlo en productos propietarios.
- Riesgo de alucinación estructural: como todo predictor, puede generar conformaciones plausibles pero incorrectas en regiones de baja confianza (pLDDT bajo) o en proteínas sin homólogos en el MSA. Es obligatorio filtrar por pLDDT/pTM/PAE antes de usar las estructuras en decisiones experimentales.
- Dependencia del MSA: la calidad de la predicción depende críticamente de la profundidad y diversidad del alineamiento múltiple; secuencias huérfanas o con pocos homólogos producen modelos poco fiables.
- Coordenadas no predichas: ligandos, hidrógenos y el OXT terminal no tienen coordenadas disponibles en la salida; cada predicción usa un marco de coordenadas nuevo, por lo que hay que realinear antes de comparar estructuras.
- Relajación Amber opcional: requiere OpenMM y PDBFixer y un grafo proteico lineal estándar cerrado; las coordenadas relajadas sustituyen a los metadatos experimentales, lo que puede afectar a comparaciones con estructuras de referencia.
- Idiomas: no aplica, pero conviene señalar que no es un modelo lingüístico y no debe evaluarse con benchmarks de NLP.
- Sesgos: no documentados en la información disponible; los sesgos potenciales provendrían del sesgo del PDB hacia proteínas bien caracterizadas y de la sobrerrepresentación de ciertos organismos modelo.
- Sin métricas publicadas: la ausencia de benchmarks en la model card impide verificar el rendimiento frente a AlphaFold 2 oficial u otros predictores; se recomienda validación propia antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/alphafold2-model-4
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante monómero con pTM y PAE: https://huggingface.co/oteam/alphafold2-ptm
- Variante multímero: https://huggingface.co/oteam/alphafold2-multimer
- Variante ensemble CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código de `ofoldx.models.alphafold2`: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Documentación de `ofoldx`: https://ofoldx.valtech.ai/
- Paper AlphaFold 2 (Jumper et al., 2021): https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer (Evans et al., 2021): https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial de DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM (relajación Amber): https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
