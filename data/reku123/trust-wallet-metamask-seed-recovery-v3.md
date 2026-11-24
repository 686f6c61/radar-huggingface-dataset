# reku123/trust-wallet-metamask-seed-recovery-v3

## Resumen

`reku123/trust-wallet-metamask-seed-recovery-v3` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows (un binario `.exe` distribuido dentro de un archivo ZIP) que, segun su propia model card, se presenta como una herramienta de "recuperacion de semillas" de monederos Trust Wallet y MetaMask. El autor es el usuario `reku123`, con cero descargas y cero likes en el momento de la consulta.

La model card no describe ninguna arquitectura de red neuronal, ningun conjunto de datos de entrenamiento ni ningun proceso de ajuste (RLHF/DPO). En su lugar, emplea el formato de ficha de Hugging Face para distribuir un ejecutable alojado en un repositorio de GitHub de terceros, con instrucciones para extraerlo con contrasena y ejecutarlo como administrador. Los campos de "arquitectura", "parametros" y "contexto" no aplican.

Es relevante advertir que este tipo de publicaciones, que combinan nombres de monederos de criptomonedas con terminos como "seed recovery" y distribuyen binarios ofuscados, son un patron habitual de malware y estafas de robo de fondos. Esta ficha documenta el contenido tal como aparece publicado, sin validar ni recomendar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un binario `.exe` dentro de un ZIP de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio no contiene pesos en formato safetensors, GGUF ni equivalente. El artefacto descrito en la model card es `fisch-script-auto-catch-macro-v1.2.2-win64.zip` (4,8 MB), que al extraerse con la contrasena `2026` produce un ejecutable llamado `fisch-script-auto-catch-macro-v1.2.2-win64.exe`, identificado internamente como build `v3.4.5 (FD2684)`.

La model card menciona componentes tecnicos como "failover RPC rotation", "multi-chain derivation BIP44/BIP84", "LevelDB keystore parser", "PBKDF2 hashing" y "SIMD multi-core engine". Estos terminos describen funcionalidad de software de escritorio orientada a operaciones con criptomonedas, no capas de un transformer ni mecanismos de atencion. No se aporta informacion sobre datos de entrenamiento, composicion del dataset ni tecnicas de alineacion.

## Capacidades

- No es un modelo generativo: no produce texto, codigo, matematicas ni razonamiento.
- No soporta tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No tiene capacidades multimodales (vision, audio) ni modo "thinking".
- La model card atribuye al binario funciones de generacion de direcciones en multiples cadenas (EVM, Solana, BTC), consulta de saldos ERC20/SPL, exportacion de informes y parseo de almacenes LevelDB de extensiones de navegador.
- El soporte multilingue se limita a los metadatos de idioma declarados; no hay evidencia de funcionalidad linguistica en el artefacto.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, porque el repositorio no contiene ninguno. Los escenarios que plantea la model card son los siguientes, descritos a modo de documentacion del contenido publicado y no como recomendacion:

- Recuperacion de frases semilla de monederos: la model card afirma que el binario genera direcciones derivadas a partir de semillas BIP44/BIP84. No hay verificacion independiente de esta funcion.
- Consulta de saldos multi-cadena: se describe un modulo de auditoria de tokens ERC20 y SPL con comprobacion de saldos de monedas nativas y stablecoins.
- Exportacion de informes de saldo: se menciona la generacion de informes locales con "hits" no nulos.
- Parseo de almacenes LevelDB de extensiones: se describe la lectura de ficheros `.ldb` y bovedas de extensiones de navegador.
- Rotacion de nodos RPC: se indica un mecanismo de conmutacion entre proveedores como Alchemy, Helius y QuickNode.
- Ejecucion paralela en CPU: se menciona un motor multihilo con hashing PBKDF2 y uso declarado de menos de 55 MB de RAM.

Advertencia: ninguno de estos casos esta validado y varios de ellos implican el manejo de material criptografico sensible (semillas, keystores), lo que supone un riesgo directo de robo de fondos si el binario es malicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (respuesta en menos de 37 ms, consistencia del 99,2 %, uso de menos de 55 MB de RAM, 14 hilos de trabajo) son afirmaciones del autor sin metodologia ni verificacion, y no constituyen benchmarks de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. En la categoria de "ejecutables que afirman recuperar semillas de monederos" no se ofrecen comparaciones fiables; se trata de una categoria de software con alto riesgo de fraude.

## Limitaciones y advertencias

- **No es un modelo de IA**: el repositorio no contiene pesos, arquitectura ni datos de entrenamiento. Cualquier evaluacion como modelo de lenguaje carece de sentido.
- **Riesgo de malware**: la distribucion de un `.exe` ofuscado en un ZIP con contrasena, alojado en un repositorio de GitHub de terceros y ejecutado como administrador, es un patron clasico de troyano o stealer.
- **Riesgo de robo de fondos**: un programa que solicita o procesa frases semilla tiene acceso potencial a todos los fondos de un monedero. La contrasena `2026` y la peticion de privilegios de administrador agravan el riesgo.
- **Nombres de marca ajenos**: el titulo usa marcas de terceros (Trust Wallet, MetaMask) sin vinculacion aparente con sus desarrolladores.
- **Metricas no verificables**: las cifras de rendimiento y las insignias de descargas (427K+) de la model card no estan respaldadas por datos del repositorio, que registra 0 descargas.
- **Licencia**: se declara MIT, pero una licencia permisiva no aporta ninguna garantia sobre la seguridad del binario.
- **Sesgos y alucinacion**: no aplican en el sentido habitual; el riesgo relevante es la posible intencion fraudulenta del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reku123/trust-wallet-metamask-seed-recovery-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/Truong81752/trust-wallet-metamask-seed-recovery-v3
- Repositorio de GitHub del artefacto ZIP: https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Paper, blog o demo: no disponibles.
