# nace-ai/Qwen3.8-27B-MLX-4bit

## Resumen

Qwen3.8-27B-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Qwen3.8-27B, publicada por nace-ai para su uso con Kapitsa, un motor de inferencia local para Macs con Apple Silicon desarrollado por Nace.AI. El modelo base es Qwen/Qwen3.8-27B, un transformer multimodal de tipo image-text-to-text con 27.356.728.560 parámetros totales (unos 27,36 mil millones), según los pesos en safetensors del repositorio. La cuantización reduce el peso de descarga a 16,3 GB, lo que permite ejecutarlo en equipos con 48 GB de memoria unificada.

La relevancia de esta publicación no está en el modelo en sí, sino en la pila de optimización que lo acompaña: el autor reporta velocidades de escritura de 144 tok/s en un MacBook Pro M5 Max de 128 GB y 76,6 tok/s en un M5 Pro de 48 GB, con un pico de memoria de 20,8 GiB. Estas cifras se obtienen gracias a una cabeza MTP (multi-token prediction) y a la decodificación especulativa propia de Kapitsa, que según la model card multiplica por 4,2 la velocidad frente a la misma configuración sin drafting.

El modelo conserva la licencia Apache 2.0 del modelo base y se distribuye junto con variantes en 3, 4 y 8 bits MLX, además de cuantizaciones GGUF y NVFP4. Está pensado para desarrolladores que quieran ejecutar un modelo multimodal de 27B en local sobre Apple Silicon con latencias interactivas, sin depender de GPUs dedicadas ni de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag de modelo `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (esta variante); el autor publica tambien MLX 3-bit, MLX 8-bit, GGUF q2_k, q3_k_m, q4_k_m, q8_0 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx-4bit-mtp`); tambien GGUF y NVFP4 en repos separados |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentacion proporcionada. Los metadatos lo etiquetan como `qwen3_5` y el pipeline es `image-text-to-text`, lo que confirma que se trata de un modelo multimodal capaz de procesar imagenes y texto. El recuento de parametros (27,36B) corresponde a los pesos reales del repositorio en safetensors.

Respecto al proceso de cuantizacion, el autor indica que la variante 4-bit incorpora una cabeza MTP (multi-token prediction), que es la que habilita la decodificacion especulativa en Kapitsa. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones de atencion (lineal, sliding window, etc.) mas alla de lo que implica el tag `qwen3_5`.

## Capacidades

- Generacion de texto conversacional y respuestas multi-turno.
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`), lo que permite tareas de descripcion, extraccion de informacion y VQA.
- Generacion de codigo: la model card mide la velocidad de escritura con una respuesta de codigo de 512 tokens, lo que sugiere un uso previsto para tareas de programacion.
- Razonamiento matematico: se reporta una evaluacion en GSM8K con 100 preguntas.
- Integracion con el agente de codigo `opencode` a traves de Kapitsa (`kapitsa opencode`), lo que implica soporte para flujos de agente multi-paso.
- Servidor local con API HTTP en `http://127.0.0.1:8000` mediante `kapitsa serve`.
- Decodificacion especulativa acelerada por la cabeza MTP integrada en los pesos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en el agente `opencode` mediante `kapitsa opencode --model nace-ai/Qwen3.8-27B-MLX-4bit`, ofreciendo autocompletado y generacion de funciones en el propio Mac sin enviar codigo a la nube; los 144 tok/s medidos en M5 Max hacen viable la interaccion en tiempo real.
- Analisis de capturas y documentos escaneados: al ser un modelo image-text-to-text, puede recibir una imagen y un prompt de texto para extraer tablas, describir diagramas o resumir documentos, ejecutandose en local para datos sensibles.
- Prototipado de aplicaciones con API local: `kapitsa serve` expone un endpoint HTTP en el puerto 8000, lo que permite conectar el modelo a un frontend o a scripts de automatizacion sin coste por token.
- Razonamiento matematico asistido: con un 0,940 en GSM8K (n=100) igualando al modelo en bf16, es adecuado para resolver problemas aritmeticos de varios pasos en herramientas educativas o de validacion.
- Procesamiento por lotes en un solo equipo: con 20,8 GiB de pico de memoria en M5 Max, cabe holgadamente en 48 GB y permite mantener el servidor en marcha mientras se ejecutan otras tareas en el mismo Mac.
- Evaluacion comparativa de cuantizaciones: el autor publica variantes 3-bit, 4-bit, 8-bit, GGUF y NVFP4, lo que facilita medir el impacto de la precision en la calidad sobre el mismo modelo base antes de decidir el despliegue definitivo.
- Desarrollo offline en portatil: al ocupar 16,3 GB de descarga y caber en un M5 Pro de 48 GB, permite trabajar con un modelo de 27B en entornos sin conectividad.

## Benchmarks y rendimiento

| Test | Esta variante | Referencia | Veredicto |
|---|---:|---:|---|
| GSM8K (100 preguntas) | 0,940 (n=100) | bf16 0,940 (n=100) | Igual que bf16 |

