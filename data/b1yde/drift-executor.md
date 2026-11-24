# b1yde/drift-executor

## Resumen

`b1yde/drift-executor` no es un modelo de inteligencia artificial. El repositorio de Hugging Face etiquetado con ese identificador contiene una model card que distribuye un supuesto ejecutor de scripts para Roblox en Windows, empaquetado como archivo ZIP protegido con contrasena y alojado en un repositorio de GitHub de terceros (`Isabellev773/drift-executor`). No hay pesos de modelo, tokenizador, configuracion de arquitectura ni artefactos de inferencia en la informacion disponible.

El contenido promociona funcionalidades propias de un ejecutor de exploits (sincronizacion de offsets tras parches, inyeccion de scripts Luau, compatibilidad con la API `Drawing`, `hookmetamethod`, `getgc`, soporte multi-instancia y auto-ejecucion de directorios). Se trata, por tanto, de software de terceros con tecnicas habituales de evasion de antivirus (contrasena en el archivo comprimido, instrucciones para excluir el binario de Windows Defender, ejecucion como administrador), lo que constituye un indicador de riesgo de seguridad.

La ficha se mantiene por rigor documental: se describe lo que el repositorio declara y se marcan como "no disponible" todos los parametros propios de un modelo de lenguaje. No debe interpretarse como una recomendacion de uso ni como una evaluacion de capacidades de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; segun la model card, ejecutor de scripts para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card; no implican capacidad linguistica de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es `drift-executor-v1.2.0-win64.zip`, 8,9 MB, con binario `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe un binario Windows x64 (`drift-executor-v1.2.0-win64.exe`, compilacion declarada `v1.3.9` / `2DDC11EA8E`) que, segun el autor, se engancha a procesos de cliente de Roblox mediante un puente de maquina virtual Luau, sincroniza offsets tras actualizaciones de firma y expone APIs de scripting (`hookmetamethod`, `getgc`, `Drawing`). No se aporta documentacion tecnica verificable, codigo fuente, hashes de integridad ni trazabilidad de compilacion.

El repositorio de Hugging Face no contiene pesos, dataset, tokenizador ni configuracion. La fecha de creacion y actualizacion indicada (2026-11-24) y las cifras promocionales de descargas (867K+) no son verificables y no guardan relacion con las metricas reales de la plataforma (0 descargas, 0 likes en el momento de la consulta).

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de los modelos de IA.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; las etiquetas de idioma de la model card son metadatos sin respaldo tecnico.
- Segun el autor, el binario ofrece inyeccion de scripts Luau, adjuncion a procesos, multi-instancia y auto-ejecucion; estas afirmaciones no son verificables con la informacion disponible.

## Casos de uso

- Ninguno recomendado en el contexto de IA: el artefacto no permite inferencia, generacion ni procesamiento de lenguaje natural.
- Auditoria de seguridad defensiva: analizar el binario en un entorno aislado (sandbox, maquina virtual sin red) para determinar su comportamiento real y documentar indicadores de compromiso.
- Estudio de tecnicas de evasion: revisar el uso de contrasenas en archivos ZIP y las instrucciones de exclusion de antivirus como patron documentado de distribucion maliciosa.
- Formacion en concienciacion: usar la model card como ejemplo de ingenieria social (insignias falsas de valoracion y descargas, enlaces a repositorios no oficiales).
- Analisis de politicas de plataforma: evaluar como Hugging Face gestiona repositorios que no contienen modelos y que distribuyen ejecutables de terceros.
- Investigacion de malware: extraer hashes y comparar con bases de datos de virus total si se dispone del binario de forma licita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`< 36 ms`, `99,1 %` de consistencia, `98 %+ sUNC`, `< 52 MB` de RAM) son afirmaciones promocionales del autor sin metodologia, sin conjunto de prueba y sin verificacion independiente; no se reproducen como resultados validos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que ejecutar).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema declarado por el autor: Windows 10 (22H2) y Windows 11 (24H2), procesadores x64 Intel y AMD.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Como referencia de categoria, podria contrastarse con otros repositorios de Hugging Face que distribuyen ejecutables o herramientas de escritorio, pero no se dispone de datos verificables para establecer una comparacion tecnica.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni procesa lenguaje; cualquier expectativa de uso como LLM es infundada.
- Riesgo de seguridad alto: distribucion de un ejecutable de terceros mediante enlace externo, archivo ZIP con contrasena e instrucciones explicitas para desactivar o excluir la deteccion de Windows Defender y SmartScreen.
- Ejecucion como administrador: la guia indica ejecutar el binario con privilegios elevados, lo que amplia el impacto potencial de cualquier comportamiento malicioso.
- Ausencia de trazabilidad: no hay codigo fuente, hashes, firma de codigo ni historial de compilacion verificable.
- Posible infraccion de terminos de servicio: las funcionalidades descritas (inyeccion de scripts en un cliente de juego) contravienen habitualmente los terminos de uso de Roblox y pueden constituir acceso no autorizado a sistemas.
- Licencia MIT declarada: aunque permite uso comercial segun el texto de la licencia, esta se aplica al contenido del repositorio tal cual; no otorga garantias ni exime de responsabilidad legal por el uso del binario.
- Metricas de popularidad no fiables: la model card afirma 867K+ descargas y valoracion 4,8/5, mientras que la plataforma registra 0 descargas y 0 likes.
- Fechas incoherentes: la model card referencia un build de 2026 y un archivo denominado `v1.2.0` para un binario `v1.3.9`, lo que sugiere desorganizacion o suplantacion.
- Idiomas etiquetados sin respaldo: las 14 etiquetas de idioma no implican ninguna capacidad linguistica del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/b1yde/drift-executor
- Repositorio de GitHub referenciado por el autor (no oficial, no verificado): https://github.com/Isabellev773/drift-executor
- Pagina de releases referenciada: https://github.com/Isabellev773/drift-executor/releases/latest
- Descarga directa referenciada por el autor (ZIP con contrasena, no verificada): https://github.com/Isabellev773/drift-executor/releases/latest/download/drift-executor-v1.2.0-win64.zip
- Papers, blogs, demos o documentacion tecnica: no disponible
