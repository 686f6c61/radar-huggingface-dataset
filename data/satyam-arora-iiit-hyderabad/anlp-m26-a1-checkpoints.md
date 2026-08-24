# satyam-arora-iiit-hyderabad/anlp-m26-a1-checkpoints

## Resumen

Este repositorio contiene los checkpoints del trabajo de la asignatura Advanced NLP (ANLP) de la IIIT Hyderabad, correspondiente al estudio de ablación arquitectónica de la tarea 1. Se trata de un modelo transformer encoder-decoder implementado desde cero, sin utilizar los módulos estándar de PyTorch como `nn.Transformer`, `nn.MultiheadAttention` o `nn.LayerNorm`. El modelo, denominado C1, es un baseline de 8,5 millones de parámetros entrenado durante 30 épocas con tokenizadores BPE a nivel de byte separados para fuente y destino.

La relevancia de este modelo es principalmente educativa y de investigación: demuestra cómo construir un transformer completo con atención multi-cabeza personalizada, normalización pre-LayerNorm y codificación posicional sinusoidal, sin depender de las implementaciones de alto nivel de PyTorch. Aunque no es un modelo de producción, sirve como referencia para estudiar el impacto de las decisiones arquitectónicas en tareas de secuencia a secuencia. El repositorio incluye el código fuente, la configuración, los tokenizadores, las métricas de test y el historial de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder personalizado (sin `nn.Transformer`, `nn.MultiheadAttention` ni `nn.LayerNorm`) |
| Parametros totales | 8.530.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión completa de PyTorch) |
| Idiomas soportados | no disponible (no especificados) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoint de PyTorch) |

## Arquitectura y entrenamiento

El modelo C1 es un transformer encoder-decoder implementado manualmente. La arquitectura incluye 4 capas de encoder y 4 de decoder, con dimensión de modelo 256, 8 cabezas de atención, dimensión de la FFN 1024 y normalización pre-LayerNorm personalizada. La codificación posicional es sinusoidal absoluta. La tokenización se realiza con tokenizadores BPE a nivel de byte separados para la secuencia fuente y la destino.

El entrenamiento se realizó durante 30 épocas con una semilla fija (42). No se especifica el dataset utilizado ni el tipo de tarea exacta (probablemente traducción o transformación de texto, dado el formato secuencia a secuencia). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El checkpoint está diseñado para inferencia (no para entrenamiento adicional) y se incluye el código fuente para cargar el modelo.

## Capacidades

- Generación de texto secuencia a secuencia: el modelo transforma una secuencia de entrada en una secuencia de salida, típico de tareas como traducción automática o normalización de texto.
- Implementación educativa: permite estudiar el funcionamiento interno de un transformer sin depender de las capas predefinidas de PyTorch.
- Reproducibilidad: al incluir la configuración, los tokenizadores y el historial de entrenamiento, es posible reproducir los experimentos y verificar los resultados.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio. Es un modelo puramente de texto con una única tarea de transformación.

## Casos de uso

- Estudio académico de arquitecturas transformer: el modelo sirve como ejemplo práctico de implementación de atención multi-cabeza, normalización y codificación posicional desde cero, útil para cursos de NLP avanzado.
- Reproducción de experimentos de ablación: los checkpoints permiten comparar el rendimiento de esta arquitectura baseline con otras variantes (por ejemplo, cambios en el número de capas o en el tipo de normalización).
- Evaluación de métricas de similitud de texto: las métricas incluidas (BLEU, ROUGE, Levenshtein) pueden utilizarse para validar herramientas de evaluación en tareas de secuencia a secuencia.
- Desarrollo de tokenizadores BPE a nivel de byte: los tokenizadores incluidos pueden reutilizarse o compararse con otros enfoques de subword tokenization.
- Investigación sobre normalización pre-LayerNorm: el modelo implementa una variante de normalización que puede compararse con post-LayerNorm en términos de estabilidad y convergencia.
- Referencia para implementaciones propias: los desarrolladores pueden consultar el código fuente para aprender a construir un transformer sin las abstracciones de alto nivel de PyTorch.

## Benchmarks y rendimiento

El autor proporciona los resultados completos del test para el modelo C1:

| Metrica | Resultado |
|---|---|
| Exact chunk sequence accuracy | 0,280778 |
| Character edit similarity | 0,982541 |
| Mean Levenshtein distance | 3,836573 |
| Normalized Levenshtein error | 0,017459 |
| BLEU | 89,571750 |
| ROUGE-1 | 0,952277 |
| ROUGE-2 | 0,904322 |
| ROUGE-L | 0,952245 |

El autor indica que el valor de bit-accuracy es provisional porque la definición exacta de la métrica a nivel de bit requiere aclaración. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 8,5 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 34 MB de memoria. Cabe en cualquier GPU consumer moderna (incluso en una GTX 1060 de 6 GB) y también puede ejecutarse en CPU sin problemas.
- No se requieren GPUs de alta gama como A100 o H100 para inferencia.
- El despliegue puede realizarse con PyTorch estándar, cargando el checkpoint y ejecutando el modelo en modo evaluación. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- La latencia y el throughput no están documentados, pero dado el tamaño reducido, la inferencia es rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio ni en la documentación proporcionada. Al tratarse de un checkpoint académico específico para una tarea de una asignatura, no existe una categoría estándar de modelos equivalentes. Se podría comparar con otros transformers pequeños (por ejemplo, T5-small con 60M de parámetros), pero no se dispone de datos de rendimiento comparables en las mismas tareas.

## Limitaciones y advertencias

- Modelo educativo: no está diseñado para uso en producción ni para tareas reales de NLP. Su propósito es servir como referencia de implementación y estudio.
- Licencia no especificada: no se indica ninguna licencia, por lo que su uso comercial o redistribución puede estar restringido. Se recomienda contactar al autor antes de cualquier uso fuera del ámbito académico.
- Sesgos y alucinaciones: no se han evaluado sesgos ni riesgos de alucinación. Al ser un modelo pequeño entrenado en un dataset desconocido, es probable que genere salidas incorrectas o incoherentes fuera de su dominio de entrenamiento.
- Contexto limitado: no se especifica la longitud máxima de secuencia, pero por el diseño (dimensión 256, 4 capas) es probable que maneje secuencias cortas o medianas.
- Idiomas: no se especifican los idiomas soportados. El modelo fue entrenado con tokenizadores BPE a nivel de byte, lo que sugiere que podría manejar cualquier idioma, pero sin garantías de calidad.
- Reproducibilidad: aunque se incluye el código y la configuración, la falta de documentación sobre el dataset y el preprocesamiento exacto puede dificultar la reproducción completa de los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a1-checkpoints
- Ejecución de W&B: https://wandb.ai/satyam-arora-iiit-hyderabad/anlp-m26-assignment1/runs/hjdz8w7q
- Proyecto W&B: https://wandb.ai/satyam-arora-iiit-hyderabad/anlp-m26-assignment1
