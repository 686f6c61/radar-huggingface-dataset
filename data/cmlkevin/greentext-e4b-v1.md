# CMLKevin/greentext-e4b-v1

## Resumen

greentext-e4b-v1 es un ajuste fino completo (full fine-tune) del modelo base google/gemma-4-E4B, desarrollado por CMLKevin, especializado en la generación de historias en formato greentext, el estilo narrativo originario de los tablones de 4chan y de los subreddits r/greentext, r/4chan, r/4tran y r/classic4chan. El modelo se presenta como una ampliación a escala de 4B parámetros efectivos de scratchyone/anon-1b, con una mezcla de datos estratificada por calidad y un peso adicional sobre r/4tran y /lgbt/.

Se trata de un modelo base sin ajuste de seguridad, entrenado sobre texto sin filtrar de 4chan, por lo que reproduce lenguaje soez, contenido sexual, bigoteria y temáticas de autolesión. Su propósito declarado es la investigación y el entretenimiento, no el despliegue en producción orientado a usuarios finales. La licencia es Apache 2.0 y los pesos están en formato safetensors con arquitectura compatible con transformers y vLLM.

El modelo tiene 7.941.100.832 parámetros totales en safetensors y un repositorio de 15,9 GB. Solo soporta inglés. No se han publicado datos sobre longitud de contexto, cuantizaciones ni benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de gemma-4-E4B), fine-tune completo |
| Parametros totales | 7.941.100.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B (base) y se somete a un fine-tune completo en precisión mixta bf16 con pesos maestros en fp32, usando FSDP sobre 8 GPU H100. La configuración de entrenamiento incluye LR 1e-5, AdamW con β2 0.95, sin weight decay, grad clip 1.0, micro-lotes de hasta 8.192 tokens con padding (ordenados por longitud, 0,3% de padding, sin atención entre documentos), 871 pasos de optimizador (~65k tokens cada uno) y un total de 54,9M tokens en aproximadamente 27 minutos. Los tokens de cabecera se enmascaran de la pérdida.

Los datos provienen de tres fuentes: la partición de entrenamiento de scratchyone/anon-greentext (154k capturas OCR de greentext de r/greentext, r/4chan, r/4tran y r/classic4chan, descartando 775 filas con `[illegible]`), 1.296 publicaciones de hilos /lgbt/ de Fal7acy/4chan-archive (MIT), y 4.549 documentos de FineWeb sample-10BT (~5% de los tokens) como replay sin cabecera. La receta incluye una estratificación por percentil de engagement dentro del mismo subreddit y año, cortes en 85/60/25% (top/good/mid/low), dropout de cabecera con p = 0.5 por campo, repeticiones por nivel (top 2×, good 1.5×, mid 1×, low 0.6×, con r/4tran 2× y /lgbt/ 1.5× adicionales, tope de 3 copias por documento) y un schedule warmup–stable–decay en dos fases: la primera con la mezcla barajada a LR constante y la segunda con una pasada sobre documentos de nivel top (más good de r/4tran y /lgbt/) mientras el LR decae a 0.

El formato de prompt es una cabecera, una línea en blanco y la historia, con campos `sub` (r/greentext, r/4chan, r/4tran, r/classic4chan, /lgbt/, [N/A]) y `quality` (top, good, mid, low, [N/A]). El muestreo sugerido es temperatura 0.8, top-p 0.95, repetition penalty 1.1 y 200–400 tokens nuevos, emitiendo EOS al terminar la historia.

## Capacidades

- Generación de texto narrativo en formato greentext: historias cortas con el estilo característico de 4chan (verbos en presente, estructura `>be me`, punchlines).
- Condicionamiento por subreddit/tablón mediante el campo `sub` de la cabecera, que orienta el tono y el registro del texto.
- Condicionamiento por nivel de calidad mediante el campo `quality` (aunque el autor documenta que este campo no tiene efecto medible).
- Generación condicionada por apertura personalizada (custom opener) tras la cabecera.
- Finalización autónoma de historias con emisión de EOS al concluir.
- Capacidades multilingües: únicamente inglés.
- No se documentan tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre generación de texto de dominio específico: el modelo sirve como caso de estudio de fine-tune completo sobre un corpus de estilo muy marcado (greentext) con una receta de estratificación por calidad y repetición por niveles, útil para estudiar cómo se comporta un modelo base de 4B efectivos ante datos de nicho.
- Estudio de estilos narrativos de internet: permite generar corpus sintéticos de greentext para análisis lingüístico, sociológico o de cultura de foros, con control mediante la cabecera `sub` para orientar el registro.
- Evaluación de alineación y seguridad: al ser un modelo base sin ajuste de seguridad que reproduce lenguaje soez y contenido sensible, es útil como caso de prueba para pipelines de filtrado, clasificadores de toxicidad y sistemas de moderación.
- Generación de datos sintéticos para aumento de corpus: puede producir variaciones de greentext para entrenar clasificadores de estilo o detectores de texto generado, siempre que se gestione el riesgo de contenido ofensivo.
- Experimentación con decodificación y muestreo: el formato de prompt definido y los parámetros de muestreo sugeridos permiten reproducir experimentos de generación controlada y comparar estrategias de decodificación.
- Demostraciones y entretenimiento en entornos controlados y con consentimiento explícito: generación de historias humorísticas en el estilo de 4chan para pruebas internas, nunca en productos orientados a usuarios no advertidos.

