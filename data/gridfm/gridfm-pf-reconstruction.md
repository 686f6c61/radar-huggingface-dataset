# gridfm/gridfm-pf-reconstruction

## Resumen

GridFM PowerFlow Reconstruction es un modelo de red neuronal de grafos (GNN) heterogénea desarrollado por el proyecto GridFM, una iniciativa que reúne a las comunidades de sistemas de potencia e inteligencia artificial para crear modelos fundacionales que comprendan la estructura, la física y las restricciones operativas de las redes eléctricas. Este checkpoint concreto, identificado como `gridfm/gridfm-pf-reconstruction`, implementa la tarea de reconstrucción de flujo de potencia: dado un caso de red eléctrica (buses, generadores y ramas), el modelo produce por nodo embeddings latentes y predicciones de magnitudes físicas como la magnitud y el ángulo de la tensión en los buses (Vm, Va) y la potencia activa generada (Pg).

El modelo utiliza una arquitectura `GNS_heterogeneous` con 12 capas, 8 cabezas de atención y un tamaño oculto de 12, sumando aproximadamente 1,3 millones de parámetros. Está entrenado exclusivamente sobre el caso IEEE case14, con 2.000 escenarios generados mediante simulaciones de flujo de potencia en AC con PowerModels.jl. Aunque es un checkpoint compacto de referencia, demuestra el flujo completo de entrenamiento, normalización y despliegue con vLLM, lo que lo hace relevante para quienes exploran el uso de GNN en estimación de estado y análisis de redes eléctricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GNS_heterogeneous` (GNN heterogénea, 12 capas, 8 cabezas de atención, hidden size 12) |
| Parametros totales | 1.276.611 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una GNN heterogénea (`GNS_heterogeneous`) que modela la red eléctrica como un grafo donde los buses y generadores son nodos, y las ramas y conexiones bus↔generador son aristas tipadas. Cada nodo tiene dimensiones de entrada específicas: 15 características para buses, 6 para generadores y 10 para aristas. La salida por nodo es de 2 valores para buses (Vm, Va) y 1 para generadores (Pg), denormalizados a unidades físicas mediante un normalizador `HeteroDataMVANormalizer` ajustado sobre el conjunto de entrenamiento.

El entrenamiento se realizó con datos generados por `gridfm-datakit` (basado en PowerModels.jl para resolver flujos de potencia en AC). Se usaron 2.000 escenarios que cubren perturbaciones en carga, topología, coste de generación y admitancia. Se entrenó durante 20 épocas con una pérdida combinada: `LayeredWeightedPhysics` con peso 0,1 y `MaskedBusMSE` con peso 0,9, optimizada con AdamW y una tasa de aprendizaje de 5e-4. No se menciona el uso de RLHF ni DPO, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Reconstrucción de flujo de potencia: predice la magnitud y el ángulo de la tensión en cada bus (Vm, Va) y la potencia activa del generador (Pg) a partir de un caso de red parcialmente observado.
- Generación de embeddings por nodo: produce representaciones latentes de buses y generadores que pueden usarse para otras tareas de aprendizaje sobre grafos de potencia.
- Soporte de normalización física: los valores de salida se denormalizan a unidades del sistema (por ejemplo, por unidad o grados), lo que facilita su uso directo en aplicaciones de ingeniería.
- Integración con vLLM: el modelo se puede servir a través del endpoint `/pooling` de vLLM, lo que permite inferencia en producción con una API estándar.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Estimación de estado en redes eléctricas: el modelo puede reconstruir tensiones y potencias en buses y generadores a partir de mediciones parciales, útil para monitorización en tiempo real de la red.
- Detección de anomalías: comparando las predicciones del modelo con mediciones reales, se pueden identificar desviaciones que indiquen fallos, pérdidas o comportamientos anómalos en la red.
- Planificación de operación: al predecir el flujo de potencia bajo diferentes escenarios de carga y topología, el modelo ayuda a evaluar la viabilidad de configuraciones operativas antes de aplicarlas.
- Análisis de sensibilidad: dado que el modelo es entrenable y ligero, puede usarse para explorar cómo cambios en la demanda o en la admitancia afectan a las tensiones y potencias, sin necesidad de resolver el flujo de potencia completo.
- Servicio de inferencia con vLLM: al integrarse con vLLM, el modelo puede desplegarse como un servicio HTTP que recibe casos de red en formato JSON y devuelve predicciones, facilitando su uso en plataformas de análisis energético.
- Base para modelos fundacionales de grafos: los embeddings generados pueden servir como características de entrada para otros modelos de aprendizaje automático que aborden tareas como predicción de congestión o planificación de expansión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye comparaciones con otros modelos ni métricas de precisión sobre conjuntos de prueba estándar. El autor indica que es un checkpoint de referencia compacto, por lo que no se dispone de datos de rendimiento cuantitativos.

## Requisitos de hardware

- Al ser un modelo de solo ~1,3 millones de parámetros, la inferencia es extremadamente ligera y puede ejecutarse en CPU sin problemas.
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM sería suficiente; incluso GPUs integradas o de gama baja pueden manejar el modelo.
- Para servir con vLLM, se recomienda una GPU con soporte CUDA, aunque el modelo también puede ejecutarse en modo CPU con vLLM si se configura adecuadamente.
- Opciones de despliegue: vLLM (con el runner `pooling`), o directamente con la librería `gridfm-graphkit` en Python.
- No se dispone de datos de latencia o throughput específicos, pero dado el tamaño del modelo, se espera una latencia de milisegundos por caso en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (GNN para reconstrucción de flujo de potencia). El ecosistema GridFM incluye otros checkpoints, pero no se han proporcionado datos de comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en el caso IEEE case14: el modelo no ha sido validado en otras topologías de red, por lo que su uso en redes de mayor tamaño o con configuraciones diferentes puede producir resultados poco fiables.
- Checkpoint de referencia: el autor lo describe como un modelo compacto para demostrar la funcionalidad, no como un modelo de producción para grandes redes.
- Sin datos de generalización: no se han publicado resultados sobre rendimiento en redes no vistas, y el propio proyecto GridFM reconoce que la generalización a topologías completamente nuevas sigue siendo un desafío abierto.
- No es un modelo de lenguaje: no debe usarse para tareas de procesamiento de texto ni generación de contenido.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo; sin embargo, las predicciones pueden ser incorrectas si la entrada está fuera de la distribución de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gridfm/gridfm-pf-reconstruction
- Repositorio gridfm-graphkit: https://github.com/gridfm/gridfm-graphkit
- Repositorio gridfm-datakit: https://github.com/gridfm/gridfm-datakit
- Documentación de GridFM Models en DeepWiki: https://deepwiki.com/gridfm/gridfm-graphkit/3.3-gridfm-models
- Documentación de Feature Reconstruction en DeepWiki: https://deepwiki.com/gridfm/gridfm-graphkit/6.1-feature-reconstruction
- Blog de IBM sobre GridFM: https://research.ibm.com/blog/gridfm-neural-solver-power-grid
- Sitio web del proyecto GridFM: https://gridfm.org/
