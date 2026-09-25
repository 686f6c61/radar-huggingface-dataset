# SceneWorks/yue-s1-7b-anneal-jp-kr-icl-candle

## Resumen

YuE-s1-7B-anneal-jp-kr-icl es la etapa 1 del sistema YuE, una familia de modelos fundacionales de generacion musical desarrollada por M-A-P y HKUST que transforma letras en canciones completas (lyrics2song). En concreto, esta variante es un modelo de lenguaje de 7B parametros que convierte texto de letras, opcionalmente acompanado de un fragmento de audio de referencia, en la secuencia de tokens del codebook 0 que despues se decodifica a audio. La variante jp-kr esta orientada a japones y coreano, y el sufijo icl indica que admite aprendizaje en contexto a partir de un segmento de audio de referencia.

El repositorio analizado no es la distribucion oficial de M-A-P, sino una re-publicacion (rehost) realizada por SceneWorks de la revision `2e34fc94fa01e02b1d3d6f687ac9ac88ebaa9a74` del modelo original. El objetivo es que los pesos se resuelvan mediante un SHA de commit inmutable para el motor YuE de SceneWorks Inference, escrito en Rust sobre candle. El repositorio incluye tres niveles autocontenidos: el snapshot bf16 sin modificar, un nivel Q8 pre-cuantizado de 7,26 GB y un nivel Q4 de 4,49 GB.

Su relevancia practica es doble. Por un lado, ofrece una via reproducible de desplegar generacion musical open source fuera de Python, con pesos cuantizados listos para cargar. Por otro, documenta con detalle la procedencia de los pesos (fichero `SOURCE_REVISION.json` con SHA-256 de cada fichero) y la verificacion del tokenizador, algo poco habitual en espejos de modelos y util para pipelines de produccion que necesitan trazabilidad. El contexto es de 16384 tokens y el vocabulario de 83968 entradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder autoregresivo; etapa 1 de YuE (letras → codebook 0), con proyecciones de atención y MLP cuantizables |
| Parámetros totales | 7B (según la denominación del modelo) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16384 tokens |
| Tipos de cuantización | bf16 (sin cuantizar), GGML Q8_0 (nivel q8), GGML Q4_K (nivel q4); el cargador reconoce además Q4_0 (18 bytes por bloque) |
| Idiomas soportados | no disponible en los metadatos; la variante corresponde a japonés y coreano (jp-kr) según la denominación del modelo |
| Licencia | Apache-2.0 (© 2025 Ruibin Yuan y colaboradores principales de M-A-P y HKUST) |
| Formato de pesos | safetensors en bf16; en q8/q4 las proyecciones se almacenan como tensores U8 `[filas, bloques_por_fila, bytes_por_bloque]` con bloques GGML; embeddings, LM head y normas permanecen en bf16 |
| Vocabulario | 83968 tokens (SentencePiece `mm`, con `tokenizer.json` derivado en BPE con byte-fallback) |
| Tamaño del repositorio | 24,2 GB (incluye los tres niveles) |
| Tamaño por nivel | bf16: snapshot upstream; q8: 7,26 GB; q4: 4,49 GB |
| Codec de audio | no incluido en los niveles; se empareja con `SceneWorks/xcodec-mini-infer` (xcodec + decodificadores Vocos) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder autoregresivo de 7B parámetros que opera como primera etapa de un pipeline de dos fases. Recibe la letra y, si se activa el modo ICL, un segmento de audio de referencia, y genera la secuencia de tokens del codebook 0. La segunda etapa del sistema (por ejemplo `YuE-s2-1B-general` junto con el upsampler) se encarga de refinar esa representación hasta audio final. El contexto de 16384 tokens permite acomodar letras largas y prompts extensos, y el vocabulario de 83968 entradas cubre tanto texto como el espacio de tokens musicales.

No se especifica en la información disponible la familia exacta del transformer ni la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO. El sufijo "anneal" del nombre apunta a una fase de annealing del entrenamiento, y "icl" a la capacidad de aprendizaje en contexto, pero el repositorio no documenta el procedimiento con más detalle. El tokenizador sí está documentado: `tokenizer.model` es el SentencePiece `mm` original y `tokenizer.json` se deriva de él mediante BPE con byte-fallback y los tokens especiales en sus identificadores, verificado identificador a identificador contra `_MMSentencePieceTokenizer` sobre 3010 casos con 0 discrepancias.

La innovación técnica destacable de este repositorio es el formato de cuantización. Los niveles q8 y q4 no son ficheros GGUF convencionales: cada proyección de atención y MLP se cuantiza una sola vez con el preparador `prepare_snapshot` de candle-llm y se almacena como bloques GGML crudos en un tensor U8, cuyo tipo de bloque viene dado por `block_bytes` (18 = Q4_0, 34 = Q8_0, 144 = Q4_K). El cargador de candle reconstruye los pesos directamente, sin des-cuantizar ni volver a cuantizar. `config.json` incorpora el campo `quantization: {bits, storage: "ggml"}`.

