# Fatihaybasn/pathfinder-minilm-intent-onnx-int8

## Resumen

PathFinder MiniLM-L6 Intent Classifier es un modelo de clasificación de intenciones de cinco clases, desarrollado por Fatihaybasn para el proyecto PathFinderShip. Se basa en el modelo MiniLM-L6-H384-uncased de Microsoft, fine-tuning con un conjunto de datos propio y exportado a formato ONNX con cuantización INT8 para una inferencia eficiente en CPU. El modelo está diseñado específicamente para reconocer intenciones relacionadas con el control de una cámara en un barco no tripulado: abrir cámara, cerrar cámara, tomar foto, detección de objetos y chat.

Su relevancia radica en que ofrece una solución ligera y de bajo coste computacional para clasificación de intenciones en tiempo real, con un tamaño reducido (MiniLM-L6 tiene alrededor de 22 millones de parámetros, aunque no se especifica el número exacto en la documentación) y una ventana de contexto de 96 tokens, suficiente para comandos cortos. La cuantización INT8 reduce aún más el uso de memoria y acelera la inferencia en dispositivos con recursos limitados, como microcontroladores o sistemas embebidos.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación, y está disponible en HuggingFace con el pipeline de text-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6-H384-uncased) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer MiniLM-L6-H384-uncased, una variante compacta de BERT con 6 capas y 384 dimensiones ocultas. El entrenamiento se realizó con una longitud máxima de secuencia de 96 tokens, una tasa de aprendizaje de 2e-5, cuatro épocas, batch de entrenamiento de 32 y batch de evaluación de 64, todo ejecutado en CPU. No se menciona el uso de RLHF ni DPO; es un ajuste fino supervisado estándar para clasificación de secuencias.

La innovación principal es la exportación a formato ONNX con cuantización INT8, lo que permite una inferencia rápida y con bajo consumo de memoria en entornos de producción sin GPU. El modelo utiliza el tokenizer de MiniLM-L6-H384-uncased y devuelve logits que se convierten en una etiqueta de intención mediante argmax.

## Capacidades

- Clasificación de intenciones en cinco clases fijas: `open_camera`, `close_camera`, `take_photo`, `object_detect` y `chat`.
- Procesamiento de texto en inglés, con soporte para secuencias de hasta 96 tokens.
- Inferencia eficiente en CPU gracias a la cuantización INT8 y al formato ONNX.
- Integración sencilla con ONNX Runtime y la librería `transformers` para tokenización.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Control de cámara en vehículos autónomos: el modelo puede interpretar comandos de voz o texto para abrir o cerrar la cámara en un dron o barco no tripulado, gracias a su baja latencia y pequeño tamaño.
- Sistema de captura de imágenes: permite activar la toma de fotografías mediante instrucciones textuales, útil en aplicaciones de vigilancia o documentación automática.
- Detección de objetos: la intención `object_detect` puede activar un módulo de visión por computadora cuando el usuario solicita explícitamente esa función.
- Asistente conversacional de a bordo: la clase `chat` actúa como fallback para cualquier consulta que no corresponda a las otras cuatro intenciones, permitiendo integrar un chatbot en el sistema.
- Automatización de flujos en robótica: el modelo puede ser embebido en un pipeline de control donde las intenciones disparan acciones concretas, reduciendo la necesidad de un parser manual.
- Evaluación de comandos en tiempo real: al ser un modelo pequeño y cuantizado, puede ejecutarse en dispositivos edge como Raspberry Pi o Jetson Nano para procesar comandos de voz con baja latencia.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación:

| Conjunto de evaluación | Ejemplos | Accuracy | Macro-F1 | Weighted-F1 | ECE (10 bins) |
|---|---:|---:|---:|---:|---:|
| Split histórico (notebook) | 600 | 1.0000 | 1.0000 | 1.0000 | No reportado |
| Conjunto de estrés congelado | 1,000 | 1.0000 | 1.0000 | 1.0000 | 0.1813 |

El autor advierte que el split histórico contiene riesgo de solapamiento entre entrenamiento y evaluación, por lo que el resultado perfecto debe interpretarse con cautela. El conjunto de estrés congelado, diseñado para ser determinista, también alcanza una accuracy perfecta, pero el ECE de 0.1813 indica que la calibración de probabilidades no es perfecta, aunque todas las predicciones fueron correctas. No se han publicado comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: el modelo está optimizado para CPU mediante ONNX Runtime con `CPUExecutionProvider`, por lo que no requiere GPU.
- Memoria: al ser un modelo MiniLM-L6 con cuantización INT8, el archivo ONNX ocupa aproximadamente unos 20-25 MB (estimación basada en el tamaño típico de MiniLM-L6 cuantizado; no se especifica el tamaño exacto en la información disponible).
- GPUs: no necesario; puede ejecutarse en cualquier CPU moderna, incluyendo sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), también puede convertirse a otros formatos si se requiere.
- Latencia y throughput: no se proporcionan datos específicos, pero la cuantización INT8 y el pequeño tamaño del modelo permiten inferencias en milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. No obstante, por su naturaleza, podría compararse con otros clasificadores de intención basados en BERT pequeño, como DistilBERT o TinyBERT, pero no hay datos de rendimiento de esos modelos en el mismo conjunto de datos. Por tanto, esta sección queda como no disponible.

## Limitaciones y advertencias

- El vocabulario de intenciones es específico del proyecto PathFinderShip y no constituye una taxonomía general de intenciones; no debe usarse fuera de ese dominio sin reentrenamiento.
- La calibración de probabilidades no es perfecta (ECE 0.1813), por lo que las puntuaciones de confianza no deben usarse como umbrales de seguridad estrictos.
- Entradas que no correspondan a ninguna de las cinco intenciones se clasificarán como `chat`, lo que puede generar falsos positivos en aplicaciones críticas.
- El modelo solo soporta inglés; no hay soporte multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero el autor no garantiza el rendimiento en entornos de producción sin una evaluación adicional.
- El tamaño del repositorio aparece como 0.0 GB, lo que sugiere que puede haber un error en los metadatos o que el archivo del modelo no está correctamente subido; se recomienda verificar la integridad del archivo antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fatihaybasn/pathfinder-minilm-intent-onnx-int8
- Proyecto PathFinderShip (documentación): https://github.com/fatihaybsn/PathFinder-Ship/tree/showcase/model-benchmarks-diagent-dogfooding
