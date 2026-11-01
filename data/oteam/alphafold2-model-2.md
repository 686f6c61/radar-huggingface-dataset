# oteam/alphafold2-model-2

## Resumen

AlphaFold 2 es un modelo de predicción de estructura de proteínas desarrollado originalmente por DeepMind (John Jumper et al.) y publicado en *Nature* en 2021. Esta ficha corresponde a la implementación no oficial `oteam/alphafold2-model-2`, distribuida por el equipo OFoldX dentro de la librería `ofoldx`. El modelo predice coordenadas atómicas tridimensionales de proteínas a partir de la secuencia de aminoácidos, un alineamiento múltiple de secuencias (MSA) y, opcionalmente, plantillas estructurales.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de atención sobre puntos invariantes (invariant point attention) de 8 bloques que emite marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y valores de confianza (pLDDT). El checkpoint aquí publicado cuenta con 93.283.418 parámetros (~93,3 M) y un peso de repositorio de 0,4 GB en formato safetensors.

Es relevante porque democratiza el acceso a un predictor de estructura proteica de referencia dentro de un ecosistema Python (`ofoldx`) que también ofrece variantes monómero, con pTM/PAE, multímero, el protocolo CASP14 de cinco modelos y el evaluador de conjetura inicial. No obstante, se trata de una reimplementación no oficial y no de los pesos oficiales de DeepMind.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + módulo estructural de invariant point attention (8 bloques) + 4 bloques extra-MSA |
| Parámetros totales | 93.283.418 (~93,3 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; MSA de 256 secuencias, representación de pares de 128 y de residuo simple de 384 canales |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Pasos de reciclado (recycling) | 4 |
| Librería | ofoldx |
| Pipeline | other (predicción de estructura proteica) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura descrita en el artículo original de AlphaFold 2. Un tronco Evoformer de 48 bloques procesa de forma conjunta la representación del alineamiento múltiple de secuencias (MSA) y la representación de pares de residuos, intercambiando información entre ambas mediante atención y operaciones triangulares. A continuación, un módulo estructural de 8 bloques con invariant point attention predice marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y estimaciones de confianza. El modelo opera con 4 pasos de reciclado (recycling) y dimensiones internas de MSA 256, pares 128 y residuo simple 384.

La variante multímero del mismo autor extiende el modelo con MSAs emparejados y características relativas entre cadenas para predecir complejos proteicos, y emplea 21 pasos de reciclado. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la innovación central es el propio Evoformer y la invariant point attention.

## Capacidades

- Predicción de estructura tridimensional de proteínas a partir de secuencia, MSA y plantillas estructurales opcionales.
- Generación de marcos de cadena principal y ángulos de cadena lateral.
- Predicción de coordenadas atómicas con valores de confianza pLDDT.
- Variantes con confianza adicional pTM y PAE (en `oteam/alphafold2-ptm`).
- Predicción de complejos proteicos multicadena (en `oteam/alphafold2-multimer`).
- Protocolo de ensemble CASP14 de cinco modelos con ocho ensembles de entrada por checkpoint.
- Evaluación de conjetura inicial (initial-guess) para complejos objetivo-binder con coordenadas existentes.
- Relajación de estructuras con Amber a través de OpenMM y PDBFixer (opcional).
- No soporta tool calling, function calling, agentes conversacionales ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Predicción de estructura de proteínas monoméricas: se introduce la secuencia y el MSA y el modelo devuelve coordenadas atómicas con pLDDT, útil para caracterizar proteínas sin estructura experimental resuelta.
- Análisis de complejos proteína-proteína: mediante la variante multímero, se modelan interacciones entre cadenas con MSAs emparejados, aplicable al estudio de interfaces de unión.
- Diseño de fármacos y biológicos: la predicción de bolsas de unión y superficies de interacción sirve como punto de partida para cribado virtual y diseño racional.
- Validación de estructuras experimentales: comparar la predicción con estructuras de cristalografía o crio-EM para detectar regiones desordenadas o mal resueltas.
- Ranking de candidatos en pipelines de diseño de proteínas: el ensemble CASP14 permite puntuar y ordenar múltiples predicciones y relajar la mejor estructura con Amber.
- Evaluación de complejos objetivo-binder: el evaluador de conjetura inicial permite puntuar complejos ya asignados por secuencia usando sus coordenadas existentes.
- Anotación funcional a gran escala: procesar lotes de secuencias para inferir dominios y motivos estructurales en estudios de genómica comparada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~93,3 M de parámetros y pesos en safetensors de 0,4 GB, el modelo en precisión nativa ocupa un orden de magnitud inferior a 1 GB, aunque el consumo real depende de las dimensiones del MSA y de la longitud de la proteína.
- GPU recomendadas: no disponibles en la información proporcionada; el artículo original emplea aceleradores de gama alta para MSAs grandes.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería `ofoldx` (instalable con `pip install ofoldx`); relajación opcional con OpenMM y PDBFixer vía conda-forge. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / MSA | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/alphafold2-model-2 (esta ficha) | ~93,3 M | MSA 256, pares 128 | AGPL-3.0 | HuggingFace, librería ofoldx |
| oteam/alphafold2 | ~93,3 M | MSA 256, pares 128 | AGPL-3.0 | HuggingFace, variante monómero con pLDDT |
| oteam/alphafold2-multimer | ~93,3 M | MSA 256, pares 128, 21 reciclados | AGPL-3.0 | HuggingFace, complejos multicadena |
| AlphaFold 2 oficial (google-deepmind) | no disponible en la información | no disponible | no disponible en la información | Repositorio oficial de DeepMind |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: los pesos y la model card han sido elaborados por el equipo OFoldX, no por DeepMind; pueden existir diferencias respecto a los pesos oficiales.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código derivado y puede condicionar el uso comercial en productos propietarios; conviene revisar con asesoría legal.
- Coordenadas no predichas: los átomos no predichos, incluidos ligandos, hidrógenos y el OXT terminal, quedan con coordenadas no disponibles.
- Marco de coordenadas: cada predicción utiliza un marco de coordenadas nuevo, por lo que las comparaciones directas entre ejecuciones requieren alineamiento.
- Relajación con Amber: requiere OpenMM y PDBFixer y un grafo proteico lineal estándar cerrado; las coordenadas relajadas sustituyen a los metadatos experimentales.
- Riesgo de alucinación estructural: en regiones intrínsecamente desordenadas o con MSAs pobres, las predicciones pueden ser de baja confianza; debe consultarse siempre el pLDDT.
- Idiomas: no aplica, al no ser un modelo lingüístico; no se documentan capacidades multilingües.
- Sesgos de datos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos hacia proteínas sobrerrepresentadas en las bases de datos.
- Dependencia de la librería `ofoldx`: el uso requiere instalar y mantener esa librería, con el riesgo de compatibilidad que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/alphafold2-model-2
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante con pTM/PAE: https://huggingface.co/oteam/alphafold2-ptm
- Variante multímero: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Documentación de la librería: https://ofoldx.valtech.ai/
- Artículo original: https://doi.org/10.1038/s41586-021-03819-2
- Artículo AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial de DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
