# Mahganj123/gwadarvoice-xlmr-complaints

## Resumen

GwadarVoice-xlmr-complaints es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) de `FacebookAI/xlm-roberta-base` sobre un conjunto de datos propio de quejas cívicas redactadas en roman urdu e inglés, con mezcla de códigos (code-mixing). Lo desarrolla el usuario Mahganj123 y su propósito es asignar cada queja a una de seis categorías de servicio municipal: electricidad, basura, sanidad, carreteras, seguridad y agua. El nombre remite a Gwadar, ciudad costera de Pakistán, lo que sitúa el caso de uso en la administración local de esa región.

Técnicamente es un transformer encoder de tipo XLM-RoBERTa con 278.048.262 parámetros totales, pensado para clasificación multilingüe y para texto informal no normalizado (transliteración latina del urdu mezclada con inglés). No es un modelo generativo ni un modelo de razonamiento: su salida es una etiqueta de categoría sobre un texto de entrada, lo que lo hace adecuado para tareas de enrutado y triaje de reclamaciones.

Su relevancia es acotada pero específica: cubre un nicho poco atendido (roman urdu code-mixed en el dominio cívico) y se publica con licencia MIT, lo que permite reutilización comercial. La propia model card advierte de que se trata de un proyecto educativo entrenado mayoritariamente con datos sintéticos generados por plantilla, por lo que su valor principal es como punto de partida y no como sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), fine-tuning para clasificación de secuencias |
| Parametros totales | 278.048.262 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base admite 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, ur (con texto roman urdu y code-mixed ingles-roman urdu) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas de salida | Electricity, Garbage, Healthcare, Roads, Security, Water (6 clases) |
| Modelo base | FacebookAI/xlm-roberta-base |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa en su variante base: un encoder transformer con atención bidireccional completa y tokenizador SentencePiece entrenado sobre corpus multilingües. Sobre ese backbone se ha añadido una cabeza de clasificación (pooler más capa lineal) que proyecta la representación del token `<s>` a las seis categorías del dominio. El número de parámetros declarado (278 millones) es coherente con un XLM-R base más la cabeza de clasificación.

El entrenamiento se realizó sobre un dataset propio del autor, descrito como una combinación de quejas generadas por plantilla y quejas escritas manualmente. No se documentan en la información disponible el número de ejemplos, la proporción entre datos sintéticos y reales, la distribución por clase, la longitud de los textos, ni si se aplicaron técnicas de aumento de datos, ponderación de clases o validación cruzada. Tampoco se especifican hiperparámetros de ajuste fino (learning rate, épocas, batch size) ni si hubo una fase de validación contra quejas reales. La model card califica explícitamente el proyecto como educativo y reconoce el predominio de datos sintéticos, lo que condiciona la fiabilidad del clasificador en dominios reales.

## Capacidades

- Clasificación de texto en seis categorías de queja cívica: electricidad, basura, sanidad, carreteras, seguridad y agua.
- Procesamiento de roman urdu (urdu transliterado al alfabeto latino) y de texto code-mixed inglés-roman urdu.
- Manejo de texto informal, con ortografía no normalizada y mezcla de idiomas dentro de la misma frase, gracias al tokenizador multilingüe del modelo base.
- Salida de una única etiqueta por documento (clasificación multiclase de documento completo, no por token).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni modos de pensamiento (thinking).
- No dispone de capacidades de visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada a los dos idiomas declarados (en, ur); el backbone XLM-R tiene cobertura más amplia, pero el ajuste fino restringe el comportamiento útil al dominio entrenado.

## Casos de uso

