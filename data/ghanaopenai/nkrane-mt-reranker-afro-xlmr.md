# ghanaopenai/nkrane-mt-reranker-afro-xlmr

## Resumen

Nkrane-MT Afro-XLMR Cross-Encoder Reranker es un modelo de clasificación de pares de texto (cross-encoder) desarrollado por GhanaOpenAI como componente del pipeline de traducción automática Nkrane-MT. Su función es resolver la desambiguación léxica contextual en la dirección inglés → twi asante (akano): dado un término inglés preservado entre marcadores angulares dentro de una frase generada en twi, el modelo puntúa cada candidato de traducción procedente de un diccionario offline y selecciona el que mejor encaja semántica e idiomáticamente en ese contexto concreto.

El modelo parte de `Davlan/afro-xlmr-base`, un encoder transformer multilingüe de 278 millones de parámetros con sesgo afrocéntrico, sobre el que se aplica un ajuste fino como clasificador binario con salida sigmoidea. El tokenizador se ha extendido con los marcadores especiales `<` y `>` para preservar los tramos entre corchetes que señalan los sustantivos pendientes de desambiguar. La relevancia actual del modelo radica en que ataca un problema clásico y poco resuelto en traducción de lenguas de bajos recursos: la polisemia léxica que los modelos seq2seq generativos no resuelven de forma fiable.

Con 278 millones de parámetros, licencia Apache 2.0 y latencia declarada inferior a 5 ms por par candidato en GPU, el modelo está pensado como etapa de post-procesado en pipelines de traducción, no como generador autónomo. Su valor práctico depende de integrarse junto a un traductor seq2seq y un léxico de candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias; cross-encoder de pares |
| Parametros totales | 278.044.417 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explícita; los ejemplos de uso truncan a `max_length=160` tokens por par |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | tw (twi), ak (akano), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder basado en `Davlan/afro-xlmr-base`, un XLM-RoBERTa base adaptado a lenguas africanas. El modelo recibe un par de secuencias (`text_a`: frase en twi asante con el sustantivo inglés preservado entre `<` y `>`; `text_b`: candidato léxico en twi) y produce un logit único que, tras aplicar sigmoide, se interpreta como la idoneidad semántica e idiomática del candidato en ese contexto. El tokenizador se extendió con los tokens especiales `<` y `>` para no fragmentar los tramos delimitados. La tarea se formula como clasificación binaria de pares, lo que permite puntuar todos los candidatos de un término en una sola pasada por lote.

El ajuste fino se realizó sobre 606.404 pares de entrenamiento y 13.024 pares de validación, construidos a partir de corpus paralelos ghaneses y léxicos. El entrenamiento se ejecutó en una única NVIDIA H200 (140 GB de VRAM) con `bfloat16` y `TF32`, optimizador AdamW con tasa de aprendizaje 1e-5, schedule coseno y 500 pasos de warmup, batch de 16 por dispositivo con 4 pasos de acumulación de gradiente. La model card no documenta el uso de RLHF, DPO ni otras técnicas de alineación, ni detalla la composición exacta del corpus más allá de su origen ghanés.

## Capacidades

- Puntuación de idoneidad contextual de un candidato léxico en twi asante dentro de una frase generada, con salida sigmoidea en el intervalo [0, 1].
- Desambiguación léxica y de sentido de palabra (word-sense disambiguation) para términos ingleses polisémicos traducidos al twi asante.
- Clasificación de pares de texto (cross-encoder) para reranking de candidatos, con soporte de puntuación por lotes de varios candidatos simultáneamente.
- Manejo de marcadores especiales `<` y `>` en el tokenizador para preservar tramos delimitados dentro de la frase.
- Cobertura lingüística de twi, akano e inglés.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no implementa razonamiento multi-paso y no dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Desambiguación en pipelines de traducción inglés → twi asante: tras la generación de una frase con el sustantivo inglés preservado entre corchetes, el modelo puntúa cada candidato del diccionario y selecciona el de mayor confianza; es su función principal y el escenario para el que fue entrenado.
- Traducción de documentación administrativa y financiera: términos como "trade" admiten varias lecturas ("dwadie" para comercio, "adwuma" para profesión); el modelo elige según el contexto de la frase, lo que reduce errores en textos institucionales.
- Post-edición automática de traducciones existentes: dado un texto ya traducido con términos dudosos, se puede re-evaluar cada candidato contra la frase completa y corregir selecciones léxicas sin regenerar la traducción.
- Construcción de léxicos bilingües contextualizados: el modelo permite anotar automáticamente qué sentido de una palabra inglesa se activa en cada ocurrencia de un corpus paralelo, generando datos de entrenamiento para otros sistemas.
- Integración en el paquete `nkrane-mt`: combinado con un generador seq2seq como `ghanaopenai/gloss-mt-2-nllb-600m-en2tw`, forma un traductor completo con desambiguación posterior; la API `GlossMT2Translator` acepta el reranker como parámetro.
- Evaluación de calidad de traducción a nivel léxico: la puntuación sigmoidea por candidato sirve como señal de confianza para detectar tramos donde el traductor generativo produjo una elección léxica dudosa.
- Servicio de bajo coste en producción: con menos de 5 ms por par candidato en GPU y 278 millones de parámetros, puede desplegarse como microservicio de reranking sin dominar el presupuesto de cómputo del pipeline.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Cross-Encoder Contextual Lexical Disambiguation | nkrane-mt-parallel-corpus-eng-twi (`ghanaopenai/nkrane-mt-parallel-corpus-eng-twi`) | Accuracy | 97,21 % |

