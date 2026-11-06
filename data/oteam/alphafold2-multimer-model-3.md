# oteam/alphafold2-multimer-model-3

## Resumen

AlphaFold 2 Multimer (modelo 3) es una implementación no oficial del sistema de predicción de estructura de proteínas AlphaFold 2 desarrollada por DeepMind, publicada en Hugging Face por el equipo OFoldX bajo el identificador `oteam/alphafold2-multimer-model-3`. El modelo predice la estructura tridimensional de complejos proteicos multi-cadena a partir de secuencias de aminoácidos, alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales. Se trata de la variante multímero, que extiende la arquitectura original con MSAs emparejados y características relativas entre cadenas para modelar interacciones proteína-proteína.

La arquitectura combina un tronco Evoformer de 48 bloques que actualiza conjuntamente las representaciones de MSA y de pares de residuos, seguido de un módulo estructural de atención sobre puntos invariantes que predice marcos de esqueleto, ángulos de cadena lateral, coordenadas atómicas y valores de confianza. El modelo cuenta con 93.278.041 parámetros (93,278 M) y emplea 21 pasos de reciclado, un valor notablemente superior a los 4 pasos de las variantes monómero, lo que refleja la mayor complejidad del plegamiento de complejos.

Este checkpoint concreto forma parte de una familia de variantes publicadas por OFoldX (monómero, monómero con pTM, multímero, CASP14 e initial-guess) y está pensado para su uso con la librería `ofoldx`, que gestiona la preparación de entradas y la ejecución del pipeline de plegamiento. Su relevancia radica en ofrecer una implementación abierta y reempaquetada en formato safetensors de un modelo de referencia en biología estructural computacional, aunque con la advertencia explícita de que no es la versión oficial de DeepMind.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Evoformer (48 bloques) + módulo estructural de atención sobre puntos invariantes (8 bloques) + 4 bloques extra-MSA |
| Parámetros totales | 93.278.041 (93,278 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (MSA de 256 secuencias, representación de pares de 128, representación single de 384; no es contexto de tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura AlphaFold 2: un tronco Evoformer de 48 bloques que procesa simultáneamente la representación del alineamiento múltiple de secuencias (MSA, tamaño 256) y la representación de pares de residuos (tamaño 128), con 4 bloques adicionales de MSA extra. Sobre este tronco se aplica un módulo estructural de 8 bloques basado en atención sobre puntos invariantes (invariant point attention), que produce marcos de esqueleto, ángulos de cadena lateral, coordenadas atómicas y estimaciones de confianza (pLDDT). La variante multímero incorpora MSAs emparejados entre cadenas y características relativas de cadena, y ejecuta 21 pasos de reciclado frente a los 4 de las variantes monómero.

La model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). Se trata de una implementación no oficial: el equipo de DeepMind que publicó AlphaFold 2 no escribió esta model card, que ha sido redactada por el equipo OFoldX. El modelo se distribuye a través de la librería `ofoldx` y depende de dicha librería para su ejecución.

## Capacidades

- Predicción de estructura tridimensional de complejos proteicos multi-cadena a partir de secuencias de aminoácidos.
- Procesamiento de alineamientos múltiples de secuencias (MSA) y plantillas estructurales opcionales como entradas.
- Predicción de marcos de esqueleto, ángulos de cadena lateral y coordenadas atómicas.
- Generación de valores de confianza: pLDDT para calidad local por residuo.
- Soporte de ensembles de cinco modelos (variante CASP14) para ranking de predicciones y relajación opcional con Amber.
- Evaluación con initial-guess usando coordenadas existentes de un complejo objetivo-binder.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingües: es un modelo específico de biología estructural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de estructuras de complejos proteína-proteína: el modelo recibe las secuencias de las cadenas y un MSA emparejado, y devuelve coordenadas atómicas con valores de pLDDT para evaluar la fiabilidad de la interfaz. Es adecuado por su entrenamiento específico en complejos multi-cadena y sus 21 pasos de reciclado.
- Análisis de interacciones en dianas terapéuticas: dado un complejo antígeno-anticuerpo o ligando-receptor, el modelo permite generar un modelo estructural inicial para estudios de docking o diseño de fármacos, siempre que se disponga del MSA correspondiente.
- Predicción de estructura para anotación funcional: a partir de una secuencia de proteína sin estructura experimental, el pipeline `ofoldx` genera un modelo 3D que puede compararse con estructuras conocidas para inferir función.
- Ranking de modelos en ensembles CASP14: la variante `oteam/alphafold2-casp14` permite ejecutar cinco checkpoints con ocho ensembles de entrada por checkpoint y seleccionar la mejor predicción según la puntuación media de pLDDT, útil en flujos de validación estructural.
- Evaluación de complejos objetivo-binder con initial-guess: el modelo `oteam/alphafold2-initial-guess` permite evaluar un complejo asignado a secuencia utilizando sus coordenadas existentes como punto de partida, útil en pipelines de diseño de binders.
- Relajación estructural con Amber: tras la predicción, el pipeline permite aplicar relajación con OpenMM y PDBFixer sobre la mejor estructura, lo que mejora la calidad geométrica para su uso en simulaciones de dinámica molecular.
- Generación de modelos para cribado virtual: las estructuras predichas con alta confianza pueden emplearse como receptores en cribado de compuestos, aunque deben validarse experimentalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,4 GB, lo que sugiere que el checkpoint en safetensors ocupa un espacio reducido, pero los requisitos de memoria en ejecución dependen del tamaño del MSA y del complejo.
- GPU recomendadas: no disponible; el modelo se ejecuta a través de la librería `ofoldx`, que no especifica requisitos de GPU en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la única vía documentada es la librería `ofoldx` (`pip install ofoldx`), con pipeline `ofoldx.pipeline("fold", model="oteam/alphafold2")`. La relajación con Amber requiere OpenMM y PDBFixer instalados en el mismo entorno (por ejemplo, vía conda-forge). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / MSA | Pasos de reciclado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/alphafold2-multimer-model-3 | 93,278 M | MSA 256, pares 128, single 384 | 21 | AGPL-3.0 | Hugging Face (oteam) |
| oteam/alphafold2 (monómero) | 93,283 M | MSA 256, pares 128, single 384 | 4 | AGPL-3.0 | Hugging Face (oteam) |
| oteam/alphafold2-ptm (monómero con pTM) | 93,292 M | MSA 256, pares 128, single 384 | 4 | AGPL-3.0 | Hugging Face (oteam) |
| oteam/alphafold2-casp14 | no disponible | MSA 256, pares 128, single 384 | no disponible | AGPL-3.0 | Hugging Face (oteam) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. La comparación se limita a parámetros, configuración de MSA y pasos de reciclado.

## Limitaciones y advertencias

- Implementación no oficial: el equipo de DeepMind que publicó AlphaFold 2 no escribió esta model card ni validó esta implementación; debe contrastarse con la versión oficial en `google-deepmind/alphafold`.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que utilice el modelo en red; es necesario revisar su compatibilidad con el uso comercial previsto.
- Riesgo de alucinación estructural: como todo predictor, puede generar coordenadas plausibles pero incorrectas; los valores de pLDDT deben interpretarse con cautela y validarse experimentalmente.
- Limitaciones de entrada: requiere MSA y, opcionalmente, plantillas; la calidad de la predicción depende en gran medida de la profundidad y calidad del MSA.
- Coordenadas no predichas: los átomos no predichos, incluidos ligandos, hidrógenos y OXT terminal, tienen coordenadas no disponibles.
- Cada predicción utiliza un nuevo marco de coordenadas, lo que requiere alineamiento para comparaciones estructurales.
- La relajación con Amber requiere OpenMM y PDBFixer y un grafo proteico lineal cerrado estándar; no es aplicable a todas las estructuras.
- No dispone de datos publicados sobre sesgos, rendimiento en benchmarks ni latencia en la información disponible.
- El modelo no es multilingüe ni de propósito general: no debe emplearse para tareas de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/oteam/alphafold2-multimer-model-3
- Variante monómero: https://huggingface.co/oteam/alphafold2
- Variante monómero con pTM: https://huggingface.co/oteam/alphafold2-ptm
- Variante multímero: https://huggingface.co/oteam/alphafold2-multimer
- Variante CASP14: https://huggingface.co/oteam/alphafold2-casp14
- Variante initial-guess: https://huggingface.co/oteam/alphafold2-initial-guess
- Código: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/alphafold2
- Paper AlphaFold 2: https://doi.org/10.1038/s41586-021-03819-2
- Paper AlphaFold-Multimer: https://doi.org/10.1101/2021.10.04.463034
- Repositorio oficial: https://github.com/google-deepmind/alphafold
- Librería ofoldx: https://ofoldx.valtech.ai/
- OpenMM: https://docs.openmm.org/latest/userguide/application/01_getting_started.html
- PDBFixer: https://github.com/openmm/pdbfixer
