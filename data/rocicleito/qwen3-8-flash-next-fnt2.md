# Rocicleito/Qwen3.8-Flash-Next-FNT2

## Resumen

Qwen3.8-Flash-Next-FNT2 es una cuantización especializada del modelo Qwen3.8-Flash-Next, un transformer de mezcla de expertos (MoE) de 125 000 millones de parámetros desarrollado por el equipo Qwen. Esta versión concreta, publicada por el usuario Rocicleito, reencoda los expertos enrutados del modelo en FNT v2, un códec de tipo trellis inspirado en QTIP que reduce los pesos a 2,48 bits por peso (incluyendo escalas). El resultado es un shard de 40,9 GB que, junto con un segundo shard externo y un drafter MTP, permite ejecutar el modelo completo en una única GPU de 24 GB con unos 64 GB de memoria de sistema.

El problema que resuelve es el de hacer viable un modelo de 125B en hardware de consumo: la cuantización agresiva de los expertos, que son la mayor parte de los parámetros, mantiene una divergencia KL de 0,1372 frente a una referencia con expertos Q8_0, un 31 % inferior a la del GGUF IQ3_XXS de ISTA-DASLab, ocupando además 6 GB menos en el primer shard. La contrapartida es que los ficheros solo funcionan en tqLLM sobre CUDA, con soporte para los tipos GGUF 330-333 y 338-341, y no cargan en llama.cpp, Ollama ni LM Studio.

