# Redin/bip39-mnemonic-seed-balance-scanner

## Resumen

`Redin/bip39-mnemonic-seed-balance-scanner` no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un repositorio de Hugging Face que distribuye un supuesto ejecutable portable para Windows x64, empaquetado en un archivo ZIP protegido con contrasena, y que se presenta como una herramienta para validar frases mnemonicas BIP39 y consultar saldos de direcciones derivadas en varias cadenas. El autor figura como "Redin", con licencia MIT declarada y cero descargas y cero "likes" en el momento de la consulta. No existe pipeline asociado, no hay pesos, no hay tokenizador y no hay artefactos propios de un modelo.

La model card esta redactada como una landing page de descarga, con insignias de "Rating 99% Verified", "50K+ Downloads" y un boton que apunta a un repositorio de GitHub de terceros (`laurent99718/bip39-mnemonic-seed-balance-scanner`) desde el que se sirve el binario. La discrepancia entre las cifras publicitadas y las metricas reales de Hugging Face (0 descargas, 0 likes) es inmediata, y el patron descrito —ejecutable cerrado, ZIP con contrasena, instruccion de ejecutar como administrador y tematica de frases semilla de carteras de criptomonedas— coincide con el de campanas de distribucion de malware dirigidas a titulares de criptoactivos.

Por tanto, esta ficha no puede documentar arquitectura, parametros, contexto ni capacidades de un modelo. Se limita a registrar lo que el repositorio declara, a senalar los indicadores de riesgo observados y a advertir explicitamente de que no debe descargarse ni ejecutarse el binario referenciado. Cualquier evaluacion tecnica del contenido es imposible porque el contenido no es un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se declara una aplicacion nativa x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun los metadatos del repositorio; no verificable) |
| Licencia | MIT (declarada en los metadatos; el binario distribuido no es inspeccionable) |
| Formato de pesos | no disponible (se distribuye un ZIP de 8,9 MB con un `.exe` para Windows x64, no pesos de modelo) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos, configuracion de transformer, vocabulario, ficheros `safetensors`, GGUF ni ningun otro artefacto de modelo. La model card describe, en su lugar, un supuesto motor SIMD multinucleo con hashing PBKDF2, derivacion de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin, un validador local de entropia y checksum BIP39 de 12, 18 y 24 palabras, y un parser de keystores LevelDB de extensiones de navegador. Son afirmaciones de marketing sin especificacion tecnica, sin codigo fuente publicado y sin trazabilidad de build mas alla de un identificador alfanumerico (`B4A5E5D8A7`).

No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia, porque no existe un proceso de entrenamiento. La unica "innovacion" declarada es el empaquetado: un ZIP de 8,9 MB con contrasena `2026` y un ejecutable que el propio README pide lanzar con privilegios de administrador.

## Capacidades

- Generacion de texto: no disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no verificables; los metadatos listan 14 idiomas, pero no hay interfaz ni modelo que los procese de forma documentada.
- Capacidades declaradas por el autor (no verificadas y no recomendadas): validacion offline de frases BIP39, derivacion de direcciones en multiples cadenas, consulta de saldos de moneda nativa, stablecoins y staking DeFi, y lectura de keystores LevelDB locales.

## Casos de uso

No se identifican casos de uso legitimos recomendables para este artefacto. Los escenarios que el autor sugiere son precisamente los de mayor riesgo:

