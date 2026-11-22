# Meridian21Lab/full-attention-140m-11.5bt

## Resumen

full-attention-140m-11.5bt es un modelo de lenguaje base en ingles de 141,5 millones de parametros desarrollado por Meridian21Lab (proyecto MrCogito) y entrenado desde cero sobre 11.500 millones de tokens de datos publicos con un coste aproximado de 200 dolares. Su funcion principal es servir como referencia de "atencion completa" para la familia de modelos de memoria de Meridian21: todos ellos comparten capas, datos, orden de entrenamiento y presupuesto, y solo se diferencia la capa de lectura, de modo que las comparaciones entre ellos son controladas.

La innovacion del proyecto no esta en este modelo, sino en el uso que se hace de el: es la linea base contra la que se miden alternativas como concept-memory-140m-11.5bt, topic-index-140m-11.5bt o catalogue-150m-11.5bt, que sustituyen la atencion completa por mecanismos de memoria mas baratos para longitudes que la atencion cuadratica no puede asumir. Este modelo usa atencion completa estandar con posiciones rotatorias (RoPE) hasta la longitud de entrenamiento de 64k tokens.

Es relevante por su eficiencia: con solo 11,5B tokens supera a Pythia-160M entrenado con hasta 300B tokens en gramatica y en el test de ciencia ARC-Easy, y alcanza 80,13 % en BLiMP, practicamente empatado con SmolLM2-135M final (80,15 %) que uso unos 2 billones de tokens. Se publica como modelo de investigacion, sin ajuste de instrucciones, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion completa (perceiver_ar, custom_code), posiciones rotatorias (RoPE) |
| Parametros totales | 141.506.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 64k tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 141,5M de parametros con una unica capa de lectura de atencion completa: cada token relee todos los tokens anteriores del documento mediante atencion cuadratica estandar con posiciones rotatorias, hasta la longitud de entrenamiento de 64k tokens. La implementacion se distribuye como codigo personalizado (`perceiver_ar`, `custom_code`) y requiere `trust_remote_code=True` al cargarse con `AutoModelForCausalLM.from_pretrained`.

El entrenamiento se realizo desde cero sobre 11,5B tokens con un presupuesto de computo de aproximadamente 26 horas en un nodo spot de 4 GPU (unos 200 dolares). Las fuentes de datos son exclusivamente datasets publicos de Hugging Face: Nemotron-CC-v2, Nemotron-CC-Math-v1, Nemotron-Pretraining-Specialized-v1, dclm-edu, subconjuntos filtrados de Common Pile (Stack v2 edu, Project Gutenberg, arXiv, DOAB, USGPO, UK Hansard), Dolma3 Longmino pool y smol-smoltalk. El modelo es base, sin ajuste por instrucciones ni RLHF/DPO declarado, y se entreno con una sola semilla. El registro completo del entrenamiento esta disponible en W&B.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre documentos de hasta 64k tokens en una sola pasada.
- Modelado de lenguaje y evaluacion de perplejidad a nivel de byte (WikiText-2: 1,955 bits por byte).
- Conocimiento gramatical: 80,13 % de precision en BLiMP (67 conjuntos, 0-shot).
- Razonamiento basico de conocimiento general: 49,75 % en ARC-Easy (0-shot).
- Lectura de documentos largos: 0,812 bits por byte en las ultimas paginas de 55 documentos retenidos de 64k tokens.
- No dispone de tool calling, function calling, modo thinking, vision ni audio.
- No esta ajustado para seguir instrucciones ni para conversacion multi-turno (aunque incluye smol-smoltalk en el preentrenamiento, se distribuye como modelo base).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Linea base de investigacion en eficiencia de contexto: sirve para medir cuanto pierde (o gana) un mecanismo de memoria alternativo frente a atencion completa sobre los mismos datos y presupuesto, como hace el propio proyecto con concept-memory, topic-index y catalogue.
- Evaluacion de mecanismos de atencion: al compartir capas y datos con las otras variantes, permite aislar el efecto de la capa de lectura en tareas como RULER a 16k tokens o perplejidad en documentos largos.
- Prototipado de modelado de lenguaje en ingles con recursos minimos: con 0,6 GB de pesos y 2,5 GB de VRAM para un documento de 64k tokens en una RTX 3090, es viable en una sola GPU de consumo.
- Experimentos academicos de scaling laws a pequena escala: reproduce recetas de preentrenamiento con presupuesto de 200 dolares y trazabilidad completa (datasets publicos, run de W&B, ficheros de resultados en el repo).
- Puntuacion y filtrado de documentos largos: puede asignar probabilidad a pasajes extensos en una pasada, util para deduplicacion o seleccion de datos de entrenamiento.
- Ensenanza y divulgacion: ejemplo reproducible de un pipeline completo de preentrenamiento (tokenizacion, datos, evaluacion BLiMP/ARC/WikiText) con codigo abierto.
- Fine-tuning posterior para tareas concretas de NLP en ingles cuando no se requiere seguir instrucciones de forma nativa.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Gramatica (67 conjuntos, 0-shot) | BLiMP | accuracy (%) | 80,13 |
| Cuestionario de ciencia (0-shot) | ARC-Easy (test) | accuracy (%) | 49,75 |
| Modelado de lenguaje | WikiText-2 | perplejidad por byte (menor es mejor) | 1,955 |

