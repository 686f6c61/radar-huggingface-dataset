# juaeris/jujunews-05b

## Resumen

JujuNews 0.5B es un modelo de generacion de texto en frances, derivado mediante fine-tuning QLoRA del modelo base Qwen/Qwen2.5-0.5B-Instruct. Lo publica el usuario juaeris bajo el identificador `juaeris/jujunews-05b` y esta orientado a la produccion de texto editorial con una linea ideologica declarada por el autor: soberanismo, critica al "Deep State" y al "globalismo", con un tono directo y anticonformista. El modelo se distribuye unicamente en formato GGUF Q8_0 (531 MB) y esta pensado para su uso con llama.cpp o LM Studio.

Tecnicamente es un modelo muy pequeno: 494.032.768 parametros totales (aproximadamente 0,5B), con una ventana de contexto declarada de 8k tokens. Hereda la arquitectura del Qwen2.5-0.5B-Instruct original, aunque la model card no detalla la arquitectura interna. Su relevancia es limitada fuera del nicho editorial para el que fue creado: no hay resultados de benchmarks publicados, no hay descargas ni valoraciones en el momento de la consulta y su licencia es una licencia comunitaria propia ("jujunews-community") de la que no se publican terminos completos.

El modelo es relevante principalmente como ejemplo de fine-tuning ideologico de un modelo pequeno para un canal editorial concreto, y como caso de estudio de los riesgos de sesgo y desinformacion en modelos ajustados con corpus de una sola fuente. No es una opcion adecuada para tareas generales de produccion, atencion al cliente ni generacion de codigo fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct; no se detalla en la model card) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF Q8_0 (unico formato publicado) |
| Idiomas soportados | frances (fr) |
| Licencia | jujunews-community (licencia propia, terminos no publicados en detalle) |
| Formato de pesos | GGUF (llama.cpp / LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 0,5B parametros. La model card no especifica la arquitectura interna del modelo base ni los detalles de atencion, por lo que no se puede confirmar si conserva todas las caracteristicas del Qwen2.5 original (RoPE, GQA, etc.). El ajuste se realizo mediante QLoRA, segun indica el autor, sobre el checkpoint Instruct del modelo base.

El corpus de entrenamiento declarado combina cuatro fuentes: el corpus editorial propio del canal JujuNews, datos de razonamiento (Dolly, Dolphin, Numina), codigo Python y datos de function calling / agentes, ademas de fabulas y relatos. No se publican el numero de tokens de entrenamiento, la mezcla exacta de proporciones, la configuracion de hiperparametros ni si se aplico RLHF o DPO adicional. Tampoco se detalla el proceso de cuantizacion a Q8_0 mas alla del tamano resultante (531 MB).

## Capacidades

- Generacion de texto en frances con un estilo editorial definido (tono directo, 2 a 4 frases segun el prompt de sistema recomendado).
- Razonamiento basico y respuesta conversacional multi-turno, heredados del modelo base Instruct.
- Generacion de codigo Python, segun los datos de entrenamiento declarados (sin benchmarks que lo respalden).
- Function calling y uso como agente, segun los datos de entrenamiento declarados (sin benchmarks que lo respalden).
- Generacion de fabulas y relatos cortos.
- Capacidad multilingue limitada: el modelo esta etiquetado unicamente para frances, aunque el modelo base Qwen2.5 soporta mas idiomas.
- No se declaran capacidades de vision, audio, modo thinking explicito ni decodificacion especulativa.

## Casos de uso

- Generacion de editoriales y posts breves para el canal JujuNews: el modelo esta ajustado especificamente con el corpus de ese canal y un prompt de sistema recomendado, por lo que produce texto alineado con esa linea editorial en 2 a 4 frases.
- Prototipado de asistentes editoriales de nicho: sirve para experimentar con fine-tuning QLoRA sobre modelos de 0,5B y evaluar como un corpus pequeno desplaza el estilo y las opiniones del modelo base.
- Investigacion sobre sesgo ideologico en modelos pequenos: al estar entrenado con un corpus de una sola linea editorial, es un caso util para estudiar como el fine-tuning introduce sesgos sistematicos en las salidas.
- Despliegue local en equipos con recursos muy limitados: con 531 MB en Q8_0 y ~0,5B parametros, se puede ejecutar en CPU o en GPUs de gama baja mediante llama.cpp o LM Studio, sin necesidad de VRAM dedicada significativa.
- Generacion de relatos cortos y fabulas en frances: el corpus de entrenamiento incluye narrativa, por lo que puede producir textos breves de ficcion con ese registro.
- Pruebas de integracion con LM Studio y llama.cpp: el modelo sirve como banco de pruebas para flujos de importacion de GGUF, configuracion de contexto a 8192 y temperatura alrededor de 0,6.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,8 GB en Q8_0 (531 MB de pesos mas overhead de contexto y cache KV para 8k tokens).
- Cabe en cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.) y tambien en CPU pura.
- GPUs profesionales (A100, H100) no son necesarias; el modelo esta muy por debajo de su capacidad.
- Opciones de despliegue: llama.cpp y LM Studio (soportados oficialmente), ademas de cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en hardware consumer, pero no hay cifras publicadas.
- Configuracion recomendada por el autor: contexto 8192, temperatura aproximadamente 0,6.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| JujuNews 0.5B | 494 M | 8k | fr | jujunews-community | GGUF Q8_0 | No |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32k (segun model card oficial de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF | Si (model card oficial) |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32k (segun model card oficial de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF | Si (model card oficial) |
| SmolLM2-360M-Instruct | ~360 M | 8k | ingles principalmente | Apache 2.0 | safetensors, GGUF | Si (model card oficial) |

La comparativa se limita a modelos de tamano similar; los datos de contexto y licencia de los modelos alternativos provienen de sus model cards oficiales, no de la informacion proporcionada para JujuNews. JujuNews 0.5B no publica benchmarks, por lo que no es posible comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Sesgo ideologico explicito: el modelo esta entrenado para adoptar una linea editorial concreta (soberanismo, critica al "Deep State" y al "globalismo", catolicismo tradicionalista), lo que condiciona todas sus salidas.
- Riesgo elevado de alucinacion: el autor advierte que las salidas "pueden contener opiniones tajantes; no constituyen hechos verificados".
- Modelo experimental: el autor lo describe como destinado a investigacion editorial y uso privado, no a produccion.
- Contexto limitado a 8k tokens, inferior al del modelo base Qwen2.5-0.5B-Instruct (32k segun su model card oficial).
- Soporte unicamente en frances; no se garantiza calidad en otros idiomas.
- Licencia "jujunews-community" con terminos no publicados en detalle: es imprescindible contactar con la organizacion `jujunews` en Hugging Face antes de cualquier uso comercial.
- Sin descargas ni valoraciones en el momento de la consulta, lo que impide validar su calidad de forma independiente.
- El corpus de entrenamiento incluye datos de razonamiento, codigo y function calling, pero no hay evidencia publicada de que estas capacidades funcionen de forma fiable en un modelo de 0,5B.
- No se detallan los hiperparametros de entrenamiento, la mezcla de datos ni el proceso de cuantizacion, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juaeris/jujunews-05b
- Organizacion del autor (referencia de licencia): https://huggingface.co/jujunews
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