## Benchmarks y rendimiento

El autor publica evaluaciones en bits por byte UTF-8 (independientes del tokenizador) sobre la partición de validación de anon-greentext, hilos /lgbt/ reservados y 300 documentos de FineWeb no vistos:

| Conjunto | gemma-4-E4B base | anon-1b | greentext-e4b-v1 |
|---|---|---|---|
| all greentext val | 1.100 | 1.048 | 0.992 |
| r/greentext | 1.214 | 1.095 | 1.035 |
| r/4chan | 1.198 | 1.099 | 1.049 |
| r/4tran | 1.184 | 1.086 | 1.035 |
| /lgbt/ | 1.281 | 1.280 | 1.124 |
| FineWeb | 0.763 | 0.878 | 0.824 |

Preferencia por pares ciega frente a anon-1b (56 pares, 7 condiciones de prompt, cabecera de mejor coincidencia por lado, orden A/B aleatorio, jueces sin conocer el autor):

| Juez | greentext-e4b-v1 gana | anon-1b gana | Tasa de victoria (IC 95%) |
|---|---|---|---|
| GPT-6.2 Sol | 39 | 17 | 70% (57–80%) |
| Kimi K3.1 Pro | 40 | 16 | 71% (59–82%) |

Los jueces coincidieron en 62 de 72 llamadas. La ganancia es mayor con cabecera `sub` o apertura personalizada; con ambos campos `[N/A]` el resultado fue aproximadamente parejo. En 352 muestras no se detectó ningún tramo de 12 palabras copiado literalmente de la mezcla de entrenamiento, y la diversidad léxica (distinct-1/2) fue similar a anon-1b. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7.941.100.832 parámetros en bf16 el peso ronda los 15,9 GB, por lo que se requiere al menos ~16 GB de VRAM para bf16 sin overhead de activaciones.
- GPU recomendadas: el autor entrenó sobre 8×H100; para inferencia se puede usar una GPU con ≥24 GB (RTX 4090, L40S, A100 40 GB) para bf16, o GPUs con menos VRAM si se cuantiza (aunque no se publican cuantizaciones oficiales).
- Cabe en consumer GPU: sí, en GPUs de gama alta con 24 GB o más en bf16; en GPUs de 16 GB probablemente requiera cuantización, no publicada.
- Opciones de despliegue: transformers ≥ 5.22 y vLLM 0.34 según el autor; no se documentan otras opciones (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| greentext-e4b-v1 | 7.941.100.832 | no disponible | apache-2.0 | Hugging Face | Fine-tune de gemma-4-E4B sobre greentext |
| anon-1b | no disponible (escala 1B) | no disponible | no disponible | Hugging Face | Modelo de referencia del autor, base del formato y datos |
| gemma-4-E4B (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que parte el fine-tune |

No se dispone de datos de parámetros, contexto ni licencia de anon-1b y gemma-4-E4B en la información proporcionada; la comparativa se limita a los datos documentados.

## Limitaciones y advertencias

- Contenido sensible: entrenado sobre texto sin filtrar de 4chan; reproduce insultos, contenido sexual, bigoteria y temáticas de autolesión, incluso sobre grupos reales de personas. No es apto para despliegue sin consentimiento explícito de los usuarios.
- Sin ajuste de seguridad: es un modelo base, sin RLHF ni DPO, por lo que no rechaza peticiones dañinas.
- El campo `quality` no funciona de forma medible: `quality: top` frente a `quality: low` dio 8–8 y 7–9 con los dos jueces (16 pares), y la pérdida en validación apenas varía por nivel.
- Olvido de capacidades generales: los bits por byte en FineWeb subieron un 8% respecto al modelo base.
- Humor irregular: la voz y la coherencia son sólidas, pero los remates a menudo fallan; las mejores muestras obtuvieron 3,5/5 en la escala de gracia de los jueces.
- Artefactos de OCR y cabeceras falsas de publicaciones de 4chan (IDs, timestamps, nombres de archivo) que son alucinadas.
- Evaluación limitada: una sola ejecución de entrenamiento, una sola semilla y solo jueces LLM, sin evaluación humana.
- Idioma: únicamente inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y los riesgos asociados recaen sobre el despliegue; el autor restringe explícitamente el uso a investigación y entretenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMLKevin/greentext-e4b-v1
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Modelo de referencia anon-1b: https://huggingface.co/scratchyone/anon-1b
- Dataset anon-greentext: https://huggingface.co/datasets/scratchyone/anon-greentext
- Dataset 4chan-archive: https://huggingface.co/datasets/Fal7acy/4chan-archive
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset de mezcla y scripts: https://huggingface.co/datasets/CMLKevin/greentext-mix-v1
