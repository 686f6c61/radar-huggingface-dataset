# ooberaj/hw1-hc3-detector

## Resumen

HW1 HC3 detector es un modelo de clasificación de texto de tipo transformer encoder, publicado por el usuario ooberaj en Hugging Face. Se trata de un ajuste fino (fine-tuning) de sentence-transformers/all-MiniLM-L6-v2 sobre el corpus HC3 durante 5 épocas, con el objetivo de distinguir texto escrito por humanos (etiqueta 0) de texto generado por ChatGPT (etiqueta 1). El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors con 22.713.986 parámetros totales, lo que lo sitúa en la gama de modelos compactos aptos para inferencia en CPU.

Su relevancia es práctica más que arquitectónica: es un detector de contenido generado por IA de bajo coste computacional, pensado para tareas de etiquetado y filtrado a gran escala. El autor reporta una precisión en test de 84,51% para la línea base y 98,71% tras el ajuste fino, aunque no documenta el tamaño ni la composición del conjunto de evaluación.

Se trata de un modelo sin tracción pública (0 descargas, 0 me gusta en el momento de la consulta), sin licencia declarada y sin documentación más allá de cuatro líneas en la model card, por lo que debe considerarse un artefacto experimental antes que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, variante MiniLM-L6 destilada con cabecera de clasificación de secuencias |
| Parámetros totales | 22.713.986 (dato de los pesos safetensors, aproximadamente 22,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base all-MiniLM-L6-v2 está limitado habitualmente a 256 tokens de entrada |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos safetensors sin versiones GGUF, ONNX ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible; la model card y los metadatos del repositorio no declaran licencia |
| Formato de pesos | safetensors (carga mediante la librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de sentence-transformers/all-MiniLM-L6-v2, un encoder transformer de 6 capas y aproximadamente 22,7 millones de parámetros, destilado a partir de modelos mayores y ampliamente utilizado para generar embeddings de frases. Sobre esa base, el autor añade una cabecera de clasificación de secuencias y ajusta todos los pesos para una tarea binaria: 0 para texto humano y 1 para texto generado por ChatGPT. El entrenamiento declarado consiste en 5 épocas sobre el corpus HC3, un conjunto de datos en inglés compuesto por pares de pregunta y respuesta, con una respuesta humana y otra generada por ChatGPT para cada pregunta.

No se documenta el número de tokens de entrenamiento, la composición exacta del subconjunto de HC3 utilizado, el tamaño de las particiones de validación y test, la tasa de aprendizaje, el tamaño de lote ni si se aplicaron técnicas de regularización. Tampoco se menciona ningún proceso de alineación posterior (RLHF, DPO) ni innovaciones arquitectónicas: es un ajuste fino convencional de clasificación. La única métrica aportada es la precisión en test: 84,51% para la línea base y 98,71% para el modelo ajustado.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve la etiqueta 0 (humano) o 1 (ChatGPT) junto con una puntuación de confianza por secuencia.
- Detección de texto generado específicamente por ChatGPT, que es la clase positiva del entrenamiento.
- Procesamiento por lotes de secuencias cortas, con coste computacional muy bajo gracias a sus 22,7 M de parámetros.
- Integración directa con el ecosistema transformers mediante `pipeline("text-classification")`.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints de Hugging Face, según las etiquetas del repositorio.
- No soporta generación de texto: es un modelo exclusivamente discriminativo.
- No dispone de soporte de tool calling, function calling ni uso como agente.
- No tiene capacidades multilingües: está etiquetado únicamente para inglés.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades de visión o audio.

## Casos de uso

- Filtrado de contenido generado por IA en plataformas de contenido: el modelo puede etiquetar automáticamente comentarios, respuestas o artículos entrantes y marcar los sospechosos de haber sido producidos por ChatGPT, dado su bajo coste por inferencia.
- Auditoría y limpieza de corpus de entrenamiento: al clasificar muestras individuales, permite detectar y excluir textos de origen sintético en conjuntos de datos recopilados de fuentes web, un paso habitual antes de entrenar modelos mayores.
- Detección de respuestas automáticas en foros técnicos y comunidades de soporte: se puede integrar en el backend del foro para señalar respuestas potencialmente generadas por IA y priorizar la revisión humana.
- Señal auxiliar en sistemas de integridad académica: como clasificador de apoyo para marcar entregas sospechosas en inglés, siempre con revisión humana y sin usarlo como prueba concluyente.
- Detección de reseñas y opiniones sintéticas: aplicado a reseñas de productos en inglés, el modelo puede actuar como primera capa de triaje antes de un análisis más costoso.
- Etiquetado masivo en pipelines de datos: por su tamaño reducido, puede ejecutarse en CPU sobre millones de documentos para generar una columna de etiqueta que alimente análisis posteriores o modelos de segunda etapa.
- Investigación en atribución de autoría y estudios sobre la difusión de contenido generado por IA, usando el modelo como detector de referencia en experimentos controlados con texto de ChatGPT.

## Benchmarks y rendimiento

| Métrica | Línea base (modelo sin ajustar) | Modelo ajustado |
|---|---|---|
| Precisión en test (accuracy) | 84,51% | 98,71% |

Los dos únicos valores disponibles son los reportados por el autor en la model card, correspondientes a precisión sobre un conjunto de test no descrito. No se publican resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, y no se especifican el tamaño del conjunto de test, la partición utilizada ni el intervalo de confianza de las métricas. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Tamaño de los pesos: aproximadamente 91 MB en fp32, unos 45 MB en fp16 y unos 23 MB en int8 (cálculo a partir de los 22,7 M de parámetros; no hay versiones cuantizadas publicadas).
- VRAM estimada para inferencia: por debajo de 1 GB para lotes moderados y secuencias cortas, incluyendo memoria de activaciones y de la caché de atención.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, GTX 1650, RTX 3060, RTX 4090 y también en iGPU o en CPU exclusivamente.
- Despliegue recomendado: pipeline de transformers, servidor con FastAPI o TorchServe, exportación a ONNX con Optimum, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y Text Embeddings Inference (etiqueta `text-embeddings-inference`).
- llama.cpp y Ollama no son aplicables directamente, ya que el repositorio no publica pesos GGUF; requerirían una conversión manual previa a GGUF u ONNX.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ooberaj/hw1-hc3-detector | 22,7 M | no disponible | Detección humano vs ChatGPT en inglés | no disponible | Hugging Face, safetensors |
| roberta-base-openai-detector | 125 M (roberta-base) | 512 tokens | Detección de texto generado por GPT-2 | no disponible | Hugging Face |
| Hello-SimpleAI/chatgpt-detector-roberta | 125 M (roberta-base) | 512 tokens | Detección de texto de ChatGPT | no disponible | Hugging Face |
| Detector basado en GPT-2 output detector | 124 M | 1024 tokens | Detección de texto generado por GPT-2 | no disponible | Hugging Face |

El modelo aquí descrito es entre cinco y seis veces más pequeño que las alternativas basadas en roberta-base, lo que reduce el coste de inferencia a cambio de una capacidad de representación menor y de un alcance limitado al inglés. Las cifras de parámetros y contexto de las alternativas provienen de sus respectivas arquitecturas base y deben verificarse en cada model card; las licencias no se han confirmado en la información disponible.

## Limitaciones y advertencias

- Sesgo de origen: entrenado sobre HC3, un corpus de pares pregunta-respuesta, por lo que su comportamiento fuera de ese dominio (textos largos, prosa creativa, código, redes sociales) no está validado.
- Riesgo elevado de falsos positivos contra texto humano muy formal, repetitivo o escrito por hablantes no nativos de inglés, un problema documentado en detectores similares.
- Degradación esperable frente a modelos generativos distintos de ChatGPT: la clase positiva es específicamente ChatGPT, y no hay evidencia de que generalice a GPT-4, Claude, Gemini u otros sistemas.
- Evasión trivial: la paráfrasis, la edición humana o el uso de instrucciones de estilo pueden reducir la precisión por debajo de las cifras reportadas.
- Sesgo de evaluación: no se documenta la partición de test ni si existe solapamiento temático con el entrenamiento, algo especialmente relevante en HC3, donde las respuestas humanas y generadas comparten pregunta.
- El 98,71% de precisión es una cifra autorreportada, sin replicación independiente ni comparación con detectores establecidos.
- Una precisión agregada no informa del equilibrio entre precisión y exhaustividad; sin matriz de confusión, la tasa real de falsos positivos sobre texto humano es desconocida.
- No debe usarse como evidencia concluyente en contextos disciplinarios, académicos o legales: es un clasificador probabilístico que devuelve una puntuación, no una prueba.
- Limitación de idioma: solo inglés; su uso con texto en castellano no está soportado ni evaluado.
- Restricciones de licencia: al no declararse licencia, no existe permiso explícito de uso comercial y el riesgo legal recae en quien despliega el modelo.
- Madurez del repositorio: 0 descargas, 0 me gusta, sin paper asociado, con una model card de cuatro líneas y una fecha de creación registrada como 2026-10-01, lo que sugiere metadatos inconsistentes o un experimento de curso sin mantenimiento.
- No es un modelo generativo: cualquier expectativa de generación de texto, resumen o diálogo queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ooberaj/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: mencionado en la model card sin enlace ni versión confirmada por el autor; la distribución más conocida es https://huggingface.co/datasets/Hello-SimpleAI/HC3 (no verificada como la utilizada en el ajuste fino)
- Búsqueda web: no se han encontrado papers, blogs, repositorios ni demos asociados a este modelo. Los resultados de búsqueda disponibles no guardan relación con el modelo y consisten en hilos sobre validación de números de teléfono y expresiones regulares.
