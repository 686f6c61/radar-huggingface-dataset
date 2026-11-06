# oteam/alphafold2-multimer-model-4

## Resumen

AlphaFold 2 Multimer (model-4) es una implementación no oficial del modelo AlphaFold-Multimer desarrollada por el equipo OFoldX, publicada en Hugging Face bajo el identificador `oteam/alphafold2-multimer-model-4`. El modelo predice la estructura tridimensional de complejos proteicos multi-cadena a partir de secuencias de aminoácidos, alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales. Está pensado para investigadores en biología estructural y diseño de proteínas que necesitan determinar la conformación de complejos proteína-proteína sin recurrir a métodos experimentales costosos como la cristalografía de rayos X o la criomicroscopía electrónica.

La arquitectura sigue el diseño original de AlphaFold 2: un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de atención sobre puntos invariantes (invariant point attention) con 8 bloques. La variante Multimer incorpora MSAs emparejados y características relativas entre cadenas para modelar complejos. El modelo cuenta con 93.278.041 parámetros (unos 93,28 M) y utiliza 21 pasos de reciclado, frente a los 4 de las variantes monómero.

Es relevante ahora porque el ecosistema de herramientas open source para plegamiento proteico está creciendo y este modelo ofrece una implementación reproducible y empaquetada en la librería `ofoldx`, lo que facilita su integración en pipelines de investigación. No obstante, se trata de una implementación no oficial, con licencia AGPL-3.0, sin descargas ni valoraciones en el momento de la consulta, y sin datos de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + módulo estructural de invariant point attention (8 bloques); predictor de estructura condicionado por MSA y plantillas |
| Parametros totales | 93.278.041 (93,278 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (MSA de 256 secuencias, representación de pares de 128, representación single de 384; no es un contexto de tokens de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer especializado en plegamiento proteico. El tronco Evoformer consta de 48 bloques que actualizan de forma conjunta la representación de alineamiento múltiple de secuencias (MSA, tamaño 256) y la representación de pares de residuos (pair, tamaño 128), con una representación single de tamaño 384. Tras el tronco, el módulo estructural de 8 bloques con invariant point attention predice marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y valores de confianza. La variante Multimer añade MSAs emparejados y características relativas entre cadenas para modelar complejos proteicos. El modelo realiza 21 pasos de reciclado, lo que incrementa el coste computacional respecto a las variantes monómero (4 pasos).

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card remite a la sección de Training Details, pero su contenido no se ha incluido en los datos facilitados. Se trata de una implementación no oficial del trabajo original de Jumper et al. (2021) y del artículo de AlphaFold-Multimer (2021), por lo que el entrenamiento subyacente corresponde al descrito en dichas publicaciones, aunque no se detalla aquí.

## Capacidades

- Predicción de estructura 3D de complejos proteicos multi-cadena a partir de secuencias, MSAs y plantillas estructurales opcionales.
- Predicción de marcos de cadena principal (backbone frames), ángulos de cadena lateral y coordenadas atómicas.
- Generación de valores de confianza: pLDDT para calidad local por residuo; en variantes con pTM, también PAE y pTM.
- Modelado de interacciones entre cadenas mediante MSAs emparejados y características relativas entre cadenas.
- Soporte de reciclado múltiple (21 pasos) para refinar la predicción.
- Evaluación con ensemble de cinco modelos (variante CASP14) para ranking de predicciones y relajación opcional con Amber/OpenMM.
- Evaluación con conjetura inicial (initial-guess) usando coordenadas existentes de un complejo objetivo-binder.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Predicción de complejos proteína-proteína en investigación básica: el modelo permite obtener una estructura aproximada de un complejo multi-cadena a partir de las secuencias y MSAs, lo que ayuda a formular hipótesis sobre interfaces de interacción antes de validar experimentalmente.
- Diseño de fármacos y biologics: la predicción de la conformación de un complejo antígeno-anticuerpo o ligando-receptor facilita el análisis de epítopos y la selección de candidatos, aunque el modelo no predice ligandos pequeños (los átomos no predichos, incluidos ligandos, quedan sin coordenadas).
- Ingeniería de proteínas y estabilidad: al predecir la estructura de variantes mutantes de un complejo, se puede evaluar el impacto estructural de mutaciones en la interfaz entre cadenas.
- Análisis de interacciones en vías de señalización: modelar complejos de varias subunidades permite estudiar cómo se ensamblan receptores, quinasas o factores de transcripción en ausencia de estructuras experimentales.
- Validación de modelos experimentales: comparar estructuras predichas con datos de cristalografía o criomicroscopía para detectar discrepancias o confirmar conformaciones alternativas.
- Docencia y formación en biología estructural: generar estructuras de complejos para ilustrar conceptos de plegamiento e interacción proteica en entornos educativos.
- Integración en pipelines de diseño computacional: la variante initial-guess permite evaluar complejos objetivo-binder usando coordenadas existentes, útil en flujos de diseño de proteínas de novo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 0,4 GB, lo que sugiere que los pesos en safetensors ocupan ese espacio, pero el consumo en memoria durante la inferencia (MSAs, representaciones de pares y reciclado) es sustancialmente mayor y no se detalla.
- GPU recomendadas: no disponible. Dado el tamaño del modelo (93,28 M de parámetros) y los 21 pasos de reciclado, se requiere una GPU con memoria suficiente para las representaciones intermedias; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No disponible. El tamaño de pesos (0,4 GB) es reducido, pero las representaciones de MSA y pares, junto con el reciclado, pueden exceder la VRAM de GPUs de consumo; no hay datos confirmados.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es el método indicado. Para relajación con Amber se requiere OpenMM y PDBFixer (conda-forge). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / MSA | Pasos de reciclado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-multimer-model-4 | 93,278 M | MSA 256, pair 128, single 384 | 21 | AGPL-3.0 | Hugging Face (0 descargas) |
| oteam/alphafold2 | 93,283 M | MSA 256, pair 128, single 384 | 4 | AGPL-3.0 (según tag) | Hugging Face |
| oteam/alphafold2-ptm | 93,292 M | MSA 256, pair 128, single 384 | 4 | AGPL-3.0 (según tag) | Hugging Face |
| oteam/alphafold2-casp14 | No disponible | MSA 256, pair 128, single 384 | No disponible | AGPL-3.0 (según tag) | Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento predictivo con alternativas como AlphaFold 3, RoseTTAFold o ESMFold en la información proporcionada. La comparativa se limita a variantes del mismo equipo y a especificaciones estructurales.

## Limitaciones y advertencias

- Implementación no oficial: el equipo original de AlphaFold 2 (Google DeepMind) no escribió esta model card ni validó esta implementación; la reproducibilidad y fidelidad respecto al modelo original no están garantizadas.
- Licencia AGPL-3.0: impone obligaciones de compartir el código fuente modificado si se distribuye el software; para uso comercial en productos propietarios puede ser restrictiva. Es necesario revisar los términos antes de integrarlo en producción.
- Sin datos de benchmarks: no hay evidencia publicada en la información disponible sobre precisión (pLDDT, TM-score, etc.) en comparación con el modelo original u otras alternativas.
- Sin descargas ni valoraciones: el repositorio no tiene descargas ni likes, lo que limita la validación comunitaria.
- No predice ligandos, hidrógenos ni OXT terminal: los átomos no predichos quedan sin coordenadas, lo que restringe su uso en aplicaciones que requieran modelado de moléculas pequeñas.
- Dependencia de MSAs de calidad: el rendimiento depende de la profundidad y calidad del alineamiento múltiple de secuencias; secuencias con pocos homólogos pueden producir predicciones de baja confianza.
- Idiomas no aplicables: no es un modelo lingüístico; no soporta texto, tool calling ni agentes.
- Riesgo de alucinación estructural: como todo predictor, puede generar conformaciones plausibles pero incorrectas, especialmente en regiones desordenadas o interfaces débiles; se recomienda validar con datos experimentales.
- Requisitos de relajación: la relajación con Amber requiere OpenMM y PDBFixer y un grafo proteico lineal estándar cerrado; no aplica a todos los casos.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/alphafold2-multimer-model-4
- Código: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio original: https://github.com/google-deepmind/alphafold
- Librería ofoldx: https://ofoldx.valtech.ai/
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante monómero pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multimer: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
