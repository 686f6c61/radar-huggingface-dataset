# EarendelArc/bip39-mnemonic-seed-balance-scanner-v2

## Resumen

La ficha solicitada corresponde a `EarendelArc/bip39-mnemonic-seed-balance-scanner-v2`, un repositorio alojado en Hugging Face que **no contiene un modelo de IA**. Se trata de un paquete ejecutable para Windows de 64 bits, distribuido como archivo ZIP de 4,8 MB, que se presenta como una herramienta de escaneo de balances asociados a frases mnemónicas BIP39. El autor es el usuario `EarendelArc`, con licencia MIT declarada y soporte de catorce idiomas en sus metadatos.

El contenido del repositorio no incluye pesos, arquitectura, tokenizador ni artefactos propios de un modelo de lenguaje: no hay pipeline declarado, no hay descargas registradas y no hay resultados de evaluación. La model card describe módulos de validación BIP39, derivación multi-cadena (BIP44/BIP84), resolución de mnemónicos parciales y exportación de informes, junto con instrucciones para descargar un ejecutable desde enlaces externos de GitHub y extraerlo con una contraseña.

Es relevante advertir que el patrón descrito —ejecutable alojado fuera de Hugging Face, archivo comprimido protegido con contraseña, instrucciones para ejecutarlo como administrador y funcionalidad centrada en semillas criptográficas— coincide con el modus operandi habitual del malware dirigido a carteras de criptomonedas. Esta ficha documenta el repositorio tal como se presenta, sin validar su funcionamiento ni recomendar su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye como ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (paquete `.zip` con ejecutable `.exe` para Windows) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, proceso de alineación (RLHF, DPO) ni innovaciones técnicas de inferencia. El repositorio no contiene pesos en safetensors, GGUF ni ningún otro formato de modelo. Lo que la model card describe es una aplicación de escritorio: motor multihilo con SIMD, hashing PBKDF2, generación de direcciones BIP44/BIP84 sobre EVM, Solana y Bitcoin, y verificación de checksum BIP39 para frases de 12, 18 y 24 palabras.

El autor declara métricas de consumo de memoria por módulo (menos de 54 MB, 31 MB y 28 MB según la función) y una consistencia del 99,8 % en la exportación de informes, pero no aporta metodología de medición ni artefactos verificables. El binario se distribuye comprimido y protegido con contraseña, lo que impide la inspección estática sin extraerlo.

## Capacidades

- Validación local de frases mnemónicas BIP39 con comprobación de entropía y checksum para 12, 18 y 24 palabras.
- Derivación de direcciones multi-cadena según BIP44 y BIP84 sobre EVM, Solana y Bitcoin.
- Motor multihilo con instrucciones SIMD y hashing PBKDF2 para procesamiento por lotes en CPU.
- Reconstrucción de mnemónicos parciales o dañados (resolución de palabras faltantes).
- Consulta de balances de tokens ERC-20 y SPL, moneda nativa, stablecoins y staking DeFi, según la descripción del autor.
- Exportación estructurada de resultados a informes locales.
- Interfaz y documentación en catorce idiomas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente, al no ser un modelo de lenguaje.

## Casos de uso

- **Auditoría de compatibilidad BIP39 en desarrollo de carteras**: un equipo podría usar la validación de checksum para comprobar que las frases generadas por su propia implementación cumplen el estándar antes de publicar. Requiere verificar previamente el binario en un entorno aislado.
- **Pruebas de derivación de rutas en entornos de test**: la generación de direcciones BIP44/BIP84 sobre varias cadenas permitiría contrastar resultados con librerías de referencia, siempre con semillas de prueba y nunca con fondos reales.
- **Formación y concienciación sobre seguridad**: en un laboratorio controlado, la herramienta podría ilustrar por qué una frase mnemónica equivale a la custodia total de los fondos y por qué no debe introducirse en software de procedencia desconocida.
- **Investigación de malware**: analistas podrían estudiar el patrón de distribución (ZIP con contraseña, ejecutable fuera de la plataforma de origen, ejecución como administrador) como caso representativo de campañas de robo de semillas.
- **Verificación de integridad de artefactos**: el hash de firma declarado (`84374F958B`) podría compararse con el binario descargado para detectar manipulaciones, aunque el propio canal de descarga no es verificable.
- **Documentación de riesgos en políticas internas**: los equipos de seguridad podrían usar este repositorio como ejemplo de artefacto no apto para entornos corporativos, reforzando las reglas de descarga y ejecución de binarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona cifras internas (polling a 380 Hz, consumo inferior a 54 MB de RAM, consistencia del 99,8 %) sin metodología reproducible ni comparación con alternativas.

## Requisitos de hardware

- Plataforma objetivo: Windows 10 u 11 de 64 bits, según la model card.
- VRAM: no aplica; la herramienta declara ejecución en CPU con consumo de memoria del orden de decenas de MB.
- GPU recomendadas: no aplica; no se describe aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: ejecutable `.exe` extraído de un ZIP protegido con contraseña; no hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no disponibles de forma verificable; las cifras del autor no son auditables.

## Comparativa con modelos similares

| Herramienta | Tipo | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| bip39-mnemonic-seed-balance-scanner-v2 | Ejecutable Windows x64 | Validacion y derivacion BIP39 segun el autor | MIT (declarada) | Hugging Face, binario en GitHub externo |
| Librerias BIP39 de referencia (por ejemplo, `python-mnemonic`, `bip32`) | Codigo fuente abierto | Generacion y validacion de mnemonicos y derivacion de claves | MIT / Apache-2.0 | Repositorios publicos auditables |
| Carteras hardware (Ledger, Trezor) | Dispositivo | Custodia de claves y firma aislada | Propietaria / firmware abierto parcial | Comercial |
| Modelos de lenguaje open source | Modelo de IA | Generacion de texto, codigo, razonamiento | Variable | Hugging Face |

La comparación con modelos de IA no procede: este repositorio no es un modelo y no comparte categoría con ninguno.

## Limitaciones y advertencias

- **No es un modelo de IA**: no contiene pesos, arquitectura ni pipeline; cualquier evaluación como modelo de lenguaje carece de sentido.
- **Riesgo de seguridad alto**: la combinación de ejecutable alojado fuera de Hugging Face, ZIP con contraseña, instrucciones para ejecutar como administrador y funcionalidad sobre frases semilla es compatible con campañas de robo de criptomonedas. No se debe ejecutar en equipos con carteras o fondos reales.
- **Canal de descarga no verificado**: los enlaces apuntan a repositorios de GitHub de terceros con nombres no relacionados con el proyecto, lo que dificulta la trazabilidad.
- **Cero señales de adopción**: 0 descargas y 0 likes en Hugging Face, sin historial de mantenimiento ni issues públicas.
- **Métricas no auditables**: las cifras de rendimiento y consistencia no incluyen metodología ni artefactos de reproducción.
- **Licencia**: MIT declarada, sin implicaciones de uso comercial más allá de las habituales, pero la licencia no garantiza la seguridad del binario.
- **Sesgos y alucinación**: no aplica al no ser un modelo generativo; el riesgo relevante es de seguridad, no de calidad de salida.
- **Idiomas**: los catorce idiomas de los metadatos describen la documentación o interfaz, no capacidades lingüísticas de un modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EarendelArc/bip39-mnemonic-seed-balance-scanner-v2
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Repositorio de releases citado (GitHub, terceros): https://github.com/HarukiSiekiera09/bip39-mnemonic-seed-balance-scanner-v2/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