El autor declara además una latencia de inferencia inferior a 5 ms por par candidato en GPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16` o `float16`: aproximadamente 0,6 GB para los pesos (278 millones de parámetros); con overhead de activaciones y tokenizador, un presupuesto de 1 a 2 GB es suficiente para lotes pequeños.
- VRAM estimada en `float32`: aproximadamente 1,1 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100, H100 y H200. El entrenamiento se realizó en una H200, pero la inferencia no requiere hardware de ese nivel.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM; también puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (uso documentado por el autor); al ser un encoder estándar, es compatible con `vLLM` (modo embedding/scoring), `TGI` y `TorchServe`. No se documentan variantes GGUF ni soporte explícito de `llama.cpp` u `Ollama`.
- Latencia y throughput: menos de 5 ms por par candidato en GPU según el autor; el rendimiento agregado depende del número de candidatos por término y del tamaño de lote, no documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nkrane-mt-reranker-afro-xlmr | 278 M | no disponible (truncado a 160 en ejemplos) | Cross-encoder de desambiguación léxica en→tw | Apache 2.0 | Hugging Face |
| Davlan/afro-xlmr-base | 278 M | 512 tokens (XLM-R base) | Encoder multilingüe afrocéntrico (modelo base) | no disponible en la información | Hugging Face |
| BAAI/bge-reranker-base | 278 M | 512 tokens | Cross-encoder de reranking generalista | MIT | Hugging Face |

La comparación con `bge-reranker-base` es orientativa por coincidencia de tamaño y arquitectura de cross-encoder; no se dispone de resultados comparativos directos en la tarea de desambiguación inglés → twi. El modelo base `Davlan/afro-xlmr-base` comparte arquitectura y número de parámetros, pero no está especializado en la tarea de reranking. No se dispone de datos de benchmarks de alternativas en el mismo corpus para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo no generativo: solo puntúa pares de texto; no puede producir traducciones por sí mismo y requiere un generador seq2seq y un diccionario de candidatos externos.
- Especialización estrecha: entrenado exclusivamente para desambiguación léxica inglés → twi asante; su comportamiento fuera de esa dirección, de ese par de lenguas o de la tarea de reranking léxico no está documentado.
- Dependencia de los marcadores `<` y `>`: si el generador no preserva correctamente los corchetes o los coloca de forma distinta a la vista en entrenamiento, la puntuación puede degradarse.
- Longitud de entrada limitada en la práctica: los ejemplos truncan a 160 tokens por par; frases más largas pueden perder el contexto necesario para desambiguar.
- Riesgo de sesgo hacia los sentidos más frecuentes en el corpus de entrenamiento (606.404 pares de corpus ghaneses y léxicos), con posible infrarepresentación de sentidos minoritarios o de registros especializados.
- Riesgo de alucinación de confianza: la salida sigmoidea puede asignar puntuaciones altas a candidatos incorrectos si el contexto es ambiguo o el término no aparece en el léxico de entrenamiento; se recomienda umbral de confianza y fallback.
- Métrica de validación no verificada de forma independiente: el 97,21 % de accuracy procede de la model card del autor y se calcula sobre pares de validación del propio corpus, no sobre un conjunto de test externo.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, pero conviene revisar los términos del modelo base `Davlan/afro-xlmr-base` antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghanaopenai/nkrane-mt-reranker-afro-xlmr
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Repositorio del pipeline Nkrane-MT: https://github.com/GhanaOpenAI/nkrane-mt
- Generador seq2seq asociado: https://huggingface.co/ghanaopenai/gloss-mt-2-nllb-600m-en2tw
- Corpus paralelo de referencia: https://huggingface.co/datasets/ghanaopenai/nkrane-mt-parallel-corpus-eng-twi
