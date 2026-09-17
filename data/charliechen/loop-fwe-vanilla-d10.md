# CharlieChen/loop-fwe-vanilla-d10

## Resumen

loop-fwe-vanilla-d10 es un modelo de lenguaje base (no instruido, no alineado) publicado por el usuario CharlieChen en Hugging Face, con 331.939.840 parámetros almacenados en FP32 (aproximadamente 1,3 GB de pesos). Se trata del checkpoint denominado «FineWeb-Edu Vanilla d10» del trabajo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*, orientado a estudiar cómo escalan los exponentes de las leyes de escala en arquitecturas con recurrencia. El modelo emplea una arquitectura de transformer con bucles (looped transformer) implementada en una clase propia llamada `TransformerGPT`, con una anchura de 1280, 10 cabezas de atención, vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas) y una longitud de contexto de 2.048 tokens.

El interés de esta ficha no reside en su rendimiento absoluto, sino en su naturaleza de artefacto de investigación reproducible: los pesos exportados son idénticos bit a bit al checkpoint del artículo, se distribuye un `result.json` con la configuración y métricas, y un fichero `SHA256SUMS` con la verificación SHA-256. La precisión CORE publicada es de 0,13439007, muy por debajo de modelos base convencionales de tamaño similar, y la NLL de validación de preentrenamiento es de 2,92883180 nats/token.

Es relevante ahora porque la recurrencia (aplicar repetidamente un bloque o núcleo) se ha convertido en una línea activa para desacoplar parámetros de cómputo en inferencia, y este checkpoint ofrece un punto de comparación concreto («vanilla», sin crecimiento de modelo ni operadores de frontera) frente a las variantes del mismo estudio. No obstante, está pensado exclusivamente para replicación experimental en inglés, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia (looped transformer), implementacion propia `TransformerGPT` |
| Parametros totales | 331.939.840 (almacenados en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos FP32 en `final.pt`) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (FP32), no safetensors ni GGUF |
| Anchura del modelo | 1.280 |
| Cabezas de atencion | 10 |
| Coordenada de profundidad | d10 |
| Repeticiones finales del nucleo | 1 |
| Tokenizer | GPT-2, via tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con recurrencia: un nucleo de bloques Transformer que puede ejecutarse repetidamente. En el articulo, la profundidad se parametriza mediante una «coordenada de escala» o *depth coordinate*, en este caso d10, que puede no coincidir con el numero de bloques Transformer efectivamente ejecutados. La variante «vanilla» corresponde a la configuracion de referencia del estudio, sin crecimiento de modelo (*model growth*) ni operadores de frontera (*boundary operators*). El checkpoint publicado incluye unicamente los tensores del modelo y la recurrencia final usada en evaluacion, con una sola repeticion del nucleo (*final core repetitions = 1*).

El corpus de preentrenamiento es FineWeb-Edu. No se especifica en la informacion disponible el numero total de tokens vistos, la composicion detallada del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; se trata, en cualquier caso, de un modelo base sin alineacion. Tampoco se documentan innovaciones de decodificacion (decodificacion especulativa, atencion lineal) mas alla de la propia recurrencia. El articulo reporta entrenamiento en GPUs H100 con FlashAttention-3 y autocast en bfloat16; el estado del optimizador no se incluye en el repositorio. Las metricas archivadas en el articulo (CORE) son medias sobre las semillas 0, 1 y 2, evaluadas sobre 91.037 ejemplos de 22 tareas.

## Capacidades

- Generacion de texto autoregresiva en ingles: es un modelo base, por lo que completa texto en lugar de seguir instrucciones.
- Razonamiento y conocimiento factual limitados: la precision CORE publicada (0,13439007) es baja en terminos absolutos, indicativa de un modelo pequeno y poco entrenado.
- Modelado de lenguaje con ventana de 2.048 tokens, suficiente para documentos cortos o fragmentos de codigo.
- Tokenizacion GPT-2 via tiktoken, compatible con el ecosistema habitual de GPT-2.
- Punto de partida para *fine-tuning* supervisado o ajuste por instrucciones en ingles, dado que se distribuyen pesos completos.
- Capacidad de servir como baseline reproducible en experimentos de leyes de escala y de recurrencia.
- No se documenta soporte de *tool calling*, *function calling*, uso agentico, vision, audio ni modo de razonamiento explicito (*thinking mode*).
- Multilingue: no, unicamente ingles.

## Casos de uso

