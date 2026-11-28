# DeepLearnPhysics/Panda-Particle

## Resumen

Panda-Particle es un detector panóptico basado en consultas (query-based) para el análisis de eventos en detectores de proyección temporal de argón líquido (LArTPC), el tipo de detector empleado en experimentos de neutrinos como DUNE o MicroBooNE. Desarrollado por DeepLearnPhysics, el modelo segmenta instancias individuales de partículas sobre nubes de puntos 3D y asigna a cada instancia un identificador de partícula (PID) entre seis clases. Resuelve un problema clásico de reconstrucción en física de partículas: separar y clasificar las trazas superpuestas que deja la interacción de un neutrino en el volumen sensible del detector.

El modelo se distribuye empaquetado en el formato de exportación de la librería `pimm` (particle-imaging-models), a partir de los checkpoints originales del repositorio `panda`. Emplea una arquitectura de backbone PTv3 (Point Transformer v3) con 32 consultas aprendidas y un total de 95.164.040 parámetros. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que opera sobre nubes de puntos y produce etiquetas de segmentación e identificación de partículas.

Es relevante ahora porque la reconstrucción automatizada de eventos en LArTPC es un cuello de botella para los grandes experimentos de neutrinos de próxima generación, y los enfoques panópticos con consultas permiten unificar segmentación semántica e instancias en una sola pasada, en lugar de encadenar varios modelos especializados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Point Transformer v3 (PTv3) con cabeza de detección panóptica basada en consultas |
| Parámetros totales | 95.164.040 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos, no sobre secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible (hereda la licencia del repositorio original `panda`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño de detección panóptica con consultas: un backbone Point Transformer v3 extrae características de la nube de puntos 3D del evento, y una cabeza con 32 consultas aprendidas predice instancias de partículas junto con su clase PID en un espacio de seis categorías. Este esquema, inspirado en los detectores tipo DETR adaptados a nubes de puntos, evita el post-procesado de agrupamiento que requieren los enfoques de segmentación semántica seguidos de clustering.

El entrenamiento se realizó sobre el dataset `DeepLearnPhysics/PILArNet-M`, según declara la model card. No se especifican en la información disponible el número de eventos de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de ajuste fino con refuerzo o preferencias (no aplicable en este dominio). Tampoco se detalla la función de pérdida ni el esquema de asignación de consultas a instancias reales.

## Capacidades

- Segmentación panóptica de instancias de partículas en nubes de puntos 3D de eventos LArTPC.
- Identificación de partículas (PID) con 6 clases sobre cada instancia segmentada.
- Procesamiento de nubes de puntos mediante backbone PTv3.
- Integración con la librería `pimm` para carga y ejecución (`pimm.from_pretrained`).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente de visión 3D / física de partículas.
- No dispone de modo de razonamiento (thinking), visión 2D, audio ni funciones conversacionales.

## Casos de uso

- Reconstrucción de eventos en experimentos de neutrinos: el modelo separa las trazas e instancias de partículas producidas en una interacción y les asigna PID, lo que permite reconstruir la topología del vértice y las trayectorias sin intervención manual.
- Análisis de datos de MicroBooNE y prototipos de DUNE: al estar entrenado sobre PILArNet-M, encaja en pipelines de reconstrucción de LArTPC que necesitan segmentación e identificación automática de partículas por evento.
- Etiquetado y control de calidad de simulaciones: sirve para comparar la salida del detector con la verdad de simulación (Monte Carlo) y detectar discrepancias en la reconstrucción.
- Filtrado y selección de eventos: la salida de instancias con PID permite preseleccionar eventos con topologías de interés (por ejemplo, candidatos a interacciones de corriente cargada) antes de análisis más costosos.
- Investigación en métodos panópticos para nubes de puntos: el modelo es un punto de partida reproducible para estudiar cabezas de consultas en dominios científicos distintos de la visión urbana o de interiores.
- Integración en flujos de análisis con `pimm`: al cargarse mediante `pimm.from_pretrained`, puede incorporarse a pipelines de procesamiento por lotes de eventos dentro del ecosistema de DeepLearnPhysics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 95,16 M de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 0,38 GB, por lo que la memoria dominante será la de las activaciones de la nube de puntos, no los pesos.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo, una GPU consumer moderna (por ejemplo, RTX 3090 o RTX 4090) debería ser suficiente para inferencia, aunque no hay confirmación oficial.
- Cabe en GPU consumer: probable por el número de parámetros, si bien el consumo real depende del tamaño de las nubes de puntos de entrada; no confirmado.
- Opciones de despliegue: la vía documentada es la librería `pimm` (`pimm.from_pretrained("hf://deeplearnphysics/panda-particle")`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (detectores panópticos para LArTPC) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de dominio específico: solo es válido para nubes de puntos de eventos LArTPC; no es un modelo de propósito general ni un modelo de lenguaje.
- Licencia no especificada en la información disponible: la model card indica que hereda la licencia del repositorio original `panda`, por lo que debe consultarse ese repositorio antes de cualquier uso comercial.
- Dependencia de la librería `pimm`: la carga requiere `pimm` y, en versiones 0.5 o anteriores, el nombre del detector es `detector-v4` y es necesario cargar la revisión `pimm-0.5`; esto puede provocar errores de compatibilidad si no se gestiona la revisión.
- Entrenado sobre un único dataset (PILArNet-M): el rendimiento fuera de esa distribución de simulación no está documentado y podría degradarse.
- Riesgo de alucinación en sentido figurado: como todo detector, puede generar instancias espurias o asignar PID incorrectos en eventos con poca señal o alta superposición; no hay métricas publicadas que cuantifiquen este riesgo.
- Sin datos de sesgo, idioma ni contexto: no aplicables, pero tampoco hay evaluación de robustez publicada.
- Repositorio con pocas descargas (14) y sin likes: ecosistema de validación muy reducido, lo que limita la evidencia independiente sobre su calidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/Panda-Particle
- Repositorio original `panda`: https://github.com/DeepLearnPhysics/panda
- Librería `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models
- Dataset PILArNet-M: https://huggingface.co/datasets/DeepLearnPhysics/PILArNet-M
