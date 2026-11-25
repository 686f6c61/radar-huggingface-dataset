# carlose77/do-not-stop-script

## Resumen

`carlose77/do-not-stop-script` no es un modelo de inteligencia artificial. Se trata de un repositorio de Hugging Face que distribuye un supuesto ejecutable para Windows 10/11 de 64 bits, empaquetado en un archivo ZIP de 4,8 MB protegido con contrasena, y cuya model card lo describe explicitamente como un binario independiente de tipo *game cheat* (trampas para videojuegos). El contenido promociona funciones de radar 2D, superposicion externa a 144 Hz, suavizado de entrada por curvas de Bezier y una capa de renderizado disenada para eludir la captura de pantalla de OBS, ShadowPlay y Discord.

El artefacto no contiene pesos, tokenizador, configuracion de arquitectura ni ningun componente propio de un modelo de lenguaje. Los metadatos de Hugging Face no declaran pipeline, y las etiquetas (`windows`, `x64`, `portable`) describen un programa ejecutable, no un checkpoint. Por tanto, esta ficha se limita a documentar lo que el repositorio declara y a advertir de los riesgos asociados; no es posible evaluar capacidades de IA porque no existen.

La relevancia de esta entrada es negativa: ejemplifica el uso de plataformas de modelos para alojar y promocionar software potencialmente malicioso o fraudulento, con tecnicas habituales de ingenieria social (contrasena en el archivo, instrucciones para desactivar avisos de Windows Defender, insignias de descargas y valoraciones infladas). Cualquier evaluacion tecnica como modelo queda fuera de lugar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos; corresponden a la documentacion, no a capacidades del binario) |
| Licencia | MIT (declarada en metadatos; aplicable al repositorio, no verificable sobre el binario) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio declara un paquete `solara-executor-v3-keyless-2026-v1.2.2-win64.zip` de 4,8 MB con un ejecutable `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` (build `v2.3.1`, identificador `4A79C8`). La model card menciona componentes de tipo *user-mode external core* con sondeo a 358 Hz, un escaner dinamico de offsets y una capa de renderizado basada en Desktop Duplication, todos ellos propios de software de trampas para videojuegos y no de un sistema de IA.

No se documenta ningun dataset, ninguna fase de preentrenamiento, ajuste supervisado, RLHF o DPO. Tampoco se aporta informacion sobre pesos, tokenizadores, arquitectura de atencion ni innovaciones tecnicas de modelado. La unica "innovacion" declarada es la evasion de capturas de pantalla y la resolucion automatica de firmas de punteros tras parches del juego.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No soporta *tool calling* ni *function calling* en el sentido de los modelos de IA.
- No implementa razonamiento multi-paso ni comportamiento agentico.
- Las capacidades multilingues declaradas en los metadatos se refieren a la documentacion del repositorio, no a funcionalidad del ejecutable.
- El binario, segun la propia model card, ofrece funciones de trampa en videojuegos: radar 2D, filtro de botin, superposicion externa con cajas delimitadoras y esqueletos oseos, suavizado de entrada y evasion de captura de pantalla.
- No dispone de modo *thinking*, vision artificial general, audio ni ninguna otra capacidad de IA.

## Casos de uso

- Ninguno legitimo en el ambito de IA, desarrollo de software o investigacion. El artefacto no permite generar texto, analizar datos, programar ni desplegar agentes.
- Uso como ejemplo de analisis de riesgo: estudiar como se estructuran las campanas de distribucion de software no deseado en plataformas de modelos (ZIP con contrasena, instrucciones para desactivar antivirus, insignias falsas de descargas y valoracion).
- Formacion en seguridad: identificar patrones de ingenieria social en model cards, como la peticion de ejecutar un `.exe` como administrador o la inclusion de una contrasena fija (`2026`) para evitar analisis automatizados.
- Auditoria de cumplimiento: revisar por que un repositorio de este tipo no deberia alojarse en una plataforma orientada a modelos, y que controles de moderacion fallan.
- Investigacion de malware: analisis estatico y dinamico del binario en un entorno aislado para determinar su comportamiento real, que la model card no detalla.
- Documentacion de incidentes: registrar la discrepancia entre las etiquetas de Hugging Face (idiomas, licencia MIT, region US) y el contenido efectivo del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de modelos, porque el artefacto no es un modelo. Las cifras que aparecen en la model card (`98,3%` de consistencia, `96,3%` de consistencia, `99,3%` de consistencia, `358 Hz` de sondeo, `< 19 MB` de RAM) son afirmaciones del autor sin metodologia, sin conjunto de validacion y sin posibilidad de reproduccion; no deben interpretarse como benchmarks.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos ni inferencia neuronal.
- GPU: no aplica; el software declarado funciona en Windows 10/11 de 64 bits y no requiere GPU.
- CPU y memoria: la model card afirma un consumo inferior a 19 MB de RAM y once hilos de trabajo, datos no verificados.
- Almacenamiento: el archivo distribuido ocupa 4,8 MB.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI. El unico "despliegue" descrito es extraer el ZIP con la contrasena `2026` y ejecutar el `.exe` como administrador, practica de alto riesgo.
- Latencia y throughput: no disponibles; las cifras de 144 Hz y 358 Hz son afirmaciones del autor sin verificacion independiente.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Frente a otros repositorios de Hugging Face, la comparacion relevante seria con otros paquetes de software para Windows, categoria en la que no se dispone de datos verificables sobre este binario concreto.

| Criterio | Este repositorio | Modelo de IA tipico (referencia generica) |
|---|---|---|
| Naturaleza | Ejecutable de Windows en ZIP | Pesos en safetensors/GGUF |
| Parametros | No disponible | Miles de millones |
| Contexto | No disponible | Decenas de miles de tokens |
| Licencia | MIT declarada | Variable |
| Evaluacion reproducible | Ninguna | Benchmarks publicos |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigacion o produccion.
- Riesgo de seguridad elevado: la model card pide ejecutar un binario desconocido como administrador, extraerlo con una contrasena fija y desactivar o ignorar avisos de Windows Defender y SmartScreen. Este patron es habitual en la distribucion de malware.
- Procedencia no verificable: el repositorio pertenece a `carlose77`, pero los enlaces de descarga apuntan a cuentas de GitHub de terceros (`schneider6972`, `ArjunRyu`), lo que impide confirmar la autoria ni la integridad del binario.
- Indicadores inflados: la model card muestra insignias de 648 000 descargas y valoracion 5,0/5, mientras que Hugging Face registra 0 descargas y 0 *likes*. Es una discrepancia que sugiere manipulacion.
- Uso ilegitimo: las funciones descritas (trampas en videojuegos, evasion de captura de pantalla) pueden violar los terminos de servicio de los juegos y la legislacion aplicable en materia de fraude o circumvencion de medidas tecnologicas.
- Licencia: aunque se declara MIT, esta se aplica al contenido del repositorio y no garantiza nada sobre el binario distribuido; el uso comercial del ejecutable es juridicamente arriesgado y tecnicamente desaconsejable.
- Idiomas: los catorce idiomas listados corresponden a la documentacion, no a capacidades del software.
- Alucinacion y sesgos: no aplica en sentido estricto, pero la model card contiene afirmaciones no verificables presentadas como hechos, lo que constituye desinformacion documental.
- Recomendacion: no descargar ni ejecutar el artefacto fuera de un entorno de analisis aislado y con supervision de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/carlose77/do-not-stop-script
- Enlace de descarga citado en la model card (GitHub, cuenta de terceros): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como origen alternativo: https://github.com/ArjunRyu/do-not-stop-script/releases/latest
