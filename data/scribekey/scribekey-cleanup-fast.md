# scribekey/scribekey-cleanup-fast

## Resumen

ScribeKey Fast es un modelo de lenguaje de 354 millones de parametros especializado en la limpieza de transcripciones de voz a texto (ASR) en ingles. Lo desarrolla ScribeKey y deriva de la familia LFM2.5-350M de Liquid AI, pasando por un ajuste fino intermedio de juanquivilla (Sotto) y una version propia de ScribeKey. No procesa audio: recibe texto y devuelve texto limpio, eliminando muletillas, repeticiones y corrigiendo puntuacion, mayusculas y estructura segun una linea de control.

La version actual, v1.1, mantiene la misma arquitectura, tokenizador, prompt y controles que la v1, pero mejora el manejo de autocorrecciones habladas del tipo "tres, no, en realidad cuatro". Su tamano reducido permite ejecucion en dispositivo (el artefacto Q8_0 GGUF ocupa unos 361,7 MiB), lo que lo hace adecuado para dictado en movil sin depender de la nube.

Es relevante para desarrolladores que construyen aplicaciones de dictado o transcripcion que necesitan un postprocesado de texto determinista, ligero y con latencia baja, en lugar de recurrir a un asistente generalista de mayor tamano. El modelo esta pensado como componente de un pipeline, no como chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Liquid AI LFM2.5-350M, 16 capas |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en el perfil de aplicacion evaluado; el limite mayor de la arquitectura no se considera probado para limpieza |
| Tipos de cuantizacion | BF16 (pesos publicados en este repo); Q8_0 GGUF en repo separado |
| Idiomas soportados | ingles (en) |
| Licencia | ScribeKey Fast Model Terms v1.0 + LFM Open License v1.0 (con avisos MIT heredados de Sotto) |
| Formato de pesos | safetensors (BF16); GGUF Q8_0 en repositorio aparte |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LFM2.5-350M de Liquid AI y consta de 16 capas con 354.483.968 parametros almacenados. La linea de descendencia es LFM2.5-350M-Base, luego el ajuste Sotto de juanquivilla, despues la version Sotto v6 de ScribeKey y finalmente ScribeKey Fast v1.1. Se distribuye como pesos BF16 fusionados con su tokenizador (fichero de pesos de 708.984.464 bytes).

