# oteam/nampnn-specificity

## Resumen

NA-MPNN (specificity) es un checkpoint de un modelo de red neuronal de paso de mensajes (MPNN) para la predicción de especificidad proteína-ADN a partir de estructuras moleculares. Lo desarrolla el grupo de David Baker (Baker Laboratory, Universidad de Washington) y esta implementación no oficial corre a cargo del equipo OFoldX, que la distribuye a través de HuggingFace con la librería `ofoldx`. El modelo resuelve el problema de estimar, para un complejo proteína-ADN dado, la probabilidad de cada base nitrogenada en cada posición de la cadena de ADN, lo que permite evaluar y rediseñar la especificidad de unión.

Técnicamente es un MPNN geométrico y autorregresivo con 2,3 millones de parámetros, tamaño de vocabulario 72, dimensión oculta 128, 3 bloques de encoder y 3 de decoder, 32 vecinos por residuo y 16 slots de átomos por residuo. Extiende el inverse folding de backbone fijo a ensamblajes mixtos de proteína, ADN y ARN, restringiendo la generación de identidades al tipo de polímero de cada residuo.

Es relevante porque la predicción de especificidad proteína-ADN es un cuello de botella en diseño de proteínas de unión a secuencias concretas de ADN (factores de transcripción, nucleasas editadas, biosensores) y porque NA-MPNN unifica en un solo marco proteína, ADN y ARN, algo poco habitual en modelos de inverse folding. El checkpoint `specificity` es complementario al de diseño de secuencias (`oteam/nampnn`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MPNN geométrico con encoder/decoder (3+3 bloques), autorregresivo, paso de mensajes sobre grafo de residuos |
| Parámetros totales | 2.303.480 (2,303 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del tamaño del complejo de entrada; 32 vecinos por residuo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Vocabulario | 72 |
| Dimensión oculta | 128 |
| Slots de átomos por residuo | 16 |
| Librería | `ofoldx` |

## Arquitectura y entrenamiento

NA-MPNN representa cada residuo de polímero (aminoácido, nucleótido de ADN o de ARN) como un nodo de un grafo geométrico con 32 vecinos y 16 slots de átomos por residuo. El encoder procesa el backbone molecular y el decoder genera identidades de forma autorregresiva, restringiendo en cada posición las clases posibles al tipo de polímero del residuo (proteína, ADN o ARN). El modelo usa tokens de nucleótido compartidos por defecto: las bases de ARN se predicen con las clases de salida de ADN y se reconstruyen después como residuos de ARN.

El entrenamiento se basa en recuperación de secuencia condicionada por estructura sobre estructuras del PDB que contienen ácidos nucleicos, con ruido de coordenadas y decodificación opcional proteína-primero. El checkpoint de especificidad añade complejos proteína-ADN predichos y perfiles de unión experimentales. La implementación de OFoldX expone `smoothed_loss` para entrenamiento y ajuste fino. No se han publicado en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO (no aplica en este dominio).

## Capacidades

- Predicción de especificidad proteína-ADN: estima una distribución de probabilidad sobre las cuatro bases (A, C, G, T) en cada posición seleccionada de la cadena de ADN de un complejo.
- Puntuación de secuencias sobre backbones de polímeros mixtos (NLL por residuo, con múltiples órdenes de decodificación).
- Diseño conjunto de secuencias de proteína, ADN y ARN desde backbone fijo (variante `oteam/nampnn`; este checkpoint se centra en especificidad).
- Soporte de complejos mixtos proteína-ADN-ARN en una sola representación.
- Muestreo estocástico controlable (`num_samples`, `seed`) para obtener perfiles de probabilidad robustos.
- Exclusión de tokens concretos mediante `global_omit_tokens` (por ejemplo, excluir T/U en modo de tokens de nucleótido compartidos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno: es un modelo biológico de una sola pasada.

## Casos de uso

- Diseño de factores de transcripción sintéticos: dado un backbone de complejo proteína-ADN, el modelo estima la probabilidad de cada base en la posición de reconocimiento y permite seleccionar variantes con especificidad alta hacia una secuencia diana concreta.
- Evaluación de off-target en editores de bases o nucleasas programables: se puntúa la probabilidad de bases no deseadas en posiciones del ADN para descartar diseños con ambigüedad de unión.
- Rediseño de interfaces proteína-ADN en enzimas de restricción o recombinasas: el perfil de especificidad guía mutaciones que mantienen la preferencia por la secuencia nativa.
- Priorización en pipelines de protein design: se usa como filtro de especificidad después de generar candidatos con `oteam/nampnn`, reduciendo el número de constructos a validar experimentalmente.
- Análisis de variantes en complejos cristalográficos: se calcula el perfil de probabilidad sobre estructuras del PDB para detectar posiciones con baja restricción de base, candidatas a mutagenizar.
- Biosensores de ADN: se evalúa la selectividad de dominios de unión a ADN frente a secuencias relacionadas antes de la caracterización en laboratorio.
- Docencia e investigación metodológica: al ser un modelo pequeño (2,3 M de parámetros) y de código abierto, sirve para reproducir y extender el marco NA-MPNN en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 2,3 M de parámetros; el cuello de botella es la memoria del grafo de entrada (32 vecinos por residuo, 16 slots de átomos), que escala con el tamaño del complejo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para complejos pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante).
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) con pipelines `design` y `score`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño del complejo y de `num_samples`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NA-MPNN specificity (este) | 2,3 M | Complejo proteína-ADN (32 vecinos/residuo) | Especificidad proteína-ADN | AGPL-3.0 | HuggingFace (oteam), implementación no oficial |
| NA-MPNN (oteam/nampnn) | 2,3 M | Complejos proteína/ADN/ARN | Diseño conjunto de secuencias | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN | ~1,7 M | Backbone proteico | Inverse folding de proteína | MIT (repo original) | GitHub (baker-laboratory) |
| LigandMPNN | no disponible en la información | Backbone proteico con ligandos | Inverse folding con ligandos | MIT (repo original) | GitHub (baker-laboratory) |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- Implementación no oficial: el equipo de NA-MPNN no escribió esta model card ni validó necesariamente el checkpoint; para resultados de referencia debe consultarse el repositorio oficial `baker-laboratory/NA-MPNN`.
- Licencia AGPL-3.0: el uso en productos o servicios en red puede obligar a liberar el código derivado; revisar compatibilidad antes de uso comercial.
- Dependencia estricta de la librería `ofoldx`; no hay pesos en formatos estándar (GGUF, ONNX) ni integración con ecosistemas de inferencia convencionales.
- El modelo asume backbone fijo: no pliega ni predice estructura, solo puntúa y diseña secuencias sobre una geometría dada.
- En modo de tokens de nucleótido compartidos, los nombres `RNA_` se rechazan en `global_omit_tokens`; hay que usar nombres de clase de ADN, lo que puede inducir errores en pipelines automatizados.
- Riesgo de sobreajuste a la distribución del PDB y de los complejos predichos usados en el entrenamiento del checkpoint de especificidad; el rendimiento en complejos muy alejados de esa distribución no está caracterizado en la información disponible.
- Sin datos publicados de calibración de las probabilidades de base ni de benchmarks en esta ficha; no deben interpretarse como probabilidades calibradas sin validación externa.
- Sesgos biológicos: la composición del PDB favorece ciertos motivos y familias proteicas, lo que puede infrarepresentar secuencias de ADN poco frecuentes en estructuras resueltas.
- No apto para uso clínico o diagnóstico sin validación experimental independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/nampnn-specificity
- Variante de diseño de secuencias: https://huggingface.co/oteam/nampnn
- Paper (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.10.03.679414v2
- Repositorio oficial: https://github.com/baker-laboratory/NA-MPNN
- Splits de entrenamiento y evaluación: https://github.com/baker-laboratory/NA-MPNN/tree/main/splits
- Código de la implementación en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/nampnn
- Librería OFoldX: https://ofoldx.valtech.ai/
- PDB: https://www.rcsb.org/
