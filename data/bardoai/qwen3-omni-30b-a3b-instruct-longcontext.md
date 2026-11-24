# BardoAI/Qwen3-Omni-30B-A3B-Instruct-LongContext

## Resumen

Qwen3-Omni-30B-A3B-Instruct-LongContext es una variante del modelo multimodal Qwen3-Omni-30B-A3B-Instruct de Alibaba Qwen, publicada por BardoAI. Se trata de un ajuste fino sin entrenamiento (training-free) en el que la capacidad de contexto largo del modelo Qwen3-30B-A3B-Instruct-2507 se transfiere en forma cerrada al "thinker" del Omni, es decir, sin gradientes ni procesos de mezcla de pesos. Solo cambian `q_proj`, `k_proj`, `q_norm` y `k_norm` de las 48 capas del thinker; el resto de componentes (expertos, router, torres de audio y visión, talker y code2wav) permanecen intactos.

El modelo parte de una ventana nativa de 65.536 tokens en el thinker original y la extiende hasta `max_position_embeddings` de 262.144 tokens con `rope_theta` de 10 M. Según la model card, la ventana nativa lleva a unos 128K tokens de forma fiable, y más allá requiere Dual Chunk Attention (DCA) configurada a partir del token 139.264. La arquitectura es un MoE multimodal con 35.259.818.545 parámetros totales (según safetensors) y aproximadamente 3B activos por token, coherente con el nombre A3B.

