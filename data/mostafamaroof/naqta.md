# MostafaMaroof/Naqta

## Resumen

Naqta (نقطة, "punto" en árabe) es un modelo especializado en la restauración de puntuación en árabe estándar moderno (Modern Standard Arabic, MSA). Lo publica MostafaMaroof en Hugging Face bajo licencia Apache 2.0. Su función es recibir texto árabe sin puntuar (o con puntuación incompleta) y predecir los signos de puntuación que corresponden en cada posición del token. El repositorio contiene dos componentes: un modelo principal de clasificación de tokens basado en XLM-RoBERTa-large que predice ocho clases de signos, y un etiquetador de spans (`span-tagger/`) basado en XLM-RoBERTa-base que se ocupa de los guiones de interjección emparejados con esquema BIO.

El modelo resuelve un problema concreto y recurrente en el procesamiento del árabe: los corpus históricos, transcripciones y muchos textos digitales carecen de puntuación sistemática, lo que degrada tareas posteriores como el análisis sintáctico, la traducción automática o la síntesis de voz. Naqta se presenta como una solución ligera y desplegable frente a alternativas generativas de mayor coste computacional.

Con 558.849.032 parámetros en formato safetensors y un tamaño de repositorio de 10,1 GB, es un modelo de escala media que puede ejecutarse en hardware de consumo razonable. La model card reporta una mejora sustancial sobre la versión anterior (Macro F1 de 54,64 a 61,60 en un conjunto de evaluación de 91 pasajes anotados), aunque con limitaciones explícitas en ciertos signos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (modelo principal) + XLM-RoBERTa-base (span tagger) |
| Parametros totales | 558.849.032 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado sobre ventanas cortas; se recomienda inferencia con sliding window) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | ar (árabe estándar moderno) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente principal es un XLM-RoBERTa-large configurado como clasificador de tokens (`AutoModelForTokenClassification`) con ocho clases de puntuación. El segundo componente, alojado en la subcarpeta `span-tagger/`, es un XLM-RoBERTa-base con etiquetado BIO para detectar pares de guiones de interjección. Ambos se cargan por separado desde el mismo repositorio mediante `subfolder="span-tagger"`.

El entrenamiento del modelo principal se realizó sobre aproximadamente 1,3 millones de párrafos procedentes de libros clásicos y modernos, Wikipedia, noticias y corpus de preguntas y respuestas. Se emplearon tres técnicas destacables: función de pérdida focal ponderada (weighted focal loss) para compensar el desequilibrio entre clases, sobremuestreo de signos raros, y una etapa final de adaptación sobre datos conformes a una guía editorial de puntuación. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Restauración de puntuación en árabe estándar moderno: predice ocho clases de signos sobre texto sin puntuar.
- Etiquetado de spans para guiones de interjección emparejados mediante el modelo secundario BIO.
- Clasificación de tokens a nivel de token, apta para integrarse en pipelines de NLP como preprocesado.
- Inferencia con ventana deslizante (sliding window) para textos largos, con implementación de referencia en el Space del autor.
- Procesamiento de texto procedente de dominios variados: libros clásicos, prensa, Wikipedia y corpus de QA.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Preprocesado para pipelines de NLP árabe: insertar puntuación antes de análisis sintáctico, lematización o reconocimiento de entidades, de modo que los segmentadores y parsers dispongan de fronteras de frase fiables.
- Normalización de corpus históricos y literarios: libros clásicos digitalizados sin puntuación pueden procesarse por ventanas para obtener ediciones legibles y anotables.
- Preparación de datos para traducción automática: la puntuación de origen mejora la segmentación y la calidad de los sistemas de traducción entrenados con corpus paralelos.
- Síntesis de voz en árabe: la puntuación restaurada proporciona pausas y prosodia al motor TTS, que de otro modo leería el texto como una única secuencia continua.
- Transcripción y subtitulado: textos derivados de ASR o de fuentes orales pueden recibir puntuación para generar subtítulos legibles.
- Enriquecimiento de bases documentales y motores de búsqueda: la puntuación permite indexar por frases y mejorar el ranking y la presentación de fragmentos.
- Edición asistida: herramientas de corrección que sugieren signos en textos redactados sin puntuación, siempre con revisión humana dada la sobrepredicción de exclamaciones y puntos y coma.

## Benchmarks y rendimiento

Evaluación sobre un conjunto retenido de 91 pasajes de árabe estándar moderno anotados según una guía de puntuación publicada (unos 27.000 tokens). Se comparan la versión anterior y la actual del modelo:

| Metrica | Version anterior | Version actual |
|---|---|---|
| Macro F1 | 54,64 | 61,60 |
| Weighted F1 | 89,90 | 91,54 |
| Token accuracy | 90,96 | 91,33 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 558,8 M de parámetros ocupan aproximadamente 2,2 GB; en fp16, alrededor de 1,1 GB. Con overhead de activaciones y tokenizador, es razonable reservar entre 2 y 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o despliegue con concurrencia, una A10, L4 o A100 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más, incluidas GTX 1650, RTX 3050 y modelos superiores.
- Opciones de despliegue: transformers con PyTorch, pipeline de token-classification, Text Generation Inference no aplica (no es generativo); es posible exportar a ONNX Runtime para inferencia en CPU. No se documentan pesos GGUF ni soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naqta | 558,8 M | no disponible (ventanas cortas) | Restauración de puntuación árabe | Apache 2.0 | Hugging Face |
| XLM-RoBERTa-large base | ~560 M | 512 tokens | Clasificación de tokens genérica | MIT | Hugging Face |
| Alternativas generativas multilingües (p. ej. modelos de 7B+) | miles de millones | largo | Puntuación vía generación | variable | Hugging Face |

La comparación con alternativas generativas es cualitativa: Naqta es órdenes de magnitud más pequeño y barato de ejecutar, pero no dispone de benchmarks públicos frente a ellas en la información disponible. Frente a XLM-RoBERTa-large sin ajustar, la ventaja es el ajuste específico sobre 1,3 M de párrafos árabes y la etapa de adaptación a guía editorial.

## Limitaciones y advertencias

- Sobrepredecición de exclamaciones y puntos y coma: precision de 20,4 y 36,2 respectivamente; el modelo detecta estos signos pero no los retiene de forma fiable.
- No produce paréntesis ni comillas: el span tagger los cubre en entrenamiento, pero su precision es demasiado baja para habilitarlos en producción.
- Entrenado sobre ventanas cortas: una pasada truncada deja sin puntuar todo el texto más allá de unas 230 palabras; es obligatorio usar sliding window.
- Las convenciones de puntuación varían entre fuentes árabes; el rendimiento es mayor en textos conformes a una guía editorial consistente.
- Riesgo de alucinación de signos: al ser un clasificador, puede insertar puntuación donde el texto original no la requería, especialmente en dominios alejados del entrenamiento.
- Sesgos no documentados: la información disponible no detalla sesgos lingüísticos, dialectales ni de dominio.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Para producción se recomienda validación humana o umbrales de confianza por clase, dado el desequilibrio de precision entre signos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MostafaMaroof/Naqta
- Árbol de archivos del repositorio: https://huggingface.co/MostafaMaroof/Naqta/tree/main
- README del modelo: https://huggingface.co/MostafaMaroof/Naqta/blob/main/README.md
- Perfil del autor: https://huggingface.co/MostafaMaroof
- Estadísticas de modelos del autor: https://openmodelstats.com/owners/mostafamaroof
