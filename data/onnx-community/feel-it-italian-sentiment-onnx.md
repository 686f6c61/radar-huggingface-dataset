# onnx-community/feel-it-italian-sentiment-ONNX

## Resumen

El modelo `onnx-community/feel-it-italian-sentiment-ONNX` es una conversión a formato ONNX del modelo original `MilaNLProc/feel-it-italian-sentiment`, desarrollado por el grupo de procesamiento de lenguaje natural de la Universidad de Milán (MilaNLProc). Se trata de un clasificador de sentimiento binario (positivo/negativo) para el idioma italiano, obtenido mediante fine-tuning del modelo UmBERTo sobre el corpus FEEL-IT, un conjunto de 2037 tuits anotados con cuatro emociones básicas (ira, miedo, alegría y tristeza) que posteriormente se colapsan en dos clases de sentimiento.

La relevancia de esta versión ONNX radica en que permite ejecutar el modelo en entornos de producción con baja latencia, sin depender de PyTorch, y es compatible con librerías como `transformers.js` para su uso en navegador o en aplicaciones Node.js. El repositorio tiene un tamaño de 1,1 GB, lo que sugiere la inclusión de múltiples variantes de cuantización u optimización, aunque no se detalla en la documentación. Es una opción práctica para análisis de sentimiento en italiano en tiempo real, con un coste computacional reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (similar a BERT), basado en UmBERTo |
| Parametros totales | no disponible (se estima ~110 M por ser similar a BERT-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX, sin detalle de cuantización) |
| Idiomas soportados | Italiano |
| Licencia | Términos comerciales de Twitter (según model card original) |
| Formato de pesos | ONNX (probablemente también safetensors en el repo original, pero esta versión es ONNX) |

## Arquitectura y entrenamiento

El modelo base es UmBERTo, una variante de BERT entrenada sobre texto italiano de Common Crawl. Sobre esta arquitectura se realizó un fine-tuning con el corpus FEEL-IT, compuesto por 2037 tuits anotados manualmente con una de cuatro emociones (ira, miedo, alegría, tristeza). Para la tarea de análisis de sentimiento, las clases de emoción se colapsan en dos: alegría se mapea a positivo, mientras que ira, miedo y tristeza se mapean a negativo. El entrenamiento se realizó con la configuración estándar de clasificación de secuencias, utilizando la capa de clasificación de BERT sobre el token `[CLS]`. No se emplearon técnicas como RLHF o DPO; es un ajuste fino supervisado clásico. La conversión a ONNX fue automática mediante el espacio de Hugging Face `onnx-community/convert-to-onnx`, sin modificaciones adicionales en los pesos.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) para textos en italiano.
- Inferencia rápida gracias al formato ONNX, apto para entornos sin GPU o con restricciones de dependencias.
- Compatible con `transformers.js`, lo que permite ejecutar el modelo directamente en navegadores web o en Node.js.
- Integración sencilla con la API de pipelines de Hugging Face (`text-classification`).
- No soporta generación de texto, tool calling, ni tareas de razonamiento complejo; es un clasificador especializado.

## Casos de uso

- **Análisis de opiniones en redes sociales**: permite monitorizar la percepción de una marca o producto en tuits en italiano, clasificando automáticamente si el tono es positivo o negativo. Su tamaño reducido posibilita el procesamiento en streaming con alta frecuencia.
- **Atención al cliente automatizada**: integrado en un sistema de tickets, puede preclasificar los mensajes entrantes según su sentimiento para priorizar quejas o comentarios negativos. La inferencia en CPU es suficientemente rápida para responder en tiempo real.
- **Análisis de reseñas de productos**: útil para categorizar comentarios en plataformas de comercio electrónico italianas, ayudando a detectar problemas recurrentes o valoraciones extremas.
- **Monitorización de campañas políticas o eventos**: análisis de la reacción pública en Twitter ante noticias o debates, clasificando el sentimiento de los tuits en italiano.
- **Investigación académica en PLN**: sirve como modelo baseline para tareas de análisis de sentimiento en italiano, dado que está publicado con su corpus y resultados de referencia.
- **Aplicaciones de análisis de sentimiento en tiempo real**: al ser un modelo ONNX, puede desplegarse en funciones serverless o en dispositivos edge, ofreciendo clasificación sin depender de servicios externos.

## Benchmarks y rendimiento

La model card original reporta resultados sobre el conjunto de test de SENTIPOLC16 (Evalita 2016). Se comparan tres configuraciones de entrenamiento: solo con SENTIPOLC16, solo con FEEL-IT, y con ambos. Los resultados son:

