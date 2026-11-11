# ngtrantrung/muse-guard

## Resumen

El repositorio identificado como `ngtrantrung/muse-guard` no contiene un modelo de inteligencia artificial, sino una aplicación Android de código abierto denominada Muse Guard. Se trata de un cortafuegos local (on-device firewall) que opera mediante un `VpnService` interno para interceptar y filtrar el tráfico de red de otras aplicaciones del dispositivo. Su función principal es bloquear conexiones a dominios de publicidad, rastreadores y posibles malware mediante filtrado DNS local, sin recurrir a servidores externos.

El proyecto está desarrollado por el usuario ngtrantrung y publicado bajo licencia GNU General Public License v3.0. No dispone de pipeline de Hugging Face, no contiene pesos de modelo, no tiene parámetros entrenados ni ventana de contexto, y su tamaño de repositorio es de 0.0 GB según los metadatos de la plataforma. La model card describe exclusivamente el funcionamiento de la aplicación, sus fuentes de listas de bloqueo y el proceso de compilación.

Es relevante aclarar esta naturaleza porque el recurso aparece indexado en Hugging Face bajo una ficha de modelo, pero no satisface ninguno de los criterios técnicos propios de un modelo de lenguaje o multimodal. La ficha que sigue documenta lo que el repositorio contiene realmente, indicando de forma explícita los apartados que no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion Android con VpnService y filtrado DNS) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible como modelo; la documentacion de la app esta en vietnamita e ingles |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (no contiene pesos; el artefacto es un APK compilado con Gradle) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El componente técnico descrito en la model card es una aplicación Android escrita en Kotlin que abre un `VpnService` local: todo el tráfico de las demás aplicaciones pasa por ella. El filtrado DNS se realiza en el propio dispositivo contra una lista de bloqueo empaquetada en la app; los nombres bloqueados reciben una respuesta NXDOMAIN. El reenvío TCP/UDP se efectúa en espacio de usuario, sin servidor externo.

Las listas de bloqueo se generan en tiempo de compilación a partir de AdGuard Filters (`AdguardTeam/AdguardFilters` y `AdguardTeam/AdGuardSDNSFilter`), convirtiendo reglas adblock del tipo `||domain^` en bloqueos y `@@||domain^` en excepciones, y descartando reglas cosméticas, scriptlets y expresiones regulares por no ser aplicables al bloqueo DNS. Se añaden algunos dominios de rastreadores de Yi Camera y Meitu en `app/src/main/assets/custom_blocklist.txt`. No hay RLHF, DPO ni datos de entrenamiento. La app mantiene un registro local de conexiones durante 7 días, sin cuentas, nube, analítica ni descargas en tiempo de ejecución.

## Capacidades

- Filtrado DNS local de dominios publicitarios y de rastreo mediante lista de bloqueo empaquetada.
- Interceptación de tráfico de otras aplicaciones Android a través de `VpnService`.
- Reenvío de tráfico TCP y UDP en espacio de usuario, sin servidores externos.
- Indicador por aplicación con semáforo verde, amarillo o rojo según el tráfico observado.
- Registro local de conexiones con retención de 7 días y sin subida de datos.
- Funcionamiento completamente offline: sin cuentas, sin nube, sin analítica y sin descargas en tiempo de ejecución.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües propias de un modelo.

## Casos de uso

- Bloqueo de publicidad en el dispositivo: la app filtra consultas DNS contra la lista de AdGuard y devuelve NXDOMAIN a los dominios publicitarios, evitando que los anuncios se carguen en cualquier aplicación del teléfono.
- Mitigación de rastreo entre aplicaciones: al pasar todo el tráfico por el `VpnService` local, los dominios de seguimiento de terceros quedan bloqueados de forma transversal, sin depender de la configuración de cada app.
- Auditoría de tráfico por aplicación: el semáforo verde, amarillo y rojo permite identificar qué aplicaciones generan conexiones sospechosas y revisar el registro local de los últimos 7 días.
- Uso en dispositivos sin root: al apoyarse en la API `VpnService` de Android, no requiere privilegios de superusuario ni modificaciones del sistema.
- Entornos con requisitos de privacidad estrictos: al no existir servidor externo, cuentas ni analítica, el tráfico y los registros permanecen en el dispositivo, lo que encaja en escenarios de uso personal con datos sensibles.
- Distribución y modificación comunitaria: al estar bajo GPL-3.0, permite a desarrolladores auditar el código, adaptar las listas de bloqueo y redistribuir versiones modificadas cumpliendo las obligaciones de la licencia.
- Bloqueo complementario de dominios específicos: el archivo `custom_blocklist.txt` permite añadir dominios de rastreadores no cubiertos por AdGuard, como los de Yi Camera y Meitu citados en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen métricas de MMLU, HumanEval, GSM8K ni equivalentes. La model card tampoco aporta datos de latencia, throughput, consumo de batería ni impacto en el rendimiento del dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no aplica; no hay modelo que cargar en GPU).
- GPU recomendadas: no disponible (no aplica).
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma de ejecución: dispositivo Android con soporte para `VpnService`; la compilación requiere Gradle 8.13, Temurin JDK 17 y Android SDK con build-tools 34.0.0.
- Opciones de despliegue: instalación del APK compilado con `./build_v100.sh` o `gradle :app:assembleRelease --offline -x lintVitalRelease`; el keystore de firma no se incluye en el repositorio y cada compilador debe generar el suyo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la información, y la categoría del recurso (aplicación Android de filtrado DNS) no es equiparable a la de un modelo de lenguaje o multimodal.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni admite prompts. Cualquier expectativa de uso como LLM es incorrecta.
- La lista de bloqueo solo se actualiza con una nueva versión de la aplicación; no hay actualizaciones en tiempo de ejecución.
- El filtrado se limita a DNS: reglas cosméticas, scriptlets y expresiones regulares de AdGuard se descartan por no ser aplicables, de modo que no se cubre el bloqueo a nivel de contenido.
- La aplicación abre una VPN local, lo que puede entrar en conflicto con otras VPN activas en el dispositivo y afectar a la conectividad si se configura mal.
- El registro de conexiones se conserva 7 días en el dispositivo; en equipos compartidos puede exponer información de uso.
- La licencia GPL-3.0 obliga a quien redistribuya la app, incluida la versión modificada, a proporcionar el código fuente correspondiente.
- El autor declara que la app se construyó para uso personal y no asume responsabilidad sobre usos, modificaciones o redistribuciones por parte de terceros; tampoco está pensada para uso comercial.
- No se dispone de información sobre sesgos, alucinaciones ni limitaciones idiomáticas porque no aplican a este tipo de software.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ngtrantrung/muse-guard
- AdGuard Filters: https://github.com/AdguardTeam/AdguardFilters
- AdGuard DNS filter: https://github.com/AdguardTeam/AdGuardSDNSFilter
