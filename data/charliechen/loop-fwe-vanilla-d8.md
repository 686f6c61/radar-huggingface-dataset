# CharlieChen/loop-fwe-vanilla-d8

## Resumen

loop-fwe-vanilla-d8 es un modelo de lenguaje base (no ajustado por instrucciones) publicado por el autor CharlieChen en HuggingFace, asociado al articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata del punto de control "Vanilla d8" de una familia de transformers con recursion (looped transformer) entrenada sobre el corpus FineWeb-Edu, y su proposito es servir como referencia experimental para estudiar como la profundidad, la recursion y los operadores de frontera afectan a los exponentes de escalado.

Tecnicamente es un transformer de tipo GPT entrenado desde cero, con 205.783.040 parametros almacenados en FP32, anchura de 1024, 8 cabezas de atencion, vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas en el modelo) y una longitud de contexto de 2.048 tokens. La coordenada de profundidad es d8 y la recurrencia final del nucleo es 1, un detalle relevante porque en esta familia de modelos la coordenada de la escalera de escalado puede no coincidir con el numero de bloques Transformer realmente ejecutados.

Su relevancia es fundamentalmente de investigacion: es un artefacto reproducible (los pesos exportados son identicos bit a bit al checkpoint del articulo, con sumas SHA-256 publicadas) que permite replicar el protocolo de evaluacion CORE del paper y analizar el regimen de escalado de arquitecturas recursivas. No es un modelo de produccion: no incluye ajuste por instrucciones, solo soporta ingles, su licencia no esta declarada y requiere el codigo propio del paper en lugar de la libreria Transformers estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT con recursion (looped transformer), implementacion propia `TransformerGPT` |
| Parametros totales | 205.783.040 (almacenados en FP32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en FP32; no hay versiones GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt`) en FP32; se acompana de `result.json` y `SHA256SUMS`. No es safetensors ni un artefacto `AutoModel` |
| Anchura (hidden size) | 1024 |
| Cabezas de atencion | 8 |
| Coordenada de profundidad | d8 |
| Repeticiones finales del nucleo | 1 |
| Tokenizador | GPT-2 via tiktoken |
| Vocabulario | 50.257 tokens (padded a 50.304 filas del modelo) |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo de tipo GPT con mecanismo de recursion: la coordenada de profundidad d8 pertenece a la escalera de escalado del articulo y puede diferir del numero de bloques efectivamente ejecutados, mientras que la recurrencia final del nucleo se fija en 1. El modelo tiene una anchura de 1.024, 8 cabezas de atencion y un vocabulario GPT-2 tokenizado con tiktoken. La implementacion es la clase `TransformerGPT` del repositorio del paper, por lo que el checkpoint no es cargable con `AutoModel` de HuggingFace Transformers.

El entrenamiento se realizo sobre el corpus FineWeb-Edu y el articulo reporta el uso de GPUs H100 con FlashAttention-3 y autocast en bfloat16. La validacion de preentrenamiento alcanza una NLL de 3,10482868 nats/token. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO; dado que se trata de un modelo base, no consta ningun ajuste de alineacion. Tampoco se incluye el estado del optimizador en el checkpoint publico, solo los tensores del modelo y la recurrencia final de evaluacion.

## Capacidades

- Generacion de texto autorregresiva en ingles, como modelo base sin ajuste por instrucciones: la salida natural es continuacion de texto, no respuesta a ordenes.
- Modelado de lenguaje y calculo de verosimilitud (NLL) por token, apto para experimentos de evaluacion y analisis de escalado.
- Evaluacion bajo el marco CORE del articulo, con 91.037 ejemplos repartidos en 22 tareas, usando la recurrencia final incluida en el checkpoint.
- Soporte de tool calling / function calling: no disponible (modelo base, sin entrenamiento de instrucciones ni plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada; cualquier uso agentico requeriria ajuste adicional.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Reproducibilidad bit a bit respecto al checkpoint del paper, verificable mediante `SHA256SUMS`.

## Casos de uso

- Estudio de leyes de escalado en arquitecturas recursivas: el checkpoint permite reproducir las curvas del articulo y contrastar la coordenada de profundidad d8 con el numero real de bloques ejecutados, usando el script `eval.py` del repositorio con `--max-per-task` para pruebas acotadas.
- Linea base de comparacion (baseline) en experimentos de crecimiento de modelo: sirve como punto "Vanilla" frente a variantes con recursion, growth u operadores de frontera, controlando semillas 0, 1 y 2 como en el protocolo del paper.
- Preentrenamiento continuado sobre dominio especifico: al ser un modelo base de 205,8 M de parametros, se puede afinar sobre corpus propios en ingles (por ejemplo, documentacion tecnica) con hardware de gama media.
- Generacion de datos sinteticos por continuacion de texto: util para aumentar corpus de investigacion, aceptando que la calidad dependera del prompt y de que no hay filtrado por instrucciones.
- Analisis de mecanismos de recurrencia y atencion: al exponer la recurrencia final y la configuracion en `result.json`, es adecuado para estudios de interpretabilidad sobre un modelo pequeno y totalmente reproducible.
- Docencia y practicas de entrenamiento de LLM: el tamano (menos de 1 GB en FP32) y la ausencia de dependencias de alineacion lo hacen manejable para reproducir un pipeline de preentrenamiento y evaluacion en un laboratorio o curso.
- Verificacion de integridad y auditoria de checkpoints: el par `final.pt` + `SHA256SUMS` + `result.json` permite entrenar practicas de trazabilidad de artefactos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta las siguientes metricas propias del articulo:

| Metrica | Valor |
|---|---|
| NLL de validacion de preentrenamiento | 3,10482868 nats/token |
| Precisión CORE del articulo | 0,08614213 |
| NLL de respuesta CORE del articulo | 3,55912760 nats/token |
| Cobertura de la evaluacion CORE | 91.037 ejemplos, 22 tareas, medias sobre semillas 0, 1 y 2 |

El propio autor advierte que la NLL de respuesta CORE no es equivalente a la NLL de validacion de preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,82 GB solo para pesos en FP32; unos 0,41 GB en FP16/BF16; cerca de 0,21 GB en INT8 y 0,10 GB en INT4 (las dos ultimas requeririan cuantizacion propia, no publicada). Hay que sumar la memoria del estado de activaciones y de la cache KV para 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para pesos en FP32 con margen; tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ninguna restriccion. El articulo usa H100 para entrenamiento y evaluacion con FlashAttention-3.
- Inferencia en CPU: viable, con un checkpoint por debajo de 1 GB en FP32.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM, y tambien en iGPU con memoria compartida suficiente.
- Opciones de despliegue: no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, ya que el checkpoint usa la implementacion `TransformerGPT` del repositorio del paper (https://github.com/cue-engineering/loop) y no es un artefacto `AutoModel`. El despliegue previsto es mediante `eval.py` con `--checkpoint` y `--result-json`, o mediante carga manual de `final.pt` con PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados comparativos directos publicados para este checkpoint. Como referencia de categoria (modelos base en ingles del orden de 100-200 M de parametros) se pueden citar los siguientes, sin datos de rendimiento enfrentados:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| loop-fwe-vanilla-d8 | 205,8 M | 2.048 | No disponible | HuggingFace, formato `.pt` propio |
| GPT-2 (OpenAI) | 124 M / 355 M | 1.024 | Licencia MIT modificada | HuggingFace, safetensors/PyTorch, integrado en Transformers |
| Pythia-160M (EleutherAI) | 160 M | 2.048 | Apache 2.0 | HuggingFace, integrado en Transformers |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 | Apache 2.0 | HuggingFace, integrado en Transformers |

La diferencia principal no esta en el rendimiento, que no es comparable con los datos disponibles, sino en la finalidad: los tres alternativos son modelos generativos de uso general con licencia clara e integracion estandar, mientras que loop-fwe-vanilla-d8 es un artefacto de investigacion sobre escalado y recursion, con licencia sin declarar y sin soporte en herramientas convencionales.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineacion: no debe usarse como asistente conversacional sin un ajuste supervisado previo.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion alto en contextos de uso abierto, propio de un modelo preentrenado de 205 M de parametros con una NLL de validacion de 3,10 nats/token.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier explotacion en produccion.
- El checkpoint no es un artefacto de HuggingFace Transformers: no funciona con `AutoModel`, `pipeline` ni con servidores de inferencia estandar como vLLM, TGI, Ollama o llama.cpp.
- No se incluye el estado del optimizador, por lo que reanudar el preentrenamiento exactamente desde el punto de publicacion no es posible.
- Solo se distribuyen pesos en FP32: no hay versiones cuantizadas oficiales y cualquier cuantizacion corre por cuenta del usuario.
- La ventana de contexto esta limitada a 2.048 tokens, insuficiente para tareas de contexto largo.
- No hay informacion publica sobre composicion detallada del dataset, numero de tokens de entrenamiento ni sesgos especificos medidos.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- La fecha de creacion y actualizacion del repositorio (16 de septiembre de 2026) debe verificarse en la pagina del modelo antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d8
- Codigo del paper (repositorio `loop`): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Articulo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se ha encontrado enlace directo en la informacion disponible)
