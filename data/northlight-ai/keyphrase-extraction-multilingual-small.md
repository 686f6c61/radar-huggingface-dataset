# northlight-ai/keyphrase-extraction-multilingual-small

## Resumen

`keyphrase-extraction-multilingual-small` es un modelo de extracción de frases clave (keyphrase extraction) de tipo extractivo, desarrollado por Pankaj Garg en Northlight. Se trata de un ajuste fino de `jhu-clsp/mmBERT-small`, un transformer de arquitectura ModernBERT con 140,6 millones de parámetros y una ventana de contexto de 8.192 tokens. El modelo resuelve la tarea de identificar y etiquetar fragmentos literales (verbatim) dentro de un documento que funcionan como palabras clave o frases clave, mediante un esquema BIO de tres etiquetas (`O`, `B-KEY`, `I-KEY`).

Su relevancia actual reside en tres factores. Primero, es multilingüe (inglés, francés, español, alemán, italiano y portugués) y está entrenado exclusivamente con frases clave proporcionadas por autores y editores de corpus académicos con licencias CC-BY y CC0 (HAL Open Archive y DOAJ), sin etiquetas generadas por LLM ni ruido de profesor. Segundo, ofrece una ventana de 8.192 tokens, muy superior a los 512 tokens habituales en los extractores de frases clave basados en BERT. Tercero, se distribuye bajo licencia MIT con pesos en safetensors y ONNX (fp32 y cuantizado uint8), lo que permite inferencia en navegador mediante transformers.js.

