# NicoloLocatelli/EulerCAD-Deep

## Resumen

EulerCAD-Deep es un transformer decoder-only de 36,9 millones de parámetros desarrollado por NicoloLocatelli y entrenado desde cero sobre dibujos CAD 2D. El modelo no procesa imágenes ni texto: cada dibujo se representa como un grafo de puntos y segmentos rectos, y se serializa mediante un recorrido euleriano aleatorio que atraviesa cada segmento exactamente una vez, generando una secuencia ordenada de filas. La tarea de preentrenamiento es la predicción de la siguiente fila, y el embedding de un dibujo se obtiene promediando los estados ocultos de una capa concreta a lo largo del recorrido.

El modelo se publica junto con el dataset EulerCAD-ABC-Preprocessed, derivado de las vistas 2D de objetos 3D del ABC dataset. Su relevancia actual reside en que aborda la representación de geometría vectorial CAD con un transformer autoregresivo estándar en lugar de arquitecturas específicas de grafos o de nubes de puntos, lo que permite reutilizar infraestructura de entrenamiento e inferencia de lenguaje. Con 36,9M de parámetros y un entrenamiento completo en una única RTX 4060 Ti de 16 GB, es un caso práctico de modelado self-supervised de bajo coste.

El checkpoint publicado corresponde a la actualización 208.000, seleccionada por mejor pérdida de validación (0,7144). La evaluación principal mide la recuperación de otras vistas del mismo objeto 3D, con resultados de mAP 0,250 y recall@1 0,538 en la capa 7 sobre el split de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (14 capas, ancho 384, 6 cabezas de atención) |
| Parametros totales | 36.850.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (vocabulario de 512 identidades de nodo y 256 bins para coordenadas y distancias; se descartan dibujos con más de 512 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; opera sobre secuencias de grafo CAD) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` que incluye tokenizador, configuración del modelo y actualización de origen |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 14 capas de ancho 384 y 6 cabezas de atención, con un total de 36,9M de parámetros. Incorpora atención con compuerta (gated attention), normalización QK y value residual. La tokenización es específica del dominio: 512 identidades de nodo y 256 bins para coordenadas y distancias; los dibujos con más de 512 puntos se descartan. La secuencia de entrada es un recorrido euleriano aleatorio del grafo del dibujo, es decir, un orden de filas que cruza cada segmento una sola vez, y el objetivo de entrenamiento es la predicción de la siguiente fila.

El entrenamiento utiliza los 246.108 dibujos de entrenamiento de EulerCAD-ABC-Preprocessed, que son vistas 2D de objetos 3D del ABC dataset. Se realizaron 208.200 actualizaciones con lotes de 160 dibujos, optimizador Muon y un schedule warmup-stable-decay, todo en una única RTX 4060 Ti de 16 GB. Los pesos publicados corresponden a la actualización 208.000, con la mejor pérdida de validación registrada (0,7144). El enfoque es completamente self-supervised, sin RLHF ni DPO, y la representación de un dibujo se obtiene promediando los estados ocultos de una capa a lo largo del recorrido euleriano.

## Capacidades

- Predicción de la siguiente fila en secuencias de grafo CAD derivadas de recorridos eulerianos.
- Generación de representaciones (embeddings) de dibujos CAD 2D mediante el promedio de estados ocultos de una capa.
- Recuperación de vistas relacionadas del mismo objeto 3D a partir del embedding (evaluada con mAP y recall@1).
- Análisis por capas: la herramienta `analyze` mide cada capa y puntúa la recuperación, lo que permite seleccionar la representación más adecuada.
- Modelado de grafos de puntos y segmentos rectos con hasta 512 puntos por dibujo.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un modelo de dominio específico para geometría CAD vectorial.

## Casos de uso

- Recuperación de diseños CAD por similitud: usar el embedding de la capa 7 (mAP 0,250, recall@1 0,538 en validación) para indexar dibujos y recuperar vistas del mismo objeto 3D en un buscador interno de piezas.
- Deduplicación de vistas 2D en pipelines de ingeniería: agrupar dibujos que representan el mismo objeto desde ángulos distintos antes de alimentar un sistema de documentación técnica.
- Preentrenamiento como base para tareas downstream de CAD: reutilizar los pesos como inicialización de un modelo que clasifique o etiquete geometrías vectoriales, aprovechando el preentrenamiento self-supervised sobre 246.108 dibujos.
- Investigación en representación de grafos con transformers: el modelo sirve como baseline reproducible para comparar serializaciones de grafos (recorrido euleriano frente a otras) en tareas de recuperación.
- Clasificación y clustering no supervisado de geometrías: extraer embeddings de un catálogo de planos 2D y aplicar clustering para descubrir familias de formas sin etiquetas.
- Prototipado educativo y de bajo coste: el entrenamiento completo cabe en una RTX 4060 Ti de 16 GB, lo que permite reproducir el pipeline y experimentar con variantes del tokenizador o del schedule en hardware de consumo.
- Análisis de capas para selección de representación: usar la herramienta `analyze` para determinar qué capa ofrece mejores embeddings en un conjunto de datos propio antes de desplegar un sistema de recuperación.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación | 0,7144 | Checkpoint en la actualización 208.000 (mejor validación) |
| mAP (recuperación de otras vistas) | 0,250 | Split de validación, capa 7 |
| Recall@1 (recuperación de otras vistas) | 0,538 | Split de validación, capa 7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para los 36,9M de parámetros (el repo completo ocupa 0,1 GB); no se han publicado cifras oficiales de VRAM.
- GPU de entrenamiento documentada: una RTX 4060 Ti de 16 GB para 208.200 actualizaciones con lotes de 160 dibujos.
- Cabe holgadamente en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con suficiente memoria para el grafo de entrada.
- Opciones de despliegue: el autor proporciona la CLI `eulercad` (comandos `model download` y `analyze`) y la función `load_model` del paquete Python `eulercad.training.artifacts`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no es lingüístico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EulerCAD-Deep | 36,9M | no disponible (máx. 512 puntos por dibujo) | Embeddings y predicción de siguiente fila en grafos CAD | MIT | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (transformers sobre grafos CAD vectoriales) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo procesa dibujos CAD 2D representados como grafos de puntos y segmentos rectos; no acepta texto, imágenes ni otros formatos.
- Límite estructural de 512 puntos por dibujo: los dibujos con más de 512 puntos se descartan, lo que excluye geometrías complejas.
- Tokenización por bins: coordenadas y distancias se discretizan en 256 bins, lo que introduce pérdida de precisión geométrica.
- Rendimiento de recuperación moderado: mAP 0,250 y recall@1 0,538 en validación indican que la recuperación de vistas relacionadas es imperfecta y requiere validación en el caso de uso concreto.
- Sin datos publicados sobre sesgos, alucinación o comportamiento fuera de distribución; al no ser un modelo lingüístico, estos riesgos se trasladan a errores de representación geométrica.
- Licencia MIT para pesos y código, pero los datos de entrenamiento derivan de ABC, cuyos modelos CAD pertenecen a sus creadores bajo los Términos de Uso de Onshape (sección 1.g.ii); conviene revisar las implicaciones para uso comercial de modelos entrenados con esos datos.
- Sin soporte documentado para cuantización ni para motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicoloLocatelli/EulerCAD-Deep
- Dataset de entrenamiento: https://huggingface.co/datasets/NicoloLocatelli/EulerCAD-ABC-Preprocessed
- Código, entrenamiento y análisis: https://github.com/NicoloLocatelli/EulerCAD
- ABC dataset: https://deep-geometry.github.io/abc-dataset/
- Términos de uso de Onshape: https://www.onshape.com/legal/terms-of-use
