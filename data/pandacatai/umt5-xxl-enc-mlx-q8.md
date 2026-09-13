# PandacatAI/umt5-xxl-enc-mlx-q8

## Resumen

PandacatAI/umt5-xxl-enc-mlx-q8 es una versión cuantizada a 8 bits del codificador de texto umt5-xxl que emplean los modelos de generación de vídeo Wan 2.1/2.2 y la familia LingBot-World. No es un modelo generativo autónomo, sino un componente de infraestructura: convierte el prompt textual en embeddings que alimentan al difusor de vídeo. La aportación del autor es el port a Apple MLX con cuantización afín de 8 bits (group size 64), que sustituye el checkpoint PyTorch bf16 de 10,6 GiB por un safetensors de 5,62 GiB ejecutable en la GPU de Apple Silicon.

El modelo hereda la arquitectura del umt5 de Google (familia T5, encoder con sesgos de posición relativa) y conserva la licencia Apache-2.0. No ha habido fine-tuning ni entrenamiento adicional: el autor describe el resultado como una recodificación con pérdida del encoder bf16 original. En la práctica, el pico de memoria de la fase de codificación de texto en el pipeline LingBot-World-V2 baja de ~14 GB a ~8 GB y la codificación de un prompt tarda alrededor de 1 segundo en un M4 Pro.

