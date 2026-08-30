# Kristo4/bilingvalny-chat-bezpecnostny-klasifikator

## Resumen

El modelo `bilingvalny-chat-bezpecnostny-klasifikator` es un clasificador de texto basado en la arquitectura DistilBERT multilingüe, desarrollado por Kristo4. Se presenta como un modelo de clasificación de texto para la moderación de seguridad en chats, según su nombre en eslovaco ("bilingvalny" significa bilingüe y "bezpecnostny" significa de seguridad). Está diseñado para clasificar mensajes en entornos de conversación, aunque la información oficial no especifica el número de clases ni el idioma exacto de entrenamiento.

El modelo es un fine-tuning de `distilbert-base-multilingual-cased` sobre un conjunto de datos no identificado (la model card indica "None dataset"). Con 135,3 millones de parámetros, hereda la capacidad multilingüe del modelo base, que soporta 104 idiomas, aunque el ajuste fino podría haber reducido ese rango a dos idiomas concretos. La licencia Apache 2.0 permite uso comercial sin restricciones.

A pesar de su escasa documentación y de no haber benchmarks públicos, el modelo reporta una precisión del 98,86% en su conjunto de evaluación, lo que sugiere un buen rendimiento en la tarea específica para la que fue entrenado. Su tamaño moderado lo hace adecuado para despliegues en entornos con recursos limitados, tanto en CPU como en GPU de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 135.326.210 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base) |
| Tipos de cuantizacion | No disponible (solo se distribuye en safetensors con precisión completa) |
| Idiomas soportados | No disponible (el modelo base soporta 104 idiomas; el fine-tuning no especifica cuáles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que reduce el número de capas de 12 a 6 manteniendo la misma dimensionalidad oculta (768). Esta arquitectura fue diseñada para conservar aproximadamente el 95% del rendimiento de BERT con un 40% menos de parámetros y una inferencia un 60% más rápida. El modelo base `distilbert-base-multilingual-cased` fue preentrenado con destilación sobre un corpus multilingüe que cubre 104 idiomas, utilizando tokenización subpalabra con WordPiece.

El fine-tuning se realizó con el Trainer de HuggingFace sobre un conjunto de datos no documentado. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 3e-05, un tamaño de lote de 2 con acumulación de gradiente de 4 pasos (lote efectivo de 8), y 5 épocas. Se utilizó el optimizador AdamW con betas (0.9, 0.999) y un scheduler lineal. La pérdida final de validación fue de 0.0284 y la precisión de 0.9886. No se menciona el uso de técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación de secuencias, probablemente binaria (seguro/inseguro) o multiclase, aunque no se especifica el número de etiquetas.
- Soporte multilingüe: al derivar de DistilBERT multilingüe, puede procesar texto en muchos idiomas, aunque el fine-tuning podría haber limitado esta capacidad a un subconjunto.
- Inferencia eficiente: al ser una versión destilada, ofrece baja latencia y es adecuado para aplicaciones en tiempo real.
- Compatibilidad con pipelines de HuggingFace: se puede usar directamente con `pipeline("text-classification")` o con la API de transformers.
- Soporte para Text Embeddings Inference: el tag `text-embeddings-inference` sugiere compatibilidad con servidores de embeddings, aunque no se detalla su uso.

## Casos de uso

- Moderación de contenido en plataformas de chat: el modelo puede clasificar mensajes de usuarios como apropiados o inapropiados en tiempo real. Su baja latencia permite integrarlo en sistemas de mensajería para filtrar contenido no deseado antes de que llegue a otros usuarios.
- Filtrado de comentarios en redes sociales: se puede desplegar como un servicio REST que reciba comentarios y devuelva una etiqueta de seguridad, permitiendo automatizar la revisión de contenido generado por usuarios.
- Detección de toxicidad en foros y comunidades online: al ser multilingüe, podría aplicarse a comunidades que usan varios idiomas, aunque se debe verificar qué idiomas cubre realmente el fine-tuning.
- Análisis de conversaciones en atención al cliente: el modelo puede etiquetar interacciones de soporte como seguras o problemáticas, ayudando a priorizar revisiones humanas.
- Clasificación de mensajes en videojuegos multijugador: integrado en el backend del juego, puede detectar lenguaje abusivo en el chat de voz o texto y tomar acciones automáticas.
- Evaluación de contenido generado por IA: como clasificador de seguridad, puede usarse como un filtro de salida para modelos generativos, verificando que las respuestas no contengan contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La única métrica reportada es la precisión sobre el conjunto de evaluación del propio autor, que se muestra a continuación.

| Métrica | Valor |
|---|---|
| Pérdida de validación | 0.0284 |
| Precisión | 0.9886 |

Estos resultados corresponden al conjunto de evaluación utilizado durante el entrenamiento, que no está descrito. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 135 millones de parámetros. En precisión float32, ocupa aproximadamente 540 MB; en float16, unos 270 MB. Esto permite ejecutarlo en GPUs con al menos 1 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Una RTX 3060 o superior ofrecería un margen cómodo y baja latencia.
- CPU: puede ejecutarse en CPU, aunque con mayor latencia. Un procesador moderno de 4 núcleos puede manejar inferencias en decenas de milisegundos por muestra.
- Opciones de despliegue: compatible con HuggingFace pipelines, Transformers, y servidores de inferencia como vLLM o TGI (aunque estos están optimizados para generación, también soportan clasificación). También se puede exportar a ONNX para optimización en CPU.
- Latencia y throughput: no hay datos publicados. Para un modelo de este tamaño, se puede esperar una latencia de 10-30 ms por muestra en GPU y 50-150 ms en CPU, dependiendo del hardware y la longitud del texto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría (clasificadores de seguridad multilingües). El único punto de referencia es el modelo base `distilbert-base-multilingual-cased`, que tiene el mismo número de parámetros pero sin fine-tuning específico. Otros clasificadores de toxicidad como `unitary/toxic-bert` o `facebook/bart-large-mnli` existen, pero no se dispone de datos de rendimiento comparables en este contexto. Se recomienda evaluar el modelo en el conjunto de datos propio antes de usarlo en producción.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe el dataset de entrenamiento, las etiquetas utilizadas ni los idiomas cubiertos. Esto dificulta evaluar su idoneidad para casos de uso concretos.
- Posibles sesgos: al no conocerse los datos de entrenamiento, no se puede garantizar que el modelo sea imparcial. Podría tener sesgos de género, raza o idioma, especialmente si el dataset era reducido o desequilibrado.
- Riesgo de errores de clasificación: con una precisión declarada del 98,86%, existe un margen de error del 1,14% que podría resultar en falsos positivos o negativos en la moderación de contenido.
- Alcance multilingüe incierto: aunque el modelo base soporta 104 idiomas, el fine-tuning podría haberlo limitado a dos. Se debe verificar experimentalmente qué idiomas maneja correctamente.
- Sin garantías para producción: al no haber benchmarks externos ni pruebas de robustez, no se recomienda su uso en sistemas críticos sin una evaluación exhaustiva previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Kristo4/bilingvalny-chat-bezpecnostny-klasifikator)
- [Perfil del autor en HuggingFace](https://huggingface.co/Kristo4)
