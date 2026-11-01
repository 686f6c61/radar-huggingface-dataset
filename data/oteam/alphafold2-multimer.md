# oteam/alphafold2-multimer

## Resumen

AlphaFold 2 Multimer es una implementación no oficial del modelo AlphaFold-Multimer desarrollada por el equipo OFoldX (publicada bajo la cuenta `oteam`). Resuelve el problema de la predicción de la estructura tridimensional de complejos proteicos multi-cadena a partir de secuencias de aminoácidos, alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales. El modelo original fue creado por DeepMind (John Jumper et al.) y este checkpoint reproduce su arquitectura con pesos en formato safetensors para la librería `ofoldx`.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de atención sobre puntos invariantes (invariant-point-attention) que predice marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y valores de confianza. La variante Multimer incorpora MSAs emparejados y características relativas entre cadenas para modelar complejos proteicos.

El checkpoint contiene 93.278.041 parámetros (unos 93,3 millones) y ocupa 0,4 GB en el repositorio. Es relevante para investigadores en biología estructural y diseño de proteínas que necesiten ejecutar predicciones de complejos fuera del ecosistema oficial de DeepMind, con una licencia AGPL-3.0 que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + módulo estructural de invariant-point-attention (8 bloques) con 4 bloques extra-MSA |
| Parámetros totales | 93.278.041 (93,278 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (MSA de 256 secuencias, representación de pares de 128, representación single de 384) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Pasos de reciclado (recycling) | 21 |
| Tamaño del repositorio | 0,4 GB |
| Librería | ofoldx |
| Pipeline | other |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura AlphaFold 2: un tronco Evoformer de 48 bloques que procesa de forma conjunta la representación de MSA (tamaño 256) y la representación de pares de residuos (tamaño 128), con 4 bloques adicionales específicos de MSA y una representación single de tamaño 384. Sobre el tronco se aplica un módulo estructural de 8 bloques basado en atención sobre puntos invariantes que produce marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y estimaciones de confianza (pLDDT, y en variantes con pTM, también PAE y pTM).

La variante Multimer extiende el modelo base con MSAs emparejados entre cadenas y características relativas de cadena, lo que permite modelar complejos proteicos además de proteínas individuales. El checkpoint emplea 21 pasos de reciclado, frente a los 4 de las variantes monómero de la misma familia. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables a este tipo de modelo). Tampoco se especifican innovaciones adicionales más allá de las propias de AlphaFold 2 y AlphaFold-Multimer.

## Capacidades

- Predicción de estructura 3D de complejos proteicos multi-cadena a partir de secuencias, MSAs y plantillas estructurales opcionales.
- Predicción de marcos de cadena principal, ángulos de cadena lateral y coordenadas atómicas.
- Estimación de confianza mediante pLDDT; la familia incluye variantes con PAE y pTM (checkpoint `alphafold2-ptm`).
- Manejo de MSAs emparejados y características relativas entre cadenas para el modelado de interfaces proteína-proteína.
- Soporte de reciclado iterativo (21 pasos en esta variante) para refinar la predicción.
- Evaluación de complejos objetivo-ligando mediante coordenadas iniciales (variante `alphafold2-initial-guess`).
- Ensamblado tipo CASP14 con cinco modelos y ocho conjuntos de entrada por checkpoint (variante `alphafold2-casp14`), con relajación opcional mediante Amber/OpenMM.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües: es un modelo especializado en biología estructural.

## Casos de uso

