# JazerJu/qwen3-asr-ctc-aiinfra

## Resumen

Qwen3-ASR-CTC-aiinfra es una cabeza CTC (connectionist temporal classification) de 85.448.596 parámetros que se conecta a la torre de audio del modelo Qwen3-ASR-1.7B, que permanece completamente congelada. No es un modelo de lenguaje ni un modelo de reconocimiento de voz completo: es un componente de decodificación acústica que se apoya en el encoder de Qwen para producir transcripciones y alineaciones forzadas a nivel de palabra. El encoder no se distribuye en este repositorio (0,3 GB) y se descarga en tiempo de ejecución desde Qwen/Qwen3-ASR-1.7B.

El autor, JazerJu, lo presenta como la versión v2 de su cabeza CTC anterior (JazerJu/qwen3-asr-ctc, 48,3 M de parámetros, sin self-conditioning). Los dos cambios principales respecto a v1 son el uso de self-conditioned CTC con pérdidas auxiliares Intermediate CTC, y un reentrenamiento continuado sobre 372 horas de audio chino-inglés mezclado del dominio de infraestructura de IA, orientado a términos como cann, Ascend C, 昇腾, SGLang o HBM.

Su relevancia práctica está en dos frentes: la mejora de términos técnicos poco frecuentes (del 35 % al 81 % de acierto en 47 términos sobre un conjunto de test propio) sin degradar los 12 idiomas soportados, y el comportamiento con segmentos largos, donde el CER en cortes fijos de 30 segundos pasa del 28,1 % al 18,4 %. La licencia es Apache-2.0 para el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza CTC self-conditioned (arXiv 2104.02724) con Intermediate CTC, sobre encoder de audio congelado Qwen3-ASR-1.7B; 5 bloques Transformer (8 cabezas, FFN de 128), proyección 2048→2048→512, capa de conditioning 72.468→512 en las capas intermedias [1, 3] |
| Parametros totales | 85.448.596 en la cabeza CTC; el encoder Qwen3-ASR-1.7B (~1,7 B) se carga aparte y está congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor formal. El autor documenta funcionamiento estable con segmentos fijos de 30 s (CER 18,4 %); la tasa de frames es de 13 fps (76,9 ms por frame), con 8× de downsampling mediante 3 capas conv2d de stride 2 |
| Tipos de cuantizacion | int4 (44,0 MB, frente a 25,1 MB de v1); exportaciones ONNX en fp16, q4 y q4f16 |
| Idiomas soportados | 12: zh, en, yue, ja, ko, de, fr, es, it, pt, nl, pl |
| Licencia | Apache-2.0 (la del modelo base Qwen/Qwen3-ASR-1.7B no se especifica en la información disponible) |
| Formato de pesos | PyTorch / safetensors (modeling_ctc.py incluido); exportaciones ONNX (fp16, q4, q4f16) |

## Arquitectura y entrenamiento

La cabeza es un decodificador CTC de 5 bloques Transformer con 8 cabezas de atención y FFN de 128, que proyecta de 2048 a 2048 y luego a 512. Sobre ella se aplica self-conditioned CTC: tras los bloques 2 y 4 (índices 1 y 3 en base cero), la predicción intermedia se pasa por softmax y se proyecta de vuelta al espacio del backbone mediante una capa `conditioning_layer` (72.468→512) que se suma a la entrada de la siguiente capa. Esta ruta participa en la inferencia, no es un artefacto de entrenamiento: construir el modelo con la estructura de v1 produce salidas incorrectas aunque `load_state_dict` no falle si se desactiva `strict`. El vocabulario es una versión compacta del vocabulario nativo de Qwen3 (151.705 entradas), con 72.468 clases incluyendo blank y unk.

El entrenamiento parte de un modelo base multilingüe self-conditioned (step 260.503) y continúa 2 épocas con batch de 32 por tarjeta (256 global), grad_accum 1, LR coseno desde 8e-5, InterCTC 0.3 y SpecAugment. Se usaron 8 aceleradores Ascend 910B3 y 339.707 pasos en total, con 10 horas y 30 minutos de cómputo incremental en esta ronda. Los datos de continuación suman 372 horas de chino-inglés mezclado del dominio de infraestructura de IA, extraídos de subtítulos duros de 545 vídeos, más segmentos largos fusionados (se unen subtítulos con pausas de ≤0,6 s para generar tramos de 8 a 20 s sin recortar el audio), inglés y datos sintéticos TTS, todo ello superpuesto sobre los 26 manifest del corpus base. La pérdida de validación final es de 0,5321 en el conjunto general y 1,0815 en el de dominio.

