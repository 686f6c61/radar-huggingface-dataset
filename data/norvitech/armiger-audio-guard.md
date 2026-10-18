# NorviTech/armiger-audio-guard

## Resumen

`armiger-audio-guard` es el cuarto plugin de la suite modular Armiger, desarrollada por NorviTech. No es un modelo con pesos propios: es un mÃ³dulo Python de 4,2 KB (`audio_language_guard.py`) que se acopla a dos cabezas neuronales del sistema Armiger â€”`lang` (probabilidad de audio en inglÃ©s) y `title_language` (probabilidad de tÃtulo no inglÃ©s)â€” y aÃ±ade reglas lingÃ¼Ãsticas y de etiquetado de trackers para decidir el idioma de audio real de un release.

El problema que resuelve es muy concreto: los parsers de nombres de fichero de releases (GuessIt, RTN, Parsett, PTN) fallan de forma sistemÃ¡tica en cinco familias de patrones multilingÃ¼es, como la preposiciÃ³n romance `.en.` en `la.casa.en.llamas.2024.1080p.mp4`, los lanzamientos `<Foreign>.ENG.Sub` donde `ENG` modifica a `Sub` y no a una pista de audio, las etiquetas de doblaje regional (`Dual-Lat`, `BG Audio`, `Hindi Dubbed`), las listas multi-audio entre parÃ©ntesis (`MULTi (FR EN)`) y los filmes extranjeros sin etiquetar en trackers anglÃ³fonos.

Su relevancia es prÃ¡ctica: segÃºn la model card, eleva la precisiÃ³n de detecciÃ³n de idioma de audio del 96,88 % (cabeza neural `lang` sola) al 98,72 % en el cohorte Gold Standard (N=545) y al 99,88 % en edge-cases duros (N=861), y mejora la detecciÃ³n de anime y anime dub hasta el 97,82 % sobre 2.835 muestras. Se distribuye de forma independiente y viene preempaquetado dentro de `NorviTech/armiger-ultra`.

## Especificaciones tÃ©cnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plugin de post-proceso (mÃ³dulo Python `audio_language_guard.py`) que combina las cabezas neuronales `lang` y `title_language` de Armiger con reglas lingÃ¼Ãsticas y desambiguaciÃ³n de etiquetas de tracker; no incluye transformer propio |
| Parametros totales | no disponible (el artefacto pesa 4,2 KB de cÃ³digo; los pesos de las cabezas neuronales subyacentes no se detallan en la informaciÃ³n proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa un Ãºnico `raw_name` por llamada) |
| Tipos de cuantizacion | no disponible; el plugin no publica pesos y opera sobre probabilidades en coma flotante (`p_en`, `p_title_foreign`, `p_anime`) |
| Idiomas soportados | no disponible como lista oficial; la model card cita casos en inglÃ©s, espaÃ±ol, francÃ©s, italiano, alemÃ¡n, hindi, bÃºlgaro, ruso, japonÃ©s y neerlandÃ©s |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; se distribuye como cÃ³digo Python (4,2 KB), sin safetensors ni GGUF |
| Tarea declarada (pipeline) | text-classification |
| Huella en disco | 4,2 KB |

## Arquitectura y entrenamiento

El plugin no entrena una red: implementa una capa determinista de post-proceso sobre las salidas de Armiger. Recibe el nombre crudo del release junto con las probabilidades de las cabezas neuronales (`p_en`, `p_title_foreign`, `p_anime`) y aplica reglas de desambiguaciÃ³n sobre cinco familias de patrones: preposiciones romances confundidas con el token `.en.`, modificadores `ENG.Sub` que afectan a los subtÃtulos y no al audio, etiquetas de doblaje regional sin seÃ±al explÃ³cita de idioma, listas multi-audio entre parÃ©ntesis o corchetes, y tÃtulos extranjeros con boilerplate anglÃ³fono de tracker. El resultado es una `p_en` ajustada y, en la variante `classify_audio_and_anime_dub`, una etiqueta conjunta de idioma de audio y de doblaje de anime.

No se publican datos de entrenamiento, nÃºmero de tokens, composiciÃ³n del corpus ni uso de RLHF/DPO, porque no hay fase de entrenamiento declarada. Las cifras de precisiÃ³n proceden de tres cohortes de evaluaciÃ³n descritas en la model card (Gold Standard N=545, Hard Edge-Cases N=861, Anime & Anime Dub N=2.835). El ecosistema Armiger sÃ complementa este mÃ³dulo con `armiger-calibration-dht`, que aporta escalado de temperatura por cabeza, ajustes de prior de Menon y puertas de conformal de Mondrian, y con un motor de recarga en caliente firmado con Ed25519 sobre BEP-44.

## Capacidades

