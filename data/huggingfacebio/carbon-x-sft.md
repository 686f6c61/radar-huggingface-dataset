# HuggingFaceBio/Carbon-X-SFT

## Resumen

Carbon-X-SFT es un modelo de lenguaje decoder-only de 14.800 millones de parametros especializado en comprension de ADN, desarrollado por Hugging Face Bio. Parte de Qwen3-14B como base arquitectonica y anade un vocabulario especifico de ADN (5155 tokens) para procesar secuencias genomicas dentro de conversaciones en lenguaje natural. El modelo responde en ingles a preguntas sobre variantes geneticas, regiones regulatorias, clasificacion de organismos y prediccion de bases.

Este checkpoint representa la segunda etapa del pipeline de entrenamiento de Carbon-X: es el resultado de afinar Carbon-X-Base durante tres epocas sobre una mezcla de 20 conjuntos de datos de ADN, biologia e instrucciones conversacionales, antes de la fase de aprendizaje por refuerzo que produce el modelo final Carbon-X. Su interes reside en que documenta de forma aislada el techo del ajuste supervisado: alcanza un 59,3% de media en los cinco benchmarks de ADN del autor, frente al 40,0% de Qwen3-14B sin adaptar.

Con 40.960 tokens de contexto, licencia Apache 2.0 y soporte para despliegue en una sola GPU mediante vLLM, el modelo esta pensado para investigadores que quieran partir de un checkpoint solido para su propio RL, o como referencia de lo que consigue el SFT puro antes de la optimizacion con recompensas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B adaptado), GQA, SwiGLU, RMSNorm con QK-norm |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,7 GB) |

## Arquitectura y entrenamiento

Carbon-X-SFT es un transformer causal de 40 capas con tamano oculto 5120, atencion con query grouping (40 cabezas de query, 8 de clave/valor), activacion SwiGLU y normalizacion RMSNorm con QK-norm. Hereda la estructura de Qwen3-14B, pero sustituye el tokenizador por uno hibrido: mantiene el vocabulario BPE de Qwen3 para texto y anade 5515 tokens de ADN compuestos por 4096 6-mers canonicos, 1364 tokens de cola para secuencias cuya longitud no es multiplo de 6, y los marcadores `<dna>`, `</dna>` y `<oov>`. El tokenizador detecta automaticamente tramos de al menos 6 bases A/C/G/T (o de al menos 12 bases con hasta un 20% de codigos IUPAC) y los envuelve en las etiquetas `<dna>...</dna>`.

El entrenamiento se articula en tres fases. Carbon-X-Base se obtuvo mid-entrenando Qwen3-14B sobre 302.000 millones de tokens de ADN y texto. Carbon-X-SFT, este checkpoint, es el resultado de afinar esa base durante 3 epocas sobre una mezcla de 20 datasets de ADN, biologia e instrucciones. La fase final, Carbon-X, aplica aprendizaje por refuerzo con recompensas verificables sobre tareas de ADN. El modelo se entreno y evaluo con el modo de razonamiento (`enable_thinking`) desactivado, y el autor recomienda mantenerlo asi; los valores de muestreo por defecto son temperatura 0,6, top-p 0,95 y top-k 20.

## Capacidades

- Prediccion de efecto de variantes: clasifica mutaciones como benignas o patogenicas y explica el razonamiento.
- Identificacion de regiones regulatorias en secuencias de ADN.
- Clasificacion de secuencias por grupo de organismo.
- Prediccion de las siguientes bases de una secuencia (modelado de lenguaje sobre ADN).
- Generacion de texto y conversacion multi-turno en ingles con contexto de hasta 40.960 tokens.
- Razonamiento explicito sobre secuencias: el modelo justifica sus predicciones en lenguaje natural.
- Procesamiento de secuencias con codigos de ambiguedad IUPAC (hasta un 20% por tramo).
- No documenta soporte de tool calling, function calling ni capacidades de vision o audio.
- No documenta modo de razonamiento extendido; el autor recomienda operar con `enable_thinking=False`.

