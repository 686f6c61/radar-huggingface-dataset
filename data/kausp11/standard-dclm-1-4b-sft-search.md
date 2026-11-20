# Kausp11/standard-dclm-1.4b-sft-search

## Resumen

`Kausp11/standard-dclm-1.4b-sft-search` es un modelo de lenguaje de tipo decoder-only, de 1.409,6M de parámetros reportados (2.619,1M almacenados, incluyendo *value embeddings*), desarrollado por el usuario Kausp11. Se trata del *baseline* en texto plano del proyecto QueryLM: parte del modelo `Kausp11/standard-dclm-1.4b`, preentrenado sobre DCLM-Edu, y se ha sometido a un ajuste fino supervisado de una época sobre el mismo conjunto de conversaciones que su modelo gemelo `Kausp11/querylm-dclm-1.4b-sft-search`. Su propósito es servir de comparación controlada para medir el efecto de preentrenar con bloques de búsqueda web frente a introducirlos únicamente en la fase de *fine-tuning*.

La arquitectura sigue el estilo nanochat: 24 capas, anchura 2.048, 16 cabezas de atención con dimensión de cabeza 128, *feed-forward* de 8.192 y una ventana de contexto de 4.095 tokens. El vocabulario es el del tokenizador de SmolLM2 ampliado con cuatro tokens especiales para el protocolo de búsqueda (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`), hasta 49.156 entradas.

Su relevancia es fundamentalmente metodológica: permite aislar el impacto del preentrenamiento con bloques de recuperación, ya que comparte arquitectura, presupuesto de cómputo, datos de ajuste fino e hiperparámetros con el modelo QueryLM. No obstante, el modelo es muy reciente (noviembre de 2026), no tiene descargas ni valoraciones, y su evaluación está pendiente de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (24 capas, width 2.048, 16 cabezas, head dim 128, FFN 8.192) |
| Parametros totales | 1.409,6M reportados; 2.619,1M almacenados (incluye *value embeddings*) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards), requiere `trust_remote_code=True` con `modeling_nanochat.py` incluido en el repo |
| Tokenizador | SmolLM2 + 4 tokens de búsqueda (vocabulario 49.156) |
| Modelo base | `Kausp11/standard-dclm-1.4b` |
| Modelo gemelo | `Kausp11/querylm-dclm-1.4b-sft-search` |
| Dataset de preentrenamiento | HuggingFaceTB/dclm-edu |
| Dataset de ajuste fino | `Kausp11/querylm-search-sft-data` (~53.000 conversaciones) |
| Tamano del repo | 5,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuración nanochat descrita arriba. El preentrenamiento se realizó sobre DCLM-Edu en texto plano, sin bloques de búsqueda ni anotaciones, con más texto de documento que el modelo QueryLM emparejado para igualar el cómputo total. Se usó el optimizador Muon para los pesos matriciales (LR pico 0,02828) y AdamW para *embeddings* y cabeza de salida. El lote fue de 256 secuencias × 4.095 tokens = 1.048.320 tokens por actualización, con 40 pasos de *warmup*, programación constante y decaimiento lineal hasta el 5% del pico. El presupuesto total fue de 41.936 actualizaciones, 44,0B de tokens y 4,51e20 FLOPs en bf16, idéntico al del modelo QueryLM.

El ajuste fino reanuda desde el checkpoint de preentrenamiento conservando el estado del optimizador: 33 actualizaciones de 256 secuencias (una época) sobre unas 53.000 conversaciones usuario-asistente, de las cuales el 21% incluyen bloques de búsqueda al inicio de una frase en los turnos del asistente. Los *learning rates* son 0,8× los picos del preentrenamiento, constantes durante la primera mitad y con decaimiento lineal a cero después. La innovación metodológica clave es el protocolo de búsqueda: el modelo emite una consulta entre `<WEB_QUERY>…</WEB_QUERY>`, el llamante ejecuta su propio *retriever* e inserta el pasaje en `<WEB_RESPONSE>…</WEB_RESPONSE>`, y el modelo continúa la respuesta. El modelo base nunca vio este formato durante el preentrenamiento; lo encuentra por primera vez en este ajuste fino, lo que constituye precisamente la variable experimental del estudio.

## Capacidades

- Generación de texto en inglés con formato de chat en texto plano (`System:`, `User:`, `Assistant:`, turnos separados por línea en blanco). No hay plantilla de chat; `apply_chat_template` no aplica.
- Emisión de consultas de búsqueda estructuradas mediante los tokens `<WEB_QUERY>` y `</WEB_QUERY>`, con consumo del pasaje devuelto por un *retriever* externo en `<WEB_RESPONSE>`.
- Generación condicionada por recuperación (*retrieval-augmented generation*) en un solo paso, sin orquestación multi-turno del propio modelo.
- Razonamiento básico y respuesta a preguntas factuales simples (el ejemplo de la *model card* responde correctamente a la capital de Australia, aunque con un pasaje fijo inyectado).
- No se documenta soporte de *tool calling* genérico, agentes multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe: solo inglés declarado.
- Control de la búsqueda: se puede desactivar la emisión de consultas con `bad_words_ids` sobre el token `<WEB_QUERY>`.

## Casos de uso

- **Comparación experimental de preentrenamiento con recuperación**: usar este modelo y su gemelo QueryLM con idénticos *prompts*, *retriever* y presupuesto de cómputo para medir cuánto aporta preentrenar con bloques de búsqueda frente a introducirlos solo en el *fine-tuning*. Es su propósito declarado y su uso más sólido.
- **Prototipado de pipelines RAG de bajo coste**: integrar el modelo en un flujo donde el llamante controla el *retriever* (BM25, API de búsqueda web) y el modelo solo formula la consulta y redacta la respuesta; el contexto de 4.095 tokens permite incorporar un pasaje corto más el historial reciente.
- **Investigación sobre formulación de consultas**: analizar la calidad de las consultas generadas (`Australia capital city located in`) frente a las de modelos entrenados con búsqueda desde el preentrenamiento, con el mismo conjunto de datos de ajuste.
- **Generación de respuestas ancladas a un pasaje**: en entornos donde se inyecta un único documento corto y se requiere una respuesta extractiva o parafraseada, el formato `<WEB_RESPONSE>` fuerza el anclaje al texto proporcionado.
- **Evaluación de *baselines* en artículos y tesis**: al estar publicado con *hashes* SHA-256 de los dos *shards* y procedencia de ejecución documentada (`sftnc_v4cannsent_baseline_d24_cm44`, actualización 33 de 33), sirve como referencia reproducible en estudios de RAG a pequeña escala.
- **Despliegue en CPU para pruebas de mecánica**: la propia *model card* demuestra la ejecución en CPU con bfloat16 y `transformers` 4.56.0; útil para validar el protocolo de tokens antes de escalar a GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* indica explícitamente que los resultados de evaluación se añadirán más adelante.

## Requisitos de hardware

- **VRAM estimada en bf16**: los 2.619,1M parámetros almacenados implican aproximadamente 5,2 GB de pesos; con caché KV y *overhead* de activaciones, se recomienda un mínimo de 8 GB de VRAM para contexto completo (4.095 tokens).
- **GPU recomendadas**: cualquier GPU con 8 GB o más en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). En GPUs sin bf16 nativo habría que recurrir a fp16 o fp32 (este último, ~10,5 GB).
- **GPU de consumo**: sí cabe en GPUs de consumo con 8-12 GB o más; también se ha ejecutado en CPU con bfloat16 según la *model card*.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de código personalizado (`modeling_nanochat.py`) hace probable que estos *runtimes* no lo soporten sin adaptación.
- **Latencia y throughput**: no disponible. La *model card* solo reporta la ejecución del script de ejemplo en CPU, sin cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Preentrenamiento con búsqueda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Kausp11/standard-dclm-1.4b-sft-search` (este) | 1.409,6M reportados / 2.619,1M almacenados | 4.095 | No (solo en SFT) | Apache 2.0 | HF, 0 descargas |
| `Kausp11/querylm-dclm-1.4b-sft-search` | Misma arquitectura y cómputo | 4.095 | Sí (bloques de búsqueda) | Apache 2.0 | HF |
| `Kausp11/standard-dclm-1.4b` (base) | Misma arquitectura | 4.095 | No | Apache 2.0 | HF |
| SmolLM2-1.7B (referencia de tokenizador) | 1.700M | 8.192 (según versión) | No | Apache 2.0 | HF |

La comparación más relevante es con su gemelo QueryLM, que comparte arquitectura, datos de ajuste fino, hiperparámetros y FLOPs (4,51e20), diferenciándose únicamente en si el preentrenamiento incluyó bloques de búsqueda. Frente a SmolLM2-1.7B, este modelo usa su tokenizador pero con una ventana de contexto notablemente menor (4.095 frente a 8.192 tokens) y un vocabulario ampliado con tokens de búsqueda. No se dispone de datos de rendimiento comparado para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- **Evaluación inexistente**: no hay benchmarks publicados; no debe asumirse ninguna capacidad de razonamiento, código o matemáticas más allá de lo que sugiere el ajuste fino sobre conversaciones.
- **Contexto muy corto**: 4.095 tokens limitan el historial de conversación y el tamaño del pasaje recuperado; no es adecuado para documentos largos ni diálogos extensos.
- **Solo inglés**: no se declara soporte de otros idiomas, incluido el castellano.
- **Riesgo de alucinación**: al ser un modelo de 1,4B ajustado con una sola época sobre ~53.000 conversaciones, la fidelidad factual depende críticamente del pasaje inyectado; el modelo puede responder sin consultar si se desactiva la búsqueda o si el *retriever* devuelve pasajes irrelevantes.
- **Dependencia de código remoto**: requiere `trust_remote_code=True` para cargar `modeling_nanochat.py`; conviene fijar `revision=` a un commit auditado, como advierte la propia *model card*.
- **Sin plantilla de chat**: el formato es texto plano con prefijos `System:`, `User:`, `Assistant:`; el uso de `apply_chat_template` fallará o producirá resultados incorrectos.
- **Licencia Apache 2.0**: permite uso comercial, pero al derivar de DCLM-Edu conviene revisar las condiciones del dataset original y de los datos de ajuste fino `Kausp11/querylm-search-sft-data`.
- **Madurez**: 0 descargas y 0 valoraciones en el momento de la ficha; sin garantías de mantenimiento ni soporte.
- **Sesgos**: no documentados; al entrenarse sobre DCLM-Edu (texto educativo filtrado) y conversaciones sintéticas o anotadas, es esperable un sesgo hacia registros formales y conocimiento de dominio inglés, sin que se hayan publicado análisis al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-dclm-1.4b-sft-search
- Modelo base: https://huggingface.co/Kausp11/standard-dclm-1.4b
- Modelo gemelo QueryLM: https://huggingface.co/Kausp11/querylm-dclm-1.4b-sft-search
- Dataset de ajuste fino: https://huggingface.co/datasets/Kausp11/querylm-search-sft-data
- Dataset de preentrenamiento DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Alias con pesos idénticos: `Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d24_cm44` (en Hugging Face)
- Código nanochat (upstream, commit `92d63d4`): no disponible como enlace en la información proporcionada