- Replicacion de leyes de escala: el checkpoint permite reproducir exactamente las metricas del articulo (NLL de validacion 2,92883180 y CORE 0,13439007) ejecutando `eval.py` con el `result.json` y las semillas 0, 1 y 2 sobre las 22 tareas.
- Estudio de recurrencia en transformers: al ser la variante «vanilla» con una sola repeticion del nucleo, sirve como control experimental frente a variantes con crecimiento de modelo u operadores de frontera del mismo trabajo.
- Analisis de eficiencia parametros/cumputo: con 331,9 M de parametros y contexto de 2.048 tokens, es util para medir como la recurrencia afecta a la relacion entre parametros almacenados y FLOPs de inferencia.
- Fine-tuning academico en ingles: los pesos FP32 completos permiten ajustar el modelo en tareas de clasificacion o generacion con presupuestos de GPU modestos.
- Generacion de texto de dominio especifico tras ajuste: por ejemplo, completado de abstracts o resumentes tecnicos en ingles, aprovechando el preentrenamiento sobre FineWeb-Edu (corpus de caracter educativo).
- Investigacion sobre contaminacion de datos y evaluacion: al estar el corpus acotado a FineWeb-Edu y publicarse la NLL de preentrenamiento, es un candidato para estudiar solapamiento entre entrenamiento y benchmarks.
- Docencia y practicas de ingenieria de modelos: el repositorio separa pesos (`final.pt`), configuracion y metricas (`result.json`) y checksums (`SHA256SUMS`), lo que lo hace adecuado para ejercicios de carga, evaluacion y verificacion de integridad de checkpoints.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| Precision CORE (media del articulo) | 0,13439007 | 91.037 ejemplos, 22 tareas, semillas 0, 1 y 2 |
| CORE answer NLL | 3,09699432 nats/token | mismo protocolo |
| NLL de validacion de preentrenamiento | 2,92883180 nats/token | validacion durante el preentrenamiento |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) para este checkpoint, ni comparaciones numericas con modelos de tamano similar.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,33 GB (331.939.840 parametros x 4 bytes), coherente con el tamano de repositorio de 1,3 GB.
- Pesos en bfloat16 o float16: aproximadamente 0,66 GB, si se convierte el checkpoint manualmente.
- VRAM estimada para inferencia: en el entorno de 2 a 4 GB en bfloat16 con contexto completo de 2.048 tokens, incluyendo cache KV y activaciones (estimacion orientativa, no publicada por el autor).
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, asi como en GPUs de portatil con 6 GB o mas.
- El articulo emplea GPUs H100 con FlashAttention-3 y autocast en bfloat16 para la evaluacion completa del protocolo CORE.
- Opciones de despliegue: exclusivamente el codigo del articulo (`github.com/cue-engineering/loop`) mediante `eval.py`; el checkpoint usa la implementacion propia `TransformerGPT` y no es un artefacto `AutoModel` de Transformers, por lo que no funciona con vLLM, TGI, llama.cpp, Ollama o servidores compatibles con Hugging Face sin trabajo de adaptacion adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa estructural con modelos base de tamano comparable (los datos de los modelos de referencia proceden de informacion publica general, no de la informacion proporcionada en esta busqueda; los valores de rendimiento comparables no estan disponibles):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparable |
|---|---|---|---|---|---|
| loop-fwe-vanilla-d10 | 331,9 M (FP32) | 2.048 | no disponible | `.pt` + codigo propio del articulo | CORE 0,13439007 |
| GPT-2 medium | 355 M | 1.024 | MIT (licencia modificada de OpenAI) | safetensors, ampliamente soportado | no disponible en esta ficha |
| Pythia-410m | 410 M | 2.048 | Apache 2.0 | safetensors, integrado en Transformers | no disponible en esta ficha |
| OPT-350M | 350 M | 2.048 | no verificada en esta fuente | safetensors, integrado en Transformers | no disponible en esta ficha |

La diferencia practica principal no es de tamano sino de ecosistema: los tres modelos de referencia se cargan directamente con `AutoModelForCausalLM` y disponen de conversiones GGUF, mientras que loop-fwe-vanilla-d10 requiere el repositorio del articulo y no ofrece rutas de cuantizacion publicadas.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones, no responde a formatos de chat y puede generar contenido inapropiado o incoherente.
- Precision CORE muy baja (0,13439007) y NLL de validacion de 2,92883180 nats/token: el rendimiento en tareas de conocimiento y razonamiento es reducido incluso para su tamano.
- Riesgo elevado de alucinacion y de texto no factual, especialmente fuera del dominio de FineWeb-Edu.
- Cobertura exclusivamente en ingles; no hay soporte multilingue documentado.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia no especificada: la ausencia de licencia implica que no se conceden permisos explicitos de uso, incluido el comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Formato de pesos no estandar (`.pt` con `TransformerGPT` propio): no hay safetensors, GGUF ni `config.json` de Transformers, lo que impide usar herramientas habituales de cuantizacion, servidores de inferencia y pipelines de despliegue.
- El repositorio no incluye estado del optimizador, lo que dificulta reanudar el preentrenamiento.
- El modelo se publica como artefacto de investigacion reproducible: la model card indica que la evaluacion de referencia se realizo en H100 con FlashAttention-3 y bfloat16, de modo que los resultados pueden variar en otro hardware o en otra precision.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d10
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Articulo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*: no disponible (solo se cita el titulo en la model card)
- Demo o espacio interactivo: no disponible
