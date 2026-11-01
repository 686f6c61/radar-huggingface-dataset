# oteam/alphafold2-casp14

## Resumen

AlphaFold 2 es el modelo de prediccion de estructura de proteinas desarrollado originalmente por DeepMind y publicado en *Nature* en 2021. Esta ficha corresponde a `oteam/alphafold2-casp14`, una implementacion **no oficial** distribuida por el equipo OFoldX a traves de la libreria `ofoldx`, que reproduce el protocolo de cinco modelos y ocho ensembles de entrada por checkpoint empleado en la evaluacion CASP14. El modelo predice la estructura tridimensional de proteinas a partir de la secuencia de aminoacidos, alineamientos multiples de secuencias (MSA) y plantillas estructurales opcionales.

Tecnicamente es un sistema de prediccion condicionado por MSA y plantillas, con un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un modulo estructural de atencion invariante a puntos que produce marcos de backbone, angulos de cadena lateral, coordenadas atomicas y valores de confianza. La variante de esta ficha agrupa los cinco checkpoints del protocolo CASP14, cada uno de los cuales evalua ocho ensembles de entrada, y anade la posibilidad de relajacion con Amber/OpenMM.

Su relevancia actual es doble: por un lado, sirve como referencia reproducible del comportamiento original de AlphaFold 2 en el benchmark CASP14; por otro, su empaquetado en `ofoldx` con pesos en `safetensors` facilita la integracion en pipelines modernos de biologia estructural sin depender del repositorio original de DeepMind. La licencia AGPL-3.0 condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + modulo estructural de atencion invariante a puntos (8 bloques); 4 bloques extra-MSA |
| Parametros totales | 93,283 M (variante monomer); 93,292 M (monomer pTM); 93,278 M (multimer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (MSA de 256 secuencias, representacion de pares de 128, representacion single de 384) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (libreria `ofoldx`) |

Otros parametros del protocolo: 4 pasos de reciclado en las variantes monomer y monomer pTM, 21 pasos en multimer. Tamano del repositorio: 1,9 GB. Numero de descargas y likes en HuggingFace: 0 en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura original de AlphaFold 2: un tronco Evoformer de 48 bloques que procesa simultaneamente la representacion de MSA (tamano 256) y la representacion de pares de residuos (tamano 128), con una representacion single de tamano 384. Cuatro bloques extra-MSA refinan la representacion de pares antes de pasar al modulo estructural, compuesto por 8 bloques de atencion invariante a puntos que emiten marcos de backbone, angulos de cadena lateral, coordenadas atomicas y estimaciones de confianza (pLDDT, y PAE/pTM en la variante correspondiente). El reciclado se aplica 4 veces en las variantes monomer y 21 en multimer, que ademas incorpora MSAs emparejados y caracteristicas relativas entre cadenas para complejos proteicos.

La variante `alphafold2-casp14` reproduce el protocolo de evaluacion de CASP14: cinco checkpoints, cada uno evaluando ocho ensembles de entrada generados a partir de una preparacion compartida. El ranking de predicciones se realiza por pLDDT medio y, opcionalmente, se aplica relajacion con Amber a traves de OpenMM y PDBFixer. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles sobre RLHF/DPO (no aplicables a este dominio). La model card indica que es una implementacion no oficial y remite al repositorio original `google-deepmind/alphafold` para los detalles de entrenamiento.

## Capacidades

- Prediccion de estructura tridimensional de proteinas monomericas a partir de secuencia, MSA y plantillas opcionales.
- Prediccion de complejos proteicos multicadena mediante la variante multimer (MSAs emparejados y caracteristicas entre cadenas).
- Estimacion de confianza por residuo (pLDDT) y, en la variante pTM, de PAE y pTM.
- Generacion de marcos de backbone, angulos de cadena lateral y coordenadas atomicas.
- Ranking de predicciones mediante ensembles de cinco checkpoints y ocho ensembles de entrada por checkpoint (protocolo CASP14).
- Relajacion opcional de la mejor estructura con Amber via OpenMM y PDBFixer.
- Evaluacion de complejos target-binder usando coordenadas existentes como initial guess (variante `alphafold2-initial-guess`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step linguistico ni capacidades multilingues: es un modelo especifico de biologia estructural.

## Casos de uso

- **Anotacion estructural a gran escala de genomas y proteomas**: dado un conjunto de secuencias, generar MSAs y predecir estructuras con pLDDT para priorizar dianas experimentales. El protocolo de cinco checkpoints permite obtener consenso y filtrar predicciones de baja confianza.
- **Prediccion de complejos proteina-proteina**: usar la variante multimer para modelar interfaces en estudios de senalizacion o diseno de inhibidores, aprovechando los MSAs emparejados y las 21 iteraciones de reciclado.
- **Docking y evaluacion de candidatos terapeuticos**: emplear la variante `alphafold2-initial-guess` para evaluar complejos target-binder partiendo de coordenadas conocidas, util en campanas de diseno de biologics.
- **Validacion de modelos experimentales**: comparar estructuras cristalograficas o cryo-EM con predicciones del ensemble CASP14 y usar pLDDT/PAE para identificar regiones desordenadas o mal resueltas.
- **Generacion de modelos para reemplazo molecular (MR) en cristalografia**: producir un modelo inicial suficientemente preciso para fases experimentales en proteinas homologas sin estructura resuelta.
- **Diseno de proteinas y mutagénesis**: predecir el efecto estructural de mutaciones puntuales comparando estructuras wild-type y mutante con el mismo pipeline y semilla controlada.
- **Docencia y benchmarking de metodos de plegado**: reproducir el protocolo CASP14 con los cinco checkpoints y ocho ensembles para comparar implementaciones o metodos alternativos bajo condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de GDT_TS, lDDT, pLDDT medio ni comparaciones numericas con otros modelos; unicamente describe el protocolo de evaluacion CASP14 (cinco modelos, ocho ensembles por checkpoint, ranking por pLDDT medio y relajacion opcional).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repositorio es de 1,9 GB, lo que corresponde a los pesos de los cinco checkpoints en `safetensors`; el consumo en ejecucion depende de la longitud de la secuencia, el tamano del MSA (256) y las dimensiones de las representaciones (pair 128, single 384), y no se especifica en la model card.
- GPU recomendadas: no disponible. El pipeline de `ofoldx` permite seleccionar `platform="CPU"` o GPU; no se enumeran modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en RTX 4090 ni en otras GPU consumer.
- Opciones de despliegue: libreria `ofoldx` (instalable via `pip install ofoldx`), con soporte de CPU y GPU. Para relajacion con Amber se requiere OpenMM y PDBFixer instalados en el mismo entorno (por ejemplo via `conda install -c conda-forge openmm pdbfixer`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-casp14 (esta ficha) | 93,28 M (por checkpoint) | MSA 256, pair 128, single 384; 5 checkpoints x 8 ensembles | pLDDT (y PAE/pTM en variante pTM) | AGPL-3.0 | HuggingFace via `ofoldx` |
| oteam/alphafold2 | 93,283 M | MSA 256, pair 128, single 384; 4 reciclados | pLDDT | AGPL-3.0 | HuggingFace via `ofoldx` |
| oteam/alphafold2-multimer | 93,278 M | MSA 256, pair 128, single 384; 21 reciclados | pLDDT | AGPL-3.0 | HuggingFace via `ofoldx` |
| AlphaFold 2 oficial (google-deepmind/alphafold) | no disponible en la informacion | no disponible | pLDDT, PAE, pTM | no disponible en la informacion | Repositorio GitHub oficial |

No se dispone en la informacion proporcionada de comparaciones con AlphaFold 3, ESMFold, RoseTTAFold ni otros predictores de estructura.

## Limitaciones y advertencias

- **Implementacion no oficial**: la model card declara explicitamente que se trata de una implementacion no oficial y que el equipo de DeepMind no escribio la model card. Para produccion conviene validar los pesos contra el repositorio original.
- **Licencia AGPL-3.0**: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere analisis legal y, en su caso, liberar el codigo derivado. No es apta para productos propietarios sin revision juridica.
- **Coordenadas no predichas**: los atomos no predichos (ligandos, hidrogenos, OXT terminal) tienen coordenadas no disponibles en la salida.
- **Marco de coordenadas nuevo por prediccion**: cada prediccion usa un marco de coordenadas distinto, por lo que las comparaciones directas entre ejecuciones requieren alineamiento.
- **Relajacion restringida**: la relajacion con Amber solo admite grafos proteicos lineales estandar y cerrados; las coordenadas relajadas reemplazan los metadatos experimentales.
- **Dependencias adicionales**: la relajacion requiere OpenMM y PDBFixer; la prediccion sin relajar no necesita paquetes extra.
- **Riesgo de alucinacion estructural**: en regiones de baja confianza (pLDDT bajo), las predicciones pueden ser plausibles pero incorrectas; es imprescindible filtrar por confianza y, cuando sea posible, validar experimentalmente.
- **Limitaciones de contexto**: el tamano de MSA (256) y de representacion de pares (128) condiciona la precision en proteinas muy largas o con pocos homologos; no se documenta el limite maximo de longitud de secuencia.
- **Idiomas**: no aplica; el modelo no procesa lenguaje natural.
- **Sin datos de benchmarks ni de hardware**: no se han publicado resultados numericos ni requisitos de VRAM en la informacion disponible, lo que dificulta la planificacion de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/alphafold2-casp14
- Variante monomer: https://huggingface.co/oteam/alphafold2
- Variante monomer pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Codigo OFoldX (AlphaFold 2): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Documentacion de `ofoldx`: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
