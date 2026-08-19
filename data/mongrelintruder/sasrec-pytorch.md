# MongrelIntruder/sasrec-pytorch

## Resumen

SASRec (Self-Attentive Sequential Recommendation) es un modelo de recomendación secuencial basado en la arquitectura transformer, propuesto originalmente por Kang y McAuley en 2018. Esta implementación concreta, publicada por el usuario MongrelIntruder, es una reimplementación en PyTorch del modelo original, entrenada como parte de un estudio de tesis. El repositorio contiene los pesos del modelo (`pytorch_model.bin`), el código de definición (`model.py`), utilidades de evaluación (`utils.py`) y los hiperparámetros usados (`args.json`).

El modelo resuelve el problema de predecir el siguiente ítem con el que un usuario interactuará, basándose en su historial de interacciones pasadas. Es relevante para sistemas de recomendación que necesitan modelar dependencias de corto y largo plazo en secuencias de comportamiento. La ventaja de SASRec frente a métodos tradicionales (como los basados en Markov) es su capacidad para capturar patrones complejos mediante mecanismos de atención, sin recurrir a redes recurrentes.

Aunque la información pública es limitada, el autor reporta métricas de validación y test (NDCG@10 y HR@10) que indican un rendimiento razonable. El tamaño del repositorio (0.0 GB) sugiere que se trata de un modelo compacto, probablemente entrenado con un conjunto de datos académico estándar, aunque no se especifica cuál.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SASRec (Transformer encoder con self-attention para recomendación secuencial) |
| Parametros totales | no disponible (repo de 0.0 GB, probablemente pocos millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típicamente SASRec usa secuencias de interacciones de longitud fija, pero no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ítems recomendados no tienen idioma explícito) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (state_dict de PyTorch), junto con `model.py`, `utils.py`, `args.json` |

## Arquitectura y entrenamiento

SASRec es un modelo basado en transformer que procesa secuencias de interacciones de usuario (por ejemplo, clics, compras o visualizaciones) y genera una representación contextual de cada posición. La arquitectura emplea capas de self-attention para ponderar la relevancia de cada ítem previo en la secuencia, y una capa de predicción final que puntúa todos los ítems candidatos. Esta implementación en PyTorch sigue la estructura original de Kang y McAuley, con una pila de bloques de atención y normalización.

El entrenamiento se realizó como parte de una tesis, pero no se proporcionan detalles sobre el dataset utilizado, el número de tokens o el procedimiento de optimización (si se usó RLHF, DPO, etc.). El autor solo indica que se guardaron los mejores resultados de validación y test durante el entrenamiento. No se mencionan innovaciones técnicas adicionales más allá de la reimplementación fiel del modelo original.

## Capacidades

- Recomendación secuencial: predice el siguiente ítem que un usuario podría consumir, basándose en su historial de interacciones.
- Generación de representaciones (embeddings) de usuarios e ítems, útiles para tareas downstream.
- Modelado de dependencias temporales mediante atención, capturando patrones tanto locales como globales en la secuencia.
- Soporte de tool calling: no disponible (no se menciona en la información).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (el modelo opera sobre identificadores de ítems, no sobre texto).
- Otras capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Recomendación de productos en comercio electrónico: el modelo puede procesar la secuencia de compras o vistas de un usuario para sugerir el siguiente producto probable. Su arquitectura basada en atención es adecuada para capturar preferencias cambiantes a lo largo del tiempo.
- Recomendación de contenidos en plataformas de streaming: dado el historial de visualizaciones o escuchas, el modelo predice el siguiente contenido que podría interesar al usuario, mejorando la retención.
- Recomendación de artículos en portales de noticias: al modelar la secuencia de artículos leídos, puede sugerir noticias relevantes que mantengan al usuario en la plataforma.
- Personalización de correos electrónicos o notificaciones: usando el historial de interacciones, se puede seleccionar el siguiente mensaje o promoción más probable de ser aceptado.
- Sistemas de recomendación en redes sociales: para sugerir amigos, grupos o contenidos basados en la secuencia de interacciones sociales del usuario.
- Investigación académica en sistemas de recomendación: sirve como punto de partida para comparar nuevas arquitecturas o técnicas de entrenamiento, dado que es una implementación de referencia de SASRec.

## Benchmarks y rendimiento

El autor reporta los siguientes valores de validación y test durante el entrenamiento, aunque no especifica el dataset utilizado:

| Metrica | Validacion | Test |
|---|---|---|
| NDCG@10 | 0.6279 | 0.5966 |
| HR@10 | 0.8490 | 0.8267 |

No se han publicado resultados comparativos con otros modelos en la información disponible. No se puede determinar si estos valores son competitivos sin conocer el conjunto de datos de referencia.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0.0 GB) sugiere que el modelo es pequeño (probablemente menos de 100 MB), por lo que podría ejecutarse en CPU sin problemas, pero no se confirma.
- GPU recomendadas: no disponible. Dado el tamaño, cualquier GPU moderna (incluso integrada) sería suficiente, pero no hay especificación oficial.
- Compatibilidad con GPU de consumo: probablemente sí, dada su pequeña magnitud, pero no se documenta.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con herramientas como TorchServe, o integrarse en aplicaciones Python. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para esta implementación. Sin embargo, SASRec es un modelo conocido en el campo de la recomendación secuencial, y se puede comparar conceptualmente con otras arquitecturas como GRU4Rec (basada en GRU) o BERT4Rec (basada en transformers bidireccionales). No obstante, sin resultados en un mismo benchmark, no es posible establecer una comparación cuantitativa. Se indica "no disponible" para cualquier comparación numérica.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo. Al ser un modelo de recomendación, podría reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, sobre-representación de ítems populares).
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto libre, sino que puntúa ítems de un catálogo cerrado.
- Limitaciones de contexto: la longitud de la secuencia de entrada no se especifica; en SASRec típicamente se fija un máximo, pero se desconoce aquí.
- Limitaciones de idioma: no aplica, pues trabaja con identificadores de ítems, no con lenguaje natural.
- Restricciones de licencia: la licencia no está indicada, por lo que se debe contactar al autor antes de un uso comercial.
- Caveat para producción: al ser un modelo entrenado para una tesis, es probable que no esté optimizado para entornos de producción de alta escala. Se recomienda validar su rendimiento con datos propios antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MongrelIntruder/sasrec-pytorch
- No se encontraron otros enlaces (papers, blogs, demos) en la información proporcionada.
