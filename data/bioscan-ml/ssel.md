# bioscan-ml/ssel

## Resumen

SSEL (Structured Stacked Entailment Loss) es un modelo de investigación para el aprendizaje de representaciones jerárquicas de códigos de barras de ADN y taxonomía biológica en un espacio hiperbólico compartido. Lo desarrolla el equipo de bioscan-ml, vinculado al proyecto BIOSCAN de biodiversidad, y se presenta en un póster de iBOL y en una submission a UniReps. No es un modelo generativo de lenguaje: es un codificador que produce embeddings de 768 dimensiones para secuencias de ADN y para etiquetas taxonómicas, de modo que la estructura jerárquica de la taxonomía (reino, filo, clase, orden, etc.) queda codificada geométricamente mediante conos de entailment hiperbólicos.

El problema que aborda es la clasificación y organización taxonómica de códigos de barras de ADN (región COI y similares) a gran escala, donde la jerarquía biológica es inherente y los enfoques euclídeos estándar no la capturan bien. SSEL extiende Stacked Entailment Loss (SEL) con cuatro restricciones adicionales: distancia mínima entre embeddings, anidamiento completo de conos, separación entre conos hermanos y asignación de conos basada en descendientes.

El repositorio contiene nueve experimentos de 768 dimensiones de la versión 1.0 (15 épocas, semilla 42) más un checkpoint adicional de 40 épocas solo de ADN. La rama de ADN parte de BarcodeBERT y pasa por un MLP 768 → 1536 → 768 sin conexión residual; las etiquetas taxonómicas usan tablas de embedding aprendidas. Estos experimentos usan ADN y cuatro rangos taxonómicos, sin rama de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador BarcodeBERT + MLP 768 → 1536 → 768 (sin residual) + tablas de embedding taxonomicas; espacio hiperbolico con conos de entailment |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentacion) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`last.pth`); embeddings extraidos en HDF5 |

## Arquitectura y entrenamiento

SSEL es un modelo de embeddings multimodales (ADN y taxonomía) en un espacio hiperbólico. La rama de ADN arranca desde BarcodeBERT, un transformer preentrenado sobre códigos de barras de ADN, y aplica encima un perceptrón multicapa de 768 → 1536 → 768 sin conexión residual para proyectar al espacio compartido. Las etiquetas taxonómicas se representan mediante tablas de embedding aprendidas. El entrenamiento combina la pérdida de entailment apilada (SEL) con cuatro restricciones estructurales: distancia mínima, anidamiento completo de conos, separación de conos hermanos y asignación de conos basada en descendientes. El objetivo es que la jerarquía taxonómica quede reflejada como relaciones de inclusión geométrica entre conos hiperbólicos.

Los nueve experimentos de `Ver_1_0` usan 768 dimensiones, 15 épocas y semilla 42, con ADN y cuatro rangos taxonómicos (sin rama de imagen). El checkpoint adicional `ssel-40epochs` en `Ver_1_1` se entrena 40 épocas solo con ADN. Cada checkpoint incluido es el `last.pth` exacto usado para el resultado reportado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Generación de embeddings de 768 dimensiones para secuencias de ADN (códigos de barras).
- Generación de embeddings para etiquetas taxonómicas en un espacio hiperbólico compartido.
- Codificación de relaciones jerárquicas de inclusión mediante conos de entailment hiperbólicos.
- Clasificación taxonómica a nivel de cuatro rangos.
- Separación geométrica de taxones hermanos y anidamiento de conos padre-hijo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá del etiquetado en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación taxonómica de códigos de barras de ADN: dado un fragmento COI, el modelo produce un embedding que se compara contra los embeddings de taxones de referencia para asignar el rango más probable, aprovechando que la jerarquía está codificada en el espacio hiperbólico.
- Búsqueda de similitud biológica: los embeddings de 768 dimensiones permiten búsquedas por vecino más cercano en índices vectoriales para identificar especies o géneros afines a una muestra desconocida.
- Detección de especímenes mal etiquetados: si un embedding de ADN cae fuera del cono esperado para su etiqueta taxonómica declarada, puede señalarse como candidato a error de identificación en bases de datos de biodiversidad.
- Organización y visualización de jerarquías taxonómicas: los conos hiperbólicos permiten representar visualmente la estructura de inclusión entre taxones y detectar solapamientos anómalos entre clados.
- Enriquecimiento de pipelines de metabarcoding: integrar el codificador en flujos que procesan muestras ambientales masivas para asignar taxonomía a miles de lecturas antes de análisis ecológicos.
- Investigación comparativa de funciones de pérdida: los nueve checkpoints (EL, SEL, variantes con nesting, separation, allocation, etc.) permiten reproducir y comparar el efecto de cada restricción estructural sobre la calidad de los embeddings.
- Estudio de representaciones hiperbólicas en biología: como banco de pruebas para investigar si la geometría hiperbólica mejora la captura de jerarquías biológicas frente a espacios euclídeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 6,2 GB e incluye nueve checkpoints y embeddings extraídos, por lo que cada checkpoint individual es sustancialmente menor. El backbone BarcodeBERT más el MLP 768 → 1536 → 768 es ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería bastar para inferencia de un checkpoint individual; no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay datos oficiales.
- Opciones de despliegue: PyTorch nativo (los pesos son `last.pth`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSEL (bioscan-ml) | no disponible | no disponible | Embeddings ADN-taxonomía hiperbólicos | no disponible | Hugging Face |
| BarcodeBERT (bioscan-ml) | no disponible | no disponible | Embeddings de códigos de barras de ADN | no disponible | Hugging Face |
| SEL (Stacked Entailment Loss) | no disponible | no disponible | Embeddings jerárquicos con conos de entailment | no disponible | Incluido como checkpoint en este repo |

La comparación cuantitativa con alternativas externas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo generativo ni un asistente conversacional; su uso está restringido a tareas de embedding y clasificación biológica.
- Sesgos conocidos: no documentados; al entrenarse sobre datos de biodiversidad, puede estar sesgado hacia los taxones y regiones geográficas sobrerrepresentados en el corpus de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de asignaciones taxonómicas erróneas en especies poco representadas o morfológicamente crípticas.
- Limitaciones de contexto e idioma: solo se documenta inglés para etiquetas y documentación; no se especifica longitud máxima de secuencia de ADN soportada.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- Caveats para producción: los checkpoints son `last.pth` de experimentos de investigación con semilla fija (42); no hay garantías de robustez fuera del conjunto de test reportado, ni métricas de calibración publicadas.
- El repositorio mezcla versiones (`Ver_1_0` y `Ver_1_1`) y un checkpoint adicional de 40 épocas que no aparece en la submission a UniReps; conviene verificar qué checkpoint corresponde a cada resultado antes de reproducir experimentos.

## Enlaces

- Hugging Face: https://huggingface.co/bioscan-ml/ssel
- Página del proyecto: https://bioscan-ml.org/ssel/
- Repositorio de código (próximamente): https://github.com/zmgong/SSEL_temp_release
- BarcodeBERT (backbone): https://huggingface.co/bioscan-ml/clibd/tree/main/ckpt/BarcodeBERT
- Paper: no disponible (referenciado como `#` en la model card)
