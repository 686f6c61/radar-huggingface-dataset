# daffy0208/trust-wallet-metamask-seed-recovery-unlock

## Resumen

`daffy0208/trust-wallet-metamask-seed-recovery-unlock` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable para Windows distribuido como archivo ZIP. La model card describe una herramienta que afirma ser capaz de extraer y reconstruir frases semilla (seed phrases) de carteras de criptomonedas Trust Wallet y MetaMask, incluyendo recuperación de palabras mnemónicas parciales, auditoría de tokens ERC20/SPL y derivación de direcciones multi-cadena (EVM, Solana, Bitcoin).

No existe información sobre arquitectura de red neuronal, parámetros, contexto, datos de entrenamiento ni benchmarks. Los campos técnicos del repositorio (tags `windows`, `x64`, `portable`) y el contenido del README apuntan a una aplicación binaria empaquetada, no a pesos de modelo en formato safetensors o GGUF. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde el punto de vista de la evaluación técnica, este artefacto presenta todos los indicadores habituales de una campaña de distribución de software malicioso: binario ejecutable con contraseña de archivo, instrucciones para ejecutar como administrador, petición de desactivar advertencias de Windows Defender/SmartScreen, y temática de robo de credenciales de carteras cripto. No debe tratarse como un modelo open source ni ejecutarse en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (distribución como ZIP con `.exe` para Windows 10/11) |

## Arquitectura y entrenamiento

No disponible. El repositorio no contiene información sobre arquitectura de red neuronal, dataset de entrenamiento, proceso de alineación (RLHF/DPO) ni innovaciones técnicas de modelado. El README describe módulos de software (parser LevelDB, motor SIMD multinúcleo, validador BIP39, derivación BIP44/BIP84) que corresponden a utilidades de criptografía de carteras, no a un sistema de aprendizaje automático.

La afirmación de "345 Hz de polling", "12 hilos de trabajo" y consumos de memoria de "menos de 55 MB" y "menos de 41 MB" son métricas propias de una aplicación nativa, no de un modelo. No hay artefactos de pesos, tokenizador, configuración de transformer ni código de inferencia publicados.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- Según el README (no verificado y altamente sospechoso), afirmaría realizar:
  - Parseo de keystores LevelDB de extensiones de navegador.
  - Reconstrucción de frases mnemónicas parciales o dañadas.
  - Verificación offline de entropía y checksum BIP39 (12/18/24 palabras).
  - Derivación de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin.
  - Auditoría de saldos de tokens ERC20/SPL.
- No dispone de tool calling, soporte de agentes, modo thinking, visión ni audio.
- El multilingüismo declarado se refiere a los idiomas de la interfaz o documentación del ejecutable, no a capacidades lingüísticas de un modelo.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que plantea el autor son incompatibles con un uso ético y legal:

- Recuperación de frases semilla de carteras de terceros: la funcionalidad descrita constituye, en la práctica, una herramienta de acceso no autorizado a credenciales cripto.
- Reconstrucción de mnemónicos parciales: solo tendría encaje legítimo si el usuario es el propietario de la cartera y utiliza software auditado de código abierto, no un binario ofuscado.
- Auditoría de tokens ERC20/SPL: existen alternativas legítimas y auditables (exploradores de bloques, librerías como `ethers.js` o `@solana/web3.js`).
- Derivación de direcciones multi-cadena: cubierta por librerías estándar y auditadas (BIP32/BIP39/BIP44 en `bitcoinjs-lib`, `bip39`, etc.).
- Verificación BIP39 offline: disponible en herramientas de referencia del estándar BIP-0039.
- Cualquier despliegue en producción está contraindicado: no hay pesos, no hay API, no hay código fuente auditable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningún tipo y, al no ser un modelo de IA, los benchmarks estándar (MMLU, HumanEval, GSM8K) no son aplicables.

## Requisitos de hardware

- No aplica en términos de VRAM: no hay modelo que cargar en GPU.
- El README indica un ejecutable para Windows 10/11 de 64 bits, con un ZIP de 8,9 MB.
- No requiere GPU; el autor menciona consumo de RAM inferior a 55 MB y 41 MB en sus módulos, cifra no verificable.
- Opciones de despliegue: no disponible. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible (las cifras de "345 Hz" del README no son verificables ni corresponden a métricas de inferencia).

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. Frente a herramientas legítimas de gestión de carteras (MetaMask, Trust Wallet oficial, hardware wallets Ledger/Trezor), este repositorio no ofrece garantías de seguridad, auditabilidad ni soporte del fabricante, y su modelo de distribución (ZIP con contraseña, ejecución como administrador) es incompatible con las prácticas de seguridad estándar.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo elevado de malware: binario ejecutable distribuido con contraseña de archivo, instrucciones para ejecutar como administrador y avisos explícitos de que Windows Defender/SmartScreen lo marcarán como sospechoso.
- Suplantación de marca: utiliza los nombres "Trust Wallet" y "MetaMask" sin relación aparente con los fabricantes oficiales.
- Riesgo de robo de fondos: la funcionalidad declarada (recuperación de seeds de terceros) es la propia de una herramienta de exfiltración de credenciales.
- Licencia MIT declarada, pero irrelevante: la licencia no legitima el uso malicioso ni sustituye la auditoría de seguridad.
- Sin código fuente, sin trazabilidad, sin issues, sin descargas ni comunidad: señales típicas de repositorio desechable.
- Los enlaces del README apuntan a un repositorio de GitHub (`Janb2081/...`) distinto del autor del repo de Hugging Face (`daffy0208`), lo que sugiere cuentas desechables.
- Recomendación: no descargar, no extraer y no ejecutar el ZIP. Reportar el repositorio a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/daffy0208/trust-wallet-metamask-seed-recovery-unlock
- Repositorio de GitHub referenciado en el README (no recomendado visitar): https://github.com/Janb2081/trust-wallet-metamask-seed-recovery-unlock
- Estándar BIP-0039 (referencia legítima para mnemónicos): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Estándar BIP-0044 (derivación multi-cadena): https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- Documentación oficial de MetaMask: https://docs.metamask.io/
- Documentación oficial de Trust Wallet: https://developer.trustwallet.com/
