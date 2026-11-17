# goodmai/Ornith-1.5-9B-MACaQ-3bit-MLX

## Resumen

Ornith-1.5-9B-MACaQ-3bit-MLX es un checkpoint cuantizado a 3 bits del modelo Ornith-1.5-9B, publicado por el usuario goodmai para su ejecución nativa en Apple Silicon mediante MLX y la herramienta Basalt. El modelo base es `ornith-ai/Ornith-1.5-9B-MLX-4bit`, una variante ya cuantizada a 4 bits de la familia `qwen3_5`, orientada a generación de texto y conversación. La contribución de este repositorio no es un modelo nuevo, sino la aplicación del algoritmo MACaQ (Model Agnostic Calibrated Quantization, arXiv:2611.10649) para comprimir aún más los pesos manteniendo la calidad.

El interés técnico reside en la metodología de cuantización: MACaQ combina balance de canales, una rotación de bloque Hadamard de Sylvester y un refinamiento discreto de coordenadas guiado por la matriz Hessiana. Según las mediciones del autor en un Apple M4 Pro de 24 GB, el checkpoint resultante ocupa 4,20 GB y alcanza una perplejidad de 6,493 en una muestra retenida de 1025 tokens, frente a 8,096 de la cuantización RTN a 3 bits y 6,125 del modelo base de 4 bits.

El modelo está pensado exclusivamente para inferencia en hardware Apple (Metal/MLX) y no para GPUs NVIDIA ni para despliegues en servidores tradicionales. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la información disponible sobre idiomas, contexto y datos de entrenamiento del modelo base es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia `qwen3_5` (texto) |
| Parametros totales | 7.226.831.360 (dato real de safetensors) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MACaQ 3-bit affine, group_size=64 (canal-balance alpha=0,75, Hadamard B=64, refinamiento Hessiano) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia `qwen3_5`, un transformer de texto de aproximadamente 7,2 mil millones de parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El checkpoint aquí descrito no ha sido reentrenado: es el resultado de aplicar un post-procesado de cuantización sobre `ornith-ai/Ornith-1.5-9B-MLX-4bit`.

La innovación técnica es el algoritmo MACaQ, implementado en Swift/Metal dentro de Basalt. El proceso consta de tres fases: (1) balance de canales con exponente 0,75 sobre la desviación típica de pesos y 0,25 sobre el RMS de activaciones para igualar rangos dinámicos; (2) rotación mediante una matriz de Walsh-Hadamard de Sylvester de bloque 64; y (3) refinamiento de coordenadas discreto sobre una rejilla ±1 que minimiza la traza de ΔW·H'·ΔW^T usando la Hessiana. El autor reporta 200 capas procesadas, 181.861.681 cambios de código y una reducción del 39,7 % en la pérdida Hessiana. La conversión completa tardó 986 segundos en un M4 Pro de 24 GB.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado `text-generation`.
- Razonamiento y respuesta a instrucciones heredadas del modelo base `qwen3_5`.
- Ejecución nativa en Apple Silicon mediante Metal y MLX, con kernels Walsh-Hadamard de un solo simdgroup sin barreras.
- Servido de API compatible con OpenAI y MCP a través de `basalt serve`.
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Prototipado local en Mac: desarrolladores que quieran probar un modelo de ~7B parámetros en un Mac con 24 GB de memoria unificada sin depender de la nube, usando `basalt serve` para exponer una API compatible con OpenAI.
- Asistentes de escritorio offline: integración en aplicaciones macOS que requieran generación de texto sin conexión, aprovechando el consumo de memoria activa medido de aproximadamente 3.982 MB.
- Investigación en cuantización: comparación de la degradación de perplejidad entre RTN a 3 bits (8,096) y MACaQ a 3 bits (6,493) sobre el mismo modelo base, útil para estudiar técnicas de compresión calibrada.
- Generación de documentación técnica: el ejemplo de salida del autor muestra texto estructurado en Markdown sobre modelos open source, adecuado para borradores de artículos o READMEs.
- Evaluación de pipelines MLX: banco de pruebas para medir throughput (53,8 tok/s de media) y TTFT (0,134 s de media) en hardware Apple antes de desplegar variantes mayores.
- Educación y demos: ejecución en espacios de Hugging Face o demos locales mediante el enlace "Run with Basalt" para mostrar técnicas de cuantización avanzada sin infraestructura GPU.

## Benchmarks y rendimiento

| Metrica | Base 4-bit | RTN 3-bit | MACaQ 3-bit |
|---|---:|---:|---:|
| Tamano del checkpoint | 4,69 GB | 3,58 GB | 4,20 GB |
| Perplejidad (1025 tokens retenidos) | 6,125 | 8,096 | 6,493 |
| Throughput (tok/s) | No disponible | No disponible | 53,8 (media, M4 Pro 24 GB) |
| TTFT (s) | No disponible | No disponible | 0,134 (media) |
| Memoria activa | No disponible | No disponible | ~3.982 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 4,2 GB para los pesos y aproximadamente 3.982 MB de memoria activa medida durante la generación.
- Hardware objetivo: Apple Silicon con Metal (probado en M4 Pro de 24 GB). No está pensado para GPUs NVIDIA.
- Cabe en Macs consumer con memoria unificada de 16 GB o superior, aunque el autor solo reporta mediciones en 24 GB.
- Despliegue: Basalt (`basalt serve`, `basalt models inspect`), librería MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 53,8 tok/s de media (σ=0,096) y TTFT de 0,134 s de media (σ=0,004) en M4 Pro 24 GB con 80 tokens de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MACaQ-3bit-MLX | 7,23 B | No disponible | 6,493 | Apache 2.0 | MLX / Apple Silicon |
| Ornith-1.5-9B-MLX-4bit (base) | 7,23 B | No disponible | 6,125 | Apache 2.0 (heredada) | MLX / Apple Silicon |
| Ornith-1.5-9B RTN 3-bit (referencia) | 7,23 B | No disponible | 8,096 | Apache 2.0 | MLX / Apple Silicon |

No se dispone de información sobre otros modelos comparables de la familia `qwen3_5` ni de alternativas cuantizadas a 3 bits con las que contrastar rendimiento en tareas estándar.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con Metal y MLX; no es portable a CUDA ni a CPU genérica sin conversión adicional.
- La perplejidad de 6,493 se midió sobre una muestra retenida de solo 1025 tokens, lo que limita la significación estadística del resultado.
- No hay datos publicados sobre sesgos, alucinación, idiomas soportados ni longitud de contexto del modelo base.
- El checkpoint es una cuantización de terceros (goodmai) sobre un modelo ya cuantizado a 4 bits, por lo que la degradación acumulada respecto al modelo original en precisión completa no está cuantificada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `ornith-ai/Ornith-1.5-9B-MLX-4bit` antes de un uso comercial en producción.
- El algoritmo MACaQ está descrito en un preprint (arXiv:2611.10649) y su implementación en Basalt es del propio autor del checkpoint, sin revisión por pares documentada.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Ornith-1.5-9B-MACaQ-3bit-MLX
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Paper MACaQ: https://arxiv.org/abs/2611.10649
- Repositorio Basalt: https://github.com/goodmai/basalt
- Web de Basalt: https://bas-alt.vercel.app
- Demo "Run with Basalt": https://huggingface.co/spaces/goodmai/run-with-basalt?model=goodmai%2FOrnith-1.5-9B-MACaQ-3bit-MLX
