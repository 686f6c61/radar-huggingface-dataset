# rocky013/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un clasificador binario de texto desarrollado por el usuario rocky013 (publicado en el contexto de la asignatura CS546, *Homework 1*) que distingue entre respuestas escritas por humanos y respuestas generadas por ChatGPT. El modelo se construye por *fine-tuning* completo de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer tipo BERT de 22.713.986 parámetros, al que se añade una cabeza lineal de clasificación sobre el token `[CLS]`. La entrada es únicamente el texto de la respuesta, no la pregunta asociada.

Su relevancia es acotada y de carácter metodológico: sirve como referencia reproducible de detección de texto generado por IA sobre el corpus HC3 en inglés, con un resultado declarado de 0,9871 de *accuracy* y *macro F1* sobre el split de test (4.668 respuestas), frente al 0,8451 de la línea base de embeddings congelados más regresión logística. No es un detector de propósito general ni una herramienta apta para decisiones de alto impacto: el propio autor advierte que el rendimiento se mide sobre la misma distribución de entrenamiento (respuestas de ChatGPT de 2023 a preguntas de HC3) y que el modelo puede apoyarse en artefactos de tokenización del dataset.

Se trata de un modelo denso, monolingüe (inglés), con licencia Apache 2.0, pesos en safetensors y un tamaño de repositorio de 0,1 GB, lo que lo hace desplegable en CPU y en cualquier GPU de consumo. Su ventana de entrada efectiva queda limitada a 256 tokens por truncado durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, 6 capas, hidden 384, 12 cabezas sobre el modelo base) con pooler BERT, dropout 0,1 y cabeza lineal de clasificación sobre `[CLS]` |
| Parametros totales | 22.713.986 (22,7 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (posición máxima del modelo base); el entrenamiento y el uso recomendado aplican truncado a 256 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no hay versiones GGUF, GPTQ, AWQ ni ONNX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, compatible con la librería transformers) |
| Tarea / pipeline | text-classification (detección de texto generado por IA) |
| Etiquetas de salida | `LABEL_0` = respuesta humana; `LABEL_1` = respuesta generada por ChatGPT |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 (fine-tuning completo) |
| Dataset de entrenamiento | Hello-SimpleAI/HC3, `all.jsonl`, revisión `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3` |
| Autor | rocky013 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estándar de la familia BERT, en la variante MiniLM-L6 empleada por `all-MiniLM-L6-v2` (6 capas, dimensión oculta 384, 12 cabezas de atención, vocabulario BERT *uncased*). El autor sustituye la cabeza de *sentence embeddings* por `BertForSequenceClassification`, que agrega el *pooler* sobre el token `[CLS]`, un dropout de 0,1 y una proyección lineal a dos clases. Se realiza *fine-tuning* completo de los 22,7 M de parámetros, sin congelar capas.

Los datos provienen del corpus HC3 en inglés (`all.jsonl`, revisión `4d0ff18`). El preprocesado conserva, por cada pregunta, la primera respuesta humana no vacía y la primera respuesta de ChatGPT no vacía; elimina preguntas vacías, pares de respuestas idénticos o incompletos y preguntas duplicadas (comparación insensible a mayúsculas y espacios). El resultado son 23.334 pares pregunta-respuesta. El *split* 80/10/10 se hace con semilla 42 **a nivel de pregunta**, antes de aplanar a respuestas, de forma que ambas respuestas de una misma pregunta caen siempre en el mismo conjunto: 37.334 respuestas de entrenamiento, 4.666 de validación y 4.668 de test.

Hiperparámetros: optimizador AdamW, ratio de aprendizaje constante 2e-5 sin *warmup*, tamaño de lote 32, 5 épocas (5.835 pasos), longitud máxima de secuencia 256 tokens con truncado y *padding* dinámico, pérdida de entropía cruzada y semilla 42. El entrenamiento se ejecutó en 1 × NVIDIA A100 de 40 GB durante aproximadamente 10 minutos. La pérdida de entrenamiento bajó de 0,69 a menos de 0,1 en 76 pasos, y la pérdida media por época fue 0,081 → 0,013 → 0,007 → 0,004 → 0,004. El split de validación no se usó para selección de modelo. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación.

