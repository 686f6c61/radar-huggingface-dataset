# oteam/alphafold2

## Resumen

AlphaFold 2 es un modelo de prediccion de estructura de proteinas desarrollado originalmente por DeepMind (John Jumper et al.) y publicado en *Nature* en 2021. Esta ficha corresponde a `oteam/alphafold2`, una implementacion **no oficial** del modelo original, distribuida por el equipo OFoldX a traves de la libreria `ofoldx`. El modelo predice la estructura tridimensional de proteinas a partir de su secuencia de aminoacidos, un alineamiento multiple de secuencias (MSA) y, opcionalmente, plantillas estructurales.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un modulo estructural de atencion invariante a puntos (IPA) de 8 bloques que produce marcos de cadena principal, angulos de cadena lateral, coordenadas atomicas y valores de confianza (pLDDT). El checkpoint principal tiene 93.283.418 parametros y esta disponible en formato `safetensors` dentro de un repositorio de 0,4 GB.

Su relevancia actual radica en que reproduce el protocolo de AlphaFold 2 en un formato empaquetado y consumible desde Python, con variantes para monomeros (con y sin pTM/PAE), complejos multiméricos y el ensemble de cinco modelos de CASP14. No es un modelo de lenguaje: es un modelo cientifico especializado en biologia estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco Evoformer (48 bloques + 4 bloques extra-MSA) y modulo estructural de atencion invariante a puntos (8 bloques) |
| Parametros totales | 93.283.418 (variante monomer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; MSA de 256 secuencias, representacion de pares de 128 y representacion single de 384 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de biologia estructural, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Pasos de reciclado (recycling) | 4 (monomero y monomero pTM); 21 (multimero) |
| Tamano del repositorio | 0,4 GB |
| Libreria | ofoldx |
| Pipeline | other |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura descrita en el articulo original de AlphaFold 2. El tronco Evoformer procesa de forma conjunta la representacion del alineamiento multiple de secuencias (MSA) y la representacion de pares de residuos, intercalando atencion sobre filas y columnas del MSA con actualizaciones triangulares de la matriz de pares. A continuacion, el modulo estructural de atencion invariante a puntos predice marcos de cadena principal, angulos de cadena lateral y coordenadas atomicas, junto con estimaciones de confianza por residuo (pLDDT). La variante multimer incorpora MSAs emparejados y caracteristicas relativas entre cadenas para predecir complejos proteicos.

Segun la model card, el checkpoint principal corresponde a la variante monomer con 48 bloques Evoformer, 4 bloques extra-MSA, 8 bloques estructurales, MSA de tamano 256, pares de 128, single de 384 y 4 pasos de reciclado. La variante multimer eleva el reciclado a 21 pasos. El proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se detalla en la informacion proporcionada; se remite al articulo original para los detalles de entrenamiento. No se documenta ninguna innovacion adicional respecto al modelo original de DeepMind.

## Capacidades

- Prediccion de estructura tridimensiona de proteinas monomericas a partir de secuencia, MSA y plantillas opcionales.
- Estimacion de confianza por residuo mediante pLDDT en la variante base.
- Estimacion de PAE (predicted aligned error) y pTM en la variante `alphafold2-ptm`.
- Prediccion de complejos proteicos multicadena en la variante `alphafold2-multimer`, con MSAs emparejados.
- Ensemble de cinco modelos con protocolo CASP14 y ocho ensembles de entrada por checkpoint (`alphafold2-casp14`).
- Evaluacion con conjetura inicial (initial-guess) para complejos objetivo-binder, usada por PXDesign (`alphafold2-initial-guess`).
- Relajacion de estructura con Amber via OpenMM y PDBFixer, opcional sobre la mejor prediccion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso generico ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- **Prediccion de estructura de proteinas monomericas**: dado un fichero CIF con secuencia y MSA, el pipeline `ofoldx.pipeline("fold", model="oteam/alphafold2")` devuelve la estructura predicha con valores de pLDDT, util para anotacion funcional y estudios de plegamiento.
- **Modelado de complejos proteicos**: con `oteam/alphafold2-multimer` se pueden predecir interacciones entre cadenas, lo que resulta adecuado para analizar interfaces de union en dianas terapeuticas.
- **Ranking de predicciones con ensemble CASP14**: `oteam/alphafold2-casp14` permite ejecutar cinco checkpoints con ocho ensembles de entrada y seleccionar la mejor estructura por pLDDT medio, apropiado para pipelines de validacion estructural de alta exigencia.
- **Evaluacion de disenos de binder**: la variante `alphafold2-initial-guess` evalua complejos objetivo-binder usando sus coordenadas existentes como conjetura inicial, integrable en flujos de diseno de proteinas como PXDesign.
- **Refinamiento estructural con relajacion Amber**: tras la prediccion, se puede aplicar relajacion sobre la mejor estructura usando OpenMM y PDBFixer, util para eliminar conflictos estericos antes de simulaciones de dinamica molecular.
- **Anotacion a escala en pipelines bioinformaticos**: al estar empaquetado como libreria Python (`pip install ofoldx`), se puede integrar en flujos automatizados de anotacion de genomas o metagenomas, siempre que se disponga de MSAs precalculados.
- **Generacion de hipotesis estructurales para cribado virtual**: las coordenadas predichas con pLDDT alto pueden servir como punto de partida para docking molecular y cribado de compuestos, con la cautela de que no sustituyen a estructuras experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la informacion proporcionada. El checkpoint principal ocupa 0,4 GB en `safetensors`, pero el consumo en inferencia depende del tamano de la proteina, la profundidad del MSA y los pasos de reciclado, y no se documenta.
- **GPU recomendadas**: no disponible. La model card menciona un parametro `platform="CPU"` para el pipeline de ensemble, lo que indica soporte de ejecucion en CPU, aunque sin datos de latencia.
- **Compatibilidad con GPU de consumo**: no confirmada en la informacion disponible.
- **Opciones de despliegue**: la via documentada es la libreria `ofoldx` (`pip install ofoldx`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. La relajacion Amber requiere OpenMM y PDBFixer instalados en el mismo entorno (por ejemplo, via conda-forge).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/alphafold2 (esta ficha) | 93,28 M | MSA 256, pares 128, single 384 | AGPL-3.0 | Hugging Face, libreria ofoldx |
| AlphaFold 2 oficial (google-deepmind/alphafold) | No disponible en la informacion | No disponible | No disponible en la informacion | Repositorio GitHub oficial |
| AlphaFold-Multimer (variante del mismo autor) | 93,28 M (multimer) | MSA 256, 21 pasos de reciclado | AGPL-3.0 | Hugging Face, libreria ofoldx |

No se dispone de datos de benchmarks ni de especificaciones detalladas de otros modelos comparables (por ejemplo, RoseTTAFold o ESMFold) en la informacion proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- **Implementacion no oficial**: la model card indica explicitamente que se trata de una implementacion no oficial de AlphaFold 2 y que el equipo original de DeepMind no escribio la model card. La fidelidad respecto al modelo original no esta garantizada por el autor.
- **Sesgos conocidos**: no documentados en la informacion proporcionada.
- **Riesgo de alucinacion**: en el contexto de prediccion estructural, el equivalente es la produccion de coordenadas con baja confianza; el modelo expone pLDDT (y pTM/PAE en la variante correspondiente), pero no se documentan umbrales ni calibracion.
- **Limitaciones de contexto o idioma**: no aplica el concepto de idioma; el modelo depende de la calidad y cobertura del MSA de entrada. No se documentan limites en longitud de secuencia o numero de cadenas.
- **Restricciones de licencia**: la licencia es AGPL-3.0, lo que impone obligaciones de copyleft sobre obras derivadas y sobre el uso en red; es preciso revisar su compatibilidad con el uso comercial previsto.
- **Caveats para produccion**: el pipeline devuelve cada prediccion en un nuevo marco de coordenadas; los atomos no predichos (ligandos, hidrogenos, OXT terminal) tienen coordenadas no disponibles. La relajacion Amber exige un grafo proteico lineal estandar cerrado y sustituye los metadatos de coordenadas experimentales. La variante multimer requiere 21 pasos de reciclado, lo que incrementa el coste computacional frente al monomero.
- **Madurez del repositorio**: el modelo registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-01), lo que sugiere un artefacto reciente y sin validacion comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/alphafold2
- Variante pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Codigo: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Libreria ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
