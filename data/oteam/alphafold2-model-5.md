# oteam/alphafold2-model-5

## Resumen

AlphaFold 2 es un modelo de prediccion de estructura de proteinas desarrollado originalmente por DeepMind (John Jumper et al.) y publicado en Nature en 2021. Esta ficha corresponde a `oteam/alphafold2-model-5`, una implementacion **no oficial** distribuida por el equipo OFoldX a traves de la libreria `ofoldx`. El modelo predice la estructura tridimensional de proteinas a partir de su secuencia de aminoacidos, un alineamiento multiple de secuencias (MSA) y, opcionalmente, plantillas estructurales.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un modulo estructural de atencion invariante a puntos (invariant point attention) de 8 bloques que produce marcos de cadena principal, angulos de cadena lateral, coordenadas atomicas y valores de confianza. El checkpoint contiene 92.954.010 parametros segun los pesos en safetensors (el model card declara 93,283 M para la variante monomerica, una diferencia atribuible a la contabilidad de parametros).

El modelo es relevante porque democratiza el acceso a la arquitectura AlphaFold 2 mediante una libreria Python instalable con `pip`, con variantes para monomeros, complejos multimericos, evaluacion CASP14 y evaluacion con estimacion inicial. Su licencia AGPL-3.0 impone obligaciones de copyleft que condicionan su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + modulo estructural de atencion invariante a puntos (8 bloques); 4 bloques extra-MSA |
| Parametros totales | 92.954.010 (segun safetensors); 93,283 M declarados para la variante monomerica |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del tamano del MSA y de la proteina; MSA de 256, representacion de pares de 128, representacion de residuo unico de 384) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AlphaFold 2 es un modelo de prediccion estructural, no un modelo de lenguaje. Su tronco Evoformer procesa dos representaciones: un MSA de tamano 256 y una representacion de pares de residuos de tamano 128, con una representacion de residuo unico de 384. Los 48 bloques del Evoformer actualizan ambas representaciones de forma conjunta mediante atencion sobre filas y columnas del MSA y operaciones de producto exterior triangulares. El modulo estructural de 8 bloques aplica atencion invariante a puntos para producir marcos de cadena principal y angulos de cadena lateral.

El modelo opera con 4 pasos de reciclado (recycling) en la variante monomerica y 21 en la variante multimerica. La variante Multimer anade MSAs emparejados y caracteristicas relativas entre cadenas para predecir complejos proteicos. El model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles en la informacion proporcionada. La innovacion tecnica principal es la actualizacion conjunta de MSA y pares mediante Evoformer, junto con la atencion invariante a puntos que garantiza equivarianza a rotaciones y traslaciones en la prediccion estructural.

## Capacidades

- Prediccion de estructura tridimensional de proteinas a partir de secuencia de aminoacidos, MSA y plantillas estructurales opcionales.
- Prediccion de marcos de cadena principal, angulos de cadena lateral y coordenadas atomicas.
- Estimacion de confianza mediante pLDDT en la variante monomerica.
- Estimacion de confianza PAE y pTM en la variante `alphafold2-ptm`.
- Prediccion de complejos proteicos multicadena en la variante `alphafold2-multimer`.
- Evaluacion con ensemble de cinco modelos y ocho ensembles de entrada por checkpoint en la variante `alphafold2-casp14`.
- Evaluacion con estimacion inicial de coordenadas en la variante `alphafold2-initial-guess`.
- Relajacion de estructura con Amber mediante OpenMM y PDBFixer (opcional).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso generico ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Prediccion de estructura de proteinas monomericas: el modelo toma una secuencia y su MSA y devuelve coordenadas atomicas con valores de pLDDT, util para anotar proteinas sin estructura experimental resuelta.
- Prediccion de complejos proteicos: la variante `alphafold2-multimer` permite modelar interacciones entre cadenas con MSAs emparejados, aplicable al estudio de interfaces proteina-proteina.
- Ranking de predicciones con ensemble CASP14: la variante `alphafold2-casp14` evalua cinco checkpoints con ocho ensembles de entrada y ordena los resultados por pLDDT medio, util para seleccionar la mejor estructura candidata en pipelines de modelado.
- Refinamiento con relajacion Amber: tras la prediccion, se puede aplicar relajacion con OpenMM y PDBFixer para corregir conflictos estericos en la estructura, integrable en flujos de validacion estructural.
- Evaluacion de complejos objetivo-binder con estimacion inicial: la variante `alphafold2-initial-guess` evalua un complejo con coordenadas existentes como punto de partida, aplicable al diseno de binders y a la validacion de disenos computacionales.
- Analisis estructural a escala en investigacion: al ser instalable con `pip install ofoldx`, se puede integrar en scripts de Python para procesar lotes de secuencias y generar estructuras de forma reproducible con semilla fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el model card menciona ejecucion con `platform="CPU"` para la relajacion, lo que sugiere soporte de CPU para ese paso.
- Opciones de despliegue: libreria `ofoldx` (instalable con `pip install ofoldx`); relajacion con OpenMM y PDBFixer instalados via conda-forge.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/alphafold2-model-5 | 92,95 M | no disponible | AGPL-3.0 | Hugging Face (oteam) |
| oteam/alphafold2 | 93,283 M | no disponible | no disponible | Hugging Face (oteam) |
| oteam/alphafold2-ptm | 93,292 M | no disponible | no disponible | Hugging Face (oteam) |
| oteam/alphafold2-multimer | 93,278 M | no disponible | no disponible | Hugging Face (oteam) |

Las variantes comparadas pertenecen al mismo equipo y a la misma familia de implementaciones no oficiales. No se dispone de datos de benchmarks ni de comparativas con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: el equipo de DeepMind no escribio esta model card ni avala esta distribucion; la implementacion de referencia es `google-deepmind/alphafold`.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden afectar al uso comercial y a la distribucion de software derivado; es necesario revisar su compatibilidad con el producto.
- Coordenadas no predichas: los atomos no predichos, incluidos ligandos, hidrogenos y el OXT terminal, tienen coordenadas no disponibles.
- Marco de coordenadas nuevo en cada prediccion: cada prediccion usa un marco de coordenadas distinto, lo que requiere alineamiento para comparaciones estructurales.
- Relajacion con restricciones: la relajacion Amber requiere un grafo proteico lineal estandar y cerrado, y sustituye las coordenadas experimentales por las relajadas.
- Ausencia de datos de sesgo y alucinacion: al no ser un modelo generativo de texto, no aplican sesgos linguisticos, pero no se dispone de informacion sobre sesgos en la prediccion estructural.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Datos de entrenamiento no disponibles: no se detalla el numero de tokens, la composicion del dataset ni el proceso de entrenamiento en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/alphafold2-model-5
- Variante monomerica: https://huggingface.co/oteam/alphafold2
- Variante con pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Codigo OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
