# jonpojonpo/croydon-v0

## Resumen

Croydon v0 es un clasificador de texto derivado de ModernBERT-base (149 millones de parámetros) que asigna a cada página web una puntuación de 0 a 5 según cuánto conocimiento específico sobre el Reino Unido aportaría a un modelo de lenguaje. Lo desarrolla el usuario jonpojonpo como parte de FineWeb-UK, un experimento abierto que investiga si filtrar texto por relevancia británica mejora el entrenamiento de modelos con sesgo cultural del Reino Unido. El modelo está pensado para operar en paralelo al filtro educativo de FineWeb-Edu, de modo que cada página reciba dos puntuaciones en la misma escala 0-5.

La arquitectura es un encoder transformer (ModernBERT-base) con mean pooling y una cabeza lineal de 6 salidas que produce una distribución de probabilidad sobre los seis niveles de la escala; la puntuación final es la media ponderada por probabilidad, lo que permite un ranking fino (por ejemplo, 3,47). Se entrenó por destilación desde Qwen3.8-27B sobre 27.000 páginas del dominio `.uk`, la mitad procedentes de FineWeb-Edu y la mitad de FineWeb sin filtrar.

Su relevancia es doble: por un lado, demuestra una técnica de destilación de etiquetas suaves (distribuciones completas del profesor, no solo la clase redondeada) sobre un encoder pequeño y rápido; por otro, aborda un problema poco cubierto en la curación de corpus, la representación cultural y geográfica del texto de preentrenamiento. El autor lo marca explícitamente como experimental: validado contra su modelo profesor, pero no contra juicio humano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con mean pooling y cabeza lineal de 6 clases |
| Parámetros totales | 149.018.886 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncación en entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor reporta inferencia en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `croydon.json` con la configuración del wrapper |
| Tarea | Clasificación de texto (regresión ordinal en escala 0-5) |
| Modelo base | answerdotai/ModernBERT-base |
| Modelo profesor | Qwen3.8-27B (UD-IQ4_XS, thinking desactivado) |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El estudiante es ModernBERT-base con mean pooling sobre la última capa oculta (enmascarando el padding) y una única capa lineal de `hidden_size` a 6 logits, seguida de softmax. El modelo se carga mediante una clase `Croydon` definida en la model card; el repositorio no ejecuta código propio, solo distribuye pesos y un JSON de configuración. Lee como máximo 512 tokens, por lo que las páginas largas se juzgan por su apertura.

El pipeline de datos parte de 27.000 páginas `.uk`, mitad de FineWeb-Edu (`sample/10BT`, shard `000_00000`, revisión `87f09149`) y mitad de FineWeb (`sample/10BT`, shard `000_00000`, revisión `9bb295dd`); la inclusión de FineWeb sin filtrar busca cubrir todo el rango de calidad. El profesor Qwen3.8-27B leyó los primeros 2.400 caracteres de cada página y sus distribuciones de probabilidad se extrajeron directamente de los logits del token de respuesta, sin parsear texto generado. El estudiante se entrenó 3 épocas sobre esas etiquetas suaves (las distribuciones completas, no la clase redondeada). La distribución de puntuaciones redondeadas del profesor fue: 1.065 páginas en 0, 5.613 en 1, 3.657 en 2, 8.771 en 3, 7.778 en 4 y 116 en 5.

La innovación principal es el uso de etiquetas suaves para preservar la incertidumbre del profesor en una tarea ordinal subjetiva, junto con la propia definición operativa de la escala (ver tabla de la model card: de 0, contenido de otro país, a 5, conocimiento británico rico y específico explicado en profundidad). El autor insiste en que el profesor debía juzgar la sustancia y no el dominio del sitio: una página `.co.uk` sobre política estadounidense debe puntuar 0.

## Capacidades

- Puntuación de relevancia británica de páginas web en escala continua 0-5 (media ponderada por probabilidad), con salida de distribución completa sobre las 6 clases.
- Clasificación ordinal fina: el ranking distingue niveles intermedios (por ejemplo 3,47 frente a 3,82), útil para umbrales de filtrado.
- Extracción de la probabilidad de las clases 4 y 5 como señal de "fuertemente británico".
- Funciona como filtro complementario al score educativo de FineWeb-Edu, no como sustituto.
- Inferencia rápida: unas 220 páginas por segundo en una RTX 4090 compartida en bf16.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es exclusivamente un clasificador.
- Capacidad multilingüe limitada al inglés; no se documenta comportamiento en otras lenguas.

## Casos de uso

- Curación de corpus de preentrenamiento para modelos con orientación británica: puntuar cada página con Croydon y conservar las que superen un umbral (por ejemplo, probabilidad de 4 o 5 superior a 0,5) para construir un subconjunto FineWeb-UK junto al filtro educativo de FineWeb-Edu.
- Investigación sobre sesgo geográfico en LLM: medir qué proporción de un corpus general alcanza puntuaciones altas y cuantificar el déficit de contenido sobre Escocia, Gales e Irlanda del Norte, una limitación que el autor señala como no medida.
- Construcción de datasets de conocimiento institucional británico (gobierno local, Hacienda, servicios públicos, historia comarcal) a partir de rastreos web, usando la escala como criterio de selección documentado y reproducible.
- Auditoría de mezclas de datos: comparar la distribución de puntuaciones entre dos crawls o dos fuentes para decidir si una nueva fuente aporta cobertura británica real o solo ruido con dominio `.uk`.
- Filtrado en pipelines de datos a gran escala: con 149 M de parámetros y ~220 páginas/s en una RTX 4090, encaja en etapas de preprocesado donde un modelo mayor resultaría prohibitivo en coste.
- Evaluación comparativa de profesores: al ser destilación de Qwen3.8-27B con métricas de acuerdo publicadas, sirve como caso de estudio de cuánta fidelidad se conserva al comprimir un juez LLM en un encoder pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a un clasificador de este tipo. El autor sí publica métricas de acuerdo con el profesor sobre 1.500 páginas reservadas:

