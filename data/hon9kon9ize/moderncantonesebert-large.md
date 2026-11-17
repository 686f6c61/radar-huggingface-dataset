# hon9kon9ize/ModernCantoneseBert-Large

## Resumen

ModernCantoneseBert-Large es un modelo de lenguaje enmascarado (MLM) especializado en cantonés, desarrollado por el usuario hon9kon9ize. Se construye a partir de los pesos preentrenados de answerdotai/ModernBERT-large, a los que se les extiende el vocabulario con 16.000 nuevos merges BPE aprendidos sobre texto cantonés y se somete a un preentrenamiento continuado de 5 épocas sobre aproximadamente 747 millones de tokens de cantonés (unos 3.700 millones de tokens vistos en total). El resultado es un encoder de 412 millones de parámetros con arquitectura ModernBERT, atención alterna local/global, RoPE y hasta 8.192 tokens de contexto arquitectónico.

El modelo resuelve un problema concreto: los tokenizadores multilingües genéricos fragmentan caracteres y palabras cantonés comunes (嘅, 係, 唔, 佢, 香港) en múltiples piezas de byte, lo que degrada la eficiencia y la calidad en tareas de comprensión del cantonés. Al convertir esos elementos en tokens únicos, el modelo mejora la representación del idioma para tareas de fill-mask, extracción de características y ajuste fino en clasificación, NER y etiquetado de secuencias.

