# lsandrade/trust-wallet-metamask-seed-recovery-portab

## Resumen

El repositorio `lsandrade/trust-wallet-metamask-seed-recovery-portab` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows (x64) distribuido como archivo comprimido de 4,8 MB que, segun su propia model card, se presenta como una herramienta de "recuperacion de seed" de carteras Trust Wallet y MetaMask, con utilidades declaradas de auditoria de tokens ERC20/SPL, parseo de keystores LevelDB, validacion BIP39 y resolucion parcial de mnemonicos.

El contenido de la model card es altamente sospechoso y presenta multiples indicios de software malicioso: el archivo descargable se denomina `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip` (un supuesto cheat para un videojuego), se distribuye con contrasena en un archivo ZIP, se aloja en un repositorio de GitHub de terceros ajeno al autor declarado, e incluye instrucciones para ejecutarlo como administrador y desactivar avisos de Windows Defender o SmartScreen. La combinacion de tematica de recuperacion de frases semilla (secrets criptograficos de alto valor) con tecnicas de evasion de seguridad es un patron clasico de malware tipo stealer.

Desde la perspectiva de un editor tecnico de IA open source, este repositorio no debe tratarse como un modelo evaluable: no hay pesos, no hay arquitectura, no hay pipeline declarado, no hay benchmarks y no hay codigo de inferencia. La ficha que sigue documenta la ausencia de especificaciones tecnicas reales y advierte explicitamente sobre los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos del repositorio, no como capacidades del modelo) |
| Licencia | MIT (declarada en metadatos; sin fichero LICENSE verificable en la informacion disponible) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario PE para Windows de 64 bits empaquetado en un ZIP de 4,8 MB, con nombre interno `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe` y build declarada `v2.7.8 (394343)`. La model card describe modulos funcionales (motor SIMD multi-hilo con 8 workers, validador BIP39 offline, parser LevelDB, solver de mnemonicos parciales) pero no aporta documentacion tecnica, codigo fuente, hashes verificables ni firmas del binario.

No hay informacion sobre dataset, tokens de entrenamiento, RLHF, DPO ni innovaciones tecnicas de inferencia. La unica "innovacion" declarada es la capacidad de reconstruir frases semilla parciales y auditar balances de carteras, lo que en la practica corresponde a funcionalidad de extraccion de credenciales criptograficas, no a un modelo generativo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades multilingues declaradas son solo etiquetas de metadatos del repositorio, no capacidades funcionales.
- Funcionalidad declarada por el autor (no verificada): auditoria de tokens ERC20/SPL, parseo de keystores LevelDB de extensiones de navegador, validacion BIP39 de 12/18/24 palabras, resolucion de mnemonicos parciales, exportacion de balances a informes locales.
- Estas funciones, en el contexto de una cartera de criptomonedas, equivalen a extraccion de secretos y no constituyen una capacidad legitima de un modelo open source.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, porque no es un modelo de IA. Los escenarios que la model card sugiere son, en la practica, riesgos de seguridad:

- Recuperacion de carteras: el autor afirma que permite reconstruir frases semilla danadas o parciales; en manos de un tercero esto facilita el robo de fondos, no la recuperacion legitima por parte del titular.
- Auditoria de balances: la funcionalidad de "exportacion de balances" permite inventariar carteras ajenas, lo que es un paso previo a la exfiltracion.
- Parseo de keystores de extensiones: el acceso a LevelDB de navegadores es un vector tipico de stealer de credenciales.
- Validacion BIP39 offline: podria usarse para verificar frases semilla, pero en este paquete va acompanada de evasion de antivirus, lo que invalida el uso defensivo.
- Distribucion como "cheat" de videojuego: el nombre del ejecutable sugiere que el paquete se camufla como otro tipo de software para atraer victimas.
- Integracion en pipelines de desarrollo: no aplica, no hay API, SDK ni pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el artefacto no es un modelo. Los unicos "rendimientos" declarados son latencias de modulos del ejecutable (menos de 13 ms en el solver de mnemonicos, menos de 26 ms en la exportacion de balances, sondeo a 216 Hz, 8 hilos SIMD), datos no verificables y sin relevancia para evaluacion de IA.

## Requisitos de hardware

- VRAM estimada: no aplica, no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con consumer GPU: no aplica.
- Sistema operativo objetivo: Windows 10 y Windows 11 de 64 bits, segun la model card.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable; el artefacto se ejecuta como binario nativo.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable: el repositorio no contiene un modelo de IA, sino un ejecutable de dudosa procedencia. Cualquier comparacion con LLM open source (Llama, Mistral, Qwen, etc.) seria categoricamente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no tiene pesos, arquitectura, contexto ni capacidades generativas; evaluarlo como modelo es un error de categoria.
- Indicios claros de software malicioso: nombre de ejecutable ajeno al proposito declarado (`marvel-rivals-cheat-esp-aimbot`), ZIP con contrasena, alojamiento en repositorio de GitHub de un tercero distinto del autor, instrucciones para ejecutar como administrador y para desactivar Windows Defender y SmartScreen.
- Riesgo de robo de fondos: la funcionalidad declarada (recuperacion de seed, parseo de keystores, resolucion de mnemonicos) es exactamente la que necesita un stealer de criptomonedas para vaciar carteras.
- Licencia MIT declarada solo en metadatos; sin fichero LICENSE verificable, lo que no otorga garantia juridica alguna.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere un repositorio recien creado o de baja reputacion.
- No usar en produccion bajo ninguna circunstancia; no ejecutar el binario en equipos con carteras, claves o credenciales.
- Si se ha descargado o ejecutado el paquete, se recomienda rotar todas las frases semilla y claves privadas accesibles desde el equipo afectado y analizar el sistema con herramientas forenses.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lsandrade/trust-wallet-metamask-seed-recovery-portab
- Repositorio GitHub referenciado en la model card (tercero, no verificado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026
- Repositorio GitHub referenciado en la model card (tercero, no verificado): https://github.com/berkm24/trust-wallet-metamask-seed-recovery-portable
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Paper, blog, demo o repositorio de codigo del modelo: no disponible.
