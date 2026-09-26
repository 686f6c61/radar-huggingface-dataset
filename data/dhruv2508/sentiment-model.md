# Dhruv2508/sentiment-model

## Resumen

sentiment-model es un modelo de clasificación de texto publicado en Hugging Face por el usuario Dhruv2508. Se trata de un ajuste fino de distilbert-base-uncased, un transformer encoder destilado de BERT-base, sobre un conjunto de datos que el propio autor no identifica en la model card (aparece literalmente como "unknown dataset"). El modelo resuelve la tarea genérica de análisis de sentimiento (pipeline text-classification) y se distribuye con pesos en formato safetensors bajo licencia Apache-2.0.

Con 66.955.779 parámetros totales y un repositorio de 0,3 GB, es lo bastante pequeño para ejecutarse en CPU o en cualquier GPU consumer. Sus cifras de evaluación, sin embargo, son modestas: 0,6598 de accuracy, 0,6493 de F1 ponderado y 0,6493 de F1 macro, con una pérdida de evaluación de 0,7470.

Su relevancia es más metodológica que práctica: no acumula descargas ni valoraciones, la model card está generada automáticamente por el Trainer de Hugging Face y deja sin documentar el dataset, el espacio de etiquetas y los usos previstos. Es un ejemplo representativo de ajuste fino experimental que exige validación adicional antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base); ajuste fino de distilbert-base-uncased |
| Parámetros totales | 66.955.779 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base distilbert-base-uncased admite un máximo de 512 tokens por secuencia |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors |
| Idiomas soportados | No disponibles; el modelo base está entrenado principalmente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carga mediante la librería transformers) |
| Tarea (pipeline) | text-classification |
| Tamaño del repositorio | 0,3 GB |
| Librería y versión | Transformers 5.16.1 (PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1) |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creación y actualización | 26 de septiembre de 2026 (ambas) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: DistilBERT, un encoder transformer obtenido por destilación de BERT-base que reduce la profundidad de 12 a 6 capas manteniendo 768 dimensiones ocultas y 12 cabezas de atención, con alrededor de 66 millones de parámetros (un 40 % menos que BERT-base y en torno a un 60 % más rápido en inferencia). El checkpoint publicado no modifica esa topología, sino que añade una cabeza de clasificación ajustada mediante entrenamiento supervisado. El tokenizador heredado es el WordPiece "uncased" del modelo base, por lo que la entrada se normaliza a minúsculas.

El ajuste fino se realizó durante 3 épocas con learning rate 2e-05, tamaño de lote 32 en entrenamiento y evaluación, semilla 42, optimizador ADAMW_TORCH_FUSED con betas (0,9; 0,999) y epsilon 1e-08, y planificador lineal. Los 174 pasos registrados implican 58 pasos por época, lo que equivale a unos 1.856 ejemplos de entrenamiento por época con lote de 32. La curva muestra sobreajuste a partir de la segunda época: la pérdida de entrenamiento baja de 1,0498 a 0,6785, mientras la de validación se estanca (0,8737; 0,7226; 0,7117) y la accuracy cae de 0,6975 a 0,6821 en la tercera. No hay rastro de RLHF, DPO ni decodificación especulativa, algo coherente con un modelo discriminativo y no generativo. Las cifras finales de evaluación (pérdida 0,7470; accuracy 0,6598) no coinciden con la última fila de la tabla de entrenamiento, lo que sugiere una evaluación final sobre una partición distinta.

## Capacidades

- Clasificación de texto mediante la pipeline text-classification de Transformers, con salida de etiquetas y puntuaciones de probabilidad.
- Análisis de sentimiento como tarea declarada, aunque el número y los nombres de las etiquetas no están documentados en la model card.
- Extracción de representaciones contextuales en inglés por herencia del encoder DistilBERT (uso posible, no documentado por el autor).
- Compatibilidad con Hugging Face Inference Endpoints (etiqueta endpoints_compatible).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, modo "thinking" ni cadena de pensamiento.
- Sin capacidades de visión, audio ni generación de texto.
- Capacidad multilingüe: no acreditada; el modelo base está entrenado esencialmente en inglés.

## Casos de uso

- Prototipado rápido de análisis de sentimiento: al pesar unos 268 MB en FP32, se carga en memoria en segundos y permite validar una idea de producto antes de invertir en un modelo mayor.
- Etiquetado asistido con revisión humana: las predicciones pueden preanotar un corpus que luego se corrige manualmente, aprovechando su bajo coste de inferencia en CPU.
- Triaje de comentarios en foros o reseñas: filtrar mensajes según la puntuación del modelo y derivar a revisión solo los casos de confianza baja o intermedia.
- Enrutado de tickets de soporte: clasificar la tonalidad de una consulta para priorizar clientes insatisfechos, siempre que se reentrene o calibre antes con datos propios del dominio.
- Inferencia en el borde (edge) o en entornos sin GPU: cabe holgadamente en un contenedor pequeño y no requiere acelerador para responder con latencia aceptable.
- Punto de partida para transfer learning: al ser un checkpoint ya ajustado de DistilBERT, sirve como inicialización para un nuevo ajuste fino con datos etiquetados propios.
- Pruebas de infraestructura y CI: validar pipelines de clasificación (preprocesado, batching, serialización safetensors, despliegue en endpoints) con un modelo de tamaño reducido.
- Docencia e investigación sobre ajuste fino: la model card documenta hiperparámetros reproducibles (lr, lote, épocas, semilla) útiles como caso de estudio de sobreajuste prematuro.