## Capacidades

- Reconocimiento de voz multilingüe en 12 idiomas (chino mandarín, inglés, cantonés, japonés, coreano, alemán, francés, español, italiano, portugués, neerlandés y polaco), con métricas WER o CER publicadas para cada uno.
- Reconocimiento de habla con mezcla de idiomas dentro de la misma frase, evaluado en el conjunto ASCEND test (MER 12,43).
- Alineación forzada con marcas de tiempo a nivel de palabra mediante los picos de emisión del CTC (el ejemplo `example.py` del repositorio lo demuestra).
- Transcripción de segmentos largos: funciona con cortes fijos de 30 s sin degradarse (CER 18,4 % con corte a 30 s, 17,5 % a 20 s).
- Vocabulario técnico de infraestructura de IA reforzado por dominio: cann (80 %), 昇腾 (84 %), ascend (95 %), ascend c (72 %), sglang (67 %), hbm (100 %), openai (84 %).
- Integración en arquitecturas de dos pasadas: primera pasada CTC y segunda pasada con un LLM para refinado del texto.
- Exportación a ONNX en fp16, q4 y q4f16 para inferencia cuantizada.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento explícito: es un modelo puramente acústico de transcripción y alineación.

## Casos de uso

- Transcripción de contenido técnico sobre aceleradores: el modelo está entrenado específicamente para escribir correctamente cann, Ascend C, 昇腾, HBM o SGLang, términos que el modelo base fallaba casi por completo (0 % en cann y 昇腾). Es adecuado para transcribir charlas, tutoriales y entrevistas sobre hardware de IA.
- Generación de subtítulos con marcas de tiempo por palabra: la salida de alineación forzada del CTC permite sincronizar subtítulos a nivel de palabra, con una corrección constante de aproximadamente +100 ms en el inicio y −80 ms en el final para el chino.
- Pipelines de subtitulado de vídeo largo: al tolerar cortes fijos de 30 segundos sin pérdida acusada de calidad, se puede segmentar el audio de forma mecánica y procesar cada ventana de manera independiente, simplificando la orquestación.
- Refinado en dos pasadas con un LLM: el CTC genera una primera transcripción con buena cobertura de términos (81 % en el conjunto propio) y un LLM posterior corrige puntuación y fluidez; el autor advierte que hay que aplicar las sustituciones de hotwords sobre el texto de la segunda pasada, no solo inyectarlas en el prompt.
- Indexación y búsqueda de bibliotecas de vídeo técnico: con 545 vídeos de dominio ya usados en entrenamiento y buen rendimiento en mezcla chino-inglés, sirve para generar transcripciones indexables de material formativo interno.
- Transcripción multilingüe en atención al cliente o reuniones internacionales: cubre 12 idiomas con un único modelo y admite cambio de idioma dentro de la misma conversación, útil cuando los participantes alternan entre lenguas.
- Despliegue en dispositivos con recursos limitados: la cabeza cuantizada a int4 ocupa 44,0 MB, de modo que el coste adicional sobre el encoder es mínimo; puede ejecutarse vía ONNX Runtime en entornos con GPU modesta.
- Investigación en CTC self-conditioned: el repositorio incluye `modeling_ctc.py` con la construcción correcta del grafo, lo que lo convierte en una referencia reproducible para estudiar self-conditioning e Intermediate CTC en ASR.

## Benchmarks y rendimiento

FLEURS completo (7.876 frases), misma ejecución y misma decodificación para el modelo base y para este modelo:

| Idioma | Metrica | n | Base | Modelo | Diferencia |
|---|---|---:|---:|---:|---:|
| en_us | WER | 647 | 17,89 | 16,98 | −0,92 |
| cmn_hans_cn | CER | 945 | 10,79 | 10,24 | −0,55 |
| ko_kr | CER | 382 | 18,90 | 15,85 | −3,06 |
| ja_jp | CER | 650 | 19,22 | 18,25 | −0,98 |
| yue_hant_hk | CER | 819 | 26,12 | 25,54 | −0,58 |
| de_de | WER | 862 | 38,51 | 36,74 | −1,76 |
| fr_fr | WER | 676 | 43,45 | 42,15 | −1,30 |
| es_419 | WER | 908 | 31,45 | 30,56 | −0,89 |
| it_it | WER | 865 | 46,24 | 44,39 | −1,85 |
| nl_nl | WER | 364 | 48,13 | 46,82 | −1,30 |
| pl_pl | WER | 758 | 74,88 | 73,03 | −1,85 |
| Micro media | | | 30,39 | 29,14 | −1,24 |
| Macro media | | | 34,14 | 32,78 | −1,37 |

