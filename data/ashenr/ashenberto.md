# AshenR/AshenBERTo

## Resumen

AshenBERTo es un modelo de lenguaje basado en la arquitectura RoBERTa, desarrollado por Ashen Ranaweera para el idioma cingalés (Sinhala), una lengua de bajo recurso hablada principalmente en Sri Lanka. El modelo se creó para paliar la falta de modelos preentrenados de calidad en este idioma, ofreciendo una representación semántica adaptada a tareas de procesamiento del lenguaje natural como análisis de sentimiento, traducción automática, reconocimiento de entidades nombradas o respuesta a preguntas.

El modelo se entrenó sobre la mitad del dataset de FastText y presenta una perplejidad de 3,5 en el conjunto de validación, lo que indica un buen ajuste a la lengua cingalesa. Con un total de 58,9 millones de parámetros, es una arquitectura compacta de 6 capas ocultas y 12 cabezas de atención, con un vocabulario de 25.000 tokens y una longitud máxima de contexto de 514 posiciones. Se publica bajo licencia desconocida y está disponible en formato safetensors, listo para su uso con la librería transformers.

La relevancia de AshenBERTo reside en su contribución a un idioma con escasez de recursos lingüísticos digitales. Su tamaño reducido permite su ejecución en hardware modesto, facilitando su integración en aplicaciones académicas y comerciales orientadas al cingalés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 58.896.416 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 514 posiciones (512 utiles + 2 especiales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cingales (si) |
| Licencia | unknown |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AshenBERTo sigue la arquitectura RoBERTa original, un transformer encoder con 6 capas ocultas, 12 cabezas de atención, una dimensión oculta de 768 y un vocabulario de 25.000 tokens. El modelo se preentrena con el objetivo de masked language modeling (MLM), donde el token enmascarado debe predecirse a partir del contexto circundante, una técnica que permite capturar representaciones contextuales bidireccionales.

El entrenamiento se realizó sobre la mitad del dataset de FastTexts, que contiene textos procedentes de rastreos web en cingalés. No se dispone del número exacto de tokens utilizados en el preentrenamiento, pero la perimetría reportada de 3,5 sugiere un ajuste razonable a la distribución del idioma. El modelo no emplea técnicas de alineación como RLHF o DPO, ni presenta innovaciones estructurales más allá de la configuración estándar de RoBERTa.

## Capacidades

- Generación de texto enmascarado (fill-mask): predice tokens ocultos en frases cingalesas.
- Representaciones semánticas: los embeddings del modelo pueden extraerse y usarse como características para tareas posteriores como similitud de frases o clasificación.
- Soporte de tool calling: no disponible, es un modelo encoder sin capacidad de generación autorregresiva.
- Soporte de agentes y multi-step reasoning: no aplicable.
- Capacidades multilingües: no, el modelo se entrena exclusivamente para cingalés.
- Capacidades especiales: optimizado para similitud semántica en cingalés, como se describe en el paper asociado.

## Casos de uso

- **Análisis de sentimiento en cingalés**: el modelo puede servir como extractor de características para clasificar opiniones en redes sociales o reseñas de productos, entrenando un clasificador ligero sobre sus representaciones.
- **Similitud semántica de frases**: AshenBERTo se ha validado específicamente para esta tarea, permitiendo comparar pares de frases cingalesas y medir su similitud, útil en sistemas de búsqueda o deduplicación de contenidos.
- **Reconocimiento de entidades nombradas (NER)**: los embeddings del modelo pueden alimentar un clasificador de secuencias para identificar nombres de personas, lugares u organizaciones en texto cingalés.
- **Traducción automática como componente auxiliar**: las representaciones del modelo pueden usarse como características adicionales en sistemas de traducción neuronal para mejorar la calidad en el par cingalés-inglés.
- **Sistemas de respuesta a preguntas**: al ser un encoder bidireccional, puede integrarse en arquitecturas de extracción de respuestas sobre documentos cingaleses, aunque requiere un ajuste fino con datos anotados.
- **Clasificación de documentos**: para categorizar artículos o noticias en cingalés por temas, aprovechando la capacidad del modelo para entender el contexto completo de un texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la perimetría de 3,5 en el conjunto de validación del preentrenamiento, lo que indica una baja incertidumbre del modelo al predecir tokens enmascarados en cingalés. Para tareas de similitud semántica, el paper asociado (publicado en Springer) reporta resultados favorables, pero no se han extraído los valores numéricos en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: con 58,9 millones de parámetros, el modelo en FP32 ocupa aproximadamente 235 MB. En cuantización INT8 (no publicada oficialmente, pero posible con herramientas como bitsandbytes) ocuparía unos 59 MB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas consumer como GTX 1650, RTX 2060 o incluso CPU para tareas de inferencia puntuales.
- **Cabe en consumer GPU**: sí, sin problema.
- **Opciones de despliegue**: se puede servir con Hugging Face Inference Endpoints, o mediante librerías como FastAPI con la pipeline de transformers. Para integraciones más ligeras, se puede exportar a ONNX o convertir a GGUF para su uso con llama.cpp.
- **Latencia y throughput**: no se han publicado mediciones específicas. Dado el tamaño pequeño del modelo, se espera una latencia de milisegundos por predicción en GPU moderna y de pocos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AshenBERTo | 58,9 M | 512 | cingalés | unknown | Hugging Face |
| SinRoberta | no disponible | no disponible | cingalés | no disponible | Hugging Face |
| XLM-RoBERTa base | 278 M | 512 | multilingüe (incluye cingalés) | MIT | Hugging Face |

AshenBERTo es notablemente más pequeño que XLM-RoBERTa base, lo que permite un despliegue más ligero. Sin embargo, XLM-RoBERTa base, aunque tiene más parámetros, cubre el cingalés dentro de un espectro multilingüe, lo que puede resultar en representaciones menos especializadas para este idioma. SinRoberta es otro modelo del mismo autor, con características similares, aunque no se dispone de datos técnicos detallados en esta ficha.

## Limitaciones y advertencias

- **Sesgos conocidos**: entrenado sobre datos de FastText, que provienen de rastreos web no filtrados, puede heredar sesgos presentes en el contenido cingalés de internet.
- **Riesgo de alucinación**: como modelo de masked language modeling, no genera texto libre; la alucinación no es aplicable en su uso principal. Sin embargo, si se usa como base para modelos de generación, puede heredar errores de representación.
- **Limitaciones de contexto**: la longitud máxima de 512 tokens restringe el procesamiento de documentos largos; se requiere truncamiento o estrategias de división.
- **Restricciones de licencia**: la licencia está marcada como "unknown", lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de desplegarlo en producción.
- **Cobertura lingüística limitada**: el modelo solo soporta cingalés, no es útil para otros idiomas.
- **Falta de benchmarks estandarizados**: no se han publicado evaluaciones completas en tareas como NER o clasificación, lo que limita la comparabilidad objetiva con otros modelos.

## Enlaces

- [Hugging Face - AshenR/AshenBERTo](https://huggingface.co/AshenR/AshenBERTo)
- [Paper: Custom Bidirectional Encoder Representations from Transformers (BERT) AshenBERTo for Semantic Similarity in Sinhala Language](https://link.springer.com/chapter/10.1007/978-3-032-23515-2_4)
- [PDF del paper](https://link.springer.com/content/pdf/10.1007/978-3-032-23515-2_4.pdf?pdf=inline%20link)
- [Perfil del autor en Hugging Face](https://huggingface.co/AshenR)
- [FastText crawl vectors](https://fasttext.cc/docs/en/crawl-vectors.html)
- [arXiv:1907.11692 (RoBERTa)](https://arxiv.org/abs/1907.11692)
