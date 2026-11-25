# kingphisher-2080/ckaffee-polish-270m

## Resumen

ckaffee-polish-270m es un ajuste fino completo de google/gemma-3-270m-it orientado a una tarea muy concreta: la reescritura y limpieza de dictado por voz. El modelo recibe transcripciones en bruto (con muletillas, autocorrecciones y divagaciones) y las convierte en texto limpio, en estilo casual o formal, con la opción de generar listas con viñetas en modo condensado. Lo desarrolla el usuario kingphisher-2080 y esta pensado como componente de inferencia local dentro de la aplicacion Android de dictado CKaffeVoice (build parcheada), no como modelo de proposito general.

La relevancia es acotada pero clara: demuestra el patron de especializar un modelo pequeno (270M parametros) para una tarea de postprocesado de texto que corre en CPU de movil. El artefacto principal es un fichero LiteRT-LM con pesos int8 que la app descarga y ejecuta en el dispositivo, con un tiempo de aproximadamente 4,5 s por mensaje en un Moto G Power 5G 2024 y una tasa de aceptacion del validador de la app del 92-95 %.

El modelo no publica informacion sobre arquitectura propia (hereda la de Gemma 3 270M), ni sobre contexto, idiomas o benchmarks. La model card solo documenta el proceso de ajuste, el formato de prompt y las limitaciones conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de google/gemma-3-270m-it; no se detalla en la model card) |
| Parametros totales | 270M (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero LiteRT-LM); checkpoint Hugging Face en bf16 |
| Idiomas soportados | no disponible (la model card no los declara; el nombre sugiere uso con dictado en polaco, sin confirmacion explicita) |
| Licencia | Gemma Terms of Use + Gemma Prohibited Use Policy |
| Formato de pesos | LiteRT-LM (.litertlm) para despliegue en Android; safetensors bf16 en `hf-weights/` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de google/gemma-3-270m-it. No se documenta ningun cambio arquitectonico: se mantiene la arquitectura del modelo base de Gemma 3 de 270M parametros, sin datos publicados sobre atencion, capas o contexto en la informacion disponible.

El entrenamiento se realizo sobre 2.624 pares sinteticos de dictado y reescritura generados por Qwen 3.5 9B. Se descartaron aquellos pares que el validador de salida de la app habria rechazado, lo que actua como filtro de calidad del dataset. La perdida se calcula unicamente sobre la reescritura (no sobre el prompt), lo que concentra el aprendizaje en la transformacion de salida. No se menciona RLHF, DPO ni ninguna otra fase de alineacion posterior.

El formato de inferencia es peculiar y esta documentado: el mensaje de sistema es una etiqueta corta del tipo `dictation: clean condensed+bullets lists` (estilo clean/casual/formal, detalle light/balanced/condensed, `+bullets`, lists/nolists y un campo opcional ` Spell: Name.`), el turno de usuario va delimitado por `<<<\n<transcript>\n>>>` y la decodificacion es greedy. El modelo se distribuye en dos artefactos: un fichero LiteRT-LM int8 para ejecucion en CPU en Android y un checkpoint bf16 en safetensors para Hugging Face.

## Capacidades

- Reescritura de dictado: elimina muletillas, autocorrecciones y divagaciones, y produce texto limpio a partir de una transcripcion en bruto.
- Control de estilo: genera salida en estilo clean, casual o formal segun la etiqueta de sistema.
- Control de detalle: modos light, balanced y condensed.
- Listas con viñetas: en modo condensed puede estructurar la salida como lista (`+bullets`).
- Listas de elementos: soporta el modificador lists/nolists.
- Correccion ortografica dirigida: campo opcional ` Spell: Name.` para forzar la grafia de nombres propios.
- Ejecucion local en dispositivo: el fichero LiteRT-LM int8 corre en CPU de Android sin GPU.
- No se documentan capacidades de tool calling, agentes, vision, audio, razonamiento multi-paso ni multilingues mas alla del uso previsto.

## Casos de uso

