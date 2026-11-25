# Kaspar/anti-scraping_best_model_modernbert_sentence

## Resumen

El modelo `Kaspar/anti-scraping_best_model_modernbert_sentence` es un clasificador binario de frases especializado en detectar cláusulas anti-scraping dentro de los términos de servicio de plataformas en línea. Lo desarrolla el usuario Kaspar y se obtiene mediante fine-tuning del modelo encoder `answerdotai/ModernBERT-base`, una arquitectura transformer bidireccional de la familia ModernBERT publicada por Answer.AI. Su función es determinar, para una frase concreta, si pertenece (etiqueta 1) o no (etiqueta 0) a una cláusula que prohíbe o restringe el scraping automatizado de contenido.

El modelo resuelve un problema muy concreto dentro del análisis legal y de cumplimiento normativo: la revisión automatizada de condiciones de servicio para identificar restricciones sobre extracción de datos. Con 149.606.402 parámetros y un repositorio de 0,6 GB, es un modelo compacto pensado para inferencia rápida en pipelines de clasificación de texto, no para generación. Su relevancia actual radica en la creciente necesidad de auditar a escala los términos legales de sitios web antes de construir sistemas de recolección de datos.

La información publicada es limitada: la model card describe el propósito, los datos de entrenamiento y las métricas de test, pero no detalla la licencia, los idiomas soportados ni la composición completa del dataset. El modelo se distribuye en formato safetensors y es compatible con Text Embeddings Inference y con endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; el dato no se explicita en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto (text-classification) |
| Etiquetas | Binaria: 1 = frase de clausula anti-scraping, 0 = resto |
| Modelo base | answerdotai/ModernBERT-base |
| Tamano del repositorio | 0,6 GB |
| Libreria | transformers |
| Compatibilidad de despliegue | Text Embeddings Inference, endpoints compatibles |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional de la familia ModernBERT que incorpora mejoras sobre BERT clásico, como atención con RoPE y alternancia de capas de atención global y local para manejar contextos largos con eficiencia. Sobre esa base se añade una cabeza de clasificación de secuencia para producir una probabilidad binaria por frase. El resultado es un clasificador de 149,6 millones de parámetros, adecuado para inferencia de baja latencia.

El entrenamiento se realizó con el fichero `anti-scraping_annotations.csv`, compuesto por frases etiquetadas por modelos de Claude, con una etiqueta por frase distinta. El conjunto contiene 1293 ejemplos de entrenamiento y 229 de test (el 15 % de las frases distintas). No se especifica en la información disponible si hubo aumento de datos, balanceo de clases, número de épocas, hiperparámetros de entrenamiento ni si se aplicaron técnicas de regularización. Tampoco se documenta la proporción de clases positivas y negativas en el dataset. Los parámetros de aplicación del modelo se recogen en el fichero `classifier_config.json` del repositorio.

## Capacidades

- Clasificación binaria de frases: determina si una frase pertenece a una cláusula anti-scraping en términos de servicio.
- Procesamiento de frases individuales: la entrada esperada es únicamente la frase objetivo, sin contexto adicional.
- Integración con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad con Text Embeddings Inference para despliegue como servicio de clasificación.
- Compatibilidad con endpoints de Hugging Face.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni de agentes.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Auditoría de términos de servicio a escala: dado un corpus de condiciones legales de plataformas, el modelo clasifica cada frase y permite aislar automáticamente las cláusulas que restringen el scraping, facilitando la revisión por parte de equipos legales.
- Cumplimiento normativo en proyectos de recolección de datos: antes de lanzar un crawler sobre un conjunto de sitios, se procesan sus términos y se genera un informe de restricciones por dominio, usando el clasificador como primer filtro.
- Construcción de un corpus etiquetado de cláusulas anti-scraping: el modelo sirve para preetiquetar grandes volúmenes de frases legales y reducir el esfuerzo de anotación manual en investigaciones sobre prácticas de plataformas.
- Monitorización de cambios en condiciones de servicio: integrado en un pipeline que descarga y segmenta los términos periódicamente, el clasificador detecta cuándo aparece una nueva cláusula anti-scraping o se modifica una existente.
- Enriquecimiento de bases de datos legales: clasificación de frases extraídas de contratos y políticas de uso para poblar campos estructurados sobre restricciones de extracción de datos.
- Filtrado previo en sistemas de análisis documental: descartar o marcar frases irrelevantes antes de pasarlas a modelos de lenguaje de mayor tamaño, reduciendo coste y latencia en el análisis de documentos legales extensos.
- Investigación académica sobre términos de servicio: análisis cuantitativo de la prevalencia de cláusulas anti-scraping en distintos sectores y su evolución temporal.

## Benchmarks y rendimiento

Métricas de test publicadas en la model card (conjunto de test de 229 ejemplos):

| Metrica | Valor |
|---|---|
| Accuracy | 0,991 |
| Precision | 0,96 |
| Recall | 0,96 |
| F1 | 0,96 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 149,6 millones de parámetros; aproximadamente 0,3-0,6 GB en fp16 o int8, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; una RTX 4090, A100 o H100 es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaspar/anti-scraping_best_model_modernbert_sentence | 149,6 M | Clasificacion binaria anti-scraping | no disponible | no disponible | Hugging Face |
| answerdotai/ModernBERT-base | no disponible en la informacion | Encoder base (fine-tuning) | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| BERT-base | no disponible en la informacion | Encoder base (fine-tuning) | no disponible en la informacion | no disponible en la informacion | Hugging Face |

No se dispone de modelos comparables específicos para la tarea de clasificación de cláusulas anti-scraping en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento fueron etiquetados por modelos de Claude, no por anotadores humanos expertos en derecho; pueden contener errores de etiquetado o sesgos propios del modelo anotador.
- El conjunto de test es pequeño (229 ejemplos) y las métricas pueden no generalizar a dominios, idiomas o estilos de redacción legal distintos de los del corpus de entrenamiento.
- El modelo clasifica frases aisladas sin contexto: una cláusula anti-scraping puede depender de frases adyacentes, lo que puede provocar falsos negativos o falsos positivos.
- No se documentan los idiomas soportados; es probable que el entrenamiento se haya realizado en inglés, pero este dato no se confirma.
- No se especifica la licencia, por lo que el uso comercial queda sujeto a verificación previa con el autor.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas en frases ambiguas o con vocabulario legal poco frecuente.
- El modelo no sustituye la revisión legal profesional; sus salidas deben tratarse como señales de apoyo, no como dictamen jurídico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaspar/anti-scraping_best_model_modernbert_sentence
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
