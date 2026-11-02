# FlashNdSpace/tesseract-search

## Resumen

Tesseract Search es un modelo de embeddings para recuperación semántica (retrieval) desarrollado por FlashNdSpace como componente del buscador de la aplicación de escritorio Tesseract. Se trata de un ajuste fino de `intfloat/multilingual-e5-base`, un transformer encoder de tipo BERT de aproximadamente 278 millones de parámetros, especializado en generar representaciones vectoriales de consultas y pasajes para búsqueda por similitud. El modelo se distribuye en formato ONNX y está orientado a los idiomas ruso e inglés.

El problema que resuelve es la baja precisión de E5 en dominios concretos: según la propia model card, el ajuste fino eleva el recall@1 de 22,2 a 37,1 en consultas formuladas con palabras propias y de 26,2 a 39,8 en consultas con palabras literales del texto, sobre un archivo personal de evaluación no incluido en el entrenamiento. El modelo se publica en cinco variantes de vocabulario (alpha, full, cyrillic, seen e idioma original) que comparten pesos y difieren solo en el tokenizador, con tamaños que van de 487 MB a 1.075 MB.

Es relevante ahora por dos motivos: por un lado, demuestra que un ajuste fino con 24.123 pares supervisados procedentes de 52 fuentes abiertas puede duplicar prácticamente el rendimiento de un modelo multilingüe genérico en un dominio concreto; por otro, su licencia `tesseract-search-weights-1` no es de código abierto, lo que lo convierte en un caso interesante para analizar las implicaciones de las licencias restrictivas en modelos derivados de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (derivado de `intfloat/multilingual-e5-base`) |
| Parametros totales | Aproximadamente 278 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (distribucion en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | Ruso, ingles (segun tags y model card) |
| Licencia | `tesseract-search-weights-1` (licencia propia, texto en ruso en `LICENSE.md`; no es open source) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del encoder multilingüe E5 de intfloat, que sigue la arquitectura transformer encoder de BERT con pooling por media de tokens para producir el embedding de frase. No se introducen cambios arquitectónicos propios: la innovación está en el entrenamiento y en la gestión del vocabulario. Los pesos son idénticos entre las cinco variantes publicadas; lo que cambia es el tokenizador, lo que permite reducir el tamaño del modelo entre un 29 % (variante `seen`, 487 MB) y un 56 % (variante `cyrillic`, 548 MB) respecto a la variante `full` de 1.075 MB, con pérdidas de rendimiento mínimas (MRR de 0,460 frente a 0,466 en consultas propias).

El entrenamiento se realizó sobre 24.123 pares de consulta-pasaje extraídos de 52 fuentes abiertas, con 76.735 preguntas asociadas. La model card indica que no se utilizaron archivos personales y que la lista de fuentes, commits y licencias está documentada en `SOURCES.json`, mientras que las obras de terceros se referencian en `NOTICE.md`. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de embeddings, el objetivo de entrenamiento es probablemente contrastivo (similitud de pares), aunque este dato no se detalla explícitamente.

## Capacidades

- Generación de embeddings de frases para búsqueda semántica y similitud entre textos (pipeline `sentence-similarity`).
- Recuperación de pasajes relevantes en ruso e inglés, con soporte de consultas en lenguaje natural y consultas con términos literales del corpus.
- Codificación asimétrica con prefijos: las consultas deben prefijarse con `query: ` y los pasajes con `passage: `; la model card advierte que sin estos prefijos la calidad cae aproximadamente a la mitad.
- Pooling por media de tokens para obtener el vector de frase.
- Distribución en formato ONNX, apta para inferencia en entornos sin PyTorch.
- Cinco variantes de tokenizador para adaptar el coste de almacenamiento y el soporte de idiomas al caso de uso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo exclusivamente de representación vectorial.

## Casos de uso

- Búsqueda semántica en aplicaciones de escritorio: el modelo es el motor de recuperación de la app Tesseract y puede integrarse en clientes locales que necesiten indexar documentos del usuario y recuperar fragmentos relevantes sin depender de la nube, gracias a su formato ONNX y a las variantes de menor tamaño (487-548 MB).
- Indexación de archivos personales multilingües (ruso/inglés): con la variante `alpha` (788 MB, 154.237 tokens de vocabulario) se cubren cirílico, latín, signos y dígitos, lo que permite indexar mezclas de documentos técnicos en inglés y personales en ruso en un mismo índice vectorial.
- Sistemas de preguntas y respuestas sobre documentación interna: los prefijos `query: ` y `passage: ` permiten separar la codificación de preguntas y fragmentos, facilitando la integración en pipelines RAG donde el retriever debe devolver los k pasajes más relevantes antes de pasarlos a un LLM generador.
- Deduplicación y agrupación de textos: la similitud coseno entre embeddings permite detectar documentos duplicados o casi duplicados en repositorios de noticias, tickets de soporte o correos, usando la variante `seen` (487 MB) para minimizar el coste de almacenamiento del índice.
- Búsqueda en catálogos y bases de conocimiento bilingües ruso-inglés: el ajuste fino mejora el recall@10 hasta 67,2 en consultas propias, lo que lo hace adecuado para motores de búsqueda internos de empresas con documentación en ambos idiomas.
- Filtrado previo en pipelines de moderación o clasificación: al generar embeddings compactos, puede usarse como primera etapa de recuperación de casos similares a una consulta antes de aplicar un clasificador más costoso.
- Evaluación comparativa de retrievers en dominios concretos: sirve como referencia de hasta dónde llega un ajuste fino ligero (24.123 pares) frente a un modelo multilingüe genérico como E5, útil para equipos que planeen sus propios fine-tunes.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la model card y se midieron sobre un archivo personal no liberado: 2.152 preguntas formuladas con palabras propias y 256 consultas con palabras literales del texto. Se reportan recall@1, recall@10 y MRR.

| Variante | Vocabulario | Tokens | Tamano | Preguntas @1 / @10 / MRR | Palabras @1 / @10 / MRR |
|---|---|---:|---:|---|---|
| `alpha` (por defecto) | Cirílico, latín, signos, dígitos | 154.237 | 788 MB | 37,1 / 67,2 / 0,466 | 39,8 / 69,1 / 0,488 |
| `full` | Completo | 250.002 | 1.075 MB | 37,1 / 67,2 / 0,466 | 39,8 / 69,1 / 0,488 |
| `cyrillic` | Cirílico completo y visto en entrenamiento | 74.071 | 548 MB | 36,9 / 67,3 / 0,464 | 39,8 / 68,8 / 0,488 |
| `seen` | Visto en entrenamiento al menos una vez | 53.502 | 487 MB | 36,4 / 66,9 / 0,460 | 40,2 / 68,4 / 0,489 |
| E5 original | Completo | 250.002 | 1,1 GB | 22,2 / 40,1 / 0,277 | 26,2 / 54,7 / 0,351 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, BEIR) en la información disponible. La model card advierte que la prosa en inglés no se evaluó por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de aproximadamente 278 millones de parámetros en ONNX, la inferencia en FP32 requiere del orden de 1,1 GB de memoria; en FP16 o INT8 el requisito se reduce aproximadamente a la mitad o a un cuarto, aunque la model card no detalla variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16; para indexación por lotes a gran escala se recomiendan A100, H100, L40S o RTX 4090 por su mayor ancho de banda de memoria.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida, dado el reducido tamaño del modelo.
- Opciones de despliegue: ONNX Runtime es la vía natural dada la distribución en ONNX; también puede exportarse a otros runtimes (TensorRT, OpenVINO) o servirse con soluciones de embeddings como Text Embeddings Inference si se convierte a safetensors. La model card menciona la descarga mediante la app Tesseract o el comando `kl model download`, con verificación por sha256.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| Tesseract Search | ~278 M | No disponible | Ruso, inglés | `tesseract-search-weights-1` (no open source) | ONNX | 37,1 / 67,2 / 0,466 (preguntas propias) |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens (estándar E5) | Multilingüe | MIT | Safetensors | 22,2 / 40,1 / 0,277 (misma evaluación) |
| intfloat/multilingual-e5-small | ~118 M | 512 tokens (estándar E5) | Multilingüe | MIT | Safetensors | No disponible en esta información |
| BAAI/bge-m3 | ~568 M | 8.192 tokens | Multilingüe | MIT | Safetensors | No disponible en esta información |