Es relevante ahora porque el cantonés está infrarrepresentado en los modelos abiertos y porque ModernBERT ofrece una base moderna y eficiente (atención local/global, RoPE, contexto largo) que no existía en la generación anterior de BERT. La licencia Apache 2.0 facilita su uso tanto en investigación como en productos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder con atención alterna local/global y RoPE) |
| Parametros totales | 412.281.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens arquitectónicos; entrenado con secuencias de 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cantonés (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas / hidden / cabezas | 28 / 1.024 / 16 |
| Vocabulario | 66.368 tokens (50.368 ModernBERT + 16.000 cantonés) |
| Longitud de secuencia en entrenamiento | 2.048 tokens |
| Modelo base | answerdotai/ModernBERT-large |
| Tamaño del repositorio | 1.6 GB |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-large, un encoder transformer que sustituye la atención global completa por un esquema de atención alterna local/global, incorpora codificación posicional rotatoria (RoPE) y admite hasta 8.192 posiciones. Sobre esa base se extendió el tokenizador BPE byte-level de 50.368 tokens con 16.000 merges adicionales aprendidos sobre texto cantonés, alcanzando 66.368 tokens. La inicialización de los embeddings de los nuevos tokens se realizó como la media ponderada por longitud de byte de los embeddings de los dos tokens fusionados; el decodificador MLM atado y su sesgo se inicializaron del mismo modo. El resto de pesos preentrenados se conservaron.

El preentrenamiento continuado se hizo con masked language modeling sobre 626.000 documentos cantonenses (364.980 secuencias empaquetadas de 2.048 tokens, aproximadamente 747 millones de tokens por época) procedentes de Common Crawl filtrado en cantonés y de noticias y artículos raspados de la web. Se entrenaron 5 épocas en una única NVIDIA H100 de 80 GB durante unas 20,4 horas, con learning rate 5e-5, batch efectivo de 32 secuencias (65.536 tokens), AdamW con weight decay 0,01, scheduler coseno con warmup del 5 % y precisión bf16. El conjunto de datos no se publica por respeto a los derechos de autor.

## Capacidades

- Relleno de máscaras (fill-mask) en cantonés, con la particularidad de que un `[MASK]` puede representar una palabra de varios caracteres al usar tokenizador BPE byte-level.
- Extracción de características (feature extraction) para tareas downstream de NLP en cantonés.
- Ajuste fino para clasificación de texto, reconocimiento de entidades nombradas (NER) y etiquetado de secuencias.
- Comprensión del cantonés escrito, incluyendo vocabulario y expresiones coloquiales frecuentes.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un encoder MLM, no un modelo generativo de instrucciones.
- No soporta visión ni audio.
- Capacidad multilingüe limitada al cantonés; la habilidad en inglés heredada de ModernBERT-large puede haberse degradado durante el preentrenamiento continuado.

## Casos de uso

- Relleno de huecos en textos cantonenses: uso directo del pipeline `fill-mask` para completar frases, útil en herramientas de escritura, corrección o generación asistida de contenido en cantonés.
- Clasificación de texto cantonés: ajuste fino sobre el encoder para moderación de comentarios, detección de spam o categorización de noticias, aprovechando las representaciones contextuales del modelo.
- Reconocimiento de entidades nombradas en cantonés: ajuste fino para extraer personas, lugares y organizaciones de noticias y artículos web, tarea para la que el vocabulario extendido reduce la fragmentación de entidades.
- Búsqueda semántica y recuperación de información en cantonés: uso del modelo como extractor de embeddings para indexar y recuperar documentos cantonenses con mayor fidelidad léxica.
- Análisis de opinión y sentimiento en redes sociales: ajuste fino para clasificar publicaciones en cantonés, donde el vocabulario específico mejora la cobertura de términos coloquiales.
- Etiquetado de secuencias para pipelines de procesamiento lingüístico: segmentación, análisis morfológico o anotación de corpus cantonenses en proyectos de investigación.
- Base para investigación académica en NLP del cantonés: punto de partida para experimentos de adaptación de dominio o comparación de arquitecturas ModernBERT frente a BERT clásico.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de evaluación (MLM):

| Metrica | Valor |
|---|---|
| Loss | 1,4511 |
| Accuracy | 0,7052 |
| Perplexity | 4,27 |

Evolución durante el entrenamiento (selección):

| Epoca | Validation loss | Accuracy |
|---|---|---|
| 0,1754 | 2,4034 | 0,6083 |
| 0,8768 | 1,7430 | 0,6675 |
| 1,4028 | 1,6278 | 0,6820 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,6 GB solo para pesos (412 M de parámetros), más overhead de activaciones y tokenizador; en la práctica, menos de 4 GB en la mayoría de configuraciones.
- En fp16/bf16: alrededor de 0,8 GB para pesos, por lo que cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con 4-6 GB.
- GPU recomendadas para entrenamiento o ajuste fino: NVIDIA H100 80 GB (usada por el autor para el preentrenamiento), A100 40/80 GB; para ajuste fino de tareas downstream basta con una RTX 4090 o A100.
- Despliegue: compatible con `transformers>=4.48`; puede servirse con Text Generation Inference (TGI) para pipelines de fill-mask, con ONNX Runtime o con TorchScript; no se mencionan integraciones específicas con vLLM, llama.cpp u Ollama (estas herramientas están orientadas a modelos generativos, no a encoders MLM).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 412 M de parámetros, la inferencia es ligera en comparación con modelos generativos del mismo orden.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| ModernCantoneseBert-Large | 412 M | 8.192 (entrenado a 2.048) | Cantonés | Apache 2.0 | Preentrenamiento continuado desde ModernBERT-large con vocabulario extendido |
| ModernCantoneseBert-Base | no disponible | no disponible | Cantonés | Apache 2.0 | Entrenado desde cero con tokenizador WordPiece; misma familia |
| answerdotai/ModernBERT-large | 395 M aprox. (no confirmado en la información) | 8.192 | Multilingüe/inglés | Apache 2.0 | Modelo base; sin vocabulario cantonés específico |
| BERT-base multilingüe | 178 M aprox. | 512 | Multilingüe | Apache 2.0 | Referencia clásica; contexto corto y tokenización menos eficiente para cantonés |

Los datos de ModernBERT-large y BERT-base multilingüe no provienen de la información proporcionada y se incluyen solo como referencia orientativa; verificar en sus respectivas model cards.

## Limitaciones y advertencias

- El autor indica que el modelo es para uso en investigación y académico; puede no ser adecuado para producción sin evaluación y ajuste fino adicionales.
- Entrenado exclusivamente con texto cantonés; el rendimiento en otros dialectos chinos o en inglés puede ser deficiente, y la capacidad en inglés heredada puede haberse degradado.
- El entrenamiento usó secuencias de 2.048 tokens; el comportamiento con entradas más largas (hasta 8.192) no ha sido evaluado.
- Al ser un modelo MLM y no generativo, no soporta instrucciones, agentes ni tool calling; no debe emplearse como sustituto de un LLM conversacional.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgo en la información disponible; al derivar de datos web, puede reflejar sesgos presentes en el corpus.
- El conjunto de datos de entrenamiento no se publica por derechos de autor, lo que limita la reproducibilidad exacta.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda precaución y evaluación previa en entornos productivos.
- El tokenizador BPE byte-level implica que un `[MASK]` puede abarcar varias palabras o caracteres, lo que requiere interpretar los resultados con cuidado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hon9kon9ize/ModernCantoneseBert-Large
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Modelo hermano (Base): https://huggingface.co/hon9kon9ize/ModernCantoneseBert-Base
