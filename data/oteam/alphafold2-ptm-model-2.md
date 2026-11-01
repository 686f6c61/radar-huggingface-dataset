# oteam/alphafold2-ptm-model-2

## Resumen

AlphaFold 2 es un modelo de prediccion de estructura de proteinas desarrollado originalmente por DeepMind (John Jumper et al., 2021). Esta ficha corresponde a una implementacion **no oficial** publicada por el equipo OFoldX en HuggingFace bajo el identificador `oteam/alphafold2-ptm-model-2`. El modelo predice la estructura tridimensional de proteinas a partir de secuencias de aminoacidos, alineamientos multiples de secuencias (MSA) y plantillas estructurales opcionales, devolviendo ademas metricas de confianza como pLDDT, PAE y pTM.

La arquitectura combina un tronco Evoformer que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un modulo estructural basado en atencion de puntos invariantes (invariant point attention) que produce marcos de backbone, angulos de cadena lateral, coordenadas atomicas y valores de confianza. Esta variante concreta (Monomer pTM) cuenta con 93.291.674 parametros y anade prediccion de PAE y pTM frente a la variante monomer basica.

Es relevante porque democratiza el acceso a un modelo historico en biologia estructural computacional mediante la libreria `ofoldx`, aunque con la advertencia de que no es la implementacion oficial y que su licencia AGPL-3.0 impone obligaciones copyleft relevantes para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de estructura proteica condicionado por MSA y plantillas: tronco Evoformer (48 bloques) + 4 bloques extra-MSA + modulo estructural de atencion de puntos invariantes (8 bloques) |
| Parametros totales | 93.291.674 (93,292 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (MSA de 256, representacion de pares de 128, representacion single de 384; 4 pasos de reciclado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura AlphaFold 2 original: un tronco Evoformer de 48 bloques que procesa y actualiza de forma conjunta las representaciones de MSA (tamano 256) y de pares de residuos (tamano 128), con 4 bloques extra-MSA adicionales. La representacion single tiene dimension 384. Sobre el tronco se situa un modulo estructural de 8 bloques basado en atencion de puntos invariantes que genera marcos de backbone, angulos de cadena lateral, coordenadas atomicas y valores de confianza. El modelo realiza 4 pasos de reciclado (recycling steps).

Esta variante concreta (Monomer pTM) predice ademas de pLDDT las metricas PAE (predicted aligned error) y pTM (predicted template modelling score), lo que permite evaluar la calidad global del plegado y la incertidumbre en la orientacion relativa de dominios. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). Se trata de una reimplementacion no oficial de los pesos y la arquitectura descritos en el paper de Jumper et al. (2021), publicada por OFoldX.

## Capacidades

- Prediccion de estructura tridimensiona de proteinas monomericas a partir de secuencia de aminoacidos y MSA.
- Generacion de marcos de backbone, angulos de cadena lateral y coordenadas atomicas.
- Prediccion de confianza por residuo (pLDDT), error alineado por pares (PAE) y score global (pTM) en esta variante.
- Uso opcional de plantillas estructurales como entrada.
- Soporte de multiples pasos de reciclado (4 en esta variante) para refinar la prediccion.
- Integracion con la libreria `ofoldx` mediante pipeline `fold`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No es un modelo multilingue ni procesa texto libre: su dominio es exclusivamente biologico-estructural.

## Casos de uso

- **Prediccion de estructura de proteinas monomericas en investigacion academica**: el modelo permite obtener estructuras 3D con metricas de confianza (pLDDT, PAE, pTM) a partir de una secuencia y su MSA, adecuado para estudios de biologia estructural donde se necesita una hipotesis inicial antes de cristalografia o crio-EM.
- **Anotacion funcional y estudio de mutaciones**: al disponer de PAE y pTM, se puede evaluar como afecta una mutacion a la confianza del plegado global y por dominios, ayudando a priorizar variantes de interes en estudios geneticos.
- **Generacion de hipotesis para docking y cribado virtual**: las coordenadas predichas pueden servir como entrada a pipelines de docking molecular o cribado de farmacos cuando no existe estructura experimental.
- **Ensenanza y formacion en bioinformatica estructural**: el pipeline `ofoldx.pipeline("fold", ...)` permite a estudiantes ejecutar predicciones y analizar metricas de confianza sin montar la infraestructura oficial de AlphaFold 2.
- **Preprocesado en pipelines de diseno de proteinas**: la variante `alphafold2-initial-guess` (mencionada en la model card) se usa como evaluador en PXDesign; esta variante pTM puede emplearse para validar disenos generados por otros modelos.
- **Investigacion en plegado y comparacion de metodos**: al ser una reimplementacion, sirve para reproducir resultados del paper original y comparar con implementaciones oficiales o alternativas como ESMFold en entornos controlados.
- **Integracion en flujos de analisis con OpenMM/PDBFixer**: la model card documenta el uso de relajacion Amber para obtener coordenadas fisicamente mas plausibles, util en pipelines que requieran geometria refinada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 93,3 M de parametros, el peso en precision FP32 rondaria los 0,37 GB, pero el consumo real depende de las representaciones intermedias (MSA de 256, pares de 128, single de 384) y de la longitud de la secuencia, que pueden dominar el uso de memoria.
- GPU recomendadas: no disponible. Por tamano de parametros cabria en GPUs consumer, pero la model card no especifica requisitos.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: la model card solo documenta la libreria `ofoldx` (`pip install ofoldx`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). La relajacion Amber requiere OpenMM y PDBFixer via conda-forge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / MSA | Confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-ptm-model-2 (esta ficha) | 93,3 M | MSA 256, pares 128, single 384, 4 reciclados | pLDDT, PAE, pTM | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/alphafold2 | 93,283 M | MSA 256, pares 128, single 384, 4 reciclados | pLDDT | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/alphafold2-multimer | 93,278 M | MSA 256, pares 128, single 384, 21 reciclados | pLDDT (complejos) | AGPL-3.0 | HuggingFace (ofoldx) |
| oteam/alphafold2-casp14 | no disponible | protocolo de 5 modelos, 8 ensembles por checkpoint | pLDDT | AGPL-3.0 | HuggingFace (ofoldx) |

No se dispone de datos de benchmarks comparativos con ESMFold u otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Implementacion no oficial**: la model card indica explicitamente que es una implementacion no oficial y que el equipo de DeepMind no escribio la model card ni respalda esta version.
- **Licencia AGPL-3.0**: impone obligaciones copyleft. El uso en servicios en red puede requerir la publicacion del codigo fuente derivado; revisar antes de uso comercial o en produccion.
- **Solo proteinas monomericas**: esta variante no predice complejos multiproteicos; para ello existe `alphafold2-multimer`.
- **Coordenadas no predichas**: los atomos no predichos (ligandos, hidrogenos, OXT terminal) tienen coordenadas no disponibles.
- **Dependencia de MSA y plantillas**: la calidad de la prediccion depende de la calidad y profundidad del MSA; secuencias con pocos homólogos pueden dar resultados poco fiables.
- **Riesgo de confianza mal calibrada**: pLDDT, PAE y pTM son estimaciones del propio modelo; no sustituyen validacion experimental.
- **Sin datos de sesgo**: no se documentan sesgos especificos, pero al ser un modelo biologico entrenado con PDB, puede heredar sesgos del conjunto de estructuras experimentales.
- **Sin informacion de cuantizacion ni hardware**: la model card no detalla opciones de cuantizacion ni requisitos de VRAM, lo que complica el dimensionamiento en produccion.
- **Fecha de creacion futura**: el repositorio figura creado el 2026-11-01, dato anomalo que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/alphafold2-ptm-model-2
- Variante monomer: https://huggingface.co/oteam/alphafold2
- Variante monomer pTM: https://huggingface.co/oteam/alphafold2-ptm
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
