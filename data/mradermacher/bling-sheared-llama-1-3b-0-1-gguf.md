# mradermacher/bling-sheared-llama-1.3b-0.1-GGUF

## Resumen

Este repositorio contiene únicamente cuantizaciones en formato GGUF del modelo `llmware/bling-sheared-llama-1.3b-0.1`, publicadas por el usuario mradermacher (cuantizador independiente conocido por generar versiones GGUF de modelos abiertos). No se trata de un modelo nuevo ni de un ajuste fino: los pesos, la licencia y el comportamiento subyacente corresponden al modelo original de llmware, mientras que este repositorio aporta los ficheros listos para motores de inferencia basados en GGUF (llama.cpp, Ollama, LM Studio, entre otros).

El modelo cuenta con 1.345.423.360 parámetros totales (dato real de los safetensors del modelo base), licencia Apache 2.0 y está etiquetado exclusivamente para inglés. El nombre del modelo base sugiere que deriva de la familia Sheared-LLaMA (una variante podada de LLaMA), aunque la información disponible no confirma la arquitectura exacta ni los detalles de entrenamiento.

Su relevancia práctica es acotada pero clara: al ser un modelo de ~1,3 mil millones de parámetros con cuantizaciones que van de 0,7 GB a 2,8 GB, se puede ejecutar en CPU y en GPUs de gama baja o integradas, lo que lo hace útil para prototipos, pipelines de generación de texto en local y entornos con restricciones fuertes de memoria. Conviene tener en cuenta que el repositorio solo documenta el proceso de cuantización, no las capacidades reales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la información proporcionada no describe la arquitectura; el nombre del modelo base apunta a una variante Sheared-LLaMA, sin confirmar) |
| Parametros totales | 1.345.423.360 |
| Parametros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 12,3 GB (suma de los 12 ficheros de cuantización) |
| Descargas / likes | 181 / 0 |
| Fecha de creacion | 2024-11-02 |
| Ultima actualizacion | 2026-10-24 |

Tamaños por fichero publicados por el autor:

| Fichero | Tipo | Tamano (GB) | Nota del autor |
|---|---|---|---|
| Q2_K | 2 bits | 0,7 | |
| Q3_K_S | 3 bits | 0,7 | |
| Q3_K_M | 3 bits | 0,8 | calidad inferior |
| Q3_K_L | 3 bits | 0,8 | |
| IQ4_XS | 4 bits (i-quant) | 0,8 | |
| Q4_K_S | 4 bits | 0,9 | rápido, recomendado |
| Q4_K_M | 4 bits | 1,0 | rápido, recomendado |
| Q5_K_S | 5 bits | 1,1 | |
| Q5_K_M | 5 bits | 1,1 | |
| Q6_K | 6 bits | 1,3 | muy buena calidad |
| Q8_0 | 8 bits | 1,5 | rápido, mejor calidad |
| f16 | 16 bits | 2,8 | 16 bpw, excesivo |

## Arquitectura y entrenamiento

No se han publicado en la informacion disponible datos sobre la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, tipo de positional encoding), el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de alineación como RLHF o DPO. La model card del repositorio es la plantilla estándar de mradermacher para cuantizaciones y no incluye información del modelo original.

El único dato técnico verificable es el número de parámetros del modelo base (1.345.423.360) y el pipeline de cuantización aplicado. El autor indica que se trata de cuantizaciones estáticas (`quantized_by: mradermacher`, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), que en el momento de la publicación no había cuantizaciones ponderadas o con imatrix disponibles, y que estas podrían no llegar a publicarse. Para conocer la arquitectura y el entrenamiento reales es necesario consultar la model card de `llmware/bling-sheared-llama-1.3b-0.1`, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, propia de un modelo causal de ~1,3B parámetros.
- No hay información publicada sobre soporte de tool calling o function calling.
- No hay información publicada sobre capacidades de agente o razonamiento multi-paso.
- No hay información publicada sobre modo "thinking", visión, audio ni otras modalidades; las tags del repositorio solo incluyen `transformers` y `gguf`.
- Multilingüe: no; el modelo está etiquetado únicamente como `en`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato es apto para despliegues tipo Hugging Face Inference Endpoints con motores compatibles con GGUF, aunque no se detalla la integración.
- Ejecución ligera: las cuantizaciones de 0,7-1,5 GB permiten inferencia en CPU y en dispositivos con poca VRAM.

## Casos de uso

