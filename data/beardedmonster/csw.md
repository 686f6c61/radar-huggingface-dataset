# BeardedMonster/csw

## Resumen

csw es un modelo de generacion de texto de 301 millones de parametros desarrollado por BeardedMonster (bajo la marca AletheiaAING) y publicado en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base google/gemma-3-270m-it, orientado especificamente a tareas de code-switching, reescritura idiomatica y traduccion en 37 lenguas africanas, ademas del ingles. El modelo resuelve un problema concreto: la mayoria de los modelos multilingues no manejan bien la mezcla de lenguas que se produce de forma natural en el habla cotidiana africana (por ejemplo, yoruba con insercciones de ingles en mitad de una frase).

El modelo se distribuye en formato safetensors con un tamano de repositorio de 1,2 GB y esta pensado para ejecutarse en hardware modesto, incluso en CPU. Su propuesta de valor es generar datos sinteticos de code-switching y texto idiomatico para aumentar datasets de entrenamiento, probar sistemas de deteccion de lengua o alimentar pipelines de ASR/TTS en contextos multilingues africanos. Es relevante ahora porque cubre una franja de lenguas y un fenomeno linguistico (code-switching) historicamente desatendidos por los modelos comerciales.

La licencia es de tipo "other": el autor permite uso comercial y no comercial con atribucion a "AletheiaAING", pero al derivar de Gemma se aplican tambien los Terminos de Uso de Google Gemma, lo que impone restricciones adicionales que deben revisarse antes de un despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | 301.539.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizaciones habituales de Gemma 3) |
| Idiomas soportados | 37 lenguas africanas + ingles (afr, amh, bam, ewe, fon, ful, gpe, hau, ibo, kik, kin, kon, lin, lug, luo, mlg, nde, nso, nya, orm, pcm, run, sna, som, sot, ssw, swh, tir, tsn, tso, tum, twi, wes, wol, xho, yor, zul) |
| Licencia | other (uso comercial y no comercial con atribucion a AletheiaAING; sujeto a los Terminos de Uso de Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only google/gemma-3-270m-it, que emplea la arquitectura gemma3_text. Con 301,5 millones de parametros, se posiciona en la gama ultraligera de la familia Gemma 3. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO en esta etapa de fine-tuning.

La innovacion tecnica principal no reside en la arquitectura, sino en el diseno de tareas y el formato de prompt. El modelo maneja seis tareas diferenciadas mediante marcadores especiales: `eng_m` (traduccion de ingles a la lengua base), `eng_hm` y `m_hm` (code-switching desde ingles o desde la lengua base), `eng_ood` y `m_ood` (reescritura idiomatica) y `hm_ood` (reescritura idiomatica de texto ya mezclado). La salida de las tareas distintas de traduccion sigue una estructura fija `<codigo><codigo_switch><dev>frase uno | frase dos</dev> texto`, donde el bloque `<dev>` etiqueta los tramos de code-switching o las expresiones idiomaticas. Esta estructura facilita la extraccion automatica de spans etiquetados para entrenar detectores de cambio de lengua. El modelo solo fue entrenado con pares de lenguas de cambio concretos (por ejemplo, yoruba+ingles, hausa+arabe, twi+ga), y cualquier otra combinacion queda fuera de distribucion.

## Capacidades

- Traduccion de ingles a 37 lenguas africanas (tarea `eng_m`), con la respuesta encabezada por el codigo de lengua.
- Generacion de texto con code-switching controlado entre la lengua base y una lengua de cambio predefinida (`eng_hm`, `m_hm`).
- Reescritura idiomatica e informal de texto plano o ya mezclado (`eng_ood`, `m_ood`, `hm_ood`), con estilo conversacional y expresiones propias de hablante nativo.
- Etiquetado de spans de code-switching e idiomatismos mediante el bloque `<dev>`.
- Generacion de texto conversacional de un solo turno (sin system prompt) segun el formato de chat del tokenizer.
- Capacidad multilingue limitada al conjunto de lenguas africanas listado y al ingles; no se documentan capacidades de codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni de razonamiento multi-paso orientado a agentes.

## Casos de uso

- Aumento de datos de chat e instrucciones: tomar datasets de instrucciones en ingles o en una sola lengua y convertirlos a versiones code-switched (`eng_hm`, `m_hm`) para que los modelos de chat aprendan a responder a usuarios que mezclan lenguas en un mismo mensaje.
- Generacion de guiones para ASR y TTS: producir frases mezcladas que sirvan como texto de lectura para grabaciones, con revision posterior por un hablante nativo antes de usarlas como referencia.
- Pruebas de robustez de sistemas NLP: crear entradas mezcladas para evaluar como responden chatbots, traductores, detectores de lengua o modelos de sentimiento y NER ante code-switching.
- Entrenamiento de detectores de cambio de lengua: aprovechar el bloque `<dev>` para obtener spans etiquetados de las frases cambiadas y usarlos como datos supervisados.
- Redaccion de copy y dialogos naturalizados: reescribir texto plano en estilo idiomatico (`ood`) para relatos, dialogos de videojuegos, publicaciones en redes o anuncios, con revision humana.
- Ensenanza de lenguas: mostrar a estudiantes como los hablantes reales mezclan lenguas y que expresiones idiomaticas emplean en cada contexto.
- Generacion de variantes para entrenamiento propio: muestrear multiples salidas por prompt (o aplicar MBR para seleccionar la mejor) y filtrarlas para ampliar datasets de lenguas africanas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en bf16/fp16: en torno a 0,6-0,7 GB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,3-0,4 GB; en 4 bits, en torno a 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien tarjetas de gama de entrada y GPUs de datacenter (A100, H100) sin problema.
- Cabe holgadamente en GPU consumer e incluso puede ejecutarse en CPU, dado su tamano de 301M de parametros y repositorio de 1,2 GB.
- Opciones de despliegue: transformers (referencia del autor), llama.cpp, Ollama y vLLM (previa conversion a los formatos soportados); TGI no esta confirmado para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BeardedMonster/csw | 301M | no disponible | Code-switching e idiomatismos en 37 lenguas africanas | other (atribucion + Terminos Gemma) | Hugging Face |
| BeardedMonster/gemma-3-1b-csw-best | ~1B (no confirmado) | no disponible | Misma familia, version mayor | other (atribucion + Terminos Gemma) | Hugging Face |
| BeardedMonster/gemma-3-0.8b-csw | ~0,8B (no confirmado) | no disponible | Misma familia, optimizado para CPU | other (atribucion + Terminos Gemma) | Hugging Face |
| google/gemma-3-270m-it | 270M | no disponible | Modelo base instructivo generalista | Terminos Gemma | Hugging Face |

## Limitaciones y advertencias

- Todo el texto generado es sintetico; el autor recomienda filtrarlo y revisarlo por hablantes nativos antes de usarlo.
- El modelo solo fue entrenado con combinaciones concretas de lengua base y lengua de cambio; otras combinaciones quedan fuera de distribucion y produciran resultados poco fiables.
- No se documentan sesgos especificos, pero al derivar de Gemma 3 y entrenarse sobre datos de lenguas africanas de bajos recursos, es probable que herede sesgos del corpus base y presente cobertura desigual entre lenguas.
- Riesgo de alucinacion en traducciones y reescrituras idiomaticas, especialmente en lenguas con menos datos; la estructura de salida puede faltar y requerir remuestreo.
- La licencia "other" exige atribucion a AletheiaAING y el cumplimiento adicional de los Terminos de Uso de Gemma; debe revisarse antes de uso comercial.
- El modelo es de un solo turno y no incluye system prompt; no esta disenado para dialogos multi-turno ni para tareas de agente.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues con entradas largas.
- El modelo no documenta capacidades de codigo, matematicas, vision ni audio, por lo que no debe emplearse en esos dominios.

## Enlaces

- Hugging Face: https://huggingface.co/BeardedMonster/csw
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Version mayor de la familia: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-best
- Version optimizada para CPU: https://huggingface.co/BeardedMonster/gemma-3-0.8b-csw
- Perfil del autor: https://huggingface.co/AletheiaAING
