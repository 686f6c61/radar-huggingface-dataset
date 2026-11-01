# navendu10/novapay-sentiment

## Resumen

novapay-sentiment es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, la variante destilada de BERT desarrollada por Hugging Face. Lo publica el usuario navendu10 en Hugging Face y está orientado, por su nombre, a la clasificación de sentimiento en el dominio de pagos o servicios financieros ("NovaPay"), aunque la model card no documenta el conjunto de datos utilizado ni las etiquetas concretas del clasificador.

Técnicamente es un transformer encoder de 6 capas y 66.955.010 parámetros, con un tokenizador WordPiece en inglés y una ventana de contexto de 512 tokens. El autor reporta en el conjunto de evaluación una pérdida de 0,3010, una accuracy de 0,892 y un F1 de 0,8924 tras dos épocas de entrenamiento, resultados que no van acompañados de información sobre la composición ni el tamaño de dicho conjunto.

Su relevancia es limitada: se trata de un artefacto de fine-tuning pequeño, con 14 descargas y sin métricas desglosadas por clase, sin datos de entrenamiento publicados y con la model card autogenerada por el Trainer de Hugging Face sin completar. Resulta útil como referencia de un clasificador binario o multiclase de sentimiento rápido y ligero, pero no como base para decisiones de producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite posicional de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; admite cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | No disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder de 6 capas y 66 millones de parámetros que reduce BERT-base en un 40 % de tamaño conservando aproximadamente el 97 % de su rendimiento en GLUE según su paper original. La cabeza de clasificación se ha reentrenado para la tarea de sentimiento, pero la model card no especifica el número de etiquetas ni su significado.

El entrenamiento se realizó con el Trainer de Hugging Face durante 2 épocas, con un learning rate de 2e-05, batch size de 16 en entrenamiento y evaluación, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. Se registraron 626 pasos totales (313 por época). No se documenta el dataset, el número de ejemplos, la composición de clases, ni si se aplicaron técnicas de aumento de datos o balanceo. Las versiones de framework declaradas son Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No hay indicios de RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Clasificación de texto: asigna una etiqueta de sentimiento a una secuencia de entrada, presumiblemente en el ámbito de pagos o atención al cliente financiero.
- Procesamiento en inglés: hereda el vocabulario y el preentrenamiento en inglés de distilbert-base-uncased; no hay evidencia de soporte multilingüe.
- Contexto de hasta 512 tokens, suficiente para reseñas, tickets o mensajes cortos, no para documentos largos.
- Inferencia ligera y rápida: 66,9 millones de parámetros permiten ejecución en CPU con latencias de milisegundos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un clasificador discriminativo, no un modelo generativo.
- No se documentan capacidades de embeddings reutilizables más allá de la salida del encoder, aunque el tag `text-embeddings-inference` sugiere compatibilidad con ese runtime.

## Casos de uso

- Clasificación de sentimiento en tickets de soporte: el modelo puede etiquetar automáticamente quejas y consultas de clientes de un servicio de pagos como positivas o negativas, con un coste de inferencia mínimo y sin necesidad de GPU.
- Enrutado de feedback de usuarios: integrado en un pipeline de ingestión, permite separar reseñas negativas para revisión manual y positivas para marketing, aprovechando su F1 reportado de 0,8924 sobre el conjunto de evaluación del autor.
- Moderación de comentarios en foros o apps financieras: al ser un encoder de 66 M de parámetros, se puede desplegar en el borde o en contenedores pequeños para filtrar mensajes tóxicos o insatisfacción antes de que lleguen a un humano.
- Análisis de encuestas NPS: clasificar respuestas abiertas cortas (hasta 512 tokens) en categorías de sentimiento para agregar métricas de satisfacción a escala.
- Señal auxiliar en sistemas de recomendación: usar la polaridad estimada de las reseñas como feature adicional en un ranking de productos o servicios.
- Prototipado rápido y experimentación académica: como ejemplo de fine-tuning de DistilBERT con el Trainer, sirve de plantilla para adaptar clasificadores de sentimiento a dominios verticales con pocos recursos.
- Preetiquetado en anotación humana: generar etiquetas preliminares que los anotadores revisan, reduciendo el coste de construir un dataset de sentimiento específico del dominio.

