# RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ4e

## Resumen

Qwen3.8-2B-Distill-MLX-oQ4e es una version cuantizada y lista para Apple Silicon del modelo Qwen3.8-2B-Distill, publicada por el usuario RolanDorisTech. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos BF16 a un formato MLX nativo mediante la tecnica propietaria oQe (oMLX Universal Dynamic Quantization), que asigna precision de forma dinamica segun la sensibilidad medida de cada capa. El resultado es un artefacto de 1,1 GB con 1.881.825.088 parametros (~1,88 mil millones) que conserva el template de chat de Qwen3 y el modo de razonamiento con etiquetas `<think>`.

El modelo pertenece a una familia de ocho variantes publicadas el 23 de septiembre de 2026, con tamanos de 2B, 4B y 9B y distintos niveles de cuantizacion (oQ4e, oQ5e, oQ6e, oQ8e), todas construidas sobre la misma base destilada de empero-ai. Su relevancia practica esta en que permite ejecutar un modelo de razonamiento razonablemente capaz en hardware de consumo Apple (probado en un M1 Max con 64 GB), con un pico de memoria de solo 1,241 GB y velocidades de 267,7 tok/s en prefill y 118,6 tok/s en generacion.

La licencia Apache 2.0 y el formato de pesos estandar de mlx-lm (safetensors) facilitan su integracion en mlx-lm, oMLX, LM Studio y mlx-swift. Es un modelo exclusivamente de texto, destilado, y el autor advierte explicitamente de que puede alucinar y de que la cuantizacion introduce perdidas respecto al BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de la familia Qwen3; tags `qwen3` y `qwen3_5`); no se detalla en la model card |
| Parametros totales | 1.881.825.088 (~1,88 mil millones, segun safetensors) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQe de 4 bits (oQ4e), ~4,7-8,5 bpw efectivos; bfloat16 en normas y escalas; `lm_head` protegido a 8 bits; capas iniciales y finales con bits reforzados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX nativo, compatible con mlx-lm) |
| Tamano del repositorio | 1,1 GB |
| Modelo base | empero-ai/Qwen3.8-Distill (referenciado tambien como empero-ai/Qwen3.8-2B-Distill-GGUF) |
| Libreria | mlx |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo, sino una cuantizacion del maestro BF16 MLX de Qwen3.8-2B-Distill. Segun la model card, los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan documentados, y la unica informacion disponible es que se trata de un modelo de razonamiento destilado. No se especifican detalles sobre atencion, uso de atencion lineal, decodificacion especulativa ni otras innovaciones de arquitectura.

La innovacion tecnica del artefacto reside en el metodo de cuantizacion. oQ es una cuantizacion de precision mixta guiada por datos: mide la sensibilidad real de cada capa y asigna bits donde el error penaliza mas. oQe anade una matriz de importancia de activaciones (imatrix) que pondera la cuantizacion para reducir el error en los canales relevantes. El proceso se ejecuto en un Mac Studio M1 Max de 64 GB con 32 nucleos de GPU bajo macOS 27.0, con oQe activado, reutilizacion de cache activada, cache automatica, `Strict OFF` y `Preserve MTP OFF`, y bfloat16 para normas y escalas. La proteccion aplicada incluye `lm_head` a 8 bits y refuerzo de las capas iniciales y finales. La cuantizacion de esta variante concreta (2B-oQ4e) tardo 1 minuto y 43 segundos. La salida es safetensors estandar de mlx-lm, sin modificaciones en la interfaz de carga.

## Capacidades

- Generacion de texto en modo conversacional, con el template de chat de Qwen3 y soporte del modo de razonamiento mediante etiquetas `<think>` (se incluye `chat_template.jinja`).
- Razonamiento paso a paso: el prompt de prueba documentado plantea una ecuacion lineal y el modelo resuelve correctamente (x=4) preservando el razonamiento dentro de las etiquetas de pensamiento.
- Capacidad de seguir instrucciones matematicas basicas y de mostrar el desarrollo intermedio, segun la unica prueba publicada por el autor.
- Modelo exclusivamente de texto: no hay soporte de vision, audio ni entrada multimodal.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso con herramientas.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Ejecucion nativa en Apple Silicon (MLX), incluyendo integracion con LM Studio y mlx-swift.

## Casos de uso

- Asistente de razonamiento local en Mac: con un pico de 1,241 GB y 118,6 tok/s de generacion en un M1 Max, el modelo puede mantener conversaciones interactivas con latencia baja sin salir del equipo del usuario, lo que resulta adecuado para entornos con requisitos de privacidad.
- Tutor de matematicas paso a paso: el modo `<think>` permite mostrar el desarrollo de problemas aritmeticos y algebraicos sencillos, util en herramientas educativas que necesitan explicar el procedimiento y no solo la respuesta.
- Procesamiento de texto offline en portatiles Apple: al caber en memoria unificada de cualquier Mac moderno y no requerir GPU dedicada, sirve para resumir, reformular o clasificar texto en local sin conexion.
- Integracion en aplicaciones iOS y macOS: los pesos en safetensors de MLX son consumibles desde mlx-swift, por lo que el modelo puede embeberse en apps nativas para tareas de generacion de texto en el dispositivo.
- Prototipado y evaluacion de pipelines de cuantizacion: al formar parte de una familia de ocho variantes con distintos tamanos y precisiones, permite comparar el equilibrio entre memoria, velocidad y calidad (oQ4e frente a oQ8e, o 2B frente a 4B y 9B) sobre el mismo prompt.
- Experimentacion academica con modelos destilados: su tamano reducido y su licencia Apache 2.0 lo hacen util para estudiar el efecto de la destilacion y de la cuantizacion de precision mixta en tareas de razonamiento.
- Generacion de texto en LM Studio: el autor documenta la busqueda y descarga directa desde LM Studio, lo que facilita el uso por parte de perfiles no tecnicos que necesiten un asistente local sin gestionar dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente documenta una prueba funcional y medidas de inferencia, que se reproducen a continuacion.

