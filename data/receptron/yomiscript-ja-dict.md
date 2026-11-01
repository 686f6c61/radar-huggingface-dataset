# receptron/yomiscript-ja-dict

## Resumen

`receptron/yomiscript-ja-dict` no es un modelo de lenguaje, sino un diccionario de acentos japoneses empaquetado como artefacto descargable para el ecosistema YomiScript de Receptron. Contiene NAIST-JDIC con los campos de acento de OpenJTalk, en el formato de lindera/jpreprocess, generado por `jpreprocess` 0.15.0 (concretamente el paquete `jpreprocess-naist-jdic`). Su funcion es aportar informacion de acentuacion (pitch accent) a la sintesis de voz en japones del CLI de YomiScript, su servidor MCP y su plugin de chat.

El repositorio es minimo (0.0 GB declarados, ocho ficheros comprimidos de unos 28 MB en total) y no publica pipeline de HuggingFace ni pesos de red neuronal. La relevancia es de nicho: cualquier desarrollador que construya TTS japones con jpreprocess o YomiScript necesita exactamente este tipo de recurso lexico versionado, ya que un diccionario solo funciona con la version de jpreprocess que lo genero.

Los datos disponibles son muy limitados: no hay informacion sobre parametros, contexto ni benchmarks porque no aplican a un diccionario. Esta ficha documenta el artefacto con la informacion disponible y marca explicitamente como "no disponible" todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un diccionario lexico en formato lindera/jpreprocess) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | japones (ja) |
| Licencia | BSD-3-Clause (NAIST-JDIC bajo licencia tipo BSD de NAIST; ver `NOTICE`) |
| Formato de pesos | no disponible (no hay pesos; ocho ficheros de diccionario comprimidos con gzip, en el directorio `jpreprocess-0.15.0/`) |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento. El artefacto es un diccionario de pronunciacion y acento construido a partir de NAIST-JDIC, enriquecido con los campos de acento de OpenJTalk y serializado en el formato que consume jpreprocess (lindera). La generacion se realiza con `jpreprocess` 0.15.0 mediante el script `packages/ja-accent/wasm/build-dict.sh` del repositorio de YomiScript.

El versionado es estricto por diseno: el directorio `jpreprocess-0.15.0/` agrupa los ocho ficheros del diccionario y una nueva version de jpreprocess requiere un directorio nuevo, porque el formato no es compatible entre versiones. Los consumidores (CLI, servidor MCP y plugin de chat de YomiScript) lo descargan la primera vez que sintetizan japones y lo usan para asignar el acento del diccionario a las frases cuya lectura coincide con la del YomiScript.

## Capacidades

- Proporciona lecturas (yomi) y campos de acento para entradas lexicas del japones, a partir de NAIST-JDIC y OpenJTalk.
- Permite al motor de TTS de YomiScript asignar el patron de acento correcto cuando la lectura de una frase coincide con una entrada del diccionario.
- Se integra en el CLI de YomiScript, su servidor MCP y su plugin de chat como recurso descargado bajo demanda.
- Formato compatible con jpreprocess 0.15.0 (lindera), no con otras versiones.
- No realiza generacion de texto, razonamiento, codigo, vision, tool calling ni funciones de agente.

## Casos de uso

- Sintesis de voz japonesa con YomiScript: el CLI descarga el diccionario la primera vez que habla japones y lo emplea para aplicar el acento correcto a las frases reconocidas.
- Servidor MCP de YomiScript: al exponer TTS japones a un cliente MCP, el servidor usa este diccionario para resolver la acentuacion de las entradas lexicas.
- Plugin de chat con salida de voz en japones: el plugin obtiene lecturas y acentos para que la locucion suene natural en conversaciones multi-turno.
- Pipeline propio con jpreprocess 0.15.0: cualquier proyecto que use `jpreprocess-naist-jdic` puede consumir estos ficheros como diccionario de acentos compatible.
- Reproducibilidad de builds: al fijar el directorio por version de jpreprocess, permite reconstruir entornos de TTS con el mismo diccionario exacto.
- Desarrollo de herramientas linguisticas japonesas: sirve como fuente de lecturas y acentos para validar transcripciones o anotaciones en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un diccionario y no de un modelo, las metricas habituales (MMLU, HumanEval, GSM8K) no aplican.

## Requisitos de hardware

- No requiere GPU: es un recurso lexico que se carga en CPU y memoria del proceso de TTS.
- Espacio en disco: aproximadamente 28 MB comprimidos para los ocho ficheros del directorio `jpreprocess-0.15.0/`.
- Memoria RAM: no disponible; depende de como jpreprocess cargue el diccionario en el proceso.
- GPU recomendadas: no aplica.
- Cabe en cualquier consumer: si, en cualquier maquina capaz de ejecutar jpreprocess 0.15.0.
- Opciones de despliegue: descarga bajo demanda desde el CLI, servidor MCP o plugin de chat de YomiScript; uso directo con jpreprocess 0.15.0 en pipelines propios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Recurso | Tipo | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| receptron/yomiscript-ja-dict | Diccionario de acentos (NAIST-JDIC + OpenJTalk) | ja | lindera/jpreprocess 0.15.0, gzip | BSD-3-Clause | Versionado por version de jpreprocess |
| `jpreprocess-naist-jdic` (upstream) | Diccionario | ja | jpreprocess | BSD de NAIST | Origen de los datos; este repo es una distribucion empaquetada del mismo |
| OpenJTalk (diccionario de acentos) | Diccionario | ja | Propio de OpenJTalk | no disponible | Fuente de los campos de acento incorporados |

No se dispone de datos de rendimiento comparables, ya que ninguno de los recursos listados es un modelo con benchmarks.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; usarlo como tal es un error de categoria.
- Compatibilidad estricta: el diccionario solo funciona con jpreprocess 0.15.0; otras versiones requieren un directorio y un build distintos.
- Cobertura limitada al lexico de NAIST-JDIC: las palabras fuera del diccionario no obtendran acento y el sistema debera recurrir a heuristicas.
- Solo japones: no aporta nada para otros idiomas.
- Licencia: BSD-3-Clause para el empaquetado, con los avisos de NAIST en `NOTICE`; conviene revisar y conservar dichos avisos en redistribuciones.
- Sin mantenimiento visible en HuggingFace: 0 descargas y 0 likes en el momento de la consulta; el desarrollo real ocurre en el repositorio de GitHub de YomiScript.
- Sin datos de benchmarks, latencia ni consumo de memoria publicados.
- Riesgo de desactualizacion: si NAIST-JDIC u OpenJTalk cambian, este artefacto no se actualiza automaticamente.

## Enlaces

- HuggingFace: https://huggingface.co/receptron/yomiscript-ja-dict
- Repositorio YomiScript: https://github.com/receptron/yomiscript
- Paquete ja-accent: https://github.com/receptron/yomiscript/tree/main/packages/ja-accent
- jpreprocess: https://github.com/jpreprocess/jpreprocess
- Script de construccion: `packages/ja-accent/wasm/build-dict.sh` (en el repositorio de YomiScript)
- README de origen de la model card: `packages/ja-accent/wasm/dict-README.md` (en el repositorio de YomiScript)
