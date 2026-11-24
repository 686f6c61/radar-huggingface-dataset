# JvstSophie/bip39-mnemonic-seed-balance-scanner-portab

## Resumen

El repositorio `JvstSophie/bip39-mnemonic-seed-balance-scanner-portab` no contiene un modelo de inteligencia artificial. Se trata de un espacio de Hugging Face que aloja una supuesta aplicacion portable para Windows orientada a la verificacion de frases mnemonicas BIP39 y a la consulta de saldos en multiples cadenas de bloques. El autor, `JvstSophie`, lo publica bajo licencia MIT y declara compatibilidad con Windows 10 (22H2) y Windows 11 (24H2) en arquitectura x64.

El contenido de la model card es altamente sospechoso desde el punto de vista de la seguridad. El paquete anunciado se distribuye a traves de un repositorio de GitHub de terceros (`YokoCastro3813/fisch-script-auto-catch-macro-2026`), con un nombre de binario que no guarda relacion con la funcionalidad descrita (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`), protegido con contrasena `2026` y solicitando ejecucion como administrador. Esta combinacion de elementos (redireccion a terceros, nombre incoherente, archivo comprimido con contrasena para evadir analisis antivirus, elevacion de privilegios) es un patron clasico de malware distribuido mediante ingenieria social.

Desde la perspectiva de evaluacion de modelos, este repositorio no es relevante: no hay pesos, no hay arquitectura, no hay pipeline declarado y las etiquetas describen un ejecutable de Windows, no un modelo. Se documenta aqui unicamente para advertir de su naturaleza y de los riesgos asociados a su descarga o ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicacion Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como idiomas de la ficha, no del supuesto modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el paquete anunciado es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio describe funcionalidades de una supuesta herramienta de escritorio: validacion local de frases BIP39 de 12, 18 y 24 palabras, derivacion de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin, rotacion de endpoints RPC (Alchemy, Helius, QuickNode), exportacion de informes de saldo y parseo de almacenes LevelDB de extensiones de navegador. Estas descripciones aparecen con metricas no verificables (por ejemplo, "96,1 % de consistencia", "< 32 ms de respuesta", "< 44 MB de RAM"), sin metodologia ni evidencia reproducible.

El binario se distribuye comprimido con contrasena y alojado en un repositorio de GitHub ajeno al autor del espacio de Hugging Face. No hay firma de codigo, hash publico, analisis de dependencias ni codigo fuente asociado. Cualquier afirmacion sobre su funcionamiento interno debe considerarse no verificada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo ni soporta tool calling.
- La ficha declara, sin evidencia, funciones de validacion de checksum BIP39 y derivacion de direcciones en multiples cadenas.
- Declara soporte de 14 idiomas en la metadata del repositorio, sin que exista componente linguistico identificable.
- No dispone de modo thinking, vision, audio ni capacidades de agente.
- No hay API, SDK ni integracion documentada con frameworks de inferencia.

## Casos de uso

- No se identifican casos de uso legitimos para un modelo de IA, porque no lo es.
- Auditoria de seguridad: el repositorio puede utilizarse como caso de estudio de tecnicas de distribucion de malware en plataformas de modelos (redireccion a GitHub de terceros, ZIP con contrasena, peticion de privilegios de administrador).
- Formacion en concienciacion: sirve como ejemplo practico de indicadores de compromiso para equipos de seguridad que revisan artefactos descargados de Hugging Face.
- Analisis forense: si se dispone del binario en un entorno aislado, puede estudiarse su comportamiento para extraer indicadores (dominios contactados, persistencia, exfiltracion) sin ejecutarlo en produccion.
- Monitorizacion de supply chain: util para calibrar reglas de deteccion en repositorios que mezclan etiquetas de modelo con ejecutables de Windows.
- Documentacion de riesgos: referencia para politicas internas que prohiban la ejecucion de binarios descargados desde hubs de modelos sin verificacion de firma y hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (96,1 % de consistencia, 97,4 % de consistencia, latencias de 32-33 ms) carecen de definicion de metrica, conjunto de evaluacion y metodologia, por lo que no son comparables ni verificables.

## Requisitos de hardware

- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, x64.
- RAM declarada: menos de 44 MB en el texto de la ficha, cifra no verificada.
- Tamano del paquete anunciado: 4,8 MB (ZIP).
- No aplica VRAM, GPU ni aceleracion por hardware para inferencia de modelos.
- Opciones de despliegue: no disponibles; el unico artefacto referenciado es un ejecutable de Windows.
- Latencia y throughput: no disponibles de forma fiable.

## Comparativa con modelos similares

No procede. Este repositorio no es comparable con modelos de lenguaje, vision o audio. Como referencia de categoria, se situa en el ambito de utilidades de escritorio para criptomonedas, donde existen alternativas de codigo abierto y auditables (por ejemplo, librerias BIP39 en Python, Rust o JavaScript publicadas en PyPI, crates.io y npm) que permiten validar mnemonicos y derivar direcciones sin ejecutar binarios opacos.

| Criterio | Este repositorio | Librerias BIP39 auditables (referencia generica) |
|---|---|---|
| Naturaleza | Ejecutable Windows sin codigo fuente | Bibliotecas con codigo fuente publico |
| Verificabilidad | Baja (ZIP con contrasena, repo de terceros) | Alta (revision de codigo, tests, firmas) |
| Licencia | MIT declarada | Variables (MIT, Apache-2.0, etc.) |
| Riesgo de seguridad | Alto segun los indicadores descritos | Bajo si se instalan desde registros oficiales |

## Limitaciones y advertencias

- No es un modelo de IA: la ficha no debe tratarse como evaluacion de un modelo.
- Indicadores claros de riesgo: binario alojado en un repositorio de GitHub de terceros no vinculado al autor, nombre de archivo incoherente con la funcionalidad, ZIP protegido con contrasena `2026` y solicitud de ejecucion como administrador.
- La proteccion con contrasena del archivo comprimido es una tecnica habitual para reducir la deteccion por parte de motores antivirus.
- Una herramienta que procesa frases mnemonicas BIP39 tiene acceso potencial a claves privadas; ejecutarla en un equipo con fondos es un riesgo critico de perdida de activos.
- No hay hash publico, firma de codigo ni analisis de malware disponibles en la informacion proporcionada.
- Las metricas de rendimiento y consistencia de la model card no son verificables.
- La licencia MIT declarada no implica que el binario distribuido sea seguro ni que su codigo fuente sea auditable.
- Recomendacion: no descargar ni ejecutar el artefacto; si se necesita funcionalidad equivalente, usar bibliotecas BIP39 de fuentes oficiales y auditadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JvstSophie/bip39-mnemonic-seed-balance-scanner-portab
- Repositorio de GitHub referenciado en la model card (terceros): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026
- Enlace de descarga directa citado en la model card: https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Releases alternativas citadas: https://github.com/matia294/bip39-mnemonic-seed-balance-scanner-portable/releases/latest
