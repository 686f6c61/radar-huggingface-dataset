# Madi2004/metamask-rabby-phantom-vault-decryptor

## Resumen

El repositorio `Madi2004/metamask-rabby-phantom-vault-decryptor` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete binario para Windows x64 etiquetado como "portable" que, segun su propia model card, se presenta como una herramienta de recuperacion de billeteras de criptomonedas (MetaMask, Rabby y Phantom) mediante tecnicas de fuerza bruta sobre frases mnemonicas parciales, parseo de keystores LevelDB y consulta de saldos a traves de RPC.

El artefacto no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y el contenido del README describen un ejecutable `.exe` distribuido dentro de un ZIP de 8,9 MB protegido con contrasena, no un transformer ni un modelo generativo.

Desde la perspectiva de la evaluacion de modelos open source, este repositorio carece de cualquier elemento tecnico verificable como modelo de IA: no hay parametros, contexto, licencia de pesos ni benchmarks. Ademas, su proposito declarado (recuperacion o descifrado de vaults de billeteras de terceros) es indicativo de software potencialmente malicioso o de riesgo elevado, por lo que se documenta aqui unicamente con fines de analisis y advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos; aplicable al repositorio, no verificable sobre el binario) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El contenido descrito en la model card corresponde a una aplicacion nativa para Windows 10 (22H2) y Windows 11 (24H2), compilada como `metamask-rabby-phantom-vault-decryptor-v1.2.0-win64.exe` con build `v2.1.9 (BE39EDB64A)`. Las funciones que declara son: resolucion de frases mnemonicas parciales, motor SIMD multihilo con hashing PBKDF2, parseo de keystores LevelDB de extensiones de navegador, auditoria de tokens ERC20/SPL y rotacion de endpoints RPC (Alchemy, Helius, QuickNode).

No hay informacion sobre datos de entrenamiento, tokens procesados, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia. Cualquier afirmacion de rendimiento en la model card (por ejemplo, `429 Hz` o `452 Hz` de polling, `99,3%` de consistencia) procede del propio autor y no es verificable ni contrastable con metodologia publicada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades que declara el autor son operativas sobre el sistema de archivos y la red: lectura de keystores locales, calculo de hashes PBKDF2, comprobacion de saldos mediante RPC y exportacion de informes.
- El binario se ejecuta con privilegios de administrador segun las instrucciones del propio README, lo que amplia su superficie de acceso al sistema.

## Casos de uso

- Ninguno recomendado en el contexto de IA open source: el artefacto no es un modelo y no puede desplegarse en pipelines de inferencia.
- Auditoria de seguridad defensiva: un analista podria inspeccionar el binario en un entorno aislado para caracterizar tecnicas de extraccion de keystores y disenar contramedidas.
- Formacion en concienciacion: usar el caso como ejemplo documentado de ingenieria social y de distribucion de software no verificado con contrasenas en el README.
- Analisis de malware: estudiar el patron de empaquetado (ZIP con contrasena, enlace a GitHub Releases, insignias falsas de descargas) como indicador de compromiso.
- Investigacion de fraude en criptoactivos: documentar tecnicas de fuerza bruta sobre mnemonicos para mejorar la deteccion en plataformas.
- No utilizar en produccion, en entornos con datos reales ni en maquinas con acceso a billeteras o secretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`429 Hz`, `452 Hz`, `< 62 MB` de RAM, `99,3%` de consistencia) son afirmaciones del autor sin metodologia, sin conjunto de prueba y sin verificacion independiente; no deben interpretarse como metricas de un modelo de IA.

## Requisitos de hardware

- Sistema operativo: Windows 10 (22H2) o Windows 11 (24H2), 64 bits.
- CPU: x64 con soporte SIMD (la model card menciona un motor SIMD multihilo).
- RAM: el autor declara menos de 62 MB en el modulo de resolucion de mnemonicos; no verificable.
- GPU: no aplica; no hay inferencia neuronal.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El unico mecanismo de ejecucion descrito es lanzar el `.exe` como administrador tras extraer el ZIP con la contrasena `2026`.
- Latencia y throughput: sin datos verificables.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo LLM tipico (referencia generica) | Herramienta de recuperacion de carteras legitima |
|---|---|---|---|
| Naturaleza | Binario Windows x64 | Pesos + tokenizador + config | Software firmado con soporte |
| Parametros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | 8K-128K+ | no aplica |
| Licencia | MIT declarada | Variable | Comercial/propietaria |
| Verificabilidad | Nula | Benchmarks publicos | Auditoria de seguridad |
| Riesgo | Alto | Bajo/medio | Bajo |

No se identifican modelos comparables en la informacion disponible, porque el artefacto no pertenece a la categoria de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en comparativas de LLM.
- El proposito declarado (descifrado de vaults de billeteras de terceros) es incompatible con un uso etico y legal en la mayoria de jurisdicciones; podria constituir acceso no autorizado a sistemas.
- Distribucion mediante ZIP con contrasena y enlace a un repositorio de GitHub de terceros: patron habitual en campanas de malware.
- Insignias de descargas y valoraciones en el README no verificables y probablemente falsas (el repositorio registra 0 descargas y 0 likes en Hugging Face).
- Solicita ejecucion como administrador, lo que agrava cualquier impacto sobre el sistema anfitrion.
- Licencia MIT declarada pero sin garantia sobre el binario; el codigo fuente no se publica.
- Riesgo de robo de fondos, exposicion de secretos y compromiso del equipo si se ejecuta.
- No hay sesgos medibles por tratarse de software, pero si un riesgo claro de dano economico y legal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Madi2004/metamask-rabby-phantom-vault-decryptor
- Repositorio de GitHub referenciado en la model card (no verificado, tratar con precaucion): https://github.com/betty67060/metamask-rabby-phantom-vault-decryptor
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/betty67060/metamask-rabby-phantom-vault-decryptor/releases/latest/download/metamask-rabby-phantom-vault-decryptor-v1.2.0-win64.zip
