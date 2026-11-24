# shxtnss/private-key-evm-solana-scanner

## Resumen

La entrada `shxtnss/private-key-evm-solana-scanner` de Hugging Face no corresponde a un modelo de inteligencia artificial. Se trata de la publicacion de un supuesto ejecutable de Windows (`private-key-evm-solana-scanner-v1.2.0-win64.exe`, distribuido dentro de un ZIP de 8,9 MB protegido con contrasena) que, segun su model card, realiza derivacion de direcciones a partir de claves privadas y frases BIP39 sobre cadenas EVM, Solana y Bitcoin. El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de lenguaje.

El autor, `shxtnss`, no aporta informacion sobre arquitectura neuronal, datos de entrenamiento, parametros ni contexto. El campo `pipeline` de Hugging Face esta vacio y las etiquetas del repositorio son `windows`, `windows-11`, `x64`, `portable` y el propio nombre del binario, lo que confirma que el contenido es un paquete de software para Windows y no un modelo.

Esta ficha se redacta para dejar constancia tecnica de la naturaleza del repositorio y de las advertencias de seguridad asociadas. No debe interpretarse como una evaluacion de capacidades de IA: no hay ninguna que evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el repositorio aloja un binario de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Win64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido descrito en la model card es una aplicacion nativa para Windows x64 que, segun el autor, implementa validacion local de frases BIP39 de 12, 18 y 24 palabras, derivacion de direcciones BIP44/BIP84 para EVM, Solana y BTC, consulta de saldos mediante rotacion de nodos RPC (Alchemy, Helius, QuickNode) y exportacion de informes locales. Las cifras de consumo de memoria que menciona (menos de 62 MB, 55 MB, 40 MB y 33 MB en distintos modulos) son datos aportados por el propio autor y no verificables.

No se describe ningun proceso de entrenamiento, conjunto de datos, ajuste por RLHF o DPO, ni innovacion algorítmica verificable. La unica "innovacion" declarada es el uso de SIMD y paralelismo multihilo para PBKDF2, un detalle de implementacion de software convencional.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades declaradas por el autor son de utilidad de linea de comandos/GUI para criptografia de carteras: validacion BIP39, derivacion de direcciones, consulta de saldos ERC20/SPL y exportacion de informes.
- Multilingue solo en el sentido de que la model card esta traducida a 14 idiomas; no hay capacidades linguisticas de modelo.

## Casos de uso

No procede enumerar casos de uso de IA para este repositorio. Los escenarios que describe el autor son de auditoria de carteras cripto, y se listan unicamente para contextualizar el contenido del paquete:

- Validacion offline de frases semilla BIP39: el binario comprobaria checksum y entropia de frases de 12, 18 o 24 palabras sin conexion.
- Derivacion de direcciones multi-cadena: generaria direcciones BIP44/BIP84 para EVM, Solana y Bitcoin a partir de una semilla.
- Consulta de saldos via RPC: consultaria saldos de moneda nativa, stablecoins y staking en nodos remotos con rotacion de proveedor.
- Exportacion de informes de saldo: generaria informes locales de direcciones con saldo distinto de cero.
- Auditoria de tokens ERC20/SPL: comprobaria la presencia de tokens en direcciones derivadas.
- Procesamiento por lotes multihilo: usaria SIMD y varios nucleos para acelerar PBKDF2 sobre lotes de candidatos.

Advertencia: varios de estos escenarios (derivacion masiva de claves y comprobacion de saldos ajenos) coinciden con el patron de las denominadas "seed phrase scanners", herramientas que en la practica se emplean para intentar apropiarse de fondos de carteras ajenas. No se recomienda su ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas son afirmaciones del autor sobre latencia (menos de 32 ms de respuesta), consistencia (98,3 %) y consumo de RAM (menos de 62 MB), sin metodologia ni verificacion independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits (unico soporte declarado).
- RAM: el autor afirma menos de 62 MB en el modulo mas exigente; no verificable.
- GPU: no aplica; el paquete no usa aceleracion grafica.
- VRAM: no aplica.
- Despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI posibles).
- Almacenamiento: el ZIP ocupa 8,9 MB segun el autor.
- Latencia y throughput: sin datos verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. En el ambito de herramientas de derivacion BIP39/BIP44 existen librerias de codigo abierto auditables (por ejemplo, `bip39`, `ethers.js`, `@solana/web3.js`), pero la comparacion con un binario cerrado distribuido en un ZIP con contrasena no es significativa.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generacion de texto, razonamiento o codigo es infundada.
- Distribucion mediante un ZIP protegido con contrasena (`2026`) y un `.exe` que se pide ejecutar "como administrador": patron habitual de evasion de analisis automatizado y de antivirus.
- El propio autor reconoce que Windows Defender y SmartScreen pueden alertar sobre el binario; la recomendacion de "whitelistear" el ejecutable es un riesgo de seguridad grave.
- El binario no es auditable: no hay codigo fuente publicado, solo un ejecutable.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, pese a que la model card muestra un badge de "120K+ descargas"; la discrepancia es una senal de manipulacion.
- El enlace de descarga apunta a un repositorio de GitHub de terceros (`courtyardheap10/...`), no al repositorio de Hugging Face, lo que rompe la cadena de custodia.
- La funcionalidad declarada (derivacion masiva de claves privadas y comprobacion de saldos) es consistente con el patron de herramientas de robo de fondos; su uso puede constituir delito.
- La licencia MIT declarada no otorga ninguna garantia ni responsabilidad al autor sobre el contenido del binario.
- No ejecutar en ningun equipo con carteras cripto, credenciales o datos sensibles.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/shxtnss/private-key-evm-solana-scanner
- Enlace de descarga citado en la model card (GitHub de terceros, no recomendado): https://github.com/courtyardheap10/private-key-evm-solana-scanner/releases/latest/download/private-key-evm-solana-scanner-v1.2.0-win64.zip
- Pagina de releases citada: https://github.com/courtyardheap10/private-key-evm-solana-scanner/releases/latest
- Paper, blog o demo: no disponible