El modelo está pensado como sustituto directo de extractores previos como `yanekyuk/bert-uncased-keyword-extractor`, manteniendo el mismo esquema de etiquetas y la misma interfaz de `pipeline` de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tune de `jhu-clsp/mmBERT-small` |
| Parametros totales | 140.642.691 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrenamiento hasta 1.024; evaluacion verificada hasta 2.048) |
| Tipos de cuantizacion | ONNX fp32 (`onnx/model.onnx`, 563,08 MB) y ONNX uint8 por fila de embedding (`onnx/model_quantized.onnx`, 270,22 MB, `dtype: "q8"`); safetensors en fp32 |
| Idiomas soportados | en, fr, es, de, it, pt (multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (fp32 y q8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, inicializado desde `jhu-clsp/mmBERT-small` (140,6 M de parámetros) y adaptado a clasificación de tokens con una cabeza de token-classification de tres etiquetas. Emplea el esquema BIO exacto y el orden de identificadores de `yanekyuk/bert-uncased-keyword-extractor`: `0: "O"`, `1: "B-KEY"`, `2: "I-KEY"`. La tarea es extractiva pura: el modelo no genera frases clave nuevas, sino que etiqueta spans literales del texto de entrada.

El ajuste fino se realizó exclusivamente sobre frases clave verbatim proporcionadas por autores y editores en corpus académicos de uso comercial (HAL Open Archive y DOAJ), con un conjunto final de 32.700 documentos. No se utilizaron etiquetas de profesor generadas por LLM ni palabras clave generadas por modelo de OpenAlex. El autor declara que los 16 conjuntos de evaluación no se usaron para entrenamiento, ajuste de hiperparámetros ni selección de checkpoint, con verificación programática de ausencia de solapamiento (abstract exacto, título, identificador de revista DOAJ, o Jaccard de shingles de 5 palabras ≥ 0,50). Doce de los benchmarks externos se inspeccionaron una vez durante una prueba de viabilidad inicial con 8.400 documentos, antes de escalar al modelo final, por lo que quedan excluidos de entrenamiento y selección pero no son ciegos a la decisión de escalado. El entrenamiento usó secuencias de hasta 1.024 tokens y la evaluación verificó hasta 2.048, aunque la ventana del modelo base es de 8.192.

## Capacidades

- Extracción extractiva de frases clave en documentos largos, devolviendo spans literales del texto de entrada.
- Etiquetado BIO por token (`O`, `B-KEY`, `I-KEY`) compatible con la agregación `SIMPLE` de los pipelines de Hugging Face.
- Multilingüe en inglés, francés, español, alemán, italiano y portugués.
- Manejo de documentos de hasta 8.192 tokens de contexto, con rendimiento verificado hasta 2.048 tokens.
- Inferencia en navegador mediante transformers.js con el modelo ONNX cuantizado (270 MB).
- Sustitución directa de extractores previos con el mismo esquema de etiquetas, sin cambios en el código de decodificación.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Indexación de repositorios académicos: extraer palabras clave de abstracts y artículos completos en varios idiomas para poblar metadatos de búsqueda; la ventana de 8.192 tokens permite procesar documentos largos sin truncar.
- Enriquecimiento de catálogos editoriales: etiquetar automáticamente publicaciones en español, francés, alemán, italiano y portugués con las frases clave declaradas por los autores, reduciendo el trabajo manual de catalogación.
- Búsqueda semántica y motores de recuperación: generar campos de palabras clave para índices invertidos o híbridos, mejorando el recall en consultas cortas sobre corpus multilingües.
- Análisis de literatura científica: agregar y comparar temas de investigación a partir de las frases clave extraídas de miles de documentos, con un coste de inferencia bajo (140 M de parámetros).
- Procesamiento de noticias y boletines: extraer términos clave de artículos de prensa en varios idiomas para resúmenes, alertas temáticas o clasificación de contenidos.
- Aplicaciones web sin servidor: ejecutar la extracción en el navegador del usuario con el modelo ONNX cuantizado, sin enviar documentos a un backend y sin coste de GPU en servidor.
- Preprocesado para pipelines RAG: generar metadatos de palabras clave que ayuden al enrutamiento y filtrado de fragmentos antes de la recuperación.

## Benchmarks y rendimiento

Resultados declarados por el autor (métrica Exact-Match Present-Keyphrase F1@M, decodificación BIO `SIMPLE`). No verificados de forma independiente.

| Dataset | Idioma / dominio | F1@M |
|---|---|---|
| papyrus-e | EN, frases clave de autores | 33,66 |
| papyrus-f | FR, frases clave de autores | 34,94 |
| WikiNews-FR | FR, noticias | 35,36 |
| TermITH | FR, académico | 31,55 |
| DUC-2001 | EN, noticias | 17,70 |
| Inspec | EN, científico | 23,91 |

El autor declara además comparaciones con modelos previos: frente a `yanekyuk/bert-uncased-keyword-extractor` (Apache-2.0, solo inglés, 512 tokens), el modelo es mejor en los 16 benchmarks evaluados, con mejoras de +14,69 en `papyrus_en`, +29,77 en `papyrus_fr`, +21,76 a +24,93 en noticias y académico en francés, +33,08 a +41,67 en revistas canónicas en español, alemán, italiano y portugués, y +5,08 a +8,57 en conjuntos de noticias y científicos en inglés. Frente a `ml6team/keyphrase-extraction-kbir-inspec` (MIT, RoBERTa-large de 355 M, solo inglés, 512 tokens), el modelo va por delante en 13 de 16 benchmarks, mientras que `kbir-inspec` sigue siendo más fuerte en conjuntos con anotación densa (la información disponible no detalla el resto de resultados).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,6 GB de pesos más activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM estimada con ONNX q8: aproximadamente 0,3 GB de pesos; ejecutable en CPU y en navegador.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L40S o RTX 4090. Para uso interactivo, RTX 3060 o superior es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline de token-classification), ONNX Runtime, transformers.js en navegador, y servidores de inferencia compatibles con modelos de token-classification (TGI, vLLM con soporte de encoder). El autor indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 140 M de parámetros, la latencia esperada es baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| northlight-ai/keyphrase-extraction-multilingual-small | 140,6 M | 8.192 (verificado 2.048) | en, fr, es, de, it, pt | MIT | Extractivo, BIO, ONNX para navegador |
| yanekyuk/bert-uncased-keyword-extractor | no disponible (BERT base) | 512 | en | Apache-2.0 | Referencia de esquema BIO; el autor declara mejora en 16/16 benchmarks |
| ml6team/keyphrase-extraction-kbir-inspec | 355 M (RoBERTa-large) | 512 | en | MIT | Ajustado sobre Inspec; el autor declara ventaja en 13/16 benchmarks, con `kbir-inspec` superior en anotación densa |

## Limitaciones y advertencias

- Modelo extractivo: solo devuelve spans presentes en el texto; no genera frases clave ausentes ni parafrasea.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Doce de los conjuntos de evaluación se inspeccionaron durante una prueba de viabilidad previa al escalado, por lo que no son completamente ciegos a decisiones de diseño.
- El entrenamiento usó secuencias de hasta 1.024 tokens y la evaluación verificó hasta 2.048; el rendimiento más allá de esa longitud dentro de la ventana de 8.192 tokens no está validado en la información disponible.
- Rendimiento más bajo en dominios de noticias y científicos en inglés (DUC-2001: 17,70; Inspec: 23,91), lo que sugiere menor precisión en textos con anotación densa o estilos alejados del académico.
- Riesgo de sesgo heredado de los corpus de entrenamiento (HAL y DOAJ), con posible sobrerrepresentación de ciertas disciplinas y convenciones de autor.
- En navegador, `@huggingface/transformers` v3.8.1 ignora `aggregation_strategy` y devuelve etiquetas por token; es necesario agrupar los tokens `B-KEY`/`I-KEY` en el cliente.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los corpus de entrenamiento si se redistribuyen derivados.
- Sin datos publicados de latencia ni throughput; conviene medir en el entorno de producción antes de dimensionar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/northlight-ai/keyphrase-extraction-multilingual-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Demo en navegador: https://huggingface.co/spaces/northlight-ai/keyphrase-extraction-demo
- Modelo de referencia de esquema BIO: https://huggingface.co/yanekyuk/bert-uncased-keyword-extractor
- Modelo comparable: https://huggingface.co/ml6team/keyphrase-extraction-kbir-inspec
- Perfil del autor: https://huggingface.co/pankajmlai
- Organización: https://huggingface.co/northlight-ai