El ajuste fino se realizo sobre el dataset `juanquivilla/sotto-transcript-cleanup`. La model card no detalla el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo RLHF o DPO. La innovacion practica del modelo es el formato de tarea: una linea de control con tres ejes (estilo, estructura y contexto) precede a la transcripcion cruda, y el modelo genera unicamente el texto limpio. El entrenamiento cubre esos valores de control, aunque la adherencia es imperfecta segun el autor. La decodificacion recomendada es greedy (temperatura 0, top-k 1, top-p 1, sin penalizacion de repeticion).

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas, repeticiones y aplica correcciones habladas.
- Ajuste de puntuacion, mayusculas y disposicion del texto de salida (puede incluir saltos de linea).
- Control de estilo mediante valores `casual`, `semi-casual`, `semi-formal` y `formal`; el modo formal expande contracciones.
- Control de estructura mediante `prose` o `lists`; se recomienda `prose` porque la recuperacion de listas es baja.
- Control de contexto mediante `general` o `email`; el modo email aplica formato de saludo, cuerpo y despedida ya dictados, sin inventarlos.
- Manejo de autocorrecciones habladas ("tres, no, en realidad cuatro"), mejorado en v1.1.
- Generacion determinista con decodificacion greedy y parada en EOS (`<|im_end|>`) o en un nuevo delimitador `###`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Dictado en aplicaciones moviles: el modelo limpia la transcripcion en el propio dispositivo con el artefacto Q8_0 de 361,7 MiB, evitando enviar texto a la nube. En v1, con la misma arquitectura y tamano, se midieron latencias p50/p95 de 155/178 ms en dictados cortos y de 1.702/2.718 ms en largos sobre un S25 Ultra.
- Postprocesado de transcripciones de reuniones: se trocea el texto en fronteras de frase y se aplica el modelo por fragmentos para eliminar muletillas y normalizar puntuacion antes de almacenar las notas.
- Redaccion de correos por voz: con el contexto `email` y estilo `semi-formal`, el modelo estructura un saludo, cuerpo y despedida ya dictados, sin anadir contenido nuevo.
- Normalizacion de subtitulos generados por ASR: se corrige puntuacion y mayusculas manteniendo el texto en prosa, apto para publicacion o indexacion.
- Integracion en pipelines de CI o backend: al ser un modelo de 350M con formato de prompt fijo, se puede desplegar con Transformers o llama.cpp y ejecutar en lote sobre transcripciones almacenadas para limpieza retroactiva.
- Preprocesado para busqueda y analitica: limpiar transcripciones antes de indexarlas reduce ruido y mejora la calidad de las consultas sobre texto dictado.
- Asistentes de accesibilidad: convertir dictado desordenado en texto legible en tiempo real en dispositivos de gama media gracias al bajo consumo de memoria del Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta latencias de la version v1 con la misma arquitectura y tamano en un S25 Ultra (p50/p95 de 155/178 ms en dictados cortos y 1.702/2.718 ms en largos) y dos casos de humo BF16 en CPU con salidas identicas, que el autor describe como comprobacion de inferencia y no como benchmark de calidad.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan unos 709 MB; en FP32 la huella ronda 1,4 GB. El Q8_0 GGUF ocupa 361,7 MiB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre para BF16; el Q8_0 cabe en CPU y en GPUs integradas.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas para el Q8_0.
- Opciones de despliegue: Transformers (requiere version con soporte `Lfm2ForCausalLM`; el checkpoint se guardo con Transformers 5.2.0) y llama.cpp mediante el GGUF Q8_0. No se confirma soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: latencias medidas solo para v1 en S25 Ultra (ver seccion de benchmarks); la latencia del Q8_0 v1.1 no se ha medido aun.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScribeKey Fast v1.1 | 354M | 4.096 tokens (perfil evaluado) | Limpieza de transcripciones en ingles | ScribeKey Fast Model Terms v1.0 + LFM Open License v1.0 | Hugging Face, BF16 y GGUF Q8_0 |
| juanquivilla/sotto-cleanup-lfm25-350m | 350M (familia) | no disponible | Limpieza de transcripciones (modelo base del ajuste) | no disponible | Hugging Face |
| LiquidAI/LFM2.5-350M-Base | 350M (familia) | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado para otros idiomas.
- La adherencia a los controles de estilo, estructura y contexto es imperfecta segun el propio autor.
- La recuperacion de listas es baja; se recomienda usar `prose` y aplicar un formateador determinista posterior.
- El modo email puede cometer errores y no debe inventar saludos ni despedidas.
- El techo de 256 tokens de salida de la aplicacion puede truncar generaciones largas; el contexto mayor de la arquitectura no esta probado para limpieza, por lo que conviene trocear en fronteras de frase.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo puede alterar contenido al normalizar.
- La licencia no es estandar: combina ScribeKey Fast Model Terms v1.0 con LFM Open License v1.0 y avisos MIT heredados; es necesario revisar los terminos antes de uso comercial.
- La latencia y memoria del Q8_0 v1.1 no se han medido; las cifras citadas corresponden a v1.
- No es un asistente general ni soporta conversaciones multi-turno, tool calling ni agentes; usarlo fuera de su formato de tarea produce resultados no validados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scribekey/scribekey-cleanup-fast
- Artefacto GGUF Q8_0: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF
- Terminos adicionales de licencia: https://huggingface.co/scribekey/scribekey-cleanup-fast/blob/main/ADDITIONAL_TERMS.md
- Dataset de entrenamiento: https://huggingface.co/datasets/juanquivilla/sotto-transcript-cleanup
- Modelo base intermedio: https://huggingface.co/juanquivilla/sotto-cleanup-lfm25-350m
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
