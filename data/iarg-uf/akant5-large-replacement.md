# IARG-UF/akant5-large-replacement

## Resumen

AkanT5 large es un checkpoint de preentrenamiento continuado (CPT) desarrollado por el grupo IARG-UF sobre el modelo `google/mt5-large`. Su objetivo es adaptar un modelo multilingüe genérico al twi (akan), una lengua de Ghana con escasa representación en corpus de gran escala, mediante una estrategia de sustitución de vocabulario. El modelo forma parte de una colección de 12 artefactos que comparan tres tamaños de backbone (small, base, large) bajo dos estrategias de vocabulario (replacement y extension), con un límite de 50.000 actualizaciones de CPT.

La arquitectura subyacente es un transformer encoder-decoder mT5 con 848.686.080 parámetros, pesos almacenados en safetensors float32 y un tokenizador de sustitución de 64.100 entradas (64.128 filas de embedding). El entrenamiento utiliza span corruption sobre el corpus M1xEN, una mezcla normalizada de texto twi con replay de inglés en proporción objetivo 80/20 por caracteres retenidos. El checkpoint seleccionado corresponde a la actualización 46.000.

Es relevante porque documenta de forma reproducible una metodología de adaptación de vocabulario para lenguas de bajos recursos, e incluye artefactos de procedencia (hashes SHA-256, revisiones fijadas de datasets, declaraciones de licencia). No obstante, estos pesos son un artefacto intermedio: preceden al fine-tuning de traducción automática y requieren adaptación específica de tarea para producir traducciones utilizables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 848.686.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ak (twi: Asante y Akuapem), en |
| Licencia | akant5-research-use-only (uso exclusivamente de investigación) |
| Formato de pesos | safetensors (float32) |
| Estrategia de vocabulario | replacement (64.100 entradas, 64.128 filas de embedding) |
| Actualizacion CPT seleccionada | 46.000 |
| Dropout CPT | 0.0 |
| Version de Transformers | 5.16.1 |
| Modelo base | google/mt5-large |
| Checkpoint de inicializacion | IARG-UF/akant5-large-replacement-init |

## Arquitectura y entrenamiento

El modelo es un mT5 encoder-decoder estándar, sin modificaciones estructurales respecto al backbone original. La innovación se concentra en la capa de vocabulario: se sustituye el tokenizador original de mT5 por uno de 64.100 entradas, con 64.128 filas en las matrices de embedding de entrada y de salida. Cabe notar que mT5 comparte embeddings entre encoder y decoder, pero mantiene una cabeza de salida separada; por ello la carga correcta exige fijar `tie_word_embeddings = False` tras instanciar el modelo.

El preentrenamiento continuado emplea span corruption sobre el corpus M1xEN, compuesto por texto twi normalizado con replay de inglés, con un objetivo del 80% de caracteres twi y 20% de inglés retenidos. El estudio compara tres backbones (small, base, large) bajo dos estrategias de vocabulario (replacement y extension) con un tope de 50.000 actualizaciones; el checkpoint publicado corresponde a la actualización 46.000, que puede preceder a la actualización final. El dropout se serializa a 0.0, tal como se entrenó, aunque el protocolo principal de traducción supervisada del artículo asociado fija `dropout_rate = 0.1` antes de construir el modelo de fine-tuning; para reproducirlo hay que modificar la configuración y pasarla a `from_pretrained`, no editar un modelo ya construido.

Las fuentes de datos están fijadas por revisión e incluyen corpus paralelos inglés-twi, QA agrícola, pares ASR-IPA, transcripciones de speech, Wikipedia en twi, corpus de habla de Ghana y `allenai/c4` (en-multi). Varias fuentes son sintéticas y la mayoría de las de twi llevan licencias no comerciales (cc-by-nc-4.0); las etiquetas de fuente no garantizan autoría humana ni revisión por hablantes nativos.

## Capacidades

- Generación de texto seq2seq mediante encoder-decoder, orientada a tareas de transformación (traducción, resumen, parafraseo) tras el fine-tuning correspondiente.
- Representaciones y generación en twi (Asante y Akuapem) y en inglés, con retención de inglés entrenada explícitamente mediante replay.
- Reconstrucción de texto enmascarado (span corruption), útil para evaluar la calidad de la adaptación de vocabulario.
- Punto de partida para fine-tuning supervisado de traducción automática inglés-twi y twi-inglés.
- Tokenizador con comportamiento de byte-fallback, lo que permite representar caracteres fuera del vocabulario.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión ni audio: es un modelo seq2seq clásico sin alineamiento por instrucciones.
- No se ha sometido a RLHF ni DPO según la información disponible; no es un modelo conversacional.

## Casos de uso

