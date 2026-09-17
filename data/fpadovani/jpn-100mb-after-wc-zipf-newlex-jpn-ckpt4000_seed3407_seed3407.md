# fpadovani/jpn-100mb-after-wc-zipf-newlex-jpn-ckpt4000_seed3407_seed3407

## Resumen

El modelo `jpn-100mb-after-wc-zipf-newlex-jpn-ckpt4000_seed3407_seed3407` es un ajuste fino (SFT) de un modelo base de la familia GPT-2, desarrollado por el usuario fpadovani en el marco de un proyecto de investigación asociado a la organización de Weights & Biases `f-padovani-university-of-groningen/white_cotterell`. Con 124.770.816 parámetros (~124,8 M), se trata de un modelo pequeño de tipo decoder-only orientado exclusivamente a generación de texto, entrenado con la librería TRL sobre el checkpoint 4000 del modelo base `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407`. El nombre del checkpoint sugiere un experimento controlado sobre tokenización y distribución léxica en japonés: "jpn" (japonés), "100mb" (tamaño del corpus), "zipf" (distribución de frecuencias léxicas), "newlex" (nuevo léxico) y "seed3407" (semilla de reproducibilidad repetida en el identificador).

Su relevancia no es la de un modelo de propósito general ni de competición en benchmarks, sino la de un artefacto de investigación reproducible: el patrón de nombres y la semilla duplicada apuntan a un estudio sistemático sobre cómo la composición léxica y la tokenización afectan al comportamiento de modelos pequeños durante el preentrenamiento y el ajuste supervisado. Para desarrolladores e investigadores, es un punto de partida útil para experimentos de andamiaje de bajo coste (ajuste fino completo en una sola GPU, cuantización extrema, evaluaciones de tokenizador) más que un modelo para producción.

