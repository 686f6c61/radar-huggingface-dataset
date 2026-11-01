# oteam/alphafold2-ptm

## Resumen

AlphaFold 2 (variante pTM) es una implementación no oficial del modelo de predicción de estructura de proteínas publicado por DeepMind en 2021, distribuida por el equipo de OFoldX bajo el identificador `oteam/alphafold2-ptm`. El modelo predice coordenadas atómicas tridimensionales a partir de la secuencia de aminoácidos, un alineamiento múltiple de secuencias (MSA) y, opcionalmente, plantillas estructurales. Esta variante concreta añade a la predicción monomérica las métricas de confianza PAE (Predicted Aligned Error) y pTM (predicted Template Modeling score), lo que permite evaluar la calidad de la orientación relativa entre dominios, no solo la confianza local por residuo (pLDDT).

Arquitectónicamente es una red neuronal de 93.291.674 parámetros (unos 93,3 M) que combina un tronco Evoformer de 48 bloques con 4 bloques extra de MSA y un módulo estructural de 8 bloques basado en *invariant point attention*. Trabaja con representaciones de MSA de tamaño 256, pares de 128 y representaciones de residuo simple de 384, con 4 pasos de reciclado. No es un modelo de lenguaje: no genera texto ni código, sino tensores de coordenadas y puntuaciones de confianza.

Su relevancia actual es la de ofrecer una vía de ejecución reproducible y empaquetada (librería `ofoldx`, pesos en safetensors) del algoritmo que transformó la biología estructural computacional, con licencia AGPL-3.0 y un tamaño de repositorio de solo 0,4 GB. Es material de referencia para investigación en plegamiento de proteínas, no un componente de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + 4 bloques extra de MSA + módulo estructural de 8 bloques con invariant point attention |
| Parámetros totales | 93.291.674 (≈93,3 M) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre MSA de 256 secuencias y representaciones de pares de 128) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada en formato de secuencia de aminoácidos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Librería de inferencia | `ofoldx` |
| Pipeline declarado | `other` |
| Tamaño del repositorio | 0,4 GB |
| Pasos de reciclado | 4 |
| Tamaños de representación | MSA 256, pares 128, simple 384 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura original de AlphaFold 2: un tronco Evoformer que actualiza conjuntamente las representaciones de alineamiento múltiple de secuencias (MSA) y de pares de residuos, seguido de un módulo estructural que emplea *invariant point attention* para predecir marcos de esqueleto, ángulos de cadena lateral, coordenadas atómicas y valores de confianza. La variante `ptm` incorpora una cabeza adicional que produce la puntuación pTM y el error alineado predicho (PAE), lo que permite estimar la calidad de la disposición global de dominios.

La model card no detalla el conjunto de datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si hubo etapas de refinamiento posteriores. Tampoco se documentan innovaciones adicionales más allá de las del artículo original (reciclado iterativo, atención invariante a rotaciones y traslaciones, uso de MSA y plantillas). Cualquier dato sobre el proceso de entrenamiento debe considerarse no disponible en la información proporcionada.

## Capacidades

- Predicción de estructura tridimensional de proteínas monoméricas a partir de secuencia, MSA y plantillas opcionales.
- Generación de coordenadas atómicas de esqueleto y cadena lateral.
- Estimación de confianza por residuo mediante pLDDT.
- Estimación de confianza global y de error alineado entre dominios mediante pTM y PAE (esta variante).
- Soporte de entrada en formato mmCIF a través de `ofoldx.io.read_structure`.
- Posibilidad de relajación estructural con Amber vía OpenMM y PDBFixer (opcional).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingües.
- No procesa visión, audio ni texto libre.

## Casos de uso

