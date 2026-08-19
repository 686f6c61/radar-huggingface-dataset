# Ankit-9335/newsmorph-fake-news-detector

## Resumen

El modelo `Ankit-9335/newsmorph-fake-news-detector` es un clasificador de noticias falsas basado en la arquitectura DistilBERT, desarrollado por el usuario Ankit-9335 y publicado en HuggingFace con licencia Apache 2.0. Con 66.955.010 parámetros (aproximadamente 67 millones), se alinea con el tamaño típico de DistilBERT base, un transformer encoder destilado que reduce el coste computacional respecto a BERT manteniendo buena parte de su rendimiento. El nombre "newsmorph" sugiere que está orientado a la detección de desinformación, aunque la model card no proporciona detalles sobre el entrenamiento, el dataset utilizado ni el pipeline de inferencia.

El modelo es relevante en el contexto actual de proliferación de noticias falsas y desinformación en medios digitales, donde herramientas automáticas de clasificación pueden ayudar a moderar contenidos. Sin embargo, la falta de información publicada sobre su entrenamiento y evaluación limita su aplicabilidad directa en producción sin una validación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (según tag, no confirmado en model card) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (DistilBERT típicamente 512 tokens, sin confirmar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que emplea un transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención (configuración estándar de DistilBERT base). El tag `distilbert` en HuggingFace respalda esta arquitectura, aunque la model card no ofrece confirmación explícita de la configuración interna ni del proceso de destilación aplicado.

No se dispone de información sobre el entrenamiento: ni el número de tokens, ni la composición del dataset (presumiblemente noticias etiquetadas como reales o falsas), ni si se aplicaron técnicas como fine-tuning supervisado, RLHF o DPO. La ausencia de estos datos impide evaluar la calidad del ajuste y la generalización del modelo.

## Capacidades

- Clasificación de texto binaria: el modelo está diseñado para distinguir entre noticias reales y falsas (inferido del nombre y del propósito declarado, aunque no hay documentación explícita).
- Procesamiento de lenguaje natural en inglés u otros idiomas: no especificado, por lo que el soporte multilingüe es incierto.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Moderación de contenido en plataformas de noticias: el modelo puede integrarse en pipelines de verificación automática para etiquetar artículos sospechosos antes de su publicación, siempre que se valide su precisión con datos propios.
- Análisis de redes sociales: podría utilizarse para filtrar publicaciones que contengan desinformación, aunque requeriría adaptación al lenguaje informal y a la brevedad de los mensajes.
- Asistencia a fact-checkers: como herramienta de triaje para priorizar artículos que necesitan revisión humana, reduciendo el volumen de trabajo manual.
- Investigación académica: como punto de partida para estudios sobre detección de fake news, comparándolo con otros modelos de referencia.
- Prototipos de demostración: útil para crear demos interactivas que muestren el funcionamiento de un clasificador de noticias falsas.
- Educación y concienciación: en aplicaciones educativas para ilustrar cómo la IA puede ayudar a identificar desinformación.

Nota: estos casos son inferencias razonables basadas en el propósito del modelo, pero no están respaldados por documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de precisión, recall, F1 ni comparaciones con otros modelos de detección de fake news.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~67M parámetros, la inferencia en FP32 requiere aproximadamente 0,27 GB de memoria (67M × 4 bytes). Con cuantización a int8, se reduce a ~0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). También puede ejecutarse en CPU con razonable latencia.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: se puede servir con HuggingFace Transformers, ONNX Runtime, o convertirlo a GGUF para usarlo con llama.cpp u Ollama. También es compatible con vLLM, aunque no es óptimo para modelos tan pequeños.
- Latencia y throughput: no hay datos publicados; en una CPU moderna se esperan decenas de milisegundos por inferencia, y en GPU, milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. No hay datos de rendimiento publicados para este modelo, ni se conocen modelos comparables específicos de detección de fake news con los que contrastarlo. Se recomienda al usuario evaluar el modelo frente a alternativas como `roberta-base` fine-tuned para clasificación de noticias, o modelos dedicados como `fake-news-detector` de otros autores, pero sin datos cuantitativos no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- No hay información sobre sesgos o comportamiento en dominios específicos; el modelo podría tener un rendimiento desigual según el tema o el idioma.
- Riesgo de alucinación: al ser un clasificador, el riesgo de alucinación se manifiesta en falsos positivos o negativos, es decir, clasificaciones erróneas.
- Limitaciones de contexto: DistilBERT tiene una ventana de contexto típica de 512 tokens, por lo que artículos largos deberán truncarse o dividirse.
- Idioma: no se especifica el idioma de entrenamiento; si solo fue entrenado en inglés, su uso en otros idiomas será poco fiable.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero al no haber documentación sobre los datos de entrenamiento, podrían existir problemas de atribución o derechos sobre los datos subyacentes.
- Para producción, es imprescindible validar el modelo con un conjunto de datos propio y medir su rendimiento antes de implementarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Ankit-9335/newsmorph-fake-news-detector)
- [Perfil del autor en HuggingFace](https://huggingface.co/Ankit-9335)
