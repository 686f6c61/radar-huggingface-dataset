# algerian-nlp/DZAIR-ONNX

## Resumen

DZAIR-ONNX es la exportación oficial a ONNX Runtime del encoder fundacional algerian-nlp/DZAIR, un modelo de 105,3 millones de parámetros especializado en dariya argelina (código de idioma `arq`), tanto en escritura árabe como en arabizi latino. Lo publica el proyecto algerian-nlp y su función principal es la extracción de características (pipeline `feature-extraction`): produce representaciones vectoriales de 768 dimensiones para búsqueda semántica, clasificación de intenciones y ranking de documentos en un dialecto escasamente cubierto por los modelos multilingües genéricos.

La relevancia de esta variante concreta no está en el modelo base, sino en el formato: se trata de un grafo ONNX FP32 con opset 18 que mantiene paridad matemática bit a bit con el modelo PyTorch original (fidelidad de coseno 1.000000, MAE de 1e-6, diferencia absoluta máxima de 5e-6) y que, además, acelera la inferencia en CPU un 21,0 % (de 4.112 a 4.974 tokens por segundo) mediante fusión de operadores y optimización de grafo con `optimum[onnxruntime]`. Es, por tanto, una pieza pensada para desplegar NLP en dariya en servidores sin GPU.

El repositorio pesa 0,4 GB, contiene un único `model.onnx` de 404,07 MB, un tokenizador SentencePiece Unigram de 48.000 tokens y reglas de normalización argelinas versionadas. Está publicado bajo licencia Apache-2.0 y, en el momento de la consulta, acumula 0 descargas y 0 valoraciones, por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (familia BERT-like) exportado a ONNX; dimensión oculta 768; el model card solo indica "encoder", sin detallar número de capas ni cabezas de atención |
| Parametros totales | 105,3 millones (heredados del modelo base algerian-nlp/DZAIR) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | El repositorio distribuido contiene unicamente el grafo FP32 (`model.onnx`, 404,07 MB); no se publican variantes INT8/FP16. La model card menciona el script `tools/quantize_onnx.py` para verificación de fidelidad (umbral de coseno >= 0,99999), no artefactos cuantizados |
| Idiomas soportados | `arq` (dariya argelina) en escritura árabe y en arabizi latino; no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18, FP32), más `config.json`, `tokenizer.model` (SentencePiece Unigram, 48.000 tokens), `tokenizer_config.json` y `tokenizer_rules.yaml` |

## Arquitectura y entrenamiento

El modelo es un encoder tipo transformer (no autorregresivo) con representaciones de 768 dimensiones y un vocabulario SentencePiece Unigram de 48.000 piezas, dimensionado para absorber tanto grafía árabe como transliteración arabizi. La exportación se realizó con Hugging Face Optimum y el exportador PyTorch-ONNX sobre unos pesos base cuyo SHA-256 es `b2448ca8dbc015cd90e13fce851122a15ac2855ff445c09f4af36d382709c006`; el grafo resultante declara los execution providers `CPUExecutionProvider` y `CUDAExecutionProvider` y pasó una puerta de fidelidad de liberación (coseno >= 0,99999). No se especifican en la información disponible el número de capas, el número de cabezas, el volumen de tokens de entrenamiento ni si el modelo base usó RLHF, DPO u objetivos de enmascaramiento adicionales; tampoco se detalla la composición del corpus.

La innovación destacable es de empaquetado y ejecución: el tokenizador incorpora reglas de normalización argelinas versionadas en `tokenizer_rules.yaml` (unificación de hamzas, eliminación de tatweels no semánticos) y la model card advierte de dos reglas de preparación de entrada que afectan al rendimiento real: convertir a minúsculas los caracteres latinos antes de tokenizar y no eliminar los numerales del arabizi (3 para ayn, 7 para ha). El resultado es un artefacto apto para servicios backend donde evitar la dependencia de PyTorch reduce el tamaño de imagen de contenedor y la latencia de arranque.

## Capacidades

