# llm-semantic-router/Vela-1.0-Encoder-307M

## Resumen

Vela-1.0-Encoder-307M es un modelo encoder multilingüe de tipo masked language model (MLM) publicado por el usuario llm-semantic-router. Se trata de una actualización mediante continued pretraining del checkpoint llm-semantic-router/mmbert-32k-yarn, que a su vez deriva de jhu-clsp/mmBERT-base, de la familia ModernBERT. Cuenta con 307.786.240 parámetros únicos (306.939.648 si se carga únicamente el encoder con `AutoModel`) y una arquitectura de 22 capas, anchura oculta de 768 y 12 cabezas de atención, con un presupuesto de contexto de 32.768 tokens incluyendo los tokens especiales del tokenizer.

El problema que aborda es acotado y explícito: mejorar la verosimilitud de predicción de tokens enmascarados en ventanas largas multilingües sin degradar el rendimiento a 32K. El ajuste consistió en 200 pasos de optimización sobre ventanas de Wikipedia en seis idiomas (inglés, chino, alemán, francés, japonés y árabe). La evaluación final independiente reportada por el autor muestra una reducción del NLL en 512, 8.192 y 16.384 tokens, y un comportamiento estadísticamente indistinguible del modelo fuente a 32.768 tokens.

Su relevancia actual es la de un encoder largo multilingüe con licencia MIT, un formato poco común en la franja de 300M de parámetros, donde alternativas consolidadas como XLM-RoBERTa-base están limitadas a 512 tokens de contexto. No es un modelo generativo ni un checkpoint de embeddings listo para producción: es una base sobre la que hay que entrenar tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder estilo ModernBERT, 22 capas, hidden 768, 12 cabezas de atencion |
| Parametros totales | 307.786.240 (incluye la cabeza MLM; parametros unicos, pesos atados contados una vez) |
| Parametros activos | No aplica: modelo denso. 307.786.240 en prediccion de tokens enmascarados; 306.939.648 si se carga solo el encoder con AutoModel |
| Longitud de contexto | 32.768 tokens, incluyendo tokens especiales del tokenizer |
| Tipos de cuantizacion | No disponible. Los pesos publicados estan en FP32; no se documentan variantes GGUF, AWQ o GPTQ oficiales |
| Idiomas soportados | Evaluados: en, zh, de, fr, ja, ar. El tokenizer hereda cobertura adicional del linaje mmBERT, no verificada en la informacion disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32), paquete estandar `ModernBertForMaskedLM` en transformers |
| Tarea declarada | fill-mask (masked language modeling) |
| Precision de entrenamiento | Pesos maestros FP32 con autocast en BF16 |
| SHA-256 de los pesos candidatos | `ccc274d12ef6f94f54c0c23f0388527b0a925268a1332b3a6e5c8e56868efb00` |
| Modelo base | llm-semantic-router/mmbert-32k-yarn (revision `72a23a6640489471eb4ff7ad3ec5bc80af8a27de`) |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer de la familia ModernBERT: 22 capas, anchura oculta 768 y 12 cabezas de atencion, con pesos de embedding de entrada y decodificador atados. Segun la model card, la actualizacion preserva la configuracion nativa de RoPE del checkpoint fuente y no inserta un nuevo esquema de escalado YaRN; el nombre historico del modelo de origen es una cuestion de procedencia, no una garantia de implementacion de escalado ni de precision. No se documentan en la informacion disponible otros detalles de la arquitectura interna (tipo de activacion, patron de atencion global/local o estrategia de unpadding).

El entrenamiento consistio en continued pretraining durante 200 pasos de optimizacion sobre ventanas de Wikipedia en seis idiomas, partiendo de `wikimedia/wikipedia` en la revision `b04c8d1ceb2f5cd4588862100d08de323dccfbaa`, configuraciones `20231101.{en,zh,de,fr,ja,ar}`. Se usaron 1.223 articulos fuente que produjeron 456 ventanas de entrenamiento, 78 de validacion y 156 finales. La asignacion de particiones se hizo por hash SHA-256 de `vela-base-v1:language:id` modulo 20 (0-1 validacion, 2-3 final, 4-19 entrenamiento), garantizando que cada articulo pertenece a una sola particion y grupo de longitud, con deduplicacion global por hash de texto completo. No se usaron articulos de validacion ni finales en el run de entrenamiento. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, lo cual es coherente con un modelo base de tipo encoder.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) multilingue en seis idiomas evaluados: en, zh, de, fr, ja y ar.
- Procesamiento de secuencias largas de hasta 32.768 tokens en una sola pasada, sin troceado, lo que permite modelar contexto dentro de un documento completo.
- Buen comportamiento a 512, 8.192 y 16.384 tokens, con NLL inferior al modelo fuente segun la evaluacion final del autor.
- Extraccion de representaciones contextuales por token y por secuencia, reutilizables como base para tareas de clasificacion, etiquetado o recuperacion previo fine-tuning.
- Capacidad de servir como backbone de cross-encoders y bi-encoders para reranking y retrieval, siempre que se entrene la cabeza correspondiente.
- No genera texto de forma autorregresiva, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene modo thinking.
- No incluye vision, audio ni capacidades multimodales.
- No es un checkpoint de embeddings ni un clasificador: este repositorio es un modelo Base y sus descendientes por tarea requieren entrenamiento y evaluacion propios.