La comparación directa con E5 original es la más significativa: el ajuste fino casi duplica el recall@1 en consultas propias y multiplica por 1,7 el recall@10. Frente a alternativas multilingües más grandes como bge-m3, Tesseract Search ofrece un tamaño mucho menor y una licencia restrictiva, por lo que la elección depende de si el caso de uso exige cobertura multilingüe amplia o solo ruso e inglés.

## Limitaciones y advertencias

- La licencia `tesseract-search-weights-1` no es de código abierto; el texto legal está en ruso en `LICENSE.md` y debe revisarse antes de cualquier uso comercial o redistribución.
- El modelo está ajustado solo para ruso e inglés; la model card advierte que tras el recorte de vocabulario el chino y el árabe producen tokens desconocidos, y que en las variantes `cyrillic` y `seen` el alemán y el francés se fragmentan en más tokens de lo habitual.
- En la variante `seen`, algunas formas flexivas del ruso se tokenizan de manera distinta, lo que puede afectar a la calidad en ese idioma.
- El uso sin los prefijos `query: ` y `passage: ` degrada la calidad aproximadamente a la mitad, según la model card.
- Los benchmarks publicados se midieron sobre un archivo personal no liberado, por lo que no son reproducibles de forma independiente; además, la prosa en inglés no se evaluó por separado.
- No se documentan sesgos conocidos, tasas de alucinación (no aplica directamente a un modelo de embeddings) ni límites de contexto; al ser un encoder de recuperación, el riesgo principal es el sesgo de representación heredado del corpus de entrenamiento, compuesto por 52 fuentes abiertas no detalladas en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y las fechas de creación y actualización son de noviembre de 2026, lo que sugiere un modelo reciente y sin validación externa por parte de la comunidad.
- No se especifican requisitos de contexto máximo; si se heredan los 512 tokens típicos de E5, los pasajes largos deberán dividirse en fragmentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FlashNdSpace/tesseract-search
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Licencia (referenciada en la model card): `LICENSE.md` dentro del repositorio de HuggingFace
- Fuentes de entrenamiento (referenciado): `SOURCES.json` dentro del repositorio de HuggingFace
- Aviso de obras de terceros (referenciado): `NOTICE.md` dentro del repositorio de HuggingFace