- ClasificaciÃ³n de idioma de audio de releases a partir del nombre del fichero, combinando seÃ±al neuronal y reglas lingÃ¼Ãsticas.
- DesambiguaciÃ³n de la preposiciÃ³n romance `.en.` frente al token de audio inglÃ©s (por ejemplo, `la.casa.en.llamas`).
- DetecciÃ³n de releases `<Foreign>.ENG.Sub`, donde `ENG` califica a los subtÃtulos y no a una pista dual.
- Reconocimiento de etiquetas regionales de doblaje sin seÃ±al explÃcita: `Hindi Dubbed`, `German.AC3LD`, `Dual-Lat`, `BG Audio`, `(BNN) ... NL`.
- InterpretaciÃ³n de listas multi-audio entre parÃ©ntesis y corchetes: `MULTi (FR EN)`, `[RUS + JAP + ENG]`.
- DetecciÃ³n de filmes extranjeros subidos a trackers anglÃ³fonos (`[YTS.MX]`) usando `P(non_english_title)` como seÃ±al de tÃtulo no inglÃ©s.
- DetecciÃ³n especÃfica de anime y de doblaje de anime en la variante `classify_audio_and_anime_dub`.
- API de dos funciones: `apply_audio_language_guard(raw_name, p_en, p_title_foreign)` y `classify_audio_and_anime_dub(raw_name, p_en, p_anime, p_title_foreign)`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generaciÃ³n de texto: no es un modelo generativo.

## Casos de uso

- GestiÃ³n de biblioteca multimedia autoalojada: el mÃ³dulo corrige la etiqueta de audio antes de que Jellyfin, Plex o el stack *arr escriba los metadatos, evitando que un release en espaÃ±ol quede catalogado como inglÃ©s por culpa del token `.en.` del tÃtulo.
- IndexaciÃ³n y filtrado en trackers privados: permite descartar o marcar releases cuyo audio no coincide con el perfil del usuario, con un 99,88 % declarado sobre 861 edge-cases duros.
- CatalogaciÃ³n de anime y doblaje: con la cohorte de 2.835 muestras y un 97,82 % de precisiÃ³n, sirve para separar anime subtitulado de anime doblado en catÃ¡logos grandes.
- PlanificaciÃ³n de subtitulado: al identificar correctamente `ENG.Sub`, el pipeline sabe que el release ya trae subtÃtulos en inglÃ©s y no necesita generarlos ni descargarlos.
- CuradurÃa de datasets multilingÃ¼es: etiquetar el idioma de audio de un corpus de material audiovisual antes de usarlo en entrenamiento de ASR o TTS, donde un error de etiqueta contamina el conjunto.
- Renombrado y normalizaciÃ³n de ficheros: como paso previo a scripts de limpieza de nombres, evita que la correcciÃ³n automÃ¡tica elimine palabras legÃtimas del tÃtulo (`En attendant la nuit`).
- Prechequeo en reproductores o pasarelas de streaming: verificar el idioma de audio antes de servir el contenido a un usuario con preferencias lingÃ¼Ãsticas o restricciones de control parental.
- IntegraciÃ³n en la suite Armiger: combinado con `armiger-calibration-dht`, permite recargar en caliente reglas y calibraciÃ³n firmadas sobre BEP-44 sin reiniciar el servicio.

## Benchmarks y rendimiento

Datos publicados en la model card. Se comparan parsers de referencia y la cabeza neural `lang` aislada frente al resultado con el plugin, en las variantes Armiger y Armiger Ultra.

| Cohorte | GuessIt | RTN / Parsett | Cabeza neural `lang` sola | Con `armiger-audio-guard` (Armiger) | Con `armiger-audio-guard` (Armiger Ultra) |
|---|---|---|---|---|---|
| Gold Standard audio language (N=545) | 96,01 % | 95,33 % | 96,88 % | 98,17 % | 98,72 % |
| Hard edge-cases audio language (N=861) | 96,01 % | 95,33 % | 99,65 % | 99,88 % | 99,88 % |
| Anime y anime dub (N=2.835) | 75,90 % | 77,65 % | 97,60 % | 97,82 % | 97,92 % |

No se han publicado resultados en benchmarks estÃ¡ndar de PLN (MMLU, HumanEval, GSM8K) porque el artefacto no es un modelo de lenguaje general.

## Requisitos de hardware

- Inferencia en CPU: el mÃ³dulo es cÃ³digo Python de 4,2 KB y no requiere GPU; el coste dominante es la inferencia de las cabezas neuronales de Armiger que lo alimentan.
- VRAM estimada: 0 GB para el plugin. La VRAM de las cabezas `lang` y `title_language` no se documenta en la informaciÃ³n proporcionada.
- GPU recomendadas: no aplica para el plugin; para el sistema Armiger completo no se especifican modelos de GPU.
- Compatibilidad con GPU de consumo: el plugin funciona en cualquier mÃ¡quina capaz de ejecutar Python, incluidos equipos sin GPU dedicada.
- Opciones de despliegue: importaciÃ³n directa como mÃ³dulo Python (`from audio_language_guard import ...`) o uso preempaquetado dentro de `NorviTech/armiger-ultra`. No hay artefactos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras. Al tratarse de reglas deterministas sobre un Ãºnico `raw_name`, la latencia es despreciable frente a la inferencia neuronal, pero no se aporta ninguna mediciÃ³n.