Prueba funcional: prompt "Q: If 2x + 3 = 11, what is x? Think step by step inside tags." Resultado correcto (x=4), preservado tras la cuantizacion.

Rendimiento medido el 23 de septiembre de 2026 en un Mac Studio M1 Max de 64 GB (32 nucleos de GPU):

| Modelo | Prefill (tok/s) | Generacion (tok/s) | Pico de memoria (GB) |
|---|---|---|---|
| 2B-oQ4e (este modelo) | 267,7 | 118,6 | 1,241 |
| 2B-oQ8e | 122,2 | 97,5 | 2,131 |
| 4B-oQ4e | 133,7 | 65,4 | 2,684 |
| 4B-oQ8e | 130,9 | 48,4 | 4,651 |
| 9B-oQ4e | 101,5 | 43,0 | 5,471 |
| 9B-oQ5e | 91,3 | 37,1 | 6,555 |
| 9B-oQ6e | 84,3 | 33,3 | 7,664 |
| 9B-oQ8e | 91,8 | 28,7 | 9,679 |

Para esta variante concreta, la ejecucion documentada fue de 37 tokens de prompt a 267,7 tok/s y 82 tokens generados a 118,6 tok/s. El autor indica que el modelo equivale a unos 4,7-8,5 bpw efectivos en 1,1 GB, frente a los 5,003 bpw de un 4-bit g32 plano y los 8,502 bpw de un 8-bit g64 plano.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: 1,241 GB de pico medido en M1 Max para esta variante, sin contar el overhead del runtime de MLX. Es el modelo menos exigente de la familia.
- Hardware probado: Mac Studio M1 Max con 64 GB de memoria unificada y 32 nucleos de GPU, bajo macOS 27.0.
- Compatibilidad con hardware de consumo: si, el modelo esta disenado especificamente para Apple Silicon. Su tamano (1,1 GB) lo situa muy por debajo de los limites de cualquier Mac con memoria unificada moderna, incluidos equipos con 8 GB.
- GPU Nvidia (A100, H100, RTX 4090): no es el objetivo del artefacto. Al ser pesos MLX nativos, no se contempla su ejecucion directa en CUDA; para ese hardware habria que recurrir al modelo base en otros formatos.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), oMLX, LM Studio y mlx-swift.
- Instalacion: `pip install mlx-lm`.
- Ejemplo de generacion: `mlx_lm.generate --model RolanDorisTech/Qwen3.8-2B-Distill-oQ4e-MLX-oQ8e --prompt "Explain oQ vs oQe" --max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: 267,7 tok/s en prompt y 118,6 tok/s en generacion sobre M1 Max, con 37 tokens de entrada y 82 de salida.

## Comparativa con modelos similares

La comparacion mas directa es con las otras variantes de la misma familia, ya que no se proporcionan datos de modelos externos comparables.

| Modelo | Parametros | Precision | Tamano | Prefill (tok/s) | Generacion (tok/s) | Pico memoria |
|---|---|---|---|---|---|---|
| Qwen3.8-2B-Distill-oQ4e (este) | ~1,88B | oQ4e | 1,1 GB | 267,7 | 118,6 | 1,241 GB |
| Qwen3.8-2B-Distill-oQ8e | ~1,88B | oQ8e | 1,9 GB | 122,2 | 97,5 | 2,131 GB |
| Qwen3.8-4B-Distill-oQ4e | ~4B (no confirmado) | oQ4e | 2,3 GB | 133,7 | 65,4 | 2,684 GB |
| Qwen3.8-9B-Distill-oQ4e | ~9B (no confirmado) | oQ4e | 4,9 GB | 101,5 | 43,0 | 5,471 GB |

Todas las variantes comparten licencia Apache 2.0, base destilada y formato MLX. No se dispone de datos comparativos con modelos de otros autores (por ejemplo, otras destilaciones de 2B o modelos de razonamiento de tamano similar), por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Modelo destilado: el autor advierte de que puede alucinar. No se han publicado evaluaciones de fidelidad factual.
- Cuantizacion con perdida: pese a que el autor afirma que es mas preciso que un g32/g64 plano, el propio README indica que hay perdidas respecto al BF16 original.
- Modelo exclusivamente de texto: no admite imagenes, audio ni otras modalidades.
- Sesgos: no se documenta ninguna evaluacion de sesgos, por lo que se desconoce su comportamiento en dominios sensibles.
- Idiomas: no se declara la lista de idiomas soportados ni su calidad por idioma; el template de chat es el de Qwen3, pero no hay garantia de cobertura multilingue mas alla de lo que herede del modelo base.
- Longitud de contexto: no disponible, lo que impide planificar su uso en tareas que dependan de ventanas largas.
- Tool calling y agentes: no se documenta soporte, por lo que no deberia asumirse en pipelines que lo requieran.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (empero-ai/Qwen3.8-Distill) y la de la familia Qwen3 subyacente antes de un despliegue en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en la misma fecha, lo que limita la evidencia de uso en produccion.
- Discrepancia en el identificador: el comando de ejemplo del README apunta a un nombre distinto (`RolanDorisTech/Qwen3.8-2B-Distill-oQ4e-MLX-oQ8e`) del ID del repositorio, un detalle a verificar antes de automatizar la descarga.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ4e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-Distill
- Base en formato GGUF citada en los creditos: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill-GGUF
- Canal del autor: https://www.youtube.com/@RolanDorisTech
- Libreria de despliegue: https://github.com/ml-explore/mlx-lm