- Extracción de características y embeddings de frases: devuelve `last_hidden_state` con forma `[batch, seq_len, 768]` para texto en dariya argelina en árabe o arabizi.
- Búsqueda semántica y recuperación de documentos en dariya (uso declarado como aplicación primaria).
- Clasificación de intenciones y enrutado de consultas, mediante una cabeza de clasificación entrenada sobre los embeddings.
- Ranking de documentos y similitud semántica por coseno.
- Análisis de sentimiento como tarea derivada: la model card reporta resultados con una cabeza `cls+mlp` entrenada 3 épocas, evaluada sobre 10 semillas.
- Capacidad multilingüe limitada: solo se declara `arq`; cubre tanto grafía árabe como arabizi latino con el mismo vocabulario.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: es un encoder, no un modelo autorregresivo.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda semántica en dariya para catálogos de producto o bases documentales: los embeddings de 768 dimensiones permiten indexar textos en árabe argelino y arabizi en un mismo espacio vectorial, de modo que una consulta en arabizi recupera un documento escrito en grafía árabe.
- Enrutado de intenciones en atención al cliente: dado que el modelo se ejecuta en CPU a 4.974 tokens/s, un clasificador construido sobre sus embeddings puede clasificar cada mensaje entrante y dirigirlo al flujo o al agente adecuado sin coste de GPU.
- Moderación y análisis de sentimiento en foros y redes argelinas: la model card documenta un 96,33 % de exactitud en texto de foro (dataset Ranim), lo que lo hace utilizable para monitorizar opinión en plataformas de discusión.
- Deduplicación y agrupación de reseñas o comentarios: los embeddings permiten agrupar variantes ortográficas equivalentes de una misma frase, algo frecuente cuando se mezcla árabe y arabizi.
- Preprocesado de pipelines NLP en producción sin GPU: al ser ONNX FP32 con paridad bit a bit, se puede sustituir el modelo PyTorch por el grafo ONNX en servicios dentro de Docker o Kubernetes sin recalibrar umbrales ni revalidar métricas.
- Sistemas de recomendación basados en contenido para medios en dariya: representar artículos o vídeos como vectores de 768 dimensiones y recomendar por similitud, con inferencia en CPU que evita el coste de instancias GPU.
- Análisis exploratorio académico de arabizi: el tokenizador trata de forma explícita los numerales transliterados y las reglas de normalización, lo que facilita comparar corpus en distintas convenciones de escritura.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (clasificación de texto con cabeza `cls+mlp`, 3 épocas, media de 10 semillas). No están verificados de forma independiente (`verified: false`):

| Tarea / dataset | Metrica | Valor DZAIR-ONNX | Valor PyTorch FP32 (base) | Retencion |
|---|---|---|---|---|
| NArabizi Sentiment (test), arabizi | Accuracy | 0,6552 | 0,6552 | 100,0 % |
| NArabizi Sentiment (test), arabizi | Macro F1 | 0,5961 | 0,5961 | 100,0 % |
| Ranim Sentiment (test), foro | Accuracy | 0,9633 | 0,9633 | 100,0 % |
| Ranim Sentiment (test), foro | Macro F1 | 0,9594 | 0,9594 | 100,0 % |
| Twifil Sentiment (test), Twitter | Accuracy | 0,7894 | 0,7894 | 100,0 % |
| Twifil Sentiment (test), Twitter | Macro F1 | 0,7834 | 0,7834 | 100,0 % |

Métricas de fidelidad y eficiencia de la exportación, medidas en hardware CPU idéntico con frases argelinas verificadas:

| Metrica | PyTorch FP32 (base) | DZAIR-ONNX |
|---|---|---|
| Tamano en disco de los pesos | 401,71 MB | 404,07 MB |
| Fidelidad de coseno de embeddings | 1,000000 (referencia) | 1,000000 |
| Error absoluto medio (MAE) | 0,000000 | 0,000001 |
| Diferencia absoluta maxima | 0,000000 | 0,000005 |
| Throughput de inferencia (CPU) | 4.112 tok/s | 4.974 tok/s (+21,0 %) |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K y similares), lo cual es coherente con un encoder de representaciones y no con un modelo generativo.

## Requisitos de hardware

