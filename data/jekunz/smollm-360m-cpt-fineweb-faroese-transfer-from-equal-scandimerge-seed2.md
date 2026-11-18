# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed2

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed2` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz, orientado a la generacion de texto en feroes (fo). Se construye en dos fases: primero se aplica un ajuste sobre una mezcla TIES con pesos iguales de cinco modelos entrenados en danes, islandes, noruego bokmal, noruego nynorsk y sueco, y despues se continua el entrenamiento sobre la porcion en feroes del corpus FineWeb-2. El resultado es un modelo pequeno (361,8 millones de parametros) especializado en una lengua de bajos recursos.

La relevancia del modelo reside en su enfoque de transferencia interlinguistica: aprovecha el parentesco del feroes con las lenguas escandinavas continentales para compensar la escasez de datos monolingues. Con 360M de parametros y una ventana de contexto de 2.048 tokens, esta pensado para experimentacion e investigacion, no para produccion. El autor indica explicitamente que no ha sido evaluado de forma amplia.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face (metadatos y model card). No hay resultados de benchmarks ni evaluaciones independientes disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | feroes (fo) como objetivo; exposicion previa a danes, islandes, noruego bokmal, noruego nynorsk y sueco durante la fase de merge |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama, heredada de SmolLM2-360M-Instruct. El entrenamiento se realizo en dos etapas: (1) ajuste sobre un merge TIES con pesos iguales de cinco modelos entrenados en danes, islandes, noruego bokmal, noruego nynorsk y sueco; (2) entrenamiento de continuacion (CPT) sobre la porcion en feroes de FineWeb-2. No se especifica el numero total de tokens procesados ni la composicion exacta del dataset mas alla de la fuente FineWeb-2.

Hiperparametros declarados: 1 epoca por lengua de origen y 5 epocas en feroes, learning rate 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con acumulacion de gradientes de 32 pasos (batch efectivo 256), longitud maxima de contexto 2.048 tokens, semilla 2 (una de tres semillas de esta configuracion) y una unica GPU A100 de 40 GB. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en feroes, heredada de la base instruct y reforzada con datos de FineWeb-2.
- Transferencia interlinguistica desde lenguas escandinavas continentales hacia el feroes.
- Generacion de texto general (no se documentan capacidades especificas de codigo o matematicas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al feroes como idioma objetivo; no se garantiza calidad en otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion en transferencia interlinguistica: permite estudiar como el conocimiento de lenguas escandinavas continentales se transfiere a una lengua de bajos recursos como el feroes, comparando las tres semillas de la configuracion.
- Generacion de texto en feroes para prototipos: util para crear borradores o contenido sintetico en feroes en entornos de experimentacion donde no se requiere calidad de produccion.
- Aumento de datos para lenguas de bajos recursos: puede generar texto sintetico en feroes para ampliar corpus de entrenamiento de modelos mayores, con revision humana posterior.
- Experimentos de merge de modelos: sirve como caso de estudio de la tecnica TIES aplicada a un conjunto de lenguas emparentadas antes de un ajuste especifico.
- Evaluacion comparativa de semillas: al existir tres semillas de la misma configuracion, permite medir la varianza de resultados en tareas de generacion en feroes.
- Docencia y divulgacion: modelo de 360M que cabe en hardware modesto y permite demostrar pipelines de ajuste fino y CPT en un contexto academico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo "no ha sido evaluado mas ampliamente todavia".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB para los pesos, mas overhead de activaciones y cache KV (en torno a 1-2 GB en total para contextos de 2.048 tokens).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,4 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660); tambien cabe en CPU.
- Cabe en GPU consumer: si, con margen amplio.
- Opciones de despliegue: transformers, text-generation-inference (el modelo declara endpoints_compatible), llama.cpp y Ollama mediante conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-360M ajustado a feroes) | 361,8 M | 2.048 | fo (con transferencia escandinava) | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (base) | 361,8 M | 8.192 (contexto nativo de la base) | multilingue | Apache 2.0 | Hugging Face |
| Modelos especificos para feroes de mayor tamano | no disponible | no disponible | fo | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado de forma amplia: el autor lo declara como herramienta de investigacion, sin validacion en tareas estandar.
- Riesgo de alucinacion elevado por su tamano (360M) y por el entrenamiento de continuacion sobre texto web sin filtrado documentado.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para tareas de contexto largo.
- Cobertura linguistica restringida al feroes; el rendimiento en otras lenguas no esta garantizado y puede degradarse respecto a la base.
- Posible olvido catastrofico de capacidades instruct tras el CPT en feroes; no se documenta una fase de alineacion posterior.
- Sesgos no documentados: al entrenar sobre FineWeb-2 no se detalla el filtrado de contenido ni la demografia del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion desaconseja su uso en produccion sin validacion previa.
- Solo se publica una de las tres semillas de la configuracion; la reproducibilidad completa requiere las otras dos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed2
- Modelo base del ajuste: https://huggingface.co/jekunz/smollm360m-da1-is1-nno1-nob1-sv1-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia base): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
