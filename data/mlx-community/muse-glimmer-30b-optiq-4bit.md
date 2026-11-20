# mlx-community/Muse-Glimmer-30B-OptiQ-4bit

## Resumen

Muse-Glimmer-30B-OptiQ-4bit es una cuantizacion mixta de precision del modelo multimodal Muse-Glimmer-30B, publicada por la comunidad mlx-community y generada con el toolkit mlx-optiq. El modelo base es un vision-language model de aproximadamente 30.000 millones de parametros (27.854.780.928 reales en safetensors) con 52 capas de decoder, disenado para razonamiento image-text-to-text. Esta version permite ejecutar el modelo localmente en Apple Silicon sin PyTorch ni cloud, ocupando 18,6 GB en disco para la torre de lenguaje y 3,8 GB adicionales para la torre de vision en bf16 como sidecar.

La relevancia de esta ficha radica en que demuestra que un modelo de razonamiento multimodal de ~30B puede correr en un Mac con MLX mediante cuantizacion sensible a la sensibilidad por capa: las primeras capas conservan mas precision (6,88 bits de media en las capas 0-12) y las ultimas se comprimen mas agresivamente (5,85 bits en las 39-51). El modelo separa explicitamente el canal de razonamiento (`self`) del canal de respuesta (`user`), lo que facilita el parseo de la salida final.

La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text. No se dispone de informacion sobre idiomas soportados ni sobre la composicion del dataset de entrenamiento del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atencion gated, sliding window de 2048 en 3 de cada 4 capas y NoPE en las 13 capas globales; torre de vision separada |
| Parametros totales | 27.854.780.928 (~30B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible de forma explicita; sliding window de 2048 en capas locales y 13 capas globales |
| Tipos de cuantizacion | OptiQ mixed-precision 4/8-bit en la torre de lenguaje (169 capas a 4-bit, 248 a 8-bit); torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); vision sidecar en `optiq/optiq_vision.safetensors` |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer decoder de 52 capas con atencion gated. La atencion combina un sliding window de 2048 tokens en 3 de cada 4 capas con 13 capas globales que usan NoPE (sin positional encoding explicito). La torre de vision se mantiene en bf16 en un sidecar separado, lo que permite que el mismo checkpoint procese texto e imagenes.

La cuantizacion OptiQ es sensible a la sensibilidad: se midieron las 417 proyecciones y se asigno precision por capa segun la sensibilidad observada, que decrece con la profundidad. La media de bits por bloque de capas es 6,88 (0-12), 6,50 (13-25), 6,27 (26-38) y 5,85 (39-51). La torre de vision se reimplemento en MLX y se valido contra la referencia con un error relativo de 4e-07; la torre de lenguaje con 1,8e-06. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-step con separacion explicita de canales: razonamiento en `self` y respuesta final en `user`.
- Comprension de imagenes (image-text-to-text): descripcion de contenido visual, como demuestra el ejemplo de un circulo rojo sobre fondo claro.
- Razonamiento matematico: resuelve problemas estilo GSM8K mostrando los pasos intermedios.
- Tool calling / function calling: las llamadas llegan en un bloque `<atem:invoke>` en lugar del JSON habitual de `<tool_call>`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: el modelo "piensa antes de responder" y separa el razonamiento de la respuesta final.
- Capacidades de agente y razonamiento multi-step: no confirmadas explicitamente en la informacion disponible, aunque el canal de razonamiento y el tool calling lo habilitan.

## Casos de uso

- Asistente multimodal local en Mac: el modelo procesa imagenes y texto en el mismo checkpoint, por lo que se puede usar para describir capturas de pantalla, diagramas o fotos sin enviar datos a la nube, aprovechando los 18,6 GB + 3,8 GB en disco.
- Razonamiento matematico asistido: resuelve problemas tipo GSM8K mostrando el desarrollo en el canal `self`, util para herramientas educativas que necesitan explicar el proceso y no solo la respuesta.
- Automatizacion de tool calling en pipelines: el bloque `<atem:invoke>` permite integrar el modelo en flujos que invocan funciones externas (APIs, bases de datos) con un parser adaptado a ese formato.
- Evaluacion de instrucciones estrictas: con un 80,6% en IFEval strict, es adecuado para tareas que requieren seguir formatos y restricciones de salida de forma fiable.
- Generacion de codigo asistida: con 79,9% pass@1 en HumanEval, sirve para autocompletado y generacion de funciones en entornos de desarrollo locales sobre Apple Silicon.
- Recuperacion en contexto largo: el 100% en HashHop sugiere buen rendimiento en tareas de retrieval sobre documentos largos, util para busqueda semantica y QA sobre corpus extensos.
- Prototipado de agentes con razonamiento visible: el canal `self` permite auditar el proceso de decision del modelo antes de ejecutar acciones, util en entornos de investigacion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| MMLU (5-shot, 969 muestras) | 83,1% |
| GSM8K (1000 muestras) | 92,1% |
| IFEval (set completo, strict) | 80,6% |
| BFCL-V3 simple (200 llamadas) | 88,5% |
| HumanEval (164 problemas, pass@1) | 79,9% |
| HashHop (long-context retrieval) | 100,0% |
| Capability Score (media de 6) | 87,36 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio en disco: 18,6 GB para la torre de lenguaje cuantizada y 3,8 GB para la torre de vision en bf16 (total ~22,4 GB en disco; el repo ocupa 23,9 GB).
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el modelo esta disenado para MLX, no para CUDA.
- Cabe en consumer GPU: si, en Macs con memoria unificada de al menos ~24 GB (no confirmado de forma explicita en la informacion disponible).
- Opciones de despliegue: `mlx-lm` con `import optiq` para registrar la arquitectura, y `optiq serve` para endpoint compatible con OpenAI y Anthropic.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de rendimiento de modelos alternativos de la misma categoria que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo es un modelo de razonamiento: un presupuesto de tokens corto lo corta a mitad del razonamiento antes de que se abra el canal de respuesta.
- Parsear la cadena cruda puede capturar numeros del canal `self` que el modelo no ha confirmado en la respuesta final; hay que leer el ultimo canal.
- Las llamadas a herramientas usan `<atem:invoke>`, no el formato `<tool_call>` JSON comun, lo que requiere un parser adaptado.
- La arquitectura no es conocida por `mlx-lm` de serie; es necesario `import optiq` para registrarla.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion especifico ni idiomas soportados.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales del modelo base en la informacion disponible.
- La etiqueta "4bit" denota la familia de cuantizacion, no la media ponderada real de bits.

## Enlaces

- [Hugging Face: mlx-community/Muse-Glimmer-30B-OptiQ-4bit](https://huggingface.co/mlx-community/Muse-Glimmer-30B-OptiQ-4bit)
- [Modelo base: meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Sitio del proyecto mlx-optiq](https://mlx-optiq.com/)
- [Guia de la familia Muse-Glimmer](https://mlx-optiq.com/docs/muse-glimmer)
- [Todos los quants OptiQ](https://mlx-optiq.com/models)
- [Documentacion de mlx-optiq](https://mlx-optiq.com/docs/)
