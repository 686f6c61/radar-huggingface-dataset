# GoForceX/body-locator-small-v1-curated

## Resumen

Body Locator · mmBERT-4096 (curated) es un modelo de extracción de spans diseñado para una tarea muy concreta: localizar el intervalo de texto que corresponde al cuerpo principal dentro de una respuesta larga generada por un LLM que incluye bloques de andamiaje (bloques de configuración `<dream_plot>`, bloques de estado `<Status_block>`, opciones finales, etc.). No genera texto ni reescribe nada: devuelve un par de índices `[start, end)` sobre los codepoints Unicode originales, de modo que `text[start:end]` es literalmente el cuerpo del mensaje. Lo desarrolla el usuario GoForceX y se publica bajo licencia "other" sin declaración explícita, lo que implica reserva de derechos por defecto.

Arquitectónicamente es un híbrido: un encoder ModernBERT pequeño (`alphaedge-ai/mmBERT-small-zho-32768`, 54,8 M de parámetros, hidden 384, 22 capas, vocabulario 32768) procesa la entrada en ventanas de 4096 tokens con solapamiento de 128, y sobre sus representaciones se añade una cabeza de puntuación de fronteras por carácter con corrección de límites. El modelo final tiene 57,5 M de parámetros y se distribuye en tres precisiones (fp32 230 MB, fp16 115 MB, int8 97 MB) junto con el código de inferencia.

