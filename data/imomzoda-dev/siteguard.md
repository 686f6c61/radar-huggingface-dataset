# imomzoda-dev/SiteGuard

## Resumen

SiteGuard no es un modelo de inteligencia artificial, sino una aplicacion de escritorio para Windows desarrollada por el usuario imomzoda-dev y publicada en HuggingFace bajo el identificador `imomzoda-dev/SiteGuard`. Su funcion es bloquear el acceso a redes sociales y sitios para adultos mediante la tabla de politicas de resolucion de nombres (NRPT) de Windows, una politica DNS nativa que actua a nivel de sistema operativo y afecta a todos los navegadores y aplicaciones del equipo. La aplicacion esta escrita en Python con PySide6 (Qt for Python) y se distribuye como un ejecutable autonomo.

El repositorio de HuggingFace no contiene pesos, checkpoints ni artefactos de aprendizaje automatico: aloja la model card de un proyecto de software de control parental. Por tanto, no dispone de arquitectura neuronal, parametros, contexto, cuantizaciones ni idiomas de inferencia. Cualquier evaluacion como modelo de lenguaje carece de sentido tecnico; la ficha se limita a documentar lo que el autor declara en su model card y a senalar explicitamente los datos no disponibles.

La relevancia de esta entrada es, por un lado, como ejemplo de uso atipico de HuggingFace para distribuir software no-ML y, por otro, como advertencia para pipelines de catalogacion automatica que podrian clasificar erroneamente este repositorio como modelo. No se ha publicado informacion sobre benchmarks, licencia o rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; aplicacion de escritorio en Python + PySide6/Qt) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y la documentacion estan en ruso) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se distribuye un ejecutable `.exe` autonomo para Windows) |

## Arquitectura y entrenamiento

No aplica. SiteGuard es una aplicacion de escritorio que no emplea redes neuronales ni ha sido entrenada con datos. Su mecanismo tecnico consiste en manipular la NRPT (Name Resolution Policy Table) de Windows para redirigir o bloquear la resolucion DNS de una lista de dominios configurables. El autor argumenta que este enfoque es mas robusto que la edicion del fichero `hosts`, ya que los antivirus (menciona Kaspersky) suelen monitorizar y revertir cambios en `hosts`, mientras que la politica DNS se aplica a nivel de sistema para todos los navegadores y aplicaciones.

La aplicacion incluye una tarea programada de Windows que restaura la configuracion de bloqueo al iniciar sesion si esta ha sido desactivada, proteccion por contrasena (valor por defecto `q1w2e3r4`, modificable en ajustes) y un mecanismo de autoactualizacion que consulta las releases del repositorio de GitHub del autor, descarga la nueva version, se reemplaza y se reinicia. No hay informacion sobre el proceso de compilacion, empaquetado del EXE ni dependencias exactas mas alla de Python y PySide6.

## Capacidades

- Bloqueo de dominios a nivel de sistema mediante NRPT, aplicable a todos los navegadores y aplicaciones del equipo.
- Lista predefinida de sitios: redes sociales (Instagram, Facebook, TikTok, YouTube, Twitter/X, VK, Telegram, entre otras) y sitios para adultos.
- Editor de lista manual: anadir y eliminar dominios, uno por linea.
- Boton de desbloqueo que restaura el acceso de forma inmediata cuando el bloqueo esta activo.
- Autoproteccion frente a elusion: tarea programada que reinstaura el bloqueo al iniciar sesion.
- Proteccion por contrasena para impedir cambios en la lista o la desactivacion del bloqueo.
- Autoactualizacion desde las releases de GitHub con reemplazo y reinicio automaticos.
- Interfaz con temas claro y oscuro, animaciones y distribucion como EXE autonomo sin dependencias.
- No dispone de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues propias de un modelo de IA.

## Casos de uso

- Control parental en equipos domesticos: bloquear redes sociales y contenido para adultos en un PC compartido con menores, con contrasena que impide que el menor desactive el bloqueo y tarea programada que lo restaura tras cada inicio de sesion.
- Administracion de estaciones de trabajo en pequenas oficinas: aplicar una politica de distracciones cero en equipos de empleados mediante la lista editable de dominios, sin depender de un proxy o firewall corporativo.
- Equipos de uso publico (bibliotecas, aulas, cibercafes): configurar un bloqueo persistente que sobreviva a reinicios y a intentos de desactivacion por parte de usuarios sin privilegios.
- Entornos educativos con Windows 10/11: desplegar un unico EXE sin instalador ni dependencias en aulas, reduciendo el trabajo de aprovisionamiento frente a soluciones basadas en GPO.
- Pruebas de resistencia de politicas DNS: usar la herramienta como referencia para estudiar como interactuan la NRPT, los antivirus y los cambios en `hosts` en un equipo Windows, dado que el autor documenta explicitamente ese conflicto.
- Catalogacion y curaduria de repositorios HuggingFace: emplear este caso como ejemplo de repositorio no-ML para calibrar heuristicas de deteccion (ausencia de pesos, README en ruso, tags genericos como `region:us`) en pipelines de scraping.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni artefactos evaluables con MMLU, HumanEval, GSM8K ni metricas equivalentes, y la model card no incluye mediciones de latencia, throughput ni tasas de bloqueo efectivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo: Windows 10 o Windows 11, con privilegios de administrador (solicitados automaticamente al ejecutar el EXE).
- Despliegue: ejecutable autonomo `SiteGuard.exe` descargado desde las releases de GitHub; no requiere instalacion ni dependencias adicionales.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles; el impacto en el rendimiento del equipo depende solo de la resolucion DNS y no se ha medido en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. SiteGuard no pertenece a la categoria de modelos de IA y no se han identificado en la informacion proporcionada alternativas comparables de la misma naturaleza (herramientas de control parental basadas en NRPT para Windows) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura, contexto y capacidades de generacion; no debe catalogarse como modelo en pipelines automaticos.
- Licencia no disponible: no se declara termino alguno de uso, por lo que el uso comercial o la redistribucion del EXE quedan sin marco legal explicito.
- Contrasena por defecto conocida (`q1w2e3r4`): si no se cambia en ajustes, cualquier usuario con acceso al equipo puede desactivar el bloqueo.
- Dependencia de la NRPT de Windows: el bloqueo no cubre trafico que eluda la resolucion DNS del sistema (por ejemplo, DNS over HTTPS configurado en el navegador, VPN o resolucion directa por IP), aunque la model card no detalla estas limitaciones.
- Requiere privilegios de administrador, lo que limita su despliegue en entornos con politicas restrictivas de elevacion.
- Autoactualizacion que descarga y ejecuta binarios desde GitHub sin verificacion de firma documentada: riesgo de cadena de suministro si la cuenta del autor se compromete.
- Interfaz y documentacion solo en ruso, lo que reduce su accesibilidad para usuarios hispanohablantes.
- Ambito declarado por el autor: uso en equipos propios o sobre los que se tenga autoridad; el uso en dispositivos de terceros sin consentimiento puede ser ilegal segun la jurisdiccion.
- No se han publicado analisis independientes de seguridad, sesgos ni tasas de falsos positivos/negativos del bloqueo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imomzoda-dev/SiteGuard
- Repositorio en GitHub: https://github.com/imomzoda-dev/SiteGuard
- Ultima release (descarga del EXE): https://github.com/imomzoda-dev/SiteGuard/releases/latest
- Perfil del autor en GitHub: https://github.com/imomzoda-dev
