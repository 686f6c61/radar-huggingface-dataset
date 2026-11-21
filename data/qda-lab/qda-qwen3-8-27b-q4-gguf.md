# qda-lab/QDA-Qwen3.8-27B-Q4-GGUF

## Resumen

QDA-Qwen3.8-27B-Q4-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por qda-lab para su uso con llama.cpp. El archivo principal (`QDA-Qwen3.8-27B-Q4.gguf`, 17,6 GB) emplea una mezcla heterogénea de tipos de 3 a 8 bits por tensor, seleccionada mediante una búsqueda automatizada de la herramienta QDA 0.1.0, en lugar de un esquema uniforme de cuantización. El modelo base cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) y está orientado a generación de texto conversacional con modo de razonamiento.

La relevancia de esta ficha radica en que demuestra que una cuantización mixta optimizada por tensor puede igualar o superar ligeramente a la cuantización de referencia de la comunidad (unsloth UD-Q4_K_XL) en benchmarks de razonamiento y código, con diferencias dentro del ruido de ejecución. Además, el archivo conserva la cabeza de predicción multi-token (MTP) del modelo original, lo que permite activar decodificación especulativa en llama.cpp mediante `--spec-type draft-mtp`.

La licencia es Apache 2.0, lo que facilita su uso comercial. No obstante, la información pública disponible no detalla la longitud de contexto, los idiomas soportados ni la arquitectura interna del modelo base más allá de lo que se infiere de la model card de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; transformer, detalles no especificados) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: 39 % Q5_K, 30 % Q4_K, 12 % Q6_K, 12 % IQ4_XS, 5 % Q3_K (embedding de tokens), 2 % Q8_0 (normas y tensores pequeños en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único archivo `QDA-Qwen3.8-27B-Q4.gguf`, 17,6 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, del que no se detallan en la información disponible la arquitectura interna ni los datos de entrenamiento. La model card de esta cuantización se centra en el proceso de cuantización y evaluación, no en el preentrenamiento del modelo original. Se sabe que el modelo soporta modo de razonamiento (thinking mode), con cierre en `</think>`, y que incorpora una cabeza de predicción multi-token (MTP) que se conserva en el archivo GGUF.

El proceso de cuantización es la innovación técnica destacable. QDA 0.1.0 realizó una búsqueda automatizada de la mezcla de tipos por tensor. En las 64 capas del transformer, 126 tensores Q4_K se generaron mediante redondeo al más cercano sobre la rejilla Q4_K de llama.cpp, ajustando las escalas de cada grupo con el ajuste ponderado por importancia de llama.cpp y ponderando por la diagonal de la Hessiana medida sobre los datos de calibración. El resto de tensores cuantizados se generaron desde el modelo bf16 con el cuantizador propio de llama.cpp, ponderados por una matriz de importancia medida sobre las mismas conversaciones de calibración. Los tensores Q8_0, el embedding de tokens y el bloque MTP se cuantizaron sin matriz de importancia.

La calibración usó las 2.048 filas del dataset público `qda-lab/qda-calibration-pools` (config `chat`), conversaciones multiturno de HuggingFaceH4/ultrachat_200k. Se construyeron 597 muestras de 4.096 tokens con semilla 0, y la matriz de importancia se midió con `llama-imatrix` sobre las mismas 2.048 conversaciones en texto plano (128 fragmentos de 4.096 tokens, incluyendo la cabeza de salida). La reconstrucción completa tardó 1.381 segundos en una H100 de 80 GB.

## Capacidades

- Generación de texto conversacional multiturno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento en modo thinking: la evaluación se realizó con thinking activado y `reasoning_effort: medium`, con cierre en `</think>`.
- Razonamiento matemático de competición: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento científico y de conocimiento experto: evaluado en GPQA-Diamond.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y multidisciplinar: evaluado en MMLU-Pro.
- Generación de código: evaluado en LiveCodeBench.
- Decodificación especulativa mediante la cabeza MTP incluida en el archivo, activable con `--spec-type draft-mtp` en llama-server.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene 89,6 en AIME 2025 y 75,8 en HMMT Feb 2026 en modo thinking, por lo que es adecuado para resolver problemas de competición y verificar demostraciones paso a paso en entornos de investigación o educación avanzada.
- Generación y revisión de código en pipelines de CI/CD: con 83,0 en LiveCodeBench, puede integrarse en flujos de revisión automática de parches, generación de tests o explicación de errores, ejecutándose localmente con llama.cpp sin depender de APIs externas.
- Asistente de razonamiento científico: sus 83,2 en GPQA-Diamond lo hacen útil para responder preguntas de nivel posgrado en física, química y biología, por ejemplo en herramientas de apoyo a investigadores que necesitan contrastar hipótesis.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar 17,6 GB en GGUF, cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) y permite inferencia local de un modelo de 27 B sin infraestructura de servidor.
- Servicio de chat con decodificación especulativa: al conservar la cabeza MTP, se puede activar `--spec-type draft-mtp` en llama-server para reducir la latencia en despliegues conversacionales de alta concurrencia.
- Evaluación comparativa de cuantizaciones: el paquete de receta y datos de calibración públicos permite reproducir la cuantización y comparar mezclas de tipos por tensor en entornos de investigación sobre compresión de modelos.
- Procesamiento por lotes sin conexión: al ejecutarse en llama.cpp estándar y con licencia Apache 2.0, es apto para tareas batch de generación de texto en infraestructura propia, como resumen o extracción de información sobre conversaciones largas (siempre que el contexto lo permita; la longitud no está documentada).

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo thinking, pass@1 promediado sobre 1 a 8 semillas, ejecutados en llama.cpp con el mismo muestreo, límites de tokens y semillas para ambos archivos:

| Benchmark | QDA-Qwen3.8-27B-Q4 | unsloth UD-Q4_K_XL |
|---|---|---|
| AIME 2025 | 89,6 | 87,9 |
| HMMT Feb 2026 | 75,8 | 75,4 |
| GPQA-Diamond | 83,2 | 82,1 |
| IFBench | 68,7 | 69,8 |
| MMLU-Pro | 83,1 | 83,2 |
| LiveCodeBench | 83,0 | 82,6 |
| Media | 80,6 | 80,2 |

Configuración de evaluación:

| Parámetro | AIME 2025 | HMMT Feb 2026 | GPQA-Diamond | IFBench | MMLU-Pro | LiveCodeBench |
|---|---|---|---|---|---|---|
| Tokens nuevos máximos por ítem | 81.920 | 81.920 | 32.768 | 32.768 | 32.768 | 81.920 |
| Repeticiones | 8 (semillas 17-24) | 8 (semillas 17-24) | 4 (semillas 17-20) | 4 (semillas 17-20) | 1 (semilla 17) | 1 (semilla 17) |
| Muestreo | temperature 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 0, repetition penalty 1.0 (común a todos) | | | | | |
| Thinking | Activado; el razonamiento termina en `</think>` (común a todos) | | | | | |
| chat_template_kwargs | `{"reasoning_effort": "medium"}` (común a todos) | | | | | |
| MTP / decodificación especulativa | Desactivado (común a todos) | | | | | |

El autor indica que las diferencias frente a la cuantización de referencia están dentro del ruido de ejecución en todos los benchmarks. No se han publicado resultados del modelo base sin cuantizar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 17,6 GB; se necesita algo más de VRAM para el contexto KV y buffers de llama.cpp, por lo que un presupuesto práctico ronda los 20-24 GB en función de la longitud de contexto.
- GPU recomendadas: H100 de 80 GB para reconstrucción y evaluación (el rebuild tardó 1.381 s en una H100); para inferencia, GPUs con 24 GB o más.
- GPU de consumo: cabe en una RTX 4090 (24 GB) y en tarjetas de 24 GB similares; en GPUs de 16 GB no cabe el archivo completo sin descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (stock), llama-server con `llama-server -hf qda-lab/QDA-Qwen3.8-27B-Q4-GGUF`, y decodificación especulativa con `--spec-type draft-mtp`. Compatible con endpoints.
- Latencia y throughput: no disponible. La model card no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento (media de los 6 benchmarks) |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-Q4-GGUF | 27,3 B | no disponible | GGUF (mezcla Q3-Q8) | Apache 2.0 | 80,6 |
| unsloth UD-Q4_K_XL (mismo base) | 27,3 B | no disponible | GGUF (Q4_K_XL) | Apache 2.0 (heredada) | 80,2 |
| Qwen/Qwen3.8-27B (base bf16) | 27,3 B | no disponible | safetensors | Apache 2.0 | no disponible en la información proporcionada |

La comparativa se limita a las dos cuantizaciones del mismo modelo base evaluadas en la model card; no se dispone de datos de otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La etiqueta `general.file_type` del archivo indica 15 (Q4_K_M), pero la mezcla real es heterogénea; el autor la mantiene para que el archivo sea idéntico al evaluado. Herramientas que lean esa etiqueta pueden mostrar información imprecisa sobre el tipo de cuantización.
- La cuantización introduce pérdida de precisión respecto al modelo bf16; aunque las diferencias medidas están dentro del ruido, no se garantiza un comportamiento idéntico al modelo original en dominios no evaluados.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, idiomas soportados ni longitud de contexto; estos datos deben consultarse en la model card del modelo base.
- La licencia del archivo es Apache 2.0, pero los datos de calibración tienen su propia licencia: las filas `chat` provienen de ultrachat_200k (MIT) y `qda-calibration-pools` en su conjunto es CC BY-NC-SA 4.0, lo que puede afectar a la redistribución del dataset de calibración, no al modelo.
- El modelo está pensado para ejecutarse en llama.cpp estándar; otros runtimes pueden no soportar la mezcla de tipos por tensor o la cabeza MTP.
- La evaluación se realizó con una configuración concreta (thinking activado, `reasoning_effort: medium`, MTP desactivado); los resultados pueden variar con otros ajustes de muestreo o sin modo thinking.
- No hay datos publicados de latencia, throughput ni comportamiento en producción con alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-Q4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Receta e inputs de reconstrucción: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.8-27B-Q4-GGUF
- Repositorio QDA: https://github.com/humanfia/qda
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arXiv:2611.23388): https://arxiv.org/abs/2611.23388
