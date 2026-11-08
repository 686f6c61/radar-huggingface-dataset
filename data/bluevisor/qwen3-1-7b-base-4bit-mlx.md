# bluevisor/Qwen3-1.7B-Base-4bit-mlx

## Resumen

Qwen3-1.7B-Base-4bit-mlx es una conversion a formato MLX con cuantizacion de 4 bits del modelo Qwen/Qwen3-1.7B-Base, publicada por el usuario bluevisor. No se trata de un modelo entrenado desde cero, sino de una redistribucion de los pesos originales de Qwen convertidos mediante `mlx_lm.convert -q --q-bits 4` sin ninguna otra modificacion. El modelo base pertenece a la familia Qwen3 de Alibaba, la generacion mas reciente de modelos Qwen, que combina variantes densas y de mezcla de expertos (MoE).

El modelo resuelve el problema de ejecutar un LLM de 1.720.574.976 parametros en hardware Apple Silicon con un consumo de memoria reducido gracias a la cuantizacion de 4 bits, manteniendo la licencia Apache 2.0 del original. Es relevante para desarrolladores que quieran integrar generacion de texto y completados en aplicaciones macOS nativas: de hecho, el autor lo usa como motor de las sugerencias y completados de la aplicacion Haiku Pinyin.

Al ser una variante *base* (no instruct), el modelo esta pensado para continuacion de texto y fine-tuning, no para seguir instrucciones de forma conversacional directa, aunque la libreria MLX lo etiquete como `conversational`. Su tamano compacto y su contexto (definido en el modelo base) lo hacen adecuado para tareas de autocompletado y generacion local de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3, segun modelo base) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B-Base) |
| Tipos de cuantizacion | 4 bits (MLX, `--q-bits 4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen/Qwen3-1.7B-Base: un transformer denso de 1.720.574.976 parametros. Esta publicacion no aporta informacion sobre la composicion del dataset de entrenamiento, el numero de tokens procesados ni si hubo fases de RLHF o DPO; esos detalles deben consultarse en la model card del modelo original de Qwen.

La unica transformacion aplicada es la conversion al formato MLX y la cuantizacion a 4 bits mediante la herramienta oficial `mlx_lm.convert`. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni tecnicas hibridas) en la informacion disponible. El repositorio ocupa 1.0 GB, coherente con pesos de 4 bits para ~1.7B de parametros.

## Capacidades

- Generacion de texto y continuacion de secuencias (modelo base, sin ajuste de instrucciones).
- Completados predictivos en editores y teclados, uso principal declarado por el autor en Haiku Pinyin.
- Punto de partida para fine-tuning sobre tareas especificas en espanol u otros idiomas.
- Inferencia local en Apple Silicon mediante la libreria MLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo instruct).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Autocompletado en aplicaciones de escritura y teclados predictivos: es exactamente el uso para el que el autor lo publica, integrado en Haiku Pinyin en macOS, donde el modelo genera sugerencias de caracteres y frases con baja latencia gracias a los pesos de 4 bits.
- Generacion de texto local en macOS: al usar MLX, se ejecuta de forma nativa en Apple Silicon sin dependencia de CUDA, adecuado para aplicaciones de escritorio que requieren privacidad y funcionamiento offline.
- Fine-tuning ligero para dominios concretos: al ser un modelo base de 1.7B, sirve como punto de partida para ajustar tareas de clasificacion, extraccion o generacion en un dominio especifico con recursos limitados.
- Prototipado rapido de pipelines de NLP: su tamano permite iterar en un portatil antes de escalar a modelos mayores, validando prompts y flujos de datos.
- Generacion de texto en entornos con memoria restringida: la cuantizacion a 4 bits reduce la huella de memoria, lo que permite desplegarlo en equipos con 8-16 GB de RAM unificada.
- Educacion e investigacion: util para estudiar el comportamiento de modelos Qwen3 en formato cuantizado y comparar la degradacion frente a los pesos originales en FP16/BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas y la publicacion es una conversion de pesos sin evaluacion propia.

## Requisitos de hardware

- VRAM/RAM unificada estimada: aproximadamente 1.0 GB para los pesos en 4 bits, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto).
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con memoria unificada; el formato MLX no esta pensado para GPU NVIDIA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada.
- Opciones de despliegue: libreria `mlx` / `mlx_lm` (unica via soportada por estos pesos); no se proporcionan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| bluevisor/Qwen3-1.7B-Base-4bit-mlx | 1.720.574.976 | no disponible | 4 bits MLX | Apache 2.0 | safetensors (MLX) |
| Qwen/Qwen3-1.7B-MLX-4bit | 1.7B (modelo base) | no disponible | 4 bits MLX | Apache 2.0 | safetensors (MLX) |
| NexaAI/Qwen3-1.7B-4bit-MLX | 1.7B (modelo base) | no disponible | 4 bits MLX | no disponible | safetensors (MLX) |

Las tres opciones derivan del mismo modelo Qwen3-1.7B; la diferencia principal es el publicador y el pipeline de conversion. La version oficial de Qwen y la de NexaAI pueden incluir ajustes o configuraciones distintas que no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Al ser un modelo *base*, no esta alineado para seguir instrucciones ni para conversacion; puede producir continuaciones incoherentes si se usa como asistente.
- Riesgo de alucinacion y de generar contenido sesgado o inapropiado, inherente a los modelos base sin RLHF.
- No se documentan los idiomas soportados ni el contexto efectivo en esta publicacion; deben verificarse en la model card de Qwen/Qwen3-1.7B-Base.
- La cuantizacion a 4 bits puede degradar la calidad respecto a los pesos originales en FP16/BF16; no se aportan mediciones de esa degradacion.
- Dependencia exclusiva del ecosistema MLX y de hardware Apple Silicon; no hay pesos GGUF ni compatibilidad con CUDA.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia del modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bluevisor/Qwen3-1.7B-Base-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base/blob/main/LICENSE
- Repositorio de la aplicacion Haiku Pinyin: https://github.com/bluevisor/haiku-pinyin
- Conversion oficial de Qwen a MLX 4 bits: https://huggingface.co/Qwen/Qwen3-1.7B-MLX-4bit
- Conversion alternativa de NexaAI: https://huggingface.co/NexaAI/Qwen3-1.7B-4bit-MLX