- Triaje de reclamaciones ciudadanas en un portal municipal: el modelo recibe el texto libre de la queja y devuelve la categoría, que se usa para enrutar el ticket al departamento correspondiente (electricidad, agua, saneamiento, etc.) sin intervención manual.
- Preetiquetado en un flujo de atención al ciudadano: se clasifican automáticamente los mensajes entrantes de un chat o formulario web y se priorizan por categoría antes de que un operador humano los revise.
- Análisis de volumen de quejas por servicio: agregando las predicciones sobre un lote de reclamaciones históricas se obtiene una distribución de incidencias por área, útil para informes de gestión municipal.
- Filtrado y deduplicación temática: agrupar quejas por categoría para detectar picos anómalos (por ejemplo, un aumento súbito de quejas de agua) y activar alertas operativas.
- Enrutado en aplicaciones de mensajería comunitaria: integrado como paso previo en un bot de WhatsApp o Telegram para dirigir el mensaje al formulario o al equipo adecuado.
- Etiquetado asistido para construir corpus: usar las predicciones como sugerencia en una herramienta de anotación humana, acelerando la creación de un dataset etiquetado de quejas cívicas en roman urdu.
- Prototipado e investigación sobre NLP de bajo recurso: sirve como línea base para experimentos con roman urdu code-mixed, dado que hay pocos modelos públicos en este dominio y el checkpoint es reutilizable con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de accuracy, F1, precision ni recall, ni por clase ni globales, ni comparaciones con otras aproximaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (tamaño del repositorio en safetensors); en fp16 alrededor de 0,6 GB, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece margen amplio para lotes grandes.
- Cabe holgadamente en GPU de consumo: RTX 3050, RTX 3060, RTX 4060, GTX 1660 y similares; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, Text Embeddings Inference (TEI) para clasificación, ONNX Runtime, o exportación a un runtime ligero; no se documentan artefactos GGUF ni compatibilidad con llama.cpp u Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia arquitectónica, un encoder de 278 millones de parámetros procesa lotes de secuencias cortas en decenas de milisegundos por lote en una GPU moderna, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GwadarVoice-xlmr-complaints | 278 M | no disponible (base: 512) | Clasificación de quejas cívicas (6 clases) | en, ur (roman urdu) | MIT | Hugging Face, 0 descargas |
| FacebookAI/xlm-roberta-base | 278 M | 512 | Modelo base multilingüe (representaciones) | 100 idiomas | MIT | Hugging Face, ampliamente usado |
| Modelos de clasificación de sentimiento multilingües basados en XLM-R | ~278 M | 512 | Clasificación genérica (sentimiento, tema) | multilingüe | variable | Hugging Face |
| Clasificadores específicos de roman urdu | no disponible | no disponible | Clasificación de texto roman urdu | ur (roman) | variable | escasa disponibilidad pública |

La comparación directa con alternativas es limitada: no se conocen en la información proporcionada clasificadores públicos de quejas cívicas en roman urdu con los que contrastar métricas. El modelo base XLM-RoBERTa es la referencia natural de arquitectura y tamaño, pero no resuelve la tarea sin un ajuste fino adicional.

## Limitaciones y advertencias

- Entrenamiento mayoritariamente sintético: la model card indica que los datos son en su mayoría generados por plantilla, lo que puede producir un sesgo hacia las formulaciones vistas en entrenamiento y un rendimiento pobre ante quejas reales con vocabulario, longitud o estructura atípicos.
- Sin métricas publicadas: no hay accuracy, F1 ni matriz de confusión, por lo que no es posible evaluar la calidad del clasificador antes de desplegarlo; es imprescindible validarlo con datos propios.
- Riesgo de clasificación errónea en textos largos: el autor advierte explícitamente de menor precisión en quejas muy largas o inusuales; además, el límite de 512 tokens del backbone trunca documentos extensos.
- Cobertura lingüística restringida: aunque el backbone es multilingüe, el ajuste fino está orientado a roman urdu e inglés; el rendimiento en urdu escrito en alfabeto árabe o en otros idiomas no está documentado.
- Sesgo geográfico y de dominio: el modelo está construido en torno a Gwadar y a seis servicios municipales concretos; no generaliza a otras ciudades ni a otras categorías de reclamación sin reentrenamiento.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de falsos positivos y falsos negativos con confianza alta, dado que no se documenta calibración de probabilidades.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene conservar el aviso de copyright y verificar las condiciones del modelo base XLM-RoBERTa, también MIT.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento posterior.
- Proyecto educativo: el propio autor lo califica así, por lo que no debería usarse como único sistema de decisión en un flujo crítico de atención ciudadana sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mahganj123/gwadarvoice-xlmr-complaints
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Repositorio de fairseq (implementación original de XLM-R): https://github.com/facebookresearch/fairseq
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
