# kennnnnzx/path-of-exile-2-map-hack-keyless

## Resumen

El artefacto publicado bajo el identificador `kennnnnzx/path-of-exile-2-map-hack-keyless` no es un modelo de inteligencia artificial ni un conjunto de pesos neuronales. Se trata de un repositorio de tipo "model card" en Hugging Face cuyo contenido es en realidad una página de distribución de un supuesto ejecutable para Windows (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB), presentado como una herramienta de trampas ("map hack") para el videojuego *Path of Exile 2*. El repositorio no contiene arquitectura, parámetros, tokenizador, ficheros `safetensors`, `GGUF` ni ningún otro artefacto propio de un modelo de lenguaje.

La ficha se redacta, por tanto, como evaluación técnica de lo que realmente hay publicado: un README con enlaces a un binario alojado en GitHub, protegido por contraseña de descompresión (`2026`) y con instrucciones para ejecutarlo como administrador. No existe información sobre entrenamiento, capacidades lingüísticas, benchmarks ni uso legítimo como modelo. Todos los campos propios de un modelo de IA se marcan como "no disponible" o "no aplica".

Es relevante advertir que este tipo de publicaciones son un vector habitual de malware: la combinación de binario opaco, contraseña de archivo para evadir análisis automáticos, petición de privilegios de administrador y temática de "cheat" para videojuegos coincide con patrones documentados de troyanos y stealers. Bajo ninguna circunstancia debe ejecutarse el archivo en un equipo de producción o personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el artefacto es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no verificable en un modelo inexistente) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido descrito en la model card corresponde a un supuesto programa externo ("user-mode external core", "overlay 144 Hz", "Desktop Duplication rendering", "dynamic offset scanner") que, según el autor, interactúa con el proceso del juego *Path of Exile 2* para mostrar información superpuesta. Ninguna de estas afirmaciones es verificable a partir de los ficheros publicados en Hugging Face, y no se aporta código fuente, hash reproducible ni firma del binario.

El único material técnico objetivo es la metadata del repositorio (tags `windows`, `windows-11`, `x64`, `portable`, licencia MIT, 0 descargas, 0 likes, fecha de creación 2026-11-24) y el README, que enlaza a un ZIP alojado en un repositorio de GitHub de terceros (`Giovanni9790/monster-hunter-wilds-trainer-mod`). No hay dataset, no hay RLHF, no hay tokenizador, no hay innovación algorítmica alguna.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no programa, no resuelve matemáticas ni procesa visión.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadatos del repositorio, no idiomas de un modelo.
- El artefacto distribuido se presenta como una herramienta de *overlay* para un videojuego, con funciones declaradas de ESP (cajas 2D/3D, esqueletos), *panic key* (`END`) y *bezier input smoothing*; ninguna de ellas es verificable ni recomendable.
- No dispone de modo *thinking*, visión, audio ni ninguna capacidad propia de un modelo de IA.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones legítimas de procesamiento de lenguaje, visión o razonamiento.
- Uso como *cheat* en *Path of Exile 2*: prohibido por los términos de servicio del juego; puede conllevar el baneo permanente de la cuenta y no es un caso de uso aceptable.
- Análisis de malware en entorno aislado: el único uso técnicamente defendible sería el estudio del binario por parte de un analista de seguridad, en una máquina virtual sin red y sin credenciales, para caracterizar su comportamiento.
- Documentación de campañas de *malvertising* en plataformas de modelos: sirve como ejemplo de publicación abusiva en Hugging Face que suplanta un modelo para distribuir un ejecutable.
- Formación en concienciación de seguridad: útil como caso de estudio de ingeniería social (contraseña en el README, urgencia, promesa de ventaja competitiva).
- No se identifican casos de uso productivos, de investigación ni de desarrollo de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de ningún tipo; los porcentajes que aparecen en el README (por ejemplo, "97,6% de consistencia" o "152 Hz de polling") son afirmaciones publicitarias del autor sin metodología, sin conjunto de evaluación y sin posibilidad de reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo neuronal).
- GPU recomendadas: no aplica; el artefacto es un ejecutable de Windows que, según su descripción, usa *Desktop Duplication* y no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del README (144 Hz, 152 Hz) no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Si se compara con otras publicaciones abusivas en Hugging Face, la categoría sería "repositorios que distribuyen ejecutables bajo apariencia de modelo", para la cual no se dispone de datos cuantitativos en la información proporcionada.

| Criterio | Este repositorio | Modelo de IA típico (referencia genérica) |
|---|---|---|
| Naturaleza | Ejecutable Windows en ZIP | Pesos neuronales (safetensors/GGUF) |
| Parámetros | No aplica | Variable |
| Contexto | No aplica | Variable |
| Licencia | MIT declarada | Variable |
| Verificabilidad | Nula (binario opaco, contraseña) | Alta (pesos y config públicos) |
| Riesgo de seguridad | Alto | Bajo |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de uso como LLM es infundada.
- Binario opaco distribuido con contraseña de descompresión (`2026`), técnica habitual para evadir análisis automáticos de antivirus y sandboxes.
- Instrucciones que solicitan ejecutar como administrador, lo que amplía el impacto potencial de cualquier código malicioso.
- Enlaces de descarga alojados en un repositorio de GitHub de terceros, no en Hugging Face; riesgo de sustitución del contenido sin trazabilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, pese a que el README muestra un badge de "736K+ descargas": inconsistencia que sugiere métricas fabricadas.
- Uso del artefacto como *cheat* en *Path of Exile 2*: viola los términos de servicio del juego y puede conllevar suspensión de cuenta.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario ni sobre su legalidad en el contexto de uso previsto.
- Riesgo elevado de *malware* (stealers, troyanos de acceso remoto, *miners*) si se ejecuta en un equipo real.
- No debe desplegarse en entornos de producción, CI/CD ni en máquinas con credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kennnnnzx/path-of-exile-2-map-hack-keyless
- Repositorio GitHub enlazado en el README: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod
- Release del ZIP referenciada: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Página de releases alternativa citada: https://github.com/fHakansson955/path-of-exile-2-map-hack-keyless/releases/latest
- Paper, blog o demo oficial: no disponible