Es relevante ahora porque demuestra que técnicas de cuantización post-entrenamiento basadas en trellis y en activaciones capturadas pueden llevar modelos MoE de gran escala a un régimen de ejecución local con contexto de 128K y velocidades de decodificación superiores a 100 tok/s en una RTX 3090. La licencia del modelo base es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con hyper-connection mixers y drafter MTP |
| Parametros totales | 125 000 millones (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens (128K, configurado en el ejemplo de ejecución) |
| Tipos de cuantizacion | Expertos enrutados en FNT v2 (2,48 bits por peso, tipos GGUF 330-333 y 338-341 propios de tqLLM); hyper-connection mixers y claves/valores por capa en Q8_0; resto de tensores y shard 2 en IQ3_XXS (GSQ-RCO) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (shard 1 propio, shard 2 de ISTA-DASLab), manifiesto `.tqfn` y fichero de ablación `.tqab` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de 125B parámetros. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original. Lo que sí documenta el autor es el proceso de cuantización: los expertos enrutados se reencodaron desde los pesos BF16 mediante un codificador trellis de Viterbi sobre activaciones capturadas, generando el formato FNT v2. Los mixers de hyper-connection y las claves/valores por capa se mantuvieron en Q8_0, mientras que la atención, el experto compartido y los embeddings se heredan sin cambios del GGUF IQ3_XXS de ISTA-DASLab.

La innovación técnica principal es el códec trellis (posterior a QTIP) aplicado a los expertos, que alcanza 2,48 bits por peso incluyendo escalas. El repositorio incluye además un drafter MTP (multi-token prediction) para decodificación especulativa y una tabla n-gram IQ4_NL en el shard 2. El sistema de ejecución, tqLLM, permite fijar expertos en RAM y mantener slots en la GPU (245 por capa en la configuración medida), con empaquetado de memoria controlado por `TQLLM_PACK_RAM_FRAC`.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (`--reasoning on --reasoning-effort medium`).
- Razonamiento matemático: 49/50 en las primeras 50 preguntas de test de GSM8K en modo greedy.
- Decodificación especulativa mediante drafter MTP, que acelera la generación.
- Contexto largo de hasta 131 072 tokens, con procesamiento de prompts de 120K en 52,1 s.
- Servidor compatible con la API de OpenAI (`/v1`) para integración con clientes existentes.
- Capacidad opcional de ablación de rechazos en tiempo de ejecución mediante proyección de direcciones en los residuales (capas 18-47 y capa MTP), sin modificar los pesos en disco.
- Soporte de tool calling, function calling, agentes o multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local con contexto largo: con 128K tokens de ventana, el modelo puede cargar repositorios completos o varios ficheros de un proyecto y responder sobre ellos sin truncar, ejecutándose en una sola GPU de 24 GB.
- Análisis de documentos extensos: informes, contratos o expedientes de decenas de miles de tokens caben en el contexto; el procesamiento de un prompt de 120K en 52 s hace viable el análisis por lotes en hardware de consumo.
- Razonamiento matemático y resolución de problemas: el rendimiento de 49/50 en GSM8K con razonamiento medio lo hace adecuado para tutoría automatizada o verificación de cálculos en pipelines internos.
- Servicio de inferencia autoalojado compatible con OpenAI: el endpoint `/v1` permite sustituir APIs comerciales en prototipos y herramientas internas sin cambiar el código cliente.
- Investigación sobre cuantización y mecánica interna: el fichero de ablación de rechazos y las direcciones por capa permiten estudiar el comportamiento del modelo y experimentar con intervenciones en los residuales.
- Evaluación de modelos MoE a gran escala en entornos con presupuesto limitado: permite comparar el comportamiento de un 125B frente a alternativas menores sin acceso a clústeres multi-GPU.
- Generación de texto por lotes con throughput moderado: a 134-157 tok/s en una RTX 3090, es apto para tareas de resumen o extracción sobre volúmenes medios de documentos.

## Benchmarks y rendimiento

Calidad de cuantización (divergencia KL frente a referencia con expertos Q8_0, WikiText-2 test, 8 fragmentos de 2048 tokens, herramienta `tqkld`):

| Expertos enrutados | KLD | Mismo token top-1 | PPL (referencia 1,994) |
|---|---:|---:|---:|
| FNT v2 (este repo) | 0,1372 | 90,70 % | 2,087 |
| FNT v1 (mismo tamano) | 0,1451 | 90,60 % | 2,095 |
| ISTA GSQ-RCO IQ3_XXS | 0,1981 | 88,98 % | 2,158 |

Rendimiento de inferencia (RTX 3090 24 GB, 59 GiB de RAM de sistema, contexto 128K, `TQLLM_PACK_RAM_FRAC=0.8`, drafter MTP, greedy):

| Metrica | Valor |
|---|---|
| Conjunto mixto de prompts (frio / GSM8K / caliente) | 134,9 / 157,8 / 141,2 tok/s |
| Decodificacion de 500 tokens tras prompt de 28K / 120K | 102,4 / 112,1 tok/s |
| Procesamiento de prompt de 120K tokens | 52,1 s |
| Slots de expertos en GPU | 245 por capa |
| Expertos fijados en RAM | 37,4 GB |

Ablación de rechazos (medida sobre el fichero IQ3_XXS de ISTA): rechazos en 100 prompts dañinos de 100 a 5; GSM8K-250 de 244 a 245; MMLU-Pro-140 de 115 a 112; needle-in-a-haystack 5/5 conservado.

## Requisitos de hardware

- VRAM: 24 GB de GPU (configuración medida en RTX 3090), más aproximadamente 64 GB de memoria de sistema; 37,4 GB de expertos fijados en RAM en la prueba.
- GPU recomendadas: RTX 3090 (validada por el autor); otras GPU NVIDIA con 24 GB o más son compatibles en principio, pero no se han publicado medidas.
- Cabe en GPU de consumo: sí, en RTX 3090 y previsiblemente en RTX 4090 (24 GB), aunque no hay datos publicados para esta última.
- Despliegue: exclusivamente tqLLM sobre CUDA, con soporte FNT (PR #89) y FNT v2 (PR #115); la ablación en tiempo de ejecución requiere una rama específica (PR #114). No es compatible con llama.cpp, Ollama ni LM Studio.
- Latencia y throughput: 134,9-157,8 tok/s en decodificación mixta y 102,4-112,1 tok/s tras prompts largos; 52,1 s para procesar 120K tokens de prompt.
- Almacenamiento: 40,9 GB para el shard 1, más el shard 2 externo, el drafter MTP, el tokenizador y la tabla n-gram.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD (expertos) | Licencia | Compatibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FNT2 (este) | 125B (MoE) | 131 072 | FNT v2, 2,48 bits/peso | 0,1372 | Qwen Community 1.0 | Solo tqLLM (CUDA) |
| ISTA-DASLab GSQ-RCO IQ3_XXS | 125B (MoE) | no disponible | IQ3_XXS | 0,1981 | Qwen Community 1.0 | GGUF estándar (llama.cpp y otros) |
| FNT v1 (mismo tamano) | 125B (MoE) | no disponible | FNT v1 | 0,1451 | Qwen Community 1.0 | Solo tqLLM (CUDA) |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros solo se cargan en tqLLM sobre CUDA con las versiones que incluyan los PR #89 y #115; no funcionan en llama.cpp, Ollama ni LM Studio.
- La ablación de rechazos elimina las negativas del modelo ante prompts dañinos (de 100 a 5 rechazos en la prueba del autor). Su uso conlleva responsabilidad plena sobre el contenido generado y requiere una rama no integrada en upstream.
- La cuantización a 2,48 bits introduce degradación medible: KLD de 0,1372 y PPL de 2,087 frente a 1,994 de la referencia Q8_0.
- No hay información publicada sobre sesgos, idiomas soportados ni tasas de alucinación específicas de esta cuantización.
- La licencia Qwen Community License 1.0 impone condiciones para uso comercial; debe conservarse el fichero LICENSE con cualquier copia.
- El repositorio solo contiene el shard 1; la ejecución requiere descargar el shard 2, el drafter MTP, el tokenizador y la tabla n-gram de repositorios de terceros, con los riesgos de integridad que ello implica (verificar los sha256 indicados).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- El rendimiento medido corresponde a una configuración concreta (RTX 3090, 59 GiB de RAM, `TQLLM_PACK_RAM_FRAC=0.8`); en hardware distinto los resultados pueden variar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rocicleito/Qwen3.8-Flash-Next-FNT2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- GGUF de referencia de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio del drafter MTP y tokenizador: https://huggingface.co/YTan2000/Qwen3.8-Flash-Next-tqLLM
- tqLLM: https://github.com/turbo-tan/tqllm
- PR de soporte FNT: https://github.com/turbo-tan/tqllm/pull/89
- PR de soporte FNT v2: https://github.com/turbo-tan/tqllm/pull/115
- PR de ablación en tiempo de ejecución: https://github.com/turbo-tan/tqllm/pull/114
- Paper QTIP (referencia del códec trellis): https://arxiv.org/abs/2406.11235