Comparaciones citadas en la model card: en el Tiny-ML Leaderboard (modelos de hasta 150M parametros) ocupa la posicion 23 de 101 y la 13 por calidad pura; empata en gramatica con SmolLM2-135M final (80,15 %). Frente a Pythia-160M en el mismo presupuesto (10,5B y 12,6B tokens) le saca 1,9-2,2 puntos en gramatica y 7,0-7,2 en ARC-Easy. En documentos de 64k tokens obtiene 0,812 bits por byte, frente a 0,832 de SmolLM2-135M final, 0,942 de Pythia-160M y 0,805 de Gemma 3 270M (el doble de tamano y 6T tokens de entrenamiento). En RULER a 16k, los modelos de memoria del mismo proyecto alcanzan 0,36-0,44 frente a 0,25 de este modelo.

## Requisitos de hardware

- VRAM: aproximadamente 2,5 GB de GPU para puntuar un documento completo de 64k tokens en una pasada (dato del autor); los pesos en safetensors ocupan unos 0,6 GB en el repo.
- GPU recomendadas: una RTX 3090 es suficiente segun el autor; cualquier GPU con al menos 4-8 GB de VRAM deberia cubrir inferencia en fp16/bf16 para contextos menores.
- Cabe en GPU de consumo: si, con margen amplio (RTX 3090, RTX 4090, series 20/30/40 con suficiente VRAM).
- Despliegue: carga con `transformers` y `trust_remote_code=True`; el codigo personalizado puede limitar el soporte directo en vLLM, TGI o llama.cpp, por lo que la via documentada es transformers.
- Latencia: aproximadamente 1,2 s para puntuar un documento de 64k tokens en una RTX 3090 (dato del autor). Throughput de generacion no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | BLiMP | ARC-Easy | Licencia |
|---|---|---|---|---|---|---|
| full-attention-140m-11.5bt | 141,5M | 11,5B | 64k | 80,13 | 49,75 | Apache 2.0 |
| SmolLM2-135M (final) | 135M | ~2T | no disponible en la informacion | 80,15 | no disponible en la informacion | Apache 2.0 |
| Pythia-160M | 160M | hasta 300B | no disponible en la informacion | 1,9-2,2 puntos por debajo en el mismo presupuesto | 7,0-7,2 puntos por debajo en el mismo presupuesto | Apache 2.0 |
| Gemma 3 270M | 270M | 6T | no disponible en la informacion | no disponible | no disponible | licencia Gemma |

En perplejidad por byte sobre documentos de 64k tokens: full-attention 0,812; SmolLM2-135M final 0,832; Pythia-160M 0,942; Gemma 3 270M 0,805.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue ordenes de forma fiable ni mantiene conversaciones; requiere fine-tuning para uso en producto.
- Solo ingles; no hay soporte multilingue declarado.
- Entrenado con una sola semilla y un presupuesto muy reducido (11,5B tokens), por lo que su conocimiento factual es limitado y el riesgo de alucinacion en generacion abierta es alto.
- La atencion completa es cuadratica: el coste crece con la longitud y no escala mas alla de los 64k tokens de entrenamiento.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente; las comparaciones con SmolLM2, Pythia y Gemma provienen del mismo harness del autor.
- El codigo personalizado (`trust_remote_code=True`) implica ejecutar codigo del repositorio; conviene revisarlo antes de desplegarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigacion sin garantias de calidad, no es adecuado como componente critico sin evaluacion propia.
- El modelo se distribuye como referencia para comparar mecanismos de memoria; en RULER a 16k rinde peor que las variantes de memoria del mismo proyecto, lo que conviene tener en cuenta si el caso de uso exige recuperacion de hechos lejanos.

## Enlaces

- Hugging Face: https://huggingface.co/Meridian21Lab/full-attention-140m-11.5bt
- Pagina del proyecto: https://ai.ksopyla.com/projects/concept-reasoning/
- Codigo: https://github.com/ksopyla/MrCogito/tree/1fddc505
- Detalles de evaluacion: EVALUATION.md (en el repositorio del modelo)
- Entrenamiento en W&B: https://wandb.ai/ksopyla/MrCogito/runs/perceiver_ar_perceiver_H896L3g1s9N128_20261119_094659_dense_rope_m120t_long
- Modelo hermano concept-memory: https://huggingface.co/Meridian21Lab/concept-memory-140m-11.5bt
- Modelo hermano topic-index: https://huggingface.co/Meridian21Lab/topic-index-140m-11.5bt
- Modelo hermano catalogue: https://huggingface.co/Meridian21Lab/catalogue-150m-11.5bt