Rendimiento de inferencia medido por el autor con Kapitsa:

| Mac | Chip | Memoria | Escritura (tok/s) | Lectura de prompt 4K (tok/s) | Memoria pico (GiB) |
|---|---|---:|---:|---:|---:|
| MacBook Pro | M5 Max | 128 GB | 144 | 1.126 | 20,8 |
| MacBook Pro | M5 Pro | 48 GB | 76,6 | 749 | 16,6 |

Comparativa de motores sobre el mismo modelo 4-bit en M5 Max:

| Motor | Version | Configuracion | Escritura (tok/s) | Relacion con Kapitsa |
|---|---|---|---:|---:|
| Kapitsa | `87d7dd5` | MLX 4-bit, cabeza MTP, KFlash | 144 | 1,0x |
| Ollama | 0.40.11 | MLX runner, 4-bit, MTP | 71,4 | 2,0x mas lento |
| MLX (mlx-vlm) | 0.7.10 | MLX 4-bit, MTP | 56,3 | 2,6x mas lento |
| llama.cpp | b11871 | GGUF Q4_K_M, MTP, n-max 3 | 47,6 | 3,0x mas lento |

En M5 Pro de 48 GB, Kapitsa con drafting desactivado rinde 18,2 tok/s frente a 76,6 tok/s con drafting activo, es decir, una aceleracion de 4,2x atribuida a la decodificacion especulativa. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada minima medida: 48 GB (MacBook Pro M5 Pro), con 16,6 GiB en uso.
- Memoria pico en M5 Max de 128 GB: 20,8 GiB.
- Tamano de descarga del repositorio: 16,3 GB para la variante `mlx-4bit-mtp`.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato MLX esta disenado para Apple Silicon. Para CUDA existe la variante NVFP4 de 20,6 GB, aunque no se detallan sus requisitos.
- Cabe en Macs consumer con Apple Silicon de 48 GB o mas; no se ha medido en equipos de 32 GB ni de 24 GB.
- Motores de despliegue: Kapitsa (recomendado por el autor, `brew install nace-ai/tap/kapitsa`), mlx-vlm, Ollama y llama.cpp (estos dos ultimos con las variantes GGUF correspondientes).
- Throughput medido: 144 tok/s de escritura y 1.126 tok/s de lectura de un prompt de 4K en M5 Max; 76,6 tok/s y 749 tok/s respectivamente en M5 Pro.
- Latencia: no se proporcionan cifras de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MLX-4bit (esta ficha) | 27,36B | no disponible | Si (image-text-to-text) | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3.8-27B (bf16, base) | 27,36B | no disponible | Si | Apache 2.0 | Hugging Face, safetensors |
| Qwen3.8-27B-MLX-3bit (mismo autor) | 27,36B | no disponible | Si | Apache 2.0 | Hugging Face, 12,9 GB |
| Qwen3.8-27B-MLX-8bit (mismo autor) | 27,36B | no disponible | Si | Apache 2.0 | Hugging Face, 29,8 GB |
| Qwen3.8-27B-GGUF q4_k_m (mismo autor) | 27,36B | no disponible | Si | Apache 2.0 | Hugging Face, 16,8 GB |

No se dispone de datos de benchmarks comparativos frente a otras familias de modelos (Llama, Mistral, Gemma) en la informacion proporcionada; la unica comparacion publicada es la de motores de inferencia recogida en la seccion anterior.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; no hay base para afirmar que el modelo sea seguro en dominios sensibles.
- Riesgo de alucinacion no cuantificado: el unico benchmark publicado es GSM8K con 100 preguntas, insuficiente para caracterizar la fiabilidad general.
- La evaluacion de calidad se limita a una muestra de 100 preguntas; el resto de capacidades (codigo, vision, multilingue) no tiene mediciones publicadas.
- El formato MLX esta atado a Apple Silicon; no es portable a GPUs NVIDIA o AMD sin recurrir a otras variantes (GGUF, NVFP4).
- Las cifras de velocidad dependen del prompt y de la version de Kapitsa (`87d7dd5` en M5 Max, `d132a2cc` en M5 Pro); no deben extrapolarse a otras builds ni a otros textos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B deberian verificarse directamente en su repositorio.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que impide garantizar el comportamiento en contextos largos o en castellano.
- La cabeza MTP y la decodificacion especulativa requieren un motor compatible (Kapitsa); otros runners pueden no aprovecharlas y ofrecer rendimientos muy inferiores, como muestran las cifras de Ollama, MLX y llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante MLX 3-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-3bit
- Variante MLX 8-bit: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-8bit
- Variantes GGUF: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF
- Variante NVFP4: https://huggingface.co/nace-ai/Qwen3.8-27B-NVFP4
- Motor Kapitsa (repositorio): https://github.com/nace-ai/kapitsa
- Sitio de Nace.AI: https://www.nace.ai/
