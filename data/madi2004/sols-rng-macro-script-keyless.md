# Madi2004/sols-rng-macro-script-keyless

## Resumen

El artefacto publicado bajo el identificador `Madi2004/sols-rng-macro-script-keyless` no es un modelo de inteligencia artificial. Se trata de un ejecutable para Windows x64 (`sols-rng-macro-script-keyless-v1.2.0-win64.exe`, compilación `v3.9.9`/`585333`, 8,9 MB) distribuido como archivo ZIP protegido con contraseña, y descrito por su autor como un macro o script para el videojuego Roblox. El repositorio de Hugging Face actúa únicamente como espejo de distribución del binario, no como alojamiento de pesos neuronales.

La model card no documenta arquitectura, parámetros, contexto, dataset de entrenamiento ni proceso de alineación. Toda la información disponible describe funcionalidades de automatización de partidas (farm loops, teleport, ESP de entidades, anti-AFK, server hopping) y un procedimiento de instalación consistente en descargar un ZIP desde un repositorio de GitHub de terceros, extraerlo con la contraseña `2026` y ejecutar el `.exe` como administrador. No hay pipeline declarado, ni pesos, ni tokenizador, ni código de inferencia.

Desde la perspectiva de evaluación de modelos, esta ficha no puede ofrecer los apartados habituales de especificaciones, arquitectura, capacidades o benchmarks porque no existen. El contenido relevante es de naturaleza distinta: advertencias de seguridad sobre la distribución de binarios opacos alojados en plataformas de modelos, y la discrepancia entre las etiquetas multilingües del repositorio y la ausencia total de funcionalidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | etiquetados en el repositorio: en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (sin funcionalidad lingüística verificable) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.exe` dentro de un `.zip` de 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. No se ha publicado información sobre arquitectura de red, datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO. El artefacto es un ejecutable compilado para Windows x64, presumiblemente escrito en un lenguaje compilado nativo, del que no se distribuye código fuente ni se documenta la cadena de compilación.

La model card menciona módulos internos (configuración JSON persistente, ESP de entidades, guardia anti-AFK, teleport por coordenadas, bucle de farmeo automatizado y cambio de servidor) con latencias declaradas inferiores a 5, 21, 27 y 33 ms según el módulo. Estos datos provienen exclusivamente de la documentación del autor y no son verificables sin inspeccionar el binario, algo que requeriría ingeniería inversa y que no se ha realizado para esta ficha.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No soporta razonamiento multi-paso ni comportamiento agéntico basado en LLM.
- No tiene capacidades multilingües reales pese a las 14 etiquetas de idioma del repositorio.
- Funcionalidades declaradas por el autor (no verificadas): automatización de bucles de farmeo, teletransporte a coordenadas, ESP de entidades y cofres a través de paredes, guardia anti-AFK, cambio automático de servidor y guardado persistente de configuración en JSON.
- No dispone de modo thinking, visión, audio ni ninguna modalidad propia de un modelo fundacional.

## Casos de uso

No se identifican casos de uso legítimos en el ámbito de la ingeniería de IA, la investigación o el desarrollo de software. El artefacto está orientado a la automatización de un videojuego concreto, lo que plantea problemas de cumplimiento de los términos de servicio de la plataforma afectada.

- Automatización de partidas en Roblox: el autor describe bucles de farmeo, teletransporte y ESP; su uso probablemente infringe los términos de servicio de Roblox y puede conllevar el baneo de la cuenta.
- Distribución de binarios vía Hugging Face: caso de uso observado, no recomendado; la plataforma no está diseñada para alojar ejecutables y carece de los controles de integridad habituales en la distribución de software.
- Estudio de técnicas de ingeniería social en repositorios de modelos: el patrón (badges de "verificado", contraseña en el ZIP, descarga desde un repositorio de GitHub ajeno al autor declarado) es un ejemplo didáctico de señales de alarma.
- Análisis de seguridad defensiva: útil como muestra para entrenar clasificadores de detección de repositorios sospechosos en plataformas de modelos.
- No es adecuado para generación de texto, código, atención al cliente, análisis de datos, RAG ni ninguna tarea de NLP.
- No es adecuado para despliegue en producción de ningún tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas equivalentes, y por la naturaleza del artefacto no serían aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, 7-Zip o WinRAR para extraer el ZIP.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: el autor declara latencias por módulo inferiores a 5 ms (configuración), 21 ms (teleport), 27 ms (anti-AFK) y 33 ms (server hopper), sin metodología de medición publicada.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" para este artefacto dentro del ecosistema de modelos de IA. Como referencia de contraste, un modelo de lenguaje pequeño real (por ejemplo, en el rango de 1 a 3 mil millones de parámetros) distribuiría pesos en safetensors o GGUF, documentaría su arquitectura y tokenizador, y permitiría inferencia local verificable; nada de ello está presente aquí.

| Criterio | Este artefacto | Modelo de lenguaje pequeño típico |
|---|---|---|
| Pesos neuronales | no | sí (safetensors/GGUF) |
| Arquitectura documentada | no | sí (transformer, MoE, etc.) |
| Tokenizador | no | sí |
| Inferencia verificable | no | sí |
| Benchmarks publicados | no | habitualmente sí |
| Formato de distribución | `.exe` en `.zip` con contraseña | pesos + código de carga |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, compararse ni desplegarse como tal.
- Binario opaco: se distribuye un ejecutable sin código fuente auditable, alojado en un repositorio de GitHub (`ozlem9810/sols-rng-macro-script-keyless`) distinto del identificador del autor en Hugging Face (`Madi2004`), lo que impide verificar la cadena de custodia.
- Contraseña en el propio README: el ZIP se protege con la contraseña `2026`, publicada junto al enlace; esta práctica no aporta seguridad y suele emplearse para evadir análisis automatizados de malware.
- Solicitud de ejecución como administrador: eleva los privilegios del proceso sin justificación técnica documentada.
- Alertas de Windows Defender y SmartScreen: el propio autor reconoce que el binario dispara heurísticas de seguridad y recomienda su inclusión en listas blancas, lo que constituye una señal de alarma relevante.
- Riesgo de malware: la combinación de ejecutable sin firma, contraseña embebida, petición de privilegios elevados y distribución mediante repositorios espejo es un patrón habitual en campañas de distribución de software malicioso.
- Riesgo legal y de términos de servicio: la funcionalidad declarada (automatización y ESP en Roblox) puede infringir los términos de servicio de la plataforma y la legislación sobre trampas en videojuegos en algunas jurisdicciones.
- Etiquetas de idioma engañosas: las 14 etiquetas lingüísticas no corresponden a ninguna capacidad real del artefacto y contaminan los índices de búsqueda de la plataforma.
- Licencia MIT declarada: aunque permisiva, no cubre el uso del binario frente a terceros ni exime de responsabilidad por el contenido del ejecutable.
- Cero descargas y cero likes en el momento de la consulta: sin comunidad que haya validado el artefacto.
- No usar en producción bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Madi2004/sols-rng-macro-script-keyless
- Repositorio de GitHub referenciado en la model card: https://github.com/ozlem9810/sols-rng-macro-script-keyless
- Releases del repositorio de GitHub: https://github.com/ozlem9810/sols-rng-macro-script-keyless/releases/latest
- Descarga directa del ZIP citada por el autor (no recomendada): https://github.com/ozlem9810/sols-rng-macro-script-keyless/releases/latest/download/sols-rng-macro-script-keyless-v1.2.0-win64.zip
- Paper, blog, demo o documentación técnica: no disponible