## Casos de uso

- Triaje de variantes en investigacion genomica: dado un par referencia/variante, el modelo emite una clasificacion benigno/patogenico con justificacion, util como primer filtro antes de la validacion experimental.
- Anotacion funcional de secuencias: pegar un fragmento genomico en una conversacion para obtener hipotesis sobre regiones regulatorias o elementos funcionales, aprovechando el tokenizador de 6-mers.
- Clasificacion taxonomica de secuencias: determinar el grupo de organismo de origen de un fragmento desconocido dentro de un pipeline de metagenomica.
- Generacion y completado de secuencias: prediccion de bases siguientes para tareas de diseno o imputacion, con la ventana de 40.960 tokens permitiendo contextos genomicos amplios.
- Base para aprendizaje por refuerzo propio: el checkpoint sirve como punto de partida documentado para aplicar RL con recompensas verificables sobre tareas de ADN, replicando la fase que produce Carbon-X.
- Asistente conversacional para biologos: interfaz en lenguaje natural que traduce preguntas biologicas a analisis de secuencia y devuelve explicaciones en ingles, reduciendo la necesidad de scripts ad hoc.
- Evaluacion comparativa de pipelines de SFT: referencia publica de lo que consigue el ajuste supervisado puro frente al modelo final con RL, util para medir la contribucion de cada etapa.

## Benchmarks y rendimiento

| Modelo | Media en 5 benchmarks de ADN (thinking desactivado) |
|---|---|
| Qwen3-14B | 40,0% |
| Carbon-X-SFT | 59,3% |
| Carbon-X | 66,7% |

El autor no desglosa los resultados por benchmark individual en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 30 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 40 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, o GPUs consumer de 48 GB (RTX A6000, RTX 6000 Ada). En GPUs de 24 GB (RTX 4090) no cabe en bf16 sin cuantizacion.
- Despliegue en una sola GPU mediante vLLM, segun documenta el autor: `vllm serve HuggingFaceBio/Carbon-X-SFT --trust-remote-code`.
- Compatible con Transformers v5 o superior; requiere `trust_remote_code=True` para el tokenizador de ADN.
- El repo incluye tags de text-generation-inference y endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X-SFT | 14,8B | 40.960 | 59,3% | Apache 2.0 | HuggingFace |
| Carbon-X | 14,8B | 40.960 | 66,7% | Apache 2.0 | HuggingFace |
| Carbon-X-Base | 14,8B | 40.960 | no disponible | Apache 2.0 | HuggingFace |
| Qwen3-14B | 14B | no disponible en esta ficha | 40,0% | no disponible en esta ficha | HuggingFace |

La comparativa se limita a los modelos de la propia familia Carbon-X y a Qwen3-14B, unico modelo externo con resultado reportado por el autor. No se dispone de datos de otros modelos genomicos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado y evaluado exclusivamente en ingles; no se documenta soporte multilingue.
- Entrenado con `enable_thinking=False`; activar el modo de razonamiento puede degradar la calidad respecto a los resultados reportados.
- Riesgo de alucinacion en clasificaciones de variantes y anotaciones funcionales: las predicciones no sustituyen validacion experimental ni criterios clinicos.
- Sesgos de los datos de entrenamiento genomicos no documentados por el autor; la composicion exacta de los 20 datasets no se detalla.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para aplicaciones clinicas o diagnosticas.
- Requiere Transformers v5 o superior y `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del tokenizador.
- No documenta soporte de tool calling ni integracion con agentes.
- El checkpoint es una etapa intermedia; para el mejor rendimiento el autor remite explicitamente a Carbon-X.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HuggingFaceBio/Carbon-X-SFT
- Modelo final Carbon-X: https://huggingface.co/HuggingFaceBio/Carbon-X
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X-Base
- Organizacion Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Blog / demo: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Codigo: https://github.com/huggingface/carbon/tree/main