- Predicción de complejos proteína-proteína: el modelo procesa MSAs emparejados y características relativas de cadena para generar estructuras de dímeros y complejos mayores, útil en estudios de interacciones moleculares.
- Análisis de interfaces de unión: al predecir coordenadas de múltiples cadenas de forma conjunta, permite inspeccionar la geometría de la interfaz y los residuos implicados en la unión.
- Priorización en biología estructural: predicciones con pLDDT permiten descartar o priorizar candidatos antes de invertir tiempo en cristalografía o crio-microscopía electrónica.
- Diseño de proteínas y anticuerpos: la variante de evaluación con coordenadas iniciales (`alphafold2-initial-guess`) permite evaluar complejos objetivo-ligando partiendo de una estructura existente.
- Protocolo de ensamblado tipo CASP14: la variante `alphafold2-casp14` permite ejecutar cinco checkpoints con ocho conjuntos de entrada y clasificar predicciones, replicando el protocolo de evaluación del certamen.
- Refinamiento estructural con relajación: mediante Amber y OpenMM se pueden relajar las coordenadas predichas del mejor modelo para obtener geometrías más realistas, útil en pipelines de modelado molecular.
- Integración en pipelines bioinformáticos: al distribuirse como pesos safetensors para la librería `ofoldx`, puede incorporarse en flujos automatizados de anotación estructural junto a herramientas de generación de MSAs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 93,3 M de parámetros, los pesos en precisión completa ocupan aproximadamente 0,37 GB, pero las representaciones intermedias del Evoformer (MSA de 256 × 128 y pares de 128 × 128 por residuo) dominan el consumo de memoria y crecen con la longitud de la secuencia y el número de cadenas.
- GPU recomendadas: no disponible en la información proporcionada. El código de ejemplo de la model card menciona `platform="CPU"` para la relajación, lo que indica soporte de ejecución en CPU para al menos parte del pipeline.
- ¿Cabe en GPU de consumo? No disponible; depende de la longitud de la secuencia y del complejo, no solo del tamaño del modelo.
- Opciones de despliegue: librería `ofoldx` (instalación vía `pip install ofoldx`); relajación con OpenMM y PDBFixer instalados en el mismo entorno (conda-forge).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / MSA | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/alphafold2-multimer | 93,278 M | MSA 256, pares 128, single 384, 21 reciclados | AGPL-3.0 | HuggingFace (oteam) |
| oteam/alphafold2 | 93,283 M | MSA 256, pares 128, single 384, 4 reciclados | AGPL-3.0 | HuggingFace (oteam) |
| oteam/alphafold2-ptm | 93,292 M | MSA 256, pares 128, single 384, 4 reciclados | AGPL-3.0 | HuggingFace (oteam) |
| google-deepmind/alphafold (oficial) | no disponible en la información | no disponible | no disponible en la información | Repositorio oficial en GitHub |

Las variantes monómero de OFoldX comparten arquitectura y tamaño con este checkpoint, pero no modelan complejos multi-cadena y usan 4 pasos de reciclado frente a 21. La implementación oficial de DeepMind no se distribuye como checkpoint en HuggingFace según la información disponible.

## Limitaciones y advertencias

- Implementación no oficial: la model card advierte explícitamente de que se trata de una implementación no oficial de AlphaFold 2 y que el equipo original de DeepMind no escribió la model card.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que utilice el modelo en servicios en red; conviene revisar su compatibilidad con el uso comercial previsto.
- Coordenadas no predichas: los átomos no predichos, incluidos ligandos, hidrógenos y el OXT terminal, tienen coordenadas no disponibles.
- Marco de coordenadas: cada predicción utiliza un marco de coordenadas nuevo, por lo que las coordenadas no son directamente comparables entre ejecuciones sin alineamiento.
- Dependencia de MSAs y plantillas: la calidad de la predicción depende de la calidad y cobertura de los alineamientos múltiples y de las plantillas proporcionadas; la información disponible no detalla el impacto cuantitativo.
- Relajación con Amber: requiere OpenMM y PDBFixer, y solo funciona con un grafo proteico lineal estándar cerrado; las coordenadas relajadas sustituyen a los metadatos experimentales.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación estructural: no cuantificado en la información disponible; la confianza debe interpretarse mediante pLDDT (y PAE/pTM en las variantes correspondientes).
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Sin datos de benchmarks publicados en la información disponible, por lo que no es posible validar su precisión frente a otras implementaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/alphafold2-multimer
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante monómero con pTM y PAE: https://huggingface.co/oteam/alphafold2-ptm
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial de DeepMind: https://github.com/google-deepmind/alphafold
- Documentación de OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