Conjuntos estándar, mismo entorno:

| Corpus | Metrica | Base | Modelo |
|---|---|---:|---:|
| ASCEND test (chino-inglés mezclado) | MER | 13,91 | 12,43 |
| ReazonSpeech ja test | CER | 21,31 | 19,28 |
| LibriSpeech test-clean | WER | 5,91 | 5,55 |
| AISHELL-1 dev | CER | 4,12 | 3,91 |
| ja_local_1k | CER | 12,88 | 12,06 |

Audio largo, misma pista continua cortada en ventanas fijas:

| Tamano de corte | Base | Modelo |
|---|---:|---:|
| 30 s | 28,1 % | 18,4 % |
| 20 s | 28,7 % | 17,5 % |
| 15 s | 27,6 % | 17,8 % |
| 8 s | 27,3 % | 20,6 % |

Terminología de dominio, 955 segmentos propios, 47 términos con 1.158 apariciones y decodificación greedy:

| Termino | Apariciones | Base | Modelo |
|---|---:|---:|---:|
| 47 términos en conjunto | 1.158 | 403 (35 %) | 940 (81 %) |
| cann | 105 | 0 % | 80 % |
| 昇腾 | 73 | 0 % | 84 % |
| openai | 108 | 19 % | 84 % |
| sglang | 24 | 0 % | 67 % |
| hbm | 14 | 7 % | 100 % |
| ascend | 21 | 0 % | 95 % |
| ascend c | 18 | 0 % | 72 % |
| zero | 51 | 86 % | 33 % |

## Requisitos de hardware

- Cabeza CTC: 44,0 MB en int4, aproximadamente 171 MB en fp16 y unos 342 MB en fp32 (cálculo derivado de los 85.448.596 parámetros).
- Encoder Qwen3-ASR-1.7B: aproximadamente 3,4 GB en fp16, más memoria de activaciones según la longitud del audio. En la práctica, un despliegue en fp16 requiere del orden de 4 GB de VRAM más activaciones.
- GPU recomendadas: el modelo cabe sobradamente en GPUs de consumo. Una RTX 3060 de 12 GB o una RTX 4090 de 24 GB son más que suficientes; también es viable en GPUs de 8 GB si se cuantiza la cabeza y el encoder. A100 o H100 solo tendrían sentido para inferencia por lotes a gran escala. El autor entrenó con 8× Ascend 910B3 (64 GB de HBM por tarjeta), pero eso corresponde al entrenamiento, no a la inferencia.
- Opciones de despliegue: PyTorch con `transformers` y la librería `qwen-asr` (el autor usa la 0.0.6), cargando `modeling_ctc.py`; el encoder se descarga desde Qwen/Qwen3-ASR-1.7B o se apunta con la variable `QWEN3_ASR_ENCODER` para entornos sin conexión. Existen exportaciones ONNX (fp16, q4, q4f16) alojadas en JazerJu/glm-asr-ctc-bench para inferencia cuantizada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que no es un modelo de lenguaje causal.
- Latencia y throughput: no disponible. La model card no publica tiempos de inferencia ni métricas de rendimiento por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JazerJu/qwen3-asr-ctc-aiinfra | 85,4 M (cabeza) + 1,7 B (encoder congelado, aparte) | Cabeza CTC self-conditioned sobre encoder Qwen3-ASR | Segmentos de hasta 30 s documentados | Apache-2.0 | HuggingFace; requiere descargar el encoder por separado |
| JazerJu/qwen3-asr-ctc (v1) | 48,3 M, sin self-conditioning | Cabeza CTC sobre el mismo encoder | No documentado | No disponible en la información | HuggingFace; 25,1 MB en int4 |
| Qwen/Qwen3-ASR-1.7B | ~1,7 B | Modelo ASR completo | No disponible | No disponible en la información | HuggingFace; es el encoder base de este modelo |
| Whisper large-v3 | ~1,55 B | Modelo ASR seq2seq | Ventanas de 30 s | MIT | Muy extendido, con múltiples implementaciones |
| Herramientas de alineación forzada genéricas (por ejemplo, las basadas en CTC de torchaudio o NeMo) | Variable | Alineador CTC | Variable | Variable | No disponible en la información |

