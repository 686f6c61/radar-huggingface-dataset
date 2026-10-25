# scribekey/scribekey-cleanup-fast-GGUF

## Resumen

ScribeKey Fast es un modelo de limpieza de transcripciones: recibe texto ya transcrito (no audio) y devuelve esa misma transcripcion normalizada, con puntuacion, mayusculas, muletillas eliminadas y un registro ajustable. Lo desarrolla ScribeKey y esta disenado para ejecutarse en el propio dispositivo dentro de un flujo de dictado, no como asistente conversacional general. Esta ficha cubre la build GGUF Q8_0 publicada, de 354.483.968 parametros (clase 350M) y 361,7 MiB en disco.

El modelo es una continuacion de Sotto (de juanquivilla) sobre el base LFM2.5-350M-Base de Liquid AI, y sustituye a Sotto en el producto de ScribeKey. La release `v1` corresponde al paquete `v1-rc1-attribution` con el texto de la model card actualizado; los bytes de los pesos, los terminos y los controles de prompt y runtime no cambian respecto al RC. El experimento interno asociado es `v7-replay-tgt`.

Su relevancia practica esta en el nicho: un modelo pequeno, con latencia de decenas o cientos de milisegundos en movil y una interfaz de prompt muy restringida (tres controles de estilo, estructura y contexto), pensado para integrarse en teclados y apps de dictado con requisitos de privacidad. La contrapartida es que solo existe evaluacion frente a modelos internos y que las propias intervalos de confianza publicados no permiten afirmar superioridad frente a su predecesor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; derivada del modelo base LFM2.5-350M-Base de Liquid AI |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | 4.096 tokens en la configuracion de referencia (`llama-server -c 4096`); no se documenta la longitud nativa maxima |
| Tipos de cuantizacion | Q8_0 unicamente; el autor indica que no incluye bits menores por falta de evaluacion de calidad |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `scribekey-fast-model-terms-v1.0-with-lfm-open-license-v1.0` (LFM Open License v1.0 con condiciones de ingresos, mas terminos adicionales de ScribeKey) |
| Formato de pesos | GGUF |
| Fichero publicado | `scribekey-cleanup-fast-350m-v1-Q8_0.gguf`, 379.219.904 bytes (361,7 MiB), SHA-256 `bbce6fe5dc52080366ea65768f96e8d6265c45c1925d9a2e3d03de32856295cc` |
| Modelo base | `scribekey/scribekey-cleanup-fast` (relacion: quantized) |
| Herramienta de conversion | llama.cpp, commit `4c1a0af40d88c7fbb3b15c85bf2e8016d1d5b64c` (pin de runtime de ScribeKey) |
| Tarea | Limpieza y normalizacion de transcripciones de voz a texto |
| Plantilla de chat | Hereda la plantilla LFM, pero el autor indica explicitamente que no debe usarse el formateo automatico: modo completion en crudo con el prompt de tarea |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Lo que si documenta es la cadena de derivacion: LFM2.5-350M-Base de Liquid AI, pasado por Sotto (de juanquivilla, con aviso MIT preservado en `NOTICE`) y continuado por ScribeKey como ScribeKey Fast. La release publica es la `v1`, experimento `v7-replay-tgt`. No se indican numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO; el autor senala ademas que el historial de datos heredado de Sotto no se ha reconstruido de forma independiente.

El rasgo tecnico definitorio no es la arquitectura sino la interfaz: el prompt es fijo y con plantilla propia. Se construye como `<|startoftext|>### Input:\n{control}\n{raw}\n\n### Output:\n`, donde `control` contiene tres etiquetas obligatorias: estilo (`casual`, `semi-casual`, `semi-formal`, `formal`), estructura (`prose`, `lists`) y contexto (`general`, `email`). La decodificacion evaluada es greedy (`temperature 0`, `top_k 1`, `top_p 1.0`, `repeat_penalty 1.0`, `seed 42`), con un unico BOS, sin mensaje de sistema, sin modo thinking y con `n_predict` de 256 y parada en `###` y `<|im_end|>`. El autor indica que el formateo de listas se completa en la app despues de la generacion, no en el modelo.

Como comprobacion de inferencia, el autor ejecuto dos casos de humo publicos en CPU con BF16 dos veces cada uno, obteniendo salidas identicas (`bf16-smoke.json`); lo califica explicitamente como chequeo de inferencia, no como benchmark de calidad BF16.

## Capacidades