Es relevante ahora porque permite ejecutar localmente en un Mac la parte de comprensión de texto de pipelines de generación de vídeo de gran tamaño, sin depender de CUDA ni de GPUs dedicadas. Su adopción es todavía muy baja (10 descargas, 0 likes) y está pensado para encajar en el fork MLX de LingBot-World-V2, no como herramienta general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Transformer tipo T5 (umt5-xxl) con sesgos de posición relativa |
| Parámetros totales | no disponible (el checkpoint bf16 de origen ocupa 10,6 GiB y el cuantizado 5,62 GiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en la configuración documentada |
| Tipos de cuantización | 8 bits afín, group size 64 (solo 8 bits; la variante de 4 bits se descartó) |
| Idiomas soportados | no disponible en la ficha (el umt5 de Google es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX: `weight` empaquetado en uint32 más `scales` y `biases`) |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia T5, concretamente el umt5-xxl de Google. Se compone de bloques Transformer con auto-atención y red feed-forward, sin decodificador, y usa sesgos de posición relativa en lugar de embeddings posicionales absolutos; las tablas de posición relativa se mantienen en bf16 incluso en la versión cuantizada. Cada capa lineal se almacena como `<nombre>.weight` (uint32 empaquetado) acompañada de `<nombre>.scales` y `<nombre>.biases`, que es la representación estándar de la cuantización afín de 8 bits con group size 64 en MLX.

No hay entrenamiento ni fine-tuning. El autor parte del checkpoint bf16 empaquetado por Wan-AI para Wan 2.1 (`models_t5_umt5-xxl-enc-bf16.pth`, Apache-2.0, 10,6 GiB, sha256 `7cace0da2b446bbbbc57d031ab6cf163a3d59b366da94e5afe36745b746fd81d`) y lo recodifica con la herramienta `tools/convert_t5_mlx.py`. La pérdida introducida es pequeña: el error L2 relativo de los embeddings ronda el 3 %, con una similitud coseno superior a 0,999, un valor que el autor equipara a la diferencia entre ejecutar PyTorch en MPS y en CPU, es decir, dentro del ruido del propio encoder bf16.

## Capacidades

- Extracción de características de texto: convierte prompts en embeddings que alimentan difusores de vídeo.
- Codificación multilingüe heredada del umt5, aunque no se documenta explícitamente en la ficha.
- Ejecución nativa en la GPU de Apple Silicon mediante MLX.
- Codificación de una secuencia de hasta 512 tokens en aproximadamente 1 segundo en un M4 Pro.
- No genera texto: no hay decodificador ni head de lenguaje.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No ofrece modo thinking, visión ni audio; sus capacidades son exclusivamente de entrada de texto.

## Casos de uso

- Generación de vídeo texto-a-vídeo local en Mac: el encoder transforma el prompt en embeddings para el difusor Wan 2.1/2.2 y permite ejecutar el pipeline completo en Apple Silicon sin GPU NVIDIA.
- Reducción de memoria en pipelines de vídeo: sustituye al encoder bf16 de 10,6 GiB y baja el pico de la fase de texto de ~14 GB a ~8 GB, lo que hace viable la inferencia en Macs con memoria unificada de 16-24 GB.
- Prototipado rápido en portátiles Apple: al codificar un prompt en ~1 segundo en un M4 Pro, acelera la iteración sobre prompts antes de lanzar la fase de difusión, mucho más costosa.
- Integración en el pipeline LingBot-World-V2 para Apple Silicon: el fork MPS detecta el encoder MLX de forma automática mediante la opción `--t5_backend auto`.
- Extracción de embeddings multilingües para búsqueda semántica o clustering de prompts: los embeddings pueden usarse como representación de texto en tareas de similitud, aprovechando la similitud coseno superior a 0,999 respecto al encoder bf16.
- Evaluación del impacto de la cuantización: sirve como referencia para medir la degradación (PSNR de 39 dB en el clip generado, error L2 relativo ~3 %) frente al original bf16.
- Investigación sobre text encoders en MLX: al mantener la estructura `<nombre>.weight`/`scales`/`biases`, es un ejemplo reutilizable para portar otros encoders T5 a MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible; el modelo es un encoder, no un generador, por lo que esas pruebas no aplican. La ficha sí reporta métricas de fidelidad frente al encoder bf16 de referencia:

| Métrica | Valor | Condiciones |
|---|---|---|
| Error L2 relativo de los embeddings | ~3 % | Tres prompts, secuencias de 512 tokens (torch-MPS vs torch-CPU también difiere ~3 %) |
| Similitud coseno | > 0,999 | Respecto al encoder bf16 |
| PSNR del clip generado | 39 dB | Misma semilla, MLX vs encoder torch, extremo a extremo |
| Error L2 relativo, variante 4 bits | 17-28 % | Descartada por el autor |

## Requisitos de hardware

- Pesos: 5,62 GiB en safetensors (frente a 10,6 GiB del checkpoint bf16 original).
- Pico de memoria de la fase de codificación de texto en LingBot-World-V2: ~8 GB (frente a ~14 GB con bf16).
- Plataforma: exclusivamente Apple Silicon; el autor reporta ~1 s por prompt en un M4 Pro.
- No es compatible con CUDA ni con GPUs NVIDIA; no cabe plantearlo en A100, H100 o RTX.
- Cabe en un Mac con memoria unificada de 16 GB o superior, aunque el resto del pipeline de vídeo exige bastante más memoria.
- Despliegue: MLX (`mlx.core.load`), el fork MPS de LingBot-World-V2 y el módulo `wan/modules/t5_mlx.py`.
- No compatible con vLLM, llama.cpp, Ollama o TGI, que esperan pesos GGUF o PyTorch/transformers.
- Latencia y throughput: ~1 s por prompt codificado en M4 Pro; no hay datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Precisión | Compatibilidad | Licencia |
|---|---|---|---|---|---|
| PandacatAI/umt5-xxl-enc-mlx-q8 | MLX safetensors | 5,62 GiB | 8 bits afín (group 64) | Apple Silicon | Apache-2.0 |
| models_t5_umt5-xxl-enc-bf16.pth (Wan-AI) | PyTorch `.pth` | 10,6 GiB | bf16 | CUDA / PyTorch | Apache-2.0 |
| Variante 4 bits del mismo encoder | MLX safetensors | no disponible | 4 bits | Apple Silicon | Apache-2.0 |
| google/umt5-xxl | PyTorch / safetensors | no disponible | fp32 / bf16 | CUDA / CPU | Apache-2.0 |

La variante de 4 bits se descartó por un error relativo del 17-28 %, frente al ~3 % de la de 8 bits, lo que la inutiliza para este pipeline. No se dispone de datos para comparar con otros text encoders de pipelines de vídeo (por ejemplo, los basados en t5-v1_1-xxl), por lo que la comparativa se limita a las variantes del mismo encoder.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings de entrada.
- La cuantización es con pérdida: introduce ~3 % de error L2 relativo, aunque el autor lo considera dentro del ruido del encoder bf16.
- No ha habido entrenamiento ni ajuste, por lo que no corrige sesgos del umt5 original; los sesgos inherentes al corpus de entrenamiento de Google se heredan sin cambios.
- El riesgo de alucinación no aplica directamente al encoder, pero cualquier sesgo o error de representación del texto puede propagarse al vídeo generado por el difusor.
- Longitud de contexto limitada a 512 tokens en la configuración documentada.
- Idiomas no documentados en la ficha, aunque el umt5 subyacente es multilingüe; el autor prueba con prompts en chino e inglés.
- Dependencia exclusiva de Apple Silicon y de MLX; no existe versión CUDA de esta cuantización.
- Adopción muy baja (10 descargas, 0 likes) y fecha de publicación reciente: ecosistema y soporte limitados.
- Uso comercial permitido bajo Apache-2.0, pero con obligación de mantener la atribución a Google (umt5-xxl) y al equipo de Wan al redistribuir.
- Se apoya en un fork externo (LingBot-World-V2 MPS) y en un módulo no incluido en este repositorio (`wan/modules/t5_mlx.py`); sin ese código hay que implementar la carga a mano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PandacatAI/umt5-xxl-enc-mlx-q8
- Encoder original: https://huggingface.co/google/umt5-xxl
- Checkpoint bf16 de Wan 2.1: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Fork Apple Silicon de LingBot-World-V2: https://huggingface.co/PandacatAI/lingbot-world-v2-mps
- Apple MLX: https://github.com/ml-explore/mlx
- La búsqueda web no devolvió resultados relevantes para este modelo; los únicos enlaces útiles son los anteriores.
