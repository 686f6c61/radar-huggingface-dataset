# scottlowry/ThinkingCap-Qwen3.8-27B-oQ8e-fp16-mtp

## Resumen

ThinkingCap-Qwen3.8-27B-oQ8e-fp16-mtp es una versión cuantizada del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, publicada por el usuario scottlowry en HuggingFace. Se distribuye ya convertida al formato MLX (Apple), lo que la hace ejecutable directamente en Macs con chip Apple Silicon mediante la librería mlx-lm. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.0) en precisión mixta de 8 bits y group size 64, partiendo de los pesos originales en fp16.

El modelo base, ThinkingCap-Qwen3.8-27B, es el segundo lanzamiento de la serie ThinkingCap de BottleCap AI y consiste en un ajuste fino de Qwen3.8-27B orientado a un único objetivo: reducir la longitud de las trazas de razonamiento. Según la información del autor del modelo base, consigue un 37,2 % menos de tokens de "thinking" de media en 12 benchmarks, a cambio de una caída de 0,86 puntos porcentuales en la exactitud macro-media (de 86,65 % a 85,79 %). Es, por tanto, un modelo pensado para tareas de razonamiento donde la latencia y el coste de generación importan tanto como la precisión.

Con 27.781.427.952 parámetros (unos 27,78 mil millones) y un repositorio de 30,9 GB, esta variante está pensada para inferencia local en hardware Apple. No hay datos publicados de licencia, idiomas ni contexto en la información disponible, y el modelo registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que se trata de un artefacto reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5/Qwen3.8 (model_type `qwen3_5` segun metadatos); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (aproximadamente 27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, precision mixta (oQ / oMLX v0.7.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La ficha de este artefacto no describe la arquitectura del modelo subyacente más allá del `model_type` declarado (`qwen3_5`), el número de bits (8) y el tamaño de grupo (64). Se sabe que el proceso de cuantización se realizó con oQ, integrado en oMLX v0.7.0, aplicando precisión mixta sobre los pesos en fp16 del modelo base y serializando el resultado en safetensors con el backend MLX. No se especifican qué capas reciben más o menos precisión dentro de ese esquema mixto.

El modelo de partida, ThinkingCap-Qwen3.8-27B de BottleCap AI, es un ajuste fino de Qwen3.8-27B orientado a acortar las trazas de razonamiento. Según el material del autor, el ajuste reduce los tokens de pensamiento un 37,2 % de media en 12 benchmarks con un coste de exactitud de 0,86 pp. No hay información en las fuentes consultadas sobre el número de tokens de entrenamiento, la composición del dataset ni la técnica concreta (SFT, DPO, RLHF) empleada para obtener ese comportamiento. El sufijo `mtp` del nombre apunta a multi-token prediction, pero no está confirmado en la documentación disponible y no debe tomarse como dato firme. El modelo base está pensado como reemplazo directo ("drop-in") de Qwen3.8-27B en vLLM o SGLang, aunque esta variante cuantizada concreta es específica de MLX.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", heredado de Qwen3.8-27B, con trazas de razonamiento mas cortas que el modelo original.
- Reduccion del coste de inferencia en tareas de razonamiento: menos tokens generados por consulta segun los datos del modelo base.
- Ejecucion local en Apple Silicon mediante MLX (libreria declarada: `mlx`).
- Capacidades de tool calling, agentes, vision, audio o multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales adicionales (vision, audio, decodificacion especulativa) para esta variante cuantizada.

## Casos de uso

- Inferencia local en Mac: el formato MLX y la cuantizacion a 8 bits permiten ejecutar un modelo de 27,78B en equipos Apple Silicon con memoria unificada suficiente, sin depender de GPU NVIDIA ni de servicios en la nube.
- Razonamiento con presupuesto de latencia ajustado: al generar un 37,2 % menos de tokens de pensamiento (dato del modelo base), encaja en flujos interactivos donde la respuesta debe llegar rapido, como asistentes de codigo o chat tecnico en local.
- Sustitucion directa de Qwen3.8-27B en prototipos: al ser un ajuste fino del mismo modelo, permite comparar el efecto de la reduccion de "thinking" sin cambiar el resto del pipeline.
- Analisis y resumen de documentos largos en local: un modelo denso de casi 28B cuantizado a 8 bits es adecuado para tareas de comprension de texto sin enviar datos a terceros, siempre que el contexto disponible lo permita (longitud no confirmada).
- Desarrollo y depuracion de aplicaciones con MLX: sirve como modelo de referencia para validar pipelines `mlx-lm`, medir throughput en distintos Macs y comparar quality/latencia frente a las variantes oQ4e y oQ6e del mismo autor.
- Evaluacion comparativa de cuantizaciones: util para estudiar la degradacion de calidad entre 4, 6 y 8 bits sobre el mismo modelo base, dado que el autor publica las tres variantes.
- Investigacion sobre eficiencia de razonamiento: como ejemplo de ajuste fino orientado a reducir tokens de cadena de pensamiento, es un caso de estudio para medir el equilibrio entre coste y precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante cuantizada en la informacion disponible. Los unicos datos numericos corresponden al modelo base ThinkingCap-Qwen3.8-27B y a mediciones de velocidad comunitarias:

| Metrica | Qwen3.8-27B (original) | ThinkingCap-Qwen3.8-27B (base, fp16) |
|---|---|---|
| Tokens de razonamiento (media, 12 benchmarks) | referencia | -37,2 % |
| Exactitud macro-media (12 benchmarks) | 86,65 % | 85,79 % (caida de 0,86 pp) |

| Metrica de velocidad | Valor |
|---|---|
| Throughput pico (variante oQ8e-fp16-mtp) | 36 tok/s, 17 ejecuciones comunitarias en 2 GPUs (fuente llm-bench.io) |

Estos datos no deben atribuirse directamente al artefacto cuantizado sin verificar, ya que la fuente del benchmark de calidad es el modelo base en fp16.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 30,9 GB, por lo que se necesita memoria unificada disponible superior a ~31 GB solo para los pesos, mas overhead de runtime y KV cache.
- Equipos Apple Silicon recomendados: Macs con 48 GB, 64 GB, 96 GB o 128 GB de memoria unificada. Un Mac de 32 GB probablemente no sea suficiente para cargar el modelo completo junto con el sistema y el contexto.
- Compatibilidad con GPU NVIDIA: el formato es MLX safetensors, especifico de Apple; no es cargable directamente en CUDA sin conversion a otro formato.
- Opciones de despliegue: mlx-lm (libreria declarada), y herramientas compatibles con MLX. Para vLLM o SGLang habria que usar el modelo base, no esta variante.
- Latencia y throughput: se reportan 36 tok/s pico en 17 ejecuciones comunitarias sobre 2 GPUs (llm-bench.io); el rendimiento real dependera del chip, la memoria y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| scottlowry/ThinkingCap-Qwen3.8-27B-oQ8e-fp16-mtp (este) | 27,78B | no disponible | no disponible | no disponible | MLX safetensors, 8-bit |
| scottlowry/Qwen3.8-27B-oQ4e-mtp | no disponible | no disponible | no disponible | no disponible | MLX safetensors, 4-bit |
| scottlowry/Qwen3.8-27B-oQ6e-fp16-mtp | no disponible | no disponible | no disponible | no disponible | MLX safetensors, 6-bit |
| bottlecapai/ThinkingCap-Qwen3.8-27B (base) | no disponible | no disponible | 85,79 % macro-media; -37,2 % tokens | no disponible | safetensors |
| Qwen3.8-27B (original, referencia) | no disponible | no disponible | 86,65 % macro-media | no disponible | safetensors |

No se dispone de datos suficientes para comparar con modelos de otras familias del mismo tamano.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados para esta variante cuantizada: se desconoce la degradacion de calidad introducida por la cuantizacion a 8 bits.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Conviene consultar la licencia del modelo base y de Qwen3.8-27B antes de desplegarlo en produccion.
- Idiomas y longitud de contexto no documentados: no se puede garantizar el comportamiento en lenguas distintas del ingles ni en contextos largos.
- El modelo base es un ajuste fino que reduce deliberadamente la profundidad del razonamiento; sacrifica 0,86 pp de exactitud a cambio de velocidad, lo que puede penalizar tareas que requieren cadenas de pensamiento largas.
- Riesgo de alucinacion propio de los modelos generativos de esta escala; la reduccion de tokens de pensamiento podria agravar errores en tareas complejas de matematicas o logica.
- Artefacto con 0 descargas y 0 "likes": sin validacion comunitaria, sin pruebas reproducibles publicas y sin garantias de mantenimiento.
- Formato exclusivo MLX: no es portable directamente a CUDA ni a runtimes como vLLM, TGI o llama.cpp sin conversion previa.
- No se confirma que sea compatible con tool calling, agentes o modos multimodales, por lo que no deberia asumirse en disenos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/ThinkingCap-Qwen3.8-27B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Variante oQ4e: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ4e-mtp
- Variante oQ6e: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ6e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Blog de BottleCap AI sobre ThinkingCap-Qwen3.8-27B: https://bottlecapai.com/post/thinkingcap-qwen3-8-27b/
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/09/24/bottlecap-ai-releases-thinkingcap-qwen3-8-27b-37-2-fewer-thinking-tokens-at-a-0-86pp-accuracy-cost/
- Benchmarks comunitarios (llm-bench.io): https://llm-bench.io/models/qwen3-8-27b-oq8e-fp16-mtp
