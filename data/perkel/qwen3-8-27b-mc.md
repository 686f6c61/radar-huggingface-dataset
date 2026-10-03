# perkel/Qwen3.8-27B-MC

## Resumen

Qwen3.8-27B-MC es una coleccion de cinco cuantizaciones del modelo multimodal Qwen/Qwen3.8-27B (27B parametros, denso, nativo multimodal, desarrollado por el equipo Qwen de Alibaba) realizadas por el usuario perkel para el motor de inferencia MegaCapybara. La conversion traslada los pesos BF16 originales a los formatos MXFP4 y MXFP6, que los tensor cores de la arquitectura Blackwell de NVIDIA leen a velocidad completa, con el objetivo de ejecutar el modelo en una unica tarjeta RTX 5090.

El interes tecnico esta en el enfoque de cuantizacion mixta por capas: en lugar de un unico formato global, cada variante asigna MXFP4 o MXFP6 (y hasta dos terminos FP8 para la cabeza y algunas entradas de MLP) segun la sensibilidad de cada componente, ofreciendo cinco puntos de la curva tamano/precision con divergencia KL y acuerdo top-1 medidos contra los pesos BF16 de referencia. La variante Medium, de 19,5 GB en disco y 15,39 GiB en VRAM, es la opcion por defecto del launcher.

El modelo base es relevante porque Qwen3.8-27B es un modelo abierto multimodal con 262.144 tokens de contexto nativo (extensible a 1.000.000 via RoPE/YaRN) orientado a codigo, flujos agenticos y automatizacion de oficina. Esta conversion hace viable desplegarlo localmente en hardware de consumo con decodificacion especulativa (DFlash2 y MTP) y velocidades de hasta 540 tokens/s en una sola conversacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal nativo (torre de vision separada), segun el repositorio oficial de Qwen3.8-27B |
| Parametros totales | 27B (denominacion del modelo base; no se detalla el desglose exacto en la informacion disponible) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extension a 1.000.000 mediante configuracion RoPE/YaRN (dato de la model card oficial de Qwen3.8-27B recogido en la busqueda web) |
| Tipos de cuantizacion | MXFP4 y MXFP6 (escala de bloque MX compartida por 32 pesos, potencia de dos); la variante XXL usa ademas ~16 bits (dos terminos FP8) en la cabeza y en las entradas de MLP de las capas 24-39; la torre de vision se ofrece en FP8 y en BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.mcapy` (formato propio del motor MegaCapybara); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 108,0 GB (incluye las cinco variantes de pesos y los ficheros de soporte) |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo: es una conversion por cuantizacion de Qwen/Qwen3.8-27B (revision `1d4bf0f`) a los formatos MX de MegaCapybara. El proceso se aplica capa por capa con GPTQ y escalas de bloque MX, donde cada grupo de 32 pesos comparte una escala potencia de dos, calibrado sobre 514K tokens de texto (secuencias de 2K y 16K tokens de razonamiento y matematicas, segun la descripcion de la model card, que queda truncada en ese punto). El modelo base es un transformer denso de 27B con capacidad multimodal nativa, con una torre de vision que se distribuye como fichero aparte y que puede cargarse en FP8 (casi exacta) o en BF16.

La innovacion practica de este paquete es la asignacion selectiva de precision: las variantes Small, Medium y XXL suben a MXFP6 o FP8 solo determinados modulos (la cabeza, las salidas de los mixers de 24 capas, las entradas de mixer y las salidas de MLP, o las entradas de MLP de las capas 24-39), manteniendo el resto en MXFP4. A esto se anade decodificacion especulativa con dos drafters alternativos: DFlash2 (convertido desde incoai/Qwen3.8-27B-DFlash2, 1,3 GB, opcion por defecto) y la propia capa MTP de Qwen (0,28 GB, mas pequena y lenta). No se documentan en la informacion disponible las fases de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta orientado a trazas de razonamiento, matematicas y codigo; la evaluacion de calidad de la cuantizacion incluye conjuntos de razonamiento, matematicas, codigo, chat y wiki.
- Codigo: principal caso de uso declarado por el autor, con soporte para agentes de programacion tipo Claude Code a traves de las APIs compatibles con OpenAI y Anthropic.
- Vision / image-text-to-text: pipeline declarado como image-text-to-text, con torre de vision distribuida en FP8 o BF16.
- Tool calling / function calling: el modelo base lo soporta, aunque el autor advierte que las llamadas a herramientas no se puntuan en la evaluacion de fidelidad porque difieren incluso entre BF16 y FP32.
- Flujos agenticos y multi-step: el autor cita explicitamente flujos agenticos y automatizacion de oficina como puntos fuertes del modelo base, y mide rendimiento con 8 conversaciones concurrentes.
- Multilingue: limitado a ingles y chino.
- Modo thinking: la medicion de velocidad se realiza con "thinking off", lo que implica que el modelo dispone de modo de razonamiento activable.
- Decodificacion especulativa: soportada de serie mediante DFlash2 o MTP.

## Casos de uso

- Agente de codigo local en una RTX 5090: con la variante Tiny o Small, el modelo puede atender una conversacion de codigo a 540 o 495 tokens/s y servir a un equipo de agentes a ~1.900 tokens/s agregados, integrándose en Claude Code o en clientes compatibles con la API de OpenAI en `http://127.0.0.1:8080/v1`.
- Asistencia a programadores en estaciones de trabajo Windows 11: MegaCapybara se distribuye con launcher para Windows 11 y Linux, de modo que un desarrollador puede levantar el servidor local sin infraestructura de datacenter y mantener el codigo en su propia maquina.
- Procesamiento de documentos con imagenes: al ser image-text-to-text y cargar la torre de vision en FP8 (0,57 GB), permite extraer y resumir informacion de capturas, diagramas o documentos escaneados en un flujo local.
- Atencion al cliente automatizada en ingles y chino: el contexto nativo de 262.144 tokens del modelo base permite mantener historiales de conversacion muy largos sin truncar, y el modo thinking desactivado reduce la latencia por respuesta.
- Automatizacion de oficina: generacion y resumen de correo, actas, informes y hojas de calculo, aprovechando el contexto largo para procesar documentos completos en una sola pasada.
- Razonamiento matematico y analisis tecnico: el modelo base esta evaluado con prompts de razonamiento paso a paso y respuesta en `\boxed{}` (MathVision), y la calibracion de la cuantizacion incluye texto matematico, por lo que las variantes Large y XXL conservan mejor esta capacidad (KL de 0,0008-0,0010 en matematicas frente a 0,0156 en Tiny).
- Despliegue multiagente concurrente: con 8 conversaciones simultaneas el rendimiento agregado llega a 1.890 tokens/s en Tiny, lo que permite orquestar varios agentes especializados sobre una sola GPU.
- Lectura de prompts largos: la fase de prefill procesa un prompt de 8K tokens a 7.789 tokens/s en Tiny y 6.178 tokens/s en XXL, adecuado para pipelines de resumen sobre documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) del modelo base ni de estas cuantizaciones en la informacion disponible. La unica referencia externa recogida es la puntuacion ECI de Epoch AI para Qwen3.8-27B: 149, puesto 52 de 251 modelos seguidos (puesto 45 de 244 en el momento de su publicacion). El autor si publica metricas de fidelidad respecto a los pesos BF16 originales y de velocidad.