No se dispone de información sobre licencia efectiva, idiomas declarados ni longitud de contexto en la información proporcionada; el campo de licencia de la model card contiene únicamente el marcador de posición `licence: license`. El repositorio no registra descargas ni likes en el momento de la consulta, lo que refuerza su carácter de artefacto interno de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 124.770.816 (~124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (el identificador sugiere japones, sin confirmacion en la model card) |
| Licencia | no disponible (la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Version de TRL | 0.23.0 |
| Version de Transformers | 4.56.2 |
| Version de PyTorch | 2.11.0 |
| Version de Datasets | 4.8.4 |
| Version de Tokenizers | 0.22.1 |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con 124.770.816 parámetros, es decir, prácticamente el mismo orden de magnitud que GPT-2 small (124 M). No se especifica en la información disponible el número de capas, la dimensión del modelo, el número de cabezas de atención ni la longitud de contexto, aunque en la familia GPT-2 el valor habitual es de 1024 tokens; al no estar confirmado en la model card, se deja como no disponible. El modelo se distribuye únicamente en safetensors y se carga mediante `transformers` con el pipeline `text-generation`, lo que permite usarlo con el chat template aplicado en la llamada de ejemplo del README.

El entrenamiento consistió en un ajuste supervisado (SFT) con TRL 0.23.0 sobre el checkpoint 4000 del modelo base `fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407`. No se indica el número de tokens de entrenamiento, la composición del dataset de SFT, ni si se aplicaron etapas posteriores de RLHF o DPO; tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mezclas de expertos. La información disponible apunta a un pipeline de investigación centrado en el efecto del vocabulario y la distribución Zipf de frecuencias léxicas ("zipf-newlex") sobre un corpus de 100 MB, con semilla fija (3407) para reproducibilidad. Todos los detalles cuantitativos del dataset y de la receta de ajuste se consideran no disponibles.

## Capacidades

- Generación de texto autoregresiva en el formato de prompt de instrucciones empleado en el ejemplo del README (mensajes con rol `user`).
- Ajuste por instrucciones (SFT) sobre el modelo base, orientado a respuestas de chat de formato conversacional.
- Ejecución en el pipeline `text-generation` de transformers, con soporte de `max_new_tokens` y `return_full_text`.
- Compatibilidad declarada con text-generation-inference y con endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Capacidades multilingües: no disponibles; el identificador sugiere entrenamiento sobre datos en japonés, sin confirmación documental.
- Tool calling / function calling: no disponible, no documentado.
- Capacidades de agente o razonamiento multi-paso: no disponibles, no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles, no documentadas.

## Casos de uso

- Investigación sobre tokenización y léxico: el modelo forma parte de una serie de experimentos ("zipf-newlex", "100mb", distintos checkpoints) que permiten comparar cómo distintas distribuciones de vocabulario afectan a la pérdida y a la generación en un modelo pequeño de 124,8 M de parámetros.
- Reproducción de experimentos académicos: la semilla fija y la duplicación de `seed3407` en el identificador facilitan repetir exactamente el ajuste y comparar resultados entre checkpoints del mismo proyecto.
- Ajuste fino completo en una sola GPU de consumo: con ~124,8 M de parámetros, el entrenamiento completo en fp16 o bf16 cabe en GPUs de 8-16 GB, lo que lo convierte en banco de pruebas para recetas de SFT con TRL.
- Pruebas de cuantización extrema: al ser un modelo pequeño, es adecuado para evaluar el impacto de cuantizaciones a 8 y 4 bits sobre la perplejidad y la coherencia en un escenario controlado.
- Generación de texto en japonés (si se confirma el dominio del modelo base): podría emplearse en prototipos de autocompletado o generación corta en ese idioma, siempre que se valide la calidad real antes de cualquier uso productivo.
- Validación de infraestructura de despliegue: sirve para verificar pipelines de vLLM, TGI o endpoints antes de escalar a modelos mayores, dado su reducido coste de carga y su formato safetensors estándar.
- Docencia y formación: caso práctico para explicar el flujo completo de SFT con TRL, desde el modelo base hasta el checkpoint publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16 y del orden de 0,13 GB en int8 para los pesos; el repositorio ocupa 1,7 GB, probablemente por incluir varios artefactos de checkpoint además de los pesos finales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para ajuste fino completo se recomienda una GPU con 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU para inferencia con llama.cpp si se convierte a GGUF (no se publican pesos GGUF en el repositorio).
- Opciones de despliegue: transformers (nativo, según la model card), text-generation-inference (etiqueta declarada), endpoints compatibles, y potencialmente vLLM o llama.cpp previa conversión de formato, no confirmados por el autor.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.
- Dado que no se declara la longitud de contexto, conviene fijar `max_new_tokens` de forma conservadora (el ejemplo del README usa 128) y validar el comportamiento en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jpn-100mb-after-wc-zipf-newlex-jpn-ckpt4000_seed3407_seed3407 | 124,8 M | no disponible | no disponible | HuggingFace (0 descargas) | SFT con TRL sobre base GPT-2 de investigación, orientado a estudio de tokenizacion/lexico |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (segun publicacion original) | Ampliamente disponible | Referencia de la misma arquitectura y tamano; modelo generalista con tokenizador BPE en ingles |
| Pythia-160M (EleutherAI) | 160 M | 2048 tokens | Apache 2.0 | Ampliamente disponible | Suite de investigacion con checkpoints intermedios y semillas multiples, comparable en proposito |
| SmolLM-135M (HuggingFace) | 135 M | 2048 tokens | Apache 2.0 | Ampliamente disponible | Modelo pequeno moderno entrenado con corpus multimodal de gran volumen, mejor rendimiento general esperado |

La comparacion directa de rendimiento no es posible porque el modelo analizado no publica resultados de benchmarks. En terminos de ecosistema, la diferencia principal frente a GPT-2 small, Pythia-160M o SmolLM-135M es la ausencia de licencia declarada y de documentacion de datos, lo que limita su uso fuera del ambito de investigacion.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene únicamente el marcador `licence: license`, por lo que no se puede asumir permiso para uso comercial ni redistribución.
- Sesgos conocidos: no disponibles, pero al derivar de un modelo base entrenado sobre un corpus de 100 MB (presumiblemente en japonés), hereda los sesgos y las lagunas de ese corpus reducido.
- Riesgo de alucinación: elevado en un modelo de 124,8 M de parámetros; no debe usarse como fuente factual sin verificación externa.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y los idiomas soportados no están declarados; el uso en idiomas distintos del japonés (si se confirma el dominio) probablemente degrade la calidad.
- Sin datos de entrenamiento publicados: no se documenta el dataset de SFT, el número de tokens ni si hubo filtrado de contenido, lo que impide auditar el modelo.
- Ausencia de benchmarks: no hay métricas publicadas (MMLU, HumanEval, GSM8K ni equivalentes), por lo que cualquier comparación de calidad es especulativa.
- Metadatos poco fiables para producción: 0 descargas y 0 likes, fecha de creación anómala (2026) y nombre con semilla duplicada, indicativos de un artefacto de investigación más que de un modelo mantenido.
- Sin soporte para tool calling, agentes ni multimodalidad documentado: no debe integrarse en pipelines que dependan de estas capacidades.
- Si se convierte a GGUF o se cuantiza, hay que validar la degradación, ya que el autor solo publica safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-wc-zipf-newlex-jpn-ckpt4000_seed3407_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-jpn-100mb_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/41y8x1y3
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de TRL (SFTTrainer): https://huggingface.co/docs/trl
