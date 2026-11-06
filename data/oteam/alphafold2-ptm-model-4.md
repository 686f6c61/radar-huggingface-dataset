# oteam/alphafold2-ptm-model-4

## Resumen

AlphaFold 2 es un modelo de prediccion de estructura de proteinas desarrollado originalmente por DeepMind y publicado en 2021 en *Nature*. Esta ficha corresponde a `oteam/alphafold2-ptm-model-4`, una implementacion no oficial distribuida por el equipo OFoldX bajo la libreria `ofoldx`. El modelo predice la estructura tridimensional de una proteina a partir de su secuencia de aminoacidos, un alineamiento multiple de secuencias (MSA) y, opcionalmente, plantillas estructurales.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un modulo estructural de atencion invariante a puntos que produce marcos de backbone, angulos de cadena lateral, coordenadas atomicas y valores de confianza. La variante `ptm` anade prediccion de pTM y PAE ademas de pLDDT, lo que permite estimar la calidad global del modelo y la incertidumbre por residuo.

Con 92.962.266 parametros (segun safetensors) y un tamano de repositorio de 0,4 GB, el modelo es relevante para laboratorios que necesitan ejecutar predicciones de estructura en local sin depender de la infraestructura de DeepMind. Su licencia AGPL-3.0 impone obligaciones copyleft relevantes para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tronco Evoformer (48 bloques) y modulo estructural de atencion invariante a puntos (8 bloques) |
| Parametros totales | 92.962.266 (segun safetensors); 93,292 M segun la model card para la variante Monomer pTM |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la entrada es un MSA de hasta 256 secuencias y representaciones de pares de 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura descrita en el paper original de AlphaFold 2. El tronco Evoformer consta de 48 bloques que actualizan de forma iterativa dos representaciones: la de MSA (tamano 256) y la de pares de residuos (tamano 128). A continuacion, 4 bloques extra-MSA y 8 bloques del modulo estructural procesan la representacion de pares para producir marcos de backbone y angulos de cadena lateral. La representacion de un solo residuo tiene tamano 384. El numero de pasos de reciclado es 4 para la variante monomero pTM.

La variante `ptm` incorpora cabezas de prediccion de pTM (predicted TM-score) y PAE (predicted aligned error), ademas de la confianza por residuo pLDDT. El modelo esta condicionado por MSA y plantillas estructurales opcionales. La model card no detalla la composicion exacta del dataset de entrenamiento ni el numero de tokens o cadenas utilizadas; esa informacion esta disponible en el paper original pero no se reproduce en la ficha del repositorio. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de prediccion estructural.

## Capacidades

- Prediccion de estructura tridimensional de proteinas monomericas a partir de secuencia, MSA y plantillas opcionales.
- Prediccion de confianza por residuo mediante pLDDT.
- Prediccion de confianza global mediante pTM y de error alineado por pares mediante PAE (variante `ptm`).
- Generacion de coordenadas atomicas de backbone y cadenas laterales.
- Soporte de reciclado iterativo (4 pasos en la variante pTM) para refinar la prediccion.
- Integracion con pipelines de relajacion de Amber via OpenMM y PDBFixer (opcional).
- No soporta tool calling, agentes, razonamiento multi-paso linguistico ni capacidades multimodales en el sentido de los LLM.

## Casos de uso

- Prediccion de estructura de proteinas monomericas en laboratorio: el modelo recibe una secuencia y un MSA y devuelve coordenadas atomicas con valores de pLDDT por residuo, lo que permite priorizar dianas experimentales antes de cristalografia o crio-EM.
- Analisis de confianza estructural: la variante `ptm` proporciona pTM y PAE, utiles para decidir que regiones de una prediccion son fiables y cuales requieren validacion experimental.
- Anotacion funcional asistida: la estructura predicha puede alimentar pipelines de deteccion de dominios, bolsillos o sitios activos mediante herramientas externas.
- Docencia y formacion: al ser una implementacion abierta con licencia AGPL-3.0, permite a estudiantes ejecutar el pipeline completo en local y estudiar el funcionamiento del Evoformer.
- Integracion en pipelines bioinformaticos: la API `ofoldx.pipeline("fold", ...)` facilita el encadenamiento con herramientas de analisis estructural y de docking.
- Evaluacion de variantes: comparar estructuras predichas de proteinas wild-type y mutantes para estimar el impacto estructural de una mutacion.
- Reproduccion de resultados CASP14: el repositorio incluye la variante `alphafold2-casp14` con el protocolo de cinco modelos y ocho ensembles por checkpoint, util para replicar el benchmark original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de GDT_TS, lDDT, pTM ni comparaciones numericas con otros modelos. El paper original de AlphaFold 2 reporta resultados en CASP14, pero esos datos no se reproducen en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 93 M de parametros en precision FP32, los pesos ocupan aproximadamente 0,37 GB, pero el consumo real depende de la longitud de la secuencia y del tamano del MSA.
- GPU recomendadas: no disponible. El modelo puede ejecutarse en CPU segun el ejemplo de la model card (`platform="CPU"` en la variante CASP14), aunque los tiempos seran mayores.
- Compatibilidad con GPU de consumo: probable en RTX 4090, RTX 3090 o superiores por el reducido tamano de pesos, pero no confirmado en la documentacion.
- Opciones de despliegue: la libreria `ofoldx` (instalable via `pip install ofoldx`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oteam/alphafold2-ptm-model-4` | 92,96 M | MSA 256, pares 128 | pLDDT, pTM, PAE | AGPL-3.0 | Hugging Face (oteam) |
| `oteam/alphafold2` | ~93,28 M | MSA 256, pares 128 | pLDDT | AGPL-3.0 | Hugging Face (oteam) |
| `oteam/alphafold2-multimer` | ~93,28 M | MSA 256, pares 128, multiples cadenas | pLDDT, pTM, PAE | AGPL-3.0 | Hugging Face (oteam) |
| AlphaFold 2 oficial (DeepMind) | no disponible en la ficha | no disponible | pLDDT, pTM, PAE | licencia de codigo abierto de DeepMind (no AGPL) | github.com/google-deepmind/alphafold |

La comparativa se limita a variantes del mismo autor porque la informacion proporcionada no incluye datos de modelos alternativos como ESMFold, RoseTTAFold u OmegaFold.

## Limitaciones y advertencias

- Implementacion no oficial: el equipo de DeepMind no ha escrito ni validado esta model card; los resultados pueden diferir de los del repositorio oficial.
- Licencia AGPL-3.0: cualquier uso en red o distribucion de obras derivadas obliga a liberar el codigo bajo la misma licencia; esto puede ser incompatible con productos comerciales cerrados.
- Solo proteinas: no predice acidos nucleicos, ligandos, hidrogenos ni el atomo OXT terminal; esos atomos quedan con coordenadas no disponibles.
- Dependencia de MSA: la calidad de la prediccion depende criticamente de la profundidad y calidad del alineamiento multiple de secuencias.
- Sin datos de sesgo: al ser un modelo biologico, no aplican sesgos linguisticos, pero si posibles sesgos derivados del dataset de entrenamiento (PDB), como sobrerrepresentacion de proteinas bien caracterizadas.
- Riesgo de sobreconfianza: los valores de pLDDT y pTM son estimaciones del propio modelo y no garantizan exactitud experimental.
- Sin benchmarks publicados en el repositorio: no es posible verificar el rendimiento relativo frente a otras implementaciones sin ejecutar validaciones propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/alphafold2-ptm-model-4
- Variante monomero: https://huggingface.co/oteam/alphafold2
- Variante pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Codigo OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Documentacion OFoldX: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