Calidad de la cuantizacion (KL y acuerdo top-1 frente a BF16 calculado en FP32, sobre 81.880 tokens reservados):

| Variante | En disco | En VRAM | KL | Top-1 |
|---|---|---|---|---|
| Tiny | 16,6 GB | 12,70 GiB | 0,0582 | 92,7% |
| Small | 17,6 GB | 13,67 GiB | 0,0478 | 93,8% |
| Medium | 19,5 GB | 15,39 GiB | 0,0298 | 95,2% |
| Large | 22,9 GB | 18,66 GiB | 0,0081 | 97,7% |
| XXL | 28,2 GB | 23,58 GiB | 0,0051 | 98,3% |

KL desglosada por tipo de texto:

| Variante | Razonamiento | Matematicas | Codigo | Chat | Wiki |
|---|---|---|---|---|---|
| Tiny | 0,0138 | 0,0156 | 0,0471 | 0,1750 | 0,0395 |
| Small | 0,0107 | 0,0138 | 0,0424 | 0,1456 | 0,0262 |
| Medium | 0,0058 | 0,0078 | 0,0290 | 0,0874 | 0,0190 |
| Large | 0,0009 | 0,0010 | 0,0075 | 0,0283 | 0,0026 |
| XXL | 0,0007 | 0,0008 | 0,0069 | 0,0151 | 0,0021 |

Velocidad en RTX 5090 (tokens/s, greedy, thinking off, respuestas de hasta 2.000 tokens, activaciones FP8, DFlash2, memoria de la tarjeta overclockeada a 16,8 GHz, +20%):

| Variante | Codigo, 1 conversacion | Prosa, 1 conversacion | Codigo, 8 simultaneas (total) | Lectura de prompt de 8K |
|---|---|---|---|---|
| Tiny | 540 | 248 | 1.890 | 7.789 |
| Small | 495 | 232 | 1.754 | 7.619 |
| Medium | 440 | 208 | 1.638 | 7.377 |
| Large | 377 | 176 | 1.427 | 6.955 |
| XXL | 313 | 148 | 1.254 | 6.178 |

## Requisitos de hardware

