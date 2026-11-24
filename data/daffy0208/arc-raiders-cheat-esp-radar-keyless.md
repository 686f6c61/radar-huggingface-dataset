# daffy0208/arc-raiders-cheat-esp-radar-keyless

## Resumen

El artefacto publicado bajo el identificador `daffy0208/arc-raiders-cheat-esp-radar-keyless` no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un paquete binario para Windows x64 distribuido a traves de Hugging Face y presentado como una herramienta de trampas (cheat) para el videojuego Arc Raiders, con funcionalidades declaradas de ESP (deteccion visual de jugadores a traves de paredes), radar 2D y filtrado de botin. El autor de la model card no proporciona ningun tipo de informacion sobre arquitectura de red neuronal, parametros, datos de entrenamiento ni proceso de publicacion de pesos; la totalidad del contenido tecnico describe modulos de manipulacion de memoria de proceso, un overlay externo renderizado por Duplication de escritorio y un escaner dinamico de offsets.

La relevancia de esta ficha es, por tanto, fundamentalmente negativa y de advertencia: se trata de un artefacto que suplanta la categoria de "modelo" en un repositorio de modelos, no cumple ninguno de los criterios tecnicos que definen un modelo de IA open source y presenta multiples senales de riesgo para el usuario (binario cerrado de procedencia no verificable, contrasena en el archivo comprimido para evadir analisis automatizados, instrucciones para desactivar alertas de Windows Defender y ejecucion como administrador). No existe pipeline declarado, no hay pesos, no hay tokenizador y no hay tarjeta de modelo en el sentido habitual del termino.

Esta ficha se redacta, por tanto, como evaluacion tecnica de un artefacto no-modelo, documentando lo que el autor declara y senalando de forma explicita todo aquello que no es verificable o que constituye un riesgo de seguridad. Se recomienda no descargar ni ejecutar el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el autor describe modulos de manipulacion de memoria y overlay externo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos de la model card, no como capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows x64, no pesos de red neuronal) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El autor describe, en su lugar, un conjunto de componentes de ingenieria de software orientados a la manipulacion de un proceso de juego en Windows: un escaner dinamico de offsets con resolucion automatica de firmas de punteros tras los parches del juego (consistencia declarada del 98,3 %), un overlay externo de mas de 144 Hz basado en Duplication de escritorio con cajas delimitadoras 2D/3D, esqueletos de huesos y ESP de distancia, repartido en 8 hilos de trabajo, una tecla de panico (`END`) con liberacion de handles en menos de 6 ms, una capa de render "stream-proof" que excluye la captura por OBS, ShadowPlay y Discord (consistencia declarada del 99,4 %), un radar 2D con filtrado de botin por rareza sobre 14 hilos y un nucleo externo en modo usuario sin hooks de DLL internos con latencia declarada inferior a 28 ms.

Ninguna de estas cifras es verificable de forma independiente: proceden unicamente de la model card del autor y no hay repositorio de codigo fuente, paper, informe de auditoria ni binario reproducible asociado. El paquete se distribuye como `arc-raiders-cheat-esp-radar-keyless-v1.2.0-win64.zip` (8,9 MB) protegido con la contrasena `2026`, un patron habitual para dificultar el analisis automatico por parte de antivirus y plataformas de moderacion. No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovacion tecnica alguna en el sentido de la IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues reales; los idiomas listados son metadatos de la model card.
- No dispone de modo thinking, vision, audio ni ninguna capacidad cognitiva.
- Funcionalidades declaradas por el autor (todas ellas orientadas a hacer trampas en un videojuego): ESP de jugadores con cajas 2D/3D y esqueletos de huesos, radar 2D, filtrado de botin por rareza, overlay externo a mas de 144 Hz y tecla de panico.
- Estas funcionalidades, ademas de no ser capacidades de IA, pueden infringir los terminos de servicio del videojuego y la legislacion aplicable en materia de trampas y manipulacion de software de terceros.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, porque el artefacto no es un modelo. Los escenarios que el autor plantea son de naturaleza ilicita o fraudulenta respecto al videojuego objetivo:

- Manipulacion de la memoria del proceso de Arc Raiders para revelar la posicion de otros jugadores: el autor describe un escaner dinamico de offsets y ESP con cajas y esqueletos; su uso vulnera los terminos de servicio del juego y puede constituir una infraccion contractual.
- Captura de pantalla con overlay externo: el autor describe renderizado por Duplication de escritorio con exclusion de OBS, ShadowPlay y Discord para dificultar la deteccion en transmisiones; no es un caso de uso de IA.
- Filtrado de botin por rareza sobre un radar 2D: funcionalidad de asistencia en el juego, sin relacion con procesamiento del lenguaje ni vision por computador entrenada.
- Distribucion de binarios cerrados con contrasena y evasio de antivirus: el propio autor indica como desactivar alertas de Windows Defender y SmartScreen; este patron es el habitual en campanas de malware.
- Ejecucion como administrador de un binario de origen no verificado: riesgo directo de compromiso del sistema operativo del usuario.
- Publicacion en un repositorio de modelos de IA: uso del ecosistema de Hugging Face como canal de distribucion de software ajeno a la IA, lo que supone un abuso de la plataforma.

No se recomienda ninguno de estos escenarios. La ficha se limita a documentar lo que el autor declara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye cifras de rendimiento propias (98,3 % de consistencia del escaner de offsets, 99,4 % de consistencia de la capa stream-proof, menos de 6 ms de respuesta de la tecla de panico, menos de 28 ms de latencia del nucleo externo, 144 Hz de overlay y 8 y 14 hilos de trabajo), pero no son benchmarks de modelos de IA, no estan acompanadas de metodologia y no son verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no ejecuta inferencia de redes neuronales.
- GPU recomendadas: no aplica; el autor no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 11 y Windows x64.
- Tamano del paquete: 8,9 MB (ZIP), con contrasena `2026`.
- Opciones de despliegue: no aplica (no hay soporte para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: el autor declara menos de 28 ms de latencia del nucleo externo y mas de 144 Hz de overlay, sin metodologia de medicion.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo de IA. La comparacion con modelos de lenguaje, vision o audio carece de sentido tecnico. Tampoco se identifican en la informacion proporcionada otros artefactos de la misma categoria con los que establecer una comparacion fiable.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline. Cualquier expectativa de uso como modelo de lenguaje, vision o audio es infundada.
- Binario cerrado de procedencia no verificable: no hay codigo fuente publico, ni compilacion reproducible, ni firma digital del autor.
- Contrasena en el archivo comprimido (`2026`): patron habitual para evadir el analisis automatico de antivirus y plataformas de moderacion.
- Instrucciones explicitas para desactivar Windows Defender y SmartScreen: el autor indica como hacer whitelist del directorio y ejecutar como administrador, lo que incrementa el riesgo de compromiso del sistema.
- Ejecucion con privilegios de administrador sobre un binario no auditado: riesgo de instalacion de malware, robo de credenciales o persistencia no deseada.
- Posible infraccion de los terminos de servicio de Arc Raiders y de la legislacion aplicable sobre trampas y manipulacion de software de terceros.
- La licencia MIT declarada en los metadatos no aporta ninguna garantia sobre el contenido del binario ni sobre su seguridad; la licencia MIT es una licencia de software, no una certificacion de ausencia de codigo malicioso.
- Riesgo reputacional y legal para quien distribuya o utilice el artefacto.
- No se ha verificado ningun dato de la model card de forma independiente; todas las cifras proceden del autor.
- Recomendacion: no descargar, no extraer y no ejecutar el contenido.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/daffy0208/arc-raiders-cheat-esp-radar-keyless
- Repositorio de releases citado en la model card: https://github.com/JasmijnChauhan76860/arc-raiders-cheat-esp-radar-keyless/releases/latest
- Paquete directo citado en la model card: https://github.com/JasmijnChauhan76860/arc-raiders-cheat-esp-radar-keyless/releases/latest/download/arc-raiders-cheat-esp-radar-keyless-v1.2.0-win64.zip
- No se han encontrado papers, blogs tecnicos, demos ni repositorios de codigo fuente auditables en la informacion disponible.
