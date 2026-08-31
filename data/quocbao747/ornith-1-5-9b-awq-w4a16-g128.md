# quocbao747/Ornith-1.5-9B-AWQ-W4A16-g128

## Resumen

Ornith-1.5-9B-AWQ-W4A16-g128 es una cuantización de 4 bits del modelo Ornith-1.5-9B, desarrollado por ornith-ai, que forma parte de la familia Ornith-1.5 centrada en el auto-mejoramiento (self-improvement) y el razonamiento agéntico. Esta versión cuantizada, creada por quocbao747, reduce el peso del modelo de 19 GB en bf16 a 8,1 GB, lo que permite ejecutarlo en una GPU Turing de 16 GB (como la T4) mediante vLLM, manteniendo la entrada de imágenes y el razonamiento con bloque de pensamiento.

El modelo base Ornith-1.5-9B es un modelo de razonamiento multimodal (imagen-texto) con una arquitectura basada en Qwen3.5, que incluye una torre de visión, un bloque de razonamiento explícito y soporte para tool calling. La cuantización AWQ utiliza el formato compressed-tensors con esquema W4A16 (pesos de 4 bits, activaciones en fp16) y grupo de tamaño 128, calibrado con tokens destilados de un modelo de razonamiento Qwen3.8-Flash-Next. El resultado es un modelo compacto y desplegable en hardware de gama media, pensado para entornos de producción con restricciones de VRAM.

