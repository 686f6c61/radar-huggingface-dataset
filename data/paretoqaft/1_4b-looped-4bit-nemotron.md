# ParetoQaft/1_4B-looped-4bit-nemotron

## Resumen

1_4B-looped-4bit-nemotron es una cuantizacion W4A16 del modelo ByteDance/Ouro-1.4B, un transformer con arquitectura "looped" (24 capas compartidas que se ejecutan en 4 iteraciones o bucles). La publica el perfil ParetoQaft, centrado en compresion de modelos, y su interes principal reside en la tecnica de cuantizacion: AutoRound 0.9.2 adaptado para calibrar conjuntamente cada bloque compartido sobre las entradas de las cuatro iteraciones, de modo que un unico juego de pesos int4 sirve para todos los bucles. Sin esa adaptacion, la cuantizacion ingenua de un modelo con pesos reutilizados degradaria la senal de forma acumulativa.

El modelo pesa 1.434.652.673 parametros (segun safetensors) y el repositorio ocupa aproximadamente 1,0 GB, con pesos en formato AutoGPTQ (int4 simetrico, group size 128, activaciones en 16 bits). Se distribuye con codigo propio de modelado de Ouro, por lo que requiere `trust_remote_code=True` al cargarlo con transformers. El contexto maximo, los idiomas y la licencia no estan declarados en la informacion disponible.

Es relevante ahora porque demuestra que la cuantizacion de 4 bits a nivel de bloque puede aplicarse a arquitecturas no convencionales (pesos compartidos entre iteraciones) manteniendo una perdida moderada de calidad: en GSM8k 3-shot el modelo cuantizado obtiene 75,4% de exact match frente al 77,9% del BF16 con 4 bucles, es decir, una caida de 2,5 puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (24 capas compartidas, 4 iteraciones) |
| Parametros totales | 1.434.652.673 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (int4 simetrico, group size 128), formato AutoGPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (AutoGPTQ / GPTQ) |

## Arquitectura y entrenamiento

La arquitectura de partida, ByteDance/Ouro-1.4B, es un transformer con 24 capas compartidas que se aplican en 4 bucles sucesivos, de modo que el mismo conjunto de pesos se reutiliza cuatro veces por paso de inferencia. Esta variante no modifica el entrenamiento original: es una cuantizacion post-entrenamiento del checkpoint base.

La cuantizacion se realizo con AutoRound 0.9.2 parcheado especificamente para la arquitectura looped. La innovacion tecnica clave es la calibracion conjunta: cada bloque compartido se calibra sobre sus entradas procedentes de las cuatro iteraciones, con propagacion de entradas cuantizadas (`enable_quanted_input=True`), de forma que los parametros de redondeo aprendidos son validos para todos los bucles. El conjunto de calibracion fue ParetoQaft/nemotron_calib, con 512 muestras de 2048 tokens, 1000 iteraciones, batch de 8, semilla 42 y `enable_alg_ext=True`. No se dispone de informacion sobre el dataset de preentrenamiento de Ouro, el numero de tokens vistos ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento aritmetico basico y problemas de varios pasos: el autor reporta 75,4% de exact match en GSM8k 3-shot.
- Reutilizacion de parametros mediante bucles, lo que reduce el numero de pesos unicos a costa de mas computo por token.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso nativo: no disponible.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Despliegue en GPU de consumo: con 1,43 mil millones de parametros en int4 (repo de 1,0 GB), el modelo cabe en tarjetas de 4-8 GB de VRAM, lo que permite ejecutarlo en equipos de desarrollo modestos y en portatiles con GPU dedicada.
- Prototipado de razonamiento aritmetico: util para validar pipelines de evaluacion tipo GSM8k o generacion de soluciones paso a paso antes de escalar a modelos mayores, aceptando una perdida de ~2,5 puntos frente al BF16.
- Servicio de chat ligero: al ser un modelo conversacional de 1,4B, puede atender respuestas cortas de baja latencia en entornos con recursos limitados, siempre que se valide el idioma y la calidad en el dominio concreto.
- Investigacion sobre cuantizacion de arquitecturas looped: sirve como referencia reproducible (semilla, calibracion y parametros documentados) para estudiar como afecta int4 a modelos con pesos compartidos entre iteraciones.
- Experimentos de eficiencia memoria/computo: permite comparar el mismo modelo en BF16 y W4A16 para medir el compromiso entre huella de memoria y calidad en tareas de razonamiento.
- Base para fine-tuning ligero con QLoRA: al estar en formato GPTQ/AutoGPTQ compatible con transformers, puede servir como punto de partida para adaptaciones de dominio, aunque la licencia no declarada obliga a verificarla antes de uso comercial.

## Benchmarks y rendimiento

| Benchmark | Este modelo (W4A16, 4 bucles) | BF16, 4 bucles |
|---|---|---|
| GSM8k (3-shot, 1319 preguntas), exact match | 75,4% | 77,9% |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos int4, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para uso basico; A100/H100 no son necesarias por tamano, pero pueden aportar throughput en serving por lotes.
- GPU de consumo: si, cabe en RTX 3060 12 GB, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo de modelado de Ouro incluido); el formato AutoGPTQ permite teoricamente su uso con kernels GPTQ, pero la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. Notese que la arquitectura looped implica 4 pasadas por las mismas capas, por lo que el coste computacional por token es mayor que el de un transformer de 24 capas convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1_4B-looped-4bit-nemotron | 1,43B (24 capas x 4 bucles) | no disponible | W4A16 AutoGPTQ | no disponible | Hugging Face (ParetoQaft) |
| ByteDance/Ouro-1.4B (base) | 1,43B (24 capas x 4 bucles) | no disponible | BF16 | no disponible | Hugging Face (ByteDance) |
| Alternativas de ~1-2B densos (p. ej. familias tipo Qwen, Llama o SmolLM) | 1-2B | variable | multiples | variable | Hugging Face |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa queda limitada al par base/cuantizado del mismo modelo.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: 2,5 puntos de exact match en GSM8k respecto al BF16; en otras tareas la degradacion podria ser mayor y no esta medida.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los terminos del modelo base ByteDance/Ouro-1.4B y del autor de la cuantizacion.
- Idiomas no declarados: no hay garantia de calidad fuera del idioma o idiomas con los que se entreno el modelo base.
- Contexto maximo desconocido: no se debe asumir una ventana larga; conviene validar la longitud efectiva antes de disenar aplicaciones multi-turno.
- Riesgo de alucinacion: inherente a un modelo de 1,4B; en tareas factuales o de codigo en produccion requiere verificacion externa.
- Dependencia de `trust_remote_code=True`: implica ejecutar codigo del repositorio, lo que anade riesgo de seguridad y complica la integracion en entornos restringidos.
- Compatibilidad de serving no confirmada: el formato AutoGPTQ con arquitectura looped puede no funcionar directamente en vLLM, TGI o llama.cpp.
- Coste computacional: los 4 bucles sobre 24 capas compartidas aumentan el computo por token frente a un transformer denso de tamano similar, lo que afecta a la latencia y al throughput.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad; conviene reproducir la evaluacion de GSM8k antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParetoQaft/1_4B-looped-4bit-nemotron
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B
- Dataset de calibracion: https://huggingface.co/datasets/ParetoQaft/nemotron_calib
- Perfil del autor: https://huggingface.co/ParetoQaft
