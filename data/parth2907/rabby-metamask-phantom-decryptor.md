# parth2907/rabby-metamask-phantom-decryptor

## Resumen

`parth2907/rabby-metamask-phantom-decryptor` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un ejecutable de Windows (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) etiquetado como "decryptor" de carteras de criptomonedas (Rabby, MetaMask, Phantom). La model card no contiene pesos, arquitectura, tokenizador ni ningún artefacto propio de un modelo de lenguaje; únicamente incluye instrucciones de descarga, extracción con contraseña y ejecución como administrador.

El contenido de la model card presenta todos los indicadores de una campaña de distribución de software malicioso: nombres de fichero incoherentes con el propósito declarado (el ZIP y el EXE se llaman `pump-fun-jito-bundler-sniper-bot-2026`, un bot de sniper para Solana), contraseña de descompresión fija (`2026`) para evadir análisis automatizados, petición explícita de ejecución con privilegios de administrador, enlaces de descarga alojados en repositorios de GitHub de terceros ajenos al autor del repositorio de Hugging Face, y funcionalidades descritas como "partial mnemonic solver", "BIP39 validator" y "multi-chain derivation" que, en la práctica, corresponden a utilidades de recuperación o fuerza bruta de frases semilla.

Desde la perspectiva de la evaluación de modelos, este repositorio no es utilizable: no hay pipeline declarado, no hay descargas (0) ni interacciones (0), y la fecha de creación indicada (2026-11-24) es futura respecto a la redacción de esta ficha. Se documenta aquí exclusivamente como advertencia técnica y de seguridad; no debe descargarse ni ejecutarse en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en los metadatos; sin fichero LICENSE verificable en la información disponible) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF/DPO) ni innovación técnica de modelado que documentar. El artefacto distribuido es un binario PE para Windows 10 (22H2) y Windows 11 (24H2), de 4,8 MB comprimido, con build declarada `v3.6.9 (39A6C1325C)`. La model card menciona módulos internos descritos en términos de marketing ("failover RPC rotation", "ERC20/SPL token audit", "partial mnemonic solver") sin especificación técnica verificable, sin código fuente y sin trazabilidad de build reproducible.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- Según la model card, el binario afirmaría realizar derivación multi-cadena (BIP44/BIP84 sobre EVM, Solana y BTC), rotación de RPC, auditoría de saldos ERC20/SPL y validación local de frases BIP39.
- También afirmaría resolver frases mnemónicas parciales o dañadas ("partial mnemonic solver"), funcionalidad que en la práctica se asocia a la reconstrucción no autorizada de carteras ajenas.
- No hay soporte de tool calling, agentes, modo thinking, visión ni audio.
- No hay API, servidor de inferencia ni integración con frameworks de despliegue de modelos.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que la model card sugiere son, en la práctica, riesgos de seguridad:

- Recuperación de frases semilla propias: un usuario podría, en teoría, intentar reconstruir su propia frase BIP39 dañada, pero para ello existen herramientas de código abierto auditables (Ian Coleman BIP39, por ejemplo) que no requieren ejecutar binarios opacos como administrador.
- Auditoría de saldos multi-cadena: realizable con bibliotecas estándar y auditadas (`ethers.js`, `web3.js`, `@solana/web3.js`) sin depender de un ejecutable de procedencia desconocida.
- Derivación de direcciones HD: cubierta por bibliotecas de referencia (`bip32`, `bip39`, `@scure/bip32`) con código verificable.
- Cualquier uso orientado a acceder a carteras de terceros constituiría acceso no autorizado a sistemas y podría ser delito en la mayoría de jurisdicciones (en España, art. 197 y ss. del Código Penal; en la UE, Directiva 2013/40/UE).
- No se recomienda su uso en producción, en entornos corporativos ni en equipos personales bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`97.5%` de consistencia, `96.2%`, `455 Hz` de polling, `< 11 ms` de respuesta, `< 18 MB` de RAM) son afirmaciones de marketing sin metodología, sin conjunto de evaluación y sin posibilidad de verificación; no deben interpretarse como métricas técnicas.

## Requisitos de hardware

- Plataforma objetivo: Windows 10 22H2 o Windows 11 24H2, x64.
- No requiere GPU ni VRAM: es un binario de escritorio, no un modelo de inferencia.
- Tamaño del artefacto: 4,8 MB comprimido.
- Dependencias declaradas: ninguna ("zero external dependencies"), lo cual es en sí mismo una señal de alarma en un binario que afirma hablar con nodos RPC de Alchemy, Helius y QuickNode.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI posibles).
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. Frente a herramientas legítimas de gestión de carteras (MetaMask, Rabby, Phantom oficiales, o utilidades auditables como Ian Coleman BIP39), la diferencia relevante es que aquellas son código abierto o auditado y se distribuyen por canales oficiales firmados, mientras que este repositorio distribuye un binario opaco con contraseña fija y alojamiento en repositorios de GitHub de terceros.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni ninguna métrica de modelado.
- Indicadores claros de software potencialmente malicioso: contraseña de descompresión fija (`2026`) para evadir antivirus y sandboxes, petición de ejecución como administrador, nombre de fichero incoherente con la función declarada, enlaces de descarga en repositorios de GitHub de terceros no vinculados al autor del repo de Hugging Face.
- Funcionalidad declarada de "partial mnemonic solver" y "BIP39 validator" orientada a frases semilla: riesgo directo de robo de fondos si se ejecuta en un equipo con carteras activas.
- Cero descargas y cero likes en el momento de la ficha: sin comunidad, sin revisión por pares, sin trazabilidad.
- Fecha de creación futura (2026-11-24) respecto a la fecha de redacción: metadatos inconsistentes.
- Licencia MIT declarada en el frontmatter, pero sin fichero LICENSE verificable en la información disponible; en cualquier caso, una licencia permisiva no legitima el uso ilícito del software.
- Recomendación: no descargar, no extraer, no ejecutar. Si ya se ha ejecutado, se debe asumir compromiso del sistema, rotar todas las frases semilla y claves privadas desde un dispositivo limpio y realizar un análisis forense.
- Para reportar el repositorio: usar el canal de reporte de abuso de Hugging Face y, si procede, notificar a GitHub el repositorio de releases enlazado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/parth2907/rabby-metamask-phantom-decryptor
- Repositorio de GitHub enlazado en la model card (tercero, no verificado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- Repositorio de GitHub enlazado en la model card (tercero, no verificado): https://github.com/AudreyTrinh18/rabby-metamask-phantom-decryptor
- Canal de reporte de abuso de Hugging Face: https://huggingface.co/contact
- Documentación de referencia sobre seguridad de frases semilla (BIP39): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Herramienta auditable de referencia para BIP39 (alternativa legítima): https://github.com/iancoleman/bip39
