# AletheiaAING/gemma-3-270m-csw

## Resumen

gemma-3-270m-csw es un modelo de generacion de texto derivado de Google Gemma 3, afinado por Aletheia AI para una tarea muy concreta: reescritura de texto en 37 lenguas africanas con dos modos de salida, mezcla de lenguas al estilo del habla real (code-switching) y reescritura idiomatica con refranes y expresiones cotidianas. No es un modelo de proposito general, sino un especialista de dominio que transforma una frase de entrada en una version code-switched o idiomatica, ademas de ofrecer traduccion directa desde el ingles a la lengua base.

El modelo se distribuye unicamente como GGUF cuantizado en Q8_0 (fichero `csw-rl-q8_0.gguf`, 514 MB) para llama.cpp, lo que permite ejecutarlo en CPU o en cualquier GPU con un consumo de memoria muy bajo. La model card declara 301M parametros y el repositorio de safetensors asociado registra 469.312.128 parametros totales, una discrepancia habitual entre el recuento del checkpoint original y el del modelo afinado; conviene tratarlo como un modelo de la clase 270M-470M.

Su relevancia es de nicho pero clara: cubre 37 lenguas africanas con pares de code-switching explicitamente entrenados (por ejemplo yoruba+ingles, hausa+arabe, bambara+frances, camerunes+ewondo), un caso de uso poco atendido por los modelos multilingues comerciales. La contrapartida es que reescribe, no traduce fielmente, y que no ha recibido entrenamiento de seguridad adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 469.312.128 (safetensors); la model card declara 301M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `csw-rl-q8_0.gguf`) |
| Idiomas soportados | 37 lenguas africanas como lengua base (afr, amh, bam, wes, nya, ewe, fon, ful, gpe, hau, ibo, kik, kin, run, kon, lin, lug, luo, mlg, pcm, nde, orm, nso, sot, tsn, sna, som, swh, ssw, tir, tso, tum, twi, wol, xho, yor, zul) mas ingles; el campo `language` del repo solo declara `en` |
| Licencia | Gemma Terms of Use, con atribucion adicional requerida a "Aletheia AI" |
| Formato de pesos | GGUF (Q8_0) unicamente; no se publican safetensors del modelo afinado |
| Plantilla de chat | Plantilla de chat de Gemma incluida en el fichero GGUF |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificarla como `gemma3_text`, es decir, la torre de texto de Gemma 3. Se trata por tanto de un transformer decoder-only denso, sin mezcla de expertos, con atencion multi-cabeza estandar de la familia Gemma 3. El nombre del fichero (`csw-rl-q8_0.gguf`) sugiere un ajuste con aprendizaje por refuerzo sobre la tarea de reescritura, pero no se detalla el algoritmo, el volumen de datos ni la composicion del corpus de entrenamiento.

Lo que si documenta el autor es la interfaz de tarea, que funciona como una especificacion funcional del entrenamiento: seis tareas (`eng_hm`, `m_hm`, `eng_ood`, `m_ood`, `hm_ood` y traduccion), con pares de lenguas explicitamente entrenados y una lista cerrada de combinaciones permitidas. El modelo no fue entrenado para pares fuera de esa tabla. La salida sigue un formato estructurado con etiquetas de lengua y un bloque `<dev>` que enumera las frases code-switched o los refranes introducidos, lo que facilita la validacion programatica de la respuesta.

No se han publicado detalles sobre numero de tokens de entrenamiento, uso de RLHF/DPO, decodificacion especulativa ni innovaciones de atencion.

## Capacidades