| Configuración de entrenamiento | Macro-F1 | Accuracy |
|---|---|---|
| SENTIPOLC16 | 0.80 | 0.81 |
| FEEL-IT | **0.81** | **0.84** |
| FEEL-IT + SENTIPOLC16 | 0.81 | 0.82 |

No se han publicado resultados adicionales de benchmarks como MMLU o HumanEval, ya que no es un modelo generativo. El rendimiento en otras tareas de sentimiento en italiano no está documentado en la información disponible.

## Requisitos de hardware

- **VRAM**: al ser un modelo de tipo BERT-base (~110 M parámetros), la inferencia puede ejecutarse en CPU sin necesidad de GPU. El consumo de memoria para la versión ONNX depende de la cuantización, pero típicamente es inferior a 1 GB en FP32.
- **GPU recomendadas**: no se requiere GPU; cualquier CPU moderna es suficiente. Si se desea acelerar, una GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650 o superior) bastaría, aunque la ganancia sería marginal para este tamaño.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU con soporte CUDA o incluso integradas (mediante DirectML) puede ejecutarlo.
- **Opciones de despliegue**: puede usarse con `transformers.js` en navegador, con `onnxruntime` en Node.js o Python, o mediante servidores de inferencia como Triton o FastAPI con ONNX Runtime. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no es el formato original.
- **Latencia y throughput**: no se han publicado mediciones oficiales. En una CPU moderna (por ejemplo, Intel i7 de 8ª generación), se espera una latencia de inferencia de 10-50 ms por frase corta, dependiendo de la longitud y del backend.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de análisis de sentimiento en italiano en la información proporcionada. El modelo original `feel-it-italian-sentiment` se compara en el paper con SENTIPOLC16, pero no con otros modelos como `bert-base-italian-uncased` fine-tuneado o `GiGaBERT`. Por tanto, no se puede ofrecer una comparativa cuantitativa fiable. Como referencia cualitativa:

| Modelo | Arquitectura | Tamaño | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `feel-it-italian-sentiment` (original) | UmBERTo (BERT) | ~110 M | 512 | Términos de Twitter | PyTorch |
| `feel-it-italian-sentiment-ONNX` (este) | UmBERTo (BERT) | ~110 M | 512 | Términos de Twitter | ONNX |
| `bert-base-italian-uncased` (fine-tuneado para sentimiento) | BERT | ~110 M | 512 | Apache 2.0 | PyTorch |

La ventaja de la versión ONNX es su portabilidad y compatibilidad con entornos de inferencia ligeros.

## Limitaciones y advertencias

- **Dominio limitado**: el modelo se entrenó exclusivamente con tuits italianos, por lo que su rendimiento puede degradarse en textos formales, largos o de otros dominios (por ejemplo, documentos legales o artículos académicos).
- **Clases binarias**: no distingue emociones específicas; solo clasifica positivo/negativo. Para emociones detalladas es necesario usar el modelo `feel-it-italian-emotion`.
- **Tamaño del corpus de entrenamiento**: solo 2037 tuits anotados, lo que puede limitar la generalización y aumentar el riesgo de sobreajuste a ciertos temas o jerga.
- **Sesgos**: al provenir de Twitter, el modelo puede reflejar sesgos presentes en esa plataforma (lenguaje informal, sarcasmo, ironía) y no capturar matices culturales fuera de ese contexto.
- **Alucinación y errores**: como clasificador, no genera texto, pero puede producir clasificaciones erróneas en frases ambiguas o con ironía, algo común en el análisis de sentimiento.
- **Licencia**: la model card original remite a los términos comerciales de Twitter, lo que puede imponer restricciones al uso comercial del modelo o de los datos. Se recomienda revisar esos términos antes de desplegarlo en producción.
- **Formato ONNX**: aunque facilita la inferencia, no se garantiza que todas las operaciones estén optimizadas para todas las plataformas; puede requerir ajustes de compatibilidad en algunos backends.

## Enlaces

- [Repositorio HuggingFace del modelo ONNX](https://huggingface.co/onnx-community/feel-it-italian-sentiment-ONNX)
- [Modelo original en HuggingFace](https://huggingface.co/MilaNLProc/feel-it-italian-sentiment)
- [Repositorio GitHub del proyecto FEEL-IT](https://github.com/MilaNLProc/feel-it)
- [Paquete Python feel-it en PyPI](https://pypi.org/project/feel-it/)
- [Paper académico (ACL Anthology)](https://aclanthology.org/2021.wassa-1.8/)
- [Espacio de conversión a ONNX](https://huggingface.co/spaces/onnx-community/convert-to-onnx)