## Comparativa con modelos similares

La comparaciÃ³n relevante es contra parsers de nombres de release y contra el uso aislado de la cabeza neural, no contra otros modelos de lenguaje.

| Alternativa | Tipo | Licencia | PrecisiÃ³n Gold Standard (N=545) | Edge-cases (N=861) | Anime (N=2.835) |
|---|---|---|---|---|---|
| `armiger-audio-guard` | Plugin de reglas + cabezas Armiger | Apache-2.0 | 98,17 % (Ultra: 98,72 %) | 99,88 % | 97,82 % (Ultra: 97,92 %) |
| GuessIt | Parser de nombres por regex | no disponible | 96,01 % | 96,01 % | 75,90 % |
| RTN / Parsett | Parser de nombres por regex | no disponible | 95,33 % | 95,33 % | 77,65 % |
| Cabeza neural `lang` aislada | Clasificador neuronal de Armiger | no disponible | 96,88 % | 99,65 % | 97,60 % |

El plugin no se compara con `armiger-swarm-survival`, `armiger-swarm-priors`, `armiger-zero-cue-catalog` ni `armiger-calibration-dht` porque cubren tareas distintas dentro de la misma suite (liveliness de swarm, priors de tracker, resoluciÃ³n estructural de catÃ¡logo y calibraciÃ³n conformal, respectivamente); son complementarios, no alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado: no tiene pesos, vocabulario, tokenizador ni ventana de contexto. Cualquier expectativa de generaciÃ³n de texto o de clasificaciÃ³n genÃ©rica queda fuera de su alcance, pese a la etiqueta `text-classification`.
- Depende por completo de la calidad de las probabilidades `p_en`, `p_title_foreign` y `p_anime` que le entrega Armiger; un error de la cabeza neuronal puede propagarse o amplificarse si la regla lingÃ¼Ãstica no lo captura.
- El Ã¡mbito es el anÃ¡lisis de nombres de fichero de releases audiovisuales; no analiza audio real, pistas de contenedor ni metadatos internos del fichero.
- Las reglas asumen convenciones de trackers anglÃ³fonos y de la escena; releases con nomenclatura no convencional, idiomas no cubiertos o etiquetas inventadas pueden quedar sin resolver.
- Las cifras de precisiÃ³n proceden de cohortes internas descritas por el autor (N=545, N=861, N=2.835) y no consta validaciÃ³n independiente ni publicaciÃ³n de intervalos de confianza.
- No se documenta composiciÃ³n de datos de evaluaciÃ³n, criterios de anotaciÃ³n ni posibles solapamientos entre cohortes, por lo que el riesgo de sobreajuste a los conjuntos citados no puede descartarse.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creaciÃ³n y actualizaciÃ³n (18 de octubre de 2026) son las Ãºnicas disponibles; no hay historial de versiones ni issues pÃºblicos que permitan evaluar mantenimiento.
- La licencia Apache-2.0 cubre este plugin; la licencia de los pesos de las cabezas neuronales de Armiger y de `armiger-ultra` no se detalla en la informaciÃ³n proporcionada, por lo que conviene verificarla antes de un uso comercial.
- El sesgo lingÃ¼Ãstico es explÃcito: el sistema estÃ¡ diseÃ±ado en torno a la dicotomÃa inglÃ©s / no inglÃ©s, de modo que la discriminaciÃ³n entre idiomas distintos del inglÃ©s es mÃ¡s dÃ©bil.
- No se han auditado aquÃ las garantÃas de seguridad que la model card atribuye a otros plugins de la suite (por ejemplo, el 100 % de recall en trampas de malware de `armiger-swarm-survival`); son afirmaciones del autor no verificadas de forma independiente.

## Enlaces

- Repositorio HuggingFace del plugin: https://huggingface.co/NorviTech/armiger-audio-guard
- Armiger Ultra (incluye el plugin preempaquetado): https://huggingface.co/NorviTech/armiger-ultra
- Armiger (variante CPU): https://huggingface.co/NorviTech/armiger
- Plugin Swarm Survival: https://huggingface.co/NorviTech/armiger-swarm-survival
- Plugin Swarm Priors: https://huggingface.co/NorviTech/armiger-swarm-priors
- Plugin Zero-Cue Catalog: https://huggingface.co/NorviTech/armiger-zero-cue-catalog
- Plugin Calibration & DHT: https://huggingface.co/NorviTech/armiger-calibration-dht
- Sitio del autor: https://norvitech.com
- Paper, blog tÃ©cnico, repositorio de cÃ³digo y demo: no disponibles en la informaciÃ³n proporcionada.
