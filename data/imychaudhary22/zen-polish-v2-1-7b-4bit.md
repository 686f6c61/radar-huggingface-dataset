# imYChaudhary22/zen-polish-v2-1.7b-4bit

## Resumen

ZenPolish v2 (1.7B) es un modelo especializado en la limpieza y el formateo de texto dictado, desarrollado por el autor imYChaudhary22 bajo el paraguas del proyecto ZenVoice. Su tarea es concreta: recibe la salida cruda y sin puntuar de un motor de reconocimiento automatico del habla (ASR/STT) y restaura lo que el dictado pierde, es decir, puntuacion, mayusculas, eliminacion de muletillas y conversion de numeros, fechas y horas habladas a su forma escrita. Esta pensado para ejecutarse integramente en local sobre Apple Silicon mediante MLX, sin enviar datos a ningun servicio externo.

Tecnicamente es un fine-tune con LoRA sobre Qwen3-1.7B (en concreto sobre la version ya cuantizada a 4 bits de mlx-community), posteriormente fusionado y cuantizado a 4 bits. El resultado son 1.720.574.976 parametros (aproximadamente 1,7B) en un transformer denso decoder-only, con pesos en safetensors de 934 MB dentro de un repositorio de 1,0 GB. Se invoca con un prompt en formato ChatML y con el modo "thinking" de Qwen3 desactivado.

