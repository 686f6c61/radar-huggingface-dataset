# CrowdMind/SWAT-D12

## Resumen

SWAT-D12 es un modelo de chat en inglés de 287.754.722 parámetros (aproximadamente 288M) desarrollado por CrowdMind, construido sobre una arquitectura de transformer recurrente ("looped transformer") derivada del proyecto NanoChat de Andrej Karpathy y denominada internamente Blueberry. El modelo se distribuye junto con su tokenizador y una aplicación de chat portable que permite ejecución local en navegador, terminal o desde Python, sin depender de servicios en la nube.

El modelo parte de un preentrenamiento sobre el dataset ClimbMix (400B tokens barajados), seguido de un preentrenamiento continuado sobre el dataset propio Pretrain Nemo y un ajuste fino supervisado (SFT) para chat con smol-smoltalk, MMLU y GSM8K. La versión publicada corresponde al paso 1.867 del SFT. Su ventana de contexto es de 2.048 tokens y su vocabulario de 32.768 entradas.

La relevancia de SWAT-D12 reside en su enfoque experimental: demuestra que un modelo de menos de 300M de parámetros con una arquitectura recurrente (12 bloques distintos ejecutados en 24 pasadas) puede ejecutarse íntegramente en local, incluso en CPU, con un paquete de 0,8 GB. No obstante, sus propios resultados de evaluación (HumanEval del 12,20%, ChatCORE de 0,0580) lo sitúan claramente en la categoría de modelo de investigación y experimentación, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente ("looped transformer") derivado de NanoChat (Blueberry) |
| Parametros totales | 287.754.722 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos PyTorch; el runtime incluido gestiona la inferencia) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible para los pesos; el código de la app incluida es MIT |
| Formato de pesos | PyTorch (checkpoint bajo `chat/models/d12-20261126/`) |

Otros datos técnicos declarados por el autor: 12 bloques de transformer distintos (3 de preludio, 6 recurrentes, 3 de coda), 3 pasadas recurrentes para un total de 24 ejecuciones de bloque, rango de mensaje entre pasadas de 64, anchura oculta de 768 y anchura intermedia SwiGLU de 2.048, vocabulario de 32.768 tokens.

## Arquitectura y entrenamiento

SWAT-D12 emplea un transformer recurrente en el que un conjunto reducido de bloques (12 distintos) se reutiliza mediante pasadas repetidas: 3 bloques de preludio, 6 bloques recurrentes ejecutados en 3 pasadas y 3 bloques de coda, lo que da 24 ejecuciones de bloque en total. Entre pasadas se transmite información mediante un mecanismo de "cross-pass message" de rango 64. Esta compartición de parámetros reduce el recuento total a unos 288M de parámetros manteniendo una profundidad efectiva mayor, un patrón habitual en propuestas de transformers recurrentes orientadas a eficiencia.