- Limpieza de transcripciones en ingles: eliminacion de muletillas, correccion de puntuacion y mayusculas, normalizacion de texto dictado.
- Control de registro en cuatro niveles: `casual`, `semi-casual`, `semi-formal` y `formal` (por defecto, `semi-casual`).
- Control de estructura de salida: `prose` o `lists`.
- Control de contexto de aplicacion: `general` o `email` (por defecto `semi-formal`/`email` en apps de correo).
- Generacion de texto condicionada a tarea, en modo completion en crudo, con prompt fijo y determinista.
- No soporta tool calling ni function calling segun la informacion disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, vision, audio ni modo thinking; de hecho, el autor prohibe explicitamente el modo thinking en la inferencia evaluada.
- Multilingue: no. Solo ingles.
- No es un asistente conversacional general: el autor lo declara fuera de alcance.

## Casos de uso

- Limpieza en tiempo real de dictado en teclado movil: el modelo recibe la transcripcion cruda del ASR y devuelve texto con puntuacion y registro adecuado antes de insertarlo en el campo de texto. La latencia medida en un S25 Ultra (p50/p95 de 155/178 ms en entradas cortas) encaja con la interaccion de teclado.
- Redaccion de correos por voz: con el control `semi-formal`/`email`, convierte un dictado coloquial en un parrafo de correo con registro y estructura adecuados; la app aplica despues el formato de lista si hace falta.
- Post-procesado de pipelines de ASR en servidor: al ser un GGUF de 361,7 MiB, se puede desplegar con `llama-server` en CPU junto al motor de reconocimiento (el autor cita a Parakeet residente en la misma maquina) para normalizar lotes de transcripciones antes de almacenarlas.
- Notas de reunion y actas: el control `lists` permite obtener enumeraciones de acciones o puntos tratados a partir de una transcripcion larga, dentro de la ventana de 4.096 tokens configurada.
- Accesibilidad y dictado asistido: usuarios con movilidad reducida pueden dictar sin revisar manualmente mayusculas, puntuacion ni muletillas, manteniendo el texto en el dispositivo.
- Procesamiento offline con requisitos de privacidad: al caber en un movil o en un portatil sin GPU dedicada, permite limpiar transcripciones sin enviar contenido a un servicio externo.
- Normalizacion de subtitulos y transcripciones de audio: eliminacion de repeticiones y muletillas del ASR antes de publicar subtitulos, con un modelo de 350M que se puede ejecutar por CPU en paralelo al resto del pipeline.

## Benchmarks y rendimiento

No se han publicado puntuaciones absolutas en la informacion disponible. El autor publica unicamente deltas relativos sobre el benchmark interno CleanBench v1 (3.366 casos, 3.358 puntuados), evaluados en el limite de la app con `semi-casual`/`prose`/`general`:

| Benchmark / metrica | Resultado de esta build (Q8_0) | Comparacion | Intervalo de confianza 95% |
|---|---|---|---|
| CleanBench v1, inserciones exactas | Diferencia de +1,9 pp | Frente a Sotto v6 | −0,1 a +3,9 pp |
| CleanBench v1, tasa de edicion de tokens | Diferencia de −0,001 | Frente a Sotto v6 | −0,010 a +0,009 |
| CleanBench v1, inserciones exactas | Diferencia de −1,2 pp | Frente a S1-mini | −3,3 a +1,1 pp |
| CleanBench v1, metrica de valores nuevos | 4,6% | Absoluta | No disponible |

El propio autor advierte que estos intervalos no establecen superioridad ni equivalencia frente a Sotto v6 ni frente a S1-mini. No hay datos publicados de MMLU, HumanEval, GSM8K ni de benchmarks estandar, y no serian representativos para un modelo de limpieza de transcripciones. El p95 de 2.101 ms para entradas largas en S25 Ultra que se cita habitualmente corresponde a la variante `v7-replay`, no a este candidato final.

## Requisitos de hardware

