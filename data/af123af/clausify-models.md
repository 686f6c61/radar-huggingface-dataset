# af123Af/clausify-models

## Resumen

af123Af/clausify-models es un repositorio de HuggingFace que agrupa dos checkpoints de distilbert-base-uncased ajustados para el análisis de cláusulas contractuales. No es un modelo generativo ni un asistente conversacional: son dos cabezas sobre un encoder transformer de 6 capas y unos 66 millones de parámetros, con un límite posicional de 512 tokens. Ambos checkpoints se entrenaron sobre el split de 408 contratos de CUAD (theatticusproject/cuad) con semilla 42 y partición a nivel de contrato, y se evaluaron sobre 102 contratos reservados.

El primero, `presence_mil/final`, responde a si una ventana de 2.000 caracteres contiene una cláusula de una categoría concreta; aplica max-pooling sobre las ventanas y obtiene un micro-F1 de 0,692 en solitario y de 0,779 combinado con un baseline TF-IDF mediante un AND-ensemble. El segundo, `span/final`, realiza question answering extractivo para devolver el fragmento literal de la cláusula, con un token-F1 de 0,764 siempre que la ventana contenga la respuesta.

Su interés es doble: sirve como baseline reproducible y ligero para tareas de revisión contractual y su licencia Apache 2.0 permite reutilizarlo o reajustarlo. El autor lo describe explícitamente como prototipo de investigación y advierte de que no constituye asesoramiento jurídico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT: 6 capas, 768 de dimensión oculta, 12 cabezas de atención), con dos cabezas específicas: clasificación binaria sobre ventanas (presence_mil) y question answering extractivo (span) |
| Parámetros totales | ~66 millones por checkpoint, heredados de distilbert-base-uncased; dos checkpoints en el repositorio |
| Longitud de contexto | 512 tokens (límite posicional del modelo base); el modelo de presencia opera sobre ventanas de 2.000 caracteres con max-pooling |
| Tipos de cuantización | No disponible. El repositorio publica safetensors sin versiones cuantizadas documentadas |
| Idiomas soportados | Inglés (el corpus CUAD son contratos en inglés); no hay datos sobre otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuración de transformers; carpetas `presence_mil/final` y `span/final` |
| Modelo base | distilbert/distilbert-base-uncased |
| Dataset de ajuste | theatticusproject/cuad (408 contratos de entrenamiento, 102 de test, semilla 42, partición a nivel de contrato) |
| Tamaño del repositorio | 0,5 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es DistilBERT, la variante destilada de BERT-base que conserva 6 de sus 12 capas y en torno al 60 % de sus parámetros, manteniendo una dimensión oculta de 768 y 12 cabezas de atención. Sobre ella se han ajustado dos cabezas independientes con pesos separados: un clasificador binario de presencia de cláusula, que se aplica a ventanas de 2.000 caracteres y agrega sus salidas mediante max-pooling, y un modelo de question answering extractivo que localiza el span de la cláusula a partir de una pregunta de categoría. El límite de 512 tokens del encoder obliga a trocear los contratos antes de la inferencia.

Los datos de entrenamiento proceden del split de 408 contratos de CUAD, con partición a nivel de contrato (no a nivel de fragmento) y semilla 42, lo que evita la fuga de información entre entrenamiento y evaluación. La evaluación se realizó sobre 102 contratos reservados. El autor no documenta en la información disponible si hubo una fase adicional de RLHF, DPO, aumento de datos o destilación propia; tampoco detalla la composición exacta del dataset más allá de su origen en CUAD ni el número de tokens de entrenamiento. La innovación técnica destacable es de bajo coste: el uso de max-pooling sobre ventanas para convertir un clasificador de fragmentos en un detector de presencia a nivel de documento, y la combinación mediante AND-ensemble con un baseline TF-IDF para elevar el micro-F1 de 0,692 a 0,779.

## Capacidades

