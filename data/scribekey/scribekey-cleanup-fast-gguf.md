# scribekey/scribekey-cleanup-fast-GGUF

## Resumen

ScribeKey Fast es un modelo de limpieza de transcripciones (transcript cleanup) para ingles, desarrollado por ScribeKey. No es un asistente conversacional general ni un modelo de reconocimiento de voz: recibe texto ya transcrito y devuelve ese texto normalizado, corrigiendo muletillas, autocorrecciones habladas y puntuacion. La version aqui descrita es la cuantizacion GGUF Q8_0 del checkpoint `v1.1`, publicada en octubre de 2026.

El modelo parte de la familia LFM2.5 de Liquid AI: concretamente deriva de Sotto (de juanquivilla), construido sobre LFM2.5-350M-Base. Con 354.483.968 parametros totales, es un modelo de clase 350M disenado para ejecutarse en local con latencia baja, incluido en telefonos moviles. Su relevancia actual esta en el nicho de dictado y post-procesado de ASR, donde un modelo pequeno y especializado puede superar a un LLM grande en coste y latencia.

La version `v1.1` sustituye a `v1` manteniendo arquitectura, tamano, prompt y controles, y mejora el tratamiento de autocorrecciones habladas. La distribucion se hace bajo una licencia compuesta (terminos propios de ScribeKey mas LFM Open License v1.0), no bajo Apache ni MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de LFM2.5-350M-Base (via Sotto); detalles de capas no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue con `-c 4096`); maximo nativo no disponible |
| Tipos de cuantizacion | Solo Q8_0 evaluada y publicada; cuantizaciones de menor bit no incluidas por no haber sido evaluadas |
| Idiomas soportados | Ingles (en) |
| Licencia | scribekey-fast-model-terms-v1.0-with-lfm-open-license-v1.0 (LFM Open License v1.0 con condicion de ingresos comerciales) |
| Formato de pesos | GGUF (fichero `scribekey-cleanup-fast-350m-v1.1-Q8_0.gguf`, 379.219.904 bytes / 361,7 MiB) |

## Arquitectura y entrenamiento

El modelo es una continuacion de Sotto, que a su vez se basa en LFM2.5-350M-Base de Liquid AI. La model card no detalla el numero de capas, cabezas de atencion ni si emplea atencion lineal u otras variantes de la familia LFM; esa informacion figura como no disponible. El checkpoint conserva la plantilla de chat heredada de LFM, pero el autor advierte explicitamente de que no debe usarse el formateo automatico de chat: la inferencia debe hacerse en modo de completado crudo con un prompt de tarea exacto que incluye un token BOS (`<|startoftext|>`), un bloque `### Input:` con controles y texto, y un bloque `### Output:`.

El prompt incorpora tres controles discretos: estilo (`casual`, `semi-casual`, `semi-formal`, `formal`), estructura (`prose`, `lists`) y contexto (`general`, `email`). La decodificacion recomendada es greedy (`temperature 0`, `top_k 1`, `top_p 1.0`, `repeat_penalty 1.0`, `seed 42`), sin mensaje de sistema y sin modo thinking. La conversion y cuantizacion se realizaron con un pin concreto de llama.cpp (`4c1a0af40d88c7fbb3b15c85bf2e8016d1d5b64c`).

No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. La model card menciona que el historial de datos heredado de Sotto no ha sido reconstruido de forma independiente y que las fuentes de entrenamiento incluyen datos CC BY y CC BY-SA.

## Capacidades

- Limpieza de transcripciones en ingles: eliminacion de muletillas, correccion de puntuacion y normalizacion de texto dictado.
- Tratamiento de autocorrecciones habladas (mejorado en `v1.1` respecto a `v1`).
- Control de estilo de salida en cuatro niveles (casual, semi-casual, semi-formal, formal).
- Control de estructura de salida: prosa o listas.
- Control de contexto de aplicacion: general o correo electronico.
- Inferencia en modo completado crudo con prompt de tarea especifico.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta vision ni audio: la entrada es siempre texto transcrito.
- Monolingue: solo ingles.

## Casos de uso

- Dictado en aplicaciones de notas: el modelo recibe la transcripcion ASR y devuelve texto con puntuacion y sin muletillas, con estilo semi-casual y estructura en prosa por defecto.
- Redaccion de correos por voz: con contexto `email` y estilo semi-formal, convierte un dictado desordenado en un cuerpo de correo legible antes de insertarlo en el cliente de correo.
- Post-procesado en pipelines de ASR: se coloca como etapa posterior a un motor de reconocimiento de voz para normalizar la salida sin cambiar el contenido factico.
- Formateo de listas dictadas: con estructura `lists`, transforma enumeraciones habladas en listas; el autor indica que el formateo final de listas se realiza en la app tras la generacion.
- Asistentes de voz en movil: su tamano de 350M y su formato GGUF Q8_0 (361,7 MiB) permiten ejecucion local en telefono con latencia baja, evitando enviar transcripciones a la nube.
- Herramientas de accesibilidad: limpieza de texto dictado para usuarios con dificultades motoras, donde las autocorrecciones habladas son frecuentes y el modelo `v1.1` las trata mejor que `v1`.
- Integracion en editores de texto y suites ofimaticas: normalizacion de dictado antes de insertar el texto en el documento, con control de estilo segun la aplicacion destino.

