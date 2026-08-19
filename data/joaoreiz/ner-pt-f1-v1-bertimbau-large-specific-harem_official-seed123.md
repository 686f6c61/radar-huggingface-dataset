# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed123` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, desarrollado por JoaoReiz. Se trata de un fine-tuning del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el subconjunto `harem_official` del protocolo NEVE NER, con una semilla fija de 123 y selección de mejor modelo basada en F1 end-to-end sobre validación.

El modelo está pensado para tareas de etiquetado de secuencias (token classification) y su pipeline es `token-classification`. Con 333 millones de parámetros, es una variante grande de BERT adaptada específicamente al dominio NER en portugués, lo que lo hace relevante para aplicaciones de extracción de información en este idioma. El repositorio incluye pesos en formato safetensors y es compatible con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder) |
| Parametros totales | 333.368.341 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típicamente 512 en BERT, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT large, un transformer encoder-only con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención (datos típicos de BERT large, aunque no se especifican en la documentación del repositorio). El entrenamiento consiste en un fine-tuning supervisado para clasificación de tokens (NER) sobre el conjunto `harem_official` del protocolo NEVE, un estándar para evaluación de NER en portugués. Se utilizó una semilla fija (123) y la selección del mejor checkpoint se realizó mediante la métrica `validation_end_to_end_f1`. No se dispone de información sobre el número de épocas, tasa de aprendizaje ni técnicas de regularización empleadas.

## Capacidades

- Reconocimiento de entidades nombradas en portugués: identifica personas, organizaciones, lugares, fechas, etc., dependiendo de las etiquetas definidas en el conjunto `harem_official`.
- Clasificación de tokens a nivel de secuencia: adecuado para pipelines de extracción de información.
- Soporte de contexto bilingüe (portugués de Brasil y posiblemente portugués europeo, aunque el entrenamiento se basa en corpus brasileño BrWaC).
- No se especifican capacidades de tool calling, agentes o razonamiento multi-paso; es un modelo puramente discriminativo para NER.

## Casos de uso

- Extracción de entidades en documentos jurídicos portugueses: el modelo puede identificar nombres de partes, tribunales, fechas y lugares en sentencias o contratos, facilitando la automatización de procesos legales.
- Análisis de noticias y artículos periodísticos: permite extraer organizaciones, personas y ubicaciones para generar alertas temáticas o resúmenes automáticos.
- Procesamiento de currículos y ofertas de empleo: identifica habilidades, títulos académicos y nombres de empresas en textos de RRHH.
- Sistemas de atención al cliente: extrae nombres de productos, números de pedido o datos de contacto en conversaciones escritas.
- Análisis de redes sociales: detecta menciones a marcas, personas influyentes y lugares en publicaciones de Twitter o Facebook.
- Enriquecimiento de bases de datos bibliográficas: extrae autores, títulos y afiliaciones de referencias académicas en portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (F1, precisión, recall) sobre conjuntos de prueba estándar como HAREM o MiniHAREM. Se recomienda consultar la documentación del protocolo NEVE para posibles comparaciones futuras.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo BERT large de 333M parámetros, en FP32 requiere aproximadamente 1,3 GB de memoria para los pesos, más memoria para activaciones y atención. Con cuantización a 8 bits se podría reducir a ~700 MB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar inferencia por lotes pequeños (por ejemplo, NVIDIA GTX 1650, RTX 3060). Para producción con alta concurrencia, se recomienda una GPU con 8 GB o más (RTX 3070, A10, L4).
- Es viable en CPU para inferencia de baja latencia, aunque más lenta.
- Opciones de despliegue: compatible con Hugging Face Transformers, puede servirse con FastAPI, ONNX Runtime o TensorRT. No se menciona soporte específico para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso NER |
|---|---|---|---|---|
| JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed123 | 333M | no disponible | no disponible | Específico para NER en portugués |
| JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-harem_official-seed123 | ~110M (base) | no disponible | no disponible | Misma tarea, versión base |
| BERTimbau base (neuralmind/bert-base-portuguese-cased) | 110M | 512 | MIT (original) | Modelo base, requiere fine-tuning |
| BERTimbau large (neuralmind/bert-large-portuguese-cased) | 335M | 512 | MIT (original) | Modelo base, requiere fine-tuning |

Nota: los datos de parámetros de los modelos base se estiman de la documentación pública de BERTimbau; el modelo fine-tuned no especifica su licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre corpus brasileño (BrWaC), puede tener un sesgo hacia el portugués de Brasil, con menor precisión en variantes europeas o africanas.
- Riesgo de alucinación: al ser un modelo discriminativo de clasificación de tokens, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero puede cometer errores de etiquetado en entidades poco frecuentes o ambiguas.
- Limitaciones de contexto: la longitud máxima de secuencia típica de BERT es 512 tokens, lo que limita el procesamiento de documentos largos sin segmentación previa.
- Restricciones de licencia: no se ha especificado la licencia del modelo fine-tuned; se debe contactar al autor para aclarar términos de uso comercial.
- Dependencia del conjunto de etiquetas: el modelo está entrenado para las etiquetas específicas del protocolo NEVE, por lo que no es directamente reutilizable para otros esquemas de NER sin reentrenamiento.

## Enlaces

- [HuggingFace: JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed123](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-harem_official-seed123)
- [HuggingFace: versión base del mismo autor](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-harem_official-seed123)
- [GitHub: portuguese-Bertimbau (repositorio de BERTimbau)](https://github.com/ClaudioSS01/portuguese-Bertimbau)
- [Artículo académico: BERTimbau - Pretrained BERT Models for Brazilian Portuguese](https://dl.acm.org/doi/10.1007/978-3-030-61377-8_28)
- [Repositorio CLARIN: BERTimbau Portuguese BERT-Base](https://portulanclarin.net/repository/browse/bertimbau-portuguese-bert-base-language-model/486edb32e93711ebabf702420a8701536b383b588f2f4c85b13b4d04c2867a4b/)