| Medida | Todas | FineWeb-Edu | FineWeb |
|---|---|---|---|
| Correlación de rangos (Spearman) | 0,965 | 0,956 | 0,972 |
| Error absoluto medio | 0,18 | 0,20 | 0,17 |
| Misma puntuación redondeada | 86,1 % | 84,1 % | 88,1 % |
| Dentro de un punto | 98,9 % | 98,4 % | 99,4 % |
| Recall con umbral ≥ 3,5 | 89,8 % | 89,8 % | 90,2 % |
| Precisión con umbral ≥ 3,5 | 92,3 % | 91,6 % | 93,0 % |

Estas cifras miden la fidelidad a Qwen, no la corrección del propio profesor. Throughput reportado: ~220 páginas/s en RTX 4090 en bf16.

## Requisitos de hardware

- VRAM para inferencia: el modelo tiene 149 M de parámetros; en bf16 ocupa aproximadamente 0,3 GB de pesos, y con activaciones y overhead de un lote moderado se mantiene holgadamente por debajo de 2 GB.
- Cabe en cualquier GPU consumer reciente (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs de 4-6 GB con lotes pequeños; también es viable en CPU para volúmenes moderados.
- GPU recomendadas para throughput alto: RTX 4090 (referencia del autor, ~220 páginas/s), A100 o H100 para procesado masivo por lotes.
- Despliegue: el autor proporciona un wrapper PyTorch con `transformers` y `safetensors`; no hay integración documentada con vLLM, TGI, llama.cpp ni Ollama, y al no ser un modelo generativo esas herramientas no aplican directamente. Para serving HTTP habría que envolver la clase `Croydon` en un servicio propio (FastAPI, TorchServe, etc.).
- Latencia: no se publica latencia por petición; el dato disponible es el throughput agregado de ~220 páginas/s en bf16 con GPU compartida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Croydon v0 | 149 M | 512 tokens | Relevancia británica 0-5 (destilado de Qwen3.8-27B) | Apache 2.0 | Hugging Face, 0 descargas |
| FineWeb-Edu classifier | no disponible en la información proporcionada | no disponible | Calidad educativa 0-5 | no disponible en la información proporcionada | Hugging Face (referenciado por el autor) |
| ModernBERT-base | 149 M | 8.192 tokens (modelo base estándar) | Encoder de propósito general | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (profesor) | 27 B (aproximado por nomenclatura) | no disponible en la información proporcionada | LLM generativo, juez de la escala | Apache 2.0 | Hugging Face (GGUF de unsloth) |

La comparación relevante es con FineWeb-Edu: Croydon está diseñado para coexistir con él, no para reemplazarlo, y ambos comparten escala 0-5. Frente a usar directamente Qwen3.8-27B como juez, Croydon ofrece un coste de inferencia varios órdenes de magnitud menor a cambio de una fidelidad del 86,1 % en puntuación redondeada. No se dispone de datos para comparar con otros filtros de dominio geográfico.

## Limitaciones y advertencias

- No validado con juicio humano: los errores de Qwen se copian y posiblemente se amplifican; el autor tiene previsto un conjunto de validación etiquetado por personas.
- La escala mezcla dos conceptos, "trata sobre el Reino Unido" y "aporta conocimiento británico útil", y el límite entre 3 y 4 es difuso.
- Solo se entrenó con páginas `.uk`, por lo que el comportamiento sobre contenido británico alojado en otros dominios (por ejemplo, sitios `.com`) es incierto.
- Trunca a 512 tokens: las páginas largas se juzgan únicamente por su apertura, lo que puede infravalorar documentos extensos con contenido relevante más adelante.
- Sesgo potencial hacia la visión del Reino Unido del profesor, con posible infrarrepresentación de Escocia, Gales, Irlanda del Norte y comunidades concretas; el autor indica que esto no se ha medido.
- No es un filtro de calidad ni de seguridad: debe combinarse con FineWeb-Edu u otros filtros y no usarse para evaluar personas.
- Licencia Apache 2.0 en los pesos, compatible con uso comercial, pero el texto de entrenamiento (FineWeb y FineWeb-Edu) está bajo ODC-By 1.0 y sujeto a las condiciones de Common Crawl; conviene revisar esas obligaciones antes de redistribuir derivados.
- Modelo experimental con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.
- Al ser un clasificador, no genera texto: no debe esperarse razonamiento, tool calling ni respuestas en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonpojonpo/croydon-v0
- Proyecto FineWeb-UK: https://github.com/jonpojonpo/fineweb-uk
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Modelo profesor Qwen3.8-27B (GGUF): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