- Anotación estructural de proteínas en pipelines de biología computacional: dado un proteoma o un conjunto de secuencias candidatas, el modelo genera modelos 3D con puntuaciones pLDDT y PAE que permiten filtrar automáticamente las predicciones fiables antes de análisis posteriores.
- Priorización de dianas terapéuticas: la combinación de pTM y PAE ayuda a distinguir proteínas con dominios bien definidos de aquellas con regiones intrínsecamente desordenadas, lo que resulta útil para descartar dianas poco estructuradas en fases tempranas de descubrimiento.
- Análisis de dominios y arquitectura modular: el PAE permite estimar la orientación relativa entre dominios de una misma cadena, información relevante para estudiar mecanismos de regulación alostérica o para guiar el diseño de constructos truncados.
- Validación cruzada con datos experimentales: comparar estructuras predichas con modelos de cristalografía o crio-EM para detectar discrepancias en regiones concretas, usando la confianza del modelo como criterio de selección de regiones a revisar.
- Generación de hipótesis para mutagénesis dirigida: a partir del modelo 3D se pueden identificar residuos expuestos en superficie o en interfaces putativas, orientando experimentos de mutación sin necesidad de estructura experimental previa.
- Docencia y formación en biología estructural: el pipeline reproducible de `ofoldx` permite ilustrar el flujo completo (secuencia, MSA, predicción, confianza) en entornos académicos con requisitos de hardware moderados.
- Integración en flujos de diseño de proteínas: la variante `alphafold2-initial-guess` del mismo autor se usa como evaluador en PXDesign, lo que indica que este ecosistema puede emplearse para puntuar diseños generados por otros métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 93,3 M de parámetros en precisión completa, los pesos ocupan aproximadamente 0,37 GB, pero el consumo real depende en gran medida de la longitud de la secuencia y del tamaño de las representaciones intermedias (MSA de 256 secuencias), que dominan el uso de memoria.
- GPU recomendadas: no disponible. El modelo original de AlphaFold 2 se ha ejecutado históricamente en GPUs de datacenter (A100, V100); no se especifican requisitos para esta implementación.
- Compatibilidad con GPU de consumo: no disponible. El tamaño de pesos es reducido, pero la memoria necesaria para MSAs largos puede exceder la VRAM de tarjetas domésticas en secuencias grandes.
- Opciones de despliegue: librería `ofoldx` (instalable vía `pip install ofoldx`). El pipeline de CASP14 permite ejecución en `platform="CPU"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-ptm | 93,3 M | MSA 256, pares 128 | pLDDT, PAE, pTM | AGPL-3.0 | HuggingFace (`oteam`) |
| oteam/alphafold2 | 93,283 M | MSA 256, pares 128 | pLDDT | AGPL-3.0 | HuggingFace (`oteam`) |
| oteam/alphafold2-multimer | 93,278 M | MSA 256, pares 128, cadenas múltiples | pLDDT, PAE, pTM | AGPL-3.0 | HuggingFace (`oteam`) |
| oteam/alphafold2-casp14 | no disponible | MSA 256, pares 128, ensemble de 5 modelos | pLDDT | AGPL-3.0 | HuggingFace (`oteam`) |

La comparación con implementaciones externas (AlphaFold 3, ESMFold, OpenFold) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo de DeepMind no escribió esta ficha ni validó esta implementación; la reproducibilidad de los resultados originales no está garantizada.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes. El uso comercial en servicios en red requiere liberar el código fuente derivado, lo que puede ser incompatible con productos propietarios.
- Sesgos: no documentados en la información disponible. Al entrenarse sobre datos del PDB, es esperable un sesgo hacia familias proteicas sobrerrepresentadas en la base de datos estructural, pero no se cuantifica.
- Riesgo de alucinación estructural: el modelo puede generar coordenadas plausibles pero incorrectas en regiones sin homólogos en el MSA o intrínsecamente desordenadas; las puntuaciones pLDDT y PAE deben usarse como filtro obligatorio.
- Limitaciones de entrada: no procesa ligandos, iones, hidrógenos ni el átomo OXT terminal; los átomos no predichos quedan sin coordenadas. Cada predicción usa un marco de coordenadas nuevo, por lo que no es directamente superponible sin alineamiento.
- Dependencia de MSA: la calidad de la predicción depende críticamente de la profundidad y diversidad del alineamiento; secuencias huérfanas o virales con pocos homólogos producen modelos de baja confianza.
- Sin soporte de complejos en esta variante: para interacciones entre cadenas debe usarse `oteam/alphafold2-multimer`.
- La relajación con Amber requiere OpenMM y PDBFixer instalados en el mismo entorno y un grafo proteico lineal cerrado y estándar.
- Idiomas: no aplica, pero conviene subrayar que no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/alphafold2-ptm
- Variante monomérica: https://huggingface.co/oteam/alphafold2
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Documentación de la librería: https://ofoldx.valtech.ai/
- Paper original: https://doi.org/10.1038/s41586-021-03819-2
- Paper de AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial de DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
