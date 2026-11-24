# devma1980/trust-wallet-metamask-seed-recovery-unlock

## Resumen

El repositorio `devma1980/trust-wallet-metamask-seed-recovery-unlock` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 (etiquetado como portable) que el autor presenta como una herramienta de "recuperación de seed" de carteras Trust Wallet y MetaMask. La model card describe funcionalidades de derivación multi-cadena (BIP39/BIP44/BIP84), validación local de mnemónicos, lectura de keystores LevelDB y exportación de saldos mediante RPC rotativos.

No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociado. Los tags de Hugging Face (`windows`, `x64`, `portable`) y el contenido del README corresponden a un binario ejecutable empaquetado en un ZIP de 4,8 MB, no a un modelo de lenguaje. Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando de forma explícita que no es un modelo de IA y advirtiendo de los riesgos de seguridad asociados.

La relevancia de esta entrada es fundamentalmente negativa: el artefacto se presenta con vocabulario propio de modelos (idiomas, licencia MIT, tags de Hugging Face) pero su función declarada es el acceso a material criptográfico sensible (frases semilla). Cualquier evaluación técnica debe partir de esa premisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (paquete `.zip` con ejecutable `.exe` para Windows 10/11 64-bit) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es un transformer, MoE, SSM ni modelo híbrido; no dispone de pesos, dataset de entrenamiento, proceso de RLHF/DPO ni innovaciones de inferencia (atención lineal, decodificación especulativa, etc.). La model card describe componentes de software: motor SIMD multi-hilo, validador BIP39 local, parser de LevelDB, rotación de RPC (Alchemy, Helius, QuickNode) y exportación de saldos. Estos son módulos de una aplicación de escritorio, no capas de una red neuronal.

El paquete se distribuye como `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip` (4,8 MB), protegido con contraseña `2026`, y un ejecutable `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` que el README indica ejecutar como administrador. La nomenclatura mezcla términos de DLSS/upscaling con recuperación de seeds, lo que sugiere un empaquetado engañoso o reutilizado.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- El multilingüismo declarado (14 idiomas) corresponde a etiquetas de metadatos, no a capacidades lingüísticas verificadas.
- Según la model card, el binario afirmaría realizar: derivación BIP44/BIP84 multi-cadena (EVM, Solana, BTC), validación offline de mnemónicos de 12/18/24 palabras, parseo de keystores LevelDB de extensiones de navegador, exportación de saldos y rotación de RPC.
- Estas capacidades no están verificadas y su naturaleza (acceso a frases semilla) es intrínsecamente sensible.

## Casos de uso

No se identifican casos de uso legítimos y verificables para un modelo de IA, porque no lo es. Los escenarios que plantea el autor son:

- Recuperación de carteras: el README afirma derivar direcciones desde mnemónicos; sin auditoría, no es un caso de uso recomendable.
- Validación de frases semilla: funcionalidad declarada, pero ejecutarla en un binario de terceros compromete la seguridad de la cartera.
- Lectura de keystores locales: acceso a almacenes LevelDB de extensiones; riesgo alto de exfiltración.
- Exportación de saldos: consulta de balances vía RPC; podría hacerse con herramientas auditadas y de código abierto.
- Rotación de nodos RPC: función de infraestructura, no requiere este binario.
- Automatización multi-cadena: cualquier flujo de este tipo debe construirse sobre librerías auditadas (ethers.js, viem, bitcoinjs-lib, @solana/web3.js).

Advertencia: no se recomienda ejecutar este artefacto en entornos con carteras activas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de rendimiento autoinformadas (menos de 28 MB de RAM en derivación, menos de 51 MB en parseo, menos de 12 ms en rotación RPC, 16 hilos, 98,9 % de consistencia), pero no son verificables ni comparables con métricas de modelos.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11, 64 bits (x64); no se declara soporte para Linux ni macOS.
- VRAM: no aplica (no hay inferencia de red neuronal).
- GPU: no aplica; el README menciona un motor SIMD multi-hilo sobre CPU.
- RAM declarada: menos de 28 MB en derivación y menos de 51 MB en parseo según el autor (no verificado).
- Almacenamiento: paquete de 4,8 MB comprimido.
- Despliegue: ejecutable nativo; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma fiable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de herramientas legítimas para funcionalidad declarada similar (derivación BIP39/BIP44, validación de mnemónicos) podrían citarse librerías auditadas como `bip39`, `ethers`, `viem` o `@scure/bip32`, pero no son equivalentes en formato ni propósito.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como LLM ni integrarse en pipelines de inferencia.
- Riesgo de seguridad crítico: un binario cerrado que afirma manejar frases semilla puede exfiltrar claves; no hay código fuente ni auditoría publicada.
- Ejecución como administrador: el README pide privilegios elevados, lo que amplía el impacto de cualquier comportamiento malicioso.
- Distribución con contraseña (`2026`) y nombre de archivo que imita herramientas de upscaling (DLSS): patrón habitual de evasión de filtros y de ingeniería social.
- Cero descargas y cero likes en Hugging Face; sin historial ni comunidad que valide el artefacto.
- Licencia MIT declarada, pero sin repositorio de código verificable que la respalde.
- Idiomas y pipeline declarados en metadatos no implican capacidades reales.
- Fecha de creación futura (2026-11-24) en los metadatos, incoherente con la fecha actual.
- No usar con carteras con fondos; si se manipula material criptográfico, hacerlo en máquina aislada y con herramientas auditadas.

## Enlaces

- Hugging Face: https://huggingface.co/devma1980/trust-wallet-metamask-seed-recovery-unlock
- Repositorio citado en el README (no verificado): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026
- Releases citadas en el README (no verificadas): https://github.com/Janb2081/trust-wallet-metamask-seed-recovery-unlocked/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
