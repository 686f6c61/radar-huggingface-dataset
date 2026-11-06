# oteam/alphafold2-ptm-model-3

## Resumen

AlphaFold 2 es un modelo de predicción de estructura tridimensional de proteínas a partir de su secuencia de aminoácidos, desarrollado originalmente por DeepMind (John Jumper et al.) y publicado en *Nature* en 2021. Esta ficha corresponde a `oteam/alphafold2-ptm-model-3`, una implementación no oficial distribuida por el equipo OFoldX dentro de su librería `ofoldx`. El modelo combina alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales para predecir coordenadas atómicas, ángulos de cadena lateral y métricas de confianza como pLDDT, PAE y pTM.

La arquitectura se basa en un tronco Evoformer de 48 bloques que actualiza de forma conjunta las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de *invariant point attention* con 8 bloques. La variante pTM aquí descrita incorpora cabezas de confianza PAE y pTM, lo que la hace adecuada para estimación de incertidumbre a nivel de dominio y de residuo. Con aproximadamente 93 millones de parámetros y 4 pasos de reciclado, es un modelo compacto en comparación con los LLM actuales, pero computacionalmente intensivo por la longitud de las representaciones MSA y de pares.

Su relevancia actual radica en que sigue siendo la referencia metodológica para predicción de estructura proteica y un componente habitual en pipelines de diseño de proteínas, anotación funcional y evaluación de complejos. La disponibilidad de una implementación en `ofoldx` con pesos en safetensors facilita su integración en flujos de trabajo reproducibles, aunque con la advertencia de que no es la versión oficial de DeepMind.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tronco Evoformer (48 bloques) y módulo estructural de invariant point attention (8 bloques) |
| Parámetros totales | 93.292.266 (93,29 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionado por tamaño de MSA de 256 y representación de pares de 128) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (librería `ofoldx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura original de AlphaFold 2: un tronco Evoformer de 48 bloques que procesa simultáneamente la representación de alineamiento múltiple de secuencias (MSA, dimensión 256) y la representación de pares de residuos (dimensión 128), con 4 bloques extra de MSA. Sobre esa representación actúa un módulo estructural de 8 bloques basado en *invariant point attention* que predice marcos de esqueleto, ángulos de cadena lateral, coordenadas atómicas y valores de confianza. La variante pTM añade cabezas de predicción de PAE (predicted aligned error) y pTM (predicted TM-score), y emplea 4 pasos de reciclado. La representación de residuo simple tiene dimensión 384.

El entrenamiento se realizó con datos de estructuras del PDB y alineamientos MSA generados con bases de datos como UniRef y MGnify, siguiendo el protocolo descrito en el artículo original de Jumper et al. (2021). No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO, algo que no aplica en el mismo sentido que en modelos de lenguaje. La innovación técnica principal es el uso combinado de atención equivariante sobre pares de residuos y actualizaciones conjuntas MSA-pares, que permite propagar información evolutiva a la geometría 3D.

## Capacidades

- Predicción de estructura terciaria de proteínas monoméricas a partir de secuencia de aminoácidos.
- Generación de alineamientos MSA y uso de plantillas estructurales opcionales como condicionamiento.
- Predicción de coordenadas atómicas de esqueleto y de ángulos de cadena lateral.
- Estimación de confianza por residuo mediante pLDDT.
- Estimación de confianza global e inter-dominio mediante pTM y PAE en esta variante.
- Soporte de evaluación con conjuntos de modelos (protocolo CASP14 de cinco checkpoints con ocho ensembles de entrada).
- Soporte de relajación de estructura con Amber/OpenMM/PDBFixer (opcional, requiere dependencias adicionales).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües ni de visión, audio o modo thinking.

## Casos de uso

- Anotación funcional de proteínas desconocidas: predecir la estructura de una secuencia candidata y usar la geometría resultante para inferir dominios y posibles funciones mediante comparación con estructuras conocidas.
- Diseño computacional de proteínas: emplear las predicciones como paso de validación en pipelines de diseño de novo, evaluando la plausibilidad estructural de las secuencias generadas.
- Predicción de sitios de unión y cavidades: usar las coordenadas atómicas y los valores de pLDDT para localizar regiones de alta confianza donde estudiar posibles bolsillos de unión.
- Priorización de dianas terapéuticas: generar modelos estructurales de proteínas sin estructura experimental resuelta para alimentar estudios de docking y cribado virtual.
- Análisis de variantes y mutaciones: comparar la estructura predicha de una proteína wild-type con la de una variante para evaluar el impacto estructural de mutaciones de interés clínico.
- Evaluación de complejos proteína-proteína: aunque esta variante es monomérica, el ecosistema OFoldX incluye `alphafold2-multimer` para complejos; esta variante pTM puede usarse como referencia de confianza por cadena.
- Docencia e investigación metodológica: reproducir el protocolo AlphaFold 2 en entornos controlados para estudiar el comportamiento de las representaciones MSA y de pares.
- Integración en pipelines de plegado a escala: procesar lotes de secuencias con la librería `ofoldx` y almacenar resultados con métricas de confianza para su filtrado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la longitud de la secuencia, el tamaño del MSA y el número de reciclados. Para secuencias de varios cientos de residuos se recomienda al menos 16-24 GB de VRAM en FP16, aunque esta cifra es una estimación orientativa y no un dato confirmado por el autor.
- GPU recomendadas: A100, H100 o RTX 4090 para secuencias largas; GPUs consumer de gama media pueden ser suficientes para secuencias cortas con MSA reducido.
- Cabe en GPU consumer: probablemente en RTX 3090, RTX 4090 y GPUs con 24 GB o más, condicionado a la longitud de la secuencia y al tamaño del MSA.
- Opciones de despliegue: librería `ofoldx` (pip install ofoldx); relajación opcional con OpenMM y PDBFixer vía conda-forge.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / MSA | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/alphafold2-ptm-model-3 | 93,29 M | MSA 256, pares 128, 4 reciclados | AGPL-3.0 | Hugging Face (ofoldx) |
| oteam/alphafold2 | 93,28 M | MSA 256, pares 128, 4 reciclados | AGPL-3.0 | Hugging Face (ofoldx) |
| oteam/alphafold2-multimer | 93,28 M | MSA 256, pares 128, 21 reciclados | AGPL-3.0 | Hugging Face (ofoldx) |
| AlphaFold 2 oficial (google-deepmind) | No disponible en la información | No disponible | No disponible en la información | GitHub google-deepmind/alphafold |

## Limitaciones y advertencias

- Implementación no oficial: el equipo de DeepMind no ha escrito esta model card ni validado esta implementación; debe tratarse como una reproducción de terceros.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere revisión legal y, en su caso, liberación del código derivado.
- No predice ligandos, hidrógenos ni el átomo OXT terminal; las coordenadas de esos átomos quedan sin definir.
- Cada predicción usa un marco de coordenadas nuevo, por lo que las comparaciones directas entre ejecuciones requieren alineamiento.
- La calidad depende críticamente de la profundidad y calidad del MSA; secuencias huérfanas o con pocos homólogos pueden producir modelos de baja confianza.
- Riesgo de alucinación estructural en regiones intrínsecamente desordenadas: el modelo puede generar geometrías plausibles pero biológicamente inexactas.
- Los valores de pLDDT, PAE y pTM son estimaciones del propio modelo y no garantizan exactitud experimental.
- La relajación con Amber requiere OpenMM y PDBFixer instalados en el mismo entorno y solo funciona con grafos proteicos lineales cerrados y estándar.
- No disponible información sobre sesgos de composición del dataset de entrenamiento ni sobre evaluación en proteínas de membrana o regiones de baja complejidad.
- No disponible información sobre el rendimiento en benchmarks estándar (CASP, CAMEO) para esta implementación concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/alphafold2-ptm-model-3
- Variante monomérica: https://huggingface.co/oteam/alphafold2
- Variante pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Documentación de ofoldx: https://ofoldx.valtech.ai/
- Artículo AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Artículo AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial de DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
