# oteam/alphafold2-multimer-model-2

## Resumen

AlphaFold 2 es un modelo de predicción de estructura de proteínas que, a partir de la secuencia de aminoácidos, alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales, predice coordenadas atómicas tridimensionales junto con valores de confianza. Esta ficha corresponde a la variante multímero (`oteam/alphafold2-multimer-model-2`), una implementación no oficial publicada por el equipo OFoldX dentro de su librería `ofoldx`. El modelo original fue desarrollado por DeepMind (Jumper et al., 2021) y supuso un salto cualitativo en biología estructural computacional, resolviendo de facto el problema del plegamiento de proteínas para monómeros y complejos.

La arquitectura combina un tronco Evoformer que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural con *invariant point attention* que produce marcos de cadena principal, ángulos de cadena lateral, coordenadas atómicas y estimaciones de confianza (pLDDT, PAE, pTM). La variante multímero añade MSAs emparejados y características relativas entre cadenas para predecir complejos proteicos de varias cadenas. El checkpoint contiene 93.278.041 parámetros (unos 93,28 M) y se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB.

Es relevante ahora porque las implementaciones reempaquetadas en librerías modernas (como `ofoldx`) permiten ejecutar AlphaFold 2 sin depender del pipeline original de DeepMind, con API Python directa, gestión de ensembles y relajación Amber opcional. No obstante, al ser una implementación no oficial y con licencia AGPL-3.0, su uso en producción requiere revisar las implicaciones de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + 4 bloques extra-MSA + 8 bloques estructurales con invariant point attention; condicionada por MSA y plantillas |
| Parametros totales | 93.278.041 (93,28 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (MSA de 256, pares de 128, singles de 384; 21 pasos de reciclado en la variante multímero) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Libreria | ofoldx |
| Pipeline | other (predicción de estructura proteica) |
| Tamano del repositorio | 0,4 GB |
| Pasos de reciclado | 21 (variante multímero) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura descrita en el paper original de AlphaFold 2 (Jumper et al., *Nature*, 2021). El tronco Evoformer consta de 48 bloques que actualizan de forma conjunta la representación de MSA (tamaño 256) y la representación de pares de residuos (tamaño 128), mediante mecanismos de atención sobre filas y columnas del MSA, triangulación del grafo de pares y actualizaciones por triángulos. A continuación, cuatro bloques extra-MSA refinan la representación de pares y ocho bloques del módulo estructural, basados en *invariant point attention*, predicen marcos de cadena principal, ángulos de torsión de cadena lateral, coordenadas atómicas y valores de confianza.

La variante multímero (`alphafold2-multimer`) incorpora MSAs emparejados entre cadenas y características relativas entre cadenas, lo que permite modelar complejos proteicos hetero- y homoméricos. El número de pasos de reciclado es 21 (frente a 4 en las variantes monómero), lo que incrementa el coste computacional a cambio de mayor precisión en interfaces. La información proporcionada no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset; únicamente se remite a la sección de *Training Details* de la model card original, cuyo contenido no se incluye en los datos disponibles. No se documenta el uso de RLHF/DPO, algo esperable en un modelo biológico de este tipo.

## Capacidades

- Predicción de estructura tridimensional de proteínas a partir de secuencia de aminoácidos, MSA y plantillas estructurales opcionales.
- Predicción de complejos proteicos multicadena mediante MSAs emparejados y características relativas entre cadenas.
- Salida de marcos de cadena principal, ángulos de cadena lateral y coordenadas atómicas.
- Estimaciones de confianza: pLDDT por residuo y, en la variante multímero, PAE y pTM.
- Soporte de ensembles de cinco modelos en la variante CASP14 (cada checkpoint evalúa ocho ensembles de entrada desde una preparación compartida).
- Ranking de predicciones y relajación Amber opcional del mejor modelo (requiere OpenMM y PDBFixer).
- Evaluación con coordenadas iniciales (*initial guess*) para complejos objetivo-binder ya asignados por secuencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM; es un predictor biológico especializado.
- No dispone de capacidades multilingües ni de visión; su dominio es exclusivamente estructural y biológico.

## Casos de uso

- Predicción de estructura de monómeros y complejos en investigación académica: el pipeline `ofoldx.pipeline("fold", model="oteam/alphafold2-multimer")` permite obtener estructuras con confianza asociada a partir de un fichero CIF de entrada, adecuado para estudios de plegamiento y anotación funcional.
- Caracterización de interfaces proteína-proteína: la variante multímero, con 21 pasos de reciclado y MSAs emparejados, es la opción indicada para modelar dímeros, trímeros y complejos heteroméricos donde la interfaz es crítica.
- Ranking de candidatos en diseño de proteínas: el ensemble CASP14 con cinco modelos y ocho ensembles por checkpoint permite comparar predicciones y seleccionar la de mayor pLDDT medio, útil en pipelines de diseño computacional.
- Refinamiento estructural con relajación Amber: tras la predicción, `models_to_relax="best"` aplica minimización con OpenMM/PDBFixer para reducir choques estereoquímicos antes de análisis posteriores.
- Evaluación de complejos objetivo-binder con coordenadas iniciales: la variante *initial-guess* permite evaluar un complejo ya asignado por secuencia usando sus coordenadas existentes como punto de partida, relevante en validación de diseños de binders.
- Anotación de genomas y proteomas: procesamiento por lotes de secuencias para generar estructuras de referencia que alimenten bases de datos internas o análisis de variantes.
- Docencia y formación en biología estructural: la API Python directa de `ofoldx` facilita demostraciones reproducibles de predicción estructural sin depender del pipeline original de DeepMind.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (GDT_TS, lDDT, pLDDT medio, RMSD) ni comparaciones cuantitativas con otras implementaciones. Los datos de CASP14 asociados al paper original no se trasladan a esta ficha porque no se aportan cifras concretas para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del checkpoint es de 0,4 GB en safetensors, pero el consumo en ejecución depende del tamaño del MSA, del número de residuos y de los pasos de reciclado, no solo del peso del modelo.
- GPU recomendadas: no disponible. La model card no especifica requisitos de GPU ni memoria mínima.
- Compatibilidad con GPU de consumo: no disponible. No se confirma si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: la vía documentada es la librería `ofoldx` (`pip install ofoldx`), con pipeline `ofoldx.pipeline("fold", ...)`. La relajación Amber requiere OpenMM y PDBFixer instalados en el mismo entorno (por ejemplo, vía conda-forge). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se aportan cifras de tiempo por predicción ni de rendimiento en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / configuracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| oteam/alphafold2-multimer-model-2 (esta ficha) | 93,28 M | 48 bloques Evoformer, 21 pasos de reciclado, MSA 256 / pares 128 | AGPL-3.0 | Hugging Face, libreria `ofoldx` |
| oteam/alphafold2 | 93,283 M | 48 bloques, 4 pasos de reciclado, monómero con pLDDT | AGPL-3.0 | Hugging Face, libreria `ofoldx` |
| oteam/alphafold2-ptm | 93,292 M | 48 bloques, 4 pasos de reciclado, monómero con PAE y pTM | AGPL-3.0 | Hugging Face, libreria `ofoldx` |
| oteam/alphafold2-casp14 | no disponible | Protocolo CASP14 de cinco modelos, ocho ensembles por checkpoint | AGPL-3.0 | Hugging Face, libreria `ofoldx` |

Las variantes monómero y multímero comparten el mismo tamaño de tronco (93,28 M) y difieren en el número de pasos de reciclado (4 frente a 21) y en las características de emparejamiento entre cadenas. La variante CASP14 no publica el recuento de parámetros en la información disponible. No se dispone de modelos comparables de otros autores (por ejemplo, AlphaFold 3 u otras implementaciones) en los datos proporcionados.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que se trata de una implementación no oficial de AlphaFold 2 y que el equipo original de DeepMind no redactó esta tarjeta. La reproducibilidad frente al pipeline oficial no está garantizada.
- Licencia AGPL-3.0: el uso comercial y la distribución requieren cumplir las obligaciones de copyleft de la AGPL, incluida la publicación del código fuente en determinados escenarios de uso en red. Revisar antes de integrar en productos.
- Coordenadas no predichas: los átomos no predichos, incluidos ligandos, hidrógenos y el OXT terminal, no tienen coordenadas disponibles en la salida.
- Marco de coordenadas: cada predicción utiliza un nuevo marco de coordenadas, por lo que no es directamente comparable con estructuras experimentales sin alineamiento.
- Relajación Amber: requiere OpenMM y PDBFixer y solo funciona con un grafo proteico lineal estándar cerrado; las coordenadas relajadas sustituyen los metadatos experimentales, conservando la identidad de origen y los hechos químicos independientes.
- Idiomas: no aplica; el modelo no procesa lenguaje natural y la ficha no documenta capacidades lingüísticas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de error; en este dominio, el equivalente de la alucinación es una predicción de baja confianza (pLDDT bajo) que debe filtrarse antes de su uso.
- Contexto y tamaño: la ventana efectiva está acotada por el tamaño del MSA (256), pares (128) y singles (384), así como por el coste de los 21 pasos de reciclado; proteínas muy largas o complejos de gran tamaño pueden exceder los recursos disponibles.
- Datos de entrenamiento: no se detalla el volumen de tokens ni la composición del dataset en la información disponible, lo que limita la evaluación de posibles sesgos de cobertura estructural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/alphafold2-multimer-model-2
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante monómero con pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multímero: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código de la implementación: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Librería ofoldx: https://ofoldx.valtech.ai/
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial de DeepMind: https://github.com/google-deepmind/alphafold
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