Comparación de rendimiento directo entre esta cabeza y Whisper large-v3 no es posible con los datos aportados, porque la model card solo compara contra el modelo base de Qwen3-ASR-1.7B y contra su propia v1.

## Limitaciones y advertencias

- El término `zero` retrocede del 86 % al 33 %: en el corpus de dominio, ZeRO (la optimización de memoria de DeepSpeed) y el número 0 son homófonos, y el modelo ahora tiende a escribir ZeRO. El autor señala que es una regresión real y no la ha corregido.
- En pipelines de dos pasadas (CTC + LLM), el término `cann` se pierde: la primera pasada lo acierta en 84 de 105 casos (89 %) pero tras la segunda pasada solo sobrevive en torno al 21 %, porque es homófono de un carácter chino muy frecuente. Para conservarlo hay que aplicar sustituciones por coincidencia de hotwords directamente sobre el texto de la segunda pasada.
- La decodificación greedy puede emitir caracteres chinos incompletos (U+FFFD): ocurre en 1 de cada 155 segmentos del conjunto propio. Una búsqueda por haces con restricción de validez UTF-8 lo elimina y además baja el CER de 0,1449 a 0,1426.
- Contaminación de datos: los splits oficiales de test de TALCS, MAGICDATA y CS-Dialogue se filtraron en el conjunto de entrenamiento, por lo que los resultados sobre esos tres corpus no deben usarse como medida de generalización. El autor afirma que el resto de conjuntos listados se verificaron como limpios.
- Las marcas de tiempo en chino no tienen referencia con la que validarse. Se mantiene la conclusión de v1: el patrón de emisión en picos del CTC provoca un sesgo sistemático de aproximadamente 100 ms de retraso en el inicio de palabra y 80 ms de adelanto en el final, corregible con una constante.
- La entrada del encoder es un tensor 2D de forma [128, ΣT_mel] con `feature_lens`, no un tensor 3D [B, 128, T]; pasar 3D provoca un error de `split_with_sizes`.
- La tasa de frames es de 13 fps (76,9 ms por frame), no los 50 fps de Whisper o GLM. Asumir 50 fps sobreestima la capacidad disponible por un factor de 4 y produce alineaciones incorrectas aunque la pérdida parezca descender.
- Es obligatorio aplicar un parche de máscara de atención: en `qwen-asr` 0.0.6 la función `_prepare_attention_mask` está definida pero nunca se invoca, y `cu_seq_lens_q/k` solo lo interpreta el backend flash_attention_2. Sin el parche, la similitud coseno entre inferencia de una sola muestra y por lotes cae a 0,81–0,88; con el parche sube a 0,9998 o más. Afecta también a CUDA, no solo a Ascend. La función `patch_qwen3_attention_mask()` es idempotente y `Qwen3CtcAsr` la llama automáticamente.
- La configuración `self_cond: true` e `inter_layers: [1, 3]` debe leerse del `config.json`; construir el modelo con la estructura de v1 puede cargar los pesos sin error aparente y producir salidas erróneas.
- El encoder no está incluido en el repositorio y debe descargarse por separado, lo que añade una dependencia de red y de espacio en disco.
- El modelo tiene 0 descargas y 0 me gusta en el momento de la consulta, por lo que no cuenta con validación independiente de la comunidad.
- La licencia Apache-2.0 declarada corresponde al repositorio de la cabeza CTC; para uso comercial es necesario verificar por separado la licencia del encoder Qwen/Qwen3-ASR-1.7B, no especificada en la información disponible.
- No se documentan sesgos demográficos ni acústicos concretos, ni comportamiento del modelo con silencio prolongado, ruido o solapamiento de hablantes. En ese tipo de entradas, como es habitual en ASR, existe riesgo de alucinación o de repetición de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JazerJu/qwen3-asr-ctc-aiinfra
- Encoder base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Versión anterior de la cabeza CTC (v1): https://huggingface.co/JazerJu/qwen3-asr-ctc
- Exportaciones ONNX (fp16, q4, q4f16): https://huggingface.co/JazerJu/glm-asr-ctc-bench
- Paper de self-conditioned CTC: https://arxiv.org/abs/2104.02724
- Otros enlaces (papers adicionales, blogs, repositorios o demos): no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
