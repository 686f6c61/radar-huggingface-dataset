# oteam/alphafold2-ptm-model-5

## Resumen

AlphaFold 2 es un modelo de predicción de estructura de proteínas desarrollado originalmente por DeepMind (John Jumper et al.) y publicado en *Nature* en 2021. Esta ficha corresponde a `oteam/alphafold2-ptm-model-5`, una implementación no oficial distribuida por el equipo OFoldX (OTeam-AI4S) bajo la librería `ofoldx`, que reproduce la variante monomérica con cabecera de confianza pTM y PAE (equivalente a `model_1_ptm` del repositorio oficial). El modelo predice coordenadas atómicas y niveles de confianza a partir de la secuencia de aminoácidos, un alineamiento múltiple de secuencias (MSA) y, opcionalmente, plantillas estructurales.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de atención invariante a puntos que genera marcos de cadena principal, ángulos de cadena lateral y coordenadas atómicas. Con 92.962.266 parámetros reales en safetensors (93,292 M según la model card), cuatro pasos de reciclado y un tamaño de repositorio de 0,4 GB, es un modelo compacto y autocontenido en comparación con los LLM actuales, pero de una densidad computacional muy superior por token procesado debido al coste cuadrático del Evoformer sobre la dimensión de la MSA.

Su relevancia actual reside en que permite ejecutar la lógica de AlphaFold 2 dentro del ecosistema `ofoldx`, con pipelines de plegado, ensembles CASP14 y evaluación de conjeturas iniciales, lo que facilita la integración en flujos de diseño de proteínas y evaluación de complejos. No obstante, es una reimplementación no oficial, sin benchmarks publicados en la información disponible y con licencia AGPL-3.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + módulo estructural de atención invariante a puntos (8 bloques); transformer con actualización conjunta de MSA y pares |
| Parametros totales | 92.962.266 (93,292 M en la variante Monomer pTM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la MSA se limita a 256 secuencias y los pares a 128; no es una ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplicable (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques extra-MSA | 4 |
| Bloques estructurales | 8 |
| Tamaño MSA | 256 |
| Tamaño de pares | 128 |
| Tamaño de singles | 384 |
| Pasos de reciclado | 4 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura canónica de AlphaFold 2: un tronco Evoformer de 48 bloques que procesa simultáneamente la representación de la MSA (256 secuencias) y la representación de pares de residuos (128 canales), con atención triangular y actualizaciones cruzadas entre ambas. A continuación, un módulo estructural de 8 bloques basado en atención invariante a puntos predice marcos de cadena principal, ángulos de cadena lateral y coordenadas atómicas, junto con las cabeceras de confianza pLDDT, PAE y pTM. La variante pTM añade la predicción de pTM, lo que permite estimar la calidad global del modelo predicho además de la confianza por residuo.

El modelo se condiciona con MSAs y plantillas estructurales opcionales, y aplica cuatro pasos de reciclado sobre la representación para refinar la predicción. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La implementación es una reescritura no oficial del trabajo original de DeepMind, por lo que los detalles exactos de entrenamiento deben consultarse en el paper de referencia.

## Capacidades

- Predicción de estructura de proteínas monoméricas a partir de secuencia, MSA y plantillas opcionales.
- Predicción de coordenadas atómicas de cadena principal y cadenas laterales.
- Estimación de confianza por residuo (pLDDT) y global (pTM y PAE en esta variante).
- Procesamiento de alineamientos múltiples de secuencias de hasta 256 secuencias y representaciones de pares de 128 canales.
- Refinamiento mediante cuatro pasos de reciclado.
- Soporte de ensembles de cinco modelos y ocho ensembles de entrada por checkpoint (variante CASP14, disponible como modelo separado).
- Evaluación de conjeturas iniciales para complejos objetivo-binder usando coordenadas existentes (variante `alphafold2-initial-guess`).
- Relajación de estructuras con Amber vía OpenMM y PDBFixer (opcional).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües: es un modelo especializado en biología estructural.

## Casos de uso

- Predicción de estructura de proteínas individuales: dado un FASTA y un MSA generado con herramientas externas (p. ej., HHblits o Jackhmmer), el pipeline `ofoldx.pipeline("fold")` devuelve coordenadas y valores de pLDDT para priorizar dianas en proyectos de biología estructural.
- Anotación de variantes y mutaciones: predecir la estructura de una proteína wild-type y de sus mutantes para comparar pLDDT y pTM, identificando regiones sensibles a cambios conformacionales antes de ensayos experimentales.
- Diseño de proteínas y binders: usar la variante `alphafold2-initial-guess` para evaluar complejos objetivo-binder con las coordenadas existentes como conjetura inicial, integrada en bucles de diseño computacional tipo PXDesign.
- Selección de candidatos en cribados: ejecutar el ensemble CASP14 (`alphafold2-casp14`) con `num_samples=1` y `models_to_relax="best"` para rankear predicciones por pLDDT medio y reducir falsos positivos antes de la validación en laboratorio.
- Predicción de complejos multiméricos: emplear la variante `alphafold2-multimer`, con MSAs emparejados y características relativas de cadena, para estudiar interfaces proteína-proteína en dianas terapéuticas.
- Docencia y reproducibilidad metodológica: al ser una reimplementación abierta con licencia AGPL-3.0 y código en GitHub, sirve para estudiar el funcionamiento interno del Evoformer y del módulo de atención invariante a puntos en cursos de aprendizaje profundo aplicado a biología.
- Integración en pipelines de plegado a escala: al pesar solo 0,4 GB y requerir únicamente la librería `ofoldx`, puede desplegarse en clústeres CPU/GPU para procesar lotes de secuencias con relajación opcional en CPU mediante OpenMM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 93 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,37 GB, pero el consumo real depende de la longitud de la secuencia, del tamaño del MSA (256) y de la representación de pares (128), que dominan el uso de memoria.
- GPU recomendadas: no disponible. Por el perfil del modelo, GPUs con suficiente memoria para representaciones de pares de proteínas largas (A100, H100 o RTX 4090) son candidatas razonables, pero no se confirma en la documentación.
- Cabe en GPU de consumo: no confirmado; el peso de los parámetros es reducido, pero las activaciones del Evoformer pueden exceder la VRAM de GPUs de gama media en secuencias largas.
- Opciones de despliegue: librería `ofoldx` (instalable con `pip install ofoldx`); relajación opcional con OpenMM y PDBFixer vía conda-forge. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-ptm-model-5 | 92,96 M | MSA 256, pares 128, 4 reciclados | pLDDT, PAE, pTM | AGPL-3.0 | Hugging Face (ofoldx) |
| oteam/alphafold2 | 93,283 M (variante Monomer) | MSA 256, pares 128, 4 reciclados | pLDDT | AGPL-3.0 | Hugging Face (ofoldx) |
| oteam/alphafold2-multimer | 93,278 M | MSA 256, pares 128, 21 reciclados | pLDDT, PAE, pTM | AGPL-3.0 | Hugging Face (ofoldx) |
| AlphaFold 2 oficial (google-deepmind) | no disponible en la información | no disponible | pLDDT, PAE, pTM | licencia oficial de DeepMind | GitHub oficial |

Las variantes de OFoldX comparten arquitectura y difieren en la cabecera de confianza y en el número de reciclados; la variante multimer incorpora MSAs emparejados y 21 pasos de reciclado. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Es una implementación no oficial: la model card advierte explícitamente que el equipo de AlphaFold 2 no la escribió ni la validó.
- No se han publicado benchmarks ni métricas de precisión en la información disponible; no debe asumirse paridad con el modelo oficial de DeepMind.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte que pueden afectar al uso comercial y a la distribución de servicios en red; revisar con asesoría legal antes de producción.
- Modelo especializado en biología estructural: no es un modelo de lenguaje y no soporta generación de texto, código, tool calling ni agentes.
- Las predicciones usan un nuevo marco de coordenadas en cada ejecución; los átomos no predichos (ligandos, hidrógenos, OXT terminal) quedan sin coordenadas.
- La relajación con Amber requiere OpenMM y PDBFixer y un grafo proteico lineal cerrado y estándar; no aplica a todas las estructuras.
- La calidad depende críticamente de la MSA y de las plantillas de entrada; MSAs pobres o secuencias huérfanas de homólogos reducen la fiabilidad.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, por no ser aplicables en el sentido habitual; el riesgo principal es la sobreconfianza en predicciones con pLDDT bajo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/alphafold2-ptm-model-5
- Variante monomérica: https://huggingface.co/oteam/alphafold2
- Variante con PAE y pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