Es relevante porque demuestra que es posible extender el contexto de un modelo multimodal grande sin reentrenamiento, escribiendo el cambio directamente en los pesos, y porque apunta a un caso de uso concreto: mantener la coherencia en conversaciones muy largas (cientos de miles de tokens) con un modelo any-to-any que procesa texto, audio e imagen. El repositorio ocupa 70,5 GB y está publicado con licencia apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_omni_moe); thinker MoE con torres de audio y vision, talker y code2wav |
| Parametros totales | 35.259.818.545 (safetensors) |
| Parametros activos | Aproximadamente 3B (denominacion A3B) |
| Longitud de contexto | 262.144 (`max_position_embeddings`); ventana nativa fiable hasta ~128K; mas alla requiere DCA desde el token 139.264 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | en, de (segun tags y model card) |
| Licencia | apache-2.0 (la model card declara `license: other` con `license_name: apache-2.0`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MoE multimodal de la familia Qwen3-Omni. El componente "thinker" es un transformer con mezcla de expertos (48 capas afectadas por el cambio de contexto), acompañado de torres de visión y audio, un "talker" para generación de voz y un decodificador code2wav. La modificación de BardoAI no entrena nada: transfiere en forma cerrada el cambio de contexto largo de Qwen3-30B-A3B-Instruct-2507 al thinker del Omni, alterando únicamente las proyecciones y normalizaciones de query y key (`q_proj`, `k_proj`, `q_norm`, `k_norm`) de las 48 capas. El resto de pesos son idénticos al modelo base.

La innovación técnica principal es la extensión de contexto en el espacio de pesos (weight-space) sin gradientes ni merge, combinada con el uso de Dual Chunk Attention (DCA) para superar los 128K tokens. La model card describe parámetros específicos de DCA (`chunk_size`, `local_size` 256, `bardo_start` 139264 y campos de temperatura `bardo_temp_*`) que solo interpreta el runtime de BardoAI; otras implementaciones de DCA ignoran `bardo_start` y aplican DCA desde el primer chunk, lo que degrada la precisión por debajo de 128K. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base ni la composición del dataset, más allá de que el ajuste de contexto largo es training-free.

## Capacidades

- Generación any-to-any: procesa y genera texto, audio e imagen (pipeline `any-to-any`), heredando las capacidades multimodales de Qwen3-Omni.
- Razonamiento y generación de texto con contexto muy largo: mantiene el hilo de conversaciones de cientos de miles de tokens, con recuperación de información del inicio de la conversación.
- Recuperación de aguja en pajar (needle-in-a-haystack) a 128K, 192K y 248K tokens con resultados medidos en la model card.
- Capacidades de audio: el modelo base Omni incluye torre de audio y talker para entrada y salida de voz; estos componentes no se modifican en esta variante.
- Capacidades de visión: torre de visión del modelo base, sin cambios.
- Soporte multilingüe limitado a inglés y alemán según los tags del repositorio.
- No se documenta en la información proporcionada soporte explícito de tool calling, function calling ni flujos de agentes multi-paso para esta variante.

## Casos de uso

- Compañero conversacional de memoria larga: el modelo puede mantener el hilo de una conversación de cientos de miles de tokens y recordar anécdotas del inicio, lo que lo hace adecuado para asistentes con memoria persistente de sesiones extensas. La model card reporta recuperación de la anécdota inicial en 8 de 8 intentos a 248K y 13 de 22 a 1M en la mejor configuración.
- Análisis de documentos extensos: con ventana de hasta 262.144 tokens y DCA, permite resumir o extraer información de libros completos o expedientes largos en una sola pasada, sin troceado.
- Transcripción y análisis de audio largo: al conservar la torre de audio del Omni, puede procesar grabaciones extensas junto con su contexto textual asociado.
- Atención al cliente con historial prolongado: gestiona conversaciones multi-turno de gran longitud manteniendo la persona y los datos aportados al principio, útil en soporte técnico o atención personalizada.
- Procesamiento multimodal de informes con imágenes: combinación de visión y contexto largo para revisar documentos con figuras y texto extenso en una única llamada.
- Investigación sobre extensión de contexto: sirve como caso de estudio de transferencia de capacidad de contexto largo en el espacio de pesos sin entrenamiento, replicable sobre otros modelos de la familia.

## Benchmarks y rendimiento

Los datos disponibles son resultados internos de la model card, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación tal como se publican.

| Prueba | Original Omni | Este modelo |
|---|---|---|
| Alcance nativo de aguja única | ≈ 41K | — |
| Diez agujas, pregunta única, 128K (90 preguntas) | No medido en esta forma | 90/90 |
| Diez agujas, pregunta única, 192K (90 preguntas) | No medido en esta forma | 67/90 |
| Diez agujas, pregunta única, 248K (90 preguntas) | No medido en esta forma | 34/90 |
| Diez agujas con DCA desde token 139.264, 248K | — | 64/90 |
| Recuerdo de la anécdota inicial, 248K (8 intentos) | 2/8 | 6/8 |
| Recuerdo de la anécdota inicial, 384K (8 intentos) | 2/8 | 5/8 |
| Recuerdo de la anécdota inicial, 512K (8 intentos) | 0/8 | 3/8 |
| Recuerdo de la anécdota inicial, 248K, min_p 0.08 | — | 8/8 |
| Recuerdo de la anécdota inicial, 384K, min_p 0.08 | — | 14/16 |
| Recuerdo de la anécdota inicial, 512K, min_p 0.08 | — | 14/16 |
| Recuerdo de la anécdota inicial, 768K, min_p 0.08, role token barred | — | 7/8 |
| Recuerdo de la anécdota inicial, 864K, min_p 0.08, closing question y self-anchor | — | 7/8 |
| Recuerdo de la anécdota inicial, 960K, min_p 0.08, closing question y self-anchor | — | 8/16 |
| Recuerdo de la anécdota inicial, 1M, mejor configuración | — | 13/22 |

Las cifras de agujas usan top-k 50; las de conversación usan min_p 0.08 salvo indicación. Con top-k 50 en conversación el rendimiento cae (248K: 2/8; 384K: 7/16). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 35.259.818.545 parámetros en BF16, los pesos ocupan aproximadamente 70,5 GB, por lo que se requiere al menos esa cantidad de memoria para carga completa en BF16.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, se necesitan GPUs de centro de datos (A100 80 GB, H100 80 GB) o configuraciones multi-GPU para BF16.
- Cabeza en GPU de consumo: no con BF16; requeriría cuantización, cuyos formatos no se detallan en la información disponible.
- Opciones de despliegue: `transformers` 5.6.2 con `Qwen3OmniMoeForConditionalGeneration` (verificado en la model card), y cualquier stack que cargue Qwen3-Omni. El runtime BardoAI (no publicado) interpreta los campos DCA específicos. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: la model card indica 2–5 tok/s entre 384K y 768K en su servidor cuando el contexto excede la ventana KV de la GPU y se limita por el ancho de banda de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct-LongContext (este) | 35,26B totales / ~3B activos | 262.144 (nativo fiable ~128K) | Any-to-any | apache-2.0 | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct (base) | 35,26B totales / ~3B activos | 65.536 en thinker | Any-to-any | apache-2.0 | Hugging Face |
| Qwen3-30B-A3B-Instruct-2507 | ~30B totales / ~3B activos | No disponible en la información proporcionada | Texto | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparables en benchmarks estándar para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El ajuste de contexto largo es training-free y depende de configuraciones de muestreo y DCA específicas; sin ellas el rendimiento cae drásticamente (por ejemplo, 2/8 a 248K con top-k 50 frente a 8/8 con min_p 0.08).
- Más allá de 128K se requiere DCA con `bardo_start` 139264, un campo que solo interpreta el runtime de BardoAI; otras implementaciones aplican DCA desde el primer chunk y pierden precisión por debajo de 128K.
- El recuerdo a 1M de tokens solo se logra en 13 de 22 intentos en la mejor configuración, y entre un cuarto y un tercio en configuraciones peores; no es fiable a esa longitud.
- Idiomas soportados limitados a inglés y alemán; no se documenta castellano.
- Riesgo de alucinación y degradación de la persona en conversaciones largas si no se aplican las recetas de muestreo (min_p 0.08, sin top-k, bloqueo del token de rol `<|im_start|>` id 151644, pregunta de cierre y self-anchor más allá de 768K).
- La licencia se declara de forma ambigua: `license: other` con `license_name: apache-2.0` en la model card frente a `apache-2.0` en los metadatos de Hugging Face; conviene verificar las condiciones antes de uso comercial.
- No se han publicado resultados de benchmarks estándar ni datos de sesgos; el modelo hereda los del base Qwen3-Omni.
- El runtime BardoAI que facilita el uso del modelo con memoria y voz no está publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BardoAI/Qwen3-Omni-30B-A3B-Instruct-LongContext
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Modelo del que se transfiere el contexto largo: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