- Investigación en adaptación de vocabulario: comparar la estrategia de sustitución frente a la de extensión sobre el mismo backbone mT5-large, usando los checkpoints de la colección AkanT5 y las configuraciones del repositorio de código.
- Fine-tuning de traducción automática twi-inglés: partir de este checkpoint en lugar de mT5-large crudo para reducir el coste de adaptación a la lengua, aplicando el protocolo supervisado con `dropout_rate = 0.1`.
- Evaluación de retención de inglés: medir la degradación en tareas inglesas tras el CPT, aprovechando que la mezcla reserva un 20% de caracteres en inglés precisamente para mitigar el olvido catastrófico.
- Estudio de reconstrucción con span corruption: usar el modelo para cuantificar la calidad de las representaciones twi aprendidas antes de cualquier supervisión, tal como hace el estudio asociado.
- Base para tareas downstream de bajo recursos en twi: clasificación de texto, resumen o normalización, añadiendo una cabeza específica sobre el encoder.
- Reproducibilidad y auditoría de procedencia: validar los hashes SHA-256 de los ficheros de inferencia y las revisiones fijadas de los datasets declaradas en `release_provenance.json` y `sources.json`.
- Experimentación académica sobre variedades del akan: el estudio evalúa Asante y Akuapem, y el modelo sirve como línea base para extender la cobertura a otras variedades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona puntuaciones de reconstrucción y un estudio comparativo de adaptación, pero no incluye cifras numéricas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3,4 GB solo para pesos (848,7 M de parámetros × 4 bytes), más activaciones y memoria del tokenizador; en la práctica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en float16/bfloat16: alrededor de 1,7 GB para pesos, más overhead; cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 en inferencia por lotes pequeños (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). Para fine-tuning completo en fp32 se recomienda A100 40/80 GB o H100; con precisión mixta y batch pequeño, una RTX 4090 de 24 GB puede ser suficiente.
- Cabe en GPU de consumo: sí, en fp16/bf16 y con cuantización dinámica; en fp32 también en tarjetas de 8 GB o más para inferencia.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (requiere Transformers 5.16.1 o compatible), exportación a ONNX, y cuantización vía bitsandbytes o GPTQ para reducir huella. No se documenta soporte específico de vLLM, llama.cpp ni Ollama en la información disponible; al ser un encoder-decoder mT5, la integración con esos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-large-replacement | 848,7 M | no disponible | ak, en | research-only | CPT, requiere fine-tuning de tarea |
| google/mt5-large | ~1,2 B | no disponible | 101 idiomas (mT5) | Apache 2.0 | Preentrenado multilingüe, sin especialización en twi |
| IARG-UF/akant5-large-replacement-init | 848,7 M | no disponible | ak, en | research-only | Inicialización de vocabulario, sin CPT |
| IARG-UF/akant5-base-replacement | no disponible | no disponible | ak, en | research-only | Variante de menor tamaño de la misma colección |

La comparación directa con mT5-large no es del todo equivalente: el recuento de parámetros difiere porque la sustitución de vocabulario reduce el tamaño de las matrices de embedding (64.128 filas frente a las 250.112 del tokenizador original de mT5). El modelo de inicialización permite aislar el efecto del CPT del efecto de la nueva tokenización.

## Limitaciones y advertencias

- Licencia de uso exclusivamente investigador (`akant5-research-use-only`): no está permitido el uso comercial sin autorización explícita; además, las licencias de las fuentes de datos (mayoritariamente cc-by-nc-4.0) imponen restricciones adicionales.
- El modelo no está fine-tuneado para traducción: produce salidas no utilizables como traductor sin una etapa supervisada posterior.
- Riesgo de alucinación y de generación incoherente en twi, dado que parte de los datos de entrenamiento son sintéticos y no se garantiza revisión por hablantes nativos.
- Cobertura limitada a Asante y Akuapem; el estudio no establece cobertura de todas las variedades del akan.
- Sesgos potenciales heredados de mT5-large y de `allenai/c4`, así como de los corpus de speech y QA de origen, no caracterizados en la información disponible.
- El checkpoint corresponde a la actualización 46.000 y puede preceder a la actualización final del estudio; no es necesariamente el punto de mejor rendimiento.
- La configuración serializada conserva `dropout_rate = 0.0`; usarla directamente para fine-tuning se desvía del protocolo del artículo (`0.1`), lo que puede afectar a la reproducibilidad.
- Es obligatorio cargar el tokenizador del propio repositorio para preservar los IDs de vocabulario y el byte-fallback; usar el tokenizador de mT5 original rompe la correspondencia.
- No hay soporte documentado de tool calling, agentes ni instrucciones; no debe emplearse como asistente conversacional.
- Longitud de contexto no especificada en la información disponible; conviene verificar `config` antes de desplegar con secuencias largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IARG-UF/akant5-large-replacement
- Checkpoint de inicialización de vocabulario: https://huggingface.co/IARG-UF/akant5-large-replacement-init
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base mT5-large: https://huggingface.co/google/mt5-large
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Dataset pristine-twi-english: https://huggingface.co/datasets/ghananlpcommunity/pristine-twi-english
- Dataset ghok-parallel-en-twi: https://huggingface.co/datasets/ghanaopenai/ghok-parallel-en-twi
- Dataset ghana-farmer-qa-twi: https://huggingface.co/datasets/ghanaopenai/ghana-farmer-qa-twi
- Dataset true-asr-ipa-pairs-twi: https://huggingface.co/datasets/ghananlpcommunity/true-asr-ipa-pairs-twi
- Dataset kumawood-speech-transcriptions: https://huggingface.co/datasets/ghanaopenai/kumawood-speech-transcriptions
- Dataset ghana-speech: https://huggingface.co/datasets/ghanaopenai/ghana-speech
- Dataset Wikipedia (tw): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset C4 (en-multi): https://huggingface.co/datasets/allenai/c4
