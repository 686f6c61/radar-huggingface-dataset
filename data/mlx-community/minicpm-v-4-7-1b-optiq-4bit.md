# mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit

## Resumen

MiniCPM-V-4.7-1B-OptiQ-4bit es una cuantizacion mixta de 4 y 8 bits del modelo multimodal MiniCPM-V 4.7 1B de OpenBMB, publicada por la comunidad mlx-community para su ejecucion nativa en Apple Silicon mediante MLX. El modelo original combina una torre de vision SigLIP NaViT con una torre de lenguaje densa Qwen3.5 de 24 capas y atencion hibrida (lineal y completa), lo que le permite procesar imagen y texto en una unica pila de aproximadamente 1.000 millones de parametros.

La relevancia de esta variante concreta esta en la estrategia de cuantizacion: en lugar de aplicar 4 bits de forma uniforme, la herramienta mlx-optiq mide la sensibilidad de cada capa y asigna 8 bits a 64 de las 187 capas, manteniendo las 123 restantes en 4 bits. Segun la model card, esto eleva la puntuacion agregada de capacidades de 48,17 (cuantizacion uniforme de 4 bits) a 52,48, con mejoras especialmente marcadas en HumanEval (50,6 frente a 32,9) y GSM8K (69,8 frente a 65,1).

El resultado es un modelo vision-lenguaje que ocupa 0,80 GB para la torre de lenguaje y 1,10 GB para la torre de vision en disco, con la torre visual conservada en bf16. Esta pensado para inferencia local en Macs con chip Apple Silicon, sin dependencia de PyTorch ni de servicios en la nube, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: torre de vision SigLIP NaViT (bf16) + torre de lenguaje Qwen3.5 densa de 24 capas con atencion hibrida (lineal y completa) |
| Parametros totales | 1.006.209.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262k) en la torre de lenguaje |
| Tipos de cuantizacion | Mixta 4/8 bits (123 capas a 4 bits, 64 capas a 8 bits); torre de vision en bf16; KV cache mixta 4/8 bits en capas de atencion completa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con sidecar de vision en `optiq/optiq_vision.safetensors` y configuracion de KV cache en `kv_config.json` |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V 4.7 1B es un sistema image-text-to-text compuesto por dos torres: una torre de vision SigLIP NaViT, que en esta cuantizacion se mantiene en bf16 sin cuantizar, y una torre de lenguaje Qwen3.5 densa de 24 capas con atencion hibrida que alterna mecanismos de atencion lineal y atencion completa. Esta combinacion permite manejar contextos de hasta 262.144 tokens con un coste computacional menor que una atencion cuadratica pura.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no se detalla el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion OptiQ: se mide la sensibilidad de cada una de las 187 capas y se asigna precision de forma diferenciada, manteniendo 64 capas en 8 bits y 123 en 4 bits. Ademas, se incluye una configuracion de KV cache mixta (4/8 bits) aplicada solo a las capas de atencion completa, lo que reduce el consumo de memoria durante la generacion sin degradar en la misma medida las capas mas sensibles.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat (`apply_chat_template`).
- Comprension de imagenes y respuesta a preguntas sobre su contenido (image-text-to-text), incluyendo lectura de texto en imagenes (OCR basico verificado en la model card con la cadena "OPTIQ 42").
- Razonamiento matematico basico y de varios pasos (evaluado con GSM8K).
- Generacion de codigo (evaluado con HumanEval pass@1).
- Seguimiento de instrucciones estrictas (evaluado con IFEval).
- Function calling / tool calling, aunque con perdida de rendimiento respecto al modelo sin cuantizar (BFCL-V3 de 48,5 a 41,5).
- Recuperacion en contexto largo (evaluado con HashHop), favorecida por la ventana de 262k tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente visual local en Mac: el modelo puede responder preguntas sobre capturas de pantalla, fotografias o documentos escaneados directamente en un equipo Apple Silicon, sin enviar imagenes a la nube, gracias a la torre de vision en bf16 y al peso total de 1,9 GB del repositorio.
- Extraccion de texto de imagenes en flujos de trabajo personales: lectura de tickets, notas manuscritas o etiquetas, aprovechando la capacidad OCR demostrada en la model card y el bajo coste de despliegue con `optiq serve`.
- Prototipado rapido de aplicaciones multimodal: al exponer un endpoint compatible con OpenAI y Anthropic mediante `optiq serve`, se puede integrar en aplicaciones existentes sin reescribir el cliente, usando `image_url` como contenido.
- Analisis de documentos largos con soporte visual: la ventana de 262k tokens permite procesar conversaciones o documentos extensos junto con imagenes intercaladas, util para resumenes de informes con graficos.
- Automatizacion de tareas de codigo asistido en local: con HumanEval pass@1 de 50,6 en esta cuantizacion, es viable como asistente de autocompletado o generacion de funciones en entornos de desarrollo sin conexion.
- Evaluacion e investigacion de tecnicas de cuantizacion: el repositorio incluye la configuracion de KV cache mixta y datos comparativos frente a cuantizacion uniforme, lo que lo convierte en un banco de pruebas para estudiar el impacto de la precision mixta en modelos multimodales pequenos.
- Chatbot de atencion al cliente con entrada de imagenes: un modelo de 1B puede desplegarse en hardware de consumo para triage de consultas con capturas adjuntas, derivando a un modelo mayor los casos complejos.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan esta cuantizacion OptiQ con una cuantizacion uniforme de 4 bits del mismo modelo base:

| Metrica | 4 bits uniforme | OptiQ 4/8 bits |
|---|---:|---:|
| MMLU (5-shot, 969 muestras) | 54,0 % | 55,3 % |
| GSM8K (1000 muestras) | 65,1 % | 69,8 % |
| IFEval (conjunto completo, estricto) | 71,5 % | 74,7 % |
| BFCL-V3 simple (200 llamadas) | 48,5 % | 41,5 % |
| HumanEval (164 problemas, pass@1) | 32,9 % | 50,6 % |
| HashHop (recuperacion en contexto largo) | 17,0 % | 23,0 % |
| Capability Score (media de 6) | 48,17 | 52,48 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base sin cuantizar ni frente a otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 1,9 GB en disco (0,80 GB de lenguaje + 1,10 GB de vision); en ejecucion hay que sumar la KV cache, configurable en 4/8 bits mediante `kv_config.json`.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no esta pensado para GPUs NVIDIA o AMD.
- Cabe en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; el margen es amplio dado el tamano del modelo.
- Despliegue: `mlx-optiq>=0.5.25` (obligatorio, ya que `mlx-lm` estandar no reconoce la arquitectura `minicpmv4_7`), con `optiq serve` para endpoint compatible con OpenAI y Anthropic, o carga directa con `mlx_lm.load` tras `import optiq`.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual, al depender del runtime MLX y de la arquitectura registrada por optiq.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-OptiQ-4bit (este) | 1,006 B | 262k | Apache 2.0 | MLX (optiq) | Cuantizacion mixta 4/8 bits, vision en bf16 |
| openbmb/MiniCPM-V-4.7-1B (base) | 1,006 B | 262k | Apache 2.0 | safetensors (PyTorch) | Modelo original sin cuantizar; referencia de calidad |
| Cuantizacion uniforme de 4 bits del mismo base | 1,006 B | 262k | Apache 2.0 | MLX | Capability Score 48,17 frente a 52,48 de OptiQ |

No se dispone de datos en la informacion proporcionada para comparar con otros modelos vision-lenguaje de tamano similar (por ejemplo, variantes de Qwen-VL o PaliGemma) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La cuantizacion degrada el function calling: BFCL-V3 baja de 48,5 a 41,5, con perdidas concentradas en llamadas que el modelo deja de emitir.
- La recuperacion en contexto largo es debil en terminos absolutos: HashHop se situa en 23,0 %, muy lejos de una utilizacion fiable de los 262k tokens en tareas de retrieval.
- El modelo base es de 1B parametros, por lo que su razonamiento complejo, matematicas avanzadas y codigo de produccion son limitados incluso sin cuantizar.
- Riesgo de alucinacion inherente a modelos pequenos, especialmente en preguntas abiertas y en descripcion de imagenes ambiguas.
- Idiomas soportados no documentados; no se garantiza un rendimiento equilibrado fuera del ingles y el chino.
- Dependencia estricta de `mlx-optiq>=0.5.25` y de Apple Silicon: no es desplegable en infraestructura NVIDIA, AMD ni en CPU convencional.
- La etiqueta "4bit" designa la familia de cuantizacion, no una media ponderada real; la mezcla efectiva es 4/8 bits.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento del modelo en el dominio concreto antes de llevarlo a produccion.

## Enlaces

- [Hugging Face: mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit](https://huggingface.co/mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit)
- [Modelo base: openbmb/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B)
- [Sitio del proyecto mlx-optiq](https://mlx-optiq.com/)
- [Guia de la familia MiniCPM en mlx-optiq](https://mlx-optiq.com/docs/minicpm)
- [Todos los quants OptiQ](https://mlx-optiq.com/models)
- [Documentacion de mlx-optiq](https://mlx-optiq.com/docs/)