## Casos de uso

- Enrutamiento semantico en pipelines LLM: el encoder procesa la consulta y, con una cabeza de clasificacion ligera entrenada encima, decide a que modelo o herramienta derivarla. El nombre de la organizacion y el presupuesto de 32K lo hacen adecuado para enrutar conversaciones completas con historial largo sin truncar.
- Reranking de resultados de busqueda: entrenando una cabeza de clasificacion sobre pares consulta-documento, el modelo puede puntuar candidatos en un pipeline de recuperacion en dos fases. Sus 32K tokens permiten puntuar pasajes largos o documentos completos, algo inviable con encoders de 512 tokens.
- Clasificacion de documentos largos sin chunking: contratos, informes tecnicos o articulos enciclopedicos que superan los 8K tokens se pueden clasificar etiquetando el token `[CLS]`, evitando la perdida de contexto y la agregacion heuristica de fragmentos.
- Reconocimiento de entidades nombradas multilingue: con la cabeza de token classification, el modelo hereda un tokenizer multilingue y puede etiquetar entidades en corpus que mezclan ingles, aleman, frances, chino, japones y arabe en un unico pipeline.
- Deduplicacion y agrupamiento de corpus: las representaciones del encoder permiten detectar near-duplicates y agrupar documentos por similitud semantica en tareas de curacion de datos de entrenamiento, donde el coste por documento es bajo.
- Moderacion y filtrado de contenido: entrenando un clasificador binario o multietiqueta sobre la representacion de secuencia, se puede usar como primera etapa de filtrado en sistemas de publicacion de contenido, con la ventaja de evaluar el texto completo en lugar de fragmentos.
- Anotacion asistida y aumento de datos: el uso directo de fill-mask permite proponer sustituciones plausibles de tokens enmascarados, util para correccion de texto, normalizacion de corpus o generacion de ejemplos aumentados en el preentrenamiento de otros modelos.
- Busqueda semantica sobre Wikipedia multilingue: al estar entrenado sobre ese corpus, es una base razonable para sistemas de recuperacion o QA extractivo sobre Wikipedia en los seis idiomas evaluados, previo fine-tuning de la cabeza de QA.

## Benchmarks y rendimiento

El autor publica una evaluacion final sobre 156 ventanas con corrupcion MASK-only del 15% de las posiciones elegibles, inferencia en BF16 con Transformers 4.57.6 y misma tokenizacion y posiciones enmascaradas para fuente y candidato. Son metricas de masked language modeling, no de tareas downstream.

| Tokens de entrada | Ventanas finales | Objetivos enmascarados | NLL fuente | NLL Vela | Top-1 fuente | Top-1 Vela |
|---|---:|---:|---:|---:|---:|---:|
| 512 | 120 | 9.173 | 1,411560 | 1,368265 | 70,2169% | 70,5876% |
| 8.192 | 12 | 14.759 | 1,251000 | 1,241328 | 72,5252% | 72,7285% |
| 16.384 | 12 | 29.478 | 1,250921 | 1,245164 | 72,3489% | 72,3590% |
| 32.768 | 12 | 59.402 | 1,304365 | 1,305110 | 71,9504% | 71,8242% |

Intervalos de confianza bootstrap al 95%, estratificados por idioma y longitud, para la diferencia de NLL candidato menos fuente: 512 `[-0,051709, -0,034917]`; 8K `[-0,012381, -0,006800]`; 16K `[-0,007950, -0,003642]`; 32K `[-0,001165, +0,002619]`. El intervalo a 32K incluye el cero. En el agregado de ventanas largas, el NLL mejoro de 1,281564 a 1,278977 mientras el top-1 paso de 72,1456% a 72,1051%. En el diagnostico de retencion de 636 ventanas, ya inspeccionado previamente y no ciego, el NLL tambien mejoro a 512, 8K y 16K y permanecio aproximadamente igual a 32K.

