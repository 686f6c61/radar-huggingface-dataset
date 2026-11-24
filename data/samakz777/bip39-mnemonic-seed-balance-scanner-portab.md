# samakz777/bip39-mnemonic-seed-balance-scanner-portab

## Resumen

La ficha solicitada corresponde al identificador `samakz777/bip39-mnemonic-seed-balance-scanner-portab` alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un modelo de lenguaje: es un paquete ejecutable para Windows x64 (build `A94C5E`, version `v4.0.5`) distribuido como archivo ZIP de 4,8 MB y presentado como una herramienta de escaneo de balances de seeds BIP39. No existe pipeline declarado, ni pesos, ni arquitectura de red neuronal, ni datos de entrenamiento.

El contenido del repositorio es una model card con estructura de pagina de descarga que mezcla nombres de binarios ajenos al supuesto producto (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) con enlaces a repositorios de GitHub de terceros y una contrasena de descompresion. Esta discrepancia entre el nombre del proyecto, el binario distribuido y los enlaces de descarga es una senal de alarma clasica de campana de distribucion de software potencialmente malicioso.

Desde la perspectiva de un blog tecnico sobre IA open source, este repositorio no es evaluable como modelo: no hay parametros, contexto, cuantizacion ni licencia de pesos que analizar. La ficha se completara con los campos obligatorios marcando explicitamente los datos no disponibles y con advertencias de seguridad sobre el contenido observado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en ZIP con binario `.exe`) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos de red neuronal, tokenizador, configuracion de transformer ni artefactos de entrenamiento. El contenido descrito en la model card corresponde a una aplicacion de escritorio para Windows 10 (22H2) y Windows 11 (24H2) que, segun el autor, realizaria validacion local de frases BIP39, derivacion de direcciones BIP44/BIP84 en EVM, Solana y Bitcoin, rotacion de endpoints RPC y exportacion de informes de balance.

No hay informacion sobre datos de entrenamiento, proceso de alineacion (RLHF, DPO) ni innovaciones tecnicas de inferencia. Los unicos datos tecnicos declarados son cotas de rendimiento del ejecutable (menos de 32 ms en validacion local, menos de 44 MB de RAM, menos de 33 ms en rotacion de RPC), sin metodologia de medida ni evidencia reproducible.

## Capacidades

- No es un modelo generativo: no produce texto, codigo ni razonamiento.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Segun la model card, el binario afirmaria realizar validacion offline de frases mnemonicas de 12, 18 y 24 palabras con verificacion de checksum.
- Segun la model card, derivaria direcciones en multiples cadenas (EVM, Solana, Bitcoin) mediante rutas BIP44/BIP84.
- Segun la model card, incluiria un parser de keystores LevelDB de extensiones de navegador.
- Capacidades multilingues: los metadatos listan 14 idiomas, sin evidencia de interfaz o documentacion en esos idiomas.

## Casos de uso

- No se identifican casos de uso legitimos verificables para un blog de IA open source, dado que no es un modelo.
- Auditoria de carteras propias: en teoria, una herramienta de este tipo permitiria comprobar saldos de direcciones derivadas de una seed propia; sin embargo, no hay evidencia de que el binario distribuido haga eso y no otra cosa.
- Verificacion de checksum BIP39 en entornos offline: funcionalidad plausible, pero no verificada y no auditable al distribuirse como binario cerrado.
- Gestion de multiples cuentas en EVM, Solana y Bitcoin: requeriria confiar en un ejecutable sin codigo fuente publicado.
- Integracion en flujos de recuperacion de cartera: desaconsejado, ya que introducir una seed en software no auditado expone la totalidad de los fondos.
- Formacion o documentacion sobre BIP39: no recomendable como referencia, al no existir repositorio de codigo ni especificacion tecnica publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (96,1 % de consistencia, 97,4 % de consistencia, latencias inferiores a 32 ms y 33 ms, uso de RAM inferior a 44 MB) carecen de definicion de metrica, conjunto de prueba y metodologia, por lo que no son interpretables como benchmarks.

## Requisitos de hardware

- Sistema operativo: Windows 10 22H2 o Windows 11 24H2, arquitectura x64.
- RAM: el autor declara un uso inferior a 44 MB, sin verificacion independiente.
- GPU: no aplica; no se declara aceleracion por GPU ni requisitos de VRAM.
- Almacenamiento: paquete ZIP de 4,8 MB; espacio en disco tras extraccion no disponible.
- Despliegue: ejecutable nativo de Windows; no soporta vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no disponibles con rigor; las cifras del autor no son reproducibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoria, las alternativas reales serian librerias auditables de codigo abierto para manejo de BIP39 y derivacion de claves, no binarios cerrados distribuidos via Hugging Face.

| Criterio | Este repositorio | Libreria BIP39 de codigo abierto (referencia generica) |
|---|---|---|
| Naturaleza | Binario `.exe` en ZIP | Codigo fuente auditable |
| Parametros | no disponible | no aplica |
| Contexto | no disponible | no aplica |
| Rendimiento | cifras no verificables | medible y reproducible |
| Licencia | MIT (declarada) | habitualmente MIT/Apache-2.0 |
| Disponibilidad | ZIP con contrasena | repositorio publico |

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y datos de entrenamiento; no debe catalogarse como modelo en un indice de IA.
- Inconsistencia grave de identidad: el proyecto se llama "bip39-mnemonic-seed-balance-scanner-portable" pero el binario distribuido se llama `fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, nombre asociado a macros de un juego, no a una herramienta criptografica.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`YokoCastro3813`, `matia294`) distintos del autor del repositorio de Hugging Face.
- Distribucion como binario cerrado con contrasena de archivo (`2026`) y solicitud de ejecucion como administrador: patron habitual de malware o stealer de seeds.
- Riesgo critico para el usuario: una herramienta que solicita frases mnemonicas BIP39 puede exfiltrar seeds y provocar la perdida total de fondos.
- Cero descargas y cero likes en el momento de la consulta; sin comunidad, sin issues y sin historial de mantenimiento.
- Sin sesgos de modelo que reportar, pero con riesgo de fraude y de ingenieria social documentado.
- Licencia MIT declarada, pero sin codigo fuente publicado no es posible verificar el cumplimiento ni auditar el binario.
- No utilizar en produccion ni en entornos con claves reales bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samakz777/bip39-mnemonic-seed-balance-scanner-portab
- Enlace de descarga citado en la model card (tercero, no verificado): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (tercero, no verificado): https://github.com/matia294/bip39-mnemonic-seed-balance-scanner-portable/releases/latest
- Paper, blog o demo oficial: no disponible
