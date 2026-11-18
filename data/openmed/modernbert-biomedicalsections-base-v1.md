# OpenMed/ModernBERT-BiomedicalSections-Base-v1

## Resumen

ModernBERT-BiomedicalSections-Base-v1 es un modelo de clasificación de texto desarrollado por OpenMed, un proyecto que publica modelos abiertos para el procesamiento de texto clínico y biomédico con ejecución local. El modelo recibe una única frase en inglés procedente del resumen (abstract) de un artículo biomédico y le asigna una de cinco etiquetas estructurales: `BACKGROUND`, `OBJECTIVE`, `METHODS`, `RESULTS` o `CONCLUSIONS`, junto con una puntuación de confianza. Resuelve el problema de la estructuración automática de resúmenes científicos sin encabezados explícitos, una tarea relevante para la extracción de evidencia en medicina basada en la evidencia.

Se trata de un ajuste fino (fine-tuning) del modelo base `answerdotai/ModernBERT-base`, una arquitectura transformer encoder de tipo ModernBERT con 149,6 millones de parámetros. El modelo está pensado para inferencia en CPU y para integrarse en pipelines de procesamiento documental, lo que lo hace adecuado para entornos con recursos limitados o requisitos de privacidad que impiden el envío de datos a servicios externos.

Su relevancia actual radica en la creciente necesidad de herramientas ligeras y abiertas para la minería de literatura científica, en un contexto donde los grandes modelos generativos resultan costosos para tareas de clasificación estructurada. La licencia Apache-2.0 facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.608.709 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura transformer de tipo encoder que incorpora mejoras sobre BERT clásico, como atención con rotaciones posicionales y capas de atención optimizadas para secuencias largas. El modelo parte de los pesos de `answerdotai/ModernBERT-base` y se ajusta mediante aprendizaje supervisado para una tarea de clasificación de cinco clases sobre frases individuales de resúmenes biomédicos.

Los datos de entrenamiento y evaluación proceden de frases de resúmenes de ensayos controlados aleatorizados de PubMed. La evaluación se realizó sobre un conjunto de retención (held-out) de 5.976 frases correspondientes a 500 resúmenes. Cada frase se procesó sin encabezado, sin frases vecinas y sin información de posición en el resumen, de modo que el modelo aprende a clasificar a partir únicamente del contenido léxico y semántico de la propia frase. La model card no detalla el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO, que en cualquier caso no resultan habituales en tareas de clasificación supervisada.

## Capacidades

- Clasificación de frases de resúmenes biomédicos en cinco secciones estructurales: `BACKGROUND`, `OBJECTIVE`, `METHODS`, `RESULTS` y `CONCLUSIONS`.
- Salida de una etiqueta y una puntuación softmax sobre las cinco clases, útil para ordenar y filtrar predicciones.
- Procesamiento frase a frase, adecuado para integrarse en pipelines de segmentación de texto previa.
- Ejecución en CPU, sin necesidad de GPU, gracias a su tamaño contenido y a la arquitectura encoder.
- Integración con la librería `transformers` mediante el pipeline `text-classification`.
- Compatibilidad con el SDK de OpenMed (`openmed`), que incluye utilidades de segmentación de frases.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido; es un clasificador especializado, no un modelo generativo.

## Casos de uso

- Estructuración automática de resúmenes científicos: dado un abstract de PubMed sin encabezados, el modelo etiqueta cada frase para reconstruir las secciones del resumen, facilitando la indexación y la lectura rápida por parte de revisores y sistemas de búsqueda.
- Extracción de evidencia en revisiones sistemáticas: los equipos de síntesis de evidencia pueden filtrar automáticamente las frases de `RESULTS` y `CONCLUSIONS` para priorizar la lectura de los hallazgos relevantes en grandes volúmenes de literatura.
- Construcción de bases de datos biomédicas estructuradas: el modelo permite poblar campos estructurados (objetivo, métodos, resultados) a partir de texto libre, alimentando bases de datos como PubMed o repositorios internos de una institución.
- Preprocesamiento para pipelines de minería de texto: al separar las frases por sección, los sistemas posteriores de extracción de entidades o relaciones pueden aplicar reglas distintas según el contexto estructural de cada frase.
- Análisis de calidad de resúmenes: editores y revisores pueden comprobar si un resumen enviado contiene las secciones esperadas y si cada frase está correctamente ubicada según su contenido.
- Procesamiento local con requisitos de privacidad: al ejecutarse en CPU y no requerir servicios externos, puede desplegarse en entornos hospitalarios o institucionales donde los textos no pueden salir de la infraestructura propia.
- Filtrado y enrutamiento documental: en un sistema de gestión de publicaciones, el modelo puede clasificar frases para decidir qué documentos requieren revisión manual o qué secciones deben destacarse en un visor.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el conjunto de retención de frases de resúmenes de ensayos controlados aleatorizados de PubMed (5.976 frases, 500 resúmenes):

| Metrica | Valor |
|---|---|
| Macro-F1 (cinco secciones) | 80,3 |
| Accuracy | 86,3 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (149,6 millones de parámetros, aproximadamente 0,6 GB en pesos safetensors); en la práctica puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera la inferencia, pero no es necesaria.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, servidor `text-embeddings-inference` (el modelo incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), y el SDK `openmed`. No se indica compatibilidad con llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo se basa en `answerdotai/ModernBERT-base` (149,6 millones de parámetros, licencia Apache-2.0), pero no se han publicado comparaciones de rendimiento frente a otros clasificadores de secciones de resúmenes biomédicos.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-BiomedicalSections-Base-v1 | 149,6 M | no disponible | Clasificación de secciones de abstracts | Apache-2.0 | Hugging Face |
| answerdotai/ModernBERT-base | no disponible | no disponible | Modelo base encoder | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo admite inglés; no está entrenado ni evaluado para otros idiomas.
- Está diseñado para clasificar frases individuales sin encabezado, sin frases vecinas y sin posición en el resumen; pasar el abstract completo o frases con encabezados puede degradar el rendimiento.
- La etiqueta `OBJECTIVE` es la más débil del modelo, según reconoce la propia model card; en el ejemplo de la documentación, una frase de objetivo se clasifica erróneamente como `BACKGROUND`.
- Las puntuaciones de salida son un softmax sobre cinco clases y no están calibradas como probabilidades; deben interpretarse como rankings, no como confianza absoluta.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en frases ambiguas o con estructura atípica.
- No se han publicado análisis de sesgos en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni compromisos de mantenimiento.
- El número de descargas es muy bajo (4 en el momento de la consulta), lo que sugiere poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/ModernBERT-BiomedicalSections-Base-v1
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT (arXiv:2412.13663): https://arxiv.org/abs/2412.13663
- Paper referenciado en las etiquetas (arXiv:2508.01630): https://arxiv.org/abs/2508.01630
- OpenMed en X: https://x.com/OpenMed_AI
