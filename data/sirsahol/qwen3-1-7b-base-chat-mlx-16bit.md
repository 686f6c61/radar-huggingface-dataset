# SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit

## Resumen

SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit es una conversion a 16 bits (bfloat16 sin cuantizar) del checkpoint base Qwen/Qwen3-1.7B-Base, realizada por el usuario SirSahOl y publicada en formato MLX, el framework de inferencia nativo de Apple Silicon. No es un modelo entrenado desde cero ni un ajuste fino: se trata de una traduccion de pesos al formato MLX para que el modelo pueda ejecutarse sobre la GPU unificada de los chips de Apple (familias M1, M2, M3 y M4) sin depender de CUDA.

El modelo original pertenece a la familia Qwen3 de Alibaba, con arquitectura Qwen3ForCausalLM (transformer decoder-only) y 1.720.574.976 parametros (~1,7B). Su ventana de contexto nativa es de 32.768 tokens, extensible hasta 131.072 mediante YaRN. Al ser un checkpoint "Base" y no "Instruct", el modelo no ha pasado por un ajuste de instrucciones, aunque la model card documenta el uso de una plantilla de chat y tokens de parada especificos para entornos conversacionales.

Su relevancia practica es acotada pero clara: permite evaluar y desplegar un modelo de 1,7B con precision completa en un portatil Apple con 8 GB de memoria unificada, con un consumo de unos 4,2 GB y velocidades declaradas de entre ~51 y ~153 tokens/s segun el tier de chip. Es util como referencia de evaluacion sin degradacion por cuantizacion y como alternativa local ligera para tareas de generacion de texto y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativo; extensible a 131.072 con YaRN |
| Tipos de cuantizacion | 16 bits (bfloat16, sin cuantizar); variantes 4-bit y 8-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX |
| Tamano del repositorio | 3,5 GB (pesos ~4,2 GB declarados en la model card) |
| Libreria | mlx (mlx-lm) |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Pipeline | text-generation |
| Descargas / likes | 271 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint original Qwen3-1.7B-Base: un transformer decoder-only con atencion causal, denominado Qwen3ForCausalLM en la model card. El repositorio no introduce cambios arquitectonicos; la unica transformacion es la conversion de los pesos a MLX en precision de 16 bits, con un promedio declarado de 16,00 bits por peso (bfloat16 sin cuantizar). No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, porque esta ficha corresponde a una conversion y no a un entrenamiento nuevo; esos datos pertenecen al informe tecnico de Qwen3 (arXiv:2505.09388), referenciado en las etiquetas del repositorio.

