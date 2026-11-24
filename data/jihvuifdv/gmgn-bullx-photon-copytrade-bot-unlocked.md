# jihvuifdv/gmgn-bullx-photon-copytrade-bot-unlocked

## Resumen

La ficha que sigue documenta el artefacto publicado en Hugging Face con el identificador `jihvuifdv/gmgn-bullx-photon-copytrade-bot-unlocked`. Conviene aclarar de entrada que **no se trata de un modelo de inteligencia artificial**: no hay pesos neuronales, no hay arquitectura de red, no hay tokenizador ni pipeline de inferencia. Es un paquete ejecutable para Windows x64 (un archivo `.exe` dentro de un `.zip` de 4,8 MB) que el autor presenta como un bot de copytrading para los entornos Gmgn, Bullx y Photon, con módulos de filtrado de honeypots, bundling multi-cartera, motor de bundles Jito/MEV y gestión de take profit por niveles.

El repositorio tiene cero descargas y cero likes en el momento de la consulta, fue creado el 24 de noviembre de 2026 y su model card está redactada en un formato atípico para Hugging Face: badges de escudo, botones de descarga que apuntan a repositorios de GitHub de terceros (`JoaoSchaefer973`, `VoMerkel8955`), una contraseña de descompresión (`2026`) y una sección de preguntas frecuentes orientada a desactivar avisos de Windows Defender y SmartScreen. Estos patrones —binario opaco, contraseña en el archivo, instrucciones para ejecutar como administrador y para excluir el directorio del antivirus— son característicos de campañas de distribución de software malicioso y no de proyectos de IA open source.

Por todo ello, esta ficha se limita a inventariar lo que el autor declara y a señalar los riesgos. No se han podido verificar las capacidades que anuncia la model card, no existen benchmarks y no hay información sobre pesos, contexto o licencia aplicable al software más allá de la etiqueta MIT declarada en los metadatos. Para un lector que busque un modelo de lenguaje, este repositorio no es el recurso adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como idiomas de la model card, no del binario) |
| Licencia | MIT (declarada en metadatos; no se adjunta texto de licencia en el repositorio) |
| Formato de pesos | no disponible; el artefacto es `rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip` (4,8 MB) con un `.exe` en su interior |
| Plataforma | Windows 10 / 11 de 64 bits |
| Version declarada | v4.7.1 (build 420AA2) |
| Contrasena del archivo | `2026` |
| Dependencias externas | el autor declara "cero dependencias externas" |
| Consumo de RAM declarado | < 37 MB (filtro honeypot), < 34 MB (copytrade), < 22 ms de respuesta (bundler) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento que documentar. La model card describe un conjunto de módulos funcionales empaquetados en un ejecutable: un filtro pre-compra de honeypots que verifica autoridades de mint/freeze y bloqueo de liquidez; un "bundler" de 20 carteras mediante Lookup Tables con ejecución en el mismo bloque; un motor de copytrading que replica carteras de ballenas con dimensionamiento proporcional; un sandbox de paper trading; un motor de bundles Jito/MEV con ajuste dinámico de propinas; y un sistema de take profit multinivel con trailing stop. Todos estos componentes pertenecen al dominio de las finanzas descentralizadas sobre Solana, no al aprendizaje automático.

El autor no publica código fuente, ni hashes de verificación, ni firma digital del binario, ni registro de cambios. Tampoco indica qué bibliotecas o runtimes incorpora el ejecutable, pese a afirmar que no tiene dependencias externas. Las cifras de consistencia que aparecen en la tabla de módulos (99,1 % y 99,6 %) no van acompañadas de metodología, conjunto de prueba ni condiciones de medida, por lo que no son verificables. No hay información sobre datos de entrenamiento porque no hay modelo.

## Capacidades

- Ejecución de un binario portable para Windows x64, según el autor sin instalación ni dependencias.
- Filtrado pre-compra de tokens con verificación de autoridades de mint y freeze y de bloqueo de liquidez, según la model card.
- Bundling de hasta 20 carteras en el mismo bloque mediante Lookup Tables, con latencia declarada inferior a 22 ms.
- Copytrading de carteras de ballenas con dimensionamiento proporcional, según el autor.
- Sandbox de paper trading contra libros de órdenes en vivo.
- Motor de bundles Jito/MEV con tip dinámico.
- Gestión de take profit por niveles y migración a trailing stop.
- Interfaz multiidioma declarada en los metadatos (14 idiomas), sin evidencia de implementación.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento, porque no es un modelo generativo.

## Casos de uso

