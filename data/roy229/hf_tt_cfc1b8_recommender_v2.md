# Roy229/hf_tt_cfc1b8_recommender_v2

## Resumen

Roy229/hf_tt_cfc1b8_recommender_v2 es un modelo de recomendación basado en sesiones, diseñado para impulsar el escaparate Aurora (Aurora storefront). Desarrollado por el usuario Roy229, el modelo emplea una arquitectura de red neuronal de grafos (GNN) para predecir el compromiso con el siguiente artículo a partir de secuencias de sesiones de usuario. El modelo fue entrenado con datos de clickstream de Aurora anonimizados correspondientes al periodo 2024-2025.

El modelo se presenta con un estado de gobernanza marcado como "needs-attention" y una declaración de licencia pendiente, lo que lo sitúa en una fase temprana de publicación sin garantías de uso comercial. Su relevancia radica en abordar el problema de recomendación secuencial en comercio electrónico, donde el contexto de sesión es clave para predecir la siguiente interacción del usuario. No se dispone de información sobre el número de parámetros, la longitud de contexto ni el formato de pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (declaracion pendiente) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura se describe como una red neuronal de grafos (GNN) orientada a la recomendación basada en sesiones. El modelo modela las secuencias de interacciones de usuario como estructuras de grafo para capturar dependencias entre elementos visitados en una misma sesión y predecir el siguiente artículo con mayor probabilidad de compromiso (engagement). No se detallan los componentes internos de la GNN (tipo de capas, mecanismos de atención, agregación de vecinos, etc.) ni la estrategia de muestreo de grafos empleada.

El entrenamiento se realizó sobre datos de clickstream de Aurora, anonimizados, correspondientes al periodo 2024-2025. No se especifica el volumen de datos, el número de sesiones, el número de épocas, ni si se emplearon técnicas de aprendizaje supervisado, contrastivo o de ranking. Tampoco se indica el uso de técnicas como hard negative mining, muestreo por popularidad o regularización específica para grafos.

## Capacidades

- Recomendación basada en sesiones: predice el siguiente artículo que un usuario probablemente consumirá o con el que interactuará, utilizando la secuencia de eventos de la sesión actual.
- Modelado de dependencias secuenciales: al usar una GNN, captura relaciones no lineales entre los elementos visitados, más allá de simples co-ocurrencias.
- Personalización contextual: las recomendaciones dependen del contexto de sesión, no de perfiles de usuario estáticos.
- No se documentan capacidades de generación de texto, razonamiento, código, visión, tool calling ni soporte de agentes, al tratarse de un modelo de recomendación y no de un modelo de lenguaje.

## Casos de uso

- Recomendación de productos en el escaparate Aurora: el caso de uso principal y documentado. El modelo se integra en el flujo de personalización del escaparate para sugerir artículos relevantes en función de la sesión de navegación actual del usuario.
- Personalización de correos de recuperación de carrito: dado un historial de sesión reciente, el modelo puede sugerir artículos para campañas de email marketing dirigidas a usuarios que abandonaron el carrito.
- Recomendación en tiempo real durante la navegación: al recibir la secuencia de eventos de la sesión en curso, el modelo puede actualizar las recomendaciones de la página en cada interacción del usuario.
- Optimización de la página de inicio: el modelo puede alimentar bloques de "productos recomendados" en la página principal, adaptando el contenido al contexto de sesión de cada visitante.
- Mejora de la tasa de conversión en campañas promocionales: al predecir el siguiente artículo con mayor probabilidad de engagement, permite priorizar productos en banners y promociones.
- Análisis de patrones de navegación: aunque no es su función principal, las representaciones aprendidas por la GNN pueden utilizarse para analizar rutas de navegación frecuentes y detectar cuellos de botella en el embudo de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como precisión, recall, NDCG, MRR ni comparaciones con modelos baseline de recomendación.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la model card ni en los resultados de búsqueda. Al tratarse de una GNN de recomendación, los requisitos dependerán del tamaño del grafo y del número de parámetros, datos no publicados. No se documentan opciones de despliegue (vLLM, TensorFlow Serving, TorchServe, etc.) ni estimaciones de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se publican resultados que permitan contrastar este modelo con alternativas de recomendación basada en sesiones como GRU4Rec, SASRec o SR-GNN.

## Limitaciones y advertencias

- Sesgo de popularidad: la propia model card advierte que las recomendaciones pueden reflejar sesgo de popularidad, favoreciendo artículos frecuentemente visitados en detrimento de elementos de cola larga.
- Dependencia del contexto de sesión: el modelo requiere contexto de sesión para ser efectivo; sin datos de sesión suficientes, su rendimiento puede degradarse significativamente.
- Licencia pendiente: la model card incluye una sección de remediación indicando que falta la declaración de licencia. No se puede asumir ningún permiso de uso, incluido el uso comercial, hasta que se publique una licencia explícita.
- Estado de gobernanza: el modelo está marcado como "needs-attention", lo que sugiere que no ha pasado por un proceso completo de revisión de gobernanza.
- Datos de entrenamiento limitados en alcance: entrenado exclusivamente sobre clickstream de Aurora (2024-2025), lo que limita su generalización a otros dominios o plataformas.
- Sin métricas publicadas: no se documentan resultados de evaluación, lo que impide validar su rendimiento real frente a alternativas.
- Riesgo de alucinación: no aplica al ser un modelo de recomendación, no generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Roy229/hf_tt_cfc1b8_recommender_v2
- Datasets del autor: https://huggingface.co/Roy229/datasets
- Otro modelo del mismo autor: https://huggingface.co/Roy229/hf2197cat441573-cand1
