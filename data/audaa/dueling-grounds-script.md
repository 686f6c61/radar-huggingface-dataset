# audaa/dueling-grounds-script

## Resumen

El repositorio `audaa/dueling-grounds-script` no contiene un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un instalador ejecutable para Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, distribuido en un ZIP de 4,8 MB protegido con la contraseña `2026`) presentado como un script o herramienta de asistencia para el videojuego Marvel Rivals. La model card describe modulos de tipo ESP (extra sensory perception, visualizacion de informacion del juego), aimbot con suavizado de entrada Bezier, escaneo dinamico de offsets de memoria y una capa de renderizado disenada para evadir la captura de pantalla de OBS, ShadowPlay y Discord.

No existe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y los idiomas declarados (catorce codigos ISO) corresponden a metadatos de distribucion de software, no a capacidades linguisticas de un modelo. El campo `pipeline` aparece como no disponible y el contador de descargas y likes es cero en el momento de la consulta.

Desde el punto de vista de la evaluacion tecnica, este artefacto queda fuera del ambito de una ficha de modelo: no es un modelo de lenguaje, vision ni multimodal, y no puede ejecutarse mediante vLLM, llama.cpp, Ollama o TGI. La ficha que sigue documenta esta circunstancia de forma explicita para evitar que lectores del blog lo confundan con un modelo open source evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible como capacidad del modelo; la model card declara en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id como metadatos de distribucion |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un binario `.exe` y perfiles JSON) |

## Arquitectura y entrenamiento

No hay arquitectura de aprendizaje automatico que describir. Segun la model card, el binario implementa un nucleo externo en modo usuario que lee memoria de procesos ajenos mediante Desktop Duplication, un escaner de offsets que resuelve firmas de punteros tras los parches del juego, una capa de renderizado superpuesta excluida de las capturas de OBS, ShadowPlay y Discord, y un sistema de perfiles JSON intercambiables en caliente. El autor declara tiempos de respuesta inferiores a 26 ms para el nucleo, inferiores a 10 ms para el escaner y un sondeo de 304 Hz para la tecla de panico (`END`), con un consumo de memoria inferior a 27 MB.

No se ha publicado informacion sobre datos de entrenamiento, proceso de alineacion (RLHF, DPO) ni innovaciones en decodificacion, porque el artefacto no entrena ningun modelo. La unica "innovacion" declarada es de ingenieria de evasion: la exclusion de la superposicion grafica de las APIs de captura mencionadas.

## Capacidades

- Lectura de memoria de un proceso de Windows x64 y resolucion dinamica de offsets tras actualizaciones del juego objetivo.
- Superposicion grafica (overlay) renderizada mediante Desktop Duplication, fuera del pipeline de captura de OBS, ShadowPlay y Discord segun el autor.
- Ajuste automatico de punteria con curvas Bezier configurables, radio de FOV y comprobacion de visibilidad (VisCheck).
- Perfiles JSON intercambiables con una tecla entre preajustes Legit, Visual y Custom.
- Descarga de recursos del proceso mediante tecla de panico `END`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision por computador entendida como modelo, tool calling, capacidades de agente ni modo de razonamiento extendido.

## Casos de uso

- No se identifican casos de uso legitimos de ingenieria de IA para este artefacto.
- Auditoria de seguridad defensiva: un analista de anti-cheat puede examinar el binario y los perfiles JSON para extraer firmas de deteccion y patrones de lectura de memoria.
- Investigacion de tecnicas de evasion de captura: el estudio de la capa de renderizado excluida de OBS y ShadowPlay es relevante para equipos que disenan sistemas de verificacion de integridad en torneos.
- Formacion en ingenieria inversa de videojuegos: el escaner de offsets sirve como ejemplo documentado de resolucion de firmas de punteros tras parches.
- Analisis de malware y cadena de suministro: el ZIP con contrasena y el ejecutable sin firma son un caso de estudio tipico de distribucion de software potencialmente no deseado.
- Concienciacion de usuarios: la ficha puede citarse como ejemplo de repositorio de Hugging Face que no contiene un modelo y que exige ejecutar un binario como administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo declara metricas operativas del ejecutable (respuesta del nucleo inferior a 26 ms, escaner inferior a 10 ms, sondeo de 304 Hz, menos de 27 MB de RAM), que no son comparables con benchmarks de modelos de IA.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no ejecuta inferencia en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo: Windows 10 o Windows 11 de 64 bits, segun la model card.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; se distribuye como ejecutable `.exe` que el autor indica lanzar como administrador.
- Latencia y throughput: no disponibles como metricas de inferencia; las cifras declaradas corresponden a operaciones de lectura de memoria y renderizado del binario.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoria, se situa en el mismo espacio que otros ejecutables de asistencia para videojuegos distribuidos fuera de canales oficiales, para los que no se dispone de datos verificables de rendimiento, licencia efectiva ni seguridad.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural y no puede evaluarse con MMLU, HumanEval o GSM8K.
- El ejecutable se distribuye comprimido con contrasena y solicita privilegios de administrador, practica habitual en campanas de distribucion de software malicioso; no hay verificacion de firma ni hash publicados.
- El uso de herramientas de asistencia en videojuegos multijugador suele violar los terminos de servicio y puede conllevar el baneo permanente de cuentas; en algunas jurisdicciones puede tener implicaciones legales.
- La licencia MIT declarada cubre el contenido del repositorio, pero no garantiza la legalidad del uso del binario ni la ausencia de componentes de terceros con otras condiciones.
- No hay evidencia de auditoria de seguridad, analisis de telemetria ni historial de versiones verificable; el contador de descargas y likes es cero, lo que impide validar la reputacion del artefacto.
- La model card incluye afirmaciones de rendimiento (menos de 26 ms, 304 Hz) sin metodologia de medicion reproducible.
- Riesgo de alucinacion y sesgos: no aplica al no ser un modelo generativo; el riesgo relevante es de seguridad del software.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/audaa/dueling-grounds-script
- Repositorio de GitHub citado en la model card: https://github.com/Onurw90645/dueling-grounds-script
- Repositorio de publicaciones citado en la model card: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026
- Enlace de descarga directa citado en la model card: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Ultima release citada en la model card: https://github.com/Onurw90645/dueling-grounds-script/releases/latest
