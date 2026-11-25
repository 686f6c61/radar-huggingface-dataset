# blearyhope/Ternary-Bonsai-2.5-27B-mlx-2bit

## Resumen

Ternary Bonsai 2.5 27B para MLX es un empaquetado de cuantizacion agresiva (2 bits, ternario, con grupos de 128) del modelo multimodal Qwen3.8-27B, adaptado especificamente para Apple Silicon mediante la libreria MLX. Lo publica el usuario `blearyhope` bajo licencia Apache 2.0, e incluye tanto los pesos del modelo de lenguaje cuantizados a 2 bits como una torre de vision en FP16, lo que permite entrada de texto e imagen (pipeline `image-text-to-text`).

El modelo base declarado es `Qwen/Qwen3.8-27B`, con 27.359.638.768 parametros totales segun los safetensors del repositorio. El pack ocupa 8,9 GB, un tamano muy contenido para un modelo de 27B, consecuencia directa de la cuantizacion ternaria. Incorpora ademas una cabeza MTP (multi-token prediction) opcional de version 2 para decodificacion especulativa, pensada para acelerar la generacion en hardware Apple.

Su relevancia radica en demostrar que un modelo de 27B con capacidades de vision puede ejecutarse en equipos Apple Silicon con memoria unificada moderada, aplicando transformadas de Hadamard con signo durante la carga para preservar la calidad tras la cuantizacion ternaria. Es un artefacto experimental y de nicho: no hay datos publicados de benchmarks ni metricas de rendimiento medidas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de vision FP16); detalles internos no disponibles |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario, group-128, con transformadas de Hadamard con signo; torre de vision en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX); existe companion en GGUF |
| Tamano del repositorio | 8,9 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Hardware objetivo | Apple Silicon (macOS) |
| Cabeza MTP | opcional, v2, `mtp/mtp-v2-head.safetensors` |

## Arquitectura y entrenamiento

El pack no documenta el entrenamiento del modelo base; se limita a la conversion y empaquetado del Qwen3.8-27B original. La innovacion tecnica principal es el esquema de cuantizacion: pesos ternarios a 2 bits con agrupacion cada 128 elementos y transformadas de Hadamard con signo aplicadas por el cargador incluido (`runtime/`). Estas transformadas son necesarias para que los pesos del modelo de lenguaje se carguen correctamente segun el autor.

La torre de vision se mantiene en FP16, de modo que la parte visual no sufre la perdida de precision de la cuantizacion ternaria. El pack incluye una cabeza MTP v2 opcional que comparte el embedding y la proyeccion de salida del modelo objetivo, y que se usa como modelo borrador en decodificacion especulativa con `draft_block_size=2`. El manifiesto `mtp/head-manifest.json` registra la revision del GGUF de origen y el SHA-256 del sidecar como verificacion.

No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre etapas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas.
- Razonamiento aritmetico basico (el autor valida con una prueba de aritmetica de texto).
- Entrada de imagen y texto (`image-text-to-text`): descripcion de imagenes y distincion de contenido visual (validado con imagenes roja y azul).
- Modo thinking controlable mediante `enable_thinking` en la plantilla de chat (desactivado en los ejemplos del autor).
- Decodificacion especulativa opcional mediante la cabeza MTP v2, con preservacion de los tokens de salida greedy en las pruebas del autor.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el pack esta disenado para ejecutarse con MLX en equipos de memoria unificada, permitiendo usar un modelo de 27B con vision en local sin GPU dedicada, gracias a los 8,9 GB del repositorio.
- Descripcion y analisis de imagenes en local: la torre de vision en FP16 permite tareas de image captioning o VQA ejecutadas integramente en el dispositivo, sin enviar imagenes a servicios externos.
- Prototipado de asistentes multimodales: util para experimentar con pipelines texto+imagen en macOS antes de migrar a despliegues en servidor.
- Evaluacion de cuantizacion ternaria: sirve como banco de pruebas para estudiar la degradacion de calidad de un modelo de 27B a 2 bits con group-128 en tareas de texto y vision.
- Aceleracion con decodificacion especulativa: la cabeza MTP v2 permite experimentar con generacion especulativa en MLX y medir su impacto (el autor aun no ha medido throughput).
- Despliegue en entornos con restricciones de memoria: para aplicaciones donde 8,9 GB de pesos encajan pero un modelo de 27B en FP16 o BF16 no cabria.
- Uso como base para conversiones a otros formatos: existe un companion GGUF para llama.cpp, lo que facilita llevar el modelo a otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta validaciones cualitativas: una prueba de aritmetica de texto superada y la distincion correcta de imagenes roja y azul en Apple Silicon. Respecto al MTP, indica que la decodificacion especulativa preservo los tokens greedy en un prompt de texto y en un prompt con imagen roja, pero que el throughput esta pendiente de medir.

## Requisitos de hardware

- VRAM / memoria: los pesos ocupan 8,9 GB; se necesita memoria unificada suficiente para pesos, torre de vision FP16, cache KV y overhead del runtime. El autor no publica cifras exactas de memoria total requerida.
- Hardware objetivo: Apple Silicon (macOS). No se menciona soporte para GPU NVIDIA ni CUDA.
- GPU consumer: no aplica en el sentido habitual; el modelo esta pensado para memoria unificada de Mac. No se especifican modelos concretos de Mac ni cantidad minima de RAM.
- Despliegue: MLX con `mlx_vlm` y el cargador incluido en `runtime/`; requiere Python 3 y las dependencias de `runtime/requirements.txt`. Existe un companion GGUF para llama.cpp y otros empaquetados.
- Latencia y throughput: no disponibles; el autor declara explicitamente que el throughput del MTP aun no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B MLX (este) | 27,36B | no disponible | 2 bits ternario group-128 + vision FP16 | Apache 2.0 | Hugging Face, MLX; companion GGUF |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | pesos originales (no indicado) | no disponible en esta ficha | Hugging Face |
| Companion GGUF de Bonsai 2.5 27B | 27,36B | no disponible | GGUF (esquema no detallado) | Apache 2.0 (segun pack MLX) | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion ternaria a 2 bits: es una compresion muy agresiva; cabe esperar degradacion de calidad frente al modelo base, aunque el autor no publica metricas de perdida.
- Sin benchmarks: no hay evaluaciones estandar (MMLU, HumanEval, GSM8K, etc.) que permitan valorar el rendimiento real.
- Validacion limitada: las pruebas del autor se reducen a una operacion aritmetica y a distinguir dos colores en imagenes; no constituyen una evaluacion robusta.
- Throughput del MTP sin medir: el beneficio de la decodificacion especulativa no esta cuantificado.
- Dependencia del cargador incluido: los pesos requieren las transformadas de Hadamard con signo del runtime empaquetado; no son cargables con un cargador MLX generico sin ese paso.
- Plataforma restringida: orientado a Apple Silicon; no se documenta soporte CUDA.
- Idiomas y contexto no documentados: no se puede garantizar cobertura multilingue ni una ventana de contexto concreta.
- Autor y procedencia: publicado por un usuario individual (`blearyhope`), con 0 descargas y 0 likes en el momento de la consulta; no es un artefacto oficial del equipo de Qwen. Conviene verificar `NOTICE.txt` para la atribucion upstream.
- Licencia: Apache 2.0 segun el pack, pero la licencia del modelo base Qwen3.8-27B no se detalla en la informacion disponible; revisar antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/Ternary-Bonsai-2.5-27B-mlx-2bit
- Companion GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
