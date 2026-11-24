# Jv1Ttz/brookhaven-adopt-me-sols-rng-script

## Resumen

El repositorio `Jv1Ttz/brookhaven-adopt-me-sols-rng-script` no contiene un modelo de lenguaje ni un sistema de IA. Se trata de un paquete distribuible para Windows x64 presentado como "script" para el juego Roblox (Brookhaven / Adopt Me), empaquetado como un ejecutable portable con un archivo ZIP protegido por contrasena. La model card describe funcionalidades propias de una herramienta de automatizacion y trampas en videojuegos: ESP de entidades y cofres, teleport por coordenadas, alertas por webhook de Discord, anti-AFK y "server hopper".

El contenido de la model card es incoherente y presenta senales claras de riesgo: el ZIP descargable se denomina `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip`, un nombre ajeno al proyecto declarado, y los enlaces apuntan a repositorios de terceros (`rocha1838`, `amaxwell46`) distintos del autor del repositorio en Hugging Face. Ademas, el propio texto reconoce que Windows Defender y SmartScreen generan alertas heuristicas sobre el binario, y pide al usuario que lo ejecute "como administrador" y lo incluya en la lista blanca.

Por todo ello, esta ficha no puede documentar arquitectura, parametros, contexto ni rendimiento: no existe ningun modelo subyacente. La ficha se limita a registrar los metadatos disponibles y a advertir de que el artefacto no es un modelo de IA y de que su descarga y ejecucion con privilegios elevados constituye un riesgo de seguridad relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como `.zip` con un `.exe` en su interior; tamano declarado 4,8 MB) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo entrenado: es un binario compilado para Windows x64 que, segun la model card, implementa modulos de automatizacion sobre el cliente de Roblox. No se documenta lenguaje de programacion, cadena de compilacion, dependencias ni proceso de entrenamiento alguno. La unica informacion tecnica declarada es la version de build (`v2.1.7`, `DB3883`), el tamano del paquete (4,8 MB) y una contrasena de extraccion (`2026`).

La model card incluye afirmaciones de rendimiento sin metodologia verificable (por ejemplo, "97,8 % de consistencia" en el ESP o "412 Hz" de sondeo para las alertas de webhook). No se aportan repositorios de codigo fuente, hashes de verificacion ni firmas digitales del binario.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento (thinking), vision, audio ni multimodalidad.
- Las capacidades que declara la model card son de automatizacion de juego: ESP de entidades y cofres, teleport por coordenadas, alertas por webhook de Discord, guardia anti-AFK y cambio automatico de servidor.
- El soporte multilingue se limita a etiquetas de metadatos; no hay evidencia de interfaz ni de contenido en esos idiomas.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA. Los escenarios que describe la model card son:

- Automatizacion de tareas repetitivas en Roblox (anti-AFK): mantendria la sesion activa mediante pulsaciones de entrada virtuales para evitar la expulsion por inactividad.
- Localizacion de entidades y cofres mediante ESP: superpondria informacion de posicion de objetos y objetivos a traves de geometria del juego.
- Teleport entre islas, NPC y salas de incursion: desplazaria al personaje a coordenadas predefinidas.
- Notificaciones externas por webhook de Discord: enviaria avisos de eventos o "drops" a un canal configurado.
- Cambio automatico de instancia para buscar apariciones raras: rotaria de servidor en servidor de forma automatizada.
- Optimizacion de fotogramas: aplicaria eliminacion de particulas y renderizado de bajo coste de CPU.

Todos estos escenarios implican la modificacion del comportamiento de un cliente de juego de terceros y pueden contravenir los terminos de servicio de Roblox. Ademas, la ejecucion del binario requiere privilegios de administrador y la desactivacion de las protecciones de Windows, lo que agrava el riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (consistencia del 97,8 %, 99,5 %, 99,7 %, sondeo a 412 Hz) carecen de metodologia, conjunto de prueba y reproducibilidad, por lo que no se recogen como resultados validos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Opciones de despliegue: ejecucion directa del `.exe` extraido del ZIP, con elevacion a administrador segun las instrucciones del autor.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos de IA comparable, ya que el artefacto no es un modelo. Como referencia de riesgo, cualquier binario de procedencia no verificada distribuido con contrasena en el ZIP y con instrucciones para desactivar el antivirus presenta un perfil de confianza inferior al de cualquier modelo open source publicado con pesos y codigo auditables.

| Criterio | Este artefacto | Modelo de IA open source tipico |
|---|---|---|
| Naturaleza | Ejecutable portable de Windows | Pesos y codigo de red neuronal |
| Pesos auditables | No | Si (safetensors, GGUF) |
| Repositorio de codigo | No declarado | Habitual |
| Firma o hash verificable | No declarado | Habitual |
| Requiere desactivar antivirus | Si, segun el propio autor | No |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Incoherencia entre el nombre del proyecto y el del binario distribuido (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`), lo que sugiere reutilizacion de paquetes ajenos o suplantacion.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no vinculados al autor del repositorio en Hugging Face.
- El autor reconoce que Windows Defender y SmartScreen marcan el ejecutable y recomienda incluirlo en la lista blanca: practica de alto riesgo.
- Se solicita ejecutar el binario como administrador, lo que amplia el impacto potencial de cualquier codigo malicioso.
- Cero descargas y cero "likes" en el momento de la consulta: sin evidencia de uso ni de comunidad que lo respalde.
- Riesgo de incumplimiento de los terminos de servicio de Roblox y posible expulsion de cuentas.
- La licencia MIT declarada en los metadatos no acredita la legalidad ni la seguridad del contenido distribuido.
- No se debe descargar, extraer ni ejecutar el paquete en entornos de produccion o personales sin analisis previo en una sandbox aislada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jv1Ttz/brookhaven-adopt-me-sols-rng-script
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (repositorio de terceros, no verificado): https://github.com/amaxwell46/brookhaven-adopt-me-sols-rng-script/releases/latest
- No se han encontrado papers, blogs ni demos relevantes en la busqueda web realizada.