Su relevancia es práctica: resuelve un paso de post-procesado que en pipelines de roleplay y agentes conversacionales suele hacerse con heurísticas frágiles o con un LLM grande y caro. Un modelo de 57 M de parámetros que acierte el span exacto en el 95,39 % de los casos de desarrollo permite limpiar respuestas con scaffolding a coste casi nulo, en CPU y con latencias de ~190 ms por respuesta de ~700 caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder ModernBERT (mmBERT-small-zho-32768) + Transformer bidireccional de 2 capas a nivel de bloque (RoPE) + cabeza de fronteras por carácter con convoluciones residuales kernel=5 + corrector de límites (`TransitionScorer`) |
| Parametros totales | 57,5 M (base mmBERT: 54,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens deduplicados (~11 000 caracteres chinos); ventana de encoder de 4096 tokens con solapamiento de 128; superar el límite lanza `TokenLimitError` sin truncar |
| Tipos de cuantizacion | fp32 (`best.pt`), fp16 (`best_fp16.pt`), int8 con cuantización dinámica de capas Linear (`best_int8.pt`, solo CPU) |
| Idiomas soportados | chino (`zh`) |
| Licencia | other (sin declaración adjunta; por defecto todos los derechos reservados; contacto con el autor para uso comercial) |
| Formato de pesos | PyTorch `.pt` (checkpoints fp32/fp16/int8) + tokenizador fast en `tokenizer/`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El pipeline tiene cinco etapas descritas por el autor. Primero, mmBERT codifica la entrada en ventanas de 4096 tokens con 128 de solapamiento. Segundo, de cada bloque se extrae el `[CLS]` concatenado con el pooling medio enmascarado, formando un resumen que pasa por 2 capas de Transformer bidireccional con RoPE para dar contexto a nivel de bloque; ese contexto se difunde de vuelta a los tokens. Tercero, para cada hueco entre caracteres Unicode se construye una representación con las embeddings de los tokens izquierdo y derecho (128 dimensiones cada una), embeddings hash de los caracteres izquierdo y derecho (24 dimensiones cada uno) y 10 flags de categoría de carácter; todo se proyecta y pasa por dos capas convolucionales residuales con kernel 5. Cuarto, dos cabezas (inicio y fin) producen puntuaciones por frontera, y un corrector (`TransitionScorer`) aplica un ajuste usando medias de los 8 y 64 huecos anteriores/posteriores más 20 características estructurales. Quinto, el objetivo de entrenamiento es la log-verosimilitud negativa conjunta sobre todos los intervalos no vacíos válidos, y la decodificación usa `cummax(start) + end` para obtener el MAP en tiempo lineal.

Los datos de entrenamiento son respuestas reales de LLM anotadas. La versión "curated" filtra el conjunto original con una revisión por LLM y conserva solo las filas con estado `ok`, dejando etiquetas y texto byte a byte idénticos. Resultado: 4778 filas de entrenamiento (de 5729), 283 de desarrollo (de 329) y 245 de test (de 306); 1058 filas van a cuarentena, principalmente por `wrong_end` (541), `uncertain` (234), `source_truncated` (164) y `non_body_inside` (89). No se menciona RLHF ni DPO; es un fine-tuning supervisado sobre la base mmBERT. El repositorio no incluye `last.pt`, estados del optimizador ni logs.

## Capacidades

- Extracción de un span continuo `[start, end)` sobre texto UTF-8 sin modificar el original: `text[start:end]` es el cuerpo exacto.
- Detección de bloques de andamiaje típicos de roleplay en chino: `<dream_plot>`, `<Status_block>`, bloques de opciones finales y similares.
- Restricción opcional de búsqueda a un rango (`target_span`) manteniendo coordenadas globales.
- Decodificación MAP exacta sobre todos los intervalos no vacíos con coste lineal.
- Tres precisiones de peso para distintos compromisos de tamaño/velocidad, con inferencia en CPU o GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo discriminativo de span extraction.
- Capacidad multilingüe: no disponible; solo se declara chino.

## Casos de uso

- Limpieza de respuestas de roleplay en producción: tras generar una respuesta con scaffolding, se pasa el texto completo al locator y se publica solo `result["body"]`, eliminando bloques de estado y opciones finales sin tocar el contenido. La latencia de ~190 ms y los 57,5 M de parámetros lo hacen viable en cada turno.
- Post-procesado en pipelines de agentes conversacionales: cuando el LLM emite metadatos estructurados mezclados con la respuesta visible, el locator separa la parte que debe ver el usuario de la que debe consumir el orquestador.
- Etiquetado y curación de datasets de diálogo: dadas respuestas largas con anotaciones, el modelo permite extraer automáticamente el cuerpo para construir corpus limpios de entrenamiento o evaluación.
- Filtrado de logs y trazas: en sistemas que registran respuestas completas con envoltorios, se puede aislar el contenido sustantivo antes de indexarlo o analizarlo.
- Evaluación de calidad de generación: comparar el span detectado con el esperado sirve como métrica auxiliar para detectar respuestas mal formateadas o con scaffolding filtrado.
- Despliegue en CPU de bajo coste: con `best_int8.pt` (97 MB) se puede ejecutar en servidores sin GPU o en el edge, aceptando una ligera deriva en las fronteras (36 de 40 muestras idénticas al fp32 en la prueba del autor).
- Preprocesado para otros modelos: usar el locator como primer paso antes de pasar el cuerpo limpio a un modelo generativo o a un sistema de moderación, reduciendo tokens de entrada y ruido.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de desarrollo curated (282 de 283 documentos evaluables):

| Metrica | Valor |
|---|---|
| Exact (inicio y fin correctos) | 269 / 282 = 95,39 % |
| Exact con penalización por saltos | 95,05 % |
| Cobertura | 99,65 % |
| F1 de caracteres del cuerpo | 0,9948 |
| Caracteres de cuerpo eliminados por error | 2233 |
| Caracteres no-cuerpo conservados por error | 3754 |
| Documentos con ≥100 / ≥1000 caracteres eliminados por error | 2 / 1 |
| Documentos sin intersección con el cuerpo real | 1 |

Referencia del autor: la versión v1 sobre el dev original obtenía 307/328 = 93,60 %. Los denominadores difieren, por lo que no es una comparación estricta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con modelos similares.

Rendimiento de inferencia declarado: 190 ms para una entrada de 718 caracteres (522 tokens, 1 chunk) con `best_fp16.pt`. No se especifica el hardware empleado.

## Requisitos de hardware

- VRAM estimada: mínima. Con 57,5 M de parámetros, fp32 ocupa ~230 MB de pesos, fp16 ~115 MB e int8 ~97 MB; el pico de memoria incluye activaciones de la ventana de 4096 tokens, pero en cualquier caso cabe holgadamente en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM sirve; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o T4 son más que suficientes.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas e incluso en iGPU con memoria compartida suficiente.
- Despliegue: el repositorio incluye `infer.py` (clase `BodyLocator` y CLI) y `predict.py`; funciona con PyTorch en CPU o CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF ni safetensors no es directamente compatible con esos runners sin conversión.
- Latencia y throughput: ~190 ms por respuesta de 718 caracteres / 522 tokens con fp16 según el autor; no se publican cifras de throughput por lote ni de hardware de referencia.
- Nota: int8 solo funciona en CPU; en CPU no se admite ejecución en half (`dtype="float16"` es rechazado).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (localizadores de spans para limpieza de respuestas con scaffolding). La comparación más directa disponible es con la versión anterior del propio autor:

| Modelo | Parametros | Contexto | Exact (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| body-locator-small-v1-curated | 57,5 M | 8192 tokens | 95,39 % (282 docs) | other | Hugging Face |
| body-locator-small-v1 | 57,5 M (misma arquitectura) | 8192 tokens | 93,60 % (328 docs, dev original) | other | Hugging Face |

Los denominadores son distintos y el autor advierte que no constituye una comparación estricta. Para alternativas externas: no disponible.

## Limitaciones y advertencias

- Entrenado específicamente para roleplay en chino con respuestas largas; otros géneros pueden ejecutarse pero la precisión no está garantizada.
- Límite duro de 8192 tokens deduplicados; al superarlo lanza `TokenLimitError` en lugar de truncar, lo que exige gestionar la excepción en producción.
- Solo devuelve un intervalo continuo: si el cuerpo está partido por bloques de scaffolding intercalados, el modelo fusiona y cubre también el material intermedio.
- Los offsets se cuentan por codepoints Unicode; espacios, CRLF y emoji cuentan cada uno como un codepoint. Es obligatorio leer los ficheros con `newline=""` para evitar la normalización de CRLF y la desalineación de índices.
- La cuantización int8 introduce deriva en las fronteras: en la muestra del autor, 4 de 40 documentos difirieron entre 6 y 26 caracteres y uno tuvo el inicio desplazado a 0. Solo es ejecutable en CPU.
- El modelo fp16 se almacena en half pero por defecto calcula en fp32; para half real hay que forzarlo y no funciona en CPU.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de falsos positivos/negativos en la localización: 2233 caracteres de cuerpo eliminados y 3754 de no-cuerpo conservados en el dev, con un documento sin intersección con el cuerpo real.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre respuestas reales de LLM en chino, puede heredar sesgos de ese corpus.
- Licencia "other" sin texto: por defecto todos los derechos reservados. El uso comercial requiere contactar con el autor. Los datos de entrenamiento no se publican.
- El repositorio no incluye estados del optimizador ni logs, lo que dificulta reproducir el entrenamiento exacto.
- El número de descargas y likes es 0 en el momento de la consulta, y el modelo se creó y actualizó el mismo día (18 de noviembre de 2026), por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoForceX/body-locator-small-v1-curated
- Versión anterior: https://huggingface.co/GoForceX/body-locator-small-v1
- Modelo base: https://huggingface.co/alphaedge-ai/mmBERT-small-zho-32768
- Paper, blog, repositorio o demo adicionales: no disponible
