# jupadev/new-model-test

## Resumen

`jupadev/new-model-test` es un clasificador binario de sentimiento en inglés obtenido mediante fine-tuning de `distilbert-base-uncased` sobre el corpus IMDB de críticas cinematográficas. Lo publica el usuario jupadev en Hugging Face y su propósito es etiquetar cada reseña como `POSITIVE` o `NEGATIVE`. No es un modelo generativo ni un LLM conversacional: es una cabeza de clasificación sobre un encoder transformer de 6 capas y 66.955.010 parámetros, con licencia Apache 2.0 y un repositorio de 0,3 GB en safetensors.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline clásico de clasificación de texto (split estratificado, early stopping por F1 de validación, evaluación única sobre el test oficial) y como baseline ligero para análisis de sentimiento en inglés. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto recién publicado y sin validación externa, por lo que debe tratarse como experimental.

Las métricas declaradas por el autor sobre el split de test completo de IMDB (25.000 reseñas) son 0,9111 de accuracy y 0,9121 de F1, marcadas como no verificadas en el model-index. La longitud de contexto efectiva es de 256 tokens, no la ventana teórica de DistilBERT, porque el autor truncó las reseñas más largas durante el entrenamiento y la evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) con cabeza de clasificación binaria |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncación aplicada en entrenamiento y evaluación; la ventana teórica de DistilBERT es 512) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; al ser un modelo de 67 M de parámetros es viable en fp32, fp16 e int8 con herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT: un transformer encoder de 6 capas y 66,9 M de parámetros obtenido por destilación de conocimiento de BERT-base, sobre el que se añade una cabeza lineal de clasificación con dos etiquetas (`0 → NEGATIVE`, `1 → POSITIVE`). No hay mecanismos de atención lineal, decodificación especulativa ni componentes MoE; es un encoder bidireccional estándar con tokenizador WordPiece sin casing (`uncased`).

El fine-tuning se realizó sobre el split `train` de `stanfordnlp/imdb` (25.000 reseñas), que el autor reordenó con `seed=42` porque el split original está ordenado por etiqueta, y luego dividió de forma estratificada 90/10 (aproximadamente 22.500 de entrenamiento y 2.500 de validación). El test oficial de 25.000 reseñas se reservó para una única evaluación final. Hiperparámetros: longitud máxima de 256 tokens, learning rate 2e-5 con scheduler lineal y 10 % de warmup, weight decay 0,01, batch de 16, hasta 3 épocas con early stopping (paciencia 1), precisión mixta fp16, padding dinámico mediante `DataCollatorWithPadding` y selección del checkpoint por F1 de validación. El entrenamiento se ejecutó con la API `Trainer` de Hugging Face en una única NVIDIA T4 (Google Colab). No se documenta uso de RLHF, DPO ni aumento de datos.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en textos en inglés.
- Etiquetado de reseñas cinematográficas con puntuaciones de probabilidad por clase.
- Integración directa con `transformers` mediante `pipeline("text-classification")` y compatibilidad declarada con Text Embeddings Inference y endpoints.
- Procesamiento por lotes con padding dinámico, adecuado para inferencia de alto volumen en CPU o GPU modesta.
- No soporta generación de texto, razonamiento multi-paso, matemáticas, código, visión ni audio.
- No soporta tool calling ni function calling.
- No dispone de modo thinking ni de capacidades de agente.
- Multilingüismo: únicamente inglés; el rendimiento en otros idiomas será bajo según el propio autor.

## Casos de uso

- Moderación y triaje de reseñas de cine o series: clasificar automáticamente opiniones de usuarios en plataformas de contenido para enrutar las negativas a soporte o a análisis de producto, aprovechando que el modelo está entrenado exactamente en ese dominio y registro.
- Baseline en investigación de NLP: punto de partida reproducible (semilla fija, split documentado, evaluación única sobre test) para comparar técnicas de fine-tuning, aumentos de datos o modelos mayores sobre IMDB sin incurrir en contaminación del test.
- Análisis de sentimiento por lotes en pipelines de datos: procesar decenas de miles de reseñas en CPU con `transformers` o TEI, dado el reducido tamaño del checkpoint (0,3 GB) y su bajo coste computacional.
- Filtrado previo en sistemas de recomendación: descartar o ponderar reseñas negativas antes de agregarlas en puntuaciones de título, usando la probabilidad de la clase como señal continua.
- Etiquetado asistido para anotación humana: pre-anotar corpus de críticas en inglés y reservar la revisión manual para los casos de baja confianza o de error conocido (sarcasmo, reseñas mixtas).
- Pruebas de integración y CI/CD: validar pipelines de despliegue de modelos de clasificación (endpoints, TEI, contenedores) con un modelo pequeño y de licencia permisiva antes de mover cargas a modelos mayores.
- Docencia y demos: ejemplo mínimo de fine-tuning de DistilBERT con la API `Trainer` que cabe en una T4 gratuita de Colab.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados), evaluados una sola vez sobre el split `test` completo de IMDB (25.000 reseñas, 50/50):

| Métrica | Valor |
|---|---|
| Accuracy | 0,9111 |
| F1 | 0,9121 |
| Precision | 0,9017 |
| Recall | 0,9228 |
| Loss | 0,3414 |

El autor indica que el modelo predice `POSITIVE` en el 51,2 % de las reseñas de test frente a una tasa real del 50 %, un sesgo positivo leve que explica que el recall supere a la precision. No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (67 M de parámetros, aproximadamente 268 MB de pesos) y alrededor de 150 MB en fp16; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; el autor entrenó en una NVIDIA T4. Para inferencia no se requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, así como en CPU (x86 con AVX2) para lotes moderados.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Embeddings Inference (declarado compatible en los tags), endpoints de Hugging Face y exportación a ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU por lotes, pero no hay cifras publicadas que lo respalden.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jupadev/new-model-test` | 66,9 M | 256 tokens (truncado) | Clasificación de sentimiento binaria en inglés | Apache 2.0 | Hugging Face, 0 descargas |
| `distilbert-base-uncased-finetuned-sst-2-english` | 67 M | 512 tokens teóricos | Clasificación de sentimiento binaria en inglés | Apache 2.0 | Hugging Face, ampliamente usado |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 tokens | Sentimiento en tres clases (negativo/neutro/positivo), dominio redes sociales | MIT | Hugging Face |
| `textattack/bert-base-uncased-imdb` | 110 M | 512 tokens | Clasificación binaria sobre IMDB | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks de estos modelos comparables en la información proporcionada, por lo que no se incluye comparación numérica de rendimiento.

## Limitaciones y advertencias

- Solo inglés: el rendimiento en otros idiomas será bajo, según el propio autor.
- Dominio restringido a críticas de cine; se espera una caída de accuracy en reseñas de producto, redes sociales o tickets de soporte.
- Truncación a 256 tokens: las reseñas largas cuyo veredicto aparece al final pueden clasificarse erróneamente.
- Salida binaria sin clase neutra: las opiniones mixtas o ambivalentes se fuerzan a positivo o negativo.
- El sarcasmo y la ironía son casos de fallo habituales.
- Las puntuaciones son probabilidades del modelo, no confianza calibrada; en los errores el modelo suele equivocarse con alta confianza.
- Sesgo positivo leve documentado: 51,2 % de predicciones positivas frente al 50 % real en test.
- Puede reflejar sesgos presentes en IMDB y en los datos de preentrenamiento de DistilBERT.
- Métricas no verificadas: el model-index marca los resultados como `verified: false` y el repositorio no tiene descargas ni validación de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jupadev/new-model-test
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
