# qdzq/fm27-trainer-football-manager-27-editor

## Resumen

`qdzq/fm27-trainer-football-manager-27-editor` es un repositorio alojado en Hugging Face que, a pesar de su identificador y de su etiqueta `pipeline: other`, no contiene un modelo de inteligencia artificial. Segun su propia model card, se trata de un ejecutable portable de 64 bits para Windows 10/11 (x64) presentado como "Football Manager 27 In-Game Trainer & Live PA/CA Editor" en su version v4.9.9, es decir, una herramienta de tipo trainer/editor para el videojuego Football Manager 27. El autor declarado es el usuario `qdzq` y la licencia indicada es MIT.

El repositorio no incluye pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de lenguaje: la model card describe un binario Windows con soporte para DirectX 12 y Vulkan, configuracion JSON recargable en caliente y una supuesta matriz de rendimiento medida en distintas GPU. No se declara arquitectura de red neuronal, numero de parametros, longitud de contexto ni vocabulario.

Por tanto, esta ficha no puede evaluar capacidades de IA. Se documenta el contenido real del repositorio y se advierte de que la model card contiene patrones tipicos de distribucion de software potencialmente no deseado (enlaces a archivos ZIP alojados en repositorios de terceros, contrasena de extraccion fija, redirecciones a portales `github.io` ajenos al autor y afirmaciones de verificado sin evidencia). No se debe tratar este repositorio como un modelo open source ni ejecutar los binarios enlazados sin analisis previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh (declarados como localizaciones de la herramienta) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto descrito es un archivo `.zip` para Windows) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. La model card no menciona transformer, MoE, SSM ni ningun otro paradigma de red neuronal, ni tampoco datos de entrenamiento, numero de tokens, composicion del dataset, RLHF, DPO o tecnicas de decodificacion. Los unicos elementos tecnicos citados son propios de una aplicacion nativa de Windows: alineacion de registros vectoriales AVX2, ejecucion de bajo overhead, recarga en caliente de `config/settings.json`, y APIs graficas DirectX 12 y Vulkan 1.3.

La model card afirma mediciones de latencia y memoria (por ejemplo, `1,42 ms` de p99 y `44,8 MB` de RAM en una RTX 4070) presentadas como "benchmarks" de la herramienta. Estos datos no son verificables a partir del repositorio y no corresponden a ningun tipo de evaluacion de modelos de IA.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue en el sentido de un modelo de lenguaje; los 12 idiomas listados corresponden a localizaciones de la interfaz de la herramienta.
- La unica funcionalidad descrita es la de un editor/trainer externo para Football Manager 27 (modificacion de atributos PA/CA en tiempo de ejecucion, segun el titulo de la model card).

## Casos de uso

No procede: al no ser un modelo de IA, no existen casos de uso de inferencia, generacion o analisis. Cualquier uso del contenido del repositorio se limita a la ejecucion del binario descrito, con los riesgos de seguridad que se detallan en la seccion de limitaciones. No se recomienda su descarga ni su ejecucion en entornos de desarrollo o investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de latencias de la herramienta (p99 entre `1,42 ms` y `2,15 ms` y consumo de entre `42,4 MB` y `45,2 MB` de RAM en cuatro configuraciones de hardware), pero no son benchmarks de un modelo de IA y no son verificables desde el repositorio.

## Requisitos de hardware

- No aplica VRAM para inferencia de un modelo de lenguaje.
- La model card indica compatibilidad con Windows 10 (22H2+) y Windows 11 (23H2/24H2) en x64, con CPU que soporte AVX2.
- Configuraciones de hardware citadas en la model card: RTX 4070 con Ryzen 7 7800X3D, RTX 3060 con Core i5-13600K, RX 7800 XT con Ryzen 5 7600X e Intel Arc A770 con Core i7-12700K.
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, porque no hay modelo que servir.
- No se dispone de datos fiables de latencia o throughput de inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos de IA comparable, ya que el repositorio no contiene un modelo. Frente a otros repositorios de Hugging Face, la diferencia relevante es que este no incluye pesos ni artefactos de aprendizaje automatico, sino un enlace a un binario externo.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; su presencia en Hugging Face bajo `pipeline: other` puede inducir a confusion en busquedas de modelos.
- La model card incluye enlaces de descarga a archivos `.zip` alojados en repositorios de GitHub de terceros (`Bianchi61`, `floyreq`, `maria60410`) que no coinciden con el autor declarado (`qdzq`), lo que constituye una senal de alarma de seguridad.
- El archivo se distribuye con contrasena de extraccion fija (`2026`), un patron habitual para evadir analisis automatizados de antivirus.
- Se declaran verificaciones de integridad SHA-256 y estados `200 OK` sin ningun tipo de evidencia reproducible en el repositorio.
- Licencia MIT declarada, sin restricciones comerciales explicitas, pero aplicable a un artefacto cuya naturaleza real no puede confirmarse.
- No se debe ejecutar el binario en equipos de produccion, estaciones de trabajo de investigacion ni entornos con credenciales, sin un analisis previo en sandbox y verificacion de firma.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto porque no hay modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qdzq/fm27-trainer-football-manager-27-editor
- Repositorio GitHub citado como "Day-0": https://github.com/floyreq/fm27-trainer-football-manager-27-editor
- Repositorio GitHub citado como primario: https://github.com/maria60410/fm27-trainer-football-manager-27-editor
- Portal `github.io` citado en la model card: https://maria60410.github.io/fm27-trainer-football-manager-27-editor/
- Documentacion Go citada: https://pkg.go.dev/github.com/floyreq/fm27-trainer-football-manager-27-editor
- Notebook citado: https://nbviewer.org/github/floyreq/fm27-trainer-football-manager-27-editor/blob/main/notebooks/quickstart.ipynb
- Descarga directa citada (no recomendada): https://github.com/Bianchi61/dlssg-to-xefg-universal-wrapper/releases/download/v3.2.2/dlssg-to-xefg-universal-wrapper-v3.2.2-win64.zip
