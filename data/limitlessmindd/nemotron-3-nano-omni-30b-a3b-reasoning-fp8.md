# LimitlessMindd/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8

## Resumen

NVIDIA Nemotron 3 Nano Omni es un modelo multimodal de gran tamano que unifica la comprension de video, audio, imagen y texto en un unico sistema, eliminando la necesidad de encadenar multiples modelos especializados en pipelines de agentes de IA. Desarrollado por NVIDIA como parte de la familia Nemotron, combina un backbone LLM hibrido Mamba2-Transformer MoE de 31B parametros totales con aproximadamente 3B parametros activos por token, lo que permite un alto rendimiento con coste computacional reducido. La version aqui descrita, publicada por LimitlessMindd, es una cuantizacion FP8 del modelo original BF16 de NVIDIA, que reduce el peso del repositorio a 35,2 GB.

El modelo integra tres componentes: el LLM Nemotron 3 Nano de 30B A3B, el encoder de vision CRADIO v4-H para imagenes y fotogramas de video, y el encoder de voz Parakeet para audio. Con una ventana de contexto de hasta 256k tokens, soporta entrada multimodal y genera salida de texto, incluyendo modo de razonamiento chain-of-thought, tool calling, salida JSON y transcripcion con marcas temporales a nivel de palabra. Su relevancia actual reside en que permite a los agentes de IA procesar contenido empresarial rico (reuniones, videos, documentos complejos) en una sola pasada, reduciendo latencia y perdida de contexto frente a arquitecturas con modelos separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer Hybrid Mixture of Experts (MoE) |
| Parametros totales | 31B (33.013.679.040 en safetensors, incluyendo encoders de vision y audio) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | FP8 (esta version), BF16, NVFP4 |
| Idiomas soportados | Ingles |
| Licencia | NVIDIA Open Model Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina tres redes en una arquitectura hibrida. El backbone es el LLM Nemotron 3 Nano de 30B A3B, que mezcla capas Mamba2 (state space model) con capas Transformer en configuracion MoE, activando solo los expertos necesarios para cada tarea y modalidad. El encoder de vision CRADIO v4-H procesa imagenes y fotogramas de video, mientras que el encoder de voz Parakeet convierte audio en representaciones para el LLM. Esta combinacion permite procesamiento any-to-any con salida de texto.

El entrenamiento utilizo el dataset nvidia/Nemotron-Image-Training-v3 e incorporo tecnicas de mejora de datos mediante otros modelos de referencia: Qwen3-VL-30B-A3B-Instruct, Qwen3.5-122B-A10B, Qwen3.5-397B-A17B, Qwen2.5-VL-72B-Instruct y gpt-oss-120b. Estos se emplearon para recaptionar imagenes y audio, generar pares pregunta-respuesta, producir cadenas de razonamiento para tareas complejas, parafrasear prompts y aplicar filtrado de calidad basado en modelos. El modelo incluye un modo de razonamiento activado por defecto, controlable mediante el parametro `enable_thinking`, con parametros recomendados de temperatura 0,6, top_p 0,95 y presupuesto de razonamiento de hasta 16384 tokens.

## Capacidades

- Comprension multimodal unificada: procesa video (mp4, hasta 2 minutos, muestreo de 1 FPS/128 fotogramas en 1080p o 2 FPS/256 fotogramas en 720p), audio (wav, mp3, hasta 1 hora, 8kHz o superior), imagenes RGB (jpeg, png) y texto en una sola pasada.
- Razonamiento con chain-of-thought: modo thinking activado por defecto, con presupuesto de razonamiento configurable y periodo de gracia de 1024 tokens.
- Transcripcion de voz (ASR): genera transcripciones con marcas temporales a nivel de palabra.
- OCR e inteligencia documental: extrae texto de imagenes, graficos, tablas y documentos complejos.
- Tool calling: soporta invocacion de funciones y herramientas externas para flujos agénticos.
- Salida JSON estructurada: permite generar respuestas en formato JSON para integracion con sistemas empresariales.
- Automatizacion de GUI: comprende interfaces graficas de usuario para agentes que interactuan con aplicaciones web y de escritorio.
- Analisis de video y audio: genera captions densos, resumenes y busqueda de contenido en material audiovisual.