No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, GLUE, SQuAD o HumanEval para este modelo.

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 1,23 GB en FP32 (precision nativa publicada) y unos 0,62 GB en BF16 o FP16. Estas cifras son calculos aritmeticos a partir de los 307.786.240 parametros, no mediciones publicadas.
- VRAM adicional por activaciones: no disponible de forma oficial. Con 32.768 tokens de entrada y 22 capas de anchura 768, el consumo de activaciones domina el uso de memoria y depende del runtime, del uso de Flash Attention y de si se aplica gradient checkpointing en entrenamiento.
- GPU recomendadas: no especificadas por el autor. En inferencia FP32 el modelo cabe en cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050), y en BF16 en GPUs con 2-3 GB o mas. Para entrenamiento con contexto de 32K se requiere una GPU de datacenter (A100, H100, L40S) o consumer de gama alta (RTX 4090, RTX 3090) con 24 GB.
- Si cabe en GPU consumer: si, en inferencia. La restriccion a contexto largo es de memoria de activaciones, no de pesos.
- Opciones de despliegue: la model card valida el uso con Transformers 4.57.6 en BF16 y el paquete `ModernBertForMaskedLM`. No se documenta soporte verificado en vLLM, TGI, llama.cpp, Ollama ni en runtimes de cuantizacion, y no hay variantes GGUF publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos que no son Vela-1.0 provienen de sus model cards publicas y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M | 307,8 M | 32.768 | 6 evaluados (en, zh, de, fr, ja, ar) | MIT | Encoder MLM |
| llm-semantic-router/mmbert-32k-yarn | Misma arquitectura (ancestro directo) | 32.768 | Multilingue | No indicada en la informacion | Encoder MLM |
| jhu-clsp/mmBERT-base | ~307 M | 8.192 nativo, extensible | Multilingue (cobertura amplia segun su model card) | Apache-2.0 | Encoder MLM |
| answerdotai/ModernBERT-base | 149 M | 8.192 | Ingles | Apache-2.0 | Encoder MLM |
| FacebookAI/xlm-roberta-base | 278 M | 512 | 100 idiomas | MIT | Encoder MLM |

Frente a ModernBERT-base, Vela duplica aproximadamente el numero de parametros y multiplica por cuatro el contexto, ademas de anadir soporte multilingue. Frente a XLM-RoBERTa-base, la diferencia principal es el presupuesto de contexto, 32.768 frente a 512 tokens. Frente a su ancestro directo mmbert-32k-yarn, la unica diferencia documentada es el continued pretraining de 200 pasos; los pesos de partida tienen SHA-256 `6235e1c429e6c209f93def470518e9148618deff86edc3b5fd4fd5baf87a6c38`.

## Limitaciones y advertencias

- El modelo no genera texto. Cualquier caso de uso que requiera generacion, chat, tool calling o agentes queda fuera de su alcance.
- La mejora a 32.768 tokens no esta demostrada: el NLL es aproximadamente igual y el top-1 cae 0,126 puntos porcentuales. El propio autor describe el resultado a 32K como evidencia de retencion, no de mejora.
- El intervalo de confianza de la diferencia de NLL a 32K incluye el cero, y solo existen dos ventanas largas finales por celda de idioma y longitud, lo que limita la potencia estadistica de esa conclusion.
- Las metricas publicadas son de masked language modeling. No hay resultados de clasificacion, retrieval, reranking ni perplejidad autorregresiva, y no se pueden extrapolar a esas tareas.
- Solo se evaluaron seis idiomas. El tokenizer puede cubrir mas, pero no hay evidencia de calidad fuera de en, zh, de, fr, ja, ar.
- Las ventanas de Wikipedia empaquetan varios articulos concatenados, por lo que los resultados a 32K no demuestran comprension de documentos naturales de 32K, recuperacion posicional ni seguimiento de instrucciones.
- El ajuste es muy leve (200 pasos de optimizacion), por lo que las diferencias respecto al checkpoint fuente son pequenas por diseno.
- Sesgos esperables por el corpus: Wikipedia tiene registro enciclopedico y formal, con cobertura desigual de variedades dialectales, registros coloquiales y dominios especializados. No se documenta ninguna mitigacion de sesgos.
- Riesgo de alucinacion en sentido estricto no aplica, porque no hay generacion libre; sin embargo, un fill-mask puede producir sustituciones plausibles pero incorrectas si se usa para completar texto.
- Licencia MIT en los pesos, lo que permite uso comercial sin restricciones adicionales. Conviene revisar aparte las condiciones de los datos de Wikipedia (habitualmente CC BY-SA) si se redistribuyen derivados del corpus, aunque la informacion disponible no detalla el tratamiento de esa capa.
- Este repositorio es un modelo Base. Usarlo directamente como extractor de embeddings o como clasificador sin entrenamiento especifico no es su proposito declarado.
- La metadata indica 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion del 12 de septiembre de 2026. Es un modelo reciente y sin adopcion verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- Modelo base directo (mmbert-32k-yarn), revision fijada: https://huggingface.co/llm-semantic-router/mmbert-32k-yarn/tree/72a23a6640489471eb4ff7ad3ec5bc80af8a27de
- Ancestro de la familia (mmBERT-base): https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset de entrenamiento (wikimedia/wikipedia), revision fijada: https://huggingface.co/datasets/wikimedia/wikipedia/tree/b04c8d1ceb2f5cd4588862100d08de323dccfbaa
- Carpeta de evaluacion con metricas por idioma y registros emparejados por ventana: `evaluation/` en el repositorio
- Diagnostico de retencion: `evaluation/retention-diagnostic.json` en el repositorio
- Manifiestos de reproducibilidad de articulos y ventanas: `reproducibility/` en el repositorio
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante para este modelo. Las paginas devueltas son articulos genericos sobre modelos de lenguaje (Wikipedia en frances e ingles, rankings de LLM y una introduccion de GeeksforGeeks) sin relacion con Vela-1.0-Encoder-307M.
