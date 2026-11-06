# oteam/alphafold2-model-3

## Resumen

AlphaFold 2 es un modelo de predicción de estructura de proteínas desarrollado originalmente por DeepMind (John Jumper et al.) y publicado en *Nature* en 2021. Esta ficha corresponde a `oteam/alphafold2-model-3`, una implementación **no oficial** distribuida por el equipo OFoldX bajo la librería `ofoldx`, que reproduce la arquitectura original con pesos en formato safetensors. El modelo predice coordenadas atómicas tridimensionales de proteínas a partir de su secuencia de aminoácidos, un alineamiento múltiple de secuencias (MSA) y, opcionalmente, plantillas estructurales.

Técnicamente se trata de una red con un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de *invariant point attention* de 8 bloques que emite marcos de backbone, ángulos de cadena lateral, coordenadas atómicas y valores de confianza (pLDDT, PAE, pTM según la variante). El checkpoint de este repositorio contiene 92.954.010 parámetros (aproximadamente 93 M), con un tamaño de repo de 0,4 GB.

Su relevancia radica en que empaqueta en un único artefacto safetensors cargable vía `ofoldx` un modelo que históricamente requería el repositorio oficial de DeepMind con dependencias pesadas. La familia incluye variantes para monómeros, complejos multimer, el protocolo CASP14 de cinco modelos y un evaluador de *initial guess*. La licencia AGPL-3.0 es un punto crítico para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de estructura proteica condicionado por MSA y plantillas: tronco Evoformer (48 bloques + 4 bloques extra-MSA) y módulo estructural de invariant point attention (8 bloques) |
| Parametros totales | 92.954.010 (aprox. 93 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la entrada es una secuencia con MSA de tamaño 256 y representación de pares de 128) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura canónica de AlphaFold 2: un Evoformer de 48 bloques que procesa de forma conjunta la representación de MSA (dimensión 256) y la representación de pares de residuos (dimensión 128), con atención triangular y actualizaciones cruzadas entre ambas. Tras el tronco, un módulo estructural de 8 bloques basado en *invariant point attention* predice marcos de backbone, ángulos de cadena lateral, coordenadas atómicas y estimaciones de confianza. La representación de residuo simple tiene dimensión 384 y el modelo aplica 4 pasos de *recycling* en las variantes monómero (21 en multimer). AlphaFold-Multimer añade MSAs emparejados y características relativas entre cadenas para complejos proteicos.

Los detalles de entrenamiento (número de tokens, composición exacta del dataset PDB/Uniclust, esquema de recorte, uso de RLHF/DPO) no se especifican en la model card de este repositorio. Se remite al paper original de *Nature* (Jumper et al., 2021) y al de AlphaFold-Multimer (Evans et al., 2021) para la descripción completa del procedimiento. La innovación técnica principal es la atención triangular en el Evoformer, que propaga información geométrica entre pares de residuos de forma equivariante, junto con el módulo IPA que garantiza invariancia a rotaciones y traslaciones globales.

## Capacidades

- Predicción de estructura 3D de proteínas monoméricas a partir de secuencia y MSA, con valores de confianza pLDDT por residuo.
- Predicción de estructura con confianza PAE y pTM en la variante `alphafold2-ptm`.
- Predicción de complejos proteicos multicadena en la variante `alphafold2-multimer`, con MSAs emparejados y características relativas entre cadenas.
- Ensemble de cinco modelos con ocho ensembles de entrada por checkpoint en la variante `alphafold2-casp14`, orientado a ranking de predicciones y relajación Amber del mejor modelo.
- Evaluación de *initial guess* de complejos target-binder usando coordenadas existentes como punto de partida (`alphafold2-initial-guess`).
- Salida de coordenadas atómicas, marcos de backbone y ángulos de cadena lateral; los átomos no predichos (ligandos, hidrógenos, OXT terminal) quedan sin coordenadas.
- No soporta tool calling, agentes, razonamiento multi-step genérico ni capacidades multilingües: es un modelo especializado de biología estructural.

## Casos de uso

