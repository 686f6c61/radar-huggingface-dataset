# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT sobre SmolLM2-360M-Instruct, afinado en dos fases: primero sobre la porcion en noruego bokmal de FineWeb-2 y despues sobre la porcion en feroes del mismo corpus. Lo publica el usuario `jekunz` como parte de una investigacion personal sobre transferencia entre lenguas nordicas de bajos recursos, y se corresponde con la semilla 3 de tres ejecuciones con la misma configuracion. El resultado es un adaptador especializado en generacion de texto en feroes (`fo`), no un modelo completo con pesos fusionados.

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de aproximadamente 360 millones de parametros con ventana de contexto de 2048 tokens. El adaptador emplea LoRA de rango 256 y alpha 512 sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`, lo que supone un ajuste relativamente agresivo para un modelo de este tamano. El repositorio ocupa 0,4 GB y se distribuye con licencia Apache 2.0.

La relevancia practica es limitada pero clara: demuestra una receta reproducible de adaptacion de un modelo pequeno a una lengua con pocos recursos como el feroes, partiendo de una lengua relacionada con mas corpus disponible. No obstante, el propio autor advierte de que el modelo no ha sido evaluado de forma amplia y que su proposito es la investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre SmolLM2-360M-Instruct) |
| Parametros totales | Aproximadamente 360 M en el modelo base; el adaptador LoRA anade pesos de rango 256 sobre cuatro proyecciones (no se especifica el numero exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos del adaptador en safetensors; no se documentan variantes GGUF ni cuantizaciones del adaptador) |
| Idiomas soportados | Feroes (`fo`); el entrenamiento intermedio se realizo en noruego bokmal |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de la familia SmolLM2 con atencion causal estandar y contexto de 2048 tokens. La configuracion LoRA usa rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyeccion de salida de la atencion. No se modifican las proyecciones `q_proj`, `k_proj` ni `v_proj`, lo que concentra la adaptacion en la transformacion de representaciones y en la salida de atencion.

El entrenamiento se realizo en dos etapas: una epoca sobre la porcion en noruego bokmal de FineWeb-2 y cinco epocas sobre la porcion en feroes del mismo dataset. Se uso tasa de aprendizaje 8e-4 con scheduler coseno, warmup del 5%, batch size 8, acumulacion de gradientes de 32 pasos (batch efectivo 256) y una unica GPU A100 de 40 GB. La semilla empleada es 3, una de tres ejecuciones con identica configuracion. No se documenta el numero total de tokens procesados, la composicion exacta del subconjunto de FineWeb-2 ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto autoregresiva en feroes, heredada de la capacidad del modelo base y adaptada mediante el ajuste en FineWeb-2.
- Conversacion multi-turno basica, ya que el modelo base es la variante Instruct de SmolLM2.
- Transferencia entre lenguas nordicas: el ajuste intermedio en noruego bokmal actua como puente antes del ajuste en feroes.
- Capacidad multilingue residual del modelo base, aunque el adaptador solo declara feroes como idioma objetivo.
- No se documenta soporte de tool calling ni function calling especifico para este adaptador.
- No se documenta soporte de agentes, razonamiento multi-paso, modo thinking, vision ni audio.
- No se documentan capacidades especificas de codigo o matematicas mas alla de las del modelo base.

## Casos de uso

- Generacion de texto en feroes para experimentacion linguistica: el adaptador permite producir texto en una lengua de bajos recursos partiendo de un modelo de 360 M, util para prototipos de NLP en feroes sin infraestructura grande.
- Investigacion sobre transferencia entre lenguas nordicas: sirve como punto de partida reproducible (semilla 3 de 3) para estudiar el efecto del preajuste en noruego bokmal antes del ajuste en feroes.
- Aumento de datos sinteticos en feroes: se puede usar para generar corpus auxiliares de texto en feroes que alimenten otros entrenamientos o evaluaciones, con revision humana posterior.
- Prototipado de asistentes conversacionales en feroes: al derivar de SmolLM2-360M-Instruct, permite construir demos de chat ligero en feroes en hardware modesto.
- Experimentos de ablation y comparacion de semillas: al existir tres semillas con la misma configuracion, facilita analisis de varianza en el ajuste fino de lenguas de bajos recursos.
- Educacion y docencia sobre PEFT: el repositorio ilustra una receta completa de LoRA con rango, alpha, modulos objetivo y hiperparametros documentados, util como ejemplo practico en cursos de ajuste fino.
- Evaluacion de calidad de corpus FineWeb-2 en feroes: el adaptador puede emplearse como sonda para medir como afecta el subconjunto de FineWeb-2 en feroes al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa 0,4 GB; sumado al modelo base SmolLM2-360M-Instruct en precision completa (fp32) rondaria 1,5 GB, y en fp16/bf16 alrededor de 0,8-1 GB. Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para el modelo base en fp16; el entrenamiento se realizo en una A100 de 40 GB con batch efectivo 256.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o similares con 8 GB o mas, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con la libreria `peft`; es compatible con frameworks de inferencia que soporten LoRA (por ejemplo, vLLM o TGI con soporte de adaptadores), aunque no se documenta compatibilidad explicita. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroes) | ~360 M (base) + adaptador LoRA | 2048 | Feroes | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-360M-Instruct (modelo base) | ~360 M | 2048 | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptador hermano `jekunz/smollm-360m-lora-fineweb-norwegian-bokmaal` | ~360 M (base) + adaptador LoRA | 2048 | Noruego bokmal | Apache 2.0 | Hugging Face |
| Otros adaptadores de la misma familia (semillas 1 y 2) | ~360 M (base) + adaptador LoRA | 2048 | Feroes | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo es para su investigacion y que no ha sido evaluado de forma amplia; no debe asumirse calidad de produccion.
- Al ser un adaptador LoRA, no es un modelo autonomo: requiere cargar el modelo base `jekunz/smollm-360m-lora-fineweb-norwegian-bokmaal` y aplicar el adaptador con PEFT.
- El contexto maximo documentado es de 2048 tokens, insuficiente para tareas que requieran ventanas largas.
- El unico idioma declarado es el feroes; el rendimiento en otros idiomas no esta caracterizado y puede degradarse respecto al modelo base.
- Riesgo de alucinacion inherente a un modelo de 360 M entrenado sobre corpus web (FineWeb-2), sin filtrado ni evaluacion documentados.
- Posibles sesgos heredados de FineWeb-2 y del modelo base SmolLM2, no analizados por el autor.
- El ajuste se realizo con una sola semilla (la 3 de 3); la varianza entre semillas no esta documentada.
- No se documentan restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0, que permite uso comercial, pero la falta de evaluacion desaconseja su uso en produccion sin validacion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-norwegian-bokmaal
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original SmolLM2-360M-Instruct: no disponible en la informacion proporcionada
- Paper de SmolLM2: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