- Dictado en movil con limpieza automatica: la app captura voz, transcribe y pasa el texto en bruto al modelo, que devuelve una version limpia en 4,5 s en CPU de un Moto G Power 5G 2024, sin enviar datos a la nube.
- Notas rapidas en estilo casual: con la etiqueta `dictation: casual balanced nolists`, el modelo convierte un monologo desordenado en una nota legible para uso personal.
- Redaccion de mensajes formales: con `dictation: formal balanced nolists`, se obtiene un texto adecuado para correo o mensajeria profesional a partir de un dictado informal.
- Resumen condensado con vinetas: el modo `condensed+bullets` genera una lista de puntos a partir de una divagacion larga, util para actas rapidas o listas de tareas.
- Correccion de nombres propios en transcripciones: el campo ` Spell: Name.` fuerza la grafia correcta de nombres que el ASR suele transcribir mal, integrado en el flujo de dictado.
- Postprocesado por lotes de transcripciones: el checkpoint bf16 en `hf-weights/` permite ejecutar el modelo fuera del movil (por ejemplo, en un servidor) para limpiar lotes de transcripciones con el mismo formato de prompt.
- Integracion en apps de terceros: al ser un modelo de 270M en int8, puede incrustarse en pipelines de dictado con requisitos de latencia y privacidad estrictos, siempre que se respete la licencia Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento publicados son operativos: aproximadamente 4,5 s por mensaje en CPU de un Moto G Power 5G 2024 y una tasa de aceptacion del validador de la app del 92-95 %.

## Requisitos de hardware

- VRAM estimada: no aplica para el artefacto principal; el fichero LiteRT-LM int8 esta disenado para ejecucion en CPU. El checkpoint bf16 de 270M ocupa aproximadamente 0,5-0,6 GB en disco y puede cargarse en GPU consumer con holgura.
- GPU recomendadas: no se especifican; el modelo objetivo corre en CPU de movil. Para el checkpoint bf16, cualquier GPU consumer reciente es suficiente por tamano.
- Cabe en GPU consumer: si, con cualquier GPU con al menos 1-2 GB de memoria libre para el checkpoint bf16; el artefacto int8 ni siquiera la requiere.
- Opciones de despliegue: LiteRT-LM para Android (artefacto principal); el checkpoint bf16 puede cargarse con frameworks compatibles con safetensors, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 4,5 s por mensaje en un Moto G Power 5G 2024 (CPU), con decodificacion greedy. No se publican datos de throughput en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ckaffee-polish-270m | 270M | no disponible | Reescritura de dictado, LiteRT-LM Android | Gemma Terms | Hugging Face, LiteRT-LM |
| google/gemma-3-270m-it | 270M | no disponible | Modelo base de proposito general | Gemma Terms | Hugging Face |
| Qwen 3.5 9B (generador del dataset) | 9B | no disponible | Generacion general; usado para crear los pares de entrenamiento | no disponible | no disponible |

La comparativa con alternativas de la misma tarea (limpieza de dictado) no esta disponible: no se conocen en la informacion proporcionada otros modelos especializados en esta tarea con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modo condensed a veces omite elementos menores de divagaciones largas, segun reconoce el autor.
- El modelo esta especializado en una unica tarea; no es adecuado como modelo de proposito general ni para generacion libre.
- No se declaran idiomas soportados; el nombre sugiere uso con dictado en polaco, pero la model card no lo confirma, lo que impide garantizar su comportamiento en castellano u otros idiomas.
- No hay datos publicados sobre sesgos, riesgo de alucinacion en la reescritura ni evaluaciones independientes.
- La licencia Gemma Terms of Use y la Gemma Prohibited Use Policy restringen el uso comercial y ciertos usos; es una version modificada de google/gemma-3-270m-it y debe cumplir ambas politicas.
- El modelo esta pensado para una build parcheada de la app CKaffeVoice; su integracion fuera de ese contexto requiere replicar el formato exacto de prompt (etiqueta de sistema, delimitadores `<<<` y `>>>`, decodificacion greedy), so pena de degradar la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El fichero principal es int8 y corre en CPU; la latencia de 4,5 s por mensaje puede ser limitante para dictado en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/kingphisher-2080/ckaffee-polish-270m
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
