# cobilat368A/ledger-trezor-bip39-derivation-tool

## Resumen

El repositorio `cobilat368A/ledger-trezor-bip39-derivation-tool` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como archivo ZIP para Windows x64 que, segun su propia model card, se presenta como una herramienta de derivacion de claves BIP39/BIP44/BIP84 y de analisis de keystores, pero cuyo binario se distribuye con un nombre ajeno al proposito declarado (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`), protegido con contrasena y alojado en un repositorio de GitHub de terceros distinto al del autor.

No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia. Los tags de Hugging Face (`windows`, `x64`, `portable`) describen un ejecutable de escritorio, no un modelo. La ficha se redacta, por tanto, como evaluacion tecnica del artefacto publicado, y las secciones habituales de especificaciones de modelo se completan con "no disponible" o con la naturaleza real del contenido.

La relevancia de documentar este tipo de publicaciones es alta para la comunidad: un artefacto que afirma operar sobre frases semilla y keystores de monederos hardware, que se distribuye como binario opaco con instrucciones de ejecucion como administrador y que desactiva la trazabilidad (enlace de descarga externo, contrasena en el README), presenta los indicadores clasicos de una campana de malware. Cualquier evaluacion debe partir de esa premisa y no de la funcionalidad que el texto promete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos; corresponde a la documentacion, no a capacidades del binario) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. No hay transformer, MoE, SSM ni ningun otro tipo de red. El contenido publicado es un archivo comprimido `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip` de 4,8 MB que, al extraerse con la contrasena `2026`, produce un ejecutable `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe` etiquetado como build `v3.4.9 (22369E)`. La model card describe modulos internos ("Partial Mnemonic Solver", "LevelDB Keystore Parser", "Multi-Chain Derivation", "Local BIP39 Validator", "SIMD Multi-Core Engine", "ERC20 / SPL Token Audit") con cifras de rendimiento no verificables (`419 Hz` de polling, `< 17 ms`, `< 13 ms`, `14` hilos de trabajo).

No se documenta proceso de entrenamiento, dataset, RLHF ni innovacion algoritmica alguna. Las cifras de rendimiento citadas en la model card no van acompanadas de metodologia, entorno de medida ni artefacto reproducible, por lo que no pueden considerarse datos tecnicos validos.

## Capacidades

- No se ha demostrado ninguna capacidad funcional del binario. Las capacidades listadas a continuacion son las que el autor *afirma* en la model card, sin evidencia verificable.
- Reconstruccion parcial de frases mnemonicas BIP39 (palabras faltantes o danadas), segun el autor.
- Parseo de keystores LevelDB locales y "descifrado de vault" de extensiones de navegador, segun el autor.
- Derivacion multi-cadena BIP44/BIP84 para EVM, Solana y Bitcoin, segun el autor.
- Validacion offline de entropia y checksum BIP39 para 12/18/24 palabras, segun el autor.
- Auditoria de saldos de tokens ERC20 y SPL, segun el autor.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, porque no es un modelo de lenguaje.

## Casos de uso

- Ninguno recomendado. El artefacto no debe ejecutarse en entornos personales ni corporativos.
- Analisis forense defensivo: un investigador de seguridad puede estudiar el binario en una maquina virtual aislada y sin red para caracterizar su comportamiento real, comparandolo con la funcionalidad declarada.
- Documentacion de campanas de ingenieria social: el patron (nombre de herramienta cripto + binario con nombre de cheat de videojuego + contrasena en el README + descarga desde repositorio ajeno) sirve como caso de estudio en formacion de concienciacion.
- Alimentacion de reglas de deteccion: los hashes y cadenas del ejecutable pueden incorporarse a listas de IoC de un SOC tras el analisis correspondiente.
- Auditoria de cadena de suministro en Hugging Face: el caso ilustra la necesidad de revisar repositorios con cero descargas y model cards generadas que suplantan categorias de modelo.
- Verificacion de politicas de plataforma: util para equipos que definen criterios de moderacion de artefactos binarios en hubs de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras presentes en la model card (`419 Hz`, `< 17 ms`, `< 13 ms`, 14 hilos, 4,8 MB, 547K descargas) son afirmaciones del autor sin metodologia, sin entorno de prueba y sin correspondencia con ningun benchmark estandar de modelos de lenguaje. No se reproducen como resultados.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11, x64 (Intel o AMD), segun el autor.
- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU: no aplica.
- Cabe en cualquier PC consumer con Windows x64; ese es precisamente el vector de riesgo.
- Despliegue: no procede. No hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no disponibles; las cifras declaradas no son verificables.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje open source tipico (p. ej. familia Llama, Qwen, Mistral) | Herramienta CLI auditada de derivacion BIP39 (p. ej. Ian Coleman BIP39, bip_utils) |
|---|---|---|---|
| Naturaleza | Binario Windows cerrado en ZIP | Pesos + codigo de inferencia | Codigo fuente auditable |
| Pesos publicados | No | Si (safetensors/GGUF) | No aplica |
| Reproducibilidad | Nula (binario opaco, contrasena) | Alta | Alta (fuente disponible) |
| Licencia | MIT declarada | Licencias open source variadas | MIT / Apache-2.0 habituales |
| Trazabilidad del origen | Baja (descarga desde repositorio de terceros) | Media-alta | Alta |
| Uso recomendado | Ninguno | Evaluacion e integracion | Derivacion local verificable |

No se identifican modelos comparables en la misma categoria porque el artefacto no pertenece a ninguna categoria de modelo.

## Limitaciones y advertencias

- Suplantacion de categoria: el repositorio se publica en un hub de modelos con tags propios de un modelo, pero contiene un ejecutable. Cualquier pipeline que lo trate como modelo fallara.
- Incoherencia de identidad: el autor declarado (`cobilat368A`), el autor citado en la model card (`amiramartin541`) y el repositorio de descarga (`Roussel10024/inzoi-cheat-trainer-mod-menu`) son tres identidades distintas. Es un indicador fuerte de cadena de suministro comprometida.
- Discrepancia de nombre: una herramienta de derivacion BIP39 se distribuye como `inzoi-cheat-trainer-mod-menu`, nombre asociado a un cheat de videojuego. No hay justificacion tecnica para esa discrepancia.
- Riesgo de robo de fondos: la funcionalidad declarada (reconstruccion de mnemonicos, parseo de keystores, derivacion de direcciones) es exactamente la necesaria para extraer claves de monederos. Un binario cerrado con esa supuesta capacidad constituye un riesgo directo de exfiltracion de semillas.
- Instrucciones de elevacion de privilegios: la model card pide ejecutar como administrador, lo que amplia el impacto de cualquier payload.
- Contrasena fija en la documentacion (`2026`): reduce la deteccion por analisis estatico de antivirus y evita el escaneo automatico del contenido del ZIP.
- Cero descargas y cero likes en Hugging Face frente a las "547K descargas" que afirma la model card: las metricas declaradas no coinciden con las de la plataforma.
- Ausencia total de benchmarks, hashes, firma de codigo o codigo fuente: no es posible verificar ninguna afirmacion.
- Licencia MIT declarada sin titular identificable ni fichero LICENSE verificable en el contenido proporcionado; sin valor practico para uso comercial.
- Recomendacion operativa: no descargar, no extraer, no ejecutar. Si ya se ha ejecutado, tratar la maquina como comprometida, rotar todas las semillas y claves expuestas a ese equipo y revisar movimientos en las carteras afectadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cobilat368A/ledger-trezor-bip39-derivation-tool
- Repositorio de descarga citado en la model card (no recomendado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Releases citadas en la model card (no recomendado): https://github.com/amiramartin541/ledger-trezor-bip39-derivation-tool/releases/latest
- Referencia del estandar BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Referencia del estandar BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- Referencia del estandar BIP84: https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
- Alternativa auditable para derivacion BIP39 en local: https://github.com/iancoleman/bip39
- Alternativa auditable en Python: https://github.com/ranaroussi/bip_utils