- Reescritura con code-switching (`hm`): mezcla una segunda lengua en el texto base imitando el habla real, con pares predefinidos por lengua.
- Reescritura idiomatica (`ood`): produce texto con refranes, expresiones y giros cotidianos en la lengua base.
- Conversion entre modos (`hm_ood`): toma texto ya mezclado y lo reescribe en estilo idiomatico.
- Traduccion directa de ingles a la lengua base mediante prompt en lenguaje natural.
- Salida estructurada con etiquetas de lengua y bloque `<dev>` con las unidades introducidas (frases mezcladas o refranes).
- Cobertura de 37 lenguas africanas, incluidas varias de bajos recursos (fon, kongo, tumbuka, luo, ga).
- Ejecucion en llama.cpp con plantilla de chat de Gemma aplicada por el servidor.
- No soporta tool calling, agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- Localizacion de producto con tono natural: para campanas en yoruba, hausa o swahili, el modelo reescribe un mensaje en ingles a una version con mezcla realista de ingles y lengua local, que es como se comunica buena parte del publico urbano. El bloque `<dev>` permite revisar que terminos se han mezclado.
- Generacion de contenido idiomatico para medios locales: a partir de una noticia redactada en lengua base, producir una version con refranes y giros que suene a columnista nativo, util para blogs y boletines en lenguas como shona, luganda o wolof.
- Creacion de material para ensenanza de lenguas: generar pares de frases (original y version code-switched o idiomatica) como ejercicios de contraste, con la ventaja de que el modelo etiqueta explicitamente las unidades introducidas.
- Aumento de datos para entrenar otros modelos: producir corpus sinteticos de code-switching en pares como ibo+pidgin nigeriano o kikuyu+swahili, que escasean en abierto, para alimentar ajustes posteriores. Requiere revision humana por el riesgo de refranes inventados.
- Prototipado de asistentes conversacionales en lenguas africanas: con 514 MB en Q8_0 se puede desplegar en un servidor modesto o incluso en un portatil para validar la experiencia de usuario antes de invertir en un modelo mayor.
- Traduccion asistida de ingles a lengua base en entornos con recursos limitados: el modo de traduccion directa sirve como primer borrador para traductores humanos en lenguas donde no hay modelos comerciales disponibles.
- Investigacion sobre code-switching: el conjunto cerrado de pares entrenados y el formato de salida hacen del modelo una linea base reproducible para estudiar mezcla de lenguas en contextos africanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye dos ejemplos de salida generados con decodificacion greedy (temperature 0) en yoruba+ingles y hausa, sin metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5-0,6 GB para el fichero Q8_0 de 514 MB, mas el overhead del contexto y de la cache KV.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con asignacion de memoria compartida.
- Ejecucion en CPU viable y rapida dado el tamano; el autor indica explicitamente que funciona con llama.cpp en CPU o en cualquier GPU.
- Despliegue: `llama-server` de llama.cpp con endpoint compatible con la API de chat completions de OpenAI; tambien deberia funcionar en Ollama y otros frontends basados en llama.cpp, aunque no se documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Decodificacion recomendada: greedy (temperature 0) para una unica salida; temperature 0.7 y top-p 0.95 para muestrear varias candidatas y descartar las que no incluyan bloque `<dev>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-270m-csw (este) | 469M (safetensors) / 301M declarados | no disponible | Reescritura code-switching e idiomatica en 37 lenguas africanas | Gemma Terms + atribucion Aletheia AI | GGUF Q8_0 |
| AletheiaAING/gemma-3-0.8b-csw | no disponible (familia 0.8B) | no disponible | Misma tarea, version "mas nueva y grande" segun el autor | Gemma Terms + atribucion Aletheia AI | no disponible |
| Gemma 3 270M original (Google) | 270M | no disponible en esta ficha | Modelo base de proposito general, multilingue limitado | Gemma Terms | safetensors, GGUF |
| Modelos multilingues generalistas de ~0,5B | variable | variable | Traduccion y generacion general; sin pares de code-switching africano documentados | variable | variable |

La comparativa cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este modelo ni datos de contexto que permitan contrastar con las alternativas.

## Limitaciones y advertencias

- Las salidas son generadas por maquina y no han sido revisadas por hablantes nativos: pueden contener frases poco naturales, refranes o proverbios inventados, tonos erroneos y marcas diacriticas incorrectas.
- El modelo reescribe, no traduce fielmente: puede omitir o alterar contenido y anadir recursos estilisticos que no estaban en el texto fuente. No es adecuado para traduccion documental o juridica.
- La calidad varia por lengua y por par; las lenguas de bajos recursos son mas debiles.
- Solo estan entrenados los pares de lenguas listados en la tabla del autor; cualquier otra combinacion queda fuera de distribucion.
- Las salidas en pidgin conservan mucho ingles porque los prestamos ingleses son parte normal del pidgin; no debe interpretarse como fallo.
- No ha recibido entrenamiento de seguridad adicional: no debe usarse en contextos donde la correccion sea critica sin revision humana.
- La licencia Gemma Terms of Use impone obligaciones adicionales (uso aceptable, attribution); el autor anade la obligacion de acreditar a "Aletheia AI" y conservar el aviso. Verificar compatibilidad antes de uso comercial.
- El campo `language` del repositorio solo declara `en`, aunque el modelo cubre 37 lenguas; no confiar en los metadatos automaticos de Hugging Face.
- Discrepancia entre los 301M declarados y los 469M del checkpoint safetensors: conviene medir el consumo real antes de dimensionar infraestructura.
- No hay informacion sobre longitud de contexto, por lo que textos largos pueden truncarse o degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-270m-csw
- Version mayor del mismo autor: https://huggingface.co/AletheiaAING/gemma-3-0.8b-csw
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