- Clasificación binaria de presencia de cláusula por categoría sobre ventanas de 2.000 caracteres, con agregación a nivel de documento mediante max-pooling.
- Extracción extractiva del fragmento literal de una cláusula (question answering) cuando la ventana contiene la respuesta.
- Etiquetado de contratos en inglés con vocabulario jurídico-comercial aprendido de CUAD.
- Ejecución sobre CPU y GPU de gama baja, al tratarse de un encoder de 66 millones de parámetros.
- Inferencia por lotes y despliegue con las clases estándar de transformers (`AutoModelForSequenceClassification` y `AutoModelForQuestionAnswering`).
- No soporta generación de texto libre, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un modelo discriminativo con salida restringida a etiquetas o spans.
- Multilingüismo: no soportado; el modelo base es monolingüe en inglés y CUAD también.

## Casos de uso

- Triaje previo a la revisión manual: dividir cada contrato en ventanas de 2.000 caracteres, obtener la puntuación de presencia por categoría y marcar solo los contratos y secciones que requieren atención de un abogado, reduciendo el volumen de lectura.
- Extracción de cláusulas literales: encadenar `presence_mil/final` para localizar las ventanas relevantes y `span/final` para devolver el texto exacto de la cláusula (con un token-F1 de 0,764 cuando la ventana contiene la respuesta), útil para generar fichas de contrato.
- Filtrado previo en un pipeline de RAG jurídico: usar el clasificador de presencia como etapa de criba antes del recuperador vectorial, de modo que solo las ventanas candidatas entren en el índice y en el contexto del modelo generador.
- Due diligence sobre carteras de contratos: al ocupar menos de 1 GB de VRAM por checkpoint, es viable procesar cientos de contratos en paralelo en una sola GPU consumer, aplicando la clasificación por lotes.
- Auditoría de cumplimiento: comprobar de forma sistemática la presencia de cláusulas concretas (ley aplicable, renovación automática, indemnización, cesión) en un conjunto de contratos, generando una matriz de resultados para revisión humana.
- Anotación asistida (human-in-the-loop): pre-etiquetar contratos y presentar las sugerencias del modelo a un revisor, que corrige falsos positivos y falsos negativos; el ahorro proviene de que el revisor parte de un borrador.
- Punto de partida para ajuste fino propio: la licencia Apache 2.0 permite reentrenar las cabezas sobre un corpus propio, siempre que existan anotaciones a nivel de cláusula; sería el camino necesario para otros idiomas o jurisdicciones distintas de la estadounidense.
- Docencia e investigación: baseline reproducible y ligero sobre el split seed-42 de CUAD, con resultados publicados de micro-F1 y token-F1 para comparar alternativas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 102 contratos de test reservados (partición a nivel de contrato, semilla 42):

| Checkpoint | Tarea | Métrica | Resultado |
|---|---|---|---|
| `presence_mil/final` | Presencia de cláusula por ventana de 2.000 caracteres, max-pooling | micro-F1 | 0,692 |
| `presence_mil/final` + baseline TF-IDF (AND-ensemble) | Presencia de cláusula por ventana | micro-F1 | 0,779 |
| `span/final` | Question answering extractivo, dado un fragmento que contiene la respuesta | token-F1 | 0,764 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos ajustados en CUAD.

## Requisitos de hardware