- VRAM estimada: con 105,3 millones de parámetros en FP32, los pesos ocupan unos 421 MB (el archivo `model.onnx` declara 404,07 MB). Sumando activaciones y buffers de inferencia, cabe holgadamente en menos de 1,5 GB de VRAM en GPU y en menos de 1 GB de RAM en CPU, aunque estas cifras de memoria no están documentadas explícitamente en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente por tamaño de pesos; el proveedor de ejecución declarado es `CUDAExecutionProvider`, sin lista de GPU recomendadas por el autor. Para lotes grandes o baja latencia tiene sentido usar A100, H100 o L4, pero el objetivo declarado del artefacto es CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4090), ya que los pesos en FP32 rondan los 400 MB.
- Despliegue: `optimum[onnxruntime]` con `ORTModelForFeatureExtraction`, ONNX Runtime con `CPUExecutionProvider` o `CUDAExecutionProvider`; entornos objetivo declarados: CPUs de servidor Linux x86_64 y ARM64 dentro de Docker, Kubernetes o microservicios. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un encoder ONNX.
- Latencia y throughput: 4.974 tok/s en CPU para el grafo ONNX frente a 4.112 tok/s del modelo PyTorch en el mismo hardware, es decir, un 21,0 % más de throughput. No se publican cifras de latencia por petición ni de throughput en GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de especificaciones de modelos comparables; la comparación siguiente es cualitativa y marca como no verificados los datos que no aparecen en las fuentes consultadas.

| Modelo | Categoria | Parametros | Contexto | Idiomas declarados | Licencia | Formato ONNX oficial |
|---|---|---|---|---|---|---|
| DZAIR-ONNX | Encoder para dariya argelina | 105,3 M | No disponible | `arq` (árabe y arabizi) | Apache-2.0 | Sí (opset 18, FP32) |
| algerian-nlp/DZAIR | Encoder para dariya argelina (modelo base) | 105,3 M | No disponible | `arq` | Apache-2.0 (segun el modelo base) | No |
| MARBERT | Encoder para árabe y dialectos | No verificado en las fuentes consultadas | No verificado | Árabe y dialectos | No verificado | No verificado |
| AraBERT | Encoder para árabe moderno estándar | No verificado en las fuentes consultadas | No verificado | Árabe estándar | No verificado | No verificado |
| CAMeLBERT-DA | Encoder para árabe dialectal | No verificado en las fuentes consultadas | No verificado | Árabe dialectal | No verificado | No verificado |

La diferencia funcional más clara frente a esos encoders árabes genéricos es la cobertura explícita del arabizi latino con vocabulario y reglas de normalización propios, además de la existencia de un artefacto ONNX con paridad declarada frente al modelo PyTorch. No se han podido confirmar cifras comparativas de parámetros, contexto ni rendimiento de las alternativas con la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, código ni respuestas; cualquier uso conversacional requiere una cabeza o un modelo adicional.
- Rendimiento limitado en arabizi: los propios resultados del autor en NArabizi Sentiment son de 65,52 % de exactitud y 59,61 % de F1 macro, muy por debajo del 96,33 % obtenido en texto de foro. La variante romanizada es claramente el punto débil.
- Los benchmarks están marcados como no verificados (`verified: false`) y corresponden a una cabeza de clasificación `cls+mlp` entrenada 3 épocas sobre 10 semillas, no al encoder en zero-shot. No deben interpretarse como capacidad intrínseca del modelo.
- Sesgos no documentados: la model card no incluye análisis de sesgo demográfico, político o de género, ni descripción de la composición del corpus de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes altas entre frases no relacionadas semánticamente, con el consiguiente falso positivo en recuperación.
- Limitación de idioma: el modelo está pensado para dariya argelina; la propia model card indica que no es adecuado para otros dialectos árabes sin ajuste fino específico de dominio.
- Longitud de contexto desconocida: no se documenta el máximo de tokens de entrada, de modo que hay que fijarlo empíricamente o consultando el `config.json` del repositorio antes de desplegar.
- Sin variantes cuantizadas: solo se publica FP32, pese a que las etiquetas del repositorio incluyen `base_model:quantized:algerian-nlp/DZAIR`. Si se necesita INT8 hay que generarlo y validar la fidelidad por cuenta propia con el umbral de coseno documentado.
- Requiere `trust_remote_code=True` en el tokenizador, con la superficie de riesgo que implica ejecutar código del repositorio; conviene fijar una revisión concreta en producción.
- Adopción nula por el momento: 0 descargas y 0 likes, sin validación independiente de las cifras declaradas.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene revisar las condiciones del modelo base y citar correctamente según el bloque de citación de la model card.

## Enlaces

- Página HuggingFace del modelo: https://huggingface.co/algerian-nlp/DZAIR-ONNX
- Modelo base: https://huggingface.co/algerian-nlp/DZAIR
- Repositorio de Optimum (herramienta de conversión y ejecución): https://github.com/huggingface/optimum
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre el modelo: los resultados disponibles corresponden a listados comerciales de bolsas de aseo en Amazon, Otto, dm y Etsy, sin relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