## Capacidades

- Generación de canciones completas a partir de letras (lyrics2song), produciendo la representación del codebook 0 que alimenta las etapas posteriores del sistema YuE.
- Aprendizaje en contexto musical (ICL): acepta un segmento de audio de referencia de aproximadamente 30 segundos para imitar estilo, instrumentación o carácter de una canción existente.
- Continuación de fragmentos musicales existentes, con control de tiempos de inicio y fin del prompt mediante parámetros como `--use_audio_prompt`, `--prompt_start_time` y `--prompt_end_time` en el repositorio upstream.
- Generación por lotes y flujos interactivos mediante YuE-UI, la interfaz Gradio del proyecto, que permite previsualizar la salida de la etapa 1 antes de gastar cómputo en el refinado.
- Cobertura multilingüe orientada a japonés y coreano en esta variante concreta, dentro de una familia que también publica variantes en inglés (`en-cot`, `en-icl`) y chino (`zh-cot`).
- Ejecución nativa en Rust mediante candle, sin dependencia de Python, pensada para el motor YuE de SceneWorks Inference.
- No soporta tool calling ni function calling: no es un asistente de texto general, sino un modelo generativo de audio. El soporte de agentes y de razonamiento multi-paso no está documentado ni parece aplicable a su tarea.
- No dispone de modo "thinking", visión ni audio de entrada directo más allá del prompt musical del modo ICL.

## Casos de uso

- Generación de maquetas musicales a partir de letras: un compositor escribe la letra, la introduce en el pipeline YuE y obtiene una canción completa de forma local, sin depender de APIs de terceros ni de servicios de pago.
- Transferencia de estilo mediante ICL: dado un tema de referencia de unos 30 segundos, el modelo produce material nuevo con un estilo similar, útil para productores que quieren explorar variaciones coherentes con un catálogo existente.
- Ampliación de fragmentos inacabados: el modo de continuación permite extender una sección ya generada o un boceto inicial hasta una pieza completa, controlando en qué punto del audio arranca el condicionamiento.
- Producción por lotes de bandas sonoras para prototipos: YuE-UI permite generar varios candidatos en una sola ejecución y seleccionar los mejores, un flujo práctico para desarrolladores de videojuegos o vídeo que necesitan música de relleno rápidamente.
- Investigación en generación musical: al ser un modelo abierto con pesos reproducibles por SHA, sirve para estudiar la relación entre letras, estilo de referencia y representaciones de codebook, así como para comparar variantes lingüísticas (jp-kr frente a en o zh).
- Despliegue embebido en aplicaciones Rust: gracias a los niveles q8 y q4 preparados para candle, el modelo puede integrarse en servicios escritos en Rust con un consumo de disco reducido (4,49 GB en q4) y sin entorno Python.
- Experimentación en hardware de consumo: el nivel q4 de 4,49 GB permite probar el pipeline en una GPU de gama alta para consumidores, algo inviable con el snapshot bf16 completo más los decodificadores.
- Localización de repertorio musical en japonés y coreano: esta variante está pensada específicamente para letras en esos idiomas, lo que facilita la generación de contenido dirigido a esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de SceneWorks no incluye métricas objetivas, notas musicales automáticas, FAD ni comparaciones cuantitativas con otros sistemas, y el repositorio upstream de YuE referencia un paper marcado como "coming soon" en el momento de la consulta. El único dato de verificación numérica documentado es la validación del tokenizador: 3010 casos comprobados con 0 discrepancias frente a `_MMSentencePieceTokenizer`.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamaño de los ficheros publicados (estimación propia, no una cifra oficial): en torno a 6 GB para el nivel q4, unos 9 GB para el nivel q8 y aproximadamente 17 GB para el nivel bf16, en todos los casos con margen para activaciones y para los decodificadores de audio.
- Los tres niveles requieren, además, el codec emparejado `SceneWorks/xcodec-mini-infer` (xcodec y decodificadores Vocos), que no está incluido en el repositorio ni cuantizado por niveles.
- GPU recomendadas: para bf16, tarjetas con 24 GB o más (RTX 3090, RTX 4090, L40S, A100 40 GB, H100); para q8, tarjetas de 12-16 GB (RTX 4070 Ti Super, RTX 4080, A4000 16 GB); para q4, tarjetas de 8-12 GB.
- Cabe en GPU de consumo: sí. El nivel q4 (4,49 GB) es viable en GPUs de 8 GB, y el nivel q8 (7,26 GB) en GPUs de 12 GB o superiores con margen ajustado.
- Opciones de despliegue: el motor YuE de SceneWorks Inference sobre candle (Rust) es el destino declarado de estos pesos; el proyecto upstream `multimodal-art-projection/YuE` ofrece el pipeline de referencia en Python con YuE-UI (Gradio). No hay indicios de soporte específico para vLLM, TGI, Ollama o llama.cpp en la información disponible.
- Latencia y throughput: no disponibles. El repositorio no publica mediciones de tokens por segundo, tiempo por canción ni requisitos de CPU/RAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/yue-s1-7b-anneal-jp-kr-icl-candle (este repositorio) | 7B | 16384 | Etapa 1 lyrics2song + ICL, jp-kr | Apache-2.0 | Espejo con niveles bf16, q8 y q4 para candle |
| m-a-p/YuE-s1-7B-anneal-jp-kr-icl (upstream) | 7B | no disponible | Etapa 1 lyrics2song + ICL, jp-kr | Apache-2.0 | Distribución oficial en safetensors, sin cuantizar |
| m-a-p/YuE-s1-7B-anneal-jp-kr-cot | 7B | no disponible | Etapa 1 con cadena de pensamiento musical, jp-kr | Apache-2.0 | Distribución oficial |
| m-a-p/YuE-s1-7B-anneal-en-icl / en-cot | 7B | no disponible | Etapa 1 lyrics2song en inglés | Apache-2.0 | Distribución oficial |
| m-a-p/YuE-s1-7B-anneal-zh-cot | 7B | no disponible | Etapa 1 lyrics2song en chino | Apache-2.0 | Distribución oficial |
| m-a-p/YuE-s2-1B-general / YuE-upsampler | 1B (etapa 2) | no disponible | Refinado de la etapa 1 a audio final | Apache-2.0 | Distribución oficial |