- Peso por checkpoint: aproximadamente 260 MB en fp32, unos 130 MB en fp16 y unos 66 MB en INT8 dinámico; el repositorio completo ocupa 0,5 GB.
- VRAM para inferencia: por debajo de 1 GB con lotes pequeños en fp32; cabe holgadamente en cualquier GPU consumer (GTX 1650 de 4 GB, RTX 3060, RTX 4090) y funciona también en CPU.
- GPU recomendadas: no requiere GPU dedicada. Para procesar carteras completas en paralelo resulta útil cualquier GPU con 8 GB o más; A100 o H100 solo tendrían sentido para volúmenes muy altos, donde el cuello de botella pasa a ser el troceado en ventanas de 2.000 caracteres.
- Despliegue: transformers con `pipeline("text-classification")` para `presence_mil/final` y `pipeline("question-answering")` para `span/final`; también exportación a ONNX Runtime, TorchScript, TorchServe, Triton o un servicio FastAPI. No aplica llama.cpp ni Ollama, al no ser un modelo generativo con pesos GGUF; vLLM tampoco cubre este tipo de encoder de clasificación.
- Latencia y throughput: no disponible. El autor no publica mediciones, y el coste real depende del número de ventanas de 2.000 caracteres por contrato en el modelo de presencia y de mantener adicionalmente el baseline TF-IDF si se usa el ensemble.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Resultados en CUAD | Disponibilidad |
|---|---|---|---|---|---|
| clausify-models (`presence_mil/final`) | ~66 M | 512 tokens; ventanas de 2.000 caracteres | Apache 2.0 | micro-F1 0,692 (0,779 con ensemble TF-IDF) | HuggingFace, 2 checkpoints |
| clausify-models (`span/final`) | ~66 M | 512 tokens | Apache 2.0 | token-F1 0,764 con ventana que contiene la respuesta | HuggingFace |
| distilbert-base-uncased sin ajustar | ~66 M | 512 tokens | Apache 2.0 | No disponible (no resuelve la tarea) | HuggingFace |
| bert-base-uncased ajustado en CUAD | ~110 M | 512 tokens | Apache 2.0 | No disponible en la información proporcionada | HuggingFace (requiere ajuste propio) |
| legal-bert-base-uncased | ~110 M | 512 tokens | No disponible (verificar en el repositorio) | No disponible | HuggingFace |
| longformer-base-4096 | ~149 M | 4096 tokens | No disponible (verificar en el repositorio) | No disponible | HuggingFace |

La comparativa de rendimiento con alternativas no puede completarse: el autor solo publica resultados frente a su propio baseline TF-IDF, no frente a otros encoders ajustados en CUAD. La ventaja diferencial de clausify-models es el coste computacional (66 M de parámetros) y la licencia permisiva; su desventaja potencial es la menor capacidad de DistilBERT frente a BERT-base o modelos específicos de dominio jurídico.

## Limitaciones y advertencias

- Prototipo de investigación: el propio autor indica que no constituye asesoramiento jurídico. No debe usarse como única fuente en decisiones legales.
- Un micro-F1 de 0,692 implica una tasa de error apreciable a nivel de categoría y ventana; los falsos negativos en cláusulas críticas son el riesgo operativo principal.
- El ensemble con TF-IDF mejora hasta 0,779, pero obliga a mantener, versionar y recalibrar un componente adicional fuera del repositorio.
- `span/final` solo alcanza token-F1 0,764 y únicamente cuando la ventana contiene la respuesta: el rendimiento de extremo a extremo queda limitado por el recall del detector de presencia.
- Límite de 512 tokens: los contratos largos deben trocearse y las cláusulas que cruzan el límite de ventana pueden perderse, ya que el max-pooling no recupera contexto entre ventanas.
- Solo inglés y dominio de contratos comerciales estadounidenses (CUAD). No hay validación en otras jurisdicciones, idiomas ni tipos documentales.
- DistilBERT es un modelo destilado de 6 capas con menor capacidad que BERT-base o Legal-BERT; no se han publicado comparaciones que cuantifiquen esa diferencia en esta tarea.
- Riesgo de alucinación bajo en el sentido generativo (el modelo es extractivo y no produce texto libre), pero puede devolver un span incorrecto con alta confianza cuando la ventana no contiene la cláusula.
- Sesgos: no documentados por el autor. El modelo hereda los sesgos del corpus CUAD y del preentrenamiento de distilbert-base-uncased sobre texto web en inglés.
- Licencia del modelo Apache 2.0, pero la información disponible no especifica la licencia de CUAD: conviene verificarla antes de redistribuir derivados del conjunto de datos.
- Repositorio con 0 descargas, 0 likes y sin pipeline declarado; no hay garantía de mantenimiento ni de soporte.
- Ausencia de documentación sobre cuantización, latencia o consumo real de memoria: cualquier plan de producción debe medirse en el entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/af123Af/clausify-models
- Repositorio de la aplicación Clausify: https://github.com/afnanmz168/clausify-p3-app
- Repositorio con detalles y evaluación completa: https://github.com/afnanmz168/clausify-p3
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de CUAD: https://arxiv.org/abs/2103.06268