- Generación de texto en local para prototipos: con la cuantización Q4_K_M (1,0 GB) el modelo se puede cargar en un portátil sin GPU dedicada mediante llama.cpp u Ollama, lo que permite validar prompts e interfaces antes de migrar a un modelo mayor.
- Clasificación y etiquetado de texto en inglés por lotes: al ser un modelo pequeño, se pueden procesar miles de documentos cortos por hora en CPU, por ejemplo para categorizar tickets o correos en un pipeline interno.
- Extracción de campos simple sobre textos cortos: reformulando la tarea como generación (prompt con el texto y la lista de campos), encaja en flujos de preprocesamiento donde no se justifica el coste de un modelo grande.
- Autocompletado y generación de borradores en editores o herramientas internas: la latencia baja en GPU consumer (ficheros de 1 GB) permite respuestas interactivas en entornos de escritorio.
- Filtrado y generación de resúmenes breves en aplicaciones edge: al caber en 2-3 GB de VRAM o ejecutarse en CPU, se puede desplegar en dispositivos con recursos limitados o en contenedores sin GPU.
- Entorno de pruebas para cuantización y evaluación: útil como banco de pruebas para comparar la degradación de perplejidad entre Q2_K, Q4_K_M y Q8_0 en tareas concretas antes de aplicar la misma receta a modelos mayores.
- Base para ajuste fino ligero en inglés (sujeto a los términos de Apache 2.0): su tamaño permite iterar con LoRA en una única GPU consumer, aunque no hay información publicada sobre recetas de fine-tuning del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos incluyen valores de MMLU, HumanEval, GSM8K, HellaSwag ni de perplejidad comparativa entre cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más un margen para el contexto y el estado de la KV cache. Con Q4_K_M (1,0 GB) se puede inferir en ~2 GB de VRAM; con Q8_0 (1,5 GB), en ~2,5-3 GB; con f16 (2,8 GB), en ~4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090); también funciona en GPUs de centro de datos (A100, H100) aunque estaría enormemente infrautilizado.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas de los últimos años, y también en iGPU con memoria compartida si se usa Q2_K o Q4_K_S.
- CPU: es viable con llama.cpp; los ficheros de 0,7-1,5 GB permiten decodificación interactiva en procesadores modernos de escritorio, aunque la velocidad depende del número de núcleos.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y LM Studio (importando el GGUF), y servidores compatibles con llama.cpp. vLLM y TGI no son la vía natural para GGUF en este caso; el modelo base en safetensors sería la opción para esos motores.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Como referencia dimensional, un modelo denso de 1,3B en Q4 típicamente decodifica muy por encima de las decenas de tokens por segundo en GPU consumer, pero se trata de una estimación general, no de un dato medido para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bling-sheared-llama-1.3b-0.1 (este, via GGUF de mradermacher) | 1.345.423.360 | no disponible | Apache 2.0 | GGUF en HF; base en safetensors | Solo inglés; sin benchmarks publicados en la información disponible |
| TinyLlama-1.1B (variantes chat/base) | ~1,1B | 2.048 tokens (versión original) | Apache 2.0 | Pesos originales y múltiples GGUF de terceros | Entrenado con ~3 billones de tokens según su documentación pública; comunidad amplia |
| Llama 3.2 1B Instruct | ~1,24B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos oficiales y GGUF derivados | Multilingüe declarado y contexto muy superior; licencia con condiciones de uso |
| Qwen2.5 1.5B Instruct | ~1,54B | 32.768 tokens | Apache 2.0 | Pesos oficiales y GGUF derivados | Multilingüe, con soporte declarado de tool calling y contextos largos |

Los datos de los modelos comparados provienen de su documentación pública; no se dispone de comparaciones de rendimiento verificadas contra este modelo, ya que no hay benchmarks publicados en la información proporcionada. En la práctica, las alternativas citadas ofrecen contextos documentados y soporte multilingüe, mientras que este modelo solo declara inglés y no documenta su ventana de contexto.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado exclusivamente para inglés; el rendimiento en castellano no está documentado y previsiblemente será pobre.
- Contexto: se desconoce la longitud máxima de contexto; asumir ventanas largas sin verificación puede provocar degradación silenciosa o errores del motor.
- Sesgos: no hay información publicada sobre evaluación de sesgos, toxicidad o robustez; un modelo de este tamaño y sin documentación de alineación es propenso a reproducir sesgos del corpus de entrenamiento.
- Alucinación: no se han publicado evaluaciones de fidelidad; en tareas de respuesta factual o RAG conviene validar las salidas con fuentes externas.
- Ausencia de benchmarks: no se puede afirmar nada riguroso sobre su calidad frente a alternativas; cualquier comparación sería especulativa.
- Licencia: Apache 2.0 permite uso comercial y modificaciones con atribución, pero conviene revisar la licencia del modelo base (`llmware/bling-sheared-llama-1.3b-0.1`) por si añade condiciones adicionales, ya que este repositorio solo replica la etiqueta declarada.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S reducen el tamaño a 0,7 GB a costa de una pérdida de calidad notable; el propio autor marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior.
- Faltan cuantizaciones imatrix/ponderadas: el autor indica que no están disponibles y que podrían no publicarse, por lo que no se debe contar con ellas.
- Repositorio de terceros: es una cuantización no oficial; los ficheros no están validados por llmware y el mantenimiento futuro no está garantizado.
- Fecha de actualización: el repositorio consta como actualizado en 2026-10-24, posterior a la creación (2024-11-02); conviene verificar que los ficheros no hayan cambiado respecto a los hashes que se hayan fijado en un pipeline.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/bling-sheared-llama-1.3b-0.1-GGUF
- Modelo base: https://huggingface.co/llmware/bling-sheared-llama-1.3b-0.1
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#bling-sheared-llama-1.3b-0.1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
