# mapo80/mmbert-small-aliasit-32k

## Resumen

El modelo `mapo80/mmbert-small-aliasit-32k` es una adaptación del encoder multilingüe `jhu-clsp/mmBERT-small` (basado en arquitectura ModernBERT) en la que se ha recortado el vocabulario original de 256.000 tokens a 32.768 tokens, seleccionados a partir de las frecuencias observadas en el dataset `aliasit-pii-dataset-v2`. El objetivo es reducir el tamaño del modelo y acelerar el entrenamiento posterior para tareas de reconocimiento de entidades (NER) y detección de información personal (PII) en seis idiomas europeos: italiano, inglés, francés, alemán, español y portugués.

No se trata de un modelo fine-tuned: es un backbone preparado como punto de partida para un ajuste fino específico. El recorte reduce los parámetros totales de 140,9 millones a 55,0 millones, manteniendo intacto el encoder (42,4 millones de parámetros) y eliminando la mayor parte de la capa de embeddings (de 98,3M a 12,6M). El modelo se distribuye con licencia MIT y está pensado para ser usado con la librería `transformers` para tareas de clasificación de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 54.953.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de mmBERT-small, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors de precisión completa) |
| Idiomas soportados | italiano, ingles, frances, aleman, español, portugues |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `jhu-clsp/mmBERT-small` es un encoder multilingüe basado en la arquitectura ModernBERT, entrenado con 3 billones de tokens en 1.833 lenguas mediante la técnica de *annealed language learning* (ALL). En esta variante, el vocabulario se ha reducido de 256.000 a 32.768 tokens mediante un proceso de *vocabulary trimming* sobre 48.000 documentos (8.000 por cada uno de los seis idiomas objetivo). El muestreo se realizó de forma balanceada para evitar que el italiano, que representa el 45% del corpus original, dominara la selección.

Los 32.768 tokens retenidos cubren el 98,088% de las ocurrencias observadas e incluyen siempre los tokens especiales y los 256 tokens byte, que garantizan que ningún carácter se convierta en `<unk>` gracias al mecanismo `byte_fallback`. Además, se aplicó un pre-tokenizador que aísla la puntuación, evitando que los límites de entidades queden dentro de un token (problema que afectaba al 2,6% de los spans en una muestra de 2.654 entidades y que se reduce al 0,377% con esta medida). El modelo no ha sido fine-tuned; es el punto de partida para un ajuste posterior con el dataset `aliasit-pii-dataset-v2`.

## Capacidades

- Encoder para tareas de *fill-mask* y clasificación de tokens (NER, etiquetado BIO).
- Soporte multilingüe en seis idiomas: italiano, inglés, francés, alemán, español y portugués.
- Vocabulario optimizado para dominios con identificadores estructurados (códigos fiscales, IBAN, números de teléfono, etc.), con fragmentación mínima en estos tipos de entidades.
- No incluye capacidades generativas, *tool calling*, agentes, visión ni audio.
- No está entrenado para reconocimiento de PII; requiere fine-tuning para esa tarea.

## Casos de uso

- Entrenamiento de un modelo de reconocimiento de entidades (NER) para datos personales: el modelo sirve como backbone para fine-tuning con el dataset `aliasit-pii-dataset-v2`, que contiene anotaciones de PII en seis idiomas. Su vocabulario recortado reduce el coste de entrenamiento y la huella de memoria.
- Detección de información personal en documentos legales o administrativos: al estar optimizado para identificadores como códigos fiscales, IBAN o números de expediente, el modelo fine-tuneado puede localizar y clasificar estos campos en textos multilingües.
- Preprocesamiento de textos para anonimización: tras el fine-tuning, el modelo puede usarse para marcar entidades que deben ser enmascaradas antes de publicar o compartir documentos.
- Clasificación de tokens en dominios con vocabulario técnico específico: el recorte se basa en un corpus de PII, pero el encoder subyacente conserva las representaciones multilingües de mmBERT, por lo que puede adaptarse a otros dominios con un fine-tuning adicional.
- Evaluación de técnicas de *vocabulary trimming*: este modelo es un caso de estudio para medir el impacto de reducir el vocabulario en el rendimiento de tareas downstream, especialmente en contextos multilingües.
- Base para experimentos de *continued pre-training*: al ser un modelo pequeño (55M parámetros), es adecuado para probar estrategias de entrenamiento adicional con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `mmBERT-small` reporta mejoras sobre XLM-R en tareas multilingües, pero este recorte concreto no incluye métricas de evaluación en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precisión fp32 (55M parámetros). Con cuantización a 8 bits o 4 bits, el consumo sería aún menor, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas para inferencia.
- Compatible con GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: al ser un modelo de `transformers`, puede usarse con `pipeline` de Hugging Face, `vLLM` (aunque es un encoder, no generativo), `ONNX Runtime` o `llama.cpp` si se convierte a GGUF (no incluido).
- Latencia y throughput: al ser un modelo pequeño, la inferencia es rápida; en una GPU moderna se pueden procesar cientos de secuencias por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| `mapo80/mmbert-small-aliasit-32k` | 55,0M | 32.768 | no disponible | 6 | MIT |
| `jhu-clsp/mmBERT-small` | 140,9M | 256.000 | no disponible | 1.833 | MIT |
| `xlm-roberta-base` | 278M | 250.000 | 512 | 100 | MIT |

El recorte reduce significativamente el tamaño respecto al modelo base, a costa de limitar el vocabulario a seis idiomas. `xlm-roberta-base` es una alternativa más establecida para NER multilingüe, pero con más parámetros y un contexto más corto. No se dispone de comparativas de rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo final: no está fine-tuneado para reconocimiento de PII ni para ninguna tarea específica. Usarlo directamente para clasificación de tokens producirá resultados aleatorios.
- El vocabulario recortado puede perder cobertura en dominios fuera del corpus de entrenamiento (por ejemplo, textos técnicos o científicos que no aparecen en el dataset de PII).
- La fragmentación de identificadores estructurados aumenta ligeramente en algunas categorías (email, número de caso judicial, identificador catastral), lo que puede afectar al etiquetado BIO si no se maneja adecuadamente.
- El modelo solo soporta seis idiomas; fuera de ellos, la tokenización puede degradarse o producir `<unk>` (aunque el `byte_fallback` mitiga este riesgo).
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un encoder, no genera texto, pero los embeddings pueden reflejar sesgos del corpus original de mmBERT.
- La licencia MIT permite uso comercial sin restricciones, pero el dataset `aliasit-pii-dataset-v2` puede tener sus propias condiciones; conviene revisarlas antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mapo80/mmbert-small-aliasit-32k
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Blog de mmBERT: https://huggingface.co/blog/mmbert
- Paper de mmBERT: https://arxiv.org/html/2509.06888v1
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT
- Dataset asociado: https://huggingface.co/datasets/mapo80/aliasit-pii-dataset-v2