- VRAM estimada: los pesos Q8_0 ocupan 361,7 MiB; con cache KV para 4.096 tokens y overhead del runtime, el consumo se mantiene holgadamente por debajo de 1 GB en la practica.
- Cabe en cualquier GPU consumer con 1 GB o mas de VRAM, y tambien en CPU y en dispositivos moviles. El autor midio la latencia en un Samsung Galaxy S25 Ultra mediante el helper directo.
- GPU recomendadas: no se documenta ninguna recomendacion de GPU de datacenter (A100, H100); el modelo esta pensado para ejecucion local en movil y en CPU.
- Despliegue documentado: `llama-server` de llama.cpp con el commit fijado `4c1a0af40d88c7fbb3b15c85bf2e8016d1d5b64c`, endpoint `/completion` compatible con el formato OpenAI-like de llama.cpp. El tag del repo incluye `endpoints_compatible`.
- No se documentan ni se han evaluado despliegues con vLLM, TGI, Ollama ni otras herramientas; el unico runtime validado es llamacpp.
- Configuracion de referencia: `-c 4096 -t 2 --temp 0 --seed 42`.
- Latencia medida (S25 Ultra, helper directo, con Parakeet residente): entradas cortas p50 155 ms / p95 178 ms; entradas largas p50 1.702 ms / p95 2.718 ms. El rendimiento en gama media y el rendimiento end-to-end del producto no se han medido.
- Throughput (tokens por segundo) no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en CleanBench v1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScribeKey Fast 350M v1 (Q8_0) | 354.483.968 | 4.096 tokens en la config evaluada | Referencia; +1,9 pp de inserciones exactas frente a Sotto v6 (IC95% −0,1 a +3,9) | Terminos ScribeKey v1.0 + LFM Open License v1.0 (umbral de 10 M USD de ingresos) | Hugging Face, GGUF Q8_0 |
| Sotto v6 (predecesor, de juanquivilla) | No disponible | No disponible | Base de comparacion del delta anterior | MIT segun el aviso preservado en `NOTICE`, sujeto a los terminos de los datos de origen | Referenciado como predecesor; disponibilidad actual no verificada |
| S1-mini | No disponible | No disponible | ScribeKey Fast obtiene −1,2 pp de inserciones exactas (IC95% −3,3 a +1,1), sin superioridad demostrada | No disponible | No disponible |
| LFM2.5-350M-Base (Liquid AI) | Clase 350M (cifra exacta no disponible) | No disponible | No evaluado en CleanBench v1 | LFM Open License v1.0 con condicion de ingresos | Hugging Face, via Liquid AI |

La comparacion es limitada: no hay datos publicos de parametros ni de contexto de Sotto v6, S1-mini ni del base de Liquid AI en la informacion proporcionada, y las diferencias observadas no son estadisticamente concluyentes. No se han identificado en la busqueda web alternativas publicas del mismo nicho (limpieza de transcripciones) con datos comparables.

## Limitaciones y advertencias

- Fidelidad no garantizada: el autor indica explicitamente que la salida puede no ser fiel y recomienda mantener la transcripcion cruda y un mecanismo de fallback.
- La metrica de valores nuevos del benchmark es del 4,6%, por lo que nombres propios, cifras, negaciones y omisiones requieren verificacion.
- Los formatos de lista y de correo pueden ser incorrectos; el formateo de listas se completa en la app, no en el modelo.
- Solo ingles. No hay soporte multilingue documentado.
- No es un asistente conversacional: usarlo con plantilla de chat automatica, mensajes de sistema o modo thinking queda fuera de la inferencia evaluada y degrada el comportamiento esperado.
- Ambito de evaluacion estrecho: un unico benchmark interno (CleanBench v1, 3.366 casos), con intervalos de confianza que impiden afirmar superioridad o equivalencia frente a Sotto v6 y S1-mini. No hay benchmarks publicos independientes ni reproduccion por terceros.
- Cualificacion incompleta: el rendimiento en gama media y el end-to-end del producto estan pendientes; el p95 de 2.101 ms citado frecuentemente corresponde a `v7-replay`, no a esta build final. Las pruebas BF16 en CPU son un chequeo de inferencia, no una evaluacion de calidad.
- Solo se publica Q8_0. No hay builds de 4 o 5 bits con evaluacion de calidad, lo que limita el despliegue en entornos con restricciones severas de memoria.
- Licencia: no es Apache ni MIT. Hereda la LFM Open License v1.0 con su condicion de ingresos; las organizaciones con ingresos anuales iguales o superiores a 10 millones de USD deben obtener terminos separados de Liquid AI antes del uso comercial. Es necesario conservar `ADDITIONAL_TERMS.md`, `LICENSE`, `NOTICE` y `MODIFICATIONS.md` al redistribuir, marcar los cambios y mantener el nombre ScribeKey Fast y el credito al editor en selectores y documentacion; las derivadas modificadas deben indicar "Derived from ScribeKey Fast by ScribeKey".
- Los datos de origen incluyen material CC BY y CC BY-SA y el aviso MIT de Sotto; el autor no resuelve si la clausula share-alike alcanza a los pesos del modelo. No se distribuyen textos ni audios de origen ni las filas ocultas del benchmark.
- El historial de datos heredado de Sotto no se ha reconstruido de forma independiente, y no se implica respaldo de los proyectos upstream.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF
- Modelo base: https://huggingface.co/scribekey/scribekey-cleanup-fast
- Terminos adicionales: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/ADDITIONAL_TERMS.md
- Licencia: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/LICENSE
- Aviso de atribucion: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/NOTICE
- Registro de modificaciones: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/MODIFICATIONS.md
- Resultados de evaluacion: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/evaluation.json
- Ejemplos: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/examples.json
- Plantilla de prompt de tarea: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/prompt-template.jinja
- Pruebas de humo BF16: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/bf16-smoke.json
- Pesos: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/scribekey-cleanup-fast-350m-v1-Q8_0.gguf
- La busqueda web realizada no ha devuelto enlaces tecnicos relevantes sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha y se han descartado.
