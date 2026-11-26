# monster-anshu/indic-ner-muril-onnx-int8

## Resumen

Indic NER MuRIL Naamapadam ONNX int8 es una exportación cuantizada del modelo de reconocimiento de entidades nombradas (NER) `vaibhav006/indic-ner-muril-naamapadam`, publicada por el usuario monster-anshu. El modelo original se apoya en la arquitectura MuRIL (Multilingual Representations for Indian Languages), un transformer BERT-base entrenado por Google específicamente para lenguas del subcontinente indio, y ha sido afinado sobre el corpus Naamapadam de AI4Bharat para la tarea de token classification.

La relevancia de esta versión concreta está en el formato: se distribuye como un único fichero ONNX cuantizado dinámicamente a int8 (unos 227 MB frente a los 904 MB en fp32), lo que permite inferencia en CPU con ONNX Runtime sin necesidad de GPU. Está pensado para despliegues de bajo coste y baja latencia en entornos de producción donde el hardware acelerado no está disponible.

El modelo cubre tres idiomas: maratí (mr), panyabí (pa) y telugu (te). No introduce reentrenamiento alguno: los pesos proceden íntegramente del modelo padre y solo cambian el export y la cuantización. La licencia es Apache-2.0, heredada de la cadena de modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT-base (MuRIL), encoder bidireccional para token classification |
| Parametros totales | no disponible (arquitectura base MuRIL-base; el repo ocupa 0.5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (limitacion estandar de BERT-base: 512 tokens) |
| Tipos de cuantizacion | int8 dinamica, por canal (`--per_channel`), objetivo AVX512-VNNI |
| Idiomas soportados | marati (mr), panyabi (pa), telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`, ~227 MB); `ort_config.json`; tokenizer y config en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de la familia BERT, concretamente MuRIL-base, que Google entrenó sobre texto multilingüe indio con un vocabulario adaptado a escrituras del subcontinente. Sobre esa base, el modelo padre fue afinado para NER supervisado usando el dataset Naamapadam de AI4Bharat, con el conjunto de etiquetas BIO estándar: `B-PER`, `I-PER`, `B-LOC`, `I-LOC`, `B-ORG`, `I-ORG` y `O`.

Esta versión no reentrena ni modifica los pesos: aplica un export a ONNX con Optimum y una cuantización dinámica int8 por canal mediante `optimum-cli onnxruntime quantize --avx512_vnni --per_channel`. El autor advierte de que la cuantización por canal es imprescindible: sin ella (una sola escala por tensor de pesos) el modelo predice `O` para todos los tokens, lo que inutiliza la salida. La cuantización está orientada al conjunto de instrucciones AVX512-VNNI, por lo que el rendimiento es óptimo en CPU que lo soporten.

## Capacidades

- Reconocimiento de entidades nombradas en tres clases: persona (PER), localización (LOC) y organización (ORG).
- Etiquetado a nivel de token con esquema BIO y agregación a entidades completas mediante `aggregation_strategy="simple"` en el pipeline de Transformers.
- Inferencia en CPU con ONNX Runtime, sin dependencia de GPU.
- Procesamiento de texto en maratí, panyabí y telugu.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un modelo discriminativo de token classification, no generativo.
- Capacidad multilingüe limitada a los tres idiomas declarados; el autor menciona una comprobación puntual con hindi, hinglish, bengalí, tamil e inglés, pero no forma parte de los idiomas soportados oficialmente.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de noticias en maratí, panyabí o telugu: el modelo identifica personas, lugares y organizaciones en titulares y cuerpos de artículo para indexación y búsqueda semántica, con coste de CPU únicamente.
- Anonimización de datos personales (PII): detección de nombres de persona (`B-PER`/`I-PER`) en textos antes de almacenarlos o compartirlos, como paso previo a la seudonimización en cumplimiento de normativa de protección de datos.
- Enriquecimiento de bases de datos documentales: etiquetado automático de entidades en corpus administrativos o legales en lenguas indias para construir grafos de conocimiento y facilitar consultas estructuradas.
- Moderación y análisis de contenido generado por usuarios: extracción de organizaciones y localizaciones mencionadas en comentarios o publicaciones para clasificación temática y detección de menciones sensibles.
- Despliegue en entornos edge o servidores sin GPU: al ser un ONNX int8 de ~227 MB, cabe en contenedores ligeros y en máquinas modestas, lo que permite servir NER en infraestructura de bajo coste o en local.
- Preprocesamiento para sistemas RAG en lenguas indias: identificar entidades en los documentos recuperados para desambiguar referencias y mejorar la precisión de la respuesta final.
- Etiquetado asistido en anotación de corpus: generar preanotaciones de entidades que los anotadores humanos revisan, acelerando la creación de datasets NER en maratí, panyabí y telugu.

## Benchmarks y rendimiento

El autor no ha remedido el F1 sobre Naamapadam para esta versión cuantizada. Los únicos datos publicados son los del modelo padre, que se reproducen a continuación:

| Idioma | F1 (modelo padre, Naamapadam) | F1 (esta versión int8) |
|---|---|---|
| Maratí (mr) | 0.834 | no medido |
| Telugu (te) | 0.833 | no medido |
| Panyabí (pa) | 0.733 | no medido |

El autor indica que las etiquetas predichas coincidieron con el export fp32 en todos los tokens de una comprobación puntual de 7 frases (hindi, hinglish, bengalí, tamil, maratí e inglés), pero se trata de una verificación cualitativa, no de una evaluación sistemática. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU. En GPU podría ejecutarse con ONNX Runtime, pero el export está optimizado para AVX512-VNNI.
- Memoria RAM estimada: aproximadamente 227 MB para los pesos int8 más el overhead del runtime y del tokenizer; en la práctica, menos de 1 GB por proceso.
- CPU recomendada: procesadores con soporte AVX512-VNNI (generaciones recientes de Intel Xeon Scalable y algunos Core). En CPU sin ese conjunto de instrucciones el modelo funciona, pero con menor rendimiento.
- GPU: no necesaria. Cabe en cualquier GPU consumer, pero no aporta ventaja frente a la ruta CPU optimizada.
- Opciones de despliegue: ONNX Runtime con `ORTModelForTokenClassification` de Optimum, pipeline `token-classification` de Transformers, y servidores de inferencia compatibles con ONNX (por ejemplo, Triton o servicios propios basados en ONNX Runtime). No se distribuye en GGUF, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| monster-anshu/indic-ner-muril-onnx-int8 | no disponible (MuRIL-base) | no disponible (512 en BERT-base) | mr, pa, te | ONNX int8 | Apache-2.0 |
| vaibhav006/indic-ner-muril-naamapadam | no disponible (MuRIL-base) | no disponible (512 en BERT-base) | mr, pa, te | safetensors / PyTorch | Apache-2.0 |
| google/muril-base-cased | no disponible (BERT-base) | 512 | multilingüe indio | safetensors / PyTorch | Apache-2.0 |

La diferencia principal frente al modelo padre es el formato y el tamaño (227 MB frente a 904 MB en fp32), con la contrapartida de una posible pérdida de precisión no cuantificada. Frente a `google/muril-base-cased`, esta versión está ya afinada para NER y lista para producción, mientras que el modelo de Google es una base sin cabeza de clasificación. No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Solo se declaran tres idiomas (maratí, panyabí, telugu); el rendimiento en otros idiomas, aunque MuRIL sea multilingüe, no está garantizado ni evaluado.
- El F1 de la versión int8 no se ha medido: existe riesgo de degradación respecto al modelo padre (0.834 / 0.833 / 0.733), especialmente en panyabí, que ya parte del valor más bajo.
- La cuantización depende de `--per_channel`; configuraciones alternativas pueden producir salidas degeneradas (todo `O`), como advierte el autor.
- El rendimiento óptimo requiere CPU con AVX512-VNNI; en hardware sin ese soporte la velocidad puede ser notablemente inferior.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de errores de etiquetado: falsos positivos y negativos en entidades ambiguas, nombres propios poco frecuentes y fronteras de entidad mal delimitadas.
- Sesgos heredados del corpus Naamapadam y de MuRIL: posible infrarrepresentación de determinados dominios, registros o variantes dialectales.
- Limitación de contexto estándar de BERT-base (512 tokens); textos más largos requieren fragmentación con riesgo de perder entidades en los límites.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la cadena de licencias de los modelos base y del dataset Naamapadam antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/monster-anshu/indic-ner-muril-onnx-int8
- Modelo padre: https://huggingface.co/vaibhav006/indic-ner-muril-naamapadam
- Modelo base original: https://huggingface.co/google/muril-base-cased
- Dataset Naamapadam: https://huggingface.co/datasets/ai4bharat/naamapadam
