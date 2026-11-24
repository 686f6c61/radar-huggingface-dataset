# Redin/bip39-mnemonic-seed-balance-scanner-v2

## Resumen

`Redin/bip39-mnemonic-seed-balance-scanner-v2` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una aplicación ejecutable para Windows de 64 bits, distribuida como archivo ZIP con contraseña, que se presenta como un escáner de balances de frases mnemónicas BIP39. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de aprendizaje automático.

La model card describe módulos de validación BIP39 local, derivación multichain (BIP44/BIP84 sobre EVM, Solana y Bitcoin), un motor SIMD multinúcleo con hashing PBKDF2 y un "solucionador de mnemónicas parciales" para reconstruir palabras perdidas. Toda esta descripción corresponde a una utilidad de escritorio, no a un modelo entrenado, y no incluye información sobre datos de entrenamiento, parámetros o benchmarks.

Es relevante advertir que el patrón de distribución (binario cerrado para Windows, archivo comprimido protegido con contraseña, instrucciones para ejecutar como administrador, enlaces de descarga alojados en un repositorio de GitHub de terceros y ausencia total de código fuente verificable) coincide con el de campañas de malware distribuidas a través de repositorios de Hugging Face. No debe tratarse como un modelo evaluable ni ejecutarse en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicación de escritorio para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; corresponden a la interfaz de la aplicación, no a capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio aloja un binario compilado para Windows de 64 bits (`bip39-mnemonic-seed-balance-scanner-v2-v1.2.0-win64.exe`, build declarada `v4.8.6` / `84374F958B`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card menciona componentes de ingeniería de sistemas: validación de checksum BIP39 para entropías de 12, 18 y 24 palabras, derivación de direcciones BIP44/BIP84, hashing PBKDF2 paralelizado con SIMD y exportación de informes locales.

No se publica código fuente, ni cadena de compilación reproducible, ni firma verificable del binario, ni análisis de dependencias. La descripción técnica de la model card no es verificable y no constituye evidencia de funcionamiento legítimo. No hay información sobre datos de entrenamiento, RLHF, DPO ni ninguna innovación en el ámbito de modelos generativos.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de comprensión o generación; los idiomas listados en los metadatos corresponden, según la model card, a la localización de la interfaz de escritorio.
- La model card atribuye al ejecutable funciones de validación de mnemónicas BIP39, derivación de direcciones en EVM/Solana/Bitcoin y exportación de informes; estas afirmaciones no son verificables y no deben tomarse como descripción fiable del comportamiento real del binario.

## Casos de uso

- No se identifica ningún caso de uso legítimo como modelo de IA, porque no lo es.
- Auditoría de seguridad defensiva: el repositorio puede utilizarse como muestra para analizar patrones de distribución maliciosa en plataformas de modelos (ZIP con contraseña, ejecutable como administrador, enlaces a repositorios de GitHub de terceros) en un entorno aislado y sin ejecución del binario.
- Formación en concienciación sobre riesgos de supply chain: sirve como ejemplo documentado de por qué no deben ejecutarse binarios opacos descargados de repositorios de modelos.
- Investigación de fraude en el ecosistema cripto: el tema declarado (escaneo de balances de seeds) es característico de esquemas de ingeniería social; el repositorio puede citarse como evidencia en análisis de este tipo de campañas.
- No procede recomendar su uso para gestión de carteras, custodia de claves, recuperación de mnemónicas ni ninguna operación con criptoactivos: introducir una frase semilla en una herramienta de este tipo equivale a entregar el control de los fondos a un tercero no verificado.
- No procede su uso en producción, en pipelines de CI/CD ni en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (por ejemplo, 380 Hz de polling, 99,8 % de consistencia o consumos de memoria de 28-54 MB) son afirmaciones del autor sin metodología, sin conjunto de evaluación y sin verificación independiente; no constituyen benchmarks de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que inferir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada por el autor: Windows 10/11 de 64 bits, ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles ni verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Como referencia de categoría, podría contrastarse con utilidades legítimas y de código abierto para manejo de BIP39 (por ejemplo, bibliotecas como `python-mnemonic` o `bip39` en JavaScript), que se distribuyen como código fuente auditable, no como binarios cerrados con contraseña.

| Criterio | Este repositorio | Bibliotecas BIP39 de código abierto |
|---|---|---|
| Naturaleza | Binario Windows cerrado en ZIP con contraseña | Código fuente auditable |
| Pesos de modelo | No aplica | No aplica |
| Verificabilidad | Nula (sin fuente ni firma) | Total (revisión de código) |
| Licencia | MIT declarada | MIT / Apache-2.0 habituales |
| Riesgo de seguridad | Alto por patrón de distribución | Bajo si se audita la versión |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje carece de sentido.
- Patrón de distribución de alto riesgo: ejecutable para Windows, comprimido con contraseña, instrucciones de ejecución como administrador y descarga alojada en un repositorio de GitHub de terceros ajeno al autor declarado en Hugging Face.
- Tema sensible: las herramientas que solicitan frases semilla BIP39 son un vector clásico de robo de criptoactivos; una frase semilla legítima nunca debe introducirse en software no auditado.
- Sin código fuente, sin firma de binario y sin análisis de malware público: no es posible verificar qué hace el ejecutable.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el contenido del binario ni sobre su legalidad en la jurisdicción del usuario.
- Riesgo de suplantación: el identificador del repositorio (`Redin/...`) no coincide con la organización de GitHub referenciada en la model card (`HarukiSiekiera09/...`), lo que sugiere una cadena de distribución no trazable.
- No debe descargarse, extraerse ni ejecutarse en ningún sistema, ni siquiera en un equipo personal, sin análisis previo en una máquina virtual aislada y sin conexión a red.
- Los datos de descargas y likes que muestra la model card (419K+, build v4.8.6) no son verificables y no deben interpretarse como señal de confianza.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Redin/bip39-mnemonic-seed-balance-scanner-v2
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/HarukiSiekiera09/bip39-mnemonic-seed-balance-scanner-v2
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/HarukiSiekiera09/bip39-mnemonic-seed-balance-scanner-v2/releases/latest/download/bip39-mnemonic-seed-balance-scanner-v2-v1.2.0-win64.zip
- Documentación de Hugging Face sobre seguridad en repositorios y modelos: https://huggingface.co/docs/hub/security
- Especificación BIP39 (referencia técnica del estándar citado): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Especificaciones BIP44 y BIP84: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki y https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