- Validacion de frases mnemonicas propias: exigiria introducir la semilla en un binario cerrado, lo que equivale a entregar el control de la cartera. Para esta tarea existen herramientas de codigo abierto auditables (por ejemplo, las utilidades de referencia de la BIP39 o librerias como `bip39` de bitcoinjs) que se ejecutan en local y con codigo inspeccionable.
- Derivacion de direcciones BIP44/BIP84: realizable con librerias estandar y auditadas; no requiere un ejecutable propietario.
- Consulta de saldos multi-cadena: los exploradores publicos y las API oficiales de cada red cubren este caso sin exponer material sensible.
- Auditoria de tokens ERC20/SPL: se realiza con llamadas RPC de solo lectura a partir de una direccion publica, nunca a partir de la semilla.
- Recuperacion de carteras: cualquier herramienta que pida la frase semilla completa en un entorno no auditado debe descartarse de entrada.
- Analisis forense de keystores LevelDB: existen utilidades abiertas y documentadas para extraer y descifrar keystores de extensiones; un binario cerrado no es un vehiculo aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`< 12 ms`, `< 35 ms`, `97,9%` de consistencia, `< 62 MB` y `< 19 MB` de RAM) son afirmaciones publicitarias sin metodologia, sin conjunto de prueba y sin codigo reproducible; no constituyen evidencia de rendimiento.

## Requisitos de hardware

- VRAM: no aplica; se declara una aplicacion de CPU para Windows x64.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: ninguna recomendable. El unico canal es la descarga de un ZIP de 8,9 MB desde un repositorio de GitHub de terceros, con contrasena de extraccion y ejecucion como administrador.
- Latencia y throughput: no verificables; las cifras del README carecen de respaldo.

## Comparativa con modelos similares

No hay modelos comparables porque no es un modelo. Frente a herramientas legitimas de gestion de semillas BIP39 (librerias abiertas y auditables, utilidades de referencia del estandar, firmadores hardware), este artefacto se diferencia por tres rasgos: binario cerrado sin codigo fuente, distribucion mediante ZIP con contrasena y ejecucion con privilegios elevados. Ninguno de esos rasgos es una ventaja tecnica; los tres son factores de riesgo.

| Criterio | Este repositorio | Librerias BIP39 abiertas | Firmador hardware |
|---|---|---|---|
| Codigo auditable | No | Si | Si (firmware) |
| Exposicion de la semilla | Total, en el equipo del usuario | Local, en proceso controlado | Nunca sale del dispositivo |
| Distribucion | ZIP con contrasena desde GitHub de terceros | Gestores de paquetes | Fabricante |
| Licencia | MIT declarada | MIT, Apache-2.0, etc. | Propietaria |
| Metricas de adopcion | 0 descargas, 0 likes | Miles de dependencias | Millones de unidades |

## Limitaciones y advertencias

- No es un modelo de IA. No debe incluirse en pipelines de inferencia, evaluaciones de LLM ni comparativas de modelos.
- Indicadores de riesgo de malware: ejecutable binario sin codigo fuente, ZIP protegido con contrasena para evadir analisis automatizado, instruccion de ejecutar como administrador, tematica de frases semilla de criptomonedas y enlace de descarga alojado en un repositorio de GitHub distinto del de Hugging Face.
- Incoherencia entre metricas declaradas y reales: el README afirma 50K+ descargas y un 99% de valoraciones verificadas, mientras que Hugging Face registra 0 descargas y 0 likes.
- Riesgo de robo de fondos: si el binario funciona como se describe, el escenario natural de uso implica introducir una frase semilla en un ejecutable no auditado, lo que permite exfiltrar la cartera completa.
- Riesgo de alucinacion: no aplica a un modelo, pero la model card contiene afirmaciones tecnicas no verificables presentadas como hechos.
- Licencia: la MIT declarada en los metadatos no cubre ni describe el binario distribuido por un tercero; la licencia del ejecutable es desconocida.
- Idiomas: los 14 idiomas listados en los metadatos no tienen respaldo en ninguna interfaz o modelo documentado.
- Recomendacion: no descargar, no extraer y no ejecutar el archivo referenciado. Si se ha ejecutado ya, se debe asumir el compromiso del sistema y trasladar cualquier fondo asociado a una semilla introducida a una cartera nueva generada en un dispositivo limpio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Redin/bip39-mnemonic-seed-balance-scanner
- Repositorio de GitHub referenciado en la model card (no recomendado): https://github.com/laurent99718/bip39-mnemonic-seed-balance-scanner
- Estandar BIP39 (referencia tecnica legitima): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Estandar BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- Estandar BIP84: https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
- Paper, blog o demo del autor: no disponible.