No se dispone de comparaciones cuantitativas de rendimiento entre estas variantes en la información recogida; la única diferencia contrastada es el idioma objetivo y el modo (icl frente a cot), además del formato de pesos en el caso del espejo de SceneWorks.

## Limitaciones y advertencias

- Es un espejo no oficial: no está publicado por M-A-P ni por HKUST, sino por SceneWorks, y el propio repositorio lo declara explícitamente. Para trabajos que citen la fuente original conviene referenciar `m-a-p/YuE-s1-7B-anneal-jp-kr-icl`.
- No es un modelo de propósito general: no responde a instrucciones conversacionales, no hace tool calling y no debe evaluarse con benchmarks de texto habituales.
- Riesgo de alucinación en sentido musical: puede producir letras mal pronunciadas, métricas incoherentes o secciones instrumentales sin estructura reconocible, especialmente en pasajes largos cerca del límite de contexto.
- El modo ICL exige un segmento de audio de referencia de aproximadamente 30 segundos; sin él, la variante pierde parte de su utilidad diferencial.
- La cuantización a q4 y q8 afecta solo a las proyecciones de atención y MLP; embeddings, LM head y normas se mantienen en bf16, de modo que las cifras de VRAM deben calcularse sobre el conjunto, no solo sobre los pesos cuantizados.
- Los decodificadores de audio no están incluidos ni cuantizados: sin `SceneWorks/xcodec-mini-infer` el repositorio no produce audio por sí solo.
- Licencia Apache-2.0, permisiva para uso comercial, pero obliga a conservar `LICENSE` y `NOTICE` conforme a la sección 4(d). El aviso de copyright corresponde a Ruibin Yuan y colaboradores de M-A-P y HKUST.
- No hay datos publicados de benchmarks, sesgos, composición del dataset ni comportamiento en idiomas distintos del par japonés-coreano, lo que dificulta evaluar riesgos de sesgo cultural o de representación musical.
- El repositorio acumula 0 descargas y 0 likes, por lo que no existe validación de la comunidad sobre la integridad funcional de los niveles cuantizados más allá de la verificación del tokenizador documentada por el autor.
- El tamaño total del repositorio es de 24,2 GB; conviene descargar únicamente el nivel necesario, ya que cada directorio es autocontenido.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/SceneWorks/yue-s1-7b-anneal-jp-kr-icl-candle
- Modelo upstream oficial: https://huggingface.co/m-a-p/YuE-s1-7B-anneal-jp-kr-icl
- Codec emparejado: https://huggingface.co/SceneWorks/xcodec-mini-infer
- Proyecto YuE en GitHub (M-A-P): https://github.com/multimodal-art-projection/YuE
- Espejo del proyecto en GitHub: https://github.com/seshakiran/yue
- Espejo del proyecto en GitHub: https://github.com/digitalapplied/yue
- Ficha en ModelScope de la variante jp-kr-icl: https://www.modelscope.cn/models/AI-ModelScope/YuE-s1-7B-anneal-jp-kr-icl/summary
- Demo de YuE: enlace no disponible en la información recogida (el repositorio upstream referencia una demo sin URL en los extractos consultados)
- Paper de YuE: anunciado como "coming soon" en el repositorio upstream; sin enlace disponible en la información recogida
