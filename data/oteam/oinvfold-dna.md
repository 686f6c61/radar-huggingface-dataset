# oteam/oinvfold-dna

## Resumen

OInvFold es una familia de modelos de diseño inverso (*inverse folding*) para biomoléculas desarrollada por el equipo de ODesign (Odin Zhang et al.) y publicada junto al artículo *ODesign: A World Model for Biomolecular Interaction Design* (arXiv:2510.22304). La variante `oinvfold-dna` que nos ocupa predice la identidad de secuencia de ADN a partir de coordenadas tridimensionales fijas de la cadena principal (*backbone*). El repositorio de HuggingFace es una implementación **no oficial** mantenida por el equipo de OFoldX, no por los autores originales del modelo.

El modelo es una red de grafos geométrica de pequeño tamaño (8,39 millones de parámetros, 12 bloques de encoder, dimensión oculta 128, 4 cabezas de atención y 32 átomos virtuales) que realiza paso de mensajes sobre la estructura 3D. Pertenece a un conjunto de cuatro variantes: proteína, ADN, ARN y ligando, cada una con su propia convención de clases de salida (25 clases en el caso de polímeros, 37 en ligando).

Su relevancia es doble: por un lado, permite el diseño computacional de secuencias de ácido nucleico compatibles con una geometría dada, una tarea central en biología sintética y diseño de ácidos nucleicos terapéuticos; por otro, forma parte de un marco más amplio (ODesign) orientado al diseño de interacciones biomoleculares. La licencia AGPL-3.0 y la advertencia explícita sobre discrepancias entre la preparación de estructuras de OFoldX y la original condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de grafos geométrica con paso de mensajes, 12 bloques de encoder, dimensión oculta 128, 4 cabezas de atención, 32 átomos virtuales |
| Parametros totales | 8.390.209 (8,39 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo estructural, no textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OInvFold emplea un modelo de grafos geométrico con paso de mensajes (*geometric message passing*) sobre las coordenadas atómicas de la estructura de entrada. El encoder consta de 12 bloques con dimensión oculta de 128 y 4 cabezas de atención, apoyados en 32 átomos virtuales que actúan como nodos globales. Durante el entrenamiento se aplica corrupción de grafo en cada bloque del encoder, una técnica de regularización estructural que obliga al modelo a reconstruir información local a partir de contexto geométrico parcial. La decodificación del polímero produce secuencias moleculares; en el caso de ADN, predice la identidad de cada nucleótido sobre las 25 clases de salida liberadas.

Los detalles de datos de entrenamiento, número de tokens o estructuras, composición del dataset y procesos de ajuste fino (RLHF/DPO u otros) no están documentados en la model card: remiten al artículo de ODesign. Es importante señalar que esta implementación de OFoldX utiliza nodos globales virtuales basados en centroides con rotaciones y traslaciones relativas reales, mientras que la preparación de polímeros original suministraba características globales constantes (identidad/cero). Esta discrepancia altera las predicciones del checkpoint y exige una evaluación independiente de la calidad de inferencia antes de cualquier uso serio.

## Capacidades

- Predicción de identidad de secuencia de ADN a partir de coordenadas 3D fijas de la cadena principal.
- Decodificación greedy (un candidato) y decodificación por haz (*beam search*, varios candidatos ordenados por log-probabilidad total y media).
- Modelado geométrico de estructuras de ácido nucleico mediante paso de mensajes sobre grafos.
- Integración en el ecosistema OFoldX mediante pipelines (`ofoldx.pipeline("design", model="oteam/oinvfold-dna")`).
- Exposición de operaciones diferenciables `encode` y `forward` y de la función de pérdida `OInvFoldLoss` (NLL enmascarada para polímeros).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No procesa visión, audio ni texto; su entrada es exclusivamente estructural (archivos CIF/PDB).

## Casos de uso

- Diseño de secuencias de ADN para una geometría backbone dada: dado un esqueleto 3D de ADN de interés (por ejemplo, un motivo estructural de un aptámero), el modelo genera secuencias candidatas compatibles con esa geometría mediante beam search, útil en biología sintética y nanotecnología de ADN.
- Rediseño de motivos de unión a proteínas en complejos ADN-proteína: fijando la estructura del complejo, se pueden proponer variantes de secuencia de ADN que preserven la interfaz, para estudios de afinidad o ingeniería de sitios de unión.
- Generación de candidatos para cribado in silico: el beam search devuelve candidatos ordenados por log-probabilidad, lo que permite priorizar secuencias antes de síntesis y validación experimental, reduciendo costes de laboratorio.
- Diseño de estructuras de ADN para cristalografía o criomicroscopía: se puede usar el modelo para proponer secuencias que estabilicen una conformación observada o modelada.
- Integración en pipelines de diseño computacional con OFoldX: el modelo se puede encadenar con etapas de `prepare`, `forward` y `postprocess` dentro de flujos más amplios de diseño molecular, incluyendo combinaciones con las variantes de proteína, ARN y ligando.
- Investigación en métodos de inverse folding: al ser una implementación abierta con operaciones diferenciables y pérdida expuesta, sirve como base para experimentos de entrenamiento, ablación o comparación de estrategias de decodificación.
- Análisis de compatibilidad secuencia-estructura en datasets de ADN: puntuar con log-probabilidades la coherencia de secuencias conocidas respecto a sus estructuras, como filtro de calidad en curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación de secuencia, perplexidad ni comparaciones cuantitativas, y advierte explícitamente que la calidad de inferencia con esta implementación requiere una evaluación separada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 8,39 M de parámetros; en la práctica, el cuello de botella es la memoria para el grafo estructural de entrada, no los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problemas. También es viable en CPU para estructuras de tamaño moderado.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oinvfold-dna (este) | 8,39 M | Grafo geométrico, inverse folding de ADN | no aplica | AGPL-3.0 | HuggingFace (implementación no oficial) |
| oinvfold-protein | 8,374 M | Grafo geométrico, inverse folding de proteína | no aplica | AGPL-3.0 | HuggingFace |
| oinvfold-rna | no disponible | Grafo geométrico, inverse folding de ARN | no aplica | AGPL-3.0 | HuggingFace |
| oinvfold-ligand | 6,429 M | Grafo geométrico, asignación de elementos de ligando | no aplica | AGPL-3.0 | HuggingFace |

No se dispone de datos de benchmarks ni de comparaciones con otros métodos de inverse folding de ADN (por ejemplo, enfoques basados en difusión o en modelos de lenguaje específicos de ácidos nucleicos) en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: el equipo de OFoldX, no los autores de ODesign, ha escrito la model card y mantenido el repositorio; no hay garantía de equivalencia con el modelo original.
- Discrepancia estructural crítica: OFoldX usa nodos globales virtuales basados en centroides con rotaciones y traslaciones reales, mientras que la preparación original suministraba características globales constantes; esto cambia las predicciones y la calidad de inferencia debe evaluarse por separado.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red puede requerir liberar el código fuente derivado. Revisar con asesoría legal antes de producción.
- Sin datos de entrenamiento documentados: la composición del dataset, el número de estructuras y los procedimientos de curación no se detallan en la model card.
- Sin benchmarks publicados: no hay métricas de recuperación de secuencia ni comparaciones que permitan estimar el rendimiento real.
- Ámbito restringido a ADN: no procesa texto, código, visión ni audio; no soporta tool calling ni agentes.
- Riesgo de sobreajuste a la convención de preparación de estructuras: entradas generadas con otras herramientas pueden producir resultados degradados.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, los sesgos típicos no aplican, pero sí puede heredar sesgos de la distribución de estructuras de entrenamiento (sobrerrepresentación de ciertos motivos o conformaciones).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido y poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/oinvfold-dna
- Variante de proteína: https://huggingface.co/oteam/oinvfold-protein
- Variante de ARN: https://huggingface.co/oteam/oinvfold-rna
- Variante de ligando: https://huggingface.co/oteam/oinvfold-ligand
- Artículo (arXiv): https://arxiv.org/abs/2510.22304
- Repositorio oficial de ODesign: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Código de OFoldX para oinvfold: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/oinvfold
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Sitio de la librería ofoldx: https://ofoldx.valtech.ai/