## Casos de uso

- Verificacion de entregas en comercio electronico: el modelo analiza el video de una entrega y utiliza OCR para confirmar que el paquete llego a la direccion correcta, como en el caso de uso de DoorDash mencionado por NVIDIA.
- Verificacion de pedidos en drive-thru: procesa audio y video de la interaccion con el cliente para confirmar que el pedido es correcto antes de su preparacion.
- Inteligencia documental para asistentes de IA: extrae y resume informacion de contratos, acuerdos SOW/MSA, documentos cientificos y financieros, aprovechando la ventana de contexto de 256k tokens para documentos extensos.
- Analisis de contenido para medios y entretenimiento: genera captions densos, busqueda y resumen de videos, y analisis de discursos para produccion de contenido.
- Automatizacion de GUI para agentes: permite que agentes de IA interactuen con aplicaciones, gestionando incidencias, busquedas y correos electronicos mediante comprension de interfaces y tool calling.
- Transcripcion y resumen de reuniones: procesa grabaciones de reuniones (video y audio) para generar actas, resumenes y busqueda de momentos concretos con marcas temporales.
- Atencion al cliente multimodal: gestiona consultas que combinan imagen, audio y texto en un unico flujo conversacional, reduciendo la latencia frente a sistemas con multiples modelos encadenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: minimo 48 GB (GPU L40S); el repositorio ocupa 35,2 GB en disco.
- GPU recomendadas para FP8: 1x L40S 48GB como minimo; 1x RTX Pro 6000 o 1x B200 recomendadas.
- Para BF16: minimo 1x H100 80GB en una sola GPU; 1x B200 o 1x H200 recomendadas.
- Para NVFP4: minimo 1x RTX 5090 32GB; tambien compatible con DGX Spark y Jetson Thor.
- Opciones de despliegue: NVIDIA NIM, transformers con custom code (requiere codigo personalizado), y versiones GGUF publicadas por unsloth para ejecucion con llama.cpp y Ollama.
- La arquitectura MoE con ~3B parametros activos permite un throughput elevado en tareas multimodales, aunque no se han publicado cifras exactas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Nemotron 3 Nano Omni 30B A3B | 31B total, ~3B activos | 256k | Video, audio, imagen, texto | NVIDIA Open Model Agreement |
| Qwen3-VL-30B-A3B-Instruct | 30B total, ~3B activos | no disponible | Imagen, video, texto | Apache 2.0 |
| Qwen2.5-VL-72B-Instruct | 72B | no disponible | Imagen, video, texto | Apache 2.0 |

Nota: Qwen3-VL-30B-A3B-Instruct y Qwen2.5-VL-72B-Instruct se utilizaron como modelos de referencia para mejorar los datos de entrenamiento de Nemotron 3 Nano Omni. No se dispone de datos de rendimiento comparativos publicados entre estos modelos.

## Limitaciones y advertencias

- Soporte de idiomas limitado al ingles: el modelo no esta entrenado para otros idiomas, lo que restringe su uso en entornos multilingues.
- Licencia NVIDIA Open Model Agreement: aunque permite uso comercial, tiene condiciones especificas que deben revisarse antes del despliegue en produccion.
- Riesgo de alucinacion: como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de video: acepta videos de hasta 2 minutos, con muestreo de 1 FPS en resolucion 1080p, lo que puede perder detalles en secuencias rapidas o movimientos bruscos.
- Requisitos de hardware elevados: incluso en FP8, se necesita una GPU con al menos 48 GB de VRAM, lo que excluye la mayoria de GPUs de consumo.
- Esta version FP8 es una cuantizacion publicada por un tercero (LimitlessMindd), no por NVIDIA; conviene verificar la integridad de los pesos antes de usarla en produccion.
- Requiere custom code en transformers: el modelo necesita codigo personalizado para su ejecucion, lo que puede complicar su integracion en entornos estandar.

## Enlaces

- Repositorio HuggingFace (version FP8): https://huggingface.co/LimitlessMindd/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Version NVFP4: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
- Version GGUF (unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Pagina NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
- Blog de NVIDIA sobre el modelo: https://
