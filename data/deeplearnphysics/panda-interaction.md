# DeepLearnPhysics/Panda-Interaction

## Resumen

Panda-Interaction es un detector panóptico basado en consultas (query-based) para el agrupamiento de puntos de cámaras de proyección temporal de argón líquido (LArTPC) en interacciones físicas. Lo desarrolla el grupo DeepLearnPhysics y se distribuye a través de la librería `pimm` (particle-imaging-models), que actúa como formato de exportación y marco de carga de modelos para imagen de partículas. El modelo resuelve un problema concreto de reconstrucción en experimentos de neutrinos: dado un conjunto de hits 3D (nube de puntos) procedentes de un LArTPC, asigna cada punto a una interacción física distinta, lo que constituye el primer paso del pipeline de reconstrucción antes de la identificación de partículas o la reconstrucción de vértices.

Técnicamente se trata de un detector panóptico con decodificador de cross-attention enmascarada sobre un backbone PTv3 (Point Transformer v3), con 12 consultas (queries) y 2 clases. El checkpoint cuenta con 95.021.188 parámetros en formato safetensors y un tamaño de repositorio de 0,4 GB, lo que lo sitúa en la gama de modelos ligeros desplegables en una sola GPU. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un modelo de visión 3D especializado en física de partículas.

Su relevancia actual radica en que forma parte del ecosistema emergente de modelos de imagen de partículas empaquetados en formatos reproducibles (`pimm`), que buscan estandarizar la carga y el despliegue de redes entrenadas para LArTPC, un área tradicionalmente dominada por pipelines ad hoc. El modelo se ha republicado a partir de los checkpoints originales del repositorio `panda` de DeepLearnPhysics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector panoptico query-based: backbone PTv3 (Point Transformer v3) con decodificador de cross-attention enmascarada |
| Parametros totales | 95.021.188 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sobre nube de puntos, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible (hereda la licencia del repositorio original `panda`) |
| Formato de pesos | safetensors |
| Tipo `pimm` | `panda-detector-v1m1` |
| Consultas / clases | 12 queries, 2 clases |
| Dataset de entrenamiento | DeepLearnPhysics/PILArNet-M |
| Tamano del repositorio | 0,4 GB |
| Descargas | 15 |
| Libreria | pimm |

## Arquitectura y entrenamiento

La arquitectura combina un backbone PTv3 (Point Transformer v3) que extrae características jerárquicas de la nube de puntos del LArTPC, y un decodificador panóptico basado en consultas con cross-attention enmascarada. El decodificador utiliza 12 consultas aprendidas que compiten por agrupar los puntos en instancias de interacción, con 2 clases definidas. Este diseño sigue el paradigma de detección panóptica tipo DETR trasladado al dominio de nubes de puntos, donde cada consulta representa potencialmente una interacción física y la máscara de atención restringe qué puntos puede agregar cada consulta.

El modelo se entrenó sobre el dataset DeepLearnPhysics/PILArNet-M, un conjunto de datos de imagen de partículas para LArTPC. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino adicionales (RLHF/DPO no aplica en este dominio). El checkpoint se ha reempaquetado desde los pesos originales del repositorio `panda` al formato de exportación `pimm`, por lo que hereda las características del entrenamiento original. Cabe señalar que la versión `pimm` 0.5 y anteriores denominan a este detector `detector-v4`, y para esas versiones debe cargarse la revisión `pimm-0.5`.

## Capacidades

- Detección panóptica de interacciones en nubes de puntos 3D procedentes de LArTPC: agrupa hits en instancias de interacción física.
- Segmentación por instancias mediante consultas (12 queries) con asignación de máscaras a puntos.
- Clasificación en 2 clases dentro del esquema panóptico del detector.
- Procesamiento de nubes de puntos de tamaño variable, sin ventana de contexto secuencial.
- Integración con el ecosistema `pimm` mediante `pimm.from_pretrained`.
- Compatibilidad con la revisión `pimm-0.5` para versiones antiguas de la librería.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Reconstrucción de eventos en experimentos de neutrinos con LArTPC: el modelo agrupa los hits de un evento en interacciones separadas, lo que permite aislar cada interacción antes de aplicar etapas posteriores de reconstrucción de trayectorias y vértices.
- Preprocesado para identificación de partículas: al separar las interacciones, los clasificadores posteriores reciben subconjuntos de puntos coherentes, lo que reduce la contaminación entre interacciones superpuestas en el mismo evento.
- Análisis de eventos con múltiples interacciones superpuestas: las 12 consultas permiten resolver eventos con varias interacciones simultáneas en la misma ventana de tiempo, un escenario habitual en haces intensos.
- Control de calidad y filtrado de eventos: la asignación panóptica permite detectar eventos mal reconstruidos o con agrupamientos anómalos, útil en pipelines de selección de datos.
- Investigación en métodos de detección panóptica sobre nubes de puntos: el modelo sirve como referencia reproducible para comparar variantes de backbone o de decodificador en el dominio de física de partículas.
- Reproducibilidad de resultados científicos: al estar empaquetado en `pimm` con pesos safetensors, permite reproducir la inferencia del detector original `panda` sin depender del código de entrenamiento original.
- Prototipado en GPUs de gama media: con 95 M de parámetros y 0,4 GB de pesos, se puede ejecutar en una sola GPU consumer para experimentación y validación de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 95 M de parámetros en fp32 los pesos ocupan aproximadamente 0,38 GB, y en fp16 aproximadamente 0,19 GB, a lo que hay que sumar la memoria de activaciones y de la nube de puntos de entrada.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo y un lote de inferencia moderado.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se confirma en la documentación.
- Opciones de despliegue: carga mediante la librería `pimm` (`pimm.from_pretrained("hf://deeplearnphysics/panda-interaction")`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Panda-Interaction | 95.021.188 | Nube de puntos LArTPC | Deteccion panoptica de interacciones | no disponible | Hugging Face (pimm) |
| Panda original (`panda` repo) | no disponible | Nube de puntos LArTPC | Deteccion panoptica de interacciones | no disponible | GitHub DeepLearnPhysics |
| PILArNet-M (dataset) | no aplica | Nube de puntos LArTPC | Dataset de entrenamiento | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo altamente especializado: solo es aplicable a nubes de puntos de LArTPC en el contexto de física de partículas; no sirve para tareas de lenguaje, visión 2D o propósito general.
- Licencia no especificada en la model card: se indica que hereda la licencia del repositorio original `panda`, pero no se detalla cuál es, lo que supone un riesgo para uso comercial hasta verificarla en el repositorio fuente.
- Sin datos de benchmarks publicados: no es posible evaluar su precisión frente a alternativas sin ejecutar la inferencia sobre el dataset de referencia.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí existe riesgo de agrupamientos erróneos (falsos positivos o negativos) en eventos con interacciones solapadas o de baja energía.
- Dependencia de la versión de `pimm`: las versiones 0.5 y anteriores requieren cargar la revisión `pimm-0.5`; una carga incorrecta puede fallar o producir resultados inconsistentes.
- Idiomas no aplicables: el modelo no procesa texto.
- Sin información sobre sesgos del dataset de entrenamiento (PILArNet-M) ni sobre su composición, lo que limita el análisis de generalización a otras configuraciones de detector.
- Número de descargas muy bajo (15) y ausencia de likes: poca validación comunitaria y escasa evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/Panda-Interaction
- Repositorio original `panda`: https://github.com/DeepLearnPhysics/panda
- Librería `pimm` (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models
- Dataset PILArNet-M: https://huggingface.co/datasets/DeepLearnPhysics/PILArNet-M
