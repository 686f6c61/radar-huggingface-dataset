# microsoft/Graphormer

## Resumen

Graphormer es un paquete de aprendizaje profundo desarrollado por Microsoft Research para el modelado de moléculas mediante arquitecturas basadas en transformers sobre grafos. A diferencia de los modelos de lenguaje, Graphormer no procesa texto: su entrada son grafos moleculares (átomos como nodos y enlaces como aristas) y su salida son propiedades fisicoquímicas o distribuciones de probabilidad sobre conformaciones. El repositorio aloja varios conjuntos de checkpoints entrenados para tareas específicas de química computacional.

El paquete se distribuye bajo licencia MIT e incluye checkpoints para la predicción de distribuciones de equilibrio de sistemas moleculares (publicado en *Nature Machine Intelligence*) y para la predicción de potencial redox en electrolitos de baterías de flujo orgánico. Las versiones preentrenadas avanzadas solo están disponibles a través de Azure Quantum Elements, lo que limita el acceso público a los modelos de mayor capacidad.

Es relevante para investigadores en descubrimiento de fármacos, ciencia de materiales y diseño molecular asistido por IA que necesiten un marco reproducible y con licencia permisiva para entrenar modelos propios sobre grafos moleculares. El tamaño del repositorio (4,5 GB) refleja la presencia de múltiples checkpoints, no un único modelo de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre grafos (Graphormer), con codificaciones de centralidad y distancia |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (la entrada es un grafo molecular, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo molecular, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoints en el repositorio; formato concreto no especificado en la información proporcionada) |

## Arquitectura y entrenamiento

Graphormer aplica un transformer estándar sobre grafos introduciendo sesgos estructurales en el mecanismo de atención: codificaciones de centralidad de nodo, codificaciones de distancia entre pares de nodos y codificaciones de camino más corto. Esto permite que el modelo capture topologías moleculares sin necesidad de message passing explícito, a diferencia de las GNN clásicas. La información proporcionada no detalla el número de capas, dimensiones ocultas ni el volumen de tokens o grafos de entrenamiento.

El repositorio incluye checkpoints entrenados para dos tareas concretas: predicción de distribuciones de equilibrio de sistemas moleculares (modelo Distributional-Graphormer) y predicción de potencial redox para el diseño de negolitos en baterías de flujo redox orgánico (directorio `orfb-design`), este último vinculado al artículo *Closed-Loop Molecular Design with Calibrated Deference*. No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO u otras fases de alineación, lo cual es esperable dado que no es un modelo generativo de lenguaje.

## Capacidades

- Predicción de propiedades moleculares a partir de grafos: el modelo recibe una representación de átomos y enlaces y devuelve una propiedad objetivo (por ejemplo, potencial redox).
- Modelado de distribuciones de equilibrio conformacional: el checkpoint Distributional-Graphormer estima distribuciones de probabilidad sobre estados moleculares, no solo valores puntuales.
- Entrenamiento de modelos personalizados: el paquete permite a investigadores entrenar sus propios modelos Graphormer sobre datasets moleculares propios.
- Integración en pipelines de diseño molecular cerrado: los checkpoints de `orfb-design` se emplean en bucles de diseño con calibración de deferencia (según el paper asociado).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Descubrimiento de fármacos: entrenamiento de un Graphormer sobre datos de actividad biológica para predecir afinidad de unión de candidatos, aprovechando la codificación de distancias topológicas para capturar farmacóforos.
- Diseño de electrolitos para baterías: uso de los checkpoints de `orfb-design` para predecir el potencial redox de moléculas candidatas y filtrar negolitos antes de síntesis experimental, reduciendo coste de cribado.
- Ciencia de materiales: modelado de propiedades de moléculas orgánicas e inorgánicas en pipelines de descubrimiento de materiales, con la ventaja de una licencia MIT que permite uso comercial.
- Simulación conformacional acelerada: empleo de Distributional-Graphormer para estimar distribuciones de equilibrio de sistemas moleculares y sustituir parte de la simulación de dinámica molecular en fases de exploración.
- Investigación académica reproducible: el paquete permite replicar los experimentos de los papers asociados y servir de baseline en publicaciones de ML aplicado a química.
- Integración en bucles de diseño cerrado: combinación con modelos de generación molecular y oráculos experimentales para optimización iterativa de candidatos, tal como se describe en el paper de diseño en bucle cerrado.
- Formación de modelos específicos de dominio: equipos farmacéuticos pueden entrenar variantes sobre sus propios datos propietarios sin restricciones de licencia para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño concreto del checkpoint, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. El repositorio ocupa 4,5 GB, lo que sugiere que los checkpoints individuales podrían caber en GPUs de consumo, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el paquete se distribuye como librería de entrenamiento e inferencia propia de Graphormer; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| Graphormer | Microsoft | Transformer sobre grafos | MIT | Grafo molecular | Hugging Face + Azure Quantum Elements (versiones avanzadas) |
| Alternativas GNN clásicas (GIN, GAT) | Varios | Message passing | Variable | Grafo molecular | Frameworks abiertos |
| Modelos de lenguaje químico (p. ej. variantes de ChemLLM) | Varios | Transformer de texto | Variable | Secuencia SMILES | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni instrucciones; cualquier uso como chatbot o asistente es inadecuado.
- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado sobre datos químicos, puede heredar sesgos de las bases de datos empleadas (infrarrepresentación de ciertas familias moleculares).
- Riesgo de alucinación: en el contexto de predicción de propiedades, el riesgo se traduce en predicciones erróneas con alta confianza fuera del dominio de entrenamiento; requiere validación experimental.
- Limitaciones de contexto o idioma: no aplicable en el sentido lingüístico; la limitación real es el tamaño máximo de grafo soportado, no especificado.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial; sin embargo, las versiones preentrenadas avanzadas solo están en Azure Quantum Elements, lo que puede limitar el acceso a los mejores checkpoints.
- Caveat para producción: el repositorio tiene 0 descargas y 7 likes en el momento de la consulta, lo que sugiere adopción limitada; conviene validar la reproducibilidad de los checkpoints antes de integrarlos en pipelines críticos.
- La fecha de actualización del repositorio (2026-11-03) es posterior a la fecha de creación (2024-07-30), lo que indica mantenimiento, pero no se detalla el historial de cambios.

## Enlaces

- Hugging Face: https://huggingface.co/microsoft/Graphormer
- Directorio Distributional-Graphormer: https://huggingface.co/microsoft/Graphormer/tree/main/Distributional-Graphormer
- Directorio orfb-design: https://huggingface.co/microsoft/Graphormer/tree/main/orfb-design
- Data summary card: https://huggingface.co/microsoft/graphormer/blob/main/data_summary_card.md
- Web del proyecto: https://www.microsoft.com/en-us/research/project/graphormer/
- Paper Nature Machine Intelligence: https://www.nature.com/articles/s42256-024-00837-3
- Paper ACS Electrochemistry: https://doi.org/10.1021/acselectrochem.6c00233
- Paper arXiv (Closed-Loop Molecular Design): https://arxiv.org/abs/2606.02618
- Azure Quantum Elements: https://quantum.microsoft.com/en-us/our-story/quantum-elements-overview