La relevancia de esta ficha radica en que ofrece una opción práctica para ejecutar un modelo de razonamiento multimodal de 9B en GPUs de consumo o de centro de datos modestas, con un rendimiento de inferencia documentado en T4 y una licencia MIT que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5, multimodal (vision + texto), con capas gated-delta-net |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Nativo: 262.144; en esta cuantizacion con T4: 32.768 (configuracion recomendada) |
| Tipos de cuantizacion | AWQ 4-bit (W4A16, asimetrico, grupo 128), formato compressed-tensors |
| Idiomas soportados | No disponible (probablemente multilingue por su base Qwen3.5, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura transformer multimodal derivada de Qwen3.5, con una torre de visión para procesar imágenes y un bloque de razonamiento que genera cadenas de pensamiento antes de la respuesta final. Incluye capas denominadas gated-delta-net, que son proyecciones especiales dentro del modelo de lenguaje, y un vocabulario amplio de aproximadamente 248.000 tokens, lo que explica que la cabeza de salida y los embeddings se mantengan en fp16 en la cuantizacion (cada uno ronda los mil millones de parametros).

El entrenamiento del modelo base sigue el enfoque de auto-mejoramiento de Ornith-1.5: el modelo propone tareas, genera scaffolds especificos y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de mejora. La cuantizacion AWQ se realizo con llm-compressor 0.13.0, calibrando con 108.781 tokens destilados de un modelo de razonamiento Qwen3.8-Flash-Next, organizados en 53 secuencias de 2048 tokens con el chat template del propio modelo, incluyendo bloques de razonamiento. Se cuantizaron 248 capas lineales del modelo de lenguaje, dejando en precision completa la torre de vision, la cabeza de salida y los embeddings.

## Capacidades

- Razonamiento con cadena de pensamiento explicita: el modelo abre la respuesta con un bloque de pensamiento antes de la respuesta final, activable mediante un parser de razonamiento en vLLM.
- Procesamiento multimodal: acepta entrada de imagenes y texto (pipeline image-text-to-text), manteniendo la funcionalidad de vision tras la cuantizacion.
- Tool calling / function calling: soporta bloques `<tool_call>` que se pueden extraer como llamadas a herramientas estilo OpenAI.
- Generacion de codigo y tareas de programacion: orientado a codificacion agente, con capacidad para depuracion, SQL, algoritmos y sistemas.
- Razonamiento matematico y logico: incluye capacidades de calculo y resolucion de problemas.
- Multilingue: no confirmado oficialmente, pero por su base Qwen3.5 es probable que soporte multiples idiomas.
- Conversacion multi-turno: disenado para dialogos con contexto largo (hasta 32.768 tokens en esta cuantizacion).

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en entornos de desarrollo como autocompletado o agente de codigo, aprovechando su razonamiento explicito y tool calling para depurar, generar funciones y refactorizar. Su tamano compacto permite desplegarlo en GPUs de 16 GB.
- Atencion al cliente automatizada con contexto largo: con 32.768 tokens de contexto, puede gestionar conversaciones multi-turno extensas, manteniendo el historial y el estado del usuario, y derivando a herramientas externas cuando es necesario.
- Analisis de imagenes y documentos: al ser multimodal, puede describir imagenes, extraer informacion de capturas o diagramas, y combinar esa informacion con razonamiento textual para tareas como QA visual.
- Agentes autonomos con planificacion: su capacidad de razonamiento multi-paso y tool calling lo hace adecuado para agentes que deben planificar, ejecutar acciones y evaluar resultados, por ejemplo en automatizacion de tareas de oficina o web.
- Educacion y tutoria: puede explicar conceptos paso a paso, resolver problemas matematicos y ofrecer retroalimentacion razonada, gracias a su bloque de pensamiento y su entrenamiento en razonamiento.
- Prototipado rapido en entornos con recursos limitados: al caber en una T4 de 16 GB, es util para equipos que necesitan un modelo de razonamiento multimodal sin acceso a GPUs de alta gama, por ejemplo en entornos de desarrollo o pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la precision no ha sido evaluada ("Accuracy not benchmarked") y que la validacion fue funcional (generacion, streaming, aritmetica, descripcion de imagenes). No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K u otros.

Sin embargo, se documenta el rendimiento de inferencia en una Tesla T4 (15,4 GB) con vLLM, que se resume a continuacion:

| Prompt (tokens) | Decode tokens/s (conc 1) | Decode tokens/s (conc 4) | TTFT mediana (ms, conc 1) |
|---|---:|---:|---:|
| 128 | 34,2 | 31,6 | 167 |
| 512 | 33,5 | 28,5 | 555 |
| 2048 | 32,6 | 17,2 | 2537 |
| 8192 | 27,9 | 6,1 | 15029 |
| 16384 | 23,7 | 5,7 | 43188 |

El rendimiento agregado alcanza 188 tokens/s con prompts cortos y concurrencia 8, pero decae notablemente con prompts largos debido a la limitacion de prefill en T4.

## Requisitos de hardware

- VRAM estimada: 8,1 GB para pesos (fp16 en embeddings y cabeza), mas 3,93 GiB de cache KV para 32.768 tokens de contexto, totalizando unos 12 GB en T4.
- GPU recomendadas: Tesla T4 (16 GB) como minimo, con compute capability 7.5 (Turing). GPUs Ampere o mas nuevas (A10, A100, RTX 3090, RTX 4090) son el objetivo comodo.
- No compatible con Volta (V100): la falta de soporte de GPU en vLLM y PyTorch actuales impide su ejecucion.
- Opciones de despliegue: vLLM es la unica via documentada. Se requieren ajustes especificos: fp16 (no bf16), desactivar el perfilado de memoria multimodal, activar el parser de razonamiento Qwen3 y fijar contexto a 32.768.
- Latencia y throughput: en T4, entre 23 y 34 tokens/s por stream con prompts cortos, y TTFT desde 167 ms (prompt 128) hasta 43 s (prompt 16k). El primer arranque autotune kernels Triton durante varios minutos.

## Comparativa con modelos similares

No se dispone de datos de comparativa con otros modelos en la informacion proporcionada. Como referencia cualitativa, Ornith-1.5-9B se posiciona en la categoria de modelos de razonamiento multimodal de ~9B, similar a Qwen3-8B o Llama-3.1-8B, pero con un enfasis en auto-mejoramiento y codificacion agente. No hay datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sin cabeza de prediccion multi-token: la cuantizacion no instancia el draft head del checkpoint base, por lo que la decodificacion especulativa no esta disponible.
- Contexto limitado a 32.768 tokens en T4: el contexto nativo de 262.144 tokens no cabe en 16 GB de VRAM; se puede ampliar en GPUs con mas memoria.
- Precision no evaluada: no hay benchmarks de tareas ni comparacion con el modelo bf16 original. Se recomienda validar el modelo en la carga de trabajo propia antes de usarlo en produccion.
- Calibracion limitada: se usaron solo 53 secuencias de calibracion, lo que podria dar escalas menos robustas que con un conjunto mayor.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos: no se han documentado sesgos especificos, pero al estar basado en Qwen3.5 y entrenado con datos web, puede heredar sesgos de genero, raza o idioma.
- Requisitos de hardware estrictos: no funciona en GPUs Volta y requiere compute capability 7.5 o superior, lo que excluye hardware antiguo.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base puede tener atribuciones de terceros (Qwen3.5) que conviene revisar.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/quocbao747/Ornith-1.5-9B-AWQ-W4A16-g128
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Coleccion Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI: https://ornith.online/
- Version MLX del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
