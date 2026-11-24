# JvstSophie/bip39-mnemonic-seed-balance-scanner

## Resumen

`JvstSophie/bip39-mnemonic-seed-balance-scanner` no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un repositorio de Hugging Face que distribuye un ejecutable para Windows etiquetado como "escáner de balances de frases semilla BIP39". El artefacto publicado (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`, dentro de un ZIP de 4,8 MB protegido con contraseña) no contiene pesos neuronales ni una arquitectura de red; se presenta como una utilidad nativa x64 escrita presumiblemente en C/C++ con aceleración SIMD y soporte de PBKDF2 para derivación de claves.

La model card describe funcionalidades de validación de entropía BIP39, derivación de direcciones BIP44/BIP84 en EVM, Solana y Bitcoin, auditoría de tokens ERC20/SPL y parseo de keystores LevelDB de extensiones de navegador. Es decir, la pieza técnica declarada es un motor de derivación criptográfica y consulta de balances, no un sistema de generación de texto. El repositorio no incluye pipeline, no declara pesos y no expone métricas de rendimiento verificables.

El interés para desarrolladores e investigadores es, por tanto, nulo como modelo de IA, y muy alto como caso de estudio de riesgo en la cadena de suministro de software: el patrón de distribución (binario opaco, contraseña fija en el propio README, enlaces a repositorios de terceros con nombres no relacionados, insignias de "descargas" y "rating" no verificables) coincide con campañas habituales de malware dirigidas a carteras de criptomonedas. Cualquier evaluación técnica debe partir de esa premisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; se declara utilidad nativa x64 con motor SIMD multi-hilo) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin evidencia de interfaz multilingüe) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible; el artefacto es un binario `.exe` dentro de un `.zip` |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable Windows x64 (`v1.5.6`, build `B4A5E5D8A7`) que, según la model card, implementa: derivación de claves BIP39 mediante PBKDF2 con batching multihilo, generación de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin, verificación local de checksum de frases de 12/18/24 palabras, consulta de balances de moneda nativa, stablecoins y staking DeFi, y lectura de ficheros `.ldb` de LevelDB usados por extensiones de navegador.

Las cifras que aporta la model card (respuesta en menos de 12 ms, menos de 35 ms para validación, consumo de menos de 62 MB y menos de 19 MB de RAM en módulos concretos) no vienen acompañadas de metodología, hardware de referencia ni código fuente, por lo que no son verificables. No se documenta compilación reproducible, firma de código, hash del binario ni auditoría de terceros. El ZIP se distribuye con contraseña fija (`2026`) incrustada en el propio README, práctica que dificulta el análisis estático por parte de antivirus y sistemas de inspección automatizada.

## Capacidades

- Derivación de claves a partir de frases mnemónicas BIP39 (12/18/24 palabras) y validación de checksum, según la documentación del autor.
- Generación de direcciones en múltiples cadenas: EVM (BIP44), Bitcoin (BIP44/BIP84) y Solana.
- Consulta y exportación estructurada de balances de moneda nativa, tokens ERC20/SPL y posiciones de staking.
- Parseo de keystores locales en formato LevelDB (`.ldb`), orientado a perfiles de extensiones de navegador.
- Interfaz declarada en 14 idiomas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Auditoría de carteras propias: un usuario podría, en teoría, verificar la validez de sus propias frases semilla y comprobar balances derivados. No obstante, existen herramientas de referencia auditables (libbitcoin, bitcoinlib, ethers.js, `bip_utils`) que cubren el mismo caso sin ejecutar binarios opacos.
- Análisis forense de incidentes: un equipo de seguridad podría inspeccionar el binario en una máquina virtual aislada y sin red para documentar su comportamiento real (persistencia, tráfico saliente, acceso a rutas de cartera) como parte de la respuesta a un compromiso.
- Formación en seguridad de cadena de suministro: el repositorio sirve como ejemplo didáctico de ingeniería social (insignias falsas, contraseña en el README, enlaces a repositorios de terceros) para concienciar a equipos de desarrollo.
- Investigación de malware: analistas pueden usar el artefacto como muestra para entrenar o validar clasificadores y reglas YARA, siempre en entorno aislado.
- Verificación de derivación BIP39/BIP44 en pipelines de pruebas: únicamente si se reimplementa la lógica a partir de las BIP públicas y se compara contra vectores de prueba oficiales, sin ejecutar el binario distribuido.
- Detección de campañas en plataformas de modelos: los equipos de trust & safety pueden usar el patrón de metadatos (tags de Windows, cero descargas, README con enlaces externos) como señal para clasificadores de abuso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de latencia y memoria que aparecen en la model card (menos de 12 ms, menos de 35 ms, menos de 62 MB, menos de 19 MB) carecen de metodología, hardware de referencia y código reproducible, por lo que no deben tratarse como mediciones válidas.

## Requisitos de hardware

- Plataforma declarada: Windows 10 y Windows 11 de 64 bits. No hay soporte documentado para Linux, macOS ni ARM.
- VRAM: no aplica (no hay inferencia neuronal).
- GPU: no aplica; el autor declara uso de CPU con SIMD y batching multihilo.
- RAM: el autor declara menos de 62 MB y menos de 19 MB en módulos concretos, sin metodología verificable.
- Almacenamiento: el ZIP ocupa 4,8 MB según la model card.
- Opciones de despliegue: ejecución nativa en Windows. No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

No procede una comparativa con modelos de lenguaje. A título de referencia funcional, las alternativas auditables para la misma tarea declarada son:

| Herramienta | Tipo | Licencia | Auditabilidad | Contexto de uso |
|---|---|---|---|---|
| Este repositorio | Binario Windows cerrado | MIT declarada | Baja (sin código, ZIP con contraseña) | No recomendado |
| `bip_utils` (Python) | Biblioteca | MIT | Alta (código abierto, tests) | Derivación BIP39/BIP44/BIP84 |
| `bitcoinlib` (Python) | Biblioteca | BSD-2 | Alta | Carteras y derivación multi-cadena |
| `ethers.js` / `viem` (JS) | Biblioteca | MIT | Alta | EVM, derivación y consulta de balances |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no admite prompts. Cualquier expectativa propia de un LLM es infundada.
- Riesgo grave de seguridad: el binario se distribuye comprimido con contraseña fija publicada en el README, técnica que reduce la detección por antivirus y dificulta el análisis. No hay hash, firma ni compilación reproducible.
- Los enlaces de descarga apuntan a repositorios de terceros (`JoaoSchaefer973/rob-run-cheat-mod-menu-2026`) cuyo nombre no guarda relación con la herramienta declarada, un indicio clásico de redirección maliciosa.
- Las insignias de "99% verificado", "50K+ descargas" y "rating" no son verificables; el repositorio registra 0 descargas y 0 likes en Hugging Face en el momento de la consulta.
- La funcionalidad declarada (escaneo de balances de frases semilla ajenas) es indistinguible de un intento de robo de fondos. Ejecutarlo implica entregar frases semilla, keystores y credenciales a código no auditado.
- Licencia MIT declarada, pero sin fichero LICENSE ni código fuente en el repositorio; la cobertura legal del binario es dudosa.
- Idiomas declarados en metadatos sin evidencia de localización real de la interfaz.
- No apto para producción en ningún escenario. Si se necesita manipular frases semilla, usar bibliotecas auditadas y, preferiblemente, hardware aislado y offline.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JvstSophie/bip39-mnemonic-seed-balance-scanner
- Repositorio de terceros referenciado en la model card: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026
- Releases del repositorio de terceros: https://github.com/laurent99718/bip39-mnemonic-seed-balance-scanner/releases/latest
- Especificación BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Especificación BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- Especificación BIP84: https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
- Alternativa auditable `bip_utils`: https://github.com/ebellocchia/bip_utils
- Alternativa auditable `bitcoinlib`: https://github.com/1200wd/bitcoinlib