- **Auditoría de seguridad de artefactos subidos a Hugging Face:** inspeccionar el binario en una máquina virtual aislada y sin red, calcular su hash y compararlo con el de otras muestras de la misma campaña para alimentar reglas de detección en el EDR corporativo.
- **Formación en concienciación sobre ingeniería social:** usar la model card como ejemplo real de técnicas de persuasión (badges de descargas infladas, botones de descarga que apuntan a repositorios de terceros, contraseña en el archivo para evadir análisis estático) en sesiones de seguridad para desarrolladores.
- **Investigación de fraude en criptoactivos:** documentar el modus operandi de los bots de copytrading promocionados en repositorios públicos, incluyendo la promesa de acceso "unlocked" a herramientas de pago, para estudios académicos sobre estafas en el ecosistema Solana.
- **Análisis de cadenas de suministro de software:** rastrear la relación entre los repositorios de GitHub enlazados (`JoaoSchaefer973/rob-run-cheat-mod-menu-2026` y `VoMerkel8955/gmgn-bullx-photon-copytrade-bot-unlocked`) y las cuentas de Hugging Face que redistribuyen el mismo paquete, con el objetivo de mapear la infraestructura de distribución.
- **Pruebas de filtrado de plataformas:** evaluar la eficacia de los sistemas de moderación de Hugging Face frente a repositorios que suplantan la categoría de modelo con binarios ejecutables y metadatos de licencia MIT.
- **Respuesta a incidentes:** si un usuario corporativo ha ejecutado el binario, emplear los indicadores de la model card (nombre del ZIP, contraseña `2026`, nombre del `.exe`, build 420AA2) para localizar la infección en los equipos y aislar los hosts afectados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas que aparecen en la model card son cifras de consistencia (99,1 % y 99,6 %) y latencias (< 22 ms) sin metodología, conjunto de prueba ni condiciones de medida, por lo que no constituyen benchmarks verificables.

## Requisitos de hardware

- No aplica VRAM: el artefacto no ejecuta inferencia neuronal.
- Plataforma objetivo declarada: Windows 10 u 11 de 64 bits.
- Consumo de RAM declarado por el autor: menos de 37 MB para el filtro de honeypots y menos de 34 MB para el módulo de copytrading.
- No requiere GPU dedicada según la información disponible.
- No se declaran opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo servible.
- No se publican cifras de throughput ni de latencia de extremo a extremo más allá de los 22 ms del bundler.
- Recomendación operativa: cualquier análisis del binario debe hacerse en una máquina virtual desechable, sin credenciales de cartera, sin acceso a red y con instantánea previa.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. A título de contexto, se compara con otros tipos de artefacto que aparecen en Hugging Face:

| Artefacto | Categoria | Parametros | Contexto | Licencia | Riesgo |
|---|---|---|---|---|---|
| `jihvuifdv/gmgn-bullx-photon-copytrade-bot-unlocked` | Binario Windows x64 | no aplica | no aplica | MIT declarada | Alto: ejecutable opaco, contraseña en archivo, instrucciones para desactivar antivirus |
| Modelo de lenguaje open source tipico (p. ej. familia Llama, Qwen, Mistral) | Modelo transformer | 7B-70B | 8K-128K | permisiva o comunitaria | Bajo o medio: pesos auditables, benchmarks públicos |
| Dataset publico en Hugging Face | Datos | no aplica | no aplica | variable | Bajo: contenido inspeccionable |

## Limitaciones y advertencias

- **No es un modelo de IA.** No contiene pesos, tokenizador ni pipeline; cualquier expectativa de inferencia de lenguaje, código o visión es infundada.
- **Riesgo de malware.** El patrón (ZIP con contraseña, ejecutable sin firma, instrucciones para ejecutar como administrador y excluir el directorio de Windows Defender y SmartScreen) coincide con tácticas habituales de distribución de troyanos y stealer de credenciales de cartera.
- **Origen no verificado.** Los enlaces de descarga apuntan a repositorios de GitHub de terceros no relacionados con el autor del repositorio de Hugging Face, lo que impide atribuir el binario a un desarrollador identificable.
- **Métricas no verificables.** Las cifras de consistencia y latencia de la model card carecen de metodología y no pueden reproducirse.
- **Licencia dudosa.** La etiqueta MIT aparece en los metadatos, pero no se incluye el texto de la licencia ni el código fuente al que aplicaría; una licencia de software no puede otorgar derechos sobre un binario sin código.
- **Riesgo financiero directo.** Un bot de copytrading con acceso a claves privadas o APIs de exchange puede vaciar carteras; no hay auditoría de seguridad publicada.
- **Riesgo legal.** El uso de bots de copytrading y de motores MEV puede infringir los términos de servicio de plataformas y, en algunas jurisdicciones, la normativa sobre mercados de criptoactivos (MiCA en la UE).
- **Sesgos y alucinación.** No aplica en el sentido habitual; sí aplica la ausencia total de transparencia sobre el comportamiento real del binario.
- **Sin soporte ni mantenimiento.** Cero descargas, cero likes, sin issues ni historial de versiones más allá de la v4.7.1 declarada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jihvuifdv/gmgn-bullx-photon-copytrade-bot-unlocked
- Repositorio de GitHub enlazado en la model card (descarga del ZIP): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Repositorio de GitHub enlazado en la model card (releases): https://github.com/VoMerkel8955/gmgn-bullx-photon-copytrade-bot-unlocked/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