## Benchmarks y rendimiento

La model card no incluye un model-index con resultados (el array "results" está vacío), por lo que no hay datos de MMLU, HumanEval, GSM8K ni de conjuntos estándar de sentimiento como SST-2. Las únicas métricas publicadas son las de la evaluación propia del autor:

| Métrica | Valor |
|---|---|
| Pérdida de evaluación | 0,7470 |
| Accuracy | 0,6598 |
| F1 ponderado | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Accuracy | F1 ponderado | F1 macro |
|---|---|---|---|---|---|---|
| 1,0 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2,0 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3,0 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Observaciones: el mejor punto en validación es la época 2 (accuracy 0,6975), no la última; el F1 macro y el F1 ponderado coinciden exactamente en todas las filas, lo que apunta a un conjunto de evaluación con clases equilibradas. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 268 MB en FP32 (66.955.779 parámetros × 4 bytes), unos 134 MB en FP16 y unos 67 MB en int8. Son estimaciones aritméticas a partir del recuento de parámetros; el autor no publica cifras de consumo.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria, desde una GTX 1050/1650 hasta una RTX 4090. Modelos como A100 o H100 no aportan ventaja relevante salvo para procesar lotes muy grandes, ya que el modelo no satura estos aceleradores.
- Inferencia en CPU: perfectamente viable; es el escenario natural para este tamaño de modelo.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas las integradas con memoria compartida.
- Opciones de despliegue: pipeline de Transformers, Hugging Face Inference Endpoints (la etiqueta endpoints_compatible lo confirma), exportación a ONNX Runtime o TorchScript para CPU, y servicios propios con FastAPI/Flask dentro de un contenedor. llama.cpp y Ollama no son la vía natural porque el modelo no es generativo y no se publican pesos GGUF. El soporte en vLLM no está confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos de comparación proceden de sus respectivas model cards públicas y no de la información aportada en esta ficha; se marcan como referencia orientativa.

| Modelo | Parámetros | Contexto | Clases | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Dhruv2508/sentiment-model | 66,96 M | 512 (modelo base) | No disponible | Apache-2.0 | Accuracy 0,6598; F1 macro 0,6493 en su conjunto de evaluación |
| distilbert-base-uncased-finetuned-sst-2-english | 66,96 M | 512 | 2 (positivo/negativo) | Apache-2.0 | Accuracy 0,9133 en SST-2 |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | 3 (negativo/neutro/positivo) | No disponible | No disponible |

La diferencia de accuracy con el DistilBERT ajustado en SST-2 (0,9133 frente a 0,6598) es de más de 25 puntos porcentuales con el mismo número de parámetros, lo que apunta a un dataset de ajuste pequeño (~1.856 ejemplos por época), ruidoso o con etiquetas poco consistentes. Cualquiera de las dos alternativas es preferible como punto de partida para un sistema de análisis de sentimiento en inglés. No se identifican más modelos comparables en la información disponible.

## Limitaciones y advertencias

- Rendimiento bajo: 0,6598 de accuracy y 0,6493 de F1 macro. En un problema binario equilibrado, esto supone una mejora modesta sobre un clasificador trivial que prediga siempre la clase mayoritaria.
- Calibración deficiente: una pérdida de evaluación de 0,7470 indica que las probabilidades de salida no son fiables como medida de confianza, por lo que fijar umbrales de decisión con ellas es arriesgado.
- Dataset de entrenamiento desconocido: la model card lo declara como "unknown dataset" y no especifica número de ejemplos, dominio, idioma ni procedencia, lo que impide evaluar sesgos y cobertura.
- Espacio de etiquetas no documentado: se desconoce cuántas clases hay y qué representa cada identificador, algo imprescindible para interpretar la salida.
- Documentación insuficiente: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen únicamente "More information needed".
- Sin validación comunitaria: cero descargas y cero valoraciones; nadie ha reportado resultados independientes.
- Alucinación: no aplica en sentido generativo, pero sí el riesgo equivalente de clasificaciones erróneas presentadas con alta confianza.
- Idioma: el tokenizador "uncased" del modelo base está orientado al inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Límite de contexto: 512 tokens por secuencia, heredado del modelo base; los textos largos deben truncarse o dividirse.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías y los derechos sobre los datos de entrenamiento son indeterminados.
- Uso responsable: no debe emplearse para decisiones de alto impacto (crédito, empleo, moderación automática sin supervisión) sin reevaluación en el dominio objetivo y auditoría de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dhruv2508/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Modelo base (organización): https://huggingface.co/distilbert/distilbert-base-uncased
- Referencia de la arquitectura del modelo base, artículo de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- No se encontraron otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