La innovacion tecnica relevante aqui es el propio formato MLX: pesos y kernels optimizados para la memoria unificada de Apple Silicon, con inferencia sobre GPU nativa mediante mlx-lm. La model card documenta tambien el uso de YaRN para extender el contexto de 32.768 a 131.072 tokens, y una plantilla de chat con los tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`, que deben configurarse como tokens de parada para evitar bucles de generacion. No se documentan tecnicas de decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto autoregresiva en modo completado y en modo conversacional mediante plantilla de chat.
- Razonamiento basico y respuesta a instrucciones simples, limitado por tratarse de un checkpoint Base sin ajuste de instrucciones.
- Generacion de codigo y resolucion de problemas matematicos sencillos, sin garantias de calidad propias de un modelo instruct.
- Soporte de contexto largo: hasta 32.768 tokens de forma nativa y hasta 131.072 con configuracion YaRN.
- Ejecucion local en Apple Silicon mediante MLX, con soporte de chat interactivo por CLI y API de Python.
- Integracion en LM Studio y en Ollama mediante un Modelfile con tokens de parada personalizados.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatil Apple: con 4,2 GB de consumo y 8 GB de memoria unificada minima, permite mantener un chat multi-turno en un MacBook base sin conexion a servicios externos, usando la plantilla de chat documentada.
- Evaluacion de referencia sin cuantizacion: al ser la variante de 16 bits, sirve como linea base para medir cuanto degradan las versiones 4-bit y 8-bit del mismo autor en tareas de razonamiento o generacion de codigo.
- Autocompletado de texto en herramientas de escritura: el modelo puede completar parrafos y reformular frases en local con latencias declaradas de 15 a 53 ms hasta el primer token, adecuadas para sugerencias interactivas.
- Prototipado de pipelines de generacion de texto: la API de mlx-lm permite cargar modelo y tokenizer en pocas lineas y validar prompts antes de migrar a modelos mayores o a infraestructura con GPU.
- Extraccion y resumen de documentos largos: con 32.768 tokens de contexto nativo, admite resumir informes o transcribir notas extensas en una sola pasada, sin trocear el texto.
- Procesamiento por lotes en estaciones de trabajo Apple: en configuraciones Max o Ultra, con velocidades declaradas de hasta 153 tokens/s, es viable procesar colas de documentos en local para tareas de clasificacion o extraccion.
- Desarrollo de aplicaciones con Ollama o LM Studio: gracias a la configuracion de tokens de parada y temperatura documentada, se puede empaquetar el modelo como servicio local para herramientas de IDE o scripts internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye una matriz de rendimiento estimado en hardware Apple Silicon, que se reproduce a continuacion:

| Tier de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~4,2 GB | ~51 tokens/s | ~53 ms |
| M1 / M2 / M3 / M4 Pro | 18 GB - 36 GB | ~4,2 GB | ~76 tokens/s | ~36 ms |
| M1 / M2 / M3 / M4 Max | 36 GB - 128 GB | ~4,2 GB | ~110 tokens/s | ~22 ms |
| M1 / M2 / M3 Ultra | 64 GB - 192 GB | ~4,2 GB | ~153 tokens/s | ~15 ms |

Estas cifras son proyecciones del autor basadas en la saturacion de ancho de banda de memoria de Apple Silicon para pesos de 16 bits, y pueden variar segun la longitud del prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,2 GB con pesos de 16 bits en memoria unificada.
- Memoria unificada minima recomendada: 8 GB; el autor recomienda 32 GB o mas para el uso de la variante 16-bit en estaciones de trabajo.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No hay soporte de MLX para GPU NVIDIA o AMD.
- GPU de consumo: cabe en cualquier Mac con memoria unificada de 8 GB o superior, incluidas las gamas base; el limite real es la memoria compartida con el sistema operativo y el resto de aplicaciones.
- Opciones de despliegue: mlx-lm (`mlx_lm.chat`, `mlx_lm.generate` y API de Python), LM Studio y Ollama mediante un Modelfile con los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`.
- Alternativas de cuantizacion para hardware limitado: la variante de 4 bits ocupa ~1,3 GB en disco y memoria, y la de 8 bits ~2,2 GB.
- Latencia y throughput estimados: de ~53 ms de TTFT y ~51 tokens/s en chips base hasta ~15 ms de TTFT y ~153 tokens/s en M1/M2/M3 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit (este) | 1,72B | 32.768 tokens (131.072 con YaRN) | MLX, 16 bits | apache-2.0 | HuggingFace, 271 descargas |
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-8bit | 1,72B | 32.768 tokens (131.072 con YaRN) | MLX, 8 bits (~2,2 GB) | apache-2.0 | HuggingFace |
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit | 1,72B | 32.768 tokens (131.072 con YaRN) | MLX, 4 bits (~1,3 GB) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B-Base (original) | 1,72B | 32.768 tokens (131.072 con YaRN) | safetensors, bfloat16 | apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas entre estas variantes; la unica diferencia documentada es el ahorro de memoria y la velocidad de generacion a favor de las versiones cuantizadas. No se dispone de informacion sobre alternativas de otros fabricantes en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint Base, no Instruct: no ha sido ajustado con RLHF ni DPO, por lo que puede no seguir instrucciones de forma fiable ni mantener un formato conversacional estable, pese a que el repositorio incluya "chat" en el nombre y documente una plantilla conversacional.
- Riesgo de alucinacion y de bucles de generacion: la model card insiste en configurar los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` en el runtime para evitar respuestas descontroladas.
- Idiomas soportados no disponibles: no se puede confirmar el grado de competencia multilingue ni el comportamiento en castellano a partir de la informacion facilitada.
- Dependencia de plataforma: los pesos estan en formato MLX y solo se ejecutan en Apple Silicon; no son directamente utilizables en CUDA, ROCm ni en GPUs de consumo convencionales sin reconvertir al checkpoint original.
- Licencia apache-2.0: permite uso comercial y modificacion sin restricciones adicionales mas alla de las habituales de atribucion y aviso de licencia; conviene verificar los terminos aplicables al modelo base original.
- Datos incompletos: se desconoce el volumen y la composicion del dataset de entrenamiento, los sesgos conocidos y cualquier evaluacion de seguridad del checkpoint original.
- Contexto extensible con YaRN: la extension a 131.072 tokens requiere configuracion adicional y no ha sido validada en la informacion disponible; el rendimiento con prompts muy largos puede degradarse.
- Las cifras de velocidad y TTFT son proyecciones del autor, no mediciones reproducibles publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit
- Variante 8-bit: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-8bit
- Variante 4-bit: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Framework MLX: https://github.com/ml-explore/mlx
- Informe tecnico de Qwen3 (referencia de las etiquetas): https://arxiv.org/abs/2505.09388
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos trataban sobre mantenimiento de neumaticos de automovil y no guardan relacion con la ficha.