El entrenamiento se realizó en tres fases: preentrenamiento sobre ClimbMix (karpathy/climbmix-400b-shuffle), preentrenamiento continuado desde el checkpoint final de ClimbMix sobre CrowdMind/pretrain-nemo con el mismo tokenizador (hasta el paso 3.405) y ajuste fino supervisado para chat con smol-smoltalk, MMLU y GSM8K (checkpoint publicado en el paso 1.867). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés, con formato de mensajes por roles (sistema/usuario/asistente) gestionado por el runtime incluido.
- Razonamiento básico y respuesta a preguntas, con calidad limitada por su tamaño (288M de parámetros).
- Generación de código elemental: el autor reporta 20/164 en HumanEval (12,20%), lo que indica capacidad incipiente pero poco fiable.
- Aritmética y problemas matemáticos sencillos, tras el ajuste fino con GSM8K.
- Ejecución local y offline: inferencia en CPU o GPU mediante el runtime propio incluido en el repositorio.
- Interfaz de chat en navegador (servidor local en 127.0.0.1:8765), CLI de un solo prompt y API de Python (`ChatModel.respond`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Experimentación con arquitecturas recurrentes: SWAT-D12 sirve como banco de pruebas reproducible para estudiar transformers con bloques compartidos y pasadas recurrentes, gracias a que todo el código de inferencia y los pesos caben en 0,8 GB.
- Docencia y formación en IA: permite a estudiantes ejecutar un modelo de chat completo en un portátil sin GPU, inspeccionar el tokenizador y modificar el runtime incluido.
- Prototipado de interfaces de chat locales: la app incluida (navegador, CLI y Python) acelera la creación de demos offline de asistentes conversacionales en inglés.
- Pruebas de despliegue en entornos sin conectividad: al funcionar offline tras la instalación, es adecuado para validar flujos de inferencia en máquinas aisladas o con CPU únicamente.
- Evaluación comparativa de modelos pequeños: su conjunto de métricas declaradas (bits por byte, ChatCORE, HumanEval) permite usarlo como línea base en estudios sobre eficiencia de parámetros.
- Generación de texto de baja exigencia en inglés: borradores, resúmenes cortos o respuestas conversacionales simples dentro de su ventana de 2.048 tokens, siempre con verificación humana.
- Investigación sobre ajuste fino SFT: el autor documenta la receta (ClimbMix → Pretrain Nemo → smol-smoltalk/MMLU/GSM8K), lo que facilita reproducir y extender el pipeline.

## Benchmarks y rendimiento

| Evaluación (de esta ejecución) | Resultado |
|---|---:|
| Validación de preentrenamiento continuado en Pretrain Nemo (held-out) | 0,3936 bits por byte |
| Validación final del ajuste fino de chat | 0,3498 bits por byte |
| ChatCORE final | 0,0580 |
| HumanEval | 20/164 (12,20%) |

No se han publicado en la información disponible resultados de MMLU, GSM8K ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 288M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,15 GB; en fp16/bf16 unos 0,58 GB. El repositorio completo pesa 0,8 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Inferencia en CPU viable: el launcher admite `--cpu` para forzar CPU; el modelo está pensado para ejecución local incluso sin GPU.
- Despliegue: el autor proporciona un runtime propio dentro de la app (`launch.py`, `runtime.inference.ChatModel`) y soporte para PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es personalizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| SWAT-D12 | 287,7M | 2.048 | Pesos: no disponible; app: MIT | Transformer recurrente experimental, solo inglés |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8.192 | Apache 2.0 | Transformer estándar, multilingüe parcial, muy usado como base pequeña |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Transformer estándar, multilingüe, con tool calling documentado |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | Transformer estándar, solo inglés en la práctica |

Los datos de los modelos alternativos corresponden a conocimiento general de sus fichas públicas; no se dispone de comparaciones de rendimiento directas con SWAT-D12 en la información proporcionada. En términos de contexto y licencia, los alternativos ofrecen ventajas claras; SWAT-D12 aporta únicamente su enfoque arquitectónico recurrente y su empaquetado de ejecución local.

## Limitaciones y advertencias

- Calidad limitada: el propio autor advierte que el modelo puede generar hechos incorrectos, código defectuoso y respuestas inconsistentes; hay que verificar las salidas antes de confiar en ellas.
- Riesgo de alucinación elevado, esperable en un modelo de 288M de parámetros con un ajuste fino ligero.
- Solo inglés: no se declara soporte de otros idiomas, incluido el castellano.
- Ventana de contexto corta (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Licencia de los pesos no disponible: no puede asumirse uso comercial; solo el código de la app incluida está cubierto por MIT. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Arquitectura personalizada: no es compatible con los runtimes estándar (vLLM, llama.cpp, TGI), lo que limita el despliegue escalable y obliga a usar el runtime incluido.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; sin validación externa de la comunidad.
- Sin datos publicados sobre sesgos, filtrado de datos ni evaluaciones de seguridad.
- El repositorio y la model card están fechados en noviembre de 2026; conviene comprobar si hay actualizaciones o correcciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrowdMind/SWAT-D12
- Dataset de preentrenamiento ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset de preentrenamiento continuado: https://huggingface.co/datasets/CrowdMind/pretrain-nemo
- Dataset de ajuste fino de chat: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Guía de la app incluida: `chat/README.md` dentro del repositorio
- Licencia MIT de la app: `chat/LICENSE` dentro del repositorio
