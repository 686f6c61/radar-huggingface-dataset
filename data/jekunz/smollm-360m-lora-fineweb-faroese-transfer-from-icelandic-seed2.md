# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed2

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed2` es un adaptador LoRA publicado por el usuario jekunz sobre SmolLM2-360M-Instruct, orientado a la generacion de texto en feroes. El entrenamiento sigue una estrategia de transferencia linguistica: primero se ajusta el modelo sobre el subconjunto de islandes de FineWeb-2 y despues sobre el de feroes, aprovechando la proximidad genealogica entre ambas lenguas nordicas occidentales para mejorar el rendimiento en un idioma con pocos recursos digitales.

El adaptador emplea LoRA de rango 256 y alpha 512 sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`, con un total de 5 epocas en feroes y 1 en islandes, sobre una unica GPU A100 de 40 GB. Se trata de la semilla 2 de una configuracion de tres semillas, lo que sugiere que el autor esta estudiando la variabilidad del entrenamiento.

Es relevante por dos motivos: por un lado, demuestra una receta de bajo coste para adaptar modelos pequenos a lenguas de bajos recursos como el feroes; por otro, el autor advierte explicitamente de que el modelo esta pensado para su investigacion y no ha sido evaluado de forma amplia, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA |
| Parametros totales | 360M (modelo base); el adaptador LoRA no especifica numero de parametros entrenables en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | feroes (fo); entrenamiento previo en islandes (is) como paso de transferencia |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros desarrollado por Hugging Face. Sobre el se aplica un adaptador LoRA con rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyeccion de salida de la atencion. El adaptador se entrena en dos fases: una primera epoca sobre el subconjunto islandes de FineWeb-2 y cinco epocas sobre el subconjunto feroes del mismo corpus. La hipotesis de transferencia es que el islandes, con mas volumen de datos y estructura morfologica cercana, actua como inicializacion beneficiosa para el feroes.

La configuracion de entrenamiento incluye learning rate 8e-4, scheduler coseno, warmup ratio 0.05, batch size 8 con 32 pasos de acumulacion de gradientes (batch efectivo 256), longitud maxima de 2048 tokens y una unica GPU A100 de 40 GB. Se trata de la semilla 2 de tres ejecuciones con la misma configuracion, lo que permite al autor medir la varianza entre semillas. No se documenta el numero total de tokens vistos, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; tampoco se mencionan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en feroes, heredada de la naturaleza instruct del modelo base SmolLM2-360M-Instruct.
- Transferencia cross-linguistica desde islandes, que puede mejorar la coherencia morfologica y la fluidez en feroes frente a un ajuste directo.
- Capacidades residuales del modelo base en ingles y otros idiomas, aunque no han sido evaluadas tras el ajuste.
- Soporte de conversacion multi-turno limitado por la ventana de 2048 tokens.
- No se documenta soporte verificado de tool calling, function calling, agentes o razonamiento multi-paso en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generacion de texto en feroes para experimentacion linguistica: el adaptador permite generar texto en feroes con un modelo de 360M, util para prototipar corpus sinteticos o estudiar la calidad del transfer desde islandes.
- Investigacion sobre transferencia entre lenguas nordicas: la receta islandes -> feroes sirve como caso de estudio reproducible para medir cuanto ayuda una lengua puente con mas datos a una lengua de bajos recursos.
- Estudio de variabilidad entre semillas: al existir tres semillas de la misma configuracion, se puede analizar la estabilidad del entrenamiento LoRA en regimenes de pocos datos.
- Experimentos de bajo coste en una sola GPU: el entrenamiento cabe en una A100 de 40 GB y la inferencia del adaptador sobre el base de 360M es viable en GPUs de consumo, lo que facilita la reproduccion academica.
- Punto de partida para ajustes posteriores: el adaptador puede servir como inicializacion para tareas especificas en feroes (clasificacion, resumen, dialogo) con datos adicionales.
- Docencia y divulgacion: ejemplo practico de flujo PEFT con `peft` y `transformers` para mostrar como adaptar un modelo pequeno a un idioma minoritario.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines criticos, dado que el autor no ha realizado una evaluacion amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en fp16 ocupa aproximadamente 0,7 GB de pesos; el adaptador LoRA anade una fraccion pequena (repo de 0,4 GB). Con overhead de activaciones y cache KV para 2048 tokens, la inferencia cabe holgadamente en 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 4080 o superiores funcionan sin problema. Tambien es viable en GPUs de gama media como RTX 3060 (12 GB) o incluso en CPU para inferencia lenta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador sobre SmolLM2-360M-Instruct; conversion a GGUF para llama.cpp u Ollama fusionando el adaptador con el base; vLLM y TGI son posibles tras fusionar el adaptador, aunque para un modelo de este tamano el beneficio de servidores de alto throughput es limitado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed2 | 360M (base) + LoRA | 2048 | fo (con transfer desde is) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| SmolLM2-360M-Instruct | 360M | 8192 (segun model card del base) | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| Modelos especializados en feroes de mayor tamano | no disponible | no disponible | fo | no disponible | no disponible |

La comparacion con alternativas especificas para feroes no esta disponible en la informacion proporcionada. Frente al base SmolLM2-360M-Instruct, la diferencia principal es la especializacion linguistica en feroes a costa de posibles perdidas en ingles y en tareas generales, no cuantificadas por el autor.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo es para su investigacion y que no ha sido evaluado de forma amplia; no hay benchmarks publicados.
- Riesgo de alucinacion elevado: es un modelo de 360M ajustado con LoRA sobre un corpus web, sin etapas documentadas de RLHF o DPO que mitiguen respuestas incorrectas.
- Sesgos desconocidos: no se documenta analisis de sesgos; el corpus FineWeb-2 puede arrastrar sesgos de la web.
- Limitacion de contexto: 2048 tokens maximos en entrenamiento, insuficiente para documentos largos o conversaciones extensas.
- Cobertura idiomatica restringida: el ajuste se centra en feroes; el rendimiento en otros idiomas puede degradarse respecto al base.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base SmolLM2 tiene su propia licencia que debe verificarse por separado.
- Al ser la semilla 2 de tres, el rendimiento puede variar entre semillas; conviene evaluar las tres antes de adoptar una.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-icelandic-seed2
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-icelandic
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Libreria PEFT: https://github.com/huggingface/peft