## Benchmarks y rendimiento

El autor declara resultados únicamente sobre su propio conjunto de evaluación, sin especificar su tamaño ni composición. No hay resultados en benchmarks públicos estándar (MMLU, GLUE, SST-2, etc.).

| Metrica | Valor reportado |
|---|---|
| Loss (evaluación) | 0,3010 |
| Accuracy | 0,892 |
| F1 | 0,8924 |

Evolución durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | Accuracy | F1 |
|---|---|---|---|---|---|
| 1.0 | 313 | 0,3284 | 0,4202 | 0,829 | 0,8475 |
| 2.0 | 626 | 0,2210 | 0,3010 | 0,892 | 0,8924 |

No se han publicado resultados de benchmarks estándar ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (66,9 M de parámetros × 4 bytes), más activaciones mínimas para batch pequeño.
- En fp16: alrededor de 135 MB de pesos; en int8 dinámico, unos 67 MB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050 Ti, RTX 3050, RTX 4090 o incluso iGPU con suficiente memoria compartida; también funciona en CPU.
- GPU recomendadas: ninguna en particular; para alto throughput, una T4, L4 o A10 bastan para miles de peticiones por segundo con batching.
- Opciones de despliegue: Transformers con pipeline de `text-classification`, Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` lo indican), ONNX Runtime, o exportación a TorchScript. No hay GGUF publicado, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no publicados por el autor. Por el tamaño del modelo, es razonable esperar latencias de pocos milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| navendu10/novapay-sentiment | 66,9 M | 512 tokens | Apache 2.0 | Accuracy 0,892 y F1 0,8924 en evaluación propia | Hugging Face, 14 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | Apache 2.0 | Métricas publicadas en SST-2 en su model card | Hugging Face, muy descargado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 tokens | MIT (según su card) | Métricas publicadas en tweets y benchmarks | Hugging Face, ampliamente usado |
| ProsusAI/finbert | 110 M | 512 tokens | Apache 2.0 | Métricas publicadas en Financial PhraseBank | Hugging Face, orientado a finanzas |

Frente a estas alternativas, novapay-sentiment no aporta métricas públicas comparables ni documentación del dominio de entrenamiento, por lo que su elección frente a un clasificador de sentimiento consolidado solo se justifica si se valida empíricamente sobre el corpus objetivo.

## Limitaciones y advertencias

- La model card está autogenerada y sin completar: no se documenta el dataset, las etiquetas, el número de clases ni el proceso de anotación.
- El conjunto de evaluación no está descrito; las métricas de 0,892 de accuracy y 0,8924 de F1 no son reproducibles ni comparables con benchmarks públicos.
- Riesgo de sesgo heredado de distilbert-base-uncased (datos web en inglés, sin filtrado documentado) y del corpus de fine-tuning, que se desconoce.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento, especialmente en textos en castellano o con jerga financiera no vista.
- El modelo base está entrenado principalmente en inglés; no hay evidencia de rendimiento en otros idiomas, y el tokenizador WordPiece sin casing puede degradar la tokenización de texto en mayúsculas o con acentos.
- Ventana máxima de 512 tokens: textos más largos se truncan, lo que puede perder la parte final del sentimiento expresado.
- Licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia de los datos de fine-tuning, el usuario debe evaluar el riesgo legal de su propio corpus.
- Solo 14 descargas y 0 likes: no hay validación comunitaria ni informes de terceros sobre su comportamiento en producción.
- No se publican pesos en GGUF ni cuantizaciones listas para usar; el despliegue en entornos con llama.cpp u Ollama requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/navendu10/novapay-sentiment
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