## Benchmarks y rendimiento

La model card reporta una evaluacion sobre un conjunto held-out congelado de ScribeKey de 7.516 filas, comparando `v1.1` con `v1` en configuracion semi-casual/prose/general en el limite de la aplicacion:

| Metrica | Resultado de v1.1 frente a v1 |
|---|---|
| Tasa de edicion de tokens de autocorreccion | −0,036 (IC 95%: −0,046 a −0,026) |
| Exact match | +3,3 puntos (+2,4 a +4,3) |
| Cambios en entrada limpia | −0,9 puntos |
| Valores facticos nuevos | −0,3 puntos (−0,7 a +0,1) |

No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala que dos casos de humo BF16 en CPU con entradas publicas se ejecutaron dos veces con salidas identicas, pero lo califica como comprobacion de inferencia, no como benchmark de calidad.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 361,7 MiB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 1 GB de memoria libre, ademas del overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 4090, RTX 3060 o superiores) es mas que suficiente; tambien tarjetas de datacenter (A100, H100) aunque resultan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, y tambien en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), con el fichero GGUF; el autor documenta el comando exacto con `-c 4096 -t 2 --temp 0 --seed 42`. Otros runtimes compatibles con GGUF no se mencionan en la model card.
- Latencia: la latencia y memoria de este fichero concreto no se han medido. Para `v1`, con la misma arquitectura y tamano de fichero, se midieron en un S25 Ultra 155/178 ms (p50/p95) en casos cortos y 1.702/2.718 ms en casos largos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ScribeKey Fast (este) | 354,5 M | 4096 (configurado) | en | Terminos ScribeKey + LFM Open License v1.0 | GGUF Q8_0 |
| ScribeKey Fast v1 | 354,5 M | 4096 (configurado) | en | Terminos ScribeKey + LFM Open License v1.0 | GGUF (tag `v1`) |
| LFM2.5-350M-Base (Liquid AI) | clase 350M | no disponible | no disponible | LFM Open License v1.0 | no disponible |
| Sotto (juanquivilla) | clase 350M | no disponible | no disponible | MIT (segun NOTICE) | no disponible |

La comparativa con modelos de proposito general de mayor tamano no resulta informativa: ScribeKey Fast esta especializado en limpieza de transcripciones y no compite en tareas de razonamiento o codigo. No se dispone de datos publicos de benchmarks comparables frente a otros modelos de limpieza de transcriptos.

## Limitaciones y advertencias

- Solo ingles; no soporta otros idiomas.
- Riesgo de infidelidad: la salida no esta garantizada como fiel al contenido original. Nombres, numeros, negaciones y omisiones requieren verificacion manual.
- El autor recomienda conservar las transcripciones originales y un mecanismo de fallback en produccion.
- El formateo de listas y el diseno de correos pueden ser incorrectos.
- No es un asistente conversacional: no debe usarse para chat general, tool calling ni razonamiento multi-paso.
- La plantilla de chat heredada de LFM no debe usarse de forma automatica; hay que emplear el prompt de tarea exacto en modo completado crudo.
- Licencia restrictiva: LFM Open License v1.0 incluye una condicion de ingresos comerciales; las organizaciones con ingresos anuales iguales o superiores a 10 millones de USD deben obtener terminos separados de Liquid AI antes del uso comercial. No es Apache ni MIT.
- Obligaciones de atribucion: al redistribuir hay que conservar `ADDITIONAL_TERMS.md`, `LICENSE`, `NOTICE` y `MODIFICATIONS.md`, marcar los cambios y mantener el nombre ScribeKey Fast y el credito al publicador en selectores de modelos y documentacion. Las derivadas modificadas deben acreditar "Derived from ScribeKey Fast by ScribeKey".
- La model card no resuelve si las clausulas share-alike de las fuentes CC BY/CC BY-SA alcanzan a los pesos del modelo.
- No se han publicado cuantizaciones de menor bit; solo Q8_0 ha sido evaluada.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF
- Modelo base: https://huggingface.co/scribekey/scribekey-cleanup-fast
- Terminos adicionales: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/ADDITIONAL_TERMS.md
- Fichero de pesos: https://huggingface.co/scribekey/scribekey-cleanup-fast-GGUF/blob/main/scribekey-cleanup-fast-350m-v1.1-Q8_0.gguf
- Otros ficheros citados en la model card: `prompt-template.jinja`, `evaluation.json`, `examples.json`, `bf16-smoke.json`, `LICENSE`, `NOTICE`, `MODIFICATIONS.md` (en el repositorio de Hugging Face)
- LFM2.5-350M-Base (Liquid AI): no disponible en la informacion proporcionada
- Sotto (juanquivilla): no disponible en la informacion proporcionada