- VRAM para inferencia: entre 12,70 GiB (Tiny) y 23,58 GiB (XXL) para los pesos del modelo, a los que hay que sumar el drafter (1,3 GB con DFlash2 o 0,28 GB con MTP) y la torre de vision (0,57 GB en FP8 o 1,0 GB en BF16), ademas del KV cache.
- GPU objetivo: NVIDIA RTX 5090 (Blackwell), la unica tarjeta para la que el autor ha medido y ajustado el paquete. Los formatos MXFP4 y MXFP6 se leen a velocidad completa en tensor cores Blackwell.
- Cabe en GPU de consumo: si, en una RTX 5090; las cinco variantes entran en sus 32 GB de memoria, aunque Large y XXL dejan menos margen para contexto.
- Opciones de despliegue: exclusivamente MegaCapybara (launcher propio para Windows 11 y Linux, con soporte de las APIs de OpenAI y Anthropic). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.mcapy` es propietario.
- Latencia y throughput: los valores de la tabla anterior, medidos con la memoria de la GPU overclockeada un 20%; el autor advierte que la decodificacion esta limitada por ancho de banda de memoria y que una tarjeta de stock sera mas lenta.

## Comparativa con modelos similares

| Alternativa | Formato | Precision / contexto | Licencia | Motor |
|---|---|---|---|---|
| Qwen3.8-27B-MC (Medium) | `.mcapy` MXFP4/MXFP6 mixto | Top-1 95,2%, KL 0,0298; 262.144 tokens nativos | apache-2.0 | MegaCapybara (RTX 5090) |
| Quantizaciones GGUF de Unsloth para Qwen3.8-27B | GGUF | UD-Q4_K_XL: 96,4% top-1 publicado por Unsloth (96,2% en el test del autor) | apache-2.0 (heredada del base) | llama.cpp |
| Qwen/Qwen3.8-27B original | safetensors BF16 | Referencia sin perdida; 262.144 tokens nativos, hasta 1.000.000 con YaRN | apache-2.0 | Multiples (vLLM, TGI, transformers) |
| perkel/Qwen3.8-27B-Uncensored-MC | `.mcapy` | Misma conversion sobre una release abliterada | apache-2.0 | MegaCapybara (RTX 5090) |

El tamano en bytes de las cuantizaciones GGUF de Unsloth no figura en la informacion disponible, por lo que no se puede comparar la huella en disco ni en VRAM frente a las variantes MC. La comparacion de fidelidad solo es posible en el eje de top-1 y con la salvedad de que cada parte mide sobre su propio texto de evaluacion.

## Limitaciones y advertencias

- Idiomas: solo ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Dependencia de un motor propietario: los pesos usan el formato `.mcapy` y solo se ejecutan en MegaCapybara, lo que ata el despliegue a una herramienta concreta y a hardware Blackwell (RTX 5090). No hay ruta de migracion a vLLM, llama.cpp, Ollama o TGI.
- Divergencia en conversacion: la KL mas alta de todas las categorias medidas corresponde al texto de chat (0,1750 en Tiny, 0,0151 en XXL), por lo que el registro conversacional es el mas afectado por la cuantizacion.
- Tool calling no evaluado: el propio autor indica que las llamadas a herramientas no se puntuan porque difieren incluso entre BF16 y FP32, de modo que no hay garantia cuantificada de fidelidad en function calling.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad o tasa de alucinacion para el modelo base ni para las cuantizaciones.
- Sesgos: no se publica informacion sobre sesgos del modelo base ni sobre la composicion de su dataset de entrenamiento.
- Mediciones de velocidad optimistas: los datos de throughput se obtuvieron con la memoria de la GPU overclockeada un 20% y sin ninguna otra carga en la tarjeta; en condiciones normales el rendimiento sera inferior.
- Traccion nula: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, y fue creado el 1 de octubre de 2026, por lo que es un artefacto muy reciente sin validacion independiente de la comunidad.
- Existe una variante sin censura (Qwen3.8-27B-Uncensored-MC) derivada de una release abliterada; conviene tenerla en cuenta al auditar despliegues, ya que sus salvaguardas son distintas de las del modelo original.
- Licencia: apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.8-27B, que conviene revisar por separado.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/perkel/Qwen3.8-27B-MC
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Motor MegaCapybara: https://github.com/perkel666/MegaCapybara
- Descargas de MegaCapybara: https://github.com/perkel666/MegaCapybara/releases/latest
- Guia de uso de MegaCapybara: https://github.com/perkel666/MegaCapybara/blob/main/docs/USAGE.md
- Variante sin censura: https://huggingface.co/perkel/Qwen3.8-27B-Uncensored-MC
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Ficha de Qwen3.8-27B en Epoch AI: https://epoch.ai/models/qwen-3-8-27b
- Analisis en AI on Mac (contexto y despliegues MLX): https://ai-on-mac.com/articles/qwen-3-8-27b-en/
- Analisis sobre IA agentica local: https://agenticaiinsights.substack.com/p/deeper-dive-the-qwen-38-27b-open