Su relevancia actual es doble. Por un lado, ocupa un nicho muy especifico (post-procesado de dictado) donde los modelos generalistas no destacan, y lo hace con un coste de inferencia minimo apto para portatiles. Por otro lado, la comparativa publicada por el autor frente al modelo base sin ajustar muestra mejoras medibles en WER, coincidencia exacta, F1 de puntuacion y precision de mayusculas, lo que lo hace evaluable de forma objetiva. La contrapartida es que se trata de un modelo con validacion externa practicamente nula (0 descargas y 1 "me gusta" en el momento de redactar esta ficha) y con evaluaciones generadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Qwen3-1.7B), ajustada con LoRA y fusionada |
| Parametros totales | 1.720.574.976 (aproximadamente 1,7B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-1.7B de Qwen declara 32.768 tokens, dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | 4 bits (MLX); pesos safetensors de 934 MB |
| Idiomas soportados | Ingles como foco principal; el resto no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3-1.7B) |
| Formato de pesos | Safetensors (formato MLX, cuantizado a 4 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso decoder-only. Sobre esa base, el autor aplico un ajuste fino con LoRA cuyo unico objetivo es el formateo de texto dictado; posteriormente fusiono los adaptadores en los pesos base y aplico cuantizacion a 4 bits en formato MLX. No se proporcionan detalles sobre el numero de capas, dimensiones de atencion, mecanismos de atencion ni innovaciones arquitectonicas propias, ya que el modelo no modifica la arquitectura original, sino unicamente el comportamiento mediante el ajuste. No se indica si se emplearon tecnicas como RLHF o DPO; el entrenamiento descrito es de tipo supervisado sobre pares de texto.

El proceso de entrenamiento documentado consta de varias piezas: un "noisifier" que degrada texto limpio hasta su forma hablada (introduciendo muletillas, eliminando puntuacion y convirtiendo numeros y fechas a forma oral), constructores de pares de entrenamiento a partir de ASR sintetico y real, conjuntos de evaluacion congelados y entrenamiento LoRA con mlx-lm. La model card menciona la existencia de un repositorio ZenVoice con el pipeline completo bajo el directorio `training/`, incluyendo el system prompt exacto en `training/common.py`, pero no se facilita la URL del repositorio en la informacion disponible.

## Capacidades

- Restauracion de puntuacion en texto procedente de dictado, incluyendo signos de interrogacion y exclamacion.
- Correccion de mayusculas, con una precision declarada del 94,2% en el conjunto sintetico de evaluacion.
- Eliminacion de muletillas y rellenos orales ("um", "yeah", "so", etc.).
- Conversion de numeros, fechas y horas habladas a su representacion escrita.
- Normalizacion de porcentajes expresados oralmente.
- Limpieza y formateo exclusivamente: el autor declara que el modelo no reescribe el significado ni anade contenido nuevo.
- Generacion de texto conversacional (heredada de la pipeline `text-generation` del modelo base).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- El modo "thinking" de Qwen3 se usa desactivado.
- Capacidad multilingue: limitada al ingles en esta version; el autor indica que la v3 ampliara la cobertura de idiomas.

## Casos de uso

- Limpieza de dictado en aplicaciones de voz: el modelo recibe la salida cruda de un motor STT y devuelve el mismo contenido con puntuacion, mayusculas y numeros normalizados. Es su caso de uso principal y el escenario para el que fue entrenado.
- Post-procesado de transcripciones de reuniones: tras generar la transcripcion bruta con un ASR, se puede pasar por ZenPolish v2 para obtener un texto legible antes de enviarlo a un gestor de notas o a un resumen automatico.
- Asistentes de notas en macOS con procesamiento local: al ejecutarse via MLX sobre Apple Silicon, encaja en herramientas de toma de notas que requieren que el audio y el texto no salgan del dispositivo.
- Funciones de accesibilidad: usuarios que dependen del dictado por limitaciones motoras pueden obtener texto con formato correcto sin pasos manuales de edicion.
- Redaccion rapida de mensajes y correos cortos: util para convertir dictado informal en texto presentable, con la advertencia de que la reescritura de correos y URL es un punto debil declarado por el autor.
- Normalizacion de entrada antes de otros modelos: el texto limpio puede alimentar a un LLM posterior, reduciendo ruido y errores de interpretacion derivados de una transcripcion sin puntuar.
- Pipelines de STT en servidores Apple Silicon (por ejemplo, Mac Studio): permite centralizar el post-procesado de dictado en hardware de Apple manteniendo el modelo en local.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el propio autor, medidos sobre conjuntos de evaluacion congelados con decodificacion greedy y comparados contra Qwen3-1.7B-Instruct en el mismo prompt. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas.

Conjunto sintetico de 300 filas:

| Metrica | ZenPolish v2 | Base sin ajustar |
|---|---|---|
| WER | 5,0% | 10,1% |
| Coincidencia exacta | 20,3% | 11,3% |
| F1 de puntuacion | 0,391 | 0,143 |
| Tasa de contenido nuevo (alucinacion) | 3,1% | 4,3% |
| Precision de mayusculas | 94,2% | 89,9% |

Conjunto limpio de entrada real (120 filas):

| Metrica | ZenPolish v2 | Base sin ajustar |
|---|---|---|
| WER | 7,6% | 11,0% |
| Coincidencia exacta | 7,5% | 5,0% |

El propio autor senala que el WER de ZenPolish v2 es peor con entrada limpia (7,6%) que con entrada ruidosa estilo ASR (5,0%), y atribuye la correccion de esa brecha a un "identity-mix" previsto para la version v3.

## Requisitos de hardware

- Peso de los pesos: 934 MB en safetensors de 4 bits, dentro de un repositorio de 1,0 GB.
- VRAM o memoria unificada estimada para inferencia: el modelo esta disenado para MLX sobre memoria unificada de Apple Silicon; con los pesos en 4 bits y la cache KV, el consumo tipico se situa en el rango de 1,5 a 2,5 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: no se documentan GPU NVIDIA ni AMD; el formato MLX esta orientado a chips Apple M1, M2, M3 y M4 (incluidas variantes Pro, Max y Ultra).
- Compatibilidad con GPU de consumo: si, en Macs con memoria unificada de 8 GB o superior. No se declara soporte para GPU de consumo NVIDIA del tipo RTX 4090, dado que el formato de pesos es MLX.
- Opciones de despliegue: mlx-lm es la via nativa. No se publican pesos GGUF ni integracion con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| ZenPolish v2 1.7B (este modelo) | 1,7B | No disponible | Apache-2.0 | MLX 4 bits, safetensors | WER 5,0% (sintetico), 7,6% (limpio) |
| Qwen3-1.7B-Instruct (base sin ajustar) | 1,7B | No disponible en la informacion proporcionada | Apache-2.0 | Multiples formatos | WER 10,1% (sintetico), 11,0% (limpio) |
| mlx-community/Qwen3-1.7B-4bit (base inmediata) | 1,7B | No disponible | Apache-2.0 | MLX 4 bits | No se publican metricas de formateo de dictado |

No se dispone de informacion sobre otros modelos especializados en post-procesado de dictado con los que establecer una comparacion directa, por lo que esa parte de la comparativa queda como no disponible.

## Limitaciones y advertencias

- El modelo esta enfocado al ingles; el autor reconoce que la cobertura de idiomas se ampliara en la v3, por lo que su uso en castellano no esta respaldado por la documentacion.
- Su alcance es exclusivamente de formateo y limpieza: no reescribe el significado ni anade contenido, de modo que no sirve como modelo de redaccion o de razonamiento.
- Puntos debiles declarados por el autor: reescritura de correos electronicos y URL, conversion de cantidades monetarias habladas y reparacion de homofonos.
- Tasa de alucinacion medida por el autor: 3,1% de contenido nuevo en el conjunto sintetico de 300 filas. Aunque es inferior a la del modelo base (4,3%), sigue siendo un riesgo real en produccion.
- El rendimiento empeora con entrada limpia (WER 7,6%) respecto a entrada ruidosa estilo ASR (5,0%), lo que puede sorprender si se usa el modelo sobre texto ya parcialmente puntuado.
- Las evaluaciones proceden del propio autor y estan basadas en conjuntos sinteticos o internos; no hay validacion independiente ni benchmarks generalistas publicos.
- Adopcion practicamente nula en el momento de redactar esta ficha (0 descargas, 1 "me gusta"), lo que implica ausencia de validacion por parte de la comunidad.
- Licencia Apache-2.0, heredada del modelo base, que permite uso comercial siempre que se conserven los avisos de copyright y licencia correspondientes y se documenten los cambios realizados.
- La dependencia del formato MLX limita el despliegue a hardware de Apple; no hay pesos GGUF ni soporte documentado para servidores con GPU NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imYChaudhary22/zen-polish-v2-1.7b-4bit
- Modelo base inmediato (MLX 4 bits): https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Repositorio ZenVoice (`training/`, `training/evaluate.py`, `training/common.py`): mencionado en la model card, URL no disponible en la informacion proporcionada.