- Predicción de estructura de proteínas de novo: dado un FASTA y un MSA generado con herramientas como HHblits o Jackhmmer, el modelo produce un modelo 3D con pLDDT por residuo, útil para priorizar dianas en descubrimiento de fármacos antes de recurrir a cristalografía o crio-EM.
- Análisis de complejos proteína-proteína: la variante multimer permite modelar la interfaz de un dímero o complejo mayor con MSAs emparejados, útil para estudiar interacciones en vías de señalización o para diseñar inhibidores de interfaz.
- Validación de variantes missense: modelar la proteína wild-type y la mutante y comparar pLDDT y PAE locales ayuda a flaggear variantes que comprometen el plegamiento, como paso previo a estudios funcionales.
- Diseño de proteínas y binder design: el evaluador de *initial guess* permite puntuar complejos target-binder generados por métodos generativos, usando las coordenadas del diseño como punto de partida para estimar la calidad del plegamiento.
- Anotación funcional en pipelines de genómica: integrar la predicción de estructura en un pipeline que procese proteínas anotadas de genomas recién secuenciados, generando modelos para familias sin estructura experimental y alimentando bases de datos como UniProt.
- Enseñanza e investigación en biología estructural: el ensemble CASP14 con relajación Amber permite reproducir el protocolo de evaluación de AlphaFold 2 en entornos académicos, comparando rankings de predicciones y estudiando la calibración de pLDDT/pTM.
- Cribado estructural a escala: desplegar la variante monómero en CPU o GPU para predecir estructuras de cientos de proteínas de un proteoma, filtrando por pLDDT medio antes de análisis más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de GDT-TS, lDDT, RMSD ni comparaciones numéricas con otros modelos; solo remite a los papers originales de AlphaFold 2 y AlphaFold-Multimer para los resultados del modelo oficial, que no deben atribuirse sin verificación a esta implementación no oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 93 M de parámetros en fp32, los pesos ocupan aproximadamente 0,37 GB, pero el consumo real está dominado por las activaciones del Evoformer (MSA 256 × pares 128) y por el tamaño de la secuencia de entrada, no por los pesos.
- GPU recomendadas: no disponible de forma explícita. Por el perfil del modelo y su predecesor oficial, cabe esperar que funcione en GPU de clase A100/H100 para secuencias largas y en GPUs consumer (RTX 3090/4090) para secuencias cortas y medianas, pero esta afirmación no está confirmada por la model card.
- Cabe en GPU consumer: no confirmado en la información disponible; la viabilidad depende de la longitud de la secuencia y del MSA.
- Opciones de despliegue: la vía documentada es la librería `ofoldx` (`pip install ofoldx`), con pipeline `ofoldx.pipeline("fold", model=...)`. La relajación Amber requiere OpenMM y PDBFixer instalados en el mismo entorno (vía conda-forge). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-model-3 (esta ficha) | 93 M | Secuencia + MSA (256) + plantillas | pLDDT (pTM/PAE en variante ptm) | AGPL-3.0 | Hugging Face, librería ofoldx |
| AlphaFold 2 oficial (google-deepmind/alphafold) | ~93 M por checkpoint | Secuencia + MSA + plantillas | pLDDT, PAE, pTM | Licencia propia de DeepMind (no AGPL) | GitHub oficial, pesos descargables |
| AlphaFold 3 | No disponible | Secuencia + MSA + ligandos + ácidos nucleicos | No disponible | No disponible (acceso restringido) | Servidor de DeepMind |
| ESMFold (Meta) | No disponible en esta ficha | Solo secuencia (modelo de lenguaje proteico) | pLDDT | No disponible en esta ficha | No disponible en esta ficha |

La comparativa se limita a lo verificable; los datos de AlphaFold 3 y ESMFold no están en la información proporcionada y no se completan con cifras no confirmadas.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que DeepMind no escribió esta card ni avala esta implementación; los resultados pueden diferir de los del repositorio oficial.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso en productos comerciales cerrados o como servicio de red requiere revisión legal y, en la práctica, liberar el código derivado bajo la misma licencia.
- Sesgo de dominio: el modelo está entrenado sobre estructuras del PDB, con sobrerrepresentación de proteínas eucariotas bien estudiadas; proteínas de membrana, regiones intrínsecamente desordenadas y proteínas de organismos poco representados pueden recibir confidencias poco fiables.
- Riesgo de alucinación estructural: con pLDDT bajo, el modelo puede generar coordenadas plausibles pero incorrectas; es imprescindible filtrar por pLDDT y PAE antes de usar las estructuras en decisiones experimentales.
- Átomos no predichos: ligandos, hidrógenos y OXT terminal quedan sin coordenadas; no es un sustituto de AlphaFold 3 para complejos con ligandos o ácidos nucleicos.
- Dependencia de MSA de calidad: la precisión cae drásticamente sin un MSA profundo; el pipeline requiere preparación externa de alineamientos con herramientas como HHblits o Jackhmmer.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje; cualquier uso conversacional o de generación de texto queda fuera de su alcance.
- Datos de benchmarks ausentes: no hay métricas publicadas en esta model card que permitan validar el rendimiento de esta implementación concreta frente a la oficial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/alphafold2-model-3
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante monómero con pTM/PAE: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial de DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