## Capacidades

- Clasificación binaria de texto: determina si una respuesta está escrita por una persona (`LABEL_0`) o generada por ChatGPT (`LABEL_1`).
- Entrada limitada al texto de la respuesta, sin contexto de la pregunta; no explota información de conversación ni de turnos previos.
- Procesamiento de textos de hasta 256 tokens efectivos por inferencia (truncado); el modelo base admite posiciones hasta 512.
- Inferencia ligera en CPU o GPU de gama baja, con latencia mínima dada la escala de 22,7 M de parámetros.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`, y por tanto con Text Embeddings Inference y *endpoints* compatibles según las etiquetas del repositorio.
- No soporta *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: es exclusivamente un clasificador de secuencias.
- Capacidad multilingüe: no disponible; el modelo se declara y entrena únicamente en inglés.
- No dispone de modo de razonamiento (*thinking mode*) ni de salida de puntuaciones calibradas documentadas más allá de la probabilidad de la cabeza softmax.

## Casos de uso

- Investigación académica sobre detección de texto generado: sirve como referencia reproducible y de bajo coste para comparar estrategias de detección (embeddings congelados + regresión logística frente a *fine-tuning* extremo a extremo) sobre el mismo split de HC3.
- Docencia y prácticas de PLN: permite ilustrar en un aula el flujo completo de *fine-tuning* de un encoder pequeño, el efecto del reparto por pregunta para evitar fuga de información y el análisis de una matriz de confusión asimétrica.
- Filtrado y anotación de corpus: etiquetado automático de respuestas en inglés para triajes previos a revisión humana en proyectos de curación de datos, siempre con verificación manual posterior.
- Auditoría de pipelines de generación: detección de respuestas sintéticas en registros históricos de Q&A en inglés generados con ChatGPT en la época del corpus HC3, por ejemplo para estimar la proporción de contenido sintético en un archivo previo.
- Pruebas de regresión y evaluación de infraestructuras de inferencia: al ser un modelo de 22,7 M de parámetros y 0,1 GB, resulta útil para validar despliegues con pipeline de `transformers`, Text Embeddings Inference o endpoints compatibles sin consumir recursos significativos.
- Prototipado de moderación con supervisión humana: como señal auxiliar de baja prioridad en sistemas de revisión de contenido en inglés, nunca como decisión automática ni como prueba de autoría.
- Experimentos de *stress testing* sobre robustez de detectores: permite medir cuánto cae el rendimiento al cambiar de modelo generador, dominio o estilo, dado que su precisión del 98,71 % está medida en distribución.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente). Evaluación sobre el split de test de HC3 en inglés, `all.jsonl`, revisión `4d0ff18143b5a7e1b1e79beb540c04549d1e59d3` (4.668 respuestas, 2.334 por clase).

| Modelo | Test accuracy | Macro F1 | Respuestas mal clasificadas |
|---|---|---|---|
| Baseline: embeddings congelados de `all-MiniLM-L6-v2` + regresión logística | 0,8451 | 0,8451 | 723 |
| hw1-hc3-detector (fine-tuning completo, 22,7 M) | 0,9871 | 0,9871 | 60 |

Matriz de confusión del modelo ajustado (filas = etiqueta real, columnas = predicción):

|  | Pred. humano | Pred. ChatGPT |
|---|---|---|
| Humano | 2.274 | 60 |
| ChatGPT | 0 | 2.334 |

Los 60 errores son falsos positivos: respuestas humanas marcadas como generadas por ChatGPT. No se registró ningún falso negativo. No hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 91 MB con pesos en fp32 (22,7 M de parámetros × 4 bytes) y unos 45 MB en fp16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria libre. El modelo cabe holgadamente en una NVIDIA T4, GTX 1650, RTX 3060, RTX 4090, A100 o H100; no requiere GPU de centro de datos.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU y en CPU. El entrenamiento documentado usó 1 × A100 de 40 GB, pero solo por conveniencia (10 minutos de ejecución).
- Despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI) y endpoints compatibles. Al no publicarse pesos GGUF ni ONNX, llama.cpp y Ollama no son aplicables directamente sin conversión previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.
- Consideración operativa: el cuello de botella real es el tokenizador y el truncado a 256 tokens, no el cómputo del modelo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos dentro de la información proporcionada; la comparación se limita a aspectos estructurales y de disponibilidad.

| Modelo | Parametros | Contexto de entrada | Licencia | Disponibilidad | Metricas comparables |
|---|---|---|---|---|---|
| hw1-hc3-detector (rocky013) | 22,7 M | 256 tokens (truncado; 512 posiciones en el base) | Apache 2.0 | HuggingFace, safetensors | Accuracy 0,9871 / macro F1 0,9871 en HC3 test |
| Baseline del propio autor: `all-MiniLM-L6-v2` congelado + regresión logística | 22,7 M | 256 tokens | Apache 2.0 | HuggingFace, safetensors | Accuracy 0,8451 / macro F1 0,8451 en HC3 test |
| Detectores basados en RoBERTa de la familia GPT-2 output detector (por ejemplo `roberta-base-openai-detector`) | no disponible en la información aportada | no disponible | no disponible | HuggingFace | no disponible |
| Detectores derivados de HC3 publicados por los autores del corpus (familia `Hello-SimpleAI/chatgpt-detector-*`) | no disponible en la información aportada | no disponible | no disponible | HuggingFace | no disponible |

## Limitaciones y advertencias

- Rendimiento solo en distribución: el 98,71 % de *accuracy* se mide sobre la misma distribución de entrenamiento (respuestas de ChatGPT de 2023 a preguntas de HC3). No se espera que transfiera a modelos generativos más recientes, a otros dominios, a texto de IA con estilo coloquial inducido por *prompt* ni a texto de IA editado por personas.
- Artefactos del dataset: muchas respuestas humanas de HC3 (especialmente las de `reddit_eli5`) contienen artefactos de tokenización como espacios antes de la puntuación (`word ,`) y contracciones separadas (`do n't`), de los que carecen las respuestas de ChatGPT. El modelo puede estar explotando estos atajos en lugar de señales reales de autoría, lo que infla las métricas y compromete la generalización.
- Errores asimétricos: todos los errores del test son falsos positivos, es decir, texto humano marcado como IA. Acusar erróneamente a una persona de usar IA suele ser el error más dañino, y esta asimetría se da precisamente en la dirección más perjudicial.
- Truncado: las entradas de más de 256 tokens se recortan; alrededor del 22 % de las respuestas del conjunto de test superan ese límite, por lo que parte de la señal de esas muestras se descarta.
- Sin verificación independiente: los resultados del `model-index` están marcados como `verified: false` y no han sido replicados por terceros. El repositorio tiene 0 descargas y 0 *likes*, sin evidencia de uso externo.
- Sin calibración documentada: no se publican curvas de fiabilidad ni umbrales recomendados, de modo que interpretar la probabilidad de salida como confianza calibrada no está justificado.
- Monolingüe: solo inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas, y el tokenizador del modelo base es *uncased* orientado a inglés.
- Uso de alto riesgo desaconsejado: los autores de HC3 y el propio autor del modelo advierten que este benchmark histórico no es un detector fiable para trabajos de estudiantes actuales ni para ninguna decisión que afecte a personas. No debe usarse para acusaciones de plagio, evaluaciones académicas, cribados de contratación ni moderación automatizada sin revisión humana.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia cubre el artefacto, no la validez científica de sus predicciones ni el cumplimiento de normativas de protección de datos al procesar texto de terceros.
- Sin soporte de generación ni de agentes: no puede usarse como modelo conversacional, de resumen o de código; cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rocky013/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper de HC3 (arXiv:2301.07597): https://arxiv.org/abs/2301.07597
- Repositorio de Text Embeddings Inference (compatibilidad declarada vía *tags*): https://github.com/huggingface/text-embeddings-inference
